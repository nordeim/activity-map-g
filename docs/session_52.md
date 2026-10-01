# Session 52 — Audit of the v2.20 range + the live's OPEN transition: login-stay, anonymous identity, and title parity (v2.21)

Date: 2026-10-01 · Agent: coding specialist (session 52 in the repo's own numbering; the operator's `docs/session_51.md` is the raw narrative of the previous session) · Plan: `docs/remediation-plan-session-51.md`

## What this session was asked to do

Refresh the workspace from `https://github.com/nordeim/activity-map-g.git`, internalize the
root docs + the session history (`docs/session_50.md`,
`docs/remediation-plan-session-50.md`, `docs/session_51.md`,
`docs/start_server_log.txt`), audit and validate the recent changes in git commit
`66c50de..a358ffb` (the v2.18 deep-link work, re-audited per the task), iterate toward
parity with `https://activity-map.base44.app/` (logging into the live with the demo
account), run browser-based E2E against the deployed mirror
(`https://activity-map.jesspete.shop/`) — paying particular attention to the mobile
navigation menu and possible Tailwind v4 bugs — then remediate (TDD), re-capture
screenshots, align the docs, and push to `main` via the SSH wrapper. The `skills/`
folder stays excluded from code checking, testing, and compilation. The `scandihaven`
repo reviewed for tech-stack patterns (its Turborepo/PNPM/Drizzle reference — this repo
keeps its own single-app npm/Prisma architecture; same Next 16 + Tailwind v4 CSS-first +
Vitest/Playwright conventions).

## 1. Understanding + baseline (tree at 96880e8 = the v2.20 tree + the operator's log commit)

Every root doc re-read (AGENTS, CLAUDE, README, the PAD v2.20, the SKILL v1.22.6) plus
the session history and the fresh `docs/start_server_log.txt` (the operator redeployed
the mirror from the v2.20 tree 2026-10-01 10:22 +0800: install → db:push → db:seed →
build → start). Skills consulted from the repo's own `skills/skills-catalog.md`:
`agent-browser` (the dual-site audit driver), `clone-app-pat-pro` (computed-style ground
truth), `tdd` (the RED→GREEN loop), `nextjs16-tailwind4` (the mobile-nav failure
taxonomy), `code-review-checklist` (the range audit).

The audited range `66c50de..a358ffb` re-reviewed: `src/lib/page-gate.ts`
(`requireUser(next)` → 307 through the bootstrap with the page's own path), the pure
`guestBootstrapUrl` seam, the 8 wired pages, the chrome-only layouts — sound, exactly as
sessions 46/48/50 documented.

Environment: `.env` from `.env.example` (`DATABASE_URL="file:../db/custom.db"`, the
`db/` folder at the repo root — the seeded 118784-byte `db/custom.db`, the exact
documented size; the npm scripts pin the URL inline; no code changes needed — the v2.13
pinning is intact). Vitest + Playwright configs verified in place.

Baseline gates on the untouched tree: lint ✓ (0 errors, the 2 pre-existing script
warnings) · typecheck ✓ · **87/87 unit** ✓ · build ✓ (22 routes) · **31/31 smoke** ✓ ·
**84/84 E2E** ✓.

## 2. The audit (dual-site browser: the redeployed mirror vs the live source)

- **The mirror (redeployed, v2.20 live)**: the demo identity (h1 "sepnetflix2023" +
  the email subtitle + the "S" desktop avatar), the guest surfaces ("Guest" +
  "guest@roam.local" + the "G" initial), zero console/page errors across 9 pages at
  390 and 1280.
- **The mobile navigation menu (the task's focus)**: geometry EXACT at 390 on BOTH
  sites (text links x=121/192/222/259, icons x=304/330/356 @18px stroke 2, the 52px
  border-box cream-glass bar `rgba(248,247,244,0.62)` + `blur(24px) saturate(1.5)`),
  and FUNCTIONAL end-to-end on the mirror: tapping Eat→/eat (aria-current follows),
  the Map icon→/map, the Heart→/favourites, the Profile icon→/profile. **The mobile
  menu works exactly as expected — NO Tailwind v4 regression** (all five failure-class
  pins green in the 84/84 baseline).
- **Every parity surface EXACT on both sites**: the desktop nav (pill links
  433/559/639/727/805 + heart 957 + profile 1001 + the home h1 115.2px @y=319), the
  right cluster (the heart on the 36px `rgba(14,14,14,0.07)` disc, 17px stroke-2), the
  grown footer (r34, pad 12/16, 92×92 r-24 links), the Eat/Stay/Do chip sets, the place
  detail (82px h1 + ~1150×460 + the 7-field form), the login card (slate-900 #0F172A
  Sign-in 48px), the map stats.
- **The live's auth model changed upstream — it went OPEN**: anonymous visitors
  (cleared cookies) now browse every page (home/eat/stay/do/map/place deep links all
  render — the login wall is gone). The live's ANONYMOUS state renders its own identity
  surfaces: the profile h1 "Explorer" + the STATIC "Your Roam account" 16px subtitle
  (no address), and the desktop navbar avatar as the white 17px stroke-2 lucide-user
  glyph on the black disc. The live's anonymous state is READ-ONLY (a heart tap does
  not persist; the favourites page stays empty) — the mirror's guest account keeps
  working favourites/bookings (the documented deliberate divergence). The live's
  sign-out lands on `/` with content (the mirror's re-bootstrap achieves the same).
- **Three gaps found** (F1 /login authenticated-visit redirect — the live stays, the
  mirror bounced; F2 the guest identity surface — the live's anonymous "Explorer" +
  "Your Roam account" + the user-icon avatar vs the mirror's "Guest" +
  "guest@roam.local" + "G"; F3 the document titles — the live's "Activity Map" /
  "<Short> | Activity Map" format vs the mirror's "ROAM — Augsburg City Guide" /
  "X · ROAM", incl. the map's "Discover" and the detail's static "Place Page").

## 3. The remediation (TDD — `docs/remediation-plan-session-51.md`, R0–R6)

- **R0 (RED)**: the guest.spec pins flipped (name "Explorer", the profile heading +
  the static subtitle + the guest-email count-0), the auth.spec login pin flipped to
  the STAY contract, the new `tests/identity.test.ts` (5 checks), the new
  `tests/e2e/titles.spec.ts` (8 checks).
- **R1–R2 (GREEN, F2)**: the new CLIENT-SAFE identity seam `src/lib/identity.ts`
  (GUEST_EMAIL / GUEST_NAME "Explorer" / ANON_PROFILE_SUBTITLE "Your Roam account" /
  `isGuestEmail` / `profileSubtitle` / `avatarIsIcon` — pure, zero imports, so the
  client Navbar/ProfileView never drag node:crypto into the bundle); `guest.ts`
  re-exports the constants (single source of truth); the seed's guest name; the
  ProfileView subtitle routes through `profileSubtitle`; the Navbar's desktop avatar
  branches through `avatarIsIcon` (the guest renders the white 17px stroke-2
  lucide-user glyph; the demo keeps the "S" initial; the mobile tab-bar icon
  unchanged).
- **R3 (GREEN, F1 + F3)**: the authenticated redirect removed from
  `src/app/login/page.tsx` (the form renders for everyone — the live's contract); the
  layout's title template `%s | Activity Map` with the default "Activity Map"; the
  category pages' SHORT labels; the map's "Discover"; the detail's static "Place
  Page"; the login page's absolute "Activity Map".
- **R4**: reseeded; dev-server DOM probes verified — the guest profile ("Explorer" +
  "Your Roam account", the email nowhere visible), the guest avatar (17px stroke-2
  user icon, no letter), the demo path unchanged ("S" + email + "sepnetflix2023"),
  the /login-stay behavior (authenticated demo stays on /login with the form), and
  the 11-route title sweep matching the live exactly.
- **R5**: 17 screenshots re-captured via `scripts/capture-screens-session51.mjs` (the
  new 17-guest-profile-desktop.png documents the anonymous identity); the docs
  aligned — AGENTS, CLAUDE, README (the session-51 history row), the PAD v2.21
  (revision block, §3.2 tree, §6.2 utilities, §7.1/§7.3 counts, §12 glossary), the
  SKILL v1.22.7, the findings v2.21 addendum, this session log, the plan, the repo
  worklog.
- **R6 final gate**: lint ✓ (0 errors, the 2 pre-existing warnings) · typecheck ✓ ·
  **92/92 unit** ✓ · build ✓ · **31/31 smoke** ✓ · **92/92 E2E** ✓ — pushed via
  `docs/ssh_git_wrapper_v3.py` to `git@github.com:nordeim/activity-map-g.git` (main
  only, the operator key materialized outside the repo + fingerprint-verified +
  shredded post-push).

## 4. What to re-measure next session

- The AUTHENTICATED identity (the demo account's name field) — it has oscillated four
  times (Explorer→sepnetflix2023→Explorer→sepnetflix2023 across sessions 12/14/48/50).
- The ANONYMOUS identity ("Explorer" + "Your Roam account" + the user icon) — first
  pinned v2.21; treat as the reference until it drifts.
- The live's open-browsing model — if the live ever re-walls, the mirror's guest
  bootstrap still renders content (the divergence becomes invisible either way).
