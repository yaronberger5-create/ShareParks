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
