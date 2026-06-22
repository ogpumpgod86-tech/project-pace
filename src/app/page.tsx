import Link from "next/link";
import TopBar from "@/components/TopBar";
import {
  announcements,
  challenges,
  events,
  leaderboard,
  leaderboardMeta,
  memberById,
  posts,
  youId,
} from "@/lib/mockData";
import { monthDay, timeAgo, to12h, weekday } from "@/lib/format";
import { SectionHeader, Progress, DifficultyPill } from "@/components/ui";

export default function DashboardPage() {
  const you = memberById(youId);
  const nextEvents = [...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const board = leaderboard("weeklyMiles").slice(0, 3);
  const challenge = challenges[0];
  const recentPosts = posts.slice(0, 2);

  return (
    <div className="animate-fade-up">
      <TopBar title="Dashboard" />

      <main className="space-y-6 px-4 py-5">
        {/* Greeting + weekly stats hero */}
        <section>
          <p className="text-sm text-slate-400">Good morning,</p>
          <h1 className="text-2xl font-bold text-white">{you.name.split(" ")[0]} 👋</h1>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <StatCard label="This week" value={`${you.stats.weeklyMiles}`} unit="mi" accent="brand" />
            <StatCard label="Streak" value={`${you.stats.streak}`} unit="wks" accent="flame" />
            <StatCard label="Events" value={`${you.stats.eventsAttended}`} unit="attended" accent="accent" />
          </div>
        </section>

        {/* Active challenge */}
        <section>
          <SectionHeader title="Current Challenge" href="/challenges" />
          <Link href="/challenges" className="card mt-2 block overflow-hidden p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{challenge.title}</p>
                <p className="text-xs text-slate-400">{challenge.endsIn} · {challenge.participants} joined</p>
              </div>
              <span className="pill bg-brand/15 text-brand-400">{challenge.reward.split("·")[0]}</span>
            </div>
            <div className="mt-3">
              <Progress value={challenge.progress} goal={challenge.goal} />
              <p className="mt-1.5 text-xs text-slate-400">
                {challenge.progress}/{challenge.goal} {challenge.metric}
              </p>
            </div>
          </Link>
        </section>

        {/* Upcoming events */}
        <section>
          <SectionHeader title="Upcoming Events" href="/events" />
          <div className="mt-2 space-y-2.5">
            {nextEvents.map((e) => (
              <Link key={e.id} href="/events" className="card flex items-center gap-3 p-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand/15 text-center">
                  <span className="text-[10px] font-semibold uppercase text-brand-400">{weekday(e.date)}</span>
                  <span className="-mt-0.5 text-base font-bold leading-none text-white">{new Date(e.date + "T00:00:00").getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{e.title}</p>
                  <p className="truncate text-xs text-slate-400">{to12h(e.time)} · {e.location}</p>
                </div>
                <DifficultyPill level={e.difficulty} />
              </Link>
            ))}
          </div>
        </section>

        {/* Leaderboard snapshot */}
        <section>
          <SectionHeader title="Weekly Leaderboard" href="/leaderboard" />
          <div className="card mt-2 divide-y divide-white/5">
            {board.map((row, i) => {
              const m = memberById(row.memberId);
              return (
                <div key={row.memberId} className="flex items-center gap-3 p-3">
                  <span className={`w-5 text-center text-sm font-bold ${i === 0 ? "text-gold" : "text-slate-500"}`}>{i + 1}</span>
                  <img src={m.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10" />
                  <p className="flex-1 truncate text-sm font-medium text-white">{m.name}</p>
                  <p className="text-sm font-semibold text-brand-400">{row.value} {leaderboardMeta.weeklyMiles.unit}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Announcements */}
        <section>
          <SectionHeader title="Announcements" />
          <div className="mt-2 space-y-2.5">
            {announcements.map((a) => {
              const author = memberById(a.authorId);
              return (
                <div key={a.id} className="card p-4">
                  <div className="flex items-center gap-2">
                    <span className="pill bg-accent/15 text-accent">📣 Announcement</span>
                    <span className="text-xs text-slate-500">{timeAgo(a.createdAt)}</span>
                  </div>
                  <p className="mt-2 font-semibold text-white">{a.title}</p>
                  <p className="mt-0.5 text-sm text-slate-400">{a.body}</p>
                  <p className="mt-2 text-xs text-slate-500">— {author.name}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* New posts */}
        <section>
          <SectionHeader title="From the Community" href="/feed" />
          <div className="mt-2 space-y-2.5">
            {recentPosts.map((p) => {
              const author = memberById(p.authorId);
              return (
                <Link key={p.id} href="/feed" className="card flex gap-3 p-3">
                  <img src={author.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10" />
                  <div className="min-w-0">
                    <p className="text-sm"><span className="font-semibold text-white">{author.name}</span> <span className="text-slate-500">· {timeAgo(p.createdAt)}</span></p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-slate-300">{p.text}</p>
                    <p className="mt-1 text-xs text-slate-500">❤️ {p.likes} · 💬 {p.comments.length}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, unit, accent }: { label: string; value: string; unit: string; accent: "brand" | "flame" | "accent" }) {
  const ring = accent === "brand" ? "from-brand/20" : accent === "flame" ? "from-flame/20" : "from-accent/20";
  const text = accent === "brand" ? "text-brand-400" : accent === "flame" ? "text-flame" : "text-accent";
  return (
    <div className={`card bg-gradient-to-b ${ring} to-transparent p-3`}>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold leading-none text-white">{value}</p>
      <p className={`text-[11px] font-medium ${text}`}>{unit}</p>
    </div>
  );
}

