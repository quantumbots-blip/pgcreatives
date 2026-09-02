import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { DisplayLines } from "@/components/display-lines";
import { Tilt } from "@/components/tilt";

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
   said "Services" and led to a page about one monthly program, the two other
   things this company actually sells had no page at all. */
const services = [
  {
    id: "real-estate",
    label: "Service 01",
    title: "Real estate",
    lede:
      "Everything a listing needs to go live looking its best. Shot, edited, and delivered fast enough to matter.",
    image: "/images/aerial-lakefront.jpg",
    imageAlt: "Lakefront homes and piers photographed from the air",
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
      "Media for businesses outside real estate. Interiors, facilities, brand film, and the stills that go with them.",
    image: "/images/twilight-wooded-exterior.jpg",
    imageAlt: "Robotic surgical suite photographed for a Wisconsin clinic",
    includes: [
      "Interior and architectural stills",
      "Facility and equipment photography",
      "Brand and campaign film",
      "Drone and aerial coverage",
      "Social cutdowns from every shoot",
      "Custom scopes on request",
    ],
    cta: { href: "/contact", label: "Tell us about the project" },
    note: "Quoted to scope. Tell us what you need and we\u2019ll say what it takes.",
  },
  {
    id: "personal-brand",
    label: "Service 03",
    title: "Personal brand",
    lede:
      "A monthly program that keeps you visible in your market between listings. Strategy, filming, editing, coaching.",
    image: "/images/dark-home-office.jpg",
    imageAlt: "Real estate agent being filmed for a personal-brand video on location",
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
      <section className="section-tight">
        <div className="shell">
          <AnimateOnScroll animation="lines" className="mt-12 grid gap-9 lg:mt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
            <DisplayLines
              as="h1"
              className="display-1 text-white"
              lines={["Three things,", "done right."]}
            />
            <p className="lede lg:pb-3">
              Listing media that sells the house, commercial work for everyone
              else, and a monthly program for the agents who want to be known.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {services.map((service, i) => (
        <section key={service.id} id={service.id} className="section scroll-mt-20">
          <div className="shell">

            <div
              className={`mt-14 grid gap-12 lg:mt-10 lg:grid-cols-2 lg:items-center lg:gap-16 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <AnimateOnScroll animation={i % 2 === 1 ? "depth-right" : "depth-left"}>
                <div>
                  <DisplayLines
                    className="display-2 text-white"
                    lines={[service.title]}
                  />
                  <p className="lede mt-6 max-w-md">{service.lede}</p>

                  <ul className="mt-9 grid gap-x-8 gap-y-1 sm:grid-cols-2">
                    {service.includes.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 py-2 text-sm text-ink-2"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal-ink" />
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

              <AnimateOnScroll animation="depth" delay={0.1} className="scene">
                <Tilt max={6} lift={20}>
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
                </Tilt>
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
                <DisplayLines
                  className="display-2 max-w-lg text-white"
                  lines={["Not sure which", "one you need?"]}
                />
                <p className="lede mt-5 max-w-md">
                  Send us the property or the brief. We&apos;ll tell you what we
                  would shoot and what it costs, usually the same day.
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
