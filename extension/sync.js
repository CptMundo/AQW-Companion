(() => {
 'use strict';
 const SITE='https://cptmundo.github.io', paths=['/AQW-Companion/','/AQW-Companion/index.html'];
 if(location.origin!==SITE||!paths.includes(location.pathname))return;
 const button=document.getElementById('aqwc-sync-inventory'),status=document.getElementById('aqwc-sync-status');
 if(!button||!status)return;
 let pending='',timer;
 const show=(text,state)=>{status.textContent=text;status.dataset.state=state};
 show('Extension ready · v'+chrome.runtime.getManifest().version,'ready');
 button.disabled=false;
 function finish(){clearTimeout(timer);pending='';button.disabled=false}
 button.addEventListener('click',event=>{
  if(!event.isTrusted||pending)return;
  pending=Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
  button.disabled=true;show('Syncing selected inventory…','checking');
  window.postMessage({channel:'aqwc-inventory-v1',type:'request',nonce:pending},SITE);
  timer=setTimeout(()=>{finish();show('No response. Refresh Companion and try again.','error')},5000);
 });
 window.addEventListener('message',event=>{
  if(event.source!==window||event.origin!==SITE)return;
  const msg=event.data;if(!pending||msg?.channel!=='aqwc-inventory-v1'||msg.type!=='snapshot'||msg.nonce!==pending)return;
  clearTimeout(timer);pending='';
  if(msg.error){finish();show(msg.error,'error');return}
  chrome.runtime.sendMessage({type:'sync-inventory',snapshot:msg.snapshot},result=>{
   finish();if(chrome.runtime.lastError||!result?.ok){show(result?.error||'Sync failed. Reload the extension and refresh Companion.','error');return}
   show('Synced '+result.count.toLocaleString()+' inventory records · '+new Date(result.syncedAt).toLocaleString(),'success');
  });
 });
})();
