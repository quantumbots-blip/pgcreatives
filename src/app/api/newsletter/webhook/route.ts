import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, logAuditEvent } from "@/lib/db";
import { ensureNewsletterSchema, setStatusByEmail, updateDeliveryByResendId } from "@/lib/newsletter/db";
import { verifySvix } from "@/lib/newsletter/webhook";

/**
 * What Resend tells us afterwards.
 *
 * A bounce or a complaint is the one signal that decides whether the next
 * newsletter reaches anybody at all: Gmail measures complaints against the
 * whole domain, and a sender who keeps mailing addresses that complained is
 * a sender whose mail stops arriving. So a hard bounce and a complaint both
 * take the person off the list here, the moment Resend says so.
 *
 * Delivered and opened are recorded against the delivery row so the campaign
 * page can show them. Nothing here is trusted without the signature.
 *
 * Set up: in Resend, add a webhook pointing at
 * https://pgcreativeswi.com/api/newsletter/webhook for the email events, and
 * put its signing secret in RESEND_WEBHOOK_SECRET. Without the secret the
 * endpoint refuses everything, which is the right way round.
 */

export const dynamic = "force-dynamic";

type Event = {
  type?: string;
  data?: {
    email_id?: string;
    to?: string[] | string;
    bounce?: { type?: string; subType?: string; message?: string };
    failed?: { reason?: string };
    tags?: Record<string, string>;
  };
};

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 404 });

  const body = await request.text();
  const check = verifySvix(
    {
      id: request.headers.get("svix-id"),
      timestamp: request.headers.get("svix-timestamp"),
      signature: request.headers.get("svix-signature"),
    },
    body,
    secret,
  );
  if (!check.ok) {
    return NextResponse.json({ error: check.reason }, { status: check.reason === "stale timestamp" ? 400 : 401 });
  }

  let event: Event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const type = event.type ?? "";
  const resendId = event.data?.email_id ?? "";
  const to = Array.isArray(event.data?.to) ? event.data?.to[0] : event.data?.to;
  if (!resendId) return NextResponse.json({ ok: true, ignored: "no email id" });

  try {
    await ensureSchema();
    await ensureNewsletterSchema();

    if (type === "email.delivered" || type === "email.opened") {
      await updateDeliveryByResendId(resendId, type === "email.opened" ? "opened" : "delivered", null);
      return NextResponse.json({ ok: true });
    }

    if (type === "email.bounced") {
      const bounce = event.data?.bounce;
      const message = [bounce?.type, bounce?.subType, bounce?.message].filter(Boolean).join(": ");
      const hit = await updateDeliveryByResendId(resendId, "bounced", message || "Bounced");
      /* A transient bounce (a full mailbox, a greylist) is a failed delivery,
         not a dead address. Only a permanent one takes the person off. */
      const permanent = !/transient|soft/i.test(bounce?.type ?? "");
      const email = hit?.email ?? to;
      if (permanent && email) {
        const changed = await setStatusByEmail(email, "bounced", message || "Hard bounce");
        if (changed) await logAuditEvent({ action: "newsletter_bounced", targetTable: "newsletter_subscribers", newValue: email });
      }
      return NextResponse.json({ ok: true });
    }

    if (type === "email.complained") {
      const hit = await updateDeliveryByResendId(resendId, "complained", "Marked as spam");
      const email = hit?.email ?? to;
      if (email) {
        const changed = await setStatusByEmail(email, "complained", "Marked the email as spam");
        if (changed) await logAuditEvent({ action: "newsletter_complained", targetTable: "newsletter_subscribers", newValue: email });
      }
      return NextResponse.json({ ok: true });
    }

    if (type === "email.failed") {
      await updateDeliveryByResendId(resendId, "failed", event.data?.failed?.reason ?? "Failed");
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true, ignored: type });
  } catch (err) {
    console.error("[newsletter webhook] failed:", (err as Error).message);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
