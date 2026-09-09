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

  /* flex-1 with a zero basis rather than fixed padding, so four buttons share
     a phone's width in one row instead of spilling Copy onto a second and
     Follow up onto a third.

     min-w-0 matters as much as the basis: a flex item will not shrink below
     its own content by default, so on a 360px phone the four buttons pushed
     the whole page four pixels wider than the screen rather than giving up
     four pixels of padding between them. Below 360 there is genuinely not
     room for four, and they become two rows of two. */
  const base = cn(
    "inline-flex min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 rounded-lg border font-medium transition-colors",
    size === "md" ? "min-h-11 px-2 text-sm sm:px-4" : "min-h-9 px-2 text-xs sm:px-3",
  );
  const primary = cn(base, "border-signal bg-signal text-white hover:bg-[#3179c4]");
  const secondary = cn(
    base,
    "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
  );

  /* Whichever way of reaching this person actually exists is the filled
     button. A lead with no number used to put a dead grey "No number" box in
     the primary slot, which spent the most prominent thing on the card
     saying that nothing could be done. The card's contact line carries the
     absence now, and the button that does work is the one that stands out. */
  const emailIsPrimary = !callHref && !!mailHref;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 min-[360px]:flex">
        {callHref && (
          <a href={callHref} onClick={markContacted} className={primary}>
            <Phone className="h-4 w-4 shrink-0" />
            <span className="truncate">Call</span>
          </a>
        )}

        {textHref && (
          <a href={textHref} onClick={markContacted} className={secondary}>
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span className="truncate">Text</span>
          </a>
        )}

        {mailHref && (
          <a
            href={mailHref}
            onClick={markContacted}
            className={emailIsPrimary ? primary : secondary}
          >
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">Email</span>
          </a>
        )}

        {/* Desktop only. Four labelled buttons do not fit a phone: sharing
            292px between them leaves 67px each where "Email" needs 72, and
            they came out reading "C…", "Te…", "E…". Copy is also the one of
            the four a phone needs least, now that the number and the address
            are printed on the card and the other three act on them directly.
            It is worth its place on a desktop, where the details are being
            pasted somewhere else. */}
        <button
          type="button"
          onClick={copyDetails}
          className={cn(secondary, "hidden sm:inline-flex")}
        >
          {copied ? (
            <Check className="h-4 w-4 shrink-0 text-signal-ink" />
          ) : (
            <Copy className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate">{copied ? "Copied" : "Copy"}</span>
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
