import { test } from "node:test";
import assert from "node:assert/strict";
import {
  renderNewsletter,
  renderNewsletterHtml,
  personalize,
  inline,
  imageUrl,
  preflight,
  SAMPLE_DRAFT,
  SAMPLE_RECIPIENT,
} from "../src/lib/newsletter/render.ts";
import { normalizeBlocks, normalizeDraft, newBlock, safeHref, safeImage } from "../src/lib/newsletter/blocks.ts";
import { parseSubscriberList } from "../src/lib/newsletter/import.ts";
import { verifySvix, signSvix } from "../src/lib/newsletter/webhook.ts";

const sent = () =>
  renderNewsletter(SAMPLE_DRAFT, {
    recipient: { ...SAMPLE_RECIPIENT, unsubscribeUrl: "https://pgcreativeswi.com/newsletter/unsubscribe/tok123" },
    viewUrl: "https://pgcreativeswi.com/newsletter/view/pub456",
    postalAddress: "123 Main St, Green Bay, WI 54301",
  });

/* ── The same rules the transactional emails are held to ───────────── */

test("the newsletter obeys every rule the other emails obey", () => {
  const m = sent();
  assert.match(m.html, /^<!doctype html>/);
  assert.ok(!/display:\s*flex/i.test(m.html), "uses flexbox");
  assert.ok(!/display:\s*grid/i.test(m.html), "uses grid");
  assert.ok(!/position:\s*(absolute|fixed)/i.test(m.html), "uses positioning");
  const links = m.html.match(/<link[^>]+stylesheet[^>]*>/gi) ?? [];
  assert.equal(links.length, 1);
  assert.match(links[0], /fonts\.googleapis\.com/);
  assert.ok(m.html.includes("'Helvetica Neue', Helvetica, Arial, sans-serif"), "no fallback stack");
  assert.ok(!/<script/i.test(m.html));
  const tables = m.html.match(/<table/g) ?? [];
  const presentation = m.html.match(/role="presentation"/g) ?? [];
  assert.equal(tables.length, presentation.length, "a table is missing role=presentation");
  assert.ok(Buffer.byteLength(m.html) < 90_000, "too big for Gmail");
  for (const img of m.html.match(/<img[^>]*>/g) ?? []) {
    assert.match(img, /width="\d+"/, `img without width: ${img.slice(0, 80)}`);
    assert.match(img, /alt="[^"]+"/, `img without alt: ${img.slice(0, 80)}`);
  }
  for (const href of m.html.match(/href="([^"]+)"/g) ?? []) {
    assert.match(href, /href="(https?:|mailto:|tel:)/, `relative href ${href}`);
  }
  assert.match(m.html, /mso-hide:all/, "no preheader");
  assert.match(m.html, /name="color-scheme" content="dark"/);
  assert.match(m.html, /@media \(max-width:620px\)/);
  assert.ok(!/border-collapse:\s*collapse/.test(m.html));
  assert.match(m.html, /border-collapse:separate/);
  assert.ok(!/background:#ffffff/i.test(m.html), "a white surface");
  assert.ok(!/color:#2b6fb8/i.test(m.html), "--signal used as text");
  for (const tag of m.html.match(/<t[dr][^>]*>/g) ?? []) {
    if (/border-radius/.test(tag)) assert.ok(!/bgcolor=/i.test(tag), `bgcolor beside a radius: ${tag.slice(0, 100)}`);
  }
  assert.ok(m.subject.length > 8 && !/[\r\n]/.test(m.subject));
  assert.ok(m.text.length > 200, "plain text twin too thin");
});

test("the owner's rules hold in the sample: no dashes, American spelling", () => {
  const m = sent();
  const prose = m.subject + m.text;
  assert.ok(!/[–—]/.test(prose), "an en or em dash");
  assert.ok(!/colour|centre|favour|organis|realis|analyse|whilst|behaviour/i.test(prose));
});

/* ── What a newsletter needs that a notification does not ──────────── */

test("the footer carries what the law and Gmail require", () => {
  const m = sent();
  assert.match(m.html, /href="https:\/\/pgcreativeswi\.com\/newsletter\/unsubscribe\/tok123"[^>]*>Unsubscribe</);
  assert.match(m.html, /View in a browser/);
  assert.match(m.html, /123 Main St, Green Bay, WI 54301/, "postal address missing");
  assert.match(m.html, /You are getting this because/);
  assert.ok(m.text.includes("Unsubscribe: https://pgcreativeswi.com/newsletter/unsubscribe/tok123"));
  assert.ok(m.text.includes("123 Main St"));
  assert.equal(m.replyTo, "pgcreativeswisconsin@gmail.com");
});

test("with no postal address the footer shows the markets served, never nothing", () => {
  const m = renderNewsletter(SAMPLE_DRAFT, { recipient: SAMPLE_RECIPIENT });
  assert.match(m.html, /Green Bay, Madison, Milwaukee &amp; Fox Valley, WI/);
  assert.ok(!/View in a browser/.test(m.html), "a draft preview has no public copy to link to");
});

test("personalization fills the name and falls back to there", () => {
  assert.equal(personalize("Hi {{first_name}},", { email: "a@b.c", firstName: "Heather", unsubscribeUrl: "" }), "Hi Heather,");
  assert.equal(personalize("Hi {{ first_name }},", { email: "a@b.c", firstName: "  ", unsubscribeUrl: "" }), "Hi there,");
  assert.equal(personalize("Hi {{first_name}},"), "Hi there,");
  const m = sent();
  assert.match(m.html, /Hi Heather, here is September/);
  assert.ok(!m.html.includes("{{"), "a token leaked into the html");
  assert.ok(!m.text.includes("{{"), "a token leaked into the text");
  const nameless = renderNewsletter(SAMPLE_DRAFT, {
    recipient: { email: "x@y.z", unsubscribeUrl: "https://pgcreativeswi.com/newsletter/unsubscribe/x" },
  });
  assert.match(nameless.html, /Hi there, here is September/);
});

test("inline syntax: bold and links, nothing else, and it cannot smuggle a tag", () => {
  assert.equal(
    inline("Book **now** at [the site](https://pgcreativeswi.com/contact)"),
    'Book <strong style="font-weight:600;color:#ffffff">now</strong> at <a href="https://pgcreativeswi.com/contact" style="color:#6ab0d4;text-decoration:underline">the site</a>',
  );
  const evil = inline("<script>alert(1)</script> [x](javascript:alert(1)) **<b>y</b>**");
  assert.ok(!evil.includes("<script"), "script tag survived");
  assert.ok(!/href="javascript/.test(evil), "javascript href survived");
  assert.ok(!evil.includes("<b>"), "raw bold tag survived");
  assert.ok(evil.includes("&lt;b&gt;y&lt;/b&gt;"), "tag should show as text");
});

test("site pictures go through the optimizer at 1200 wide, external ones untouched", () => {
  assert.equal(
    imageUrl("/images/farmhouse-kitchen.jpg"),
    "https://pgcreativeswi.com/_next/image?url=%2Fimages%2Ffarmhouse-kitchen.jpg&w=1200&q=75",
  );
  assert.equal(imageUrl("https://i.vimeocdn.com/video/1_640x1138"), "https://i.vimeocdn.com/video/1_640x1138");
  assert.equal(imageUrl(""), "");
});

test("the two column block gives Outlook a real table and everyone else inline blocks", () => {
  const html = renderNewsletterHtml({
    subject: "x",
    preheader: "",
    blocks: [
      {
        id: "f",
        kind: "feature",
        image: "/images/a.jpg",
        alt: "A",
        title: "T",
        text: "Body",
        href: "https://pgcreativeswi.com",
        buttonLabel: "More",
        side: "left",
      },
    ],
  });
  assert.match(html, /<!--\[if mso\]><table role="presentation"/, "no conditional table for Outlook");
  assert.equal((html.match(/class="nl-col"/g) ?? []).length, 2, "two columns");
  assert.match(html, /max-width:266px/, "columns are half the content width");
  assert.match(html, /\.nl-col\{max-width:100% !important/, "columns do not stack on a phone");
  assert.match(html, /font-size:0;line-height:0/, "inline block whitespace not removed");
});

test("a reel renders at a phone's proportion, a landscape film full width", () => {
  const reel = renderNewsletterHtml({
    subject: "x",
    preheader: "",
    blocks: [{ id: "r", kind: "film", vimeoId: "1155091381", title: "Tour", category: "Real Estate", poster: "https://i.vimeocdn.com/p_640x1138", portrait: true }],
  });
  assert.match(reel, /width="240" height="427"/);
  assert.match(reel, /href="https:\/\/vimeo\.com\/1155091381"/);
  assert.match(reel, /Watch the film/);
  const film = renderNewsletterHtml({
    subject: "x",
    preheader: "",
    blocks: [{ id: "r", kind: "film", vimeoId: "1155091381", title: "Tour", category: "", poster: "https://i.vimeocdn.com/p_1280x720", portrait: false }],
  });
  assert.match(film, /width="532" height="299"/);
});

test("empty blocks render nothing rather than an empty box", () => {
  const html = renderNewsletterHtml({
    subject: "x",
    preheader: "",
    blocks: [newBlock("image"), newBlock("button"), newBlock("film"), newBlock("quote")],
  });
  const stripped = renderNewsletterHtml({ subject: "x", preheader: "", blocks: [] });
  assert.equal(html, stripped);
});

test("everything typed into a block is escaped", () => {
  const html = renderNewsletterHtml({
    subject: "<img src=x onerror=alert(1)>",
    preheader: "",
    blocks: [
      { id: "h", kind: "heading", label: "<b>l</b>", text: "<script>x</script>" },
      { id: "q", kind: "quote", text: "\"quoted\" & <i>", name: "<n>", role: "<r>" },
      { id: "b", kind: "button", label: "<l>", href: "https://x.y/?a=1&b=2\"onclick=\"", style: "solid" },
    ],
  });
  assert.ok(!html.includes("<script>x"), "script leaked");
  assert.ok(!html.includes("<b>l</b>"), "label tag leaked");
  assert.ok(!html.includes("<i>"), "quote tag leaked");
  assert.ok(!html.includes('"onclick="'), "attribute injection through href");
  assert.ok(html.includes("&lt;script&gt;x&lt;/script&gt;"));
});

/* ── Normalization: what the client sends is never trusted ─────────── */

test("normalizeBlocks drops unknown kinds and unsafe links, keeps the rest", () => {
  const blocks = normalizeBlocks([
    { kind: "nope", text: "x" },
    { kind: "button", label: "  Go  ", href: "javascript:alert(1)", style: "weird" },
    { kind: "button", label: "Go", href: "https://pgcreativeswi.com", style: "outline", id: "keep" },
    { kind: "image", image: "data:image/png;base64,AAAA", alt: "a" },
    { kind: "image", image: "/images/ok.jpg", alt: "a", href: "/relative" },
    { kind: "spacer", size: "xl" },
    "garbage",
    null,
  ]);
  assert.equal(blocks.length, 5);
  assert.equal(blocks[0].kind, "button");
  assert.equal(blocks[0].label, "Go");
  assert.equal(blocks[0].href, "", "javascript: should be emptied");
  assert.equal(blocks[0].style, "solid", "unknown style falls back");
  assert.equal(blocks[1].id, "keep");
  assert.equal(blocks[2].image, "", "data URI should be emptied");
  assert.equal(blocks[3].href, "", "relative link should be emptied");
  assert.equal(blocks[4].size, "m");
  assert.ok(blocks.every((b) => typeof b.id === "string" && b.id.length > 0), "every block gets an id");
});

test("normalizeDraft flattens the subject to one line", () => {
  const d = normalizeDraft({ subject: "  A\r\nBcc: x  ", preheader: 7, blocks: "no" });
  assert.equal(d.subject, "A Bcc: x");
  assert.equal(d.preheader, "");
  assert.deepEqual(d.blocks, []);
});

test("safeHref and safeImage accept exactly the schemes an inbox can follow", () => {
  assert.equal(safeHref("https://a.b/c?d=1"), "https://a.b/c?d=1");
  assert.equal(safeHref("mailto:x@y.z"), "mailto:x@y.z");
  assert.equal(safeHref("tel:+1 (920) 777-0127"), "tel:+1 (920) 777-0127");
  assert.equal(safeHref("ftp://a.b"), "");
  assert.equal(safeHref("javascript:void(0)"), "");
  assert.equal(safeHref("/contact"), "");
  assert.equal(safeImage("/images/a.jpg"), "/images/a.jpg");
  assert.equal(safeImage("https://i.vimeocdn.com/x.jpg"), "https://i.vimeocdn.com/x.jpg");
  assert.equal(safeImage("http://insecure.com/x.jpg"), "", "http pictures show a warning in mail clients");
  assert.equal(safeImage("/images/../secret"), "");
});

/* ── Preflight ──────────────────────────────────────────────────────── */

test("preflight stops a send that would embarrass and flags what would not", () => {
  const ok = preflight(SAMPLE_DRAFT, { subscribers: 12, hasKey: true, postalAddress: "1 St" });
  assert.deepEqual(ok.errors, []);
  assert.ok(ok.warnings.some((w) => w.includes("first_name")), "should mention the token fallback");

  const bad = preflight(
    {
      subject: "",
      preheader: "",
      blocks: [
        { id: "i", kind: "image", image: "/images/a.jpg", alt: "", caption: "", href: "" },
        { id: "b", kind: "button", label: "Go", href: "", style: "solid" },
        { id: "t", kind: "text", text: "A dash — here" },
      ],
    },
    { subscribers: 0, hasKey: false },
  );
  assert.ok(bad.errors.some((e) => e.includes("subject")));
  assert.ok(bad.errors.some((e) => e.includes("describe the picture")));
  assert.ok(bad.errors.some((e) => e.includes("button")));
  assert.ok(bad.errors.some((e) => e.includes("nobody on the list")));
  assert.ok(bad.errors.some((e) => e.includes("Resend key")));
  assert.ok(bad.warnings.some((w) => w.includes("dash")));
  assert.ok(bad.warnings.some((w) => w.includes("postal address")));
});

/* ── The pasted list ───────────────────────────────────────────────── */

test("a pasted list in any common shape becomes rows", () => {
  const { rows, skipped, duplicates } = parseSubscriberList(
    [
      "heather@example.com",
      "Kirstie Skul <kirstie@example.com>",
      "paula@example.com, Paula, Motte, RE/MAX",
      "Mark Bauer, mark@example.com",
      '"Lee, Sam" <sam@example.com>',
      "Heather Zeitler heather@example.com",
      "this line has no address",
      "",
      "  Nina  <NINA@Example.COM>  ",
    ].join("\n"),
  );
  assert.equal(skipped.length, 1);
  assert.equal(skipped[0], "this line has no address");
  assert.equal(duplicates, 1, "heather appears twice");
  assert.deepEqual(rows.map((r) => r.email), [
    "heather@example.com",
    "kirstie@example.com",
    "paula@example.com",
    "mark@example.com",
    "sam@example.com",
    "nina@example.com",
  ]);
  assert.deepEqual(rows[1], { email: "kirstie@example.com", firstName: "Kirstie", lastName: "Skul", company: "" });
  assert.deepEqual(rows[2], { email: "paula@example.com", firstName: "Paula", lastName: "Motte", company: "RE/MAX" });
  assert.deepEqual(rows[3], { email: "mark@example.com", firstName: "Mark", lastName: "Bauer", company: "" });
  assert.equal(rows[5].firstName, "Nina");
});

test("a spreadsheet export with a header row is read by its column names", () => {
  const csv = [
    "Email Address,First Name,Last Name,Brokerage",
    "a@x.com,Ann,Lee,Keller Williams",
    'b@x.com,"Bo, Jr.",Chen,',
    "c@x.com,,,",
  ].join("\n");
  const { rows, skipped } = parseSubscriberList(csv);
  assert.equal(skipped.length, 0, "the header must not be reported as a bad line");
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[0], { email: "a@x.com", firstName: "Ann", lastName: "Lee", company: "Keller Williams" });
  assert.equal(rows[1].firstName, "Bo, Jr.");
  assert.equal(rows[2].firstName, "");

  const tsv = "name\temail\nHeather Zeitler\theather@x.com";
  const t = parseSubscriberList(tsv);
  assert.deepEqual(t.rows[0], { email: "heather@x.com", firstName: "Heather", lastName: "Zeitler", company: "" });
});

/* ── The webhook signature ─────────────────────────────────────────── */

test("a Resend webhook is accepted only with a fresh, valid signature", () => {
  const secret = "whsec_" + Buffer.from("a-test-key-of-some-length").toString("base64");
  const body = JSON.stringify({ type: "email.bounced", data: { email_id: "1" } });
  const id = "msg_1";
  const now = 1_800_000_000;
  const ts = String(now - 30);
  const sig = signSvix(id, ts, body, secret);

  assert.deepEqual(verifySvix({ id, timestamp: ts, signature: sig }, body, secret, now), { ok: true });
  assert.deepEqual(
    verifySvix({ id, timestamp: ts, signature: `v1,AAAA ${sig}` }, body, secret, now),
    { ok: true },
    "any one of several signatures may match",
  );
  assert.equal(verifySvix({ id, timestamp: ts, signature: sig }, body + " ", secret, now).ok, false, "body changed");
  assert.equal(verifySvix({ id, timestamp: ts, signature: sig }, body, "whsec_" + Buffer.from("other").toString("base64"), now).ok, false);
  assert.equal(
    verifySvix({ id, timestamp: String(now - 600), signature: signSvix(id, String(now - 600), body, secret) }, body, secret, now).ok,
    false,
    "ten minutes old is a replay",
  );
  assert.equal(verifySvix({ id: null, timestamp: ts, signature: sig }, body, secret, now).ok, false);
  assert.equal(verifySvix({ id, timestamp: ts, signature: sig }, body, "", now).ok, false, "no secret means nothing verifies");
});
