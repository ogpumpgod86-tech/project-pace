"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getEvents, getProfileMap, type ProfileMap } from "@/lib/db";
import type { EventItem } from "@/lib/types";
import { monthDay, to12h } from "@/lib/format";

// Summary → drill-down: the "Attendance by Event" card shows a bar per event;
// tapping one opens the full attendee breakdown for that event.
export default function AttendanceDrilldown() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    Promise.all([getEvents(), getProfileMap()]).then(([e, map]) => {
      if (!on) return;
      setEvents(e);
      setProfiles(map);
    });
    return () => {
      on = false;
    };
  }, []);

  const max = Math.max(1, ...events.map((e) => e.attendees.length));
  const selected = events.find((e) => e.id === openId) ?? null;

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Attendance by Event</h2>
        <span className="text-[11px] text-slate-500">tap to drill down</span>
      </div>

      <div className="mt-3 space-y-2.5">
        {events.map((e) => (
          <button key={e.id} onClick={() => setOpenId(e.id)} className="block w-full text-left">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">{e.title}</span>
              <span className="font-semibold text-white">{e.attendees.length}</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(e.attendees.length / max) * 100}%` }} />
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setOpenId(null)}
        >
          <div className="card max-h-[80vh] w-full max-w-md animate-fade-up overflow-y-auto p-5" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-brand-400">Event drill-down</p>
                <h3 className="text-lg font-bold text-white">{selected.title}</h3>
                <p className="text-xs text-slate-400">{monthDay(selected.date)} · {to12h(selected.time)} · {selected.location}</p>
              </div>
              <button onClick={() => setOpenId(null)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-slate-400">✕</button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Metric value={selected.attendees.length} label="Attending" />
              <Metric value={selected.capacity} label="Capacity" />
              <Metric value={`${Math.round((selected.attendees.length / selected.capacity) * 100)}%`} label="Filled" />
            </div>

            <p className="mt-4 section-title">Attendees</p>
            <div className="mt-2 divide-y divide-white/5">
              {selected.attendees.length === 0 && <p className="py-3 text-sm text-slate-500">No RSVPs yet.</p>}
              {selected.attendees.map((id) => {
                const m = profiles[id];
                return (
                  <Link key={id} href={`/u/${id}`} className="flex items-center gap-3 py-2.5">
                    <img src={m?.avatar ?? `https://i.pravatar.cc/200?u=${id}`} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{m?.name ?? "Member"}</p>
                      <p className="text-xs text-slate-500">@{m?.handle ?? "member"}</p>
                    </div>
                    <span className="text-xs text-slate-500">{m?.stats.totalMiles ?? 0} mi</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-2.5 text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
