-- Project Pace — seed data.
-- Run AFTER schema.sql. Profiles/memberships normally reference auth.users,
-- so for a quick seed without creating auth users we only seed the reference
-- tables that don't require an auth user (badges + a sample community + events).
-- For full seeding, create users via Supabase Auth first, then insert profiles
-- using their ids.

insert into badges (id, name, description, icon, tier) values
  ('b_first',       'First Run',        'Logged your very first run',  '🎉', 'bronze'),
  ('b_10runs',      '10 Runs',          'Completed 10 runs',           '🔟', 'bronze'),
  ('b_50mi',        '50 Miles',         'Ran 50 total miles',          '🥾', 'silver'),
  ('b_100mi',       '100 Miles',        'Ran 100 total miles',         '💯', 'gold'),
  ('b_consistency', 'Consistency King', '4+ week activity streak',     '👑', 'gold'),
  ('b_top',         'Top Performer',    'Reached top 3 of a board',    '🏆', 'gold'),
  ('b_leader',      'Community Leader',  'Hosted 10+ events',          '🚩', 'gold')
on conflict (id) do nothing;

insert into communities (name, handle, type, tagline, city, accent)
values
  ('Tampa Running Club',     'tamparun',    'running',  'Miles of smiles since 2019', 'Tampa, FL',     '#6d5efc'),
  ('Downtown Running Group', 'downtownrun', 'running',  'City streets. Sunrise pace.', 'Tampa, FL',     '#22e0a1'),
  ('CrossFit Warriors',      'cfwarriors',  'crossfit', 'Stronger together, every WOD', 'St. Pete, FL',  '#ff7a45'),
  ('Cycling Crew',           'cyclingcrew', 'cycling',  'Two wheels, one squad',       'Clearwater, FL', '#ffc24b')
on conflict (handle) do nothing;

-- Example events for the first community.
insert into events (community_id, title, description, date, time, location, distance, difficulty, capacity)
select c.id, v.title, v.description, v.date::date, v.time, v.location, v.distance, v.difficulty, v.capacity
from communities c,
  (values
    ('5K Community Run', 'Easy-paced social 5K along Bayshore.', current_date + 1, '06:30', 'Bayshore Blvd Trailhead', '5 km', 'Easy', 40),
    ('Speed Training',   'Track intervals: 6 x 800m at 5K effort.', current_date + 3, '18:00', 'Hillsborough HS Track', 'Intervals', 'Hard', 25),
    ('Long Distance Run','Saturday long run. 12 miles, two water stops.', current_date + 5, '07:00', 'Davis Islands Loop', '12 mi', 'Moderate', 60)
  ) as v(title, description, date, time, location, distance, difficulty, capacity)
where c.handle = 'tamparun';
