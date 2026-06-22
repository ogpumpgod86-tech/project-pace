"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import TopBar from "@/components/TopBar";
import type { Member, Post } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { createPost, getPosts, getProfileMap, likePost, type ProfileMap } from "@/lib/db";

const kindLabel: Record<Post["kind"], { label: string; cls: string }> = {
  pr: { label: "🏅 Personal Record", cls: "bg-gold/15 text-gold" },
  race: { label: "🏁 Race Result", cls: "bg-flame/15 text-flame" },
  workout: { label: "💪 Workout", cls: "bg-brand/15 text-brand-400" },
  question: { label: "❓ Question", cls: "bg-accent/15 text-accent" },
  update: { label: "📝 Update", cls: "bg-white/10 text-slate-300" },
};

const unknownMember = (id: string): Member => ({
  id,
  name: "Member",
  handle: "member",
  avatar: `https://i.pravatar.cc/200?u=${id}`,
  role: "member",
  bio: "",
  joined: "",
  badges: [],
  stats: { totalMiles: 0, weeklyMiles: 0, runs: 0, eventsAttended: 0, streak: 0 },
});

export default function FeedPage() {
  const { profileId } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [draftImage, setDraftImage] = useState<string | undefined>(undefined);
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
    // Persist once, outside the state updater (updaters may run twice in dev).
    likePost(id, likes, liked);
    setPosts((list) => list.map((p) => (p.id === id ? { ...p, liked, likes } : p)));
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraftImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const publish = async () => {
    const text = draft.trim();
    if ((!text && !draftImage) || !profileId) return;
    setDraft("");
    const image = draftImage;
    setDraftImage(undefined);
    const saved = await createPost({ authorId: profileId, text, image });
    const newPost: Post =
      saved ?? {
        id: `p_${Date.now()}`,
        authorId: profileId,
        createdAt: new Date().toISOString(),
        kind: "update",
        text,
        image,
        likes: 0,
        comments: [],
      };
    setPosts((p) => [newPost, ...p]);
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
              <IconBtn label="Stats">📊</IconBtn>
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
              <PostCard key={post.id} post={post} who={who} onLike={() => toggleLike(post.id)} />
            ))}
          </div>
        )}
      </main>
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

function PostCard({ post, who, onLike }: { post: Post; who: (id: string) => Member; onLike: () => void }) {
  const author = who(post.authorId);
  const [showComments, setShowComments] = useState(false);
  const meta = kindLabel[post.kind];

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
        <span className={`pill ${meta.cls}`}>{meta.label}</span>
      </div>

      <p className="px-3 pb-3 text-[15px] leading-relaxed text-slate-200">{post.text}</p>

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
