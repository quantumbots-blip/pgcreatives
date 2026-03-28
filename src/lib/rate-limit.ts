import { headers } from "next/headers";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

/** Get the client IP from request headers. */
export async function getClientIp(): Promise<string> {
  const hdrs = await headers();
  return (
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Check + increment rate limit. Returns true if allowed, false if blocked.
 * Falls back to allowing the request if the database is unavailable.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMinutes: number
): Promise<boolean> {
  const sql = getDb();
  if (!sql) return true; // No DB = no rate limiting (don't block users)

  try {
    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key VARCHAR(255) PRIMARY KEY,
        attempts INTEGER DEFAULT 1,
        window_start TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Clean expired entries for this key
    await sql`
      DELETE FROM rate_limits
      WHERE key = ${key}
        AND window_start < NOW() - MAKE_INTERVAL(mins => ${windowMinutes})
    `;

    // Check current count
    const rows = await sql`SELECT attempts FROM rate_limits WHERE key = ${key}`;

    if (rows.length > 0 && Number(rows[0].attempts) >= maxAttempts) {
      return false; // Rate limited
    }

    // Upsert: increment or create
    await sql`
      INSERT INTO rate_limits (key, attempts, window_start)
      VALUES (${key}, 1, NOW())
      ON CONFLICT (key)
      DO UPDATE SET attempts = rate_limits.attempts + 1
    `;

    return true;
  } catch {
    // If rate limiting fails, allow the request (don't block legitimate users)
    return true;
  }
}
