"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { isHeroVideoReady, onHeroVideoReady } from "@/lib/hero-video";

// Keep the logo up at least this long (branding), but let it linger until the
// hero video is actually playing so the hand-off is seamless…
const MIN_SPLASH_MS = 2000;
// …and never longer than this, so a slow/failed video can't trap the visitor.
const MAX_SPLASH_MS = 5000;
const FADE_MS = 600;

export function SplashScreen() {
  const pathname = usePathname();
  const [done, setDone] = useState(pathname !== "/");
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;

    const start = Date.now();
    let minTimer: ReturnType<typeof setTimeout> | undefined;

    // Fade out once we've shown the logo for the minimum time AND the hero
    // video is ready — whichever of those is later.
    const finishWhenReady = () => {
      const remaining = MIN_SPLASH_MS - (Date.now() - start);
      if (remaining <= 0) setFading(true);
      else minTimer = setTimeout(() => setFading(true), remaining);
    };

    let unsubscribe = () => {};
    if (isHeroVideoReady()) {
      finishWhenReady();
    } else {
      unsubscribe = onHeroVideoReady(finishWhenReady);
    }

    // Hard cap — the splash always clears even if the video stalls or fails.
    const maxTimer = setTimeout(() => setFading(true), MAX_SPLASH_MS);

    return () => {
      if (minTimer) clearTimeout(minTimer);
      clearTimeout(maxTimer);
      unsubscribe();
    };
  }, [pathname]);

  // Remove from DOM after fade completes
  useEffect(() => {
    if (!fading) return;
    const timer = setTimeout(() => setDone(true), FADE_MS);
    return () => clearTimeout(timer);
  }, [fading]);

  if (done) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000",
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
      }}
    >
      <div className="animate-logo-loading">
        <Image
          src="/images/pg-logo.png"
          alt="PG Creatives"
          width={280}
          height={80}
          className="w-48 sm:w-64 h-auto"
          priority
        />
      </div>
    </div>
  );
}
