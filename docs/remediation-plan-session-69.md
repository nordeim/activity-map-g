# Remediation Plan — Session 69 (v2.30)

Fresh cycle against the operator's redeployed v2.29 mirror (`docs/start_server_log.txt`:
the fresh build + re-seeded db from the `9fc77eb` tree) + the operator's
`docs/session_69.md` (the session-68 transcript archive).

## The audit (both sites, agent-browser; repo session 70)

Baseline gates on the untouched v2.29 tree: lint 0 errors · typecheck ✓ ·
117/117 unit · build ✓ · 31/31 smoke · 114/114 E2E. The mirror verified
RUNNING v2.29 (the white map frame [32,487,1216,622] with the 1214×620 canvas,
the "0 events · 9 places" chip, the 48px mobile search pill with the 44px
input — all v2.29 signatures live on the deploy).

The MOBILE NAVIGATION MENU (the task's focus) verified EXACT at 390 on BOTH
sites — the tab-bar fixed at the viewport top (0, 0, 390, 52), the glass
`rgba(248,247,244,0.62)` + `blur(24px) saturate(1.5)`, the links
x=16/121/192/222/259/304/330/356 at y=4 (44px anchors, 12px Inter at −0.12px,
active 700 / inactive 500 — the live carries the metrics on child spans, the
mirror on the anchors; computed text metrics identical), and the
Map/Favourites/Profile icon taps green on both — NO Tailwind v4 regression.
The identity's TWELFTH measurement held "sepnetflix2023" + the email subtitle
on both. Zero console errors across the mirror's 9 pages. Every other
re-measured surface held: the home h1 115.2px, the hearts 36×36, the hero
planner card [366,456,548,56] exact (glass/blur/pad/border — BOTH sites now
input-less), the place detail 82px h1 + 34px about, the stay cards 392×392,
the chips 38px/12px/600 identical sets, the favourites surfaces.

**FIVE findings:**

### F1 — the live's PENDING pill text is LLM-generated too (docs-only)

The session-68 conclusion "the pending template is deterministic" was subtly
wrong: the live's pending pill VARIES per query — "brass" → "Searching for
brass related listings in Augsburg." (space + listings) while "castle" and
"unicorn" → "Searching for castle-related options in Augsburg." (hyphen +
options). The pinned clone template ("{query}-related options") matches the
live's DOMINANT variant. **No code change — a documentation correction**
(the divergence note gains the pending-text variation).

### F2 — the live's search-RESOLVED zero state is a WHITE CARD (MEDIUM)

When the live's async search RESOLVES with zero results (castle, run 1), the
list's empty state becomes a WHITE CARD: `rounded-[28px] bg-white py-14
text-center` (box [32,1370,1216,166] desktop) containing **"No places found"**
at 20px Libre Baskerville ink `#0E0E0E` (lh 28, text-xl). The plain
`py-10 text-center text-sm text-muted` "No places" p renders only while the
search is PENDING (castle run 2 held it 28s+). Deterministic equivalent: a
SUBMITTED query + 0 visible places → the white card; the pill-only zero (no
submitted query) keeps the plain p.

### F3 — the browse planner's search-pill cluster (REAL BUG + drift, HIGH)

On /eat + /stay + /do at desktop (the same shared `BrowsePlanner`):

1. **The search pill collapses to 20px at md+ (a real bug — the F5 trap
   family, desktop edition)**: the pill carries `h-[54px] md:h-auto` — at
   md+ the auto height collapses to the input's 20px content floor, rendering
   [39,340,807,20] with a 20px input, vertically centered in the row. The
   live's pill: `min-h-[54px]` → [39,323,720,54] with a 44px input at EVERY
   breakpoint. No E2E pin covered the browse pill's height (the session-8
   pin asserted the CARD, 68px — the collapse hid under it).
2. **Pill chrome drift**: the live's pill is `rounded-full` at md (computed
   9999px; 22px at mobile — their own CSS caps it), `border border-black/5`,
   `px-5`, `shadow-[inset_0_1px_0_rgba(255,255,255,0.70)]`, with the hover
   set (`hover:-translate-y-0.5 hover:border-[#571AFF]/30 hover:bg-[#F8F7F4]
   hover:shadow-[0_8px_20px_rgba(14,14,14,0.08),inset_0_1px_0_rgba(255,255,255,0.85)]`).
   The mirror: `rounded-[22px]` everywhere, no border, px-4, no inset shadow.
3. **Row structure**: the live wraps [date, people] in ONE
   `relative z-50 flex flex-col gap-2 sm:flex-row` block (354px at desktop)
   so the search pill lands at 720px wide; the mirror renders them as
   separate children (167 + 95) so the pill is 807px. The row gaps are 12px
   (gap-3) on the live vs 8px (md:gap-2) on the mirror.
4. **Control chrome**: the live's date pill is `min-h-[54px] min-w-[238px]
   rounded-full border border-black/5 bg-[#F8F7F4]/55 px-5 py-2
   shadow-[inset...]` (238px at desktop) and the people control
   `relative flex min-h-[54px] min-w-[108px] cursor-pointer flex-col
   justify-center rounded-full border ...` (108px); the mirror renders 167px
   and 95px rounded-22 pills without borders. At mobile all three controls
   measure radius 22 + full-width on the live (computed) — the mirror's
   mobile model already matches there.
5. The icon row: the live's `flex shrink-0 items-center gap-2` (8px gap,
   104px block at desktop); the mirror's gap-3 (12px, 108px block).

### F4 — the live's place URLs became ObjectIds (documented divergence)

The live's browse cards now link `/place/6a53554b67474954f64e3cd6`-style
MongoDB ObjectIds (slug URLs 404 — "Place not found" for /place/courtyard-stay
on the live). The place-detail DESIGN is unchanged (82px h1 + 34px about
verified on an ObjectId URL). The clone keeps readable slugs — a deliberate
divergence: slug URLs are stable, human-readable, and load-bearing for the
home-only/map-demo deep links and the E2E corpus. **Documented divergence,
no code change.**

### F5 — the browse card ORDER drifted within rating ties (LOW)

The live's entity order changed since the seed capture. The SETS are
identical everywhere (12 eat / 12 stay / 18 do) and both sites render
rating-descending, but the tie order differs: e.g. /stay live [Brass &
Marble, Cloud Nine, Garden Suite] vs mirror [Garden Suite, Cloud Nine, Brass
& Marble]; /eat live [Design Wine Bar, Fire Kitchen, Modern Bavarian] vs
mirror [Modern Bavarian, Fire Kitchen, Design Wine Bar]; /do differs in the
first 9. Fix: reorder `prisma/data/{eat,stay,do}.json` to the live's current
display sequences (the seed assigns sortOrder by file index; the browses
order by sortOrder).

## The TDD remediation

- **R0 RED** — new E2E pins verified failing on the untouched v2.29 tree:
  - F2: the search-resolved zero state renders the white "No places found"
    card (the rounded-28 white card + the 20px serif ink text) while the
    plain-p branch stays for the no-query zero.
  - F3a: the browse search pill is 54px tall at DESKTOP with the 44px input
    (the min-h fix — fails now at 20px).
  - F3b: the browse pill chrome at desktop — the full radius, the 1px
    black/5 border, the inset highlight shadow.
  - F3c: the desktop row geometry — the pill ≈720px wide, the date pill
    238px, the people 108px, the 12px row gaps (the combined block).
  - F3d: the date pill carries the live's full-round chrome at desktop
    (radius > 1000 + the black/5 border).
  - F5: the first browse card per category matches the live's sequence
    (eat → Design Wine Bar, stay → Brass & Marble, do → Historic Sight).
- **R1 GREEN**:
  - `src/components/map/MapExplorer.tsx` — F2: the empty branch renders the
    live's white card `rounded-[28px] bg-white py-14 text-center` with
    "No places found" (`text-xl font-serif text-ink`) when a query is
    submitted; the plain p remains the no-query fallback.
  - `src/components/planner/BrowsePlanner.tsx` — F3: the card becomes the
    live's row (`flex flex-col gap-3 md:flex-row md:flex-nowrap
    md:items-center md:justify-between md:gap-3`), the search pill gets
    `min-h-[54px] min-w-0 flex-1` + `rounded-[22px] md:rounded-full` +
    `border border-black/5` + `px-5` + the inset shadow + the hover set +
    the input `h-11`; the date + people controls wrap in ONE
    `relative z-50 flex flex-col gap-2 sm:flex-row` block with the live's
    pill chrome (date: `min-h-[54px] min-w-[238px] rounded-full border
    border-black/5 px-5 py-2` + inset shadow + hover; people:
    `min-w-[108px] flex-col justify-center` same chrome); the icon row
    `gap-2` + `shrink-0`.
  - `prisma/data/{eat,stay,do}.json` — F5: reorder to the live's display
    sequences; re-seed.
- **R2** — dev-server probes: the browse pill [39,323,720,54] + input 44;
  the row gaps 12; the date 238 / people 108 / icons 104; the mobile card
  [16,265,358,270] with the 54px pills + 8px gap-2 inside the combined
  block; the /map zero card [32,1370,1216,166]-equivalent geometry; the
  browse first-card order.
- **R3** — the 21-screenshot suite re-captured
  (`scripts/capture-screens-session70.mjs`).
- **R4** — docs: README (the counts + the browse-pill/empty-card/order
  contracts + the ObjectId divergence note), AGENTS (the counts + the
  planner contract), CLAUDE (the counts), PAD (the v2.30 revision), SKILL
  (1.30.0 + the flex/auto-height trap), the findings addendum, this log,
  the worklog. `.env.example` re-verified unchanged.

## Traps to carry

- `h-[54px] md:h-auto` is the desktop twin of session-68's F5: an auto
  height in a flex row collapses to the content floor (the 20px input).
  Pin heights with `min-h-[54px]` (the live's own idiom) or content, never
  `md:h-auto` on a pill whose input has no height.
- The live's own CSS overrides its class strings (its pill classes say
  `rounded-full` but compute 22px at mobile; its card says `p-1.5` but
  computes 10px at mobile) — measure COMPUTED values, not class strings.
- The live's /map search pending text varies per query (LLM) — pin only
  the dominant template, and document the variation.
- The live's zero state has TWO presentations (pending → plain p; resolved
  → white card) — the clone's deterministic equivalent keys on
  query-submitted.
- The live's place URLs are ObjectIds now — slug parity is a documented
  divergence (the E2E corpus + home/map deep links depend on slugs).
