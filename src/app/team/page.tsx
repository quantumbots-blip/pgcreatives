import type { Metadata } from "next";
import Image from "next/image";
import { Star, Users, Zap, MapPin } from "lucide-react";
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
      {/* Hero + About (merged) */}
      <section className="relative overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pb-20">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_0%,rgba(139,92,246,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_0%_100%,rgba(139,92,246,0.07),transparent)]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
          {/* Heading */}
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel>About Us</SectionLabel>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white md:text-6xl">
              The Creatives{" "}
              <span className="text-purple-light">Behind the Scenes</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-white/60">
              PG Creatives has a growing group of editors, photographers, and
              content strategists. Meet the most experienced group in Wisconsin
              elevating your media game.
            </p>
          </div>

        </div>
      </section>

      {/* Team Grid */}
      <section className="relative py-12 sm:py-16 lg:py-20">
        {/* Floating decorative orb */}
        <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-purple/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {team.map((member, index) => (
              <AnimateOnScroll key={member.name} animation="fade-up" delay={index * 0.08}>
                <div className={`card-shine group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cardGradients[index]} border border-white/[0.08] transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_rgba(55,140,210,0.15)]`}>
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

      {/* About Story */}
      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <AnimateOnScroll animation="fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white md:text-4xl text-center mb-10">
              When you win, we win.
            </h2>
            <div className="space-y-6 text-base sm:text-lg leading-relaxed text-white/60 text-center">
              <p>
                I started PG Creatives at 19 years old with a simple goal — create
                better media for real estate and help agents stand out in a crowded
                market. What began as just me with a camera has grown into a full
                team working with hundreds of agents and continuing to raise the
                standard of what real estate content should look like.
              </p>
              <p>
                From the beginning, this was never just about photos and videos. It
                was about helping agents build a brand, get attention online, and
                create real opportunities through their content. As we have grown,
                that mindset has never changed.
              </p>
              <p>
                We take pride in being reliable, fast, and detail-focused. But more
                than anything, we care about the people we work with. Every project
                is approached as a partnership. We are not just there to shoot a
                listing. We are there to help you create content that represents
                who you are and moves your business forward.
              </p>
              <p>
                When you work with PG Creatives, you are not just hiring a media
                company. You are working with a team that is invested in your
                success.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
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
          <div className="mt-10 sm:mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => {
              const Icon = value.icon;
              const colors = valueColors[i];
              return (
                <AnimateOnScroll key={value.title} animation="fade-up" delay={i * 0.1}>
                  <div className="rounded-2xl glass-card overflow-hidden h-full flex flex-col">
                    {/* Colored top border */}
                    <div className={`h-1 shrink-0 bg-gradient-to-r ${colors.borderGradient}`} />
                    <div className="p-7 flex-1">
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

    </>
  );
}
