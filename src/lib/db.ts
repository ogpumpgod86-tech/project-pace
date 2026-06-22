// ════════════════════════════════════════════════════════════════════════
// Data-access layer for Project Pace.
//
// Two modes, auto-detected:
//   • LIVE  — when NEXT_PUBLIC_SUPABASE_* env vars are set, reads/writes hit
//             Supabase (auth, posts, events, leaderboards, chat).
//   • MOCK  — otherwise, everything runs on the in-memory sample data so the
//             app still demos with zero configuration.
//
// All functions return the same shapes the UI already uses (see types.ts),
// plus a `profiles` map for resolving authors/hosts by id.
// ════════════════════════════════════════════════════════════════════════

import { supabase, isSupabaseConfigured } from "./supabaseClient";
import * as mock from "./mockData";
import * as store from "./mockStore";
import type {
  ChatChannel,
  ChatMessage,
  Community,
  EventItem,
  LeaderRow,
  Member,
  Post,
} from "./types";
import { leaderboard as mockLeaderboard, type LeaderboardKey } from "./mockData";

export const isLive = isSupabaseConfigured;

export type ProfileMap = Record<string, Member>;
export const DEMO_COMMUNITY = "11111111-1111-1111-1111-111111111101";

// ── Row → view-model mappers ──────────────────────────────────────────────
type ProfileRow = {
  id: string;
  name: string;
  handle: string;
  avatar_url: string | null;
  bio: string | null;
};
type MembershipRow = {
  role: string;
  total_miles: number;
  weekly_miles: number;
  runs: number;
  events_attended: number;
  streak: number;
  joined_at: string;
  profiles: ProfileRow;
};

function memberFromMembership(m: MembershipRow): Member {
  const p = m.profiles;
  return {
    id: p.id,
    name: p.name,
    handle: p.handle,
    avatar: p.avatar_url ?? "",
    role: (m.role as Member["role"]) ?? "member",
    bio: p.bio ?? "",
    joined: m.joined_at,
    badges: [],
    stats: {
      totalMiles: Number(m.total_miles ?? 0),
      weeklyMiles: Number(m.weekly_miles ?? 0),
      runs: m.runs ?? 0,
      eventsAttended: m.events_attended ?? 0,
      streak: m.streak ?? 0,
    },
  };
}

// ── Communities ───────────────────────────────────────────────────────────
export async function getCommunities(): Promise<Community[]> {
  if (!isLive || !supabase) return mock.communities;
  const { data, error } = await supabase.from("communities").select("*");
  if (error || !data) return mock.communities;
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    handle: c.handle,
    type: c.type,
    tagline: c.tagline ?? "",
    city: c.city ?? "",
    memberCount: 0,
    cover: c.cover_url ?? "",
    avatar: c.avatar_url ?? "",
    accent: c.accent ?? "#6d5efc",
  }));
}

// ── Profiles for a community (also used to resolve authors) ────────────────
export async function getProfileMap(communityId = DEMO_COMMUNITY): Promise<ProfileMap> {
  if (!isLive || !supabase) {
    return Object.fromEntries(mock.members.map((m) => [m.id, m]));
  }
  const { data } = await supabase
    .from("memberships")
    .select("role,total_miles,weekly_miles,runs,events_attended,streak,joined_at,profiles(*)")
    .eq("community_id", communityId);
  const map: ProfileMap = {};
  ((data as unknown as MembershipRow[]) ?? []).forEach((m) => {
    if (m.profiles) map[m.profiles.id] = memberFromMembership(m);
  });
  return map;
}

// ── Feed: posts + comments ────────────────────────────────────────────────
export async function getPosts(communityId = DEMO_COMMUNITY): Promise<Post[]> {
  if (!isLive || !supabase) return store.listPosts();
  const { data, error } = await supabase
    .from("posts")
    .select("*, comments(*)")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });
  if (error || !data) return mock.posts;
  return data.map((p) => ({
    id: p.id,
    authorId: p.author_id,
    createdAt: p.created_at,
    text: p.text,
    image: p.image_url ?? undefined,
    kind: p.kind,
    stat: p.stat ?? undefined,
    likes: p.likes ?? 0,
    comments: (p.comments ?? [])
      .sort((a: any, b: any) => a.created_at.localeCompare(b.created_at))
      .map((c: any) => ({
        id: c.id,
        authorId: c.author_id,
        text: c.text,
        createdAt: c.created_at,
      })),
  }));
}

export async function createPost(input: {
  communityId?: string;
  authorId: string;
  text: string;
  kind?: Post["kind"];
  image?: string;
}): Promise<Post | null> {
  if (!isLive || !supabase) {
    const post: Post = {
      id: `p_${Date.now()}`,
      authorId: input.authorId,
      createdAt: new Date().toISOString(),
      kind: input.kind ?? "update",
      text: input.text,
      image: input.image,
      likes: 0,
      comments: [],
    };
    store.addPost(post);
    return post;
  }
  const { data, error } = await supabase
    .from("posts")
    .insert({
      community_id: input.communityId ?? DEMO_COMMUNITY,
      author_id: input.authorId,
      text: input.text,
      kind: input.kind ?? "update",
      image_url: input.image ?? null,
    })
    .select("*, comments(*)")
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    authorId: data.author_id,
    createdAt: data.created_at,
    text: data.text,
    image: data.image_url ?? undefined,
    kind: data.kind,
    likes: data.likes ?? 0,
    comments: [],
  };
}

export async function likePost(postId: string, likes: number, liked: boolean): Promise<void> {
  if (!isLive || !supabase) {
    store.setPostLike(postId, liked);
    return;
  }
  await supabase.from("posts").update({ likes }).eq("id", postId);
}

// ── Events + RSVPs ────────────────────────────────────────────────────────
export async function getEvents(communityId = DEMO_COMMUNITY): Promise<EventItem[]> {
  if (!isLive || !supabase) return store.listEvents();
  const { data, error } = await supabase
    .from("events")
    .select("*, rsvps(profile_id)")
    .eq("community_id", communityId)
    .order("date", { ascending: true });
  if (error || !data) return mock.events;
  return data.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description ?? "",
    date: e.date,
    time: e.time ?? "",
    location: e.location ?? "",
    distance: e.distance ?? "",
    difficulty: e.difficulty,
    hostId: e.host_id,
    attendees: (e.rsvps ?? []).map((r: any) => r.profile_id),
    capacity: e.capacity ?? 50,
  }));
}

export async function toggleRsvp(eventId: string, profileId: string, going: boolean): Promise<void> {
  if (!isLive || !supabase) {
    store.toggleRsvp(eventId, profileId);
    return;
  }
  if (going) {
    await supabase.from("rsvps").insert({ event_id: eventId, profile_id: profileId });
  } else {
    await supabase.from("rsvps").delete().eq("event_id", eventId).eq("profile_id", profileId);
  }
}

// ── Leaderboards (derived from membership stats) ───────────────────────────
export async function getLeaderboard(
  key: LeaderboardKey,
  communityId = DEMO_COMMUNITY
): Promise<LeaderRow[]> {
  if (!isLive || !supabase) return mockLeaderboard(key);
  const map = await getProfileMap(communityId);
  const unit = mock.leaderboardMeta[key].unit;
  const pick = (m: Member): number => {
    switch (key) {
      case "weeklyMiles":
        return m.stats.weeklyMiles;
      case "monthlyMiles":
        return Math.round(m.stats.weeklyMiles * 4.1);
      case "attendance":
        return m.stats.eventsAttended;
      case "consistency":
        return m.stats.streak;
    }
  };
  return Object.values(map)
    .map((m) => ({ memberId: m.id, value: pick(m), unit }))
    .sort((a, b) => b.value - a.value);
}

// ── Chat ──────────────────────────────────────────────────────────────────
export async function getChannels(communityId = DEMO_COMMUNITY): Promise<ChatChannel[]> {
  if (!isLive || !supabase) return store.listChannels();
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .eq("community_id", communityId)
    .order("sort", { ascending: true });
  if (error || !data) return mock.channels;
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    kind: c.kind,
    description: c.description ?? undefined,
    unread: 0,
  }));
}

export async function getMessages(channelId: string): Promise<ChatMessage[]> {
  if (!isLive || !supabase) return store.listMessages(channelId);
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map((m) => ({
    id: m.id,
    channelId: m.channel_id,
    authorId: m.author_id,
    text: m.text,
    createdAt: m.created_at,
  }));
}

export async function sendMessage(
  channelId: string,
  authorId: string,
  text: string
): Promise<ChatMessage | null> {
  if (!isLive || !supabase) {
    const msg: ChatMessage = {
      id: `x_${Date.now()}`,
      channelId,
      authorId,
      text,
      createdAt: new Date().toISOString(),
    };
    store.addMessage(msg);
    return msg;
  }
  const { data, error } = await supabase
    .from("messages")
    .insert({ channel_id: channelId, author_id: authorId, text })
    .select("*")
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    channelId: data.channel_id,
    authorId: data.author_id,
    text: data.text,
    createdAt: data.created_at,
  };
}

// Realtime: invoke `cb` whenever a new message lands in the channel.
export function subscribeToMessages(channelId: string, cb: (m: ChatMessage) => void): () => void {
  if (!isLive || !supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel(`messages:${channelId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
      (payload) => {
        const m = payload.new as any;
        cb({
          id: m.id,
          channelId: m.channel_id,
          authorId: m.author_id,
          text: m.text,
          createdAt: m.created_at,
        });
      }
    )
    .subscribe();
  return () => {
    client.removeChannel(channel);
  };
}

export async function deleteMessage(id: string): Promise<void> {
  if (!isLive || !supabase) {
    store.deleteMessage(id);
    return;
  }
  await supabase.from("messages").delete().eq("id", id);
}

// Returns the channel id for an event's group chat (creating one in mock mode).
export async function getEventChannelId(eventId: string, title: string): Promise<string> {
  if (!isLive || !supabase) return store.ensureEventChannel(eventId, title);
  // Live: look for an existing event channel by name slug, else fall back to general.
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const { data } = await supabase.from("channels").select("id,name").ilike("name", `%${slug}%`).limit(1);
  if (data && data[0]) return data[0].id;
  const { data: first } = await supabase.from("channels").select("id").order("sort").limit(1);
  return first?.[0]?.id ?? "";
}

// ── Follows (mock-only for the MVP) ────────────────────────────────────────
export function isFollowing(id: string): boolean {
  return store.isFollowing(id);
}

export function toggleFollow(id: string): boolean {
  return store.toggleFollow(id);
}

// ── Single member lookup (for profile pages) ───────────────────────────────
export async function getMember(id: string): Promise<Member | null> {
  const map = await getProfileMap();
  return map[id] ?? null;
}
