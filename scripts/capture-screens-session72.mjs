// Session-72 screenshot capture — the v2.31 remediated codebase: the
// search-input model re-aligned to the live (typed text at font-weight
// 400 in #141413 with the ::placeholder override at 500 + black/40, the
// input h-11 md:h-auto — 44px below md, content-driven ~20px at md+,
// safe under the pill's min-h-[54px] / the map row's h-12) on BOTH the
// browse planner and the /map search row. The full 22-capture suite
// re-run on the remediated tree (mirrors the session-70 script: login →
// every page, the mid-trap route capture, the settled stays fan, the
// picker popovers, the same-day booking before the profile capture, the
// search-active + zero-state map captures, the mobile set, the login
// card, and the guest profile).
//
// Usage: CAPTURE_BASE_URL=http://localhost:3000 node scripts/capture-screens-session72.mjs
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.CAPTURE_BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("docs/screenshots");
mkdirSync(OUT, { recursive: true });

const EMAIL = "sepnetflix2023@outlook.com";
const PASSWORD = "$Abcd1234";

async function login(page) {
  // /login renders the auth card for every session state (v2.21 — the
  // live's contract), so the form is always there on the first navigation.
  // Exact-match labels + settle + VERIFY the values before submit: a fill
  // landing before hydration is silently reset (the session-35
  // empty-fields 400 lesson).
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  const email = page.getByLabel("Email");
  const password = page.getByLabel("Password");
  await email.fill(EMAIL);
  await password.fill(PASSWORD);
  await page.waitForFunction(
    ([id1, val1, id2, val2]) =>
      document.getElementById(id1)?.value === val1 &&
      document.getElementById(id2)?.value === val2,
    ["email", EMAIL, "password", PASSWORD],
  );
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => url.pathname === "/" || url.pathname === "", {
    timeout: 15_000,
  });
}

async function shot(page, name, { fullPage = false, scroll = null } = {}) {
  if (scroll !== null) await page.evaluate((y) => window.scrollTo(0, y), scroll);
  await page.waitForTimeout(700); // fonts + late images settle
  await page.screenshot({ path: path.join(OUT, name), fullPage });
  console.log(`captured ${name}`);
}

const pad = (n) => String(n).padStart(2, "0");
const todayIso = () => {
  const t = new Date();
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
};

const browser = await chromium.launch();
try {
  // ---- desktop (1280×900) ----
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const dp = await desktop.newPage();
  // Login FIRST — the demo-account captures then run signed in.
  await login(dp);
  await dp.evaluate(() => document.fonts.ready);
  await shot(dp, "01-home-desktop.png");
  // Session-60: the CARTO map mid-trap (the map + the split-color progress
  // pill + the center-slot stop card) — the route body starts ≈1221.
  await shot(dp, "02-home-route-desktop.png", { scroll: 2500 });
  await shot(dp, "03-home-restaurants-band-desktop.png", { scroll: 5200 });
  // Session-61: the STAYS FAN — the fully-visible engagement state. The
  // page's lazy images shift the layout while loading, so the capture
  // first WALKS the scroll down through the whole page (triggering every
  // lazy load + letting the scroll-linked effects settle), then captures
  // the section heading + first row (04) and the fully-fanned state (20:
  // the grid's top + 400px — the top cards at ±6°, the middle column
  // raised ~166px, the live's look at the same position).
  await dp.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await dp.waitForTimeout(600);
  await dp.evaluate(async () => {
    const ul = document.querySelector("#stay-showcase ul");
    const gridY = ul.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, gridY - 550);
    await new Promise((r) => setTimeout(r, 500));
  });
  await dp.waitForTimeout(900);
  await dp.screenshot({ path: path.join(OUT, "04-home-stays-vibe-desktop.png") });
  console.log("captured 04-home-stays-vibe-desktop.png");
  await dp.evaluate(async () => {
    const ul = document.querySelector("#stay-showcase ul");
    const gridY = ul.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, gridY + 400);
    await new Promise((r) => setTimeout(r, 500));
  });
  await dp.waitForTimeout(900);
  await dp.screenshot({ path: path.join(OUT, "20-home-stays-fan-settled-desktop.png") });
  console.log("captured 20-home-stays-fan-settled-desktop.png");
  await dp.goto(`${BASE}/eat`, { waitUntil: "domcontentloaded" });
  await shot(dp, "05-eat-desktop.png");
  await dp.goto(`${BASE}/stay`, { waitUntil: "domcontentloaded" });
  await shot(dp, "06-stay-desktop.png");
  await dp.goto(`${BASE}/map`, { waitUntil: "domcontentloaded" });
  // Session-65: the keyed light_nolabels tiles stream from the network — wait for
  // at least a dozen tile imgs to decode before the capture (the fitted z15
  // view shows ~18-24 tiles; this documents the real basemap).
  await dp.waitForFunction(
    () => document.querySelectorAll("img.leaflet-tile").length >= 12,
    { timeout: 15_000 },
  );
  await dp.waitForTimeout(1200);
  await shot(dp, "07-map-desktop.png");
  // Session-68: the SEARCH-ACTIVE state — submit "garden" on the map and
  // capture the shell card restructured to a column (the search pill, the
  // violet STATUS PILL "Searching for garden-related options in
  // Augsburg.", the filter button below) + the narrowed 1-pin canvas + the
  // events chip reading "0 events · 1 places".
  await dp.getByLabel("Search the map").fill("garden");
  await dp.getByLabel("Search the map").press("Enter");
  await dp.waitForSelector(".map-search-status", { timeout: 10_000 });
  await dp.waitForTimeout(1800);
  await shot(dp, "21-map-search-status-desktop.png");
  // Session-70 (v2.30): the SEARCH-RESOLVED ZERO state — clear the garden
  // query, submit a no-match "castle" and capture the live's WHITE
  // "No places found" card (rounded-28, py-14, 20px serif ink) with the
  // chip reading "0 events · 0 places".
  await dp.getByLabel("Clear search").click();
  await dp.waitForTimeout(400);
  await dp.getByLabel("Search the map").fill("castle");
  await dp.getByLabel("Search the map").press("Enter");
  await dp.waitForSelector(".map-empty-card", { timeout: 10_000 });
  await dp.waitForTimeout(600);
  await shot(dp, "22-map-no-places-found-desktop.png");
  await dp.goto(`${BASE}/place/courtyard-stay`, { waitUntil: "domcontentloaded" });
  await shot(dp, "08-place-detail-desktop.png");

  // ---- the booking-form picker popovers, OPEN ----
  // The date-range calendar: open the popover, jump to a FUTURE month
  // (date-robust — all its days are enabled), pick a start day (the 5th)
  // so the capture documents BOTH the calendar and the trigger's
  // "— select end date" intermediate state.
  await dp.getByRole("button", { name: /^Dates\*/ }).click();
  await dp.waitForSelector("[data-booking-calendar]");
  await dp.locator("[data-booking-calendar] select").selectOption({ index: 1 });
  await dp.waitForTimeout(300);
  await dp
    .locator("[data-booking-calendar] button[data-day]")
    .filter({ hasText: /^5$/ })
    .last()
    .click();
  await dp.waitForTimeout(400);
  await shot(dp, "18-booking-date-picker.png");
  // Complete the range (5 → 7) then open the TIME list, select 19:00, and
  // capture the LIST ELEMENT itself (the 29-slot popover is ~1270px tall —
  // taller than the viewport — so an element capture is the only complete
  // view; the locator.screenshot() path per the session-27 lesson).
  // Session-60: the STAY form's time trigger opens via the live's new
  // "Preferred Check-In Time*" label.
  await dp
    .locator("[data-booking-calendar] button[data-day]")
    .filter({ hasText: /^7$/ })
    .last()
    .click();
  await dp.waitForTimeout(400);
  await dp.getByRole("button", { name: /^Preferred Check-In Time\*/ }).click();
  await dp.waitForSelector("[data-booking-time-list]");
  await dp.locator("[data-booking-time-list]").getByRole("button", { name: "19:00", exact: true }).click();
  await dp.waitForTimeout(300);
  await dp.getByRole("button", { name: /^Preferred Check-In Time\*/ }).click();
  await dp.waitForSelector("[data-booking-time-list]");
  await dp.waitForTimeout(400);
  await dp.locator("[data-booking-time-list]").screenshot({
    path: path.join(OUT, "19-booking-time-picker.png"),
  });
  console.log("captured 19-booking-time-picker.png");
  await dp.keyboard.press("Escape");

  await dp.goto(`${BASE}/favourites`, { waitUntil: "domcontentloaded" });
  await shot(dp, "09-favourites-desktop.png");

  // A SAME-DAY reservation (tonight 19:00) via the page's own authenticated
  // request context — the profile capture then documents the calendar-day
  // contract: the booking sits under "Upcoming (1)", never Past.
  const placeRes = await dp.request.get(`${BASE}/api/places/courtyard-stay`);
  const placeBody = await placeRes.json();
  const placeId = placeBody?.data?.place?.id;
  const bookingRes = await dp.request.post(`${BASE}/api/bookings`, {
    data: {
      placeId,
      startDate: todayIso(),
      endDate: todayIso(),
      guests: 2,
      name: "Ada",
      surname: "Lovelace",
      time: "19:00",
      email: "ada@example.com",
    },
  });
  console.log(`same-day booking -> ${bookingRes.status()} (place ${placeId})`);

  // The demo profile: h1 "sepnetflix2023" + the account EMAIL line (the
  // authenticated contract, unchanged) + the same-day booking under
  // Upcoming.
  await dp.goto(`${BASE}/profile`, { waitUntil: "domcontentloaded" });
  await shot(dp, "10-profile-desktop.png");
  // The session-33 footer contract: grown pill when scrolled into view.
  await dp.goto(BASE, { waitUntil: "domcontentloaded" });
  await shot(dp, "11-footer-grown-desktop.png", {
    scroll: await dp.evaluate(() => document.documentElement.scrollHeight),
  });
  await desktop.close();

  // ---- mobile (390×844) ----
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const mp = await mobile.newPage();
  await login(mp);
  await mp.evaluate(() => document.fonts.ready);
  await shot(mp, "12-mobile-home.png");
  await mp.goto(`${BASE}/eat`, { waitUntil: "domcontentloaded" });
  await shot(mp, "13-mobile-eat.png");
  await mp.evaluate(() => window.scrollTo(0, 0));
  await shot(mp, "14-mobile-nav-tabbar.png");
  await mp.goto(`${BASE}/map`, { waitUntil: "domcontentloaded" });
  // 390×844 shows only ~6-9 tiles at the fitted z13 — wait for a handful to
  // attach (the keyed tiles stream from the network).
  await mp.waitForFunction(
    () => document.querySelectorAll("img.leaflet-tile").length >= 4,
    { timeout: 15_000 },
  );
  await mp.waitForTimeout(1200);
  await shot(mp, "15-mobile-map.png");
  await mobile.close();

  // ---- login (chrome-less, 1280×900) ----
  const anon = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const ap = await anon.newPage();
  await ap.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await shot(ap, "16-login.png");

  // ---- the GUEST profile (the live's ANONYMOUS identity) ----
  // The same fresh context's first navigation bootstraps the guest session;
  // the guest profile then documents the anonymous contract: h1 "Explorer" +
  // the STATIC "Your Roam account" line (and the desktop navbar avatar on
  // the way renders the lucide-user glyph, no letter).
  await ap.goto(`${BASE}/profile`, { waitUntil: "domcontentloaded" });
  await shot(ap, "17-guest-profile-desktop.png");
  await anon.close();
} finally {
  await browser.close();
}
console.log("session-72 capture set complete (22 captures)");
