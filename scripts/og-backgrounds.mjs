/**
 * Crops the chosen photographs down to the exact 1200x630 frames the share
 * cards paint, and writes them to src/assets/og.
 *
 * Doing the crop here rather than at render time is what makes the cards
 * predictable. Satori's object-fit lands the centre of the frame and nothing
 * else, so a photo whose subject sits low — most twilight exteriors, where the
 * house is under the sky — got its roofline cut off and its sky kept. `focus`
 * below is the vertical anchor, 0 for the top edge of the frame and 1 for the
 * bottom, so each photo is cut where its subject actually is.
 *
 * Pre-cropping also shrinks what Satori has to inline: a 1200x630 q82 JPEG is
 * around 120KB against 400KB for the source, and every one of those bytes is
 * base64'd into the render.
 *
 * Run: node scripts/og-backgrounds.mjs
 */
import sharp from "sharp";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "public/images");
const OUT = join(ROOT, "src/assets/og");

const W = 1200;
const H = 630;

/** @type {{out: string, src: string, focus: number}[]} */
export const BACKGROUNDS = [
  // Filled in by the caller below. Kept as data so the list reads as an
  // inventory of what ships rather than a pile of calls.
];

/* Where each piece of type actually lands on the card, in card pixels. Taken
   from the padding and sizes in og-card.ts, not guessed. */
const HEAD_BAND = { left: 40, top: 420, width: 1060, height: 115 };
const META_BAND = { left: 40, top: 535, width: 820, height: 70 };
const MARK_BAND = { left: 40, top: 40, width: 340, height: 70 };

/* Three targets, because the three things sitting on this photograph have
   three different contrast needs, and one number for all of them is what made
   the first pass either crush the photo or lose the meta line.
 *
 * - The headline is 68px bold white. Large text only needs 3:1, so L110 would
 *   pass; L82 is chosen instead because a share card is read at 400px in a
 *   feed, where the type is effectively 23px.
 * - The meta line is the tight one. It is 19px and it is NOT white, it is
 *   signal blue #6ab0d4, whose relative luminance is 0.389. Solving
 *   (0.389+0.05)/(Y+0.05) >= 4.5 puts its background at Y <= 0.0476, which is
 *   L60 on this scale. L48 is the target so it clears with margin.
 * - The wordmark is white artwork rather than text, so 3:1 is honest for it. */
const HEAD_TARGET = 82;
const META_TARGET = 48;
const MARK_TARGET = 70;

async function meanLuma(buf, region) {
  const raw = await sharp(buf).extract(region).greyscale().raw().toBuffer();
  let sum = 0;
  for (const v of raw) sum += v;
  return sum / raw.length;
}

/**
 * One scrim strength for every photo was the mistake in the first pass. It was
 * tuned on the twilight aerial, whose lower third is already dark, and then
 * applied to white kitchens — which it crushed into a black bar, destroying the
 * photograph the card exists to show off.
 *
 * A black scrim at alpha a over a band of luminance L leaves L*(1-a), so the
 * alpha each photo needs is just 1 - target/L. Bright photos get more, dark
 * photos get less, and every card lands on the same contrast.
 */
function scrimFor(luma, target) {
  return Math.max(0.22, Math.min(0.72, 1 - target / Math.max(luma, 1)));
}

export async function crop({ out, src, focus = 0.5 }) {
  const input = join(SRC, src);
  const meta = await sharp(input).metadata();

  // Cover the 1200x630 frame, then choose which band of the scaled image to
  // keep. sharp's own `position` only offers top/centre/bottom, which is too
  // blunt for a roofline that sits at 40%.
  const scale = Math.max(W / meta.width, H / meta.height);
  const sw = Math.round(meta.width * scale);
  const sh = Math.round(meta.height * scale);
  const top = Math.max(0, Math.min(sh - H, Math.round((sh - H) * focus)));
  const left = Math.max(0, Math.min(sw - W, Math.round((sw - W) * 0.5)));

  const buf = await sharp(input)
    .resize(sw, sh, { fit: "fill", kernel: "lanczos3" })
    .extract({ left, top, width: W, height: H })
    .jpeg({ quality: 82, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toBuffer();

  await writeFile(join(OUT, out), buf);

  const headLuma = await meanLuma(buf, HEAD_BAND);
  const metaLuma = await meanLuma(buf, META_BAND);
  const markLuma = await meanLuma(buf, MARK_BAND);

  return {
    out,
    src,
    bytes: buf.length,
    from: `${meta.width}x${meta.height}`,
    headLuma: Math.round(headLuma),
    metaLuma: Math.round(metaLuma),
    markLuma: Math.round(markLuma),
    hash: createHash("sha256").update(buf).digest("hex").slice(0, 16),
    scrim: {
      /* `foot` is the deep toe under the meta line only. Letting the bottom
         30px of the card go darker than the headline band costs almost no
         photograph — it is the last strip before the edge — and it is what
         keeps 19px blue legible without dragging the whole lower third down
         with it. */
      foot: Number(scrimFor(metaLuma, META_TARGET).toFixed(3)),
      bottom: Number(scrimFor(headLuma, HEAD_TARGET).toFixed(3)),
      top: Number(scrimFor(markLuma, MARK_TARGET).toFixed(3)),
    },
  };
}

export async function run(list) {
  await mkdir(OUT, { recursive: true });
  const done = [];
  for (const b of list) done.push(await crop(b));

  /* The scrims written here are ESTIMATES, computed from the mean luminance of
     each band. The mean is optimistic — a headline is only as readable as the
     few letters that land on the brightest thing behind it — so
     scripts/og-verify.mjs --tune renders each card and refines these against
     what it measures under the actual glyphs.
   *
   * Which is why an unchanged photograph keeps the numbers it already has.
   * Rewriting every estimate on every run would silently throw the tuned
   * values away, and nothing downstream would notice until a card went out
   * with an illegible line on it. A photograph whose bytes changed is a
   * different photograph and goes back to an untuned estimate. */
  let previous = {};
  try {
    previous = JSON.parse(await readFile(join(OUT, "scrim.json"), "utf8"));
  } catch {
    // First run.
  }

  const scrims = {};
  for (const d of done) {
    const before = previous[d.out];
    scrims[d.out] =
      before && before.hash === d.hash
        ? before
        : { ...d.scrim, hash: d.hash, tuned: false };
    d.kept = Boolean(before && before.hash === d.hash);
  }
  await writeFile(join(OUT, "scrim.json"), JSON.stringify(scrims, null, 2) + "\n");

  const untuned = Object.entries(scrims).filter(([, v]) => !v.tuned).map(([k]) => k);
  if (untuned.length) {
    console.log(
      `\n${untuned.length} background(s) need tuning: ${untuned.join(", ")}\n` +
        `Run: node scripts/og-verify.mjs --tune`,
    );
  }

  return done;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { CARDS } = await import("../src/lib/og-cards.ts");
  const done = await run(CARDS.map((c) => c.crop));
  for (const d of done) {
    console.log(
      `${d.out.padEnd(16)} ${String(Math.round(d.bytes / 1024)).padStart(4)}KB  ` +
        `head L${String(d.headLuma).padStart(3)}->${d.scrim.bottom.toFixed(2)}  ` +
        `meta L${String(d.metaLuma).padStart(3)}->${d.scrim.foot.toFixed(2)}  ` +
        `mark L${String(d.markLuma).padStart(3)}->${d.scrim.top.toFixed(2)}  ` +
        `${d.kept ? "scrim kept" : "NEW scrim  "}  <- ${d.src} (${d.from})`,
    );
  }
}
