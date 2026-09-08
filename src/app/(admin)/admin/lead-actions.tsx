"use client";

import { useState } from "react";
import { Phone, MessageSquare, Mail, Copy, Check, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Submission } from "@/lib/db";
import { updateStatusAction } from "@/app/actions/admin";
import { telHref, smsHref, mailtoHref } from "@/lib/lead-messages";

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

  /* All three come from lib/lead-messages, which the notification email uses
     too, so the wording a lead gets is the same whichever one is tapped. */
  const wasNew = submission.status === "new";
  const callHref = telHref(submission.phone);
  const textHref = smsHref(submission);
  const mailHref = mailtoHref(submission);

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
        {callHref ? (
          <a href={callHref} onClick={markContacted} className={primary}>
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

        {textHref && (
          <a href={textHref} onClick={markContacted} className={secondary}>
            <MessageSquare className="h-4 w-4" />
            Text
          </a>
        )}

        {mailHref ? (
          <a href={mailHref} onClick={markContacted} className={secondary}>
            <Mail className="h-4 w-4" />
            Email
          </a>
        ) : (
          <span
            className={cn(base, "border-line bg-surface text-ink-3 cursor-not-allowed")}
            title="This lead did not leave an email address"
          >
            <Mail className="h-4 w-4" />
            No email
          </span>
        )}

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
