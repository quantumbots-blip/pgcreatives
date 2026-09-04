import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Next already emits noindex for the not-found boundary; only the title is
// missing by default.
export const metadata: Metadata = {
  title: "Page Not Found",
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
