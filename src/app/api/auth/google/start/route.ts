import { NextRequest, NextResponse } from "next/server";
import { beginHandshake, googleConfigured, STATE_COOKIE, VERIFIER_COOKIE } from "@/lib/google-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/** Sends the visitor to Google, holding the two secrets that prove the reply belongs here. */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // The same ceiling the password form has. Starting a handshake is cheap,
  // but it is still a door somebody can knock on repeatedly.
  const ip = await getClientIp();
  if (!(await checkRateLimit(`google-start:${ip}`, 10, 15))) {
    return NextResponse.redirect(new URL("/admin/login?error=rate_limited", request.url));
  }

  const origin = new URL(request.url).origin;
  const { url, state, verifier } = beginHandshake(origin);

  const response = NextResponse.redirect(url);
  /* sameSite lax, not strict: these have to survive the top level redirect
     back from accounts.google.com, and strict would drop them exactly then.
     Ten minutes is long enough to pick an account and short enough that a
     stale attempt cannot be replayed later. */
  const options = {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/",
  };
  response.cookies.set(STATE_COOKIE, state, options);
  response.cookies.set(VERIFIER_COOKIE, verifier, options);
  return response;
}
