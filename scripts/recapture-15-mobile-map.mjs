import { chromium } from "@playwright/test";
import path from "node:path";

// Re-capture just 15-mobile-map.png (the earlier run's 8-tile threshold
// exceeded the 390 viewport's ~6 visible tiles). Same login-first pattern
// as capture-screens-session63.mjs.
const BASE = process.env.CAPTURE_BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("docs/screenshots");
const EMAIL = "sepnetflix2023@outlook.com";
const PASSWORD = "$Abcd1234";

const browser = await chromium.launch();
try {
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const mp = await mobile.newPage();
  await mp.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await mp.waitForTimeout(600);
  await mp.getByLabel("Email").fill(EMAIL);
  await mp.getByLabel("Password").fill(PASSWORD);
  await mp.getByRole("button", { name: "Sign in" }).click();
  await mp.waitForURL((url) => url.pathname === "/" || url.pathname === "", { timeout: 15_000 });
  await mp.goto(`${BASE}/map`, { waitUntil: "domcontentloaded" });
  await mp.waitForFunction(
    () => document.querySelectorAll("img.leaflet-tile").length >= 4,
    { timeout: 15_000 },
  );
  await mp.waitForTimeout(1200);
  await mp.screenshot({ path: path.join(OUT, "15-mobile-map.png") });
  console.log("captured 15-mobile-map.png");
  await mobile.close();
} finally {
  await browser.close();
}
