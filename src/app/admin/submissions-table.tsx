"use client";

import { useState } from "react";
import { ChevronDown, Clock, Mail, Phone, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Submission } from "@/lib/db";

export function SubmissionsTable({ submissions }: { submissions: Submission[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (submissions.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-white/30">
        No submissions yet. They&apos;ll appear here when someone fills out the contact form.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header — desktop only */}
      <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white/30">
        <div className="col-span-3">Name</div>
        <div className="col-span-3">Email</div>
        <div className="col-span-3">Service</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-1" />
      </div>

      {submissions.map((sub) => {
        const isExpanded = expandedId === sub.id;
        const date = new Date(sub.created_at);
        const dateStr = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const timeStr = date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        return (
          <div key={sub.id} className="rounded-lg border border-purple/8 bg-purple/[0.02] transition-colors hover:border-purple/15">
            <button
              onClick={() => setExpandedId(isExpanded ? null : sub.id)}
              className="w-full text-left"
            >
              {/* Desktop row */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 items-center px-4 py-4">
                <div className="col-span-3 text-sm font-medium text-white truncate">
                  {sub.first_name} {sub.last_name}
                </div>
                <div className="col-span-3 text-sm text-white/50 truncate">
                  {sub.email}
                </div>
                <div className="col-span-3 text-sm text-white/40 truncate">
                  {sub.service || "Not specified"}
                </div>
                <div className="col-span-2 text-xs text-white/30">
                  {dateStr}
                </div>
                <div className="col-span-1 flex justify-end">
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-white/30 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </div>
              </div>

              {/* Mobile row */}
              <div className="sm:hidden flex items-center justify-between px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    {sub.first_name} {sub.last_name}
                  </p>
                  <p className="mt-0.5 text-xs text-white/40">{sub.service || "General inquiry"} · {dateStr}</p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-white/30 transition-transform shrink-0",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t border-purple/8 px-4 py-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-purple/50 shrink-0" />
                    <a href={`mailto:${sub.email}`} className="text-white/60 hover:text-purple-light transition-colors">
                      {sub.email}
                    </a>
                  </div>
                  {sub.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-purple/50 shrink-0" />
                      <a href={`tel:${sub.phone}`} className="text-white/60 hover:text-purple-light transition-colors">
                        {sub.phone}
                      </a>
                    </div>
                  )}
                  {sub.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-3.5 w-3.5 text-purple/50 shrink-0" />
                      <span className="text-white/60">{sub.company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3.5 w-3.5 text-purple/50 shrink-0" />
                    <span className="text-white/60">{dateStr} at {timeStr}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/30">Message</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/60">
                    {sub.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
