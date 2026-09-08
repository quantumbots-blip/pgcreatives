import webpush from "web-push";
import { getDb } from "@/lib/db";

/**
 * A notification on the owner's phone the moment a lead arrives.
 *
 * This exists because of one number: six inquiries had been sitting in the
 * pipeline unanswered, the oldest for a hundred and sixty days. The only
 * thing announcing a lead was an email into a Gmail inbox that also received
 * the outreach spam, and in real estate the photographer who answers first
 * usually gets the booking.
 *
 * Web push rather than SMS because it costs nothing, needs no account and no
 * card, and works from the dashboard the owner has already installed to his
 * home screen. The trade is that iOS only delivers it to an installed web
 * app, which is exactly what the manifest set up.
 */

let configured: boolean | null = null;

/** True when the keys exist. Everything here is a no op without them. */
export function pushConfigured(): boolean {
  if (configured !== null) return configured;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    configured = false;
    return false;
  }
  webpush.setVapidDetails(
    // Must be a mailto: or https: the push service can reach a human at.
    "mailto:pgcreativeswisconsin@gmail.com",
    publicKey,
    privateKey,
  );
  configured = true;
  return true;
}

export async function ensurePushTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      user_agent VARCHAR(400),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_used_at TIMESTAMPTZ
    )
  `;
}

export type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function saveSubscription(sub: PushSubscriptionInput, userAgent: string | null) {
  const sql = getDb();
  await ensurePushTable();
  // The endpoint is the identity of a device. Re-subscribing on the same one
  // must replace the keys rather than pile up rows that all fire at once.
  await sql`
    INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_agent)
    VALUES (${sub.endpoint}, ${sub.keys.p256dh}, ${sub.keys.auth}, ${userAgent})
    ON CONFLICT (endpoint) DO UPDATE
      SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, user_agent = EXCLUDED.user_agent
  `;
}

export async function removeSubscription(endpoint: string) {
  const sql = getDb();
  await ensurePushTable();
  await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
}

export async function countSubscriptions(): Promise<number> {
  try {
    const sql = getDb();
    await ensurePushTable();
    const [row] = await sql`SELECT COUNT(*)::int AS c FROM push_subscriptions`;
    return Number(row?.c ?? 0);
  } catch {
    return 0;
  }
}

export type PushPayload = {
  title: string;
  body: string;
  /** Where tapping it should land. */
  url: string;
  tag?: string;
};

/**
 * Sends to every registered device. Never throws: a lead arriving must not
 * fail because a phone has been wiped.
 */
export async function sendPush(payload: PushPayload): Promise<{ sent: number; removed: number }> {
  if (!pushConfigured()) return { sent: 0, removed: 0 };

  let sent = 0;
  let removed = 0;
  try {
    const sql = getDb();
    await ensurePushTable();
    const subs = await sql`SELECT endpoint, p256dh, auth FROM push_subscriptions`;
    const body = JSON.stringify(payload);

    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: String(s.endpoint),
              keys: { p256dh: String(s.p256dh), auth: String(s.auth) },
            },
            body,
            { TTL: 60 * 60 * 12 },
          );
          sent++;
        } catch (err) {
          /* 404 and 410 mean the browser threw the subscription away: the app
             was uninstalled, or notifications were turned off. Keeping it
             would mean retrying a dead endpoint on every lead forever. */
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await removeSubscription(String(s.endpoint));
            removed++;
          } else {
            console.error("[push] send failed:", (err as Error).message);
          }
        }
      }),
    );

    if (sent > 0) {
      await sql`UPDATE push_subscriptions SET last_used_at = NOW()`;
    }
  } catch (err) {
    console.error("[push] could not send:", (err as Error).message);
  }

  return { sent, removed };
}
