import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { DisplayLines } from "@/components/display-lines";
import { PortfolioFilter } from "@/components/portfolio-filter";
import { getVimeoMetas } from "@/lib/vimeo";

export const revalidate = 3600;

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
  {
    title: "Property Cinematic Tour",
    category: "Real Estate",
    type: "video" as const,
    vimeoId: "1172649130",
  },
  // Photos
  {
    title: "Open-Concept Living Room",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/luxury-living-room.jpg",
  },
  {
    title: "Downtown Condo",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/modern-condo.jpg",
  },
  {
    title: "Lakefront Estate Aerial",
    category: "Drone",
    type: "photo" as const,
    image: "/images/aerial-lakefront.jpg",
    feature: true,
  },
  {
    title: "Lakehouse Kitchen & Fireplace",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/lakehouse-kitchen.jpg",
  },
  {
    title: "Cottage Exterior",
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
    title: "Modern Estate After Dark",
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
    title: "Staged Primary Suite",
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
    title: "Waterfront Estate at Sunset",
    category: "Drone",
    type: "photo" as const,
    image: "/images/marble-kitchen-dining.jpg",
    feature: true,
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
    feature: true,
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
    title: "Modern Primary Bathroom",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/modern-master-bath.jpg",
  },
  {
    title: "Coffered-Ceiling Living Room",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/lakefront-sunset-living.jpg",
  },
  {
    title: "Golf Simulator Room",
    category: "Real Estate",
    type: "photo" as const,
    image: "/images/golf-simulator-room.jpg",
    feature: true,
  },
];

export default async function PortfolioPage() {
  const videoIds = projects
    .filter((p) => p.type === "video" && p.vimeoId)
    .map((p) => p.vimeoId!);
  const metas = await getVimeoMetas(videoIds);
  const projectsWithThumbs = projects.map((p) =>
    p.vimeoId
      ? {
          ...p,
          thumbnail: metas[p.vimeoId]?.thumbnail,
          portrait: metas[p.vimeoId]?.portrait,
        }
      : p
  );

  const filmCount = projects.filter((p) => p.type === "video").length;
  const stillCount = projects.filter((p) => p.type === "photo").length;

  return (
    <>
      <section className="section-tight">
        <div className="shell">
          <AnimateOnScroll animation="lines">
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
              <DisplayLines
                as="h1"
                className="display-1 text-white"
                lines={["Every listing,", "in its best light."]}
              />
              <div className="lg:pb-3">
                <p className="lede">
                  Work made for agents, brokers, and businesses across Green Bay,
                  Madison, Milwaukee, and the Fox Valley.
                </p>
                <p className="meta mt-6">
                  <span className="text-signal">{filmCount} films</span>
                  <span className="mx-2" aria-hidden="true">/</span>
                  <span>{stillCount} stills</span>
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="section pt-0">
        <PortfolioFilter projects={projectsWithThumbs} />
      </section>
    </>
  );
}
