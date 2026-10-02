# Remediation Plan — Session 73 (v2.32)

Fresh cycle against the operator's redeployed v2.31 mirror
(`docs/start_server_log.txt`: the fresh build + re-seeded db; the mirror
verified running v2.31 from the live DOM — the browse input
[39,·,720,54] with the 20px content-driven desktop input at weight 400
+ the placeholder 500/black-40) + the operator's `docs/session_73.md`
(the session-72 transcript archive).

## The audit (both sites, agent-browser; repo session 74)

Baseline gates on the untouched v2.31 tree: lint 0 errors · typecheck ✓ ·
117/117 unit · build ✓ · 31/31 smoke · 120/120 E2E. The MOBILE
NAVIGATION MENU (the task's focus) verified EXACT at 390 on BOTH sites
(the 52px glass tab-bar (0,0,390,52), the links
x=16/121/192/222/259/304/330/356, the Map/Favourites/Profile taps
green) — NO Tailwind v4 regression (the 15th consecutive verification);
the identity's 14th measurement held "sepnetflix2023" + the email.

Every re-measured surface held EXCEPT the four findings below: the
search-input typed-text model (weight 400 + #141413 + h 44/20 — the
v2.31 fix verified live on the mirror), the map default state (9
markers + "0 events · 9 places" + the 356×310/1214×620 canvases + the
white zero card), the browse orders + ObjectId URLs (no churn), the
home h1 115.2px, the route map's 25 light_nolabels z14 268×268 SVG
tiles (ours keyed 50/50 — the live remains keyless upstream), the route
trap geometry (1163/3333 vs the live's 1164/3333), the place detail
(82px h1 + 34px About + the picker triggers), the desktop nav
x=433/559/639/727/805, the footer growth 646×118 at true max scroll,
the login chrome (renders authenticated; the login placeholders 400 +
slate-600 MATCH — the live's placeholder change is search-input
specific), the favourites h1, the chrome-less profile, the /eat chips
38px/12px/600/pad-10-16, and the sights grid (1120 wide, 360×360,
row-major, same order, the CTA "More Things to Do" dark pill, the
wrapper parallax active on both).

**FOUR findings:**

### F1 — the search-input ::placeholder (LOW, code)

The live's browse + map search-input ::placeholder now computes
**font-weight 400 + color #9CA3AF** (Tailwind gray-400) at BOTH
breakpoints on BOTH surfaces (measured 4× consistently: /eat + /map ×
desktop + mobile × pre/post-typing × fresh-reload; the class strings
unchanged — `min-w-0 flex-1 bg-transparent font-inter text-sm
outline-none`). The v2.31 pin (500 + black/40) captured either a
since-evolved state or a transient. The clone renders 500 + black/40.
FIX: drop `placeholder:font-medium` (inherit the typed 400) and change
`placeholder:text-black/40` → `placeholder:text-[#9CA3AF]` on both
inputs; update the two E2E pins (browse.spec.ts:242-251 + the /map
input-model pin at ~1614).

### F2 — the LLM text family (docs-only)

The pending pill's FOURTH variant: "garden" → "Finding locations
featuring a lovely garden setting." (a full LLM sentence — the family
moved from template variants to free-form). Plus two more observed
LLM texts: the /map nonsense-query state "I could not identify your
search criteria." and the /eat zero-state hint "Try widening your
search" (captured in F3's design). The clone's pinned deterministic
"{query}-related options in Augsburg." stays. No code change — the
divergence notes gain the fourth variant + the LLM-error-text note.

### F3 — the browse ZERO STATE (MEDIUM, code)

The live's zero state (measured on /eat + /stay + /do — all three):
a white card INSIDE the results grid (`rounded-[28px] bg-white py-16
text-center md:col-span-2 lg:col-span-3` — [32,·,1216,194] desktop /
[16,·,358,194] mobile, NO shadow, NO icon, NO button) with the title
"No {restaurants|hotels|experiences} found" (Inter 20px/400 #0E0E0E
lh 28) + the hint "Try widening your search" (Inter 14px/400 #888580
lh 20, 4px below the title). The clone renders an invented card
(OUTSIDE the grid with mt-6 + shadow-card, a 48px icon disc, a serif
24px "No matches", different copy, a "Reset filters" button). No
existing E2E pin covers the old zero state. FIX: re-render
CategoryExplorer's zero state as the live's design; the category name
map: eat → restaurants, stay → hotels, do → experiences.

### F4 — the "Choose Your Vibe" showcase restructure (HIGH, code)

The live's showcase is now a STICKY-HEADING + PASS-THROUGH architecture
(structure verified stable across reloads, time, and scroll states):

```
SECTION (relative, bg cream, 2632 tall at 1280)
├── DIV absolute inset-0 — the 18px graph-paper texture at opacity 0.36
├── DIV md:sticky md:top-0 md:h-screen (relative + auto at mobile)
│   └── pt-88/px-18 (mobile: pt-48/px-18/pb-18): h2 (LetterReveal) + subtitle
└── SECTION (the grid section)
    └── pt-112/px-51.2-centering/pb-144 (mobile: pt-20/px-18/pb-56)
        └── UL grid-cols-3 — 3 column wrappers × 4 cards, 381×381, 18px gaps
```

- The heading PINS at viewport y 88 (measured constant across scroll
  7400→9000; the sticky releases at scroll 9215) while the grid slides
  up and PAINTS OVER it (the nested section comes later in DOM order;
  verified by screenshot: the cards cover the pinned h2).
- **The FAN IS GONE** — no middle-column raise, no card fanning/
  rotation: every column + card transform is identity at every scroll
  (the session-61/63 choreography is retired on the live).
- The stay-img parallax REMAINS: scale(1.16) + ty interpolating +34.6
  far-below → −35.9 clamped (±8% of the 449px LAYOUT height — the
  clone's driver computes ±8% of the TRANSFORMED rect → ±45; fix the
  max to `offsetHeight`-based).
- The 12 stays' content/order/geometry unchanged (col-major 0-3/4-7/
  8-11, 381×381, 399 pitch) — the clone already matches.
- The sights section also gains its own pt-144 desktop / pt-48 mobile
  (the live stacks the vibe's pb-144 + the sights' pt-144 = 283px
  between the grid end and the sights h2; the clone renders 143px).

FIX (StayShowcase.tsx + HighlightedSights.tsx):
1. Restructure the vibe section: [texture layer] + [sticky vh heading]
   + [nested grid section (pt-112/pb-144 desktop, pt-20/pb-56 mobile)]
   with the mobile heading pt-48/pb-18 (the old section-level pt-112
   retires).
2. Remove the fan driver + the data-fan-card transforms (keep the 3
   li column wrappers for the col-major distribution — the live keeps
   them too).
3. Keep the stay-img parallax but compute max from offsetHeight.
4. Rewrite the 3 fan E2E pins (session-61 fan/stagger, session-61
   mobile-off, session-63 ramp) into the NEW contract pins: the static
   grid (identity transforms at every scroll + the 12 cards/3 cols)
   + the sticky heading (pins at 88 mid-section, releases at the end)
   + the section geometry (sticky 800 + grid 1576 + pads = 2632).

## The TDD sequence

- **R0 RED**: write the new pins first — (a) the browse placeholder
  (400 + #9CA3AF), (b) the /map placeholder, (c) the /eat + /stay +
  /do zero-state cards, (d) the vibe sticky/static structure, (e) the
  fan-retirement pin (identity transforms) — verified failing on the
  untouched v2.31 tree.
- **R1 GREEN**: the four code changes above.
- **R2**: the dev-server probe verification (both breakpoints, both
  sites' numbers), then the full gate: lint → typecheck → 117 unit →
  build → 31 smoke → the E2E suite (the count will change: the 3 fan
  pins retire, the new pins land).
- **R3**: the screenshot re-capture (scripts/capture-screens-session74.mjs).
- **R4**: docs alignment (README, AGENTS, CLAUDE, PAD, SKILL, the
  findings register, docs/session_74.md, the worklog).
- **R5**: commit + push via the SSH wrapper.
