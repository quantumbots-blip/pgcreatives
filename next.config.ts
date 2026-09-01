import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Vimeo poster frames. Without these the portfolio and the program page
      // rendered raw <img src="https://vumbnail.com/…"> — no srcset, no AVIF,
      // no sizes — because next/image refuses hosts that are not listed.
      // Measured at 1205 KB of untouched JPEG on /portfolio alone, every one
      // pinned to a _640 rendition for tiles that render 272-289px wide.
      {
        protocol: "https",
        hostname: "i.vimeocdn.com",
      },
      {
        protocol: "https",
        hostname: "vumbnail.com",
      },
    ],
  },
  async redirects() {
    return [
      // www serves the full site as a second host. Canonical tags point at the
      // apex, but a real redirect is what stops the duplicate from being
      // crawled and linked to at all.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.pgcreativeswi.com" }],
        destination: "https://pgcreativeswi.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.mp4",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Deliberately no Cache-Control rule for the content routes.
      //
      // There used to be one matching /(portfolio|services|team|contact|privacy)
      // with s-maxage=60. It did two unhelpful things: it overrode each route's
      // own `revalidate` (3600s) with a far shorter edge TTL, and its pattern
      // did not match nested routes — so /services got 60s while its own child
      // /services/content-creator-program got the 3600s it asked for. Two
      // siblings with identical ISR settings cached an hour apart.
      //
      // Letting Next emit the headers from each route's `revalidate` keeps the
      // two in step and honours what the pages actually declare.
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=(), payment=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.unsplash.com https://i.vimeocdn.com https://vumbnail.com",
              "font-src 'self'",
              "connect-src 'self' blob:",
              "media-src 'self'",
              "frame-src 'self' https://player.vimeo.com",
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
