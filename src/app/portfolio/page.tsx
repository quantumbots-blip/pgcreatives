"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { images } from "@/lib/images";

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
      <section className="relative overflow-hidden bg-navy py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-navy-light)_0%,_transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              Portfolio
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Our Best Work
            </h1>
            <p className="mt-4 text-lg text-white/50">
              Browse our collection of professional media created for clients
              across Wisconsin.
            </p>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="bg-black py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 text-sm tracking-wide transition-colors",
                  activeCategory === cat
                    ? "bg-white text-black"
                    : "border border-white/10 text-white/50 hover:text-white hover:border-white/30"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <div
                key={project.title}
                className="group relative aspect-[4/3] overflow-hidden bg-navy/50"
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:from-black/90" />
                {project.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center border border-white/20 bg-black/40 text-white/60 backdrop-blur-sm transition-colors group-hover:border-white/40 group-hover:text-white">
                      <Play className="ml-0.5 h-5 w-5" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                    {project.category}
                  </p>
                  <h3 className="mt-1 font-semibold text-white">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/40 opacity-0 transition-opacity group-hover:opacity-100">
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 bg-navy/30 py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Want Results Like These?
          </h2>
          <p className="mt-4 text-white/50">
            Let&apos;s create stunning media for your property or brand.
          </p>
          <Link
            href="/contact"
            className="mt-10 inline-flex items-center gap-2 bg-white px-8 py-3 text-sm font-medium tracking-wide text-black transition-colors hover:bg-white/90"
          >
            Start Your Project
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
