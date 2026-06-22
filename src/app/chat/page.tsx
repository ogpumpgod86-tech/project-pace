"use client";

import { useEffect, useRef, useState } from "react";
import TopBar from "@/components/TopBar";
import {
  channels,
  memberById,
  messages as seedMessages,
  youId,
} from "@/lib/mockData";
import type { ChatMessage } from "@/lib/types";
import { timeAgo } from "@/lib/format";

export default function ChatPage() {
  const [activeId, setActiveId] = useState<string>(channels[0].id);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>(seedMessages);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const active = channels.find((c) => c.id === activeId)!;
  const thread = allMessages.filter((m) => m.channelId === activeId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, activeId]);

  const send = () => {
    if (!draft.trim()) return;
    setAllMessages((m) => [
      ...m,
      {
        id: `x_${Date.now()}`,
        channelId: activeId,
        authorId: youId,
        text: draft.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);
    setDraft("");
  };

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col">
      <TopBar title="Community Chat" />

      {/* Channel switcher */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-white/5 px-4 py-3">
        {channels.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeId === c.id ? "bg-brand text-white" : "bg-white/5 text-slate-300"
            }`}
          >
            {c.kind === "dm" && (
              <img src={memberById(dmMemberId(c.id)).avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
            )}
            {c.name}
            {c.unread > 0 && activeId !== c.id && (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-flame px-1 text-[9px] font-bold text-white">
                {c.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {active.description && (
        <p className="px-4 py-2 text-center text-xs text-slate-500">{active.description}</p>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 pb-24">
        {thread.map((m, i) => {
          const mine = m.authorId === youId;
          const author = memberById(m.authorId);
          const prev = thread[i - 1];
          const showAuthor = !mine && (!prev || prev.authorId !== m.authorId);
          return (
            <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              {!mine ? (
                <img src={author.avatar} alt="" className={`h-7 w-7 shrink-0 rounded-full object-cover ${showAuthor ? "" : "invisible"}`} />
              ) : null}
              <div className={`max-w-[78%] ${mine ? "items-end" : ""}`}>
                {showAuthor && <p className="mb-0.5 px-1 text-[11px] font-medium text-slate-400">{author.name}</p>}
                <div
                  className={`rounded-2xl px-3.5 py-2 text-sm ${
                    mine
                      ? "rounded-br-sm bg-brand text-white"
                      : "rounded-bl-sm bg-white/5 text-slate-100"
                  }`}
                >
                  {m.text}
                </div>
                <p className={`mt-0.5 px-1 text-[10px] text-slate-600 ${mine ? "text-right" : ""}`}>{timeAgo(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="fixed inset-x-0 bottom-20 z-30 mx-auto max-w-md px-4">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-850/95 p-1.5 shadow-card backdrop-blur-xl">
          <button className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-white/5">＋</button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Message ${active.name}`}
            className="flex-1 bg-transparent px-1 text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button onClick={send} className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white disabled:opacity-40" disabled={!draft.trim()}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

function dmMemberId(channelId: string): string {
  // ch_dm_jordan -> m_jordan
  const key = channelId.replace("ch_dm_", "m_");
  return key;
}
