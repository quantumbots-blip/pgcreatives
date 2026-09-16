import { NextRequest, NextResponse } from "next/server";
import { verifySessionFull } from "@/lib/auth";
import { ensureSchema } from "@/lib/db";
import { allSubscribersForExport, ensureNewsletterSchema } from "@/lib/newsletter/db";

/**
 * The list as a CSV, for the owner to keep or take somewhere else. Signed in
 * dashboard sessions only. Every cell is quoted so a comma in a company name
 * does not shift the columns, and a cell starting with = + - or @ gets a
 * leading apostrophe so a spreadsheet does not run it as a formula.
 */

export const dynamic = "force-dynamic";

function cell(value: string | null): string {
  let v = String(value ?? "");
  if (/^[=+\-@]/.test(v)) v = `'${v}`;
  return `"${v.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get("admin_session");
  if (!session || !(await verifySessionFull(session.value))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureSchema();
  await ensureNewsletterSchema();
  const rows = await allSubscribersForExport();
  const lines = [
    ["email", "first_name", "last_name", "company", "status", "status_reason", "added", "last_sent"].join(","),
    ...rows.map((r) =>
      [r.email, r.first_name, r.last_name, r.company, r.status, r.status_reason, r.created_at, r.last_sent_at]
        .map(cell)
        .join(","),
    ),
  ];
  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pg-creatives-newsletter-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
