import { notFound } from "next/navigation";

/* The catch-all that makes the site's own 404 reachable.

   `not-found.tsx` inside a route group only answers `notFound()` calls raised
   from inside that group. A URL that matches no route never enters the group
   at all, so every mistyped link, every stale bookmark and every bad inbound
   link was served Next's built-in white error page: no header, no footer, no
   fonts, no way back.

   A catch-all is the lowest-priority route in the tree, so every real route
   still wins and nothing else changes. Anything left over lands here and
   raises `notFound()`, which renders `(site)/not-found.tsx` inside the site
   layout and answers with a real 404 status. */

/* The metadata lives on `(site)/not-found.tsx`, not here: a page that throws
   `notFound()` hands metadata resolution to the boundary it renders. */
export default function Unmatched() {
  notFound();
}
