// ════════════════════════════════════════════════════════════════════════
// Points system (clarified)
//
// Points are ONLY for tracking activity and ranking. They are NOT currency.
//   • Points unlock badges, ranks, and status.
//   • Group owners may optionally attach their own non-monetary rewards at
//     points milestones (e.g. "free club singlet"). These are group-defined.
//   • No real monetary rewards and no app-funded rewards exist.
// ════════════════════════════════════════════════════════════════════════

import type { Member } from "./types";

export const POINTS_INFO = {
  summary: "Points track your activity and rank — they are not currency.",
  unlocks: ["Badges", "Ranks & status", "Optional group-defined rewards"],
  disclaimer: "Points are not money. There are no cash or app-funded rewards.",
  earn: [
    { label: "Log a run", value: "+10 pts" },
    { label: "Attend an event", value: "+25 pts" },
    { label: "Complete a challenge", value: "varies" },
  ],
};

// Baseline points earned from a member's tracked activity.
export function basePoints(m: Member): number {
  return Math.round(m.stats.runs * 10 + m.stats.eventsAttended * 25 + m.stats.totalMiles);
}

export type Rank = { name: string; icon: string; min: number };

export const RANKS: Rank[] = [
  { name: "Rookie", icon: "🌱", min: 0 },
  { name: "Pacer", icon: "👟", min: 1000 },
  { name: "Strider", icon: "🔥", min: 3000 },
  { name: "Trailblazer", icon: "⚡", min: 7000 },
  { name: "Elite", icon: "🏆", min: 15000 },
];

export function rankFor(points: number): { current: Rank; next: Rank | null; progress: number } {
  let current = RANKS[0];
  for (const r of RANKS) if (points >= r.min) current = r;
  const next = RANKS.find((r) => r.min > points) ?? null;
  const progress = next ? Math.round(((points - current.min) / (next.min - current.min)) * 100) : 100;
  return { current, next, progress };
}
