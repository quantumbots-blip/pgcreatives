"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

type NavLink = { name: string; href: string; children?: never };
type NavDropdown = { name: string; href?: never; children: { name: string; href: string; external?: boolean }[] };
type NavItem = NavLink | NavDropdown;

const navigation: NavItem[] = [
  {
    name: "About",
    children: [
      { name: "Meet The Team", href: "/team" },
      { name: "Portfolio", href: "/portfolio" },
      { name: "Contact", href: "/contact" },
    ],
  },
  { name: "Branding", href: "/services" },
  { name: "Listing Packages", href: "/services" },
  {
    name: "Login",
    children: [
      {
        name: "Green Bay",
        href: "https://portal.spiro.media/order/pg/northeast-wisconsin",
        external: true,
      },
      {
        name: "Madison",
        href: "https://portal.spiro.media/order/pg/madison",
        external: true,
      },
    ],
  },
];

function DesktopDropdown({ item, pathname }: { item: NavDropdown; pathname: string }) {
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

  // Close on Escape or outside click
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
    <div ref={containerRef} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "flex items-center gap-1 text-sm tracking-wide transition-colors",
          isActive ? "text-white" : "text-white/60 hover:text-purple-light"
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
      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-lg border border-purple/15 bg-[#0a0a2e]/95 backdrop-blur-md py-2 shadow-xl min-w-[160px]"
        >
          {item.children.map((child) =>
            child.external ? (
              <a
                key={child.href}
                href={child.href}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                className="block px-4 py-2.5 text-sm text-white/60 transition-colors hover:bg-purple/10 hover:text-white"
              >
                {child.name}
              </a>
            ) : (
              <Link
                key={child.href}
                href={child.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-4 py-2.5 text-sm transition-colors hover:bg-purple/10",
                  pathname === child.href
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                )}
              >
                {child.name}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        transparent
          ? "bg-transparent"
          : "bg-[#0f0f3d]/95 backdrop-blur-md border-b border-purple/10"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:h-20">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="PG Creatives"
            width={160}
            height={45}
            className="h-14 w-auto lg:h-16 object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
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
                  "text-sm tracking-wide transition-colors",
                  pathname === item.href
                    ? "text-white"
                    : "text-white/60 hover:text-purple-light"
                )}
              >
                {item.name}
              </Link>
            )
          )}
          <Link
            href="/contact"
            className="bg-gradient-to-r from-purple-dim via-purple to-purple-light px-5 py-2 text-sm font-semibold text-white rounded-lg tracking-wide transition-all hover:brightness-110 hover:scale-[1.02]"
          >
            Book Now
          </Link>
        </nav>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "md:hidden text-white"
            )}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-[#0a0a2e] border-purple/10">
            <nav className="mt-8 flex flex-col gap-1">
              {navigation.map((item) =>
                item.children ? (
                  <div key={item.name}>
                    <p className="px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white/30">
                      {item.name}
                    </p>
                    {item.children.map((child) =>
                      child.external ? (
                        <a
                          key={child.href}
                          href={child.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setOpen(false)}
                          className="px-4 py-3 pl-8 text-base tracking-wide rounded-lg text-white/60 hover:text-purple-light transition-colors block"
                        >
                          {child.name}
                        </a>
                      ) : (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "px-4 py-3 pl-8 text-base tracking-wide rounded-lg transition-colors block",
                            pathname === child.href
                              ? "text-white bg-purple/10"
                              : "text-white/60 hover:text-purple-light"
                          )}
                        >
                          {child.name}
                        </Link>
                      )
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-4 py-3 text-base tracking-wide rounded-lg transition-colors",
                      pathname === item.href
                        ? "text-white bg-purple/10"
                        : "text-white/60 hover:text-purple-light"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              )}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mx-4 mt-4 bg-gradient-to-r from-purple-dim via-purple to-purple-light px-5 py-3 text-center text-sm font-semibold text-white rounded-lg tracking-wide"
              >
                Book Now
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
