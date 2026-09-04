"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Camera,
  Mail,
  MapPin,
  ExternalLink,
  Home,
  Layers,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollProgress } from "@/components/scroll-progress";
import { setBackgroundInert } from "@/lib/inert-background";

type NavLink = { name: string; href: string; children?: never };
type NavDropdown = {
  name: string;
  href: string;
  children: { name: string; href: string; external?: boolean; icon?: React.ElementType }[];
};
type NavItem = NavLink | NavDropdown;

/* The public navigation.

   Rebuilt from what a visitor is actually trying to do. The old version had
   "Branding" pointing at /services (a page about the Content Creator Program),
   no way to reach Contact except through an "About" dropdown, and the staff
   Admin login sitting in a public menu. Now every label names the thing it
   leads to, Services is a real section with children, and Admin lives only in
   the footer where staff already look for it. */
const navigation: NavItem[] = [
  { name: "Work", href: "/portfolio" },
  {
    name: "Services",
    href: "/services",
    children: [
      { name: "Real Estate", href: "/services#real-estate", icon: Home },
      { name: "Commercial", href: "/services#commercial", icon: Camera },
      { name: "Content Creator Program", href: "/services/content-creator-program", icon: Layers },
    ],
  },
  { name: "About", href: "/team" },
  { name: "Contact", href: "/contact" },
];

const clientLogins = [
  {
    name: "Green Bay",
    href: "https://portal.spiro.media/order/pg/northeast-wisconsin",
    icon: MapPin,
  },
  {
    name: "Madison",
    href: "https://portal.spiro.media/order/pg/madison",
    icon: MapPin,
  },
];

/* A top-level item is active for its own route and anything beneath it, so
   /services/content-creator-program lights "Services" rather than nothing, and
   /contact no longer lights "About" — which is what the old
   `children.some(c => pathname === c.href)` check did, because Contact used to
   be a child of About. */
function isSectionActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ---------- Desktop dropdown ---------- */
function DesktopDropdown({
  item,
  pathname,
  open,
  onOpenChange,
}: {
  item: NavDropdown;
  pathname: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const enter = () => {
    if (timeout.current) clearTimeout(timeout.current);
    onOpenChange(true);
  };
  const leave = () => {
    timeout.current = setTimeout(() => onOpenChange(false), 150);
  };

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Send focus back to the trigger. The panel hides with
      // `visibility: hidden`, so focus sitting on a link inside it is
      // destroyed and Tab restarts from the top of the document.
      if (containerRef.current?.contains(document.activeElement)) {
        triggerRef.current?.focus();
      }
      onOpenChange(false);
    };
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, onOpenChange]);

  const isActive = isSectionActive(item.href, pathname);

  return (
    <div ref={containerRef} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        ref={triggerRef}
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
          isActive ? "bg-white/[0.08] text-white" : "text-white/78 hover:text-white hover:bg-white/[0.05]"
        )}
      >
        {item.name}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3 transition-all duration-200",
          open ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-1"
        )}
      >
        <div className="glass glass-panel overflow-hidden rounded-2xl p-1.5 backdrop-blur-2xl backdrop-saturate-150">
          {item.children.map((child) => {
            const Icon = child.icon;
            return child.external ? (
              <a
                key={child.href}
                href={child.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {Icon && <Icon className="h-4 w-4 text-white/35" />}
                <span className="flex-1">{child.name}</span>
                <>
                <ExternalLink className="h-3.5 w-3.5 text-white/45" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </>
              </a>
            ) : (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {Icon && <Icon className="h-4 w-4 text-white/35" />}
                <span>{child.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Hamburger ---------- */
function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative h-5 w-5">
      <span
        className={cn(
          "absolute left-0 h-[1.5px] w-5 rounded-full bg-white transition-all duration-300",
          isOpen ? "top-[9px] rotate-45" : "top-[3px]"
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-[9px] h-[1.5px] w-5 rounded-full bg-white transition-all duration-300",
          isOpen ? "opacity-0 scale-x-0" : "opacity-100"
        )}
      />
      <span
        className={cn(
          "absolute left-0 h-[1.5px] w-5 rounded-full bg-white transition-all duration-300",
          isOpen ? "top-[9px] -rotate-45" : "top-[15px]"
        )}
      />
    </div>
  );
}

const mobileNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Work", href: "/portfolio", icon: Camera },
  { name: "Services", href: "/services", icon: Layers },
  { name: "About", href: "/team", icon: Users },
  { name: "Contact", href: "/contact", icon: Mail },
];

/* ---------- Header ---------- */
export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  /* Escape and a link click both close the menu, and focus has to land
     somewhere sensible either way. Without this, closing threw focus away:
     the menu's contents become `visibility: hidden`, so `document.activeElement`
     fell back to <body> and Tab restarted from the top of the document. */
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      setBackgroundInert(false);
      if (restoreFocus.current) {
        restoreFocus.current = false;
        hamburgerRef.current?.focus();
      }
      return;
    }

    document.body.style.overflow = "hidden";
    setBackgroundInert(true);
    restoreFocus.current = true;

    // Move focus into the menu so the first Tab continues inside it.
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      setBackgroundInert(false);
    };
  }, [mobileOpen]);

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
  }

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !mobileOpen;

  return (
    <>
      <header
        className={cn(
          "header-shell fixed top-0 z-50 w-full",
          transparent ? "header-clear" : "header-scrolled"
        )}
      >
        <ScrollProgress />
        <div className="mx-auto flex h-16 max-w-[80rem] items-center justify-between px-[var(--gutter)] lg:h-20">
          {/* The wordmark, cropped to its artwork. The old file was the 3D
              mark centred in a canvas that was mostly transparent, so at the
              header's size the brand rendered about 33px wide: the smallest
              thing on every page. The wordmark carries the name as well as
              the mark, and at 26px tall it reads. */}
          <Link href="/" className="relative z-50 flex items-center py-2" aria-label="PG Creatives, home">
            <Image
              src="/wordmark.png"
              alt="PG Creatives"
              width={366}
              height={77}
              className="h-[22px] w-auto lg:h-[26px]"
              loading="eager"
            />
          </Link>

          {/* Desktop nav.

              One container, not three. The links used to sit in their own
              pill while "Client login" and the CTA floated loose beside it,
              so the right-hand side read as three unrelated objects. Now the
              whole control set shares a single bar with a divider between
              browsing and acting, and the CTA is a filled pill inset at its
              end — one shape, one edge, one idea. */}
          {/* From lg, not md: at 768 the capsule was nearly the full viewport
              and crowded the wordmark. Tablets take the menu instead. */}
          <nav className="hidden items-center lg:flex">
            <div className="glass flex items-center gap-0.5 rounded-full p-1 pl-2 backdrop-blur-xl backdrop-saturate-150 lg:backdrop-blur-2xl">
              {navigation.map((item) =>
                item.children ? (
                  <DesktopDropdown
                    key={item.name}
                    item={item}
                    pathname={pathname}
                    open={openMenu === item.name}
                    onOpenChange={(next) =>
                      setOpenMenu((prev) => {
                        if (next) return item.name;
                        return prev === item.name ? null : prev;
                      })
                    }
                  />
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "nav-link rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                      isSectionActive(item.href, pathname)
                        ? "nav-link-active text-white"
                        : "text-white/78 hover:text-white"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              )}

              <span className="mx-1.5 h-5 w-px bg-line" aria-hidden="true" />

              <ClientLoginMenu
                open={openMenu === "login"}
                onOpenChange={(next) =>
                  setOpenMenu((prev) => (next ? "login" : prev === "login" ? null : prev))
                }
              />

              <Link href="/#book" className="btn btn-primary ml-1 !px-5 !py-2 !text-sm">
                Book a shoot
              </Link>
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button
            ref={hamburgerRef}
            onClick={() => setMobileOpen((v) => !v)}
            className="glass relative z-50 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-xl backdrop-saturate-150 lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <HamburgerIcon isOpen={mobileOpen} />
          </button>
        </div>
      </header>

      {/* ========== MOBILE MENU ========== */}
      <div
        id="mobile-menu"
        ref={menuRef}
        aria-hidden={!mobileOpen}
        className={cn(
          // Fully opaque, per the fix on main (#22): at 97% the page still
          // showed faintly through the strip above the menu. Opaque also means
          // the backdrop-blur behind it was doing nothing but costing a
          // full-viewport filter on every frame, so it is gone. The ground
          // colour rather than pure black, to match the rest of the site.
          "fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-ground transition-all duration-400 lg:hidden",
          mobileOpen
            ? "visible opacity-100 pointer-events-auto"
            : "invisible opacity-0 pointer-events-none"
        )}
      >
        {/* Tapping anywhere dismisses the menu. The handler lives here, not on
            the backdrop: the backdrop is a sibling covered by this full-height
            wrapper, so a pointer event never reached it and the dismiss was
            dead code. No stopPropagation on the children — every link and
            button in here already closes the menu itself, so letting the click
            bubble costs nothing and means the empty space works too. */}
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            // min-h-full, not h-full: on a 568px-tall iPhone SE this column is
            // ~700px of content, and h-full clamped it to the viewport with
            // overflow visible — so "Book a shoot" sat 94px below the fold with
            // body scroll locked and no way to reach it.
            "relative flex min-h-full flex-col px-[var(--gutter)] pb-8 pt-20 transition-transform duration-400 sm:pt-24",
            mobileOpen ? "translate-y-0" : "-translate-y-6"
          )}
        >
          <nav className="flex-1">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const active = isSectionActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-4 border-b border-line py-4 transition-colors",
                    active ? "text-white" : "text-white/55 active:text-white"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-signal-ink" : "text-white/30")} />
                  <span className="display-3 !text-2xl">{item.name}</span>
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-signal" />}
                </Link>
              );
            })}

            <p className="meta pb-3 pt-8">Client login</p>
            {clientLogins.map((portal) => (
              <a
                key={portal.href}
                href={portal.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-4 border-b border-line py-3.5 text-white/60 transition-colors active:text-white"
              >
                <portal.icon className="h-4 w-4 text-white/30" />
                <span className="flex-1 text-base">{portal.name}</span>
                <>
                <ExternalLink className="h-3.5 w-3.5 text-white/45" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </>
              </a>
            ))}
          </nav>

          <div className="pt-6">
            <Link
              href="/#book"
              onClick={() => setMobileOpen(false)}
              className="btn btn-primary w-full !py-4 !text-base"
            >
              Book a shoot
            </Link>
            {/* Balanced, so it does not break as three markets and a widowed
                "Valley" on the second line. */}
            <p className="meta mt-4 text-balance text-center leading-relaxed">
              Green Bay · Madison · Milwaukee · Fox Valley
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Client login ---------- */
function ClientLoginMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (containerRef.current?.contains(document.activeElement)) {
        triggerRef.current?.focus();
      }
      onOpenChange(false);
    };
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, onOpenChange]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => {
        if (timeout.current) clearTimeout(timeout.current);
        onOpenChange(true);
      }}
      onMouseLeave={() => {
        timeout.current = setTimeout(() => onOpenChange(false), 150);
      }}
    >
      <button
        ref={triggerRef}
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white/78 transition-colors hover:text-white"
      >
        Client login
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div
        className={cn(
          "absolute right-0 top-full z-50 w-56 pt-3 transition-all duration-200",
          open ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-1"
        )}
      >
        <div className="glass glass-panel overflow-hidden rounded-2xl p-1.5 backdrop-blur-2xl backdrop-saturate-150">
          {clientLogins.map((portal) => (
            <a
              key={portal.href}
              href={portal.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <portal.icon className="h-4 w-4 text-white/35" />
              <span className="flex-1">{portal.name}</span>
              <>
                <ExternalLink className="h-3.5 w-3.5 text-white/45" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
