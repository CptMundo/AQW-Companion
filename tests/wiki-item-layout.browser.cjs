// Browser regression matrix for the actual extension layout, with native DOM identity checks.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const path=require('node:path');
const root=path.join(__dirname,'../extension');
const origin='https://aqwwiki.wikidot.com';
const svg='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="240"><rect width="300" height="240" fill="#ac7534"/></svg>');
const pic=(id)=>'<img id="'+id+'" src="'+svg+'" width="300" height="240" alt="Equipment art">';
const basic='<p><strong>Location:</strong> <a href="/museum">Museum</a><br><strong>Price:</strong> 300 AC<br><strong>Sellback:</strong> 75 AC<br><strong>Rarity:</strong> Awesome Rarity<br><strong>Description:</strong> A test item.</p>';
const recipe='<ul><li>Merge the following:<ul><li><a href="/void-aura">Void Aura</a> x10</li></ul></li></ul>';
const event='<p><img src="/local--files/image-tags/staffbirthday.png" width="160" height="160" alt="Staff Birthday"><img src="/local--files/image-tags/acsmall.png" width="45" height="26" alt="AC"><img src="/local--files/image-tags/legend.png" width="120" height="30" alt="Legend"></p>';
const gallery='<div class="yui-navset" id="native-gallery"><ul><li><a href="#male">Male</a></li><li><a href="#female">Female</a></li></ul><div id="male"><div class="collapsible-block">Normal'+pic('male-art')+'</div></div><div id="female" hidden><div class="collapsible-block">Animated'+pic('female-art')+'</div></div></div>';
const variants='<div class="yui-navset" id="native-variants"><ul><li><a href="#one">First</a></li><li><a href="#two">Second</a></li></ul><div id="one">'+basic+recipe+'</div><div id="two">'+basic.replace('300 AC','400 AC')+'<img src="/local--files/image-tags/rare.png" alt="Rare">'+recipe+'</div></div>';
const scenarios=[
 ['shop-cape',basic+'<p>'+pic('art')+'</p><p>Thanks to Test.</p>',false,true],
 ['quest-armor',event+basic.replace('300 AC',"N/A (Reward from the <a href='/quests'>Example</a> quest)")+gallery,false,true],
 ['rare-dagger',event+basic+'<p><a href="/image">'+pic('art')+'</a></p>',false,true],
 ['variant-hat',event+variants+'<p>'+pic('art')+'</p>',true,true],
 ['merge-weapon',basic+recipe+'<p>'+pic('art')+'</p>',true,true],
 ['material',basic+recipe,false,false],
 ['multiple-art',basic+'<p>'+pic('art-one')+'</p><p>'+pic('art-two')+'</p>',false,true],
 ['nested-art',basic+'<div><center><a href="/image">'+pic('art')+'</a></center></div>',false,true],
 ['art-with-credit',basic+'<figure>'+pic('art')+'<figcaption>Thanks to Test.</figcaption></figure>',false,true],
 ['mixed-tabs',variants,false,false],
 ['tiny-icon',basic+'<p><img width="16" height="16" src="/small-icon.png"></p>',false,false],
 ['no-price',basic.replace('<strong>Price:</strong> 300 AC<br>','')+gallery,false,true],
];
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let count=0;
 try{
  const page=await browser.newPage();
  let errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{
    if(r.request().isNavigationRequest())return r.fulfill({body:'<!doctype html><html><head></head><body></body></html>',contentType:'text/html'});
    if(r.request().url().includes('/image-tags/')){const url=r.request().url();const [w,h]=url.includes('staffbirthday')?[160,160]:url.includes('acsmall')?[45,26]:[120,30];return r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><rect width="'+w+'" height="'+h+'" fill="#be8a56"/></svg>'})}
    return r.abort();
  });
  for(const [name,body,farm,art] of scenarios)for(const width of [1440,1100,700]){
   await page.setViewportSize({width,height:900});await page.goto(origin+'/'+name);
   await page.setContent('<div id="page-title">Test '+name+'</div><div id="page-content">'+body+'</div>');
   await page.evaluate(()=>{globalThis.chrome={runtime:{getManifest:()=>({version:'test'}),getURL:()=>'/boost-index.json'}};window.nativeNodes=[...document.querySelector('#page-content').childNodes];window.originalGallery=document.querySelector('#native-gallery');window.originalVariant=document.querySelector('#native-variants');window.originalText=document.querySelector('#page-content').textContent;});
   await page.addScriptTag({path:path.join(root,'companion-theme.js')});
   await page.addScriptTag({path:path.join(root,'bridge.js')});
   await page.addScriptTag({path:path.join(root,'wiki-materials.js')});
   const result=await page.evaluate(({farm})=>{
    const c=document.querySelector('#page-content'),status=document.createElement('div');status.id='aqwc-item-status';status.textContent='Assistant';
    if(farm){const w=document.createElement('div');w.className='aqwc-item-workspace';const f=document.createElement('div');f.id='aqwc-inline-farm';f.textContent='Farming Progress';w.append(f,status);const anchor=c.querySelector('#one')||c;anchor.append(w)}
    AQWCWikiUI.styleItem(c,status);AQWCWikiUI.styleItem(c,status);
    const q=s=>c.querySelector(s),left=q('.aqwc-item-left'),right=q('.aqwc-item-right'),info=q('.aqwc-item-info'),details=q('.aqwc-native-details'),art=q('.aqwc-item-artwork');
    const original=window.nativeNodes.every(n=>n.isConnected);
    const gap=farm?q('#aqwc-inline-farm').getBoundingClientRect().top-info.getBoundingClientRect().bottom:null;
    const galleryOK=!window.originalGallery||art.contains(window.originalGallery);
    const variantOK=!window.originalVariant||details.contains(window.originalVariant);
    const r={shells:c.querySelectorAll('.aqwc-unified-item').length,info:left.contains(info),details:left.contains(details),status:right.contains(status),farm:farm?left.contains(q('#aqwc-inline-farm')):!q('#aqwc-inline-farm'),art:right.contains(art),artVisible:!q('.aqwc-art-placeholder').hidden,media:art.querySelectorAll('.aqwc-art-media img').length,original,galleryOK,variantOK,gap,overflow:document.documentElement.scrollWidth>innerWidth+2,columns:getComputedStyle(q('.aqwc-unified-item')).gridTemplateAreas};
    r.detailsInitiallyClosed=!details.open;r.rareInSummary=!!info.querySelector('img[alt="Rare"]');r.nativeLogoCount=info.querySelectorAll('.aqwc-tag-logo').length;details.open=true;r.detailsOpen=details.open;details.open=false;return r;
   },{farm});
   // Real boost renderer must put its host inside the shared tag row.
   await page.evaluate(()=>{globalThis.AQWCOriginalItemText='Sellback: 0 AC Description: Example. Notes: When equipped, this item provides a 5% bonus to Gold when battling monsters or turning in quests.'});
   await page.addScriptTag({path:path.join(root,'wiki-boosts.js')});
   assert.ok(await page.locator('.aqwc-item-info .aqwc-item-tags > #aqwc-item-boosts').count(),name+' boosts alongside native tags');
   for(const key of ['info','details','status','farm','art','original','galleryOK','variantOK','detailsOpen','detailsInitiallyClosed'])assert.ok(result[key],name+' '+width+' '+key+' '+JSON.stringify(result));
   assert.equal(result.rareInSummary,false,name+' variant-only rare tag');
   if(['quest-armor','rare-dagger','variant-hat'].includes(name))assert.equal(result.nativeLogoCount,2,name+' shared native logos');
   const badgeLayout=await page.evaluate(async()=>{
    const info=document.querySelector('.aqwc-item-info'),event=info.querySelector('.aqwc-item-events'),tags=info.querySelector('.aqwc-item-tags'),boost=tags.querySelector('#aqwc-item-boosts'),logos=[...tags.querySelectorAll('.aqwc-tag-logo')];
    await Promise.all([...info.querySelectorAll('img')].map(img=>img.decode().catch(()=>{})));
    const rect=n=>n.getBoundingClientRect();return {event:!!event,order:!event||rect(event).bottom<=rect(tags).top+1,eventHeight:event?rect(event.querySelector('img')).height:0,logos:logos.map(n=>n.querySelector('img')?.alt||n.alt),boostAfter:!logos.length||!!(logos.at(-1).compareDocumentPosition(boost)&Node.DOCUMENT_POSITION_FOLLOWING),sameLine:!logos.length||Math.abs((rect(logos.at(-1)).top+rect(logos.at(-1)).bottom)/2-(rect(boost).top+rect(boost).bottom)/2)<3};
   });
   const hasEvent=['quest-armor','rare-dagger','variant-hat'].includes(name);
   assert.equal(badgeLayout.event,hasEvent,name+' event row');
   assert.ok(badgeLayout.order&&badgeLayout.boostAfter,name+' tag order');
   if(hasEvent){assert.deepEqual(badgeLayout.logos,['AC','Legend']);assert.ok(badgeLayout.eventHeight>=135&&badgeLayout.eventHeight<=151,name+' event size '+badgeLayout.eventHeight);assert.ok(badgeLayout.sameLine,name+' boosts must align with logos')}
   assert.equal(result.shells,1,name+' duplicate shell');
   assert.equal(result.artVisible,!art,name+' art visibility');
   if(farm)assert.ok(Math.abs(result.gap-16)<=1,name+' stack gap '+result.gap);
   assert.ok(!result.overflow,name+' overflow');
   assert.equal(result.columns,width>1050?'"left right"':'"left" "right"',name+' responsive columns');
   console.log('PASS',name,width);count++;
  }
  assert.deepEqual(errors,[]);
  console.log('BROWSER_MATRIX_PASSED',count);
 }finally{await browser.close()}
}
run().catch(e=>{console.error(e);process.exitCode=1});
