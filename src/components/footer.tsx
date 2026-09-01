import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/icons";
import { BUSINESS } from "@/lib/data";

const footerLinks = [
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "About", href: "/team" },
  { name: "Contact", href: "/contact" },
];

const socialLinks = [
  { name: "Facebook", href: BUSINESS.socials.facebook, icon: FacebookIcon },
  { name: "Instagram", href: BUSINESS.socials.instagram, icon: InstagramIcon },
];

export function Footer() {
  return (
    <footer className="relative overflow-x-clip">

      {/* ── Main Footer Content ── */}
      <div className="shell border-t border-line pt-14 pb-6 sm:pt-20 sm:pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1fr_1fr] lg:gap-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-3">
            <Link href="/" className="inline-block">
              <Image
                src="/images/pg-logo.png"
                alt="PG Creatives"
                width={96}
                height={80}
                className="h-16 sm:h-20 w-auto object-contain opacity-90 transition-opacity duration-300 hover:opacity-100"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-ink-2">
              Professional-grade videography, photography, drone aerial, and 3D
              tours. Serving Green Bay, Madison, Milwaukee, and the Fox Valley.
            </p>
            {/* Social icons */}
            <div className="flex gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-white/45 transition-colors duration-200 hover:border-line-strong hover:text-signal"
                >
                  <social.icon className="h-4 w-4" />
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="meta">
              Navigation
            </h3>
            <ul className="mt-5 space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block py-1 text-sm text-ink-2 transition-colors duration-200 hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="meta">
              Get in Touch
            </h3>
            <ul className="mt-5 space-y-4">
              {Object.values(BUSINESS.phones).map((phone) => (
                <li key={phone.label}>
                  <a
                    href={phone.href}
                    className="group flex items-center gap-3 text-sm text-ink-2 transition-colors duration-200 hover:text-white"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface transition-colors group-hover:bg-white/[0.08]">
                      <Phone className="h-3.5 w-3.5 text-white/45 transition-colors group-hover:text-signal" />
                    </div>
                    <div>
                      <span className="meta">{phone.label}</span>
                      <span className="block">{phone.number}</span>
                    </div>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="group flex items-center gap-3 text-sm text-ink-2 transition-colors duration-200 hover:text-white"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface transition-colors group-hover:bg-white/[0.08]">
                    <Mail className="h-3.5 w-3.5 text-white/45 transition-colors group-hover:text-signal" />
                  </div>
                  <span className="break-all">{BUSINESS.email}</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3 text-sm text-ink-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface">
                    <MapPin className="h-3.5 w-3.5 text-white/45" />
                  </div>
                  {BUSINESS.locationText}
                </div>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="meta">
              Client portals
            </h3>
            <div className="mt-5 space-y-2.5">
              {Object.values(BUSINESS.portals).map((portal) => (
                <a
                  key={portal.label}
                  href={portal.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="surface surface-interactive flex items-center justify-between !rounded-xl px-4 py-3 text-sm text-ink-2 hover:text-white"
                >
                  <span>{portal.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-white/30" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-12 sm:mt-16 border-t border-line pt-6 sm:pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-center text-xs text-white/45 sm:text-left">
              &copy; {new Date().getFullYear()} {BUSINESS.legalName}. All rights reserved.
              <span className="mx-2 text-white/20" aria-hidden="true">|</span>
              <span className="whitespace-nowrap">
                Made by{" "}
                <a
                  href={BUSINESS.madeBy.href}
                  target="_blank"
                  rel="noopener"
                  className="inline-block py-2 text-white/60 underline-offset-4 transition-colors hover:text-signal hover:underline"
                >
                  {BUSINESS.madeBy.name}
                </a>
              </span>
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="py-2 text-xs text-white/45 tracking-wide hover:text-white/60 transition-colors">
                Privacy Policy
              </Link>
              <span className="h-3 w-px bg-white/10" />
              <Link
                href="/admin"
                rel="nofollow"
                // /admin redirects to /admin/login, so Next's viewport
                // prefetch aborts every time — one doomed RSC request per
                // page load, on every public page, warming nothing.
                prefetch={false}
                className="py-2 text-xs text-white/45 tracking-wide transition-colors hover:text-white/60"
              >
                Admin
              </Link>
              <span className="hidden h-3 w-px bg-white/10 sm:block" />
              <span className="hidden text-xs text-white/45 sm:block">
                Wisconsin
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
