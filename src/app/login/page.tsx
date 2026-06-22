"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, isLive } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(name || email.split("@")[0], email, password);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/");
  };

  const demo = async () => {
    setBusy(true);
    setError(null);
    if (isLive) {
      // Try a shared demo account; create it on first run.
      const creds = { email: "demo@projectpace.app", password: "pacedemo123" };
      let res = await signIn(creds.email, creds.password);
      if (res.error) res = await signUp("Demo Runner", creds.email, creds.password);
      if (res.error) {
        setBusy(false);
        setError(res.error);
        return;
      }
    }
    setBusy(false);
    router.push("/");
  };

  return (
    <div className="relative flex min-h-screen flex-col px-6 py-10">
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand to-accent text-3xl shadow-glow">
            🏃
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Project Pace</h1>
          <p className="mt-1 text-sm text-slate-400">Your community, in motion.</p>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex rounded-xl bg-white/5 p-1 text-sm font-medium">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`flex-1 rounded-lg py-2 transition ${mode === m ? "bg-brand text-white" : "text-slate-400"}`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <Field label="Full name" type="text" placeholder="Alex Rivera" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <Field label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Field label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="rounded-lg bg-flame/10 px-3 py-2 text-xs text-flame">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-50">
              {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-slate-600">
            <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
          </div>

          <button onClick={demo} disabled={busy} className="btn-ghost w-full disabled:opacity-50">
            🚀 Continue with demo account
          </button>

          {!isLive && (
            <p className="mt-3 text-center text-[11px] text-slate-500">
              Running in demo mode — connect Supabase to enable real accounts.
            </p>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          By continuing you agree to the Terms &amp; Privacy Policy.
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
