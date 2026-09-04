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

/* The column headings are h2s: on a page with no h2 of its own (contact,
   the 404) an h3 here skipped a level straight from the h1. */
export function Footer() {
  return (
    <footer className="relative overflow-x-clip">

      {/* ── Main Footer Content ── */}
      <div className="shell pb-6 sm:pb-8">
        {/* The rule lives inside the shell so it lands on the content box.
            On the shell itself it painted across the gutters too, making it
            the only edge-to-edge hairline on the site. */}
        <div className="border-t border-line pt-14 sm:pt-20">
        {/* The contact column is the widest of the three link columns: it
            holds the longest strings on the page, and at `1fr` the email
            broke mid-word as "gmail.c / om". */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_1.3fr_1fr] lg:gap-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-5">
            <Link href="/" className="inline-block" aria-label="PG Creatives, home">
              {/* The wordmark cropped to its artwork. The old file kept it
                  inside a mostly transparent canvas, so it rendered 70px wide. */}
              <Image
                src="/wordmark.png"
                alt="PG Creatives"
                width={366}
                height={77}
                className="h-8 w-auto opacity-90 transition-opacity duration-300 hover:opacity-100 sm:h-9"
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
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-white/45 transition-colors duration-200 hover:border-line-strong hover:text-signal-ink"
                >
                  <social.icon className="h-4 w-4" />
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="meta">
              Navigation
            </h2>
            <ul className="mt-5 space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center py-1 text-sm text-ink-2 transition-colors duration-200 hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="meta">
              Get in Touch
            </h2>
            <ul className="mt-5 space-y-4">
              {Object.values(BUSINESS.phones).map((phone) => (
                <li key={phone.label}>
                  <a
                    href={phone.href}
                    className="group flex min-h-11 items-center gap-3 text-sm text-ink-2 transition-colors duration-200 hover:text-white"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface transition-colors group-hover:bg-white/[0.08]">
                      <Phone className="h-3.5 w-3.5 text-white/45 transition-colors group-hover:text-signal-ink" />
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
                  className="group flex min-h-11 items-center gap-3 text-sm text-ink-2 transition-colors duration-200 hover:text-white"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface transition-colors group-hover:bg-white/[0.08]">
                    <Mail className="h-3.5 w-3.5 text-white/45 transition-colors group-hover:text-signal-ink" />
                  </div>
                  {/* A break opportunity after the @ and `anywhere` as the
                      fallback, so a narrow column splits the address at the
                      one place it still reads as an address. */}
                  <span className="[overflow-wrap:anywhere]">
                    {BUSINESS.email.split("@")[0]}@<wbr />{BUSINESS.email.split("@")[1]}
                  </span>
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
            <h2 className="meta">
              Client portals
            </h2>
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
                  <ArrowRight className="h-3.5 w-3.5 text-white/45" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-12 sm:mt-16 border-t border-line pt-6 sm:pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-center text-xs text-ink-3 sm:text-left">
              &copy; {new Date().getFullYear()} {BUSINESS.legalName}. All rights reserved.
              <span className="mx-2 text-white/20" aria-hidden="true">|</span>
              <span className="whitespace-nowrap">
                Made by{" "}
                <a
                  href={BUSINESS.madeBy.href}
                  target="_blank"
                  rel="noopener"
                  className="inline-block py-2 text-white/60 underline-offset-4 transition-colors hover:text-signal-ink hover:underline"
                >
                  {BUSINESS.madeBy.name}
                </a>
              </span>
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="inline-flex min-h-11 items-center py-2 text-xs tracking-wide text-ink-3 transition-colors hover:text-white/60">
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
                className="inline-flex min-h-11 items-center py-2 text-xs tracking-wide text-ink-3 transition-colors hover:text-white/60"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}
