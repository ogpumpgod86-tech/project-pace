"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import { activeCommunityId, challenges as seedChallenges } from "@/lib/mockData";
import {
  awardedPoints,
  challengeProgress,
  getMember,
  isChallengeJoined,
  listGroupRewards,
  logChallengeProgress,
  setChallengeJoined,
} from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { POINTS_INFO, basePoints, rankFor } from "@/lib/points";
import type { Challenge, GroupReward } from "@/lib/types";

const rewardPointsOf = (c: Challenge): number => {
  const m = c.reward.match(/(\d+)\s*pts/i);
  return m ? Number(m[1]) : 100;
};

export default function ChallengesPage() {
  const { profileId } = useAuth();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<GroupReward[]>([]);
  const [flash, setFlash] = useState<string | null>(null);

  const refreshPoints = async () => {
    if (!profileId) return;
    const m = await getMember(profileId);
    setPoints((m ? basePoints(m) : 0) + awardedPoints(profileId));
  };

  useEffect(() => {
    const p: Record<string, number> = {};
    const j: Record<string, boolean> = {};
    seedChallenges.forEach((c) => {
      p[c.id] = challengeProgress(c.id);
      j[c.id] = isChallengeJoined(c.id);
    });
    setProgress(p);
    setJoined(j);
    setRewards(listGroupRewards(activeCommunityId));
    refreshPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const toggleJoin = (id: string) => {
    const next = !joined[id];
    setChallengeJoined(id, next);
    setJoined((j) => ({ ...j, [id]: next }));
  };

  const logProgress = async (c: Challenge) => {
    if (!profileId) return;
    const res = logChallengeProgress(c.id, profileId, 1, c.goal, rewardPointsOf(c));
    setProgress((p) => ({ ...p, [c.id]: res.progress }));
    if (res.completed) {
      await refreshPoints();
      setFlash(`🎉 Challenge complete! +${rewardPointsOf(c)} points`);
      setTimeout(() => setFlash(null), 2600);
    }
  };

  const rank = rankFor(points);

  return (
    <div className="animate-fade-up">
      <TopBar title="Challenges" />

      <main className="space-y-4 px-4 py-4">
        {/* Points status */}
        <div className="card overflow-hidden bg-gradient-to-br from-brand/25 via-ink-850 to-ink-850 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-brand-400">Your points</p>
              <p className="mt-1 text-2xl font-bold text-white">{points.toLocaleString()} pts</p>
            </div>
            <div className="text-right">
              <p className="text-2xl">{rank.current.icon}</p>
              <p className="text-xs font-semibold text-white">{rank.current.name}</p>
            </div>
          </div>
          {rank.next && (
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${rank.progress}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-slate-300">{(rank.next.min - points).toLocaleString()} pts to {rank.next.icon} {rank.next.name}</p>
            </div>
          )}
        </div>

        {/* How points work */}
        <div className="card p-4">
          <h2 className="section-title">How points work</h2>
          <p className="mt-2 text-sm text-slate-300">{POINTS_INFO.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {POINTS_INFO.unlocks.map((u) => (
              <span key={u} className="pill bg-brand/15 text-brand-400">{u}</span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {POINTS_INFO.earn.map((e) => (
              <div key={e.label} className="rounded-xl bg-white/5 p-2.5 text-center">
                <p className="text-sm font-bold text-accent">{e.value}</p>
                <p className="text-[10px] text-slate-400">{e.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-500">{POINTS_INFO.disclaimer}</p>
        </div>

        {/* Group-defined rewards */}
        {rewards.length > 0 && (
          <div className="card p-4">
            <h2 className="section-title">Group Rewards</h2>
            <p className="mt-1 text-xs text-slate-400">Set by your group owner — unlocked at points milestones. Non-monetary.</p>
            <div className="mt-3 space-y-2">
              {rewards.map((r) => {
                const unlocked = points >= r.points;
                return (
                  <div key={r.id} className={`flex items-center gap-3 rounded-xl p-3 ${unlocked ? "bg-accent/10" : "bg-white/5"}`}>
                    <span className="text-xl">{unlocked ? "🎁" : "🔒"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{r.title}</p>
                      <p className="text-xs text-slate-500">{r.points.toLocaleString()} pts milestone</p>
                    </div>
                    <span className={`pill ${unlocked ? "bg-accent/15 text-accent" : "bg-white/5 text-slate-400"}`}>
                      {unlocked ? "Unlocked" : "Locked"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Challenge list */}
        {seedChallenges.map((c) => (
          <ChallengeCard
            key={c.id}
            c={c}
            progress={progress[c.id] ?? 0}
            joined={!!joined[c.id]}
            onToggle={() => toggleJoin(c.id)}
            onLog={() => logProgress(c)}
          />
        ))}
      </main>

      {flash && (
        <div className="fixed inset-x-0 bottom-24 z-50 mx-auto max-w-md px-4">
          <div className="rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-ink-950 shadow-glow">{flash}</div>
        </div>
      )}
    </div>
  );
}

function ChallengeCard({
  c,
  progress,
  joined,
  onToggle,
  onLog,
}: {
  c: Challenge;
  progress: number;
  joined: boolean;
  onToggle: () => void;
  onLog: () => void;
}) {
  const pct = Math.min(100, Math.round((progress / c.goal) * 100));
  const done = progress >= c.goal;
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
          <span className="text-slate-400">{progress}/{c.goal} {c.metric}</span>
          <span className="font-semibold text-brand-400">{pct}%</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="min-w-0 text-xs text-slate-400">
          🎁 {c.reward}
          <p className="mt-0.5 truncate text-slate-500">{c.participants} participants</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {joined && !done && (
            <button onClick={onLog} className="btn-ghost text-xs">+ Log {c.metric.replace(/s$/, "")}</button>
          )}
          <button onClick={onToggle} className={done ? "btn-ghost text-xs text-accent" : joined ? "btn-ghost text-xs text-accent" : "btn-primary text-xs"}>
            {done ? "✓ Complete" : joined ? "✓ Joined" : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}
