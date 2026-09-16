import { cardFor } from "@/lib/og-cards";
import { OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";
import { ogResponse } from "@/lib/og-response";

/* The privacy policy shares the home card rather than getting its own
   photograph, but it has to declare the file itself. Next merges metadata
   shallowly, so this page's own `openGraph` block (from pageMetadata) replaces
   the parent's wholesale — including the image the parent's opengraph-image.tsx
   put there. Without this file the page ships with no og:image at all, which
   is exactly what it did on the first pass of this change. */
const card = cardFor("home");

export const alt = card.alt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogResponse({ ...card, background: card.crop.out });
}
