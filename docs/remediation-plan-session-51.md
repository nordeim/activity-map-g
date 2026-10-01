# Session 51 — Remediation Plan (login-stay + anonymous-identity parity + document titles, v2.21)

Date: 2026-10-01 · Agent: coding specialist (session 51)

## 1. Context

Workspace refreshed from `https://github.com/nordeim/activity-map-g.git` at `96880e8`
(main = the v2.20 tree `50be2d7` + the operator's `docs/session_51.md` +
`docs/start_server_log.txt` refresh — the mirror redeployed from the v2.20 tree
2026-10-01 10:22 +0800). Every root doc re-read (AGENTS.md, CLAUDE.md, README.md,
the PAD v2.20, activity-map_SKILL.md v1.22.6) plus the session history
(`docs/session_50.md`, `docs/remediation-plan-session-50.md`, `docs/session_51.md`
(the raw session-50 narrative), `docs/start_server_log.txt`, the repo worklog).
The audited range `66c50de..a358ffb` (v2.18, re-audited per the task) verified
sound. Skills consulted from the repo's `skills/skills-catalog.md`: `agent-browser`
(the dual-site audit driver), `clone-app-pat-pro` (computed-style ground truth),
`tdd` (the RED→GREEN loop), `nextjs16-tailwind4` (the mobile-nav failure
taxonomy), `code-review-checklist` (the range audit). The `skills/` folder stays
excluded from code checking, testing, and compilation (tsconfig + ESLint already
exclude it). The `scandihaven` repo was reviewed for tech-stack patterns (its
Turborepo/PNPM/Drizzle reference — activity-map-g keeps its own single-app
npm/Prisma architecture; the same Next 16 + Tailwind v4 CSS-first + Vitest +
Playwright conventions).

Baseline gates on the untouched tree (all green before any edit):
lint ✓ (0 errors, the 2 pre-existing `scripts/inspect-live-nav.js` warnings) ·
typecheck ✓ · **87/87 unit** ✓ · build ✓ (22 routes) · **31/31 smoke** ✓ ·
**84/84 E2E** ✓. Environment: `.env` from `.env.example` with
`DATABASE_URL="file:../db/custom.db"` (the `db/` folder at the repo root,
118784-byte seeded `db/custom.db` — the exact documented size; the npm scripts
pin the URL inline; `src/lib/db-path.ts` resolves it — no code changes needed,
the v2.13/v2.15 pinning is intact).

## 2. Audit results (dual-site browser: the deployed mirror vs the live source)

| Surface | Result |
|---------|--------|
| Mirror deployment state (v2.20) | The redeployed mirror IS running v2.20: the profile renders h1 "sepnetflix2023" (72px) + the email subtitle + the "S" desktop avatar; guest surfaces render "Guest" + "guest@roam.local" + the "G" initial. |
| Mobile navigation menu (the task's focus) | Mirror at 390×844: the 52px border-box cream-glass tab-bar (bg rgba(248,247,244,0.62) + blur(24px) saturate(1.5) + the 1px border-b), text links x=121/192/222/259, right-cluster icons x=304/330/356 @18px stroke 2. IDENTICAL on the live source. FUNCTIONAL end-to-end: tapping Eat→/eat (aria-current follows), the Map icon→/map, the Heart→/favourites, the Profile icon→/profile. **The mobile menu works exactly as expected — NO Tailwind v4 regression** (all five failure-class pins green in the 84/84 baseline run). |
| Desktop nav (1280) | Both sites: pill links 433/559/639/727/805 + heart 957 + profile 1001 + home h1 115.2px @y=319/290 — IDENTICAL. The right cluster: the heart on the 36px `rgba(14,14,14,0.07)` disc with the 17px stroke-2 glyph — IDENTICAL. |
| Footer / browses / detail / login card | Grown pill (r34, pad 12/16, 92×92 r-24 links), Eat/Stay/Do chip sets, place detail (82px h1 + ~1150×460 + the 7-field form), login card (slate-900 #0F172A Sign-in 48px, 54px Google, 448px r-16 card) — all IDENTICAL. |
| Mirror console/errors | Zero console errors and zero page errors across /, /eat, /stay, /do, /map, /favourites, /profile, /place/*, /login. |
| **The live's auth model changed upstream** | **The live went OPEN**: anonymous visitors now browse every page (home/eat/stay/do/map/place deep links all render with cleared cookies — no login wall), and the anonymous state renders its OWN identity surfaces: the profile h1 "Explorer" + the STATIC "Your Roam account" 16px subtitle, and the desktop navbar avatar as the white 17px stroke-2 lucide-user glyph on the black 36×36 disc. The live's anonymous state is read-only (a heart tap does NOT persist; the favourites page stays empty). The mirror's guest-bootstrap model still achieves the same user-visible outcome (content + deep links on the first visit) — validated, no structural change required. |

## 3. Findings

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| F1 | **Med** | **/login authenticated-visit redirect drift.** The live's /login renders the login form for EVERYONE — signed-in demo (measured: path stays /login, "Welcome to Activity Map" + 2 inputs) and anonymous alike. The mirror 307s any session holder (guest or demo) off /login back to / (pinned by `tests/e2e/auth.spec.ts:137` "authenticated visits redirect /login back to the guide"). | Live `/login` DOM while signed in: path=/login, heading "Welcome to Activity Map", inputs=2. Mirror: path=/ after goto /login. `src/app/login/page.tsx:9` |
| F2 | **Med** | **Guest/anonymous identity-surface drift.** The live's anonymous state (what the mirror's guest maps to — every fresh visitor) renders profile h1 **"Explorer"** + the STATIC **"Your Roam account"** subtitle + the white 17px stroke-2 lucide-user avatar glyph. The mirror's guest renders h1 "Guest" + "guest@roam.local" + the "G" email-derived initial. (The AUTHENTICATED contracts stay exact: demo h1 "sepnetflix2023" + email subtitle + "S" initial — verified on both sites today.) | Live `/profile` (cleared cookies): h1 "Explorer" 72px + "Your Roam account"; live desktop avatar: 36×36 black disc + white 17×17 strokeWidth-2 lucide-user svg, text "". Mirror guest: h1 "Guest" + "guest@roam.local" + avatar "G". `prisma/seed.ts:132`, `src/lib/guest.ts:34`, `src/components/profile/ProfileView.tsx:145`, `src/components/layout/Navbar.tsx:253` |
| F3 | **Low** | **Document-title format drift.** The live's tab titles: home/login "Activity Map"; eat/stay/do/map/profile/favourites/place "Eat \| Activity Map", "Stay \| Activity Map", "Do \| Activity Map", "Discover \| Activity Map", "Profile \| Activity Map", "Favourites \| Activity Map", "Place Page \| Activity Map" (the live does NOT put the place name in the title). The mirror renders "ROAM — Augsburg City Guide", "Sign in · ROAM", "Eat Well Tonight · ROAM", "Stay In Style · ROAM", "Explore The City · ROAM", "Map · ROAM", … (the legal pages already match: "Privacy Policy \| Activity Map"). | `document.title` measured on both sites, 10 routes each. `src/app/layout.tsx:5-8`, the pages' metadata exports |
| F4 | **Info** | The live's anonymous favourites are read-only (heart taps do not persist) while the mirror's guest account persists favourites/bookings — the documented deliberate clone divergence (a BETTER anonymous UX). Keep. | Live heart tap as anonymous → favourites page still empty; mirror round-trips. |

## 4. Remediation (TDD — RED first, then GREEN)

### R0 — RED: the failing pins before any code changes
1. `tests/e2e/guest.spec.ts`: flip the guest-identity pins — `/api/auth/me`
   `name` "Guest" → "Explorer" (line 31); the profile heading "Guest" →
   "Explorer" (line 36); the profile subtitle "guest@roam.local" →
   "Your Roam account" (line 41).
2. `tests/e2e/auth.spec.ts:137`: flip "authenticated visits redirect /login back
   to the guide" → "authenticated visits STAY on /login" (the form renders; URL
   stays /login; the heading is visible).
3. NEW `tests/identity.test.ts` (the pure seam's unit checks — see R1):
   `isGuestEmail`, `profileSubtitle` (guest → "Your Roam account"; demo → the
   email), `avatarIsIcon` (guest → true; demo → false), and the exported
   `GUEST_NAME` = "Explorer" pin.
4. Title pins: extend `tests/e2e/auth.spec.ts` (login title "Activity Map") and
   the browse/home spec title assertions to the live's measured strings
   ("Activity Map", "Eat | Activity Map", …). RED against the current tree.

### R1 — GREEN (F2, part 1): the identity seam + the seed
1. NEW `src/lib/identity.ts` (pure, client-safe — no node: imports; the Navbar
   and ProfileView are client components): exports `GUEST_EMAIL`,
   `GUEST_NAME = "Explorer"`, `ANON_PROFILE_SUBTITLE = "Your Roam account"`,
   `isGuestEmail(email)`, `profileSubtitle(email)`, `avatarIsIcon(email)`.
2. `src/lib/guest.ts`: re-export `GUEST_EMAIL`/`GUEST_NAME` from the seam
   (single source of truth; `ensureGuestUser` picks up the new name for
   un-seeded legacy DBs).
3. `prisma/seed.ts`: the guest row's name from the constant ("Explorer").
4. `tests/guest.test.ts:70`: the GUEST_NAME pin flips to "Explorer".

### R2 — GREEN (F2, part 2): the surfaces
1. `src/components/profile/ProfileView.tsx:145`: the subtitle renders
   `profileSubtitle(user.email)` — the guest gets the static anonymous line,
   the demo account keeps its email (unchanged for the demo path).
2. `src/components/layout/Navbar.tsx`: the desktop avatar branches through
   `avatarIsIcon(userEmail)` — the guest renders the white 17px stroke-2
   lucide-user glyph (the session-48 icon contract, restored for the guest
   only); the demo keeps the email-derived initial. The mobile tab-bar user
   icon is untouched (18px stroke-2 for everyone).

### R3 — GREEN (F1 + F3): the login route + the titles
1. `src/app/login/page.tsx`: remove the authenticated redirect (the
   `getSessionUser` + `redirect("/")` block) — /login renders the form for
   everyone, exactly as the live does. The page's metadata becomes
   `{ title: { absolute: "Activity Map" } }`.
2. `src/app/layout.tsx`: the metadata title becomes
   `{ default: "Activity Map", template: "%s | Activity Map" }`.
3. The category pages (`eat`/`stay`/`do`): `metadata.title` from the SHORT
   label ("Eat"/"Stay"/"Do") — the template appends "| Activity Map".
4. `map/page.tsx`: title "Discover". `place/[slug]/page.tsx`:
   `generateMetadata` returns the static "Place Page" (the live never puts the
   place name in the tab). `favourites`/`profile` keep their short labels (the
   new template handles the suffix).

### R4 — reseed + dev-server verification
`npm run db:seed` (the guest row's new name), then dev-server DOM probes: the
guest profile h1/subtitle, the guest desktop avatar (svg 17px stroke 2, no
letter), the demo path unchanged (login → "S" + email), /login stays for the
authenticated demo session, the titles on 10 routes.

### R5 — screenshots + docs
Re-capture the 16 screenshots on the remediated tree (new
`scripts/capture-screens-session51.mjs` following the session-50 pattern — the
guest profile capture now documents "Explorer" + "Your Roam account"; the login
capture documents the stay behavior). Docs aligned: AGENTS.md, CLAUDE.md,
README.md, the PAD v2.21 revision block, activity-map_SKILL.md v1.22.7, the
findings addendum, `docs/session_52.md` (this session's log), this plan, the
repo worklog.

### R6 — the final full gate ×2
`npm run lint` → `npm run typecheck` → `npm run test` (87+NEW unit) →
`npm run build` → `./scripts/smoke-test.sh` (31) → `npm run test:e2e` (84, the
flipped pins) — then the SSH-wrapper push to `main` (the wrapper runbook,
`docs/how-to-git-push-using-ssh-wrapper_SKILL.md`), and the operator key
shredded post-push.

## 5. Guardrails

- `skills/` excluded from lint/typecheck/compile/test (already configured).
- `main` only — no new branches; Conventional Commit
  (`fix(identity): align the login-stay + anonymous-identity + title contracts (v2.21)`).
- Never commit `.env`, `db/*.db`, key material.
- The demo account's contracts (h1 "sepnetflix2023" + email subtitle + "S"
  initial + the 433/559/639/727/805 nav) are pinned by the existing specs and
  must stay green — this remediation only touches the GUEST-side surfaces and
  the /login redirect.
