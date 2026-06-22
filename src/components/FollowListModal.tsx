"use client";

import Link from "next/link";
import type { Member } from "@/lib/types";

export default function FollowListModal({
  title,
  ids,
  resolve,
  onClose,
}: {
  title: string;
  ids: string[];
  resolve: (id: string) => Member | undefined;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div className="card max-h-[75vh] w-full max-w-md animate-fade-up overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title} ({ids.length})</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-slate-400">✕</button>
        </div>
        <div className="mt-3 divide-y divide-white/5">
          {ids.length === 0 && <p className="py-4 text-sm text-slate-500">Nobody here yet.</p>}
          {ids.map((id) => {
            const m = resolve(id);
            return (
              <Link key={id} href={`/u/${id}`} onClick={onClose} className="flex items-center gap-3 py-2.5">
                <img src={m?.avatar ?? `https://i.pravatar.cc/200?u=${id}`} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{m?.name ?? "Member"}</p>
                  <p className="truncate text-xs text-slate-500">@{m?.handle ?? "member"}</p>
                </div>
                <span className="text-xs text-brand-400">View</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
