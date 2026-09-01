import { RuleHead } from "@/components/rule-head";
import { DisplayLines } from "@/components/display-lines";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { PricingCard } from "@/components/pricing-card";
import { Tilt } from "@/components/tilt";

// This section used to be a client component driving a scroll-linked 3D fan:
// three cards rotated into place from a scroll listener on desktop. The effect
// never ran on phones or for reduced-motion visitors, but the cost did — every
// package name, price and feature list shipped to every browser as JavaScript
// and had to be hydrated, because the markup was defined inside the client
// component rather than passed into it.
//
// The section is now server-rendered: no JavaScript at all. The file was still
// named for the 3D fan long after the fan was gone.
const packages = [
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

export function Packages() {
  return (
    <section className="section">
      <div className="shell">
        <AnimateOnScroll animation="rise">
          <RuleHead label="Packages" link={{ href: "/#book", label: "Book a shoot" }} />
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <DisplayLines
              className="display-2 max-w-xl text-white"
              lines={["Three packages.", "One number each."]}
            />
            <p className="lede max-w-sm">
              Everything a listing needs is already in the package —
              photography, video, drone, and the extras that usually get billed
              separately. Anything bigger gets a custom quote.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="scene mt-12 grid gap-4 sm:mt-16 lg:grid-cols-3">
          {packages.map((pkg, i) => (
            <AnimateOnScroll
              key={pkg.title}
              animation={i === 0 ? "depth-left" : i === 2 ? "depth-right" : "depth"}
              delay={i * 0.1}
              className={`pkg-fan h-full ${
                i === 1 ? "pkg-fan-center" : i === 0 ? "pkg-fan-left" : "pkg-fan-right"
              }`}
            >
              <Tilt className="h-full" max={5} lift={i === 1 ? 34 : 14}>
              <PricingCard
                name={pkg.title}
                price={pkg.price}
                description={pkg.description}
                features={pkg.features}
                popular={pkg.popular}
                href="/#book"
                cta="Book this package"
              />
              </Tilt>
            </AnimateOnScroll>
          ))}
          <p className="mt-8 text-sm text-ink-3">
            Package pricing scales with square footage and varies slightly
            between our Green Bay and Madison markets. Send us the address and
            we&apos;ll confirm the exact number.
          </p>
        </div>
      </div>
    </section>
  );
}
