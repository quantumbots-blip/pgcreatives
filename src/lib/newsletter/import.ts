/**
 * Reading a pasted list of people.
 *
 * The owner's list lives in whatever it lives in: a spreadsheet, the To
 * field of an old email, a notes app. So this reads anything with one
 * person per line and an address somewhere on it:
 *
 *   heather@example.com
 *   Heather Zeitler <heather@example.com>
 *   heather@example.com, Heather, Zeitler, Coldwell Banker
 *   Heather Zeitler, heather@example.com
 *   a CSV or TSV with a header row naming the columns
 *
 * The address is found by shape, and the rest of the line becomes the name
 * and the company by position, or by header when there is one. Nothing is
 * guessed hard: a line with no address is reported back as skipped, not
 * dropped in silence, and the same address twice in one paste counts once.
 */

export type ParsedSubscriber = {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
};

export type ParsedList = {
  rows: ParsedSubscriber[];
  /** Lines that carried no usable address, verbatim, so they can be fixed. */
  skipped: string[];
  /** Addresses that appeared more than once in the paste. */
  duplicates: number;
};

const EMAIL = /[A-Z0-9._%+\-']+@[A-Z0-9.\-]+\.[A-Z]{2,}/i;

export function isEmail(value: string): boolean {
  return /^[A-Z0-9._%+\-']+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i.test(value) && value.length <= 254;
}

function clean(value: string, cap: number): string {
  return value.replace(/^["'\s]+|["'\s]+$/g, "").replace(/\s+/g, " ").slice(0, cap);
}

/** Split on the delimiter the line actually uses. */
function cells(line: string): string[] {
  const delimiter = line.includes("\t") ? "\t" : line.includes(",") ? "," : line.includes(";") ? ";" : null;
  if (!delimiter) return [line];
  // Quoted CSV cells may contain the delimiter.
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === delimiter && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

type Header = { email: number; first: number; last: number; name: number; company: number };

function readHeader(line: string): Header | null {
  const names = cells(line).map((c) => clean(c, 40).toLowerCase());
  const find = (...keys: string[]) => names.findIndex((n) => keys.some((k) => n === k || n.includes(k)));
  const email = find("email", "e-mail", "mail");
  if (email === -1) return null;
  // A header row names its columns; a data row would carry an @.
  if (names.some((n) => EMAIL.test(n))) return null;
  return {
    email,
    first: find("first"),
    last: find("last", "surname"),
    name: names.findIndex((n) => n === "name" || n === "full name" || n === "contact"),
    company: find("company", "brokerage", "business", "organization", "org"),
  };
}

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = clean(full, 160).split(" ").filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function parseLine(line: string, header: Header | null): ParsedSubscriber | null {
  // "Name <email>" is its own shape and is the most common one pasted out
  // of a mail client.
  const angle = line.match(/^(.*?)<\s*([^<>\s]+@[^<>\s]+)\s*>\s*$/);
  if (angle && isEmail(angle[2])) {
    return { email: angle[2].toLowerCase(), ...splitName(angle[1]), company: "" };
  }

  const cols = cells(line).map((c) => clean(c, 200));

  if (header) {
    const email = (cols[header.email] ?? "").toLowerCase();
    if (!isEmail(email)) return null;
    let firstName = header.first >= 0 ? cols[header.first] ?? "" : "";
    let lastName = header.last >= 0 ? cols[header.last] ?? "" : "";
    if (!firstName && !lastName && header.name >= 0) {
      ({ firstName, lastName } = splitName(cols[header.name] ?? ""));
    }
    const company = header.company >= 0 ? cols[header.company] ?? "" : "";
    return { email, firstName: firstName.slice(0, 80), lastName: lastName.slice(0, 80), company: company.slice(0, 120) };
  }

  const at = cols.findIndex((c) => isEmail(c));
  if (at === -1) {
    // The address may be inside a longer cell ("Heather Zeitler heather@x.com").
    const found = line.match(EMAIL);
    if (!found || !isEmail(found[0])) return null;
    const rest = line.replace(found[0], " ");
    return { email: found[0].toLowerCase(), ...splitName(rest.replace(/[<>,;]/g, " ")), company: "" };
  }

  const email = cols[at].toLowerCase();
  const rest = cols.filter((_, i) => i !== at).filter(Boolean);
  if (rest.length === 0) return { email, firstName: "", lastName: "", company: "" };
  if (rest.length === 1) {
    // One other cell is a whole name.
    return { email, ...splitName(rest[0]), company: "" };
  }
  if (rest.length === 2 && rest[0].includes(" ") && !rest[1].includes(" ")) {
    // "Heather Zeitler, Coldwell Banker" style is rarer than first, last;
    // a space in the first cell and none in the second is the tell.
    return { email, ...splitName(rest[0]), company: rest[1] };
  }
  const [firstName, lastName, ...company] = rest;
  return {
    email,
    firstName: firstName.slice(0, 80),
    lastName: (lastName ?? "").slice(0, 80),
    company: company.join(" ").slice(0, 120),
  };
}

export function parseSubscriberList(text: string): ParsedList {
  const lines = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const rows: ParsedSubscriber[] = [];
  const skipped: string[] = [];
  const seen = new Set<string>();
  let duplicates = 0;

  let header: Header | null = null;
  let start = 0;
  if (lines.length > 1) {
    header = readHeader(lines[0]);
    if (header) start = 1;
  }

  for (const line of lines.slice(start)) {
    const row = parseLine(line, header);
    if (!row) {
      skipped.push(line.slice(0, 200));
      continue;
    }
    if (seen.has(row.email)) {
      duplicates += 1;
      continue;
    }
    seen.add(row.email);
    rows.push(row);
  }

  return { rows, skipped, duplicates };
}
