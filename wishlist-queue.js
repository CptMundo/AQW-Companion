(() => {
 'use strict';
 const SITE='https://cptmundo.github.io',channel='aqwc-wishlist-queue-v1';
 if(location.origin!==SITE||!['/AQW-Companion/','/AQW-Companion/index.html'].includes(location.pathname))return;
 let routinePending=null,routineBusy=false;
 let pending=null,busy=false,statusNonce=null,lastStatus='',lastAt=0,lastRequest=0;
 async function poll(){
  if(busy||document.hidden||document.getElementById('wiki-wishlist-review')?.dataset.queueReady!=='1')return;
  busy=true;
  try{
   if(Date.now()-lastRequest>=10000){lastRequest=Date.now();statusNonce=Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');window.postMessage({channel,type:'status-request',nonce:statusNonce},SITE);}
   const result=await chrome.runtime.sendMessage({type:'wishlist-queue-read'});
   if(!result?.ok||!result.entries?.length){busy=false;return}
   const nonce=Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
   pending={nonce,ids:new Set(result.entries.map(x=>x.id))};
   window.postMessage({channel,type:'entries',nonce,entries:result.entries},SITE);
   setTimeout(()=>{if(pending?.nonce===nonce){pending=null;busy=false}},5000);
  }catch{pending=null;busy=false}
 }
 async function pollRoutines(){
  if(routineBusy||document.getElementById('wiki-wishlist-review')?.dataset.routineCheckReady!=='1')return;
  routineBusy=true;
  try{
   const r=await chrome.runtime.sendMessage({type:'routine-check-read'});
   if(!r?.ok||!r.entries?.length){routineBusy=false;return}
   const nonce=Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
   routinePending={nonce,ids:new Set(r.entries.map(e=>e.id))};
   window.postMessage({channel,type:'routine-check-entries',nonce,entries:r.entries},SITE);
   setTimeout(()=>{if(routinePending?.nonce===nonce){routinePending=null;routineBusy=false}},5000);
  }catch{routinePending=null;routineBusy=false}
 }
 window.addEventListener('message',async e=>{
  const m=e.data;
  if(e.source===window&&e.origin===SITE&&m?.channel===channel&&m.type==='routine-check-saved'&&routinePending&&m.nonce===routinePending.nonce&&Array.isArray(m.results)&&m.results.every(x=>routinePending.ids.has(x?.id))){
   routinePending=null;
   try{const routines=globalThis.AQWCMiniTracker?.readRoutines(localStorage);if(routines){await chrome.runtime.sendMessage({type:'routine-check-ack',results:m.results,routines:{...routines,canEdit:true}});lastStatus='';lastRequest=0;}}catch{}finally{routineBusy=false}return;
  }
  if(e.source===window&&e.origin===SITE&&m?.channel===channel&&m.type==='status-response'&&statusNonce&&m.nonce===statusNonce){statusNonce=null;try{const projected=globalThis.AQWCMiniTracker?.readRoutines(localStorage)??null;const status={...m.status,routines:projected?{...projected,canEdit:document.getElementById('wiki-wishlist-review')?.dataset.routineCheckReady==='1'}:null};const serialized=JSON.stringify(status);if(serialized!==lastStatus||Date.now()-lastAt>60000){const r=await chrome.runtime.sendMessage({type:'goal-status-publish',status});if(r?.ok){lastStatus=serialized;lastAt=Date.now()}}}catch{}return}
  if(e.source!==window||e.origin!==SITE||m?.channel!==channel||m.type!=='saved'||!pending||m.nonce!==pending.nonce||!Array.isArray(m.ids)||m.ids.some(id=>!pending.ids.has(id)))return;
  pending=null;
  try{await chrome.runtime.sendMessage({type:'wishlist-queue-ack',ids:m.ids})}catch{}finally{busy=false}
 });
 chrome.runtime.onMessage.addListener((m,sender,respond)=>{
  if(sender.id!==chrome.runtime.id||sender.tab||sender.url&&sender.url!==chrome.runtime.getURL('worker.js')||m?.type!=='aqwc-routine-queued')return;
  pollRoutines();respond({ok:true});return false;
 });
 window.addEventListener('focus',poll);document.addEventListener('visibilitychange',poll);
 setInterval(poll,2000);setInterval(pollRoutines,2000);poll();pollRoutines();
})();
