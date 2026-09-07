"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Inbox, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

/**
 * The dashboard had no navigation at all, because it was one page. Splitting
 * leads away from analytics is the point: leads are a daily job and traffic is
 * a monthly curiosity, and putting them on one scroll meant the daily job sat
 * underneath the curiosity.
 */

const TABS = [
  { href: "/admin", label: "Leads", icon: Inbox },
  { href: "/admin/traffic", label: "Traffic", icon: BarChart3 },
];

export function AdminNav({ waiting }: { waiting: number }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-center gap-4 sm:gap-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white sm:text-base">PG Creatives</p>
            <p className="hidden text-[11px] text-ink-3 sm:block">Dashboard</p>
          </div>

          <nav className="flex items-center gap-1">
            {TABS.map((tab) => {
              const active =
                tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors sm:text-sm",
                    active
                      ? "bg-[rgba(43,111,184,0.16)] text-signal-ink"
                      : "text-ink-3 hover:bg-white/[0.04] hover:text-ink-2",
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.href === "/admin" && waiting > 0 && (
                    <span className="rounded-full bg-signal px-1.5 text-[11px] font-semibold text-white">
                      {waiting}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <Link
            href="/"
            className="hidden min-h-9 items-center px-2 text-xs text-ink-3 transition-colors hover:text-white sm:inline-flex sm:text-sm"
          >
            View site
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-ink-3 transition-colors hover:border-line-strong hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
