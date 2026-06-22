// ════════════════════════════════════════════════════════════════════════
// In-session mock store.
//
// When Supabase isn't configured, the app runs on this store. It seeds from
// the static sample data, but mutations (new posts, messages, RSVPs, follows,
// deletes) are kept in a module singleton AND mirrored to localStorage — so
// they persist across client navigation and page reloads, making the demo
// feel like a real product.
// ════════════════════════════════════════════════════════════════════════

import * as seed from "./mockData";
import type { ChatChannel, ChatMessage, EventItem, Post } from "./types";

type Snapshot = {
  posts: Post[];
  messages: ChatMessage[];
  channels: ChatChannel[];
  events: EventItem[];
  follows: string[];
};

const KEY = "pace.mockStore.v1";

function seedSnapshot(): Snapshot {
  return {
    posts: seed.posts.map((p) => ({ ...p, comments: [...p.comments] })),
    messages: seed.messages.map((m) => ({ ...m })),
    channels: seed.channels.map((c) => ({ ...c })),
    events: seed.events.map((e) => ({ ...e, attendees: [...e.attendees] })),
    follows: [],
  };
}

let state: Snapshot = seedSnapshot();
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...seedSnapshot(), ...JSON.parse(raw) };
  } catch {
    /* ignore corrupt storage */
  }
}

function save() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

// ── Posts ─────────────────────────────────────────────────────────────────
export function listPosts(): Post[] {
  load();
  return [...state.posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addPost(p: Post) {
  load();
  state.posts = [p, ...state.posts];
  save();
}

export function setPostLike(id: string, liked: boolean) {
  load();
  state.posts = state.posts.map((p) =>
    p.id === id ? { ...p, liked, likes: p.likes + (liked ? 1 : -1) } : p
  );
  save();
}

// ── Chat ──────────────────────────────────────────────────────────────────
export function listChannels(): ChatChannel[] {
  load();
  return [...state.channels];
}

export function listMessages(channelId: string): ChatMessage[] {
  load();
  return state.messages
    .filter((m) => m.channelId === channelId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function addMessage(m: ChatMessage) {
  load();
  state.messages = [...state.messages, m];
  save();
}

export function deleteMessage(id: string) {
  load();
  state.messages = state.messages.filter((m) => m.id !== id);
  save();
}

// Returns the channel id for an event, creating one if it doesn't exist yet.
export function ensureEventChannel(eventId: string, title: string): string {
  load();
  // Reuse the seeded event channels where they exist.
  const known: Record<string, string> = { e1: "ch_event_e1", e3: "ch_event_e3" };
  const id = known[eventId] ?? `ch_event_${eventId}`;
  if (!state.channels.some((c) => c.id === id)) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    state.channels = [
      ...state.channels,
      { id, name: `# ${slug}`, kind: "event", description: `Event chat for ${title}`, unread: 0 },
    ];
    save();
  }
  return id;
}

// ── Events / RSVP ───────────────────────────────────────────────────────────
export function listEvents(): EventItem[] {
  load();
  return [...state.events];
}

export function toggleRsvp(eventId: string, profileId: string): EventItem[] {
  load();
  state.events = state.events.map((e) => {
    if (e.id !== eventId) return e;
    const going = e.attendees.includes(profileId);
    return {
      ...e,
      attendees: going ? e.attendees.filter((a) => a !== profileId) : [...e.attendees, profileId],
    };
  });
  save();
  return [...state.events];
}

// ── Follows ─────────────────────────────────────────────────────────────────
export function isFollowing(id: string): boolean {
  load();
  return state.follows.includes(id);
}

export function toggleFollow(id: string): boolean {
  load();
  const following = state.follows.includes(id);
  state.follows = following ? state.follows.filter((f) => f !== id) : [...state.follows, id];
  save();
  return !following;
}

export function followingCount(): number {
  load();
  return state.follows.length;
}
