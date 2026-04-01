"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const MIN_SPLASH_MS = 2200;

export function SplashScreen() {
  const pathname = usePathname();
  const [done, setDone] = useState(pathname !== "/");

  useEffect(() => {
    if (pathname !== "/") return;
    const timer = setTimeout(() => setDone(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

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
