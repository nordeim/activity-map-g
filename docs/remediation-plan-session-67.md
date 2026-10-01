# Remediation Plan — Session 67 (v2.29)

Fresh cycle against the operator's redeployed v2.28 mirror (`docs/start_server_log.txt`: the
fresh build + re-seeded db from the `c5f7ad6` tree, `.env` carrying `NEXT_PUBLIC_CARTO_KEY`) +
the operator's `docs/session_67.md` (the session-66 transcript archive).

## The audit (both sites, agent-browser)

Baseline gates on the untouched v2.28 tree: lint 0 errors · typecheck ✓ · 117/117 unit ·
build ✓ · 31/31 smoke · 109/109 E2E. The mirror verified RUNNING v2.28 (the /map
light_nolabels z15 keyed tiles). The MOBILE NAVIGATION MENU (the task's focus) verified
EXACT at 390 on BOTH sites — the tab-bar fixed at the viewport top (0, 0, 390, 52), the
glass `rgba(248,247,244,0.62)` + `blur(24px) saturate(1.5)`, the links
x=16/121/192/222/259/304/330/356 at y=4 (every anchor 44px tall, 12px Inter, active 700),
and the Map/Favourites/Profile taps green — NO Tailwind v4 regression. The identity's
ELEVENTH measurement held "sepnetflix2023" + the email subtitle. Every other re-measured
surface held: hearts 36×36 desktop, stay cards (x=21, w=441/442, h=521), zoom controls
(34×34 pair, gap 8), pin positions identical, the list count chip, zero mirror console
errors, the live still keyless upstream.

**FIVE findings — all on the /map surface (the live evolved its search UI since v2.28):**

### F1 — the search STATUS PILL + the card restructure (the big one)

Submitting a query on the live now renders a violet status pill INSIDE the shell card,
below the search pill:

- The row: `mt-2 flex items-center gap-2 flex-wrap` (mt 8px, gap 8px).
- The pill: inline-flex items-center gap-1.5 (6px) — an **11×11 lucide-sparkles icon
  (stroke 2)** + 12px/600 `#571AFF` text (line-height 18px), bg `#F0EAFF`, 1px `#D8CAFF`
  border, radius 12px, pad 5px 10px → **30px tall**.
- The pending text is a DETERMINISTIC template: **"Searching for {query}-related options
  in Augsburg."** ("brass" → "Searching for brass-related options in Augsburg." — observed
  and it persisted while the live's async/LLM search ran; "brass" never resolved in 15s,
  "garden" resolved to 1 in <8s).
- The resolved text is an LLM-GENERATED intent line ("Looking for places with a nice
  garden." / "Finding a great hotel in Augsburg." / "Finding places with beautiful garden
  settings." — different phrasing per query and per run) — **non-replicable with a local
  deterministic search; documented as an intentional divergence**. Our pill carries the
  live's own pending template text while the query is active.
- The pill PERSISTS while the query is active (also after resolution); the clear button
  removes it and restores the rest layout.
- **The card RESTRUCTURES while a query is active**: the inner flex container drops its
  `md:flex-row` — the layout becomes a COLUMN at every breakpoint:
  [search pill, status row, filter button]. The card grows 66 → 164 tall at desktop,
  138 → 176 at mobile (the pills row + canvas shift down with it).

### F2 — the map canvas FRAME chrome

The live wraps the canvas in `activity-map-frame overflow-hidden rounded-[32px] border
border-white/70 bg-white shadow-[0_18px_44px_rgba(14,14,14,0.10)]` — radius **32px at md /
28px on phones** (measured both), a **white/70** border, **bg-white**, the exact
`0 18px 44px /0.10` shadow; the frame box is **1216×622 at desktop / 358×312 on phones**
(so the inner canvas is 1214×620 / 356×310 — exact). The mirror renders
`rounded-3xl border border-black/5 shadow-card` + `h-[310px] md:h-[620px]` — radius 24 at
both breakpoints, a black/5 border, the shadow-card token, and the inner canvas 2px short
(618/308) because the wrapper height does not include the border.

### F3 — the pills→canvas layout gaps

Live: the pills row (its own py-8 pads at desktop) ends flush at the frame — the pill
bottom → frame gap is **≈32px at desktop / ≈44px on phones** (measured: desktop pills end
454 → frame 485; mobile pills end 453 → frame 497). The mirror: 40px desktop (the section
pb-8 + the search section's mb-2) / 30px mobile (pb-[22px] + mb-2). The mobile frame
lands 40px high overall (457 vs 497) — mostly from F5's collapsed search pill (−14px) +
the pills-row mt (−12px) + the frame gap (−6px … −8px).

### F4 — the "0 events · N places" canvas chip

The live renders a status chip INSIDE the canvas, top-right: `absolute top-3 right-3
z-[400] flex items-center gap-2 px-3 py-1.5 rounded-full bg-white` + the shadow
`0 1px 3px rgba(14,14,14,0.05), 0 4px 16px rgba(14,14,14,0.07)` — the text
**"0 events · {N} places"** at 12px/600 `#141413` (N = the visible count; it UPDATES with
filters: "0 events · 3 places" after the Restaurants pill, "0 events · 1 places" after a
garden search). The mirror renders nothing inside the canvas. (The live's data carries an
"events" entity type the clone does not model — the count is always 0, matching the live's
rendered text.)

### F5 (BUG) — the mobile search pill collapse

The mirror's mobile search pill renders **34px tall** with a 20px input. Root cause: the
row carries `flex-1` (flex: 1 1 0%) — in the parent's flex COLUMN at mobile, flex-basis
0% OVERRIDES the `h-12` height for the main-axis size, so the row collapses to its
min-content floor (the 32px icon cell + 2px of border). At desktop (flex ROW) `h-12`
still applies via the cross axis — which is why this only shows on phones. The live's
row is `min-w-0 flex-1` but its INPUT is 44px tall, keeping the row at 48px
(content-driven). No E2E pin exists for the mobile search-pill height — a coverage gap
this session closes.

## The TDD remediation

### R0 — RED pins (tests/e2e/browse.spec.ts, the map describe)

New/extended E2E pins, all verified failing on the unmodified v2.28 tree first:

1. The map frame chrome: radius 28px at 390 / 32px at 1280, the white/70 border, bg
   white, the `0 18px 44px` shadow, and the inner leaflet canvas 356×310 / 1214×620
   exact (the 2px-short regression pin).
2. The events chip: visible at top-right inside the canvas at both breakpoints, the text
   "0 events · 9 places" at rest → "0 events · 3 places" after the Restaurants pill.
3. The search status pill: after typing + Enter, the violet pill renders inside the shell
   card — the sparkles icon + the "Searching for garden-related options in Augsburg."
   text, the #F0EAFF bg + #D8CAFF border, 12px/600; the CARD grows (mobile 138 → 176);
   typing ALONE never renders it; the clear button removes it.
4. The mobile search pill height: 48px at 390 with the 44px input (F5's pin).
5. The pill→canvas gaps: the frame y ≈ pills-bottom + 44 (mobile) / + 32 (desktop),
   tolerance ±2px.

### R1 — GREEN: `src/components/map/MapExplorer.tsx`

- The search row: `w-full md:flex-1` (drops the flex-basis override at mobile so `h-12`
  applies) + the input `h-11` (44px, the live's model).
- The frame: `overflow-hidden rounded-[28px] md:rounded-[32px] border border-white/70
  bg-white shadow-[0_18px_44px_rgba(14,14,14,0.10)] h-[312px] md:h-[622px]`.
- The events chip: the absolute top-3 right-3 z-[400] white pill + the exact shadow +
  `0 events · {visible.length} places`.
- The status row: rendered inside the card below the search pill when
  `submittedQuery` is non-empty — the `mt-2 flex items-center gap-2 flex-wrap` row + the
  violet pill (sparkles 11×11, 12px/600 #571AFF, bg #F0EAFF, border #D8CAFF, radius 12,
  pad 5/10) with the live's pending template text
  `Searching for {query}-related options in Augsburg.`; the inner flex container drops
  `md:flex-row` while a query is active (the live's column restructure).
- The spacing: the search section's `mb-2` removed; the heading section's bottom padding
  retargeted to the measured gaps (mobile 44px / desktop 32px from pill bottom to frame);
  the pills row `mt` adjusted so the mobile pills land at the live's y.
- The clear button keeps resetting BOTH states (the pill disappears with the query).

### R2 — verification probes on the dev server

Numerical probes (agent-browser) against `npm run start`: the frame radius/border/bg/
shadow at both breakpoints, the inner canvas 620/310 exact, the events chip text +
filter update, the status pill chrome + text + the card growth + the restructure +
typing-no-filter + Enter-submit + clear-restore, the mobile search pill 48px/44px input,
the frame y positions, and a console-error sweep.

### R3 — screenshots (docs/screenshots/)

Re-capture the map captures (the desktop /map with the new frame + chip; the mobile /map;
the search-active state showing the status pill) via the established
`scripts/capture-screens-sessionNN.mjs` pattern (server + captures in ONE invocation,
DATABASE_URL pinned explicitly).

### R4 — docs alignment

README (the map feature row + the screenshots paragraph), AGENTS.md (the /map contracts:
the frame chrome, the events chip, the status pill + card restructure, the F5 bug class),
CLAUDE.md (the counts + the map contract lines), the PAD v2.29 revision block,
activity-map_SKILL.md (1.29.0), the findings addendum, this plan's outcome, the session
log (docs/session_68.md), the worklog entry.

### R5 — the full gate

`npm run lint` → `npm run typecheck` → `npm run test` (117) → `npm run build` →
`./scripts/smoke-test.sh` (31) → `npm run test:e2e` (109 + the new pins). Secret scan the
staged diff; commit (conventional `fix(parity): …` message) and push through
`docs/ssh_git_wrapper_v3.py` to `git@github.com:nordeim/activity-map-g.git` main.

## Validation of this plan against the codebase (pre-execution)

- The search row / frame / pills / section paddings all live in
  `src/components/map/MapExplorer.tsx` (read in full — the insertion points are the
  search-shell section, the canvas section, and the heading section's padding classes).
- The status pill needs no new dependency (lucide-react already imported in the file —
  add `Sparkles` — it is already imported for the search icon cell).
- The events chip rides the canvas wrapper's `relative` (already present via the frame
  div) — the z-[400] sits above Leaflet's controls (z-1000? no — Leaflet controls are
  z-1000 in leaflet.css; the live uses z-[400] which sits under the controls but above
  the tile pane z-200/400… measured on the live: the chip renders above the tiles; the
  zoom controls (top-LEFT) never overlap the chip (top-RIGHT) so the stacking works.
- The E2E insertion points: the map describe in `tests/e2e/browse.spec.ts` after the
  session-65 pins (the tile/zoom/centering tests) — the file already imports
  `readMapZoom` helpers and the map selectors.
- No API/schema changes; no new packages; the `.env.example` already documents every
  env var the code reads (DATABASE_URL, NEXT_PUBLIC_SITE_URL, AUTH_SECRET,
  NEXT_PUBLIC_CARTO_KEY, DEBUG_DBPATH) — re-verify, no changes expected.
