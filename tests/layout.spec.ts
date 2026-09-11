import { test, expect } from '@playwright/test';
const WIDTHS = [375, 768, 1280, 1440];

for (const w of WIDTHS) test(`layout integrity @${w}`, async ({ page }) => {
  await page.setViewportSize({width:w,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.waitForTimeout(700);

  // no horizontal overflow anywhere on the page
  const overflow = await page.evaluate(()=>document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow at ${w}px`).toBeLessThanOrEqual(1);

  // every section still renders with real height
  const sections = await page.evaluate(()=>[...document.querySelectorAll('section[id]')]
    .map(s=>({id:s.id, h:Math.round(s.getBoundingClientRect().height)})));
  const empty = sections.filter(s=>s.h < 80);
  expect(empty, `collapsed sections at ${w}px`).toEqual([]);

  // any element wider than the viewport?
  const wide = await page.evaluate(()=>[...document.querySelectorAll('body *')]
    .filter(e=>{const r=e.getBoundingClientRect();
      return r.width > innerWidth + 2 && getComputedStyle(e).overflowX === 'visible' && r.height > 0;})
    .slice(0,5).map(e=>(e.tagName+'.'+e.className).slice(0,50)));
  console.log(`W${w} sections=${sections.length} overflow=${overflow} wideEls=${JSON.stringify(wide)}`);

  await page.screenshot({path:`/tmp/qa-${w}.png`, fullPage: w===375});
});

test('reduced motion leaves the page usable', async ({ page }) => {
  await page.setViewportSize({width:1280,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.waitForTimeout(600);
  // counters should show final values, no pinning
  await expect(page.locator('[data-count]')).toHaveText(['8','10','100']);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});

test('dialog still works after the restyle', async ({ page }) => {
  await page.setViewportSize({width:1280,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.locator('.nav-cta .button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').locator('form')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
