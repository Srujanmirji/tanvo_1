import { test, expect } from '@playwright/test';
for (const width of [1280, 390, 430]) test(`page and interactions at ${width}px`, async ({ page }) => {
  const errors: string[]=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toHaveText('IdeasIntoImpact.');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
  if(width<768){
    await page.getByRole('button',{name:'Open menu'}).click();
    await expect(page.locator('#mobile-menu a').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button',{name:'Open menu'})).toBeFocused();
  }
  if(width<768){
    const positions=await page.locator('.project-card').evaluateAll(cards=>cards.map(card=>({top:card.getBoundingClientRect().top,bottom:card.getBoundingClientRect().bottom,left:card.getBoundingClientRect().left})));
    for(let i=1;i<positions.length;i++){
      expect(positions[i].top).toBeGreaterThan(positions[i-1].bottom);
      expect(positions[i].left).toBeCloseTo(positions[0].left,0);
    }
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
 await page.mouse.move(30,120);
 await expect(page.locator('.custom-cursor')).toHaveClass(/visible/);
 await expect(page.locator('.custom-cursor')).not.toHaveClass(/is-project/);
 await page.getByRole('link',{name:'Let’s talk'}).hover();
 await expect(page.locator('.custom-cursor')).toHaveClass(/is-interactive/);
 await page.locator('#work').scrollIntoViewIfNeeded();
 await page.mouse.wheel(0,600);
 await page.waitForTimeout(1200);
 expect(await page.locator('.portfolio-track').evaluate(el=>getComputedStyle(el).transform)).not.toBe('none');
 await page.locator('.project-image').nth(1).hover({position:{x:250,y:150}});
 await expect(page.locator('.custom-cursor')).toHaveClass(/is-project/);
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
 await expect(page.locator('[data-count]')).toHaveText(['8','10','100']);
 await expect(page.locator('.story')).not.toHaveCSS('height','2700px');
 for(const frame of await page.locator('.story-statement').all())await expect(frame).toHaveCSS('opacity','1');
});

test('inquiry form posts the Apps Script contract', async ({ page }) => {
  const posted: any[]=[];
  await page.route('**/exec', async route=>{
    posted.push(JSON.parse(route.request().postData()||'{}'));
    await route.fulfill({status:200,contentType:'application/json',body:'{"status":"ok"}'});
  });
  await page.goto('/');

  await page.locator('.hero-actions .button').click();
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByRole('heading',{level:2})).toContainText('Tell us what');

  // required fields block an empty submit
  await dialog.getByRole('button',{name:'Send inquiry'}).click();
  await expect(dialog.locator('form')).toBeVisible();
  expect(posted).toHaveLength(0);

  await dialog.getByLabel('Your name').fill('Ada Lovelace');
  await dialog.getByLabel('Email').fill('ada@example.com');
  await dialog.getByLabel('Phone').fill('+91 99999 11111');
  await dialog.getByRole('checkbox',{name:'Web Development'}).check();
  await dialog.getByRole('checkbox',{name:'Digital Marketing'}).check();
  await dialog.getByLabel('About the project').fill('A marketing site and a booking flow.');
  await dialog.getByRole('button',{name:'Send inquiry'}).click();

  await expect(dialog.getByRole('heading',{level:2})).toContainText('Thanks');
  expect(posted).toHaveLength(1);
  expect(posted[0]).toMatchObject({
    name:'Ada Lovelace', email:'ada@example.com', phone:'+91 99999 11111',
    capabilities:'Web Development, Digital Marketing',
    message:'A marketing site and a booking flow.',
    tv_hp:'',
  });
  expect(posted[0].secret).toBeTruthy(); // shared secret comes from VITE_ENQUIRY_SECRET
  expect(posted[0].pageUrl).toContain('localhost:5173');
});

test('inquiry form surfaces the server error instead of faking success', async ({ page }) => {
  await page.route('**/exec', route=>route.fulfill({status:200,contentType:'application/json',body:'{"status":"error","message":"That email address does not look valid."}'}));
  await page.goto('/');
  await page.locator('.contact-buttons .button').click();
  const dialog=page.getByRole('dialog');
  await dialog.getByLabel('Your name').fill('Ada');
  await dialog.getByLabel('Email').fill('ada@example.com');
  await dialog.getByLabel('About the project').fill('Testing the failure path.');
  await dialog.getByRole('button',{name:'Send inquiry'}).click();
  await expect(dialog.locator('.enquiry-error')).toContainText('That email address does not look valid.');
  await expect(dialog.getByRole('heading',{level:2})).not.toContainText('Thanks');
});

test('inquiry form reports an unreachable endpoint', async ({ page }) => {
  await page.route('**/exec', route=>route.abort());
  await page.goto('/');
  await page.locator('.hero-actions .button').click();
  const dialog=page.getByRole('dialog');
  await dialog.getByLabel('Your name').fill('Ada');
  await dialog.getByLabel('Email').fill('ada@example.com');
  await dialog.getByLabel('About the project').fill('Testing the network path.');
  await dialog.getByRole('button',{name:'Send inquiry'}).click();
  await expect(dialog.locator('.enquiry-error')).toContainText('could not reach the server');
});

test('inquiry fields are keyboard focusable with a visible ring', async ({ page }) => {
  await page.goto('/');
  await page.locator('.hero-actions .button').click();
  const name=page.getByRole('dialog').getByLabel('Your name');
  await page.keyboard.press('Tab'); // dialog opens focused on its close button
  await expect(name).toBeFocused();
  await page.waitForTimeout(300); // border-color transition
  const ring=await name.evaluate(el=>{const cs=getComputedStyle(el);return {outline:cs.outlineColor+' '+cs.outlineWidth,border:cs.borderTopColor}});
  expect(ring.outline).toBe('rgb(255, 90, 0) 2px');
  expect(ring.border).toBe('rgb(255, 90, 0)');
});
