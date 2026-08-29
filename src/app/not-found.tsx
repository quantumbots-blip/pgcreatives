import type { Metadata } from "next";
import Link from "next/link";

// Next already emits noindex for the not-found boundary; only the title is
// missing by default.
export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-5 py-20 text-center sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-purple-light">
        Error 404
      </p>
      <h1 className="mt-3 text-6xl font-bold text-white">Page not found</h1>
      <p className="mt-4 max-w-md text-base text-white/60">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-gradient-to-r from-purple-dim to-purple px-8 py-3.5 text-sm font-semibold text-white ring-1 ring-purple/40 shadow-[0_0_15px_rgba(43,111,184,0.25),0_0_40px_rgba(43,111,184,0.1)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(43,111,184,0.4),0_0_50px_rgba(43,111,184,0.15)]"
      >
        Go Home
      </Link>
    </div>
  );
}
