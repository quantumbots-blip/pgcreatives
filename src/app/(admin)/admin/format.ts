import type { SubmissionStatus } from "@/lib/db";

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function hoursSince(dateStr: string): number {
  return (Date.now() - new Date(dateStr).getTime()) / 3_600_000;
}

export function fullDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} at ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

export type StatusConfig = {
  value: SubmissionStatus;
  label: string;
  /* Text and border are kept apart on purpose. The accent reads at 3.86:1 as
     text and fails, so anything carrying words uses the lighter ink value. */
  text: string;
  bg: string;
  border: string;
};

export const STATUS_OPTIONS: StatusConfig[] = [
  {
    value: "new",
    label: "New",
    text: "text-signal-ink",
    bg: "bg-[rgba(43,111,184,0.16)]",
    border: "border-[rgba(43,111,184,0.45)]",
  },
  {
    value: "contacted",
    label: "Contacted",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  {
    value: "booked",
    label: "Booked",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  {
    value: "archived",
    label: "Archived",
    text: "text-ink-3",
    bg: "bg-white/[0.06]",
    border: "border-line",
  },
];

export function statusConfig(status: SubmissionStatus): StatusConfig {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
}

/** What the lead actually asked for, for display. */
export function serviceLabel(service: string | null): string {
  return service && service.trim() ? service : "General inquiry";
}
