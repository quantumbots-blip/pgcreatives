import { Resend } from "resend";
import { postalAddress } from "./send";

/**
 * Whether sending can actually work, checked rather than assumed.
 *
 * The site's lead emails were rejected for months because the sending
 * domain was never added to Resend and nothing said so. This asks Resend
 * directly which domains it knows, and the newsletter page turns the answer
 * into a checklist in plain words. Cached for five minutes per instance so
 * the page does not call out every time it is opened.
 */

export type SetupItem = {
  key: "key" | "domain" | "address" | "webhook";
  ok: boolean;
  title: string;
  detail: string;
};

export type Setup = {
  items: SetupItem[];
  /** True only when mail can leave. The address and the webhook are advice. */
  canSend: boolean;
};

export const SENDING_DOMAIN = "pgcreativeswi.com";

let cached: { at: number; domain: { known: boolean; status: string } } | null = null;

async function domainStatus(apiKey: string): Promise<{ known: boolean; status: string }> {
  if (cached && Date.now() - cached.at < 5 * 60_000) return cached.domain;
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.domains.list();
    if (error) return { known: false, status: `Resend refused the key: ${error.message}` };
    const hit = data?.data?.find((d) => d.name.toLowerCase() === SENDING_DOMAIN);
    const domain = hit ? { known: true, status: hit.status } : { known: false, status: "not added" };
    cached = { at: Date.now(), domain };
    return domain;
  } catch (err) {
    return { known: false, status: `Could not reach Resend: ${(err as Error).message}` };
  }
}

export async function checkSetup(): Promise<Setup> {
  const apiKey = process.env.RESEND_API_KEY;
  const items: SetupItem[] = [];

  items.push({
    key: "key",
    ok: Boolean(apiKey),
    title: "Resend key",
    detail: apiKey
      ? "Set. This is the account the emails go out through."
      : "Missing. Add RESEND_API_KEY to the Vercel project before anything can be sent.",
  });

  let domainOk = false;
  if (apiKey) {
    const d = await domainStatus(apiKey);
    domainOk = d.known && d.status === "verified";
    items.push({
      key: "domain",
      ok: domainOk,
      title: `Sending domain ${SENDING_DOMAIN}`,
      detail: domainOk
        ? "Verified. Mail from noreply@pgcreativeswi.com will be accepted by Gmail and the rest."
        : d.known
          ? `Added to Resend but ${d.status.replace(/_/g, " ")}. Finish the DNS records at the registrar, then press Verify in Resend.`
          : d.status === "not added"
            ? "Not in Resend yet. Every send is refused until the domain is added there and its DNS records are in place. The free plan allows three domains and the shared account is full, so one has to be freed or the plan upgraded."
            : d.status,
    });
  } else {
    items.push({
      key: "domain",
      ok: false,
      title: `Sending domain ${SENDING_DOMAIN}`,
      detail: "Cannot be checked without the key.",
    });
  }

  const address = postalAddress();
  items.push({
    key: "address",
    ok: Boolean(address),
    title: "Postal address in the footer",
    detail: address
      ? `Shows as "${address}".`
      : "Not set. Every marketing email is required by law to carry a physical mailing address (a PO box is fine). Add NEWSLETTER_POSTAL_ADDRESS to the project; until then the footer shows the markets served.",
  });

  items.push({
    key: "webhook",
    ok: Boolean(process.env.RESEND_WEBHOOK_SECRET),
    title: "Bounces and spam reports",
    detail: process.env.RESEND_WEBHOOK_SECRET
      ? "Connected. An address that bounces or marks the email as spam is taken off the list automatically."
      : "Not connected. In Resend, add a webhook for the email events pointing at https://pgcreativeswi.com/api/newsletter/webhook and put its signing secret in RESEND_WEBHOOK_SECRET. Until then bounces and spam reports are not seen here.",
  });

  return { items, canSend: Boolean(apiKey) && domainOk };
}
