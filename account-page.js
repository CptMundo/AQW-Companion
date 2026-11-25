(() => {
 'use strict';
 if(location.origin!=='https://account.aq.com'||!/^\/AQW\/Inventory\/?$/i.test(location.pathname) )return false;
 if(document.getElementById('aqwc-account-export'))return true;
 const host=document.createElement('div');host.id='aqwc-account-export';host.style.cssText='display:block;box-sizing:border-box;margin:8px 0;max-width:100%';
 const root=host.attachShadow({mode:'closed'}),panel=document.createElement('section'),button=document.createElement('button'),status=document.createElement('div'),link=document.createElement('a'),progress=document.createElement('progress');
 panel.style.cssText='background:#142b3e;color:#e5f5ff;border:1px solid #67bcdf;border-radius:9px;padding:7px 9px;display:flex;flex-wrap:wrap;align-items:center;gap:8px;font:13px/1.5 system-ui,sans-serif;box-shadow:0 3px 12px #0005';
 button.type='button';button.textContent='Export to AQW Companion';button.style.cssText='background:#214e70;color:white;border:1px solid #67bcdf;border-radius:6px;padding:9px 12px;font:600 13px system-ui;cursor:pointer;white-space:nowrap';
 status.textContent='Inventory + Bank · local only';status.setAttribute('role','status');status.style.cssText='overflow-wrap:anywhere;flex:1;min-width:120px';
 link.href='https://cptmundo.github.io/AQW-Companion/';link.textContent='Open Companion';link.target='_blank';link.rel='noopener noreferrer';link.style.cssText='display:none;color:#9bdcff';
 progress.hidden=true;progress.max=100;progress.setAttribute('aria-label','Inventory export progress');progress.style.cssText='flex:0 0 100%;width:100%;height:7px;margin:0;accent-color:#59c3e8;display:none';
 function showProgress(value,max=100,complete=false){
  progress.hidden=false;progress.style.display='block';progress.style.accentColor=complete?'#75e3a4':'#59c3e8';progress.max=max;
  if(value===null)progress.removeAttribute('value');else progress.value=value;
 }
 function updateProgress({phase,read,total}){
  if(phase==='connecting'){showProgress(null);status.textContent='Connecting to Inventory and Bank… Keep this page open.';}
  if(phase==='bulk'){showProgress(null);status.textContent='Reading '+total.toLocaleString()+' inventory records… Keep this page open.';}
  if(phase==='reading'){
   // A full read is not yet a saved export. Do not show 100% before acknowledgement.
   if(read===total){showProgress(null);status.textContent='Validating and preparing '+total.toLocaleString()+' records…';}
   else{showProgress(read,total);status.textContent='Reading Inventory and Bank… '+read.toLocaleString()+' / '+total.toLocaleString()+' records ('+Math.floor(read/total*100)+'%).';}
  }
 }
 panel.append(button,status,link,progress);root.append(panel);
 // Prefer a position above the actual inventory grid rather than underneath the browser popup.
 const grid=document.querySelector('.dx-datagrid, .dx-datagrid-headers, [role="grid"], table');
 if(grid?.parentElement){grid.parentElement.insertBefore(host,grid)}
 else{host.style.cssText='position:fixed;left:16px;bottom:16px;z-index:2147483647;max-width:calc(100vw - 32px)';document.body.append(host)}

 button.addEventListener('click',async e=>{
  if(!e.isTrusted||button.disabled)return;
  button.disabled=true;button.textContent='Exporting…';status.textContent='Reading Inventory and Bank… Keep this page open.';link.style.display='none';showProgress(null);
  try{
   const snapshot=await captureAccountInventory(updateProgress);
   showProgress(null);status.textContent='Saving export locally…';
   const result=await chrome.runtime.sendMessage({type:'account-stage',snapshot});
   if(!result?.ok)throw Error(result?.error||'Could not save export.');
   button.textContent='✓ Export ready';status.textContent=result.count.toLocaleString()+' records ready. Open Companion and select Import & Sync.';link.style.display='block';showProgress(100,100,true);
  }catch(err){progress.hidden=true;progress.style.display='none';button.textContent='Export to AQW Companion';status.textContent='Export failed: '+String(err?.message||err)+' Existing inventory unchanged.'}
  finally{button.disabled=false}
 });
 return true;
})();
