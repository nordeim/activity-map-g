# Session 55 — Remediation Plan (the booking-picker chrome re-alignment: the month row, the weekday row, the ARIA contract, v2.23)

Date: 2026-10-01 · Agent: coding specialist (session 56 — the repo's own numbering; the operator's `docs/session_55.md` is the raw session-54 narrative)

## 1. Context

Workspace refreshed from `https://github.com/nordeim/activity-map-g.git` at
`25144c9` (main = the v2.22 tree `22d2ba4` + the operator's
`docs/session_55.md` + the redeploy `docs/start_server_log.txt` — the mirror
was redeployed from the v2.22 tree 2026-10-01 12:55 +0800). Every root doc
re-read (AGENTS.md, CLAUDE.md, README.md, the PAD v2.22,
activity-map_SKILL.md v1.22.8) plus the session history
(`docs/session_54.md`, `docs/remediation-plan-session-53.md`, `worklog.md`,
`docs/session_55.md`, `docs/start_server_log.txt`). The v2.22 range
(`61da59a..22d2ba4`) re-audited file-by-file (booking-picker.ts,
BookingDatePicker, BookingTimePicker, BookingForm, the flipped browse.spec
pins) — the shipped logic is sound. Skills consulted from the repo's
`skills/skills-catalog.md`: `agent-browser` (the dual-site audit driver),
`clone-app-pat-pro` (computed-style ground truth), `tdd` (the RED→GREEN
loop), `nextjs16-tailwind4` (the mobile-nav failure taxonomy),
`code-review-checklist` (the range audit). The `skills/` folder stays
excluded from code checking, testing, and compilation (tsconfig + ESLint
already exclude it).

Baseline gates on the untouched tree (all green before any edit): lint ✓
(0 errors, the 2 pre-existing script warnings) · typecheck ✓ · **113/113
unit** ✓ · build ✓ (22 routes) · **31/31 smoke** ✓ · **93/93 E2E** ✓.
Environment: `.env` with `DATABASE_URL="file:../db/custom.db"` (the `db/`
folder at the repo root, 118784-byte seeded `db/custom.db`; the npm scripts
pin the URL inline; `src/lib/db-path.ts` resolves it). Vitest + Playwright
configs verified in place.

## 2. Audit results (dual-site browser: the redeployed v2.22 mirror vs the live source)

| Surface | Result |
|---------|--------|
| Mirror deployment state (v2.22) | The redeployed mirror IS running v2.22: the booking form renders the PICKER-TRIGGER buttons + both popovers (42-cell calendar, 12-option month select, 29-slot time list); the success note + the form reset verified live on a clean round-trip (Dates → "Choose dates", Time → "Choose time", Name cleared). |
| Mobile navigation menu (the task's focus) | Mirror at 390×844: the 52px border-box cream-glass tab-bar (bg rgba(248,247,244,0.62) + blur(24px) saturate(1.5) + the 1px border-b), text links x=121/192/222/259, right-cluster icons x=304/330/356 @18px. IDENTICAL on the live source. FUNCTIONAL end-to-end on the mirror: Map icon → /map, Heart → /favourites, Profile icon → /profile. **The mobile menu works exactly as expected — NO Tailwind v4 regression** (the E2E 93/93 baseline already includes the five failure-class pins). The first nav item = the 84px logo+wordmark link on BOTH sites (the live renders the wordmark as an image; the clone as text — a long-standing accepted equivalent). |
| Desktop nav (1280) | Both sites: pill links 433/559/639/727/805 + heart 957 (36px disc, 17px stroke-2 glyph) + avatar 1001 — IDENTICAL (the live "S" 14px/700 white on the black disc; the mirror's guest state the user icon — the v2.21 anonymous contract). |
| Identity (the volatile surface) | The live's AUTHENTICATED contract did NOT oscillate (the SIXTH measurement): h1 "sepnetflix2023" + the email subtitle. The anonymous contract intact (the mirror's guest session: the user-icon avatar). |
| Hero / titles / footer | The hero photo is BYTE-IDENTICAL (md5 `5058794d…` on both). The 11-route title sweep exact. The footer geometry equal (307 vs 306 at 1280 — sub-pixel). Zero console + page errors on BOTH sites (the live's own Tailwind-CDN warning is the live's issue — the mirror's PostCSS build is the correct pattern). |
| Booking core semantics | The v2.22 picker semantics ALL verified against the live this session: the range mid-pick label ("Thu 15 Oct — select end date" in `text-roam-muted`), the complete label + the hidden "2026-10-15 to 2026-10-17", the reopen-with-range highlights (violet endpoints + the `#F0E9FF` tint), the single-day collapse, the time selection (19:00 + the check), the success note (12px/600 centered `#2A6B3A`, the live's copy, 16px top margin), the form reset. |
| **The picker CHROME** | **GAPS FOUND (F1–F5).** The v2.22 build shipped the picker LOGIC exactly but the chrome details drifted in five places (the month-row layout, the month-select weight/hover, the weekday row, the hover shadows, the ARIA contract). Details in §3. |

## 3. Findings

All measurements taken 2026-10-01 on the live `/place/6a5353f4f11a1beb8aa8f493`
(Rose Circuit) at 390 and 1280; every class below is verbatim from the live's
DOM. The mirror file is `src/components/places/BookingDatePicker.tsx` /
`BookingTimePicker.tsx`.

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| F1 | **Med** | **The month row's layout.** The live: `mb-3 flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 text-roam-text` (NO `relative` on the row) carrying exactly TWO children — (a) a `relative flex-1` wrapper holding the month SELECT (`h-9 w-full … pr-12`) and the chevron `lucide-chevron-down pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-roam-text` (15px, stroke 2, 20px from the select's right edge) and (b) the calendar-days icon (16px, **stroke 2**) at the row's END. The mirror: `relative` on the row with [calendar-days (stroke 1.8) at the START] + [select] + [chevron as a static flex item at the END]. VLM-confirmed visible (the icon far right vs far left; the chevron inside the select vs at the row's edge). | Live month-row DOM (children: DIV `relative flex-1` 307×36 + svg calendar-days 16×16; chevron x=1095 inside the wrapper, computed `position: absolute`, right inset 20px, centered). Mirror: `BookingDatePicker.tsx:164-182`. |
| F2 | **Med** | **The month SELECT's weight + hover/focus.** The live: `h-9 w-full appearance-none rounded-full border border-[#DDDBD5] bg-[#F8F7F4] px-3 pr-12 font-inter text-sm font-bold text-roam-text outline-none transition-all duration-200 hover:border-[#571AFF] focus:border-[#571AFF]` (computed weight 700) and NO aria-label. The mirror: the same minus `font-bold` (computed 600, inherited from the label's font-semibold), minus the transition/hover/focus classes, plus `aria-label="Select month"`. | Live select class + computed `font-weight: 700`. Mirror: `BookingDatePicker.tsx:166-173`. |
| F3 | **Med** | **The weekday row.** The live: `mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-roam-muted` — computed 700, UPPERCASE, letter-spacing 1.2px, color rgb(136,133,128). The mirror: `…text-[10px] font-medium text-muted` — computed 500, no transform, no tracking. | Live weekday-row class + computed styles. Mirror: `BookingDatePicker.tsx:183`. |
| F4 | **Low** | **The day-cell + time-slot hover shadows.** The live: `hover:shadow-[0_10px_22px_rgba(14,14,14,0.12)]` on the in-month day cells AND the unselected time slots. The mirror: `0.08` on both. | Live day-cell class + time-slot class. Mirror: `BookingDatePicker.tsx:99` + `BookingTimePicker.tsx:111`. |
| F5 | **Low** | **The ARIA + font-inter placement contract.** (a) The live's triggers carry NO `aria-label` and NO `aria-expanded` — the accessible names are "Dates*" / "Time*" derived from the wrapping labels (label text wins for labelable controls); the mirror adds both attributes, and its `aria-label="Choose dates"` ALSO masks the E2E reset pin (`getByRole({ name: /^Choose dates/ })` matches regardless of the visible text — the pin cannot fail on a visual reset regression). (b) The live's FORM carries `font-inter` (`mt-6 space-y-4 font-inter`); the mirror's does not (computed-equivalent via inheritance, but the class is the live's). (c) The mirror adds `font-inter` to BOTH popover containers; the live's popovers do NOT carry it (the live's slot buttons + the select carry their own `font-inter`). (d) The live's hidden inputs are NOT readOnly; the mirror's are (`readOnly` prop). | Live trigger/label/form/popover DOM + `getByRole` name listing ("Dates*" among the names). Mirror: `BookingDatePicker.tsx:129-158`, `BookingTimePicker.tsx:65-94`, `BookingForm.tsx:147`. |
| F6 | **Info** | Accepted equivalences (documented, NOT remediated — the repo's computed-style parity bar): the month option VALUE format (the live "2026-9" 0-based non-padded vs the mirror "2026-10"); the live's heart/avatar are BUTTONs vs the mirror's links (same geometry/behavior); the token-name classes (text-roam-text vs text-ink etc. — every one computes identical); the wordmark image vs text. | §2 rows. |

## 4. Remediation (TDD — RED first, then GREEN)

### R0 — RED: the failing pins before any code changes
All in `tests/e2e/browse.spec.ts` (the picker surface):
1. **The trigger-query flips** (6 sites: the two field-presence tests, the
   chrome test, the booking round-trip test):
   `getByRole("button", { name: /^Choose dates/ })` →
   `getByRole("button", { name: "Dates*", exact: true })` and
   `getByRole("button", { name: /^Choose time/ })` →
   `getByRole("button", { name: "Time*", exact: true })` — RED against the
   current tree (the current triggers are named "Choose dates"/"Choose
   time" via their aria-labels).
2. **The reset pins become VISUAL**: after the successful submit,
   `await expect(datesTrigger).toHaveText("Choose dates")` and
   `await expect(timeTrigger).toHaveText("Choose time")` — these pin the
   VISIBLE text (the old accessible-name pins could not fail on a visual
   reset regression). The mid-pick single-day assertion
   (`toHaveCount(0)` on `/select end date/`) becomes
   `await expect(datesTrigger).not.toContainText("select end date")`.
3. **The new chrome pins** (inside the "picker popovers render the live's
   measured chrome" test, re-titled to session 55):
   - the triggers have NO aria-label and NO aria-expanded
     (`not.toHaveAttribute`);
   - the month row: exactly two children — a `relative flex-1` wrapper
     (containing the select + an ABSOLUTE, pointer-events-none chevron) and
     the calendar-days svg as the LAST child (an `evaluate` structure pin);
   - the month select: computed font-weight 700, and NO aria-label;
   - the weekday row: computed text-transform uppercase, font-weight 700,
     letter-spacing 1.2px;
   - the month-row chevron: computed position absolute (inside the
     wrapper);
   - the form carries `font-inter`; the popover containers do NOT.
   All RED against the current tree.

### R1 — GREEN: `src/components/places/BookingDatePicker.tsx`
1. The month row: `mb-3 flex items-center justify-between gap-3 rounded-2xl
   bg-white px-3 py-2 text-ink` (drop `relative`) wrapping (a) `<div
   className="relative flex-1">` with the select + `<ChevronDown className=
   "pointer-events-none absolute right-5 top-1/2 h-[15px] w-[15px]
   -translate-y-1/2" strokeWidth={2} aria-hidden />` and (b) the
   `<CalendarDays className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden
   />` at the END (stroke 1.8 → 2).
2. The select: add `font-bold transition-all duration-200
   hover:border-[#571AFF] focus:border-[#571AFF]`; remove
   `aria-label="Select month"`.
3. The weekday row: `font-medium` → `font-bold uppercase
   tracking-[0.12em]` (text-muted stays).
4. The in-month day cells: `hover:shadow-[0_10px_22px_rgba(14,14,14,0.08)]`
   → `0.12`.
5. The trigger: remove `aria-label="Choose dates"` + `aria-expanded={open}`.
6. The popover container: remove `font-inter`.
7. The hidden input: remove `readOnly`.

### R2 — GREEN: `src/components/places/BookingTimePicker.tsx`
1. The trigger: remove `aria-label="Choose time"` + `aria-expanded={open}`.
2. The unselected slots: the hover shadow `0.08` → `0.12`.
3. The popover container: remove `font-inter`.
4. The hidden input: remove `readOnly`.

### R3 — GREEN: `src/components/places/BookingForm.tsx`
The form class `mt-6 space-y-4` → `mt-6 space-y-4 font-inter` (the live's
form-level font contract). No other change — the POST contract, the success
note, and the reset are already exact.

### R4 — reseed + dev-server verification
`npm run db:seed` (idempotent), then dev-server DOM probes: the month row's
two children + the chevron inside the wrapper (absolute, 20px right inset);
the select's 700 weight; the weekday row's uppercase/700/1.2px; the
triggers' accessible names "Dates*"/"Time*" (a `getByRole` probe); the full
booking round-trip (range + time + submit + the VISIBLE reset); the mobile
390 popover direction (UP) unchanged; the form's font-inter.

### R5 — screenshots + docs
Re-capture the 19 screenshots on the remediated tree (new
`scripts/capture-screens-session56.mjs` following the session-54 pattern;
the 18/19 picker captures now document the aligned chrome). Docs aligned:
AGENTS.md, CLAUDE.md, README.md, the PAD v2.23 revision block,
activity-map_SKILL.md v1.22.9, the findings v2.23 addendum,
`docs/session_56.md` (this session's log), this plan, the repo worklog.

### R6 — the final full gate ×2
`npm run lint` → `npm run typecheck` → `npm run test` (113) → `npm run
build` → `./scripts/smoke-test.sh` (31) → `npm run test:e2e` (93, the
flipped + extended picker pins) — then the SSH-wrapper push to `main` (the
wrapper runbook, `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`), and
the operator key shredded post-push.

## 5. Guardrails

- `skills/` excluded from lint/typecheck/compile/test (already configured).
- `main` only — no new branches; Conventional Commit
  (`fix(parity): booking-picker chrome — month row/weekday/ARIA contracts (v2.23)`).
- Never commit `.env`, `db/*.db`, key material.
- The v2.22 picker LOGIC (the seam, the range semantics, the POST payload,
  the success note, the reset) is verified EXACT this session — this
  remediation only touches the CHROME details listed in §3; the seam's 21
  unit checks and the picker logic stay untouched.
- The mobile nav, identity, titles, and every other green pin must stay
  green — this remediation touches only the two picker components and the
  form's class list.
- F6's accepted equivalences are documented in the findings, not code.
