"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifySessionFull, getSessionEmail } from "@/lib/auth";
import { ensureSchema, logAuditEvent } from "@/lib/db";
import { BUSINESS } from "@/lib/data";
import { newId, normalizeDraft, type Draft } from "@/lib/newsletter/blocks";
import { getVimeoMeta } from "@/lib/vimeo";
import { preflight, SAMPLE_DRAFT, type Preflight } from "@/lib/newsletter/render";
import { parseSubscriberList } from "@/lib/newsletter/import";
import {
  ensureNewsletterSchema,
  countSubscribers,
  importSubscribers,
  updateSubscriber,
  setSubscriberStatus,
  removeSubscriber,
  createCampaign,
  getCampaign,
  saveCampaign,
  deleteCampaign,
  requeueFailed,
  SUBSCRIBER_STATUSES,
  type SubscriberStatus,
} from "@/lib/newsletter/db";
import { sendCampaign, sendTest, postalAddress, type SendOutcome } from "@/lib/newsletter/send";

export type ActionResult = { success?: true; error?: string };

/**
 * Every action here checks the signed cookie and that the session is still
 * in the database, the same as the lead actions, and every one that changes
 * something writes an audit line with who did it.
 */
async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) return false;
  return verifySessionFull(session.value);
}

async function actor(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session ? getSessionEmail(session.value) : null;
}

async function ready() {
  await ensureSchema();
  await ensureNewsletterSchema();
}

function validId(id: unknown): id is number {
  return Number.isInteger(id) && (id as number) > 0;
}

/* ── Campaigns ──────────────────────────────────────────────────────── */

/**
 * The example, with real posters. The sample in render.ts carries a
 * placeholder poster so the tests never call Vimeo; the copy the owner
 * opens gets the frame Vimeo actually serves, fresh ids too.
 */
async function exampleDraft(): Promise<Draft> {
  const blocks = await Promise.all(
    SAMPLE_DRAFT.blocks.map(async (b) => {
      const id = newId();
      if (b.kind !== "film") return { ...b, id };
      const meta = await getVimeoMeta(b.vimeoId);
      return { ...b, id, poster: meta.thumbnail, portrait: meta.portrait };
    }),
  );
  return { subject: SAMPLE_DRAFT.subject, preheader: SAMPLE_DRAFT.preheader, blocks };
}

export async function createCampaignAction(startFrom: "blank" | "example"): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  await ready();
  const draft: Draft =
    startFrom === "example" ? await exampleDraft() : { subject: "", preheader: "", blocks: [] };
  const id = await createCampaign(draft);
  await logAuditEvent({ actor: await actor(), action: "newsletter_create", targetTable: "newsletter_campaigns", targetId: id });
  redirect(`/admin/newsletter/${id}`);
}

export async function duplicateCampaignAction(id: number): Promise<void> {
  if (!(await requireAdmin())) redirect("/admin/login");
  if (!validId(id)) redirect("/admin/newsletter");
  await ready();
  const source = await getCampaign(id);
  if (!source) redirect("/admin/newsletter");
  const copy = await createCampaign({
    subject: source.subject,
    preheader: source.preheader,
    blocks: source.blocks,
  });
  await logAuditEvent({ actor: await actor(), action: "newsletter_duplicate", targetTable: "newsletter_campaigns", targetId: copy, newValue: `from ${id}` });
  redirect(`/admin/newsletter/${copy}`);
}

export type SaveResult = ActionResult & { savedAt?: string };

export async function saveCampaignAction(id: number, draft: unknown): Promise<SaveResult> {
  if (!(await requireAdmin())) return { error: "Signed out. Sign in again to keep editing." };
  if (!validId(id)) return { error: "Invalid campaign" };
  await ready();
  const clean = normalizeDraft(draft);
  const saved = await saveCampaign(id, clean);
  if (!saved) return { error: "This email has already been sent, so it cannot change. Duplicate it to send a new one." };
  return { success: true, savedAt: new Date().toISOString() };
}

export async function deleteCampaignAction(id: number): Promise<ActionResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!validId(id)) return { error: "Invalid campaign" };
  await ready();
  const deleted = await deleteCampaign(id);
  if (!deleted) return { error: "Only drafts can be deleted. A sent email stays as a record." };
  await logAuditEvent({ actor: await actor(), action: "newsletter_delete", targetTable: "newsletter_campaigns", targetId: id });
  revalidatePath("/admin/newsletter");
  return { success: true };
}

export type PreflightResult = ActionResult & { preflight?: Preflight; recipients?: number };

/** Saves, then says whether it can go, and to how many people. */
export async function preflightCampaignAction(id: number, draft: unknown): Promise<PreflightResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!validId(id)) return { error: "Invalid campaign" };
  await ready();
  const clean = normalizeDraft(draft);
  const campaign = await getCampaign(id);
  if (!campaign) return { error: "No such campaign" };
  if (campaign.status === "draft") await saveCampaign(id, clean);
  const counts = await countSubscribers();
  const result = preflight(campaign.status === "draft" ? clean : campaign, {
    subscribers: counts.subscribed,
    hasKey: Boolean(process.env.RESEND_API_KEY),
    postalAddress: postalAddress(),
  });
  return { success: true, preflight: result, recipients: counts.subscribed };
}

export type SendActionResult = ActionResult & { outcome?: SendOutcome };

/**
 * The button. Runs the preflight again on the server, because the one the
 * page showed was a courtesy and this is the gate.
 */
export async function sendCampaignAction(id: number, draft: unknown): Promise<SendActionResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!validId(id)) return { error: "Invalid campaign" };
  await ready();
  const campaign = await getCampaign(id);
  if (!campaign) return { error: "No such campaign" };
  if (campaign.status === "sent") return { error: "This email has already gone out." };

  if (campaign.status === "draft") {
    const clean = normalizeDraft(draft);
    await saveCampaign(id, clean);
    const counts = await countSubscribers();
    const check = preflight(clean, {
      subscribers: counts.subscribed,
      hasKey: Boolean(process.env.RESEND_API_KEY),
      postalAddress: postalAddress(),
    });
    if (check.errors.length) return { error: check.errors[0] };
  }

  const outcome = await sendCampaign(id, await actor());
  revalidatePath("/admin/newsletter");
  revalidatePath(`/admin/newsletter/${id}`);
  return { success: true, outcome };
}

/** Failed rows back into the queue, then the same send loop. */
export async function retryFailedAction(id: number): Promise<SendActionResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!validId(id)) return { error: "Invalid campaign" };
  await ready();
  const campaign = await getCampaign(id);
  if (!campaign) return { error: "No such campaign" };
  const requeued = await requeueFailed(id);
  if (requeued === 0 && campaign.counts.queued === 0) return { error: "Nothing is waiting to be sent." };
  await logAuditEvent({ actor: await actor(), action: "newsletter_retry", targetTable: "newsletter_campaigns", targetId: id, newValue: `${requeued} requeued` });
  const outcome = await sendCampaign(id, await actor());
  revalidatePath("/admin/newsletter");
  revalidatePath(`/admin/newsletter/${id}`);
  return { success: true, outcome };
}

export type TestResult = ActionResult & { to?: string };

export async function sendTestAction(id: number, draft: unknown, toOverride?: string): Promise<TestResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!validId(id)) return { error: "Invalid campaign" };
  await ready();
  const clean = normalizeDraft(draft);
  const campaign = await getCampaign(id);
  if (!campaign) return { error: "No such campaign" };
  if (campaign.status === "draft") await saveCampaign(id, clean);
  const content = campaign.status === "draft" ? clean : campaign;
  if (!content.subject.trim()) return { error: "Write a subject line first." };
  if (content.blocks.length === 0) return { error: "Add something to the email first." };

  const who = await actor();
  const requested = String(toOverride ?? "").trim().toLowerCase();
  if (requested && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(requested)) {
    return { error: "That email address does not look right." };
  }
  const to = requested || who || BUSINESS.email;
  // No name on a test: the copy reads "there" wherever the token is, which
  // is exactly what a person with a thin row will get.
  const result = await sendTest(content, to, "");
  if (!result.ok) return { error: result.reason };
  await logAuditEvent({ actor: who, action: "newsletter_test", targetTable: "newsletter_campaigns", targetId: id, newValue: to });
  return { success: true, to };
}

/* ── Subscribers ────────────────────────────────────────────────────── */

export type ImportActionResult = ActionResult & {
  added?: number;
  existing?: number;
  duplicates?: number;
  skipped?: string[];
};

export async function importSubscribersAction(text: string): Promise<ImportActionResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  const raw = String(text ?? "");
  if (raw.length > 2_000_000) return { error: "That paste is over 2MB. Split it into a few smaller ones." };
  if (!raw.trim()) return { error: "Paste the list first." };
  await ready();
  const parsed = parseSubscriberList(raw);
  if (parsed.rows.length === 0) {
    return { error: "No email addresses were found in that paste.", skipped: parsed.skipped };
  }
  const result = await importSubscribers(parsed.rows);
  await logAuditEvent({
    actor: await actor(),
    action: "newsletter_import",
    targetTable: "newsletter_subscribers",
    newValue: `${result.added} added, ${result.existing} existing, ${parsed.skipped.length} skipped`,
  });
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin/newsletter/subscribers");
  return { success: true, ...result, duplicates: parsed.duplicates, skipped: parsed.skipped };
}

export async function addSubscriberAction(formData: FormData): Promise<ActionResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  const read = (key: string, max: number) => String(formData.get(key) ?? "").trim().slice(0, max);
  const email = read("email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return { error: "That email address does not look right." };
  await ready();
  const result = await importSubscribers(
    [{ email, firstName: read("firstName", 80), lastName: read("lastName", 80), company: read("company", 120) }],
    "manual",
  );
  if (result.added === 0) return { error: "That address is already on the list." };
  await logAuditEvent({ actor: await actor(), action: "newsletter_add", targetTable: "newsletter_subscribers", newValue: email });
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin/newsletter/subscribers");
  return { success: true };
}

export async function updateSubscriberAction(
  id: number,
  data: { firstName: string; lastName: string; company: string },
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!validId(id)) return { error: "Invalid subscriber" };
  await ready();
  await updateSubscriber(id, {
    firstName: String(data.firstName ?? "").trim().slice(0, 80),
    lastName: String(data.lastName ?? "").trim().slice(0, 80),
    company: String(data.company ?? "").trim().slice(0, 120),
  });
  revalidatePath("/admin/newsletter/subscribers");
  return { success: true };
}

/**
 * Moving somebody on or off the list by hand. Putting a person who
 * unsubscribed back on is allowed, because the owner may have been asked to
 * on the phone, but it is logged with a name against it.
 */
export async function setSubscriberStatusAction(id: number, status: SubscriberStatus): Promise<ActionResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!validId(id)) return { error: "Invalid subscriber" };
  if (!SUBSCRIBER_STATUSES.includes(status)) return { error: "Invalid status" };
  await ready();
  const who = await actor();
  await setSubscriberStatus(id, status, `Set by ${who ?? "the dashboard"}`);
  await logAuditEvent({ actor: who, action: "newsletter_status", targetTable: "newsletter_subscribers", targetId: id, newValue: status });
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin/newsletter/subscribers");
  return { success: true };
}

export async function removeSubscriberAction(id: number): Promise<ActionResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!validId(id)) return { error: "Invalid subscriber" };
  await ready();
  await removeSubscriber(id);
  await logAuditEvent({ actor: await actor(), action: "newsletter_remove", targetTable: "newsletter_subscribers", targetId: id });
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin/newsletter/subscribers");
  return { success: true };
}
