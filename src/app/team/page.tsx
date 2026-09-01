import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";

import { images } from "@/lib/images";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { RuleHead } from "@/components/rule-head";

export const revalidate = 3600;

export const metadata: Metadata = {
  ...pageMetadata({
    title: "About | Meet The Team",
    description:
      "Meet the photographers, videographers, and creatives behind PG Creatives. Based in Green Bay and Madison, Wisconsin, delivering professional-grade media.",
    path: "/team",
    image: "/og-team.jpg",
    imageAlt: "The PG Creatives team",
  }),
  keywords: [
    "PG Creatives team",
    "Wisconsin photographers",
    "Green Bay videographer",
    "Madison media company",
    "professional creatives",
  ],
};

const team = [
  {
    name: "Michael McIntee",
    role: "Founder",
    image: images.michaelMcintee,
  },
  {
    name: "Isaiah Bastian",
    role: "Lead Creative (Madison)",
    image: images.isaiahBastian,
  },
  {
    name: "Brenden Gruber",
    role: "Brand Development",
    image: images.brendenGruber,
  },
  {
    name: "Liam Janowski",
    role: "Creative Specialist (Green Bay)",
    image: images.liamJanowski,
  },
  {
    name: "Calvin Lee",
    role: "Creative Specialist (Appleton)",
    image: images.calvinLee,
  },
  {
    name: "Diether Ryan Ybañez",
    role: "Senior Video Editor",
    image: images.ryanYbanez,
  },
  {
    name: "Lyle Alquilos",
    role: "Video Editor",
    image: images.lyleAlquilos,
  },
  {
    name: "Claudio Ondoy Jr",
    role: "Video Editor",
    image: images.claudioOndoyJr,
  },
  {
    name: "Gvy Teleron",
    role: "Video Editor",
    image: images.gvyTeleron,
  },
  {
    name: "Charlibeth Sicad",
    role: "Administrative Coordinator",
    image: images.charlibethSicad,
  },
];

/* The four values used to carry four different accent colors — blue, purple,
   amber, teal — with matching gradient icon tiles. None of them appears
   anywhere else on the site, so the section read as a component borrowed from
   a different product. They are the same kind of thing, so they now look like
   the same kind of thing, and the numbering carries what the color was
   pretending to. */
const values = [
  {
    title: "Quality first",
    description:
      "We never compromise on quality. Every shot, every frame, every edit meets our professional standards.",
  },
  {
    title: "Client focused",
    description:
      "Your vision drives our work. We listen, collaborate, and deliver media that exceeds expectations.",
  },
  {
    title: "Fast turnaround",
    description:
      "Time matters in real estate and business. We deliver polished content quickly, without sacrificing quality.",
  },
  {
    title: "Local expertise",
    description:
      "We know Wisconsin. From lakefront properties to downtown businesses, we understand what resonates here.",
  },
];

export default function TeamPage() {
  return (
    <>
      {/* ── Page head ────────────────────────────────────────────────────
          No section background of its own. The old hero painted two radial
          gradients that stopped dead at the section boundary, leaving a
          visible horizontal seam across the page. */}
      <section className="section-tight pt-14 sm:pt-20">
        <div className="shell">
          <RuleHead label="About" link={{ href: "/contact", label: "Work with us" }} />
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
            <h1 className="display-1 text-white">
              The creatives behind the scenes.
            </h1>
            <p className="lede lg:pb-3">
              A growing group of photographers, editors, and content strategists
              working across Green Bay, Madison, Appleton, and the Fox Valley.
            </p>
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <h2 className="sr-only">Meet the team</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {team.map((member, index) => (
              <AnimateOnScroll key={member.name} animation="fade-up" delay={index * 0.06}>
                <div className="group relative overflow-hidden rounded-2xl border border-line bg-surface">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                    {/* A deeper, longer scrim than the old half-height one: the
                        headshots vary wildly in exposure, and a light background
                        behind a name in white is unreadable. */}
                    <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#07090c] via-[#07090c]/80 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <h3 className="text-sm font-semibold text-white sm:text-base">{member.name}</h3>
                      <p className="meta mt-1.5">{member.role}</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder's letter ─────────────────────────────────────────────
          Left-aligned. Four centered paragraphs of body copy is the hardest
          shape to read on a page — every line starts in a different place. */}
      <section className="section">
        <div className="shell">
          <AnimateOnScroll animation="rise">
            <RuleHead label="From the founder" />
          </AnimateOnScroll>
          <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <AnimateOnScroll animation="fade-up">
              <div className="lg:sticky lg:top-28">
                <h2 className="display-2 text-white">When you win, we win.</h2>
                <p className="meta mt-6">Michael McIntee / Founder</p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={0.1}>
              <div className="space-y-6 text-base leading-relaxed text-ink-2 sm:text-lg">
                <p>
                  I started PG Creatives at 19 years old with a simple goal —
                  create better media for real estate and help agents stand out
                  in a crowded market. What began as just me with a camera has
                  grown into a full team working with hundreds of agents, and
                  continuing to raise the standard of what real estate content
                  should look like.
                </p>
                <p>
                  From the beginning, this was never just about photos and
                  videos. It was about helping agents build a brand, get
                  attention online, and create real opportunities through their
                  content. As we have grown, that mindset has never changed.
                </p>
                <p>
                  We take pride in being reliable, fast, and detail-focused. But
                  more than anything, we care about the people we work with.
                  Every project is approached as a partnership. We are not just
                  there to shoot a listing. We are there to help you create
                  content that represents who you are and moves your business
                  forward.
                </p>
                <p className="text-white">
                  When you work with PG Creatives, you are not just hiring a
                  media company. You are working with a team that is invested in
                  your success.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <AnimateOnScroll animation="rise">
            <RuleHead label="How we work" />
            <h2 className="display-2 mt-8 max-w-xl text-white">What drives us.</h2>
          </AnimateOnScroll>

          <dl className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <AnimateOnScroll
                key={value.title}
                animation="fade-up"
                delay={i * 0.08}
                className="flex h-full flex-col bg-surface p-7"
              >
                <dt>
                  <span className="meta meta-signal">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-5 block text-base font-semibold text-white">
                    {value.title}
                  </span>
                </dt>
                <dd className="mt-2.5 text-sm leading-relaxed text-ink-2">{value.description}</dd>
              </AnimateOnScroll>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
