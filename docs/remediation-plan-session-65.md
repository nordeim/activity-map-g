# Remediation Plan — Session 65 (v2.28)

Fresh cycle against the operator's redeployed v2.27 mirror (`docs/start_server_log.txt`:
a fresh build + re-seeded db from the `ab94e29` tree, `.env` now carrying
`NEXT_PUBLIC_CARTO_KEY`) + the operator's `docs/session_65.md` (the session-64
transcript archive).

## The audit (both sites, agent-browser)

The MOBILE NAVIGATION MENU (the task's focus) verified EXACT at 390 on BOTH
sites: the tab-bar fixed at the viewport TOP (0, 0, 390, 52 — the probe's
first pass looked in the wrong viewport half; the bar was there all along),
the glass `rgba(248,247,244,0.62)` + `blur(24px) saturate(1.5)`, the links
x=16/121/192/222/259/304/330/356 at y=4 (every anchor 44px tall), the
Map/Favourites/Profile taps green — NO Tailwind v4 regression. The identity's
TENTH measurement held "sepnetflix2023". The desktop nav (433/559/639/727/805),
the v2.27 fan grid (3 columns x=51/450/848 w381, settled middle −315.237 live
/ −315.34 mirror, outer ±6.000°/±38px, w418), the mid-ramp no-inset model
(mirror delta 0.00 at gridTop ≈ −400 AND +400 — the old inset model reads
−49.65 where the live and the fixed mirror both sit at ≈ −53.1), the category
3D-fan (±18° = 0.951057/0.309017, perspective 800, x=231/786), the responsive
hearts (44 mobile), the h1 (y=203, 35.88px), the booking label ("Preferred
Check-In Time*"), zero mirror console errors, and the keyed tiles (the mirror's
50/50 route hrefs + 24/24 /map Voyager tiles, real imagery pixel-verified:
1942 distinct colors, the (238,243,238) land tone) all verified. The LIVE
remains keyless upstream (its route SVG hrefs + /map tile srcs both `hasKey:
false` — the watermark is still the live's own provider state; our keyed tiles
remain the intended restoration).

**TWO findings — both on the /map surface:**

### F1 — the basemap + view model (a 5-part cluster)

The live's /map Leaflet canvas was probed for the first time at the TILE level
(prior sessions pinned the chrome — search pill, pins, stats — but never the
tile URL or the zoom model):

1. **Style**: the live serves `light_nolabels` z15 tiles
   (`basemaps.cartocdn.com/light_nolabels/15/17375/11340.png` — the SAME
   minimal style family as its route map); our clone serves
   `rastertiles/voyager` z14 (the colorful labeled style — the clone's original
   "the reference app's carto.com basemap" comment was never verified against
   the live).
2. **Initial zoom — a fitBounds model, not a fixed zoom**: the live's zoom is
   viewport-dependent: z13 @390 (canvas 356×310), z14 @640 (396×310),
   z15 @768+ (702/834/958/1214/1278 × 620 — the canvas caps at 1278 wide).
   The exact model — `fitBounds(9 places, {padding: [40, 40], maxZoom: 15})` —
   was pinned by discriminators: canvas 362 → z13 (padding > 38.25) while
   canvas 366 → z14 (padding ≤ 40.25); the 1278-canvas case stays z15 via the
   maxZoom cap (z16's 1142px span + 80px padding would fit 1278). All 8
   measured viewports consistent. The 9-pin cluster sits EXACTLY centered
   (the mobile centroid 177.5/155.5 vs the canvas center 178/155).
3. **maxZoom**: the live caps at z18 (22 clean zoom-ins from z0 floor 0); our
   clone sets 19.
4. **Center**: the fit centers the 9-pin bounds center (48.3671, 10.8967), not
   our fixed Augsburg center (48.3713, 10.8982).
5. **Re-fit on filter changes**: the live RE-FITS the view on every actual
   filter change — pill clicks (the pane translated −141px, 3 restaurants
   re-centered) and search Enters; the zoom re-fits too (390: z13 → z14 after
   the Hotels pill; 1280: z15 held by the cap). Our clone's view is STATIC
   (the existing guard-gated `.pad(0.18)` fit in LeafletCanvas never fires —
   the fixed z14 view already contains the bounds center, so the guard fails).

### F2 — the search + list semantics (a 4-part cluster)

1. **The search submits on ENTER** — typing NEVER filters (verified: "brass"
   typed, 2s, 9 markers unchanged; Enter → 1). Our clone filters live on every
   keystroke (`onChange → setQuery → useMemo`).
2. **The pill-click fallback model**: a pill click filters WITHIN the visible
   set; an EMPTY intersection falls back to the pill-only set (the query
   resets, the input text stays stale): "brass" (1: a hotel) + Restaurants →
   3 (fallback); "garden" (1: a restaurant) + Restaurants → 1 (kept). A query
   SUBMITTED while a pill is active is pure AND ("brass" + Restaurants active
   → 0 "No places").
3. **The list-header COUNT CHIP**: the live renders the bare count in a white
   rounded-full pill (px-3 py-1.5, 12px font-semibold) on the right of the
   `mb-3 flex items-end justify-between` header row; our clone renders nothing
   there. The 0-result state renders "No places" (our clone: an empty grid).
4. **The clear-search button**: the live's is 28px (w-7 h-7); ours is 24px.

(The live's search MATCHING semantics are async/fuzzy server-side —
"garden"→1, "hotel"→3, "ember"→3-or-9 across runs — not replicable nor worth
chasing; our deterministic local haystack match stays.)

## The TDD cycle

- **R0 RED** — E2E pins in `tests/e2e/browse.spec.ts` (the map view block),
  all verified failing on the untouched v2.27 tree:
  1. the basemap style (the existing session-63 tile-key pin re-targeted):
     every tile src contains `light_nolabels/` + the key (not `voyager/`);
  2. the fitBounds zoom contract: fresh loads — z15 @1280, z13 @390 (both
     currently fixed z14);
  3. the maxZoom cap: 5 zoom-in clicks from rest → the tile z never exceeds 18
     (currently reaches 19);
  4. the Enter submission: typing "garden" leaves 9 markers; Enter → 1;
  5. the pill fallback: submit "brass" → 1; click Restaurants → 3;
  6. the re-fit: after the Hotels pill the 3 markers' centroid sits within
     ~25px of the canvas center (static view: off-center);
  7. the count chip ("9") + the "No places" empty state;
  8. the 28px clear button.
- **R1 GREEN (F1)** — `src/components/map/LeafletCanvas.tsx`: the tile URL →
  `light_nolabels/{z}/{x}/{y}{r}.png` (keyed); `maxZoom: 18`; the map is
  created WITHOUT the fixed center/zoom and the view is set by
  `fitBounds(points, {padding: [40, 40], maxZoom: 15})` — instant on mount,
  animated on later points changes (the filter re-fit), replacing the dead
  guard-gated `.pad(0.18)` fit. The `?place=` flyTo is untouched.
- **R2 GREEN (F2)** — `src/components/map/MapExplorer.tsx`: the state split
  (`inputText` + `submittedQuery`); Enter submits; the pills apply the
  within-visible + empty-fallback model; the clear button clears both; the
  list count chip + the "No places" empty state; the clear button 28px.
- **R4** — dev-server probes (the server + probes in ONE bash invocation):
  the tile style + zooms (z15 @1280 / z13 @390), the re-fit after the Hotels
  pill, the Enter semantics, the count chip, the keyed real imagery.
- **R5** — the 20-screenshot set re-captured (the map captures now document
  the light_nolabels basemap at the fitted zoom) + docs aligned to v2.28.
- **R6** — the full gate: lint · typecheck · 117 unit · build · 31 smoke ·
  E2E (102 + the 8 new pins).

## Non-goals

Everything else measured EXACT — the mobile nav (the task's focus), the fan
grid (settled + mid-ramp), the hearts, the hero, the category fan, the booking
labels, the identity, the route map (keyed 50/50, real imagery). The live's
own keyless/watermarked state stays the live's problem (the operator's key
restores the pre-degradation contract on our side). The live's async search
matching semantics stay un-replicated (our local deterministic match).
