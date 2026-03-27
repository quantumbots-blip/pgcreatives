import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Clock,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  TrendingUp,
  Users,
} from "lucide-react";
import { getSubmissions, getSubmissionStats } from "@/lib/db";
import { logoutAction } from "@/app/actions/auth";
import { SubmissionsTable } from "./submissions-table";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session || session.value !== "authenticated") {
    redirect("/admin/login");
  }

  let stats = { total: 0, thisMonth: 0, thisWeek: 0, topService: "N/A", daily: [] as { day: string; count: number }[] };
  let submissions: Awaited<ReturnType<typeof getSubmissions>> = [];
  let dbError = false;

  try {
    [stats, submissions] = await Promise.all([
      getSubmissionStats(),
      getSubmissions(),
    ]);
  } catch {
    dbError = true;
  }

  const maxDaily = Math.max(...stats.daily.map((d) => Number(d.count)), 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-purple/10 bg-purple/[0.02]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-purple-light" />
            <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-white/40 hover:text-white transition-colors">
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
              Database connection failed. Make sure DATABASE_URL is set in your environment variables.
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-purple/10 bg-purple/[0.03] p-6">
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

          <div className="rounded-xl border border-purple/10 bg-purple/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/15">
                <Calendar className="h-5 w-5 text-purple-light" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
                <p className="text-xs text-white/40">This Month</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-purple/10 bg-purple/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/15">
                <TrendingUp className="h-5 w-5 text-purple-light" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
                <p className="text-xs text-white/40">This Week</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-purple/10 bg-purple/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/15">
                <Users className="h-5 w-5 text-purple-light" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white truncate max-w-[140px]">{stats.topService}</p>
                <p className="text-xs text-white/40">Top Service</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart — Last 30 Days */}
        <div className="mt-8 rounded-xl border border-purple/10 bg-purple/[0.03] p-6">
          <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.15em] text-white/50">
            Submissions — Last 30 Days
          </h2>
          {stats.daily.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/30">No submissions yet</p>
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
                    style={{ height: `${(Number(d.count) / maxDaily) * 100}%`, minHeight: "4px" }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-8 rounded-xl border border-purple/10 bg-purple/[0.03] p-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-white/50">
            Contact Numbers
          </h2>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-purple/60" />
              <div>
                <p className="text-xs text-white/40">Green Bay</p>
                <a href="tel:+19207770127" className="text-sm text-white hover:text-purple-light transition-colors">(920) 777-0127</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-purple/60" />
              <div>
                <p className="text-xs text-white/40">Madison</p>
                <a href="tel:+16084206199" className="text-sm text-white hover:text-purple-light transition-colors">(608) 420-6199</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-purple/60" />
              <div>
                <p className="text-xs text-white/40">Email</p>
                <a href="mailto:pgcreativeswisconsin@gmail.com" className="text-sm text-white hover:text-purple-light transition-colors">pgcreativeswisconsin@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
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
