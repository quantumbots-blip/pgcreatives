"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { images } from "@/lib/images";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

const categories = [
  "All",
  "Real Estate",
  "Commercial",
  "Drone",
  "3D Tours",
  "Videography",
];

const projects = [
  {
    title: "Luxury Lakefront Estate",
    category: "Real Estate",
    description: "Full photography and video package for a waterfront property.",
    type: "photo" as const,
    image: images.luxuryLakefront,
  },
  {
    title: "Downtown Green Bay Brand Film",
    category: "Commercial",
    description: "Cinema-quality brand story for a local business.",
    type: "video" as const,
    image: images.downtownCommercial,
  },
  {
    title: "Fox River Development Overview",
    category: "Drone",
    description: "Aerial documentation of a new residential development.",
    type: "photo" as const,
    image: images.aerialProperty,
  },
  {
    title: "Modern Farmhouse Virtual Tour",
    category: "3D Tours",
    description: "Interactive 3D walkthrough for a newly built home.",
    type: "video" as const,
    image: images.modernHome,
  },
  {
    title: "Corporate Headquarters Showcase",
    category: "Commercial",
    description: "Professional photography for a corporate campus.",
    type: "photo" as const,
    image: images.restaurant,
  },
  {
    title: "Listing Walkthrough Video",
    category: "Videography",
    description: "Cinematic property walkthrough for MLS listing.",
    type: "video" as const,
    image: images.brandVideo,
  },
  {
    title: "Waterfront Condo Complex",
    category: "Real Estate",
    description: "Multi-unit listing photography with drone aerials.",
    type: "photo" as const,
    image: images.waterfrontCondo,
  },
  {
    title: "Restaurant Grand Opening",
    category: "Commercial",
    description: "Event coverage and brand photography for a new restaurant.",
    type: "photo" as const,
    image: images.waterfrontDev,
  },
  {
    title: "Suburban Neighborhood Aerial",
    category: "Drone",
    description: "Neighborhood context shots for a real estate development.",
    type: "photo" as const,
    image: images.suburbanAerial,
  },
  {
    title: "Historic Home Renovation",
    category: "Real Estate",
    description: "Before and after documentation of a historic restoration.",
    type: "photo" as const,
    image: images.historicHome,
  },
  {
    title: "Boutique Hotel Tour",
    category: "3D Tours",
    description: "Full Matterport scan of a boutique hotel property.",
    type: "video" as const,
    image: images.boutiqueHotel,
  },
  {
    title: "Fitness Brand Campaign",
    category: "Videography",
    description: "Multi-platform video content for a fitness brand launch.",
    type: "video" as const,
    image: images.fitnessBrand,
  },
];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-28" style={{ background: "#080820" }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top right, #0f0f3d 0%, transparent 55%)",
          }}
        />
        <div className="absolute left-10 top-40 h-48 w-48 rounded-full bg-purple/[0.03] blur-[60px] animate-float" />
        <div className="absolute right-[8%] top-[25%] h-32 w-32 rounded-full border border-dashed border-purple/10 spin-ring hidden lg:block" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center rounded-full border px-3 py-1" style={{ borderColor: "rgba(139,92,246,0.25)", background: "rgba(139,92,246,0.10)" }}>
              <span className="text-xs font-medium uppercase tracking-[0.25em]" style={{ color: "#C4B5FD" }}>
                Portfolio
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              <span className="gradient-text-animated">Our Best Work</span>
            </h1>
            <p className="mt-4 text-lg" style={{ color: "rgba(196,181,253,0.55)" }}>
              Browse our collection of professional media created for clients
              across Wisconsin.
            </p>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-16" style={{ background: "#080820" }}>
        <div className="mx-auto max-w-7xl px-6">
          {/* Filter tabs */}
          <AnimateOnScroll animation="fade-up">
            <div className="mb-12 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm tracking-wide transition-colors",
                    activeCategory === cat
                      ? "text-white"
                      : "text-white/50 hover:text-white"
                  )}
                  style={
                    activeCategory === cat
                      ? { background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.15)" }
                      : { background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)" }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <div
                key={project.title}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl hover-lift"
                style={{ background: "#0a0a2e" }}
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div
                  className="absolute inset-0 transition-opacity"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(8,8,32,0.85) 0%, rgba(8,8,32,0.2) 50%, transparent 100%)",
                  }}
                />
                {project.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-sm transition-colors"
                      style={{
                        border: "1px solid rgba(139,92,246,0.35)",
                        background: "rgba(8,8,32,0.50)",
                        color: "#C4B5FD",
                      }}
                    >
                      <Play className="ml-0.5 h-5 w-5" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
                  <p
                    className="text-[10px] font-medium uppercase tracking-[0.2em]"
                    style={{ color: "#8B5CF6" }}
                  >
                    {project.category}
                  </p>
                  <h3 className="mt-1 font-semibold text-white">
                    {project.title}
                  </h3>
                  <p
                    className="mt-1 text-sm opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: "rgba(196,181,253,0.55)" }}
                  >
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-28"
        style={{
          borderTop: "1px solid rgba(139,92,246,0.12)",
          background: "#0a0a2e",
        }}
      >
        <AnimateOnScroll animation="fade-up">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="text-white">Want Results </span>
            <span className="gradient-text-animated gradient-underline">Like These?</span>
          </h2>
          <p className="mt-4" style={{ color: "rgba(196,181,253,0.55)" }}>
            Let&apos;s create stunning media for your property or brand.
          </p>
          <Link
            href="/contact"
            className="mt-10 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-medium tracking-wide transition-colors hover:bg-white/90"
            style={{ color: "#1a1054" }}
          >
            Start Your Project
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        </AnimateOnScroll>
      </section>
    </>
  );
}
