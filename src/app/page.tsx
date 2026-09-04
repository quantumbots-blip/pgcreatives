import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { VideoHero } from "@/components/video-hero";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { ContactForm } from "@/components/contact-form";
import { Tilt } from "@/components/tilt";
import { Marquee } from "@/components/marquee";
import { ProgramShowcaseDeck, ProgramShowcaseStages } from "@/components/program-showcase";
import { DisplayLines } from "@/components/display-lines";
import { SectionHead } from "@/components/section-head";
import { Counter } from "@/components/counter";
import { FAQ, faqs } from "@/components/faq";
import { Packages } from "@/components/packages";

const stats = [
  { value: 3, prefix: "$", suffix: "B", label: "In real estate captured" },
  { value: 2, suffix: "m+", label: "Views generated" },
  { value: 150, suffix: "k+", label: "Photos and videos delivered" },
];

/* Each card now links to the thing it names. All three used to point at
   /services, which was the Content Creator Program page, so an agent who
   clicked "Real Estate" landed on a page about personal branding. */
const services = [
  {
    title: "Real estate",
    href: "/services#real-estate",
    meta: "Listings",
    description:
      "Photography, listing video, drone, and 3D tours. Everything a listing needs to go live looking its best.",
    image: "/images/marble-kitchen-dining.jpg",
  },
  {
    title: "Commercial",
    href: "/services#commercial",
    meta: "Business",
    description:
      "Media for businesses outside real estate. Interiors, facilities, brand film, and the stills that go with them.",
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

/* The bento, showing the five frames the old site featured here, in the
   order it ran them: the linear fireplace as the 2x2, then the marble
   kitchen, the entryway, the vaulted great room and the pendant kitchen.
   Verified against the files themselves, not their names — several images in
   this folder are named after something they do not depict.

   The captions stay. The old grid had none, so five interiors read as one
   undifferentiated wall of house. */
const photos = [
  {
    image: "/images/fireplace-living.jpg",
    alt: "Dining area beside a fluted linear fireplace under a round wood clock",
    caption: "Linear fireplace",
    meta: "Interior",
    className: "sm:col-span-2 lg:row-span-2",
  },
  {
    image: "/images/marble-chef-kitchen.jpg",
    alt: "Chef kitchen with a book-matched marble backsplash and waterfall island",
    caption: "Marble chef kitchen",
    meta: "Interior / kitchen",
  },
  {
    image: "/images/modern-entryway.jpg",
    alt: "Entryway with a patterned runner leading to black double doors",
    caption: "Modern entryway",
    meta: "Interior",
  },
  {
    image: "/images/luxury-living-room.jpg",
    alt: "Open-concept great room under a vaulted ceiling with exposed white trusses",
    caption: "Vaulted great room",
    meta: "Interior",
  },
  {
    image: "/images/pendant-kitchen.jpg",
    alt: "Kitchen island with globe pendants, a wood range hood and cane barstools",
    caption: "Pendant kitchen",
    meta: "Interior / kitchen",
  },
];

/* The two booking portals.

   `pin` is the city's real position over the state outline, as a percentage
   of the artwork's box. Derived, not eyeballed: the outline fills the PNG
   edge to edge (measured: opaque pixels span 0-511 x 1-548 of a 512x549
   file), so a percentage maps straight onto Wisconsin's bounding box —
   47.0808N to 42.4919N, 92.8893W to 86.8050W, the last being the Door
   Peninsula rather than the state's water boundary, which is what the
   artwork actually draws.

   The projection checks out: compressing longitude by cos(44.8), as every
   conic projection does, gives an aspect of 0.941 against the file's 0.933.
   Plain equirectangular would be 1.326, so the artwork is projected and the
   linear mapping below holds.

     Green Bay  44.5192N  88.0198W  ->  80.0%, 55.8%
     Madison    43.0731N  89.4012W  ->  57.3%, 87.3% */
const portals = [
  {
    region: "Northeast Wisconsin",
    name: "Green Bay",
    areas: "Green Bay, Fox Valley and surrounding areas",
    href: "https://portal.spiro.media/order/pg/northeast-wisconsin",
    pin: { x: "80%", y: "55.8%" },
  },
  {
    region: "South-central Wisconsin",
    name: "Madison",
    areas: "Madison, Dane County and surrounding areas",
    href: "https://portal.spiro.media/order/pg/madison",
    pin: { x: "57.3%", y: "87.3%" },
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
      <section className="pb-[calc(var(--section-y)/1.6)] pt-[calc(var(--section-y)/4)]">
        <div className="shell">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-12">
            {stats.map((stat, i) => (
              <AnimateOnScroll
                key={stat.label}
                animation="depth"
                delay={i * 0.1}
                className="flex flex-col-reverse items-center text-center"
              >
                <dt className="meta mt-3">{stat.label}</dt>
                <dd className="stat-figure display-2 !text-[clamp(2.25rem,4vw,3.25rem)]">
                  <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} duration={2} />
                </dd>
              </AnimateOnScroll>
            ))}
          </dl>
        </div>
      </section>

      {/* Sits directly under the stats so the two share one rule instead of
          closing one band and opening another. */}
      <Marquee
        items={[
          "Green Bay",
          "Listing photography",
          "Madison",
          "Drone and aerial",
          "Milwaukee",
          "3D virtual tours",
          "Fox Valley",
          "Listing video",
          "Appleton",
          "Personal brand content",
        ]}
      />

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <SectionHead
            lines={["Three ways we put your", "work in front of people."]}
            lede="Listing media for agents, production for businesses, and a monthly program for the agents who want to be known."
          />

          <div className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 sm:gap-4 md:grid-cols-3">
            {services.map((service, i) => (
              <AnimateOnScroll key={service.title} animation="depth" delay={i * 0.1} className="scene h-full">
                <Tilt className="h-full">
                {/* overflow-clip, not -hidden: `hidden` makes the card a scroll
                    container, and the drifting image inside would attach its
                    view timeline to the card instead of the viewport. */}
                <Link
                  href={service.href}
                  className="surface surface-interactive group flex h-full flex-col overflow-clip"
                >
                  <div className="drift relative aspect-[4/3] w-full overflow-hidden">
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
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-signal-ink">
                      Learn more
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
                </Tilt>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Selected work ────────────────────────────────────────────────── */}
      <section className="section relative">
        <div className="grid-rules" aria-hidden="true" />
        <div className="shell relative">
          <SectionHead
            lines={["Every listing,", "in its best light."]}
            link={{ href: "/portfolio", label: "See all the work" }}
          />

          {/* One column on phones: two columns put a 4:3 interior at 189x141,
              the listing photography this section exists to sell, shown at
              the size of a contact sheet. Two columns from 640, where the
              lead frame runs full width and the other four sit in a 2x2. The
              four-column bento waits for 1024: below that its small tiles
              measured 168x126 at 768 and 138x104 at 640. */}
          <div className="scene mt-12 grid grid-cols-1 gap-3 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
            {photos.map((photo, i) => (
              <AnimateOnScroll
                key={photo.alt}
                animation="depth"
                delay={i * 0.07}
                className={`drift viewfinder group relative overflow-hidden rounded-xl bg-surface ${
                  photo.className ?? ""
                } ${photo.className ? "aspect-[16/10] lg:aspect-auto" : "aspect-[4/3]"}`}
              >
                <span className="vf-b" aria-hidden="true" />
                <Image
                  src={photo.image}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes={
                    photo.className
                      ? "(min-width: 1360px) 600px, (min-width: 1024px) 47vw, 100vw"
                      : "(min-width: 1360px) 300px, (min-width: 1024px) 23vw, (min-width: 640px) 47vw, 100vw"
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

      {/* ── Content Creator Program ──────────────────────────────────────
          The old right-hand panel was a bordered box holding a bulleted list:
          it said "grow your brand" and showed five sentences. The five are a
          sequence, so they are drawn as one, and the reels the program
          actually delivers are shown instead of described. */}
      <section className="section relative">
        <div className="grid-rules" aria-hidden="true" />
        <div className="shell relative">

          <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-20">
            <AnimateOnScroll animation="lines">
              <div>
                <DisplayLines
                  className="display-2 text-white"
                  lines={["Grow the brand,", "not just the listing."]}
                />
                <p className="lede mt-6 max-w-lg">
                  A monthly program built around consistency, strategy, and
                  results. We handle strategy, filming, editing, and coaching.
                  You show up and be yourself.
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

            <ProgramShowcaseDeck />
          </div>

          <ProgramShowcaseStages />
        </div>
      </section>

      {/* ── Start a project ──────────────────────────────────────────────────
          One closing section, not three. The old page ended with a portals
          block headed "Ready to Get Started?", then a form headed "Ready to
          Elevate Your Brand?", then the FAQ, three closes in a row, each
          asking for the same thing. Booking a session and asking a question
          are the two real paths, so they sit side by side under one head. */}
      <section id="book" className="section relative scroll-mt-20">
        <div className="grid-rules" aria-hidden="true" />
        <div className="shell relative">
          <SectionHead
            lines={["Book a shoot, or tell", "us what you need."]}
            lede="Green Bay and Madison book online in a minute. Anything else, send the details and we quote it the same day."
          />

          <div className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 sm:gap-4">
            {portals.map((portal, i) => (
              <AnimateOnScroll key={portal.name} animation="depth" delay={i * 0.1} className="scene h-full">
                <Tilt className="h-full" max={6} lift={20}>
                <a
                  href={portal.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portal-card group relative flex h-full flex-col overflow-hidden rounded-2xl p-7 sm:p-9"
                >
                  {/* The state, with the city lit on it. The outline used to
                      sit at 6% opacity in a corner; a map nobody can read is
                      just noise on a card whose whole job is to say "we cover
                      where you are". */}
                  <span className="portal-glow" aria-hidden="true" />
                  <span className="portal-map" aria-hidden="true">
                    <Image
                      src="/images/wisconsin-outline.png"
                      alt=""
                      width={128}
                      height={137}
                      className="h-full w-auto invert"
                    />
                    <span
                      className="portal-pin"
                      style={{ left: portal.pin.x, top: portal.pin.y }}
                    />
                  </span>

                  <p className="meta meta-signal relative">{portal.region}</p>
                  <p className="display-2 relative mt-4 !text-[clamp(2rem,3.4vw,2.9rem)] text-white">
                    {portal.name}
                  </p>
                  <p className="relative mt-3 flex-1 text-sm text-ink-2">{portal.areas}</p>
                  <span className="btn btn-solid relative mt-8 self-start !py-3 !text-sm">
                    Book a session
                    <ArrowUpRight className="arrow h-4 w-4" />
                  </span>
                </a>
                </Tilt>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll animation="depth" delay={0.15}>
            <div className="surface surface-raised quote-panel mt-4 p-6 sm:p-9 lg:p-12">
              <div className="relative max-w-lg">
                <p className="meta meta-signal">Not sure which package?</p>
                {/* Was body-grey and the largest thing in the panel at once,
                    so the block had no anchor. The ask is the heading. */}
                <p className="display-3 mt-3.5 text-white">
                  Tell us about the property.
                </p>
                <p className="mt-3 text-ink-2">
                  Send the details and we&apos;ll come back with a quote and a
                  recommendation, usually the same day.
                </p>
              </div>
              <div className="relative mt-10">
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
