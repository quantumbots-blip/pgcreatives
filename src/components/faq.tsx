import { Fragment } from "react";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { RuleHead } from "@/components/rule-head";

const categories = [
  "General",
  "Pricing & Booking",
  "Production",
  "Delivery & Licensing",
  "Results",
] as const;

type Category = (typeof categories)[number];

interface FAQItem {
  question: string;
  answer: string;
  category: Category;
}

export const faqs: FAQItem[] = [
  // General
  {
    category: "General",
    question: "What does PG Creatives specialize in?",
    answer:
      "We specialize in professional-grade videography, photography, aerial drone footage, and immersive 3D tours. Our primary focus is real estate media and social media content for businesses across Wisconsin.",
  },
  {
    category: "General",
    question: "What areas do you serve?",
    answer:
      "We serve Green Bay, Madison, Milwaukee, the Fox Valley, and surrounding areas throughout Wisconsin. For larger projects we're happy to travel further — just reach out and we'll make it work.",
  },
  {
    category: "General",
    question: "Who do you work with?",
    answer:
      "We work with real estate agents, brokers, property managers, local businesses, restaurants, fitness studios, contractors, and anyone looking to elevate their visual brand with professional content.",
  },
  // Pricing & Booking
  {
    category: "Pricing & Booking",
    question: "How much does a real estate shoot cost?",
    answer:
      "Photography on its own starts at $225. Full listing packages start at $550 — PG Core covers daytime photography, a premium listing video, drone photography, and three virtual twilights; PG Growth ($725) adds a Matterport or Zillow 3D tour and a 2D floor plan; PG Platinum ($1,000) adds twilight photography and a day-to-night listing video. Pricing scales with square footage and varies slightly by market, so send us the address and we'll give you an exact number.",
  },
  {
    category: "Pricing & Booking",
    question: "Do you offer custom packages?",
    answer:
      "Absolutely. Every business is different, so we build custom packages based on your goals, content needs, and budget. Contact us for a free consultation and we'll put together a tailored plan.",
  },
  {
    category: "Pricing & Booking",
    question: "How do I book a shoot?",
    answer:
      "You can book directly through our client portal for Green Bay or Madison, or fill out our contact form for a custom quote. We usually reply the same day.",
  },
  {
    category: "Pricing & Booking",
    question: "What if I need to reschedule?",
    answer:
      "We understand plans change. Reschedules with at least 24 hours notice are free. Same-day cancellations may incur a fee depending on the project scope.",
  },
  // Production
  {
    category: "Production",
    question: "What types of video do you produce?",
    answer:
      "We produce listing videos, property tours, social media reels, brand story videos, drone cinematography, 3D virtual tours, and full production commercial content.",
  },
  {
    category: "Production",
    question: "Do you handle editing and post-production?",
    answer:
      "Yes, all editing, color grading, music licensing, and post-production is included. We deliver polished, ready-to-publish content — no extra work on your end.",
  },
  {
    category: "Production",
    question: "How should I prepare for a real estate shoot?",
    answer:
      "We recommend decluttering surfaces, turning on all lights, opening blinds, and ensuring the property is clean. We'll send a detailed prep checklist when you book.",
  },
  {
    category: "Production",
    question: "How long does a typical shoot take?",
    answer:
      "A standard real estate shoot takes 1–2 hours depending on property size. Commercial and social media shoots vary from 2–6 hours based on scope. We'll give you a time estimate upfront.",
  },
  // Delivery & Licensing
  {
    category: "Delivery & Licensing",
    question: "How quickly do I get my photos and videos?",
    answer:
      "Photo turnaround is next morning. Video turnaround is three business days. Yes, we do include rush delivery for time-sensitive projects.",
  },
  {
    category: "Delivery & Licensing",
    question: "Do I own the photos and videos?",
    answer:
      "Clients do not technically own the work, but you do receive the full commercial usage license from PG Creatives for all delivered content. You can use it across your website, social media, MLS listings, print materials, and ads without restrictions.",
  },
  {
    category: "Delivery & Licensing",
    question: "Are revisions included?",
    answer:
      "Yes, we include one round of revisions with every project. Additional revision rounds are available at a reasonable rate. We want you to be 100% satisfied.",
  },
  {
    category: "Delivery & Licensing",
    question: "Can I use the content for paid advertising?",
    answer:
      "Yes. Our standard license covers paid social media ads, Google Ads, print advertising, and any other commercial use. No additional licensing fees.",
  },
  // Results
  {
    category: "Results",
    question: "Will professional media actually help sell listings faster?",
    answer:
      "Absolutely. Listings with professional photography sell 32% faster and for higher prices on average. High-quality video tours and drone footage dramatically increase engagement and inquiries.",
  },
  {
    category: "Results",
    question: "Can you help grow my social media presence?",
    answer:
      "Yes. Beyond creating content, we advise on posting strategy, content calendars, and what types of video perform best for your industry. Many of our clients see 2–5x engagement increases within the first month.",
  },
];

function slug(category: Category) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Frequently asked questions — server-rendered, zero JavaScript.
 *
 * This was a client component holding two pieces of state: which category is
 * selected and which answer is open. That meant all eighteen questions and
 * answers were shipped to every visitor as JavaScript and hydrated, to power
 * behavior the browser already provides for free.
 *
 * The accordion is now a native <details>, and the category tabs are radio
 * inputs styled by their labels, switched in CSS (see `.faq-*` in globals.css).
 * Both are keyboard accessible by construction, and both work before — or
 * entirely without — JavaScript.
 */
export function FAQ() {
  return (
    <section className="section">
      <div className="shell">
        <AnimateOnScroll animation="fade-up">
          <RuleHead label="Questions" link={{ href: "/contact", label: "Ask us directly" }} />
          <h2 className="display-2 mt-8 max-w-2xl text-white">
            Everything you need to know before booking.
          </h2>
        </AnimateOnScroll>

        <div className="faq">
          {/* The radios now live inside the group they belong to, each
              immediately before its own label. Previously they had to be
              previous siblings of both the pill strip and the panel stack for
              the CSS to reach them, which put them outside the `radiogroup` —
              so the set had no accessible name and no "1 of 5". `:has()`
              removed that constraint. */}
          <AnimateOnScroll animation="fade-up" delay={0.1}>
            <div
              className="faq-pills mt-12 flex flex-wrap gap-2 sm:mt-14"
              role="radiogroup"
              aria-label="Question categories"
            >
              {categories.map((cat) => (
                /* A Fragment, not a wrapper element. Even `display: contents`
                   leaves a node between the radiogroup and its radios in
                   Chromium's accessibility tree, which cost the set its
                   posinset/setsize — the "3 of 5" a screen reader reads out. */
                <Fragment key={cat}>
                  <input
                    type="radio"
                    name="faq-category"
                    id={`faq-cat-${slug(cat)}`}
                    className="faq-radio"
                    defaultChecked={cat === categories[0]}
                    aria-controls={`faq-panel-${slug(cat)}`}
                  />
                  <label
                    htmlFor={`faq-cat-${slug(cat)}`}
                    className="faq-pill cursor-pointer rounded-full px-4 py-2.5 text-xs font-medium transition-colors duration-200 sm:px-5 sm:text-sm"
                  >
                    {cat}
                  </label>
                </Fragment>
              ))}
            </div>
          </AnimateOnScroll>

          <div>
            <div className="faq-panels mt-8 max-w-4xl border-t border-line sm:mt-10">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="faq-panel"
                  data-category={slug(cat)}
                  id={`faq-panel-${slug(cat)}`}
                  role="region"
                  aria-label={`${cat} questions`}
                >
                  {faqs
                    .filter((f) => f.category === cat)
                    .map((faq, i) => (
                      <details
                        key={faq.question}
                        className="faq-item reveal"
                        data-reveal="fade-up"
                        style={{ "--reveal-delay": `${i * 0.07}s` } as React.CSSProperties}
                      >
                        <summary className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left sm:py-6">
                          <span className="text-base font-medium text-white sm:text-lg">
                            {faq.question}
                          </span>
                          <svg
                            className="faq-chevron h-5 w-5 shrink-0 text-white/30 transition-transform duration-200"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </summary>
                        <p className="faq-answer max-w-2xl pb-6 text-sm leading-relaxed text-ink-2 sm:text-base">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
