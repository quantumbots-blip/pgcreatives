import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { PortfolioFilter } from "@/components/portfolio-filter";
import { getVimeoThumbnails } from "@/lib/vimeo";

const projects = [
  // Videos
  {
    title: "Luxury Listing Showcase",
    category: "Real Estate",
    type: "video" as const,
    vimeoId: "1104794434",
  },
  {
    title: "Agent Brand Story",
    category: "Social Media",
    type: "video" as const,
    vimeoId: "1173595933",
  },
  {
    title: "Waterfront Property Tour",
    category: "Real Estate",
    type: "video" as const,
    vimeoId: "1155091381",
  },
  {
    title: "Aerial Estate Flyover",
    category: "Drone",
    type: "video" as const,
    vimeoId: "1156930119",
  },
  {
    title: "Modern Home Walkthrough",
    category: "Real Estate",
    type: "video" as const,
    vimeoId: "1168129293",
  },
  {
    title: "Social Media Reel",
    category: "Social Media",
    type: "video" as const,
    vimeoId: "1172222135",
  },
  {
    title: "Lakehouse Cinematic Tour",
    category: "Real Estate",
    type: "video" as const,
    vimeoId: "1152918857",
  },
  {
    title: "Commercial Brand Film",
    category: "Commercial",
    type: "video" as const,
    vimeoId: "1053206417",
  },
  {
    title: "Neighborhood Aerial Tour",
    category: "Drone",
    type: "video" as const,
    vimeoId: "1124668587",
  },
  {
    title: "Listing Highlight Reel",
    category: "Real Estate",
    type: "video" as const,
    vimeoId: "1117886316",
  },
  {
    title: "Twilight Property Shoot",
    category: "Real Estate",
    type: "video" as const,
    vimeoId: "1113814291",
  },
  {
    title: "Agent Content Package",
    category: "Social Media",
    type: "video" as const,
    vimeoId: "1132559843",
  },
  {
    title: "Commercial Promo Video",
    category: "Commercial",
    type: "video" as const,
    vimeoId: "1082367808",
  },
  {
    title: "Drone Showcase Reel",
    category: "Drone",
    type: "video" as const,
    vimeoId: "1068497296",
  },
  // Photos
  {
    title: "Open-Concept Living Room",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/luxury-living-room.jpg",
  },
  {
    title: "Downtown Penthouse",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/modern-condo.jpg",
  },
  {
    title: "Lakefront Estate Aerial",
    category: "Drone",
    type: "photo" as const,
    image: "/images/aerial-lakefront.jpg",
  },
  {
    title: "Lakehouse Kitchen & Fireplace",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/lakehouse-kitchen.jpg",
  },
  {
    title: "Lakefront Cottage Exterior",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/cottage-exterior.jpg",
  },
  {
    title: "Gourmet Kitchen Design",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/gourmet-kitchen.jpg",
  },
  {
    title: "Modern Home Entryway",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/modern-entryway.jpg",
  },
  {
    title: "Luxury Estate at Twilight",
    category: "Drone",
    type: "photo" as const,
    image: "/images/luxury-estate-night.jpg",
  },
  {
    title: "Classic Lakehouse Living Room",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/rustic-living.jpg",
  },
  {
    title: "Screened Porch Retreat",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/screened-porch.jpg",
  },
  {
    title: "Great Room with Stone Fireplace",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/stone-fireplace-living.jpg",
  },
  {
    title: "Farmhouse Kitchen",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/farmhouse-kitchen.jpg",
  },
  {
    title: "Overhead Living Room View",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/overhead-living.jpg",
  },
  {
    title: "Modern Linear Fireplace",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/fireplace-living.jpg",
  },
  {
    title: "Kitchen Detail & Backsplash",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/pendant-kitchen.jpg",
  },
  // New photos
  {
    title: "Stone Ranch Estate",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/stone-ranch-exterior.jpg",
  },
  {
    title: "Staged Master Suite",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/staged-master-bedroom.jpg",
  },
  {
    title: "Open-Plan Living & Kitchen",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/open-living-kitchen.jpg",
  },
  {
    title: "Lakefront Kitchen Island",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/lakefront-kitchen-island.jpg",
  },
  {
    title: "Coastal Living Room",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/coastal-living-room.jpg",
  },
  {
    title: "Modern Great Room",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/modern-great-room.jpg",
  },
  {
    title: "Game Room with Fireplace",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/game-room-fireplace.jpg",
  },
  {
    title: "Marble Kitchen & Dining",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/marble-kitchen-dining.jpg",
  },
  {
    title: "Modern Dining & Kitchen",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/modern-dining-kitchen.jpg",
  },
  {
    title: "Lakefront Living Room",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/lakefront-living-room.jpg",
  },
  {
    title: "Lakefront Screened Porch",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/lakefront-screened-porch.jpg",
  },
  {
    title: "Marble Chef Kitchen",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/marble-chef-kitchen.jpg",
  },
  {
    title: "Sunset Dining Room",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/sunset-dining-room.jpg",
  },
  {
    title: "Home Office",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/dark-home-office.jpg",
  },
  {
    title: "Designer Powder Room",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/floral-powder-room.jpg",
  },
  {
    title: "Lakefront Garden Path",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/lakefront-garden-path.jpg",
  },
  {
    title: "Cottage Bedroom with Stone Fireplace",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/cottage-bedroom-fireplace.jpg",
  },
  {
    title: "Modern Master Bathroom",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/modern-master-bath.jpg",
  },
  {
    title: "Lakefront Sunset Living",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/lakefront-sunset-living.jpg",
  },
  {
    title: "Golf Simulator Room",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/golf-simulator-room.jpg",
  },
  {
    title: "Twilight Wooded Estate",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/twilight-wooded-exterior.jpg",
  },
];

export default async function PortfolioPage() {
  const videoIds = projects
    .filter((p) => p.type === "video" && p.vimeoId)
    .map((p) => p.vimeoId!);
  const thumbnails = await getVimeoThumbnails(videoIds);
  const projectsWithThumbs = projects.map((p) =>
    p.vimeoId ? { ...p, thumbnail: thumbnails[p.vimeoId] } : p
  );

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background pt-24 pb-4 sm:pt-28 sm:pb-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#111111_0%,transparent_55%)]" />
        <div className="absolute left-10 top-40 h-48 w-48 rounded-full bg-purple/[0.03] blur-[60px] animate-float" />
        <div className="absolute right-[8%] top-[25%] h-32 w-32 rounded-full border border-dashed border-purple/10 spin-ring hidden lg:block" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
          <AnimateOnScroll animation="fade-up">
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
          </AnimateOnScroll>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="bg-background pt-4 pb-10 sm:pt-6 sm:pb-16">
        <PortfolioFilter projects={projectsWithThumbs} />
      </section>
    </>
  );
}
