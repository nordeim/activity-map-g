# Session 36 — Remediation Plan (dep hygiene + the npm-audit chain + the .env comment, on a fully-verified parity baseline)

Date: 2026-09-30 · Agent: coding specialist (session 36)

## 1. Context

Workspace refreshed via a fresh `git clone` of `https://github.com/nordeim/activity-map-g.git`
at `ae20598` (the owner's post-session-35 "update start server log" commit on top of
session 35's `5a4e9c2` remediation push). Every root doc re-read in full (AGENTS.md,
CLAUDE.md, README.md, the PAD, activity-map_SKILL.md) plus the session history
(`docs/session_42.md` = the session-35 log, `docs/session_43.md` = the session-35 raw
conversation log, `docs/remediation-plan-session-35.md`, the worklog,
`docs/recent_changes_to_validate.txt`, `docs/start_server_log.txt`). The scandihaven
reference repo re-cloned and its patterns re-verified (Tailwind v4 CSS-first + npm/Next
16.3 conventions — activity-map already follows them). This session's plan is
`docs/remediation-plan-session-36.md` and its log is `docs/session_44.md`.

## 2. Audit results

| Surface | Result |
|---------|--------|
| Baseline gate (untouched tree) | lint ✓ (2 pre-existing warnings in scripts/) · typecheck ✓ · 48 unit ✓ · build ✓ · 27/27 smoke ✓ · **76/76 E2E ✓ on the FIRST run** (the session-35 font-timing fix holding) |
| Session-35 remediation intact | A1 DB pinning ✓ (the seed wrote `<repo>/db/custom.db` at exactly 118784 bytes) · A2 toolchain ✓ (tailwind 4.3.3 / next 16.3.7 / react 19.3.0 — verified by the green build + E2E) · A3 screenshots ✓ (16 captures + README links) · A4 exec bits ✓ (`./scripts/smoke-test.sh` ran) · A5 no Drizzle ✓ · A15 smoke orphan fix ✓ (port free after the run) |
| Live source (`activity-map.base44.app`, logged in) | Every swept signature UNCHANGED vs session-33/35: desktop nav links x=433/559/639/727/805 · mobile tab-bar @390 text links 121/192/222/259 + icons 304/330/356 + the 52px border-box glass bar (rgba(248,247,244,0.62) + blur(24px) saturate(1.5)) · @640 links 246/317/347/384 · footer pill compact 506×96/r-28/links 74×78 → grown 646×118/r-34/links 92×92/gap 12 (the scroll-linked growth contract) · hero h1 y=319 @1280×900. **NO DRIFT.** |
| Deployed mirror (`activity-map.jesspete.shop`, logged in) | Running the session-33/35 code (the footer `--footer-p=0.9422` → 638×117 mid-growth signature) — zero console errors swept across 7 pages · the mobile navbar end-to-end at 390 (geometry EXACT, tap navigation with the active state moving, 700/ink active link) · the favourites round-trip (save → card → unsave → "No favourites yet" empty state) · the booking round-trip (native-setter fill → "Request sent" → visible under Profile → My bookings). **NO BUGS FOUND — the mobile navigation menu works exactly as expected.** |
| Operator commit `ae20598` | Adds the npm `allowScripts` block (npm v11+ install-scripts hygiene — GOOD, addresses the blocked-postinstall warnings in the start-server log), `docs/session_43.md`, and the start-server log refresh. No code changes. No regressions (the full gate ran green on top of it). |

## 3. Findings

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| B1 | **Med** | 3 unused runtime dependencies: `zustand` (contradicts the documented architecture — CLAUDE.md: "State: local useState/useMemo only — no Zustand"), `tailwindcss-animate` (the v3-era plugin; the repo's animation import is `tw-animate-css` in globals.css, which IS used), `class-variance-authority` (zero imports; `src/lib/utils.ts` uses only clsx + tailwind-merge). Every unused dep is install bloat + an unexplained drift vs the documented stack. | `grep -rl` over `src/` → zero matches for all three |
| B2 | **Low** | `.env`'s PostgreSQL section says `3. bun run db:push && bun run db:seed` — a bun leftover. The file's header is npm-accurate (session-35 R7) but this section contradicts both it and `.env.example` (which correctly says `npm run`). | `grep -n "bun run" .env` |
| B3 | **Med** | `npm audit`: 3 high-severity advisories — `deepmerge-ts < 8.0.0` (GHSA-ggr8-5vv4-36mx, stack exhaustion on recursive object graphs) via `prisma@6.19.3 → @prisma/config@6.19.3 → deepmerge-ts@7.1.5`. Dev-CLI-time only (the merge input is developer config, never user input), but it flags on every install and the start-server log carries it. `npm audit fix --force` would DOWNGRADE prisma to 6.12.0 (a regression — reject). The clean fix is an npm `overrides` pin: deepmerge-ts 8.0.2 is dual-package (index.mjs + index.cjs), exports the same `deepmerge` API name, zero deps, and `@prisma/config` loads it via dynamic `await import("deepmerge-ts")` — verified compatible on Node 24. | `npm audit`; `npm ls deepmerge-ts`; `node -e` import/require probes on the 8.0.2 tarball |
| B4 | Info | GOOD owner changes to KEEP: the `allowScripts` block (`@prisma/client`, `esbuild`, `prisma` postinstalls explicitly allowed — npm v11+ hygiene). | `git show ae20598 -- package.json` |
| B5 | Info | Parity: NO DRIFT on the live source; the mirror matches it EXACTLY at every swept signature; the mobile navigation menu (the operator's flagged area) works perfectly at 390/640/1280 on both sites. No Tailwind v4 regression (the 76-check E2E corpus incl. the five v4 failure-class pins is green first-run). | §2 audit table |
| B6 | Info | The non-gaps re-verified: the 21 client components (23 "use client" files = 21 components + the not-found page + the useParallax hook), skills/ excluded from tsconfig + eslint, `.gitignore` correct (db/*.db, .env, dev.log/server.log), README's screenshot narrative + links resolve (16/16). | §2 + targeted checks |

## 4. Plan (TDD)

| # | Task | Files | Verification |
|---|------|-------|--------------|
| R0 | RED — the dependency contract probe: assert zero `src/` + `prisma/` + config references to `zustand` / `tailwindcss-animate` / `class-variance-authority` (the pre-delete safety check), and `npm audit` showing 3 high (the pre-override state) | (shell probes) | probes document the RED state |
| R1 | GREEN — remove the 3 unused deps via `npm remove zustand tailwindcss-animate class-variance-authority` (never hand-edit package.json); align `scripts/install_packages.sh` to the pruned set | `package.json`, `package-lock.json`, `scripts/install_packages.sh` | the probe still shows zero references; `npm ls` clean; typecheck + build + 48 unit green |
| R2 | The npm-audit chain: add `"overrides": { "deepmerge-ts": "^8.0.2" }`, reinstall, verify `npm ls deepmerge-ts` → 8.0.2 under @prisma/config | `package.json`, `package-lock.json` | **`npm audit` → 0 vulnerabilities** (RED 3 high → GREEN 0); the full Prisma CLI path re-exercised: `prisma generate` (postinstall) + `db:push` + `db:seed` (the seed re-writes the 118784-byte DB) + build + smoke + E2E |
| R3 | Fix the `.env` PostgreSQL-section comment (bun → npm) — align with `.env.example` | `.env` | `grep -rn "bun run" .env` → empty |
| R4 | Re-capture the 16 dev-server screenshots on the REMEDIATED tree via a session-36 capture script (the session-35 script's proven login/settle/verify pattern) | `docs/screenshots/*.png`, `scripts/capture-screens-session36.mjs` | 16 captures with healthy sizes; the rendered geometry re-verified on the captured state |
| R5 | Docs alignment: README (the dep-hygiene + audit-override note), AGENTS/CLAUDE (only if the dep set is mentioned — verify), the worklog, `docs/session_44.md`, this plan's execution record | the docs | every doc claim matches the tree |
| R6 | Final gate ×2 on the push tree: lint → typecheck → 48 unit → build → 27/27 smoke → 76/76 E2E, then the SSH-wrapper push to main (single conventional commit) | — | all gates green ×2 |

Non-gaps (keep, verified unchanged): every parity surface (§2), the DB pinning, the
toolchain versions, the allowScripts block, the 16-screenshot set's narrative, the
vitest/playwright configs (48 + 76 checks), the mobile-nav failure-class pins, the
cookieSecureFlag + Postgres-guard + health-check seams.

## 5. Execution record

- **R0 (RED, documented)**: the zero-reference probe over `src/` + `prisma/` + every
  config returned no matches for `zustand` / `tailwindcss-animate` /
  `class-variance-authority` (safe to prune); `npm audit` showed 3 high
  (deepmerge-ts < 8.0.0 via prisma@6.19.3 → @prisma/config@6.19.3 →
  deepmerge-ts@7.1.5); `package.json` had no `overrides` block; `.env` line 20
  carried the `bun run` leftover.
- **R1 (GREEN, the dep prune)**: `npm remove zustand tailwindcss-animate
  class-variance-authority` (the CLI keeps the lockfile authoritative);
  `scripts/install_packages.sh` rewritten to the pruned set with the session-36
  provenance comment. Verified: zero references still; `npm ls` clean;
  typecheck ✓ · lint ✓ (the 2 pre-existing warnings) · 48 unit ✓ · build ✓.
- **R2 (the npm-audit chain)**: `"overrides": { "deepmerge-ts": "^8.0.2" }` added
  via a JSON-preserving script + reinstall. Verified: **`npm audit` → found 0
  vulnerabilities** (was 3 high); `npm ls deepmerge-ts` → 8.0.2 under
  @prisma/config; the full Prisma CLI path re-exercised — `prisma generate`
  (postinstall) ✓ · `db:push` ✓ · `db:seed` re-wrote the fully-seeded
  118784-byte `<repo>/db/custom.db` ✓ (the pinning holds under the override).
- **R3 (the .env comment)**: the PostgreSQL section now reads
  `npm run db:push && npm run db:seed` — `grep -n "bun run" .env` returns
  nothing; `.env` and `.env.example` are now uniformly npm-first.
- **R4 (screenshots)**: the 16-capture set re-taken on the REMEDIATED tree via
  `scripts/capture-screens-session36.mjs` (the session-35 script's proven
  login/settle/verify pattern) against `npm run dev` — desktop home + the four
  home sections + Eat/Stay/map/detail/favourites/profile + the grown footer +
  the mobile home/Eat/nav/map + login; all 16 healthy sizes (the largest
  1.5MB home capture down to the 42KB favourites frame).
- **R5 (docs)**: README (the session-36 row + the screenshot narrative), the PAD
  v2.14 revision block + the corrected stale body (ADR-004 retitled for the npm
  runtime, §7.3 the 48/76 counts + the auth seam, §7.4 the npm gate commands,
  §8.1/§8.3 the `next start` build/deploy story, §9.1 the npm setup, the
  architecture-diagram subgraph, §10 the dep-hygiene row closed + the stale
  NEXT_PUBLIC_SITE_URL row corrected), CLAUDE.md (the tech-stack line), the
  SKILL v1.22.0 (the toolchain table's npm-runtime row + the scaffold-leftovers
  note marked pruned + the project_state), `.env`, `install_packages.sh`,
  `docs/session_44.md`, the worklog, this plan.
- **R6 (final gate)**: lint ✓ · typecheck ✓ · 48 unit ✓ · build ✓ · 27/27 smoke
  ✓ ×2 · 76/76 E2E ✓ ×2 — on the push tree.
