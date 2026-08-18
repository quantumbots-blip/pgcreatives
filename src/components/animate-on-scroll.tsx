import type { ReactNode } from "react";

type Animation = "fade-up" | "fade-in-scale" | "slide-in-left" | "slide-in-right";

/**
 * Entrance animation, done entirely in CSS.
 *
 * This used to be a client component: it rendered its children at opacity 0 and
 * revealed them from an IntersectionObserver once they neared the viewport.
 * That made every wrapped section — nineteen of them on the home page — depend
 * on JavaScript merely to become visible, so a slow or blocked script left the
 * page full of blank gaps. Phones were already opted out of it in CSS for
 * exactly that reason; this extends the same guarantee to every viewport.
 *
 * A CSS animation runs off the main thread and does not wait for hydration, so
 * the content is guaranteed to appear. The trade is that the animation is no
 * longer scroll-triggered — everything plays on load. Below the fold it has
 * long finished before you scroll there, which is what phones have been doing
 * all along.
 *
 * No hooks, no "use client": this renders on the server and ships no JavaScript.
 */
export function AnimateOnScroll({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 0.6,
  className = "",
}: {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <div
      className={`scroll-reveal ${className}`}
      style={{
        // `both` holds the opening frame through the delay and the closing
        // frame afterwards, so the element is never left in an undefined state.
        animation: `${animation} ${duration}s cubic-bezier(0.23, 1, 0.32, 1) ${delay}s both`,
      }}
    >
      {children}
    </div>
  );
}
