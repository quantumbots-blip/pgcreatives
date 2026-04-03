import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Sparkles,
  Target,
  Video,
  TrendingUp,
  Zap,
  Users,
  BarChart3,
} from "lucide-react";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { SectionLabel } from "@/components/section-label";
import { VideoGallery } from "@/components/video-gallery";
import { getVimeoThumbnails } from "@/lib/vimeo";

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

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Content Creator Program | PG Creatives",
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
  openGraph: {
    title: "Content Creator Program | PG Creatives",
    description:
      "Monthly video content built to grow your brand and win more deals.",
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

const whatWeDoItems = [
  {
    icon: Target,
    text: "Strategy and planning based on your goals and market",
  },
  {
    icon: Sparkles,
    text: "Proven content ideas that are designed to perform",
  },
  {
    icon: Users,
    text: "Script writing tailored to your personality and style",
  },
  {
    icon: Video,
    text: "On-camera coaching so you feel confident and natural",
  },
  {
    icon: Zap,
    text: "Professional filming with our team",
  },
  {
    icon: BarChart3,
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

export default async function BrandingPage() {
  const thumbnails = await getVimeoThumbnails(
    showcaseVideos.map((v) => v.vimeoId)
  );
  const videosWithThumbs = showcaseVideos.map((v) => ({
    ...v,
    thumbnail: thumbnails[v.vimeoId],
  }));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.12)_0%,transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
          <div className="max-w-2xl">
            <SectionLabel>Content Creator Program</SectionLabel>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white md:text-5xl">
              Content That{" "}
              <span className="text-purple-light">Performs</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/60">
              A monthly program built around consistency, strategy, and
              results — so you can grow your brand and win more deals.
            </p>
          </div>
        </div>
      </section>

      {/* Video Showcase */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-14">
              <SectionLabel>See Our Work</SectionLabel>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white md:text-4xl">
                Content We Have Created
              </h2>
              <p className="mt-4 text-white/60">
                Real videos from our Content Creator Program — built to perform
                and designed to grow your brand.
              </p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={0.15}>
            <VideoGallery videos={videosWithThumbs} columns={3} />
          </AnimateOnScroll>
        </div>
      </section>

      {/* What We Do */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <AnimateOnScroll animation="fade-up">
            <SectionLabel>What We Do</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white md:text-4xl">
              We Handle the Entire Creative Process
            </h2>
            <p className="mt-4 max-w-2xl text-white/60">
              We handle the entire creative process so you can focus on your
              business. You simply show up and be yourself. We handle the rest.
            </p>
          </AnimateOnScroll>

          <div className="mt-10 sm:mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whatWeDoItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <AnimateOnScroll key={item.text} animation="fade-up" delay={i * 0.08} className="h-full">
                  <div className="flex flex-col items-center text-center gap-3 rounded-2xl glass-card p-6 sm:p-7 h-full">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple/25 to-purple-dim/15 border border-purple/20">
                      <Icon className="h-5 w-5 text-purple-light" />
                    </div>
                    <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                      {item.text}
                    </p>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* How This Helps You Win */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <AnimateOnScroll animation="fade-up">
              <div>
                <SectionLabel>Why It Works</SectionLabel>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white md:text-4xl">
                  How This Helps You Win
                </h2>
                <p className="mt-4 text-white/60">
                  Most agents struggle with consistency and standing out online.
                  That is where we come in. With consistent, strategic content
                  you gain a real competitive edge.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={0.15}>
              <div className="rounded-2xl glass-card p-6 sm:p-8">
                <ul className="space-y-4">
                  {winItems.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-white/70 sm:text-base"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-light" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm leading-relaxed text-white/50">
                  We have seen agents go from barely posting to becoming one of
                  the most recognized names in their area. This is how you
                  separate yourself.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20" id="pricing">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="mx-auto max-w-2xl text-center">
              <SectionLabel>Pricing</SectionLabel>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
                <span className="text-white">Simple, </span>
                <span className="text-purple-light">Transparent Pricing</span>
              </h2>
              <p className="mt-4 text-white/60">
                Choose the tier that fits your goals. Every plan includes
                strategy, filming, editing, and coaching.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="mt-10 sm:mt-14 grid gap-5 sm:grid-cols-3">
            {tiers.map((tier, i) => (
              <AnimateOnScroll key={tier.name} animation="fade-up" delay={i * 0.1}>
                <div className={`relative ${tier.popular ? "mt-4" : ""}`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-gradient-to-r from-purple to-purple-light px-5 py-1.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(43,111,184,0.4)]">
                      Most Popular
                    </div>
                  )}
                <div
                  className={`relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                    tier.popular
                      ? "border-purple/40 bg-gradient-to-br from-purple/[0.18] via-black to-purple-light/[0.08]"
                      : "border-purple/20 bg-gradient-to-br from-purple/[0.12] via-black to-purple-light/[0.06]"
                  }`}
                >
                  <div className="p-6 lg:p-8 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                    <div className="mt-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">
                          {tier.price}
                        </span>
                        <span className="text-sm text-white/40">/ month</span>
                      </div>
                    </div>
                    <ul className="mt-6 flex-1 space-y-3">
                      {tier.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2.5 text-sm text-white/60"
                        >
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-6 text-sm leading-relaxed text-white/45">
                      {tier.description}
                    </p>
                    <Link
                      href="/contact"
                      className="mt-6 flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-purple-dim to-purple text-white shadow-[0_0_15px_rgba(43,111,184,0.25)] hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(43,111,184,0.45)]"
                    >
                      Get Started
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Program Is Different */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="absolute right-[10%] top-[20%] h-64 w-64 rounded-full bg-purple/[0.04] blur-[100px]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center">
              <SectionLabel>The Difference</SectionLabel>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white md:text-4xl">
                Why This Program Is Different
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="mt-10 sm:mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimateOnScroll animation="fade-up" delay={0}>
              <div className="rounded-2xl border border-purple/30 bg-gradient-to-br from-purple/[0.12] via-[#020810]/90 to-purple-light/[0.05] p-6 sm:p-7 h-full">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple/15">
                  <Zap className="h-5 w-5 text-purple-light" />
                </div>
                <h3 className="font-semibold text-white">Content That Performs</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  We do not just create content. Everything we do is based on what
                  is currently working in the market. The style, pacing, hooks, and
                  messaging are all designed to capture attention and keep people watching.
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={0.1}>
              <div className="rounded-2xl border border-purple/30 bg-gradient-to-br from-purple/[0.12] via-[#020810]/90 to-purple-light/[0.05] p-6 sm:p-7 h-full">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple/15">
                  <Users className="h-5 w-5 text-purple-light" />
                </div>
                <h3 className="font-semibold text-white">Limited Availability</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  We limit how many agents we work with at a time to avoid
                  oversaturation. This allows you to stand out without competing
                  against identical content from other agents nearby.
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={0.2}>
              <div className="rounded-2xl border border-purple/30 bg-gradient-to-br from-purple/[0.12] via-[#020810]/90 to-purple-light/[0.05] p-6 sm:p-7 h-full sm:col-span-2 lg:col-span-1">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple/15">
                  <TrendingUp className="h-5 w-5 text-purple-light" />
                </div>
                <h3 className="font-semibold text-white">Built to Win</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  This program is about one thing — helping you grow your brand,
                  attract more opportunities, and win more deals.
                </p>
                <p className="mt-4 text-sm font-semibold text-white">
                  When you win, we win.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-purple/[0.08] blur-[120px]" />
        <div className="absolute left-[20%] top-[30%] h-[200px] w-[200px] rounded-full bg-sky-500/[0.05] blur-[100px]" />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-purple/25 bg-gradient-to-br from-purple/[0.15] via-black to-purple-light/[0.08] p-8 sm:p-12 text-center shadow-[0_0_80px_rgba(43,111,184,0.12),inset_0_1px_0_rgba(106,176,212,0.1)]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple/20 blur-[80px]" />
            <div className="pointer-events-none absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-purple-light/15 blur-[70px]" />
            <h2 className="relative text-2xl sm:text-3xl font-bold text-white md:text-4xl">
              Ready to grow your brand?
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm text-white/55 sm:text-base">
              Get in touch for a free consultation and see if the program is right
              for you.
            </p>
            <Link
              href="/contact"
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold tracking-wide text-black transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-[1.03]"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
