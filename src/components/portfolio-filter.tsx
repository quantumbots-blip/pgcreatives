"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { VideoModal } from "@/components/video-modal";

/* Filtering by subject, not by file type.

   The old tabs were All / Video / Photo, which asks the visitor a question
   about our storage rather than about their problem. An agent looking for
   drone work does not care whether it arrives as a still or a clip. Films and
   stills still get their own headings inside whichever subject is chosen. */
const categories = ["All", "Real Estate", "Drone", "Social Media", "Commercial"] as const;
type Category = (typeof categories)[number];

interface Project {
  title: string;
  category: string;
  type: "photo" | "video";
  image?: string;
  vimeoId?: string;
  thumbnail?: string;
  portrait?: boolean;
  feature?: boolean;
}

export function PortfolioFilter({ projects }: { projects: Project[] }) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [activeVideo, setActiveVideo] = useState<Project | null>(null);

  const shown = useMemo(
    () =>
      activeCategory === "All"
        ? projects
        : projects.filter((p) => p.category === activeCategory),
    [projects, activeCategory]
  );

  const videos = useMemo(() => shown.filter((p) => p.type === "video"), [shown]);
  const photos = useMemo(() => shown.filter((p) => p.type === "photo"), [shown]);

  const closeModal = useCallback(() => setActiveVideo(null), []);

  // Vertical reels get a taller card and an extra column, so a phone shows two
  // per row instead of one 16:9 crop that cut off faces and captions. Decided
  // by majority across ALL videos, not the filtered set, so switching category
  // can never reshape the grid mid-browse.
  const videosPortrait = useMemo(() => {
    const all = projects.filter((p) => p.type === "video");
    return all.filter((v) => v.portrait).length > all.length / 2;
  }, [projects]);

  /* The caption is always visible. It used to appear only on hover, which
     means on a phone — where most of this gets browsed — none of the 34
     frames had a label at all. */
  const caption = (project: Project) => (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07090c] via-[#07090c]/70 to-transparent p-4 pt-12 sm:p-5 sm:pt-14">
      <p className="meta meta-signal">{project.category}</p>
      <h3 className="mt-1.5 text-sm font-medium text-white sm:text-base">
        {project.title}
      </h3>
    </div>
  );

  const renderVideo = (project: Project, i: number) => (
    <AnimateOnScroll
      key={project.title}
      animation="fade-up"
      delay={(i % (videosPortrait ? 4 : 3)) * 0.07}
    >
      <button
        type="button"
        onClick={() => setActiveVideo(project)}
        aria-label={`Play video: ${project.title}`}
        className={cn(
          "viewfinder group relative block w-full overflow-hidden rounded-xl border border-line bg-surface text-left",
          videosPortrait ? "aspect-[4/5]" : "aspect-video"
        )}
      >
        <span className="vf-b" aria-hidden="true" />
        {(project.thumbnail || project.vimeoId) && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={project.thumbnail || `https://vumbnail.com/${project.vimeoId}.jpg`}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]",
              videosPortrait ? "object-[center_30%]" : "object-[center_35%]"
            )}
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-[#07090c]/55 text-white backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-signal group-hover:text-signal sm:h-14 sm:w-14">
            <Play className="ml-0.5 h-5 w-5" />
          </div>
        </div>
        {caption(project)}
      </button>
    </AnimateOnScroll>
  );

  /* Stills sit on a dense 4-column grid where the strongest frames take a
     2×2 cell. Thirty-four identical tiles read as a spreadsheet; a few
     frames given room read as a portfolio. `grid-flow-dense` backfills the
     gaps a spanning tile would otherwise leave. */
  const renderPhoto = (project: Project, i: number) => (
    <AnimateOnScroll
      key={project.title}
      animation="fade-in-scale"
      delay={(i % 4) * 0.06}
      className={cn(
        "viewfinder group relative overflow-hidden rounded-xl border border-line bg-surface",
        project.feature && "col-span-2 row-span-2"
      )}
    >
      <span className="vf-b" aria-hidden="true" />
      {project.image && (
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes={
            project.feature
              ? "(max-width: 640px) 100vw, 50vw"
              : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          }
        />
      )}
      {caption(project)}
    </AnimateOnScroll>
  );

  return (
    <>
      <div className="shell">
        <AnimateOnScroll animation="fade-up">
          <div
            role="group"
            aria-label="Filter portfolio by subject"
            className="flex flex-wrap gap-2"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={cn(
                  "rounded-full border px-4 py-2.5 text-xs font-medium transition-colors duration-200 sm:px-5 sm:text-sm",
                  activeCategory === cat
                    ? "border-white bg-white text-[#07090c]"
                    : "border-line text-ink-3 hover:border-line-strong hover:bg-surface hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </AnimateOnScroll>

        {videos.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <h2 className="meta border-b border-line pb-4">
              Films <span className="text-white/30">({videos.length})</span>
            </h2>
            <div
              className={cn(
                "mt-6 grid gap-3",
                videosPortrait
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  : "sm:grid-cols-2 lg:grid-cols-3"
              )}
            >
              {videos.map(renderVideo)}
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <h2 className="meta border-b border-line pb-4">
              Stills <span className="text-white/30">({photos.length})</span>
            </h2>
            <div className="mt-6 grid auto-rows-[9rem] grid-flow-row-dense grid-cols-2 gap-3 sm:auto-rows-[11rem] sm:grid-cols-3 lg:auto-rows-[13rem] lg:grid-cols-4">
              {photos.map(renderPhoto)}
            </div>
          </div>
        )}

        {videos.length === 0 && photos.length === 0 && (
          <p className="mt-16 text-ink-2">
            Nothing filed under {activeCategory} yet. Try another subject, or{" "}
            <a href="/contact" className="text-signal underline underline-offset-4">
              ask us what we have
            </a>
            .
          </p>
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
