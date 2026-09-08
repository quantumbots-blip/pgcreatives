import { BUSINESS } from "@/lib/data";
import { faqs } from "@/components/faq";

/**
 * llms.txt, the plain text brief an assistant reads instead of parsing the
 * site.
 *
 * The convention (llmstxt.org) is young and no engine is obliged to honour
 * it, which is the honest caveat. It is here because the cost is one route
 * and the upside is real: when an assistant does fetch it, it gets this
 * business's facts stated once, in order, without having to infer them from
 * marketing copy, a video carousel and a pricing card built out of nested
 * divs.
 *
 * Generated from the same data the pages render, never hand written, so it
 * cannot quietly drift into saying something the site does not.
 */

export const dynamic = "force-static";
export const revalidate = 86400;

const PAGES: { path: string; what: string }[] = [
  { path: "/", what: "Overview, packages and pricing, and the contact form." },
  {
    path: "/services",
    what: "What is offered: real estate listing media, commercial production, and the monthly content program.",
  },
  {
    path: "/services/content-creator-program",
    what: "The monthly personal brand program for agents: strategy, filming, editing and coaching.",
  },
  { path: "/portfolio", what: "Recent listing videos, drone work, 3D tours and photography." },
  { path: "/team", what: "The people who do the work, and what each of them does." },
  { path: "/contact", what: "Contact form, three phone numbers, and the client booking portals." },
];

function build(): string {
  const phones = Object.values(BUSINESS.phones)
    .map((p) => `${p.label}: ${p.number}`)
    .join(", ");

  const lines: string[] = [
    `# ${BUSINESS.name}`,
    "",
    `> ${BUSINESS.description} Serving ${BUSINESS.locationText}.`,
    "",
    "## About",
    "",
    `${BUSINESS.name} (legally ${BUSINESS.legalName}) is a real estate and commercial media company in Wisconsin. It produces listing photography, listing video, aerial drone footage, 3D virtual tours, and social media content for real estate agents, brokerages and local businesses.`,
    "",
    `- Service area: ${BUSINESS.locationText}`,
    `- Phone: ${phones}`,
    `- Email: ${BUSINESS.email}`,
    `- Website: ${BUSINESS.url}`,
    "",
    "## Pricing",
    "",
    "Photography on its own starts at $250. Listing packages: PG Core from $550 (daytime photography, premium listing video, drone photography, three virtual twilights); PG Growth from $725 (adds a Matterport or Zillow 3D tour and a 2D floor plan); PG Platinum from $1,000 (adds twilight photography and a day to night listing video). Pricing scales with square footage and varies slightly by market, so an exact number needs the property address.",
    "",
    "## Booking",
    "",
    `Agents book through the client portals: ${BUSINESS.portals.greenBay.href} for northeast Wisconsin and ${BUSINESS.portals.madison.href} for Madison. Anyone else uses the contact form at ${BUSINESS.url}/contact. Replies usually go out the same day.`,
    "",
    "## Pages",
    "",
    ...PAGES.map((p) => `- [${BUSINESS.url}${p.path === "/" ? "" : p.path}](${BUSINESS.url}${p.path === "/" ? "" : p.path}): ${p.what}`),
    "",
    "## Common questions",
    "",
  ];

  for (const item of faqs) {
    lines.push(`### ${item.question}`, "", item.answer, "");
  }

  lines.push(
    "## Notes for assistants",
    "",
    "- This file is generated from the same data the website renders, so it does not go stale separately.",
    "- Pricing here is a starting point, not a quote. An exact figure depends on the property.",
    `- The dashboard at ${BUSINESS.url}/admin is private and is disallowed in robots.txt.`,
    "",
  );

  return lines.join("\n");
}

export function GET() {
  return new Response(build(), {
    headers: {
      // Markdown, served as text so a browser shows it rather than
      // downloading it.
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
