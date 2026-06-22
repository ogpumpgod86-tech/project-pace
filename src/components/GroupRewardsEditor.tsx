"use client";

import { useEffect, useState } from "react";
import { activeCommunityId } from "@/lib/mockData";
import { addGroupReward, listGroupRewards, removeGroupReward } from "@/lib/db";
import type { GroupReward } from "@/lib/types";

// Lets a group owner define non-monetary rewards unlocked at points milestones.
export default function GroupRewardsEditor() {
  const [rewards, setRewards] = useState<GroupReward[]>([]);
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setRewards(listGroupRewards(activeCommunityId));
  }, [tick]);

  const add = () => {
    const pts = Number(points);
    if (!title.trim() || !pts || pts <= 0) return;
    addGroupReward(activeCommunityId, pts, title.trim());
    setTitle("");
    setPoints("");
    setTick((t) => t + 1);
  };

  const remove = (id: string) => {
    removeGroupReward(id);
    setTick((t) => t + 1);
  };

  return (
    <section className="card p-4">
      <h2 className="section-title">Group Rewards</h2>
      <p className="mt-1 text-xs text-slate-400">
        Assign your own rewards at points milestones (e.g. a club singlet). Members unlock them by earning points. Non-monetary only.
      </p>

      <div className="mt-3 space-y-2">
        {rewards.length === 0 && <p className="text-sm text-slate-500">No rewards yet.</p>}
        {rewards.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <span className="text-lg">🎁</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{r.title}</p>
              <p className="text-xs text-slate-500">{r.points.toLocaleString()} pts milestone</p>
            </div>
            <button onClick={() => remove(r.id)} className="rounded-lg bg-flame/10 px-2.5 py-1 text-xs text-flame">Remove</button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Reward (e.g. Free race entry)"
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-brand focus:outline-none"
        />
        <input
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          type="number"
          placeholder="pts"
          className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-brand focus:outline-none"
        />
        <button onClick={add} className="btn-primary px-4 text-sm">Add</button>
      </div>
    </section>
  );
}
