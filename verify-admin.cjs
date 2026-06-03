const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:5199/admin');
  await page.screenshot({ path: 'C:\\Users\\LENOVO\\AppData\\Local\\Temp\\admin-1-login.png' });
  console.log('1. Login page loaded');

  const passInput = page.locator('input[type="password"]');
  if (await passInput.isVisible()) {
    await passInput.fill('capfactory2025');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'C:\\Users\\LENOVO\\AppData\\Local\\Temp\\admin-2-panel.png' });
    console.log('2. Logged in');
  } else {
    console.log('2. No password input found');
  }

  const allButtons = await page.locator('button').all();
  const filterTexts = [];
  for (const btn of allButtons) {
    const t = (await btn.textContent().catch(() => '')).trim();
    const keywords = ['Todas', 'Todos', 'Visibles', 'Ocultos', 'Snapback', 'Trucker', 'Daddy', '5 Paneles', 'Deportivas', 'Publicitarias'];
    if (keywords.some(k => t === k || t.includes(k))) filterTexts.push(t);
  }
  console.log('3. Filter buttons found:', JSON.stringify(filterTexts));

  const counterText = await page.locator('span.ml-auto').textContent().catch(() => 'not found');
  console.log('4. Counter:', counterText);

  const snapBtn = page.locator('button', { hasText: 'Snapback' }).first();
  if (await snapBtn.isVisible().catch(() => false)) {
    await snapBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'C:\\Users\\LENOVO\\AppData\\Local\\Temp\\admin-3-snapback.png' });
    const c2 = await page.locator('span.ml-auto').textContent().catch(() => 'not found');
    console.log('5. After Snapback - counter:', c2);
  } else {
    console.log('5. Snapback button not visible');
  }

  const hiddenBtn = page.locator('button', { hasText: 'Ocultos' }).first();
  if (await hiddenBtn.isVisible().catch(() => false)) {
    await hiddenBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'C:\\Users\\LENOVO\\AppData\\Local\\Temp\\admin-4-ocultos.png' });
    const c3 = await page.locator('span.ml-auto').textContent().catch(() => 'not found');
    console.log('6. After Ocultos - counter:', c3);
  }

  await browser.close();
  console.log('Done.');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
