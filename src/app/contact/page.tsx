import type { Metadata } from "next";
import { CalendarDays, Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { RuleHead } from "@/components/rule-head";
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

/* Ordered so the column leads with what the footer does NOT already say.
   The footer carries all three numbers, the email, and the service area on
   every page of the site — repeating them at the top of this column made the
   contact page look like it said the same thing twice, 250px apart. Response
   time and availability are the things a visitor actually wants to know here,
   so they come first and the direct lines follow. */
const contactInfo = [
  {
    icon: Clock,
    label: "Response time",
    value: "Usually the same day",
    href: null,
  },
  {
    icon: CalendarDays,
    label: "Shooting",
    value: "Monday to Saturday",
    href: null,
  },
  {
    icon: MapPin,
    label: "Serving",
    value: BUSINESS.locationText,
    href: null,
  },
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
];



export default function ContactPage() {
  return (
    <>
      <section className="section-tight pt-14 sm:pt-20">
        <div className="shell">
          <AnimateOnScroll animation="fade-up">
            <RuleHead label="Contact" link={{ href: "/#book", label: "Or book directly" }} />
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
              <h1 className="display-1 text-white">
                Let&apos;s make something together.
              </h1>
              <p className="lede lg:pb-3">
                Tell us about the project and we&apos;ll come back with a quote and
                a recommendation — usually the same day.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="grid gap-4 lg:grid-cols-5">
            <AnimateOnScroll animation="fade-up" className="lg:col-span-3">
              <div className="surface h-full p-6 sm:p-8 lg:p-10">
                <ContactForm />
              </div>
            </AnimateOnScroll>

            {/* The details, as a ruled list rather than a card of cards. This
                column used to repeat every phone number, the email, and the
                service area — all of which the footer renders again about
                200px further down the same screen. Availability and the
                response promise are the only things here the footer does not
                already say, so they are what this column leads with. */}
            <AnimateOnScroll animation="fade-up" delay={0.12} className="lg:col-span-2">
              <div className="surface h-full p-6 sm:p-8">
                <p className="meta">Reach us directly</p>
                <ul className="mt-6">
                  {contactInfo.map((item) => {
                    const content = (
                      <div className="flex items-start gap-3.5">
                        <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                        <div className="min-w-0">
                          <p className="meta">{item.label}</p>
                          <p className="mt-1.5 break-words text-sm text-ink-2 transition-colors">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );
                    return (
                      <li key={item.label} className="border-b border-line py-4 last:border-b-0">
                        {item.href ? (
                          <a
                            href={item.href}
                            className="block rounded-md transition-colors [&_p:last-child]:hover:text-white"
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
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </>
  );
}
