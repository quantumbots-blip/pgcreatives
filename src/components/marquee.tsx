"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  children,
  speed = 30,
  direction = "left",
  pauseOnHover = false,
  className,
}: MarqueeProps) {
  const animationDirection = direction === "left" ? "normal" : "reverse";
  const durationSeconds = 100 / speed;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation-play-state: paused !important; }
}
`,
        }}
      />
      <div
        className={cn("overflow-hidden", className)}
        aria-hidden="true"
      >
        <div
          className="marquee-track"
          style={{
            display: "flex",
            width: "max-content",
            animation: `marquee-scroll ${durationSeconds}s linear infinite`,
            animationDirection,
            ...(pauseOnHover ? {} : {}),
          }}
          onMouseEnter={
            pauseOnHover
              ? (e) => {
                  e.currentTarget.style.animationPlayState = "paused";
                }
              : undefined
          }
          onMouseLeave={
            pauseOnHover
              ? (e) => {
                  e.currentTarget.style.animationPlayState = "running";
                }
              : undefined
          }
        >
          <div style={{ display: "flex", flexShrink: 0 }}>{children}</div>
          <div style={{ display: "flex", flexShrink: 0 }}>{children}</div>
        </div>
      </div>
    </>
  );
}
