# Remediation Plan — Session 63 (v2.27)

Fresh cycle against the operator's redeployed v2.26 mirror (start_server_log:
a fresh build + re-seeded db from the `bae1354` tree) plus the operator's NEW
material: `docs/carto_key.txt` — the account's CARTO Basemaps API key.

## The audit (both sites, agent-browser)

The MOBILE NAVIGATION MENU (the task's focus) verified EXACT at 390 on BOTH
sites: the tab-bar links x=16/121/192/222/259/304/330/356 at y=4, the
390×52 glass (bg rgba(248,247,244,0.62), blur(24px) saturate(1.5)), every
anchor 44px tall, the Map/Favourites/Profile taps green — NO Tailwind v4
regression. The identity's NINTH measurement held "sepnetflix2023". The
desktop nav (433/559/639/727/805), the v2.26 fan grid (structure 3 columns
x=51/450/848 w381, colH 1576-1577, pitch 399, settled −315.237/±6.000°/w418),
the responsive hearts (44 mobile / 36 desktop), and the mirror's zero console
errors all verified. The mirror runs the v2.26 surfaces exactly.

**TWO findings:**

### F1 — the CARTO key integration (the session's headline task)

Both sites' Carto raster tiles STILL serve the provider's "API KEY REQUIRED"
watermark placeholder (the live's route SVG hrefs remain keyless — verified
today: 25 `light_nolabels/14/...` hrefs, `hasKey: false`). The operator
provided the account key (`docs/carto_key.txt`, committed, non-secret):
`cb1_465p_1_988c53d611811b5d4bdb6b32` — for raster basemaps, append
`?key=<key>` to the tile URL and the watermark goes away.

Empirically verified (curl): keyless `light_nolabels/14/8697/5642.png` →
2049B 4-bit watermark placeholder; keyed → real imagery. Berlin z13 keyed →
9994B/28 colors (real streets). The route's own 5×5 grid keyed returns 24
real tiles (3074B-21551B, 13-41 colors) — only the NW corner 8697/5642 is a
genuinely featureless rural tile (103B solid — the region is farmland NNE of
Augsburg; the true city sits at z14 x=8688/y=5670, so the ORIGINAL session-60
map deliberately renders that rural showcase window). The keyed URL restores
the pre-degradation visual contract — the watermarked tile is a provider-side
artifact, not a design element.

**Scope:** `src/lib/carto.ts` (the key + `withCartoKey()` helper, overridable
via `NEXT_PUBLIC_CARTO_KEY`, defaulting to the committed key so the operator's
keyless-env builds still get clean tiles) · `RecommendedRoute.tsx` (the 25
route tile hrefs) · `LeafletCanvas.tsx` (the /map Voyager basemap) ·
`.env.example` documents the override.

### F2 — the middle-column fan ramp (a precision drift, found today)

Today's live curve fit (5 parked points, the grid top VERIFIED at each):
ty = −0.2 × colH × clamp01((vh − gridTop)/(vh + gridH)) — the zero crossing
at gridTop ≈ 799.6 (vh=800) and the slope 0.13266 = 0.2×1576/2376 EXACT at
every point. NO traversal inset. The outer cards' phases verified EXACT
(p_card = (vh − top)/(vh + h), −6°×p, −38px×p — all to 4 decimals).

The v2.26 implementation applies the session-62 inset fit
(`p = (vh − 38 − top)/(gridH + vh − 76)`) — the mid-ramp states diverge by up
to ~3.4px (gridTop=400 @ vh=800: the mirror −49.65 vs the live −53.01; the
p=0/p=1 states are insensitive, which is why the session-62 R4 checks at
"centered"/"settled" passed on both models). **Fix:** drop the 38/76 inset
from the middle column's p only (the outer formula already matches).

## The TDD cycle

- **R0 RED** — verified failing on the untouched tree:
  1. `tests/carto.test.ts` (unit): the module + helper contract;
  2. the route-map desktop pin: every tile href carries `?key=`;
  3. the route-map mobile pin: the 25 mobile tiles carry the key;
  4. the /map Leaflet pin: the basemap tile srcs carry `?key=`;
  5. the mid-ramp fan pin: the middle ty within ±1.5px of the no-inset model
     computed from the page's own measured geometry (self-calibrating).
- **R1 GREEN (F1)** — `src/lib/carto.ts` + the two tile-URL sites +
  `.env.example`'s NEXT_PUBLIC_CARTO_KEY block.
- **R2 GREEN (F2)** — StayShowcase's middle-p loses the 38/76 inset (the
  comment updated with today's curve-fit forensics).
- **R4** — dev-server probes: the route tiles render REAL imagery (no
  watermark), the /map tiles keyed, the mid-ramp fan ty matches the model at
  a verified parked position; the live's keyless state re-documented.
- **R5** — the 20-screenshot set re-captured (the route captures now show the
  clean basemap) + docs aligned to v2.27.
- **R6** — the full gate: lint · typecheck · 113+4 unit · build · 31 smoke ·
  100+2 E2E (the route tile-key pins extend the existing route specs).

## Non-goals

The live's identity, mobile nav, desktop nav, hearts, fan structure,
planner chrome, and typography all measured EXACT — nothing else to touch.
The live will presumably fix ITS key upstream at some point (the operator's
note); our keyed tiles then remain visually identical to the live's restored
map. If the live instead STAYS keyless, our clean tiles are the intended
restoration per the operator's explicit instruction (the watermark is
provider noise, not design).
