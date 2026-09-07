/**
 * Content scoring for contact form submissions.
 *
 * Rate limits stop a flood. They do nothing about the steady drip of cold
 * outreach that arrives one message a week from a different address every
 * time, which is most of what actually reaches the dashboard. This scores the
 * content instead.
 *
 * Every rule here was written against the real submissions table, not from
 * imagination. The tells that separate the outreach templates from Wisconsin
 * agents asking about a listing turned out to be blunt:
 *
 *   - the sender quotes our own domain back at us ("I just visited
 *     pgcreativeswi.com and wondered...", "Hello Pgcreativeswi Com Owner").
 *     Real customers reach the form from the site. They never name it.
 *   - the sender is selling, not buying ("we help brands", "our team provides").
 *   - the phone number cannot be dialed.
 *
 * No single rule decides anything. A submission is quarantined only once the
 * weights clear SPAM_THRESHOLD, so one unlucky word never buries a real lead,
 * and everything quarantined stays visible and restorable in the dashboard.
 */

export const SPAM_THRESHOLD = 5;

export type SpamSignal = {
  /** Stable id, stored so a later tuning pass can be audited. */
  id: string;
  /** Owner facing sentence. Shown verbatim in the Spam tab. */
  label: string;
  weight: number;
};

export type SpamVerdict = {
  score: number;
  isSpam: boolean;
  signals: SpamSignal[];
  /** One line summary for the table, already joined. */
  reasons: string;
};

export type SpamInput = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  message: string;
  /** True when an identical submission already exists. Caller looks this up. */
  duplicate?: boolean;
  /** Seconds between the form rendering and the submission arriving. */
  fillSeconds?: number | null;
};

/* ── Vocabulary ──────────────────────────────────────────────────────── */

/** Our own name in every shape the templates have used it. */
const SELF_REFERENCE = /\b(pgcreativeswi|pg\s*creatives|pgcreatives)\b/i;

/** "Hello <site> Owner", "Dear Sir/Madam", "To the website owner". */
const OWNER_SALUTATION =
  /\b(?:dear|hello|hi|greetings|attention|attn)\b[^.!?\n]{0,60}\b(?:owner|webmaster|sir\s*(?:or|\/)?\s*madam|madam|site\s*admin|administrator|team\s*at)\b/i;

/** Anything that looks like a link, including bare domains. */
const URL_PATTERN =
  /(?:https?:\/\/|www\.)\S+|\b[a-z0-9][a-z0-9-]{1,60}\.(?:com|net|org|io|co|biz|info|xyz|online|site|shop|ru|cn|in)\b/i;

/**
 * Phrases from the sales side of the conversation. A customer describes what
 * they need. These describe what the sender is selling.
 */
const PITCH_TERMS = [
  "seo",
  "backlink",
  "back link",
  "expired domain",
  "domain authority",
  "rank higher",
  "search rankings",
  "first page of google",
  "guest post",
  "link building",
  "web traffic",
  "website traffic",
  "web visitors",
  "more leads",
  "generate leads",
  "lead generation",
  "grow your instagram",
  "instagram growth",
  "followers",
  "subscribers",
  "youtube system",
  "cold email",
  "outreach campaign",
  "digital marketing agency",
  "marketing agency",
  "web design services",
  "app development",
  "software development",
  "outsourcing",
  "offshore",
  "virtual assistant",
  "crypto",
  "bitcoin",
  "forex",
  "casino",
  "loan offer",
  "unsubscribe",
  "opt out of future",
  "no longer wish to receive",
];

/** First person plural selling. Present in nearly every template we received. */
const VENDOR_PHRASES = [
  "we help",
  "we offer",
  "we provide",
  "we specialize",
  "we can help you",
  "our team provides",
  "our team is",
  "our services",
  "our company",
  "i'm reaching out",
  "i am reaching out",
  "just visited",
  "came across your",
  "i was just looking at",
  "let me know if you",
  "book a call",
  "schedule a demo",
  "free trial",
  "free consultation",
  "price list",
  "our rates",
  "hire us",
  "partner with us",
];

/** Addresses that no paying customer uses. */
const THROWAWAY_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "test.test",
  "email.com",
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "fakeinbox.com",
]);

/** Numbers that are dialable in form only. */
const PLACEHOLDER_PHONES = new Set([
  "5555551212",
  "15555551212",
  "1234567890",
  "11234567890",
  "0000000000",
  "1111111111",
  "9999999999",
  "1234567891",
]);

/** Non Latin scripts. Our market is Wisconsin real estate. */
const NON_LATIN = /[Ѐ-ӿ؀-ۿ一-鿿぀-ヿ가-힯]/;

/** Header injection attempts smuggled into a body field. */
const HEADER_INJECTION = /\b(?:bcc|cc|content-type|mime-version)\s*:/i;

/** A message that carries no information at all. */
const EMPTY_TEST = /^(?:test|testing|test message|asdf+|qwerty|hi|hello|hey|\.|1|123)$/i;

/* ── Helpers ─────────────────────────────────────────────────────────── */

function countMatches(haystack: string, terms: string[]): string[] {
  const found: string[] = [];
  for (const term of terms) {
    if (haystack.includes(term)) found.push(term);
  }
  return found;
}

/**
 * True when a phone number could actually be dialed in North America.
 * Blank is fine, the field is optional. Anything present is expected to be a
 * 10 digit NANP number, optionally with a leading 1.
 */
function isDialableUsNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return isDialableUsNumber(digits.slice(1));
  }
  if (digits.length !== 10) return false;
  // Area code and exchange both start 2 through 9 in the real numbering plan.
  if (!/^[2-9]\d\d[2-9]\d{6}$/.test(digits)) return false;
  return true;
}

/* ── Scoring ─────────────────────────────────────────────────────────── */

export function scoreSubmission(input: SpamInput): SpamVerdict {
  const signals: SpamSignal[] = [];
  const add = (id: string, label: string, weight: number) =>
    signals.push({ id, label, weight });

  const message = input.message ?? "";
  const lowerMessage = message.toLowerCase();
  const name = `${input.firstName} ${input.lastName}`.trim();
  const emailDomain = (input.email.split("@")[1] ?? "").toLowerCase();
  // Everything a sender wrote, for the rules that do not care which field it
  // landed in. A link in the company field is a link either way.
  const allText = [name, input.company, message].join(" ");

  /* Address */

  if (THROWAWAY_DOMAINS.has(emailDomain)) {
    add("throwaway_email", `Address is at ${emailDomain}, which is a throwaway or test domain`, 6);
  }

  /* Who is selling to whom */

  if (SELF_REFERENCE.test(message) || SELF_REFERENCE.test(input.company ?? "")) {
    add(
      "quotes_our_domain",
      "Quotes our own site back at us, which is how cold outreach opens and how customers never do",
      3,
    );
  }

  if (OWNER_SALUTATION.test(message)) {
    add("owner_salutation", "Addressed to the site owner or webmaster rather than to a person", 4);
  }

  const vendorHits = countMatches(lowerMessage, VENDOR_PHRASES);
  if (vendorHits.length > 0) {
    add(
      "selling_to_us",
      `Written by someone selling to us, not buying: ${vendorHits.slice(0, 3).join(", ")}`,
      Math.min(vendorHits.length * 2, 4),
    );
  }

  const pitchHits = countMatches(lowerMessage, PITCH_TERMS);
  if (pitchHits.length > 0) {
    add(
      "pitch_vocabulary",
      `Marketing pitch wording: ${pitchHits.slice(0, 4).join(", ")}`,
      Math.min(pitchHits.length * 2, 6),
    );
  }

  /* Links */

  if (URL_PATTERN.test(message)) {
    add("link_in_message", "Message carries a link", 2);
  }
  if (URL_PATTERN.test(name)) {
    add("link_in_name", "A link is sitting in the name field", 4);
  }

  /* Contact details that do not check out */

  const phone = (input.phone ?? "").trim();
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (PLACEHOLDER_PHONES.has(digits)) {
      add("placeholder_phone", `Phone number ${phone} is a placeholder, not a real line`, 4);
    } else if (!isDialableUsNumber(phone)) {
      add("undialable_phone", `Phone number ${phone} cannot be dialed in the US`, 2);
    }
  }

  /* Shape of the text */

  if (NON_LATIN.test(allText)) {
    add("non_latin_script", "Written in a script we do not serve customers in", 3);
  }
  if (HEADER_INJECTION.test(message)) {
    add("header_injection", "Message contains mail header syntax, which is an injection attempt", 5);
  }
  if (EMPTY_TEST.test(message.trim())) {
    add("placeholder_message", "Message says nothing, it reads as a test submission", 3);
  }

  /* Behavior, supplied by the caller */

  if (input.duplicate) {
    add("duplicate", "An identical submission already came through recently", 5);
  }

  if (typeof input.fillSeconds === "number") {
    if (input.fillSeconds < 3) {
      add(
        "submitted_instantly",
        `Form was filled and sent in ${input.fillSeconds.toFixed(1)}s, faster than a person types`,
        4,
      );
    }
  } else if (input.fillSeconds === null) {
    // No timing token came back at all. A browser running our page always
    // returns one, so this is a script posting straight at the endpoint.
    add("no_browser_token", "Submitted without the token our form issues to real browsers", 3);
  }

  const score = signals.reduce((sum, s) => sum + s.weight, 0);

  return {
    score,
    isSpam: score >= SPAM_THRESHOLD,
    signals,
    reasons: signals.map((s) => s.label).join(" | "),
  };
}

/** Stable fingerprint used to spot the same message arriving over and over. */
export function submissionFingerprint(input: {
  email: string;
  firstName: string;
  lastName: string;
  message: string;
}): string {
  const normalized = [
    input.email.trim().toLowerCase(),
    input.firstName.trim().toLowerCase(),
    input.lastName.trim().toLowerCase(),
    input.message.trim().toLowerCase().replace(/\s+/g, " "),
  ].join(" ");

  // Small, fast, non cryptographic. This only needs to group identical text,
  // never to resist anybody.
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < normalized.length; i++) {
    const c = normalized.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x85ebca6b) >>> 0;
  }
  return `${h1.toString(16).padStart(8, "0")}${h2.toString(16).padStart(8, "0")}`;
}
