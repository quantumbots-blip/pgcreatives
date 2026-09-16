/**
 * Every share card the site ships, and the photograph behind each one.
 *
 * Kept as plain data so that both the route handlers and
 * scripts/og-backgrounds.mjs read the same list — the script imports this file
 * directly, which Node does by stripping the types. If a card is added here
 * and the script is not re-run, the build fails loudly on a missing background
 * rather than shipping a card with a hole in it.
 *
 * On the photographs. The whole library was graded frame by frame before any
 * of these were chosen, and most of it did not make the cut. What was rejected
 * and why:
 *
 *   golf-simulator-room   a CGI render, not a photograph
 *   twilight-wooded-exterior  a hospital operating room with a surgical robot
 *                         in it, whatever the filename says
 *   luxury-estate-night   the most striking frame in the set, but the house is
 *                         vacant and unstaged and the terrain is arid
 *                         mountainside, which is not Wisconsin
 *   lakefront-sunset-living   a 65in black television is the largest, darkest
 *                         object in the frame
 *   sunset-dining-room    the chandelier it is built around is decapitated by
 *                         a 1.91:1 crop
 *   farmhouse-kitchen     a hard-edged sun patch bleaches the lower left, the
 *                         exact corner the headline sits in
 *   aerial-lakefront      three houses, no hero, and olive-green water
 *   marble-chef-kitchen   beautiful slab in the room, but cropped to 1.91:1 it
 *                         is white marble on white cabinets on a blown white
 *                         wall, and it reads as a pale smear at feed size
 *   fireplace-living      a fluted wall and a wall clock: handsome, but it is
 *                         not a room, and a card selling property media should
 *                         show a property
 *   modern-entryway       a pale empty corridor
 *   coastal-living-room, floral-powder-room, rustic-living,
 *   cottage-bedroom-fireplace, modern-great-room, modern-master-bath,
 *   lakehouse-kitchen, modern-dining-kitchen, lakefront-kitchen-island
 *                         dated, builder-spec or cluttered
 *
 * `focus` is the vertical anchor of the crop, 0 for the top edge and 1 for the
 * bottom. Interiors want the floor kept and the blank ceiling dropped; the
 * aerial wants its sky.
 */

/** The four market pages share one background and change only the line. */
const MARKET_BG = { out: "areas.jpg", src: "stone-ranch-exterior.jpg", focus: 0.62 };

export type Card = {
  route: string;
  alt: string;
  headline: string | string[];
  meta: string[];
  crop: { out: string; src: string; focus: number };
};

export const CARDS: Card[] = [
  {
    route: "home",
    alt:
      "A drone photograph at twilight of a white lakefront estate with every window lit, over a Wisconsin lake at sunset",
    headline: "Professional grade media.",
    meta: ["Green Bay", "Madison", "Milwaukee", "Fox Valley"],
    // A drone twilight of a white lakefront colonial with every window lit.
    // The filename says kitchen. It is not a kitchen.
    crop: { out: "home.jpg", src: "marble-kitchen-dining.jpg", focus: 0.58 },
  },
  {
    route: "services",
    alt:
      "A white oak kitchen with a marble island, glass-front cabinetry and pendant lighting",
    headline: "Three things, done right.",
    meta: ["Listing media", "Commercial", "Content program"],
    crop: { out: "services.jpg", src: "gourmet-kitchen.jpg", focus: 0.62 },
  },
  {
    route: "portfolio",
    alt:
      "An open-plan great room under a vaulted ceiling with white timber trusses, opening to a kitchen and dining area",
    headline: "Every listing, in its best light.",
    meta: ["15 films", "34 stills"],
    crop: { out: "portfolio.jpg", src: "luxury-living-room.jpg", focus: 0.5 },
  },
  {
    route: "contact",
    alt:
      "A white clapboard cottage with a pergola-covered porch and planted garden beds in summer",
    headline: ["Let’s make", "something together."],
    meta: ["Free quote", "Usually same day"],
    crop: { out: "contact.jpg", src: "cottage-exterior.jpg", focus: 0.5 },
  },
  {
    route: "team",
    alt:
      "A modern open-plan condominium with polished floors, floor-to-ceiling glass and sculptural lounge chairs",
    headline: ["The creatives", "behind the scenes."],
    meta: ["Photographers", "Editors", "Strategists"],
    crop: { out: "team.jpg", src: "modern-condo.jpg", focus: 0.55 },
  },
  {
    route: "content-creator-program",
    alt:
      "A lakefront screened porch with an exposed timber ceiling and skylights, looking out over the water",
    headline: "Content that performs.",
    meta: ["Monthly program", "From $1,500"],
    crop: { out: "program.jpg", src: "lakefront-screened-porch.jpg", focus: 0.5 },
  },
  {
    route: "areas",
    alt:
      "A large shingle and stone Wisconsin ranch house behind a manicured lawn and a straight front walk",
    headline: "Four markets, one crew.",
    meta: ["Green Bay", "Fox Valley", "Madison", "Milwaukee"],
    crop: MARKET_BG,
  },
];

/** One card per market page: same photograph, the page's own line. */
export const MARKET_CARDS: Record<string, { headline: string; meta: string[] }> = {
  "green-bay": { headline: "Green Bay, shot properly.", meta: ["(920) 777-0127", "5 films shot here"] },
  "fox-valley": { headline: "The Fox Valley, shot properly.", meta: ["(920) 777-0127", "7 films shot here"] },
  madison: { headline: "Madison, shot properly.", meta: ["(608) 420-6199", "Own crew and portal"] },
  milwaukee: { headline: "Milwaukee, shot properly.", meta: ["(414) 255-9271", "New branch"] },
};

export const MARKET_BACKGROUND = MARKET_BG.out;

export const MARKET_ALT =
  "A large shingle and stone Wisconsin ranch house behind a manicured lawn and a straight front walk";

export function cardFor(route: string): Card {
  const card = CARDS.find((c) => c.route === route);
  if (!card) throw new Error(`No share card defined for route "${route}"`);
  return card;
}
