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
