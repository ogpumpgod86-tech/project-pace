"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import TopBar from "@/components/TopBar";
import type { Member, Post } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import {
  addComment as dbAddComment,
  createPost,
  deletePost as dbDeletePost,
  getPosts,
  getProfileMap,
  isFollowing,
  likePost,
  toggleFollow,
  type ProfileMap,
} from "@/lib/db";

const kindLabel: Record<Post["kind"], { label: string; cls: string }> = {
  pr: { label: "🏅 Personal Record", cls: "bg-gold/15 text-gold" },
  race: { label: "🏁 Race Result", cls: "bg-flame/15 text-flame" },
  workout: { label: "💪 Workout", cls: "bg-brand/15 text-brand-400" },
  question: { label: "❓ Question", cls: "bg-accent/15 text-accent" },
  update: { label: "📝 Update", cls: "bg-white/10 text-slate-300" },
};

const unknownMember = (id: string): Member => ({
  id, name: "Member", handle: "member", avatar: `https://i.pravatar.cc/200?u=${id}`,
  role: "member", bio: "", joined: "", badges: [],
  stats: { totalMiles: 0, weeklyMiles: 0, runs: 0, eventsAttended: 0, streak: 0 },
});

// Builds per-mile splits (seconds) around an average pace, for the run graph.
function buildSplits(miles: number, totalSeconds: number): number[] {
  const n = Math.max(1, Math.min(26, Math.round(miles)));
  const avg = totalSeconds / n;
  return Array.from({ length: n }, (_, i) => Math.round(avg * (0.94 + (((i * 7) % 5) / 40))));
}

function fmtPace(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function FeedPage() {
  const { profileId } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [draftImage, setDraftImage] = useState<string | undefined>(undefined);
  const [runOpen, setRunOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const who = (id: string) => profiles[id] ?? unknownMember(id);
  const you = profileId ? who(profileId) : unknownMember("you");

  useEffect(() => {
    let active = true;
    Promise.all([getPosts(), getProfileMap()]).then(([p, map]) => {
      if (!active) return;
      setPosts(p);
      setProfiles(map);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const toggleLike = (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const liked = !post.liked;
    const likes = post.likes + (liked ? 1 : -1);
    likePost(id, likes, liked);
    setPosts((list) => list.map((p) => (p.id === id ? { ...p, liked, likes } : p)));
  };

  const removePost = (id: string) => {
    dbDeletePost(id);
    setPosts((list) => list.filter((p) => p.id !== id));
  };

  const addComment = async (postId: string, text: string) => {
    if (!profileId) return;
    const c = await dbAddComment(postId, profileId, text);
    if (!c) return;
    setPosts((list) => list.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, c] } : p)));
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraftImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const prepend = async (input: Parameters<typeof createPost>[0]) => {
    const saved = await createPost(input);
    if (saved) setPosts((p) => [saved, ...p]);
  };

  const publish = async () => {
    const text = draft.trim();
    if ((!text && !draftImage) || !profileId) return;
    const image = draftImage;
    setDraft("");
    setDraftImage(undefined);
    await prepend({ authorId: profileId, text, image });
  };

  const publishRun = async (data: { miles: number; minutes: number; seconds: number; note: string }) => {
    if (!profileId) return;
    const totalSec = data.minutes * 60 + data.seconds;
    const paceSec = data.miles > 0 ? totalSec / data.miles : 0;
    const splits = buildSplits(data.miles, totalSec);
    await prepend({
      authorId: profileId,
      kind: "workout",
      text: data.note.trim() || `Logged a ${data.miles} mi run 🏃`,
      stat: [
        { label: "Distance", value: `${data.miles} mi` },
        { label: "Time", value: `${data.minutes}:${data.seconds.toString().padStart(2, "0")}` },
        { label: "Pace", value: `${fmtPace(paceSec)}/mi` },
      ],
      splits,
    });
    setRunOpen(false);
  };

  return (
    <div className="animate-fade-up">
      <TopBar title="Community Feed" />

      <main className="px-4 py-4">
        <div className="card mb-4 p-3">
          <div className="flex gap-3">
            <img src={you.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10" />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Share a run, a PR, or ask the crew…"
              rows={2}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {draftImage && (
            <div className="relative mt-2 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={draftImage} alt="" className="max-h-56 w-full object-cover" />
              <button
                onClick={() => setDraftImage(undefined)}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} className="hidden" />
          <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2">
            <div className="flex gap-1 text-slate-500">
              <IconBtn label="Photo" onClick={() => fileRef.current?.click()}>🖼️</IconBtn>
              <IconBtn label="Video" onClick={() => fileRef.current?.click()}>🎥</IconBtn>
              <IconBtn label="Run data" onClick={() => setRunOpen(true)}>📊</IconBtn>
            </div>
            <button onClick={publish} className="btn-primary px-4 py-1.5 text-xs disabled:opacity-40" disabled={!draft.trim() && !draftImage}>
              Post
            </button>
          </div>
        </div>

        {loading ? (
          <FeedSkeleton />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                who={who}
                profileId={profileId}
                you={you}
                onLike={() => toggleLike(post.id)}
                onDelete={() => removePost(post.id)}
                onComment={(t) => addComment(post.id, t)}
              />
            ))}
          </div>
        )}
      </main>

      {runOpen && <RunDataModal onSubmit={publishRun} onClose={() => setRunOpen(false)} />}
    </div>
  );
}

function RunDataModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (d: { miles: number; minutes: number; seconds: number; note: string }) => void;
  onClose: () => void;
}) {
  const [miles, setMiles] = useState("5");
  const [minutes, setMinutes] = useState("42");
  const [seconds, setSeconds] = useState("30");
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="card w-full max-w-md animate-fade-up p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Log a run 🏃</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-slate-400">✕</button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <NumField label="Miles" value={miles} onChange={setMiles} />
          <NumField label="Minutes" value={minutes} onChange={setMinutes} />
          <NumField label="Seconds" value={seconds} onChange={setSeconds} />
        </div>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-medium text-slate-400">Note (optional)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Felt great out there!"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>
        <button
          onClick={() =>
            onSubmit({
              miles: Math.max(0.1, Number(miles) || 0),
              minutes: Math.max(0, Number(minutes) || 0),
              seconds: Math.max(0, Number(seconds) || 0),
              note,
            })
          }
          className="btn-primary mt-5 w-full"
        >
          Post run
        </button>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-400">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </label>
  );
}

function SplitsGraph({ splits }: { splits: number[] }) {
  const max = Math.max(...splits);
  const min = Math.min(...splits);
  const range = Math.max(1, max - min);
  return (
    <div className="mx-3 mb-3 rounded-xl bg-white/5 p-3">
      <p className="mb-2 text-[10px] uppercase tracking-wide text-slate-500">Pace by mile</p>
      <div className="flex h-16 items-end gap-1">
        {splits.map((s, i) => {
          // faster (lower seconds) = taller bar
          const h = 30 + Math.round(((max - s) / range) * 70);
          return <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-brand to-accent" style={{ height: `${h}%` }} title={`Mile ${i + 1}: ${fmtPace(s)}`} />;
        })}
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-slate-500">
        <span>Mile 1</span>
        <span>Mile {splits.length}</span>
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card animate-pulse p-4">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-white/10" />
              <div className="h-3 w-2/3 rounded bg-white/10" />
            </div>
          </div>
          <div className="mt-3 h-24 rounded-xl bg-white/5" />
        </div>
      ))}
    </div>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} type="button" className="grid h-8 w-8 place-items-center rounded-lg text-base hover:bg-white/5" aria-label={label}>
      {children}
    </button>
  );
}

function PostCard({
  post,
  who,
  profileId,
  you,
  onLike,
  onDelete,
  onComment,
}: {
  post: Post;
  who: (id: string) => Member;
  profileId: string | null;
  you: Member;
  onLike: () => void;
  onDelete: () => void;
  onComment: (text: string) => void;
}) {
  const author = who(post.authorId);
  const [showComments, setShowComments] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [following, setFollowing] = useState(false);
  const meta = kindLabel[post.kind];
  const mine = profileId === post.authorId;

  useEffect(() => {
    if (profileId && !mine) setFollowing(isFollowing(profileId, post.authorId));
  }, [profileId, mine, post.authorId]);

  const onFollow = () => {
    if (!profileId) return;
    setFollowing(toggleFollow(profileId, post.authorId));
  };

  const submitComment = () => {
    const t = commentDraft.trim();
    if (!t) return;
    onComment(t);
    setCommentDraft("");
  };

  return (
    <article className="card overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <Link href={`/u/${author.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <img src={author.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{author.name}</p>
            <p className="text-xs text-slate-500">@{author.handle} · {timeAgo(post.createdAt)}</p>
          </div>
        </Link>
        {mine ? (
          <button onClick={onDelete} aria-label="Delete post" className="text-xs text-slate-500 hover:text-flame">🗑</button>
        ) : (
          <button onClick={onFollow} className={`text-xs font-semibold ${following ? "text-accent" : "text-brand-400"}`}>
            {following ? "Following" : "+ Follow"}
          </button>
        )}
      </div>

      {post.text && <p className="px-3 pb-3 text-[15px] leading-relaxed text-slate-200">{post.text}</p>}

      {post.stat && (
        <div className="mx-3 mb-3 grid grid-cols-3 divide-x divide-white/5 rounded-xl bg-white/5 py-3">
          {post.stat.map((s) => (
            <div key={s.label} className="px-2 text-center">
              <p className="text-sm font-bold text-white">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {post.splits && post.splits.length > 0 && <SplitsGraph splits={post.splits} />}

      {post.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image} alt="" className="max-h-80 w-full object-cover" />
      )}

      <div className="flex items-center gap-1 border-t border-white/5 px-2 py-1.5">
        <ActionBtn active={post.liked} onClick={onLike}>
          {post.liked ? "❤️" : "🤍"} {post.likes}
        </ActionBtn>
        <ActionBtn onClick={() => setShowComments((s) => !s)}>💬 {post.comments.length}</ActionBtn>
        <ActionBtn>↗️ Share</ActionBtn>
      </div>

      {showComments && (
        <div className="space-y-2 border-t border-white/5 bg-white/[0.02] p-3">
          {post.comments.length === 0 && <p className="text-xs text-slate-500">No comments yet. Be the first!</p>}
          {post.comments.map((c) => {
            const ca = who(c.authorId);
            return (
              <div key={c.id} className="flex gap-2">
                <img src={ca.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                <div className="rounded-2xl rounded-tl-sm bg-white/5 px-3 py-1.5">
                  <p className="text-xs font-semibold text-white">{ca.name}</p>
                  <p className="text-sm text-slate-300">{c.text}</p>
                </div>
              </div>
            );
          })}

          {/* Add comment */}
          <div className="flex items-center gap-2 pt-1">
            <img src={you.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
            <input
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="Add a comment…"
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-slate-600 focus:border-brand focus:outline-none"
            />
            <button onClick={submitComment} className="text-sm font-semibold text-brand-400 disabled:opacity-40" disabled={!commentDraft.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function ActionBtn({ children, onClick, active }: { children: React.ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition hover:bg-white/5 ${
        active ? "text-flame" : "text-slate-400"
      }`}
    >
      {children}
    </button>
  );
}
