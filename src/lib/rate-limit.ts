import { headers } from "next/headers";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// ── In-memory fallback rate limiter ──────────────────────────────────
const memoryStore = new Map<string, { count: number; resetAt: number }>();
let memoryCallCount = 0;

function memoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  memoryCallCount++;

  // Periodic cleanup: every 100th call, remove expired entries
  if (memoryCallCount % 100 === 0) {
    const now = Date.now();
    for (const [k, entry] of memoryStore) {
      if (now > entry.resetAt) {
        memoryStore.delete(k);
      }
    }
  }

  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }
  if (entry.count >= limit) return false; // blocked
  entry.count++;
  return true; // allowed
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
 * Falls back to in-memory rate limiting if the database is unavailable.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMinutes: number
): Promise<boolean> {
  const windowMs = windowMinutes * 60 * 1000;
  const sql = getDb();

  if (!sql) {
    // No DB configured — use in-memory fallback instead of allowing all
    return memoryRateLimit(key, maxAttempts, windowMs);
  }

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
  } catch (err) {
    console.error("[rate-limit] DB error, falling back to in-memory limiter:", err);
    // DB is down — use in-memory fallback instead of failing open
    return memoryRateLimit(key, maxAttempts, windowMs);
  }
}
