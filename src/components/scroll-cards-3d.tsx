"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const services = [
  {
    title: "Real Estate",
    description:
      "HDR photography, MLS-ready images, twilight shoots, and virtual staging that sell homes faster.",
    features: ["HDR Photography", "Drone Aerials", "Virtual Staging", "MLS-Ready"],
    price: "Starting at $250",
    popular: false,
  },
  {
    title: "Full Production",
    description:
      "Complete media package — photography, videography, drone, and 3D tours for the ultimate listing.",
    features: ["4K Video Tours", "Drone Footage", "3D Matterport", "Photo + Video"],
    price: "Starting at $750",
    popular: true,
  },
  {
    title: "Commercial",
    description:
      "Cinema-quality brand videos, product photography, headshots, and content creation for businesses.",
    features: ["Brand Videos", "Product Photos", "Social Content", "Color Grading"],
    price: "Custom Quote",
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
  const rafRef = useRef<number>(0);

  useEffect(() => {
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
      className="relative min-h-[80vh] overflow-hidden bg-background py-12 sm:py-16 lg:py-24"
    >
      {/* Ambient glow */}
      <div className="absolute left-1/2 top-1/3 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-10 text-center sm:mb-16">
          <div className="flex justify-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full border border-purple/25 bg-purple/10 px-3 h-7 sm:px-4 sm:h-8">
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-purple-light leading-none">
                Packages
              </span>
            </div>
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            <span className="text-white">Our </span>
            <span className="text-purple-light">Packages</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Tailored media packages for every stage of your project — from
            single-property shoots to full-scale production.
          </p>
        </div>

        {/* Cards container */}
        <div
          className="perspective-container relative mx-auto flex max-w-5xl flex-col items-center gap-6 lg:flex-row lg:items-stretch lg:justify-center lg:gap-8"
        >
          {services.map((service, i) => (
            <div
              key={service.title}
              className="w-full max-w-sm lg:w-1/3 lg:max-w-none"
              style={{
                transform: getCardTransform(i, progress),
                transition: "transform 0.1s linear",
                willChange: "transform",
              }}
            >
              <div
                className={`relative flex h-full flex-col rounded-2xl border backdrop-blur-xl transition-shadow duration-500 ${
                  service.popular
                    ? "border-purple/30 bg-[rgba(139,92,246,0.08)] hover:shadow-[0_0_50px_rgba(79,110,247,0.25),0_0_100px_rgba(79,110,247,0.1)] hover:border-purple/40"
                    : "border-white/10 bg-[rgba(10,10,40,0.6)] hover:shadow-[0_0_40px_rgba(79,110,247,0.2),0_0_80px_rgba(79,110,247,0.08)] hover:border-purple/20"
                }`}
                style={{
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.4)",
                }}
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
                    <Link
                      href="/contact"
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-7 py-3 text-sm tracking-wide transition-all duration-300 ${
                        service.popular
                          ? "bg-gradient-to-r from-purple-dim via-purple to-purple-light font-semibold text-white hover:brightness-110 hover:shadow-lg hover:shadow-purple/30"
                          : "border border-purple/30 font-medium text-purple-light hover:border-purple/50 hover:bg-purple/10"
                      }`}
                    >
                      Get Started
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
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
