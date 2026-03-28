"use client";

import { useRef, useState, type ReactNode } from "react";
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
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    // Clamp to max 8px movement
    const maxPx = 8;
    const x = Math.max(-maxPx, Math.min(maxPx, deltaX * strength));
    const y = Math.max(-maxPx, Math.min(maxPx, deltaY * strength));

    setOffset({ x, y });
    setIsHovering(true);
  }

  function handleMouseLeave() {
    setOffset({ x: 0, y: 0 });
    setIsHovering(false);
  }

  return (
    <div
      ref={ref}
      className={cn("inline-block", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: isHovering
          ? "transform 0.15s ease-out"
          : "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
