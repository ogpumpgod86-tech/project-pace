"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import type { EventItem, Member } from "@/lib/types";
import { monthDay, to12h, weekday } from "@/lib/format";
import { DifficultyPill } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { getEventChannelId, getEvents, getProfileMap, toggleRsvp as dbToggleRsvp, type ProfileMap } from "@/lib/db";

const unknownMember = (id: string): Member => ({
  id, name: "Member", handle: "member", avatar: `https://i.pravatar.cc/200?u=${id}`,
  role: "member", bio: "", joined: "", badges: [],
  stats: { totalMiles: 0, weeklyMiles: 0, runs: 0, eventsAttended: 0, streak: 0 },
});

export default function EventsPage() {
  const router = useRouter();
  const { profileId } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"week" | "month">("week");
  const [openId, setOpenId] = useState<string | null>(null);

  const who = (id: string) => profiles[id] ?? unknownMember(id);

  useEffect(() => {
    let active = true;
    Promise.all([getEvents(), getProfileMap()]).then(([e, map]) => {
      if (!active) return;
      setEvents(e);
      setProfiles(map);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const sorted = useMemo(
    () => [...events].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [events]
  );

  const toggleRsvp = (id: string) => {
    if (!profileId) return;
    const ev = events.find((e) => e.id === id);
    if (!ev) return;
    const going = ev.attendees.includes(profileId);
    // Persist once, outside the state updater (updaters may run twice in dev).
    dbToggleRsvp(id, profileId, !going);
    setEvents((evs) =>
      evs.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              attendees: going ? e.attendees.filter((a) => a !== profileId) : [...e.attendees, profileId],
            }
      )
    );
  };

  return (
    <div className="animate-fade-up">
      <TopBar title="Events & Calendar" />

      <main className="px-4 py-4">
        <div className="mb-4 flex rounded-xl bg-white/5 p-1 text-sm font-medium">
          {(["week", "month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 rounded-lg py-1.5 capitalize transition ${view === v ? "bg-brand text-white shadow" : "text-slate-400"}`}
            >
              {v} view
            </button>
          ))}
        </div>

        {view === "month" ? (
          <MonthGrid events={events} onSelect={setOpenId} />
        ) : (
          <WeekStrip events={sorted} />
        )}

        <div className="mt-5 space-y-3">
          {loading && [0, 1, 2].map((i) => <div key={i} className="card h-20 animate-pulse" />)}
          {sorted.map((e) => {
            const host = who(e.hostId);
            const going = profileId ? e.attendees.includes(profileId) : false;
            const open = openId === e.id;
            return (
              <div key={e.id} className="card overflow-hidden">
                <button onClick={() => setOpenId(open ? null : e.id)} className="flex w-full items-center gap-3 p-3 text-left">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-brand/15 text-center">
                    <span className="text-[10px] font-semibold uppercase text-brand-400">{weekday(e.date)}</span>
                    <span className="text-lg font-bold leading-none text-white">{new Date(e.date + "T00:00:00").getDate()}</span>
                    <span className="text-[9px] text-slate-400">{monthDay(e.date).split(" ")[0]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{e.title}</p>
                    <p className="truncate text-xs text-slate-400">{to12h(e.time)} · {e.location}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <DifficultyPill level={e.difficulty} />
                      <span className="pill bg-white/5 text-slate-300">📏 {e.distance}</span>
                    </div>
                  </div>
                </button>

                {open && (
                  <div className="border-t border-white/5 p-3">
                    <p className="text-sm text-slate-300">{e.description}</p>
                    <Link href={`/u/${host.id}`} className="mt-3 flex items-center gap-2">
                      <img src={host.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                      <p className="text-xs text-slate-400">Hosted by <span className="text-slate-200">{host.name}</span></p>
                    </Link>

                    <div className="mt-3">
                      <p className="text-xs text-slate-400">{e.attendees.length} going · {Math.max(0, e.capacity - e.attendees.length)} spots left</p>
                      <div className="mt-1.5 flex -space-x-2">
                        {e.attendees.slice(0, 6).map((id) => (
                          <Link key={id} href={`/u/${id}`}>
                            <img src={who(id).avatar} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-ink-850" />
                          </Link>
                        ))}
                        {e.attendees.length > 6 && (
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-[10px] font-semibold text-slate-300 ring-2 ring-ink-850">
                            +{e.attendees.length - 6}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button onClick={() => toggleRsvp(e.id)} className={going ? "btn-ghost flex-1 text-accent" : "btn-primary flex-1"}>
                        {going ? "✓ You're going" : "RSVP"}
                      </button>
                      <button
                        onClick={async () => {
                          const cid = await getEventChannelId(e.id, e.title);
                          if (cid) router.push(`/chat?channel=${cid}`);
                        }}
                        className="btn-ghost px-4"
                      >
                        💬 Chat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function WeekStrip({ events }: { events: EventItem[] }) {
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
  const hasEvent = (d: Date) => events.some((e) => e.date === d.toISOString().slice(0, 10));

  return (
    <div className="card flex justify-between p-2">
      {days.map((d, i) => {
        const active = i === 0;
        return (
          <div key={i} className={`flex flex-col items-center gap-1 rounded-xl px-2.5 py-2 ${active ? "bg-brand/20" : ""}`}>
            <span className="text-[10px] uppercase text-slate-500">{d.toLocaleDateString("en-US", { weekday: "narrow" })}</span>
            <span className={`text-sm font-bold ${active ? "text-brand-400" : "text-white"}`}>{d.getDate()}</span>
            <span className={`h-1.5 w-1.5 rounded-full ${hasEvent(d) ? "bg-accent" : "bg-transparent"}`} />
          </div>
        );
      })}
    </div>
  );
}

function MonthGrid({ events, onSelect }: { events: EventItem[]; onSelect: (id: string) => void }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const eventOn = (day: number) =>
    events.find((e) => {
      const d = new Date(e.date + "T00:00:00");
      return d.getMonth() === month && d.getDate() === day;
    });

  return (
    <div className="card p-3">
      <p className="mb-2 text-center text-sm font-semibold text-white">
        {today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <span key={i} />;
          const ev = eventOn(day);
          const isToday = day === today.getDate();
          return (
            <button
              key={i}
              onClick={() => ev && onSelect(ev.id)}
              className={`relative grid h-10 place-items-center rounded-lg text-sm ${
                isToday ? "bg-brand/25 font-bold text-brand-400" : "text-slate-300"
              } ${ev ? "ring-1 ring-accent/40" : ""}`}
            >
              {day}
              {ev && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
