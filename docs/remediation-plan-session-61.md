# Remediation Plan — Session 61 (the redeployed v2.25 mirror vs the live, 2026-10-01)

Audit basis: the live `https://activity-map.base44.app/` (logged in as
`sepnetflix2023@outlook.com`) vs the redeployed v2.25 mirror
`https://activity-map.jesspete.shop/` (operator redeploy: fresh build +
re-seeded db, `docs/start_server_log.txt`).
Desktop 1280×900 + mobile 390×844. agent-browser numeric probes + matched-state
VLM screenshots + SHA-256 hero hash.

## Verified EXACT (no action)

- **The mobile navigation menu (the task's key focus)**: the tab-bar geometry
  (links x 121/192/222/259, icons 304/330/356, 390×52 glass, bg
  rgba(248,247,244,0.62), blur(24px) saturate(1.5), 1px border-b), the taps
  (Heart→/favourites, MapPin→/map, User→/profile) all green on BOTH sites —
  NO Tailwind v4 regression. The identity's EIGHTH measurement holds
  "sepnetflix2023"; the mirror's guest state reads "Explorer" (by design).
- Desktop nav 433/559/639/727/805, heart 957, avatar 1001.
- Hero image: SHA-256-identical (byte-for-byte).
- The v2.25 surfaces on the redeployed mirror: the Carto route map (25
  light_nolabels tiles, the pan formula, the mobile no-pan map — the route
  headings sit at 864 vs 879 after full load, ~15px INFO), the ±18° category
  fan (matrix3d 0.951057/0.309017 both), "Preferred Check-In Time*", the
  home stay cards' 0 rating badges, the desktop stay-image parallax
  (scale 1.16 + ty, matched), the restaurants band (both 4140px tall).
- The Carto tiles NOW return the "API KEY REQUIRED" watermark placeholder
  (a 2KB 16-color PNG, 97% blank + text pixels) — IDENTICAL on both sites
  (the same public URLs). An external degradation, not parity drift. The
  VLM matched-pair comparison of the mobile route: "no real differences."

## Drift found (the live evolved again)

### F1 — the home stays grid became a STAGGERED FANNING grid (desktop only)

The live's `Choose Your Vibe` grid (measured at 1280×900, settled):

- THREE column wrappers (the middle column carries a scroll-linked
  **translateY** rising to **−315.24px = −0.2 × column height** (1576px);
  linear ramp with the clamp easing in; reversible on scroll-up).
- The OUTER columns' cards carry a scroll-linked **rotation fan**:
  `rotate(∓6°)` about `transform-origin: 0 100%` (bottom-LEFT for BOTH
  columns — col1 negative/counterclockwise, col3 positive/clockwise) PLUS
  `translateX(∓38px)` — the settled col1 card0 rect spans [−78, 341] (w 418)
  and col3 card0 spans [836, 1255] (w 418), verified against the measured
  matrices (matrix(0.994522, ±0.104528, …, ±38.053, 0) = ±6.000°).
- The progress model (fit to sweeps, ±0.06° everywhere):
  - card rotation: `prog = clamp((vh − cardTopViewport)/(vh + cardHeight), 0, 1)`
    (each card fans in as IT traverses the viewport — the row pitch 399
    staggers the phases naturally: card i's curve = card 0's shifted by
    399×i of scroll);
  - middle column: `p = clamp((vh − 38 − gridTopViewport)/(gridHeight + vh − 76), 0, 1)`,
    `ty = −0.2 × colHeight × p`.
- Mobile (390): NO transforms at any scroll (flat single column) — the
  whole effect is md+ only.

The mirror renders a static aligned 3×4 grid (grid-rows-4 +
grid-auto-flow:column) — no stagger, no fan.

### F2 — the stay-card heart is 44px on phones

The live's home stay-card heart measures 44×44 at (16,16) at 390 and 36×36
at (16,16) at desktop — a RESPONSIVE size (h-11 below md, w-9 h-9 from md).
The mirror's SaveButton renders h-9 w-9 (36px) at every width. (Earlier
"39px/49px" desktop readings were rotation-inflated rect artifacts; the
clean rest-state measurement is 36 @ 16/16 — matching.)

### F3 — the showcase parallax is DESKTOP-ONLY on the live

The live's stay-card home images (scale 1.16 + ty parallax) AND the sights
images (the 132% inset-crop + ty parallax) compute `transform: none` at 390
at every scroll position. The mirror applies both at mobile too (the
`useParallax` listener + the StayCard's inline `translateY(8%) scale(1.16)`
initial style run at every width).

### F4 — the search widget's chrome (minor)

The live's "Let's Plan Your Trip" card: `rgba(255,255,255,0.94)` background
+ the shadow `rgba(14,14,14,0.16) 0px 16px 34px 0px` PLUS
`rgba(255,255,255,0.94) 0px 1px 0px 0px inset` (a 1px white top highlight).
The mirror: bg-white/95 (oklab 0.95) and no inset layer. The drop shadow
itself matches exactly.

### F5 — the mobile tab-bar's tap targets (minor, ergonomics)

The live's tab-bar links measure 44px tall (h-11 anchors — full-height
touch targets) inside its h-12 (48px) inner nav; the mirror's links measure
18px inside h-[51px]. The VISUAL positions match (the text sits at ~17-18px
in both) — but the live's tap zones are 2.4× taller. The 52px border-box
bar, the glass, the x-geometry all already match.

### F8 — the stay-card typography line-heights (minor)

The live's card h3: 24px/36px (lh 1.5) at mobile, 18px/27px (lh 1.5) at
desktop; the meta p: 12px/18px (lh 1.5). The mirror: leading-tight (1.25 →
30px/22.5px) and the default (1.333 → 16px). The font sizes match; only the
leading differs (the card text blocks sit visibly tighter on the mirror).

## Fix plan (TDD)

- **R0 RED**: new/extended pins in `tests/e2e/home.spec.ts` (the fan:
  engages at a centered scroll, settles at ±6°/−0.2×colH at deep scroll,
  flat at 390; the heart 44/36; the mobile image `none`/desktop
  `matrix(1.16…)`; the search widget's 0.94 + inset; the h3/p line-heights)
  + `tests/e2e/mobile-navigation.spec.ts` (the 44px link tap targets).
- **R1 GREEN (F1)**: `StayShowcase.tsx` restructured into three column
  wrappers (mobile stacks identically; md+ the 3 columns) + an rAF-throttled
  scroll driver applying the measured formulas (the transforms on the
  per-card wrappers + the middle li; reset below md).
- **R2 GREEN (F2+F3+F8)**: `SaveButton` h-11 w-11 md:h-9 md:w-9; the
  StayCard home image's initial transform moved from an inline style to the
  md-gated arbitrary-property class; `useParallax` skipped below md; the
  card h3/p leading-normal.
- **R3 GREEN (F4+F5)**: the Hero search card's bg-white/[0.94] + the inset
  shadow layer; the tab-bar links' h-11 tap targets.
- **R4**: dev-server numeric probes vs the live's measured values (the fan
  rects/matrices, the ty curve, the heart, the line-heights, the widget) +
  matched-state VLM pairs.
- **R5**: the 19 screenshots re-captured; `.env.example` verified; the docs
  aligned (v2.26); this plan + the session log + the worklog.
- **R6**: the full gate — lint 0 errors · typecheck · 113 unit · build ·
  31 smoke · E2E (94 + the new pins).

INFO (no action): the Carto API-key watermark tiles (identical on both
sites — an external change to document); the ~15px mobile heading offsets
accumulating through the home (the route 864 vs 879 — pre-existing); the
VLM's hero-composition misjudgment (disproved by the SHA-256 hash).
