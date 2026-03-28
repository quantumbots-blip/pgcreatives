import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Home,
  Sparkles,
  Video,
} from "lucide-react";
import { VideoHero } from "@/components/video-hero";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { ContactForm } from "@/components/contact-form";
import { SectionLabel } from "@/components/section-label";
import { Counter } from "@/components/counter";
import { MagneticButton } from "@/components/magnetic-button";
import { TextReveal } from "@/components/text-reveal";
import { IPhoneScroll } from "@/components/iphone-3d";
import { images } from "@/lib/images";

const iphoneImages = [
  "/images/luxury-living-room.jpg",
  "/images/aerial-lakefront.jpg",
  "/images/gourmet-kitchen.jpg",
  "/images/luxury-estate-night.jpg",
  "/images/stone-fireplace-living.jpg",
  "/images/cottage-exterior.jpg",
];

const FloatingParticles = dynamic(() =>
  import("@/components/floating-particles").then(
    (mod) => mod.FloatingParticles
  )
);

const stats = [
  { value: 3, prefix: "$", suffix: "B", label: "In Real Estate Captured" },
  { value: 2, suffix: "m+", label: "Views Generated" },
  { value: 150, suffix: "k+", label: "Photos & Videos Delivered" },
];

const services = [
  {
    number: "01",
    icon: Sparkles,
    title: "Branding",
    description:
      "Personal branding is essential if you're looking to stand out in a competitive market. It builds trust and credibility, creates a consistent and memorable identity, and showcases your unique value proposition.",
    image: "/images/video-studio.jpg",
  },
  {
    number: "02",
    icon: Home,
    title: "Real Estate",
    description:
      "Listing videos and pictures, drone shots, 3D tours and more. Professional photography, editing and content to sell homes faster.",
    image: "/images/luxury-living-room.jpg",
  },
  {
    number: "03",
    icon: Video,
    title: "Commercial",
    description:
      "Cinema quality videography for businesses of all types. Have an idea? Let's connect and make it happen.",
    image: "/images/aerial-lakefront.jpg",
  },
];

const photos = [
  { image: images.luxuryLakefront, alt: "Open-concept living room with vaulted ceiling", colSpan: "sm:col-span-2 sm:row-span-2" },
  { image: images.downtownCommercial, alt: "Modern downtown penthouse interior", colSpan: "" },
  { image: images.aerialProperty, alt: "Lakefront estate drone aerial", colSpan: "" },
  { image: images.modernHome, alt: "Lakehouse kitchen with spiral staircase", colSpan: "" },
  { image: images.brandVideo, alt: "Professional studio lighting setup", colSpan: "" },
];

export default function HomePage() {
  return (
    <>
      <VideoHero />

      {/* Stats Bar */}
      <div className="section-divider" />
      <section className="bg-background relative overflow-hidden">
        {/* Single subtle background glow */}
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple/[0.04] blur-[80px]" />

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:gap-8 px-6 py-10 sm:py-14 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <AnimateOnScroll key={stat.label} animation="fade-up" delay={i * 0.15}>
              <div className="relative text-center">
                <p className="font-heading text-4xl font-bold sm:text-5xl text-white">
                  <Counter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    duration={2.5}
                  />
                </p>
                <p className="mt-2 text-sm tracking-wide text-white/35">
                  {stat.label}
                </p>
                {i < stats.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden h-8 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-purple/30 to-transparent lg:block" />
                )}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>
      <div className="section-divider" />

      {/* Services */}
      <section className="bg-background py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        {/* Single ambient glow */}
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-purple/[0.03] blur-[80px]" />
        <FloatingParticles count={10} />

        <div className="relative mx-auto max-w-7xl px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <SectionLabel>What We Do</SectionLabel>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                  <span className="text-white">Services Built</span>
                  <br className="hidden sm:block" />
                  <span className="text-purple-light"> for Impact</span>
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

          <div className="mt-10 sm:mt-16 grid gap-4 sm:grid-cols-3">
            {services.map((service, i) => (
              <AnimateOnScroll key={service.title} animation="fade-up" delay={i * 0.12}>
                <div className="card-3d-enhanced h-full">
                  <Link
                    href="/services"
                    className="group relative flex h-full flex-col rounded-xl border border-purple/10 bg-purple/[0.03] overflow-hidden transition-all hover:border-purple/25"
                  >
                    {/* Image */}
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#040A2D] via-[#040A2D]/30 to-transparent" />
                      <div className="absolute bottom-3 left-4 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple/20 backdrop-blur-sm border border-purple/20">
                          <service.icon className="h-4 w-4 text-purple-light" />
                        </div>
                        <span className="font-mono text-xs text-white/40">
                          {service.number}
                        </span>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="flex flex-1 flex-col p-6 lg:p-8">
                      <h3 className="font-heading text-xl font-semibold text-white lg:text-2xl">
                        {service.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-white/40 transition-colors group-hover:text-white/55">
                        {service.description}
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-sm text-purple-light opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                        Learn More <ArrowRight className="h-3 w-3" />
                      </div>
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

      {/* iPhone 3D Scroll Section */}
      <IPhoneScroll images={iphoneImages} />

      {/* Portfolio */}
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden bg-background">
        {/* Subtle ambient glow */}
        <div className="absolute right-[5%] top-[10%] h-48 w-48 rounded-full bg-purple/[0.04] blur-[100px] hidden lg:block" />
        <div className="mx-auto max-w-7xl px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="mx-auto max-w-2xl text-center">
              <SectionLabel>Our Work</SectionLabel>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                <span className="text-white">Featured Photos</span>
              </h2>
              <p className="mt-4 text-white/40">
                A glimpse of the professional media we&apos;ve captured for our
                clients across Wisconsin.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Bento-style grid */}
          <AnimateOnScroll animation="fade-in-scale" delay={0.2}>
            <div className="mt-10 sm:mt-16 grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2">
              {photos.map((photo) => (
                <div
                  key={photo.alt}
                  className={`group relative overflow-hidden rounded-xl bg-navy-light transition-all duration-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] ${photo.colSpan} ${
                    photo.colSpan ? "aspect-auto min-h-[250px] sm:min-h-[350px]" : "aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={photo.image}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
                    sizes={
                      photo.colSpan
                        ? "(max-width: 640px) 100vw, 50vw"
                        : "(max-width: 640px) 100vw, 25vw"
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040A2D]/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={0.3}>
            <div className="mt-14 text-center">
              <MagneticButton>
                <Link
                  href="/portfolio"
                  className="glow-hover inline-flex items-center gap-2.5 rounded-lg bg-white px-6 py-3 sm:px-8 sm:py-3.5 text-sm font-semibold tracking-wide text-[#0E1850]"
                >
                  View Full Portfolio
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </MagneticButton>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Contact Form */}
      <section className="relative overflow-hidden bg-background py-12 sm:py-16 lg:py-20">
        {/* Single slow ambient glow */}
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-purple/[0.06] blur-[100px]" />
        <FloatingParticles count={8} />

        <div className="relative mx-auto max-w-4xl px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-8 sm:mb-12">
              <SectionLabel>Get Started</SectionLabel>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                <span className="text-white">Ready to </span>
                <span className="rainbow-shimmer">Elevate</span>
                <br />
                <span className="text-white gradient-underline">Your Brand?</span>
              </h2>
              <div className="mt-5 text-base sm:text-lg text-white/40">
                <TextReveal
                  text="Let's create something extraordinary together. Fill out the form below for a free consultation and custom quote."
                  delay={0.3}
                  staggerDelay={0.04}
                />
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={0.15}>
            <div className="rounded-xl border border-purple/10 bg-purple/[0.03] p-6 sm:p-8 lg:p-10">
              <ContactForm />
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
