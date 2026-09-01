import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

/* One priced card, used by both the home page packages and the Content
   Creator Program tiers.

   These were written twice, near-identically — same surface classes, same
   "popular" override string, same badge, same price scale, same checklist,
   same footer button. Only the CTA label and the price suffix differed.
   Extracted while they were still in sync, so a change to the priced-card
   look happens once. */
export function PricingCard({
  name,
  price,
  priceSuffix,
  description,
  features,
  popular = false,
  href,
  cta,
}: {
  name: string;
  price: string;
  /** e.g. "/ month". Omitted for one-off packages. */
  priceSuffix?: string;
  description: string;
  features: string[];
  popular?: boolean;
  href: string;
  cta: string;
}) {
  return (
    <div
      className={`surface flex h-full flex-col p-7 sm:p-8 ${
        popular
          ? "!border-signal/40 !bg-[#111823] shadow-[0_0_60px_-20px_rgba(78,168,255,0.45)]"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="display-3 text-white">{name}</h3>
        {popular && (
          <span className="meta meta-signal shrink-0 rounded-full border border-signal/35 px-2.5 py-1.5">
            Most booked
          </span>
        )}
      </div>

      <p className="mt-5 flex items-baseline gap-2">
        <span className="display-2 !text-[clamp(1.75rem,2.6vw,2.25rem)] text-white">
          {price}
        </span>
        {priceSuffix && <span className="meta">{priceSuffix}</span>}
      </p>

      <p className="mt-4 border-t border-line pt-5 text-sm leading-relaxed text-ink-2">
        {description}
      </p>

      <ul className="mt-6 flex-1 space-y-3.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-ink-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
            {feature}
          </li>
        ))}
      </ul>

      <Link href={href} className={`btn mt-8 w-full ${popular ? "btn-primary" : "btn-ghost"}`}>
        {cta}
        <ArrowRight className="arrow h-4 w-4" />
      </Link>
    </div>
  );
}
