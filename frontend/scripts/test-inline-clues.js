const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  // Try a few likely ports in case vite picked a different one
  const ports = [3000, 3001, 3002, 5173];
  let connected = false;
  for (const p of ports) {
    try {
      await page.goto(`http://localhost:${p}`, { timeout: 2000 });
      await page.waitForSelector('.player-grid-force-ltr', { timeout: 2000 });
      console.log('Connected to port', p);
      connected = true;
      break;
    } catch (err) {
      // try next port
    }
  }
  if (!connected) {
    console.error('Unable to connect to local dev server');
    await browser.close();
    process.exit(1);
  }

  // Click row header '2'
  const rowButtons = await page.$$('button');
  let targetBtn = null;
  for (const btn of rowButtons) {
    const span = await btn.$('.row-number');
    if (span) {
      const text = (await span.innerText()).trim();
      if (text === '2') { targetBtn = btn; break; }
    }
  }
  if (!targetBtn) {
    console.error('Row button 2 not found');
    await browser.close();
    process.exit(2);
  }

  await targetBtn.click();
  // wait for visible clue
  const visible = await page.waitForSelector('.floating-clue[data-visible="true"]', { timeout: 2000 }).catch(() => null);
  if (!visible) {
    console.error('No visible clue found after clicking row header 2');
    await browser.close();
    process.exit(3);
  }

  // Verify the visible clue is a descendant of the wrapper containing the clicked button
  const result = await page.evaluate((btn) => {
    // find the button node again (btn is not serializable)
    const all = Array.from(document.querySelectorAll('button'));
    let theBtn = null;
    for (const b of all) { if (b.querySelector('.row-number') && b.querySelector('.row-number').innerText.trim() === '2') { theBtn = b; break; } }
    if (!theBtn) return { ok: false, reason: 'button-not-found' };
    const wrapper = theBtn.closest('.relative');
    if (!wrapper) return { ok: false, reason: 'wrapper-not-found' };
    const clue = wrapper.querySelector('.floating-clue[data-visible="true"]');
    if (!clue) return { ok: false, reason: 'clue-not-inside-wrapper' };
    // compute minimal separation (should be <= 20px either horizontally or vertically)
    const a = theBtn.getBoundingClientRect();
    const c = clue.getBoundingClientRect();
    const horiz = Math.max(0, Math.max(c.left - a.right, a.left - c.right));
    const vert = Math.max(0, Math.max(c.top - a.bottom, a.top - c.bottom));
    const minGap = Math.min(horiz, vert);
    return { ok: true, horiz, vert, minGap };
  });

  console.log('Row header test:', result);

  await browser.close();
})();
