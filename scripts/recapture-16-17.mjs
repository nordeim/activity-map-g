import { chromium } from "@playwright/test";
import path from "node:path";

// Re-capture 16-login.png + 17-guest-profile-desktop.png (the earlier run
// aborted at the mobile-map tile-wait, before these two). The
// anonymous-context pattern from capture-screens-session63.mjs: the same
// fresh context's first navigation bootstraps the guest session.
const BASE = process.env.CAPTURE_BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("docs/screenshots");

const browser = await chromium.launch();
try {
  const anon = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const ap = await anon.newPage();
  await ap.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await ap.waitForTimeout(700);
  await ap.screenshot({ path: path.join(OUT, "16-login.png") });
  console.log("captured 16-login.png");
  await ap.goto(`${BASE}/profile`, { waitUntil: "domcontentloaded" });
  await ap.waitForTimeout(700);
  await ap.screenshot({ path: path.join(OUT, "17-guest-profile-desktop.png") });
  console.log("captured 17-guest-profile-desktop.png");
  await anon.close();
} finally {
  await browser.close();
}
