"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/feed", label: "Feed", icon: FeedIcon },
  { href: "/events", label: "Events", icon: CalendarIcon },
  { href: "/chat", label: "Chat", icon: ChatIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export default function BottomNav() {
  const path = usePathname();
  if (path?.startsWith("/login")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="flex items-center justify-around rounded-2xl border border-white/10 bg-ink-850/90 px-2 py-2 shadow-card backdrop-blur-xl">
          {tabs.map((t) => {
            const active =
              t.href === "/" ? path === "/" : path?.startsWith(t.href);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition ${
                  active ? "text-brand-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon active={!!active} />
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

type IconProps = { active: boolean };
const base = "h-5 w-5";

function HomeIcon({ active }: IconProps) {
  return (
    <svg className={base} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />
    </svg>
  );
}
function FeedIcon({ active }: IconProps) {
  return (
    <svg className={base} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path strokeLinecap="round" d="M3 9h18M8 14h8M8 17h5" />
    </svg>
  );
}
function CalendarIcon({ active }: IconProps) {
  return (
    <svg className={base} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path strokeLinecap="round" d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
function ChatIcon({ active }: IconProps) {
  return (
    <svg className={base} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v11H9l-5 4V5z" />
    </svg>
  );
}
function UserIcon({ active }: IconProps) {
  return (
    <svg className={base} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
    </svg>
  );
}
