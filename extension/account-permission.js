(() => {
 'use strict';
 const pattern='https://account.aq.com/*',id='aqwc-account-export-button',matches=['https://account.aq.com/AQW/Inventory*'],files=['account-capture.js','account-page.js'];
 const button=document.getElementById('enable-account-button'),status=document.getElementById('account-permission-status'),repair=document.getElementById('repair-account-button');
 const revoke=document.getElementById('revoke-account-button'),privacy=document.getElementById('privacy-status');
 const isInventory=url=>{try{const u=new URL(url);return u.origin==='https://account.aq.com'&&/^\/AQW\/Inventory\/?$/i.test(u.pathname)}catch{return false}};
 async function install(){
  const existing=await chrome.scripting.getRegisteredContentScripts({ids:[id]});
  const spec={id,matches,js:files,runAt:'document_idle',persistAcrossSessions:true,allFrames:false};
  if(existing.length){await chrome.scripting.unregisterContentScripts({ids:[id]})}
  await chrome.scripting.registerContentScripts([spec]);
 }
 async function inject(){
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!isInventory(tab?.url)||!tab.id)return false;
  await chrome.scripting.executeScript({target:{tabId:tab.id},files});
  const check=await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>!!document.getElementById('aqwc-account-export')});
  if(!check?.[0]?.result)throw Error('Button not detected after injection.');
  return true;
 }
 async function update(){
  const granted=await chrome.permissions.contains({origins:[pattern]});
  button.dataset.granted=granted?'1':'0';button.textContent='Enable inventory export';repair.hidden=!granted;revoke.hidden=!granted;
  status.textContent=granted?'✓ Inventory export enabled.':'First time? Enable the export button, or use the alternative below.';
  return granted;
 }
 async function setup(){
  let registrationError=null;
  try{await install()}catch(err){registrationError=err}
  try{
   if(await inject()){status.textContent=registrationError?'Button detected on this page. Automatic setup unavailable; use Show / repair after navigation.':'✓ Export button ready on Inventory.';return}
   status.textContent=registrationError?'Automatic setup unavailable. Open Inventory and click Show / repair button.':'✓ Inventory export enabled. Open or refresh Inventory.';
  }catch(err){status.textContent='Button could not be verified: '+String(err?.message||err)+'. Popup export remains available.'}
 }
 button.addEventListener('click',async e=>{
  if(!e.isTrusted||button.disabled)return;
  button.disabled=true;repair.disabled=true;
  try{
   if(button.dataset.granted==='1')return;
   const allowed=await chrome.permissions.request({origins:[pattern]});
   if(!allowed){status.textContent='Permission declined. Alternative export remains available.';return}
   await update();await setup();
  }catch(err){status.textContent='Setup failed: '+String(err?.message||err)+'. Popup export remains available.'}
  finally{button.disabled=false;repair.disabled=false}
 });
 revoke.addEventListener('click',async e=>{
  if(!e.isTrusted||revoke.disabled)return;revoke.disabled=true;privacy.hidden=false;
  try{
   try{const existing=await chrome.scripting.getRegisteredContentScripts({ids:[id]});if(existing.length)await chrome.scripting.unregisterContentScripts({ids:[id]})}catch{}
   await chrome.permissions.remove({origins:[pattern]});
   const granted=await update();privacy.textContent=granted?'Permission not revoked; check browser settings.':'Access disabled. Refresh Account Manager to remove the existing button.';
  }catch(err){privacy.textContent='Could not revoke access. Check browser settings.'}finally{revoke.disabled=false}
 });
 repair.addEventListener('click',async e=>{if(!e.isTrusted||repair.disabled)return;repair.disabled=true;try{if(await chrome.permissions.contains({origins:[pattern]}))await setup();else await update()}finally{repair.disabled=false}});
 update().then(async granted=>{if(granted){try{if(await inject())status.textContent='✓ Export button ready on Inventory.'}catch(err){status.textContent='Button not detected. Use Show / repair button.'}}}).catch(()=>{status.textContent='On-page button setup unavailable. Use popup export.'});
})();
