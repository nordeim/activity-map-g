# Session 57 — Remediation Plan (the profile glass refresh + the browse-shell chrome re-alignment, v2.24)

Date: 2026-10-01 · Agent: coding specialist (session 58 — the repo's own
numbering; the operator's `docs/session_57.md` is the raw session-56
narrative)

## 1. Context

Workspace refreshed from `https://github.com/nordeim/activity-map-g.git` at
`881f07a` (main = the v2.23 tree `66698f6` + the operator's
`docs/session_57.md` + `docs/ssh.sh` + the redeploy
`docs/start_server_log.txt` — the mirror redeployed from the v2.23 tree
2026-10-01 ~14:08 +0800). Every root doc re-read (AGENTS.md, CLAUDE.md,
README.md, the PAD v2.23, activity-map_SKILL.md v1.22.9) plus the session
history (`docs/session_56.md`, `docs/remediation-plan-session-55.md`,
`worklog.md`, `docs/session_57.md`, `docs/start_server_log.txt`). The v2.23
range (`25144c9..66698f6`) re-audited file-by-file (BookingDatePicker,
BookingTimePicker, BookingForm, the flipped browse.spec pins) — the shipped
chrome is sound. Skills consulted from the repo's `skills/skills-catalog.md`:
`agent-browser` (the dual-site audit driver), `clone-app-pat-pro`
(computed-style ground truth), `tdd` (the RED→GREEN loop),
`nextjs16-tailwind4` (the mobile-nav failure taxonomy),
`code-review-checklist` (the range audit). The `skills/` folder stays
excluded from code checking, testing, and compilation (tsconfig + ESLint
already exclude it).

Baseline gates on the untouched tree (all green before any edit): lint ✓
(0 errors, the 2 pre-existing script warnings) · typecheck ✓ · **113/113
unit** ✓ · build ✓ (22 routes) · **31/31 smoke** ✓ · **93/93 E2E** ✓.
Environment: `.env` with `DATABASE_URL="file:../db/custom.db"` (the `db/`
folder at the repo root, the 118784-byte seeded `db/custom.db`; the npm
scripts pin the URL inline; `src/lib/db-path.ts` resolves it). Vitest +
Playwright configs verified in place. `.env.example` tracked and matching.

## 2. Audit results (dual-site browser: the redeployed v2.23 mirror vs the live source)

| Surface | Result |
|---------|--------|
| Mirror deployment state (v2.23) | The redeployed mirror IS running v2.23: the booking picker's month row carries the two-child layout (the `relative flex-1` wrapper + the calendar icon LAST), the 700 select, the uppercase 1.2px weekday row, the 42-cell grid, the label-derived "Dates*"/"Time*" trigger names. |
| Mobile navigation menu (the task's focus) | The tab bar at 390×844 EXACT on BOTH sites: the 52px border-box cream-glass bar (rgba(248,247,244,0.62) + blur(24px) saturate(1.5) + the 1px border-b), text links x=121/192/222/259, right-cluster icons x=304/330/356 @18px. Taps verified on the mirror: Map → /map ("Discover" title), Heart → /favourites, Profile → /profile (bare, "Profile" title). **The mobile menu works exactly as expected — NO Tailwind v4 regression.** The mobile FOOTER nav grid also EXACT on both (2×3, 104×78 cells, 20px icons, r-28, pad 8/10, gap 8 — the mirror's `grid-cols-3` vs the live's `flex-wrap` compute identically). |
| Desktop nav / footer / home | Desktop nav 433/559/639/727/805 + heart 957 + avatar 1001 (the live "S") IDENTICAL. The grown desktop footer pill 646×118 r-34 pad 12/16 gap 12 cells 92×92 IDENTICAL. The home hero h1 y=290 115.2px + the hero photo BYTE-IDENTICAL (md5 `5058794d…` both, re-verified by download). The home category-card classes IDENTICAL (incl. the 28px blur + inset highlight). The home planner VLM-verified same. |
| Identity (the volatile surface) | The SEVENTH authenticated measurement: the live settles at "sepnetflix2023" + the email subtitle (the h1 first paints a transient "Roam" skeleton pre-hydration — a base44 loading artifact, not the contract). The mirror's guest surfaces intact ("Explorer" + "Your Roam account"). |
| Titles / console | The 11-route title sweep exact. Zero console/page errors on both sites. |
| Booking picker | The v2.23 chrome verified INTACT on the live (the form's `mt-6 space-y-4 font-inter`, no aria-label, the two-child month row, the 700 select) — no drift. |
| **The profile page** | **CHROME GAPS (F1–F11).** The live's profile has evolved into a GLASS design (backdrop-blur, compound inset-highlight shadows, hover-lift inverts) that the mirror predates. Details in §3. |
| **The browse/map/favourites headings + the planner shell** | **GAPS (F12–F15).** The live's subtitles gained `mx-auto mt-6 max-w-xl` centering + a mobile inset; the planner's icon buttons swapped the map-pin for the MAP glyph + gained the border/inset chrome; the chips row's first chip sits at x=16 (not 4). VLM-confirmed visible. |

## 3. Findings

All measurements taken 2026-10-01 on the live (profile: `/profile`;
browse: `/eat`/`/stay`/`/do`; map: `/map`; favourites: `/favourites`) at 390
and 1280; every class below is verbatim from the live's DOM. Computed values
are the parity bar (the live's Tailwind-CDN quirk computes `mt-6` as 14px and
`mx-auto` as 24px margins on phones — the mirror matches the COMPUTED
result, not the class string).

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| F1 | **Med** | **The identity h1's responsive size + line-height.** The live: `text-[55px] font-normal leading-[0.92] tracking-[-0.06em] text-[#0E0E0E] md:text-[72px]` — 55px/lh 50.6 @390, 72px/lh 66.24 @1280. The mirror: `text-[clamp(42px,9vw,72px)] leading-[0.98]` — 42px @390 (13px too small), lh 70.56 @1280. | Live h1 class + computed sizes at both viewports. Mirror: `ProfileView.tsx:140`. |
| F2 | **Med** | **The page's PADDING MODEL.** The live wraps the main in a page div carrying the padding: `min-h-screen px-5 pb-24 pt-10 md:px-8 md:pt-16` > `main.relative mx-auto max-w-4xl` (NO padding) — so the identity card spans the FULL 896px @1280 (x=192). The mirror puts the padding ON the main → the card is 832px (x=224). A 64px width gap at md+; the mobile geometry is unchanged (350 both). | Live chain walk (DIV→MAIN→SECTION). Mirror: `ProfileView.tsx:101`. |
| F3 | **Med** | **The two cards' glass chrome.** Identity card (live): `overflow-hidden rounded-[36px] border border-white/70 bg-white/78 p-5 shadow-[0_18px_44px_rgba(14,14,14,0.10),inset_0_1px_0_rgba(255,255,255,0.70)] backdrop-blur-[24px] md:p-8` (no `relative`, no `text-center` on the card — the centering moved to an inner `text-center md:text-left` div). The mirror: `shadow-[0_8px_24px_rgba(14,14,14,0.08)]` + `sm:p-8` + no blur. Bookings card (live): `mt-8 rounded-[32px] border border-white/70 bg-white/78 p-5 shadow-[0_14px_34px_rgba(14,14,14,0.08)] backdrop-blur-[20px] md:p-7`; the mirror: `0.1` + `sm:p-8` + no blur. | Live card classes + the VLM's "frosted vs flat" read. Mirror: `ProfileView.tsx:136,181`. |
| F4 | **Med** | **The Go-back + Sign-out pills.** The live (both): `border border-black/[0.06] bg-white/80 text-[#141413] shadow-[0_8px_22px_rgba(14,14,14,0.08)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#141413] hover:text-white hover:shadow-[0_12px_28px_rgba(14,14,14,0.16)]` (the Go-back: 44×44 icon disc, 18px stroke-2 arrow; the Sign-out: `inline-flex gap-2 px-4 py-3 font-inter text-sm font-semibold`). The mirror: plain `bg-white/80 … hover:bg-white` with no border/shadow/blur/lift. | Live pill classes verbatim. Mirror: `ProfileView.tsx:119,127`. |
| F5 | **Med** | **The Saved-places button.** The live: `<a>` `inline-flex items-center gap-2 rounded-full bg-[#0E0E0E] px-5 py-3 font-inter text-sm font-semibold text-white shadow-[0_12px_28px_rgba(14,14,14,0.18)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#571AFF] hover:shadow-[0_16px_34px_rgba(87,26,255,0.24)]` — the VIOLET hover + the lift + the base shadow. The mirror: `bg-ink px-6 hover:bg-black`, no shadow/lift. | Live class verbatim. Mirror: `ProfileView.tsx:171`. |
| F6 | **Med** | **The Upcoming/Past tabs + the label.** The live: `flex h-11 items-center justify-center gap-1.5 rounded-[18px] font-inter text-xs font-semibold transition-all duration-300 ease-out` with the ACTIVE state bg white + `shadow 0 8 18 /0.08` + color #141413 and the INACTIVE color #72706A; the label renders "Upcoming(0)" — NO space before the paren. The mirror: `rounded-full`, active `0_6px_16px /0.1`, inactive #555550, label "Upcoming (2)" WITH a space. | Live tab classes + styles + innerHTML ("Upcoming\|(0)"). Mirror: `ProfileView.tsx:192-216`. |
| F7 | **Low** | **The identity subtitle.** The live: `mt-5 max-w-xl font-inter text-sm leading-7 text-[#555550] md:text-base` — 14px/lh-28 mt-20 on phones → 16px @md. The mirror: `mt-2 text-base text-[#555550]` (16px, mt-8, no max-w). | Live sub class + computed. Mirror: `ProfileView.tsx:149`. |
| F8 | **Low** | **The stat chips.** The live: `inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-[#F8F7F4] px-4 py-2 font-inter text-xs font-semibold text-[#555550]` with 13px stroke-2 lucide icons (map-pin/sun/heart). The mirror: `flex h-[34px] … bg-cream px-4 text-xs font-medium text-black/55` with 14px icons, strokes 1.5/1.8/1.8. Computed heights match (34 both); the text color and icon strokes differ. | Live chip classes. Mirror: `ProfileView.tsx:156-163`. |
| F9 | **Low** | **The EYEBROW.** The live: `font-inter text-xs font-semibold uppercase tracking-[0.18em] text-[#72706A]` (2.16px tracking). The mirror: `tracking-[0.25em] text-[#72706C]` (2.5px). | Live eyebrow class. Mirror: `ProfileView.tsx:48`. |
| F10 | **Low** | **The bookings total count.** The live renders a CREAM PILL: `rounded-full bg-[#F8F7F4] px-3 py-1.5 font-inter text-xs font-semibold text-[#555550]`. The mirror: plain `text-xs font-semibold text-[#555550]`. | Live count class. Mirror: `ProfileView.tsx:187`. |
| F11 | **Low** | **The "My bookings" h2.** The live: `mt-1 [Libre Baskerville] text-4xl font-normal tracking-[-0.05em]`. The mirror: `tracking-[-0.04em]`, no mt-1. | Live h2 class. Mirror: `ProfileView.tsx:184`. |
| F12 | **Med** | **The browse/map/favourites SUBTITLES + the small-page h1s.** The live (all five pages): `mx-auto mt-6 max-w-xl font-inter text-sm leading-7 text-roam-secondary md:text-sm` — desktop: mt 24px, a centered 576px (max-w-xl) block (sub y=243 on eat); mobile (computed): mt 14px, the text inset x=40 wrapping at 310px (2 lines). `text-roam-secondary` computes to rgb(58,58,58) = #3A3A3A (the same color). The mirror: `text-sm text-[#3A3A3A]` — mt 0, full-width, x=16. VLM-confirmed visible. The small-page h1s also drift at 390: the live's map + favourites h1s compute **50.7px** on phones (55px at md — the same mobile scaling as the browse h1s) while the mirror renders 36px (map) and 55px (favourites); the favourites/map/browse h1s' `leading` → 0.92 (the mirror runs 0.95/1.08); the browse h1's `mb-5` + the favourites `mb-3` + the map `mb-5` → dropped (the live puts the spacing on the subtitle's mt). The live's favourites h1 y=188 @390 (both match); the sub lands at y=250 (mt 14). | Live subtitle class + computed mt/x/w at both viewports on eat/stay/do/map/favourites; the h1 sizes at 390/1280. Mirror: `CategoryExplorer.tsx:61-64`, `FavouritesView.tsx:41-44`, `MapExplorer.tsx:120-124`. |
| F13 | **Med** | **The planner's icon action buttons.** The live: `flex h-12 w-12 items-center justify-center rounded-full border border-black/5 bg-[#F8F7F4]/55 text-[#141413] shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 hover:bg-[#0E0E0E] hover:text-white hover:shadow-[0_12px_28px_rgba(14,14,14,0.24)]` (56px on phones, 48px at md) — and the SECOND button's glyph is **lucide-map** (the map outline), both icons 18px STROKE 2. The mirror: `bg-white text-ink shadow-[0_6px_16px_rgba(14,14,14,0.08)] hover:bg-cream` + **lucide-map-pin** + stroke 1.8. VLM-caught ("map/book icon vs location pin"). | Live button class + svg classes. Mirror: `BrowsePlanner.tsx:79-80,169-175`. |
| F14 | **Low** | **The chips row's left inset.** The live's first chip sits at x=16 @390 (the row `-mx-5 px-5` computing to a 4px bleed). The mirror: x=4 (`-mx-4` + inner `px-1`). VLM-confirmed ("Image 2 starts almost at the screen edge"). | Live/mirror chip-box measurements @390. Mirror: `CategoryExplorer.tsx:89`. |
| F15 | **Low** | **The planner card's shadows.** The live adds the glass inset highlight: mobile `shadow-[0_12px_28px_rgba(14,14,14,0.1),inset_0_1px_0_rgba(255,255,255,0.88)]`, md `md:shadow-[0_8px_22px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.88)]`. The mirror carries only the drop shadows. | Live card computed shadow. Mirror: `BrowsePlanner.tsx:84-87`. |
| F16 | **Info** | Accepted/document-only: the live's eat page carries a HIDDEN eyebrow ("Augsburg dining guide" — a `hidden` violet 12px uppercase tag above the h1; stay/do have none — vestigial, invisible); the live's home category counts drifted (20 eat / 10 sights vs the mirror's seeded 12/18 — live data, not chrome); the live's pre-hydration "Roam" skeleton h1s; the live's CDN computed-value quirks (documented above — the mirror pins the computed result); the live's tab states are inline styles (the mirror's cn() classes compute identical). | §2 rows. |

## 4. Remediation (TDD — RED first, then GREEN)

### R0 — RED: the failing pins before any code changes
All in `tests/e2e/browse.spec.ts`:
1. **The label flip** (the profile test, line ~991): `page.getByText("Upcoming (")`
   → `page.getByText("Upcoming(")` — RED against the current "Upcoming (2)"
   with-space label.
2. **The centering-pin flip** (the mobile-centering test, lines ~1005/1023):
   `page.locator("section").first()` text-align → the H1's own computed
   text-align (center on phones / left at md) — RED once `text-center`
   moves off the card onto the inner wrapper.
3. **The new profile chrome pins** (inside the first profile test):
   the h1 55px + line-height 50.6px @390 and 66.24px @1280; the identity
   card's computed width 896 + backdropFilter blur(24px) + an inset
   box-shadow @1280; the subtitle 14px @390 / 16px @1280 with mt 20px; the
   Upcoming tab's 18px border-radius + the active shadow
   `rgba(14, 14, 14, 0.08) 0px 8px 18px` + the no-space label; the total
   count's cream pill bg rgb(248,247,244); the Go-back + Sign-out pills'
   1px border + backdrop blur; the Saved-places hover bg #571AFF; the chips'
   600 weight + 13px stroke-2 icons; the eyebrow's 2.16px letter-spacing.
4. **The browse-subtitle pins** (the three-view loop test): the subtitle's
   mt 24px + the 576px width + the x=352 centered block @1280; @390 the
   14px top margin + the text-box inset (x=40 via the inner px-6).
5. **The planner-button pins** (the unified-card test): the map button's
   svg is `lucide-map` with stroke-width 2; both buttons carry the 1px
   border + the inset box-shadow + bg rgba(248,247,244,0.55).
6. **The chips-inset pin** (@390): the first filter chip's box x=16.
All RED against the current tree (verify by running the suite before R1).

### R1 — GREEN: `src/components/profile/ProfileView.tsx`
1. The structure: wrap the main in the page div — `<div
   className="min-h-screen px-5 pb-24 pt-10 md:px-8 md:pt-16"><main
   className="relative mx-auto max-w-4xl">` (F2; the grid overlay + the
   pills row + both cards move inside; the top row drops its `relative`).
2. The identity card: `overflow-hidden rounded-[36px] border
   border-white/70 bg-white/78 p-5 text-center
   shadow-[0_18px_44px_rgba(14,14,14,0.10),inset_0_1px_0_rgba(255,255,255,0.70)]
   backdrop-blur-[24px] md:p-8 md:text-left` — the `relative`/`sm:p-8`
   dropped; the centering stays as `text-center md:text-left` on the card
   (computed-identical to the live's inner-div pattern; the E2E pins the
   h1's own text-align).
3. The h1: `font-serif text-[55px] font-normal leading-[0.92]
   tracking-[-0.06em] text-ink md:text-[72px]` (F1).
4. The subtitle: `mt-5 max-w-xl font-inter text-sm leading-7
   text-[#555550] md:text-base` (F7).
5. The chips: `inline-flex items-center gap-1.5 rounded-full border
   border-black/[0.06] bg-[#F8F7F4] px-4 py-2 font-inter text-xs
   font-semibold text-[#555550]` + the icons `h-[13px] w-[13px]`
   strokeWidth 2 (F8).
6. The EYEBROW const: `font-inter text-xs font-semibold uppercase
   tracking-[0.18em] text-[#72706A]` (F9).
7. The Go-back: `flex h-11 w-11 items-center justify-center rounded-full
   border border-black/[0.06] bg-white/80 text-[#141413]
   shadow-[0_8px_22px_rgba(14,14,14,0.08)] backdrop-blur-xl transition-all
   duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#141413]
   hover:text-white hover:shadow-[0_12px_28px_rgba(14,14,14,0.16)]` (F4).
8. The Sign-out: `inline-flex items-center gap-2 rounded-full border
   border-black/[0.06] bg-white/80 px-4 py-3 font-inter text-sm
   font-semibold text-[#141413] shadow-[0_8px_22px_rgba(14,14,14,0.08)]
   backdrop-blur-xl transition-all duration-300 ease-out
   hover:-translate-y-0.5 hover:bg-[#141413] hover:text-white
   hover:shadow-[0_12px_28px_rgba(14,14,14,0.16)]` (F4).
9. The Saved-places Link: `mt-6 inline-flex items-center gap-2
   rounded-full bg-[#0E0E0E] px-5 py-3 font-inter text-sm font-semibold
   text-white shadow-[0_12px_28px_rgba(14,14,14,0.18)] transition-all
   duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#571AFF]
   hover:shadow-[0_16px_34px_rgba(87,26,255,0.24)]` (F5).
10. The bookings card: `mt-8 rounded-[32px] border border-white/70
    bg-white/78 p-5 shadow-[0_14px_34px_rgba(14,14,14,0.08)]
    backdrop-blur-[20px] md:p-7` (F3b).
11. The tabs: base `flex h-11 items-center justify-center gap-1.5
    rounded-[18px] font-inter text-xs font-semibold transition-all
    duration-300 ease-out` + active `bg-white text-[#141413]
    shadow-[0_8px_18px_rgba(14,14,14,0.08)]` + inactive
    `text-[#72706A]`; the label `Upcoming(${n})` — NO space (F6).
12. The count: `rounded-full bg-[#F8F7F4] px-3 py-1.5 font-inter text-xs
    font-semibold text-[#555550]` (F10).
13. The h2: `mt-1 font-serif text-4xl font-normal leading-[1.05]
    tracking-[-0.05em] text-ink` (F11).
14. The category filters: `flex shrink-0 items-center gap-1.5
    rounded-full px-4 py-2.5 font-inter text-xs font-semibold capitalize
    transition-all duration-300 ease-out hover:-translate-y-0.5
    hover:bg-[#571AFF] hover:text-white
    hover:shadow-[0_12px_28px_rgba(87,26,255,0.18)]` + the active
    `bg-[#141413] text-white` / inactive `bg-white text-[#555550]` (the
    live's measured filter chrome).

### R2 — GREEN: the subtitles + the small-page h1s (F12)
- `src/components/places/CategoryExplorer.tsx`: the h1
  `mb-5 … leading-[0.95]` → `leading-[0.92]` (drop mb-5); the subtitle
  `text-sm text-[#3A3A3A]` → `mx-auto mt-3.5 max-w-xl px-6 font-inter
  text-sm text-[#3A3A3A] md:mt-6 md:px-0` (computes: desktop mt 24 +
  centered 576; mobile mt 14 + text inset 40/wrap 310 — the live's computed
  contract; leading-7 deliberately OMITTED: the live's leading-7 computes
  to 20px, the same as text-sm's default).
- `src/components/favourites/FavouritesView.tsx`: the h1 `text-[55px]` →
  `text-[clamp(42px,13vw,55px)]` (50.7px @390 like the live) and drops
  `mb-3`; the subtitle gets the same class.
- `src/components/map/MapExplorer.tsx`: the h1 `text-[36px] leading-[1.08]
  sm:text-[clamp(36px,4.3vw,55px)]` → `text-[clamp(42px,13vw,55px)]
  leading-[0.92]` (50.7px @390, 55px @md) and drops `mb-5`; the subtitle
  gets the same class.

### R3 — GREEN: the planner shell (F13–F15)
- `src/components/planner/BrowsePlanner.tsx`: the `iconBtn` → `flex h-14
  w-14 shrink-0 items-center justify-center rounded-full border
  border-black/5 bg-[#F8F7F4]/55 text-[#141413]
  shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] transition-all
  duration-300 ease-out hover:-translate-y-0.5 hover:scale-105
  hover:bg-[#0E0E0E] hover:text-white
  hover:shadow-[0_12px_28px_rgba(14,14,14,0.24)] md:h-12 md:w-12`; both
  icons strokeWidth 1.8 → 2; the second button's `MapPin` → `Map`.
- The planner card: append the inset highlight to both shadows
  (`,inset_0_1px_0_rgba(255,255,255,0.88)]` on mobile + md).
- `src/components/places/CategoryExplorer.tsx`: the chips row's inner
  `px-1` → `px-4` (the first chip lands at x=16).

### R3b — GREEN (found during R4): the cards' TRANSPARENT bg

The R4 pixel sampling exposed one more gap inside F3: the live's
`bg-white/78` class DOES NOT COMPUTE (its CDN skips the non-standard /78
opacity step) — the rendered cards are TRANSPARENT + the blur frosting
(pixel-sampled (248,247,244) ≈ the cream page bg), while the mirror's
applying tint rendered (254,253,253) — 6 RGB points too white. Both the
identity card and the bookings card drop the `bg-white/78` class (the
border + blur + shadows carry the card); a new E2E pin asserts the
computed `background-color: rgba(0, 0, 0, 0)`; the fix verified
pixel-identical after the change.

### R4 — reseed + dev-server verification
`npm run db:seed` (idempotent), then dev-server DOM probes against the
recorded live measurements: the profile card 896 wide @1280 (x=192) with
blur + inset; the h1 55/72 + lh 50.6/66.24; the subtitle 14/16 mt-20; the
tabs 18px + the no-space label; the count cream pill; the browse subtitle
y=243 @1280 / mt-14 + inset-40 @390; the chips first x=16; the planner
buttons' lucide-map + stroke 2 + the inset shadow; the booking round-trip
STILL green (the v2.23 picker untouched); the mobile nav taps still green.

### R5 — screenshots + docs
Re-capture the 19 screenshots on the remediated tree (new
`scripts/capture-screens-session58.mjs` following the session-56 pattern;
the profile captures now document the glass chrome + the 55px h1; the
browse captures the aligned subtitle/planner chrome). Docs aligned:
AGENTS.md, CLAUDE.md, README.md, the PAD v2.24 revision block,
activity-map_SKILL.md v1.23.0, the findings v2.24 addendum,
`docs/session_58.md` (this session's log), this plan, the repo worklog.

### R6 — the final full gate ×2
`npm run lint` → `npm run typecheck` → `npm run test` (113) → `npm run
build` → `./scripts/smoke-test.sh` (31) → `npm run test:e2e` (93, the
flipped + extended profile/browse pins) — then the SSH-wrapper push to
`main` (the wrapper runbook,
`docs/how-to-git-push-using-ssh-wrapper_SKILL.md`), and the operator key
shredded post-push.

## 5. Guardrails

- `skills/` excluded from lint/typecheck/compile/test (already configured).
- `main` only — no new branches; Conventional Commit
  (`fix(parity): profile glass refresh + browse-shell chrome (v2.24)`).
- Never commit `.env`, `db/*.db`, key material.
- The v2.23 picker contracts (the seam, the range semantics, the POST
  payload, the success note, the reset, the month-row chrome) are verified
  EXACT this session — this remediation does not touch the picker files;
  their 21 seam unit checks and the E2E picker pins stay untouched.
- The mobile navigation menu (the task's focus) is verified EXACT with NO
  Tailwind v4 regression — this remediation does not touch the Navbar or
  the tab bar.
- The identity CONTENT contract (the seam `src/lib/identity.ts`, the
  "sepnetflix2023"/"Explorer" split, the avatar states) is untouched —
  only the CHROME around it changes.
- F16's accepted equivalences are documented in the findings, not code.
