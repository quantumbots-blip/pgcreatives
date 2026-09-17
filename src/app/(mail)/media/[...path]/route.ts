import { NextRequest, NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db";
import { ensureNewsletterSchema, readMedia } from "@/lib/newsletter/db";
import { parseSize, readSiteFile, renderSize } from "@/lib/newsletter/media";

/**
 * /media/site/images/x.jpg?w=1200&h=800  a site photograph, cropped
 * /media/u/<key>.jpg?w=1064              an uploaded one, resized
 *
 * Every URL is immutable once it exists: the site's files never change
 * under a name, and an upload's key is random. So the response is cached
 * for a year at the edge and in the reader's client, and the resize runs
 * once per size per region rather than once per reader.
 */

export const dynamic = "force-dynamic";

const IMMUTABLE = "public, max-age=31536000, immutable";

export async function GET(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const size = parseSize(request.nextUrl.searchParams.get("w"), request.nextUrl.searchParams.get("h"));
  if (!size) return new NextResponse("Bad size", { status: 400 });

  let source: Buffer | null = null;
  try {
    if (parts[0] === "site" && parts.length === 3) {
      source = await readSiteFile(`${parts[1]}/${parts[2]}`);
    } else if (parts[0] === "u" && parts.length === 2) {
      const key = parts[1].replace(/\.jpg$/i, "");
      await ensureSchema();
      await ensureNewsletterSchema();
      source = (await readMedia(key))?.data ?? null;
    }
    if (!source) return new NextResponse("Not found", { status: 404 });

    const out = await renderSize(source, size);
    return new NextResponse(new Uint8Array(out), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(out.length),
        "Cache-Control": IMMUTABLE,
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (err) {
    console.error("[media] failed:", (err as Error).message);
    return new NextResponse("Failed", { status: 500 });
  }
}
