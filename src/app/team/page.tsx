import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet the talented team behind PG Creatives. Professional photographers, videographers, and creatives based in Wisconsin.",
};

const team = [
  {
    name: "Team Member",
    role: "Founder & Lead Photographer",
    bio: "With years of experience in professional photography and videography, leading the PG Creatives vision from day one.",
    image: images.team1,
  },
  {
    name: "Team Member",
    role: "Videographer & Editor",
    bio: "Specializing in cinema-quality video production and post-production editing that brings stories to life.",
    image: images.team2,
  },
  {
    name: "Team Member",
    role: "Drone Pilot & Photographer",
    bio: "FAA Part 107 certified drone operator capturing stunning aerial perspectives across Wisconsin.",
    image: images.team3,
  },
  {
    name: "Team Member",
    role: "3D Tour Specialist",
    bio: "Creating immersive virtual experiences with Matterport technology for real estate and commercial clients.",
    image: images.team4,
  },
];

const values = [
  {
    title: "Quality First",
    description:
      "We never compromise on quality. Every shot, every frame, every edit meets our high professional standards.",
  },
  {
    title: "Client Focused",
    description:
      "Your vision drives our work. We listen, collaborate, and deliver media that exceeds expectations.",
  },
  {
    title: "Fast Turnaround",
    description:
      "Time matters in real estate and business. We deliver polished content quickly without sacrificing quality.",
  },
  {
    title: "Local Expertise",
    description:
      "We know Wisconsin. From lakefront properties to downtown businesses, we understand what resonates here.",
  },
];

export default function TeamPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-navy-light)_0%,_transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              About Us
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              The Creatives Behind the Lens
            </h1>
            <p className="mt-4 text-lg text-white/50">
              A passionate team of photographers, videographers, and visual
              storytellers dedicated to capturing your world beautifully.
            </p>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="bg-black py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.role} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-navy/50">
                  <Image
                    src={member.image}
                    alt={member.role}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
                <div className="bg-navy/30 p-5">
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                    {member.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/40">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-white/5 bg-navy/30 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              Our Values
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              What Drives Us
            </h2>
          </div>

          <div className="mt-16 grid gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="bg-black p-8">
                <h3 className="font-semibold text-white">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-black py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            About PG Creatives
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
          <Link
            href="/contact"
            className="mt-10 inline-flex items-center gap-2 bg-white px-8 py-3 text-sm font-medium tracking-wide text-black transition-colors hover:bg-white/90"
          >
            Work With Us
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
