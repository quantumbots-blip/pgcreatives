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

    // On mobile, don't animate at all — just show the content. The scroll
    // reveals were causing late "pop-in" while scrolling, so phones get the
    // section immediately (CSS also forces it visible with no animation).
    if (window.matchMedia("(max-width: 768px)").matches) {
      queueMicrotask(() => setIsVisible(true));
      return;
    }

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setIsVisible(true);
      cleanup();
    };

    const isNearViewport = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // Reveal anything within ~2 viewports of the visible area so the
      // animation has already finished well before it scrolls into view.
      // The wide margin is what prevents late "pop-in" during fast mobile
      // momentum scrolling.
      return rect.top < vh * 2 && rect.bottom > -vh * 1;
    };

    if (isNearViewport()) {
      revealed = true;
      queueMicrotask(() => setIsVisible(true));
      return;
    }

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) reveal();
        },
        { threshold: 0, rootMargin: "0px 0px 150% 0px" }
      );
      observer.observe(el);
    }

    // Scroll-based fallback for browsers/contexts where IntersectionObserver
    // callbacks fire late or get dropped (notably iOS Safari during momentum
    // scrolling). rAF-throttled so 30+ instances stay cheap.
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (isNearViewport()) reveal();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Final safety net — content can never stay permanently invisible.
    const fallback = setTimeout(reveal, 1500);

    function cleanup() {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(fallback);
    }

    return cleanup;
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${className}`}
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
