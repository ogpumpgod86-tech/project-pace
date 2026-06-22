-- ════════════════════════════════════════════════════════════════════════
-- Project Pace — sample data for the demo. Run AFTER schema.sql.
-- Uses fixed UUIDs so the live app mirrors the built-in mock demo.
-- Safe to re-run (idempotent via ON CONFLICT).
-- ════════════════════════════════════════════════════════════════════════

-- ── Communities ─────────────────────────────────────────────────────────
insert into communities (id, name, handle, type, tagline, city, cover_url, avatar_url, accent) values
  ('11111111-1111-1111-1111-111111111101','Tampa Running Club','tamparun','running','Miles of smiles since 2019','Tampa, FL','https://images.unsplash.com/photo-1502904550040-7534597429ae?w=900&q=70','https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=200&q=70','#6d5efc'),
  ('11111111-1111-1111-1111-111111111102','Downtown Running Group','downtownrun','running','City streets. Sunrise pace.','Tampa, FL','https://images.unsplash.com/photo-1483721310020-03333e577078?w=900&q=70','https://images.unsplash.com/photo-1486218119243-13883505764c?w=200&q=70','#22e0a1'),
  ('11111111-1111-1111-1111-111111111103','CrossFit Warriors','cfwarriors','crossfit','Stronger together, every WOD','St. Pete, FL','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=70','https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=200&q=70','#ff7a45'),
  ('11111111-1111-1111-1111-111111111104','Cycling Crew','cyclingcrew','cycling','Two wheels, one squad','Clearwater, FL','https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900&q=70','https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&q=70','#ffc24b')
on conflict (id) do nothing;

-- ── Profiles (seeded members; real sign-ups get their own via trigger) ────
insert into profiles (id, name, handle, avatar_url, bio) values
  ('22222222-2222-2222-2222-222222222201','Jordan Blake','jblake','https://i.pravatar.cc/200?img=33','Founder of Tampa Running Club. Coffee then cardio.'),
  ('22222222-2222-2222-2222-222222222202','Sam Carter','samc','https://i.pravatar.cc/200?img=5','Trail lover. Will run for tacos.'),
  ('22222222-2222-2222-2222-222222222203','Priya Nair','priyaruns','https://i.pravatar.cc/200?img=45','Half-marathon PR 1:42. Negative splits or nothing.'),
  ('22222222-2222-2222-2222-222222222204','Diego Santos','diegos','https://i.pravatar.cc/200?img=15','Slow is smooth, smooth is fast.'),
  ('22222222-2222-2222-2222-222222222205','Mia Thompson','miat','https://i.pravatar.cc/200?img=20','New to running, loving the crew already 💜'),
  ('22222222-2222-2222-2222-222222222206','Omar Haddad','omarh','https://i.pravatar.cc/200?img=52','Sprinter trapped in a distance runner''s body.'),
  ('22222222-2222-2222-2222-222222222207','Lena Petrova','lenap','https://i.pravatar.cc/200?img=31','Ultra in training. The longer the better.'),
  ('22222222-2222-2222-2222-222222222208','Alex Rivera','alexr','https://i.pravatar.cc/200?img=12','Marathon hopeful 🏃 | 5:00 AM club | chasing a sub-25 5K')
on conflict (id) do nothing;

-- ── Memberships + stats (drive the leaderboards) ─────────────────────────
insert into memberships (community_id, profile_id, role, total_miles, weekly_miles, runs, events_attended, streak) values
  ('11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222201','owner', 1820, 31.2, 402, 121, 28),
  ('11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222202','admin', 1340, 28.7, 310, 98, 19),
  ('11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222203','member', 905, 34.1, 220, 64, 14),
  ('11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222204','member', 288, 18.9, 76, 22, 6),
  ('11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222205','member', 64, 12.3, 21, 9, 4),
  ('11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222206','member', 712, 26.0, 198, 71, 9),
  ('11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222207','member', 1490, 41.8, 355, 88, 22),
  ('11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222208','member', 642, 23.4, 148, 37, 11)
on conflict (community_id, profile_id) do nothing;

-- ── Posts ────────────────────────────────────────────────────────────────
insert into posts (id, community_id, author_id, kind, text, image_url, stat, likes, created_at) values
  ('33333333-3333-3333-3333-333333333301','11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222203','pr','New 5K PR this morning — 23:51! Those Tuesday speed sessions are paying off 🔥','https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=70','[{"label":"Distance","value":"5.0 km"},{"label":"Pace","value":"4:46 /km"},{"label":"Time","value":"23:51"}]'::jsonb, 47, now() - interval '2 hours'),
  ('33333333-3333-3333-3333-333333333302','11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222205','update','Ran 5 miles before work today. Two months ago I couldn''t do one. This community is everything 💜', null, null, 62, now() - interval '5 hours'),
  ('33333333-3333-3333-3333-333333333303','11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222204','question','Anyone running downtown tonight? Looking for an easy 6 around 7pm 🌆', null, null, 14, now() - interval '9 hours'),
  ('33333333-3333-3333-3333-333333333304','11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222207','race','Finished my first 50K ultra at Croom this weekend 🏔️ Brutal, beautiful, and worth every step.','https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=70','[{"label":"Distance","value":"50 km"},{"label":"Elevation","value":"1,240 ft"},{"label":"Time","value":"5:58:12"}]'::jsonb, 134, now() - interval '26 hours'),
  ('33333333-3333-3333-3333-333333333305','11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222206','workout','Track night summary: 8 x 400m. Lungs on fire but splits were dialed.', null, '[{"label":"Reps","value":"8 x 400m"},{"label":"Avg","value":"1:28"}]'::jsonb, 29, now() - interval '40 hours')
on conflict (id) do nothing;

insert into comments (post_id, author_id, text, created_at) values
  ('33333333-3333-3333-3333-333333333301','22222222-2222-2222-2222-222222222201','Let''s gooo 🚀', now() - interval '1 hour'),
  ('33333333-3333-3333-3333-333333333301','22222222-2222-2222-2222-222222222208','Incredible pace!', now() - interval '1 hour'),
  ('33333333-3333-3333-3333-333333333302','22222222-2222-2222-2222-222222222202','So proud of you Mia!', now() - interval '4 hours'),
  ('33333333-3333-3333-3333-333333333303','22222222-2222-2222-2222-222222222206','I''m in. Meet at the pier?', now() - interval '8 hours'),
  ('33333333-3333-3333-3333-333333333304','22222222-2222-2222-2222-222222222203','Absolute legend 👏', now() - interval '25 hours')
on conflict do nothing;

-- ── Events ────────────────────────────────────────────────────────────────
insert into events (id, community_id, host_id, title, description, date, time, location, distance, difficulty, capacity) values
  ('44444444-4444-4444-4444-444444444401','11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222201','5K Community Run','Easy-paced social 5K along Bayshore. All paces welcome, no one left behind.', current_date + 1,'06:30','Bayshore Blvd Trailhead','5 km','Easy',40),
  ('44444444-4444-4444-4444-444444444402','11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222202','Speed Training','Track intervals: 6 x 800m at 5K effort. Bring water and your A-game.', current_date + 3,'18:00','Hillsborough HS Track','Intervals','Hard',25),
  ('44444444-4444-4444-4444-444444444403','11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222201','Long Distance Run','Saturday long run. 12 miles with two water stops. Coffee after at Buddy Brew.', current_date + 5,'07:00','Davis Islands Loop','12 mi','Moderate',60),
  ('44444444-4444-4444-4444-444444444404','11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222202','Sunrise Recovery Walk','Active recovery walk + mobility. Great for rest days.', current_date + 8,'06:45','Curtis Hixon Park','3 mi','Easy',30),
  ('44444444-4444-4444-4444-444444444405','11111111-1111-1111-1111-111111111101','22222222-2222-2222-2222-222222222206','Tempo Tuesday','Progressive tempo run. Start easy, finish at threshold.', current_date + 10,'18:30','Riverwalk Start','8 km','Moderate',35)
on conflict (id) do nothing;

insert into rsvps (event_id, profile_id) values
  ('44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222203'),
  ('44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222205'),
  ('44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222204'),
  ('44444444-4444-4444-4444-444444444401','22222222-2222-2222-2222-222222222206'),
  ('44444444-4444-4444-4444-444444444402','22222222-2222-2222-2222-222222222203'),
  ('44444444-4444-4444-4444-444444444402','22222222-2222-2222-2222-222222222206'),
  ('44444444-4444-4444-4444-444444444402','22222222-2222-2222-2222-222222222207'),
  ('44444444-4444-4444-4444-444444444403','22222222-2222-2222-2222-222222222207'),
  ('44444444-4444-4444-4444-444444444403','22222222-2222-2222-2222-222222222202'),
  ('44444444-4444-4444-4444-444444444403','22222222-2222-2222-2222-222222222203')
on conflict do nothing;

-- ── Chat channels + messages ──────────────────────────────────────────────
insert into channels (id, community_id, name, kind, description, sort) values
  ('55555555-5555-5555-5555-555555555501','11111111-1111-1111-1111-111111111101','# general','community','Tampa Running Club main chat',0),
  ('55555555-5555-5555-5555-555555555502','11111111-1111-1111-1111-111111111101','# 5k-community-run','event','Event chat for the 5K',1),
  ('55555555-5555-5555-5555-555555555503','11111111-1111-1111-1111-111111111101','# long-run-crew','event','Saturday long run logistics',2)
on conflict (id) do nothing;

insert into messages (channel_id, author_id, text, created_at) values
  ('55555555-5555-5555-5555-555555555501','22222222-2222-2222-2222-222222222201','Morning crew! Who''s running tonight? 🏃', now() - interval '6 hours'),
  ('55555555-5555-5555-5555-555555555501','22222222-2222-2222-2222-222222222206','I''m in. Meeting at 6:30 by the fountain.', now() - interval '5 hours'),
  ('55555555-5555-5555-5555-555555555501','22222222-2222-2222-2222-222222222205','Can a beginner tag along? 😅', now() - interval '5 hours'),
  ('55555555-5555-5555-5555-555555555501','22222222-2222-2222-2222-222222222202','Always! We''ve got a no-drop policy 💪', now() - interval '4 hours'),
  ('55555555-5555-5555-5555-555555555501','22222222-2222-2222-2222-222222222203','Count me in for the extra mile 🔥', now() - interval '2 hours'),
  ('55555555-5555-5555-5555-555555555502','22222222-2222-2222-2222-222222222201','Reminder: 5K kicks off 6:30 sharp tomorrow at Bayshore.', now() - interval '8 hours'),
  ('55555555-5555-5555-5555-555555555502','22222222-2222-2222-2222-222222222204','Parking by the trailhead or the lot down the street?', now() - interval '7 hours'),
  ('55555555-5555-5555-5555-555555555503','22222222-2222-2222-2222-222222222202','Two water stops planned for Saturday. Bring a handheld just in case.', now() - interval '20 hours')
on conflict do nothing;
