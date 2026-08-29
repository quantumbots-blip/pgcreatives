"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * The one piece of JavaScript behind every `.reveal` element on the site.
 *
 * Order of operations matters here and is the whole point of the design:
 *
 * 1. Server HTML renders every `.reveal` element fully visible.
 * 2. After hydration, this effect marks the elements that are *already on
 *    screen* as `is-visible` first, then flips `data-reveal-ready` on <html>.
 *    Only at that moment does the CSS hide anything — and only what is below
 *    the fold. Nothing the visitor can see ever blinks.
 * 3. One IntersectionObserver reveals elements as they approach the viewport
 *    and stops watching each one after it has played once.
 * 4. A MutationObserver catches `.reveal` elements React adds later (the
 *    portfolio filter re-renders its grid) so they get the same treatment.
 *
 * Reduced-motion visitors and browsers without IntersectionObserver never get
 * the ready flag, so for them the CSS never hides a thing.
 */

const REVEAL_ATTR = "data-reveal-ready";
const VISIBLE = "is-visible";
// Start the reveal a little before the element's top edge crosses into the
// viewport, so it is already moving as it appears rather than popping after.
const ROOT_MARGIN = "0px 0px -8% 0px";

function isOnScreen(el: Element, vh: number) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < vh;
}

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add(VISIBLE);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: ROOT_MARGIN, threshold: 0 }
    );

    const watch = (el: Element) => {
      if (el.classList.contains(VISIBLE)) return;
      io.observe(el);
    };

    // Anything currently on screen is revealed synchronously, before the CSS
    // is allowed to hide anything at all.
    const vh = window.innerHeight || root.clientHeight;
    const all = document.querySelectorAll<HTMLElement>(".reveal");
    for (const el of all) {
      if (isOnScreen(el, vh)) el.classList.add(VISIBLE);
      else watch(el);
    }
    root.setAttribute(REVEAL_ATTR, "");

    // Elements added later (client-side re-renders, filtered grids). Anything
    // inserted while already on screen is revealed on the next frame so it
    // never sits hidden waiting for a scroll event that isn't coming.
    const mo = new MutationObserver((records) => {
      const added: Element[] = [];
      for (const rec of records) {
        for (const node of rec.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.classList.contains("reveal")) added.push(node);
          added.push(...node.querySelectorAll(".reveal"));
        }
      }
      if (!added.length) return;
      const vh = window.innerHeight || root.clientHeight;
      for (const el of added) {
        if (isOnScreen(el, vh)) el.classList.add(VISIBLE);
        else watch(el);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Belt and braces: if anything is still hidden after a generous window —
    // an observer callback starved by a busy main thread, a browser quirk —
    // reveal whatever is on screen so no visitor is ever staring at a gap.
    const failsafe = window.setInterval(() => {
      const vh = window.innerHeight || root.clientHeight;
      const pending = document.querySelectorAll<HTMLElement>(
        `.reveal:not(.${VISIBLE})`
      );
      if (!pending.length) return;
      for (const el of pending) {
        if (isOnScreen(el, vh)) {
          el.classList.add(VISIBLE);
          io.unobserve(el);
        }
      }
    }, 1500);

    return () => {
      window.clearInterval(failsafe);
      mo.disconnect();
      io.disconnect();
      root.removeAttribute(REVEAL_ATTR);
    };
    // Re-run on navigation: the new page's elements need their own pass.
  }, [pathname]);

  return null;
}
