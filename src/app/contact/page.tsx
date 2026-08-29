import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { FacebookIcon, InstagramIcon } from "@/components/icons";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { SectionLabel } from "@/components/section-label";
import { BUSINESS } from "@/lib/data";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Contact | Get a Free Quote",
  description:
    `Contact PG Creatives for a free consultation and custom quote. Professional media services in ${Object.values(BUSINESS.phones).map((p) => `${p.label} ${p.number}`).join(", ")}, Wisconsin.`,
  keywords: [
    "contact PG Creatives",
    "free quote",
    "Green Bay photographer",
    "Madison videographer",
    "Milwaukee real estate photographer",
    "Wisconsin media booking",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | PG Creatives",
    description:
      "Get in touch for a free consultation. Serving Green Bay, Madison & Milwaukee, WI.",
    url: "/contact",
    images: [{ url: "/og-contact.jpg", width: 1200, height: 630, alt: "Contact PG Creatives - Get a Free Quote" }],
  },
};

const contactInfo = [
  ...Object.values(BUSINESS.phones).map((phone) => ({
    icon: Phone,
    label: phone.label,
    value: phone.number,
    href: phone.href,
  })),
  {
    icon: Mail,
    label: "Email",
    value: BUSINESS.email,
    href: `mailto:${BUSINESS.email}`,
  },
  {
    icon: MapPin,
    label: "Serving",
    value: BUSINESS.locationText,
    href: null,
  },
  {
    icon: Clock,
    label: "Availability",
    value: "Mon-Sat",
    href: null,
  },
];

const socialLinks = [
  { name: "Facebook", href: BUSINESS.socials.facebook, icon: FacebookIcon },
  { name: "Instagram", href: BUSINESS.socials.instagram, icon: InstagramIcon },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-12 sm:pt-20 sm:pb-16">
        {/* Floating decorative orb */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(43,111,184,0.25)_0%,_rgba(9,30,72,0.15)_40%,_transparent_70%)] blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(43,111,184,0.14)_0%,_transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
          <AnimateOnScroll animation="fade-up">
          <div className="max-w-2xl">
            <SectionLabel>Contact Us</SectionLabel>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white md:text-5xl">
              Let&apos;s <span className="gradient-text">Create</span>{" "}
              Something Together
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/60">
              Ready to elevate your visual content? Get in touch for a free
              consultation and custom quote.
            </p>
          </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-5">
            {/* Form */}
            <AnimateOnScroll animation="slide-in-left" className="lg:col-span-3">
              <div className="rounded-2xl border border-purple/20 bg-gradient-to-br from-purple/[0.12] via-black to-purple-light/[0.06] p-4 sm:p-6 lg:p-10 transition-all duration-300 hover:border-purple/40 hover:shadow-[0_0_40px_rgba(55,140,210,0.2)]">
                <ContactForm />
              </div>
            </AnimateOnScroll>

            {/* Contact Info */}
            <AnimateOnScroll animation="slide-in-right" delay={0.15} className="lg:col-span-2">
            <div className="space-y-6">
              <div className="rounded-2xl glass-card p-6">
                <h2 className="font-semibold text-white">
                  Contact Information
                </h2>
                <ul className="mt-5 space-y-5">
                  {contactInfo.map((item) => {
                    const content = (
                      <div className="flex items-start gap-3 text-sm">
                        <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-purple/70" />
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-purple-light">
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-white/60 break-all">{item.value}</p>
                        </div>
                      </div>
                    );
                    return (
                      <li key={item.label}>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="block rounded-md py-1 transition-colors hover:text-white [&_p:last-child]:hover:text-white"
                          >
                            {content}
                          </a>
                        ) : (
                          content
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="rounded-2xl glass-card p-6">
                <h2 className="font-semibold text-white">Follow Us</h2>
                <p className="mt-1 text-sm text-white/60">
                  See our latest work on social media.
                </p>
                <div className="mt-4 flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-purple/25 text-purple-light/70 transition-colors hover:border-purple/50 hover:text-purple-light"
                    >
                      <social.icon className="h-3.5 w-3.5" />
                      <span className="sr-only">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>

            </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </>
  );
}
