const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console errors
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto('http://localhost:5199');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:\\Users\\LENOVO\\AppData\\Local\\Temp\\search-1-home.png' });
  console.log('1. Home loaded. URL:', page.url());

  // Find search input
  const searchInput = page.locator('input[placeholder="Buscar modelo..."]').first();
  const isVisible = await searchInput.isVisible().catch(() => false);
  console.log('2. Search input visible:', isVisible);

  if (isVisible) {
    await searchInput.fill('snapback');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:\\Users\\LENOVO\\AppData\\Local\\Temp\\search-2-typed.png' });
    console.log('3. Typed "snapback". URL:', page.url());

    // Check if view switched to catalog
    const filterBar = await page.locator('.sticky').count();
    console.log('4. Sticky elements (filter bar visible?):', filterBar);

    // Count product cards visible
    const cards = await page.locator('.grid .group').count();
    console.log('5. Product cards visible:', cards);

    // Check for "modelos" count text
    const modelosText = await page.locator('p:has-text("modelos")').textContent().catch(() => 'not found');
    console.log('6. Modelos text:', modelosText);
  }

  if (errors.length) {
    console.log('JS ERRORS:', errors.join('\n'));
  } else {
    console.log('No JS errors.');
  }

  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
