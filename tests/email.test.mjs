import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EMAIL_KINDS,
  renderSample,
  newLeadEmail,
  weeklyDigestEmail,
  leadConfirmationEmail,
  SAMPLE,
} from "../src/lib/email/templates.ts";

const all = () => EMAIL_KINDS.map((k) => [k, renderSample(k)]);

test("every email has a one line subject, a button and a plain text twin", () => {
  for (const [kind, m] of all()) {
    assert.ok(m.subject.length > 8, `${kind}: subject too short`);
    assert.ok(!/[\r\n]/.test(m.subject), `${kind}: subject has a newline`);
    assert.ok(m.subject.length <= 200, `${kind}: subject too long`);
    // Attribute order is not the contract. A button is an anchor that fills
    // its cell, however many classes sit between the href and the style.
    assert.match(m.html, /<a href="[^"]+"[^>]*style="[^"]*display:block/, `${kind}: no button`);
    assert.ok(m.text.length > 80, `${kind}: plain text twin too thin`);
    assert.match(m.html, /^<!doctype html>/, `${kind}: no doctype`);
  }
});

test("the owner's rules: no dashes, American spelling", () => {
  for (const [kind, m] of all()) {
    const prose = m.subject + m.text;
    assert.ok(!/[–—]/.test(prose), `${kind}: carries an en or em dash`);
    assert.ok(
      !/colour|centre|favour|organis|realis|analyse|whilst|behaviour/i.test(prose),
      `${kind}: British spelling`,
    );
  }
});

test("built for email clients, not browsers", () => {
  for (const [kind, m] of all()) {
    // No layout technique that Outlook's Word engine cannot do.
    assert.ok(!/display:\s*flex/i.test(m.html), `${kind}: uses flexbox`);
    assert.ok(!/display:\s*grid/i.test(m.html), `${kind}: uses grid`);
    assert.ok(!/position:\s*(absolute|fixed)/i.test(m.html), `${kind}: uses positioning`);
    /* One external stylesheet is allowed and only one: the site's face from
       Google Fonts. Apple Mail and iOS Mail load it, which is where this is
       mostly read, and every other client ignores it. It is an enhancement,
       never a dependency, so the fallback stack has to be there too. */
    const links = m.html.match(/<link[^>]+stylesheet[^>]*>/gi) ?? [];
    assert.ok(links.length <= 1, `${kind}: more than one external stylesheet`);
    for (const link of links) {
      assert.match(link, /fonts\.googleapis\.com/, `${kind}: unexpected external stylesheet`);
    }
    assert.ok(
      m.html.includes("'Helvetica Neue', Helvetica, Arial, sans-serif"),
      `${kind}: no fallback font stack, so the web font is a dependency`,
    );
    assert.ok(!/@font-face/i.test(m.html), `${kind}: inline font face`);
    assert.ok(!/<script/i.test(m.html), `${kind}: script tag`);
    // Layout tables must be invisible to a screen reader.
    const tables = m.html.match(/<table/g) ?? [];
    const presentation = m.html.match(/role="presentation"/g) ?? [];
    assert.equal(tables.length, presentation.length, `${kind}: a table is missing role=presentation`);
    // Gmail clips at about 102KB.
    assert.ok(Buffer.byteLength(m.html) < 90_000, `${kind}: html too big for Gmail`);
    // Images need dimensions and alt text or they break the layout when blocked.
    for (const img of m.html.match(/<img[^>]*>/g) ?? []) {
      assert.match(img, /width="\d+"/, `${kind}: img without width`);
      assert.match(img, /alt="[^"]+"/, `${kind}: img without alt text`);
    }
    // Absolute URLs only. A relative href in an inbox goes nowhere.
    for (const href of m.html.match(/href="([^"]+)"/g) ?? []) {
      assert.match(
        href,
        /href="(https?:|mailto:|tel:|sms:)/,
        `${kind}: relative or unknown href ${href}`,
      );
    }
    // A preheader, so the inbox preview is not the logo's alt text.
    assert.match(m.html, /mso-hide:all/, `${kind}: no preheader`);
    assert.match(m.html, /name="color-scheme"/, `${kind}: no color scheme hint`);
    assert.match(m.html, /@media \(max-width:620px\)/, `${kind}: no mobile breakpoint`);
  }
});

test("a new lead can be called, texted and emailed straight from the inbox", () => {
  const m = newLeadEmail(SAMPLE.new_lead);
  assert.match(m.html, /href="tel:\+19205911323"/, "no call link");
  assert.match(m.html, /href="sms:\+19205911323\?&amp;body=/, "no text link");
  assert.match(m.html, /href="mailto:heathersellswi@gmail\.com\?subject=/, "no email link");
  // The text a tap would send is written, not blank. Decode the sms href on
  // its own: the document is full of raw % characters and decoding all of it
  // throws before it can tell you anything.
  const smsMatch = m.html.match(/href="sms:[^"]*body=([^"]+)"/);
  assert.ok(smsMatch, "no sms body to check");
  assert.ok(
    decodeURIComponent(smsMatch[1].replace(/&amp;/g, "&")).includes(
      "this is PG Creatives getting back to you",
    ),
    "the text body is not pre written",
  );
  assert.equal(m.replyTo, "heathersellswi@gmail.com", "reply should reach the customer");
  /* Call is the only filled button and takes the full width; text and email
     pair beside each other. Four stacked buttons read as a form. */
  assert.equal((m.html.match(/class="pg-col"/g) ?? []).length, 2, "text and email should pair");
  assert.match(m.html, /@media \(min-width:400px\)/, "no rule to put the pair in a row");
  assert.equal(
    (m.html.match(/class="pg-btn"/g) ?? []).length,
    1,
    "exactly one filled button, so the primary action is obvious",
  );
  /* The email is dark, so there is no light version for a client to switch
     away from. What matters instead is that it says so, and that every colour
     is stated rather than inherited. */
  assert.match(m.html, /name="color-scheme" content="dark"/, "does not declare itself dark");
  assert.match(m.html, /background:#07090c/, "not on the site's ground");
  assert.match(m.subject, /^New lead: Heather Zeitler/);
  // The plain text twin carries the same links.
  assert.ok(m.text.includes("tel:+19205911323"), "plain text has no call link");
  assert.ok(m.text.includes("https://pgcreativeswi.com/admin"), "plain text has no dashboard link");
});

test("a lead with no phone offers what it can and claims nothing it cannot", () => {
  const m = newLeadEmail({ ...SAMPLE.new_lead, phone: "" });
  assert.ok(!/href="tel:/.test(m.html), "offers a call with no number");
  assert.ok(!/href="sms:/.test(m.html), "offers a text with no number");
  assert.match(m.html, /href="mailto:/, "should still offer email");
  assert.match(m.html, /left no number/, "should say why there is no call button");
});

test("the Monday email leads with whoever is waiting", () => {
  const busy = weeklyDigestEmail(SAMPLE.weekly_digest);
  assert.match(busy.subject, /3 leads are waiting on you/);
  assert.ok(busy.html.includes("Kirstie Skul"), "does not name who is waiting");
  assert.ok(busy.text.includes("waiting 160 days"), "plain text loses the wait");
  assert.match(busy.html, /Answer them now/);

  const quiet = weeklyDigestEmail({ ...SAMPLE.weekly_digest, waiting: 0, waitingNames: [] });
  assert.match(quiet.subject, /Your week at PG Creatives/);
  assert.match(quiet.html, /Nobody is waiting/);
  assert.ok(!quiet.html.includes("Kirstie Skul"), "names somebody when nobody waits");
});

test("anything a stranger typed is escaped, and the subject stays one line", () => {
  const m = newLeadEmail({
    ...SAMPLE.new_lead,
    firstName: "<b>Evil</b>",
    lastName: "X\r\nBcc: someone@example.com",
    message: "<script>alert(1)</script>",
  });
  assert.ok(!m.html.includes("<b>Evil</b>"), "html injected through the name");
  assert.ok(!m.html.includes("<script>alert"), "script injected through the message");
  assert.ok(m.html.includes("&lt;script&gt;"), "the message should show as text");
  /* The property that matters is that no line break reaches the header:
     that is what would let a second header be smuggled in. The letters
     "Bcc:" surviving inside somebody's name is only them quoting themselves
     back into a subject line, which is harmless and visible. */
  assert.ok(!/[\r\n]/.test(m.subject), "header injection through the subject");
  assert.ok(m.subject.includes("Bcc: someone@example.com"), "the name should be flattened, not dropped");
  assert.ok(!/\r|\n/.test(m.text.split("\n")[0]), "first text line should be clean");
});

test("missing data still renders every email", () => {
  assert.ok(newLeadEmail({
    firstName: "", lastName: "", email: "", phone: "", company: "", service: "", message: "",
  }).html.length > 500);
  assert.ok(weeklyDigestEmail({
    waiting: 0, waitingNames: [], leadsThisWeek: 0, leadsLastWeek: 0, booked: 0,
    viewsThisWeek: 0, viewsLastWeek: 0, spamFiltered: 0, medianReplyHours: null,
  }).html.length > 500);
  assert.ok(leadConfirmationEmail({ firstName: "", service: "", message: "" }).html.length > 500);
});

test("the customer email says who it is from and why they got it", () => {
  const m = leadConfirmationEmail(SAMPLE.lead_confirmation);
  assert.match(m.html, /you sent us a message at pgcreativeswi\.com/);
  assert.equal(m.replyTo, "pgcreativeswisconsin@gmail.com");
  assert.match(m.html, /href="tel:\+19207770127"/, "should offer the Green Bay number");
  assert.ok(!m.html.includes("dashboard"), "customer email leaks an internal link");
});

test("a rejected send is reported, not swallowed", async () => {
  const { sendEmail } = await import("../src/lib/email/send.ts");
  const saved = process.env.RESEND_API_KEY;

  process.env.RESEND_API_KEY = "";
  const noKey = await sendEmail({ to: "a@b.com", mail: renderSample("new_lead"), kind: "test" });
  assert.equal(noKey.ok, false, "a missing key must not read as success");
  assert.match(noKey.reason, /RESEND_API_KEY/);

  /* The bug this guards. The Resend SDK resolves with { data: null, error }
     rather than throwing, so a try/catch around it never fires and a rejected
     send is indistinguishable from a delivered one. An invalid key exercises
     exactly that path. */
  process.env.RESEND_API_KEY = "re_invalid_key_used_only_by_this_test";
  const rejected = await sendEmail({ to: "a@b.com", mail: renderSample("new_lead"), kind: "test" });
  assert.equal(rejected.ok, false, "an API rejection must not read as success");
  assert.ok(rejected.reason.length > 0, "a rejection must carry a reason");

  if (saved === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = saved;
});

test("nothing that carries a radius also carries a bgcolor attribute", () => {
  /* This is the bug the owner photographed: a `bgcolor` attribute paints a
     square that `border-radius` never clips, so a rounded button sat inside a
     hard cornered box and the card showed a pale edge at its corners. */
  for (const [kind, m] of all()) {
    const tags = m.html.match(/<t[dr][^>]*>/g) ?? [];
    for (const tag of tags) {
      if (/border-radius/.test(tag)) {
        assert.ok(!/bgcolor=/i.test(tag), `${kind}: rounded element still has a bgcolor: ${tag.slice(0, 120)}`);
      }
    }
  }
});

test("borders are separate, or every rounded corner is a lie", () => {
  /* border-collapse:collapse makes border-radius on a table cell undefined.
     Every bordered pill then draws a square outline around a rounded fill,
     which is the artefact the owner photographed. */
  for (const [kind, m] of all()) {
    assert.ok(
      !/border-collapse:\s*collapse/.test(m.html),
      `${kind}: collapsed borders will square off every rounded corner`,
    );
    assert.match(m.html, /border-collapse:separate/, `${kind}: border-collapse not set at all`);
  }
});

test("it is the website, not a white card wearing a logo", () => {
  for (const [kind, m] of all()) {
    // One ground throughout. A white surface anywhere is the old design.
    assert.ok(
      !/background:#ffffff/i.test(m.html),
      `${kind}: a white surface, which is not what the site looks like`,
    );
    assert.ok(m.html.includes(":999px"), `${kind}: buttons are not the site's pill`);
    // The accent may fill a shape but must never be the colour of a word: it
    // measures 3.86:1 on this ground and fails.
    assert.ok(
      !/color:#2b6fb8/i.test(m.html),
      `${kind}: --signal used as text, which fails contrast on the ground`,
    );
  }
});
