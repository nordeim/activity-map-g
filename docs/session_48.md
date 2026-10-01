# Session 48 — Audit of the v2.18 range + the calendar-day booking classification (v2.19)

Date: 2026-10-01 · Agent: coding specialist (session 48) · Plan: `docs/remediation-plan-session-48.md`

## What this session was asked to do

Refresh the workspace from `https://github.com/nordeim/activity-map-g.git`, internalize the
root docs + the session history (`docs/session_46.md`, `docs/remediation-plan-session-46.md`,
`docs/session_47.md`, the worklog, `docs/start_server_log.txt`), audit and validate the recent
changes in git commit `66c50de..a358ffb` (the v2.18 deep-link work), iterate toward parity with
`https://activity-map.base44.app/` (logging into the live with the demo account), run
browser-based E2E against the deployed mirror (`https://activity-map.jesspete.shop/`) — paying
particular attention to the mobile navigation menu and possible Tailwind v4 bugs — then
remediate (TDD), re-capture screenshots, align the docs, and push to `main` via the SSH
wrapper. The `skills/` folder stays excluded from code checking, testing, and compilation.

## 1. Understanding + baseline (tree at a358ffb + the operator's eebcfcd log commit)

Every root doc re-read (AGENTS, CLAUDE, README, the PAD, the SKILL) plus the session history
and the fresh `docs/start_server_log.txt` (the operator REDEPLOYED the mirror from the a358ffb
tree before this session: fresh install → db:push → db:seed → build → start, 2026-10-01 08:25
+0800). Skills consulted from the repo's own `skills/skills-catalog.md`: `agent-browser`,
`code-review-checklist`, `tdd`, `nextjs16-tailwind4` (the mobile-nav failure taxonomy).

Baseline gates: lint ✓ (0 errors, the 2 pre-existing script warnings) · typecheck ✓ ·
75/75 unit ✓ · build ✓ (22 routes) · smoke 31/31 ✓ · **E2E 83/84 — 1 FAILING**
(`browse.spec.ts:389` "booking records a request visible on the profile") — reproducible in
isolation, and the tree is IDENTICAL to the one session 46 verified 84/84 twice. Root cause
category: a TIME BOMB, not a code regression between sessions (§2).

## 2. The audit (dual-site browser + code + clock)

- **The audited v2.18 code reviewed file-by-file**: `guestBootstrapUrl()` (pure,
  encodeURIComponent), `src/lib/page-gate.ts` (`requireUser(next)` → 307 through the bootstrap
  with the page's own path), the 8 wired pages, the chrome-only layouts, the sign-out full
  navigation, the smoke 14/14b checks, the 3+3 unit/E2E pins. Sound.
- **The deployed mirror (redeployed, v2.18 live)**: fresh-context deep links to `/profile`,
  `/place/map-brass-marble`, `/eat`, `/map` all STAY on their target (the Guest identity
  profile renders); sign-out renders the full guide as guest (navbar + hero + planner) —
  session 46's two fixes confirmed LIVE. Zero console errors across 9 pages. Mobile nav
  geometry EXACT at 390 (text 121/192/222/259 + icons 304/330/356 + the 52px cream-glass bar
  with blur(24px) saturate(1.5)) and desktop 1280 (pill links 433/559/639/727/805 + heart 957 +
  avatar 1001). **No Tailwind v4 regression** (the five failure-class pins green).
- **The live source (logged in with the demo account)**: home h1 115.2px @ y=290, blue band
  #4D61FF, Eat h1 55px + the 38px chip set (same labels/order), place-detail h1 82px + the
  1150×460 hero, grown footer 92×92 links — all UNCHANGED. **TWO surfaces drifted**
  (findings F2/F3): the profile h1 now reads "Explorer" with the STATIC "Your Roam account"
  subtitle (the email line is gone — the account was renamed upstream), and the navbar's black
  avatar disc renders the white lucide USER ICON (17×17, strokeWidth 2), not a letter initial.
- **The clock**: the sandbox crossed UTC midnight during the session (2026-10-01 00:43 UTC) —
  the exact boundary that flipped the E2E booking spec's hardcoded "2026-10-01" fixture from
  upcoming to past, detonating the suite. The same INSTANT comparison ships in
  `ProfileView`: **booking "Courtyard Stay" for TODAY 19:00 on the deployed mirror landed
  under "Past (1)"** — F1 reproduced live in production.

Findings F1–F5 are tabulated in the plan (§3): F1 HIGH — same-day bookings classified Past
(live defect + the E2E time bomb); F2 MED — profile identity drift; F3 MED — avatar drift;
F4 LOW — hardcoded booking dates in the smoke + E2E fixtures; F5 INFO — every other parity
surface verified exact.

## 3. The remediation (TDD — the plan's R0–R6)

- **R0 RED**: new `tests/bookings.test.ts` (8 checks: yesterday past; today @ 00:00 upcoming —
  the exact time-bomb case; today late-evening upcoming; tomorrow upcoming; null/undefined/
  empty never past; invalid never past; wall-clock time inside the day ignored; the
  no-`now` default) — failed on the missing module. The E2E booking spec re-pinned to a
  runtime-computed TODAY date (RED until the classification fix, deterministic forever after);
  the profile-identity pins flipped to the live's current contract (h1 "Explorer", subtitle
  "Your Roam account", the email line counted 0); the mobile-nav avatar pin flipped from the
  text "S" to the icon contract (empty text + one 17×17 `svg.lucide-user` on the black disc);
  the guest spec's profile line flipped to the new subtitle.
- **R1 GREEN (F1)**: the pure `isBookingPast(startDate, now)` seam in the new
  `src/lib/bookings.ts` — CALENDAR-DAY comparison (day-ordinal from the LOCAL parts via
  `Date.UTC`; null/invalid never past). ProfileView's upcoming/past filters route through it
  (the `now` memoised once per mount). 8/8 unit green; the E2E booking spec green (the
  same-day reservation visible under Upcoming).
- **R2 GREEN (F2 + F3)**: `prisma/seed.ts` — the demo user seeds as name "Explorer" (the live
  account's current identity; the value session 12 measured, back again after session 14's
  "sepnetflix2023"); ProfileView's subtitle is the static "Your Roam account" (16px #555550);
  the Navbar's desktop avatar renders the white 17×17 strokeWidth-2 lucide `User` icon on the
  36px black disc — ONE DOM node (the `md:[stroke-width:2]` arbitrary property overrides the
  presentation attribute from md up; mobile keeps the measured 18px/1.5 tab-bar icon), the
  email-derived initial + the `userEmail` prop retired (the `(app)` layout no longer passes
  it). Dev-server verification: the avatar computes 17×17 / stroke-width 2px at 1280; the
  profile shows h1 "Explorer" + "Your Roam account" + the same-day booking under
  "Upcoming (2)" with "Past (0)".
- **R3 (F4)**: the smoke booking fixtures use runtime-computed dates (`date -d "+7 days"` →
  `+9 days`; the reversed pair stays 400) — `bash -n` clean, 31/31 green.
- **R4**: the local `db/custom.db` reseeded (the new demo name); 16 screenshots re-captured
  via `scripts/capture-screens-session48.mjs` (the session-46 login-first pattern + a same-day
  reservation POSTed before the profile capture — `10-profile-desktop.png` documents the fix:
  the booking renders under "Upcoming", the identity reads "Explorer").
- **R5**: docs aligned (AGENTS, CLAUDE, README, the PAD v2.19 — revision block, §3.2 tree,
  §6.2 utilities, §7.1/§7.3 gates, §12 glossary; the SKILL v1.22.5; the findings v2.19
  addendum; the worklog; this log; the plan's execution record).
- **R6 (final gate on the push tree)**: lint ✓ (0 errors, the 2 pre-existing script warnings)
  · typecheck ✓ · **83/83 unit** ✓ · build ✓ · **31/31 smoke** ✓ · **84/84 E2E** ✓ — plus the
  final re-run of smoke + E2E for the ×2 confirmation, then the single conventional commit and
  the SSH-wrapper push to `main`.

## 4. Delivered

- **The calendar-day booking classification**: a reservation for TONIGHT stays under
  "Upcoming" until its day ends — the live production defect (Past at midnight, before the
  reservation happens) is closed, and the E2E corpus's first time-bomb is defused (the
  booking fixtures are runtime-computed; the same-day pin can never cross itself).
- **The live's current identity/avatar parity**: the seed, the profile identity card, and the
  navbar avatar all match the live's present state ("Explorer" + "Your Roam account" + the
  account-agnostic user-icon disc).
- **The v2.18 range audited and verified live on the redeployed mirror** (the deep-link
  contract, the sign-out round-trip, the mobile-nav geometry, zero console errors — no
  Tailwind v4 regression).
- Gates: 83 unit · 31 smoke · 84 E2E — all executed green; 16 fresh screenshots; 10+ docs
  aligned; one commit on `main` (no branches), pushed via `docs/ssh_git_wrapper_v3.py`.

## 5. Suggested next steps

1. Redeploy the mirror from this tree and re-run `./scripts/smoke-test.sh` once against
   production (the runbook's post-deploy step) — the deployed profile will then show the
   calendar-day classification and the "Explorer" identity (a re-seed is required for the new
   demo name).
2. Keep watching the live source's account state — the identity surface (name + subtitle +
   avatar) has changed twice since session 12; it is cheap to re-measure each session.
3. Consider a periodic E2E run on a schedule (or before every deploy): the time-bomb class
   this session caught only surfaces when the clock crosses a fixture's boundary.
