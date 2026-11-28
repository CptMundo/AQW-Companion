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
  const metrics={environment:'isolated Chromium, local HTTP, external requests blocked; routing disables HTTP cache',viewport:'1360x1100',fixture:'synthetic demo'};
  const readyMs=()=>page.evaluate(()=>Math.round(performance.now()));
  await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#overview')&&!document.querySelector('#overview').hasAttribute('data-inventory-booting'),null,{timeout:45000});
  await page.locator('#aqwc-getting-started').waitFor({state:'visible'});
  metrics.coldHomeReadyMs=await readyMs();
  // The real app keeps its functions private in an IIFE. Drive its public JSON
  // input and navigation controls rather than reaching into private internals.
  const items=[{ID:'demo1',Name:'Void Aura',Type:'Misc',Count:180,Bank:0},{ID:'demo2',Name:'Diamond of Nulgath',Type:'Misc',Count:1000,Bank:0},{ID:'demo3',Name:'Gem of Nulgath',Type:'Misc',Count:75,Bank:1},{ID:'demo4',Name:'Legion Revenant',Type:'Class',Count:1,Bank:0},{ID:'demo5',Name:'ArchPaladin',Type:'Class',Count:1,Bank:0},{ID:'demo6',Name:'Blood Gem of the Archfiend',Type:'Misc',Count:12,Bank:0}];
  items.push(...Array.from({length:5},(_,i)=>({ID:'new-demo-'+i,Name:'Discovery '+(i+1),Type:'Misc',Count:1,Bank:0})));
  const stamp='2026-01-01T12:00:00Z';
  const material=(item,target)=>({label:item+' ×'+target,kind:'material',item,target,status:'unknown'});
  const backup={format:'AQW Companion backup v0.9.3',snapshots:[{fileName:'Demo earlier.json',exportedAt:'2025-12-31T12:00:00Z',items:items.filter(i=>!i.ID.startsWith('new-demo-')&&i.ID!=='demo4').map(i=>({...i,Count:i.Type==='Misc'?Math.max(1,i.Count-5):i.Count}))},{fileName:'Demo_Inventory.json',exportedAt:stamp,items}],unlocks:[{name:'Sin of the Abyss',type:'Weapon',steps:[material('Blood Gem of the Archfiend',50),material('Diamond of Nulgath',500),material('Gem of Nulgath',150)]},{name:'Necrotic Sword of Doom',type:'Weapon',steps:[material('Void Aura',800)]},{name:'Legion Revenant',type:'Class',steps:[{label:'Own Legion Revenant',kind:'owned',item:'Legion Revenant',status:'unknown'}]}]};
  const importStarted=Date.now();
  await page.locator('#file').setInputFiles({name:'Demo_Backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await page.locator('#dashboard').waitFor({state:'visible',timeout:45000});
  metrics.demoBackupDashboardVisibleMs=Date.now()-importStarted;
  const tour=page.locator('#aqwc-tour');await tour.waitFor({state:'visible'});assert.ok(await page.locator('#aqwc-getting-started').isHidden());
  await shot(page,'tour',tour,true);
  await page.locator('#aqwc-tour-next').click();assert.ok(await page.locator('#unlocks.active').isVisible());
  await page.locator('#aqwc-tour-back').click();assert.ok(await page.locator('#overview.active').isVisible());
  await page.keyboard.press('Escape');assert.ok(await tour.isHidden());
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#dashboard').waitFor({state:'visible',timeout:45000});metrics.savedHomeVisibleMs=await readyMs();assert.ok(await tour.isHidden());
  // Restore the same two dated snapshots again: no duplicate history.
  await page.locator('#file').setInputFiles({name:'Demo_Backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await page.waitForFunction(()=>document.querySelector('#alert')?.textContent.includes('Imported 1 file(s)'));
  assert.equal(await page.locator('#historylist .historyitem').count(),2);
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#dashboard').waitFor({state:'visible',timeout:45000});
  assert.equal(await page.locator('#historylist .historyitem').count(),2);
  await page.locator('#aqwc-privacy-notice-close').click();assert.ok(await page.locator('#aqwc-privacy-notice').isHidden());await page.reload({waitUntil:'domcontentloaded'});await page.locator('#dashboard').waitFor({state:'visible',timeout:45000});assert.ok(await page.locator('#aqwc-privacy-notice').isHidden());
  await page.locator('.inventory-advanced > summary').click();assert.ok(await page.locator('.aqwc-options-main a[href="privacy.html"]').isVisible());
  const data=page.locator('#aqwc-data-management'),getExtension=page.locator('#aqwc-get-extension');assert.ok(await getExtension.isVisible());assert.ok(await page.locator('#backup').isHidden());await data.locator('summary').click();assert.ok(await page.locator('#backup').isVisible());assert.ok(await page.locator('#aqwc-account-import').isVisible());await data.locator('summary').click();assert.ok(await page.locator('#backup').isHidden());
  await page.locator('#aqwc-sync-status').evaluate(e=>e.dataset.state='ready');assert.ok(await getExtension.isHidden());await page.locator('#aqwc-sync-status').evaluate(e=>e.dataset.state='error');assert.ok(await getExtension.isVisible());await page.locator('#aqwc-sync-status').evaluate(e=>delete e.dataset.state);
  await page.locator('#aqwc-tour-replay').click();assert.ok(await tour.isVisible());
  await page.setViewportSize({width:390,height:844});const bounds=await tour.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=390&&bounds.y>=0&&bounds.y+bounds.height<=844);await page.locator('#aqwc-tour-skip').click();assert.ok(await tour.isHidden());await page.setViewportSize({width:1360,height:1100});
  await page.evaluate(stamp=>{const api=window.AQWCAccountProgress;if(!api)throw Error('Account progress module not loaded');api.save({section:'summary',capturedAt:stamp,created:'2021-01-01',months:12,purchased:20000,bonus:5000,total:25000});api.save({section:'sagas',capturedAt:stamp,rows:[{name:'Prologue',state:'colored'},{name:'Shadowfall',state:'colored'},{name:'Chiral Valley',state:'unknown'}]});api.save({section:'membership',capturedAt:stamp,rows:[{name:'1 Month',state:'colored',evidence:'threshold'},{name:'12 Months',state:'colored',evidence:'threshold'},{name:'2 Years',state:'gray',evidence:'threshold'}]})},stamp);
  const go=async(group,tab)=>{await page.locator('.primarynav [data-group="'+group+'"]').click();if(tab&&tab!=='overview'){const button=page.locator('.subnav [data-tab="'+tab+'"]');if(!await page.locator('#'+tab+'.active').count())await button.click();await page.locator('#'+tab+'.active').waitFor({state:'visible',timeout:15000})}};
  // An overflow-only assertion missed a 28px text track. Verify the actual
  // content box fills its card's usable width, at every tested viewport.
  const assertColumns=async(selector,sideBySide,label)=>{
   const m=await page.locator(selector).evaluate(grid=>{
    const a=grid.querySelector('.guide-v2-personal'),b=grid.querySelector('.guide-v2-shared');
    if(!a||!b)return null;
    const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();
    return {ax:x.left,ay:x.top,ar:x.right,ab:x.bottom,bx:y.left,by:y.top};
   });
   assert.ok(m,label+': missing columns');
   if(sideBySide)assert.ok(Math.abs(m.ay-m.by)<=3&&m.bx>=m.ar-1,label+': columns not side by side '+JSON.stringify(m));
   else assert.ok(Math.abs(m.ax-m.bx)<=3&&m.by>=m.ab-1,label+': mobile columns not stacked '+JSON.stringify(m));
  };
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
  const detail=page.locator('#ultradetail'),classPick=detail.locator('[aria-label="Your class"]'),strategyPick=detail.locator('[aria-label="Team strategy"]'),party=detail.locator('.guide-v2-party');
  const sourceHtml=fs.readFileSync(path.join(root,'index.html'),'utf8'),sourceStart=sourceHtml.indexOf('const approvedUltraGuides='),sourceEnd=sourceHtml.indexOf('const approvedOtherBossGuides=',sourceStart),extraStart=sourceHtml.indexOf('const ultraExtraLineups='),extraEnd=sourceHtml.indexOf('function sourceOtherGuide(',extraStart);
  const lineupApi=require('node:vm').runInNewContext(sourceHtml.slice(sourceStart,sourceEnd)+sourceHtml.slice(extraStart,extraEnd)+'\n({ultraTeamFamilies,ultraStrategyVariants})');
  const sourceLineups=async()=>{const id=await party.getAttribute('data-boss');return lineupApi.ultraTeamFamilies(id,lineupApi.ultraStrategyVariants({id})).flatMap(f=>f.variants.map(v=>({id:v.id,family:f.id,names:v.names,slots:v.slots})))};
  const chooseTeam=async(id,cls)=>{
   const target=(await sourceLineups()).find(v=>v.id===id);assert.ok(target&&target.names.includes(cls),id+' '+cls);
   await classPick.selectOption(cls);if(await strategyPick.inputValue()!==target.family)await strategyPick.selectOption(target.family);
   for(let j=0;j<8&&await party.getAttribute('data-variant-id')!==id;j++){
    const current=await party.locator('.ultra-team-chip').evaluateAll(cs=>cs.map(c=>c.dataset.cls));
    let changed=false;
    for(let i=0;i<current.length;i++){
     if(current[i]===target.slots[i])continue;const pick=party.locator('.guide-v2-slot-select[data-slot="'+i+'"]');if(!await pick.count())continue;
     const match=await pick.locator('option').evaluateAll((os,want)=>os.find(o=>o.textContent===want)?.value||null,target.slots[i]);
     if(match){await pick.selectOption(match);changed=true;break}
    }
    assert.ok(changed,'Unable to reach documented lineup '+id+' as '+cls);
   }
   assert.equal(await party.getAttribute('data-variant-id'),id);
  };
  await classPick.selectOption('Verus DoomKnight');assert.ok((await detail.locator('.ultra-class-guide').innerText()).includes('Debuff the eyes'));
  await classPick.selectOption('StoneCrusher');assert.equal(await party.locator('.guide-v2-play-class').count(),7);const targetCard=party.locator('.ultra-team-chip[data-cls="Verus DoomKnight"]');await targetCard.scrollIntoViewIfNeeded();const roleBox=await targetCard.locator('.guide-v2-party-role').boundingBox();assert.ok(roleBox);await page.mouse.click(roleBox.x+Math.min(10,roleBox.width/2),roleBox.y+roleBox.height/2);assert.equal(await classPick.inputValue(),'Verus DoomKnight');assert.ok(await party.locator('.ultra-team-chip.is-you').getAttribute('data-cls')==='Verus DoomKnight');
  await page.locator('#ultracards button').filter({hasText:'Ultra Avatar Tyndarius'}).click();
  await chooseTeam('hub-cav','ArchPaladin');assert.equal(await strategyPick.locator('option').count(),1);assert.ok(await strategyPick.isHidden());assert.ok(await detail.locator('.guide-v2-strategy-static').isVisible());assert.ok(await party.locator('.guide-v2-slot-select').count());
  await chooseTeam('nand-ssot','ArchPaladin');assert.ok((await party.innerText()).includes('ShadowStalker of Time'));
  const colleagueSlot=party.locator('.ultra-team-chip:not(.is-you) .guide-v2-slot-select');assert.ok(await colleagueSlot.isVisible());const previousClass=await classPick.inputValue();await colleagueSlot.click();assert.equal(await classPick.inputValue(),previousClass);await page.keyboard.press('Escape');await colleagueSlot.selectOption('hub-cav');assert.equal(await classPick.inputValue(),previousClass);assert.equal(await party.getAttribute('data-variant-id'),'hub-cav');
  const keyboardSlot=party.locator('.guide-v2-play-class').filter({hasText:'Lord of Order'});await keyboardSlot.focus();await page.keyboard.press('Enter');assert.equal(await classPick.inputValue(),'Lord of Order');
  assert.deepEqual(await detail.locator('.guide-v2-builder h3').allTextContents(),['Your class','Strategy','Team composition']);assert.ok(!(await detail.locator('.guide-v2-builder').innerText()).includes('documented lineup'));assert.equal(await detail.locator('.guide-v2-team-legend').count(),0);
  await chooseTeam('hub-ai','Arcana Invoker');assert.ok((await detail.locator('.ultra-class-guide').innerText()).includes('right orb'));
  const mine=party.locator('.ultra-team-chip.is-you .guide-v2-slot-select');assert.ok(await mine.isVisible());await mine.selectOption('hub-cav');assert.equal(await classPick.inputValue(),'Arcana Invoker');assert.equal(await party.getAttribute('data-variant-id'),'hub-cav');assert.equal(await party.locator('.ultra-team-chip.is-you').count(),0);assert.ok(await detail.locator('.guide-v2-builder-strategy .guide-v2-strategy-warning').isVisible());assert.ok((await detail.locator('.guide-v2-focus-role').innerText()).includes('Incompatible with your class'));assert.equal(await detail.locator('.ultra-class-guide h4').filter({hasText:'Your responsibility'}).count(),0);await party.locator('.guide-v2-play-class').filter({hasText:'Chaos Avenger'}).click();assert.equal(await classPick.inputValue(),'Chaos Avenger');assert.ok(await detail.locator('.guide-v2-builder-strategy .guide-v2-strategy-warning').isHidden());assert.equal(await detail.locator('.guide-v2-overview .ultra-focus-item').count(),4);assert.equal(await detail.locator('.guide-v2-overview a[href*="location"]').count(),0);
  const fields=await detail.locator('.guide-v2-builder-controls').evaluate(e=>{const a=e.querySelector('.ultra-role-select').getBoundingClientRect(),b=e.querySelector('.guide-v2-strategy-static').getBoundingClientRect();return {dy:Math.abs(a.y-b.y),dh:Math.abs(a.height-b.height)}});assert.ok(fields.dy<2&&fields.dh<2,'Aligned class and strategy fields');
  const groups=await classPick.locator('optgroup').evaluateAll(g=>g.map(x=>x.label));assert.ok(groups.length>0&&groups.every(x=>['Owned','Not owned','Ownership not checked'].includes(x)));assert.ok((await classPick.locator('option').allTextContents()).every(x=>!x.startsWith('✓')));
  for(const [label,cls,color] of [['Owned','guide-v2-owned-group','rgb(140, 230, 172)'],['Not owned','guide-v2-not-owned-group','rgb(255, 146, 156)']]){const group=classPick.locator('optgroup[label="'+label+'"]');if(await group.count()){assert.ok((await group.getAttribute('class')).includes(cls));assert.equal(await group.evaluate(e=>getComputedStyle(e).color),color)}}
  await page.locator('#ultracards button').filter({hasText:'Champion Drakath'}).click();await classPick.selectOption('Lord of Order');assert.ok(await strategyPick.locator('option').count()>=3);
  await classPick.selectOption('ArchPaladin');assert.equal(await strategyPick.locator('option').count(),3);const incompatible=strategyPick.locator('option.guide-v2-incompatible-option');assert.equal(await incompatible.count(),1);assert.ok((await incompatible.innerText()).includes('Incompatible with your class'));assert.ok(await incompatible.isEnabled());assert.equal(await incompatible.evaluate(e=>getComputedStyle(e).color),'rgb(255, 146, 156)');const incompatibleId=await incompatible.getAttribute('value');await strategyPick.selectOption(incompatibleId);assert.equal(await classPick.inputValue(),'ArchPaladin');assert.equal(await party.getAttribute('data-family-id'),incompatibleId);assert.equal(await party.locator('.ultra-team-chip.is-you').count(),0);assert.ok(await detail.locator('.guide-v2-builder-strategy .guide-v2-strategy-warning').isVisible());assert.ok((await detail.locator('.ultra-class-guide').innerText()).includes('Shared fight instructions'));await classPick.selectOption('Lord of Order');assert.equal(await strategyPick.locator('option.guide-v2-incompatible-option').count(),0);assert.ok(await detail.locator('.guide-v2-builder-strategy .guide-v2-strategy-warning').isHidden());
  const ordered=await detail.evaluate(e=>{const top=e.querySelector('.guide-v2-builder').getBoundingClientRect(),overview=e.querySelector('.guide-v2-overview').getBoundingClientRect(),fight=e.querySelector('.ultra-class-guide').getBoundingClientRect();return top.bottom<=overview.top+1&&overview.bottom<=fight.top+1});assert.ok(ordered);
  await page.locator('#ultracards button').filter({hasText:'Ultra Speaker'}).click();await chooseTeam('three-vhl','Void Highlord');assert.ok((await detail.locator('.ultra-class-guide').innerText()).includes('Zone 1'));await classPick.selectOption('Lord of Order');assert.ok((await detail.locator('.ultra-class-guide').innerText()).includes('Listen'));
  assert.equal(await detail.locator('.guide-v2-timing-table').count(),2);assert.equal(await detail.locator('.guide-v2-timing-table').nth(1).locator('tbody tr').count(),20);
  await page.locator('#ultracards button').filter({hasText:'Ultra Ezrajal'}).click();assert.ok((await detail.innerText()).includes('Counter Attack'));
  const allUltraCards=page.locator('#ultracards button');const totalUltra=await allUltraCards.count();assert.equal(totalUltra,12);let variantsChecked=0;
  for(let i=0;i<totalUltra;i++){
   await allUltraCards.nth(i).click();
   for(const v of await sourceLineups()){
    await chooseTeam(v.id,v.names[0]);variantsChecked++;
    assert.ok((await detail.innerText()).includes('Fight instructions'));assert.equal(await detail.locator('.ultra-focus-gear').count(),0);
    await assertGuideWidth('#ultradetail','Ultra desktop '+i+' '+v.id);
    for(const cls of new Set(v.names)){
     await chooseTeam(v.id,cls);
     assert.equal(await party.locator('.ultra-team-chip.is-you').count(),1);
     assert.equal(await party.locator('.ultra-team-chip.is-you').getAttribute('data-cls'),cls);
     assert.equal(await party.locator('.guide-v2-play-class[aria-pressed="true"]').count(),1);assert.ok((await detail.locator('.guide-v2-focus-role').innerText()).includes(cls));
     assert.ok((await detail.locator('.ultra-class-guide').innerText()).includes(cls));assert.ok(await detail.locator('.guide-v2-disclosure').count());
    }
   }
  }
  assert.equal(variantsChecked,35);
  await page.locator('#ultrasearch').evaluate(e=>{e.value='Frailty';e.dispatchEvent(new Event('input',{bubbles:true}))});assert.equal(await allUltraCards.count(),1);await page.locator('#ultrasearch').evaluate(e=>{e.value='';e.dispatchEvent(new Event('input',{bubbles:true}))});
  await page.setViewportSize({width:390,height:844});
  for(let i=0;i<totalUltra;i++){await allUltraCards.nth(i).click();for(const v of await sourceLineups()){await chooseTeam(v.id,v.names[0]);await assertGuideWidth('#ultradetail','Ultra mobile '+i+' '+v.id)}}
  await allUltraCards.filter({hasText:'Champion Drakath'}).click();const mobileTop=await detail.locator('.guide-v2-builder-controls').evaluate(e=>Array.from(e.children,x=>{const r=x.getBoundingClientRect();return {x:r.x,y:r.y,bottom:r.bottom}}));assert.ok(Math.abs(mobileTop[0].x-mobileTop[1].x)<=3&&mobileTop[1].y>=mobileTop[0].bottom-1,'Builder controls stack on mobile');
  await page.setViewportSize({width:1360,height:1100});
  assert.equal(await page.locator('#ultradetail .ultra-focus-gear').count(),0);
  await go('ultras','boss-guides');
  assert.equal(await page.locator('#bossguidedetail .ultra-focus-gear').count(),0);
  await page.locator('#ultracatalog button').filter({hasText:'Celestial Arena'}).click();assert.ok((await page.locator('#bossguidedetail').innerText()).includes('Recommended classes'));assert.equal(await page.locator('#bossguidedetail .ultra-role-select').count(),0);
  await page.locator('#ultracatalog button').filter({hasText:'Temple Shrine — Middle'}).click();assert.equal(await page.locator('#bossguidedetail .ultra-role-select option').count(),4);
  await page.locator('#bossguidedetail .ultra-role-select').selectOption('Lord of Order');assert.ok((await page.locator('#bossguidedetail').innerText()).includes('Lunar Haze'));await assertColumns('#bossguidedetail .guide-v2-fight-columns',true,'Temple Shrine desktop');
  await page.locator('#ultracatalog button').filter({hasText:'Void Xyfrag'}).click();const xy=page.locator('#bossguidedetail .guide-v2-boss-cue');assert.equal(await xy.count(),1);assert.ok((await xy.innerText()).includes('BLEEEEEEEEEEEECCH'));assert.ok((await xy.innerText()).includes('Taunt Consume'));assert.ok((await xy.innerText()).includes('2-second charge'));
  await page.locator('#ultracatalog button').filter({hasText:'Void NerfKitten'}).click();assert.ok((await page.locator('#bossguidedetail .cue-taunt').innerText()).includes('Meow'));
  await page.locator('#ultracatalog button').filter({hasText:'Astral Empyrean'}).click();assert.ok((await page.locator('#bossguidedetail .cue-heal').innerText()).includes('DO NOT TAUNT'));assert.ok((await page.locator('#bossguidedetail .cue-taunt').innerText()).includes('AFTER the hit'));assert.ok((await page.locator('#bossguidedetail .cue-move').innerText()).includes('The stars are ours to command.'));
  await page.locator('#ultracatalog button').filter({hasText:'Empress Angler'}).click();assert.ok((await page.locator('#bossguidedetail .cue-heal').innerText()).includes('FULL HP'));
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
  await allBossCards.filter({hasText:'Temple Shrine — Middle'}).click();await assertColumns('#bossguidedetail .guide-v2-fight-columns',false,'Temple Shrine mobile');
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
  assert.ok(await page.locator('[data-tab="builds"]').isVisible(),'Class Builds navigation restored');
  assert.ok(await page.locator('#forge-list').isVisible(),'Forge progress remains accessible');
  await go('builds','builds');
  assert.ok(await page.locator('#builds.active').isVisible());
  assert.ok(await page.locator('#build-class option').count()>0,'Class options initialized');
  await page.locator('#build-search').fill('Chrono ShadowHunter');
  assert.equal(await page.locator('#build-class').inputValue(),'Chrono ShadowHunter');
  assert.ok((await page.locator('#build-results').innerText()).trim().length>0);
  await page.locator('#build-search').fill('');
  await go('builds','forge');
  assert.ok(await page.locator('#forge-list').isVisible());
  await go('planner','planner-discover');
  for(let i=0;i<5;i++){const pin=page.locator('#planner-suggestions .planner-pin-action.is-unpinned').first();await pin.click({timeout:15000})}
  await go('planner','planner');
  const mySearch=page.locator('#planner-my-search'),myCards=page.locator('#planner-my-tasks .planner-quest-card');const beforeSearch=await myCards.count();assert.ok(beforeSearch>0);
  const firstQuest=await myCards.first().locator('.task-title').innerText();await mySearch.fill(firstQuest);assert.ok(await myCards.count()>0);assert.ok((await myCards.allTextContents()).every(x=>x.toLowerCase().includes(firstQuest.toLowerCase())));
  await mySearch.fill('zzzznonexistentquest');assert.equal(await myCards.count(),0);await page.locator('#planner-my-search-clear').click();assert.equal(await myCards.count(),beforeSearch);
  // Closed cards must not grow with long names, rewards, missing rewards or long joins.
  const assertUniformQuestCards=async selector=>{const measurements=await page.locator(selector).evaluateAll(cards=>cards.filter(c=>!c.querySelector('details[open]')).map(c=>{const r=c.getBoundingClientRect();return {w:r.width,h:r.height}}));assert.ok(measurements.length>0);for(const a of measurements)for(const b of measurements)if(Math.abs(a.w-b.w)<2)assert.ok(Math.abs(a.h-b.h)<2,'Unequal closed quest cards: '+JSON.stringify([a,b]))};
  await assertUniformQuestCards('#planner-my-tasks .planner-quest-card');
  await myCards.first().evaluate(card=>{const clone=card.cloneNode(true);clone.id='planner-card-overflow-fixture';clone.querySelector('.task-title').textContent='Very long quest title '.repeat(15);clone.querySelector('.planner-quest-meta').textContent='Long category '.repeat(15);clone.querySelector('.planner-reward-preview').textContent='Very long reward description '.repeat(20);const reward=clone.querySelector('.planner-quest-rewards');if(reward)reward.append(document.createTextNode('Full reward remains visible '.repeat(20)));card.after(clone);const empty=card.cloneNode(true);empty.id='planner-card-empty-fixture';empty.querySelector('.planner-reward-preview').textContent='';clone.after(empty)});
  await assertUniformQuestCards('#planner-my-tasks .planner-quest-card');
  const overflowCard=page.locator('#planner-card-overflow-fixture');const truncated=await overflowCard.locator('.planner-reward-preview').evaluate(e=>({clamp:getComputedStyle(e).webkitLineClamp,overflow:e.scrollHeight>e.clientHeight}));assert.equal(truncated.clamp,'2');assert.ok(truncated.overflow);
  const collapsedHeight=(await overflowCard.boundingBox()).height;await overflowCard.locator('summary').click();assert.ok((await overflowCard.boundingBox()).height>collapsedHeight);await overflowCard.locator('summary').click();await assertUniformQuestCards('#planner-my-tasks .planner-quest-card');
  await page.setViewportSize({width:390,height:844});await assertUniformQuestCards('#planner-my-tasks .planner-quest-card');await page.setViewportSize({width:1360,height:1100});
  await page.locator('#planner-card-overflow-fixture,#planner-card-empty-fixture').evaluateAll(es=>es.forEach(e=>e.remove()));
  await go('planner','planner-discover');await assertUniformQuestCards('#planner-suggestions .planner-quest-card');await go('planner','planner');
  await page.locator('#planner-my-tasks .planner-complete-action').first().click({timeout:15000});
  await go('home','overview');
  const homeQuests=page.locator('#homeactivities .home-quest-tile');
  assert.ok(await homeQuests.count()>0);const completedTile=homeQuests.filter({has:page.locator('.home-quest-action[aria-pressed="true"]')}).first();assert.ok(await completedTile.isVisible());
  const questId=await completedTile.getAttribute('data-quest-id'),countBefore=await homeQuests.count();
  const questTile=page.locator('#homeactivities .home-quest-tile').filter({has:page.locator('.home-quest-action[aria-pressed="true"]')}).first();
  assert.ok(await questTile.locator('.home-quest-visual').isVisible());assert.ok(await homeQuests.locator('.ultra-copy-join').count()>0);
  const locator=page.locator('#homeactivities .home-quest-tile').and(page.locator('[data-quest-id='+JSON.stringify(questId)+']'));
  await locator.locator('.home-quest-action').click();assert.equal(await locator.locator('.home-quest-action').getAttribute('aria-pressed'),'false');
  await locator.locator('.home-quest-action').click();assert.equal(await locator.locator('.home-quest-action').getAttribute('aria-pressed'),'true');assert.equal(await homeQuests.count(),countBefore);
  const cols=()=>page.locator('#homeactivities .home-quest-grid').first().evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);
  assert.equal(await cols(),3);
  const spacing=()=>page.locator('#homeactivities .home-quest-tile').filter({has:page.locator('.ultra-copy-join')}).first().evaluate(e=>{const art=e.querySelector('.home-quest-visual').getBoundingClientRect(),name=e.querySelector('.home-quest-name').getBoundingClientRect(),join=e.querySelector('.home-quest-joins .ultra-copy-join').getBoundingClientRect();return {art:art.height,spacing:join.top-name.bottom,artSpacing:name.top-art.bottom,fit:getComputedStyle(e.querySelector('.home-quest-visual img')||e.querySelector('.home-quest-visual')).objectFit}});
  const inlineJoins=()=>page.locator('#homeactivities .home-quest-joins.has-multiple').evaluateAll(es=>es.map(e=>{const buttons=[...e.querySelectorAll('button')],r=buttons[0].getBoundingClientRect();return {count:buttons.length,sameRow:buttons.every(b=>Math.abs(b.getBoundingClientRect().top-r.top)<1),fullCommands:buttons.every(b=>b.getAttribute('aria-label').startsWith('Copy /join ')),shortLabels:buttons.every(b=>!b.querySelector('.ultra-copy-command').textContent.startsWith('/join ')),fits:e.getBoundingClientRect().width<=e.closest('.home-quest-tile').getBoundingClientRect().width,contained:buttons.every(b=>{const box=b.getBoundingClientRect(),cmd=b.querySelector('.ultra-copy-command').getBoundingClientRect(),icon=b.querySelector('.ultra-copy-icon').getBoundingClientRect();return cmd.left>=box.left&&cmd.right<=box.right&&icon.left>=box.left&&icon.right<=box.right&&cmd.right<=icon.left+1}),equal:buttons.length!==2||Math.abs(buttons[0].getBoundingClientRect().width-buttons[1].getBoundingClientRect().width)<1,noTwoOverflow:buttons.length!==2||e.scrollWidth<=e.clientWidth+1,expandable:!!e.querySelector('details')}}));
  // Long labels must truncate within the capsule, not push the copy icon outside.
  const stressJoin=page.locator('#homeactivities .home-quest-joins.has-multiple .ultra-copy-command').first();
  const originalJoin=await stressJoin.textContent();await stressJoin.evaluate(e=>e.textContent='verylongmapnamefortestingoverflow');
  assert.ok(await stressJoin.evaluate(e=>e.scrollWidth>e.clientWidth&&getComputedStyle(e).textOverflow==='ellipsis'));
  await stressJoin.evaluate((e,value)=>e.textContent=value,originalJoin);
  const desktopJoins=await inlineJoins();assert.ok(desktopJoins.length>0&&desktopJoins.every(x=>x.count>1&&x.sameRow&&x.fullCommands&&x.shortLabels&&x.fits&&x.contained&&x.equal&&x.noTwoOverflow&&!x.expandable),JSON.stringify(desktopJoins));
  const desktopSpacing=await spacing();assert.ok(desktopSpacing.art>=109&&desktopSpacing.spacing<=5&&desktopSpacing.spacing>=0&&desktopSpacing.artSpacing<=7,JSON.stringify(desktopSpacing));
  await page.setViewportSize({width:390,height:844});assert.equal(await cols(),2);const mobileJoins=await inlineJoins();assert.ok(mobileJoins.length>0&&mobileJoins.every(x=>x.sameRow&&x.fits&&x.contained&&x.equal&&x.noTwoOverflow),JSON.stringify(mobileJoins));const mobileSpacing=await spacing();assert.ok(mobileSpacing.art>=79&&mobileSpacing.spacing<=5&&mobileSpacing.spacing>=0,JSON.stringify(mobileSpacing));assert.ok(await page.locator('#homeactivities').evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.setViewportSize({width:1360,height:1100});
  await page.evaluate(()=>{const api=window.AQWCBadgeHunter,cat=window.AQWCBadgeCatalog;const file=b=>b.image?.split(/[?#]/)[0].split('/').pop().toLowerCase();const matches=cat.filter(b=>!b.placeholder&&file(b)&&/^[a-z0-9_.%()-]{1,220}\.(?:png|jpe?g|gif|webp)$/i.test(file(b))&&cat.filter(c=>!c.placeholder&&file(c)===file(b)).length===1).slice(0,3).map(b=>({file:file(b),label:b.name}));if(matches.length!==3)throw Error('Missing unique demo badge fixtures');for(const [day,badges] of [[1,matches.slice(0,1)],[2,matches]]){const res=api.applyCapture({character:'DemoHero',capturedAt:'2026-01-0'+day+'T12:00:00Z',badges});if(!res.ok)throw Error(res.error||'Demo capture failed')}});
  const badgeBox=page.locator('#home-badge-discoveries');assert.equal(await badgeBox.locator('.home-badge-discovery-count strong').innerText(),'+2');assert.ok((await badgeBox.innerText()).includes('One of 2 latest detected badges'));assert.ok(await badgeBox.locator('.home-badge-discovery-art').isVisible());
  assert.equal(await page.locator('#home-milestone-highlights .home-milestone-tile').count(),1);assert.ok(await page.locator('#home-next-milestone progress').isVisible());assert.equal(await page.locator('#home-achievement-grid .home-milestone-art').count(),1);assert.ok(await page.locator('#home-next-milestone .home-milestone-art').isVisible());const achievementRects=await page.locator('#home-achievement-grid').evaluate(g=>{const [a,b]=Array.from(g.children,e=>e.getBoundingClientRect());return {sameRow:Math.abs(a.top-b.top)<=2,sideBySide:b.left>=a.right-1,equalWidth:Math.abs(a.width-b.width)<=2}});assert.ok(achievementRects.sameRow&&achievementRects.sideBySide&&achievementRects.equalWidth);await page.locator('#home-milestone-highlights .home-milestone-art').evaluate(img=>img.decode());
  const alerts=page.locator('#home-alert-grid'),wishlist=alerts.locator('#home-wishlist-achievements'),stacks=alerts.locator('#home-stack-card');assert.ok(await wishlist.isVisible());assert.ok(await stacks.isVisible());assert.ok((await wishlist.innerText()).includes('Legion Revenant'));assert.ok((await stacks.innerText()).replace(/\s+/g,' ').includes('1 maxed'));const alertRects=await alerts.evaluate(g=>{const [a,b]=Array.from(g.children,e=>e.getBoundingClientRect());const milestone=g.parentElement.querySelector('#home-next-milestone'),prev=milestone.getBoundingClientRect();return {sameRow:Math.abs(a.top-b.top)<=2,sideBySide:b.left>=a.right-1,equalWidth:Math.abs(a.width-b.width)<=2,below:prev.bottom<=a.top+1,nextId:g.previousElementSibling.previousElementSibling.id}});assert.ok(alertRects.sameRow&&alertRects.sideBySide&&alertRects.equalWidth&&alertRects.below&&alertRects.nextId==='home-next-milestone',JSON.stringify(alertRects));await alerts.evaluate(g=>g.firstElementChild.classList.add('hidden'));assert.ok(await stacks.evaluate(e=>Math.abs(e.getBoundingClientRect().width-e.parentElement.getBoundingClientRect().width)<=2));await alerts.evaluate(g=>{g.lastElementChild.classList.add('hidden')});assert.ok(await alerts.isHidden());assert.ok(await page.locator('.home-highlights-label').isHidden());await alerts.evaluate(g=>{for(const e of g.children)e.classList.remove('hidden')});
  assert.deepEqual(await page.locator('.home-inventory-changes .home-section-label').allTextContents(),['Your progress','Highlights','Inventory changes']);assert.ok(await page.locator('.home-next-remaining').isVisible());assert.ok(await page.locator('.home-quantity-changes .home-delta-highlight-head .home-quantity-more').isVisible());assert.equal(await page.locator('#home-alert-grid .home-highlight-metric').count(),2);
  const homeHeights=()=>page.locator('#overview .home-main-grid').evaluate(g=>{const a=g.querySelector('.home-inventory-changes').getBoundingClientRect(),b=g.querySelector('.homeseason').getBoundingClientRect(),c=g.querySelector('.home-changes-content');return {left:a.height,right:b.height,visible:c.clientHeight,content:c.scrollHeight,overflow:getComputedStyle(c).overflowY,bottom:c.getBoundingClientRect().bottom,cardBottom:a.bottom}});
  const before=await homeHeights();assert.ok(Math.abs(before.left-before.right)<=2&&before.overflow==='visible'&&before.content<=before.visible+1&&before.bottom<=before.cardBottom+1&&before.visible>50,'Calendar aligned: '+JSON.stringify(before));
  const centered=await alerts.evaluate(g=>Array.from(g.children,e=>({text:getComputedStyle(e).textAlign,align:getComputedStyle(e).alignContent,head:getComputedStyle(e.querySelector('.home-delta-highlight-head,.homehead')).justifyContent,metric:getComputedStyle(e.querySelector('.home-highlight-metric')).justifyContent})));
  assert.ok(centered.every(e=>e.text==='center'&&e.align==='center'&&e.head==='center'&&e.metric==='center'),JSON.stringify(centered));
  const quantityCard=page.locator('#homeinventorydelta .home-quantity-changes');
  assert.ok(await quantityCard.evaluate(e=>{const s=getComputedStyle(e);return parseFloat(s.borderTopWidth)>0&&parseFloat(s.borderTopLeftRadius)>0&&parseFloat(s.paddingLeft)>0&&e.querySelectorAll('.home-quantity-row').length===3&&!!e.querySelector('.home-quantity-more')}));
  assert.equal(await page.locator('.home-quantity-row').count(),3);assert.equal(await page.locator('.home-delta-new-item').count(),4);
  const discoveries=await page.locator('.home-delta-new-grid').evaluate(g=>getComputedStyle(g).gridTemplateColumns.split(' ').length);assert.equal(discoveries,2);
  const more=page.locator('.home-quantity-more');await more.click();const dialog=page.locator('.home-quantity-dialog');assert.ok(await dialog.isVisible());assert.equal(await dialog.locator('.home-quantity-row').count(),4);assert.equal(await page.locator('#homeinventorydelta .home-quantity-row').count(),3);const expanded=await homeHeights();assert.ok(Math.abs(expanded.left-before.left)<=2&&Math.abs(expanded.right-before.right)<=2);await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});assert.ok(await more.evaluate(e=>document.activeElement===e));
  await page.setViewportSize({width:390,height:844});const mobile=await page.locator('.home-inventory-changes').evaluate(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,content:e.scrollHeight,visible:e.clientHeight,overflow:getComputedStyle(e.querySelector('.home-changes-content')).overflowY}));assert.ok(mobile.width<=390&&mobile.content<=mobile.visible+1&&mobile.overflow==='visible','Mobile compact Home: '+JSON.stringify(mobile));await page.setViewportSize({width:1360,height:1100});
  await shot(page,'home',page.locator('#dashboard'));
  for(const [group,tab,name] of [['projects','unlocks','wishlist'],['planner','planner','quests'],['ultras','ultras','ultras'],['builds','forge','builds'],['story','story','story'],['badges','badge-hunter','badges'],['explore','discover','explore'],['inventory','inventory','inventory'],['inventory','account-stats','stats'],['inventory','milestones','milestones']]){
   await go(group,tab);if(tab==='milestones'){const art=page.locator('#milestones .aqwm-art');assert.ok(await art.count()>=50);await art.first().evaluate(img=>img.decode());continue}await page.waitForTimeout(200);await shot(page,name,page.locator('#'+tab));
  }
  const popup=await context.newPage();await popup.setViewportSize({width:440,height:760});
  await popup.addInitScript(version=>{
   const store={};const listen={addListener(){},removeListener(){}};const reply=m=>m.type==='inventory-summary'?{ok:true,count:6,source:'full',syncedAt:Date.parse('2026-01-01T12:00:00Z')}:m.type==='wiki-appearance-read'?{ok:true,appearance:{background:'companion'}}:{ok:true};
   globalThis.chrome={runtime:{id:'guide-fixture',getManifest:()=>({version}),getURL:x=>x,onMessage:listen,sendMessage(m,cb){const r=reply(m);if(cb){queueMicrotask(()=>cb(r));return}return Promise.resolve(r)}},storage:{local:{get:async k=>({[k]:store[k]}),set:async v=>Object.assign(store,v),remove:async k=>delete store[k]},onChanged:listen},tabs:{query:async()=>[]},permissions:{contains:async()=>false},scripting:{}};
  },version);
  await popup.goto(origin+'/extension/popup.html',{waitUntil:'domcontentloaded'});await popup.locator('#one-click-inventory').waitFor({state:'visible'});await popup.waitForTimeout(300);await shot(popup,'popup-home');
  await popup.locator('[data-view=settings]').click();await popup.locator('#appearance-background').waitFor({state:'visible'});await shot(popup,'popup-settings');
  // Verify existing Wishlist alias upgrade in an isolated fixture without modifying the guide captures.
  await page.evaluate(()=>{const key='aqw-companion-unlocks',all=JSON.parse(localStorage.getItem(key)||'[]');all.push({id:'vdk-demo',name:'Verus DoomKnight (Class)',type:'Class',steps:[{id:'vdk-old',kind:'owned',item:'Verus DoomKnight (Class)',label:'Own Verus DoomKnight (Class)',target:1,status:'unknown'}]});localStorage.setItem(key,JSON.stringify(all))});
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#dashboard').waitFor({state:'visible'});await go('projects','unlocks');const vdk=page.locator('.unlockcard').filter({hasText:'Verus DoomKnight'});await vdk.locator('.dependency-stage').first().waitFor();assert.equal(await vdk.locator('.dependency-stage').count(),8);assert.ok(await vdk.locator('.dependency-stage[data-stage=body]').getByText('Titanic Spine ×13').isVisible());assert.ok(!await vdk.getByText('Acquisition not verified').count());
  await page.setViewportSize({width:390,height:844});assert.ok(await vdk.locator('.dependency-panel').evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.setViewportSize({width:1360,height:1100});
  // Check reviewed merge and gate requirements against synthetic Wishlist entries.
  await page.evaluate(()=>{const key='aqw-companion-unlocks',all=JSON.parse(localStorage.getItem(key)||'[]');for(const name of ['Void Highlord','Drakath the Eternal','Necrotic Sword of the Abyss'])if(!all.some(p=>p.name===name))all.push({id:'dep-'+name,name,type:name==='Void Highlord'?'Class':'Armor',steps:[]});localStorage.setItem(key,JSON.stringify(all))});
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#dashboard').waitFor({state:'visible'});await go('projects','unlocks');
  const reviewedVhl=page.locator('.unlockcard').filter({has:page.locator('h3').filter({hasText:/^\s*Void Highlord\s*$/})});await reviewedVhl.locator('.reviewed-merge-plan > summary').click();assert.ok(await reviewedVhl.getByText('Void Crystal A ×1',{exact:true}).first().isVisible());await reviewedVhl.locator('.nested-merge-plan > summary').click();assert.ok(await reviewedVhl.getByText('Inputs for this selected route',{exact:true}).isVisible());
  const reviewedDrakath=page.locator('.unlockcard').filter({has:page.locator('h3').filter({hasText:/^\s*Drakath the Eternal\s*$/})});await reviewedDrakath.locator('.reviewed-merge-plan > summary').click();assert.ok(await reviewedDrakath.getByText('Possession requirements (not counted as ingredients)',{exact:true}).isVisible());
  // Combined requirements are opt-in and direct-only.
  const shared=page.locator('#shared-wishlist-plan');await shared.locator(':scope > summary').click();
  await shared.locator('input[data-goal="void highlord"]').check();await shared.locator('input[data-goal="necrotic sword of the abyss"]').check();
  const crystals=shared.locator('[data-material="void crystal a"]');assert.ok(await crystals.getByText('Void Crystal A ×2',{exact:true}).isVisible());
  assert.ok(await shared.locator('[data-material="roentgenium of nulgath"]').getByText('Roentgenium of Nulgath ×17',{exact:true}).isVisible());
  const farmRoute=shared.locator('.shared-farm-route');await farmRoute.locator(':scope > summary').click();
  const farmStop=farmRoute.locator('[data-join="/join tercessuinotlim"]');
  assert.equal(await farmStop.locator('[data-kind="goal"]').count(),2);
  assert.ok(await farmStop.getByRole('link',{name:'Source ↗'}).first().isVisible());
  assert.ok(await farmRoute.getByText('Missing items without a reviewed destination').isVisible());
  await shared.locator('input[data-goal="void highlord"]').uncheck();assert.equal(await farmStop.locator('[data-kind="goal"]').count(),1);assert.ok(await farmRoute.evaluate(e=>e.open));assert.ok(await crystals.getByText('Void Crystal A ×1',{exact:true}).isVisible());
  await page.setViewportSize({width:390,height:844});assert.ok(await shared.evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.setViewportSize({width:1360,height:1100});
  await shared.getByRole('button',{name:'Clear selection',exact:true}).click();assert.equal(await shared.locator('.shared-plan-row').count(),0);
  await shared.locator('input[data-goal="verus doomknight"]').check();const stageRoute=shared.locator('.shared-farm-route');if(!await stageRoute.evaluate(e=>e.open))await stageRoute.locator(':scope > summary').click();
  assert.ok(await stageRoute.locator('.shared-farm-stage[data-stage="body"]').isVisible());
  assert.equal(await stageRoute.locator('.shared-farm-metric').count(),4);
  assert.ok(await stageRoute.locator('[data-join="/join titanattack"]').getByText('Titanic Spine',{exact:false}).first().isVisible());
  assert.equal(await stageRoute.locator('[data-join="/join necrodungeon"]').count(),0);
  assert.ok(await stageRoute.locator('[data-join="/join terminatemple"]').getByText('Accept / turn in stage',{exact:false}).isVisible());
  await page.setViewportSize({width:390,height:844});assert.ok(await stageRoute.evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.setViewportSize({width:1360,height:1100});
  await shared.getByRole('button',{name:'Clear selection',exact:true}).click();
  // Add a reviewed recipe whose existing catalog includes a quantified weekly reward.
  await page.evaluate(()=>{const k='aqw-companion-unlocks',all=JSON.parse(localStorage.getItem(k)||'[]');if(!all.some(p=>p.name==='Sin of the Abyss'))all.push({id:'next-routine-sin',name:'Sin of the Abyss',type:'Weapon',steps:[]});localStorage.setItem(k,JSON.stringify(all))});
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#dashboard').waitFor({state:'visible'});
  // Select Sin of the Abyss and verify the actual catalog-backed Ultra Nulgath opportunity.
  await go('projects','unlocks');
  const recurringShared=page.locator('#shared-wishlist-plan');if(!await recurringShared.evaluate(e=>e.open))await recurringShared.locator(':scope > summary').click();
  await recurringShared.locator('input[data-goal="sin of the abyss"]').check();
  const recurringRoute=recurringShared.locator('.shared-farm-route');if(!await recurringRoute.evaluate(e=>e.open))await recurringRoute.locator(':scope > summary').click();
  const ultraRoute=recurringRoute.locator('[data-join="/join ultranulgath"] .shared-farm-quest[data-quest-id="ultra-nulgath"]');
  assert.equal(await ultraRoute.count(),1);assert.ok(await ultraRoute.getByText('Nulgath Insignia ×5',{exact:false}).isVisible());
  assert.ok(await ultraRoute.getByText('Stack limit:',{exact:false}).isVisible());
  await page.setViewportSize({width:390,height:844});assert.ok(await recurringRoute.evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.setViewportSize({width:1360,height:1100});
  await ultraRoute.getByRole('button',{name:'View quest ↗'}).click();assert.ok(await page.locator('#planner-discover').isVisible());
  assert.equal(await page.locator('#planner-suggestions .planner-quest-card:focus').getAttribute('data-quest-id'),'ultra-nulgath');
  await page.locator('#plannersearch').fill('');
  // What's Next uses the same Home card and reviewed stage evidence.
  await go('home','overview');
  const next=page.locator('#homeprojectslist');assert.ok(await page.getByRole('heading',{name:"🎯 What's Next?",exact:true}).isVisible());
  assert.ok(await next.locator('.home-next-project').count()>0);
  const routine=next.locator('.home-next-routines');assert.ok(await routine.isVisible());
  assert.ok(await routine.locator('.home-next-routine').count()<=3);
  assert.ok(await routine.getByRole('link',{name:'Quest source ↗'}).first().isVisible());
  assert.equal(await next.locator('.home-next-metric').count(),4);
  assert.ok(await next.locator('.home-next-status').first().isVisible());
  const nextQuestId=await routine.locator('.home-next-routine').first().getAttribute('data-quest-id');
  await routine.locator('.home-next-routine').first().getByRole('button',{name:'View quest ↗'}).click();
  assert.ok(await page.locator('#planner-discover').isVisible());
  assert.equal(await page.locator('#planner-suggestions .planner-quest-card:focus').getAttribute('data-quest-id'),nextQuestId);
  await page.locator('#plannersearch').fill('');
  await go('home','overview');
  assert.ok(await next.getByText('Based on the selected full inventory & bank snapshot.',{exact:false}).isVisible());
  await page.setViewportSize({width:390,height:844});assert.ok(await next.evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.setViewportSize({width:1360,height:1100});
  await next.locator('.home-next-project').first().getByRole('button',{name:'View goal ↗'}).click();assert.ok(await page.locator('#unlocks').isVisible());assert.equal(await page.locator('#unlocksearch').inputValue(),'');assert.ok(await page.locator('.unlockcard:focus').count());assert.ok(await page.locator('.unlockcard').count()>1);
  // Actual download -> fresh isolated profile -> restore, with synthetic progress only.
  const expectedProgress=await page.evaluate(stamp=>{
   const badge=window.AQWCBadgeCatalog.find(b=>!b.placeholder&&b.image).id;
   const progress={forge:['weapon:forge'],badges:{[badge]:'tracked'},badgeCapture:{character:'Demo Hero',capturedAt:stamp,ids:[badge],storyGroups:[],ambiguous:0,unknown:0,discovery:{newIds:null,latestIds:[],latestAt:null}},accountProgress:{summary:{section:'summary',capturedAt:stamp,created:'2021-01-01',months:12,purchased:20000,bonus:5000,total:25000},sagas:{section:'sagas',capturedAt:stamp,rows:[{name:'Prologue',state:'colored'},{name:'Shadowfall',state:'unknown'}]},membership:{section:'membership',capturedAt:stamp,rows:[{name:'1 Month',state:'colored',evidence:'threshold'}]},ac:{section:'ac',capturedAt:stamp,rows:[{name:'500 ACs',state:'colored',evidence:'threshold'}]},playtime:{section:'playtime',capturedAt:stamp,rows:[{name:'1 Week',state:'colored',evidence:'threshold'}]}},stackCaps:{'void aura':800},publicInventory:{source:'character-page',character:'Demo Hero',capturedAt:stamp,reportedTotal:1,items:[{name:'ArchPaladin',type:'Class',quantity:null,rank:10}]},theme:'dark'};
   window.AQWCPortableProgress.apply(localStorage,progress);return progress;
  },stamp);
  await page.locator('#backup').evaluate(b=>{b.closest('details').open=true;b.closest('.inventory-advanced').open=true});
  const downloadPromise=page.waitForEvent('download');await page.locator('#backup').click();const download=await downloadPromise;const bytes=fs.readFileSync(await download.path()),portableBackup=JSON.parse(bytes.toString());
  assert.deepEqual(portableBackup.progressV1,expectedProgress);assert.ok(portableBackup.activeSnapshotUid);
  const restored=await browser.newContext({viewport:{width:1360,height:1100}});await restored.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
  const fresh=await restored.newPage();await fresh.goto(origin+'/',{waitUntil:'domcontentloaded'});
  await fresh.waitForFunction(()=>window.AQWCBadgeHunter&&window.AQWCAccountProgress&&!document.querySelector('#overview').hasAttribute('data-inventory-booting'));
  await fresh.evaluate(()=>localStorage.setItem('fixture-private-consent','keep'));
  const cancel=fresh.waitForEvent('dialog').then(d=>d.dismiss());await fresh.locator('#file').setInputFiles({name:'Portable.json',mimeType:'application/json',buffer:bytes});await cancel;
  await fresh.waitForFunction(()=>document.querySelector('#alert')?.textContent.includes('cancelled'));assert.equal(await fresh.locator('#historylist .historyitem').count(),0);
  const accept=fresh.waitForEvent('dialog').then(d=>d.accept());await fresh.locator('#file').setInputFiles({name:'Portable.json',mimeType:'application/json',buffer:bytes});await accept;
  await fresh.waitForFunction(()=>document.querySelector('#alert')?.textContent.includes('Imported 1 file(s)'));
  await fresh.reload({waitUntil:'domcontentloaded'});await fresh.locator('#dashboard').waitFor({state:'visible'});
  const roundTrip=await fresh.evaluate(()=>Object.fromEntries(Object.entries(window.AQWCPortableProgress.keys).map(([field,key])=>[field,field==='theme'?localStorage.getItem(key):JSON.parse(localStorage.getItem(key))])));
  assert.deepEqual(roundTrip,expectedProgress);assert.equal(await fresh.evaluate(()=>localStorage.getItem('fixture-private-consent')),'keep');assert.equal(await fresh.locator('#historylist .historyitem').count(),2);
  console.log('PORTABLE_BACKUP_ROUNDTRIP: download, cancel, confirmed restore, reload and seven progress sections passed');
  await restored.close();await context.close();
  // The production Wiki assistant is loaded against an explicit fictional Wiki fixture.
  const wc=await browser.newContext({viewport:{width:1300,height:1050}});const wiki=await wc.newPage();await wiki.route('**/*',r=>r.request().isNavigationRequest()?r.fulfill({contentType:'text/html',body:'<!doctype html><html><body></body></html>'}):r.abort());
  await wiki.goto('https://aqwwiki.wikidot.com/example-sword');await wiki.setContent('<div id="page-title">Example Sword</div><div id="breadcrumbs"><a href="/items">Items</a> <a href="/swords">Swords</a></div><div id="page-content"><p><strong>Location:</strong> <a href="/museum">Museum</a><br><strong>Price:</strong> 300 AC<br><strong>Sellback:</strong> 75 AC<br><strong>Rarity:</strong> Awesome Rarity<br><strong>Description:</strong> Fictional demonstration item.</p><ul><li>Also see:<ul><li><a href="/related-sword">Related Sword</a></li></ul></li></ul></div>');
  await wiki.evaluate(version=>{const attach=Element.prototype.attachShadow;Element.prototype.attachShadow=function(o){return attach.call(this,{...o,mode:'open'})};const data={ok:true,comparison:{synced:true,boost:{all:15},best:{all:{name:'Example Sword',slug:'example-sword',value:15}}},goals:{rows:[]},hub:{recipeCount:1,recipes:[{name:'Example Upgrade',source:'https://aqwwiki.wikidot.com/example-shop',owned:'not-found',ready:1,total:2,required:1,materials:[{name:'Void Aura',missing:20}]}],related:[{name:'Related Sword',slug:'related-sword',kind:'related',state:'not-found'}],loadouts:{all:{percent:15,gear:[{name:'Example Sword',slug:'example-sword',category:'weapons'}]}},spending:[],goalsSynced:true}};globalThis.chrome={runtime:{getManifest:()=>({version}),sendMessage(m,cb){const r=m.type==='wiki-item-assistant'?data:m.type==='wiki-item-lookup'?{ok:true,state:'owned',inventory:1,bank:0,total:1,syncedAt:Date.parse('2026-01-01T12:00:00Z')}:m.type==='hub-note-read'?{ok:true,note:{text:'',priority:'normal'}}:m.type==='goal-status-read'?{ok:true,state:'absent',at:1}:{ok:false};if(cb){cb(r);return}return Promise.resolve(r)}}}},version);
  for(const name of ['companion-theme.js','bridge.js','wishlist-link.js','wiki-materials.js','wiki-items.js'])await wiki.addScriptTag({path:path.join(ext,name)});
  const hub=wiki.locator('#aqwc-item-status');await hub.getByText('Used in recipes (1)').waitFor({timeout:15000});await shot(wiki,'wiki',hub,true);await wc.close();
  metrics.filesBytes=Object.fromEntries(['index.html','css/site.css','data/companion_database.json'].map(p=>[p,fs.statSync(path.join(root,p)).size]));
  console.log('CONSOLIDATION_BASELINE '+JSON.stringify(metrics));
  console.log('Generated all guide screenshots');
 }finally{await browser.close();server.close()}
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1});
