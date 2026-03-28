"use server";

import { cookies } from "next/headers";
import { updateSubmissionStatus, logAuditEvent } from "@/lib/db";
import type { SubmissionStatus } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { verifySessionToken } from "@/lib/auth";

export async function updateStatusAction(id: number, status: SubmissionStatus) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session || !verifySessionToken(session.value)) {
    return { error: "Unauthorized" };
  }

  // Validate inputs
  const validStatuses: SubmissionStatus[] = ["new", "contacted", "booked", "archived"];
  if (!validStatuses.includes(status)) {
    return { error: "Invalid status" };
  }

  if (!Number.isInteger(id) || id <= 0) {
    return { error: "Invalid submission ID" };
  }

  await updateSubmissionStatus(id, status);

  // Audit log
  await logAuditEvent({
    action: "update_status",
    targetTable: "submissions",
    targetId: id,
    newValue: status,
  });

  revalidatePath("/admin");
  return { success: true };
}
