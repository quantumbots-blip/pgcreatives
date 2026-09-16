"use client";

import { useEffect, useRef, useState } from "react";
import { X, Link2 } from "lucide-react";
import type { CatalogFilm, CatalogPhoto } from "@/lib/newsletter/catalog";
import { safeImage } from "@/lib/newsletter/blocks";
import { cn } from "@/lib/utils";

/**
 * Choosing a picture or a film.
 *
 * A grid of the site's own photographs, because those are already
 * colour graded, already sized and already the brand. A pasted https link
 * is allowed for anything else. The dialog is a real dialog: Escape closes
 * it, focus starts inside it, and the page behind does not scroll.
 */

function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("button, input")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return ref;
}

function Shell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useDialog(onClose);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-t-2xl border border-line bg-surface sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

export function PhotoPicker({
  photos,
  onPick,
  onClose,
}: {
  photos: CatalogPhoto[];
  onPick: (src: string, title: string) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  function applyUrl() {
    const clean = safeImage(url.trim());
    if (!clean || !clean.startsWith("https://")) {
      setUrlError("Paste a full https:// link to a picture. Anything else will not load in an inbox.");
      return;
    }
    onPick(clean, "");
  }

  return (
    <Shell title="Choose a picture" onClose={onClose}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((p) => (
          <button
            key={p.src}
            type="button"
            onClick={() => onPick(p.src, p.title)}
            className="group overflow-hidden rounded-lg border border-line bg-surface-hi text-left transition-colors hover:border-signal-ink focus-visible:border-signal-ink"
          >
            {/* Small renditions through the optimizer; the email uses 1200. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/_next/image?url=${encodeURIComponent(p.src)}&w=640&q=75`}
              alt={p.title}
              loading="lazy"
              className="aspect-[3/2] w-full object-cover"
            />
            <span className="block px-2 py-1.5">
              <span className="block truncate text-[11px] font-medium text-white">{p.title}</span>
              <span className="block text-[10px] text-ink-3">{p.category}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="mt-5 border-t border-line pt-4">
        <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-ink-3">Or a picture from somewhere else</p>
        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setUrlError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && applyUrl()}
            placeholder="https://"
            inputMode="url"
            aria-label="Picture link"
            className="min-h-11 w-full min-w-0 rounded-lg border border-line bg-surface-hi px-3 text-base text-white outline-none placeholder:text-ink-3 focus:border-line-strong sm:text-sm"
          />
          <button
            type="button"
            onClick={applyUrl}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-medium text-ink-2 hover:border-line-strong hover:text-white"
          >
            <Link2 className="h-4 w-4" />
            Use it
          </button>
        </div>
        {urlError && <p className="mt-2 text-xs text-red-300">{urlError}</p>}
        <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
          It has to be on a public https address that will still be there next month. A link to a Vimeo
          poster or a photo on the site is ideal; a Google Drive link is not.
        </p>
      </div>
    </Shell>
  );
}

export function FilmPicker({
  films,
  onPick,
  onClose,
}: {
  films: CatalogFilm[];
  onPick: (f: CatalogFilm) => void;
  onClose: () => void;
}) {
  return (
    <Shell title="Choose a film" onClose={onClose}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {films.map((f) => (
          <button
            key={f.vimeoId}
            type="button"
            onClick={() => onPick(f)}
            className="group overflow-hidden rounded-lg border border-line bg-surface-hi text-left transition-colors hover:border-signal-ink focus-visible:border-signal-ink"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={f.poster}
              alt={f.title}
              loading="lazy"
              className={cn("w-full object-cover", f.portrait ? "aspect-[9/16]" : "aspect-video")}
            />
            <span className="block px-2 py-1.5">
              <span className="block truncate text-[11px] font-medium text-white">{f.title}</span>
              <span className="block text-[10px] text-ink-3">{f.category}</span>
            </span>
          </button>
        ))}
      </div>
    </Shell>
  );
}
