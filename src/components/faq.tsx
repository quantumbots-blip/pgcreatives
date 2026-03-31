"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

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

const faqs: FAQItem[] = [
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
      "We serve Green Bay, Madison, the Fox Valley, and surrounding areas throughout Wisconsin. For larger projects we're happy to travel further — just reach out and we'll make it work.",
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
      "Real estate packages start at $250 and include HDR photography, drone imagery, and virtual staging options. Pricing varies by property size and services needed — check our Services page or request a custom quote.",
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
      "You can book directly through our client portal for Green Bay or Madison, or fill out our contact form for a custom quote. We typically respond within a few hours during business days.",
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

export function FAQ() {
  const [activeCategory, setActiveCategory] = useState<Category>("General");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = faqs.filter((f) => f.category === activeCategory);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="relative overflow-hidden bg-black py-16 sm:py-28">
      {/* Background accents */}
      <div className="absolute inset-0 gradient-mesh-rich pointer-events-none" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-full max-w-5xl -translate-x-1/2 bg-gradient-to-r from-transparent via-purple/30 to-transparent" />
      <div className="pointer-events-none absolute -right-40 top-40 h-80 w-80 rounded-full bg-purple/[0.12] blur-[120px]" />
      <div className="pointer-events-none absolute left-[10%] bottom-[20%] h-60 w-60 rounded-full bg-sky-500/[0.10] blur-[60px] sm:blur-[100px]" />
      <div className="pointer-events-none absolute right-[15%] top-[15%] h-28 w-28 rounded-full border border-dashed border-purple/[0.10] spin-ring hidden lg:block" />
      <div className="pointer-events-none absolute left-[25%] top-[40%] h-48 w-48 rounded-full bg-teal-400/[0.06] blur-[100px]" />

      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        {/* Heading */}
        <AnimateOnScroll animation="fade-up">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-white/60">
            Everything you need to know about working with us.
          </p>
        </div>
        </AnimateOnScroll>

        {/* Category pills */}
        <AnimateOnScroll animation="fade-up" delay={0.1}>
        <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(null);
              }}
              className={cn(
                "rounded-full px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium tracking-wide transition-all duration-200",
                activeCategory === cat
                  ? "bg-gradient-to-r from-purple/25 to-sky-500/15 text-purple-light border border-purple/35 shadow-[0_0_16px_rgba(43,111,184,0.15)]"
                  : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/70"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        </AnimateOnScroll>

        {/* FAQ items */}
        <AnimateOnScroll animation="fade-up" delay={0.2}>
        <div className="mt-8 sm:mt-10 space-y-2.5 sm:space-y-3">
          {filtered.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={`${activeCategory}-${i}`}
                className={cn(
                  "rounded-xl border",
                  isOpen
                    ? "border-purple/25 bg-gradient-to-r from-purple/[0.06] to-sky-500/[0.03] shadow-[0_0_24px_rgba(43,111,184,0.08)]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-purple/15 hover:bg-purple/[0.02]"
                )}
              >
                <button
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${activeCategory}-${i}`}
                  className="flex w-full items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 text-left"
                >
                  <span className="text-sm font-semibold text-white sm:text-lg">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-white/30 transition-transform duration-200",
                      isOpen && "rotate-180 text-purple-light"
                    )}
                  />
                </button>
                <div
                  id={`faq-${activeCategory}-${i}`}
                  role="region"
                  className={cn(
                    "overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <p className="px-4 sm:px-6 pb-4 sm:pb-5 text-sm leading-relaxed text-white/60 sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
