"use client";

import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

export function FloatingParticles({
  count = 15,
  className,
}: FloatingParticlesProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const particles = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: count }, (_, i) => {
      const size = 2 + Math.random() * 4;
      const left = Math.random() * 100;
      const duration = 8 + Math.random() * 12;
      const delay = Math.random() * 10;

      return { id: i, size, left, duration, delay };
    });
  }, [count, mounted]);

  if (!mounted) return null;

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
            backgroundColor: "#4f6ef7",
            opacity: 0,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
