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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
      <p className="mt-3 text-white/60">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-gradient-to-r from-purple to-purple-light px-8 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(79,110,247,0.3)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(79,110,247,0.5)]"
      >
        Try Again
      </button>
    </div>
  );
}
