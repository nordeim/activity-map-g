# Remediation Plan — Session 60 (the v2.25 audit)

Source of truth: the live site `https://activity-map.base44.app/` re-measured
2026-10-01 (session 60's audit — the workspace was rebuilt from `2bc4a45` after
a sandbox crash wiped the uncommitted session-60 work; every finding below was
RE-MEASURED from the live, not restored from memory).

Baseline at audit time: `2bc4a45` (v2.24) — lint 0 errors · typecheck ✓ ·
113/113 unit · build ✓ (the smoke + E2E gates re-run in R6).

## Audit scope + method

The dual-site browser audit (agent-browser on the live + the local dev
mirror of `2bc4a45`): the mobile navigation menu (the task's key focus)
verified at 390 — tab-bar geometry (links x=121/192/222/259, icons
x=304/330/356, the 52px glass bar) and the functional taps
(Heart→/favourites, MapPin→/map, User→/profile) EXACT on the live —
**NO regression, no Tailwind v4 issue**. The hero (h1 115.2px, photo
y=−86 h=1010, md5-matched photo), the desktop nav, the stays grid
(12 cards 381px, 3×4 column-major), the mobile restaurant deck
(6 cards, h 490, img 300, 620px advances) all re-verified unchanged.

The audit found FOUR drift clusters (the live evolved since session 58):

## F1 — the home category cards became a 3D FAN (MAJOR, desktop)

The live's `.today-category-cards` row (`relative z-10 flex items-end
justify-center gap-3 px-4`, computed **matrix(1.15)** — a 1.15 wrapper scale
at md+, none on phones) now wraps each card in a `perspective: 800px`
outer div whose INNER card carries the fan:

* left card `rotateY(18deg)` + `transform-origin: right center`,
  middle `rotateY(0deg)` + `origin: center center`,
  right `rotateY(-18deg)` + `origin: left center`;
* `transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)` —
  **hover flattens every card to rotateY(0)**;
* inner card: `width: 230px` (measured 265 at ×1.15), `border-radius: 20px`,
  `background: rgba(255,255,255,0.34)` at md / **0.58 on phones**,
  `backdrop-filter: blur(28px) saturate(160%)` (was 150%),
  `border: 1px solid rgba(255,255,255,0.36)`,
  `box-shadow: 0 8px 22px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.42)`,
  `padding: 14px 14px 12px`, `position: relative; overflow: hidden;
  cursor: pointer`;
* header row: `flex items-center justify-between margin-bottom: 10px`,
  Inter 14px/600 rgb(20,20,19) — measured 24px line-box (×1.15);
* the rows deck: an ABSOLUTE flex column `gap: 8px` (`transform:
  translateY(0)`, `transition: transform 0.35s cubic-bezier(0.22,1,0.36,1)`)
  inside a `position: relative; height: 124px; overflow: visible;
  clip-path: inset(0px)` window — four 36px items: the three curated rows
  (`flex items-center gap-8px height-36px`, 28×28 r-8 icon cells
  bg white/0.48 + border white/0.52, 13px lucide icons stroke 2 #111111,
  12px/500 titles, 12px/400 black/30 subtitles) + the **View All pill as
  the 4th item**: `height: 36px; border-radius: 999px; bg rgb(20,20,19)`
  (md) / **rgb(87,26,255) on phones**, white 12px/600 ls 0.03em;
* **hover slides the deck `translateY(-44px)`** (revealing the pill) and
  expands the window's `clip-path` to `inset(0px -36px -36px)`;
* at rest the desktop window (124px) clips the pill — only the 3 rows show;
  on phones the window renders its full 168px (all 3 rows + the violet
  pill VISIBLE, card 306×227, measured bg 0.58);
* the old external hanging 229×54 View All pill is GONE.

The mirror (v2.24) renders flat cards, 46px rows, the external hanging
pill. Remediate: restructure CategoryCards into the fan + deck model with
the measured chrome (arbitrary rgba classes for deterministic computed
values — the repo's established pattern).

## F2 — the route visual became a CARTO TILE MAP (MAJOR, both breakpoints)

The live's `#recommended-route` body (`.route-map-section`, desktop trap
`height: 416.65vh` — was 420vh; phones: a 220vh trap + the waypoint panel
`route-waypoint-panel relative z-10 block px-[18px] pb-10 pt-0` with
`margin-top: -12vh`) now renders a REAL MAP:

* the map panel (md: 50%/50% split — `route-map-sticky sticky top-0 flex`,
  `height: 100vh; overflow: hidden; z-index: 1`, map half
  `relative flex-shrink-0 overflow-hidden w-1/2`, waypoint half
  `route-waypoint-panel flex-1 flex flex-col px-8 lg:px-12
  background: rgb(248,247,244); justify-content: center; overflow: hidden`)
  carries an SVG `viewBox="0 0 1500 1500" preserveAspectRatio="xMidYMid
  slice"` with:
  - **25 Carto tiles**: `https://a.basemaps.cartocdn.com/light_nolabels/14/
    {x}/{y}.png` (z14, x 8697–8701, y 5642–5646, 502×502 each, in a 5×5
    grid at x/y = −500..1500) — public, no key;
  - the **dashed base path** `M 748 400 C 745 440 750 465 755 500 C 760 535
    762 562 758 600 C 755 635 750 658 745 695 C 740 730 735 762 738 810
    C 740 855 748 885 752 940 C 755 990 752 1040 750 1100` — stroke
    `rgba(20,20,19,0.15)` width 5, `strokeDasharray: "10 8"`;
  - the **solid progress path** (same d, ~703.098 total length) — stroke
    `#141413` width 5, `stroke-dashoffset` driven by the trap progress
    (0% at the trap top, 100% at the trap's release — the SAME
    `(scroll − trapTop)/(trapH − viewport)` formula the mirror already
    uses; 0.672px of card motion per scroll px);
  - **5 waypoint circles** r=13 `fill:#F8F7F4 stroke:#141413
    stroke-width:2.5 opacity:0.95` at (748,400) (758,600) (745,695)
    (752,940) (750,1100);
  - the **head dot**: a circle r=7 `fill:#141413` with
    `filter: drop-shadow(rgba(20,20,19,0.5) 0 0 6px)` that rides the path
    (its cx/cy computed from the progress);
  - the **pan**: the wrapping `<g>` carries `translate(750 − headCx,
    750 − headCy)` at md+ (keeps the head at the map panel's center) —
    **NO pan on phones** (the mobile map stays static, pan (0,0), the
    head travels screen y 225→619);
* the **progress pill** (md only) is a SPLIT-COLOR progress bar:
  `absolute bottom-24 left-0 right-0 flex justify-center z-10
  pointer-events-none` holding a 218×36 white pill
  (`backdrop-filter: blur(10px)`, 12px font-neue ls 0.04em tabular-nums,
  `border: 1px solid rgb(232,230,220)`, `box-shadow: 0 8px 22px
  rgba(14,14,14,0.08)`, `rounded-full`) whose violet `#571AFF` fill
  (left-anchored, `width: {progress}%`, `transition: width 360ms
  cubic-bezier(0.22,1,0.36,1)`) underlays TWO clipped text spans — the
  dark text clipped to the unfilled right `(100−progress)%` and a white
  duplicate clipped to the filled left `{progress}%`;
* the **waypoint panel carries an 18px graph-paper overlay**:
  `position: absolute; inset: 0; pointer-events: none; opacity: 0.42;
  background-image: linear-gradient(rgba(20,20,19,0.055) 1px, transparent
  1px), linear-gradient(90deg, rgba(20,20,19,0.055) 1px, transparent 1px);
  background-size: 18px 18px; mask-image: radial-gradient(rgb(0,0,0) 0%,
  rgb(0,0,0) 54%, transparent 86%)`;
* the 5 stop cards become `.route-waypoint-card` divs positioned
  `position: absolute; top: 50%; left: 2rem; right: 2rem;
  transform: translateY(calc(-50% + Npx))` (576 wide) — the CENTER-based
  slot (the mirror's top-based 237px slot ≈ the same visual, the 326px
  cards' top lands at 237) with `transition: opacity 120ms linear,
  transform 120ms linear`, `z-index: 5..1`, pointer-events auto/none,
  offsets `(i − idx) × 420px` (idx = progress × (N−1) / 100), opacity
  tent ≈ ±380px;
* the card internals stay the v2.24 contract (the white time pill with
  the per-stop icon, the serif stop title clamp(28px, 5vw, 48px) —
  44px on phones / 48px at md+, lh 1.1, mb 8 — the max-w-md r-28 info
  card, the 20px/600 h3, the 13px #72706A meta, the py-3 Learn More
  pill) — one content delta: the City Gallery's meta reads
  `Rathausplatz · 90 min · € · Culture` (a duration note instead of the
  rating);
* the DESKTOP heading section (`.recommended-route-heading-section
  relative h-[140vh] -mb-[110vh]`) still pins its h2
  (`clamp(38px, 6vw, 72px)`, **line-height 1.05** — was 1) inside a
  `recommended-route-heading-sticky` overlay (`sticky top-0 relative z-20
  flex justify-center`, `min-height: 100vh`, `pt 120px`) that now
  **FADES OUT**: opacity 1 → 0 across ~178px of scroll from the section
  top (measured 1.0 @924, 0.91 @940, 0.57 @1000, 0.23 @1060, 0 @1102) —
  the mirror's heading stays visible over the pinned map until 1832
  (CONFIRMED drift: the mirror's h2 sits at y=120 over the map at scroll
  1300; the live's is gone by 1102);
* phones: the heading section collapses (h-0) and the heading renders
  INSIDE the map trap at `top: 68` (clamp(34px, 11vw, 46px) — computes
  42.9px at 390, same as the mirror's clamp form) — unchanged.

The mirror renders the purple winding-path svg with numbered waypoints.
Remediate: rebuild RecommendedRoute's visuals around the measured Carto
map (tiles + dashed/solid paths + cream waypoints + head dot + md pan),
the split-color progress pill, the graph-paper panel overlay, the
center-based card slot, the heading fade, and the 416.65vh trap.

## F3 — the home stay cards lost the rating badge (SMALL)

The live's home showcase stay cards render NO star badge — the white
`right-4 top-4` pill (Star + rating) is GONE; the rating survives only
in the meta line's `€€ · ★ 4.5`. The mirror (v2.24) renders the badge on
the home variant. Also: the live's pill row `margin-top: 14px` (mirror
mt-3 = 12px) and the reveal transition `opacity 220ms, transform 260ms
cubic-bezier(0.22,1,0.36,1)` with initial ty 18px (mirror: 300ms ease-out
16px). Remediate: drop the badge from the home variant (keep it on the
/stay browse variant — verified still present there), mt-3 → mt-3.5, and
the 18px/220-260ms reveal.

## F4 — the stay booking form's time label changed (SMALL)

The live's STAY place booking form labels the time field
**"Preferred Check-In Time\*"** (eat/do places keep "Time\*").
The mirror labels every form "Time\*". Remediate: thread the category
through BookingForm → BookingTimePicker (label prop), flip browse.spec's
stay pin.

## F5 — INFO (accepted, no code change)

* The restaurants band's floating photos now carry matrix3d tilts +
  a `mix-blend-mode: overlay` canvas layer (z-6, full-viewport sticky) —
  the band's structure (460vh trap, mt −100vh, the fading centered
  heading, the 5-name watermark, the featured card at bottom-9vh, phones'
  sticky deck) is IDENTICAL to the mirror's session-29 model; the photo
  scatter/tilt and the canvas overlay are presentation deltas below the
  pin threshold (the mirror's deterministic scatter is the documented
  equivalent).
* The route heading's fade window (178px) and the restaurants heading's
  fade window (≈28%→52% of the trap, the mirror's 30→45%) — timing
  deltas within the same design.
* The mobile waypoint panel's `mt: −12vh` (the mirror's panel follows the
  trap flush) — a 101px overlap at 844; folded into F2's mobile work.

## TDD execution (R0–R6)

* **R0 (RED)**: tests/e2e/home.spec.ts — flip the category-card pins to
  the fan contract (the wrapper scale, the ±18° fan + hover flatten, the
  in-card clipped View All, the 0.34/0.58 bgs, sat 160%, rows 36px) and
  the route pins to the Carto contract (the tile grid, the dashed base +
  solid progress path, the cream waypoints, the head dot + md pan, the
  split-color pill, the graph-paper overlay, the center-based slot, the
  heading fade); tests/e2e/browse.spec.ts — the stay badge pin flips to
  count 0 + the BookingTimePicker label pin. Expect exactly the touched
  tests RED on the untouched tree.
* **R1 (GREEN)**: `src/components/home/RecommendedRoute.tsx` — the Carto
  map model (both breakpoints) + the pill + the overlay + the card slot +
  the heading fade + the 416.65vh trap + the "90 min" meta note.
* **R2 (GREEN)**: `src/components/home/CategoryCards.tsx` — the fan/deck
  rewrite.
* **R3 (GREEN)**: `src/components/places/StayCard.tsx` (badge + pill
  chrome) + `BookingTimePicker.tsx`/`BookingForm.tsx` (the stay label).
* **R4**: dev-server numeric probes vs the live's measured values (the
  fan transforms at rest + hover, the card geometry, the tile grid, the
  path/waypoint/head values, the pill split, the heading fade samples,
  the mobile map static-pan, the stay badge absence, the stay form's
  label) + the mobile nav re-verification.
* **R5**: re-capture the 19 screenshots (scripts/capture-screens-
  session60.mjs) + align the 9 docs (AGENTS, CLAUDE, README + the
  session-60 history row, PAD v2.25, SKILL, the findings addendum,
  session_60.md, this plan, worklog).
* **R6**: the full gate — lint 0 errors · typecheck ✓ · unit · build ·
  smoke · E2E — then commit + push to main via the SSH wrapper.

## Execution record (session 60, R0–R6 — all GREEN)

- R0 RED verified: the 5 touched test groups (the category fan, the Carto
  map, the five-stops mobile pins, the twelve-stay badge, the browse
  picker/booking labels) failed on the untouched v2.24 tree.
- R1–R3 GREEN: RecommendedRoute.tsx rewritten (the bezier arc-length
  sampler — ROUTE_LENGTH 703.097 vs the live's 703.098), CategoryCards.tsx
  fanned (arbitrary-property transforms), StayCard.tsx de-badged,
  BookingTimePicker label threaded.
- R4: numerically identical to the live (cards within 1-2px; the
  pan/head/progress/pill to 3 decimals; the mobile trap/h2/identity-pan
  exact) + VLM "essentially identical" + the mobile nav re-verified.
- R5: 19 screenshots re-captured + 9 docs aligned (this file among them).
- R6: lint 0 errors · typecheck ✓ · 113/113 unit · build ✓ · 31/31 smoke
  · 94/94 E2E. Committed + pushed to main.
