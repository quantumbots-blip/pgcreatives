import { BUSINESS } from "@/lib/data";
import {
  COLOR,
  FONT,
  LOGO_URL,
  SITE_URL,
  esc,
  headerSafe,
  type RenderedEmail,
} from "@/lib/email/layout";
import type { Block, Draft } from "./blocks";

/**
 * Blocks in, an email out.
 *
 * Built on the same rules as the transactional shell in email/layout.ts and
 * held to them by the same tests: one dark ground edge to edge, nested tables
 * with every style inline, no flex or grid or positioning, separate borders
 * so the pills stay round, no bgcolor next to a radius, the accent only ever
 * as a fill, and under 90KB so Gmail does not clip it.
 *
 * Two things a newsletter needs that a notification does not:
 *
 * 1. A footer that satisfies the people who decide whether it lands. Gmail,
 *    Yahoo and Apple require a one click unsubscribe (that is the header pair
 *    the sender adds) and a visible one in the body; CAN-SPAM requires a
 *    postal address and a plain statement of why the reader is getting it.
 *    So the footer is not a block. It cannot be removed from the editor.
 *
 * 2. A two column layout that survives Outlook. Media queries are stripped by
 *    enough clients that a layout which depends on one is a layout that fails
 *    somewhere. The "feature" block is the fluid hybrid: two inline-block
 *    halves that sit side by side while there is room and stack on their own
 *    when there is not, with a conditional comment giving Outlook, which does
 *    not understand max-width on a div, a real table to hold them.
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
};

/* The shell is 600 wide; the content sits inside 34px of padding on each
   side, the same as the transactional emails. */
const SHELL = 600;
const PAD = 34;
const CONTENT = SHELL - PAD * 2; // 532
const COL = CONTENT / 2; // 266

const LINK = `color:${COLOR.signalInk};text-decoration:underline`;

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
export function inline(text: string): string {
  return esc(text)
    .replace(
      /\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g,
      (_m, label: string, href: string) => `<a href="${href}" style="${LINK}">${label}</a>`,
    )
    .replace(/\*\*([^*\n]+)\*\*/g, `<strong style="font-weight:600;color:${COLOR.ink}">$1</strong>`);
}

/** The same text for the plain twin: no syntax, links spelled out. */
export function inlineText(text: string): string {
  return text
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1 ($2)")
    .replace(/\*\*([^*\n]+)\*\*/g, "$1");
}

/**
 * Where a picture actually loads from. A path into public/ goes through the
 * image optimizer at 1200 wide, so a 400KB master becomes a 100KB JPEG on
 * the way to a phone; anything that is already https is left alone. Always
 * absolute: an inbox has nowhere for a relative path to be relative to.
 */
export function imageUrl(src: string): string {
  if (!src) return "";
  if (/^https:\/\//i.test(src)) return src;
  return `${SITE_URL}/_next/image?url=${encodeURIComponent(src)}&w=1200&q=75`;
}

function table(inner: string, attrs = "", style = ""): string {
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"${attrs ? ` ${attrs}` : ""}` +
    ` style="table-layout:fixed${style ? `;${style}` : ""}">${inner}</table>`
  );
}

function rule(): string {
  return table(
    `<tr><td style="height:1px;line-height:1px;font-size:0;background:${COLOR.line}">&nbsp;</td></tr>`,
  );
}

/** A section of the shell with the standard side padding. */
function section(inner: string, top = 0, bottom = 0): string {
  return `<tr><td class="pg-pad" style="padding:${top}px ${PAD}px ${bottom}px">${inner}</td></tr>`;
}

function img(src: string, alt: string, width: number, height: number | null, extra = ""): string {
  const h = height ? `height="${height}"` : "";
  const hs = height ? `height:${height}px` : "height:auto";
  return (
    `<img src="${esc(imageUrl(src))}" width="${width}" ${h} alt="${esc(alt)}"` +
    ` style="display:block;width:100%;max-width:${width}px;${hs};border:0;outline:0;text-decoration:none;` +
    `font:400 13px/1.4 ${FONT};color:${COLOR.ink3};${extra}">`
  );
}

function linkWrap(href: string, inner: string): string {
  return href ? `<a href="${esc(href)}" style="text-decoration:none">${inner}</a>` : inner;
}

/**
 * The site's pill. Centered and sized to its label, or stretched across the
 * content when `full`. No bgcolor attribute anywhere near the radius.
 */
function pill(href: string, label: string, style: "solid" | "outline", full = false): string {
  const solid = style === "solid";
  const bg = solid ? COLOR.signal : COLOR.ground;
  const border = solid ? COLOR.signal : COLOR.lineStrong;
  const cell =
    `<td align="center" class="${solid ? "pg-btn" : "pg-btn-out"}" style="background:${bg};border:1px solid ${border};border-radius:999px">` +
    `<a href="${esc(href)}" class="pg-btn-a" style="display:block;padding:14px ${full ? 10 : 30}px;font:600 15px/1.25 ${FONT};letter-spacing:-0.01em;color:#ffffff;text-decoration:none;white-space:nowrap">${esc(label)}</a></td>`;
  if (full) return table(`<tr>${cell}</tr>`);
  return (
    `<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto">` +
    `<tr>${cell}</tr></table>`
  );
}

function paragraphs(text: string, recipient?: Recipient): string {
  return personalize(text, recipient)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p class="pg-text" style="margin:0 0 18px;font:400 16px/1.65 ${FONT};color:${COLOR.ink2}">${inline(p).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

function filmDims(portrait: boolean): { w: number; h: number } {
  // Vimeo posters come back 640x1138 for a reel and 1280x720 for a landscape
  // film. The card shows a reel at a phone's proportion and a film full width.
  return portrait ? { w: 240, h: 427 } : { w: CONTENT, h: Math.round((CONTENT * 9) / 16) };
}

/* ── Each block, as HTML and as text ────────────────────────────────── */

function blockHtml(b: Block, recipient?: Recipient): string {
  switch (b.kind) {
    case "hero": {
      const title = personalize(b.title, recipient);
      const picture = b.image
        ? `<tr><td style="padding:0 0 26px">${linkWrap(
            b.href,
            img(b.image, b.alt || title, SHELL, null, "border-radius:0"),
          )}</td></tr>`
        : "";
      const words =
        title || b.sub
          ? section(
              (title
                ? `<h1 class="pg-h1" style="margin:0;font:700 34px/1.1 ${FONT};letter-spacing:-0.02em;color:${COLOR.ink};word-break:break-word">${inline(title)}</h1>`
                : "") +
                (b.sub
                  ? `<p class="pg-muted" style="margin:${title ? 14 : 0}px 0 0;font:400 17px/1.55 ${FONT};color:${COLOR.ink2}">${inline(
                      personalize(b.sub, recipient),
                    )}</p>`
                  : ""),
              0,
              30,
            )
          : "";
      return picture + words;
    }
    case "heading":
      return section(
        (b.label
          ? `<p class="pg-muted" style="margin:0 0 10px;font:600 11px/1.2 ${FONT};letter-spacing:.15em;text-transform:uppercase;color:${COLOR.signalInk}">${esc(b.label)}</p>`
          : "") +
          `<h2 style="margin:0;font:700 24px/1.2 ${FONT};letter-spacing:-0.015em;color:${COLOR.ink};word-break:break-word">${inline(
            personalize(b.text, recipient),
          )}</h2>`,
        8,
        16,
      );
    case "text":
      return section(paragraphs(b.text, recipient), 0, 6);
    case "image": {
      if (!b.image) return "";
      const caption = b.caption
        ? `<p class="pg-muted" style="margin:10px 0 0;font:400 13px/1.5 ${FONT};color:${COLOR.ink3}">${inline(b.caption)}</p>`
        : "";
      return section(
        linkWrap(b.href, img(b.image, b.alt, CONTENT, null, "border-radius:14px")) + caption,
        6,
        24,
      );
    }
    case "feature": {
      const gap = 18;
      const inner = COL - gap / 2;
      const picture = b.image
        ? `<div class="nl-col" style="display:inline-block;width:100%;max-width:${COL}px;vertical-align:top">` +
          `<div style="padding:0 ${b.side === "left" ? gap / 2 : 0}px 0 ${b.side === "right" ? gap / 2 : 0}px">` +
          linkWrap(b.href, img(b.image, b.alt, inner, null, "border-radius:14px")) +
          `</div></div>`
        : "";
      const words =
        `<div class="nl-col" style="display:inline-block;width:100%;max-width:${b.image ? COL : CONTENT}px;vertical-align:top">` +
        `<div class="nl-col-pad" style="padding:${b.image ? 4 : 0}px ${b.side === "right" ? gap / 2 : 0}px 0 ${b.side === "left" && b.image ? gap / 2 : 0}px">` +
        (b.title
          ? `<h3 style="margin:0 0 10px;font:700 20px/1.25 ${FONT};letter-spacing:-0.01em;color:${COLOR.ink}">${inline(
              personalize(b.title, recipient),
            )}</h3>`
          : "") +
        paragraphs(b.text, recipient).replace(/16px\/1\.65/g, "15px/1.6") +
        (b.href && b.buttonLabel
          ? `<a href="${esc(b.href)}" style="font:600 14px/1.4 ${FONT};color:${COLOR.signalInk};text-decoration:none">${esc(
              b.buttonLabel,
            )} &rarr;</a>`
          : "") +
        `</div></div>`;
      const [first, second] = b.side === "left" ? [picture, words] : [words, picture];
      /* Outlook gets a real table through the conditional comment, and a
         font-size of zero on the wrapper removes the whitespace that would
         otherwise sit between two inline blocks and push the second one
         down a line at exactly the wrong width. */
      const columns =
        `<!--[if mso]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="50%" valign="top"><![endif]-->` +
        first +
        `<!--[if mso]></td><td width="50%" valign="top"><![endif]-->` +
        second +
        `<!--[if mso]></td></tr></table><![endif]-->`;
      return section(`<div style="font-size:0;line-height:0;text-align:left">${columns}</div>`, 6, 20);
    }
    case "film": {
      if (!b.vimeoId || !b.poster) return "";
      const { w, h } = filmDims(b.portrait);
      const href = `https://vimeo.com/${b.vimeoId}`;
      const poster = table(
        `<tr><td align="center">` +
          `<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto"><tr><td>` +
          linkWrap(href, img(b.poster, b.title || "Watch the film", w, h, "border-radius:14px")) +
          `</td></tr></table></td></tr>`,
      );
      const words =
        `<p style="margin:16px 0 0;font:600 17px/1.3 ${FONT};color:${COLOR.ink};text-align:center">${esc(b.title)}</p>` +
        (b.category
          ? `<p class="pg-muted" style="margin:4px 0 0;font:400 13px/1.5 ${FONT};color:${COLOR.ink3};text-align:center">${esc(b.category)}</p>`
          : "") +
        `<div style="margin:16px 0 0">${pill(href, "Watch the film", "outline")}</div>`;
      return section(poster + words, 6, 28);
    }
    case "button":
      if (!b.href || !b.label) return "";
      return section(pill(b.href, b.label, b.style), 8, 26);
    case "quote":
      if (!b.text) return "";
      return section(
        table(
          `<tr><td style="border-left:2px solid ${COLOR.signal};padding:2px 0 2px 20px">` +
            `<p style="margin:0;font:400 19px/1.5 ${FONT};color:${COLOR.ink};letter-spacing:-0.005em">&ldquo;${inline(
              personalize(b.text, recipient),
            ).replace(/\n/g, "<br>")}&rdquo;</p>` +
            (b.name
              ? `<p class="pg-muted" style="margin:12px 0 0;font:600 13px/1.4 ${FONT};color:${COLOR.ink2}">${esc(b.name)}` +
                (b.role ? `<span style="font-weight:400;color:${COLOR.ink3}">, ${esc(b.role)}</span>` : "") +
                `</p>`
              : "") +
            `</td></tr>`,
        ),
        10,
        26,
      );
    case "divider":
      return section(rule(), 10, 22);
    case "spacer":
      return `<tr><td style="height:${{ s: 12, m: 28, l: 52 }[b.size]}px;line-height:1px;font-size:0">&nbsp;</td></tr>`;
  }
}

function blockText(b: Block, recipient?: Recipient): string[] {
  const p = (s: string) => inlineText(personalize(s, recipient));
  switch (b.kind) {
    case "hero":
      return [p(b.title), p(b.sub)].filter(Boolean);
    case "heading":
      return [p(b.text).toUpperCase()];
    case "text":
      return [p(b.text)];
    case "image":
      return [b.caption ? inlineText(b.caption) : b.alt].filter(Boolean);
    case "feature":
      return [
        p(b.title),
        p(b.text),
        b.href && b.buttonLabel ? `${b.buttonLabel}: ${b.href}` : "",
      ].filter(Boolean);
    case "film":
      return b.vimeoId ? [`${b.title || "Watch the film"}: https://vimeo.com/${b.vimeoId}`] : [];
    case "button":
      return b.href && b.label ? [`${b.label}: ${b.href}`] : [];
    case "quote":
      return b.text
        ? [`"${p(b.text)}"` + (b.name ? `\n${b.name}${b.role ? `, ${b.role}` : ""}` : "")]
        : [];
    case "divider":
    case "spacer":
      return [];
  }
}

/* ── The whole email ────────────────────────────────────────────────── */

function footerHtml(opts: RenderOptions): string {
  const unsubscribe = opts.recipient?.unsubscribeUrl ?? `${SITE_URL}/newsletter/unsubscribe/preview`;
  const phones = Object.values(BUSINESS.phones)
    .map((p) => `${p.label} ${p.number}`)
    .join(" &middot; ");
  const address = opts.postalAddress?.trim() || BUSINESS.locationText;
  const small = `font:400 12px/1.8 ${FONT};color:${COLOR.ink3}`;
  return (
    section(rule(), 40, 0) +
    `<tr><td class="pg-pad" align="center" style="padding:22px ${PAD}px 44px;${small}">` +
    `<a href="${SITE_URL}" style="color:${COLOR.ink};text-decoration:none;font-weight:600;letter-spacing:.02em">PG Creatives</a><br>` +
    `${esc(address)}<br>${phones}<br>` +
    `<span style="color:rgba(255,255,255,.4)">You are getting this because you have worked with PG Creatives or asked to hear from us.</span><br>` +
    `<a href="${esc(unsubscribe)}" style="color:${COLOR.ink2};text-decoration:underline">Unsubscribe</a>` +
    (opts.viewUrl
      ? `&nbsp;&nbsp;&nbsp;&nbsp;<a href="${esc(opts.viewUrl)}" style="color:${COLOR.ink2};text-decoration:underline">View in a browser</a>`
      : "") +
    `</td></tr>`
  );
}

export function renderNewsletterHtml(draft: Draft, opts: RenderOptions = {}): string {
  const { recipient } = opts;
  const subject = personalize(draft.subject, recipient);
  const preheader = personalize(draft.preheader, recipient) || subject;
  const body = draft.blocks.map((b) => blockHtml(b, recipient)).join("");

  return (
    `<!doctype html><html lang="en" dir="ltr" xmlns:o="urn:schemas-microsoft-com:office:office"><head>` +
    `<meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<meta http-equiv="X-UA-Compatible" content="IE=edge">` +
    `<meta name="color-scheme" content="dark">` +
    `<meta name="supported-color-schemes" content="dark">` +
    `<title>${esc(subject)}</title>` +
    /* Outlook on Windows scales for high DPI by its own rules unless told
       to use the widths it is given. */
    `<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->` +
    `<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">` +
    `<style>` +
    `body{margin:0;padding:0;background:${COLOR.ground};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}` +
    `img{border:0;outline:0;line-height:100%;text-decoration:none;-ms-interpolation-mode:bicubic}` +
    `table{border-collapse:separate;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0}` +
    `a{color:${COLOR.signalInk}}` +
    `.nl-col{display:inline-block;width:100%;vertical-align:top}` +
    `@media (max-width:620px){` +
    `.pg-shell{width:100% !important;max-width:100% !important}` +
    `.pg-pad{padding-left:22px !important;padding-right:22px !important}` +
    `.pg-h1{font-size:29px !important}` +
    `.pg-outer{padding:0 !important}` +
    `.nl-col{max-width:100% !important;padding-bottom:16px}` +
    `.nl-col-pad{padding-left:0 !important;padding-right:0 !important}` +
    `}` +
    `</style></head>` +
    `<body class="pg-body" style="margin:0;padding:0;background:${COLOR.ground}">` +
    `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${COLOR.ground};opacity:0">` +
    `${esc(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.ground}" style="background:${COLOR.ground}">` +
    `<tr><td class="pg-outer" align="center" style="padding:0">` +
    `<!--[if mso]><table role="presentation" width="${SHELL}" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->` +
    `<table role="presentation" class="pg-shell" width="${SHELL}" cellpadding="0" cellspacing="0" border="0" style="width:${SHELL}px;max-width:${SHELL}px;table-layout:fixed;background:${COLOR.ground}">` +
    /* Header: the wordmark, alt styled so a client with images off shows the
       name in the right face rather than a blue serif link. */
    `<tr><td align="center" style="background:${COLOR.ground};padding:36px 24px 28px">` +
    `<a href="${SITE_URL}" style="text-decoration:none">` +
    `<img src="${LOGO_URL}" width="176" height="37" alt="PG Creatives" style="display:block;width:176px;height:37px;font:700 21px/37px ${FONT};letter-spacing:-0.01em;color:${COLOR.ink};text-decoration:none">` +
    `</a></td></tr>` +
    body +
    footerHtml(opts) +
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
      .map((p) => `${p.label} ${p.number}`)
      .join(", "),
    SITE_URL,
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
    const where = `Block ${i + 1}`;
    if ((b.kind === "hero" || b.kind === "image" || b.kind === "feature") && b.image && !b.alt) {
      errors.push(`${where}: describe the picture for people who cannot see it.`);
    }
    if (b.kind === "image" && !b.image) errors.push(`${where}: pick a picture or remove the block.`);
    if (b.kind === "hero" && !b.image && !b.title) errors.push(`${where}: the opening needs a picture or a headline.`);
    if (b.kind === "button" && (!b.label || !b.href)) errors.push(`${where}: the button needs a label and a link.`);
    if (b.kind === "film" && !b.vimeoId) errors.push(`${where}: choose a film or remove the block.`);
    if (b.kind === "heading" && !b.text) errors.push(`${where}: the heading is empty.`);
    if (b.kind === "text" && !b.text) errors.push(`${where}: the paragraph block is empty.`);
    if (b.kind === "quote" && !b.text) errors.push(`${where}: the quote is empty.`);
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
    ...draft.blocks.flatMap((b) => Object.values(b).filter((v): v is string => typeof v === "string")),
  ].join("\n");
  if (/[–—]/.test(prose)) warnings.push("There is an en or em dash in the copy. Use a comma, a colon or a full stop.");
  if (draft.subject.length > 60) warnings.push("The subject is over 60 characters and will be cut short on a phone.");
  if (!draft.preheader.trim()) warnings.push("No preview text. Inboxes will show the first words of the email instead.");
  if (!draft.blocks.some((b) => (b.kind === "button" && b.href) || (b.kind === "feature" && b.href) || b.kind === "film")) {
    warnings.push("Nothing in the email asks the reader to do anything. A button usually helps.");
  }
  if (!ctx.postalAddress?.trim()) {
    warnings.push("No postal address is set, so the footer shows the markets served. CAN-SPAM asks for a street address.");
  }
  if (usesPersonalization(draft)) {
    warnings.push('The email uses {{first_name}}. Anyone whose row has no first name will read "there".');
  }

  return { errors, warnings };
}

/* ── Sample content, for the tests and the "start from an example" button */

export const SAMPLE_RECIPIENT: Recipient = {
  email: "heathersellswi@gmail.com",
  firstName: "Heather",
  lastName: "Zeitler",
  company: "Coldwell Banker",
  unsubscribeUrl: `${SITE_URL}/newsletter/unsubscribe/preview`,
};

export const SAMPLE_DRAFT: Draft = {
  subject: "What sold this month, and the shoot that did it",
  preheader: "Three listings, one new reel, and a Milwaukee crew on the ground.",
  blocks: [
    {
      id: "s1",
      kind: "hero",
      image: "/images/marble-kitchen-dining.jpg",
      alt: "A waterfront estate photographed from the air at sunset",
      title: "Hi {{first_name}}, here is September",
      sub: "The month in listings, the work behind them, and one thing we changed for you.",
      href: "",
    },
    {
      id: "s2",
      kind: "heading",
      label: "New this month",
      text: "A crew in Milwaukee, not a drive from Green Bay",
    },
    {
      id: "s3",
      kind: "text",
      text: "We opened a Milwaukee branch. The crew is based in the metro, so a same week shoot in Wauwatosa or Mequon no longer depends on the 43.\n\nSame pricing as Green Bay and Madison, same turnaround: photos the next business day, video within three.",
    },
    {
      id: "s4",
      kind: "feature",
      image: "/images/lakefront-sunset-living.jpg",
      alt: "A coffered ceiling living room at golden hour",
      title: "Twilight sells the room",
      text: "Warm interiors against a blue sky get more saves on Zillow than any daytime frame. Ask for a twilight add on when you book and we schedule around the sun.",
      href: "https://pgcreativeswi.com/services",
      buttonLabel: "See what is included",
      side: "left",
    },
    {
      id: "s5",
      kind: "film",
      vimeoId: "1155091381",
      title: "Waterfront Property Tour",
      category: "Real Estate",
      poster: "https://i.vimeocdn.com/video/2054303212-2c1c1a4c2b1b0b7e1b7f0d1a7f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f-d_640x1138",
      portrait: true,
    },
    {
      id: "s6",
      kind: "quote",
      text: "The listing had 40 showings in the first weekend. The photos did that.",
      name: "Heather Zeitler",
      role: "Coldwell Banker",
    },
    {
      id: "s7",
      kind: "button",
      label: "Book a shoot",
      href: "https://pgcreativeswi.com/contact",
      style: "solid",
    },
  ],
};
