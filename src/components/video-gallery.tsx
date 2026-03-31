"use client";

import { useState, useCallback } from "react";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoItem {
  vimeoId: string;
  title: string;
  thumbnail?: string;
}

export function VideoGallery({
  videos,
  columns = 3,
}: {
  videos: VideoItem[];
  columns?: 2 | 3 | 4;
}) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const closeModal = useCallback(() => setActiveVideo(null), []);

  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <>
      <div className={cn("grid gap-3 sm:gap-4", gridCols)}>
        {videos.map((video) => (
          <button
            key={video.vimeoId}
            onClick={() => setActiveVideo(video.vimeoId)}
            className="group relative aspect-video overflow-hidden rounded-xl bg-[#0a0a0a] transition-all duration-500 hover:shadow-[0_0_30px_rgba(52,97,209,0.15)]"
          >
            {video.thumbnail && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 h-full w-full object-cover object-[center_35%] transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/80 via-[#000000]/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm border border-purple/35 bg-[#000000]/50 text-purple-light transition-all group-hover:scale-110 group-hover:bg-purple/20">
                <Play className="ml-0.5 h-4 w-4" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-sm font-medium text-white">{video.title}</h3>
            </div>
          </button>
        ))}
      </div>

      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
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
            className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden"
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
