import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { ensureSchema, ensurePageViewsTable, logAuditEvent } from "@/lib/db";
import { getWeeklyDigest } from "@/lib/insights";
import { weeklyDigestEmail } from "@/lib/email/templates";
import { BUSINESS } from "@/lib/data";

/**
 * The Monday morning email.
 *
 * A dashboard nobody opens is not a dashboard. This is the part that gets it
 * opened: a short note saying who is still waiting, what came in, and how the
 * week compared, with a link straight into the page. Everything in it is the
 * same figure the dashboard shows, computed by the same code, because an
 * email that disagrees with the page it links to is worse than no email.
 *
 * Scheduled from vercel.json. Vercel signs the call with CRON_SECRET; without
 * that variable set the endpoint refuses to run, so it cannot be triggered by
 * anybody who guesses the path.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // No secret means no scheduled sending. Failing closed is the right default
  // for anything that can send mail on the owner's behalf.
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await Promise.all([ensureSchema(), ensurePageViewsTable()]);
    const d = await getWeeklyDigest();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: true, sent: false, reason: "no RESEND_API_KEY", digest: d });
    }

    const mail = weeklyDigestEmail(d);

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "PG Creatives <noreply@pgcreativeswi.com>",
      to: BUSINESS.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });

    await logAuditEvent({
      action: "weekly_digest_sent",
      newValue: `${d.waiting} waiting, ${d.leadsThisWeek} leads`,
    });

    return NextResponse.json({ ok: true, sent: true });
  } catch (err) {
    console.error("[weekly-digest] failed:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Digest failed" }, { status: 500 });
  }
}
