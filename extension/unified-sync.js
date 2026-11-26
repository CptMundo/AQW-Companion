/* Local one-click sync, shared by worker, popup and scoped Companion content script. */
(() => {
'use strict';
const PUBLIC='aqwc-public-inventory-v1';
const SITE='https://cptmundo.github.io/AQW-Companion/', STATUS='aqwc-one-click-status-v1', CHANNEL='aqwc-one-click-v1', BADGES='aqwc-badge-stage-v1';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const sourceKind=url=>{try{const u=new URL(url);if(u.origin!=='https://account.aq.com')return null;if(/^\/AQW\/Inventory\/?$/i.test(u.pathname))return 'inventory';if(/^\/(?:AQW\/)?CharPage\/?$/i.test(u.pathname)&&u.searchParams.get('id')?.trim())return 'badges';return null}catch{return null}};
const isSite=url=>{try{const u=new URL(url);return u.origin==='https://cptmundo.github.io'&&['/AQW-Companion/','/AQW-Companion/index.html'].includes(u.pathname)}catch{return false}};
if(typeof document==='undefined'){
 let job=null,writeQueue=Promise.resolve();
 function progress(phase,text,read=null,total=null){
  if(!job)return Promise.resolve();
  const j=job;j.phase=phase;const state={id:j.id,kind:j.kind,phase,text,read,total,at:Date.now()};
  writeQueue=writeQueue.catch(()=>{}).then(async()=>{const prev=(await chrome.storage.local.get(STATUS))[STATUS]||{};await chrome.storage.local.set({[STATUS]:{...prev,[j.kind]:state}})});
  return writeQueue;
 }
 async function sourceTab(kind,tabId){
  let tab;try{tab=await chrome.tabs.get(tabId)}catch{}
  const expected=kind==='public'?'badges':kind;
  if(sourceKind(tab?.url)===expected)return tab;
  const allowed=await chrome.permissions.contains({origins:['https://account.aq.com/*']});
  let url='https://account.aq.com/AQW/Inventory';
  if(kind==='badges'||kind==='public'){
   const saved=(await chrome.storage.local.get(kind==='public'?PUBLIC:BADGES))[kind==='public'?PUBLIC:BADGES];
   if(!saved?.character)throw Error('Open your public Character Page once, then click the desired Sync button.');
   url='https://account.aq.com/CharPage?id='+encodeURIComponent(saved.character);
  }
  if(!allowed){await chrome.tabs.create({url,active:true});throw Error(kind==='inventory'?'Source opened. Sign in if needed, then click Sync here.':'Character Page opened. Click Sync here after the inventory loads. No login needed.')}
  const found=await chrome.tabs.query({url:'https://account.aq.com/*'});
  tab=found.find(t=>sourceKind(t.url)===expected&&(kind==='inventory'||new URL(t.url).searchParams.get('id')===new URL(url).searchParams.get('id')));
  return tab||await chrome.tabs.create({url,active:false});
 }
 async function waitSource(tab,kind){
  for(let i=0;i<50;i++){
   const current=await chrome.tabs.get(tab.id);
   if(current.status==='complete'){
    if(sourceKind(current.url)!==(kind==='public'?'badges':kind)){await chrome.tabs.update(tab.id,{active:true});throw Error('Sign in or open the correct source page, then try Sync again.')}
    const probe=await chrome.scripting.executeScript({target:{tabId:tab.id},func:k=>k==='inventory'?performance.getEntriesByType('resource').some(r=>{try{const u=new URL(r.name);return u.origin===location.origin&&/(?:^|\/)InventoryData\/?$/i.test(u.pathname)}catch{return false}}):k==='public'?!!document.querySelector('#inventoryRendered a.item'):[...document.images].some(img=>/\/badges\/[^/]+\.(png|jpe?g|gif|webp)(?:[?#]|$)/i.test(img.currentSrc||img.src||'')),args:[kind]}).catch(()=>null);
    if(probe?.[0]?.result)return;
   }
   await sleep(500);
  }
  throw Error('Source data is not ready. Refresh the source page, let it load, then try again.');
 }
 async function companionTab(){
  const tabs=await chrome.tabs.query({url:['https://cptmundo.github.io/AQW-Companion/*']}).catch(()=>[]);
  const tab=tabs.find(t=>isSite(t.url))||await chrome.tabs.create({url:SITE,active:false});
  for(let i=0;i<90;i++){
   const reply=await chrome.tabs.sendMessage(tab.id,{type:'one-click-ping',kind:job.kind},{frameId:0}).catch(()=>null);
   if(reply?.ready)return tab;
   await sleep(500);
  }
  throw Error('Companion is not ready. Refresh the website (Ctrl+F5), then retry. The captured data is still staged.');
 }
 async function run(kind,tabId){
  if(job)return {ok:false,error:'Another sync is running.'};
  job={kind,id:crypto.randomUUID(),sourceId:null,phase:'opening'};
  let saved=false;
  try{
   await restrictStorage();await progress('opening','Opening '+(kind==='inventory'?'Account Manager':'Character Page')+'…');
   const source=await sourceTab(kind,tabId);job.sourceId=source.id;
   await waitSource(source,kind);
   await progress('reading',kind==='inventory'?'Reading Inventory & Bank…':kind==='public'?'Reading public inventory…':'Reading Character Page badges…');
   const result=await chrome.scripting.executeScript({target:{tabId:source.id},func:kind==='inventory'?captureAccountInventory:kind==='public'?capturePublicInventory:captureCharacterBadges,args:kind==='inventory'?[null,job.id]:[]});
   let snapshot=result?.[0]?.result,stageId;
   await progress('staging','Preparing local snapshot…');
   if(kind==='inventory'){
    snapshot=cleanAccountSnapshot(snapshot);stageId=crypto.randomUUID();
    await chrome.storage.local.set({[ACCOUNT_STAGE]:{id:stageId,snapshot}});
   }else if(kind==='public'){
    snapshot=cleanPublicSnapshot(snapshot);
   }else{
    if(!snapshot||typeof snapshot.character!=='string'||!Array.isArray(snapshot.badges)||!snapshot.badges.length||snapshot.badges.length>2000)throw Error('No valid badges captured.');
    await chrome.storage.local.set({[BADGES]:snapshot});
   }
   await progress('connecting','Connecting to Companion…');
   const target=await companionTab();
   await progress('importing',kind==='inventory'?'Saving inventory and updating trackers…':kind==='public'?'Saving separate public inventory…':'Matching and saving badges…');
   const reply=await chrome.tabs.sendMessage(target.id,{type:'one-click-apply',id:job.id,kind,snapshot},{frameId:0});
   saved=!!reply?.saved;
   if(!reply?.ok||!saved||reply.id!==job.id)throw Error(reply?.error||'Companion did not confirm the update. Check the website before retrying.');
   if(kind==='inventory'){
    const stage=(await chrome.storage.local.get(ACCOUNT_STAGE))[ACCOUNT_STAGE];
    if(stage?.id!==stageId)throw Error('Inventory saved on Companion, but staged inventory changed. Use manual extension sync.');
    await chrome.storage.local.set({[KEY]:cleanSnapshot(snapshot)});await chrome.storage.local.remove(ACCOUNT_STAGE);
   }
   if(kind==='public')await chrome.storage.local.set({[PUBLIC]:snapshot});
   const count=kind==='inventory'||kind==='public'?snapshot.items.length:reply.count;
   await progress('done',kind==='inventory'?'✓ '+count+' records synced':kind==='public'?'✓ '+count+' public items · Bank unknown':'✓ '+count+' badges matched'+(reply.ambiguous||reply.unknown?' · '+reply.ambiguous+' ambiguous, '+reply.unknown+' unrecognized':''),count,count);
   return {ok:true,count};
  }catch(e){const error=String(e?.message||e);await progress('error',error+(saved?' Website data was saved; sync not fully confirmed.':' Check Companion before retrying; staged data is retained if captured.')).catch(()=>{});return {ok:false,error}}
  finally{job=null}
 }
 globalThis.AQWCOneClick={sourceKind,isSite,async handle(m,sender){
  if(m.type==='one-click-progress'){
   if(!job||job.phase!=='reading'||job.kind!=='inventory'||m.id!==job.id||sender.tab?.id!==job.sourceId||!accountInventorySender(sender))return {ok:false};
   const p=m.progress;if(!p||!['connecting','bulk','reading'].includes(p.phase))return {ok:false};
   if(p.phase==='reading'&&Number.isInteger(p.read)&&Number.isInteger(p.total)&&p.total>0&&p.total<=10000&&p.read>=0&&p.read<=p.total){await progress('reading','Reading Inventory & Bank · '+p.read+' / '+p.total,p.read,p.total)}
   else if(p.phase==='bulk')await progress('reading','Reading complete inventory response…');
   return {ok:true}
  }
  if(!popupSender(sender))return {ok:false,error:'Invalid sync request.'};
  if(m.type==='one-click-start'&&['inventory','badges','public'].includes(m.kind)&&Number.isInteger(m.tabId))return run(m.kind,m.tabId);
  return {ok:false,error:'Invalid sync request.'}
 }};
 return;
}
if(location.protocol==='chrome-extension:'||location.protocol==='moz-extension:'){
 const inventory=document.getElementById('one-click-inventory'),badges=document.getElementById('one-click-badges');
 if(!inventory||!badges)return;
 const publicButton=document.getElementById('one-click-public');
 const controls=publicButton?{inventory,public:publicButton,badges}:{inventory,badges},running=['opening','reading','staging','connecting','importing'];let localBusy=false;
 async function paint(){
  const all=(await chrome.storage.local.get(STATUS))[STATUS]||{};
  const busy=localBusy||Object.values(all).some(s=>running.includes(s.phase)&&Date.now()-s.at<300000);
  for(const [kind,btn] of Object.entries(controls)){
   const s=all[kind],bar=document.getElementById('one-click-'+kind+'-progress'),status=document.getElementById('one-click-'+kind+'-status');
   btn.disabled=busy;btn.textContent=s&&running.includes(s.phase)&&busy?'Syncing…':kind==='inventory'?'↻ Full Sync':kind==='public'?'↻ Public Sync':'↻ Sync Badges';
   if(!s)continue;
   const stale=running.includes(s.phase)&&Date.now()-s.at>=300000;
   status.textContent=stale?'Sync interrupted. Retry from the source page.':s.text;status.dataset.state=stale?'error':s.phase;
   bar.hidden=stale||s.phase==='error';
   if(s.phase==='done'){bar.max=1;bar.value=1}
   else if(s.phase==='reading'&&s.total>0){bar.max=s.total;bar.value=s.read}
   else bar.removeAttribute('value');
  }
 }
 for(const [kind,button] of Object.entries(controls))button.addEventListener('click',async e=>{
  if(!e.isTrusted||localBusy)return;localBusy=true;
  const status=document.getElementById('one-click-'+kind+'-status'),bar=document.getElementById('one-click-'+kind+'-progress');status.textContent='Starting sync…';bar.hidden=false;bar.removeAttribute('value');for(const b of Object.values(controls))b.disabled=true;
  try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(!Number.isInteger(tab?.id))throw Error('No active browser tab.');const r=await chrome.runtime.sendMessage({type:'one-click-start',kind,tabId:tab.id});if(!r?.ok)status.textContent=r?.error||'Sync was not confirmed.'}
  catch(err){status.textContent=String(err?.message||err);bar.hidden=true}finally{localBusy=false;await paint().catch(()=>{})}
 });
 chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes[STATUS])void paint().catch(()=>{})});void paint().catch(()=>{});
 return;
}
if(!isSite(location.href)||window.top!==window)return;
chrome.runtime.onMessage.addListener((m,sender,reply)=>{
 if(sender.id!==chrome.runtime.id||!['one-click-ping','one-click-apply'].includes(m?.type))return;
 const ready=document.documentElement.dataset.aqwcOneClickReady==='1'&&(m.kind!=='badges'||document.documentElement.dataset.aqwcBadgeReady==='1')&&(m.kind!=='public'||document.documentElement.dataset.aqwcPublicReady==='1');
 if(m.type==='one-click-ping'){reply({ready});return}
 if(!ready||!['inventory','badges','public'].includes(m.kind)||typeof m.id!=='string'||! /^[a-f0-9-]{36}$/i.test(m.id)){reply({ok:false,error:'Companion not ready.'});return}
 let timer;const receive=e=>{if(e.source!==window||e.origin!==location.origin||e.data?.channel!==CHANNEL||e.data.type!=='result'||e.data.id!==m.id)return;clearTimeout(timer);window.removeEventListener('message',receive);reply(e.data)};
 window.addEventListener('message',receive);timer=setTimeout(()=>{window.removeEventListener('message',receive);reply({ok:false,error:'Website confirmation timed out; check Companion before retrying.'})},90000);
 window.postMessage({channel:CHANNEL,type:'apply',id:m.id,kind:m.kind,snapshot:m.snapshot},location.origin);return true;
});
})();
