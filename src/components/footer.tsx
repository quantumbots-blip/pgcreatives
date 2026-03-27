import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
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
    <footer className="border-t border-purple/10 bg-secondary">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="PG Creatives"
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed text-white/50">
              Take your brand to the Next Level
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-purple-light"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+19207770127"
                  className="flex items-center gap-2.5 text-sm text-white/50 transition-colors hover:text-purple-light"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-purple/60" />
                  (920) 777-0127
                </a>
              </li>
              <li>
                <a
                  href="mailto:pgcreativeswisconsin@gmail.com"
                  className="flex items-center gap-2.5 text-sm text-white/50 transition-colors hover:text-purple-light"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-purple/60" />
                  pgcreativeswisconsin@gmail.com
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2.5 text-sm text-white/50">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-purple/60" />
                  Green Bay & Madison, WI
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
              Follow Us
            </h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple/15 text-white/40 transition-all hover:border-purple/40 hover:text-purple-light hover:bg-purple/10"
                >
                  <social.icon className="h-3.5 w-3.5" />
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-purple/10 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} MCINTEE LLC. All rights reserved.
          </p>
          <p className="text-xs text-white/30 tracking-wide">
            PG Creatives Media
          </p>
        </div>
      </div>
    </footer>
  );
}
