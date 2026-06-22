// ════════════════════════════════════════════════════════════════════════
// In-session mock store.
//
// When Supabase isn't configured, the app runs on this store. It seeds from
// the static sample data, but mutations (posts, messages, RSVPs, follows,
// profile edits, joins, likes, comments, points, challenges, group rewards)
// are kept in a module singleton AND mirrored to localStorage — so they
// persist across client navigation and page reloads.
// ════════════════════════════════════════════════════════════════════════

import * as seed from "./mockData";
import type { ChatChannel, ChatMessage, Comment, EventItem, GroupReward, Post } from "./types";

type ProfileOverride = { name?: string; bio?: string; avatar?: string };

type Snapshot = {
  posts: Post[];
  messages: ChatMessage[];
  channels: ChatChannel[];
  events: EventItem[];
  // Social graph: followerId -> list of followee ids.
  followGraph: Record<string, string[]>;
  profileOverrides: Record<string, ProfileOverride>;
  likedPostIds: string[]; // posts the current user liked (for activity)
  joinedCommunities: string[];
  awardedPoints: Record<string, number>; // points beyond baseline activity
  challengeProgress: Record<string, number>;
  joinedChallenges: string[];
  groupRewards: GroupReward[];
};

const KEY = "pace.mockStore.v2";

// Seed a believable social graph so follower/following counts are meaningful.
const SEED_FOLLOWS: Record<string, string[]> = {
  m_you: ["m_jordan", "m_priya"],
  m_jordan: ["m_sam", "m_priya", "m_lena", "m_you"],
  m_sam: ["m_jordan", "m_you", "m_omar"],
  m_priya: ["m_jordan", "m_lena"],
  m_diego: ["m_you", "m_jordan", "m_sam"],
  m_mia: ["m_you", "m_priya", "m_jordan"],
  m_omar: ["m_jordan", "m_lena"],
  m_lena: ["m_jordan", "m_priya", "m_sam"],
};

function seedSnapshot(): Snapshot {
  return {
    posts: seed.posts.map((p) => ({ ...p, comments: [...p.comments] })),
    messages: seed.messages.map((m) => ({ ...m })),
    channels: seed.channels.map((c) => ({ ...c })),
    events: seed.events.map((e) => ({ ...e, attendees: [...e.attendees] })),
    followGraph: JSON.parse(JSON.stringify(SEED_FOLLOWS)),
    profileOverrides: {},
    likedPostIds: seed.posts.filter((p) => p.liked).map((p) => p.id),
    joinedCommunities: ["c_tampa", "c_downtown", "c_crossfit", "c_cycling"],
    awardedPoints: {},
    challengeProgress: { ch1: 14, ch2: 2, ch3: 7 },
    joinedChallenges: ["ch1", "ch3"],
    groupRewards: [
      { id: "gr1", communityId: "c_tampa", points: 1000, title: "Club singlet" },
      { id: "gr2", communityId: "c_tampa", points: 3000, title: "Free race entry" },
    ],
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

export function deletePost(id: string) {
  load();
  state.posts = state.posts.filter((p) => p.id !== id);
  save();
}

export function setPostLike(id: string, liked: boolean) {
  load();
  state.posts = state.posts.map((p) =>
    p.id === id ? { ...p, liked, likes: Math.max(0, p.likes + (liked ? 1 : -1)) } : p
  );
  state.likedPostIds = liked
    ? Array.from(new Set([...state.likedPostIds, id]))
    : state.likedPostIds.filter((x) => x !== id);
  save();
}

export function addComment(postId: string, comment: Comment) {
  load();
  state.posts = state.posts.map((p) =>
    p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
  );
  save();
}

export function likedPostIds(): string[] {
  load();
  return [...state.likedPostIds];
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

export function ensureEventChannel(eventId: string, title: string): string {
  load();
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

// ── Social graph ────────────────────────────────────────────────────────────
export function getFollowing(id: string): string[] {
  load();
  return [...(state.followGraph[id] ?? [])];
}

export function getFollowers(id: string): string[] {
  load();
  return Object.entries(state.followGraph)
    .filter(([, list]) => list.includes(id))
    .map(([follower]) => follower);
}

export function followingCount(id: string): number {
  return getFollowing(id).length;
}

export function followerCount(id: string): number {
  return getFollowers(id).length;
}

export function isFollowing(follower: string, followee: string): boolean {
  load();
  return (state.followGraph[follower] ?? []).includes(followee);
}

export function toggleFollow(follower: string, followee: string): boolean {
  load();
  const list = state.followGraph[follower] ?? [];
  const following = list.includes(followee);
  state.followGraph = {
    ...state.followGraph,
    [follower]: following ? list.filter((x) => x !== followee) : [...list, followee],
  };
  save();
  return !following;
}

// ── Profile overrides (editing) ──────────────────────────────────────────────
export function getOverride(id: string): ProfileOverride {
  load();
  return state.profileOverrides[id] ?? {};
}

export function setOverride(id: string, patch: ProfileOverride) {
  load();
  state.profileOverrides = {
    ...state.profileOverrides,
    [id]: { ...state.profileOverrides[id], ...patch },
  };
  save();
}

// ── Communities (join / leave / browse) ──────────────────────────────────────
export function joinedCommunities(): string[] {
  load();
  return [...state.joinedCommunities];
}

export function isJoined(id: string): boolean {
  load();
  return state.joinedCommunities.includes(id);
}

export function toggleJoin(id: string): boolean {
  load();
  const joined = state.joinedCommunities.includes(id);
  state.joinedCommunities = joined
    ? state.joinedCommunities.filter((x) => x !== id)
    : [...state.joinedCommunities, id];
  save();
  return !joined;
}

// ── Points ────────────────────────────────────────────────────────────────
export function awardedPoints(id: string): number {
  load();
  return state.awardedPoints[id] ?? 0;
}

export function awardPoints(id: string, amount: number) {
  load();
  state.awardedPoints = { ...state.awardedPoints, [id]: (state.awardedPoints[id] ?? 0) + amount };
  save();
}

// ── Challenges ──────────────────────────────────────────────────────────────
export function challengeProgress(id: string): number {
  load();
  return state.challengeProgress[id] ?? 0;
}

export function isChallengeJoined(id: string): boolean {
  load();
  return state.joinedChallenges.includes(id);
}

export function setChallengeJoined(id: string, joined: boolean) {
  load();
  state.joinedChallenges = joined
    ? Array.from(new Set([...state.joinedChallenges, id]))
    : state.joinedChallenges.filter((x) => x !== id);
  save();
}

// Adds progress to a challenge; returns the new value (clamped at goal).
export function addChallengeProgress(id: string, amount: number, goal: number): number {
  load();
  const next = Math.min(goal, (state.challengeProgress[id] ?? 0) + amount);
  state.challengeProgress = { ...state.challengeProgress, [id]: next };
  save();
  return next;
}

// ── Group rewards (owner-defined, non-monetary) ──────────────────────────────
export function listGroupRewards(communityId: string): GroupReward[] {
  load();
  return state.groupRewards
    .filter((r) => r.communityId === communityId)
    .sort((a, b) => a.points - b.points);
}

export function addGroupReward(r: GroupReward) {
  load();
  state.groupRewards = [...state.groupRewards, r];
  save();
}

export function removeGroupReward(id: string) {
  load();
  state.groupRewards = state.groupRewards.filter((r) => r.id !== id);
  save();
}
