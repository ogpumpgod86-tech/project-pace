"use client";

import { useState } from "react";
import { badges as allBadges } from "@/lib/mockData";
import type { Badge } from "@/lib/types";

const tierLabel: Record<Badge["tier"], { label: string; cls: string }> = {
  bronze: { label: "Bronze", cls: "bg-flame/15 text-flame" },
  silver: { label: "Silver", cls: "bg-white/10 text-slate-200" },
  gold: { label: "Gold", cls: "bg-gold/15 text-gold" },
};

export default function BadgeGrid({ earned }: { earned: string[] }) {
  const earnedSet = new Set(earned);
  const [active, setActive] = useState<Badge | null>(null);

  return (
    <>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {allBadges.map((b) => {
          const has = earnedSet.has(b.id);
          return (
            <button
              key={b.id}
              onClick={() => setActive(b)}
              className={`flex flex-col items-center text-center transition active:scale-95 ${has ? "" : "opacity-30"}`}
            >
              <div
                className={`grid h-14 w-14 place-items-center rounded-2xl text-2xl ${
                  has ? "bg-gradient-to-br from-brand/30 to-accent/20 ring-1 ring-white/10" : "bg-white/5"
                }`}
              >
                {has ? b.icon : "🔒"}
              </div>
              <p className="mt-1 text-[10px] font-medium leading-tight text-slate-300">{b.name}</p>
            </button>
          );
        })}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setActive(null)}
        >
          <div
            className="card w-full max-w-md animate-fade-up p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const has = earnedSet.has(active.id);
              return (
                <>
                  <div
                    className={`mx-auto grid h-20 w-20 place-items-center rounded-3xl text-4xl ${
                      has ? "bg-gradient-to-br from-brand/30 to-accent/20 ring-1 ring-white/10" : "bg-white/5 opacity-50"
                    }`}
                  >
                    {has ? active.icon : "🔒"}
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <h3 className="text-lg font-bold text-white">{active.name}</h3>
                    <span className={`pill ${tierLabel[active.tier].cls}`}>{tierLabel[active.tier].label}</span>
                  </div>

                  <div className="mt-4 rounded-xl bg-white/5 p-3 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Requirement</p>
                    <p className="mt-1 text-sm text-slate-200">{active.description}</p>
                  </div>

                  <div className="mt-3">
                    {has ? (
                      <span className="pill bg-accent/15 text-accent">✓ Earned</span>
                    ) : (
                      <span className="pill bg-white/5 text-slate-400">🔒 Not earned yet</span>
                    )}
                  </div>

                  <button onClick={() => setActive(null)} className="btn-ghost mt-5 w-full">
                    Close
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
