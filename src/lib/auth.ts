import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * SESSION_SECRET should be a random 64+ character string.
 * Generate one with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
 */
const _secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
if (!_secret) {
  throw new Error(
    "Missing SESSION_SECRET (or ADMIN_PASSWORD as fallback). " +
      "Set SESSION_SECRET to a random 64+ character string in your environment.",
  );
}
const SESSION_SECRET: string = _secret;

/** Create an HMAC-signed session token (token.signature). */
export function createSessionToken(): string {
  const token = crypto.randomUUID();
  const sig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(token)
    .digest("hex");
  return `${token}.${sig}`;
}

/** Verify that a cookie value is a valid signed session token (HMAC check only). */
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

/**
 * Verify a password against the stored hash or plaintext fallback.
 *
 * Preferred: set ADMIN_PASSWORD_HASH (bcrypt hash).
 * Fallback:  set ADMIN_PASSWORD (plaintext, for backward compat during migration).
 */
export function verifyPassword(input: string): boolean {
  if (!input) return false;

  // Preferred path: bcrypt hash comparison
  const hashedPassword = process.env.ADMIN_PASSWORD_HASH;
  if (hashedPassword) {
    return bcrypt.compareSync(input, hashedPassword);
  }

  // Fallback: timing-safe comparison against plaintext ADMIN_PASSWORD
  const plainPassword = process.env.ADMIN_PASSWORD;
  if (!plainPassword) return false;

  const maxLen = Math.max(input.length, plainPassword.length);
  const a = Buffer.alloc(maxLen, 0);
  const b = Buffer.alloc(maxLen, 0);
  Buffer.from(input).copy(a);
  Buffer.from(plainPassword).copy(b);

  return input.length === plainPassword.length && crypto.timingSafeEqual(a, b);
}

/** Utility: generate a bcrypt hash for a password (cost factor 12). */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

// ── Session revocation (database-backed) ──

/** Hash a session token for storage (never store raw tokens). */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Store a session token hash in the database sessions table.
 * Expires after 4 hours (matches cookie maxAge).
 */
export async function createSession(token: string): Promise<void> {
  try {
    const { getDb } = await import("@/lib/db");
    const sql = getDb();
    const tokenHash = hashToken(token);
    await sql`
      INSERT INTO sessions (token_hash, expires_at)
      VALUES (${tokenHash}, NOW() + INTERVAL '4 hours')
    `;
  } catch {
    // If DB is unavailable, session still works via HMAC-only verification
  }
}

/** Delete a session from the database (logout / revocation). */
export async function revokeSession(token: string): Promise<void> {
  try {
    const { getDb } = await import("@/lib/db");
    const sql = getDb();
    const tokenHash = hashToken(token);
    await sql`DELETE FROM sessions WHERE token_hash = ${tokenHash}`;
  } catch {
    // If DB is unavailable, cookie deletion still logs the user out
  }
}

/** Check whether a session token exists and has not expired in the database. */
export async function isSessionValid(token: string): Promise<boolean> {
  try {
    const { getDb } = await import("@/lib/db");
    const sql = getDb();
    const tokenHash = hashToken(token);
    const rows = await sql`
      SELECT 1 FROM sessions
      WHERE token_hash = ${tokenHash} AND expires_at > NOW()
      LIMIT 1
    `;
    return rows.length > 0;
  } catch {
    // If DB is unavailable, fall back to HMAC-only (return true so caller uses HMAC result)
    return true;
  }
}

/**
 * Full session verification: HMAC signature + database validity.
 * Falls back to HMAC-only if the database is unavailable.
 */
export async function verifySessionFull(cookie: string): Promise<boolean> {
  if (!verifySessionToken(cookie)) return false;
  return isSessionValid(cookie);
}
