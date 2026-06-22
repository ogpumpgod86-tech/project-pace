"use client";

import { useRef, useState } from "react";
import type { Member } from "@/lib/types";

export default function EditProfileModal({
  member,
  onSave,
  onClose,
}: {
  member: Member;
  onSave: (patch: { name: string; bio: string; avatar: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(member.name);
  const [bio, setBio] = useState(member.bio);
  const [avatar, setAvatar] = useState(member.avatar);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div className="card w-full max-w-md animate-fade-up p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Edit profile</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-slate-400">✕</button>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <img src={avatar} alt="" className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/10" />
          <button onClick={() => fileRef.current?.click()} className="btn-ghost text-xs">
            Change photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-medium text-slate-400">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>

        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-medium text-slate-400">Bio</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={() => onSave({ name: name.trim() || member.name, bio: bio.trim(), avatar })}
            className="btn-primary flex-1"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
