import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/data";

/**
 * Who may read this site.
 *
 * The answer engines are named explicitly rather than left to the wildcard,
 * for two reasons. Some of them read robots.txt looking for their own token
 * and treat a bare `*` conservatively, and naming them makes the decision a
 * decision: this business wants to be quoted when somebody asks an assistant
 * who photographs listings in Green Bay, so every one of them is allowed.
 *
 * Two kinds of crawler are listed together on purpose. The retrieval agents
 * (OAI-SearchBot, PerplexityBot, ClaudeBot) are how the site gets cited in an
 * answer. The training crawlers (GPTBot, Google-Extended, CCBot) are how it
 * gets known at all. Blocking the second while allowing the first is a common
 * half measure that mostly costs visibility for a business this size.
 *
 * /admin and /api are closed to all of them, as before.
 */

const AI_AGENTS = [
  // OpenAI: search retrieval, live browsing on a user's behalf, training.
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  // Anthropic.
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  // Perplexity.
  "PerplexityBot",
  "Perplexity-User",
  // Google's separate token for AI training and grounding. Refusing this one
  // does not remove the site from Search, but it does remove it from AI
  // Overviews, which is exactly where this business wants to appear.
  "Google-Extended",
  // Apple, Meta, Amazon, Common Crawl.
  "Applebot-Extended",
  "meta-externalagent",
  "Amazonbot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  const closed = ["/admin", "/api/"];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: closed },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: "/", disallow: closed })),
    ],
    sitemap: `${BUSINESS.url}/sitemap.xml`,
    host: BUSINESS.url,
  };
}
