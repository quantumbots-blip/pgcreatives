"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureFirstTouch } from "@/lib/first-touch";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Records the arrival once per session, so a lead submitted three pages
    // later still knows whether it came from Instagram or a search.
    captureFirstTouch(pathname);

    // Fire-and-forget — don't block rendering
    const referrer =
      document.referrer && document.referrer !== window.location.href
        ? document.referrer
        : null;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer }),
      // Use keepalive so it survives navigation
      keepalive: true,
    }).catch(() => {
      // Silently fail — analytics should never affect UX
    });
  }, [pathname]);

  return null;
}
