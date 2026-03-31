"use client";

import { useState } from "react";
import { Check, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { SectionLabel } from "@/components/section-label";

type Location = "ne-wisconsin" | "madison";

interface BundledPackage {
  name: string;
  fromPrice: Record<Location, number | null>;
  popular?: boolean;
  features: string[];
}

interface StandaloneService {
  name: string;
  price: Record<Location, string>;
  flat?: boolean;
}

interface AddOn {
  name: string;
  price: string;
}

const packages: BundledPackage[] = [
  {
    name: "PG Platinum",
    fromPrice: { "ne-wisconsin": 1000, madison: 1200 },
    features: [
      "Premium listing video",
      "Professional HDR photos",
      "Drone aerial footage",
      "3D virtual tour",
      "Social media edits",
      "Priority scheduling",
    ],
  },
  {
    name: "PG Growth",
    fromPrice: { "ne-wisconsin": 725, madison: 775 },
    popular: true,
    features: [
      "Listing video",
      "Professional HDR photos",
      "Drone aerial footage",
      "Social media edits",
      "Fast turnaround",
    ],
  },
  {
    name: "PG Core",
    fromPrice: { "ne-wisconsin": 550, madison: 650 },
    features: [
      "Professional HDR photos",
      "Drone aerial footage",
      "MLS-ready formatting",
      "24-48 hour turnaround",
    ],
  },
  {
    name: "PG Starter",
    fromPrice: { "ne-wisconsin": null, madison: 475 },
    features: [
      "Basic listing video",
      "Professional photos",
      "Quick turnaround",
    ],
  },
];

const standaloneServices: StandaloneService[] = [
  {
    name: "Listing Photos",
    price: { "ne-wisconsin": "From $225", madison: "From $250" },
  },
  {
    name: "Premium Listing Video",
    price: { "ne-wisconsin": "From $500", madison: "From $525" },
  },
  {
    name: "Basic Video",
    price: { "ne-wisconsin": "", madison: "From $375" },
  },
  {
    name: "Exterior Video",
    price: { "ne-wisconsin": "$300", madison: "$250" },
    flat: true,
  },
  {
    name: "Exterior Photography",
    price: { "ne-wisconsin": "$175", madison: "" },
    flat: true,
  },
  {
    name: "Drone Photography",
    price: { "ne-wisconsin": "", madison: "$175" },
    flat: true,
  },
];

const addOns: AddOn[] = [
  { name: "Video Staging", price: "$95" },
  { name: "2D Floor Plan", price: "$50" },
  { name: "Virtual Staging", price: "$15/photo" },
  { name: "Coming Soon Video", price: "$125" },
  { name: "Digital Lot Lines", price: "$20" },
  { name: "30-Second Video", price: "$250" },
  { name: "6 Bureau Clips", price: "$75" },
];

const locations: { key: Location; label: string }[] = [
  { key: "ne-wisconsin", label: "Northeast Wisconsin" },
  { key: "madison", label: "Madison" },
];

export function PricingSection() {
  const [activeLocation, setActiveLocation] = useState<Location>("ne-wisconsin");

  const visiblePackages = packages.filter(
    (pkg) => pkg.fromPrice[activeLocation] !== null
  );

  const visibleStandalone = standaloneServices.filter(
    (svc) => svc.price[activeLocation] !== ""
  );

  return (
    <section className="relative overflow-hidden bg-background py-12 sm:py-16" id="pricing">
      <div className="absolute left-[5%] top-[20%] h-60 w-60 rounded-full bg-purple/[0.04] blur-[100px]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {/* Header */}
        <AnimateOnScroll animation="fade-up">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
              <span className="text-white">Transparent </span>
              <span className="text-purple-light">Pricing</span>
            </h2>
            <p className="mt-4 text-white/60">
              Interior packages start from the base price and scale with property
              size. Exterior services are flat-rate.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Location Toggle */}
        <AnimateOnScroll animation="fade-up" delay={0.1}>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] p-1.5">
              {locations.map((loc) => (
                <button
                  key={loc.key}
                  onClick={() => setActiveLocation(loc.key)}
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-300",
                    activeLocation === loc.key
                      ? "bg-purple/20 text-purple-light border border-purple/30 shadow-[0_0_15px_rgba(79,110,247,0.15)]"
                      : "text-white/50 border border-transparent hover:text-white/70"
                  )}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {loc.label}
                </button>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* Bundled Packages */}
        <div
          key={activeLocation}
          className={cn(
            "mt-10 sm:mt-14 grid gap-5",
            visiblePackages.length === 4
              ? "sm:grid-cols-2 lg:grid-cols-4"
              : "sm:grid-cols-3"
          )}
        >
          {visiblePackages.map((pkg, i) => (
            <AnimateOnScroll key={pkg.name} animation="fade-up" delay={i * 0.1}>
              <div
                className={cn(
                  "relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1",
                  pkg.popular
                    ? "border-purple/40 bg-gradient-to-br from-purple/[0.22] via-purple-dim/[0.3] to-purple-light/[0.1] shadow-[0_0_50px_rgba(79,110,247,0.2),inset_0_1px_0_rgba(165,180,252,0.1)]"
                    : pkg.name === "PG Platinum"
                      ? "border-purple-light/30 bg-gradient-to-br from-purple-light/[0.15] via-indigo-500/[0.08] to-blue-500/[0.1] shadow-[0_0_40px_rgba(165,180,252,0.12)]"
                      : "border-purple/20 bg-gradient-to-br from-purple/[0.12] via-black to-purple-light/[0.06]"
                )}
              >
                {/* Gradient top accent */}
                {(pkg.popular || pkg.name === "PG Platinum") && (
                  <div className={cn(
                    "h-1 w-full",
                    pkg.popular
                      ? "bg-gradient-to-r from-purple-dim via-purple to-purple-light"
                      : "bg-gradient-to-r from-blue-500 via-purple-light to-purple"
                  )} />
                )}
                {/* Corner glow */}
                {(pkg.popular || pkg.name === "PG Platinum") && (
                  <div className={cn(
                    "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-[60px]",
                    pkg.popular ? "bg-purple/25" : "bg-purple-light/20"
                  )} />
                )}
                <div className="p-6 lg:p-8 flex flex-col flex-1">
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-gradient-to-r from-purple to-purple-light px-4 py-1 text-xs font-semibold text-white shadow-[0_0_20px_rgba(79,110,247,0.4)]">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                <div className="mt-4">
                  <span className="text-sm text-white/40">From</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">
                      ${pkg.fromPrice[activeLocation]?.toLocaleString()}
                    </span>
                  </div>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {pkg.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-white/60"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/#portals"
                  className={cn(
                    "mt-6 flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300",
                    pkg.popular
                      ? "bg-gradient-to-r from-purple-dim to-purple text-white shadow-[0_0_20px_rgba(79,110,247,0.3)] hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(79,110,247,0.5)]"
                      : pkg.name === "PG Platinum"
                        ? "bg-gradient-to-r from-blue-500/80 to-purple-light/80 text-white shadow-[0_0_15px_rgba(165,180,252,0.2)] hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(165,180,252,0.4)]"
                        : "border border-white/15 text-white/70 hover:border-white/30 hover:bg-white/5 hover:text-white"
                  )}
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Standalone Services */}
        <div className="mt-14">
          <AnimateOnScroll animation="fade-up">
            <h3 className="text-xl font-bold text-white">
              Standalone Services
            </h3>
            <div className="mt-1 h-px w-16 bg-purple/40" />
          </AnimateOnScroll>
          <div
            key={`standalone-${activeLocation}`}
            className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visibleStandalone.map((svc, i) => (
              <AnimateOnScroll key={svc.name} animation="fade-up" delay={i * 0.08}>
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-all duration-300 hover:border-purple/20 hover:bg-purple/[0.04]">
                  <div>
                    <p className="text-sm font-medium text-white">{svc.name}</p>
                    {svc.flat && (
                      <span className="text-[10px] uppercase tracking-wider text-white/30">
                        Flat rate
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-purple-light">
                    {svc.price[activeLocation]}
                  </span>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div className="mt-14">
          <AnimateOnScroll animation="fade-up">
            <h3 className="text-xl font-bold text-white">Add-Ons</h3>
            <div className="mt-1 h-px w-16 bg-purple/40" />
          </AnimateOnScroll>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {addOns.map((addon, i) => (
              <AnimateOnScroll key={addon.name} animation="fade-up" delay={i * 0.05}>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center transition-all duration-300 hover:border-purple/20">
                  <p className="text-sm text-white/70">{addon.name}</p>
                  <p className="mt-1 text-sm font-semibold text-purple-light">
                    {addon.price}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>

        {/* Footnote */}
        <p className="mt-10 text-center text-xs text-white/35">
          Interior package pricing shown is for properties 0–2,499 sq ft (Tier
          1). Pricing increases for larger properties. Contact us for a custom
          quote.
        </p>
      </div>
    </section>
  );
}
