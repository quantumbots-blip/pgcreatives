"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoModal } from "@/components/video-modal";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

interface VideoItem {
  vimeoId: string;
  title: string;
  thumbnail?: string;
  portrait?: boolean;
}

export function VideoGallery({ videos }: { videos: VideoItem[] }) {
  const [active, setActive] = useState<VideoItem | null>(null);
  const closeModal = useCallback(() => setActive(null), []);

  // Vertical reels get a taller card and one more column, so a phone shows
  // two per row instead of one 16:9 crop that cut off faces and captions.
  // Decided by majority and applied to every card, so one failed oEmbed
  // lookup can't flip the whole grid or leave a single odd-shaped tile.
  const portrait = videos.filter((v) => v.portrait).length > videos.length / 2;

  return (
    <>
      <div
        className={cn(
          "mt-12 grid gap-3 sm:mt-16 sm:gap-4",
          portrait
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            : "sm:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {videos.map((video, i) => (
          <AnimateOnScroll
            key={video.vimeoId}
            animation="fade-up"
            delay={(i % (portrait ? 4 : 3)) * 0.08}
          >
          <button
            type="button"
            onClick={() => setActive(video)}
            aria-label={`Play video: ${video.title}`}
            className={cn(
              "viewfinder group relative block w-full overflow-hidden rounded-xl border border-line bg-surface text-left",
              /* Same as the portfolio grid: reels are 9:16, and a 4:5 box
                 crops a third of every frame off a tile that is only 187px
                 wide on a phone. */
              portrait ? "aspect-[9/16] sm:aspect-[4/5]" : "aspect-video"
            )}
          >
            <span className="vf-b" aria-hidden="true" />
            {video.thumbnail && (
              <Image
                src={video.thumbnail}
                alt=""
                fill
                className={cn(
                  "object-cover transition-transform duration-700 group-hover:scale-[1.04]",
                  portrait ? "object-[center_30%]" : "object-[center_35%]"
                )}
                sizes={
                  portrait
                    ? "(min-width: 1360px) 300px, (min-width: 1024px) 23vw, (max-width: 640px) 50vw, 33vw"
                    : "(min-width: 1360px) 400px, (min-width: 1024px) 31vw, (max-width: 640px) 100vw, 50vw"
                }
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-[#07090c]/55 text-white backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-signal group-hover:text-signal-ink">
                <Play className="ml-0.5 h-4 w-4" />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07090c] via-[#07090c]/70 to-transparent p-4 pt-12">
              <h3 className="text-sm font-medium text-white">{video.title}</h3>
            </div>
          </button>
          </AnimateOnScroll>
        ))}
      </div>

      {active && (
        <VideoModal
          vimeoId={active.vimeoId}
          title={active.title}
          portrait={active.portrait ?? portrait}
          onClose={closeModal}
        />
      )}
    </>
  );
}
