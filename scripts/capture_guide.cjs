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
const shot=async(page,name,locator)=>{const dest=path.join(out,'guide-'+name+'.png');await page.evaluate(()=>document.fonts.ready);if(locator){await locator.waitFor({state:'visible'});await locator.scrollIntoViewIfNeeded();const b=await locator.boundingBox(),v=page.viewportSize();if(!b)throw Error('No screenshot bounds '+name);if(b.height<=v.height-4&&b.width<=v.width-4)await locator.screenshot({path:dest,animations:'disabled',timeout:15000});else{await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:dest,animations:'disabled'})}}else{await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:dest,animations:'disabled'})}assert.ok(fs.statSync(dest).size>5000,'Screenshot '+name+' too small');console.log('Captured',name)};
async function main(){
 fs.mkdirSync(out,{recursive:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const context=await browser.newContext({viewport:{width:1360,height:880},deviceScaleFactor:1});
  // No logged-in sessions or analytics. External image requests omitted; fallback artwork stays visible.
  await context.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
  const page=await context.newPage();
  page.on('pageerror',e=>console.error('Guide page:',e.message));
  await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#overview')&&!document.querySelector('#overview').hasAttribute('data-inventory-booting'),null,{timeout:45000});
  // The real app keeps its functions private in an IIFE. Drive its public JSON
  // input and navigation controls rather than reaching into private internals.
  const items=[{ID:'demo1',Name:'Void Aura',Type:'Misc',Count:180,Bank:0},{ID:'demo2',Name:'Diamond of Nulgath',Type:'Misc',Count:500,Bank:0},{ID:'demo3',Name:'Gem of Nulgath',Type:'Misc',Count:75,Bank:1},{ID:'demo4',Name:'Legion Revenant',Type:'Class',Count:1,Bank:0},{ID:'demo5',Name:'ArchPaladin',Type:'Class',Count:1,Bank:0},{ID:'demo6',Name:'Blood Gem of the Archfiend',Type:'Misc',Count:12,Bank:0}];
  const stamp='2026-01-01T12:00:00Z';
  const material=(item,target)=>({label:item+' ×'+target,kind:'material',item,target,status:'unknown'});
  const backup={format:'AQW Companion backup v0.9.3',snapshots:[{fileName:'Demo earlier.json',exportedAt:'2025-12-31T12:00:00Z',items:items.map(i=>({...i,Count:i.ID==='demo1'?100:i.Count}))},{fileName:'Demo_Inventory.json',exportedAt:stamp,items}],unlocks:[{name:'Sin of the Abyss',type:'Weapon',steps:[material('Blood Gem of the Archfiend',50),material('Diamond of Nulgath',500),material('Gem of Nulgath',150)]},{name:'Necrotic Sword of Doom',type:'Weapon',steps:[material('Void Aura',800)]},{name:'Legion Revenant',type:'Class',steps:[{label:'Own Legion Revenant',kind:'owned',item:'Legion Revenant',status:'unknown'}]}]};
  await page.locator('#file').setInputFiles({name:'Demo_Backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await page.locator('#dashboard').waitFor({state:'visible',timeout:45000});
  await page.evaluate(stamp=>{const api=window.AQWCAccountProgress;if(!api)throw Error('Account progress module not loaded');api.save({section:'summary',capturedAt:stamp,created:'2021-01-01',months:12,purchased:20000,bonus:5000,total:25000});api.save({section:'sagas',capturedAt:stamp,rows:[{name:'Prologue',state:'colored'},{name:'Shadowfall',state:'colored'},{name:'Chiral Valley',state:'unknown'}]});api.save({section:'membership',capturedAt:stamp,rows:[{name:'1 Month',state:'colored',evidence:'threshold'},{name:'12 Months',state:'colored',evidence:'threshold'},{name:'2 Years',state:'gray',evidence:'threshold'}]})},stamp);
  const go=async(group,tab)=>{await page.locator('.primarynav [data-group="'+group+'"]').click();if(tab&&tab!=='overview'){const button=page.locator('.subnav [data-tab="'+tab+'"]');if(!await page.locator('#'+tab+'.active').count())await button.click();await page.locator('#'+tab+'.active').waitFor({state:'visible',timeout:15000})}};
  await go('planner','planner-discover');
  for(let i=0;i<5;i++){const pin=page.locator('#planner-suggestions .planner-pin-action.is-unpinned').first();await pin.click({timeout:15000})}
  await go('planner','planner');
  await page.locator('#planner-my-tasks .planner-complete-action').first().click({timeout:15000});
  await go('home','overview');await shot(page,'home');
  for(const [group,tab,name] of [['projects','unlocks','wishlist'],['planner','planner','quests'],['ultras','ultras','ultras'],['builds','builds','builds'],['story','story','story'],['badges','badge-hunter','badges'],['explore','discover','explore'],['inventory','inventory','inventory'],['inventory','account-stats','stats']]){
   await go(group,tab);await page.waitForTimeout(200);await shot(page,name);
  }
  const popup=await context.newPage();await popup.setViewportSize({width:440,height:760});
  await popup.addInitScript(()=>{
   const store={};const listen={addListener(){},removeListener(){}};const reply=m=>m.type==='inventory-summary'?{ok:true,count:6,source:'full',syncedAt:Date.parse('2026-01-01T12:00:00Z')}:m.type==='wiki-appearance-read'?{ok:true,appearance:{background:'companion'}}:{ok:true};
   globalThis.chrome={runtime:{id:'guide-fixture',getManifest:()=>({version:'demo'}),getURL:x=>x,onMessage:listen,sendMessage(m,cb){const r=reply(m);if(cb){queueMicrotask(()=>cb(r));return}return Promise.resolve(r)}},storage:{local:{get:async k=>({[k]:store[k]}),set:async v=>Object.assign(store,v),remove:async k=>delete store[k]},onChanged:listen},tabs:{query:async()=>[]},permissions:{contains:async()=>false},scripting:{}};
  });
  await popup.goto(origin+'/extension/popup.html',{waitUntil:'domcontentloaded'});await popup.locator('#one-click-inventory').waitFor({state:'visible'});await popup.waitForTimeout(300);await shot(popup,'popup-home');
  await popup.locator('[data-view=settings]').click();await popup.locator('#appearance-background').waitFor({state:'visible'});await shot(popup,'popup-settings');
  await context.close();
  // The production Wiki assistant is loaded against an explicit fictional Wiki fixture.
  const wc=await browser.newContext({viewport:{width:1300,height:1050}});const wiki=await wc.newPage();await wiki.route('**/*',r=>r.request().isNavigationRequest()?r.fulfill({contentType:'text/html',body:'<!doctype html><html><body></body></html>'}):r.abort());
  await wiki.goto('https://aqwwiki.wikidot.com/example-sword');await wiki.setContent('<div id="page-title">Example Sword</div><div id="breadcrumbs"><a href="/items">Items</a> <a href="/swords">Swords</a></div><div id="page-content"><p><strong>Location:</strong> <a href="/museum">Museum</a><br><strong>Price:</strong> 300 AC<br><strong>Sellback:</strong> 75 AC<br><strong>Rarity:</strong> Awesome Rarity<br><strong>Description:</strong> Fictional demonstration item.</p><ul><li>Also see:<ul><li><a href="/related-sword">Related Sword</a></li></ul></li></ul></div>');
  await wiki.evaluate(version=>{const attach=Element.prototype.attachShadow;Element.prototype.attachShadow=function(o){return attach.call(this,{...o,mode:'open'})};const data={ok:true,comparison:{synced:true,boost:{all:15},best:{all:{name:'Example Sword',slug:'example-sword',value:15}}},goals:{rows:[]},hub:{recipeCount:1,recipes:[{name:'Example Upgrade',source:'https://aqwwiki.wikidot.com/example-shop',owned:'not-found',ready:1,total:2,required:1,materials:[{name:'Void Aura',missing:20}]}],related:[{name:'Related Sword',slug:'related-sword',kind:'related',state:'not-found'}],loadouts:{all:{percent:15,gear:[{name:'Example Sword',slug:'example-sword',category:'weapons'}]}},spending:[],goalsSynced:true}};globalThis.chrome={runtime:{getManifest:()=>({version}),sendMessage(m,cb){const r=m.type==='wiki-item-assistant'?data:m.type==='wiki-item-lookup'?{ok:true,state:'owned',inventory:1,bank:0,total:1,syncedAt:Date.parse('2026-01-01T12:00:00Z')}:m.type==='hub-note-read'?{ok:true,note:{text:'',priority:'normal'}}:m.type==='goal-status-read'?{ok:true,state:'absent',at:1}:{ok:false};if(cb){cb(r);return}return Promise.resolve(r)}}}},version);
  for(const name of ['companion-theme.js','bridge.js','wishlist-link.js','wiki-materials.js','wiki-items.js'])await wiki.addScriptTag({path:path.join(ext,name)});
  const hub=wiki.locator('#aqwc-item-status');await hub.getByText('Used in recipes (1)').waitFor({timeout:15000});await shot(wiki,'wiki',hub);await wc.close();
  console.log('Generated all guide screenshots');
 }finally{await browser.close();server.close()}
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1});
