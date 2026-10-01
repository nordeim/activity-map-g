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

---

## v2.23 addendum (session 56 — the booking-picker chrome re-alignment)

**Reviewed tree:** `22d2ba4` (v2.22) on the redeployed mirror, audited
2026-10-01 against the live source (`docs/remediation-plan-session-55.md`).

- The v2.22 picker LOGIC verified exact end-to-end on both sites: the range
  semantics (mid-pick "Thu 15 Oct — select end date" → "Thu 15 Oct — Sat 17
  Oct" + the hidden "2026-10-15 to 2026-10-17"), the reopen-with-range
  highlights (violet endpoints + the `#F0E9FF` tint, October anchored), the
  single-day collapse, the 19:00 selection + check, the plain
  12px/600 `#2A6B3A` success note (the live's copy, 16px top margin), the
  form reset, the 29-slot list, the 42-cell grid, the 12-option month select.
- Five CHROME gaps closed (F1–F5): the month row's TWO-CHILD layout (the
  `relative flex-1` wrapper with the absolute pointer-events-none chevron
  inset right-5 + the calendar-days icon at the END, stroke 2, no `relative`
  on the row); the font-bold select with the violet hover/focus borders; the
  `font-bold uppercase tracking-[0.12em]` weekday row; the `0 10 22 /0.12`
  day-cell + time-slot hover shadows; and the ARIA + font contract (no
  aria-label/aria-expanded on the triggers — the label-derived
  "Dates*"/"Time*" names; the form's `font-inter`; NO font-inter on the
  popover containers; the hidden inputs not readOnly).
- **The E2E pin-masking bug**: the v2.22 `aria-label="Choose dates"` made
  `getByRole({ name: /^Choose dates/ })` match regardless of the trigger's
  VISIBLE text — the reset pin could never fail on a visual reset
  regression. The pins now use the anchored regexes `/^Dates\*/`/`/^Time\*/`
  (resolvable both closed AND open — the accessible name EXPANDS with the
  label's popover text while open, so exact-match queries time out mid-test)
  and the reset is asserted VISUALLY (`toHaveText("Choose dates")`).
- Accepted equivalences documented (F6, not remediated): the month option
  VALUE format (the live's 0-based non-padded "2026-9" vs the mirror's
  "2026-10"); the live's heart/avatar are BUTTONs vs the mirror's links;
  the token-name classes (text-roam-* vs the mirror's tokens) — every one
  computes identical.
- Gate arithmetic stable at **113 unit · 31 smoke · 93 E2E** — all executed
  green (the picker pins extended in place); 19 screenshots re-captured via
  `scripts/capture-screens-session56.mjs`.

## v2.24 addendum (session 58 — the profile GLASS refresh + the browse-shell chrome)

- The dual-site audit on the redeployed v2.23 mirror verified EVERY pinned
  surface EXACT again (the mobile tab bar at 390 + taps, the mobile footer
  grid, the desktop nav + footer pill, the byte-identical hero, the home
  category-card classes, the v2.23 picker chrome INTACT on the live, the
  title sweep, zero console errors; the SEVENTH identity measurement held
  "sepnetflix2023" — the transient "Roam" h1 first-paints are the live's
  pre-hydration skeleton, not the contract).
- NEW drift found (F1–F16, `docs/remediation-plan-session-57.md`): the
  live's profile evolved into a GLASS design — the page-div padding model
  (the cards span the FULL 896px at md, was 832), the TRANSPARENT + blurred
  cards (the live's `bg-white/78` class DOES NOT COMPUTE — its CDN skips the
  non-standard /78 opacity step; the mirror's applying tint rendered 6 RGB
  points too white — verified pixel-identical (248,247,244) after the fix),
  the compound inset-highlight shadows, the glass Go-back/Sign-out pills
  with the hover lift + invert, the VIOLET Saved-places hover, the 55px
  mobile identity h1 (lh 0.92), the 14px→16px responsive subtitle, the
  `#F8F7F4` font-semibold chips with 13px stroke-2 icons, the 0.18em
  eyebrow, the 18px-radius "Upcoming(N)" tabs (no space, the cream-pill
  count), and the browse shell — the centered `max-w-xl` subtitles on all
  five heading pages (the live's CDN computes its `mt-6` as 14px and its
  `mx-auto` as 24px margins on phones — the mirror pins the COMPUTED
  result), the map + favourites h1s adopting the browse clamp form
  (50.7px on phones), the MAP-glyph planner buttons (was map-pin) at
  stroke 2 with the inset-highlight chrome, the planner card's inset
  shadows, and the chips row's x=16 inset.
- The centering pins flipped from the SECTION's text-align to the H1's own
  (the live's card carries no `text-center` — an inner wrapper owns it;
  the computed result is what parity pins).
- Accepted equivalences documented (F16, not remediated): the live's eat
  HIDDEN eyebrow ("Augsburg dining guide"), the live's home category-count
  DATA drift (20 eat / 10 sights vs the seeded 12/18), the live's "Roam"
  skeleton h1s, the live's tab states as inline styles, the live's CDN
  computed-value quirks (the mirror pins computed results).
- Gate arithmetic stable at **113 unit · 31 smoke · 93 E2E** — all executed
  green (the profile + browse pins extended in place); 19 screenshots
  re-captured via `scripts/capture-screens-session58.mjs`.

## v2.25 addendum — session 60 (the Carto-map route + the 3D-fan cards)

Re-measured 2026-10-01 (the session-60 workspace was REBUILT from `2bc4a45`
after a sandbox crash wiped the uncommitted session-60 work — every finding
below was re-measured fresh from the live, not restored from memory):

- The MOBILE NAVIGATION MENU (the recurring task focus) re-verified EXACT
  at 390 — the tab-bar geometry (links x=121/192/222/259, icons
  x=304/330/356, the 52px glass bar) + the Heart/MapPin/User taps — NO
  Tailwind v4 regression. The hero (h1 115.2px, the photo y=−86 h=1010),
  the desktop nav, the stays grid (12 cards 381px 3×4 column-major), and
  the mobile restaurant deck (6 cards h 490 / img 300 / 620px advances)
  also re-verified unchanged.
- The Recommended Route visual became a REAL CARTO TILE MAP: the 416.65vh
  desktop trap (was 420vh) pins an svg viewBox 0 0 1500 1500
  (xMidYMid slice) carrying 25 `basemaps.cartocdn.com/light_nolabels/14`
  tiles (the 8697-8701 × 5642-5646 grid, 502px cells), the dashed base
  path (rgba(20,20,19,0.15) w5, dash 10 8), the solid #141413 progress
  path (~703.098 arc length, dashoffset = the trap progress), five cream
  r13 waypoints, the ink r7 head dot (drop-shadow), the lg-only g pan
  `translate(750−headX, 750−headY)` (phones stay identity), the
  SPLIT-COLOR progress pill (218×36 white/blur-10/#E8E6DC-hairline with
  the violet fill sweeping under the dual clipped text pair), the 18px
  graph-paper waypoint-panel overlay (opacity 0.42, radially masked), the
  CENTER-BASED card slot (`top: 50%` + `translateY(calc(-50% + offset))`,
  offsets `(i − idx) × 420px`), the City Gallery's "· 90 min" meta note,
  and the desktop heading overlay FADING OUT across ~178px from the
  section top (the old mirror kept the h2 visible over the pinned map
  until 1832 — CONFIRMED drift). Phones keep the 220vh trap + the −12vh
  panel pull, the no-pan map, and the y=68 heading.
- The home category cards became a 3D ±18° FAN (the wrapper
  `transform: scale(1.15)`, the perspective-800 slots, the hover flatten
  at 0.5s, the sliding row deck with the in-card clipped View All pill
  revealed by the −44px hover slide + the expanded clip-path, bg 0.34/0.58
  + blur 28 + saturate 160%, radius 20 at both breakpoints — the external
  hanging 229×54 pill is GONE).
- The home stay cards lost the white star-rating badge (the meta keeps
  "€€ · ★ 4.5"; the /stay browse variant KEEPS its badge).
- The STAY booking form's time label reads "Preferred Check-In Time\*"
  (eat/do keep "Time\*").
- Accepted equivalences documented (F5, not remediated): the restaurants
  band's `mix-blend-mode: overlay` canvas layer + the matrix3d-tilted
  floating photos (the band's structure is identical to the session-29
  model — the deterministic scatter is the documented equivalent), the
  heading-fade window timing, and the live's DB COUNT drift (20 eats /
  10 sights vs the seeded 12/18 — data, not code).
- Gate arithmetic: **113 unit · 31 smoke · 94 E2E** (+1: the new
  Carto-map spec; the fan/stop/badge/label pins extended in place) — all
  executed green;
  19 screenshots re-captured via `scripts/capture-screens-session60.mjs`.

## v2.26 addendum — session 62 (the staggered-fanning stay grid + the responsive hearts)

Audited against the operator's REDEPLOYED v2.25 mirror (fresh build +
re-seeded db, `docs/start_server_log.txt`). The mobile navigation menu (the
task's standing focus) re-verified EXACT at 390 on both sites — no Tailwind
v4 regression; the identity's eighth measurement held "sepnetflix2023". The
hero image verified SHA-256-identical (the VLM's "different composition"
claim was a misjudgment — disproven by the hash). The Carto route tiles now
return the provider's "API KEY REQUIRED" watermark placeholder (a 2KB
16-color mostly-blank PNG) IDENTICALLY on both sites — an external
degradation of the shared public tile URLs, not parity drift; if the live
ever fixes it upstream (an API key or a provider switch), re-measure.

Validated findings this session (all remediated, TDD-first):

- **The home stay grid = a STAGGERED FANNING grid (md+ only)**: three column
  wrappers; the middle column's scroll-linked translateY rises to −0.2 × the
  column height (−315.24px at 1576px); the outer cards fan
  `rotate(∓6°) + translateX(∓38px)` about `transform-origin: 0 100%`, each
  phased by its own viewport traversal `(vh − top)/(vh + height)` (the row
  pitch 399 staggers the phases). Settled col-1 card-0 rect [−78, 341] w418;
  col-3 [836, 1255] w418; matrix ±0.104528 = ±6.000°. Phones: `transform:
  none` at EVERY scroll position. (Earlier "39px/49px heart" and "card 563px
  image" desktop readings were rotation-inflated rect artifacts — always
  measure at a rest scroll or via offsetTop.)
- **The card hearts are RESPONSIVE**: 44×44 (h-11) below md / 36×36 (w-9)
  from md, always inset (16,16) — measured on the live's home stay cards,
  the /stay AND /eat browse cards, and the place-detail hero. The
  session-24 "36×36 everywhere" pin was a desktop-only truth (its dismissal
  of the session-10 44×44 reading encoded the pre-responsive live).
- **The showcase parallax is DESKTOP-ONLY**: at 390 the stay-card home imgs
  AND the sights imgs compute `transform: none` at every scroll (the 118%
  fill is pure layout). The mirror had run the 1.16 zoom + the ty parallax
  at mobile too.
- **The card typography is variant-specific**: the HOME cards render lh 1.5
  (h3 24/36 mob, 18/27 dsk; the meta 12/18.6 mob, 12/18 dsk) while the
  /stay BROWSE cards keep leading-tight (30/22.5) and the 16px md meta.
- **The mobile planner card**: `rgba(255,255,255,0.94)` (not /95) + the
  shadow's 1px white INSET top highlight over the unchanged 0 16 34 drop.
- **The mobile tab-bar anchors render 44px full-height tap targets** (the
  live's inner nav h-12 48px; the same visual text position — the x
  geometry was already exact).
- En-route traps recorded for the next audit: the VLM's full-page fan
  comparisons misjudge when the two screenshots frame different content
  windows (the mirror's home is ~430px taller above the stays grid — match
  the GRID's viewport position, not scrollY; the focused-crop comparison
  and the DOM numbers are the ground truth); the lazy-image layout shifts
  make fixed scroll captures unreliable (walk the scroll first, then park
  at the measured grid position — `scripts/capture-screens-session61.mjs`);
  the E2E/production layout differs from the dev-server layout for the
  same reason (probe per environment, never reuse doc positions).

## v2.27 addendum — session 64 (the CARTO-key basemaps + the no-inset fan ramp)

Audited against the operator's REDEPLOYED v2.26 mirror (fresh build +
re-seeded db, `docs/start_server_log.txt`) plus the operator's NEW
`docs/carto_key.txt` (the account's CARTO Basemaps API key). The mobile
navigation menu (the standing focus) re-verified EXACT at 390 on BOTH sites
(every tab-bar anchor 44px tall, the taps green — no Tailwind v4
regression); the identity's ninth measurement held "sepnetflix2023"; every
v2.26 surface re-verified (the fan structure/settled state, the responsive
hearts, the desktop nav); zero console errors.

Validated findings this session (all remediated, TDD-first):

- **The CARTO raster tiles need the account key**: the provider deprecated
  anonymous access — keyless `basemaps.cartocdn.com` URLs return a 2049B
  4-bit "API KEY REQUIRED" watermark placeholder (mostly blank). The LIVE's
  route SVG hrefs remain keyless (`hasKey: false`, verified today), so both
  sites render the watermarked map; the operator's key
  (`cb1_465p_1_988c53d611811b5d4bdb6b32`, committed non-secret) restores the
  real imagery. Empirically verified keyed: Berlin z13 → 9994B/28 colors
  (real streets); the route's own 5×5 grid → 24 real tiles (3074-21551B)
  with only the NW corner (8697/5642) a legitimately featureless 103B solid
  — the grid deliberately renders farmland NNE of Augsburg (the true city
  center sits at z14 x=8688/y=5670, so the showcase window was never the
  literal city). Remediated via the new `src/lib/carto.ts` seam
  (`CARTO_KEY` overridable through `NEXT_PUBLIC_CARTO_KEY`, defaulting to
  the committed key so keyless-env production builds still get clean tiles;
  `withCartoKey()` appends `?key=`/`&key=` with Leaflet's `{s}/{z}/{x}/{y}{r}`
  placeholders intact) applied at BOTH tile sites: `RecommendedRoute`'s
  25-tile `light_nolabels` grid and `LeafletCanvas`'s Voyager layer.
  `.env.example` documents the override; ADR-006 updated.
- **The middle fan column's ramp carries NO traversal inset**: a 5-point
  parked curve fit on the live (the grid top VERIFIED at each sample, after
  the documented walk-then-park lazy-load protocol) pins
  `ty = −0.2 × colH × clamp01((vh − gridTop)/(vh + gridH))` — the zero
  crossing at gridTop ≈ 799.6 (vh=800) and the slope 0.13266 =
  0.2×1576/2376 EXACT at every point. The v2.26 driver's session-62
  ±38px-inset fit diverges up to ~3.4px in the mid-ramp states (gridTop=400
  @ vh=800: −49.65 vs the live's −53.01); the p=0/p=1 states are
  inset-insensitive, which is why the session-62 "centered"/"settled" checks
  passed on BOTH models (the lesson: verification points must separate the
  candidate formulas, not sit on their shared fixed points). The outer
  cards' phases were verified EXACT to 4 decimals (no change).
- Gate arithmetic: **117 unit (+4: the carto seam) · 31 smoke · 102 E2E**
  (+2 new tests: the Leaflet tile-key + the self-calibrating no-inset
  mid-ramp fan; the route-desktop/mobile tile-key pins extend the existing
  route specs in place) —
  all executed green; 20 screenshots re-captured via
  `scripts/capture-screens-session63.mjs` (the map captures now document
  the real keyed basemaps — the pixel palette's keyed land tone
  (238,243,238) replaces the watermark era's blank (250,250,248); the
  mobile-map capture's tile-wait threshold corrected to 4: a 390 viewport
  shows only ~6 z14 tiles, the desktop's 12 does not apply).

## v2.28 addendum — session 66 (the /map basemap + view model + search semantics)

Audited against the operator's REDEPLOYED v2.27 mirror (fresh build +
re-seeded db + `NEXT_PUBLIC_CARTO_KEY` in `.env`, `docs/start_server_log.txt`)
plus the operator's `docs/session_65.md` (the session-64 transcript archive).
The mobile navigation menu (the standing focus) verified EXACT at 390 on
BOTH sites — the tab-bar is fixed at the viewport TOP (0, 0, 390, 52; the
probe's first pass searched the viewport's BOTTOM half and found nothing —
the bar was always there), the glass and link geometry exact, every anchor
44px, the taps green — no Tailwind v4 regression; the identity's TENTH
measurement held "sepnetflix2023". Every v2.27 surface re-verified: the
mirror's route tiles 50/50 keyed, the /map tiles 24/24 keyed AND loaded
with the real imagery pixel-verified (1942 distinct colors, the
(238,243,238) land tone), the fan settled −315.237/−315.34, the mid-ramp
no-inset delta 0.00 at TWO parked points, the category fan ±18°, the
hearts, the hero, the booking label, zero mirror console errors; the live
remains keyless upstream (its route SVG hrefs AND /map tile srcs both
`hasKey: false`).

Validated findings this session (both on the /map surface, both remediated
TDD-first — the live's /map canvas was probed at the TILE level for the
first time; prior sessions pinned the chrome but never the tile URL or the
zoom model):

- **The basemap + view model (F1)**: the live serves `light_nolabels` z15
  tiles — the SAME minimal style family as its route map — while the clone
  served `rastertiles/voyager` (the original "the reference app's
  carto.com basemap" comment was never verified against the live). The
  live's initial view is a FITBOUNDS model,
  `fitBounds(9 places, {padding: [40, 40], maxZoom: 15})`: the zoom is
  viewport-dependent (z13 @390 canvas 356×310, z14 @640 canvas 396×310,
  z15 @768+ canvas 702-1278×620 — measured across 11 viewports; the
  padding pinned by discriminators: canvas 362 → z13 while 366 → z14, the
  1278-canvas case capped at z15 by the maxZoom), the 9-pin BOUNDS
  centered (the west/east pins at exactly (w−span)/2 — NOT the centroid:
  the asymmetric distribution sits ~19px east at 390 on BOTH sites, a
  probe-side mid-range math error that initially looked like a live-side
  difference), the view RE-FITTING on every actual filter change (the pane
  translated −141px after the Restaurants pill; the 390 zoom climbing z13
  → z14 after the Hotels pill), maxZoom 18 (22 clean zoom-ins from the z0
  floor), and the mobile canvas a FIXED 356×310 (measured at
  390×{700, 844, 1000}; the clone had 62vh ≈ 521). Remediated in
  `LeafletCanvas.tsx`: the keyed `light_nolabels` URL, maxZoom 18, the map
  created with NO fixed center/zoom, the view set by the mount fit
  (instant) with later points-changes re-fitting ANIMATED (a
  didInitialFit ref) — replacing the guard-gated `.pad(0.18)` fit that
  NEVER FIRED (the fixed z14 view already contained the bounds center, so
  the guard failed); `MapExplorer.tsx`'s canvas `h-[62vh] min-h-[420px]`
  → `h-[310px]`.
- **The search + list semantics (F2)**: the live's query submits on ENTER
  — typing NEVER filters ("brass" typed + 2s left 9 markers unchanged). A
  pill click filters WITHIN the visible set with the EMPTY-intersection
  FALLBACK to the pill-only set (the query resets, the input text stays
  stale: "brass"+Restaurants → 3 while "garden"+Restaurants → 1); a query
  submitted while a pill is active is pure AND ("brass"+Restaurants
  active+Enter → 0 "No places"). The list header carries the bare-count
  white rounded-full px-3 py-1.5 12px/600 COUNT CHIP; the clear button is
  the live's 28px (w-7 h-7) disc. Remediated in `MapExplorer.tsx`: the
  `inputText`/`submittedQuery` state split (Enter submits),
  `selectFilter`'s within-visible + empty-fallback model, the clear button
  resetting both + the 28px chrome, the count chip, and the "No places"
  empty state. (The live's async/fuzzy server-side MATCHING semantics —
  "garden"→1, "hotel"→3, "ember"→3-or-9 across runs — are documented as
  un-replicable; the clone's deterministic local haystack match stays.)
- Gate arithmetic: **117 unit · 31 smoke · 102→109 E2E** (+7 new tests:
  the fitBounds zoom model, the maxZoom 18 cap, the Enter submission, the
  pill empty-fallback, the re-fit, the count chip + No-places state, the
  28px clear; the session-63 tile-key pin re-targeted to light_nolabels
  in place) — all executed green; 20 screenshots re-captured via
  `scripts/capture-screens-session65.mjs` (the map captures now document
  the light_nolabels palette — the (237,237,237) land tone + white
  roads). Two R0 pins were re-calibrated during GREEN: the centroid
  centering corrected to the BOUNDS-range midpoint (the live's own
  centroid is off-center too), and the maxZoom pin re-designed around
  Leaflet's DISABLED control state (a 5th click on the capped control
  times out — the first RED run surfaced it as a test timeout).


## v2.29 addendum — session 68 (the /map frame + events chip + search status pill)

Validated on the live + the remediated tree:

- The live's /map search is now ASYNC/LLM-POWERED: Enter submits → the
  violet "Searching for {query}-related options in Augsburg." pill
  renders (persisted while the search runs — "brass" never resolved in
  15s) → the pill's text swaps to an LLM-generated intent line
  ("Looking for places with a nice garden.", "Finding a great hotel in
  Augsburg.", "Finding places with beautiful garden settings." — per
  query, per run) and the results filter. The resolved line is
  NON-REPLICABLE (deterministic local haystack); the clone carries the
  live's own pending template while the query is active. The
  viewport-resize RESETS the live's search state (a re-mount).
- The live's canvas frame: `rounded-[32px] md / 28px phones +
  border-white/70 + bg-white + 0 18px 44px /0.10` — the clone's
  rounded-3xl/border-black/5/shadow-card was the session-12 contract,
  superseded.
- The "0 events · N places" chip: the live's own text has NO
  pluralize-check ("0 events · 1 places" measured at 390) and the count
  updates with every filter ("0 events · 3 places" after Restaurants).
- F5 (the mobile search pill): `flex-1` on a row inside a flex COLUMN
  sets flex-basis: 0% which OVERRIDES the height utility for the main
  axis — the row collapsed to its min-content floor (34px). The fix
  pattern: move `flex-1` to a WRAPPER (`w-full md:flex-1`) so the height
  utility applies on the row, and/or pin the height with the CONTENT
  (the input's h-11). This is the third sighting of a
  responsive-flexbox-silently-kills-a-utility bug class on this project
  (the earlier two: the hero z-index cap, the oklab serialization).
- The pills row at mobile: LEFT-aligned overflow (the live's first pill
  at x=16, Sights clipped right, scrollable) — justify-center
  center-clips both ends in Chromium (the first pill unreachable).
