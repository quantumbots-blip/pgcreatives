import { getDb } from "@/lib/db";

/**
 * Everything the dashboard needs to answer a question rather than show a
 * number: how the site is doing against last month, which channels actually
 * produce leads rather than visits, how fast inquiries get answered, and when
 * the audience is awake.
 *
 * Two rules run through all of it.
 *
 * Dates are Wisconsin dates. Postgres stores timestamptz in UTC, so grouping
 * on DATE(created_at) puts an inquiry sent at 7pm on a Tuesday into
 * Wednesday's bar. Every date and hour here is converted to America/Chicago
 * first, which is the only reading that matches what the owner remembers
 * happening.
 *
 * Every window comes with the window before it. A number on its own says
 * nothing: 461 views is only good or bad next to what the previous stretch
 * did, so each stat carries its own comparison.
 */

export const BUSINESS_TZ = "America/Chicago";

/** Ranges the traffic view offers. `all` means since tracking began. */
export type RangeKey = "7" | "30" | "90" | "all";

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
  { key: "all", label: "All time" },
];

export function parseRange(value: string | undefined): RangeKey {
  return RANGE_OPTIONS.some((r) => r.key === value) ? (value as RangeKey) : "30";
}

export function rangeDays(range: RangeKey): number | null {
  return range === "all" ? null : Number(range);
}

export type Delta = {
  current: number;
  previous: number;
  /** Percent change, or null when there is no previous figure to divide by. */
  pct: number | null;
};

function delta(current: number, previous: number, comparable = true): Delta {
  return {
    current,
    previous,
    pct: comparable && previous > 0 ? Math.round(((current - previous) / previous) * 100) : null,
  };
}

/* ── Referrer channels ────────────────────────────────────────────────
   A list of hostnames is not an answer. "l.instagram.com" and
   "instagram.com" are one channel, and four search engines are one line
   worth of information, not four. */

export type Channel = "Instagram" | "Search" | "Facebook" | "Direct" | "Other";

export function channelFor(host: string | null): Channel {
  if (!host) return "Direct";
  const h = host.toLowerCase();
  // The sentinel a lead carries when the visit had no referrer at all.
  if (h === "direct" || h === "phone" || h === "referral") return "Direct";
  if (h.includes("instagram")) return "Instagram";
  if (
    h.includes("google") ||
    h.includes("bing") ||
    h.includes("yahoo") ||
    h.includes("duckduckgo") ||
    h.includes("ecosia") ||
    h.includes("search")
  ) {
    return "Search";
  }
  if (h.includes("facebook") || h.includes("fb.")) return "Facebook";
  return "Other";
}

export const CHANNEL_ORDER: Channel[] = ["Instagram", "Search", "Facebook", "Direct", "Other"];

/* ── Traffic ─────────────────────────────────────────────────────────── */

export type TrafficInsights = {
  views: Delta;
  visitors: Delta;
  /** Leads that arrived in the same window, and what share of visitors that is. */
  leads: Delta;
  conversionPct: number | null;
  daily: { day: string; views: number; visitors: number }[];
  channels: { channel: Channel; views: number; visitors: number }[];
  topPages: { path: string; views: number; visitors: number }[];
  devices: { device: string; count: number }[];
  referrers: { source: string; count: number }[];
  /** 7 rows of 24, Sunday first, in Wisconsin time. */
  heatmap: number[][];
  heatmapPeak: number;
  rangeLabel: string;
  /* Visitor counting only became trustworthy once ANALYTICS_SALT was set, so
     the view carries a note saying so. Ninety days on it is no longer news
     and the flag goes false on its own. */
  showVisitorAccuracyNote: boolean;
};

/** When the salt was set and unique visitors started meaning something. */
export const VISITOR_FIX_DATE = new Date("2026-09-07T00:00:00Z");

export async function getTrafficInsights(range: RangeKey): Promise<TrafficInsights> {
  const sql = getDb();
  const days = rangeDays(range);

  /* Two separate ideas, which an earlier version conflated to its cost.
     `windowStart` is what the charts draw. `priorStart` is only ever used to
     work out the comparison chip.

     On "All time" there is no earlier stretch to compare against, so the
     comparison is simply absent. It previously borrowed the midpoint of the
     record as a window start so that a percentage could be shown, which meant
     picking All time quietly drew half the history: the heatmap named a peak
     hour that was not the real one. A missing comparison is better than a
     chart that is not showing what its label says. */
  const windowStart =
    days === null
      ? new Date(0).toISOString()
      : new Date(Date.now() - days * 86_400_000).toISOString();
  const priorStart =
    days === null
      ? null
      : new Date(Date.now() - days * 2 * 86_400_000).toISOString();

  const [totals] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= ${windowStart})::int                     AS views,
      COUNT(DISTINCT visitor_hash) FILTER (WHERE created_at >= ${windowStart})::int AS visitors,
      COUNT(*) FILTER (WHERE ${priorStart}::timestamptz IS NOT NULL
                         AND created_at >= ${priorStart}
                         AND created_at <  ${windowStart})::int                     AS prev_views,
      COUNT(DISTINCT visitor_hash) FILTER (WHERE ${priorStart}::timestamptz IS NOT NULL
                         AND created_at >= ${priorStart}
                         AND created_at <  ${windowStart})::int                     AS prev_visitors
    FROM page_views
  `;

  const [leadTotals] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= ${windowStart})::int  AS leads,
      COUNT(*) FILTER (WHERE ${priorStart}::timestamptz IS NOT NULL
                         AND created_at >= ${priorStart}
                         AND created_at <  ${windowStart})::int  AS prev_leads
    FROM submissions
    WHERE NOT COALESCE(is_spam, FALSE)
  `;

  const dailyRows = await sql`
    SELECT to_char(created_at AT TIME ZONE ${BUSINESS_TZ}, 'YYYY-MM-DD') AS day,
           COUNT(*)::int                     AS views,
           COUNT(DISTINCT visitor_hash)::int AS visitors
    FROM page_views
    WHERE created_at >= ${windowStart}
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  const referrerRows = await sql`
    SELECT COALESCE(NULLIF(referrer, ''), '') AS source,
           COUNT(*)::int                      AS views,
           COUNT(DISTINCT visitor_hash)::int  AS visitors
    FROM page_views
    WHERE created_at >= ${windowStart}
    GROUP BY 1
  `;

  const pageRows = await sql`
    SELECT path, COUNT(*)::int AS views, COUNT(DISTINCT visitor_hash)::int AS visitors
    FROM page_views
    WHERE created_at >= ${windowStart}
    GROUP BY path
    ORDER BY views DESC
    LIMIT 8
  `;

  const deviceRows = await sql`
    SELECT device, COUNT(*)::int AS count
    FROM page_views
    WHERE created_at >= ${windowStart}
    GROUP BY device
    ORDER BY count DESC
  `;

  const heatRows = await sql`
    SELECT EXTRACT(dow  FROM created_at AT TIME ZONE ${BUSINESS_TZ})::int AS dow,
           EXTRACT(hour FROM created_at AT TIME ZONE ${BUSINESS_TZ})::int AS hour,
           COUNT(*)::int AS count
    FROM page_views
    WHERE created_at >= ${windowStart}
    GROUP BY 1, 2
  `;

  // Fold the hostnames into channels.
  const byChannel = new Map<Channel, { views: number; visitors: number }>();
  const namedReferrers: { source: string; count: number }[] = [];
  for (const row of referrerRows) {
    const host = String(row.source || "");
    const channel = channelFor(host || null);
    const entry = byChannel.get(channel) ?? { views: 0, visitors: 0 };
    entry.views += Number(row.views);
    entry.visitors += Number(row.visitors);
    byChannel.set(channel, entry);
    if (host) namedReferrers.push({ source: host, count: Number(row.views) });
  }
  namedReferrers.sort((a, b) => b.count - a.count);

  const heatmap: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  let heatmapPeak = 0;
  for (const row of heatRows) {
    const d = Number(row.dow);
    const h = Number(row.hour);
    const c = Number(row.count);
    if (d >= 0 && d < 7 && h >= 0 && h < 24) {
      heatmap[d][h] = c;
      if (c > heatmapPeak) heatmapPeak = c;
    }
  }

  const views = Number(totals?.views ?? 0);
  const visitors = Number(totals?.visitors ?? 0);
  const leads = Number(leadTotals?.leads ?? 0);

  return {
    views: delta(views, Number(totals?.prev_views ?? 0), priorStart !== null),
    visitors: delta(visitors, Number(totals?.prev_visitors ?? 0), priorStart !== null),
    leads: delta(leads, Number(leadTotals?.prev_leads ?? 0), priorStart !== null),
    // Rounded to one decimal: at this volume a whole number reads 0% forever.
    conversionPct: visitors > 0 ? Math.round((leads / visitors) * 1000) / 10 : null,
    daily: dailyRows.map((r) => ({
      day: String(r.day),
      views: Number(r.views),
      visitors: Number(r.visitors),
    })),
    channels: CHANNEL_ORDER.filter((c) => byChannel.has(c)).map((c) => ({
      channel: c,
      views: byChannel.get(c)!.views,
      visitors: byChannel.get(c)!.visitors,
    })),
    topPages: pageRows.map((r) => ({
      path: String(r.path),
      views: Number(r.views),
      visitors: Number(r.visitors),
    })),
    devices: deviceRows.map((r) => ({ device: String(r.device), count: Number(r.count) })),
    referrers: namedReferrers.slice(0, 8),
    heatmap,
    heatmapPeak,
    rangeLabel: range === "all" ? "All time" : `Last ${range} days`,
    showVisitorAccuracyNote:
      Date.now() - VISITOR_FIX_DATE.getTime() < 90 * 86_400_000,
  };
}

/* ── How fast inquiries get answered ─────────────────────────────────── */

export type ResponseInsights = {
  /** Median hours from arrival to the first reply, over answered leads. */
  medianHours: number | null;
  answeredCount: number;
  /** Answered inside a day, as a share of answered leads. */
  sameDayPct: number | null;
  /** Longest anybody is currently still waiting, in hours. */
  oldestWaitingHours: number | null;
  waitingCount: number;
};

export async function getResponseInsights(): Promise<ResponseInsights> {
  const sql = getDb();
  const [row] = await sql`
    SELECT
      PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY EXTRACT(epoch FROM (contacted_at - created_at)) / 3600
      ) FILTER (WHERE contacted_at IS NOT NULL)                                    AS median_hours,
      COUNT(*) FILTER (WHERE contacted_at IS NOT NULL)::int                        AS answered,
      COUNT(*) FILTER (WHERE contacted_at IS NOT NULL
                         AND contacted_at - created_at <= INTERVAL '24 hours')::int AS same_day,
      MAX(EXTRACT(epoch FROM (NOW() - created_at)) / 3600)
        FILTER (WHERE COALESCE(status, 'new') = 'new')                             AS oldest_waiting,
      COUNT(*) FILTER (WHERE COALESCE(status, 'new') = 'new')::int                 AS waiting
    FROM submissions
    WHERE NOT COALESCE(is_spam, FALSE)
  `;

  const answered = Number(row?.answered ?? 0);
  return {
    medianHours: row?.median_hours == null ? null : Number(row.median_hours),
    answeredCount: answered,
    sameDayPct: answered > 0 ? Math.round((Number(row.same_day) / answered) * 100) : null,
    oldestWaitingHours: row?.oldest_waiting == null ? null : Number(row.oldest_waiting),
    waitingCount: Number(row?.waiting ?? 0),
  };
}

/* ── Which channels produce leads, not just visits ───────────────────── */

export type LeadSourceRow = { channel: Channel; leads: number };

export type LeadSources = {
  rows: LeadSourceRow[];
  /** Leads that predate attribution, or whose browser refused storage. */
  unattributed: number;
};

/**
 * Which channels produce leads, as opposed to visits.
 *
 * A null source is not a direct arrival, it is a lead we know nothing about:
 * every inquiry from before this was built has one. Counting those as direct
 * would invent years of traffic the site never measured, so they are reported
 * separately and honestly.
 */
export async function getLeadSources(): Promise<LeadSources> {
  const sql = getDb();
  const rows = await sql`
    SELECT source_referrer AS host, COUNT(*)::int AS leads
    FROM submissions
    WHERE NOT COALESCE(is_spam, FALSE)
    GROUP BY 1
  `;
  const byChannel = new Map<Channel, number>();
  let unattributed = 0;
  for (const r of rows) {
    if (!r.host) {
      unattributed += Number(r.leads);
      continue;
    }
    const channel = channelFor(String(r.host));
    byChannel.set(channel, (byChannel.get(channel) ?? 0) + Number(r.leads));
  }
  return {
    rows: CHANNEL_ORDER.filter((c) => byChannel.has(c)).map((c) => ({
      channel: c,
      leads: byChannel.get(c)!,
    })),
    unattributed,
  };
}

/* ── Leads over time, in Wisconsin dates ─────────────────────────────── */

export async function getLeadsByDay(days: number) {
  const sql = getDb();
  const rows = await sql`
    SELECT to_char(created_at AT TIME ZONE ${BUSINESS_TZ}, 'YYYY-MM-DD') AS day,
           COUNT(*)::int AS count
    FROM submissions
    WHERE NOT COALESCE(is_spam, FALSE)
      AND created_at >= NOW() - MAKE_INTERVAL(days => ${days})
    GROUP BY 1
    ORDER BY 1 ASC
  `;
  return rows.map((r) => ({ day: String(r.day), count: Number(r.count) }));
}

/* ── Weekly summary ──────────────────────────────────────────────────── */

export type WeeklyDigest = {
  leadsThisWeek: number;
  leadsLastWeek: number;
  waiting: number;
  /** The people actually waiting, so the email can name them. */
  waitingNames: { name: string; service: string | null; days: number }[];
  booked: number;
  viewsThisWeek: number;
  viewsLastWeek: number;
  spamFiltered: number;
  medianReplyHours: number | null;
};

/**
 * The figures behind the Monday email.
 *
 * Deliberately the same numbers the dashboard shows rather than a second set
 * computed another way. An email that disagrees with the page it links to is
 * worse than no email.
 */
export async function getWeeklyDigest(): Promise<WeeklyDigest> {
  const sql = getDb();

  const [leads] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int   AS this_week,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days'
                         AND created_at <  NOW() - INTERVAL '7 days')::int   AS last_week,
      COUNT(*) FILTER (WHERE COALESCE(status, 'new') = 'new')::int           AS waiting,
      COUNT(*) FILTER (WHERE status = 'booked'
                         AND created_at >= NOW() - INTERVAL '7 days')::int   AS booked
    FROM submissions
    WHERE NOT COALESCE(is_spam, FALSE)
  `;

  const waitingRows = await sql`
    SELECT first_name, last_name, service,
           FLOOR(EXTRACT(epoch FROM (NOW() - created_at)) / 86400)::int AS days
    FROM submissions
    WHERE NOT COALESCE(is_spam, FALSE)
      AND COALESCE(status, 'new') = 'new'
    ORDER BY created_at ASC
    LIMIT 8
  `;

  const [views] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int  AS this_week,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days'
                         AND created_at <  NOW() - INTERVAL '7 days')::int  AS last_week
    FROM page_views
  `;

  const [spam] = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM submissions
        WHERE COALESCE(is_spam, FALSE) AND created_at >= NOW() - INTERVAL '7 days')
      +
      (SELECT COUNT(*)::int FROM blocked_attempts
        WHERE created_at >= NOW() - INTERVAL '7 days') AS filtered
  `;

  const response = await getResponseInsights();

  return {
    leadsThisWeek: Number(leads?.this_week ?? 0),
    leadsLastWeek: Number(leads?.last_week ?? 0),
    waiting: Number(leads?.waiting ?? 0),
    waitingNames: waitingRows.map((r) => ({
      name: `${r.first_name} ${r.last_name ?? ""}`.trim(),
      service: r.service ? String(r.service) : null,
      days: Number(r.days),
    })),
    booked: Number(leads?.booked ?? 0),
    viewsThisWeek: Number(views?.this_week ?? 0),
    viewsLastWeek: Number(views?.last_week ?? 0),
    spamFiltered: Number(spam?.filtered ?? 0),
    medianReplyHours: response.medianHours,
  };
}

/* ── Addresses that go nowhere ───────────────────────────────────────── */

/**
 * Every path this site actually serves. A page view on anything else was a
 * visitor landing on the 404 page.
 *
 * Kept as a list rather than read from the router because the router is not
 * introspectable at runtime, and because a wrong entry here is visible
 * immediately: a real page would start appearing in the report.
 */
const REAL_PATHS = new Set([
  "/",
  "/portfolio",
  "/services",
  "/services/content-creator-program",
  "/team",
  "/contact",
  "/privacy",
]);

export type DeadLink = { path: string; views: number; visitors: number; lastSeen: string };

export async function getDeadLinks(limit = 12): Promise<DeadLink[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT path,
           COUNT(*)::int                     AS views,
           COUNT(DISTINCT visitor_hash)::int AS visitors,
           MAX(created_at)                   AS last_seen
    FROM page_views
    WHERE path NOT LIKE '/admin%' AND path NOT LIKE '/api%'
    GROUP BY path
    ORDER BY views DESC
  `;
  return rows
    .filter((r) => !REAL_PATHS.has(String(r.path)))
    .slice(0, limit)
    .map((r) => ({
      path: String(r.path),
      views: Number(r.views),
      visitors: Number(r.visitors),
      lastSeen: String(r.last_seen),
    }));
}
