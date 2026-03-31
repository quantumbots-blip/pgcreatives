"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export function MagneticButton({
  children,
  strength = 0.3,
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  function handleMouseEnter() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    rectRef.current = ref.current?.getBoundingClientRect() ?? null;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    const rect = rectRef.current;
    if (!el || !rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    // Clamp to max 8px movement
    const maxPx = 8;
    const x = Math.max(-maxPx, Math.min(maxPx, deltaX * strength));
    const y = Math.max(-maxPx, Math.min(maxPx, deltaY * strength));

    el.style.transform = `translate(${x}px, ${y}px)`;
    el.style.transition = "transform 0.15s ease-out";
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (el) {
      el.style.transform = "translate(0px, 0px)";
      el.style.transition = "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)";
    }
    rectRef.current = null;
  }

  return (
    <div
      ref={ref}
      className={cn("inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ willChange: "transform" }}
    >
      {children}
    </div>
  );
}
