(() => {
 'use strict';
 const pattern='https://account.aq.com/*',id='aqwc-account-export-button',matches=['https://account.aq.com/AQW/Inventory','https://account.aq.com/AQW/Inventory/*'],files=['account-capture.js','account-page.js'];
 const button=document.getElementById('enable-account-button'),status=document.getElementById('account-permission-status');
 async function register(){
  const existing=await chrome.scripting.getRegisteredContentScripts({ids:[id]});
  if(!existing.length)await chrome.scripting.registerContentScripts([{id,matches,js:files,runAt:'document_idle',persistAcrossSessions:true,allFrames:false}]);
 }
 async function update(){
  const granted=await chrome.permissions.contains({origins:[pattern]});
  button.textContent=granted?'Disable on-page export button':'Enable on-page export button';
  status.textContent=granted?'Enabled on Account Manager Inventory. Refresh the page if needed.':'Optional: add the export button directly to the Inventory page.';
  return granted;
 }
 button.addEventListener('click',async e=>{
  if(!e.isTrusted||button.disabled)return;
  button.disabled=true;
  try{
   if(button.dataset.granted==='1'){
    const registered=await chrome.scripting.getRegisteredContentScripts({ids:[id]});if(registered.length)await chrome.scripting.unregisterContentScripts({ids:[id]});
    await chrome.permissions.remove({origins:[pattern]});
    await update();status.textContent='Disabled. Refresh Account Manager to remove the existing button.';
   }else{
    const allowed=await chrome.permissions.request({origins:[pattern]});
    if(!allowed){status.textContent='Permission declined. Popup export remains available.';return}
    await register();
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
    try{const u=new URL(tab?.url||'');if(u.origin==='https://account.aq.com'&&/^\/AQW\/Inventory\/?$/i.test(u.pathname)&&tab.id)await chrome.scripting.executeScript({target:{tabId:tab.id},files})}catch{}
    await update();
   }
  }catch(err){status.textContent='Setup failed: '+String(err?.message||err)+'. Popup export remains available.'}
  finally{button.disabled=false;button.dataset.granted=(await chrome.permissions.contains({origins:[pattern]}).catch(()=>false))?'1':'0'}
 });
 update().then(granted=>{button.dataset.granted=granted?'1':'0';if(granted)return register()}).catch(()=>{status.textContent='On-page button setup unavailable. Use popup export.'});
})();
