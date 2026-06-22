"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function SignOutButton() {
  const router = useRouter();
  const { signOut } = useAuth();
  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/login");
      }}
      className="card w-full p-4 text-center"
    >
      <p className="text-2xl">🚪</p>
      <p className="mt-1 text-sm font-semibold text-white">Sign out</p>
    </button>
  );
}
