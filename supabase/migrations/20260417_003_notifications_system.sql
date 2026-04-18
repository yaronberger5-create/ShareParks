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
