import { MARKET_ALT, MARKET_BACKGROUND, MARKET_CARDS } from "@/lib/og-cards";
import { OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";
import { ogResponse } from "@/lib/og-response";
import { MARKETS } from "@/lib/markets";

/* The four market pages share one photograph and change only the line on it,
   so somebody sharing /areas/madison posts a card that says Madison. They used
   to share the portfolio screenshot, which said "Our Best Work" and carried a
   dev-tools error badge. */
export const alt = MARKET_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return MARKETS.map((m) => ({ market: m.slug }));
}

export default async function Image({ params }: { params: Promise<{ market: string }> }) {
  const { market } = await params;
  const card = MARKET_CARDS[market];
  if (!card) {
    // A slug with no card would otherwise render a blank frame. The page
    // itself 404s for unknown markets; this matches it rather than shipping an
    // empty image.
    return new Response("Not found", { status: 404 });
  }
  return ogResponse({ ...card, background: MARKET_BACKGROUND });
}
