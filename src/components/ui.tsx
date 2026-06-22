import Link from "next/link";

export function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="section-title">{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-medium text-brand-400">See all</Link>
      )}
    </div>
  );
}

export function Progress({ value, goal }: { value: number; goal: number }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function DifficultyPill({ level }: { level: "Easy" | "Moderate" | "Hard" }) {
  const map = {
    Easy: "bg-accent/15 text-accent",
    Moderate: "bg-gold/15 text-gold",
    Hard: "bg-flame/15 text-flame",
  } as const;
  return <span className={`pill ${map[level]}`}>{level}</span>;
}
