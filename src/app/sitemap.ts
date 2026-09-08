import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BUSINESS.url;
  /* Build time, which is the truth available here: the pages are statically
     rendered, so the deploy is genuinely when they last changed. A hardcoded
     date would go stale and a per-request one would claim every page changed
     on every crawl, which crawlers learn to ignore. */
  const lastModified = new Date();

  return [
    { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/services`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services/content-creator-program`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/portfolio`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/team`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
