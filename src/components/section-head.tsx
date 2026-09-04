import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { DisplayLines } from "@/components/display-lines";

/**
 * The opening of a section: heading left, and either a lede or the section's
 * utility link right, sharing one baseline.
 *
 * Replaces the mix of centered and left headings, `max-w-xl` boxes and the
 * `mt-8` offsets that were spacing for a rule that no longer exists. The
 * heading column is 1.5fr so a `display-2` line of 22 characters holds at
 * every width from 1024 up; below that the aside drops beneath the heading.
 */
export function SectionHead({
  lines,
  lede,
  link,
  as = "h2",
  className = "",
}: {
  lines: ReactNode[];
  lede?: ReactNode;
  link?: { href: string; label: string };
  as?: "h2" | "h1" | "p" | "div";
  className?: string;
}) {
  return (
    <AnimateOnScroll animation="lines" className={`section-head ${className}`}>
      <DisplayLines as={as} className="display-2 text-white" lines={lines} />
      {lede && (
        <AnimateOnScroll animation="rise" delay={0.16}>
          <p className="lede section-head-lede">{lede}</p>
        </AnimateOnScroll>
      )}
      {!lede && link && (
        <AnimateOnScroll animation="rise" delay={0.16} className="section-head-link">
          <Link href={link.href} className="rule-link">
            {link.label}
            <ArrowRight className="arrow h-4 w-4" />
          </Link>
        </AnimateOnScroll>
      )}
    </AnimateOnScroll>
  );
}
