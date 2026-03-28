"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { MagneticButton } from "@/components/magnetic-button";
import { FloatingParticles } from "@/components/floating-particles";

export function VideoHero() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section className="relative -mt-16 lg:-mt-20 flex min-h-screen items-center overflow-hidden">
      {/* Poster image — shows while video loads */}
      <Image
        src="/images/hero-poster.jpg"
        alt="Property showcase"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Video layer — fades in over poster when ready */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero-poster.jpg"
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${
          videoLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Overlay gradients — purple-tinted */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080820]/70 via-[#080820]/30 to-[#080820]/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080820]/70 via-transparent to-transparent" />

      {/* Single subtle ambient glow */}
      <div className="absolute bottom-0 left-1/3 h-[200px] w-[500px] bg-purple/[0.06] blur-[120px]" />
      <FloatingParticles count={12} />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-20">
        <div className="max-w-3xl">
          <div
            className="animate-hero-fade-up mb-6 inline-block rounded-full border border-purple/25 bg-purple/10 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-purple-light">
              Green Bay, Madison, and the Fox Valley
            </span>
          </div>

          <h1
            className="animate-hero-fade-up text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-8xl"
            style={{ animationDelay: "0.15s" }}
          >
            <span className="text-white">Professional</span>
            <br />
            <span className="gradient-text">Grade Media</span>
          </h1>

          <p
            className="animate-hero-fade-up mt-6 max-w-lg text-lg font-light leading-relaxed text-white/55"
            style={{ animationDelay: "0.3s" }}
          >
            Cinema-quality videography, stunning photography, aerial drone
            footage, and immersive 3D tours. We bring your vision to life.
          </p>

          <div
            className="animate-hero-fade-up mt-10 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "0.45s" }}
          >
            <MagneticButton>
              <Link
                href="/contact"
                className="glow-hover rounded-lg bg-white px-8 py-3.5 text-sm font-semibold tracking-wide text-[#1a1054]"
              >
                Book a Shoot
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="/portfolio"
                className="glow-hover flex items-center gap-2.5 rounded-lg border border-purple/40 px-8 py-3.5 text-sm tracking-wide text-purple-light"
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
