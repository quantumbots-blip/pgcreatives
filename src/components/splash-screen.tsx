"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const MIN_SPLASH_MS = 2200;
const FADE_MS = 600;

export function SplashScreen() {
  const pathname = usePathname();
  const [done, setDone] = useState(pathname !== "/");
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    const timer = setTimeout(() => setFading(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
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
