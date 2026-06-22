import type {
  Badge,
  Challenge,
  ChatChannel,
  ChatMessage,
  Community,
  EventItem,
  LeaderRow,
  Member,
  Post,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers to keep relative dates feeling fresh whenever the demo is opened.
// ---------------------------------------------------------------------------
const now = new Date();
const iso = (d: Date) => d.toISOString();
const daysFromNow = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d;
};
const hoursAgo = (n: number) => {
  const d = new Date(now);
  d.setHours(d.getHours() - n);
  return iso(d);
};
const dateStr = (n: number) => daysFromNow(n).toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// Communities (multi-community support)
// ---------------------------------------------------------------------------
export const communities: Community[] = [
  {
    id: "c_tampa",
    name: "Tampa Running Club",
    handle: "tamparun",
    type: "running",
    tagline: "Miles of smiles since 2019",
    city: "Tampa, FL",
    memberCount: 428,
    cover:
      "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=900&q=70",
    avatar:
      "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=200&q=70",
    accent: "#6d5efc",
    distanceMi: 1.2,
  },
  {
    id: "c_downtown",
    name: "Downtown Running Group",
    handle: "downtownrun",
    type: "running",
    tagline: "City streets. Sunrise pace.",
    city: "Tampa, FL",
    memberCount: 196,
    cover:
      "https://images.unsplash.com/photo-1483721310020-03333e577078?w=900&q=70",
    avatar:
      "https://images.unsplash.com/photo-1486218119243-13883505764c?w=200&q=70",
    accent: "#22e0a1",
    distanceMi: 2.8,
  },
  {
    id: "c_crossfit",
    name: "CrossFit Warriors",
    handle: "cfwarriors",
    type: "crossfit",
    tagline: "Stronger together, every WOD",
    city: "St. Pete, FL",
    memberCount: 311,
    cover:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=70",
    avatar:
      "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=200&q=70",
    accent: "#ff7a45",
    distanceMi: 14.5,
  },
  {
    id: "c_cycling",
    name: "Cycling Crew",
    handle: "cyclingcrew",
    type: "cycling",
    tagline: "Two wheels, one squad",
    city: "Clearwater, FL",
    memberCount: 254,
    cover:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900&q=70",
    avatar:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&q=70",
    accent: "#ffc24b",
    distanceMi: 22.0,
  },
  {
    id: "c_boxing",
    name: "Bay Area Boxing Club",
    handle: "bayboxing",
    type: "boxing",
    tagline: "Footwork, fitness, and heart",
    city: "Tampa, FL",
    memberCount: 142,
    cover: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=900&q=70",
    avatar: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=200&q=70",
    accent: "#ef4444",
    distanceMi: 3.4,
  },
  {
    id: "c_hiking",
    name: "Gulf Coast Hikers",
    handle: "gulfhikers",
    type: "hiking",
    tagline: "Trails, summits, and good company",
    city: "Brandon, FL",
    memberCount: 188,
    cover: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=900&q=70",
    avatar: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=200&q=70",
    accent: "#16a34a",
    distanceMi: 9.1,
  },
  {
    id: "c_walking",
    name: "Sunset Walkers",
    handle: "sunsetwalk",
    type: "walking",
    tagline: "Steps, sunsets, and friends",
    city: "St. Pete, FL",
    memberCount: 97,
    cover: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=900&q=70",
    avatar: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=200&q=70",
    accent: "#f59e0b",
    distanceMi: 12.6,
  },
  {
    id: "c_tri",
    name: "Suncoast Triathletes",
    handle: "suncoasttri",
    type: "triathlon",
    tagline: "Swim. Bike. Run. Repeat.",
    city: "Sarasota, FL",
    memberCount: 173,
    cover: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=900&q=70",
    avatar: "https://images.unsplash.com/photo-1486218119243-13883505764c?w=200&q=70",
    accent: "#0ea5e9",
    distanceMi: 31.2,
  },
];

// The community the demo "logs in" to.
export const activeCommunityId = "c_tampa";

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------
const av = (n: number) => `https://i.pravatar.cc/200?img=${n}`;

export const members: Member[] = [
  {
    id: "m_you",
    name: "Alex Rivera",
    handle: "alexr",
    avatar: av(12),
    role: "member",
    bio: "Marathon hopeful 🏃 | 5:00 AM club | chasing a sub-25 5K",
    joined: "2023-04-12",
    badges: ["b_first", "b_10runs", "b_50mi", "b_consistency"],
    stats: { totalMiles: 642, weeklyMiles: 23.4, runs: 148, eventsAttended: 37, streak: 11 },
  },
  {
    id: "m_jordan",
    name: "Jordan Blake",
    handle: "jblake",
    avatar: av(33),
    role: "owner",
    bio: "Founder of Tampa Running Club. Coffee then cardio.",
    joined: "2019-01-08",
    badges: ["b_first", "b_100mi", "b_leader", "b_top"],
    stats: { totalMiles: 1820, weeklyMiles: 31.2, runs: 402, eventsAttended: 121, streak: 28 },
  },
  {
    id: "m_sam",
    name: "Sam Carter",
    handle: "samc",
    avatar: av(5),
    role: "admin",
    bio: "Trail lover. Will run for tacos.",
    joined: "2020-06-21",
    badges: ["b_first", "b_100mi", "b_consistency"],
    stats: { totalMiles: 1340, weeklyMiles: 28.7, runs: 310, eventsAttended: 98, streak: 19 },
  },
  {
    id: "m_priya",
    name: "Priya Nair",
    handle: "priyaruns",
    avatar: av(45),
    role: "member",
    bio: "Half-marathon PR 1:42. Negative splits or nothing.",
    joined: "2022-02-15",
    badges: ["b_first", "b_50mi", "b_top"],
    stats: { totalMiles: 905, weeklyMiles: 34.1, runs: 220, eventsAttended: 64, streak: 14 },
  },
  {
    id: "m_diego",
    name: "Diego Santos",
    handle: "diegos",
    avatar: av(15),
    role: "member",
    bio: "Slow is smooth, smooth is fast.",
    joined: "2023-09-03",
    badges: ["b_first", "b_10runs"],
    stats: { totalMiles: 288, weeklyMiles: 18.9, runs: 76, eventsAttended: 22, streak: 6 },
  },
  {
    id: "m_mia",
    name: "Mia Thompson",
    handle: "miat",
    avatar: av(20),
    role: "member",
    bio: "New to running, loving the crew already 💜",
    joined: "2024-11-19",
    badges: ["b_first"],
    stats: { totalMiles: 64, weeklyMiles: 12.3, runs: 21, eventsAttended: 9, streak: 4 },
  },
  {
    id: "m_omar",
    name: "Omar Haddad",
    handle: "omarh",
    avatar: av(52),
    role: "member",
    bio: "Sprinter trapped in a distance runner's body.",
    joined: "2021-08-30",
    badges: ["b_first", "b_50mi", "b_consistency"],
    stats: { totalMiles: 712, weeklyMiles: 26.0, runs: 198, eventsAttended: 71, streak: 9 },
  },
  {
    id: "m_lena",
    name: "Lena Petrova",
    handle: "lenap",
    avatar: av(31),
    role: "member",
    bio: "Ultra in training. The longer the better.",
    joined: "2020-12-11",
    badges: ["b_first", "b_100mi", "b_top", "b_consistency"],
    stats: { totalMiles: 1490, weeklyMiles: 41.8, runs: 355, eventsAttended: 88, streak: 22 },
  },
];

export const youId = "m_you";

export const memberById = (id: string) =>
  members.find((m) => m.id === id) ?? members[0];

// ---------------------------------------------------------------------------
// Badges (gamification)
// ---------------------------------------------------------------------------
export const badges: Badge[] = [
  { id: "b_first", name: "First Run", description: "Logged your very first run", icon: "🎉", tier: "bronze" },
  { id: "b_10runs", name: "10 Runs", description: "Completed 10 runs", icon: "🔟", tier: "bronze" },
  { id: "b_50mi", name: "50 Miles", description: "Ran 50 total miles", icon: "🥾", tier: "silver" },
  { id: "b_100mi", name: "100 Miles", description: "Ran 100 total miles", icon: "💯", tier: "gold" },
  { id: "b_consistency", name: "Consistency King", description: "4+ week activity streak", icon: "👑", tier: "gold" },
  { id: "b_top", name: "Top Performer", description: "Reached the top 3 of a leaderboard", icon: "🏆", tier: "gold" },
  { id: "b_leader", name: "Community Leader", description: "Hosted 10+ events", icon: "🚩", tier: "gold" },
];

export const badgeById = (id: string) =>
  badges.find((b) => b.id === id) ?? badges[0];

// ---------------------------------------------------------------------------
// Posts (community feed)
// ---------------------------------------------------------------------------
export const posts: Post[] = [
  {
    id: "p1",
    authorId: "m_priya",
    createdAt: hoursAgo(2),
    kind: "pr",
    text: "New 5K PR this morning — 23:51! Those Tuesday speed sessions are paying off 🔥",
    stat: [
      { label: "Distance", value: "5.0 km" },
      { label: "Pace", value: "4:46 /km" },
      { label: "Time", value: "23:51" },
    ],
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=70",
    likes: 47,
    liked: true,
    comments: [
      { id: "cm1", authorId: "m_jordan", text: "Let's gooo 🚀", createdAt: hoursAgo(1) },
      { id: "cm2", authorId: "m_you", text: "Incredible pace!", createdAt: hoursAgo(1) },
    ],
  },
  {
    id: "p2",
    authorId: "m_mia",
    createdAt: hoursAgo(5),
    kind: "update",
    text: "Ran 5 miles before work today. Two months ago I couldn't do one. This community is everything 💜",
    likes: 62,
    comments: [
      { id: "cm3", authorId: "m_sam", text: "So proud of you Mia!", createdAt: hoursAgo(4) },
    ],
  },
  {
    id: "p3",
    authorId: "m_diego",
    createdAt: hoursAgo(9),
    kind: "question",
    text: "Anyone running downtown tonight? Looking for an easy 6 around 7pm 🌆",
    likes: 14,
    comments: [
      { id: "cm4", authorId: "m_omar", text: "I'm in. Meet at the pier?", createdAt: hoursAgo(8) },
    ],
  },
  {
    id: "p4",
    authorId: "m_lena",
    createdAt: hoursAgo(26),
    kind: "race",
    text: "Finished my first 50K ultra at Croom this weekend 🏔️ Brutal, beautiful, and worth every step.",
    stat: [
      { label: "Distance", value: "50 km" },
      { label: "Elevation", value: "1,240 ft" },
      { label: "Time", value: "5:58:12" },
    ],
    image:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=70",
    likes: 134,
    comments: [
      { id: "cm5", authorId: "m_priya", text: "Absolute legend 👏", createdAt: hoursAgo(25) },
      { id: "cm6", authorId: "m_you", text: "Goals. Pure goals.", createdAt: hoursAgo(24) },
    ],
  },
  {
    id: "p5",
    authorId: "m_omar",
    createdAt: hoursAgo(40),
    kind: "workout",
    text: "Track night summary: 8 x 400m. Lungs on fire but splits were dialed.",
    stat: [
      { label: "Reps", value: "8 x 400m" },
      { label: "Avg", value: "1:28" },
    ],
    likes: 29,
    comments: [],
  },
];

// ---------------------------------------------------------------------------
// Events & calendar
// ---------------------------------------------------------------------------
export const events: EventItem[] = [
  {
    id: "e1",
    title: "5K Community Run",
    description: "Easy-paced social 5K along Bayshore. All paces welcome, no one left behind.",
    date: dateStr(1),
    time: "06:30",
    location: "Bayshore Blvd Trailhead",
    distance: "5 km",
    difficulty: "Easy",
    hostId: "m_jordan",
    attendees: ["m_you", "m_priya", "m_mia", "m_diego", "m_omar"],
    capacity: 40,
  },
  {
    id: "e2",
    title: "Speed Training",
    description: "Track intervals: 6 x 800m at 5K effort. Bring water and your A-game.",
    date: dateStr(3),
    time: "18:00",
    location: "Hillsborough HS Track",
    distance: "Intervals",
    difficulty: "Hard",
    hostId: "m_sam",
    attendees: ["m_priya", "m_omar", "m_lena"],
    capacity: 25,
  },
  {
    id: "e3",
    title: "Long Distance Run",
    description: "Saturday long run. 12 miles with two water stops. Coffee after at Buddy Brew.",
    date: dateStr(5),
    time: "07:00",
    location: "Davis Islands Loop",
    distance: "12 mi",
    difficulty: "Moderate",
    hostId: "m_jordan",
    attendees: ["m_you", "m_lena", "m_sam", "m_priya", "m_omar", "m_mia"],
    capacity: 60,
  },
  {
    id: "e4",
    title: "Sunrise Recovery Walk",
    description: "Active recovery walk + mobility. Great for rest days.",
    date: dateStr(8),
    time: "06:45",
    location: "Curtis Hixon Park",
    distance: "3 mi",
    difficulty: "Easy",
    hostId: "m_sam",
    attendees: ["m_mia", "m_diego"],
    capacity: 30,
  },
  {
    id: "e5",
    title: "Tempo Tuesday",
    description: "Progressive tempo run. Start easy, finish at threshold.",
    date: dateStr(10),
    time: "18:30",
    location: "Riverwalk Start",
    distance: "8 km",
    difficulty: "Moderate",
    hostId: "m_omar",
    attendees: ["m_you", "m_priya", "m_omar"],
    capacity: 35,
  },
];

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------
export const channels: ChatChannel[] = [
  { id: "ch_main", name: "# general", kind: "community", description: "Tampa Running Club main chat", unread: 3 },
  { id: "ch_event_e1", name: "# 5k-community-run", kind: "event", description: "Event chat for tomorrow's 5K", unread: 1 },
  { id: "ch_event_e3", name: "# long-run-crew", kind: "event", description: "Saturday long run logistics", unread: 0 },
  { id: "ch_dm_jordan", name: "Jordan Blake", kind: "dm", unread: 2 },
  { id: "ch_dm_priya", name: "Priya Nair", kind: "dm", unread: 0 },
];

export const messages: ChatMessage[] = [
  { id: "x1", channelId: "ch_main", authorId: "m_jordan", text: "Morning crew! Who's running tonight? 🏃", createdAt: hoursAgo(6) },
  { id: "x2", channelId: "ch_main", authorId: "m_omar", text: "I'm in. Meeting at 6:30 by the fountain.", createdAt: hoursAgo(5) },
  { id: "x3", channelId: "ch_main", authorId: "m_mia", text: "Can a beginner tag along? 😅", createdAt: hoursAgo(5) },
  { id: "x4", channelId: "ch_main", authorId: "m_sam", text: "Always! We've got a no-drop policy 💪", createdAt: hoursAgo(4) },
  { id: "x5", channelId: "ch_main", authorId: "m_you", text: "Let's do an extra mile after, who's in?", createdAt: hoursAgo(3) },
  { id: "x6", channelId: "ch_main", authorId: "m_priya", text: "Count me in for the extra mile 🔥", createdAt: hoursAgo(2) },

  { id: "x7", channelId: "ch_event_e1", authorId: "m_jordan", text: "Reminder: 5K kicks off 6:30 sharp tomorrow at Bayshore.", createdAt: hoursAgo(8) },
  { id: "x8", channelId: "ch_event_e1", authorId: "m_diego", text: "Parking by the trailhead or the lot down the street?", createdAt: hoursAgo(7) },
  { id: "x9", channelId: "ch_event_e1", authorId: "m_jordan", text: "Lot down the street is free before 8am 👍", createdAt: hoursAgo(7) },

  { id: "x10", channelId: "ch_event_e3", authorId: "m_sam", text: "Two water stops planned for Saturday. Bring a handheld just in case.", createdAt: hoursAgo(20) },

  { id: "x11", channelId: "ch_dm_jordan", authorId: "m_jordan", text: "Hey Alex, want to help pace the beginner group Saturday?", createdAt: hoursAgo(10) },
  { id: "x12", channelId: "ch_dm_jordan", authorId: "m_jordan", text: "You'd be perfect for it 🙌", createdAt: hoursAgo(10) },

  { id: "x13", channelId: "ch_dm_priya", authorId: "m_priya", text: "Great running with you today!", createdAt: hoursAgo(30) },
  { id: "x14", channelId: "ch_dm_priya", authorId: "m_you", text: "Likewise! Same time Thursday?", createdAt: hoursAgo(29) },
];

// ---------------------------------------------------------------------------
// Leaderboards
// ---------------------------------------------------------------------------
export type LeaderboardKey =
  | "weeklyMiles"
  | "monthlyMiles"
  | "attendance"
  | "consistency";

export const leaderboardMeta: Record<
  LeaderboardKey,
  { title: string; unit: string; subtitle: string }
> = {
  weeklyMiles: { title: "Weekly Miles", unit: "mi", subtitle: "This week" },
  monthlyMiles: { title: "Monthly Miles", unit: "mi", subtitle: "This month" },
  attendance: { title: "Most Events Attended", unit: "events", subtitle: "All time" },
  consistency: { title: "Most Consistent", unit: "wk streak", subtitle: "Active streak" },
};

export function leaderboard(key: LeaderboardKey): LeaderRow[] {
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
  return [...members]
    .map((m) => ({ memberId: m.id, value: pick(m), unit: leaderboardMeta[key].unit }))
    .sort((a, b) => b.value - a.value);
}

// ---------------------------------------------------------------------------
// Challenges
// ---------------------------------------------------------------------------
export const challenges: Challenge[] = [
  {
    id: "ch1",
    title: "Run 20 Miles This Week",
    description: "Log 20 miles before Sunday night and earn the Weekly Warrior badge.",
    metric: "miles",
    goal: 20,
    progress: 14,
    reward: "+150 pts · Weekly Warrior badge",
    endsIn: "3 days left",
    participants: 86,
  },
  {
    id: "ch2",
    title: "Attend 3 Events This Month",
    description: "Show up for the community. Three events and the points are yours.",
    metric: "events",
    goal: 3,
    progress: 2,
    reward: "+100 pts",
    endsIn: "12 days left",
    participants: 54,
  },
  {
    id: "ch3",
    title: "Complete 10 Workouts",
    description: "Any logged activity counts. Consistency is the challenge.",
    metric: "workouts",
    goal: 10,
    progress: 7,
    reward: "+200 pts · Consistency badge",
    endsIn: "9 days left",
    participants: 41,
  },
];

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------
export const announcements = [
  {
    id: "a1",
    authorId: "m_jordan",
    title: "New club singlets are in! 🎽",
    body: "Pick up your singlet at Saturday's long run. $25, all sizes available.",
    createdAt: hoursAgo(12),
  },
  {
    id: "a2",
    authorId: "m_sam",
    title: "Route change for Tempo Tuesday",
    body: "We're moving the start to the Riverwalk for better lighting. See the event for details.",
    createdAt: hoursAgo(34),
  },
];

// ---------------------------------------------------------------------------
// Owner analytics (simple, mock)
// ---------------------------------------------------------------------------
export const ownerAnalytics = {
  totalMembers: 428,
  activeMembers: 263,
  newThisMonth: 31,
  avgEventAttendance: 24,
  engagementRate: 0.62,
  weeklyActive: [120, 145, 138, 162, 171, 158, 189], // last 7 weeks
  attendanceByEvent: [
    { label: "5K Run", value: 38 },
    { label: "Speed", value: 19 },
    { label: "Long Run", value: 31 },
    { label: "Recovery", value: 12 },
    { label: "Tempo", value: 22 },
  ],
};
