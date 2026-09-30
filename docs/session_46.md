# Session 46 — Audit of the v2.16/v2.17 range + the deep-link-preserving gates (v2.18)

Date: 2026-10-01 · Agent: coding specialist (session 46) · Plan: `docs/remediation-plan-session-46.md`

## What this session was asked to do

Refresh the workspace from `https://github.com/nordeim/activity-map-g.git`, internalize the
root docs + session history, validate the documented state against the code, audit and
validate the recent changes captured in `docs/recent_changes_to_validate.txt`
(the `20e6f9e..1964242` range = the v2.16/v2.17 guest-bootstrap work), iterate toward
parity with `https://activity-map.base44.app/`, run browser-based E2E against the deployed
mirror (`https://activity-map.jesspete.shop/`) and the local server — paying particular
attention to the mobile navigation menu and possible Tailwind v4 bugs — then remediate
(TDD), re-capture screenshots, align the docs, and push to `main` via the SSH wrapper.

## 1. Understanding + baseline (untouched tree at 66c50de)

Every root doc re-read (AGENTS, CLAUDE, README, the PAD, the SKILL) plus
`docs/session_45.md`, `docs/remediation-plan-session-36.md`, the findings doc (incl. the
v2.16/v2.17 addenda), `docs/recent_changes_to_validate.txt`, `docs/start_server_log.txt`,
and the worklog tail (Tasks 35–39). The scandihaven reference repo re-cloned; its
patterns re-verified as already followed (Next 16.3 + React 19 + Tailwind v4.3 CSS-first
with literal-hex `@theme` tokens + Vitest/Playwright; its `@source`/`proxy.ts` notes are
monorepo-specific and N/A here). Skills consulted from the repo's own
`skills/skills-catalog.md`: `code-review-checklist`, `tdd`, `agent-browser`,
`nextjs16-tailwind4` (the mobile-nav failure taxonomy), `tailwind-patterns`.

Environment: `npm install` (436 packages, 0 vulnerabilities — the session-36 override
holding) → `npm run db:push` → `npm run db:seed` (the 118784-byte `<repo>/db/custom.db`,
the exact documented size; the `.env` `DATABASE_URL="file:../db/custom.db"` + the
inline-pinned scripts resolve to the repo-root `db/` folder).

Baseline gates: lint ✓ (0 errors, the 2 pre-existing script warnings) · typecheck ✓ ·
72/72 unit ✓ · build ✓ (22 routes) — and **E2E 79/81: 2 FAILING** (`tests/e2e/guest.spec.ts`
— the profile deep link and the sign-out round-trip). The failing pair had never been
executed before: sessions 38/39 recorded only `playwright test --list 81 ✓` (a census),
not a run. That process gap is finding F2 and the reason F1 shipped.

## 2. The audit (dual-site browser + code)

- **Live source** (`activity-map.base44.app`, logged in with the demo account): every
  swept signature UNCHANGED — desktop nav links x=433/559/639/727/805 @1280 · mobile
  tab-bar @390 text links 121/192/222/259 + icons 304/330/356 + the 52px border-box glass
  (rgba(248,247,244,0.62) + blur(24px) saturate(1.5)) · footer pill compact 506×96 →
  grown 646×118 with 92×92 links. **And: a FRESH context deep link to `/eat` STAYS on
  /eat** — the live preserves logged-out deep links.
- **Deployed mirror** (`activity-map.jesspete.shop`): the guest bootstrap live (auto-signed
  "G" avatar); mobile nav geometry EXACT at 390; tap navigation with the 700/ink active
  state; the favourites round-trip through the empty state; the demo login round-trip
  (the "S" avatar + the sepnetflix2023 profile); zero console errors across 8 pages. But a
  FRESH context deep-linking to `/profile` or `/place/map-brass-marble` **lands on `/`** —
  F1 reproduced in production. The post-sign-out DOM was also the broken empty shell (no
  navbar/main) — the soft-nav defect below, live on the deployed v2.17 build.
- **Local dev server**: the same EXACT mobile-nav geometry (121/192/222/259 + 304/330/356
  + the 52px glass) and the desktop pill links (433/559/639/727/805) — **no Tailwind v4
  regression anywhere** (the five failure-class pins stay green in the 84-check suite).

Findings F1–F5 are tabulated in the plan. F1 (HIGH): the layout gates passed no `?next=`,
so every fresh deep link bounced to `/` (the layouts cannot learn the request path —
verified empirically: `headers()` exposes only proxy headers, and a layout redirect always
preempts a page's, so the gate must live in the pages). F3 (MED): `.env` was GIT-TRACKED
carrying a live `AUTH_SECRET`.

## 3. The remediation (TDD — the plan's R0–R6)

- **R0 RED**: +3 `guestBootstrapUrl` unit checks (failed: "not a function") and +3 E2E
  deep-link pins (/eat, /map, /place/map-brass-marble), alongside the 2 existing RED
  guest specs.
- **R1 GREEN**: the path-aware gate — `guestBootstrapUrl(next)` (pure, encodeURIComponent)
  in `src/lib/guest.ts`; `requireUser(next)` in the new `src/lib/page-gate.ts`; wired
  into all 8 authenticated pages (home `/`, eat, stay, do, map, favourites,
  place/[slug] with `/place/${slug}`, profile) with the `user!` assertions dropped;
  the `(app)` layout became chrome-only (`{user ? <Navbar/> : null}`) and the `(bare)`
  layout dropped its redundant gate. **En-route root cause (the sign-out failure)**:
  `router.replace("/")` + `router.refresh()` after logout — the App Router's RSC soft-nav
  cannot follow a server redirect that targets a route handler; it rendered an empty
  shell (no navbar/main) — sign-out now performs `window.location.assign("/")` so the
  307→303 bootstrap chain applies at document level (login keeps `router.refresh()`;
  its POST sets the cookie directly).
- **R2**: the smoke suite's check 14 became next-aware (+ the new 14b deep-link check) →
  **31/31**.
- **R3**: `.env` untracked (`git rm --cached`); `.env.example` verified as the complete
  env-surface match and included in the push.
- **R4**: 16 screenshots re-captured on the remediated tree
  (`scripts/capture-screens-session46.mjs`; login is each context's FIRST navigation now
  — the guest bootstrap bounces authenticated visits off `/login`).
- **R5**: 10 docs aligned (AGENTS, CLAUDE, README, PAD v2.18, SKILL v1.22.4, DEPLOYMENT,
  findings, the worklog, this log, the plan).
- **R6**: lint ✓ · typecheck ✓ · 75/75 unit ✓ · build ✓ · 31/31 smoke ✓ · 84/84 E2E ✓ —
  all gates green on the push tree; single conventional commit pushed to `main` via
  `docs/ssh_git_wrapper_v3.py`.

## 4. Delivered

- The deep-link contract: a first-time visitor opening ANY authenticated page's URL
  returns to that page through the login-free bootstrap (the live's behavior).
- The sign-out round-trip actually renders the guide (it was shipping an empty shell).
- The E2E corpus for the guest suite EXECUTED for the first time (84/84) — the `--list`-
  is-not-a-pass lesson encoded in AGENTS.md and the PAD's gate line.
- `.env` out of the tracked tree (the live secret had been committed since the v2.16
  upload).
- Gates: 75 unit · 31 smoke · 84 E2E — all green; 16 fresh screenshots; 10 docs aligned;
  one commit on `main` (no branches).

## 5. Suggested next steps

1. Redeploy the mirror from this tree — the deployed v2.17 build still carries the
   deep-link bounce + the post-sign-out empty shell (both fixed here).
2. After redeploying, re-run `./scripts/smoke-test.sh` once against production to confirm
   the `next start` path end-to-end (the runbook's post-deploy step).
3. Rotate the `AUTH_SECRET` that was previously git-tracked (defense-in-depth; the
   committed value lives in git history) — update `.env` on the deployment box.
