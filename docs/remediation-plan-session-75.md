# Remediation Plan — Session 75 (v2.32 verification cycle)

Fresh cycle against the operator's redeployed v2.32 mirror
(`docs/start_server_log.txt`: the fresh build + re-seeded db from the
`ec613e6` tree at Oct 2 08:04 — the mirror verified running v2.32 from
the live DOM: the sticky vibe heading `md:sticky` with the grid section
following, the fan transforms identity, the zero-state card, the
placeholder `#9CA3AF`) + the operator's `docs/session_75.md` (the
session-74 transcript archive).

## The audit (both sites, agent-browser; repo session 76)

Baseline gates on the untouched v2.32 tree: lint 0 errors · typecheck ✓ ·
117/117 unit · build ✓ · 31/31 smoke · 122/122 E2E. The MOBILE
NAVIGATION MENU (the task's focus) verified EXACT at 390 on BOTH sites
(the 52px glass tab-bar (0,0,390,52), the links
x=16/121/192/222/259/304/330/356, the Map/Favourites/Profile taps
green) — NO Tailwind v4 regression (the 16th consecutive verification);
the identity's 15th measurement held "sepnetflix2023" + the email.

Every re-measured surface held EXACT — ZERO code-level gaps this
session: the vibe section (sticky 2632-tall, the h2 pinning at viewport
y 88, the 12 static cards, the img parallax scale 1.16), the /eat
placeholder model (400 + #9CA3AF, the input 20px content-driven at
weight 400), the browse card order (identical first-five titles: Rose
Circuit / Ember Atlas / Moss & Marble / Botanica 17 / Lumen Dumpling
Bar), the /map default state (9 markers + "0 events · 9 places"), the
route tiles (25 light_nolabels z14 SVG tiles — the live keyless
upstream, the mirror's 50 keyed), the footer grown model (646×118, r34,
92×92 links on BOTH sites), the place detail (82px h1 + About + the two
picker triggers), the login fields (slate-600 placeholders on both —
the gray-400 family has NOT spread), the favourites h1 y=244, the hero
(115.2px h1 @ y290, 3 category cards), the chips (38px/600/12px), the
mirror's browse zero state ("No restaurants found" + "Try widening
your search"), and zero console errors across the mirror's swept pages
(the live's Tailwind-CDN warnings are the platform's own runtime).

**ONE finding:**

### F1 — the LLM status-text family, FIFTH variant (LOW, docs-only)

The live's /map RESOLVED status text for "garden" now reads **"Looking
for places with garden vibes."** — the FIFTH observed variant (after
"-related options" / "related listings" / "related items" / the
free-form "Finding locations featuring a lovely garden setting."),
confirming the family continues to churn per query. The
nonsense-query error text is unchanged ("I could not identify your
search criteria."). The clone's pinned deterministic template
("{query}-related options in Augsburg.") stays; only the divergence
register gains the fifth variant.

## The plan (a verification + documentation cycle — NO code changes)

The audit found no code-level gaps; the remediation is the fifth-variant
note + the requested screenshot refresh + the session documentation.

- **T1 (docs)**: add the FIFTH LLM variant to the divergence register
  (`docs/findings_to_validate_and_update.md`, the pending-pill section)
  and to the session log + worklog notes.
- **T2 (screenshots)**: re-capture the 22-screenshot suite on the
  locally-running server against the current v2.32 tree (the user's
  standing request — `CAPTURE_BASE_URL=http://localhost:3000 node
  scripts/capture-screens-session74.mjs`, the same suite that produced
  the v2.32 baseline; the images land in `docs/screenshots/`).
- **T3 (docs alignment)**: write `docs/session_76.md` (the formal
  session log), append the worklog entry, add the README Project-Status
  row for the session-76 verification cycle, and extend the
  SKILL/PAD/AGENTS/CLAUDE LLM-variant notes where they already list the
  family (docs-only; the code version stays v2.32 — no parity change).
- **T4 (gate + ship)**: re-run the quick gates after the docs edits
  (lint · typecheck · unit), re-verify `git status` clean of
  db/env/secrets, then `git commit` (docs: …) and push to `main` via
  `docs/ssh_git_wrapper_v3.py` (runbook
  `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`). No new branch.

## Validation against the codebase

- No code edits are planned, so the GREEN baseline gate measured at the
  head of this session (lint 0 · typecheck · 117 unit · build · 31
  smoke · 122 E2E) remains the code's verification — re-checked with
  the quick gates after the docs edits.
- The screenshot suite reuses the session-74 script unchanged (the
  code tree is identical to v2.32; only the capture run is new).
- The `.env` (`DATABASE_URL="file:../db/custom.db"`), `db/` at the
  repo root, the vitest + playwright suites, the CARTO key integration
  (`src/lib/carto.ts` + `NEXT_PUBLIC_CARTO_KEY` in the operator's
  deployment env), and the `.env.example` were each re-verified in
  place this session — no edits required.
