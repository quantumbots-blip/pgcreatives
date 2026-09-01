import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { RuleHead } from "@/components/rule-head";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

// This section used to be a client component driving a scroll-linked 3D fan:
// three cards rotated into place from a scroll listener on desktop. The effect
// never ran on phones or for reduced-motion visitors, but the cost did — every
// package name, price and feature list shipped to every browser as JavaScript
// and had to be hydrated, because the markup was defined inside the client
// component rather than passed into it.
//
// The section is now server-rendered: no JavaScript at all. The cards keep
// their hover treatment, which is CSS.
const services = [
  {
    title: "PG Core",
    description:
      "Daytime photography, premium listing video, drone photography, and 3 virtual twilights.",
    features: ["Daytime Photography", "Premium Listing Video", "Drone Photography", "3 Virtual Twilights"],
    price: "From $550",
    popular: false,
  },
  {
    title: "PG Growth",
    description:
      "Our most popular package — photography, video, 3D tour, 2D floor plan, drone, and virtual twilights.",
    features: ["Daytime Photography", "Premium Listing Video", "Matterport or Zillow 3D Tour", "2D Floor Plan", "Drone Photography", "3 Virtual Twilights"],
    price: "From $725",
    popular: true,
  },
  {
    title: "PG Platinum",
    description:
      "The full premium experience — daytime & twilight photography, day to night video, coming soon video, and drone.",
    features: ["Daytime & Twilight Photography", "Platinum Day to Night Listing Video", "Coming Soon Video", "Drone Photography"],
    price: "From $1,000",
    popular: false,
  },
];

export function ScrollCards3D() {
  return (
    <section className="section">
      <div className="shell">
        <AnimateOnScroll animation="rise">
          <RuleHead label="Packages" link={{ href: "/#book", label: "Book a shoot" }} />
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="display-2 max-w-xl text-white">
              Pick the package, not the à la carte menu.
            </h2>
            <p className="lede max-w-sm">
              Every stage of a project, from a single-property shoot to full
              production. Custom quotes for anything outside them.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="mt-12 grid gap-4 sm:mt-16 lg:grid-cols-3">
          {services.map((service, i) => (
            <AnimateOnScroll
              key={service.title}
              animation="fade-up"
              delay={i * 0.1}
              className="h-full"
            >
              <div
                className={`surface flex h-full flex-col p-7 sm:p-8 ${
                  service.popular
                    ? "!border-signal/40 !bg-[#111823] shadow-[0_0_60px_-20px_rgba(78,168,255,0.45)]"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="display-3 text-white">{service.title}</h3>
                  {service.popular && (
                    <span className="meta meta-signal shrink-0 rounded-full border border-signal/35 px-2.5 py-1.5">
                      Most booked
                    </span>
                  )}
                </div>

                {/* The price. It was already in this file's data and simply
                    never rendered — three tiers with feature lists and no
                    number to anchor any of them against. */}
                <p className="display-2 mt-5 !text-[clamp(1.75rem,2.6vw,2.25rem)] text-white">
                  {service.price}
                </p>

                <p className="mt-4 border-t border-line pt-5 text-sm leading-relaxed text-ink-2">
                  {service.description}
                </p>

                <ul className="mt-6 flex-1 space-y-3.5">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-ink-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/#book"
                  className={`btn mt-8 w-full ${service.popular ? "btn-primary" : "btn-ghost"}`}
                >
                  Book this package
                  <ArrowRight className="arrow h-4 w-4" />
                </Link>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
