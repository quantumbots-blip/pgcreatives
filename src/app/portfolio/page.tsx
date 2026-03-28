import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { images } from "@/lib/images";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { PortfolioFilter } from "@/components/portfolio-filter";

const projects = [
  {
    title: "Luxury Lakefront Estate",
    category: "Real Estate",
    description: "Full photography and video package for a waterfront property.",
    type: "photo" as const,
    image: images.luxuryLakefront,
  },
  {
    title: "Downtown Green Bay Brand Film",
    category: "Commercial",
    description: "Cinema-quality brand story for a local business.",
    type: "video" as const,
    image: images.downtownCommercial,
  },
  {
    title: "Fox River Development Overview",
    category: "Drone",
    description: "Aerial documentation of a new residential development.",
    type: "photo" as const,
    image: images.aerialProperty,
  },
  {
    title: "Modern Farmhouse Virtual Tour",
    category: "3D Tours",
    description: "Interactive 3D walkthrough for a newly built home.",
    type: "video" as const,
    image: images.modernHome,
  },
  {
    title: "Corporate Headquarters Showcase",
    category: "Commercial",
    description: "Professional photography for a corporate campus.",
    type: "photo" as const,
    image: images.restaurant,
  },
  {
    title: "Listing Walkthrough Video",
    category: "Videography",
    description: "Cinematic property walkthrough for MLS listing.",
    type: "video" as const,
    image: images.brandVideo,
  },
  {
    title: "Waterfront Condo Complex",
    category: "Real Estate",
    description: "Multi-unit listing photography with drone aerials.",
    type: "photo" as const,
    image: images.waterfrontCondo,
  },
  {
    title: "Restaurant Grand Opening",
    category: "Commercial",
    description: "Event coverage and brand photography for a new restaurant.",
    type: "photo" as const,
    image: images.waterfrontDev,
  },
  {
    title: "Suburban Neighborhood Aerial",
    category: "Drone",
    description: "Neighborhood context shots for a real estate development.",
    type: "photo" as const,
    image: images.suburbanAerial,
  },
  {
    title: "Historic Home Renovation",
    category: "Real Estate",
    description: "Before and after documentation of a historic restoration.",
    type: "photo" as const,
    image: images.historicHome,
  },
  {
    title: "Boutique Hotel Tour",
    category: "3D Tours",
    description: "Full Matterport scan of a boutique hotel property.",
    type: "video" as const,
    image: images.boutiqueHotel,
  },
  {
    title: "Fitness Brand Campaign",
    category: "Videography",
    description: "Multi-platform video content for a fitness brand launch.",
    type: "video" as const,
    image: images.fitnessBrand,
  },
];

export default function PortfolioPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background pt-24 pb-16 sm:py-28">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#0f0f3d_0%,transparent_55%)]"
        />
        <div className="absolute left-10 top-40 h-48 w-48 rounded-full bg-purple/[0.03] blur-[60px] animate-float" />
        <div className="absolute right-[8%] top-[25%] h-32 w-32 rounded-full border border-dashed border-purple/10 spin-ring hidden lg:block" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center rounded-full border border-purple/25 bg-purple/10 px-3 py-1">
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-purple-light">
                Portfolio
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Our Best Work
            </h1>
            <p className="mt-4 text-lg text-purple-light/55">
              Browse our collection of professional media created for clients
              across Wisconsin.
            </p>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="bg-background py-10 sm:py-16">
        <PortfolioFilter projects={projects} />
      </section>

      {/* CTA */}
      <section className="bg-background py-16 sm:py-28">
        <AnimateOnScroll animation="fade-up">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              <span className="text-white">Want Results </span>
              <span className="text-purple-light">Like These?</span>
            </h2>
            <p className="mt-4 text-purple-light/55">
              Let&apos;s create stunning media for your property or brand.
            </p>
            <Link
              href="/contact"
              className="mt-10 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-medium tracking-wide transition-colors hover:bg-white/90 text-[#1a1054]"
            >
              Start Your Project
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </AnimateOnScroll>
      </section>
    </>
  );
}
