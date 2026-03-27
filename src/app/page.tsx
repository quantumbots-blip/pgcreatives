import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Camera,
  Clapperboard,
  Compass,
  Cuboid,
  Star,
} from "lucide-react";
import { VideoHero } from "@/components/video-hero";
import { images } from "@/lib/images";

const stats = [
  { value: "500+", label: "Projects Delivered" },
  { value: "100+", label: "Happy Clients" },
  { value: "2", label: "Wisconsin Locations" },
  { value: "4K+", label: "Ultra HD Quality" },
];

const services = [
  {
    number: "01",
    icon: Camera,
    title: "Real Estate Photography",
    description:
      "Stunning HDR photography that captures every detail. From cozy homes to luxury estates, we showcase properties in their absolute best light.",
  },
  {
    number: "02",
    icon: Clapperboard,
    title: "Cinema Videography",
    description:
      "Film-quality video production with professional color grading, stabilization, and licensed music. Tell your story cinematically.",
  },
  {
    number: "03",
    icon: Compass,
    title: "Drone Aerial",
    description:
      "FAA-certified pilots capturing breathtaking aerial perspectives. Showcase properties from angles ground photography simply can't reach.",
  },
  {
    number: "04",
    icon: Cuboid,
    title: "3D Virtual Tours",
    description:
      "Immersive Matterport walkthroughs with interactive floor plans. Let clients explore properties from anywhere in the world, anytime.",
  },
];

const portfolio = [
  {
    title: "Luxury Lakefront Estate",
    category: "Real Estate",
    image: images.luxuryLakefront,
    colSpan: "sm:col-span-2 sm:row-span-2",
  },
  {
    title: "Downtown Commercial Shoot",
    category: "Commercial",
    image: images.downtownCommercial,
    colSpan: "",
  },
  {
    title: "Aerial Property Showcase",
    category: "Drone",
    image: images.aerialProperty,
    colSpan: "",
  },
  {
    title: "Modern Home Tour",
    category: "3D Tour",
    image: images.modernHome,
    colSpan: "",
  },
  {
    title: "Brand Launch Video",
    category: "Videography",
    image: images.brandVideo,
    colSpan: "",
  },
];

export default function HomePage() {
  return (
    <>
      <VideoHero />

      {/* Stats Bar */}
      <section className="border-y border-white/[0.06] bg-navy">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-4xl font-bold text-gold sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm tracking-wide text-white/35">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-black py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-gold/60">
                What We Do
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Services Built
                <br className="hidden sm:block" /> for Impact
              </h2>
            </div>
            <Link
              href="/services"
              className="hidden items-center gap-2 text-sm text-white/40 transition-colors hover:text-white md:flex"
            >
              All Services
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-16 grid gap-px bg-white/[0.03] sm:grid-cols-2">
            {services.map((service) => (
              <Link
                key={service.title}
                href="/services"
                className="group relative bg-black p-8 transition-colors hover:bg-navy/30 lg:p-10"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-gold/40">
                    {service.number}
                  </span>
                  <service.icon className="h-5 w-5 text-white/10 transition-colors group-hover:text-gold/30" />
                </div>
                <h3 className="mt-6 font-heading text-xl font-semibold text-white lg:text-2xl">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/40 transition-colors group-hover:text-white/50">
                  {service.description}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm text-gold/60 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                  Learn More <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white"
            >
              View All Services
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="border-t border-white/[0.06] bg-navy/20 py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-gold/60">
              Our Work
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Featured Projects
            </h2>
            <p className="mt-4 text-white/40">
              A glimpse of the professional media we&apos;ve created for our
              clients across Wisconsin.
            </p>
          </div>

          {/* Bento-style grid: first item is large, rest are smaller */}
          <div className="mt-16 grid grid-cols-1 gap-1.5 sm:grid-cols-4 sm:grid-rows-2">
            {portfolio.map((item) => (
              <div
                key={item.title}
                className={`group relative overflow-hidden bg-navy/40 ${item.colSpan} ${
                  item.colSpan ? "aspect-auto min-h-[350px]" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes={
                    item.colSpan
                      ? "(max-width: 640px) 100vw, 50vw"
                      : "(max-width: 640px) 100vw, 25vw"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 transition-opacity group-hover:opacity-90" />

                <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold/60">
                    {item.category}
                  </p>
                  <h3 className="mt-1.5 font-heading text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2.5 bg-white px-8 py-3.5 text-sm font-medium tracking-wide text-black transition-colors hover:bg-white/90"
            >
              View Full Portfolio
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="border-t border-white/[0.06] bg-black py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-gold text-gold" />
            ))}
          </div>
          <blockquote className="mt-8 font-heading text-2xl font-medium leading-relaxed text-white/80 sm:text-3xl lg:text-4xl">
            &ldquo;PG Creatives transformed our listings. The photography and
            drone footage are absolutely stunning &mdash; our properties sell
            faster and for more.&rdquo;
          </blockquote>
          <div className="mt-8">
            <p className="text-sm font-medium text-white/60">
              Top Producing Agent
            </p>
            <p className="mt-1 text-xs tracking-wide text-white/30">
              Leading Real Estate Agency, Green Bay
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-navy py-28 lg:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-navy-light)_0%,_transparent_60%)] opacity-40" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-gold/50">
            Get Started
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Elevate
            <br />
            Your Brand?
          </h2>
          <p className="mt-5 text-lg text-white/40">
            Let&apos;s create something extraordinary together. Get in touch for
            a free consultation and custom quote.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="bg-gold px-8 py-3.5 text-sm font-medium tracking-wide text-black transition-colors hover:bg-gold-dim"
            >
              Contact Us
            </Link>
            <a
              href="tel:+19207770127"
              className="border border-white/15 px-8 py-3.5 text-sm tracking-wide text-white transition-colors hover:border-white/30 hover:bg-white/5"
            >
              (920) 777-0127
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
