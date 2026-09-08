import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/page-head";
import { SectionHead } from "@/components/section-head";
import { VideoGallery } from "@/components/video-gallery";
import { BUSINESS } from "@/lib/data";
import { MARKETS, marketBySlug, type Market } from "@/lib/markets";
import { filmsForMarket } from "@/lib/films";
import { getVimeoMetas } from "@/lib/vimeo";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbs, videoGallery, jsonLd, ORG_ID, SITE_ID } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
  return MARKETS.map((m) => ({ market: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ market: string }>;
}): Promise<Metadata> {
  const market = marketBySlug((await params).market);
  if (!market) return {};

  return {
    ...pageMetadata({
      title: `Real Estate Photography in ${market.city === "the Fox Valley" ? "the Fox Valley" : market.city}`,
      description: market.description,
      path: `/areas/${market.slug}`,
      image: "/og-portfolio.jpg",
      imageAlt: `PG Creatives work in ${market.city}`,
    }),
    keywords: [
      `real estate photographer ${market.city}`,
      `listing video ${market.city}`,
      `drone photography ${market.city}`,
      `real estate photography ${market.city} WI`,
    ],
  };
}

/**
 * One page per market.
 *
 * The owner asked for all four he advertises, having been told two of them
 * have little or no work behind them. So the guard against these reading as
 * four copies of one page with the city swapped is that everything on them is
 * genuinely per market: its own films, taken from where they were actually
 * shot, its own number, its own people, its own booking route, and copy
 * written about that market rather than templated.
 *
 * Milwaukee has no published films yet, being a branch that opened recently.
 * Rather than borrowing somebody else's work to fill the space, that page says
 * the first films are in the edit and shows nothing it did not shoot there.
 */

/** The local schema. areaServed is the actual towns, not the state. */
function marketSchema(market: Market) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${BUSINESS.url}/areas/${market.slug}#service`,
    name: `Real estate photography and video in ${market.city}`,
    description: market.description,
    serviceType: "Real estate photography",
    provider: { "@id": ORG_ID },
    isPartOf: { "@id": SITE_ID },
    url: `${BUSINESS.url}/areas/${market.slug}`,
    areaServed: market.towns.map((name) => ({
      "@type": "City",
      name,
      addressRegion: "WI",
      addressCountry: "US",
    })),
    availableChannel: {
      "@type": "ServiceChannel",
      servicePhone: BUSINESS.phones[market.phoneKey].number,
      serviceUrl: `${BUSINESS.url}/contact`,
    },
  };
}

export default async function MarketPage({
  params,
}: {
  params: Promise<{ market: string }>;
}) {
  const market = marketBySlug((await params).market);
  if (!market) notFound();

  const films = filmsForMarket(market.slug);
  const metas = await getVimeoMetas(films.map((f) => f.vimeoId));
  const phone = BUSINESS.phones[market.phoneKey];
  const portal = market.portalKey ? BUSINESS.portals[market.portalKey] : null;

  const schema: Record<string, unknown>[] = [
    breadcrumbs([
      { name: "Areas", path: "/areas" },
      { name: market.city, path: `/areas/${market.slug}` },
    ]),
    marketSchema(market),
  ];

  const filmSchema =
    films.length > 0
      ? videoGallery(
          films
            .filter((f) => metas[f.vimeoId])
            .map((f) => ({
              title: f.title,
              category: f.category,
              vimeoId: f.vimeoId,
              meta: metas[f.vimeoId],
            })),
          `/areas/${market.slug}`,
          `PG Creatives work in ${market.city}`,
        )
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
      {filmSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(filmSchema) }}
        />
      )}

      <PageHead
        lines={[
          market.city === "the Fox Valley" ? "The Fox Valley," : `${market.city},`,
          "shot properly.",
        ]}
        lede={market.lede}
        meta={
          <p className="meta">
            <a href={phone.href} className="text-signal-ink">
              {phone.number}
            </a>
            <span className="mx-2" aria-hidden="true">/</span>
            <span>{market.status}</span>
          </p>
        }
      />

      <section className="section pt-0">
        <div className="shell">
          <div className="mx-auto max-w-2xl space-y-6">
            {market.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-lg leading-relaxed text-ink-2">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {films.length > 0 ? (
        <section className="section">
          <div className="shell">
            <SectionHead
              lines={["Work shot", `in ${market.city}.`]}
              lede={`Every film below was made in ${market.city} or the towns around it.`}
            />
            <VideoGallery
              videos={films.map((f) => ({
                vimeoId: f.vimeoId,
                title: f.title,
                thumbnail: metas[f.vimeoId]?.thumbnail,
                portrait: metas[f.vimeoId]?.portrait,
              }))}
            />
          </div>
        </section>
      ) : (
        <section className="section">
          <div className="shell">
            <SectionHead
              lines={market.emptyState?.lines ?? ["Work from here", "is coming."]}
              lede={
                market.emptyState?.lede ??
                `Nothing published from ${market.city} yet. Here is everything we have made elsewhere.`
              }
            />
            <Link href="/portfolio" className="btn btn-primary">
              See the full portfolio
            </Link>
          </div>
        </section>
      )}

      <section className="section">
        <div className="shell">
          <SectionHead
            lines={["How booking", `${market.city} works.`]}
            lede={
              portal
                ? "Agents book through the portal. Everyone else uses the form, and we usually reply the same day."
                : "Send the address and the date and we will come back the same day."
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface p-6">
              <p className="meta mb-2">Call {market.city}</p>
              <a href={phone.href} className="display-3 text-signal-ink">
                {phone.number}
              </a>
              <p className="mt-3 text-sm text-ink-3">
                {market.people.length > 0
                  ? `Reaches ${market.people.join(" and ")}.`
                  : `Reaches the ${market.city} branch directly.`}
              </p>
            </div>
            <div className="surface p-6">
              <p className="meta mb-2">{portal ? "Book a listing" : "Hold a date"}</p>
              {portal ? (
                <a href={portal.href} className="btn btn-primary" target="_blank" rel="noopener">
                  {portal.label}
                </a>
              ) : (
                <Link href="/contact" className="btn btn-primary">
                  Send the details
                </Link>
              )}
              <p className="mt-3 text-sm text-ink-3">
                Covering {market.towns.slice(0, 4).join(", ")}
                {market.towns.length > 4 ? ` and ${market.towns.length - 4} more` : ""}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHead lines={["The other", "markets."]} />
          <div className="flex flex-wrap gap-3">
            {MARKETS.filter((m) => m.slug !== market.slug).map((m) => (
              <Link
                key={m.slug}
                href={`/areas/${m.slug}`}
                className="rounded-lg border border-line px-4 py-3 text-sm text-ink-2 transition-colors hover:border-line-strong hover:text-white"
              >
                {m.city === "the Fox Valley" ? "The Fox Valley" : m.city}
                <span className="ml-2 text-ink-3">{m.status.toLowerCase()}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
