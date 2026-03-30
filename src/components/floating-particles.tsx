"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

export function FloatingParticles({
  count = 15,
  className,
}: FloatingParticlesProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = 2 + Math.random() * 4;
      const left = Math.random() * 100;
      const duration = 6 + Math.random() * 10;
      const delay = Math.random() * 8;

      return { id: i, size, left, duration, delay };
    });
  }, [count]);

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
            width: `${p.size * 2}px`,
            height: `${p.size * 2}px`,
            left: `${p.left}%`,
            bottom: `-${p.size}px`,
            backgroundColor: "#4f6ef7",
            opacity: 0,
            filter: `blur(${p.size + 1}px)`,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
