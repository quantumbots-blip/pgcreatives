import { notFound } from "next/navigation";
import { AdminNav } from "../../nav";
import { loadShell } from "../load-shell";
import { Editor } from "./editor";
import { getCampaign, listDeliveries, countSubscribers } from "@/lib/newsletter/db";
import { postalAddress } from "@/lib/newsletter/send";
import { PHOTOS, TEAM, type CatalogFilm } from "@/lib/newsletter/catalog";
import { PORTFOLIO_FILMS } from "@/lib/films";
import { getVimeoMetas } from "@/lib/vimeo";
import { BUSINESS } from "@/lib/data";

export const dynamic = "force-dynamic";
/* Sending happens inside a server action on this route, a batch of a
   hundred at a time, and a long list needs the room. */
export const maxDuration = 300;

/**
 * One email, being written or already gone.
 *
 * Everything the editor needs to work without a round trip comes down with
 * the page: the pictures it can offer, the films with their posters, the
 * address that goes in the footer. The preview is rendered in the browser
 * by the same function that renders the send, so the two cannot disagree.
 */

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { signedInAs, waiting } = await loadShell();
  const id = Number.parseInt((await params).id, 10);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const campaign = await getCampaign(id);
  if (!campaign) notFound();

  const [deliveries, counts, metas] = await Promise.all([
    campaign.status === "draft" ? Promise.resolve([]) : listDeliveries(id),
    countSubscribers(),
    getVimeoMetas(PORTFOLIO_FILMS.map((f) => f.vimeoId)),
  ]);

  const films: CatalogFilm[] = PORTFOLIO_FILMS.map((f) => ({
    vimeoId: f.vimeoId,
    title: f.title,
    category: f.category,
    poster: metas[f.vimeoId]?.thumbnail ?? `https://vumbnail.com/${f.vimeoId}.jpg`,
    portrait: metas[f.vimeoId]?.portrait ?? true,
  }));

  return (
    <div className="min-h-screen bg-ground">
      <AdminNav waiting={waiting} signedInAs={signedInAs} />
      <Editor
        campaign={campaign}
        deliveries={deliveries}
        subscribers={counts.subscribed}
        photos={PHOTOS}
        films={films}
        team={TEAM}
        postalAddress={postalAddress() ?? null}
        testAddress={signedInAs ?? BUSINESS.email}
      />
    </div>
  );
}
