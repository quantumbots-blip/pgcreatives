"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

// Small figures like "$3B" would otherwise tick 0, 1, 2, 3 — four frames of
// "animation". Below this threshold the count shows one decimal while it
// runs ("$2.7B") and snaps to the real integer at the end.
const DECIMAL_BELOW = 20;

export function Counter({
  value,
  suffix = "",
  prefix = "",
  duration = 2.2,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // Start at the real figure, not at zero. This is server-rendered, so a phone
  // that is still downloading or hydrating used to show visitors "$0B in Real
  // Estate Captured" — a wrong number is far worse than a missing animation.
  // The count-up is re-armed below, but only while the element is off-screen,
  // so nobody ever watches a correct number reset itself to zero.
  const [display, setDisplay] = useState(() => format(value, value, 1));
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const onScreen = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.bottom > 0 && r.top < vh;
    };

    // Already in front of the visitor, or motion is unwelcome: keep the figure
    // exactly as rendered.
    if (reduceMotion || onScreen()) {
      started.current = true;
      return;
    }

    // Off-screen, so it is safe to wind back to zero and count up when the
    // number actually scrolls into view — not before, or the show is over by
    // the time anyone looks. (Deliberate: this is the one-time re-arm, not a
    // render-loop hazard — it runs once per mount, off-screen only.)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplay(format(0, value, 0));

    let frame = 0;
    let observer: IntersectionObserver | undefined;
    let failsafe = 0;

    const cleanup = () => {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(failsafe);
    };

    const start = () => {
      if (started.current) return;
      started.current = true;
      cleanup();
      const t0 = performance.now();
      const ms = duration * 1000;
      const tick = (now: number) => {
        const p = Math.min((now - t0) / ms, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(format(eased * value, value, p));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) start();
        },
        // Fire once a third of the number is showing — it is clearly in view,
        // and the count is still in its opening beat as the eye lands on it.
        { threshold: 0.3 }
      );
      observer.observe(el);
    }

    // Fallbacks for a starved observer or a browser without one: a scroll
    // check, and a slow poll so the number can never be stuck at zero.
    const onScroll = () => {
      if (onScreen()) start();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    failsafe = window.setInterval(() => {
      if (onScreen()) start();
    }, 1000);

    return () => {
      cleanup();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/** Format an in-progress figure; `progress` 1 means the final, settled value. */
function format(n: number, target: number, progress: number): string {
  const decimals = (target.toString().split(".")[1] || "").length;
  if (decimals > 0) return n.toFixed(decimals);
  if (progress < 1 && target < DECIMAL_BELOW) return n.toFixed(1);
  return Math.round(n).toLocaleString();
}
