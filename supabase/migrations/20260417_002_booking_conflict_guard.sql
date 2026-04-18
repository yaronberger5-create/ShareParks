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
