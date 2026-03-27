import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
  ],
  openGraph: {
    title: "PG Creatives | Professional Grade Media",
    description:
      "Professional grade media for tailored experiences in Green Bay & Madison, WI.",
    url: "https://www.pgcreativeswi.com",
    siteName: "PG Creatives",
    locale: "en_US",
    type: "website",
  },
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
