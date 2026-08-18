import { cn } from "@/lib/utils";

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

// Deterministic pseudo-random in [0, 1) from a seed (mulberry32-style). Uses
// only integer ops, so it produces bit-identical results on the server and in
// every browser — which is what lets the particles be server-rendered without a
// hydration mismatch. Math.random() cannot be used here, and Math.sin-based
// hashes are not guaranteed identical across JS engines.
function seededRandom(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function FloatingParticles({
  count = 15,
  className,
}: FloatingParticlesProps) {
  // Purely decorative and entirely deterministic, so there is nothing for the
  // browser to do here: no state, no effects, no "use client". This renders on
  // the server and ships no JavaScript. CSS hides it on phones and for
  // reduced-motion visitors.
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: +(2 + seededRandom(i * 4 + 1) * 4).toFixed(1),
    left: +(seededRandom(i * 4 + 2) * 100).toFixed(1),
    duration: +(8 + seededRandom(i * 4 + 3) * 12).toFixed(1),
    delay: +(seededRandom(i * 4 + 4) * 10).toFixed(1),
  }));

  return (
    <div
      className={cn(
        "floating-particles pointer-events-none absolute inset-0 overflow-hidden z-0",
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
