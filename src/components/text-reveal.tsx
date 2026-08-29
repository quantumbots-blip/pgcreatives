import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

/** A paragraph that rises into view when scrolled to. */
export function TextReveal({ text, className, delay = 0 }: TextRevealProps) {
  return (
    <AnimateOnScroll as="span" animation="fade-up" delay={delay} className={cn("inline-block", className)}>
      {text}
    </AnimateOnScroll>
  );
}
