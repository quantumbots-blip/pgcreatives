import { NextRequest, NextResponse } from "next/server";
import { verifySessionFull } from "@/lib/auth";
import { ensureSchema } from "@/lib/db";
import { ensureNewsletterSchema, listMedia } from "@/lib/newsletter/db";

/** What has been uploaded, for the picker. Signed in sessions only. */

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = request.cookies.get("admin_session");
  if (!session || !(await verifySessionFull(session.value))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureSchema();
  await ensureNewsletterSchema();
  const items = await listMedia();
  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
