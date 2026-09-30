# Deployment Guide

ROAM (Augsburg City Guide) ships as a single Next.js app with a SQLite file
database — one process, zero external services. This guide covers the
supported production paths and the environment contract.

## 1. Build

```bash
npm install
npm run build          # next build
```

The build compiles the page shell and the API route handlers. Prisma's
SQLite engine is kept external via `serverExternalPackages` in
`next.config.ts` so the query binary is not bundled away.

## 2. Run

```bash
npm run start          # NODE_ENV=production next start
```

The server listens on port 3000 by default (`PORT` overrides). Always start
it from the repo root via the npm script — the SQLite path resolution
(`file:../db/custom.db` → `<repo>/db/custom.db`) depends on the schema
anchor at `prisma/schema.prisma`. Behind a reverse proxy, forward the
original host so Next.js computes request URLs correctly (nginx:
`proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme;`)
and `X-Forwarded-Proto` so cookie attributes derive the right scheme. Session
cookies only get the `Secure` flag when `NEXT_PUBLIC_SITE_URL` is `https://`
(so HTTP previews and localhost keep working under `NODE_ENV=production`).

**v2.17 note — the app's own redirects are origin-agnostic.** The guest
bootstrap's 303 carries a RELATIVE `Location` header, so the visitor's
browser resolves it against whichever origin it is actually browsing; a
proxy that mangles the `Host` header (e.g. nginx's default
`proxy_set_header Host $proxy_host` → `localhost:3000`) can no longer bounce
the public site onto the origin box's localhost. Forwarding `Host` is still
recommended — it keeps request-derived URLs and logs correct — but the
login-free first visit no longer depends on it.

**v2.18 note — deep links survive the login-free first visit.** Every
authenticated page gates session-less visitors through the bootstrap WITH
the page's own path as `?next=` (`requireUser("/own-path")` —
`src/lib/page-gate.ts`), so a first-time visitor opening a shared
`/place/<slug>` or `/eat` link lands back ON that page (not the home
default). Sign-out is a FULL navigation by design: the App Router's
client-side soft navigation cannot follow the bootstrap's 307→303 redirect
chain (it renders an empty shell), so ProfileView navigates
`window.location.assign("/")` — no reverse-proxy or app configuration is
needed.

## 3. Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | SQLite connection string. See §4. |
| `AUTH_SECRET` | **Yes in production** | HMAC secret for session cookies. Generate with `openssl rand -hex 32`. An insecure dev constant is used when unset — never ship that. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical public origin — load-bearing: `src/lib/auth.ts`'s `cookieSecureFlag()` sets the session cookie's `Secure` flag only for `https://` origins (HTTP previews and localhost keep working under production mode). Set to the deployed URL in production; keep `http://localhost:3000` for local dev. |

## 4. Database location (§4 — the `.env.example` reference)

`DATABASE_URL` accepts three forms:

1. **Relative `file:` URL (the default, zero-config local story).**
   ```
   DATABASE_URL="file:../db/custom.db"
   ```
   Relative URLs resolve against the **`prisma/` directory that owns
   `schema.prisma`** — exactly like the Prisma CLI — so this string points
   at `<repo>/db/custom.db` for `prisma db push`, `prisma/seed.ts`,
   `next build` and the running server alike, regardless of the process
   working directory. The resolution rule lives in
   `src/lib/db-path.ts` and is pinned by `tests/db-path.test.ts`.

2. **Absolute `file:` URL (recommended for production).**
   ```
   DATABASE_URL="file:/var/lib/roam/custom.db"
   ```
   Absolute paths pass through untouched — immune to any working-directory
   ambiguity across service managers, containers, or cron wrappers. Point
   them at a persisted volume and back the file up.

3. **PostgreSQL.** Switch `provider = "postgresql"` in
   `prisma/schema.prisma`, set a `postgresql://` URL, then
   `npm run db:push && npm run db:seed`.

Initialize (or reset) the database with:

```bash
npm run db:push        # apply schema (db push — no migrations folder)
npm run db:seed        # idempotent demo guide (wipes domain tables)
```

`db/*.db` is gitignored; every fresh clone recreates it from the two
commands above.

## 5. Updating

```bash
git pull
npm install
npx prisma generate    # after schema changes
npm run db:push
npm run build
# restart the server process
```

## 6. Verification checklist

```bash
curl -s https://your-host/api/health          # {"ok":true,"data":{"status":"healthy"}}
npm run lint && npm run typecheck && npm run test
./scripts/smoke-test.sh                       # 31 smoke checks (local)
npm run test:e2e                              # Playwright suite (local)
```

## 7. Common production issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| First visit redirects to `https://localhost:3000` | Reverse proxy forwarded `Host: localhost:3000`, so the (pre-v2.17) guest bootstrap built its 303 `Location` from the wrong request origin | Fixed since v2.17 — the 303 `Location` is relative (origin-agnostic). Also set `proxy_set_header Host $host;` (nginx) so request-derived URLs/logs are correct |
| `Error code 14: Unable to open the database file` | Server started from a directory that has no `prisma/schema.prisma` and no absolute `DATABASE_URL` | Start via `npm run start`, or set an absolute `file:` URL (§4) |
| Logins loop back to `/login` | `AUTH_SECRET` changed between restarts | Keep the secret stable across restarts |
| Rate-limited logins (429) | 10 attempts/IP/15 min sliding window | Wait for `Retry-After`, or restart to clear the in-memory buckets (single-node) |
