import type { Metadata } from "next";

/**
 * Per-route Open Graph and Twitter metadata.
 *
 * Next merges `metadata` objects shallowly: a child that declares its own
 * `openGraph` replaces the parent's entirely, and a child that declares none
 * inherits the parent's wholesale. Both halves of that bit us — every
 * sub-route shipped the home page's `twitter:title` and `twitter:image`
 * (share /portfolio and you got the home card), while `og:type` and
 * `og:site_name` vanished from all six because their own `openGraph` object
 * did not restate them. `og:type` is a required Open Graph property.
 *
 * Building both blocks from one call is what keeps them in step.
 *
 * Neither block names an image. Each route segment ships an
 * `opengraph-image.tsx` instead, and Next fills in og:image, its dimensions,
 * its alt text and twitter:image from that one file. Naming an image here as
 * well would win over the generated card and pin every page back to a static
 * JPEG in public/.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** Route path, e.g. "/portfolio". Used for canonical and og:url. */
  path: string;
}): Metadata {
  const ogTitle = `${title} | PG Creatives`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "PG Creatives",
      title: ogTitle,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}
