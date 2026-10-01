// Session-51 screenshot capture — the v2.21 remediated codebase (the
// login-STAY contract + the anonymous-identity surfaces + the live-parity
// document titles) on the dev server. Playwright drives the real UI
// (login → every page), capturing the surfaces the README references.
// Mirrors scripts/capture-screens-session50.mjs (the proven login-first
// pattern) with the same SAME-DAY reservation before the profile capture so
// 10-profile-desktop.png documents the calendar-day classification (the
// booking for TONIGHT renders under "Upcoming (1)", never Past) — plus the
// NEW 17-guest-profile-desktop.png: a FRESH context's guest session shows
// the live's ANONYMOUS identity (h1 "Explorer" + the static "Your Roam
// account" line; the desktop nav avatar renders the lucide-user glyph).
//
// v2.21 note: /login no longer bounces authenticated visitors (the live's
// login route renders the form for everyone) — the login() helper's
// first-navigation pattern stays because it is still the cleanest path to a
// demo session, not because /login would redirect.
//
// Usage: CAPTURE_BASE_URL=http://localhost:3000 node scripts/capture-screens-session51.mjs
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
  await shot(dp, "02-home-route-desktop.png", { scroll: 2600 });
  await shot(dp, "03-home-restaurants-band-desktop.png", { scroll: 6600 });
  await shot(dp, "04-home-stays-vibe-desktop.png", { scroll: 11200 });
  await dp.goto(`${BASE}/eat`, { waitUntil: "domcontentloaded" });
  await shot(dp, "05-eat-desktop.png");
  await dp.goto(`${BASE}/stay`, { waitUntil: "domcontentloaded" });
  await shot(dp, "06-stay-desktop.png");
  await dp.goto(`${BASE}/map`, { waitUntil: "domcontentloaded" });
  await shot(dp, "07-map-desktop.png");
  await dp.goto(`${BASE}/place/courtyard-stay`, { waitUntil: "domcontentloaded" });
  await shot(dp, "08-place-detail-desktop.png");
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
  // authenticated contract, unchanged by v2.21) + the same-day booking
  // under Upcoming.
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
  await shot(mp, "15-mobile-map.png");
  await mobile.close();

  // ---- login (chrome-less, 1280×900) ----
  const anon = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const ap = await anon.newPage();
  await ap.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await shot(ap, "16-login.png");

  // ---- v2.21: the GUEST profile (the live's ANONYMOUS identity) ----
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
console.log("session-51 capture set complete (17 captures)");
