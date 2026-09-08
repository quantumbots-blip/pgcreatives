import { BUSINESS } from "@/lib/data";

/**
 * The words used to answer a lead, in one place.
 *
 * The dashboard buttons and the notification email both offer to call, text
 * and email the same person, and they have to offer the same message. Two
 * copies drift: somebody improves the wording on the card, the email keeps
 * saying the old thing, and the owner ends up sending whichever one he
 * happened to tap.
 *
 * Shared with `src/lib/email`, which runs on the server, so nothing here may
 * touch the DOM.
 */

export type LeadLike = {
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  service?: string | null;
};

/** Formats to E.164 so tel: and sms: dial correctly from a phone. */
export function dialable(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length > 11) return `+${digits}`;
  return null;
}

/**
 * A US number the way a person writes it. Anything that is not a ten digit
 * number is handed back untouched, since an international number invented
 * into a US shape would be worse than the digits somebody actually typed.
 */
export function formatPhone(phone: string | null | undefined): string {
  const raw = (phone ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (ten.length !== 10) return raw;
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
}

/**
 * What they asked for, in two voices.
 *
 * There is only one phrase per service but two people read it, and they are
 * not in the same position. Writing to the customer, "your real estate shoot"
 * is right. Describing that customer to the owner, the same words produce
 * "Heather Zeitler wants your real estate shoot", which reads as if the shoot
 * were already ours and she were after it.
 *
 * So: `subjectFor` stays second person and is only ever used in a message
 * addressed to the customer. `serviceNoun` names the thing plainly and is
 * what the owner's notification uses.
 */
export function subjectFor(service: string | null | undefined): string {
  switch (service) {
    case "Real Estate":
      return "your real estate shoot";
    case "Commercial":
      return "your commercial project";
    case "Personal Brand":
      return "the Content Creator Program";
    case "Social Media":
      return "your social media content";
    default:
      return "the project you asked about";
  }
}

/** The same request, named rather than addressed. For the owner's eyes. */
export function serviceNoun(service: string | null | undefined): string {
  switch (service) {
    case "Real Estate":
      return "real estate photography";
    case "Commercial":
      return "commercial work";
    case "Personal Brand":
      return "the Content Creator Program";
    case "Social Media":
      return "social media content";
    default:
      return "";
  }
}

export function smsBody(lead: LeadLike): string {
  return `Hi ${lead.first_name}, this is PG Creatives getting back to you about ${subjectFor(
    lead.service,
  )}. Happy to talk through timing and pricing. When is good for a quick call?`;
}

export function emailSubject(lead: LeadLike): string {
  return `PG Creatives: following up on ${subjectFor(lead.service)}`;
}

export function emailBody(lead: LeadLike): string {
  return [
    `Hi ${lead.first_name},`,
    ``,
    `Thanks for reaching out to PG Creatives about ${subjectFor(lead.service)}.`,
    ``,
    ``,
    ``,
    `Give me a call any time and we can get you on the schedule.`,
    ``,
    `PG Creatives`,
    BUSINESS.phones.greenBay.number,
    `pgcreativeswi.com`,
  ].join("\n");
}

/* ── Links ────────────────────────────────────────────────────────────
   sms: takes its body after a "?&" on iOS and a "?" on Android. "?&" is the
   spelling both accept, and it is what the dashboard buttons already use. */

export function telHref(phone: string | null | undefined): string | null {
  const tel = dialable(phone);
  return tel ? `tel:${tel}` : null;
}

export function smsHref(lead: LeadLike): string | null {
  const tel = dialable(lead.phone);
  return tel ? `sms:${tel}?&body=${encodeURIComponent(smsBody(lead))}` : null;
}

export function mailtoHref(lead: LeadLike): string | null {
  const address = lead.email?.trim();
  if (!address) return null;
  return `mailto:${address}?subject=${encodeURIComponent(
    emailSubject(lead),
  )}&body=${encodeURIComponent(emailBody(lead))}`;
}
