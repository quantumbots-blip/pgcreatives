import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySessionToken } from "@/lib/auth";
import {
  Archive,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Eye,
  Globe,
  LogOut,
  Mail,
  MessageSquare,
  Monitor,
  Phone,
  Send,
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
  getSubmissionStats,
  getServiceBreakdown,
  getStatusCounts,
  getPageViewStats,
} from "@/lib/db";
import type { SubmissionStatus } from "@/lib/db";
import { logoutAction } from "@/app/actions/auth";
import { SubmissionsTable } from "./submissions-table";
import { ServiceChart } from "./service-chart";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session || !verifySessionToken(session.value)) {
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
  let dbError = false;

  try {
    await Promise.all([ensureSchema(), ensurePageViewsTable()]);
    [stats, submissions, serviceBreakdown, statusCounts, traffic] =
      await Promise.all([
        getSubmissionStats(),
        getSubmissions(),
        getServiceBreakdown(),
        getStatusCounts(),
        getPageViewStats(),
      ]);
  } catch {
    dbError = true;
  }

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
    activePipeline > 0
      ? Math.round((statusCounts.booked / activePipeline) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-purple/10 bg-purple/[0.02]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-purple-light" />
            <h1 className="text-lg font-semibold text-white">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              View Site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg border border-purple/15 px-4 py-2 text-sm text-white/60 transition-colors hover:border-purple/30 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {dbError && (
          <div className="mb-8 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-5 py-4">
            <p className="text-sm text-yellow-400">
              Dashboard temporarily unavailable. Please try again later.
            </p>
          </div>
        )}

        {/* ── Stats Cards ── */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Total */}
          <div className="rounded-xl border border-purple/20 bg-purple/[0.06] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/15">
                <MessageSquare className="h-5 w-5 text-purple-light" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-white/60">Total Submissions</p>
              </div>
            </div>
          </div>

          {/* New Leads */}
          <div className="rounded-xl border border-purple/20 bg-purple/[0.06] p-5 relative overflow-hidden">
            {stats.newLeads > 0 && (
              <div className="absolute inset-0 bg-purple/[0.04] animate-pulse pointer-events-none" />
            )}
            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/20">
                <Sparkles className="h-5 w-5 text-purple-light" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-light">
                  {stats.newLeads}
                </p>
                <p className="text-xs text-white/60">New Leads</p>
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="rounded-xl border border-purple/20 bg-purple/[0.06] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/15">
                <Calendar className="h-5 w-5 text-purple-light" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.thisMonth}
                </p>
                <p className="text-xs text-white/60">This Month</p>
              </div>
            </div>
          </div>

          {/* This Week + trend */}
          <div className="rounded-xl border border-purple/20 bg-purple/[0.06] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/15">
                <TrendingUp className="h-5 w-5 text-purple-light" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-white">
                    {stats.thisWeek}
                  </p>
                  {weekTrendPct !== 0 && (
                    <span
                      className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        weekDiff >= 0
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {weekDiff >= 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(weekTrendPct)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/60">This Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Website Traffic ── */}
        <div className="mt-8 rounded-xl border border-purple/20 bg-purple/[0.06] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-white/60">
              Website Traffic
            </h2>
            <span className="text-xs text-white/60">Last 30 days</span>
          </div>

          {/* Traffic stat cards */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="rounded-lg border border-purple/20 bg-purple/[0.08] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-purple/60" />
                <span className="text-[10px] uppercase tracking-wider text-white/60">Views</span>
              </div>
              <p className="text-2xl font-bold text-white">{traffic.monthViews.toLocaleString()}</p>
              <p className="text-[10px] text-white/60 mt-1">{traffic.totalViews.toLocaleString()} all time</p>
            </div>
            <div className="rounded-lg border border-purple/20 bg-purple/[0.08] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple/60" />
                <span className="text-[10px] uppercase tracking-wider text-white/60">Visitors</span>
              </div>
              <p className="text-2xl font-bold text-white">{traffic.monthUnique.toLocaleString()}</p>
              <p className="text-[10px] text-white/60 mt-1">{traffic.totalUnique.toLocaleString()} all time</p>
            </div>
            <div className="rounded-lg border border-purple/20 bg-purple/[0.08] p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple/60" />
                <span className="text-[10px] uppercase tracking-wider text-white/60">This Week</span>
              </div>
              <p className="text-2xl font-bold text-white">{traffic.weekViews.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-purple/20 bg-purple/[0.08] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple/60" />
                <span className="text-[10px] uppercase tracking-wider text-white/60">Today</span>
              </div>
              <p className="text-2xl font-bold text-white">{traffic.todayViews.toLocaleString()}</p>
            </div>
          </div>

          {/* Traffic chart */}
          {traffic.dailyViews.length > 0 && (
            <div className="mb-6">
              <p className="mb-3 text-xs text-white/60">Daily Views</p>
              <div className="flex items-end gap-1 h-28">
                {traffic.dailyViews.map((d) => {
                  const max = Math.max(
                    ...traffic.dailyViews.map((v) => Number(v.views)),
                    1
                  );
                  return (
                    <div
                      key={d.day}
                      className="flex-1 group relative"
                      title={`${d.day}: ${d.views} views, ${d.visitors} visitors`}
                    >
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-purple/40 to-purple-light/60 transition-all hover:from-purple hover:to-purple-light"
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

          {/* Bottom row: Top Pages, Devices, Referrers */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Top Pages */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/60">
                Top Pages
              </p>
              {traffic.topPages.length === 0 ? (
                <p className="text-xs text-white/20">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {traffic.topPages.map((page) => (
                    <div
                      key={page.path}
                      className="flex items-center justify-between rounded-lg bg-white/[0.05] px-3 py-2"
                    >
                      <span className="text-xs text-white/70 font-mono truncate max-w-[140px]">
                        {page.path}
                      </span>
                      <div className="flex items-center gap-3 text-[10px] text-white/60 shrink-0">
                        <span>{Number(page.views).toLocaleString()} views</span>
                        <span>{Number(page.visitors).toLocaleString()} visitors</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Device Breakdown */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/60">
                Devices
              </p>
              {traffic.deviceBreakdown.length === 0 ? (
                <p className="text-xs text-white/20">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {traffic.deviceBreakdown.map((d) => {
                    const total = traffic.deviceBreakdown.reduce(
                      (sum, v) => sum + Number(v.count),
                      0
                    );
                    const pct = total > 0 ? Math.round((Number(d.count) / total) * 100) : 0;
                    const Icon =
                      d.device === "mobile"
                        ? Smartphone
                        : d.device === "tablet"
                          ? Tablet
                          : Monitor;
                    return (
                      <div
                        key={d.device}
                        className="flex items-center gap-3 rounded-lg bg-white/[0.05] px-3 py-2"
                      >
                        <Icon className="h-3.5 w-3.5 text-purple/50 shrink-0" />
                        <span className="text-xs text-white/70 capitalize flex-1">
                          {d.device}
                        </span>
                        <span className="text-[10px] text-white/60">{pct}%</span>
                        <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple/50"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Referrers */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/60">
                Top Referrers
              </p>
              {traffic.topReferrers.length === 0 ? (
                <p className="text-xs text-white/20">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {traffic.topReferrers.map((ref) => (
                    <div
                      key={ref.source}
                      className="flex items-center justify-between rounded-lg bg-white/[0.05] px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe className="h-3.5 w-3.5 text-purple/50 shrink-0" />
                        <span className="text-xs text-white/70 truncate">
                          {ref.source}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/60 shrink-0 ml-2">
                        {Number(ref.count).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Lead Pipeline ── */}
        <div className="mt-8 rounded-xl border border-purple/20 bg-purple/[0.06] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-white/60">
              Lead Pipeline
            </h2>
            {activePipeline > 0 && (
              <span className="text-xs text-white/60">
                {conversionRate}% conversion rate
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* New */}
            <div className="relative rounded-lg border border-purple/20 bg-purple/10 p-4 text-center">
              <Sparkles className="mx-auto mb-2 h-5 w-5 text-purple-light" />
              <p className="text-2xl font-bold text-purple-light">
                {statusCounts.new}
              </p>
              <p className="mt-1 text-xs text-white/60">New</p>
              <ChevronRight className="absolute right-0 top-1/2 hidden h-4 w-4 -translate-y-1/2 translate-x-1/2 text-white/15 sm:block" />
            </div>

            {/* Contacted */}
            <div className="relative rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-center">
              <Send className="mx-auto mb-2 h-5 w-5 text-amber-400" />
              <p className="text-2xl font-bold text-amber-400">
                {statusCounts.contacted}
              </p>
              <p className="mt-1 text-xs text-white/60">Contacted</p>
              <ChevronRight className="absolute right-0 top-1/2 hidden h-4 w-4 -translate-y-1/2 translate-x-1/2 text-white/15 sm:block" />
            </div>

            {/* Booked */}
            <div className="relative rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-5 w-5 text-emerald-400" />
              <p className="text-2xl font-bold text-emerald-400">
                {statusCounts.booked}
              </p>
              <p className="mt-1 text-xs text-white/60">Booked</p>
              <ChevronRight className="absolute right-0 top-1/2 hidden h-4 w-4 -translate-y-1/2 translate-x-1/2 text-white/15 sm:block" />
            </div>

            {/* Archived */}
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-4 text-center">
              <Archive className="mx-auto mb-2 h-5 w-5 text-white/60" />
              <p className="text-2xl font-bold text-white/60">
                {statusCounts.archived}
              </p>
              <p className="mt-1 text-xs text-white/60">Archived</p>
            </div>
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          {/* Service Demand */}
          <div className="rounded-xl border border-purple/20 bg-purple/[0.06] p-6 lg:col-span-5">
            <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.15em] text-white/60">
              Service Demand
            </h2>
            <ServiceChart data={serviceBreakdown} />
          </div>

          {/* 30-Day Trend */}
          <div className="rounded-xl border border-purple/20 bg-purple/[0.06] p-6 lg:col-span-7">
            <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.15em] text-white/60">
              Submissions &mdash; Last 30 Days
            </h2>
            {stats.daily.length === 0 ? (
              <p className="py-10 text-center text-sm text-white/60">
                No submissions yet
              </p>
            ) : (
              <div className="flex items-end gap-1 h-40">
                {stats.daily.map((d) => (
                  <div
                    key={d.day}
                    className="flex-1 group relative"
                    title={`${d.day}: ${d.count} submission${Number(d.count) !== 1 ? "s" : ""}`}
                  >
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-purple-dim to-purple transition-all hover:from-purple hover:to-purple-light"
                      style={{
                        height: `${(Number(d.count) / maxDaily) * 100}%`,
                        minHeight: "4px",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Contact Info ── */}
        <div className="mt-8 rounded-xl border border-purple/20 bg-purple/[0.06] p-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-white/60">
            Contact Numbers
          </h2>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-purple/60" />
              <div>
                <p className="text-xs text-white/60">Green Bay</p>
                <a
                  href="tel:+19207770127"
                  className="text-sm text-white hover:text-purple-light transition-colors"
                >
                  (920) 777-0127
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-purple/60" />
              <div>
                <p className="text-xs text-white/60">Madison</p>
                <a
                  href="tel:+16084206199"
                  className="text-sm text-white hover:text-purple-light transition-colors"
                >
                  (608) 420-6199
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-purple/60" />
              <div>
                <p className="text-xs text-white/60">Email</p>
                <a
                  href="mailto:pgcreativeswisconsin@gmail.com"
                  className="text-sm text-white hover:text-purple-light transition-colors"
                >
                  pgcreativeswisconsin@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Submissions Table ── */}
        <div className="mt-8 rounded-xl border border-purple/20 bg-purple/[0.06] p-6">
          <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.15em] text-white/60">
            All Submissions
          </h2>
          <SubmissionsTable submissions={submissions} />
        </div>
      </main>
    </div>
  );
}
