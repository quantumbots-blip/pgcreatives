/**
 * When people are actually on the site, by day and hour, in Wisconsin time.
 *
 * This is built from page views rather than leads on purpose. There are
 * thousands of views and single figure leads, and a seven by twenty four grid
 * of eight data points is a decoration, not a finding.
 *
 * It earns its place because Instagram is the largest single source of
 * traffic to this site, ahead of Google. A reel goes out at a time somebody
 * chooses, and this says which hours that audience is awake.
 */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Six four hour columns keeps the grid readable at 320px. */
const BUCKETS = [
  { label: "12a", from: 0, to: 4 },
  { label: "4a", from: 4, to: 8 },
  { label: "8a", from: 8, to: 12 },
  { label: "12p", from: 12, to: 16 },
  { label: "4p", from: 16, to: 20 },
  { label: "8p", from: 20, to: 24 },
];

function hourLabel(hour: number): string {
  if (hour === 0) return "12am";
  if (hour === 12) return "12pm";
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

/**
 * The colour of a cell at a given position on the scale.
 *
 * The ramp used to vary alpha alone, from 0.14 to 1, over a near black
 * panel. Fading one colour toward the background compresses everything into
 * the dark end: a quiet cell and a busy one both read as navy, which is why
 * three views and seventy two looked alike. Lightness carries the scale now,
 * climbing from the accent to the lighter ink value the design system already
 * uses for accented text, with alpha only helping at the bottom.
 */
function cellColor(intensity: number): string {
  const lerp = (from: number, to: number) => Math.round(from + (to - from) * intensity);
  const r = lerp(43, 106);
  const g = lerp(111, 176);
  const b = lerp(184, 212);
  const alpha = (0.22 + intensity * 0.78).toFixed(3);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function VisitorHeatmap({ grid }: { grid: number[][] }) {
  const bucketed = grid.map((row) =>
    BUCKETS.map((b) => row.slice(b.from, b.to).reduce((sum, n) => sum + n, 0)),
  );
  const flat = bucketed.flat();
  const peak = Math.max(...flat, 1);
  /* Quietest non empty bucket, so the ramp spans what actually happened. Over
     six months the quietest four hours still hold dozens of views, and a ramp
     starting at zero put every cell in the top third of the scale. */
  const nonZero = flat.filter((n) => n > 0);
  const floor = nonZero.length > 0 ? Math.min(...nonZero) : 0;
  const spread = Math.max(peak - floor, 1);
  const total = flat.reduce((sum, n) => sum + n, 0);

  if (total === 0) {
    return <p className="py-10 text-center text-sm text-ink-3">No visits recorded in this range</p>;
  }

  // Busiest single hour, named, because that is the sentence worth reading.
  let bestDay = 0;
  let bestHour = 0;
  let bestCount = -1;
  grid.forEach((row, d) =>
    row.forEach((count, h) => {
      if (count > bestCount) {
        bestCount = count;
        bestDay = d;
        bestHour = h;
      }
    }),
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] border-separate border-spacing-[3px]">
          <caption className="sr-only">
            Page views by day of the week and time of day, Wisconsin time
          </caption>
          <thead>
            <tr>
              <th className="w-8" />
              {BUCKETS.map((b) => (
                <th
                  key={b.label}
                  scope="col"
                  className="pb-1 text-[10px] font-normal text-ink-3"
                >
                  {b.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bucketed.map((row, d) => (
              <tr key={DAYS[d]}>
                <th
                  scope="row"
                  className="pr-1 text-right text-[10px] font-normal text-ink-3"
                >
                  {DAYS[d]}
                </th>
                {row.map((count, i) => {
                  /* Position within the observed range, eased so the middle
                     of the scale still separates. */
                  const intensity =
                    count === 0 ? 0 : Math.sqrt(Math.max(count - floor, 0) / spread);
                  return (
                    <td key={BUCKETS[i].label} className="p-0">
                      <div
                        title={`${DAYS[d]} ${BUCKETS[i].label}: ${count.toLocaleString()} views`}
                        className="h-7 rounded"
                        style={{
                          backgroundColor:
                            count === 0 ? "rgba(255,255,255,0.04)" : cellColor(intensity),
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* A sentence saying the quietest cell is 3 and the busiest is 72 does
          not tell you which shade is which. The ramp itself does. */}
      <div className="mt-3 flex items-center gap-2 text-[11px] tabular-nums text-ink-3">
        <span>{floor.toLocaleString()}</span>
        <div className="flex gap-[3px]">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <div
              key={t}
              className="h-3 w-5 rounded-sm"
              style={{ backgroundColor: cellColor(t) }}
            />
          ))}
        </div>
        <span>{peak.toLocaleString()} views</span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-2">
        Busiest hour is <span className="text-white">{DAYS[bestDay]}</span> around{" "}
        <span className="text-white">{hourLabel(bestHour)}</span>, Wisconsin time.
      </p>
      <p className="mt-1 text-[11px] text-ink-3">
        Worth knowing before scheduling a post, since Instagram sends more people here than
        search does.
      </p>
    </div>
  );
}
