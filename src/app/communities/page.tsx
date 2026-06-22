import Link from "next/link";
import TopBar from "@/components/TopBar";
import { activeCommunityId, communities } from "@/lib/mockData";

const typeLabel: Record<string, string> = {
  running: "Running Club",
  walking: "Walking Group",
  cycling: "Cycling Club",
  hiking: "Hiking Group",
  crossfit: "CrossFit Community",
  triathlon: "Triathlon Team",
};

export default function CommunitiesPage() {
  return (
    <div className="animate-fade-up">
      <TopBar title="Communities" />

      <main className="space-y-4 px-4 py-4">
        <div>
          <h1 className="text-xl font-bold text-white">Your Communities</h1>
          <p className="text-sm text-slate-400">Switch between the groups you belong to.</p>
        </div>

        {communities.map((c) => {
          const active = c.id === activeCommunityId;
          return (
            <Link key={c.id} href="/" className="card block overflow-hidden">
              <div className="relative h-24">
                <img src={c.cover} alt="" className="h-full w-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-850 to-transparent" />
                {active && (
                  <span className="absolute right-3 top-3 pill bg-accent/90 text-ink-950">✓ Active</span>
                )}
              </div>
              <div className="flex items-center gap-3 p-3">
                <img src={c.avatar} alt="" className="-mt-8 h-14 w-14 rounded-2xl object-cover ring-4 ring-ink-850" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{c.name}</p>
                  <p className="truncate text-xs text-slate-400">{typeLabel[c.type]} · {c.city}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{c.memberCount} members · {c.tagline}</p>
                </div>
              </div>
            </Link>
          );
        })}

        <button className="btn-ghost w-full">＋ Create or join a community</button>
      </main>
    </div>
  );
}
