import { BUSINESS } from "@/lib/data";
import {
  render,
  row,
  esc,
  headerSafe,
  when,
  COLOR,
  DASHBOARD_URL,
  SITE_URL,
  type Button,
  type RenderedEmail,
} from "./layout";
import {
  telHref,
  smsHref,
  mailtoHref,
  subjectFor,
  formatPhone,
  type LeadLike,
} from "@/lib/lead-messages";

/**
 * Every email this site sends.
 *
 * Three kinds, and the first one is the one that matters. Six leads have sat
 * in this pipeline unanswered, the oldest for months, and the only thing that
 * ever announced them was a line of plain text in a Gmail inbox that also
 * received the outreach spam. So the new lead email is built to be acted on
 * from a phone: the reply is three taps from the notification, with the
 * message already written.
 */

export const EMAIL_KINDS = ["new_lead", "weekly_digest", "lead_confirmation"] as const;
export type EmailKind = (typeof EMAIL_KINDS)[number];

const linkStyle = `color:${COLOR.signalDeep};text-decoration:underline`;

/** How long they have been waiting, in words. */
function waitedFor(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

/* ── 1. A lead came in ───────────────────────────────────────────────── */

export type NewLeadData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  source?: string | null;
  receivedAt?: string;
};

export function newLeadEmail(d: NewLeadData): RenderedEmail {
  const lead: LeadLike = {
    first_name: d.firstName || "there",
    last_name: d.lastName,
    email: d.email,
    phone: d.phone,
    service: d.service,
  };
  /* Flattened before it goes anywhere. These come straight off the contact
     form, and a line break in a name does not only threaten the subject
     header: it breaks the plain text body's shape too. Newlines belong in the
     message field, which is rendered with nl2br on purpose. */
  const name = headerSafe(`${d.firstName} ${d.lastName}`) || "Someone";
  const firstName = headerSafe(d.firstName) || name;
  const tel = telHref(d.phone);
  const sms = smsHref(lead);
  const mail = mailtoHref(lead);

  /* Call first, because it is the fastest way to win a real estate booking
     and the one the owner is least likely to do from an inbox. Text and email
     arrive already written. */
  const buttons: Button[] = [];
  if (tel) buttons.push({ href: tel, label: `Call ${firstName}` });
  if (sms) buttons.push({ href: sms, label: "Text them back", style: "outline" });
  if (mail) buttons.push({ href: mail, label: "Reply by email", style: "outline" });
  buttons.push({ href: DASHBOARD_URL, label: "Open the dashboard", style: "outline" });

  const prettyPhone = formatPhone(d.phone);
  const phoneHtml = d.phone
    ? `<a href="${esc(tel ?? `tel:${d.phone}`)}" style="${linkStyle}">${esc(prettyPhone)}</a>`
    : undefined;
  const emailHtml = d.email
    ? `<a href="mailto:${esc(d.email)}" style="${linkStyle}">${esc(d.email)}</a>`
    : undefined;

  return render({
    subject: `New lead: ${name}, ${subjectFor(d.service)}`,
    // Replying to the notification reaches the customer, which is what
    // anybody who hits reply on this is trying to do.
    replyTo: d.email || undefined,
    badge: "New lead",
    badgeTone: "signal",
    preheader: d.message
      ? d.message.replace(/\s+/g, " ").slice(0, 110)
      : `${name} asked about ${subjectFor(d.service)}.`,
    title: `${name} wants ${subjectFor(d.service)}`,
    sub: d.phone
      ? "Call while it is fresh. The text and the email are already written."
      : "They left no number, so email is the way back to them.",
    rows: [
      row("Name", name),
      row("Phone", prettyPhone, phoneHtml),
      row("Email", d.email, emailHtml),
      row("Brokerage or company", headerSafe(d.company)),
      row("Service", headerSafe(d.service) || "Not specified"),
      row("What they said", d.message, d.message ? esc(d.message).replace(/\n/g, "<br>") : undefined),
      row("Came from", d.source === "direct" ? "Direct visit" : d.source),
      row("Received", d.receivedAt ? when(d.receivedAt) : ""),
    ],
    buttons,
    note: "Marking the lead Contacted in the dashboard is what keeps the reply time honest and stops it turning up on the Monday list.",
  });
}

/* ── 2. Monday morning ───────────────────────────────────────────────── */

export type WeeklyDigestData = {
  waiting: number;
  waitingNames: { name: string; service: string | null; days: number }[];
  leadsThisWeek: number;
  leadsLastWeek: number;
  booked: number;
  viewsThisWeek: number;
  viewsLastWeek: number;
  spamFiltered: number;
  medianReplyHours: number | null;
};

/* The row label already says what is being counted, so the value says the
   number and what it did. "2 leads, 100% up on the week before" next to a
   LEADS label read as somebody explaining a spreadsheet. */
function change(now: number, before: number): string {
  if (before === 0) return now === 0 ? "None either week" : `${now}, none the week before`;
  if (now === before) return `${now}, same as the week before`;
  return `${now}, ${now > before ? "up" : "down"} from ${before} the week before`;
}

function replyTime(hours: number | null): string {
  if (hours === null) return "";
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  if (hours < 48) return `${Math.round(hours)} hours`;
  return `${Math.round(hours / 24)} days`;
}

export function weeklyDigestEmail(d: WeeklyDigestData): RenderedEmail {
  const anyWaiting = d.waiting > 0;

  const waitingHtml = anyWaiting
    ? d.waitingNames
        .map(
          (w) =>
            `<div style="padding:3px 0"><strong style="color:${COLOR.ink}">${esc(w.name)}</strong>` +
            (w.service ? `<span style="color:${COLOR.ink3}"> &middot; ${esc(w.service)}</span>` : "") +
            `<span style="color:${COLOR.ink3}"> &middot; waiting ${esc(waitedFor(w.days))}</span></div>`,
        )
        .join("") +
      (d.waiting > d.waitingNames.length
        ? `<div style="padding:3px 0;color:${COLOR.ink3}">and ${d.waiting - d.waitingNames.length} more</div>`
        : "")
    : undefined;

  const waitingText = anyWaiting
    ? d.waitingNames
        .map((w) => `${w.name}${w.service ? ` (${w.service})` : ""}, waiting ${waitedFor(w.days)}`)
        .join("\n")
    : "";

  return render({
    subject: anyWaiting
      ? `${d.waiting} ${d.waiting === 1 ? "lead is" : "leads are"} waiting on you`
      : `Your week at PG Creatives: ${d.leadsThisWeek} ${d.leadsThisWeek === 1 ? "lead" : "leads"}`,
    badge: anyWaiting ? "Needs a reply" : "All clear",
    badgeTone: anyWaiting ? "warn" : "good",
    preheader: anyWaiting
      ? `${d.waiting} waiting, ${d.leadsThisWeek} came in last week.`
      : `Nobody is waiting. ${d.leadsThisWeek} came in last week.`,
    title: anyWaiting
      ? `${d.waiting} ${d.waiting === 1 ? "person is" : "people are"} still waiting on a reply`
      : "Nobody is waiting on a reply",
    sub: anyWaiting
      ? "Here is where things stand this Monday."
      : "Everything that came in has been answered. Here is the week.",
    rows: [
      anyWaiting ? row("Waiting on you", waitingText, waitingHtml) : null,
      row("Leads last week", change(d.leadsThisWeek, d.leadsLastWeek)),
      row("Page views last week", change(d.viewsThisWeek, d.viewsLastWeek)),
      d.booked > 0 ? row("Booked", `${d.booked} ${d.booked === 1 ? "lead" : "leads"} booked`) : null,
      d.medianReplyHours !== null
        ? row("Your typical reply", `About ${replyTime(d.medianReplyHours)}`)
        : null,
      d.spamFiltered > 0
        ? row(
            "Spam filtered",
            `${d.spamFiltered} ${d.spamFiltered === 1 ? "message" : "messages"} never reached you`,
          )
        : null,
    ],
    buttons: [{ href: DASHBOARD_URL, label: anyWaiting ? "Answer them now" : "Open the dashboard" }],
    footerNote: "Sent every Monday by your PG Creatives dashboard.",
  });
}

/* ── 3. To the person who wrote in ───────────────────────────────────── */

export type LeadConfirmationData = {
  firstName: string;
  service: string;
  message: string;
};

/**
 * Not switched on. Sending it is a decision about what lands in a customer's
 * inbox under this business's name, so it waits for the owner to say yes, and
 * the dashboard has a preview of exactly what it says. See CONFIRM_LEADS in
 * the contact action.
 */
export function leadConfirmationEmail(d: LeadConfirmationData): RenderedEmail {
  const first = d.firstName || "there";
  const greenBay = BUSINESS.phones.greenBay;

  return render({
    subject: "We got your message, PG Creatives",
    replyTo: BUSINESS.email,
    badge: "Message received",
    badgeTone: "good",
    preheader: "We usually get back the same day.",
    title: `Thanks ${first}, we have your message`,
    sub: "Somebody here will read it and get back to you, usually the same day.",
    body:
      "You do not need to do anything. If it is urgent, or you would rather just talk it through, the numbers below reach us directly.",
    rows: [
      row("What you asked about", d.service || "General inquiry"),
      row(
        "What you sent",
        d.message,
        d.message ? esc(d.message).replace(/\n/g, "<br>") : undefined,
      ),
    ],
    buttons: [
      { href: `tel:${greenBay.href.replace("tel:", "")}`, label: `Call us, ${greenBay.number}` },
      { href: `${SITE_URL}/portfolio`, label: "See recent work", style: "outline" },
    ],
    note: `Serving ${BUSINESS.locationText}. Real estate, commercial and brand media.`,
    footerNote: "You are getting this because you sent us a message at pgcreativeswi.com.",
  });
}

/* ── Preview fixtures, used by the dashboard preview and the tests ───── */

export const SAMPLE = {
  new_lead: {
    firstName: "Heather",
    lastName: "Zeitler",
    email: "heathersellswi@gmail.com",
    phone: "9205911323",
    company: "Coldwell Banker",
    service: "Real Estate",
    message:
      "Hello! I am a real estate agent in Green Bay. I have been considering switching photographers. Would love to learn more about pricing on photos and video.",
    source: "l.instagram.com",
    receivedAt: "2026-09-01T15:05:56.637Z",
  } satisfies NewLeadData,
  weekly_digest: {
    waiting: 3,
    waitingNames: [
      { name: "Kirstie Skul", service: "Real Estate", days: 160 },
      { name: "Paula Motte", service: "Real Estate", days: 104 },
      { name: "Heather Zeitler", service: "Real Estate", days: 12 },
    ],
    leadsThisWeek: 2,
    leadsLastWeek: 1,
    booked: 1,
    viewsThisWeek: 284,
    viewsLastWeek: 206,
    spamFiltered: 4,
    medianReplyHours: 5.5,
  } satisfies WeeklyDigestData,
  lead_confirmation: {
    firstName: "Heather",
    service: "Real Estate",
    message:
      "Hello! I am a real estate agent in Green Bay. I have been considering switching photographers. Would love to learn more about pricing on photos and video.",
  } satisfies LeadConfirmationData,
};

export function renderSample(kind: EmailKind): RenderedEmail {
  switch (kind) {
    case "new_lead":
      return newLeadEmail(SAMPLE.new_lead);
    case "weekly_digest":
      return weeklyDigestEmail(SAMPLE.weekly_digest);
    case "lead_confirmation":
      return leadConfirmationEmail(SAMPLE.lead_confirmation);
    default:
      throw new Error(`Unknown email kind: ${kind}`);
  }
}

export const KIND_LABEL: Record<EmailKind, string> = {
  new_lead: "New lead",
  weekly_digest: "Monday summary",
  lead_confirmation: "Reply to the customer",
};
