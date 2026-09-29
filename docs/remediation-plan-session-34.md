# Session 34 — Remediation Plan (npm runtime, SQLite pin, HTTP cookies, mobile-nav regression)

Date: 2026-09-29 · Agent: coding specialist (session 34)

## 1. Context

Re-cloned `https://github.com/nordeim/activity-map.git` into a Next.js 16 +
npm sandbox. The live reference is `https://activity-map.base44.app/` (demo
login `sepnetflix2023@outlook.com` / `$Abcd1234`); the previously deployed
mirror is `https://activity-map.jesspete.shop/`. Session 33 left the tree
at 42 unit + 76 E2E against Bun/standalone. This session ports the same
app onto npm + `next start`, keeps SQLite at `<repo>/db/custom.db`, and
closes two production-preview bugs that would make login and health fail
in this sandbox.

## 2. Audit results

| Surface | Result |
|---------|--------|
| Live source (`activity-map.base44.app/login`) | HTTP 200 SPA shell (Vite/base44). Auth-gated dashboard requires the demo login. |
| Deployed mirror (`activity-map.jesspete.shop/login`) | HTTP 200 Next.js login card (`Sign in · ROAM`, `/images/login-logo.png`). |
| Mobile nav (clone) | Session-32 shrink-wrap + press-shrink already present; E2E pins Tailwind v4 failure classes A–E. |
| Database | Prisma/SQLite. `DATABASE_URL="file:../db/custom.db"` → `<repo>/db/custom.db`. |
| Sandbox risk | Workspace `.env` historically injects Postgres; Prisma schema is SQLite. |
| Sandbox risk | `NODE_ENV=production` + HTTP preview dropped the session cookie (`Secure`). |

## 3. Findings

| # | Sev | Finding | Fix |
|---|-----|---------|-----|
| F1 | **High** | Runtime Prisma would follow a workspace-injected Postgres `DATABASE_URL` and crash (wrong dialect). | `runtimeDatabaseUrl()` pins `file:../db/custom.db` when the env is missing or `postgres://`. |
| F2 | **High** | Session cookies used `secure: NODE_ENV==="production"`, so HTTP `next start` previews never stored the login cookie. | `cookieSecureFlag()` is true only for `https://` site URLs. |
| F3 | **Med** | Playwright / smoke scripts booted `bun .next/standalone/server.js`; this sandbox is npm + `next start`. | `playwright.config.ts`, `scripts/smoke-test.sh`, `next.config.ts` (drop standalone, add `serverExternalPackages`). |
| F4 | **Med** | `/api/health` did not touch the database, so a missing SQLite file still looked healthy. | Health runs `SELECT 1` via Prisma. |
| F5 | **Low** | Docs still said Bun / 42 unit tests / standalone. | README, DEPLOYMENT.md, `.env.example` aligned to npm + SQLite path contract. |

Non-gaps (keep): mobile tab-bar geometry (121/192/222/259 at 390), 52px
border-box bar, desktop 820px pill, footer scroll-linked growth, demo
seed (42+27+9 places + `sepnetflix2023@outlook.com`).

## 4. Plan (TDD)

| # | Task | Files | Verification |
|---|------|-------|--------------|
| R0 | RED — cookie Secure flag + Postgres-URL pin | `tests/auth.test.ts`, `tests/db-path.test.ts` | Fail on the unmodified tree |
| R1 | GREEN — implement both | `src/lib/auth.ts`, `src/lib/db-path.ts` | 48 unit tests pass |
| R2 | npm Playwright + health + Prisma generate | `playwright.config.ts`, `src/app/api/health/route.ts`, `package.json` scripts | `npx next typegen`, `tsc`, `npm run build` |
| R3 | Screenshots + docs | `docs/screenshots/`, README, DEPLOYMENT, this plan | Captures from the remediated `next start` |

## 5. Execution record

- R0/R1: 48/48 Vitest green (17→19 db-path, +4 auth).
- SQLite file created at `db/custom.db` (118784 bytes after seed).
- Runtime: npm, Next.js 16.2.6, Prisma 6.19.3, Tailwind CSS 4.1.17.
