import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageViewTracker } from "@/components/page-view-tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pgcreatives.vercel.app"),
  title: {
    default: "PG Creatives | Professional Grade Media",
    template: "%s | PG Creatives",
  },
  description:
    "Professional grade media for tailored experiences. Real estate photography, videography, drone shots, 3D tours, and commercial branding in Green Bay & Madison, Wisconsin.",
  keywords: [
    "PG Creatives",
    "real estate photography",
    "videography",
    "drone photography",
    "3D tours",
    "commercial branding",
    "Green Bay",
    "Madison",
    "Wisconsin",
    "Fox Valley",
    "professional photography",
    "aerial drone",
    "virtual tours",
    "property photography",
    "brand photography",
    "media production",
    "content creation",
  ],
  openGraph: {
    title: "PG Creatives | Professional Grade Media",
    description:
      "Professional grade media for tailored experiences in Green Bay & Madison, WI.",
    url: "https://pgcreatives.vercel.app",
    siteName: "PG Creatives",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "PG Creatives - Professional Grade Media",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PG Creatives | Professional Grade Media",
    description:
      "Professional grade media for tailored experiences in Green Bay & Madison, WI.",
    images: ["/og-home.jpg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://pgcreatives.vercel.app" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:rounded-lg focus:bg-purple focus:px-4 focus:py-2 focus:text-white">
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "PG Creatives",
              description:
                "Professional grade media — real estate photography, videography, drone shots, 3D tours, and commercial branding.",
              url: "https://pgcreatives.vercel.app",
              telephone: ["(920) 777-0127", "(608) 420-6199"],
              image: "https://pgcreatives.vercel.app/og-home.jpg",
              priceRange: "$$",
              areaServed: [
                { "@type": "City", name: "Green Bay, WI" },
                { "@type": "City", name: "Madison, WI" },
              ],
              serviceType: [
                "Real Estate Photography",
                "Videography",
                "Drone Photography",
                "3D Virtual Tours",
                "Commercial Branding",
              ],
              sameAs: [
                "https://www.facebook.com/p/PG-Creatives-Wisconsin-61556298299463/",
                "https://www.instagram.com/pgcreativeswi/",
              ],
            }),
          }}
        />
        <PageViewTracker />
        <Header />
        <main id="main-content" className="flex-1 pt-16 lg:pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
