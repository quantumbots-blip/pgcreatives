import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { FacebookIcon, InstagramIcon } from "@/components/icons";

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
    value: "Mon-Sat, Flexible Hours",
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
      <section className="relative overflow-hidden bg-navy py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-navy-light)_0%,_transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              Contact Us
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Let&apos;s Create Something Together
            </h1>
            <p className="mt-4 text-lg text-white/50">
              Ready to elevate your visual content? Get in touch for a free
              consultation and custom quote.
            </p>
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="bg-black py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Form */}
            <div className="border border-white/5 bg-navy/20 p-8 lg:col-span-3 lg:p-10">
              <ContactForm />
            </div>

            {/* Contact Info */}
            <div className="space-y-6 lg:col-span-2">
              <div className="border border-white/5 bg-navy/20 p-6">
                <h3 className="font-semibold text-white">
                  Contact Information
                </h3>
                <ul className="mt-5 space-y-5">
                  {contactInfo.map((item) => {
                    const content = (
                      <div className="flex items-start gap-3 text-sm">
                        <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">
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

              <div className="border border-white/5 bg-navy/20 p-6">
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
                      className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/40 transition-colors hover:border-white/30 hover:text-white"
                    >
                      <social.icon className="h-3.5 w-3.5" />
                      <span className="sr-only">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="border border-white/10 bg-white/5 p-6">
                <h3 className="font-semibold text-white">Free Consultation</h3>
                <p className="mt-2 text-sm text-white/40">
                  Not sure what you need? Call us for a free consultation.
                  We&apos;ll help you figure out the best media package for your
                  goals.
                </p>
                <div className="mt-4 h-px bg-white/10" />
                <a
                  href="tel:+19207770127"
                  className="mt-4 inline-block text-lg font-semibold text-white"
                >
                  (920) 777-0127
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
