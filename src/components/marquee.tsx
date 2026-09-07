import Image from "next/image";

/**
 * A slow kinetic strip of the brokerages this work is made for.
 *
 * Server-rendered and CSS-only. The content is duplicated once and the track
 * translates exactly -50%, so the loop is seamless without measuring anything
 * at runtime.
 *
 * The artwork is pure white on transparency, cut from the supplied brand files
 * rather than tinted at render time. Two of the seven could not simply be
 * flooded white: Coldwell Banker's mark is a navy square with the C, B, star
 * and frame knocked out of it, so flooding it produced a solid white block —
 * it keeps the light pixels and drops the navy instead, which is the standard
 * reversed lockup. RE/MAX went the other way: knocking its white balloon band
 * out sliced the balloon into a dome and a spike, so it is flooded to a solid
 * silhouette.
 *
 * `w` and `h` are the display size in CSS pixels at full scale. They are not
 * a common height — a common height would make CENTURY 21, which is 8.7:1,
 * four times the visual mass of the stacked Keller Williams lockup sitting
 * next to it. Each logo is sized so its *ink area* matches the others
 * (area x coverage held constant, then the spread pulled 20% toward the
 * middle so nothing reads as an outlier), which is what makes a row of very
 * different lockups look like one row.
 */
const brokerages = [
  { slug: "coldwell-banker", name: "Coldwell Banker", w: 228, h: 28 },
  { slug: "century-21", name: "Century 21", w: 199, h: 23 },
  { slug: "compass", name: "Compass", w: 199, h: 27 },
  { slug: "exp-realty", name: "eXp Realty", w: 79, h: 41 },
  { slug: "keller-williams", name: "Keller Williams", w: 119, h: 54 },
  { slug: "re-max", name: "RE/MAX", w: 110, h: 30 },
  { slug: "sothebys", name: "Sotheby's International Realty", w: 133, h: 46 },
];

export function Marquee() {
  /* Each half repeats the list three times.

     One copy measured ~1570px, which is narrower than a wide desktop. The
     half then stretched to fill and `space-around` put half a gap at each of
     its ends, so the seam between the two halves opened by a full gap — a
     hole travelling past once per loop. Three copies is wider than any
     viewport this will meet, so the half is sized by its content and the
     spacing stays even straight through the seam. */
  const half = (
    <div className="marquee-half">
      {[0, 1, 2].flatMap((copy) =>
        brokerages.map((brand) => (
          <span key={`${copy}-${brand.slug}`} className="marquee-item">
            <Image
              src={`/logos/${brand.slug}.png`}
              alt=""
              width={brand.w * 3}
              height={brand.h * 3}
              className="marquee-logo"
              style={{ "--h": `${brand.h}px` } as React.CSSProperties}
              loading="eager"
            />
          </span>
        ))
      )}
    </div>
  );

  return (
    <div className="marquee py-6 sm:py-7" aria-hidden="true">
      <div className="marquee-track">
        {half}
        {half}
      </div>
    </div>
  );
}
