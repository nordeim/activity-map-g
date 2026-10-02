# Session 74 — the v2.32 remediation (the sticky-vibe restructure + the zero state + the placeholder)

Fresh cycle against the operator's redeployed v2.31 mirror
(`docs/start_server_log.txt`: the fresh build + re-seeded db from the
`a2e0545` tree — the mirror verified running v2.31 from the live DOM:
the browse pill [39,·,720,54] with the 20px content-driven desktop
input at weight 400) + the operator's `docs/session_73.md` (the
session-72 transcript archive).

## Refresh + baseline

- Pulled the workspace (fast-forward to `73b468c` — the operator's
  session-73 transcript + the refreshed start-server log), re-read the
  five root docs + session_72/73 + remediation-plan-71 + the worklog +
  the start-server log.
- Baseline gates on the untouched tree: lint 0 errors · typecheck ✓ ·
  117/117 unit · build ✓ · 31/31 smoke · 120/120 E2E.
- scandihaven re-reviewed for patterns (same stack conventions — Next
  16 + React 19 + Tailwind v4 CSS-first + strict gates; no new
  guidance). agent-browser v0.38.1 for the dual-site audit.

## The dual-site audit

The MOBILE NAVIGATION MENU (the task's focus) verified EXACT at 390 on
BOTH sites — the tab-bar fixed at (0, 0, 390, 52), the glass
`rgba(248,247,244,0.62)` + `blur(24px) saturate(1.5)`, the links
x=16/121/192/222/259/304/330/356 at y=4, the Map/Favourites/Profile
taps green — NO Tailwind v4 regression (the 15th consecutive
verification). The identity's FOURTEENTH measurement held
"sepnetflix2023" + the email. Zero console errors across the swept
pages.

Every prior surface re-verified EXCEPT the four findings: the search
input's typed-text model (the v2.31 fix live-verified on the mirror),
the map default state (9 markers + "0 events · 9 places" + the
356×310/1214×620 canvases + the white zero card), the browse orders +
ObjectId URLs (no churn), the home h1 115.2px, the route map (25
light_nolabels z14 tiles at 268×268 — BOTH sites now render the tiles
as SVG `<image>` elements inside the 1500-viewBox grid; ours keyed
50/50, the live remains keyless upstream), the route trap geometry
(1163/3333 vs the live's 1164/3333), the place detail (82px h1 + 34px
About + the picker triggers), the desktop nav x=433/559/639/727/805,
the footer growth 646×118 at true max scroll, the login chrome
(renders authenticated; the login placeholders 400 + slate-600 — they
MATCH, the live's placeholder change is search-input specific), the
favourites h1, the chrome-less profile, the /eat chips
38px/12px/600/pad-10-16, and the sights grid (1120 wide, 360×360
row-major, same order, the wrapper parallax active on both).

FOUR findings — `docs/remediation-plan-session-73.md`:

### F1 — the search-input ::placeholder (LOW, code)

The live's browse + map placeholders now compute **font-weight 400 +
#9CA3AF** (Tailwind gray-400) at both breakpoints on both surfaces
(re-measured 4× consistently: /eat + /map × desktop + mobile ×
pre/post-typing × fresh-reload; the class strings unchanged). The
v2.31 pin (500 + black/40) captured a since-evolved state. Fix: drop
`placeholder:font-medium` + `placeholder:text-black/40` →
`placeholder:text-[#9CA3AF]` on both inputs.

### F2 — the LLM text family (docs-only)

The pending pill's FOURTH variant: "garden" → "Finding locations
featuring a lovely garden setting." (a full free-form LLM sentence —
after "options"/"listings"/"items"). Plus the /map nonsense-query
message "I could not identify your search criteria." The clone's
pinned template stays; the divergence notes gain the fourth variant.

### F3 — the browse ZERO state (MEDIUM, code)

The live's zero state (measured on /eat + /stay + /do): a white
`rounded-[28px] bg-white py-16 text-center md:col-span-2
lg:col-span-3` card INSIDE the results grid (NO shadow, NO icon, NO
button) with "No {restaurants|hotels|experiences} found" (Inter
20px/400 #0E0E0E lh 28) + "Try widening your search" (Inter 14px/400
#888580, 4px below). The clone's card (icon disc + serif "No matches"
+ "Reset filters") was an invention — re-rendered to the live's
design.

### F4 — the vibe showcase restructure (HIGH, code)

The live RETIRED the v2.26 fan and rebuilt the section as a
STICKY-HEADING + PASS-THROUGH architecture (the structure verified
stable across reloads + time + scroll): [an absolute 18px graph-paper
texture at 0.36] + [a `md:sticky md:top-0 md:h-screen` heading block
(pt-88/px-18; mobile relative with pt-48/pb-18 — no pin) whose h2
PINS at viewport y 88 from scroll 7383 to 9215 while the grid scrolls
up and PAINTS OVER it — the nested grid section follows in DOM order
and wins the paint, verified by screenshot] + [the nested grid
section: pt-112 / the 1178 centered ul / pb-144 (mobile: pt-20/pb-56)]
with the grid STATIC (the 3 column wrappers stay; every transform
identity at every scroll — the session-61/63 fan choreography is
retired). The stay-img parallax REMAINS (±36 = 8% of the 449 layout
height) and the sights section beneath carries its own pt-144 (md) /
pt-48 (mobile).

## The TDD remediation

- **R0 RED** — 7 pins verified failing on the untouched v2.31 tree:
  the browse + map placeholder pins (400 + #9CA3AF), the zero-state
  card pin (all three browses), the vibe heading-pin pin, the
  static-grid pin, the mobile-contract pin, the sights-pt pin.
- **R1 GREEN**: the placeholder classes on both inputs; the
  CategoryExplorer zero state (the ZERO_CATEGORY_NAME seam + the
  spanning card inside the grid); the StayShowcase restructure
  (sticky heading + nested section + the fan driver deleted); the
  HighlightedSights pt; the useParallax max via offsetHeight (±35.9,
  was ±45); the SiteFooter's snap-to-grown at the document end (the
  body/documentElement delta left p at 0.9992 — the radius computing
  33.9952px instead of 34).
- **R2 verified 33/33 probe checks** (the placeholders, the zero
  state's full chrome, the vibe structure + the pin at 88 + the static
  grid + the parallax sweep + the mobile paddings + the sights pt +
  the mobile input) — after fixing the footer-grown E2E park (the
  true max scroll) and the footer driver's snap.
- **R3** — 22 screenshots re-captured
  (`scripts/capture-screens-session74.mjs`; the 04/20 captures now the
  PIN and PASS-THROUGH states; the walk fixed to INSTANT steps — a
  smooth walk leaves an in-flight Chrome animation that resumes AFTER
  a later instant scroll, landing the page ~1500px past the commanded
  position).
- **R4** — docs aligned to v2.32: README (the showcase + zero-state +
  placeholder + sights + the counts + the session row), AGENTS (the
  planner contract + the vibe restructure), CLAUDE (the counts + the
  pin list + the footer snap), PAD (the v2.32 revision block +
  section), SKILL (1.32.0 + the project state), the findings register
  (the fourth variant), this log, the worklog. `.env.example`
  re-verified unchanged.
- **R5** — the full gate: lint 0 errors · typecheck ✓ · 117/117 unit ·
  build ✓ · 31/31 smoke · **122/122 E2E** (120 + 5 new − 3 fan pins
  retired).

## Traps recorded

- **A smooth scroll walk poisons later instant scrolls** — the
  site's `scroll-behavior: smooth` CSS means `window.scrollTo(0, y)`
  walks leave in-flight Chrome animations that RESUME after a later
  `behavior: "instant"` jump, landing the page up to ~1500px past the
  target (the 04 capture initially rendered the deep-grid state; the
  DOM probe at the same instant read the correct pin state — always
  walk with `behavior: "instant"` and trust the DOM over the VLM).
- **The body/documentElement scrollHeight delta leaves the footer's
  last sliver unreachable** — p maxes at 0.9992 (the radius 33.9952
  ≠ 34). The live renders the exact grown model at its own max
  scroll; snap p to 1 within 1px of the body's end.
- **A pin can be a sub-pixel string compare** — `toHaveCSS` compares
  exact strings: "34px" vs "33.9952px" fails while every boundingBox
  rounds clean. Find the driver-level fix, not a tolerance.
- **The live's ::placeholder is per-surface** — the search inputs went
  gray-400 while the login fields stay slate-600; don't globalize one
  surface's placeholder model.
- **A DOM structural change can be invisible to img-based probes** —
  the live's route tiles now render as SVG `<image>` elements (my
  `querySelectorAll('img')` found ZERO tiles; the svg query found 25).
  Query both element families before declaring a surface missing.
