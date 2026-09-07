import { NextResponse } from "next/server";
import { issueFormToken } from "@/lib/form-token";

/**
 * Hands the contact form a signed timestamp when it mounts. See
 * src/lib/form-token.ts for why this is a request rather than a value baked
 * into the page.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const token = issueFormToken();

  return NextResponse.json(
    { token },
    {
      headers: {
        // Never cached anywhere. A shared token measures the age of a cache
        // entry, which is the exact thing this is meant to avoid.
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
