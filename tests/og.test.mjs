import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { CARDS, MARKET_CARDS, MARKET_BACKGROUND, cardFor } from "../src/lib/og-cards.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP = join(ROOT, "src/app");
const OG = join(ROOT, "src/assets/og");

const exists = async (p) => {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
};

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

/**
 * The trap this guards is the one that already bit twice.
 *
 * Next merges `metadata` shallowly: a page that exports its own `openGraph`
 * object replaces the parent's entirely, and that includes the image the
 * parent segment's `opengraph-image.tsx` contributed. So a page can inherit a
 * card in theory and ship with no og:image at all in practice — which is what
 * /privacy did until it got a file of its own.
 *
 * Every page that declares openGraph must therefore declare its own card in
 * the same segment.
 */
test("every page that declares its own openGraph also ships its own card", async () => {
  const files = (await walk(APP)).filter((f) => /[\\/](page|layout)\.tsx$/.test(f));
  const missing = [];

  for (const file of files) {
    const src = await readFile(file, "utf8");
    // pageMetadata() builds an openGraph block; so does a literal one.
    const declaresOg = /pageMetadata\(/.test(src) || /^\s*openGraph:\s*\{/m.test(src);
    if (!declaresOg) continue;
    // A page that tells crawlers to stay away is not going to be shared.
    if (/robots:\s*\{\s*index:\s*false/.test(src)) continue;

    if (!(await exists(join(dirname(file), "opengraph-image.tsx")))) {
      missing.push(file.slice(ROOT.length + 1));
    }
  }

  assert.deepEqual(missing, [], `these routes declare openGraph but have no opengraph-image.tsx`);
});

test("every card names a background that has actually been generated", async () => {
  const backgrounds = new Set((await readdir(OG)).filter((f) => f.endsWith(".jpg")));
  for (const card of CARDS) {
    assert.ok(
      backgrounds.has(card.crop.out),
      `${card.route}: ${card.crop.out} is missing - run \`node scripts/og-backgrounds.mjs\``,
    );
  }
  assert.ok(backgrounds.has(MARKET_BACKGROUND), `market background ${MARKET_BACKGROUND} is missing`);
});

/* A background with no measured scrim throws at render time, which on a static
   route means a failed build rather than a bad card — but only if somebody
   runs the build. This catches it a step earlier. */
test("every background has a measured scrim", async () => {
  const scrims = JSON.parse(await readFile(join(OG, "scrim.json"), "utf8"));
  for (const card of CARDS) {
    const s = scrims[card.crop.out];
    assert.ok(s, `${card.route}: no scrim measured for ${card.crop.out}`);
    for (const key of ["top", "bottom", "foot"]) {
      assert.equal(typeof s[key], "number", `${card.route}: scrim.${key} is not a number`);
      assert.ok(s[key] >= 0 && s[key] <= 1, `${card.route}: scrim.${key} out of range`);
    }
    /* The foot carries 19px signal blue and the band above it carries 68px
       white, so the foot is always the darker of the two. If this inverts, the
       meta line is the thing that goes unreadable. */
    assert.ok(s.foot >= s.bottom, `${card.route}: foot scrim is lighter than the headline scrim`);
  }
});

test("no card repeats another card's photograph", () => {
  const seen = new Map();
  for (const card of CARDS) {
    const prev = seen.get(card.crop.src);
    // areas and the market pages are meant to share one frame.
    if (prev) assert.fail(`${card.route} and ${prev} both use ${card.crop.src}`);
    seen.set(card.crop.src, card.route);
  }
});

/* Width is NOT checked here. Character count is a bad proxy for it: measured
   across the real cards, 68px Poppins Bold sets between 28.7 and 35.0 pixels
   per character depending on the letters, so any cap tight enough to catch a
   genuine overflow also rejects lines that fit. scripts/og-verify.mjs renders
   every card and measures the ink box instead. What is checked here is the
   copy itself. */
test("card copy follows the house style", () => {
  const all = [
    ...CARDS.map((c) => [c.route, c.headline, c.meta]),
    ...Object.entries(MARKET_CARDS).map(([k, c]) => [k, c.headline, c.meta]),
  ];
  for (const [route, headline, meta] of all) {
    const lines = Array.isArray(headline) ? headline : [headline];
    assert.ok(lines.length <= 2, `${route}: a three line headline runs into the photograph`);
    assert.match(lines.at(-1), /[.?!]$/, `${route}: headline does not end in a full stop`);
    assert.ok(meta.length >= 1 && meta.length <= 4, `${route}: meta line has ${meta.length} parts`);
    // House style: no dashes in visitor-facing copy, comma or full stop instead.
    for (const part of [...lines, ...meta]) {
      assert.doesNotMatch(part, /[\u2014\u2013]|\s-\s/, `${route}: "${part}" uses a dash`);
    }
  }
});

test("every card has alt text that describes the photograph", () => {
  for (const card of CARDS) {
    assert.ok(card.alt.length > 30, `${card.route}: alt text is too thin to be useful`);
    // Alt text describes what is in the frame, it does not name the company.
    assert.doesNotMatch(card.alt, /PG Creatives/i, `${card.route}: alt text names the company`);
  }
});

test("cardFor throws rather than rendering a blank frame", () => {
  assert.throws(() => cardFor("nope"), /No share card defined/);
});
