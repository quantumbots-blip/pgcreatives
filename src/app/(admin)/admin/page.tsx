import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySessionFull } from "@/lib/auth";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Eye,
  Globe,
  LogOut,
  Mail,
  MessageSquare,
  Monitor,
  Phone,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  ensureSchema,
  ensurePageViewsTable,
  getSubmissions,
  getSpamSubmissions,
  getSubmissionStats,
  getServiceBreakdown,
  getStatusCounts,
  getPageViewStats,
  getSpamStats,
} from "@/lib/db";
import type { SubmissionStatus } from "@/lib/db";
import { logoutAction } from "@/app/actions/auth";
import { BUSINESS } from "@/lib/data";
import { SubmissionsTable } from "./submissions-table";
import { NewLeads } from "./new-leads";
import { ServiceChart } from "./service-chart";

export const dynamic = "force-dynamic";

/** One card in the row of numbers across the top. */
function Stat({
  icon: Icon,
  value,
  label,
  sub,
  accent,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  sub?: string;
  accent?: boolean;
  trend?: { pct: number; up: boolean };
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2 text-ink-3">
        <Icon className="h-4 w-4 shrink-0 text-signal-ink" />
        <span className="text-[11px] uppercase tracking-[0.12em]">{label}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <p
          className={`text-2xl font-bold tabular-nums ${accent ? "text-signal-ink" : "text-white"}`}
        >
          {value}
        </p>
        {trend && trend.pct !== 0 && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
              trend.up ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"
            }`}
          >
            {trend.up ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend.pct)}%
          </span>
        )}
      </div>
      {sub && <p className="mt-1 text-[11px] text-ink-3">{sub}</p>}
    </div>
  );
}

function Panel({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 sm:mb-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-ink-3">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  // Checks the signature and that the session still exists in the database, so
  // signing out on one device actually ends it everywhere.
  if (!session || !(await verifySessionFull(session.value))) {
    redirect("/admin/login");
  }

  let stats = {
    total: 0,
    thisMonth: 0,
    thisWeek: 0,
    lastWeek: 0,
    newLeads: 0,
    daily: [] as { day: string; count: number }[],
  };
  let submissions: Awaited<ReturnType<typeof getSubmissions>> = [];
  let spam: Awaited<ReturnType<typeof getSpamSubmissions>> = [];
  let serviceBreakdown: Awaited<ReturnType<typeof getServiceBreakdown>> = [];
  let statusCounts: Record<SubmissionStatus, number> = {
    new: 0,
    contacted: 0,
    booked: 0,
    archived: 0,
  };
  let traffic: Awaited<ReturnType<typeof getPageViewStats>> = {
    totalViews: 0,
    totalUnique: 0,
    monthViews: 0,
    monthUnique: 0,
    weekViews: 0,
    todayViews: 0,
    dailyViews: [],
    topPages: [],
    deviceBreakdown: [],
    topReferrers: [],
  };
  let spamStats = { quarantinedTotal: 0, quarantinedWeek: 0, blockedWeek: 0, blockedTotal: 0 };
  let dbError = false;

  try {
    await Promise.all([ensureSchema(), ensurePageViewsTable()]);
    [stats, submissions, spam, serviceBreakdown, statusCounts, traffic, spamStats] =
      await Promise.all([
        getSubmissionStats(),
        getSubmissions(),
        getSpamSubmissions(),
        getServiceBreakdown(),
        getStatusCounts(),
        getPageViewStats(),
        getSpamStats(),
      ]);
  } catch {
    dbError = true;
  }

  const newLeads = submissions.filter((s) => (s.status || "new") === "new");
  const maxDaily = Math.max(...stats.daily.map((d) => Number(d.count)), 1);

  // Week-over-week trend
  const weekDiff = stats.thisWeek - stats.lastWeek;
  const weekTrendPct =
    stats.lastWeek > 0
      ? Math.round((weekDiff / stats.lastWeek) * 100)
      : stats.thisWeek > 0
        ? 100
        : 0;

  // Conversion rate: booked / (total - archived), avoid division by zero
  const activePipeline = stats.total - statusCounts.archived;
  const conversionRate =
    activePipeline > 0 ? Math.round((statusCounts.booked / activePipeline) * 100) : 0;

  const filteredWeek = spamStats.quarantinedWeek + spamStats.blockedWeek;

  return (
    <div className="min-h-screen bg-ground">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-white sm:text-lg">
              PG Creatives
            </h1>
            <p className="text-[11px] text-ink-3">Leads and traffic</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="inline-flex min-h-9 items-center px-2 text-xs text-ink-3 transition-colors hover:text-white sm:text-sm"
            >
              View site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-ink-3 transition-colors hover:border-line-strong hover:text-white sm:px-4 sm:text-sm"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
                <span className="sm:hidden">Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
        {dbError && (
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-5 py-4">
            <p className="text-sm text-amber-300">
              Dashboard temporarily unavailable. Please try again later.
            </p>
          </div>
        )}

        {/* Everyone waiting on a reply, before anything else on the page. */}
        <NewLeads leads={newLeads} />

        {/* ── The numbers ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            icon={Sparkles}
            value={stats.newLeads}
            label="New leads"
            accent
            sub={stats.newLeads === 0 ? "nothing waiting" : "waiting on you"}
          />
          <Stat
            icon={TrendingUp}
            value={stats.thisWeek}
            label="This week"
            trend={{ pct: weekTrendPct, up: weekDiff >= 0 }}
            sub={`${stats.lastWeek} the week before`}
          />
          <Stat
            icon={Calendar}
            value={stats.thisMonth}
            label="This month"
            sub={`${stats.total} all time`}
          />
          <Stat
            icon={ShieldCheck}
            value={filteredWeek}
            label="Spam filtered"
            sub={
              filteredWeek === 0
                ? "nothing caught this week"
                : `${spamStats.blockedWeek} blocked, ${spamStats.quarantinedWeek} held for review`
            }
          />
        </div>

        {/* ── Every submission ── */}
        <Panel title="Submissions">
          <SubmissionsTable submissions={submissions} spam={spam} />
        </Panel>

        {/* ── Pipeline ── */}
        <Panel
          title="Lead pipeline"
          aside={
            activePipeline > 0 ? (
              <span className="text-xs text-ink-3">{conversionRate}% booked</span>
            ) : undefined
          }
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                { icon: Sparkles, count: statusCounts.new, label: "New", tone: "text-signal-ink" },
                { icon: Send, count: statusCounts.contacted, label: "Contacted", tone: "text-amber-300" },
                { icon: CheckCircle2, count: statusCounts.booked, label: "Booked", tone: "text-emerald-300" },
                { icon: MessageSquare, count: statusCounts.archived, label: "Archived", tone: "text-ink-3" },
              ] as const
            ).map((step) => (
              <div
                key={step.label}
                className="rounded-lg border border-line bg-surface-hi p-4 text-center"
              >
                <step.icon className={`mx-auto mb-2 h-5 w-5 ${step.tone}`} />
                <p className={`text-2xl font-bold tabular-nums ${step.tone}`}>{step.count}</p>
                <p className="mt-1 text-[11px] text-ink-3">{step.label}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* ── Charts ── */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Panel title="Service demand">
              <ServiceChart data={serviceBreakdown} />
            </Panel>
          </div>
          <div className="lg:col-span-7">
            <Panel title="Submissions, last 30 days">
              {stats.daily.length === 0 ? (
                <p className="py-10 text-center text-sm text-ink-3">No submissions yet</p>
              ) : (
                <div className="flex h-40 items-end gap-1">
                  {stats.daily.map((d) => (
                    <div
                      key={d.day}
                      className="group relative flex-1"
                      title={`${d.day}: ${d.count} submission${Number(d.count) !== 1 ? "s" : ""}`}
                    >
                      <div
                        className="w-full rounded-t bg-signal transition-colors group-hover:bg-signal-ink"
                        style={{
                          height: `${(Number(d.count) / maxDaily) * 100}%`,
                          minHeight: "4px",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>

        {/* ── Traffic ── */}
        <Panel
          title="Website traffic"
          aside={<span className="text-xs text-ink-3">Last 30 days</span>}
        >
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              icon={Eye}
              value={traffic.monthViews.toLocaleString()}
              label="Views"
              sub={`${traffic.totalViews.toLocaleString()} all time`}
            />
            <Stat
              icon={Users}
              value={traffic.monthUnique.toLocaleString()}
              label="Visitors"
              sub={`${traffic.totalUnique.toLocaleString()} all time`}
            />
            <Stat
              icon={TrendingUp}
              value={traffic.weekViews.toLocaleString()}
              label="This week"
            />
            <Stat icon={Sparkles} value={traffic.todayViews.toLocaleString()} label="Today" />
          </div>

          {traffic.dailyViews.length > 0 && (
            <div className="mb-6">
              <p className="mb-3 text-xs text-ink-3">Daily views</p>
              <div className="flex h-28 items-end gap-1">
                {traffic.dailyViews.map((d) => {
                  const max = Math.max(...traffic.dailyViews.map((v) => Number(v.views)), 1);
                  return (
                    <div
                      key={d.day}
                      className="group relative flex-1"
                      title={`${d.day}: ${d.views} views, ${d.visitors} visitors`}
                    >
                      <div
                        className="w-full rounded-t bg-signal transition-colors group-hover:bg-signal-ink"
                        style={{
                          height: `${(Number(d.views) / max) * 100}%`,
                          minHeight: "2px",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="min-w-0 sm:col-span-2 lg:col-span-1">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-ink-3">
                Top pages
              </p>
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
                      <span className="shrink-0 text-[11px] text-ink-3">
                        {Number(page.views).toLocaleString()} views
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-ink-3">
                Devices
              </p>
              {traffic.deviceBreakdown.length === 0 ? (
                <p className="text-xs text-ink-3">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {traffic.deviceBreakdown.map((d) => {
                    const total = traffic.deviceBreakdown.reduce(
                      (sum, v) => sum + Number(v.count),
                      0,
                    );
                    const pct = total > 0 ? Math.round((Number(d.count) / total) * 100) : 0;
                    const Icon =
                      d.device === "mobile" ? Smartphone : d.device === "tablet" ? Tablet : Monitor;
                    return (
                      <div
                        key={d.device}
                        className="flex items-center gap-3 rounded-lg bg-surface-hi px-3 py-2"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 text-signal-ink" />
                        <span className="min-w-0 flex-1 truncate text-xs capitalize text-ink-2">
                          {d.device}
                        </span>
                        <span className="shrink-0 text-[11px] text-ink-3">{pct}%</span>
                        <div className="h-1.5 w-10 shrink-0 overflow-hidden rounded-full bg-white/[0.08] sm:w-16">
                          <div className="h-full rounded-full bg-signal" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-ink-3">
                Top referrers
              </p>
              {traffic.topReferrers.length === 0 ? (
                <p className="text-xs text-ink-3">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {traffic.topReferrers.map((ref) => (
                    <div
                      key={ref.source}
                      className="flex items-center justify-between gap-2 rounded-lg bg-surface-hi px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Globe className="h-3.5 w-3.5 shrink-0 text-signal-ink" />
                        <span className="truncate text-xs text-ink-2">{ref.source}</span>
                      </div>
                      <span className="shrink-0 text-[11px] text-ink-3">
                        {Number(ref.count).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Panel>

        {/* ── Reference ── */}
        <Panel title="Contact numbers">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-8">
            {Object.values(BUSINESS.phones).map((phone) => (
              <div key={phone.label} className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-signal-ink" />
                <div>
                  <p className="text-[11px] text-ink-3">{phone.label}</p>
                  <a
                    href={phone.href}
                    className="inline-flex min-h-9 items-center text-sm text-white transition-colors hover:text-signal-ink"
                  >
                    {phone.number}
                  </a>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-signal-ink" />
              <div className="min-w-0">
                <p className="text-[11px] text-ink-3">Email</p>
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="inline-flex min-h-9 items-center break-all text-sm text-white transition-colors hover:text-signal-ink"
                >
                  {BUSINESS.email}
                </a>
              </div>
            </div>
          </div>
        </Panel>
      </main>
    </div>
  );
}
