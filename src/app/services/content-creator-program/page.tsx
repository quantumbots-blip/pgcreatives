import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { RuleHead } from "@/components/rule-head";
import { VideoGallery } from "@/components/video-gallery";
import { getVimeoMetas } from "@/lib/vimeo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Content Creator Program",
  description:
    "A monthly content creator program for real estate agents. Strategy, filming, editing, and coaching — we handle everything so you can focus on your business.",
  keywords: [
    "content creator program",
    "real estate social media",
    "agent video content",
    "social media for realtors",
    "Wisconsin real estate marketing",
    "PG Creatives branding",
  ],
  alternates: { canonical: "/services/content-creator-program" },
  openGraph: {
    title: "Content Creator Program | PG Creatives",
    description:
      "Monthly video content built to grow your brand and win more deals.",
    url: "/services/content-creator-program",
    images: [
      {
        url: "/og-services.jpg",
        width: 1200,
        height: 630,
        alt: "PG Creatives Content Creator Program",
      },
    ],
  },
};

const showcaseVideos = [
  { vimeoId: "1163714583", title: "Agent Brand Content" },
  { vimeoId: "1164740705", title: "Social Media Reel" },
  { vimeoId: "1166726096", title: "Creator Program Spotlight" },
  { vimeoId: "1177761655", title: "Personal Brand Story" },
  { vimeoId: "1175629817", title: "Content Strategy in Action" },
  { vimeoId: "1168240392", title: "Agent Highlight Reel" },
  { vimeoId: "1127088549", title: "Brand Growth Campaign" },
  { vimeoId: "1177445392", title: "Client Success Story" },
  { vimeoId: "1174488968", title: "Content Creator Showcase" },
];

const whatWeDoItems = [
  {
    text: "Strategy and planning based on your goals and market",
  },
  {
    text: "Proven content ideas that are designed to perform",
  },
  {
    text: "Script writing tailored to your personality and style",
  },
  {
    text: "On-camera coaching so you feel confident and natural",
  },
  {
    text: "Professional filming with our team",
  },
  {
    text: "Editing that matches modern, high-performing creator-style content",
  },
];

const winItems = [
  "Stay top of mind in your market",
  "Build a personal brand people trust",
  "Get more inbound leads instead of chasing them",
  "Create authority so clients choose you over competitors",
  "Turn views into conversations and conversations into deals",
];

const tiers = [
  {
    name: "Tier 1",
    price: "$1,500",
    popular: false,
    features: [
      "4 short-form videos per month",
      "Up to 2 filming locations",
      "Initial strategy and onboarding call",
      "10% off additional listing media services",
    ],
    description:
      "This is a strong starting point for agents who want to build consistency and begin growing their presence.",
  },
  {
    name: "Tier 2",
    price: "$1,800",
    popular: true,
    features: [
      "5 short-form videos per month",
      "Up to 3 filming locations",
      "Quarterly strategy check-ins to refine and improve content",
      "15% off additional listing media services",
    ],
    description:
      "This is for agents who want to take things more seriously and increase their visibility faster.",
  },
  {
    name: "Tier 3",
    price: "$2,000",
    popular: false,
    features: [
      "6 short-form videos per month",
      "Up to 4 filming locations",
      "Priority scheduling",
      "Quarterly strategy refresh and optimization",
      "15% off additional listing media services",
    ],
    description:
      "This is for agents who want to dominate their market and stay consistently in front of their audience.",
  },
];


const differences = [
  {
    title: "Content that performs",
    body:
      "Everything we make is based on what is working in the market right now. The style, pacing, hooks, and messaging are all built to capture attention and keep people watching.",
  },
  {
    title: "Limited availability",
    body:
      "We cap how many agents we work with at a time to avoid oversaturation. You stand out instead of competing against identical content from other agents nearby.",
  },
  {
    title: "Built to win",
    body:
      "This program is about one thing — helping you grow your brand, attract more opportunities, and win more deals. When you win, we win.",
  },
];

export default async function ContentCreatorProgramPage() {
  const metas = await getVimeoMetas(showcaseVideos.map((v) => v.vimeoId));
  const videosWithThumbs = showcaseVideos.map((v) => ({
    ...v,
    thumbnail: metas[v.vimeoId]?.thumbnail,
    portrait: metas[v.vimeoId]?.portrait,
  }));

  return (
    <>
      <section className="section-tight pt-14 sm:pt-20">
        <div className="shell">
          <RuleHead label="Content Creator Program" link={{ href: "#pricing", label: "See pricing" }} />
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
            <h1 className="display-1 text-white">Content that performs.</h1>
            <p className="lede lg:pb-3">
              A monthly program built around consistency, strategy, and results
              — so you grow your brand and win more deals. From $1,500 a month.
            </p>
          </div>
        </div>
      </section>

      {/* ── The work ─────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <AnimateOnScroll animation="rise">
            <RuleHead label="The work" link={{ href: "/portfolio", label: "Full portfolio" }} />
            <h2 className="display-2 mt-8 max-w-2xl text-white">
              Real videos, from real agents in the program.
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={0.12}>
            <VideoGallery videos={videosWithThumbs} />
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── What we handle ───────────────────────────────────────────────
          A ruled list, not six centred icon cards. These are the steps of one
          process, so they read as one list — and the numbering is real here:
          strategy genuinely comes before filming, which comes before the edit. */}
      <section className="section">
        <div className="shell">
          <AnimateOnScroll animation="rise">
            <RuleHead label="What we handle" />
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
              <h2 className="display-2 text-white">
                We run the whole creative process.
              </h2>
              <p className="lede lg:pt-2">
                You show up and be yourself. Everything either side of that is
                ours.
              </p>
            </div>
          </AnimateOnScroll>

          <ol className="mt-12 border-t border-line sm:mt-16">
            {whatWeDoItems.map((item, i) => (
              <AnimateOnScroll
                key={item.text}
                as="li"
                animation="fade-up"
                delay={i * 0.06}
                className="flex items-baseline gap-6 border-b border-line py-5 sm:gap-10 sm:py-6"
              >
                <span className="meta meta-signal shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-base text-ink-2 sm:text-lg">{item.text}</span>
              </AnimateOnScroll>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Why it works ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <AnimateOnScroll animation="rise">
            <RuleHead label="Why it works" />
          </AnimateOnScroll>
          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
            <AnimateOnScroll animation="fade-up">
              <div>
                <h2 className="display-2 text-white">How this helps you win.</h2>
                <p className="lede mt-6 max-w-md">
                  Most agents struggle with consistency and standing out online.
                  That is where we come in. With consistent, strategic content
                  you gain a real competitive edge.
                </p>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-3">
                  We have seen agents go from barely posting to becoming one of
                  the most recognized names in their area. This is how you
                  separate yourself.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={0.12}>
              <div className="surface p-7 sm:p-9">
                <p className="meta">What changes</p>
                <ul className="mt-6">
                  {winItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3.5 border-b border-line py-4 text-[0.9375rem] text-ink-2 last:border-b-0"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="section scroll-mt-20">
        <div className="shell">
          <AnimateOnScroll animation="rise">
            <RuleHead label="Pricing" link={{ href: "/contact", label: "Ask a question" }} />
            <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <h2 className="display-2 max-w-xl text-white">
                Three tiers. Every one includes the whole process.
              </h2>
              <p className="lede max-w-sm">
                Strategy, filming, editing, and coaching are in all three. The
                tier sets how much you get each month.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="mt-12 grid gap-4 sm:mt-16 lg:grid-cols-3">
            {tiers.map((tier, i) => (
              <AnimateOnScroll key={tier.name} animation="fade-up" delay={i * 0.1} className="h-full">
                <div
                  className={`surface flex h-full flex-col p-7 sm:p-8 ${
                    tier.popular
                      ? "!border-signal/40 !bg-[#111823] shadow-[0_0_60px_-20px_rgba(78,168,255,0.45)]"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="display-3 text-white">{tier.name}</h3>
                    {tier.popular && (
                      <span className="meta meta-signal shrink-0 rounded-full border border-signal/35 px-2.5 py-1.5">
                        Most booked
                      </span>
                    )}
                  </div>

                  <p className="mt-5 flex items-baseline gap-2">
                    <span className="display-2 !text-[clamp(1.75rem,2.6vw,2.25rem)] text-white">
                      {tier.price}
                    </span>
                    <span className="meta">/ month</span>
                  </p>

                  <p className="mt-4 border-t border-line pt-5 text-sm leading-relaxed text-ink-2">
                    {tier.description}
                  </p>

                  <ul className="mt-6 flex-1 space-y-3.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-ink-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/contact"
                    className={`btn mt-8 w-full ${tier.popular ? "btn-primary" : "btn-ghost"}`}
                  >
                    Start with {tier.name.toLowerCase()}
                    <ArrowRight className="arrow h-4 w-4" />
                  </Link>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── The difference ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <AnimateOnScroll animation="rise">
            <RuleHead label="The difference" />
            <h2 className="display-2 mt-8 max-w-xl text-white">
              Why this program is different.
            </h2>
          </AnimateOnScroll>

          <dl className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:mt-16 lg:grid-cols-3">
            {differences.map((d, i) => (
              <AnimateOnScroll
                key={d.title}
                animation="fade-up"
                delay={i * 0.08}
                className="flex h-full flex-col bg-surface p-7 sm:p-8"
              >
                <dt>
                  <span className="meta meta-signal">{String(i + 1).padStart(2, "0")}</span>
                  <span className="display-3 mt-5 block text-white">{d.title}</span>
                </dt>
                <dd className="mt-3 text-sm leading-relaxed text-ink-2">{d.body}</dd>
              </AnimateOnScroll>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Close ────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <AnimateOnScroll animation="rise">
            <div className="surface flex flex-col items-start gap-8 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-16">
              <div>
                <h2 className="display-2 max-w-lg text-white">
                  Ready to grow your brand?
                </h2>
                <p className="lede mt-5 max-w-md">
                  Get in touch for a free consultation and we&apos;ll tell you
                  honestly whether the program is right for you.
                </p>
              </div>
              <Link href="/contact" className="btn btn-primary shrink-0">
                Book a consultation
                <ArrowRight className="arrow h-4 w-4" />
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
