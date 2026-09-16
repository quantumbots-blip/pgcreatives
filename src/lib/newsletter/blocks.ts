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
 * Everything the client sends back goes through normalizeBlocks() before it
 * is stored or rendered. Unknown kinds are dropped, every string is trimmed
 * and capped, and a link that is not https, mailto or tel is emptied rather
 * than kept, so a javascript: href can never reach an inbox or the preview.
 */

export const BLOCK_KINDS = [
  "hero",
  "heading",
  "text",
  "image",
  "feature",
  "film",
  "button",
  "quote",
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
};
export type HeadingBlock = Base<"heading"> & { label: string; text: string };
export type TextBlock = Base<"text"> & { text: string };
export type ImageBlock = Base<"image"> & {
  image: string;
  alt: string;
  caption: string;
  href: string;
};
export type FeatureBlock = Base<"feature"> & {
  image: string;
  alt: string;
  title: string;
  text: string;
  href: string;
  buttonLabel: string;
  side: "left" | "right";
};
export type FilmBlock = Base<"film"> & {
  vimeoId: string;
  title: string;
  category: string;
  poster: string;
  portrait: boolean;
};
export type ButtonBlock = Base<"button"> & {
  label: string;
  href: string;
  style: "solid" | "outline";
};
export type QuoteBlock = Base<"quote"> & { text: string; name: string; role: string };
export type DividerBlock = Base<"divider">;
export type SpacerBlock = Base<"spacer"> & { size: "s" | "m" | "l" };

export type Block =
  | HeroBlock
  | HeadingBlock
  | TextBlock
  | ImageBlock
  | FeatureBlock
  | FilmBlock
  | ButtonBlock
  | QuoteBlock
  | DividerBlock
  | SpacerBlock;

/** What the editor edits and the renderer renders. */
export type Draft = {
  subject: string;
  preheader: string;
  blocks: Block[];
};

export const BLOCK_LABEL: Record<BlockKind, string> = {
  hero: "Opening picture",
  heading: "Heading",
  text: "Paragraphs",
  image: "Picture",
  feature: "Picture beside text",
  film: "Film from the portfolio",
  button: "Button",
  quote: "Quote",
  divider: "Line",
  spacer: "Space",
};

export const BLOCK_HINT: Record<BlockKind, string> = {
  hero: "A full width photo with a headline over the top of the email.",
  heading: "A section title, with a small label above it if you want one.",
  text: "Body copy. Leave a blank line between paragraphs.",
  image: "A photo on its own, with a caption if it needs one.",
  feature: "A photo on one side and a short piece of text on the other. Stacks on a phone.",
  film: "A reel from the portfolio with a play button.",
  button: "One thing you want them to do.",
  quote: "Something a client said, with their name.",
  divider: "A hairline between two parts.",
  spacer: "Breathing room.",
};

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
      return { id, kind, image: "", alt: "", title: "", sub: "", href: "" };
    case "heading":
      return { id, kind, label: "", text: "" };
    case "text":
      return { id, kind, text: "" };
    case "image":
      return { id, kind, image: "", alt: "", caption: "", href: "" };
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
      };
    case "film":
      return { id, kind, vimeoId: "", title: "", category: "", poster: "", portrait: true };
    case "button":
      return { id, kind, label: "", href: "", style: "solid" };
    case "quote":
      return { id, kind, text: "", name: "", role: "" };
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
 * A picture source. Either a path into the site's own public folder or an
 * https URL. Anything else, including data: URIs and javascript:, is dropped.
 */
export function safeImage(value: unknown): string {
  const s = str(value, CAP.href);
  if (!s) return "";
  if (/^\/[a-z0-9_\-/.]+\.(jpe?g|png|webp|gif)$/i.test(s)) return s;
  if (/^https:\/\/[^\s<>"']+$/i.test(s)) return s;
  return "";
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
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
      };
    case "heading":
      return { id, kind: "heading", label: str(r.label, CAP.short), text: str(r.text, CAP.title) };
    case "text":
      return { id, kind: "text", text: str(r.text, CAP.text) };
    case "image":
      return {
        id,
        kind: "image",
        image: safeImage(r.image),
        alt: str(r.alt, CAP.short),
        caption: str(r.caption, CAP.title * 2),
        href: safeHref(r.href),
      };
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
    blocks: normalizeBlocks(r.blocks),
  };
}
