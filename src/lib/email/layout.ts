import { BUSINESS } from "@/lib/data";

/**
 * One layout, rendered once per email.
 *
 * Email is not the web. There is no flexbox, no grid, no external stylesheet,
 * no web font worth relying on, and Outlook renders through Word. So this is
 * nested tables with inline styles, which looks like 2004 and is the only
 * thing that survives Gmail, Apple Mail, Outlook and everything else at once.
 *
 * Dark, because the site is dark. An earlier version put a white card inside
 * dark bands, which was the safe choice and the wrong one: it looked like a
 * generic transactional email wearing a logo, and it broke the site's own
 * first rule, which is one ground with no per section backgrounds and no
 * seams. It also produced exactly the artefacts you get from stacking
 * differently coloured rounded boxes: a white edge at the card's corners and
 * a dark square behind the rounded button, because a `bgcolor` attribute
 * paints a square that `border-radius` never clips.
 *
 * So: one ground edge to edge, hairline rules instead of boxes, pill buttons
 * the same shape as the site's, and no `bgcolor` attribute anywhere that also
 * carries a radius. A client that cannot round a corner now draws a square in
 * the same colour as everything around it, which nobody can see.
 *
 * The trade is Gmail's dark mode transform, which sometimes lightens an
 * already dark email. Every colour here is stated explicitly on every element
 * so there is no inherited value for it to get wrong, and the scheme is
 * declared dark so clients that honour it leave the design alone.
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
/* globals.css, verbatim. --signal is the fill and carries white labels; as
   text on this ground it measures 3.86:1 and fails, which is why every accent
   word uses --signal-ink instead. */
export const COLOR = {
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
  signalDim: "rgba(43,111,184,0.16)",
  good: "#6ee7b7",
  goodDim: "rgba(110,231,183,0.14)",
  warn: "#fcd34d",
  warnDim: "rgba(252,211,77,0.14)",
} as const;

/* Poppins is the site's face. Apple Mail and iOS Mail load a linked web font,
   which is most of where this gets read; everything else falls back to the
   stack and still looks deliberate. */
const FONT = "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif";

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
  signal: { fg: COLOR.signalInk, bg: COLOR.signalDim },
  good: { fg: COLOR.good, bg: COLOR.goodDim },
  warn: { fg: COLOR.warn, bg: COLOR.warnDim },
} as const;

function buttonCell({ href, label, style = "solid" }: Button): string {
  const solid = style === "solid";
  /* The site's .btn-primary and .btn-ghost. Ghost is transparent over the one
     ground rather than a filled box, which is what stops these reading as a
     stack of cards. */
  const bg = solid ? COLOR.signal : COLOR.ground;
  const fg = "#ffffff";
  const border = solid ? COLOR.signal : COLOR.lineStrong;
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed">` +
    /* No bgcolor attribute. It paints a square the radius never clips, which
       is what put a hard cornered box around the rounded button. */
    `<tr><td align="center" class="${solid ? "pg-btn" : "pg-btn-out"}" style="background:${bg};border:1px solid ${border};border-radius:999px">` +
    `<a href="${esc(href)}" class="pg-btn-a" style="display:block;padding:14px 20px;font:600 15px/1.25 ${FONT};letter-spacing:-0.01em;color:${fg};text-decoration:none">${esc(
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
    `<tr><td class="pg-rule" style="padding:15px 0;border-top:1px solid ${COLOR.line}">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
    `<tr><td class="pg-muted" style="font:600 11px/1.2 ${FONT};letter-spacing:.15em;text-transform:uppercase;color:${COLOR.ink3};padding-bottom:7px">${esc(
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
    /* Dark by design, and said so, which is what stops a client deciding to
       invert it into something nobody drew. */
    `<meta name="color-scheme" content="dark">` +
    `<meta name="supported-color-schemes" content="dark">` +
    `<title>${esc(title)}</title>` +
    /* The site's face. Apple Mail and iOS Mail load this, which is most of
       where the owner reads his mail; everything else takes the stack. */
    `<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">` +
    `<style>` +
    `body{margin:0;padding:0;background:${COLOR.ground};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}` +
    `img{border:0;outline:0;line-height:100%;text-decoration:none;-ms-interpolation-mode:bicubic}` +
    /* separate, not collapse. Collapsed borders make border-radius on a cell
       undefined, so every bordered pill here drew a square outline around a
       rounded fill: the hard cornered box the owner photographed around the
       Call button, and the ghost buttons rendering as rectangles. Spacing is
       zeroed, so the layout is identical to what collapse gave. */
    `table{border-collapse:separate;border-spacing:0}` +
    `a{color:${COLOR.signalInk}}` +
    `@media (max-width:620px){` +
    `.pg-shell{width:100% !important;max-width:100% !important}` +
    `.pg-pad{padding-left:22px !important;padding-right:22px !important}` +
    `.pg-h1{font-size:26px !important}` +
    `.pg-outer{padding:0 !important}` +
    `}` +
    /* A pair sits side by side from 400 up. min-width, so a client that
       strips media queries falls back to full width rather than to two
       squeezed into a phone. */
    `@media (min-width:400px){` +
    `.pg-col{display:table-cell !important;width:50% !important;padding:0 5px !important}` +
    `.pg-col:first-child{padding-left:0 !important}` +
    `.pg-col:last-child{padding-right:0 !important}` +
    `}` +
    `</style></head>` +
    `<body class="pg-body" style="margin:0;padding:0;background:${COLOR.ground}">` +
    `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${COLOR.ground};opacity:0">` +
    `${esc(preheader || sub || title)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.ground}" style="background:${COLOR.ground}">` +
    `<tr><td class="pg-outer" align="center" style="padding:0">` +
    /* One ground, edge to edge, exactly as the site does it. No card, so no
       rounded container whose corners can disagree with what is behind them,
       which is where the white edge came from. */
    `<table role="presentation" class="pg-shell" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;table-layout:fixed;background:${COLOR.ground}">` +
    /* Header */
    `<tr><td align="center" style="background:${COLOR.ground};padding:38px 24px 30px">` +
    `<a href="${SITE_URL}" style="text-decoration:none">` +
    `<img src="${LOGO_URL}" width="176" height="37" alt="PG Creatives" style="display:block;width:176px;height:37px">` +
    `</a></td></tr>` +
    `<tr><td class="pg-pad" style="padding:0 34px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td style="height:1px;line-height:1px;font-size:0;background:${COLOR.line}">&nbsp;</td></tr></table></td></tr>` +
    /* Headline */
    `<tr><td class="pg-pad" style="padding:34px 34px 0">` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td style="background:${tone.bg};border-radius:999px;padding:6px 13px">` +
    `<span style="font:600 11px/1.2 ${FONT};letter-spacing:.15em;text-transform:uppercase;color:${tone.fg}">${esc(
      badge,
    )}</span></td>` +
    `</tr></table>` +
    `<h1 class="pg-h1" style="margin:18px 0 0;font:700 31px/1.12 ${FONT};letter-spacing:-0.018em;color:${COLOR.ink};word-break:break-word">${esc(
      title,
    )}</h1>` +
    (sub
      ? `<p class="pg-muted" style="margin:12px 0 0;font:400 16px/1.6 ${FONT};color:${COLOR.ink2}">${esc(sub)}</p>`
      : "") +
    (body
      ? `<p class="pg-text" style="margin:18px 0 0;font:400 16px/1.65 ${FONT};color:${COLOR.ink2}">${nl2br(body)}</p>`
      : "") +
    `</td></tr>` +
    (buttons.length
      ? `<tr><td class="pg-pad" style="padding:26px 34px 0">${buttons
          .map((b) => ("row" in b ? buttonRowHtml(b.row) : buttonHtml(b)))
          .join("")}</td></tr>`
      : "") +
    (visibleRows.length
      ? `<tr><td class="pg-pad" style="padding:20px 34px 0">` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${visibleRows
          .map(rowHtml)
          .join("")}</table></td></tr>`
      : "") +
    (note
      ? `<tr><td class="pg-pad" style="padding:26px 34px 0">` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed">` +
        `<tr><td class="pg-wash" style="background:${COLOR.surface};border:1px solid ${COLOR.line};border-radius:14px;padding:16px 18px;font:400 13px/1.6 ${FONT};color:${COLOR.ink3};word-break:break-word">${nl2br(
          note,
        )}</td></tr></table></td></tr>`
      : "") +
    /* Footer, on the same ground, separated by a hairline rather than by a
       change of colour. */
    `<tr><td class="pg-pad" style="padding:38px 34px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td style="height:1px;line-height:1px;font-size:0;background:${COLOR.line}">&nbsp;</td></tr></table></td></tr>` +
    `<tr><td class="pg-pad" align="center" style="padding:22px 34px 44px;font:400 12px/1.8 ${FONT};color:${COLOR.ink3}">` +
    `<a href="${SITE_URL}" style="color:${COLOR.ink};text-decoration:none;font-weight:600;letter-spacing:.02em">PG Creatives</a><br>` +
    `${esc(BUSINESS.locationText)}<br>${phones}<br>` +
    `<span style="color:rgba(255,255,255,.36)">${esc(footerNote || "Sent by your PG Creatives dashboard.")}</span>` +
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
