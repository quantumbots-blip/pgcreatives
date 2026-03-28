"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { SectionLabel } from "@/components/section-label";
import { FloatingParticles } from "@/components/floating-particles";
import { MagneticButton } from "@/components/magnetic-button";

/* ------------------------------------------------------------------ */
/*  Data — swap YouTube IDs + thumbnails with your real content       */
/* ------------------------------------------------------------------ */

const featured = {
  title: "PG Creatives — 2025 Showreel",
  description:
    "A look at the best of our work this year — real estate, commercial, aerial, and branding all in one reel.",
  youtubeId: "dQw4w9WgXcQ", // replace with your showreel ID
  thumbnail: "/images/aerial-lakefront.jpg",
};

const categories = [
  "All",
  "Real Estate",
  "Commercial",
  "Drone",
  "Branding",
];

const videos = [
  {
    title: "Luxury Lakefront Estate Tour",
    category: "Real Estate",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/images/luxury-living-room.jpg",
    duration: "2:34",
  },
  {
    title: "Downtown Green Bay Brand Film",
    category: "Commercial",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/images/video-studio.jpg",
    duration: "1:48",
  },
  {
    title: "Fox River Development Aerial",
    category: "Drone",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/images/aerial-lakefront.jpg",
    duration: "3:12",
  },
  {
    title: "Modern Farmhouse Walkthrough",
    category: "Real Estate",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/images/lakehouse-kitchen.jpg",
    duration: "2:05",
  },
  {
    title: "Restaurant Grand Opening",
    category: "Commercial",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/images/modern-entryway.jpg",
    duration: "1:22",
  },
  {
    title: "Waterfront Property Flyover",
    category: "Drone",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/images/cottage-exterior.jpg",
    duration: "2:50",
  },
  {
    title: "Personal Brand Session",
    category: "Branding",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/images/stone-fireplace-living.jpg",
    duration: "1:35",
  },
  {
    title: "Luxury Estate at Twilight",
    category: "Real Estate",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/images/luxury-estate-night.png",
    duration: "2:18",
  },
  {
    title: "Fitness Brand Launch",
    category: "Branding",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/images/gourmet-kitchen.jpg",
    duration: "1:55",
  },
];

/* ------------------------------------------------------------------ */
/*  Lightbox                                                          */
/* ------------------------------------------------------------------ */

function VideoLightbox({
  youtubeId,
  onClose,
}: {
  youtubeId: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Close video"
      >
        <X className="h-5 w-5" />
      </button>
      <div
        className="relative w-full max-w-5xl px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-xl pt-[56.25%]">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title="Video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function ShowreelPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const filtered =
    activeCategory === "All"
      ? videos
      : videos.filter((v) => v.category === activeCategory);

  return (
    <>
      {/* Lightbox */}
      {activeVideo && (
        <VideoLightbox
          youtubeId={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}

      {/* Hero — Featured Showreel */}
      <section className="relative overflow-hidden bg-background pt-24 pb-16 sm:py-28">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.12)_0%,transparent_60%)]" />
        <div className="absolute right-[8%] top-[30%] h-36 w-36 rounded-full border border-dashed border-purple/8 spin-ring hidden lg:block" />
        <FloatingParticles count={10} />

        <div className="relative mx-auto max-w-7xl px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="max-w-2xl">
              <SectionLabel>Video Showreel</SectionLabel>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white sm:text-5xl">
                See Our Work{" "}
                <span className="text-purple-light">in Motion</span>
              </h1>
              <p className="mt-4 text-lg text-white/50">
                Cinema-quality video production for real estate, brands, and
                businesses across Wisconsin.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Featured video */}
          <AnimateOnScroll animation="fade-in-scale" delay={0.15}>
            <div className="mt-10 sm:mt-14">
              <button
                onClick={() => setActiveVideo(featured.youtubeId)}
                className="group relative block w-full overflow-hidden rounded-2xl"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-[#0a0a2e]">
                  <Image
                    src={featured.thumbnail}
                    alt={featured.title}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080820]/80 via-[#080820]/20 to-[#080820]/30" />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-purple/40 group-hover:bg-purple/20">
                      <Play className="ml-1 h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple-light">
                      Featured Reel
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                      {featured.title}
                    </h2>
                    <p className="mt-1 max-w-xl text-sm text-white/50">
                      {featured.description}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Video Grid */}
      <section className="relative overflow-hidden bg-background py-16 sm:py-24">
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-purple/[0.03] blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionLabel>Browse Videos</SectionLabel>
                <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                  <span className="text-white">Project </span>
                  <span className="text-purple-light">Highlights</span>
                </h2>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Category filter */}
          <AnimateOnScroll animation="fade-up" delay={0.1}>
            <div className="mt-8 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm tracking-wide transition-colors border",
                    activeCategory === cat
                      ? "bg-purple/15 border-purple/15 text-white"
                      : "bg-purple/[0.04] border-purple/15 text-white/50 hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Grid */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((video, i) => (
              <AnimateOnScroll key={video.title} animation="fade-up" delay={i * 0.08}>
                <button
                  onClick={() => setActiveVideo(video.youtubeId)}
                  className="group relative block w-full overflow-hidden rounded-xl text-left"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-[#0a0a2e]">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover transition-all duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080820]/85 via-[#080820]/20 to-transparent transition-opacity" />

                    {/* Play icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-sm text-white transition-all duration-300 group-hover:scale-110 group-hover:border-purple/40 group-hover:bg-purple/25">
                        <Play className="ml-0.5 h-5 w-5" />
                      </div>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-mono text-white/80 backdrop-blur-sm">
                      {video.duration}
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 transition-transform duration-500 group-hover:translate-y-0">
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple-light">
                        {video.category}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-white sm:text-base">
                        {video.title}
                      </h3>
                    </div>
                  </div>
                </button>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background py-16 sm:py-28">
        <AnimateOnScroll animation="fade-up">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              <span className="text-white">Ready for Video That </span>
              <span className="text-purple-light">Sells?</span>
            </h2>
            <p className="mt-4 text-white/50">
              Whether it&apos;s a listing walkthrough, brand film, or aerial
              showcase — let&apos;s make something incredible.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <MagneticButton>
                <Link
                  href="/contact"
                  className="glow-hover inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold tracking-wide text-[#1a1054] transition-all hover:bg-white/90"
                >
                  Book a Shoot
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </MagneticButton>
              <a
                href="tel:+19207770127"
                className="glow-hover inline-flex items-center rounded-lg border border-purple/40 px-8 py-3.5 text-sm tracking-wide text-purple-light transition-all hover:border-purple/60 hover:bg-purple/5"
              >
                (920) 777-0127
              </a>
            </div>
          </div>
        </AnimateOnScroll>
      </section>
    </>
  );
}
