import { test, expect } from '@playwright/test';
for (const width of [1280, 375]) test(`page and interactions at ${width}px`, async ({ page }) => {
  const errors: string[]=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toHaveText('IdeasIntoImpact.');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
  if(width===375){
    await page.getByRole('button',{name:'Open menu'}).click();
    await expect(page.locator('#mobile-menu a').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button',{name:'Open menu'})).toBeFocused();
  }
  const service=page.getByRole('button',{name:/01 Web Development/});
  await service.click();
  await expect(service).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('#service-detail')).toContainText('custom web applications');
  await service.click();
  await page.getByRole('button',{name:'View Kyzo case study'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  const engineering=page.getByRole('tab',{name:/Engineering/});
  await engineering.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('tab',{name:/Growth/})).toHaveAttribute('aria-selected','true');
  await expect(page.getByRole('tabpanel')).toContainText('SEO');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('tabpanel')).toContainText('CRM Integrations');
  await expect(page.locator('.story-statement')).toHaveCount(3);
  for (const frame of await page.locator('.story-statement').all()) {
    await expect(frame).toHaveCSS('opacity','1');
  }
  await page.getByRole('button',{name:/Technology should/}).click();
  await expect(page.getByRole('dialog')).toContainText('removes work from your day');
  await page.getByRole('button',{name:'Close dialog'}).click();
  await page.getByRole('button',{name:/A beautiful website/}).click();
  await expect(page.getByRole('dialog')).toContainText('work backward');
  await page.getByRole('button',{name:'Close dialog'}).click();
  await page.getByRole('button',{name:'Our studio in motion'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('link',{name:'Explore the work'}).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  for(const image of await page.locator('main img').all()){
    await image.evaluate((el:HTMLImageElement)=>el.loading='eager');
    await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>el.complete && el.naturalWidth>0)).toBe(true);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
  expect(errors).toEqual([]);
  await page.evaluate(()=>window.scrollTo(0,0));

});
test('scroll motion and portfolio remain usable',async({page})=>{
 await page.setViewportSize({width:1280,height:900});
 await page.goto('/');
 await page.waitForTimeout(1500);
 await expect(page.locator('.hero h1')).toBeVisible();
 await page.locator('#work').scrollIntoViewIfNeeded();
 await page.mouse.wheel(0,600);
 await page.waitForTimeout(1200);
 expect(await page.locator('.portfolio-track').evaluate(el=>getComputedStyle(el).transform)).not.toBe('none');
 const cardWidth=await page.locator('.project-card').first().evaluate(el=>el.getBoundingClientRect().width);
 const imageWidth=await page.locator('.project-image').first().evaluate(el=>el.getBoundingClientRect().width);
 expect(Math.abs(imageWidth-cardWidth)).toBeLessThan(2);
 expect(cardWidth).toBeGreaterThan(1280*.7);
 expect(cardWidth).toBeLessThan(1280*.8);
 const progress=async(selector:string,p:number,story=false)=>{
  await page.locator(selector).evaluate((el,args)=>{
   const r=el.getBoundingClientRect();const top=r.top+scrollY;
   window.scrollTo({top:args.story?top+(r.height-innerHeight)*args.p:top-innerHeight*.65+(r.height+innerHeight*.25)*args.p,behavior:'instant'});
  },{p,story});
  await page.waitForTimeout(900);
 };
 await progress('.process',.05);
 await expect(page.locator('.stage').nth(0)).toHaveClass(/is-active/);
 await progress('.process',.55);
 await expect(page.locator('.stage').nth(2)).toHaveClass(/is-active/);
 await expect(page.locator('.stage').nth(1)).toHaveClass(/is-complete/);
 await progress('.process',.95);
 await expect(page.locator('.stage').nth(3)).toHaveClass(/is-active/);
 await page.locator('.insight-row').first().evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-innerHeight*.35,behavior:'instant'}));
 await expect(page.locator('.insight-row').first()).toHaveClass(/is-active/);
 for(const [p,index] of [[.08,0],[.5,1],[.94,2]]){
  await progress('.story',p,true);
  await expect.poll(()=>page.locator('.story-statement').nth(index).evaluate(el=>Number(getComputedStyle(el).opacity))).toBeGreaterThan(.9);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('.pin-spacer')).toHaveCount(0);
 await expect(page.locator('.story')).not.toHaveCSS('height','2700px');
 for(const frame of await page.locator('.story-statement').all())await expect(frame).toHaveCSS('opacity','1');
});
