# Session 60 — the Carto-map route + the 3D-fan category cards (v2.25)

The session-60 workspace was REBUILT from `2bc4a45` after a sandbox crash
wiped the uncommitted session-60 work — every finding below was re-measured
FRESH from the live source (`https://activity-map.base44.app/`), and the
remediation was re-executed TDD-first on the clean v2.24 tree.

## What this session did

1. **Refresh + re-clone** — the crash had wiped `/home/z/my-project`
   entirely; re-cloned `nordeim/activity-map-g` at `2bc4a45` (the v2.24
   tree + the operator's start-server log commit), restored `.env` from
   `.env.example` (`DATABASE_URL="file:../db/custom.db"` — db/ at the repo
   root, seeded 118784B; the URL contract re-verified: db:push + db:seed
   + build + start all resolve the same file), and re-read the root docs
   (AGENTS, CLAUDE, README, PAD v2.24, SKILL 1.23.0) + session_58/59 +
   the remediation-plan-session-57 + worklog + start_server_log.
2. **Baseline gates on the untouched tree** — lint 0 errors · typecheck ✓ ·
   113/113 unit · build ✓ (smoke + E2E re-run green in R6).
3. **The dual-site browser audit** (agent-browser; the repo's skills
   catalog consulted — the same audit skill set as the prior sessions):
   - The MOBILE NAVIGATION MENU (the task's key focus): the tab-bar
     geometry at 390 EXACT (links x=121/192/222/259, icons x=304/330/356,
     the 52px glass bar) + the functional taps (Heart→/favourites,
     MapPin→/map, User→/profile) — **NO regression, no Tailwind v4 issue**.
   - The hero (h1 115.2px, the photo y=−86 h=1010, md5-matched), the
     desktop nav, the stays grid (12 cards 381px, 3×4 column-major), and
     the mobile restaurant deck (6 cards, h 490, img 300, 620px advances)
     re-verified UNCHANGED.
   - FOUR drift clusters found (F1–F5, `docs/remediation-plan-session-59.md`):
     the route visual became a REAL CARTO TILE MAP (25 light_nolabels z14
     tiles in a 1500×1500 svg, the dashed/solid progress paths, the cream
     waypoints, the ink head dot with the lg-only head-centering pan, the
     split-color progress pill, the 18px graph-paper waypoint panel, the
     fading heading overlay, the 416.65vh trap, the mobile no-pan map),
     the home category cards became a 3D ±18° FAN (the 1.15 wrapper scale,
     the perspective-800 slots, the hover flatten, the sliding row deck
     with the in-card clipped View All pill), the home stay cards lost
     the star badge, and the stay booking form's time label became
     "Preferred Check-In Time*".
4. **TDD remediation** (the plan validated against the codebase first):
   - R0 RED: 5 test groups flipped (the fan/deck/pill pins, the Carto-map
     pins, the mobile-map pins, the badge-count-0 pin, the stay-form label
     flip) — verified failing on the untouched tree.
   - R1 GREEN: `RecommendedRoute.tsx` REWRITTEN around a pure-JS
     cubic-bezier ARC-LENGTH SAMPLER (64 samples/segment;
     ROUTE_LENGTH 703.097 vs the live's measured 703.098) + the
     RouteMapSvg/RouteProgressPill subcomponents + the graph-paper
     overlay + the center-based card slot + the heading fade + the
     416.65vh trap + the "90 min" meta note.
   - R2 GREEN: `CategoryCards.tsx` fanned — the ARBITRARY-PROPERTY
     transform classes (`md:[transform:rotateY(18deg)]`,
     `md:[transform:scale(1.15)]`, `md:group-hover/card:[transform:
     translateY(-44px)]`, `md:[clip-path:inset(0px)]`) keep the computed
     strings deterministic (Tailwind v4's scale/rotate/translate utilities
     emit the INDIVIDUAL `scale`/`translate` properties — the arbitrary
     property forms pin the `transform` property itself).
   - R3 GREEN: `StayCard.tsx` de-badged (home variant only) + the pills'
     mt-3.5/18px/220-260ms reveal + `BookingTimePicker.tsx`'s label prop
     threaded from the place category via `BookingForm`.
   - R4: dev-server probes NUMERICALLY IDENTICAL to the live — the cards
     x=231/508/786 y=674/684/674 (the live 229/508/786 y=674, within
     1-2px), the pan (2.61, 339.75)/(10.93, 8.81)/(−0.96, −323.32) vs the
     live's (2.57, 339.69)/(10.9, 9.12)/(−0.94, −322.31), the
     head/dashoffset/pill matching to 3 decimals, the trap 3333, the
     mobile trap 1857/identity-pan/h2@68/42.9px — + the matched-state VLM
     comparisons "essentially identical" (the home top, the route map at
     mid-trap, the restaurants band, the stays, the mobile home, and the
     mobile route — the remaining deltas: the login state, the seed's own
     DB rows, and the Next.js dev badge) + the mobile nav re-verified.
   - R5: 19 screenshots re-captured
     (`scripts/capture-screens-session60.mjs` — the route capture at the
     mid-trap scroll 2500, the stay-form picker captures opening via the
     new label) + 9 docs aligned (AGENTS, CLAUDE, README + the session-60
     history row, PAD v2.25, SKILL 1.24.0, the findings v2.25 addendum,
     this log, the plan, worklog).
   - R6: the full gate — lint 0 errors · typecheck ✓ · 113/113 unit ·
     build ✓ · 31/31 smoke · 94/94 E2E.
5. **Commit + push to main** via the SSH wrapper
   (`docs/ssh_git_wrapper_v3.py` — the runbook in
   `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).

## En-route lessons (for the next audit)

- Tailwind v4's `scale-*`/`translate-*`/`rotate-*` utilities emit the
  INDIVIDUAL CSS properties (`scale:`, `translate:`, `rotate:`), NOT
  `transform:` — the computed `.transform` reads "none". Use ARBITRARY
  PROPERTY classes (`[transform:rotateY(18deg)]`, `[transform:scale(1.15)]`)
  when a pin (or the live's computed contract) reads the `transform` matrix.
- Chrome normalizes `backdrop-filter: saturate(160%)` to `saturate(1.6)`
  in the COMPUTED value (the live's inline style says 160%) — pin the
  computed form.
- Chrome repeats a multi-layer `background-size` per layer ("18px 18px,
  18px 18px" for two gradients) — pin with contains, not equality.
- The g element needs an EXPLICIT `translate(0px, 0px)` to compute
  `matrix(1, 0, 0, 1, 0, 0)` — an unpinned g computes "none".
- A clip-path-clipped element still reports its full bounding box (and
  Playwright refuses to click it — hover the reveal first); pin the DECK
  POSITION, not the clip.
- The prod-build E2E infra boots its own :3100 server with
  `DATABASE_URL=file:../db/e2e.db` — a manually-started `next start`
  without that env renders "This page couldn't load" (the DB health check
  fails); pass the env when probing manually.
- The Next.js dev badge ("N" circle, bottom-left) appears in every dev
  screenshot — ignore it in VLM comparisons (production captures don't
  show it).
