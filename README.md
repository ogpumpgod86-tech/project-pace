# Project Pace 🏃

A modern, mobile-first community fitness platform — think Strava + Instagram + Discord + Facebook Groups, in one clean dark-mode app. Built for running clubs first, but designed to support walking, cycling, hiking, CrossFit, and triathlon communities.

> **Demo-ready:** the app ships with rich, realistic mock data and runs instantly with **no backend required**. Supabase wiring + schema/seed are included for when you want to go live.

## Features (MVP)

- **Home dashboard** — weekly stats, upcoming events, leaderboard snapshot, current challenge, announcements, latest posts.
- **Community feed** — Instagram-style posts (updates, PRs, race results, workouts, questions) with photos, likes, comments, and a working composer.
- **Events & calendar** — week + month views, RSVP, attendee lists, difficulty/distance tags, event chat link.
- **Real-time-feel chat** — main community channel, event channels, and DMs with a live composer.
- **Leaderboards** — Weekly/Monthly Miles, Attendance, Consistency — with a podium and your live rank.
- **Challenges** — join, track progress, earn points/badges/rewards.
- **Gamification** — badge system shown on profiles.
- **Profile** — stats, badges, activity, quick links.
- **Owner dashboard** — KPIs, weekly-active trend, attendance chart, member & event management, monetization teaser.
- **Multi-community** — switch between communities; each has its own feed, events, chat, leaderboard, members.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (custom dark design system)
- **Supabase** (Postgres + Auth + Realtime) — optional for the demo

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

The login screen has a **"Continue with demo account"** button — no credentials needed.

## Connecting Supabase (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Copy `.env.local.example` to `.env.local` and fill in your project URL + anon key.
4. Restart `npm run dev`. `src/lib/supabaseClient.ts` exposes a ready client.

## Deploy

Push to GitHub and import into [Vercel](https://vercel.com) — zero config. It works without env vars (mock data). Add the Supabase vars in Vercel when you're ready for live data.

## Project structure

```
src/
  app/            # pages: dashboard, feed, events, chat, leaderboard,
                  #        challenges, profile, owner, communities, login
  components/     # BottomNav, TopBar
  lib/            # types, mock data, formatters, supabase client
supabase/         # schema.sql + seed.sql
```

## Designed for the future (not built yet)

Architecture leaves room for premium communities, paid memberships, merch, event tickets, and sponsor partnerships — see the monetization teaser in the owner dashboard.
