/**
 * A slow kinetic strip of what this company does and where.
 *
 * Server-rendered and CSS-only. The content is duplicated once and the track
 * translates exactly -50%, so the loop is seamless without measuring anything
 * at runtime. The copy is real information — markets and services — not filler
 * set in motion.
 */
export function Marquee({ items }: { items: string[] }) {
  /* Each half repeats the list three times.

     One copy measured ~1670px, which is narrower than a wide desktop. The
     half then stretched to fill and `space-around` put half a gap at each of
     its ends, so the seam between the two halves opened by a full gap — a
     25px hole travelling past once per loop. Three copies is wider than any
     viewport this will meet, so the half is sized by its content and the
     spacing stays even straight through the seam. */
  const half = (
    <div className="marquee-half">
      {[0, 1, 2].flatMap((copy) =>
        items.map((item) => (
          <span key={`${copy}-${item}`} className="marquee-item">
            <span className="meta">{item}</span>
            <span className="marquee-dot" />
          </span>
        ))
      )}
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
