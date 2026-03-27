"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { images } from "@/lib/images";

export function VideoHero() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section className="relative -mt-16 lg:-mt-20 flex min-h-screen items-center overflow-hidden">
      {/* Background image (always visible as fallback) */}
      <Image
        src={images.heroMain}
        alt="Luxury property exterior"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Video layer — renders on top of image when loaded */}
      <video
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[2000ms] ${
          videoLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Overlay gradients — purple-tinted */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080820]/70 via-[#080820]/30 to-[#080820]/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080820]/70 via-transparent to-transparent" />

      {/* Floating decorative elements */}
      <div className="absolute bottom-0 left-1/3 h-[200px] w-[500px] bg-purple/10 blur-[100px] animate-float-slow" />
      <div className="absolute top-1/4 right-[15%] h-[120px] w-[120px] rounded-full bg-purple/8 blur-[60px] animate-float" />
      <div className="absolute bottom-1/3 right-[10%] h-[80px] w-[80px] rounded-full bg-purple-light/5 blur-[40px] animate-float-slow" />

      {/* Geometric floating shapes */}
      <div
        className="absolute top-[20%] right-[20%] h-24 w-24 rotate-45 rounded-2xl border border-purple/10 animate-float-slow hidden lg:block"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-[25%] right-[25%] h-16 w-16 rotate-12 rounded-xl border border-purple/8 animate-float hidden lg:block"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-[40%] right-[12%] h-3 w-3 rounded-full bg-purple/30 animate-float hidden lg:block"
        style={{ animationDelay: "0.5s" }}
      />
      <div
        className="absolute top-[60%] right-[30%] h-2 w-2 rounded-full bg-purple-light/20 animate-float-slow hidden lg:block"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-20">
        <div className="max-w-3xl">
          <div
            className="animate-hero-fade-up mb-6 inline-block rounded-full border border-purple/25 bg-purple/10 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-purple-light">
              Green Bay &amp; Madison, Wisconsin
            </span>
          </div>

          <h1
            className="animate-hero-fade-up text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl"
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
            <Link
              href="/contact"
              className="glow-hover rounded-lg bg-white px-8 py-3.5 text-sm font-semibold tracking-wide text-[#1a1054]"
            >
              Book a Shoot
            </Link>
            <Link
              href="/portfolio"
              className="glow-hover flex items-center gap-2.5 rounded-lg border border-purple/40 px-8 py-3.5 text-sm tracking-wide text-purple-light"
            >
              <Play className="h-3.5 w-3.5" />
              View Our Work
            </Link>
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
