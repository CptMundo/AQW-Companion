(() => {
 'use strict';
 const ORIGIN='https://cptmundo.github.io',CHANNEL='aqwc-badge-capture-v1';
 if(location.origin!==ORIGIN||!['/AQW-Companion/','/AQW-Companion/index.html'].includes(location.pathname)||window.top!==window)return;
 window.addEventListener('message',async e=>{
  if(e.source!==window||e.origin!==ORIGIN||e.data?.channel!==CHANNEL||e.data?.type!=='request'||typeof e.data.requestId!=='string'||!/^[a-z0-9-]{1,80}$/i.test(e.data.requestId))return;
  try{const result=await chrome.runtime.sendMessage({type:'badge-stage-read'});
   const snapshot=result?.ok?result.snapshot:null;
   window.postMessage({channel:CHANNEL,type:'response',requestId:e.data.requestId,snapshot},ORIGIN);
  }catch{window.postMessage({channel:CHANNEL,type:'response',requestId:e.data.requestId,snapshot:null},ORIGIN)}
 });
})();
