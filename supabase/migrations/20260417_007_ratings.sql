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
