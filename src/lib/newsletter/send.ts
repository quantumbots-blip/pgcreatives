import { Resend } from "resend";
import { BUSINESS } from "@/lib/data";
import { SITE_URL } from "@/lib/email/layout";
import { FROM, sendEmail } from "@/lib/email/send";
import { logAuditEvent } from "@/lib/db";
import type { Draft } from "./blocks";
import { renderNewsletter, type Recipient } from "./render";
import {
  getCampaign,
  markFailed,
  markSent,
  nextQueued,
  queueDeliveries,
  setCampaignStatus,
  skipUnsubscribedDeliveries,
  type Campaign,
  type QueuedDelivery,
} from "./db";

/**
 * Sending a campaign to everybody, in a way that can stop and pick up again.
 *
 * Resend's batch endpoint takes a hundred messages a call, and the free plan
 * allows a hundred messages a day, so on the day this ships a list of four
 * hundred is four days of sending. The loop below does not pretend
 * otherwise. It works through rows still queued, a batch at a time, and when
 * Resend answers with a quota error it marks the campaign paused with the
 * reason in plain words and returns. The Resume button runs the same
 * function, which asks for rows still queued and carries on. Nobody is
 * mailed twice because the queue is keyed on the person and the campaign.
 *
 * Every message carries the two headers Gmail, Yahoo and Apple require for
 * a one click unsubscribe, pointing at a URL that is unique to the person.
 */

export const BATCH = 100;
/* Well inside the function's limit, leaving room for the last batch to
   finish and the database to be told about it. */
const TIME_BUDGET_MS = 240_000;

export function postalAddress(): string | undefined {
  return process.env.NEWSLETTER_POSTAL_ADDRESS?.trim() || undefined;
}

export function unsubscribeUrl(token: string): string {
  return `${SITE_URL}/newsletter/unsubscribe/${token}`;
}

export function oneClickUrl(token: string): string {
  return `${SITE_URL}/api/newsletter/unsubscribe/${token}`;
}

export function viewUrl(publicToken: string): string {
  return `${SITE_URL}/newsletter/view/${publicToken}`;
}

export function recipientFor(row: QueuedDelivery): Recipient {
  return {
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    company: row.company,
    unsubscribeUrl: unsubscribeUrl(row.unsubscribe_token),
  };
}

/** The headers that let a mail client offer its own unsubscribe button. */
export function unsubscribeHeaders(token: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${oneClickUrl(token)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

export type SendOutcome = {
  status: Campaign["status"];
  sent: number;
  failed: number;
  remaining: number;
  reason: string | null;
};

const QUOTA = new Set(["daily_quota_exceeded", "monthly_quota_exceeded"]);

function explain(name: string, message: string): string {
  switch (name) {
    case "daily_quota_exceeded":
      return "Resend's daily limit is used up. Sending stops here and can be resumed tomorrow; nobody will get it twice.";
    case "monthly_quota_exceeded":
      return "Resend's monthly limit is used up. Resume after the plan resets or is upgraded.";
    case "invalid_from_address":
    case "validation_error":
      return `Resend refused the sender: ${message}. The domain pgcreativeswi.com has to be verified in Resend first.`;
    case "missing_api_key":
    case "invalid_api_key":
    case "restricted_api_key":
      return `The Resend key was refused: ${message}.`;
    default:
      return `${name}: ${message}`;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Send, or resume sending, one campaign. Safe to call again at any time.
 */
export async function sendCampaign(campaignId: number, actor: string | null): Promise<SendOutcome> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) return { status: "draft", sent: 0, failed: 0, remaining: 0, reason: "No such campaign." };
  if (campaign.status === "sent") {
    return { status: "sent", sent: campaign.counts.sent, failed: campaign.counts.failed, remaining: 0, reason: null };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    await setCampaignStatus(campaignId, "paused", "The Resend key is missing, so nothing can be sent.");
    return { status: "paused", sent: 0, failed: 0, remaining: campaign.counts.queued, reason: "The Resend key is missing." };
  }
  const resend = new Resend(apiKey);

  const draft: Draft = { subject: campaign.subject, preheader: campaign.preheader, blocks: campaign.blocks };
  const opts = { viewUrl: viewUrl(campaign.public_token), postalAddress: postalAddress() };

  await setCampaignStatus(campaignId, "sending", null);
  const queued = await queueDeliveries(campaignId);
  await skipUnsubscribedDeliveries(campaignId);
  await logAuditEvent({
    actor,
    action: campaign.status === "paused" ? "newsletter_resume" : "newsletter_send",
    targetTable: "newsletter_campaigns",
    targetId: campaignId,
    newValue: `${queued} queued`,
  });

  const started = Date.now();
  let sent = 0;
  let failed = 0;
  let reason: string | null = null;
  let status: Campaign["status"] = "sending";

  for (;;) {
    if (Date.now() - started > TIME_BUDGET_MS) {
      status = "paused";
      reason = "Sending paused to stay inside the time limit. Press Resume to carry on; nobody gets it twice.";
      break;
    }
    const rows = await nextQueued(campaignId, BATCH);
    if (rows.length === 0) {
      status = "sent";
      break;
    }

    const payload = rows.map((row) => {
      const mail = renderNewsletter(draft, { ...opts, recipient: recipientFor(row) });
      return {
        from: FROM,
        to: row.email,
        replyTo: BUSINESS.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        headers: unsubscribeHeaders(row.unsubscribe_token),
        tags: [{ name: "campaign", value: String(campaignId) }],
      };
    });

    let result = await resend.batch.send(payload);
    if (result.error?.name === "rate_limit_exceeded") {
      await sleep(1500);
      result = await resend.batch.send(payload);
    }

    if (result.error) {
      const { name, message } = result.error;
      console.error(`[newsletter] campaign ${campaignId} batch rejected:`, name, message);
      if (QUOTA.has(name) || /api_key|from_address|validation/.test(name)) {
        // Nothing in this batch went anywhere, and the next batch would fail
        // the same way. Leave the rows queued and stop.
        status = "paused";
        reason = explain(name, message);
        break;
      }
      // Something about this batch. Record it and move on to the next.
      await markFailed(rows.map((r) => r.id), explain(name, message));
      failed += rows.length;
      continue;
    }

    const ids = result.data?.data ?? [];
    const pairs = rows
      .map((row, i) => ({ id: row.id, resendId: ids[i]?.id ?? "" }))
      .filter((p) => p.resendId);
    await markSent(pairs);
    sent += pairs.length;
    const missing = rows.filter((_, i) => !ids[i]?.id).map((r) => r.id);
    if (missing.length) {
      await markFailed(missing, "Resend returned no id for this message");
      failed += missing.length;
    }
    // Ten requests a second is the ceiling; this is nowhere near it, and a
    // little space between batches keeps a shared account polite.
    await sleep(250);
  }

  await setCampaignStatus(campaignId, status, reason);
  const after = await getCampaign(campaignId);
  await logAuditEvent({
    actor,
    action: status === "sent" ? "newsletter_sent" : "newsletter_paused",
    targetTable: "newsletter_campaigns",
    targetId: campaignId,
    newValue: `${sent} sent, ${failed} failed${reason ? `: ${reason}` : ""}`,
  });
  return { status, sent, failed, remaining: after?.counts.queued ?? 0, reason };
}

/**
 * One copy to one inbox, exactly as it will go out, with the subject marked
 * so it cannot be mistaken for the real thing.
 */
export async function sendTest(draft: Draft, to: string, firstName: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const recipient: Recipient = {
    email: to,
    firstName,
    unsubscribeUrl: `${SITE_URL}/newsletter/unsubscribe/preview`,
  };
  const mail = renderNewsletter(draft, { recipient, postalAddress: postalAddress() });
  const result = await sendEmail({
    to,
    mail: { ...mail, subject: `[Test] ${mail.subject}` },
    kind: "newsletter test",
    headers: unsubscribeHeaders("preview"),
  });
  if (!result.ok) {
    const [name = "", ...rest] = result.reason.split(": ");
    return { ok: false, reason: explain(name, rest.join(": ")) };
  }
  return { ok: true };
}
