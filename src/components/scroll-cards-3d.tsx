"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { FloatingParticles } from "@/components/floating-particles";
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
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const motionOk = !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

    if (!motionOk || !isDesktop) return;

    let rafId = 0;
    let sectionTop = 0;

    function updateRect() {
      const section = sectionRef.current;
      if (section) sectionTop = section.offsetTop;
    }

    function onScroll() {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const windowHeight = window.innerHeight;

        // Use cached offsetTop + scrollY instead of getBoundingClientRect
        const current = sectionTop - window.scrollY;
        const start = windowHeight;
        const end = windowHeight * 0.3;

        const raw = 1 - (current - end) / (start - end);
        const progress = Math.max(0, Math.min(1, raw));

        // Apply transforms directly to DOM — no React re-render
        cardRefs.current.forEach((card, i) => {
          if (card) card.style.transform = getCardTransform(i, progress);
        });
      });
    }

    updateRect();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateRect);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateRect);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-x-clip py-16 sm:py-24 lg:py-32"
    >
      {/* Ambient glows */}
      <div className="absolute left-1/2 top-1/3 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple/[0.04] blur-[200px]" />
      <div className="absolute bottom-0 left-1/4 h-[300px] w-[400px] rounded-full bg-purple-light/[0.03] blur-[160px]" />
      <FloatingParticles count={10} className="hidden sm:block" />

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
              ref={(el) => { cardRefs.current[i] = el; }}
              className="w-full max-w-sm lg:w-1/3 lg:max-w-none"
              style={{
                transition: "transform 0.1s linear",
                willChange: "transform",
              }}
            >
              <div
                className={`relative flex h-full flex-col rounded-2xl border transition-all duration-300 ${
                  service.popular
                    ? "border-purple/50 bg-gradient-to-br from-purple/[0.18] via-[#020810]/90 to-purple-light/[0.08] hover:border-purple/60 hover:shadow-[0_0_50px_rgba(43,111,184,0.35)] shadow-[0_0_25px_rgba(43,111,184,0.15)]"
                    : "border-purple/30 bg-gradient-to-br from-purple/[0.12] via-[#020810]/90 to-purple-light/[0.05] hover:border-purple/45 hover:shadow-[0_0_40px_rgba(43,111,184,0.25)]"
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
                      href="/#portals"
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm tracking-wide transition-all duration-300 ${
                        service.popular
                          ? "bg-gradient-to-r from-purple-dim to-purple font-semibold text-white shadow-[0_0_20px_rgba(55,140,210,0.3)] hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(55,140,210,0.5)]"
                          : "border border-white/15 font-medium text-white/70 hover:border-white/30 hover:bg-white/5 hover:text-white"
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
