// Session-35 screenshot capture — the remediated codebase on the dev server.
// Playwright drives the real UI (login → every page), capturing the surfaces
// the README references. Mirrors scripts/capture-screenshots.mjs (the
// session-34 pattern) with the session-35 set: 12 desktop + mobile captures.
//
// Usage: CAPTURE_BASE_URL=http://localhost:3000 node scripts/capture-screens-session35.mjs
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.CAPTURE_BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("docs/screenshots");
mkdirSync(OUT, { recursive: true });

const EMAIL = "sepnetflix2023@outlook.com";
const PASSWORD = "$Abcd1234";

async function login(page) {
  // Go straight to /login (a prior goto(BASE) bounces through the auth
  // redirect and the fill can land BEFORE React hydration — hydration then
  // resets the controlled inputs to "" and the submit posts empty fields,
  // a 400). Exact-match labels + settle + VERIFY the values before submit.
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

const browser = await chromium.launch();
try {
  // ---- desktop (1280×900) ----
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const dp = await desktop.newPage();
  await dp.goto(BASE, { waitUntil: "domcontentloaded" });
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
console.log("session-35 capture set complete");
