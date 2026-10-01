import { expect, test, type Page } from "@playwright/test";

// Mobile navigation (390×844 — the live app's session-6 chrome):
// a FIXED top tab-bar (cream glass #F8F7F4/62, blur, border-b) capped at
// 430px, with the compact text-only view links (12px Inter — ACTIVE =
// weight 700 ink, inactive = 500 ink-40%; re-measured session 5: the live
// app dropped the link text from 16px to 12px), the right-cluster icon
// actions (map pin / heart / user), and no element overlap. This is the
// highest-regression-risk chrome — the original scaffold's Tailwind v4
// validation found that class-based responsive utilities can silently push
// nav links UNDER neighbouring flex clusters (failure class D) or off-screen
// (class C). These specs pin: one-line layout, no element overlap,
// tap-to-navigate on every link, and the active state tracking the route.
// Contexts arrive AUTHENTICATED (setup-project storageState).

// A touch-enabled 390×844 chromium context (the iPhone geometry without
// switching browsers — locator.tap needs hasTouch).
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

// Inter loads from Google Fonts via <link> (src/app/layout.tsx). Under
// full-suite network contention the fallback font can still be active when
// geometry is measured — its wider metrics shift the shrink-wrapped link
// positions ~6px left (Highlights x=115 vs the 121±2 contract; observed
// session 35, 75/76). Every position-sensitive spec waits for the fonts
// first; the fontless assertions (heights, colors, blur) are insensitive.
async function awaitWebfonts(page: Page) {
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

test.describe("mobile navigation", () => {
  test.beforeEach(async ({ page }) => {
    // domcontentloaded: the home page pulls ~35 card images from the
    // reference CDN; waiting for the full "load" event has hit spurious
    // 45s timeouts under network contention. The nav assertions below
    // auto-wait for hydration anyway.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await awaitWebfonts(page);
  });

  test("the full-width top bar renders every element on one line", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();

    // Wordmark + the four text links + the three icon actions.
    await expect(nav.getByRole("link", { name: "ROAM home" })).toBeVisible();
    for (const label of ["Highlights", "Eat", "Stay", "Do"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    for (const label of ["Map", "Favourites", "Profile"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }

    // The bar must not overflow the 390px viewport (failure class C/E).
    const barBox = await nav.boundingBox();
    expect(barBox).not.toBeNull();
    expect(barBox!.x).toBeGreaterThanOrEqual(0);
    expect(barBox!.x + barBox!.width).toBeLessThanOrEqual(391);
  });

  test("no nav element is covered by a neighbour (failure class D)", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    const links = nav.getByRole("link");
    const boxes = await links.evaluateAll((els) =>
      els
        .filter((el) => el instanceof HTMLElement && el.offsetParent !== null)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { text: (el as HTMLElement).innerText || el.getAttribute("aria-label") || "", left: r.left, right: r.right };
        }),
    );
    expect(boxes.length).toBeGreaterThanOrEqual(7);
    // Pairwise: visible links must not horizontally overlap each other.
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        expect(Math.max(0, ix), `"${a.text}" overlaps "${b.text}" by ${ix}px`).toBeLessThanOrEqual(1);
      }
    }
  });

  test("the ACTIVE link is the bold ink one (no pill on mobile)", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    const highlights = nav.getByRole("link", { name: "Highlights", exact: true });
    await expect(highlights).toHaveCSS("font-weight", "700");
    await expect(highlights).toHaveCSS("color", "rgb(14, 14, 14)");
    await expect(highlights).toHaveAttribute("aria-current", "page");

    // Session-5 re-measure: the link text renders at 12px (was 16px).
    await expect(highlights).toHaveCSS("font-size", "12px");

    // Inactive links render dimmed (rgba(14,14,14,0.4)) at weight 500.
    const eat = nav.getByRole("link", { name: "Eat", exact: true });
    await expect(eat).toHaveCSS("color", "rgba(14, 14, 14, 0.4)");
    await expect(eat).not.toHaveAttribute("aria-current", "page");
  });

  test("the tab-bar glass matches the live (session-22: blur 24 + saturate 1.5)", async ({ page }) => {
    // Session-22 re-measure: the live's .tab-bar renders
    // rgba(248,247,244,0.62) + backdrop-filter blur(24px) saturate(1.5)
    // (the clone had /60 + blur(20) — a visibly flatter glass).
    const header = page.locator("header");
    await expect(header).toHaveCSS("backdrop-filter", "blur(24px) saturate(1.5)");
    const bg = await header.evaluate((el) => getComputedStyle(el).backgroundColor);
    // The tint may serialize as oklab() or rgba() — assert the numeric
    // channels instead of the exact string (the AGENTS.md computed-style
    // gotcha: α-blends arrive as oklab()).
    const m = /rgba?\(([^)]+)\)/.exec(bg);
    if (m) {
      const parts = m[1].split(",").map((s) => parseFloat(s));
      expect(parts.length).toBe(4);
      expect(parts[0]).toBeGreaterThan(245); // 248
      expect(parts[1]).toBeGreaterThan(245); // 247
      expect(parts[2]).toBeGreaterThan(238); // 244
      expect(parts[3]).toBeGreaterThanOrEqual(0.6); // 0.62
      expect(parts[3]).toBeLessThanOrEqual(0.64);
    } else {
      // oklab(0.976…/0.62) — assert the alpha suffix.
      expect(bg).toMatch(/0\.6[12]/);
    }
  });

  test("mobile nav link tracking is −0.01em (session-22)", async ({ page }) => {
    // The live's 12px mobile link text carries −0.01em (−0.12px).
    const nav = page.getByRole("navigation", { name: "Primary" });
    const eat = nav.getByRole("link", { name: "Eat", exact: true });
    const ls = await eat.evaluate((el) => parseFloat(getComputedStyle(el).letterSpacing));
    expect(ls).toBeLessThanOrEqual(-0.08);
    expect(ls).toBeGreaterThanOrEqual(-0.16);
  });

  test("the tab-bar totals 52px border-box (session-23)", async ({ page }) => {
    // Session-23 re-measure: the live's header.tab-bar measures 52px
    // border-box at every mobile width 390–767 (its nav is h-12 48px +
    // chrome). The clone rendered nav h-[52px] + 1px header border-b =
    // 53px — a 1px delta. The fix: nav h-[51px] so the header totals 52.
    const header = page.locator("header");
    const h = await header.evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBeGreaterThanOrEqual(51.5);
    expect(h).toBeLessThanOrEqual(52.5);
  });

  test("the text links sit at the live's shrink-wrapped positions (session-32)", async ({ page }) => {
    // Session-32 re-measure: the live's middle link group is now
    // SHRINK-WRAPPED (`min-w-0 mr-2`, no flex-1) — the four text links sit
    // 4px further LEFT than the clone's flex-1-centered group measured
    // (125/196/226/263): Highlights x=121, Eat 192, Stay 222, Do 259
    // (the logo 16/84 and the icons 304/330/356 unchanged). The geometry:
    // 358 inner − (84 logo + 154 group + 8 mr-2 + 70 icons) = 42 → two
    // 21px justify-between gaps put the group's content at x=121.
    const nav = page.getByRole("navigation", { name: "Primary" });
    const xs = await nav
      .getByRole("link")
      .evaluateAll((els) =>
        els
          .filter((el) => el instanceof HTMLElement && el.offsetParent !== null)
          .map((el) => Math.round(el.getBoundingClientRect().x)),
      );
    // Anchor elements: the logo (16), the three icon actions (304/330/356).
    expect(xs).toContain(16);
    expect(xs).toContain(304);
    expect(xs).toContain(330);
    expect(xs).toContain(356);
    // The four text links — selected by label (their desktop icons are
    // hidden-but-present spans, so an svg-less filter would miss them).
    const labels = ["Highlights", "Eat", "Stay", "Do"];
    const textXs: number[] = [];
    for (const label of labels) {
      const x = await nav
        .getByRole("link", { name: label, exact: true })
        .evaluate((el) => Math.round(el.getBoundingClientRect().x));
      textXs.push(x);
    }
    expect(textXs[0]).toBeGreaterThanOrEqual(119); // Highlights 121
    expect(textXs[0]).toBeLessThanOrEqual(123);
    expect(textXs[1]).toBeGreaterThanOrEqual(190); // Eat 192
    expect(textXs[1]).toBeLessThanOrEqual(194);
    expect(textXs[2]).toBeGreaterThanOrEqual(220); // Stay 222
    expect(textXs[2]).toBeLessThanOrEqual(224);
    expect(textXs[3]).toBeGreaterThanOrEqual(257); // Do 259
    expect(textXs[3]).toBeLessThanOrEqual(261);
  });

  test("the nav links carry the live's press-shrink feedback (session-32)", async ({ page }) => {
    // Session-32 re-measure: every live nav link carries the platform's
    // `press-shrink` utility — `transition: transform 0.18s
    // cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.18s` + `:active
    // { transform: scale(0.97) }`. The clone's links had no press
    // feedback. Pin the utility class + the computed transition contract.
    const nav = page.getByRole("navigation", { name: "Primary" });
    const logo = nav.getByRole("link", { name: "ROAM home" });
    await expect(logo).toHaveClass(/press-shrink/);
    const eat = nav.getByRole("link", { name: "Eat", exact: true });
    await expect(eat).toHaveClass(/press-shrink/);
    const mapIcon = nav.getByRole("link", { name: "Map", exact: true });
    await expect(mapIcon).toHaveClass(/press-shrink/);
    // The transition: 0.18s on transform with the live's spring curve.
    const t = await eat.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { duration: cs.transitionDuration, timing: cs.transitionTimingFunction };
    });
    expect(t.duration).toContain("0.18s");
    expect(t.timing).toContain("cubic-bezier(0.22, 1, 0.36, 1)");
  });

  test("view-link taps switch routes and move the active state", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });

    await nav.getByRole("link", { name: "Eat", exact: true }).tap();
    await expect(page).toHaveURL(/\/eat\/?$/);
    await expect(page.getByRole("heading", { name: "Eat Well Tonight" })).toBeVisible();
    const eat = nav.getByRole("link", { name: "Eat", exact: true });
    await expect(eat).toHaveCSS("font-weight", "700");
    await expect(eat).toHaveCSS("color", "rgb(14, 14, 14)");

    // Highlights lost the active weight/color.
    const home = nav.getByRole("link", { name: "Highlights", exact: true });
    await expect(home).toHaveCSS("color", "rgba(14, 14, 14, 0.4)");
  });

  test("the right-cluster icon actions navigate", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });

    await nav.getByRole("link", { name: "Map", exact: true }).tap();
    await expect(page).toHaveURL(/\/map\/?$/);
    await expect(page.getByRole("heading", { name: "Map", exact: true })).toBeVisible();

    await nav.getByRole("link", { name: "Favourites", exact: true }).tap();
    await expect(page).toHaveURL(/\/favourites\/?$/);
    await expect(page.getByRole("heading", { name: "Favourites", exact: true })).toBeVisible();

    await nav.getByRole("link", { name: "Profile", exact: true }).tap();
    await expect(page).toHaveURL(/\/profile\/?$/);
  });

  test("the hero planner fits the 390px canvas", async ({ page }) => {
    const heading = page.getByRole("heading", { name: "Augsburg City Guide" });
    await expect(heading).toBeVisible();
    const box = await heading.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(8);
    expect(box!.x + box!.width).toBeLessThanOrEqual(382);
  });
});

test.describe("middle state (640) navigation", () => {
  test.use({ viewport: { width: 640, height: 844 } });

  test("the tab-bar caps at 430px and carries the mobile chrome", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    for (const label of ["Highlights", "Eat", "Stay", "Do"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    // The bar is centered and narrower than the viewport (max-w 430).
    const box = await nav.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThan(640);
    expect(box!.x).toBeGreaterThan(4);
  });

  test("the text links sit at the live's shrink-wrapped positions at 640 (session-32)", async ({ page }) => {
    // Session-32 re-measure: at 640 the live's centered 430px tab-bar
    // puts the logo at x=121 (viewport) with the shrink-wrapped group at
    // 246 → Eat 317, Stay 347, Do 384, the icons 449/475/501. The
    // geometry: the header caps at 430 centered (x=105) → the nav inner
    // starts at 121; 398 inner − (84 + 154 + 8 + 70) = 82 → two 41px
    // justify-between gaps put the group at 121+84+41 = 246.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await awaitWebfonts(page);
    const nav = page.getByRole("navigation", { name: "Primary" });
    const labels = ["Highlights", "Eat", "Stay", "Do"];
    const textXs: number[] = [];
    for (const label of labels) {
      const x = await nav
        .getByRole("link", { name: label, exact: true })
        .evaluate((el) => Math.round(el.getBoundingClientRect().x));
      textXs.push(x);
    }
    expect(textXs[0]).toBeGreaterThanOrEqual(244); // Highlights 246
    expect(textXs[0]).toBeLessThanOrEqual(248);
    expect(textXs[1]).toBeGreaterThanOrEqual(315); // Eat 317
    expect(textXs[1]).toBeLessThanOrEqual(319);
    expect(textXs[2]).toBeGreaterThanOrEqual(345); // Stay 347
    expect(textXs[2]).toBeLessThanOrEqual(349);
    expect(textXs[3]).toBeGreaterThanOrEqual(382); // Do 384
    expect(textXs[3]).toBeLessThanOrEqual(386);
  });
});

test.describe("desktop (1280) navigation", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("the floating white pill renders the chrome with the avatar chip", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await awaitWebfonts(page);
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    for (const label of ["Highlights", "Eat", "Stay", "Do", "Map", "Favourites", "Profile"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    // Session-5 redesign: the inner bar is a centered PILL (rounded-full —
    // Tailwind v4 compiles to calc(infinity*1px), so assert the numeric
    // radius; max-w 820) — not the full-width bar.
    const navRadius = await nav.evaluate((el) => parseFloat(getComputedStyle(el).borderRadius));
    expect(navRadius).toBeGreaterThan(1000);
    const box = await nav.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThan(100);
    expect(box!.width).toBeLessThanOrEqual(820);

    // The ACTIVE link sits on the rgba(14,14,14,0.08) pill.
    const highlights = nav.getByRole("link", { name: "Highlights", exact: true });
    await expect(highlights).toHaveCSS("background-color", "rgba(14, 14, 14, 0.08)");
    // Session-22 re-measure: the live's desktop 13px link text carries
    // +0.01em tracking (0.13px at 13px).
    const desktopLs = await highlights.evaluate((el) => parseFloat(getComputedStyle(el).letterSpacing));
    expect(desktopLs).toBeGreaterThanOrEqual(0.08);
    expect(desktopLs).toBeLessThanOrEqual(0.18);
    // Session-50 re-measure: the live's identity surface flipped BACK to the
    // session-14 contract — the desktop avatar disc carries the
    // email-derived INITIAL (the white 14px/700 Inter letter on the black
    // 36×36 disc, "S" for the demo account), not the lucide-user icon
    // session 48 measured. The mobile tab-bar keeps the user icon.
    const avatar = nav.getByRole("link", { name: "Profile", exact: true });
    await expect(avatar).toHaveText("S");
    await expect(avatar).toHaveCSS("background-color", "rgb(14, 14, 14)");
    // The mobile user icon stays in the DOM but is CSS-hidden from md up
    // (md:hidden) — the desktop disc renders the initial only.
    await expect(avatar.locator("svg")).toBeHidden();
    const initial = avatar.locator("span").first();
    await expect(initial).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(initial).toHaveCSS("font-size", "14px");
    await expect(initial).toHaveCSS("font-weight", "700");
  });
});

test.describe("profile page chrome (session 16)", () => {
  // The live's /profile renders WITHOUT the app chrome — no navbar at any
  // breakpoint, no footer (the only controls are the floating Back + Sign
  // out buttons). This pins the chrome-less contract at both geometries so
  // the (bare) route group can never silently regain the navbar.
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 800 },
  ]) {
    test(`no navbar and no footer on /profile at ${viewport.width}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/profile", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
      await expect(page.locator("header")).toHaveCount(0);
      await expect(page.getByRole("contentinfo")).toHaveCount(0);
    });
  }
});
