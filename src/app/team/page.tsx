import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Users, Zap, MapPin } from "lucide-react";
import { images } from "@/lib/images";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet the talented team behind PG Creatives. Professional photographers, videographers, and creatives based in Wisconsin.",
};

const team = [
  {
    name: "Michael McIntee",
    role: "Founder",
    image: images.team1,
  },
  {
    name: "Isaiah Bastian",
    role: "Lead Creative (Madison)",
    image: images.team2,
  },
  {
    name: "Brenden Gruber",
    role: "Brand Development",
    image: images.team3,
  },
  {
    name: "Liam Janowski",
    role: "Creative Specialist (Green Bay)",
    image: images.team4,
  },
  {
    name: "Ryan Ybanez",
    role: "Senior Video Editor",
    image: images.team5,
  },
  {
    name: "Lyle Alquills",
    role: "Video Editor",
    image: images.team6,
  },
  {
    name: "Charlibeth Sicad",
    role: "Administrative Coordinator",
    image: images.team7,
  },
  {
    name: "Mike McIntee",
    role: "Advisor",
    image: images.team8,
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
      <section className="relative overflow-hidden bg-background py-28">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_0%,rgba(139,92,246,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_0%_100%,rgba(139,92,246,0.07),transparent)]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            {/* Section pill label */}
            <div className="mb-6 inline-flex items-center rounded-full border border-purple/25 bg-purple/10 px-4 py-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-purple-light">
                About Us
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              The Creatives{" "}
              <span className="gradient-text-bold">Behind the Lens</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/50">
              PG Creatives has a growing group of editors, photographers, and
              content strategists. Meet the most experienced group in the
              Midwest, elevating your game.
            </p>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="relative bg-background py-28">
        {/* Floating decorative orb */}
        <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-purple/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <AnimateOnScroll key={member.name} animation="fade-up" delay={index * 0.08}>
                <div
                  className="card-3d group"
                >
                  <div className="card-3d-inner rounded-xl border border-purple/12 bg-purple/[0.04] overflow-hidden transition-colors duration-300 hover:border-purple/25">
                    {/* Photo */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080820] via-transparent to-transparent" />
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
      <section className="border-t border-purple/10 bg-secondary/30 py-28">
        <div className="mx-auto max-w-7xl px-6">
          {/* Heading */}
          <AnimateOnScroll animation="fade-up">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-5 inline-flex items-center rounded-full border border-purple/25 bg-purple/10 px-4 py-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-purple-light">
                  Our Values
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                What Drives Us
              </h2>
            </div>
          </AnimateOnScroll>

          {/* Value cards */}
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <AnimateOnScroll key={value.title} animation="fade-up" delay={i * 0.1}>
                  <div
                    className="rounded-xl border border-purple/12 bg-purple/[0.04] p-7 transition-colors duration-300 hover:border-purple/25"
                  >
                    {/* Icon box */}
                    <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-purple/20 bg-purple/10">
                      <Icon className="h-5 w-5 text-purple-light" />
                    </div>
                    <h3 className="font-semibold text-white">{value.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/45">
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
      <section className="bg-background py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          {/* Decorative top border accent */}
          <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-purple/50 to-transparent" />

          <h2 className="text-3xl font-bold tracking-tight text-white">
            About{" "}
            <span className="text-purple-light">PG Creatives</span>
          </h2>
          <div className="mt-6 space-y-4 text-white/50">
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
            className="glow-hover mt-10 inline-flex items-center gap-2 rounded-full border border-purple/25 bg-purple/10 px-8 py-3 text-sm font-medium tracking-wide text-purple-light transition-colors duration-200 hover:bg-purple/20 hover:border-purple/40"
          >
            Work With Us
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
