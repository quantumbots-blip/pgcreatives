import crypto from "crypto";
import { getDb } from "@/lib/db";
import { normalizeBlocks, THEMES, type Block, type Draft, type ThemeId } from "./blocks";
import type { ParsedSubscriber } from "./import";

/**
 * Three tables.
 *
 * subscribers: who gets the newsletter. Only `subscribed` rows are ever
 * mailed. An unsubscribe, a hard bounce or a complaint moves a row out of
 * that status and nothing here moves it back on its own: re-importing the
 * same address does not resubscribe somebody who asked to leave, and the
 * dashboard button that does is a deliberate act with an audit line.
 *
 * campaigns: one email. The content is a JSONB list of blocks, normalized on
 * the way in and again on the way out, so a row written by an older version
 * of the editor still renders.
 *
 * deliveries: one row per person per campaign, unique on the pair. That is
 * what makes sending idempotent: a send that stops at the daily quota, or a
 * function that times out, resumes by asking for rows still `queued`, and a
 * person can never be mailed the same campaign twice however many times the
 * button is pressed.
 */

let ensured = false;

export async function ensureNewsletterSchema() {
  if (ensured) return;
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(254) NOT NULL UNIQUE,
      first_name VARCHAR(80) NOT NULL DEFAULT '',
      last_name VARCHAR(80) NOT NULL DEFAULT '',
      company VARCHAR(120) NOT NULL DEFAULT '',
      status VARCHAR(20) NOT NULL DEFAULT 'subscribed',
      status_reason TEXT,
      status_changed_at TIMESTAMPTZ,
      unsubscribe_token VARCHAR(48) NOT NULL UNIQUE,
      source VARCHAR(40) NOT NULL DEFAULT 'import',
      last_sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status
    ON newsletter_subscribers (status, created_at DESC)
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_campaigns (
      id SERIAL PRIMARY KEY,
      subject VARCHAR(200) NOT NULL DEFAULT '',
      preheader VARCHAR(200) NOT NULL DEFAULT '',
      blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
      status VARCHAR(20) NOT NULL DEFAULT 'draft',
      status_reason TEXT,
      public_token VARCHAR(48) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      sent_at TIMESTAMPTZ
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_deliveries (
      id SERIAL PRIMARY KEY,
      campaign_id INTEGER NOT NULL REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
      subscriber_id INTEGER NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
      email VARCHAR(254) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'queued',
      resend_id VARCHAR(80),
      error TEXT,
      sent_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (campaign_id, subscriber_id)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_newsletter_deliveries_campaign_status
    ON newsletter_deliveries (campaign_id, status)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_newsletter_deliveries_resend_id
    ON newsletter_deliveries (resend_id)
    WHERE resend_id IS NOT NULL
  `;
  // The ground the email sits on. Additive, so rows from before read as night.
  await sql`ALTER TABLE newsletter_campaigns ADD COLUMN IF NOT EXISTS theme VARCHAR(20) NOT NULL DEFAULT 'night'`;
  /* The owner's own photographs of the month, resized on the way in and
     stored here rather than on a separate object store, because a few
     hundred kilobytes a picture and thirty pictures a month is nothing a
     database minds and it means one fewer account, key and bill. Served
     through /media with a year of edge caching, so a row is read once per
     region per size, not once per reader. */
  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_media (
      id SERIAL PRIMARY KEY,
      key VARCHAR(48) NOT NULL UNIQUE,
      filename VARCHAR(200) NOT NULL DEFAULT '',
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      bytes INTEGER NOT NULL,
      data BYTEA NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  ensured = true;
}

export function newToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

/* ── Subscribers ────────────────────────────────────────────────────── */

export const SUBSCRIBER_STATUSES = ["subscribed", "unsubscribed", "bounced", "complained"] as const;
export type SubscriberStatus = (typeof SUBSCRIBER_STATUSES)[number];

export type Subscriber = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  status: SubscriberStatus;
  status_reason: string | null;
  status_changed_at: string | null;
  unsubscribe_token: string;
  source: string;
  last_sent_at: string | null;
  created_at: string;
};

export type SubscriberCounts = Record<SubscriberStatus, number> & { total: number };

export async function countSubscribers(): Promise<SubscriberCounts> {
  const sql = getDb();
  const rows = await sql`
    SELECT status, COUNT(*)::int AS count FROM newsletter_subscribers GROUP BY status
  `;
  const counts: SubscriberCounts = { subscribed: 0, unsubscribed: 0, bounced: 0, complained: 0, total: 0 };
  for (const r of rows) {
    if ((SUBSCRIBER_STATUSES as readonly string[]).includes(r.status)) {
      counts[r.status as SubscriberStatus] = Number(r.count);
    }
    counts.total += Number(r.count);
  }
  return counts;
}

export async function listSubscribers(opts: {
  status?: SubscriberStatus | "all";
  q?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ rows: Subscriber[]; total: number }> {
  const sql = getDb();
  const status = opts.status && opts.status !== "all" ? opts.status : null;
  const q = (opts.q ?? "").trim().toLowerCase();
  const like = q ? `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%` : null;
  const limit = Math.min(Math.max(opts.limit ?? 100, 1), 500);
  const offset = Math.max(opts.offset ?? 0, 0);

  const where = `
    WHERE ($1::text IS NULL OR status = $1)
      AND ($2::text IS NULL OR LOWER(email) LIKE $2 OR LOWER(first_name || ' ' || last_name) LIKE $2 OR LOWER(company) LIKE $2)
  `;
  const [rows, count] = await Promise.all([
    sql.query(
      `SELECT * FROM newsletter_subscribers ${where}
       ORDER BY created_at DESC, id DESC LIMIT $3 OFFSET $4`,
      [status, like, limit, offset],
    ),
    sql.query(`SELECT COUNT(*)::int AS total FROM newsletter_subscribers ${where}`, [status, like]),
  ]);
  return { rows: rows as Subscriber[], total: Number(count[0]?.total ?? 0) };
}

export async function allSubscribersForExport(): Promise<Subscriber[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM newsletter_subscribers ORDER BY status, created_at DESC`;
  return rows as Subscriber[];
}

export type ImportResult = {
  added: number;
  /** Already on the list, left as they were. */
  existing: number;
};

/**
 * One statement for the whole paste. ON CONFLICT DO NOTHING is the rule that
 * an address that unsubscribed stays unsubscribed: the paste never touches a
 * row that exists.
 */
export async function importSubscribers(rows: ParsedSubscriber[], source = "import"): Promise<ImportResult> {
  if (rows.length === 0) return { added: 0, existing: 0 };
  const sql = getDb();
  let added = 0;
  // 500 at a time keeps a single statement well under any parameter limit.
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const inserted = await sql.query(
      `INSERT INTO newsletter_subscribers (email, first_name, last_name, company, unsubscribe_token, source)
       SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[])
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [
        chunk.map((r) => r.email.toLowerCase()),
        chunk.map((r) => r.firstName),
        chunk.map((r) => r.lastName),
        chunk.map((r) => r.company),
        chunk.map(() => newToken()),
        chunk.map(() => source),
      ],
    );
    added += inserted.length;
  }
  return { added, existing: rows.length - added };
}

export async function updateSubscriber(
  id: number,
  data: { firstName: string; lastName: string; company: string },
): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE newsletter_subscribers
    SET first_name = ${data.firstName}, last_name = ${data.lastName}, company = ${data.company}
    WHERE id = ${id}
  `;
}

export async function setSubscriberStatus(
  id: number,
  status: SubscriberStatus,
  reason: string | null,
): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE newsletter_subscribers
    SET status = ${status}, status_reason = ${reason}, status_changed_at = NOW()
    WHERE id = ${id}
  `;
}

export async function removeSubscriber(id: number): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM newsletter_subscribers WHERE id = ${id}`;
}

export async function getSubscriberByToken(token: string): Promise<Subscriber | null> {
  if (!/^[A-Za-z0-9_-]{20,48}$/.test(token)) return null;
  const sql = getDb();
  const rows = await sql`SELECT * FROM newsletter_subscribers WHERE unsubscribe_token = ${token}`;
  return (rows[0] as Subscriber) ?? null;
}

/** The link in the footer, and the one click POST. Idempotent. */
export async function unsubscribeByToken(token: string, reason: string): Promise<Subscriber | null> {
  const sub = await getSubscriberByToken(token);
  if (!sub) return null;
  if (sub.status === "subscribed") {
    await setSubscriberStatus(sub.id, "unsubscribed", reason);
    sub.status = "unsubscribed";
  }
  return sub;
}

/** A bounce or a complaint from the webhook. Never resubscribes. */
export async function setStatusByEmail(
  email: string,
  status: "bounced" | "complained",
  reason: string,
): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`
    UPDATE newsletter_subscribers
    SET status = ${status}, status_reason = ${reason}, status_changed_at = NOW()
    WHERE LOWER(email) = LOWER(${email}) AND status = 'subscribed'
    RETURNING id
  `;
  return rows.length > 0;
}

/* ── Campaigns ──────────────────────────────────────────────────────── */

export const CAMPAIGN_STATUSES = ["draft", "sending", "paused", "sent"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export type DeliveryCounts = {
  queued: number;
  sent: number;
  failed: number;
  delivered: number;
  opened: number;
  bounced: number;
  complained: number;
  total: number;
};

export type Campaign = {
  id: number;
  subject: string;
  preheader: string;
  theme: ThemeId;
  blocks: Block[];
  status: CampaignStatus;
  status_reason: string | null;
  public_token: string;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
};

export type CampaignSummary = Campaign & { counts: DeliveryCounts };

function toCampaign(row: Record<string, unknown>): Campaign {
  return {
    id: Number(row.id),
    subject: String(row.subject ?? ""),
    preheader: String(row.preheader ?? ""),
    theme: (THEMES as readonly string[]).includes(String(row.theme)) ? (row.theme as ThemeId) : "night",
    blocks: normalizeBlocks(row.blocks),
    status: (CAMPAIGN_STATUSES as readonly string[]).includes(String(row.status))
      ? (row.status as CampaignStatus)
      : "draft",
    status_reason: (row.status_reason as string | null) ?? null,
    public_token: String(row.public_token),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    sent_at: (row.sent_at as string | null) ?? null,
  };
}

const EMPTY_COUNTS: DeliveryCounts = {
  queued: 0, sent: 0, failed: 0, delivered: 0, opened: 0, bounced: 0, complained: 0, total: 0,
};

const COUNT_SQL = `
  COUNT(*) FILTER (WHERE d.status IN ('queued','sending'))::int AS queued,
  COUNT(*) FILTER (WHERE d.status IN ('sent','delivered','opened'))::int AS sent,
  COUNT(*) FILTER (WHERE d.status = 'failed')::int     AS failed,
  COUNT(*) FILTER (WHERE d.status IN ('delivered','opened'))::int AS delivered,
  COUNT(*) FILTER (WHERE d.status = 'opened')::int     AS opened,
  COUNT(*) FILTER (WHERE d.status = 'bounced')::int    AS bounced,
  COUNT(*) FILTER (WHERE d.status = 'complained')::int AS complained,
  COUNT(d.id)::int                                     AS total
`;

function toCounts(row: Record<string, unknown> | undefined): DeliveryCounts {
  if (!row) return { ...EMPTY_COUNTS };
  const n = (k: string) => Number(row[k] ?? 0);
  return {
    queued: n("queued"), sent: n("sent"), failed: n("failed"), delivered: n("delivered"),
    opened: n("opened"), bounced: n("bounced"), complained: n("complained"), total: n("total"),
  };
}

export async function listCampaigns(): Promise<CampaignSummary[]> {
  const sql = getDb();
  const rows = await sql.query(
    `SELECT c.*, ${COUNT_SQL}
     FROM newsletter_campaigns c
     LEFT JOIN newsletter_deliveries d ON d.campaign_id = c.id
     GROUP BY c.id
     ORDER BY c.updated_at DESC, c.id DESC`,
  );
  return rows.map((r) => ({ ...toCampaign(r), counts: toCounts(r) }));
}

export async function getCampaign(id: number): Promise<CampaignSummary | null> {
  const sql = getDb();
  const rows = await sql.query(
    `SELECT c.*, ${COUNT_SQL}
     FROM newsletter_campaigns c
     LEFT JOIN newsletter_deliveries d ON d.campaign_id = c.id
     WHERE c.id = $1
     GROUP BY c.id`,
    [id],
  );
  if (!rows[0]) return null;
  return { ...toCampaign(rows[0]), counts: toCounts(rows[0]) };
}

export async function getCampaignByPublicToken(token: string): Promise<Campaign | null> {
  if (!/^[A-Za-z0-9_-]{20,48}$/.test(token)) return null;
  const sql = getDb();
  const rows = await sql`SELECT * FROM newsletter_campaigns WHERE public_token = ${token}`;
  return rows[0] ? toCampaign(rows[0]) : null;
}

export async function createCampaign(draft: Draft): Promise<number> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO newsletter_campaigns (subject, preheader, theme, blocks, public_token)
    VALUES (${draft.subject}, ${draft.preheader}, ${draft.theme}, ${JSON.stringify(draft.blocks)}::jsonb, ${newToken()})
    RETURNING id
  `;
  return Number(rows[0].id);
}

/** Returns false when the campaign has already gone out and cannot change. */
export async function saveCampaign(id: number, draft: Draft): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`
    UPDATE newsletter_campaigns
    SET subject = ${draft.subject}, preheader = ${draft.preheader}, theme = ${draft.theme},
        blocks = ${JSON.stringify(draft.blocks)}::jsonb, updated_at = NOW()
    WHERE id = ${id} AND status = 'draft'
    RETURNING id
  `;
  return rows.length > 0;
}

export async function setCampaignStatus(
  id: number,
  status: CampaignStatus,
  reason: string | null,
): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE newsletter_campaigns
    SET status = ${status}, status_reason = ${reason}, updated_at = NOW(),
        sent_at = CASE WHEN ${status} = 'sent' THEN COALESCE(sent_at, NOW()) ELSE sent_at END
    WHERE id = ${id}
  `;
}

/** Drafts only. Anything that has been sent is a record and stays. */
export async function deleteCampaign(id: number): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`
    DELETE FROM newsletter_campaigns WHERE id = ${id} AND status = 'draft' RETURNING id
  `;
  return rows.length > 0;
}

/* ── Deliveries ─────────────────────────────────────────────────────── */

export type QueuedDelivery = {
  id: number;
  subscriber_id: number;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  unsubscribe_token: string;
};

/**
 * A row for everybody subscribed who does not have one yet. Running it twice
 * adds nobody, which is what lets a paused send resume and a second press of
 * the button do nothing.
 */
export async function queueDeliveries(campaignId: number): Promise<number> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO newsletter_deliveries (campaign_id, subscriber_id, email)
    SELECT ${campaignId}, s.id, s.email
    FROM newsletter_subscribers s
    WHERE s.status = 'subscribed'
    ON CONFLICT (campaign_id, subscriber_id) DO NOTHING
    RETURNING id
  `;
  return rows.length;
}

/**
 * Take the next batch, and mark it taken in the same statement.
 *
 * Two presses of Resume a second apart would otherwise both read the same
 * hundred queued rows and both send them. The rows are moved to `sending`
 * as they are picked, under SKIP LOCKED so a concurrent caller takes the
 * next hundred instead of waiting for these, and the sender moves them on
 * to sent or failed. Anything left in `sending` by a crash is put back by
 * releaseStuck() before the next run.
 */
export async function claimQueued(campaignId: number, limit: number): Promise<QueuedDelivery[]> {
  const sql = getDb();
  const rows = await sql`
    WITH picked AS (
      SELECT d.id
      FROM newsletter_deliveries d
      JOIN newsletter_subscribers s ON s.id = d.subscriber_id
      WHERE d.campaign_id = ${campaignId} AND d.status = 'queued'
        -- Somebody who left between queueing and sending is skipped, not mailed.
        AND s.status = 'subscribed'
      ORDER BY d.id
      LIMIT ${limit}
      FOR UPDATE OF d SKIP LOCKED
    )
    UPDATE newsletter_deliveries d
    SET status = 'sending', updated_at = NOW()
    FROM picked, newsletter_subscribers s
    WHERE d.id = picked.id AND s.id = d.subscriber_id
    RETURNING d.id, d.subscriber_id, s.email, s.first_name, s.last_name, s.company, s.unsubscribe_token
  `;
  return (rows as QueuedDelivery[]).sort((a, b) => a.id - b.id);
}

/** Rows a crashed run left mid flight go back in the queue. */
export async function releaseStuck(campaignId: number, olderThanMinutes = 10): Promise<number> {
  const sql = getDb();
  const rows = await sql`
    UPDATE newsletter_deliveries
    SET status = 'queued', updated_at = NOW()
    WHERE campaign_id = ${campaignId} AND status = 'sending'
      AND updated_at < NOW() - MAKE_INTERVAL(mins => ${olderThanMinutes})
    RETURNING id
  `;
  return rows.length;
}

/** Rows this run claimed and then could not send, back in the queue untouched. */
export async function unclaim(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const sql = getDb();
  await sql.query(
    `UPDATE newsletter_deliveries SET status = 'queued', updated_at = NOW()
     WHERE id = ANY($1::int[]) AND status = 'sending'`,
    [ids],
  );
}

/** Rows queued for people who are no longer subscribed, closed out. */
export async function skipUnsubscribedDeliveries(campaignId: number): Promise<number> {
  const sql = getDb();
  const rows = await sql`
    UPDATE newsletter_deliveries d
    SET status = 'skipped', error = 'No longer subscribed', updated_at = NOW()
    FROM newsletter_subscribers s
    WHERE d.campaign_id = ${campaignId} AND d.status = 'queued'
      AND s.id = d.subscriber_id AND s.status <> 'subscribed'
    RETURNING d.id
  `;
  return rows.length;
}

export async function markSent(pairs: { id: number; resendId: string }[]): Promise<void> {
  if (pairs.length === 0) return;
  const sql = getDb();
  await sql.query(
    `UPDATE newsletter_deliveries d
     SET status = 'sent', resend_id = v.resend_id, sent_at = NOW(), updated_at = NOW(), error = NULL
     FROM UNNEST($1::int[], $2::text[]) AS v(id, resend_id)
     WHERE d.id = v.id`,
    [pairs.map((p) => p.id), pairs.map((p) => p.resendId)],
  );
  await sql.query(
    `UPDATE newsletter_subscribers s SET last_sent_at = NOW()
     FROM newsletter_deliveries d WHERE d.id = ANY($1::int[]) AND s.id = d.subscriber_id`,
    [pairs.map((p) => p.id)],
  );
}

export async function markFailed(ids: number[], error: string): Promise<void> {
  if (ids.length === 0) return;
  const sql = getDb();
  await sql.query(
    `UPDATE newsletter_deliveries SET status = 'failed', error = $2, updated_at = NOW()
     WHERE id = ANY($1::int[])`,
    [ids, error.slice(0, 500)],
  );
}

/** Failed rows back to queued, for a retry after the cause is fixed. */
export async function requeueFailed(campaignId: number): Promise<number> {
  const sql = getDb();
  const rows = await sql`
    UPDATE newsletter_deliveries SET status = 'queued', error = NULL, updated_at = NOW()
    WHERE campaign_id = ${campaignId} AND status = 'failed'
    RETURNING id
  `;
  return rows.length;
}

/** A webhook event about one message. Status only ever moves forward. */
export async function updateDeliveryByResendId(
  resendId: string,
  status: "delivered" | "opened" | "bounced" | "complained" | "failed",
  error: string | null,
): Promise<{ campaignId: number; email: string } | null> {
  const sql = getDb();
  const rank: Record<string, number> = { sent: 1, delivered: 2, opened: 3, failed: 4, bounced: 5, complained: 6 };
  const rows = await sql`
    UPDATE newsletter_deliveries
    SET status = ${status}, error = COALESCE(${error}, error), updated_at = NOW()
    WHERE resend_id = ${resendId}
      AND COALESCE((${JSON.stringify(rank)}::jsonb ->> status)::int, 0) < ${rank[status]}
    RETURNING campaign_id, email
  `;
  return rows[0] ? { campaignId: Number(rows[0].campaign_id), email: String(rows[0].email) } : null;
}

export type DeliveryRow = {
  id: number;
  email: string;
  status: string;
  error: string | null;
  sent_at: string | null;
};

export async function listDeliveries(campaignId: number, limit = 300): Promise<DeliveryRow[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, email, status, error, sent_at FROM newsletter_deliveries
    WHERE campaign_id = ${campaignId}
    ORDER BY CASE status WHEN 'failed' THEN 0 WHEN 'bounced' THEN 1 WHEN 'complained' THEN 2 WHEN 'queued' THEN 3 ELSE 4 END, id
    LIMIT ${limit}
  `;
  return rows as DeliveryRow[];
}

/* ── Media ──────────────────────────────────────────────────────────── */

export type MediaItem = {
  id: number;
  key: string;
  filename: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
};

export function newMediaKey(): string {
  return crypto.randomBytes(12).toString("base64url");
}

export async function saveMedia(item: {
  key: string;
  filename: string;
  width: number;
  height: number;
  data: Buffer;
}): Promise<MediaItem> {
  const sql = getDb();
  const rows = await sql.query(
    `INSERT INTO newsletter_media (key, filename, width, height, bytes, data)
     VALUES ($1, $2, $3, $4, $5, decode($6, 'hex'))
     RETURNING id, key, filename, width, height, bytes, created_at`,
    [item.key, item.filename, item.width, item.height, item.data.length, item.data.toString("hex")],
  );
  return rows[0] as MediaItem;
}

export async function listMedia(limit = 300): Promise<MediaItem[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, key, filename, width, height, bytes, created_at
    FROM newsletter_media ORDER BY created_at DESC, id DESC LIMIT ${limit}
  `;
  return rows as MediaItem[];
}

/** The bytes, for the serving route. Null when the key is unknown. */
export async function readMedia(key: string): Promise<{ data: Buffer; width: number; height: number } | null> {
  if (!/^[A-Za-z0-9_-]{8,48}$/.test(key)) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT encode(data, 'hex') AS hex, width, height FROM newsletter_media WHERE key = ${key}
  `;
  if (!rows[0]) return null;
  return { data: Buffer.from(String(rows[0].hex), "hex"), width: Number(rows[0].width), height: Number(rows[0].height) };
}

export async function deleteMedia(key: string): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`DELETE FROM newsletter_media WHERE key = ${key} RETURNING id`;
  return rows.length > 0;
}

export async function mediaTotals(): Promise<{ count: number; bytes: number }> {
  const sql = getDb();
  const [row] = await sql`SELECT COUNT(*)::int AS count, COALESCE(SUM(bytes), 0)::bigint AS bytes FROM newsletter_media`;
  return { count: Number(row?.count ?? 0), bytes: Number(row?.bytes ?? 0) };
}
