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
    role: "Team Member",
    image: images.claudioOndoyJr,
  },
  {
    name: "Gvy Teleron",
    role: "Team Member",
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
      <section className="relative bg-background py-10 sm:py-14">
        {/* Floating decorative orb */}
        <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-purple/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {team.map((member, index) => (
              <AnimateOnScroll key={member.name} animation="fade-up" delay={index * 0.08}>
                <div
                  className="card-3d-enhanced group"
                >
                  <div className="rounded-xl glass-card overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(79,110,247,0.15)]">
                    {/* Photo */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent" />
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="font-semibold text-white">{member.name}</h3>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-purple-light">
                        {member.role}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-background py-12 sm:py-16">
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
              return (
                <AnimateOnScroll key={value.title} animation="fade-up" delay={i * 0.1}>
                  <div
                    className="rounded-xl glass-card hover-lift p-7 transition-shadow duration-500 hover:shadow-[0_8px_32px_rgba(79,110,247,0.12),inset_0_0_60px_rgba(79,110,247,0.03)]"
                  >
                    {/* Icon box */}
                    <div className="icon-3d mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple/25 to-purple-dim/15 border border-purple/20">
                      <Icon className="h-5 w-5 text-purple-light" />
                    </div>
                    <h3 className="font-semibold text-white">{value.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      {value.description}
                    </p>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          {/* Decorative top border accent */}
          <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-purple/50 to-transparent" />

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            About{" "}
            <span className="text-purple-light">PG Creatives</span>
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
          <Link
            href="/contact"
            className="mt-10 inline-flex items-center gap-2 rounded-lg bg-gradient-to-tl from-purple-dim via-purple to-purple-light px-7 py-3 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-purple/30"
          >
            Work With Us
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
