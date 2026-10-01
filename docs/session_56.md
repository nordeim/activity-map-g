# Session 56 — the booking-picker CHROME re-alignment (v2.23)

Date: 2026-10-01 · Agent: coding specialist (session 56 — the repo's own
numbering; the operator's `docs/session_55.md` is the raw session-54
narrative; the plan is `docs/remediation-plan-session-55.md`)

## 1. Context

Workspace refreshed at `25144c9` (main = the v2.22 tree `22d2ba4` + the
operator's `docs/session_55.md` + the redeploy `docs/start_server_log.txt`
— the mirror redeployed from the v2.22 tree 2026-10-01 12:55 +0800). Every
root doc re-read (AGENTS.md, CLAUDE.md, README.md, the PAD v2.22,
activity-map_SKILL.md v1.22.8) plus the session history (`docs/session_54.md`,
`docs/remediation-plan-session-53.md`, `worklog.md`, `docs/session_55.md`,
`docs/start_server_log.txt`). The v2.22 range (`61da59a..22d2ba4`)
re-audited file-by-file — the shipped picker logic sound. Skills consulted
from the repo's `skills/skills-catalog.md`: agent-browser (the dual-site
audit driver), clone-app-pat-pro (computed-style ground truth), tdd (the
RED→GREEN loop), nextjs16-tailwind4 (the mobile-nav failure taxonomy),
code-review-checklist (the range audit). `skills/` excluded from code
checking, testing, and compilation.

## 2. Baseline gates (the untouched tree)

lint ✓ (0 errors, the 2 pre-existing script warnings) · typecheck ✓ ·
**113/113 unit** ✓ · build ✓ (22 routes) · **31/31 smoke** ✓ · **93/93
E2E** ✓ — matching the session-54 records exactly. `.env` with
`DATABASE_URL="file:../db/custom.db"` (the `db/` folder at the repo root,
the 118784-byte seeded `db/custom.db`); Vitest + Playwright configs verified
in place.

## 3. The dual-site audit (the redeployed v2.22 mirror vs the live source)

| Surface | Result |
|---------|--------|
| The v2.22 picker LOGIC | EXACT on both sites: the range semantics (the mid-pick label in `text-roam-muted`, the complete label + the hidden "<iso> to <iso>"), the reopen-with-range highlights (violet endpoints + the `#F0E9FF` tint, the month anchored to the range start), the single-day collapse, the 19:00 selection + check, the plain 12px/600 `#2A6B3A` success note (the live's copy, 16px top margin), the form reset (verified on a CLEAN round-trip — an earlier "reset failure" was traced to a corrupted probe state: a manually-removed popover element desynced the React open-state; the clean retest resets EXACTLY), the 29-slot time list, the 42-cell grid + the 12-option month select, the chevron rotation, the phones-UP/md-DOWN popover direction (308px at 390). |
| Mobile nav (the task's focus) | EXACT at 390: the 52px cream-glass tab-bar (blur 24 + saturate 1.5 + the 0.62 tint), text links x=121/192/222/259, icons x=304/330/356 @18px — IDENTICAL on the live. Taps: Map→/map, Heart→/favourites, Profile→/profile. **NO Tailwind v4 regression.** |
| Desktop nav / identity / hero / titles / footer | Desktop nav 433/559/639/727/805 + heart 957 + avatar 1001 IDENTICAL (the live's "S" 14px/700; the mirror's guest the user icon). The identity did NOT oscillate (the SIXTH measurement: "sepnetflix2023" + the email subtitle). The hero photo BYTE-IDENTICAL (md5 `5058794d…` both). The 11-route title sweep exact. The footer geometry equal. Zero console + page errors on both sites. |
| **The picker CHROME** | **FIVE gaps (F1–F5, the live's DOM verbatim):** (F1) the month row — the live renders `mb-3 flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 text-roam-text` (no `relative`) with exactly TWO children: a `relative flex-1` wrapper holding the month select + the chevron `pointer-events-none absolute right-5 top-1/2 -translate-y-1/2` (15px, stroke 2, 20px inset) and the calendar-days icon (16px, **stroke 2**) at the row's END; the mirror rendered icon-first + chevron-last. VLM-confirmed visible. (F2) the month select is `font-bold` (700) with `transition-all duration-200 hover:border-[#571AFF] focus:border-[#571AFF]` and NO aria-label; the mirror ran 600 with no hover/focus. (F3) the weekday row is `font-bold uppercase tracking-[0.12em]` (700, 1.2px, #888580); the mirror `font-medium` (500). (F4) the day-cell + time-slot hover shadows are `0 10 22 /0.12`; the mirror 0.08. (F5) the ARIA + font contract — the live's triggers carry NO aria-label/aria-expanded (the accessible names are the wrapping labels' "Dates*"/"Time*"), the live's form carries `font-inter`, the live's popover containers do NOT, the hidden inputs are not readOnly; the mirror's `aria-label` had also MASKED the E2E reset pin. (F6 INFO, accepted) the month option VALUE format, the heart/avatar BUTTON-vs-link tags, the token-name classes — all computed-identical. |

## 4. The TDD remediation (R0–R6)

- **R0 RED**: the E2E trigger queries flipped to the label-derived anchored
  regexes `/^Dates\*/`/`/^Time\*/` (6 sites), the reset pins became VISUAL
  (`toHaveText("Choose dates")`/`"Choose time"` — the pin the aria-label
  queries could never fail), the mid-pick single-day assertion flipped to a
  text form, and the new chrome pins (the month-row two-child structure via
  an evaluate probe, the 700 select, the uppercase/700/1.2px weekday row,
  the absent aria attributes, the form's font-inter, the containers'
  absent font-inter). 3 tests RED as predicted.
- **R1 GREEN** `BookingDatePicker.tsx`: the restructured month row (the
  `relative flex-1` wrapper + the absolute chevron + the calendar icon at
  the END, stroke 2, the row's `relative` dropped), the `font-bold` select
  with the violet hover/focus, the uppercase weekday row, the 0.12 shadow,
  no aria-label/aria-expanded, the container's font-inter dropped, the
  hidden input's readOnly dropped.
- **R2 GREEN** `BookingTimePicker.tsx`: the same trigger/ARIA/shadow/
  font-inter/readOnly changes.
- **R3 GREEN** `BookingForm.tsx`: `mt-6 space-y-4 font-inter`.
- **R4 verification**: reseeded; the dev-server DOM probes match the live
  NUMERICALLY (row 359×52 r16 pad 8/12 · wrapper 307×36 @x=12 · select
  307×36 700/48px-pr · chevron 15px/20px-inset/absolute/pe-none · icon
  16px/stroke-2/gap-12 · weekday 700/uppercase/1.2px); the booking
  round-trip resets VISUALLY (Dates + Time + Name); the mobile popover
  opens UP at 308px; a matched-state VLM comparison returned "no real,
  visible differences".
- **R5**: 19 screenshots re-captured (`scripts/capture-screens-session56.mjs`);
  8 docs aligned (AGENTS, CLAUDE, README + the history row, PAD v2.23,
  SKILL v1.22.9, the findings v2.23 addendum, this log, the worklog).
- **R6 the full gate ×1 (the push run)**: lint 0 errors · typecheck ✓ ·
  **113/113 unit** · build ✓ · **31/31 smoke** · **93/93 E2E**.

## 5. En-route lessons (recorded for the next audit)

- A label-wrapped control's accessible name is the LABEL's text — an
  `aria-label` on the control OVERRIDES it and silently masks any
  text-based E2E pin; prefer the label-derived name + a VISUAL text
  assertion.
- The label-derived accessible name EXPANDS while the popover inside the
  label is open (the label's textContent grows) — exact-match role queries
  time out mid-test; use anchored regexes.
- Synthetic `element.click()` fires no mousedown, so a popover's
  outside-click guard never runs — TWO popovers can be open simultaneously
  in a scripted session, and a trigger TOGGLES (a second click closes).
  Never remove a popover element from the DOM by hand mid-session (it
  desyncs React's open state and produces phantom "bugs").
- The VLM can misjudge weight/spacing across screenshots captured at
  different scroll positions or months — the computed-style + numeric
  geometry comparison is the ground truth (the matched-state comparison
  then confirmed the fix).

## 6. The push

Single conventional commit `fix(parity): booking-picker chrome — month
row/weekday/ARIA contracts (v2.23)` on main (no branches) via
`docs/ssh_git_wrapper_v3.py`; the operator key shredded post-push.
