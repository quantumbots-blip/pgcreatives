import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/icons";

const footerLinks = [
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "About", href: "/team" },
  { name: "Contact", href: "/contact" },
];

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/p/PG-Creatives-Wisconsin-61556298299463/",
    icon: FacebookIcon,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/pgcreativeswi/",
    icon: InstagramIcon,
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-black">
      {/* Subtle background gradient accents */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-full max-w-7xl -translate-x-1/2 bg-gradient-to-r from-transparent via-purple/30 to-transparent" />
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-purple/[0.04] blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-purple/[0.03] blur-[120px]" />

      {/* ── CTA Banner ── */}
      <div className="mx-auto max-w-7xl px-5 sm:px-6 pt-10 sm:pt-16">
        <div className="relative rounded-2xl border border-purple/20 bg-gradient-to-br from-purple/[0.06] via-black to-purple-light/[0.03] p-6 sm:p-8 overflow-hidden transition-all duration-300 hover:border-purple/40 hover:shadow-[0_0_40px_rgba(79,110,247,0.2)]">

          <div className="relative flex flex-col items-start gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-lg">
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Ready to Elevate
                <br />
                <span className="text-white">Your Visual Story?</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
                Let&apos;s create professional-grade media that makes a lasting
                impression.
              </p>
            </div>
            <Link
              href="/#portals"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] shrink-0"
            >
              Start a Project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Footer Content ── */}
      <div className="mx-auto max-w-7xl px-5 sm:px-6 pt-12 pb-6 sm:pt-20 sm:pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1fr_1fr] lg:gap-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-3">
            <Link href="/" className="-ml-2.5 inline-block">
              <Image
                src="/logo.png"
                alt="PG Creatives"
                width={478}
                height={522}
                className="h-14 sm:h-16 w-auto object-contain"
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
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/40 transition-all duration-200 hover:border-purple/30 hover:bg-purple/10 hover:text-purple-light hover:scale-105"
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
              <li>
                <a
                  href="tel:+19207770127"
                  className="group flex items-center gap-3 text-sm text-white/60 transition-colors duration-200 hover:text-white"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] transition-colors group-hover:bg-purple/15">
                    <Phone className="h-3.5 w-3.5 text-purple/50 transition-colors group-hover:text-purple-light" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Green Bay</span>
                    <span className="block">(920) 777-0127</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="tel:+16084206199"
                  className="group flex items-center gap-3 text-sm text-white/60 transition-colors duration-200 hover:text-white"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] transition-colors group-hover:bg-purple/15">
                    <Phone className="h-3.5 w-3.5 text-purple/50 transition-colors group-hover:text-purple-light" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Madison</span>
                    <span className="block">(608) 420-6199</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="mailto:pgcreativeswisconsin@gmail.com"
                  className="group flex items-center gap-3 text-sm text-white/60 transition-colors duration-200 hover:text-white"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] transition-colors group-hover:bg-purple/15">
                    <Mail className="h-3.5 w-3.5 text-purple/50 transition-colors group-hover:text-purple-light" />
                  </div>
                  <span className="break-all">pgcreativeswisconsin@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
                    <MapPin className="h-3.5 w-3.5 text-purple/50" />
                  </div>
                  Green Bay, Madison & Fox Valley, WI
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
              <a
                href="https://portal.spiro.media/order/pg/northeast-wisconsin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/60 transition-all duration-500 hover:border-purple/20 hover:bg-purple/[0.06] hover:text-white hover:shadow-[0_0_30px_rgba(79,110,247,0.15)]"
              >
                <span>Green Bay Portal</span>
                <ArrowRight className="h-3.5 w-3.5 text-white/20" />
              </a>
              <a
                href="https://portal.spiro.media/order/pg/madison"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/60 transition-all duration-500 hover:border-purple/20 hover:bg-purple/[0.06] hover:text-white hover:shadow-[0_0_30px_rgba(79,110,247,0.15)]"
              >
                <span>Madison Portal</span>
                <ArrowRight className="h-3.5 w-3.5 text-white/20" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-12 sm:mt-16 border-t border-white/[0.06] pt-6 sm:pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-white/40">
              &copy; {new Date().getFullYear()} MCINTEE LLC. All rights reserved.
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
