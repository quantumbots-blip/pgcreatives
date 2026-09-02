import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { CalendarDays, Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { DisplayLines } from "@/components/display-lines";
import { BUSINESS } from "@/lib/data";

export const revalidate = 86400;

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Contact | Get a Free Quote",
    description:
      "Contact PG Creatives for a free consultation and custom quote. Professional media services across Green Bay, Madison, Milwaukee and the Fox Valley, Wisconsin.",
    path: "/contact",
    image: "/og-contact.jpg",
    imageAlt: "Contact PG Creatives for a free quote",
  }),
  keywords: [
    "contact PG Creatives",
    "free quote",
    "Green Bay photographer",
    "Madison videographer",
    "Milwaukee real estate photographer",
    "Wisconsin media booking",
  ],
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
      <section className="section-tight">
        <div className="shell">
          <AnimateOnScroll animation="lines">
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
              <DisplayLines
                as="h1"
                className="display-1 text-white"
                lines={["Let\u2019s make", "something together."]}
              />
              <p className="lede lg:pb-3">
                Tell us about the project and we&apos;ll come back with a quote and
                a recommendation, usually the same day.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="grid gap-4 lg:grid-cols-5">
            <AnimateOnScroll animation="depth-left" className="lg:col-span-3">
              <div className="surface surface-raised h-full p-6 sm:p-8 lg:p-10">
                <ContactForm />
              </div>
            </AnimateOnScroll>

            {/* The details, as a ruled list rather than a card of cards. This
                column used to repeat every phone number, the email, and the
                service area — all of which the footer renders again about
                200px further down the same screen. Availability and the
                response promise are the only things here the footer does not
                already say, so they are what this column leads with. */}
            <AnimateOnScroll animation="depth-right" delay={0.12} className="lg:col-span-2">
              <div className="surface h-full p-6 sm:p-8">
                <p className="meta">Reach us directly</p>
                <ul className="mt-6 space-y-1">
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
                      <li key={item.label} className="py-3.5">
                        {item.href ? (
                          <a
                            href={item.href}
                            className="flex min-h-11 items-center rounded-md transition-colors hover:[&_p:last-child]:text-white"
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
