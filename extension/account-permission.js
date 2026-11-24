(() => {
 'use strict';
 const pattern='https://account.aq.com/*',id='aqwc-account-export-button',matches=['https://account.aq.com/AQW/Inventory*'],files=['account-capture.js','account-page.js'];
 const button=document.getElementById('enable-account-button'),status=document.getElementById('account-permission-status'),repair=document.getElementById('repair-account-button');
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
  button.dataset.granted=granted?'1':'0';button.textContent=granted?'Disable on-page export button':'Enable on-page export button';repair.hidden=!granted;
  status.textContent=granted?'Permission granted. Open Inventory and use Show / repair button if it is missing.':'Optional: add the export button directly to the Inventory page.';
  return granted;
 }
 async function setup(){
  let registrationError=null;
  try{await install()}catch(err){registrationError=err}
  try{
   if(await inject()){status.textContent=registrationError?'Button detected on this page. Automatic setup unavailable; use Show / repair after navigation.':'Export button detected on Inventory page.';return}
   status.textContent=registrationError?'Automatic setup unavailable. Open Inventory and click Show / repair button.':'Registration complete. Open or refresh Inventory.';
  }catch(err){status.textContent='Button could not be verified: '+String(err?.message||err)+'. Popup export remains available.'}
 }
 button.addEventListener('click',async e=>{
  if(!e.isTrusted||button.disabled)return;
  button.disabled=true;repair.disabled=true;
  try{
   if(button.dataset.granted==='1'){
    // Revoke even if dynamic registration APIs are unavailable.
    try{const existing=await chrome.scripting.getRegisteredContentScripts({ids:[id]});if(existing.length)await chrome.scripting.unregisterContentScripts({ids:[id]})}catch{}
    const removed=await chrome.permissions.remove({origins:[pattern]});
    const granted=await update();status.textContent=removed&&!granted?'Disabled. Refresh Account Manager to remove the existing button.':'Permission not revoked; check browser settings.';
   }else{
    const allowed=await chrome.permissions.request({origins:[pattern]});
    if(!allowed){status.textContent='Permission declined. Popup export remains available.';return}
    await update();await setup();
   }
  }catch(err){status.textContent='Setup failed: '+String(err?.message||err)+'. Popup export remains available.'}
  finally{button.disabled=false;repair.disabled=false}
 });
 repair.addEventListener('click',async e=>{if(!e.isTrusted||repair.disabled)return;repair.disabled=true;try{if(await chrome.permissions.contains({origins:[pattern]}))await setup();else await update()}finally{repair.disabled=false}});
 update().then(async granted=>{if(granted){try{if(await inject())status.textContent='Export button detected on Inventory page.'}catch(err){status.textContent='Button not detected. Use Show / repair button.'}}}).catch(()=>{status.textContent='On-page button setup unavailable. Use popup export.'});
})();
