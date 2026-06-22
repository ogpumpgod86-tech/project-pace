// Core domain types for Project Pace.
// These mirror the Supabase schema in /supabase/schema.sql.

export type ActivityType =
  | "running"
  | "walking"
  | "cycling"
  | "hiking"
  | "crossfit"
  | "triathlon";

export interface Community {
  id: string;
  name: string;
  handle: string;
  type: ActivityType;
  tagline: string;
  city: string;
  memberCount: number;
  cover: string;
  avatar: string;
  accent: string; // hex used for subtle theming
}

export interface Member {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: "owner" | "admin" | "member";
  bio: string;
  joined: string; // ISO date
  badges: string[]; // badge ids
  stats: {
    totalMiles: number;
    weeklyMiles: number;
    runs: number;
    eventsAttended: number;
    streak: number; // weeks
  };
}

export interface Post {
  id: string;
  authorId: string;
  createdAt: string; // ISO
  text: string;
  image?: string;
  kind: "update" | "pr" | "race" | "workout" | "question";
  stat?: { label: string; value: string }[];
  likes: number;
  liked?: boolean;
  comments: Comment[];
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date (yyyy-mm-dd)
  time: string; // "06:30"
  location: string;
  distance: string; // "5 km"
  difficulty: "Easy" | "Moderate" | "Hard";
  hostId: string;
  attendees: string[]; // member ids
  capacity: number;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  kind: "community" | "event" | "dm";
  description?: string;
  unread: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  tier: "bronze" | "silver" | "gold";
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  metric: string; // "miles" | "events" | "workouts"
  goal: number;
  progress: number; // current user progress
  reward: string;
  endsIn: string; // human label
  participants: number;
}

export interface LeaderRow {
  memberId: string;
  value: number;
  unit: string;
}
