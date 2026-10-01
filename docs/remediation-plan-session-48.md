# Session 48 — Remediation Plan (same-day booking classification + profile/avatar live-drift parity)

Date: 2026-10-01 · Agent: coding specialist (session 48)

## 1. Context

Workspace refreshed from `https://github.com/nordeim/activity-map-g.git` at `eebcfcd`
(main = the a358ffb deep-link tree + the operator's session-47 log/server-log commit). Every
root doc re-read (AGENTS.md, CLAUDE.md, README.md, the PAD, activity-map_SKILL.md) plus the
session history (`docs/session_46.md`, `docs/remediation-plan-session-46.md`,
`docs/session_47.md`, the worklog Tasks 38–40, `docs/start_server_log.txt`). The mirror was
REDEPLOYED from the a358ffb tree before this session (the server log's fresh
install → db:push → db:seed → build → start sequence, 2026-10-01 08:25 +0800).

The audited range — `66c50de..a358ffb` (the v2.18 page-gate work) — was re-reviewed
file-by-file: `guestBootstrapUrl()` (pure, encodeURIComponent), `src/lib/page-gate.ts`
(`requireUser(next)` → 307 through the bootstrap with the page's own path), the 8 wired
pages, the chrome-only layouts, the sign-out full navigation, the smoke 14/14b checks, and
the 3+3 new unit/E2E pins. The wiring is sound and the deployed mirror confirms it live
(fresh `/profile`, `/eat`, `/map`, `/place/map-brass-marble` deep links all RETURN to their
target; sign-out renders the full guide as guest).

Baseline gates on the untouched tree: lint ✓ (0 errors, the 2 pre-existing script warnings) ·
typecheck ✓ · 75/75 unit ✓ · build ✓ (22 routes) · smoke 31/31 ✓ · **E2E 83/84 — 1 FAILING**
(`browse.spec.ts:389` "booking records a request visible on the profile").

## 2. Audit results

| Surface | Result |
|---------|--------|
| Deployed mirror deep links (v2.18) | Fresh-context `/profile` → STAYS on /profile (Guest identity); `/place/map-brass-marble`, `/eat`, `/map` all stay. Sign-out → full guide as guest (navbar + hero + planner). **Session 46's fixes are LIVE.** |
| Mobile navigation (both sites) | 390px: text links x=121/192/222/259 + icons 304/330/356 + the 52px border-box cream-glass bar (bg rgba(248,247,244,0.62) + blur(24px) saturate(1.5) + 1px border) — IDENTICAL on live and mirror. 1280px: pill links 433/559/639/727/805 + heart 957 + avatar 1001 (36×36). Footer compact 74×78 → grown 92×92. **NO Tailwind v4 regression — the five failure-class pins stay green.** |
| Live source drift sweep | Home h1 115.2px @ y=290 · blue band #4D61FF (3680px) · Eat h1 55px + 38px chips (same labels/order) · place-detail h1 82px + 1150×460 hero — all UNCHANGED. **TWO surfaces DRIFTED** (findings F2/F3 below). |
| Mirror console/errors | Zero console errors and zero page errors across /, /eat, /stay, /do, /map, /favourites, /login, /profile, /place/*. |
| Mirror booking flow (live repro) | Booking "Courtyard Stay" for TODAY at 19:00 → "Request sent" → profile shows **"Past (1)"** under the default Upcoming tab — F1 reproduced in production. |
| Clock | The sandbox crossed UTC midnight (2026-10-01 00:43 UTC) during this session — the exact boundary that detonated F1's time bomb. |

## 3. Findings

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| F1 | **HIGH** | **Same-day bookings classify as "Past".** ProfileView filters `new Date(b.startDate).getTime() < Date.now()` — an INSTANT comparison. A booking made NOW for tonight (19:00) flips to the Past bucket at 00:00 UTC, before the reservation happens. The E2E corpus time-bombed with it: `tests/e2e/browse.spec.ts:393` books the hardcoded "2026-10-01", so the suite (84/84 green through session 46, which ran before UTC midnight) now fails permanently. Reproduced LIVE on the deployed mirror: a today-19:00 booking lands under "Past (1)". | The failing E2E run (83/84, reproducible in isolation); `date` → 2026-10-01 00:43 UTC while `new Date("2026-10-01")` = 00:00 UTC; the mirror's profile tabs after a live same-day booking; `src/components/profile/ProfileView.tsx:60-65` |
| F2 | **Med** | **Profile identity drift (the live account changed).** The live source's profile now renders h1 **"Explorer"** (72px) with the subtitle **"Your Roam account"** (16px). The clone renders "sepnetflix2023" + the EMAIL as the subtitle — session-14's measurement is stale (the account was renamed upstream; the static subtitle line returned). | Live `/profile` DOM: h1 "Explorer" 72px, next-sibling "Your Roam account" 16px; mirror `/profile`: h1 "sepnetflix2023", subtitle the email |
| F3 | **Med** | **Desktop navbar avatar drift.** The live's right cluster renders the black 36×36 disc carrying a white **lucide User icon** (17×17, strokeWidth 2) — not a text initial. The clone renders the EMAIL-derived initial ("S"/"G") in white bold. (The mobile tab-bar right cluster is already icon-based and matches.) | Live header DOM: Profile link 36×36 bg rgb(14,14,14) with `lucide-user` svg (stroke #FFFFFF); mirror: same disc with text "G" |
| F4 | **Low** | **Hardcoded booking dates in fixtures.** `scripts/smoke-test.sh` books "2026-10-01"→"2026-10-03" (only asserts the 201 today, but rots identically); the E2E booking spec books "2026-10-01" (F1's carrier). | `scripts/smoke-test.sh:105`, `tests/e2e/browse.spec.ts:393` |
| F5 | Info | Non-gaps re-verified: deep links live on the redeployed mirror; the sign-out round-trip; mobile nav EXACT at 390/640/1280 on live + mirror + local; the footer growth; Eat chips; place-detail geometry; `.env` untracked with `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/` (118784 bytes); `.env.example` the complete env surface; vitest + playwright configs intact; smoke 31/31; zero console errors. | §2 audit table |

## 4. Plan (TDD)

| # | Task | Files | Verification |
|---|------|-------|--------------|
| R0 | **RED** — (a) new `tests/bookings.test.ts`: the pure seam's contract — yesterday → past; today @ 00:00 → upcoming; today late-evening → upcoming; tomorrow → upcoming; null/undefined → upcoming; an invalid date string → upcoming (never throws); a Date input → same contract. (b) E2E: the booking spec books a runtime-computed **TODAY** date (a deterministic same-day pin — RED until the classification fix, green forever after); the profile-identity spec pins the new live contract (h1 "Explorer", subtitle "Your Roam account"); the mobile-nav avatar pin flips from text "S" to the icon contract (an svg, no text); the guest spec's profile line pins the new subtitle | `tests/bookings.test.ts`, `tests/e2e/browse.spec.ts`, `tests/e2e/mobile-navigation.spec.ts`, `tests/e2e/guest.spec.ts` | the new unit file fails on the missing module; the 4 E2E edits fail against the current tree (RED documented) |
| R1 | **GREEN (F1)** — new pure seam `src/lib/bookings.ts` with `isBookingPast(startDate, now)`: a booking is past ONLY when its start CALENDAR DAY is strictly before the viewer's today (day-normalised comparison via local date parts + Date.UTC; null/invalid → never past). ProfileView's upcoming/past filters route through it | `src/lib/bookings.ts`, `src/components/profile/ProfileView.tsx` | `tests/bookings.test.ts` green; the E2E booking spec green (same-day booking visible under Upcoming) |
| R2 | **GREEN (F2 + F3)** — the seed's demo user `name: "Explorer"` (the live account's current identity); the profile subtitle becomes the static "Your Roam account" (16px #555550 — the live's current line); the Navbar's desktop avatar renders the white lucide **User icon** on the black disc (17×17, strokeWidth 2 — the live's exact chrome), dropping the email-initial render + the `userEmail` prop (mobile already renders the icon) | `prisma/seed.ts`, `src/components/profile/ProfileView.tsx`, `src/components/layout/Navbar.tsx`, `src/app/(app)/layout.tsx` | the E2E identity + avatar pins green; a dev-server profile screenshot shows "Explorer" + "Your Roam account" |
| R3 | **Smoke fixture hygiene (F4)** — the smoke booking books dynamic future dates (GNU `date -d "+7 days" +%F` → `+9 days`); the reversed pair stays 400 | `scripts/smoke-test.sh` | `bash -n` clean · 31/31 green |
| R4 | Re-seed the local `db/custom.db` (the new demo name) → verify the dev server → re-capture the 16 screenshots on the remediated tree (the session-46 capture pattern: login first per context) | `docs/screenshots/*.png`, `scripts/capture-screens-session48.mjs` | 16 healthy captures; the profile capture shows the new identity |
| R5 | Docs alignment: AGENTS.md (the avatar fact, the profile identity fact, the booking-classification rule, the gate counts), CLAUDE.md (same), README (the feature-table rows + divergence note), the PAD v2.19 (revision block + the amended identity/avatar + the booking-day rule), activity-map_SKILL.md v1.22.5, `docs/findings_to_validate_and_update.md` (v2.19 addendum), the worklog, `docs/session_48.md`, this plan's execution record | the docs | every doc claim matches the tree |
| R6 | Final gate ×2 on the push tree: lint → typecheck → unit → build → smoke ×2 → E2E ×2, then the single conventional commit + the SSH-wrapper push to main | — | all gates green ×2; push verified; key shredded |

Non-gaps (keep, verified unchanged): every §2 parity surface, the deep-link contract, the
DB pinning + the repo-root `db/` story, `.env` untracked, `.env.example`, the vitest/
playwright config structure, the mobile-nav failure-class pins, the smoke 13b–14b checks,
the npm-audit-0 state.

## 5. Design rationale

- **Why calendar-day, not instant**: the reservation's own time field (19:00) says the stay
  is in the future; classifying it "Past" at midnight contradicts the field's meaning and
  the Upcoming tab's empty-state copy ("No upcoming reservations"). A same-day reservation
  stays Upcoming until its day ends — the minimal, unambiguous rule. The comparison
  normalises BOTH dates to local calendar days (`Date.UTC(y, m, d)` of the local parts), so
  a UTC-midnight-parsed "2026-10-01" and the viewer's "today" compare as the same day in
  every non-negative-offset timezone the demo deployment cares about (+0800/UTC).
- **Why a pure seam (`src/lib/bookings.ts`)**: the repo's convention — display/classification
  logic lives in unit-tested `src/lib/*` pure functions, not inline in components
  (CLAUDE.md's "Pure seams are unit-tested"). ProfileView keeps only the tab/filter wiring.
- **Why pin the same-day case with TODAY (not a future date) in the E2E**: a future-date
  booking would re-rot the day the clock passes it; the same-day pin is deterministic
  forever AND pins exactly the boundary the fix changes (today-19:00 → Upcoming).
- **Why match the live's new identity/avatar**: parity is measured against the live's
  CURRENT state (the ANALYZE principle — re-measure, never assume). The account rename
  ("Explorer") and the returned static subtitle are the live's present truth; the avatar
  disc's content follows the live's icon render, which also makes the chrome
  account-agnostic (guest "G" and demo "S" both become the same User icon — exactly what
  the live shows for its account).

## 6. Execution record

- **R0 (RED, documented)**: `tests/bookings.test.ts` created (8 checks) — run failed on the
  missing `@/lib/bookings` module. The E2E booking spec re-pinned to the runtime-computed
  TODAY date; the profile-identity pins flipped (h1 "Explorer" / subtitle "Your Roam account"
  / the email line counted 0 / both h1 bounding-box probes renamed); the mobile-nav avatar pin
  flipped from `toHaveText("S")` to the icon contract (empty text + one 17×17 `svg.lucide-user`
  + the black disc); the guest spec's profile line flipped to the new subtitle. Entry state:
  75 unit (8 failing) / 84 E2E (4+ failing against the old code).
- **R1 (GREEN, F1)**: `src/lib/bookings.ts` created (`isBookingPast` — calendar-day ordinal
  via local parts + Date.UTC; null/empty/invalid never past); ProfileView's filters route
  through it (`useMemo`'d `now`). 83/83 unit ✓ (75 + 8).
- **R2 (GREEN, F2+F3)**: seed name "Explorer"; ProfileView subtitle "Your Roam account";
  Navbar avatar = the white 17×17 strokeWidth-2 lucide User icon (one DOM node —
  `md:[stroke-width:2]`; the two-svg first attempt failed the count-1 pin and was simplified);
  the `userEmail` prop + `initials` import retired; the `(app)` layout renders `<Navbar />`.
  Dev-server verification: avatar 17×17/2px at 1280; profile h1 "Explorer" + "Your Roam
  account" + "Upcoming (2)" (the same-day booking) / "Past (0)".
- **R3**: smoke booking dates dynamic (`date -d "+7 days"` / `+9 days`; the reversed pair
  still 400). `bash -n` clean · 31/31 ✓.
- **R4**: `db/custom.db` reseeded (the new demo name; 118784 bytes);
  `scripts/capture-screens-session48.mjs` captured the 16-screenshot set (login-first per
  context; a same-day booking POSTed before the profile capture → `10-profile-desktop.png`
  documents the fix).
- **R5**: AGENTS.md (identity/avatar/booking facts + 83-count), CLAUDE.md (pyramid 83 + the
  session-48 identity row), README (feature rows + tests table + the screenshot narrative +
  the session-48 history row), the PAD v2.19 (revision block; the duplicated v2.18 revision
  entry de-duplicated; §3.2 tree + bookings.test.ts; §6.2 `isBookingPast`; §7.1 table + totals;
  §7.3 seams+gate; the §11 tree's smoke count corrected 30→31; §12 glossary + the
  calendar-day term), activity-map_SKILL.md v1.22.5 (project_state + the pre-ship 83), the
  findings v2.19 addendum, the worklog, `docs/session_48.md`, this record.
- **R6 (final gate, push tree)**: lint ✓ (0 errors, the 2 pre-existing script warnings) ·
  typecheck ✓ · 83/83 unit ✓ · build ✓ · 31/31 smoke ✓ (×2) · 84/84 E2E ✓ (×2) — single
  conventional commit + the SSH-wrapper push to `main`.
