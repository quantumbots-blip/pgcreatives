"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:h-20">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-light tracking-[0.2em] uppercase text-white">
            pg<span className="font-semibold">creatives</span>
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
                  : "text-white/60 hover:text-white"
              )}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/contact"
            className="border border-white/20 bg-white px-5 py-2 text-sm font-medium text-navy tracking-wide transition-colors hover:bg-white/90"
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
          <SheetContent side="right" className="w-72 bg-navy border-white/10">
            <nav className="mt-8 flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-4 py-3 text-base tracking-wide transition-colors",
                    pathname === item.href
                      ? "text-white bg-white/5"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mx-4 mt-4 border border-white/20 bg-white px-5 py-3 text-center text-sm font-medium text-navy tracking-wide"
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
