import { BUSINESS } from "@/lib/data";
import type { VimeoMeta } from "@/lib/vimeo";

/**
 * Structured data, in one place.
 *
 * Two audiences read this and they want the same thing. Google uses it to
 * decide whether a page earns a rich result, and the answer engines (ChatGPT
 * search, Perplexity, Google's AI overviews, Claude) use it because it is the
 * one part of a page that states facts without having to be read out of
 * marketing prose. Both reward the same discipline: say true things in a
 * shape a machine already understands.
 *
 * The rule throughout is that nothing here is invented. A video's upload date
 * and duration come from Vimeo, not from a plausible guess, because a wrong
 * uploadDate is worse than no VideoObject: Google treats fabricated structured
 * data as a reason to distrust the rest of it.
 */

/* The id the root layout already gave the business. Reused rather than
   replaced: two ids for one company would read as two companies. */
export const ORG_ID = `${BUSINESS.url}/#business`;
export const SITE_ID = `${BUSINESS.url}/#website`;

export type Json = Record<string, unknown>;

/** Renders a block. Kept here so no page hand writes a script tag. */
export function jsonLd(data: Json | Json[]): string {
  return JSON.stringify(data);
}

/* ── Breadcrumbs ──────────────────────────────────────────────────────
   Missing from every sub page. They are what turns a bare URL in a result
   into "pgcreativeswi.com > Services > Content Creator Program", and they
   tell an answer engine where a page sits rather than leaving it to guess
   from the path. */

export function breadcrumbs(trail: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BUSINESS.url}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

/* ── The site itself ──────────────────────────────────────────────────
   A WebSite node gives every other node something to hang off, and names
   the publisher once so each page does not have to repeat it. */

export function webSite(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    url: BUSINESS.url,
    name: BUSINESS.name,
    description: BUSINESS.description,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
  };
}

/* ── Video ────────────────────────────────────────────────────────────
   The largest gap on the site before this: two dozen videos for a company
   whose work IS video, and not one of them described in a way a search
   engine could index. Video carries its own results surface on Google and
   is quoted heavily by answer engines when somebody asks to see work. */

export type VideoInput = {
  title: string;
  category: string;
  vimeoId: string;
  meta: VimeoMeta;
};

/**
 * One video. Returns null when Vimeo did not answer, because uploadDate is
 * required and guessing one would be a lie told to a crawler.
 */
export function videoObject(v: VideoInput): Json | null {
  if (!v.meta.uploadDate) return null;

  return {
    "@type": "VideoObject",
    name: v.title,
    // Written from what the site already says about the piece. Vimeo's own
    // titles are client property addresses, which are not ours to publish.
    description: `${v.category} work by PG Creatives: ${v.title}. Produced in ${BUSINESS.locationText}.`,
    thumbnailUrl: [v.meta.thumbnail],
    uploadDate: v.meta.uploadDate,
    ...(v.meta.duration > 0 ? { duration: `PT${Math.round(v.meta.duration)}S` } : {}),
    embedUrl: `https://player.vimeo.com/video/${v.vimeoId}`,
    publisher: { "@id": ORG_ID },
    isFamilyFriendly: true,
    inLanguage: "en-US",
  };
}

/** A gallery of videos as one indexable list. */
export function videoGallery(videos: VideoInput[], pagePath: string, pageName: string): Json | null {
  const items = videos.map(videoObject).filter((v): v is Json => v !== null);
  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BUSINESS.url}${pagePath}#videos`,
    name: pageName,
    url: `${BUSINESS.url}${pagePath}`,
    isPartOf: { "@id": SITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((video, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: video,
      })),
    },
  };
}

/* ── People ───────────────────────────────────────────────────────────
   Ten named people with roles, described nowhere a machine could read
   them. Naming the team is how a business becomes an entity rather than a
   URL, which is most of what an answer engine is deciding when it picks
   whom to cite. */

export type PersonInput = { name: string; role: string; image?: string };

export function teamPage(people: PersonInput[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${BUSINESS.url}/team#about`,
    url: `${BUSINESS.url}/team`,
    name: "The PG Creatives team",
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: people.length,
      itemListElement: people.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Person",
          name: p.name,
          jobTitle: p.role,
          worksFor: { "@id": ORG_ID },
          ...(p.image ? { image: `${BUSINESS.url}${p.image}` } : {}),
        },
      })),
    },
  };
}

/* ── Services ─────────────────────────────────────────────────────────
   The offer catalogue on the organization says what is sold. A Service
   node says what each one IS, who it is for and where it is available,
   which is the question an answer engine is actually holding when
   somebody asks who shoots listings in Green Bay. */

export type ServiceInput = {
  name: string;
  description: string;
  path?: string;
};

const AREAS = [
  { "@type": "City", name: "Green Bay", addressRegion: "WI" },
  { "@type": "City", name: "Madison", addressRegion: "WI" },
  { "@type": "City", name: "Milwaukee", addressRegion: "WI" },
  { "@type": "Place", name: "Fox Valley", addressRegion: "WI" },
];

export function serviceList(services: ServiceInput[], pagePath: string, pageName: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BUSINESS.url}${pagePath}#services`,
    url: `${BUSINESS.url}${pagePath}`,
    name: pageName,
    isPartOf: { "@id": SITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: services.length,
      itemListElement: services.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          name: s.name,
          description: s.description,
          serviceType: s.name,
          provider: { "@id": ORG_ID },
          areaServed: AREAS,
          ...(s.path ? { url: `${BUSINESS.url}${s.path}` } : {}),
        },
      })),
    },
  };
}

/** A single service that has its own page. */
export function service(s: ServiceInput & { path: string }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${BUSINESS.url}${s.path}#service`,
    name: s.name,
    description: s.description,
    serviceType: s.name,
    provider: { "@id": ORG_ID },
    areaServed: AREAS,
    url: `${BUSINESS.url}${s.path}`,
    audience: {
      "@type": "Audience",
      audienceType: "Real estate agents and business owners in Wisconsin",
    },
  };
}

/* ── Contact ──────────────────────────────────────────────────────── */

export function contactPage(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${BUSINESS.url}/contact#contact`,
    url: `${BUSINESS.url}/contact`,
    name: "Contact PG Creatives",
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
    mainEntity: { "@id": ORG_ID },
  };
}
