"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { MagneticButton } from "@/components/magnetic-button";
import { FloatingParticles } from "@/components/floating-particles";

export function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const tryPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked — retry on first user interaction
        const resume = () => {
          video.play().catch(() => {});
          document.removeEventListener("click", resume);
          document.removeEventListener("touchstart", resume);
          document.removeEventListener("scroll", resume);
        };
        document.addEventListener("click", resume, { once: true });
        document.addEventListener("touchstart", resume, { once: true });
        document.addEventListener("scroll", resume, { once: true });
      });
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.readyState >= 2) {
      tryPlay();
      return;
    }

    const onReady = () => tryPlay();
    video.addEventListener("canplay", onReady);
    return () => video.removeEventListener("canplay", onReady);
  }, [tryPlay]);

  return (
    <section className="relative -mt-16 lg:-mt-20 flex min-h-screen items-center overflow-hidden">
      {/* Poster — shows while video loads or if video fails */}
      <Image
        src="/images/hero-poster.jpg"
        alt="Property showcase"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Video — always visible; poster attr handles initial frame */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/hero-poster.jpg"
        onLoadedData={tryPlay}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/hero-video-v2.mp4" type="video/mp4" />
      </video>

      {/* Overlay gradients — purple-tinted */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/70 via-[#000000]/30 to-[#000000]/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/70 via-transparent to-transparent" />

      {/* Single subtle ambient glow */}
      <div className="absolute bottom-0 left-1/3 h-[200px] w-[500px] bg-purple/[0.06] blur-[120px]" />
      <FloatingParticles count={12} />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-20">
        <div className="max-w-3xl">
          <div
            className="animate-hero-fade-up mb-4 sm:mb-6 inline-flex items-center justify-center rounded-full border border-purple/25 bg-purple/10 px-3 h-7 sm:px-4 sm:h-8 backdrop-blur-sm transition-shadow duration-500 hover:shadow-[0_0_20px_rgba(79,110,247,0.25)]"
          >
            <span className="text-[10px] sm:text-xs font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase text-purple-light leading-none">
              Green Bay, Madison, and the Fox Valley
            </span>
          </div>

          <h1
            className="animate-hero-fade-up text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl"
            style={{ animationDelay: "0.15s" }}
          >
            <span className="text-white">Professional</span>
            <br />
            <span className="text-white">Grade Media</span>
          </h1>

          <p
            className="animate-hero-fade-up mt-6 max-w-lg text-base sm:text-lg font-light leading-relaxed text-white/70"
            style={{ animationDelay: "0.3s" }}
          >
            Cinema-quality videography, stunning photography, aerial drone
            footage, and immersive 3D tours. We bring your vision to life.
          </p>

          <div
            className="animate-hero-fade-up mt-10 flex flex-wrap items-center gap-3 sm:gap-4"
            style={{ animationDelay: "0.45s" }}
          >
            <MagneticButton>
              <Link
                href="/contact"
                className="rounded-lg bg-gradient-to-r from-purple-dim via-purple to-purple-light px-7 py-3 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-purple/30"
              >
                Book a Shoot
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="/portfolio"
                className="flex items-center gap-2.5 rounded-lg border border-purple/30 px-7 py-3 text-sm font-medium tracking-wide text-purple-light transition-all duration-300 hover:border-purple/50 hover:bg-purple/10"
              >
                <Play className="h-3.5 w-3.5" />
                View Our Work
              </Link>
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="animate-hero-fade-up absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        style={{ animationDelay: "0.8s" }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-purple-light/40">
            Scroll
          </span>
          <div className="animate-hero-line h-10 w-px bg-gradient-to-b from-purple/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
