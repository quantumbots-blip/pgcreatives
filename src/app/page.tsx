import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Camera,
  Clapperboard,
  Compass,
  Cuboid,
  Play,
} from "lucide-react";
import { images } from "@/lib/images";

const services = [
  {
    icon: Camera,
    title: "Real Estate Photography",
    description:
      "Stunning listing photos that showcase every property's best features and drive buyer engagement.",
  },
  {
    icon: Clapperboard,
    title: "Cinema Videography",
    description:
      "Cinematic-quality video production for listings, brands, and commercial projects.",
  },
  {
    icon: Compass,
    title: "Drone Aerial",
    description:
      "Breathtaking aerial photography and video that captures the full scope of any property or venue.",
  },
  {
    icon: Cuboid,
    title: "3D Virtual Tours",
    description:
      "Immersive 3D walkthroughs that let clients explore spaces from anywhere in the world.",
  },
];

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "100+", label: "Happy Clients" },
  { value: "2", label: "Locations in WI" },
  { value: "4K+", label: "Ultra HD Quality" },
];

const featured = [
  { title: "Luxury Lakefront Estate", category: "Real Estate", image: images.luxuryLakefront },
  { title: "Downtown Commercial Shoot", category: "Commercial", image: images.downtownCommercial },
  { title: "Aerial Property Showcase", category: "Drone", image: images.aerialProperty },
  { title: "Modern Home Tour", category: "3D Tour", image: images.modernHome },
  { title: "Brand Launch Video", category: "Videography", image: images.brandVideo },
  { title: "Waterfront Development", category: "Real Estate", image: images.waterfrontDev },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-black">
        <Image
          src={images.heroMain}
          alt="Luxury home exterior"
          fill
          className="object-cover opacity-30"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-black/40 to-black" />

        <div className="relative mx-auto max-w-7xl px-6 py-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              Green Bay & Madison, Wisconsin
            </p>

            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Professional Grade Media
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-lg font-light leading-relaxed text-white/60">
              Cinema-quality videography, stunning photography, aerial drone
              footage, and immersive 3D tours. We bring your vision to life.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="bg-white px-8 py-3 text-sm font-medium tracking-wide text-black transition-colors hover:bg-white/90"
              >
                Book Now
              </Link>
              <Link
                href="/portfolio"
                className="flex items-center gap-2 border border-white/20 px-8 py-3 text-sm tracking-wide text-white transition-colors hover:border-white/40"
              >
                <Play className="h-3.5 w-3.5" />
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-navy">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-14 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-white sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Overview */}
      <section className="bg-black py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              What We Do
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Services Built for Impact
            </h2>
            <p className="mt-4 text-white/50">
              From luxury real estate to commercial brands, we deliver media that
              makes a lasting impression.
            </p>
          </div>

          <div className="mt-16 grid gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <div
                key={service.title}
                className="group bg-black p-8 transition-colors hover:bg-navy/50"
              >
                <service.icon className="h-6 w-6 text-white/30 transition-colors group-hover:text-white/60" />
                <h3 className="mt-5 font-semibold text-white">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm text-white/50 tracking-wide transition-colors hover:text-white"
            >
              View All Services
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio Teaser */}
      <section className="border-t border-white/5 bg-navy/30 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              Our Work
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Featured Projects
            </h2>
            <p className="mt-4 text-white/50">
              A glimpse of the professional media we&apos;ve created for our
              clients across Wisconsin.
            </p>
          </div>

          <div className="mt-16 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <div
                key={item.title}
                className="group relative aspect-[4/3] overflow-hidden bg-navy/50"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                    {item.category}
                  </p>
                  <h3 className="mt-1 font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 bg-white px-8 py-3 text-sm font-medium tracking-wide text-black transition-colors hover:bg-white/90"
            >
              View Full Portfolio
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Elevate Your Brand?
          </h2>
          <p className="mt-4 text-lg text-white/50">
            Let&apos;s create something extraordinary together. Get in touch for
            a free consultation and quote.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="bg-white px-8 py-3 text-sm font-medium tracking-wide text-black transition-colors hover:bg-white/90"
            >
              Contact Us
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
