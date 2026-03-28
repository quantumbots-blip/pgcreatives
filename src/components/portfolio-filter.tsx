"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

const categories = [
  "All",
  "Real Estate",
  "Commercial",
  "Drone",
  "3D Tours",
  "Videography",
];

interface Project {
  title: string;
  category: string;
  description: string;
  type: "photo" | "video";
  image: string;
}

export function PortfolioFilter({ projects }: { projects: Project[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? projects
        : projects.filter((p) => p.category === activeCategory),
    [activeCategory, projects]
  );

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Filter tabs */}
      <AnimateOnScroll animation="fade-up">
        <div className="mb-12 flex flex-wrap gap-2">
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <div
            key={project.title}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl hover-lift bg-[#0a0a2e]"
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080820]/85 via-[#080820]/20 to-transparent transition-opacity" />
            {project.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-sm transition-colors border border-purple/35 bg-[#080820]/50 text-purple-light">
                  <Play className="ml-0.5 h-5 w-5" />
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple">
                {project.category}
              </p>
              <h3 className="mt-1 font-semibold text-white">
                {project.title}
              </h3>
              <p className="mt-1 text-sm text-purple-light/55 opacity-0 transition-opacity group-hover:opacity-100">
                {project.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
