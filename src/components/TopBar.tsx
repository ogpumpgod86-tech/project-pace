import Link from "next/link";
import { communities, activeCommunityId, memberById, youId } from "@/lib/mockData";

export default function TopBar({ title }: { title?: string }) {
  const community = communities.find((c) => c.id === activeCommunityId)!;
  const you = memberById(youId);

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/communities" className="flex items-center gap-2.5">
          <img
            src={community.avatar}
            alt=""
            className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/10"
          />
          <div className="leading-tight">
            <p className="text-[11px] font-medium uppercase tracking-wider text-brand-400">
              {title ?? "Project Pace"}
            </p>
            <p className="-mt-0.5 flex items-center gap-1 text-sm font-semibold text-white">
              {community.name}
              <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <button className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-300">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" /><path strokeLinecap="round" d="M10 21a2 2 0 004 0" /></svg>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-flame" />
          </button>
          <Link href="/profile">
            <img src={you.avatar} alt="" className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/10" />
          </Link>
        </div>
      </div>
    </header>
  );
}
