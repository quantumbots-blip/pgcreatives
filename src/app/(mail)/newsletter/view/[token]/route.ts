import { NextRequest, NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db";
import { ensureNewsletterSchema, getCampaignByPublicToken } from "@/lib/newsletter/db";
import { renderNewsletterHtml } from "@/lib/newsletter/render";
import { postalAddress, viewUrl } from "@/lib/newsletter/send";

/**
 * "View in a browser". The same HTML the inbox got, served as a page, for
 * the clients that mangle it. Only campaigns that have actually gone out
 * are visible here; a draft has no public copy. The unsubscribe link on
 * this copy goes to the preview explainer, since a shared link must not
 * carry anybody's personal token.
 */

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  try {
    await ensureSchema();
    await ensureNewsletterSchema();
    const campaign = await getCampaignByPublicToken(token);
    if (!campaign || campaign.status === "draft") {
      return new NextResponse("Not found", { status: 404 });
    }
    const html = renderNewsletterHtml(
      { subject: campaign.subject, preheader: campaign.preheader, blocks: campaign.blocks },
      { viewUrl: viewUrl(campaign.public_token), postalAddress: postalAddress() },
    );
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[newsletter view] failed:", (err as Error).message);
    return new NextResponse("Something went wrong", { status: 500 });
  }
}
