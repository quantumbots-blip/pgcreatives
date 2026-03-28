import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ensurePageViewsTable, recordPageView } from "@/lib/db";

const SALT = process.env.ANALYTICS_SALT || "pgc-analytics-2024";

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
