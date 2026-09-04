# PG Creatives design review, 2026-09-04

Full pass over every public route at 1536, 1440, 1280, 1024, 900, 768, 640,
430, 390, 360 and 320 px against a production build of `main` (2ff169c), plus
a measurement harness for authored heading lines, logo size, tile size and
viewport overflow. Research inputs: 2026 trend reporting (scroll-driven
animation, oversized type, dark-first luxury, bento grids, "motion that
reinforces the narrative"), Awwwards photo/video studio winners (ERA
Residence, Revelatio Studio, Il Capo Production), and the UI/UX guideline
database (touch targets, one or two animated elements per view, ease-out
entrances, reduced motion).

The system underneath is sound: one ground, three surfaces, the two-value
accent, Poppins throughout, the glass header, the viewfinder ticks. What is
wrong is execution detail, and it is wrong in the same few ways on every page.

## Findings

### Broken on every page

1. **Authored heading lines wrap.** `DisplayLines` masks each authored line
   in its own block so it can rise on its own. At 1440 the `display-1` h1 is
   100px and sits in a 625px column (1.1fr of the page-head grid), so every
   page h1 breaks its two authored lines into three or four ragged ones:
   "Every / listing, / in its / best light.", "Let's make / something /
   together.", "The / creatives / behind the / scenes." Measured unwrapped
   widths run 626 to 1017px. The same happens to `display-2` headings in
   `max-w-xl`/`max-w-2xl` boxes ("Three ways we put your" is 703px in 672px;
   "includes the whole process." is 822px in 576px) and at 768 where the
   heading shares a row with a lede.
2. **The logo is invisible.** `logo.png` is a 366x400 canvas whose artwork
   occupies 186x151; rendered at 66x72 the mark is about 33px wide. The
   footer's `pg-logo.png` is a 400x333 canvas around a 366x77 wordmark, so
   the footer wordmark renders 70px wide. The brand is the smallest thing on
   every page.
3. **Leftover rhythm.** `mt-8` on section headings and `mt-12`/`mt-14` on
   grids were spacing for the `RuleHead` rule that was deleted. They now add
   uneven gaps above headings and between sections.
4. **Entrance motion is inconsistent.** Eight reveal variants are in use and
   grids alternate `depth-left`/`depth-right`, so neighbouring tiles fly in
   from opposite angles. Read against the research: too many moving parts
   per view, and it reads as generated rather than directed.

### Page-specific

5. **Home, packages.** The "Package pricing scales with square footage..."
   note is a child of the three-column grid, so on desktop it is squeezed
   into the first column under PG Core.
6. **Home, selected work on tablets.** The bento is four columns from 640px,
   so at 768 the four small tiles are 168x126 and at 640 they are 138x104:
   listing photography at contact-sheet size, the exact thing the previous
   pass fixed on phones.
7. **Home, hero.** The scrim runs 0.62 to 0.97 over the video, so the loop
   is barely visible and the fold reads as white type on black. For a media
   company the footage should carry the fold.
8. **Footer.** The email is `break-all` and splits as "gmail.c / om" at
   1440 and 1024. Columns are `1.3fr 0.7fr 1fr 1fr`, so the contact column
   is the narrowest thing holding the longest strings. A lone "Wisconsin"
   sits in the bottom bar as filler.
9. **Orphan tiles.** Program gallery: 9 reels in 4 columns leaves one alone
   on the last row. Team: 10 people in 4 columns leaves two. Portfolio
   films: 15 in 4 columns leaves three.
10. **404 and error pages** still use the pre-refresh purple gradient
    button, `text-white/60` copy and no display type.
11. **Tablet header.** The desktop nav pill appears from 768px and at that
    width it is almost the full viewport, crowding the logo.
12. **Mobile performance.** `.tilt { will-change: transform }` is
    unconditional, so a phone composites a layer for every one of the 49
    portfolio tiles for a pointer effect that never runs there.

### Verified fine

No horizontal overflow at any width. Zero JS errors beyond the expected
`/api/track` 403 on a non-3000 port. Focus rings, tap targets, reduced
motion, the FAQ, the form and the modal all behave.

## Design

Signature stays what it is: the viewfinder frame, the glass capsule, the
bokeh depth, Poppins. The work below spends its effort on making those read
cleanly, and adds one photographic move.

### 1. Type that holds its lines

- **`PageHead`** (new). The h1 takes the full shell width so its authored
  lines never wrap above 640px; the lede sits under it in the right column of
  a `lg:grid-cols-[1fr_1fr]` row, with an optional meta slot in the left
  column (portfolio's "15 films / 34 stills"). Same component on portfolio,
  services, program, team and contact.
- **`SectionHead`** (new). Heading left, lede or utility link right, on a
  `lg:grid-cols-[1.5fr_1fr]` grid with `items-end`. Replaces the ad hoc
  `mt-8` heading + `max-w-*` combinations on home and the program page.
  The two centered section heads on home (selected work, book) become
  left-aligned like the rest; the work head gains a "See all work" link and
  the book head a lede about the two markets.
- Re-author the tiers heading as three lines so each fits its column.
- `mt-8`/`mt-12`/`mt-14` leftovers go; heading to content is `mt-12` on
  phones and `mt-16` from `sm`.

### 2. Brand presence

- `public/wordmark.png` (366x77, trimmed) in the header at 26px tall on
  desktop and 22px on phones, replacing the mark. `public/logo-mark.png`
  (186x151, trimmed) for the splash. The footer wordmark at 36px.
- Desktop nav moves from `md` to `lg`; tablets get the hamburger.

### 3. The fold

- Scrim lightened so the footage reads: bottom stays dark for the buttons,
  the middle where the headline sits drops to about 0.45, and the radial
  vignette centers on the copy. Verified against the poster at every width.

### 4. Motion, directed

- One entrance grammar. Headings use `lines`; blocks use `rise`; cards use
  `depth` (rise toward the reader, no lateral rotation). `depth-left` and
  `depth-right` are removed from every grid.
- **Scroll-linked image drift** (the one new move). Inside every framed
  photograph on desktop the image travels a few percent as the frame crosses
  the viewport, on `animation-timeline: view()`, gated by `@supports`,
  `(min-width: 1024px)` and `prefers-reduced-motion: no-preference`. No
  JavaScript, compositor-driven, and it is the kind of motion the research
  favors: it answers the scroll rather than running on its own.
- `will-change` on `.tilt` moves inside the `(pointer: fine)` rule.

### 5. Layout fixes

- Home bento: two columns from `sm` (hero tile full width at 16:10, then a
  2x2 of 4:3 tiles), four columns from `lg`.
- Packages note moves out of the grid, full width under the cards.
- Program gallery `lg:grid-cols-3`; team `lg:grid-cols-5`; portfolio films
  `lg:grid-cols-5`. No orphans in the unfiltered views.
- Footer: `lg:grid-cols-[1.2fr_0.7fr_1.3fr_1fr]`, `overflow-wrap: anywhere`
  on the email with a break opportunity after the `@`, "Wisconsin" removed.
- 404 and error pages rebuilt on `display-1`, `lede`, `btn btn-primary`.

### Out of scope, flagged to the owner

- The only commercial photograph is a surgical suite. It is honest, but it
  is the coldest image on the site and it sits on the home page. A facility
  or hospitality frame would sell "Commercial" better.
- The splash screen is a 1.6s black card on every home visit. It is a brand
  moment the owner chose; kept as is.
- Vimeo poster frames are whatever Vimeo picked; a few reels show a title
  card mid-word.

## Verification

- `next build` and `eslint src` clean.
- Line-width harness: zero overflowing authored lines at 768 and above.
- Screenshot sweep of all routes at the eleven widths, compared with the
  before set.
- axe: zero violations across routes at 1440 and 390.
- Motion harness: nothing hidden after scroll, no-JS renders visible,
  reduced motion renders visible.
