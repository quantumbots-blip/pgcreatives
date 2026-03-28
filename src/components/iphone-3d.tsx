"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * iPhone scroll section — clean PNG-overlay style like fourhorsemenmedia.com
 * Phone stays upright, content crossfades on scroll, subtle entry animation only.
 */

export function IPhoneScroll({
  images,
  className,
}: {
  images: string[];
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  const handleScroll = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    const progress = Math.max(0, Math.min(1, -rect.top / total));
    setScrollProgress(progress);
    setActiveImage(
      Math.min(images.length - 1, Math.floor(progress * images.length))
    );
  }, [images.length]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Subtle entry tilt → upright + gentle float
  const getPhoneTransform = () => {
    const p = scrollProgress;
    if (p < 0.2) {
      const t = p / 0.2;
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      return `perspective(1400px) rotateY(${20 * (1 - eased)}deg) rotateX(${4 * (1 - eased)}deg) translateY(${18 * (1 - eased)}px)`;
    }
    const floatT = (p - 0.2) / 0.8;
    const floatY = Math.sin(floatT * Math.PI * 2) * 7;
    return `perspective(1400px) rotateY(0deg) translateY(${floatY}px)`;
  };

  return (
    <section
      ref={sectionRef}
      className={cn("relative min-h-[280vh] bg-background", className)}
    >
      <div className="sticky top-0 flex min-h-screen items-center justify-center overflow-hidden py-16">
        {/* Purple glow behind phone */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 65% 50%, rgba(139,92,246,0.12) 0%, transparent 70%)",
            opacity: scrollProgress > 0.1 && scrollProgress < 0.9 ? 1 : 0,
          }}
        />

        <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 lg:flex-row lg:gap-20">
          {/* ── Text side ── */}
          <div
            className="max-w-md text-center lg:text-left order-2 lg:order-1"
            style={{
              opacity:
                scrollProgress > 0.08
                  ? Math.min(1, (scrollProgress - 0.08) / 0.14)
                  : 0,
              transform: `translateY(${Math.max(0, 36 - scrollProgress * 140)}px)`,
              transition: "opacity 0.35s ease, transform 0.35s ease",
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
                    i === activeImage
                      ? "w-8 bg-purple-light"
                      : "w-1.5 bg-white/15"
                  )}
                />
              ))}
            </div>

            {/* Feature bullets */}
            <div className="mt-8 space-y-3">
              {[
                "Vertical 9:16 formats for Reels & TikTok",
                "Professional editing & color grading",
                "Same-day turnaround available",
              ].map((feat, i) => (
                <div
                  key={feat}
                  className="flex items-center gap-3"
                  style={{
                    opacity:
                      scrollProgress > 0.22 + i * 0.06
                        ? Math.min(
                            1,
                            (scrollProgress - 0.22 - i * 0.06) / 0.1
                          )
                        : 0,
                    transform: `translateX(${Math.max(0, 18 - (scrollProgress - 0.2) * 110)}px)`,
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                  }}
                >
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-light" />
                  <span className="text-sm text-white/50">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── iPhone Mockup ── */}
          <div
            className="relative order-1 lg:order-2 shrink-0"
            style={{
              transform: getPhoneTransform(),
              transition: "transform 0.25s ease-out",
              transformStyle: "preserve-3d",
            }}
          >
            <IPhoneFrame images={images} activeImage={activeImage} />
          </div>
        </div>
      </div>
    </section>
  );
}

function IPhoneFrame({
  images,
  activeImage,
}: {
  images: string[];
  activeImage: number;
}) {
  return (
    <div
      className="relative w-[258px] sm:w-[272px] lg:w-[290px]"
      style={{ aspectRatio: "393 / 852" }}
    >
      {/*
       * Layer order (bottom → top):
       * 1. Screen images (clipped to screen shape)
       * 2. Screen overlays (Dynamic Island, gradients, home bar)
       * 3. SVG phone frame (transparent screen hole via evenodd path)
       * 4. Ambient glow / shadow
       */}

      {/* ── 1. Screen images ── */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: "1.55%",
          left: "1.3%",
          right: "1.3%",
          bottom: "1.55%",
          borderRadius: "12.5%",
          background: "#000",
        }}
      >
        {images.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === activeImage ? 1 : 0 }}
          >
            <Image
              src={src}
              alt={`Portfolio ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 258px, (max-width: 1024px) 272px, 290px"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* ── 2. Screen overlays ── */}
      {/* Top fade under Dynamic Island */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: "1.55%",
          left: "1.3%",
          right: "1.3%",
          height: "14%",
          borderTopLeftRadius: "12.5%",
          borderTopRightRadius: "12.5%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)",
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          bottom: "1.55%",
          left: "1.3%",
          right: "1.3%",
          height: "12%",
          borderBottomLeftRadius: "12.5%",
          borderBottomRightRadius: "12.5%",
          background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
        }}
      />
      {/* Home indicator */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          bottom: "3.2%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "29%",
          height: "4px",
          borderRadius: "9999px",
          background: "rgba(255,255,255,0.35)",
        }}
      />

      {/* ── 3. SVG Phone frame (OVER the screen) ── */}
      {/*
       * Uses evenodd fill rule to punch a transparent hole for the screen.
       * Outer path (CW) = full phone shape
       * Inner path (CW) = screen area → becomes transparent with evenodd
       */}
      <svg
        viewBox="0 0 393 852"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 20 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pg-ti" x1="0" y1="0" x2="393" y2="852" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#545462" />
            <stop offset="15%"  stopColor="#3e3e4c" />
            <stop offset="45%"  stopColor="#2c2c38" />
            <stop offset="75%"  stopColor="#3c3c48" />
            <stop offset="100%" stopColor="#22222e" />
          </linearGradient>
          <linearGradient id="pg-bezel" x1="0" y1="0" x2="393" y2="852" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#0e0e18" />
            <stop offset="100%" stopColor="#06060e" />
          </linearGradient>
          <linearGradient id="pg-glass" x1="0" y1="0" x2="393" y2="852" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="white" stopOpacity="0" />
            <stop offset="40%"  stopColor="white" stopOpacity="0" />
            <stop offset="48%"  stopColor="white" stopOpacity="0.05" />
            <stop offset="56%"  stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/*
         * TITANIUM FRAME RING — evenodd creates transparent screen hole
         * Outer rect: rx=56 (full phone shape)
         * Inner rect: rx=47 (screen cutout — transparent via evenodd)
         *
         * Both paths wound clockwise → evenodd rule makes inner area transparent
         */}
        <path
          fillRule="evenodd"
          fill="url(#pg-ti)"
          d={[
            // Outer phone shape (clockwise)
            "M57,1 L336,1",
            "A56,56,0,0,1,392,57",
            "L392,795",
            "A56,56,0,0,1,336,851",
            "L57,851",
            "A56,56,0,0,1,1,795",
            "L1,57",
            "A56,56,0,0,1,57,1 Z",
            // Inner screen cutout (also clockwise → creates hole with evenodd)
            "M52,13 L341,13",
            "A47,47,0,0,1,388,60",
            "L388,792",
            "A47,47,0,0,1,341,839",
            "L52,839",
            "A47,47,0,0,1,5,792",
            "L5,60",
            "A47,47,0,0,1,52,13 Z",
          ].join(" ")}
        />

        {/* Dark bezel ring (thin dark border between metal and screen) */}
        <path
          fillRule="evenodd"
          fill="url(#pg-bezel)"
          opacity="0.85"
          d={[
            // Outer bezel shape
            "M52,13 L341,13",
            "A47,47,0,0,1,388,60",
            "L388,792",
            "A47,47,0,0,1,341,839",
            "L52,839",
            "A47,47,0,0,1,5,792",
            "L5,60",
            "A47,47,0,0,1,52,13 Z",
            // Inner (actual screen — transparent)
            "M53,15 L340,15",
            "A45,45,0,0,1,385,60",
            "L385,792",
            "A45,45,0,0,1,340,837",
            "L53,837",
            "A45,45,0,0,1,8,792",
            "L8,60",
            "A45,45,0,0,1,53,15 Z",
          ].join(" ")}
        />

        {/* ── Dynamic Island ── */}
        <rect x="143" y="20" width="107" height="35" rx="17.5" fill="#050508" />
        {/* Camera */}
        <circle cx="227" cy="37" r="7.5" fill="#0d0d1a" />
        <circle cx="227" cy="37" r="5.5" fill="#080810" />
        <circle cx="224.5" cy="34.5" r="1.5" fill="rgba(255,255,255,0.22)" />
        <circle cx="229" cy="38.5" r="0.75" fill="rgba(139,92,246,0.3)" />

        {/* ── Side buttons ── */}
        <rect x="-0.5" y="150" width="4" height="30" rx="2" fill="#42424e" />
        <rect x="-0.5" y="200" width="4" height="54" rx="2" fill="#42424e" />
        <rect x="-0.5" y="264" width="4" height="54" rx="2" fill="#42424e" />
        <rect x="389.5" y="212" width="4" height="70" rx="2" fill="#42424e" />

        {/* ── Frame edge highlights ── */}
        <line x1="65" y1="1.5" x2="328" y2="1.5" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
        <line x1="1.5" y1="80" x2="1.5" y2="772" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

        {/* ── Subtle glass sheen across screen ── */}
        <rect x="8" y="15" width="377" height="822" rx="44"
          fill="url(#pg-glass)"
          style={{ mixBlendMode: "overlay" }}
        />

        {/* Outer edge subtle glow stroke */}
        <rect x="1" y="1" width="391" height="850" rx="56"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      </svg>

      {/* ── 4. Drop shadow + ambient glow ── */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: "72%",
          height: "28px",
          background:
            "radial-gradient(ellipse, rgba(139,92,246,0.3) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)",
          filter: "blur(16px)",
        }}
      />
      {/* Side ambient glow */}
      <div
        className="absolute inset-0 rounded-[12%] pointer-events-none"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.05), 0 32px 80px -12px rgba(0,0,0,0.9), 0 8px 32px -6px rgba(139,92,246,0.2)",
        }}
      />
    </div>
  );
}
