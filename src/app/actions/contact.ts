"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { Resend } from "resend";
import { checkBotId } from "botid/server";
import {
  saveSubmission,
  ensureSchema,
  countRecentByEmail,
  countRecentTotal,
  isDuplicateSubmission,
  recordBlockedAttempt,
} from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkFormToken } from "@/lib/form-token";
import { BUSINESS } from "@/lib/data";
import { scoreSubmission, submissionFingerprint } from "@/lib/spam";
import { newLeadEmail, leadConfirmationEmail } from "@/lib/email/templates";
import { sendPush } from "@/lib/push";
import { subjectFor, formatPhone } from "@/lib/lead-messages";

export type ContactState = {
  success: boolean;
  error: string | null;
  /* What the visitor typed, echoed back so a failed submission does not wipe
     the form. React 19 resets an uncontrolled form once the action settles —
     including when it settles with an error — so without this someone who
     writes a paragraph and trips a validation rule loses the paragraph. */
  values?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    service: string;
    message: string;
  };
};

const MAX_LENGTHS = {
  firstName: 50,
  lastName: 50,
  email: 254,
  company: 100,
  phone: 20,
  service: 100,
  message: 5000,
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/* ── Intake limits ────────────────────────────────────────────────────
   Three layers, because the two floods this site has actually seen looked
   nothing alike. One was thirty three copies of the same message from one
   address, spread thin enough over four days that a per IP window never saw
   two in a row. The other is a steady drip of outreach, one a week. */

/** Bursts from one connection. */
const IP_BURST = { max: 3, minutes: 10 } as const;
/** A single connection over a day, which is what a slow drip trips. */
const IP_DAILY = { max: 8, minutes: 60 * 24 } as const;
/** One address, however it reaches us. */
const EMAIL_DAILY_MAX = 3;
/** Site wide breaker. Nothing legitimate looks like this. */
const SITE_HOURLY_MAX = 25;
/** Window in which the same message twice counts as a repeat. */
const DUPLICATE_HOURS = 24;

/** Salted so the stored value cannot be walked back to an address. */
function hashIp(ip: string): string | null {
  if (!ip || ip === "unknown") return null;
  const salt = process.env.ANALYTICS_SALT || process.env.SESSION_SECRET || "pgc";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function truncate(value: string, max: number): string {
  return value.slice(0, max);
}

/**
 * What a turned away submitter is told.
 *
 * Deliberately the same shape as a success. Anything that names the reason
 * teaches whoever is probing which rule they tripped, and the people who trip
 * these rules are not the people we want to help. Real visitors do not reach
 * this path: the limits sit far above what one person sends.
 */
const SILENT_SUCCESS: ContactState = { success: true, error: null };

export async function submitContactForm(
  prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const ip = await getClientIp();
  const ipHash = hashIp(ip);

  // Honeypot check — hidden field that bots fill out
  const honeypot = String(formData.get("website") ?? "");
  if (honeypot) {
    await recordBlockedAttempt("honeypot", ipHash);
    return SILENT_SUCCESS;
  }

  /* Vercel BotID. Classifies the session from signals the browser cannot
     fake, which is what catches the scripted repeats that no amount of
     content scoring would separate from a real message. Locally it always
     answers isBot: false, so this is inert in development. */
  try {
    const verification = await checkBotId();
    if (verification.isBot) {
      await recordBlockedAttempt("bot", ipHash);
      return SILENT_SUCCESS;
    }
  } catch (err) {
    // BotID being unreachable must never take the contact form down with it.
    console.error("[contact] BotID check failed, allowing through:", (err as Error).message);
  }

  const burstOk = await checkRateLimit(`contact:${ip}`, IP_BURST.max, IP_BURST.minutes);
  const dailyOk = await checkRateLimit(`contact-day:${ip}`, IP_DAILY.max, IP_DAILY.minutes);
  if (!burstOk || !dailyOk) {
    await recordBlockedAttempt("rate_limit", ipHash);
    return {
      success: false,
      error: "You've submitted too many messages. Please try again shortly.",
    };
  }

  const firstName = truncate(String(formData.get("firstName") ?? "").trim(), MAX_LENGTHS.firstName);
  const lastName = truncate(String(formData.get("lastName") ?? "").trim(), MAX_LENGTHS.lastName);
  const email = truncate(String(formData.get("email") ?? "").trim(), MAX_LENGTHS.email);
  const company = truncate(String(formData.get("company") ?? "").trim(), MAX_LENGTHS.company);
  const phone = truncate(String(formData.get("phone") ?? "").trim(), MAX_LENGTHS.phone);
  const service = truncate(String(formData.get("service") ?? "").trim(), MAX_LENGTHS.service);
  const message = truncate(String(formData.get("message") ?? "").trim(), MAX_LENGTHS.message);

  const values = { firstName, lastName, email, phone, service, message };

  // Message is deliberately NOT required. Its label reads "Any additional
  // details…" and carries no asterisk, so requiring it server-side rejected
  // submissions for a field the form never said was needed — and the error
  // named no field, so there was nothing to act on.
  if (!firstName || !lastName || !email) {
    return {
      success: false,
      error: "Please fill in your first name, last name, and email.",
      values,
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      success: false,
      error: "Please enter a valid email address.",
      values,
    };
  }

  /* How long the form was open, from the token the page fetched on mount.
     undefined means we could not check, which scores nothing. */
  const token = checkFormToken(String(formData.get("formToken") ?? ""));
  const fillSeconds =
    token.state === "valid" ? token.fillSeconds : token.state === "missing" ? null : undefined;

  const fingerprint = submissionFingerprint({ email, firstName, lastName, message });

  /* Everything from here needs the database. If it is down we skip the
     history checks rather than turn a real lead away, and the email still
     goes out. */
  let duplicate = false;
  let dbReachable = true;
  try {
    await ensureSchema();
    const [emailCount, siteCount, isDupe] = await Promise.all([
      countRecentByEmail(email, 24),
      countRecentTotal(1),
      isDuplicateSubmission(fingerprint, DUPLICATE_HOURS),
    ]);
    duplicate = isDupe;

    if (emailCount >= EMAIL_DAILY_MAX) {
      await recordBlockedAttempt("rate_limit", ipHash);
      return SILENT_SUCCESS;
    }
    if (siteCount >= SITE_HOURLY_MAX) {
      await recordBlockedAttempt("rate_limit", ipHash);
      return SILENT_SUCCESS;
    }
    // The same message twice inside a day is either a double tap on the
    // button or a script on a loop. Neither needs a second row.
    if (duplicate) {
      await recordBlockedAttempt("duplicate", ipHash);
      return SILENT_SUCCESS;
    }
  } catch (err) {
    dbReachable = false;
    console.error("[contact] Intake checks skipped, database unreachable:", (err as Error).message);
  }

  const verdict = scoreSubmission({
    firstName,
    lastName,
    email,
    company,
    phone,
    service,
    message,
    duplicate,
    fillSeconds,
  });

  const hdrs = await headers();
  const userAgent = (hdrs.get("user-agent") ?? "").slice(0, 400) || null;

  /* How the visit started, captured on the first page of the session. Only
     ever used to group leads by channel, never shown to the visitor. */
  const sourceReferrer =
    truncate(String(formData.get("sourceReferrer") ?? "").trim(), 255) || null;
  const sourceLanding =
    truncate(String(formData.get("sourceLanding") ?? "").trim(), 500) || null;
  const sourceCampaign =
    truncate(String(formData.get("sourceCampaign") ?? "").trim(), 120) || null;

  if (dbReachable) {
    try {
      await saveSubmission({
        firstName,
        lastName,
        email,
        company,
        phone,
        service,
        message,
        isSpam: verdict.isSpam,
        spamScore: verdict.score,
        spamReasons: verdict.reasons,
        fingerprint,
        ipHash,
        userAgent,
        sourceReferrer,
        sourceLanding,
        sourceCampaign,
      });
    } catch (err) {
      console.error("[contact] Database save failed:", (err as Error).message);
      // Don't block the submission if DB fails — still send email
    }
  }

  /* The buzz on the owner's phone. Fired before the email because it is the
     part that changes behaviour: an email joins a queue, a notification
     interrupts. Never awaited into the visitor's path in a way that could
     fail their submission, and sendPush swallows its own errors. */
  void sendPush({
    title: `New lead: ${firstName} ${lastName}`.trim(),
    body: [
      subjectFor(service),
      formatPhone(phone) || email,
      message ? message.replace(/\s+/g, " ").slice(0, 90) : "",
    ]
      .filter(Boolean)
      .join(" · "),
    url: "/admin",
    tag: "pg-lead",
  });

  /* Quarantined mail is not forwarded. It is in the dashboard's Spam tab with
     its reasons attached, and one tap puts it back if the filter got it
     wrong. The whole point of the exercise is that this does not reach the
     inbox. */
  if (verdict.isSpam) {
    return SILENT_SUCCESS;
  }

  // Send email notification
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No API key. The submission is in the database, which is enough, unless
    // the database is where the problem was.
    return dbReachable
      ? { success: true, error: null }
      : {
          success: false,
          error: "Something went wrong. Please try again or call us directly.",
          values,
        };
  }

  const resend = new Resend(apiKey);

  const notification = newLeadEmail({
    firstName,
    lastName,
    email,
    phone,
    company,
    service,
    message,
    source: sourceReferrer,
    receivedAt: new Date().toISOString(),
  });

  try {
    await resend.emails.send({
      from: "PG Creatives <noreply@pgcreativeswi.com>",
      to: BUSINESS.email,
      replyTo: notification.replyTo,
      subject: notification.subject,
      html: notification.html,
      text: notification.text,
    });

    /* An acknowledgement to the person who wrote in. Off unless the owner
       turns it on, because it is his name on an email landing in a customer's
       inbox and that is his decision to make, not a default. The dashboard
       has a preview of exactly what it says. */
    if (process.env.CONFIRM_LEADS === "1") {
      const confirmation = leadConfirmationEmail({ firstName, service, message });
      try {
        await resend.emails.send({
          from: "PG Creatives <noreply@pgcreativeswi.com>",
          to: email,
          replyTo: BUSINESS.email,
          subject: confirmation.subject,
          html: confirmation.html,
          text: confirmation.text,
        });
      } catch (err) {
        // The lead is safe either way. A failed courtesy note is not a
        // reason to tell the visitor their message did not go through.
        console.error("[contact] Confirmation to the visitor failed:", (err as Error).message);
      }
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("[contact] Email send failed:", (err as Error).message);
    // If the lead is already in the database, telling the visitor it failed
    // only invites a second copy of a message we have. It is only a real
    // failure when neither the database nor the mail got it.
    if (dbReachable) return { success: true, error: null };
    return {
      success: false,
      error: "Something went wrong. Please try again or call us directly.",
      values,
    };
  }
}
