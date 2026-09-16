import { cardFor } from "@/lib/og-cards";
import { OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";
import { ogResponse } from "@/lib/og-response";

const card = cardFor("team");

export const alt = card.alt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogResponse({ ...card, background: card.crop.out });
}
