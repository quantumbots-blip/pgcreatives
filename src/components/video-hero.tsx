"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { MagneticButton } from "@/components/magnetic-button";
import { FloatingParticles } from "@/components/floating-particles";

const MIN_SPLASH_MS = 2200;

export function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const splashStart = useRef(Date.now());

  const dismiss = useCallback(() => {
    const elapsed = Date.now() - splashStart.current;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
    setTimeout(() => setSplashDone(true), remaining);
  }, []);

  const tryPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setVideoReady(true);
          dismiss();
        })
        .catch(() => {
          // Autoplay blocked — retry on first user interaction
          const resume = () => {
            video.play().then(() => {
              setVideoReady(true);
              dismiss();
            }).catch(() => {});
            document.removeEventListener("click", resume);
            document.removeEventListener("touchstart", resume);
            document.removeEventListener("scroll", resume);
          };
          document.addEventListener("click", resume, { once: true });
          document.addEventListener("touchstart", resume, { once: true });
          document.addEventListener("scroll", resume, { once: true });
        });
    }
  }, [dismiss]);

  // Fallback: dismiss splash after 4s even if video never loads
  useEffect(() => {
    const fallback = setTimeout(() => setSplashDone(true), 4000);
    return () => clearTimeout(fallback);
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
    <section className="relative -mt-22 lg:-mt-26 flex min-h-screen items-center overflow-hidden">
      {/* Loading overlay — black with logo, fades out after min splash time */}
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center bg-black transition-opacity duration-1000 ${
          splashDone ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="animate-logo-loading">
          <Image
            src="/images/pg-logo.png"
            alt="PG Creatives"
            width={280}
            height={80}
            className="w-48 sm:w-64 h-auto"
            priority
          />
        </div>
      </div>

      {/* Poster — shows while video loads or if video fails */}
      <Image
        src="/images/hero-poster.jpg"
        alt="Property showcase"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Video — hidden until ready to prevent flash of old cached frame */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/hero-poster.jpg"
        onLoadedData={tryPlay}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          videoReady ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src="/hero-video-v3.mp4" type="video/mp4" />
      </video>

      {/* Overlay gradients — purple-tinted */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/75 via-[#000000]/55 to-[#000000]/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/75 via-[#000000]/15 to-transparent" />

      {/* Single subtle ambient glow */}
      <div className="absolute bottom-0 left-1/3 h-[200px] w-[500px] bg-purple/[0.06] blur-[120px]" />
      <FloatingParticles count={12} />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 pt-24 sm:pt-20">
        <div className="max-w-3xl">
          <div
            className="animate-hero-fade-up mb-4 sm:mb-6 inline-flex items-center justify-center rounded-full border border-purple/25 bg-purple/10 px-3 h-7 sm:px-4 sm:h-8 backdrop-blur-sm transition-shadow duration-500 hover:shadow-[0_0_20px_rgba(79,110,247,0.25)]"
          >
            <span className="text-[11px] sm:text-xs font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase text-purple-light leading-none">
              Madison, Green Bay, and the Fox Valley
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
            We help you present your listings better and build a brand people
            recognize. From video and photography to social media content,
            everything is made with intention. We bring your vision to life.
          </p>

          <div
            className="animate-hero-fade-up mt-8 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-4"
            style={{ animationDelay: "0.45s" }}
          >
            <MagneticButton>
              <Link
                href="/#portals"
                className="rounded-full bg-gradient-to-r from-purple-dim to-purple px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-semibold tracking-wide text-white ring-1 ring-purple/40 shadow-[0_0_15px_rgba(79,110,247,0.25),0_0_40px_rgba(79,110,247,0.1)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(79,110,247,0.4),0_0_50px_rgba(79,110,247,0.15)]"
              >
                Book a Shoot
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="/portfolio"
                className="flex items-center gap-2.5 rounded-full border border-white/20 px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-medium tracking-wide text-white/80 transition-all duration-300 hover:border-white/40 hover:bg-white/5 hover:text-white"
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
