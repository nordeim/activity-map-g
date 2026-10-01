# Session 53 — Remediation Plan (the booking-form picker parity: Dates/Time popovers + the success-note contract, v2.22)

Date: 2026-10-01 · Agent: coding specialist (session 53)

## 1. Context

Workspace refreshed from `https://github.com/nordeim/activity-map-g.git` at
`61da59a` (main = the v2.21 tree `95b1855` + the operator's
`docs/session_53.md` + the redeploy `docs/start_server_log.txt` — the mirror
was redeployed from the v2.21 tree 2026-10-01 11:28 +0800). Every root doc
re-read (AGENTS.md, CLAUDE.md, README.md, the PAD v2.21,
activity-map_SKILL.md v1.22.7) plus the session history
(`docs/session_52.md`, `docs/remediation-plan-session-51.md`,
`docs/session_53.md` (the raw session-52 narrative), `worklog.md`,
`docs/start_server_log.txt`). The audited range `a358ffb..61da59a`
(v2.19 + v2.20 + v2.21) verified file-by-file against the docs — sound.
Skills consulted from the repo's `skills/skills-catalog.md`:
`agent-browser` (the dual-site audit driver), `clone-app-pat-pro`
(computed-style ground truth), `tdd` (the RED→GREEN loop),
`nextjs16-tailwind4` (the mobile-nav failure taxonomy),
`code-review-checklist` (the range audit). The `skills/` folder stays
excluded from code checking, testing, and compilation (tsconfig + ESLint
already exclude it).

Baseline gates on the untouched tree (all green before any edit):
lint ✓ (0 errors, the 2 pre-existing `scripts/inspect-live-nav.js` /
`scripts/audit-local-nav.js` warnings) · typecheck ✓ · **92/92 unit** ✓ ·
build ✓ (22 routes) · **31/31 smoke** ✓ · **92/92 E2E** ✓. Environment:
`.env` from `.env.example` with `DATABASE_URL="file:../db/custom.db"` (the
`db/` folder at the repo root, 118784-byte seeded `db/custom.db` — the exact
documented size; the npm scripts pin the URL inline; `src/lib/db-path.ts`
resolves it — no code changes needed, the v2.13/v2.15 pinning is intact).
Vitest + Playwright configs verified in place (the task's config items are
already satisfied — extended here only by the new picker checks).

## 2. Audit results (dual-site browser: the deployed mirror vs the live source)

| Surface | Result |
|---------|--------|
| Mirror deployment state (v2.21) | The redeployed mirror IS running v2.21: the title sweep "Activity Map" / "<Short> \| Activity Map" on 11 routes, the guest identity ("Explorer" + "Your Roam account" + the 17px stroke-2 user-icon avatar), the demo identity ("sepnetflix2023" + email + "S"), /login stays for the authenticated session. |
| Mobile navigation menu (the task's focus) | Mirror at 390×844: the 52px border-box cream-glass tab-bar (bg rgba(248,247,244,0.62) + blur(24px) saturate(1.5) + the 1px border-b), text links x=121/192/222/259, right-cluster icons x=304/330/356 @18px stroke 2, aria-current follows. IDENTICAL on the live source. FUNCTIONAL end-to-end on the mirror: Eat→/eat, Map icon→/map, Heart→/favourites, Profile icon→/profile. **The mobile menu works exactly as expected — NO Tailwind v4 regression** (all five failure-class pins green in the 92/92 baseline run). |
| Desktop nav (1280) | Both sites: pill links 433/559/639/727/805 + heart 957 (36px disc, 17px stroke-2 glyph) + avatar 1001 — IDENTICAL (demo "S"; anonymous 17px user-icon). |
| Identity (the volatile surface) | The live's AUTHENTICATED contract did NOT oscillate this session (the fifth measurement): h1 "sepnetflix2023" + the email subtitle + the "S" initial. The ANONYMOUS contract matches v2.21 exactly ("Explorer" + "Your Roam account" + the user-icon avatar; read-only heart taps — the documented F4 divergence). |
| Footer / browses / detail / login card / map | Grown pill 646×118 (r34, pad 12/16, gap 12, 92×92 r-24 links), Eat/Stay/Do chip sets (38px/12px), place detail (82px h1 @y=225 + ~1150×460 + 7 fields), login card (slate-900 #0F172A Sign-in 48px, 2 fields), map stats + the interleaved place list — all IDENTICAL. |
| Console/errors | Zero console errors and zero page errors across 8 pages on BOTH sites. |
| Round-trips on the mirror | Favourites save/unsave + booking POST (a same-day booking lands under "Upcoming (1)" — the v2.19 calendar-day classification confirmed live on the redeployment). |
| **The booking form's Dates/Time fields** | **GAP FOUND (F1).** The live renders PICKER-TRIGGER BUTTONS ("Choose dates" / "Choose time") that open popovers — a date-RANGE calendar and a 29-slot time list — while the mirror renders plain free-text `<input>` fields. Details in §3. |

## 3. Findings

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| F1 | **Med** | **The booking form's Dates/Time are picker triggers + popovers on the live; free-text inputs on the mirror.** Measured on the live (`/place/<id>`): (a) both fields are `type="button"` triggers — h-11 (44px) w-full rounded-2xl (16px) border-[#DDDBD5] bg-white px-4 text-sm, `flex items-center justify-between text-left`, mt-2 INSIDE the `relative block text-xs font-semibold text-[#3a3a3a]` label; the left span renders the value ("Thu 15 Oct — Sat 17 Oct" / "19:00") in text-roam-text or the placeholder ("Choose dates" / "Choose time") in #888580; the right span (`flex items-center gap-2 text-roam-text`) carries the field icon (calendar-days / clock, 16px stroke 1.8) + a chevron-down (15px stroke 2, `transition-transform duration-200`, `rotate-180` while open); hover = violet border + the 0 8 22 /0.10 violet glow. (b) The shared popover chrome: `absolute bottom-[calc(100%+8px)] left-1/2 z-[30000] w-full -translate-x-1/2 rounded-[24px] border border-[#DDDBD5] bg-[#F8F7F4] p-3 shadow-[0_20px_48px_rgba(14,14,14,0.14)] md:bottom-auto md:top-[calc(100%+8px)]` — opens UP on phones, DOWN from md. (c) The CALENDAR: a month row (`mb-3 flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2`) wrapping a month SELECT (h-9, rounded-full, #DDDBD5 border, cream bg, pr-12 — options = the current month + 11 forward, "October 2026"…); the weekday row (`mb-2 grid grid-cols-7 gap-1 text-center text-[10px]`, S M T W T F S); the 42-cell day grid (`grid grid-cols-7 gap-1`, cells h-9 rounded-full text-sm): in-month `bg-white text-roam-text hover:bg-black hover:text-white hover:shadow-[0_10px_22px_rgba(14,14,14,0.08)]`, PAST dates `cursor-not-allowed text-[#C8C6C0]` + disabled, NEXT-month trailing `bg-white/60 text-roam-muted hover:bg-black hover:text-white` (enabled), range ENDPOINTS `bg-[#571AFF] text-white shadow-[0_10px_22px_rgba(87,26,255,0.24)]`, IN-RANGE `bg-[#F0E9FF] text-[#571AFF]`. Range semantics: first click = start (the trigger reads "Thu 15 Oct — select end date"), second click = end (the trigger reads "Thu 15 Oct — Sat 17 Oct"; the hidden input value "2026-10-15 to 2026-10-17"; the popover CLOSES). (d) The TIME list: a `grid gap-1` of 29 buttons (08:00 → 22:00, 30-min steps), each `flex h-10 items-center justify-between rounded-2xl px-3 font-inter text-sm transition-all duration-200` with the same white/hover-black/violet-selected model; a click selects (trigger "19:00", hidden "19:00", popover closes). | Live `/place/6a5353f4f11a1beb8aa8f493` DOM + computed styles (measured 2026-10-01 at 390 and 1280; every class above is verbatim from the live's DOM). The mirror: `src/components/places/BookingForm.tsx:156-182` — plain `<input>` fields with `placeholder="Choose dates"` / `"Choose time"`. |
| F1b | **Low** | **The booking success-note chrome + copy drift.** The live renders a PLAIN centered `<p class="text-center text-xs font-semibold text-[#2A6B3A]">Your booking request for Rose Circuit has been sent.</p>` below the Book Now button (no background pill), and the form RESETS (the placeholders return). The mirror renders an emerald-50 rounded-xl pill with a different copy ("Request sent — see it under Profile → My bookings.") and does not reset the fields. | Live post-submit DOM. Mirror: `src/components/places/BookingForm.tsx:78` + `:236-249`. |
| F2 | **Info** | Every other surface verified EXACT (see §2) — including the task's focus areas: the mobile navigation menu (geometry + taps at 390 on both sites) and the Tailwind v4 surface (zero regressions, all five failure-class pins green). The identity contract did not oscillate this session. | §2 rows. |

## 4. Remediation (TDD — RED first, then GREEN)

### R0 — RED: the failing pins before any code changes
1. NEW `tests/booking-picker.test.ts` (the pure seams' unit checks — see R1):
   `buildTimeSlots()` (29 slots, 08:00→22:00, 30-min steps, first/last/step
   boundaries), `formatBookingDateLabel` ("Thu 15 Oct"),
   `formatBookingRangeLabel` (start-only → "Thu 15 Oct — select end date";
   complete → "Thu 15 Oct — Sat 17 Oct"),
   `bookingRangeValue` (incomplete → ""; complete → "2026-10-15 to
   2026-10-17"), `parseBookingRangeValue` (splitting the value into the POST
   payload parts), `buildBookingCalendar` (the 42-cell month grid: leading
   past days, in-month days, trailing next-month days, October-2026 ground
   truth), and `bookingMonthOptions` (the current month + 11 forward,
   "October 2026" labels). RED against the current tree (the module does
   not exist).
2. `tests/e2e/browse.spec.ts` — the booking-form spec flips: the Dates/Time
   fields are BUTTONS (`getByRole("button", { name: "Choose dates" })`,
   44px, 16px radius, the #DDDBD5 border) — no longer
   `getByLabel("Dates").fill(...)` textboxes. The booking round-trip spec
   re-pinned to the PICKER interactions (click the trigger → the popover
   renders → click two days → the trigger shows the range → click the time
   trigger → click 19:00 → submit → the plain green note + the reset
   placeholders). RED against the current tree.
3. New E2E picker pins (a focused block inside the booking spec): the
   popover chrome (cream #F8F7F4 bg, r-24, the #DDDBD5 hairline, the
   `0 20px 48 /0.14` shadow), the month select + the weekday row + 42 day
   cells, the trigger's value/placeholder color states, the chevron
   rotate-180 while open, the time list's 29 slots, the success note
   (12px/600 #2A6B3A centered, the live's copy), and the form reset.

### R1 — GREEN: the pure seam `src/lib/booking-picker.ts`
Zero-import, client-safe (like `src/lib/identity.ts`): `buildTimeSlots()`,
`formatBookingDateLabel(date)`, `formatBookingRangeLabel(start, end|null)`,
`bookingRangeValue(start, end|null)`, `parseBookingRangeValue(value)`,
`buildBookingCalendar(month, today)` (the 42-cell grid with each cell's
`{ date, inMonth, past }` classification — past = day-ordinal < today's),
`bookingMonthOptions(now)` (12 options from the current month forward), and
`bookingDayCellState(...)` (the five-state model → the exact live class
strings). Pinned by R0.1.

### R2 — GREEN: the picker components
1. NEW `src/components/places/BookingDatePicker.tsx` — the trigger button
   (the measured chrome + the calendar-days 16px/1.8 icon + the rotating
   chevron) and the calendar popover (the shared chrome; the month row with
   the SELECT; the weekday row; the 42-cell grid via the seam; the
   range semantics with the "select end date" intermediate state; closes on
   completion; a backdrop click/Escape closes). Props: `{ value, onChange }`
   where value = the `{ start: Date, end: Date | null }` pair.
2. NEW `src/components/places/BookingTimePicker.tsx` — the same trigger
   chrome (the clock icon) and the `grid gap-1` list of the 29 time buttons
   (h-10 rounded-2xl, the white/hover-black/violet-selected model); a click
   selects + closes. Props: `{ value, onChange }` (value = the "HH:MM"
   string).
3. Both render the live's hidden-input pattern (a 1×1 sr-only input
   carrying the form value) inside the wrapping `relative` label.

### R3 — GREEN: the BookingForm wiring
1. `src/components/places/BookingForm.tsx`: the two free-text inputs are
   replaced by the picker components (inside the measured label structure);
   the POST body sends `startDate` = the range start ISO ("2026-10-15") and
   `endDate` = the range end ISO (the range's own end, not the start — the
   old code sent `startDate: dates, endDate: dates`).
2. The success note: `text-center text-xs font-semibold text-[#2A6B3A]`
   with the copy "Your booking request for {place.name} has been sent.";
   the error note keeps the same plain-centered shape in red. The form
   RESETS on success (all fields + both pickers).

### R4 — reseed + dev-server verification
`npm run db:seed` (no schema change — idempotent confirmation), then
dev-server DOM probes: the trigger buttons render (44px, the #DDDBD5
border, the placeholder color #888580), the calendar opens with 42 cells +
the month select, a range completes ("Thu 15 Oct — Sat 17 Oct" + the hidden
"2026-10-15 to 2026-10-17"), the time list renders 29 slots, a booking
round-trips to the profile (Upcoming), the success note renders the live's
copy + the form resets.

### R5 — screenshots + docs
Re-capture the 17 screenshots on the remediated tree (new
`scripts/capture-screens-session54.mjs` following the session-51 pattern —
the place-detail captures now document the picker triggers; a NEW capture
`18-booking-date-picker.png` + `19-booking-time-picker.png` documenting the
open popovers). Docs aligned: AGENTS.md, CLAUDE.md, README.md, the PAD
v2.22 revision block, activity-map_SKILL.md v1.22.8, the findings v2.22
addendum, `docs/session_54.md` (this session's log), this plan, the repo
worklog.

### R6 — the final full gate ×2
`npm run lint` → `npm run typecheck` → `npm run test` (92+NEW unit) →
`npm run build` → `./scripts/smoke-test.sh` (31) → `npm run test:e2e` (92,
the flipped pins + the new picker checks) — then the SSH-wrapper push to
`main` (the wrapper runbook,
`docs/how-to-git-push-using-ssh-wrapper_SKILL.md`), and the operator key
shredded post-push.

## 5. Guardrails

- `skills/` excluded from lint/typecheck/compile/test (already configured).
- `main` only — no new branches; Conventional Commit
  (`fix(parity): booking-form date/time picker popovers + success-note contract (v2.22)`).
- Never commit `.env`, `db/*.db`, key material.
- The date-range POPUP semantics follow the live's BOOKING calendar (the
  #C8C6C0 past-disabled + the white/60 next-month model), NOT the trip
  planner's DateRangePicker (the #737373 model — a different surface,
  already green, untouched).
- The mobile nav, identity, titles, and every other green pin must stay
  green — this remediation only touches the BookingForm's two fields, the
  note, and the reset.
