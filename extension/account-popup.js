(() => {
 const button=document.getElementById('capture-account'),status=document.getElementById('account-status'),discard=document.getElementById('discard-account');
 const show=text=>{status.textContent=text};
 const call=message=>chrome.runtime.sendMessage(message);
 async function summary(){
  const r=await call({type:'account-stage-summary'});
  if(r?.ok&&r.count!=null)show(r.count.toLocaleString()+' records ready to import. Open Companion and select Import inventory.');
  discard.disabled=!(r?.ok&&r.count!=null);
 }
 button.addEventListener('click',async event=>{
  if(!event.isTrusted)return;
  button.disabled=true;discard.disabled=true;show('Reading inventory and Bank… Keep this popup open.');
  try{
   const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
   const u=new URL(tab?.url||'');
   if(u.origin!=='https://account.aq.com'||!/^\/AQW\/Inventory\/?$/i.test(u.pathname)||!tab.id)throw Error('Open the logged-in Account Manager Inventory tab first.');
   const results=await chrome.scripting.executeScript({target:{tabId:tab.id},func:captureAccountInventory});
   const snapshot=results?.[0]?.result;
   if(!snapshot)throw Error('Capture failed or the page changed. Refresh the Inventory tab and try again.');
   const r=await call({type:'account-stage',snapshot});
   if(!r?.ok)throw Error(r?.error||'Could not stage inventory.');
   await summary();
  }catch(e){show('Capture failed: '+String(e?.message||e)+' Existing inventory was not replaced.');const r=await call({type:'account-stage-summary'}).catch(()=>null);discard.disabled=!(r?.ok&&r.count!=null)}
  finally{button.disabled=false}
 });
 discard.addEventListener('click',async event=>{if(!event.isTrusted||!confirm('Discard the pending import? Your synced inventory will not change.'))return;try{const r=await call({type:'account-stage-discard'});if(!r?.ok)throw Error('Discard failed');show('Pending import discarded.');discard.disabled=true}catch(e){show(String(e.message||e))}});
 summary().catch(()=>{});
})();
