import { ImageResponse } from "next/og";
import sharp from "sharp";

import { ogElement, ogFonts, OG_SIZE, OG_CONTENT_TYPE, type OgCard } from "./og-card";
/**
 * Renders a card and hands back a JPEG.
 *
 * `ImageResponse` only ever emits PNG — @vercel/og has no format option — and a
 * PNG of a photograph is the wrong container entirely: these cards came out at
 * 1.7MB each. That is not just wasteful, it is a broken preview. WhatsApp drops
 * an OG image over about 300KB rather than showing it, and the route was also
 * declaring `contentType: "image/jpeg"` while serving PNG bytes, so the meta
 * tag disagreed with the file every crawler fetched.
 *
 * Re-encoding to JPEG at 86 takes the same card to roughly 150KB. 4:4:4
 * chroma, because the meta line is 19px type in a saturated blue and 4:2:0
 * subsampling smears exactly that.
 */
export async function ogResponse(card: OgCard) {
  const rendered = new ImageResponse(await ogElement(card), {
    ...OG_SIZE,
    fonts: await ogFonts(),
  });
  const png = Buffer.from(await rendered.arrayBuffer());
  const jpeg = await sharp(png)
    .jpeg({ quality: 86, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": OG_CONTENT_TYPE,
      "Cache-Control": "public, immutable, no-transform, max-age=31536000",
    },
  });
}
