# Session 46 — Remediation Plan (deep-link-preserving guest bootstrap + gate-alignment)

Date: 2026-10-01 · Agent: coding specialist (session 46)

## 1. Context

Workspace refreshed via a fresh `git clone` of `https://github.com/nordeim/activity-map-g.git`
at `66c50de` (main). Every root doc re-read in full (AGENTS.md, CLAUDE.md, README.md, the
PAD, activity-map_SKILL.md) plus the session history (`docs/session_45.md` — the session-36
log, `docs/remediation-plan-session-36.md`, `docs/findings_to_validate_and_update.md`
incl. the v2.16/v2.17 addenda, `docs/recent_changes_to_validate.txt`,
`docs/start_server_log.txt`, the worklog Tasks 35–39). The scandihaven reference repo
re-cloned and its patterns re-verified (Next 16.3 + React 19 + Tailwind v4.3 CSS-first
with literal-hex `@theme` tokens + Vitest/Playwright — activity-map already follows all
of them; its `@source`/`proxy.ts` notes are monorepo-specific and N/A here).

The audited range — `20e6f9e..1964242` (per `docs/recent_changes_to_validate.txt`) — is
the v2.16/v2.17 guest-bootstrap work: `src/lib/guest.ts`, `src/app/api/auth/guest/route.ts`,
`tests/guest.test.ts`, `tests/e2e/guest.spec.ts`, the three session gates, `prisma/seed.ts`
(guest user), `scripts/smoke-test.sh` (13b–13d + 14), ProfileView's sign-out routing, and
the 8 aligned docs.

## 2. Audit results

| Surface | Result |
|---------|--------|
| Baseline gate (untouched tree at 66c50de) | lint ✓ (0 errors, the 2 pre-existing script warnings) · typecheck ✓ · 72/72 unit ✓ · build ✓ (22 routes) · **E2E 79/81 — 2 FAILING (F1 below)** |
| Live source (`activity-map.base44.app`, logged in) | Every swept signature UNCHANGED: desktop nav links x=433/559/639/727/805 @1280 · mobile tab-bar @390 text links 121/192/222/259 + icons 304/330/356 + the 52px border-box glass bar (rgba(248,247,244,0.62) + blur(24px) saturate(1.5)) · footer pill compact 506×96 → grown 646×118 / links 92×92. **NO DRIFT.** |
| Live source logged-out deep link | `GET /eat` in a FRESH browser context **STAYS on /eat** (renders "Eat Well Tonight") — the live preserves deep links. |
| Deployed mirror (`activity-map.jesspete.shop`) | Guest bootstrap live; mobile nav geometry EXACT @390 (121/192/222/259 + icons + 52px glass); tap navigation with the 700/ink active state; favourites round-trip through the empty state; sign-out → guide-as-guest; demo login → "sepnetflix2023" identity; **zero console errors** across 8 pages. **FRESH-CONTEXT DEEP LINKS BOUNCE TO `/` (F1 reproduced in production).** |
| Local dev server (`npm run dev`, seeded 118784-byte `db/custom.db`) | Mobile nav geometry @390 EXACT (121/192/222/259 + 304/330/356 + 52px cream glass); desktop pill links 433/559/639/727/805; guest chain `GET / → 307 → 303 + Set-Cookie → 200`. No Tailwind v4 regression. |

## 3. Findings

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| F1 | **HIGH** | **Deep-link regression (the audited v2.16/v2.17 changes): a session-less visitor deep-linking to ANY authenticated page — /profile, /eat, /stay, /do, /map, /favourites, /place/[slug] — is bounced to `/`.** The three session gates call `redirect(GUEST_BOOTSTRAP_PATH)` WITHOUT a `?next=` param, so the bootstrap 303s to its default `/` and the visitor's destination is lost. The live source preserves deep links (fresh `/eat` stays on /eat); the E2E spec written with the changes (`tests/e2e/guest.spec.ts:34,40`) pins the intended behavior — but the E2E suite was never EXECUTED for those commits (the docs record only `playwright test --list 81 ✓`), so the RED state slipped through. | `npx playwright test` → 2 failed (79 passed); reproduced on the deployed mirror with a fresh agent-browser context (`/profile` and `/place/map-brass-marble` → both land on `/`); local curl `-L` traces show `GET /profile → 307 /api/auth/guest → 303 / → 200` |
| F2 | Med | Process gap: sessions 38/39 recorded "E2E 81 ✓" from `--list` (a census), never from a run. The repo's own gate order demands the executed suite before push. | worklog Tasks 38/39 + the findings doc's v2.16/v2.17 addenda say "Build/smoke/E2E NOT run (no server boot in this environment)" |
| F3 | Med | `.env` is GIT-TRACKED carrying a live `AUTH_SECRET` (and `NEXT_PUBLIC_SITE_URL`), contradicting AGENTS.md ("Never commit `.env`") and `.gitignore` (`.env` is listed but only ignores UNTRACKED files). The same secret is also printed in `docs/start_server_log.txt`. Public-repo secret exposure. | `git ls-files \| grep '^.env'` → `.env` tracked; `cat .env` → the hex secret |
| F4 | Low | The v2.16 gate is triple-redundant: `(bare)/layout.tsx` AND `(bare)/profile/page.tsx` both gate the same route (the layout always wins the render race, so the page gate is dead code today). | both files read in full |
| F5 | Info | Non-gaps re-verified: the mobile navigation menu works exactly as expected at 390/640/1280 on the live, the mirror, and the local dev server (geometry EXACT, taps + active states working, `no-scrollbar` safety valve intact) — **no Tailwind v4 regression**; the npm-audit 0-vulnerability state, the DB pinning (118784 bytes), the seeded guest account, the relative-Location 303, the smoke 13b–13d checks, and the favourites/booking/login round-trips are all green. | §2 audit table |

## 4. Plan (TDD)

| # | Task | Files | Verification |
|---|------|-------|--------------|
| R0 | RED — extend the failing surface first: (a) `tests/guest.test.ts` + checks for a new pure `guestBootstrapUrl(next)` seam (base path + encodeURIComponent round-trip + the sanitiser contract through a bootstrap URL); (b) `tests/e2e/guest.spec.ts` + deep-link pins for the (app) routes (eat + place + map) — cookie-less visits must RETURN to the deep link; the 2 existing failing profile pins stay as-is | `tests/guest.test.ts`, `tests/e2e/guest.spec.ts` | the new unit checks fail on the missing export; the new E2E pins + the 2 existing ones fail against the current tree (RED state documented) |
| R1 | GREEN — the path-aware gate: add `guestBootstrapUrl()` to `src/lib/guest.ts` (pure, no next/navigation import) + a new `src/lib/page-gate.ts` with `requireUser(next)` (resolves the session or 307s through the bootstrap with the page's own path). Wire every authenticated page: home `/`, eat `/eat`, stay `/stay`, do `/do`, map `/map`, favourites `/favourites`, place `/place/${slug}`, profile `/profile` (dropping the `user!`/null-optional patterns where the gate now guarantees the session). Layouts become chrome-only: `(app)/layout.tsx` renders the Navbar only when a user resolves (race-safe), `(bare)/layout.tsx` drops its redundant gate (the page owns it — closes F4) | `src/lib/guest.ts`, `src/lib/page-gate.ts`, 8 pages, 2 layouts | 72+N unit ✓ · the FULL E2E suite green (the 2 previously-failing + the new pins) · `curl -L` traces: deep links RETURN to their target · home first-visit chain unchanged (307 → 303 + Set-Cookie → 200) |
| R2 | Smoke alignment: check 14's Location assertion becomes next-aware — `GET /<path>` must redirect to `/api/auth/guest?next=%2F<path>` (the encoded path), and 13d keeps the bare-`/` relative-Location contract (a direct bootstrap hit with no next). +1 new check pinning the deep-link 303 target (`/api/auth/guest?next=%2Fprofile` → Location `/profile`) | `scripts/smoke-test.sh` | `bash -n` clean · the full smoke suite green (30 → 31 checks) |
| R3 | `.env` hygiene (F3): untrack `.env` via `git rm --cached .env` (the file stays on disk locally; `.gitignore` already covers it) so the live secret leaves the repo's tracked tree; verify `.env.example` matches the codebase's full env surface (DATABASE_URL resolution story, NEXT_PUBLIC_SITE_URL load-bearing note, AUTH_SECRET, DEBUG_DBPATH) — aligned where stale | `.gitignore` (no change needed), git index, `.env.example` | `git ls-files` shows `.env` gone; `.env.example` documents every env var the code reads |
| R4 | Re-capture the 16 dev-server screenshots on the REMEDIATED tree (the session-35/36 script's proven login/settle/verify pattern, adapted as `scripts/capture-screens-session46.mjs`) | `docs/screenshots/*.png`, `scripts/capture-screens-session46.mjs` | 16 healthy captures; the rendered geometry re-verified on the captured state |
| R5 | Docs alignment: AGENTS.md (the route-group gate fact → the page-gate architecture, the gate-order counts), CLAUDE.md (the auth-gate bullet + pyramid counts), README (the divergence note + counts), the PAD v2.18 (ADR-008 amendment: the page-owns-the-path contract + why no middleware/proxy, §3.2 tree + page-gate.ts, §7.1/§7.3 gate arithmetic, §11 line counts, §12 glossary), activity-map_SKILL.md v1.22.4 (the auth pattern + pre-ship gate), `docs/DEPLOYMENT.md` (the deep-link behavior note), `docs/findings_to_validate_and_update.md` (v2.18 addendum), the worklog, `docs/session_46.md`, this plan's execution record | the docs | every doc claim matches the tree |
| R6 | Final gate ×2 on the push tree: lint → typecheck → unit → build → smoke ×2 → E2E ×2, then the SSH-wrapper push to main (single conventional commit; `.env.example` included per the task brief) | — | all gates green ×2; push verified; key shredded |

Non-gaps (keep, verified unchanged): every parity surface (§2), the DB pinning, the
npm-audit-0 state, the relative-Location 303, the seed's guest account, the 16-screenshot
narrative, the vitest/playwright config structure, the mobile-nav failure-class pins, the
cookieSecureFlag + health-envelope seams, the `no-middleware` decision (R1 works entirely
through `redirect()` + the existing route handler — no proxy.ts/middleware is introduced).

## 5. Design rationale — why page-level gates

- The (app)/(bare) layouts CANNOT learn the request path (verified empirically: `headers()`
  exposes only proxy headers — no `next-url`/`x-matched-path` — and layouts receive no
  pathname), while every PAGE knows its own path (static routes literally; `place/[slug]`
  from `params`). The live source preserves logged-out deep links, so the clone must too.
- The render-order constraint (verified empirically): a layout redirect always preempts a
  page redirect, so path-aware gating must live in the pages; the layouts become chrome
  (Navbar rendered only when a session resolves — race-safe during the parallel render
  window that ends in the page's 307).
- `requireUser()` lives in `src/lib/page-gate.ts` (NOT guest.ts) so `next/navigation`'s
  `redirect` import never touches the pure, unit-tested guest module.
- The future-page safety property ("no unguarded pages in the groups") is preserved by
  R1's E2E pins (every route's cookie-less deep-link behavior is asserted) and by the
  pages' own `user!`-free typing through `requireUser` — an ungated page fails loudly
  (null-uid TypeError), never silently.
- No-JS behavior is unchanged: the whole flow remains server-side redirects (307 → 303);
  no client bootstrap shell is introduced (that would regress SSR-first-paint/SEO).

## 6. Execution record

- **R0 (RED, documented)**: `tests/guest.test.ts` +3 `guestBootstrapUrl` checks (failed with
  "guestBootstrapUrl is not a function" on the untouched tree) and `tests/e2e/guest.spec.ts`
  +3 deep-link pins (/eat, /map, /place/map-brass-marble) — RED alongside the 2 pre-existing
  failing guest specs (the profile identity + sign-out round-trip), bringing the entry state
  to 75 unit (3 failing) / 84 E2E (5 failing).
- **R1 (GREEN, the path-aware gate)**: `guestBootstrapUrl()` added to `src/lib/guest.ts`
  (pure — no next/navigation import); `src/lib/page-gate.ts` created
  (`requireUser(next)`: resolve or 307 through the bootstrap with the page's path);
  wired into home (`/`), eat, stay, do, map, favourites, place/[slug]
  (`/place/${slug}`), and profile — the `user!` assertions dropped (the gate's non-null
  return types them); the `(app)` layout became chrome-only (`{user ? <Navbar/> : null}`,
  no redirect) and the `(bare)` layout dropped its redundant gate (F4 closed). En-route
  root-cause found and fixed: ProfileView's sign-out used `router.replace("/")` +
  `router.refresh()` — the RSC soft-nav cannot follow the bootstrap's redirect-to-route-
  handler chain and rendered an EMPTY SHELL (no navbar/main; the same defect shipped on
  the deployed v2.17 mirror) — sign-out now performs `window.location.assign("/")` (a
  full navigation; the 303 chain applies at document level). Unit 75/75 ✓ · typecheck ✓ ·
  lint 0 errors · build ✓ · **E2E 84/84 ✓** · deep-link curl traces verified
  (`GET /place/x → 307 /api/auth/guest?next=%2Fplace%2Fx → 303 → 200 /place/x`).
- **R2 (smoke)**: check 14 now asserts the next-aware gate Location
  (`/api/auth/guest?next=%2F<path>`), +1 new check 14b (the deep-link 303 returns to
  /profile) → **31/31 smoke ✓**.
- **R3 (.env hygiene)**: `.env` untracked (`git rm --cached .env` — the file stays on
  disk; `.gitignore` already covers it); `.env.example` verified against the code's env
  surface (DATABASE_URL/NEXT_PUBLIC_SITE_URL/AUTH_SECRET/DEBUG_DBPATH — all read by
  `src/lib/{db-path,auth}.ts`) and included in the push per the task brief.
- **R4 (screenshots)**: 16 captures re-taken on the REMEDIATED tree via
  `scripts/capture-screens-session46.mjs` (the session-35/36 proven login/settle/verify
  pattern, adapted: login is now each context's FIRST navigation because the guest
  bootstrap bounces authenticated visits off /login) — desktop home + four home sections +
  Eat/Stay/map/detail/favourites/profile + the grown footer + mobile home/Eat/nav/map +
  login; all healthy sizes (1.5MB home → 42KB favourites).
- **R5 (docs)**: AGENTS.md (commands/gate counts 75/31/84, the page-gate architecture
  fact, the auth-navigation rule amended for the sign-out full navigation), CLAUDE.md
  (test pyramid + the auth-gate bullet), README (counts, the divergence note, the
  screenshot narrative + session-46 row), the PAD v2.18 (revision block, ADR-008
  Decision/Rationale/Consequences, §3.2 tree + page-gate.ts, §6.2 utilities, §7.1/§7.3/
  §7.4 counts, §11 line counts, §12 glossary), activity-map_SKILL.md v1.22.4
  (project_state, ADR-11, the pre-ship gate), docs/DEPLOYMENT.md (the v2.18 deep-link
  note), docs/findings_to_validate_and_update.md (this session's addendum), the worklog,
  docs/session_46.md, this plan.
- **R6 (final gate)**: lint ✓ (0 errors, the 2 pre-existing script warnings) ·
  typecheck ✓ · 75/75 unit ✓ · build ✓ · 31/31 smoke ✓ · 84/84 E2E ✓ — on the push tree.
