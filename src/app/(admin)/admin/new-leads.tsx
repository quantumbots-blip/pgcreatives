"use client";

import { useState } from "react";
import { Clock, Building2, CheckCircle2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Submission } from "@/lib/db";
import { LeadActions } from "./lead-actions";
import { markSpamAction, updateStatusAction } from "@/app/actions/admin";
import { timeAgo, hoursSince, serviceLabel } from "./format";

/**
 * The top of the dashboard: everyone who has written in and not been answered.
 *
 * This panel exists because the old dashboard opened on two screens of traffic
 * charts, and a person waiting for a reply was below all of it. Charts are
 * something you look at once a month. This is the thing you open the page for,
 * so it comes first and every card carries the button that clears it.
 */

/** Colour of the waiting badge. A lead going cold should look like one. */
function ageTone(hours: number): { label: string; className: string } {
  if (hours < 4) return { label: "Just in", className: "bg-emerald-500/12 text-emerald-300" };
  if (hours < 24) return { label: "Today", className: "bg-[rgba(43,111,184,0.16)] text-signal-ink" };
  if (hours < 72) return { label: "Waiting", className: "bg-amber-500/12 text-amber-300" };
  return { label: "Going cold", className: "bg-red-500/12 text-red-300" };
}

export function NewLeads({ leads }: { leads: Submission[] }) {
  const [rows, setRows] = useState(leads);
  /* Answered cards stay put until the next load, dimmed, because the undo for
     "I only wanted to read the address" lives inside the card. Removing it on
     tap would take the undo with it. */
  const [answered, setAnswered] = useState<Set<number>>(new Set());

  function drop(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function setAnsweredState(id: number, isAnswered: boolean) {
    setAnswered((prev) => {
      const next = new Set(prev);
      if (isAnswered) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const waiting = rows.filter((r) => !answered.has(r.id)).length;

  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-line bg-surface p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
          <div>
            <h2 className="text-base font-semibold text-white">Everyone has been answered</h2>
            <p className="mt-1 text-sm text-ink-3">
              New submissions land here the moment they arrive.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 sm:mb-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-ink-3">
          Needs a reply
        </h2>
        <span className="text-xs text-ink-3">
          {waiting === 0 ? "all answered" : `${waiting} waiting`}
        </span>
      </div>

      <ul className="space-y-3">
        {rows.map((lead) => {
          const age = ageTone(hoursSince(lead.created_at));
          const isAnswered = answered.has(lead.id);
          return (
            <li
              key={lead.id}
              className={cn(
                "rounded-lg border border-line bg-surface-hi p-4 transition-colors hover:border-line-strong",
                isAnswered && "opacity-60",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-white">
                    {lead.first_name} {lead.last_name}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
                    <span className="text-ink-2">{serviceLabel(lead.service)}</span>
                    <span aria-hidden="true">&middot;</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(lead.created_at)}
                    </span>
                    {lead.company && (
                      <>
                        <span aria-hidden="true">&middot;</span>
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {lead.company}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                    isAnswered ? "bg-white/[0.06] text-ink-3" : age.className,
                  )}
                >
                  {isAnswered ? "Answered" : age.label}
                </span>
              </div>

              {lead.message?.trim() && (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-2">
                  {lead.message}
                </p>
              )}

              <div className="mt-4">
                <LeadActions
                  submission={lead}
                  onStatusChange={(id, status) => setAnsweredState(id, status === "contacted")}
                />
              </div>

              <div className="-mx-2 mt-3 flex flex-wrap gap-2 border-t border-line pt-2 text-xs">
                <button
                  type="button"
                  onClick={async () => {
                    drop(lead.id);
                    await updateStatusAction(lead.id, "booked");
                  }}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-ink-3 transition-colors hover:bg-white/[0.04] hover:text-emerald-300"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Booked
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    drop(lead.id);
                    await markSpamAction(lead.id, true);
                  }}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-ink-3 transition-colors hover:bg-white/[0.04] hover:text-red-300"
                >
                  <Ban className="h-3.5 w-3.5" />
                  Not a real lead
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
