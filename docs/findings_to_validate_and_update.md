# Findings Validation & Update — ROAM Architecture Review (v2, remediated)

**Status:** VALIDATED + REMEDIATED (this revision)
**Reviewed tree:** `1a8b0fe` ("Create findings_to_validate_and_update.md" — the commit that added the original findings doc)
**Method:** Fresh clone; every claim in the original report re-verified against the code, configs, seed data, and test suites; the E2E count re-established **authoritatively** via `playwright test --list`; every stale doc claim remediated in this same revision (see Part 5).
**Original report:** preserved in git history at `1a8b0fe` (this file superseded it — the original contained three internal errors, corrected in Part 3).

---

## Part 1 — Verdict on the Original Report

The original report's **code-side findings were highly accurate**: all 30+ verifiable code claims (stack versions, config contents, test counts, seed data structure, line counts, session-30/31/32 design states, the health-envelope variance, the sliding-window limiter) reproduced exactly on re-inspection. Its **doc-side discrepancy inventory (D1–D12) was directionally correct and is now fully remediated**.

However, the report contained **three meta-errors of its own** (Part 3) and **missed eleven additional stale spots** (Part 4) — all corrected and remediated here.

---

## Part 2 — Independent Re-Validation (all claims re-checked)

### 2.1 Verified Correct (Docs ↔ Code ↔ This Audit)

| Claim | This audit's evidence |
|---|---|
| Stack: Next.js ^16.3.6, React ^19.3.0, TS ^5.9.3 (strict, `noImplicitAny: false`), Tailwind ^4.3.3 CSS-first, Prisma ^6.19.3 + SQLite, Leaflet ^1.9.4 / react-leaflet ^5.0.0, Vitest ^5.0.2, Playwright ^1.63.0 | `package.json` (deps + devDeps) |
| No `tailwind.config.*` (glob empty), no `middleware.ts` | filesystem |
| Route groups: `(app)/layout.tsx` = `getSessionUser()` + guest-bootstrap redirect (`GET /api/auth/guest`) + Navbar + SiteFooter; `(bare)/layout.tsx` = auth gate only (chrome-less `/profile`) — TRUE at audit time as `redirect("/login")`; superseded by the v2.16 login-free guest bootstrap (same three gates, new target) | both layouts read in full (pre/post v2.16) |
| API envelope `{ ok: true, data } \| { ok: false, error }` on all app routes | grep across `src/app/api/**` — 21 `error`-shaped failures; exactly ONE variance (E1, remediated) |
| Leaflet: `next/dynamic` + `ssr: false` in `MapExplorer.tsx` | lines 14/21 |
| `DATABASE_URL=file:../db/custom.db` pinned inline on `dev`/`start`/`db:push`/`db:seed`; `postinstall: prisma generate` | `package.json` scripts |
| Remote images: only `media.base44.com` + `z-cdn.chatglm.cn`; security headers (nosniff / DENY / strict-origin-when-cross-origin); `serverExternalPackages: ["@prisma/client","prisma"]` | `next.config.ts` |
| `tsconfig.json`: `@/*` → `./src/*`, excludes `node_modules` + `skills`; ESLint ignores `skills`; vitest includes `src/**/*.test.ts` + `tests/**/*.test.ts` (node env, `@` alias); Playwright: port 3100 (`E2E_PORT` override), `workers: 1`, storageState, `trace: "retain-on-failure"`, `db/e2e.db` | all four configs read |
| **Unit tests: 48 = db-path 19 + filters 15 + planner 10 + auth 4** | word-boundary `it(` counts: 19/15/10/4 (a naive substring grep overcounts — `.split(`/`.commit(` match `it(`; the original report's 19 was right) |
| **E2E: 76 tests in 6 files** | **`playwright test --list` → "Total: 76 tests in 6 files"** (5 spec files + `auth.setup.ts`; the original report's work-state note "not yet fully captured" is now closed) |
| **Smoke: 27 checks = 15 static + two 6-iteration loops** (API reads ×6, signed-out redirects ×6) | `ok()`/`bad()` call sites counted in `scripts/smoke-test.sh` (162 lines) |
| **Seed: 42 published (12 eat + 12 stay + 18 do) + 27 home-only (route 5 / sights 6 / restaurants 16) + 9 map-demo = 78 places** | Python parse of all five JSON files |
| `seed.ts` correctly flattens nested `home.json` (`route/sights/restaurants`) and `map.json` (`places`) — `loadData()`'s flat-array parse is used ONLY for eat/stay/do (which are flat) | `prisma/seed.ts` read in full (288 lines) |
| Session-30 `.roam-marker` = 12px ink dot (2px white ring, hover scale 1.32) + `.roam-marker-label` hover pill; 16px/violet model retired | `globals.css` lines 203–259 + the session-30 comment |
| Session-31 `hero-shade` removed (comment at globals.css line 143) | ✓ |
| Session-32 Navbar shrink-wrap (`min-w-0` + `mr-2`, NO `flex-1`; `press-shrink` on links; label-span color transition) | `Navbar.tsx` lines 146–175 |
| Session-32/33 footer utilities (`press-shrink`, `footer-pill-transition`, `footer-link-transition`, `footer-link-hover`) all present; `--color-cream #f8f7f4`, `--font-serif` Libre Baskerville | `globals.css` |
| `places.ts`: `listPlacesForUser`/`countPlaces` filter `status: "published"`; `listHomePlaces` selects `status: "home"` + slug prefix; `listMapPlaces` selects `status: "map"`; `getPlaceBySlug` unfiltered | lines 57/66/86–88/102/125 |
| Client components: **23 `"use client"` files = 21 components + `not-found.tsx` (page) + `useParallax.ts` (hook)** | `grep -rl` — the exact 23-file list matches the documented 21 + 2 |
| Login rate limiter: 10/IP/15 min, **in-memory SLIDING window** (filters timestamps within `WINDOW_MS`), 429 + `Retry-After` | `rate-limit.ts` line 1 comment + line 25 implementation; login route line 13 |
| Utils seam: `formatPrice` (en-IE), `priceRangeSymbols`, `priceRangeParts`, `formatDuration`, `initials`; planner seam: `plannerRoute`, `plannerSearchUrl`, `plannerDateLabel`; places seam: `toPlaceDTO` | export lists verified |
| Session-25 legal routes `/privacy-policy` + `/accessibility-statement` with legacy `/privacy` + `/accessibility` redirect stubs | all four page files |
| Session-30 dual 404s: in-app place 404 + chrome-less slate generic 404 (`useSyncExternalStore` hydration fix) | both not-found files |
| E2: `prisma/seed.ts` constructs `PrismaClient` directly (documented exception — app code uses `import { db }`) | seed.ts line 11 |

### 2.2 The Original D1–D12 Inventory — Confirmed and Remediated

| # | Original claim | Verdict | Remediation |
|---|---|---|---|
| D1 | PAD says db-path has 17 checks (§7.1, §3.2 tree, Pattern 1, §11) | ✓ Confirmed (code has 19). Locations: PAD lines 109/264/300/679 + **`activity-map_SKILL.md:435` + `AGENTS.md:32`** (two locations the original report missed) | all six spots → 19 |
| D2 | PAD §7.1 unit total 42 (auth omitted) | ✓ Confirmed (48) | §7.1 table + totals rewritten |
| D3 | PAD §7.1 E2E distribution stale | ✓ Confirmed stale — **but the original's replacement numbers were wrong** (see M1). Actual: auth 5 / browse 32 / home 19 / mobile-nav 16 / not-found 3 (+1 setup) | §7.1 + §3.2 tree updated with the authoritative distribution |
| D4 | PAD §3.2/§3.3: 18 client components; StayShowcase/HighlightedSights/SiteFooter listed as server | ✓ Confirmed (21; all three carry `"use client"`) | §3.2 tree rebuilt |
| D5 | PAD §3.2: profile under `(app)` | ✓ Confirmed (it is in `(bare)`, session-16) | tree corrected |
| D6 | PAD §5.3/ADR-005: hero-shade an active `@utility` | ✓ Confirmed (removed session-31) | §5.3 + ADR-005 updated |
| D7 | PAD §5.3/ADR-006: `.roam-marker` 16px dot / 22px violet active | ✓ Confirmed (12px ink, no violet, session-30) | §5.3 + ADR-006 updated |
| D8 | PAD §6.2/ADR-003 + AGENTS: "fixed window" limiter | ✓ Confirmed (code is sliding). **Also `docs/DEPLOYMENT.md:103`** (missed by the original) | all four spots → sliding |
| D9 | PAD Pattern 5 navbar sample still has `flex-1` | ✓ Confirmed (session-32 removed it) | Pattern 5 sample replaced with the current code |
| D10 | PAD §11 line counts stale | ✓ Confirmed — every number reproduced exactly (auth 104, db-path 200, seed 288, Navbar 241, MapExplorer 284, BookingForm 251, TripPlanner 194, StayCard 128, CategoryExplorer 160, globals.css 327, mobile-nav.spec 346, smoke-test.sh 162) | §11 table refreshed |
| D11 | PAD §1.2: "Runtime/PM \| Bun (npm-compatible)" | ✓ Confirmed stale (npm runtime since session-34/35) | §1.2 + §2 layer table + topology label fixed |
| D12 | "AGENTS/CLAUDE say 'four JSON files'" | ✗ **Misattributed** — see M2. The real "maps all four 1:1" claim is PAD ADR-007 (§1.3) | ADR-007 → "all five files 1:1" |

### 2.3 Doc-to-Doc Conflicts (C1–C4)

| # | Original claim | Verdict |
|---|---|---|
| C1 | AGENTS 17 vs CLAUDE 19 for db-path | ✓ Confirmed; CLAUDE correct. AGENTS now says 19 |
| C2 | AGENTS "fixed" vs code sliding | ✓ Confirmed; AGENTS now says sliding |
| C3 | PAD §7.1 unit sum 42 vs gate line 48 | ✓ Confirmed (§7.3's gate line was already 48/76/27 — the PAD contradicted itself); §7.1 now agrees |
| C4 | "AGENTS/CLAUDE say 'four JSON files'" | ✗ Misattributed (see M2) — both files correctly list `{eat,stay,do,home,map}.json` (five) |

### 2.4 Code-Side Observations (E1–E3)

| # | Original claim | Verdict | Action |
|---|---|---|---|
| E1 | `/api/health` unhealthy path returned `{ ok: false, data: { status: "unhealthy" } }` — the only envelope variance | ✓ Confirmed — verified as the ONLY `data`-shaped failure across all 22 error returns in `src/app/api/**` | **REMEDIATED in code**: now `{ ok: false, error: "unhealthy" }` (503). Safety analysis: zero consumers of the old shape (smoke readiness greps `"ok"` only on the healthy path; no spec touches the unhealthy path; DEPLOYMENT.md's curl example fixed to the real healthy shape) |
| E2 | `prisma/seed.ts` constructs `PrismaClient` directly | ✓ Confirmed — documented exception, unchanged (by design) | none (documented) |
| E3 | home.json/map.json nested, seed flattens correctly | ✓ Confirmed | none (correct as documented) |

---

## Part 3 — Corrections to the Original Report (meta-findings)

The original report itself contained three errors, found by this re-validation:

- **M1 — Wrong E2E per-file breakdown.** The original claimed "auth 5 / browse 25 / home 19 / mobile-nav 15 / not-found 3 = 67 top-level" as the code reality in D3. The **authoritative** `playwright test --list` distribution is **auth 5 / browse 32 / home 19 / mobile-nav 16 / not-found 3 + setup 1 = 76**. The total (76) was right; the breakdown was not. (Root cause: substring `test(` grep counting — e.g. `not-found.spec.ts:170`'s regex `.test(m)` inflates counts, and parameterized `for…of` loops expand differently than a naive count suggests.)
- **M2 — Misattributed "four JSON files" claim.** Neither AGENTS.md nor CLAUDE.md says "four JSON files" — both correctly list all five (`prisma/data/{eat,stay,do,home,map}.json`). The actual stale wording is **PAD ADR-007** ("`prisma/seed.ts` maps all four 1:1"). D12/C4's fix therefore belongs to the PAD (applied), not AGENTS/CLAUDE.
- **M3 — `.font-poppins` mislocated.** The original cited it under §5.3; the claim actually lives in **§5.1** (the Libre Baskerville row's notes). The utility does not exist in `globals.css` at all — the whole "legacy `.font-poppins` utility was redefined" clause was stale and is now removed.

---

## Part 4 — Newly Identified Discrepancies (missed by the original report)

| # | Location | Was | Now |
|---|---|---|---|
| N1 | PAD §2 layer table | "App \| Node (Bun) single process" | "Node (npm `next start`) single process" |
| N2 | PAD §1.2 | Vitest ^5.0.1 | ^5.0.2 (actual package.json) |
| N3 | PAD ADR-005 | "text-only links below `sm`" | below `md` (the tab-bar/desktop-pill switch is at md) |
| N4 | PAD ADR-005 | mobile-nav spec "(8 checks …)" | 16 checks |
| N5 | PAD ADR-006 | "dot markers over a light basemap **with popups**" + alternatives "loses pan/zoom/popups" | popups retired session-30 (hover name-label + click-to-navigate) |
| N6 | PAD §5.4 | "Transitions are Tailwind `transition-colors` on interactive elements only" | + `press-shrink`, the footer growth/hover utilities, the rAF parallax listener (session-31/32/33) |
| N7 | PAD §3.2 tree | missing `LetterReveal.tsx`, `useParallax.ts`, `BrowsePlanner.tsx`, the `(bare)` group, `place/[slug]/not-found.tsx`; root `not-found.tsx` described as "branded 404" | all added/described (platform slate 404) |
| N8 | PAD §3.2 tree | "screenshots/ (14)" | 16 (session-35/36 re-captures) |
| N9 | PAD §11 | `LeafletCanvas.tsx` 141 lines | 140 (off-by-one) |
| N10 | `docs/DEPLOYMENT.md:91` | health example `{"status":"ok",...}` | `{"ok":true,"data":{"status":"healthy"}}` (the real shape) |
| N11 | `prisma/seed.ts:4` comment | "Run: bun prisma/seed.ts (or: npx tsx …)" | "Run: npm run db:seed (or: npx tsx prisma/seed.ts)" — the last bun-first leftover in the code (category D11) |

Also noted (left unchanged, judged acceptable): `AGENTS.md`'s install row "npm install (or bun install)" — npm-first and factually true; PAD's historical revision-block entries describing retired models (tracked-changes history, correct to keep); `skills/`-folder content (excluded from this review's scope and from the deliverable archive per the task definition).

**Skills catalog note:** the task brief referenced `skills/skills-catalog.md` — no such file exists in the repo. The actual skill inventories are `skills/INVENTORY.txt` (69 skills, agent-global) and `docs/skills-inventory.md`. No repo skill was needed beyond the codebase's own Meticulous Approach (AGENTS/CLAUDE/PAD) for this docs-validation task.

---

## Part 5 — Remediation Applied (this revision)

| File | Change |
|---|---|
| `src/app/api/health/route.ts` | **Code fix (E1):** unhealthy path → `{ ok: false, error: "unhealthy" }` (503), matching the documented envelope; explanatory comment added. Verified safe: zero consumers of the old `data` shape |
| `Project_Architecture_Document.md` | **v2.14 → v2.15** + revision-block entry. Fixed: §1.2 (npm runtime, Vitest ^5.0.2), ADR-003 (sliding), ADR-004 (19), ADR-005 (md, 16 checks, hero-shade removed), ADR-006 (12px no-popup pin model), ADR-007 (five files), §2 (topology labels + layer table), §3.2 (tree: (bare) group, place-404, slate root-404, client/server corrections, LetterReveal/useParallax/BrowsePlanner, 21 client components, 19-check db-path, refreshed E2E distribution, 16 screenshots), §3.3 Pattern 1 (19 checks) + Pattern 5 (current shrink-wrapped code + rationale), §5.1 (dropped `.font-poppins`; "map name-label pills" not "map popups"), §5.3 (current utility inventory + 12px marker), §5.4 (motion inventory), §6.2 (sliding), §7.1 (full table: 19/15/10/4 unit; 5/32/19/16/3/+1 E2E; 27 smoke; totals 48/76/27), §11 (all line counts + 19 checks + auth.test row + updated purposes), §12 (seam glossary incl. planner + utils) |
| `AGENTS.md` | "(17 checks)" → "(19 checks)" (db-path contract pin); "fixed window" → "sliding window" (login limiter) |
| `activity-map_SKILL.md` | **v1.22.0 → v1.22.1**; bootstrap block npm-first (was `bun install # 485 packages, ~5s`); utility inventory updated (hero-shade removal + the four interaction utilities); "18 client components" → 21; "(17 checks)" → 19 |
| `docs/DEPLOYMENT.md` | health curl example → the real response shape; "fixed window" → "sliding window" (troubleshooting table) |
| `prisma/seed.ts` | header comment npm-first (`npm run db:seed`), the last bun-first leftover |
| `docs/findings_to_validate_and_update.md` | this document — the validated, corrected, and remediated record |
| `worklog.md` | Task 37 entry appended (repo convention) |
| `CLAUDE.md`, `README.md` | **No changes needed** — every checked claim in both was verified accurate (19 checks / 48-76-27 gates / five seed files / 21 client components / npm commands). The original report's C-items implicating CLAUDE.md were misattributions (M2/C4) |

**Deliberately NOT done (and why):** no git commit or push — the repo's own gate (build → smoke → E2E) was not run in this environment (build/dev server execution intentionally avoided per the task constraints), so the changes are left staged in the working tree for review; no changes to `skills/` (out of scope, excluded from the archive); no E2' style refactor of seed.ts's direct PrismaClient (documented exception); no "improvements" beyond the validated finding set.

---

## Part 6 — Verification

| Check | Result |
|---|---|
| `playwright test --list` (authoritative E2E census) | **Total: 76 tests in 6 files** — auth 5 / browse 32 / home 19 / mobile-navigation 16 / not-found 3 / setup 1 |
| Unit census (word-boundary `it(`) | 19 + 15 + 10 + 4 = **48** |
| Smoke census (`ok()`/`bad()` sites) | **27** (15 static + 6 API reads + 6 signed-out redirects) |
| Seed census (Python JSON parse) | **78 places** (12/12/18 published + 27 home + 9 map) + demo user |
| Line counts (`wc -l`, 19 files) | all match the updated §11 table |
| Client-component census | **23 `"use client"` files = 21 components + not-found page + useParallax hook** |
| Residual stale-claim sweep on the remediated docs | none in current-state sections (only historical revision-block entries, which correctly describe past states) |
| `npm run lint` / `npm run typecheck` / `npm run test` | run post-remediation — see the run log appended below |
| Build / smoke / E2E | **not run** in this environment (server-booting commands intentionally avoided); the working tree is left uncommitted for the repo's own full gate before push |

---

## Part 7 — Final State

- The three operator docs are now **internally consistent and code-accurate**: AGENTS.md and CLAUDE.md agree with each other and the tree; the PAD v2.15's tables (§7.1, §11), tree (§3.2), ADRs, and patterns match the code at every checked signature.
- The one code-side contract variance (health envelope) is closed; every API failure now uses `{ ok: false, error }`.
- Gate arithmetic is consistent everywhere it appears: **48 unit · 27 smoke · 76 E2E**, with the per-file distribution recorded from the runner itself.
- The architecture is sound; no functional bugs were found in this audit beyond the cosmetic E1 envelope variance (now fixed).

### Post-audit addendum (v2.16 — login-free guest bootstrap)

- After this audit closed, the requested remediation landed: fresh visits no longer hit `/login` — the three session gates redirect to `GET /api/auth/guest` (new `src/app/api/auth/guest/route.ts` + `src/lib/guest.ts`), which signs the ordinary session cookie for the seeded shared `guest@roam.local` account and 303s back to a sanitised path. `prisma/seed.ts` now seeds the guest user (password = a discarded random secret); sign-out returns to `/` and re-bootstraps a guest session.
- Gate arithmetic moved to **68 unit · 29 smoke · 81 E2E** (+20 `tests/guest.test.ts`, +5 `tests/e2e/guest.spec.ts`, +2 smoke checks — the fresh-visit/guest-auth/me pair, plus the signed-out redirect check now asserts the Location). Unit verified green in the remediation environment; build/smoke/E2E await the repo's own local full gate.

### Post-audit addendum (v2.17 — origin-agnostic bootstrap redirect)

- The live deployment (npm run start behind Cloudflare + a local reverse proxy) exposed a redirect regression the local gates could not catch: the proxy forwards `Host: localhost:3000` alongside `X-Forwarded-Proto: https`, so the bootstrap's `NextResponse.redirect(new URL(next, req.nextUrl.origin), 303)` synthesised `https://localhost:3000/` and bounced `https://activity-map.jesspete.shop` visitors onto the origin box's localhost (the layout gates' relative 307 worked fine through the same proxy — only the absolute 303 left the host).
- Fix (TDD): the 303 now emits a RELATIVE `Location` (RFC 9110 §10.2.2 URI-reference) built from `sanitizeNextPath` output only — the client resolves it against whichever origin it is browsing, so the redirect can never leave the host on any deployment with zero configuration. `NextResponse.redirect()` demands an absolute URL, hence a hand-rolled `seeOther()` helper; Set-Cookie, the no-clobber guard, and the sanitiser are unchanged.
- Tests: `tests/guest.test.ts` +4 origin-agnostic checks (a request whose origin computes to `https://localhost:3000` must yield a relative Location — the live regression pinned as a unit check; the Location resolves against ANY browsing origin; safe `?next=` stays relative; the signed-in branch echoes no host) and the existing absolute-Location assertions flipped to relative → 68→**72 unit**. `scripts/smoke-test.sh` +1 raw-header check (the 303 Location must literally be `/`) → 29→**30 smoke**. `tests/e2e/guest.spec.ts`'s open-redirect assertion tightened to the exact `/` (81 E2E unchanged). Login/logout routes verified JSON-only — the guest bootstrap was the sole absolute-redirect site in `src/`.
- Doc sweep: PAD v2.17 (revision block, ADR-008 Decision/Rationale/Consequences, §3.2 tree, §6.4 threat row 5, §7.1/§7.3 gates, §11 line counts, §12 glossary), AGENTS.md, CLAUDE.md, README.md, activity-map_SKILL.md v1.22.3, docs/DEPLOYMENT.md (reverse-proxy guidance + the NEXT_PUBLIC_SITE_URL "not yet wired" stale claim corrected + the localhost-bounce row in its §7). Verified: lint 0 errors, typecheck clean, 72/72 unit, the 81-test census re-listed; build/smoke/E2E await the repo's own local full gate.

### Post-audit addendum (v2.18 — deep-link-preserving guest gates)

- Session 46 (this repo's audit of the `20e6f9e..1964242` range) found the v2.16/v2.17 work functionally incomplete in ONE dimension the prior sessions' own E2E spec had pinned but never executed: the guest corpus had only ever been census-listed (`playwright test --list 81 ✓`), so the 2 RED guest specs (the profile deep link + the sign-out round-trip) shipped unnoticed. Reproduced on the deployed mirror: a fresh visitor deep-linking to `/profile` (or `/eat`, `/place/<slug>`) was bounced to `/` — the layout gates passed no `?next=`, while the live source preserves logged-out deep links.
- Remediated (TDD, `docs/remediation-plan-session-46.md`, findings F1–F5): the PATH-AWARE page gate — `requireUser("/own-path")` in `src/lib/page-gate.ts` wired into every authenticated page (home, eat, stay, do, map, favourites, place/[slug], profile), the pure `guestBootstrapUrl` seam in `src/lib/guest.ts`, chrome-only `(app)`/`(bare)` layouts (a layout cannot learn the request path — verified: `headers()` exposes only proxy headers), and ProfileView's sign-out as a FULL navigation (the RSC soft-nav cannot follow the bootstrap's redirect chain — it rendered an empty shell; the same defect existed on the deployed v2.17 mirror).
- Also remediated: `.env` was GIT-TRACKED carrying a live `AUTH_SECRET` (contradicting AGENTS.md's own "never commit `.env`" rule) — untracked via `git rm --cached`; `.env.example` (tracked, included in the push) verified to document the code's complete env surface.
- Gate arithmetic moved to **75 unit (+3 `guestBootstrapUrl` checks) · 31 smoke (+1 deep-link 303 check) · 84 E2E (+3 deep-link pins)** — and, for the first time since v2.16, ALL EXECUTED GREEN in one session (75/75 · 31/31 · 84/84), closing the process gap F2 (a `--list` census is not a pass).

### Post-audit addendum (v2.19 — calendar-day booking classification + the live's identity re-alignment)

- Session 48 (this repo's audit of the `66c50de..a358ffb` range, run on the REDEPLOYED mirror) confirmed the v2.18 deep-link + sign-out fixes live (fresh `/profile`, `/eat`, `/map`, `/place/map-brass-marble` visits all RETURN to their target; sign-out renders the full guide as guest; mobile nav geometry EXACT at 390/1280 on both sites; zero console errors) — and found the next layer:
- **F1 (HIGH, live in production)**: the profile's Upcoming/Past split used an INSTANT comparison (`new Date(startDate).getTime() < Date.now()`) — a reservation made now for TONIGHT (19:00) filed under "Past" from 00:00 UTC, before the reservation happens. Reproduced on the deployed mirror (a today-19:00 booking landed under "Past (1)") AND as the E2E corpus's first time-bomb: the booking spec's hardcoded "2026-10-01" fixture aged past the UTC midnight boundary during the session (the suite went 84/84 → 83/84 at 00:00 UTC and would fail forever). Remediated: the pure `isBookingPast(startDate, now)` seam (`src/lib/bookings.ts`) — CALENDAR-DAY comparison (a booking is past only when its start DAY is strictly before the viewer's today; null/invalid never past), pinned by 8 unit checks (`tests/bookings.test.ts`) + the E2E booking spec re-pinned to a runtime-computed SAME-DAY date (deterministic forever — today can never cross itself). The smoke booking fixtures switched to runtime-computed future dates (`date -d "+7 days"`).
- **F2/F3 (parity drift — the live's account state changed upstream since session 14)**: the live profile now renders h1 "Explorer" (the account NAME — the value session 12 measured, back again) with the STATIC "Your Roam account" 16px line (the email line is gone), and the navbar's black 36px avatar disc renders the white 17×17 strokeWidth-2 lucide `User` icon (account-agnostic — no email initial). Re-aligned: `prisma/seed.ts` (name "Explorer"), ProfileView's subtitle, Navbar's avatar (one DOM node — the `md:[stroke-width:2]` arbitrary property overrides the presentation attribute from md up; the `userEmail` prop + the `initials()` render retired).
- Gate arithmetic moved to **83 unit (+8 booking checks) · 31 smoke · 84 E2E** — all executed green in the session (83/83 · 31/31 · 84/84); 16 screenshots re-captured on the remediated tree (the profile capture documents the same-day booking under "Upcoming").

### Post-audit addendum (v2.20 — the identity/avatar oscillation, third flip, + nav icon strokes)

- Session 50 (the re-review of the `66c50de..a358ffb` v2.18 range + the audit of the REDEPLOYED v2.19 mirror) confirmed everything from v2.18/v2.19 working live: the deep-link + sign-out contracts, the calendar-day booking classification (a LIVE same-day booking landed under "Upcoming (1)" / "Past (0)"), the mobile navigation menu geometry + taps end-to-end at 390 (121/192/222/259 + icons 304/330/356 + the 52px cream-glass bar) — NO Tailwind v4 regression — the desktop nav 433/559/639/727/805, the grown 646×118 footer, the Eat chip set, the 82px/1150×460 detail, the favourites empty state, and zero console errors across 9 pages.
- **F1–F3 (MED — the live's identity surface oscillated a THIRD time: Explorer→sepnetflix2023→Explorer→sepnetflix2023 across sessions 12/14/48/now)**: the live profile renders h1 "sepnetflix2023" (the account name field was renamed upstream again) with the account EMAIL as the 16px subtitle (the static "Your Roam account" line is gone again — the session-14 contract is back), and the desktop navbar avatar reverted to the EMAIL-DERIVED "S" initial (the white 14px/700 Inter letter on the 36×36 black disc — not the account-agnostic lucide-user icon session 48 measured; the mobile tab-bar keeps the user icon on both sites). The chips still read Augsburg / 0 day streak / Explorer (unchanged — the third chip is a static badge upstream). Re-aligned (TDD): `prisma/seed.ts` (name "sepnetflix2023"), ProfileView's subtitle (`{user.email}` — the guest profile correspondingly renders "guest@roam.local"), and the Navbar's avatar (the re-introduced `userEmail` prop + the `initials()` seam; the lucide-user glyph stays the mobile-only `md:hidden` icon). Pinned by the NEW `tests/initials.test.ts` (4 checks: "S" demo / "G" guest / uppercase / empty fallback) + the flipped E2E pins (the browse identity, the guest subtitle, the mobile-nav avatar).
- **F4 (LOW — the nav icon stroke family)**: the live's tab-bar icons all render raw stroke-width 2 (MapPin/Heart/User @18px) and the desktop heart disc renders a 17px glyph; the mirror rendered 1.5/1.8/1.5 with an 18px desktop heart. Remediated: every nav icon re-stroked to `strokeWidth={2}` and the heart to `h-[18px] w-[18px] md:h-[17px] md:w-[17px]`.
- Gate arithmetic moved to **87 unit (+4 avatar-initial checks) · 31 smoke · 84 E2E** — all executed green in the session (87/87 · 31/31 · 84/84); 16 screenshots re-captured via `scripts/capture-screens-session50.mjs` (the profile capture documents the "sepnetflix2023" identity + the email subtitle + the same-day booking under Upcoming).
- Process note: the identity surface (h1 name / subtitle / avatar) must be RE-MEASURED every session — it has flipped three times upstream; treat it as a volatile surface, not a settled contract.

### Post-audit addendum (v2.21 — the live went OPEN: login-stay + the anonymous identity + the document titles)

- Session 51 (the re-review of the `66c50de..a358ffb` v2.18 range + the audit of the REDEPLOYED v2.20 mirror vs the live source) confirmed everything from v2.18/v2.19/v2.20 working live: the deep links, the calendar-day classification, the identity/avatar re-alignment (demo "sepnetflix2023" + email + "S"), the mobile navigation menu geometry + taps EXACT at 390 (NO Tailwind v4 regression), zero console errors across 9 pages.
- **The live's auth model changed upstream — it went OPEN**: anonymous visitors (cleared cookies) now browse every page (home/eat/stay/do/map/place deep links all render — the login wall is gone; the live's anonymous state is read-only: heart taps do not persist). The mirror's guest-bootstrap model achieves the same user-visible outcome — validated, no structural change.
- **F1 (MED)**: the live's `/login` renders the login form for EVERYONE (measured signed-in: the path stays /login, "Welcome to Activity Map", 2 inputs); the mirror 307'd any session holder off /login to `/`. Remediated: the redirect removed from `src/app/login/page.tsx`; the auth.spec pin flipped to the STAY contract.
- **F2 (MED)**: the live's ANONYMOUS state renders its own identity surfaces — profile h1 "Explorer" + the STATIC "Your Roam account" 16px subtitle + the desktop navbar avatar as the white 17px stroke-2 lucide-user glyph (measured with cleared cookies). The mirror's guest rendered "Guest" + "guest@roam.local" + the "G" initial. Remediated: the NEW client-safe identity seam `src/lib/identity.ts` (GUEST_NAME "Explorer", `profileSubtitle`, `avatarIsIcon`) — the seed, ProfileView's subtitle, and the Navbar's desktop avatar branch through it (the demo/authenticated contracts unchanged).
- **F3 (LOW)**: the document titles — the live renders "Activity Map" (home/login) and "<Short> | Activity Map" on every subpage (the map's "Discover", the detail's STATIC "Place Page" — never the place name); the mirror rendered "ROAM — Augsburg City Guide" / "X · ROAM". Remediated: the layout template + every page's metadata aligned; pinned by the new `tests/e2e/titles.spec.ts` (8 checks).
- Gate arithmetic moved to **92 unit (+5 identity-seam checks) · 31 smoke · 92 E2E (+8 title pins, the flipped guest/auth pins)** — all executed green in the session (92/92 · 31/31 · 92/92); 17 screenshots re-captured (the new 17-guest-profile capture).
- Process note: the identity surface now has TWO stable halves — the AUTHENTICATED contract (the demo account name, re-measured every session because it oscillates upstream) and the ANONYMOUS contract ("Explorer" + "Your Roam account" + the user icon — first measured v2.21, treat as the reference until it drifts).

### Post-audit addendum (v2.22 — the booking-form picker parity: the Dates/Time popovers + the success note)

The session-54 dual-site audit (the redeployed v2.21 mirror vs the live source) verified
every previously-pinned surface EXACT — the mobile navigation menu geometry + taps at 390
on BOTH sites (121/192/222/259 + icons 304/330/356 + the 52px cream-glass bar — NO
Tailwind v4 regression), the identity contracts UNCHANGED (the FIFTH authenticated
measurement held "sepnetflix2023" + the email subtitle + the "S" initial; the anonymous
"Explorer" + "Your Roam account" + the user-icon avatar surfaces intact — the
oscillation did not recur), the 11-route title sweep, the grown 646×118 footer pill,
the Eat/Stay/Do chip sets, the 82px/1150×460 detail, the login card, zero console
errors on both sites, and the favourites + booking round-trips live on the mirror —
and found ONE gap (the only remediation of the session):

- **F1 (MED) — the booking form's Dates/Time fields.** The live renders
  PICKER-TRIGGER BUTTONS (44px rounded-2xl, the calendar-days/clock 16px/1.8 icon +
  a chevron-down 15px/2 that rotates 180° while open, the violet hover border +
  glow) that open POPOVERS carrying the shared chrome (cream #F8F7F4, r-24, the
  #DDDBD5 hairline, the `0 20px 48 /0.14` shadow, 12px padding — phones UP via
  `bottom-[calc(100%+8px)]`, md+ DOWN via `md:bottom-auto md:top-[calc(100%+8px)]`,
  anchored to the relative label): a DATE-RANGE calendar (a white rounded-2xl month
  row wrapping a 36px rounded-full month SELECT listing the current month + 11
  forward; the 10px S M T W T F S weekday row; the 42-cell Sunday-first day grid —
  past days disabled in #C8C6C0, next-month trailing days in white/60 muted, range
  endpoints on the violet #571AFF with the `0 10 22 /0.24` glow, in-range days on
  the #F0E9FF tint; first click = start → the trigger reads "Thu 15 Oct — select
  end date"; second = end → "Thu 15 Oct — Sat 17 Oct" + the popover CLOSES; the
  hidden 1×1 pointer-events-none opacity-0 input carries "2026-10-15 to
  2026-10-17", required) and a 29-slot TIME list (08:00 → 22:00, 30-minute steps,
  `grid gap-1` of `flex h-10 items-center justify-between rounded-2xl px-3
  font-inter text-sm` buttons — the selected slot violet + a 15px check icon). The
  mirror rendered plain free-text `<input>`s (a clone invention). **F1b (LOW)** —
  the success note: the live renders a PLAIN centered 12px/600 #2A6B3A line ("Your
  booking request for <place> has been sent." — no background pill) and the form
  RESETS after success; the mirror rendered an emerald-50 pill with a different
  copy and no reset.
- Remediation (TDD): the client-safe pure seam `src/lib/booking-picker.ts`
  (`buildTimeSlots`, `formatBookingDateLabel`/`formatBookingRangeLabel`,
  `bookingRangeValue`/`parseBookingRangeValue`, `buildBookingCalendar`,
  `bookingMonthOptions` — pinned by `tests/booking-picker.test.ts`'s 21 checks) +
  the new `BookingDatePicker`/`BookingTimePicker` components wired into
  `BookingForm` (the POST now sends the range's OWN startDate/endDate — the old
  code sent the same string twice; the note + the reset match the live).
- En-route measurement traps (recorded for the next audit): the live's time-list
  popover is ~1270px tall — taller than the viewport — so only an element-level
  `locator.screenshot()` documents it completely; the popover anchors to the LABEL
  (not the trigger), so `bottom-[calc(100%+8px)]` opens it above the whole field
  block; the footer pill read mid-transition (637×117) settles to the 646×118
  contract after the 120ms transition; and the live's SPA client-side navigation
  leaves a STALE document.title behind (an eat→place client nav left "Eat |
  Activity Map" on the place page — the DIRECT-load title is the canonical
  contract).
- Gate arithmetic moved to **113 unit (+21 booking-picker checks) · 31 smoke ·
  93 E2E** — all executed green in the session (113/113 · 31/31 · 93/93); 19
  screenshots re-captured via `scripts/capture-screens-session54.mjs` (the new
  18-booking-date-picker + 19-booking-time-picker captures document the popovers).
