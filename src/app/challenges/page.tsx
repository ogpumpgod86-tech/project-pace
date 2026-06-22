"use client";

import { useState } from "react";
import TopBar from "@/components/TopBar";
import { challenges as seedChallenges } from "@/lib/mockData";
import type { Challenge } from "@/lib/types";

export default function ChallengesPage() {
  const [joined, setJoined] = useState<Record<string, boolean>>({ ch1: true, ch3: true });

  const toggle = (id: string) => setJoined((j) => ({ ...j, [id]: !j[id] }));

  return (
    <div className="animate-fade-up">
      <TopBar title="Challenges" />

      <main className="space-y-4 px-4 py-4">
        <div className="card overflow-hidden bg-gradient-to-br from-brand/25 via-ink-850 to-ink-850 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-400">Earn points · badges · rewards</p>
          <h1 className="mt-1 text-xl font-bold text-white">Push yourself this week 🔥</h1>
          <p className="mt-1 text-sm text-slate-300">Join a challenge, hit the goal, climb the ranks.</p>
        </div>

        {seedChallenges.map((c) => (
          <ChallengeCard key={c.id} c={c} joined={!!joined[c.id]} onToggle={() => toggle(c.id)} />
        ))}
      </main>
    </div>
  );
}

function ChallengeCard({ c, joined, onToggle }: { c: Challenge; joined: boolean; onToggle: () => void }) {
  const pct = Math.min(100, Math.round((c.progress / c.goal) * 100));
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{c.title}</p>
          <p className="mt-0.5 text-sm text-slate-400">{c.description}</p>
        </div>
        <span className="pill shrink-0 bg-flame/15 text-flame">{c.endsIn}</span>
      </div>

      <div className="mt-3">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <span className="text-slate-400">{c.progress}/{c.goal} {c.metric}</span>
          <span className="font-semibold text-brand-400">{pct}%</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          🎁 {c.reward}
          <p className="mt-0.5 text-slate-500">{c.participants} participants</p>
        </div>
        <button onClick={onToggle} className={joined ? "btn-ghost text-accent" : "btn-primary"}>
          {joined ? "✓ Joined" : "Join"}
        </button>
      </div>
    </div>
  );
}
