"use client";

import { useRef, type ReactNode } from "react";

/**
 * Pointer-driven 3D tilt.
 *
 * The card rotates toward the pointer and lifts along Z. Nothing follows the
 * cursor across the surface: this used to paint a specular highlight that
 * tracked the pointer, which read as a glow chasing the mouse rather than as
 * a lit surface, so it is gone.
 *
 * Two deliberate constraints:
 * - Everything is written to CSS custom properties and applied by a
 *   `(pointer: fine)` rule in globals.css, so on a touchscreen this component
 *   renders a plain div and does no work at all. A tilt with no hover to
 *   drive it is just compositing cost.
 * - The transform is read off the pointer inside a rAF, never on every
 *   pointermove, so a fast cursor cannot queue more work than the display can
 *   show.
 */
export function Tilt({
  children,
  className = "",
  /** Peak rotation in degrees at the card's corner. */
  max = 7,
  /** How far the card lifts toward the viewer, in px. */
  lift = 18,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  lift?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const next = useRef<{ x: number; y: number } | null>(null);

  const apply = () => {
    frame.current = 0;
    const el = ref.current;
    const p = next.current;
    if (!el || !p) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    // -0.5..0.5 from the card's centre
    const px = (p.x - r.left) / r.width - 0.5;
    const py = (p.y - r.top) / r.height - 0.5;
    el.style.setProperty("--tilt-y", `${px * max * 2}deg`);
    el.style.setProperty("--tilt-x", `${-py * max * 2}deg`);
    el.style.setProperty("--tilt-z", `${lift}px`);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    next.current = { x: e.clientX, y: e.clientY };
    if (!frame.current) frame.current = requestAnimationFrame(apply);
  };

  const onEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    ref.current?.classList.add("tilt-active");
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    el.classList.remove("tilt-active");
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    el.style.setProperty("--tilt-z", "0px");
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className={`tilt ${className}`}
    >
      {children}
    </div>
  );
}
