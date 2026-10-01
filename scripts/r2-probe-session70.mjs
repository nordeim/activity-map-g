import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Desktop browse pill geometry
await page.goto('http://localhost:3200/stay', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.browse-search-pill');
const desktop = await page.evaluate(() => {
  const pill = document.querySelector('.browse-search-pill');
  const date = document.querySelector('.browse-date-pill');
  const people = document.querySelector('.browse-people-pill');
  const block = document.querySelector('.browse-combined-block');
  const card = document.querySelector('.browse-planner-card');
  const icons = card.children[card.children.length - 2];
  const box = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
  return { pill: box(pill), date: box(date), people: box(people), block: box(block), icons: box(icons),
    inputH: Math.round(document.querySelector('.browse-search-pill input').getBoundingClientRect().height),
    pillRadius: getComputedStyle(pill).borderRadius, dateRadius: getComputedStyle(date).borderRadius };
});
console.log('DESKTOP', JSON.stringify(desktop));

// Mobile browse card
const mp = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mp.goto('http://localhost:3200/stay', { waitUntil: 'domcontentloaded' });
await mp.waitForSelector('.browse-search-pill');
const mobile = await mp.evaluate(() => {
  const card = document.querySelector('.browse-planner-card');
  const pill = document.querySelector('.browse-search-pill');
  const date = document.querySelector('.browse-date-pill');
  const people = document.querySelector('.browse-people-pill');
  const box = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
  return { card: box(card), pill: box(pill), date: box(date), people: box(people),
    pillRadius: getComputedStyle(pill).borderRadius };
});
console.log('MOBILE', JSON.stringify(mobile));

// Map zero-state card
await page.goto('http://localhost:3200/map', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.map-canvas-frame');
const zero = await page.evaluate(async () => {
  const input = document.querySelector('input[placeholder*="romantic"]');
  input.focus();
  const card = document.querySelector('.map-empty-card');
  return card ? 'card-present-before-search' : 'no-card-yet';
});
console.log('MAP-ZERO-PRE', zero);
await page.keyboard.type('castle');
await page.keyboard.press('Enter');
await page.waitForTimeout(800);
const zeroCard = await page.evaluate(() => {
  const card = document.querySelector('.map-empty-card');
  if (!card) return 'MISSING';
  const r = card.getBoundingClientRect();
  const cs = getComputedStyle(card);
  const p = card.querySelector('p');
  const pcs = p ? getComputedStyle(p) : null;
  return { box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], radius: cs.borderRadius, bg: cs.backgroundColor, pad: cs.paddingTop, text: p?.textContent, fs: pcs?.fontSize, family: pcs?.fontFamily.slice(0, 30), color: pcs?.color, markers: document.querySelectorAll('.roam-marker').length };
});
console.log('MAP-ZERO-CARD', JSON.stringify(zeroCard));

// Browse first-card order
const orders = {};
for (const cat of ['eat', 'stay', 'do']) {
  await page.goto(`http://localhost:3200/${cat}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('article');
  orders[cat] = await page.evaluate(() => {
    const a = document.querySelector('article a[href*="/place/"]');
    const sub = a.querySelector('p.mb-1, .text-xs.text-white\\/75');
    return (sub?.textContent || a.textContent || '').trim().slice(0, 22);
  });
}
console.log('FIRST-CARDS', JSON.stringify(orders));

// Console errors
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://localhost:3200/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);
console.log('CONSOLE-ERRORS', errors.length);
await browser.close();
