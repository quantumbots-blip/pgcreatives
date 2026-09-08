import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/page-head";
import { BUSINESS } from "@/lib/data";
import { MARKETS } from "@/lib/markets";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbs, jsonLd, ORG_ID, SITE_ID } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Areas We Cover",
    description:
      "Where PG Creatives shoots: Green Bay and the northeast, the Fox Valley and lake country, Madison, and Milwaukee. Local numbers for each.",
    path: "/areas",
    image: "/og-portfolio.jpg",
    imageAlt: "The Wisconsin markets PG Creatives covers",
  }),
  keywords: [
    "real estate photographer Wisconsin",
    "listing photography Green Bay Madison Milwaukee",
    "drone photography Fox Valley",
  ],
};

/** The hub. Four markets, honest about how much work sits behind each. */
export default function AreasPage() {
  const schema = [
    breadcrumbs([{ name: "Areas", path: "/areas" }]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${BUSINESS.url}/areas#areas`,
      url: `${BUSINESS.url}/areas`,
      name: "Areas PG Creatives covers",
      isPartOf: { "@id": SITE_ID },
      about: { "@id": ORG_ID },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: MARKETS.length,
        itemListElement: MARKETS.map((m, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: m.name,
          url: `${BUSINESS.url}/areas/${m.slug}`,
        })),
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />

      <PageHead
        lines={["Four markets,", "one crew."]}
        lede="Four markets, each with its own number and its own crew. Green Bay is the home one, Milwaukee is the newest."
        meta={<p className="meta">{BUSINESS.locationText}</p>}
      />

      <section className="section pt-0">
        <div className="shell">
          <div className="grid gap-4 md:grid-cols-2">
            {MARKETS.map((market) => {
              const phone = BUSINESS.phones[market.phoneKey];
              return (
                <Link
                  key={market.slug}
                  href={`/areas/${market.slug}`}
                  className="surface group flex flex-col p-6 transition-colors"
                >
                  <p className="meta mb-2">{market.status}</p>
                  <h2 className="display-3 mb-3 text-white">
                    {market.city === "the Fox Valley" ? "The Fox Valley" : market.city}
                  </h2>
                  <p className="mb-4 flex-1 text-ink-2">{market.lede}</p>
                  <p className="text-sm text-ink-3">
                    <span className="text-signal-ink">{phone.number}</span>
                    <span className="mx-2" aria-hidden="true">/</span>
                    {market.towns.slice(0, 3).join(", ")}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
