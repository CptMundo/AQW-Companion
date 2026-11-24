(() => {
 'use strict';
 const SITE='https://cptmundo.github.io',channel='aqwc-wishlist-queue-v1';
 if(location.origin!==SITE||!['/AQW-Companion/','/AQW-Companion/index.html'].includes(location.pathname))return;
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
 window.addEventListener('message',async e=>{
  const m=e.data;
  if(e.source===window&&e.origin===SITE&&m?.channel===channel&&m.type==='status-response'&&statusNonce&&m.nonce===statusNonce){statusNonce=null;try{const serialized=JSON.stringify(m.status);if(serialized!==lastStatus||Date.now()-lastAt>60000){const r=await chrome.runtime.sendMessage({type:'goal-status-publish',status:m.status});if(r?.ok){lastStatus=serialized;lastAt=Date.now()}}}catch{}return}
  if(e.source!==window||e.origin!==SITE||m?.channel!==channel||m.type!=='saved'||!pending||m.nonce!==pending.nonce||!Array.isArray(m.ids)||m.ids.some(id=>!pending.ids.has(id)))return;
  pending=null;
  try{await chrome.runtime.sendMessage({type:'wishlist-queue-ack',ids:m.ids})}catch{}finally{busy=false}
 });
 window.addEventListener('focus',poll);document.addEventListener('visibilitychange',poll);
 setInterval(poll,2000);poll();
})();
