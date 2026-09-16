import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, logAuditEvent } from "@/lib/db";
import { ensureNewsletterSchema, unsubscribeByToken } from "@/lib/newsletter/db";

/**
 * The one click unsubscribe.
 *
 * Gmail, Yahoo and Apple read the List-Unsubscribe header on a newsletter
 * and show their own Unsubscribe button. Pressing it POSTs here with the
 * body `List-Unsubscribe=One-Click` and expects a 2xx, with no page and no
 * confirmation, inside a couple of seconds. So this does the one thing and
 * answers.
 *
 * A GET (somebody pasting the link, or a scanner) is sent to the page that
 * asks first. Link scanners follow GETs, so a GET must never unsubscribe
 * anyone on its own.
 */

export const dynamic = "force-dynamic";

const VALID = /^[A-Za-z0-9_-]{20,48}$/;

export async function POST(_request: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!VALID.test(token)) return NextResponse.json({ ok: false }, { status: 404 });
  try {
    await ensureSchema();
    await ensureNewsletterSchema();
    const sub = await unsubscribeByToken(token, "One click unsubscribe from the mail client");
    if (sub) {
      await logAuditEvent({ action: "newsletter_unsubscribed", targetTable: "newsletter_subscribers", targetId: sub.id, newValue: "one-click" });
    }
    // Always 200: a token that no longer exists has nothing left to do.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[unsubscribe] failed:", (err as Error).message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  return NextResponse.redirect(new URL(`/newsletter/unsubscribe/${encodeURIComponent(token)}`, request.url), 302);
}
