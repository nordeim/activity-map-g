# Remediation Plan — Session 71 (v2.31)

Fresh cycle against the operator's redeployed v2.30 mirror
(`docs/start_server_log.txt`: the fresh build + re-seeded db from the
`ccd5d02` tree, dated Oct 2 08:04) + the operator's `docs/session_71.md`
(the session-70 transcript archive).

## The audit (both sites, agent-browser; repo session 72)

Baseline gates on the untouched v2.30 tree: lint 0 errors · typecheck ✓ ·
117/117 unit · build ✓ · 31/31 smoke · 119/119 E2E. The mirror verified
RUNNING v2.30 from the live DOM (the browse pill [39,·,720,54] with the
full radius + 1px border, the v2.30 seed orders — Rose Circuit / Brass
& Marble / Fuggerei Twilight Walk first cards, the keyed
light_nolabels z15 /map tiles).

The MOBILE NAVIGATION MENU (the task's focus) verified EXACT at 390 on
BOTH sites — the tab-bar fixed at the viewport top (0, 0, 390, 52), the
glass `rgba(248,247,244,0.62)` + `blur(24px) saturate(1.5)`, the links
x=16/121/192/222/259/304/330/356 at y=4 (every anchor 44px tall), and
the Map/Favourites/Profile icon taps green on both — NO Tailwind v4
regression (the 14th consecutive verification). The identity's THIRTEENTH
measurement held "sepnetflix2023" + the email subtitle. Zero console
errors across the mirror's swept pages. Every other re-measured surface
held: the home h1 115.2px + the input-less hero planner on both, the
category-fan wrapper matrix(1.15), the hearts 36×36, the route's 25
light_nolabels z14 tiles (ours keyed 50/50 — the live remains keyless
upstream), the /eat chips 38px/12px/600/pad-10-16, the browse card
orders + ObjectId URLs stable, the /map pill 48 + canvas 1214×620
desktop / 356×310 mobile + the zero-card, the place detail 82px h1 +
34px About, the desktop nav x=433/559/639/727/805, the login chrome
(system-font h1, r-16 card, white body, renders authenticated), the
favourites h1 50.7px, the chrome-less profile, and the footer growth —
the mirror renders 646×118 IDENTICAL to the live at true max scroll
(an earlier 638×117 reading was a scroll-clamping artifact of
`scrollTo(0, body.scrollHeight)` undershooting ~22px; probe with
`document.documentElement.scrollHeight`).

**TWO findings:**

### F1 — the live's PENDING pill text evolved a THIRD variant (docs-only)

"brass" → "Searching for brass related items in Augsburg" (space +
"items", no trailing period captured) — after "related listings"
(session 70) and "-related options" (session 68). Confirms (for the
third time) the pending text is LLM-generated per query. The clone's
pinned "{query}-related options in Augsburg." stays (the dominant
family). **No code change — the divergence note gains the third
variant** (the findings register + the core docs' caveat sentences).

### F2 — the search-input internals (typed-text weight + height model, LOW)

The live's browse + map search inputs (measured on both /eat and /map,
both breakpoints):

1. **The typed-text font weight is 400** — the live's input class is
   `min-w-0 flex-1 bg-transparent font-inter text-sm outline-none` (no
   font-medium; `::placeholder` separately computes 500 + black/40 —
   placeholder styling is an override, typed text is 400). The clone's
   inputs carry `font-medium` (500) — the typed text renders one weight
   heavier than the live on BOTH the browse pill and the /map search
   row. The placeholder itself already matches (black/40 + 500).
2. **The desktop input height is CONTENT-DRIVEN (~20px)** — the live's
   input has NO height class at md+ (its 44px is a mobile-only computed
   style; class strings carry nothing). The clone's inputs carry `h-11`
   (44px) at EVERY breakpoint. Visually near-nil inside the min-h-54
   items-center pill / the h-12 map row (both centered), but the
   session-70 "the input carries h-11 (the live's 44px)" note
   over-generalized the MOBILE measurement to desktop — the live's
   desktop input measures 20px.
3. **The typed-text color is #141413** (the live's input inherits
   rgb(20,20,19); the clone sets text-ink #0E0E0E — a 6/6/6 RGB delta).

Fix: both inputs become `h-11 md:h-auto` (SAFE here — the pill's
`min-h-[54px]` and the map row's `h-12` carry the row heights, so the
B11 h-auto content-floor trap cannot fire; this is the live's own
model), drop `font-medium` → `placeholder:font-medium placeholder:text-black/40`
(keeps the placeholder at the live's 500 while the typed text drops to
400), align the class set to the live's (`min-w-0 flex-1` browse /
`flex-1` map, `font-inter`, `text-[#141413]`).

## The TDD remediation

- **R0 RED** — pins verified failing on the untouched v2.30 tree:
  - The browse pill test's DESKTOP input assertion flips from 44 to the
    content-driven model (~20px; the mobile 44 stays) + NEW pins: the
    input's computed font-weight 400 at both breakpoints, the
    ::placeholder weight 500, and the placeholder color alpha 0.4.
  - A NEW map pin: the /map search input's desktop height is
    content-driven (~20px, under the 48px row) + its typed-text weight
    400 (the mobile 44px pin at browse.spec:1570 stays green — `h-11`
    below md).
- **R1 GREEN**:
  - `src/components/planner/BrowsePlanner.tsx` — the search input:
    `h-11 md:h-auto min-w-0 flex-1 bg-transparent font-inter text-sm
    text-[#141413] outline-none placeholder:font-medium
    placeholder:text-black/40` (drop `w-full` + `font-medium` +
    `text-ink`; add the md:h-auto + the live's class set).
  - `src/components/map/MapExplorer.tsx` — the search input: the same
    treatment (`h-11 md:h-auto w-full min-w-0 flex-1 bg-transparent
    font-inter text-sm text-[#141413] outline-none
    placeholder:font-medium placeholder:text-black/40`).
- **R2** — dev-server probes: the browse pill [39,·,720,54] with the
  20px desktop input (44 at 390), the input weight 400 + placeholder
  500/black-40, the map row 48px with the 20px desktop input (44 at
  390); zero console errors.
- **R3** — the 22-screenshot suite re-captured
  (`scripts/capture-screens-session72.mjs`, from the session-70 script).
- **R4** — docs aligned to v2.31: README (the input contract + the
  counts), AGENTS (the planner contract), CLAUDE (the counts), PAD
  (v2.31), SKILL (1.31.0 + the B11-safe corollary: `md:h-auto` on an
  input is safe ONLY under a height-carrying row), the findings
  register (the third pending-text variant), docs/session_72.md, this
  worklog. `.env.example` re-verified unchanged.
- **R5** — the full gate: lint → typecheck → 117 unit → build →
  31 smoke → 119+ E2E. Secret scan of the staged diff before the
  commit; `.env` + `db/` ignored. Commit + push to main via the SSH
  wrapper.

## Traps to carry

- `scrollTo(0, document.body.scrollHeight)` undershoots max scroll by
  the body/documentElement height delta (~22px here) — probe growth
  states with `document.documentElement.scrollHeight`, or footer
  fractions read as p≈0.93 with the pill 8px short of grown.
- The live's mobile-only input heights come from CSS overrides, not
  class strings — its input class has NO height utility yet measures
  44 at 390 and 20 at 1280. Pin COMPUTED heights per breakpoint.
- `h-11 md:h-auto` is safe ONLY when the parent row carries its own
  height (min-h pill / h-12 row) — the B11 trap fires when the row's
  height depends on the input itself. Name the carrier when you write
  the class.
- The live's `::placeholder` styling is an override (500 + black/40)
  while its typed text is 400 — the two weights differ INTENTIONALLY;
  don't "fix" one to match the other.
- The live's pending pill text now has THREE observed variants
  ("related options" / "related listings" / "related items") — pin only
  the dominant family and document the variation.
