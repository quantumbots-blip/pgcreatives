import type { CSSProperties, ReactNode } from "react";

export type RevealAnimation =
  | "fade-up"
  | "rise"
  | "fade-in-scale"
  | "slide-in-left"
  | "slide-in-right"
  /* Arrive through Z rather than sliding up the page. */
  | "depth"
  | "depth-left"
  | "depth-right";

/**
 * Scroll-triggered entrance. Server component — ships no JavaScript of its
 * own. The element renders fully visible; `ScrollReveal` (mounted once in the
 * root layout) hides below-the-fold `.reveal` elements after hydration and
 * reveals each one as it scrolls into view. See `.reveal` in globals.css for
 * the variants and the rules that keep this cheap on phones.
 *
 * Because visibility is only ever removed *after* hydration, a slow phone or a
 * blocked script can never leave a section blank — the failure mode that made
 * the previous scroll-triggered version get switched off on mobile.
 */
export function AnimateOnScroll({
  children,
  animation = "fade-up",
  delay = 0,
  duration,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  animation?: RevealAnimation;
  /** Seconds. Applied as a transition delay once the element is in view. */
  delay?: number;
  /** Seconds. Defaults to the CSS value (0.7s). */
  duration?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const vars: Record<string, string> = {};
  if (delay) vars["--reveal-delay"] = `${delay}s`;
  if (duration) vars["--reveal-duration"] = `${duration}s`;
  const style = Object.keys(vars).length ? (vars as CSSProperties) : undefined;

  return (
    <Tag className={`reveal ${className}`} data-reveal={animation} style={style}>
      {children}
    </Tag>
  );
}
