"use client";

import { useState } from "react";
import { CalendarClock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { setFollowUpAction } from "@/app/actions/admin";

/**
 * "Remind me about this in three days."
 *
 * The status list has no answer for the most common thing that happens to a
 * lead: it gets a reply, moves to Contacted, and is never thought about
 * again. Contacted is the middle of an outcome, not one. A date puts the lead
 * back at the top of the page on the day it is worth another try, which is
 * the whole mechanism.
 *
 * Fixed intervals rather than a date picker: nobody chooses the 14th, they
 * choose "next week".
 */

const CHOICES = [
  { days: 1, label: "Tomorrow" },
  { days: 3, label: "3 days" },
  { days: 7, label: "Next week" },
  { days: 30, label: "A month" },
];

export function FollowUp({
  id,
  followUpAt,
  isDue: initiallyDue = false,
  onChange,
}: {
  id: number;
  followUpAt: string | null;
  /** Decided by the database when the page was built. */
  isDue?: boolean;
  onChange?: (iso: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(followUpAt);

  async function choose(days: number | null) {
    // Reading the clock here is fine: it is an event handler, not a render.
    const iso = days === null ? null : new Date(Date.now() + days * 86_400_000).toISOString();
    setCurrent(iso);
    setOpen(false);
    onChange?.(iso);
    await setFollowUpAction(id, days);
  }

  const due = current ? new Date(current) : null;
  /* Any date picked in this session is days away by construction, so only the
     one the page arrived with can be due. That keeps the render pure and
     means two cards never disagree about what time it is. */
  const isDue = current === followUpAt && initiallyDue;

  /* A fragment rather than a wrapper, so the parent can lay the button out
     beside other buttons while the choices, when they open, take a line of
     their own. Wrapped in a div the four intervals had to wrap inside the
     button's own width and came out as a narrow stack. */
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-colors",
            due
              ? isDue
                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border-line bg-surface text-ink-2"
              : "border-line text-ink-3 hover:border-line-strong hover:text-ink-2",
          )}
        >
          <CalendarClock className="h-3.5 w-3.5" />
          {due
            ? isDue
              ? "Follow up due"
              : `Follow up ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            : "Follow up"}
        </button>

        {due && (
          <button
            type="button"
            onClick={() => choose(null)}
            className="inline-flex min-h-9 items-center gap-1 px-1 text-xs text-ink-3 transition-colors hover:text-white"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {open && (
        <div className="flex w-full basis-full flex-wrap gap-2">
          {CHOICES.map((c) => (
            <button
              key={c.days}
              type="button"
              onClick={() => choose(c.days)}
              className="min-h-9 rounded-lg border border-line bg-surface px-3 text-xs text-ink-2 transition-colors hover:border-line-strong hover:text-white"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
