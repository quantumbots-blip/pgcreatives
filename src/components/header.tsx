"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

const navigation = [
  { name: "About", href: "/team" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Contact", href: "/contact" },
];

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
          <span className="text-lg font-light tracking-[0.2em] uppercase text-white">
            pg<span className="font-semibold bg-gradient-to-r from-purple to-purple-light bg-clip-text text-transparent">creatives</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
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
          ))}
          <Link
            href="/contact"
            className="bg-white px-5 py-2 text-sm font-semibold text-[#1a1054] rounded-lg tracking-wide transition-all hover:bg-white/90 hover:scale-[1.02]"
          >
            Book Now
          </Link>
        </nav>

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
          <SheetContent side="right" className="w-72 bg-[#0f0f3d] border-purple/10">
            <nav className="mt-8 flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
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
              ))}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mx-4 mt-4 bg-white px-5 py-3 text-center text-sm font-semibold text-[#1a1054] rounded-lg tracking-wide"
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
