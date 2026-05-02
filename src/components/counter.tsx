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

export function Counter({
  value,
  suffix = "",
  prefix = "",
  duration = 2,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState("0");
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      setDisplay(formatNumber(value));
      hasAnimated.current = true;
      return;
    }

    const start = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;
      animate();
      cleanup();
    };

    const isNearViewport = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return rect.top < vh * 1.5 && rect.bottom > -vh * 0.5;
    };

    if (isNearViewport()) {
      start();
      return;
    }

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) start();
        },
        { threshold: 0, rootMargin: "0px 0px 50% 0px" }
      );
      observer.observe(el);
    }

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (isNearViewport()) start();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const fallback = setTimeout(start, 1500);

    function cleanup() {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(fallback);
    }

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  function formatNumber(n: number): string {
    const decimals = (value.toString().split(".")[1] || "").length;
    if (decimals > 0) return n.toFixed(decimals);
    const rounded = Math.round(n);
    return (rounded === 0 ? 0 : rounded).toLocaleString();
  }

  function animate() {
    const durationMs = duration * 1000;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * value;
      setDisplay(formatNumber(current));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
