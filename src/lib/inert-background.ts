/**
 * Make the page behind a fullscreen overlay unreachable.
 *
 * `aria-modal="true"` is a promise to assistive technology, not an
 * enforcement mechanism: it hides the background from a screen reader's
 * virtual cursor but does nothing to Tab order. Without `inert`, tabbing past
 * the last item in an open mobile menu or video dialog lands on links behind
 * the opaque overlay, where focus is invisible and the user is stranded.
 *
 * `inert` removes the subtree from both the tab order and the accessibility
 * tree in one attribute, and is supported everywhere this site runs.
 */
export function setBackgroundInert(inert: boolean) {
  const el = document.getElementById("page-content");
  if (!el) return;
  if (inert) el.setAttribute("inert", "");
  else el.removeAttribute("inert");
}
