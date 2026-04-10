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
    objectPosition: "center 45%",
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
      "Media for businesses of all types. Have an idea? Let's connect and make it happen.",
    image: "/images/twilight-wooded-exterior.jpg",
    glow: "-bottom-10 left-1/3 bg-indigo-400/20",
    objectPosition: "center 40%",
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
  { image: "/images/fireplace-living.jpg", alt: "Modern linear fireplace living room", colSpan: "col-span-2 row-span-2" },
  { image: "/images/marble-chef-kitchen.jpg", alt: "Marble chef kitchen", colSpan: "" },
  { image: "/images/modern-entryway.jpg", alt: "Modern home entryway", colSpan: "" },
  { image: "/images/luxury-living-room.jpg", alt: "Open-concept living room with vaulted ceiling", colSpan: "" },
  { image: "/images/pendant-kitchen.jpg", alt: "Kitchen detail and backsplash", colSpan: "" },
];

export default function HomePage() {
  return (
    <>
      <VideoHero />

      <div className="relative">
      {/* Stats Bar */}
      <section className="relative overflow-x-clip">
        <div className="absolute inset-0 dot-grid pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)' }} />

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


      {/* Services */}
      <section className="isolate py-12 sm:py-16 lg:py-20 relative overflow-x-clip">


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


      {/* Portfolio */}
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-x-clip">

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


      {/* Packages – 3D scroll fan */}
      <ScrollCards3D />


      {/* Content Creator Program */}
      <section className="relative overflow-x-clip py-12 sm:py-16 lg:py-20">
        <div className="absolute right-[10%] top-[20%] h-64 w-64 rounded-full bg-purple/[0.06] blur-[100px]" />
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
                <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-purple-light/70">
                  What You Get
                </p>
                <ul className="space-y-5">
                  {brandingBenefits.map((item, i) => (
                    <li
                      key={item}
                      className="flex items-center gap-4 text-sm text-white/70 sm:text-base"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple/15 text-xs font-semibold text-purple-light/80">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 border-t border-white/[0.06] pt-6">
                  <p className="text-center text-sm font-semibold text-white">
                    When you win, we win.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>


      {/* Client Portals */}
      <section id="portals" className="relative overflow-x-clip py-16 sm:py-28">

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
                className="card-shine border-trace group relative block overflow-hidden rounded-2xl border border-purple/30 bg-gradient-to-br from-purple/[0.12] via-[#020810]/90 to-purple-light/[0.05] p-8 sm:p-10 transition-all duration-300 hover:border-purple/45 hover:shadow-[0_0_40px_rgba(43,111,184,0.25)]"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple/15 blur-[60px] transition-all duration-300 group-hover:bg-purple/25" />
                {/* Wisconsin state outline */}
                <svg className="pointer-events-none absolute right-4 top-4 h-28 w-28 sm:h-32 sm:w-32 text-white/[0.07]" viewBox="0 0 520 530" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M10,75 L15,70 L25,60 L30,50 L40,42 L55,38 L65,35 L75,30 L90,28 L105,22 L120,18 L135,15 L150,12 L160,8 L170,5 L180,3 L190,5 L195,10 L200,18 L210,20 L225,18 L235,14 L250,10 L258,6 L262,2 L268,5 L270,12 L266,18 L268,25 L275,22 L285,18 L295,15 L310,18 L320,20 L340,22 L355,20 L365,22 L370,28 L368,35 L362,40 L358,48 L362,55 L368,60 L375,55 L382,48 L390,42 L400,36 L408,30 L415,28 L420,32 L418,40 L412,50 L408,60 L410,72 L415,82 L420,95 L425,108 L428,120 L425,130 L418,138 L410,135 L404,128 L398,125 L392,130 L386,140 L380,152 L375,165 L370,178 L365,192 L358,200 L350,195 L345,205 L348,218 L352,232 L355,248 L358,265 L362,282 L365,300 L362,318 L358,332 L352,345 L345,360 L338,375 L328,390 L318,405 L305,418 L290,430 L275,440 L258,448 L240,455 L222,460 L205,465 L188,468 L172,470 L158,472 L145,475 L130,478 L115,480 L100,478 L88,475 L78,480 L68,482 L55,485 L42,488 L30,490 L22,492 L18,495 L15,498 L12,500 L10,498 L8,490 L10,480 L15,468 L18,455 L15,440 L12,425 L10,408 L8,390 L6,370 L5,348 L6,325 L8,302 L10,278 L8,255 L6,230 L5,205 L6,180 L8,158 L10,138 L12,118 L10,98 Z" />
                  <circle cx="385" cy="105" r="5" fill="currentColor" opacity="0.5" />
                </svg>
                <p className="relative text-xs font-medium uppercase tracking-[0.2em] text-purple-light">
                  Northeast Wisconsin
                </p>
                <p className="relative mt-3 text-2xl sm:text-3xl font-bold text-white">
                  Green Bay Portal
                </p>
                <p className="relative mt-3 text-sm sm:text-base text-white/50">
                  Green Bay, Fox Valley &amp; surrounding areas
                </p>
                <div className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Book a Session
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </a>
              <a
                href="https://portal.spiro.media/order/pg/madison"
                target="_blank"
                rel="noopener noreferrer"
                className="card-shine border-trace group relative block overflow-hidden rounded-2xl border border-purple/30 bg-gradient-to-br from-purple-light/[0.08] via-[#020810]/90 to-purple/[0.08] p-8 sm:p-10 transition-all duration-300 hover:border-purple/45 hover:shadow-[0_0_40px_rgba(43,111,184,0.25)]"
              >
                <div className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-purple-light/15 blur-[60px] transition-all duration-300 group-hover:bg-purple-light/25" />
                {/* Wisconsin state outline */}
                <svg className="pointer-events-none absolute right-4 top-4 h-28 w-28 sm:h-32 sm:w-32 text-white/[0.07]" viewBox="0 0 520 530" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M10,75 L15,70 L25,60 L30,50 L40,42 L55,38 L65,35 L75,30 L90,28 L105,22 L120,18 L135,15 L150,12 L160,8 L170,5 L180,3 L190,5 L195,10 L200,18 L210,20 L225,18 L235,14 L250,10 L258,6 L262,2 L268,5 L270,12 L266,18 L268,25 L275,22 L285,18 L295,15 L310,18 L320,20 L340,22 L355,20 L365,22 L370,28 L368,35 L362,40 L358,48 L362,55 L368,60 L375,55 L382,48 L390,42 L400,36 L408,30 L415,28 L420,32 L418,40 L412,50 L408,60 L410,72 L415,82 L420,95 L425,108 L428,120 L425,130 L418,138 L410,135 L404,128 L398,125 L392,130 L386,140 L380,152 L375,165 L370,178 L365,192 L358,200 L350,195 L345,205 L348,218 L352,232 L355,248 L358,265 L362,282 L365,300 L362,318 L358,332 L352,345 L345,360 L338,375 L328,390 L318,405 L305,418 L290,430 L275,440 L258,448 L240,455 L222,460 L205,465 L188,468 L172,470 L158,472 L145,475 L130,478 L115,480 L100,478 L88,475 L78,480 L68,482 L55,485 L42,488 L30,490 L22,492 L18,495 L15,498 L12,500 L10,498 L8,490 L10,480 L15,468 L18,455 L15,440 L12,425 L10,408 L8,390 L6,370 L5,348 L6,325 L8,302 L10,278 L8,255 L6,230 L5,205 L6,180 L8,158 L10,138 L12,118 L10,98 Z" />
                  <circle cx="240" cy="350" r="5" fill="currentColor" opacity="0.5" />
                </svg>
                <p className="relative text-xs font-medium uppercase tracking-[0.2em] text-purple-light">
                  South-Central Wisconsin
                </p>
                <p className="relative mt-3 text-2xl sm:text-3xl font-bold text-white">
                  Madison Portal
                </p>
                <p className="relative mt-3 text-sm sm:text-base text-white/50">
                  Madison, Dane County &amp; surrounding areas
                </p>
                <div className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Book a Session
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </a>
          </div>
          </AnimateOnScroll>
        </div>
      </section>


      {/* Contact Form */}
      <section className="isolate relative overflow-x-clip py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 dot-grid pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)' }} />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-purple/[0.06] blur-[120px]" />

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
      </div>
    </>
  );
}
