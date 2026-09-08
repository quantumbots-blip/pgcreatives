import { BUSINESS } from "@/lib/data";

/**
 * The markets, and the real work in each one.
 *
 * Four pages for four markets is the shape that gets a site penalised when
 * the pages are the same words with the city swapped, so the differences here
 * are real ones. Each market has its own films, its own phone number, its own
 * people where there are people, and its own booking route. Where a market has
 * nothing to show, this says so rather than dressing it up.
 *
 * The film assignments come from the property addresses in the Vimeo titles,
 * which is where these were actually shot. The addresses themselves stay
 * private: they are clients' listings, and the site has always used its own
 * titles in public. They are used here only to decide which market a piece of
 * work belongs to.
 *
 * Green Lake, Markesan and the lake communities west of the valley account for
 * five films, more than Madison and Milwaukee together, and were not mentioned
 * anywhere on the site before this.
 */

export type Market = {
  slug: string;
  /** The city as somebody would search for it. */
  city: string;
  /** Full page name. */
  name: string;
  /** Which phone in BUSINESS.phones answers here. */
  phoneKey: keyof typeof BUSINESS.phones;
  /** Booking portal, where the market has one. */
  portalKey?: keyof typeof BUSINESS.portals;
  /** Team members who work this market, by name. */
  people: string[];
  /** Towns genuinely covered from here, for the copy and the schema. */
  towns: string[];
  /** Vimeo ids shot in this market. Empty is allowed and is said out loud. */
  filmIds: string[];
  /** The lede. Written per market, never one sentence with the city swapped. */
  lede: string;
  /** What is actually true about working here. */
  body: string[];
  /** Search description, under 160. */
  description: string;
};

export const MARKETS: Market[] = [
  {
    slug: "green-bay",
    city: "Green Bay",
    name: "Green Bay and northeast Wisconsin",
    phoneKey: "greenBay",
    portalKey: "greenBay",
    people: ["Michael McIntee", "Liam Janowski"],
    towns: [
      "Green Bay",
      "De Pere",
      "Howard",
      "Hobart",
      "Suamico",
      "Little Suamico",
      "Ashwaubenon",
      "Marinette",
    ],
    filmIds: ["1104794434", "1113814291", "1124668587", "1068497296", "1172222135"],
    lede: "The home market. More listings shot here than anywhere else we work.",
    body: [
      "Green Bay is where the company started and where most of the calendar sits. A listing booked here is usually shot within a couple of days, and the drive to De Pere, Howard, Hobart or Suamico is short enough that a morning shoot and an afternoon shoot in different towns is a normal day.",
      "We go as far north as Marinette for the right property. Anything on the bay or the Fox River tends to want drone, and the water reads best in the two hours before sunset, which is worth planning around rather than working around.",
    ],
    description:
      "Real estate photography, listing video, drone and 3D tours in Green Bay, De Pere, Howard and Suamico. Booked direct, usually shot within days.",
  },
  {
    slug: "fox-valley",
    city: "the Fox Valley",
    name: "the Fox Valley and the lake country",
    phoneKey: "greenBay",
    portalKey: "greenBay",
    people: ["Michael McIntee", "Liam Janowski"],
    towns: [
      "Oshkosh",
      "Appleton",
      "Neenah",
      "Menasha",
      "Hilbert",
      "Green Lake",
      "Markesan",
    ],
    filmIds: ["1173595933", "1082367808", "1155091381", "1152918857", "1053206417", "1132559843", "1172649130"],
    lede: "The valley, and the lake communities west of it, where a lot of our water property work happens.",
    body: [
      "Oshkosh, Appleton, Neenah and Menasha are a straight run down the highway from Green Bay, and the same crew covers them. Commercial work makes up a bigger share here than it does further north: interiors, facilities and brand film for businesses that are not selling a house.",
      "Further west, Green Lake and Markesan account for more of our work than any market outside Green Bay. Lake property is its own job. The shot that sells it is almost never from the street, so these are drone first, and often twilight, and they need to be timed against the weather rather than the calendar.",
    ],
    description:
      "Listing photography, video, drone and 3D tours across Oshkosh, Appleton, Neenah and the Green Lake area. Lake property a speciality.",
  },
  {
    slug: "madison",
    city: "Madison",
    name: "Madison and Dane County",
    phoneKey: "madison",
    portalKey: "madison",
    people: ["Isaiah Bastian"],
    towns: ["Madison", "Middleton", "Fitchburg", "Sun Prairie", "Verona", "Waunakee"],
    filmIds: ["1168129293"],
    lede: "A second crew, its own number, and its own booking portal.",
    body: [
      "Madison runs separately from the northeast. Isaiah Bastian leads it, the number below reaches him rather than the Green Bay line, and agents here book through the Madison portal, not the northeastern one.",
      "The work skews differently. Downtown and near west condos and older housing stock need a different approach to a new build on a half acre: tighter interiors, more attention to windows and mixed light, and floor plans that matter more because the layouts are less obvious from photographs.",
    ],
    description:
      "Real estate photography and listing video in Madison, Middleton, Fitchburg and Sun Prairie. Local crew, local number, own booking portal.",
  },
  {
    slug: "milwaukee",
    city: "Milwaukee",
    name: "Milwaukee and the southeast",
    phoneKey: "milwaukee",
    people: [],
    towns: ["Milwaukee", "Wauwatosa", "Brookfield", "Mequon", "Whitefish Bay"],
    filmIds: [],
    lede: "Covered by travel, on a Milwaukee number, and booked a day or two ahead.",
    body: [
      "Milwaukee is a market we travel to rather than one we sit in. That is worth being straight about: the portfolio on this site was shot in the north and the valley, and the work below is what we do, not what we have done here.",
      "In practice it means a Milwaukee shoot wants a little more notice than one in Green Bay, and it is easiest when there is more than one property to see in a day. The number below is a Milwaukee line and reaches us directly. If the timing works, the job is the same job.",
    ],
    description:
      "Real estate photography, listing video and drone in Milwaukee, Wauwatosa, Brookfield and Mequon. Travelled to, on a local number, booked ahead.",
  },
];

export function marketBySlug(slug: string): Market | undefined {
  return MARKETS.find((m) => m.slug === slug);
}
