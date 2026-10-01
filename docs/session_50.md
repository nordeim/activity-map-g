# Session 50 — Audit of the v2.19 range + the identity/avatar oscillation re-alignment (v2.20)

Date: 2026-10-01 · Agent: coding specialist (session 50) · Plan: `docs/remediation-plan-session-50.md`

## What this session was asked to do

Refresh the workspace from `https://github.com/nordeim/activity-map-g.git`, internalize the
root docs + the session history (`docs/session_48.md`, `docs/remediation-plan-session-48.md`,
the worklog, `docs/session_49.md` (the operator's raw narrative of the v2.19 session),
`docs/start_server_log.txt`), audit and validate the recent changes in git commit
`66c50de..a358ffb` (the v2.18 deep-link work, re-audited), iterate toward parity with
`https://activity-map.base44.app/` (logging into the live with the demo account), run
browser-based E2E against the deployed mirror (`https://activity-map.jesspete.shop/`) — paying
particular attention to the mobile navigation menu and possible Tailwind v4 bugs — then
remediate (TDD), re-capture screenshots, align the docs, and push to `main` via the SSH
wrapper. The `skills/` folder stays excluded from code checking, testing, and compilation.

## 1. Understanding + baseline (tree at 585fb4c = the v2.19 tree + the operator's log commit)

Every root doc re-read (AGENTS, CLAUDE, README, the PAD v2.19, the SKILL v1.22.5) plus the
session history and the fresh `docs/start_server_log.txt` (the operator REDEPLOYED the mirror
from the v2.19 tree before this session: fresh install → db:push → db:seed → build → start,
2026-10-01 09:33 +0800). Skills consulted from the repo's own `skills/skills-catalog.md`:
`agent-browser` (the dual-site audit driver), `clone-app-pat-pro` (computed-style ground
truth), `tdd` (the RED→GREEN loop), `nextjs16-tailwind4` (the mobile-nav failure taxonomy),
`code-review-checklist` (the range audit).

The audited range `66c50de..a358ffb` re-reviewed: `src/lib/page-gate.ts`
(`requireUser(next)` → 307 through the bootstrap with the page's own path), the pure
`guestBootstrapUrl` seam, the 8 wired pages, the chrome-only layouts — sound, exactly as
session 48 documented.

Baseline gates on the untouched tree: lint ✓ (0 errors, the 2 pre-existing script warnings) ·
typecheck ✓ · **83/83 unit** ✓ · build ✓ (22 routes) · **31/31 smoke** ✓ · **84/84 E2E** ✓ —
the tree identical to what session 48 pushed.

## 2. The audit (dual-site browser: the redeployed mirror vs the live source)

- **The mirror (redeployed, v2.19 live)**: the desktop avatar rendered the account-agnostic
  icon contract, the profile rendered "Explorer" + the static subtitle, and a LIVE same-day
  booking (Courtyard Stay, tonight 19:00, POSTed via the page's authenticated context) landed
  under **"Upcoming (1)" / "Past (0)"** — the calendar-day classification working in
  production. Zero console/page errors across 9 pages at 390.
- **The mobile navigation menu (the task's focus)**: geometry EXACT at 390 on BOTH sites
  (text links x=121/192/222/259, icons x=304/330/356 @18px, the 52px border-box cream-glass
  bar `rgba(248,247,244,0.62)` + `blur(24px) saturate(1.5)`), and FUNCTIONAL end-to-end on
  the mirror: tapping Eat→/eat, Stay→/stay, the Map icon→/map, the Heart→/favourites, the
  Profile icon→/profile, with the aria-current active state following. **The mobile menu
  works exactly as expected — NO Tailwind v4 regression** (all five failure-class pins green
  in the 84/84 baseline run).
- **Every other parity surface EXACT on both sites**: the desktop nav (pill links
  433/559/639/727/805 + heart 957 + profile 1001 + the home h1 115.2px @y=290/291), the
  grown footer (646×118 pill, 92×92 links, the element pad 64/20/56), the Eat chip set (same
  labels/order), the place detail (h1 82px + the ~1150×460 hero + the same 7-field form),
  the favourites empty state (identical text), the profile chrome-less contract.
- **The live source (logged in with the demo account) — the identity surface had drifted a
  THIRD time** (Explorer→sepnetflix2023→Explorer→sepnetflix2023 across sessions 12/14/48/now):
  the profile h1 reads **"sepnetflix2023"** (72px) with the account **EMAIL** as the 16px
  #555550 subtitle (the static "Your Roam account" line is gone again — the session-14
  contract is back); the chips still read Augsburg / 0 day streak / Explorer (unchanged); the
  desktop navbar avatar is the **email-derived "S" initial** (14px/700 white Inter on the
  36×36 black disc) — NOT the lucide-user icon session 48 measured. The mobile tab-bar keeps
  the user icon on both sites.
- **The nav icon strokes**: the live's tab-bar icons all render raw stroke-width 2 and the
  desktop heart disc a 17px glyph; the mirror rendered 1.5/1.8/1.5 with an 18px desktop heart.

Findings F1–F5 tabulated in the plan (§3): F1–F3 MED — the profile h1/subtitle and the
desktop avatar drifted back to the session-14 contract; F4 LOW — the icon stroke family;
F5 INFO — every other parity surface a verified non-gap.

## 3. The remediation (TDD — the plan's R0–R6)

- **R0 RED**: the browse identity pins flipped (h1 "sepnetflix2023" @72px; the email visible
  as the subtitle; the static-line count 0; both h1Box probes renamed; the chip pin stays
  "Explorer" — the live's chip is unchanged); the guest spec's profile subtitle flipped to
  "guest@roam.local"; the mobile-nav avatar pin flipped to the initial contract (text "S",
  the mobile icon `toBeHidden()` at desktop, the 14px/700 white span). NEW
  `tests/initials.test.ts` (4 checks: "S" demo / "G" guest / uppercase / empty fallback) —
  green on arrival (the seam pins existing behavior).
- **R1 GREEN (F1+F2)**: the seed's demo user name "sepnetflix2023"; ProfileView's subtitle
  renders `{user.email}`; the contract comments updated.
- **R2 GREEN (F3)**: the Navbar's desktop avatar renders the email-derived initial (the
  re-introduced `userEmail` prop from the `(app)` layout + the `initials()` seam — the white
  14px/700 `font-nav` letter on the 36×36 disc); the lucide-user glyph becomes the
  mobile-only `md:hidden` tab-bar icon.
- **R3 GREEN (F4)**: MapPin/Heart/User re-stroked to `strokeWidth={2}`; the desktop heart
  disc to `h-[18px] w-[18px] md:h-[17px] md:w-[17px]`.
- **R4**: the local `db/custom.db` reseeded (the new demo name); the dev server verified by
  DOM probe (h1 "sepnetflix2023" + the email subtitle + the chips; the avatar "S" 14px/700
  on the 36×36 disc with the icon hidden at 1280; the guest profile "Guest" +
  "guest@roam.local"; the tab-bar icons 2/2/2 @18px; the desktop heart 17px/2); 16
  screenshots re-captured via `scripts/capture-screens-session50.mjs` (the login-first
  pattern + the same-day reservation before the profile capture — 10-profile-desktop.png
  documents "sepnetflix2023" + the email + the booking under Upcoming).
- **R5**: docs aligned (AGENTS, CLAUDE, README, the PAD v2.20 — revision block + §3.2 tree +
  §6.2 utilities + §7.1/§7.3 gates + §12 glossary; the SKILL v1.22.6; the findings v2.20
  addendum; the worklog; this log; the plan's execution record).
- **R6 (final gate on the push tree)**: lint ✓ (0 errors, the 2 pre-existing script
  warnings) · typecheck ✓ · **87/87 unit** ✓ · build ✓ · **31/31 smoke** ✓ · **84/84 E2E**
  ✓ — plus the final re-run of smoke + E2E for the ×2 confirmation, then the single
  conventional commit and the SSH-wrapper push to `main`.

## 4. Delivered

- **The live's current identity/avatar parity**: the seed, the profile identity card, and
  the navbar avatar match the live's present state ("sepnetflix2023" + the account email
  subtitle + the email-derived "S" initial) — the third oscillation re-aligned, with the
  `initials()` seam unit-pinned so the NEXT flip is a two-line change (seed + pins).
- **The nav icon-stroke parity**: every tab-bar icon at stroke-width 2 and the desktop heart
  disc at 17px, matching the live's raw attributes.
- **The v2.18 range re-audited and the v2.19 remediations verified live** (the deep-link
  contract, the sign-out round-trip, the calendar-day booking classification, the mobile
  navigation menu end-to-end at 390, zero console errors — no Tailwind v4 regression).
- Gates: **87 unit · 31 smoke · 84 E2E** — all executed green; 16 fresh screenshots; 10+ docs
  aligned; one commit on `main` (no branches), pushed via `docs/ssh_git_wrapper_v3.py`.

## 5. Suggested next steps

1. **Redeploy the mirror** from this tree and re-seed — the new demo name
   ("sepnetflix2023") and the email subtitle require it; re-run
   `./scripts/smoke-test.sh` once against production after the redeploy (the runbook's
   post-deploy step).
2. **Re-measure the live's identity surface next session** — it has flipped three times
   (sessions 12/14/48/50); the h1 name, the subtitle line, and the avatar render are the
   volatile trio. The `initials()` seam + the flipped pins make the next re-alignment a
   small, safe change.
3. Consider surfacing the identity card's subtitle from a SINGLE config point (the seed
   name + a "subtitle mode" flag) if the oscillation continues — it would turn the
   three-surface re-alignment into a one-line flip.
