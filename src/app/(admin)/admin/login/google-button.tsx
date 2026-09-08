"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * A plain link dressed as a button, not a fetch. The handshake is a top level
 * redirect to accounts.google.com and back, so it has to leave the page.
 *
 * The Google mark is inline SVG rather than a hosted image: the site's CSP
 * allows images from its own origin, and a blocked logo on the one button
 * standing between the owner and his leads is not a good trade for saving a
 * few lines.
 */
export function GoogleButton() {
  const [going, setGoing] = useState(false);

  return (
    <a
      href="/api/auth/google/start"
      onClick={() => setGoing(true)}
      className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-[#1f1f1f] transition-colors hover:bg-[#f1f3f4]"
    >
      {going ? (
        <Loader2 className="h-5 w-5 animate-spin text-[#5f6368]" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
          />
          <path
            fill="#FBBC05"
            d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
          />
        </svg>
      )}
      {going ? "Taking you to Google" : "Sign in with Google"}
    </a>
  );
}
