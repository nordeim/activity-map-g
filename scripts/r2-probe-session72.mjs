// R2 probe — session 72 (v2.31): verify the search-input model against
// the live's measured values on the LOCAL production server (the same
// server the E2E gate boots, :3100). Run together with the server in
// ONE bash invocation (the sandbox trap).
import { chromium } from "@playwright/test";

const BASE = "http://localhost:3100";

async function probe(page, url, label) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  return await page.evaluate((lbl) => {
    const input = document.querySelector("input[type=search], input[type=text]");
    const pill = input?.closest("div");
    const row = input?.closest(".map-search-row");
    const cs = input ? getComputedStyle(input) : null;
    const pcs = input ? getComputedStyle(input, "::placeholder") : null;
    const r = input?.getBoundingClientRect();
    const pr = pill?.getBoundingClientRect();
    const rr = row?.getBoundingClientRect();
    return {
      label: lbl,
      inputH: r ? Math.round(r.height) : null,
      inputW: r ? Math.round(r.width) : null,
      inputWeight: cs?.fontWeight,
      inputColor: cs?.color,
      placeholderWeight: pcs?.fontWeight,
      placeholderColor: pcs?.color,
      pillH: pr ? Math.round(pr.height) : null,
      pillW: pr ? Math.round(pr.width) : null,
      rowH: rr ? Math.round(rr.height) : null,
    };
  }, label);
}

const checks = [];
function check(name, cond, detail) {
  checks.push({ name, ok: !!cond, detail });
  console.log(`${cond ? "PASS" : "FAIL"}: ${name}${detail ? " — " + JSON.stringify(detail) : ""}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

// Desktop: browse
const dBrowse = await probe(page, `${BASE}/eat`, "browse-desktop-1280");
check("browse desktop pill 54", dBrowse.pillH === 54, { pillH: dBrowse.pillH });
check("browse desktop pill ~720", dBrowse.pillW >= 710 && dBrowse.pillW <= 730, { pillW: dBrowse.pillW });
check("browse desktop input content-driven 16-24", dBrowse.inputH >= 16 && dBrowse.inputH <= 24, { inputH: dBrowse.inputH });
check("browse desktop input weight 400", dBrowse.inputWeight === "400", { w: dBrowse.inputWeight });
check("browse desktop placeholder 500", dBrowse.placeholderWeight === "500", { w: dBrowse.placeholderWeight });
check("browse desktop placeholder black/40", /0\.4\)/.test(dBrowse.placeholderColor || ""), { c: dBrowse.placeholderColor });
check("browse desktop input color #141413", /20, 20, 19|141413/.test(dBrowse.inputColor || ""), { c: dBrowse.inputColor });

// Desktop: map
const dMap = await probe(page, `${BASE}/map`, "map-desktop-1280");
check("map desktop row 48", dMap.rowH === 48, { rowH: dMap.rowH });
check("map desktop input content-driven 16-24", dMap.inputH >= 16 && dMap.inputH <= 24, { inputH: dMap.inputH });
check("map desktop input weight 400", dMap.inputWeight === "400", { w: dMap.inputWeight });
check("map desktop placeholder 500", dMap.placeholderWeight === "500", { w: dMap.placeholderWeight });

// Mobile 390: browse
await page.setViewportSize({ width: 390, height: 844 });
const mBrowse = await probe(page, `${BASE}/eat`, "browse-mobile-390");
check("browse mobile pill 54", mBrowse.pillH === 54, { pillH: mBrowse.pillH });
check("browse mobile input 44", mBrowse.inputH === 44, { inputH: mBrowse.inputH });
check("browse mobile input weight 400", mBrowse.inputWeight === "400", { w: mBrowse.inputWeight });

// Mobile 390: map
const mMap = await probe(page, `${BASE}/map`, "map-mobile-390");
check("map mobile row 48", mMap.rowH === 48, { rowH: mMap.rowH });
check("map mobile input 44", mMap.inputH === 44, { inputH: mMap.inputH });

// Console errors across the probed pages
check("zero console errors", errors.length === 0, { errors: errors.slice(0, 3) });

await browser.close();
const failed = checks.filter((c) => !c.ok);
console.log(`\nR2 RESULT: ${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
