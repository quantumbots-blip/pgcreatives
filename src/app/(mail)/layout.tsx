import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";

/**
 * The pages a newsletter links to: the unsubscribe page and the copy that
 * opens in a browser. A third root layout, because neither belongs inside
 * the marketing shell: nobody who clicked Unsubscribe should sit through the
 * splash screen, and a page whose only job is one button does not need a
 * navigation bar to leave it by.
 */

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07090c",
};

export const metadata: Metadata = {
  title: "PG Creatives",
  robots: { index: false, follow: false },
};

export default function MailRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full bg-ground">{children}</body>
    </html>
  );
}
