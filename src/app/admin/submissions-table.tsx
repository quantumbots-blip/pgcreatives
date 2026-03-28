"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  Clock,
  Mail,
  Phone,
  Building2,
  Search,
  Download,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Submission, SubmissionStatus } from "@/lib/db";
import { updateStatusAction } from "@/app/actions/admin";

const STATUS_OPTIONS: {
  value: SubmissionStatus;
  label: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    value: "new",
    label: "New",
    color: "text-purple-light",
    bg: "bg-purple/15",
    border: "border-purple/30",
  },
  {
    value: "contacted",
    label: "Contacted",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
  },
  {
    value: "booked",
    label: "Booked",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
  },
  {
    value: "archived",
    label: "Archived",
    color: "text-white/40",
    bg: "bg-white/5",
    border: "border-white/10",
  },
];

function getStatusConfig(status: SubmissionStatus) {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function SubmissionsTable({
  submissions,
}: {
  submissions: Submission[];
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">(
    "all"
  );
  const [serviceFilter, setServiceFilter] = useState("all");
  const [localSubmissions, setLocalSubmissions] = useState(submissions);

  const services = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      if (s.service) set.add(s.service);
    });
    return Array.from(set).sort();
  }, [submissions]);

  const filtered = useMemo(() => {
    return localSubmissions.filter((sub) => {
      if (search) {
        const q = search.toLowerCase();
        const match =
          `${sub.first_name} ${sub.last_name}`.toLowerCase().includes(q) ||
          sub.email.toLowerCase().includes(q) ||
          (sub.company && sub.company.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (
        statusFilter !== "all" &&
        (sub.status || "new") !== statusFilter
      )
        return false;
      if (serviceFilter !== "all" && sub.service !== serviceFilter)
        return false;
      return true;
    });
  }, [localSubmissions, search, statusFilter, serviceFilter]);

  const hasActiveFilters =
    search !== "" || statusFilter !== "all" || serviceFilter !== "all";

  async function handleStatusChange(
    id: number,
    newStatus: SubmissionStatus
  ) {
    setLocalSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    await updateStatusAction(id, newStatus);
  }

  function sanitizeCSV(str: string): string {
    // Prevent formula injection — prefix with ' if starts with =, +, -, @, tab, CR
    let safe = str.replace(/"/g, '""');
    if (/^[=+\-@\t\r]/.test(safe)) {
      safe = "'" + safe;
    }
    return `"${safe}"`;
  }

  function exportCSV() {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Company",
      "Service",
      "Status",
      "Message",
      "Date",
    ];
    const rows = filtered.map((s) => [
      sanitizeCSV(`${s.first_name} ${s.last_name}`),
      sanitizeCSV(s.email),
      sanitizeCSV(s.phone || ""),
      sanitizeCSV(s.company || ""),
      sanitizeCSV(s.service || ""),
      sanitizeCSV(s.status || "new"),
      sanitizeCSV(s.message || ""),
      sanitizeCSV(new Date(s.created_at).toLocaleDateString()),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pgcreatives-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setServiceFilter("all");
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, company..."
            className="w-full rounded-lg border border-purple/15 bg-purple/[0.04] py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-purple/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as SubmissionStatus | "all")
            }
            className="rounded-lg border border-purple/15 bg-purple/[0.04] px-3 py-2 text-xs text-white/60 outline-none transition-colors focus:border-purple/30"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Service filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="rounded-lg border border-purple/15 bg-purple/[0.04] px-3 py-2 text-xs text-white/60 outline-none transition-colors focus:border-purple/30"
          >
            <option value="all">All Services</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg border border-purple/15 px-3 py-2 text-xs text-white/40 transition-colors hover:border-purple/30 hover:text-white/60"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}

          {/* Export */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-purple/15 px-3 py-2 text-xs text-white/40 transition-colors hover:border-purple/30 hover:text-white/60"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Results count */}
      {hasActiveFilters && (
        <p className="mb-3 text-xs text-white/30">
          Showing {filtered.length} of {localSubmissions.length} submissions
        </p>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-white/30">
          {localSubmissions.length === 0
            ? "No submissions yet. They'll appear here when someone fills out the contact form."
            : "No submissions match your filters."}
        </p>
      ) : (
        <div className="space-y-2">
          {/* Header — desktop only */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white/30">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Service</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-1" />
          </div>

          {filtered.map((sub) => {
            const isExpanded = expandedId === sub.id;
            const status = (sub.status || "new") as SubmissionStatus;
            const cfg = getStatusConfig(status);
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
            const ago = timeAgo(sub.created_at);

            return (
              <div
                key={sub.id}
                className="rounded-lg border border-purple/8 bg-purple/[0.02] transition-colors hover:border-purple/15"
              >
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : sub.id)
                  }
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
                    <div className="col-span-2 text-sm text-white/40 truncate">
                      {sub.service || "General"}
                    </div>
                    <div
                      className="col-span-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={status}
                        onChange={(e) =>
                          handleStatusChange(
                            sub.id,
                            e.target.value as SubmissionStatus
                          )
                        }
                        className={cn(
                          "cursor-pointer rounded-full px-3 py-1 text-xs font-medium border outline-none transition-colors",
                          cfg.bg,
                          cfg.border,
                          cfg.color
                        )}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-1 text-xs text-white/30">
                      {ago}
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
                  <div className="sm:hidden px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">
                          {sub.first_name} {sub.last_name}
                        </p>
                        <p className="mt-0.5 text-xs text-white/40">
                          {sub.service || "General inquiry"} &middot;{" "}
                          {ago}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                            cfg.bg,
                            cfg.border,
                            cfg.color
                          )}
                        >
                          {cfg.label}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-white/30 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-purple/8 px-4 py-5 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 text-purple/50 shrink-0" />
                        <a
                          href={`mailto:${sub.email}`}
                          className="text-white/60 hover:text-purple-light transition-colors"
                        >
                          {sub.email}
                        </a>
                      </div>
                      {sub.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3.5 w-3.5 text-purple/50 shrink-0" />
                          <a
                            href={`tel:${sub.phone}`}
                            className="text-white/60 hover:text-purple-light transition-colors"
                          >
                            {sub.phone}
                          </a>
                        </div>
                      )}
                      {sub.company && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-3.5 w-3.5 text-purple/50 shrink-0" />
                          <span className="text-white/60">
                            {sub.company}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3.5 w-3.5 text-purple/50 shrink-0" />
                        <span className="text-white/60">
                          {dateStr} at {timeStr}
                        </span>
                      </div>
                    </div>

                    {/* Mobile status change */}
                    <div className="sm:hidden" onClick={(e) => e.stopPropagation()}>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/30">
                        Status
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() =>
                              handleStatusChange(sub.id, opt.value)
                            }
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-medium border transition-all",
                              status === opt.value
                                ? cn(opt.bg, opt.border, opt.color)
                                : "border-white/8 text-white/30 hover:border-white/15 hover:text-white/50"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/30">
                        Message
                      </p>
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
      )}
    </div>
  );
}
