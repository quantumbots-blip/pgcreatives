import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { FacebookIcon, InstagramIcon } from "@/components/icons";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with PG Creatives for a free consultation. Serving Green Bay, Madison, and all of Wisconsin.",
};

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "(920) 777-0127",
    href: "tel:+19207770127",
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
      <section className="relative overflow-hidden bg-background py-28">
        {/* Floating decorative orb */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_#8B5CF640_0%,_#6D28D920_40%,_transparent_70%)] blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#8B5CF620_0%,_transparent_55%)]" />
        <div className="absolute left-[8%] bottom-[20%] h-28 w-28 rounded-full border border-dashed border-[#8B5CF6]/10 spin-ring hidden lg:block" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <span className="mb-5 inline-flex items-center rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#C4B5FD]">
              Contact Us
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Let&apos;s Create{" "}
              <span className="text-purple-light">Something Together</span>
            </h1>
            <p className="mt-4 text-lg text-white/50">
              Ready to elevate your visual content? Get in touch for a free
              consultation and custom quote.
            </p>
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="bg-background py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Form */}
            <AnimateOnScroll animation="slide-in-left" className="lg:col-span-3">
              <div className="gradient-border rounded-xl bg-[#0a0a2e] p-6 lg:p-10">
                <ContactForm />
              </div>
            </AnimateOnScroll>

            {/* Contact Info */}
            <AnimateOnScroll animation="slide-in-right" delay={0.15} className="lg:col-span-2">
            <div className="space-y-6">
              <div className="animate-border-glow rounded-xl glass-card p-6">
                <h3 className="font-semibold text-white">
                  Contact Information
                </h3>
                <ul className="mt-5 space-y-5">
                  {contactInfo.map((item) => {
                    const content = (
                      <div className="flex items-start gap-3 text-sm">
                        <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#8B5CF6]/60" />
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#C4B5FD]">
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

              <div className="rounded-xl glass-card p-6">
                <h3 className="font-semibold text-white">Follow Us</h3>
                <p className="mt-1 text-sm text-white/40">
                  See our latest work on social media.
                </p>
                <div className="mt-4 flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#8B5CF6]/20 text-[#8B5CF6]/60 transition-colors hover:border-[#8B5CF6]/50 hover:text-[#C4B5FD]"
                    >
                      <social.icon className="h-3.5 w-3.5" />
                      <span className="sr-only">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="gradient-border rounded-xl bg-[#0f0f3d] p-6">
                <h3 className="font-semibold text-white">Free Consultation</h3>
                <p className="mt-2 text-sm text-white/40">
                  Not sure what you need? Call us for a free consultation.
                  We&apos;ll help you figure out the best media package for your
                  goals.
                </p>
                <div className="mt-4 h-px bg-[#8B5CF6]/15" />
                <a
                  href="tel:+19207770127"
                  className="glow-hover mt-4 inline-block text-lg font-semibold text-white transition-colors hover:text-[#C4B5FD]"
                >
                  (920) 777-0127
                </a>
              </div>
            </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </>
  );
}
