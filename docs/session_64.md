# Session 64 — the v2.27 remediation (the CARTO-key basemaps + the no-inset fan ramp)

Fresh cycle against the operator's redeployed v2.26 mirror + the operator's
new material: `docs/carto_key.txt` (the account's CARTO Basemaps API key —
the provider deprecated anonymous raster access) and `docs/session_63.md`
(the session-62 narrative archive). This file is the engineering log; the
worklog entry carries the condensed record.

## Refresh + baseline

- Pulled to `a29a4c0` (the operator's commit: the session-62 transcript
  archived as `docs/session_63.md`, `docs/carto_key.txt`, the redeploy's
  `start_server_log.txt` — a fresh `rm -rf .next/ db/`, install, db:push,
  db:seed, build, `next start` from the v2.26 tree).
- Root docs + session_62/63 + remediation-plan-61/63 + worklog +
  start_server_log re-read; `.env` == `.env.example`
  (DATABASE_URL=file:../db/custom.db, db/ at root, 118784B seeded).
- Baseline gates on the untouched tree: lint 0 errors · typecheck ✓ ·
  113/113 unit · build ✓ · 31/31 smoke · 100/100 E2E.

## The dual-site audit

The MOBILE NAVIGATION MENU (the task's focus) verified EXACT at 390 on BOTH
sites: the tab-bar links x=16/121/192/222/259/304/330/356 at y=4 (every
anchor 44px tall), the 390×52 glass (bg rgba(248,247,244,0.62), blur(24px)
saturate(1.5)), the Map/Favourites/Profile taps green — NO Tailwind v4
regression. The identity's NINTH measurement held "sepnetflix2023". The
desktop nav (433/559/639/727/805) and every v2.26 surface re-verified on
both sites: the fan grid structure (3 columns x=51/450/848 w381, colH
1576-1577, pitch 399), the settled state (middle −315.237, card-0
±6.000°/−38px, w418), the responsive hearts (44 mobile / 36 desktop), the
hero, zero console errors.

TWO findings (`docs/remediation-plan-session-63.md`):

- **F1 — the CARTO key integration (the session's headline task)**: the
  live's route-map tile hrefs are STILL keyless (25 `light_nolabels/14/…`
  hrefs, `hasKey: false`) — both sites' Carto raster tiles serve the
  provider's "API KEY REQUIRED" watermark placeholder (2049B, 4-bit,
  mostly-blank). The operator's key restores the real imagery. Verified
  empirically BEFORE coding: keyed Berlin z13 → 9994B/28 colors; the
  route's own 5×5 grid keyed → 24 real tiles (3074-21551B) with only the
  NW corner (8697/5642) a legitimately featureless 103B solid — the grid
  deliberately renders farmland NNE of Augsburg (the true city center
  sits at z14 x=8688/y=5670, so the showcase window was never the literal
  city). The watermarked tile is a provider-side artifact, not a design
  element — the keyed URL restores the pre-degradation visual contract.
- **F2 — the middle fan column's ramp is NO-INSET**: a 5-point parked
  curve fit (the grid top VERIFIED at each sample, walk-then-park) pinned
  `ty = −0.2 × colH × clamp01((vh − gridTop)/(vh + gridH))` — the zero
  crossing at gridTop ≈ 799.6 (vh=800) and the slope 0.13266 =
  0.2×1576/2376 EXACT at every point. The v2.26 driver's session-62
  ±38px-inset fit diverges up to ~3.4px mid-ramp (gridTop=400 @ vh=800:
  −49.65 vs the live's −53.01). The p=0/p=1 states are inset-insensitive —
  which is why the session-62 "centered"/"settled" verification points
  passed on BOTH models (the meta-lesson: verification points must
  SEPARATE the candidate formulas, not sit on their shared fixed points).
  The outer cards' phases verified EXACT to 4 decimals — untouched.

## The TDD remediation

- **R0 RED** — 5 pins verified failing on the untouched tree: the carto
  unit seam (module missing), the route-desktop tile-key pin (line-554
  `?key=` miss), the route-mobile tile-key pin, the /map Leaflet tile-key
  pin, and the self-calibrating no-inset mid-ramp fan pin (measured 2.57px
  off — exactly the inset model's predicted divergence).
- **R1 GREEN (F1)** — `src/lib/carto.ts`: `CARTO_KEY` (overridable via
  `NEXT_PUBLIC_CARTO_KEY`, defaulting to the committed key so the
  operator's keyless-env production builds still get clean tiles) +
  `withCartoKey()` (appends `?key=`/`&key=`, Leaflet's placeholders
  verbatim). Applied at both tile sites: `RecommendedRoute.tsx`'s 25-tile
  grid + `LeafletCanvas.tsx`'s Voyager layer. `.env.example` documents the
  override (unset = the committed default).
- **R2 GREEN (F2)** — `StayShowcase.tsx`: the middle p loses the 38/76
  inset; the comment records today's curve-fit forensics.
- **R4** — dev-server probes (the server + probes in ONE bash invocation —
  the sandbox reaps background processes between tool calls): the 50 route
  tile hrefs all keyed; the /map Voyager tiles 24/24 loaded
  (naturalWidth>0); the fan mid-ramp delta **0.00** at the parked position
  (top=300, p=0.21, midTy −66.37 = expected −66.37); the pixel palette
  confirms the keyed land tone (238,243,238) replacing the watermark blank
  (250,250,248); the live's watermarked state screenshot archived for the
  record.
- **R5** — 20 screenshots re-captured
  (`scripts/capture-screens-session63.mjs`; the map captures now document
  the real keyed basemaps — the 07/15 captures wait for the streamed tiles
  to attach; the mobile threshold corrected to 4 because a 390 viewport
  shows only ~6 z14 tiles, the desktop's 12 does not apply — the first run
  timed out on that threshold, the re-run captured it at 221858B vs the
  watermark era's 49104B). Docs aligned to v2.27: README (the screenshots
  paragraph, the route/vibe/map rows, the counts 117/104, the env-var
  table, the history row), AGENTS (the counts + the carto + no-inset
  contracts), CLAUDE (the counts + the suite descriptions), PAD (the
  v2.27 revision block + ADR-006 keyed), SKILL (1.27.0), the findings v2.27
  addendum, this log, the worklog.
- **R6** — the full gate: lint 0 errors · typecheck ✓ · **117/117 unit** ·
  build ✓ · 31/31 smoke · **102/102 E2E** (100 + 2 new tests; the route
  tile-key pins extend the existing route specs in place).

## Traps recorded

- SVG `<image>` elements do not expose `naturalWidth` (an HTMLImageElement
  property) — "pending" readings are the probe's fault, not the tiles';
  check the pixel palette of the screenshot or the HTML `<img>` tiles
  (Leaflet's) for load state instead.
- Background servers do not survive BETWEEN Bash tool invocations in this
  sandbox (even `setsid nohup`) — start the server, probe, and kill within
  ONE invocation (the r4-probes/capture runner scripts).
- A 390 viewport shows only ~6 z14 Leaflet tiles — a desktop-calibrated
  tile-count wait (12) times out on mobile; calibrate the threshold to the
  viewport.
- The inset-vs-no-inset fan models agree at p=0 and p=1 — verification
  points chosen at rest/settled/centered cannot distinguish them; the
  mid-ramp (0.05 < p < 0.5) is where they separate (2.5-3.5px apart).
- The lazy-load lesson re-learned the hard way AGAIN: a scroll parked from
  a stale pre-read of the grid position measures the fan at an unverified
  state — the first live reading (−53.01 at an assumed top=400) looked
  like a live-side formula change until the walk-then-park re-measure
  confirmed the grid top and the no-inset fit to 0.05px across 5 points.
