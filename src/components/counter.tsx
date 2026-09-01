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

// Small figures like "$3B" have nothing to count: 0, 1, 2, 3 is four frames,
// and rendering it with a decimal so it has more to show ("$2.7B") puts a
// number in front of the visitor that was never true. Anything below this
// simply renders its final value and never animates.
const ANIMATE_ABOVE = 20;

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
  const [display, setDisplay] = useState(() => format(value, value));
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

    // Too small to be worth counting, motion is unwelcome, or it is already in
    // front of the visitor: keep the figure exactly as rendered.
    if (value <= ANIMATE_ABOVE || reduceMotion || onScreen()) {
      started.current = true;
      return;
    }

    // Off-screen, so it is safe to wind back to zero and count up when the
    // number actually scrolls into view — not before, or the show is over by
    // the time anyone looks. (Deliberate: this is the one-time re-arm, not a
    // render-loop hazard — it runs once per mount, off-screen only.)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplay(format(0, value));

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
        setDisplay(format(eased * value, value));
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

/** Format a figure for display, matching the target's own precision. */
function format(n: number, target: number): string {
  const decimals = (target.toString().split(".")[1] || "").length;
  if (decimals > 0) return n.toFixed(decimals);
  return Math.round(n).toLocaleString();
}
