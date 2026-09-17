import type { Block, Draft, ThemeId } from "./blocks";
import { withFreshIds } from "./blocks";
import type { Recipient } from "./render";
import { SITE_URL } from "@/lib/email/layout";

/**
 * Where an email starts.
 *
 * Five starting points, each a complete email with real copy in the
 * owner's voice and real pictures from the site, so the first thing seen in
 * the editor is something that could go out with three words changed
 * rather than a form of empty fields. Each one is a different shape and a
 * different job: the month in review, one listing told properly, a piece of
 * news, a run of tips, and a short note. The theme is a suggestion; it can
 * be switched in the editor without touching the words.
 *
 * Film posters are pinned here, so nothing in this file calls Vimeo.
 * createCampaignAction swaps in the real poster when a template is used.
 */

export type Template = {
  id: string;
  name: string;
  /** One line, in the chooser. */
  tagline: string;
  /** When to reach for it. */
  when: string;
  theme: ThemeId;
  draft: () => Draft;
};

const CONTACT = `${SITE_URL}/contact`;
const PORTFOLIO = `${SITE_URL}/portfolio`;

/* The posters Vimeo serves for the two reels the templates use, as of
   2026-09-16, so the chooser can draw them without a network call. The
   editor refreshes them from Vimeo when a template is used. */
const POSTER: Record<string, string> = {
  "1155091381": "https://i.vimeocdn.com/video/2107653883-473f89357c3d1118c63e8bc1c26bd3ae756753a4c9414b7d42f360eaa29390dc-d_640",
  "1173595933": "https://i.vimeocdn.com/video/2133953475-82fefca10d949632730973d83dca6bf3e59f97b69e38d6c506f78a568bb25044-d_640",
};

function cta(over: Partial<Extract<Block, { kind: "cta" }>> = {}): Block {
  return {
    id: "cta",
    kind: "cta",
    title: "Ready for your next listing?",
    text: "Photos the next business day, video within three. Pick a date and we handle the rest.",
    label: "Book a shoot",
    href: CONTACT,
    phones: true,
    tone: "accent",
    ...over,
  };
}

function monthlyRecap(): Draft {
  return {
    subject: "What sold this month, and the shoots behind it",
    preheader: "Four listings, one new reel, and a Milwaukee crew on the ground.",
    theme: "night",
    blocks: [
      {
        id: "hero",
        kind: "hero",
        image: "/images/marble-kitchen-dining.jpg",
        alt: "A waterfront estate photographed from the air at sunset",
        title: "Hi {{first_name}}, here is September",
        sub: "The month in listings, the work behind them, and one thing we changed for you.",
        href: "",
        layout: "overlay",
      },
      {
        id: "stats",
        kind: "stats",
        items: [
          { value: "42", label: "Listings shot" },
          { value: "9", label: "Twilight sessions" },
          { value: "6", label: "Reels delivered" },
        ],
        tone: "panel",
      },
      {
        id: "h1",
        kind: "heading",
        label: "Shot this month",
        text: "Four houses that photographed like magazine spreads",
        tone: "plain",
      },
      {
        id: "gallery",
        kind: "gallery",
        title: "",
        columns: 2,
        items: [
          { image: "/images/lakefront-sunset-living.jpg", alt: "A coffered ceiling living room at golden hour", caption: "Lakefront, De Pere", href: PORTFOLIO },
          { image: "/images/gourmet-kitchen.jpg", alt: "A gourmet kitchen with a marble island", caption: "New build, Hobart", href: PORTFOLIO },
          { image: "/images/stone-ranch-exterior.jpg", alt: "A stone ranch estate at dusk", caption: "Ranch estate, Suamico", href: PORTFOLIO },
          { image: "/images/modern-master-bath.jpg", alt: "A modern primary bathroom with a freestanding tub", caption: "Primary suite, Appleton", href: PORTFOLIO },
        ],
      },
      {
        id: "news",
        kind: "feature",
        image: "/images/aerial-lakefront.jpg",
        alt: "Lakefront homes photographed from the air",
        title: "A crew in Milwaukee, not a drive from Green Bay",
        text: "We opened a Milwaukee branch. The crew is based in the metro, so a same week shoot in Wauwatosa or Mequon no longer depends on the 43.\n\nSame pricing, same turnaround.",
        href: `${SITE_URL}/areas`,
        buttonLabel: "See where we shoot",
        side: "right",
        tone: "panel",
      },
      {
        id: "film",
        kind: "film",
        vimeoId: "1155091381",
        title: "Waterfront Property Tour",
        category: "Real Estate",
        poster: POSTER["1155091381"],
        portrait: true,
      },
      {
        id: "quote",
        kind: "quote",
        text: "The listing had 40 showings in the first weekend. The photos did that.",
        name: "Heather Zeitler",
        role: "Coldwell Banker",
        tone: "plain",
      },
      cta(),
    ],
  };
}

function listingSpotlight(): Draft {
  return {
    subject: "One house, told properly",
    preheader: "How a lakefront listing went from first walk through to 40 showings.",
    theme: "steel",
    blocks: [
      {
        id: "hero",
        kind: "hero",
        image: "/images/lakefront-sunset-living.jpg",
        alt: "A coffered ceiling living room lit by the last of the sun",
        title: "The lakefront house that sold in a weekend",
        sub: "One listing, start to finish, and what we did differently.",
        href: "",
        layout: "stacked",
      },
      {
        id: "t1",
        kind: "text",
        text: "Hi {{first_name}}. Most listings get photographed once, at noon, on the day the sign goes in. This one got a plan.\n\nWe walked it at 4pm the day before, picked the rooms that carried the story, and came back for two sessions: a bright morning for the kitchen and the water, and a twilight for the great room and the exterior.",
        tone: "plain",
      },
      {
        id: "g",
        kind: "gallery",
        title: "The frames that did the work",
        columns: 3,
        items: [
          { image: "/images/lakefront-kitchen-island.jpg", alt: "The kitchen island with the lake behind", caption: "Morning, kitchen", href: "" },
          { image: "/images/lakefront-screened-porch.jpg", alt: "The screened porch looking over the water", caption: "Morning, porch", href: "" },
          { image: "/images/lakefront-garden-path.jpg", alt: "The garden path down to the shore", caption: "Golden hour", href: "" },
          { image: "/images/lakefront-living-room.jpg", alt: "The living room at twilight", caption: "Twilight, great room", href: "" },
          { image: "/images/aerial-lakefront.jpg", alt: "The house and its neighbors from the air", caption: "Drone", href: "" },
          { image: "/images/lakefront-sunset-living.jpg", alt: "The coffered ceiling room at sunset", caption: "Twilight, interior", href: "" },
        ],
      },
      {
        id: "f",
        kind: "feature",
        image: "/images/aerial-lakefront.jpg",
        alt: "The property from above",
        title: "Why the drone frame led the listing",
        text: "Buyers searching lakefront want to see the lake first. The aerial went in slot one on the MLS and carried the social posts.",
        href: PORTFOLIO,
        buttonLabel: "More listing films",
        side: "left",
        tone: "plain",
      },
      {
        id: "q",
        kind: "quote",
        text: "Forty showings in the first weekend. Every buyer mentioned the photos.",
        name: "Heather Zeitler",
        role: "Coldwell Banker",
        tone: "panel",
      },
      cta({ title: "Have a listing like this coming up?", text: "Tell us the address and the go live date. We plan the light around it." }),
    ],
  };
}

function announcement(): Draft {
  return {
    subject: "Something new from PG Creatives",
    preheader: "A Milwaukee crew, same day turnaround on photos, and a new booking page.",
    theme: "night",
    blocks: [
      {
        id: "h",
        kind: "heading",
        label: "News",
        text: "We opened in Milwaukee",
        tone: "accent",
      },
      {
        id: "t",
        kind: "text",
        text: "Hi {{first_name}}. From this month there is a PG Creatives crew based in the Milwaukee metro. That means a same week shoot in Wauwatosa, Mequon or Brookfield with the same photographers, the same editing and the same pricing you get in Green Bay and Madison.",
        tone: "plain",
      },
      {
        id: "img",
        kind: "image",
        image: "/images/luxury-estate-night.jpg",
        alt: "A modern estate photographed after dark",
        caption: "First Milwaukee twilight of the season.",
        href: "",
      },
      {
        id: "list",
        kind: "list",
        title: "What changes for you",
        items: "Book Milwaukee shoots from the same page as before.\nPhotos the next business day, video within three.\nOne invoice, one point of contact, whichever market.",
        style: "numbered",
        tone: "panel",
      },
      {
        id: "note",
        kind: "note",
        image: "/team/michael-mcintee.jpg",
        name: "Michael McIntee",
        role: "Founder",
        text: "If you have a listing in the Milwaukee area this month, reply to this email and I will make sure it gets on the calendar first.",
        tone: "plain",
      },
      cta({ title: "Book the Milwaukee crew", text: "Same pricing, same turnaround, closer to the house." }),
    ],
  };
}

function tips(): Draft {
  return {
    subject: "Five things that make a listing photograph better",
    preheader: "Small prep, big difference. What we ask every seller to do before we arrive.",
    theme: "paper",
    blocks: [
      {
        id: "hero",
        kind: "hero",
        image: "/images/modern-great-room.jpg",
        alt: "A modern great room, cleared and lit for a shoot",
        title: "Before we arrive",
        sub: "Five things a seller can do in an hour that show up in every photo.",
        href: "",
        layout: "stacked",
      },
      {
        id: "list",
        kind: "list",
        title: "",
        items: "Clear every counter. Coffee makers, mail, the fruit bowl. Empty reads as space.\nOpen every blind and turn on every light, including the lamps and the range hood.\nHide the bins, the pet beds and the bath mats. They are the first thing a buyer sees.\nPark on the street, not the drive. The house should own the frame.\nLeave the thermostat alone in winter. Frosted windows photograph as fog.",
        style: "numbered",
        tone: "plain",
      },
      {
        id: "f",
        kind: "feature",
        image: "/images/staged-master-bedroom.jpg",
        alt: "A staged primary bedroom",
        title: "One room, staged or not",
        text: "Send us the listing a week out and we will tell you which rooms are worth staging and which are fine as they are. It is a five minute call.",
        href: CONTACT,
        buttonLabel: "Ask about a listing",
        side: "left",
        tone: "panel",
      },
      cta({ title: "Send the checklist to your seller", text: "Forward this email. It is written for them.", tone: "accent" }),
    ],
  };
}

function quickNote(): Draft {
  return {
    subject: "A quick one from PG Creatives",
    preheader: "Two dates left this month, and a reel worth two minutes.",
    theme: "night",
    blocks: [
      {
        id: "h",
        kind: "heading",
        label: "",
        text: "Hi {{first_name}}, two things",
        tone: "plain",
      },
      {
        id: "t",
        kind: "text",
        text: "First: there are two twilight dates left before the clocks change, the 24th and the 28th. If you have a listing going live in October, one of those is the one to take.\n\nSecond: the reel below is the kind of thing we are doing for agents' own pages now, not just for listings. Worth two minutes.",
        tone: "plain",
      },
      {
        id: "film",
        kind: "film",
        vimeoId: "1173595933",
        title: "Agent Brand Story",
        category: "Social Media",
        poster: POSTER["1173595933"],
        portrait: true,
      },
      { id: "b", kind: "button", label: "Take a twilight date", href: CONTACT, style: "solid" },
    ],
  };
}

export const TEMPLATES: Template[] = [
  {
    id: "monthly-recap",
    name: "The month in review",
    tagline: "Numbers, the houses shot this month, one piece of news, a reel, the ask.",
    when: "The one to send every month.",
    theme: "night",
    draft: monthlyRecap,
  },
  {
    id: "listing-spotlight",
    name: "One listing, told properly",
    tagline: "A single house from plan to sale, with a six photo grid and the agent's own words.",
    when: "When one shoot deserves the whole email.",
    theme: "steel",
    draft: listingSpotlight,
  },
  {
    id: "announcement",
    name: "Something new",
    tagline: "A piece of news on the brand blue, what it means in three points, a signed note.",
    when: "A new market, a new service, a price change.",
    theme: "night",
    draft: announcement,
  },
  {
    id: "tips",
    name: "Tips for sellers",
    tagline: "Five numbered tips on a light ground, written to be forwarded to a seller.",
    when: "A quiet month, or before the season turns.",
    theme: "paper",
    draft: tips,
  },
  {
    id: "quick-note",
    name: "A quick note",
    tagline: "A heading, two paragraphs, a reel and a button. No pictures to pick.",
    when: "Two dates left, one thing to say.",
    theme: "night",
    draft: quickNote,
  },
];

export function templateById(id: string): Template | null {
  return TEMPLATES.find((t) => t.id === id) ?? null;
}

/** A template as a draft with fresh ids, ready to store. */
export function draftFromTemplate(id: string): Draft | null {
  const t = templateById(id);
  return t ? withFreshIds(t.draft()) : null;
}

export const BLANK: Draft = { subject: "", preheader: "", theme: "night", blocks: [] };

/* ── Sample content, for the tests ──────────────────────────────────── */

export const SAMPLE_RECIPIENT: Recipient = {
  email: "heathersellswi@gmail.com",
  firstName: "Heather",
  lastName: "Zeitler",
  company: "Coldwell Banker",
  unsubscribeUrl: `${SITE_URL}/newsletter/unsubscribe/preview`,
};

export const SAMPLE_DRAFT: Draft = monthlyRecap();
