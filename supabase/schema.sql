-- Project Pace — Supabase schema (simple MVP).
-- Run this in the Supabase SQL editor for your project.
-- Auth is handled by Supabase Auth (auth.users); profiles extends it.

-- ── Communities ────────────────────────────────────────────────────────────
create table if not exists communities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  handle      text unique not null,
  type        text not null default 'running',  -- running|walking|cycling|hiking|crossfit|triathlon
  tagline     text,
  city        text,
  cover_url   text,
  avatar_url  text,
  accent      text default '#6d5efc',
  owner_id    uuid references auth.users (id),
  created_at  timestamptz default now()
);

-- ── Profiles (one row per auth user) ───────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text,
  handle      text unique,
  avatar_url  text,
  bio         text,
  created_at  timestamptz default now()
);

-- ── Membership (user ↔ community, with role) ───────────────────────────────
create table if not exists memberships (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid references communities (id) on delete cascade,
  user_id       uuid references profiles (id) on delete cascade,
  role          text not null default 'member', -- owner|admin|member
  total_miles   numeric default 0,
  weekly_miles  numeric default 0,
  runs          int default 0,
  events_attended int default 0,
  streak        int default 0,
  joined_at     timestamptz default now(),
  unique (community_id, user_id)
);

-- ── Posts (community feed) ─────────────────────────────────────────────────
create table if not exists posts (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid references communities (id) on delete cascade,
  author_id     uuid references profiles (id) on delete cascade,
  kind          text default 'update', -- update|pr|race|workout|question
  text          text,
  image_url     text,
  stat          jsonb,
  likes         int default 0,
  created_at    timestamptz default now()
);

create table if not exists comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid references posts (id) on delete cascade,
  author_id   uuid references profiles (id) on delete cascade,
  text        text not null,
  created_at  timestamptz default now()
);

-- ── Events & RSVPs ─────────────────────────────────────────────────────────
create table if not exists events (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid references communities (id) on delete cascade,
  host_id       uuid references profiles (id),
  title         text not null,
  description   text,
  date          date not null,
  time          text,
  location      text,
  distance      text,
  difficulty    text default 'Easy', -- Easy|Moderate|Hard
  capacity      int default 50,
  created_at    timestamptz default now()
);

create table if not exists rsvps (
  event_id    uuid references events (id) on delete cascade,
  user_id     uuid references profiles (id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (event_id, user_id)
);

-- ── Chat ───────────────────────────────────────────────────────────────────
create table if not exists channels (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid references communities (id) on delete cascade,
  name          text not null,
  kind          text default 'community', -- community|event|dm
  description   text,
  created_at    timestamptz default now()
);

create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  channel_id  uuid references channels (id) on delete cascade,
  author_id   uuid references profiles (id) on delete cascade,
  text        text not null,
  created_at  timestamptz default now()
);

-- ── Gamification ───────────────────────────────────────────────────────────
create table if not exists badges (
  id          text primary key,        -- e.g. 'b_first'
  name        text not null,
  description text,
  icon        text,
  tier        text default 'bronze'
);

create table if not exists member_badges (
  user_id     uuid references profiles (id) on delete cascade,
  badge_id    text references badges (id) on delete cascade,
  earned_at   timestamptz default now(),
  primary key (user_id, badge_id)
);

create table if not exists challenges (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid references communities (id) on delete cascade,
  title         text not null,
  description   text,
  metric        text,        -- miles|events|workouts
  goal          numeric,
  reward        text,
  ends_at       timestamptz,
  created_at    timestamptz default now()
);

create table if not exists challenge_progress (
  challenge_id  uuid references challenges (id) on delete cascade,
  user_id       uuid references profiles (id) on delete cascade,
  progress      numeric default 0,
  primary key (challenge_id, user_id)
);

-- ── Realtime for chat ──────────────────────────────────────────────────────
-- In the Supabase dashboard, enable Realtime on the `messages` table,
-- or run: alter publication supabase_realtime add table messages;

-- ── Row Level Security (kept simple for the MVP) ───────────────────────────
-- For the demo you can leave RLS disabled, or enable it and add permissive
-- policies. Example permissive read policy:
-- alter table posts enable row level security;
-- create policy "read posts" on posts for select using (true);
