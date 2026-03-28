"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  mode?: "words" | "chars";
  delay?: number;
  staggerDelay?: number;
}

export function TextReveal({
  text,
  className,
  mode = "words",
  delay = 0,
  staggerDelay = 0.05,
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const motionOk = !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!motionOk) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const segments =
    mode === "words"
      ? text.split(/(\s+)/)
      : text.split("");

  let tokenIndex = 0;

  return (
    <div ref={containerRef} className={cn("inline", className)}>
      {segments.map((segment, i) => {
        // Whitespace segments render as-is (no animation)
        if (mode === "words" && /^\s+$/.test(segment)) {
          return (
            <span key={i} style={{ whiteSpace: "pre" }}>
              {segment}
            </span>
          );
        }

        const currentIndex = tokenIndex++;
        const transitionDelay = `${delay + currentIndex * staggerDelay}s`;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transition: `opacity 0.5s ease ${transitionDelay}, transform 0.5s ease ${transitionDelay}`,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0) scale(1)" : "translateY(0.5em) scale(0.98)",
              whiteSpace: mode === "chars" ? "pre" : undefined,
            }}
          >
            {segment}
          </span>
        );
      })}
    </div>
  );
}
