"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

const categories = ["All", "Video", "Photo"];

interface Project {
  title: string;
  category: string;
  type: "photo" | "video";
  image?: string;
  vimeoId?: string;
  thumbnail?: string;
}

export function PortfolioFilter({ projects }: { projects: Project[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const videos = useMemo(() => projects.filter((p) => p.type === "video"), [projects]);
  const photos = useMemo(() => projects.filter((p) => p.type === "photo"), [projects]);

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? projects
        : projects.filter((p) => p.type === activeCategory.toLowerCase()),
    [activeCategory, projects]
  );

  const closeModal = useCallback(() => setActiveVideo(null), []);

  const showSplit = activeCategory === "All";

  const renderCard = (project: Project) => (
    <div
      key={project.title}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-[#0a0a0a] transition-shadow duration-500 hover:shadow-[0_0_30px_rgba(43,111,184,0.15)]",
        project.type === "video" ? "aspect-video cursor-pointer" : "aspect-[4/3]"
      )}
      onClick={
        project.type === "video" && project.vimeoId
          ? () => setActiveVideo(project.vimeoId!)
          : undefined
      }
    >
      {project.type === "photo" && project.image ? (
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (project.thumbnail || project.vimeoId) ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={project.thumbnail || `https://vumbnail.com/${project.vimeoId}.jpg`}
          alt={project.title}
          className="absolute inset-0 h-full w-full object-cover object-[center_35%] transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/85 via-[#000000]/20 to-transparent transition-opacity" />

      {project.type === "video" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-sm transition-all border border-purple/35 bg-[#000000]/50 text-purple-light group-hover:scale-110 group-hover:bg-purple/20">
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
      </div>
    </div>
  );

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {/* Filter tabs */}
        <AnimateOnScroll animation="fade-up">
          <div className="mb-8 sm:mb-12 -mx-5 sm:-mx-6 px-5 sm:px-6 overflow-x-auto [&::-webkit-scrollbar]:hidden flex flex-nowrap whitespace-nowrap gap-2">
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

        {showSplit ? (
          <>
            {/* Videos section */}
            {videos.length > 0 && (
              <div className="mb-12">
                <h3 className="mb-6 text-lg font-semibold text-white sm:text-xl">
                  Videos
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {videos.map(renderCard)}
                </div>
              </div>
            )}

            {/* Photos section */}
            {photos.length > 0 && (
              <div>
                <h3 className="mb-6 text-lg font-semibold text-white sm:text-xl">
                  Photos
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {photos.map(renderCard)}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(renderCard)}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-2 sm:p-8"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative w-full max-w-6xl aspect-video rounded-none sm:rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://player.vimeo.com/video/${activeVideo}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&title=0&byline=0&portrait=0`}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
