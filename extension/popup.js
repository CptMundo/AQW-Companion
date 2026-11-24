// activeTab is granted by the user opening the extension popup.
// Never inject automatically, into another origin, or into subframes.
async function activateWiki(api){
 const tabs=await api.tabs.query({active:true,currentWindow:true});
 const tab=tabs[0];
 if(!tab||!Number.isInteger(tab.id)||typeof tab.url!=='string')throw Error('Open an AQW Wiki page first.');
 const url=new URL(tab.url);
 if(url.origin!=='https://aqwwiki.wikidot.com'||!/^\/[a-z0-9][a-z0-9-]*\/?$/.test(url.pathname))throw Error('Open a supported AQW Wiki page first.');
 // Probe the current top-level document. Pin the actual document ID so a
 // navigation during activation cannot inject tools into a replacement page.
 const probe=await api.scripting.executeScript({target:{tabId:tab.id},func:expected=>location.href===expected&&!!document.getElementById('page-title')&&!!document.getElementById('page-content'),args:[tab.url]});
 const frame=probe.find(x=>x.frameId===0);
 if(!frame?.result||!frame.documentId)throw Error('The Wiki page changed, is unsupported, or is still loading. Try again.');
 await api.scripting.executeScript({target:{tabId:tab.id,documentIds:[frame.documentId]},files:['bridge.js','wishlist-link.js','wiki-materials.js','wiki-list-ownership.js','wiki-items.js','wiki-quest-shop.js']});
}
(() => {
 const status=document.getElementById('inventory-summary'),clear=document.getElementById('clear-inventory');
 const activate=document.getElementById('activate-wiki'),activationStatus=document.getElementById('wiki-activation-status');
 if(activate&&activationStatus)activate.addEventListener('click',async e=>{
  if(!e.isTrusted||activate.disabled)return;activate.disabled=true;activationStatus.textContent='Activating Wiki tools…';
  try{await activateWiki(chrome);activationStatus.textContent='Activated for this page only. Return to the Wiki.'}
  catch(err){activationStatus.textContent=String(err?.message||err)}finally{activate.disabled=false}
 });
 function send(type){clear.disabled=true;chrome.runtime.sendMessage({type},result=>{
  clear.disabled=false;if(chrome.runtime.lastError||!result?.ok){status.textContent='Could not access local inventory.';return}
  status.textContent=result.count===null?'No inventory synced yet.':result.count.toLocaleString()+' inventory records · '+new Date(result.syncedAt).toLocaleString();
 })}
 clear.addEventListener('click',()=>{if(confirm('Clear the extension copy? Your Companion inventory will not change.'))send('clear-inventory')});
 const form=document.getElementById('quick-search'),query=document.getElementById('quick-query'),loc=document.getElementById('quick-location'),results=document.getElementById('quick-results'),notice=document.getElementById('quick-status');
 if(form&&query&&loc&&results&&notice)form.addEventListener('submit',async e=>{
  e.preventDefault();if(!e.isTrusted)return;
  const term=query.value.trim();results.replaceChildren();if(term.length<2){notice.textContent='Enter at least 2 characters.';return}
  const button=form.querySelector('button');button.disabled=true;notice.textContent='Searching local inventory…';
  try{
   const r=await chrome.runtime.sendMessage({type:'inventory-search',query:term,location:loc.value});
   if(!r?.ok||!Array.isArray(r.rows))throw Error('Search unavailable.');
   if(!r.syncedAt){notice.textContent='No inventory synced yet.';return}
   notice.textContent=r.total+' matching records'+(r.total>r.rows.length?' · first '+r.rows.length:'')+' · synced '+new Date(r.syncedAt).toLocaleString();
   for(const row of r.rows){const div=document.createElement('div'),name=document.createElement('strong'),meta=document.createElement('small');name.textContent=row.name;meta.textContent=row.type+' · '+(row.bank?'Bank':'Inventory')+' ×'+row.count.toLocaleString();meta.style.display='block';div.style.cssText='padding:5px 0;border-bottom:1px solid #38566d';div.append(name,meta);results.append(div)}
  }catch(err){notice.textContent=String(err?.message||err)}finally{button.disabled=false}
 });
 send('inventory-summary');
})();
