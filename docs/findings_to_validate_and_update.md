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
