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
