import type { CSSProperties, ReactNode } from "react";

/**
 * A display heading whose lines rise out of a mask, one after another.
 *
 * Each line sits in its own `overflow: hidden` block and starts pushed below
 * it, rotated slightly away from the reader — so the line does not fade in,
 * it arrives. It is the single move that most separates a considered page
 * from a templated one, and it costs two composited properties.
 *
 * Lines are authored, not measured. A runtime text-splitter would have to
 * read layout, re-split on resize, and would break the accessible name of the
 * heading; passing the breaks in keeps the markup honest, keeps the whole
 * thing server-rendered, and means the breaks are a typographic decision
 * rather than whatever the container happened to do.
 *
 * The mask is `overflow: hidden` on a block, never padding plus negative
 * margins: adjacent margins collapse, and that produces drift that only
 * shows up once something above the heading changes height.
 */
export function DisplayLines({
  lines,
  as: Tag = "h2",
  className = "",
  /** Seconds before the first line moves. */
  delay = 0,
  /** Seconds between one line starting and the next. */
  stagger = 0.09,
}: {
  lines: ReactNode[];
  as?: "h1" | "h2" | "p" | "div";
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span className="line-mask" key={i}>
          <span
            className="line-inner"
            style={{ "--line-delay": `${delay + i * stagger}s` } as CSSProperties}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
