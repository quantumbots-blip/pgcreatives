import crypto from "crypto";

/**
 * Checking that a webhook really came from Resend.
 *
 * Resend signs webhooks the Svix way: the secret is `whsec_` followed by a
 * base64 key, and the signature is HMAC SHA-256 over `${id}.${timestamp}.${body}`.
 * The header can carry several signatures separated by spaces, each as
 * `v1,<base64>`, for key rotation. Done by hand here rather than through the
 * svix package, because it is twelve lines and one fewer dependency in the
 * path that can unsubscribe a customer.
 *
 * A timestamp more than five minutes off is refused so a captured request
 * cannot be replayed later.
 */

export type SvixHeaders = {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
};

export const TOLERANCE_SECONDS = 5 * 60;

export function verifySvix(
  headers: SvixHeaders,
  body: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): { ok: true } | { ok: false; reason: string } {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return { ok: false, reason: "missing headers" };
  if (!secret) return { ok: false, reason: "no secret configured" };

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: "bad timestamp" };
  if (Math.abs(nowSeconds - ts) > TOLERANCE_SECONDS) return { ok: false, reason: "stale timestamp" };

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = crypto.createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();

  for (const part of signature.split(" ")) {
    const [version, value] = part.split(",");
    if (version !== "v1" || !value) continue;
    let given: Buffer;
    try {
      given = Buffer.from(value, "base64");
    } catch {
      continue;
    }
    if (given.length === expected.length && crypto.timingSafeEqual(given, expected)) {
      return { ok: true };
    }
  }
  return { ok: false, reason: "signature mismatch" };
}

/** For the tests, and for anybody who wants to fake a delivery locally. */
export function signSvix(id: string, timestamp: string, body: string, secret: string): string {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const mac = crypto.createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
  return `v1,${mac}`;
}

/** The events this site acts on, and what each one means for the person. */
export const EVENT_TO_STATUS: Record<string, "bounced" | "complained" | null> = {
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.delivered": null,
  "email.sent": null,
  "email.opened": null,
  "email.clicked": null,
  "email.delivery_delayed": null,
};
