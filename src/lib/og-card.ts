import { createElement as h, type ReactElement } from "react";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The share card every route renders into.
 *
 * What used to ship here was not a design. Four of the five cards were browser
 * screenshots of a dev build: an old nav bar, copy that has not been on the
 * site for months, content sliced off mid-element at the bottom edge, and the
 * Next dev-tools badge reading "1 Issue" burned into the corner of every one.
 * Anyone who shared /services, /portfolio, /contact or /team put that in front
 * of their audience.
 *
 * The replacement follows the page heads rather than inventing a second visual
 * language: one Poppins display line, and under it the small tracked meta line
 * in signal blue that the site sets with slash separators ("15 FILMS / 34
 * STILLS"). The site puts no eyebrow above a heading, so neither does this.
 *
 * There is no description paragraph on the card on purpose. Every platform
 * that renders one of these already prints og:description as selectable text
 * beside the image; setting it INSIDE the image too means a feed shows the
 * same sentence twice, the second time as unreadable 11px pixels. The image
 * carries the photograph, the name and one line of context. The words are the
 * platform's job.
 */

const ROOT = process.cwd();

/* Poppins ships as static weights, so each one is its own file. Only the two
   the card actually sets are loaded — every extra face is ~155KB of font
   parsed on a build that renders nine of these. */
let fontCache: Array<{ name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: "normal" }> | null =
  null;

async function fonts() {
  if (fontCache) return fontCache;
  const read = async (file: string) => {
    const buf = await readFile(join(ROOT, "src/assets/fonts", file));
    return new Uint8Array(buf).buffer as ArrayBuffer;
  };
  fontCache = [
    { name: "Poppins", data: await read("Poppins-Bold.ttf"), weight: 700, style: "normal" },
    { name: "Poppins", data: await read("Poppins-Medium.ttf"), weight: 500, style: "normal" },
  ];
  return fontCache;
}

/* Satori has no network and no filesystem: an <img> has to arrive as bytes it
   already holds. The backgrounds are pre-cropped to exactly 1200x630 by
   scripts/og-backgrounds.mjs, so there is no resizing or object-fit guesswork
   at render time — what is in the file is what lands on the card. */
async function dataUri(path: string, mime: string) {
  const buf = await readFile(join(ROOT, path));
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/jpeg";

const INK = "#ffffff";
const SIGNAL_INK = "#6ab0d4";

export type OgCard = {
  /**
   * The display line, or the lines it breaks into. Sentence case with a full
   * stop, like every page head.
   *
   * Authored breaks rather than wrapping, for the same reason DisplayLines
   * exists on the site: left to itself the renderer broke "The creatives
   * behind the scenes." after "the", stranding one word on line two. The page
   * head writes it as "The creatives / behind the scenes." and so does this.
   */
  headline: string | string[];
  /** Short facts, joined with the site's slash separator. Keep it to three. */
  meta: string[];
  /** Filename in src/assets/og, already cropped to 1200x630. */
  background: string;
};

type Scrim = { top: number; bottom: number; foot: number };
let scrimCache: Record<string, Scrim> | null = null;

async function scrimFor(background: string): Promise<Scrim> {
  if (!scrimCache) {
    scrimCache = JSON.parse(await readFile(join(ROOT, "src/assets/og/scrim.json"), "utf8"));
  }
  const s = scrimCache![background];
  if (!s) {
    throw new Error(
      `No measured scrim for "${background}". Run \`node scripts/og-backgrounds.mjs\` ` +
        `after adding or changing a card background.`,
    );
  }
  return s;
}

/**
 * `hideType` renders the card with the photograph and both scrims but no
 * wordmark, headline or meta line. It exists for scripts/og-verify.mjs, which
 * needs the ground the type sits on in order to measure the contrast of the
 * type against it — measuring the finished card would average the letters in
 * with their own background and report nothing useful.
 */
export async function ogElement(
  { headline, meta, background }: OgCard,
  { hideType = false, scrim }: { hideType?: boolean; scrim?: Scrim } = {},
): Promise<ReactElement> {
  const lines = Array.isArray(headline) ? headline : [headline];
  const [photo, wordmark, measured] = await Promise.all([
    dataUri(join("src/assets/og", background), "image/jpeg"),
    dataUri("public/wordmark.png", "image/png"),
    scrim ? Promise.resolve(scrim) : scrimFor(background),
  ]);
  const { top, bottom, foot } = measured;

  return h(
    "div",
    {
      style: {
        display: "flex",
        position: "relative",
        width: "1200px",
        height: "630px",
        backgroundColor: "#07090c",
        fontFamily: "Poppins",
      },
    },
    /* The photograph, full bleed. It is the product. */
    h("img", {
      src: photo,
      width: 1200,
      height: 630,
      style: { position: "absolute", top: 0, left: 0, width: "1200px", height: "630px" },
    }),

    /* Two scrims, not one. A single full-frame wash would flatten the photo to
       mud; these are a graduated ND filter, the tool a real estate
       photographer already reaches for. The bottom one carries the type and
       stops before the middle of the frame. The top one is lighter and exists
       only so the wordmark holds on a bright sky.

       Neither strength is authored. scrim.json is measured from the cropped
       photograph by scripts/og-backgrounds.mjs, so a white kitchen and a
       twilight aerial get the darkening each one actually needs and both land
       on the same contrast. The first pass used one fixed pair tuned on the
       aerial, and it crushed every bright interior into a black bar.

       Satori does not honour `inset: 0` — the box collapses and the gradient
       never paints. Every edge is named. */
    h("div", {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "1200px",
        height: "630px",
        display: "flex",
        backgroundImage:
          `linear-gradient(180deg, rgba(7,9,12,${top}) 0%, rgba(7,9,12,${(top * 0.42).toFixed(3)}) 15%, rgba(7,9,12,0) 27%)`,
      },
    }),
    h("div", {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "1200px",
        height: "630px",
        display: "flex",
        /* The toe under the meta line is deeper than the headline band above
           it, because 19px signal blue needs a darker ground than 68px white
           does. Holding the whole lower third at the meta line's strength is
           what turned the bright kitchens into a black bar. */
        backgroundImage:
          `linear-gradient(0deg, rgba(7,9,12,${foot}) 0%, rgba(7,9,12,${foot}) 13%, ` +
          `rgba(7,9,12,${bottom}) 26%, rgba(7,9,12,${(bottom * 0.72).toFixed(3)}) 38%, ` +
          `rgba(7,9,12,${(bottom * 0.28).toFixed(3)}) 52%, rgba(7,9,12,0) 66%)`,
      },
    }),

    /* The type column. Space-between pins the wordmark to the top and the
       display line to the bottom, which leaves the middle of the frame — the
       part with the house in it — completely clear. */
    h(
      "div",
      {
        style: {
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1200px",
          height: "630px",
          padding: "56px 64px",
        },
      },
      hideType
        ? h("div", { style: { display: "flex", width: "190px", height: "40px" } })
        : h("img", {
            src: wordmark,
            width: 190,
            height: 40,
            style: { width: "190px", height: "40px" },
          }),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column" } },
        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              maxWidth: "1072px",
              fontSize: lines.length > 1 ? "62px" : "68px",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.022em",
              color: INK,
              /* Belt and braces over the scrim: a photo with a bright sill or
                 a snowy drive under the type still has to clear 4.5:1. */
              textShadow: "0 2px 24px rgba(0,0,0,0.55)",
            },
          },
          ...lines.map((line, i) =>
            h("div", { key: i, style: { display: "flex" } }, hideType ? "" : line),
          ),
        ),
        h(
          "div",
          {
            style: {
              display: "flex",
              marginTop: "22px",
              fontSize: "19px",
              fontWeight: 500,
              letterSpacing: "0.15em",
              color: SIGNAL_INK,
              textTransform: "uppercase",
              textShadow: "0 1px 12px rgba(0,0,0,0.7)",
            },
          },
          hideType ? "" : meta.join("   /   "),
        ),
      ),
    ),
  );
}

/** Font list for the ImageResponse options object. */
export async function ogFonts() {
  return fonts();
}

