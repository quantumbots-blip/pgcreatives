/**
 * Remembers how somebody arrived, so a lead can say where it came from.
 *
 * The traffic figures already show that Instagram sends more people to the
 * site than Google does. What they cannot show is whether either of them
 * sends anybody who actually books, because a submission carried no trace of
 * the visit that produced it. This closes that gap.
 *
 * It has to be first touch, not last. By the time somebody reaches the
 * contact form they have usually clicked through two or three pages, and
 * document.referrer at that point reads "pgcreativeswi.com", which credits
 * every lead to the site itself. So the arrival is recorded once, on the
 * first page of the session, and held in sessionStorage until the form asks
 * for it.
 *
 * sessionStorage, not localStorage: this describes one visit, and someone
 * coming back next month from a different post is a different arrival.
 */

const KEY = "pgc_first_touch";

export type FirstTouch = {
  /** Hostname they came from, or null when they arrived direct. */
  referrer: string | null;
  /** First page of the session. */
  landing: string;
  /** utm_source or utm_campaign, when a link carried one. */
  campaign: string | null;
};

function readCampaign(search: string): string | null {
  try {
    const params = new URLSearchParams(search);
    const value =
      params.get("utm_campaign") || params.get("utm_source") || params.get("ref");
    return value ? value.slice(0, 120) : null;
  } catch {
    return null;
  }
}

/** Called on every page view. Only the first one in a session does anything. */
export function captureFirstTouch(pathname: string): void {
  try {
    if (sessionStorage.getItem(KEY)) return;

    let referrer: string | null = null;
    if (document.referrer) {
      try {
        const host = new URL(document.referrer).hostname.toLowerCase();
        // Our own pages are not an arrival, and neither is us building the site.
        const isSelf =
          host === window.location.hostname ||
          host === "pgcreativeswi.com" ||
          host === "www.pgcreativeswi.com" ||
          host === "localhost" ||
          host === "127.0.0.1";
        if (!isSelf) referrer = host.slice(0, 255);
      } catch {
        // A referrer that is not a URL tells us nothing.
      }
    }

    const touch: FirstTouch = {
      referrer,
      landing: pathname.slice(0, 500),
      campaign: readCampaign(window.location.search),
    };
    sessionStorage.setItem(KEY, JSON.stringify(touch));
  } catch {
    // Private browsing can refuse storage. Attribution is a nice to have.
  }
}

export function readFirstTouch(): FirstTouch | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FirstTouch) : null;
  } catch {
    return null;
  }
}
