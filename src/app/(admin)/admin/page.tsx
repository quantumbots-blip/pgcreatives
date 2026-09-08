import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionFull } from "@/lib/auth";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
import {
  ensureSchema,
  ensurePageViewsTable,
  getSubmissions,
  getSpamSubmissions,
  getSubmissionStats,
  getServiceBreakdown,
  getStatusCounts,
  getSpamStats,
} from "@/lib/db";
import type { SubmissionStatus } from "@/lib/db";
import { getResponseInsights, getLeadsByDay } from "@/lib/insights";
import { BUSINESS } from "@/lib/data";
import { SubmissionsTable } from "./submissions-table";
import { NewLeads } from "./new-leads";
import { ServiceChart } from "./service-chart";
import { AdminNav } from "./nav";
import { AddLead } from "./add-lead";
import { LeadAlerts } from "./alerts";
import { Panel, Stat, BarChart } from "./ui";

export const dynamic = "force-dynamic";

/** "3h" or "2d", whichever reads better for the size of the number. */
function humanHours(hours: number | null): string {
  if (hours === null) return "n/a";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
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
  let spamStats = { quarantinedTotal: 0, quarantinedWeek: 0, blockedWeek: 0, blockedTotal: 0 };
  let response: Awaited<ReturnType<typeof getResponseInsights>> = {
    medianHours: null,
    answeredCount: 0,
    sameDayPct: null,
    oldestWaitingHours: null,
    waitingCount: 0,
  };
  let leadsByDay: { day: string; count: number }[] = [];
  let dbError = false;

  try {
    await Promise.all([ensureSchema(), ensurePageViewsTable()]);
    [stats, submissions, spam, serviceBreakdown, statusCounts, spamStats, response, leadsByDay] =
      await Promise.all([
        getSubmissionStats(),
        getSubmissions(),
        getSpamSubmissions(),
        getServiceBreakdown(),
        getStatusCounts(),
        getSpamStats(),
        getResponseInsights(),
        getLeadsByDay(30),
      ]);
  } catch {
    dbError = true;
  }

  /* Needs a reply is not simply "new" any more. A lead the owner parked until
     Thursday is exactly as much of a to do on Thursday as one that arrived
     that morning, so a due follow up joins the same list rather than sitting
     in a second one nobody would open. */
  const needsReply = submissions.filter((s) => {
    const status = s.status || "new";
    if (status === "new") return true;
    if (status === "archived") return false;
    return s.follow_up_due;
  });

  const filteredWeek = spamStats.quarantinedWeek + spamStats.blockedWeek;
  const weekDiff = stats.thisWeek - stats.lastWeek;
  const weekTrendPct =
    stats.lastWeek > 0
      ? Math.round((weekDiff / stats.lastWeek) * 100)
      : stats.thisWeek > 0
        ? null
        : 0;

  /* Empty when the keys are not set, which hides the toggle rather than
     offering a button that cannot work. */
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

  const activePipeline = stats.total - statusCounts.archived;
  const conversionRate =
    activePipeline > 0 ? Math.round((statusCounts.booked / activePipeline) * 100) : 0;

  return (
    <div className="min-h-screen bg-ground">
      <AdminNav waiting={needsReply.length} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
        {dbError && (
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-5 py-4">
            <p className="text-sm text-amber-300">
              Dashboard temporarily unavailable. Please try again later.
            </p>
          </div>
        )}

        {/* Everyone waiting on a reply, before anything else on the page. */}
        <NewLeads leads={needsReply} />

        {vapidKey && <LeadAlerts vapidKey={vapidKey} />}

        <div className="flex flex-wrap items-start gap-3">
          <AddLead />
        </div>

        {/* ── The numbers ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            icon={Sparkles}
            value={needsReply.length}
            label="Needs a reply"
            accent
            sub={
              response.oldestWaitingHours === null
                ? "nothing waiting"
                : `longest wait ${humanHours(response.oldestWaitingHours)}`
            }
          />
          <Stat
            icon={Timer}
            value={humanHours(response.medianHours)}
            label="Typical reply time"
            sub={
              response.answeredCount === 0
                ? "starts once you answer one"
                : `${response.sameDayPct}% inside a day, over ${response.answeredCount} answered`
            }
          />
          <Stat
            icon={TrendingUp}
            value={stats.thisWeek}
            label="This week"
            delta={weekTrendPct}
            sub={`${stats.lastWeek} the week before`}
          />
          <Stat
            icon={ShieldCheck}
            value={filteredWeek}
            label="Spam filtered"
            sub={
              filteredWeek === 0
                ? "nothing caught this week"
                : `${spamStats.blockedWeek} blocked, ${spamStats.quarantinedWeek} held`
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
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4 text-xs text-ink-3">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-signal-ink" />
              {response.answeredCount === 0
                ? "No reply times recorded yet"
                : `${response.answeredCount} answered, typically in ${humanHours(response.medianHours)}`}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-signal-ink" />
              {stats.thisMonth} this month, {stats.total} all time
            </span>
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
            <Panel title="Leads, last 30 days">
              <BarChart
                data={leadsByDay.map((d) => ({
                  day: d.day,
                  value: d.count,
                  hint: `${d.day}: ${d.count} lead${d.count === 1 ? "" : "s"}`,
                }))}
                emptyLabel="No leads in the last 30 days"
              />
            </Panel>
          </div>
        </div>

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
