import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { ensureSchema, ensurePageViewsTable, logAuditEvent } from "@/lib/db";
import { getWeeklyDigest } from "@/lib/insights";
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

const DASHBOARD_URL = `${BUSINESS.url}/admin`;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // No secret means no scheduled sending. Failing closed is the right default
  // for anything that can send mail on the owner's behalf.
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

function changeLine(now: number, before: number, noun: string): string {
  if (before === 0) return now === 0 ? `No ${noun} either week.` : `${now} ${noun}, none the week before.`;
  const pct = Math.round(((now - before) / before) * 100);
  if (pct === 0) return `${now} ${noun}, level with the week before.`;
  return `${now} ${noun}, ${Math.abs(pct)}% ${pct > 0 ? "up on" : "down on"} the week before (${before}).`;
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

    /* The subject line is the whole email for anybody reading on a phone
       lock screen, so it carries the one thing worth acting on. */
    const subject =
      d.waiting > 0
        ? `${plural(d.waiting, "lead")} waiting at PG Creatives`
        : `PG Creatives: ${plural(d.leadsThisWeek, "lead")} last week, nothing waiting`;

    const waitingBlock =
      d.waiting === 0
        ? ["Nobody is waiting on a reply. Everything that came in has been answered."]
        : [
            `${plural(d.waiting, "person", "people")} still waiting on a reply:`,
            "",
            ...d.waitingNames.map(
              (w) =>
                `  ${w.name}${w.service ? ` (${w.service})` : ""}, waiting ${plural(w.days, "day")}`,
            ),
            ...(d.waiting > d.waitingNames.length
              ? [`  and ${d.waiting - d.waitingNames.length} more`]
              : []),
          ];

    const lines = [
      `Here is where things stand at PG Creatives.`,
      ``,
      ...waitingBlock,
      ``,
      `Last seven days`,
      `  ${changeLine(d.leadsThisWeek, d.leadsLastWeek, "leads")}`,
      `  ${changeLine(d.viewsThisWeek, d.viewsLastWeek, "page views")}`,
      d.booked > 0 ? `  ${plural(d.booked, "lead")} booked.` : null,
      d.medianReplyHours !== null
        ? `  You typically reply in ${
            d.medianReplyHours < 1
              ? `${Math.round(d.medianReplyHours * 60)} minutes`
              : d.medianReplyHours < 48
                ? `${Math.round(d.medianReplyHours)} hours`
                : `${Math.round(d.medianReplyHours / 24)} days`
          }.`
        : null,
      d.spamFiltered > 0
        ? `  ${plural(d.spamFiltered, "spam message")} filtered out before it reached you.`
        : null,
      ``,
      `Open the dashboard: ${DASHBOARD_URL}`,
    ].filter((l) => l !== null);

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "PG Creatives <noreply@pgcreativeswi.com>",
      to: BUSINESS.email,
      subject,
      text: lines.join("\n"),
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
