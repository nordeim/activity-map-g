#!/usr/bin/env python3
# Session-74 (v2.32) docs alignment — README, AGENTS, CLAUDE, PAD, SKILL,
# the findings register. Each replacement asserts its anchor exists.
import sys

def apply(path, edits):
    with open(path) as f:
        src = f.read()
    for old, new in edits:
        if old not in src:
            print(f"MISS in {path}: {old[:90]!r}")
            sys.exit(1)
        if src.count(old) > 1:
            print(f"AMBIGUOUS in {path} ({src.count(old)}x): {old[:90]!r}")
            sys.exit(1)
        src = src.replace(old, new)
    with open(path, "w") as f:
        f.write(src)
    print(f"OK {path} ({len(edits)} edits)")

# ---------------- README.md ----------------
apply("README.md", [
    ("re-captured session 72 on the v2.31 remediated tree",
     "re-captured session 74 on the v2.32 remediated tree"),
    ("session 70 after the browse-pill + zero-state + card-order remediation): the desktop home",
     "session 70 after the browse-pill + zero-state + card-order remediation, session 72 after the search-input model remediation, session 74 after the sticky-vibe + zero-state + placeholder remediation): the desktop home"),
    ("stays vibe — **the v2.25 badge-free home stay cards + the v2.26 STAGGERED FANNING grid (the dedicated 20-capture: the outer cards at ±6°, the middle column raised)**, sights)",
     "stays vibe — **the v2.25 badge-free home stay cards + the v2.32 STICKY-PINNED heading over the STATIC twelve-card grid (the dedicated 04-capture: the h2 pinned at viewport y 88 with the grid entering; the dedicated 20-capture: the PASS-THROUGH state — the cards painting over the pinned heading; was the v2.26 fanning grid until the live retired it)**, sights)"),
    ("Captured via `scripts/capture-screens-session72.mjs` against `npm run start`.",
     "Captured via `scripts/capture-screens-session74.mjs` against `npm run start`."),
    ("""The showcase image parallax is DESKTOP-ONLY (phones compute transform: none — the 118% fill is pure layout) |""",
     """The showcase image parallax is DESKTOP-ONLY (phones compute transform: none — the 118% fill is pure layout; session 74 / v2.32: the parallax max is ±8% of the LAYOUT height via offsetHeight — the rect-based ±45 corrected to the live's ±35.9). **Session-74 (v2.32): the live RETIRED the fan and rebuilt the section as a STICKY-HEADING + PASS-THROUGH architecture** — the section (relative, cream bg, the 18px graph-paper texture at 0.36) renders [an absolute texture layer] + [a vh-tall `md:sticky md:top-0` heading block (pt-88/px-18; the h2 PINS at viewport y 88 while the grid scrolls up and PAINTS OVER it — the nested grid section wins the DOM paint order; below md the heading is relative with pt-48/pb-18, no pin)] + [the nested grid section: pt-112 / the 1178 centered grid / pb-144 (mobile: pt-20 / pb-56)] with the grid STATIC — the 3 `li[data-fan-col]` column wrappers stay (the col-major distribution) but the fan driver + card transforms are DELETED (identity at every scroll; the middle column never rises, the cards never rotate). The section totals 2632 at 1280 (800 sticky + 112 + 1576 + 144 — the live's own numbers); the sights section beneath gained its own pt-144 (md) / pt-48 (mobile) |"""),
    ("""Session 72 (v2.31): the search INPUT re-aligned to the live's computed model — 44px below md but CONTENT-DRIVEN ~20px at md+ (`h-11 md:h-auto`, safe under the pill's min-h-54), the typed text at font-weight 400 in #141413 (no font-medium), the ::placeholder overriding to 500 + black/40** |""",
     """Session 72 (v2.31): the search INPUT re-aligned to the live's computed model — 44px below md but CONTENT-DRIVEN ~20px at md+ (`h-11 md:h-auto`, safe under the pill's min-h-54), the typed text at font-weight 400 in #141413 (no font-medium), the ::placeholder overriding to 500 + black/40. Session 74 (v2.32): the ::placeholder re-measured at 400 + #9CA3AF (Tailwind gray-400, the SAME weight as the typed text — the v2.31 500/black-40 pin captured a since-evolved state; re-measured 4× consistently on /eat + /map at both breakpoints), and the ZERO STATE re-rendered as the live's design — a white `rounded-[28px] bg-white py-16 text-center md:col-span-2 lg:col-span-3` spanning cell INSIDE the results grid (NO shadow, NO icon, NO button) carrying the category-aware title "No {restaurants|hotels|experiences} found" (Inter 20px/400 #0E0E0E lh 28) + the hint "Try widening your search" (Inter 14px/400 #888580, 4px below)** |"""),
    ("""session 72 / v2.31: the input is `h-11 md:h-auto` — 44px below md, content-driven ~20px at md+, safe under the row's h-12 — with the typed text at weight 400**""",
     """session 72 / v2.31: the input is `h-11 md:h-auto` — 44px below md, content-driven ~20px at md+, safe under the row's h-12 — with the typed text at weight 400; session 74 / v2.32: the ::placeholder re-measured at 400 + #9CA3AF like the browse input's**"""),
    ("""| E2E tests | Playwright | 1.63 | Production `next start` on :3100 with its own seeded SQLite file — 120 checks incl. the v2.21 title sweep + login-stay pins + the v2.22 booking-picker contracts + the v2.26 staggered-fan/heart/parallax pins + the v2.27 keyed-tile + no-inset-ramp pins + the v2.28 /map basemap/fitBounds/search-semantics pins + the v2.29 /map frame/events-chip/status-pill/mobile-search-pill/gap pins + the v2.30 browse-pill/zero-card/card-order pins + the v2.31 input-weight/height-model pins |""",
     """| E2E tests | Playwright | 1.63 | Production `next start` on :3100 with its own seeded SQLite file — 122 checks incl. the v2.21 title sweep + login-stay pins + the v2.22 booking-picker contracts + the v2.26 heart/parallax pins + the v2.27 keyed-tile pins + the v2.28 /map basemap/fitBounds/search-semantics pins + the v2.29 /map frame/events-chip/status-pill/mobile-search-pill/gap pins + the v2.30 browse-pill/zero-card/card-order pins + the v2.31 input-weight/height-model pins + the v2.32 sticky-vibe/static-grid/zero-state/placeholder pins (the v2.26 fan pins retired with the fan) |"""),
    ("""| E2E | `npm run build && npm run test:e2e` | 120 | Playwright drives `next start` on :3100 with its own seeded SQLite file (`db/e2e.db`)""",
     """| E2E | `npm run build && npm run test:e2e` | 122 | Playwright drives `next start` on :3100 with its own seeded SQLite file (`db/e2e.db`)"""),
    ("""+ the v2.31 pins (the input's computed model: content-driven ~20px at md+ / 44px below md, typed text weight 400, placeholder 500 + black/40) |""",
     """+ the v2.31 pins (the input's computed model: content-driven ~20px at md+ / 44px below md, typed text weight 400) + the v2.32 pins (the ::placeholder at 400 + #9CA3AF on both search inputs, the browse zero-state spanning card with the category titles + hint on all three browses, the vibe heading's sticky pin at viewport y 88 + the static identity-transform grid + the mobile pt-48/pt-20 contract, the sights section's own pt-144/pt-48; the v2.26 fan/stagger + v2.27-ramp pins RETIRED with the fan; the footer grown-state park re-targeted to the true max scroll) |"""),
    ("""| 🏛 **Highlighted Sights** | Six calm stops (Fuggerei → Schaezlerpalais) as square photo cards with white overlaid titles (24px mob / 18px dsk), in-card meta overlays, heart + rating pills, and the dark More Things to Do hand-off (session-8) |""",
     """| 🏛 **Highlighted Sights** | Six calm stops (Fuggerei → Schaezlerpalais) as square photo cards with white overlaid titles (24px mob / 18px dsk), in-card meta overlays, heart + rating pills, and the dark More Things to Do hand-off (session-8). Session-74 (v2.32): the section carries its OWN top padding — pt-144 at md / pt-48 on phones — stacked after the vibe grid section's pb (the live's grid-end → h2 gap: 283px at 1280 / 104px at 390) |"""),
    # The session status table — add the session-74 row after the session-72 row
    ("""| Session 72 audit + the search-input model remediation (v2.31) | ✅ Complete |""",
     """| Session 74 audit + the sticky-vibe restructure + zero-state + placeholder remediation (v2.32) | ✅ Complete | Audited the live vs the operator's redeployed v2.31 mirror (verified running v2.31 from the live DOM — the browse input's 20px content-driven desktop model): the MOBILE NAVIGATION MENU (the task's focus) verified EXACT at 390 on BOTH sites — the 15th consecutive verification, no Tailwind v4 regression; the identity's 14th measurement held "sepnetflix2023"; every prior surface re-verified (the map default state, the browse orders + ObjectId URLs, the route's 25 SVG light_nolabels z14 tiles at 268×268 on both sites, the detail/login/favourites/profile/chips, the footer 646×118). FOUR findings (`docs/remediation-plan-session-73.md`): (F1) the search-input ::placeholder now computes 400 + #9CA3AF (the v2.31 500/black-40 was a since-evolved state); (F2, docs-only) the pending pill's FOURTH LLM variant ("Finding locations featuring a lovely garden setting.") + the /map nonsense-query LLM message; (F3) the browse zero state is the live's white spanning card ("No restaurants found" + "Try widening your search" — the clone's icon/serif/Reset-filters card was an invention); (F4) the live RETIRED the v2.26 fan and rebuilt the vibe showcase as a STICKY-HEADING + PASS-THROUGH architecture (the h2 pins at viewport y 88 while the static grid scrolls up and paints over it) + the sights section's own pt-144/pt-48. TDD: 7 RED pins → GREEN (placeholder + zero state + 4 structure pins) + the footer snap-to-grown at the document end + the parallax amplitude fix (offsetHeight); 33/33 R2 probe checks; the full gate re-verified (117 unit · 31 smoke · 122 E2E — the fan pins retired); 22 screenshots re-captured (the 04/20 captures now the pin + pass-through states); docs aligned |
| Session 72 audit + the search-input model remediation (v2.31) | ✅ Complete |"""),
])

print("README done")

# ---------------- AGENTS.md ----------------
apply("AGENTS.md", [
    ("**Session-62 (v2.26): the stay GRID became a staggered fanning grid on md+**",
     """**Session-74 (v2.32): the live RETIRED the v2.26 fan — the stay showcase is now a STICKY-HEADING + PASS-THROUGH architecture** (re-measured on the live, the structure stable across reloads): the section (relative, cream bg) renders [an absolute 18px graph-paper texture at 0.36] + [a `md:sticky md:top-0 md:h-screen` heading block — pt-88/px-18 (mobile: relative, pt-48/px-18/pb-18, no pin) — whose h2 PINS at viewport y 88 from scroll sectionTop to sectionTop+1832 while the grid scrolls up and PAINTS OVER it (the nested grid section follows in DOM order and wins the paint)] + [the nested grid section: pt-112 / the 1178 centered ul / pb-144 (mobile: pt-20/px-18/pb-56)] — the grid renders STATICALLY (the 3 li[data-fan-col] column wrappers stay for the col-major 12-card distribution; the fan driver + the data-fan-card transforms are DELETED — every transform identity at every scroll, the columns never rise); the stay-img parallax REMAINS (scale 1.16 + ty ±8% of the LAYOUT height — useParallax reads offsetHeight for the max, ±35.9 at 449 layout px) and the sights section beneath carries its own pt-144 (md) / pt-48 (mobile). **Historical: the v2.26 fan**"""),
    ("the **Highlighted Sights** grid",
     "the **Highlighted Sights** grid (v2.32: its own pt-144/pt-48 below the vibe grid's pb)"),
    # The planner input contract
    ("session-72 (v2.31): the INPUT is `h-11 md:h-auto` — 44px below md, CONTENT-DRIVEN ~20px at md+ (safe ONLY because the pill's min-h carries the row — the B11 corollary), the typed text at font-weight 400 in #141413, the ::placeholder overriding to 500 + black/40 (the live's own split; the map's search input follows the same model under its h-12 row)**)",
     "session-72 (v2.31): the INPUT is `h-11 md:h-auto` — 44px below md, CONTENT-DRIVEN ~20px at md+ (safe ONLY because the pill's min-h carries the row — the B11 corollary), the typed text at font-weight 400 in #141413; session-74 (v2.32): the ::placeholder computes 400 + #9CA3AF (gray-400 — the SAME weight as the typed text; the v2.31 500/black-40 was a since-evolved live state; the map's search input follows the same model under its h-12 row)**)"),
    # The E2E gate count
    ("npm run test:e2e` (120 Playwright checks",
     "npm run test:e2e` (122 Playwright checks"),
])

print("AGENTS done")

print("core docs done")
