import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/icons";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
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
    <footer className="relative overflow-hidden bg-black">
      {/* Subtle background gradient accents */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-full max-w-7xl -translate-x-1/2 bg-gradient-to-r from-transparent via-purple/30 to-transparent" />
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-purple/[0.04] blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-purple/[0.03] blur-[120px]" />

      {/* ── Main Footer Content ── */}
      <div className="mx-auto max-w-7xl px-5 sm:px-6 pt-12 pb-6 sm:pt-20 sm:pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1fr_1fr] lg:gap-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-3">
            <Link href="/" className="inline-block">
              <Image
                src="/images/pg-logo.png"
                alt="PG Creatives"
                width={280}
                height={80}
                className="h-16 sm:h-20 w-auto object-contain opacity-90 transition-opacity duration-300 hover:opacity-100"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
              Professional-grade videography, photography, drone aerial, and 3D
              tours. Serving Green Bay, Madison, and the Fox Valley.
            </p>
            {/* Social icons */}
            <div className="flex gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/40 transition-all duration-200 hover:border-purple/30 hover:bg-purple/10 hover:text-purple-light hover:scale-105"
                >
                  <social.icon className="h-4 w-4" />
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Navigation
            </h3>
            <ul className="mt-5 space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Get in Touch
            </h3>
            <ul className="mt-5 space-y-4">
              {Object.values(BUSINESS.phones).map((phone) => (
                <li key={phone.label}>
                  <a
                    href={phone.href}
                    className="group flex items-center gap-3 text-sm text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] transition-colors group-hover:bg-purple/15">
                      <Phone className="h-3.5 w-3.5 text-purple/50 transition-colors group-hover:text-purple-light" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">{phone.label}</span>
                      <span className="block">{phone.number}</span>
                    </div>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="group flex items-center gap-3 text-sm text-white/60 transition-colors duration-200 hover:text-white"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] transition-colors group-hover:bg-purple/15">
                    <Mail className="h-3.5 w-3.5 text-purple/50 transition-colors group-hover:text-purple-light" />
                  </div>
                  <span className="break-all">{BUSINESS.email}</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
                    <MapPin className="h-3.5 w-3.5 text-purple/50" />
                  </div>
                  {BUSINESS.locationText}
                </div>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Client Portals
            </h3>
            <div className="mt-5 space-y-2.5">
              {Object.values(BUSINESS.portals).map((portal) => (
                <a
                  key={portal.label}
                  href={portal.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/60 transition-all duration-500 hover:border-purple/20 hover:bg-purple/[0.06] hover:text-white hover:shadow-[0_0_30px_rgba(55,140,210,0.15)]"
                >
                  <span>{portal.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-white/20" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-12 sm:mt-16 border-t border-white/[0.06] pt-6 sm:pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-white/40">
              &copy; {new Date().getFullYear()} {BUSINESS.legalName}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-xs text-white/40 tracking-wide hover:text-white/60 transition-colors">
                Privacy Policy
              </a>
              <span className="hidden h-3 w-px bg-white/10 sm:block" />
              <span className="hidden text-xs text-white/40 sm:block">
                Wisconsin
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
