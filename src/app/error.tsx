"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

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
    <section className="section flex min-h-[70vh] items-center">
      <div className="shell">
        <div className="max-w-3xl">
          <p className="meta meta-signal">Something went wrong</p>
          <h1 className="display-1 mt-5 text-white">That frame did not load.</h1>
          <p className="lede mt-6 max-w-lg">
            An unexpected error stopped this page. Trying again usually fixes
            it. If it keeps happening, email us and we will sort it out.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button type="button" onClick={reset} className="btn btn-primary">
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
            <a href="mailto:pgcreativeswisconsin@gmail.com" className="btn btn-ghost">
              Email us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
