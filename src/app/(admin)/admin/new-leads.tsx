"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Ban, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Submission } from "@/lib/db";
import { LeadActions } from "./lead-actions";
import { FollowUp } from "./follow-up";
import { markSpamAction, updateStatusAction } from "@/app/actions/admin";
import { compactAge, hoursSince, serviceLabel, reachability } from "./format";
import { formatPhone } from "@/lib/lead-messages";

/**
 * The top of the dashboard: everyone who has written in and not been answered.
 *
 * This panel exists because the old dashboard opened on two screens of traffic
 * charts, and a person waiting for a reply was below all of it. Charts are
 * something you look at once a month. This is the thing you open the page for,
 * so it comes first and every card carries the button that clears it.
 */

/** Color of the waiting badge. A lead going cold should look like one. */
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
  const [syncedFrom, setSyncedFrom] = useState(leads);

  /* Keep the local copy in step with the server.
     These lists are held in state so a tap responds immediately instead of
     waiting for a round trip. The cost is that useState ignores later props:
     after adding a lead, router.refresh() re-rendered the server component
     and this kept showing the old array, so a new lead only appeared after a
     hard reload. Comparing the incoming array by identity during render is
     React's own answer to that, and it settles before anything paints. */
  if (leads !== syncedFrom) {
    setSyncedFrom(leads);
    setRows(leads);
    setAnswered(new Set());
  }

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
          /* A lead the owner parked until today is here for a different
             reason than one that arrived this morning, and its age is beside
             the point. Say which it is rather than telling somebody a lead
             they already answered is going cold. */
          const isDueFollowUp = (lead.status || "new") !== "new" && lead.follow_up_due;
          const age = isDueFollowUp
            ? { label: "Follow up due", className: "bg-amber-500/12 text-amber-300" }
            : ageTone(hoursSince(lead.created_at));
          const isAnswered = answered.has(lead.id);
          /* What they left you to reach them with. Two cards used to look
             identical whether one had a phone number and the other had
             nothing at all. */
          const reach = reachability(lead);
          return (
            <li
              key={lead.id}
              className={cn(
                "rounded-lg border border-line bg-surface-hi p-4 transition-colors hover:border-line-strong",
                isAnswered && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">
                    {lead.first_name} {lead.last_name}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
                    <span className="text-ink-2">{serviceLabel(lead.service)}</span>
                    {lead.company && (
                      <>
                        <span aria-hidden="true">&middot;</span>
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{lead.company}</span>
                        </span>
                      </>
                    )}
                    {isDueFollowUp && (
                      <>
                        <span aria-hidden="true">&middot;</span>
                        <span>you asked to revisit this</span>
                      </>
                    )}
                  </p>
                </div>
                {/* The age lives in the badge rather than beside it. Every
                    card used to say "5mo ago" in the line above a red chip
                    reading "Going cold", which is one fact wearing two
                    labels, and with six old leads on the page the chips were
                    six identical red rectangles carrying nothing. The colour
                    is the urgency and the number is the information. */}
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium tabular-nums",
                    isAnswered ? "bg-white/[0.06] text-ink-3" : age.className,
                  )}
                >
                  {isAnswered ? "Answered" : `${age.label} · ${compactAge(lead.created_at)}`}
                </span>
              </div>

              {/* The number keeps its width and the address gives, rather
                  than the pair wrapping onto two lines because the address is
                  nine pixels too long for a 390px phone. A number is short,
                  fixed and the thing you act on; an address ends in a domain
                  you can lose the tail of and still recognise. */}
              <div className="mt-2.5 flex items-center gap-x-3 text-xs">
                {/* A number that will not dial is shown in the muted ink, so
                    the line agrees with the buttons under it about whether
                    this person can be called. */}
                {reach.phone && (
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5",
                      reach.callable ? "text-ink-2" : "text-ink-3",
                    )}
                  >
                    <Phone
                      className={cn(
                        "h-3 w-3 shrink-0",
                        reach.callable ? "text-signal-ink" : "text-ink-3",
                      )}
                    />
                    <span className="tabular-nums">{formatPhone(reach.phone)}</span>
                  </span>
                )}
                {reach.email && (
                  <span
                    className="inline-flex min-w-0 flex-1 items-center gap-1.5 text-ink-2"
                    title={reach.email}
                  >
                    <Mail className="h-3 w-3 shrink-0 text-signal-ink" />
                    <span className="truncate">{reach.email}</span>
                  </span>
                )}
                {/* Only ever shown when one of the two above is absent, so
                    the row never has to hold all three at once. */}
                {reach.gap && (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      reach.gap.className,
                    )}
                  >
                    {reach.gap.label}
                  </span>
                )}
              </div>

              {lead.message?.trim() && (
                <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-2">
                  {lead.message}
                </p>
              )}

              <div className="mt-3.5">
                <LeadActions
                  submission={lead}
                  onStatusChange={(id, status) => setAnsweredState(id, status === "contacted")}
                />
              </div>

              {/* Follow up, Booked and Not a real lead used to be two stacked
                  rows on top of a wrapped block of contact buttons, which is
                  how one card reached 373px on a phone. They are one row. */}
              <div className="-mx-2 mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-line pt-2.5 text-xs">
                <FollowUp
                  id={lead.id}
                  followUpAt={lead.follow_up_at}
                  isDue={lead.follow_up_due}
                  onChange={(iso) => {
                    // Clearing a due reminder is what takes the card off the
                    // list, so drop it rather than leaving a stale row.
                    if (isDueFollowUp && iso === null) drop(lead.id);
                  }}
                />
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
                  Not a lead
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
