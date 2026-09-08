import crypto from "crypto";
import { BUSINESS } from "@/lib/data";

/**
 * Signing in with a Google account instead of a shared password.
 *
 * Written by hand rather than pulled in from an auth library, because this
 * site already has the half that matters: a signed session cookie backed by a
 * revocable row in the database. An auth framework would replace that working
 * machinery to solve the one part that is genuinely small, which is the
 * OAuth handshake below.
 *
 * Dormant until the keys exist. With no client id and secret the password
 * keeps working exactly as it did, so configuring this is something the owner
 * does when he is ready, not something that can lock him out on deploy.
 *
 * Once configured the password stops working entirely. Leaving both on would
 * mean an attacker simply uses the weaker one, which cancels out most of what
 * Google buys.
 */

const AUTHORIZE = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN = "https://oauth2.googleapis.com/token";
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

export const STATE_COOKIE = "g_state";
export const VERIFIER_COOKIE = "g_verifier";

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * The accounts allowed in. Empty means nobody: if Google is switched on but
 * no list is given, this refuses everyone rather than admitting anyone with a
 * Google account, which is every person on earth.
 */
export function allowedEmails(): string[] {
  return (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowed(email: string): boolean {
  return allowedEmails().includes(email.trim().toLowerCase());
}

/**
 * Must match a redirect URI registered in the Google console character for
 * character. Derived from the request's own origin so localhost and the live
 * site each send the right one, rather than a build time guess.
 */
export function redirectUri(origin: string): string {
  return `${origin}/api/auth/google/callback`;
}

/** Canonical origin, used when nothing better is available. */
export const SITE_ORIGIN = BUSINESS.url;

const b64url = (buf: Buffer) => buf.toString("base64url");

export type Handshake = {
  url: string;
  state: string;
  verifier: string;
};

/**
 * Builds the URL the visitor is sent to, and the two secrets that prove the
 * reply belongs to this attempt.
 *
 * `state` defends the callback against a forged request. PKCE defends the
 * code itself: the verifier never leaves this server, so an intercepted code
 * cannot be exchanged by anybody else.
 */
export function beginHandshake(origin: string): Handshake {
  const state = b64url(crypto.randomBytes(24));
  const verifier = b64url(crypto.randomBytes(48));
  const challenge = b64url(crypto.createHash("sha256").update(verifier).digest());

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    // Ask every time rather than silently reusing whichever account the
    // browser happens to be signed into.
    prompt: "select_account",
  });

  return { url: `${AUTHORIZE}?${params}`, state, verifier };
}

export type GoogleIdentity = { email: string; name: string | null; picture: string | null };

export type ExchangeResult =
  | { ok: true; identity: GoogleIdentity }
  | { ok: false; reason: string };

/** Constant time compare for the state, which an attacker supplies. */
export function statesMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Trades the code for the identity behind it.
 *
 * The id token's signature is not checked, deliberately. It arrives in the
 * body of a TLS request this server made directly to Google's token endpoint,
 * so the channel already proves where it came from; Google's own guidance
 * says verification is for tokens received from elsewhere. What is checked is
 * everything the channel cannot vouch for: that the token is for this client,
 * from the expected issuer, unexpired, and for an address Google says it has
 * verified.
 */
export async function exchangeCode(code: string, verifier: string, origin: string): Promise<ExchangeResult> {
  if (!googleConfigured()) return { ok: false, reason: "not_configured" };

  let payload: Record<string, unknown>;
  try {
    const res = await fetch(TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri(origin),
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
    });

    if (!res.ok) {
      console.error("[google-auth] token exchange failed:", res.status, await res.text());
      return { ok: false, reason: "exchange_failed" };
    }

    const body = (await res.json()) as { id_token?: string };
    if (!body.id_token) return { ok: false, reason: "no_id_token" };

    const parts = body.id_token.split(".");
    if (parts.length !== 3) return { ok: false, reason: "malformed_id_token" };
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch (err) {
    console.error("[google-auth] token exchange threw:", (err as Error).message);
    return { ok: false, reason: "exchange_failed" };
  }

  const { iss, aud, exp, email, email_verified, name, picture } = payload as {
    iss?: string;
    aud?: string;
    exp?: number;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };

  if (!iss || !ISSUERS.includes(iss)) return { ok: false, reason: "bad_issuer" };
  if (aud !== process.env.GOOGLE_CLIENT_ID) return { ok: false, reason: "bad_audience" };
  if (!exp || exp * 1000 < Date.now()) return { ok: false, reason: "expired" };
  if (!email) return { ok: false, reason: "no_email" };
  // An unverified address can be anybody's claim about an inbox they do not own.
  if (email_verified !== true) return { ok: false, reason: "unverified_email" };

  return {
    ok: true,
    identity: { email, name: name ?? null, picture: picture ?? null },
  };
}

/** Owner facing wording for a sign in that did not work. */
export const FAILURE_MESSAGE: Record<string, string> = {
  not_configured: "Google sign in is not set up yet.",
  bad_state: "That sign in attempt expired or did not start here. Try again.",
  exchange_failed: "Google could not confirm that sign in. Try again.",
  no_id_token: "Google did not return an identity. Try again.",
  malformed_id_token: "Google returned something unreadable. Try again.",
  bad_issuer: "That identity did not come from Google.",
  bad_audience: "That identity was issued for a different app.",
  expired: "That sign in took too long. Try again.",
  no_email: "That Google account has no email address on it.",
  unverified_email: "That Google account's email address is not verified.",
  not_allowed: "That account is not on the list of people who can open this dashboard.",
  no_allowlist: "No accounts are allowed in yet. Set ADMIN_ALLOWED_EMAILS.",
  denied: "Sign in was cancelled.",
};
