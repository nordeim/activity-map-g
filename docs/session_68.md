# Session 68 — the v2.29 remediation (the /map frame + events chip + search status pill)

Fresh cycle against the operator's redeployed v2.28 mirror + the operator's
new material: `docs/session_67.md` (the session-66 transcript archive) and
the redeploy's `docs/start_server_log.txt` (the fresh build + re-seeded db
from the `c5f7ad6` tree). This file is the engineering log; the worklog
entry carries the condensed record.

## Refresh + baseline

- Pulled to `727a6b5` (the operator's commits: the transcript archive +
  the redeploy's start-server log — the mirror now runs the v2.28 tree
  WITH the CARTO key; verified from the live DOM: the /map serves keyed
  light_nolabels z15 tiles).
- Root docs + session_66/67 + remediation-plan-65 + worklog +
  start_server_log re-read; `.env` == `.env.example` content-wise
  (DATABASE_URL=file:../db/custom.db, db/ at root, 118784B seeded).
- Baseline gates on the untouched tree: lint 0 errors · typecheck ✓ ·
  117/117 unit · build ✓ · 31/31 smoke · 109/109 E2E.

## The dual-site audit

The MOBILE NAVIGATION MENU (the task's focus) verified EXACT at 390 on BOTH
sites — the tab-bar fixed at the viewport top (0, 0, 390, 52), the glass
`rgba(248,247,244,0.62)` + `blur(24px) saturate(1.5)`, the links
x=16/121/192/222/259/304/330/356 at y=4 (every anchor 44px tall, 12px Inter
at −0.12px tracking, active 700), and the Map/Favourites/Profile icon taps
green on both — NO Tailwind v4 regression. The identity's ELEVENTH
measurement held "sepnetflix2023" + the email subtitle. Every other
re-measured surface held: the hearts 36×36 at desktop, the stay cards
(x=21, w=441/442, h=521), the zoom controls (34×34 pair, gap 8), the pin
x-positions identical, the list count chip, zero console errors on the
mirror. The LIVE remains keyless upstream.

FIVE findings — all on the /map surface, the first four from the live
EVOLVING its map search UI since the session-66 measurement, the fifth a
real clone bug found while auditing the mobile shell:

### F1 — the search STATUS PILL + the card restructure

Submitting a query on the live now renders a violet pill INSIDE the shell
card, below the search pill: the row `mt-2 flex items-center gap-2
flex-wrap`; the pill `inline-flex items-center gap-1.5` (6px) with an
**11×11 lucide-sparkles icon (stroke 2)** + 12px/600 `#571AFF` text (lh
18px), bg `#F0EAFF`, the 1px `#D8CAFF` border, radius 12, pad 5/10 → 30px
tall. The PENDING text is the deterministic template **"Searching for
{query}-related options in Augsburg."** ("brass" persisted in the pending
state for 15s+ — the live's search is async/LLM-backed and flaky per
query). The RESOLVED text is LLM-generated per query and per run ("Looking
for places with a nice garden." / "Finding a great hotel in Augsburg." /
"Finding places with beautiful garden settings.") — **non-replicable**;
the clone carries the live's own pending template while the query is
active. While a query is active the shell card RESTRUCTURES to a COLUMN at
every breakpoint: the search pill + the status row share one `w-full`
wrapper, the filter button drops below (the desktop card grows 66 → 164,
mobile 138 → 176). The clear button restores the rest layout. A
viewport-resize RESETS the live's search state (a re-mount).

### F2 — the canvas FRAME chrome

The live wraps the canvas in `activity-map-frame overflow-hidden
rounded-[32px] border border-white/70 bg-white
shadow-[0_18px_44px_rgba(14,14,14,0.10)]` — radius **32px at md / 28px on
phones**, a white/70 border, bg-white, the exact `0 18px 44 /0.10` shadow;
the frame BOX is 1216×622 at desktop / 358×312 on phones (so the inner
canvas is the live's exact 1214×620 / 356×310). The clone's
`rounded-3xl border border-black/5 shadow-card h-[620px]/[310px]` left the
inner canvas 2px short (618/308) — the wrapper height did not include the
border.

### F3 — the pills→canvas layout gaps

The live's pill-bottom → frame-top gaps: **≈32px at desktop / ≈44px on
phones** (measured: desktop pills end 454 → frame 485; mobile pills end
453 → frame 497). The clone rendered 40px / 30px (the search section's
mb-2 + the heading section's pb-[22px]) with the mobile frame 40px high
overall (457 vs 497) — mostly from F5's collapsed search pill (−14px) +
the pills-row mt (−12px) + the frame gap (−14px).

### F4 — the "0 events · N places" chip

The live renders a status chip INSIDE the canvas, top-right: `absolute
top-3 right-3 z-[400] flex items-center gap-2 px-3 py-1.5 rounded-full
bg-white` + the shadow `0 1px 3px rgba(14,14,14,0.05), 0 4px 16px
rgba(14,14,14,0.07)` — a **6×6 ink dot** (bg #0E0E0E, r-50%) + the text
**"0 events · {N} places"** at 12px/600 `#141413` (147×30). The live's own
text does NOT pluralize-check ("0 events · 1 places" measured at 390). The
count UPDATES with every filter ("0 events · 3 places" after the
Restaurants pill, "0 events · 1 places" after a garden search).

### F5 (BUG) — the mobile search pill collapse

The clone's mobile search pill rendered **34px tall** with a 20px input.
Root cause: the row carried `flex-1` (`flex: 1 1 0%`) — in the parent's
flex COLUMN at mobile, **flex-basis: 0% OVERRIDES the `h-12` height
utility for the main-axis size**, so the row collapsed to its min-content
floor (the 32px icon cell + 2px of border). At desktop (flex ROW) `h-12`
still applied via the cross axis — which is why the bug only showed on
phones. The live's row renders 48px with a 44px input (content-driven).
No E2E pin existed for the mobile search-pill height (a coverage gap this
session closes). Related: the pills row at mobile CENTER-CLIPPED both ends
(justify-center + overflow — the first pill sat at x=−33, unreachable)
while the live's overflowing row starts at x=16 with Sights clipped right.

## The TDD remediation

- **R0 RED** — 5 pins verified failing on the untouched v2.28 tree: the
  frame chrome (radius 32/28 + the white/70 border + bg white + the exact
  shadow + the inner canvas 620/310 exact), the events chip (text + chrome
  + the filter update), the status pill (typing-no-pill → Enter renders
  the violet pill with the template text + the 30px height + the 11px
  icon + the card growth >100 + the clear restore to 66), the mobile
  search pill (48px row + 44px input + the 138px shell), and the
  pills→canvas gaps (32px desktop / 44px phones).
- **R1 GREEN (all in MapExplorer.tsx)**:
  - The FRAME: `map-canvas-frame relative h-[312px] overflow-hidden
    rounded-[28px] border border-white/70 bg-white
    shadow-[0_18px_44px_rgba(14,14,14,0.10)] md:h-[622px]
    md:rounded-[32px]` (the inner canvas 310/620 exact).
  - The EVENTS CHIP: the `absolute right-3 top-3 z-[400]` white pill +
    the 6px ink dot + the exact two-layer shadow + `0 events ·
    {visible.length} places` (no pluralize-check — the live's own text).
  - The STATUS PILL: rendered inside a NEW `w-full md:flex-1` wrapper
    that holds [search row, status row] — the `mt-2 flex items-center
    gap-2 flex-wrap` row + the pill (sparkles 11×11 stroke 2, 12px/600
    #571AFF at lh 18, bg #F0EAFF, the #D8CAFF border, radius 12, pad
    5/10) with `Searching for {query}-related options in Augsburg.`;
    the inner flex container drops `md:flex-row md:items-center` while a
    query is active (the live's column restructure).
  - The F5 fix: the WRAPPER carries `w-full md:flex-1` (no flex-basis
    override at mobile) + the row keeps `h-12` + the input `h-11` (44px).
  - The spacing: the search section's `mb-2` REMOVED; the heading
    section's `pb-[22px]` → `pb-[44px]` (the live's mobile gap); the
    pills row `mt-[14px]` → `mt-[26px]` + `justify-start
    md:justify-center` (the left-aligned overflow).
- **Two en-route test fixes**: the oklab serialization gotcha (the
  white/70 border asserts its parsed alpha, not the string — the known
  AGENTS trap) and three `getByText("N places")` assertions made
  `exact: true` (the new events chip made the loose matches ambiguous).
- **R2 verified** — dev-server probes (the production server with
  `DATABASE_URL=file:../db/custom.db` pinned explicitly): the mobile
  frame **EXACT** ([16, 497, 358, 312] — identical to the live's
  measured box), the mobile chip EXACT ([214, 510, 147, 30]), the
  search-row 48px + the 44px input, the pills y=409 (the live's exact
  value), the active card 164 (the live's exact value) with the children
  at 86/48, the status pill [41, 361, 331, 30] (the live's [41, 360]),
  the desktop frame [32, 487, 1216, 622] (the live's [32, 485] — 2px
  rounding), the desktop gap 32, and zero console errors.
- **R3** — 21 screenshots re-captured
  (`scripts/capture-screens-session68.mjs` — the session-65 script with
  the NEW 21st capture: the search-active shell showing the violet status
  pill + the restructured card + the narrowed 1-pin canvas + the chip at
  "0 events · 1 places"). Docs aligned to v2.29: README (the screenshots
  paragraph, the map feature row, the counts 114, the history row),
  AGENTS (the counts + the v2.29 map contract), CLAUDE (the counts + the
  suite descriptions), PAD (the v2.29 revision block), SKILL (1.29.0),
  the findings v2.29 addendum, .env.example (the light_nolabels mention
  — was Voyager), this log, the worklog.
- **R4** — the full gate: lint 0 errors · typecheck ✓ · 117/117 unit ·
  build ✓ · 31/31 smoke · **114/114 E2E** (109 + 5 new tests).

## Traps recorded

- **`flex-1` silently kills a height utility in a flex COLUMN**:
  flex-basis: 0% overrides `h-12` for the main-axis size, so the item
  collapses to its min-content floor. The fix pattern: move `flex-1` to
  a WRAPPER (`w-full md:flex-1`) so the height applies on the inner row,
  or pin the height with the CONTENT (the input's h-11). At desktop
  (flex ROW) the same `flex-1` + `h-12` compose fine (basis drives width,
  height rides the cross axis) — the bug is mobile-only and invisible to
  desktop-only probes.
- `justify-center` on an overflowing scroll row CENTER-CLIPS both ends
  in Chromium — the first item becomes unreachable. The live left-aligns
  its overflowing pills row (x=16, the last pill clipped right): use
  `justify-start md:justify-center`.
- The live's search-status pill text: the PENDING template
  ("Searching for {q}-related options in Augsburg.") is deterministic and
  replicable; the RESOLVED text is LLM-generated per query and per run —
  pin only the template + the chrome, never the resolved phrasing.
- The live's "0 events · N places" chip does NOT pluralize-check ("0
  events · 1 places" measured) — match the live's own text, not correct
  grammar.
- A viewport-resize RESETS the live's /map search state (a re-mount) —
  don't expect search state to survive a resize probe on the live.
- The `getByText("9 places")` ambiguity: adding a second element that
  contains the same substring ("0 events · 9 places") breaks every loose
  match in the suite — use `{ exact: true }` (three specs needed it).
