import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ensurePageViewsTable, recordPageView } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

// Use env var with no hardcoded fallback — generate random salt per server
// instance if missing so analytics still works but the salt isn't predictable.
const SALT = (() => {
  if (process.env.ANALYTICS_SALT) return process.env.ANALYTICS_SALT;
  const fallback = crypto.randomUUID();
  console.warn(
    "[track] ANALYTICS_SALT env var is missing — using random per-instance salt. Analytics visitor hashes will not be stable across deploys.",
  );
  return fallback;
})();

const ALLOWED_ORIGINS = [
  "https://pgcreativeswi.com",
  "https://www.pgcreativeswi.com",
  "http://localhost:3000",
];

if (process.env.NEXT_PUBLIC_SITE_URL) {
  ALLOWED_ORIGINS.push(process.env.NEXT_PUBLIC_SITE_URL);
}

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const check = origin || referer;

  if (!check) {
    // No origin or referer — could be server-side, deny to be safe
    return false;
  }

  // Allow known origins
  if (ALLOWED_ORIGINS.some((allowed) => check.startsWith(allowed))) {
    return true;
  }

  // Allow Vercel preview deployments
  try {
    const hostname = new URL(check).hostname;
    if (hostname.endsWith(".vercel.app")) return true;
  } catch {
    // invalid URL, fall through
  }

  return false;
}

function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(`${SALT}:${ip}`).digest("hex");
}

function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|opera m(ob|in)/i.test(ua))
    return "mobile";
  return "desktop";
}

function extractDomain(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    // Ignore self-referrals
    if (
      url.hostname === "pgcreativeswi.com" ||
      url.hostname === "www.pgcreativeswi.com" ||
      url.hostname.endsWith(".vercel.app")
    )
      return null;
    return url.hostname;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Origin validation
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const path = String(body.path || "/").slice(0, 500);

    // Skip admin and api paths
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Rate limit: 30 requests per minute per IP for analytics tracking
    const allowed = await checkRateLimit(`track:${ip}`, 30, 1);
    if (!allowed) {
      return NextResponse.json({ ok: true }); // Silently accept but don't record
    }

    const ua = request.headers.get("user-agent") || "";
    const rawReferrer = body.referrer || request.headers.get("referer");

    const visitorHash = hashIP(ip);
    const device = detectDevice(ua);
    const referrer = extractDomain(rawReferrer);

    await ensurePageViewsTable();
    await recordPageView({ path, referrer, device, visitorHash });

    return NextResponse.json({ ok: true });
  } catch {
    // Analytics should never return errors to the client
    return NextResponse.json({ ok: true });
  }
}
