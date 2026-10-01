# Worklog — activity-map (ROAM) sessions

---
Task ID: 34
Agent: coding specialist
Task: Session 34 — clone into the npm/Next.js sandbox, pin SQLite at db/custom.db, fix HTTP production cookies, add Vitest/Playwright configs, capture screenshots, align docs.

Work Log:
- Cloned nordeim/activity-map; overlaid the app onto the sandbox (Prisma/SQLite, Tailwind v4, App Router).
- DATABASE_URL="file:../db/custom.db" with db/custom.db at the repo root; runtimeDatabaseUrl() pins SQLite even if a workspace injects Postgres.
- cookieSecureFlag() keeps the session cookie off Secure on HTTP origins so `next start` previews can log in.
- npm scripts: test (vitest), test:e2e (playwright + next start :3100), db:push/seed/generate.
- TDD: 48 unit tests green (db-path, filters, planner, auth). Health probes Prisma `SELECT 1`.
- Dropped Bun standalone; next.config uses serverExternalPackages for Prisma.
- Captured session34-* screenshots (desktop home/eat/map, mobile home/eat-nav, login) from production next start.
- Mobile nav verified: one-line 390px tab-bar, Eat active-state, no overlap (Tailwind v4 failure classes A–E still pinned).

Stage Summary:
- App runs on npm + Next.js 16.2.6 + Prisma 6.19.3 + SQLite. Demo login sepnetflix2023@outlook.com / $Abcd1234.

---
Task ID: 2
Agent: Super Z (main agent)
Task: Session 2 — refresh workspace, validate session-1 state, achieve parity with the redesigned live app, remediate, re-document, and push.

Work Log:
- Re-cloned `nordeim/activity-map` (workspace had been reset); reviewed AGENTS.md, CLAUDE.md, README.md, Project_Architecture_Document.md, docs/session_1.md, docs/prompt-to-review.md; confirmed session-1 app build was already pushed (commits af2e16b, bc1c7cb).
- Fresh-environment validation: `bun install` → `db:push`/`db:seed` → full gate (lint ✓, typecheck ✓, 32 unit ✓, build ✓, 27 smoke ✓, 27 E2E ✓). All green.
- Found + fixed env hijack: sandbox shell exports an absolute `DATABASE_URL` and a parent `.env` exists — `db:push`/`db:seed` wrote `<workspace>/db/custom.db`. Pinned `DATABASE_URL=file:../db/custom.db` inline in both scripts (dev/start already pinned); neutralized the stray parent `.env`.
- Live-app parity re-measurement (logged in with demo account): discovered the reference app was REDESIGNED after session 1 — Libre Baskerville display serif + Poppins nav font, image logo, traveller-photo hero with frosted glass planner pill (no subtitle), Recommended Route itinerary (5 timed stops), blue (#4D61FF) Highlighted Restaurants band (16-restaurant strip + featured Volta card), Choose Your Vibe stay showcase (12 cards), Highlighted Sights (6 cards), footer with legal links. Entity data/images unchanged (12/12/18).
- Wrote docs/remediation-plan.md (gap analysis G1–G10, decisions D1–D5, TDD-ordered ToDo) and validated it against the codebase before executing.
- TDD execution: RED tests/e2e/home.spec.ts (8 parity checks) → implemented: fonts (Libre Baskerville + Poppins in layout/globals `@theme`), Navbar image logo with two-span crop + Poppins, Hero rewrite (glass pill planner, 2×2 at 390px), prisma/data/home.json + seed extension (27 `status:"home"` rows), new components (RecommendedRoute, HighlightedRestaurants, StayShowcase, HighlightedSights, SiteFooter, LegalPage), public /privacy + /accessibility routes, `listHomePlaces()` in lib/places.ts.
- Fixed regressions found by the specs: mobile-nav class-D overlap after the logo swap (wordmark span capped at 52px + 12px link gaps), footer landmark (moved to sibling of <main>), CDN `load`-event flakes (waitUntil domcontentloaded), strict-mode locator ambiguities, browse-purity pins (12/12/18).
- Final gates: lint ✓, typecheck ✓, 32 unit ✓, 27 smoke ✓, 35 E2E ✓ (27 original + 8 new).
- Captured 14 fresh dev-server screenshots into docs/screenshots/ (incl. 4 new home-section captures).
- Updated README.md, AGENTS.md, CLAUDE.md, Project_Architecture_Document.md for alignment (fonts, sections, seed, counts, tokens, known issues).
- Created activity-map_SKILL.md (856 lines, 20 sections + 4 appendices) following skills/distill-codebase-skill + skills/to-distill-project-into-skill; verified: 16/16 file paths exist, all hex tokens match globals.css, versions match `bun pm ls`, no placeholders, TOC complete.

Stage Summary:
- Deliverables: parity-remediated app (12 client components, 69 seeded places = 42 published + 27 home-only), 35-check E2E suite, docs/remediation-plan.md, 14 screenshots, updated 4 root docs, activity-map_SKILL.md.
- Key decisions: `status:"home"` rows for home-only content (no schema change); local hero/logo assets; D1–D5 in docs/remediation-plan.md.
- Ready: local commit on main + SSH-wrapper push with the provided ed25519 key.

---
Task ID: 2 (final)
Agent: Super Z (main agent)
Task: Commit + SSH-wrapper push of the session-2 remediation.

Work Log:
- Local commit 3247ae7 on main (42 files, +2453/−172): app remediation, E2E suite, screenshots, docs, activity-map_SKILL.md.
- SSH push infrastructure: installed paramiko 5.0.0, deployed the Appendix-A paramiko ssh shim to /home/z/my-project/bin/ssh (outside the repo), wrote the operator key to /tmp with 0600, verified fingerprint SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g.
- Dry-run: fast-forward 9106717..3247ae7 confirmed.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: landed, remote-verified (refs/heads/main @ 3247ae7 == local HEAD), tracking ref synced.
- Both key copies shredded (wrapper temp + operator file).

Stage Summary:
- main fully in sync with origin at 3247ae7; working tree clean; no branches created; no secrets on disk.

---
Task ID: 3
Agent: Super Z (main agent)
Task: Session 3 — re-measure the evolved live app, remediate the clone to parity (WS1–WS8), pass the full gate, refresh screenshots/docs, commit + push.

Work Log:
- Workspace refreshed to a604a36; all 6 docs reviewed; codebase + env traps validated (parent .env neutralized; shell DATABASE_URL pinned inline by scripts); DB verified (42 published + 27 home-only + 1 demo user).
- Live app re-measured at 1280/768/390: 14 parity findings recorded in docs/remediation-plan-session-3.md (palette #F8F7F4/#0E0E0E/#571AFF + line/border/muted tokens; Poppins removed (nav Inter); navbar redesigned to flat white h-14 desktop bar + cream-glass fixed-top mobile tab-bar; TripPlanner became a real control with react-day-picker-style range popover routing to /eat|/stay|/do?people&start_date&end_date; browse pages carry a sticky white planner pill pre-filled from params; cards redesigned — overlaid names, tags, violet Learn More, ACTIVE+DIMMED € symbols, dark aspect-square stay cards; sticky scroll Recommended Route with progress pill; booking-request form; map = 9 hardcoded demo places; profile redesigned).
- Implemented WS1–WS8: globals.css tokens + font links; Navbar two-mode chrome; TripPlanner + DateRangePicker components + src/lib/planner.ts pure helpers (10 Vitest checks); glass CategoryCards + black VIEW ALL + Altstadt/Fun subtitle fixes; sticky-scroll RecommendedRoute; PlaceCard/StayCard redesigns; detail page + Booking schema extension (name/surname/time/phone/email/message) + bookings API; prisma/data/map.json + listMapPlaces + map page stats/notice; ProfileView redesign.
- E2E root causes diagnosed and fixed (6 classes): HighlightedRestaurants bare `grid` → 2416px implicit track → fixed navbar dragged off-screen at mobile emulation (→ grid-cols-1); Navbar `<nav aria-label="Primary">` now wraps wordmark + links + right icons; Tailwind v4 `text-[#0e0e0e]/40` compiles to color-mix() not rgba() → explicit rgba classes; TripPlanner label-wrapping-select getByLabel double-match → div wrapper; BookingForm "Name*" accessible name → aria-label on input; profile `.or()` strict-mode conflict → `.first()`.
- This continuation session: diagnosed stale session cookie after session-3 reseed (stateless HMAC cookie carried the OLD user cuid → FK violation 500 on favourites POST) → re-login via UI form; save-favourite flow verified end-to-end.
- Screenshots v2: agent-browser element-scoped captures produce BLANK images → replaced with one full-page capture + PIL cropping by DOM-harvested section rects (scripts/capture-screens-v2.sh + crop-sections.py); all 14 captures validated (variance check, none blank).
- Docs aligned for session 3: README.md (features/architecture/tokens/seed/testing/status), AGENTS.md (gate 42 unit, seed +9 map rows, 16 client components, planner routing bullet, navbar two-mode bullet), CLAUDE.md (same), Project_Architecture_Document.md (ADR-006/007, directory tree, schema ERD + Booking fields, persistence, typography, color tokens, test distribution 42/35/27, key-files line counts, v1.2 revision entry), activity-map_SKILL.md (v1.2.0 frontmatter, tokens block, 16-component table, map.json row, B4 fix current-state + grid-blowout variant, L1/L4/L5 lessons, breakpoints, color reference, ADR-9/10, session-3 audit row, quick-reference card).
- .env.example verified identical to .env.
- Full gate re-run on the exact push tree: lint ✓ · typecheck ✓ · 42 unit ✓ · build ✓ · 27 smoke ✓ · 35 E2E ✓.

Stage Summary:
- Deliverables: session-3 parity remediation (16 client components, 78 seeded places = 42 published + 27 home-only + 9 map-demo), planner seam + tests, remediation plan, 14 fresh screenshots, 5 aligned docs.
- Ready: local commit on main + SSH-wrapper push with the provided ed25519 key.

---
Task ID: 3 (final)
Agent: Super Z (main agent)
Task: Session 3 finalization — commit + push status.

Work Log:
- Commit 853414b on main (57 files, +2585/−1104): WS1–WS8 remediation, 6 E2E root-cause fixes, planner seam + tests, remediation plan, 14 refreshed screenshots, 5 aligned docs. Working tree clean; no secrets in tree (verified).
- Full gate re-run on the exact commit: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27 smoke ✓ 35 E2E ✓.
- Push infrastructure verified ready: paramiko 5.0.0 present, /home/z/my-project/bin/ssh shim alive, GitHub reachable (remote HEAD a604a36 → fast-forward to 853414b pending).
- Push NOT executed: the ed25519 deploy key is not present in this environment (session 2 shredded both copies per protocol; the key was not re-provided in this continuation session's context). The wrapper supports --key-file / --key-stdin / SSH_KEY env — any of these once the operator re-supplies the key.

Stage Summary:
- main is 1 commit ahead of origin (853414b), tree clean, all gates green. Single remaining step: re-provide the deploy key, then `python3 docs/ssh_git_wrapper_v3.py --key-file <key> --remote git@github.com:nordeim/activity-map.git`.

---
Task ID: 4
Agent: Super Z (main agent)
Task: Session 4 — recover the interrupted hand-off (owner commits dropped three load-bearing files), re-verify live-app parity, re-gate, refresh screenshots, align docs, commit + push.

Work Log:
- Re-cloned fresh (main @ bfb14b5); reviewed all 6 root docs + session_2/session_3 logs + skills catalog; validated the codebase against the docs.
- Root cause of the "interrupted" state: owner commits 22342d5/d6c64b3 re-pushed session-3 work but deleted src/app/(app)/layout.tsx (auth gate + Navbar), src/app/(app)/page.tsx (home), and src/app/api/auth/login/route.ts (login API — survived only as a byte-identical orphan at /api/auth). Evidence: / → 404, /eat → 500 (null-user), POST /api/auth/login → 404, build has no / route.
- Wrote docs/remediation-plan-session-4.md (findings F1–F7, plan R1–R9) and validated it against the codebase before executing.
- Env traps (parent .env + shell DATABASE_URL) neutralized; db/ recreated at repo root and seeded (42+27+9+user); .env/.env.example already correct (DATABASE_URL="file:../db/custom.db").
- R1: git mv api/auth/route.ts → api/auth/login/route.ts (login at documented path). R2/R3: restored (app)/layout.tsx + (app)/page.tsx from 22342d5. R4 no-op: suspected grid-cols-inmax typo proved to be bash display-mangling of [minmax (hex-dump verified both files canonical; session-3 "false alarm" note was right).
- Gates after restoration: lint ✓ typecheck ✓ (cleared stale .next/types validators) 42 unit ✓ build ✓ 27/27 smoke ✓ 35/35 E2E ✓ (incl. all 8 mobile-nav Tailwind v4 failure-class checks).
- Live app re-measured (logged in, 390px audit): still session-3 chrome — matches the clone exactly (right-cluster icons at x=304/330/356, active 700/ink, Inter, scrollWidth=390).
- 14 screenshots refreshed via scripts/capture-screens-v3.sh + crop-sections-v3.py (favourite saved first for 07); all variance-validated non-blank; VLM visual checks clean.
- Docs: README session-4 status row, docs/session_4.md, remediation plan, this worklog. .env.example verified matching codebase usage.
- Commit on main + push via docs/ssh_git_wrapper_v3.py with the re-provided ed25519 key (see final entry).

Stage Summary:
- The interrupted-session state is fully recovered: app, tests, docs all back to the session-3 documented architecture, all gates green, parity re-verified against the live reference.

---
Task ID: 4 (final)
Agent: Super Z (main agent)
Task: Session 4 finalization — commit + push.

Work Log:
- Commit 4133e37 on main (14 files, +342): restored (app) layout + home page + /api/auth/login (orphan /api/auth removed via git mv), session-4 docs (remediation plan + session log), README status row, worklog, capture scripts v3, 5 refreshed screenshots. Tree clean; secret scan clean.
- Full gate re-run on the exact commit: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27 smoke ✓ 35 E2E ✓.
- Push infrastructure: paramiko 5.0.0 installed, Appendix-A paramiko ssh shim deployed at /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches the session-2 record).
- Dry-run: fast-forward bfb14b5..4133e37 confirmed.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: landed; remote verified refs/heads/main @ 4133e37 == local HEAD; tracking ref synced.
- Operator key shredded (random overwrite + delete); wrapper temp key shredded by the wrapper itself.

Stage Summary:
- main fully in sync with origin at 4133e37; working tree clean; no branches created; no key material on disk.

---
Task ID: 6
Agent: Super Z (main agent)
Task: Session 6 — re-measure the redesigned live app, remediate the clone to parity, pass the full gate, refresh screenshots, align docs, commit + push.

Work Log:
- Workspace refreshed to 04fd822 (fast-forward; added the owner's docs/session_5.md narration of the session-4 continuation). All 6 root docs + session_4/remediation-plan-session-4/worklog/session_5 reviewed; scandihaven patterns confirmed same stack.
- Baseline validation: lint ✓ typecheck ✓ 42 unit ✓; dev probes healthy; db/ at repo root (42+27+9 places + demo user); .env/.env.example already correct (DATABASE_URL="file:../db/custom.db").
- Live re-measure (logged in; DOM audits at 1280/768/390 + strip sequences + VLM): 14 findings — desktop floating-pill navbar (max-w 820/radius 999/13px links/active 700/#555550), mobile 12px nav links, white hero planner card below md (radius 30, gray field pills, 1fr-76px grid), violet mobile VIEW ALL, desktop route = pinned card-swap + photo cards + black Learn More + inline meta, restaurants = desktop canvas-style carousel + mobile sticky 16-card deck, square stay/sight cards with overlaid white Inter 18px titles, icon-cell footer pill on ALL pages, 50.7px mobile h1 scale, profile h1 = username, live login chrome. Wrote docs/remediation-plan-session-6.md and validated it before executing.
- TDD execution (specs updated first, then implementations): Navbar pill + 12/13px links; TripPlanner white mobile card; CategoryCards violet mobile VIEW ALL; RecommendedRoute photo cards + 340vh pinned swap; HighlightedRestaurants carousel + deck; StayShowcase reusing square StayCard (home meta); HighlightedSights hanging-panel square cards; SiteFooter icon-cell pill moved to the (app) layout; typography scale; LoginForm live chrome (hosted flows answer with inline notices).
- En-route fixes: hero h1 container was max-w-3xl and clipped the nowrap wordmark (live spans ~1232px) — widened; sights card link lost its accessible name via link→article nesting — restructured to article→Link (StayCard pattern); SaveButton moved to a sibling of the deck card link.
- E2E spec updates: desktop pill + mobile 12px + planner card + violet VIEW ALL + route swap + carousel watermark/detail + mobile deck (16 cards) + footer on 7 pages + profile h1 = username + login chrome. Tailwind v4 gotchas solved in specs: rounded-full ≈ 3.35e7px (numeric assertions), bg-white/95 arrives as oklab() (assert the rgba shadow), stale :3100 server reuse trap.
- Full gate on the exact push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 45/45 E2E ✓.
- 14 screenshots refreshed (capture-screens-v3 + crop-sections-v3; variance-validated; VLM spot-checks clean).
- Docs aligned: README (features/status/testing), AGENTS (gate 45, navbar bullet, footer bullet, stale-server lesson, computed-style gotchas), CLAUDE (same), PAD (v1.3 revision), activity-map_SKILL (project_state), docs/session_6.md, worklog.

Stage Summary:
- Deliverables: session-6 parity remediation (floating-pill navbar, white planner card, violet VIEW ALL, pinned route swap, restaurants carousel/deck, square stay/sight cards, footer everywhere, typography scale, login chrome), 45-check E2E suite, remediation plan, 14 screenshots, 6 aligned docs.
- Key decisions: DOM-transform carousel instead of the live's canvas (maintainable parity); the live's "API KEY REQUIRED" watermark is deliberately not cloned; browse pages keep the clone's planner/explorer split (functionally equivalent).
- Ready: local commit on main + SSH-wrapper push with the provided ed25519 key.

---
Task ID: 6 (final)
Agent: Super Z (main agent)
Task: Session 6 finalization — commit + push.

Work Log:
- Commit c176d84 on main (42 files, +1086/−462): the session-6 parity remediation (Navbar pill, TripPlanner card, CategoryCards violet VIEW ALL, RecommendedRoute photo cards + pinned swap, HighlightedRestaurants carousel + deck, StayShowcase/HighlightedSights square cards, SiteFooter icon-cell pill on all pages, typography scale, LoginForm chrome), 10 new E2E checks, remediation plan + session log, 14 refreshed screenshots, 6 aligned docs. Working tree clean; secret scan clean (one variable-reference false positive).
- Full gate re-run on the exact commit: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27 smoke ✓ 45 E2E ✓.
- Push infrastructure: paramiko 5.0.0 present, /home/z/my-project/bin/ssh shim alive, operator key materialized at /home/z/.ssh-tmp (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches the session-2/4 records).
- Dry-run: fast-forward 04fd822..c176d84 confirmed.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: landed; remote verified refs/heads/main @ c176d84 == local HEAD; tracking ref synced.
- Operator key shredded (random overwrite + delete); wrapper temp key shredded by the wrapper itself.

Stage Summary:
- main fully in sync with origin at c176d84; working tree clean; no branches created; no key material on disk.

---
Task ID: 8
Agent: Super Z (main agent)
Task: Session 8 — re-measure the evolved live app, remediate the clone to parity, pass the full gate, refresh screenshots, align docs, commit + push.

Work Log:
- Workspace refreshed to fa8666e (fast-forward; added the owner's docs/session_7.md narration of the session-6 process). All 6 root docs + session_6/remediation-plan-session-6/worklog/session_7 reviewed; scandihaven patterns confirmed same stack.
- Baseline validation: lint ✓ typecheck ✓ 42 unit ✓; dev probes healthy; db/ at repo root (42+27+9 places + demo user); .env/.env.example already correct (DATABASE_URL="file:../db/custom.db"); vitest + playwright configs functional (45 checks).
- Live re-measure (logged in; DOM audits at 1280/768/390 + scroll sweeps + VLM): 13 findings — the route stop cards became TEXT-ONLY (zero img in the section; white time pill + dark serif 44/48px title + white info card + black Learn More; 576px cards pinning early across a ~3750px trap), the mobile restaurant deck reduced 16→6 (desktop carousel still 16 in a 4140px trap), the Choose Your Vibe heading gained a per-letter cream→ink scroll reveal, stay/sight mobile titles 24px, More Things to Do inverted to a dark pill, the browses adopted ONE unified planner container (card below md, sticky pill from md, inline search + labelled fields + icon actions, no type field), the detail rating pill moved onto the hero photo (no Map button; About 34px; photo 260px mob), eat/do photos 300px mob, profile chrome (back control, email-only line, dark Saved-places button, icon chips), and the map chrome (cream search pill + violet icon cell, 44px violet-tinted pills with icons, circular zoom, bottom stats). Wrote docs/remediation-plan-session-8.md and validated it before executing.
- TDD execution (specs updated first, then implementations): RecommendedRoute text cards + early pin + 420vh trap; HighlightedRestaurants 6-card mobile deck + 460vh desktop trap; new LetterReveal client component (64 spans, scroll-mapped fill, SSR/reduced-motion solid ink); StayCard/HighlightedSights 24px mobile titles; dark More-Things pill; new BrowsePlanner (unified browse planner with auto-forward params, replacing the search row + TripPlanner on browses); place-detail rating pill + 34px About + 260px photo; PlaceCard 300px mobile photos; ProfileView back/email/saved/icons; MapExplorer chrome + circular Leaflet zoom via globals.css; showcase containers tightened to ~1144px.
- En-route fixes: the Learn More pill spec initially asserted the card LINK (white) — re-pinned to the pill element ([data-learn-more]); LetterReveal's setState moved into the rAF callback (react-hooks/set-state-in-effect).
- Full gate on the exact push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 52/52 E2E ✓ (45 prior + 7 new session-8 checks). The Turbopack db-path tracing warning is the known pre-existing one.
- 14 screenshots refreshed (capture-screens-v3 + crop-sections-v3, default browser session logged in + favourite saved for 07; the first pass used the unauthenticated session and was re-run); variance-validated; VLM spot-checks clean.
- Docs aligned: README (features/design/status), AGENTS (gate counts 42/52/27 + session-8 facts + 18 client components), CLAUDE (same), PAD (v1.4 revision), activity-map_SKILL (project_state), docs/session_8.md, this worklog. .env.example verified matching the codebase.

Stage Summary:
- Deliverables: session-8 evolution parity remediation (text route cards, 6-card deck, letter reveal, unified browse planner, detail/profile/map chrome), 52-check E2E suite, remediation plan, 14 screenshots, 7 aligned docs.
- Key decisions: the date/people browse fields AUTO-FORWARD (no explicit submit, matching the natural live behavior); the desktop carousel keeps the DOM-transform deviation; numbered route waypoints kept (minor enhancement over the live's plain circles).
- Ready: local commit on main + SSH-wrapper push with the provided ed25519 key.

---
Task ID: 8 (final)
Agent: Super Z (main agent)
Task: Session 8 finalization — commit + push.

Work Log:
- Commit 2c28628 on main (35 files, +999/−279): the session-8 evolution parity remediation (text route cards + early pin, six-card mobile deck + 460vh carousel, LetterReveal, 24px mobile titles, dark More-Things pill, BrowsePlanner, detail rating pill/About/photo, 300px mobile photos, profile chrome, map chrome), 7 new E2E checks (52 total), remediation plan + session log, 14 refreshed screenshots, 7 aligned docs. Working tree clean; secret scan clean (the three hits are the pre-existing runbook/wrapper docs).
- Full gate re-run on the exact commit: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 52/52 E2E ✓.
- Push infrastructure: paramiko 5.0.0 present, /home/z/my-project/bin/ssh shim alive, operator key materialized at /home/z/.ssh-tmp (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches the session-2/4/6 records).
- Dry-run: fast-forward fa8666e..2c28628 confirmed.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: landed; remote verified refs/heads/main @ 2c28628 == local HEAD; tracking ref synced.
- Operator key shredded (random overwrite + delete); wrapper temp key shredded by the wrapper itself.

Stage Summary:
- main fully in sync with origin at 2c28628; working tree clean; no branches created; no key material on disk.

---
Task ID: 10
Agent: Super Z (main agent)
Task: Session 10 — deep re-measure the live app, remediate the residual gaps to parity, pass the full gate, refresh screenshots, align docs, commit + push.

Work Log:
- Workspace re-cloned (reset environment) to 219c927 (main; the owner's `update session logs` commit adding docs/session_9.md). All 6 root docs + session_8/remediation-plan-session-8/worklog/session_9 reviewed; scandihaven patterns confirmed same stack.
- Baseline validation: bun install → prisma generate → db:push/db:seed → lint ✓ typecheck ✓ 42 unit ✓; dev probes healthy; db/ at repo root (42+27+9 places + demo user); .env/.env.example already correct (DATABASE_URL="file:../db/custom.db").
- Live re-measure (logged in; DOM audits at 1280/768/390 + scroll sweeps + VLM): every session-8 surface re-verified UNCHANGED (navbar, route text cards, 6-card deck, letter reveal, browses, mobile detail, map, profile). The deep audit of summary-verified surfaces found 9 residual gaps — category-card internals (28×28 glass icon cells, 12px/500 two-line rows, full-width 54px View All) + the mobile horizontal snap carousel (306px cards, scrollWidth 978), hero geometry (591/938px photo behind the transparent header, h1 y=203/290, 126px mobile planner gap), the login page's shadcn chrome (plain page, logo disc, system-font h1, input icons, slate-900 button), favourites grid + 48px h1, the detail page's max-w-6xl rounded-36 border-less card + 420px-md tier, the profile Saved button count, the 36px heart, and h3 route stops. Wrote docs/remediation-plan-session-10.md and validated it against the components before executing.
- TDD execution (specs updated first, then implementations): CategoryCards rewrite (live internals + the snap carousel); Hero re-geometry (591/900/938px, -mt-[73px] under the header, pt 203/290, 126px mobile gap, cards flush via -mt-[261px]); LoginForm + login page redesign (shadcn chrome, login-logo.png downloaded from the live CDN, new font-system @utility — the live's login uses the platform stack, not Inter); FavouritesView de-gridded (55px h1, Inter empty state); detail page max-w-6xl rounded-36 (photo tiers 260/420/460); ProfileView heart button; SaveButton 44px; route stops h2.
- En-route fixes: three spec locators (the View All full-width padding allowance, the #category-cards mobile-carousel scoping, the h2 route-swap selector); a login-h1 font assertion corrected to the system stack; the favourites h1 pinned at the declared 55px (desktop viewport — the reference's 50.7px mobile reading is Chromium text-size-adjustment noise, documented).
- Full gate on the exact push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 54/54 E2E ✓ (52 prior + 2 new session-10 checks). The Turbopack db-path tracing warning is the known pre-existing one.
- 14 screenshots refreshed (capture-screens-v3 + crop-sections-v3; dev server restarted to clear the rate limiter the audit logins had engaged; default browser session logged in + favourite saved for 07); variance-validated; VLM spot-checks clean; final VLM verdict on the desktop home: "visually equivalent".
- Docs aligned: README (features/design/status/testing), AGENTS (gate 54 + session-10 facts), CLAUDE (same), PAD (v1.5 revision), activity-map_SKILL (project_state v1.3.0), docs/session_10.md, this worklog. .env.example verified matching the codebase.

Stage Summary:
- Deliverables: session-10 residual-gap parity remediation (category-card internals + snap carousel, measured hero geometry, shadcn login chrome, de-gridded favourites, wide detail card, profile/heart/h2 polish), 54-check E2E suite, remediation plan, 14 screenshots, 7 aligned docs.
- Key decisions: the login card uses the platform system font (the live's own choice — Inter would not wrap the heading like the reference); the category-card mobile carousel is real overflow scroll with snap (tap/keyboard navigable), not transforms; the favourites h1 pins the live's DECLARED 55px (the 50.7px mobile reading is environment noise).
- Ready: local commit on main + SSH-wrapper push with the provided ed25519 key.

---
Task ID: 10 (final)
Agent: Super Z (main agent)
Task: Session 10 finalization — commit + push.

Work Log:
- Commit 2ee6e0b on main (35 files, +736/−257): the session-10 residual-gap parity remediation (CategoryCards internals + snap carousel, hero geometry, shadcn login chrome, de-gridded favourites, max-w-6xl detail card, profile heart button, 44px hearts, h2 route stops), 2 new E2E checks (54 total), remediation plan + session log, 14 refreshed screenshots, 7 aligned docs, the new login-logo.png asset. Working tree clean; secret scan clean (the hits are the pre-existing runbook/wrapper docs + the excluded skills/ folder).
- Full gate re-run on the exact commit: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 54/54 E2E ✓.
- Push infrastructure: paramiko 5.0.0 installed (venv), Appendix-A paramiko ssh shim deployed at /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches the session-2/4/6/8 records).
- Dry-run: fast-forward 219c927..2ee6e0b confirmed.
- Real push via docs/ssh_git_wrapper_v3.py --key-file /home/z/.ssh-tmp --remote git@github.com:nordeim/activity-map.git: landed; remote verified refs/heads/main @ 2ee6e0b == local HEAD; tracking ref synced.
- Operator key shredded (random overwrite + delete); wrapper temp key shredded by the wrapper itself.

Stage Summary:
- main fully in sync with origin at 2ee6e0b; working tree clean; no branches created; no key material on disk.

---
Task ID: 12
Agent: Super Z (main agent)
Task: Session 12 — re-measure the evolved live app, remediate the clone to parity, pass the full gate, refresh screenshots, align docs, commit + push.

Work Log:
- Workspace re-cloned (reset environment) to ebef0ce (main; the owner's start-server-log commit). All 6 root docs + session_10/remediation-plan-session-10/worklog/session_11/start_server_log reviewed; scandihaven patterns confirmed same stack.
- Baseline validation: bun install → prisma generate → db:push/db:seed → lint ✓ typecheck ✓ 42 unit ✓ build ✓ 54/54 E2E ✓; dev probes healthy; db/ at repo root (42+27+9 places + demo user); .env/.env.example already correct (DATABASE_URL="file:../db/custom.db", scripts pin it inline); vitest + playwright configs functional.
- Deployment check: https://activity-map.jesspete.shop/ returns HTTP 404 via Cloudflare (origin down) — reported; parity work measured the source app directly.
- Live re-measure (logged in; DOM audits at 1280/768/390 + VLM): all session-8/10 surfaces re-verified UNCHANGED (mobile navbar within 3px, hero geometry, route stops, 6-card deck, sights, category rows, eat grid, login card, favourites h1 — no Tailwind v4 mobile-nav regressions). Found 9 findings: the home stay showcase re-shuffled (F1), the profile redesigned into two glass cards with the NAME h1 "Explorer" 72px (F5), the map chrome widened (full-width 1138 search, 41/12 pills, 620 canvas) (F4), the vibe heading full-width left-aligned with 1178 grid (F2), the favourites 18px grid restored (F6), the white login body (F7), 38/12 browse chips (F8), compacted category cards (F9), deliberate deviations kept (F10). Wrote docs/remediation-plan-session-12.md and validated it against the components before executing.
- TDD execution (specs first, then implementations): HOME_STAY_ORDER in the home page (R1); ProfileView two-glass-card rewrite + seed user "Explorer" + Navbar userEmail prop (R2); MapExplorer full-width search + 41/12 pills + 620 canvas (R3); StayShowcase full-width left heading + 14px #8A8780 subtitle + 1178 grid + 112/144 padding (R4); FavouritesView 18px grid overlay + 14px #3A3A3A subtitle (R5); LoginForm white body via INLINE STYLE — the unlayered globals body rule beats every @layer utility (the session-10 h1 gotcha, second sighting) (R6); 38px/12px chips (R7); compacted 248px category cards (R8).
- En-route fixes: one strict-mode spec locator ("Augsburg" collides with the footer line); a transient HMR desync crashed initials(undefined) mid-development (dev-server restart; code correct); the vibe subtitle live value is #8A8780, not the #888580 token.
- Full gate on the exact push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 54/54 E2E ✓.
- Side-by-side verification: vibe h2 x=24/w=1232 (live 38/1203) + grid 1178 + first card "Courtyard Stay"; map 41/12 pills + 618 canvas; favourites grid present; login body white; VLM verdict on the profile: "visually equivalent".
- 14 screenshots refreshed (capture-screens-v3 + crop-sections-v3, favourite saved for 07); variance-validated.
- Docs aligned: README, AGENTS, CLAUDE, PAD (v1.6), activity-map_SKILL (v1.4.0), docs/session_12.md, this worklog. .env.example verified.

Stage Summary:
- Deliverables: session-12 evolution parity remediation (stay order, two-card profile, widened map chrome, left-aligned vibe heading, restored favourites grid, white login body, compact chips/cards), 54-check E2E suite extended in place, remediation plan, 14 screenshots, 7 aligned docs.
- Key decisions: the live's View All hanging outside the glass card and its clipped eat-card variant are quirks — the clone keeps the VA inside the glass at a compacted height; the avatar initial derives from the EMAIL (live shows "S") while the profile h1 shows the account NAME; the browse planner search-width variance (648-765 across scroll states on both apps) is environment noise, verified equivalent.
- Ready: local commit on main + SSH-wrapper push with the provided ed25519 key.

---
Task ID: 12 (final)
Agent: Super Z (main agent)
Task: Session 12 finalization — commit + push.

Work Log:
- Commit e1660a8 on main (48 files, +560/−137): the session-12 evolution parity remediation (HOME_STAY_ORDER stay showcase, two-glass-card ProfileView, seed user "Explorer" + email-derived avatar initial, widened MapExplorer chrome, left-aligned StayShowcase heading, restored FavouritesView grid, white login body via inline style, 38px chips, compacted category cards), E2E contracts extended in place (54 total), remediation plan + session log, 14 refreshed screenshots, 7 aligned docs, the 15-file live-capture reference set. Working tree clean; secret scan clean (the hits are the pre-existing demo credentials + runbook docs).
- Full gate re-run on the exact commit: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 54/54 E2E ✓.
- Push infrastructure: paramiko 5.0.0 installed (venv), Appendix-A paramiko ssh shim deployed at /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches the session-2/4/6/8/10 records).
- Dry-run: fast-forward ebef0ce..e1660a8 confirmed.
- Real push via docs/ssh_git_wrapper_v3.py --key-file /home/z/.ssh-tmp/op.key --remote git@github.com:nordeim/activity-map.git: landed; remote verified refs/heads/main @ e1660a8 == local HEAD; tracking ref synced.
- Operator key shredded (random overwrite + delete); wrapper temp key shredded by the wrapper itself.

Stage Summary:
- main fully in sync with origin at e1660a8; working tree clean; no branches created; no key material on disk.
- Open item for the owner: the deployed mirror https://activity-map.jesspete.shop/ returns HTTP 404 via Cloudflare (origin unreachable) — the standalone server behind it needs a restart/redeploy on the owner's side.

---
Task ID: 14
Agent: Super Z (main agent)
Task: Session 14 — audit the DEPLOYED mirror via browser E2E, re-measure the live source, remediate the parity gaps, pass the full gate, refresh screenshots, align docs, commit + push.

Work Log:
- Workspace re-cloned (reset environment) to c3bba68 (main; the owner's start-server-log commits — the deployed mirror was rebuilt and restarted). All 6 root docs + session_12/remediation-plan-session-12/worklog/session_13/start_server_log reviewed; scandihaven patterns confirmed same stack; repo skills catalog consulted (agent-browser/tdd/tailwind-patterns).
- Baseline validation: bun install → prisma generate → db:push/db:seed → lint ✓ typecheck ✓ 42 unit ✓ build ✓ 54/54 E2E ✓; db/ at repo root; .env/.env.example correct (DATABASE_URL="file:../db/custom.db", scripts pin it inline); vitest + playwright configs functional.
- Deployment check: https://activity-map.jesspete.shop/ is BACK UP (307 → /login, /api/health 200 — it was Cloudflare-404 down in session 12). First session to run browser E2E against the deployed site: all pages load, no console errors, mobile nav verified end-to-end (52px cream-glass fixed tab-bar, icon x-positions 304/330/356 identical to the live, tap navigation moves the active state, no v4 failure classes, no overflow), desktop pill chrome exact, login flow works, lazy-image "broken" counts proven timing artifacts (CDN 200s).
- Dual-site audit (agent-browser, logged in on both): the live source re-measured at 1280/390 and DOM-diffed against the deployed clone → 11 findings in docs/remediation-plan-session-14.md (F1 profile identity → username+email; F2 column-major stay grid 381px/18px bare-1178; F3 text-only map list cards; F4 browse/map heading geometry px-5/pt-16→md:px-8/md:pt-24 + max-w-7xl + 14px #3A3A3A subtitle; F5 booking form Book-Now-heading/single-col-44px/hairline card/56-44 split; F6 favourites overlay scoped to the heading section; F7 hero px-6; F8 sights 1120px; F9 detail paddings; F10 LIVE-SITE BUG: the hosted app's SavedPlace POST 403s — its favourites save is broken while the clone's is E2E-proven, reported; F11 deliberate deviations kept).
- TDD execution (specs first — RED verified with targeted runs, then GREEN): R1 seed name "sepnetflix2023" + ProfileView email line; R2 StayShowcase column-major grid (grid-rows-4 + grid-flow-col, gap-18, no container padding); R3 MapExplorer #places-list text-only cards; R4 CategoryExplorer/MapExplorer heading blocks; R5 BookingForm rebuild + detail lg:grid-cols-[7fr_5.5fr] + p-6/md:p-10; R6 FavouritesView scoped overlay + section-carried pt; R7 Hero px-6; R8 HighlightedSights max-w-1120; R9 detail main pt-4/md:pt-6.
- En-route fixes: border-black/[0.08] computes as oklab() in v4 — switched to explicit border-[rgba(14,14,14,0.08)] utilities where specs assert computed borders (the α-modifier rule, third sighting); the favourites double-pt (main + section both pt-24) collapsed to section-only; the auth spec's /login gotos moved to domcontentloaded (the CDN load flake, one spurious timeout); a full E2E run crashed the browser targets with several browser daemons + the dev server alive on the 4GB sandbox — closed stray sessions before the re-run (54/54 green).
- Full gate on the exact push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 54/54 E2E ✓.
- Side-by-side verification of every fixed surface against the live's measured values (profile h1 72px + email; stay row1 Courtyard/Maison/Velvet, 381px at x=51; map list 0 imgs/radius 24; browse h1 y=169/x=32, subtitle 14px rgb(58,58,58); form Book Now 18px/44px single-col/hairline/no-shadow, detail h1 y=229; favourites overlay 287/h1 y=245; hero h1 x=24; sights x=80/360px) + VLM spot-checks (profile/stay-row confirmed).
- 14 screenshots refreshed (capture-screens-v3 + crop-sections-v3, favourite saved for 07); variance-validated; the CARTO tile watermarks in 05 proven pre-existing (identical in HEAD's capture).
- Docs aligned: README (features/status row), AGENTS (seed user + session-14 facts + resource/flake lessons), CLAUDE (testing map + demo-user note), PAD (v1.7), activity-map_SKILL (v1.5.0), docs/session_14.md, this worklog. .env.example verified.

Stage Summary:
- Deliverables: session-14 deployed-mirror parity remediation (profile identity, column-major stay grid, text-only map list, browse/map heading geometry, booking-form rebuild, scoped favourites overlay, hero/sights/detail polish), 54-check E2E suite extended in place, remediation plan, 14 screenshots, 7 aligned docs, plus the first deployed-site E2E audit record and the hosted-app SavedPlace-403 bug report.
- Key decisions: the profile h1 follows the live's current rendering (username + email line) via a seed-name change — the internal field-vs-username ambiguity is documented; the live's browse/map heading paddings apply at the page level (px-5/pt-16 → md:px-8/md:pt-24) with the section carrying the favourites variant; the form keeps native labelled inputs (E2E fillable) styled as the live's picker rows.
- Ready: local commit on main + SSH-wrapper push with the provided ed25519 key.

---
Task ID: 14 (final)
Agent: Super Z (main agent)
Task: Session 14 finalization — commit + push.

Work Log:
- Commit 9d42848 on main (32 files, +498/−117): the session-14 deployed-mirror parity remediation (the sepnetflix2023 identity + email line, the column-major stay grid at 381px/18px over the bare 1178 grid, the text-only map list cards, the live-geometry browse/map heading blocks, the rebuilt booking form + 56/44 detail split, the scoped favourites overlay, the px-6 hero content, the 1120px sights grid, the detail paddings), the E2E contracts extended in place (54 total), the auth-spec domcontentloaded hardening, the remediation plan + session log, the 14 refreshed screenshots (01/11/12 byte-identical — those surfaces render identically at the capture viewport), and the 7 aligned docs. Working tree clean; secret scan clean (no key material in tracked files; the .next hits are gitignored build output).
- Full gate re-run on the exact commit: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 54/54 E2E ✓.
- Push infrastructure: paramiko 5.0.0 installed (venv), the Appendix-A paramiko ssh shim deployed at /home/z/my-project/bin/ssh (outside the repo — fixed en route: the shim needed the runbook's user@host split; git passes "git@github.com" as the host and the missing split surfaced as a DNS gaierror), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches the session-2/4/6/8/10/12 records).
- Dry-run: fast-forward c3bba68..9d42848 confirmed.
- Real push via docs/ssh_git_wrapper_v3.py --key-file /home/z/.ssh-tmp/op.key --remote git@github.com:nordeim/activity-map.git: landed; remote verified refs/heads/main @ 9d42848 == local HEAD; tracking ref synced.
- Operator key shredded (random overwrite + delete); wrapper temp key shredded by the wrapper itself.

Stage Summary:
- main fully in sync with origin at 9d42848; working tree clean; no branches created; no key material on disk.
- Open items for the owner: (1) the hosted source app's favourites save is BROKEN — its SavedPlace POST returns HTTP 403 (heart toggles visually, nothing persists; the clone's save is E2E-proven) — likely an entity-permission regression on the base44 platform side; (2) the deployed mirror is now running the session-12 code — a redeploy from main @ 9d42848 will pick up the session-14 parity surfaces.

---
Task ID: 16 (final)
Agent: Super Z (main agent)
Task: Session 16 — dual-site audit → the chrome-less profile + map-list/planner/category parity remediation, full gate, screenshots, docs, commit + push.

Work Log:
- TDD execution (specs first — RED verified with targeted runs: 4 failures as expected, then GREEN): R1 the (bare) route group (auth-gated, NO Navbar/SiteFooter — git mv of the profile page, URL unchanged); R2 the ProfileView restructure (max-w-4xl main with px-5/pb-24/pt-10 → md:px-8/md:pt-16, the full-page fixed 18px grid overlay); R3 the centered-mobile identity + white/80 Go back/Sign out pills + Sun/Heart chip icons; R4 the bookings total count; R5 the FOUR-row map list cards (eyebrow+price justified row, title, neighborhood — h≈117); R6 the mapListEyebrow sub-category uppercase for do-places; R7 map.json reordered to the live's interleaved array; R8 the mobile planner -mx-2 + w-[calc(100%+16px)] + gap-1 (en-route lesson: w-full caps at the parent width — negative margins alone move x without widening); R9 the desktop category rows 46px/9px gaps + 34×35 cells + the hanging 229×54 View All (absolute, DOM child of the article for the ancestor locator) + the mobile radius 24.
- En-route fixes: the map card spacing tuned to the live's gaps (h-26 eyebrow row, mt-3 title, mt-2 neighborhood) after the first GREEN run measured 100px; the category h2 leading-5→md:leading-8 after the card measured 211px; the mobile category rows made responsive (the live's mobile keeps the 36px/28×28 internals — only desktop grew) after the mobile card measured 271 vs the live's 227.
- Full gate on the exact push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 56/56 E2E ✓.
- Side-by-side verification of every fixed surface against the live's measured values (profile h1 y=201/165 vs live 203/167, no nav/footer at both geometries, the fixed 18px grid, the map first card 395×117 "HOTEL | €€€€ | Brass & Marble | Innenstadt", the eyebrows in the live's exact sequence, the planner 358@x=16, the hanging VA, rows 46, cells 34×35, the mobile card 306×230 r24) + VLM spot-checks (profile layout matches; the mobile planner fits well).
- 14 screenshots refreshed (reseed → re-login → favourite saved for 07 → capture-screens-v3 + crop-sections-v3); variance-validated. Discovered en route: the smoke test's booking round-trip writes into the dev db/custom.db (pre-existing) — cleared by the reseed before the captures.
- Docs aligned: README (features/status/testing 56), AGENTS (the (bare) group + the profile/map facts + gate 56), CLAUDE (testing map + the bare-group architecture bullet), PAD (v1.8 revision), activity-map_SKILL (v1.6.0), docs/session_16.md, docs/remediation-plan-session-16.md, this worklog. .env.example verified + DEBUG_DBPATH documented.

Stage Summary:
- Deliverables: the session-16 parity remediation (the chrome-less profile page in the (bare) group with the full-page grid overlay + live geometry + identity/icons, the four-row map list cards with sub-category eyebrows in the live's interleaved order, the 358px mobile planner, the re-measured category cards with the hanging View All), the E2E suite extended in place (56 total), the remediation plan + session log, 14 refreshed screenshots, 8 aligned docs.
- Key decisions: the profile's chrome-less contract is implemented as a second auth-gated route group (never weakening the (app) gate); the hanging View All stays a DOM child of the glass card (absolute positioning) so the specs' ancestor locators keep working; the mobile category internals stay at the session-10 measurements (the live only grew the desktop rows); the smoke test's dev-DB booking is documented rather than "fixed" (pre-existing, isolated).
- Ready: local commit on main + SSH-wrapper push with the provided ed25519 key.

---
Task ID: 16 (push verification)
Agent: Super Z (main agent)
Task: Session 16 finalization — commit + push status.

Work Log:
- Commit 7907027 on main (25 files, +685/−175): the session-16 parity remediation (the chrome-less profile in the (bare) route group with the full-page fixed grid overlay + live geometry + centered-mobile identity + sun/heart chip icons + the Go back/Sign out white/80 pills + the bookings total count; the four-row map list cards with the neighborhood line + sub-category eyebrows + the live's interleaved map.json order; the 358px mobile planner at x=16 with the 4px gap; the re-measured category cards — desktop 46px rows + 34×35 cells + the hanging 229×54 View All, mobile radius 24), the E2E contracts extended in place (56 total: +2 profile-chrome checks, +1 profile identity/alignment check, −1 footer-on-profile check), the remediation plan + session log, 6 refreshed screenshots (01/05/08/09/11/14 — the other 8 surfaces render byte-identical), and the 8 aligned docs (README/AGENTS/CLAUDE/PAD v1.8/SKILL v1.6.0/session_16/worklog/.env.example+DEBUG_DBPATH).
- Full gate re-run on the exact commit: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 56/56 E2E ✓.
- Push infrastructure: paramiko 5.0.0 installed (venv at /home/z/my-project/.venv-push), the Appendix-A paramiko ssh shim deployed at /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches the session-2/4/6/8/10/12/14 records).
- Dry-run: fast-forward e2742df..7907027 confirmed.
- Real push via docs/ssh_git_wrapper_v3.py --key-file /home/z/.ssh-tmp/op.key --remote git@github.com:nordeim/activity-map.git: landed; remote verified refs/heads/main @ 7907027 == local HEAD; tracking ref synced.
- Operator key shredded (random overwrite + delete); wrapper temp key shredded by the wrapper itself.

Stage Summary:
- main fully in sync with origin at 7907027; working tree clean; no branches created; no key material on disk.
- Open item for the owner: the deployed mirror runs the session-14 code — a redeploy from main @ 7907027 will pick up the session-16 surfaces (the chrome-less profile, the four-row map list, the widened mobile planner, the re-measured category cards).

---
Task ID: 18
Agent: Super Z (main agent)
Task: Session 18 — dual-site audit → the heading-grid texture + place-detail split + mobile-route visual parity, full gate, screenshots, docs, commit + push.

Work Log:
- Workspace re-cloned (reset environment) to 9927947 (main; the owner's update-session-log commit added docs/session_17.md — the previous agent's narration — and the start-server-log showing the deployed mirror rebuilt WITH the session-16 code). All 6 root docs + session_16/remediation-plan-session-16/worklog/session_17/start_server_log reviewed; scandihaven patterns confirmed same stack; repo skills catalog consulted (agent-browser/tdd/tailwind-patterns).
- Baseline validation: bun install → prisma generate → db:push/db:seed (the stray parent .env hijack neutralized first — the documented session-2 trap, present again in the fresh sandbox) → lint ✓ typecheck ✓ 42 unit ✓ build ✓ 56/56 E2E ✓ 27/27 smoke ✓; db/ at repo root; .env/.env.example correct; vitest + playwright configs functional.
- Deployment check: https://activity-map.jesspete.shop/ is UP running the session-16 code (the chrome-less profile h1 y=201 + the four-row map list 395×117 + the 358px planner verified live). Full browser audit: all pages load with zero console errors; the mobile navbar works end-to-end (icons 304/330/356, one-line 12px links, fixed survives scroll, tap navigation, no overflow — no Tailwind v4 failure classes); the desktop pill exact; the favourites round-trip works (state restored); the booking round-trip works (the "Audit Session18" request visible under Profile → My bookings — the owner's redeploy wipes it per the start-server log).
- Dual-site audit (agent-browser, logged in on both): the live source re-measured at 1280/390 and DOM-diffed against the deployed clone → 6 actionable findings in docs/remediation-plan-session-18.md (F1 the 18px graph-paper texture on EVERY heading section — browse/map full-bleed sections wrapping planner+chips/search+pills + the detail hero; F2 the place-detail split — the rounded-36 card ends after the photo, About+form below in a gap-6 lg:grid-cols-[1.2fr_0.8fr] grid with the form its own rounded-28 aside; F3 the 16px field radii; F4 the mobile full-viewport route svg ~208vh sticky with no chip/timeline + rounded-28 stop cards with 30px titles; F5 the mobile restaurant flow — six static cards at 620px advances; F6 the desktop blue band overlapping the route trap's tail by 800px; F7 the hero crop nuance kept as a deviation).
- TDD execution (specs first — RED verified with targeted runs: 8 failures as expected, then GREEN): R1 the CategoryExplorer/MapExplorer headings restructured into full-bleed textured sections wrapping the filter UI; R2 the detail page split (the overlay on the hero section + the [data-detail-grid] two-column body + the BookingForm as aside#book-now-card); R3 the rounded-[16px] fields; R4 the mobileTrapRef-pinned route svg + the chip/timeline removal + the rounded-28/30px stop cards; R5 the flowing mobile restaurant list (130px margins); R6 the band's lg:-mt-[800px] + relative z-10 rise.
- En-route lessons: the live's browse eyebrow is display:none dormant DOM (both breakpoints — don't clone); the live's px-5 computes to 16px at mobile (the clone's restructured sections use px-4 — h1 x=16, cards 358@x16 exact); the reseed invalidates the stateless cookie (the favourite POST 500s with the stale cuid — diagnose via agent-browser network monitoring, then force a logout/login); the mobile category-card position needed no change (306×227 r24 already exact).
- Full gate on the exact push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 56/56 E2E ✓.
- Side-by-side verification of every fixed surface against the live's measured values (the browse overlays 1280w/394h/40%/18px vs live 385-413; the detail card 692 containing header+photo only, About below at y=885, the grid 1152/gap-24, the aside 451 r28, the inputs 16px; the mobile route 3752 with the 390×844 svg + 0 visible chips; the mobile aside 358@x16 EXACT; the desktop overlap 800px EXACT at the sticky release point) + VLM spot-checks (the eat texture confirmed on both; the detail card structure "Match") + pixel-periodicity analysis (the 18px texture present on both detail pages).
- 14 screenshots refreshed (reseed → forced re-login → the Moss & Marble favourite saved for 07 → capture-screens-v3 + crop-sections-v3); variance-validated.
- Docs aligned: README (features/status row), AGENTS (the texture/detail/choreography facts), CLAUDE (testing map + architecture bullet), PAD (v1.9 revision), activity-map_SKILL (v1.7.0), docs/session_18.md, docs/remediation-plan-session-18.md, this worklog. .env.example verified.

Stage Summary:
- Deliverables: the session-18 parity remediation (the heading-grid texture across browse/map/detail, the place-detail split layout with the 16px-radius form, the full-viewport mobile route visual, the flowing mobile restaurant list, the 800px blue-band overlap, the 16px mobile paddings), the E2E contracts extended in place (56 total), the remediation plan + session log, 14 refreshed screenshots, 8 aligned docs.
- Key decisions: the heading texture is implemented as the favourites' proven scoped-overlay pattern (never a global body texture — the profile keeps its full-page fixed variant); the detail split keeps #book-now on the inner form so the booking round-trip spec survives unchanged; the band overlap is a pure negative-margin choreography (z-10 above the released route sticky) matching the live's release-point math exactly; the live's dormant eyebrow + the shadow-muted gutter texture are documented non-gaps.
- Ready: local commit on main + SSH-wrapper push with the provided ed25519 key.

---
Task ID: 18 (push verification)
Agent: Super Z (main agent)
Task: Session 18 finalization — commit + push status.

Work Log:
- Commit ad9570c on main (25 files, +760/−248): the session-18 parity remediation (the 18px graph-paper texture on every browse/map/detail heading as full-bleed sections wrapping the filter UI with the 16px mobile paddings; the place-detail split layout — the rounded-36 card ends after the hero photo, About + the form below in the gap-6 lg:grid-cols-[1.2fr_0.8fr] grid, the BookingForm as its own rounded-28 aside with 16px-radius fields and the 18px Book Now h3; the full-viewport sticky mobile route visual with no chip/timeline and rounded-28 stop cards with 30px titles; the flowing mobile restaurant list; the 800px blue-band overlap at the route sticky release point), the E2E contracts extended in place (56 total: +browse/map/detail overlay assertions, the detail split geometry, the radius-16 fields, the mobile route visual contract, the flowing-list + band-overlap checks), the remediation plan + session log, 9 refreshed screenshots (01/05/08/11 byte-stable; 02/03/04/06/09/10/13/14 re-rendered with the new texture/split/visual), and the 8 aligned docs (README/AGENTS/CLAUDE/PAD v1.9/SKILL v1.7.0/session_18/remediation-plan-18/worklog).
- Full gate re-run on the exact commit: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 56/56 E2E ✓.
- Push infrastructure: paramiko 5.0.0 installed (venv at /home/z/my-project/.venv-push), the Appendix-A paramiko ssh shim deployed at /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches the session-2/4/6/8/10/12/14/16 records).
- Dry-run: fast-forward 9927947..ad9570c confirmed.
- Real push via docs/ssh_git_wrapper_v3.py --key-file /home/z/.ssh-tmp/op.key --remote git@github.com:nordeim/activity-map.git: landed; remote verified refs/heads/main @ ad9570c == local HEAD; tracking ref synced.
- Operator key shredded (random overwrite + delete); wrapper temp key shredded by the wrapper itself.

Stage Summary:
- main fully in sync with origin at ad9570c; working tree clean; no branches created; no key material on disk.
- Open item for the owner: the deployed mirror runs the session-16 code — a redeploy from main @ ad9570c will pick up the session-18 surfaces (the heading textures, the detail split, the mobile route visual, the flowing restaurant list, the band overlap). The mirror also carries one "Audit Session18" booking (the round-trip proof — the owner's rm -rf db + reseed flow wipes it).

---
Task ID: 20
Agent: Super Z (main agent)
Task: Session 20 — dual-site audit → the route stop-card typography + 50/50 split + continuous scroll-linked choreography parity, full gate, screenshots, docs, commit + push.

Work Log:
- Workspace refreshed via git pull to a2de5ab (main; the owner's update-session-log commit added docs/session_19.md — the previous agent's narration — and the start-server-log showing the deployed mirror rebuilt WITH the session-18 code). All 6 root docs + session_18/remediation-plan-session-18/worklog/session_19/start_server_log reviewed; scandihaven patterns confirmed (sibling clone persisted); repo skills catalog consulted (agent-browser/tdd/tailwind-patterns).
- Baseline validation: lint ✓ (2 pre-existing warnings) typecheck ✓ 42 unit ✓ build ✓ 56/56 E2E ✓ 27/27 smoke ✓; db/ at repo root; .env/.env.example correct; vitest + playwright configs functional; NO stray parent .env this session.
- Deployment check: https://activity-map.jesspete.shop/ is UP running the session-18 code (the eat heading texture 1280×394 @18px/40%, the detail split grid 676.8/451.2 gap-24, the mobile route visual verified live). Full browser audit: all pages load with zero console errors; the mobile navbar works end-to-end (fixed 52px cream-glass header, icons 304/330/356, tap navigation, no overflow at 390 — no Tailwind v4 failure classes); the desktop pill exact; the favourites round-trip works (state restored); the booking round-trip works (the "Audit Session20" request visible under Profile → My bookings — the owner's redeploy wipes it).
- Dual-site audit (agent-browser, logged in on both): the live source re-measured at 1280/390 and DOM-diffed against the deployed clone — every session-18 surface re-verified UNCHANGED except the Recommended Route stop cards → 4 actionable findings in docs/remediation-plan-session-20.md (F1 the 20px/600 h3 place name + the 13px/400 #72706A meta + the 13px Learn More; F2 the 50/50 desktop split (visual w-1/2 640px, stops px-8, the card SLOT at y=237) with the CONTINUOUS scroll-linked swap (0.665px per scroll px, i/(N−1) crossings, ±380px tent crossfades, 120ms linear transitions, exits rise OUT); F3 the mobile panel `28px 18px 48px` with mt-7 gaps (cards 354@x18) + the max-w-md 448px desktop link card; F4 the shadow-less px-3/py-1 12px/400 time pill with the 14px clock).
- TDD execution (specs first — RED verified: the time-pill font-weight assertion failed exactly as expected, then GREEN): R1 the h3 20px/600 place names + the 13px #72706A meta + mt-4 desc + 13px Learn More; R2 the max-w-md mt-7 p-5 link card with the 0 8px 28px/0.08 shadow + the re-chromed time pill; R3 the w-1/2 visual panel + lg:px-8 stops column; R4 the lg:pt-[237px] slot + the scroll-linked inline transform/opacity choreography (gated by an isDesktop matchMedia state — the mobile flow stays static) with the data-active round() semantics; R5 the mobile panel re-padding.
- En-route lessons: the live's meta color computes to #72706A NOT #72706C (0x6A vs 0x6C — the first GREEN run caught the 2-blue-channel miss); scrollIntoViewIfNeeded on the 420vh trap is non-deterministic (it centered the trap mid-viewport at p=0.5 in full-suite runs — the E2E now uses deterministic window.scrollTo probes); late-loading images shift the layout after a programmatic scroll (re-align before measuring the slot).
- Full gate on the exact push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 56/56 E2E ✓.
- Side-by-side verification of every fixed surface against the live's measured values (the visual panel 640 EXACT; the slot 237 EXACT; the link card 448 EXACT; the h3 20px/600/30px EXACT; the meta 13px rgb(114,112,106) EXACT; the choreography samples at 0/200/400/600/800 match within 3–17px y and 0.02 opacity; the mobile panel `28px 18px 48px` EXACT with 354@x18 cards and 28px gaps).
- 14 screenshots refreshed (reseed → fresh login → the Moss & Marble favourite saved for 07 → capture-screens-v3 + crop-sections-v3); variance-validated.
- Docs aligned: README (the route feature row + the session-20 status row), AGENTS (the route choreography facts), CLAUDE (the testing map + architecture bullet + the E2E traps), PAD (v2.0 revision), activity-map_SKILL (v1.8.0), docs/session_20.md, docs/remediation-plan-session-20.md, this worklog. .env.example verified.

Stage Summary:
- Deliverables: the session-20 route-choreography parity (the re-typed stop cards with the max-w-md link cards and the shadow-less pills, the 50/50 desktop split with the 237px card slot, the continuous scroll-linked swap choreography, the mobile panel re-padding), the E2E contract extended in place (56 total), the remediation plan + session log, 14 refreshed screenshots, 8 aligned docs.
- Key decisions: the choreography is implemented as scroll-linked inline transform/opacity (the live's own mechanism — 120ms linear transitions, ±380px tent crossfades) gated by an isDesktop matchMedia state so the mobile flow never sees the inline styles; data-active stays on the nearest-slot card (round()) so the pointer-events + deep-scroll contracts survive; the E2E choreography probes are deterministic window.scrollTo calls with a re-align pass (the scrollIntoViewIfNeeded + late-image traps documented).
- Ready: local commit on main + SSH-wrapper push with the provided ed25519 key.

---
Task ID: 20 (push verification)
Agent: Super Z (main agent)
Task: Session 20 finalization — commit + push status.

Work Log:
- Commit 9f32dfe on main (12 files, +446/−62): the session-20 route-choreography parity (the 20px/600 h3 place names with the 13px/400 #72706A meta lines and the 13px/600 Learn More text; the max-w-md 448px desktop link cards with the lighter 0 8px 28px/0.08 shadow and the re-chromed shadow-less time pills; the 50/50 desktop split — the visual panel w-1/2 at 640px with the stops column lg:px-8 and the card slot at lg:pt-[237px] — carrying the live's CONTINUOUS scroll-linked swap choreography with the isDesktop-gated inline transform/opacity; the mobile route panel re-padded 28px/18px/48px with mt-7 gaps), the E2E contract extended in place (56 total: the route typography/link-card/pill assertions, the 50/50 split + the designed 237px slot, the intermediate-opacity crossfade + the upward-exit choreography probes with deterministic window.scrollTo, the mobile link-card x=18 geometry), the remediation plan + session log, 2 refreshed screenshots (11-home-route + 12-home-restaurants re-rendered with the new choreography; the other 12 byte-stable), and the 8 aligned docs (README/AGENTS/CLAUDE/PAD v2.0/SKILL v1.8.0/session_20/remediation-plan-session-20/worklog).
- Full gate re-run on the exact commit: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 56/56 E2E ✓ (two consecutive clean full-suite runs; one earlier run had a single favourites CDN-timing flake that passed on every re-run — the documented pre-existing flake class).
- Push infrastructure: the persisted venv at /home/z/my-project/.venv-push (paramiko 5.0.0) + the Appendix-A shim at /home/z/my-project/bin/ssh (shebang pinned to the venv python); operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches the session-2/4/6/8/10/12/14/16/18 records).
- Dry-run: fast-forward a2de5ab..9f32dfe confirmed.
- Real push via docs/ssh_git_wrapper_v3.py --key-file /home/z/.ssh-tmp/op.key --remote git@github.com:nordeim/activity-map.git: landed; remote verified refs/heads/main @ 9f32dfe == local HEAD; tracking ref synced.
- Operator key shredded (random overwrite + delete); wrapper temp key shredded by the wrapper itself.

Stage Summary:
- main fully in sync with origin at 9f32dfe; working tree clean; no branches created; no key material on disk.
- Open item for the owner: the deployed mirror runs the session-18 code — a redeploy from main @ 9f32dfe will pick up the session-20 route surfaces (the re-typed stop cards, the 50/50 split, the continuous choreography). The mirror also carries one "Audit Session20" booking (the round-trip proof — the owner's rm -rf db + reseed flow wipes it per the start-server log).

---
Task ID: 22
Agent: Super Z (main agent)
Task: Session 22 — audit the DEPLOYED mirror via browser E2E, re-measure the live source, remediate the parity gaps (hero framing + nav glass + letter-spacing), pass the full gate, refresh screenshots, align docs, commit + push.

Work Log:
- Workspace re-cloned (reset environment) to 64e5148 (main; the owner's commits added docs/session_21.md — the previous agent's narration — the session-20 audit docs, and the start-server-log update). All 5 root docs + session_20/remediation-plan-session-20/worklog/session_21/start_server_log reviewed; repo skills catalog consulted (agent-browser / tdd / tailwind-patterns / clone-app-pat-pro).
- Baseline validation: bun install → prisma generate → db:push/db:seed (db/ at the repo root, 42+27+9 places + demo user) → lint ✓ (2 pre-existing warnings) typecheck ✓ 42 unit ✓ build ✓ 56/56 E2E ✓ 27/27 smoke ✓; .env/.env.example correct (DATABASE_URL="file:../db/custom.db", scripts pin it inline); vitest + playwright configs functional; no stray parent .env trap.
- Deployment check: https://activity-map.jesspete.shop/ UP and running the SESSION-20 code (verified by signature: the h3 20px/600 stop cards, the 448px max-w-md link cards at x=672, the 640×800 visual panel, the absolute top-400 choreography with 0.12s linear transitions).
- Deployed-mirror functional audit (agent-browser, logged in): all 10 pages load with ZERO console errors; mobile navbar verified end-to-end (fixed 52px cream-glass, icons 304/330/356 identical to the live, one-line 12px links, fixed survives scroll, tap navigation moves the active state, no overflow at 390 — no Tailwind v4 failure classes); desktop pill exact; favourites round-trip (POST 201 → visible → DELETE 200); booking round-trip (POST 201 → visible; owner's redeploy wipes it).
- Live-source re-measure (logged in at 1280/768/390): every session-20 surface re-verified UNCHANGED (the full §1 list of the remediation plan) EXCEPT 5 deltas — F1 the desktop hero photo FRAMING (the live's .today-hero-bg absolute at inset −78px/6px over a −80mt section → the photo box spans page −86→924 @1280 (1010px) / −86→886 @768 (972px), cover-cropped ≈7.7% more zoomed); F2 the mobile-nav glass (rgba(248,247,244,0.62) + blur(24px) saturate(1.5) vs the clone's /60 + blur(20)); F3 the nav link tracking (+0.01em desktop / −0.01em mobile); F4 the route h3 tracking (−0.02em); F5 the time-pill tracking (+0.05em).
- Remediation plan written (docs/remediation-plan-session-22.md) and validated against the codebase (the exact files/locators/spec sections identified) before execution.
- TDD RED: the E2E contracts extended first (home.spec.ts hero geometry @1280/768 + the route h3/pill tracking; mobile-navigation.spec.ts the tab-bar glass + the mobile link tracking + the desktop pill tracking) — all five verified failing against the unmodified tree (imgH 938 vs 1000–1020; blur(20px); the tracking NaNs).
- TDD GREEN: R1 the Hero restructured (the section md:-mt-[73px]; the backdrop absolute at every breakpoint with md:-top-[86px]/md:bottom-[14px]; the in-flow content layer carrying 591/900/938) — en-route trap caught by the mobile spec: an in-flow backdrop + a separate in-flow content layer STACKS the two 591px boxes (h1 at y=794) — fixed by making the backdrop absolute at mobile too; R2 the glass (bg-[rgba(248,247,244,0.62)] + backdrop-blur-[24px] + backdrop-saturate-[1.5] — composed into ONE declaration, verified); R3–R5 the tracking utilities.
- Full gates on the push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 58/58 E2E ✓.
- Side-by-side verification on the dev server: every remediated surface EXACT (img y=−86 h=1010 @1280; y=−86 h=972 @768; y=0 h=591 @390; h1 y=290/203 x=24; the glass rgba+blur+saturate EXACT; the four tracking values EXACT: 0.13px / −0.12px / −0.4px / 0.6px).
- 14 screenshots refreshed (capture-screens-v3 + crop-sections-v3; the favourite saved for 07); .env.example verified against every code-referenced env var.
- Docs aligned: README (the home feature row + the session-22 status row), AGENTS (the glass + tracking + hero facts, 58 E2E), CLAUDE (the mobile chrome + the testing map), PAD (v2.1), activity-map_SKILL (v1.9.0), the session-22 plan + this log + the worklog.

Stage Summary:
- The deployed mirror audited ALL GREEN on the session-20 code; the live source re-measured with 5 deltas found.
- The desktop hero photo framing, the mobile-nav glass, and 3 letter-spacing deltas remediated to EXACT live parity (all measured values identical post-fix).
- Gates: 42 unit + 27 smoke + 58 E2E (2 new + 3 extended contracts) — all green ×1 on the push tree.
- 14 screenshots refreshed; 8 docs aligned; single conventional commit + SSH-wrapper push to main.

---
Task ID: 22-push
Agent: Super Z (main agent)
Task: Session 22 — push verification record.

Work Log:
- Push infrastructure: paramiko 5.0.0 installed (--break-system-packages), the Appendix-A paramiko ssh shim deployed at /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches the session-2/4/6/8/10/12/14/16/18/20 records).
- Secret scan of the full diff + new docs: 0 matches (the AGENTS.md demo login is the pre-existing seeded-account documentation).
- Single conventional commit fb5f78b (25 files: 3 components + 2 specs + 14 screenshots + 8 docs) pushed via docs/ssh_git_wrapper_v3.py to git@github.com:nordeim/activity-map.git main; dry-run first (fast-forward 64e5148..fb5f78b confirmed), then the real push.
- Remote verified: refs/heads/main @ fb5f78b == local HEAD; refs/remotes/origin/main synced; operator key + the wrapper's temp copy both shredded.

Stage Summary:
- Session 22 delivered and pushed to main (fb5f78b); remote ref verified; no key residue.

---
Task ID: 23
Agent: Super Z (main agent, session 23)
Task: Session 23 — deployed-mirror + live-source dual audit → footer re-measure, the 1px tab-bar, and the page-bottom spacing parity (TDD).

Work Log:
- Workspace refreshed (git pull — session_23.md + the start-server-log update arrived); every root doc + the session-22/23 logs + the worklog re-read; the baseline gate run on the untouched tree: lint ✓ (2 pre-existing warnings) · typecheck ✓ · 42 unit ✓ · build ✓ · 27/27 smoke ✓ · 58/58 E2E ✓.
- Deployed-mirror audit (activity-map.jesspete.shop, logged in): verified running the SESSION-22 code by DOM signature (hero img y=−86 h=1010 @1280; blur(24px) saturate(1.5) glass; −0.12px mobile tracking). All 10 pages + place detail load with ZERO console errors; the mobile navbar works end-to-end (fixed glass tab-bar, tap navigation, icon actions, scroll persistence, no 390 overflow — no Tailwind v4 failure classes); favourites round-trip (save 201 → visible → unsave); booking round-trip (submit → confirmation → visible under My bookings).
- Live-source re-measure (activity-map.base44.app, logged in at 1280/768/390): every session-22 surface re-verified UNCHANGED (hero, pill, tracking, route cards, time pills, eat/stay/do headings, detail split, map, profile, login, mobile cards) — then the FOOTER swept for the first time since session 2: F1 the mobile tab-bar totals 52px border-box (clone 53); F2 the desktop footer is a compact shrink-wrapped GLASS pill 506×96 (r-28, border 1px #E8E6DC, blur(40px) saturate(1.5), pad 8px 10px, links 74×78/20px icon/11px-600; inner 1024; footer pt-64/pb-56; justify-between legal row 12px #8A8780); F3 the mobile footer (350px grid, pt-32/pb-24, column legal row); F4 the page-bottom chains (home card→pill 32 + pill→footer 0/22; browse/map/detail 96).
- Remediation plan written (docs/remediation-plan-session-23.md) and validated against the codebase before execution; one plan error caught en-route by dev-server measurement: the "map has NO bottom padding" claim was a probe artifact (the map chain already measured 96 = pb-16 + the footer's mt-8) — the correct fix compensated the removed mt-8 (pb-16→pb-24) instead of stacking a second padding.
- TDD RED: three new contracts added first (mobile-navigation.spec.ts the tab-bar 52px border-box; home.spec.ts the footer re-measure + the page-bottom spacing) — all three verified failing against the unmodified tree.
- TDD GREEN: R1 Navbar nav h-[52px]→h-[51px] (52 border-box with the header's 1px border-b); R2 SiteFooter rebuilt (the glass pill + footer-owned paddings + max-w-5xl inner + the justify-between legal row + #8A8780 text; mt-8 removed); R3 the page-bottom chains (home main pb-16 removed + the sights section pb-[22px] md:pb-0 + the pill wrapper mt-8/no pb; CategoryExplorer pb-24; the detail main pb-24; MapExplorer inner pb-24).
- Full gates on the push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 61/61 E2E ✓ (3 new contracts; every prior pin green).
- Side-by-side verification on the dev server: every remediated surface EXACT (tab-bar 52 @390; footer 506×96 r-28 #E8E6DC blur(40px) saturate(1.5) pad 8px 10px links 74×78 icon 20 span 11px/600 inner 1024 pt-64/pb-56; mobile 350/104×78 pt-32/pb-24 column row; home 0/32 desktop + 22/32 mobile; eat/map/detail 96; pixel-verified border #E8E6DC + cream canvas in the captures).
- 17 screenshots (14 refreshed via capture-screens-v3 + crop-sections-v3; 3 new footer captures via capture-screens-v4-footer — the smooth-scroll trap fixed with instant scrollTo + rect verification); .env.example verified against every code-referenced env var (DATABASE_URL + AUTH_SECRET live; NEXT_PUBLIC_SITE_URL the documented reserved slot).
- Docs aligned: README (17 captures, 61 E2E, the session-23 status row), AGENTS (the 52px tab-bar precision + the footer contract, 61 E2E), CLAUDE (the mobile chrome footer description + the E2E suite map, 61), PAD (v2.2), activity-map_SKILL (v1.10.0), the session-23 plan + this log.

Stage Summary:
- The deployed mirror audited ALL GREEN on the session-22 code; the live re-measured with the footer swept for the first time since session 2 — 4 findings.
- The 1px tab-bar, the footer chrome/paddings/legal row, and the four page-bottom chains remediated to EXACT live parity (all values measured identical post-fix).
- Gates: 42 unit + 27 smoke + 61 E2E (3 new contracts) — all green on the push tree.
- 17 screenshots; 7 docs aligned; single conventional commit + SSH-wrapper push to main.

---
Task ID: 23-push
Agent: Super Z (main agent)
Task: Session 23 — push verification record.

Work Log:
- Push infrastructure reused: paramiko 5.0.0 present, the Appendix-A paramiko ssh shim at /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches every prior session record).
- Secret scan of the full diff + the new untracked files: 0 matches (the README demo-login lines were pre-existing context, no new credential lines added).
- Dry-run: authenticated, remote main at b055131 (the session base), fast-forward confirmed.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: b055131..97969ba HEAD -> main; wrapper verified refs/heads/main @ 97969ba == local HEAD and synced refs/remotes/origin/main.
- Operator key shredded (random-overwrite + remove); wrapper's own temp key + known_hosts sidecar shredded by the wrapper; working tree clean; git status agrees with the remote.

Stage Summary:
- Commit 97969ba (26 files: 8 source/spec + 7 docs + 11 screenshots/scripts) pushed to main and verified on the remote.
- No secrets in the tree; key material destroyed post-push.

---
Task ID: 24
Agent: Super Z (main agent, session 24)
Task: Session 24 — deployed-mirror + live-source dual audit → the filter-shell design system parity (TDD).

Work Log:
- Workspace re-cloned (the sandbox had been reset); every root doc + the session-23/24 logs + the worklog + the start-server log re-read; the baseline gate run on the untouched tree: lint ✓ (2 pre-existing warnings) · typecheck ✓ · 42 unit ✓ · build ✓ · 27/27 smoke ✓ · 61/61 E2E ✓.
- Deployed-mirror audit (activity-map.jesspete.shop, logged in): verified running the SESSION-23 code by DOM signature (the footer glass pill 506×96 with the 1px #E8E6DC border + blur(40px) saturate(1.5); the 52px border-box tab-bar; the mobile footer 350/104×78/32-24; every page-bottom chain on contract). All pages load with ZERO console errors; the mobile navbar end-to-end (tap navigation, icon actions, scroll persistence, no 390 overflow); the favourites round-trip (save → visible → unsave); the booking round-trip (submit → "Request sent" → visible under My bookings).
- Live-source re-measure (activity-map.base44.app, logged in at 1280/390): every session-22/23 surface re-verified UNCHANGED (hero, pill, tab-bar glass, footer, route/stay h3s, sights grid, blue band, eat/detail/map/profile geometry) — then the FILTER surfaces swept for the first time: the live has evolved a "filter-shell" design system (a mobile-override stylesheet pinning `section.relative.overflow-*` paddings, sticky `.planner-filter-shell`/`.discover-filter-shell` wrappers, 600-weight hairline pills). Findings F1–F10: the chips (600/hairline/#555550/44px-touch/violet-active), the browse card shell (r-28/24 + hairline + 18/44 shadow — never measured since session 3), the map command-center redesign (sticky glass shell + pills-inside-the-flow), the mobile pt-112 section contract, the planner stickiness/chrome, the Back pill, the 36px heart disc, the map pill weight, the favourites empty state, the 18px mobile grid gap.
- Remediation plan written (docs/remediation-plan-session-24.md) and validated against the codebase before execution.
- TDD RED: five new contracts added (browse.spec.ts — the chips, the card shell, the mobile headings, the Back pill, the map command center) — all verified failing against the unmodified tree.
- TDD GREEN: R1 the chips re-chromed (min-h-44 phones / content 38 md, 600, hairline, #555550, violet active); R2 the PlaceCard floating shell + the 36px heart (h-9 w-9, svg 16); R3 the MapExplorer command center (sticky top-10/96 shell, r-30/34 glass, white/70 hairline, 0 8 22 /0.10, the 56/48px cream button, pills 44/41 at 600); R4 the mobile section contract (pt-[60px] pb-[22px] + the favourites full-bleed texture + the detail pt); R5 the BrowsePlanner sticky at both breakpoints (pad 10/6, solid white + hairline at md, h 68; date+people grouped at 6px; 56/48px buttons); R6 the Back pill (36px, py-2 px-4, no shadow); R7 the favourites empty state (shadowless, px-0).
- En-route corrections caught by dev-server side-by-side: the map filter button is 56px only on phones (48 at md); the planner's date+people ride a 6px gap; a `md:h-[41px]` utility loses to a base `min-h-[44px]` (use `md:min-h-[41px]`); the session-10 "44×44 heart" E2E pin had encoded the clone's own drift (the live measures 36 everywhere).
- Full gates on the push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 66/66 E2E ✓ (5 new contracts; every prior pin green).
- Side-by-side verification on the production server: every remediated surface EXACT (chips 44/38@600 + hairline + violet active; card r-24/28 + 0 18 44 shadow + 392 wide + heart 36 + gap 18; map shell sticky 10/96, r-30/34, h 138/66, pills 44/41@600, gap 14/52; h1 y 112/112/188; Back 36×89@112; planner 270/68 sticky; empty state 358@16 shadowless).
- 20 screenshots (14 refreshed + 3 footer re-runs + 3 new filter-shell captures via capture-screens-v5-shell, VLM-verified); .env.example re-verified; docs aligned (README, AGENTS, CLAUDE, PAD v2.3, activity-map_SKILL v1.11.0, the plan, this log).

Stage Summary:
- The deployed mirror audited ALL GREEN on the session-23 code; the live re-measured with the filter surfaces swept for the first time — 10 findings, all remediated to EXACT parity.
- Gates: 42 unit + 27 smoke + 66 E2E (5 new contracts) — all green on the push tree.
- 20 screenshots; 7 docs aligned; single conventional commit + SSH-wrapper push to main.

---
Task ID: 24-push
Agent: Super Z (main agent)
Task: Session 24 — push verification record.

Work Log:
- Push infrastructure rebuilt (the sandbox had been reset): paramiko 5.0.0 present on the system python (/usr/bin/python3 — the venv python lacks it, so the shim's shebang points at the system one), the Appendix-A paramiko ssh shim deployed at /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches every prior session record).
- Secret scan of the full diff + the new untracked files: 0 new matches (the AGENTS.md demo-login lines are pre-existing seeded-account documentation).
- Dry-run: authenticated, remote main at 7dba315 (the session base), fast-forward confirmed.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: 7dba315..ff32686 HEAD -> main; wrapper verified refs/heads/main @ ff32686 == local HEAD and synced refs/remotes/origin/main.
- Operator key shredded (random-overwrite + remove); the wrapper's own temp key + sidecar shredded by the wrapper; working tree clean; git status agrees with the remote.

Stage Summary:
- Commit ff32686 (35 files: 7 source/spec + 7 docs + 20 screenshots + 1 script) pushed to main and verified on the remote.
- No secrets in the tree; key material destroyed post-push.

---
Task ID: 25
Agent: Super Z (main agent, session 25)
Task: Session 25 — deployed-mirror verification + live-source re-measure → the login/legal/category parity (TDD).

Work Log:
- Workspace refreshed (git pull brought docs/session_25.md + the start-server log update); every root doc + the session-24 logs + the worklog re-read; the codebase state re-validated (env, db, configs, skills exclusion); the baseline gate run on the untouched tree: lint ✓ (2 pre-existing warnings) · typecheck ✓ · 42 unit ✓ · build ✓ · 27/27 smoke ✓ · 66/66 E2E ✓.
- Deployed-mirror audit (activity-map.jesspete.shop, logged in): REDEPLOYED WITH THE SESSION-24 CODE — verified by DOM signature (the chips 600/#555550/hairline with the violet #571AFF active at 38px@1280/44px@390; the card shell r-28 + hairline + 0 18 44 /0.08 shadow; the map command center sticky-96 h66 w1216 with pills 41/600; the mobile h1 y=112; the heart disc 36 with the 16px svg; the tab-bar 52). Functionally ALL GREEN: zero console errors across every page at 390; the mobile navbar end-to-end (no overflow, tap navigation, active-state movement, fixed-bar scroll persistence, icon actions); the favourites round-trip; the booking round-trip (visible under Profile → My bookings).
- Live-source re-measure (activity-map.base44.app, logged in at 1280/390): every session-24 surface re-verified UNCHANGED (chips, card shell, map command center, planner chrome, pt-112, hero, pill, footer, route h3s, stay squares, sights, blue band, detail split, profile, favourites heading, map cards + interleaved order, mobile carousel) — then the LONGEST-PINNED surfaces swept for the first time. Findings F1–F5: the login (the shadcn inputs are 14px text-sm — the clone rendered 16px; the whole "Need an account? Sign up" line is ONE button with a font-medium span); the category cards' desktop internals (root cause: the live renders its session-10 internals at md — 230px cards, 36px rows, 28×28 cells — and SCALES the row transform:matrix(1.15), so the visible contract is 24px headers / 32×32 cells / ~13.8px gap / cards 210–231 / the pill hanging 49px past the card bottom; the clone rendered the session-16 build: 32px header, 34×35 cells, gap 20, the pill at −27px); the favourites empty card (max-w-xl 576 centered @1280 vs the clone's max-w-md 448); the legal pages (the live's routes /privacy-policy + /accessibility-statement — its old /privacy 404s; the ← Back home link 14px/400 #8A8780; max-w-3xl; the 48px Libre Baskerville h1; 14px/28px #5F5C56 paras; no Last-updated eyebrow; the live's verbatim texts).
- Remediation plan written (docs/remediation-plan-session-25.md) and validated against the codebase before execution.
- TDD RED: four touched specs verified failing on the unmodified tree (the login chrome extension, the NEW legal-pages contract, the updated category-card pins, the favourites empty width).
- TDD GREEN: R1 the login (text-sm inputs + the one-button signup row); R2 the category cards (md:leading-6, md:h-8 md:w-8 cells with 15px svgs, gap-3.5, md:bottom-[-49px]); R3 the favourites empty card max-w-xl; R4 the legal pages (the new routes + redirect stubs + the LegalPage rebuild + the footer hrefs + absolute titles).
- Side-by-side verification on the production server: every remediated surface EXACT (login inputs 14/48 + one button; cards header 24/cells 32×32/svg 15/gap 14/x 232-509-786/h 215/pill 229×54 at 48/6 vs the live 49/5; the mobile carousel untouched; the empty card 576@x352 centered; the legal chrome exact). The login card height 784 vs the live's 746 documented as a whitespace non-gap (the live's merged-block + hidden field slots).
- En-route lessons: a computed-vs-rect width mismatch (230 vs 264.5) exposed the live's ancestor transform — walk the chain before trusting raw geometry; a VLM flipped a height comparison (called the shorter live card taller) — the DOM is the truth; browser daemons left from the audit starved one E2E run (a do-view flake) — kill them before the gate.
- Full gates on the push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 67/67 E2E ✓ (the new legal-pages contract + the extended login/category/favourites pins; every prior pin green).
- 25 screenshots (14 refreshed + 5 new session-25 captures via capture-screens-v6-session25, VLM-verified); .env.example re-verified; docs aligned (README, AGENTS, CLAUDE, PAD v2.4, activity-map_SKILL v1.12.0, the plan, this log).

Stage Summary:
- The mirror verified running the session-24 code ALL GREEN (the session-24 close-the-loop spot-check); the live re-measured with the login/category/legal/favourites-empty surfaces swept for the first time — 5 findings, all remediated to EXACT visible parity.
- Gates: 42 unit + 27 smoke + 67 E2E (1 new contract + 3 extended) — all green on the push tree.
- 25 screenshots; 7 docs aligned; single conventional commit + SSH-wrapper push to main.

---
Task ID: 25-push
Agent: Super Z (main agent)
Task: Session 25 — push verification record.

Work Log:
- Push infrastructure reused: paramiko 5.0.0 on the system python (/usr/bin/python3 — the venv python lacks it; the Appendix-A shim's shebang points at the system one), the shim at /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches every prior session record).
- Secret scan of the staged diff + the new untracked files: 0 new matches (the README/AGENTS demo-login lines are pre-existing seeded-account documentation).
- Dry-run: authenticated, remote main at 92ba67e (the owner's post-session-24 "update start server log" commit — pulled at this session's start), fast-forward confirmed.
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: 92ba67e..a9e4f17 HEAD -> main; wrapper verified refs/heads/main @ a9e4f17 == local HEAD and synced refs/remotes/origin/main.
- Operator key shredded (random-overwrite + remove); the wrapper's own temp key + known_hosts sidecar shredded by the wrapper; working tree clean; git status agrees with the remote.

Stage Summary:
- Commit a9e4f17 (30 files: 10 source/spec + 7 docs + 12 screenshots + 1 script) pushed to main and verified on the remote.
- No secrets in the tree; key material destroyed post-push.

---
Task ID: 26
Agent: Super Z (main agent, session 26)
Task: Session 26 — deployed-mirror verification + live-source re-measure → the footer/mobile-home parity (TDD).

Work Log:
- Workspace refreshed (git pull brought docs/session_26.md + the start-server log update showing the owner rebuilt + restarted the server on the session-25 code); every root doc + the session-25 logs + the plan + the worklog re-read; the codebase state re-validated (env, db, configs, skills exclusion); the baseline gate run on the untouched tree: lint ✓ (2 pre-existing warnings) · typecheck ✓ · 42 unit ✓ · build ✓ · 27/27 smoke ✓ · 67/67 E2E ✓.
- Deployed-mirror audit (activity-map.jesspete.shop, logged in): REDEPLOYED WITH THE SESSION-25 CODE — verified by DOM signature (the login inputs 14px/48px + the one-button "Need an account? Sign up" row with the font-medium span; the legal routes /privacy-policy + /accessibility-statement rendering the exact chrome with the legacy paths redirecting; the category cards 24px headers / 32×32 cells / gap 14 / cards 263×215 at x 232/509/786 with the pill 229×54 hanging 48/6; the favourites empty card 576 @x=352; the session-24 chips/card shell/map shell/heart-36; the 52px tab-bar). Functionally ALL GREEN: zero console errors across every page; the mobile navbar end-to-end; the favourites round-trip; the booking round-trip (visible under Profile → My bookings).
- Live-source re-measure (activity-map.base44.app, logged in at 1280/390): every session-24/25 surface re-verified UNCHANGED (chips, card shell, map command center both breakpoints, planner, hero, pill, footer pill, route h3s, stay squares, sights grid, blue band, detail split + Back pill, profile, favourites, legal, login, mobile browses pt-112/chips-44/sticky-planner, mobile map shell, category cards) — then the FOOTER swept below the session-23 pill + the MOBILE HOME sections swept systematically for the first time since session 20. Findings F1–F7: the footer legal row (a 1px black/[0.05] top hairline + pt-3/sm:pt-5 + mt-4/sm:mt-8 — the clone had none); the footer's sm-vs-md breakpoint mix (the live's footer px-5 + vertical pads + the legal row layout all switch at sm 640); the mobile pill max-w 390 centered (the live's override — as is the legal row); the mobile route heading (the live hides the heading section below lg and pins the h2 INSIDE the fixed trap at absolute top-[68px] with clamp(38px,11vw,48px)=42.9px at 390, lh 1.02, tracking −0.055em, w min(92vw,360px), the trap 220vh, the panel pt-0/pb-10); the mobile showcase insets (the stay grid px-18 → cards 354 @x=18; the sights grid px-4 → 358 @x=16; the clone rendered both FULL-BLEED); the mobile restaurant deck (a STICKY STACKING deck again — cards pin at viewport y=88 and the next slides over, 620px advances, the deck pad 56/18/0; the session-20 "no sticky stacking" record was overtaken); the category track chrome (pad 18/18/40 + gap-3 12px, the cards at y=578, the pill 8px below the rows).
- Remediation plan written (docs/remediation-plan-session-26.md) and validated against the codebase before execution.
- TDD RED: five touched specs verified failing on the unmodified tree (the extended footer contract, the NEW route-heading contract, the REWRITTEN stacking-deck test, the stay/sight mobile insets, the category-track chrome).
- TDD GREEN: R1 the footer (the legal row's hairline + pt/mt + the sm: switch + the max-w-390 caps; the footer's own px-5 + sm: pads; the bare inner); R2 the route heading (the heading section hidden lg:block; the trap h2 at absolute top-68 with the live's exact typography; the 220vh trap; the panel pt-0/pb-10); R3 the showcase insets (px-[18px] / px-4 grids); R4 the stacking deck (sticky top-[88px] + the 56/18/0 pad); R5 the category track (gap-3 + px/pt-18 + the pill mt-2).
- Side-by-side verification on the production server: every remediated surface EXACT (the footer at 390/640/1280 — the 640 window matching the live's row 390 @x=125 with kids 125/331 and the pill 390 @x=125; the route h2 42.9px/43.758/−2.3595/w359 pinning at viewport 68 with the trap at 1857; the deck sticky-88 with the stacking observable mid-scroll; the insets 354@x18/358@x16; the track pad 18/18/8 gap 12 cards 306×226 at y 577 with scrollW 978).
- En-route lessons: the live's React app re-mounts its DOM tree differently between renders — a pre-reload measurement at 1280 caught the MOBILE route model rendering at desktop width (its un-reloaded JS matchMedia state), producing phantom findings (a "48px heading", a "+232px route offset") — RELOAD before cross-breakpoint comparisons; a getBoundingClientRect height of 664 on a 2-word h2 exposed a parent-stretched flex box (the h2's TEXT position still matched the clone); a VLM misread a mid-stack screenshot as "no pinning" — the DOM measurement (two cards at viewport 88) is the truth.
- Full gates on the push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 68/68 E2E ✓ (the stacking-deck test REWRITTEN + a NEW route-heading contract + the footer/category/showcase pins extended; every prior pin green).
- 29 screenshots (17 refreshed + 4 new session-26 captures via capture-screens-v7-session26, VLM-verified); .env.example re-verified; docs aligned (README, AGENTS, CLAUDE, PAD v2.5, activity-map_SKILL v1.13.0, the plan, this log).

Stage Summary:
- The mirror verified running the session-25 code ALL GREEN (the session-25 close-the-loop spot-check); the live re-measured with the footer-below-the-pill + the mobile home sections swept — 7 findings, all remediated to EXACT visible parity.
- Gates: 42 unit + 27 smoke + 68 E2E (1 new contract + 4 extended/rewritten) — all green on the push tree.
- 29 screenshots; 7 docs aligned; single conventional commit + SSH-wrapper push to main.

---
Task ID: 26-push
Agent: Super Z (main agent)
Task: Session 26 — push verification record.

Work Log:
- Push infrastructure reused: paramiko 5.0.0 on the system python (/usr/bin/python3 — the venv python lacks it; the Appendix-A shim's shebang points at the system one), the shim at /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches every prior session record).
- Secret scan of the staged diff + the new untracked files: 0 new matches (the README/AGENTS demo-login lines are pre-existing seeded-account documentation); 0 SSH key material.
- Dry-run: authenticated, remote main at 5d27c81 (the owner's post-session-25 "update start server log" commit — pulled at this session's start), fast-forward confirmed (5d27c81..3610c9b).
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: 5d27c81..3610c9b HEAD -> main; wrapper verified refs/heads/main @ 3610c9b == local HEAD and synced refs/remotes/origin/main.
- Operator key shredded (random-overwrite + remove); the wrapper's own temp key + known_hosts sidecar shredded by the wrapper; working tree clean; git status agrees with the remote.

Stage Summary:
- Commit 3610c9b (26 files: 6 source/spec + 7 docs + 12 screenshots + 1 script) pushed to main and verified on the remote.
- No secrets in the tree; key material destroyed post-push.

---
Task ID: 27
Agent: Super Z (main agent, session 27)
Task: Session 27 — deployed-mirror verification + live-source re-measure → the route-stop/login parity (TDD).

Work Log:
- Workspace refreshed (git pull brought the owner's start-server log update showing the server rebuilt + restarted on the session-26 code — the routes include /privacy-policy, the DB recreated under db/); every root doc + the session-26 logs + the plan + the worklog + the start-server log re-read; the codebase state re-validated (env, db recreated at the repo root with DATABASE_URL="file:../db/custom.db", the db/ folder at the repo root, vitest + playwright configs verified working, skills exclusion); the baseline gate run on the untouched tree: lint ✓ (2 pre-existing warnings) · typecheck ✓ · 42 unit ✓ · build ✓ · 27/27 smoke ✓ · 68/68 E2E ✓.
- Deployed-mirror audit (activity-map.jesspete.shop, logged in): REDEPLOYED WITH THE SESSION-26 CODE — verified by DOM signature (the session-26 footer legal-row hairline + pt-3/sm:pt-5 + mt-4/sm:mt-8 + the sm: switch + the max-w-390 caps; the trap-pinned route h2 absolute top-[68px] 42.9px lh 43.758 tracking −2.3595 w 359; the sticky stacking restaurant deck sticky top-[88px] first card x=18 w=354 h=490 six cards; the category track pad 18/18 gap 12 cards 306×227 at y=578; the session-25 login 14px/48px inputs at 1280 + the one-button signup row + the legal routes + redirects). Functionally ALL GREEN: zero console errors across every page; the mobile navbar end-to-end (the 52px border-box tab-bar, 12px links at −0.12px tracking, tap navigation with the active state moving, scroll persistence); the favourites round-trip; the booking round-trip (visible under Profile → My bookings).
- Live-source re-measure (activity-map.base44.app, logged in at 1280/390/640): every session-24/25/26 surface re-verified UNCHANGED (the hero, the nav pill, the footer, the category cards, the trap heading, the stacking deck, the showcase insets, the browses, the map command center, the detail, the profile, the favourites, the mobile tab-bar, the mobile browses pt-112, the blue band, the section headings at both breakpoints) — then the ROUTE STOP CARDS swept below the session-20 text-only contract + the login fields re-checked at every breakpoint. Findings F1–F6: the stop time pills (the live re-added the soft shadow 0 8px 22px /0.06 + a 1px /0.1 hairline + a PER-STOP category icon — Coffee/Utensils/Palette/Martini/Leaf at stroke-width 1.8 — + dimmer #3A3A3A 12px text, the pill computing 28×101 at 390); the stop link cards (a 1px /0.08 hairline + the hover lift); the stop titles (lh 1.1 + mb-2 — 48.4 at 44 mobile / 52.8 at 48 desktop); the meta rows (a 14px MapPin svg leading separate 13px #72706A spans in a gap-1.5 flex-wrap row); the Learn More hover (violet #571AFF + its glow); the login fields (RESPONSIVE — the inputs text-base md:text-sm 16px below md + the Sign-in button h-11 sm:h-12 44px below sm).
- Remediation plan written (docs/remediation-plan-session-27.md) and validated against the codebase before execution (the spec insertion points + the session-20 shadow-less pin identified for replacement).
- TDD RED: both touched specs verified failing on the unmodified tree (the extended route-stop contract + the responsive login window sweep at 390/640/1280).
- TDD GREEN: R1 the time-pill chrome (the border + shadow + #3A3A3A + the per-stop icon map + leading-[18px] — the pill landed 26 before the leading fix, 28 after); R2 the link-card hairline + hover lift; R3 the title lh 1.1 + mb-2 + the MapPin meta row + the violet Learn More hover; R4 the responsive login fields (text-base md:text-sm + h-11 sm:h-12).
- Side-by-side verification on the production server: every remediated surface EXACT (the pill 28×101 with the exact shadow tail at both breakpoints; the h2 48px/52.8 + mb 8px; the link card 448×202 with the 1px /0.08 border; the meta spans + pin; the login 16px/44px + button 44px at 390 → 16px/48px at 640 → 14px/48px at 1280).
- En-route lesson: agent-browser 0.38.x renders BLANK element screenshots of tall sticky sections (the 3360px route section captured correctly-sized but pure cream) — the element captures now run through Playwright's locator.screenshot() (scripts/capture-screens-v8-session27.mjs); the VLM verification of the first desktop stop-card capture caught a scrollIntoViewIfNeeded artifact on the absolute-positioned desktop cards (fixed with the deterministic trap-top scroll — the session-20 lesson re-applied).
- Full gates on the push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 68/68 E2E ✓ (the route-stop contract extended + the responsive login pinned at 390/640/1280; every prior pin green).
- 32 screenshots (3 refreshed + the session-27 set: the desktop + mobile route-stop chrome, the mobile login fields — VLM-verified); .env.example re-verified; docs aligned (README, AGENTS, CLAUDE, PAD v2.6, activity-map_SKILL v1.14.0, the plan, this log).

Stage Summary:
- The mirror verified running the session-26 code ALL GREEN (the session-26 close-the-loop spot-check); the live re-measured with the route stop cards swept below the session-20 contract + the login fields re-checked at every breakpoint — 6 findings, all remediated to EXACT visible parity.
- Gates: 42 unit + 27 smoke + 68 E2E (2 extended contracts) — all green on the push tree.
- 32 screenshots; 7 docs aligned; single conventional commit + SSH-wrapper push to main.

---
Task ID: 27-push
Agent: Super Z (main agent)
Task: Session 27 — push verification record.

Work Log:
- Push infrastructure rebuilt from scratch (the workspace had been reset): paramiko 5.0.0 installed on the venv python (/home/z/.venv/bin/python3 — the shebang of the Appendix-A shim points there), the shim extracted from the runbook to /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches every prior session record).
- Secret scan of the staged diff + the new untracked files: 0 new matches (the README/AGENTS/worklog demo-login lines are pre-existing seeded-account documentation); 0 SSH key material.
- Dry-run: authenticated, remote main at e4b5b29 (the owner's post-session-26 "update start server log" commit — pulled at this session's start), fast-forward confirmed (e4b5b29..644d97e).
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: e4b5b29..644d97e HEAD -> main; wrapper verified refs/heads/main @ 644d97e == local HEAD and synced refs/remotes/origin/main.
- Operator key shredded (random-overwrite + remove); the wrapper's own temp key + known_hosts sidecar shredded by the wrapper; working tree clean; git status agrees with the remote.

Stage Summary:
- Commit 644d97e (18 files: 2 source + 2 specs + 7 docs + 4 screenshots + 3 scripts) pushed to main and verified on the remote.
- No secrets in the tree; key material destroyed post-push.

---
Task ID: 28
Agent: Super Z (main agent, session 28)
Task: Session 28 — deployed-mirror verification + live-source re-measure → the date-picker/stay-pill/booking-label parity (TDD).

Work Log:
- Workspace re-cloned (sandbox reset); every root doc re-read + the session-27 plan + the worklog + docs/session_29.md + the start-server log (docs/session_28.md does not exist — the session files jump 27 → 29); the codebase state re-validated (env DATABASE_URL="file:../db/custom.db" with db/ at the repo root, vitest + playwright configs working, skills exclusion); the baseline gate run on the untouched tree: lint ✓ (2 pre-existing warnings) · typecheck ✓ · 42 unit ✓ · build ✓ · 27/27 smoke ✓ · 68/68 E2E ✓. The scandihaven reference repo reviewed for the shared tech-stack patterns (six-phase workflow, Tailwind v4 CSS-first rules, full-gate verification).
- Deployed-mirror audit (activity-map.jesspete.shop, logged in): REDEPLOYED WITH THE SESSION-27 CODE — verified by DOM signature (the route stop time pill h 28 with the 0 8px 22px /0.06 shadow + the 1px /0.1 hairline + the lucide-coffee icon at stroke-width 1.8 + the #3A3A3A text; the stop link card 1px /0.08 border + hover lift; the lh-1.1 mb-2 h2; the MapPin meta row). Functionally ALL GREEN: zero console errors across every page; the mobile navbar end-to-end (52px border-box tab-bar, 12px links at −0.12px tracking, tap navigation, scroll persistence); the favourites round-trip; the booking round-trip; the legal routes + redirects.
- Live-source re-measure (activity-map.base44.app, logged in at 1280/390): every session-24/25/26/27 surface re-verified UNCHANGED (the route stops, hero + planner, footer, category cards, trap heading, stacking deck, browses' card shell + internals, sights, stay grid order + geometry, detail, profile, map, mobile tab-bar + nav text + planner card + headings) — then the TRIP-PLANNER DATE-RANGE POPOVER swept for the first time since session 3 + the home stay pills + the booking-form labels + the profile chips. Findings F1–F4: the popover (510px at desktop / 358 at 390, pad 12, the from/to header a grid gap-2 sm:grid-cols-2 of SELF-CONTAINED 238×50 white pill fields carrying the 12px/500 #8A8780 label + 12px/600 #141413 value + a 14px calendar icon INSIDE, NO Done button, the month label 14px/500, 28×28 navs, 12.8px/400 #737373 weekdays, the selected day violet at weight 400, the in-range #F7F4FF + violet text, the gray #737373 prev-month trailing-day buttons, the 40px row pitch); the home stay pills (34px inline + the Book Now 1px white/0.92 border — the /stay browse variant verified unchanged at 36px borderless); the booking labels (12px/600 #3A3A3A with inline asterisks + the #DDDBD5 field borders); the profile chips (px-4).
- Remediation plan written (docs/remediation-plan-session-28.md) and validated against the codebase before execution (the spec insertion points identified).
- TDD RED: all three touched specs verified failing on the unmodified tree (the new date-picker contract, the stay-pill extension, the booking-label extension).
- TDD GREEN: R1 the popover container + header (w-[min(510px,calc(100vw-32px))] p-3 + the self-contained h-[50px] field pills + the Done button removed); R2 the month-grid chrome (font-medium label, h-7 w-7 navs, text-[12.8px] #737373 weekdays, font-normal selected, bg-[#F7F4FF] text-roam in-range, the gray trailing-day buttons, gap-y-2 → the 40px row pitch); R3 the stay pills (h-[34px] + the bordered Book Now + the Learn More white/[0.36]/[0.08] pins); R4 the labels (text-xs font-semibold text-[#3a3a3a] + inline asterisks + border-[#DDDBD5]); R5 the profile chips px-4.
- En-route fix: the E2E run exposed a stacking-context trap — the hero content wrapper's z-10 CAPPED the popover's z-[30000] under the category section's relative z-10 (later in the DOM), intercepting the day-cell pointer events ("subtree intercepts pointer events"); the wrapper drops the z-index (the absolute backdrop sibling + DOM order keep the content layering identical — every hero pin stayed green).
- Side-by-side verification on the dev server: the popover 510×369 at 1280 (the live 510×371) + the mobile 358×427 @x=16 (the live 429) — EXACT within 2px; the pills 168×34 with both borders; the labels 12px/600 rgb(58,58,58) + the rgb(221,219,213) borders; the chips 110/125/102 × 34.
- Full gates on the push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 69/69 E2E ✓ (the new date-picker contract + every prior pin green).
- 37 screenshots (5 new — the desktop popover + the selected-range state + the mobile popover + the stay-card pills + the booking-form labels, VLM-verified via scripts/capture-screens-v9-session28.mjs); .env.example re-verified; docs aligned (README, AGENTS, CLAUDE, PAD v2.7, activity-map_SKILL v1.15.0, the plan, this log, docs/session_30.md).

Stage Summary:
- The mirror verified running the session-27 code ALL GREEN; the live re-measured with the date-picker popover swept below the session-3 model + the stay pills + the booking labels + the chips — 4 findings, all remediated to EXACT visible parity.
- Gates: 42 unit + 27 smoke + 69 E2E (the new date-picker contract) — all green on the push tree.
- 37 screenshots; 8 docs aligned; single conventional commit + SSH-wrapper push to main.

---
Task ID: 28-push
Agent: Super Z (main agent)
Task: Session 28 — push verification record.

Work Log:
- Push infrastructure rebuilt from scratch (the workspace had been reset): paramiko 5.0.0 installed on the venv python (/home/z/.venv/bin/pip3 — the shebang of the Appendix-A shim points there), the shim extracted from the runbook to /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches every prior session record).
- Secret scan of the staged diff + the new untracked files: 0 new matches (the README/AGENTS/worklog/spec demo-login lines are pre-existing seeded-account documentation; the capture script's demo login follows the established scripts/capture-screens-v8-session27.mjs pattern); 0 SSH key material.
- Dry-run: authenticated, remote main at cb6e463 (the owner's post-session-27 "update session log" commit — pulled at this session's start), fast-forward confirmed (cb6e463..36104e2).
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: cb6e463..36104e2 HEAD -> main; wrapper verified refs/heads/main @ 36104e2 == local HEAD and synced refs/remotes/origin/main.
- Operator key shredded (random-overwrite + remove); the wrapper's own temp key + known_hosts sidecar shredded by the wrapper; working tree clean; git status agrees with the remote.

Stage Summary:
- Commit 36104e2 (21 files: 5 source + 2 specs + 8 docs + 5 screenshots + 1 script) pushed to main and verified on the remote.
- No secrets in the tree; key material destroyed post-push.

---
Task ID: 29
Agent: Super Z (main agent, session 29)
Task: Session 29 — deployed-mirror verification + live-source re-measure → the restaurant-band + map-card parity (TDD).

Work Log:
- Workspace re-cloned (sandbox reset); every root doc re-read + the session-28 plan + the worklog + docs/session_30.md + docs/session_31.md + the start-server log; the codebase state re-validated (env DATABASE_URL="file:../db/custom.db" with db/ at the repo root, vitest + playwright configs working, skills exclusion); the baseline gate run on the untouched tree: lint ✓ (2 pre-existing warnings) · typecheck ✓ · 42 unit ✓ · build ✓ · 27/27 smoke ✓ · 69/69 E2E ✓. The scandihaven reference repo reviewed for the shared tech-stack patterns.
- Deployed-mirror audit (activity-map.jesspete.shop, logged in): REDEPLOYED WITH THE SESSION-28 CODE — verified by DOM signature (the date-range popover 510×369 with the mb-2 grid gap-2 sm:grid-cols-2 header of self-contained 238×50 field pills carrying calendar icons, NO Done button). Functionally ALL GREEN: zero console errors across every page; the mobile navbar end-to-end (52px border-box tab-bar, 12px links, tap navigation through the MapPin icon); the favourites round-trip; the booking round-trip ("Request sent" + visible under Profile); the legal routes.
- Live-source re-measure (activity-map.base44.app, logged in at 1280/640/390): every session-24→28 surface re-verified UNCHANGED (the popover, the stay pills 34px + borders, the browse chips + card rating pills 56×28, the detail structure, the mobile nav at 390/640, the sights pills at 640) — then the DESKTOP RESTAURANT BAND swept as a whole for the first time since session 6 + the map list-card chrome + the map stats pills + the detail hero rating pill. Findings F1–F8: the band heading layer (a sticky vertically+horizontally CENTERED column — the h2 clamp(46px,7vw,104px) lh 1.02 tracking −0.055em text-center + the white View All pill BELOW at gap 24: h 44, pad 0/24, 13px/600, tracking 0.02em — that FADES OUT through the first ~45% of the trap); the names watermark (a centered FIVE-NAME sliding window — 2 before + the active + 2 after, circular wrap — at uniform Inter clamp(24px,2.6vw,40px) 400, tracking −0.02em, gap 34, the active solid white / the rest white/0.32, the row centering AS A GROUP); the featured card (the compact centered model — min-w 330 at bottom-[9vh], pad 16, r 28, bg white/0.08 + the 1px white/0.16 border + blur 18 + the 0 18 48 /0.35 shadow, text-center: the address 12px tracking 0.04em white/0.56 + the centered meta gap 14 at 13px (€ + the 4px dot + ★★★★★ gold #F7D774 + the rating) + two flex-1 h-38 12px buttons — Book a Table white + the 1px white/0.28 border, Learn More white/0.08 — NO name inside); the map list-card eyebrow (a CREAM PILL — bg #F8F7F4, full radius, pad 4/10, 26px tall); the map card MapPin neighborhood line (12px, #888580); the map grid gap (12px); the map stats pills (NO shadow); the detail hero rating pill (61×32 — pad 8px 12px, the 14px star).
- Remediation plan written (docs/remediation-plan-session-29.md) and validated against the codebase before execution (the spec insertion points identified).
- TDD RED: all three touched specs verified failing on the unmodified tree (the reworked band contract, the map list-card extensions, the detail rating-pill extension).
- TDD GREEN: R1 the heading layer (the centered column + the cardFade-driven fade); R2 the 5-name window (the circular wrap); R3 the compact featured card (no name, the flex-1 h-38 buttons); R4 the map eyebrow pill + the MapPin line + gap-3; R5 the shadowless stats pills; R6 the 61×32 rating pill. En-route test refinement: the flex-1 equal-width pin needed ±2px tolerance (the fractional flex split rounds 143/145).
- Side-by-side verification on the local server: the band h2 x=142/w=996/center=640 EXACT; the featured card 330×128 (the live 330×130) with the matching chrome; the names window 33.28px uniform Inter; the map card eyebrow 65×26 + the 12px MapPin + the 12px gap; the detail pill 61×32 — every remediated surface within 2px of the live.
- Full gates on the push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 69/69 E2E ✓.
- 43 screenshots (6 new — the band heading + card states, the map list card + grid, the detail rating pill, the mobile map card, VLM-verified via scripts/capture-screens-v10-session29.mjs); .env.example re-verified; docs aligned (README, AGENTS, CLAUDE, PAD v2.8, activity-map_SKILL v1.16.0, the plan, this log, docs/session_32.md).

Stage Summary:
- The mirror verified running the session-28 code ALL GREEN; the live re-measured with the desktop restaurant band swept as a whole + the map card chrome + the stats pills + the rating pill — 8 findings, all remediated to EXACT visible parity.
- Gates: 42 unit + 27 smoke + 69 E2E (the band contract reworked + the map/detail contracts extended) — all green on the push tree.
- 43 screenshots; 8 docs aligned; single conventional commit + SSH-wrapper push to main.

---
Task ID: 29-push
Agent: Super Z (main agent)
Task: Session 29 — push verification record.

Work Log:
- Push infrastructure rebuilt (the workspace had been reset but the shim survived at /home/z/my-project/bin/ssh): paramiko 5.0.0 verified on the venv python (/home/z/.venv/bin/python3 — the shebang of the Appendix-A shim points there), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches every prior session record).
- Secret scan of the staged diff + the new untracked files: 0 new matches (the README/AGENTS/worklog demo-login lines are pre-existing seeded-account documentation; the capture script's demo login follows the established scripts/capture-screens-v9-session28.mjs pattern); 0 SSH key material.
- Dry-run: authenticated, remote main at 8000452 (the owner's post-session-28 "update start server log" commit — pulled at this session's start), fast-forward confirmed (8000452..b98a951).
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: 8000452..b98a951 HEAD -> main; wrapper verified refs/heads/main @ b98a951 == local HEAD and synced refs/remotes/origin/main.
- Operator key shredded (random-overwrite + remove); the wrapper's own temp key + known_hosts sidecar shredded by the wrapper; working tree clean; git status agrees with the remote.

Stage Summary:
- Commit b98a951 (20 files: 3 source + 2 specs + 8 docs + 6 screenshots + 1 script) pushed to main and verified on the remote.
- No secrets in the tree; key material destroyed post-push.

---
Task ID: 30
Agent: Super Z (main agent, session 30)
Task: Session 30 — deployed-mirror verification + live-source re-measure → the 404 surfaces + map pin/zoom parity (TDD).

Work Log:
- Workspace re-cloned (sandbox reset); every root doc re-read + the session-29 plan + the worklog + docs/session_32.md + docs/session_33.md + the start-server log; the codebase state re-validated (env DATABASE_URL="file:../db/custom.db" with db/ recreated at the repo root via db:push + db:seed, vitest + playwright configs working, skills exclusion); the baseline gate run on the untouched tree: lint ✓ (2 pre-existing warnings) · typecheck ✓ · 42 unit ✓ · build ✓ · 27/27 smoke ✓ · 69/69 E2E ✓. The scandihaven reference repo reviewed for the shared tech-stack patterns (six-phase workflow, TDD at seams, Tailwind v4 CSS-first rules).
- Deployed-mirror audit (activity-map.jesspete.shop, logged in): REDEPLOYED WITH THE SESSION-29 CODE — verified by DOM signature (the band heading column h2 x=142/center=640 + the five 33.28px Inter names + the 330px compact card with pad 16/border 1px/blur 18/h-38 buttons + the map cream-pill eyebrow 65×26 + the 61×32 detail pill). Functionally ALL GREEN: zero console errors across every page; the mobile navbar end-to-end (52px border-box tab-bar, 12px spans at −0.12px tracking, tap navigation with the active state moving, the MapPin/Heart/User icon actions); the favourites round-trip; the booking round-trip ("Request sent" via the native-setter fill + visible under Profile → My bookings).
- Live-source re-measure (activity-map.base44.app, logged in at 1280/640/390): every session-24→29 surface re-verified UNCHANGED (the planner pill chrome 548×56 + the 510×371 popover — synthetic clicks need the FULL pointer event sequence to open it; the band trio; the map cards/stats; the detail pill; the mobile nav/planner card/detail/favourites/eat headings; the legal pages; the home h1 115.2px y=290; the sights/stay grids; the category-pill filtering; the About pills) — then the TWO 404 SURFACES swept for the first time + the map pin/zoom chrome re-swept below the session-3/8 models. Findings F1–F5: the place-404 (an in-app design inside the chrome — min-h-screen bg #F8F7F4 px-5 py-24 text-center with the 46px Libre Baskerville ink "Place not found" h1 + the 44px ink "Back to Do" pill → /do, nav + footer present); the generic 404 (the platform's chrome-less slate page — bg-slate-50, the 72px font-light slate-300 "404", the 64×2 slate-200 divider, "Page Not Found" 24px slate-800, the quoted path, the white bordered r-8 "Go Home" button → /); the map zoom controls (two separated CIRCULAR 34×34 buttons — r999, 1px rgba(14,14,14,0.1), 22px/700 ink glyphs, stack gap 8, at (10,10)); the pin model (12px ink dots — #0E0E0E, 2px white border, r50%, the 0 4px 10px /0.16 shadow, the 180ms cubic-bezier(0.22,1,0.36,1) transition, hover scale 1.32 + the deeper shadow — each carrying a hover-reveal white NAME-LABEL pill 106×31 with a 5px ::after triangle; NO violet state in the live's CSS at all); the pin click (direct navigation to /place/map-brass-marble — no popup).
- Remediation plan written (docs/remediation-plan-session-30.md) and validated against the codebase before execution (the route-level not-found insertion point, the LeafletCanvas/MapExplorer seams, the globals.css marker block, no popup/violet pins in the specs).
- TDD RED: both touched specs verified failing on the unmodified tree (the extended map contract in browse.spec.ts + the new not-found.spec.ts).
- TDD GREEN: R1 the place-404 ((app)/place/[slug]/not-found.tsx inside the app chrome); R2 the slate generic 404 (usePathname quotes the attempted path); R3 the circular zoom pair (globals.css + !important — Leaflet's bundled CSS loads after globals.css in the chunk order, mirroring the live's own override block); R4 the pin model (the 12px dot + the label pill with the triangle); R5 the pin-click navigation (router.push via a stable ref; the popup + the selected-place card + the "Tap a dot" hint removed as clone inventions; the ?place= deep-link keeps its flyTo). En-route lessons: a rewritten .roam-marker span MUST set display: block (an inline span ignores width/height — the first rebuild rendered 4×18 remnants); the label's line-height: 1 dropped for the live's 31px pill; Chromium 153 serializes slate colors as lab() — even through a canvas fillStyle — so the slate assertions sample the painted PIXEL via getImageData with ±2-per-channel tolerance.
- Side-by-side verification on the dev server: every remediated surface EXACT (the place-404 46px + 44px pill with chrome; the slate 404 72px/300 + 24px/500 + r8 Go Home chrome-less; the zoom pair 34×34 r999 gap 8; the marker 12×12 + the 106×31 label pill; the pin click landing on /place/map-brass-marble with no popup).
- Full gates on the push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 71/71 E2E ✓ (the new not-found spec + the extended map contract; every prior pin green — re-run after the final label tweak).
- 49 screenshots (6 new — the two 404s, the zoom pair + pins, the pin labels, the pin-click navigation, the mobile map, VLM-verified via scripts/capture-screens-v11-session30.mjs with tile/marker waits + canvas scroll-into-view; CARTO served API-KEY-REQUIRED watermark tiles to the whole sandbox at capture time — the live equally affected, documented); .env.example re-verified; docs aligned (README, AGENTS, CLAUDE, PAD v2.9, activity-map_SKILL v1.17.0, the plan, the worklog, docs/session_34.md).

Stage Summary:
- The mirror verified running the session-29 code ALL GREEN; the live re-measured with the two 404 surfaces swept for the first time + the map pin/zoom chrome re-swept — 5 findings, all remediated to EXACT visible parity.
- Gates: 42 unit + 27 smoke + 71 E2E (the new not-found spec + the extended map contract) — all green on the push tree.
- 49 screenshots; 9 docs aligned; single conventional commit + SSH-wrapper push to main.

---
Task ID: 30-push
Agent: Super Z (main agent)
Task: Session 30 — push verification record.

Work Log:
- Push infrastructure rebuilt from scratch (the workspace had been reset): paramiko 5.0.0 installed on the venv python (/home/z/.venv/bin/python3 — the shebang of the Appendix-A shim points there), the shim extracted from the runbook to /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches every prior session record).
- Secret scan of the staged diff + the new untracked files: 0 new matches (the README/AGENTS/worklog/spec demo-login lines are pre-existing seeded-account documentation; the capture script's demo login follows the established scripts/capture-screens-v10-session29.mjs pattern); 0 SSH key material.
- Dry-run: authenticated, remote main at 47ba2be (the owner's post-session-29 "update session log" commit — pulled at this session's start), fast-forward confirmed (47ba2be..efdf768).
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: 47ba2be..efdf768 HEAD -> main; wrapper verified refs/heads/main @ efdf768 == local HEAD and synced refs/remotes/origin/main.
- Operator key shredded (random-overwrite + remove); the wrapper's own temp key + known_hosts sidecar shredded by the wrapper; working tree clean; git status agrees with the remote.

Stage Summary:
- Commit efdf768 (22 files: 4 source + 2 specs + 9 docs + 6 screenshots + 1 script) pushed to main and verified on the remote.
- No secrets in the tree; key material destroyed post-push.

---
Task ID: 31
Agent: Super Z (main agent, session 31)
Task: Session 31 — deployed-mirror verification + live-source re-measure → the 404 hydration fix + the hero vh-model + the vibe centering + the showcase parallax (TDD).

Work Log:
- Workspace re-cloned (sandbox reset); every root doc re-read + the session-30 plan + the worklog + docs/session_34.md + docs/session_35.md (the raw session-30 conversation log) + the start-server log; the codebase state re-validated (env DATABASE_URL="file:../db/custom.db" with db/ recreated at the repo root via db:push + db:seed, vitest + playwright configs working, skills exclusion); the baseline gate run on the untouched tree: lint ✓ (2 pre-existing warnings) · typecheck ✓ · 42 unit ✓ · build ✓ · 27/27 smoke ✓ · 71/71 E2E ✓. The scandihaven reference repo reviewed for the shared tech-stack patterns.
- Deployed-mirror audit (activity-map.jesspete.shop, logged in): REDEPLOYED WITH THE SESSION-30 CODE — verified by DOM signature (the place-404 46px+44px pill inside the chrome; the slate generic 404 72px/300 chrome-less; the map zoom pair 2× 34×34 r999 gap 8 700-weight; the pin model 9× 12px ink dots r50% 2px white border + the 106×31 "Brass & Marble" label; the pin-click navigation). Functionally ALL GREEN: zero console errors across every page (swept fresh-browser per page — the agent-browser error list ACCUMULATES across navigations, an en-route lesson); the mobile navbar end-to-end at 390 (52px border-box cream-glass tab-bar blur(24) saturate(1.5), 12px link spans, the active state moving on tap, the icons at x 304/330/356); the favourites round-trip; the booking round-trip ("Request sent" via the native-setter fill + visible under Profile → My bookings). ONE BUG: the generic 404 threw React #418 on every visit (reproduced on the local production build).
- Live-source re-measure (activity-map.base44.app, logged in at 1280×{720,800,900} / 900×800 / 768×{720,800,900} / 640×844 / 390×844): every session-24→30 surface re-verified UNCHANGED (the planner pill 548×56 + the popover, the mobile nav/planner/detail/favourites surfaces, the place detail h1 82px y≈225 + the 61×32 rating pill, the map pins/zoom/stats/cards, the browse chips 38px 12/600 + the cards 392×564 r-28 + the 0 18 44 shadows, the band h2 89.6 x=142 w=996, the sights/stay grids 360²/381² + the 1120/1178 grids, the sights h2 83.2 center, the footer pt-64/pb-56 + the hairline legal, the legal pages 48px h1s, BOTH 404 designs, the mobile category carousel EXACT at 390: card y=577 x=18 306×226, VA y=754) — then three drifts: F2 the hero redesigned to a VIEWPORT-HEIGHT-RELATIVE model (the section min-h-100vh + mt −80 with content-driven heights 577+0.3vh at md / 714+0.28vh at lg; the bg top calc(-80px+0.25vh) / height calc(100%+72px) with border-radius 32 32 60% 60% / 32 32 80 80 at md+ and 0 0 42% 42% / 0 0 48 48 on phones; the content margin-top calc(5rem+28vh); the h1 −translate-y-1.5; the pill mt-4; the mobile h1 clamp(32px,9.2vw,38px) CAPPED at 38 — the clone's uncapped 9vw rendered 57.6px at 640 vs the live's 38; NO shade/blend overlays — the raw image, pixel-verified); F3 the vibe heading CENTER-ALIGNED (the h2 box 1203 @x=38 with margins 20.4 auto inside the px-18 container — the exact line breaks "…Select / …Your / Getaway" at x=123/136/263); F4 the home showcase images carrying the 1.16 zoom + scroll parallax (the stays' imgs translateY(8%) scale(1.16) with the ty interpolating ±8% clamped; the sights' imgs in oversized -inset-y-16% wrappers carrying the parallax; NO hover change — the live's transform/filter sit still; the /stay BROWSE cards transform-free).
- Remediation plan written (docs/remediation-plan-session-31.md) and validated against the codebase before execution (the not-found/home spec insertion points, the Hero/StayCard/StayShowcase/HighlightedSights seams, the globals.css override block).
- TDD RED: all touched specs verified failing on the unmodified tree (the zero-console-errors 404 assertion, the hero 900vh + md + radius + pill-gap contracts, the new mobile-cap test, the vibe center, the showcase transforms).
- TDD GREEN: R1 the 404 fix via useSyncExternalStore reading window.location (getServerSnapshot "" — the server render and the hydration pass both carry "", the real path swaps in after mount; the mount-gated useState+useEffect first draft was rejected by the new react-hooks/set-state-in-effect lint rule); R2 the Hero vh-model rewrite + the globals.css max-width-767px !important block + the dead @utility hero-shade removed; R3 the vibe px-[18px] + text-center + mx-auto max-w-[94vw] (the en-route lesson: the first text-center-only pass produced wider line breaks than the live — the 1203px h2 box is part of the contract); R4 the shared useParallax() hook + the StayCard home-variant transform + the sights' oversized wrappers (both sections became client components).
- Side-by-side verification on the dev server: the hero EXACT at 1280×900 (h1 y=319, section −7/966, bg −85/1038, the radius string, the pill 456), at 1280×800 (h1 290/291, section 938), at 390×844 (h1 203/35.88px, section 591, the radius, the pill 365), the 640 cap 38px; the vibe heading line-for-line EXACT (all three line centers at exactly x=640); the parallax interpolating +41.7 → +13.5 → −32.5; the VLM hero comparison found "no discernible differences — 0px"; the 404 zero console errors verified on the production build.
- Full gates on the push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 73/73 E2E ✓ (the new zero-console-errors 404 spec + the hero mobile-cap test + the extended hero/vibe/showcase contracts).
- 57 screenshots (8 new — the vh-model hero at 900/800, the mobile hero at 390, the capped 640 h1, the centered vibe, the stay parallax zoom, the sights oversize crop, the hydration-clean 404, VLM-verified via scripts/capture-screens-v12-session31.mjs); .env.example re-verified; docs aligned (README, AGENTS, CLAUDE, PAD v2.10, activity-map_SKILL v1.18.0, the plan, this log, docs/session_36.md).

Stage Summary:
- The mirror verified running the session-30 code ALL GREEN except ONE real bug (the generic 404's React #418 hydration error) — fixed via the useSyncExternalStore client-only-value pattern.
- The live re-measured at five viewport sizes — three drifts (the hero vh-model redesign + the vibe centering + the showcase parallax), all remediated to EXACT visible parity (the hero tracks the viewport height; the vibe line breaks match the live to the pixel).
- Gates: 42 unit + 27 smoke + 73 E2E — all green on the push tree.
- 57 screenshots; 9 docs aligned; single conventional commit + SSH-wrapper push to main.

---
Task ID: 31-push
Agent: Super Z (main agent)
Task: Session 31 — push verification record.

Work Log:
- Push infrastructure rebuilt from scratch (the workspace had been reset): paramiko 5.0.0 installed on the venv python (/home/z/.venv/bin/python3 — the shebang of the Appendix-A shim points there), the shim extracted from the runbook to /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches every prior session record).
- Secret scan of the staged diff + the new untracked files: 0 new matches (the README/AGENTS/worklog/spec demo-login lines are pre-existing seeded-account documentation; the capture script's demo login follows the established scripts/capture-screens-v11-session30.mjs pattern); 0 SSH key material.
- Dry-run: authenticated, remote main at 37f740f (the owner's post-session-30 "update session log" commit — pulled at this session's start), fast-forward confirmed (37f740f..38c70f4).
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: 37f740f..38c70f4 HEAD -> main; wrapper verified refs/heads/main @ 38c70f4 == local HEAD and synced refs/remotes/origin/main.
- Operator key shredded (random-overwrite + remove); the wrapper's own temp key + known_hosts sidecar shredded by the wrapper; working tree clean; git status agrees with the remote.

Stage Summary:
- Commit 38c70f4 (26 files: 6 source + 2 specs + 9 docs + 8 screenshots + 1 script) pushed to main and verified on the remote.
- No secrets in the tree; key material destroyed post-push.

---
Task ID: 32
Agent: Super Z (main agent, session 32)
Task: Session 32 — deployed-mirror verification + live-source re-measure → the mobile nav link-group shrink-wrap + the desktop footer-pill growth (TDD).

Work Log:
- Workspace refreshed via git pull (the owner's 440fa17 "update session log" — docs/session_37.md, the raw session-31 conversation log — plus the updated docs/start_server_log.txt showing the mirror REDEPLOYED with the session-31 production code); every root doc re-read + the session-31 plan + the worklog + docs/session_36.md + docs/session_37.md + the start-server log; the codebase state re-validated (env DATABASE_URL="file:../db/custom.db" with db/custom.db at the repo root, vitest + playwright configs working, skills exclusion); the baseline gate run on the untouched tree: lint ✓ (2 pre-existing warnings) · typecheck ✓ · 42 unit ✓ · build ✓ · 27/27 smoke ✓ · 73/73 E2E ✓.
- Deployed-mirror audit (activity-map.jesspete.shop, logged in): REDEPLOYED WITH THE SESSION-31 CODE — verified by DOM signature (the vh-model hero h1 y=319 at 1280×900 with the radius string, the centered vibe 1203 @x=38, the showcase parallax matrix(1.16), the generic 404 hydration-clean with zero errors). Functionally ALL GREEN: zero console errors swept across 11 pages; the mobile navbar end-to-end at 390 (the 52px border-box glass tab-bar, the 12px link spans, the icons at x 304/330/356, tap navigation with the active state moving, the icon actions); the favourites round-trip; the booking round-trip ("Request sent" via the native-setter fill + visible under Profile → My bookings). NO BUGS FOUND.
- Live-source re-measure (activity-map.base44.app, logged in at 1280×900 / 768×844 / 640×844 / 390×844): every session-24→31 surface re-verified UNCHANGED (the hero vh-model EXACT at 1280×900 + 390; the vibe centering + the parallax; the planner pill 548×56; the mobile planner card 358×124 at the 126px gap; the mobile category carousel ±1px; the desktop category cards 263×215 @ 232/509/786 — an earlier padded-inner-div mis-read corrected by the ARTICLE-level measurement; the desktop pill links EXACT at 433/559/639/727/805; the band 89.6px x=142 w=996; the browse h1 y=169 + the 38px/12/600 chips + the 392×564 cards; the detail h1 y=226/82px + the 61×32 pill + the 89×36 Back; the map zoom pair + the 9 pins; BOTH 404 designs; the footer legal row; the MOBILE footer pill EXACT) — then TWO DRIFTS: F1 the mobile tab-bar's middle link group now SHRINK-WRAPPED (min-w-0 mr-2, no flex-1 — the four text links at 121/192/222/259 @390 + 246/317/347/384 @640, 4px left of the clone's flex-1-centered group; every nav link carrying the platform's press-shrink feedback + 44px min-height tap targets; the nav h-12 at y=2 inside the same 52px border-box header); F2 the desktop footer pill GREW at md+ (646×118, was 506×96 — radius 34, pad 12/16, gap 12, the links 92×92 tiles with 24px icons over 12px/600 labels in one row of six; the MOBILE pill unchanged and verified EXACT).
- Remediation plan written (docs/remediation-plan-session-32.md) and validated against the codebase before execution (the spec insertion points, the Navbar middle-group seam, the SiteFooter pill classes, the globals.css utility block).
- TDD RED: all touched specs verified failing on the unmodified tree (the shrink-wrapped link positions at 390 + 640, the press-shrink contract, the updated footer test).
- TDD GREEN: R1 the middle group dropped flex-1 for mr-2 md:mr-0 (the no-scrollbar safety valve stays) + the press-shrink @utility + the UNLAYERED :active rule in globals.css on every nav link + the 200ms color transition MOVED to the label span (the live's own split — two transition shorthands on one element are competing declarations); R2 the footer's md+ growth (md:rounded-[34px] md:gap-3 md:py-3 md:px-4 + the md:h-[92px] md:w-[92px] tiles with md:h-6 md:w-6 icons over md:text-[12px] labels). En-route spec fix: the first text-link filter required an svg-less anchor — the clone's text links carry HIDDEN desktop icons, so the selection moved to label-based lookups.
- Side-by-side verification on the local production build AND the dev server: the mobile nav links 121/192/222/259 @390 + 246/317/347/384 @640 — EXACT against the live; the desktop footer pill 646×118 @x=317, r-34, pad 12/16, gap 12, the 92×92 tiles with 24px icons + 12px/600 labels — EXACT; the mobile footer 350×182/r-28/pad 8/10/gap 8/104×78 — unchanged and exact.
- Full gates on the push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 76/76 E2E ✓ (the new shrink-wrap + press-shrink + footer contracts; the whole suite re-run with zero regressions).
- 61 screenshots (4 new — the shrink-wrapped mobile nav at 390 + 640, the grown 646×118 desktop footer pill, the unchanged mobile footer for the record — captured via scripts/capture-screens-v13-session32.mjs against the dev server, the rendered geometry re-verified on the captured state); .env.example re-verified; docs aligned (README, AGENTS, CLAUDE, PAD v2.11, activity-map_SKILL v1.19.0, the plan, this log, docs/session_38.md).

Stage Summary:
- The mirror verified running the session-31 code ALL GREEN (no bugs); the live re-measured with two drifts (the mobile nav link-group shrink-wrap + press feedback, the desktop footer pill growth) — both remediated to EXACT visible parity.
- Gates: 42 unit + 27 smoke + 76 E2E (the shrink-wrap position tests at 390/640 + the press-shrink contract + the updated footer test) — all green on the push tree.
- 61 screenshots; 9 docs aligned; single conventional commit + SSH-wrapper push to main.

---
Task ID: 32-push
Agent: Super Z (main agent)
Task: Session 32 — push verification record.

Work Log:
- Push infrastructure reused from the surviving workspace: the paramiko shim at /home/z/my-project/bin/ssh (shebang /home/z/.venv/bin/python3, paramiko 5.0.0 verified), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches every prior session record).
- Secret scan of the staged diff + the new untracked files: 0 private-key material, 0 GitHub tokens; the 3 "sepnetflix" matches are the pre-existing seeded-account documentation lines (AGENTS/CLAUDE demo-login, following every prior session's precedent) + the screenshot PNG's rendered avatar initial.
- Dry-run: authenticated, remote main at 440fa17 (the owner's post-session-31 "update session log" commit — pulled at this session's start), fast-forward confirmed (440fa17..8d588bf).
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: 440fa17..8d588bf HEAD -> main; wrapper verified refs/heads/main @ 8d588bf == local HEAD and synced refs/remotes/origin/main.
- Operator key shredded (random-overwrite + remove); the wrapper's own temp key + known_hosts sidecar shredded by the wrapper; working tree clean; git status agrees with the remote.

Stage Summary:
- Commit 8d588bf (18 files: 3 source + 2 specs + 7 docs + 4 screenshots + 1 script + the plan) pushed to main and verified on the remote.
- No secrets in the tree; key material destroyed post-push.

---
Task ID: 33
Agent: Super Z (main agent, session 33)
Task: Session 33 — deployed-mirror verification + live-source re-measure → the footer's scroll-linked pill growth + the link hover treatment (TDD).

Work Log:
- Workspace re-cloned from scratch (the sandbox had been reset; the repo brought in at 2432bc9, the owner's post-session-32 "update session log" commit carrying docs/session_38.md + docs/session_39.md); every root doc re-read + the session-32 plan + the worklog + the start-server log; the scandihaven reference repo re-cloned and its doc patterns re-verified; the codebase state re-validated (env DATABASE_URL="file:../db/custom.db" with db/custom.db re-created at the repo root via db:push + db:seed, vitest + playwright configs working, skills exclusion); the baseline gate run on the untouched tree: lint ✓ (2 pre-existing warnings) · typecheck ✓ · 42 unit ✓ · build ✓ · 27/27 smoke ✓ · 76/76 E2E ✓.
- Deployed-mirror audit (activity-map.jesspete.shop, logged in): REDEPLOYED WITH THE SESSION-32 CODE — verified by DOM signature (the desktop footer pill 646×118 @x=317 with the 92×92 tiles + 24px icons + 12px/600 labels; the mobile nav shrink-wrap 121/192/222/259 at 390 + 246/317/347/384 at 640; press-shrink on every link; the 52px border-box tab-bar). Functionally ALL GREEN: zero console errors swept across 11 pages; the mobile navbar end-to-end at 390 (tap navigation with the active state moving, the MapPin/Heart/User icon actions); the favourites round-trip (save → card → unsave → empty); the booking round-trip (native-setter fill → "Request sent" → visible under Profile → My bookings). NO BUGS FOUND.
- Live-source re-measure (activity-map.base44.app, logged in at 1280×900 / 768×844 / 640×844 / 390×844): every session-24→32 surface re-verified UNCHANGED (the hero vh-model EXACT at both breakpoints; the vibe centering + the parallax; the planner pill; the mobile planner card + the category carousel; the desktop category cards + the floating pill + the band; the browse/detail/map/404s; the footer legal row + pads; the MOBILE footer pill EXACT; the home stay pills + the route time pills; the favourites + the profile) — then the FOOTER BLOCK swept at MULTIPLE SCROLL POSITIONS for the first time, with FOUR findings: F1 the desktop pill's growth is SCROLL-LINKED and CONTINUOUS — compact (506×96, gap 8, r-28, pad 8/10, links 74×78 r-18, icons 20px, labels 11px) while the footer is offscreen, interpolating LINEARLY with the footer's visible fraction p (gap 8+4p, pad (8+4p)/(10+6p), radius 28+6p, links 74+18p × 78+14p r-(18+6p), icons 20+4p, labels 11+1p — fit to ±0.02 across 10 sampled scroll positions; the pill caught mid-interpolation at 537px exposed the continuous driver — the first page-top read of 506×96 had looked like a REVERSION of the session-32 growth) reaching the grown 646×118 (gap 12, r-34, pad 12/16, links 92×92 r-24, icons 24px, labels 12px) when fully visible, compacting back when it leaves, smoothed by 120ms linear transitions (the pill: gap/padding/border-radius; the link: width/height/border-radius + the 300ms hover entries); below md the pill NEVER grows (static, transition none); F2 the links' VIOLET hover at both breakpoints (matrix(1.1, 0, 0, 1.1, 0, -12) over the #571AFF fill + white text + the 0 16px 34px /0.28 glow + the svg's own group-hover scale 1.1 with transition-transform duration-300); F3 the pill's soft 0 2px 12px rgba(14,14,14,0.08) shadow at both breakpoints; F4 the icons' stroke-width 2.1 + the labels' tracking −0.01em + the grown link radius 24px.
- Remediation plan written (docs/remediation-plan-session-33.md) and validated against the codebase before execution (the spec insertion points, the SiteFooter class seams, the globals.css utility block, the hover-property model).
- TDD RED: the footer test rewritten with the session-33 contract (the compact block at page load; the transition lists; the pill shadow; the stroke-width + the tracking; the grown block post-scroll with the link radius 24; the hover matrix + the svg scale; the half-visibility interpolation midpoint; the mobile static model + the link hover + the mobile link transition list) — verified failing on the unmodified tree (646 ≠ 500–512 at the first assertion).
- TDD GREEN: R1 the scroll-linked growth — SiteFooter.tsx became a client component (a rAF-throttled passive scroll/resize listener writes the --footer-p CSS var = the footer's visible fraction clamped 0–1; SSR renders p=0, the live's own initial compact state); the md+ arbitrary-value calc classes interpolate the geometry (gap 8+4p, pad (8+4p)/(10+6p), radius 28+6p, links 74+18p × 78+14p r-18+6p, icons 20+4p, labels 11+1p); globals.css gained the footer-pill-transition utility (used as md:footer-pill-transition) + the footer-link-transition utility (the mobile 4-prop hover list) with the UNLAYERED md media override composing the growth entries — the live's own lists; the mobile classes untouched (the var inert below md; a base transition-none added so the mobile pill reads "none" like the live — Chrome's initial value is "all"). R2 the hover + the chrome details — the footer-link-hover utility (the composed ONE-MATRIX transform: translateY(-12px) scale(1.1) + the #571AFF fill + white text + the violet glow — NOT v4's separate translate/scale properties, which would escape the transform transition entry and read differently in the computed style; the svg's own &:hover > svg { scale: 1.1 } — unguarded like the live's classes, NOT v4's @media(hover:hover)-wrapped group-hover, which would not apply on touch-capable probes where the live's does); the icons' strokeWidth 2.1; the labels' tracking-[-0.01em]; the pill's shadow + md:items-end. En-route spec fixes: the transition assertions needed SECONDS serialization ("0.12s" not "120ms" — Chromium's computed shorthand); the interpolation midpoint needed page.mouse.move(0, 0) + a 400ms settle first (the lingering hover's 1.1 scale inflated the mid-transition link width to 85.13 — the full-suite flake, fixed).
- Side-by-side verification on the dev server at the same scroll states as the live: the compact 506×96/gap 8/pad 8/10/r-28/links 74×78 r-18/icons 20/labels 11 — EXACT; the mid-growth gap 9.9992/link 83×85 at the footer's half-visibility — EXACT (the live 9.976/83/85); the grown 646×118/gap 11.996/pad 12/16/r-33.994/links 92×92 r-23.994/icons 24/labels 11.999 — EXACT; the hover matrix(1.1, 0, 0, 1.1, 0, -12) over rgb(87, 26, 255) with the rgba(87, 26, 255, 0.28) 0px 16px 34px glow + the svg scale 1.1 — EXACT.
- Full gates on the push tree: lint ✓ typecheck ✓ 42 unit ✓ build ✓ 27/27 smoke ✓ 76/76 E2E ✓ (the rewritten footer contract: the compact-at-load + the transition lists + the shadow + the stroke/tracking + the grown + the link-radius-24 + the hover matrix + the interpolation midpoint + the mobile static model; the whole suite re-run — zero regressions).
- 66 screenshots (5 new — the compact 506×96 offscreen-model pill, the mid-growth interpolation at the footer's half-visibility, the grown 646×118 pill, the violet link hover, the mobile footer with the shadow — captured via scripts/capture-screens-v14-session33.mjs against the dev server, the rendered geometry re-verified on the captured state via scripts/verify-captures-v14-session33.mjs: compact 506/74, mid gap 10.00/link 83, grown 646, hover matrix+violet — all OK); .env.example re-verified; docs aligned (README, AGENTS, CLAUDE, PAD v2.12, activity-map_SKILL v1.20.0, the plan, this log, docs/session_40.md).

Stage Summary:
- The mirror verified running the session-32 code ALL GREEN (no bugs); the live re-measured with the footer block swept at multiple scroll positions — four findings (the scroll-linked continuous pill growth, the violet link hover, the pill's soft shadow, the icon/label chrome) — all remediated to EXACT measured parity.
- Gates: 42 unit + 27 smoke + 76 E2E (the rewritten footer contract with the interpolation midpoint pin) — all green on the push tree.
- 66 screenshots; 9 docs aligned; single conventional commit + SSH-wrapper push to main.

---
Task ID: 33-push
Agent: Super Z (main agent, session 33)
Task: Session 33 — push verification record.

Work Log:
- Push infrastructure rebuilt from scratch (the workspace had been reset): paramiko 5.0.0 installed on the venv python (/home/z/.venv/bin/python3 — the shebang of the Appendix-A shim points there), the shim extracted from the runbook to /home/z/my-project/bin/ssh (outside the repo), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g (matches every prior session record).
- Secret scan of the staged diff + the new untracked files: 0 private-key material, 0 GitHub tokens; the 3 "sepnetflix" matches are the pre-existing seeded-account documentation lines (AGENTS/CLAUDE demo-login, following every prior session's precedent) + the capture script's demo login (the established scripts/capture-screens-v13-session32.mjs pattern).
- Dry-run: authenticated, remote main at 2432bc9 (the owner's post-session-32 "update session log" commit — the repo state at this session's clone), fast-forward confirmed (2432bc9..4f0fc97).
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map.git: 2432bc9..4f0fc97 HEAD -> main; wrapper verified refs/heads/main @ 4f0fc97 == local HEAD and synced refs/remotes/origin/main.
- Operator key shredded (random-overwrite + remove); the wrapper's own temp key + known_hosts sidecar shredded by the wrapper; working tree clean; git status agrees with the remote.

Stage Summary:
- Commit 4f0fc97 (18 files: 2 source + 1 spec + 8 docs + 5 screenshots + 2 scripts + the plan) pushed to main and verified on the remote.
- No secrets in the tree; key material destroyed post-push.

---
Task ID: 35
Agent: Super Z (main agent, session 35)
Task: Session 35 — audit + remediate the operator commits (the grok npm-runtime port + the image cleanup), re-verify parity + the full gate, re-capture screenshots, align docs, push to main.

Work Log:
- Baseline gate on the untouched tree: lint ✓ (2 pre-existing warnings) · typecheck ✓ · 48 unit ✓ · build ✓ · 27/27 smoke ✓ · E2E 75/76 once (the mobile-nav position font-timing race — Highlights 115 vs 121, the Inter webfont not yet loaded at measurement), then 76/76 + green in isolation.
- Audit findings A1–A15 written into docs/remediation-plan-session-35.md and validated against the codebase before execution (insertion points, dependency usage, script modes, env var references).
- R0/R1 TDD: the hostile-env probe RED (the unpinned db:push/db:seed wrote the DB one level above the repo under the sandbox's exported absolute DATABASE_URL + the stray parent .env) → GREEN after restoring the inline pinning on dev/start/db:push/db:seed (the fully-seeded 118784-byte <repo>/db/custom.db under the hostile env).
- R2: the parity toolchain restored via npm (tailwindcss 4.3.3, @tailwindcss/postcss 4.3.3, next 16.3.7, react/react-dom 19.3.0; @playwright/test + vitest + @types/leaflet back to devDependencies; tsx kept in deps for the deployment's db:seed; package-lock.json regenerated — never hand-edited).
- R3: the mobile-navigation specs (the 390 + 640 shrink-wrap + the desktop pill) await document.fonts.ready before measuring; 76/76 E2E across THREE consecutive full-suite runs since.
- R4: drizzle.config.json, src/db/, bun.lock, and the drizzle-orm/drizzle-kit/pg/@types/pg/dotenv deps removed (zero src imports verified first).
- R5/R6/R7/R8: the script exec bits restored; install_packages.sh re-aligned to package.json; .env/.env.example matched to the code (DATABASE_URL="file:../db/custom.db" with the npm story; NEXT_PUBLIC_SITE_URL documented as load-bearing for cookieSecureFlag; the dead SITE_URL dropped); the vitest.config.ts header comment fixed to the real seams.
- A15 en-route (fixed): the smoke script orphaned the renamed next-server worker (pkill -f "next start" misses it; kill $SRV only kills the npx wrapper) — a spent-limiter orphan on :3000 failed the next run 13/27 with phantom 429/401s; now killed by PORT (ss-based kill_port; lsof blind in this sandbox) at the clean-slate AND the shutdown; verified 27/27 ×2 back-to-back with the port free after each.
- R9: 16 dev-server screenshots captured into docs/screenshots/ via scripts/capture-screens-session35.mjs (+part2) against npm run dev; the README's screenshot narrative + image links rewritten to the new set (the cleanup commit had deleted all 66 old captures while the README still referenced them). En-route lesson encoded in the script: a Playwright fill on a not-yet-hydrated React form is silently reset by hydration — go straight to /login, settle, and VERIFY the input values before submitting (the observed empty-fields 400).
- R10: README (the session-34/35 rows, 21 client components, npm commands, screenshots), AGENTS.md (npm-first commands + gate order + the next-start note), CLAUDE.md (npm setup + the 48-check pyramid incl. the auth seam), PAD v2.13, activity-map_SKILL.md v1.21.0, docs/DEPLOYMENT.md, the plan's execution record, docs/session_42.md, this worklog.
- Final gate on the push tree: lint ✓ · typecheck ✓ · 48 unit ✓ · build ✓ · 27/27 smoke ✓ ×2 · 76/76 E2E ✓ ×3.

Stage Summary:
- The operator commits audited (15 findings: 3 HIGH — the removed DB pinning (hijack reproduced), the toolchain downgrades, the deleted screenshots; the good npm-port changes kept); everything remediated to the documented baseline with evidence.
- Parity re-verified on both sites (the mirror all green running the session-33 code; the live unchanged at every swept signature); the mobile navigation menu confirmed working exactly as expected at 390/640/1280.
- Gates: 48 unit + 27 smoke ×2 + 76 E2E ×3 — all green; 16 screenshots; 9 docs aligned; single conventional commit + SSH-wrapper push to main.

---
Task ID: 36
Agent: Super Z (main agent, session 36)
Task: Session 36 — verify the parity baseline + audit the tree at ae20598 → dep hygiene + the npm-audit fix (TDD) → screenshots, docs, push to main.

Work Log:
- Workspace re-cloned from scratch at ae20598 (the owner's post-session-35 start-server-log commit: the npm allowScripts block — GOOD, kept — + docs/session_43.md + the log refresh; no code changes); every root doc re-read + the session-35 plan/log + the worklog + the start-server log; the scandihaven reference repo re-cloned and its patterns re-verified; the codebase state re-validated (env DATABASE_URL="file:../db/custom.db" with the seeded 118784-byte db/custom.db at the repo root, the vitest + playwright configs working — 48 + 76 checks, skills exclusion).
- Baseline gate on the untouched tree: lint ✓ (2 pre-existing warnings) · typecheck ✓ · 48 unit ✓ · build ✓ · 27/27 smoke ✓ · 76/76 E2E ✓ ON THE FIRST RUN (the session-35 font-ready fix holding). Every session-35 remediation verified INTACT (the pinning, the toolchain, the 16 screenshots + links, the exec bits, no Drizzle, the kill-by-port smoke cleanup).
- Dual-site browser audit: the live source (logged in) UNCHANGED at every swept signature (desktop nav 433/559/639/727/805; mobile 121/192/222/259 @390 + 246/317/347/384 @640 + the 52px glass; the footer pill compact 506×96 → grown 646×118 r-34/links 92×92/gap 12; the hero h1 y=319 @1280×900) — NO DRIFT. The deployed mirror (logged in) running the session-33/35 code (the footer --footer-p=0.9422 → 638×117 mid-growth signature; an earlier compact read raced the rAF listener — the documented trap) and ALL GREEN: zero console errors on 7 pages; the mobile nav end-to-end at 390 (geometry EXACT, taps + the 700/ink active state); the favourites round-trip through the empty state; the booking round-trip ("Request sent" → Profile · My bookings). NO BUGS — the mobile navigation menu works exactly as expected; no Tailwind v4 regression.
- Findings B1–B6 written into docs/remediation-plan-session-36.md and validated against the codebase before execution (the zero-reference probe, the audit chain, the .env line, the insertion points).
- R1: npm remove zustand tailwindcss-animate class-variance-authority (zero src imports verified first; clsx + tailwind-merge + tw-animate-css verified used and kept); install_packages.sh re-aligned.
- R2: the overrides deepmerge-ts ^8.0.2 pin — npm audit 3 high → 0 VULNERABILITIES (the audit fix --force prisma-6.12.0 downgrade rejected; 8.0.2 verified dual-package + the same deepmerge export + @prisma/config's dynamic import); the full Prisma CLI path re-exercised (generate + db:push + db:seed re-wrote the 118784-byte DB under the pinning).
- R3: the .env PostgreSQL-section bun leftover fixed (npm-first everywhere; matches .env.example).
- R4: 16 screenshots re-captured on the REMEDIATED tree via scripts/capture-screens-session36.mjs against npm run dev (the session-35 script's proven login/settle/verify pattern); all healthy sizes; the dev server shut down cleanly (port 3000 free).
- R5: docs aligned — README (the session-36 row + the screenshot narrative), the PAD v2.14 (the revision block + the stale bun/standalone body corrected: ADR-004 retitled for the npm runtime, §7.3 the 48/76 counts + the auth seam, §7.4/§8.1/§8.3/§9.1 the npm commands, the diagram subgraph, §10 the hygiene row closed + the stale NEXT_PUBLIC_SITE_URL row corrected), CLAUDE.md (the tech-stack line), the SKILL v1.22.0 (the npm-runtime toolchain row + the pruned-leftovers note + the project_state), docs/session_44.md, the worklog, the plan.
- Final gate on the push tree: lint ✓ · typecheck ✓ · 48 unit ✓ · build ✓ · 27/27 smoke ✓ ×2 · 76/76 E2E ✓ ×2.

Stage Summary:
- The parity baseline verified on both sites (the live source unchanged; the mirror all green — the mobile nav exact + working, no Tailwind v4 regression); the owner's ae20598 commit benign.
- Remediated: the 3 unused scaffold deps pruned; npm audit 3 high → 0 via the deepmerge-ts override (no downgrade); the .env bun leftover fixed; the stale bun/standalone doc blocks corrected to the npm runtime; 16 screenshots re-captured.
- Gates: 48 unit + 27/27 smoke ×2 + 76/76 E2E ×2 — all green; 10 docs aligned (PAD v2.14, SKILL v1.22.0); single conventional commit + SSH-wrapper push to main.

---
Task ID: 36-push
Agent: Super Z (main agent, session 36)
Task: Session 36 — push verification record.

Work Log:
- Push infrastructure rebuilt from scratch (the workspace had been reset): paramiko 5.0.0 installed on the system python, the Appendix-A shim extracted from the runbook to /home/z/my-project/bin/ssh (outside the repo; the first sed extraction picked up a trailing markdown fence — rebuilt clean from the doc's code block), operator key materialized at /home/z/.ssh-tmp/op.key (0600), fingerprint verified SHA256:KxJw0EP6J775zmnyFJxGZ4ECJD1R5YlBXq4sVcfQraA (the session-36 operator key).
- Secret scan of the staged diff + the new untracked files: 0 private-key material, 0 GitHub tokens. The 7 changed screenshots are pixel refreshes of the same surfaces (the re-capture on the remediated tree).
- Dry-run: authenticated, remote main at ae20598 (the owner's start-server-log commit — the repo state at this session's clone), fast-forward confirmed (ae20598..1d1449d).
- Real push via docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/activity-map-g.git: ae20598..1d1449d HEAD -> main; wrapper verified refs/heads/main @ 1d1449d == local HEAD and synced refs/remotes/origin/main.
- Operator key shredded (random-overwrite + remove); the wrapper's own temp key + known_hosts sidecar shredded by the wrapper; working tree clean; git status agrees with the remote (origin/main == HEAD == 1d1449d).

Stage Summary:
- Commit 1d1449d (19 files: 1 package.json + lockfile + install script + .env comment + 5 docs + 7 screenshot refreshes + 3 new files — the plan, the session log, the capture script) pushed to main and verified on the remote.
- No secrets in the tree; key material destroyed post-push.

---
Task ID: 37
Agent: Super Z (external validation session)
Task: Validate the claims/findings in docs/findings_to_validate_and_update.md against the codebase, then remediate the misaligned documents + the one code-side envelope variance.

Work Log:
- Fresh clone at 1a8b0fe; the three operator docs (AGENTS/CLAUDE/PAD) + the findings doc read end-to-end; every code claim re-verified (stack versions, all four configs, the 48-unit census by word-boundary it( count, the seed JSON parse 12+12+18+27+9=78, seed.ts nested flattening, places.ts status filters, layouts, Navbar shrink-wrap, globals.css utilities + 12px .roam-marker, 23 "use client" files = 21 components + not-found page + useParallax hook, wc -l on all 19 §11 files).
- The E2E census closed AUTHORITATIVELY: playwright test --list → "Total: 76 tests in 6 files" (auth 5 / browse 32 / home 19 / mobile-navigation 16 / not-found 3 + the 1-check setup project) — the findings doc's own D3 breakdown (browse 25 / mobile-nav 15) was wrong and is corrected; its "four JSON files" attribution (D12/C4) was misattributed (the real "maps all four 1:1" wording is PAD ADR-007 — AGENTS/CLAUDE both list five files correctly); its .font-poppins citation belonged to §5.1, not §5.3.
- Eleven ADDITIONAL stale spots the findings doc missed: PAD §2 layer-table "Node (Bun)", Vitest ^5.0.1→^5.0.2, ADR-005 "below sm"→md + 8→16 mobile-nav checks, ADR-006 "with popups" + the alternatives row, §5.4 transition-colors-only, the §3.2 tree omissions (LetterReveal/useParallax/BrowsePlanner/(bare)/place-404/"branded 404"), screenshots (14)→(16), LeafletCanvas 141→140, DEPLOYMENT.md's health example {"status":"ok"} → the real {"ok":true,...} shape + its "fixed window" row, and seed.ts's bun-first run comment.
- Remediated: the PAD v2.14→v2.15 (revision block + every stale section: §1.2, ADR-003/004/005/006/007, §2, §3.2 tree, Pattern 1 + Pattern 5 (the current shrink-wrapped Navbar code), §5.1-§5.4, §6.2, §7.1 (48/76/27 + the authoritative distribution), §11 line counts, §12 glossary); AGENTS.md (17→19 checks, fixed→sliding window); activity-map_SKILL.md v1.22.0→v1.22.1 (npm-first bootstrap, utility inventory, 21 client components, 19 checks); docs/DEPLOYMENT.md (health shape + sliding window); prisma/seed.ts comment npm-first; CLAUDE.md + README verified accurate — NO changes needed.
- Code-side remediation (E1): /api/health's unhealthy path now returns { ok: false, error: "unhealthy" } (503) per the envelope contract — was the only data-shaped failure across all 22 error returns in src/app/api/**; safety verified first (zero consumers of the old shape; the smoke readiness grep only touches the healthy path).
- Gate on the remediated tree: lint ✓ (the 2 pre-existing inspect-live-nav warnings, 0 errors) · typecheck ✓ · 48/48 unit ✓ · playwright test --list 76 ✓. Build/smoke/E2E NOT run (no server boot in this environment) — the tree is left UNCOMMITTED for the repo's own full gate before push.
- docs/findings_to_validate_and_update.md rewritten as the v2 validated+corrected+remediated record (verdict on every original claim, the three meta-corrections M1-M3, the eleven new findings N1-N11, the full remediation inventory, the verification log).

Stage Summary:
- The original findings report verified highly accurate on code-side facts (all 30+ claims reproduced) but carried 3 internal errors (the E2E breakdown, the "four JSON files" attribution, the .font-poppins location) and missed 11 additional stale doc spots — all corrected and remediated.
- 8 files changed (PAD v2.15, AGENTS, SKILL v1.22.1, DEPLOYMENT, seed.ts comment, the health route fix, the rewritten findings doc, this worklog); CLAUDE.md + README verified accurate and untouched.
- Gates: lint (2 pre-existing warnings) + typecheck + 48/48 unit + the 76-test census all green; the working tree left uncommitted pending the repo's full build/smoke/E2E gate before push.

---
Task ID: 38
Agent: Super Z (guest-bootstrap remediation session)
Task: Disable login for a fresh user's initial visit — create and use a guest account with the necessary seed data (TDD), then archive the remediated tree.

Work Log:
- TDD RED: tests/guest.test.ts written first (20 checks: the guest identity contract, the never-guessable guest password hash, ensureGuestUser create-or-reuse + the concurrent-create race through the upsert, sanitizeNextPath's open-redirect/protocol-relative/backslash/relative/control-char/self-loop guards, guest session-token round-trip/tamper/expiry, and the GET /api/auth/guest handler itself — 303 + Set-Cookie + the verified guest payload + safe-next + open-redirect refusal + the never-clobber guard — with @/lib/db mocked via vi.hoisted to an in-memory fake user store); run confirmed failing on the missing module.
- TDD GREEN: src/lib/guest.ts (GUEST_EMAIL guest@roam.local / GUEST_NAME "Guest" / GUEST_AVATAR_COLOR / GUEST_BOOTSTRAP_PATH, hashGuestPassword = scrypt of a discarded random 32-byte secret, ensureGuestUser with an injectable GuestUserStore, sanitizeNextPath) + src/app/api/auth/guest/route.ts (existing-session short-circuit, ensureGuestUser(db.user), signSession, Set-Cookie, 303 to the sanitised next; deliberately NOT rate-limited — no credentials, page-render-order cost). 20/20 green on the first run; the Prisma user delegate satisfies GuestUserStore structurally (no casts — typecheck clean).
- Wiring: the three session gates ((app)/layout.tsx, (bare)/layout.tsx, (bare)/profile/page.tsx) now redirect to GUEST_BOOTSTRAP_PATH instead of /login; ProfileView.signOut routes to "/" (sign-out re-enters as a fresh guest — the login wall never resurfaces); /login itself is untouched (demo-account parity, all 5 existing auth.spec checks still hold).
- Seed: prisma/seed.ts creates the guest user alongside the demo user (random discarded secret hashed with the seed's local scrypt helper; avatarColor #996CE4).
- Tests: tests/e2e/guest.spec.ts added (5 checks, empty storageState: fresh visit lands on the guide, /api/auth/me resolves guest@roam.local, the profile renders the Guest identity, sign-out → guide-as-guest, open-redirect refused) → the census moved 76→81 in 7 files (playwright test --list). scripts/smoke-test.sh: +2 guest checks (13b fresh visit 200 + roam_session cookie; 13c auth/me → guest@roam.local) and check 14 upgraded from status-only to a Location-accurate assertion ($BASE/api/auth/guest) → 27→29 checks; bash -n clean.
- Live verification beyond the unit gate (scratch DB, deleted after): db:push + db:seed → "seeded guest user: guest@roam.local" with the salt:scrypt-64 hash rejecting every guessable plaintext; exactly 2 users; the LEGACY-DB path proven — with the guest row deleted, ensureGuestUser re-creates it (13/13 checks via a scratch tsx script).
- Doc sweep: PAD v2.15→v2.16 (revision block, NEW ADR-008 with the full rationale/tradeoffs/alternatives, ADR-007 updated, §2 topology, §3.2 tree + auth/guest route, Pattern 2 companion note, §4.3, §6.1 rules 1/4/5 + renumbered 6-10, §6.2 utilities, §6.3, §6.4 open-redirect + guest-takeover rows, §7.1 table 68/81/29, §7.2, §7.3, §11 line counts, §12 glossary); AGENTS.md (intro, commands table, gate order 68/29/81, first-run guest note, the route-group gate fact, the hand-rolled-auth fact's guest-first paragraph, the E2E-auth note); CLAUDE.md (identity, purpose, build/test tables, the pyramid 68/81/29 + guest file descriptions, testing rules, the architecture auth-gate bullet, the API table's /api/auth/guest row, dev-workflow demo-login note); README (overview divergence note, feature table, layer table, tree, tests, setup verification, API table); activity-map_SKILL.md v1.22.1→v1.22.2 (project_state, identity sentence, bootstrap + first-run verification, auth pattern, the §11 pre-ship gate refreshed to npm + 68/29/81, ADR-11, quick-reference rows); docs/findings_to_validate_and_update.md (the route-groups row + a post-audit v2.16 addendum).
- Gate on the remediated tree: lint ✓ (the 2 pre-existing script warnings, 0 errors) · typecheck ✓ · 68/68 unit ✓ · playwright test --list 81 ✓ · seed verified live. Build/smoke/E2E NOT run (no server boot in this environment) — the tree is left UNCOMMITTED for the repo's own full gate before push, per the Task-37 protocol.

Stage Summary:
- The change request delivered: a fresh visit never sees /login — the three session gates route through GET /api/auth/guest, which provisions/uses the ONE shared seeded guest@roam.local account, signs the ordinary roam_session cookie (7-day TTL), and 303s back to a sanitised path; sign-out re-enters as a guest; /login remains for the demo account.
- 15 tracked files changed + 4 new files (src/lib/guest.ts, src/app/api/auth/guest/route.ts, tests/guest.test.ts, tests/e2e/guest.spec.ts); gate arithmetic 48→68 unit · 27→29 smoke · 76→81 E2E; the guest account is unreachable via /api/auth/login (discarded random password) and the bootstrap is structurally immune to open redirects and self-loops.
- Deliverable: the remediated tree archived (excluding .git/, node_modules/, .next/, skills/) into the workspace download folder.

---
Task ID: 39
Agent: Super Z (origin-agnostic redirect remediation session)
Task: Fix the live-deploy regression — https://activity-map.jesspete.shop bounced its login-free first visit to https://localhost:3000 — then archive the remediated tree.

Work Log:
- ANALYZE: the wget trace pinned the divergence precisely — the layout gates' 307 carries a RELATIVE Location (`/api/auth/guest`) and stays on-host, while the bootstrap's 303 carries an ABSOLUTE `https://localhost:3000/`; the only absolute-redirect site in src/ is the guest route's two `NextResponse.redirect(new URL(next, req.nextUrl.origin), 303)` calls (login/logout are JSON-only). Root cause: the reverse proxy forwards `Host: localhost:3000` (nginx's default `proxy_set_header Host $proxy_host`) alongside `X-Forwarded-Proto: https`, so `req.nextUrl.origin` computes as `https://localhost:3000` — a value no local gate could reproduce (localhost IS the correct origin there).
- TDD RED: tests/guest.test.ts first — the four existing absolute-Location assertions flipped to relative, plus a new describe ("relative, origin-agnostic Location") with 4 checks: a request whose URL is `https://localhost:3000/api/auth/guest` must yield a RELATIVE Location (the live regression as a unit pin — it failed with `expected 'https://localhost:3000/eat' to be '/eat'`); the Location resolves against ANY browsing origin (both the public site and localhost); a safe `?next=` stays relative; the signed-in no-clobber branch echoes no host. Run: 8 failed exactly as predicted.
- TDD GREEN: route.ts rewritten — a module-local `seeOther(next)` helper returns `new NextResponse(null, { status: 303, headers: { Location: next } })`; both branches route through it; Set-Cookie/sanitiser/no-clobber untouched. 24/24 green on the first run; no further refactor needed (the helper IS the dedup).
- Test surface: smoke 13d added (curl -D - raw-header check: the 303 Location must literally be `/` — would have caught the live bug) → 29→30; e2e open-redirect assertion tightened from /\/$/ to the exact `/` → 81 unchanged.
- Gate: bash -n ✓ · lint 0 errors (the 2 pre-existing script warnings) · typecheck ✓ · 72/72 unit ✓ · playwright test --list 81 ✓. Build/smoke/E2E NOT run (no server boot in this environment) — the tree stays UNCOMMITTED for the repo's own full gate, per the Task-37/38 protocol.
- Doc sweep: PAD v2.16→v2.17 (revision block; ADR-008 Decision/Rationale/Consequences amended with the relative-Location contract + the proxy-mangling rationale; §3.2 tree; §6.4 threat row 5; §7.1 guest 20→24 + smoke 29→30; §7.3 gate; §11 line counts route.ts 35→54 · guest.test.ts 270→330 · guest.spec 56→58 · smoke-test.sh 185→197; §12 glossary); AGENTS.md (commands table 30, gate order 72/30/81, the two 303 descriptions + the relative-Location fact); CLAUDE.md (command table 72, test pyramid 72/81/30 + the guest-check description, smoke description, API table row); README (feature table, layer table 72/30, tree 30-check, API table row); activity-map_SKILL.md v1.22.2→v1.22.3 (project_state, the auth pattern, the §11 pre-ship gate 72/30/81, quick-ref smoke row, ADR-11); docs/DEPLOYMENT.md (§2 reverse-proxy guidance + the v2.17 origin-agnostic note; §3 NEXT_PUBLIC_SITE_URL row corrected — it WAS wired into cookieSecureFlag, the "not yet wired" claim was stale; §6 27→30 smoke; §7 the localhost-bounce row added); docs/findings_to_validate_and_update.md (v2.17 addendum).

Stage Summary:
- The live site's first visit now stays on-origin: `/` → 307 `/api/auth/guest` (relative) → 303 `Location: /` (RELATIVE, RFC 9110 §10.2.2) + Set-Cookie → the browser resolves against https://activity-map.jesspete.shop — immune to any proxy's Host mangling, on every deployment, zero configuration.
- 4 tracked files changed (route.ts, guest.test.ts, guest.spec.ts, smoke-test.sh) + 7 docs (PAD v2.17, AGENTS, CLAUDE, README, SKILL v1.22.3, DEPLOYMENT, findings); gate arithmetic 68→72 unit · 29→30 smoke · 81 E2E.
- Deliverable: the remediated tree archived (excluding .git/, node_modules/, .next/, skills/) into the workspace download folder.

---
Task ID: 40
Agent: Super Z (main agent, session 46)
Task: Session 46 — audit + validate the v2.16/v2.17 guest-bootstrap range (recent_changes_to_validate.txt), then remediate the deep-link regression + gate alignment (TDD), screenshots, docs, push to main.

Work Log:
- Workspace re-cloned at 66c50de; every root doc + the session history re-read; the scandihaven reference repo re-cloned and its patterns re-verified (already followed). Baseline gates on the untouched tree: lint ✓ · typecheck ✓ · 72/72 unit ✓ · build ✓ · E2E 79/81 — 2 FAILING guest specs (the profile deep link + the sign-out round-trip). Root process cause: sessions 38/39 recorded only `playwright test --list 81 ✓` (a census), never a run.
- Dual-site browser audit (agent-browser, per the repo's own skills catalog): the live source UNCHANGED at every swept signature (desktop nav 433/559/639/727/805; mobile 121/192/222/259 @390 + icons 304/330/356 + the 52px glass; footer 506×96→646×118) and it PRESERVES logged-out deep links (a fresh /eat stays on /eat); the deployed mirror all green EXCEPT fresh-context deep links bounce to / (reproduced for /profile and /place/map-brass-marble) and the post-sign-out DOM is an empty shell; the local dev server's mobile nav EXACT — no Tailwind v4 regression.
- Findings F1–F5 (docs/remediation-plan-session-46.md): F1 HIGH — the layout gates passed no ?next= so every fresh deep link bounced to / (the layouts cannot learn the request path: headers() exposes only proxy headers; a layout redirect preempts a page's); F2 MED — the E2E corpus was never executed for v2.16/17; F3 MED — .env git-tracked with a live AUTH_SECRET; F4 LOW — the triple-redundant (bare) gate; F5 INFO — everything else verified intact.
- R0 RED: +3 guestBootstrapUrl unit checks + 3 E2E deep-link pins (/eat, /map, /place/map-brass-marble).
- R1 GREEN: guestBootstrapUrl() (pure, encodeURIComponent) in src/lib/guest.ts; requireUser(next) in the new src/lib/page-gate.ts; wired into all 8 authenticated pages (the user! assertions dropped); the (app) layout chrome-only ({user ? <Navbar/> : null}); the (bare) layout's redundant gate removed. En-route root cause: sign-out's router.replace+refresh cannot follow the bootstrap's redirect-to-route-handler chain (the RSC soft-nav renders an empty shell) → window.location.assign("/").
- R2: smoke check 14 next-aware + the new 14b deep-link check → 31/31.
- R3: .env untracked via git rm --cached; .env.example verified as the complete env-surface match (included in the push).
- R4: 16 screenshots re-captured via scripts/capture-screens-session46.mjs (login moved to each context's FIRST navigation — the guest bootstrap bounces authenticated visits off /login).
- R5: 10 docs aligned (AGENTS, CLAUDE, README, PAD v2.18, SKILL v1.22.4, DEPLOYMENT, findings addendum, the worklog, docs/session_46.md, the plan's execution record).
- R6 final gate on the push tree: lint ✓ (0 errors) · typecheck ✓ · 75/75 unit ✓ · build ✓ · 31/31 smoke ✓ · 84/84 E2E ✓ — the guest suite EXECUTED green for the first time.

Stage Summary:
- The v2.16/v2.17 range audited: one HIGH functional regression found (deep links bounced to /), one MED process gap (census ≠ pass), one MED security hygiene item (.env tracked) — all remediated with TDD evidence.
- The deep-link contract now matches the live: any authenticated page's URL returns the first-time visitor to that page through the login-free bootstrap; sign-out renders the guide (was an empty shell on the deployed build).
- Gates: 75 unit + 31/31 smoke + 84/84 E2E — all green; 16 screenshots; 10 docs aligned; single conventional commit + SSH-wrapper push to main (no branches).

---
Task ID: 41
Agent: Super Z (main agent, session 48)
Task: Session 48 — audit + validate the v2.18 range (66c50de..a358ffb) on the redeployed mirror, then remediate the same-day booking classification + the live's identity/avatar drift (TDD), screenshots, docs, push to main.

Work Log:
- Workspace refreshed (git pull → eebcfcd: docs/session_47.md + the redeploy server log); every root doc + the session history re-read; the v2.18 gate code reviewed file-by-file. Baseline: lint 0 errors · typecheck ✓ · 75/75 unit · build ✓ · smoke 31/31 · E2E 83/84 — the booking spec failing reproducibly on a tree session 46 had verified 84/84 twice.
- Root cause: a TIME BOMB. The sandbox crossed UTC midnight mid-session; the spec's hardcoded "2026-10-01" booking aged past the boundary (new Date("2026-10-01") = 00:00 UTC < now). The same INSTANT comparison ships in ProfileView — reproduced LIVE on the deployed mirror: booking "Courtyard Stay" for TODAY 19:00 landed under "Past (1)".
- Dual-site browser audit: the redeployed mirror confirmed running the v2.18 fixes (fresh /profile, /place/map-brass-marble, /eat, /map deep links all RETURN; sign-out renders the guide as guest; mobile nav EXACT 121/192/222/259 + 304/330/356 + 52px glass at 390 and 433/559/639/727/805 at 1280; zero console errors; no Tailwind v4 regression). The live re-measured: all signatures UNCHANGED except TWO drifts — the profile h1 "Explorer" + the static "Your Roam account" subtitle (the email line gone; the account renamed upstream), and the navbar avatar disc now the white 17px/2 lucide User icon (not an email initial).
- R0 RED: tests/bookings.test.ts (8 checks — failed on the missing module); the E2E booking spec re-pinned to a runtime-computed TODAY date; the profile/avatar/guest identity pins flipped to the live's current contract.
- R1 GREEN: the pure isBookingPast(startDate, now) seam (src/lib/bookings.ts — calendar-day ordinal via local parts + Date.UTC; null/invalid never past) wired into ProfileView; the E2E booking spec green (same-day visible under Upcoming).
- R2 GREEN: seed name "Explorer"; ProfileView subtitle "Your Roam account"; Navbar avatar = the white 17×17 strokeWidth-2 User icon on the black disc (one DOM node via md:[stroke-width:2]; the userEmail prop retired).
- R3: the smoke booking fixtures → runtime-computed dates (date -d "+7/+9 days"); bash -n clean; 31/31.
- R4: db reseeded (118784 bytes); 16 screenshots re-captured via scripts/capture-screens-session48.mjs — the profile capture documents the same-day booking under "Upcoming" + the "Explorer" identity.
- R5: 10+ docs aligned (AGENTS, CLAUDE, README, PAD v2.19 — revision block + the duplicated v2.18 entry deduped, SKILL v1.22.5, findings v2.19 addendum, session_48.md, the plan's execution record, this worklog).
- R6 final gate: lint 0 errors · typecheck ✓ · 83/83 unit · build ✓ · 31/31 smoke ×2 · 84/84 E2E ×2 — pushed to main via the SSH wrapper.

Stage Summary:
- The v2.18 range audited and verified LIVE on the redeployment (deep links, sign-out, mobile nav — no Tailwind v4 regression).
- F1 (HIGH): same-day bookings classified "Past" — fixed with the calendar-day isBookingPast seam (8 unit checks + a deterministic same-day E2E pin; the time-bombed fixtures made runtime-computed).
- F2/F3: the live's identity/avatar drift re-aligned (seed "Explorer" + "Your Roam account" + the account-agnostic user-icon avatar).
- Gates: 75→83 unit · 31 smoke · 84 E2E — all green; 16 screenshots; one commit on main (no branches).

---

Task ID: 44
Agent: Super Z (main agent, session 50 — final record)
Task: Session 50 — the v2.19-range re-audit + the identity/avatar oscillation re-alignment (v2.20).

Work Log:
- Workspace refreshed to 585fb4c (the v2.19 tree 26984e5 + the operator's session-49 raw-log commit); every root doc + the session history re-read; the 66c50de..a358ffb v2.18 range re-audited (page-gate, guestBootstrapUrl, the 8 wired pages — sound).
- Baseline on the untouched tree: lint 0 errors · typecheck ✓ · 83/83 unit · build ✓ · 31/31 smoke · 84/84 E2E.
- Dual-site browser audit (agent-browser): the REDEPLOYED v2.19 mirror verified live — the calendar-day booking classification (a same-day booking lands under "Upcoming (1)"), the mobile navigation menu end-to-end at 390 (geometry 121/192/222/259 + icons 304/330/356 + the 52px glass; all taps navigate; active state follows) — NO Tailwind v4 regression; every other parity surface exact; zero console errors on 9 pages.
- The live source's identity surface had drifted a THIRD time (Explorer→sepnetflix2023→Explorer→sepnetflix2023): profile h1 "sepnetflix2023" + the account EMAIL subtitle + the email-derived "S" avatar initial (14px/700 white on the 36px disc); the live's tab-bar icons all stroke-width 2 with a 17px desktop heart.
- R0 RED: the browse/guest/mobile-nav identity pins flipped + the new tests/initials.test.ts (4 checks).
- R1–R3 GREEN: the seed name "sepnetflix2023"; ProfileView's subtitle {user.email}; the Navbar's email-derived initial (the userEmail prop re-introduced via the (app) layout + the initials() seam; the lucide-user glyph mobile-only); every nav icon re-stroked to 2 + the desktop heart to 17px.
- R4: db reseeded; dev-server DOM probes verified (h1/email/chips; the "S" disc; the guest "guest@roam.local"; strokes 2/2/2 + heart 17px); 16 screenshots re-captured via scripts/capture-screens-session50.mjs.
- R5: docs aligned (AGENTS, CLAUDE, README, PAD v2.20, SKILL v1.22.6, the findings v2.20 addendum, session_50.md, the plan, this worklog).
- R6 final gate: lint 0 errors · typecheck ✓ · 87/87 unit · build ✓ · 31/31 smoke ×2 · 84/84 E2E ×2 — pushed to main via the SSH wrapper.

Stage Summary:
- The v2.18/v2.19 remediations verified live on the redeployment (deep links, sign-out, the calendar-day classification, the mobile nav — no Tailwind v4 regression).
- F1–F3 (MED): the identity/avatar surface re-aligned to the live's current contract (seed "sepnetflix2023" + the email subtitle + the email-derived initial, pinned by the initials() seam's 4 unit checks + the flipped E2E pins).
- F4 (LOW): the nav icon strokes matched to the live (2/2/2 + the 17px desktop heart).
- Gates: 83→87 unit · 31 smoke · 84 E2E — all green ×2; 16 screenshots; one commit on main (no branches).

---
Task ID: 47
Agent: Super Z (main agent, session 52 — the operator's repo numbering)
Task: Session 52 — refresh, v2.18-range re-audit, dual-site E2E audit (the live went OPEN), login-stay + anonymous-identity + title parity remediation (v2.21), commit + push.

Work Log:
- Refreshed the repo at 96880e8 (main = 50be2d7 v2.20 + the operator's session_51.md/start_server_log commit); read AGENTS/CLAUDE/README/PAD v2.20/SKILL v1.22.6 + session_50/remediation-plan-50/session_51/start_server_log; the v2.18 range 66c50de..a358ffb re-verified (page-gate, guestBootstrapUrl, 8 wired pages, chrome-only layouts).
- Baseline gates on the untouched tree: lint 0 errors · typecheck ✓ · 87/87 unit · build ✓ · 31/31 smoke · 84/84 E2E. .env from .env.example with DATABASE_URL=file:../db/custom.db (db/ at root, 118784B seeded).
- Dual-site browser audit (agent-browser; repo skills: agent-browser/clone-app-pat-pro/tdd/nextjs16-tailwind4/code-review-checklist): the v2.20 mirror verified live (demo identity + mobile nav geometry/taps EXACT at 390, NO Tailwind v4 regression; zero console errors on 9 pages).
- THE LIVE WENT OPEN: anonymous visitors browse every page (cleared cookies); the live's anonymous identity = h1 "Explorer" + the static "Your Roam account" subtitle + the white 17px stroke-2 lucide-user desktop avatar; the live's anonymous state is read-only (heart taps don't persist); /login renders the form for EVERYONE (no authenticated redirect).
- TDD remediation (docs/remediation-plan-session-51.md, R0–R6): F1 the /login authenticated redirect removed (auth.spec pin flipped to STAY); F2 the new client-safe identity seam src/lib/identity.ts (GUEST_NAME "Explorer", profileSubtitle, avatarIsIcon — guest.ts re-exports; the seed/ProfileView/Navbar branch through it); F3 the document titles aligned (template "%s | Activity Map", default "Activity Map", map "Discover", detail static "Place Page", category SHORT labels) + the new titles.spec.ts.
- R4: reseeded; dev-server DOM probes verified (guest "Explorer"/"Your Roam account"/user-icon avatar; demo path unchanged; /login stays authenticated; the 11-route title sweep exact).
- R5: 17 screenshots re-captured via scripts/capture-screens-session51.mjs (new 17-guest-profile-desktop.png); docs aligned — AGENTS, CLAUDE, README (+session-51 history row), PAD v2.21, SKILL v1.22.7, findings v2.21 addendum, session_52.md, the plan, this worklog.
- R6 final gate: lint 0 errors · typecheck ✓ · 92/92 unit · build ✓ · 31/31 smoke · 92/92 E2E.

Stage Summary:
- v2.21 on main: the login-stay contract, the guest/anonymous identity surfaces, and the document titles all aligned to the live's measured strings; unit 87→92, E2E 84→92.
- The live's OPEN transition documented (F4 INFO): the mirror's guest-bootstrap model validated — same user-visible outcome, and the guest account keeps working favourites/bookings (the deliberate divergence).
- The identity surface now has TWO stable halves: the authenticated contract (re-measure the demo name every session) and the anonymous contract ("Explorer" + "Your Roam account" + the user icon).

---
Task ID: 50
Agent: Super Z (main agent, session 54 — the repo's own numbering)
Task: Session 54 — refresh, the v2.19–v2.21 range audit, dual-site E2E audit (the booking-form picker gap), the Dates/Time picker-popover remediation (v2.22), commit + push.

Work Log:
- Refreshed the repo at 61da59a (main = 95b1855 v2.21 + the operator's session_53.md/start_server_log commit — the mirror redeployed from the v2.21 tree 2026-10-01 11:28 +0800); read AGENTS/CLAUDE/README/PAD v2.21/SKILL v1.22.7 + session_52/remediation-plan-51/worklog/session_53/start_server_log; the v2.19–v2.21 range (a358ffb..61da59a) re-verified file-by-file (isBookingPast, the v2.20 identity re-alignment, the v2.21 identity seam + titles).
- Baseline gates on the untouched tree: lint 0 errors · typecheck ✓ · 92/92 unit · build ✓ · 31/31 smoke · 92/92 E2E. .env from .env.example with DATABASE_URL=file:../db/custom.db (db/ at root, 118784B seeded); Vitest + Playwright configs verified in place.
- Dual-site browser audit (agent-browser; repo skills: agent-browser/clone-app-pat-pro/tdd/nextjs16-tailwind4/code-review-checklist): the v2.21 mirror verified live — the mobile navigation menu geometry + taps EXACT at 390 on BOTH sites (NO Tailwind v4 regression), the identity contracts UNCHANGED (the FIFTH authenticated measurement held "sepnetflix2023"; the anonymous "Explorer" surfaces intact), the title sweep, the footer 646×118, the chips, the detail 82px/1150×460, the login card, zero console errors on both sites, the favourites + booking round-trips live.
- ONE gap found (F1/F1b, docs/remediation-plan-session-53.md): the booking form's Dates/Time fields — the live renders PICKER-TRIGGER BUTTONS + POPOVERS (a date-RANGE calendar with a month select, the 42-cell Sunday-first grid, past days #C8C6C0 disabled, violet endpoints, #F0E9FF in-range, "Thu 15 Oct — select end date" → "Thu 15 Oct — Sat 17 Oct"; a 29-slot time list 08:00→22:00 with a violet + check selected slot; the shared popover chrome cream/r-24/#DDDBD5/0 20 48 — phones UP / md+ DOWN, anchored to the relative label) + the PLAIN 12px/600 #2A6B3A success note + the form reset; the mirror rendered free-text inputs + an emerald-50 pill note + no reset.
- TDD remediation (R0–R6): R0 RED (tests/booking-picker.test.ts 21 checks + the flipped/extended browse.spec booking pins — 3 tests RED); R1 GREEN (the client-safe seam src/lib/booking-picker.ts); R2 GREEN (BookingDatePicker + BookingTimePicker — the measured triggers/popovers/hidden inputs); R3 GREEN (BookingForm wiring — the POST sends the range's OWN startDate/endDate, the live's success note + copy, the form reset).
- R4: dev-server DOM probes verified (the triggers, the 42-cell calendar, the range completion, the 29-slot time list, the booking round-trip "15 Oct 2026 – 17 Oct · 19:00" under Upcoming, the success note + reset, the mobile popover opens UP 308px @390).
- R5: 19 screenshots re-captured via scripts/capture-screens-session54.mjs (the new 18-booking-date-picker + 19-booking-time-picker captures — the time list captured element-level because its ~1270px height exceeds the viewport); docs aligned — AGENTS, CLAUDE, README (+ the session-54 history row), PAD v2.22, SKILL v1.22.8, the findings v2.22 addendum, session_54.md, the plan, this worklog.
- R6 final gate: lint 0 errors · typecheck ✓ · 113/113 unit · build ✓ · 31/31 smoke · 93/93 E2E (one documented home image-load flake on the first run; green on the re-runs).

Stage Summary:
- v2.22 on main: the booking form's Dates/Time fields render the live's PICKER-TRIGGER buttons + popovers (the date-range calendar + the 29-slot time list) with the measured chrome; the POST sends the range's own endpoints; the success note matches the live's plain #2A6B3A line + copy; the form resets. Unit 92→113, E2E 92→93.
- The dual-site audit re-verified every previously-pinned surface EXACT (the mobile nav — the task's focus — with NO Tailwind v4 regression; the identity stable across the fifth measurement; titles/footer/chips/detail/login; zero console errors).
- En-route traps recorded for the next audit: element-level locator.screenshot() for popover taller than the viewport; the popover anchors to the LABEL (not the trigger); the mid-transition footer-pill read; the SPA stale-title-on-client-nav quirk (the direct-load title is canonical).

---
Task ID: 53
Agent: Super Z (main agent, session 56 — the repo's own numbering)
Task: Session 56 — refresh, the v2.22-range audit, dual-site E2E audit (the picker-chrome gaps), the chrome re-alignment remediation (v2.23), commit + push.

Work Log:
- Refreshed the repo at 25144c9 (main = 22d2ba4 v2.22 + the operator's session_55.md/start_server_log commit — the mirror redeployed from the v2.22 tree 2026-10-01 12:55 +0800); read AGENTS/CLAUDE/README/PAD v2.22/SKILL v1.22.8 + session_54/remediation-plan-53/worklog/session_55/start_server_log; the v2.22 range (61da59a..22d2ba4) re-verified file-by-file (the booking-picker seam, both picker components, the BookingForm wiring, the flipped browse.spec pins).
- Baseline gates on the untouched tree: lint 0 errors · typecheck ✓ · 113/113 unit · build ✓ · 31/31 smoke · 93/93 E2E. .env with DATABASE_URL=file:../db/custom.db (db/ at root, 118784B seeded); Vitest + Playwright configs verified.
- Dual-site browser audit (agent-browser; repo skills: agent-browser/clone-app-pat-pro/tdd/nextjs16-tailwind4/code-review-checklist): the v2.22 mirror verified live — the picker LOGIC exact end-to-end (the range semantics, the reopen-with-range highlights, the 19:00 selection, the success note, the VISUAL form reset — an earlier "reset failure" was a corrupted probe state, the clean retest resets exactly), the mobile navigation menu geometry + taps EXACT at 390 on BOTH sites (NO Tailwind v4 regression), the identity UNCHANGED (the SIXTH measurement held "sepnetflix2023" + email + "S"), the hero photo byte-identical (md5-equal), the titles/footer/desktop nav exact, zero console errors on both sites.
- FIVE chrome gaps found (F1–F5, docs/remediation-plan-session-55.md): the month row's TWO-CHILD layout (the live's relative flex-1 wrapper + the absolute pointer-events-none chevron inset right-5 + the calendar-days icon at the END, stroke 2); the font-bold 700 select with violet hover/focus; the font-bold uppercase tracking-[0.12em] weekday row; the 0.12 day-cell/time-slot hover shadows; the ARIA + font contract (no aria-label/aria-expanded — the label-derived "Dates*"/"Time*" names; the aria-label had MASKED the E2E reset pin; the form's font-inter; no font-inter on the popover containers; the hidden inputs not readOnly). F6 INFO accepted (the option-value format, the button-vs-link tags, the token names — computed-identical).
- TDD remediation: R0 RED (the trigger queries flipped to the anchored label-derived regexes + the VISUAL reset pins + the new chrome structure pins — 3 tests RED); R1-R3 GREEN (the month row restructured, the font-bold select, the uppercase weekday row, the 0.12 shadows, the ARIA alignment, the form's font-inter); R4 the dev-server DOM probes NUMERICALLY IDENTICAL to the live + a matched-state VLM "no real, visible differences" + the mobile UP direction at 308px; R5 19 screenshots re-captured (capture-screens-session56.mjs) + 8 docs aligned; R6 the full gate: lint 0 errors · typecheck ✓ · 113/113 unit · build ✓ · 31/31 smoke · 93/93 E2E.

Stage Summary:
- v2.23 on main: the booking picker's chrome now matches the live's measured contract exactly (the month row, the select, the weekday row, the shadows, the ARIA names) — verified numerically + visually; the E2E reset pin is now VISUAL (it can actually fail on a visual regression).
- En-route traps recorded: the aria-label pin-masking; the accessible-name expansion while the popover is open (exact-match queries time out — use anchored regexes); the synthetic-click/toggle/popover-desync probe traps; the VLM's cross-screenshot weight misjudgment (the matched-state comparison is the check).
- Next session: re-measure the live's identity (the oscillating surface) + the deployed mirror after the operator's next redeploy.

---
Task ID: 56
Agent: Super Z (main agent, session 58 — the repo's own numbering)
Task: Session 58 — refresh, the v2.23-range audit, dual-site E2E audit (the profile-glass + browse-shell drift), the v2.24 remediation, screenshots, docs, commit + push to main.

Work Log:
- Refreshed the repo at 881f07a (main = 66698f6 v2.23 + the operator's session_57.md + ssh.sh + the redeploy start_server_log — the mirror redeployed from the v2.23 tree 2026-10-01 ~14:08 +0800); read AGENTS/CLAUDE/README/PAD v2.23/SKILL v1.22.9 + session_56/remediation-plan-55/worklog/session_57/start_server_log; the v2.23 range (25144c9..66698f6) re-verified file-by-file (the picker chrome, the flipped pins).
- Baseline gates on the untouched tree: lint 0 errors · typecheck ✓ · 113/113 unit · build ✓ · 31/31 smoke · 93/93 E2E. .env with DATABASE_URL=file:../db/custom.db (db/ at root, 118784B seeded); Vitest + Playwright configs verified; .env.example tracked and matching.
- Dual-site browser audit (agent-browser; repo skills: agent-browser/clone-app-pat-pro/tdd/nextjs16-tailwind4/code-review-checklist): the v2.23 mirror verified live — the mobile tab bar at 390 EXACT on both sites (52px glass, links 121/192/222/259, icons 304/330/356; taps green — NO Tailwind v4 regression), the mobile footer grid + desktop nav + grown footer pill + byte-identical hero + home category-card classes + the v2.23 picker chrome on the live all EXACT, the SEVENTH identity measurement held "sepnetflix2023" (the transient "Roam" first-paints = the live's pre-hydration skeleton), titles exact, zero console errors.
- TWO drift clusters found (F1–F16, docs/remediation-plan-session-57.md): the live's PROFILE evolved into a GLASS design (the page-div padding model — the cards span the full 896px at md; the TRANSPARENT + blurred cards — the live's bg-white/78 class DOES NOT COMPUTE on its CDN; the compound inset-highlight shadows; the glass pills with hover-inverts; the violet Saved-places hover; the 55px mobile h1 at lh 0.92; the 14→16px responsive subtitle; the 18px-radius no-space-label tabs; the cream-pill count) and the BROWSE shell (the centered max-w-xl subtitles on all five heading pages — the live's CDN computes mt-6 as 14px and mx-auto as 24px margins on phones, the mirror pins the COMPUTED result; the map + favourites h1s adopting the browse clamp form; the MAP-glyph planner buttons at stroke 2 with the inset chrome; the chips row's x=16 inset).
- TDD remediation: R0 RED (8 tests — the label flip, the centering-pin flip to the h1's own text-align, the new chrome pins across the profile + browse surfaces) → R1–R3 GREEN (ProfileView restructured; the three heading components; BrowsePlanner's buttons + card) → R3b (found during R4 pixel sampling: both cards' bg-white/78 DROPPED — the live's computed transparent contract, pixel-verified (248,247,244) identical) → R4 the dev-server DOM probes NUMERICALLY IDENTICAL to the live (the card 896 @x=192 + blur 24; the h1 55/72 lh 50.6/66.24; the eat sub y=244/219 with mt-14 + text x=47 on both; the chips x=16; the map-glyph buttons 56/48px) + a matched-state VLM "essentially identical" (a first-pass VLM line-count claim disproved by the numbers) + the booking round-trip + the mobile nav taps still green → R5 19 screenshots re-captured (capture-screens-session58.mjs) + 9 docs aligned → R6 the full gate: lint 0 errors · typecheck ✓ · 113/113 unit · build ✓ · 31/31 smoke · 93/93 E2E.
- Secret scan of the staged diff: 0 key material; 2 prose-only demo-account references (the documented login, same as every prior session); .env + db/ ignored.

Stage Summary:
- v2.24 on main: the profile renders the live's GLASS contract exactly (the transparent blurred 896px cards, the 55px mobile h1, the 18px tabs, the violet hovers) and the five heading pages carry the live's centered max-w-xl subtitles + the MAP-glyph glass planner buttons — verified numerically, pixel-sampled, and VLM-confirmed; the E2E pins extended in place (93 stable).
- The mobile navigation menu (the task's focus) re-verified EXACT on both sites with zero console errors — NO Tailwind v4 regression.
- En-route traps recorded for the next audit: the live's CDN skips non-standard opacity steps (bg-white/78 does not compute — always verify the COMPUTED backgroundColor); the live's CDN computed-value quirks on phones (mt-6→14px, mx-auto→24px margins, text-[55px]→50.7px on the browse-h1 form); the pre-hydration "Roam" skeleton h1s; the VLM's line-count misjudgment (the numbers are the ground truth); pin centering on the element's own computed text-align.
- Next session: re-measure the live's identity (the oscillating surface) + the deployed mirror after the operator's next redeploy from this commit.

---
Task ID: 60
Agent: Super Z (main agent, session 60 — the repo's own numbering)
Task: Session 60 — rebuild the crashed workspace, refresh, the v2.24-range re-audit, dual-site E2E audit (the Carto-map route + the 3D-fan cards drift), the v2.25 remediation, screenshots, docs, commit + push to main.

Work Log:
- REBUILT the workspace: the prior session-60 sandbox crash wiped /home/z/my-project entirely (all uncommitted R1–R3 code lost); re-cloned at 2bc4a45 (v2.24 + the operator's start-server log), .env from .env.example (DATABASE_URL=file:../db/custom.db, db/ at root, 118784B seeded), npm install, db:push + db:seed.
- Re-read the five root docs + session_58/59 + remediation-plan-session-57 + worklog + start_server_log; baseline gates on the untouched tree: lint 0 errors · typecheck ✓ · 113/113 unit · build ✓.
- Dual-site browser audit (agent-browser; the repo skills catalog consulted): the MOBILE NAVIGATION MENU (the task's focus) verified EXACT at 390 (tab-bar links x=121/192/222/259, icons 304/330/356, the 52px glass; the Heart/MapPin/User taps green — NO Tailwind v4 regression); the hero/desktop-nav/stays-grid/mobile-restaurant-deck re-verified unchanged; FOUR drift clusters found (F1–F5, docs/remediation-plan-session-59.md): the CARTO tile-map route (25 light_nolabels z14 tiles, the dashed/solid paths, the cream waypoints, the ink head dot + the lg-only head-centering pan, the split-color progress pill, the graph-paper waypoint panel, the fading heading overlay, the 416.65vh trap, the mobile no-pan map), the 3D ±18° fan category cards (the 1.15 scale, the sliding row deck, the in-card clipped View All), the home stay badge removal, and the stay form's "Preferred Check-In Time*" label.
- TDD remediation: R0 — 5 RED test groups verified on the untouched tree → R1–R3 GREEN (RecommendedRoute.tsx rewritten with the pure-JS bezier arc-length sampler 703.097 vs the live's 703.098; CategoryCards.tsx fanned with arbitrary-property transforms — Tailwind v4's scale/translate utilities emit the INDIVIDUAL properties, the arbitrary forms pin `transform`; StayCard.tsx de-badged; BookingTimePicker's label threaded from the place category) → R4 numerically IDENTICAL to the live (the cards within 1-2px; the pan/head/progress/pill to 3 decimals; VLM "essentially identical" on six matched pairs) → R5 19 screenshots re-captured (capture-screens-session60.mjs) + 9 docs aligned → R6 the full gate: lint 0 errors · typecheck ✓ · 113/113 unit · build ✓ · 31/31 smoke · 94/94 E2E.
- En-route traps recorded in docs/session_60.md: v4's individual scale/translate/rotate properties vs arbitrary-property transforms; Chrome's saturate(160%)→1.6 + per-layer background-size normalization; the unpinned g computing "none"; clip-path elements reporting full boxes (Playwright refuses clipped clicks — hover the reveal); the E2E prod server needing its own DATABASE_URL env; the dev badge in VLM comparisons.

Stage Summary:
- v2.25 on main: the route renders the live's CARTO map contract exactly (the tiles, the paths, the waypoints, the head dot + pan, the split-color pill, the graph-paper panel, the fade, the 416.65vh trap — verified numerically + VLM) and the category cards render the live's 3D fan + sliding deck exactly; the home stay cards carry no badge; the stay booking form reads "Preferred Check-In Time*". Unit 113, E2E 93→94 (the Carto spec + the extended pins).
- The mobile navigation menu re-verified EXACT on the live (and the mirror's suite green) with zero console errors — NO Tailwind v4 regression.
- The workspace-crash recovery pattern documented: re-clone → .env from .env.example → db push/seed → baseline gates → re-measure (never trust memory for geometry) → remediate.
