import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Home,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import { VideoHero } from "@/components/video-hero";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { images } from "@/lib/images";

const stats = [
  { value: "$3.9B", label: "In Real Estate Captured" },
  { value: "1.2m", label: "Views Generated" },
  { value: "150k", label: "Photos & Videos Delivered" },
];

const services = [
  {
    number: "01",
    icon: Sparkles,
    title: "Branding",
    description:
      "Personal branding is essential if you're looking to stand out in a competitive market. It builds trust and credibility, creates a consistent and memorable identity, and showcases your unique value proposition.",
  },
  {
    number: "02",
    icon: Home,
    title: "Real Estate",
    description:
      "Listing videos and pictures, drone shots, 3D tours and more. Professional photography, editing and content to sell homes faster.",
  },
  {
    number: "03",
    icon: Video,
    title: "Commercial",
    description:
      "Cinema quality videography for businesses of all types. Have an idea? Let's connect and make it happen.",
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
      <section className="border-y border-purple/10 bg-card relative overflow-hidden">
        {/* Decorative rotating gradient orb */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple/5 blur-[60px] animate-rotate-slow" />
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-8 px-6 py-14 lg:grid-cols-3">
          {stats.map((stat, i) => (
            <AnimateOnScroll key={stat.label} animation="fade-up" delay={i * 0.15}>
              <div className="relative text-center">
                <p className="font-heading text-4xl font-bold sm:text-5xl gradient-text">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm tracking-wide text-white/35">
                  {stat.label}
                </p>
                {i < stats.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden h-8 w-px -translate-y-1/2 bg-purple/15 lg:block" />
                )}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-background py-28 lg:py-36 relative overflow-hidden">
        {/* Floating decorative orbs */}
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-purple/[0.03] blur-[80px] animate-float-slow" />
        <div className="absolute right-20 bottom-40 h-48 w-48 rounded-full bg-purple/[0.04] blur-[60px] animate-float" />

        <div className="relative mx-auto max-w-7xl px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-4 inline-block rounded-full border border-purple/25 bg-purple/10 px-4 py-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-purple-light">
                    What We Do
                  </span>
                </div>
                <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  <span className="text-white">Services Built</span>
                  <br className="hidden sm:block" />
                  <span className="gradient-text-bold"> for Impact</span>
                </h2>
              </div>
              <Link
                href="/services"
                className="hidden items-center gap-2 text-sm text-purple-light/60 transition-colors hover:text-purple-light md:flex"
              >
                All Services
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </AnimateOnScroll>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {services.map((service, i) => (
              <AnimateOnScroll key={service.title} animation="fade-up" delay={i * 0.12}>
                <div className="card-3d h-full">
                  <Link
                    href="/services"
                    className="card-3d-inner group relative flex h-full flex-col rounded-xl border border-purple/12 bg-purple/[0.04] p-8 transition-all hover:border-purple/30 lg:p-10"
                  >
                    {/* Subtle corner glow on hover */}
                    <div className="absolute -right-10 -top-10 h-20 w-20 rounded-full bg-purple/0 blur-[30px] transition-all duration-500 group-hover:bg-purple/15" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/15 transition-all duration-300 group-hover:animate-pulse-glow">
                        <service.icon className="h-5 w-5 text-purple-light" />
                      </div>
                      <span className="font-mono text-sm text-purple/40">
                        {service.number}
                      </span>
                    </div>
                    <h3 className="mt-6 font-heading text-xl font-semibold text-white lg:text-2xl">
                      {service.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-white/40 transition-colors group-hover:text-white/55">
                      {service.description}
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-sm text-purple-light opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                      Learn More <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm text-purple-light/60 transition-colors hover:text-purple-light"
            >
              View All Services
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="border-t border-purple/10 bg-secondary/50 py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 inline-block rounded-full border border-purple/25 bg-purple/10 px-4 py-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-purple-light">
                  Our Work
                </span>
              </div>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                <span className="gradient-text">Featured Projects</span>
              </h2>
              <p className="mt-4 text-white/40">
                A glimpse of the professional media we&apos;ve created for our
                clients across Wisconsin.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Bento-style grid */}
          <AnimateOnScroll animation="fade-in-scale" delay={0.2}>
            <div className="mt-16 grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2">
              {portfolio.map((item) => (
                <div
                  key={item.title}
                  className={`group relative overflow-hidden rounded-xl bg-navy-light transition-all duration-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] ${item.colSpan} ${
                    item.colSpan ? "aspect-auto min-h-[350px]" : "aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                    sizes={
                      item.colSpan
                        ? "(max-width: 640px) 100vw, 50vw"
                        : "(max-width: 640px) 100vw, 25vw"
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080820]/85 via-[#080820]/20 to-transparent opacity-70 transition-opacity group-hover:opacity-90" />

                  <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6 translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple-light">
                      {item.category}
                    </p>
                    <h3 className="mt-1.5 font-heading text-lg font-semibold text-white">
                      {item.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={0.3}>
            <div className="mt-14 text-center">
              <Link
                href="/portfolio"
                className="glow-hover inline-flex items-center gap-2.5 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold tracking-wide text-[#1a1054]"
              >
                View Full Portfolio
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Testimonial */}
      <section className="border-t border-purple/10 bg-background py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[200px] w-[400px] -translate-x-1/2 -translate-y-1/2 bg-purple/[0.04] blur-[100px] animate-float-slow" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <AnimateOnScroll animation="fade-in-scale">
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-purple text-purple" />
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
          </AnimateOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-secondary py-28 lg:py-36">
        {/* Animated purple ambient glows */}
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-purple/8 blur-[80px] animate-float-slow" />
        <div className="absolute left-1/4 top-1/4 h-[150px] w-[150px] rounded-full bg-purple/5 blur-[50px] animate-float" />
        <div className="absolute right-1/4 bottom-1/4 h-[100px] w-[100px] rounded-full bg-purple-light/5 blur-[40px] animate-float-slow" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <AnimateOnScroll animation="fade-up">
            <div className="mb-4 inline-block rounded-full border border-purple/25 bg-purple/10 px-4 py-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-purple-light">
                Get Started
              </span>
            </div>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              <span className="text-white">Ready to </span>
              <span className="shimmer-text">Elevate</span>
              <br />
              <span className="text-white">Your Brand?</span>
            </h2>
            <p className="mt-5 text-lg text-white/40">
              Let&apos;s create something extraordinary together. Get in touch for
              a free consultation and custom quote.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="glow-hover rounded-lg bg-white px-8 py-3.5 text-sm font-semibold tracking-wide text-[#1a1054]"
              >
                Contact Us
              </Link>
              <a
                href="tel:+19207770127"
                className="glow-hover rounded-lg border border-purple/30 px-8 py-3.5 text-sm tracking-wide text-purple-light"
              >
                (920) 777-0127
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
