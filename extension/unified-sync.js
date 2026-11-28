/* Local one-click sync, shared by worker, popup and scoped Companion content script. */
(() => {
'use strict';
const PUBLIC='aqwc-public-inventory-v1';
const SITE='https://cptmundo.github.io/AQW-Companion/', STATUS='aqwc-one-click-status-v1', CHANNEL='aqwc-one-click-v1', BADGES='aqwc-badge-stage-v1';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const PROGRESS_PREF='aqwc-import-loyalty-v1', PROGRESS_ENTRY='https://account.aq.com/progress/playtime.aspx';
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
  if(tab)return tab;
  const created=await chrome.tabs.create({url,active:false});
  // Only a background Inventory tab opened by this job is ours to close.
  if(kind==='inventory')job.ownedInventoryTabId=created.id;
  return created;
 }
 async function waitSource(tab,kind){
  for(let i=0;i<50;i++){
   const current=await chrome.tabs.get(tab.id);
   if(current.status==='complete'){
    if(sourceKind(current.url)!==(kind==='public'?'badges':kind)){await chrome.tabs.update(tab.id,{active:true});throw Error('Sign in or open the correct source page, then try Sync again.')}
    // Badge capture owns its own bounded expand/load wait, using the same parser as manual capture.
    if(kind==='badges')return;
    const probe=await chrome.scripting.executeScript({target:{tabId:tab.id},func:k=>k==='inventory'?performance.getEntriesByType('resource').some(r=>{try{const u=new URL(r.name);return u.origin===location.origin&&/(?:^|\/)InventoryData\/?$/i.test(u.pathname)}catch{return false}}):!!document.querySelector('#inventoryRendered a.item'),args:[kind]}).catch(()=>null);
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

 // Only after a user-triggered inventory sync is committed. The separate tab is ours to close.
 async function syncAccountProgress(source,target){
  const includeLoyalty=(await chrome.storage.local.get(PROGRESS_PREF))[PROGRESS_PREF]===true;
  const wanted=includeLoyalty?['summary','sagas','playtime','membership','ac']:['sagas','playtime'];let summary=null;
  const completed=[],failed=[];let tabId=null;
  const safe=url=>{try{const u=new URL(url);return u.origin==='https://account.aq.com'&&!u.username&&!u.password&&/progress|badge|achievement/i.test(u.pathname)&&!/logout|logoff|delete|purchase|payment|reset|password|settings/i.test(u.pathname)}catch{return false}};
  const inspect=async (id,expected=null)=>{
   for(let i=0;i<20;i++){
    const t=await chrome.tabs.get(id);
    if(t.status==='complete'){
     if(!safe(t.url))throw Error('Progress page unavailable or sign-in required.');
     const value=await chrome.scripting.executeScript({target:{tabId:id},func:readProgressNavigation});
     const n=value?.[0]?.result;
     if(expected?n?.section===expected:n?.section||n?.links?.tracker||Object.keys(n?.links||{}).some(k=>wanted.includes(k)))return n;
    }
    await sleep(400);
   }
   throw Error('Progress navigation not found.');
  };
  try{
   if(!await chrome.permissions.contains({origins:['https://account.aq.com/*']}))return {completed,failed:wanted,reason:'Enable Account Manager access in Settings.'};
   await progress('reading','Finding Account Manager progress…');
   const discovered=await chrome.scripting.executeScript({target:{tabId:source.id},func:readProgressNavigation}).catch(()=>null);
   const seed=discovered?.[0]?.result?.links?.tracker;
   const tab=await chrome.tabs.create({url:safe(seed)?seed:PROGRESS_ENTRY,active:false});tabId=tab.id;
   let n=await inspect(tabId),links={...n.links};
   if(!n.section&&safe(links.tracker)){
    await chrome.tabs.update(tabId,{url:links.tracker});n=await inspect(tabId);Object.assign(links,n.links);
   }
   for(const section of wanted){
    await progress('reading','Account progress · '+completed.length+' / '+wanted.length,completed.length,wanted.length);
    try{
     if(n.section!==section){
      if(!safe(links[section]))throw Error('Section link not found.');
      await chrome.tabs.update(tabId,{url:links[section]});
      n=await inspect(tabId,section);Object.assign(links,n.links);
     }
     if(n.section!==section)throw Error('Unexpected progress page.');
     let snapshot,bestSaga=null;
     for(let attempt=0;attempt<(section==='sagas'?20:8);attempt++){
      try{
       const v=await chrome.scripting.executeScript({target:{tabId},func:captureAccountProgress,args:[summary]});
       snapshot=v?.[0]?.result;
       const expected={sagas:15,playtime:20,membership:20,ac:16}[section];
       if(snapshot?.section===section&&(!expected||snapshot.rows?.length===expected)){
        if(section!=='sagas')break;
        const known=v=>v.rows.filter(r=>r.state==='colored'||r.state==='gray').length;
        if(!bestSaga||known(snapshot)>=known(bestSaga))bestSaga=snapshot;
        if(!snapshot.rows.some(r=>r.state==='unknown'))break;
       }
       snapshot=null;
      }catch{snapshot=null}
      await sleep(400);
     }
     if(!snapshot&&section==='sagas')snapshot=bestSaga;
     if(!snapshot)throw Error('Incomplete progress capture.');
     if(section==='summary')summary=snapshot;
     const id=crypto.randomUUID(),reply=await chrome.tabs.sendMessage(target.id,{type:'one-click-apply',id,kind:'progress',snapshot},{frameId:0});
     if(!reply?.ok||!reply.saved||reply.id!==id)throw Error('Progress not confirmed by Companion.');
     completed.push(section);
    }catch{failed.push(section)}
   }
   return {completed,failed};
  }catch{return {completed,failed:wanted.filter(k=>!completed.includes(k)),reason:'Progress page unavailable. Check that Account Manager is signed in.'}}
  finally{if(tabId!==null)try{await chrome.tabs.remove(tabId)}catch{}}
 }

 async function closeOwnedInventoryTab(){
  const id=job?.ownedInventoryTabId;
  if(!Number.isInteger(id))return;
  try{
   const tab=await chrome.tabs.get(id);
   // Leave it open if the user switched to it or navigated away.
   if(tab.active===false&&sourceKind(tab.url)==='inventory')await chrome.tabs.remove(id);
  }catch{/* Tab already closed or inaccessible; sync remains successful. */}
 }
 async function run(kind,tabId){
  if(job)return {ok:false,error:'Another sync is running.'};
  job={kind,id:crypto.randomUUID(),sourceId:null,phase:'opening'};
  let saved=false;
  try{
   await restrictStorage();await progress('opening','Opening '+(kind==='inventory'||kind==='progress'?'Account Manager':'Character Page')+'…');
   const source=await sourceTab(kind,tabId);job.sourceId=source.id;
   await waitSource(source,kind);
   await progress('reading',kind==='inventory'?'Reading Inventory & Bank…':kind==='public'?'Reading public inventory…':kind==='progress'?'Reading visible Progress Badges…':'Reading Character Page badges…');
   const result=await chrome.scripting.executeScript({target:{tabId:source.id},func:kind==='inventory'?captureAccountInventory:kind==='public'?capturePublicInventory:kind==='progress'?captureAccountProgress:captureCharacterBadges,args:kind==='inventory'?[null,job.id]:kind==='badges'?[null,null,true]:[]});
   let snapshot=result?.[0]?.result,stageId;
   if(kind==='inventory'){
    if(typeof snapshot?.captureError==='string')throw Error('Inventory capture: '+snapshot.captureError.slice(0,240));
    if(!snapshot||!Array.isArray(snapshot.items))throw Error('Account Manager did not return an inventory snapshot. Refresh the Inventory tab and retry.');
   }
   await progress('staging','Preparing local snapshot…');
   if(kind==='inventory'){
    snapshot=cleanAccountSnapshot(snapshot);stageId=crypto.randomUUID();
    await chrome.storage.local.set({[ACCOUNT_STAGE]:{id:stageId,snapshot}});
   }else if(kind==='public'){
    snapshot=cleanPublicSnapshot(snapshot);
   }else if(kind==='progress'){
    if(!snapshot||!['summary','sagas','playtime','membership','ac'].includes(snapshot.section))throw Error('No valid progress captured.');
   }else{
    if(!snapshot||typeof snapshot.character!=='string'||!Array.isArray(snapshot.badges)||!snapshot.badges.length||snapshot.badges.length>2000)throw Error('No valid badges captured.');
    await chrome.storage.local.set({[BADGES]:snapshot});
   }
   await progress('connecting','Connecting to Companion…');
   const target=await companionTab();
   await progress('importing',kind==='inventory'?'Saving inventory and updating trackers…':kind==='public'?'Saving separate public inventory…':kind==='progress'?'Saving local account progress…':'Matching and saving badges…');
   const reply=await chrome.tabs.sendMessage(target.id,{type:'one-click-apply',id:job.id,kind,snapshot},{frameId:0});
   saved=!!reply?.saved;
   if(!reply?.ok||!saved||reply.id!==job.id)throw Error(reply?.error||'Companion did not confirm the update. Check the website before retrying.');
   if(kind==='inventory'){
    const stage=(await chrome.storage.local.get(ACCOUNT_STAGE))[ACCOUNT_STAGE];
    if(stage?.id!==stageId)throw Error('Inventory saved on Companion, but staged inventory changed. Use manual extension sync.');
    await chrome.storage.local.set({[KEY]:cleanSnapshot(snapshot)});await chrome.storage.local.remove(ACCOUNT_STAGE);
    let result;try{result=await syncAccountProgress(source,target)}catch{result={completed:[],failed:['progress'],reason:'Progress sync unavailable.'}}
    const count=snapshot.items.length,partial=result.failed.length>0;
    const label='✓ '+count+' inventory records · '+result.completed.length+'/'+(result.completed.length+result.failed.length)+' progress sections'+(partial?' · '+result.failed.length+' not synced'+(result.reason?' · '+result.reason:''):'');
    if(!partial)await closeOwnedInventoryTab();
    await progress('done',label,count,count);return {ok:true,count,progress:result,partial};
   }
   if(kind==='public')await chrome.storage.local.set({[PUBLIC]:snapshot});
   const count=kind==='inventory'||kind==='public'?snapshot.items.length:reply.count;
   await progress('done',kind==='inventory'?'✓ '+count+' records synced':kind==='public'?'✓ '+count+' public items · Bank unknown':kind==='progress'?'✓ Progress saved · review in Companion':'✓ '+count+' badges matched · Story updated'+(reply.ambiguous||reply.unknown?' · '+reply.ambiguous+' ambiguous, '+reply.unknown+' unrecognized':''),count,count);
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
 const controls=publicButton?{inventory,public:publicButton,badges}:{inventory,badges};const running=['opening','reading','staging','connecting','importing'];let localBusy=false;
 const loyalty=document.getElementById('sync-loyalty-opt-in');if(loyalty){chrome.storage.local.get(PROGRESS_PREF).then(x=>{loyalty.checked=x[PROGRESS_PREF]===true}).catch(()=>{});loyalty.addEventListener('change',e=>{if(e.isTrusted)void chrome.storage.local.set({[PROGRESS_PREF]:loyalty.checked}).catch(()=>{loyalty.checked=!loyalty.checked})});}
 async function paint(){
  const all=(await chrome.storage.local.get(STATUS))[STATUS]||{};
  const busy=localBusy||Object.keys(controls).some(k=>all[k]&&running.includes(all[k].phase)&&Date.now()-all[k].at<300000);
  for(const [kind,btn] of Object.entries(controls)){
   const s=all[kind],bar=document.getElementById('one-click-'+kind+'-progress'),status=document.getElementById('one-click-'+kind+'-status');
   btn.disabled=busy;btn.textContent=s&&running.includes(s.phase)&&busy?'Syncing…':kind==='inventory'?'↻ Full Sync':kind==='public'?'↻ Public Sync':'↻ Sync Badges';
   if(!s)continue;
   const stale=running.includes(s.phase)&&Date.now()-s.at>=300000;
   const compact=kind==='badges'&&!stale&&s.phase==='done'&&Number.isSafeInteger(s.read);status.textContent=stale?'Sync interrupted. Retry from the source page.':compact?'✓ '+s.read+' badges':s.text;status.title=compact?s.text:'';if(compact)status.setAttribute('aria-label',s.text);else status.removeAttribute('aria-label');status.dataset.state=stale?'error':s.phase==='done'&&kind==='inventory'&&s.text.includes('not synced')?'partial':s.phase;
   bar.hidden=stale||s.phase==='error';
   if(s.phase==='done'){bar.max=1;bar.value=1}
   else if(s.phase==='reading'&&s.total>0){bar.max=s.total;bar.value=s.read}
   else bar.removeAttribute('value');
  }
 }
 for(const [kind,button] of Object.entries(controls))button.addEventListener('click',async e=>{
  if(!e.isTrusted||localBusy)return;localBusy=true;
  if(kind==='inventory'){try{await chrome.permissions.request({origins:['https://account.aq.com/*']})}catch{}}
  if(kind==='public'){try{const info=await chrome.runtime.sendMessage({type:'inventory-summary'});if(info?.source==='full'&&!confirm('You already have a full Account Manager / imported inventory snapshot. Public Sync provides less information and will be saved separately. Continue anyway?')){localBusy=false;return}}catch{localBusy=false;return}}
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
 if(!ready||!['inventory','badges','public','progress'].includes(m.kind)||typeof m.id!=='string'||! /^[a-f0-9-]{36}$/i.test(m.id)){reply({ok:false,error:'Companion not ready.'});return}
 let timer;const receive=e=>{if(e.source!==window||e.origin!==location.origin||e.data?.channel!==CHANNEL||e.data.type!=='result'||e.data.id!==m.id)return;clearTimeout(timer);window.removeEventListener('message',receive);reply(e.data)};
 window.addEventListener('message',receive);timer=setTimeout(()=>{window.removeEventListener('message',receive);reply({ok:false,error:'Website confirmation timed out; check Companion before retrying.'})},90000);
 window.postMessage({channel:CHANNEL,type:'apply',id:m.id,kind:m.kind,snapshot:m.snapshot},location.origin);return true;
});
})();
