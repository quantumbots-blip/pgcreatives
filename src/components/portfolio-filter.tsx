"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { VideoModal } from "@/components/video-modal";

const categories = ["All", "Video", "Photo"];

interface Project {
  title: string;
  category: string;
  type: "photo" | "video";
  image?: string;
  vimeoId?: string;
  thumbnail?: string;
  portrait?: boolean;
}

export function PortfolioFilter({ projects }: { projects: Project[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeVideo, setActiveVideo] = useState<Project | null>(null);

  const videos = useMemo(() => projects.filter((p) => p.type === "video"), [projects]);
  const photos = useMemo(() => projects.filter((p) => p.type === "photo"), [projects]);

  const closeModal = useCallback(() => setActiveVideo(null), []);

  // Vertical reels get a taller card and an extra column, so a phone shows
  // two per row instead of one 16:9 crop that cut off faces and captions.
  // Decided by majority and applied to every card, so one failed oEmbed
  // lookup can't flip the whole grid or leave a single odd-shaped tile.
  const videosPortrait =
    videos.filter((v) => v.portrait).length > videos.length / 2;
  const videoGrid = videosPortrait
    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
    : "sm:grid-cols-2 lg:grid-cols-3";
  const photoGrid = "sm:grid-cols-2 lg:grid-cols-3";

  const caption = (project: Project) => (
    <div className="absolute bottom-0 left-0 right-0 translate-y-1 p-3 transition-transform duration-500 group-hover:translate-y-0 sm:p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-purple-light/80">
        {project.category}
      </p>
      <h3 className="mt-1 text-sm font-semibold text-white sm:text-base">
        {project.title}
      </h3>
    </div>
  );

  const renderVideo = (project: Project) => (
    <button
      key={project.title}
      type="button"
      onClick={() => setActiveVideo(project)}
      aria-label={`Play video: ${project.title}`}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-[#0a0a0a] text-left transition-shadow duration-500 hover:shadow-[0_0_30px_rgba(43,111,184,0.15)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-light",
        videosPortrait ?"aspect-[4/5]" : "aspect-video"
      )}
    >
      {(project.thumbnail || project.vimeoId) && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={project.thumbnail || `https://vumbnail.com/${project.vimeoId}.jpg`}
          alt=""
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
            videosPortrait ?"object-[center_30%]" : "object-[center_35%]"
          )}
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/85 via-[#000000]/20 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-purple/35 bg-[#000000]/50 text-purple-light backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-purple/20 sm:h-14 sm:w-14">
          <Play className="ml-0.5 h-5 w-5" />
        </div>
      </div>
      {caption(project)}
    </button>
  );

  const renderPhoto = (project: Project) => (
    <div
      key={project.title}
      className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#0a0a0a] transition-shadow duration-500 hover:shadow-[0_0_30px_rgba(43,111,184,0.15)]"
    >
      {project.image && (
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/85 via-[#000000]/20 to-transparent" />
      {caption(project)}
    </div>
  );

  const showVideos = activeCategory !== "Photo";
  const showPhotos = activeCategory !== "Video";
  const showHeadings = activeCategory === "All";

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {/* Filter tabs */}
        <AnimateOnScroll animation="fade-up">
          <div
            role="group"
            aria-label="Filter portfolio"
            className="mb-8 flex flex-wrap gap-2 sm:mb-12"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={cn(
                  "rounded-lg border px-4 py-3 text-sm tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-light",
                  activeCategory === cat
                    ? "border-purple/15 bg-purple/15 text-white"
                    : "border-purple/15 bg-purple/[0.04] text-white/50 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </AnimateOnScroll>

        {showVideos && videos.length > 0 && (
          <div className={showPhotos ? "mb-12" : ""}>
            {showHeadings && (
              <h2 className="mb-6 text-lg font-semibold text-white sm:text-xl">
                Videos
              </h2>
            )}
            <div className={cn("grid gap-3", videoGrid)}>
              {videos.map(renderVideo)}
            </div>
          </div>
        )}

        {showPhotos && photos.length > 0 && (
          <div>
            {showHeadings && (
              <h2 className="mb-6 text-lg font-semibold text-white sm:text-xl">
                Photos
              </h2>
            )}
            <div className={cn("grid gap-3", photoGrid)}>
              {photos.map(renderPhoto)}
            </div>
          </div>
        )}
      </div>

      {activeVideo?.vimeoId && (
        <VideoModal
          vimeoId={activeVideo.vimeoId}
          title={activeVideo.title}
          portrait={activeVideo.portrait ?? videosPortrait}
          onClose={closeModal}
        />
      )}
    </>
  );
}
