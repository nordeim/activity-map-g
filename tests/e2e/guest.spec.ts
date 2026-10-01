import { expect, test } from "@playwright/test";

// Guest bootstrap (login-free first visit): a FRESH visitor — empty
// storageState, no roam_session cookie — must land straight in the guide.
// The (app)/(bare) layouts redirect session-less visitors to
// GET /api/auth/guest, which provisions/uses the seeded guest account
// (guest@roam.local), signs the 7-day session cookie, and 303s back to the
// guide. This file OPTS OUT of the shared storageState (like auth.spec.ts)
// because it tests the logged-OUT surface; navigations use
// waitUntil: "domcontentloaded" per the helpers.ts CDN-font note.

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("guest bootstrap", () => {
  test("a fresh visit lands on the guide without the login wall", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // / → 307 /api/auth/guest → 303 (Set-Cookie) → /
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Augsburg City Guide" })).toBeVisible();
  });

  test("the issued session resolves to the seeded guest account", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();

    const me = await page.request.get("/api/auth/me");
    expect(me.ok()).toBeTruthy();
    const body = (await me.json()) as { data?: { user?: { email?: string; name?: string } } };
    expect(body.data?.user?.email).toBe("guest@roam.local");
    // v2.21: the guest account's NAME is "Explorer" — the live's anonymous
    // default identity (the live went open: anonymous visitors browse every
    // page, and their profile renders h1 "Explorer"). The guest account IS
    // the clone's anonymous state, so it renders the same name.
    expect(body.data?.user?.name).toBe("Explorer");
  });

  test("the profile renders the guest identity", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    // v2.21: the live's ANONYMOUS profile contract — h1 "Explorer" + the
    // STATIC "Your Roam account" 16px line (measured on the live with
    // cleared cookies; the live's authenticated profile keeps the account
    // name + email). The guest account is the clone's anonymous state.
    await expect(page.getByRole("heading", { name: "Explorer", exact: true })).toBeVisible();
    await expect(page.getByText("Your Roam account")).toBeVisible();
    // The guest's own email must NOT surface on the anonymous profile
    // surface (the live renders the static line, not an address).
    await expect(page.getByText("guest@roam.local")).toHaveCount(0);
  });

  test("signing out returns to the guide as a fresh guest, not the login wall", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  });

  test("the bootstrap refuses open redirects", async ({ page }) => {
    const res = await page.request.get("/api/auth/guest?next=https%3A%2F%2Fevil.example", {
      maxRedirects: 0,
    });
    expect(res.status()).toBe(303);
    const location = res.headers()["location"] ?? "";
    expect(location).not.toContain("evil.example");
    // v2.17: the Location is a RELATIVE reference — origin-agnostic behind
    // any reverse proxy (the live-site localhost-bounce regression).
    expect(location).toBe("/");
  });

  // v2.18: deep links survive the login-free first visit. The pages 307
  // session-less visitors through the bootstrap WITH their own path as next
  // (the layouts cannot know the request path — verified — so the page-level
  // gate owns it), and the 303 returns the visitor to the deep link instead
  // of the home default. The live source preserves logged-out deep links the
  // same way (a fresh /eat visit on the live stays on /eat).
  for (const deepLink of ["/eat", "/map", "/place/map-brass-marble"]) {
    test(`a fresh deep link to ${deepLink} returns to ${deepLink} after the bootstrap`, async ({ page }) => {
      await page.goto(deepLink, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(`${deepLink.replace(/[/?]/g, "\\$&")}$`), {
        timeout: 15_000,
      });
      await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    });
  }
});
