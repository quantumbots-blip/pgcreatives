"use client";

import { useState } from "react";
import { ImageIcon, Clapperboard, X } from "lucide-react";
import type { Block, BlockKind } from "@/lib/newsletter/blocks";
import type { CatalogFilm, CatalogPhoto } from "@/lib/newsletter/catalog";
import { imageUrl } from "@/lib/newsletter/render";
import { cn } from "@/lib/utils";
import { FilmPicker, PhotoPicker } from "./picker";

/**
 * The fields for one block. Small, plain controls, labelled in the words
 * the owner would use rather than the code's: "the line the inbox shows"
 * not "preheader", "describe the picture" not "alt".
 */

type Patch<K extends BlockKind> = Partial<Extract<Block, { kind: K }>>;

export function BlockFields({
  block,
  locked,
  photos,
  films,
  onChange,
}: {
  block: Block;
  locked: boolean;
  photos: CatalogPhoto[];
  films: CatalogFilm[];
  onChange: (patch: Partial<Block>) => void;
}) {
  switch (block.kind) {
    case "hero":
      return (
        <div className="space-y-3">
          <PictureField
            value={block.image}
            alt={block.alt}
            locked={locked}
            photos={photos}
            onPick={(src, title) => onChange({ image: src, alt: block.alt || title } as Patch<"hero">)}
            onClear={() => onChange({ image: "" } as Patch<"hero">)}
          />
          {block.image && (
            <Text label="Describe the picture" hint="Read aloud by screen readers and shown when pictures are off." value={block.alt} locked={locked} onChange={(alt) => onChange({ alt } as Patch<"hero">)} />
          )}
          <Text label="Headline" value={block.title} locked={locked} onChange={(title) => onChange({ title } as Patch<"hero">)} placeholder="Hi {{first_name}}, here is September" />
          <Area label="Line under it" value={block.sub} locked={locked} rows={2} onChange={(sub) => onChange({ sub } as Patch<"hero">)} />
          <Text label="Where the picture links to" hint="Optional. Starts with https://" value={block.href} locked={locked} onChange={(href) => onChange({ href } as Patch<"hero">)} placeholder="https://pgcreativeswi.com/portfolio" inputMode="url" />
        </div>
      );
    case "heading":
      return (
        <div className="space-y-3">
          <Text label="Small label above" hint="Optional, in the accent color." value={block.label} locked={locked} onChange={(label) => onChange({ label } as Patch<"heading">)} placeholder="New this month" />
          <Text label="Heading" value={block.text} locked={locked} onChange={(text) => onChange({ text } as Patch<"heading">)} placeholder="A crew in Milwaukee" />
        </div>
      );
    case "text":
      return (
        <Area
          label="Paragraphs"
          hint="A blank line starts a new paragraph. **bold** for bold, [words](https://link) for a link."
          value={block.text}
          locked={locked}
          rows={6}
          onChange={(text) => onChange({ text } as Patch<"text">)}
        />
      );
    case "image":
      return (
        <div className="space-y-3">
          <PictureField
            value={block.image}
            alt={block.alt}
            locked={locked}
            photos={photos}
            onPick={(src, title) => onChange({ image: src, alt: block.alt || title } as Patch<"image">)}
            onClear={() => onChange({ image: "" } as Patch<"image">)}
          />
          <Text label="Describe the picture" hint="Read aloud by screen readers and shown when pictures are off." value={block.alt} locked={locked} onChange={(alt) => onChange({ alt } as Patch<"image">)} />
          <Text label="Caption" hint="Optional, small, under the picture." value={block.caption} locked={locked} onChange={(caption) => onChange({ caption } as Patch<"image">)} />
          <Text label="Where it links to" hint="Optional. Starts with https://" value={block.href} locked={locked} onChange={(href) => onChange({ href } as Patch<"image">)} inputMode="url" />
        </div>
      );
    case "feature":
      return (
        <div className="space-y-3">
          <PictureField
            value={block.image}
            alt={block.alt}
            locked={locked}
            photos={photos}
            onPick={(src, title) => onChange({ image: src, alt: block.alt || title } as Patch<"feature">)}
            onClear={() => onChange({ image: "" } as Patch<"feature">)}
          />
          {block.image && (
            <Text label="Describe the picture" value={block.alt} locked={locked} onChange={(alt) => onChange({ alt } as Patch<"feature">)} />
          )}
          <Segmented
            label="Picture on the"
            value={block.side}
            locked={locked}
            options={[
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ]}
            onChange={(side) => onChange({ side } as Patch<"feature">)}
          />
          <Text label="Heading" value={block.title} locked={locked} onChange={(title) => onChange({ title } as Patch<"feature">)} />
          <Area label="Text" value={block.text} locked={locked} rows={4} onChange={(text) => onChange({ text } as Patch<"feature">)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Text label="Link label" hint="Optional, shown under the text." value={block.buttonLabel} locked={locked} onChange={(buttonLabel) => onChange({ buttonLabel } as Patch<"feature">)} placeholder="See what is included" />
            <Text label="Link" value={block.href} locked={locked} onChange={(href) => onChange({ href } as Patch<"feature">)} placeholder="https://" inputMode="url" />
          </div>
        </div>
      );
    case "film":
      return (
        <FilmField
          value={block.vimeoId}
          title={block.title}
          poster={block.poster}
          portrait={block.portrait}
          locked={locked}
          films={films}
          onPick={(f) => onChange({ vimeoId: f.vimeoId, title: f.title, category: f.category, poster: f.poster, portrait: f.portrait } as Patch<"film">)}
          onClear={() => onChange({ vimeoId: "", poster: "", title: "", category: "" } as Patch<"film">)}
        />
      );
    case "button":
      return (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Text label="Label" value={block.label} locked={locked} onChange={(label) => onChange({ label } as Patch<"button">)} placeholder="Book a shoot" />
            <Text label="Link" value={block.href} locked={locked} onChange={(href) => onChange({ href } as Patch<"button">)} placeholder="https://pgcreativeswi.com/contact" inputMode="url" />
          </div>
          <Segmented
            label="Style"
            value={block.style}
            locked={locked}
            options={[
              { value: "solid", label: "Filled" },
              { value: "outline", label: "Outlined" },
            ]}
            onChange={(style) => onChange({ style } as Patch<"button">)}
          />
        </div>
      );
    case "quote":
      return (
        <div className="space-y-3">
          <Area label="What they said" value={block.text} locked={locked} rows={3} onChange={(text) => onChange({ text } as Patch<"quote">)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Text label="Who" value={block.name} locked={locked} onChange={(name) => onChange({ name } as Patch<"quote">)} placeholder="Heather Zeitler" />
            <Text label="Brokerage or role" value={block.role} locked={locked} onChange={(role) => onChange({ role } as Patch<"quote">)} placeholder="Coldwell Banker" />
          </div>
        </div>
      );
    case "divider":
      return <p className="text-xs text-ink-3">A hairline across the email. Nothing to set.</p>;
    case "spacer":
      return (
        <Segmented
          label="How much"
          value={block.size}
          locked={locked}
          options={[
            { value: "s", label: "A little" },
            { value: "m", label: "Some" },
            { value: "l", label: "A lot" },
          ]}
          onChange={(size) => onChange({ size } as Patch<"spacer">)}
        />
      );
  }
}

/* ── Controls ───────────────────────────────────────────────────────── */

const INPUT =
  "w-full min-w-0 rounded-lg border border-line bg-surface-hi px-3 text-base text-white outline-none transition-colors placeholder:text-ink-3 focus:border-line-strong disabled:opacity-70 sm:text-sm";

function Label({ label, hint }: { label: string; hint?: string }) {
  return (
    <span className="mb-1 block">
      <span className="block text-[11px] uppercase tracking-[0.12em] text-ink-3">{label}</span>
      {hint && <span className="mt-0.5 block text-[11px] normal-case leading-snug tracking-normal text-ink-3/80">{hint}</span>}
    </span>
  );
}

function Text({
  label,
  hint,
  value,
  locked,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  hint?: string;
  value: string;
  locked: boolean;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "url" | "text";
}) {
  return (
    <label className="block">
      <Label label={label} hint={hint} />
      <input
        value={value}
        disabled={locked}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete="off"
        className={cn(INPUT, "min-h-11")}
      />
    </label>
  );
}

function Area({
  label,
  hint,
  value,
  locked,
  rows,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  locked: boolean;
  rows: number;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <Label label={label} hint={hint} />
      <textarea
        value={value}
        disabled={locked}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={cn(INPUT, "py-2.5 leading-relaxed")}
      />
    </label>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  locked,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  locked: boolean;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <Label label={label} />
      <div className="inline-flex rounded-lg border border-line bg-surface-hi p-0.5" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            disabled={locked}
            onClick={() => onChange(o.value)}
            className={cn(
              "min-h-9 rounded-md px-3 text-xs font-medium transition-colors disabled:opacity-70",
              value === o.value ? "bg-[rgba(43,111,184,0.2)] text-signal-ink" : "text-ink-3 hover:text-ink-2",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PictureField({
  value,
  alt,
  locked,
  photos,
  onPick,
  onClear,
}: {
  value: string;
  alt: string;
  locked: boolean;
  photos: CatalogPhoto[];
  onPick: (src: string, title: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Label label="Picture" />
      {value ? (
        <div className="flex items-center gap-3">
          {/* The same URL the email will use, so a picture that will not
              load in an inbox does not load here either. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl(value)} alt={alt} className="h-16 w-24 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="truncate text-xs text-ink-2">{value.replace(/^\/images\//, "")}</p>
            {!locked && (
              <div className="mt-1 flex gap-1.5">
                <button type="button" onClick={() => setOpen(true)} className="min-h-8 rounded-lg border border-line px-2 text-xs text-ink-2 hover:border-line-strong hover:text-white">
                  Change
                </button>
                <button type="button" onClick={onClear} className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs text-ink-3 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={locked}
          onClick={() => setOpen(true)}
          className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong text-xs font-medium text-ink-2 transition-colors hover:border-signal-ink hover:text-white disabled:opacity-70"
        >
          <ImageIcon className="h-4 w-4" />
          Choose a picture
        </button>
      )}
      {open && (
        <PhotoPicker
          photos={photos}
          onPick={(src, title) => {
            onPick(src, title);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function FilmField({
  value,
  title,
  poster,
  portrait,
  locked,
  films,
  onPick,
  onClear,
}: {
  value: string;
  title: string;
  poster: string;
  portrait: boolean;
  locked: boolean;
  films: CatalogFilm[];
  onPick: (f: CatalogFilm) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Label label="Film" />
      {value ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt={title} className={cn("shrink-0 rounded-lg object-cover", portrait ? "h-20 w-12" : "h-14 w-24")} />
          <div className="min-w-0">
            <p className="truncate text-xs text-white">{title}</p>
            <p className="truncate text-[11px] text-ink-3">vimeo.com/{value}</p>
            {!locked && (
              <div className="mt-1 flex gap-1.5">
                <button type="button" onClick={() => setOpen(true)} className="min-h-8 rounded-lg border border-line px-2 text-xs text-ink-2 hover:border-line-strong hover:text-white">
                  Change
                </button>
                <button type="button" onClick={onClear} className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs text-ink-3 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={locked}
          onClick={() => setOpen(true)}
          className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong text-xs font-medium text-ink-2 transition-colors hover:border-signal-ink hover:text-white disabled:opacity-70"
        >
          <Clapperboard className="h-4 w-4" />
          Choose a film
        </button>
      )}
      {open && (
        <FilmPicker
          films={films}
          onPick={(f) => {
            onPick(f);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
