import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCode,
  googleConfigured,
  isAllowed,
  allowedEmails,
  statesMatch,
  STATE_COOKIE,
  VERIFIER_COOKIE,
} from "@/lib/google-auth";
import { createSessionToken, createSession } from "@/lib/auth";
import { logAuditEvent } from "@/lib/db";

/** Where Google sends them back. Everything is checked before a session exists. */
export const dynamic = "force-dynamic";

function fail(request: NextRequest, reason: string) {
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("error", reason);
  const response = NextResponse.redirect(url);
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(VERIFIER_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  if (!googleConfigured()) return fail(request, "not_configured");

  const url = new URL(request.url);
  const params = url.searchParams;

  // Google says so when somebody hits cancel on the account chooser.
  if (params.get("error")) return fail(request, "denied");

  const code = params.get("code");
  const state = params.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const verifier = request.cookies.get(VERIFIER_COOKIE)?.value;

  if (!code || !state || !expectedState || !verifier || !statesMatch(state, expectedState)) {
    return fail(request, "bad_state");
  }

  const result = await exchangeCode(code, verifier, url.origin);
  if (!result.ok) return fail(request, result.reason);

  const { email, name } = result.identity;

  /* Fail closed. Google being switched on with nobody named would otherwise
     mean every Google account on earth opens the dashboard. */
  if (allowedEmails().length === 0) return fail(request, "no_allowlist");
  if (!isAllowed(email)) {
    await logAuditEvent({ action: "sign_in_refused", newValue: email });
    return fail(request, "not_allowed");
  }

  const token = createSessionToken();
  await createSession(token, email);
  await logAuditEvent({ action: "sign_in", newValue: name ? `${name} <${email}>` : email });

  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: url.protocol === "https:",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(VERIFIER_COOKIE);
  return response;
}
