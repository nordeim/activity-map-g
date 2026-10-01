# Session 58 — the profile GLASS refresh + the browse-shell chrome re-alignment (v2.24)

Date: 2026-10-01 · Agent: coding specialist (session 58 — the repo's own
numbering; the operator's `docs/session_57.md` is the raw session-56
narrative; the plan is `docs/remediation-plan-session-57.md`)

## 1. Context

Workspace refreshed at `881f07a` (main = the v2.23 tree `66698f6` + the
operator's `docs/session_57.md` + `docs/ssh.sh` + the redeploy
`docs/start_server_log.txt` — the mirror redeployed from the v2.23 tree
2026-10-01 ~14:08 +0800). Every root doc re-read (AGENTS.md, CLAUDE.md,
README.md, the PAD v2.23, activity-map_SKILL.md v1.22.9) plus the session
history (`docs/session_56.md`, `docs/remediation-plan-session-55.md`,
`worklog.md`, `docs/session_57.md`, `docs/start_server_log.txt`). The v2.23
range (`25144c9..66698f6`) re-audited file-by-file (BookingDatePicker,
BookingTimePicker, BookingForm, the flipped browse.spec pins) — the shipped
chrome is sound. Skills consulted from the repo's `skills/skills-catalog.md`:
agent-browser (the dual-site audit driver), clone-app-pat-pro
(computed-style ground truth), tdd (the RED→GREEN loop), nextjs16-tailwind4
(the mobile-nav failure taxonomy), code-review-checklist (the range audit).
`skills/` excluded from code checking, testing, and compilation.

## 2. Baseline gates (the untouched tree)

lint ✓ (0 errors, the 2 pre-existing script warnings) · typecheck ✓ ·
**113/113 unit** ✓ · build ✓ (22 routes) · **31/31 smoke** ✓ · **93/93
E2E** ✓ — matching the session-56 records exactly. `.env` with
`DATABASE_URL="file:../db/custom.db"` (the `db/` folder at the repo root,
the 118784-byte seeded `db/custom.db`); Vitest + Playwright configs verified
in place; `.env.example` tracked and matching.

## 3. The dual-site audit (the redeployed v2.23 mirror vs the live source)

| Surface | Result |
|---------|--------|
| Mirror deployment state (v2.23) | The redeployed mirror IS running v2.23: the month row's two-child layout, the 700 select, the uppercase 1.2px weekday row, the label-derived trigger names. |
| Mobile navigation menu (the task's focus) | The tab bar at 390 EXACT on BOTH sites: the 52px cream-glass bar (0.62 tint + blur 24 + saturate 1.5 + the 1px border-b), links x=121/192/222/259, icons x=304/330/356 @18px. Taps verified on the mirror (Map → /map, Heart → /favourites, Profile → /profile). The mobile FOOTER nav grid (2×3, 104×78 cells, r-28) also EXACT on both. **The mobile menu works exactly as expected — NO Tailwind v4 regression.** |
| Desktop nav / footer / home | Desktop nav 433/559/639/727/805 + heart 957 + avatar 1001 IDENTICAL; the grown footer pill 646×118 r-34 IDENTICAL; the hero h1 y=290 115.2px + the photo BYTE-IDENTICAL (md5 `5058794d…` re-verified by download); the home category-card classes IDENTICAL (incl. the 28px blur + the inset highlight); the home planner VLM-verified same. |
| Identity (the volatile surface) | The SEVENTH authenticated measurement: the live settles at "sepnetflix2023" + the email subtitle (the h1 first paints a transient "Roam" pre-hydration skeleton — a base44 loading artifact, not the contract). The mirror's guest surfaces intact. |
| The v2.23 picker chrome | Verified INTACT on the live (the form's `mt-6 space-y-4 font-inter`, no aria-label, the two-child month row, the 700 select) — no drift. |
| Titles / console | The 11-route title sweep exact; zero console/page errors on both sites. |
| **The profile page** | **CHROME GAPS (F1–F11).** The live's profile evolved into a GLASS design (backdrop-blur, compound inset-highlight shadows, hover-lift inverts) that the mirror predates — details in the plan's §3. Notably: the live's `bg-white/78` class DOES NOT COMPUTE (its CDN skips the non-standard /78 step — the rendered card is TRANSPARENT + the blur frosting; the mirror's applying tint rendered 6 RGB points too white). |
| **The browse/map/favourites headings + the planner shell** | **GAPS (F12–F15).** The live's subtitles gained the centered `max-w-xl` block (the phones compute mt 14 + the text inset x=40 — the live's CDN computes its `mt-6` as 14px and its `mx-auto` as 24px margins on phones); the map + favourites h1s adopt the browse clamp form (50.7px on phones); the planner's second icon button swapped map-pin → the MAP glyph (VLM-caught) with the inset-highlight chrome; the chips row's first chip sits at x=16. |

## 4. The TDD remediation (R0–R6)

- **R0 RED** (8 tests RED against the untouched tree, verified by run):
  the "Upcoming (" label flip (no space), the centering-pin flip to the
  H1's own computed text-align, and the new chrome pins — the identity
  card's 896px width/x=192/blur(24px)/TRANSPARENT bg/inset shadow, the
  55px + lh-50.6 mobile h1, the 14px→16px subtitle with mt-20, the
  18px-radius tabs + the no-space label + the active shadow + the
  #141413/#72706A states, the cream-pill count, the pills' borders +
  blurs, the violet Saved-places hover, the 600-weight chips with the
  13px stroke-2 icons, the 0.18em eyebrow, the -0.05em h2, the subtitle
  mt/max-w/x pins at both viewports on all five heading pages, the
  MAP-glyph buttons with the inset shadow + the cream/55 bg, the planner
  card's inset shadows at both breakpoints, the 48px md buttons, and the
  chips row's x=16.
- **R1 GREEN** `ProfileView.tsx`: the page div carries the padding (the
  main at bare max-w-4xl — both cards span the full 896px at md); the
  identity card `overflow-hidden rounded-[36px] border border-white/70 p-5
  text-center shadow-[0_18px_44px_rgba(14,14,14,0.10),inset_0_1px_0_rgba(255,255,255,0.70)]
  backdrop-blur-[24px] md:p-8 md:text-left` (the bg tint DROPPED — the
  live's computed transparent contract, pixel-verified); the h1
  `text-[55px] font-normal leading-[0.92] md:text-[72px]`; the subtitle
  `mt-5 max-w-xl font-inter text-sm leading-7 text-[#555550] md:text-base`;
  the chips `inline-flex py-2 bg-[#F8F7F4] font-inter text-xs
  font-semibold text-[#555550]` with the 13px stroke-2 icons; the EYEBROW
  `font-inter tracking-[0.18em] text-[#72706A]`; the glass Go-back +
  Sign-out pills (border `rgba(0,0,0,0.06)` + `0 8 22 /0.08` +
  backdrop-blur-xl + the hover lift + invert to #141413); the
  Saved-places Link's VIOLET hover (`hover:bg-[#571AFF]` + lift + the
  `0 12 28 /0.18` base shadow); the bookings card `p-5 shadow 0 14 34
  /0.08 backdrop-blur-[20px] md:p-7` (bg dropped); the tabs
  `rounded-[18px] gap-1.5 font-inter transition-all duration-300
  ease-out` + the active `bg-white text-[#141413] shadow 0 8 18 /0.08` /
  inactive `text-[#72706A]` + the "Upcoming(N)" no-space labels; the
  cream-pill count; the h2 `mt-1 tracking-[-0.05em]`; the filters' violet
  lift hover.
- **R2 GREEN** the headings: `CategoryExplorer.tsx` + `FavouritesView.tsx`
  + `MapExplorer.tsx` — the h1s `text-[clamp(42px,13vw,55px)] font-normal
  leading-[0.92]` with NO own margin (the map + favourites h1s adopt the
  browse form: 50.7px on phones); the subtitles `mx-auto mt-3.5 max-w-xl
  px-6 font-inter text-sm text-[#3A3A3A] md:mt-6 md:px-0` (computed: a
  centered 576px block at md with mt-24; phones mt-14 + the text inset
  x=40 wrapping at 310px).
- **R3 GREEN** `BrowsePlanner.tsx`: the icon buttons' GLASS chrome
  (`border-[rgba(0,0,0,0.05)] bg-[rgba(248,247,244,0.55)]
  shadow-[inset_0_1px_0_rgba(255,255,255,0.70)]` + the dark hover with
  lift/scale; both icons stroke 2; the second glyph MapPin → **Map**);
  the planner card's shadows + the inset highlight at both breakpoints.
  `CategoryExplorer.tsx`: the chips row's inner `px-1` → `px-4` (the
  first chip at x=16).
- **R4 verification**: reseeded; the dev-server DOM probes match the live
  NUMERICALLY — the identity card 896 @x=192 + blur(24px) + the
  PIXEL-SAMPLED interior (248,247,244) identical to the live (the
  transparent-bg fix verified by pixel sampling); the h1 55/72 with lh
  50.6/66.24 @390/1280; the subtitle 14/16 mt-20; the tabs 18px + the
  no-space label; the count cream pill; the eat sub y=244 @1280 / 219
  @390 with mt-14 + the text x=47 on BOTH sites (2 lines both); the
  chips x=16; the map-glyph buttons 56/48px @390/1280; the booking
  round-trip still green (the range + 19:00 + the `#2A6B3A` note + the
  VISUAL reset); the mobile nav taps still green; a matched-state VLM
  comparison returned "essentially identical" (the profile) — and a
  first-pass VLM claim (the eat subtitle "5 lines") was disproved by the
  numeric probes (2 lines on both — the numbers are the ground truth).
- **R5**: 19 screenshots re-captured
  (`scripts/capture-screens-session58.mjs`); 9 docs aligned (AGENTS,
  CLAUDE, README + the history row, PAD v2.24, SKILL v1.23.0, the
  findings v2.24 addendum, `docs/session_58.md`, this plan, the worklog).
- **R6 the final full gate**: lint 0 errors · typecheck ✓ · **113/113
  unit** · build ✓ · **31/31 smoke** · **93/93 E2E** — green.

## 5. En-route lessons (recorded for the next audit)

- The live's Tailwind-CDN silently skips NON-STANDARD opacity steps:
  `bg-white/78` does not generate (the rendered card is transparent) —
  always verify the COMPUTED backgroundColor, not the class string, on
  fractional-alpha utilities.
- The live's CDN also computes responsive utilities oddly on phones
  (`mt-6` → 14px, `mx-auto` → 24px margins, `text-[55px]` → 50.7px on
  the browse/map/favourites h1s but a REAL 55px on the profile h1 whose
  class carries the `md:text-[72px]` override) — the mirror pins the
  COMPUTED result and documents the quirk.
- A first-paint "Roam" h1 on the live's profile + home is the
  pre-hydration skeleton, not an identity oscillation — wait for the
  settle (the 7th measurement held once settled).
- The VLM can miscount text lines/spacing across screenshots (it claimed
  5 lines vs the measured 2) — the computed-style + numeric geometry
  comparison stays the ground truth; the matched-state VLM then
  confirmed the fix.
- Pin centering contracts on the ELEMENT's own computed text-align (the
  live's card carries no `text-center` — an inner wrapper owns it; a
  section-level pin breaks when the class moves).

## 6. The push

Single conventional commit `fix(parity): profile glass refresh +
browse-shell chrome (v2.24)` on main (no branches) via
`docs/ssh_git_wrapper_v3.py`; the operator key shredded post-push.
