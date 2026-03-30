"use server";

import { cookies } from "next/headers";
import { createSessionToken, verifyPassword, createSession, revokeSession } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export type AuthState = { success: boolean; error: string | null };

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const ip = await getClientIp();

  // Rate limit: 5 attempts per 15 minutes per IP
  const allowed = await checkRateLimit(`login:${ip}`, 5, 15);
  if (!allowed) {
    return {
      success: false,
      error: "Too many login attempts. Please try again in 15 minutes.",
    };
  }

  const password = String(formData.get("password") ?? "").trim();
  if (!verifyPassword(password)) {
    return { success: false, error: "Incorrect password." };
  }

  const token = createSessionToken();

  // Store session in DB for revocation support
  await createSession(token);

  const cookieStore = await cookies();
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 4, // 4 hours
    path: "/",
  });

  return { success: true, error: null };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  // Revoke session in DB before deleting the cookie
  if (session?.value) {
    await revokeSession(session.value);
  }

  cookieStore.delete("admin_session");
}
