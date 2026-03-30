"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface GradientWord {
  text: string;
  gradient?: string;
}

interface TextGradientColorProps {
  words: GradientWord[];
  className?: string;
}

const DEFAULT_GRADIENTS = [
  "linear-gradient(135deg, #4f6ef7, #a5b4fc)",
  "linear-gradient(135deg, #a5b4fc, #4f6ef7)",
  "linear-gradient(135deg, #3730a3, #a5b4fc)",
  "linear-gradient(135deg, #4f6ef7, #3730a3)",
];

export function TextGradientColor({
  words,
  className,
}: TextGradientColorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const motionOk = !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!motionOk) {
      setIsVisible(true);
      return;
    }

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
    <div ref={containerRef} className={cn("inline-flex flex-wrap gap-x-[0.3em]", className)}>
      {words.map((word, i) => {
        const gradient =
          word.gradient || DEFAULT_GRADIENTS[i % DEFAULT_GRADIENTS.length];
        const staggerDelay = `${i * 0.08}s`;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              backgroundImage: gradient,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              transition: `opacity 0.6s ease ${staggerDelay}, transform 0.6s ease ${staggerDelay}`,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(0.4em)",
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
}
