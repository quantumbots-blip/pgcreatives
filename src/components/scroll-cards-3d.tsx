"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
const services = [
  {
    title: "PG Core",
    description:
      "Essential listing media — professional HDR photos, drone aerials, and MLS-ready formatting.",
    features: ["HDR Photography", "Drone Aerials", "MLS-Ready", "Fast Turnaround"],
    price: "From $550",
    popular: false,
  },
  {
    title: "PG Growth",
    description:
      "Our most popular package — listing video, HDR photos, drone footage, and social media edits.",
    features: ["Listing Video", "HDR Photos", "Drone Footage", "Social Edits"],
    price: "From $725",
    popular: true,
  },
  {
    title: "PG Platinum",
    description:
      "The full premium experience — premium video, photos, drone, 3D tour, and priority scheduling.",
    features: ["Premium Video", "3D Virtual Tour", "Drone Aerial", "Priority Scheduling"],
    price: "From $1,000",
    popular: false,
  },
];

function getCardTransform(index: number, progress: number) {
  const configs = [
    // Card 0 (left): fans in from left rotation
    { rotateY: 35, translateZ: -100, translateX: -80 },
    // Card 1 (center/popular): slightly forward
    { rotateY: 0, translateZ: 50, translateX: 0 },
    // Card 2 (right): fans in from right rotation
    { rotateY: -35, translateZ: -100, translateX: 80 },
  ];

  const config = configs[index];
  const eased = easeOutCubic(progress);

  const rotateY = config.rotateY * (1 - eased);
  const translateZ = config.translateZ * (1 - eased);
  const translateX = config.translateX * (1 - eased);

  return `perspective(1200px) rotateY(${rotateY}deg) translateZ(${translateZ}px) translateX(${translateX}px)`;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function ScrollCards3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    // Skip 3D effect on mobile / reduced-motion
    const motionOk = !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

    if (!motionOk || !isDesktop) {
      setProgress(1);
      return;
    }

    function onScroll() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Progress: 0 when section top hits viewport bottom, 1 when section top hits 30% from top
        const start = windowHeight;
        const end = windowHeight * 0.3;
        const current = rect.top;

        const raw = 1 - (current - end) / (start - end);
        setProgress(Math.max(0, Math.min(1, raw)));
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial check

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-background py-16 sm:py-24 lg:py-32"
    >
      {/* Ambient glow */}
      <div className="absolute left-1/2 top-1/3 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        {/* Heading */}
        <div className="mb-8 text-center sm:mb-16">
          <div className="flex justify-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full border border-purple/25 bg-purple/10 px-3 h-7 sm:px-4 sm:h-8">
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-purple-light leading-none">
                Packages
              </span>
            </div>
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            <span className="text-white">Our </span>
            <span className="text-white">Packages</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Tailored media packages for every stage of your project — from
            single-property shoots to full-scale production.
          </p>
        </div>

        {/* Cards container */}
        <div
          className="perspective-container relative mx-auto flex max-w-5xl flex-col items-center gap-3 sm:gap-4 lg:flex-row lg:items-stretch lg:justify-center lg:gap-8"
        >
          {services.map((service, i) => (
            <div
              key={service.title}
              className="w-full max-w-sm lg:w-1/3 lg:max-w-none"
              suppressHydrationWarning
              style={mounted ? {
                transform: getCardTransform(i, progress),
                transition: "transform 0.1s linear",
                willChange: "transform",
              } : {}}
            >
              <div
                className={`relative flex h-full flex-col rounded-2xl border transition-all duration-300 ${
                  service.popular
                    ? "border-purple/30 bg-gradient-to-br from-purple/[0.15] via-black to-purple-light/[0.08] hover:border-purple/50 hover:shadow-[0_0_40px_rgba(79,110,247,0.25)]"
                    : "border-purple/20 bg-gradient-to-br from-purple/[0.12] via-black to-purple-light/[0.06] hover:border-purple/40 hover:shadow-[0_0_40px_rgba(79,110,247,0.2)]"
                }`}
              >
                {/* Popular badge */}
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-purple px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-purple/30">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  {/* Title & Price */}
                  <h3 className="font-heading text-xl font-semibold text-white">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {service.description}
                  </p>

                  <div className="mt-6">
                    <span className="text-2xl font-bold text-white">
                      {service.price}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="mt-6 flex-1 space-y-3">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-sm text-white/60"
                      >
                        <Check className="h-4 w-4 shrink-0 text-purple-light" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-8">
                    <a
                      href="/#portals"
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm tracking-wide transition-all duration-300 ${
                        service.popular
                          ? "bg-gradient-to-r from-purple-dim to-purple font-semibold text-white shadow-[0_0_20px_rgba(79,110,247,0.3)] hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(79,110,247,0.5)]"
                          : "border border-white/15 font-medium text-white/70 hover:border-white/30 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      Get Started
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
