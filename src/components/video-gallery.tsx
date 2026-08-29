"use client";

import { useState, useCallback } from "react";
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
          "grid gap-3 sm:gap-4",
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
              "group relative block w-full overflow-hidden rounded-xl bg-[#0a0a0a] text-left transition-all duration-500 hover:shadow-[0_0_30px_rgba(43,111,184,0.15)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-light",
              portrait ? "aspect-[4/5]" : "aspect-video"
            )}
          >
            {video.thumbnail && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={video.thumbnail}
                alt=""
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
                  portrait ? "object-[center_30%]" : "object-[center_35%]"
                )}
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/80 via-[#000000]/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-purple/35 bg-[#000000]/50 text-purple-light backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-purple/20">
                <Play className="ml-0.5 h-4 w-4" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
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
