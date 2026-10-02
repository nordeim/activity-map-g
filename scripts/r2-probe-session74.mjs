// R2 probe — session 74 (v2.32). Verifies the remediated surfaces against
// the live's measured numbers. Run against the production server on :3100.
const BASE = "http://localhost:3100";
const results = [];
let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) pass++; else fail++;
  results.push(`${ok ? "PASS" : "FAIL"}: ${name}${detail ? " — " + detail : ""}`);
}

async function probe() {
  // ---- F1: the browse placeholder ----
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(BASE + "/eat", { waitUntil: "domcontentloaded" });
  const browseInput = page.locator(".browse-search-pill input");
  const bph = await browseInput.evaluate((el) => {
    const ph = getComputedStyle(el, "::placeholder");
    return { w: ph.fontWeight, c: ph.color };
  });
  check("browse placeholder weight 400", bph.w === "400", bph.w);
  check("browse placeholder color #9CA3AF", /156, 163, 175|#9CA3AF/i.test(bph.c), bph.c);
  const bTyped = await browseInput.evaluate((el) => getComputedStyle(el).fontWeight);
  check("browse typed weight 400", bTyped === "400", bTyped);

  // ---- F1: the map placeholder ----
  await page.goto(BASE + "/map", { waitUntil: "domcontentloaded" });
  const mapInput = page.getByLabel("Search the map");
  const mph = await mapInput.evaluate((el) => {
    const ph = getComputedStyle(el, "::placeholder");
    return { w: ph.fontWeight, c: ph.color };
  });
  check("map placeholder weight 400", mph.w === "400", mph.w);
  check("map placeholder color #9CA3AF", /156, 163, 175|#9CA3AF/i.test(mph.c), mph.c);

  // ---- F3: the zero state on /eat ----
  await page.goto(BASE + "/eat", { waitUntil: "domcontentloaded" });
  const search = page.getByLabel("Search places");
  await search.fill("zzzz-no-match");
  await search.press("Enter");
  const zeroCard = page.locator(".browse-zero-card");
  await zeroCard.waitFor({ state: "visible" });
  const zeroGeom = await zeroCard.evaluate((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const grid = el.closest(".browse-grid").getBoundingClientRect();
    const h2 = el.querySelector("h2");
    const p = el.querySelector("p");
    return {
      box: [Math.round(r.x), Math.round(r.width), Math.round(r.height)],
      gridW: Math.round(grid.width),
      radius: parseFloat(cs.borderRadius),
      padY: parseFloat(cs.paddingTop),
      shadow: cs.boxShadow,
      title: h2.textContent.trim(),
      titleSize: getComputedStyle(h2).fontSize,
      titleWeight: getComputedStyle(h2).fontWeight,
      titleColor: getComputedStyle(h2).color,
      hint: p.textContent.trim(),
      hintSize: getComputedStyle(p).fontSize,
      hintColor: getComputedStyle(p).color,
      gap: Math.round(p.getBoundingClientRect().y - h2.getBoundingClientRect().bottom),
      svgCount: el.querySelectorAll("svg").length,
      btnCount: el.querySelectorAll("button").length,
    };
  });
  check("zero card inside grid (width == grid width)", zeroGeom.box[1] === zeroGeom.gridW, `${zeroGeom.box[1]} vs ${zeroGeom.gridW}`);
  check("zero card radius 28", Math.round(zeroGeom.radius) === 28, String(zeroGeom.radius));
  check("zero card py-16 (64px)", zeroGeom.padY === 64, String(zeroGeom.padY));
  check("zero card no shadow", zeroGeom.shadow === "none", zeroGeom.shadow);
  check("zero title 'No restaurants found'", zeroGeom.title === "No restaurants found", zeroGeom.title);
  check("zero title Inter 20px/400 ink", zeroGeom.titleSize === "20px" && zeroGeom.titleWeight === "400" && zeroGeom.titleColor === "rgb(14, 14, 14)", `${zeroGeom.titleSize}/${zeroGeom.titleWeight}/${zeroGeom.titleColor}`);
  check("zero hint 'Try widening your search'", zeroGeom.hint === "Try widening your search", zeroGeom.hint);
  check("zero hint 14px #888580", zeroGeom.hintSize === "14px" && zeroGeom.hintColor === "rgb(136, 133, 128)", `${zeroGeom.hintSize}/${zeroGeom.hintColor}`);
  check("zero hint 4px below title", zeroGeom.gap === 4, String(zeroGeom.gap));
  check("zero card text only (no svg/button)", zeroGeom.svgCount === 0 && zeroGeom.btnCount === 0, `${zeroGeom.svgCount}/${zeroGeom.btnCount}`);

  // The /stay + /do zero titles
  for (const [path, title] of [["/stay", "No hotels found"], ["/do", "No experiences found"]]) {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    const s = page.getByLabel("Search places");
    await s.fill("zzzz-no-match");
    await s.press("Enter");
    const t = await page.locator(".browse-zero-card h2").textContent();
    check(`${path} zero title`, t.trim() === title, t.trim());
  }

  // ---- F4: the vibe structure ----
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const section = page.locator("#stay-showcase");
  const sticky = page.locator("#stay-showcase [data-vibe-heading]");
  const nested = page.locator("#stay-showcase [data-vibe-grid-section]");
  const grid = nested.locator("ul");
  const structure = await section.evaluate((el) => {
    const kids = [...el.children];
    const texture = kids[0];
    const stickyEl = el.querySelector("[data-vibe-heading]");
    const nestedEl = el.querySelector("[data-vibe-grid-section]");
    const sr = el.getBoundingClientRect();
    return {
      sectionY: Math.round(sr.y + window.scrollY),
      sectionH: Math.round(sr.height),
      kidCount: kids.length,
      texturePos: getComputedStyle(texture).position,
      textureOpacity: getComputedStyle(texture).opacity,
      stickyPos: getComputedStyle(stickyEl).position,
      stickyH: Math.round(stickyEl.getBoundingClientRect().height),
      stickyPadTop: parseFloat(getComputedStyle(stickyEl).paddingTop),
      nestedPadTop: parseFloat(getComputedStyle(nestedEl).paddingTop),
      nestedPadBottom: parseFloat(getComputedStyle(nestedEl).paddingBottom),
    };
  });
  check("vibe section ~2632 tall (2633 measured pre)", structure.sectionH >= 2600 && structure.sectionH <= 2660, String(structure.sectionH));
  check("texture layer absolute 0.36", structure.texturePos === "absolute" && Math.abs(structure.textureOpacity - 0.36) < 0.01, `${structure.texturePos}/${structure.textureOpacity}`);
  check("sticky block vh-tall top-0", structure.stickyPos === "sticky" && structure.stickyH === 800, `${structure.stickyPos}/${structure.stickyH}`);
  check("sticky pt-88", structure.stickyPadTop === 88, String(structure.stickyPadTop));
  check("nested pt-112/pb-144", structure.nestedPadTop === 112 && structure.nestedPadBottom === 144, `${structure.nestedPadTop}/${structure.nestedPadBottom}`);

  // The pin: park mid-pin and verify the h2 holds 88.
  await page.evaluate(() => window.scrollTo({ top: 999999, behavior: "instant" }));
  await page.waitForTimeout(600);
  const sectionY = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((y) => window.scrollTo({ top: y + 512, behavior: "instant" }), sectionY);
  await page.waitForTimeout(600);
  const h2 = sticky.locator("h2");
  const h2Y = await h2.evaluate((el) => Math.round(el.getBoundingClientRect().y));
  check("h2 PINS at viewport y 88 mid-section", h2Y === 88, String(h2Y));
  const gridY = await grid.evaluate((el) => Math.round(el.getBoundingClientRect().y));
  check("grid still below fold at mid-pin (400)", gridY > 380 && gridY < 500, String(gridY));

  // The static grid: identity transforms + same column tops.
  const gridState = await grid.evaluate((el) => {
    const cols = [...el.querySelectorAll("li[data-fan-col]")];;
    const cards = [...el.children[0].children];;
    return {
      cols: cols.length,
      cards: cards.length,
      colT: cols.every((c) => getComputedStyle(c).transform === "none" || getComputedStyle(c).transform === "matrix(1, 0, 0, 1, 0, 0)"),
      cardT: cards.every((c) => getComputedStyle(c).transform === "none" || getComputedStyle(c).transform === "matrix(1, 0, 0, 1, 0, 0)"),
      colTops: new Set(cols.map((c) => Math.round(c.getBoundingClientRect().y))).size,
      cardW: Math.round(cards[0].getBoundingClientRect().width),
    };
  });
  check("grid 3 cols × 4 cards static", gridState.cols === 3 && gridState.cards === 4 && gridState.colT && gridState.cardT && gridState.colTops === 1, JSON.stringify(gridState));
  check("cards 381 wide at 1280", gridState.cardW >= 378 && gridState.cardW <= 384, String(gridState.cardW));

  // The stay img parallax: the amplitude ~±8% of the LAYOUT height (449 → ±35.9).
  const stayImg = page.locator("#stay-showcase article img").first();
  const sweep = [];
  for (const y of [sectionY - 500, sectionY + 512, sectionY + 1100, sectionY + 1800]) {
    await page.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" }), y);
    await page.waitForTimeout(400);
    const ty = await stayImg.evaluate((el) => {
      const tf = getComputedStyle(el).transform;
      const m = tf.match(/matrix\(([^)]+)\)/);
      return m ? parseFloat(m[1].split(",")[5]) : null;
    });
    sweep.push(Math.round(ty * 10) / 10);
  }
  const maxAbs = Math.max(...sweep.map(Math.abs));
  check("stay img parallax amplitude ~±36 (not ±45)", maxAbs > 30 && maxAbs < 42, JSON.stringify(sweep));

  // The sights pt.
  const sights = page.locator("#highlighted-sights");
  const sightsPad = await sights.evaluate((el) => parseFloat(getComputedStyle(el).paddingTop));
  check("sights pt-144 at desktop", sightsPad === 144, String(sightsPad));

  // ---- The mobile contract (390) ----
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const mob = await sticky.evaluate((el) => ({
    pos: getComputedStyle(el).position,
    padTop: parseFloat(getComputedStyle(el).paddingTop),
    padBottom: parseFloat(getComputedStyle(el).paddingBottom),
  }));
  check("mobile heading relative pt-48/pb-18", mob.pos === "relative" && mob.padTop === 48 && mob.padBottom === 18, JSON.stringify(mob));
  const mobNested = await nested.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { t: parseFloat(cs.paddingTop), b: parseFloat(cs.paddingBottom) };
  });
  check("mobile grid section pt-20/pb-56", mobNested.t === 20 && mobNested.b === 56, JSON.stringify(mobNested));
  const mobCard = page.locator("#stay-showcase article").first();
  const mobCardBox = await mobCard.boundingBox();
  check("mobile cards 354 @x=18", Math.round(mobCardBox.width) === 354 && Math.round(mobCardBox.x) === 18, `${mobCardBox.x}/${mobCardBox.width}`);
  const mobSights = await sights.evaluate((el) => parseFloat(getComputedStyle(el).paddingTop));
  check("sights pt-48 at mobile", mobSights === 48, String(mobSights));
  // The mobile browse placeholder (44px input + the same gray placeholder)
  await page.goto(BASE + "/eat", { waitUntil: "domcontentloaded" });
  const mInput = page.locator(".browse-search-pill input");
  const mGeom = await mInput.evaluate((el) => {
    const ph = getComputedStyle(el, "::placeholder");
    return { h: Math.round(el.getBoundingClientRect().height), w: ph.fontWeight, c: ph.color };
  });
  check("mobile browse input 44px + placeholder 400/#9CA3AF", mGeom.h === 44 && mGeom.w === "400" && /156, 163, 175/i.test(mGeom.c), JSON.stringify(mGeom));

  console.log(results.join("\n"));
  console.log(`\n${pass} passed, ${fail} failed (of ${pass + fail})`);
  if (fail > 0) process.exit(1);
}

import { chromium } from "playwright";
(async () => {
  const browser = await chromium.launch();
  globalThis.page = await browser.newPage();
  try {
    await probe();
  } finally {
    await browser.close();
  }
})();
