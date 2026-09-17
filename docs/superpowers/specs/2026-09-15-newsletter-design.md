# Newsletter: design

Date: 2026-09-15. Path: architectural (a new subsystem on the dashboard).

## What the owner asked for

A page on the dashboard where he can build a custom, branded email each
month, see exactly what it will look like on a phone and a desktop, and send
it to his whole client list. The emails have to look like the site, work in
every mail client, and be adaptive. He will hand over the list once the tool
exists.

## What already exists and is reused

- `src/lib/email/layout.ts`: the dark, one ground, table based email shell,
  the `COLOR` tokens, `esc`, `headerSafe`, and the rules the tests enforce
  (no flex or grid, `role="presentation"` on every table, absolute hrefs,
  preheader, `color-scheme`, under 90KB, separate borders, no `bgcolor` beside
  a radius, no white surface, `--signal` never as text).
- `src/lib/email/send.ts`: one place that sends and checks Resend's `error`.
- The dashboard furniture: `AdminNav`, `Panel`, the auth pattern in every
  `/admin` page, `requireAdmin()` in server actions, `logAuditEvent`.
- The test harness: `node --test` with the `@/` alias hook.

## Research that shaped this

- **Gmail, Yahoo, Apple and Microsoft bulk sender rules (enforced since 2024,
  tightened through 2026):** SPF + DKIM + DMARC on the sending domain,
  RFC 8058 one click unsubscribe (`List-Unsubscribe` + `List-Unsubscribe-Post:
  List-Unsubscribe=One-Click`, honored within two days), spam complaints under
  0.3%, a visible unsubscribe link in the body. A newsletter that ignores these
  gets a 550 at Gmail.
- **CAN-SPAM:** a working unsubscribe, honored within ten business days, a
  truthful From and subject, and a physical postal address in every message.
- **Rendering:** 600px tables with inline styles; Outlook on Windows renders
  through Word, so no flex, grid, background images or web fonts as a
  dependency; images blocked by default in many clients, so alt text and
  declared dimensions; Gmail clips at about 102KB; dark mode is three different
  problems (Apple Mail inverts, Gmail partially, Outlook barely), which the
  existing shell already answers by being dark on purpose, declaring it, and
  stating every color explicitly.
- **Resend:** batch endpoint takes up to 100 emails per call, per email
  `headers`, `tags`, `reply_to`; 10 requests per second; the free plan has a
  daily cap (100) and a monthly cap (3,000), and `daily_quota_exceeded` is a
  distinct error. The sending domain `pgcreativeswi.com` is not verified in
  Resend yet, so every send fails today; this is an owner step, documented on
  the page.

## Architecture

Five pieces, each with one job:

1. **Subscribers** (`newsletter_subscribers`): who gets the newsletter. Import
   by pasting a list in any common shape, add one by hand, unsubscribe,
   export. Status is `subscribed`, `unsubscribed`, `bounced` or `complained`;
   only `subscribed` ever receives mail. Each row carries a random
   `unsubscribe_token`.
2. **Campaigns** (`newsletter_campaigns`): one email. Subject, preheader, and
   the content as a JSON list of blocks. Status is `draft`, `sending`, `paused`
   or `sent`. A `public_token` serves the "view in browser" copy.
3. **Deliveries** (`newsletter_deliveries`): one row per recipient per
   campaign, unique on the pair, so sending is idempotent and resumable. Holds
   the Resend id and any error.
4. **Renderer** (`src/lib/newsletter/render.ts`): blocks in, `{subject, html,
   text}` out, built on the same tokens and rules as the transactional shell.
   Personalization tokens (`{{first_name}}`) are filled per recipient.
5. **Sender** (`src/lib/newsletter/send.ts`): queues deliveries for every
   subscribed address, then works through them in batches of 100 with the
   unsubscribe headers on every message. Stops cleanly on a quota error and
   leaves the campaign `paused` with the reason, so a "Resume" button finishes
   the job on a later day. Runs inside the server action; the route segment
   gets `maxDuration = 300`.

Bounces and complaints come back through a Resend webhook
(`/api/newsletter/webhook`), verified with the Svix signature scheme by hand
(no new dependency), gated on `RESEND_WEBHOOK_SECRET`. A hard bounce or a
complaint flips the subscriber's status so they are never mailed again, which
is what keeps the complaint rate under Gmail's line.

## The editor

`/admin/newsletter` lists campaigns and shows the list size and the sending
status. `/admin/newsletter/subscribers` manages the list.
`/admin/newsletter/[id]` is the editor.

Block based, not free HTML: free HTML is how an email breaks in Outlook, and
a block can be rendered correctly once and reused. Blocks:

- `hero`: full width image, headline, sub line.
- `heading`: a section heading with an optional small label above it.
- `text`: paragraphs. Blank lines split paragraphs; `**bold**` and
  `[label](https://...)` links are the only inline syntax.
- `image`: a picture with alt text and an optional caption and link.
- `feature`: image beside text, stacking on a phone (the hybrid two column,
  done with `display:inline-block` cells plus an MSO conditional table).
- `film`: a Vimeo reel from the portfolio: poster, title, play button.
- `button`: a pill, filled or outlined, centered.
- `quote`: a testimonial with an attribution.
- `divider` and `spacer`.

The header (wordmark) and footer (address, why you are getting this,
unsubscribe, view in browser) are fixed and never editable, because that is
where compliance lives.

Layout: on a desktop the block list sits left and a live preview right,
sticky; on a phone they are two tabs. The preview is a sandboxed iframe with
the real rendered HTML, switchable between 375px and 600px, plus a plain text
view. Drafts autosave with a visible state. Images come from a picker of the
site's own photographs (served through the image optimizer at 1200px), the
portfolio's Vimeo posters, or any pasted https URL.

Sending: "Send me a test" goes to the signed in address (or the business
address on a password session). "Review and send" runs a preflight (subject
present, at least one block, every image has alt text, HTML under 90KB, no en
or em dashes, links absolute, list not empty, Resend key present) and shows
the recipient count before the confirm. The page after sending shows sent,
failed and remaining counts, the pause reason if any, and a Resume button.

## Data flow

Editor state (client) -> `saveCampaignAction` (debounced) -> JSONB blocks.
Preview: the client renders nothing itself; it asks `previewCampaignAction`
for the HTML so the preview and the send can never disagree.
Send: `sendCampaignAction` -> `queueDeliveries` -> `processCampaign` ->
`resend.batch.send` x N -> deliveries updated -> campaign status.
Unsubscribe: link in the footer -> `/newsletter/unsubscribe/[token]` (GET
shows a confirmation page with a button, POST from the page or a one click
POST from the mail client flips the status).

## Error handling

- Resend's `{error}` is checked on every call, never assumed.
- A `daily_quota_exceeded` or `monthly_quota_exceeded` pauses the campaign
  with the reason on the page; anything else marks that batch failed and
  carries on.
- 429 backs off and retries once.
- A missing key, an unverified domain, or an empty list are reported before
  the confirm, not after.
- The webhook rejects a bad signature with 401 and a stale timestamp (more
  than five minutes) with 400.

## Testing

Unit tests, no database: the renderer against every rule in
`tests/email.test.mjs` plus newsletter specific ones (unsubscribe link and
headers present, personalization filled and fallen back, blocks escaped,
hybrid columns carry an MSO conditional); the import parser on the shapes a
pasted list takes; the preflight; the Svix verifier. Then a Playwright pass
over the editor at phone and desktop widths against a local server.

## Owner steps this cannot do

Verify `pgcreativeswi.com` in Resend (needs a free domain slot on the shared
account, then DNS at the registrar), set `RESEND_WEBHOOK_SECRET` after adding
the webhook in Resend, and supply a postal address for the footer
(`NEWSLETTER_POSTAL_ADDRESS`), which CAN-SPAM requires. The page says all of
this in plain words.

## Round two, 2026-09-16

The owner's brief: "fully improve all of the features and the design",
"super easy to use", monthly emails to real estate agents "showing any new
news, any cool houses that were shot that month, along with a call to
action to book a shoot", easy from scratch or from "really nice looking
templates with custom designs, custom backgrounds".

What changed, and why:

- **Templates.** Five complete emails in `templates.ts` (the month in
  review, one listing told properly, something new, tips for sellers, a
  quick note), each with real copy and real pictures, chosen from
  `/admin/newsletter/new` where every card is the real render at a third
  of its size. A blank start sits beside them. The chooser and the list page
  both draw thumbnails with the sending renderer, so a card is never a
  drawing of an email.
- **Looks and tones.** A draft carries a theme (`night`, the site; `steel`,
  deep navy; `paper`, cool white with navy type) and most blocks carry a
  tone (on the ground, on a raised panel, on the brand blue). That is the
  "custom backgrounds" ask done the only way email survives: solid colors
  stated on every element, never a background image behind body text.
  The one photo-behind-words is the overlay opening, done as a bulletproof
  background with a VML twin for Outlook and a dark wash behind the words.
- **New blocks** for the monthly job: a photo grid (two or three across,
  every frame cropped to the same box, two-up on a phone), three numbers,
  a numbered or bulleted list, a signed note with a headshot, and a
  Book a shoot block that carries the heading, the line, the button and
  the phone numbers together on a panel.
- **The owner's own photos.** An upload shelf in the picker
  (`/api/newsletter/upload`, up to 12 at a time, phone photos rotated,
  shrunk to 1600 and re-encoded before they are stored in
  `newsletter_media`). Everything a sent email shows goes through
  `/media/...?w=&h=`, which crops and resizes with sharp and is cached at
  the edge for a year, so a 400KB master is a 90KB frame in the inbox and
  the grid is six identical boxes whatever was uploaded. Stored in Neon
  rather than an object store on purpose: thirty photos a month at 300KB
  is nothing, and it is one fewer account, key and bill.
- **Editor.** Drag to reorder (with the arrows kept for touch), a ring in
  the preview around the block being edited, a sticky Write/Preview switch
  on a phone, the block palette grouped by job, and the preview loading
  pictures from the dashboard's own server so an upload from a second ago
  shows.

Traps met: Chrome cancels a drag whose source element re-renders during
`dragstart`, so the drag index lives in a ref and the dimming state is set
a tick later. A stale Turbopack bundle produced a hydration mismatch and
404s for a poster URL that no longer existed in the source; `rm -rf .next`
was the fix, not code.
