import Link from "next/link";
import TopBar from "@/components/TopBar";
import {
  badgeById,
  badges as allBadges,
  communities,
  activeCommunityId,
  memberById,
  posts,
  youId,
} from "@/lib/mockData";
import { timeAgo } from "@/lib/format";

export default function ProfilePage() {
  const you = memberById(youId);
  const community = communities.find((c) => c.id === activeCommunityId)!;
  const myPosts = posts.filter((p) => p.authorId === youId);
  const earned = new Set(you.badges);

  return (
    <div className="animate-fade-up">
      <TopBar title="Profile" />

      <main className="pb-4">
        {/* Cover + avatar */}
        <div className="relative">
          <img src={community.cover} alt="" className="h-32 w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
          <div className="absolute -bottom-10 left-4 flex items-end gap-3">
            <img src={you.avatar} alt="" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-ink-950" />
          </div>
        </div>

        <div className="mt-12 px-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{you.name}</h1>
              <p className="text-sm text-slate-400">@{you.handle} · {community.name}</p>
            </div>
            <button className="btn-ghost text-xs">Edit</button>
          </div>
          <p className="mt-2 text-sm text-slate-300">{you.bio}</p>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            <Stat value={you.stats.totalMiles} label="Miles" />
            <Stat value={you.stats.runs} label="Runs" />
            <Stat value={you.stats.eventsAttended} label="Events" />
            <Stat value={you.stats.streak} label="Streak" />
          </div>

          {/* Badges */}
          <section className="mt-6">
            <h2 className="section-title">Badges ({earned.size}/{allBadges.length})</h2>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {allBadges.map((b) => {
                const has = earned.has(b.id);
                return (
                  <div key={b.id} className={`flex flex-col items-center text-center ${has ? "" : "opacity-30"}`}>
                    <div className={`grid h-14 w-14 place-items-center rounded-2xl text-2xl ${
                      has ? "bg-gradient-to-br from-brand/30 to-accent/20 ring-1 ring-white/10" : "bg-white/5"
                    }`}>
                      {has ? b.icon : "🔒"}
                    </div>
                    <p className="mt-1 text-[10px] font-medium leading-tight text-slate-300">{b.name}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick links */}
          <section className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/leaderboard" className="card p-4 text-center">
              <p className="text-2xl">🏆</p>
              <p className="mt-1 text-sm font-semibold text-white">Leaderboards</p>
            </Link>
            <Link href="/challenges" className="card p-4 text-center">
              <p className="text-2xl">🎯</p>
              <p className="mt-1 text-sm font-semibold text-white">Challenges</p>
            </Link>
            <Link href="/owner" className="card p-4 text-center">
              <p className="text-2xl">📊</p>
              <p className="mt-1 text-sm font-semibold text-white">Owner Dashboard</p>
            </Link>
            <Link href="/login" className="card p-4 text-center">
              <p className="text-2xl">🚪</p>
              <p className="mt-1 text-sm font-semibold text-white">Sign out</p>
            </Link>
          </section>

          {/* My posts */}
          <section className="mt-6">
            <h2 className="section-title">My Activity</h2>
            <div className="mt-3 space-y-2.5">
              {myPosts.length === 0 && <p className="text-sm text-slate-500">No posts yet.</p>}
              {myPosts.map((p) => (
                <div key={p.id} className="card p-3">
                  <p className="text-sm text-slate-200">{p.text}</p>
                  <p className="mt-1 text-xs text-slate-500">{timeAgo(p.createdAt)} · ❤️ {p.likes}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="card p-2.5 text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
