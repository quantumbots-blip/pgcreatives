"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

// The splash is driven entirely by CSS — see `.splash-failsafe` in globals.css.
// It fades itself out and stops accepting input on a fixed schedule measured
// from first paint, with no JavaScript involved.
//
// That division of labor is deliberate. This overlay is server-rendered and
// covers the whole viewport at z-index 9999, so for as long as it is up the
// site is unusable. Driving it from React meant its removal was gated on
// hydration, and on a phone that needs several seconds to hydrate the visitor
// sat behind a black screen for all of them — indistinguishable from a frozen
// page. Now hydration speed cannot hold the site hostage.
//
// React's only remaining job is to drop the node once the animation is over,
// so it stops costing memory and compositing.
const REMOVE_AFTER_MS = 2600; // CSS delay (1.6s) + duration (0.6s) + slack

export function SplashScreen() {
  const pathname = usePathname();
  const [done, setDone] = useState(pathname !== "/");

  useEffect(() => {
    if (pathname !== "/") return;
    // performance.now() is time since navigation start, so a late hydration
    // shortens this wait rather than adding to it.
    const remaining = Math.max(0, REMOVE_AFTER_MS - performance.now());
    const timer = setTimeout(() => setDone(true), remaining);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (done) return null;

  return (
    <div
      className="splash-failsafe"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000",
      }}
    >
      <div className="animate-logo-loading">
        <Image
          src="/logo-mark.png"
          alt="PG Creatives"
          // The 3D mark, cropped to its artwork (186x151). Declared at the
          // file's real ratio so nothing reflows when the bytes arrive.
          width={186}
          height={151}
          className="w-28 sm:w-36 h-auto"
          preload
        />
      </div>
    </div>
  );
}
