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
 *
 * Below 640px the masks collapse to inline flow and the browser breaks the
 * heading itself. Authored breaks are a decision made for a wide measure;
 * held on a phone they re-wrap into ragged shapes — "Three ways / we put
 * your / work in front of people." Lines still fade in on their stagger
 * there, since opacity applies to inline boxes even though transform
 * does not.
 */
export function DisplayLines({
  lines,
  as: Tag = "h2",
  className = "",
  /** Seconds before the first line moves. */
  delay = 0,
  /** Seconds between one line starting and the next. */
  stagger = 0.09,
  /**
   * Rise on page load instead of on intersection. For headings that are on
   * screen when the page arrives (the hero, every inner page's h1): the
   * observer marks those visible before it is allowed to hide anything, so
   * without this they would never move at all.
   */
  entrance = false,
}: {
  lines: ReactNode[];
  as?: "h1" | "h2" | "p" | "div";
  className?: string;
  delay?: number;
  stagger?: number;
  entrance?: boolean;
}) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span className="line-mask" key={i}>
          <span
            className={entrance ? "line-inner hero-line" : "line-inner"}
            style={
              {
                "--line-delay": `${delay + i * stagger}s`,
                ...(entrance ? { animationDelay: `${0.18 + i * 0.12}s` } : null),
              } as CSSProperties
            }
          >
            {line}
            {/* A trailing space so the authored lines still read as sentences
                when they collapse to inline flow on narrow screens. Invisible
                while each line is its own block. */}
            {i < lines.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
