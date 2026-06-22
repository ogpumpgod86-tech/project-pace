"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="relative flex min-h-screen flex-col px-6 py-10">
      {/* Brand */}
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand to-accent text-3xl shadow-glow">
            🏃
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Project Pace</h1>
          <p className="mt-1 text-sm text-slate-400">Your community, in motion.</p>
        </div>

        {/* Auth card */}
        <div className="card p-5">
          <div className="mb-4 flex rounded-xl bg-white/5 p-1 text-sm font-medium">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg py-2 transition ${mode === m ? "bg-brand text-white" : "text-slate-400"}`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push("/");
            }}
            className="space-y-3"
          >
            {mode === "signup" && (
              <Field label="Full name" type="text" placeholder="Alex Rivera" />
            )}
            <Field label="Email" type="email" placeholder="you@example.com" defaultValue="og.pumpgod86@gmail.com" />
            <Field label="Password" type="password" placeholder="••••••••" defaultValue="demo1234" />
            <button type="submit" className="btn-primary w-full">
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-slate-600">
            <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
          </div>

          <button onClick={() => router.push("/")} className="btn-ghost w-full">
            🚀 Continue with demo account
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          By continuing you agree to the Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-400">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </label>
  );
}
