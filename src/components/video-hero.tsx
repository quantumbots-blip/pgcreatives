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

      {/* Overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-20">
        <div className="max-w-3xl">
          <p className="animate-hero-fade-up mb-6 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
            Green Bay &amp; Madison, Wisconsin
          </p>

          <h1
            className="animate-hero-fade-up text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-8xl"
            style={{ animationDelay: "0.15s" }}
          >
            Professional
            <br />
            Grade Media
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
              className="bg-white px-8 py-3.5 text-sm font-medium tracking-wide text-black transition-colors hover:bg-white/90"
            >
              Book a Shoot
            </Link>
            <Link
              href="/portfolio"
              className="flex items-center gap-2.5 border border-white/20 px-8 py-3.5 text-sm tracking-wide text-white transition-colors hover:border-white/40 hover:bg-white/5"
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
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/25">
            Scroll
          </span>
          <div className="animate-hero-line h-10 w-px bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </div>
    </section>
  );
}
