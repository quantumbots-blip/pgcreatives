import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { RuleHead } from "@/components/rule-head";

export const revalidate = 3600;

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Services",
    description:
      "Real estate listing media, commercial production, and a monthly personal-brand content program for agents across Green Bay, Madison, Milwaukee and the Fox Valley.",
    path: "/services",
    image: "/og-services.jpg",
    imageAlt: "PG Creatives services",
  }),
  keywords: [
    "real estate photography Wisconsin",
    "listing video",
    "drone photography",
    "3D virtual tours",
    "commercial video production",
    "Green Bay real estate media",
  ],
};

/* Three services, each with its own anchor. This page exists because the nav
   said "Services" and led to a page about one monthly program — the two other
   things this company actually sells had no page at all. */
const services = [
  {
    id: "real-estate",
    label: "Service 01",
    title: "Real estate",
    lede:
      "Everything a listing needs to go live looking its best — shot, edited, and delivered fast enough to matter.",
    image: "/images/marble-kitchen-dining.jpg",
    imageAlt: "Lakefront estate photographed from the air at twilight",
    includes: [
      "Daytime and twilight photography",
      "Premium listing video",
      "Drone photography and aerial video",
      "Matterport or Zillow 3D tours",
      "2D floor plans",
      "Virtual twilights and virtual staging",
    ],
    cta: { href: "/#book", label: "Book a listing shoot" },
    note: "Packages from $550. Same-day quotes.",
  },
  {
    id: "commercial",
    label: "Service 02",
    title: "Commercial",
    lede:
      "Media for businesses of every kind — clinics, restaurants, studios, contractors, and the brands behind them.",
    image: "/images/twilight-wooded-exterior.jpg",
    imageAlt: "Medical imaging suite photographed for a Wisconsin clinic",
    includes: [
      "Brand and campaign films",
      "Interior and architectural stills",
      "Product and detail photography",
      "Drone and aerial coverage",
      "Social cutdowns from every shoot",
      "Event and team coverage",
    ],
    cta: { href: "/contact", label: "Tell us about the project" },
    note: "Every commercial job is quoted to scope.",
  },
  {
    id: "personal-brand",
    label: "Service 03",
    title: "Personal brand",
    lede:
      "A monthly program that keeps you visible in your market between listings. Strategy, filming, editing, coaching.",
    image: "/images/dark-home-office.jpg",
    imageAlt: "Real estate agent filming a personal-brand video on location",
    includes: [
      "Four to six short-form videos a month",
      "Strategy and planning around your market",
      "Scripts written to your voice",
      "On-camera coaching",
      "Creator-style editing",
      "Discount on listing media",
    ],
    cta: { href: "/services/content-creator-program", label: "See the program" },
    note: "Tiers from $1,500 a month.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="section-tight pt-14 sm:pt-20">
        <div className="shell">
          <RuleHead label="Services" link={{ href: "/#book", label: "Book a shoot" }} />
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
            <h1 className="display-1 text-white">
              Three things, done right.
            </h1>
            <p className="lede lg:pb-3">
              Listing media that sells the house, commercial work for everyone
              else, and a monthly program for the agents who want to be known.
            </p>
          </div>
        </div>
      </section>

      {services.map((service, i) => (
        <section key={service.id} id={service.id} className="section scroll-mt-20">
          <div className="shell">
            <AnimateOnScroll animation="rise">
              <RuleHead label={service.label} />
            </AnimateOnScroll>

            <div
              className={`mt-10 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <AnimateOnScroll animation="fade-up">
                <div>
                  <h2 className="display-2 text-white">{service.title}</h2>
                  <p className="lede mt-6 max-w-md">{service.lede}</p>

                  <ul className="mt-9 grid gap-x-8 sm:grid-cols-2">
                    {service.includes.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 border-b border-line py-3.5 text-sm text-ink-2"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-9 flex flex-wrap items-center gap-5">
                    <Link href={service.cta.href} className="btn btn-primary">
                      {service.cta.label}
                      <ArrowRight className="arrow h-4 w-4" />
                    </Link>
                    <p className="text-sm text-ink-3">{service.note}</p>
                  </div>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fade-in-scale" delay={0.1}>
                <div className="viewfinder relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface">
                  <span className="vf-b" aria-hidden="true" />
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1360px) 580px, (min-width: 1024px) 40vw, 100vw"
                  />
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>
      ))}

      <section className="section">
        <div className="shell">
          <AnimateOnScroll animation="rise">
            <div className="surface flex flex-col items-start gap-8 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-16">
              <div>
                <h2 className="display-2 max-w-lg text-white">
                  Not sure which one you need?
                </h2>
                <p className="lede mt-5 max-w-md">
                  Send us the property or the brief. We&apos;ll tell you what we
                  would shoot and what it costs — usually the same day.
                </p>
              </div>
              <Link href="/contact" className="btn btn-primary shrink-0">
                Get a quote
                <ArrowRight className="arrow h-4 w-4" />
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
