import { neon } from "@neondatabase/serverless";

let schemaEnsured = false;
let pageViewsTableEnsured = false;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(url);
}

export type SubmissionStatus = "new" | "contacted" | "booked" | "archived";

export type Submission = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  phone: string | null;
  service: string | null;
  message: string;
  status: SubmissionStatus;
  created_at: string;
};

/** Run once per request to ensure required columns/tables exist (idempotent). */
export async function ensureSchema() {
  if (schemaEnsured) return;

  const sql = getDb();
  await sql`
    ALTER TABLE submissions
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'new'
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      action VARCHAR(100) NOT NULL,
      target_table VARCHAR(100),
      target_id INTEGER,
      new_value TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;

  schemaEnsured = true;
}

export async function logAuditEvent(data: {
  action: string;
  targetTable?: string;
  targetId?: number;
  newValue?: string;
}) {
  try {
    const sql = getDb();
    await sql`
      INSERT INTO audit_logs (action, target_table, target_id, new_value)
      VALUES (${data.action}, ${data.targetTable ?? null}, ${data.targetId ?? null}, ${data.newValue ?? null})
    `;
  } catch {
    // Audit logging should never block the main operation
  }
}

// ── Page View Tracking ──

export async function ensurePageViewsTable() {
  if (pageViewsTableEnsured) return;

  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS page_views (
      id SERIAL PRIMARY KEY,
      path VARCHAR(500) NOT NULL,
      referrer VARCHAR(1000),
      device VARCHAR(10) DEFAULT 'desktop',
      visitor_hash VARCHAR(64),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  // Index for fast date-range queries
  await sql`
    CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at)
  `;

  pageViewsTableEnsured = true;
}

export async function recordPageView(data: {
  path: string;
  referrer: string | null;
  device: "mobile" | "tablet" | "desktop";
  visitorHash: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO page_views (path, referrer, device, visitor_hash)
    VALUES (${data.path}, ${data.referrer}, ${data.device}, ${data.visitorHash})
  `;
}

export async function getPageViewStats() {
  const sql = getDb();

  // Query 1: All-time totals (full table scan — no date filter)
  const [totals] = await sql`
    SELECT
      COUNT(*)                        AS total_views,
      COUNT(DISTINCT visitor_hash)    AS total_unique
    FROM page_views
  `;

  // Query 2: Everything scoped to the last 30 days in a single pass via CTEs
  const combined = await sql`
    WITH month_data AS (
      SELECT id, path, referrer, device, visitor_hash, created_at
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '30 days'
    ),
    counts AS (
      SELECT
        COUNT(*)                                                             AS month_views,
        COUNT(DISTINCT visitor_hash)                                         AS month_unique,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')     AS week_views,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day')      AS today_views
      FROM month_data
    ),
    daily AS (
      SELECT DATE(created_at) AS day,
             COUNT(*)                     AS views,
             COUNT(DISTINCT visitor_hash) AS visitors
      FROM month_data
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    ),
    pages AS (
      SELECT path,
             COUNT(*)                     AS views,
             COUNT(DISTINCT visitor_hash) AS visitors
      FROM month_data
      GROUP BY path
      ORDER BY views DESC
      LIMIT 6
    ),
    devices AS (
      SELECT device, COUNT(*) AS count
      FROM month_data
      GROUP BY device
      ORDER BY count DESC
    ),
    referrers AS (
      SELECT
        CASE WHEN referrer IS NULL OR referrer = '' THEN 'Direct' ELSE referrer END AS source,
        COUNT(*) AS count
      FROM month_data
      GROUP BY source
      ORDER BY count DESC
      LIMIT 5
    )
    SELECT
      'counts'    AS _type, month_views, month_unique, week_views, today_views,
      NULL::text  AS day, NULL::bigint AS views, NULL::bigint AS visitors,
      NULL::text  AS path,
      NULL::text  AS device,
      NULL::text  AS source, NULL::bigint AS count
    FROM counts
    UNION ALL
    SELECT
      'daily', NULL, NULL, NULL, NULL,
      day::text, views, visitors,
      NULL, NULL, NULL, NULL
    FROM daily
    UNION ALL
    SELECT
      'pages', NULL, NULL, NULL, NULL,
      NULL, views, visitors,
      path, NULL, NULL, NULL
    FROM pages
    UNION ALL
    SELECT
      'devices', NULL, NULL, NULL, NULL,
      NULL, NULL, NULL,
      NULL, device, NULL, count
    FROM devices
    UNION ALL
    SELECT
      'referrers', NULL, NULL, NULL, NULL,
      NULL, NULL, NULL,
      NULL, NULL, source, count
    FROM referrers
  `;

  // Parse the unified result set by _type discriminator
  let monthViews = 0, monthUnique = 0, weekViews = 0, todayViews = 0;
  const dailyViews: { day: string; views: number; visitors: number }[] = [];
  const topPages: { path: string; views: number; visitors: number }[] = [];
  const deviceBreakdown: { device: string; count: number }[] = [];
  const topReferrers: { source: string; count: number }[] = [];

  for (const row of combined) {
    switch (row._type) {
      case "counts":
        monthViews  = Number(row.month_views);
        monthUnique = Number(row.month_unique);
        weekViews   = Number(row.week_views);
        todayViews  = Number(row.today_views);
        break;
      case "daily":
        dailyViews.push({ day: row.day!, views: Number(row.views), visitors: Number(row.visitors) });
        break;
      case "pages":
        topPages.push({ path: row.path!, views: Number(row.views), visitors: Number(row.visitors) });
        break;
      case "devices":
        deviceBreakdown.push({ device: row.device!, count: Number(row.count) });
        break;
      case "referrers":
        topReferrers.push({ source: row.source!, count: Number(row.count) });
        break;
    }
  }

  return {
    totalViews: Number(totals.total_views),
    totalUnique: Number(totals.total_unique),
    monthViews,
    monthUnique,
    weekViews,
    todayViews,
    dailyViews,
    topPages,
    deviceBreakdown,
    topReferrers,
  };
}

// ── Submissions ──

export async function saveSubmission(data: {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  message: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO submissions (first_name, last_name, email, company, phone, service, message, status)
    VALUES (${data.firstName}, ${data.lastName}, ${data.email}, ${data.company || null}, ${data.phone || null}, ${data.service || null}, ${data.message}, 'new')
  `;
}

export async function getSubmissions(): Promise<Submission[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, first_name, last_name, email, company, phone, service, message,
           COALESCE(status, 'new') as status, created_at
    FROM submissions ORDER BY created_at DESC
  `;
  return rows as Submission[];
}

export async function updateSubmissionStatus(id: number, status: SubmissionStatus) {
  const sql = getDb();
  await sql`UPDATE submissions SET status = ${status} WHERE id = ${id}`;
}

export async function getSubmissionStats() {
  const sql = getDb();

  // Single query: scalar counts via CTEs, daily breakdown via UNION ALL
  const combined = await sql`
    WITH agg AS (
      SELECT
        COUNT(*)                                                                            AS total,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')                    AS this_month,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')                     AS this_week,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days'
                           AND created_at <  NOW() - INTERVAL '7 days')                     AS last_week,
        COUNT(*) FILTER (WHERE COALESCE(status, 'new') = 'new')                             AS new_leads
      FROM submissions
    ),
    daily AS (
      SELECT DATE(created_at) AS day, COUNT(*) AS count
      FROM submissions
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    )
    SELECT
      'agg'          AS _type,
      total, this_month, this_week, last_week, new_leads,
      NULL::text     AS day, NULL::bigint AS count
    FROM agg
    UNION ALL
    SELECT
      'daily', NULL, NULL, NULL, NULL, NULL,
      day::text, count
    FROM daily
  `;

  let total = 0, thisMonth = 0, thisWeek = 0, lastWeek = 0, newLeads = 0;
  const daily: { day: string; count: number }[] = [];

  for (const row of combined) {
    if (row._type === "agg") {
      total     = Number(row.total);
      thisMonth = Number(row.this_month);
      thisWeek  = Number(row.this_week);
      lastWeek  = Number(row.last_week);
      newLeads  = Number(row.new_leads);
    } else {
      daily.push({ day: row.day!, count: Number(row.count) });
    }
  }

  return { total, thisMonth, thisWeek, lastWeek, newLeads, daily };
}

export async function getServiceBreakdown() {
  const sql = getDb();
  const rows = await sql`
    SELECT service, COUNT(*) as count
    FROM submissions
    WHERE service IS NOT NULL AND service != ''
    GROUP BY service
    ORDER BY count DESC
  `;
  return rows as { service: string; count: number }[];
}

export async function getStatusCounts() {
  const sql = getDb();
  const rows = await sql`
    SELECT COALESCE(status, 'new') as status, COUNT(*) as count
    FROM submissions
    GROUP BY COALESCE(status, 'new')
  `;
  const counts: Record<SubmissionStatus, number> = {
    new: 0,
    contacted: 0,
    booked: 0,
    archived: 0,
  };
  for (const row of rows) {
    if (row.status in counts) {
      counts[row.status as SubmissionStatus] = Number(row.count);
    }
  }
  return counts;
}
