import type { Metadata } from "next";
import { Archivo, Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageViewTracker } from "@/components/page-view-tracker";
import { SplashScreen } from "@/components/splash-screen";
import { ScrollReveal } from "@/components/scroll-reveal";
import { BUSINESS } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// The display face. Archivo is an American grotesque with the flat, wide
// terminals of signage lettering — it holds up set very large and tight,
// which is what the new headline scale asks of it. Only the weights the
// design actually uses are requested; body copy stays on Geist.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#07090c",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pgcreativeswi.com"),
  title: {
    default: "PG Creatives | Professional Grade Media",
    template: "%s | PG Creatives",
  },
  description:
    "Professional grade media for tailored experiences. Real estate photography, videography, drone shots, 3D tours, and commercial branding in Green Bay, Madison & Milwaukee, Wisconsin.",
  keywords: [
    "PG Creatives",
    "real estate photography",
    "videography",
    "drone photography",
    "3D tours",
    "commercial branding",
    "Green Bay",
    "Madison",
    "Milwaukee",
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
      "Professional grade media for tailored experiences in Green Bay, Madison & Milwaukee, WI.",
    url: "https://pgcreativeswi.com",
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
      "Professional grade media for tailored experiences in Green Bay, Madison & Milwaukee, WI.",
    images: ["/og-home.jpg"],
  },
  robots: { index: true, follow: true },
  // Canonical is set per page. A canonical here would be inherited by every
  // route that doesn't override it — which told search engines that /services,
  // /team, etc. were all duplicates of the home page.
  alternates: { canonical: "/" },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${BUSINESS.url}/#business`,
  name: BUSINESS.name,
  legalName: BUSINESS.legalName,
  description: BUSINESS.description,
  url: BUSINESS.url,
  email: BUSINESS.email,
  telephone: Object.values(BUSINESS.phones).map((p) => p.number),
  image: `${BUSINESS.url}/og-home.jpg`,
  logo: `${BUSINESS.url}/images/pg-logo.png`,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressRegion: "WI",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "City", name: "Green Bay, WI" },
    { "@type": "City", name: "Madison, WI" },
    { "@type": "City", name: "Milwaukee, WI" },
    { "@type": "Place", name: "Fox Valley, WI" },
  ],
  serviceType: [
    "Real Estate Photography",
    "Videography",
    "Drone Photography",
    "3D Virtual Tours",
    "Commercial Branding",
    "Social Media Content Creation",
  ],
  sameAs: Object.values(BUSINESS.socials),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${archivo.variable} h-full antialiased`}
    >
      {/* overflow-x-clip, not -hidden: `hidden` makes the body a scroll
          container, and on iOS Safari a scroll container on the body can
          swallow the page's vertical scrolling outright. `clip` suppresses the
          same horizontal overflow without ever creating one. */}
      <body className="min-h-full flex flex-col overflow-x-clip pb-[env(safe-area-inset-bottom)] bg-background">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:rounded-lg focus:bg-signal focus:text-[#07090c] focus:px-4 focus:py-2 focus:font-semibold">
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <PageViewTracker />
        <ScrollReveal />
        <Header />
        <SplashScreen />
        <div className="relative flex-1 flex flex-col">
          <div className="pointer-events-none absolute inset-0 overflow-hidden gradient-mesh-unified" />
          <main id="main-content" className="flex-1 pt-16 lg:pt-20">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
