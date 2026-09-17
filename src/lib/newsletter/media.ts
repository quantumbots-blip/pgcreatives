import path from "path";
import { promises as fs } from "fs";
import sharp from "sharp";

/**
 * Pictures at the size the email needs.
 *
 * Two sources: the site's own photographs under public/, and the owner's
 * uploads in the database. Both come out of here as a JPEG cropped to
 * exactly the box the email will show it in (a 2x rendition, so it is sharp
 * on a phone), so a 400KB master becomes a 90KB frame and a grid of six
 * different aspect ratios comes out as six identical boxes.
 *
 * Uploads are normalized on the way in: rotated the way the camera meant,
 * shrunk to 1600 on the long side, and re-encoded, so a 6MB phone photo is
 * stored as 300KB and nothing in the database is ever larger than that.
 */

export const MAX_STORED_EDGE = 1600;
export const MAX_SERVED_EDGE = 1600;
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const PUBLIC = path.join(process.cwd(), "public");

/** Only these folders may be served, and only plain file names inside them. */
const SITE_FILE = /^(images|team)\/[a-z0-9_-]+\.(jpe?g|png|webp)$/i;

export async function readSiteFile(rel: string): Promise<Buffer | null> {
  if (!SITE_FILE.test(rel)) return null;
  try {
    return await fs.readFile(path.join(PUBLIC, rel));
  } catch {
    return null;
  }
}

export type Size = { w: number; h: number | null };

/** Clamp what the URL asked for to something sane. */
export function parseSize(w: string | null, h: string | null): Size | null {
  const width = Number.parseInt(w ?? "", 10);
  if (!Number.isInteger(width) || width < 16 || width > MAX_SERVED_EDGE) return null;
  if (h === null || h === "") return { w: width, h: null };
  const height = Number.parseInt(h, 10);
  if (!Number.isInteger(height) || height < 16 || height > MAX_SERVED_EDGE) return null;
  return { w: width, h: height };
}

/** A JPEG of the source at the size asked for, cropped to fit when a height is given. */
export async function renderSize(source: Buffer, size: Size): Promise<Buffer> {
  const image = sharp(source).rotate();
  if (size.h) {
    image.resize({ width: size.w, height: size.h, fit: "cover", position: "centre", withoutEnlargement: false });
  } else {
    image.resize({ width: size.w, withoutEnlargement: true });
  }
  return image.jpeg({ quality: 80, mozjpeg: true, progressive: true }).toBuffer();
}

/** An upload, made storable. */
export async function normalizeUpload(source: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  const data = await sharp(source)
    .rotate()
    .resize({ width: MAX_STORED_EDGE, height: MAX_STORED_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();
  const meta = await sharp(data).metadata();
  return { data, width: meta.width ?? 0, height: meta.height ?? 0 };
}
