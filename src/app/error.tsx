"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 sm:px-6">
      <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
      <p className="mt-3 text-white/60">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-gradient-to-r from-purple-dim to-purple px-8 py-3 text-sm font-semibold text-white ring-1 ring-purple/40 shadow-[0_0_15px_rgba(79,110,247,0.25),0_0_40px_rgba(79,110,247,0.1)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(79,110,247,0.4),0_0_50px_rgba(79,110,247,0.15)]"
      >
        Try Again
      </button>
    </div>
  );
}
