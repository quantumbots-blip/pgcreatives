"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Link2, Upload, Loader2, Check, Trash2, ImageIcon } from "lucide-react";
import type { CatalogFilm, CatalogPerson, CatalogPhoto } from "@/lib/newsletter/catalog";
import type { MediaItem } from "@/lib/newsletter/db";
import { safeImage } from "@/lib/newsletter/blocks";
import { pic } from "@/lib/newsletter/render";
import { deleteMediaAction } from "@/app/actions/newsletter";
import { cn } from "@/lib/utils";

/**
 * Choosing a picture or a film.
 *
 * Three shelves: the owner's own uploads (this month's houses, straight
 * off the phone), the site's photographs (already graded, already the
 * brand), and the team. Uploads happen right here, by dropping files on
 * the shelf or picking them, and a photo that has just landed is selected
 * in the same motion. A pasted https link is allowed for anything else.
 *
 * The dialog is a real dialog: Escape closes it, focus starts inside it,
 * and the page behind does not scroll.
 */

export type Picked = { src: string; title: string; role?: string };
type Tab = "uploads" | "site" | "team";

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
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
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
        {footer && <div className="border-t border-line px-4 py-3 sm:px-5">{footer}</div>}
      </div>
    </div>
  );
}

const TILE =
  "group relative overflow-hidden rounded-lg border bg-surface-hi text-left transition-colors focus-visible:border-signal-ink";

function Tile({
  src,
  title,
  sub,
  selected,
  round,
  onClick,
  onDelete,
}: {
  src: string;
  title: string;
  sub?: string;
  selected: boolean;
  round?: boolean;
  onClick: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className={cn(TILE, selected ? "border-signal-ink" : "border-line hover:border-signal-ink")}>
      <button type="button" onClick={onClick} className="block w-full text-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title}
          loading="lazy"
          className={cn("w-full object-cover", round ? "aspect-square" : "aspect-[3/2]")}
        />
        <span className="block px-2 py-1.5">
          <span className="block truncate text-[11px] font-medium text-white">{title}</span>
          {sub && <span className="block truncate text-[10px] text-ink-3">{sub}</span>}
        </span>
      </button>
      {selected && (
        <span className="absolute left-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-signal text-white">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${title}`}
          className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/55 text-white opacity-0 transition-opacity hover:bg-red-500/80 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function PhotoPicker({
  photos,
  team,
  startTab,
  multiple,
  onPick,
  onClose,
}: {
  photos: CatalogPhoto[];
  team: CatalogPerson[];
  startTab?: Tab;
  /** How many may be chosen at once. Omitted means one, chosen on click. */
  multiple?: number;
  onPick: (picked: Picked[]) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>(startTab ?? "uploads");
  const [uploads, setUploads] = useState<MediaItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [chosen, setChosen] = useState<Picked[]>([]);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const limit = multiple ?? 1;

  const load = useCallback(() => {
    fetch("/api/newsletter/media", { credentials: "same-origin" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        const data = (await r.json()) as { items: MediaItem[] };
        setUploads(data.items);
      })
      .catch(() => setLoadError("Could not load your photos. Try again in a moment."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function choose(p: Picked) {
    if (limit === 1) {
      onPick([p]);
      return;
    }
    setChosen((c) => {
      const has = c.some((x) => x.src === p.src);
      if (has) return c.filter((x) => x.src !== p.src);
      if (c.length >= limit) return c;
      return [...c, p];
    });
  }

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|heic)$/i.test(f.name));
    if (list.length === 0) {
      setUploadNote("Those are not pictures.");
      return;
    }
    setUploading(true);
    setUploadNote(null);
    const form = new FormData();
    for (const f of list.slice(0, 12)) form.append("files", f);
    try {
      const r = await fetch("/api/newsletter/upload", { method: "POST", body: form, credentials: "same-origin" });
      const data = (await r.json()) as { saved?: MediaItem[]; failed?: { name: string; reason: string }[]; error?: string };
      if (!r.ok || data.error) throw new Error(data.error ?? `${r.status}`);
      const saved = data.saved ?? [];
      setUploads((u) => [...saved, ...(u ?? [])]);
      const failed = data.failed ?? [];
      setUploadNote(
        `${saved.length} added${failed.length ? `, ${failed.length} could not be used (${failed.map((f) => `${f.name}: ${f.reason}`).join("; ")})` : ""}.`,
      );
      // What just landed is what they came to add.
      const picked = saved.map((m) => ({ src: `/media/u/${m.key}.jpg`, title: m.filename.replace(/\.[a-z0-9]+$/i, "") }));
      if (limit === 1 && picked[0]) onPick([picked[0]]);
      else setChosen((c) => [...c, ...picked].slice(0, limit));
    } catch (err) {
      setUploadNote(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  async function remove(item: MediaItem) {
    const r = await deleteMediaAction(item.key);
    if (r.error) {
      setUploadNote(r.error);
      return;
    }
    setUploads((u) => (u ?? []).filter((x) => x.key !== item.key));
    setChosen((c) => c.filter((x) => x.src !== `/media/u/${item.key}.jpg`));
  }

  function applyUrl() {
    const clean = safeImage(url.trim());
    if (!clean || !clean.startsWith("https://")) {
      setUrlError("Paste a full https:// link to a picture. Anything else will not load in an inbox.");
      return;
    }
    choose({ src: clean, title: "" });
    setUrl("");
  }

  const tabs: { value: Tab; label: string }[] = [
    { value: "uploads", label: `Your photos${uploads ? ` (${uploads.length})` : ""}` },
    { value: "site", label: "Site photos" },
    { value: "team", label: "Team" },
  ];

  const isChosen = (src: string) => chosen.some((c) => c.src === src);

  return (
    <Shell
      title={limit > 1 ? `Choose up to ${limit} photos` : "Choose a picture"}
      onClose={onClose}
      footer={
        limit > 1 ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-ink-3">
              {chosen.length} chosen
            </p>
            <button
              type="button"
              disabled={chosen.length === 0}
              onClick={() => onPick(chosen)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-signal px-3.5 text-xs font-semibold text-white hover:bg-[#3480d2] disabled:opacity-50"
            >
              Add {chosen.length || ""} {chosen.length === 1 ? "photo" : "photos"}
            </button>
          </div>
        ) : undefined
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-1 rounded-lg border border-line bg-surface-hi p-0.5" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "min-h-9 flex-1 rounded-md px-3 text-xs font-medium transition-colors",
              tab === t.value ? "bg-[rgba(43,111,184,0.2)] text-signal-ink" : "text-ink-3 hover:text-ink-2",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "uploads" && (
        <div className="space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void upload(e.dataTransfer.files);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors",
              dragOver ? "border-signal-ink bg-[rgba(43,111,184,0.08)]" : "border-line-strong",
            )}
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin text-signal-ink" /> : <Upload className="h-5 w-5 text-signal-ink" />}
            <p className="text-sm text-white">{uploading ? "Uploading" : "Drop this month's photos here"}</p>
            <p className="text-[11px] text-ink-3">JPEG, PNG or HEIC straight off the phone. Up to 12 at a time. They are resized on the way in.</p>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
              className="mt-1 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-medium text-ink-2 hover:border-line-strong hover:text-white disabled:opacity-50"
            >
              <ImageIcon className="h-4 w-4" />
              Choose files
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*,.heic"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files) void upload(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          {uploadNote && <p className="text-xs text-ink-2">{uploadNote}</p>}
          {loadError && <p className="text-xs text-red-300">{loadError}</p>}
          {uploads && uploads.length === 0 && !loadError && (
            <p className="text-xs text-ink-3">Nothing uploaded yet. Drop a few and they stay here for next month too.</p>
          )}
          {uploads && uploads.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {uploads.map((m) => {
                const src = `/media/u/${m.key}.jpg`;
                return (
                  <Tile
                    key={m.key}
                    src={pic(src, 400, 267, "")}
                    title={m.filename.replace(/\.[a-z0-9]+$/i, "") || "Photo"}
                    sub={`${m.width} x ${m.height}`}
                    selected={isChosen(src)}
                    onClick={() => choose({ src, title: m.filename.replace(/\.[a-z0-9]+$/i, "") })}
                    onDelete={() => void remove(m)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "site" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p) => (
            <Tile
              key={p.src}
              src={pic(p.src, 400, 267, "")}
              title={p.title}
              sub={p.category}
              selected={isChosen(p.src)}
              onClick={() => choose({ src: p.src, title: p.title })}
            />
          ))}
        </div>
      )}

      {tab === "team" && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {team.map((p) => (
            <Tile
              key={p.src}
              src={pic(p.src, 240, 240, "")}
              title={p.name}
              sub={p.role}
              round
              selected={isChosen(p.src)}
              onClick={() => choose({ src: p.src, title: p.name, role: p.role })}
            />
          ))}
        </div>
      )}

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
          It has to be on a public https address that will still be there next month. Uploading it here is safer.
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
