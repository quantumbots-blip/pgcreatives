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
        className="mt-6 rounded-lg bg-purple px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-light"
      >
        Try Again
      </button>
    </div>
  );
}
