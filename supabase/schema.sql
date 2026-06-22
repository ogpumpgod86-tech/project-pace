-- ════════════════════════════════════════════════════════════════════════
-- Project Pace — Supabase schema (MVP)
-- Covers: auth (profiles linked to Supabase Auth), posts, events, leaderboards
-- (via memberships stats), and chat. Run this in the Supabase SQL editor.
--
-- Design note: `profiles` has its own UUID primary key and a *nullable*
-- `auth_id` link to auth.users. This keeps seeding simple (no auth users
-- required to seed sample data) while still supporting real sign-in.
-- ════════════════════════════════════════════════════════════════════════

-- ── Communities ─────────────────────────────────────────────────────────
create table if not exists communities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  handle      text unique not null,
  type        text not null default 'running',
  tagline     text,
  city        text,
  cover_url   text,
  avatar_url  text,
  accent      text default '#6d5efc',
  created_at  timestamptz default now()
);

-- ── Profiles (one per person; auth_id links to a Supabase Auth user) ──────
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  auth_id     uuid unique references auth.users (id) on delete set null,
  name        text not null,
  handle      text unique not null,
  avatar_url  text,
  bio         text,
  created_at  timestamptz default now()
);

-- ── Memberships (person ↔ community + the stats leaderboards use) ─────────
create table if not exists memberships (
  id              uuid primary key default gen_random_uuid(),
  community_id    uuid references communities (id) on delete cascade,
  profile_id      uuid references profiles (id) on delete cascade,
  role            text not null default 'member',  -- owner | admin | member
  total_miles     numeric default 0,
  weekly_miles    numeric default 0,
  runs            int default 0,
  events_attended int default 0,
  streak          int default 0,
  joined_at       timestamptz default now(),
  unique (community_id, profile_id)
);

-- ── Posts + comments (community feed) ────────────────────────────────────
create table if not exists posts (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid references communities (id) on delete cascade,
  author_id     uuid references profiles (id) on delete cascade,
  kind          text default 'update',  -- update | pr | race | workout | question
  text          text not null,
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

-- ── Events + RSVPs (calendar) ────────────────────────────────────────────
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
  difficulty    text default 'Easy',  -- Easy | Moderate | Hard
  capacity      int default 50,
  created_at    timestamptz default now()
);

create table if not exists rsvps (
  event_id    uuid references events (id) on delete cascade,
  profile_id  uuid references profiles (id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (event_id, profile_id)
);

-- ── Chat (channels + messages) ───────────────────────────────────────────
create table if not exists channels (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid references communities (id) on delete cascade,
  name          text not null,
  kind          text default 'community',  -- community | event | dm
  description   text,
  sort          int default 0,
  created_at    timestamptz default now()
);

create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  channel_id  uuid references channels (id) on delete cascade,
  author_id   uuid references profiles (id) on delete cascade,
  text        text not null,
  created_at  timestamptz default now()
);

-- ── Auto-create a profile when a new auth user signs up ──────────────────
-- Uses the name/handle passed in auth metadata, with sensible fallbacks.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (auth_id, name, handle, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'handle', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://i.pravatar.cc/200?u=' || new.id::text)
  )
  on conflict (auth_id) do nothing;

  -- Auto-join the first (demo) community so new users see content immediately.
  insert into public.memberships (community_id, profile_id, role)
  select c.id, p.id, 'member'
  from public.communities c
  join public.profiles p on p.auth_id = new.id
  where c.handle = 'tamparun'
  on conflict (community_id, profile_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Realtime: stream new chat messages to clients ────────────────────────
alter publication supabase_realtime add table messages;

-- ── Row Level Security (simple MVP policies) ─────────────────────────────
-- Everyone can read; only signed-in users can write. Good enough for a demo.
do $$
declare t text;
begin
  foreach t in array array[
    'communities','profiles','memberships','posts','comments',
    'events','rsvps','channels','messages'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "public read %1$s" on %1$I;', t);
    execute format('create policy "public read %1$s" on %1$I for select using (true);', t);
    execute format('drop policy if exists "auth write %1$s" on %1$I;', t);
    execute format('create policy "auth write %1$s" on %1$I for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;
