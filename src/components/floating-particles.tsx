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
      const opacity = 0.15 + Math.random() * 0.45;
      const drift = -20 + Math.random() * 40;

      return { id: i, size, left, duration, delay, opacity, drift };
    });
  }, [count]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden="true"
      style={{ contain: "strict" }}
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
            backgroundColor: "#4f6ef7",
            opacity: 0,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
