import crypto from "crypto";

/**
 * A signed timestamp the contact form collects before it will submit.
 *
 * It answers one question the form otherwise cannot: was this typed by a
 * person sitting on the page, or posted straight at the server action? A
 * browser fetches a token when the form mounts and sends it back with the
 * message, so the gap between the two is the time somebody spent filling the
 * form in. A script that skips the page has no token to send.
 *
 * The token is issued on request rather than baked into the page because both
 * pages holding the form are cached, and a token stamped at cache time would
 * measure the age of the cache entry rather than of the visit.
 */

const MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours. Long enough to write a paragraph.

function getSecret(): string | null {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/** Issue a token. Returns null when no secret is configured. */
export function issueFormToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt, secret)}`;
}

export type TokenCheck =
  /** Seconds the visitor spent on the form. */
  | { state: "valid"; fillSeconds: number }
  /** No token, or one we cannot trust. Treated as a signal, not a rejection. */
  | { state: "missing" }
  /** We have no secret to verify against, so this tells us nothing either way. */
  | { state: "unverifiable" };

export function checkFormToken(raw: string | null | undefined): TokenCheck {
  const secret = getSecret();
  if (!secret) return { state: "unverifiable" };
  if (!raw) return { state: "missing" };

  const dot = raw.indexOf(".");
  if (dot === -1) return { state: "missing" };

  const issuedAt = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!/^\d{10,16}$/.test(issuedAt) || !/^[a-f0-9]{64}$/.test(sig)) {
    return { state: "missing" };
  }

  const expected = sign(issuedAt, secret);
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return { state: "missing" };
  }

  const age = Date.now() - Number(issuedAt);
  // A negative age means a clock skewed forward, an age past the window means
  // a token being replayed. Neither is a browser that just loaded the form.
  if (age < 0 || age > MAX_AGE_MS) return { state: "missing" };

  return { state: "valid", fillSeconds: age / 1000 };
}
