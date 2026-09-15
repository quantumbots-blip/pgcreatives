"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { VideoModal } from "@/components/video-modal";
import { Tilt } from "@/components/tilt";

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
     frames had a label at all.

     Look and placement are separate on purpose. A film tile puts this at the
     bottom of a flex column so the play mark can be centred in the room above
     it; a photo tile positions it absolutely over the picture. When the
     negative margin the film tile needs lived in here, the photo tiles
     inherited it as a STATIC block inside an `overflow-hidden` frame and all
     34 captions were pulled off the top edge and clipped away: the text was
     in the HTML and on none of the screens. */
  const captionBody = (project: Project) => (
    /* The scrim reaches 90% opacity by 40% of its own height, so the 11px
       accent label lands in the dense half of it rather than in the clear top.
       At 70% via the label was measuring 3.4:1 over a light interior, and a
       quarter of the 49 cards failed AA on it. */
    <div className="bg-gradient-to-t from-[#07090c] via-[#07090c]/90 via-40% to-transparent p-4 pt-12 sm:p-5 sm:pt-14">
      <p className="meta meta-signal">{project.category}</p>
      {/* Two lines reserved. The play mark is centred in the room above the
          caption, so a title that wraps made its own card's mark sit 12px
          higher than the ones beside it. */}
      <h3 className="mt-1.5 min-h-[2lh] text-sm font-medium text-white sm:text-base">
        {project.title}
      </h3>
    </div>
  );

  /* The play mark and the caption share one flex column filling the card,
     rather than both being absolutely positioned over it.

     Centred in the whole card, the mark collided with the category label on
     every film tile at exactly the two widths where a new column count makes
     the card shortest: 640px (card 188x235, 1px of overlap) and 1024px (card
     179x224, 6px). Sizing its box against the caption's instead makes that
     impossible at any card height. The negative margin lets it use the 48px
     of the caption's scrim that is still transparent, so on a tall tile the
     mark stays where it always sat. */
  const overlay = (project: Project) => (
    <div className="pointer-events-none absolute inset-0 flex flex-col">
      <div className="flex flex-1 items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-[#07090c]/55 text-white backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-signal group-hover:text-signal-ink sm:h-14 sm:w-14">
          <Play className="ml-0.5 h-5 w-5" />
        </div>
      </div>
      <div className="-mt-12 sm:-mt-14">{captionBody(project)}</div>
    </div>
  );

  const renderVideo = (project: Project, i: number) => (
    <AnimateOnScroll
      key={project.title}
      animation="depth"
      delay={(i % (videosPortrait ? 5 : 3)) * 0.07}
    >
      <Tilt max={5} lift={14}>
      <button
        type="button"
        onClick={() => setActiveVideo(project)}
        aria-label={`Play video: ${project.title}`}
        className={cn(
          "group relative block w-full overflow-hidden rounded-xl border border-line bg-surface text-left",
          /* Reels are shot 9:16. A 4:5 box crops a third of every frame, and
             on a phone that crop was also only 187px wide. Phones get the
             real aspect; from sm the 4:5 tile keeps the grid even. */
          videosPortrait ? "aspect-[9/16] sm:aspect-[4/5]" : "aspect-video"
        )}
      >
        {/* Through next/image, not a raw <img>: these are the heaviest assets
            on the page (15 thumbs at ~80 KB of unoptimized JPEG, all pinned to
            a _640 rendition for a tile that renders under 290px) and one of
            them is the mobile LCP element. AVIF plus a real `sizes` is worth
            roughly half of that 1.2 MB. */}
        {(project.thumbnail || project.vimeoId) && (
          <Image
            src={project.thumbnail || `https://vumbnail.com/${project.vimeoId}.jpg`}
            alt=""
            fill
            className={cn(
              "object-cover transition-transform duration-700 group-hover:scale-[1.04]",
              videosPortrait ? "object-[center_30%]" : "object-[center_35%]"
            )}
            sizes={
              videosPortrait
                ? "(min-width: 1360px) 18vw, (min-width: 1024px) 19vw, (max-width: 640px) 50vw, 33vw"
                : "(min-width: 1360px) 28vw, (min-width: 1024px) 31vw, (max-width: 640px) 100vw, 50vw"
            }
          />
        )}
        {overlay(project)}
      </button>
      </Tilt>
    </AnimateOnScroll>
  );

  /* Stills sit on a dense 4-column grid where the strongest frames take a
     2×2 cell. Thirty-four identical tiles read as a spreadsheet; a few
     frames given room read as a portfolio.

     Two guards, because `feature` is a property of the photo but the layout
     is a property of the SET it lands in:

     - A spanning tile needs enough tiles after it for `grid-flow-dense` to
       backfill around. Filter to Drone and you get three photos that are all
       features; each takes two of three columns, so the third column stayed
       empty down the whole height of the grid.
     - Nothing after the last tile can backfill it, so a feature in final
       position always leaves an L-shaped hole. The last item in the data
       happens to be one, so every unfiltered view ended in a 594×428 gap. */
  const canSpan = (project: Project, i: number, total: number) =>
    Boolean(project.feature) && total > 4 && i !== total - 1;

  const renderPhoto = (project: Project, i: number, all: Project[]) => (
    <AnimateOnScroll
      key={project.title}
      animation="depth"
      delay={(i % 4) * 0.06}
      className={cn(
        "drift group relative overflow-hidden rounded-xl border border-line bg-surface",
        /* The feature span starts at sm. In a single column a doubled row is
           just a portrait box, and every photo here is landscape — it would
           crop the best frames hardest. */
        canSpan(project, i, all.length) && "sm:col-span-2 sm:row-span-2"
      )}
    >
      {project.image && (
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          /* Back to `vw` above the breakpoint. The pixel caps here were
             right while `.shell` plateaued at 1280px; it grows with the
             viewport now, so a fixed 280px claim served a 640px rendition
             into a box that renders 496 on a 1440p display. */
          sizes={
            canSpan(project, i, all.length)
              /* Measured, not estimated. A feature tile spans two of the
                 grid's columns plus the gap between them, so at 1024 it
                 renders 464 of 1024 (45%) and at 820 it renders 497 of 820
                 (61%) — the old 40vw and 50vw were asking for an 828px
                 rendition for a box that needs 928 or 994 at 2x. */
              ? /* The 640-767 band is TWO columns, so a feature tile spanning both is
                   effectively the full content width (683 of 744 at iPad mini),
                   not the 61vw the three-column band gives it. */
                "(min-width: 1360px) 42vw, (min-width: 1024px) 47vw, (min-width: 768px) 61vw, (max-width: 640px) 100vw, 92vw"
              : "(min-width: 1360px) 21vw, (min-width: 1024px) 23vw, (max-width: 640px) 100vw, 33vw"
          }
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        {captionBody(project)}
      </div>
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
                  "inline-flex min-h-11 items-center rounded-full border px-4 text-xs font-medium transition-colors duration-200 sm:min-h-0 sm:px-5 sm:py-2.5 sm:text-sm",
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
          <div className="block-gap">
            <h2 className="meta border-b border-line pb-4">
              Films <span className="text-ink-3">({videos.length})</span>
            </h2>
            {/* Five across on desktop: fifteen reels fill three rows exactly,
                where four columns left three alone on the last. */}
            <div
              className={cn(
                "mt-6 grid gap-3",
                videosPortrait
                  /* 2 / 3 / 4 / 5. Going 3 straight to 5 at 1024 took the
                     tile from 228px to 179px: 21% smaller for a window 256px
                     wider, which is the one thing a responsive grid must
                     never do. */
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  : "sm:grid-cols-2 lg:grid-cols-3",
                "scene"
              )}
            >
              {videos.map(renderVideo)}
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <div className="group-gap">
            <h2 className="meta border-b border-line pb-4">
              Stills <span className="text-ink-3">({photos.length})</span>
            </h2>
            {/* One column on phones. Two columns of 189px tiles put the work
                at 189x144 on a 430px screen — a photography portfolio showing
                its photographs at thumbnail size. Full width is 398x256. */}
            {/* 1 / 2 / 3 / 4. Going one column straight to three at 640 put every
                photograph at 188x176 on a small tablet, which is the thumbnail
                size the single column above was chosen to avoid. A feature
                tile spans two columns, so at two columns it is simply full
                width, which is the right shape for it there. */}
            <div className="scene mt-6 grid auto-rows-[16rem] grid-flow-row-dense grid-cols-1 gap-3 sm:auto-rows-[12rem] sm:grid-cols-2 sm:gap-3 md:auto-rows-[11rem] md:grid-cols-3 lg:auto-rows-[13rem] lg:grid-cols-4">
              {photos.map(renderPhoto)}
            </div>
          </div>
        )}

        {videos.length === 0 && photos.length === 0 && (
          <p className="mt-16 text-ink-2">
            Nothing filed under {activeCategory} yet. Try another subject, or{" "}
            <Link href="/contact" className="text-signal-ink underline underline-offset-4">
              ask us what we have
            </Link>
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
