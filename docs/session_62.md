# Session 62 — the v2.26 remediation (the staggered-fanning stay grid + the responsive hearts)

Fresh cycle against the operator's redeployed v2.25 mirror. This file is the
engineering log; the worklog entry carries the condensed record.

## Refresh + baseline

- Pulled to `868826d` (the operator's `docs/session_61.md` — the session-60
  narrative — + the redeploy's `start_server_log.txt`: a fresh `rm -rf
  .next/ db/`, install, db:push, db:seed, build, `next start` from the v2.25
  tree).
- Root docs + session_60/61 + remediation-plan-59/61 + worklog +
  start_server_log re-read; the v2.25 range (2bc4a45..dc28579)
  re-verified file-by-file (RecommendedRoute, CategoryCards, StayCard,
  BookingForm/BookingTimePicker, the spec flips).
- Baseline gates on the untouched tree: lint 0 errors · typecheck ✓ ·
  113/113 unit · build ✓ · 31/31 smoke · 94/94 E2E. `.env` ==
  `.env.example` (DATABASE_URL=file:../db/custom.db, db/ at root).

## The dual-site audit

The MOBILE NAVIGATION MENU (the task's focus) verified EXACT at 390 on both
sites: the tab-bar links x=121/192/222/259, the icons x=304/330/356, the
390×52 glass (bg rgba(248,247,244,0.62), blur(24px) saturate(1.5)), the
Heart/MapPin/User taps green — NO Tailwind v4 regression. The identity's
EIGHTH measurement held "sepnetflix2023"; the mirror's guest state reads
"Explorer" (by design). Also verified: the desktop nav (433/559/639/727/805,
heart 957, avatar 1001), the hero SHA-256-IDENTICAL (the VLM's
"composition" claim disproven by the hash), the Carto route (25 tiles + the
pan formula to the same decimals), the ±18° category fan, "Preferred
Check-In Time*", the badge-free home stays, and the restaurants band
heights (4140 both). The Carto tiles now return the provider's "API KEY
REQUIRED" watermark placeholder IDENTICALLY on both sites — an external
degradation (the shared public URLs), documented, not parity drift.

FIVE drift clusters (docs/remediation-plan-session-61.md):

- **F1 MAJOR — the home stays grid became a STAGGERED FANNING grid (md+)**:
  three column wrappers; the MIDDLE column rises with scroll (translateY →
  −0.2 × colHeight = −315.24px at 1576, linear ramp with the clamp easing
  in, reversible); the OUTER columns' cards fan `rotate(∓6°) +
  translateX(∓38px)` about `transform-origin: 0 100%` (bottom-LEFT for BOTH
  columns), each phased by its OWN viewport traversal
  `(vh − top)/(vh + height)` — the 399px row pitch staggers the phases so
  the top cards settle first. Settled forensics: col-1 card-0 rect [−78,
  341] w418; col-3 [836, 1255] w418; matrix ±0.104528 = ±6.000°. Phones
  compute `transform: none` at EVERY scroll.
- **F2 — the card hearts went RESPONSIVE**: 44×44 (h-11) below md, 36×36
  (w-9) from md, at (16,16) — measured on the home stay cards, the /stay
  AND /eat browse cards, and the place-detail hero (the session-24 36px pin
  was a desktop-only truth).
- **F3 — the showcase parallax is DESKTOP-ONLY**: the live's stay imgs +
  sights imgs compute `transform: none` at 390 at every scroll (the 118%
  fill is pure layout); the mirror ran the 1.16 zoom + the ty parallax at
  mobile too.
- **F4 — the mobile planner card**: rgba(255,255,255,0.94) (was /95) + the
  1px white INSET top highlight layered over the unchanged 0 16 34 drop.
- **F5 — the mobile tab-bar anchors render 44px full-height tap targets**
  (the same visual text position; 2.4× taller tap zones).
- **F8 — the card typography is variant-specific**: the HOME cards lh 1.5
  (h3 24/36 mob, 18/27 dsk; the meta 12/18.6 mob, 12/18 dsk); the /stay
  BROWSE cards keep leading-tight (30/22.5) + the 16px md meta.

## The TDD remediation

- **R0 RED** — 7 pins verified failing on the untouched tree: the fan
  engages-at-centered/settles-±6°/flat-at-390 trio, the heart 44/36, the
  parallax none-at-390, the line-heights, the planner 0.94+inset, and the
  44px tab-bar tap targets (plus the flipped session-24 browse heart pin —
  the live has since gone responsive).
- **R1 GREEN (F1)** — `StayShowcase.tsx` restructured: the ul is
  `relative` and renders three `li[data-fan-col]` column wrappers (mobile
  stacks them identically; md+ the 3 columns), each card wrapped in a
  `[data-fan-card]` div. The rAF-throttled fan driver applies the measured
  formulas — the middle li's translateY (−0.2 × colH × p, p the section
  traversal) and the outer wrappers' `translateX(∓38×prog) rotate(∓6×prog)`
  with origin `0 100%` — reading only TRANSFORM-IMMUNE geometry (the ul's
  own rect + the wrappers' offsetTop), so the transforms it just wrote can
  never feed back into the next frame's math. Below md it clears every
  transform.
- **R2 GREEN (F2+F3+F8)** — `SaveButton.tsx`: the responsive h-11/w-9
  chrome (every surface); `StayCard.tsx`: the home img's initial transform
  moved from the inline style to the md-gated arbitrary-property class
  `md:[transform:translateY(8%)_scale(1.16)]` (Tailwind v4's translate/
  scale utilities emit the INDIVIDUAL properties — the arbitrary form pins
  the composed `transform`); `useParallax.ts`: md-gated with stale-clear;
  the h3/p leading classes variant-specific (home: leading-normal +
  leading-[1.55]/md:leading-normal; browse: leading-tight + md:leading-4).
- **R3 GREEN (F4+F5)** — `TripPlanner.tsx`: bg-white/94 + the inset shadow
  layer; `Navbar.tsx`: the wordmark/text/icon anchors carry h-11 below md
  (the wordmark `h-11 md:h-8`, the text links `h-11 md:h-auto`, the icon
  links `h-11` — the x-geometry and the 52px bar unchanged, every existing
  pin still green).
- **R4** — numerically IDENTICAL to the live at matched content positions:
  the settled fan ty −315.34 vs the live's −315.24, every outer card
  ±6.000°, the col-1 card rect [−78, 418] exact; the centered engagement
  −158/−5.8 on BOTH sites; the heart 44/36 @(16,16); the sights-wrapper
  parallax ty +38 at desktop; the planner 0.94 + inset (computed
  `oklab(…/0.94)` + the exact rgba shadow list). The FOCUSED-CROP VLM
  comparison returned "visually identical" — the earlier full-page VLM "the
  clone's fan is absent" claims were DISPROVEN by the numbers (the two
  screenshots had framed different content windows — the documented
  VLM-misjudgment pattern; the mirror's home is ~430px taller above the
  grid, so scrollY ≠ matched content).
- **R5** — 20 screenshots re-captured
  (`scripts/capture-screens-session61.mjs`; the new
  20-home-stays-fan-settled capture walks the scroll to trigger every lazy
  load, then parks at the measured grid position — fixed scrolls are
  unreliable under the lazy-image layout shifts). `.env.example` verified
  matching. Docs aligned to v2.26: README (the screenshots paragraph, the
  vibe row, the counts, the history row), AGENTS (the counts, the showcase
  parallax + fan + heart contracts), CLAUDE (the counts + the suite
  descriptions), PAD (the v2.26 revision block), SKILL (1.26.0), the
  findings v2.26 addendum, this log, the worklog.
- **R6** — the full gate: lint 0 errors · typecheck ✓ · 113/113 unit ·
  build ✓ · 31/31 smoke · **100/100 E2E** (94 + 6 new pins).

## Traps recorded

- Rotation-inflated bounding rects: measuring hearts/images INSIDE fanned
  cards produces inflated sizes and skewed offsets (the 39px/49px heart and
  the 563px image artifacts) — measure at a rest scroll or via offsetTop.
- The VLM's full-page comparisons of scroll-linked states misjudge when
  the screenshots frame different content windows; match the GRID's
  viewport position (not scrollY), then verify with the DOM numbers — a
  focused crop of the region in question is the reliable visual check.
- Fixed-scroll screenshot captures are unreliable on lazy-image pages (the
  layout shifts while loading); walk the scroll first, then park at a
  measured position.
- The dev-server and the production layouts differ for the same reason —
  never reuse doc positions across environments.
- A "settled" scroll-linked state cannot SHOW the element (settled =
  scrolled past); the maximum visible engagement is the grid-top + ~400px
  state — that is what the 20 capture documents.
