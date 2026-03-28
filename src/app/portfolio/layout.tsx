import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | Our Best Work",
  description:
    "Browse PG Creatives' portfolio of professional real estate photography, cinematic videography, drone aerial footage, and 3D virtual tours across Wisconsin.",
  keywords: [
    "portfolio",
    "real estate photos",
    "property videos",
    "drone shots",
    "Wisconsin photographer portfolio",
  ],
  openGraph: {
    title: "Portfolio | PG Creatives",
    description: "Our best professional media work across Wisconsin.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
