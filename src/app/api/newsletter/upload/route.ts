import { NextRequest, NextResponse } from "next/server";
import { verifySessionFull } from "@/lib/auth";
import { ensureSchema, logAuditEvent } from "@/lib/db";
import { ensureNewsletterSchema, newMediaKey, saveMedia, type MediaItem } from "@/lib/newsletter/db";
import { MAX_UPLOAD_BYTES, normalizeUpload } from "@/lib/newsletter/media";

/**
 * Photos from the owner's phone or the month's export, into the picker.
 *
 * A route handler rather than a server action because a phone photo is
 * several megabytes and a batch of them is more, past what an action's
 * body allows. Signed in dashboard sessions only. Each file is normalized
 * by sharp before it is stored, so nothing that is not an image gets in
 * and nothing gets in at full size.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_FILES = 12;

export async function POST(request: NextRequest) {
  const session = request.cookies.get("admin_session");
  if (!session || !(await verifySessionFull(session.value))) {
    return NextResponse.json({ error: "Signed out. Sign in again to upload." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Could not read the upload." }, { status: 400 });
  }
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "No files were sent." }, { status: 400 });
  if (files.length > MAX_FILES) return NextResponse.json({ error: `Up to ${MAX_FILES} at a time.` }, { status: 400 });

  await ensureSchema();
  await ensureNewsletterSchema();

  const saved: MediaItem[] = [];
  const failed: { name: string; reason: string }[] = [];
  for (const file of files) {
    if (file.size > MAX_UPLOAD_BYTES) {
      failed.push({ name: file.name, reason: "Over 25MB" });
      continue;
    }
    try {
      const source = Buffer.from(await file.arrayBuffer());
      const { data, width, height } = await normalizeUpload(source);
      if (!width || !height) throw new Error("not an image");
      const item = await saveMedia({
        key: newMediaKey(),
        filename: file.name.slice(0, 200),
        width,
        height,
        data,
      });
      saved.push(item);
    } catch (err) {
      failed.push({ name: file.name, reason: /input|format|unsupported|not an image/i.test((err as Error).message) ? "Not a picture this understands" : "Could not process" });
    }
  }
  if (saved.length) {
    await logAuditEvent({ action: "newsletter_upload", targetTable: "newsletter_media", newValue: `${saved.length} photos` });
  }
  return NextResponse.json({ saved, failed });
}
