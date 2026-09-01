import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { VideoHero } from "@/components/video-hero";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { ContactForm } from "@/components/contact-form";
import { RuleHead } from "@/components/rule-head";
import { Counter } from "@/components/counter";
import { FAQ, faqs } from "@/components/faq";
import { Packages } from "@/components/packages";

const stats = [
  { value: 3, prefix: "$", suffix: "B", label: "In real estate captured" },
  { value: 2, suffix: "m+", label: "Views generated" },
  { value: 150, suffix: "k+", label: "Photos and videos delivered" },
];

/* Each card now links to the thing it names. All three used to point at
   /services, which was the Content Creator Program page — so an agent who
   clicked "Real Estate" landed on a page about personal branding. */
const services = [
  {
    title: "Real estate",
    href: "/services#real-estate",
    meta: "Listings",
    description:
      "Photography, listing video, drone, and 3D tours — everything a listing needs to go live looking its best.",
    image: "/images/marble-kitchen-dining.jpg",
  },
  {
    title: "Commercial",
    href: "/services#commercial",
    meta: "Business",
    description:
      "Media for businesses of every kind. Brand films, interiors, product, and the stills that go with them.",
    image: "/images/twilight-wooded-exterior.jpg",
    objectPosition: "center 40%",
  },
  {
    title: "Personal brand",
    href: "/services/content-creator-program",
    meta: "Monthly program",
    description:
      "A monthly content program that keeps you visible in your market between listings. Strategy, filming, editing, coaching.",
    image: "/images/dark-home-office.jpg",
    objectPosition: "center 45%",
  },
];

/* The bento. Captions carry what the shot actually is, set as camera
   metadata — the old grid had no captions at all, so five interiors read as
   one undifferentiated wall of house. */
const photos = [
  {
    image: "/images/luxury-estate-night.jpg",
    alt: "Modern estate photographed from the air after dark",
    caption: "Modern estate, after dark",
    meta: "Drone / twilight",
    className: "sm:col-span-2 sm:row-span-2",
  },
  { image: "/images/fireplace-living.jpg", alt: "Living room with a linear fireplace", caption: "Linear fireplace", meta: "Interior" },
  { image: "/images/aerial-lakefront.jpg", alt: "Lakefront homes photographed from the air", caption: "Lakefront estate", meta: "Drone" },
  { image: "/images/lakefront-screened-porch.jpg", alt: "Screened porch with a vaulted wood ceiling over the water", caption: "Screened porch", meta: "Interior" },
  { image: "/images/golf-simulator-room.jpg", alt: "Indoor golf simulator room", caption: "Golf simulator", meta: "Amenity" },
];

const brandingBenefits = [
  "Stay top of mind in your market",
  "Build a personal brand people trust",
  "Get inbound leads instead of chasing them",
  "Build authority so clients pick you first",
  "Turn views into conversations, and conversations into deals",
];

const portals = [
  {
    region: "Northeast Wisconsin",
    name: "Green Bay",
    areas: "Green Bay, Fox Valley and surrounding areas",
    href: "https://portal.spiro.media/order/pg/northeast-wisconsin",
  },
  {
    region: "South-central Wisconsin",
    name: "Madison",
    areas: "Madison, Dane County and surrounding areas",
    href: "https://portal.spiro.media/order/pg/madison",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <VideoHero />

      {/* ── Track record ──────────────────────────────────────────────────
          A hairline-bounded strip rather than three floating numbers. It
          reads as one row of evidence and takes a fraction of the height. */}
      <section className="section-tight">
        <div className="shell">
          <dl className="grid grid-cols-1 divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((stat, i) => (
              <AnimateOnScroll
                key={stat.label}
                animation="fade-up"
                delay={i * 0.1}
                className="flex flex-col-reverse px-0 py-7 sm:px-8 sm:py-9"
              >
                <dt className="meta mt-3">{stat.label}</dt>
                <dd className="display-2 !text-[clamp(2.25rem,4vw,3.25rem)] text-white">
                  <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} duration={2} />
                </dd>
              </AnimateOnScroll>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <AnimateOnScroll animation="rise">
            <RuleHead label="What we do" link={{ href: "/services", label: "All services" }} />
            <h2 className="display-2 mt-8 max-w-2xl text-white">
              Three ways we put your work in front of people.
            </h2>
          </AnimateOnScroll>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 md:grid-cols-3">
            {services.map((service, i) => (
              <AnimateOnScroll key={service.title} animation="fade-up" delay={i * 0.1} className="h-full">
                <Link
                  href={service.href}
                  className="surface surface-interactive group flex h-full flex-col overflow-hidden"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      style={service.objectPosition ? { objectPosition: service.objectPosition } : undefined}
                      sizes="(min-width: 1360px) 400px, (min-width: 768px) 31vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1319] via-[#0f1319]/25 to-transparent" />
                    <p className="meta absolute bottom-4 left-5">{service.meta}</p>
                  </div>

                  <div className="flex flex-1 flex-col p-6 lg:p-7">
                    <h3 className="display-3 text-white">{service.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-2">
                      {service.description}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-signal">
                      Learn more
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Selected work ────────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <AnimateOnScroll animation="rise">
            <RuleHead label="Selected work" link={{ href: "/portfolio", label: "Full portfolio" }} />
            <h2 className="display-2 mt-8 max-w-2xl text-white">
              Every listing, in its best light.
            </h2>
          </AnimateOnScroll>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:mt-16 sm:grid-cols-4 sm:grid-rows-2">
            {photos.map((photo, i) => (
              <AnimateOnScroll
                key={photo.alt}
                animation="fade-in-scale"
                delay={i * 0.07}
                className={`viewfinder group relative overflow-hidden rounded-xl bg-surface ${
                  photo.className ?? ""
                } ${photo.className ? "aspect-square sm:aspect-auto" : "aspect-[4/3]"}`}
              >
                <span className="vf-b" aria-hidden="true" />
                <Image
                  src={photo.image}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes={
                    photo.className
                      ? "(min-width: 1360px) 600px, (min-width: 640px) 47vw, 100vw"
                      : "(min-width: 1360px) 300px, (min-width: 640px) 23vw, 50vw"
                  }
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07090c]/90 to-transparent p-4 pt-10 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
                  <p className="meta meta-signal">{photo.meta}</p>
                  <p className="mt-1 text-sm font-medium text-white">{photo.caption}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packages ─────────────────────────────────────────────────────── */}
      <Packages />

      {/* ── Content Creator Program ──────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <AnimateOnScroll animation="rise">
            <RuleHead
              label="Content Creator Program"
              link={{ href: "/services/content-creator-program", label: "Program details" }}
            />
          </AnimateOnScroll>

          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:items-start lg:gap-16">
            <AnimateOnScroll animation="fade-up">
              <div>
                <h2 className="display-2 text-white">
                  Grow the brand, not just the listing.
                </h2>
                <p className="lede mt-6 max-w-lg">
                  A monthly program built around consistency, strategy, and
                  results. We handle strategy, filming, editing, and coaching —
                  you show up and be yourself.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-5">
                  <Link href="/services/content-creator-program" className="btn btn-primary">
                    See how it works
                    <ArrowRight className="arrow h-4 w-4" />
                  </Link>
                  <p className="text-sm text-ink-3">From $1,500 a month</p>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={0.12}>
              <div className="surface p-7 sm:p-9">
                <p className="meta">What you get</p>
                <ul className="mt-6">
                  {brandingBenefits.map((item) => (
                    <li
                      key={item}
                      className="flex items-baseline gap-4 border-b border-line py-4 text-[0.9375rem] text-ink-2 last:border-b-0"
                    >
                      <span className="text-signal" aria-hidden="true">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-7 text-sm font-semibold text-white">
                  When you win, we win.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── Start a project ──────────────────────────────────────────────────
          One closing section, not three. The old page ended with a portals
          block headed "Ready to Get Started?", then a form headed "Ready to
          Elevate Your Brand?", then the FAQ — three closes in a row, each
          asking for the same thing. Booking a session and asking a question
          are the two real paths, so they sit side by side under one head. */}
      <section id="book" className="section scroll-mt-20">
        <div className="shell">
          <AnimateOnScroll animation="rise">
            <RuleHead label="Start a project" />
            <h2 className="display-2 mt-8 max-w-2xl text-white">
              Book a shoot, or tell us what you need.
            </h2>
          </AnimateOnScroll>

          <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2">
            {portals.map((portal, i) => (
              <AnimateOnScroll key={portal.name} animation="fade-up" delay={i * 0.1} className="h-full">
                <a
                  href={portal.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="surface surface-interactive group relative flex h-full flex-col overflow-hidden p-7 sm:p-9"
                >
                  {/* The state outline, moved out from behind the text. It used
                      to sit at 30% opacity directly over the portal name. */}
                  <Image
                    src="/images/wisconsin-outline.png"
                    alt=""
                    width={128}
                    height={137}
                    className="pointer-events-none absolute -right-6 -top-4 h-36 w-auto opacity-[0.06] invert transition-opacity duration-500 group-hover:opacity-[0.11]"
                  />
                  <p className="meta relative">{portal.region}</p>
                  <p className="display-2 relative mt-4 !text-[clamp(1.75rem,3vw,2.5rem)] text-white">
                    {portal.name}
                  </p>
                  <p className="relative mt-3 flex-1 text-sm text-ink-2">{portal.areas}</p>
                  <span className="btn btn-solid relative mt-8 self-start !py-3 !text-sm">
                    Book a session
                    <ArrowUpRight className="arrow h-4 w-4" />
                  </span>
                </a>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll animation="fade-up" delay={0.15}>
            <div className="surface mt-4 p-6 sm:p-9 lg:p-12">
              <div className="max-w-lg">
                <p className="meta">Not sure which package?</p>
                <p className="mt-3 text-lg text-ink-2">
                  Send us the details and we&apos;ll come back with a quote and a
                  recommendation — usually the same day.
                </p>
              </div>
              <div className="mt-9">
                <ContactForm />
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <FAQ />
    </>
  );
}
