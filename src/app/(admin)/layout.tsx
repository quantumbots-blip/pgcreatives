import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";

/**
 * The dashboard's own root layout.
 *
 * The admin pages used to render inside the marketing shell, which meant the
 * floating glass navigation sat over the top of the lead list, the splash
 * screen ran before the numbers appeared, the site footer hung underneath,
 * and the aurora and bokeh layers animated behind an internal tool. None of
 * that belongs here, and on a phone the header alone cost eighty pixels of a
 * screen the owner is trying to read leads on.
 *
 * Route groups let a section carry its own html and body, so this is a second
 * root layout rather than a set of conditions inside the first. Neither
 * layout has to know the other exists, and no URL changed: (site) and (admin)
 * are grouping folders, not path segments.
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
  viewportFit: "cover" as const,
  themeColor: "#07090c",
};

export const metadata: Metadata = {
  title: "Dashboard | PG Creatives",
  // Belt and braces with the Disallow in robots.ts.
  robots: { index: false, follow: false },
  /* Installable, and only the dashboard is. The manifest's scope is /admin,
     so a visitor to the marketing site is never asked to install anything;
     the owner gets an icon that opens straight onto the leads. */
  manifest: "/admin.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PG Leads",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/app-icon-192.png",
  },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full bg-ground pb-[env(safe-area-inset-bottom)]">{children}</body>
    </html>
  );
}
