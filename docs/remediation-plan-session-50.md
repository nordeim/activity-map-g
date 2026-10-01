# Session 50 — Remediation Plan (identity/avatar live-drift re-alignment + nav icon-stroke parity, v2.20)

Date: 2026-10-01 · Agent: coding specialist (session 50)

## 1. Context

Workspace refreshed from `https://github.com/nordeim/activity-map-g.git` at `585fb4c`
(main = the v2.19 tree `26984e5` + the operator's session-49 raw-log/server-log commit).
Every root doc re-read (AGENTS.md, CLAUDE.md, README.md, the PAD v2.19,
activity-map_SKILL.md v1.22.5) plus the session history (`docs/session_48.md`,
`docs/remediation-plan-session-48.md`, the worklog Tasks 40/42, `docs/session_49.md`
(the operator's raw narrative of the v2.19 session), `docs/start_server_log.txt` — the
operator REDEPLOYED the mirror from the v2.19 tree before this session: fresh
install → db:push → db:seed → build → start, 2026-10-01 09:33 +0800, the seed logging
the demo user + guest user + 42/27/9 place rows). Skills consulted from the repo's own
`skills/skills-catalog.md`: `agent-browser` (the dual-site audit driver),
`clone-app-pat-pro` (computed-style ground truth), `tdd` (the RED→GREEN loop),
`nextjs16-tailwind4` (§9/§10 — the mobile-nav failure taxonomy + the visual-debugging
decision tree), `code-review-checklist` (the range audit). The `skills/` folder stays
excluded from code checking, testing, and compilation (tsconfig + ESLint already
exclude it).

The audited range — `66c50de..a358ffb` (the v2.18 page-gate work, re-audited per the
task) — was re-reviewed: `src/lib/page-gate.ts` (`requireUser(next)` → 307 through the
bootstrap with the page's own path), the pure `guestBootstrapUrl` seam in
`src/lib/guest.ts`, the 8 wired pages (`/`, `/eat`, `/stay`, `/do`, `/map`,
`/favourites`, `/place/[slug]`, `/profile`), the chrome-only `(app)`/`(bare)`
layouts, and the smoke 14/14b + unit/E2E pins — all present and sound, exactly as
session 48 documented.

Baseline gates on the untouched tree (all green before any edit):
lint ✓ (0 errors, the 2 pre-existing `scripts/inspect-live-nav.js` warnings) ·
typecheck ✓ · **83/83 unit** ✓ · build ✓ (22 routes) · **31/31 smoke** ✓ ·
**84/84 E2E** ✓ — the tree is IDENTICAL to the one session 48 pushed and verified.

## 2. Audit results (dual-site browser: the redeployed mirror vs the live source)

| Surface | Result |
|---------|--------|
| Mirror deployment state (v2.19) | The redeployed mirror IS running v2.19: the desktop avatar renders the 36×36 black disc with ONE 17×17 strokeWidth-2 white lucide-user svg; the profile renders h1 "Explorer" (72px) + the static "Your Roam account" subtitle; a LIVE same-day booking (Courtyard Stay, today 19:00, POSTed via /api/bookings) lands under **"Upcoming (1)" / "Past (0)"** — the calendar-day classification working in production. |
| Mobile navigation menu (the task's focus) | Mirror at 390×844: the 52px border-box cream-glass tab-bar (bg rgba(248,247,244,0.62) + blur(24px) saturate(1.5) + the 1px border-b), text links x=121/192/222/259, right-cluster icons x=304/330/356 @18px, wordmark span 62px. IDENTICAL on the live source. FUNCTIONAL end-to-end: tapping Eat→/eat, Stay→/stay, the Map icon→/map, the Heart icon→/favourites, the Profile icon→/profile, with the aria-current active state following. **The mobile menu works exactly as expected — NO Tailwind v4 regression** (all five failure-class pins green in the 84/84 run). |
| Desktop nav (1280) | Both sites: pill links 433/559/639/727/805 + heart 957 + profile 1001 + home h1 115.2px @y=290/291 — IDENTICAL. |
| Footer (1280, grown) | Both sites: the 646×118 glass pill (blur(40px) saturate(1.5)), 92×92 links, footer element pad 64/20/56 — IDENTICAL. |
| Eat browse | Both sites: h1 "Eat Well Tonight" 55px + the identical chip set (Open now / Near me / Under €100 / Trending / Outdoor / Romantic / French / Japanese / Bavarian / Mediterranean / Vegan) — IDENTICAL. |
| Place detail | Both sites: h1 82px + the ~1150×460 hero + the same 7-field booking form — IDENTICAL (mirror hero 1152 vs live 1150 — viewport rounding, pinned by E2E). |
| Favourites | Both sites: identical first-100-char text ("Favourites / All saved… / No favourites yet / Tap a he…") — IDENTICAL. |
| Mirror console/errors | Zero console errors and zero page errors across /, /eat, /stay, /do, /map, /favourites, /profile, /place/*, /login (swept at 390). |
| **Live source identity surface** | **DRIFTED AGAIN (the third oscillation)**: the live's profile renders h1 **"sepnetflix2023"** (72px) with the **email** "sepnetflix2023@outlook.com" as the 16px subtitle (the session-14 contract is BACK — the account name field was renamed upstream again, and the static "Your Roam account" line is gone); the chips still read Augsburg / 0 day streak / **Explorer** (unchanged); the desktop navbar avatar is the **email-derived "S" initial** (14px/700 white Inter on the 36×36 black disc) — NOT the lucide-user icon session 48 measured. |
| **Nav icon strokes** | The live's tab-bar icons render stroke-width **2** (MapPin/Heart/User, all 18px, raw attribute "2"); the desktop heart disc renders a **17px** stroke-2 heart. The mirror renders 1.5/1.8/1.5 mobile + an 18px/1.8 desktop heart. |

## 3. Findings

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| F1 | **Med** | **Profile h1 identity drift.** The live's profile h1 reads "sepnetflix2023" (the account was renamed upstream — the identity surface has now oscillated Explorer→sepnetflix2023→Explorer→sepnetflix2023 across sessions 12/14/48/now). The mirror renders the seeded name "Explorer". | Live `/profile` DOM: h1 "sepnetflix2023" 72px; mirror: h1 "Explorer"; `prisma/seed.ts:116` |
| F2 | **Med** | **Profile subtitle drift.** The live renders the account EMAIL as the 16px #555550 line ("sepnetflix2023@outlook.com"); the mirror renders the static "Your Roam account" (the v2.19 re-alignment is stale). | Live `/profile`: the h1's next line is the email; mirror: "Your Roam account" |
| F3 | **Med** | **Desktop navbar avatar drift.** The live's black 36×36 disc carries the white **"S" initial** (14px/700, Inter — the email-derived letter); the mirror renders the 17×17 stroke-2 lucide-user icon (v2.19's account-agnostic chrome). The MOBILE tab-bar keeps the user icon on both sites — only the desktop disc differs. | Live header: `<button aria-label="Profile"><span class="font-bold text-white" style="font-size:14px">S</span></button>`; mirror: the User-svg contract |
| F4 | **Low** | **Nav icon stroke-family drift.** The live's mobile tab-bar icons all render stroke-width 2 (MapPin/Heart/User @18px) and the desktop heart disc renders 17px/stroke-2; the mirror renders 1.5 (MapPin), 1.8 (Heart, 18px at desktop too), 1.5 (User). | Live computed strokes 2/2/2 + heart svg 17px; mirror 1.5/1.8/1.5 + 18px |
| F5 | Info | Non-gaps re-verified: every §2 parity surface (mobile nav geometry + function, desktop nav, footer, chips, detail, favourites, hero), the v2.18 deep-link contract (verified live by session 48, pinned by E2E), the v2.19 calendar-day booking classification (verified live this session — Upcoming (1)), `.env` untracked with `DATABASE_URL="file:../db/custom.db"` + the repo-root `db/` (118784 bytes), `.env.example` complete, vitest + playwright configs intact, smoke 31/31, zero console errors. | §2 audit table |

## 4. Plan (TDD)

| # | Task | Files | Verification |
|---|------|-------|--------------|
| R0 | **RED** — (a) `tests/e2e/browse.spec.ts`: the profile identity pins flip to the live's current contract (h1 "sepnetflix2023" @72px; the email as the visible 16px subtitle; the email-count-0 assertion inverted; both h1Box probes renamed; the chip pin stays "Explorer" — the live's chip is unchanged). (b) `tests/e2e/guest.spec.ts`: the guest profile subtitle flips from the static "Your Roam account" to the guest email "guest@roam.local" (the subtitle is the account's email line, guest included). (c) `tests/e2e/mobile-navigation.spec.ts`: the desktop avatar pin flips from the icon contract (empty text + one 17×17 lucide-user) to the initial contract (text "S" + ZERO svgs + the black 36×36 disc). (d) NEW `tests/initials.test.ts`: pins the `initials()` seam in `src/lib/utils.ts` (the email-derived avatar letter — "sepnetflix2023@outlook.com" → "S", "guest@roam.local" → "G", whitespace/empty → "?") | the 4 spec/seam files | the identity/avatar E2E edits fail against the current tree (RED documented); the initials seam pins green (existing behavior — the seam documents the contract) |
| R1 | **GREEN (F1 + F2)** — `prisma/seed.ts`: the demo user seeds as `name: "sepnetflix2023"` (the live's current h1 value); `ProfileView`: the subtitle renders `{user.email}` (the live's current 16px #555550 line — dynamic, not static); the component's contract comments updated | `prisma/seed.ts`, `src/components/profile/ProfileView.tsx` | the browse + guest identity pins green; a dev-server profile shows "sepnetflix2023" + the email line |
| R2 | **GREEN (F3)** — the Navbar's desktop avatar renders the email-derived INITIAL: the 36×36 black disc carrying the white 14px/700 Inter letter (the `initials()` seam); the lucide-user icon becomes the MOBILE tab-bar glyph only (`md:hidden`); the `(app)` layout passes the session email again (`userEmail` — the prop v2.19 retired, re-introduced); the `(app)` layout's comment updated | `src/components/layout/Navbar.tsx`, `src/app/(app)/layout.tsx` | the mobile-nav avatar pin green (text "S", 0 svgs, black disc); a dev-server probe shows the "S" letter at 1280 |
| R3 | **GREEN (F4)** — the nav icon strokes align to the live: MapPin/Heart/User mobile icons → `strokeWidth={2}` (18px); the desktop heart disc → a 17px stroke-2 heart (`h-[18px] w-[18px] md:h-[17px] md:w-[17px]`) | `src/components/layout/Navbar.tsx` | a dev-server computed-style probe: 2/2/2 mobile + the 17px desktop heart |
| R4 | Re-seed the local `db/custom.db` (the new demo name) → dev-server verify (the profile identity + the avatar + the booking tabs) → re-capture the 16 screenshots on the remediated tree (`scripts/capture-screens-session50.mjs` — the session-48 login-first pattern + the same-day reservation before the profile capture) | `docs/screenshots/*.png`, `scripts/capture-screens-session50.mjs` | 16 healthy captures; the profile capture shows "sepnetflix2023" + the email subtitle; the navbar capture shows the "S" disc |
| R5 | Docs alignment: AGENTS.md (the identity/avatar facts, the seed name, the icon-stroke facts), CLAUDE.md (the same), README (the profile/avatar feature rows + the screenshots narrative + the session-50 history row), the PAD v2.20 (revision block + the amended §6.2/§7 facts), activity-map_SKILL.md v1.22.6 (project_state + the identity row), `docs/findings_to_validate_and_update.md` (v2.20 addendum), the worklog, `docs/session_50.md`, this plan's execution record | the docs | every doc claim matches the tree |
| R6 | Final gate ×2 on the push tree: lint → typecheck → unit (83) → build → smoke ×2 → E2E ×2, then the single conventional commit + the SSH-wrapper push to main | — | all gates green ×2; push verified; key shredded |

Non-gaps (keep, verified unchanged): every §2 parity surface, the deep-link contract,
the calendar-day booking classification (verified live), the DB pinning + the repo-root
`db/` story, `.env` untracked, `.env.example` (already complete and committed), the
vitest/playwright config structure, the mobile-nav failure-class pins, the smoke
13b–14b checks, the npm-audit-0 state.

## 5. Design rationale

- **Why re-align to "sepnetflix2023" + email + the "S" initial**: parity is measured
  against the live's CURRENT state (the ANALYZE principle — re-measure, never
  assume). The identity surface has oscillated upstream (sessions 12/14/48/now), and
  today's live truth is the session-14 contract: h1 = the account name (now the email
  prefix), subtitle = the account email, avatar = the email-derived initial. The
  seed, the ProfileView subtitle, and the Navbar avatar all follow.
- **Why the subtitle is the account EMAIL (dynamic)**: the live renders the
  authenticated account's email there; the clone's ProfileView already receives
  `{name, email}` — rendering `{user.email}` matches per-account, not per-hardcode.
  The guest profile correspondingly shows "guest@roam.local".
- **Why re-introduce the `userEmail` prop on Navbar**: the desktop disc's letter is
  derived from the session email; the (app) layout already resolves the session, so
  passing the email is the minimal wiring (the v2.19 "account-agnostic" retirement
  was correct for THAT live state — the live has since reverted to the initial).
- **Why stroke-2 icons**: the live's raw attributes render stroke-width 2 on all
  three tab-bar icons (and the desktop heart is 17px, not 18px). The 1.5/1.8 values
  were earlier measurements; today's live says 2/2/2 — match it.
- **Why keep the chip as the hardcoded "Explorer"**: the live's third chip STILL
  reads "Explorer" (measured this session) even though the h1 changed — the chip is
  a static badge upstream, and the mirror's hardcoded chip already matches. No edit.
- **Why pin `initials()` in a unit file**: the avatar derivation is a pure display
  seam (the repo's convention); `tests/initials.test.ts` documents the
  session-50 contract (the E2E avatar pin carries the chrome, the unit carries the
  letter-derivation rule).

## 6. Execution record

- **R0 (RED, documented)**: the three E2E specs flipped (browse identity →
  "sepnetflix2023" + the email subtitle; guest subtitle → "guest@roam.local";
  the desktop avatar pin → the "S"-initial contract) — RED against the v2.19 tree
  (the mirror's current render fails each). `tests/initials.test.ts` created (4
  checks, green on arrival — the seam pins existing behavior).
- **R1 (GREEN, F1+F2)**: seed name "sepnetflix2023"; ProfileView subtitle →
  `{user.email}`; comments updated.
- **R2 (GREEN, F3)**: Navbar avatar → the email-derived initial (14px/700 white on
  the 36×36 disc, `md:hidden` icon); the (app) layout passes `userEmail`.
- **R3 (GREEN, F4)**: MapPin/Heart/User → strokeWidth 2; the desktop heart →
  17px/2.
- **R4**: reseed + dev-server verification + 16 screenshots re-captured.
- **R5**: 10+ docs aligned (PAD v2.20, SKILL v1.22.6, AGENTS, CLAUDE, README,
  findings addendum, the worklog, the session log, this record).
- **R6 (final gate, push tree)**: lint ✓ · typecheck ✓ · 83/83 unit ✓ · build ✓ ·
  31/31 smoke ✓ (×2) · 84/84 E2E ✓ (×2) — single conventional commit + the
  SSH-wrapper push to `main`.
