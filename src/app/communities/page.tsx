"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TopBar from "@/components/TopBar";
import { communities } from "@/lib/mockData";
import { isJoined, joinedCommunities, toggleJoin } from "@/lib/db";
import type { ActivityType, Community } from "@/lib/types";

const typeLabel: Record<ActivityType, string> = {
  running: "Running",
  walking: "Walking",
  cycling: "Cycling",
  hiking: "Hiking",
  crossfit: "CrossFit",
  triathlon: "Triathlon",
  boxing: "Boxing",
};

const allTypes: ActivityType[] = [
  "running",
  "cycling",
  "boxing",
  "crossfit",
  "hiking",
  "walking",
  "triathlon",
];

export default function CommunitiesPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ActivityType | "all">("all");
  const [nearby, setNearby] = useState(false);
  const [joined, setJoined] = useState<string[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setJoined(joinedCommunities());
  }, [tick]);

  const onToggleJoin = (id: string) => {
    toggleJoin(id);
    setTick((t) => t + 1);
  };

  const yours = communities.filter((c) => joined.includes(c.id));

  const discover = useMemo(() => {
    let list = communities.filter((c) => !joined.includes(c.id));
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((c) => `${c.name} ${c.handle} ${c.city}`.toLowerCase().includes(q));
    if (type !== "all") list = list.filter((c) => c.type === type);
    list = [...list].sort((a, b) =>
      nearby ? (a.distanceMi ?? 999) - (b.distanceMi ?? 999) : b.memberCount - a.memberCount
    );
    return list;
  }, [query, type, nearby, joined]);

  return (
    <div className="animate-fade-up">
      <TopBar title="Communities" />

      <main className="space-y-5 px-4 py-4">
        {/* Your communities */}
        <section>
          <h2 className="section-title">Your Communities ({yours.length})</h2>
          <div className="mt-2 space-y-3">
            {yours.length === 0 && <p className="text-sm text-slate-500">You haven&apos;t joined any groups yet.</p>}
            {yours.map((c) => (
              <CommunityCard key={c.id} c={c} joined onToggle={() => onToggleJoin(c.id)} />
            ))}
          </div>
        </section>

        {/* Discover */}
        <section>
          <h2 className="section-title">Discover Groups</h2>

          {/* Search */}
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M21 21l-4-4" /></svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search groups by name or city…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-slate-500">✕</button>
            )}
          </div>

          {/* Type filters + nearby */}
          <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
            <Chip active={type === "all" && !nearby} onClick={() => { setType("all"); setNearby(false); }}>All</Chip>
            <Chip active={nearby} onClick={() => setNearby((n) => !n)}>📍 Nearby</Chip>
            {allTypes.map((t) => (
              <Chip key={t} active={type === t} onClick={() => setType(type === t ? "all" : t)}>
                {typeLabel[t]}
              </Chip>
            ))}
          </div>

          <div className="mt-3 space-y-3">
            {discover.length === 0 && <p className="text-sm text-slate-500">No groups match your search.</p>}
            {discover.map((c) => (
              <CommunityCard key={c.id} c={c} joined={false} showDistance={nearby} onToggle={() => onToggleJoin(c.id)} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${active ? "bg-brand text-white" : "bg-white/5 text-slate-300"}`}
    >
      {children}
    </button>
  );
}

function CommunityCard({
  c,
  joined,
  showDistance,
  onToggle,
}: {
  c: Community;
  joined: boolean;
  showDistance?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="relative h-24">
        <img src={c.cover} alt="" className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-850 to-transparent" />
        <span className="absolute right-3 top-3 pill bg-black/50 text-slate-200">{typeLabel[c.type]}</span>
        {c.distanceMi != null && (
          <span className="absolute left-3 top-3 pill bg-black/50 text-slate-200">📍 {c.distanceMi} mi</span>
        )}
      </div>
      <div className="flex items-center gap-3 p-3">
        <img src={c.avatar} alt="" className="-mt-8 h-14 w-14 rounded-2xl object-cover ring-4 ring-ink-850" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{c.name}</p>
          <p className="truncate text-xs text-slate-400">{c.city} · {c.memberCount} members</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{c.tagline}</p>
        </div>
        <button onClick={onToggle} className={joined ? "btn-ghost text-xs text-accent" : "btn-primary text-xs"}>
          {joined ? "✓ Joined" : "Join"}
        </button>
      </div>
    </div>
  );
}
