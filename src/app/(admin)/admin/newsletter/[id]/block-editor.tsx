"use client";

import { useCallback, useRef, useState } from "react";
import { ImageIcon, Clapperboard, X, Plus, GripVertical, Trash2 } from "lucide-react";
import { useReorder } from "./use-reorder";
import { TONES, TONE_LABEL, type Block, type BlockKind, type GalleryItem, type Tone } from "@/lib/newsletter/blocks";
import type { CatalogFilm, CatalogPerson, CatalogPhoto } from "@/lib/newsletter/catalog";
import { pic } from "@/lib/newsletter/render";
import { cn } from "@/lib/utils";
import { FilmPicker, PhotoPicker, type Picked } from "./picker";

/**
 * The fields for one block. Small, plain controls, labelled in the words
 * the owner would use rather than the code's: "the line the inbox shows"
 * not "preheader", "describe the picture" not "alt".
 */

type Patch<K extends BlockKind> = Partial<Extract<Block, { kind: K }>>;

type Shared = {
  locked: boolean;
  photos: CatalogPhoto[];
  team: CatalogPerson[];
};

export function BlockFields({
  block,
  locked,
  photos,
  films,
  team,
  onChange,
}: {
  block: Block;
  locked: boolean;
  photos: CatalogPhoto[];
  films: CatalogFilm[];
  team: CatalogPerson[];
  onChange: (patch: Partial<Block>) => void;
}) {
  const shared: Shared = { locked, photos, team };
  switch (block.kind) {
    case "hero":
      return (
        <div className="space-y-3">
          <PictureField
            {...shared}
            value={block.image}
            alt={block.alt}
            onPick={(p) => onChange({ image: p.src, alt: block.alt || p.title } as Patch<"hero">)}
            onClear={() => onChange({ image: "" } as Patch<"hero">)}
          />
          {block.image && (
            <>
              <Segmented
                label="Words"
                value={block.layout}
                locked={locked}
                options={[
                  { value: "stacked", label: "Under the picture" },
                  { value: "overlay", label: "Over the picture" },
                ]}
                onChange={(layout) => onChange({ layout } as Patch<"hero">)}
              />
              <Text label="Describe the picture" hint="Read aloud by screen readers and shown when pictures are off." value={block.alt} locked={locked} onChange={(alt) => onChange({ alt } as Patch<"hero">)} />
            </>
          )}
          <Text label="Headline" value={block.title} locked={locked} onChange={(title) => onChange({ title } as Patch<"hero">)} placeholder="Hi {{first_name}}, here is September" />
          <Area label="Line under it" value={block.sub} locked={locked} rows={2} onChange={(sub) => onChange({ sub } as Patch<"hero">)} />
          {block.layout !== "overlay" && (
            <Text label="Where the picture links to" hint="Optional. Starts with https://" value={block.href} locked={locked} onChange={(href) => onChange({ href } as Patch<"hero">)} placeholder="https://pgcreativeswi.com/portfolio" inputMode="url" />
          )}
        </div>
      );
    case "heading":
      return (
        <div className="space-y-3">
          <Text label="Small label above" hint="Optional, in the accent color." value={block.label} locked={locked} onChange={(label) => onChange({ label } as Patch<"heading">)} placeholder="New this month" />
          <Text label="Heading" value={block.text} locked={locked} onChange={(text) => onChange({ text } as Patch<"heading">)} placeholder="A crew in Milwaukee" />
          <ToneField value={block.tone} locked={locked} onChange={(tone) => onChange({ tone } as Patch<"heading">)} />
        </div>
      );
    case "text":
      return (
        <div className="space-y-3">
          <Area
            label="Paragraphs"
            hint="A blank line starts a new paragraph. **bold** for bold, [words](https://link) for a link."
            value={block.text}
            locked={locked}
            rows={6}
            onChange={(text) => onChange({ text } as Patch<"text">)}
          />
          <ToneField value={block.tone} locked={locked} onChange={(tone) => onChange({ tone } as Patch<"text">)} />
        </div>
      );
    case "image":
      return (
        <div className="space-y-3">
          <PictureField
            {...shared}
            value={block.image}
            alt={block.alt}
            onPick={(p) => onChange({ image: p.src, alt: block.alt || p.title } as Patch<"image">)}
            onClear={() => onChange({ image: "" } as Patch<"image">)}
          />
          <Text label="Describe the picture" hint="Read aloud by screen readers and shown when pictures are off." value={block.alt} locked={locked} onChange={(alt) => onChange({ alt } as Patch<"image">)} />
          <Text label="Caption" hint="Optional, small, under the picture." value={block.caption} locked={locked} onChange={(caption) => onChange({ caption } as Patch<"image">)} />
          <Text label="Where it links to" hint="Optional. Starts with https://" value={block.href} locked={locked} onChange={(href) => onChange({ href } as Patch<"image">)} inputMode="url" />
        </div>
      );
    case "gallery":
      return (
        <GalleryFields
          {...shared}
          title={block.title}
          items={block.items}
          columns={block.columns}
          onChange={(patch) => onChange(patch as Patch<"gallery">)}
        />
      );
    case "feature":
      return (
        <div className="space-y-3">
          <PictureField
            {...shared}
            value={block.image}
            alt={block.alt}
            onPick={(p) => onChange({ image: p.src, alt: block.alt || p.title } as Patch<"feature">)}
            onClear={() => onChange({ image: "" } as Patch<"feature">)}
          />
          {block.image && (
            <>
              <Text label="Describe the picture" value={block.alt} locked={locked} onChange={(alt) => onChange({ alt } as Patch<"feature">)} />
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
            </>
          )}
          <Text label="Heading" value={block.title} locked={locked} onChange={(title) => onChange({ title } as Patch<"feature">)} />
          <Area label="Text" value={block.text} locked={locked} rows={4} onChange={(text) => onChange({ text } as Patch<"feature">)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Text label="Link label" hint="Optional, shown under the text." value={block.buttonLabel} locked={locked} onChange={(buttonLabel) => onChange({ buttonLabel } as Patch<"feature">)} placeholder="See what is included" />
            <Text label="Link" value={block.href} locked={locked} onChange={(href) => onChange({ href } as Patch<"feature">)} placeholder="https://" inputMode="url" />
          </div>
          <ToneField value={block.tone} locked={locked} onChange={(tone) => onChange({ tone } as Patch<"feature">)} />
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
    case "stats":
      return (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            {block.items.map((it, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-line p-2.5">
                <Text
                  label={`Number ${i + 1}`}
                  value={it.value}
                  locked={locked}
                  onChange={(value) => onChange({ items: block.items.map((x, j) => (j === i ? { ...x, value } : x)) } as Patch<"stats">)}
                  placeholder="42"
                />
                <Text
                  label="Under it"
                  value={it.label}
                  locked={locked}
                  onChange={(label) => onChange({ items: block.items.map((x, j) => (j === i ? { ...x, label } : x)) } as Patch<"stats">)}
                  placeholder="Listings shot"
                />
              </div>
            ))}
          </div>
          <ToneField value={block.tone} locked={locked} onChange={(tone) => onChange({ tone } as Patch<"stats">)} />
        </div>
      );
    case "list":
      return (
        <div className="space-y-3">
          <Text label="Heading" hint="Optional." value={block.title} locked={locked} onChange={(title) => onChange({ title } as Patch<"list">)} placeholder="Before we arrive" />
          <Area label="Items" hint="One per line." value={block.items} locked={locked} rows={5} onChange={(items) => onChange({ items } as Patch<"list">)} />
          <div className="flex flex-wrap gap-4">
            <Segmented
              label="Marks"
              value={block.style}
              locked={locked}
              options={[
                { value: "numbered", label: "1, 2, 3" },
                { value: "bulleted", label: "Dots" },
              ]}
              onChange={(style) => onChange({ style } as Patch<"list">)}
            />
            <ToneField value={block.tone} locked={locked} onChange={(tone) => onChange({ tone } as Patch<"list">)} />
          </div>
        </div>
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
          <ToneField value={block.tone} locked={locked} onChange={(tone) => onChange({ tone } as Patch<"quote">)} />
        </div>
      );
    case "note":
      return (
        <div className="space-y-3">
          <PictureField
            {...shared}
            value={block.image}
            alt={block.name}
            label="Headshot"
            round
            startTab="team"
            onPick={(p) => onChange({ image: p.src, name: block.name || p.title, role: block.role || (p.role ?? "") } as Patch<"note">)}
            onClear={() => onChange({ image: "" } as Patch<"note">)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Text label="Signed" value={block.name} locked={locked} onChange={(name) => onChange({ name } as Patch<"note">)} placeholder="Michael McIntee" />
            <Text label="Role" value={block.role} locked={locked} onChange={(role) => onChange({ role } as Patch<"note">)} placeholder="Founder" />
          </div>
          <Area label="The note" value={block.text} locked={locked} rows={4} onChange={(text) => onChange({ text } as Patch<"note">)} />
          <ToneField value={block.tone} locked={locked} onChange={(tone) => onChange({ tone } as Patch<"note">)} />
        </div>
      );
    case "cta":
      return (
        <div className="space-y-3">
          <Text label="Heading" value={block.title} locked={locked} onChange={(title) => onChange({ title } as Patch<"cta">)} placeholder="Ready for your next listing?" />
          <Area label="Line under it" value={block.text} locked={locked} rows={2} onChange={(text) => onChange({ text } as Patch<"cta">)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Text label="Button label" value={block.label} locked={locked} onChange={(label) => onChange({ label } as Patch<"cta">)} placeholder="Book a shoot" />
            <Text label="Button link" value={block.href} locked={locked} onChange={(href) => onChange({ href } as Patch<"cta">)} placeholder="https://pgcreativeswi.com/contact" inputMode="url" />
          </div>
          <div className="flex flex-wrap gap-4">
            <Segmented
              label="Phone numbers under it"
              value={block.phones ? "yes" : "no"}
              locked={locked}
              options={[
                { value: "yes", label: "Show" },
                { value: "no", label: "Hide" },
              ]}
              onChange={(v) => onChange({ phones: v === "yes" } as Patch<"cta">)}
            />
            <ToneField value={block.tone} locked={locked} onChange={(tone) => onChange({ tone } as Patch<"cta">)} />
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
      <div className="inline-flex flex-wrap rounded-lg border border-line bg-surface-hi p-0.5" role="radiogroup" aria-label={label}>
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

function ToneField({ value, locked, onChange }: { value: Tone; locked: boolean; onChange: (t: Tone) => void }) {
  return (
    <Segmented
      label="Sits"
      value={value}
      locked={locked}
      options={TONES.map((t) => ({ value: t, label: TONE_LABEL[t] }))}
      onChange={onChange}
    />
  );
}

/** A thumbnail from the same route the email uses, so a broken picture is broken here too. */
function thumb(src: string, w: number, h: number): string {
  return pic(src, w, h, "");
}

function PictureField({
  value,
  alt,
  label = "Picture",
  round,
  startTab,
  locked,
  photos,
  team,
  onPick,
  onClear,
}: Shared & {
  value: string;
  alt: string;
  label?: string;
  round?: boolean;
  startTab?: "uploads" | "site" | "team";
  onPick: (p: Picked) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Label label={label} />
      {value ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb(value, round ? 128 : 240, round ? 128 : 160)}
            alt={alt}
            className={cn("shrink-0 object-cover", round ? "h-14 w-14 rounded-full" : "h-16 w-24 rounded-lg")}
          />
          <div className="min-w-0">
            <p className="truncate text-xs text-ink-2">{value.replace(/^\/(images|team|media\/u)\//, "")}</p>
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
          Choose a {label.toLowerCase()}
        </button>
      )}
      {open && (
        <PhotoPicker
          photos={photos}
          team={team}
          startTab={startTab}
          onPick={(picked) => {
            onPick(picked[0]);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function GalleryFields({
  title,
  items,
  columns,
  locked,
  photos,
  team,
  onChange,
}: Shared & {
  title: string;
  items: GalleryItem[];
  columns: 2 | 3;
  onChange: (patch: { title?: string; items?: GalleryItem[]; columns?: 2 | 3 }) => void;
}) {
  const [open, setOpen] = useState(false);
  const gridRef = useRef<HTMLUListElement>(null);

  function setItem(i: number, patch: Partial<GalleryItem>) {
    onChange({ items: items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
  }
  function removeItem(i: number) {
    onChange({ items: items.filter((_, j) => j !== i) });
  }
  const moveItem = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      const next = [...items];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      onChange({ items: next });
    },
    [items, onChange],
  );
  const getItems = useCallback(
    () => Array.from(gridRef.current?.querySelectorAll<HTMLElement>(":scope > li[data-photo]") ?? []),
    [],
  );
  const { dragging, dropAt, handleProps } = useReorder({ mode: "grid", getItems, onMove: moveItem });

  return (
    <div className="space-y-3">
      <Text label="Heading" hint="Optional." value={title} locked={locked} onChange={(t) => onChange({ title: t })} placeholder="Shot this month" />
      <div>
        <Label label={`Photos, ${items.length} of 6`} hint="Each one is cropped to the same box. Drag to reorder." />
        <ul ref={gridRef} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((it, i) => (
            <li
              key={i}
              data-photo=""
              className={cn(
                "rounded-lg border bg-surface-hi p-2 transition-colors",
                dragging === i ? "border-line opacity-40" : dropAt === i && dragging !== null ? "border-signal-ink" : "border-line",
              )}
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb(it.image, 300, 200)} alt={it.alt} className="aspect-[3/2] w-full rounded-md object-cover" draggable={false} />
                {!locked && (
                  <>
                    <span
                      {...handleProps(i)}
                      className="absolute left-1 top-1 inline-flex h-7 w-7 cursor-grab select-none items-center justify-center rounded-md bg-black/55 text-white active:cursor-grabbing"
                      title="Drag to reorder"
                      aria-hidden="true"
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      aria-label="Remove photo"
                      className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/55 text-white hover:bg-red-500/80"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
              <input
                value={it.caption}
                disabled={locked}
                onChange={(e) => setItem(i, { caption: e.target.value, alt: it.alt || e.target.value })}
                placeholder="Caption"
                aria-label="Caption"
                className={cn(INPUT, "mt-2 min-h-9 px-2 text-xs sm:text-xs")}
              />
            </li>
          ))}
          {!locked && items.length < 6 && (
            <li>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex aspect-[3/2] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line-strong text-xs font-medium text-ink-2 transition-colors hover:border-signal-ink hover:text-white"
              >
                <Plus className="h-4 w-4" />
                Add photos
              </button>
            </li>
          )}
        </ul>
      </div>
      <Segmented
        label="Across"
        value={String(columns) as "2" | "3"}
        locked={locked}
        options={[
          { value: "2", label: "Two" },
          { value: "3", label: "Three" },
        ]}
        onChange={(v) => onChange({ columns: v === "3" ? 3 : 2 })}
      />
      {open && (
        <PhotoPicker
          photos={photos}
          team={team}
          multiple={6 - items.length}
          onPick={(picked) => {
            onChange({
              items: [...items, ...picked.map((p) => ({ image: p.src, alt: p.title, caption: "", href: "" }))].slice(0, 6),
            });
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
