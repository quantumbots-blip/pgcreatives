import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

/**
 * Text with a soft entrance, done entirely in CSS.
 *
 * This used to split the string into one <span> per word — each with its own
 * inline transition and staggered delay — and reveal them from a client effect.
 * Two problems: the spans were server-rendered at opacity 0, so the paragraph
 * was missing entirely until hydration, and a sentence became dozens of extra
 * DOM nodes for React to hydrate. Phones already skipped the effect.
 *
 * One element, one animation, no JavaScript. The per-word stagger is gone; the
 * paragraph now fades up as a whole.
 */
export function TextReveal({ text, className, delay = 0 }: TextRevealProps) {
  return (
    <span
      className={cn("text-reveal inline-block", className)}
      style={{
        animation: `fade-up 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${delay}s both`,
      }}
    >
      {text}
    </span>
  );
}
