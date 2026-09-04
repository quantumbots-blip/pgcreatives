import type { ReactNode } from "react";
import { DisplayLines } from "@/components/display-lines";

/**
 * The opening of every inner page: the h1 on its own row, the lede beneath it
 * in the right-hand column, and an optional meta line in the left.
 *
 * The h1 used to share a two-column grid with the lede, which gave a 100px
 * display face a 625px column at 1440. Every authored line broke into two,
 * so "Every listing, / in its best light." arrived as four ragged lines and
 * the line-by-line entrance animated the wrong thing. Full width holds the
 * longest authored line on the site (1017px) with room to spare.
 *
 * The lines rise on load rather than on intersection: this block is on
 * screen when the page arrives, so an observer would have nothing to wait
 * for and the visitor would watch nothing happen.
 */
export function PageHead({
  lines,
  lede,
  meta,
}: {
  lines: ReactNode[];
  lede: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <section className="section-tight">
      <div className="shell">
        <div className="page-head">
          <DisplayLines as="h1" className="display-1 text-white" lines={lines} entrance />
          <div className="page-head-row">
            {meta ? (
              <div className="animate-hero-fade-up" style={{ animationDelay: "0.5s" }}>
                {meta}
              </div>
            ) : (
              <div className="hidden lg:block" aria-hidden="true" />
            )}
            <p className="animate-hero-fade-up lede page-head-lede" style={{ animationDelay: "0.42s" }}>
              {lede}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
