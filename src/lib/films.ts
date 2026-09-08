/**
 * The films, and which market each was shot in.
 *
 * Lifted out of the portfolio page so the market pages can show the same work
 * without a second, drifting copy of the list. The `market` on each is derived
 * from the property address in its Vimeo title, which is where the shoot
 * actually happened. Those addresses are clients' listings and stay private;
 * the public titles are the ones the site has always used.
 *
 * `null` means the address does not place it: a loop with no title, and one
 * marked only "Undisclosed on Lake Michigan". Those appear in the portfolio
 * and on no market page, rather than being assigned to a plausible guess.
 */

export type Film = {
  vimeoId: string;
  title: string;
  category: string;
  market: string | null;
};

export const PORTFOLIO_FILMS: Film[] = [
  { vimeoId: "1104794434", title: "Luxury Listing Showcase", category: "Real Estate", market: "green-bay" },
  { vimeoId: "1113814291", title: "Twilight Property Shoot", category: "Real Estate", market: "green-bay" },
  { vimeoId: "1124668587", title: "Neighborhood Aerial Tour", category: "Drone", market: "green-bay" },
  { vimeoId: "1068497296", title: "Drone Showcase Reel", category: "Drone", market: "green-bay" },
  { vimeoId: "1172222135", title: "Social Media Reel", category: "Social Media", market: "green-bay" },

  { vimeoId: "1173595933", title: "Agent Brand Story", category: "Social Media", market: "fox-valley" },
  { vimeoId: "1082367808", title: "Commercial Promo Video", category: "Commercial", market: "fox-valley" },
  { vimeoId: "1155091381", title: "Waterfront Property Tour", category: "Real Estate", market: "fox-valley" },
  { vimeoId: "1152918857", title: "Lakehouse Cinematic Tour", category: "Real Estate", market: "fox-valley" },
  { vimeoId: "1053206417", title: "Commercial Brand Film", category: "Commercial", market: "fox-valley" },
  { vimeoId: "1132559843", title: "Agent Content Package", category: "Social Media", market: "fox-valley" },
  { vimeoId: "1172649130", title: "Property Cinematic Tour", category: "Real Estate", market: "fox-valley" },

  { vimeoId: "1168129293", title: "Modern Home Walkthrough", category: "Real Estate", market: "madison" },

  // Not placeable from the title, so placed nowhere.
  { vimeoId: "1156930119", title: "Aerial Estate Flyover", category: "Drone", market: null },
  { vimeoId: "1117886316", title: "Listing Highlight Reel", category: "Real Estate", market: null },
];

export function filmsForMarket(slug: string): Film[] {
  return PORTFOLIO_FILMS.filter((f) => f.market === slug);
}
