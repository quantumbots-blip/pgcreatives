"use server";

import { cookies } from "next/headers";
import { updateSubmissionStatus } from "@/lib/db";
import type { SubmissionStatus } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateStatusAction(id: number, status: SubmissionStatus) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session || session.value !== "authenticated") {
    return { error: "Unauthorized" };
  }

  await updateSubmissionStatus(id, status);
  revalidatePath("/admin");
  return { success: true };
}
