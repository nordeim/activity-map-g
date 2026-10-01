import { expect, test } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

// Login surface: the /login route renders the auth card, rejects bad
// credentials, signs the demo user in, and honors authenticated visits.
// This file OPTS OUT of the shared storageState (empty cookies) because it
// tests the logged-out surface. (Deliberately does NOT probe the rate
// limiter — 10 attempts/IP/15 min would poison the whole suite; the
// limiter is covered by scripts/smoke-test.sh.)

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("login route", () => {
  test("renders the live-parity auth card (session-10 shadcn chrome)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Welcome to Activity Map" })).toBeVisible();
    await expect(page.getByText("Sign in to continue")).toBeVisible();

    // The hosted-platform chrome rendered for parity: the Google button,
    // the "or" divider chip, the forgot-password link, and the sign-up link —
    // each answers with an inline notice instead of navigating.
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByText("or", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Forgot password?" })).toBeVisible();
    // Session-25 re-measure: the live renders the whole "Need an account?
    // Sign up" as ONE button (the emphasized part a font-medium span) — the
    // accessible name is the full string, not just "Sign up".
    await expect(page.getByRole("button", { name: "Need an account? Sign up" })).toBeVisible();

    // Session-10 re-measure: the card is the shadcn-style rounded-16 white
    // panel (radius 16px, white/95) — NOT the old rounded-28 card.
    const card = page.locator("div.rounded-2xl").first();
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS("border-radius", "16px");

    // The circular logo image rides above the heading (80px below sm).
    const logo = page.getByRole("img", { name: /logo/i });
    await expect(logo).toBeVisible();

    // The heading uses the shadcn STOCK SYSTEM stack (the live's login card
    // does not apply its Inter — the h1 computes to ui-sans-serif/system-ui,
    // which is also why it wraps to two lines like the reference).
    const h1 = page.getByRole("heading", { name: "Welcome to Activity Map" });
    const h1Font = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(h1Font.toLowerCase()).not.toContain("baskerville");
    expect(h1Font.toLowerCase()).toContain("system-ui");

    // The inputs carry the Mail / Lock icons (lucide) inside their fields.
    const emailField = page.getByLabel("Email").locator("xpath=..");
    await expect(emailField.locator("svg")).toBeVisible();
    const passwordField = page.getByLabel("Password").locator("xpath=..");
    await expect(passwordField.locator("svg")).toBeVisible();

    // Session-25 re-measure: the live's shadcn fields set text-sm — the
    // input text is 14px (the clone had drifted to text-base/16px; the
    // 48px field height and the 14px/500 labels were already exact).
    await expect(page.getByLabel("Email")).toHaveCSS("font-size", "14px");
    await expect(page.getByLabel("Password")).toHaveCSS("font-size", "14px");

    // The Sign in button is slate-900 (#0F172A) with a 12px radius (not the
    // old black pill).
    const signIn = page.getByRole("button", { name: "Sign in", exact: true });
    await expect(signIn).toHaveCSS("background-color", "rgb(15, 23, 42)");
    await expect(signIn).toHaveCSS("border-radius", "12px");

    // Session-27 re-measure: the live's login fields are RESPONSIVE — the
    // inputs carry text-base + md:text-sm (16px below md → 14px at md+)
    // over h-11 + sm:h-12 (44px below sm → 48px from sm), and the Sign-in
    // button carries the same h-11 sm:h-12 height switch. At the default
    // 1280 viewport both compute 14px/48px (the pins above); at 390 the
    // live renders 16px/44px inputs + a 44px button; at 640 the heights
    // switch (48px) while the font stays 16px until md.
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByLabel("Email")).toHaveCSS("font-size", "16px");
    await expect(page.getByLabel("Password")).toHaveCSS("font-size", "16px");
    const emailH390 = await page
      .getByLabel("Email")
      .evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(emailH390).toBe(44);
    const signInH390 = await signIn.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(signInH390).toBe(44);
    // The 640 window: the sm: heights switch on, the md: font does not.
    await page.setViewportSize({ width: 640, height: 700 });
    await expect(page.getByLabel("Email")).toHaveCSS("font-size", "16px");
    const emailH640 = await page
      .getByLabel("Email")
      .evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(emailH640).toBe(48);
    const signInH640 = await signIn.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(signInH640).toBe(48);
    // Back at 1280 the md: font + sm: height both apply (14px/48px).
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByLabel("Email")).toHaveCSS("font-size", "14px");
    const emailH1280 = await page
      .getByLabel("Email")
      .evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(emailH1280).toBe(48);

    // The page behind the card is plain white — the old photographic wash
    // is gone (session-10: the live login has no background image).
    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
    expect(bodyBg).toBe("none");
    const main = page.locator("main").first();
    const mainBgImage = await main.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(mainBgImage).toBe("none");
    // Session-12 re-measure: the live's document BODY is white too (the
    // app-wide cream body shows through on overscroll today).
    const bodyColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bodyColor).toBe("rgb(255, 255, 255)");
  });

  test("wrong password is rejected without a session", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    // .first(): a double-render of the error toast (observed once in a
    // full-suite run) must not turn the rejection check into a strict-mode
    // violation — any visible instance proves the 401 path.
    await expect(page.getByText("Incorrect email or password").first()).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("valid credentials sign in and land on the guide", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
    // Desktop chrome: the floating pill nav (not a bare page) is the
    // visible landmark once signed in.
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Augsburg City Guide" })).toBeVisible();
  });

  test("authenticated visits STAY on /login (v2.21)", async ({ page }) => {
    // The live's /login renders the form for EVERYONE — a signed-in demo
    // visit stays on /login with the card visible (measured on the live:
    // path stays /login, "Welcome to Activity Map", 2 inputs). The mirror's
    // old bounce-to-/ was clone invention; the pin flips in v2.21.
    const res = await page.request.post("/api/auth/login", {
      data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    });
    expect(res.ok()).toBeTruthy();
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/Activity Map/);
    await expect(page.getByRole("heading", { name: "Welcome to Activity Map" })).toBeVisible();
  });

  test("the legal pages match the live (session-25)", async ({ page }) => {
    // The live's legal routes are /privacy-policy and
    // /accessibility-statement (its old /privacy 404s). The clone keeps
    // permanent redirects on the legacy paths so inbound links survive.
    for (const [legacy, target] of [
      ["/privacy", "/privacy-policy"],
      ["/accessibility", "/accessibility-statement"],
    ] as const) {
      await page.goto(legacy, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(target.replace("/", "\\/")));
    }

    // Chrome contract (measured on the live): the ← Back home link
    // (14px/400, #8A8780, href=/), the max-w-3xl content column, the 48px
    // Libre Baskerville h1, 14px/28px #5F5C56 paras, NO "Last updated"
    // eyebrow, and no navbar/footer (the legal pages are chrome-less).
    await page.goto("/privacy-policy", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Privacy Policy \| Activity Map/);
    const back = page.getByRole("link", { name: "Back home" });
    await expect(back).toBeVisible();
    await expect(back).toHaveCSS("font-size", "14px");
    await expect(back).toHaveCSS("color", "rgb(138, 135, 128)");
    await expect(back).toHaveAttribute("href", "/");
    const h1 = page.getByRole("heading", { name: "Privacy policy" });
    await expect(h1).toHaveCSS("font-size", "48px");
    const h1Font = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(h1Font).toContain("Baskerville");
    const para = page.locator("article p").first();
    await expect(para).toHaveCSS("font-size", "14px");
    await expect(para).toHaveCSS("line-height", "28px");
    await expect(para).toHaveCSS("color", "rgb(95, 92, 86)");
    await expect(page.getByText(/last updated/i)).toHaveCount(0);
    await expect(page.getByRole("navigation")).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.getByText("Roam uses account, booking, preference, and trip details")).toBeVisible();

    await page.goto("/accessibility-statement", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Accessibility Statement \| Activity Map/);
    await expect(page.getByRole("heading", { name: "Accessibility Statement" })).toHaveCSS("font-size", "48px");
    await expect(page.getByText("Roam aims to provide a clear, readable, and navigable experience")).toBeVisible();
    await expect(page.getByRole("navigation")).toHaveCount(0);
  });
});
