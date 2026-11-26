(() => {
 'use strict';
 const ORIGIN='https://cptmundo.github.io',KEY='aqwc-badge-stage-v1',CHANNEL='aqwc-badge-capture-v1';
 if(location.origin!==ORIGIN||!['/AQW-Companion/','/AQW-Companion/index.html'].includes(location.pathname)||window.top!==window)return;
 window.addEventListener('message',async e=>{
  if(e.source!==window||e.origin!==ORIGIN||e.data?.channel!==CHANNEL||e.data?.type!=='request'||typeof e.data.requestId!=='string'||!/^[a-z0-9-]{1,80}$/i.test(e.data.requestId))return;
  try{const snapshot=(await chrome.storage.local.get(KEY))[KEY]||null;
   window.postMessage({channel:CHANNEL,type:'response',requestId:e.data.requestId,snapshot},ORIGIN);
  }catch{window.postMessage({channel:CHANNEL,type:'response',requestId:e.data.requestId,snapshot:null},ORIGIN)}
 });
})();
