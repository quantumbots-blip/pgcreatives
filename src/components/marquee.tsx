/**
 * A slow kinetic strip of what this company does and where.
 *
 * Server-rendered and CSS-only. The content is duplicated once and the track
 * translates exactly -50%, so the loop is seamless without measuring anything
 * at runtime. The copy is real information — markets and services — not filler
 * set in motion.
 */
export function Marquee({ items }: { items: string[] }) {
  const run = [...items, ...items];
  return (
    <div
      className="marquee border-y border-line py-5"
      aria-hidden="true"
    >
      <div className="marquee-track">
        {run.map((item, i) => (
          <span key={i} className="marquee-item">
            <span className="meta">{item}</span>
            <span className="marquee-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
