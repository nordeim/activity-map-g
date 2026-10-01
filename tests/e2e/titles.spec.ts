import { expect, test } from "@playwright/test";

// v2.21: the document-title parity sweep. The live's tab titles were
// re-measured on every route (2026-10-01, logged in + anonymous — they do
// not differ): home and /login render the bare app name "Activity Map",
// every other route renders "<Short> | Activity Map" — including the MAP
// page's "Discover | Activity Map" (not "Map") and the PLACE detail's
// "Place Page | Activity Map" (the live never puts the place name in the
// tab). The legal pages already matched (session-25). The mirror's old
// "ROAM — Augsburg City Guide" / "X · ROAM" titles were clone branding —
// flipped to the live's measured strings in v2.21.
//
// Runs with the shared demo storageState (the signed-in corpus) — the
// titles are auth-independent on the live.

const TITLES: Array<{ path: string; title: string }> = [
  { path: "/", title: "Activity Map" },
  { path: "/eat", title: "Eat | Activity Map" },
  { path: "/stay", title: "Stay | Activity Map" },
  { path: "/do", title: "Do | Activity Map" },
  { path: "/map", title: "Discover | Activity Map" },
  { path: "/favourites", title: "Favourites | Activity Map" },
  { path: "/profile", title: "Profile | Activity Map" },
  { path: "/place/courtyard-stay", title: "Place Page | Activity Map" },
];

test.describe("document titles (v2.21 live parity)", () => {
  for (const { path, title } of TITLES) {
    test(`the tab title on ${path} is "${title}"`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveTitle(title);
    });
  }
});
