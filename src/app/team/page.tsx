import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Users, Zap, MapPin } from "lucide-react";
import { images } from "@/lib/images";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { SectionLabel } from "@/components/section-label";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About | Meet The Team",
  description:
    "Meet the talented photographers, videographers, and creatives behind PG Creatives. Based in Green Bay and Madison, Wisconsin, our team delivers professional-grade media.",
  keywords: [
    "PG Creatives team",
    "Wisconsin photographers",
    "Green Bay videographer",
    "Madison media company",
    "professional creatives",
  ],
  openGraph: {
    title: "About | PG Creatives Team",
    description:
      "Meet the talented team behind PG Creatives in Wisconsin.",
    images: [{ url: "/og-team.jpg", width: 1200, height: 630, alt: "PG Creatives Team - The Creatives Behind the Lens" }],
  },
};

const cardGradients = [
  "from-blue-600/20 to-indigo-600/20",
  "from-purple-500/20 to-pink-500/20",
  "from-emerald-500/20 to-teal-500/20",
  "from-amber-500/20 to-orange-500/20",
  "from-rose-500/20 to-red-500/20",
  "from-cyan-500/20 to-blue-500/20",
  "from-violet-500/20 to-fuchsia-500/20",
  "from-blue-600/20 to-indigo-600/20",
  "from-purple-500/20 to-pink-500/20",
  "from-emerald-500/20 to-teal-500/20",
];

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
    role: "Editor",
    image: images.claudioOndoyJr,
  },
  {
    name: "Gvy Teleron",
    role: "Editor",
    image: images.gvyTeleron,
  },
  {
    name: "Charlibeth Sicad",
    role: "Administrative Coordinator",
    image: images.charlibethSicad,
  },
  {
    name: "Mike McIntee",
    role: "Advisor",
    image: images.mikeMcintee,
  },
];

const valueColors = [
  { iconGradient: "from-blue-500 to-blue-600", borderGradient: "from-blue-500 to-blue-600" },
  { iconGradient: "from-purple-500 to-purple-600", borderGradient: "from-purple-500 to-purple-600" },
  { iconGradient: "from-amber-500 to-orange-500", borderGradient: "from-amber-500 to-orange-500" },
  { iconGradient: "from-emerald-500 to-teal-500", borderGradient: "from-emerald-500 to-teal-500" },
];

const values = [
  {
    icon: Star,
    title: "Quality First",
    description:
      "We never compromise on quality. Every shot, every frame, every edit meets our high professional standards.",
  },
  {
    icon: Users,
    title: "Client Focused",
    description:
      "Your vision drives our work. We listen, collaborate, and deliver media that exceeds expectations.",
  },
  {
    icon: Zap,
    title: "Fast Turnaround",
    description:
      "Time matters in real estate and business. We deliver polished content quickly without sacrificing quality.",
  },
  {
    icon: MapPin,
    title: "Local Expertise",
    description:
      "We know Wisconsin. From lakefront properties to downtown businesses, we understand what resonates here.",
  },
];

export default function TeamPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background pt-24 pb-12 sm:pt-28 sm:pb-16">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_0%,rgba(139,92,246,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_0%_100%,rgba(139,92,246,0.07),transparent)]" />
        <div className="absolute right-[12%] top-[35%] h-36 w-36 rounded-full border border-dashed border-purple/8 spin-ring hidden lg:block" />

        {/* Decorative colored gradient orbs */}
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-gradient-to-br from-purple/20 via-blue-500/10 to-transparent blur-[100px]" />
        <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-gradient-to-tr from-indigo-500/10 to-transparent blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <SectionLabel>About Us</SectionLabel>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white md:text-5xl">
              The Creatives{" "}
              <span className="text-purple-light">Behind the Lens</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/60">
              PG Creatives has a growing group of editors, photographers, and
              content strategists. Meet the most experienced group in the
              Midwest, elevating your game.
            </p>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="relative bg-background py-12 sm:py-16 lg:py-20">
        {/* Floating decorative orb */}
        <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-purple/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {team.map((member, index) => (
              <AnimateOnScroll key={member.name} animation="fade-up" delay={index * 0.08}>
                <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cardGradients[index]} border border-white/[0.08] transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_rgba(79,110,247,0.15)]`}>
                  {/* Photo with aspect-[3/4] */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Bottom gradient overlay for text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                    {/* Name/role overlay at bottom of image */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                      <h3 className="font-semibold text-white text-base sm:text-lg">{member.name}</h3>
                      <p className="text-sm text-white/60">{member.role}</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-background py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          {/* Heading */}
          <AnimateOnScroll animation="fade-up">
            <div className="mx-auto max-w-2xl text-center">
              <SectionLabel>Our Values</SectionLabel>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                <span className="text-white">What Drives Us</span>
              </h2>
            </div>
          </AnimateOnScroll>

          {/* Value cards */}
          <div className="mt-10 sm:mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => {
              const Icon = value.icon;
              const colors = valueColors[i];
              return (
                <AnimateOnScroll key={value.title} animation="fade-up" delay={i * 0.1}>
                  <div className="rounded-xl glass-card overflow-hidden transition-shadow duration-500 hover:shadow-[0_8px_32px_rgba(79,110,247,0.12),inset_0_0_60px_rgba(79,110,247,0.03)]">
                    {/* Colored top border */}
                    <div className={`h-1 bg-gradient-to-r ${colors.borderGradient}`} />
                    <div className="p-7">
                      {/* Icon box */}
                      <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors.iconGradient} shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-white">{value.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/60">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="relative bg-gradient-to-b from-transparent via-purple/[0.02] to-transparent py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          {/* Decorative rainbow top border accent */}
          <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            About{" "}
            <span className="gradient-text">PG Creatives</span>
          </h2>
          <div className="mt-6 space-y-4 text-white/60">
            <p>
              Based in Green Bay and Madison, Wisconsin, PG Creatives is a
              professional media company specializing in real estate photography,
              cinema-quality videography, drone aerial photography, 3D virtual
              tours, and commercial branding.
            </p>
            <p>
              We believe that professional-grade media is the key to making a
              lasting impression. Whether you&apos;re selling a home, launching a
              brand, or documenting a project, our team delivers content that
              elevates your vision and drives results.
            </p>
          </div>

          {/* CTA */}
          <div className="relative mt-10">
            {/* Floating gradient orbs behind CTA */}
            <div className="absolute -left-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-[60px]" />
            <div className="absolute -right-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-[60px]" />
            <Link
              href="/contact"
              className="relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-tl from-purple-dim via-purple to-purple-light px-7 py-3 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-purple/30"
            >
              Work With Us
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
