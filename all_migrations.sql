-- ============================================================
-- Parking Sharing App — Full Schema Migration
-- Supabase (PostgreSQL) + PostGIS
-- ============================================================

-- 1. Enable PostGIS extension for geospatial queries
create extension if not exists postgis;

-- 2. Custom enum for booking status
create type booking_status as enum ('pending', 'active', 'completed', 'cancelled');

-- ============================================================
-- TABLES
-- ============================================================

-- profiles: extends auth.users
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  phone_number text,
  is_owner    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- parkings: the parking spots
create table parkings (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references profiles(id) on delete cascade,
  address         text not null,
  city            text not null,
  coordinates     geography(point, 4326) not null,
  description     text,
  images          text[] default '{}',
  price_per_hour  numeric(10,2) not null check (price_per_hour >= 0),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- availability_slots: when the parking is free
create table availability_slots (
  id            uuid primary key default gen_random_uuid(),
  parking_id    uuid not null references parkings(id) on delete cascade,
  day_of_week   int not null check (day_of_week between 0 and 6),
  start_time    time not null,
  end_time      time not null,
  is_recurring  boolean not null default true,
  created_at    timestamptz not null default now(),

  constraint valid_time_range check (start_time < end_time)
);

-- bookings: transactions
create table bookings (
  id               uuid primary key default gen_random_uuid(),
  parking_id       uuid not null references parkings(id) on delete cascade,
  renter_id        uuid not null references profiles(id) on delete cascade,
  start_timestamp  timestamptz not null,
  end_timestamp    timestamptz not null,
  total_price      numeric(10,2) not null check (total_price >= 0),
  status           booking_status not null default 'pending',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint valid_booking_range check (start_timestamp < end_timestamp)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Geospatial index for proximity searches
create index idx_parkings_coordinates on parkings using gist (coordinates);

-- Common query indexes
create index idx_parkings_owner_id on parkings (owner_id);
create index idx_parkings_city on parkings (city);
create index idx_parkings_is_active on parkings (is_active) where is_active = true;

create index idx_availability_parking_id on availability_slots (parking_id);
create index idx_availability_day on availability_slots (day_of_week);

create index idx_bookings_parking_id on bookings (parking_id);
create index idx_bookings_renter_id on bookings (renter_id);
create index idx_bookings_status on bookings (status);
create index idx_bookings_time_range on bookings (start_timestamp, end_timestamp);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_parkings_updated_at
  before update on parkings
  for each row execute function update_updated_at();

create trigger trg_bookings_updated_at
  before update on bookings
  for each row execute function update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, phone_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone_number', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- SEARCH FUNCTION — find parkings within radius
-- ============================================================

create or replace function search_parkings(
  user_lat float,
  user_lng float,
  radius_meters int default 1000
)
returns table (
  id              uuid,
  owner_id        uuid,
  address         text,
  city            text,
  description     text,
  images          text[],
  price_per_hour  numeric,
  distance_meters float
)
language sql stable
as $$
  select
    p.id,
    p.owner_id,
    p.address,
    p.city,
    p.description,
    p.images,
    p.price_per_hour,
    st_distance(
      p.coordinates,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters
  from parkings p
  where p.is_active = true
    and st_dwithin(
      p.coordinates,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  order by distance_meters asc;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table parkings enable row level security;
alter table availability_slots enable row level security;
alter table bookings enable row level security;

-- profiles: users can read all profiles, update only their own
create policy "profiles_select"
  on profiles for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (id = auth.uid());

-- parkings: anyone can read active parkings, owner can CRUD
create policy "parkings_select_active"
  on parkings for select
  to authenticated
  using (is_active = true);

create policy "parkings_insert_owner"
  on parkings for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "parkings_update_owner"
  on parkings for update
  to authenticated
  using (owner_id = auth.uid());

create policy "parkings_delete_owner"
  on parkings for delete
  to authenticated
  using (owner_id = auth.uid());

-- availability_slots: anyone can read, only parking owner can modify
create policy "slots_select"
  on availability_slots for select
  to authenticated
  using (true);

create policy "slots_insert_owner"
  on availability_slots for insert
  to authenticated
  with check (
    exists (
      select 1 from parkings
      where parkings.id = parking_id
        and parkings.owner_id = auth.uid()
    )
  );

create policy "slots_update_owner"
  on availability_slots for update
  to authenticated
  using (
    exists (
      select 1 from parkings
      where parkings.id = parking_id
        and parkings.owner_id = auth.uid()
    )
  );

create policy "slots_delete_owner"
  on availability_slots for delete
  to authenticated
  using (
    exists (
      select 1 from parkings
      where parkings.id = parking_id
        and parkings.owner_id = auth.uid()
    )
  );

-- bookings: renters see their own, parking owners see bookings for their parkings
create policy "bookings_select_renter"
  on bookings for select
  to authenticated
  using (renter_id = auth.uid());

create policy "bookings_select_owner"
  on bookings for select
  to authenticated
  using (
    exists (
      select 1 from parkings
      where parkings.id = parking_id
        and parkings.owner_id = auth.uid()
    )
  );

create policy "bookings_insert_renter"
  on bookings for insert
  to authenticated
  with check (renter_id = auth.uid());

create policy "bookings_update_renter"
  on bookings for update
  to authenticated
  using (renter_id = auth.uid());
-- ============================================================
-- Booking Conflict Guard
-- Prevents double-booking at the database level
-- Even if two requests pass the application-level check
-- simultaneously, only one INSERT will succeed.
-- ============================================================

-- Exclusion constraint using btree_gist extension
create extension if not exists btree_gist;

-- Add a tstzrange column for efficient overlap detection
alter table bookings
  add column time_range tstzrange
  generated always as (tstzrange(start_timestamp, end_timestamp, '[)')) stored;

-- Exclusion constraint: no two active bookings for the same parking can overlap
alter table bookings
  add constraint no_overlapping_bookings
  exclude using gist (
    parking_id with =,
    time_range with &&
  )
  where (status in ('pending', 'active'));

-- Index on the range for fast overlap queries
create index idx_bookings_time_range_gist
  on bookings using gist (parking_id, time_range)
  where status in ('pending', 'active');
-- ============================================================
-- Notifications System
-- In-app notifications + webhook trigger for external alerts
-- ============================================================

-- Notification types
create type notification_type as enum (
  'booking_new',
  'booking_cancelled',
  'booking_completed',
  'payout',
  'system'
);

-- ─── Notifications table ────────────────────────────────────
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        notification_type not null,
  title       text not null,
  body        text not null,
  data        jsonb default '{}',   -- booking_id, parking_id, amount, etc.
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_notifications_user_id on notifications (user_id);
create index idx_notifications_unread on notifications (user_id, is_read)
  where is_read = false;
create index idx_notifications_created on notifications (created_at desc);

-- RLS
alter table notifications enable row level security;

create policy "notifications_select_own"
  on notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on notifications for update
  to authenticated
  using (user_id = auth.uid());

-- ─── Auto-create notification on new booking ────────────────
create or replace function notify_owner_on_booking()
returns trigger as $$
declare
  v_parking   record;
  v_start_he  text;
  v_end_he    text;
begin
  -- Get parking details
  select id, owner_id, address into v_parking
  from parkings
  where id = new.parking_id;

  -- Format times in Hebrew locale
  v_start_he := to_char(new.start_timestamp at time zone 'Asia/Jerusalem', 'DD/MM HH24:MI');
  v_end_he   := to_char(new.end_timestamp at time zone 'Asia/Jerusalem', 'DD/MM HH24:MI');

  -- Insert in-app notification
  insert into notifications (user_id, type, title, body, data)
  values (
    v_parking.owner_id,
    'booking_new',
    'הזמנה חדשה!',
    format(
      'החניה ב-%s הוזמנה מ-%s עד %s. רווח: %s ש"ח',
      v_parking.address,
      v_start_he,
      v_end_he,
      new.total_price
    ),
    jsonb_build_object(
      'booking_id', new.id,
      'parking_id', new.parking_id,
      'amount', new.total_price,
      'start', new.start_timestamp,
      'end', new.end_timestamp
    )
  );

  -- Notify via pg_notify for Supabase Realtime
  perform pg_notify(
    'new_notification',
    json_build_object(
      'user_id', v_parking.owner_id,
      'type', 'booking_new',
      'booking_id', new.id
    )::text
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_owner_on_booking
  after insert on bookings
  for each row
  execute function notify_owner_on_booking();

-- ─── Notify on booking cancellation ─────────────────────────
create or replace function notify_owner_on_cancel()
returns trigger as $$
declare
  v_parking record;
begin
  if old.status != 'cancelled' and new.status = 'cancelled' then
    select owner_id, address into v_parking
    from parkings where id = new.parking_id;

    insert into notifications (user_id, type, title, body, data)
    values (
      v_parking.owner_id,
      'booking_cancelled',
      'הזמנה בוטלה',
      format('הזמנה לחניה ב-%s בוטלה.', v_parking.address),
      jsonb_build_object('booking_id', new.id, 'parking_id', new.parking_id)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_owner_on_cancel
  after update on bookings
  for each row
  execute function notify_owner_on_cancel();

-- ─── Helper: mark all as read ───────────────────────────────
create or replace function mark_notifications_read(p_user_id uuid)
returns void
language sql security definer
as $$
  update notifications
  set is_read = true
  where user_id = p_user_id and is_read = false;
$$;

-- ─── Helper: unread count ───────────────────────────────────
create or replace function get_unread_count(p_user_id uuid)
returns int
language sql stable security definer
as $$
  select count(*)::int
  from notifications
  where user_id = p_user_id and is_read = false;
$$;
-- ============================================================
-- Checkout & Overtime System
-- Track actual end time, calculate overtime charges
-- ============================================================

-- Add actual checkout fields to bookings
alter table bookings
  add column actual_end_timestamp  timestamptz,
  add column overtime_minutes      int not null default 0,
  add column overtime_charge       numeric(10,2) not null default 0,
  add column final_price           numeric(10,2);

-- Update final_price for existing completed bookings
update bookings
set final_price = total_price
where status = 'completed' and final_price is null;

-- ─── Notify owner on overtime (>5 min past end) ─────────────
create or replace function notify_owner_on_overtime()
returns trigger as $$
declare
  v_parking record;
  v_renter  record;
begin
  -- Only fire when overtime_minutes just got set (was 0, now > 5)
  if old.overtime_minutes = 0 and new.overtime_minutes > 5 then
    select owner_id, address into v_parking
    from parkings where id = new.parking_id;

    select full_name, phone_number into v_renter
    from profiles where id = new.renter_id;

    insert into notifications (user_id, type, title, body, data)
    values (
      v_parking.owner_id,
      'system',
      'חריגה בזמן!',
      format(
        '%s חורג ב-%s דקות מהזמן בחניה ב%s. חיוב overtime פעיל.',
        v_renter.full_name,
        new.overtime_minutes,
        v_parking.address
      ),
      jsonb_build_object(
        'booking_id', new.id,
        'parking_id', new.parking_id,
        'renter_phone', v_renter.phone_number,
        'overtime_minutes', new.overtime_minutes
      )
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_overtime
  after update on bookings
  for each row
  execute function notify_owner_on_overtime();

-- ─── Index for active session queries ───────────────────────
create index idx_bookings_active_session
  on bookings (parking_id, renter_id)
  where status = 'active' and actual_end_timestamp is null;
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
-- ============================================================
-- Phase 8: Gate Control System
-- Support for phone_dial, api_integration, and manual gates
-- ============================================================

-- Update gate_type to proper enum (replace text column from migration 005)
-- First drop the text column if it exists and recreate as enum

create type gate_type_enum as enum ('manual', 'phone_dial', 'api_integration');

-- Add gate-specific fields to parkings
-- (gate_type text already exists from migration 005, replace with enum)
alter table parkings
  drop column if exists gate_type,
  add column gate_type          gate_type_enum not null default 'manual',
  add column gate_phone_number  text,           -- phone number for phone_dial gates
  add column gate_api_provider  text,           -- 'palgate', 'cellgate', etc.
  add column gate_api_key       text;           -- encrypted API key for provider

-- Constraint: phone_dial requires a phone number
alter table parkings
  add constraint chk_gate_phone
  check (gate_type != 'phone_dial' or gate_phone_number is not null);

-- ─── Secure gate access function ────────────────────────────
-- Only returns gate details if user has active booking within 10-min window

create or replace function get_gate_access(
  p_parking_id uuid,
  p_user_id uuid
)
returns jsonb
language plpgsql stable security definer
as $$
declare
  v_parking  record;
  v_booking  record;
  v_now      timestamptz := now();
begin
  -- Get parking
  select gate_type, gate_phone_number, entry_instructions,
         gate_api_provider, gate_api_key, owner_id
  into v_parking
  from parkings
  where id = p_parking_id;

  if not found then
    return jsonb_build_object('access', false, 'reason', 'parking_not_found');
  end if;

  -- Owner always has access
  if v_parking.owner_id = p_user_id then
    return jsonb_build_object(
      'access', true,
      'role', 'owner',
      'gate_type', v_parking.gate_type,
      'gate_phone_number', v_parking.gate_phone_number,
      'entry_instructions', v_parking.entry_instructions,
      'gate_api_provider', v_parking.gate_api_provider
    );
  end if;

  -- Check for active booking with 10-min early window
  select id, start_timestamp, end_timestamp
  into v_booking
  from bookings
  where parking_id = p_parking_id
    and renter_id = p_user_id
    and status = 'active'
    and (start_timestamp - interval '10 minutes') <= v_now  -- 10 min before start
    and end_timestamp >= v_now                                -- not past end
  limit 1;

  if not found then
    -- Check if there's a future booking (not yet in window)
    select id, start_timestamp
    into v_booking
    from bookings
    where parking_id = p_parking_id
      and renter_id = p_user_id
      and status in ('active', 'pending')
      and start_timestamp > v_now
    limit 1;

    if found then
      return jsonb_build_object(
        'access', false,
        'reason', 'too_early',
        'starts_at', v_booking.start_timestamp
      );
    end if;

    return jsonb_build_object('access', false, 'reason', 'no_active_booking');
  end if;

  -- Access granted
  return jsonb_build_object(
    'access', true,
    'role', 'renter',
    'gate_type', v_parking.gate_type,
    'gate_phone_number', v_parking.gate_phone_number,
    'entry_instructions', v_parking.entry_instructions,
    'gate_api_provider', v_parking.gate_api_provider,
    'booking_id', v_booking.id,
    'booking_ends', v_booking.end_timestamp
  );
end;
$$;

-- ─── Gate access log (audit trail) ──────────────────────────
create table gate_access_log (
  id          uuid primary key default gen_random_uuid(),
  parking_id  uuid not null references parkings(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  booking_id  uuid references bookings(id),
  method      text not null,   -- 'phone_dial', 'api_call', 'manual'
  success     boolean not null default true,
  created_at  timestamptz not null default now()
);

create index idx_gate_log_parking on gate_access_log (parking_id, created_at desc);

alter table gate_access_log enable row level security;

-- Owner sees all access logs for their parking, renter sees their own
create policy "gate_log_select_owner"
  on gate_access_log for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from parkings
      where parkings.id = parking_id
        and parkings.owner_id = auth.uid()
    )
  );
-- ============================================================
-- Phase 9: Ratings System
-- Renter rates parking, Owner rates renter (after booking completes)
-- ============================================================

create table ratings (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid not null references bookings(id) on delete cascade,
  rater_id      uuid not null references profiles(id) on delete cascade,
  rated_id      uuid not null references profiles(id) on delete cascade,
  parking_id    uuid not null references parkings(id) on delete cascade,
  score         int not null check (score between 1 and 5),
  comment       text,
  rater_role    text not null check (rater_role in ('renter', 'owner')),
  created_at    timestamptz not null default now(),

  -- One rating per booking per direction
  constraint unique_rating_per_booking unique (booking_id, rater_role)
);

create index idx_ratings_parking on ratings (parking_id);
create index idx_ratings_rated on ratings (rated_id);
create index idx_ratings_rater on ratings (rater_id);

alter table ratings enable row level security;

create policy "ratings_select_all"
  on ratings for select
  to authenticated
  using (true);

create policy "ratings_insert_own"
  on ratings for insert
  to authenticated
  with check (rater_id = auth.uid());

-- ─── Aggregated ratings on parkings ─────────────────────────

alter table parkings
  add column avg_rating     numeric(2,1) default 0,
  add column rating_count   int default 0;

alter table profiles
  add column avg_rating     numeric(2,1) default 0,
  add column rating_count   int default 0;

-- ─── Auto-update averages on new rating ─────────────────────

create or replace function update_rating_averages()
returns trigger as $$
begin
  -- Update parking average (only renter ratings count for parking)
  if new.rater_role = 'renter' then
    update parkings
    set avg_rating = (
      select round(avg(score)::numeric, 1)
      from ratings where parking_id = new.parking_id and rater_role = 'renter'
    ),
    rating_count = (
      select count(*)
      from ratings where parking_id = new.parking_id and rater_role = 'renter'
    )
    where id = new.parking_id;
  end if;

  -- Update rated user average
  update profiles
  set avg_rating = (
    select round(avg(score)::numeric, 1)
    from ratings where rated_id = new.rated_id
  ),
  rating_count = (
    select count(*)
    from ratings where rated_id = new.rated_id
  )
  where id = new.rated_id;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_update_rating_averages
  after insert on ratings
  for each row
  execute function update_rating_averages();
-- ============================================================
-- Phase 10: Driver Verification System
-- ID card, driver license, car registration verification
-- ============================================================

CREATE TABLE drivers_verification (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name             TEXT NOT NULL,
  license_plate         TEXT NOT NULL,
  id_card_url           TEXT,
  driver_license_url    TEXT,
  car_registration_url  TEXT,

  verification_status   TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected')),

  rejection_reason      TEXT,
  verified_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_user_verification UNIQUE (user_id)
);

CREATE INDEX idx_verification_user ON drivers_verification (user_id);
CREATE INDEX idx_verification_status ON drivers_verification (verification_status)
  WHERE verification_status = 'pending';

CREATE TRIGGER trg_verification_updated_at
  BEFORE UPDATE ON drivers_verification
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE drivers_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verification_select_own"
  ON drivers_verification FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "verification_insert_own"
  ON drivers_verification FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "verification_update_own"
  ON drivers_verification FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Add verification status to profiles
ALTER TABLE profiles
  ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN license_plate TEXT;

-- Auto-update profile when verification is approved
CREATE OR REPLACE FUNCTION handle_verification_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF old.verification_status != 'approved' AND new.verification_status = 'approved' THEN
    UPDATE profiles
    SET is_verified = true,
        license_plate = new.license_plate
    WHERE id = new.user_id;

    new.verified_at := now();

    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      new.user_id,
      'system',
      'האימות אושר! ✅',
      'החשבון שלך אומת בהצלחה. עכשיו אתה יכול להזמין חניות.',
      jsonb_build_object('verification_id', new.id)
    );
  END IF;

  IF old.verification_status != 'rejected' AND new.verification_status = 'rejected' THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      new.user_id,
      'system',
      'האימות נדחה',
      format('סיבה: %s. אנא העלה מסמכים מחדש.', new.rejection_reason),
      jsonb_build_object('verification_id', new.id, 'reason', new.rejection_reason)
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_verification_status_change
  BEFORE UPDATE ON drivers_verification
  FOR EACH ROW
  EXECUTE FUNCTION handle_verification_approved();
-- ============================================================
-- Phase 11: Emergency Evacuation System
-- Owner "I'm coming home" → Driver gets real-time alert
-- ============================================================

-- Add availability window to parkings
ALTER TABLE parkings
  ADD COLUMN IF NOT EXISTS available_from TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS available_until TIMESTAMPTZ;

-- Add evacuation fields to bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS is_emergency_evacuation BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS evacuation_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS evacuation_confirmed_at TIMESTAMPTZ;

-- Index for active evacuations
CREATE INDEX idx_bookings_evacuation
  ON bookings (parking_id)
  WHERE is_emergency_evacuation = true AND evacuation_confirmed_at IS NULL;

-- ─── Notify driver on evacuation ────────────────────────────
CREATE OR REPLACE FUNCTION notify_driver_evacuation()
RETURNS TRIGGER AS $$
DECLARE
  v_parking RECORD;
BEGIN
  IF old.is_emergency_evacuation = false AND new.is_emergency_evacuation = true THEN
    SELECT address INTO v_parking FROM parkings WHERE id = new.parking_id;

    -- In-app notification
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      new.renter_id,
      'system',
      '⚠️ בעל החניה חוזר!',
      format('יש לפנות את החניה ב-%s תוך 5 דקות.', v_parking.address),
      jsonb_build_object(
        'booking_id', new.id,
        'parking_id', new.parking_id,
        'evacuation_requested_at', new.evacuation_requested_at,
        'urgency', 'high'
      )
    );

    -- Realtime broadcast
    PERFORM pg_notify(
      'evacuation_alert',
      json_build_object(
        'booking_id', new.id,
        'renter_id', new.renter_id,
        'parking_id', new.parking_id
      )::text
    );
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_evacuation_alert
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_driver_evacuation();

-- ─── Auto-complete booking on evacuation confirm ────────────
CREATE OR REPLACE FUNCTION handle_evacuation_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF old.evacuation_confirmed_at IS NULL AND new.evacuation_confirmed_at IS NOT NULL THEN
    -- Calculate partial price (actual time used)
    new.actual_end_timestamp := new.evacuation_confirmed_at;
    new.status := 'completed';

    -- Recalculate price based on actual duration
    DECLARE
      v_parking RECORD;
      v_actual_hours NUMERIC;
      v_new_price NUMERIC;
    BEGIN
      SELECT price_per_hour INTO v_parking FROM parkings WHERE id = new.parking_id;
      v_actual_hours := EXTRACT(EPOCH FROM (new.evacuation_confirmed_at - new.start_timestamp)) / 3600;
      v_new_price := ROUND(v_parking.price_per_hour * v_actual_hours, 2);
      new.final_price := GREATEST(v_new_price, new.total_price * 0.5); -- minimum 50% charge
    END;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_evacuation_confirmed
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_evacuation_confirmed();
