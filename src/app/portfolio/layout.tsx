import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Portfolio",
    description:
      "Browse real estate photography, listing video, drone work and 3D tours produced for agents and businesses across Wisconsin.",
    path: "/portfolio",
    image: "/og-portfolio.jpg",
    imageAlt: "PG Creatives portfolio",
  }),
  keywords: [
    "real estate portfolio",
    "listing video examples",
    "drone photography Wisconsin",
    "property photography gallery",
  ],
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
