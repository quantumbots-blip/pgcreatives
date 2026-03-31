export const BUSINESS = {
  name: "PG Creatives",
  legalName: "MCINTEE LLC",
  tagline: "Professional Grade Media",
  description:
    "Professional grade media — real estate photography, videography, drone shots, 3D tours, and commercial branding.",
  email: "pgcreativeswisconsin@gmail.com",
  locations: ["Green Bay", "Madison", "Fox Valley"],
  locationText: "Green Bay, Madison & Fox Valley, WI",
  phones: {
    greenBay: { label: "Green Bay", number: "(920) 777-0127", href: "tel:+19207770127" },
    madison: { label: "Madison", number: "(608) 420-6199", href: "tel:+16084206199" },
  },
  socials: {
    facebook: "https://www.facebook.com/p/PG-Creatives-Wisconsin-61556298299463/",
    instagram: "https://www.instagram.com/pgcreativeswi/",
  },
  portals: {
    greenBay: {
      label: "Green Bay Portal",
      href: "https://portal.spiro.media/order/pg/northeast-wisconsin",
    },
    madison: {
      label: "Madison Portal",
      href: "https://portal.spiro.media/order/pg/madison",
    },
  },
  url: "https://pgcreativeswi.com",
} as const;
