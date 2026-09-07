"use client";

import { useState } from "react";
import { Phone, MessageSquare, Mail, Copy, Check, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Submission } from "@/lib/db";
import { updateStatusAction } from "@/app/actions/admin";

/**
 * The four things worth doing with a new lead, as one row of buttons.
 *
 * Call, text and email are real anchors rather than click handlers, because
 * tel:, sms: and mailto: are handed to the operating system and iOS is fussy
 * about which of those it will honour from script. The text and mail bodies
 * arrive already written, with the lead's name and what they asked about in
 * them, so the fast path is: tap, read, send.
 *
 * Tapping any of them also moves a new lead to Contacted. Reaching out is the
 * deliberate act; making the owner then remember to update a dropdown is how
 * a pipeline stops matching reality. An undo sits next to it for the times
 * they only wanted to look at the address.
 */

/** Formats to E.164 so tel: and sms: dial correctly from a phone. */
export function dialable(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length > 11) return `+${digits}`;
  return null;
}

/** What they asked for, in a form that reads naturally mid sentence. */
function subjectFor(service: string | null): string {
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

function smsBody(sub: Submission): string {
  return `Hi ${sub.first_name}, this is PG Creatives getting back to you about ${subjectFor(
    sub.service,
  )}. Happy to talk through timing and pricing. When is good for a quick call?`;
}

function emailSubject(sub: Submission): string {
  return `PG Creatives: following up on ${subjectFor(sub.service)}`;
}

function emailBody(sub: Submission): string {
  return [
    `Hi ${sub.first_name},`,
    ``,
    `Thanks for reaching out to PG Creatives about ${subjectFor(sub.service)}.`,
    ``,
    ``,
    ``,
    `Give me a call any time and we can get you on the schedule.`,
    ``,
    `PG Creatives`,
    `(920) 777 0127`,
    `pgcreativeswi.com`,
  ].join("\n");
}

type Size = "sm" | "md";

export function LeadActions({
  submission,
  size = "md",
  onStatusChange,
}: {
  submission: Submission;
  size?: Size;
  /** Lets the parent keep its own copy of the row in step. */
  onStatusChange?: (id: number, status: "contacted" | "new") => void;
}) {
  const [copied, setCopied] = useState(false);
  const [justMarked, setJustMarked] = useState(false);

  const tel = dialable(submission.phone);
  const wasNew = submission.status === "new";

  /* sms: takes its body after a "?&" on iOS and a "?" on Android. "?&" is the
     spelling both accept. */
  const smsHref = tel
    ? `sms:${tel}?&body=${encodeURIComponent(smsBody(submission))}`
    : null;
  const mailHref = `mailto:${submission.email}?subject=${encodeURIComponent(
    emailSubject(submission),
  )}&body=${encodeURIComponent(emailBody(submission))}`;

  async function markContacted() {
    if (!wasNew) return;
    setJustMarked(true);
    onStatusChange?.(submission.id, "contacted");
    await updateStatusAction(submission.id, "contacted");
  }

  async function undoMark() {
    setJustMarked(false);
    onStatusChange?.(submission.id, "new");
    await updateStatusAction(submission.id, "new");
  }

  async function copyDetails() {
    const text = [
      `${submission.first_name} ${submission.last_name}`,
      submission.email,
      submission.phone ?? "",
      submission.company ?? "",
    ]
      .filter(Boolean)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked in some contexts. The details are on screen.
    }
  }

  const base = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors",
    size === "md" ? "min-h-11 px-4 text-sm" : "min-h-9 px-3 text-xs",
  );
  const primary = cn(base, "border-signal bg-signal text-white hover:bg-[#3179c4]");
  const secondary = cn(
    base,
    "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tel ? (
          <a href={`tel:${tel}`} onClick={markContacted} className={primary}>
            <Phone className="h-4 w-4" />
            Call
          </a>
        ) : (
          <span
            className={cn(base, "border-line bg-surface text-ink-3 cursor-not-allowed")}
            title="This lead did not leave a phone number"
          >
            <Phone className="h-4 w-4" />
            No number
          </span>
        )}

        {smsHref && (
          <a href={smsHref} onClick={markContacted} className={secondary}>
            <MessageSquare className="h-4 w-4" />
            Text
          </a>
        )}

        <a href={mailHref} onClick={markContacted} className={secondary}>
          <Mail className="h-4 w-4" />
          Email
        </a>

        <button type="button" onClick={copyDetails} className={secondary}>
          {copied ? <Check className="h-4 w-4 text-signal-ink" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {justMarked && (
        <p className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
          Moved to Contacted.
          <button
            type="button"
            onClick={undoMark}
            className="inline-flex min-h-9 items-center gap-1 px-1 text-signal-ink underline underline-offset-2 hover:text-white"
          >
            <Undo2 className="h-3 w-3" />
            Undo
          </button>
        </p>
      )}
    </div>
  );
}
