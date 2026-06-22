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

## Two modes (auto-detected)

The app reads its mode from the environment:

- **Mock mode** (no env vars) — everything runs on in-memory sample data. Zero config, perfect for a demo.
- **Live mode** (Supabase env vars set) — **auth, posts, events, leaderboards, and chat** are powered by Supabase, including **realtime chat**.

The switch is automatic via [`src/lib/supabaseClient.ts`](src/lib/supabaseClient.ts); all data access goes through [`src/lib/db.ts`](src/lib/db.ts), and auth through [`src/lib/auth.tsx`](src/lib/auth.tsx).

## Connecting Supabase (enable live mode)

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL editor**, run [`supabase/schema.sql`](supabase/schema.sql), then [`supabase/seed.sql`](supabase/seed.sql).
   - The schema enables Realtime on `messages`, adds simple RLS (public read, authenticated write), and auto-creates a profile on sign-up.
3. **Auth settings:** for a frictionless demo, go to **Authentication → Providers → Email** and turn **"Confirm email" off** so new sign-ups log in immediately.
4. Copy `.env.example` to `.env.local` and fill in your project URL + anon key (same keys go in Vercel).
5. Restart `npm run dev`. Sign up / sign in with a real account, or use **Continue with demo account**.

### What's wired to Supabase

| Domain | Reads | Writes / realtime |
|---|---|---|
| **Auth** | session + profile | sign up, sign in, sign out |
| **Feed** | posts + comments | create post, like |
| **Events** | events + RSVPs | RSVP / un-RSVP |
| **Leaderboards** | membership stats | — |
| **Chat** | channels + messages | send message + **realtime** inserts |

> Dashboard, profile, and owner analytics currently render from sample data (aggregate views) — fine for the MVP demo.

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
