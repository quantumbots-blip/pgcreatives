import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import {
  Archive,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  ensureSchema,
  getSubmissions,
  getSubmissionStats,
  getServiceBreakdown,
  getStatusCounts,
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
  let dbError = false;

  try {
    await ensureSchema();
    [stats, submissions, serviceBreakdown, statusCounts] = await Promise.all([
      getSubmissionStats(),
      getSubmissions(),
      getServiceBreakdown(),
      getStatusCounts(),
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
            <a
              href="/"
              className="text-sm text-white/40 hover:text-white transition-colors"
            >
              View Site
            </a>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg border border-purple/15 px-4 py-2 text-sm text-white/50 transition-colors hover:border-purple/30 hover:text-white"
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
              Database connection failed. Make sure DATABASE_URL is set in your
              environment variables.
            </p>
          </div>
        )}

        {/* ── Stats Cards ── */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Total */}
          <div className="rounded-xl border border-purple/10 bg-purple/[0.03] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/15">
                <MessageSquare className="h-5 w-5 text-purple-light" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-white/40">Total Submissions</p>
              </div>
            </div>
          </div>

          {/* New Leads */}
          <div className="rounded-xl border border-purple/10 bg-purple/[0.03] p-5 relative overflow-hidden">
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
                <p className="text-xs text-white/40">New Leads</p>
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="rounded-xl border border-purple/10 bg-purple/[0.03] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/15">
                <Calendar className="h-5 w-5 text-purple-light" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.thisMonth}
                </p>
                <p className="text-xs text-white/40">This Month</p>
              </div>
            </div>
          </div>

          {/* This Week + trend */}
          <div className="rounded-xl border border-purple/10 bg-purple/[0.03] p-5">
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
                <p className="text-xs text-white/40">This Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Lead Pipeline ── */}
        <div className="mt-8 rounded-xl border border-purple/10 bg-purple/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-white/50">
              Lead Pipeline
            </h2>
            {activePipeline > 0 && (
              <span className="text-xs text-white/30">
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
              <p className="mt-1 text-xs text-white/40">New</p>
              <ChevronRight className="absolute right-0 top-1/2 hidden h-4 w-4 -translate-y-1/2 translate-x-1/2 text-white/15 sm:block" />
            </div>

            {/* Contacted */}
            <div className="relative rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-center">
              <Send className="mx-auto mb-2 h-5 w-5 text-amber-400" />
              <p className="text-2xl font-bold text-amber-400">
                {statusCounts.contacted}
              </p>
              <p className="mt-1 text-xs text-white/40">Contacted</p>
              <ChevronRight className="absolute right-0 top-1/2 hidden h-4 w-4 -translate-y-1/2 translate-x-1/2 text-white/15 sm:block" />
            </div>

            {/* Booked */}
            <div className="relative rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-5 w-5 text-emerald-400" />
              <p className="text-2xl font-bold text-emerald-400">
                {statusCounts.booked}
              </p>
              <p className="mt-1 text-xs text-white/40">Booked</p>
              <ChevronRight className="absolute right-0 top-1/2 hidden h-4 w-4 -translate-y-1/2 translate-x-1/2 text-white/15 sm:block" />
            </div>

            {/* Archived */}
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-4 text-center">
              <Archive className="mx-auto mb-2 h-5 w-5 text-white/30" />
              <p className="text-2xl font-bold text-white/40">
                {statusCounts.archived}
              </p>
              <p className="mt-1 text-xs text-white/40">Archived</p>
            </div>
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          {/* Service Demand */}
          <div className="rounded-xl border border-purple/10 bg-purple/[0.03] p-6 lg:col-span-5">
            <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.15em] text-white/50">
              Service Demand
            </h2>
            <ServiceChart data={serviceBreakdown} />
          </div>

          {/* 30-Day Trend */}
          <div className="rounded-xl border border-purple/10 bg-purple/[0.03] p-6 lg:col-span-7">
            <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.15em] text-white/50">
              Submissions &mdash; Last 30 Days
            </h2>
            {stats.daily.length === 0 ? (
              <p className="py-10 text-center text-sm text-white/30">
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
        <div className="mt-8 rounded-xl border border-purple/10 bg-purple/[0.03] p-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-white/50">
            Contact Numbers
          </h2>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-purple/60" />
              <div>
                <p className="text-xs text-white/40">Green Bay</p>
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
                <p className="text-xs text-white/40">Madison</p>
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
                <p className="text-xs text-white/40">Email</p>
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
        <div className="mt-8 rounded-xl border border-purple/10 bg-purple/[0.03] p-6">
          <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.15em] text-white/50">
            All Submissions
          </h2>
          <SubmissionsTable submissions={submissions} />
        </div>
      </main>
    </div>
  );
}
