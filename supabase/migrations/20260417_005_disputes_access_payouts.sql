-- ============================================================
-- Phase 7: Disputes, Gate Access, Payouts
-- ============================================================

-- ─── 1. DISPUTE / REPORTS TABLE ─────────────────────────────

create type report_issue_type as enum (
  'spot_occupied',
  'wrong_location',
  'wrong_instructions',
  'damage',
  'no_show',
  'renter_overstay',
  'trash_left',
  'other'
);

create type report_status as enum (
  'open',
  'under_review',
  'resolved_refund',
  'resolved_warning',
  'resolved_dismissed',
  'closed'
);

create table reports (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid not null references bookings(id) on delete cascade,
  reporter_id   uuid not null references profiles(id) on delete cascade,
  reported_id   uuid references profiles(id),  -- the other party (nullable for system issues)
  issue_type    report_issue_type not null,
  description   text,
  evidence_urls text[] default '{}',           -- photos uploaded by reporter
  status        report_status not null default 'open',
  admin_notes   text,
  resolved_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_reports_booking on reports (booking_id);
create index idx_reports_reporter on reports (reporter_id);
create index idx_reports_status on reports (status) where status = 'open';

create trigger trg_reports_updated_at
  before update on reports
  for each row execute function update_updated_at();

-- RLS: users see reports they filed or are named in
alter table reports enable row level security;

create policy "reports_select_own"
  on reports for select
  to authenticated
  using (reporter_id = auth.uid() or reported_id = auth.uid());

create policy "reports_insert"
  on reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

-- ─── Auto-refund on "spot_occupied" report ──────────────────

create or replace function handle_spot_occupied_report()
returns trigger as $$
declare
  v_booking record;
  v_parking record;
begin
  if new.issue_type = 'spot_occupied' then
    -- Get booking details
    select * into v_booking from bookings where id = new.booking_id;
    select * into v_parking from parkings where id = v_booking.parking_id;

    -- Cancel the booking
    update bookings
    set status = 'cancelled',
        actual_end_timestamp = now(),
        final_price = 0
    where id = new.booking_id
      and status in ('pending', 'active');

    -- Notify the owner urgently
    insert into notifications (user_id, type, title, body, data)
    values (
      v_parking.owner_id,
      'system',
      'דיווח: החניה תפוסה!',
      format(
        'נהג דיווח שהחניה ב-%s חסומה. ההזמנה בוטלה והחיוב הוחזר.',
        v_parking.address
      ),
      jsonb_build_object(
        'report_id', new.id,
        'booking_id', new.booking_id,
        'issue_type', 'spot_occupied'
      )
    );

    -- Notify renter that refund is processed
    insert into notifications (user_id, type, title, body, data)
    values (
      new.reporter_id,
      'system',
      'הדיווח התקבל — ההחזר בוצע',
      'ההזמנה בוטלה והחיוב הוחזר באופן אוטומטי. מצטערים על אי הנוחות!',
      jsonb_build_object(
        'report_id', new.id,
        'booking_id', new.booking_id
      )
    );

    -- Mark report as auto-resolved
    new.status := 'resolved_refund';
    new.admin_notes := 'Auto-resolved: spot_occupied → refund + cancel';
    new.resolved_at := now();
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_auto_handle_spot_occupied
  before insert on reports
  for each row
  execute function handle_spot_occupied_report();


-- ─── 2. GATE / ACCESS INSTRUCTIONS ─────────────────────────

alter table parkings
  add column entry_instructions  text,         -- "code 1234, then left"
  add column gate_type           text,         -- 'open', 'code', 'remote', 'palgate'
  add column gate_api_data       jsonb;        -- integration data (encrypted at app level)

-- RLS: entry_instructions visible ONLY to owner + active renter
-- Drop old select policy and replace with a smarter one
drop policy if exists "parkings_select_active" on parkings;

create policy "parkings_select_public_fields"
  on parkings for select
  to authenticated
  using (is_active = true);

-- Separate function to check if user can see access instructions
create or replace function can_see_entry_instructions(
  p_parking_id uuid,
  p_user_id uuid
)
returns boolean
language sql stable security definer
as $$
  select exists (
    -- Is owner
    select 1 from parkings
    where id = p_parking_id and owner_id = p_user_id
  ) or exists (
    -- Has active booking right now
    select 1 from bookings
    where parking_id = p_parking_id
      and renter_id = p_user_id
      and status = 'active'
      and start_timestamp <= now()
      and end_timestamp >= now()
  );
$$;


-- ─── 3. PAYOUT / WALLET SYSTEM ─────────────────────────────

-- Add balance to profiles
alter table profiles
  add column balance          numeric(10,2) not null default 0,
  add column total_earned     numeric(10,2) not null default 0,
  add column total_withdrawn  numeric(10,2) not null default 0;

-- Platform fee config
create table platform_config (
  key    text primary key,
  value  jsonb not null
);

insert into platform_config (key, value) values
  ('platform_fee_pct', '10'::jsonb),        -- 10% platform fee
  ('min_withdrawal', '50'::jsonb),           -- minimum 50 NIS
  ('payout_method', '"bank_transfer"'::jsonb);

-- Transactions ledger
create type transaction_type as enum (
  'booking_earning',
  'platform_fee',
  'overtime_earning',
  'refund',
  'withdrawal',
  'adjustment'
);

create table transactions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  booking_id      uuid references bookings(id),
  type            transaction_type not null,
  amount          numeric(10,2) not null,    -- positive = credit, negative = debit
  balance_after   numeric(10,2) not null,
  description     text,
  created_at      timestamptz not null default now()
);

create index idx_transactions_user on transactions (user_id);
create index idx_transactions_booking on transactions (booking_id);
create index idx_transactions_created on transactions (created_at desc);

alter table transactions enable row level security;

create policy "transactions_select_own"
  on transactions for select
  to authenticated
  using (user_id = auth.uid());

-- ─── Auto-credit owner when booking completes ──────────────

create or replace function credit_owner_on_complete()
returns trigger as $$
declare
  v_parking     record;
  v_fee_pct     numeric;
  v_final       numeric;
  v_fee         numeric;
  v_net         numeric;
  v_new_balance numeric;
begin
  -- Only trigger on status change to 'completed'
  if old.status != 'completed' and new.status = 'completed' then
    -- Get parking owner
    select owner_id, address into v_parking
    from parkings where id = new.parking_id;

    -- Get platform fee percentage
    select (value)::numeric into v_fee_pct
    from platform_config where key = 'platform_fee_pct';

    v_final := coalesce(new.final_price, new.total_price);
    v_fee   := round(v_final * v_fee_pct / 100, 2);
    v_net   := v_final - v_fee;

    -- Update owner balance
    update profiles
    set balance = balance + v_net,
        total_earned = total_earned + v_net
    where id = v_parking.owner_id
    returning balance into v_new_balance;

    -- Log earning transaction
    insert into transactions (user_id, booking_id, type, amount, balance_after, description)
    values (
      v_parking.owner_id,
      new.id,
      'booking_earning',
      v_net,
      v_new_balance,
      format('הכנסה מחניה ב%s (%.0f%% עמלה)', v_parking.address, v_fee_pct)
    );

    -- Log platform fee separately
    insert into transactions (user_id, booking_id, type, amount, balance_after, description)
    values (
      v_parking.owner_id,
      new.id,
      'platform_fee',
      -v_fee,
      v_new_balance,  -- balance doesn't change again, fee is just for accounting
      format('עמלת פלטפורמה %.0f%%', v_fee_pct)
    );

    -- If there's overtime, log it separately for clarity
    if new.overtime_charge > 0 then
      insert into transactions (user_id, booking_id, type, amount, balance_after, description)
      values (
        v_parking.owner_id,
        new.id,
        'overtime_earning',
        0,  -- already included in net
        v_new_balance,
        format('כולל %s ש"ח overtime (%s דקות)', new.overtime_charge, new.overtime_minutes)
      );
    end if;

    -- Payout notification
    insert into notifications (user_id, type, title, body, data)
    values (
      v_parking.owner_id,
      'payout',
      format('קיבלת %s ש"ח!', v_net),
      format(
        'הכנסה מחניה ב%s. סה"כ ביתרה: %s ש"ח',
        v_parking.address,
        v_new_balance
      ),
      jsonb_build_object(
        'booking_id', new.id,
        'gross', v_final,
        'fee', v_fee,
        'net', v_net,
        'balance', v_new_balance
      )
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_credit_owner_on_complete
  after update on bookings
  for each row
  execute function credit_owner_on_complete();

-- ─── Withdrawal requests ────────────────────────────────────

create type withdrawal_status as enum ('pending', 'processing', 'completed', 'failed');

create table withdrawals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  amount          numeric(10,2) not null check (amount > 0),
  status          withdrawal_status not null default 'pending',
  bank_details    jsonb,    -- { bank_code, branch, account_number }
  processed_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index idx_withdrawals_user on withdrawals (user_id);

alter table withdrawals enable row level security;

create policy "withdrawals_select_own"
  on withdrawals for select
  to authenticated
  using (user_id = auth.uid());

create policy "withdrawals_insert_own"
  on withdrawals for insert
  to authenticated
  with check (user_id = auth.uid());

-- ─── Withdrawal function (atomic) ──────────────────────────

create or replace function request_withdrawal(
  p_user_id uuid,
  p_amount numeric,
  p_bank_details jsonb
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_min_withdrawal numeric;
  v_current_balance numeric;
  v_new_balance numeric;
  v_withdrawal_id uuid;
begin
  -- Get minimum withdrawal amount
  select (value)::numeric into v_min_withdrawal
  from platform_config where key = 'min_withdrawal';

  if p_amount < v_min_withdrawal then
    return jsonb_build_object('success', false, 'error',
      format('סכום מינימלי למשיכה: %s ש"ח', v_min_withdrawal));
  end if;

  -- Lock the row and check balance
  select balance into v_current_balance
  from profiles where id = p_user_id
  for update;

  if v_current_balance < p_amount then
    return jsonb_build_object('success', false, 'error', 'אין מספיק יתרה');
  end if;

  -- Deduct balance
  v_new_balance := v_current_balance - p_amount;
  update profiles
  set balance = v_new_balance,
      total_withdrawn = total_withdrawn + p_amount
  where id = p_user_id;

  -- Create withdrawal record
  insert into withdrawals (user_id, amount, bank_details)
  values (p_user_id, p_amount, p_bank_details)
  returning id into v_withdrawal_id;

  -- Log transaction
  insert into transactions (user_id, type, amount, balance_after, description)
  values (
    p_user_id,
    'withdrawal',
    -p_amount,
    v_new_balance,
    format('משיכה — %s ש"ח', p_amount)
  );

  return jsonb_build_object(
    'success', true,
    'withdrawal_id', v_withdrawal_id,
    'new_balance', v_new_balance
  );
end;
$$;
