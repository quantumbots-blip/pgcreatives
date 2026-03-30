import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { PortfolioFilter } from "@/components/portfolio-filter";

const projects = [
  {
    title: "Open-Concept Living Room",
    category: "Real Estate",
    description: "Vaulted ceiling great room with kitchen bar and natural light.",
    type: "photo" as const,
    image: "/images/luxury-living-room.jpg",
  },
  {
    title: "Downtown Penthouse",
    category: "Real Estate",
    description: "Modern city condo with designer furnishings and skyline views.",
    type: "photo" as const,
    image: "/images/modern-condo.jpg",
  },
  {
    title: "Lakefront Estate Aerial",
    category: "Drone",
    description: "Drone flyover of a waterfront property with private dock.",
    type: "photo" as const,
    image: "/images/aerial-lakefront.jpg",
  },
  {
    title: "Lakehouse Kitchen & Fireplace",
    category: "Real Estate",
    description: "Bright lakehouse kitchen with spiral staircase and chandelier.",
    type: "photo" as const,
    image: "/images/lakehouse-kitchen.jpg",
  },
  {
    title: "Professional Studio Setup",
    category: "Commercial",
    description: "Behind the scenes of our professional lighting and video rig.",
    type: "photo" as const,
    image: "/images/video-studio.jpg",
  },
  {
    title: "Lakefront Cottage Exterior",
    category: "Real Estate",
    description: "White cottage with pergola and lush landscaping on the water.",
    type: "photo" as const,
    image: "/images/cottage-exterior.jpg",
  },
  {
    title: "Gourmet Kitchen Design",
    category: "Real Estate",
    description: "Oak cabinetry kitchen with island seating and pendant lights.",
    type: "photo" as const,
    image: "/images/gourmet-kitchen.jpg",
  },
  {
    title: "Modern Home Entryway",
    category: "Real Estate",
    description: "Clean-lined foyer with glass double doors and natural light.",
    type: "photo" as const,
    image: "/images/modern-entryway.jpg",
  },
  {
    title: "Luxury Estate at Twilight",
    category: "Drone",
    description: "Aerial twilight shot of a hilltop estate with landscape lighting.",
    type: "photo" as const,
    image: "/images/luxury-estate-night.jpg",
  },
  {
    title: "Classic Lakehouse Living Room",
    category: "Real Estate",
    description: "Rustic stone fireplace, built-in bookshelves, and waterfront views.",
    type: "photo" as const,
    image: "/images/rustic-living.jpg",
  },
  {
    title: "Screened Porch Retreat",
    category: "Real Estate",
    description: "Four-season porch with canoe display, rocking chairs, and wood fireplace.",
    type: "photo" as const,
    image: "/images/screened-porch.jpg",
  },
  {
    title: "Great Room with Stone Fireplace",
    category: "Real Estate",
    description: "Two-story great room with floor-to-ceiling stone fireplace and wooded views.",
    type: "photo" as const,
    image: "/images/stone-fireplace-living.jpg",
  },
  {
    title: "Farmhouse Kitchen",
    category: "Real Estate",
    description: "White farmhouse kitchen with globe pendants and wicker bar stools.",
    type: "photo" as const,
    image: "/images/farmhouse-kitchen.jpg",
  },
  {
    title: "Overhead Living Room View",
    category: "Real Estate",
    description: "Dramatic balcony perspective of a stone fireplace great room.",
    type: "photo" as const,
    image: "/images/overhead-living.jpg",
  },
  {
    title: "Modern Linear Fireplace",
    category: "Real Estate",
    description: "Contemporary fluted tile fireplace surround with dining area.",
    type: "photo" as const,
    image: "/images/fireplace-living.jpg",
  },
  {
    title: "Kitchen Detail & Backsplash",
    category: "Real Estate",
    description: "Marble backsplash with globe pendants and cane-back chairs.",
    type: "photo" as const,
    image: "/images/pendant-kitchen.jpg",
  },
];

export default function PortfolioPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background pt-24 pb-4 sm:pt-28 sm:pb-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#111111_0%,transparent_55%)]" />
        <div className="absolute left-10 top-40 h-48 w-48 rounded-full bg-purple/[0.03] blur-[60px] animate-float" />
        <div className="absolute right-[8%] top-[25%] h-32 w-32 rounded-full border border-dashed border-purple/10 spin-ring hidden lg:block" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center justify-center rounded-full border border-purple/25 bg-purple/10 px-3 h-7 sm:px-4 sm:h-8">
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] sm:tracking-[0.25em] text-purple-light leading-none">
                Portfolio
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white md:text-5xl">
              Our Best Work
            </h1>
            <p className="mt-4 text-base sm:text-lg text-purple-light/55">
              Browse our collection of professional media created for clients
              across Wisconsin.
            </p>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="bg-background pt-4 pb-10 sm:pt-6 sm:pb-16">
        <PortfolioFilter projects={projects} />
      </section>

      {/* CTA */}
      <section className="bg-background py-12 sm:py-16">
        <AnimateOnScroll animation="fade-up">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="text-white">Want Results </span>
              <span className="text-purple-light">Like These?</span>
            </h2>
            <p className="mt-4 text-purple-light/55">
              Let&apos;s create stunning media for your property or brand.
            </p>
            <Link
              href="/contact"
              className="mt-10 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-semibold tracking-wide text-[#0a0a0a] transition-all duration-300 hover:bg-purple-light hover:text-white hover:shadow-lg hover:shadow-purple/20"
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
