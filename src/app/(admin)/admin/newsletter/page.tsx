import Link from "next/link";
import { Users, Send, MailCheck, MailX, Plus, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { AdminNav } from "../nav";
import { Panel, Stat } from "../ui";
import { loadShell } from "./load-shell";
import { CampaignChip, shortDate } from "./shared";
import { CampaignActions } from "./campaign-actions";
import { Thumb } from "./thumb";
import { countSubscribers, listCampaigns, type CampaignSummary, type SubscriberCounts } from "@/lib/newsletter/db";
import { checkSetup, type Setup } from "@/lib/newsletter/setup";
import { postalAddress } from "@/lib/newsletter/send";
import { PALETTES, renderNewsletterHtml } from "@/lib/newsletter/render";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * The newsletter, from the top: who is on the list, whether sending can
 * work today, and every email written so far, each drawn small enough to
 * recognise.
 */

function subjectOf(c: CampaignSummary): string {
  return c.subject.trim() || "Untitled email";
}

const SAMPLE = {
  email: "you@example.com",
  firstName: "Heather",
  unsubscribeUrl: "https://pgcreativeswi.com/newsletter/unsubscribe/preview",
};

export default async function NewsletterPage() {
  const { signedInAs, waiting, dbError } = await loadShell();

  let counts: SubscriberCounts = { subscribed: 0, unsubscribed: 0, bounced: 0, complained: 0, total: 0 };
  let campaigns: CampaignSummary[] = [];
  let setup: Setup = { items: [], canSend: false };
  if (!dbError) {
    try {
      [counts, campaigns, setup] = await Promise.all([countSubscribers(), listCampaigns(), checkSetup()]);
    } catch {
      // The page still renders; the panels say what is missing.
    }
  }

  const sentCount = campaigns.filter((c) => c.status === "sent").length;
  const delivered = campaigns.reduce((n, c) => n + c.counts.sent, 0);
  const problems = setup.items.filter((i) => !i.ok);
  const address = postalAddress();

  return (
    <div className="min-h-screen bg-ground">
      <AdminNav waiting={waiting} signedInAs={signedInAs} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">Newsletter</h1>
            <p className="mt-1 text-sm text-ink-3">
              One email a month to the people you have worked with.
            </p>
          </div>
          <Link
            href="/admin/newsletter/new"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-signal px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#3480d2]"
          >
            <Plus className="h-4 w-4" />
            New email
          </Link>
        </div>

        {dbError && (
          <div className="rounded-lg border border-red-500/25 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300">
            The database could not be reached. Nothing below is current.
          </div>
        )}

        <div className="grid auto-rows-fr grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={Users} value={counts.subscribed.toLocaleString()} label="On the list" accent sub="Who the next email goes to" />
          <Stat icon={MailX} value={(counts.unsubscribed + counts.bounced + counts.complained).toLocaleString()} label="Left or bounced" sub={`${counts.unsubscribed} left, ${counts.bounced} bounced, ${counts.complained} spam`} />
          <Stat icon={Send} value={sentCount} label="Emails sent" sub={sentCount === 1 ? "One campaign so far" : "Campaigns that have gone out"} />
          <Stat icon={MailCheck} value={delivered.toLocaleString()} label="Copies delivered" sub="Across every email" />
        </div>

        <Panel
          title="Emails"
          aside={
            <Link
              href="/admin/newsletter/subscribers"
              className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium text-signal-ink transition-colors hover:bg-white/[0.04]"
            >
              <Users className="h-3.5 w-3.5" />
              Manage the list
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {campaigns.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line-strong px-4 py-10 text-center">
              <p className="text-sm text-white">No emails yet.</p>
              <p className="mt-1 text-xs text-ink-3">Start one from a template. Each is a finished email you change rather than a form you fill in.</p>
              <Link
                href="/admin/newsletter/new"
                className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-signal px-3.5 text-xs font-semibold text-white hover:bg-[#3480d2]"
              >
                <Plus className="h-4 w-4" />
                New email
              </Link>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {campaigns.map((c) => {
                const html = renderNewsletterHtml(
                  { subject: c.subject, preheader: c.preheader, theme: c.theme, blocks: c.blocks },
                  { recipient: SAMPLE, postalAddress: address, assetOrigin: "" },
                );
                return (
                  <li key={c.id} className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface-hi">
                    <Link href={`/admin/newsletter/${c.id}`} className="block" aria-label={`Open ${subjectOf(c)}`}>
                      <Thumb html={html} height={210} ground={PALETTES[c.theme].ground} />
                    </Link>
                    <div className="flex flex-1 flex-col gap-2 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/admin/newsletter/${c.id}`} className="min-w-0">
                          <p className="line-clamp-2 text-sm font-medium text-white hover:text-signal-ink">{subjectOf(c)}</p>
                        </Link>
                        <CampaignChip status={c.status} />
                      </div>
                      <p className="text-xs text-ink-3">
                        {c.status === "sent" && c.sent_at
                          ? `Sent ${shortDate(c.sent_at)} to ${c.counts.sent.toLocaleString()}`
                          : c.status === "paused"
                            ? `${c.counts.sent.toLocaleString()} sent, ${c.counts.queued.toLocaleString()} still waiting`
                            : `Edited ${shortDate(c.updated_at)}`}
                        {c.counts.failed > 0 && `, ${c.counts.failed} failed`}
                      </p>
                      <div className="mt-auto pt-1">
                        <CampaignActions id={c.id} status={c.status} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel
          title="Ready to send?"
          aside={
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium",
                setup.canSend ? "bg-emerald-500/12 text-emerald-300" : "bg-amber-500/12 text-amber-300",
              )}
            >
              {setup.canSend ? "Yes" : `${problems.length} ${problems.length === 1 ? "thing" : "things"} to sort out`}
            </span>
          }
          note="Checked against Resend each time this page opens. Nothing here changes on its own."
        >
          <ul className="divide-y divide-line">
            {setup.items.map((item) => (
              <li key={item.key} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                {item.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{item.detail}</p>
                </div>
              </li>
            ))}
            {setup.items.length === 0 && (
              <li className="py-2 text-sm text-ink-3">Could not run the checks.</li>
            )}
          </ul>
        </Panel>
      </main>
    </div>
  );
}
