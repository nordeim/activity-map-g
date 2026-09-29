import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.CAPTURE_BASE_URL ?? "http://127.0.0.1:3005";
const OUT = path.resolve("docs/screenshots");
mkdirSync(OUT, { recursive: true });

const EMAIL = "sepnetflix2023@outlook.com";
const PASSWORD = "$Abcd1234";

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => url.pathname === "/" || url.pathname === "", {
    timeout: 15_000,
  });
}

async function shot(page, name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log("wrote", file);
}

const browser = await chromium.launch();

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await login(page);
  await page.waitForTimeout(800);
  await shot(page, "session34-desktop-home.png");
  await page.goto(`${BASE}/eat`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  await shot(page, "session34-desktop-eat.png");
  await page.goto(`${BASE}/map`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  await shot(page, "session34-desktop-map.png");
  await page.close();
}

{
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  await login(page);
  await page.waitForTimeout(800);
  await shot(page, "session34-mobile-home.png");
  const nav = page.getByRole("navigation", { name: "Primary" });
  await nav.getByRole("link", { name: "Eat", exact: true }).tap();
  await page.waitForTimeout(400);
  await shot(page, "session34-mobile-eat-nav.png");
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  await shot(page, "session34-login.png");
  await page.close();
}

await browser.close();
console.log("done");
