/**
 * A slow kinetic strip of what this company does and where.
 *
 * Server-rendered and CSS-only. The content is duplicated once and the track
 * translates exactly -50%, so the loop is seamless without measuring anything
 * at runtime. The copy is real information — markets and services — not filler
 * set in motion.
 */
export function Marquee({ items }: { items: string[] }) {
  const half = (
    <div className="marquee-half">
      {items.map((item) => (
        <span key={item} className="marquee-item">
          <span className="meta">{item}</span>
          <span className="marquee-dot" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee py-3 opacity-70" aria-hidden="true">
      <div className="marquee-track">
        {half}
        {half}
      </div>
    </div>
  );
}
