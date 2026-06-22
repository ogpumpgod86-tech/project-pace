import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand to-accent text-3xl shadow-glow">
        🧭
      </div>
      <h1 className="mt-5 text-2xl font-bold text-white">Off the route</h1>
      <p className="mt-1 text-sm text-slate-400">
        We couldn&apos;t find that page. Let&apos;s get you back on pace.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Back to dashboard
      </Link>
    </div>
  );
}
