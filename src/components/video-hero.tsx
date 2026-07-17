"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { MagneticButton } from "@/components/magnetic-button";
import { FloatingParticles } from "@/components/floating-particles";
import { markHeroVideoReady } from "@/lib/hero-video";

export function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let inView = true;
    let readyMarked = false;

    const markReady = () => {
      if (readyMarked) return;
      readyMarked = true;
      setVideoReady(true);
      // Let the splash screen hand off to the (now playing) video.
      markHeroVideoReady();
    };

    // Attempt playback, but only when it makes sense (on-screen, page in the
    // foreground, and actually paused). iOS pauses background videos when they
    // scroll off-screen, when the tab is backgrounded, in Low Power Mode, and
    // after brief stalls — and never resumes on its own. We re-arm play() on
    // every signal that we're visible again so it keeps looping.
    const play = () => {
      if (document.hidden || !inView || !video.paused) return;
      video.muted = true; // required for autoplay to be allowed
      const p = video.play();
      if (p) p.then(markReady).catch(() => {});
    };

    if (video.readyState >= 2) play();
    video.addEventListener("canplay", play);
    video.addEventListener("loadeddata", play);

    // Resume when the video scrolls back into view.
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        if (inView) play();
      },
      { threshold: 0.05 }
    );
    io.observe(video);

    // Resume when the tab/app comes back to the foreground.
    const onVisible = () => play();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", play);
    window.addEventListener("pageshow", play);

    // If iOS pauses it while it's still on-screen, bring it right back.
    const onPause = () => {
      if (!document.hidden && inView) requestAnimationFrame(play);
    };
    video.addEventListener("pause", onPause);

    // Low Power Mode blocks programmatic play entirely; recover on the first
    // user gesture. Kept live (not once) so repeated blocks also recover.
    document.addEventListener("click", play, { passive: true });
    document.addEventListener("touchstart", play, { passive: true });

    return () => {
      video.removeEventListener("canplay", play);
      video.removeEventListener("loadeddata", play);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", play);
      window.removeEventListener("pageshow", play);
      video.removeEventListener("pause", onPause);
      document.removeEventListener("click", play);
      document.removeEventListener("touchstart", play);
    };
  }, []);

  return (
    <section className="relative -mt-22 lg:-mt-26 flex min-h-screen items-center overflow-x-clip">
      {/* Poster — shows while video loads or if video fails */}
      <Image
        src="/images/hero-poster.jpg"
        alt="Property showcase"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Video — autoplays on all devices, hidden until ready to prevent flash.
          Compressed 720p / audio-stripped source keeps the download small and
          decode cheap so mobile Safari doesn't choke. preload="metadata" avoids
          eagerly buffering the whole file into memory. */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          videoReady ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src="/hero-video-v5.mp4" type="video/mp4" />
      </video>

      {/* Overlay gradients — purple-tinted */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/68 via-[#000000]/47 to-[#000000]/81" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/72 via-transparent to-transparent" />
      {/* Bottom fade to blend into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-72 bg-gradient-to-t from-[#000000]/85 via-[#000000]/60 to-transparent" />

      {/* Single subtle ambient glow */}
      <div className="absolute bottom-0 left-1/3 h-[200px] w-[500px] bg-purple/[0.06] blur-[120px]" />
      <div className="hidden sm:block">
        <FloatingParticles count={12} />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 pt-24 sm:pt-20">
        <div className="max-w-3xl">
          <div
            className="animate-hero-fade-up mb-4 sm:mb-6 inline-flex items-center justify-center rounded-full border border-purple/25 bg-purple/10 px-3 h-7 sm:px-4 sm:h-8 backdrop-blur-sm transition-shadow duration-500 hover:shadow-[0_0_20px_rgba(55,140,210,0.25)]"
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
            className="animate-hero-fade-up mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-4"
            style={{ animationDelay: "0.45s" }}
          >
            <MagneticButton>
              <Link
                href="/#portals"
                className="rounded-full bg-gradient-to-r from-purple-dim to-purple px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-semibold tracking-wide text-white ring-1 ring-purple/40 shadow-none sm:shadow-[0_0_15px_rgba(55,140,210,0.25),0_0_40px_rgba(55,140,210,0.1)] transition-all duration-300 hover:scale-[1.03] sm:hover:shadow-[0_0_20px_rgba(55,140,210,0.4),0_0_50px_rgba(55,140,210,0.15)]"
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
