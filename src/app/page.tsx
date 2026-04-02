import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
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
import { FAQ } from "@/components/faq";
import { images } from "@/lib/images";

const FloatingParticles = dynamic(() =>
  import("@/components/floating-particles").then(
    (mod) => mod.FloatingParticles
  )
);

const ScrollCards3D = dynamic(() =>
  import("@/components/scroll-cards-3d").then((mod) => mod.ScrollCards3D)
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
    title: "Social Media",
    description:
      "Social media is essential if you're looking to stand out in a competitive market. It builds trust and credibility, creates a consistent and memorable identity, and showcases your unique value proposition.",
    image: "/images/dark-home-office.jpg",
    glow: "-bottom-10 -right-10 bg-purple/25",
    objectPosition: "center 30%",
  },
  {
    number: "02",
    icon: Home,
    title: "Real Estate",
    description:
      "Listing videos and pictures, drone shots, 3D tours and more. Professional photography, editing and content to sell homes faster.",
    image: "/images/marble-kitchen-dining.jpg",
    glow: "-top-10 -left-10 bg-sky-500/20",
  },
  {
    number: "03",
    icon: Video,
    title: "Commercial",
    description:
      "Cinema quality videography for businesses of all types. Have an idea? Let's connect and make it happen.",
    image: "/images/twilight-wooded-exterior.jpg",
    glow: "-bottom-10 left-1/3 bg-indigo-400/20",
    objectPosition: "center 60%",
  },
];

const brandingBenefits = [
  "Stay top of mind in your market",
  "Build a personal brand people trust",
  "Get more inbound leads instead of chasing them",
  "Create authority so clients choose you over competitors",
  "Turn views into conversations and conversations into deals",
];

const photos = [
  { image: "/images/lakefront-sunset-living.jpg", alt: "Lakefront living room at sunset", colSpan: "col-span-2 row-span-2" },
  { image: "/images/aerial-lakefront.jpg", alt: "Aerial view of lakefront property", colSpan: "" },
  { image: "/images/luxury-estate-night.jpg", alt: "Luxury estate at night", colSpan: "" },
  { image: "/images/staged-master-bedroom.jpg", alt: "Staged master bedroom with lake view", colSpan: "" },
  { image: "/images/stone-ranch-exterior.jpg", alt: "Stone ranch estate exterior", colSpan: "" },
];

export default function HomePage() {
  return (
    <>
      <VideoHero />

      {/* Stats Bar */}
      <section className="bg-background relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple/[0.1] blur-[80px]" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-sky-500/[0.07] blur-[60px]" />

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:gap-8 px-5 sm:px-6 py-8 sm:py-14 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <AnimateOnScroll key={stat.label} animation="fade-up" delay={i * 0.15}>
              <div className="relative text-center rounded-xl p-3 sm:p-4 ">
                <p className="font-heading text-3xl font-bold sm:text-5xl text-white">
                  <Counter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    duration={2.5}
                  />
                </p>
                <p className="mt-2 text-sm tracking-wide text-white/50">
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
      <div className="section-sep" />

      {/* Services */}
      <section className="section-blend isolate bg-background py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-purple/[0.05] blur-[80px]" />
        <div className="absolute right-[15%] bottom-[10%] h-48 w-48 rounded-full bg-sky-500/[0.05] blur-[80px] sm:blur-[100px]" />
        <div className="absolute right-[8%] top-[15%] h-32 w-32 rounded-full border border-dashed border-purple/[0.08] spin-ring hidden lg:block" />
        <FloatingParticles count={10} className="hidden sm:block" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6">
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

          <div className="mt-8 sm:mt-16 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
            {services.map((service, i) => (
              <AnimateOnScroll key={service.title} animation="fade-up" delay={i * 0.12}>
                <div className="card-3d-enhanced relative z-10 h-full">
                  <Link
                    href="/services"
                    className="card-shine group relative flex h-full flex-col rounded-2xl border border-purple/20 bg-gradient-to-br from-purple/[0.12] via-black to-purple-light/[0.06] overflow-hidden transition-all duration-300 hover:border-purple/40 hover:shadow-[0_0_40px_rgba(43,111,184,0.2)]"
                  >
                    <div className={`pointer-events-none absolute h-32 w-32 rounded-full blur-[60px] transition-all duration-300 group-hover:opacity-80 ${service.glow}`} />
                    {/* Image */}
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        style={service.objectPosition ? { objectPosition: service.objectPosition } : undefined}
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/30 to-transparent" />
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
                    <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
                      <h3 className="font-heading text-xl font-semibold text-white lg:text-2xl">
                        {service.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-white/60 transition-colors group-hover:text-white/75">
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

          <div className="mt-8 text-center md:hidden">
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
      <div className="section-sep" />

      {/* Portfolio */}
      <section className="section-blend py-12 sm:py-16 lg:py-20 relative overflow-hidden bg-background">
        <div className="absolute inset-0 gradient-mesh-warm" />
        <div className="absolute right-[5%] top-[10%] h-48 w-48 rounded-full bg-purple/[0.07] blur-[80px] sm:blur-[100px]" />
        <div className="absolute left-[8%] bottom-[15%] h-36 w-36 rounded-full bg-indigo-500/[0.06] blur-[60px] sm:blur-[80px]" />
        <div className="absolute left-[12%] top-[20%] h-24 w-24 rounded-full border border-dashed border-white/[0.04] spin-ring hidden xl:block" />
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="mx-auto max-w-2xl text-center">
              <SectionLabel>Our Work</SectionLabel>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                <span className="text-white">Featured Photos</span>
              </h2>
              <p className="mt-4 text-white/60">
                A glimpse of the professional media we&apos;ve captured for our
                clients across Wisconsin.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Bento-style grid */}
          <AnimateOnScroll animation="fade-in-scale" delay={0.2}>
            <div className="mt-10 sm:mt-16 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:grid-rows-2">
              {photos.map((photo) => (
                <div
                  key={photo.alt}
                  className={`group relative overflow-hidden rounded-xl bg-navy-light transition-all duration-500 hover:shadow-[0_0_30px_rgba(55,140,210,0.15)] ${photo.colSpan} ${
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={0.3}>
            <div className="mt-10 sm:mt-14 text-center">
              <MagneticButton>
                <Link
                  href="/portfolio"
                  className="relative z-10 inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-sm font-semibold tracking-wide text-black transition-all duration-200 hover:bg-[#f0f0f0]"
                >
                  View Full Portfolio
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </MagneticButton>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
      <div className="section-sep" />

      {/* Packages – 3D scroll fan */}
      <ScrollCards3D />
      <div className="section-sep" />

      {/* Content Creator Program */}
      <section className="section-blend relative overflow-hidden bg-background py-12 sm:py-16 lg:py-20">
        <div className="absolute right-[10%] top-[20%] h-64 w-64 rounded-full bg-purple/[0.06] blur-[80px] sm:blur-[100px]" />
        <div className="absolute left-[5%] bottom-[15%] h-40 w-40 rounded-full bg-sky-500/[0.05] blur-[60px] sm:blur-[80px]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <AnimateOnScroll animation="fade-up">
              <div>
                <SectionLabel>Content Creator Program</SectionLabel>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                  Grow Your{" "}
                  <span className="text-purple-light">Personal Brand</span>
                </h2>
                <p className="mt-4 text-white/60">
                  A monthly program built around consistency, strategy, and
                  results. We handle strategy, filming, editing, and coaching —
                  you show up and be yourself.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <MagneticButton>
                    <Link
                      href="/services"
                      className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-purple-dim to-purple px-7 py-3.5 text-sm font-semibold tracking-wide text-white ring-1 ring-purple/40 shadow-[0_0_15px_rgba(43,111,184,0.25)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(43,111,184,0.4)]"
                    >
                      Learn More
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </MagneticButton>
                  <span className="text-sm text-white/40">
                    Starting at $1,500/mo
                  </span>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={0.15}>
              <div className="rounded-2xl glass-card p-6 sm:p-8">
                <ul className="space-y-4">
                  {brandingBenefits.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-white/70 sm:text-base"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-light" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm font-semibold text-white">
                  When you win, we win.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
      <div className="section-sep" />

      {/* Client Portals */}
      <section id="portals" className="relative overflow-hidden bg-black py-16 sm:py-28">
        <div className="absolute inset-0 gradient-mesh-rich" />
        <div className="pointer-events-none absolute left-1/4 top-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-purple/[0.06] blur-[120px]" />
        <div className="pointer-events-none absolute right-1/4 top-1/3 h-[250px] w-[250px] rounded-full bg-sky-500/[0.04] blur-[100px]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-full max-w-5xl -translate-x-1/2 bg-gradient-to-r from-transparent via-purple/30 to-transparent" />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center">
              <SectionLabel>Book Now</SectionLabel>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white md:text-5xl">
                Ready to Get Started?
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-base text-white/60 sm:text-lg">
                Choose your region to book a session, view galleries, and manage
                your projects.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={0.15}>
          <div className="mt-10 sm:mt-12 grid gap-4 sm:gap-5 sm:grid-cols-2">
              <a
                href="https://portal.spiro.media/order/pg/northeast-wisconsin"
                target="_blank"
                rel="noopener noreferrer"
                className="card-shine border-trace group relative block overflow-hidden rounded-2xl border border-purple/20 bg-gradient-to-br from-purple/[0.12] via-black to-purple-light/[0.06] p-6 sm:p-8 transition-all duration-300 hover:border-purple/40 hover:shadow-[0_0_40px_rgba(43,111,184,0.2)]"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple/20 blur-[60px] transition-all duration-300 group-hover:bg-purple/30" />
                <p className="relative text-xs font-medium uppercase tracking-[0.2em] text-purple-light">
                  Northeast Wisconsin
                </p>
                <p className="relative mt-2 text-xl sm:text-2xl font-bold text-white">
                  Green Bay Portal
                </p>
                <p className="relative mt-2 text-sm text-white/50">
                  Green Bay, Fox Valley &amp; surrounding areas
                </p>
                <div className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Book a Session
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </a>
              <a
                href="https://portal.spiro.media/order/pg/madison"
                target="_blank"
                rel="noopener noreferrer"
                className="card-shine border-trace group relative block overflow-hidden rounded-2xl border border-purple/20 bg-gradient-to-br from-purple-light/[0.08] via-black to-purple/[0.1] p-6 sm:p-8 transition-all duration-300 hover:border-purple/40 hover:shadow-[0_0_40px_rgba(43,111,184,0.2)]"
              >
                <div className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-purple-light/15 blur-[60px] transition-all duration-300 group-hover:bg-purple-light/25" />
                <p className="relative text-xs font-medium uppercase tracking-[0.2em] text-purple-light">
                  South-Central Wisconsin
                </p>
                <p className="relative mt-2 text-xl sm:text-2xl font-bold text-white">
                  Madison Portal
                </p>
                <p className="relative mt-2 text-sm text-white/50">
                  Madison, Dane County &amp; surrounding areas
                </p>
                <div className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Book a Session
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </a>
          </div>
          </AnimateOnScroll>
        </div>
      </section>
      <div className="section-sep" />

      {/* Contact Form */}
      <section className="section-blend isolate relative overflow-hidden bg-background py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-purple/[0.08] blur-[100px]" />
        <div className="absolute right-[10%] top-[20%] h-[200px] w-[200px] rounded-full bg-sky-500/[0.06] blur-[60px] sm:blur-[80px]" />
        <div className="absolute left-[5%] bottom-[10%] h-[150px] w-[150px] rounded-full bg-indigo-400/[0.05] blur-[50px] sm:blur-[70px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-8 sm:mb-12">
              <SectionLabel>Get Started</SectionLabel>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                <span className="text-white">Ready to </span>
                <span className="rainbow-shimmer">Elevate</span>
                <br />
                <span className="text-white">Your Brand?</span>
              </h2>
              <div className="mt-5 text-base sm:text-lg text-white/60">
                <TextReveal
                  text="Let's create something extraordinary together. Fill out the form below for a free consultation and custom quote."
                  delay={0.3}
                  staggerDelay={0.04}
                />
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={0.15}>
            <div className="relative z-10 rounded-2xl border border-purple/20 bg-gradient-to-br from-purple/[0.12] via-black to-purple-light/[0.06] p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:border-purple/40 hover:shadow-[0_0_40px_rgba(43,111,184,0.2)]">
              <ContactForm />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </>
  );
}
