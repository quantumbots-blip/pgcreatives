import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* Next emits its own `noindex` for this boundary, but it does NOT stop the
   layout's site-wide defaults reaching the same document. The layout sets
   `robots: { index: true, follow: true }` and `alternates: { canonical: "/" }`
   as the values every real page overrides — and a 404 had nothing to override
   them with. Every mistyped URL on the live site was shipping two
   contradictory robots tags AND a canonical claiming the URL was the home
   page, which is the strongest dedup signal there is pointed at junk.

   This has to live here rather than on the catch-all page: a page that throws
   `notFound()` hands metadata resolution to this boundary. */
export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "That page is not here. The work, the services and the team are one click away.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <section className="section flex min-h-[70vh] items-center">
      <div className="shell">
        <div className="max-w-3xl">
          <p className="meta meta-signal">Error 404</p>
          <h1 className="display-1 mt-5 text-white">This one is not in the library.</h1>
          <p className="lede mt-6 max-w-lg">
            The page you are looking for does not exist or has moved. The work,
            the services and the team are all one click away.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/" className="btn btn-primary">
              Back to the start
              <ArrowRight className="arrow h-4 w-4" />
            </Link>
            <Link href="/portfolio" className="btn btn-ghost">
              See the work
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
