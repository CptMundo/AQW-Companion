// Generate guide captures from the real UI, in fresh isolated demo profiles.
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),ext=path.join(root,'extension'),out=path.join(ext,'guide-images');
const version=JSON.parse(fs.readFileSync(path.join(ext,'manifest.json'),'utf8')).version;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp'};
const server=http.createServer((req,res)=>{try{const u=new URL(req.url,'http://localhost'),p=path.resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));if(!p.startsWith(root+path.sep)||!fs.statSync(p).isFile()){res.writeHead(404).end();return}res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(res)}catch{res.writeHead(404).end()}});
const shot=async(page,name,locator=null,full=false)=>{
 const dest=path.join(out,'guide-'+name+'.png');await page.evaluate(()=>document.fonts.ready);
 if(locator){
  await locator.waitFor({state:'visible'});await locator.evaluate(el=>el.scrollIntoView({block:'start',inline:'nearest'}));
  if(full){await locator.screenshot({path:dest,animations:'disabled',timeout:20000});}
  else{
   const b=await locator.boundingBox(),v=page.viewportSize();if(!b||!v)throw Error('No screenshot bounds '+name);
   const x=Math.max(0,Math.floor(b.x)),y=Math.max(0,Math.floor(b.y)),width=Math.min(Math.floor(b.width),v.width-x),height=Math.min(Math.ceil(b.height),v.height-y,1000);
   if(width<200||height<150)throw Error('Screenshot bounds too small '+name);
   await page.screenshot({path:dest,clip:{x,y,width,height},animations:'disabled'});
  }
 }else{await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:dest,animations:'disabled'});}
 assert.ok(fs.statSync(dest).size>5000,'Screenshot '+name+' too small');console.log('Captured',name);
};
async function main(){
 fs.mkdirSync(out,{recursive:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const context=await browser.newContext({viewport:{width:1360,height:1100},deviceScaleFactor:1});
  // No logged-in sessions or analytics. External image requests omitted; fallback artwork stays visible.
  await context.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
  const page=await context.newPage();
  page.on('pageerror',e=>console.error('Guide page:',e.message));
  await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#overview')&&!document.querySelector('#overview').hasAttribute('data-inventory-booting'),null,{timeout:45000});
  await page.locator('#aqwc-getting-started').waitFor({state:'visible'});
  // The real app keeps its functions private in an IIFE. Drive its public JSON
  // input and navigation controls rather than reaching into private internals.
  const items=[{ID:'demo1',Name:'Void Aura',Type:'Misc',Count:180,Bank:0},{ID:'demo2',Name:'Diamond of Nulgath',Type:'Misc',Count:500,Bank:0},{ID:'demo3',Name:'Gem of Nulgath',Type:'Misc',Count:75,Bank:1},{ID:'demo4',Name:'Legion Revenant',Type:'Class',Count:1,Bank:0},{ID:'demo5',Name:'ArchPaladin',Type:'Class',Count:1,Bank:0},{ID:'demo6',Name:'Blood Gem of the Archfiend',Type:'Misc',Count:12,Bank:0}];
  const stamp='2026-01-01T12:00:00Z';
  const material=(item,target)=>({label:item+' ×'+target,kind:'material',item,target,status:'unknown'});
  const backup={format:'AQW Companion backup v0.9.3',snapshots:[{fileName:'Demo earlier.json',exportedAt:'2025-12-31T12:00:00Z',items:items.map(i=>({...i,Count:i.ID==='demo1'?100:i.Count}))},{fileName:'Demo_Inventory.json',exportedAt:stamp,items}],unlocks:[{name:'Sin of the Abyss',type:'Weapon',steps:[material('Blood Gem of the Archfiend',50),material('Diamond of Nulgath',500),material('Gem of Nulgath',150)]},{name:'Necrotic Sword of Doom',type:'Weapon',steps:[material('Void Aura',800)]},{name:'Legion Revenant',type:'Class',steps:[{label:'Own Legion Revenant',kind:'owned',item:'Legion Revenant',status:'unknown'}]}]};
  await page.locator('#file').setInputFiles({name:'Demo_Backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await page.locator('#dashboard').waitFor({state:'visible',timeout:45000});
  const tour=page.locator('#aqwc-tour');await tour.waitFor({state:'visible'});assert.ok(await page.locator('#aqwc-getting-started').isHidden());
  await shot(page,'tour',tour,true);
  await page.locator('#aqwc-tour-next').click();assert.ok(await page.locator('#unlocks.active').isVisible());
  await page.locator('#aqwc-tour-back').click();assert.ok(await page.locator('#overview.active').isVisible());
  await page.keyboard.press('Escape');assert.ok(await tour.isHidden());
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#dashboard').waitFor({state:'visible',timeout:45000});assert.ok(await tour.isHidden());
  await page.locator('.inventory-advanced > summary').click();
  const data=page.locator('#aqwc-data-management'),getExtension=page.locator('#aqwc-get-extension');assert.ok(await getExtension.isVisible());assert.ok(await page.locator('#backup').isHidden());await data.locator('summary').click();assert.ok(await page.locator('#backup').isVisible());assert.ok(await page.locator('#aqwc-account-import').isVisible());await data.locator('summary').click();assert.ok(await page.locator('#backup').isHidden());
  await page.locator('#aqwc-sync-status').evaluate(e=>e.dataset.state='ready');assert.ok(await getExtension.isHidden());await page.locator('#aqwc-sync-status').evaluate(e=>e.dataset.state='error');assert.ok(await getExtension.isVisible());await page.locator('#aqwc-sync-status').evaluate(e=>delete e.dataset.state);
  await page.locator('#aqwc-tour-replay').click();assert.ok(await tour.isVisible());
  await page.setViewportSize({width:390,height:844});const bounds=await tour.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=390&&bounds.y>=0&&bounds.y+bounds.height<=844);await page.locator('#aqwc-tour-skip').click();assert.ok(await tour.isHidden());await page.setViewportSize({width:1360,height:1100});
  await page.evaluate(stamp=>{const api=window.AQWCAccountProgress;if(!api)throw Error('Account progress module not loaded');api.save({section:'summary',capturedAt:stamp,created:'2021-01-01',months:12,purchased:20000,bonus:5000,total:25000});api.save({section:'sagas',capturedAt:stamp,rows:[{name:'Prologue',state:'colored'},{name:'Shadowfall',state:'colored'},{name:'Chiral Valley',state:'unknown'}]});api.save({section:'membership',capturedAt:stamp,rows:[{name:'1 Month',state:'colored',evidence:'threshold'},{name:'12 Months',state:'colored',evidence:'threshold'},{name:'2 Years',state:'gray',evidence:'threshold'}]})},stamp);
  const go=async(group,tab)=>{await page.locator('.primarynav [data-group="'+group+'"]').click();if(tab&&tab!=='overview'){const button=page.locator('.subnav [data-tab="'+tab+'"]');if(!await page.locator('#'+tab+'.active').count())await button.click();await page.locator('#'+tab+'.active').waitFor({state:'visible',timeout:15000})}};
  // An overflow-only assertion missed a 28px text track. Verify the actual
  // content box fills its card's usable width, at every tested viewport.
  const assertGuideWidth=async(selector,label)=>{
   const metrics=await page.locator(selector+' .guide-v2-step:visible').evaluateAll(steps=>steps.map(step=>{
    const body=step.querySelector('.ultra-role-step-body'),p=body?.querySelector('p'),s=getComputedStyle(step);
    const inner=step.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight);
    const width=body?.getBoundingClientRect().width||0, textWidth=p?.getBoundingClientRect().width||0;
    return {inner,width,textWidth,title:body?.querySelector('h4')?.textContent||'',height:p?.getBoundingClientRect().height||0,length:p?.textContent?.length||0};
   }));
   assert.ok(metrics.length,label+': no visible instruction cards');
   for(const m of metrics){
    assert.ok(m.inner>=100&&m.width>=m.inner*.95&&m.textWidth>=m.inner*.90,label+': compressed instruction '+JSON.stringify(m));
    assert.ok(m.height<=Math.max(84,Math.ceil(m.length/Math.max(10,Math.floor(m.textWidth/10)))*30+50),label+': abnormal text wrapping '+JSON.stringify(m));
   }
  };
  await go('ultras','ultras');
  await page.locator('#ultracards button').filter({hasText:'God of the Depths'}).click();
  assert.ok(await page.locator('#ultradetail .ultra-role-select').isVisible());
  const classPick=page.locator('#ultradetail [aria-label="Your class"]'),teamPick=page.locator('#ultradetail [aria-label="Team composition"]');
  await page.locator('#ultracards button').filter({hasText:'God of the Depths'}).click();
  assert.equal(await classPick.locator('option').count(),7);
  assert.ok((await classPick.locator('option').allTextContents()).some(x=>x.includes('Arcana Invoker')));
  await classPick.selectOption('Verus DoomKnight');
  assert.ok((await page.locator('#ultradetail .ultra-class-guide').innerText()).includes('Debuff the eyes'));
  await page.locator('#ultradetail .guide-v2-class-buttons button').filter({hasText:'StoneCrusher'}).click();
  assert.equal(await classPick.inputValue(),'StoneCrusher');
  await page.locator('#ultracards button').filter({hasText:'Ultra Avatar Tyndarius'}).click();
  await teamPick.selectOption('hub-cav');assert.ok((await classPick.locator('option').allTextContents()).some(x=>x.includes('Chaos Avenger')));
  await classPick.selectOption('Chaos Avenger');assert.ok((await page.locator('#ultradetail .ultra-class-guide').innerText()).includes('right orb'));
  await teamPick.selectOption('hub-ai');assert.ok(!(await classPick.locator('option').allTextContents()).some(x=>x.includes('Chaos Avenger')));
  await classPick.selectOption('Arcana Invoker');assert.ok((await page.locator('#ultradetail .ultra-class-guide').innerText()).includes('right orb'));
  await page.locator('#ultracards button').filter({hasText:'Ultra Speaker'}).click();
  await teamPick.selectOption('three-vhl');await classPick.selectOption('Void Highlord');
  assert.ok((await page.locator('#ultradetail .ultra-class-guide').innerText()).includes('Zone 1'));
  await classPick.selectOption('Lord of Order');assert.ok((await page.locator('#ultradetail .ultra-class-guide').innerText()).includes('Listen'));
  await page.locator('#ultracards button').filter({hasText:'Ultra Ezrajal'}).click();
  assert.ok(await page.locator('#ultradetail .guide-v2-class').isHidden());
  assert.ok((await page.locator('#ultradetail').innerText()).includes('Counter Attack'));
  await page.locator('#ultracards button').filter({hasText:'God of the Depths'}).click();
  // Audit every published strategy and its class options, not only the sample encounters.
  const allUltraCards=page.locator('#ultracards button');
  const totalUltra=await allUltraCards.count();assert.equal(totalUltra,12);let variantsChecked=0;
  for(let i=0;i<totalUltra;i++){
   await allUltraCards.nth(i).click();
   const pick=page.locator('#ultradetail [aria-label="Team composition"]');
   const options=await pick.count()?await pick.locator('option').evaluateAll(os=>os.map(o=>o.value)):['single'];
   for(const id of options){
    if(await pick.count())await pick.selectOption(id);
    variantsChecked++;
    assert.ok((await page.locator('#ultradetail').innerText()).includes('Fight instructions'));
    assert.equal(await page.locator('#ultradetail .ultra-focus-gear').count(),0);
    await assertGuideWidth('#ultradetail','Ultra desktop '+i+' '+id);
    if(await classPick.isVisible()){
     for(const cls of await classPick.locator('option').evaluateAll(os=>os.map(o=>o.value))){
      await classPick.selectOption(cls);
      assert.equal(await classPick.inputValue(),cls);
      assert.ok((await page.locator('#ultradetail .ultra-class-guide').innerText()).includes(cls));
      assert.ok(await page.locator('#ultradetail .guide-v2-disclosure').count());
      await assertGuideWidth('#ultradetail','Ultra desktop '+i+' '+id+' '+cls);
     }
    }
   }
  }
  assert.equal(variantsChecked,22);
  // The old Ultra search toolbar is intentionally hidden by the existing compact layout. Test its event handler without exposing a control the user previously hid.
  await page.locator('#ultrasearch').evaluate(e=>{e.value='Frailty';e.dispatchEvent(new Event('input',{bubbles:true}))});assert.equal(await page.locator('#ultracards button').count(),1);await page.locator('#ultrasearch').evaluate(e=>{e.value='';e.dispatchEvent(new Event('input',{bubbles:true}))});
  await page.locator('#ultracards button').filter({hasText:'God of the Depths'}).click();
  await page.setViewportSize({width:390,height:844});
  const overflow=await page.locator('#ultradetail').evaluate(e=>e.scrollWidth>e.clientWidth+3);assert.ok(!overflow,'Ultra guide must fit mobile width');
  for(let i=0;i<totalUltra;i++){
   await allUltraCards.nth(i).click();const pick=page.locator('#ultradetail [aria-label="Team composition"]');const opts=await pick.count()?await pick.locator('option').evaluateAll(os=>os.map(o=>o.value)):['single'];
   for(const id of opts){if(await pick.count())await pick.selectOption(id);await assertGuideWidth('#ultradetail','Ultra mobile '+i+' '+id)}
  }
  await page.setViewportSize({width:1360,height:1100});
  assert.equal(await page.locator('#ultradetail .ultra-focus-gear').count(),0);
  await go('ultras','boss-guides');
  assert.equal(await page.locator('#bossguidedetail .ultra-focus-gear').count(),0);
  await page.locator('#ultracatalog button').filter({hasText:'Celestial Arena'}).click();assert.ok((await page.locator('#bossguidedetail').innerText()).includes('Recommended classes'));assert.equal(await page.locator('#bossguidedetail .ultra-role-select').count(),0);
  await page.locator('#ultracatalog button').filter({hasText:'Temple Shrine — Middle'}).click();assert.equal(await page.locator('#bossguidedetail .ultra-role-select option').count(),4);
  await page.locator('#bossguidedetail .ultra-role-select').selectOption('Lord of Order');assert.ok((await page.locator('#bossguidedetail').innerText()).includes('Lunar Haze'));
  await page.locator('#ultracatalog button').filter({hasText:'Void Nightbane'}).click();assert.ok((await page.locator('#bossguidedetail').innerText()).includes('100,000 HP'));assert.equal(await page.locator('#bossguidedetail .ultra-role-select').count(),0);
  const allBossCards=page.locator('#ultracatalog button');assert.equal(await allBossCards.count(),40);let published=0;
  for(let i=0;i<await allBossCards.count();i++){
   await allBossCards.nth(i).click();
   const detail=page.locator('#bossguidedetail');
   assert.ok(await detail.locator('.ultra-copy-join').count());
   if((await detail.innerText()).includes('Fight at a glance')){
    published++;
    await assertGuideWidth('#bossguidedetail','Boss desktop '+i);
    assert.ok(await detail.locator('.guide-v2-disclosure').count());
    const role=detail.locator('.ultra-role-select');
    if(await role.count())for(const cls of await role.locator('option').evaluateAll(os=>os.map(o=>o.value))){await role.selectOption(cls);assert.ok((await detail.innerText()).includes(cls));await assertGuideWidth('#bossguidedetail','Boss desktop '+i+' '+cls)}
   }
   assert.equal(await detail.locator('.ultra-focus-gear').count(),0);
  }assert.equal(published,29);
  await page.setViewportSize({width:390,height:844});
  for(let i=0;i<await allBossCards.count();i++){
   await allBossCards.nth(i).click();
   if(await page.locator('#bossguidedetail .guide-v2-step:visible').count())await assertGuideWidth('#bossguidedetail','Boss mobile '+i);
  }
  // Exercise real theme selection event (the options menu may be closed).
  for(const theme of ['dark','light','companion']){
   await page.locator('#aqwc-site-theme').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}))},theme);
   await page.waitForFunction(v=>document.documentElement.dataset.aqwcBackground===v,theme);
   await allBossCards.filter({hasText:'Temple Shrine — Middle'}).click();await assertGuideWidth('#bossguidedetail','Boss '+theme+' mobile');
   await go('ultras','ultras');await allUltraCards.filter({hasText:'Ultra Avatar Tyndarius'}).click();await assertGuideWidth('#ultradetail','Tyndarius '+theme+' mobile');
   await page.setViewportSize({width:1360,height:1100});await assertGuideWidth('#ultradetail','Tyndarius '+theme+' desktop');
   await go('ultras','boss-guides');await allBossCards.filter({hasText:'Temple Shrine — Middle'}).click();await assertGuideWidth('#bossguidedetail','Boss '+theme+' desktop');
   await page.setViewportSize({width:390,height:844});
  }
  await page.setViewportSize({width:1360,height:1100});
  console.log('Guide geometry passed: all Ultra variants, all published other boss guides, mobile and desktop, theme samples.');
  await go('builds','forge');
  assert.ok(await page.locator('#builds').isHidden(),'Class Builds view must remain hidden');
  assert.ok(await page.locator('[data-tab="builds"]').isHidden(),'Class Builds navigation must remain hidden');
  await page.locator('[data-tab="builds"]').dispatchEvent('click');
  assert.ok(await page.locator('#forge.active').isVisible(),'Old builds navigation redirects to Forge');
  assert.ok(await page.locator('#forge-list').isVisible(),'Forge progress remains accessible');
  await go('planner','planner-discover');
  for(let i=0;i<5;i++){const pin=page.locator('#planner-suggestions .planner-pin-action.is-unpinned').first();await pin.click({timeout:15000})}
  await go('planner','planner');
  await page.locator('#planner-my-tasks .planner-complete-action').first().click({timeout:15000});
  await go('home','overview');await shot(page,'home',page.locator('#dashboard'));
  for(const [group,tab,name] of [['projects','unlocks','wishlist'],['planner','planner','quests'],['ultras','ultras','ultras'],['builds','forge','builds'],['story','story','story'],['badges','badge-hunter','badges'],['explore','discover','explore'],['inventory','inventory','inventory'],['inventory','account-stats','stats']]){
   await go(group,tab);await page.waitForTimeout(200);await shot(page,name,page.locator('#'+tab));
  }
  const popup=await context.newPage();await popup.setViewportSize({width:440,height:760});
  await popup.addInitScript(version=>{
   const store={};const listen={addListener(){},removeListener(){}};const reply=m=>m.type==='inventory-summary'?{ok:true,count:6,source:'full',syncedAt:Date.parse('2026-01-01T12:00:00Z')}:m.type==='wiki-appearance-read'?{ok:true,appearance:{background:'companion'}}:{ok:true};
   globalThis.chrome={runtime:{id:'guide-fixture',getManifest:()=>({version}),getURL:x=>x,onMessage:listen,sendMessage(m,cb){const r=reply(m);if(cb){queueMicrotask(()=>cb(r));return}return Promise.resolve(r)}},storage:{local:{get:async k=>({[k]:store[k]}),set:async v=>Object.assign(store,v),remove:async k=>delete store[k]},onChanged:listen},tabs:{query:async()=>[]},permissions:{contains:async()=>false},scripting:{}};
  },version);
  await popup.goto(origin+'/extension/popup.html',{waitUntil:'domcontentloaded'});await popup.locator('#one-click-inventory').waitFor({state:'visible'});await popup.waitForTimeout(300);await shot(popup,'popup-home');
  await popup.locator('[data-view=settings]').click();await popup.locator('#appearance-background').waitFor({state:'visible'});await shot(popup,'popup-settings');
  await context.close();
  // The production Wiki assistant is loaded against an explicit fictional Wiki fixture.
  const wc=await browser.newContext({viewport:{width:1300,height:1050}});const wiki=await wc.newPage();await wiki.route('**/*',r=>r.request().isNavigationRequest()?r.fulfill({contentType:'text/html',body:'<!doctype html><html><body></body></html>'}):r.abort());
  await wiki.goto('https://aqwwiki.wikidot.com/example-sword');await wiki.setContent('<div id="page-title">Example Sword</div><div id="breadcrumbs"><a href="/items">Items</a> <a href="/swords">Swords</a></div><div id="page-content"><p><strong>Location:</strong> <a href="/museum">Museum</a><br><strong>Price:</strong> 300 AC<br><strong>Sellback:</strong> 75 AC<br><strong>Rarity:</strong> Awesome Rarity<br><strong>Description:</strong> Fictional demonstration item.</p><ul><li>Also see:<ul><li><a href="/related-sword">Related Sword</a></li></ul></li></ul></div>');
  await wiki.evaluate(version=>{const attach=Element.prototype.attachShadow;Element.prototype.attachShadow=function(o){return attach.call(this,{...o,mode:'open'})};const data={ok:true,comparison:{synced:true,boost:{all:15},best:{all:{name:'Example Sword',slug:'example-sword',value:15}}},goals:{rows:[]},hub:{recipeCount:1,recipes:[{name:'Example Upgrade',source:'https://aqwwiki.wikidot.com/example-shop',owned:'not-found',ready:1,total:2,required:1,materials:[{name:'Void Aura',missing:20}]}],related:[{name:'Related Sword',slug:'related-sword',kind:'related',state:'not-found'}],loadouts:{all:{percent:15,gear:[{name:'Example Sword',slug:'example-sword',category:'weapons'}]}},spending:[],goalsSynced:true}};globalThis.chrome={runtime:{getManifest:()=>({version}),sendMessage(m,cb){const r=m.type==='wiki-item-assistant'?data:m.type==='wiki-item-lookup'?{ok:true,state:'owned',inventory:1,bank:0,total:1,syncedAt:Date.parse('2026-01-01T12:00:00Z')}:m.type==='hub-note-read'?{ok:true,note:{text:'',priority:'normal'}}:m.type==='goal-status-read'?{ok:true,state:'absent',at:1}:{ok:false};if(cb){cb(r);return}return Promise.resolve(r)}}}},version);
  for(const name of ['companion-theme.js','bridge.js','wishlist-link.js','wiki-materials.js','wiki-items.js'])await wiki.addScriptTag({path:path.join(ext,name)});
  const hub=wiki.locator('#aqwc-item-status');await hub.getByText('Used in recipes (1)').waitFor({timeout:15000});await shot(wiki,'wiki',hub,true);await wc.close();
  console.log('Generated all guide screenshots');
 }finally{await browser.close();server.close()}
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1});
