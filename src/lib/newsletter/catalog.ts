/**
 * The pictures the editor offers.
 *
 * The same photographs the portfolio shows, with the portfolio's own titles
 * as the starting alt text. The file names are not to be trusted for that:
 * marble-kitchen-dining.jpg is a waterfront estate from the air, and the
 * titles are the description that was actually checked against the frame.
 */

export type CatalogPhoto = { src: string; title: string; category: string };

export const PHOTOS: CatalogPhoto[] = [
  { src: "/images/marble-kitchen-dining.jpg", title: "Waterfront Estate at Sunset", category: "Drone" },
  { src: "/images/aerial-lakefront.jpg", title: "Lakefront Estate Aerial", category: "Drone" },
  { src: "/images/luxury-estate-night.jpg", title: "Modern Estate After Dark", category: "Drone" },
  { src: "/images/luxury-living-room.jpg", title: "Luxury Listing Showcase", category: "Real Estate" },
  { src: "/images/lakefront-sunset-living.jpg", title: "Coffered-Ceiling Living Room", category: "Real Estate" },
  { src: "/images/lakehouse-kitchen.jpg", title: "Lakehouse Kitchen & Fireplace", category: "Real Estate" },
  { src: "/images/gourmet-kitchen.jpg", title: "Gourmet Kitchen Design", category: "Real Estate" },
  { src: "/images/marble-chef-kitchen.jpg", title: "Marble Chef Kitchen", category: "Real Estate" },
  { src: "/images/farmhouse-kitchen.jpg", title: "Farmhouse Kitchen", category: "Real Estate" },
  { src: "/images/pendant-kitchen.jpg", title: "Kitchen Detail & Backsplash", category: "Real Estate" },
  { src: "/images/lakefront-kitchen-island.jpg", title: "Lakefront Kitchen Island", category: "Real Estate" },
  { src: "/images/modern-dining-kitchen.jpg", title: "Modern Dining & Kitchen", category: "Real Estate" },
  { src: "/images/open-living-kitchen.jpg", title: "Open-Plan Living & Kitchen", category: "Real Estate" },
  { src: "/images/modern-entryway.jpg", title: "Modern Home Entryway", category: "Real Estate" },
  { src: "/images/modern-great-room.jpg", title: "Modern Great Room", category: "Real Estate" },
  { src: "/images/stone-fireplace-living.jpg", title: "Great Room with Stone Fireplace", category: "Real Estate" },
  { src: "/images/fireplace-living.jpg", title: "Modern Linear Fireplace", category: "Real Estate" },
  { src: "/images/rustic-living.jpg", title: "Classic Lakehouse Living Room", category: "Real Estate" },
  { src: "/images/coastal-living-room.jpg", title: "Coastal Living Room", category: "Real Estate" },
  { src: "/images/lakefront-living-room.jpg", title: "Lakefront Living Room", category: "Real Estate" },
  { src: "/images/overhead-living.jpg", title: "Overhead Living Room View", category: "Real Estate" },
  { src: "/images/sunset-dining-room.jpg", title: "Sunset Dining Room", category: "Real Estate" },
  { src: "/images/staged-master-bedroom.jpg", title: "Staged Primary Suite", category: "Real Estate" },
  { src: "/images/cottage-bedroom-fireplace.jpg", title: "Cottage Bedroom with Stone Fireplace", category: "Real Estate" },
  { src: "/images/modern-master-bath.jpg", title: "Modern Primary Bathroom", category: "Real Estate" },
  { src: "/images/floral-powder-room.jpg", title: "Designer Powder Room", category: "Real Estate" },
  { src: "/images/game-room-fireplace.jpg", title: "Game Room with Fireplace", category: "Real Estate" },
  { src: "/images/golf-simulator-room.jpg", title: "Golf Simulator Room", category: "Real Estate" },
  { src: "/images/screened-porch.jpg", title: "Screened Porch Retreat", category: "Real Estate" },
  { src: "/images/lakefront-screened-porch.jpg", title: "Lakefront Screened Porch", category: "Real Estate" },
  { src: "/images/lakefront-garden-path.jpg", title: "Lakefront Garden Path", category: "Real Estate" },
  { src: "/images/cottage-exterior.jpg", title: "Cottage Exterior", category: "Real Estate" },
  { src: "/images/stone-ranch-exterior.jpg", title: "Stone Ranch Estate", category: "Real Estate" },
  { src: "/images/modern-condo.jpg", title: "Downtown Condo", category: "Real Estate" },
];

export type CatalogFilm = {
  vimeoId: string;
  title: string;
  category: string;
  poster: string;
  portrait: boolean;
};

/** The team, for the signed note. Names and roles as the team page has them. */
export type CatalogPerson = { src: string; name: string; role: string };

export const TEAM: CatalogPerson[] = [
  { src: "/team/michael-mcintee.jpg", name: "Michael McIntee", role: "Founder" },
  { src: "/team/isaiah-bastian.jpg", name: "Isaiah Bastian", role: "Lead Creative (Madison)" },
  { src: "/team/brenden-gruber.jpg", name: "Brenden Gruber", role: "Brand Development" },
  { src: "/team/liam-janowski.jpg", name: "Liam Janowski", role: "Creative Specialist (Green Bay)" },
  { src: "/team/calvin-lee.jpg", name: "Calvin Lee", role: "Creative Specialist (Appleton)" },
  { src: "/team/ryan-ybanez.png", name: "Diether Ryan Ybañez", role: "Senior Video Editor" },
  { src: "/team/lyle-alquilos.jpg", name: "Lyle Alquilos", role: "Video Editor" },
  { src: "/team/claudio-ondoy-jr.png", name: "Claudio Ondoy Jr", role: "Video Editor" },
  { src: "/team/gvy-teleron.png", name: "Gvy Teleron", role: "Video Editor" },
  { src: "/team/charlibeth-sicad.png", name: "Charlibeth Sicad", role: "Administrative Coordinator" },
];
