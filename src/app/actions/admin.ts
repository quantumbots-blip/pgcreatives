"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  updateSubmissionStatus,
  updateSubmissionNotes,
  setSubmissionSpam,
  deleteSubmission,
  deleteAllSpam,
  logAuditEvent,
} from "@/lib/db";
import type { SubmissionStatus } from "@/lib/db";
import { verifySessionFull } from "@/lib/auth";

export type ActionResult = { success?: true; error?: string };

const VALID_STATUSES: SubmissionStatus[] = ["new", "contacted", "booked", "archived"];

/**
 * Every action below goes through this. Verifies the signed cookie *and* that
 * the session still exists in the database, so signing out actually ends the
 * session instead of only dropping the cookie on one device.
 */
async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) return false;
  return verifySessionFull(session.value);
}

function validId(id: unknown): id is number {
  return Number.isInteger(id) && (id as number) > 0;
}

/** Ids are only ever accepted in bounded batches, from the table's own rows. */
function validIds(ids: unknown): ids is number[] {
  return Array.isArray(ids) && ids.length > 0 && ids.length <= 200 && ids.every(validId);
}

export async function updateStatusAction(
  id: number,
  status: SubmissionStatus,
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!VALID_STATUSES.includes(status)) return { error: "Invalid status" };
  if (!validId(id)) return { error: "Invalid submission ID" };

  await updateSubmissionStatus(id, status);
  await logAuditEvent({
    action: "update_status",
    targetTable: "submissions",
    targetId: id,
    newValue: status,
  });

  revalidatePath("/admin");
  return { success: true };
}

/** Bulk status change from the table's selection checkboxes. */
export async function bulkStatusAction(
  ids: number[],
  status: SubmissionStatus,
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!VALID_STATUSES.includes(status)) return { error: "Invalid status" };
  if (!validIds(ids)) return { error: "Invalid selection" };

  for (const id of ids) await updateSubmissionStatus(id, status);
  await logAuditEvent({
    action: "bulk_update_status",
    targetTable: "submissions",
    newValue: `${status} x${ids.length}`,
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function saveNotesAction(id: number, notes: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!validId(id)) return { error: "Invalid submission ID" };

  await updateSubmissionNotes(id, String(notes ?? "").slice(0, 4000));
  await logAuditEvent({ action: "save_notes", targetTable: "submissions", targetId: id });

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Move a lead into or out of quarantine. "Not spam" is the escape hatch that
 * makes automatic filtering safe to run at all, so it is a single tap and it
 * is never hidden behind a confirmation.
 */
export async function markSpamAction(id: number, isSpam: boolean): Promise<ActionResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!validId(id)) return { error: "Invalid submission ID" };

  await setSubmissionSpam(id, isSpam);
  await logAuditEvent({
    action: isSpam ? "mark_spam" : "mark_not_spam",
    targetTable: "submissions",
    targetId: id,
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function bulkSpamAction(ids: number[], isSpam: boolean): Promise<ActionResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!validIds(ids)) return { error: "Invalid selection" };

  for (const id of ids) await setSubmissionSpam(id, isSpam);
  await logAuditEvent({
    action: isSpam ? "bulk_mark_spam" : "bulk_mark_not_spam",
    targetTable: "submissions",
    newValue: `x${ids.length}`,
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteSubmissionAction(id: number): Promise<ActionResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!validId(id)) return { error: "Invalid submission ID" };

  await deleteSubmission(id);
  await logAuditEvent({ action: "delete_submission", targetTable: "submissions", targetId: id });

  revalidatePath("/admin");
  return { success: true };
}

/** Empties the Spam tab. Irreversible, so the UI asks first. */
export async function emptySpamAction(): Promise<ActionResult & { deleted?: number }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const deleted = await deleteAllSpam();
  await logAuditEvent({
    action: "empty_spam",
    targetTable: "submissions",
    newValue: `${deleted} deleted`,
  });

  revalidatePath("/admin");
  return { success: true, deleted };
}
