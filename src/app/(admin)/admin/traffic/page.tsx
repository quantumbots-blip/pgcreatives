import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Users,
  Target,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Camera,
  Search as SearchIcon,
  Share2,
  Link2,
} from "lucide-react";
import { verifySessionFull } from "@/lib/auth";
import { ensureSchema, ensurePageViewsTable, getSubmissions } from "@/lib/db";
import {
  getTrafficInsights,
  getLeadSources,
  parseRange,
  RANGE_OPTIONS,
  type Channel,
} from "@/lib/insights";
import { cn } from "@/lib/utils";
import { AdminNav } from "../nav";
import { Panel, Stat, BarChart } from "../ui";
import { VisitorHeatmap } from "../heatmap";

export const dynamic = "force-dynamic";

/* lucide dropped its brand marks, so these are generic stand ins rather than
   the platforms' own logos. The label carries the name either way. */
const CHANNEL_ICON: Record<Channel, React.ComponentType<{ className?: string }>> = {
  Instagram: Camera,
  Search: SearchIcon,
  Facebook: Share2,
  Direct: Link2,
  Other: Globe,
};

export default async function TrafficPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || !(await verifySessionFull(session.value))) {
    redirect("/admin/login");
  }

  const range = parseRange((await searchParams).range);

  let traffic: Awaited<ReturnType<typeof getTrafficInsights>> | null = null;
  let leadSources: Awaited<ReturnType<typeof getLeadSources>> = { rows: [], unattributed: 0 };
  let waiting = 0;
  let dbError = false;

  try {
    await Promise.all([ensureSchema(), ensurePageViewsTable()]);
    const [t, s, subs] = await Promise.all([
      getTrafficInsights(range),
      getLeadSources(),
      getSubmissions(),
    ]);
    traffic = t;
    leadSources = s;
    waiting = subs.filter((x) => (x.status || "new") === "new").length;
  } catch {
    dbError = true;
  }

  const channelTotal = traffic?.channels.reduce((sum, c) => sum + c.views, 0) ?? 0;
  const leadSourceTotal = leadSources.rows.reduce((sum, c) => sum + c.leads, 0);

  return (
    <div className="min-h-screen bg-ground">
      <AdminNav waiting={waiting} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
        {dbError || !traffic ? (
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-5 py-4">
            <p className="text-sm text-amber-300">
              Traffic is temporarily unavailable. Please try again later.
            </p>
          </div>
        ) : (
          <>
            {/* Range */}
            <div className="flex flex-wrap items-center gap-2">
              {RANGE_OPTIONS.map((option) => {
                const active = option.key === range;
                return (
                  <Link
                    key={option.key}
                    href={`/admin/traffic?range=${option.key}`}
                    scroll={false}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-10 items-center rounded-lg px-3 text-xs font-medium transition-colors",
                      active
                        ? "bg-[rgba(43,111,184,0.16)] text-signal-ink"
                        : "text-ink-3 hover:bg-white/[0.04] hover:text-ink-2",
                    )}
                  >
                    {option.label}
                  </Link>
                );
              })}
              <span className="ml-auto text-[11px] text-ink-3">
                {range === "all"
                  ? "Everything recorded, with nothing earlier to compare against"
                  : "Compared with the same length before it"}
              </span>
            </div>

            {/* Headline numbers */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat
                icon={Eye}
                label="Views"
                value={traffic.views.current.toLocaleString()}
                delta={traffic.views.pct}
                sub={
                  traffic.views.pct === null
                    ? undefined
                    : `${traffic.views.previous.toLocaleString()} before`
                }
              />
              <Stat
                icon={Users}
                label="Visitors"
                value={traffic.visitors.current.toLocaleString()}
                delta={traffic.visitors.pct}
                sub={
                  traffic.visitors.pct === null
                    ? undefined
                    : `${traffic.visitors.previous.toLocaleString()} before`
                }
              />
              <Stat
                icon={Target}
                label="Leads"
                value={traffic.leads.current.toLocaleString()}
                accent
                delta={traffic.leads.pct}
                sub={
                  traffic.leads.pct === null
                    ? undefined
                    : `${traffic.leads.previous.toLocaleString()} before`
                }
              />
              <Stat
                icon={Target}
                label="Visitors who write in"
                value={traffic.conversionPct === null ? "n/a" : `${traffic.conversionPct}%`}
                sub={
                  traffic.conversionPct === null
                    ? "no visitors recorded yet"
                    : `${traffic.leads.current} of ${traffic.visitors.current.toLocaleString()}`
                }
              />
            </div>

            {traffic.showVisitorAccuracyNote && (
              <p className="rounded-lg border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-ink-3">
                Visitor counts before 7 September 2026 were overstated. The value identifying a
                returning visitor was regenerated on every deploy, so one person could be counted
                several times. Views, pages and referrers were never affected, and visitor figures
                from that date on are accurate.
              </p>
            )}

            {/* Daily */}
            <Panel title="Views by day" aside={<span className="text-xs text-ink-3">{traffic.rangeLabel}</span>}>
              <BarChart
                data={traffic.daily.map((d) => ({
                  day: d.day,
                  value: d.views,
                  hint: `${d.day}: ${d.views} views, ${d.visitors} visitors`,
                }))}
                emptyLabel="No visits recorded in this range"
              />
            </Panel>

            {/* Channels: traffic against leads */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel
                title="Where visitors come from"
                note="Hostnames grouped into channels, so Instagram's several link domains read as one line."
              >
                {traffic.channels.length === 0 ? (
                  <p className="py-8 text-center text-sm text-ink-3">Nothing recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {traffic.channels.map((c) => {
                      const Icon = CHANNEL_ICON[c.channel];
                      const pct = channelTotal > 0 ? (c.views / channelTotal) * 100 : 0;
                      return (
                        <div key={c.channel}>
                          <div className="mb-1.5 flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 shrink-0 text-signal-ink" />
                            <span className="min-w-0 flex-1 truncate text-sm text-ink-2">
                              {c.channel}
                            </span>
                            <span className="shrink-0 text-xs tabular-nums text-ink-3">
                              {c.views.toLocaleString()} ({Math.round(pct)}%)
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                            <div
                              className="h-full rounded-full bg-signal"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Panel>

              <Panel
                title="Where leads come from"
                note="The same channels, counted by people who actually wrote in. This is the comparison that says whether the traffic is worth anything."
              >
                {leadSourceTotal === 0 ? (
                  <p className="py-8 text-center text-sm leading-relaxed text-ink-3">
                    No leads carry a source yet. Every inquiry from now on records how the visit
                    started, so this fills in as they arrive
                    {leadSources.unattributed > 0
                      ? `. The ${leadSources.unattributed} already in the pipeline came in before this was recorded.`
                      : "."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {leadSources.rows.map((c) => {
                      const Icon = CHANNEL_ICON[c.channel];
                      const pct = (c.leads / leadSourceTotal) * 100;
                      return (
                        <div key={c.channel}>
                          <div className="mb-1.5 flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 shrink-0 text-signal-ink" />
                            <span className="min-w-0 flex-1 truncate text-sm text-ink-2">
                              {c.channel}
                            </span>
                            <span className="shrink-0 text-xs tabular-nums text-ink-3">
                              {c.leads} {c.leads === 1 ? "lead" : "leads"}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                            <div
                              className="h-full rounded-full bg-signal"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {leadSources.unattributed > 0 && (
                      <p className="border-t border-line pt-3 text-xs leading-relaxed text-ink-3">
                        {leadSources.unattributed} older{" "}
                        {leadSources.unattributed === 1 ? "lead is" : "leads are"} not counted
                        here. They arrived before the site started recording where a visit
                        began, so calling them direct would be a guess.
                      </p>
                    )}
                  </div>
                )}
              </Panel>
            </div>

            {/* When */}
            <Panel title="When visitors are here" aside={<span className="text-xs text-ink-3">Wisconsin time</span>}>
              <VisitorHeatmap grid={traffic.heatmap} />
            </Panel>

            {/* Detail */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="min-w-0 lg:col-span-1">
                <Panel title="Top pages">
                  {traffic.topPages.length === 0 ? (
                    <p className="text-xs text-ink-3">No data yet</p>
                  ) : (
                    <div className="space-y-2">
                      {traffic.topPages.map((page) => (
                        <div
                          key={page.path}
                          className="flex items-center justify-between gap-2 rounded-lg bg-surface-hi px-3 py-2"
                        >
                          <span className="min-w-0 truncate font-mono text-xs text-ink-2">
                            {page.path}
                          </span>
                          <span className="shrink-0 text-[11px] tabular-nums text-ink-3">
                            {page.views.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              </div>

              <div className="min-w-0 lg:col-span-1">
                <Panel title="Devices">
                  {traffic.devices.length === 0 ? (
                    <p className="text-xs text-ink-3">No data yet</p>
                  ) : (
                    <div className="space-y-2">
                      {traffic.devices.map((d) => {
                        const total = traffic.devices.reduce((sum, v) => sum + v.count, 0);
                        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
                        const Icon =
                          d.device === "mobile"
                            ? Smartphone
                            : d.device === "tablet"
                              ? Tablet
                              : Monitor;
                        return (
                          <div
                            key={d.device}
                            className="flex items-center gap-3 rounded-lg bg-surface-hi px-3 py-2"
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0 text-signal-ink" />
                            <span className="min-w-0 flex-1 truncate text-xs capitalize text-ink-2">
                              {d.device}
                            </span>
                            <span className="shrink-0 text-[11px] tabular-nums text-ink-3">
                              {pct}%
                            </span>
                            <div className="h-1.5 w-10 shrink-0 overflow-hidden rounded-full bg-white/[0.08] sm:w-16">
                              <div
                                className="h-full rounded-full bg-signal"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Panel>
              </div>

              <div className="min-w-0 lg:col-span-1">
                <Panel title="Individual referrers">
                  {traffic.referrers.length === 0 ? (
                    <p className="text-xs text-ink-3">Everyone arrived direct</p>
                  ) : (
                    <div className="space-y-2">
                      {traffic.referrers.map((ref) => (
                        <div
                          key={ref.source}
                          className="flex items-center justify-between gap-2 rounded-lg bg-surface-hi px-3 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <Globe className="h-3.5 w-3.5 shrink-0 text-signal-ink" />
                            <span className="truncate text-xs text-ink-2">{ref.source}</span>
                          </div>
                          <span className="shrink-0 text-[11px] tabular-nums text-ink-3">
                            {ref.count.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
