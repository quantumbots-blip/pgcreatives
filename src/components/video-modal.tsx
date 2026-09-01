"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { setBackgroundInert } from "@/lib/inert-background";

/**
 * Fullscreen Vimeo player dialog shared by the portfolio and services pages.
 *
 * Behaves like a real dialog: Escape closes it, focus lands on the close
 * button when it opens and goes back to whatever opened it when it closes,
 * and the page behind it stops scrolling. The frame is sized to the video's
 * orientation — every reel on the site is vertical, and a 9:16 video inside a
 * 16:9 box was a thin strip between two black bars.
 */
export function VideoModal({
  vimeoId,
  title,
  portrait = false,
  onClose,
}: {
  vimeoId: string;
  title: string;
  portrait?: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setBackgroundInert(true);
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      setBackgroundInert(false);
      opener?.focus?.();
    };
  }, [onClose]);

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#07090c]/96 p-3 sm:p-8"
      onClick={onClose}
    >
      {/* Focus sentinels.

          `aria-modal` is a promise to assistive technology, not an enforcement
          mechanism, and a Tab-key handler cannot do the job here: the Vimeo
          iframe is cross-origin, so once focus is inside the player its key
          events never reach this document and we never see the Tab that takes
          focus back out. These two live in OUR document, so whichever end
          focus leaves by, one of them catches it and sends it to the other. */}
      <span
        tabIndex={0}
        aria-hidden="true"
        onFocus={() => frameRef.current?.focus()}
      />

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-white transition-colors hover:bg-surface-hi focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:right-4 sm:top-4"
        aria-label="Close video"
      >
        <X className="h-5 w-5" />
      </button>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-black",
          portrait
            ? "aspect-[9/16] h-[min(88svh,calc((100vw-1.5rem)*16/9))] max-w-full"
            : "aspect-video w-full max-w-6xl max-h-[88svh]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          ref={frameRef}
          src={`https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&title=0&byline=0&portrait=0&dnt=1`}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          allowFullScreen
        />
      </div>

      <span
        tabIndex={0}
        aria-hidden="true"
        onFocus={() => closeRef.current?.focus()}
      />
    </div>
  );

  /* Rendered into <body>, not in place.

     The dialog is opened from inside the page content, and marking that
     subtree `inert` to keep focus out of the background would otherwise make
     the dialog inert too — it is a descendant of the thing being disabled. A
     portal moves it out from under `#page-content` so `inert` applies to the
     background only, and frees the overlay from any stacking context its
     ancestors create.

     No mounted flag needed: this component only ever renders in response to a
     click, which is necessarily after hydration. The guard is for safety, not
     for a server pass. */
  if (typeof document === "undefined") return null;
  return createPortal(dialog, document.body);
}
