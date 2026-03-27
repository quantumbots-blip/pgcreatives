import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  Clapperboard,
  Compass,
  Cuboid,
  Palette,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Professional media services including real estate photography, cinema videography, drone aerial, 3D virtual tours, and commercial branding.",
};

const services = [
  {
    icon: Camera,
    title: "Real Estate Photography",
    description:
      "Professional HDR photography that showcases every property in its best light. From cozy homes to luxury estates, we capture the details that sell.",
    features: [
      "HDR interior & exterior photography",
      "Twilight & golden hour shoots",
      "Staging consultation",
      "24-48 hour turnaround",
      "MLS-ready formatting",
      "Unlimited edited photos",
    ],
  },
  {
    icon: Clapperboard,
    title: "Cinema Videography",
    description:
      "Cinematic video production that tells your story. Professional cinema cameras and stabilization for buttery smooth, film-quality results.",
    features: [
      "4K cinema-quality capture",
      "Professional color grading",
      "Licensed music & sound design",
      "Listing walkthrough videos",
      "Brand story films",
      "Social media edits included",
    ],
  },
  {
    icon: Compass,
    title: "Drone Aerial",
    description:
      "FAA-certified drone operators delivering stunning aerial perspectives. Showcase properties, venues, and developments from angles ground photography can't reach.",
    features: [
      "FAA Part 107 certified pilots",
      "4K aerial video & stills",
      "Property boundary overviews",
      "Neighborhood & amenity context",
      "Construction progress documentation",
      "Sunset & golden hour flights",
    ],
  },
  {
    icon: Cuboid,
    title: "3D Virtual Tours",
    description:
      "Immersive 3D walkthroughs that let potential buyers or clients explore spaces remotely. Interactive, shareable, and available 24/7.",
    features: [
      "Matterport 3D scanning",
      "Interactive floor plans",
      "Dollhouse & floorplan views",
      "Measurement tools",
      "Embeddable tour links",
      "VR headset compatible",
    ],
  },
  {
    icon: Palette,
    title: "Commercial Branding",
    description:
      "Elevate your business identity with professional brand photography and video content that communicates your values and connects with your audience.",
    features: [
      "Brand identity photography",
      "Product photography",
      "Team & headshot sessions",
      "Social media content packages",
      "Website hero imagery",
      "Event coverage",
    ],
  },
  {
    icon: Sparkles,
    title: "Professional Editing",
    description:
      "Post-production that transforms good footage into extraordinary content. Color grading, retouching, and editing that meets the highest standards.",
    features: [
      "Advanced HDR processing",
      "Sky replacement & enhancement",
      "Virtual staging options",
      "Color correction & grading",
      "Object removal & cleanup",
      "Batch processing for speed",
    ],
  },
];

const process = [
  {
    step: "01",
    title: "Consultation",
    description:
      "We discuss your vision, goals, and the specific deliverables you need.",
  },
  {
    step: "02",
    title: "Scheduling",
    description:
      "We coordinate the perfect time for your shoot based on lighting and availability.",
  },
  {
    step: "03",
    title: "Production",
    description:
      "Our team arrives with professional equipment and captures your content.",
  },
  {
    step: "04",
    title: "Delivery",
    description:
      "Edited, polished media delivered to you within our fast turnaround window.",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-navy-light)_0%,_transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              Our Services
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Everything You Need to Stand Out
            </h1>
            <p className="mt-4 text-lg text-white/50">
              From first impressions to lasting impact, our comprehensive media
              services cover every angle of your visual story.
            </p>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="bg-black py-28">
        <div className="mx-auto max-w-7xl px-6 space-y-px">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="grid gap-0 border border-white/5 lg:grid-cols-2"
            >
              <div className="space-y-5 p-8 lg:p-10">
                <div className="flex items-center gap-3">
                  <service.icon className="h-5 w-5 text-white/40" />
                  <span className="font-mono text-xs text-white/30">
                    0{index + 1}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {service.title}
                </h2>
                <p className="leading-relaxed text-white/50">
                  {service.description}
                </p>
              </div>

              <div className="bg-navy/30 p-8 lg:p-10">
                <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-white/30">
                  What&apos;s Included
                </p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-white/60"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/30" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="border-t border-white/5 bg-navy/30 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              Our Process
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Simple. Professional. Fast.
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((item) => (
              <div key={item.step}>
                <span className="font-mono text-3xl font-bold text-white/10">
                  {item.step}
                </span>
                <div className="mt-3 h-px bg-white/10" />
                <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-white/40">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Let&apos;s Discuss Your Project
          </h2>
          <p className="mt-4 text-white/50">
            Every project is unique. Reach out for a custom quote tailored to
            your specific needs.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="bg-white px-8 py-3 text-sm font-medium tracking-wide text-black transition-colors hover:bg-white/90"
            >
              Get a Quote
            </Link>
            <a
              href="tel:+19207770127"
              className="border border-white/20 px-8 py-3 text-sm tracking-wide text-white transition-colors hover:border-white/40"
            >
              (920) 777-0127
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
