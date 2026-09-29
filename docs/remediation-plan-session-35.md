# Session 35 — Remediation Plan (audit of the grok commits → DB pinning, toolchain restore, screenshots, docs)

Date: 2026-09-30 · Agent: coding specialist (session 35)

## 1. Context

Workspace refreshed via a fresh `git clone` of `https://github.com/nordeim/activity-map-g.git`
at `3fc7e4f`. The tree carries two operator commits on top of the session-33 parity
work: `e35202e` ("cleanup images and obsolete docs") and `3690531` ("grok updates" —
the npm-runtime port of session 34, per `docs/recent_changes_to_validate.txt`). This
session audits those commits, re-validates the codebase against every doc
(AGENTS.md, CLAUDE.md, README.md, PAD v2.12, activity-map_SKILL.md, the session
logs, the worklog), and runs the dual-site browser audit (live source
`activity-map.base44.app` + deployed mirror `activity-map.jesspete.shop`).

## 2. Audit results

| Surface | Result |
|---------|--------|
| Baseline gate (untouched tree) | lint ✓ (2 pre-existing warnings) · typecheck ✓ · 48 unit ✓ · build ✓ · 27/27 smoke ✓ · E2E 75/76 then 76/76 (one font-timing flake, see A6) |
| Live source (logged in, 1280×900 + 390×844) | Every swept signature UNCHANGED vs session-33: desktop nav 433/559/639/727 · mobile tab-bar 121/192/222/259 + icons 304/330/356 · 52px glass blur(24px) saturate(1.5) · footer pill compact 506×96 → grown 646×118 (scroll-linked growth intact) |
| Deployed mirror (logged in) | Running the SESSION-33 code (press-shrink 9/9, `--footer-p` calc classes, p=0.9441 → 638×117) — zero console errors on 10 pages · mobile nav end-to-end (taps + active state) · favourites round-trip · booking round-trip. NO BUGS FOUND |
| DB placement | `<repo>/db/custom.db` recreated (118784 bytes) — but only after re-pinning; see A1 |

## 3. Findings

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| A1 | **High** | The npm scripts (`dev`, `start`, `db:push`, `db:seed`) LOST the inline `DATABASE_URL=file:../db/custom.db` pinning that AGENTS.md documents as load-bearing ("keep the pinning"). A stray parent-directory `.env` + an exported shell var (`file:/home/z/my-project/db/custom.db`) hijacked `db:push`/`db:seed` — the seed wrote the DB one level ABOVE the repo until re-pinned. | Reproduced: `npm run db:seed` printed `→ file:/home/z/my-project/db/custom.db`; repo `db/` empty |
| A2 | **High** | Toolchain downgraded vs the parity baseline every session 3–33 contract was measured on: tailwindcss 4.3.3→4.1.17, @tailwindcss/postcss 4.3.3→4.1.17, next 16.3.6→16.2.6, react/react-dom 19.3.0→19.2.6; `package-lock.json` regenerated wholesale (6099 lines). The E2E corpus still passes on 4.1.17, but the documented stack (README/PAD/scandihaven patterns) is the 4.3.x/16.3.x line — unexplained drift is regression risk. | `git show 3690531 -- package.json`; `npm ls tailwindcss` → 4.1.17 |
| A3 | **High** | The `e35202e` "cleanup" commit deleted ALL `docs/screenshots/*.png` (66 captures), every `docs/reference/*` image, and `docs/activity-map-dashboard.png` — the README still embeds the deleted paths, so every image link in the rendered README is broken. | `git show --stat e35202e` (2460 files, 1.35M deletions); `ls docs/screenshots` → No such file |
| A4 | **Med** | Executable bits stripped from `scripts/smoke-test.sh`, `capture-screens-v3.sh`, `capture-screens-v8-session27.sh`, `par-probe.sh`, `par-probe2.sh` (100755→100644) — AGENTS.md's documented `./scripts/smoke-test.sh` fails with Permission denied. | `git show 3690531` (mode changes); reproduced |
| A5 | **Med** | Unused sandbox scaffolding contradicting the documented Prisma/SQLite architecture: `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`, `dotenv` dependencies + `drizzle.config.json` (points at `postgresql://…app_db`) + `src/db/{index,schema}.ts` shims. Zero imports from `src/`. | `grep -rn drizzle src/ prisma/` → only the shim's own comment |
| A6 | **Med** | The E2E shrink-wrapped position spec (`tests/e2e/mobile-navigation.spec.ts:133`) measures link geometry without waiting for `document.fonts.ready` — the Inter webfont loads from Google Fonts via `<link>`, and under full-suite network contention the fallback-font metrics shift the links ~6px (Highlights x=115 vs the 121±2 contract). Reproduced once (75/76), green in isolation and on the re-run. The mobile nav itself is CORRECT (mirror + live geometry exact, taps green). | `test-results/.../error-context.md`; `src/app/layout.tsx` CDN font `<link>` |
| A7 | **Med** | `scripts/install_packages.sh` still installs removed packages (radix-*, zustand, z-ai-web-dev-sdk, tailwindcss-animate, bun-types) — fights `package.json`. | `cat scripts/install_packages.sh` |
| A8 | **Low** | Stale `bun.lock` (2026-09-24, the old bun/4.3.3 dep set) coexists with the npm `package-lock.json` — two lockfiles, one stale. | `ls -la bun.lock package-lock.json` |
| A9 | **Low** | `.env` header comment says `bun run db:push && bun run db:seed` while the runtime is npm (`.env.example` already says npm). | `head .env` |
| A10 | **Low** | `vitest.config.ts` header comment describes a different project's seams ("router, clarify questions, plan sanitizer, check-in mapping") — stale. | `head vitest.config.ts` |
| A11 | **Low** | README stale bits: "18 client components" (it is 21), screenshot references to the deleted 66-capture set, bun-era command remnants. | `grep -n "client components" README.md` |
| A12 | Info | `.env` is git-tracked WITH a real `AUTH_SECRET` (pre-existing convention across sessions; `.gitignore` lists `.env` but it was force-added). Keeping the convention; `.env.example` stays secret-free. | `git ls-files .env` |
| A13 | Info | GOOD grok changes to KEEP: `cookieSecureFlag()` (HTTP previews keep the session cookie) + `tests/auth.test.ts`; `runtimeDatabaseUrl()` Postgres guard + the 2 db-path tests; `/api/health` `SELECT 1`; the npm-runtime port (`next start`, `serverExternalPackages`, no `output: "standalone"`); Playwright `reuseExistingServer: false`; `postinstall: prisma generate`; `tsx` for the seed. | verified in the diff + green gates |

## 4. Plan (TDD)

| # | Task | Files | Verification |
|---|------|-------|--------------|
| R0 | RED — pin the seed contract under a hostile env: assert `npm run db:seed` writes `<repo>/db/custom.db` even with `DATABASE_URL=file:/home/z/my-project/db/custom.db` exported + a parent `.env` present | (shell probe, fails on the current tree) | probe FAILS before R1, PASSES after |
| R1 | GREEN — restore the inline `DATABASE_URL=file:../db/custom.db` pinning on `dev`, `start`, `db:push`, `db:seed` (the documented convention) | `package.json` | R0 probe passes; full gate re-run |
| R2 | Restore the parity toolchain: `next ^16.3.6`, `react`/`react-dom ^19.3.0`, `@types/react{,-dom} ^19.3.0`, `tailwindcss ^4.3.3`, `@tailwindcss/postcss ^4.3.3`, `eslint-config-next ^16.3.6`; move `@playwright/test`/`vitest`/`@types/leaflet` back to devDependencies; keep `tsx` in dependencies (the deployment runs `db:seed`); regenerate the lockfile via npm (never hand-edit) | `package.json`, `package-lock.json` | `npm ls` shows the restored set; build + full gate green |
| R3 | Fix the font-timing flake: await `document.fonts.ready` before the geometry measurements in both shrink-wrap specs (390 + 640) | `tests/e2e/mobile-navigation.spec.ts` | the spec green across repeated full-suite runs |
| R4 | Remove the unused Drizzle/Postgres scaffolding (A5) + the stale `bun.lock` (A8) | delete `drizzle.config.json`, `src/db/`, `bun.lock`; prune deps in `package.json` via npm | `npm run typecheck` + build green; zero src imports (verified pre-delete) |
| R5 | Restore the script exec bits (A4) | `chmod +x` on the 5 scripts | `./scripts/smoke-test.sh` boots without Permission denied |
| R6 | Align `scripts/install_packages.sh` with the real dependency set (A7) | `scripts/install_packages.sh` | diff vs `npm ls --depth=0` |
| R7 | `.env` / `.env.example` alignment (A9 + the operator's ask): `.env` keeps `DATABASE_URL="file:../db/custom.db"` with npm-accurate comments; `.env.example` covers every code-referenced var (`DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` — now load-bearing via `cookieSecureFlag()` — `AUTH_SECRET`, `DEBUG_DBPATH`) with a working copy→run recipe | `.env`, `.env.example` | every var referenced in `src/` documented |
| R8 | Fix the stale `vitest.config.ts` header comment (A10) | `vitest.config.ts` | comment matches the real seams (db-path, filters, planner, auth) |
| R9 | Re-capture the dev-server screenshot set into `docs/screenshots/` (A3 + the operator's ask) via a Playwright capture script against the remediated `next dev` server; rewrite the README's screenshot narrative to reference the NEW set only | `docs/screenshots/*`, `scripts/capture-screens-session35.mjs`, `README.md` | every README image path resolves in the tree |
| R10 | Docs alignment: README (21 client components, npm-first commands, screenshot set, session-35 row), AGENTS.md (npm-first command table + gate order, keep bun as alternative), CLAUDE.md (npm setup), PAD v2.13 + SKILL v1.21.0 revision blocks, `docs/session_42.md` (this session's log), the worklog | the 6 docs | every command in AGENTS.md/README verified runnable |

Non-gaps (keep, verified unchanged): the mobile tab-bar geometry (121/192/222/259 at
390; 246/317/347/384 at 640), the 52px border-box bar, the press-shrink contract,
the desktop 820px pill, the footer scroll-linked growth, the demo seed
(42+27+9 places + `sepnetflix2023@outlook.com`), `cookieSecureFlag`,
`runtimeDatabaseUrl`'s Postgres guard, the health DB check, the npm-runtime port.

## 5. Execution record

- **R0/R1 (TDD, the DB pinning)**: RED — the hostile-env probe (an exported
  `DATABASE_URL=file:/home/z/my-project/db/custom.db` + the stray parent `.env`)
  made the unpinned `db:push`/`db:seed` write the DB one level above the repo
  (FAIL, reproduced twice). GREEN — the inline `DATABASE_URL=file:../db/custom.db`
  pinning restored on `dev`/`start`/`db:push`/`db:seed`; the probe now PASSes:
  under the exported hostile var the pinned scripts write the fully-seeded
  118784-byte `<repo>/db/custom.db`.
- **R2 (toolchain restore)**: `next ^16.3.6` (resolves 16.3.7), `react`/`react-dom
  ^19.3.0`, `@types/react{,-dom} ^19.3.0`, `tailwindcss ^4.3.3`,
  `@tailwindcss/postcss ^4.3.3`, `eslint-config-next ^16.3.6`; `@playwright/test`,
  `vitest`, `@types/leaflet` moved back to devDependencies; `tsx` kept in
  dependencies (the deployment runs `db:seed`); the lockfile regenerated via npm.
  Verified: 48 unit ✓ · build ✓ (same pre-existing NFT warning as the documented
  baseline) · 76/76 E2E ✓.
- **R3 (font-timing flake)**: both shrink-wrap specs (390 + 640) and the desktop
  pill spec now `await document.fonts.ready` before measuring (the `awaitWebfonts`
  helper). Verified: **76/76 E2E × 3 consecutive full-suite runs** (previously the
  flake hit 1-in-2 full-suite runs).
- **R4 (scaffolding removal)**: deleted `drizzle.config.json`, `src/db/`,
  `bun.lock`; pruned `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`, `dotenv`
  from package.json via npm. Zero src imports verified before deletion.
- **R5 (exec bits)**: `chmod +x` restored on smoke-test.sh + the 4 capture/par
  scripts; `./scripts/smoke-test.sh` boots without Permission denied.
- **R6**: `scripts/install_packages.sh` rewritten to the exact package.json set.
- **R7 (env alignment)**: `.env` keeps `DATABASE_URL="file:../db/custom.db"` with
  npm-accurate comments (+ the dead `SITE_URL` var removed — nothing reads it);
  `.env.example` documents every code-referenced var including the now
  load-bearing `NEXT_PUBLIC_SITE_URL` (cookieSecureFlag) and the inline-pinning
  contract.
- **R8**: the stale `vitest.config.ts` header comment now names the real seams.
- **R9 (screenshots)**: 16 dev-server captures re-captured into
  `docs/screenshots/` via `scripts/capture-screens-session35.mjs`
  against `npm run dev` — desktop home/sections/browses/map/detail/favourites/
  profile/grown-footer + mobile home/eat/nav/map + login. The README's screenshot
  narrative + image links rewritten to the new set. En-route lesson (now encoded
  in the capture script): a Playwright `fill` on a not-yet-hydrated React form is
  silently reset to "" by hydration — the capture login goes straight to /login,
  settles, and VERIFIES the input values before clicking submit (the observed
  empty-fields 400).
- **R10 (docs)**: README (the session-34/35 rows, 21 client components, the npm
  deployment commands, the screenshot set), AGENTS.md (npm-first command table +
  gate order + first-run setup, the standalone note rewritten for `next start`,
  48 unit), CLAUDE.md (npm setup + build table + the 48-check test pyramid incl.
  the auth seam), PAD v2.13 + activity-map_SKILL.md v1.21.0 revision blocks,
  docs/DEPLOYMENT.md (npm commands), the worklog, docs/session_42.md, this plan.
- **En-route finding A15 (fixed)**: the smoke script's cleanup couldn't kill the
  npm-runtime server — `next start` renames its worker to `next-server (vX.Y.Z)`
  which the `pkill -f "next start"` pattern misses, and `kill $SRV` only kills
  the npx wrapper, orphaning the worker holding :3000 with a spent in-memory
  rate limiter → phantom 429/401 failures on the NEXT run (reproduced: 13/27).
  Fixed by killing the PORT (ss-based `kill_port`; lsof is blind in this sandbox)
  at BOTH the clean-slate and the shutdown. Verified: 27/27 × 2 back-to-back
  runs with the port confirmed free after each.
- **Final gate on the push tree**: lint ✓ (2 pre-existing warnings) · typecheck ✓ ·
  48 unit ✓ · build ✓ · 27/27 smoke ✓ ×2 · **76/76 E2E ✓ ×3**.
