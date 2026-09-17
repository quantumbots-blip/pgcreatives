import { test } from "node:test";
import assert from "node:assert/strict";
import {
  renderNewsletter,
  renderNewsletterHtml,
  personalize,
  inline,
  pic,
  preflight,
  PALETTES,
} from "../src/lib/newsletter/render.ts";
import { TEMPLATES, SAMPLE_DRAFT, SAMPLE_RECIPIENT, draftFromTemplate } from "../src/lib/newsletter/templates.ts";
import { normalizeBlocks, normalizeDraft, newBlock, safeHref, safeImage, THEMES } from "../src/lib/newsletter/blocks.ts";
import { parseSubscriberList } from "../src/lib/newsletter/import.ts";
import { verifySvix, signSvix } from "../src/lib/newsletter/webhook.ts";

const sent = (draft = SAMPLE_DRAFT) =>
  renderNewsletter(draft, {
    recipient: { ...SAMPLE_RECIPIENT, unsubscribeUrl: "https://pgcreativeswi.com/newsletter/unsubscribe/tok123" },
    viewUrl: "https://pgcreativeswi.com/newsletter/view/pub456",
    postalAddress: "123 Main St, Green Bay, WI 54301",
  });

/** Every template in every theme, which is every combination the editor can produce. */
const everyEmail = () =>
  TEMPLATES.flatMap((t) => THEMES.map((theme) => [`${t.id}/${theme}`, sent({ ...t.draft(), theme })]));

/* ── The same rules the transactional emails are held to ───────────── */

test("every template in every theme obeys every rule the other emails obey", () => {
  for (const [name, m] of everyEmail()) {
    assert.match(m.html, /^<!doctype html>/, name);
    assert.ok(!/display:\s*flex/i.test(m.html), `${name}: uses flexbox`);
    assert.ok(!/display:\s*grid/i.test(m.html), `${name}: uses grid`);
    assert.ok(!/position:\s*(absolute|fixed)/i.test(m.html), `${name}: uses positioning`);
    const links = m.html.match(/<link[^>]+stylesheet[^>]*>/gi) ?? [];
    assert.equal(links.length, 1, name);
    assert.match(links[0], /fonts\.googleapis\.com/);
    assert.ok(m.html.includes("'Helvetica Neue', Helvetica, Arial, sans-serif"), `${name}: no fallback stack`);
    assert.ok(!/<script/i.test(m.html), name);
    const tables = m.html.match(/<table/g) ?? [];
    const presentation = m.html.match(/role="presentation"/g) ?? [];
    assert.equal(tables.length, presentation.length, `${name}: a table is missing role=presentation`);
    assert.ok(Buffer.byteLength(m.html) < 90_000, `${name}: too big for Gmail (${Buffer.byteLength(m.html)})`);
    for (const img of m.html.match(/<img[^>]*>/g) ?? []) {
      assert.match(img, /width="\d+"/, `${name}: img without width: ${img.slice(0, 80)}`);
      assert.match(img, /alt="[^"]+"/, `${name}: img without alt: ${img.slice(0, 80)}`);
    }
    for (const href of m.html.match(/href="([^"]+)"/g) ?? []) {
      assert.match(href, /href="(https?:|mailto:|tel:)/, `${name}: relative href ${href}`);
    }
    for (const src of m.html.match(/src="([^"]+)"/g) ?? []) {
      assert.match(src, /src="https:\/\//, `${name}: relative or insecure src ${src}`);
    }
    assert.match(m.html, /mso-hide:all/, `${name}: no preheader`);
    assert.match(m.html, /name="color-scheme" content="(dark|light)"/, name);
    assert.match(m.html, /@media \(max-width:620px\)/, name);
    assert.ok(!/border-collapse:\s*collapse/.test(m.html), name);
    assert.match(m.html, /border-collapse:separate/, name);
    assert.ok(!/color:#2b6fb8/i.test(m.html), `${name}: --signal used as text`);
    for (const tag of m.html.match(/<t[dr][^>]*>/g) ?? []) {
      if (/border-radius/.test(tag)) assert.ok(!/bgcolor=/i.test(tag), `${name}: bgcolor beside a radius: ${tag.slice(0, 100)}`);
    }
    // Every conditional comment that opens must close.
    const opens = (m.html.match(/<!--\[if/g) ?? []).length;
    const closes = (m.html.match(/<!\[endif\]-->/g) ?? []).length;
    assert.equal(opens, closes, `${name}: unbalanced conditional comments`);
    assert.ok(m.subject.length > 8 && !/[\r\n]/.test(m.subject), name);
    assert.ok(m.text.length > 200, `${name}: plain text twin too thin`);
    assert.ok(!m.html.includes("{{"), `${name}: a token leaked into the html`);
    assert.ok(!m.html.includes("undefined") && !m.html.includes("NaN"), `${name}: undefined or NaN in the html`);
  }
});

test("the dark themes never paint a white surface; the light one never paints the night ground behind text", () => {
  for (const t of TEMPLATES) {
    const night = renderNewsletterHtml({ ...t.draft(), theme: "night" }, {});
    // A white button on the brand blue is fine; a white panel is the old design.
    assert.ok(!/background:#ffffff;border-radius:18px/i.test(night), `${t.id}: a white panel on the dark ground`);
    assert.match(night, /background:#07090c/);
    const paper = renderNewsletterHtml({ ...t.draft(), theme: "paper" }, {});
    assert.match(paper, /content="light"/, `${t.id}: paper should declare itself light`);
    assert.match(paper, /background:#f3f5f8/);
  }
  assert.equal(PALETTES.paper.scheme, "light");
});

test("the owner's rules hold in every template: no dashes, American spelling", () => {
  for (const [name, m] of everyEmail()) {
    const prose = m.subject + m.text;
    assert.ok(!/[–—]/.test(prose), `${name}: an en or em dash`);
    assert.ok(!/colour|centre|favour|organis|realis|analyse|whilst|behaviour/i.test(prose), `${name}: British spelling`);
  }
});

/* ── What a newsletter needs that a notification does not ──────────── */

test("the footer carries what the law and Gmail require", () => {
  const m = sent();
  assert.match(m.html, /href="https:\/\/pgcreativeswi\.com\/newsletter\/unsubscribe\/tok123"[^>]*>Unsubscribe</);
  assert.match(m.html, /View in a browser/);
  assert.match(m.html, /123 Main St, Green Bay, WI 54301/, "postal address missing");
  assert.match(m.html, /You are getting this because/);
  assert.match(m.html, /instagram\.com/, "social links missing");
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

test("pictures go through /media at the size the box needs; external ones untouched", () => {
  assert.equal(pic("/images/farmhouse-kitchen.jpg", 1200, 800), "https://pgcreativeswi.com/media/site/images/farmhouse-kitchen.jpg?w=1200&h=800");
  assert.equal(pic("/team/michael-mcintee.jpg", 128, 128), "https://pgcreativeswi.com/media/site/team/michael-mcintee.jpg?w=128&h=128");
  assert.equal(pic("/media/u/abc123defg.jpg", 1064, null), "https://pgcreativeswi.com/media/u/abc123defg.jpg?w=1064");
  assert.equal(pic("/images/a.jpg", 600, null, "http://localhost:3315"), "http://localhost:3315/media/site/images/a.jpg?w=600");
  assert.equal(pic("https://i.vimeocdn.com/video/1_640x1138", 1, 1), "https://i.vimeocdn.com/video/1_640x1138");
  assert.equal(pic("", 1, 1), "");
});

test("the two column block gives Outlook a real table and everyone else inline blocks", () => {
  const html = renderNewsletterHtml({
    subject: "x",
    preheader: "",
    theme: "night",
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
        tone: "plain",
      },
    ],
  });
  assert.match(html, /<!--\[if mso\]><table role="presentation"/, "no conditional table for Outlook");
  assert.equal((html.match(/class="nl-col"/g) ?? []).length, 2, "two columns");
  assert.match(html, /max-width:266px/, "columns are half the content width");
  assert.match(html, /\.nl-col\{max-width:100% !important/, "columns do not stack on a phone");
  assert.match(html, /font-size:0;line-height:0/, "inline block whitespace not removed");
});

test("a photo grid crops every frame to the same box and closes each Outlook row", () => {
  const html = renderNewsletterHtml({
    subject: "x",
    preheader: "",
    theme: "night",
    blocks: [
      {
        id: "g",
        kind: "gallery",
        title: "Shot this month",
        columns: 2,
        items: [
          { image: "/images/a.jpg", alt: "A", caption: "One", href: "" },
          { image: "/images/b.jpg", alt: "B", caption: "Two", href: "" },
          { image: "/images/c.jpg", alt: "C", caption: "Three", href: "https://pgcreativeswi.com" },
        ],
      },
    ],
  });
  assert.equal((html.match(/class="nl-col"/g) ?? []).length, 3);
  assert.equal((html.match(/w=508&amp;h=338/g) ?? []).length, 3, "every frame at the same 3:2 crop at 2x");
  // Two grid rows plus the shell's own Outlook wrapper.
  assert.equal((html.match(/<!--\[if mso\]><table/g) ?? []).length, 3, "two Outlook rows for three cells");
  assert.equal((html.match(/<!--\[if mso\]><\/td><\/tr><\/table>/g) ?? []).length, 3, "both rows closed");
});

test("the overlay opening is a bulletproof background with a VML twin for Outlook", () => {
  const html = renderNewsletterHtml({
    subject: "x",
    preheader: "",
    theme: "night",
    blocks: [{ id: "h", kind: "hero", image: "/images/a.jpg", alt: "A", title: "Over the picture", sub: "", href: "", layout: "overlay" }],
  });
  assert.match(html, /<v:rect[^>]*><v:fill type="frame" src="https:\/\/pgcreativeswi\.com\/media\/site\/images\/a\.jpg\?w=1200&amp;h=960"/);
  assert.match(html, /background-image:url\(https:\/\/pgcreativeswi\.com\/media\/site\/images\/a\.jpg\?w=1200&amp;h=960\)/);
  assert.match(html, /<td[^>]*style="[^"]*background:rgba\(7,9,12,0\.62\);border-radius:16px/, "the words need a wash behind them");
  assert.ok(!/<img/.test(html.split("Over the picture")[0].split("pg-shell")[1] ?? ""), "the overlay must not also stack the picture");
});

test("a block on the brand blue swaps to a white button, on a panel keeps the blue one", () => {
  const on = (tone) =>
    renderNewsletterHtml({
      subject: "x",
      preheader: "",
      theme: "night",
      blocks: [{ id: "c", kind: "cta", title: "Book", text: "", label: "Go", href: "https://pgcreativeswi.com", phones: false, tone }],
    });
  assert.match(on("accent"), /style="background:#0b2c56;border-radius:18px/, "accent panel missing");
  assert.match(on("accent"), /class="pg-btn" style="background:#ffffff;border:1px solid #ffffff/, "white button on the blue");
  assert.match(on("panel"), /style="background:#0f1319;border-radius:18px/, "panel missing");
  assert.match(on("panel"), /class="pg-btn" style="background:#2b6fb8/, "blue button on the panel");
  assert.ok(!/border-radius:18px/.test(on("plain")), "plain has no panel");
});

test("a reel renders at a phone's proportion, a landscape film full width", () => {
  const reel = renderNewsletterHtml({
    subject: "x",
    preheader: "",
    theme: "night",
    blocks: [{ id: "r", kind: "film", vimeoId: "1155091381", title: "Tour", category: "Real Estate", poster: "https://i.vimeocdn.com/p_640x1138", portrait: true }],
  });
  assert.match(reel, /width="240" height="427"/);
  assert.match(reel, /href="https:\/\/vimeo\.com\/1155091381"/);
  const film = renderNewsletterHtml({
    subject: "x",
    preheader: "",
    theme: "night",
    blocks: [{ id: "r", kind: "film", vimeoId: "1155091381", title: "Tour", category: "", poster: "https://i.vimeocdn.com/p_1280x720", portrait: false }],
  });
  assert.match(film, /width="532" height="299"/);
});

test("empty blocks render nothing rather than an empty box", () => {
  const html = renderNewsletterHtml({
    subject: "x",
    preheader: "",
    theme: "night",
    blocks: [newBlock("image"), newBlock("button"), newBlock("film"), newBlock("quote"), newBlock("gallery"), newBlock("stats"), newBlock("list"), newBlock("note")],
  });
  const stripped = renderNewsletterHtml({ subject: "x", preheader: "", theme: "night", blocks: [] });
  assert.equal(html, stripped);
});

test("the editor's ring lands on exactly one block and nowhere in a sent email", () => {
  const draft = { ...SAMPLE_DRAFT };
  const ringed = renderNewsletterHtml(draft, { highlightId: draft.blocks[1].id });
  assert.equal((ringed.match(/outline:2px solid/g) ?? []).length, 1);
  assert.equal((sent().html.match(/outline:2px solid/g) ?? []).length, 0);
});

test("everything typed into a block is escaped", () => {
  const html = renderNewsletterHtml({
    subject: "<img src=x onerror=alert(1)>",
    preheader: "",
    theme: "night",
    blocks: [
      { id: "h", kind: "heading", label: "<b>l</b>", text: "<script>x</script>", tone: "plain" },
      { id: "q", kind: "quote", text: "\"quoted\" & <i>", name: "<n>", role: "<r>", tone: "plain" },
      { id: "b", kind: "button", label: "<l>", href: "https://x.y/?a=1&b=2\"onclick=\"", style: "solid" },
      { id: "s", kind: "stats", items: [{ value: "<v>", label: "<w>" }, { value: "", label: "" }, { value: "", label: "" }], tone: "panel" },
      { id: "l", kind: "list", title: "", items: "<li>one\n<li>two", style: "bulleted", tone: "plain" },
    ],
  });
  assert.ok(!html.includes("<script>x"), "script leaked");
  assert.ok(!html.includes("<b>l</b>"), "label tag leaked");
  assert.ok(!html.includes("<i>"), "quote tag leaked");
  assert.ok(!html.includes('"onclick="'), "attribute injection through href");
  assert.ok(!html.includes("<v>") && !html.includes("<li>"), "stats or list tag leaked");
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
    { kind: "gallery", items: [{ image: "/media/u/abcdefghij.jpg", alt: "u" }, { image: "/etc/passwd" }, "junk"], columns: 5 },
    { kind: "heading", text: "t", tone: "neon" },
    "garbage",
    null,
  ]);
  assert.equal(blocks.length, 7);
  assert.equal(blocks[0].kind, "button");
  assert.equal(blocks[0].label, "Go");
  assert.equal(blocks[0].href, "", "javascript: should be emptied");
  assert.equal(blocks[0].style, "solid", "unknown style falls back");
  assert.equal(blocks[1].id, "keep");
  assert.equal(blocks[2].image, "", "data URI should be emptied");
  assert.equal(blocks[3].href, "", "relative link should be emptied");
  assert.equal(blocks[4].size, "m");
  assert.equal(blocks[5].columns, 2, "columns fall back to two");
  assert.equal(blocks[5].items.length, 3);
  assert.equal(blocks[5].items[0].image, "/media/u/abcdefghij.jpg", "an upload path is kept");
  assert.equal(blocks[5].items[1].image, "", "a stray path is emptied");
  assert.equal(blocks[6].tone, "plain", "unknown tone falls back");
  assert.ok(blocks.every((b) => typeof b.id === "string" && b.id.length > 0), "every block gets an id");
});

test("normalizeDraft flattens the subject to one line and keeps a known theme", () => {
  const d = normalizeDraft({ subject: "  A\r\nBcc: x  ", preheader: 7, blocks: "no", theme: "neon" });
  assert.equal(d.subject, "A Bcc: x");
  assert.equal(d.preheader, "");
  assert.equal(d.theme, "night");
  assert.deepEqual(d.blocks, []);
  assert.equal(normalizeDraft({ theme: "paper" }).theme, "paper");
});

test("safeHref and safeImage accept exactly the schemes an inbox can follow", () => {
  assert.equal(safeHref("https://a.b/c?d=1"), "https://a.b/c?d=1");
  assert.equal(safeHref("mailto:x@y.z"), "mailto:x@y.z");
  assert.equal(safeHref("tel:+1 (920) 777-0127"), "tel:+1 (920) 777-0127");
  assert.equal(safeHref("ftp://a.b"), "");
  assert.equal(safeHref("javascript:void(0)"), "");
  assert.equal(safeHref("/contact"), "");
  assert.equal(safeImage("/images/a.jpg"), "/images/a.jpg");
  assert.equal(safeImage("/team/michael-mcintee.jpg"), "/team/michael-mcintee.jpg");
  assert.equal(safeImage("/media/u/abcdefghijk.jpg"), "/media/u/abcdefghijk.jpg");
  assert.equal(safeImage("/media/u/../secret.jpg"), "");
  assert.equal(safeImage("https://i.vimeocdn.com/x.jpg"), "https://i.vimeocdn.com/x.jpg");
  assert.equal(safeImage("http://insecure.com/x.jpg"), "", "http pictures show a warning in mail clients");
  assert.equal(safeImage("/images/../secret"), "");
});

/* ── Templates ─────────────────────────────────────────────────────── */

test("every template starts complete: passes preflight with nothing to fix", () => {
  for (const t of TEMPLATES) {
    const d = t.draft();
    const check = preflight(d, { subscribers: 12, hasKey: true, postalAddress: "1 St" });
    assert.deepEqual(check.errors, [], `${t.id}: ${check.errors.join(" | ")}`);
    assert.ok(d.blocks.some((b) => b.kind === "cta" || b.kind === "button"), `${t.id}: no ask`);
    assert.equal(d.theme, t.theme);
  }
  const fresh = draftFromTemplate("monthly-recap");
  const again = draftFromTemplate("monthly-recap");
  assert.ok(fresh && again);
  assert.notEqual(fresh.blocks[0].id, again.blocks[0].id, "each copy gets its own ids");
  assert.equal(draftFromTemplate("nope"), null);
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
      theme: "night",
      blocks: [
        { id: "i", kind: "image", image: "/images/a.jpg", alt: "", caption: "", href: "" },
        { id: "b", kind: "button", label: "Go", href: "", style: "solid" },
        { id: "t", kind: "text", text: "A dash — here", tone: "plain" },
        { id: "g", kind: "gallery", title: "", columns: 2, items: [{ image: "/images/a.jpg", alt: "", caption: "", href: "" }] },
      ],
    },
    { subscribers: 0, hasKey: false },
  );
  assert.ok(bad.errors.some((e) => e.includes("subject")));
  assert.ok(bad.errors.some((e) => e.includes("describe the picture")));
  assert.ok(bad.errors.some((e) => e.includes("caption or a description")));
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
