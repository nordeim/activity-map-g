# Session 66 — the v2.28 remediation (the /map basemap + view model + search semantics)

Fresh cycle against the operator's redeployed v2.27 mirror + the operator's
new material: `docs/session_65.md` (the session-64 transcript archive) and
the redeploy's `docs/start_server_log.txt` (a fresh build + re-seeded db
from the `ab94e29` tree, `.env` now carrying `NEXT_PUBLIC_CARTO_KEY`). This
file is the engineering log; the worklog entry carries the condensed
record.

## Refresh + baseline

- Pulled to `13f06d9` (the operator's commit: the session-64 transcript
  archived as `docs/session_65.md` + the redeploy's start-server log — the
  mirror now runs the v2.27 tree WITH the CARTO key in the environment).
- Root docs + session_64/65 + remediation-plan-63/65 + worklog +
  start_server_log re-read; `.env` == `.env.example`
  (DATABASE_URL=file:../db/custom.db, db/ at root, 118784B seeded).
- Baseline gates on the untouched tree: lint 0 errors · typecheck ✓ ·
  113→117/117 unit · build ✓ · 31/31 smoke · 102/102 E2E.

## The dual-site audit

The MOBILE NAVIGATION MENU (the task's focus) verified EXACT at 390 on BOTH
sites — with a probe-side lesson: the tab-bar is fixed at the viewport TOP
((0, 0, 390, 52) — the probe's first pass searched the viewport's BOTTOM
half, found nothing, and nearly mis-reported a missing tab bar; the bar was
always there, `position: fixed`, opacity 1, at every scroll). The glass
(bg rgba(248,247,244,0.62), blur(24px) saturate(1.5)), the links
x=16/121/192/222/259/304/330/356 at y=4 (every anchor 44px tall), and the
Map/Favourites/Profile taps green — NO Tailwind v4 regression. The
identity's TENTH measurement held "sepnetflix2023".

Every v2.27 surface re-verified on the redeployed mirror: the route tiles
50/50 keyed, the /map tiles 24/24 keyed AND loaded (naturalWidth>0), the
real keyed imagery pixel-verified (1942 distinct colors in the viewport
capture — the watermark era rendered ~16-color tiles; the (238,243,238)
land tone dominant; the definitive discriminator: the keyed tile 8698/5642
returns 22 colors + the land tone while the keyless returns 16 colors +
the (114,122,128) watermark text pixels), the fan grid settled (middle
−315.34 vs the live's −315.237; the outer ±6.000°/±38px/w418), the mid-ramp
no-inset model (the mirror's delta 0.00 at gridTop ≈ −400 AND +400 — two
parked points; the old v2.26 inset model reads −49.65 where both the live
and the fixed mirror sit at ≈ −53.1), the category 3D-fan (±18° =
0.951057/0.309017, perspective 800, x=231/786), the responsive hearts
(44×44 at 390), the h1 (y=203, 35.88px = the capped 9.2vw), the booking
label ("Preferred Check-In Time*"), the desktop nav (433/559/639/727/805),
and zero console errors. The LIVE remains keyless upstream — its route SVG
hrefs AND its /map tile srcs both `hasKey: false` (the watermark is still
the live's own provider state; our keyed tiles remain the intended
restoration).

TWO findings — both on the /map surface, found by probing the live's map
canvas at the TILE level for the first time (prior sessions pinned the
chrome — search pill, pins, stats — but never the tile URL or the zoom
model):

### F1 — the basemap + view model (a 6-part cluster)

1. **Style**: the live serves `light_nolabels` z15 tiles
   (`basemaps.cartocdn.com/light_nolabels/15/17375/11340.png` — the SAME
   minimal style family as its route map); our clone served
   `rastertiles/voyager` z14 (the colorful labeled style — the clone's
   original "the reference app's carto.com basemap" comment was never
   verified against the live).
2. **Initial zoom — a fitBounds model, not a fixed zoom**: the live's zoom
   is viewport-dependent: z13 @390 (canvas 356×310), z14 @640 (396×310),
   z15 @768+ (702/834/958/1214/1278 × 620 — the canvas caps at 1278 wide;
   1920 renders the same 1278). The exact model —
   `fitBounds(9 places, {padding: [40, 40], maxZoom: 15})` — was pinned by
   DISCRIMINATOR viewports: canvas 362 (viewport 396) → z13 (padding >
   38.25) while canvas 366 (viewport 400) → z14 (padding ≤ 40.25); the
   1278-canvas case stays z15 via the maxZoom cap (z16's 1142px span + 80
   padding would fit 1278). All 11 measured viewports consistent.
3. **Centering**: the fit centers the BOUNDS (the live's mobile west/east
   pins at 106.65/249.35 = exactly (w−span)/2) — NOT the pin centroid:
   the 9-pin distribution is ASYMMETRIC (the centroid sits ~19px east at
   390 on BOTH sites; my first mobile read averaged the min/max and
   mis-called the live "centroid-centered" — a probe-side math error
   caught by the desktop measurement).
4. **Re-fit on filter changes**: the live RE-FITS the view on every actual
   filter change — pill clicks (the pane translated (−141, 0) after the
   Restaurants pill; the 3 markers re-centered) and search Enters; the 390
   zoom re-fits too (z13 → z14 after the Hotels pill — the 3-stay bounds
   fit the small canvas one level tighter).
5. **maxZoom**: the live caps at z18 (22 clean zoom-ins from the z0 floor
   never leave 18; the first rapid-click floor test mis-read 14 — clean
   timing showed the floor is 0); our clone set 19.
6. **The mobile canvas**: the live's is a FIXED 356×310 (measured at
   390×{700, 844, 1000} — the height never moves); ours was 62vh ≈ 521.

### F2 — the search + list semantics (a 4-part cluster)

1. **The search submits on ENTER** — typing NEVER filters (verified:
   "brass" typed + 2s → 9 markers unchanged; Enter → 1). Our clone
   filtered live on every keystroke (`onChange → setQuery → useMemo`).
2. **The pill-click fallback model**: a pill click filters WITHIN the
   visible set; an EMPTY intersection falls back to the pill-only set (the
   query resets, the input text stays stale): "brass" (1: a hotel) +
   Restaurants → 3 (fallback); "garden" (1: a restaurant) + Restaurants →
   1 (kept). A query SUBMITTED while a pill is active is pure AND
   ("brass" + Restaurants active + Enter → 0 "No places").
3. **The list-header COUNT CHIP**: the bare count in a white rounded-full
   pill (px-3 py-1.5, 12px font-semibold) on the right of the header row;
   the 0-result state renders "No places" (our clone: no chip, an empty
   grid).
4. **The clear-search button**: the live's is 28px (w-7 h-7); ours was
   24px (h-6 w-6).

(The live's search MATCHING semantics are async/fuzzy server-side —
"garden"→1, "hotel"→3, "ember"→3-or-9 across runs, and one zzz-no-match
run returned 9 — documented as un-replicable; our deterministic local
haystack match stays.)

## The TDD remediation

- **R0 RED** — 8 pins verified failing on the untouched tree (7 new tests
  + the session-63 tile-key pin re-targeted): the light_nolabels style +
  key, the fitBounds zooms (z15 @1280 / z13 @390 / z14 @640 fresh loads),
  the maxZoom 18 cap, the Enter submission (typing leaves 9; Enter → 1),
  the pill empty-fallback (brass+Restaurants → 3), the re-fit centering +
  the 390 zoom climb, the count chip + "No places", the 28px clear.
- **R1 GREEN (F1)** — `LeafletCanvas.tsx`: the tile URL → keyed
  `light_nolabels/{z}/{x}/{y}{r}.png`; maxZoom 19→18; the map created with
  NO fixed center/zoom (viewless until the fit, so the first tile requests
  carry the fitted zoom); the mount fit
  `fitBounds(bounds, {padding: [40, 40], maxZoom: 15, animate: false})`
  with later points-changes re-fitting ANIMATED (a didInitialFit ref) —
  replacing the guard-gated `.pad(0.18)` fit that NEVER FIRED (the fixed
  z14 view already contained the bounds center, so the guard failed). The
  `?place=` deep-link flyTo untouched.
- **R2 GREEN (F2)** — `MapExplorer.tsx`: the `inputText`/`submittedQuery`
  state split (Enter submits; typing only edits the text);
  `selectFilter`'s within-visible + empty-intersection fallback; the clear
  button resetting BOTH states + the 28px chrome; the list-header count
  chip; the "No places" empty state; the canvas `h-[62vh] min-h-[420px]` →
  `h-[310px]`.
- **Two R0 pins re-calibrated during GREEN** (the honest-RED discipline):
  the centering assertion corrected from the pin CENTROID to the
  BOUNDS-range MIDPOINT (the live's own centroid is ~19-77px off-center —
  the asymmetric distribution; the bounds are the centering contract), and
  the maxZoom pin re-designed around Leaflet's DISABLED control state (a
  5th click on the capped control times out — the first GREEN run surfaced
  it as a test timeout, not a product bug).
- **R4** — dev-server probes (the server + probes in ONE bash invocation;
  the capture server must carry `DATABASE_URL=file:../db/custom.db`
  explicitly — a bare `npx next start` without it fails the login with
  Prisma error 14, which is why the npm scripts pin the URL inline):
  20/20 checks — the tile style (18/18 light_nolabels, 0 voyager) + keyed
  + loaded, the zoom table (15/13/14), the bounds-midpoint centering
  (0.5px/0px), the re-fit (3 pins centered 0/0 + the 390 z13→z14 climb),
  the full search-semantics matrix (typing no-filter, Enter submit,
  brass→1, pill fallback→3, AND→0+"No places", clear→3), the count chip,
  the 28px clear, and the maxZoom 18 with the disabled control.
- **R5** — 20 screenshots re-captured
  (`scripts/capture-screens-session65.mjs`): the map captures now document
  the light_nolabels palette (the (237,237,237) land tone + white roads —
  1747/2295 distinct colors, no watermark). Docs aligned to v2.28: README
  (the screenshots paragraph, the map feature row, the env table, the
  counts 109, the history row), AGENTS (the counts + the fitBounds +
  search-semantics contracts), CLAUDE (the counts + the suite
  descriptions), PAD (the v2.28 revision block), SKILL (1.28.0), the
  findings v2.28 addendum, this log, the worklog.
- **R6** — the full gate: lint 0 errors · typecheck ✓ · 117/117 unit ·
  build ✓ · 31/31 smoke · **109/109 E2E** (102 + 7 new tests).

## Traps recorded

- The mobile tab-bar probe must search the viewport's TOP half — the bar
  is `position: fixed` at y=0, and a bottom-half search finds nothing at
  any scroll (nearly mis-reported as a missing tab bar).
- A probe that averages a marker set's min/max positions measures the
  BOUNDS midpoint, not the centroid — with an asymmetric distribution the
  two differ by ~19px at 390 (~77px at desktop zoom), enough to fake a
  live-vs-mirror divergence. Name which one you mean before asserting.
- Leaflet DISABLES the zoom-in control at maxZoom — a blind 5th click
  times out the test (the Playwright click waits for enabled). Assert the
  `leaflet-disabled` class at the cap instead.
- Rapid-fire zoom-out clicks get swallowed (a 14-click run appeared to
  floor at z14; clean 600ms-spaced clicks ran to z0). Space the clicks
  before concluding a zoom floor.
- A bare `npx next start -p 3000` (without the explicit
  `DATABASE_URL=file:../db/custom.db`) can fail the login with Prisma
  error 14 while the E2E server (which pins the env) works — always pass
  the env or use `npm run start` (the npm scripts pin the URL inline,
  which is exactly what AGENTS.md documents).
- The live's /map search is async server-side and non-deterministic
  between runs ("ember" → 9 then 3) — pin only the deterministic TRIGGER
  semantics (Enter/pill/clear), never the matching breadth.
- fitBounds-centering vs centroid-centering: Leaflet's
  `_getBoundsCenterZoom` centers the BOUNDS with symmetric padding
  (paddingOffset = (BR−TL)/2 = 0); the live's model matches exactly.
