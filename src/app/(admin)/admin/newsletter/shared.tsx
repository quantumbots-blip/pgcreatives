import type { CampaignStatus, SubscriberStatus } from "@/lib/newsletter/db";
import { cn } from "@/lib/utils";

/**
 * Chips and formatters used by both the server pages and the client
 * components. Nothing here touches a request or the database, so a client
 * component can import it.
 */

const CAMPAIGN_CHIP: Record<CampaignStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-white/[0.06] text-ink-2" },
  sending: { label: "Sending", className: "bg-[rgba(43,111,184,0.16)] text-signal-ink" },
  paused: { label: "Paused", className: "bg-amber-500/12 text-amber-300" },
  sent: { label: "Sent", className: "bg-emerald-500/12 text-emerald-300" },
};

export function CampaignChip({ status }: { status: CampaignStatus }) {
  const c = CAMPAIGN_CHIP[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium", c.className)}>
      {c.label}
    </span>
  );
}

export const SUBSCRIBER_CHIP: Record<SubscriberStatus, { label: string; className: string }> = {
  subscribed: { label: "On the list", className: "bg-emerald-500/12 text-emerald-300" },
  unsubscribed: { label: "Unsubscribed", className: "bg-white/[0.06] text-ink-2" },
  bounced: { label: "Bounced", className: "bg-amber-500/12 text-amber-300" },
  complained: { label: "Marked as spam", className: "bg-red-500/12 text-red-300" },
};

export function SubscriberChip({ status }: { status: SubscriberStatus }) {
  const c = SUBSCRIBER_CHIP[status];
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium", c.className)}>
      {c.label}
    </span>
  );
}

export function shortDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
