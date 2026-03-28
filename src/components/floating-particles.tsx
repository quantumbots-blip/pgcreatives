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
      const size = 2 + Math.random() * 4; // 2-6px
      const left = Math.random() * 100; // 0-100%
      const duration = 6 + Math.random() * 10; // 6-16s
      const delay = Math.random() * 8; // 0-8s stagger
      const opacity = 0.15 + Math.random() * 0.45; // 0.15-0.6
      const drift = -20 + Math.random() * 40; // horizontal drift in px

      return { id: i, size, left, duration, delay, opacity, drift };
    });
  }, [count]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes float-particle {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: var(--particle-opacity);
  }
  90% {
    opacity: var(--particle-opacity);
  }
  100% {
    transform: translateY(-100vh) translateX(var(--particle-drift));
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .floating-particle {
    animation: none !important;
    opacity: var(--particle-opacity) !important;
  }
}
`,
        }}
      />
      <div
        className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
        aria-hidden="true"
      >
        {particles.map((p) => (
          <div
            key={p.id}
            className="floating-particle absolute rounded-full"
            style={
              {
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: `${p.left}%`,
                bottom: `-${p.size}px`,
                backgroundColor: "#8B5CF6",
                opacity: 0,
                "--particle-opacity": p.opacity,
                "--particle-drift": `${p.drift}px`,
                animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}
