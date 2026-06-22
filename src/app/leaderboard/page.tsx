"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TopBar from "@/components/TopBar";
import { leaderboardMeta, type LeaderboardKey } from "@/lib/mockData";
import { getProfileMap, type ProfileMap } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import type { Member } from "@/lib/types";

const keys: LeaderboardKey[] = ["weeklyMiles", "monthlyMiles", "attendance", "consistency"];

const pick = (m: Member, key: LeaderboardKey): number => {
  switch (key) {
    case "weeklyMiles":
      return m.stats.weeklyMiles;
    case "monthlyMiles":
      return Math.round(m.stats.weeklyMiles * 4.1);
    case "attendance":
      return m.stats.eventsAttended;
    case "consistency":
      return m.stats.streak;
  }
};

export default function LeaderboardPage() {
  const { profileId } = useAuth();
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState<LeaderboardKey>("weeklyMiles");

  useEffect(() => {
    let active = true;
    getProfileMap().then((map) => {
      if (!active) return;
      setProfiles(map);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const meta = leaderboardMeta[key];
  const rows = useMemo(
    () =>
      Object.values(profiles)
        .map((m) => ({ member: m, value: pick(m, key) }))
        .sort((a, b) => b.value - a.value),
    [profiles, key]
  );

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const yourRank = rows.findIndex((r) => r.member.id === profileId) + 1;

  return (
    <div className="animate-fade-up">
      <TopBar title="Leaderboards" />

      <main className="px-4 py-4">
        <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => setKey(k)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${key === k ? "bg-brand text-white" : "bg-white/5 text-slate-300"}`}
            >
              {leaderboardMeta[k].title}
            </button>
          ))}
        </div>

        <p className="mb-3 text-center text-xs text-slate-500">{meta.subtitle}</p>

        {loading ? (
          <div className="card h-64 animate-pulse" />
        ) : (
          <>
            <div className="mb-6 flex items-end justify-center gap-3">
              {[1, 0, 2].map((idx) => {
                const row = top3[idx];
                if (!row) return null;
                const m = row.member;
                const place = idx + 1;
                const heights = ["h-24", "h-20", "h-16"];
                const medals = ["🥇", "🥈", "🥉"];
                const ring = place === 1 ? "ring-gold" : place === 2 ? "ring-slate-300" : "ring-flame";
                return (
                  <Link key={m.id} href={`/u/${m.id}`} className="flex w-1/4 flex-col items-center">
                    <div className="relative">
                      <img src={m.avatar} alt="" className={`h-14 w-14 rounded-full object-cover ring-2 ${ring}`} />
                      <span className="absolute -bottom-1 -right-1 text-lg">{medals[place - 1]}</span>
                    </div>
                    <p className="mt-2 max-w-full truncate text-xs font-semibold text-white">{m.name.split(" ")[0]}</p>
                    <p className="text-xs font-bold text-brand-400">{row.value} {meta.unit}</p>
                    <div className={`mt-1.5 w-full rounded-t-lg bg-gradient-to-b from-brand/30 to-transparent ${heights[idx === 0 ? 1 : idx === 1 ? 0 : 2]}`} />
                  </Link>
                );
              })}
            </div>

            <div className="card divide-y divide-white/5">
              {rest.map((row, i) => {
                const m = row.member;
                const rank = i + 4;
                const isYou = m.id === profileId;
                return (
                  <Link key={m.id} href={`/u/${m.id}`} className={`flex items-center gap-3 p-3 ${isYou ? "bg-brand/10" : ""}`}>
                    <span className="w-6 text-center text-sm font-bold text-slate-500">{rank}</span>
                    <img src={m.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {m.name} {isYou && <span className="pill bg-brand/20 text-brand-400">You</span>}
                      </p>
                      <p className="text-xs text-slate-500">@{m.handle}</p>
                    </div>
                    <p className="text-sm font-semibold text-white">{row.value} <span className="text-xs text-slate-500">{meta.unit}</span></p>
                  </Link>
                );
              })}
            </div>

            {yourRank > 0 && (
              <p className="mt-4 text-center text-sm text-slate-400">
                You&apos;re ranked <span className="font-bold text-brand-400">#{yourRank}</span> of {rows.length} this period 💪
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
