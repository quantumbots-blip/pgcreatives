import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

/**
 * The shared furniture of the dashboard: a stat, a panel, and the small
 * comparison chip that goes next to a number.
 *
 * Kept in one place because the leads view and the traffic view are separate
 * routes now, and two sets of nearly identical cards is how a dashboard stops
 * looking like one product.
 */

/** A number next to the same number from the window before it. */
export function DeltaChip({
  pct,
  /** Set when a fall is the good direction, as with spam getting through. */
  invert = false,
}: {
  pct: number | null;
  invert?: boolean;
}) {
  /* Nothing to compare against renders nothing. The range row already says
     so once, and repeating "no earlier figure" under four numbers reads as
     four separate problems rather than one property of the range. */
  if (pct === null) return null;
  if (pct === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-medium text-ink-3">
        <Minus className="h-3 w-3" />
        flat
      </span>
    );
  }
  const up = pct > 0;
  const good = invert ? !up : up;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
        good ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"
      }`}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(pct)}%
    </span>
  );
}

export function Stat({
  icon: Icon,
  value,
  label,
  sub,
  accent,
  delta,
  invert,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  sub?: string;
  accent?: boolean;
  delta?: number | null;
  invert?: boolean;
}) {
  /* Full height, with the number pinned to the top of what is left after the
     label. "Visitors who write in" wraps to two lines on a phone where
     "Views" takes one, which used to drag its own card taller than the one
     beside it and leave the row of four sitting at two different heights.
     The grids pair this with auto-rows-fr. */
  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start gap-2 text-ink-3">
        <Icon className="mt-px h-4 w-4 shrink-0 text-signal-ink" />
        <span className="text-[11px] uppercase leading-[1.35] tracking-[0.12em]">{label}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <p
          className={`text-2xl font-bold tabular-nums ${accent ? "text-signal-ink" : "text-white"}`}
        >
          {value}
        </p>
        {delta !== undefined && <DeltaChip pct={delta} invert={invert} />}
      </div>
      {/* mt-auto rather than mt-1 so the note sits on the floor of the card.
          Cards in a row are the same height now, and a note that hangs in the
          middle of one of them reads as a mistake. */}
      {sub && <p className="mt-auto pt-1 text-[11px] leading-[1.4] text-ink-3">{sub}</p>}
    </div>
  );
}

export function Panel({
  title,
  aside,
  note,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 sm:mb-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-ink-3">{title}</h2>
        {aside}
      </div>
      {note && <p className="mb-4 text-xs leading-relaxed text-ink-3">{note}</p>}
      {children}
    </section>
  );
}

/**
 * A column chart with dates under it.
 *
 * The bars on the old dashboard carried their date only in a title attribute,
 * which does not exist on a phone. Every chart here labels its ends and its
 * middle, which is enough to place any bar without crowding thirty labels
 * into three hundred pixels.
 *
 * A percentage height only means something when the box it is measured
 * against has a height of its own. This chart used to put h-40 on the row and
 * then ask each bar for a percentage of its immediate wrapper, which was a
 * bare flex-1 div with no height at all: under items-end a wrapper is only as
 * tall as what is inside it, and what was inside it was asking the wrapper how
 * tall to be. The percentage resolved against nothing, fell back to auto, and
 * every bar on both charts came out at the 3px floor, identical whether the
 * day had four views or eighty. The wrappers now stretch to the full height of
 * the row, so the percentage has a real number underneath it.
 */
export function BarChart({
  data,
  height = "h-40",
  emptyLabel = "Nothing recorded yet",
}: {
  data: { day: string; value: number; hint: string }[];
  height?: string;
  emptyLabel?: string;
}) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-ink-3">{emptyLabel}</p>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const label = (iso: string) => {
    const [, m, d] = iso.split("-");
    return `${Number(m)}/${Number(d)}`;
  };
  const midIndex = Math.floor((data.length - 1) / 2);

  /* All time is around one bar per day since March, and a 2px gap between
     bars that thin spends more of the row on gaps than on data. */
  const gap = data.length <= 40 ? 2 : data.length <= 90 ? 1 : 0;

  return (
    <div>
      <div
        className={`flex items-stretch border-b border-line ${height}`}
        style={{ gap: `${gap}px` }}
      >
        {data.map((d) => (
          <div
            key={d.day}
            className="group flex h-full flex-1 flex-col justify-end"
            title={d.hint}
          >
            <div
              className="w-full rounded-t bg-signal transition-colors group-hover:bg-signal-ink"
              style={{
                height: `${(d.value / max) * 100}%`,
                /* A floor keeps a quiet day visible, but only a day that
                   actually had something. A day with no visits at all is not
                   a short bar, it is no bar. */
                minHeight: d.value > 0 ? "2px" : undefined,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] tabular-nums text-ink-3">
        <span>{label(data[0].day)}</span>
        {data.length > 2 && <span>{label(data[midIndex].day)}</span>}
        {data.length > 1 && <span>{label(data[data.length - 1].day)}</span>}
      </div>
      <p className="mt-1 text-[11px] text-ink-3">Peak {max.toLocaleString()} in a day</p>
    </div>
  );
}
