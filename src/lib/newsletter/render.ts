import { BUSINESS } from "@/lib/data";
import { FONT, LOGO_URL, SITE_URL, esc, headerSafe, type RenderedEmail } from "@/lib/email/layout";
import type { Block, Draft, ThemeId, Tone } from "./blocks";

/**
 * Blocks in, an email out.
 *
 * Built on the same rules as the transactional shell in email/layout.ts and
 * held to them by the same tests: nested tables with every style inline, no
 * flex or grid or positioning, separate borders so the pills stay round, no
 * bgcolor next to a radius, the accent only ever as a fill, and under 90KB
 * so Gmail does not clip it.
 *
 * Three things a newsletter needs that a notification does not:
 *
 * 1. A footer that satisfies the people who decide whether it lands. Gmail,
 *    Yahoo and Apple require a one click unsubscribe (that is the header pair
 *    the sender adds) and a visible one in the body; CAN-SPAM requires a
 *    postal address and a plain statement of why the reader is getting it.
 *    So the footer is not a block. It cannot be removed from the editor.
 *
 * 2. Layouts that survive Outlook. Media queries are stripped by enough
 *    clients that a layout which depends on one is a layout that fails
 *    somewhere. Every grid here is the fluid hybrid: inline-block cells that
 *    sit side by side while there is room and stack on their own when there
 *    is not, with a conditional comment giving Outlook, which does not
 *    understand max-width on a div, a real table to hold them. The photo
 *    behind the opening headline is the bulletproof background: a CSS
 *    background for everybody and a VML rectangle for Outlook.
 *
 * 3. Variety without leaving the brand. A theme decides the ground the whole
 *    email sits on, and a tone decides whether a block sits on that ground,
 *    on a raised panel, or on the brand's deep blue. Every color in every
 *    combination is stated explicitly on every element, because Gmail's dark
 *    mode transform rewrites anything it has to guess.
 *
 * Personalization is one token, {{first_name}}, filled per recipient at send
 * time and falling back to "there". More tokens means more ways for a
 * merged email to read "Hi ," to somebody whose row was thin.
 */

export type Recipient = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  /** Absolute. Goes in the footer and in the List-Unsubscribe header. */
  unsubscribeUrl: string;
};

export type RenderOptions = {
  recipient?: Recipient;
  /** Absolute. "View in a browser" in the footer. Omitted for a draft preview. */
  viewUrl?: string;
  /** A street address, which CAN-SPAM requires. Falls back to the markets served. */
  postalAddress?: string;
  /** Where pictures load from. The site in a sent email; the dev server in a local preview. */
  assetOrigin?: string;
  /** Draws a ring around one block. Only the editor's preview uses it. */
  highlightId?: string;
};

/* ── Themes ─────────────────────────────────────────────────────────── */

export type Palette = {
  scheme: "dark" | "light";
  ground: string;
  surface: string;
  surfaceHi: string;
  line: string;
  lineStrong: string;
  ink: string;
  ink2: string;
  ink3: string;
  /** The brand fill. Carries white labels. */
  signal: string;
  /** The accent as text or an icon. */
  signalInk: string;
  /** The deep wash a block can sit on, and what is legible on it. */
  accent: string;
  accentInk: string;
  accentInk2: string;
  accentInk3: string;
  accentLine: string;
  accentLink: string;
  /** Behind the words on an overlay hero. */
  overlay: string;
};

export const PALETTES: Record<ThemeId, Palette> = {
  /* globals.css, verbatim. --signal is the fill and carries white labels; as
     text on this ground it measures 3.86:1 and fails, which is why every
     accent word uses --signal-ink instead. */
  night: {
    scheme: "dark",
    ground: "#07090c",
    surface: "#0f1319",
    surfaceHi: "#171c24",
    line: "rgba(255,255,255,0.09)",
    lineStrong: "rgba(255,255,255,0.18)",
    ink: "#ffffff",
    ink2: "rgba(255,255,255,0.72)",
    ink3: "rgba(255,255,255,0.52)",
    signal: "#2b6fb8",
    signalInk: "#6ab0d4",
    accent: "#0b2c56",
    accentInk: "#ffffff",
    accentInk2: "rgba(255,255,255,0.8)",
    accentInk3: "rgba(255,255,255,0.6)",
    accentLine: "rgba(255,255,255,0.14)",
    accentLink: "#9cd0ee",
    overlay: "rgba(7,9,12,0.62)",
  },
  steel: {
    scheme: "dark",
    ground: "#0a1424",
    surface: "#122036",
    surfaceHi: "#1a2b45",
    line: "rgba(255,255,255,0.1)",
    lineStrong: "rgba(255,255,255,0.2)",
    ink: "#ffffff",
    ink2: "rgba(255,255,255,0.74)",
    ink3: "rgba(255,255,255,0.55)",
    signal: "#2b6fb8",
    signalInk: "#8cc4e6",
    accent: "#2b6fb8",
    accentInk: "#ffffff",
    accentInk2: "rgba(255,255,255,0.86)",
    accentInk3: "rgba(255,255,255,0.68)",
    accentLine: "rgba(255,255,255,0.22)",
    accentLink: "#ffffff",
    overlay: "rgba(10,20,36,0.64)",
  },
  paper: {
    scheme: "light",
    ground: "#f3f5f8",
    surface: "#ffffff",
    surfaceHi: "#e7ebf1",
    line: "rgba(11,26,46,0.12)",
    lineStrong: "rgba(11,26,46,0.22)",
    ink: "#0b1a2e",
    ink2: "rgba(11,26,46,0.76)",
    ink3: "rgba(11,26,46,0.56)",
    signal: "#2b6fb8",
    signalInk: "#1f5a99",
    accent: "#0b1a2e",
    accentInk: "#ffffff",
    accentInk2: "rgba(255,255,255,0.8)",
    accentInk3: "rgba(255,255,255,0.6)",
    accentLine: "rgba(255,255,255,0.14)",
    accentLink: "#8cc4e6",
    overlay: "rgba(11,26,46,0.6)",
  },
};

/* The shell is 600 wide; the content sits inside 34px of padding on each
   side, the same as the transactional emails. A toned block has its own
   24px inside the panel. */
const SHELL = 600;
const PAD = 34;
const CONTENT = SHELL - PAD * 2; // 532
const PANEL_PAD = 24;

/** The colors a block writes with, decided by its tone. */
type Ink = {
  ink: string;
  ink2: string;
  ink3: string;
  link: string;
  line: string;
  label: string;
  /** Panel background, or null on the ground. */
  bg: string | null;
  /** Primary and outlined buttons in this context. */
  btnBg: string;
  btnFg: string;
  btnBorder: string;
  outBg: string;
  outFg: string;
  outBorder: string;
  /** Content width inside this context. */
  width: number;
};

function inkFor(p: Palette, tone: Tone): Ink {
  if (tone === "accent") {
    /* On the brand blue a blue button disappears, so the primary is white
       with dark text and the outline is white on white. */
    return {
      ink: p.accentInk,
      ink2: p.accentInk2,
      ink3: p.accentInk3,
      link: p.accentLink,
      line: p.accentLine,
      label: p.accentInk2,
      bg: p.accent,
      btnBg: "#ffffff",
      btnFg: p.accent === "#2b6fb8" ? "#0a1424" : p.accent,
      btnBorder: "#ffffff",
      outBg: p.accent,
      outFg: p.accentInk,
      outBorder: p.accentLine.replace(/0\.\d+\)$/, "0.5)"),
      width: CONTENT - PANEL_PAD * 2,
    };
  }
  const base = {
    ink: p.ink,
    ink2: p.ink2,
    ink3: p.ink3,
    link: p.signalInk,
    line: p.line,
    label: p.signalInk,
    btnBg: p.signal,
    btnFg: "#ffffff",
    btnBorder: p.signal,
    outFg: p.ink,
    outBorder: p.lineStrong,
  };
  if (tone === "panel") {
    return { ...base, bg: p.surface, outBg: p.surface, width: CONTENT - PANEL_PAD * 2 };
  }
  return { ...base, bg: null, outBg: p.ground, width: CONTENT };
}

/* ── Text helpers ───────────────────────────────────────────────────── */

/** The words the person's row has, or "there". */
export function personalize(text: string, recipient?: Recipient): string {
  const first = (recipient?.firstName ?? "").trim();
  return text.replace(/\{\{\s*first_name\s*\}\}/gi, first || "there");
}

/** True when the author used a token, so the preflight can say so. */
export function usesPersonalization(draft: Draft): boolean {
  const all = [draft.subject, draft.preheader, ...draft.blocks.map((b) => JSON.stringify(b))];
  return all.some((s) => /\{\{\s*first_name\s*\}\}/i.test(s));
}

/**
 * The only inline syntax: **bold** and [label](https://link). Escaped first,
 * so the syntax is applied to text that can no longer carry a tag, and the
 * link regex only accepts http(s), so a javascript: URL typed into the
 * brackets renders as its own literal text.
 */
export function inline(text: string, ink?: Pick<Ink, "ink" | "link">): string {
  const strong = ink?.ink ?? "#ffffff";
  const link = ink?.link ?? "#6ab0d4";
  return esc(text)
    .replace(
      /\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g,
      (_m, label: string, href: string) =>
        `<a href="${href}" style="color:${link};text-decoration:underline">${label}</a>`,
    )
    .replace(/\*\*([^*\n]+)\*\*/g, `<strong style="font-weight:600;color:${strong}">$1</strong>`);
}

/** The same text for the plain twin: no syntax, links spelled out. */
export function inlineText(text: string): string {
  return text
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1 ($2)")
    .replace(/\*\*([^*\n]+)\*\*/g, "$1");
}

/* ── Pictures ───────────────────────────────────────────────────────── */

/**
 * Where a picture actually loads from, at the size the email needs.
 *
 * The site's own photographs and the owner's uploads go through /media,
 * which resizes and crops on the way out and is cached at the edge, so a
 * 400KB master becomes a 90KB JPEG cropped to exactly the box it fills. A
 * picture that is already https is left alone. Always absolute: an inbox
 * has nowhere for a relative path to be relative to.
 */
export function pic(src: string, w: number, h: number | null, origin: string = SITE_URL): string {
  if (!src) return "";
  if (/^https:\/\//i.test(src)) return src;
  const size = `w=${w}${h ? `&h=${h}` : ""}`;
  if (src.startsWith("/media/u/")) return `${origin}${src}?${size}`;
  return `${origin}/media/site${src}?${size}`;
}

/** @deprecated kept for the picker's thumbnails; use pic() for anything sent. */
export function imageUrl(src: string, origin: string = SITE_URL): string {
  return pic(src, 1200, null, origin);
}

function img(
  url: string,
  alt: string,
  width: number,
  height: number | null,
  ink: Pick<Ink, "ink3">,
  extra = "",
): string {
  const h = height ? ` height="${height}"` : "";
  const hs = height ? `height:${height}px` : "height:auto";
  return (
    `<img src="${esc(url)}" width="${width}"${h} alt="${esc(alt)}"` +
    ` style="display:block;width:100%;max-width:${width}px;${hs};border:0;outline:0;text-decoration:none;` +
    `font:400 13px/1.4 ${FONT};color:${ink.ink3};${extra}">`
  );
}

/* ── Structure ──────────────────────────────────────────────────────── */

function table(inner: string, attrs = "", style = ""): string {
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"${attrs ? ` ${attrs}` : ""}` +
    ` style="table-layout:fixed${style ? `;${style}` : ""}">${inner}</table>`
  );
}

function rule(color: string): string {
  return table(`<tr><td style="height:1px;line-height:1px;font-size:0;background:${color}">&nbsp;</td></tr>`);
}

/** A row of the shell with the standard side padding. */
function section(inner: string, top = 0, bottom = 0): string {
  return `<tr><td class="pg-pad" style="padding:${top}px ${PAD}px ${bottom}px">${inner}</td></tr>`;
}

/**
 * A block on the ground, or on a rounded panel. The panel is a table cell
 * with a background style, never a bgcolor attribute, so its corners clip.
 */
function toned(inner: string, ink: Ink, top: number, bottom: number): string {
  if (!ink.bg) return section(inner, top, bottom);
  return section(
    table(
      `<tr><td class="pg-panel" style="background:${ink.bg};border-radius:18px;padding:${PANEL_PAD + 2}px ${PANEL_PAD}px">${inner}</td></tr>`,
    ),
    top,
    bottom,
  );
}

function linkWrap(href: string, inner: string): string {
  return href ? `<a href="${esc(href)}" style="text-decoration:none">${inner}</a>` : inner;
}

/**
 * The site's pill. Centered and sized to its label, or stretched across the
 * content when `full`. No bgcolor attribute anywhere near the radius.
 */
function pill(href: string, label: string, style: "solid" | "outline", ink: Ink, full = false): string {
  const solid = style === "solid";
  const bg = solid ? ink.btnBg : ink.outBg;
  const fg = solid ? ink.btnFg : ink.outFg;
  const border = solid ? ink.btnBorder : ink.outBorder;
  const cell =
    `<td align="center" class="${solid ? "pg-btn" : "pg-btn-out"}" style="background:${bg};border:1px solid ${border};border-radius:999px">` +
    `<a href="${esc(href)}" class="pg-btn-a" style="display:block;padding:14px ${full ? 10 : 30}px;font:600 15px/1.25 ${FONT};letter-spacing:-0.01em;color:${fg};text-decoration:none;white-space:nowrap">${esc(label)}</a></td>`;
  if (full) return table(`<tr>${cell}</tr>`);
  return (
    `<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto">` +
    `<tr>${cell}</tr></table>`
  );
}

/** Paragraphs. The last one keeps no bottom margin when it is the last thing in its block. */
function paragraphs(text: string, ink: Ink, recipient?: Recipient, size = "16px/1.65", flushLast = false): string {
  const parts = personalize(text, recipient)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts
    .map(
      (p, i) =>
        `<p class="pg-text" style="margin:0 0 ${flushLast && i === parts.length - 1 ? 0 : 18}px;font:400 ${size} ${FONT};color:${ink.ink2}">${inline(p, ink).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

/**
 * Cells that sit side by side while there is room and stack when there is
 * not. Outlook gets a real table through the conditional comments, and a
 * font-size of zero on the wrapper removes the whitespace that would
 * otherwise sit between two inline blocks and push the last one down a
 * line at exactly the wrong width.
 */
function hybrid(cells: string[], columns: number, cellWidth: number, phone: "stack" | "half" | "keep" = "stack"): string {
  const pct = Math.floor(100 / columns);
  /* What happens on a phone: stack to one column (pictures beside text,
     two-up grids), go two-up (a three-up grid), or hold the row (three
     numbers, which fit at any width). */
  const klass = phone === "half" ? "nl-col nl-half" : phone === "keep" ? `nl-col nl-keep${columns}` : "nl-col";
  let out = "";
  cells.forEach((cell, i) => {
    const first = i % columns === 0;
    const last = i % columns === columns - 1 || i === cells.length - 1;
    if (first) {
      out += `<!--[if mso]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="${pct}%" valign="top"><![endif]-->`;
    } else {
      out += `<!--[if mso]></td><td width="${pct}%" valign="top"><![endif]-->`;
    }
    out += `<div class="${klass}" style="display:inline-block;width:100%;max-width:${cellWidth}px;vertical-align:top">${cell}</div>`;
    if (last) out += `<!--[if mso]></td></tr></table><![endif]-->`;
  });
  return `<div style="font-size:0;line-height:0;text-align:left">${out}</div>`;
}

function filmDims(portrait: boolean): { w: number; h: number } {
  // Vimeo posters come back 640x1138 for a reel and 1280x720 for a landscape
  // film. The card shows a reel at a phone's proportion and a film full width.
  return portrait ? { w: 240, h: 427 } : { w: CONTENT, h: Math.round((CONTENT * 9) / 16) };
}

/* ── Each block, as HTML ────────────────────────────────────────────── */

type Ctx = { p: Palette; origin: string; recipient?: Recipient };

function heroHtml(b: Extract<Block, { kind: "hero" }>, c: Ctx): string {
  const { p } = c;
  const title = personalize(b.title, c.recipient);
  const sub = personalize(b.sub, c.recipient);
  const ink = inkFor(p, "plain");

  if (b.layout === "overlay" && b.image) {
    /* The bulletproof background. Everybody but Outlook reads the CSS
       background on the table; Outlook reads the VML rectangle and draws
       the same photo behind the same words. */
    const url = pic(b.image, 1200, 960, c.origin);
    const H = 480;
    const words =
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed"><tr>` +
      `<td class="pg-wash" style="background:${p.overlay};border-radius:16px;padding:22px 24px">` +
      (title
        ? `<h1 class="pg-h1" style="margin:0;font:700 34px/1.1 ${FONT};letter-spacing:-0.02em;color:#ffffff;word-break:break-word;text-shadow:0 1px 2px rgba(0,0,0,.4)">${inline(title, { ink: "#ffffff", link: "#ffffff" })}</h1>`
        : "") +
      (sub
        ? `<p style="margin:${title ? 12 : 0}px 0 0;font:400 16px/1.55 ${FONT};color:rgba(255,255,255,.86);text-shadow:0 1px 2px rgba(0,0,0,.4)">${inline(sub, { ink: "#ffffff", link: "#ffffff" })}</p>`
        : "") +
      `</td></tr></table>`;
    return (
      `<tr><td style="padding:0 0 30px">` +
      `<!--[if gte mso 9]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:${SHELL}px;height:${H}px;"><v:fill type="frame" src="${esc(url)}" color="${p.ground}" /><v:textbox inset="0,0,0,0"><![endif]-->` +
      `<table role="presentation" class="pg-hero" width="100%" cellpadding="0" cellspacing="0" border="0" background="${esc(url)}" style="table-layout:fixed;width:${SHELL}px;max-width:${SHELL}px;height:${H}px;background-color:${p.ground};background-image:url(${esc(url)});background-size:cover;background-position:center;background-repeat:no-repeat">` +
      `<tr><td class="pg-pad pg-hero-td" valign="bottom" style="height:${H}px;padding:200px ${PAD}px ${PAD}px;vertical-align:bottom">${words}</td></tr></table>` +
      `<!--[if gte mso 9]></v:textbox></v:rect><![endif]-->` +
      `</td></tr>`
    );
  }

  const picture = b.image
    ? `<tr><td style="padding:0 0 26px">${linkWrap(
        b.href,
        img(pic(b.image, 1200, 800, c.origin), b.alt || title, SHELL, 400, ink, "border-radius:0"),
      )}</td></tr>`
    : "";
  const words =
    title || sub
      ? section(
          (title
            ? `<h1 class="pg-h1" style="margin:0;font:700 34px/1.1 ${FONT};letter-spacing:-0.02em;color:${ink.ink};word-break:break-word">${inline(title, ink)}</h1>`
            : "") +
            (sub
              ? `<p class="pg-muted" style="margin:${title ? 14 : 0}px 0 0;font:400 17px/1.55 ${FONT};color:${ink.ink2}">${inline(sub, ink)}</p>`
              : ""),
          0,
          30,
        )
      : "";
  return picture + words;
}

function blockHtml(b: Block, c: Ctx): string {
  const { p, recipient } = c;
  switch (b.kind) {
    case "hero":
      return heroHtml(b, c);

    case "heading": {
      const ink = inkFor(p, b.tone);
      return toned(
        (b.label
          ? `<p class="pg-muted" style="margin:0 0 10px;font:600 11px/1.2 ${FONT};letter-spacing:.15em;text-transform:uppercase;color:${ink.label}">${esc(b.label)}</p>`
          : "") +
          `<h2 style="margin:0;font:700 24px/1.2 ${FONT};letter-spacing:-0.015em;color:${ink.ink};word-break:break-word">${inline(
            personalize(b.text, recipient),
            ink,
          )}</h2>`,
        ink,
        8,
        ink.bg ? 20 : 16,
      );
    }

    case "text": {
      const ink = inkFor(p, b.tone);
      return toned(paragraphs(b.text, ink, recipient, "16px/1.65", Boolean(ink.bg)), ink, 0, ink.bg ? 20 : 6);
    }

    case "image": {
      if (!b.image) return "";
      const ink = inkFor(p, "plain");
      const caption = b.caption
        ? `<p class="pg-muted" style="margin:10px 0 0;font:400 13px/1.5 ${FONT};color:${ink.ink3}">${inline(b.caption, ink)}</p>`
        : "";
      return section(
        linkWrap(b.href, img(pic(b.image, 1064, null, c.origin), b.alt, CONTENT, null, ink, "border-radius:14px")) + caption,
        6,
        24,
      );
    }

    case "gallery": {
      const items = b.items.filter((it) => it.image);
      if (items.length === 0) return "";
      const ink = inkFor(p, "plain");
      const cols = b.columns;
      const gutter = 6;
      const cellW = Math.floor(CONTENT / cols);
      const imgW = cellW - gutter * 2;
      const imgH = Math.round((imgW * 2) / 3);
      const cells = items.map(
        (it) =>
          `<div style="padding:${gutter}px">` +
          linkWrap(it.href, img(pic(it.image, imgW * 2, imgH * 2, c.origin), it.alt || it.caption, imgW, imgH, ink, "border-radius:12px")) +
          (it.caption
            ? `<p style="margin:8px 0 0;font:400 12px/1.4 ${FONT};color:${ink.ink3}">${esc(it.caption)}</p>`
            : "") +
          `</div>`,
      );
      const title = b.title
        ? `<h3 style="margin:0 0 10px;font:700 20px/1.25 ${FONT};letter-spacing:-0.01em;color:${ink.ink}">${inline(personalize(b.title, recipient), ink)}</h3>`
        : "";
      return section(title + `<div style="margin:0 -${gutter}px">${hybrid(cells, cols, cellW, cols === 3 ? "half" : "stack")}</div>`, 6, 22);
    }

    case "feature": {
      const ink = inkFor(p, b.tone);
      const gap = 18;
      const col = Math.floor(ink.width / 2);
      const inner = col - gap / 2;
      const innerH = Math.round((inner * 2) / 3);
      const picture = b.image
        ? `<div style="padding:0 ${b.side === "left" ? gap / 2 : 0}px 0 ${b.side === "right" ? gap / 2 : 0}px">` +
          linkWrap(b.href, img(pic(b.image, inner * 2, innerH * 2, c.origin), b.alt, inner, innerH, ink, "border-radius:14px")) +
          `</div>`
        : "";
      const words =
        `<div class="nl-col-pad" style="padding:${b.image ? 4 : 0}px ${b.side === "right" && b.image ? gap / 2 : 0}px 0 ${b.side === "left" && b.image ? gap / 2 : 0}px">` +
        (b.title
          ? `<h3 style="margin:0 0 10px;font:700 20px/1.25 ${FONT};letter-spacing:-0.01em;color:${ink.ink}">${inline(personalize(b.title, recipient), ink)}</h3>`
          : "") +
        paragraphs(b.text, ink, recipient, "15px/1.6") +
        (b.href && b.buttonLabel
          ? `<a href="${esc(b.href)}" style="font:600 14px/1.4 ${FONT};color:${ink.link};text-decoration:none">${esc(b.buttonLabel)} &rarr;</a>`
          : "") +
        `</div>`;
      const cells = b.image ? (b.side === "left" ? [picture, words] : [words, picture]) : [words];
      return toned(hybrid(cells, b.image ? 2 : 1, b.image ? col : ink.width), ink, 6, ink.bg ? 20 : 20);
    }

    case "film": {
      if (!b.vimeoId || !b.poster) return "";
      const ink = inkFor(p, "plain");
      const { w, h } = filmDims(b.portrait);
      const href = `https://vimeo.com/${b.vimeoId}`;
      const poster = table(
        `<tr><td align="center">` +
          `<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto"><tr><td>` +
          linkWrap(href, img(b.poster, b.title || "Watch the film", w, h, ink, "border-radius:14px")) +
          `</td></tr></table></td></tr>`,
      );
      const words =
        `<p style="margin:16px 0 0;font:600 17px/1.3 ${FONT};color:${ink.ink};text-align:center">${esc(b.title)}</p>` +
        (b.category
          ? `<p class="pg-muted" style="margin:4px 0 0;font:400 13px/1.5 ${FONT};color:${ink.ink3};text-align:center">${esc(b.category)}</p>`
          : "") +
        `<div style="margin:16px 0 0">${pill(href, "Watch the film", "outline", ink)}</div>`;
      return section(poster + words, 6, 28);
    }

    case "stats": {
      const items = b.items.filter((it) => it.value);
      if (items.length === 0) return "";
      const ink = inkFor(p, b.tone);
      const cellW = Math.floor(ink.width / items.length);
      const cells = items.map(
        (it) =>
          `<div style="padding:6px 8px;text-align:center">` +
          `<p style="margin:0;font:700 32px/1.1 ${FONT};letter-spacing:-0.02em;color:${ink.ink}">${esc(it.value)}</p>` +
          (it.label
            ? `<p style="margin:6px 0 0;font:600 11px/1.3 ${FONT};letter-spacing:.12em;text-transform:uppercase;color:${ink.ink3}">${esc(it.label)}</p>`
            : "") +
          `</div>`,
      );
      return toned(hybrid(cells, items.length, cellW, "keep"), ink, 6, 22);
    }

    case "list": {
      const items = b.items
        .split("\n")
        .map((s) => s.replace(/^\s*(\d+[.)]|[-*•])\s*/, "").trim())
        .filter(Boolean);
      if (items.length === 0) return "";
      const ink = inkFor(p, b.tone);
      const marker = (i: number) =>
        b.style === "numbered"
          ? `<td width="28" valign="top" style="width:28px;padding:1px 0 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="width:26px;height:26px;background:${ink.btnBg};border-radius:999px;font:600 13px/26px ${FONT};color:${ink.btnFg}">${i + 1}</td></tr></table></td>`
          : `<td width="28" valign="top" style="width:28px;padding:9px 0 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:8px;height:8px;background:${ink.link};border-radius:999px;font-size:0;line-height:0">&nbsp;</td></tr></table></td>`;
      const rows = items
        .map(
          (it, i) =>
            `<tr>${marker(i)}<td style="padding:0 0 14px 12px;font:400 16px/1.55 ${FONT};color:${ink.ink2}">${inline(personalize(it, recipient), ink)}</td></tr>`,
        )
        .join("");
      const title = b.title
        ? `<h3 style="margin:0 0 14px;font:700 20px/1.25 ${FONT};letter-spacing:-0.01em;color:${ink.ink}">${inline(personalize(b.title, recipient), ink)}</h3>`
        : "";
      return toned(title + table(rows), ink, 6, ink.bg ? 12 : 10);
    }

    case "button": {
      if (!b.href || !b.label) return "";
      return section(pill(b.href, b.label, b.style, inkFor(p, "plain")), 8, 26);
    }

    case "quote": {
      if (!b.text) return "";
      const ink = inkFor(p, b.tone);
      return toned(
        table(
          `<tr><td style="border-left:2px solid ${b.tone === "accent" ? ink.link : p.signal};padding:2px 0 2px 20px">` +
            `<p style="margin:0;font:400 19px/1.5 ${FONT};color:${ink.ink};letter-spacing:-0.005em">&ldquo;${inline(
              personalize(b.text, recipient),
              ink,
            ).replace(/\n/g, "<br>")}&rdquo;</p>` +
            (b.name
              ? `<p class="pg-muted" style="margin:12px 0 0;font:600 13px/1.4 ${FONT};color:${ink.ink2}">${esc(b.name)}` +
                (b.role ? `<span style="font-weight:400;color:${ink.ink3}">, ${esc(b.role)}</span>` : "") +
                `</p>`
              : "") +
            `</td></tr>`,
        ),
        ink,
        10,
        26,
      );
    }

    case "note": {
      if (!b.text && !b.name) return "";
      const ink = inkFor(p, b.tone);
      const head = b.image
        ? `<td width="64" valign="top" style="width:64px;padding:0 16px 0 0">${img(pic(b.image, 128, 128, c.origin), b.name || "Headshot", 64, 64, ink, "border-radius:999px")}</td>`
        : "";
      return toned(
        table(
          `<tr>${head}<td valign="top">` +
            paragraphs(b.text, ink, recipient, "16px/1.6", !b.name) +
            (b.name
              ? `<p style="margin:-4px 0 0;font:600 14px/1.4 ${FONT};color:${ink.ink}">${esc(b.name)}` +
                (b.role ? `<span style="font-weight:400;color:${ink.ink3}">, ${esc(b.role)}</span>` : "") +
                `</p>`
              : "") +
            `</td></tr>`,
        ),
        ink,
        6,
        22,
      );
    }

    case "cta": {
      if (!b.href || !b.label) return "";
      const ink = inkFor(p, b.tone);
      const phones = Object.values(BUSINESS.phones)
        .map((ph) => `<a href="${ph.href}" style="color:${ink.ink2};text-decoration:none;white-space:nowrap">${esc(ph.label)} ${esc(ph.number)}</a>`)
        .join(" &nbsp;&middot;&nbsp; ");
      return toned(
        (b.title
          ? `<h2 style="margin:0;font:700 26px/1.15 ${FONT};letter-spacing:-0.018em;color:${ink.ink};text-align:center;word-break:break-word">${inline(personalize(b.title, recipient), ink)}</h2>`
          : "") +
          (b.text
            ? `<p style="margin:12px auto 0;max-width:420px;font:400 16px/1.55 ${FONT};color:${ink.ink2};text-align:center">${inline(personalize(b.text, recipient), ink)}</p>`
            : "") +
          `<div style="margin:22px 0 0">${pill(b.href, b.label, "solid", ink)}</div>` +
          (b.phones
            ? `<p style="margin:18px 0 0;font:400 12px/1.7 ${FONT};color:${ink.ink3};text-align:center">Or call: ${phones}</p>`
            : ""),
        ink,
        10,
        26,
      );
    }

    case "divider":
      return section(rule(p.line), 10, 22);

    case "spacer":
      return `<tr><td style="height:${{ s: 12, m: 28, l: 52 }[b.size]}px;line-height:1px;font-size:0">&nbsp;</td></tr>`;
  }
}

/* ── Each block, as text ────────────────────────────────────────────── */

function blockText(b: Block, recipient?: Recipient): string[] {
  const t = (s: string) => inlineText(personalize(s, recipient));
  switch (b.kind) {
    case "hero":
      return [t(b.title), t(b.sub)].filter(Boolean);
    case "heading":
      return [t(b.text).toUpperCase()];
    case "text":
      return [t(b.text)];
    case "image":
      return [b.caption ? inlineText(b.caption) : b.alt].filter(Boolean);
    case "gallery":
      return [
        t(b.title),
        ...b.items.filter((it) => it.image).map((it) => `- ${it.caption || it.alt}${it.href ? ` (${it.href})` : ""}`),
      ].filter(Boolean);
    case "feature":
      return [t(b.title), t(b.text), b.href && b.buttonLabel ? `${b.buttonLabel}: ${b.href}` : ""].filter(Boolean);
    case "film":
      return b.vimeoId ? [`${b.title || "Watch the film"}: https://vimeo.com/${b.vimeoId}`] : [];
    case "stats":
      return b.items.filter((it) => it.value).map((it) => `${it.value} ${it.label}`.trim());
    case "list": {
      const items = b.items
        .split("\n")
        .map((s) => s.replace(/^\s*(\d+[.)]|[-*•])\s*/, "").trim())
        .filter(Boolean);
      return [t(b.title), ...items.map((it, i) => `${b.style === "numbered" ? `${i + 1}.` : "-"} ${t(it)}`)].filter(Boolean);
    }
    case "button":
      return b.href && b.label ? [`${b.label}: ${b.href}`] : [];
    case "quote":
      return b.text ? [`"${t(b.text)}"` + (b.name ? `\n${b.name}${b.role ? `, ${b.role}` : ""}` : "")] : [];
    case "note":
      return [t(b.text), b.name ? `${b.name}${b.role ? `, ${b.role}` : ""}` : ""].filter(Boolean);
    case "cta": {
      const phones = Object.values(BUSINESS.phones)
        .map((ph) => `${ph.label} ${ph.number}`)
        .join(", ");
      return [t(b.title), t(b.text), b.href && b.label ? `${b.label}: ${b.href}` : "", b.phones ? `Or call: ${phones}` : ""].filter(Boolean);
    }
    case "divider":
    case "spacer":
      return [];
  }
}

/* ── The whole email ────────────────────────────────────────────────── */

function footerHtml(p: Palette, opts: RenderOptions): string {
  const unsubscribe = opts.recipient?.unsubscribeUrl ?? `${SITE_URL}/newsletter/unsubscribe/preview`;
  const phones = Object.values(BUSINESS.phones)
    .map((ph) => `${ph.label} ${ph.number}`)
    .join(" &middot; ");
  const address = opts.postalAddress?.trim() || BUSINESS.locationText;
  const small = `font:400 12px/1.8 ${FONT};color:${p.ink3}`;
  const socialLink = `font:600 12px/1.8 ${FONT};color:${p.ink2};text-decoration:none`;
  return (
    section(rule(p.line), 40, 0) +
    `<tr><td class="pg-pad" align="center" style="padding:22px ${PAD}px 10px">` +
    `<a href="${BUSINESS.socials.instagram}" style="${socialLink}">Instagram</a>&nbsp;&nbsp;&nbsp;&nbsp;` +
    `<a href="${BUSINESS.socials.facebook}" style="${socialLink}">Facebook</a>&nbsp;&nbsp;&nbsp;&nbsp;` +
    `<a href="${SITE_URL}/portfolio" style="${socialLink}">Portfolio</a>` +
    `</td></tr>` +
    `<tr><td class="pg-pad" align="center" style="padding:6px ${PAD}px 44px;${small}">` +
    `<a href="${SITE_URL}" style="color:${p.ink};text-decoration:none;font-weight:600;letter-spacing:.02em">PG Creatives</a><br>` +
    `${esc(address)}<br>${phones}<br>` +
    `<span style="color:${p.ink3}">You are getting this because you have worked with PG Creatives or asked to hear from us.</span><br>` +
    `<a href="${esc(unsubscribe)}" style="color:${p.ink2};text-decoration:underline">Unsubscribe</a>` +
    (opts.viewUrl
      ? `&nbsp;&nbsp;&nbsp;&nbsp;<a href="${esc(opts.viewUrl)}" style="color:${p.ink2};text-decoration:underline">View in a browser</a>`
      : "") +
    `</td></tr>`
  );
}

export function renderNewsletterHtml(draft: Draft, opts: RenderOptions = {}): string {
  const p = PALETTES[draft.theme] ?? PALETTES.night;
  const c: Ctx = { p, origin: opts.assetOrigin ?? SITE_URL, recipient: opts.recipient };
  const subject = personalize(draft.subject, c.recipient);
  const preheader = personalize(draft.preheader, c.recipient) || subject;

  const body = draft.blocks
    .map((b) => {
      const inner = blockHtml(b, c);
      if (!inner) return "";
      /* Every block in its own table, so the editor can ring one of them
         and so a block's rows can never bleed into the next block's. */
      const ring = opts.highlightId === b.id ? `outline:2px solid ${p.signal};outline-offset:-2px;` : "";
      return `<tr><td data-block="${esc(b.id)}" style="padding:0;${ring}">${table(inner)}</td></tr>`;
    })
    .join("");

  return (
    `<!doctype html><html lang="en" dir="ltr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head>` +
    `<meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<meta http-equiv="X-UA-Compatible" content="IE=edge">` +
    `<meta name="color-scheme" content="${p.scheme}">` +
    `<meta name="supported-color-schemes" content="${p.scheme}">` +
    `<title>${esc(subject)}</title>` +
    /* Outlook on Windows scales for high DPI by its own rules unless told
       to use the widths it is given. */
    `<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->` +
    `<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">` +
    `<style>` +
    `body{margin:0;padding:0;background:${p.ground};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}` +
    `img{border:0;outline:0;line-height:100%;text-decoration:none;-ms-interpolation-mode:bicubic}` +
    `table{border-collapse:separate;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0}` +
    `a{color:${p.signalInk}}` +
    `.nl-col{display:inline-block;width:100%;vertical-align:top}` +
    `@media (max-width:620px){` +
    `.pg-shell{width:100% !important;max-width:100% !important}` +
    `.pg-pad{padding-left:22px !important;padding-right:22px !important}` +
    `.pg-panel{padding-left:18px !important;padding-right:18px !important}` +
    `.pg-h1{font-size:29px !important}` +
    `.pg-hero{width:100% !important;height:auto !important}` +
    `.pg-hero-td{height:auto !important;padding-top:170px !important}` +
    `.pg-outer{padding:0 !important}` +
    `.nl-col{max-width:100% !important;padding-bottom:12px}` +
    `.nl-half{max-width:50% !important;padding-bottom:0}` +
    `.nl-keep3{max-width:33.33% !important;padding-bottom:0}` +
    `.nl-keep2{max-width:50% !important;padding-bottom:0}` +
    `.nl-keep1{padding-bottom:0}` +
    `.nl-col-pad{padding-left:0 !important;padding-right:0 !important}` +
    `}` +
    `</style></head>` +
    `<body class="pg-body" style="margin:0;padding:0;background:${p.ground}">` +
    `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${p.ground};opacity:0">` +
    `${esc(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${p.ground}" style="background:${p.ground}">` +
    `<tr><td class="pg-outer" align="center" style="padding:0">` +
    `<!--[if mso]><table role="presentation" width="${SHELL}" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->` +
    `<table role="presentation" class="pg-shell" width="${SHELL}" cellpadding="0" cellspacing="0" border="0" style="width:${SHELL}px;max-width:${SHELL}px;table-layout:fixed;background:${p.ground}">` +
    /* Header: the wordmark, alt styled so a client with images off shows the
       name in the right face rather than a blue serif link. On the light
       theme the wordmark sits on a small dark plate, since the mark itself
       is white and baked onto the brand ground. */
    `<tr><td align="center" style="background:${p.ground};padding:36px 24px 28px">` +
    `<a href="${SITE_URL}" style="text-decoration:none">` +
    (p.scheme === "light"
      ? `<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto"><tr><td style="background:#07090c;border-radius:12px;padding:10px 16px">`
      : "") +
    `<img src="${c.origin === SITE_URL ? LOGO_URL : `${c.origin}/email-logo.png`}" width="176" height="37" alt="PG Creatives" style="display:block;width:176px;height:37px;font:700 21px/37px ${FONT};letter-spacing:-0.01em;color:#ffffff;text-decoration:none">` +
    (p.scheme === "light" ? `</td></tr></table>` : "") +
    `</a></td></tr>` +
    body +
    footerHtml(p, opts) +
    `</table>` +
    `<!--[if mso]></td></tr></table><![endif]-->` +
    `</td></tr></table></body></html>`
  );
}

export function renderNewsletterText(draft: Draft, opts: RenderOptions = {}): string {
  const { recipient } = opts;
  const lines: string[] = [personalize(draft.subject, recipient)];
  if (draft.preheader) lines.push(personalize(draft.preheader, recipient));
  for (const b of draft.blocks) {
    const t = blockText(b, recipient);
    if (t.length) lines.push("", ...t);
  }
  const address = opts.postalAddress?.trim() || BUSINESS.locationText;
  lines.push(
    "",
    "",
    `PG Creatives, ${address}`,
    Object.values(BUSINESS.phones)
      .map((ph) => `${ph.label} ${ph.number}`)
      .join(", "),
    SITE_URL,
    `Instagram: ${BUSINESS.socials.instagram}`,
    "",
    "You are getting this because you have worked with PG Creatives or asked to hear from us.",
    `Unsubscribe: ${recipient?.unsubscribeUrl ?? `${SITE_URL}/newsletter/unsubscribe/preview`}`,
  );
  if (opts.viewUrl) lines.push(`View in a browser: ${opts.viewUrl}`);
  return lines.join("\n");
}

export function renderNewsletter(draft: Draft, opts: RenderOptions = {}): RenderedEmail {
  return {
    subject: headerSafe(personalize(draft.subject, opts.recipient)),
    html: renderNewsletterHtml(draft, opts),
    text: renderNewsletterText(draft, opts),
    replyTo: BUSINESS.email,
  };
}

/* ── Preflight ──────────────────────────────────────────────────────── */

export type Preflight = { errors: string[]; warnings: string[] };

/**
 * Everything that should stop a send, and everything worth a second look,
 * decided before the confirm button rather than discovered in an inbox.
 */
export function preflight(
  draft: Draft,
  ctx: { subscribers: number; hasKey: boolean; postalAddress?: string },
): Preflight {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!draft.subject.trim()) errors.push("Write a subject line.");
  if (draft.blocks.length === 0) errors.push("Add at least one block.");

  const visible = draft.blocks.filter((b) => b.kind !== "divider" && b.kind !== "spacer");
  if (draft.blocks.length > 0 && visible.length === 0) errors.push("The email has no content yet.");

  draft.blocks.forEach((b, i) => {
    const where = `Block ${i + 1} (${b.kind === "cta" ? "book a shoot" : b.kind})`;
    if ((b.kind === "hero" || b.kind === "image" || b.kind === "feature") && b.image && !b.alt) {
      errors.push(`${where}: describe the picture for people who cannot see it.`);
    }
    if (b.kind === "gallery" && b.items.some((it) => it.image && !it.alt && !it.caption)) {
      errors.push(`${where}: every photo needs a caption or a description.`);
    }
    if (b.kind === "gallery" && !b.items.some((it) => it.image)) errors.push(`${where}: add at least one photo or remove the grid.`);
    if (b.kind === "image" && !b.image) errors.push(`${where}: pick a picture or remove the block.`);
    if (b.kind === "hero" && !b.image && !b.title) errors.push(`${where}: the opening needs a picture or a headline.`);
    if (b.kind === "hero" && b.layout === "overlay" && !b.image) errors.push(`${where}: words over a picture need the picture.`);
    if (b.kind === "button" && (!b.label || !b.href)) errors.push(`${where}: the button needs a label and a link.`);
    if (b.kind === "cta" && (!b.label || !b.href)) errors.push(`${where}: the booking button needs a label and a link.`);
    if (b.kind === "film" && !b.vimeoId) errors.push(`${where}: choose a film or remove the block.`);
    if (b.kind === "heading" && !b.text) errors.push(`${where}: the heading is empty.`);
    if (b.kind === "text" && !b.text) errors.push(`${where}: the paragraph block is empty.`);
    if (b.kind === "quote" && !b.text) errors.push(`${where}: the quote is empty.`);
    if (b.kind === "note" && !b.text) errors.push(`${where}: the note is empty.`);
    if (b.kind === "list" && !b.items.trim()) errors.push(`${where}: the list is empty.`);
    if (b.kind === "stats" && !b.items.some((it) => it.value)) errors.push(`${where}: the numbers are empty.`);
    if (b.kind === "feature" && !b.title && !b.text) errors.push(`${where}: write something beside the picture.`);
  });

  const sample = renderNewsletterHtml(draft, {});
  const bytes = Buffer.byteLength(sample);
  if (bytes >= 90_000) {
    errors.push(`The email is ${Math.round(bytes / 1024)}KB. Gmail clips anything past about 100KB, so shorten it.`);
  }

  if (ctx.subscribers === 0) errors.push("There is nobody on the list yet.");
  if (!ctx.hasKey) errors.push("Sending is not set up: the Resend key is missing.");

  const prose = [
    draft.subject,
    draft.preheader,
    ...draft.blocks.flatMap((b) =>
      Object.values(b).flatMap((v) =>
        typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap((o) => Object.values(o ?? {}).filter((x): x is string => typeof x === "string")) : [],
      ),
    ),
  ].join("\n");
  if (/[–—]/.test(prose)) warnings.push("There is an en or em dash in the copy. Use a comma, a colon or a full stop.");
  if (draft.subject.length > 60) warnings.push("The subject is over 60 characters and will be cut short on a phone.");
  if (!draft.preheader.trim()) warnings.push("No preview text. Inboxes will show the first words of the email instead.");
  if (!draft.blocks.some((b) => (b.kind === "button" && b.href) || (b.kind === "cta" && b.href) || (b.kind === "feature" && b.href) || b.kind === "film")) {
    warnings.push("Nothing in the email asks the reader to do anything. A Book a shoot block usually helps.");
  }
  if (!ctx.postalAddress?.trim()) {
    warnings.push("No postal address is set, so the footer shows the markets served. CAN-SPAM asks for a street address.");
  }
  if (usesPersonalization(draft)) {
    warnings.push('The email uses {{first_name}}. Anyone whose row has no first name will read "there".');
  }

  return { errors, warnings };
}
