"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Inbox, BarChart3, Mail } from "lucide-react";
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
  { href: "/admin/emails", label: "Emails", icon: Mail },
];

export function AdminNav({ waiting, signedInAs }: { waiting: number; signedInAs?: string | null }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        {/* The brand used to sit in a min-w-0 box next to three tabs and a
            sign out button, and on a 390px phone the flexbox took the space
            it needed out of the only thing that would give: the name
            collapsed to eight pixels, which read as a stray letter P. It
            keeps its width now and the tabs scroll instead, since a tab row
            that scrolls is a normal thing and a shredded logo is not. */}
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-8">
          <div className="shrink-0">
            <p className="text-[13px] font-semibold leading-tight text-white sm:text-base">
              PG Creatives
            </p>
            <p className="hidden truncate text-[11px] text-ink-3 sm:block" title={signedInAs ?? undefined}>
              {signedInAs ?? "Dashboard"}
            </p>
          </div>

          <nav className="-mx-1 flex min-w-0 items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => {
              const active =
                tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-medium transition-colors sm:gap-1.5 sm:px-3 sm:text-sm",
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
