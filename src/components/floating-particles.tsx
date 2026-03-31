"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

export function FloatingParticles({
  count = 15,
  className,
}: FloatingParticlesProps) {
  const [particles, setParticles] = useState<
    { id: number; size: number; left: number; duration: number; delay: number }[]
  >([]);

  useEffect(() => {
    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Reduce particles on mobile for performance
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const actualCount = isMobile ? Math.min(count, 4) : count;

    // Generate particles only on the client to avoid hydration mismatch
    setParticles(
      Array.from({ length: actualCount }, (_, i) => ({
        id: i,
        size: +(2 + Math.random() * 4).toFixed(1),
        left: +(Math.random() * 100).toFixed(1),
        duration: +(8 + Math.random() * 12).toFixed(1),
        delay: +(Math.random() * 10).toFixed(1),
      }))
    );
  }, [count]);

  if (particles.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden z-0",
        className
      )}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            bottom: `-${p.size}px`,
            backgroundColor: "#2b6fb8",
            opacity: 0,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
