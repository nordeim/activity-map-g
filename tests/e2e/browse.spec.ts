import { expect, test } from "@playwright/test";

// The city-guide surfaces end-to-end: the home hero + planner + category
// cards, the three browse views with search/filter chips, the place detail
// with booking, the favourites round-trip, and the map view with its
// filter pills and dot markers. Contexts arrive AUTHENTICATED
// (setup-project storageState).

test.describe("home (Highlights)", () => {
  test("hero, planner and the three category cards render", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Augsburg City Guide" })).toBeVisible();

    // The glass planner pill fields (live aria-labels; see home.spec.ts for
    // the full session-2 home content parity coverage).
    await expect(page.getByLabel("Choose trip dates")).toBeVisible();
    await expect(page.getByLabel("Number of people")).toBeVisible();
    await expect(page.getByLabel("Type of Activities")).toBeVisible();

    // The measured category cards with their counts and VIEW ALL buttons.
    // Session-10: #category-cards is the MOBILE carousel row — at the desktop
    // default viewport the three View All links live in the desktop card
    // row (all [data-category-card] articles).
    await expect(page.getByRole("heading", { name: "12 Hotels" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "12 Places to Eat" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "18 Sights to Discover" })).toBeVisible();
    await expect(page.locator("[data-category-card]:visible").getByRole("link", { name: /View All/ })).toHaveCount(3);
  });

  test("VIEW ALL navigates to the category view", async ({ page }) => {
    await page.goto("/");
    // Session-60: the desktop View All pill is the sliding deck's 4th item
    // — clipped at rest. Hover the card first (the deck slides -44px
    // revealing the pill), then click it.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.locator("[data-category-fan] [data-category-card]").first().hover();
    await page.waitForTimeout(600);
    await page.getByRole("link", { name: /View All/ }).first().click();
    await expect(page).toHaveURL(/\/stay\/?$/);
    await expect(page.getByRole("heading", { name: "Stay In Style" })).toBeVisible();
  });

  test("the planner submits to the category view with its parameters", async ({ page }) => {
    await page.goto("/");
    // Session 3 parity: Hotels → /stay?people=N (never the map).
    await page.getByLabel("Number of people").selectOption("3");
    await page.getByLabel("Type of Activities").selectOption("Hotels");
    await page.getByLabel("Search trip matches").click();
    await expect(page).toHaveURL(/\/stay\?people=3$/);
  });
});

test.describe("browse views", () => {
  for (const [path, title, cards, chip] of [
    ["/eat", "Eat Well Tonight", 12, "Open now"],
    ["/stay", "Stay In Style", 12, "Under €250"],
    ["/do", "Explore The City", 18, "All"],
  ] as const) {
    test(`${path} renders the headline, chips and ${cards} cards`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
      await expect(page.locator("article")).toHaveCount(cards);
      // The measured filter chips are present (one per view).
      await expect(page.getByRole("button", { name: chip, exact: true })).toBeVisible();
      // Session-12 re-measure: the live's filter chips are compact —
      // 38px tall with 12px text (the clone had 40px/14px).
      const chipBtn = page.getByRole("button", { name: chip, exact: true });
      await expect(chipBtn).toHaveCSS("height", "38px");
      await expect(chipBtn).toHaveCSS("font-size", "12px");

      // Session-14 re-measure: the heading block matches the live — the h1
      // sits at viewport y≈168 (section pt-24 at md, was y=137 with pt-16)
      // inside the full-width max-w-7xl block, and the subtitle renders
      // 14px #3A3A3A (was 16px black/60).
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(path);
      const h1Box = await page.getByRole("heading", { name: title }).boundingBox();
      expect(h1Box!.y).toBeGreaterThanOrEqual(160);
      expect(h1Box!.y).toBeLessThanOrEqual(176);
      const sub = page.locator("main > section").first().locator("p").first();
      await expect(sub).toHaveCSS("font-size", "14px");
      await expect(sub).toHaveCSS("color", "rgb(58, 58, 58)");
      // Session-57 re-measure (v2.24): the live's subtitle carries the
      // centered max-w-xl block — mt 24px below the h1 (the h1's own
      // margin-bottom dropped), a 576px-wide box centered at x=352.
      const h1El = page.getByRole("heading", { name: title });
      await expect(h1El).toHaveCSS("margin-bottom", "0px");
      const subMt = await sub.evaluate((el) => getComputedStyle(el).marginTop);
      expect(subMt).toBe("24px");
      const subBox = await sub.boundingBox();
      expect(subBox!.width).toBeGreaterThanOrEqual(574);
      expect(subBox!.width).toBeLessThanOrEqual(578);
      expect(Math.round(subBox!.x)).toBe(352);
      const subY = await sub.evaluate((el) => Math.round(el.getBoundingClientRect().y));
      expect(subY).toBeGreaterThanOrEqual(240);
      expect(subY).toBeLessThanOrEqual(246);

      // Session-18 re-measure: the live now carries the 18px graph-paper
      // grid texture on EVERY browse heading section — a scoped overlay
      // (absolute inset-0, opacity 40%, 18px crossings) inside the
      // full-bleed relative heading section.
      const overlay = page.locator("main > section").first().locator("div.absolute").first();
      await expect(overlay).toBeVisible();
      await expect(overlay).toHaveCSS("opacity", "0.4");
      const bgImage = await overlay.evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(bgImage).toContain("linear-gradient");
      const bgSize = await overlay.evaluate((el) => getComputedStyle(el).backgroundSize);
      expect(bgSize).toContain("18px");
      const overlayBox = await overlay.boundingBox();
      expect(overlayBox!.width).toBeGreaterThanOrEqual(1270);

      // Session-57 re-measure (v2.24) — phones: the live's subtitle
      // computes a 14px top margin with the TEXT inset 24px inside the
      // section (a px-6 inner padding; the text wraps at ~310px).
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(path);
      const subMobile = page.locator("main > section").first().locator("p").first();
      const subMobileMt = await subMobile.evaluate((el) => getComputedStyle(el).marginTop);
      expect(subMobileMt).toBe("14px");
      await expect(subMobile).toHaveCSS("padding-left", "24px");
      await expect(subMobile).toHaveCSS("padding-right", "24px");
      const subMobileBox = await subMobile.boundingBox();
      expect(Math.round(subMobileBox!.x)).toBe(16);
      expect(Math.round(subMobileBox!.width)).toBe(358);
      const textW = await subMobile.evaluate((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return Math.round(range.getBoundingClientRect().width);
      });
      expect(textW).toBeLessThanOrEqual(312);
      const h1Mobile = page.getByRole("heading", { name: title });
      const h1MobileSize = await h1Mobile.evaluate((el) => getComputedStyle(el).fontSize);
      expect(Math.round(parseFloat(h1MobileSize))).toBe(51);
      await expect(h1Mobile).toHaveCSS("margin-bottom", "0px");
    });
  }

  test("search narrows the eat grid (inside the unified planner card)", async ({ page }) => {
    await page.goto("/eat");
    await page.getByLabel("Search places").fill("moss");
    await expect(page.locator("article")).toHaveCount(1);
    await expect(page.locator("article").first()).toContainText("Moss & Marble");
  });

  test("the browse planner is ONE unified card: search + labelled fields + icon buttons (session 8)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/eat");
    // The live browse planner: a single white card (radius 30) containing
    // the search input, the labelled date + people fields, and two circular
    // icon action buttons — no separate search row, no type selector.
    const card = page.locator(".browse-planner-card");
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS("border-radius", "30px");
    const cardShadow = await card.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(cardShadow).toContain("rgba(14, 14, 14, 0.1)");
    await expect(card.getByLabel("Search places")).toBeVisible();
    await expect(card.getByText("Let's Plan Your Trip").first()).toBeVisible();
    await expect(card.getByText("People", { exact: true }).first()).toBeVisible();
    // No type-of-activities field on the browse planner (live parity).
    await expect(card.getByLabel("Type of Activities")).toHaveCount(0);
    await expect(card.getByLabel("Open category filters")).toBeVisible();

    // Session-57 re-measure (v2.24): the live's two circular icon actions —
    // the second button's glyph is the MAP outline (not the map-pin), both
    // icons stroke 2, and the buttons carry the glass chrome (the 1px
    // black/5 border, the cream/55 bg, the inset white highlight shadow).
    const mapBtn = card.getByLabel("Open the map view");
    await expect(mapBtn.locator("svg.lucide-map")).toHaveCount(1);
    await expect(mapBtn.locator("svg.lucide-map-pin")).toHaveCount(0);
    await expect(mapBtn.locator("svg").first()).toHaveAttribute("stroke-width", "2");
    await expect(mapBtn).toHaveCSS("border-top-width", "1px");
    await expect(mapBtn).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0.05)");
    await expect(mapBtn).toHaveCSS("background-color", "rgba(248, 247, 244, 0.55)");
    const mapBtnShadow = await mapBtn.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(mapBtnShadow).toContain("inset");
    const filtersBtn = card.getByLabel("Open category filters");
    await expect(filtersBtn.locator("svg").first()).toHaveAttribute("stroke-width", "2");
    await expect(filtersBtn).toHaveCSS("background-color", "rgba(248, 247, 244, 0.55)");

    // Session-57 re-measure (v2.24): the planner card's shadows carry the
    // glass inset highlight on BOTH breakpoints (mobile + md).
    const mobileShadow = await card.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(mobileShadow).toContain("inset");

    // Session-57 re-measure (v2.24) — the chips row's left inset: the
    // live's first chip sits at x=16 @390 (not x=4).
    const firstChip = page.getByRole("button", { name: "Open now", exact: true });
    const firstChipBox = await firstChip.boundingBox();
    expect(Math.round(firstChipBox!.x)).toBe(16);

    // Desktop: one sticky white PILL (radius 999, h-68) — search inline.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/eat");
    const pill = page.locator(".browse-planner-card");
    await expect(pill).toBeVisible();
    const pillRadius = await pill.evaluate((el) => parseFloat(getComputedStyle(el).borderRadius));
    expect(pillRadius).toBeGreaterThan(1000);
    await expect(pill.getByLabel("Search places")).toBeVisible();
    await expect(pill.getByText("Let's Plan Your Trip").first()).toBeVisible();
    // Session-57 (v2.24): the md shadow carries the inset highlight too,
    // and the icon buttons shrink to 48px at md (the live's contract).
    const pillShadow = await pill.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(pillShadow).toContain("inset");
    const mapBtnD = pill.getByLabel("Open the map view");
    const mapBtnDBox = await mapBtnD.boundingBox();
    expect(Math.round(mapBtnDBox!.width)).toBe(48);
    await expect(mapBtnD.locator("svg.lucide-map")).toHaveCount(1);
  });

  test("the browse planner forwards its params back to the category view", async ({ page }) => {
    await page.goto("/eat");
    // The date/people fields auto-forward — choosing people re-routes to the
    // same browse with the params (the grid date-filters server-side).
    await page.getByLabel("Number of people").selectOption("4");
    await expect(page).toHaveURL(/\/eat\?people=4$/);
  });

  test("eat card photos render 300px on mobile, 372px on desktop (session 8)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/eat");
    const photo = page.locator("article img").first();
    const h = await photo.evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(h)).toBe(300);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/eat");
    const photoDesktop = page.locator("article img").first();
    const hD = await photoDesktop.evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(hD)).toBe(372);
  });

  test("filter chips narrow the grid AND compose", async ({ page }) => {
    await page.goto("/eat");
    await expect(page.locator("article")).toHaveCount(12);
    await page.getByRole("button", { name: "Romantic" }).click();
    const romantic = await page.locator("article").count();
    expect(romantic).toBeGreaterThan(0);
    expect(romantic).toBeLessThan(12);
    await page.getByRole("button", { name: "French" }).click();
    const both = await page.locator("article").count();
    expect(both).toBeLessThanOrEqual(romantic);
  });

  test("the do view's All chip resets the filters", async ({ page }) => {
    await page.goto("/do");
    await page.getByRole("button", { name: "Museums", exact: true }).click();
    const museums = await page.locator("article").count();
    expect(museums).toBeGreaterThan(0);
    expect(museums).toBeLessThan(18);
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page.locator("article")).toHaveCount(18);
  });

  test("the filter chips match the live's 600-weight hairline pills (session-24)", async ({ page }) => {
    await page.goto("/eat");
    const chip = page.getByRole("button", { name: "Open now", exact: true });
    // Session-24 re-measure: the live's chips render 12px/600 with the
    // rgba(14,14,14,0.08) hairline + #555550 text (the clone had 500,
    // ink/secondary text, borderless). The ACTIVE chip flips to the violet
    // #571FF fill with white text (the clone used the ink fill).
    await expect(chip).toHaveCSS("font-weight", "600");
    await expect(chip).toHaveCSS("color", "rgb(85, 85, 80)");
    await expect(chip).toHaveCSS("border-top-width", "1px");
    await expect(chip).toHaveCSS("border-top-color", "rgba(14, 14, 14, 0.08)");
    await chip.click();
    await expect(chip).toHaveCSS("background-color", "rgb(87, 26, 255)");
    await expect(chip).toHaveCSS("color", "rgb(255, 255, 255)");
    // Phones: the chips grow to 44px touch targets (min-height — the live's
    // mobile override), not the fixed 38px.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/eat");
    await expect(page.getByRole("button", { name: "Open now", exact: true })).toHaveCSS("height", "44px");
  });

  test("the browse cards carry the live's floating shell (session-24)", async ({ page }) => {
    await page.goto("/eat");
    const card = page.locator("article").first();
    // Session-24 re-measure: the live's browse card is a floating shell —
    // white bg, the 1px rgba(14,14,14,0.08) hairline, radius 28 at md /
    // 24 on phones, the 0 18px 44px /0.08 shadow (the clone rendered a
    // flat composite with no shell chrome — never measured since
    // session 3). The internals (h-372 photo, p-5 body) are unchanged.
    await expect(card).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(card).toHaveCSS("border-top-width", "1px");
    await expect(card).toHaveCSS("border-top-color", "rgba(14, 14, 14, 0.08)");
    await expect(card).toHaveCSS("border-radius", "28px");
    const shadow = await card.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toContain("0px 18px 44px");
    // The heart disc is the live's 36px (w-9 h-9) — the clone had drifted
    // to the 44px h-11.
    const heart = card.locator("button").first();
    const heartBox = await heart.boundingBox();
    expect(Math.round(heartBox!.width)).toBe(36);
    expect(Math.round(heartBox!.height)).toBe(36);
    // Phones: radius 24.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/eat");
    await expect(page.locator("article").first()).toHaveCSS("border-radius", "24px");
  });

  test("the mobile heading sections sit at the live's 112px contract (session-24)", async ({ page }) => {
    // The live's mobile override stylesheet pins every FIRST heading
    // section at pt 112 / px 16 / pb 22 (content slides under the fixed
    // glass tab-bar) — with the 52px spacer the clone's sections carry
    // pt-[60px] so the h1 anchors land at the same y.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/eat");
    const eatH1 = await page.getByRole("heading", { name: "Eat Well Tonight" }).boundingBox();
    expect(eatH1!.y).toBeGreaterThanOrEqual(110);
    expect(eatH1!.y).toBeLessThanOrEqual(114);
    await page.goto("/favourites");
    const favH1 = await page.getByRole("heading", { name: "Favourites", exact: true }).boundingBox();
    expect(favH1!.y).toBeGreaterThanOrEqual(186);
    expect(favH1!.y).toBeLessThanOrEqual(190);
  });
});

test.describe("place detail", () => {
  test("renders the measured Courtyard Stay page with the booking request form", async ({ page }) => {
    await page.goto("/place/courtyard-stay");
    await expect(page.getByText("Stay", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Courtyard Stay", exact: true })).toBeVisible();
    await expect(page.getByText("Dom Viertel 14")).toBeVisible();
    await expect(page.getByText("4.8", { exact: true }).first()).toBeVisible();
    // The live app's request form (session 3): About this place + the
    // Name/Surname/Dates/Time/Phone/Email/Message fields + violet Book Now.
    await expect(page.getByRole("heading", { name: "About this place" })).toBeVisible();
    // Session-8 re-measure: About this place is a FIXED 34px heading.
    await expect(page.getByRole("heading", { name: "About this place" })).toHaveCSS("font-size", "34px");
    // Session-18 re-measure: the live restructured the detail page — the
    // rounded-36 card ends after the hero photo, and the About + form grid
    // moved BELOW it as a separate two-column section (gap 24px,
    // lg:grid-cols-[1.2fr_0.8fr]). The Book Now card is a separate aside
    // (rounded-28, hairline, no shadow) leading with the 18px "Book Now"
    // heading + the 14px #888580 request line; the fields render
    // SINGLE-COLUMN with radius-16 corners (was rounded-full).
    const formAside = page.locator("aside#book-now-card");
    const bookHeading = formAside.getByRole("heading", { name: "Book Now" });
    await expect(bookHeading).toBeVisible();
    await expect(bookHeading).toHaveCSS("font-size", "18px");
    const requestLine = page.getByText(/Send your booking request for Courtyard Stay/);
    await expect(requestLine).toBeVisible();
    await expect(requestLine).toHaveCSS("font-size", "14px");
    await expect(requestLine).toHaveCSS("color", "rgb(136, 133, 128)");
    // Session-53 re-measure (v2.22): the live's Dates/Time fields are
    // PICKER-TRIGGER BUTTONS (the live's form renders type="button" triggers
    // that open a date-range calendar and a 29-slot time list; the free-text
    // inputs were clone invention). Session-55 re-measure (v2.23): the
    // triggers carry NO aria-label — their accessible names are "Dates*" /
    // the stay form's "Preferred Check-In Time*" derived from the wrapping
    // labels (the live's session-60 contract).
    const datesTrigger = page.getByRole("button", { name: /^Dates\*/ });
    const timeTrigger = page.getByRole("button", { name: /^Preferred Check-In Time\*/ });
    await expect(datesTrigger).toBeVisible();
    await expect(timeTrigger).toBeVisible();
    for (const field of ["Name", "Surname", "Phone", "Email", "Message"]) {
      await expect(page.getByLabel(field, { exact: false }).first()).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Book Now", exact: true })).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(formAside).toHaveCSS("border-radius", "28px");
    await expect(formAside).toHaveCSS("border-top-color", "rgba(14, 14, 14, 0.08)");
    const formShadow = await formAside.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(formShadow).toBe("none");
    // Session-18: the fields are radius-16 pills (the live moved off
    // rounded-full); the textarea matches; the submit stays a full pill.
    const nameField = page.getByLabel("Name", { exact: true });
    await expect(nameField).toHaveCSS("border-radius", "16px");
    const messageField = page.getByLabel("Message", { exact: true });
    await expect(messageField).toHaveCSS("border-radius", "16px");
    const submitPill = page.getByRole("button", { name: "Book Now" });
    const submitRadius = await submitPill.evaluate((el) => parseFloat(getComputedStyle(el).borderRadius));
    expect(submitRadius).toBeGreaterThan(1000);
    const nameX = await page.getByLabel("Name", { exact: true }).boundingBox();
    const surnameX = await page.getByLabel("Surname", { exact: true }).boundingBox();
    expect(Math.abs(nameX!.x - surnameX!.x)).toBeLessThanOrEqual(2);

    // Session-28 re-measure: the live's field LABELS are 12px/600 #3A3A3A
    // with the asterisk INLINE in the same color (no violet span), and the
    // fields' border is the #DDDBD5 token (was 14px ink + black/10).
    const nameLabel = page.locator("label[for=booking-name]");
    await expect(nameLabel).toHaveCSS("font-size", "12px");
    await expect(nameLabel).toHaveCSS("font-weight", "600");
    await expect(nameLabel).toHaveCSS("color", "rgb(58, 58, 58)");
    const nameInputBorder = await nameField.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(nameInputBorder).toBe("rgb(221, 219, 213)");
  });

  test("the booking date/time picker popovers render the live's measured chrome (session 55)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/place/courtyard-stay", { waitUntil: "domcontentloaded" });
    const pad = (n: number) => String(n).padStart(2, "0");
    const now = new Date();
    const todayIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    // The TRIGGERS are the live's picker buttons: 44px, 16px radii, the
    // #DDDBD5 border, the calendar/clock + chevron icons, and the #888580
    // placeholder spans while empty. Session-55 (v2.23): the accessible
    // names are the LABEL texts ("Dates*" / the STAY form's "Preferred
    // Check-In Time*" — session-60 re-measure: the live differentiates the
    // time label by category; the eat/do forms keep "Time*") — the live's
    // triggers carry no aria-label/aria-expanded of their own.
    const datesTrigger = page.getByRole("button", { name: /^Dates\*/ });
    const timeTrigger = page.getByRole("button", { name: /^Preferred Check-In Time\*/ });
    for (const trigger of [datesTrigger, timeTrigger]) {
      await expect(trigger).toBeVisible();
      await expect(trigger).toHaveCSS("height", "44px");
      await expect(trigger).toHaveCSS("border-radius", "16px");
      await expect(trigger).toHaveCSS("border-top-color", "rgb(221, 219, 213)");
      const icons = trigger.locator("svg");
      await expect(icons).toHaveCount(2);
    }
    const datesPlaceholder = datesTrigger.locator("span").first();
    await expect(datesPlaceholder).toHaveCSS("color", "rgb(136, 133, 128)");

    // Session-55 re-measure (v2.23): the live's triggers carry NO
    // aria-label/aria-expanded of their own — the accessible names come
    // from the wrapping labels ("Dates*" / "Time*").
    await expect(datesTrigger).not.toHaveAttribute("aria-label");
    await expect(datesTrigger).not.toHaveAttribute("aria-expanded");
    await expect(timeTrigger).not.toHaveAttribute("aria-label");
    await expect(timeTrigger).not.toHaveAttribute("aria-expanded");
    // The live's form carries font-inter (the form-level font contract).
    const formClass = await page.locator("form#book-now").getAttribute("class");
    expect(formClass).toContain("font-inter");

    // The CALENDAR popover: cream bg, r-24, the #DDDBD5 hairline, the
    // 0 20px 48 /0.14 shadow, the month select, the S M T W T F S row,
    // and 42 day cells.
    await datesTrigger.click();
    const calendar = page.locator("[data-booking-calendar]");
    await expect(calendar).toBeVisible();
    await expect(calendar).toHaveCSS("background-color", "rgb(248, 247, 244)");
    await expect(calendar).toHaveCSS("border-radius", "24px");
    await expect(calendar).toHaveCSS("border-top-color", "rgb(221, 219, 213)");
    const popShadow = await calendar.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(popShadow).toContain("48px");
    await expect(calendar.locator("select")).toBeVisible();
    for (const wd of ["S", "M", "T", "W", "F"]) {
      await expect(calendar.getByText(wd, { exact: true }).first()).toBeVisible();
    }
    const dayCells = calendar.locator("button[data-day]");
    await expect(dayCells).toHaveCount(42);

    // Session-55 re-measure (v2.23): the MONTH ROW — exactly two children:
    // a `relative flex-1` wrapper (the month select + an ABSOLUTE
    // pointer-events-none chevron inside it) and the calendar-days icon
    // (stroke 2) at the row's END. The select is font-bold (700) with the
    // violet hover/focus borders and NO aria-label. The weekday row is
    // 700/uppercase/1.2px tracking. The popover container carries NO
    // font-inter (the live's popovers don't).
    const monthRow = calendar.locator(":scope > div").first();
    const monthRowInfo = await monthRow.evaluate((row) => {
      const kids = Array.from(row.children);
      const wrapper = kids[0] ?? null;
      const sel = wrapper?.querySelector("select") ?? null;
      const chev = wrapper?.querySelector("svg.lucide-chevron-down") ?? null;
      const calIcon = kids[kids.length - 1] ?? null;
      const chevCs = chev ? getComputedStyle(chev) : null;
      const selCs = sel ? getComputedStyle(sel) : null;
      return {
        kidCount: kids.length,
        wrapperCls: wrapper?.getAttribute("class") ?? "",
        lastKidIsCalIcon:
          calIcon?.tagName === "svg" && (calIcon.getAttribute("class") ?? "").includes("calendar-days"),
        calIconStroke: calIcon?.getAttribute("stroke-width") ?? "",
        chevInsideWrapper: !!chev,
        chevPosition: chevCs?.position ?? "",
        chevPointerEvents: chevCs?.pointerEvents ?? "",
        chevRightInset:
          chev && sel
            ? Math.round(sel.getBoundingClientRect().right - chev.getBoundingClientRect().right)
            : -1,
        selWeight: selCs?.fontWeight ?? "",
        selCls: sel?.getAttribute("class") ?? "",
        selAria: sel?.getAttribute("aria-label") ?? null,
      };
    });
    expect(monthRowInfo.kidCount).toBe(2);
    expect(monthRowInfo.wrapperCls).toContain("relative");
    expect(monthRowInfo.wrapperCls).toContain("flex-1");
    expect(monthRowInfo.lastKidIsCalIcon).toBe(true);
    expect(monthRowInfo.calIconStroke).toBe("2");
    expect(monthRowInfo.chevInsideWrapper).toBe(true);
    expect(monthRowInfo.chevPosition).toBe("absolute");
    expect(monthRowInfo.chevPointerEvents).toBe("none");
    expect(monthRowInfo.chevRightInset).toBe(20);
    expect(monthRowInfo.selWeight).toBe("700");
    expect(monthRowInfo.selCls).toContain("font-bold");
    expect(monthRowInfo.selCls).toContain("hover:border-[#571AFF]");
    expect(monthRowInfo.selCls).toContain("focus:border-[#571AFF]");
    expect(monthRowInfo.selAria).toBeNull();
    const calClass = await calendar.getAttribute("class");
    expect(calClass).not.toContain("font-inter");
    const weekdayRow = calendar.locator(":scope > div").nth(1);
    await expect(weekdayRow).toHaveCSS("font-weight", "700");
    await expect(weekdayRow).toHaveCSS("text-transform", "uppercase");
    await expect(weekdayRow).toHaveCSS("letter-spacing", "1.2px");

    // The past-day contract (date-robust): every cell whose data-date is
    // before today is DISABLED; every other cell is enabled.
    const dates = await dayCells.evaluateAll((cells) => cells.map((c) => c.getAttribute("data-date") ?? ""));
    const disableds = await dayCells.evaluateAll((cells) => cells.map((c) => (c as HTMLButtonElement).disabled));
    dates.forEach((d, i) => {
      if (d < todayIso) expect(disableds[i]).toBe(true);
      else expect(disableds[i]).toBe(false);
    });

    // The chevron rotates 180° while the popover is open.
    const chevron = datesTrigger.locator("svg").nth(1);
    const chevronClass = await chevron.getAttribute("class");
    expect(chevronClass).toContain("rotate-180");

    // Range semantics, on a FUTURE month (all its days are enabled — the
    // test can never time-rot): select the next month, click day 5 → the
    // "— select end date" intermediate; click day 7 → the complete label
    // + the popover CLOSES.
    const monthSelect = calendar.locator("select");
    await monthSelect.selectOption({ index: 1 });
    const dayBtn = (n: number) => calendar.locator(`button[data-day="${n}"]`);
    await dayBtn(5).first().click();
    await expect(datesTrigger).toContainText("select end date");
    await expect(calendar).toBeVisible();
    await dayBtn(7).first().click();
    await expect(datesTrigger).toContainText(/— .* 7/);
    await expect(calendar).toHaveCount(0);
    // The completed range renders the endpoints violet + the in-range tint.
    await datesTrigger.click();
    await expect(dayBtn(5).first()).toHaveClass(/bg-\[#571AFF\]/);
    await expect(dayBtn(6).first()).toHaveClass(/bg-\[#F0E9FF\]/);
    await page.keyboard.press("Escape");
    await expect(calendar).toHaveCount(0);

    // The TIME list: 29 slots from 08:00 to 22:00, 40px h-10 cells; a
    // click selects (the check icon) + closes; the trigger shows the
    // chosen time.
    await timeTrigger.click();
    const timeList = page.locator("[data-booking-time-list]");
    await expect(timeList).toBeVisible();
    await expect(timeList).toHaveCSS("background-color", "rgb(248, 247, 244)");
    // Session-55 re-measure (v2.23): the live's popover containers carry NO
    // font-inter (the slot buttons carry their own).
    const timeListClass = await timeList.getAttribute("class");
    expect(timeListClass).not.toContain("font-inter");
    const slots = timeList.locator("button");
    await expect(slots).toHaveCount(29);
    await expect(slots.first()).toHaveText("08:00");
    await expect(slots.last()).toHaveText("22:00");
    const slotH = await slots.first().evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(slotH).toBe(40);
    await timeList.getByRole("button", { name: "19:00", exact: true }).click();
    await expect(timeList).toHaveCount(0);
    await expect(timeTrigger).toContainText("19:00");
  });

  test("photo overlays: the white rating pill on the photo, no Map button (session 8)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/place/courtyard-stay", { waitUntil: "domcontentloaded" });
    // The rating rides ON the photo as a white pill (top-right)…
    const ratingPill = page.locator("[data-photo-rating]");
    await expect(ratingPill).toBeVisible();
    await expect(ratingPill).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(ratingPill).toContainText("4.8");
    // Session-29 re-measure (F8): the detail hero pill grew — pad 8px 12px
    // (was 6px 10px), a 14px star (was 13px) → 61×32 at desktop. Pinned at
    // 390 here: the pill computes 30-34px tall with a ≥14px star.
    const pillBox = await ratingPill.boundingBox();
    expect(pillBox!.height).toBeGreaterThanOrEqual(30);
    expect(pillBox!.height).toBeLessThanOrEqual(34);
    const starW = await ratingPill.evaluate((el) => {
      const svg = el.querySelector("svg");
      return svg ? Math.round(svg.getBoundingClientRect().width) : 0;
    });
    expect(starW).toBeGreaterThanOrEqual(14);
    // …and the Map link is GONE from the photo (live parity). Scoped to
    // main: the navbar and footer carry their own Map links.
    await expect(page.locator("main").getByRole("link", { name: "Map", exact: true })).toHaveCount(0);
    // The mobile hero photo is 260px tall (desktop keeps 460px).
    const photo = page.locator("main img").first();
    const h = await photo.evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(h)).toBe(260);

    // Session-24 re-measure: the heart overlay is the live's 36×36 dark
    // glass disc (w-9 h-9, svg 16px) — the session-10 "44×44" reading had
    // encoded the clone's own drift (the AGENTS.md "36px black/45 disc"
    // was right all along); verified on BOTH the browse cards and the
    // detail hero.
    const heart = page.getByRole("button", { name: "Save to favourites" }).first();
    const heartBox = await heart.boundingBox();
    expect(heartBox).not.toBeNull();
    expect(Math.round(heartBox!.width)).toBe(36);
    expect(Math.round(heartBox!.height)).toBe(36);
  });

  test("detail page container: max-w-6xl rounded-36 card, no border (session 10)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/place/courtyard-stay", { waitUntil: "domcontentloaded" });
    // The live detail page is ONE wide white card (max-w-6xl ≈ 1152px at
    // 1280) with a 36px radius and NO border — shadow only.
    const card = page.locator("main article").first();
    await expect(card).toHaveCSS("border-radius", "36px");
    await expect(card).toHaveCSS("border-top-width", "0px");
    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(cardBox!.width).toBeGreaterThan(1100);
    expect(cardBox!.width).toBeLessThan(1180);
    // Session-14 re-measure: the live's h1 tops at y≈225 (section pt-6 at
    // md + the card's p-10 inner padding — the clone ran 36px lower with
    // pt-10/pt-14).
    const detailH1Box = await page.getByRole("heading", { name: "Courtyard Stay", exact: true }).boundingBox();
    expect(detailH1Box!.y).toBeGreaterThanOrEqual(215);
    expect(detailH1Box!.y).toBeLessThanOrEqual(235);
    // The desktop hero photo is 460px at lg (and 420px at md).
    const photo = page.locator("main img").first();
    const photoH = await photo.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(photoH).toBe(460);

    // Session-18 re-measure: the live restructured the detail page — the
    // rounded-36 card now ends after the hero photo; "About this place"
    // and the booking form live BELOW the card in a separate two-column
    // grid (gap 24px, lg:grid-cols-[1.2fr_0.8fr]) whose form column is a
    // separate rounded-28 aside. The heading section also carries the
    // 18px graph-paper grid texture (the live's new surface).
    const aboutBox = await page.getByRole("heading", { name: "About this place" }).boundingBox();
    expect(aboutBox!.y).toBeGreaterThanOrEqual(cardBox!.y + cardBox!.height - 8);
    expect(await card.locator("aside").count()).toBe(0);
    expect(await card.getByText("About this place").count()).toBe(0);
    const grid = page.locator("[data-detail-grid]");
    const gridBox = await grid.boundingBox();
    expect(gridBox).not.toBeNull();
    expect(Math.round(gridBox!.width)).toBeGreaterThanOrEqual(1140);
    expect(Math.round(gridBox!.width)).toBeLessThanOrEqual(1165);
    const gridGap = await grid.evaluate((el) => parseFloat(getComputedStyle(el).columnGap));
    expect(Math.round(gridGap)).toBe(24);
    const asideBox = await page.locator("aside#book-now-card").boundingBox();
    expect(asideBox).not.toBeNull();
    expect(Math.round(asideBox!.width)).toBeGreaterThanOrEqual(440);
    expect(Math.round(asideBox!.width)).toBeLessThanOrEqual(465);
    // The hero heading section carries the scoped grid texture (40%).
    const heroOverlay = page.locator("main > section").first().locator("div.absolute").first();
    await expect(heroOverlay).toBeVisible();
    await expect(heroOverlay).toHaveCSS("opacity", "0.4");
    const heroBgSize = await heroOverlay.evaluate((el) => getComputedStyle(el).backgroundSize);
    expect(heroBgSize).toContain("18px");
  });

  test("booking records a request visible on the profile", async ({ page }) => {
    // Session-48: the booking is for TODAY — a deterministic pin for the
    // calendar-day classification (a same-day reservation must land under
    // Upcoming, never Past). A hardcoded future date would re-rot the day
    // the clock passes it; "today" can never cross itself.
    // Session-53 (v2.22): the Dates/Time values come from the PICKER
    // popovers (the live's trigger buttons), not free-text fills.
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    await page.goto("/place/courtyard-stay");
    await page.getByLabel("Name", { exact: true }).fill("Ada");
    await page.getByLabel("Surname", { exact: true }).fill("Lovelace");
    // The date-range picker: open the calendar, click today twice (a
    // single-day range — deterministic across the midnight boundary).
    // Session-55 (v2.23): the trigger's accessible name is the LABEL text
    // ("Dates*") — the trigger's VISIBLE text is asserted separately.
    const datesTrigger = page.getByRole("button", { name: /^Dates\*/ });
    const timeTrigger = page.getByRole("button", { name: /^Preferred Check-In Time\*/ });
    await datesTrigger.click();
    const todayCell = page.locator(`[data-booking-calendar] button[data-date="${todayIso}"]`);
    await todayCell.click();
    await todayCell.click();
    await expect(datesTrigger).not.toContainText("select end date");
    // The time picker: open the list, click 19:00.
    await timeTrigger.click();
    await page.locator("[data-booking-time-list]").getByRole("button", { name: "19:00", exact: true }).click();
    await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
    await page.getByRole("button", { name: "Book Now", exact: true }).click();
    // Session-53 (v2.22): the live's success note is a PLAIN centered
    // 12px/600 #2A6B3A line (no background pill) with the copy "Your
    // booking request for <place> has been sent." — and the form RESETS
    // (the picker placeholders return).
    const successNote = page.locator("aside#book-now-card p[role=status]");
    await expect(successNote).toBeVisible({ timeout: 15_000 });
    await expect(successNote).toHaveCSS("font-size", "12px");
    await expect(successNote).toHaveCSS("font-weight", "600");
    await expect(successNote).toHaveCSS("color", "rgb(42, 107, 58)");
    await expect(successNote).toHaveText(/Your booking request for Courtyard Stay has been sent/);
    const noteBg = await successNote.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(noteBg).toBe("rgba(0, 0, 0, 0)");
    // Session-55 (v2.23): the reset pins are now VISUAL — the triggers'
    // placeholder texts must RETURN (the accessible names are the static
    // label texts, so only a text assertion can fail on a visual reset
    // regression — the v2.22 aria-label pins could not).
    await expect(datesTrigger).toHaveText("Choose dates");
    await expect(timeTrigger).toHaveText("Choose time");
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("");

    await page.goto("/profile");
    await expect(page.getByText("My bookings")).toBeVisible();
    await expect(page.getByText("Courtyard Stay")).toBeVisible();
    expect(todayIso).toBeTruthy();
  });

  test("the mobile detail header sits at the live's 112px contract with the 36px Back pill (session-24)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/place/courtyard-stay");
    // Session-24 re-measure: the live's detail section rides the same
    // mobile pt-112 contract as the browses — the Back pill lands at
    // y≈112 — and the pill itself is the compact 36px-tall white pill
    // (pad 8/16, 14px/600, no shadow; the clone rendered 40px with the
    // float shadow and asymmetric pl-5/pr-7 padding).
    const back = page.getByRole("link", { name: "Back" });
    const backBox = await back.boundingBox();
    expect(backBox).not.toBeNull();
    expect(Math.round(backBox!.height)).toBe(36);
    expect(backBox!.y).toBeGreaterThanOrEqual(108);
    expect(backBox!.y).toBeLessThanOrEqual(116);
    const backShadow = await back.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(backShadow).toBe("none");
  });
});

test.describe("footer on every app page (session 6)", () => {
  // Session-16: /profile left this list — the live's profile page renders
  // WITHOUT the app chrome (no navbar, no footer; pinned by the profile
  // tests above).
  const PAGES = ["/eat", "/stay", "/do", "/map", "/favourites", "/place/moss-marble"];
  for (const path of PAGES) {
    test(`footer renders on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const footer = page.getByRole("contentinfo");
      await expect(footer).toBeVisible();
      // The white icon-cell pill carries the six view links.
      await expect(footer.getByRole("navigation", { name: "Footer" })).toBeVisible();
      await expect(footer.getByRole("link", { name: "Favourites", exact: true })).toBeVisible();
      await expect(footer.getByText("© 2026 Roam. Activity Map for Augsburg.")).toBeVisible();
      await expect(footer.getByRole("link", { name: "Privacy policy" })).toBeVisible();
    });
  }
});

test.describe("favourites round-trip", () => {
  test("a heart tap saves a place; Favourites lists and clears it", async ({ page }) => {
    await page.goto("/eat");
    const firstCard = page.locator("article").first();
    await firstCard.getByRole("button", { name: "Save to favourites" }).click();
    await expect(firstCard.getByRole("button", { name: "Remove from favourites" })).toBeVisible();

    // domcontentloaded: card imagery comes from the reference CDN — the
    // full "load" event can stall behind a slow image under network
    // contention and has caused spurious 45s timeouts.
    await page.goto("/favourites", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Favourites" })).toBeVisible();
    await expect(page.getByText("All saved restaurants, hotels, and places in one calm collection.")).toBeVisible();
    await expect(page.locator("article")).toHaveCount(1);

    // Session-10 re-measure: the h1 is the live's declared text-[55px] with
    // leading-[0.92] and tracking-[-0.06em] (asserted at the desktop
    // viewport — narrow viewports trigger Chromium's mobile text-size
    // adjustment on the reference, which is environment noise, not design).
    await page.setViewportSize({ width: 1280, height: 800 });
    const favH1 = page.getByRole("heading", { name: "Favourites" });
    await expect(favH1).toHaveCSS("font-size", "55px");
    await expect(favH1).toHaveCSS("letter-spacing", "-3.3px");
    // Session-12 re-measure: the live REGAINED the graph-paper grid — an
    // 18px-crossing overlay (rgba(20,20,19,0.055) lines at opacity 40%).
    // The main itself stays plain cream; the grid rides an absolute child.
    const mainBg = await page.locator("main").first().evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(mainBg).toBe("none");
    const hasGrid = await page.locator("main").first().evaluate((el) => {
      const overlay = el.querySelector("div[class*=opacity-40], div[style*=opacity]");
      if (!overlay) return false;
      const bg = getComputedStyle(overlay).backgroundImage;
      return bg !== "none" && bg.includes("linear-gradient");
    });
    expect(hasGrid, "the favourites page should carry the 18px grid overlay").toBe(true);
    // Session-14 re-measure: the overlay is scoped INSIDE the heading
    // section (h≈299 on the live — the texture covers the heading block
    // only, not the whole page), and the h1 sits at viewport y≈244 (the
    // live's pt-24 + the 56px heart icon above it).
    const overlayBox = await page.locator("main div[class*=opacity-40]").first().boundingBox();
    expect(overlayBox!.height).toBeLessThan(400);
    const favH1Box = await favH1.boundingBox();
    expect(favH1Box!.y).toBeGreaterThanOrEqual(230);
    expect(favH1Box!.y).toBeLessThanOrEqual(258);
    // Session-12: the subtitle renders 14px #3A3A3A (was 16px black/60).
    const sub = page.getByText("All saved restaurants, hotels, and places in one calm collection.");
    await expect(sub).toHaveCSS("font-size", "14px");
    await expect(sub).toHaveCSS("color", "rgb(58, 58, 58)");
    // Session-57 re-measure (v2.24): the live's subtitle carries the
    // centered max-w-xl block (mt 24px, 576px wide, x=352) and the h1's
    // own margin-bottom dropped (the live's spacing model).
    const favSubMt = await sub.evaluate((el) => getComputedStyle(el).marginTop);
    expect(favSubMt).toBe("24px");
    const favSubBox = await sub.boundingBox();
    expect(favSubBox!.width).toBeGreaterThanOrEqual(574);
    expect(favSubBox!.width).toBeLessThanOrEqual(578);
    expect(Math.round(favSubBox!.x)).toBe(352);
    await expect(favH1).toHaveCSS("margin-bottom", "0px");

    // Session-57 (v2.24) — phones: the live's favourites h1 computes
    // 50.7px at 390 (the same mobile scaling as the browse h1s) and the
    // subtitle's mt drops to 14px.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/favourites", { waitUntil: "domcontentloaded" });
    const favH1M = page.getByRole("heading", { name: "Favourites" });
    const favH1MSize = await favH1M.evaluate((el) => getComputedStyle(el).fontSize);
    expect(Math.round(parseFloat(favH1MSize))).toBe(51);
    const favSubM = page.getByText("All saved restaurants, hotels, and places in one calm collection.");
    const favSubMMt = await favSubM.evaluate((el) => getComputedStyle(el).marginTop);
    expect(favSubMMt).toBe("14px");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/favourites", { waitUntil: "domcontentloaded" });

    await page.locator("article").first().getByRole("button", { name: "Remove from favourites" }).click();
    await expect(page.getByText("No favourites yet")).toBeVisible();
    await expect(page.getByText("Tap a heart on any restaurant, hotel, or place card to save it here.")).toBeVisible();

    // Session-10 re-measure: the empty state mirrors the live — Inter
    // (sans) 20px semibold title over a 48px cream icon circle, not the old
    // serif title in the 56px deep-cream circle.
    const emptyTitle = page.getByText("No favourites yet");
    const emptyFont = await emptyTitle.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(emptyFont.toLowerCase()).toContain("inter");
    await expect(emptyTitle).toHaveCSS("font-size", "20px");
    await expect(emptyTitle).toHaveCSS("font-weight", "600");
    // Session-25 re-measure: the live's empty card is max-w-xl — 576px wide
    // and centered at 1280 (the clone had drifted to max-w-md/448; the
    // mobile 358@x16 contract is unchanged).
    const emptyCard = emptyTitle.locator("xpath=ancestor::section[1]");
    const emptyBox = await emptyCard.boundingBox();
    expect(emptyBox).not.toBeNull();
    expect(emptyBox!.width).toBeGreaterThan(550);
    expect(Math.abs(emptyBox!.x + emptyBox!.width / 2 - 640)).toBeLessThanOrEqual(2);
  });
});

test.describe("map view", () => {
  test("renders the headline, filter pills, dot markers and the status badge", async ({ page }) => {
    await page.goto("/map");
    await expect(page.getByRole("heading", { name: "Map", exact: true })).toBeVisible();
    await expect(page.getByText("Augsburg restaurants, hotels and experiences plotted across the old town.")).toBeVisible();
    // Session-57 re-measure (v2.24): the map's subtitle carries the live's
    // centered max-w-xl block (mt 24px, 576px, x=352) and the h1's own
    // margin dropped; on phones the h1 computes 50.7px (the browse-h1
    // mobile scaling — was 36px).
    const mapSub = page.getByText("Augsburg restaurants, hotels and experiences plotted across the old town.");
    const mapSubMt = await mapSub.evaluate((el) => getComputedStyle(el).marginTop);
    expect(mapSubMt).toBe("24px");
    const mapSubBox = await mapSub.boundingBox();
    expect(mapSubBox!.width).toBeGreaterThanOrEqual(574);
    expect(mapSubBox!.width).toBeLessThanOrEqual(578);
    expect(Math.round(mapSubBox!.x)).toBe(352);
    const mapH1 = page.getByRole("heading", { name: "Map", exact: true });
    await expect(mapH1).toHaveCSS("margin-bottom", "0px");
    // Session-18 re-measure: the map heading section carries the scoped
    // 18px graph-paper texture like the browse views (the live's new
    // heading surface).
    const mapOverlay = page.locator("main > section").first().locator("div.absolute").first();
    await expect(mapOverlay).toBeVisible();
    await expect(mapOverlay).toHaveCSS("opacity", "0.4");
    const mapBgSize = await mapOverlay.evaluate((el) => getComputedStyle(el).backgroundSize);
    expect(mapBgSize).toContain("18px");
    for (const label of ["All Places", "Restaurants", "Hotels", "Sights"]) {
      await expect(page.getByRole("button", { name: label, exact: true })).toBeVisible();
    }

    // Session-12 re-measure: the pills are 41px tall with 12px text (the
    // live compacted them from 44/14) — the ACTIVE pill stays
    // violet-tinted (bg rgb(240,234,255), text rgb(87,26,255));
    // inactive = white + rgba(14,14,14,0.08) border.
    const activePill = page.getByRole("button", { name: "All Places", exact: true });
    await expect(activePill).toHaveCSS("background-color", "rgb(240, 234, 255)");
    await expect(activePill).toHaveCSS("color", "rgb(87, 26, 255)");
    await expect(activePill).toHaveCSS("font-size", "12px");
    await expect(activePill).toHaveCSS("height", "41px");
    await expect(activePill.locator("svg").first()).toBeVisible();
    const inactivePill = page.getByRole("button", { name: "Sights", exact: true });
    await expect(inactivePill).toHaveCSS("background-color", "rgb(255, 255, 255)");

    // Session-12 re-measure: the search bar is FULL-WIDTH (≈1138px at
    // 1280, with a black/5 border) — not the old centered 516px pill.
    const search = page.getByLabel("Search the map");
    const searchBar = search.locator("xpath=ancestor::div[contains(@class,'rounded-full')][1]");
    const searchBarBox = await searchBar.boundingBox();
    expect(searchBarBox).not.toBeNull();
    expect(searchBarBox!.width).toBeGreaterThan(1000);

    // The nine demo pins plot as dot markers (session 3 parity — the
    // browse entities never appear on the live map).
    await expect(page.locator(".roam-marker")).toHaveCount(9);
    await expect(page.getByText("9 places")).toBeVisible();
    await expect(page.getByText("Places on the map")).toBeVisible();

    // Session-30 re-measure (F4): the live's pins are 12px dots — a 12px
    // ink circle with a 2px white border (was the clone's 16px + violet
    // active model) — and every pin carries a NAME-LABEL pill
    // (.roam-marker-label) that reveals on hover.
    const firstMarker = page.locator(".roam-marker").first();
    const markerBox = await firstMarker.boundingBox();
    expect(markerBox).not.toBeNull();
    expect(Math.round(markerBox!.width)).toBe(12);
    expect(Math.round(markerBox!.height)).toBe(12);
    await expect(firstMarker).toHaveCSS("border-radius", "50%");
    await expect(firstMarker).toHaveCSS("background-color", "rgb(14, 14, 14)");
    await expect(firstMarker).toHaveCSS("border-top-width", "2px");
    await expect(firstMarker).toHaveCSS("border-top-color", "rgb(255, 255, 255)");
    const labelCount = await page.locator(".roam-marker-label").count();
    expect(labelCount).toBe(9);
    await expect(page.locator(".roam-marker-label").first()).toHaveText(
      "Brass & Marble",
    );
    const labelBg = await page
      .locator(".roam-marker-label")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(labelBg).toBe("rgb(255, 255, 255)");

    // Session-30 re-measure (F3): the zoom controls are CIRCULAR 34px
    // buttons in a gapped stack (was Leaflet's joined 30px default pair).
    const zoomIn = page.locator(".leaflet-control-zoom-in");
    const zoomOut = page.locator(".leaflet-control-zoom-out");
    const zoomInBox = await zoomIn.boundingBox();
    const zoomOutBox = await zoomOut.boundingBox();
    expect(zoomInBox).not.toBeNull();
    expect(zoomOutBox).not.toBeNull();
    expect(Math.round(zoomInBox!.width)).toBe(34);
    expect(Math.round(zoomInBox!.height)).toBe(34);
    expect(Math.round(zoomOutBox!.width)).toBe(34);
    expect(Math.round(zoomOutBox!.height)).toBe(34);
    await expect(zoomIn).toHaveCSS("border-radius", "999px");
    await expect(zoomIn).toHaveCSS("border-top-width", "1px");
    await expect(zoomIn).toHaveCSS("background-color", "rgb(255, 255, 255)");
    const zoomGap = await page
      .locator(".leaflet-control-zoom")
      .evaluate((el) => getComputedStyle(el).rowGap);
    expect(zoomGap).toBe("8px");

    // Session-14 re-measure: the live's list cards are TEXT-ONLY — no
    // photos — 24px-radius white cards with the category eyebrow, 15px/600
    // titles, and the €-price meta (the clone rendered 90px image rows).
    // Session-16 re-measure: the live's card is a FOUR-row layout — the
    // eyebrow + price sit on ONE justified row (price right), the title
    // below, and the 12px #888580 NEIGHBORHOOD line at the bottom
    // (card h≈119) — and the do-places render their SUB-CATEGORY as the
    // eyebrow (LANTERN WALK / ROOFTOP MUSIC / ART WORKSHOP), not "SIGHT".
    const listSection = page.locator("#places-list");
    await expect(listSection).toBeVisible();
    await expect(listSection.locator("img")).toHaveCount(0);
    const listCard = listSection.locator("a").first();
    await expect(listCard).toHaveCSS("border-radius", "24px");
    // Session-16 order: the live's hardcoded array is interleaved — Brass &
    // Marble first, then Ember Garden, then Cloud Nine Hotel.
    await expect(listCard).toContainText("Brass & Marble");
    await expect(listCard).toContainText("Innenstadt");
    const cardBox = await listCard.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(cardBox!.height).toBeGreaterThanOrEqual(105);
    expect(cardBox!.height).toBeLessThanOrEqual(128);
    // The price rides the eyebrow row (right-aligned): its y matches the
    // eyebrow's y within 6px.
    const priceOnEyebrowRow = await listCard.evaluate((el) => {
      const spans = [...el.querySelectorAll("p, span")] as HTMLElement[];
      const eyebrow = spans.find((s) => /HOTEL|RESTAURANT|WALK|MUSIC|WORKSHOP/.test(s.innerText));
      const price = spans.find((s) => /^€+$/.test(s.innerText));
      if (!eyebrow || !price) return false;
      return Math.abs(eyebrow.getBoundingClientRect().y - price.getBoundingClientRect().y) < 6;
    });
    expect(priceOnEyebrowRow).toBe(true);
    // The do-places carry their sub-category as the eyebrow (no "SIGHT").
    await expect(listSection).toContainText("LANTERN WALK");
    await expect(listSection).toContainText("ROOFTOP MUSIC");
    await expect(listSection).toContainText("ART WORKSHOP");
    await expect(listSection.getByText("Sight", { exact: true })).toHaveCount(0);

    // Session-29 re-measure (F4): the eyebrow renders as a CREAM PILL —
    // bg #F8F7F4, full radius, ~26px tall (was plain text).
    const eyebrowPill = listCard.locator("p").first();
    await expect(eyebrowPill).toHaveCSS("background-color", "rgb(248, 247, 244)");
    const eyebrowRadius = await eyebrowPill.evaluate(
      (el) => parseFloat(getComputedStyle(el).borderRadius) > 1000,
    );
    expect(eyebrowRadius).toBe(true);
    const eyebrowBox = await eyebrowPill.boundingBox();
    expect(eyebrowBox!.height).toBeGreaterThanOrEqual(24);
    expect(eyebrowBox!.height).toBeLessThanOrEqual(28);
    // Session-29 re-measure (F5): the neighborhood line carries a 12px
    // MapPin svg before the text.
    const hoodLine = listCard.locator("p").last();
    const hoodHasIcon = await hoodLine.evaluate((el) => {
      const svg = el.querySelector("svg");
      return !!svg && Math.round(svg.getBoundingClientRect().width) === 12;
    });
    expect(hoodHasIcon).toBe(true);
    // Session-29 re-measure (F6): the list grid gap computes 12px (was 16).
    const gridGap = await listSection.evaluate((el) => {
      const grid = el.querySelector("div.grid");
      return grid ? getComputedStyle(grid).columnGap : "";
    });
    expect(gridGap).toBe("12px");

    // The Hotels pill narrows the canvas.
    await page.getByRole("button", { name: "Hotels", exact: true }).click();
    await expect(page.locator(".roam-marker")).toHaveCount(3);
    await expect(page.getByText("3 places")).toBeVisible();

    // Session-29 re-measure (F7): the map stats pills carry NO shadow
    // (was the 0 6px 16px /0.08 shadow).
    const statsPill = page.getByText("Augsburg center");
    await expect(statsPill).toHaveCSS("box-shadow", "none");

    // Session-30 re-measure (F5): clicking a pin navigates DIRECTLY to the
    // place page (the live has no popup — the URL changes, no .leaflet-popup
    // renders).
    const pinTarget = page.locator(".leaflet-marker-icon").first();
    await pinTarget.click();
    await page.waitForURL("**/place/map-brass-marble");
    await expect(page.getByRole("heading", { name: "Brass & Marble" })).toBeVisible();
    expect(page.locator(".leaflet-popup")).toHaveCount(0);
  });

  test("the map search shell is the live's sticky command center (session-24)", async ({ page }) => {
    await page.goto("/map");
    // Session-24 re-measure: the live REDESIGNED the map's filter area
    // into a STICKY glass shell (top-96 at md / top-10 on phones) that
    // wraps the original search pill + the filter button — inner radius
    // 34 at md / 30 on phones, bg white/78 (md) / white/92 (phones), the
    // 1px white/70 hairline, the 0 8px 22px /0.10 shadow; the category
    // pills render below at weight 600 (the clone had a static cream
    // pill with 500-weight pills below it).
    const shell = page.locator(".map-filter-shell");
    await expect(shell).toBeVisible();
    await expect(shell).toHaveCSS("position", "sticky");
    await expect(shell).toHaveCSS("top", "96px");
    const inner = shell.locator("> div").first();
    await expect(inner).toHaveCSS("border-radius", "34px");
    await expect(inner).toHaveCSS("border-top-width", "1px");
    // α-blended colors serialize as oklab(...) in Chromium — assert the
    // parsed alpha instead of the exact string (the 1px white/70 hairline).
    const innerBorderAlpha = await inner.evaluate((el) => {
      const m = getComputedStyle(el).borderTopColor.match(/([\d.]+)\)$/);
      return m ? parseFloat(m[1]) : -1;
    });
    expect(innerBorderAlpha).toBeGreaterThan(0.6);
    expect(innerBorderAlpha).toBeLessThan(0.8);
    const innerShadow = await inner.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(innerShadow).toContain("rgba(0, 0, 0, 0.1)");
    await expect(page.getByRole("button", { name: "All Places", exact: true })).toHaveCSS("font-weight", "600");
    // The search input still lives inside the shell (the live nests the
    // original rounded-full pill within the new glass shell).
    await expect(shell.getByLabel("Search the map")).toBeVisible();

    // Phones: the shell sticks at 10px under the tab-bar and the pills
    // grow to 44px touch targets.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/map");
    await expect(page.locator(".map-filter-shell")).toHaveCSS("top", "10px");
    await expect(page.locator(".map-filter-shell > div").first()).toHaveCSS("border-radius", "30px");
    await expect(page.getByRole("button", { name: "All Places", exact: true })).toHaveCSS("height", "44px");
  });
});

test.describe("profile", () => {
  test("renders the profile identity, booking tabs and the empty state", async ({ page }) => {
    await page.goto("/profile");
    // Session-50 re-measure: the live identity surface oscillated AGAIN
    // (the third flip — Explorer→sepnetflix2023→Explorer→sepnetflix2023):
    // the live's profile h1 now renders the account name "sepnetflix2023"
    // with the account EMAIL as the 16px #555550 line (the session-14
    // contract is back; the seed follows the live's current name).
    await expect(page.getByText("Profile", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "sepnetflix2023" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "sepnetflix2023" })).toHaveCSS("font-size", "72px");
    await expect(page.getByText("sepnetflix2023@outlook.com")).toBeVisible();
    await expect(page.getByText("Your Roam account")).toHaveCount(0);

    // Session-16 re-measure: the live's profile is a CHROME-LESS page — no
    // navbar at any breakpoint, no footer — carrying a FULL-PAGE fixed
    // 18px graph-paper grid overlay (opacity 40, pointer-events none),
    // with the outer block running px-5/pt-10 → md:px-8/md:pt-16 and the
    // main at max-w-4xl so the h1 tops at y≈203 on desktop.
    await expect(page.locator("nav[aria-label=Primary]")).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);
    const gridOverlay = page.locator("div.pointer-events-none.fixed.inset-0.opacity-40");
    await expect(gridOverlay).toHaveCount(1);
    await expect(gridOverlay).toHaveCSS("background-size", "18px 18px, 18px 18px");
    const h1Box = await page.getByRole("heading", { name: "sepnetflix2023" }).boundingBox();
    expect(h1Box).not.toBeNull();
    expect(h1Box!.y).toBeGreaterThanOrEqual(192);
    expect(h1Box!.y).toBeLessThanOrEqual(214);

    // Session-57 re-measure (v2.24): the live's glass refresh — the page
    // div carries the padding so the identity card spans the FULL 896px
    // of the max-w-4xl main (x=192 at 1280), with the backdrop-blur-24
    // frosted glass + the compound inset-highlight shadow; the h1's
    // line-height tightened to 0.92.
    const identityCard = page.getByRole("heading", { name: "sepnetflix2023" }).locator("xpath=ancestor::section[1]");
    const cardBox = await identityCard.boundingBox();
    expect(Math.round(cardBox!.width)).toBeGreaterThanOrEqual(894);
    expect(Math.round(cardBox!.width)).toBeLessThanOrEqual(898);
    expect(Math.round(cardBox!.x)).toBe(192);
    await expect(identityCard).toHaveCSS("backdrop-filter", "blur(24px)");
    // The live's bg-white/78 class does not compute (transparent + the
    // blur frosting) — the rendered card bg IS transparent.
    await expect(identityCard).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    const cardShadow = await identityCard.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(cardShadow).toContain("inset");
    expect(cardShadow).toContain("rgba(14, 14, 14, 0.1)");
    const h1lh = await page.getByRole("heading", { name: "sepnetflix2023" }).evaluate(
      (el) => getComputedStyle(el).lineHeight,
    );
    expect(Math.round(parseFloat(h1lh))).toBe(66);
    // The identity subtitle: 14px→16px responsive with the 20px top margin.
    const sub = page.getByText("sepnetflix2023@outlook.com");
    await expect(sub).toHaveCSS("font-size", "16px");
    const subMt = await sub.evaluate((el) => getComputedStyle(el).marginTop);
    expect(subMt).toBe("20px");
    // The stat chips: the cream pill + 600 weight + the 13px stroke-2 icons.
    const augsburgChip = page.getByText("Augsburg", { exact: true });
    await expect(augsburgChip).toHaveCSS("font-weight", "600");
    await expect(augsburgChip).toHaveCSS("background-color", "rgb(248, 247, 244)");
    const chipIcon = augsburgChip.locator("svg").first();
    const chipIconW = await chipIcon.evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(chipIconW).toBe(13);
    await expect(chipIcon).toHaveAttribute("stroke-width", "2");
    // The EYEBROW: the 0.18em tracking (2.16px at 12px) + #72706A.
    const eyebrow = page.getByText("Profile", { exact: true });
    await expect(eyebrow).toHaveCSS("color", "rgb(114, 112, 106)");
    const eyebrowLs = await eyebrow.evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(Math.round(parseFloat(eyebrowLs) * 100) / 100).toBeCloseTo(2.16, 1);

    // The identity card: rounded-[36px] white/78 glass with the stat chips
    // (Augsburg, 0 day streak, Explorer badge) and the dark Saved-places
    // button (heart icon + bare label — 154×44 on the live).
    await expect(page.getByText("Augsburg", { exact: true })).toBeVisible();
    await expect(page.getByText("0 day streak")).toBeVisible();
    const savedBtn = page.getByRole("link", { name: "Saved places", exact: true });
    await expect(savedBtn).toHaveAttribute("href", "/favourites");
    await expect(savedBtn).toHaveCSS("background-color", "rgb(14, 14, 14)");
    await expect(savedBtn.locator("svg").first()).toBeVisible();
    await expect(page.getByText(/Saved places ·/)).toHaveCount(0);

    // Session-12: "My bookings" is an H2 at 36px (was a 14px span).
    const bookingsH2 = page.getByRole("heading", { name: "My bookings" });
    await expect(bookingsH2).toBeVisible();
    await expect(bookingsH2).toHaveCSS("font-size", "36px");
    // Session-57 (v2.24): the h2's tracking tightened to -0.05em.
    const h2Ls = await bookingsH2.evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(Math.round(parseFloat(h2Ls) * 100) / 100).toBeCloseTo(-1.8, 1);

    // Session-57 re-measure (v2.24): the Upcoming/Past tabs are 18px-radius
    // (not pill) with the 0 8 18 /0.08 active shadow, the label renders
    // "Upcoming(N)" with NO space before the paren, the active tab's text
    // is #141413 and the inactive #72706A, and the total count renders a
    // CREAM PILL (bg #F8F7F4).
    const upcomingTab = page.getByRole("tab", { name: /Upcoming/ });
    await expect(upcomingTab).toHaveCSS("border-radius", "18px");
    await expect(upcomingTab).toHaveCSS("color", "rgb(20, 20, 19)");
    const tabShadow = await upcomingTab.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(tabShadow).toContain("rgba(14, 14, 14, 0.08)");
    expect(tabShadow).toContain("0px 8px 18px");
    const pastTab = page.getByRole("tab", { name: /Past/ });
    await expect(pastTab).toHaveCSS("color", "rgb(114, 112, 106)");
    // The label carries NO space before the paren ("Upcoming(2)").
    await expect(upcomingTab).toContainText(/Upcoming\(\d+\)/);
    await expect(upcomingTab).not.toContainText("Upcoming (");
    const bookingsCard = bookingsH2.locator("xpath=ancestor::section[1]");
    await expect(bookingsCard).toHaveCSS("backdrop-filter", "blur(20px)");
    const bookingsCount = bookingsCard.locator("span").filter({ hasText: /^\d+$/ }).first();
    await expect(bookingsCount).toHaveCSS("background-color", "rgb(248, 247, 244)");

    // Either the empty-upcoming state or an earlier test's reservation —
    // both prove the section renders. .first(): with zero bookings BOTH the
    // "Upcoming(0)" tab and the empty-state paragraph exist at once, and an
    // un-scoped .or() would trip strict mode on the pair.
    await expect(
      page.getByText("No upcoming reservations. Time to explore.").or(page.getByText(/Upcoming\(/)).first(),
    ).toBeVisible();

    // Session-57 re-measure (v2.24): the pills' glass chrome — the Go-back
    // + Sign-out controls carry the 1px black/6 border + backdrop-blur-xl,
    // and the Saved-places button hovers VIOLET with the lift.
    const signOut = page.getByRole("button", { name: "Sign out" });
    await expect(signOut).toHaveCSS("border-top-width", "1px");
    await expect(signOut).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0.06)");
    const signOutBlur = await signOut.evaluate((el) => getComputedStyle(el).backdropFilter);
    expect(signOutBlur).toContain("blur");
    const backBtn = page.getByRole("button", { name: "Go back" });
    await expect(backBtn).toHaveCSS("border-top-width", "1px");
    await savedBtn.hover();
    await expect(savedBtn).toHaveCSS("background-color", "rgb(87, 26, 255)");
    await page.mouse.move(0, 0);
    await expect(savedBtn).toHaveCSS("background-color", "rgb(14, 14, 14)");
  });

  test("profile identity centers on mobile; the back control is a Go back button (session 16)", async ({ page }) => {
    // Session-16 re-measure: the live's identity block runs text-center →
    // md:text-left (the h1/email/chips/Saved button center on phones),
    // the chip icons are map-pin / SUN / HEART (not flame/compass), and
    // the back control is a 44px white/80 "Go back" BUTTON at the very
    // top of the main (y≈64 on desktop).
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    // Session-57 (v2.24): the centering pins read the H1's own computed
    // text-align (the live's card carries no text-center itself — an
    // inner wrapper owns it; the computed result is what parity pins).
    const h1 = page.getByRole("heading", { name: "sepnetflix2023" });
    await expect(h1).toHaveCSS("text-align", "center");
    // Session-57 (v2.24): the h1's mobile size is 55px with the 50.6px
    // 0.92 line-height (the live's text-[55px] md:text-[72px] form).
    await expect(h1).toHaveCSS("font-size", "55px");
    const h1lhM = await h1.evaluate((el) => getComputedStyle(el).lineHeight);
    expect(Math.round(parseFloat(h1lhM))).toBe(51);
    // The subtitle renders 14px on phones (text-sm, growing to 16 at md).
    const subM = page.getByText("sepnetflix2023@outlook.com");
    await expect(subM).toHaveCSS("font-size", "14px");
    const h1Box = await h1.boundingBox();
    expect(h1Box).not.toBeNull();
    expect(h1Box!.y).toBeGreaterThanOrEqual(155);
    expect(h1Box!.y).toBeLessThanOrEqual(180);
    const streakChip = page.getByText("0 day streak");
    await expect(streakChip.locator("svg.lucide-sun")).toHaveCount(1);
    await expect(page.getByText("Explorer", { exact: true }).locator("svg.lucide-heart")).toHaveCount(1);
    const back = page.getByRole("button", { name: "Go back" });
    await expect(back).toBeVisible();
    const backBox = await back.boundingBox();
    expect(backBox).not.toBeNull();
    expect(Math.round(backBox!.width)).toBe(44);
    expect(Math.round(backBox!.height)).toBe(44);

    // Desktop: the identity block goes left-aligned.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "sepnetflix2023" })).toHaveCSS("text-align", "left");
  });

  test("profile category filters carry icons; a Back control exists (session 8)", async ({ page }) => {
    await page.goto("/profile");
    // The All/Eat/Stay/Do booking filter chips carry icons on the live app.
    const eatChip = page.getByRole("button", { name: "eat", exact: true });
    await expect(eatChip.locator("svg").first()).toBeVisible();
    // A Back control returns to the home page (session-16: the live's
    // control is a "Go back" button).
    const back = page.getByRole("button", { name: "Go back" });
    await expect(back).toBeVisible();
  });
});
