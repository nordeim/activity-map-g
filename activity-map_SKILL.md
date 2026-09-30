---
name: activity-map
description: >
  Complete engineering skill for the ROAM (Augsburg City Guide) codebase — a
  Next.js 16 + React 19 + Tailwind v4 + Prisma/SQLite clone of
  activity-map.base44.app. Captures every design decision, anti-pattern,
  debugging procedure, and lesson learned from three build/remediation
  sessions so a future agent can extend, debug, or replicate the app without
  re-discovering them.
version: 1.22.1
last_updated: 2026-09-30
project_state: "48 unit + 27 smoke + 76 E2E green (npm runtime, tailwindcss 4.3.3 + next 16.3 restored; session-36 dep hygiene + npm-audit fix: the 3 unused scaffold deps pruned — zustand/tailwindcss-animate/class-variance-authority, zero src imports, clsx+tailwind-merge+tw-animate-css kept — and npm audit cleared 3 high → 0 via the overrides deepmerge-ts ^8.0.2 pin in the prisma CLI chain, the audit-fix --force prisma downgrade rejected; the .env bun leftover fixed; 16 screenshots re-captured); 42 published + 27 home-only + 9 map-demo places; session-35 operator-commit audit + remediation (the mirror verified running the session-33 code ALL GREEN — zero console errors on 10 pages, the mobile nav end-to-end at 390 with geometry EXACT, the favourites + booking round-trips, the footer growth live — and the live source re-verified UNCHANGED; remediated: the inline DATABASE_URL pinning restored on dev/start/db:push/db:seed after the documented stray-parent-.env hijack REPRODUCED (an exported absolute DATABASE_URL beats every .env file — only the inline script pinning wins), the parity toolchain restored from the operator commit downgrades (tailwind 4.1.17/next 16.2.6/react 19.2.6 back to 4.3.3/16.3/19.3), the unused Drizzle/Postgres scaffolding removed (one lockfile now), the smoke script cleanup fixed — next start renames its worker to next-server, kill by PORT; an orphan with a spent rate limiter caused phantom 429/401s — the E2E mobile-nav position specs await document.fonts.ready (the Inter fallback-font flake shifted the links 6px: Highlights 115 vs 121), the script exec bits restored, 16 dev-server screenshots re-captured; also: a Playwright fill before React hydration silently resets — verify input values before submitting); session-33 footer scroll-linked growth + link hover parity (the deployed mirror verified running the session-32 code ALL GREEN — the 646×118 desktop pill with the 92×92 tiles, the shrink-wrapped mobile nav 121/192/222/259, the press-shrink on every link, zero console errors on 11 pages, the mobile nav end-to-end, the favourites + booking round-trips, NO bugs — and the live re-measured with FOUR findings remediated to EXACT parity: F1 the desktop footer pill's growth is SCROLL-LINKED and CONTINUOUS — the live renders the compact 506×96 model (gap 8, r-28, pad 8/10, links 74×78 r-18, icons 20px, labels 11px) while the footer is offscreen and interpolates LINEARLY with the footer's visible fraction p (gap 8+4p, pad (8+4p)/(10+6p), radius 28+6p, links 74+18p × 78+14p r-(18+6p), icons 20+4p, labels 11+1p — fit to ±0.02 across 10 sampled scroll positions), reaching the grown 646×118 (gap 12, r-34, pad 12/16, links 92×92 r-24, icons 24px, labels 12px) when fully visible and compacting back when it leaves, smoothed by 120ms linear transitions — replicated via the --footer-p CSS var (SiteFooter's rAF-throttled passive scroll listener; a client component now, SSR renders p=0) + the md+ calc classes + the footer-pill-transition/footer-link-transition globals.css utilities, the mobile pill transition-none and NEVER grows; F2 the links' VIOLET hover at both breakpoints — transform: translateY(-12px) scale(1.1) composed into ONE matrix (matrix(1.1, 0, 0, 1.1, 0, -12)) over the #571AFF fill with white text + the 0 16px 34px /0.28 glow, the svg its own unguarded hover scale 1.1 with transition-transform duration-300 — written as the unguarded footer-link-hover utility, NOT v4's separate translate/scale utilities (which would escape the transform transition entry) and NOT v4's @media(hover:hover)-wrapped group-hover (which would not apply on touch-capable probes where the live's own unguarded classes do); F3 the pill's soft 0 2px 12px rgba(14,14,14,0.08) shadow at both breakpoints; F4 the icons' stroke-width 2.1 (was 1.8) + the labels' tracking-[-0.01em] + the grown link radius 24px (was 18); en-route lessons: an offscreen element can render a DIFFERENT model than the visible one — sweep scroll-POSITIONS, not just breakpoints (the first live read of the footer at page-top read 506×96 and looked like a reversion; the live's pill was caught MID-INTERPOLATION at 537px, exposing the continuous driver); Chrome's computed transition shorthand serializes in SECONDS (0.12s, not 120ms); Chrome's INITIAL transition value is all — an element with no transition rule reads "all", so the live's explicit mobile transition: none needs the clone's explicit transition-none; a lingering E2E hover's 1.1 scale inflates later mid-transition measurements (move the pointer off + settle first)); session-32 mobile-nav link-group + desktop footer-pill parity (the deployed mirror verified running the session-31 code ALL GREEN — every session-31 signature green, zero console errors on 11 pages, the mobile nav end-to-end, the favourites + booking round-trips, NO bugs — and the live re-measured with TWO drifts remediated to EXACT parity: the mobile tab-bar's middle link group is now SHRINK-WRAPPED — min-w-0 + mr-2, no flex-1 — putting the four text links at x=121/192/222/259 at 390 and 246/317/347/384 at 640 (4px left of the old flex-1-centered group), with every nav link carrying the live's press-shrink touch feedback (the @utility + unlayered :active rule in globals.css: transition transform 0.18s cubic-bezier(0.22,1,0.36,1) + box-shadow 0.18s, :active scale(0.97) — with the 200ms color transition MOVED to the label span so the two transition shorthands never collide; the live's invisible deltas — 44px min-height tap targets, the nav h-12 at y=2 inside the same 52px border-box header — recorded as non-gaps since the clone's h-full links already exceed 44px); the desktop footer pill GREW at md+ — 646×118 (was 506×96) with radius 34, pad 12px 16px, gap 12, the links 92×92 tiles carrying 24px icons over 12px/600 labels in ONE row of six, while the MOBILE pill (<md) is UNCHANGED and verified EXACT (the 3-col grid, max-w 390, r-28, pad 8/10, gap 8, the 104×78 tiles at 390). En-route lessons: a platform stylesheet can SWAP across breakpoints (measure the RENDERED geometry, not the source rules); a link-walk-up measurement can land on a padded inner div (the live's category cards measure 263×215 only at the ARTICLE level); Tailwind's transition-colors and a custom transition utility on the SAME element are competing shorthands — split them across the anchor and the label span like the live does); 42 unit + 27 smoke + 73 E2E green; 42 published + 27 home-only + 9 map-demo places; session-31 hero vh-model + 404 hydration fix + vibe centering + showcase parallax (the deployed mirror verified running the session-30 code with ONE BUG: the generic 404 threw React #418 on every visit — the statically-prerendered page baked usePathname()'s "_not-found" into the server HTML; fixed via useSyncExternalStore reading window.location with getServerSnapshot "" and pinned by a zero-console-errors assertion. The live re-measured at five viewport sizes with three drifts remediated to EXACT parity: the hero is now a VIEWPORT-HEIGHT-RELATIVE model with ROUNDED photo corners — md:-mt-[80px] over fitted calc heights (md:h-[calc(577px+30vh)] lg:h-[calc(714px+28vh)]), the bg top calc(-80px+0.25vh) / height calc(100%+72px) with border-radius 32/32/60%60%/32/32/80/80 at md+ and 42%/48px on phones (a globals.css max-width-767px !important override — the live's own mechanism), the content md:pt-[calc(5rem+28vh)], the h1 -translate-y-1.5 + the 16px pill gap, the h1 font clamp(32px,9.2vw,38px) CAPPED at 38px on phones, the img object-fit FILL with the hero-shade + cream-blend overlays REMOVED (the raw image — pixel-verified), the h1 landing at y=267/290/319 at 720/800/900 — at 1280x800 the formulas coincide with the old session-22 fixed values so the existing E2E held; the vibe heading now CENTER-ALIGNED (px-[18px] container + mx-auto max-w-[94vw] — the box 1203 @x=38 at 1280 with the exact live line breaks x=123/136/263, all three line centers at exactly 640); the home showcase images carry the live's 1.16 zoom + scroll parallax (the stays' home-variant imgs translateY(8%) scale(1.16) with NO hover zoom, the sights in oversized -inset-y-[16%] wrappers, both interpolating ty ±8% clamped via the shared useParallax() hook — passive + rAF-throttled; the /stay browse cards stay transform-free). En-route lessons: a statically-prerendered client page CANNOT render usePathname() as text (the prerender route leaks in — use the useSyncExternalStore server-snapshot pattern); a fixed-height hero cannot track a vh-based live (the 800px E2E viewport hid a 29px drift at 900px); VLMs can misattribute alignment between screenshots — the DOM line-rect extents are the ground truth; agent-browser's error list ACCUMULATES across navigations (close/reopen between error assertions)); 42 unit + 27 smoke + 71 E2E green; 42 published + 27 home-only + 9 map-demo places; session-30 404-surfaces + map-pin/zoom parity (the TWO 404 SURFACES swept for the first time + the map pin/zoom chrome re-swept below the session-3/8 models: the place-404 is an IN-APP design rendered inside the app chrome — (app)/place/[slug]/not-found.tsx, the 46px Libre Baskerville ink Place-not-found h1 + the 44px ink Back-to-Do pill → /do on a min-h-screen bg-cream px-5 py-24 text-center block; the generic unknown-route 404 is the platform's slate page — chrome-less bg-slate-50 with the 72px font-light slate-300 404 + the 64×2 slate-200 divider + Page Not Found 24px slate-800 + the quoted attempted path via usePathname + the white 1px-slate-200-border r-8 Go Home link → /; the map zoom controls are TWO separated circular 34×34 buttons — r999, 1px rgba(14,14,14,0.1) border, white bg, 22px/700 ink glyphs, stack gap 8, shadowless at (10,10) — Leaflet's joined 30×30 default pair had been untouched since session 3 despite the docs claiming circular since session 8; the map pin model is a 12px ink dot — #0E0E0E, 2px white border, r50%, the 0 4px 10px /0.16 shadow, the 180ms cubic-bezier(0.22,1,0.36,1) transition, hover scale(1.32) + the 0 8px 18px /0.24 shadow — carrying a hover-reveal NAME-LABEL pill (.roam-marker-label: absolute left-50% bottom-calc(100%+9px), translate(-50%,4px) scale(0.96) → hover translate(-50%,0) scale(1), opacity 0→1 at 160ms, white, 12px/700 Inter ink, pad 7/11, r999, the 0 10px 26px /0.16 shadow, the 5px ::after white triangle — measured 106×31) — the 16px dot + 22px violet data-active state RETIRED (the live has no violet pin state); the pin CLICK navigates directly to /place/map-<slug> — no Leaflet popup, no selected-place card, no Tap-a-dot hint (all clone inventions removed; the ?place= deep-link keeps its flyTo); observed traps: Chromium 153 serializes slate/cream colors as lab()/oklab() — even through a canvas fillStyle — sample the painted PIXEL via getImageData with ±2-per-channel tolerance; Leaflet's bundled CSS loads AFTER globals.css in the chunk order — the zoom overrides need !important (the live's own override block uses it too); a rewritten .roam-marker must set display: block (an inline span ignores width/height — the first rebuild rendered 4×18 remnants); CARTO served API-KEY-REQUIRED watermark tiles to the whole sandbox at capture time (the live equally affected — a tile-wait guarding naturalWidth cannot catch it, watermarked tiles are valid PNGs)); session-29 restaurant-band + map-card parity (the DESKTOP RESTAURANT BAND swept as a whole for the first time since session 6 + the map list-card chrome + the stats pills + the detail rating pill: the band heading layer is a sticky vertically+horizontally CENTERED column — the h2 clamp(46px,7vw,104px) lh 1.02 tracking -0.055em text-center + the white View All pill BELOW at gap 24 (h 44, pad 0/24, 13px/600, tracking 0.02em) — that FADES OUT through the first ~45% of the trap while the COMPACT featured card fades IN (min-w 330 at bottom 9vh, pad 16, r 28, bg white/0.08 + the 1px white/0.16 border + blur 18 + the 0 18 48 /0.35 shadow, text-center: the address 12px tracking 0.04em white/0.56 + the centered meta gap 14 at 13px — euro + 4px dot + gold #F7D774 stars + rating — + two flex-1 h-38 12px buttons, NO name inside); the names watermark is a centered FIVE-NAME sliding window (2 before + active + 2 after, circular wrap, uniform Inter clamp(24px,2.6vw,40px) 400 at gap 34, active solid / rest white/0.32, the row centers AS A GROUP); the map list-card eyebrow is a CREAM PILL (bg #F8F7F4, full radius, pad 4/10, 26px) + the 12px MapPin neighborhood line + the 12px grid gap; the map stats pills carry NO shadow; the detail hero rating pill 61x32 (pad 8/12, the 14px star); observed traps: the live's names window has exactly 5 DOM nodes — a sliding window, not a masked track; the live pins its mobile deck via JS transforms (position reads 'static') — assert the VISUAL pin (two cards at viewport y=88), not the CSS position; a fractional flex split can round 2px apart between two flex-1 buttons — pin with tolerance); session-28 date-picker/stay-pill/booking-label parity (the TRIP-PLANNER DATE-RANGE POPOVER swept for the first time since session 3 + the home stay pills + the booking labels + the profile chips: the popover 510px desktop / 358 mobile with pad 12 + the shadow 0 18px 52px /0.16 + the from/to header a grid gap-2 sm:grid-cols-2 of self-contained 238x50 white pill fields carrying the 12px/500 #8A8780 label + the 12px/600 #141413 value + a 14px calendar icon INSIDE + NO Done button + the month label 14px/500 + 28x28 navs + 12.8px/400 #737373 weekdays + weight-400 violet endpoints + #F7F4FF/violet in-range days + gray #737373 prev-month trailing buttons + 40px row pitch; the home stay pills 34px + the 1px white/0.92 Book Now border — the browse variant stays 36px borderless; the booking labels 12px/600 #3A3A3A inline asterisks + #DDDBD5 borders; observed trap: a z-10 on the hero content wrapper CAPS the popover z-[30000] under the category section z-10 — pointer-event interception, fix = drop the wrapper z); session-27 route-stop/login parity (the ROUTE STOP CARDS swept below the session-20 text-only contract + the login fields re-checked at every breakpoint: the stop time pills re-gained the soft shadow 0 8px 22px /0.06 + a 1px /0.1 hairline + a PER-STOP category icon — Coffee/Utensils/Palette/Martini/Leaf at stroke-width 1.8 — + dimmer #3A3A3A 12px text, the pill computing 28×101 at 390; the stop link cards a 1px /0.08 hairline + the hover lift; the stop titles lh 1.1 + mb-2; the meta rows a 14px MapPin-led gap-1.5 flex-wrap row of separate 13px #72706A spans; the Learn More hover violet #571AFF + its glow; the login fields RESPONSIVE — text-base md:text-sm 16px inputs below md + the Sign-in button h-11 sm:h-12 (44px below sm); observed traps: agent-browser 0.38.x renders BLANK element screenshots of tall sticky sections — use the Playwright locator.screenshot() path (scripts/capture-screens-v8-session27.mjs)); session-26 footer/mobile-home parity on top of session-25/24/23/22/20/18/16 (the footer swept below the session-23 pill + the mobile home sections swept systematically for the first time since session 20: the footer legal row carries a 1px black/[0.05] TOP HAIRLINE + pt-3/sm:pt-5 + mt-4/sm:mt-8, the footer element carries px-5 itself and switches its vertical pads at sm (640) not md, and BOTH the pill and the legal row cap at max-w-[390px] centered below md (390 wide @x=125 at 640); the mobile route heading — the live hides the heading section below lg and pins the h2 INSIDE the trap (absolute top-[68px], w min(92vw,360px), clamp(38px,11vw,48px) = 42.9px at 390, lh 1.02, tracking −0.055em) with the trap at 220vh so the heading rides the FULL trap scroll (the old model pinned it at y=120 in a separate heading section that vanished mid-trap); the mobile restaurant deck returned to a STICKY STACKING deck (each card sticky top-[88px], 130px flow gaps/620px advances, the deck pads 56/18/0 — the session-20 'no sticky stacking' record was overtaken); the mobile showcase insets — the stay grid px-[18px] (cards 354 @x=18) + the sights grid px-4 (358 @x=16), was full-bleed 390; the category track pad 18/18 + gap-3 (12px) with the cards at y≈578 and the pill mt-2; observed traps: the live's React app re-mounts its DOM tree differently between renders — a pre-reload measurement at 1280 caught the MOBILE route model rendering at desktop width (its un-reloaded matchMedia state), producing phantom findings — RELOAD before cross-breakpoint comparisons; a getBoundingClientRect height of 664 on a 2-word h2 exposed a parent-stretched flex box — the h2's TEXT position still matched; a VLM misread a mid-stack screenshot as 'no pinning' — the DOM measurement is the truth); session-25 login/legal/category parity (the longest-pinned surfaces swept: the login shadcn inputs text-sm 14px with the whole 'Need an account? Sign up' line ONE button (the emphasized part a font-medium span); the category cards' desktop internals — the live renders its session-10 internals at md and SCALES the row transform:matrix(1.15), so the clone matches the VISIBLE contract — md:leading-6 headers, md:h-8 md:w-8 cells with 15px svgs, gap-3.5, the pill md:bottom-[-49px]; the favourites empty card max-w-xl; the legal routes /privacy-policy + /accessibility-statement with redirect stubs, the ← Back home link 14px #8A8780, the 48px LB h1, 14px/28px #5F5C56 paras, the live's verbatim texts; observed traps: a computed-vs-rect width mismatch exposes an ancestor CSS transform; a VLM can flip a height comparison; browser daemons left from an audit starve a later E2E run); session-24 filter-shell parity (the live's FILTER-SHELL design system: the chips 12px/600 + hairline + #555550 + the VIOLET active + 44px phone targets; the browse card floating shell r-28 + hairline + 0 18 44 /0.08 with the 36px heart; the map sticky 'command center' r-30/34 glass shell; the planner STICKY at both breakpoints; the pt-112 heading contract; the favourites texture FULL-BLEED; observed traps: md:h-[41px] loses to base min-h-[44px]; an E2E pin can encode the clone's drift; α-blended borders serialize as oklab()); session-23 footer + tab-bar + page-bottom parity (the GLASS pill 506×96, blur(40) saturate(1.5), r-28, links 74×78; the tab-bar 52px border-box; the page-bottom chains 32/0/22 + 96px; the footer mt-8 REMOVED); session-22 hero-framing + nav-glass parity (the backdrop ABSOLUTE at every breakpoint with the 591/900/938 content layer; the glass rgba(248,247,244,0.62) + blur(24) saturate(1.5); the tracking deltas)"
---

# activity-map — ROAM (Augsburg City Guide) Engineering SKILL

> **How to use this document:** §1–§3 orient you (what this is, what it runs
> on, how to boot it). §4–§8 are the design/data/a11y contracts you must not
> break. §9–§16 are the hard-won failure catalogue — read §9 and §13 before
> touching `db-path.ts`, the Navbar, or the seed. §11 is the pre-ship gate.
> Every claim is verifiable against a specific file or command; nothing here
> is speculative.

---

## Table of Contents

1. [Project Identity & Design Philosophy](#1-project-identity--design-philosophy)
2. [Tech Stack & Environment](#2-tech-stack--environment)
3. [Bootstrapping & Configuration](#3-bootstrapping--configuration)
4. [The Design System (Code-First)](#4-the-design-system-code-first)
5. [Component Architecture & Patterns](#5-component-architecture--patterns)
6. [Client-State Patterns (Hooks Deep Dive)](#6-client-state-patterns-hooks-deep-dive)
7. [Content Management & Seed Data](#7-content-management--seed-data)
8. [Accessibility Implementation](#8-accessibility-implementation)
9. [Anti-Patterns & Common Bugs](#9-anti-patterns--common-bugs)
10. [Debugging Guide](#10-debugging-guide)
11. [Pre-Ship Checklist](#11-pre-ship-checklist)
12. [Lessons Learnt & How to Avoid Them](#12-lessons-learnt--how-to-avoid-them)
13. [Pitfalls to Avoid](#13-pitfalls-to-avoid)
14. [Best Practices](#14-best-practices)
15. [Coding Patterns](#15-coding-patterns)
16. [Coding Anti-Patterns](#16-coding-anti-patterns)
17. [Responsive Breakpoint Reference](#17-responsive-breakpoint-reference)
18. [Z-Index Layer Map](#18-z-index-layer-map)
19. [Color Reference (Complete)](#19-color-reference-complete)
20. [TypeScript Interface Reference](#20-typescript-interface-reference)
- [Appendix A: ADRs](#appendix-a-adrs)
- [Appendix B: Audit History](#appendix-b-audit-history)
- [Appendix C: Live-Site Validation Methodology](#appendix-c-live-site-validation-methodology)
- [Appendix D: Quick Reference Card](#appendix-d-quick-reference-card)

---

## 1. Project Identity & Design Philosophy

**One sentence:** ROAM is a production-grade, self-hosted clone of the hosted
trip-planning app `activity-map.base44.app` — an authenticated Augsburg city
guide with a showcase home page, three category browses, place detail +
booking, an interactive map, favourites, and a profile — running as a single
Next.js app with cookie sessions and SQLite.

**Design thesis:** *measured fidelity, not invention.* Every visual token,
filter chip, heading string, and mobile-chrome behavior was measured from the
live reference app (DOM inspection, computed styles, pixel sampling, VLM
screenshot comparison) before coding. When the live app changed (session 2's
Libre Baskerville + home redesign; session 3's palette/navbar/planner/card
redesign), the clone re-measured and followed. The clone is a mirror, and
mirrors are maintained by re-measuring, not guessing.

**Non-negotiable rules:**

- The live app is the spec. `https://activity-map.base44.app/` (demo login in
  `AGENTS.md`) is reachable; when in doubt, log in and measure again.
- Browses and counts show exactly 12 Eat / 12 Stay / 18 Do published places —
  the home-only showcase rows must never leak into them.
- The 390px mobile top bar fits on ONE line with nothing clipped or covered —
  pinned by `tests/e2e/mobile-navigation.spec.ts` failure classes A–E.
- No external services at runtime: no Redis, no NextAuth, no analytics; place
  imagery from `media.base44.com` + CARTO tiles + Google Fonts are the only
  third-party fetches.

**Anti-generic mandate:** no default Next.js starter look, no shadcn drawer
nav, no `bg-blue-600` accents. The palette is cream/ink/violet `#571AFF` (+
the electric blue band), the display face is Libre Baskerville, and the nav
links are Inter 16px (Poppins was dropped by the live app's session-3
redesign) — all measured, none chosen.

---

## 2. Tech Stack & Environment

Exact versions installed at the documented commit (from `npm ls --depth=0`):

| Layer | Technology | Version | Critical Note |
|---|---|---|---|
| Web framework | next | 16.3.6+ | App Router + `next start` (npm runtime, `serverExternalPackages`); Turbopack minifier has a multi-return bug (§9 B3) |
| UI runtime | react / react-dom | 19.3.0 | No `forwardRef`; server components by default |
| Language | typescript | 5.9.3 | `strict: true` EXCEPT `noImplicitAny: false` (intentional) |
| Styling | tailwindcss + @tailwindcss/postcss | 4.3.3 | CSS-first `@theme` — NO `tailwind.config.*` may exist |
| CSS extras | tw-animate-css | 1.4.0 | Animation utilities import in `globals.css` |
| ORM | prisma + @prisma/client | 6.19.3 | SQLite provider; `db push` only (no migrations folder) |
| Map | leaflet / react-leaflet | 1.9.4 / 5.0.0 | Must mount via `next/dynamic` `ssr:false` |
| Icons | lucide-react | 0.525.0 | The only icon source |
| Unit tests | vitest | 5.0.1 | Config matches `*.test.ts` only |
| E2E | @playwright/test | 1.63.0 | Chromium; 1 worker; boots the production `next start` build on :3100 with its own `db/e2e.db` |
| Runtime | npm (node ≥ 22) | 11.x | Scripts, seed, production server — the npm scripts pin `DATABASE_URL` inline; `postinstall: prisma generate` |
| Lint | eslint + eslint-config-next | 9.x / 16.3.6 | `eslint .` — excludes `skills/` |

**Scaffold leftovers: pruned session 36.** The unused `zustand`,
`class-variance-authority`, and `tailwindcss-animate` were removed from
package.json (zero `src/` imports verified first; `clsx` + `tailwind-merge`
STAY — used by `src/lib/utils.ts`; `tw-animate-css` STAYS — imported by
globals.css). Session 36 also pinned `deepmerge-ts` ^8.0.2 via npm
`overrides` to clear GHSA-ggr8-5vv4-36mx in the prisma CLI chain
(`npm audit` 3 high → 0). Do not re-add state libraries or v3-era
Tailwind plugins — this app deliberately uses neither.

**Environment variables (3):**

| Variable | Required | Behavior |
|---|---|---|
| `DATABASE_URL` | yes | `file:../db/custom.db` — RELATIVE, resolves against `prisma/schema.prisma` (like the Prisma CLI). Pinned inline in the `dev`, `start`, `db:push`, `db:seed` scripts. |
| `AUTH_SECRET` | in production | HMAC key for the `roam_session` cookie; falls back to a dev-only constant. Stable across restarts or sessions invalidate. |
| `NEXT_PUBLIC_SITE_URL` | no | Reserved canonical-origin slot (currently unused by app code). |

---

## 3. Bootstrapping & Configuration

```bash
git clone https://github.com/nordeim/activity-map.git
cd activity-map
npm install                   # npm runtime (session-34/35 port; bun also works)
cp .env.example .env           # DATABASE_URL="file:../db/custom.db"
npm run db:push                # schema → <repo>/db/custom.db (creates db/)
npm run db:seed                # 42 published + 27 home-only places + demo user
npm run dev                    # http://localhost:3000
```

Demo login: `sepnetflix2023@outlook.com` / `$Abcd1234` (the reference app's
account, seeded locally with a scrypt hash).

**Config files that matter:**

| File | Role | Gotcha |
|---|---|---|
| `next.config.ts` | standalone output + `remotePatterns` for `media.base44.com`, `z-cdn.chatglm.cn` | Adding an image host goes here, never `unoptimized` |
| `tsconfig.json` | strict, `@/*` → `src/*`, excludes `skills/` | `noImplicitAny: false` is deliberate |
| `vitest.config.ts` | node environment, `*.test.ts` only | E2E `*.spec.ts` files are excluded on purpose |
| `playwright.config.ts` | :3100, 1 worker, own `db/e2e.db`, storageState auth | `webServer` pins `DATABASE_URL` + `AUTH_SECRET` |
| `eslint.config.mjs` | next core-web-vitals + TS | ignores `skills/**` |
| `postcss.config.mjs` | `@tailwindcss/postcss` | nothing else — CSS-first |

**First-run verification:** open `/` → login card → sign in → the home page
must show the traveller-photo hero, the glass planner, "12 Hotels / 12
Places to Eat / 18 Sights to Discover" cards, Recommended Route, the blue
Highlighted Restaurants band, the stay showcase, and Highlighted Sights. If
browses show ≠12/12/18, the seed or the status filter is broken (§9 B6).

---

## 4. The Design System (Code-First)

All tokens live in `src/app/globals.css` under `@theme` (Tailwind v4
CSS-first — a `tailwind.config.*` file must NEVER appear):

```css
@theme {
  --color-cream: #f8f7f4;      /* page canvas (footer matches) */
  --color-cream-deep: #f2f1ee; /* raised cream surfaces */
  --color-surface2: #f2f1ee;   /* tag pills */
  --color-ink: #0e0e0e;        /* primary text, black buttons, markers */
  --color-secondary: #3a3a3a;  /* body copy */
  --color-muted: #888580;      /* muted meta text */
  --color-line: #e8e6dc;       /* navbar bottom border */
  --color-border: #dddbd5;     /* card hairlines */
  --color-roam: #571aff;       /* Learn More / Book Now accent, active marker */
  --color-roam-deep: #4a0fe0;  /* accent hover/pressed */
  --color-electric: #4d61ff;   /* live home's Highlighted Restaurants band */

  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-serif: "Libre Baskerville", ui-serif, Georgia, "Times New Roman", serif;
  --font-nav: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;

  --shadow-card: 0 10px 40px -10px rgba(0, 0, 0, 0.08);
  --shadow-float: 0 4px 24px rgba(0, 0, 0, 0.06);
  --shadow-hero: 0 18px 50px -12px rgba(0, 0, 0, 0.25);

  --radius-4xl: 2rem;
}
```

(The legacy `.font-poppins` utility still exists in globals.css but was
redefined to Libre Baskerville — mirroring the live app, which loads no
Poppins at all since its session-3 redesign.)

**Typography hierarchy (roles, from the live app):**

| Role | Font | Weight/size notes |
|---|---|---|
| Display (hero h1, section h2, place titles, 48px route-stop titles) | Libre Baskerville (`font-serif`) | hero: `clamp(34px, 9vw, 122px)`; per-section clamps measured session 3 — browse h1 `clamp(36px, 4.3vw, 55px)` ls −0.06em; detail h1 `clamp(36px, 6.4vw, 82px)`; route `clamp(38px, 6vw, 72px)`; restaurants `clamp(42px, 7vw, 104px)` |
| Nav links | Inter (`font-nav`) | 16px; mobile 700 active `#0E0E0E` / 500 inactive 40%; desktop 400 with active `rgba(14,14,14,0.08)` pill |
| UI body / meta / buttons / card names | Inter (`font-sans` — the body default) | card names 28px tracking −0.04em overlaid on photos; meta 12–13px |

**Custom `@utility` primitives:** `bg-grid` (22px graph-paper grid on the
favourites/profile canvases) and `no-scrollbar` (the mobile-nav safety
valve), plus the interaction utilities `press-shrink`,
`footer-pill-transition`, `footer-link-transition`, and `footer-link-hover`
(the `hero-shade` legibility gradient was REMOVED in session-31 — the live
renders its hero image raw). Keyframes: none of our own —
motion is Tailwind transitions + `prefers-reduced-motion` awareness.

**Radius scale:** Tailwind default scale + `--radius-4xl` (2rem). Cards use
`rounded-3xl` (1.5rem); the planner pill and nav pill are `rounded-full`.

**The glass planner pill (measured tokens, TripPlanner.tsx — `variant="glass"`
for the hero, plain white pill for the browse sticky):**
`rounded-full border-white/35 bg-[#F8F7F4]/35 backdrop-blur-[28px]
backdrop-saturate-150` + shadow `0 8px 22px rgba(0,0,0,0.12), inset 0 1px 0
rgba(255,255,255,0.42)`; desktop grid
`[minmax(42px,220px)_minmax(42px,90px)_minmax(42px,170px)_46px]`, wrapping
2×2 at 390px. Segments show a hover-revealed 12px label above the value row;
People/Type are invisible native `<select>` overlays; dates open the
`DateRangePicker` popover; the 46px search button routes to
`/eat|/stay|/do?people&start_date&end_date`.

---

## 5. Component Architecture & Patterns

**The 5-layer model (the Golden Rule: data flows downward only):**

```
Layer 0  Design tokens     globals.css @theme/@utility        (no config files)
Layer 1  Pure seams        lib/{db-path,filters,rate-limit,utils,auth}   (Vitest)
Layer 2  Data access       lib/db.ts singleton + lib/places.ts DTOs      (Prisma)
Layer 3  API routes        app/api/**/route.ts               (envelope + guards)
Layer 4  UI                server components by default; 21 client components
```

A layer never reaches up; the UI receives typed DTOs (`PlaceDTO`),
never Prisma rows.

**Client components (16, exhaustive — `"use client"`):**

| Component | Why client |
|---|---|
| `auth/LoginForm` | form state → POST → `router.refresh()` |
| `layout/Navbar` | `usePathname` active-link logic + hide-on-scroll |
| `home/Hero` | hero composition (planner lives in TripPlanner) |
| `home/RecommendedRoute` | scroll-driven sticky progress (session 3) |
| `home/HighlightedRestaurants` | tap-to-feature strip state |
| `places/CategoryExplorer` | search + chip filter state |
| `places/PlaceCard` | hover choreography + SaveButton mount |
| `places/StayCard` | dark square card + hover buttons (session 3) |
| `places/SaveButton` | optimistic heart toggle |
| `places/BookingForm` | booking-request form → POST |
| `planner/TripPlanner` | shared planner pill state → router push |
| `planner/DateRangePicker` | Su–Sa range popover state |
| `map/MapExplorer` | pills + search; mounts canvas dynamically |
| `map/LeafletCanvas` | react-leaflet (client-only, `ssr:false`) |
| `favourites/FavouritesView` | unsave interactions |
| `profile/ProfileView` | tabs + category filters |

**Server components:** `(app)/page.tsx` (home composition),
`StayShowcase`, `HighlightedSights`, `CategoryCards`,
`SiteFooter`, `LegalPage`, the three category pages, `place/[slug]`,
`login`, `privacy`, `accessibility`, `not-found`.

**The queries boundary (`src/lib/places.ts`):** every DB read goes through
`listPlaces` / `listPlacesForUser` / `getPlaceBySlug` / `countPlaces` /
`listHomePlaces` / `listMapPlaces` / `listFavourites` / `listBookings`; every
payload through `toPlaceDTO` / `toBookingDTO`. Components never touch
Prisma. (`src/lib/planner.ts` owns the pure planner param/date-label
helpers — Vitest-pinned.)

**Auth pattern:** `getSessionUser()` (from `lib/auth.ts`) guards the `(app)`
layout, every API route except `health` + `auth/login`, and injects the
per-user `saved` flags. Login/logout navigate with `router.refresh()` so
server components re-render — never `window.location`.

**Home composition (re-measured session 3, mirrors the live app):** Hero →
CategoryCards (glass cards, black `#141413` VIEW ALL) → RecommendedRoute
(sticky scroll route + progress pill) → HighlightedRestaurants
(`#highlighted-restaurants`, bg-electric) → StayShowcase (`#stay-showcase`)
→ HighlightedSights (`#highlighted-sights`) → SiteFooter (a SIBLING of
`<main>`, so it keeps its `contentinfo` role).


## 6. Client-State Patterns (Hooks Deep Dive)

This codebase deliberately has **zero custom hooks** — state is simple enough
that `useState`/`useMemo` at the component level is the right weight, and a
`usePlaces()`-style abstraction would hide the server/client boundary. The
patterns that replace hooks:

**Pattern — optimistic mutation + server refresh (`SaveButton`):** flip the
heart instantly, POST/DELETE `/api/favourites`, revert on failure, then
`router.refresh()` on success so server-rendered grids re-render with fresh
`saved` flags. This is why an unsave clears the Favourites card without a
navigation. Any new mutation component must follow the same three steps
(optimistic → API → refresh) or lists go stale.

**Pattern — derived filtering (`CategoryExplorer`):** `useMemo` over
`[places, query, activeChips]` calling the PURE seam
`filterPlaces(places, {query, chips, category})` from `lib/filters.ts`.
Filter logic never lives in the component — it lives in the Vitest-tested
seam. Extending chips = extending `filters.ts` + `tests/filters.test.ts`.

**Pattern — dynamic client-only mount (`MapExplorer`):**

```tsx
const LeafletCanvas = dynamic(() => import("./LeafletCanvas"), { ssr: false });
```

`react-leaflet` imports window at module scope; a server-side import crashes
the build (§9 B5). Every future map-adjacent component goes through this
gate.

**Pattern — local selection state (`HighlightedRestaurants`):**
`useState(restaurants[0]?.slug)` for the featured card; the strip buttons set
it. No global store, no context — the state is one click deep.

**Cleanup/SSR safety:** no `EventSource`, `IntersectionObserver`, or timers
are used; the only async boundary is navigation, handled by the router. If
you add effects, they must carry cleanup or the Leaflet strict-mode
double-mount will teach you why.

---

## 7. Content Management & Seed Data

**Data files (the single source of place content):**

| File | Rows | Destination |
|---|---|---|
| `prisma/data/eat.json` | 12 | `status:"published"`, category `eat` |
| `prisma/data/stay.json` | 12 | `status:"published"`, category `stay` |
| `prisma/data/do.json` | 18 | `status:"published"`, category `do` |
| `prisma/data/home.json` | 27 | `status:"home"` — 5 route stops + 6 sights + 16 restaurants |
| `prisma/data/map.json` | 9 | `status:"map"`, `map-*` slugs, real lat/lng from the live bundle |

Field names mirror the reference app's entity API (`sub_category`,
`cover_image_url`, `vibe_tags`, `avg_rating`…) so captured JSON maps 1:1 in
`prisma/seed.ts`. Browse-row coordinates are DETERMINISTIC: neighborhood
anchors (NEIGHBORHOOD_ANCHORS in seed.ts) + a stable FNV hash jitter per slug
— re-seeding never moves markers. Map-row coordinates are REAL (extracted
from the live JS bundle's hardcoded array).

**Adding a new published place:** add a record to the category JSON →
`bun run db:seed` → done (browses, counts, map, search pick it up
automatically; no component changes).

**Adding a new home showcase item:** add a record to the matching
`home.json` array (slug MUST start with `home-route-` / `home-sight-` /
`home-restaurant-` — the prefix plus `status:"home"` IS the selector for
`listHomePlaces`) → re-seed → the section renders it automatically.

**Adding a map demo place:** add a record to `prisma/data/map.json`
(`map-*` slug, real lat/lng) → re-seed → the map page picks it up via
`listMapPlaces()`; browses stay untouched.

**Idempotency contract:** `db:seed` wipes `booking`, `savedPlace`, `place`,
`user` then re-inserts. It is safe to run any time; it is NOT incremental —
hand-edited DB rows die on the next seed (by design: the JSON files are the
truth).

**Image policy:** entity `cover_image_url`/`gallery_images` point at
`media.base44.com` (the reference CDN; host must be in `next.config.ts`
`remotePatterns`). Only the hero (`public/images/hero-live.jpg`) and the nav
logo (`public/images/roam-logo.png`) are local files, downloaded from the
reference for stability.

---

## 8. Accessibility Implementation

| Item | Implementation | Where to verify |
|---|---|---|
| Body text contrast | ink `#0E0E0E` on cream `#F8F7F4` ≈ 16:1 (AAA) | globals.css tokens |
| Accent contrast | roam `#571AFF` on cream ≈ 6.3:1 (AA); white on electric `#4D61FF` ≈ 4.5:1 (AA) | §19 table |
| Nav inactive | mobile `#0E0E0E` at 40% opacity; desktop ink on white with `rgba(14,14,14,0.08)` active pill | Navbar.tsx |
| Focus rings | Browser default outlines preserved; nothing removes `outline` | globals.css (no `outline: none`) |
| Landmarks | `<header>` (banner), `<nav aria-label="Primary">`, `<main>`, `<footer>` (contentinfo — it is a SIBLING of `<main>`, see §9 B8) | every page |
| Nav aria | active link carries `aria-current="page"`; icon-only links carry `aria-label` | Navbar.tsx |
| Decorative vs meaningful images | card/place images carry `alt={name}`; logo spans are `aria-hidden` + `sr-only` "ROAM" | Navbar.tsx, cards |
| Reduced motion | transitions are subtle Tailwind classes; no autoplaying animation exists | components |
| Touch targets | nav icons 32px; buttons ≥40px (planner cells `min-h-[40px]`) | Navbar/Hero |
| Keyboard map | Leaflet default controls remain active | map view |

The Accessibility Statement at `/accessibility-statement` states the WCAG
2.1 AA target — keep it truthful: if you add a contrast failure, fix it or
amend the page. (Session-25: the legal routes follow the live —
`/privacy-policy` + `/accessibility-statement`, with the legacy `/privacy` +
`/accessibility` as permanent redirects.)

---

## 9. Anti-Patterns & Common Bugs

Every entry below was a REAL failure in this project's history, fixed and
(where possible) regression-pinned. Ordered by how likely you are to
re-trigger them.

### B1 — Turbopack production minifier mis-compiles multi-return helpers (CRITICAL)

**Symptom:** the standalone production server opens the WRONG SQLite file
(or `Error code 14: Unable to open the database file`) while `next dev` and
`bun` transpile of the same file work perfectly.
**Root cause:** the Turbopack production minifier dropped a `return repo`
from a multi-return path helper in `db-path.ts` — silently, no build error.
**Fix:** `standaloneRepoRoot()` and friends were restructured as
single-exit functions; `schemaAnchor` upgrades standalone anchors. KEEP THEM
SINGLE-EXIT. Pinned indirectly by E2E (server-on-wrong-DB would fail 20+
checks).
**Lesson:** never add an early-return branch to `db-path.ts` helpers; verify
production behavior (smoke test), not just dev.

### B2 — Parent-directory `.env` / exported shell `DATABASE_URL` hijacks the app (HIGH)

**Symptom:** `db:seed` writes `<workspace>/db/custom.db` instead of
`<repo>/db/custom.db`; the runtime opens a different file than the CLI.
**Root cause:** Bun and some runtimes walk up the directory tree loading
`.env` files, and a parent `.env` (or a shell-profile export) with an
absolute `DATABASE_URL` wins over the repo's relative one.
**Fix:** every script that touches the DB pins the URL inline:
`"db:push": "DATABASE_URL=file:../db/custom.db prisma db push …"`,
same for `dev`, `start`, `db:seed`. Do not "simplify" the pinning away.
**Lesson:** when the DB path is wrong, `env | grep DATABASE_URL` FIRST, then
check parent `.env` files.

### B3 — Quoted `.env` values passed through with quotes (MEDIUM)

**Symptom:** SQLite error 14 on a path that looks correct in logs — because
it is literally `file:"../db/custom.db"` with quotes.
**Fix:** `resolveDatabaseUrl` strips surrounding quotes before the `file:`
branch. Pinned by `tests/db-path.test.ts` (19 checks).
**Lesson:** every new env consumer should strip-then-parse, not parse raw.

### B4 — Mobile nav element covered by a neighbour at 390px (HIGH — the user's headline concern)

**Symptom:** the "Do" link (or a link cluster) is not tappable / visually
overlapped at 390px — Tailwind v4 failure class D.
**Root cause (history):** (1) an icon-bearing wordmark + padded links
overflowed the 390px budget; (2) after switching to the image logo, the
logo's right edge overlapped the first link again; (3) after removing
padding, the links fused with no gaps.
**Fix (current, session 3):** fixed-top cream-glass tab-bar (52px, ≤430px
centered) with the image wordmark's mobile spans capped at 18+62px,
text-only 16px Inter links, three 18px right-cluster icons, and the
`no-scrollbar` horizontal overflow safety valve. (Session 2's variant was a
flat full-width bar with a ≤52px wordmark span — the cap moves with the
measured chrome; the INVARIANT is: wordmark + 4 text links + 3 icons must
fit the 390px budget with zero overlap.)
**Variant (session 3, same symptom class):** a bare `grid` (no
`grid-cols-*`) in `HighlightedRestaurants` let a 2400px CDN image size an
implicit auto track to 2416px — `document.scrollWidth` exploded and dragged
the FIXED navbar's containing block off the 390px viewport (header landed at
x=565). Fix: `grid-cols-1`. Lesson: fixed-position chrome goes off-screen
whenever ANY ancestor expands the scroll width — check
`document.scrollWidth === viewport width` first.
**Pin:** `tests/e2e/mobile-navigation.spec.ts` computes pairwise link-box
intersections at 390px and fails on ANY overlap >1px. ALWAYS re-run it after
touching the Navbar.

### B5 — react-leaflet imported in a server component (BUILD BREAKER)

**Symptom:** build crash on window access.
**Fix:** `MapExplorer` (client) mounts `LeafletCanvas` via
`next/dynamic` with `ssr: false`. The import chain is the contract.

### B6 — Home-only rows leaking into browses/counts (DATA CORRUPTION CLASS)

**Symptom:** Eat shows 13 cards, "12 Places to Eat" card shows 13, or the
map shows route-stop markers.
**Root cause:** a new query forgetting `status: "published"`, or a home row
seeded without `status: "home"`.
**Pin:** `tests/e2e/home.spec.ts` "browses stay unpolluted" (12/12/18 link
counts) + the browse card-count checks.
**Contract:** `listPlacesForUser`/`countPlaces` filter published;
`getPlaceBySlug` deliberately does NOT filter (home links must resolve);
`listHomePlaces` selects by slug prefix + status home.

### B7 — Favourites card persists after unsave (STALE UI)

**Symptom:** un-saving leaves the card until manual reload.
**Fix:** `SaveButton` calls `router.refresh()` after a successful toggle so
server components re-render. Any new mutation must do the same.

### B8 — `<footer>` inside `<main>` loses its landmark (A11Y)

**Symptom:** `getByRole("contentinfo")` finds nothing; screen readers get no
footer landmark.
**Fix:** `SiteFooter` renders as a sibling of `<main>` in
`(app)/page.tsx`. Keep it there.

### B9 — Playwright `goto("/")` times out at 45s on slow CDN (FLAKE)

**Symptom:** E2E failures only in full runs, all in `page.goto` waiting for
`load`; the home page now pulls ~35 CDN card images.
**Fix:** spec navigations use `waitUntil: "domcontentloaded"` (assertions
auto-wait for hydration). Applied across `home.spec.ts`,
`mobile-navigation.spec.ts`, the favourites round-trip.
**Lesson:** never gate a spec on the `load` event of a CDN-heavy page.

### B10 — Strict-mode locator ambiguity (SPEC BUG CLASS)

**Symptom:** `getByText("Volta")` resolves to 2 elements (heading + strip
button) → strict mode violation, not an app bug.
**Fix:** prefer role-scoped, `exact: true`, or `.first()` locators; scope by
section ids (`#highlighted-restaurants`, `#stay-showcase`,
`#category-cards`).

---

## 10. Debugging Guide

| Symptom | Cause | Fix |
|---|---|---|
| `Error code 14: Unable to open the database file` (prod) | B1/B2/B3 chain: wrong file resolved, hijacked env, or quoted URL | Check `env | grep DATABASE_URL`; check parent `.env`; run `./scripts/smoke-test.sh` (it pins the env); keep db-path single-exit |
| Seed writes db outside the repo | exported/shell `DATABASE_URL` wins | `bun run db:seed` (pinned); verify with `ls db/` inside the repo |
| Logins loop back to `/login` after restart | `AUTH_SECRET` changed → old cookies fail HMAC | keep the secret stable; e2e pins `AUTH_SECRET` in playwright.config.ts |
| Login suddenly 429 | rate limiter (10/IP/15 min) tripped | wait `Retry-After` or restart the process (in-memory buckets) |
| Mobile nav link untappable at 390px | B4 class (wordmark too wide / no gaps / under-layer) | re-run `bunx playwright test tests/e2e/mobile-navigation.spec.ts`; check the link-box printout in the failure message |
| Home shows wrong card counts | B6 (status filter / seed drift) | `DATABASE_URL=file:../db/custom.db bun -e '…place.groupBy({by:["status"],_count:true})'` → expect `{published:42, home:27}` |
| E2E fails only in full runs at `goto` | B9 CDN flake | confirm `waitUntil: "domcontentloaded"` on that navigation |
| E2E strict-mode violation | B10 ambiguous locator | role-scope or `exact:true` |
| Build crashes on `window` | react-leaflet reached a server component | route through `next/dynamic` `ssr:false` |
| Images 404/blocked | host missing from `remotePatterns` | add the host in `next.config.ts` (never `unoptimized`) |
| `bunx prisma` behaves differently from the app | CLI resolves relative URLs against `prisma/` too, but your env differs | both paths converge on `db-path.ts`; test with `bun run test` (17 db-path checks) |

**Live-site re-measurement (when the reference app changes):** log in with
the demo account, `agent-browser eval` the DOM (computed styles, link
boxes, innerText), sample pixels for colors, VLM-compare screenshots — then
update tokens/data and re-pin with specs. See Appendix C.

---

## 11. Pre-Ship Checklist

Run IN ORDER from the repo root; every step must be green:

```bash
bun run lint          # eslint . — zero errors
bun run typecheck     # tsc --noEmit
bun run test          # vitest — 42 checks (17 db-path + 15 filters + 10 planner)
bun run build         # next build + standalone assembly
./scripts/smoke-test.sh   # 27 API checks against a fresh prod server
bun run test:e2e      # 35 Playwright checks (needs the build)
git status --short    # review the diff — no stray db/*.db, .env, or keys
```

**Security review (quick pass):** no `console.log` of secrets; no new
`remotePatterns` host without need; `AUTH_SECRET` non-empty in production
env; rate limiter untouched; no `dangerouslySetInnerHTML` introduced;
API envelope unchanged (`{ok,data}|{ok,error}` + real status codes).

**Visual review:** the 14 screenshots in `docs/screenshots/` are the
regression baseline — re-capture (`docs/screenshots/*`) when UI changes are
intentional, and eyeball 390px first (that is where every layout bug in
this project's history lived).

**Documentation review:** if commands/counts changed, update `AGENTS.md`
(the gate line), `CLAUDE.md`, `README.md` (testing table), and this SKILL's
`project_state` header. Drifted docs are worse than none.


## 12. Lessons Learnt & How to Avoid Them

1. **Measure, then build (L1).** Session 1 built from measured DOM/pixels and
   shipped in one pass. Sessions 2 AND 3 found the live app had been
   redesigned (fonts/home sections; then palette/navbar/planner/cards) — the
   fix was the same discipline: re-login, re-measure, re-pin. Avoid by
   treating the live app as a living spec and budgeting a measurement pass
   before every parity claim.
2. **The production build is a different program (L2).** Turbopack's
   minifier broke code that `next dev` and `bun` transpiled correctly (B1).
   Avoid by never trusting dev-mode verification alone — the smoke suite
   exists to exercise the standalone build.
3. **Environment inheritance is hostile (L3).** A parent `.env` and a
   shell-profile export both hijacked `DATABASE_URL` on different days (B2).
   Avoid by pinning env inline in every DB-touching script and suspecting
   the environment first when paths go wrong.
4. **390px is where layouts die (L4).** Four separate mobile-nav/layout bugs
   (B4 + session 3's 2416px grid blowout) across three sessions, all caught
   by the same spec. Avoid by re-running `mobile-navigation.spec.ts` after
   ANY Navbar/token change and thinking in px budgets (logo 18+62px + 4
   text links + 3 icons ≈ 18px < 390).
5. **Status fields are cheaper than new tables (L5).** The home showcase
   needed 27 place-like rows and the map needed 9 demo rows that must NOT
   pollute browses. `status:"home"` / `status:"map"` on the existing Place
   model + query-level filters solved it with zero schema change. Avoid
   duplicating models when a lifecycle field will do.
6. **Pin the semantics you measured (L6).** Chips, headings, counts, one-line
   nav — all pinned as specs. Every pin converted a later "does it still
   match?" question into a 90-second test run.
7. **Flakes are bugs in the spec, too (L7).** The CDN `load`-event timeouts
   (B9) masqueraded as app failures. `waitUntil: "domcontentloaded"` plus
   auto-waiting assertions is the durable pattern.
8. **Strict mode is a feature (L8).** The `getByText` ambiguities (B10)
   forced role-scoped locators, which survive content additions better.
   Write locators like the accessibility tree sees the page.

---

## 13. Pitfalls to Avoid

- **Don't add `tailwind.config.*`** — Tailwind v4 is CSS-first; tokens go in
  `globals.css` `@theme`. A config file silently overrides/conflicts.
- **Don't add early returns to `db-path.ts` helpers** (B1 single-exit rule).
- **Don't construct `PrismaClient` anywhere except `lib/db.ts`** — the
  singleton also holds the connection lifecycle.
- **Don't query places without `status:"published"`** unless it is
  `getPlaceBySlug`/`listHomePlaces`/`listMapPlaces` (B6).
- **Don't import `react-leaflet` outside the `ssr:false` dynamic gate** (B5).
- **Don't widen the mobile wordmark span past 62px** or add mobile link
  padding — the 390px budget is fully allocated (B4).
- **Don't use a bare `grid` (no `grid-cols-*`)** — implicit auto tracks size
  to CONTENT, so one wide CDN image blows out `document.scrollWidth` and
  drags fixed-position chrome off-screen at mobile emulation widths
  (session 3's HighlightedRestaurants fix: `grid` → `grid-cols-1`).
- **Don't remove the `no-scrollbar` overflow on the nav links row** — it is
  the safety valve that converts overflow into scroll instead of overlap.
- **Don't hand-roll price/€/duration formatting** — `lib/utils.ts`
  (`formatPrice`, `priceRangeSymbols`, `formatDuration`) owns display
  formatting.
- **Don't parse `vibeTags`-style columns inline** — `toPlaceDTO` is the only
  sanctioned JSON-array parser.
- **Don't use `window.location` for auth navigation** — `router.refresh()`
  keeps the server-rendered shell consistent (B7).
- **Don't commit `db/*.db`, `.env`, or any key file** — all gitignored;
  the SSH push key lives OUTSIDE the repo and is shredded after use.
- **Don't create git branches** — `main` only, Conventional Commits, push via
  `docs/ssh_git_wrapper_v3.py` (runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).
- **Don't gate specs on the `load` event** of CDN-heavy pages (B9).
- **Don't bump the rate limiter to "fix" test failures** — share one login
  via storageState like the existing setup project does.

---

## 14. Best Practices

- **TDD on pure seams:** change `filters.ts`/`db-path.ts` by extending
  `tests/*.test.ts` first (RED), then implementing (GREEN). Both suites run
  in <1s.
- **Server components by default;** add `"use client"` only for interactivity,
  and keep the 16-component inventory in this file current.
- **DTO at the boundary:** every API payload is `PlaceDTO`/`BookingDTO`;
  serialization happens only in `lib/places.ts`.
- **Deterministic seeds:** neighborhood anchors + slug-hash jitter keep
  coordinates stable across reseeds — never `Math.random()` in the seed.
- **Inline-pinned env in scripts** for every DB-touching command (B2).
- **Section ids as spec scopes:** `#category-cards`, `#highlighted-restaurants`,
  `#stay-showcase`, `#highlighted-sights` — keep them stable; specs depend
  on them.
- **Descriptive aria over visual-only labeling:** icon links carry
  `aria-label`; the logo pair is `aria-hidden` with an `sr-only` "ROAM".
- **Left-aligned lists** (no `justify` on bullets), single-column text flow,
  no artificial "End of document" markers.
- **English UI copy** (the live app's language), Conventional Commit
  messages, and doc updates in the same commit as the behavior change.

---

## 15. Coding Patterns

### Pattern — API route (auth → validate → business → envelope)

```ts
// src/app/api/favourites/route.ts (shape)
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const placeId = body?.placeId;
  if (typeof placeId !== "string") {
    return NextResponse.json({ ok: false, error: "MISSING_PLACE_ID" }, { status: 400 });
  }
  // ... Prisma upsert, then:
  return NextResponse.json({ ok: true, data: { placeId } }, { status: 201 });
}
export const dynamic = "force-dynamic";
```

### Pattern — server page composing showcase sections

```tsx
// src/app/(app)/page.tsx (shape)
const [counts, route, sights, restaurants, stays] = await Promise.all([
  countPlaces(),
  listHomePlaces("home-route-"),
  listHomePlaces("home-sight-", uid),
  listHomePlaces("home-restaurant-"),
  listPlacesForUser(uid ?? "", "stay"),
]);
```

Parallel `Promise.all` — five independent queries never serialize.

### Pattern — schema-anchored SQLite resolution (single-exit!)

```ts
// src/lib/db-path.ts — the contract pinned by 17 unit checks:
// relative file: URLs resolve against the anchor dir holding
// prisma/schema.prisma (like the Prisma CLI); absolute/quoted/foreign URLs
// pass through. Helpers are SINGLE-EXIT on purpose (B1).
export function resolveDatabaseUrl(envValue?: string, anchors: string[] = []): string
```

### Pattern — pure filter seam

```ts
// src/lib/filters.ts + tests/filters.test.ts
filterPlaces(places, { query, chips, category })  // AND-composed chips;
// special eat chips (Open now / Near me / Under €100 / Trending) + tag chips;
// query matches name/neighborhood/subCategory/description/tags
```

### Pattern — HMAC stateless session

```ts
// src/lib/auth.ts
hashPassword(pw)            // scrypt salt:hash
createSessionCookie(user)   // HMAC-SHA256 payload, 7-day TTL, httpOnly/lax
getSessionUser()            // reads + verifies the roam_session cookie
```

---

## 16. Coding Anti-Patterns

- `import { PrismaClient } from "@prisma/client"` in a component/route —
  use `import { db } from "@/lib/db"`.
- Leaking Prisma rows into JSON — serialize through `toPlaceDTO`.
- `<img>` with a non-allowlisted host — extend `remotePatterns` instead of
  `unoptimized`.
- `forwardRef` wrappers — React 19 passes `ref` as a prop.
- Global state libraries for local concerns — this app deliberately has none
  (the scaffold's zustand was pruned session 36).
- `aria-label` text that duplicates visible text (double announcement).
- New env vars read via raw `process.env.X` in components — env consumption
  belongs to server seams; client code sees only `NEXT_PUBLIC_*`.
- Early-return pyramids in `db-path.ts` (B1), `justify` alignment on lists,
  and hand-rolled `€` string building (`"€".repeat(n)` — use
  `priceRangeSymbols`).

---

## 17. Responsive Breakpoint Reference

Tailwind default scale (no custom breakpoints). Usage counts in the codebase:
`sm:` ≈111, `md:` ≈27, `lg:` ≈8, `xl:` ≈1.

| Breakpoint | What changes |
|---|---|
| base (<640px, design target 390×844) | Nav = FIXED-TOP cream-glass tab-bar (52px, ≤430px centered, blur, border-b `rgba(14,14,14,0.08)`): image wordmark (18+62px spans), 4 text-only 16px Inter links (700 active / 500 @40% inactive), right cluster = pin/heart/user 18px icons; home hero slides under the glass. Planner pill wraps 2×2. Cards 1-col. |
| `sm:` 640px+ | (chips/grids step up; nav unchanged until `md`) |
| `md:` 768px+ | Nav becomes in-flow sticky transparent header wrapping the full-width WHITE `h-14` bar (border-b `#E8E6DC`): 16px Inter icon+text links, active `rgba(14,14,14,0.08)` pill, heart + avatar right cluster, hide-on-scroll choreography. Display headings step up; grids widen. |
| `lg:` 1024px+ | Stay showcase 3-col; highlighted restaurants = featured card beside strip. |
| `xl:` 1280px+ | Max content widths (1000–1100px) — the page never stretches full-bleed. |

**Mobile testing rule:** every layout-affecting change gets a 390px check —
`screenshot` at 390×844 plus the mobile-nav spec. The E2E suite runs 390 /
640 / 1280 viewports explicitly.

---

## 18. Z-Index Layer Map

| Layer | Element | Location | Purpose |
|---|---|---|---|
| 0 | `.leaflet-container` | globals.css | Map canvas stays under UI |
| 10 | Hero content, CategoryCards, Route time chips, Map status badge | components | Section content over decorative/backdrop layers |
| 40 | Sticky Navbar `<header>` | Navbar.tsx | The only sticky chrome |
| 100+ | (reserved) Leaflet popups/controls use Leaflet's own internal scale | — | never fight them; keep app chrome below |

Rules: the navbar (40) is the app's ceiling; overlays inside sections stay
at 10; anything needing 50+ must justify itself against the Leaflet popup
stack. There are no portals/modals in the app today.

---

## 19. Color Reference (Complete)

| Token | Hex | RGB | Tailwind class | Usage | Contrast |
|---|---|---|---|---|---|
| cream | `#F8F7F4` | 248 247 244 | `bg-cream` | page canvas (footer matches) | — |
| cream-deep / surface2 | `#F2F1EE` | 242 241 238 | `bg-cream-deep`, `bg-surface2` | raised cream, tag pills | ink on it ≈15:1 AAA |
| ink | `#0E0E0E` | 14 14 14 | `text-ink`, `bg-ink` | primary text, black buttons, markers | on cream ≈16:1 AAA |
| secondary | `#3A3A3A` | 58 58 58 | `text-secondary` | body copy | on cream ≈11:1 AAA |
| muted | `#888580` | 136 133 128 | `text-muted` | muted meta text | on cream ≈3.5:1 AA-large |
| line | `#E8E6DC` | 232 230 220 | `border-line` | navbar bottom border | — |
| border | `#DDDBD5` | 221 219 213 | `border-border` | card hairlines | — |
| roam | `#571AFF` | 87 26 255 | `text-roam`, `bg-roam` | Learn More / Book Now accent, active marker | on cream ≈6.3:1 AA; white on it ≈7:1 AAA |
| roam-deep | `#4A0FE0` | 74 15 224 | `text-roam-deep` | accent hover/pressed | on cream ≈8:1 AAA |
| electric | `#4D61FF` | 77 97 255 | `bg-electric` | home Highlighted Restaurants band | white on it ≈4.5:1 AA |
| VIEW ALL black | `#141413` | 20 20 19 | `bg-[#141413]` | category-card VIEW ALL pills | white on it ≈17:1 AAA |
| mobile nav inactive | `rgba(14,14,14,.4)` | — | `text-[#0e0e0e]/40` | inactive mobile tab-bar links | — |
| desktop active pill | `rgba(14,14,14,.08)` | — | `bg-[rgba(14,14,14,0.08)]` | active desktop nav link pill | — |
| amber (stars) | `text-amber-300` | — | `text-amber-300` | star ratings on the blue band | decorative |

Opacity variants: `black/5` borders, `black/50–/65` meta text,
`white/35` glass borders, `bg-[#F8F7F4]/35` glass fill. Selection highlight
`rgba(87,26,255,0.18)`. No other colors are sanctioned; adding one means
adding a token in `@theme` first.

---

## 20. TypeScript Interface Reference

`src/types/index.ts` (verbatim shapes):

```ts
export type PlaceCategory = "eat" | "stay" | "do";

export interface PlaceDTO {
  id: string; slug: string; name: string;
  category: PlaceCategory;
  subCategory: string | null;
  shortDescription: string | null;
  description: string | null;
  coverImageUrl: string | null;
  galleryImages: string[];
  priceRange: number | null;      // 1..4 → €..€€€€
  price: number | null;           // do: ticket price
  priceLabel: string | null;      // do: display label e.g. "Free", "€12"
  nightlyPrice: number | null;    // stay: per-night price
  currency: string;
  avgRating: number; reviewCount: number;
  isBookable: boolean;
  neighborhood: string | null; address: string | null;
  openingHours: string | null; durationMin: number | null;
  minParty: number | null; maxParty: number | null;
  vibeTags: string[]; cuisineTags: string[]; amenities: string[];
  roomTypes: string[]; highlights: string[]; tags: string[];
  lat: number | null; lng: number | null;
  saved: boolean;                 // per-user, resolved server-side
}

export interface BookingDTO {
  id: string; placeId: string;
  placeSlug: string; placeName: string;
  placeCategory: PlaceCategory;
  coverImageUrl: string | null; neighborhood: string | null;
  startDate: string | null; endDate: string | null;
  guests: number; status: string;
  createdAt: string;
}

export interface CategoryMeta {
  key: PlaceCategory; href: string; label: string;
  eyebrow: string; title: string; subtitle: string;
  searchPlaceholder: string;
}
```

Session payload (lib/auth.ts): `{ uid, email, name }` signed into the
`roam_session` cookie. API envelope:
`{ ok: true, data: T } | { ok: false, error: string }`.

---

## Appendix A: ADRs

| # | Decision | Rationale |
|---|---|---|
| ADR-1 | Single Next.js app, standalone output, SQLite | Zero-config local story; mirrors scandihaven infra conventions |
| ADR-2 | Hand-rolled HMAC cookie auth (no NextAuth) | No external identity dependency; matches the reference login flow |
| ADR-3 | Tailwind v4 CSS-first tokens in `globals.css` | The reference stack; avoids the config-file failure classes |
| ADR-4 | Prisma `db push` + deterministic JSON seed (no migrations) | Data is content, not state; reseeding is the update path |
| ADR-5 | Leaflet via `next/dynamic ssr:false` | Only stable SSR-safe react-leaflet pattern |
| ADR-6 | `status:"home"` rows for the home showcase, `status:"map"` for the demo pins | Zero schema change; browses stay pure; home/map links resolve |
| ADR-7 | Local hero + logo assets, CDN entity imagery | Stability of the chrome vs. freshness of the content |
| ADR-8 | Shared E2E storageState login | Login rate limiter makes per-test logins self-DoS |
| ADR-9 | Shared TripPlanner component routing into browses (session 3) | The live app's search goes to `/eat|/stay|/do?people&dates`, not the map |
| ADR-10 | Booking-request fields on the Booking model (session 3) | The live detail form captures name/surname/time/phone/email/message |

## Appendix B: Audit History

| Date | Pass | Findings → Fixes | Tests |
|---|---|---|---|
| Session 1 (build) | Full gate | Turbopack minifier bug → single-exit db-path; parent `.env` hijack → pinned scripts; quoted env values → strip; SaveButton staleness → `router.refresh()`; mobile-nav class D overlap → text-only compact links | 32 unit · 27 E2E · 27 smoke green |
| Session 2 (parity remediation) | Full gate + live re-measure | Live app redesign → Libre Baskerville/Poppins/fonts, image logo, glass planner hero, 4 new home sections + footer + legal pages (27 home rows); mobile overlap recurred after logo swap → 52px wordmark cap + 12px gaps; CDN load flakes → `domcontentloaded`; footer landmark → sibling of main; db:push/db:seed env pinning | 32 unit · 35 E2E · 27 smoke green |
| Session 3 (re-measure + remediation) | Full gate + live re-measure | Live app evolved again → 14 findings (docs/remediation-plan-session-3.md): palette/ink/violet retint, Poppins dropped (nav Inter), navbar redesign (glass tab-bar + white bar), TripPlanner + DateRangePicker routing into browses, sticky scroll route, card redesigns (overlaid names, active+dimmed €, dark stay cards), booking-request form + Booking fields, 9 map demo rows, profile redesign. E2E root causes fixed: HighlightedRestaurants bare `grid` → 2416px overflow dragging fixed nav off-screen (grid-cols-1); Navbar `<nav aria-label>` landmark scope; Tailwind v4 `text-[#0e0e0e]/40` compiles to `color-mix()` not `rgba()` (use explicit rgba classes in CSS assertions); getByLabel double-match (label wrapping a labeled select); BookingForm `Name*` accessible name (aria-label on input); profile `.or()` locator strict-mode conflict (`.first()`) | 42 unit · 35 E2E · 27 smoke green |

## Appendix C: Live-Site Validation Methodology

1. `agent-browser open https://activity-map.base44.app/login` → login with
   the demo account.
2. DOM-measure: `eval` computed styles (fonts, colors, radii), link boxes at
   390px and 1280px, `document.body.innerText` for content inventories.
3. Capture screenshots (desktop + 390px; `--full` for long pages).
4. VLM-compare reference vs clone screenshots (parity score + difference
   list) — then VERIFY every VLM claim against the DOM (VLMs misread
   small text and dev-tool badges; DOM is the truth).
5. Diff entity data via the app's authenticated REST (`/api/apps/<id>/entities/<E>`).
6. Update tokens/data → write the RED spec → implement → GREEN → re-capture
   screenshots into `docs/screenshots/`.

## Appendix D: Quick Reference Card

| Need | Where |
|---|---|
| Tokens | `src/app/globals.css` `@theme` |
| DB singleton | `src/lib/db.ts` (import `{ db }`) |
| URL resolution contract | `src/lib/db-path.ts` + `tests/db-path.test.ts` |
| Queries/DTOs | `src/lib/places.ts` (`listHomePlaces`, `listMapPlaces`, `toPlaceDTO`) |
| Auth | `src/lib/auth.ts` + `src/lib/rate-limit.ts` |
| Filters | `src/lib/filters.ts` + `tests/filters.test.ts` |
| Planner helpers | `src/lib/planner.ts` + `tests/planner.test.ts` |
| Nav (mobile hazard zone) | `src/components/layout/Navbar.tsx` |
| Home sections | `src/components/home/{Hero,CategoryCards,RecommendedRoute,HighlightedRestaurants,StayShowcase,HighlightedSights}.tsx` + `layout/SiteFooter.tsx` |
| Planner | `src/components/planner/{TripPlanner,DateRangePicker}.tsx` |
| Seed data | `prisma/data/{eat,stay,do,home,map}.json` + `prisma/seed.ts` |
| E2E specs | `tests/e2e/{auth,browse,home,mobile-navigation}.spec.ts` |
| Smoke suite | `scripts/smoke-test.sh` (27 checks) |
| Screenshots baseline | `docs/screenshots/` (25 captures) |
| Remediation record | `docs/remediation-plan.md` (session 2) · `docs/remediation-plan-session-3.md` (session 3) |
| Push runbook | `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` + `docs/ssh_git_wrapper_v3.py` |
