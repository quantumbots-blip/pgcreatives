"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  X,
  Users,
  Camera,
  Mail,
  MapPin,
  Shield,
  ExternalLink,
  Sparkles,
  Home,

} from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = { name: string; href: string; children?: never };
type NavDropdown = {
  name: string;
  href?: never;
  children: { name: string; href: string; external?: boolean; icon?: React.ElementType }[];
};
type NavItem = NavLink | NavDropdown;

const navigation: NavItem[] = [
  { name: "Portfolio", href: "/portfolio" },
  {
    name: "About",
    children: [
      { name: "Meet The Team", href: "/team", icon: Users },
      { name: "Contact", href: "/contact", icon: Mail },
    ],
  },
  { name: "Branding", href: "/services" },
  {
    name: "Login",
    children: [
      {
        name: "Green Bay",
        href: "https://portal.spiro.media/order/pg/northeast-wisconsin",
        external: true,
        icon: MapPin,
      },
      {
        name: "Madison",
        href: "https://portal.spiro.media/order/pg/madison",
        external: true,
        icon: MapPin,
      },
      {
        name: "Admin",
        href: "/admin",
        icon: Shield,
      },
    ],
  },
];

/* ---------- Desktop Dropdown ---------- */
function DesktopDropdown({
  item,
  pathname,
}: {
  item: NavDropdown;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const enter = () => {
    if (timeout.current) clearTimeout(timeout.current);
    setOpen(true);
  };
  const leave = () => {
    timeout.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  const isActive = item.children.some((c) => pathname === c.href);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-medium tracking-wide transition-all duration-200",
          isActive
            ? "text-white bg-purple/15"
            : "text-white/60 hover:text-white hover:bg-white/[0.05]"
        )}
      >
        {item.name}
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={cn(
          "absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 transition-all duration-200 origin-top",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Arrow */}
        <div className="mx-auto mb-[-6px] h-3 w-3 rotate-45 rounded-sm border-l border-t border-purple/20 bg-[#061035]" />
        <div
          role="menu"
          className="rounded-xl border border-purple/15 bg-[#061035]/98 backdrop-blur-xl p-1.5 shadow-2xl shadow-purple/5 min-w-[180px]"
        >
          {item.children.map((child) => {
            const Icon = child.icon;
            const isExternal = child.external;
            const linkClass = cn(
              "flex items-center gap-3 px-3.5 py-2.5 text-sm rounded-lg transition-all duration-150",
              pathname === child.href
                ? "text-white bg-purple/15"
                : "text-white/55 hover:text-white hover:bg-purple/10"
            );

            return isExternal ? (
              <a
                key={child.href}
                href={child.href}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                className={linkClass}
              >
                {Icon && <Icon className="h-3.5 w-3.5 text-purple-light/60" />}
                <span className="flex-1">{child.name}</span>
                <ExternalLink className="h-3 w-3 text-white/25" />
              </a>
            ) : (
              <Link
                key={child.href}
                href={child.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                {Icon && <Icon className="h-3.5 w-3.5 text-purple-light/60" />}
                <span>{child.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Hamburger icon with animation ---------- */
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

/* ---------- Mobile nav item icons ---------- */
const mobileNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Services", href: "/services", icon: Sparkles },
  { name: "Portfolio", href: "/portfolio", icon: Camera },
  { name: "Team", href: "/team", icon: Users },
  { name: "Contact", href: "/contact", icon: Mail },
];

/* ---------- Main Header ---------- */
export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !mobileOpen;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-500",
          transparent
            ? "bg-transparent"
            : "bg-[#000000]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/10"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:h-[72px] lg:px-8">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex items-center">
            <Image
              src="/logo.png"
              alt="PG Creatives"
              width={478}
              height={522}
              className="h-10 w-auto sm:h-12 lg:h-14 object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {/* Nav links in a pill container */}
            <div className="flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5">
              {navigation.map((item) =>
                item.children ? (
                  <DesktopDropdown
                    key={item.name}
                    item={item}
                    pathname={pathname}
                  />
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-[13px] font-medium tracking-wide transition-all duration-200",
                      pathname === item.href
                        ? "bg-purple/15 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>

            {/* CTA */}
            <Link
              href="/contact"
              className="ml-3 rounded-full bg-white px-6 py-2 text-[13px] font-semibold text-[#000000] tracking-wide transition-all duration-200 hover:bg-purple-light hover:text-white hover:shadow-lg hover:shadow-purple/20"
            >
              Book Now
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full transition-colors md:hidden hover:bg-white/[0.06]"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <HamburgerIcon isOpen={mobileOpen} />
          </button>
        </div>
      </header>

      {/* ========== MOBILE FULLSCREEN MENU ========== */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-all duration-500",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#000000]/95 backdrop-blur-2xl"
          onClick={() => setMobileOpen(false)}
        />

        {/* Content */}
        <div
          className={cn(
            "relative flex h-full flex-col pt-24 pb-8 px-6 transition-transform duration-500",
            mobileOpen ? "translate-y-0" : "-translate-y-8"
          )}
        >
          {/* Main nav links */}
          <nav className="flex-1 space-y-1">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200",
                    isActive
                      ? "bg-purple/15 text-white"
                      : "text-white/50 active:bg-white/[0.05]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                      isActive
                        ? "bg-purple/25 text-purple-light"
                        : "bg-white/[0.04] text-white/30"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-lg font-medium tracking-wide">
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-purple-light" />
                  )}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="!my-4 h-px bg-gradient-to-r from-transparent via-purple/20 to-transparent" />

            {/* Portal login links */}
            <p className="px-5 pb-2 pt-2 text-xs font-medium uppercase tracking-[0.2em] text-white/25">
              Client Portal
            </p>
            {[
              {
                name: "Green Bay Portal",
                href: "https://portal.spiro.media/order/pg/northeast-wisconsin",
                icon: MapPin,
              },
              {
                name: "Madison Portal",
                href: "https://portal.spiro.media/order/pg/madison",
                icon: MapPin,
              },
            ].map((portal) => (
              <a
                key={portal.href}
                href={portal.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-4 rounded-2xl px-5 py-3.5 text-white/40 transition-all active:bg-white/[0.05]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                  <portal.icon className="h-4.5 w-4.5 text-white/30" />
                </div>
                <span className="flex-1 text-base tracking-wide">
                  {portal.name}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-white/20" />
              </a>
            ))}
          </nav>

          {/* Bottom CTA */}
          <div className="pt-4">
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white py-4 text-base font-semibold text-[#000000] tracking-wide transition-all active:scale-[0.98]"
            >
              Book a Shoot
            </Link>
            <p className="mt-3 text-center text-xs text-white/20">
              Green Bay · Madison · Fox Valley
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
