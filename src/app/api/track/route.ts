import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ensurePageViewsTable, recordPageView } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

// Use env var with no hardcoded fallback — generate random salt per server
// instance if missing so analytics still works but the salt isn't predictable.
/* The salt has to be stable or the visitor count is fiction.
   It was never set, so every deploy minted a new random one and the same
   person counted as a new visitor from then on. That is why the table held
   5,025 "visitors" against 8,497 views: 1.7 views each, which no real site
   produces. Keeping the random fallback for the case where it is genuinely
   absent, since a rotating salt is still better for privacy than a constant
   nobody chose, but the warning now says what it costs. */
const SALT = (() => {
  if (process.env.ANALYTICS_SALT) return process.env.ANALYTICS_SALT;
  const fallback = crypto.randomUUID();
  console.warn(
    "[track] ANALYTICS_SALT is missing. Visitor hashes reset on every deploy, " +
      "so unique visitor counts will be inflated. Set it to a random 32+ character string.",
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

  // Local development runs on whatever port is free; don't 403 every page
  // view in the console because it isn't 3000.
  if (
    process.env.NODE_ENV !== "production" &&
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(check)
  ) {
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
    // Ignore self-referrals, and anything that is us working on the site.
    if (
      url.hostname === "pgcreativeswi.com" ||
      url.hostname === "www.pgcreativeswi.com" ||
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
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
    /* Only the live site is counted.
       Every environment points at the same Neon database, so a local dev
       session and every preview deployment were writing straight into the
       owner's analytics. It showed: "localhost" was the fourth largest
       referrer on the site with 868 views, and the first hit of each local
       session, having no referrer, was landing in the same bucket as a real
       visitor arriving direct. Recording nothing outside production is the
       only reliable line, since the database cannot tell us who wrote a row. */
    if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
      return NextResponse.json({ ok: true });
    }
    if (!process.env.VERCEL_ENV && process.env.NODE_ENV !== "production") {
      return NextResponse.json({ ok: true });
    }

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
