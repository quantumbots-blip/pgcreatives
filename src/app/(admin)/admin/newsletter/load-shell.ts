import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionFull, getSessionEmail } from "@/lib/auth";
import { ensureSchema, getSubmissions } from "@/lib/db";
import { ensureNewsletterSchema } from "@/lib/newsletter/db";

/**
 * What every newsletter page needs before it draws anything: a signed in
 * session, the schema in place, and the number the navigation shows.
 * Server only; the chips and formatters that client components share live
 * in shared.tsx, which imports nothing from next/headers.
 */
export async function loadShell() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || !(await verifySessionFull(session.value))) {
    redirect("/admin/login");
  }
  const signedInAs = await getSessionEmail(session.value);

  let waiting = 0;
  let dbError = false;
  try {
    await ensureSchema();
    await ensureNewsletterSchema();
    const subs = await getSubmissions();
    waiting = subs.filter((s) => (s.status || "new") === "new" || s.follow_up_due).length;
  } catch {
    dbError = true;
  }
  return { signedInAs, waiting, dbError };
}
