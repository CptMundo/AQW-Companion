(() => {
 'use strict';
 if(location.origin!=='https://account.aq.com'||!/^\/AQW\/Inventory\/?$/i.test(location.pathname) )return false;
 if(document.getElementById('aqwc-account-export'))return true;
 const host=document.createElement('div');host.id='aqwc-account-export';host.style.cssText='display:block;box-sizing:border-box;margin:8px 0;max-width:100%';
 const root=host.attachShadow({mode:'closed'}),panel=document.createElement('section'),button=document.createElement('button'),status=document.createElement('div'),link=document.createElement('a');
 panel.style.cssText='background:#142b3e;color:#e5f5ff;border:1px solid #67bcdf;border-radius:9px;padding:7px 9px;display:flex;flex-wrap:wrap;align-items:center;gap:8px;font:13px/1.5 system-ui,sans-serif;box-shadow:0 3px 12px #0005';
 button.type='button';button.textContent='Export to AQW Companion';button.style.cssText='background:#214e70;color:white;border:1px solid #67bcdf;border-radius:6px;padding:9px 12px;font:600 13px system-ui;cursor:pointer;white-space:nowrap';
 status.textContent='Inventory + Bank · local only';status.setAttribute('role','status');status.style.cssText='overflow-wrap:anywhere;flex:1;min-width:120px';
 link.href='https://cptmundo.github.io/AQW-Companion/';link.textContent='Open Companion';link.target='_blank';link.rel='noopener noreferrer';link.style.cssText='display:none;color:#9bdcff';
 panel.append(button,status,link);root.append(panel);
 // Prefer a position above the actual inventory grid rather than underneath the browser popup.
 const grid=document.querySelector('.dx-datagrid, .dx-datagrid-headers, [role="grid"], table');
 if(grid?.parentElement){grid.parentElement.insertBefore(host,grid)}
 else{host.style.cssText='position:fixed;left:16px;bottom:16px;z-index:2147483647;max-width:calc(100vw - 32px)';document.body.append(host)}

 button.addEventListener('click',async e=>{
  if(!e.isTrusted||button.disabled)return;
  button.disabled=true;button.textContent='Exporting…';status.textContent='Reading Inventory and Bank… Keep this page open.';link.style.display='none';
  try{
   const snapshot=await captureAccountInventory();
   const result=await chrome.runtime.sendMessage({type:'account-stage',snapshot});
   if(!result?.ok)throw Error(result?.error||'Could not save export.');
   button.textContent='✓ Export ready';status.textContent=result.count.toLocaleString()+' records ready. Open Companion and select Import inventory.';link.style.display='block';
  }catch(err){button.textContent='Export to AQW Companion';status.textContent='Export failed: '+String(err?.message||err)+' Existing inventory unchanged.'}
  finally{button.disabled=false}
 });
 return true;
})();
