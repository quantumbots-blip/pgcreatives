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

    // Eager check: if the element is already in (or near) the viewport on
    // mount, reveal immediately. iOS Safari sometimes skips the initial
    // IntersectionObserver callback for elements that are intersecting at the
    // moment the observer is attached — this guards against that.
    const eagerCheck = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh + 120 && rect.bottom > -120) {
        setIsVisible(true);
        return true;
      }
      return false;
    };

    if (eagerCheck()) return;

    // Bail to immediate reveal if IntersectionObserver isn't supported.
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            return;
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px 200px 0px" }
    );

    observer.observe(el);

    // Safety net: if for any reason the observer never fires (e.g. mobile
    // Safari quirks while the splash screen is fading), force-reveal after a
    // short delay so content is never permanently stuck invisible.
    const fallback = setTimeout(() => setIsVisible(true), 2500);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
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
