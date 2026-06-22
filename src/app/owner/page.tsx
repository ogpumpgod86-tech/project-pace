import Link from "next/link";
import TopBar from "@/components/TopBar";
import AttendanceDrilldown from "@/components/AttendanceDrilldown";
import {
  events,
  members,
  ownerAnalytics as a,
} from "@/lib/mockData";
import { monthDay, to12h } from "@/lib/format";

export default function OwnerDashboardPage() {
  const maxWeekly = Math.max(...a.weeklyActive);

  return (
    <div className="animate-fade-up">
      <TopBar title="Owner Dashboard" />

      <main className="space-y-6 px-4 py-4">
        <div>
          <h1 className="text-xl font-bold text-white">Community Analytics</h1>
          <p className="text-sm text-slate-400">Tampa Running Club · last 30 days</p>
        </div>

        {/* KPI grid */}
        <section className="grid grid-cols-2 gap-3">
          <Kpi label="Total members" value={a.totalMembers} delta={`+${a.newThisMonth} this month`} accent="brand" />
          <Kpi label="Active members" value={a.activeMembers} delta={`${Math.round((a.activeMembers / a.totalMembers) * 100)}% of total`} accent="accent" />
          <Kpi label="Avg attendance" value={a.avgEventAttendance} delta="per event" accent="gold" />
          <Kpi label="Engagement" value={`${Math.round(a.engagementRate * 100)}%`} delta="weekly active" accent="flame" />
        </section>

        {/* Weekly active trend */}
        <section className="card p-4">
          <h2 className="section-title">Weekly Active Members</h2>
          <div className="mt-4 flex items-end justify-between gap-2">
            {a.weeklyActive.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[9px] font-semibold text-slate-300">{v}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand to-brand-400"
                  style={{ height: `${Math.round((v / maxWeekly) * 110)}px` }}
                />
                <span className="text-[9px] text-slate-500">W{i + 1}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Attendance by event (clickable drill-down) */}
        <AttendanceDrilldown />

        {/* Member management */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="section-title">Member Management</h2>
            <button className="text-xs font-medium text-brand-400">+ Invite</button>
          </div>
          <div className="card mt-2 divide-y divide-white/5">
            {members.slice(0, 6).map((m) => (
              <Link key={m.id} href={`/u/${m.id}`} className="flex items-center gap-3 p-3">
                <img src={m.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.stats.totalMiles} mi · {m.stats.eventsAttended} events</p>
                </div>
                <span className={`pill ${
                  m.role === "owner" ? "bg-gold/15 text-gold" : m.role === "admin" ? "bg-brand/15 text-brand-400" : "bg-white/5 text-slate-400"
                }`}>{m.role}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Event management */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="section-title">Event Management</h2>
            <button className="text-xs font-medium text-brand-400">+ New event</button>
          </div>
          <div className="card mt-2 divide-y divide-white/5">
            {events.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{e.title}</p>
                  <p className="text-xs text-slate-500">{monthDay(e.date)} · {to12h(e.time)} · {e.attendees.length}/{e.capacity}</p>
                </div>
                <div className="flex gap-1.5 text-xs">
                  <button className="rounded-lg bg-white/5 px-2.5 py-1 text-slate-300">Edit</button>
                  <button className="rounded-lg bg-flame/10 px-2.5 py-1 text-flame">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Monetization teaser */}
        <section className="card overflow-hidden bg-gradient-to-br from-gold/15 to-ink-850 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gold">Coming soon</p>
          <p className="mt-1 font-semibold text-white">Premium community plan 💎</p>
          <p className="mt-0.5 text-sm text-slate-300">Subscriptions, paid memberships, event tickets and sponsor tools.</p>
          <button className="btn-ghost mt-3 text-gold">Join the waitlist</button>
        </section>
      </main>
    </div>
  );
}

function Kpi({ label, value, delta, accent }: { label: string; value: number | string; delta: string; accent: "brand" | "accent" | "gold" | "flame" }) {
  const text = {
    brand: "text-brand-400",
    accent: "text-accent",
    gold: "text-gold",
    flame: "text-flame",
  }[accent];
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      <p className={`mt-0.5 text-xs font-medium ${text}`}>{delta}</p>
    </div>
  );
}
