import { expect, test } from "@playwright/test";

// Home (Highlights) content parity spec — pins the sections measured on the
// live reference app (session 2): the glass planner pill, the Recommended
// Route itinerary, the blue Highlighted Restaurants strip + featured card,
// the Choose Your Vibe stay showcase, the Highlighted Sights grid, the
// More Things to Do link, and the site footer. Contexts arrive
// AUTHENTICATED (setup-project storageState).

test.describe("home content parity (session 2)", () => {
  test("hero: serif wordmark over the photo, white planner card, no subtitle", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Augsburg City Guide" })).toBeVisible();

    // The live hero has NO subtitle paragraph — the planner follows the h1.
    await expect(page.getByText("Restaurants, boutique stays and slow-city experiences")).toHaveCount(0);

    // Planner card segments (live aria-labels — unchanged by the redesign).
    await expect(page.getByLabel("Choose trip dates")).toBeVisible();
    await expect(page.getByLabel("Number of people")).toBeVisible();
    await expect(page.getByLabel("Type of Activities")).toBeVisible();
    await expect(page.getByLabel("Search trip matches")).toBeVisible();

    // The planner card title.
    await expect(page.getByText("Let's Plan Your Trip").first()).toBeVisible();

    // Session-5 redesign: below md the hero planner is a near-opaque WHITE
    // elevated card (bg-white/95, radius 30, the big soft 0 16 34 shadow) —
    // no longer the frosted glass capsule (which still renders from md).
    // Tailwind v4 serializes bg-white/95 through color-mix() → computed
    // colors arrive as oklab(), so the card is pinned by its radius and its
    // distinctive rgba shadow, not a parsed background string.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const planner = page.locator(".trip-planner-card").first();
    await expect(planner).toHaveCSS("border-radius", "30px");
    const plannerShadow = await planner.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(plannerShadow).toContain("rgba(14, 14, 14, 0.16)");

    // Session-61 re-measure: the live's mobile planner card is
    // rgba(255,255,255,0.94) (not /95) and its shadow carries a 1px white
    // INSET top highlight (inset 0 1px 0 rgba(255,255,255,0.94)) on top of
    // the 0 16 34 drop shadow.
    const plannerBg = await planner.evaluate((el) => getComputedStyle(el).backgroundColor);
    const alphaMatch = /(?:\/\s*|,\s*)(0\.9\d)/.exec(plannerBg);
    expect(alphaMatch).not.toBeNull();
    expect(parseFloat(alphaMatch![1])).toBeGreaterThanOrEqual(0.93);
    expect(parseFloat(alphaMatch![1])).toBeLessThanOrEqual(0.95);
    expect(plannerShadow).toContain("inset");
    expect(plannerShadow).toContain("rgba(255, 255, 255, 0.94)");
  });

  test("hero geometry: taller photo, content positions match the live (session 10)", async ({ page }) => {
    // Mobile (390×844): the live hero photo is 591px tall with the h1 at
    // viewport y≈203 and the planner at y≈365 (124px card + a 126px gap
    // under the 36px h1 — a much taller hero than the old 86vh build).
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const heroImg = page.locator("section img").first();
    await expect(heroImg).toBeVisible();
    const mobileGeom = await page.evaluate(() => {
      const img = document.querySelector("section img");
      const h1 = document.querySelector("h1");
      return {
        imgH: Math.round(img?.getBoundingClientRect().height ?? 0),
        h1Y: Math.round(h1?.getBoundingClientRect().y ?? 0),
        h1X: Math.round(h1?.getBoundingClientRect().x ?? 0),
      };
    });
    expect(mobileGeom.imgH).toBeGreaterThanOrEqual(570);
    expect(mobileGeom.imgH).toBeLessThanOrEqual(610);
    expect(mobileGeom.h1Y).toBeGreaterThanOrEqual(180);
    expect(mobileGeom.h1Y).toBeLessThanOrEqual(225);
    // Session-14 re-measure: the live hero content container carries px-6
    // (24px) at every breakpoint — the h1 starts at x=24 (was 16 with
    // px-4).
    expect(mobileGeom.h1X).toBeGreaterThanOrEqual(20);
    expect(mobileGeom.h1X).toBeLessThanOrEqual(28);

    // Session-16 re-measure: the live's mobile PLANNER CARD is WIDER than
    // the px-6 content — 358px wide starting at x=16 (16px viewport
    // margins) with a 4px grid gap (the card escapes the content padding).
    const plannerBox = await page.locator(".trip-planner-card").first().boundingBox();
    expect(plannerBox).not.toBeNull();
    expect(Math.round(plannerBox!.x)).toBeGreaterThanOrEqual(13);
    expect(Math.round(plannerBox!.x)).toBeLessThanOrEqual(19);
    expect(Math.round(plannerBox!.width)).toBeGreaterThanOrEqual(352);
    expect(Math.round(plannerBox!.width)).toBeLessThanOrEqual(364);

    // Desktop (1280×800): session-22 re-measure — the live's hero photo
    // box is an ABSOLUTE backdrop bleeding ABOVE the hero section (inset
    // top −86px / bottom +14px relative to a section at page y=0): the
    // 1280×1010 box lands at page y=−86→924, cover-cropped ≈7.7% more
    // zoomed than the old full-container framing. The h1 stays at y≈290.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const desktopGeom = await page.evaluate(() => {
      const img = [...document.querySelectorAll("img")].find((i) => i.getBoundingClientRect().height > 400);
      const h1 = document.querySelector("h1");
      return {
        imgY: Math.round(img?.getBoundingClientRect().y ?? 0),
        imgH: Math.round(img?.getBoundingClientRect().height ?? 0),
        h1Y: Math.round(h1?.getBoundingClientRect().y ?? 0),
      };
    });
    expect(desktopGeom.imgH).toBeGreaterThanOrEqual(1000);
    expect(desktopGeom.imgH).toBeLessThanOrEqual(1020);
    expect(desktopGeom.imgY).toBeLessThanOrEqual(-75); // bleeding above the page top (the live: −86)
    expect(desktopGeom.imgY).toBeGreaterThanOrEqual(-95);
    expect(desktopGeom.h1Y).toBeGreaterThanOrEqual(265);
    expect(desktopGeom.h1Y).toBeLessThanOrEqual(315);

    // Session-31: the live's hero is now a VIEWPORT-HEIGHT-RELATIVE model —
    // the content margin-top is calc(5rem + 28vh) and the photo box height
    // calc(100% + 72px) over a content-driven section (≈714 + 0.28vh at lg).
    // At 800 those formulas land EXACTLY on the session-22 values above
    // (290/1010); at taller viewports the surfaces shift down 0.28×Δvh —
    // the live at 1280×900: h1 y=319, the photo 1038 tall at y=−85.
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const vh900Geom = await page.evaluate(() => {
      const img = [...document.querySelectorAll("img")].find((i) => i.getBoundingClientRect().height > 400);
      const h1 = document.querySelector("h1");
      return {
        imgY: Math.round(img?.getBoundingClientRect().y ?? 0),
        imgH: Math.round(img?.getBoundingClientRect().height ?? 0),
        h1Y: Math.round(h1?.getBoundingClientRect().y ?? 0),
      };
    });
    expect(vh900Geom.h1Y).toBeGreaterThanOrEqual(310);
    expect(vh900Geom.h1Y).toBeLessThanOrEqual(328);
    expect(vh900Geom.imgH).toBeGreaterThanOrEqual(1030);
    expect(vh900Geom.imgH).toBeLessThanOrEqual(1046);
    expect(vh900Geom.imgY).toBeLessThanOrEqual(-80);
    expect(vh900Geom.imgY).toBeGreaterThanOrEqual(-90);

    // Session-31: the live's photo box now carries big elliptical ROUNDED
    // BOTTOM corners — border-radius: 32px 32px 60% 60% / 32px 32px 80px
    // 80px at md+ (and 0 0 42% 42% / 0 0 48px 48px below md). The zoomed
    // camera crops away the raw box, so the RADIUS is the pinned surface.
    const desktopRadius = await page.evaluate(() => {
      const img = [...document.querySelectorAll("img")].find((i) => i.getBoundingClientRect().height > 400);
      return getComputedStyle(img!.parentElement!).borderRadius;
    });
    expect(desktopRadius).toContain("60%");
    expect(desktopRadius).toContain("80px");

    // Session-31: the planner pill gap shrank — the live's pill carries
    // mt-4 (16px) at md+ (was 24px). The rect gap = the 16px margin + the
    // h1's -translate-y-1.5 (−6px lifts its box): the live measures 22
    // (16 + 6; its rect bottom = 405, the pill top = 427 at 1280×800).
    const pillGap = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const pill = [...document.querySelectorAll("div")].find((d) => getComputedStyle(d).backdropFilter !== "none");
      return Math.round(pill!.getBoundingClientRect().y - (h1!.getBoundingClientRect().y + h1!.getBoundingClientRect().height));
    });
    expect(pillGap).toBeGreaterThanOrEqual(20);
    expect(pillGap).toBeLessThanOrEqual(24);

    // md (768): the same bleed rule — session-31 re-measure: the live's md
    // section is content-driven (≈577 + 0.3vh — NOT the old fixed 900),
    // so at 768×900 the photo box is 919px (was 972).
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const mdGeom = await page.evaluate(() => {
      const img = [...document.querySelectorAll("img")].find((i) => i.getBoundingClientRect().height > 400);
      return {
        imgY: Math.round(img?.getBoundingClientRect().y ?? 0),
        imgH: Math.round(img?.getBoundingClientRect().height ?? 0),
      };
    });
    expect(mdGeom.imgH).toBeGreaterThanOrEqual(910);
    expect(mdGeom.imgH).toBeLessThanOrEqual(925);
    expect(mdGeom.imgY).toBeLessThanOrEqual(-75);
    expect(mdGeom.imgY).toBeGreaterThanOrEqual(-95);
  });

  test("hero mobile: the h1 font caps at 38px with rounded photo corners (session 31)", async ({ page }) => {
    // Session-31 finding: the live's mobile h1 is clamp(32px, 9.2vw, 38px)
    // — CAPPED at 38px (the clone's old 9vw clamp was uncapped: 57.6px at
    // 640 vs the live's 38px). And the photo's bottom corners round at
    // 0 0 42% 42% / 0 0 48px 48px below md.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    const font390 = await h1.evaluate((el) => getComputedStyle(el).fontSize);
    expect(parseFloat(font390)).toBeGreaterThanOrEqual(35);
    expect(parseFloat(font390)).toBeLessThanOrEqual(37);

    // The mobile photo radius: 42% horizontal / 48px vertical at the
    // bottom corners (the .today-hero-bg override).
    const mobileRadius = await page.evaluate(() => {
      const img = [...document.querySelectorAll("img")].find((i) => i.getBoundingClientRect().height > 400);
      return getComputedStyle(img!.parentElement!).borderRadius;
    });
    expect(mobileRadius).toContain("42%");
    expect(mobileRadius).toContain("48px");

    // At 640 (still below md) the cap binds: the live renders 38px.
    await page.setViewportSize({ width: 640, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const font640 = await h1.evaluate((el) => getComputedStyle(el).fontSize);
    expect(parseFloat(font640)).toBeGreaterThanOrEqual(37);
    expect(parseFloat(font640)).toBeLessThanOrEqual(39);
  });

  test("the trip-planner date-range popover matches the live re-measure (session 28)", async ({ page }) => {
    // Session-28 re-measure: the live's react-day-picker popover, swept for
    // the first time since session 3 — the container is 510px wide at
    // desktop (358 at 390 = calc(100vw-32px)) with pad 12px; the from/to
    // header is a 2-col grid of SELF-CONTAINED white pill fields (h 50,
    // border-black/10, px-4 py-2) carrying the 12px/500 #8A8780 label +
    // the 12px/600 ink value + a 14px calendar svg INSIDE; NO "Done"
    // button (outside-click closes); the month label 14px/500; the nav
    // buttons 28×28; the weekday cells 12.8px/400 #737373; the selected
    // day violet bg + weight 400; the in-range days #F7F4FF bg + violet
    // text; the PREV-MONTH trailing days render grayed in the first row.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Choose trip dates").click();
    const popover = page.locator("[role=dialog][aria-label='Choose trip dates']");
    await expect(popover).toBeVisible();

    // Container chrome: width 510 (±6), pad 12, radius 40, white bg.
    const box = await popover.boundingBox();
    expect(Math.round(box!.width)).toBeGreaterThanOrEqual(504);
    expect(Math.round(box!.width)).toBeLessThanOrEqual(516);
    await expect(popover).toHaveCSS("padding", "12px");
    await expect(popover).toHaveCSS("border-radius", "40px");
    await expect(popover).toHaveCSS("background-color", "rgb(255, 255, 255)");

    // The from/to header: two self-contained white pill fields (h 50) with
    // the label + value + a calendar icon INSIDE each.
    const fromField = popover.locator("text=from").first().locator("xpath=..");
    const fromBox = await fromField.boundingBox();
    expect(Math.round(fromBox!.height)).toBeGreaterThanOrEqual(48);
    expect(Math.round(fromBox!.height)).toBeLessThanOrEqual(52);
    await expect(fromField).toHaveCSS("background-color", "rgb(255, 255, 255)");
    const fromBorder = await fromField.evaluate((el) => getComputedStyle(el).borderTopWidth);
    expect(fromBorder).toBe("1px");
    // Each field carries a calendar svg inside.
    const calendarIcons = await fromField.locator("svg").count();
    expect(calendarIcons).toBeGreaterThanOrEqual(1);

    // NO "Done" button — the live closes on outside-click only.
    await expect(popover.getByRole("button", { name: "Done" })).toHaveCount(0);

    // The month label: 14px / weight 500 (the live's font-medium).
    const monthLabel = popover.getByText(/2026/, { exact: false }).first();
    await expect(monthLabel).toHaveCSS("font-size", "14px");
    const monthWeight = await monthLabel.evaluate((el) => getComputedStyle(el).fontWeight);
    expect(monthWeight).toBe("500");

    // The month nav buttons: 28×28 circles.
    const prevBtn = popover.getByLabel("Previous month");
    const prevBox = await prevBtn.boundingBox();
    expect(Math.round(prevBox!.width)).toBeGreaterThanOrEqual(26);
    expect(Math.round(prevBox!.width)).toBeLessThanOrEqual(30);

    // The weekday row: 12.8px / 400 #737373 (the live's 0.8rem neutral).
    const weekday = popover.getByText("Su", { exact: true }).first();
    await expect(weekday).toHaveCSS("font-size", "12.8px");
    const weekdayWeight = await weekday.evaluate((el) => getComputedStyle(el).fontWeight);
    expect(weekdayWeight).toBe("400");
    await expect(weekday).toHaveCSS("color", "rgb(115, 115, 115)");

    // The prev-month trailing days render as GRAY BUTTONS (#737373 — the
    // same neutral as the weekday row) in the leading cells of the first
    // row (the live's react-day-picker outside days: 30, 31 before the 1).
    const trailingBtn = popover.getByRole("button", { name: /^30$/ }).first();
    await expect(trailingBtn).toBeVisible();
    await expect(trailingBtn).toHaveCSS("color", "rgb(115, 115, 115)");

    // Select a day: violet bg + white text + weight 400 (not 600); the
    // from field value updates to the DD/MM/YYYY format.
    const day15 = popover.getByRole("button", { name: /15/ }).first();
    await day15.click();
    await expect(day15).toHaveCSS("background-color", "rgb(87, 26, 255)");
    await expect(day15).toHaveCSS("color", "rgb(255, 255, 255)");
    const selWeight = await day15.evaluate((el) => getComputedStyle(el).fontWeight);
    expect(selWeight).toBe("400");

    // Complete a range: the in-range day carries #F7F4FF bg + violet text.
    const day18 = popover.getByRole("button", { name: /18/ }).first();
    await day18.click();
    const day17 = popover.getByRole("button", { name: /17/ }).first();
    await expect(day17).toHaveCSS("background-color", "rgb(247, 244, 255)");
    await expect(day17).toHaveCSS("color", "rgb(87, 26, 255)");

    // The mobile cap: at 390 the popover computes 358 wide (100vw-32).
    await page.mouse.click(10, 400); // outside-click closes
    await expect(popover).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByLabel("Choose trip dates").click();
    await expect(popover).toBeVisible();
    const mobileBox = await popover.boundingBox();
    expect(Math.round(mobileBox!.width)).toBeGreaterThanOrEqual(354);
    expect(Math.round(mobileBox!.width)).toBeLessThanOrEqual(362);
    expect(Math.round(mobileBox!.x)).toBeGreaterThanOrEqual(14);
    expect(Math.round(mobileBox!.x)).toBeLessThanOrEqual(18);
  });

  test("desktop navbar is the floating pill (session-6 redesign)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();

    // The inner bar: white PILL — radius rounded-full (Tailwind v4 compiles
    // it to calc(infinity*1px) → Chrome serializes 33554432px, so assert the
    // numeric radius instead of the string), max-width 820, fully bordered,
    // softly shadowed, centered (NOT the old full-width bottom-bordered bar).
    const navRadius = await nav.evaluate((el) => parseFloat(getComputedStyle(el).borderRadius));
    expect(navRadius).toBeGreaterThan(1000);
    await expect(nav).toHaveCSS("max-width", "820px");
    await expect(nav).toHaveCSS("border-bottom-color", "rgb(232, 230, 220)");
    await expect(nav).toHaveCSS("border-top-width", "1px");
    const box = await nav.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThan(100); // inset from the viewport edge
    expect(box!.x + box!.width).toBeLessThan(1180);

    // Link typography: 13px Inter — ACTIVE 700 ink, inactive #555550.
    const active = nav.getByRole("link", { name: "Highlights", exact: true });
    await expect(active.locator("span")).toHaveCSS("font-size", "13px");
    await expect(active.locator("span")).toHaveCSS("font-weight", "700");
    const inactive = nav.getByRole("link", { name: "Eat", exact: true });
    await expect(inactive.locator("span")).toHaveCSS("color", "rgb(85, 85, 80)");
  });

  test("category cards: the 3D fan + sliding row decks + in-card VIEW ALL (session 60 re-measure)", async ({ page }) => {
    // Mobile (390): the cards form a HORIZONTAL snap carousel (the live's
    // today-category-cards row scrolls sideways — scrollWidth 978 at 390).
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const cardRow = page.locator("#category-cards").first();
    const scrollInfo = await cardRow.evaluate((el) => ({ scrollW: el.scrollWidth, clientW: el.clientWidth }));
    expect(scrollInfo.scrollW).toBeGreaterThan(scrollInfo.clientW + 200); // 3 off-screen-ish cards
    // The mobile VIEW ALL pill is the deck's 4th item — violet #571AFF,
    // 36px tall (the rows deck renders all four items on phones).
    const mobileViewAll = page.getByRole("link", { name: /View All/ }).first();
    await expect(mobileViewAll).toHaveCSS("background-color", "rgb(87, 26, 255)");
    const viewAllRadius = await mobileViewAll.evaluate((el) => parseFloat(getComputedStyle(el).borderRadius));
    expect(viewAllRadius).toBeGreaterThan(1000);
    const mobileViewAllH = await mobileViewAll.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(mobileViewAllH).toBeGreaterThanOrEqual(34);
    expect(mobileViewAllH).toBeLessThanOrEqual(38);
    // Session-60 re-measure: the mobile glass card carries radius 20 at
    // BOTH breakpoints now (was the session-16 mobile 24) and the bg
    // computes rgba(255,255,255,0.58).
    const mobileCard = page.locator("[data-category-card]").first();
    await expect(mobileCard).toHaveCSS("border-radius", "20px");
    await expect(mobileCard).toHaveCSS("background-color", "rgba(255, 255, 255, 0.58)");

    // Session-26 re-measure: the live's mobile track (its override
    // stylesheet) pads the track 18/18/40 and tightens the gap to 12px
    // (gap-3) — the cards ride the hero photo's bottom edge at y≈578 (the
    // clone's track had no top pad, gap 16, cards at y≈559).
    const trackGap = await cardRow.evaluate((el) =>
      Math.round(
        (el.children[1] as HTMLElement).getBoundingClientRect().x -
          (el.children[0] as HTMLElement).getBoundingClientRect().right,
      ),
    );
    expect(trackGap).toBeGreaterThanOrEqual(10);
    expect(trackGap).toBeLessThanOrEqual(14);
    const cardY = await mobileCard.evaluate((el) => Math.round(el.getBoundingClientRect().y + window.scrollY));
    expect(cardY).toBeGreaterThanOrEqual(570);
    expect(cardY).toBeLessThanOrEqual(585);

    // Desktop (1280) — session-60 re-measure: the row became a 3D FAN. The
    // wrapper carries matrix(1.15) (a 1.15 row scale), each card sits in a
    // perspective-800 slot, and the INNER card tilts rotateY(±18deg) that
    // FLATTENS on hover (0.5s cubic-bezier(0.22,1,0.36,1)).
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const fanRow = page.locator("[data-category-fan]");
    await expect(fanRow).toHaveCount(1);
    const fanState = await fanRow.evaluate((el) => ({
      transform: getComputedStyle(el).transform,
      perspective: getComputedStyle(el).perspective,
    }));
    expect(fanState.transform).toBe("matrix(1.15, 0, 0, 1.15, 0, 0)");
    // The three slots carry perspective: 800px.
    const slotPerspectives = await page
      .locator("[data-category-fan] > [data-fan-slot]")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).perspective));
    expect(slotPerspectives).toEqual(["800px", "800px", "800px"]);
    // The inner cards' REST transforms: left rotateY(18deg), middle flat,
    // right rotateY(-18deg) — read the computed matrix3d m13 sign (the
    // ±0.309017 = sin 18°).
    const fanTilts = await page.locator("[data-category-fan] [data-category-card]").evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).transform),
    );
    expect(fanTilts.length).toBe(3);
    expect(fanTilts[0]).toContain("-0.309");
    expect(fanTilts[1]).toBe("matrix(1, 0, 0, 1, 0, 0)");
    expect(fanTilts[2]).toContain("0.309");
    // The tilt transition is the live's 0.5s curve.
    const tiltTransition = await page
      .locator("[data-category-fan] [data-category-card]")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(tiltTransition).toBe("0.5s");
    // HOVER flattens the tilted card back to rotateY(0).
    const leftCard = page.locator("[data-category-fan] [data-category-card]").first();
    await leftCard.hover();
    await page.waitForTimeout(700);
    const hovered = await leftCard.evaluate((el) => getComputedStyle(el).transform);
    expect(hovered).toBe("matrix(1, 0, 0, 1, 0, 0)");

    // The card's glass chrome at md: bg rgba(255,255,255,0.34), blur 28 +
    // saturate 160% (was 150), radius 20, the 1px rgba(255,255,255,0.36)
    // hairline.
    const card = page.locator("[data-category-fan] [data-category-card]").nth(1);
    await expect(card).toHaveCSS("background-color", "rgba(255, 255, 255, 0.34)");
    const blur = await card.evaluate((el) => getComputedStyle(el).backdropFilter);
    expect(blur).toContain("blur(28px)");
    // Chrome normalizes the live's saturate(160%) to 1.6.
    expect(blur).toContain("saturate(1.6)");
    await expect(card).toHaveCSS("border-radius", "20px");
    const cardBorder = await card.evaluate(
      (el) => `${getComputedStyle(el).borderTopWidth} ${getComputedStyle(el).borderTopColor}`,
    );
    expect(cardBorder).toBe("1px rgba(255, 255, 255, 0.36)");

    // The VIEW ALL pill is the deck's 4th item INSIDE the card — near-black
    // #141413, 36px layout (≈41px measured through the 1.15 scale), riding
    // the sliding deck. At rest it sits BELOW the 124px rows window (the
    // clip-path hides it); on hover the deck slides -44px revealing it.
    const desktopViewAll = page.locator("[data-category-fan] a[href='/eat']").first();
    await expect(desktopViewAll).toHaveCSS("background-color", "rgb(20, 20, 19)");
    const vaBox = await desktopViewAll.boundingBox();
    const cardBox = await card.boundingBox();
    expect(vaBox).not.toBeNull();
    expect(cardBox).not.toBeNull();
    expect(Math.round(vaBox!.height)).toBeGreaterThanOrEqual(38);
    expect(Math.round(vaBox!.height)).toBeLessThanOrEqual(44);
    // At rest the pill is the deck's 4th item — its top sits ~132px below
    // the window's top (below the three visible rows; the window's
    // clip-path + the card's overflow clip it visually — the box still
    // reports its geometry, so pin the DECK position, not the clip).
    const rowsWindow = card.locator("[data-rows-window]");
    const windowBox = await rowsWindow.boundingBox();
    expect(windowBox).not.toBeNull();
    expect(Math.round(windowBox!.height)).toBeGreaterThanOrEqual(136);
    expect(Math.round(windowBox!.height)).toBeLessThanOrEqual(148);
    expect(vaBox!.y - windowBox!.y).toBeGreaterThanOrEqual(120);
    // HOVER: the deck slides -44px (translateY) revealing the pill inside
    // the window's clip.
    await card.hover();
    await page.waitForTimeout(600);
    const deckTransform = await card.locator("[data-rows-deck]").evaluate((el) => getComputedStyle(el).transform);
    expect(deckTransform).toBe("matrix(1, 0, 0, 1, 0, -44)");
    // ...and the window's clip-path expands at its right/bottom edges.
    const clipOnHover = await rowsWindow.evaluate((el) => getComputedStyle(el).clipPath);
    expect(clipOnHover).toContain("-36px");
    // Un-hover restores the rest state.
    await page.mouse.move(636, 100);
    await page.waitForTimeout(600);
    const deckRest = await card.locator("[data-rows-deck]").evaluate((el) => getComputedStyle(el).transform);
    expect(deckRest).toBe("matrix(1, 0, 0, 1, 0, 0)");

    // The deck rows: 36px layout items (41px measured through the scale)
    // beside 28×28 layout cells (32.2px measured).
    const firstTagRow = card.locator("[data-rows-deck] li").first();
    const iconCell = firstTagRow.locator("span").first();
    const cellW = await iconCell.evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(cellW).toBeGreaterThanOrEqual(30);
    expect(cellW).toBeLessThanOrEqual(34);
    await expect(iconCell).toHaveCSS("border-radius", "8px");
    const rowBox = await firstTagRow.boundingBox();
    expect(rowBox).not.toBeNull();
    expect(rowBox!.height).toBeGreaterThanOrEqual(38);
    expect(rowBox!.height).toBeLessThanOrEqual(44);
    const title = firstTagRow.locator("span").nth(1).locator("span").first();
    await expect(title).toHaveCSS("font-size", "12px");
    await expect(title).toHaveCSS("font-weight", "500");
    // Three two-line rows + the View All pill as the deck's 4th item
    // (the nth(1) card is EAT — its first row reads "Fine dining /
    // Rathausplatz").
    await expect(card.locator("ul li")).toHaveCount(4);
    await expect(card.getByText("Rathausplatz", { exact: true })).toBeVisible();

    // Session-25 re-measure: the desktop header line-box is ≈24px (the
    // live's 21px header × its 1.15 row scale = 24px visible; was 32px).
    const headerBox = await card.locator("h2").boundingBox();
    expect(headerBox).not.toBeNull();
    expect(headerBox!.height).toBeLessThanOrEqual(26);

    // Session-25 re-measure: the desktop card-gap is ≈14px (the live's
    // computed 12px × 1.15 scale = 13.8 visible; the clone had gap-5=20).
    const cardBoxes = await page.locator("[data-category-card]:visible").evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().x),
    );
    expect(cardBoxes.length).toBeGreaterThanOrEqual(3);
    const gap = cardBoxes[1] - cardBoxes[0] - 263;
    expect(gap).toBeGreaterThanOrEqual(11);
    expect(gap).toBeLessThanOrEqual(16);

    // Session-25 re-measure: the live's glass cards run 210 (eat) –231
    // (hotels/sights) tall on screen — the ×1.15 scale over the 183–201px
    // session-10 flow heights (was the uniform session-16 223).
    const cardH = await card.boundingBox();
    expect(cardH).not.toBeNull();
    expect(cardH!.height).toBeGreaterThanOrEqual(205);
    expect(cardH!.height).toBeLessThanOrEqual(235);
    // The desktop glass card keeps radius 20.
    await expect(card).toHaveCSS("border-radius", "20px");

    // The live's icon set (FerrisWheel on the do card, Wine on eat) —
    // :visible scopes to the desktop row (the hidden mobile carousel also
    // carries one of each).
    await expect(page.locator("[data-category-card]:visible svg.lucide-ferris-wheel")).toHaveCount(1);
    await expect(page.locator("[data-category-card]:visible svg.lucide-wine")).toHaveCount(1);
  });

  test("the route visual renders the live's CARTO tile map (session 60 re-measure)", async ({ page }) => {
    // Desktop (1280): the live replaced the purple winding-path svg with a
    // REAL MAP — an svg viewBox 0 0 1500 1500 (preserveAspectRatio xMidYMid
    // slice) carrying 25 Carto light_nolabels z14 tiles (a 5×5 grid from
    // 8697/5642, 502px cells), the dashed base path (rgba(20,20,19,0.15) w5,
    // dash 10 8), the solid #141413 progress path, five cream waypoint
    // circles (r13, #F8F7F4 fill, #141413 stroke 2.5), and the ink head dot
    // (r7 + drop-shadow) that rides the path while the wrapping g pans to
    // keep it centered (translate(750−headX, 750−headY)).
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const mapPanel = page.locator("#recommended-route div[class*='w-1/2']").first();
    await mapPanel.waitFor({ state: "visible", timeout: 15_000 });
    // The map svg: viewBox 1500×1500, slice, covering the half-viewport
    // panel (640×800 at 1280).
    const mapSvg = mapPanel.locator("svg").first();
    await expect(mapSvg).toHaveAttribute("viewBox", "0 0 1500 1500");
    await expect(mapSvg).toHaveAttribute("preserveAspectRatio", "xMidYMid slice");
    const svgBox = await mapSvg.boundingBox();
    expect(svgBox).not.toBeNull();
    expect(Math.round(svgBox!.width)).toBeGreaterThanOrEqual(630);
    expect(Math.round(svgBox!.height)).toBeGreaterThanOrEqual(790);
    // 25 tiles in the 5×5 grid, all light_nolabels z14 PNGs.
    const tileInfo = await mapSvg.locator("image").evaluateAll((els) => ({
      count: els.length,
      firstHref: els[0] ? (els[0].getAttribute("href") ?? "") : "",
    }));
    expect(tileInfo.count).toBe(25);
    expect(tileInfo.firstHref).toContain("basemaps.cartocdn.com/light_nolabels/14/");
    expect(tileInfo.firstHref).toContain(".png");
    // Session-63: the provider deprecated anonymous raster access — every
    // tile href must carry the operator's CARTO key (docs/carto_key.txt) as
    // the ?key= param, else Carto serves the "API KEY REQUIRED" watermark
    // placeholder. Verified keyed: the 5×5 grid returns real imagery.
    expect(tileInfo.firstHref).toContain("?key=cb1_465p_1_988c53d611811b5d4bdb6b32");
    const allKeyed = await mapSvg.locator("image").evaluateAll((els) =>
      els.every((el) => (el.getAttribute("href") ?? "").includes("?key=")),
    );
    expect(allKeyed).toBe(true);
    // The base path is DASHED (strokeDasharray 10 8) at 15% ink; the
    // progress path is the same geometry in solid #141413 whose
    // dashoffset tracks the trap scroll.
    const paths = mapSvg.locator("g > path");
    await expect(paths).toHaveCount(2);
    const pathState = await paths.evaluateAll((els) =>
      els.map((el) => ({
        d: el.getAttribute("d") ?? "",
        stroke: el.getAttribute("stroke") ?? "",
        width: el.getAttribute("stroke-width") ?? "",
        dash: el.getAttribute("stroke-dasharray") ?? el.style.strokeDasharray,
      })),
    );
    expect(pathState[0].dash).toBe("10 8");
    expect(pathState[0].stroke).toBe("rgba(20,20,19,0.15)");
    expect(pathState[0].width).toBe("5");
    expect(pathState[1].stroke).toBe("#141413");
    // The live's route geometry (both paths share the d).
    expect(pathState[0].d).toContain("M 748 400");
    expect(pathState[0].d).toContain("750 1100");
    // Five cream waypoint circles at the measured coords.
    const waypoints = await mapSvg
      .locator("g > g > circle")
      .evaluateAll((els) =>
        els.map((el) => ({
          cx: el.getAttribute("cx"),
          cy: el.getAttribute("cy"),
          r: el.getAttribute("r"),
          fill: el.getAttribute("fill"),
          stroke: el.getAttribute("stroke"),
          strokeW: el.getAttribute("stroke-width"),
        })),
      );
    expect(waypoints.length).toBe(5);
    expect(waypoints[0]).toMatchObject({
      cx: "748",
      cy: "400",
      r: "13",
      fill: "#F8F7F4",
      stroke: "#141413",
      strokeW: "2.5",
    });
    expect(waypoints[4]).toMatchObject({ cx: "750", cy: "1100", r: "13" });
    // The head dot: r7 ink with the drop-shadow filter, riding the path.
    const headDot = mapSvg.locator("g > circle").last();
    const headState = await headDot.evaluate((el) => ({
      r: el.getAttribute("r"),
      fill: el.getAttribute("fill"),
      filter: el.style.filter ?? "",
      cx: Number(el.getAttribute("cx")),
      cy: Number(el.getAttribute("cy")),
    }));
    expect(headState.r).toBe("7");
    expect(headState.fill).toBe("#141413");
    expect(headState.filter).toContain("drop-shadow");
    // Mid-trap: the head sits ON the path (between y 400 and 1100) and the
    // g's pan keeps it at the viewBox center (750, 750) — sample the
    // scroll-linked state.
    await page.evaluate(() => {
      const t = document.querySelector("#recommended-route > div");
      window.scrollTo(0, t ? t.getBoundingClientRect().top + window.scrollY + 1200 : 0);
    });
    await page.waitForTimeout(500);
    const panState = await mapSvg.locator("g").first().evaluate((el) => {
      const m = getComputedStyle(el).transform;
      const nums = m.match(/-?[\d.]+/g) ? m.match(/-?[\d.]+/g)!.map(Number) : [];
      return { transform: m, tx: nums[4] ?? 0, ty: nums[5] ?? 0 };
    });
    expect(panState.transform).toContain("matrix");
    // The pan magnitude is bounded by the path's extent (|tx| < 30,
    // |ty| < 400) — the head-centering pan.
    expect(Math.abs(panState.tx)).toBeLessThan(30);
    expect(Math.abs(panState.ty)).toBeLessThan(400);

    // The progress pill: the live's SPLIT-COLOR bar — a white 218×36 pill
    // (blur 10, the #E8E6DC hairline, the 0 8 22/0.08 shadow) whose violet
    // fill (left-anchored, width = progress%) underlays the dark text
    // clipped to the unfilled right and a white duplicate clipped to the
    // filled left.
    const pill = mapPanel.locator("[data-route-pill]");
    await expect(pill).toHaveCount(1);
    await expect(pill).toHaveCSS("background-color", "rgb(255, 255, 255)");
    const pillBlur = await pill.evaluate((el) => getComputedStyle(el).backdropFilter);
    expect(pillBlur).toContain("blur(10px)");
    const pillBox = await pill.boundingBox();
    expect(pillBox).not.toBeNull();
    expect(Math.round(pillBox!.height)).toBeGreaterThanOrEqual(34);
    expect(Math.round(pillBox!.height)).toBeLessThanOrEqual(38);
    expect(Math.round(pillBox!.y)).toBeGreaterThanOrEqual(650); // bottom-24 ≈ 668 at 800
    expect(Math.round(pillBox!.y)).toBeLessThanOrEqual(690);
    const fillW = await pill.locator("[data-pill-fill]").evaluate((el) => {
      const w = parseFloat(getComputedStyle(el).width);
      const parentW = el.parentElement!.getBoundingClientRect().width;
      return { pct: (w / parentW) * 100, bg: getComputedStyle(el).backgroundColor };
    });
    expect(fillW.bg).toBe("rgb(87, 26, 255)");
    expect(fillW.pct).toBeGreaterThan(5);
    expect(fillW.pct).toBeLessThan(100);
    await expect(pill.getByText(/of your day planned/)).toHaveCount(2);

    // The waypoint panel's 18px graph-paper overlay (opacity 0.42, radial
    // mask) — the live's session-60 addition.
    const panelOverlay = page.locator("#recommended-route [data-graph-paper]");
    await expect(panelOverlay).toHaveCount(1);
    const overlayState = await panelOverlay.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { opacity: cs.opacity, size: cs.backgroundSize, image: cs.backgroundImage };
    });
    expect(overlayState.opacity).toBe("0.42");
    // Chrome repeats the size per gradient layer (two 18px grids).
    expect(overlayState.size).toContain("18px");
    expect(overlayState.image).toContain("rgba(20, 20, 19, 0.055)");

    // The heading overlay FADES OUT across the 140vh trap (opacity 1 → 0
    // within ~178px of the section's top) — at mid-fade it is translucent.
    const headingOverlay = page.locator("[data-heading-overlay]");
    await expect(headingOverlay).toHaveCount(1);
    const fadeMid = await headingOverlay.evaluate((el) => getComputedStyle(el).opacity);
    expect(parseFloat(fadeMid)).toBeLessThan(0.4);
    // At the heading section's own top the overlay is fully visible.
    // Re-align once — late-loading images above the route can shift the
    // section AFTER the first deterministic scroll.
    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => {
        const t = document.querySelector('section[aria-label="Recommended Route heading"]');
        window.scrollTo(0, t ? t.getBoundingClientRect().top + window.scrollY : 0);
      });
      await page.waitForTimeout(400);
    }
    const fadeTop = await headingOverlay.evaluate((el) => getComputedStyle(el).opacity);
    expect(parseFloat(fadeTop)).toBeGreaterThan(0.9);

    // The route trap is the live's 416.65vh (3332-3335px at 800).
    const trapH = await page.evaluate(() => {
      const t = document.querySelector("#recommended-route > div");
      return t ? Math.round(t.getBoundingClientRect().height) : 0;
    });
    expect(trapH).toBeGreaterThanOrEqual(3320);
    expect(trapH).toBeLessThanOrEqual(3345);
  });

  test("recommended route renders the five timed TEXT stops (session 8)", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Recommended Route" })).toBeVisible();
    await expect(page.getByText(/of your day planned/).first()).toBeVisible();

    for (const stop of ["Morning Coffee", "Lunch Break", "Afternoon Culture", "Sunset Drinks", "Dinner"]) {
      await expect(page.getByRole("heading", { name: stop, exact: true })).toBeVisible();
    }
    await expect(page.getByText("9:00 AM")).toBeVisible();
    await expect(page.getByText("Specialty Coffee Bar")).toBeVisible();

    // Session-8 re-measure: the live route cards are TEXT-ONLY — the photos
    // are gone from the whole section (both breakpoints).
    const routeSection = page.locator("#recommended-route");
    await expect(routeSection.locator("img")).toHaveCount(0);

    // The stop titles render DARK serif on cream (rgb(20,20,19)), not the
    // old white-on-photo treatment.
    const stopTitle = page.getByRole("heading", { name: "Morning Coffee", exact: true });
    await expect(stopTitle).toHaveCSS("color", "rgb(20, 20, 19)");

    // The time pill is a WHITE pill (radius 999) — session-20 re-measure:
    // px-3 py-1, 12px/400 text. Session-27 re-measure: the live RE-ADDED a
    // soft shadow + a hairline border + a PER-STOP category icon + dimmer
    // #3A3A3A text (the shadow-less session-20 contract is overtaken).
    const timePill = page.locator("[data-stop-time='9:00 AM']");
    await expect(timePill).toHaveCSS("background-color", "rgb(255, 255, 255)");
    const timeRadius = await timePill.evaluate((el) => parseFloat(getComputedStyle(el).borderRadius));
    expect(timeRadius).toBeGreaterThan(1000);
    await expect(timePill).toHaveCSS("font-weight", "400");
    const timeShadow = await timePill.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(timeShadow).toContain("rgba(14, 14, 14, 0.06)");
    expect(timeShadow).toContain("22px");
    // Session-27: the pill carries a 1px rgba(14,14,14,0.1) hairline.
    const timeBorder = await timePill.evaluate(
      (el) => `${getComputedStyle(el).borderTopWidth} ${getComputedStyle(el).borderTopColor}`,
    );
    expect(timeBorder).toBe("1px rgba(14, 14, 14, 0.1)");
    // Session-27: the pill text dims to #3A3A3A (was #141413).
    await expect(timePill).toHaveCSS("color", "rgb(58, 58, 58)");
    // Session-27: the pill renders a PER-STOP category icon — the first
    // stop (Morning Coffee) carries the lucide Coffee svg at 14px.
    const pillIcon = timePill.locator("svg");
    await expect(pillIcon).toHaveCount(1);
    const pillIconClass = await pillIcon.evaluate((el) => el.getAttribute("class") ?? "");
    expect(pillIconClass).toContain("coffee");
    const pillIconW = await pillIcon.evaluate((el) => el.getBoundingClientRect().width);
    expect(Math.round(pillIconW)).toBe(14);
    // Session-22 re-measure: the live's pill text carries +0.05em tracking
    // (0.6px at 12px) — the "9:00 AM" span is tracked out slightly.
    const timeLs = await timePill.evaluate((el) => parseFloat(getComputedStyle(el).letterSpacing));
    expect(timeLs).toBeGreaterThanOrEqual(0.5);
    expect(timeLs).toBeLessThanOrEqual(0.7);

    // Route stop cards link to their place pages.
    await expect(page.getByRole("link", { name: /Learn More/ }).first()).toHaveAttribute(
      "href",
      /\/place\/home-route-/,
    );

    // The Learn More pill is BLACK full-width (h-11) — the pill is a span
    // inside the white info-card link, so assert the pill element itself.
    // Session-20: the text is 13px/600 (was 14).
    const learnMore = routeSection.locator("[data-learn-more]").first();
    await expect(learnMore).toHaveCSS("background-color", "rgb(14, 14, 14)");
    const learnMoreH = await learnMore.evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(learnMoreH)).toBe(44);
    await expect(learnMore).toHaveCSS("font-size", "13px");

    // Session-20 re-measure: the live's stop-card typography shrank — the
    // place name is an h3 at 20px/600 (line-height 30px), the meta line is
    // 13px/400 #72706C (rgb(114,112,106)), the description keeps 14px with
    // mt-4, and the DESKTOP link card is max-w-md (448px, left-aligned)
    // with the lighter 0 8px 28px rgba(14,14,14,0.08) shadow + mt-7.
    const stopLinkCard = routeSection.locator("article a").first();
    const placeName = stopLinkCard.locator("h3").first();
    await expect(placeName).toHaveText("Specialty Coffee Bar");
    await expect(placeName).toHaveCSS("font-size", "20px");
    await expect(placeName).toHaveCSS("font-weight", "600");
    // Session-22 re-measure: the live's 20px place names carry −0.02em
    // tracking (−0.4px at 20px).
    const placeLs = await placeName.evaluate((el) => parseFloat(getComputedStyle(el).letterSpacing));
    expect(placeLs).toBeLessThanOrEqual(-0.3);
    expect(placeLs).toBeGreaterThanOrEqual(-0.5);
    const metaLine = stopLinkCard.locator("span").nth(0);
    await expect(metaLine).toHaveCSS("font-size", "13px");
    await expect(metaLine).toHaveCSS("color", "rgb(114, 112, 106)");
    const linkShadow = await stopLinkCard.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(linkShadow).toContain("rgba(14, 14, 14, 0.08)");

    // Session-27 re-measure: the live's stop-card chrome re-tightened —
    // (a) the serif stop TITLE carries line-height 1.1 (52.8px at the 48px
    // desktop title) + an 8px bottom margin above the link card;
    const stopTitleLh = await stopTitle.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
    const stopTitleFs = await stopTitle.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(stopTitleLh / stopTitleFs).toBeGreaterThanOrEqual(1.08);
    expect(stopTitleLh / stopTitleFs).toBeLessThanOrEqual(1.12);
    const stopTitleMb = await stopTitle.evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));
    expect(stopTitleMb).toBeGreaterThanOrEqual(6);
    expect(stopTitleMb).toBeLessThanOrEqual(10);
    // (b) the white LINK CARD gained a 1px rgba(14,14,14,0.08) hairline
    // (it previously rendered shadow-only);
    const linkBorder = await stopLinkCard.evaluate(
      (el) => `${getComputedStyle(el).borderTopWidth} ${getComputedStyle(el).borderTopColor}`,
    );
    expect(linkBorder).toBe("1px rgba(14, 14, 14, 0.08)");
    // (c) the META row is a flex-wrap gap-1.5 row carrying a 14px map-pin
    // svg (stroke #72706A) BEFORE the neighborhood text.
    const metaRow = stopLinkCard.locator(".mt-2").first();
    const metaPin = metaRow.locator("svg");
    await expect(metaPin).toHaveCount(1);
    const metaPinW = await metaPin.evaluate((el) => el.getBoundingClientRect().width);
    expect(Math.round(metaPinW)).toBe(14);
    const metaPinStroke = await metaPin.evaluate((el) => el.getAttribute("stroke") ?? "");
    expect(metaPinStroke).toBe("#72706A");

    // Session-8 swap (session-20 rework): at desktop the right panel pins
    // EARLY and the stop cards translate upward CONTINUOUSLY with scroll
    // (the live's scroll-linked choreography) — scrolling deep moves the
    // active card past Morning Coffee. Session-10: the stop titles are h2
    // (the live's semantics).
    await page.setViewportSize({ width: 1280, height: 800 });
    const trap = page.locator("#recommended-route > div");
    // Deterministic (session-20): scroll so the trap's TOP sits at the
    // viewport top (progress 0) — scrollIntoViewIfNeeded on a 420vh element
    // is non-deterministic (it may center the tall trap mid-viewport).
    await page.evaluate(() => {
      const t = document.querySelector("#recommended-route > div");
      window.scrollTo(0, t ? t.getBoundingClientRect().top + window.scrollY : 0);
    });
    await page.waitForTimeout(300);

    // Session-20: the desktop split is 50/50 — the visual panel is half the
    // viewport (≈640 at 1280) and the stops column the other half; the card
    // slot sits ≈237px below the sticky top (the column's lg:pt-[237px]).
    const visualPanel = page.locator("#recommended-route div[class*='w-1/2']").first();
    const desktopVisualBox = await visualPanel.boundingBox();
    expect(desktopVisualBox).not.toBeNull();
    expect(Math.round(desktopVisualBox!.width)).toBeGreaterThanOrEqual(630);
    expect(Math.round(desktopVisualBox!.width)).toBeLessThanOrEqual(650);
    // Late-loading images above the route can shift the trap AFTER the
    // deterministic scroll — re-align once more before the slot measurement.
    await page.evaluate(() => {
      const t = document.querySelector("#recommended-route > div");
      if (!t) return;
      window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY);
    });
    await page.waitForTimeout(150);
    const slotState = await page.evaluate(() => {
      const sticky = document.querySelector("#recommended-route div[class*='lg:sticky']");
      const card = document.querySelector("#recommended-route article");
      // Session-60: the cards center on the panel's middle (top: 50% +
      // translateY(-50% + offset)) — the live's center-based slot (the
      // 326px cards' top lands ≈ 237, the 349px ones ≈ 225).
      return {
        runtime: card && sticky ? card.getBoundingClientRect().y - sticky.getBoundingClientRect().y : 0,
        h: card ? Math.round(card.getBoundingClientRect().height) : 0,
      };
    });
    expect(Math.round(slotState.runtime)).toBeGreaterThanOrEqual(180);
    expect(Math.round(slotState.runtime)).toBeLessThanOrEqual(270);
    const firstCard = page.locator("#recommended-route article").first();
    const slotY = slotState.runtime;
    // The desktop link card is capped at max-w-md (448px).
    const desktopLinkBox = await firstCard.locator("a").boundingBox();
    expect(desktopLinkBox).not.toBeNull();
    expect(Math.round(desktopLinkBox!.width)).toBeGreaterThanOrEqual(430);
    expect(Math.round(desktopLinkBox!.width)).toBeLessThanOrEqual(465);

    // The continuous choreography: at ~400px into the trap the 0→1 card
    // crossfade is IN PROGRESS — two adjacent articles carry intermediate
    // opacity (0 < o < 1), not a binary active/inactive swap. Deterministic
    // scroll (mouse.wheel timing proved flaky mid-suite).
    const scrollIntoTrap = (offset: number) =>
      page.evaluate((o) => {
        const t = document.querySelector("#recommended-route > div");
        if (!t) return;
        window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY + o);
      }, offset);
    await scrollIntoTrap(400);
    await page.waitForTimeout(400);
    const opacities = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#recommended-route article")).map((el) =>
        parseFloat(getComputedStyle(el).opacity),
      ),
    );
    const intermediate = opacities.filter((o) => o > 0.05 && o < 0.95);
    expect(intermediate.length).toBeGreaterThanOrEqual(1);
    // Card 0 must be EXITING UPWARD (its y above the slot) at +400px.
    const cardBoxes = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#recommended-route article")).map((el) =>
        Math.round(el.getBoundingClientRect().y),
      ),
    );
    expect(cardBoxes[0]).toBeLessThan(Math.round(slotY));

    // Deep scroll: the active stop moves past Morning Coffee.
    await scrollIntoTrap(3000);
    await page.waitForTimeout(700);
    const visibleStop = page.locator('#recommended-route article[data-active="true"] h2');
    await expect(visibleStop).not.toHaveText("Morning Coffee", { timeout: 8000 });

    // Session-60 re-measure: the mobile route visual is the same CARTO map
    // (viewBox 1500×1500, 25 tiles) pinned full-viewport — the mobile map
    // does NOT pan (the g stays identity while the head travels) and there
    // is no mobile progress chip (only the desktop pill, hidden below lg).
    // The stop link-cards are rounded-28 and the panel pulls up -12vh over
    // the trap's tail.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const routeSectionMobile = page.locator("#recommended-route");
    const mobileVisual = routeSectionMobile.locator("svg").first();
    await mobileVisual.waitFor({ state: "visible", timeout: 15_000 });
    const visualBox = await mobileVisual.boundingBox();
    expect(visualBox).not.toBeNull();
    expect(Math.round(visualBox!.width)).toBeGreaterThanOrEqual(380);
    expect(Math.round(visualBox!.height)).toBeGreaterThanOrEqual(700);
    // The mobile map carries the same 25-tile grid + the two paths.
    await expect(mobileVisual).toHaveAttribute("viewBox", "0 0 1500 1500");
    const mobileTiles = await mobileVisual.locator("image").evaluateAll((els) => ({
      count: els.length,
      firstHref: els[0] ? (els[0].getAttribute("href") ?? "") : "",
    }));
    expect(mobileTiles.count).toBe(25);
    // Session-63: the mobile map's tiles carry the CARTO key too.
    expect(mobileTiles.firstHref).toContain("?key=cb1_465p_1_988c53d611811b5d4bdb6b32");
    const mobilePaths = await mobileVisual.locator("g > path").evaluateAll((els) => els.length);
    expect(mobilePaths).toBe(2);
    // The mobile g does NOT pan (identity) while the head advances.
    const mobilePan = await mobileVisual.locator("g").first().evaluate((el) => getComputedStyle(el).transform);
    expect(mobilePan).toBe("matrix(1, 0, 0, 1, 0, 0)");
    // No VISIBLE progress chip at 390 (the desktop pill's DOM node may
    // exist inside the lg-only panel — it must be hidden).
    const plannedTexts = routeSectionMobile.getByText(/of your day planned/);
    const plannedCount = await plannedTexts.count();
    for (let i = 0; i < plannedCount; i++) {
      await expect(plannedTexts.nth(i)).toBeHidden();
    }
    // The mobile stop link-card is rounded-28 — session-60: the panel pads
    // px-[18px] so the cards sit at x=18 (354 wide at 390).
    const stopLinkCardMobile = routeSectionMobile.locator("article a").first();
    await expect(stopLinkCardMobile).toHaveCSS("border-radius", "28px");
    const mobileCardBox = await stopLinkCardMobile.boundingBox();
    expect(mobileCardBox).not.toBeNull();
    expect(Math.round(mobileCardBox!.x)).toBe(18);
    expect(Math.round(mobileCardBox!.width)).toBeGreaterThanOrEqual(348);
    expect(Math.round(mobileCardBox!.width)).toBeLessThanOrEqual(360);
  });

  test("the mobile route heading pins INSIDE the trap at y=68 (session 26)", async ({ page }) => {
    // Session-26 re-measure: the live HIDES its recommended-route-heading
    // section on phones and renders the h2 INSIDE the pinned trap —
    // `absolute left-1/2 top-[68px] w-[min(92vw,360px)] -translate-x-1/2`,
    // font clamp(38px, 11vw, 48px) (42.9px @390), lh ≈1.02, tracking
    // −0.055em — so the heading rides the FULL trap scroll at viewport
    // y=68 (the clone's old model pinned it at y=120 in a separate
    // heading section that vanished mid-trap). The trap zone also grew to
    // 220vh (1857px at an 844 viewport).
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Exactly ONE "Recommended Route" heading renders at 390 (the desktop
    // heading section is hidden below lg; the trap carries the h2).
    const headings = page.getByRole("heading", { name: "Recommended Route" });
    await expect(headings).toHaveCount(1);
    const h2 = headings.first();
    await expect(h2).toBeVisible();
    // The h2's font is the live's clamp — 42.9px at 390.
    await expect(h2).toHaveCSS("font-size", "42.9px");
    // The trap zone is 220vh (1856-1858px at an 844-tall viewport).
    const trapH = await page.evaluate(() => {
      const t = document.querySelector("#recommended-route > div > div");
      return t ? Math.round(t.getBoundingClientRect().height) : 0;
    });
    expect(trapH).toBeGreaterThanOrEqual(1840);
    expect(trapH).toBeLessThanOrEqual(1875);
    // Mid-trap: the h2 pins at viewport y≈68 over the pinned svg.
    const trapY = await page.evaluate(() => {
      const t = document.querySelector("#recommended-route > div > div");
      return t ? t.getBoundingClientRect().y + window.scrollY : 0;
    });
    await page.evaluate((y) => window.scrollTo(0, y + 300), trapY);
    await page.waitForTimeout(250);
    const h2ViewportY = await h2.evaluate((el) => Math.round(el.getBoundingClientRect().y));
    expect(Math.abs(h2ViewportY - 68)).toBeLessThanOrEqual(6);
    // The h2's width caps at min(92vw, 360px) → 358-360 at 390.
    const h2W = await h2.evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(h2W).toBeGreaterThanOrEqual(355);
    expect(h2W).toBeLessThanOrEqual(362);
  });

  test("highlighted restaurants: centered heading column, 5-name window, compact detail card (session-29 re-measure)", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const section = page.locator("#highlighted-restaurants");
    await expect(section).toBeVisible();
    const h2 = section.getByRole("heading", { name: "Highlighted Restaurants" });
    await expect(h2).toBeVisible();

    // Session-18 re-measure: the live's blue band now rises over the route
    // trap's TAIL — its top starts ~800px before the route box ends (at
    // the sticky release point), not flush after it.
    const routeTrap = page.locator("#recommended-route > div");
    const bandBox = await section.boundingBox();
    const trapBox = await routeTrap.boundingBox();
    expect(bandBox).not.toBeNull();
    expect(trapBox).not.toBeNull();
    const overlap = trapBox!.y + trapBox!.height - bandBox!.y;
    expect(overlap).toBeGreaterThanOrEqual(700);
    expect(overlap).toBeLessThanOrEqual(900);

    // Session-29 re-measure (F1): the heading layer is a sticky, vertically
    // + horizontally CENTERED column — the h2 centers on the viewport (not
    // a left-aligned justify-between row) and the white View All pill
    // renders BELOW the h2 (gap 24), h 44 with 13px/600 text.
    const h2Box = await h2.boundingBox();
    expect(h2Box).not.toBeNull();
    expect(Math.abs(h2Box!.x + h2Box!.width / 2 - 1280 / 2)).toBeLessThanOrEqual(6);
    const viewAll = section.getByRole("link", { name: /View All/ });
    await expect(viewAll).toHaveAttribute("href", "/eat");
    const viewAllBox = await viewAll.boundingBox();
    expect(viewAllBox).not.toBeNull();
    expect(viewAllBox!.y).toBeGreaterThanOrEqual(h2Box!.y + h2Box!.height);
    expect(Math.round(viewAllBox!.height)).toBeGreaterThanOrEqual(42);
    expect(Math.round(viewAllBox!.height)).toBeLessThanOrEqual(46);
    await expect(viewAll).toHaveCSS("font-size", "13px");
    // The h2's min clamp rises to 46px (was 42px).
    const h2Font = await h2.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(h2Font).toBeGreaterThanOrEqual(46);

    // Session-29 re-measure (F2): the names watermark is a FIVE-name
    // sliding window — exactly 5 spans at the viewport's vertical center,
    // UNIFORM Inter font (not the serif), the active solid white, the rest
    // white/0.32. The row centers as a group (the active lands near — not
    // exactly at — the viewport center).
    const nameWindow = section.locator("[data-band-names] span");
    await expect(nameWindow).toHaveCount(5);
    const nameFonts = await nameWindow.evaluateAll((els) =>
      els.map((el) => ({
        font: getComputedStyle(el).fontSize,
        family: getComputedStyle(el).fontFamily,
        color: getComputedStyle(el).color,
      })),
    );
    const fonts = new Set(nameFonts.map((n) => n.font));
    expect(fonts.size).toBe(1); // uniform — the active is NOT bigger
    expect(nameFonts[0].family).toContain("Inter");
    expect(nameFonts[0].family).not.toContain("Libre Baskerville");
    const solid = nameFonts.find((n) => n.color === "rgb(255, 255, 255)");
    const faint = nameFonts.find((n) => n.color.includes("0.32"));
    expect(solid).toBeDefined();
    expect(faint).toBeDefined();
    // The window at rest: Granary + Faro before Volta (circular wrap),
    // Volta solid + centered-ish, Roux + Aura after.
    await expect(nameWindow.nth(2)).toHaveText("Volta");
    await expect(nameWindow.first()).toHaveText("Granary");

    // Session-29 re-measure (F3): the featured detail card is the compact
    // centered model — NO name heading inside, min-width 330, pad 16, a 1px
    // border, and two flex-1 h-38 buttons.
    const card = section.locator("[data-featured-card]");
    await expect(card).toBeVisible();
    await expect(card.getByRole("heading")).toHaveCount(0);
    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(Math.round(cardBox!.width)).toBeGreaterThanOrEqual(325);
    expect(Math.abs(cardBox!.x + cardBox!.width / 2 - 1280 / 2)).toBeLessThanOrEqual(8);
    await expect(card).toHaveCSS("padding", "16px");
    await expect(card).toHaveCSS("border-top-width", "1px");
    const bookBtn = card.getByRole("link", { name: /Book a Table/ });
    const learnBtn = card.getByRole("link", { name: /Learn More/ });
    await expect(bookBtn).toHaveAttribute("href", /\/place\/home-restaurant-volta/);
    for (const btn of [bookBtn, learnBtn]) {
      const btnBox = await btn.boundingBox();
      expect(btnBox).not.toBeNull();
      expect(Math.round(btnBox!.height)).toBeGreaterThanOrEqual(36);
      expect(Math.round(btnBox!.height)).toBeLessThanOrEqual(40);
    }
    // The two buttons are equal-width (flex-1) side by side (±2px — the
    // fractional flex split can round asymmetrically).
    const bookBox = await bookBtn.boundingBox();
    const learnBox = await learnBtn.boundingBox();
    expect(Math.abs(Math.round(bookBox!.width) - Math.round(learnBox!.width))).toBeLessThanOrEqual(2);

    // Session-29 re-measure (the crossfade): at the trap's head the
    // heading layer is visible and the card is hidden; scrolled deep the
    // card is fully visible.
    const bandStart = bandBox!.y;
    await page.evaluate((y) => window.scrollTo(0, y + 400), bandStart);
    await page.waitForTimeout(300);
    await expect(card).toHaveCSS("opacity", "0");
    await page.evaluate((y) => window.scrollTo(0, y + 2000), bandStart);
    await page.waitForTimeout(300);
    await expect(card).toHaveCSS("opacity", "1");
    // The heading layer is gone deep in the band (faded out).
    const headingLayer = section.locator("[data-band-heading]");
    await expect(headingLayer).toHaveCSS("opacity", "0");
  });

  test("highlighted restaurants: the mobile deck STACKS — sticky cards pinned at y=88 (session 26)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const section = page.locator("#highlighted-restaurants");
    // Session-26 re-measure: the live's mobile-restaurant-stack returned to
    // a STICKY STACKING deck — the cards flow 620px apart (490 card + 130
    // gap), each card pins at viewport y≈88, and the next card slides up
    // OVER it (the later card paints above in DOM order). The section pads
    // 56px 18px 0px (the cards at x=18, 354 wide).
    const deck = section.locator("article");
    await expect(deck).toHaveCount(6, { timeout: 15_000 });
    const first = deck.first();
    await expect(first.getByRole("heading", { name: "Volta", exact: true })).toBeVisible();
    // The sixth deck card is Ember (the live's last deck card).
    await expect(deck.nth(5).getByRole("heading", { name: "Ember", exact: true })).toBeVisible();
    // No desktop View All on the mobile deck (live parity).
    await expect(section.getByRole("link", { name: /View All/ })).toHaveCount(0);
    // The cards are STICKY at top 88px (the live's pin offset — below the
    // 52px tab-bar), NOT the session-18 static list.
    await expect(first).toHaveCSS("position", "sticky");
    await expect(first).toHaveCSS("top", "88px");
    // The flow advance stays 620 (490 card + 130 gap) at rest.
    const firstBox = await first.boundingBox();
    const secondBox = await deck.nth(1).boundingBox();
    expect(firstBox).not.toBeNull();
    expect(secondBox).not.toBeNull();
    const advance = secondBox!.y - firstBox!.y;
    expect(advance).toBeGreaterThanOrEqual(580);
    expect(advance).toBeLessThanOrEqual(660);
    // The deck insets: the section pads px-[18px] → the cards sit at x=18.
    expect(Math.round(firstBox!.x)).toBe(18);
    expect(Math.round(firstBox!.width)).toBeGreaterThanOrEqual(348);
    expect(Math.round(firstBox!.width)).toBeLessThanOrEqual(360);
    // THE STACKING: scroll mid-deck (after the second card's pin) — two
    // adjacent cards share viewport y≈88 (the second has slid OVER the
    // first), while the later cards still flow below.
    const firstAbs = await first.evaluate((el) => el.getBoundingClientRect().y + window.scrollY);
    await page.evaluate((y) => window.scrollTo(0, y), firstAbs + 700);
    await page.waitForTimeout(200);
    const pinned = await deck.evaluateAll((els) =>
      els.slice(0, 2).map((el) => Math.round(el.getBoundingClientRect().y)),
    );
    expect(Math.abs(pinned[0] - 88)).toBeLessThanOrEqual(6);
    expect(Math.abs(pinned[1] - 88)).toBeLessThanOrEqual(6);
    // No band overlap at mobile — the list starts after the route ends.
    const routeEnd = await page
      .locator("#recommended-route")
      .evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
    const bandTop = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    expect(Math.round(bandTop)).toBeGreaterThanOrEqual(Math.round(routeEnd) - 4);
  });

  test("choose your vibe heading splits into per-letter reveal spans (session 8)", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const h2 = page.getByRole("heading", {
      name: /Choose Your Vibe, Select The Dates & Enjoy Your Ultimate Getaway/,
    });
    await expect(h2).toBeVisible();
    // The live heading renders one span per letter (64 for this string) and
    // animates their colors cream → ink with scroll position.
    const letters = h2.locator("span[data-letter]");
    const count = await letters.count();
    expect(count).toBeGreaterThanOrEqual(50);

    // Session-12 re-measure: the live's heading block is FULL-WIDTH (h2
    // x≈38, w≈1203 at 1280 — no max-w-3xl centering), the subtitle is 14px
    // #888580 (not 16px black/60), and the grid wrapper carries
    // pt-112/pb-144 padding. Session-31: the live now CENTER-ALIGNS the
    // heading text (was left) — the rendered lines sit symmetrically in the
    // full-width box.
    const h2Box = await h2.boundingBox();
    expect(h2Box).not.toBeNull();
    expect(h2Box!.x).toBeLessThan(60);
    expect(h2Box!.width).toBeGreaterThan(1100);
    await expect(h2).toHaveCSS("text-align", "center");
    const extents = await h2.evaluate((el) => {
      const letters = [...el.querySelectorAll("span[data-letter]")];
      const xs = letters.map((s) => s.getBoundingClientRect());
      const left = Math.min(...xs.map((r) => r.x));
      const right = Math.max(...xs.map((r) => r.x + r.width));
      return { left: Math.round(left), right: Math.round(right), vw: window.innerWidth };
    });
    // Symmetric margins: the live's text spans 129→1158 at 1280 (margins
    // 129/128 — the centered multi-line block).
    expect(Math.abs(extents.left - (extents.vw - extents.right))).toBeLessThanOrEqual(12);
    const sub = page.getByText("Pick a stay that matches your mood, from quiet design hotels to rooftop city escapes.");
    await expect(sub).toHaveCSS("font-size", "14px");
    await expect(sub).toHaveCSS("color", "rgb(138, 135, 128)");
  });

  test("stay + sight card titles render 24px on mobile, 18px on desktop (session 8)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const stayTitle = page.locator("#stay-showcase article h3").first();
    await expect(stayTitle).toHaveCSS("font-size", "24px");
    const sightTitle = page.locator("#highlighted-sights article h3").first();
    await expect(sightTitle).toHaveCSS("font-size", "24px");

    // Session-26 re-measure: the live's mobile showcase sections render
    // INSET cards — the stay grid pads px-[18px] (cards 354 wide @x=18)
    // and the sights grid pads px-4 (cards 358 wide @x=16); the clone had
    // rendered both grids FULL-BLEED (390 @x=0).
    const stayCard = page.locator("#stay-showcase article").first();
    const stayBox = await stayCard.boundingBox();
    expect(stayBox).not.toBeNull();
    expect(Math.round(stayBox!.x)).toBe(18);
    expect(Math.round(stayBox!.width)).toBeGreaterThanOrEqual(350);
    expect(Math.round(stayBox!.width)).toBeLessThanOrEqual(358);
    const sightCard = page.locator("#highlighted-sights article").first();
    const sightBox = await sightCard.boundingBox();
    expect(sightBox).not.toBeNull();
    expect(Math.round(sightBox!.x)).toBe(16);
    expect(Math.round(sightBox!.width)).toBeGreaterThanOrEqual(354);
    expect(Math.round(sightBox!.width)).toBeLessThanOrEqual(362);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const stayTitleDesktop = page.locator("#stay-showcase article h3").first();
    await expect(stayTitleDesktop).toHaveCSS("font-size", "18px");
    const sightTitleDesktop = page.locator("#highlighted-sights article h3").first();
    await expect(sightTitleDesktop).toHaveCSS("font-size", "18px");
  });

  test("choose your vibe: the twelve stay cards with Learn More + Book Now", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Choose Your Vibe, Select The Dates & Enjoy Your Ultimate Getaway/ }),
    ).toBeVisible();
    await expect(page.getByText("Pick a stay that matches your mood")).toBeVisible();

    const showcase = page.locator("#stay-showcase");
    await expect(showcase.getByRole("link", { name: /Learn More/ })).toHaveCount(12);
    await expect(showcase.getByRole("link", { name: /Book Now/ })).toHaveCount(12);
    await expect(showcase.getByText("Garden Suite")).toBeVisible();
    await expect(showcase.getByText("Maximilianstraße 44")).toBeVisible();

    // Session-12 re-measure: the live re-shuffled the home showcase order
    // (independent of the /stay browse order, which is unchanged). The
    // first card is now Courtyard Stay and the full 12-title order is
    // pinned against the live's current sequence.
    const titles = await showcase.locator("a h3").allTextContents();
    const order = ["Courtyard Stay", "Terra Boutique", "Brass & Marble", "Canal Hideaway", "Maison Altstadt", "Garden Suite", "River House", "Rooftop Atelier", "Velvet Residence", "Cloud Nine Hotel", "The Linen House", "Arcade Rooms"];
    expect(titles.map((t) => t.trim())).toEqual(order);

    // Session-14 re-measure: the live grid fills COLUMN-MAJOR (3 columns ×
    // 4 stacked cards) — the VISUAL first row reads Courtyard | Maison |
    // Velvet across (the DOM order is unchanged; only the flow changes) —
    // with 381px cards at an 18px gap over the bare 1178px grid (no
    // container side padding).
    const visual = await showcase.locator("a").evaluateAll((els) => {
      const cards = els
        .map((el) => {
          const r = el.getBoundingClientRect();
          const h = el.querySelector("h3");
          return h ? { t: h.textContent.trim(), x: r.x, y: r.y, w: r.width } : null;
        })
        .filter((c): c is { t: string; x: number; y: number; w: number } => c !== null)
        .sort((a, b) => a.y - b.y || a.x - b.x);
      return { row1: cards.slice(0, 3).map((c) => c.t), cardW: Math.round(cards[0].w) };
    });
    expect(visual.row1).toEqual(["Courtyard Stay", "Maison Altstadt", "Velvet Residence"]);
    expect(visual.cardW).toBeGreaterThanOrEqual(375);
    expect(visual.cardW).toBeLessThanOrEqual(385);

    // Session-28 re-measure: the live's home-showcase pills carry the
    // inline height 34px (was the session-6 41px override) and the Book
    // Now pill gained a 1px rgba(255,255,255,0.92) border (the /stay
    // BROWSE variant stays 36px borderless — verified separately).
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const courtyardCard = showcase.locator("a", { hasText: "Learn More" }).first();
    const learnPill = courtyardCard.getByText("Learn More", { exact: true });
    const bookPill = courtyardCard.getByText("Book Now", { exact: true });
    const learnBox = await learnPill.boundingBox();
    expect(Math.round(learnBox!.height)).toBeGreaterThanOrEqual(32);
    expect(Math.round(learnBox!.height)).toBeLessThanOrEqual(36);
    const bookBox = await bookPill.boundingBox();
    expect(Math.round(bookBox!.height)).toBeGreaterThanOrEqual(32);
    expect(Math.round(bookBox!.height)).toBeLessThanOrEqual(36);
    const bookBorder = await bookPill.evaluate((el) => getComputedStyle(el).borderTopWidth);
    expect(bookBorder).toBe("1px");

    // Session-60 re-measure: the live REMOVED the home showcase's white
    // star-rating badge (the right-4 top-4 pill) — zero lucide-star svgs in
    // the showcase; the rating survives only as the meta line's
    // "€€ · ★ 4.8" text (the /stay BROWSE variant keeps its badge).
    const starIcons = await showcase.locator("svg.lucide-star").count();
    expect(starIcons).toBe(0);

    // Session-31 re-measure: the live's HOME showcase images carry a
    // permanent 1.16 zoom (transform: translateY(8%) scale(1.16) at rest,
    // the ty parallax-interpolating toward 0 as the card centers) — the
    // /stay BROWSE cards stay transform-free (verified: transform none).
    // The visible crop is 16% tighter than the plain 118% fill.
    const stayImgTransform = await showcase.locator("article img").first().evaluate((el) => getComputedStyle(el).transform);
    expect(stayImgTransform).toContain("1.16");

    // The SIGHTS model: an oversized wrapper (absolute inset-x-0
    // -inset-y-[16%] — the img renders ~132% of the card height, clipped
    // by the square card) carrying the same scroll parallax.
    const sightsSection = page.locator("#highlighted-sights");
    const sightsWrapper = await sightsSection.locator("article img").first().evaluate((el) => {
      const wrapper = el.parentElement!;
      const card = wrapper.closest("div[class*=rounded]")!;
      return { wrapperH: Math.round(wrapper.getBoundingClientRect().height), cardH: Math.round(card.getBoundingClientRect().height) };
    });
    expect(sightsWrapper.wrapperH).toBeGreaterThanOrEqual(Math.round(sightsWrapper.cardH * 1.25));
    expect(sightsWrapper.wrapperH).toBeLessThanOrEqual(Math.round(sightsWrapper.cardH * 1.4));
  });

  // Session-74 (v2.32): the live RETIRED the session-61/63 fanning grid —
  // its "Choose Your Vibe" showcase is now a STICKY-HEADING + PASS-THROUGH
  // architecture: [an absolute 18px graph-paper texture layer at 0.36] + [a
  // vh-tall sticky heading block (pt-88: the h2 pins at viewport y 88 while
  // the grid scrolls up and PAINTS OVER it — the nested grid section comes
  // later in DOM order)] + [the nested grid section: pt-112 / the 1178
  // centered grid / pb-144] with the grid STATIC (every column + card
  // transform identity at every scroll; no middle-column raise, no card
  // rotation). Verified on the live at 1280: the section = 2632 (800
  // sticky + 112 + 1576 grid + 144), the h2 pinned at 88 across scroll
  // 7400→9000, released at 9215.
  test("the vibe heading PINS at the viewport top while the grid scrolls beneath (session 74)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const heading = page.locator("#stay-showcase [data-vibe-heading]");
    const gridSection = page.locator("#stay-showcase [data-vibe-grid-section]");
    await expect(heading).toHaveCount(1);
    await expect(gridSection).toHaveCount(1);

    // The sticky block is vh-tall from md and pins at top 0 (its own
    // pt-88 puts the h2 at viewport y 88 mid-pin).
    const stickyState = await heading.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        position: cs.position,
        top: cs.top,
        height: Math.round(el.getBoundingClientRect().height),
        padTop: parseFloat(cs.paddingTop),
      };
    });
    expect(stickyState.position).toBe("sticky");
    expect(stickyState.top).toBe("0px");
    expect(stickyState.height).toBe(800); // h-screen at vh 800
    expect(stickyState.padTop).toBe(88);

    // The grid section follows the sticky block: its own pt-112 + pb-144.
    const sectionState = await gridSection.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        padTop: parseFloat(cs.paddingTop),
        padBottom: parseFloat(cs.paddingBottom),
      };
    });
    expect(sectionState.padTop).toBe(112);
    expect(sectionState.padBottom).toBe(144);

    // Walk the scroll past the heading (the lazy-image layout shifts —
    // never trust a position read before the images above settle). The
    // site's CSS sets scroll-behavior: smooth — jump INSTANTLY or the
    // measurements read mid-animation.
    const walkTo = async (y: number) => {
      await page.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" }), y);
      await page.waitForTimeout(450);
    };
    const section = page.locator("#stay-showcase");
    const sectionDocY = async () =>
      section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await walkTo((await sectionDocY()) + 2000); // walk past (settles lazy images)
    // Park MID-PIN: 512px past the section top — the sticky engaged (the
    // h2 holds viewport y 88) while the grid (912px below the section
    // top) still sits below the fold at viewport y 400.
    await walkTo((await sectionDocY()) + 512);

    // THE PIN: the h2 holds viewport y 88 (its natural position would be
    // 512+88 = 600 — the sticky keeps it at the top while the grid rises).
    const h2 = heading.locator("h2");
    const h2ViewportY = await h2.evaluate((el) => Math.round(el.getBoundingClientRect().y));
    expect(h2ViewportY).toBe(88);
    // The grid is still below the heading's content (the cards enter from
    // the bottom; the heading's own subtitle sits above the grid's top).
    const grid = gridSection.locator("ul");
    const gridViewportTop = await grid.evaluate((el) => Math.round(el.getBoundingClientRect().y));
    expect(gridViewportTop).toBeGreaterThan(380);
    expect(gridViewportTop).toBeLessThan(500);
  });

  // Session-74 (v2.32): the fan is RETIRED — the grid renders statically.
  // The three li column wrappers stay (the live keeps them for the
  // column-major 12-card distribution), but no JS driver, no
  // data-fan-card transforms: every column + card computes identity at
  // every scroll position, desktop AND mobile.
  test("the stay grid is STATIC — no fan at any scroll, the columns flat (session 74)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const grid = page.locator("#stay-showcase ul").first();

    const stateAt = () =>
      grid.evaluate((el) => {
        const cols = [...el.querySelectorAll("li[data-fan-col]")] as HTMLElement[];
        const cards = [...el.children[0].children] as HTMLElement[];
        return {
          cols: cols.length,
          cardsPerCol: cards.length,
          colT: cols.map((c) => getComputedStyle(c).transform),
          cardT: cards.map((c) => getComputedStyle(c).transform),
        };
      });

    // At rest (the grid far below the fold).
    const atRest = await stateAt();
    expect(atRest.cols).toBe(3);
    expect(atRest.cardsPerCol).toBe(4);
    expect(atRest.colT.every((t) => t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)")).toBe(true);
    expect(atRest.cardT.every((t) => t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)")).toBe(true);

    // Mid-grid and deep — the columns never rise, the cards never rotate.
    // (Instant jumps: the site's scroll-behavior: smooth would otherwise
    // leave the scroll mid-animation — irrelevant to the static transforms
    // but keeps the parked positions honest.)
    const gridDocY = await grid.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    for (const dy of [0, 600, 1400]) {
      await page.evaluate(
        (y) => window.scrollTo({ top: y, behavior: "instant" }),
        gridDocY - 300 + dy,
      );
      await page.waitForTimeout(450);
      const state = await stateAt();
      expect(state.colT.every((t) => t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)")).toBe(true);
      expect(state.cardT.every((t) => t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)")).toBe(true);
      // The columns all start at the same y (no middle-column raise).
      const colTops = await grid.evaluate((el) => {
        const cols = [...el.querySelectorAll("li[data-fan-col]")] as HTMLElement[];
        return cols.map((c) => Math.round(c.getBoundingClientRect().y));
      });
      expect(new Set(colTops).size).toBe(1);
    }
  });

  // Session-74 (v2.32): the vibe section's mobile contract — the heading
  // block is RELATIVE (no pin below md) with pt-48/pb-18, and the grid
  // section carries pt-20/pb-56 (the live's measured mobile paddings).
  test("the vibe mobile contract: no sticky, pt-48 heading, pt-20 grid (session 74)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const heading = page.locator("#stay-showcase [data-vibe-heading]");
    const gridSection = page.locator("#stay-showcase [data-vibe-grid-section]");
    const headingState = await heading.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { position: cs.position, padTop: parseFloat(cs.paddingTop), padBottom: parseFloat(cs.paddingBottom) };
    });
    expect(headingState.position).toBe("relative");
    expect(headingState.padTop).toBe(48);
    expect(headingState.padBottom).toBe(18);
    const sectionState = await gridSection.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { padTop: parseFloat(cs.paddingTop), padBottom: parseFloat(cs.paddingBottom) };
    });
    expect(sectionState.padTop).toBe(20);
    expect(sectionState.padBottom).toBe(56);
    // The cards render 354 wide at 390 (px-18 grid padding, 18px gaps).
    const card = page.locator("#stay-showcase article").first();
    const cardBox = await card.boundingBox();
    expect(Math.round(cardBox!.width)).toBe(354);
  });

  // Session-61 re-measure: the live's stay-card heart is RESPONSIVE —
  // 44×44 (h-11) below md, 36×36 (w-9 h-9) from md — both at (16,16)
  // within the card. The clone rendered 36px at every width.
  test("the stay-card heart renders 44px on phones, 36px on desktop (session 61)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const heartM = page.locator("#stay-showcase article button").first();
    const hm = await heartM.boundingBox();
    expect(hm).not.toBeNull();
    expect(Math.round(hm!.width)).toBe(44);
    expect(Math.round(hm!.height)).toBe(44);

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const heartD = page.locator("#stay-showcase article button").first();
    const hd = await heartD.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const card = el.closest("article")!.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x - card.x), y: Math.round(r.y - card.y) };
    });
    expect(hd.w).toBe(36);
    expect(hd.h).toBe(36);
    expect(hd.x).toBe(16);
    expect(hd.y).toBe(16);
  });

  // Session-61 re-measure: the live's showcase parallax is DESKTOP-ONLY —
  // at 390 the stay-card home images and the sights images compute
  // transform: none at every scroll position (the 118% fill is pure
  // layout). The clone ran the 1.16 zoom + the ty parallax at mobile too.
  test("the showcase image parallax is desktop-only (session 61)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const stayImg = page.locator("#stay-showcase article img").first();
    const sightsImg = page.locator("#highlighted-sights article img").first();
    const stayY = await page.locator("#stay-showcase").evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    for (const dy of [0, 800, 2000, 4000, 6000]) {
      await page.evaluate((y) => window.scrollTo(0, y), stayY - 300 + dy);
      await page.waitForTimeout(350);
      expect(await stayImg.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
      expect(await sightsImg.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    }
  });

  // Session-61 re-measure: the live's card line-heights — the HOME cards'
  // h3 renders 24px/36px (lh 1.5) on phones and 18px/27px (lh 1.5) on
  // desktop, the meta p 12px/18.6px (lh 1.55) on phones and 12px/18px
  // (lh 1.5) on desktop. (The /stay BROWSE variant keeps leading-tight +
  // the 16px p — variant-specific, pinned in browse.spec.)
  test("the stay-card typography carries the live's 1.5 line-heights (session 61)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const titleM = page.locator("#stay-showcase article h3").first();
    const metaM = page.locator("#stay-showcase article p").first();
    await expect(titleM).toHaveCSS("font-size", "24px");
    await expect(titleM).toHaveCSS("line-height", "36px");
    await expect(metaM).toHaveCSS("font-size", "12px");
    await expect(metaM).toHaveCSS("line-height", "18.6px");

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const titleD = page.locator("#stay-showcase article h3").first();
    const metaD = page.locator("#stay-showcase article p").first();
    await expect(titleD).toHaveCSS("font-size", "18px");
    await expect(titleD).toHaveCSS("line-height", "27px");
    await expect(metaD).toHaveCSS("font-size", "12px");
    await expect(metaD).toHaveCSS("line-height", "18px");
  });

  test("highlighted sights: six cards linking to home-sight place pages", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const section = page.locator("#highlighted-sights");
    await expect(section.getByRole("heading", { name: "Highlighted Sights" })).toBeVisible();
    await expect(section.getByText("Six calm stops for a scenic Augsburg route")).toBeVisible();

    for (const sight of ["Fuggerei", "Rathausplatz", "Augsburg Cathedral", "Perlachturm", "Lech Canals", "Schaezlerpalais"]) {
      await expect(section.getByRole("heading", { name: sight, exact: true })).toBeVisible();
    }
    await expect(section.getByRole("link", { name: /Learn More/ }).first()).toHaveAttribute(
      "href",
      /\/place\/home-sight-/,
    );

    // Session-14 re-measure: the live sights grid is 1120px wide (x≈80)
    // with 360px cards (the clone ran a 1144+px-6 container → 352px).
    const sightsGeom = await section.locator("ul").first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      const card = el.querySelector("li");
      return { x: Math.round(r.x), cardW: card ? Math.round(card.getBoundingClientRect().width) : 0 };
    });
    expect(sightsGeom.x).toBeGreaterThanOrEqual(76);
    expect(sightsGeom.x).toBeLessThanOrEqual(84);
    expect(sightsGeom.cardW).toBeGreaterThanOrEqual(355);
    expect(sightsGeom.cardW).toBeLessThanOrEqual(365);
  });

  // Session-74 (v2.32): the live's sights section carries its OWN top
  // padding — pt-144 at md / pt-48 on phones — stacked AFTER the vibe
  // grid section's pb (144 md / 56 mobile): the live's grid-end → sights
  // h2 gap measures 283px at 1280 and 104px at 390 (the clone rendered
  // the vibe's pb alone: 143px/144px).
  test("the sights section carries its own top padding below the vibe grid (session 74)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const sights = page.locator("#highlighted-sights");
    const padD = await sights.evaluate((el) => parseFloat(getComputedStyle(el).paddingTop));
    expect(padD).toBe(144);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const padM = await sights.evaluate((el) => parseFloat(getComputedStyle(el).paddingTop));
    expect(padM).toBe(48);
  });

  test("route/sight home places resolve on their detail pages", async ({ page }) => {
    await page.goto("/place/home-sight-fuggerei");
    await expect(page.getByRole("heading", { name: "Fuggerei" })).toBeVisible();

    await page.goto("/place/home-route-specialty-coffee-bar");
    await expect(page.getByRole("heading", { name: "Specialty Coffee Bar" })).toBeVisible();
  });

  test("more things to do is a DARK pill linking to the Do browse; footer carries the legal line", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const more = page.getByRole("link", { name: /More Things to Do/ });
    await expect(more).toHaveAttribute("href", "/do");
    // Session-8 re-measure: the live hand-off is a DARK pill (rgb(17,17,17)
    // bg, white text, radius 999) — no border, no white bg.
    await expect(more).toHaveCSS("background-color", "rgb(17, 17, 17)");
    await expect(more).toHaveCSS("color", "rgb(255, 255, 255)");

    await expect(page.getByText("© 2026 Roam. Activity Map for Augsburg.")).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Privacy policy" })).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Accessibility Statement" })).toBeVisible();
  });

  test("the footer matches the live re-measure (session-23 + 32 + 33): the scroll-linked pill growth + the hover treatment", async ({ page }) => {
    // Session-23 re-measure — the footer had not been re-audited since
    // session 2. The live renders: a COMPACT shrink-wrapped centered glass
    // pill (border 1px #E8E6DC, backdrop blur(40px) saturate(1.5), the soft
    // 0 2px 12px /0.08 shadow) carrying the six view links as icon cells;
    // the footer element carries pt-64/pb-56 (desktop) / pt-32/pb-24
    // (mobile); the inner is max-w-5xl (1024); the bottom row is a
    // justify-between ROW at md (© 12px #8A8780 left, legal nav right with
    // gap 8px 20px) and a centered column on phones.
    // Session-32 re-measure — the DESKTOP pill grew on the live: 646×118,
    // radius 34, pad 12px 16px, gap 12, the links 92×92 tiles with 24px
    // icons over 12px/600 labels — one row of six. The MOBILE pill (<md)
    // is UNCHANGED (the 3-col grid, max-w 390, r-28, gap 8, pad 8/10, the
    // 104×78 links at 390).
    // Session-33 re-measure — the growth is SCROLL-LINKED and CONTINUOUS:
    // the pill renders the COMPACT model while the footer is offscreen
    // (506×96, gap 8, r-28, pad 8/10, links 74×78 r-18, icons 20px, labels
    // 11px) and interpolates LINEARLY with the footer's visible fraction
    // p — gap 8+4p, pad (8+4p)/(10+6p), radius 28+6p, links 74+18p ×
    // 78+14p with radius 18+6p, icons 20+4p, labels 11+1p — reaching the
    // grown model (646×118, gap 12, r-34, pad 12/16, links 92×92 r-24,
    // icons 24px, labels 12px) when the footer is fully visible, and
    // compacting back when it leaves. The per-frame updates are smoothed
    // by 120ms linear transitions (the pill: gap/padding/border-radius;
    // the link: width/height/border-radius) composed with the 300ms hover
    // list. The links carry a VIOLET HOVER at both breakpoints (translateY
    // −12 + scale 1.1 composed into one matrix, the #571AFF fill, white
    // text, the 0 16px 34px /0.28 glow; the svg its own group-hover
    // scale 1.1); the icons' stroke-width is 2.1 and the labels track
    // −0.01em. Below md the pill NEVER grows (the static 3-col model,
    // transition none).
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const footer = page.getByRole("contentinfo");
    const nav = footer.locator("nav").first();
    const link = nav.getByRole("link").first();
    const span = link.locator("span").first();

    // ---- The COMPACT state (page load, the footer offscreen) ----
    const navWCompact = await nav.evaluate((el) => el.getBoundingClientRect().width);
    expect(navWCompact).toBeGreaterThanOrEqual(500); // 506
    expect(navWCompact).toBeLessThanOrEqual(512);
    const navHCompact = await nav.evaluate((el) => el.getBoundingClientRect().height);
    expect(navHCompact).toBeGreaterThanOrEqual(93); // 96 with the 1px borders
    expect(navHCompact).toBeLessThanOrEqual(99);
    await expect(nav).toHaveCSS("border-radius", "28px");
    const padCompact = await nav.evaluate((el) => getComputedStyle(el).padding);
    expect(padCompact).toBe("8px 10px");
    const gapCompact = await nav.evaluate(
      (el) => getComputedStyle(el).columnGap ?? getComputedStyle(el).gap
    );
    expect(gapCompact).toBe("8px");
    const linkWCompact = await link.evaluate((el) => el.getBoundingClientRect().width);
    expect(linkWCompact).toBeGreaterThanOrEqual(72); // 74
    expect(linkWCompact).toBeLessThanOrEqual(76);
    const linkHCompact = await link.evaluate((el) => el.getBoundingClientRect().height);
    expect(linkHCompact).toBeGreaterThanOrEqual(76); // 78
    expect(linkHCompact).toBeLessThanOrEqual(80);
    await expect(link).toHaveCSS("border-radius", "18px");
    const iconCompact = await link.evaluate((el) => {
      const svg = el.querySelector("svg");
      return svg ? svg.getBoundingClientRect().height : 0;
    });
    expect(iconCompact).toBeGreaterThanOrEqual(19); // 20px
    expect(iconCompact).toBeLessThanOrEqual(21);
    await expect(span).toHaveCSS("font-size", "11px");
    await expect(span).toHaveCSS("font-weight", "600");

    // ---- The transition contracts (the live's own lists; Chromium
    // serializes the computed shorthand in SECONDS — 120ms → 0.12s) ----
    const pillTransition = await nav.evaluate((el) => getComputedStyle(el).transition);
    expect(pillTransition).toContain("gap 0.12s linear");
    expect(pillTransition).toContain("padding 0.12s linear");
    expect(pillTransition).toContain("border-radius 0.12s linear");
    const linkTransition = await link.evaluate((el) => getComputedStyle(el).transition);
    expect(linkTransition).toContain("width 0.12s linear");
    expect(linkTransition).toContain("height 0.12s linear");
    expect(linkTransition).toContain("border-radius 0.12s linear");
    expect(linkTransition).toContain("transform 0.3s");
    expect(linkTransition).toContain("box-shadow 0.3s");

    // ---- The pill's soft shadow (both breakpoints, the live's inline) ----
    const pillShadow = await nav.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(pillShadow).toContain("rgba(14, 14, 14, 0.08)");
    expect(pillShadow).toContain("2px 12px");

    // ---- The icon chrome: stroke-width 2.1 + the label tracking ----
    const strokeWidth = await link.evaluate((el) => el.querySelector("svg")?.getAttribute("stroke-width"));
    expect(strokeWidth).toBe("2.1");
    const labelTrack = await span.evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(labelTrack).toBe("-0.11px"); // −0.01em at 11px (compact)

    // ---- The GROWN state (scrolled to the page bottom) ----
    // The pill's growth interpolates with the footer's visible fraction —
    // scrolling to the document end puts the footer fully in view (p=1).
    // The 120ms transition needs settling: poll for the grown geometry.
    // Session-74: park at the TRUE max scroll (documentElement.scrollHeight
    // − innerHeight) — the session-72 trap: body.scrollHeight undershoots
    // by the body/documentElement height delta, which the taller v2.32
    // home (the vibe restructure) widened enough to leave p at 0.9992
    // (radius 33.9952 ≠ 34).
    await page.evaluate(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight - window.innerHeight,
        behavior: "instant",
      });
    });
    await expect
      .poll(() => nav.evaluate((el) => el.getBoundingClientRect().width), { timeout: 5000 })
      .toBeGreaterThanOrEqual(640);
    const navW = await nav.evaluate((el) => el.getBoundingClientRect().width);
    expect(navW).toBeLessThanOrEqual(652);
    const navH = await nav.evaluate((el) => el.getBoundingClientRect().height);
    expect(navH).toBeGreaterThanOrEqual(115); // 118 with the 1px borders
    expect(navH).toBeLessThanOrEqual(121);
    await expect(nav).toHaveCSS("border-radius", "34px");
    await expect(nav).toHaveCSS("border-top-width", "1px");
    await expect(nav).toHaveCSS("border-top-color", "rgb(232, 230, 220)");
    // The two backdrop utilities must compose into ONE declaration.
    await expect(nav).toHaveCSS("backdrop-filter", "blur(40px) saturate(1.5)");
    const pad = await nav.evaluate((el) => getComputedStyle(el).padding);
    expect(pad).toBe("12px 16px");
    const gap = await nav.evaluate((el) => getComputedStyle(el).columnGap ?? getComputedStyle(el).gap);
    expect(gap).toBe("12px");
    // The link tiles: 92×92 with the GROWN 24px radius, 24px icon over
    // 12px/600 text tracking −0.01em.
    const linkW = await link.evaluate((el) => el.getBoundingClientRect().width);
    expect(linkW).toBeGreaterThanOrEqual(90);
    expect(linkW).toBeLessThanOrEqual(94);
    const linkH = await link.evaluate((el) => el.getBoundingClientRect().height);
    expect(linkH).toBeGreaterThanOrEqual(90);
    expect(linkH).toBeLessThanOrEqual(94);
    await expect(link).toHaveCSS("border-radius", "24px");
    const iconH = await link.evaluate((el) => {
      const svg = el.querySelector("svg");
      return svg ? svg.getBoundingClientRect().height : 0;
    });
    expect(iconH).toBeGreaterThanOrEqual(23); // 24px
    await expect(span).toHaveCSS("font-size", "12px");
    await expect(span).toHaveCSS("font-weight", "600");
    await expect(span).toHaveCSS("letter-spacing", "-0.12px"); // −0.01em at 12px

    // ---- The violet hover treatment (grown state, 1280) ----
    await link.hover();
    await expect(link).toHaveCSS("transform", "matrix(1.1, 0, 0, 1.1, 0, -12)");
    await expect(link).toHaveCSS("background-color", "rgb(87, 26, 255)");
    await expect(link).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(link).toHaveCSS("border-top-color", "rgb(87, 26, 255)");
    const hoverShadow = await link.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(hoverShadow).toContain("rgba(87, 26, 255, 0.28)");
    expect(hoverShadow).toContain("16px 34px");
    // The svg carries its own group-hover scale (1.1) with a 300ms
    // transform transition.
    const svgScale = await link.evaluate((el) => getComputedStyle(el.querySelector("svg")!).scale);
    expect(svgScale).toBe("1.1");
    const svgDuration = await link.evaluate(
      (el) => getComputedStyle(el.querySelector("svg")!).transitionDuration
    );
    expect(svgDuration).toBe("0.3s");

    // ---- The interpolation midpoint (the continuous model) ----
    // Scroll to the footer's HALF-visibility: p=0.5 → gap 10px, the links
    // 83 wide (74 + 18×0.5). A binary toggle would read 8 or 12 here.
    // Move the pointer off the link first — the lingering hover's 1.1
    // scale would inflate the mid-transition link measurement.
    await page.mouse.move(0, 0);
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      const footer = document.querySelector("footer");
      if (!footer) return;
      const rect = footer.getBoundingClientRect();
      const target = rect.top + window.scrollY - window.innerHeight + rect.height / 2;
      window.scrollTo({ top: target, behavior: "instant" });
    });
    await expect
      .poll(
        () =>
          nav.evaluate((el) => {
            const g = parseFloat(getComputedStyle(el).gap);
            return g >= 9.6 && g <= 10.4;
          }),
        { timeout: 5000 }
      )
      .toBe(true);
    const midLinkW = await link.evaluate((el) => el.getBoundingClientRect().width);
    expect(midLinkW).toBeGreaterThanOrEqual(81); // 83 at p=0.5
    expect(midLinkW).toBeLessThanOrEqual(85);

    // The footer element carries the vertical padding (pt-64/pb-56).
    await expect(footer).toHaveCSS("padding-top", "64px");
    await expect(footer).toHaveCSS("padding-bottom", "56px");

    // The inner is max-w-5xl (1024).
    const innerW = await footer.evaluate((el) => {
      const child = el.firstElementChild;
      return child ? child.getBoundingClientRect().width : 0;
    });
    expect(innerW).toBeGreaterThanOrEqual(1020);
    expect(innerW).toBeLessThanOrEqual(1028);

    // The bottom row: justify-between at md, 12px #8A8780 text.
    const bottomRow = footer.locator("div").filter({ hasText: "© 2026 Roam" }).last();
    await expect(bottomRow).toHaveCSS("justify-content", "space-between");
    const cr = bottomRow.locator("p").first();
    await expect(cr).toHaveCSS("font-size", "12px");
    await expect(cr).toHaveCSS("color", "rgb(138, 135, 128)");

    // Session-26 re-measure: the legal row carries a TOP HAIRLINE
    // (1px rgba(0,0,0,0.05)) + its own pt-3/sm:pt-5 padding + mt-4/sm:mt-8
    // margin — the hairline renders at every breakpoint and the legal
    // text sits 13/21px lower than a bare gap would place it.
    await expect(bottomRow).toHaveCSS("border-top-width", "1px");
    // The oklab() serialization gotcha: alpha-blended black arrives as
    // `oklab(0 0 0 / 0.05)` — assert the parsed alpha instead of the string.
    const legalBorder = await bottomRow.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(legalBorder).toMatch(/0\.05\)?$/);
    await expect(bottomRow).toHaveCSS("padding-top", "20px");
    await expect(bottomRow).toHaveCSS("margin-top", "32px");

    // Mobile (390): the footer pads 32/24 and the nav fills the width.
    // The mobile pill NEVER grows — the static 3-col model at any scroll
    // position (transition none), carrying the same soft shadow.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(footer).toHaveCSS("padding-top", "32px");
    await expect(footer).toHaveCSS("padding-bottom", "24px");
    const navWMobile = await nav.evaluate((el) => el.getBoundingClientRect().width);
    expect(navWMobile).toBeGreaterThanOrEqual(348);
    expect(navWMobile).toBeLessThanOrEqual(352);
    // Session-33: the mobile pill carries the shadow but NO transition.
    const mobilePillShadow = await nav.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(mobilePillShadow).toContain("rgba(14, 14, 14, 0.08)");
    await expect(nav).toHaveCSS("transition", "none");
    // The mobile links: 104×78 grid tiles with the 4-prop hover list.
    const linkWMobile = await link.evaluate((el) => el.getBoundingClientRect().width);
    expect(linkWMobile).toBeGreaterThanOrEqual(102); // 104
    expect(linkWMobile).toBeLessThanOrEqual(106);
    const linkHMobile = await link.evaluate((el) => el.getBoundingClientRect().height);
    expect(linkHMobile).toBeGreaterThanOrEqual(76); // 78
    expect(linkHMobile).toBeLessThanOrEqual(80);
    const linkTransitionMobile = await link.evaluate((el) => getComputedStyle(el).transition);
    expect(linkTransitionMobile).toContain("transform 0.3s");
    expect(linkTransitionMobile).toContain("background 0.3s");
    expect(linkTransitionMobile).toContain("color 0.3s");
    expect(linkTransitionMobile).toContain("box-shadow 0.3s");
    expect(linkTransitionMobile).not.toContain("width");
    // The violet hover applies at mobile too (translateY −12 + scale 1.1
    // composed, the #571AFF fill, white text).
    await link.hover();
    await expect(link).toHaveCSS("transform", "matrix(1.1, 0, 0, 1.1, 0, -12)");
    await expect(link).toHaveCSS("background-color", "rgb(87, 26, 255)");
    await expect(link).toHaveCSS("color", "rgb(255, 255, 255)");
    // The bottom row stacks (column) on phones.
    await expect(bottomRow).toHaveCSS("flex-direction", "column");
    // Session-26: the mobile legal row carries the hairline + pt-3/mt-4.
    await expect(bottomRow).toHaveCSS("border-top-width", "1px");
    await expect(bottomRow).toHaveCSS("padding-top", "12px");
    await expect(bottomRow).toHaveCSS("margin-top", "16px");

    // Session-26 re-measure — the sm (640) window: the live switches the
    // footer pads AND the legal row layout at sm, NOT md — at 640 the
    // footer already pads 64/56, the legal row is a space-between ROW,
    // and the pill caps at max-w 390 centered (the live's mobile-override
    // pill max-width; the clone rendered a 600px w-full pill there).
    await page.setViewportSize({ width: 640, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(footer).toHaveCSS("padding-top", "64px");
    await expect(footer).toHaveCSS("padding-bottom", "56px");
    await expect(bottomRow).toHaveCSS("flex-direction", "row");
    await expect(bottomRow).toHaveCSS("justify-content", "space-between");
    await expect(bottomRow).toHaveCSS("padding-top", "20px");
    // The legal row is ALSO capped at 390 centered below md (the live's
    // override) — 390 wide @x=125 at 640, like the pill above it.
    const row640 = await bottomRow.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), w: Math.round(r.width) };
    });
    expect(row640.w).toBeGreaterThanOrEqual(386);
    expect(row640.w).toBeLessThanOrEqual(394);
    expect(row640.x).toBeGreaterThanOrEqual(123);
    expect(row640.x).toBeLessThanOrEqual(127);
    const navW640 = await nav.evaluate((el) => el.getBoundingClientRect().width);
    expect(navW640).toBeGreaterThanOrEqual(386);
    expect(navW640).toBeLessThanOrEqual(394);
    const navX640 = await nav.evaluate((el) => el.getBoundingClientRect().x);
    expect(Math.round(navX640)).toBeGreaterThanOrEqual(123);
    expect(Math.round(navX640)).toBeLessThanOrEqual(127);
  });

  test("page-bottom spacing matches the live (session-23): the sights pill hands off flush to the footer", async ({ page }) => {
    // Session-23 re-measure: on the live, the last sight card → the
    // More-pill = 32px (both breakpoints); the pill → the footer top = 0px
    // desktop / 22px mobile; the browse/map/detail pages end 96px above
    // the footer. The clone rendered a 176px void (pb-4 + section pb-16 +
    // main pb-16 + footer mt-8 + inner py-9).
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const footer = page.getByRole("contentinfo");
    const ftrTop = await footer.evaluate((el) => el.getBoundingClientRect().y + scrollY);
    const pill = page.getByRole("link", { name: /More Things to Do/ });
    const pillBottom = await pill.evaluate((el) => el.getBoundingClientRect().y + scrollY + el.getBoundingClientRect().height);
    // Desktop: the pill hands off FLUSH (0px ± 2).
    expect(Math.abs(ftrTop - pillBottom)).toBeLessThanOrEqual(2);

    // The last sight card → the pill = 32px (± 2).
    const cardGap = await pill.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const cards = [...document.querySelectorAll("main a")].filter((a) => {
        const ar = a.getBoundingClientRect();
        return ar.height > 150 && ar.y + scrollY < r.y + scrollY - 10;
      });
      const last = cards[cards.length - 1] as HTMLElement | undefined;
      if (!last) return -1;
      const lr = last.getBoundingClientRect();
      return r.y + scrollY - (lr.y + scrollY + lr.height);
    });
    expect(cardGap).toBeGreaterThanOrEqual(30);
    expect(cardGap).toBeLessThanOrEqual(34);

    // The browse page: the last card ends 96px above the footer (± 4).
    await page.goto("/eat", { waitUntil: "domcontentloaded" });
    const ftrTopEat = await footer.evaluate((el) => el.getBoundingClientRect().y + scrollY);
    const eatGap = await footer.evaluate((el) => {
      const cards = [...document.querySelectorAll("main a")].filter((a) => {
        const ar = a.getBoundingClientRect();
        return ar.height > 80 && ar.y + scrollY < el.getBoundingClientRect().y + scrollY - 20;
      });
      const last = cards[cards.length - 1] as HTMLElement | undefined;
      if (!last) return -1;
      const lr = last.getBoundingClientRect();
      return el.getBoundingClientRect().y + scrollY - (lr.y + scrollY + lr.height);
    });
    expect(eatGap).toBeGreaterThanOrEqual(92);
    expect(eatGap).toBeLessThanOrEqual(100);
    expect(ftrTopEat).toBeGreaterThan(0);
  });

  test("browses stay unpolluted: 12 stays, 12 eats, 18 dos", async ({ page }) => {
    await page.goto("/stay");
    await expect(page.locator('a[href^="/place/"]')).toHaveCount(12);
    await page.goto("/eat");
    await expect(page.locator('a[href^="/place/"]')).toHaveCount(12);
    await page.goto("/do");
    await expect(page.locator('a[href^="/place/"]')).toHaveCount(18);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "12 Places to Eat" })).toBeVisible(); // home card count unchanged
    await expect(page.getByRole("heading", { name: "18 Sights to Discover" })).toBeVisible();
  });
});
