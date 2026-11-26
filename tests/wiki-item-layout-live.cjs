// Audit a deterministic cross-category sample of current public Wiki HTML.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const root=path.join(__dirname,'../extension'),origin='https://aqwwiki.wikidot.com';
const catalog=JSON.parse(fs.readFileSync(path.join(root,'boost-index.json'),'utf8')).rows;
const reported=['fire-orb-cape-1','empowered-blademaster','supercharged-cybervoid-dagger-5','bearded-galactic-naval-top-hat-legend'];
const selected=new Set([...reported,'cape-of-awe','necrotic-sword-of-doom-sword','blinding-light-of-destiny-axe','blade-of-the-burning-sun','void-aura','spirit-orb-misc','archpaladin','archpaladin-0-ac','archpaladin-ac','stonecrusher-merge','nulgath-challenge-pet']);
for(const category of ['armors','weapons','capes-back-items','helmets-hoods','pets']){
 const rs=catalog.filter(x=>x.category===category).sort((a,b)=>a.slug.localeCompare(b.slug));
 for(const i of [0,Math.floor(rs.length/3),Math.floor(rs.length*2/3),rs.length-1])if(rs[i])selected.add(rs[i].slug);
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function fetchPage(slug){try{const r=await fetch(origin+'/'+slug,{signal:AbortSignal.timeout(12000),headers:{'User-Agent':'AQW Companion layout audit (public Wiki pages)'}});if(!r.ok||new URL(r.url).origin!==origin)throw Error('HTTP '+r.status);const html=await r.text();if(html.length>2500000)throw Error('page too large');return {slug,html}}catch(e){return {slug,error:e.message}}}
async function main(){
 const fetched=[];const slugs=[...selected];
 for(let i=0;i<slugs.length;i+=3){fetched.push(...await Promise.all(slugs.slice(i,i+3).map(fetchPage)));await sleep(350)}
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});let passed=0;const failures=[],unavailable=[];
 try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.route('**/*',r=>r.request().isNavigationRequest()?r.fulfill({body:'<!doctype html><html><head></head><body></body></html>',contentType:'text/html'}):r.abort());
 for(const row of fetched){
  if(row.error){unavailable.push(row.slug+': '+row.error);continue}
  try{
   await page.goto(origin+'/'+row.slug);
   const ok=await page.evaluate(html=>{
    const source=new DOMParser().parseFromString(html,'text/html');
    const c=source.getElementById('page-content'),t=source.getElementById('page-title'),b=source.getElementById('breadcrumbs')||source.querySelector('.breadcrumbs,#breadcrumb,.breadcrumb');
    if(!c||!t)return false;
    // Work on inert fetched DOM. Do not execute remote code or contact image hosts.
    for(const n of [c,t,b].filter(Boolean)){for(const x of n.querySelectorAll('script,iframe,object,embed,style,link,meta'))x.remove();for(const e of [n,...n.querySelectorAll('*')])for(const a of [...e.attributes])if(a.name.startsWith('on')||a.name==='srcdoc')e.removeAttribute(a.name)}
    document.body.replaceChildren(document.importNode(t,true),...(b?[document.importNode(b,true)]:[]),document.importNode(c,true));
    window.nativeNodes=[...document.getElementById('page-content').childNodes];window.nativeTabs=[...document.querySelectorAll('#page-content .yui-navset')];
    globalThis.chrome={runtime:{getManifest:()=>({version:'test'}),sendMessage(m,cb){const result=m.type==='wiki-material-lookup'?{ok:true,syncedAt:1,matches:m.names.map(()=>({state:'not-found',total:0}))}:m.type==='wiki-item-lookup'?{ok:true,state:'not-found',syncedAt:1}:m.type==='goal-status-read'?{ok:true,state:'unknown'}:{ok:false};if(cb){cb(result);return}return Promise.resolve(result)}}};
    return true;
   },row.html);
   if(!ok){unavailable.push(row.slug+': no article');continue}
   for(const name of ['companion-theme.js','bridge.js','wishlist-link.js','wiki-materials.js','wiki-items.js'])await page.addScriptTag({path:path.join(root,name)});
   const r=await page.evaluate(()=>{
    const c=document.getElementById('page-content'),q=s=>c.querySelector(s),left=q('.aqwc-item-left'),right=q('.aqwc-item-right'),info=q('.aqwc-item-info'),farm=q('#aqwc-inline-farm'),art=q('.aqwc-item-artwork');
    const shell=q('.aqwc-unified-item');
    return {shell:!!shell,left:!!left&&left.contains(info),right:!!right&&right.contains(art)&&right.contains(q('#aqwc-item-status')),details:!!left&&left.contains(q('.aqwc-native-details')),farm:!farm||left?.contains(farm),gap:!farm||Math.abs(farm.getBoundingClientRect().top-info.getBoundingClientRect().bottom-16)<=1,original:window.nativeNodes.every(n=>n.isConnected),tabs:window.nativeTabs.every(n=>n.isConnected),artwork:art?.querySelectorAll('.aqwc-art-media img').length||0};
   });
   if(row.slug==='archpaladin'){assert.equal(r.shell,false,'Disambiguation must not be treated as an item');assert.ok(r.original);console.log('LIVE_NEGATIVE_PASS',row.slug);continue}
   for(const key of ['shell','left','right','details','farm','gap','original','tabs'])assert.ok(r[key],row.slug+' '+key+' '+JSON.stringify(r));
   if(reported.includes(row.slug))assert.ok(r.artwork>0,row.slug+' reported artwork missing');
   console.log('LIVE_PASS',row.slug,JSON.stringify(r));passed++;
  }catch(e){failures.push(row.slug+': '+e.message)}
 }
 }finally{await browser.close()}
 console.log('LIVE_AUDIT',JSON.stringify({requested:slugs.length,passed,unavailable,failures}));
 assert.equal(failures.length,0,failures.join('\n'));
 // Treat a blocked external service as incomplete evidence, not a pass.
 assert.ok(passed>=30,'Fewer than 30 real pages were verifiable');
 assert.ok(reported.every(slug=>!unavailable.some(x=>x.startsWith(slug+':'))),'A reported regression could not be fetched');
}
main().catch(e=>{console.error(e);process.exitCode=1});
