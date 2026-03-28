import { neon } from "@neondatabase/serverless";

function getDb() {
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

  const [totalViews] = await sql`SELECT COUNT(*) as count FROM page_views`;
  const [totalUnique] = await sql`SELECT COUNT(DISTINCT visitor_hash) as count FROM page_views`;
  const [monthViews] = await sql`
    SELECT COUNT(*) as count FROM page_views WHERE created_at >= NOW() - INTERVAL '30 days'
  `;
  const [monthUnique] = await sql`
    SELECT COUNT(DISTINCT visitor_hash) as count FROM page_views WHERE created_at >= NOW() - INTERVAL '30 days'
  `;
  const [weekViews] = await sql`
    SELECT COUNT(*) as count FROM page_views WHERE created_at >= NOW() - INTERVAL '7 days'
  `;
  const [todayViews] = await sql`
    SELECT COUNT(*) as count FROM page_views WHERE created_at >= NOW() - INTERVAL '1 day'
  `;

  const dailyViews = await sql`
    SELECT DATE(created_at) as day, COUNT(*) as views, COUNT(DISTINCT visitor_hash) as visitors
    FROM page_views
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY day ASC
  `;

  const topPages = await sql`
    SELECT path, COUNT(*) as views, COUNT(DISTINCT visitor_hash) as visitors
    FROM page_views
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY path
    ORDER BY views DESC
    LIMIT 6
  `;

  const deviceBreakdown = await sql`
    SELECT device, COUNT(*) as count
    FROM page_views
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY device
    ORDER BY count DESC
  `;

  const topReferrers = await sql`
    SELECT
      CASE WHEN referrer IS NULL OR referrer = '' THEN 'Direct' ELSE referrer END as source,
      COUNT(*) as count
    FROM page_views
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY source
    ORDER BY count DESC
    LIMIT 5
  `;

  return {
    totalViews: Number(totalViews.count),
    totalUnique: Number(totalUnique.count),
    monthViews: Number(monthViews.count),
    monthUnique: Number(monthUnique.count),
    weekViews: Number(weekViews.count),
    todayViews: Number(todayViews.count),
    dailyViews: dailyViews as { day: string; views: number; visitors: number }[],
    topPages: topPages as { path: string; views: number; visitors: number }[],
    deviceBreakdown: deviceBreakdown as { device: string; count: number }[],
    topReferrers: topReferrers as { source: string; count: number }[],
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

  const [totalResult] = await sql`SELECT COUNT(*) as count FROM submissions`;
  const [monthResult] = await sql`
    SELECT COUNT(*) as count FROM submissions
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `;
  const [weekResult] = await sql`
    SELECT COUNT(*) as count FROM submissions
    WHERE created_at >= NOW() - INTERVAL '7 days'
  `;
  const [lastWeekResult] = await sql`
    SELECT COUNT(*) as count FROM submissions
    WHERE created_at >= NOW() - INTERVAL '14 days'
      AND created_at < NOW() - INTERVAL '7 days'
  `;
  const [newResult] = await sql`
    SELECT COUNT(*) as count FROM submissions
    WHERE COALESCE(status, 'new') = 'new'
  `;
  const dailyResult = await sql`
    SELECT DATE(created_at) as day, COUNT(*) as count
    FROM submissions
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY day ASC
  `;

  return {
    total: Number(totalResult.count),
    thisMonth: Number(monthResult.count),
    thisWeek: Number(weekResult.count),
    lastWeek: Number(lastWeekResult.count),
    newLeads: Number(newResult.count),
    daily: dailyResult as { day: string; count: number }[],
  };
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
