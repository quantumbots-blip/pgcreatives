import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { AdminNav } from "../../nav";
import { Panel } from "../../ui";
import { loadShell } from "../load-shell";
import { ImportBox } from "./import-box";
import { SubscriberTable } from "./subscriber-table";
import {
  countSubscribers,
  listSubscribers,
  SUBSCRIBER_STATUSES,
  type Subscriber,
  type SubscriberCounts,
  type SubscriberStatus,
} from "@/lib/newsletter/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * The list itself. Paste it in, search it, take somebody off it, put
 * somebody back on, and export it. The numbers at the top are the ones that
 * matter for deliverability: a list where the bounced and spam columns are
 * growing is a list that is about to stop landing.
 */

const PAGE = 100;

const FILTERS: { value: SubscriberStatus | "all"; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "subscribed", label: "On the list" },
  { value: "unsubscribed", label: "Unsubscribed" },
  { value: "bounced", label: "Bounced" },
  { value: "complained", label: "Marked as spam" },
];

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { signedInAs, waiting, dbError } = await loadShell();
  const sp = await searchParams;
  const status = (SUBSCRIBER_STATUSES as readonly string[]).includes(sp.status ?? "")
    ? (sp.status as SubscriberStatus)
    : "all";
  const q = (sp.q ?? "").slice(0, 100);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  let counts: SubscriberCounts = { subscribed: 0, unsubscribed: 0, bounced: 0, complained: 0, total: 0 };
  let rows: Subscriber[] = [];
  let total = 0;
  if (!dbError) {
    try {
      [counts, { rows, total }] = await Promise.all([
        countSubscribers(),
        listSubscribers({ status, q, limit: PAGE, offset: (page - 1) * PAGE }),
      ]);
    } catch {
      // Panels below say so.
    }
  }
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const query = (over: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status, q, page, ...over };
    if (merged.status && merged.status !== "all") p.set("status", String(merged.status));
    if (merged.q) p.set("q", String(merged.q));
    if (merged.page && Number(merged.page) > 1) p.set("page", String(merged.page));
    const s = p.toString();
    return `/admin/newsletter/subscribers${s ? `?${s}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-ground">
      <AdminNav waiting={waiting} signedInAs={signedInAs} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/admin/newsletter"
              className="inline-flex items-center gap-1 text-xs text-ink-3 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Newsletter
            </Link>
            <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">The list</h1>
            <p className="mt-1 text-sm text-ink-3">
              {counts.subscribed.toLocaleString()} {counts.subscribed === 1 ? "person gets" : "people get"} the next email.
              {counts.total - counts.subscribed > 0 &&
                ` ${(counts.total - counts.subscribed).toLocaleString()} more are on file but no longer mailed.`}
            </p>
          </div>
          {/* A file download, not a page, so a plain anchor is right here. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/newsletter/export"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line bg-surface-hi px-3 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-white"
          >
            <Download className="h-4 w-4" />
            Download as CSV
          </a>
        </div>

        <ImportBox />

        <Panel
          title="Everyone on file"
          aside={<span className="text-xs text-ink-3">{total.toLocaleString()} {total === 1 ? "match" : "matches"}</span>}
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const n = f.value === "all" ? counts.total : counts[f.value];
              const active = f.value === status;
              return (
                <Link
                  key={f.value}
                  href={query({ status: f.value, page: 1 })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
                    active ? "bg-[rgba(43,111,184,0.16)] text-signal-ink" : "text-ink-3 hover:bg-white/[0.04] hover:text-ink-2",
                  )}
                >
                  {f.label}
                  <span className="tabular-nums opacity-70">{n.toLocaleString()}</span>
                </Link>
              );
            })}
            <form method="get" className="ml-auto flex min-w-0 basis-full items-center gap-2 sm:basis-auto">
              {status !== "all" && <input type="hidden" name="status" value={status} />}
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search a name, email or company"
                aria-label="Search the list"
                className="min-h-9 w-full min-w-0 rounded-lg border border-line bg-surface px-3 text-sm text-white outline-none transition-colors placeholder:text-ink-3 focus:border-line-strong sm:w-64"
              />
              <button
                type="submit"
                className="inline-flex min-h-9 shrink-0 items-center rounded-lg border border-line px-3 text-xs text-ink-2 transition-colors hover:border-line-strong hover:text-white"
              >
                Search
              </button>
            </form>
          </div>

          <SubscriberTable rows={rows} />

          {pages > 1 && (
            <nav className="mt-4 flex items-center justify-between text-xs text-ink-3" aria-label="Pages">
              <span>
                Page {page} of {pages}
              </span>
              <span className="flex gap-2">
                {page > 1 && (
                  <Link href={query({ page: page - 1 })} className="rounded-lg border border-line px-2.5 py-1.5 hover:text-white">
                    Newer
                  </Link>
                )}
                {page < pages && (
                  <Link href={query({ page: page + 1 })} className="rounded-lg border border-line px-2.5 py-1.5 hover:text-white">
                    Older
                  </Link>
                )}
              </span>
            </nav>
          )}
        </Panel>
      </main>
    </div>
  );
}
