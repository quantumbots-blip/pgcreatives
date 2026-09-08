import { BUSINESS } from "@/lib/data";

/**
 * One layout, rendered once per email.
 *
 * Email is not the web. There is no flexbox, no grid, no external stylesheet,
 * no web font worth relying on, and Outlook renders through Word. So this is
 * nested tables with inline styles, which looks like 2004 and is the only
 * thing that survives Gmail, Apple Mail, Outlook and everything else at once.
 *
 * On the light card. The site is dark and these carry its palette, but the
 * band at the top and bottom is where the dark lives, and the part holding the
 * words is white with near black text. A fully dark email is a gamble: Gmail's
 * mobile apps apply their own dark mode transform, and an email already dark
 * can come out as light text on a light background. Dark on white survives
 * every transform any client applies. The brand reads in the bands, the
 * buttons and the rules.
 *
 * Every row is a [label, html, text] triple so the plain text twin falls out
 * of the same data rather than being written twice and drifting.
 */

export const SITE_URL = BUSINESS.url;
/* Opaque, with the brand ground baked in, rather than the site's white on
   transparent wordmark. An inbox is not a page: a client that inverts the
   header cell or drops its background would render white on white and the
   logo would simply not be there. Rendered at 2x for retina. */
export const LOGO_URL = `${SITE_URL}/email-logo.png`;
export const DASHBOARD_URL = `${SITE_URL}/admin`;

/* Taken from globals.css. `signal` is the fill and carries white labels;
   as text on white it measures about 5.4:1, which is why it may be used for
   words here even though it fails against the site's dark ground. */
export const COLOR = {
  ground: "#07090c",
  page: "#0b0e13",
  card: "#ffffff",
  ink: "#12171f",
  ink2: "#454f5e",
  ink3: "#6b7686",
  hairline: "#e4e8ee",
  wash: "#f4f6f9",
  signal: "#2b6fb8",
  signalDeep: "#1d5a99",
  signalWash: "#eef4fb",
  good: "#1f7a4d",
  goodWash: "#eaf6ef",
  warn: "#8a5a00",
  warnWash: "#fdf4e3",
} as const;

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export function esc(value: unknown): string {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

export function nl2br(value: unknown): string {
  return esc(value).replace(/\n/g, "<br>");
}

/**
 * A subject line can never carry a newline. A name typed into the contact
 * form reaches this, and "Bcc:" on a second line is how header injection is
 * attempted.
 */
export function headerSafe(value: unknown): string {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

export function when(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return (
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Chicago",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso)) + " CT"
    );
  } catch {
    return String(iso);
  }
}

export type Row = [label: string, html: string, text: string];
export type Button = { href: string; label: string; style?: "solid" | "outline" };
/* Buttons that belong together horizontally when there is room. Three
   contact actions stacked full width is right on a phone and reads as a
   form on a desktop client, where 600px is plenty for a row. */
export type ButtonRow = { row: Button[] };
export type Tone = "signal" | "good" | "warn";

/** A labelled value. Returns null when there is nothing to show. */
export function row(label: string, text: string | null | undefined, html?: string): Row | null {
  const value = (text ?? "").trim();
  if (!value) return null;
  return [label, html ?? esc(value), value];
}

export type LayoutInput = {
  badge: string;
  badgeTone?: Tone;
  title: string;
  sub?: string;
  body?: string;
  rows?: (Row | null)[];
  buttons?: (Button | ButtonRow)[];
  note?: string;
  preheader?: string;
  footerNote?: string;
};

const TONE = {
  signal: { fg: COLOR.signalDeep, bg: COLOR.signalWash },
  good: { fg: COLOR.good, bg: COLOR.goodWash },
  warn: { fg: COLOR.warn, bg: COLOR.warnWash },
} as const;

function buttonCell({ href, label, style = "solid" }: Button): string {
  const solid = style === "solid";
  const bg = solid ? COLOR.signal : COLOR.card;
  const fg = solid ? "#ffffff" : COLOR.ink;
  const border = solid ? COLOR.signal : COLOR.hairline;
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed">` +
    `<tr><td align="center" bgcolor="${bg}" class="${solid ? "pg-btn" : "pg-btn-out"}" style="background:${bg};border:1px solid ${border};border-radius:10px">` +
    `<a href="${esc(href)}" class="pg-btn-a" style="display:block;padding:15px 14px;font:700 15px/1.2 ${FONT};color:${fg};text-decoration:none">${esc(
      label,
    )}</a>` +
    `</td></tr></table>`
  );
}

function buttonHtml(b: Button): string {
  return `<div style="margin:0 0 10px">${buttonCell(b)}</div>`;
}

/**
 * A row of buttons that stacks.
 *
 * Stacked is the DEFAULT and the row appears from 400px up. A client that
 * strips media queries, which several Android mail apps do, therefore falls
 * back to full width buttons rather than to a pair squeezed into a phone.
 * Degrading toward the safe layout is the whole point of building it this way
 * round.
 */
function buttonRowHtml(buttons: Button[]): string {
  const gap = 8;
  const cells = buttons
    .map(
      (b, i) =>
        `<td class="pg-col" style="display:block;width:100%;padding:0 0 10px" valign="top">` +
        `<!--[if mso]><table role="presentation" width="100%"><tr><td style="padding:0 ${
          i === buttons.length - 1 ? 0 : gap
        }px 0 0"><![endif]-->` +
        buttonCell(b) +
        `<!--[if mso]></td></tr></table><![endif]-->` +
        `</td>`,
    )
    .join("");
  return (
    `<div style="margin:0 0 10px">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>` +
    `</div>`
  );
}

function rowHtml([label, html]: Row): string {
  return (
    `<tr><td class="pg-rule" style="padding:14px 0;border-top:1px solid ${COLOR.hairline}">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
    `<tr><td class="pg-muted" style="font:700 11px/1.4 ${FONT};letter-spacing:.09em;text-transform:uppercase;color:${COLOR.ink3};padding-bottom:5px">${esc(
      label,
    )}</td></tr>` +
    `<tr><td class="pg-text" style="font:400 16px/1.55 ${FONT};color:${COLOR.ink};word-break:break-word">${html}</td></tr>` +
    `</table></td></tr>`
  );
}

export function renderHtml(input: LayoutInput): string {
  const {
    badge,
    badgeTone = "signal",
    title,
    sub,
    body,
    rows = [],
    buttons = [],
    note,
    preheader,
    footerNote,
  } = input;

  const tone = TONE[badgeTone];
  const visibleRows = rows.filter((r): r is Row => r !== null);
  const phones = Object.values(BUSINESS.phones)
    .map((p) => `${p.label} ${p.number}`)
    .join(" &middot; ");

  return (
    `<!doctype html><html lang="en" dir="ltr"><head>` +
    `<meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    /* Says the design is light so clients that respect it leave the card
       alone instead of inventing a dark version of it. */
    /* Both, now that there is a designed dark rendering rather than only a
       light one a client might invert on its own. */
    `<meta name="color-scheme" content="light dark">` +
    `<meta name="supported-color-schemes" content="light dark">` +
    `<title>${esc(title)}</title>` +
    `<style>` +
    `body{margin:0;padding:0;background:${COLOR.page};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}` +
    `img{border:0;outline:0;line-height:100%;text-decoration:none;-ms-interpolation-mode:bicubic}` +
    `table{border-collapse:collapse}` +
    `a{color:${COLOR.signalDeep}}` +
    /* The only breakpoint. Below 600 the card goes full width and the
       generous side padding comes in, otherwise a 320px phone loses a third
       of every line to margin. */
    `@media (max-width:620px){` +
    `.pg-card{width:100% !important;max-width:100% !important}` +
    `.pg-pad{padding-left:22px !important;padding-right:22px !important}` +
    `.pg-h1{font-size:22px !important}` +
    `.pg-outer{padding:16px 10px !important}` +
    `}` +
    /* A pair sits side by side from 400 up, which covers every phone held
       upright as well as every reading pane. Written as min-width so the
       stacked layout is what a client gets when it ignores this entirely. */
    `@media (min-width:400px){` +
    `.pg-col{display:table-cell !important;width:50% !important;padding:0 5px !important}` +
    `.pg-col:first-child{padding-left:0 !important}` +
    `.pg-col:last-child{padding-right:0 !important}` +
    `}` +
    /* A deliberate dark rendering. Clients that honour this get a designed
       dark email; clients that invert on their own get their own version
       either way, and this at least means Apple Mail and the rest are not
       guessing at it. */
    `@media (prefers-color-scheme:dark){` +
    `.pg-body{background:#05070a !important}` +
    `.pg-card{background:#12171f !important}` +
    `.pg-h1,.pg-strong{color:#ffffff !important}` +
    `.pg-text{color:rgba(255,255,255,.76) !important}` +
    `.pg-muted{color:rgba(255,255,255,.56) !important}` +
    `.pg-rule{border-top-color:rgba(255,255,255,.12) !important}` +
    `.pg-wash{background:#1b212b !important}` +
    `.pg-btn-out{background:#12171f !important;border-color:rgba(255,255,255,.22) !important}` +
    `.pg-btn-out a{color:#ffffff !important}` +
    `.pg-link{color:#6ab0d4 !important}` +
    `}` +
    `</style></head>` +
    `<body class="pg-body" style="margin:0;padding:0;background:${COLOR.page}">` +
    /* Preheader: the grey line a client shows next to the subject. Left
       empty it shows whatever text comes first, which would be the logo alt
       text. The zero width joiners stop the rest of the email leaking in. */
    `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${COLOR.page};opacity:0">` +
    `${esc(preheader || sub || title)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR.page}">` +
    `<tr><td class="pg-outer" align="center" style="padding:34px 16px">` +
    `<table role="presentation" class="pg-card" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;table-layout:fixed;background:${COLOR.card};border-radius:16px;overflow:hidden">` +
    /* Header band */
    `<tr><td align="center" bgcolor="${COLOR.ground}" style="background:${COLOR.ground};padding:30px 24px 26px">` +
    `<a href="${SITE_URL}" style="text-decoration:none">` +
    `<img src="${LOGO_URL}" width="176" height="37" alt="PG Creatives" style="display:block;width:176px;height:37px">` +
    `</a></td></tr>` +
    /* A thin accent rule under the band, the one flourish that costs nothing */
    `<tr><td bgcolor="${COLOR.signal}" style="background:${COLOR.signal};height:3px;line-height:3px;font-size:0">&nbsp;</td></tr>` +
    /* Headline block */
    `<tr><td class="pg-pad" style="padding:30px 34px 4px">` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td bgcolor="${tone.bg}" style="background:${tone.bg};border-radius:5px;padding:5px 11px">` +
    `<span style="font:700 11px/1.4 ${FONT};letter-spacing:.09em;text-transform:uppercase;color:${tone.fg}">${esc(
      badge,
    )}</span></td>` +
    `</tr></table>` +
    `<h1 class="pg-h1" style="margin:15px 0 0;font:700 25px/1.28 ${FONT};color:${COLOR.ink};word-break:break-word">${esc(
      title,
    )}</h1>` +
    (sub
      ? `<p class="pg-muted" style="margin:8px 0 0;font:400 15px/1.55 ${FONT};color:${COLOR.ink2}">${esc(sub)}</p>`
      : "") +
    (body
      ? `<p class="pg-text" style="margin:18px 0 0;font:400 16px/1.62 ${FONT};color:${COLOR.ink}">${nl2br(body)}</p>`
      : "") +
    `</td></tr>` +
    (buttons.length
      ? `<tr><td class="pg-pad" style="padding:22px 34px 4px">${buttons
          .map((b) => ("row" in b ? buttonRowHtml(b.row) : buttonHtml(b)))
          .join("")}</td></tr>`
      : "") +
    (visibleRows.length
      ? `<tr><td class="pg-pad" style="padding:14px 34px 4px">` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${visibleRows
          .map(rowHtml)
          .join("")}</table></td></tr>`
      : "") +
    (note
      ? `<tr><td class="pg-pad" style="padding:22px 34px 32px">` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed">` +
        `<tr><td bgcolor="${COLOR.wash}" class="pg-wash pg-muted" style="background:${COLOR.wash};border-radius:12px;padding:15px 17px;font:400 13px/1.55 ${FONT};color:${COLOR.ink2};word-break:break-word">${nl2br(
          note,
        )}</td></tr></table></td></tr>`
      : `<tr><td style="padding:0 0 30px">&nbsp;</td></tr>`) +
    /* Footer band */
    `<tr><td align="center" bgcolor="${COLOR.ground}" style="background:${COLOR.ground};padding:22px 24px;font:400 12px/1.7 ${FONT};color:rgba(255,255,255,.62)">` +
    `<a href="${SITE_URL}" style="color:#ffffff;text-decoration:none;font-weight:700">PG Creatives</a> &middot; ${esc(
      BUSINESS.locationText,
    )}<br>${phones}<br>` +
    `<span style="color:rgba(255,255,255,.45)">${esc(footerNote || "Sent by your PG Creatives dashboard.")}</span>` +
    `</td></tr>` +
    `</table></td></tr></table></body></html>`
  );
}

/** The plain text twin, from the same input. Never written by hand. */
export function renderText(input: LayoutInput): string {
  const { title, sub, body, rows = [], buttons = [], note } = input;
  const lines: string[] = [title];
  if (sub) lines.push(sub);
  if (body) lines.push("", body);

  const visibleRows = rows.filter((r): r is Row => r !== null);
  if (visibleRows.length) {
    lines.push("");
    for (const [label, , text] of visibleRows) lines.push(`${label}: ${text}`);
  }
  if (buttons.length) {
    lines.push("");
    // Rows are a visual grouping only. In plain text every action is a line.
    for (const b of buttons) {
      for (const one of "row" in b ? b.row : [b]) lines.push(`${one.label}: ${one.href}`);
    }
  }
  if (note) lines.push("", note);

  lines.push(
    "",
    `PG Creatives, ${BUSINESS.locationText}`,
    Object.values(BUSINESS.phones)
      .map((p) => `${p.label} ${p.number}`)
      .join(", "),
    SITE_URL,
  );
  return lines.join("\n");
}

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export function render(input: LayoutInput & { subject: string; replyTo?: string }): RenderedEmail {
  return {
    subject: headerSafe(input.subject),
    html: renderHtml(input),
    text: renderText(input),
    ...(input.replyTo ? { replyTo: headerSafe(input.replyTo) } : {}),
  };
}
