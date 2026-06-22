"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import BadgeGrid from "@/components/BadgeGrid";
import FollowListModal from "@/components/FollowListModal";
import { activeCommunityId, communities, badges as allBadges } from "@/lib/mockData";
import {
  awardedPoints,
  getFollowers,
  getFollowing,
  getMember,
  getPosts,
  getProfileMap,
  isFollowing,
  toggleFollow,
  type ProfileMap,
} from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { basePoints, rankFor } from "@/lib/points";
import type { Member, Post } from "@/lib/types";
import { timeAgo } from "@/lib/format";

export default function MemberProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { profileId } = useAuth();
  const community = communities.find((c) => c.id === activeCommunityId)!;

  const [member, setMember] = useState<Member | null>(null);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followsYou, setFollowsYou] = useState(false);
  const [followers, setFollowers] = useState<string[]>([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [list, setList] = useState<{ title: string; ids: string[] } | null>(null);

  useEffect(() => {
    let on = true;
    Promise.all([getMember(id), getPosts(), getProfileMap()]).then(([m, all, map]) => {
      if (!on) return;
      setMember(m);
      setProfiles(map);
      setPosts(all.filter((p) => p.authorId === id));
      setFollowers(getFollowers(id));
      setFollowingList(getFollowing(id));
      if (profileId) {
        setFollowing(isFollowing(profileId, id));
        setFollowsYou(isFollowing(id, profileId));
      }
      setLoading(false);
    });
    return () => {
      on = false;
    };
  }, [id, profileId]);

  const who = (m: string) => profiles[m];
  const isYou = profileId === id;

  if (loading) {
    return (
      <div>
        <TopBar title="Profile" />
        <div className="px-4 py-6"><div className="card h-40 animate-pulse" /></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div>
        <TopBar title="Profile" />
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <p className="text-2xl">🤔</p>
          <p className="mt-2 text-sm text-slate-400">We couldn&apos;t find that member.</p>
          <Link href="/leaderboard" className="btn-ghost mt-4">Back to leaderboard</Link>
        </div>
      </div>
    );
  }

  const onFollow = () => {
    if (!profileId) return;
    const nowFollowing = toggleFollow(profileId, id);
    setFollowing(nowFollowing);
    setFollowers(getFollowers(id)); // count reflects the change immediately
  };

  const points = basePoints(member) + awardedPoints(id);
  const rank = rankFor(points);

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
        </div>

        <div className="mt-12 px-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{member.name}</h1>
                {followsYou && !isYou && <span className="pill bg-white/10 text-slate-300">Follows you</span>}
              </div>
              <p className="text-sm text-slate-400">@{member.handle} · {community.name}</p>
            </div>
            {isYou ? (
              <Link href="/profile" className="btn-ghost text-xs">Your profile</Link>
            ) : (
              <button onClick={onFollow} className={following ? "btn-ghost text-accent" : "btn-primary"}>
                {following ? "✓ Following" : "Follow"}
              </button>
            )}
          </div>

          {/* Follower / following counts */}
          <div className="mt-3 flex gap-5">
            <button onClick={() => setList({ title: "Following", ids: followingList })} className="text-sm">
              <span className="font-bold text-white">{followingList.length}</span> <span className="text-slate-400">Following</span>
            </button>
            <button onClick={() => setList({ title: "Followers", ids: followers })} className="text-sm">
              <span className="font-bold text-white">{followers.length}</span> <span className="text-slate-400">Followers</span>
            </button>
          </div>

          {member.bio && <p className="mt-2 text-sm text-slate-300">{member.bio}</p>}

          {/* Rank + points */}
          <div className="card mt-4 flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{rank.current.icon}</span>
              <div>
                <p className="font-semibold text-white">{rank.current.name}</p>
                <p className="text-xs text-slate-400">{points.toLocaleString()} points</p>
              </div>
            </div>
            <Link href="/challenges" className="text-xs font-medium text-brand-400">How points work</Link>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <Stat value={member.stats.totalMiles} label="Miles" />
            <Stat value={member.stats.runs} label="Runs" />
            <Stat value={member.stats.eventsAttended} label="Events" />
            <Stat value={member.stats.streak} label="Streak" />
          </div>

          <section className="mt-6">
            <h2 className="section-title">Badges ({member.badges.length}/{allBadges.length})</h2>
            <BadgeGrid earned={member.badges} />
          </section>

          <section className="mt-6">
            <h2 className="section-title">Activity</h2>
            <div className="mt-3 space-y-2.5">
              {posts.length === 0 && <p className="text-sm text-slate-500">No posts yet.</p>}
              {posts.map((p) => (
                <div key={p.id} className="card p-3">
                  <p className="text-sm text-slate-200">{p.text}</p>
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="mt-2 max-h-48 w-full rounded-lg object-cover" />
                  )}
                  <p className="mt-1 text-xs text-slate-500">{timeAgo(p.createdAt)} · ❤️ {p.likes} · 💬 {p.comments.length}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {list && <FollowListModal title={list.title} ids={list.ids} resolve={who} onClose={() => setList(null)} />}
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
