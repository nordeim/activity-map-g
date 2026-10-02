# Session 72 — the v2.31 remediation (the search-input model)

Fresh cycle against the operator's redeployed v2.30 mirror + the
operator's new material: `docs/session_71.md` (the session-70 transcript
archive) and the redeploy's `docs/start_server_log.txt` (the fresh build
+ re-seeded db from the `ccd5d02` tree, dated Oct 2 08:04 — the mirror
verified running v2.30 from the live DOM: the browse pill
[39,·,720,54] with the full radius + the 1px border, the v2.30 seed
orders, the keyed light_nolabels z15 /map tiles).

## Refresh + baseline

- Cloned the workspace fresh (the sandbox had been reset), `.env` from
  `.env.example` with a generated AUTH_SECRET, `db:push` + `db:seed`
  (118784B — matching the operator's deploy exactly).
- Baseline gates on the untouched tree: lint 0 errors · typecheck ✓ ·
  117/117 unit · build ✓ · 31/31 smoke · 119/119 E2E.
- scandihaven reviewed for tech-stack patterns (Next.js 16 + React 19 +
  Tailwind v4 CSS-first + strict pre-ship gates — the same conventions
  this repo already follows; the `@theme` var-chain and content-scan
  notes re-checked against our globals.css).

## The dual-site audit

The MOBILE NAVIGATION MENU (the task's focus) verified EXACT at 390 on
BOTH sites — the tab-bar fixed at the viewport top (0, 0, 390, 52), the
glass `rgba(248,247,244,0.62)` + `blur(24px) saturate(1.5)`, the links
x=16/121/192/222/259/304/330/356 at y=4 (every anchor 44px tall), and
the Map/Favourites/Profile icon taps green on both — NO Tailwind v4
regression (the 14th consecutive verification). The identity's
THIRTEENTH measurement held "sepnetflix2023" + the email subtitle. Zero
console errors across the mirror's swept pages.

Every prior surface re-verified EXACT: the home h1 115.2px + the
input-less hero planner on both, the category-fan wrapper
matrix(1.15), the hearts 36×36, the route's 25 light_nolabels z14 tiles
(ours keyed 50/50 — the live remains keyless upstream), the /eat chips
38px/12px/600/pad-10-16, the browse card orders identical (no churn) +
the ObjectId URLs stable, the /map pill 48 + canvas 1214×620 desktop /
356×310 mobile + the chip + the zero card, the place detail 82px h1 +
34px About, the desktop nav x=433/559/639/727/805, the login chrome
(system-font h1, r-16 card, white body, renders authenticated), the
favourites h1 50.7px, the chrome-less profile — and the FOOTER GROWTH:
the mirror renders 646×118 IDENTICAL to the live at true max scroll
(an earlier 638×117 reading was a scroll-clamping artifact —
`scrollTo(0, document.body.scrollHeight)` undershoots by the
body/documentElement height delta ~22px; probe with
`document.documentElement.scrollHeight`; the live's clean multi-point
curve matched the linear footer-fraction model within ±3px at four
positions).

TWO findings — `docs/remediation-plan-session-71.md`:

### F1 — the live's PENDING pill text evolved a THIRD variant (docs-only)

"brass" → "Searching for brass related items in Augsburg" (space +
"items", no trailing period captured) — after "related listings"
(session 70) and "-related options" (session 68). The third confirmation
the pending text is LLM-generated per query. The clone's pinned
"{query}-related options in Augsburg." stays (the dominant family); the
divergence notes gain the third variant.

### F2 — the search-input model (typed-text weight + height model)

The live's browse + map search inputs (measured on both /eat and /map,
both breakpoints): the TYPED text renders at font-weight 400
(`min-w-0 flex-1 bg-transparent font-inter text-sm outline-none` — no
font-medium; the `::placeholder` separately computes 500 + black/40 —
an intentional override) in #141413, and the input height is 44px below
md (its mobile CSS — the class strings carry NO height utility) but
CONTENT-DRIVEN ~20px at md+ (inside the min-h-54 pill / the h-12 map
row). The clone's inputs carried `font-medium` (500) + `h-11` (44px) at
every breakpoint — the session-70 "44px input at every breakpoint" note
had over-generalized the MOBILE measurement to desktop.

## The TDD remediation

- **R0 RED** — pins verified failing on the untouched v2.30 tree: the
  browse input's computed model (desktop 16-24px vs our 44; weight 400
  vs our 500; the placeholder 500/black-40) and the NEW /map input
  model test (desktop ~20px + weight 400 under the 48px row). The
  session-68 mobile 48px/44px map pin stayed green throughout.
- **R1 GREEN**: both inputs became `h-11 md:h-auto` (SAFE — the pill's
  `min-h-[54px]` and the map row's `h-12` carry the row heights; the
  B11 trap cannot fire — the height carrier is the row, not the input)
  + the typed text at 400 in #141413 (dropped font-medium, added
  `placeholder:font-medium placeholder:text-black/40`, `font-inter`)
  + the live's class set (`min-w-0 flex-1` browse / `w-full min-w-0
  flex-1` map).
- **R2 verified 17/17 probe checks** (the probe first had two bugs of
  its own — reading the PILL's ::placeholder instead of the input's,
  and a color regex — fixed and re-run): the browse pill 54/720 with
  the 20px desktop input (44 at 390) + weight 400 + placeholder
  500/black-40 (oklab) + color #141413; the map row 48 with the 20px
  desktop input (44 at 390); zero console errors.
- **R3** — 22 screenshots re-captured
  (`scripts/capture-screens-session72.mjs`).
- **R4** — docs aligned to v2.31: README (the input contracts + the
  counts + the session row), AGENTS (the planner contract), CLAUDE (the
  counts + the pin list), PAD (v2.31 revision block + section), SKILL
  (1.31.0 + the B11-safe corollary), the findings register (the third
  pending-text variant), this log, the worklog. `.env.example`
  re-verified unchanged.
- **R5** — the full gate: lint 0 errors · typecheck ✓ · 117/117 unit ·
  build ✓ · 31/31 smoke · **120/120 E2E** (119 + 1 new test; the browse
  pill pin re-targeted in place).

## Traps recorded

- **`scrollTo(0, document.body.scrollHeight)` undershoots max scroll**
  by the body/documentElement height delta (~22px here) — growth states
  read p≈0.93 with the pill 8px short. Probe with
  `document.documentElement.scrollHeight`; and re-verify a "divergence"
  at the true max before filing it.
- **The live's mobile-only input heights come from CSS overrides, not
  class strings** — its input class has NO height utility yet measures
  44 at 390 and 20 at 1280. Pin COMPUTED heights per breakpoint, and
  don't over-generalize one breakpoint's measurement.
- **`h-11 md:h-auto` is safe ONLY under a height-carrying row** (the
  B11-safe corollary): the trap fires when the ROW's height depends on
  the input; name the carrier when you write the class.
- **The live's ::placeholder styling is an override (500 + black/40)
  while its typed text is 400** — the two weights differ INTENTIONALLY;
  don't "fix" one to match the other.
- **Probe your own probe** — the R2 script's first run "failed" 4
  checks that were probe bugs (the pill's ::placeholder, a regex);
  the E2E pins (which read the input directly) were correct all along.
- The live's pending pill text now has THREE observed variants — pin
  only the dominant family and document the variation.
