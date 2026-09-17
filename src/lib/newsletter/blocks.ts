/**
 * What a newsletter is made of.
 *
 * Blocks, not free HTML. An email that lets the author type markup is an
 * email that breaks in Outlook the first time somebody pastes from a web
 * page. Each block here is rendered once, correctly, by render.ts, and the
 * editor only ever edits the words and the pictures. The header and the
 * footer are not blocks at all: the unsubscribe link and the postal address
 * live there, and compliance is not something an author should be able to
 * delete on a Tuesday.
 *
 * A draft also carries a theme (the ground the whole email sits on) and
 * most blocks carry a tone (plain on the ground, on a raised panel, or on
 * the brand's deep blue), which is how one set of blocks makes emails that
 * look different from each other without any of them looking off brand.
 *
 * Everything the client sends back goes through normalizeBlocks() before it
 * is stored or rendered. Unknown kinds are dropped, every string is trimmed
 * and capped, and a link that is not https, mailto or tel is emptied rather
 * than kept, so a javascript: href can never reach an inbox or the preview.
 */

export const THEMES = ["night", "steel", "paper"] as const;
export type ThemeId = (typeof THEMES)[number];

export const THEME_LABEL: Record<ThemeId, { name: string; hint: string }> = {
  night: { name: "Night", hint: "The site itself. Black ground, white type, the brand blue on buttons." },
  steel: { name: "Steel", hint: "Deep navy ground with the brand blue used more freely." },
  paper: { name: "Paper", hint: "Cool white ground with navy type, for a lighter month." },
};

export const TONES = ["plain", "panel", "accent"] as const;
export type Tone = (typeof TONES)[number];

export const TONE_LABEL: Record<Tone, string> = {
  plain: "On the ground",
  panel: "On a panel",
  accent: "On brand blue",
};

export const BLOCK_KINDS = [
  "hero",
  "heading",
  "text",
  "image",
  "gallery",
  "feature",
  "film",
  "stats",
  "list",
  "quote",
  "note",
  "cta",
  "button",
  "divider",
  "spacer",
] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

type Base<K extends BlockKind> = { id: string; kind: K };

export type HeroBlock = Base<"hero"> & {
  image: string;
  alt: string;
  title: string;
  sub: string;
  href: string;
  /** Words under the picture, or words over it on a dark wash. */
  layout: "stacked" | "overlay";
};
export type HeadingBlock = Base<"heading"> & { label: string; text: string; tone: Tone };
export type TextBlock = Base<"text"> & { text: string; tone: Tone };
export type ImageBlock = Base<"image"> & {
  image: string;
  alt: string;
  caption: string;
  href: string;
};
export type GalleryItem = { image: string; alt: string; caption: string; href: string };
export type GalleryBlock = Base<"gallery"> & {
  title: string;
  items: GalleryItem[];
  columns: 2 | 3;
};
export type FeatureBlock = Base<"feature"> & {
  image: string;
  alt: string;
  title: string;
  text: string;
  href: string;
  buttonLabel: string;
  side: "left" | "right";
  tone: Tone;
};
export type FilmBlock = Base<"film"> & {
  vimeoId: string;
  title: string;
  category: string;
  poster: string;
  portrait: boolean;
};
export type StatItem = { value: string; label: string };
export type StatsBlock = Base<"stats"> & { items: StatItem[]; tone: Tone };
export type ListBlock = Base<"list"> & {
  title: string;
  items: string;
  style: "numbered" | "bulleted";
  tone: Tone;
};
export type ButtonBlock = Base<"button"> & {
  label: string;
  href: string;
  style: "solid" | "outline";
};
export type QuoteBlock = Base<"quote"> & { text: string; name: string; role: string; tone: Tone };
export type NoteBlock = Base<"note"> & {
  image: string;
  name: string;
  role: string;
  text: string;
  tone: Tone;
};
export type CtaBlock = Base<"cta"> & {
  title: string;
  text: string;
  label: string;
  href: string;
  phones: boolean;
  tone: Tone;
};
export type DividerBlock = Base<"divider">;
export type SpacerBlock = Base<"spacer"> & { size: "s" | "m" | "l" };

export type Block =
  | HeroBlock
  | HeadingBlock
  | TextBlock
  | ImageBlock
  | GalleryBlock
  | FeatureBlock
  | FilmBlock
  | StatsBlock
  | ListBlock
  | ButtonBlock
  | QuoteBlock
  | NoteBlock
  | CtaBlock
  | DividerBlock
  | SpacerBlock;

/** What the editor edits and the renderer renders. */
export type Draft = {
  subject: string;
  preheader: string;
  theme: ThemeId;
  blocks: Block[];
};

export const BLOCK_LABEL: Record<BlockKind, string> = {
  hero: "Opening picture",
  heading: "Heading",
  text: "Paragraphs",
  image: "Picture",
  gallery: "Photo grid",
  feature: "Picture beside text",
  film: "Film from the portfolio",
  stats: "Three numbers",
  list: "Numbered list",
  quote: "Quote",
  note: "A note from the team",
  cta: "Book a shoot",
  button: "Button",
  divider: "Line",
  spacer: "Space",
};

export const BLOCK_HINT: Record<BlockKind, string> = {
  hero: "A full width photo with a headline, under it or over it.",
  heading: "A section title, with a small label above it if you want one.",
  text: "Body copy. Leave a blank line between paragraphs.",
  image: "A photo on its own, with a caption if it needs one.",
  gallery: "Up to six photos in a grid. The houses shot this month.",
  feature: "A photo on one side and a short piece of text on the other. Stacks on a phone.",
  film: "A reel from the portfolio with a play button.",
  stats: "Three big numbers with a word or two under each.",
  list: "Steps or tips, numbered or bulleted.",
  quote: "Something a client said, with their name.",
  note: "A short personal note with a headshot, signed.",
  cta: "The ask: a heading, a line, and the booking button, on a panel.",
  button: "One button on its own.",
  divider: "A hairline between two parts.",
  spacer: "Breathing room.",
};

/** How the palette groups them. */
export const BLOCK_GROUPS: { name: string; kinds: BlockKind[] }[] = [
  { name: "Pictures", kinds: ["hero", "image", "gallery", "feature", "film"] },
  { name: "Words", kinds: ["heading", "text", "list", "stats", "quote", "note"] },
  { name: "Asks", kinds: ["cta", "button"] },
  { name: "Spacing", kinds: ["divider", "spacer"] },
];

/* Length caps. Generous for prose, tight for anything that becomes an
   attribute or a header. */
const CAP = {
  short: 160,
  title: 200,
  text: 6000,
  href: 1000,
  id: 40,
} as const;

let counter = 0;
export function newId(): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `b${Date.now().toString(36)}${counter.toString(36)}${rand}`;
}

export function newBlock(kind: BlockKind): Block {
  const id = newId();
  switch (kind) {
    case "hero":
      return { id, kind, image: "", alt: "", title: "", sub: "", href: "", layout: "stacked" };
    case "heading":
      return { id, kind, label: "", text: "", tone: "plain" };
    case "text":
      return { id, kind, text: "", tone: "plain" };
    case "image":
      return { id, kind, image: "", alt: "", caption: "", href: "" };
    case "gallery":
      return { id, kind, title: "", items: [], columns: 2 };
    case "feature":
      return {
        id,
        kind,
        image: "",
        alt: "",
        title: "",
        text: "",
        href: "",
        buttonLabel: "",
        side: "left",
        tone: "plain",
      };
    case "film":
      return { id, kind, vimeoId: "", title: "", category: "", poster: "", portrait: true };
    case "stats":
      return {
        id,
        kind,
        items: [
          { value: "", label: "" },
          { value: "", label: "" },
          { value: "", label: "" },
        ],
        tone: "panel",
      };
    case "list":
      return { id, kind, title: "", items: "", style: "numbered", tone: "plain" };
    case "button":
      return { id, kind, label: "", href: "", style: "solid" };
    case "quote":
      return { id, kind, text: "", name: "", role: "", tone: "plain" };
    case "note":
      return { id, kind, image: "", name: "", role: "", text: "", tone: "panel" };
    case "cta":
      return {
        id,
        kind,
        title: "Ready for your next listing?",
        text: "Photos the next business day, video within three. Book a date and we handle the rest.",
        label: "Book a shoot",
        href: "https://pgcreativeswi.com/contact",
        phones: true,
        tone: "accent",
      };
    case "divider":
      return { id, kind };
    case "spacer":
      return { id, kind, size: "m" };
  }
}

/** A string, trimmed and capped, from whatever the client sent. */
function str(value: unknown, cap: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n?/g, "\n").trim().slice(0, cap);
}

/**
 * A link that is safe to put in an email. Only three schemes exist here, and
 * a relative path is emptied too: there is no "here" in an inbox for it to be
 * relative to.
 */
export function safeHref(value: unknown): string {
  const s = str(value, CAP.href);
  if (!s) return "";
  if (/^https?:\/\/[^\s<>"']+$/i.test(s)) return s;
  if (/^mailto:[^\s<>"']+$/i.test(s)) return s;
  if (/^tel:\+?[\d()\-\s.]+$/i.test(s)) return s;
  return "";
}

/**
 * A picture source. A path into the site's own public folder, a path to an
 * uploaded photo, or an https URL. Anything else, including data: URIs and
 * javascript:, is dropped.
 */
export function safeImage(value: unknown): string {
  const s = str(value, CAP.href);
  if (!s) return "";
  if (/^\/(images|team)\/[a-z0-9_\-]+\.(jpe?g|png|webp)$/i.test(s)) return s;
  if (/^\/media\/u\/[A-Za-z0-9_-]{8,48}\.jpg$/.test(s)) return s;
  if (/^https:\/\/[^\s<>"']+$/i.test(s)) return s;
  return "";
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function tone(value: unknown, fallback: Tone = "plain"): Tone {
  return oneOf(value, TONES, fallback);
}

function normalizeBlock(raw: unknown): Block | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const kind = r.kind;
  if (!BLOCK_KINDS.includes(kind as BlockKind)) return null;
  const id = str(r.id, CAP.id) || newId();

  switch (kind as BlockKind) {
    case "hero":
      return {
        id,
        kind: "hero",
        image: safeImage(r.image),
        alt: str(r.alt, CAP.short),
        title: str(r.title, CAP.title),
        sub: str(r.sub, CAP.title * 2),
        href: safeHref(r.href),
        layout: oneOf(r.layout, ["stacked", "overlay"] as const, "stacked"),
      };
    case "heading":
      return {
        id,
        kind: "heading",
        label: str(r.label, CAP.short),
        text: str(r.text, CAP.title),
        tone: tone(r.tone),
      };
    case "text":
      return { id, kind: "text", text: str(r.text, CAP.text), tone: tone(r.tone) };
    case "image":
      return {
        id,
        kind: "image",
        image: safeImage(r.image),
        alt: str(r.alt, CAP.short),
        caption: str(r.caption, CAP.title * 2),
        href: safeHref(r.href),
      };
    case "gallery": {
      const items = Array.isArray(r.items) ? r.items : [];
      return {
        id,
        kind: "gallery",
        title: str(r.title, CAP.title),
        columns: r.columns === 3 ? 3 : 2,
        items: items
          .slice(0, 6)
          .map((it) => {
            const o = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
            return {
              image: safeImage(o.image),
              alt: str(o.alt, CAP.short),
              caption: str(o.caption, CAP.short),
              href: safeHref(o.href),
            };
          }),
      };
    }
    case "feature":
      return {
        id,
        kind: "feature",
        image: safeImage(r.image),
        alt: str(r.alt, CAP.short),
        title: str(r.title, CAP.title),
        text: str(r.text, CAP.text),
        href: safeHref(r.href),
        buttonLabel: str(r.buttonLabel, 40),
        side: oneOf(r.side, ["left", "right"] as const, "left"),
        tone: tone(r.tone),
      };
    case "film":
      return {
        id,
        kind: "film",
        vimeoId: /^\d{6,12}$/.test(String(r.vimeoId ?? "")) ? String(r.vimeoId) : "",
        title: str(r.title, CAP.title),
        category: str(r.category, CAP.short),
        poster: safeImage(r.poster),
        portrait: r.portrait !== false,
      };
    case "stats": {
      const items = Array.isArray(r.items) ? r.items : [];
      const cleaned = items.slice(0, 3).map((it) => {
        const o = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
        return { value: str(o.value, 20), label: str(o.label, 60) };
      });
      while (cleaned.length < 3) cleaned.push({ value: "", label: "" });
      return { id, kind: "stats", items: cleaned, tone: tone(r.tone, "panel") };
    }
    case "list":
      return {
        id,
        kind: "list",
        title: str(r.title, CAP.title),
        items: str(r.items, CAP.text),
        style: oneOf(r.style, ["numbered", "bulleted"] as const, "numbered"),
        tone: tone(r.tone),
      };
    case "button":
      return {
        id,
        kind: "button",
        label: str(r.label, 60),
        href: safeHref(r.href),
        style: oneOf(r.style, ["solid", "outline"] as const, "solid"),
      };
    case "quote":
      return {
        id,
        kind: "quote",
        text: str(r.text, CAP.text),
        name: str(r.name, CAP.short),
        role: str(r.role, CAP.short),
        tone: tone(r.tone),
      };
    case "note":
      return {
        id,
        kind: "note",
        image: safeImage(r.image),
        name: str(r.name, CAP.short),
        role: str(r.role, CAP.short),
        text: str(r.text, CAP.text),
        tone: tone(r.tone, "panel"),
      };
    case "cta":
      return {
        id,
        kind: "cta",
        title: str(r.title, CAP.title),
        text: str(r.text, CAP.title * 2),
        label: str(r.label, 60),
        href: safeHref(r.href),
        phones: r.phones !== false,
        tone: tone(r.tone, "accent"),
      };
    case "divider":
      return { id, kind: "divider" };
    case "spacer":
      return { id, kind: "spacer", size: oneOf(r.size, ["s", "m", "l"] as const, "m") };
  }
}

export const MAX_BLOCKS = 40;

/** Whatever came over the wire, made into blocks this code will render. */
export function normalizeBlocks(input: unknown): Block[] {
  if (!Array.isArray(input)) return [];
  const out: Block[] = [];
  const seen = new Set<string>();
  for (const raw of input.slice(0, MAX_BLOCKS)) {
    const block = normalizeBlock(raw);
    if (!block) continue;
    // Two blocks with one id would fight over a React key and a focus ring.
    if (seen.has(block.id)) block.id = newId();
    seen.add(block.id);
    out.push(block);
  }
  return out;
}

export function normalizeDraft(input: unknown): Draft {
  const r = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  return {
    subject: str(r.subject, 200).replace(/\s+/g, " "),
    preheader: str(r.preheader, 200).replace(/\s+/g, " "),
    theme: oneOf(r.theme, THEMES, "night"),
    blocks: normalizeBlocks(r.blocks),
  };
}

/** A copy of a draft with every block id fresh, for templates and duplicates. */
export function withFreshIds(draft: Draft): Draft {
  return { ...draft, blocks: draft.blocks.map((b) => ({ ...b, id: newId() })) };
}
