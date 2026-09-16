/**
 * Renders every share card and measures it, rather than trusting that it looks
 * right because the numbers that fed it looked right.
 *
 * Two things are checked, and both are measured off the rendered pixels:
 *
 *   contrast  Each card is rendered a second time with the type removed, which
 *             gives the scrimmed photograph on its own. The luminance under
 *             each piece of type is read from THAT, so the reading is of the
 *             ground the text sits on and not an average of the text and its
 *             ground together. The ratios are then the real WCAG ones.
 *
 *   ink box   The topmost and rightmost white pixels in the headline zone. A
 *             headline that wrapped to a line more than it was written for
 *             pushes the top edge up; one that ran past the column pushes the
 *             right edge out. Character counts cannot catch either, because
 *             68px Poppins Bold sets anywhere between 28.7 and 35.0 pixels per
 *             character depending on which letters are in the line.
 *
 * Run: node scripts/og-verify.mjs             check only, non-zero on failure
 *      node scripts/og-verify.mjs --tune      solve for the scrims and save
 *      node scripts/og-verify.mjs --write DIR keep the rendered PNGs
 *
 * --tune is how src/assets/og/scrim.json gets its numbers. The crop script's
 * estimate is a starting point computed from the MEAN luminance of each band,
 * and the mean is optimistic: glyphs land on particular pixels, and the few
 * that land on a lit window decide whether the line is readable. So the tuner
 * renders, measures the ground under the actual glyphs, darkens whichever
 * scrim fell short, and renders again until every card on that photograph
 * clears its floor. Where a photograph is shared, it is tuned against the
 * worst card using it.
 */
import { ImageResponse } from "next/dist/server/og/image-response.js";
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { ogElement, ogFonts, OG_SIZE } from "../src/lib/og-card.ts";
import { CARDS, MARKET_CARDS, MARKET_BACKGROUND } from "../src/lib/og-cards.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(ROOT); // og-card.ts resolves its assets from cwd.

const PAD = 64;
const COLUMN_RIGHT = 1200 - PAD;

const HEAD_BAND = { left: PAD, top: 420, width: 1060, height: 115 };
const META_BAND = { left: PAD, top: 530, width: 1000, height: 76 };
const MARK_BAND = { left: PAD, top: 52, width: 200, height: 48 };

/* The two ink colours, as WCAG relative luminance. */
const WHITE_Y = 1.0;
const SIGNAL_Y = 0.389; // #6ab0d4

/* Floors. Large white display type only needs 3:1 to pass WCAG, but a share
   card is read at about a third of its rendered size in a feed, so the
   headline is held to the small-text bar instead. The wordmark is artwork. */
const MIN_HEAD = 4.5;
const MIN_META = 4.5;
const MIN_MARK = 3.0;

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/* Rendered AND re-encoded exactly as ogResponse() does it, because that is
   what crawlers fetch. Measuring the intermediate PNG would report a contrast
   the shipped file does not have — a margin of 0.05 over the floor is well
   inside what a JPEG quantiser can move. */
async function render(card, opts) {
  const res = new ImageResponse(await ogElement(card, opts), {
    ...OG_SIZE,
    fonts: await ogFonts(),
  });
  const png = Buffer.from(await res.arrayBuffer());
  return sharp(png).jpeg({ quality: 86, chromaSubsampling: "4:4:4", mozjpeg: true }).toBuffer();
}

const rgbToY = (r, g, b) =>
  0.2126 * srgbToLinear(r / 255) + 0.7152 * srgbToLinear(g / 255) + 0.0722 * srgbToLinear(b / 255);

/**
 * The luminance of the ground UNDER the type, read only at the pixels the type
 * actually covers.
 *
 * Averaging a whole band is useless — it averages the letters in with their own
 * background. Taking the band's brightest pixel is worse: it fails a card for a
 * blown window sitting in a corner no letter ever touches. So the glyph cores
 * are found by diffing the rendered card against the same card with the type
 * removed, and the ground is then read from the type-free render at exactly
 * those pixels.
 *
 * The number returned is the 98th percentile rather than the mean, because
 * legibility is decided by the worst few letters, not the average letter.
 */
async function groundUnderType(withType, bare, region) {
  /* removeAlpha() is not decoration. When these were measured straight off
     ImageResponse's PNG, which carries an alpha channel even on an opaque
     card, raw() returned four bytes per pixel while the loop read three, so
     every pixel walked one channel further out of step and the measurement was
     of noise. It reported a flat contrast of about 1.3 for all eleven cards. */
  const a = await sharp(withType).extract(region).removeAlpha().raw().toBuffer();
  const b = await sharp(bare).extract(region).removeAlpha().raw().toBuffer();

  const grounds = [];
  for (let i = 0; i < a.length; i += 3) {
    // A glyph core, not its antialiased edge or the soft shadow around it.
    const diff =
      Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
    if (diff < 150) continue;
    grounds.push(rgbToY(b[i], b[i + 1], b[i + 2]));
  }
  if (!grounds.length) return null;
  grounds.sort((x, y) => x - y);
  return {
    p98: grounds[Math.min(grounds.length - 1, Math.floor(grounds.length * 0.98))],
    mean: grounds.reduce((s, v) => s + v, 0) / grounds.length,
    pixels: grounds.length,
  };
}

const ratio = (inkY, bgY) => (Math.max(inkY, bgY) + 0.05) / (Math.min(inkY, bgY) + 0.05);

/** Bounding box of the white type in the headline zone. */
async function inkBox(png) {
  const { data, info } = await sharp(png)
    .removeAlpha()
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const stride = info.channels;
  let top = Infinity;
  let right = 0;
  for (let y = 360; y < 600; y++) {
    for (let x = PAD; x < 1200 - 8; x++) {
      if (data[(y * info.width + x) * stride] > 248) {
        if (y < top) top = y;
        if (x > right) right = x;
      }
    }
  }
  return { top, right };
}

const cards = [
  ...CARDS.map((c) => ({ name: c.route, card: { ...c, background: c.crop.out } })),
  ...Object.entries(MARKET_CARDS).map(([slug, c]) => ({
    name: `areas/${slug}`,
    card: { ...c, background: MARKET_BACKGROUND },
  })),
];

const args = process.argv.slice(2);
const tune = args.includes("--tune");
const writeDir = args.includes("--write") ? args[args.indexOf("--write") + 1] : null;
if (writeDir) await mkdir(writeDir, { recursive: true });

const SCRIM_PATH = join(ROOT, "src/assets/og/scrim.json");
const scrims = JSON.parse(await readFile(SCRIM_PATH, "utf8"));

const untuned = Object.entries(scrims).filter(([, v]) => !v.tuned).map(([k]) => k);
if (untuned.length && !process.argv.includes("--tune")) {
  console.log(`note: ${untuned.join(", ")} carry an untuned estimate. Run with --tune.\n`);
}

/** Measure one card against one candidate scrim. */
async function measure(card, scrim) {
  const png = await render(card, { scrim });
  const bare = await render(card, { scrim, hideType: true });
  const head = await groundUnderType(png, bare, HEAD_BAND);
  const meta = await groundUnderType(png, bare, META_BAND);
  const mark = await groundUnderType(png, bare, MARK_BAND);
  const box = await inkBox(png);
  const { width, height } = await sharp(png).metadata();
  return {
    png,
    box,
    width,
    height,
    head: head ? ratio(WHITE_Y, head.p98) : 0,
    meta: meta ? ratio(SIGNAL_Y, meta.p98) : 0,
    mark: mark ? ratio(WHITE_Y, mark.p98) : 0,
  };
}

/* Tuning aims above the floor rather than at it. A card that lands exactly on
   4.50 has no room for a re-crop, a copy change that moves a letter onto a
   window, or a future encoder tweak. */
const TUNE_MARGIN = 0.35;

/* A scrim any darker than this stops reading as light on a photograph and
   starts reading as a black bar with a picture behind it. If a photograph
   cannot be made legible below it, the photograph is the wrong photograph. */
const MAX_ALPHA = 0.82;
const STEP = 0.025;

if (tune) {
  const byBackground = new Map();
  for (const entry of cards) {
    const list = byBackground.get(entry.card.background) ?? [];
    list.push(entry);
    byBackground.set(entry.card.background, list);
  }

  for (const [background, group] of byBackground) {
    const scrim = { ...scrims[background] };
    for (let pass = 0; pass < 24; pass++) {
      let worst = { head: Infinity, meta: Infinity, mark: Infinity };
      for (const { card } of group) {
        const m = await measure(card, scrim);
        worst = {
          head: Math.min(worst.head, m.head),
          meta: Math.min(worst.meta, m.meta),
          mark: Math.min(worst.mark, m.mark),
        };
      }
      let moved = false;
      if (worst.head < MIN_HEAD + TUNE_MARGIN && scrim.bottom < MAX_ALPHA) {
        scrim.bottom = Math.min(MAX_ALPHA, Number((scrim.bottom + STEP).toFixed(3)));
        moved = true;
      }
      if (worst.meta < MIN_META + TUNE_MARGIN && scrim.foot < MAX_ALPHA) {
        scrim.foot = Math.min(MAX_ALPHA, Number((scrim.foot + STEP).toFixed(3)));
        moved = true;
      }
      if (worst.mark < MIN_MARK + TUNE_MARGIN && scrim.top < MAX_ALPHA) {
        scrim.top = Math.min(MAX_ALPHA, Number((scrim.top + STEP).toFixed(3)));
        moved = true;
      }
      // The foot sits under the headline band and must never be the lighter
      // of the two, or the meta line loses the ground it was given.
      if (scrim.foot < scrim.bottom) {
        scrim.foot = scrim.bottom;
        moved = true;
      }
      if (!moved) break;
    }
    scrims[background] = { ...scrims[background], ...scrim, tuned: true };
    console.log(
      `tuned ${background.padEnd(14)} top ${scrim.top.toFixed(3)}  ` +
        `bottom ${scrim.bottom.toFixed(3)}  foot ${scrim.foot.toFixed(3)}`,
    );
  }
  await writeFile(SCRIM_PATH, JSON.stringify(scrims, null, 2) + "\n");
  console.log(`\nwrote ${SCRIM_PATH.slice(ROOT.length + 1)}\n`);
}

const failures = [];
console.log("card".padEnd(24) + "headline  meta    mark   ink top  ink right  size");

for (const { name, card } of cards) {
  const m = await measure(card, scrims[card.background]);

  const bad = [];
  if (m.head < MIN_HEAD) bad.push(`headline contrast ${m.head.toFixed(2)} < ${MIN_HEAD}`);
  if (m.meta < MIN_META) bad.push(`meta contrast ${m.meta.toFixed(2)} < ${MIN_META}`);
  if (m.mark < MIN_MARK) bad.push(`wordmark contrast ${m.mark.toFixed(2)} < ${MIN_MARK}`);
  if (m.box.right > COLUMN_RIGHT) {
    bad.push(`headline runs ${m.box.right - COLUMN_RIGHT}px past the column`);
  }
  if (m.box.top < 390) {
    bad.push(`headline ink starts at y=${m.box.top}, it has wrapped an extra line`);
  }
  if (m.width !== 1200 || m.height !== 630) bad.push(`rendered ${m.width}x${m.height}`);

  console.log(
    name.padEnd(24) +
      `${m.head.toFixed(2).padStart(6)}  ${m.meta.toFixed(2).padStart(6)}  ${m.mark.toFixed(2).padStart(6)}  ` +
      `${String(m.box.top).padStart(7)}  ${String(m.box.right).padStart(9)}  ${m.width}x${m.height}` +
      (bad.length ? `   FAIL: ${bad.join("; ")}` : ""),
  );
  if (bad.length) failures.push(`${name}: ${bad.join("; ")}`);
  if (writeDir) await writeFile(join(writeDir, `${name.replace(/\//g, "-")}.png`), m.png);
}

if (failures.length) {
  console.error(`\n${failures.length} card(s) failed:\n  ` + failures.join("\n  "));
  process.exit(1);
}
console.log("\nAll cards pass.");
