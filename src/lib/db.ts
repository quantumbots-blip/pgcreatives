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
  /** Quarantined by the content filter. Hidden from the main list. */
  is_spam: boolean;
  spam_score: number;
  spam_reasons: string | null;
  /** Owner's private notes on the lead. */
  notes: string | null;
  /** Stamped the first time the lead is moved to Contacted. */
  contacted_at: string | null;
  /** When the owner wants this back on the Needs a reply list. */
  follow_up_at: string | null;
  /** Where the visitor came from, captured by the form. */
  source_referrer: string | null;
  source_landing: string | null;
  source_campaign: string | null;
  /** "form" for the website, "manual" for one entered by hand. */
  created_via: string;
  /* Whether the reminder has come round, decided by the database rather than
     the browser. A component cannot ask the time during render without the
     React compiler objecting, and it should not: two cards rendered a
     millisecond apart would be answering the question separately. */
  follow_up_due: boolean;
};

/** Why a submission never made it as far as the table. */
export type BlockReason = "honeypot" | "bot" | "rate_limit" | "duplicate";

/** Run once per request to ensure required columns/tables exist (idempotent). */
export async function ensureSchema() {
  if (schemaEnsured) return;

  const sql = getDb();
  await sql`
    ALTER TABLE submissions
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'new'
  `;
  // Spam quarantine, notes and provenance. Nothing here is destructive: every
  // column is additive with a default, so a deploy that lands before this runs
  // still writes rows that read back correctly.
  await sql`
    ALTER TABLE submissions
      ADD COLUMN IF NOT EXISTS is_spam BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS spam_score INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS spam_reasons TEXT,
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS fingerprint VARCHAR(32),
      ADD COLUMN IF NOT EXISTS ip_hash VARCHAR(64),
      ADD COLUMN IF NOT EXISTS user_agent VARCHAR(400)
  `;
  // Follow ups, where the lead came from, and how it got here.
  await sql`
    ALTER TABLE submissions
      ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS source_referrer VARCHAR(255),
      ADD COLUMN IF NOT EXISTS source_landing VARCHAR(500),
      ADD COLUMN IF NOT EXISTS source_campaign VARCHAR(120),
      ADD COLUMN IF NOT EXISTS created_via VARCHAR(20) NOT NULL DEFAULT 'form'
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_submissions_follow_up
    ON submissions (follow_up_at)
    WHERE follow_up_at IS NOT NULL
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_submissions_created_at
    ON submissions (created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_submissions_spam_created
    ON submissions (is_spam, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_submissions_fingerprint
    ON submissions (fingerprint)
  `;
  // Attempts turned away before they became rows. Kept so the dashboard can
  // show that the filter is doing something rather than that nobody wrote in.
  // Deliberately holds no personal data, only a salted hash of the address.
  await sql`
    CREATE TABLE IF NOT EXISTS blocked_attempts (
      id SERIAL PRIMARY KEY,
      reason VARCHAR(20) NOT NULL,
      ip_hash VARCHAR(64),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_blocked_attempts_created_at
    ON blocked_attempts (created_at DESC)
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
  isSpam: boolean;
  spamScore: number;
  spamReasons: string;
  fingerprint: string;
  ipHash: string | null;
  userAgent: string | null;
  sourceReferrer: string | null;
  sourceLanding: string | null;
  sourceCampaign: string | null;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO submissions (
      first_name, last_name, email, company, phone, service, message, status,
      is_spam, spam_score, spam_reasons, fingerprint, ip_hash, user_agent,
      source_referrer, source_landing, source_campaign, created_via
    )
    VALUES (
      ${data.firstName}, ${data.lastName}, ${data.email}, ${data.company || null},
      ${data.phone || null}, ${data.service || null}, ${data.message}, 'new',
      ${data.isSpam}, ${data.spamScore}, ${data.spamReasons || null},
      ${data.fingerprint}, ${data.ipHash}, ${data.userAgent},
      ${data.sourceReferrer}, ${data.sourceLanding}, ${data.sourceCampaign}, 'form'
    )
  `;
}

/**
 * A lead that arrived some other way: a phone call, an Instagram message,
 * somebody stopping the owner at a showing. Without this the pipeline only
 * ever describes the website form, and the conversion figures quietly claim
 * those other inquiries never happened.
 */
/* email is empty rather than null when somebody only left a number. The
   column has been NOT NULL since the table was created and every read path
   types it as a string, so widening it would ripple through the export, the
   search and the contact buttons for no gain. Callers treat "" as "no email",
   which is what the add form already enforces: a lead needs an email or a
   phone, not both. */
export async function createManualLead(data: {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  message: string;
  sourceReferrer: string;
}): Promise<number> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO submissions (
      first_name, last_name, email, company, phone, service, message, status,
      is_spam, spam_score, source_referrer, created_via
    )
    VALUES (
      ${data.firstName}, ${data.lastName}, ${data.email}, ${data.company || null},
      ${data.phone || null}, ${data.service || null}, ${data.message}, 'new',
      FALSE, 0, ${data.sourceReferrer || null}, 'manual'
    )
    RETURNING id
  `;
  return Number(rows[0].id);
}

/** Put a lead back on the Needs a reply list on a chosen day. */
export async function setFollowUp(id: number, isoDate: string | null) {
  const sql = getDb();
  await sql`UPDATE submissions SET follow_up_at = ${isoDate} WHERE id = ${id}`;
}

const SUBMISSION_COLUMNS = `
  id, first_name, last_name, email, company, phone, service, message,
  COALESCE(status, 'new') AS status, created_at,
  COALESCE(is_spam, FALSE) AS is_spam,
  COALESCE(spam_score, 0) AS spam_score,
  spam_reasons, notes, contacted_at, follow_up_at,
  source_referrer, source_landing, source_campaign,
  COALESCE(created_via, 'form') AS created_via,
  (follow_up_at IS NOT NULL AND follow_up_at <= NOW()) AS follow_up_due
`;

/** Real leads. Quarantined submissions live in getSpamSubmissions. */
export async function getSubmissions(): Promise<Submission[]> {
  const sql = getDb();
  const rows = await sql.query(
    `SELECT ${SUBMISSION_COLUMNS} FROM submissions
     WHERE COALESCE(is_spam, FALSE) = FALSE
     ORDER BY created_at DESC`,
  );
  return rows as Submission[];
}

/**
 * Quarantined submissions, newest first. Capped: the point of the tab is to
 * let the owner spot something wrongly caught, and nothing wrongly caught is
 * ever going to be the two hundredth item down.
 */
export async function getSpamSubmissions(limit = 200): Promise<Submission[]> {
  const sql = getDb();
  const rows = await sql.query(
    `SELECT ${SUBMISSION_COLUMNS} FROM submissions
     WHERE COALESCE(is_spam, FALSE) = TRUE
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit],
  );
  return rows as Submission[];
}

export async function updateSubmissionStatus(id: number, status: SubmissionStatus) {
  const sql = getDb();
  // contacted_at is stamped once and never moved. It answers "when did I first
  // get back to this person", so a later trip back through the statuses must
  // not rewrite it.
  await sql`
    UPDATE submissions
    SET status = ${status},
        contacted_at = CASE
          WHEN ${status} = 'new' THEN contacted_at
          WHEN contacted_at IS NULL THEN NOW()
          ELSE contacted_at
        END
    WHERE id = ${id}
  `;
}

/** Move a submission into or out of quarantine. */
export async function setSubmissionSpam(id: number, isSpam: boolean) {
  const sql = getDb();
  await sql`UPDATE submissions SET is_spam = ${isSpam} WHERE id = ${id}`;
}

export async function updateSubmissionNotes(id: number, notes: string) {
  const sql = getDb();
  await sql`UPDATE submissions SET notes = ${notes || null} WHERE id = ${id}`;
}

export async function deleteSubmission(id: number) {
  const sql = getDb();
  await sql`DELETE FROM submissions WHERE id = ${id}`;
}

/** Permanently remove everything currently in quarantine. */
export async function deleteAllSpam(): Promise<number> {
  const sql = getDb();
  const rows = await sql`
    DELETE FROM submissions WHERE COALESCE(is_spam, FALSE) = TRUE RETURNING id
  `;
  return rows.length;
}

// ── Intake guards ──

/** How many submissions this address has sent inside the window. */
export async function countRecentByEmail(email: string, hours: number): Promise<number> {
  const sql = getDb();
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM submissions
    WHERE LOWER(email) = LOWER(${email})
      AND created_at >= NOW() - MAKE_INTERVAL(hours => ${hours})
  `;
  return Number(rows[0]?.count ?? 0);
}

/** Site wide intake in the window, used as a flood breaker. */
export async function countRecentTotal(hours: number): Promise<number> {
  const sql = getDb();
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM submissions
    WHERE created_at >= NOW() - MAKE_INTERVAL(hours => ${hours})
  `;
  return Number(rows[0]?.count ?? 0);
}

/** Has this exact message already arrived recently? */
export async function isDuplicateSubmission(
  fingerprint: string,
  hours: number,
): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`
    SELECT 1 FROM submissions
    WHERE fingerprint = ${fingerprint}
      AND created_at >= NOW() - MAKE_INTERVAL(hours => ${hours})
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function recordBlockedAttempt(reason: BlockReason, ipHash: string | null) {
  try {
    /* The honeypot and BotID both turn a submission away before the intake
       checks run, so on a cold instance this is the first thing to touch the
       database and blocked_attempts may not exist yet. ensureSchema is
       memoised, so asking for it here costs nothing after the first call and
       stops the first block of each instance going uncounted. */
    await ensureSchema();
    const sql = getDb();
    await sql`
      INSERT INTO blocked_attempts (reason, ip_hash) VALUES (${reason}, ${ipHash})
    `;
  } catch {
    // Counting blocks must never be the reason a submission fails.
  }
}

/** What the filter has caught, for the dashboard. */
export async function getSpamStats() {
  const sql = getDb();
  const [row] = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM submissions WHERE COALESCE(is_spam, FALSE) = TRUE)                    AS quarantined_total,
      (SELECT COUNT(*)::int FROM submissions WHERE COALESCE(is_spam, FALSE) = TRUE
         AND created_at >= NOW() - INTERVAL '7 days')                                                  AS quarantined_week,
      (SELECT COUNT(*)::int FROM blocked_attempts WHERE created_at >= NOW() - INTERVAL '7 days')       AS blocked_week,
      (SELECT COUNT(*)::int FROM blocked_attempts)                                                     AS blocked_total
  `;
  return {
    quarantinedTotal: Number(row?.quarantined_total ?? 0),
    quarantinedWeek: Number(row?.quarantined_week ?? 0),
    blockedWeek: Number(row?.blocked_week ?? 0),
    blockedTotal: Number(row?.blocked_total ?? 0),
  };
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
      WHERE COALESCE(is_spam, FALSE) = FALSE
    ),
    daily AS (
      SELECT DATE(created_at) AS day, COUNT(*) AS count
      FROM submissions
      WHERE created_at >= NOW() - INTERVAL '30 days'
        AND COALESCE(is_spam, FALSE) = FALSE
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
      AND COALESCE(is_spam, FALSE) = FALSE
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
    WHERE COALESCE(is_spam, FALSE) = FALSE
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
