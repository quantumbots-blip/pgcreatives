"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Animation = "fade-up" | "fade-in-scale" | "slide-in-left" | "slide-in-right";

export function AnimateOnScroll({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 0.6,
  className = "",
}: {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        animation: isVisible
          ? `${animation} ${duration}s cubic-bezier(0.23, 1, 0.32, 1) ${delay}s both`
          : "none",
      }}
    >
      {children}
    </div>
  );
}
