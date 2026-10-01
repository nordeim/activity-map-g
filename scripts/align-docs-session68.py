#!/usr/bin/env python3
"""Session-68 (v2.29) docs alignment for README.md, AGENTS.md, CLAUDE.md,
Project_Architecture_Document.md, activity-map_SKILL.md and
docs/findings_to_validate_and_update.md. Long-line replacements per the
established pattern (the session-65 script)."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def replace(path, old, new, count=1):
    p = ROOT / path
    text = p.read_text(encoding="utf-8")
    if old not in text:
        print(f"MISS ({path}): {old[:70]!r}")
        return False
    text = text.replace(old, new, count)
    p.write_text(text, encoding="utf-8")
    print(f"ok ({path}): {old[:60]!r} -> ...")
    return True


# ---------------------------------------------------------------- README
ok = True
ok &= replace(
    "README.md",
    "Twenty dev-server captures live in [`docs/screenshots/`](docs/screenshots/) (re-captured session 66 on the v2.28 remediated tree",
    "Twenty-one dev-server captures live in [`docs/screenshots/`](docs/screenshots/) (re-captured session 68 on the v2.29 remediated tree",
)
ok &= replace(
    "README.md",
    "session 66 after the /map basemap + view-model + search-semantics remediation):",
    "session 66 after the /map basemap + view-model + search-semantics remediation, session 68 after the /map frame + events-chip + search-status-pill remediation):",
)
ok &= replace(
    "README.md",
    "map (**the v2.28 keyed light_nolabels basemap at the live's fitted z15 — the same minimal style family as the route map, was Voyager**), place detail",
    "map (**the v2.28 keyed light_nolabels basemap at the live's fitted z15 — the same minimal style family as the route map, was Voyager — now in the v2.29 white 32px-radius frame with the top-right \"0 events · N places\" chip; the dedicated 21-capture: the SEARCH-ACTIVE shell with the violet \"Searching for garden-related options in Augsburg.\" status pill**), place detail",
)
ok &= replace(
    "README.md",
    "Captured via `scripts/capture-screens-session65.mjs` against `npm run start`.",
    "Captured via `scripts/capture-screens-session68.mjs` against `npm run start`.",
)
ok &= replace(
    "README.md",
    "the 620px desktop canvas, bottom stats pills",
    "the 620px desktop canvas (**session 68 / v2.29: the live's WHITE FRAME — `rounded-[32px]` desktop / 28px phones + `border-white/70` + `bg-white` + the `0 18px 44px /0.10` shadow, the frame box 1216×622/358×312 so the inner canvas is 1214×620/356×310 EXACT, and the top-right IN-CANVAS \"0 events · N places\" status chip — a white rounded-full pill with the 6px ink dot, updating with every filter; the mobile search pill fixed to the live's 48px with the 44px input — the old `flex-1` collapsed it to 34px on phones**), bottom stats pills",
)
ok &= replace(
    "README.md",
    "**the v2.28 SUBMIT-DRIVEN search (the live's model: typing never filters — Enter submits; a pill click filters within the visible set with the empty-intersection FALLBACK to the pill-only set — the query resets, the input text stays stale; a query submitted with a pill active is pure AND and can render 0; the 28px clear button resets both)**, and popups linking into place pages",
    "**the v2.28 SUBMIT-DRIVEN search (the live's model: typing never filters — Enter submits; a pill click filters within the visible set with the empty-intersection FALLBACK to the pill-only set — the query resets, the input text stays stale; a query submitted with a pill active is pure AND and can render 0; the 28px clear button resets both)** — **session 68 / v2.29: the live's search STATUS PILL — submitting a query renders a violet pill inside the shell card below the search pill (the live's deterministic pending template \"Searching for {query}-related options in Augsburg.\" + the 11px sparkles icon, bg #F0EAFF, border #D8CAFF, radius 12, 12px/600 #571AFF — the live's resolved text is LLM-generated, non-replicable) and the card RESTRUCTURES to a column [search, status, filter] while the query is active (the desktop card grows 66 → 164)**, and popups linking into place pages",
)
ok &= replace(
    "README.md",
    "Production `next start` on :3100 with its own seeded SQLite file — 109 checks incl. the v2.21 title sweep",
    "Production `next start` on :3100 with its own seeded SQLite file — 114 checks incl. the v2.21 title sweep",
)
ok &= replace(
    "README.md",
    "the v2.27 keyed-tile + no-inset-ramp pins + the v2.28 /map basemap/fitBounds/search-semantics pins",
    "the v2.27 keyed-tile + no-inset-ramp pins + the v2.28 /map basemap/fitBounds/search-semantics pins + the v2.29 /map frame/events-chip/status-pill/mobile-search-pill/gap pins",
)
ok &= replace(
    "README.md",
    "| `npm run build && npm run test:e2e` | 109 | Playwright drives",
    "| `npm run build && npm run test:e2e` | 114 | Playwright drives",
)
ok &= replace(
    "README.md",
    "the count chip + No-places state, the 28px clear button)",
    "the count chip + No-places state, the 28px clear button) + the v2.29 /map pins (the 32px white frame with the exact 620/310 inner canvas, the 0-events chip + its filter updates, the violet search status pill + the column-restructured card, the 48px mobile search pill with the 44px input, the pills→canvas gaps 32px desktop / 44px phones)",
)

# The history table: append the session-68 row after the session-66 row.
readme = (ROOT / "README.md").read_text(encoding="utf-8")
if "v2.29" not in readme.split("## Version History")[0] and "Session 68 audit" not in readme:
    # find the end of the session-66 row (the line ends with ' E2E 102→109 (+7 new tests). |')
    m = re.search(r"(\| Session 66 audit \+ the /map basemap/view-model/search-semantics remediation \(v2\.28\)[^\n]*\|\n)", readme)
    if m:
        row = m.group(1)
        new_row = row + "| Session 68 audit + the /map frame/events-chip/search-status remediation (v2.29) | ✅ Complete | Audited the live vs the redeployed v2.28 mirror (the mirror verified running v2.28 — light_nolabels z15 keyed tiles): the MOBILE NAVIGATION MENU (the task's focus) verified EXACT at 390 on BOTH sites (the tab-bar fixed top (0,0,390,52), the glass, the links x=16/121/192/222/259/304/330/356 at y=4 h=44, 12px Inter −0.12 tracking, the Map/Favourites/Profile taps green — no Tailwind v4 regression; the identity's ELEVENTH measurement holds \"sepnetflix2023\"); hearts 36, stay cards, zoom controls 34×34, pin positions, the count chip, zero console errors all verified holding. FIVE findings, all on the /map surface (`docs/remediation-plan-session-67.md`): (F1) the live's search now renders a violet STATUS PILL inside the shell card while a query is active — the live's deterministic pending template \"Searching for {query}-related options in Augsburg.\" + an 11px sparkles icon, bg #F0EAFF, border #D8CAFF, radius 12, 12px/600 #571AFF, 30px tall, and the card RESTRUCTURES to a column [search, status, filter] (desktop 66 → 164; the resolved text is LLM-generated — non-replicable, documented divergence); (F2) the live's canvas FRAME is `rounded-[32px]` md / 28px phones + `border-white/70` + `bg-white` + the `0 18px 44px /0.10` shadow with the frame box 1216×622/358×312 (the clone's rounded-3xl + border-black/5 + shadow-card left the canvas 2px short); (F3) the pills→canvas gaps (live 32px desktop / 44px phones vs 40/30); (F4) the live's \"0 events · N places\" chip INSIDE the canvas top-right (white pill, 6px ink dot, 12px/600, updating with filters); (F5) a REAL BUG — the clone's mobile search pill rendered 34px (`flex-1`'s flex-basis 0% overrides h-12 in the flex COLUMN; the live's is 48px with a 44px input). Remediated TDD-first (R0: 5 RED pins → R1 GREEN in MapExplorer: the white frame + the events chip + the status pill + the card restructure + the F5 wrapper fix + the spacing retarget) → the mobile frame lands EXACT ([16,497,358,312] vs the live's [16,497,358,312]) → 21 screenshots re-captured + docs aligned; E2E 109→114 (+5 new tests). |\n"
        readme = readme.replace(row, new_row, 1)
        (ROOT / "README.md").write_text(readme, encoding="utf-8")
        print("ok (README.md): session-68 history row appended")
    else:
        print("MISS (README.md): session-66 history row not found")

# ---------------------------------------------------------------- AGENTS.md
ok &= replace(
    "AGENTS.md",
    "| Browser E2E (109 checks; needs a build) | `npm run test:e2e` |",
    "| Browser E2E (114 checks; needs a build) | `npm run test:e2e` |",
)
ok &= replace(
    "AGENTS.md",
    "→ `npm run test` (117) → `npm run build` → `./scripts/smoke-test.sh` (31, all must pass) → `npm run test:e2e` (109 Playwright checks",
    "→ `npm run test` (117) → `npm run build` → `./scripts/smoke-test.sh` (31, all must pass) → `npm run test:e2e` (114 Playwright checks",
)

# AGENTS: the /map contract sentence — append the v2.29 facts to the
# session-66 (v2.28) map sentence.
ag = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
anchor = "the list header carries the live's bare-count white rounded-full px-3 py-1.5 12px/600 COUNT CHIP on the right + the \"No places\" 0-result state; the clear button is the live's 28px (w-7 h-7) disc resetting both states."
if anchor in ag:
    ag = ag.replace(anchor, anchor + " **Session-68 (v2.29): the live's search STATUS PILL + frame + chip — while a query is SUBMITTED the shell card renders a violet pill below the search pill (the row `mt-2 flex items-center gap-2 flex-wrap`; the pill inline-flex gap-1.5 with the 11×11 sparkles icon + 12px/600 #571AFF text at lh 18, bg #F0EAFF, the 1px #D8CAFF border, radius 12, pad 5/10 → 30px tall) carrying the live's deterministic pending template `Searching for {query}-related options in Augsburg.` (the live's RESOLVED text is LLM-generated per query — non-replicable; our deterministic haystack carries the live's own template), and the card RESTRUCTURES to a COLUMN at every breakpoint while the query is active (the search pill + the status row share one `w-full md:flex-1` wrapper, the filter button drops below; the desktop card grows 66 → 164, mobile 138 → 176); the canvas FRAME is the live's WHITE chrome — `rounded-[28px] md:rounded-[32px] border-white/70 bg-white` + the `0 18px 44px /0.10` shadow with the frame BOX at `h-[312px] md:h-[622px]` so the inner canvas is the live's exact 356×310 / 1214×620 (the old `rounded-3xl border-black/5 shadow-card h-[620px]` left the canvas 2px short); a \"0 events · {visible.length} places\" chip (the live's own text — no pluralize-check: \"0 events · 1 places\" measured) rides the canvas top-right (`absolute right-3 top-3 z-[400]`, the white rounded-full pill, the 6px ink dot, `shadow-[0_1px_3px_rgba(14,14,14,0.05),0_4px_16px_rgba(14,14,14,0.07)]`, 12px/600 #141413, updating with every filter); the mobile search pill is the live's 48px with the 44px input — the search row's old `flex-1` set flex-basis: 0% which OVERRIDES h-12 in the parent's flex COLUMN on phones (the row collapsed to 34px; the FLEX-BASIS-OVERRIDES-HEIGHT trap — the wrapper carries `w-full md:flex-1` and the row keeps h-12 + the input h-11); the pills row is LEFT-ALIGNED at mobile (the live's overflowing row starts at x=16 with Sights clipped right — `justify-start md:justify-center`; justify-center center-clipped both ends leaving the first pill unreachable); the pills→canvas gaps are the live's 32px md / 44px phones (the heading section's pb + no mb-2)**", 1)
    (ROOT / "AGENTS.md").write_text(ag, encoding="utf-8")
    print("ok (AGENTS.md): v2.29 map contract appended")
else:
    print("MISS (AGENTS.md): the v2.28 map anchor")

# ---------------------------------------------------------------- CLAUDE.md
ok &= replace(
    "CLAUDE.md",
    "109 checks incl.",
    "114 checks incl.",
)
cl = (ROOT / "CLAUDE.md").read_text(encoding="utf-8")
if "the v2.28 /map basemap/fitBounds/search-semantics pins" in cl:
    cl = cl.replace(
        "the v2.28 /map basemap/fitBounds/search-semantics pins",
        "the v2.28 /map basemap/fitBounds/search-semantics pins + the v2.29 /map frame/events-chip/status-pill/mobile-search-pill pins",
        1,
    )
    (ROOT / "CLAUDE.md").write_text(cl, encoding="utf-8")
    print("ok (CLAUDE.md): e2e pins line updated")
else:
    print("MISS (CLAUDE.md): e2e pins anchor")

# ------------------------------------------------- Project_Architecture_Document
pad = (ROOT / "Project_Architecture_Document.md").read_text(encoding="utf-8")
if "## Revision v2.29" not in pad:
    pad += """

## Revision v2.29 — session 68: the /map frame + events chip + search status pill

The dual-site audit on the redeployed v2.28 mirror (the mirror verified
running v2.28: the keyed light_nolabels z15 tiles) found FIVE gaps, all on
the /map surface — the live evolved its map search UI:

1. **The search STATUS PILL (F1)** — submitting a query renders a violet
   pill inside the shell card, below the search pill: the row
   `mt-2 flex items-center gap-2 flex-wrap`, the pill `inline-flex
   items-center gap-1.5` with the 11×11 lucide-sparkles icon + 12px/600
   `#571AFF` text (lh 18px), bg `#F0EAFF`, the 1px `#D8CAFF` border,
   radius 12, pad 5/10 → 30px tall. The live's PENDING text is the
   deterministic template `Searching for {query}-related options in
   Augsburg.`; its RESOLVED text is LLM-generated per query ("Looking for
   places with a nice garden." / "Finding a great hotel in Augsburg.") —
   non-replicable with a local deterministic search, so the clone carries
   the live's own template while the query is active (documented
   divergence). While a query is active the shell card RESTRUCTURES to a
   COLUMN at every breakpoint: the search pill and the status row share one
   `w-full md:flex-1` wrapper, the filter button drops below (the desktop
   card grows 66 → 164, mobile 138 → 176); the clear button restores the
   rest layout.
2. **The canvas FRAME (F2)** — the live's frame is
   `overflow-hidden rounded-[32px] border border-white/70 bg-white
   shadow-[0_18px_44px_rgba(14,14,14,0.10)]` (radius 28px on phones) with
   the frame BOX at 1216×622 / 358×312 so the inner canvas is the live's
   exact 1214×620 / 356×310. The clone's `rounded-3xl border-black/5
   shadow-card h-[620px]` left the canvas 2px short.
3. **The pills→canvas gaps (F3)** — the live's 32px md / 44px phones (the
   heading section's pb retargeted; the search section's mb-2 removed; the
   mobile pills-row mt 14 → 26 so the pills land at the live's y=409 and
   the frame at the live's y=497 — measured EXACT [16,497,358,312]).
4. **The "0 events · N places" chip (F4)** — the live's in-canvas status
   chip at top-right: `absolute right-3 top-3 z-[400]` white rounded-full
   pill (px-3 py-1.5, the 6px ink dot, the
   `0 1px 3px /0.05 + 0 4px 16px /0.07` shadow, 12px/600 #141413) — the
   live's own text does NOT pluralize-check ("0 events · 1 places"
   measured) and the count updates with every filter.
5. **The mobile search pill collapse (F5, a real bug)** — the clone's
   mobile search pill rendered 34px: the row's `flex-1` sets
   `flex-basis: 0%` which OVERRIDES `h-12` for the main axis in the
   parent's flex COLUMN on phones (the content floor = the 32px icon cell
   + 2px border) with a 20px input. The live's row renders 48px with a
   44px input. Fix: the WRAPPER carries `w-full md:flex-1` (no
   flex-basis override at mobile), the row keeps `h-12`, the input gets
   `h-11`. THE TRAP: `flex-1` + a height utility conflict in the column
   direction — pin heights with content or wrappers, never with flex-1.
   Also: the pills row LEFT-ALIGNS at mobile (`justify-start
   md:justify-center`) — the live's overflowing row starts at x=16 with
   Sights clipped right, while justify-center center-clips both ends
   leaving the first pill unreachable.

TDD: R0 5 RED pins (the frame chrome + the exact inner canvas, the events
chip + its filter updates, the status pill + the card restructure, the
48px mobile search pill, the pills→canvas gaps) → R1 GREEN (MapExplorer:
the white frame, the chip, the status pill, the F5 wrapper fix, the
spacing retarget, the pills-row left-align) → the mobile frame verified
EXACT ([16,497,358,312] both sites) → 21 screenshots + docs → the full
gate: lint 0 · typecheck · 117 unit · 31 smoke · 114/114 E2E (109 → 114).
"""
    (ROOT / "Project_Architecture_Document.md").write_text(pad, encoding="utf-8")
    print("ok (PAD): v2.29 revision appended")
else:
    print("skip (PAD): v2.29 already present")

# ------------------------------------------------------------ SKILL version
skill = (ROOT / "activity-map_SKILL.md").read_text(encoding="utf-8")
skill2 = re.sub(r"version:\s*1\.28\.0", "version: 1.29.0", skill, count=1)
if skill2 != skill:
    (ROOT / "activity-map_SKILL.md").write_text(skill2, encoding="utf-8")
    print("ok (SKILL): 1.28.0 -> 1.29.0")
else:
    print("MISS (SKILL): version 1.28.0 not found")

# ------------------------------------------------ findings addendum
f = ROOT / "docs/findings_to_validate_and_update.md"
ft = f.read_text(encoding="utf-8")
if "## v2.29 addendum" not in ft:
    ft += """

## v2.29 addendum — session 68 (the /map frame + events chip + search status pill)

Validated on the live + the remediated tree:

- The live's /map search is now ASYNC/LLM-POWERED: Enter submits → the
  violet "Searching for {query}-related options in Augsburg." pill
  renders (persisted while the search runs — "brass" never resolved in
  15s) → the pill's text swaps to an LLM-generated intent line
  ("Looking for places with a nice garden.", "Finding a great hotel in
  Augsburg.", "Finding places with beautiful garden settings." — per
  query, per run) and the results filter. The resolved line is
  NON-REPLICABLE (deterministic local haystack); the clone carries the
  live's own pending template while the query is active. The
  viewport-resize RESETS the live's search state (a re-mount).
- The live's canvas frame: `rounded-[32px] md / 28px phones +
  border-white/70 + bg-white + 0 18px 44px /0.10` — the clone's
  rounded-3xl/border-black/5/shadow-card was the session-12 contract,
  superseded.
- The "0 events · N places" chip: the live's own text has NO
  pluralize-check ("0 events · 1 places" measured at 390) and the count
  updates with every filter ("0 events · 3 places" after Restaurants).
- F5 (the mobile search pill): `flex-1` on a row inside a flex COLUMN
  sets flex-basis: 0% which OVERRIDES the height utility for the main
  axis — the row collapsed to its min-content floor (34px). The fix
  pattern: move `flex-1` to a WRAPPER (`w-full md:flex-1`) so the height
  utility applies on the row, and/or pin the height with the CONTENT
  (the input's h-11). This is the third sighting of a
  responsive-flexbox-silently-kills-a-utility bug class on this project
  (the earlier two: the hero z-index cap, the oklab serialization).
- The pills row at mobile: LEFT-aligned overflow (the live's first pill
  at x=16, Sights clipped right, scrollable) — justify-center
  center-clips both ends in Chromium (the first pill unreachable).
"""
    f.write_text(ft, encoding="utf-8")
    print("ok (findings): v2.29 addendum appended")
else:
    print("skip (findings): v2.29 already present")

print("DONE" if ok else "SOME MISSES — check above")
