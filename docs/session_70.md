# Session 70 — the v2.30 remediation (the browse pill + the zero state + the card order)

Fresh cycle against the operator's redeployed v2.29 mirror + the operator's
new material: `docs/session_69.md` (the session-68 transcript archive) and
the redeploy's `docs/start_server_log.txt` (the fresh build + re-seeded db
from the `9fc77eb` tree — the mirror verified running v2.29 from the live
DOM: the white map frame, the events chip, the 48px mobile search pill).
This file is the engineering log; the worklog entry carries the condensed
record.

## Refresh + baseline

- Pulled to `5b76b02` (the operator's commits: the transcript archive +
  the redeploy's start-server log). Root docs + session_68/69 +
  remediation-plan-67 + the worklog + the server log re-read; `.env`
  content-wise == `.env.example` (DATABASE_URL=file:../db/custom.db, db/
  at root, 118784B seeded — matching the operator's deploy).
- Baseline gates on the untouched tree: lint 0 errors · typecheck ✓ ·
  117/117 unit · build ✓ · 31/31 smoke · 114/114 E2E.

## The dual-site audit

The MOBILE NAVIGATION MENU (the task's focus) verified EXACT at 390 on BOTH
sites — the tab-bar fixed at the viewport top (0, 0, 390, 52), the glass
`rgba(248,247,244,0.62)` + `blur(24px) saturate(1.5)`, the links
x=16/121/192/222/259/304/330/356 at y=4 (every anchor 44px tall; the live
carries the 12px Inter −0.12px/700-active/500-inactive metrics on child
spans, the mirror on the anchors — computed text metrics identical), and
the Map/Favourites/Profile icon taps green on both — NO Tailwind v4
regression. The identity's TWELFTH measurement held "sepnetflix2023" + the
email subtitle. Zero console errors across the mirror's 9 pages. Every
other re-measured surface held: the home h1 115.2px, the hearts 36×36, the
hero planner card [366,456,548,56] exact (both sites input-less), the
place detail 82px h1 + 34px about, the stay cards 392×392, the chips
38px/12px/600, the favourites surfaces, the /map v2.29 contract in full.

FIVE findings — `docs/remediation-plan-session-69.md`:

### F1 — the live's PENDING pill text is LLM-generated too (docs-only)

"brass" → "Searching for brass related listings in Augsburg." while
"castle" and "unicorn" → "Searching for castle-related options in
Augsburg." — the session-68 "deterministic pending template" conclusion
was subtly wrong; the text varies per query within the family. The clone's
pinned "{query}-related options in Augsburg." matches the dominant
variant. Documentation correction only.

### F2 — the search-RESOLVED zero state is a WHITE CARD

When the live's async search resolves with zero results (the first
"castle" run), the list's empty state becomes `rounded-[28px] bg-white
py-14 text-center` ([32,1370,1216,166]) carrying "No places found" at
20px Libre Baskerville ink; the plain muted "No places" p renders only
while pending/no-query (the second castle run held it 28s+). The clone's
deterministic equivalent: a submitted query + 0 visible → the white card;
the plain p stays the no-query zero.

### F3 — the browse search-pill cluster (REAL BUG + drift)

The mirror's /eat|/stay|/do search pill collapsed to **20px at desktop**
(`h-[54px] md:h-auto` — the auto height resolves to the input's content
floor; the live is `min-h-[54px]` → [39,323,720,54] with a 44px input at
every breakpoint). No E2E pin covered the browse pill's height (the
session-8 pin asserted the 68px CARD — the collapse hid under it). With
it: the pill chrome drift (the live's 1px black/5 hairline, px-5, the
inset white highlight, rounded-full at md / 22px at mobile — computed,
the hover set), the row structure (the live's [date, people] in ONE
`relative z-50 flex flex-col gap-2 sm:flex-row` block → the pill 720px vs
the clone's 807px), the control widths (date min-w-238 vs 167; people
min-w-108 vs 95), the 12px row gaps (the clone had 8), and the stacked
left-aligned date/people content.

### F4 — the live's place URLs became ObjectIds (documented divergence)

The live's cards link `/place/6a53554b67474954f64e3cd6`-style MongoDB
ObjectIds (slug URLs 404 upstream); the place-detail DESIGN is unchanged
(82px h1 + 34px about verified on an ObjectId URL). The clone keeps
readable slugs — deliberate, load-bearing for the home-only/map-demo deep
links and the E2E corpus.

### F5 — the browse card ORDER drifted within rating ties

The SETS identical everywhere (12/12/18), both sites rating-descending,
but the tie order differs (e.g. /stay live [Brass & Marble, Cloud Nine,
Garden Suite] vs clone [Garden Suite, Cloud Nine, Brass & Marble]). The
seed re-ordered to the live's sequences
(`scripts/reorder-seed-session70.py` — a pure reorder, the record sets
byte-identical).

## The TDD remediation

- **R0 RED** — 5 pins verified failing on the untouched tree: the 54px
  pill + 44px input (failed at 20), the pill chrome (the radius/border/
  inset — the oklab border-color assertion gotcha hit again, fixed by
  asserting the alpha), the row geometry (the pill 720, date 238, people
  108, the 12px gaps, the 8px inner block gap), the white zero card, and
  the first-card order per category.
- **R1 GREEN**: `MapExplorer.tsx` — the empty branch renders the live's
  white card (`rounded-[28px] bg-white py-14 text-center` + "No places
  found" `font-serif text-xl text-ink`) when a query is submitted. 
  `BrowsePlanner.tsx` — the card becomes the live's row (`flex flex-col
  gap-3 md:flex-row md:flex-nowrap md:items-center md:justify-between`),
  the search pill `min-h-[54px] min-w-0 flex-1` + the shared
  `livePillChrome` (the hairline + px-5 + the inset highlight + the hover
  set + `rounded-[22px] md:rounded-full`, NO vertical padding on the
  search pill — py-2 only on the date/people pills, the live's own
  distinction) + the input `h-11`; the combined `relative z-50` block
  with the date pill `min-w-[238px]` and the people `min-w-[108px]` as
  stacked-label pills; the icon row `gap-2 shrink-0`.
  `prisma/data/{eat,stay,do}.json` re-ordered; re-seeded.
- **En-route fixes**: the search pill's py-2 made it 62px (the live's
  search pill has NO vertical padding — only the date/people do) and the
  oklab border-color assertion (assert the alpha, not the string).
- **R2 verified** — the desktop row PIXEL-EXACT vs the live: the pill
  [39,323,720,54], the block [771,323,354,54], the date [771,323,238,54],
  the people [1017,323,108,54], the input 44; the mobile gaps exact
  (12/12/8); the zero card (rounded-28 + py-14 + 20px LB ink); the
  first cards (Design Wine Bar / Brass & Marble / Historic Sight); zero
  console errors.
- **R3** — 22 screenshots re-captured
  (`scripts/capture-screens-session70.mjs` — the NEW 22nd capture: the
  search-resolved zero state's white card). Docs aligned to v2.30:
  README, AGENTS, CLAUDE, PAD, SKILL (1.30.0 + the B11 trap), the
  findings addendum, this log, the worklog. `.env.example` verified
  unchanged.
- **R4** — the full gate: lint 0 errors · typecheck ✓ · 117/117 unit ·
  build ✓ · 31/31 smoke · **119/119 E2E** (114 + 5 new tests).

## Traps recorded

- **`h-[54px] md:h-auto` is the desktop twin of session-68's F5**: an
  auto height in a flex row resolves to the content floor (the 20px
  input) — mobile-only probes never see it, and CARD-level pins hide it.
  Pin pill heights with `min-h-[54px]` + the content's own height (the
  input's `h-11`).
- **The live's own CSS overrides its class strings**: its pill classes
  say `rounded-full` but compute 22px at mobile; its card says `p-1.5`
  but computes 10px at mobile. Measure COMPUTED values, not classes.
- **The live's search pill has NO vertical padding** (min-h carries the
  height); only the date/people pills carry py-2 — a shared chrome
  constant with `py-2` makes the search pill 62px.
- **The live's zero state is TWO-presentation** (pending → the plain
  muted line; resolved → the white card): the deterministic clone keys
  the card on the submitted query.
- **The live's pending pill text is LLM-generated per query** — pin only
  the dominant family, and document the variation.
- **ObjectId place URLs upstream** — slugs are a documented divergence.
- The browse card ORDER: the seed's file order IS the display order
  (sortOrder by index) — reordering the JSON reorders the grids.
