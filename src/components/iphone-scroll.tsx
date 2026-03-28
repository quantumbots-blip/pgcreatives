"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface IPhoneScrollProps {
  images: string[];
  className?: string;
}

export function IPhoneScroll({ images, className }: IPhoneScrollProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  const handleScroll = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const viewportHeight = window.innerHeight;
    const total = sectionHeight - viewportHeight;

    if (total <= 0) return;

    const progress = Math.max(0, Math.min(1, -rect.top / total));
    setScrollProgress(progress);

    const imageIndex = Math.min(
      images.length - 1,
      Math.floor(progress * images.length)
    );
    setActiveImage(imageIndex);
  }, [images.length]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const getTransform = () => {
    const p = scrollProgress;
    if (p < 0.3) {
      const t = p / 0.3;
      return `perspective(1200px) rotateY(${35 * (1 - t)}deg) rotateX(${10 * (1 - t)}deg) translateY(${40 * (1 - t)}px)`;
    } else if (p < 0.7) {
      const t = (p - 0.3) / 0.4;
      return `perspective(1200px) rotateY(${Math.sin(t * Math.PI * 2) * 3}deg) translateY(${Math.sin(t * Math.PI) * -12}px)`;
    } else {
      const t = (p - 0.7) / 0.3;
      return `perspective(1200px) rotateY(${-35 * t}deg) rotateX(${8 * t}deg) translateY(${30 * t}px)`;
    }
  };

  const glowOpacity =
    scrollProgress > 0.2 && scrollProgress < 0.8
      ? 0.15 + 0.15 * Math.sin(((scrollProgress - 0.2) / 0.6) * Math.PI)
      : 0.05;

  return (
    <section
      ref={sectionRef}
      className={cn("relative min-h-[200vh] bg-background", className)}
    >
      <div className="sticky top-0 flex min-h-screen items-center justify-center overflow-hidden py-20">
        {/* Background glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple/[0.08] blur-[120px] transition-opacity duration-700"
          style={{ opacity: glowOpacity * 3 }}
        />

        <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 lg:flex-row lg:gap-20">
          {/* Text side */}
          <div
            className="max-w-md text-center lg:text-left"
            style={{
              opacity: scrollProgress > 0.1 ? Math.min(1, (scrollProgress - 0.1) / 0.2) : 0,
              transform: `translateY(${Math.max(0, 30 - scrollProgress * 100)}px)`,
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-purple-light/60 mb-4">
              Social Media Ready
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Content That
              <br />
              <span className="gradient-text">Stops the Scroll</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/40 leading-relaxed">
              Every photo and video we create is optimized for social media.
              Vertical formats, eye-catching compositions, and scroll-stopping
              quality that drives engagement.
            </p>

            {/* Progress dots */}
            <div className="mt-8 flex items-center gap-2 justify-center lg:justify-start">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === activeImage ? "w-8 bg-purple-light" : "w-1.5 bg-white/15"
                  )}
                />
              ))}
            </div>
          </div>

          {/* ═══════════ iPhone 15 Pro Mockup ═══════════ */}
          <div
            className="relative shrink-0"
            style={{
              transform: getTransform(),
              transition: "transform 0.1s linear",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Outer titanium frame */}
            <div
              className="relative"
              style={{
                width: 290,
                height: 590,
              }}
            >
              {/* Titanium body — the main frame */}
              <div
                className="absolute inset-0 rounded-[52px]"
                style={{
                  background: "linear-gradient(145deg, #2a2a35 0%, #1c1c28 50%, #18181f 100%)",
                  boxShadow: `
                    inset 0 0 0 1.5px rgba(255,255,255,0.08),
                    0 0 0 1px rgba(0,0,0,0.5),
                    0 25px 60px -10px rgba(0,0,0,0.7),
                    0 10px 30px -5px rgba(139,92,246,0.08)
                  `,
                }}
              />

              {/* ── Left side buttons ── */}
              {/* Silent/Action button */}
              <div
                className="absolute -left-[2.5px] top-[100px] h-[28px] w-[3.5px] rounded-l-sm"
                style={{
                  background: "linear-gradient(180deg, #3a3a45 0%, #25252f 50%, #3a3a45 100%)",
                  boxShadow: "-1px 0 2px rgba(0,0,0,0.4)",
                }}
              />
              {/* Volume Up */}
              <div
                className="absolute -left-[2.5px] top-[155px] h-[42px] w-[3.5px] rounded-l-sm"
                style={{
                  background: "linear-gradient(180deg, #3a3a45 0%, #25252f 50%, #3a3a45 100%)",
                  boxShadow: "-1px 0 2px rgba(0,0,0,0.4)",
                }}
              />
              {/* Volume Down */}
              <div
                className="absolute -left-[2.5px] top-[205px] h-[42px] w-[3.5px] rounded-l-sm"
                style={{
                  background: "linear-gradient(180deg, #3a3a45 0%, #25252f 50%, #3a3a45 100%)",
                  boxShadow: "-1px 0 2px rgba(0,0,0,0.4)",
                }}
              />

              {/* ── Right side button ── */}
              {/* Power/Side button */}
              <div
                className="absolute -right-[2.5px] top-[170px] h-[58px] w-[3.5px] rounded-r-sm"
                style={{
                  background: "linear-gradient(180deg, #3a3a45 0%, #25252f 50%, #3a3a45 100%)",
                  boxShadow: "1px 0 2px rgba(0,0,0,0.4)",
                }}
              />

              {/* ── Screen bezel area ── */}
              <div className="absolute inset-[4px] rounded-[48px] bg-black overflow-hidden">
                {/* ── Dynamic Island ── */}
                <div className="absolute left-1/2 top-[10px] z-30 -translate-x-1/2">
                  <div
                    className="flex items-center justify-center rounded-full bg-black"
                    style={{
                      width: 100,
                      height: 30,
                      boxShadow: "0 0 0 2px rgba(0,0,0,0.9)",
                    }}
                  >
                    {/* Camera lens */}
                    <div className="relative ml-6">
                      <div
                        className="h-[10px] w-[10px] rounded-full"
                        style={{
                          background: "radial-gradient(circle at 35% 35%, #1a1a3a 0%, #0a0a15 60%, #050510 100%)",
                          boxShadow: "inset 0 0 2px rgba(139,92,246,0.15), 0 0 1px rgba(255,255,255,0.1)",
                        }}
                      />
                      {/* Lens flare dot */}
                      <div className="absolute left-[2.5px] top-[2px] h-[2px] w-[2px] rounded-full bg-white/20" />
                    </div>
                  </div>
                </div>

                {/* ── Screen content ── */}
                <div className="relative h-full w-full">
                  {images.map((src, i) => (
                    <div
                      key={src}
                      className="absolute inset-0 transition-opacity duration-700"
                      style={{ opacity: i === activeImage ? 1 : 0 }}
                    >
                      <Image
                        src={src}
                        alt={`Portfolio image ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="290px"
                        priority={i === 0}
                      />
                    </div>
                  ))}

                  {/* Screen top fade (under Dynamic Island) */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent z-20" />

                  {/* Screen bottom fade */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent z-20" />

                  {/* Home indicator bar */}
                  <div className="absolute bottom-[6px] left-1/2 z-30 h-[4px] w-[100px] -translate-x-1/2 rounded-full bg-white/30" />
                </div>

                {/* Screen glass reflection */}
                <div
                  className="pointer-events-none absolute inset-0 z-20"
                  style={{
                    background: "linear-gradient(125deg, transparent 35%, rgba(255,255,255,0.02) 42%, rgba(255,255,255,0.05) 48%, rgba(255,255,255,0.02) 54%, transparent 60%)",
                  }}
                />

                {/* Subtle inner edge highlight */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[48px]"
                  style={{
                    boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.05)",
                  }}
                />
              </div>

              {/* ── Bottom speaker grille ── */}
              <div className="absolute bottom-[8px] left-1/2 z-10 flex -translate-x-1/2 gap-[5px]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[1.5px] w-[1.5px] rounded-full"
                    style={{
                      background: "rgba(80,80,90,0.6)",
                      boxShadow: "inset 0 0 0.5px rgba(0,0,0,0.5)",
                    }}
                  />
                ))}
              </div>

              {/* ── Top speaker/earpiece ── */}
              <div className="absolute top-[5px] left-1/2 z-10 -translate-x-1/2">
                <div
                  className="h-[1px] w-[30px] rounded-full"
                  style={{
                    background: "rgba(60,60,70,0.4)",
                  }}
                />
              </div>

              {/* Frame edge highlights — top and bottom titanium shine */}
              <div
                className="pointer-events-none absolute inset-x-[20px] top-0 h-[1px]"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 70%, transparent)",
                }}
              />
              <div
                className="pointer-events-none absolute inset-x-[20px] bottom-0 h-[1px]"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 70%, transparent)",
                }}
              />
            </div>

            {/* Phone shadow on surface */}
            <div
              className="absolute -bottom-8 left-1/2 h-6 w-[220px] -translate-x-1/2 rounded-full blur-xl transition-opacity duration-500"
              style={{
                background: "radial-gradient(ellipse, rgba(139,92,246,0.2) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
                opacity: scrollProgress > 0.2 && scrollProgress < 0.8 ? 0.9 : 0.3,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
