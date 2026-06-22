"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import BadgeGrid from "@/components/BadgeGrid";
import EditProfileModal from "@/components/EditProfileModal";
import FollowListModal from "@/components/FollowListModal";
import { activeCommunityId, communities, badges as allBadges } from "@/lib/mockData";
import {
  awardedPoints,
  getFollowers,
  getFollowing,
  getMember,
  getPosts,
  getProfileMap,
  likedPostIds,
  updateProfile,
  type ProfileMap,
} from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { basePoints, rankFor } from "@/lib/points";
import type { Member, Post } from "@/lib/types";
import { timeAgo } from "@/lib/format";

type Tab = "posts" | "likes" | "comments";

export default function ProfilePage() {
  const router = useRouter();
  const { profileId, signOut } = useAuth();
  const community = communities.find((c) => c.id === activeCommunityId)!;

  const [member, setMember] = useState<Member | null>(null);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [tab, setTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [list, setList] = useState<{ title: string; ids: string[] } | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!profileId) return;
    let on = true;
    Promise.all([getMember(profileId), getPosts(), getProfileMap()]).then(([m, posts, map]) => {
      if (!on) return;
      setMember(m);
      setAllPosts(posts);
      setProfiles(map);
      setFollowers(getFollowers(profileId));
      setFollowing(getFollowing(profileId));
      setLiked(likedPostIds());
      setPoints((m ? basePoints(m) : 0) + awardedPoints(profileId));
    });
    return () => {
      on = false;
    };
  }, [profileId, reload]);

  const who = (id: string) => profiles[id];

  if (!member) {
    return (
      <div>
        <TopBar title="Profile" />
        <div className="px-4 py-6"><div className="card h-40 animate-pulse" /></div>
      </div>
    );
  }

  const myPosts = allPosts.filter((p) => p.authorId === profileId);
  const likedPosts = allPosts.filter((p) => liked.includes(p.id));
  const myComments = allPosts.flatMap((p) =>
    p.comments.filter((c) => c.authorId === profileId).map((c) => ({ post: p, comment: c }))
  );
  const rank = rankFor(points);

  const saveProfile = (patch: { name: string; bio: string; avatar: string }) => {
    updateProfile(member.id, patch);
    setEditing(false);
    setReload((r) => r + 1);
  };

  return (
    <div className="animate-fade-up">
      <TopBar title="Profile" />

      <main className="pb-4">
        <div className="relative">
          <img src={community.cover} alt="" className="h-32 w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
          <div className="absolute -bottom-10 left-4 flex items-end gap-3">
            <img src={member.avatar} alt="" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-ink-950" />
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            className="absolute right-4 top-3 grid h-9 w-9 place-items-center rounded-xl bg-black/40 text-slate-200 backdrop-blur"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path strokeLinecap="round" d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.7 1.7 0 008.5 19a1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H2a2 2 0 110-4h.1A1.7 1.7 0 004 8.5a1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H8.5a1.7 1.7 0 001-1.5V2a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9v.1a1.7 1.7 0 001.5 1H22a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
            </svg>
          </button>
        </div>

        <div className="mt-12 px-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{member.name}</h1>
              <p className="text-sm text-slate-400">@{member.handle} · {community.name}</p>
            </div>
            <button onClick={() => setEditing(true)} className="btn-ghost text-xs">Edit</button>
          </div>

          {/* Follower / following counts */}
          <div className="mt-3 flex gap-5">
            <button onClick={() => setList({ title: "Following", ids: following })} className="text-sm">
              <span className="font-bold text-white">{following.length}</span> <span className="text-slate-400">Following</span>
            </button>
            <button onClick={() => setList({ title: "Followers", ids: followers })} className="text-sm">
              <span className="font-bold text-white">{followers.length}</span> <span className="text-slate-400">Followers</span>
            </button>
          </div>

          {member.bio && <p className="mt-2 text-sm text-slate-300">{member.bio}</p>}

          {/* Rank + points */}
          <div className="card mt-4 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{rank.current.icon}</span>
                <div>
                  <p className="font-semibold text-white">{rank.current.name}</p>
                  <p className="text-xs text-slate-400">{points.toLocaleString()} points</p>
                </div>
              </div>
              <Link href="/challenges" className="text-xs font-medium text-brand-400">How points work</Link>
            </div>
            {rank.next && (
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${rank.progress}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {(rank.next.min - points).toLocaleString()} pts to {rank.next.icon} {rank.next.name}
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            <Stat value={member.stats.totalMiles} label="Miles" />
            <Stat value={member.stats.runs} label="Runs" />
            <Stat value={member.stats.eventsAttended} label="Events" />
            <Stat value={member.stats.streak} label="Streak" />
          </div>

          {/* Badges */}
          <section className="mt-6">
            <h2 className="section-title">Badges ({member.badges.length}/{allBadges.length})</h2>
            <BadgeGrid earned={member.badges} />
          </section>

          {/* Quick links */}
          <section className="mt-6 grid grid-cols-3 gap-3">
            <Link href="/leaderboard" className="card p-4 text-center">
              <p className="text-2xl">🏆</p>
              <p className="mt-1 text-xs font-semibold text-white">Leaderboards</p>
            </Link>
            <Link href="/challenges" className="card p-4 text-center">
              <p className="text-2xl">🎯</p>
              <p className="mt-1 text-xs font-semibold text-white">Challenges</p>
            </Link>
            <Link href="/owner" className="card p-4 text-center">
              <p className="text-2xl">📊</p>
              <p className="mt-1 text-xs font-semibold text-white">Owner</p>
            </Link>
          </section>

          {/* Activity history */}
          <section className="mt-6">
            <h2 className="section-title">Activity</h2>
            <div className="mt-2 flex rounded-xl bg-white/5 p-1 text-xs font-medium">
              {(["posts", "likes", "comments"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg py-1.5 capitalize transition ${tab === t ? "bg-brand text-white" : "text-slate-400"}`}
                >
                  {t} ({t === "posts" ? myPosts.length : t === "likes" ? likedPosts.length : myComments.length})
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-2.5">
              {tab === "posts" &&
                (myPosts.length ? myPosts.map((p) => <PostRow key={p.id} post={p} />) : <Empty>No posts yet.</Empty>)}

              {tab === "likes" &&
                (likedPosts.length
                  ? likedPosts.map((p) => (
                      <div key={p.id} className="card p-3">
                        <p className="text-xs text-slate-500">❤️ liked {who(p.authorId)?.name ?? "a member"}&apos;s post</p>
                        <p className="mt-0.5 text-sm text-slate-200">{p.text}</p>
                      </div>
                    ))
                  : <Empty>No liked posts yet.</Empty>)}

              {tab === "comments" &&
                (myComments.length
                  ? myComments.map(({ post, comment }) => (
                      <div key={comment.id} className="card p-3">
                        <p className="text-xs text-slate-500">💬 on {who(post.authorId)?.name ?? "a member"}&apos;s post</p>
                        <p className="mt-0.5 text-sm text-slate-200">{comment.text}</p>
                        <p className="mt-1 text-xs text-slate-500">{timeAgo(comment.createdAt)}</p>
                      </div>
                    ))
                  : <Empty>No comments yet.</Empty>)}
            </div>
          </section>
        </div>
      </main>

      {editing && <EditProfileModal member={member} onSave={saveProfile} onClose={() => setEditing(false)} />}

      {list && (
        <FollowListModal title={list.title} ids={list.ids} resolve={who} onClose={() => setList(null)} />
      )}

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" onClick={() => setSettingsOpen(false)}>
          <div className="card w-full max-w-md animate-fade-up p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Settings</h3>
              <button onClick={() => setSettingsOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-slate-400">✕</button>
            </div>
            <div className="mt-4 space-y-2">
              <button onClick={() => { setSettingsOpen(false); setEditing(true); }} className="btn-ghost w-full justify-start">✏️ Edit profile</button>
              <Link href="/challenges" onClick={() => setSettingsOpen(false)} className="btn-ghost w-full justify-start">🎯 How points work</Link>
              <button
                onClick={async () => { await signOut(); router.push("/login"); }}
                className="btn-ghost w-full justify-start text-flame"
              >
                🚪 Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="card p-2.5 text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

function PostRow({ post }: { post: Post }) {
  return (
    <div className="card p-3">
      <p className="text-sm text-slate-200">{post.text}</p>
      {post.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image} alt="" className="mt-2 max-h-48 w-full rounded-lg object-cover" />
      )}
      <p className="mt-1 text-xs text-slate-500">{timeAgo(post.createdAt)} · ❤️ {post.likes} · 💬 {post.comments.length}</p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-3 text-sm text-slate-500">{children}</p>;
}
