---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
---

# ROAM — Augsburg City Guide

A production-grade, self-hosted clone of `activity-map.base44.app`: a city guide for Augsburg with a trip-planner home page, Eat / Stay / Do browse views, place detail with booking, an interactive Leaflet map, favourites, and a profile with trips and bookings — visits are LOGIN-FREE (fresh visitors are auto-signed-in as a seeded guest account; the demo login remains available at `/login`). Maintained by nordeim; cloned and rebuilt to be locally deployable with zero external services.

**Tech Stack**: Next.js 16 (App Router, npm `next start` runtime), React 19, TypeScript 5, Tailwind CSS 4 (CSS-first), Prisma 6 + SQLite, Leaflet, Vitest, Playwright. Fonts: Libre Baskerville (display serif) + Inter (UI sans AND nav — re-measured session 3; the live app dropped Poppins).

## Core Identity & Purpose

ROAM solves one problem: the reference trip-planning app is locked behind a hosted platform. This repo reproduces it — every view, the measured filter semantics, the visual design tokens, and the 42 seeded places captured from the live app plus its 27 home-only showcase rows (route, sights, restaurants) and 9 map-demo rows — as a single Next.js application with cookie-session auth (guest-first: no login wall) and a SQLite store, so it runs anywhere with `npm install && npm run db:push && npm run db:seed`.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

1. **ANALYZE** — Never make surface-level assumptions; measure the reference behavior (screenshots, DOM, pixel sampling) before coding.
2. **PLAN** — Create a detailed plan with sequential phases; present for confirmation.
3. **VALIDATE** — Obtain explicit approval before implementation.
4. **IMPLEMENT** — Modular, testable components; document alongside code.
5. **VERIFY** — Run the full gate (lint → typecheck → unit → build → smoke → E2E) before delivery.
6. **DELIVER** — Complete handoff with instructions.

### Project-Specific Principles

- **Fidelity to the measured reference**: design tokens, chip semantics, and mobile chrome come from the live app, not invention. When in doubt, re-measure.
- **Zero-config local story**: SQLite + file-based sessions; no Redis, no external auth, no CI dependency.
- **Pure seams are unit-tested**: display and resolution logic lives in `src/lib/*` pure functions with Vitest coverage, not inline in components.

## Implementation Standards

### Next.js 16 Specific

- App Router conventions (`src/app/`); Server Components by default, `"use client"` only for interactivity (the 23 client components: LoginForm, Navbar, Hero, RecommendedRoute, HighlightedRestaurants, LetterReveal, CategoryExplorer, PlaceCard, StayCard, SaveButton, BookingForm, BookingDatePicker + BookingTimePicker — session-53: the booking form's picker popovers, TripPlanner, BrowsePlanner, DateRangePicker, MapExplorer, LeafletCanvas, FavouritesView, ProfileView, StayShowcase + HighlightedSights — session-31: both became client components to own their parallax listeners; SiteFooter — session-33: owns the scroll-linked pill-growth listener).
- Route handlers for the API surface (`src/app/api/**/route.ts`), `export const dynamic = "force-dynamic"` on session-scoped routes.
- Leaflet mounts through `next/dynamic` with `ssr: false` — `react-leaflet` in a server component crashes the build.
- Remote images restricted via `next.config.ts` `remotePatterns` (`media.base44.com`, `z-cdn.chatglm.cn`).

### TypeScript

- `strict: true` with one intentional exception: `noImplicitAny: false`. Prefer `unknown` over `any` in new code anyway.
- Path alias `@/*` → `src/*` (tsconfig + vitest both configure it).
- API payloads are typed by `src/types/index.ts` (`PlaceDTO`, `BookingDTO`, `PlaceCategory`) — serialize at the boundary in `src/lib/places.ts`, never leak Prisma rows.

### Tailwind CSS 4

- **CSS-first configuration — there is NO `tailwind.config.*`.** Tokens are `@theme` variables in `src/app/globals.css` (re-measured session 3): `--color-cream #F8F7F4`, `--color-cream-deep`/`--color-surface2 #F2F1EE`, `--color-ink #0E0E0E`, `--color-roam #571AFF`, `--color-electric #4D61FF` (the live home's blue band), `--color-secondary #3A3A3A`, `--color-muted #888580`, `--color-line #E8E6DC`, `--color-border #DDDBD5`, `--font-sans` (Inter), `--font-serif` (Libre Baskerville — the live app's display serif), `--font-nav` (Inter — the live app dropped Poppins), `--shadow-card/-float/-hero`, `--radius-4xl`.
- Custom primitives are `@utility` definitions: `bg-grid`, `no-scrollbar` (the `hero-shade` utility was REMOVED in session-31 — the live renders its hero image raw).
- Mobile navigation is the known v4 hazard — failure classes (no-nav / invisible / clipped / under-layer / breakpoint mismatch) are regression-pinned by `tests/e2e/mobile-navigation.spec.ts`. The Navbar's `no-scrollbar` overflow safety valve must stay.
- Mobile chrome (re-measured sessions 6 + 22): below `md`, a fixed-top cream-glass tab-bar (session-23: 52px border-box total — nav h-[51px] + the header's 1px border-b; ≤430px centered, text-only 12px Inter links at `tracking-[-0.01em]`, MapPin/Heart/User right icons; session-22: bg `rgba(248,247,244,0.62)` + `backdrop-filter: blur(24px) saturate(1.5)` — the two backdrop utilities compose into one declaration; **session-32: the middle link group SHRINK-WRAPPED — `min-w-0` + `mr-2`, no `flex-1`** — the four text links measure x=121/192/222/259 at 390 / 246/317/347/384 at 640, and every nav link carries `press-shrink` (the live's touch feedback: `transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s` + `:active scale(0.97)` — the unlayered globals.css rule) with the 200ms color transition moved to the LABEL span so the two `transition` shorthands never collide); from `md`, a sticky transparent header centering the WHITE floating pill (`h-14`, max-w 820, radius 999, full `#E8E6DC` border, 13px icon+text links at `tracking-[0.01em]`, active 700 on the `rgba(14,14,14,0.08)` pill, inactive `#555550`, hide-on-scroll choreography). The footer is the live's compact shrink-wrapped GLASS pill — border 1px `#E8E6DC`, `backdrop-filter: blur(40px) saturate(1.5)`, the soft `0 2px 12px /0.08` shadow; **session-33: the desktop growth is SCROLL-LINKED and CONTINUOUS — the pill interpolates linearly with the footer's visible fraction p (SiteFooter's rAF-throttled scroll listener writes the `--footer-p` CSS var; gap 8+4p, pad (8+4p)/(10+6p), radius 28+6p, links 74+18p × 78+14p r-(18+6p), icons 20+4p, labels 11+1p) from the compact 506×96 offscreen model to the grown 646×118 (r-34, pad 12px 16px, gap 12, links 92×92 r-24 with 24px icons over 12px/600 labels in one row) when fully visible, compacting back when it leaves — smoothed by 120ms linear transitions (`md:footer-pill-transition` + `footer-link-transition`, the mobile pill `transition-none`)**; below md: radius 28, pad 8px 10px, links 104×78 (20px icon over 11px/600 label) in the 3-col grid — the mobile pill NEVER grows; the links carry the VIOLET hover at both breakpoints (`footer-link-hover`: `transform: translateY(-12px) scale(1.1)` as one matrix + the #571AFF fill + white text + the `0 16px 34px /0.28` glow, the svg's own hover `scale: 1.1` — unguarded) with the icons `strokeWidth={2.1}` and the labels `tracking-[-0.01em]`; the footer element owns pt-32/pb-24 mobile → pt-64/pb-56 desktop with NO top margin (home hands off flush at md / 22px on phones; browses/map/detail 96px); inner max-w-5xl; the legal row justify-between from md (© 12px `#8A8780`). **Session-26:** the footer element carries `px-5` itself and switches its vertical pads at **sm (640)**; the legal row carries a 1px `black/[0.05]` TOP HAIRLINE + pt-3/sm:pt-5 + mt-4/sm:mt-8; below md BOTH the pill and the legal row cap at `max-w-[390px]` centered. It renders from the `(app)` layout on every page (SiteFooter is a client component owning the scroll listener). Do not "fix" the asymmetry.
- **Tailwind v4 cascade gotcha (twice-hit)**: globals.css carries UNLAYERED rules (`body { background-color }`, the h1 reset) — unlayered styles beat every `@layer` utility. When a utility must override them (the login body white), use an INLINE STYLE, not a class.

### React 19

- No `forwardRef`; function components with props.
- State: local `useState`/`useMemo` only — no Zustand, no React Query, no server actions. Navigation refreshes via `router.refresh()` after mutations (favourites, bookings) so server components re-render with fresh data.

## Development Workflow

### Environment Setup

```bash
npm install
cp .env.example .env
npm run db:push     # apply schema (db push — no migrations folder)
npm run db:seed     # 78 places (42 published + 27 home-only + 9 map-demo) + demo user + guest user (wipes domain tables)
npm run dev         # http://localhost:3000
```

Demo login (optional — visits are login-free): fresh visitors are auto-signed-in as the seeded guest account (`guest@roam.local`, name "Explorer" — the live's ANONYMOUS default identity, v2.21: the live went open and its logged-out profile renders h1 "Explorer" + the static "Your Roam account" line); the demo account `sepnetflix2023@outlook.com` / `$Abcd1234` (seeds as name "sepnetflix2023" — the live account's current identity, session-50) remains available at `/login`.

### Build Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server (port 3000, pinned `DATABASE_URL`) |
| `npm run build` | Production build (Turbopack) |
| `npm run start` | Production server (`next start`, pinned `DATABASE_URL`) |
| `npm run lint` | ESLint (next core-web-vitals + typescript) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest unit suite (117 checks) |
| `npm run test:e2e` | Playwright E2E (109 checks; requires a build) |
| `npm run db:push` / `db:generate` / `db:seed` | Prisma schema / client / seed |

### Database (Prisma)

```bash
npx prisma generate     # regenerate client after schema edits
npm run db:push         # schema → SQLite (no migrations folder by design)
npm run db:seed         # idempotent: wipes + reseeds domain tables
```

Schema changes go through `db push`, never `prisma migrate` — `prisma/migrations/` intentionally does not exist.

## Testing Strategy

### Test Pyramid

- **Unit (Vitest, 117 checks)**: pure seams — `tests/db-path.test.ts` (19: SQLite URL resolution contract, quote-stripping, standalone anchors, the Postgres-pin runtime guard), `tests/filters.test.ts` (15: chip AND-composition, special chips, search haystack), `tests/planner.test.ts` (10: planner query params, browse-target routing, date-range label formatting), `tests/auth.test.ts` (4: the cookie Secure-flag contract + the scrypt password round-trip), `tests/guest.test.ts` (27: the guest-identity contract, the never-guessable guest password hash, ensureGuestUser create-or-reuse + race settlement, the sanitizeNextPath open-redirect/loop/control-char guards, the v2.18 `guestBootstrapUrl` encoding/round-trip contract, guest session-token round-trip/tamper/expiry, the GET /api/auth/guest handler — 303 + Set-Cookie + no-clobber — and the ORIGIN-AGNOSTIC relative Location (the live-site reverse-proxy localhost-bounce regression, v2.17) — against an injected fake user store), `tests/bookings.test.ts` (8: the v2.19 CALENDAR-DAY booking classification — same-day reservations stay Upcoming, yesterday flips to Past, null/invalid dates never Past), tests/initials.test.ts (4: the v2.20 email-derived avatar-initial seam — "S" demo / uppercase / empty fallback), `tests/identity.test.ts` (5, v2.21: the STATE-DEPENDENT identity seam `src/lib/identity.ts` — the guest/anonymous constants ("Explorer" + "Your Roam account"), `isGuestEmail`, `profileSubtitle` (guest → the static anonymous line; real accounts → the email), and `avatarIsIcon` (guest → the lucide-user glyph; real accounts → the email initial)), and `tests/booking-picker.test.ts` (21, v2.22: the booking-form picker seam `src/lib/booking-picker.ts` — the 29 time slots (08:00→22:00, 30-min), the "Thu 15 Oct" date labels, the "— select end date" intermediate + the complete "Thu 15 Oct — Sat 17 Oct" range labels, the "<iso> to <iso>" hidden-input value + its POST-payload split, the 42-cell Sunday-first calendar grid (Sept 27 → Nov 7 for October 2026, past-day flags), and the 12-option month select ("October 2026" … "September 2027")), and `tests/carto.test.ts` (4, v2.27: the CARTO-key seam `src/lib/carto.ts` — the committed default key + the `?key=`/`&key=` URL builder with Leaflet's placeholders intact, since the provider deprecated anonymous raster access).
- **E2E (Playwright, 109 checks)**: boots the PRODUCTION standalone server on :3100 against its own `db/e2e.db` (schema-pushed + seeded by the global setup). Suites: `guest.spec.ts` (the LOGIN-FREE first visit — a fresh visitor lands on the guide with a guest session, /api/auth/me resolves guest@roam.local (name "Explorer"), the profile renders the v2.21 ANONYMOUS identity (h1 "Explorer" + the static "Your Roam account" line — the guest email never surfaces on it), sign-out returns to the guide as a fresh guest instead of the login wall, the bootstrap refuses open redirects, and the v2.18 DEEP-LINK pins: fresh cookie-less visits to /eat, /map, and /place/<slug> RETURN to the deep link through the bootstrap), `auth.spec.ts` (logged-out surface + login flow + the v2.21 login-STAY contract (authenticated visits stay on /login — the live renders the form for everyone) + the session-10 shadcn login chrome (session-25: the 14px `text-sm` inputs + the one-button "Need an account? Sign up" row; session-27: the RESPONSIVE fields — `text-base md:text-sm` 16px inputs + the 44px button below sm, pinned at 390/640/1280) + the session-12 white body + the session-25 LEGAL-PAGES contract — the `/privacy-policy` + `/accessibility-statement` routes (the legacy paths redirect), the ← Back home link 14px #8A8780, the 48px Libre Baskerville h1, the 14px/28px #5F5C56 paras, no nav/footer, the live's verbatim texts; navigations use `domcontentloaded` — the CDN `load` flake), `browse.spec.ts` (unified browse planner + auto-forward params + the session-12 compact 38px/12px chips + the session-14/18 heading geometry (h1 y≈168, 14px #3A3A3A subtitle, the 18px graph-paper overlay wrapping planner + chips) + browse cards + the session-24 filter-shell contracts (the 600-weight hairline chips with the violet active fill + 44px mobile targets, the floating card shell r-28/24 + hairline + 18/44 shadow + the 36px heart disc, the mobile heading pt-112 contract h1 y 112/188, the 36px Back pill, the map's sticky command center), detail booking-request round-trip + **the v2.22 picker contracts** (the Dates/Time trigger BUTTONS with the measured chrome + the calendar popover's 42-cell grid + month select + past-day disabled sweep + the range semantics on a FUTURE month (date-robust — never time-rots) + the 29-slot time list + the chevron rotate + the plain 12px/600 #2A6B3A success note + the form reset + the v2.23 CHROME pins — the label-derived trigger names (/^Dates\*/, the stay form's session-60 /^Preferred Check-In Time\*/), the VISUAL reset (`toHaveText("Choose dates")`/`"Choose time"` — the pin the v2.22 aria-label queries could not fail on), the month-row two-child structure (the relative flex-1 wrapper + the absolute pointer-events-none chevron inset right-5 + the calendar-days icon LAST at stroke 2), the font-bold select with violet hover/focus, the uppercase/700/1.2px weekday row, no aria-label/aria-expanded on the triggers, the form's font-inter, and NO font-inter on the popover containers) + rating pill/photo overlays + the session-10 max-w-6xl rounded-36 card + the session-18 SPLIT layout (the card ends after the photo, About below, the gap-6/1.2fr–0.8fr grid, the rounded-28 aside with 16px fields) + h1 y≈225, favourites round-trip + the session-12 grid overlay + 14px #3A3A3A subtitle + the session-14 scoped overlay/h1 y≈244 + the session-25 max-w-xl empty card (576 centered @1280), map pills/stats + the session-24 sticky shell (r-34 glass, white/70 hairline, 0 8 22 /0.10, pills 600, top-96 md / top-10 phones) + the session-16 FOUR-row list cards (eyebrow+price row, neighborhood, sub-category eyebrows, the live's interleaved order) + the session-18 heading overlay, profile chrome-less contract (no navbar/footer at any breakpoint, the full-page fixed grid overlay, h1 y≈203/167, centered-mobile identity, the Go back button) + the session-12 two-card layout with the session-50 identity (the account NAME h1 "sepnetflix2023" + the account EMAIL subtitle — the live's current contract after the third identity oscillation; the same-day booking lands under Upcoming via the calendar-day seam) + the v2.24 GLASS pins (the page-div padding model — the cards span 896px at md; the transparent+blurred cards with the inset-highlight shadows; the 55px mobile h1 at lh 0.92; the 18px-radius no-space-label tabs with the cream-pill count; the glass pills; the violet Saved-places hover; the centered max-w-xl subtitles + the map-glyph planner buttons — the browse pins extended the same session), `home.spec.ts` (white planner card, the session-10 hero content positions + the session-31 VH-MODEL photo framing (the absolute backdrop `top: calc(-80px+0.25vh)` / `height: calc(100%+72px)` with the ROUNDED bottom corners 32/32/60%60%/32/32/80/80 at md+ and 42%/48px on phones — 1010px @1280×800 / 1038 @1280×900 / 919 @768×900; the h1 y=267/290/319 at 720/800/900 viewports, CAPPED at 38px on phones, the 16px pill gap) + the zero-console-errors 404 hydration contract + the session-31 CENTERED vibe heading (px-18 + max-w-94vw, symmetric extents) + the showcase 1.16 zoom/parallax contracts + the session-14 px-6 hero content, desktop floating-pill navbar (with the session-22 +0.01em link tracking), the session-10 category-card internals + mobile snap carousel + the session-12 compacted height + **the session-60 3D-FAN contract (the wrapper's `transform: scale(1.15)`, the perspective-800 slots, the ±18° tilts + the hover flatten at 0.5s, the in-card clipped View All as the deck's 4th 36px item with the hover `-44px` deck slide + the expanded clip-path, the bg 0.34/0.58 + saturate 160%, radius 20 at both breakpoints)**, text route cards + the session-18 mobile route visual (full-viewport map, no mobile chip, rounded-28 cards) + **the session-60 CARTO-MAP route contract (the `1500×1500` svg with 25 `light_nolabels` z14 tiles, the dashed base + solid progress paths, the five cream waypoint circles, the ink head dot + the md-only head-centering pan, the split-color progress pill with the violet fill + the dual clipped texts, the 18px graph-paper waypoint-panel overlay, the fading heading overlay, the 416.65vh trap, the mobile identity-pan map, the center-based top-1/2 card slot, the City Gallery's "· 90 min" meta note)** + the session-20 route re-measure (the 20px/600 h3 place names at `tracking-[-0.02em]`, the 13px #72706A meta lines, the 13px Learn More, the max-w-md 448px desktop link card, the 50/50 desktop split with the y≈237 card slot, and the CONTINUOUS scroll-linked swap choreography — intermediate opacities mid-crossfade + card 0 exiting upward; deterministic `window.scrollTo` probes because `scrollIntoViewIfNeeded` on the 420vh trap is non-deterministic and late-loading images shift the layout — re-align before measuring) + the session-27 stop-card chrome (the time pill's `0 8px 22px /0.06` shadow + the 1px /0.1 hairline + the PER-STOP category icons — Coffee/Utensils/Palette/Martini/Leaf — + the #3A3A3A text, the lh-1.1 serif stop titles with mb-2, the link card's 1px /0.08 hairline, the map-pin meta row), blue restaurants carousel + the session-18 band overlap (700–900px) + the session-26 mobile STICKY STACKING deck (six cards `sticky top-[88px]`, 130px flow gaps/620px advances — a card pins at y=88 and the next slides over; the deck pads px-[18px]/pt-14) + the session-26 mobile route-heading contract (the h2 pinned INSIDE the trap at viewport y=68 with the clamp(38px,11vw,48px) font, the 220vh trap, exactly one h2 below lg) + the session-26 showcase insets (the mobile stay cards 354 @x=18 / the sights 358 @x=16) + the session-26 category-track chrome (the 12px gap + the y≈578 cards) + the session-26 footer legal-row chrome (the hairline + pt + the sm: switch + the max-w-390 640 window), letter-reveal spans + the session-31 CENTERED full-width heading (the live changed it from left-aligned; the exact live line breaks at x=123/136/263), the session-12 stay-showcase ORDER + the session-14 column-major visual arrangement (row 1 = Courtyard | Maison | Velvet, 381px cards), the session-14 sights grid (1120px, 360px cards), 24px mobile titles, dark More-Things pill, square stay/sight cards, footer, home-place detail resolution, browse purity, the session-23+32+33 footer re-measure (the glass pill: the scroll-linked growth from the compact 506×96 offscreen model to the grown 646×118 at md (r-34 + pad 12/16 + gap 12 + the 92×92 r-24 links carrying 24px icons over 12px/600 labels, one row of six), with the compact-at-load + the half-visibility interpolation midpoint (gap 10) + the transition lists + the soft pill shadow + the violet link hover (matrix(1.1, 0, 0, 1.1, 0, -12) over #571AFF) + the icons' stroke-width 2.1 + the labels' −0.01em tracking pinned; below md r-28 + pad 8/10 + the 104×78 links, `transition-none` (never grows), footer pt-64/pb-56 → pt-32/pb-24 mobile, inner max-w-5xl, the justify-between legal row with #8A8780 text) + the session-23 page-bottom spacing contracts (home card→pill 32 + pill→footer 0 desktop/22 mobile; the browse 96px last-card→footer) + the v2.26 pins (the hero planner's 0.94-white inset card, the stay grid's STAGGERED FAN — engages centered, settles ±6° with the middle column at −0.2×colHeight and the col-1 rect [−78, 418], flat at 390; the responsive 44px hearts; the desktop-only showcase parallax; the variant-specific line-heights 36/27 + 18.6/18) + the v2.27 pins (every route tile href + every Leaflet tile src carry the CARTO `?key=`; the mobile route tiles keyed; the middle column's mid-ramp ty within ±1.5px of the live's no-inset model — self-calibrating from the page's own geometry) + the v2.28 /map pins (the light_nolabels tile style + the key; the fitBounds zoom table — z15 @1280, z14 @640, z13 @390 fresh loads; the 9-pin BOUNDS-range midpoint centered (NOT the centroid — the asymmetric distribution); the fixed 356×310 mobile canvas; the maxZoom 18 cap with the disabled zoom-in control; the Enter-submitted search (typing never filters, Enter submits, empty+Enter restores); the pill-click empty-intersection FALLBACK to the pill-only set + the pure-AND query-with-pill 0/"No places" state; the re-fit on filter changes — the Hotels pill re-centers the 3 pins and climbs the 390 zoom z13 → z14; the list-header count chip ("9"/"1"/"0") + the "No places" empty state; the 28px clear button resetting both text and query)), `browse.spec.ts` footer-on-every-page checks, `mobile-navigation.spec.ts` (the five v4 failure classes + the session-22 tab-bar glass contract (blur(24px) saturate(1.5) + the 0.62 tint) + the −0.01em mobile link tracking + the session-23 tab-bar 52px border-box contract + the session-32 shrink-wrapped link positions (121/192/222/259 at 390; 246/317/347/384 at 640) + the session-32 press-shrink contract (the class + the 0.18s cubic-bezier(0.22,1,0.36,1) transition) + the v2.26 44px tap-target contract + tap navigation at 390 / 640 / 1280), and `titles.spec.ts` (8, v2.21: the DOCUMENT-TITLE parity sweep — "Activity Map" on home, "<Short> | Activity Map" on every subpage incl. the map's "Discover" and the detail's static "Place Page", never the place name).
- **Smoke (bash, 31 checks)**: `./scripts/smoke-test.sh` against a fresh production server — health, auth, the guest bootstrap (fresh visit → guide + guest cookie; auth/me resolves the guest; the 303 Location asserted RELATIVE/origin-agnostic; the signed-out page gates carry `?next=<path>`; the deep-link 303 returns to /profile), rate limiting, places, favourites, bookings, 404s.

### Test Commands

```bash
npm run test        # 117 unit checks
npm run build && npm run test:e2e   # 109 E2E checks
npm run build && ./scripts/smoke-test.sh   # 31 smoke checks
```

### Testing Rules

- E2E auth is shared: the `setup` project signs in once into `tests/e2e/.auth/user.json` (storageState) — per-test logins would trip the 10/15-min rate limiter. `auth.spec.ts` and `guest.spec.ts` opt out with an empty storageState deliberately (the logged-out / guest surfaces).
- Extend `tests/filters.test.ts` when changing `src/lib/filters.ts`; extend `tests/db-path.test.ts` when changing `src/lib/db-path.ts`; extend `tests/planner.test.ts` when changing `src/lib/planner.ts`; extend `tests/guest.test.ts` when changing `src/lib/guest.ts`. These contracts are the point, not the coverage number.
- Playwright runs single-worker (`workers: 1`) — the specs share one seeded SQLite file. Don't parallelize without isolating databases.

## Code Quality Standards

### Linting & Formatting

```bash
npm run lint && npm run typecheck
```

`eslint.config.mjs` extends `next/core-web-vitals` + `next/typescript` with several `@typescript-eslint` rules relaxed (scaffold default — match the existing style rather than re-tightening mid-feature). ESLint and tsconfig exclude `skills/`.

## Git & Version Control

### Branching Strategy

- `main` only — no feature branches.

### Commit Standards

- Conventional Commits: `feat: …`, `fix: …`, `docs: …`; atomic commits.
- Never commit `.env`, `*.key`, `db/*.db`, `node_modules/`.
- Push through the SSH wrapper from the repo root: `python3 docs/ssh_git_wrapper_v3.py --key-file <key outside repo> --remote git@github.com:nordeim/activity-map.git` (runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`). The gate order in AGENTS.md is the precondition.

## Error Handling & Debugging

### Error Handling Approach

- API failures return `{ ok: false, error: "<message>" }` with real status codes (401 unauthenticated, 400 validation, 404 unknown place/booking, 429 rate-limited) — never a bare 500 for domain errors.
- Client components degrade gracefully: the map filters to a no-results state, booking clamps guests to `minParty`/`maxParty`, the favourites empty state renders an illustration + CTA (reference parity).
- `resolveDatabaseUrl` never throws on odd input — it normalizes (quote-stripping, absolute-path passthrough) and falls back to the documented default.

### Debugging Tools

- `DEBUG_DBPATH=1` env prints every db-path anchor candidate and schema check to the server log — the first stop for SQLite `Error code 14`.
- `dev.log` / `server.log` capture dev/production stdout via the npm scripts' `tee`.
- E2E failures retain traces and screenshots (`trace: "retain-on-failure"` in `playwright.config.ts`).

## Communication & Documentation

- Explain "why", not just "what": measured values cite their source (reference screenshot, DOM query, pixel sample).
- `AGENTS.md` is the compact operator file; `Project_Architecture_Document.md` is the full engineering reference; `docs/DEPLOYMENT.md` covers production; `docs/Tailwind-V4-Validation-Report.md` records the v4 findings; `docs/screenshots/` holds the production captures.

## Project-Specific Standards

### Architecture

- **Auth gate in each page, guest-first, path-aware (v2.18)**: every authenticated page calls `requireUser("/own-path")` (`src/lib/page-gate.ts`); a session-less visitor is 307'd through the guest bootstrap (`GET /api/auth/guest?next=<page path>` in `src/app/api/auth/guest/route.ts`), which provisions/uses the seeded guest account (`guest@roam.local` — `src/lib/guest.ts`), signs the ordinary `roam_session` cookie, and 303s back — NO login wall on a fresh visit AND deep links survive it. The `(app)`/`(bare)` layouts are chrome-only (they resolve the session for the Navbar; a layout cannot learn the request path — verified — so the page-level gate owns the `?next=`). Sign-out uses a FULL navigation (the RSC soft-nav cannot follow the bootstrap's redirect chain; see ProfileView). `/login` remains a public route for the demo account (and is the only remaining place the login form appears); `/api` surfaces stay strict (401 without a session — they never auto-bootstrap). Every route handler re-checks `getSessionUser()`. Session-16: `/profile` lives in `src/app/(bare)/` — a second gated group whose layout deliberately renders NO Navbar/SiteFooter (the live's chrome-less profile).
- **Category pages are server components** that query Prisma (`src/lib/places.ts`) and hydrate `CategoryExplorer` (client) with DTOs; the explorer owns search + chip state in the URL-free local state. The browse planner is the unified `BrowsePlanner` (session-8 + session-24): ONE white glass card STICKY at `top-[10px]` below md / one sticky white pill at `top-24` from md carrying the inline search, the labelled date/people fields that AUTO-FORWARD the params back to the same browse, and two circular icon actions (56px phones / 48px md); the home `TripPlanner` renders as the Hero's glass pill and submits to the category pages with those params, and the grids date-filter accordingly. Session-18: the browse/map headings are FULL-BLEED textured sections (the 18px graph-paper overlay wrapping the planner + chips / search + pills) and the place-detail is the SPLIT layout (the rounded-36 card ends after the photo; About + form below in a `gap-6 lg:grid-cols-[1.2fr_0.8fr]` grid; the form its own rounded-28 aside with 16px-radius fields). Session-20: the Recommended Route's desktop arrangement is the 50/50 split with the CONTINUOUS scroll-linked card choreography (inline transform/opacity gated by an `isDesktop` matchMedia state — never let those inline styles reach the mobile flow). Session-27: the route stop cards carry the live's re-tightened chrome — the time pills shadowed + hairline-bordered with PER-STOP category icons (Coffee/Utensils/Palette/Martini/Leaf) + #3A3A3A text, lh-1.1 serif titles, hairline-bordered link cards, and map-pin meta rows. Session-24: the live's filter-shell design system — the chips 600-weight hairline pills with the violet active fill, the browse cards' floating shell (r-28/24 + hairline + `0 18px 44px` shadow), the map's sticky glass command center, and the mobile heading sections' uniform pt-112 contract. Session-28: the DateRangePicker popover re-measured — 510px at desktop / `calc(100vw-32px)` at mobile, pad 12, the from/to header a `grid gap-2 sm:grid-cols-2` of self-contained 238×50 white pill fields (label 12px/500 #8A8780 + value 12px/600 #141413 + a 14px calendar icon INSIDE), NO Done button, the month label 14px/500, 28×28 nav buttons, 12.8px/400 #737373 weekdays, weight-400 violet endpoints, #F7F4FF/violet in-range days, gray #737373 prev-month trailing-day buttons, 40px row pitch; the hero content wrapper carries NO z-index (a z-10 caps the popover's z-[30000] under the category section's z-10 — pointer-event interception). Session-29: the HighlightedRestaurants desktop band REDESIGNED — the heading layer is a sticky CENTERED column (`[data-band-heading]`: h2 clamp(46px,7vw,104px) + the View All pill below at gap 24) that fades out through the first ~45% of the trap while the COMPACT featured card (`[data-featured-card]`: min-w 330, pad 16, white/0.08 + 1px white/0.16 border, NO name — address + centered meta + two flex-1 h-38 12px buttons) fades in; the names watermark is a centered FIVE-NAME sliding window (`[data-band-names]`: uniform Inter clamp(24px,2.6vw,40px) 400 at gap 34, the active solid / the rest white/0.32 — circular wrap). The map list cards carry the cream-pill eyebrow + the 12px MapPin neighborhood line + the 12px grid gap; the map stats pills are shadowless; the detail hero rating pill is 61×32 (pad 8/12, the 14px star).
- **MapExplorer** (client) receives the 9 `status: "map"` demo places (the live app's map is a hardcoded array, not entity-fed), owns the category pills + search, and mounts `LeafletCanvas` via `next/dynamic({ ssr: false })`. Session-30: the pin model is the live's — 12px ink dots (2px white ring, hover scale 1.32) with hover-reveal white NAME-LABEL pills (`.roam-marker-label`, pad 7/11, 12px/700, the 5px triangle pointer); a pin click NAVIGATES directly to `/place/map-<slug>` (no popup, no violet active state — both retired); the zoom controls are two separated circular 34×34 buttons (globals.css `!important` overrides — Leaflet's CSS loads after globals.css in the chunk order). The two 404 designs: the place-404 is its own in-app page (`(app)/place/[slug]/not-found.tsx` — 46px "Place not found" + the 44px "Back to Do" pill inside the app chrome), the generic 404 is the platform slate page (`not-found.tsx` — the 72px "404", "Page Not Found", the quoted path, "Go Home" — chrome-less; session-31: the quoted path reads `window.location` through `useSyncExternalStore` — the page is statically prerendered, so `usePathname()` bakes "_not-found" into the server HTML and throws a React #418 hydration error on every visit; the store pattern (getServerSnapshot "") swaps the real path in AFTER mount with no mismatch, pinned by a zero-console-errors assertion).

### API Design

| Route | Method | Description |
|-------|--------|-------------|
| `/api/health` | GET | Liveness probe (public) |
| `/api/auth/guest` | GET | Login-free bootstrap: provisions/uses the guest account, signs the session cookie, 303 → sanitised `?next=` (default `/`) via a RELATIVE Location (origin-agnostic, v2.17) |
| `/api/auth/login` | POST | Rate-limited credential check → session cookie |
| `/api/auth/logout` | POST | Clears the session cookie |
| `/api/auth/me` | GET | Current session payload |
| `/api/places` | GET | All places (optional `?category=eat\|stay\|do`), per-user `saved` flags |
| `/api/places/[slug]` | GET | One place by slug |
| `/api/favourites` | GET / POST / DELETE | List / save / unsave (auth required) |
| `/api/bookings` | GET / POST | List / create bookings, guests clamped server-side (auth required) |

### Database / Data Layer

- Models: `User`, `Place` (category eat/stay/do + JSON-array string columns), `SavedPlace` (unique per user+place), `Booking` (status confirmed/cancelled + the session-3 request-form fields `name`/`surname`/`time`/`phone`/`email`/`message`). See `prisma/schema.prisma`.
- `import { db } from "@/lib/db"` — the Prisma singleton with runtime URL resolution. **Never construct `PrismaClient` directly**: the standalone server's SQLite path depends on `src/lib/db-path.ts` anchor logic.
- Seed data (`prisma/data/{eat,stay,do,home,map}.json`) was captured from the live app's entity API (the home/map files mirror the live page's showcase and hardcoded-map arrays); browse-row coordinates are deterministic per neighborhood (see `prisma/seed.ts`).

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | SQLite `file:` URL (relative → resolved against `prisma/schema.prisma`) or PostgreSQL string | `file:../db/custom.db` |
| `AUTH_SECRET` | HMAC key for session cookies — **required in production** (`openssl rand -hex 32`) | 64-hex string |
| `NEXT_PUBLIC_SITE_URL` | Reserved canonical-origin slot (scaffold) | `http://localhost:3000` |

## Anti-Patterns to Avoid

- **Multi-return helper functions in `src/lib/db-path.ts`** — the Turbopack production minifier demonstrably drops a `return` in that shape; keep single-exit forms.
- **Plain-CWD SQLite resolution** — the Next tracer copies `prisma/schema.prisma` into `.next/standalone`; never resolve against `process.cwd()` alone.
- **Importing `react-leaflet` outside the dynamic, `ssr: false` boundary** — instant build crash.
- **Per-test logins in E2E** — trips the rate limiter; use the shared storageState.
- **A `tailwind.config.*` file** — Tailwind v4 here is CSS-first; the config file would silently split the theme.
