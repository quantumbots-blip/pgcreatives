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

    const motionOk = !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!motionOk) {
      setDisplay(formatNumber(value));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.unobserve(el);
          animate();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  function formatNumber(n: number): string {
    // Preserve decimal places matching the target value
    const decimals = (value.toString().split(".")[1] || "").length;
    return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
  }

  function animate() {
    const durationMs = duration * 1000;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * value;

      setDisplay(formatNumber(current));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
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
