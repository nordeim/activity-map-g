// Session-48 screenshot capture — the v2.19 remediated codebase (the
// calendar-day booking classification + the live's current identity/avatar
// chrome) on the dev server. Playwright drives the real UI (login → every
// page), capturing the surfaces the README references. Mirrors
// scripts/capture-screens-session46.mjs (the proven login-first pattern)
// with one addition: a SAME-DAY reservation is created before the profile
// capture so 10-profile-desktop.png documents the fix — the booking for
// TONIGHT renders under "Upcoming (1)", never Past.
//
// Usage: CAPTURE_BASE_URL=http://localhost:3000 node scripts/capture-screens-session48.mjs
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.CAPTURE_BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("docs/screenshots");
mkdirSync(OUT, { recursive: true });

const EMAIL = "sepnetflix2023@outlook.com";
const PASSWORD = "$Abcd1234";

async function login(page) {
  // Go straight to /login as the context's FIRST navigation (v2.16+ makes
  // every fresh visit a guest session, and /login bounces authenticated
  // visitors back to / — so a prior goto(BASE) would leave the form never
  // rendering). Exact-match labels + settle + VERIFY the values before
  // submit: a fill landing before hydration is silently reset (the
  // session-35 empty-fields 400 lesson).
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
  // v2.18: login FIRST (a fresh visit bootstraps a guest session, which
  // would bounce /login) — the demo-account captures then run signed in.
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

  // Session-48: a SAME-DAY reservation (tonight 19:00) via the page's own
  // authenticated request context — the profile capture then documents the
  // calendar-day fix: the booking sits under "Upcoming (1)", never Past.
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

  // Session-48: the profile now shows the live's CURRENT identity — h1
  // "Explorer" + the static "Your Roam account" line (the email line is
  // gone upstream) + the same-day booking under Upcoming.
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
  await anon.close();
} finally {
  await browser.close();
}
console.log("session-48 capture set complete");
