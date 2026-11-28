'use strict';
// Explicit activeTab capture. Only public badge image references, never credentials.
function captureCharacterBadges(doc=document,href=location.href,autoExpand=false){
 doc=doc??document;href=href??location.href;
 const u=new URL(href);
 if(u.origin!=='https://account.aq.com'||!/^\/(?:AQW\/)?CharPage\/?$/i.test(u.pathname))throw Error('Open the official public Character Page first.');
 const character=(u.searchParams.get('id')||'').trim();
 if(!character||character.length>80||/[\u0000-\u001f\u007f]/.test(character))throw Error('Character name missing from the page URL.');
 function readBadges(){
 const badges=[],seen=new Set();
 for(const img of doc.querySelectorAll('img')){
  for(const raw of [img.getAttribute('src'),img.getAttribute('data-src'),img.currentSrc]){
   if(!raw)continue;
   let a;try{a=new URL(raw,u.href)}catch{continue}
   if(!['game.aq.com','www.aq.com','aq.com'].includes(a.hostname)||!/^https?:$/.test(a.protocol)||!/(?:^|\/)badges\/[^/]+\.(?:png|jpe?g|gif|webp)$/i.test(a.pathname))continue;
   const file=a.pathname.split('/').pop().toLowerCase();
   const label=(img.getAttribute('title')||img.getAttribute('alt')||'').trim().slice(0,200);
   const key=file+'|'+label.toLowerCase();
   if(!seen.has(key)){seen.add(key);badges.push({file,label})}
  }
 }
 if(!badges.length)throw Error('No recognized badge images found. Open the full badge list and try again.');
 if(badges.length>2000)throw Error('Unexpected badge count.');
 return {character,capturedAt:new Date().toISOString(),badges};
 }
 if(!autoExpand)return readBadges();
 // The Character Page can defer loading its badge list until the user opens it.
 // Click only a clearly identified collapsed badge control, never a generic page action.
 return (async()=>{
  const clicked=new Set();let lastError,lastSignature='',stable=0;
  for(let attempt=0;attempt<50;attempt++){
   const controls=doc.querySelectorAll('button,a,summary,[role="button"],[onclick],[data-toggle],[data-bs-toggle],span,div');
   const toggle=[...controls].find(el=>{
    if(clicked.has(el)||el.disabled||el.getAttribute('aria-disabled')==='true'||el.getAttribute('aria-expanded')==='true'||(el.getClientRects&&el.getClientRects().length===0))return false;
    const label=String(el.textContent||'').replace(/\s+/g,' ').trim();
    const aria=String(el.getAttribute('aria-label')||'').trim();
    return /^(?:\+\s*(?:achievement\s+)?badges|(?:show|expand|view)\s+(?:achievement\s+)?badges)$/i.test(label)||/^(?:show|expand)\s+(?:achievement\s+)?badges$/i.test(aria)||el.getAttribute('aria-expanded')==='false'&&/^(?:badges|achievements|achievement badges)$/i.test(label);
   });
   if(toggle){clicked.add(toggle);toggle.click();stable=0;lastSignature='';}
   else{try{const result=readBadges(),signature=JSON.stringify(result.badges);stable=signature===lastSignature?stable+1:0;lastSignature=signature;if(stable>=2)return result}catch(e){lastError=e;stable=0;lastSignature=''}}
   await new Promise(resolve=>setTimeout(resolve,500));
  }
  throw Error('Badge list did not load. Open your Character Page, expand + Badges and retry. '+String(lastError?.message||''));
 })();
}
if(typeof module==='object'&&module.exports)module.exports=captureCharacterBadges;
else if(typeof document!=='undefined'){
 const KEY='aqwc-badge-stage-v1',status=document.getElementById('badge-capture-status'),capture=document.getElementById('capture-badges'),discard=document.getElementById('discard-badges');
 const show=s=>status.textContent=s;
 async function summary(){const v=(await chrome.storage.local.get(KEY))[KEY];show(v?v.character+' · '+v.badges.length+' image references ready. Import in Badge Hunter.':'No capture staged.')}
 capture.addEventListener('click',async e=>{if(!e.isTrusted)return;capture.disabled=true;try{
 const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
 const url=new URL(tab?.url||'');if(url.origin!=='https://account.aq.com'||!/^\/(?:AQW\/)?CharPage\/?$/i.test(url.pathname)||!tab.id)throw Error('Open the official public Character Page first.');
 const result=await chrome.scripting.executeScript({target:{tabId:tab.id},func:captureCharacterBadges,args:[null,null,true]});
 const snapshot=result?.[0]?.result;if(!snapshot?.badges?.length)throw Error('No badge capture returned.');
 await chrome.storage.local.set({[KEY]:snapshot});await summary();
 }catch(err){show('Capture failed: '+String(err?.message||err)+' Previous capture preserved.')}finally{capture.disabled=false}});
 discard.addEventListener('click',async e=>{if(e.isTrusted&&confirm('Discard the staged badge capture? Imported badge progress will not change.')){await chrome.storage.local.remove(KEY);await summary()}});
 summary().catch(()=>show('Could not read staged capture.'));
}
