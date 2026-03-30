import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { FacebookIcon, InstagramIcon } from "@/components/icons";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

export const metadata: Metadata = {
  title: "Contact | Get a Free Quote",
  description:
    "Contact PG Creatives for a free consultation and custom quote. Professional media services in Green Bay (920) 777-0127 and Madison (608) 420-6199, Wisconsin.",
  keywords: [
    "contact PG Creatives",
    "free quote",
    "Green Bay photographer",
    "Madison videographer",
    "Wisconsin media booking",
  ],
  openGraph: {
    title: "Contact | PG Creatives",
    description:
      "Get in touch for a free consultation. Serving Green Bay & Madison, WI.",
    images: [{ url: "/og-contact.jpg", width: 1200, height: 630, alt: "Contact PG Creatives - Get a Free Quote" }],
  },
};

const contactInfo = [
  {
    icon: Phone,
    label: "Green Bay",
    value: "(920) 777-0127",
    href: "tel:+19207770127",
  },
  {
    icon: Phone,
    label: "Madison",
    value: "(608) 420-6199",
    href: "tel:+16084206199",
  },
  {
    icon: Mail,
    label: "Email",
    value: "pgcreativeswisconsin@gmail.com",
    href: "mailto:pgcreativeswisconsin@gmail.com",
  },
  {
    icon: MapPin,
    label: "Serving",
    value: "Green Bay & Madison, WI",
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
  {
    name: "Facebook",
    href: "https://www.facebook.com/pgcreativeswi/",
    icon: FacebookIcon,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/pgcreativeswi/",
    icon: InstagramIcon,
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background pt-24 pb-12 sm:pt-28 sm:pb-16">
        {/* Floating decorative orb */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_#4f6ef740_0%,_#3730a320_40%,_transparent_70%)] blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#4f6ef720_0%,_transparent_55%)]" />
        <div className="absolute left-[8%] bottom-[20%] h-28 w-28 rounded-full border border-dashed border-[#4f6ef7]/10 spin-ring hidden lg:block" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <span className="mb-5 inline-flex items-center justify-center rounded-full border border-[#4f6ef7]/25 bg-[#4f6ef7]/10 px-3 h-7 sm:px-4 sm:h-8 text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#a5b4fc] leading-none">
              Contact Us
            </span>
            <h1 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-white md:text-5xl">
              Let&apos;s Create{" "}
              <span className="text-purple-light">Something Together</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/60">
              Ready to elevate your visual content? Get in touch for a free
              consultation and custom quote.
            </p>
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="bg-background py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-5">
            {/* Form */}
            <AnimateOnScroll animation="slide-in-left" className="lg:col-span-3">
              <div className="gradient-border rounded-xl bg-[#0a0a0a] p-6 lg:p-10 transition-shadow duration-500 hover:shadow-[0_8px_32px_rgba(79,110,247,0.12),inset_0_0_60px_rgba(79,110,247,0.03)]">
                <ContactForm />
              </div>
            </AnimateOnScroll>

            {/* Contact Info */}
            <AnimateOnScroll animation="slide-in-right" delay={0.15} className="lg:col-span-2">
            <div className="space-y-6">
              <div className="animate-border-glow rounded-xl glass-card p-6 transition-shadow duration-500 hover:shadow-[0_8px_32px_rgba(79,110,247,0.12),inset_0_0_60px_rgba(79,110,247,0.03)]">
                <h3 className="font-semibold text-white">
                  Contact Information
                </h3>
                <ul className="mt-5 space-y-5">
                  {contactInfo.map((item) => {
                    const content = (
                      <div className="flex items-start gap-3 text-sm">
                        <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#4f6ef7]/60" />
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#a5b4fc]">
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-white/60">{item.value}</p>
                        </div>
                      </div>
                    );
                    return (
                      <li key={item.label}>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="transition-colors hover:text-white [&_p:last-child]:hover:text-white"
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

              <div className="rounded-xl glass-card p-6 transition-shadow duration-500 hover:shadow-[0_8px_32px_rgba(79,110,247,0.12),inset_0_0_60px_rgba(79,110,247,0.03)]">
                <h3 className="font-semibold text-white">Follow Us</h3>
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
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#4f6ef7]/20 text-[#4f6ef7]/60 transition-colors hover:border-[#4f6ef7]/50 hover:text-[#a5b4fc]"
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
