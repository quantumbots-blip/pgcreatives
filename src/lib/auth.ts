import crypto from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";

/** Create an HMAC-signed session token (token.signature). */
export function createSessionToken(): string {
  const token = crypto.randomUUID();
  const sig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(token)
    .digest("hex");
  return `${token}.${sig}`;
}

/** Verify that a cookie value is a valid signed session token. */
export function verifySessionToken(cookie: string): boolean {
  if (!SESSION_SECRET) return false;

  const dotIndex = cookie.indexOf(".");
  if (dotIndex === -1) return false;

  const token = cookie.slice(0, dotIndex);
  const sig = cookie.slice(dotIndex + 1);
  if (!token || !sig) return false;

  const expected = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(token)
    .digest("hex");

  if (sig.length !== expected.length) return false;

  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

/** Timing-safe password comparison. */
export function verifyPassword(input: string, expected: string): boolean {
  if (!input || !expected) return false;

  // Pad to equal length for timingSafeEqual
  const maxLen = Math.max(input.length, expected.length);
  const a = Buffer.alloc(maxLen, 0);
  const b = Buffer.alloc(maxLen, 0);
  Buffer.from(input).copy(a);
  Buffer.from(expected).copy(b);

  // Check both length match AND content match (constant time)
  return input.length === expected.length && crypto.timingSafeEqual(a, b);
}
