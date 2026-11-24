(() => {
 const status=document.getElementById('inventory-summary'),clear=document.getElementById('clear-inventory');
 function send(type){clear.disabled=true;chrome.runtime.sendMessage({type},result=>{
  clear.disabled=false;if(chrome.runtime.lastError||!result?.ok){status.textContent='Could not access local inventory.';return}
  status.setAttribute('data-synced',String(result.count!==null));status.textContent=result.count===null?'No inventory synced yet.':'Inventory synced · '+result.count.toLocaleString()+' records · '+new Date(result.syncedAt).toLocaleString();
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
 const bg=document.getElementById('appearance-background'),banner=document.getElementById('appearance-banner'),panel=document.getElementById('appearance-panel'),save=document.getElementById('appearance-save'),reset=document.getElementById('appearance-reset'),feedback=document.getElementById('appearance-status');
 if(bg&&banner&&panel&&save&&reset&&feedback){
  const fill=v=>{bg.value=v.background;banner.value=v.banner;panel.value=v.panel};
  const enabled=v=>{save.disabled=reset.disabled=!v};
  async function load(){try{const r=await chrome.runtime.sendMessage({type:'wiki-appearance-read'});if(!r?.ok)throw Error('Could not load preferences');fill(r.appearance);enabled(true);feedback.textContent='Choose a theme and apply.'}catch(err){feedback.textContent=String(err?.message||err)}}
  async function persist(value){
   enabled(false);
   try{
    const r=await chrome.runtime.sendMessage({type:'wiki-appearance-save',appearance:value});if(!r?.ok)throw Error('Could not save preferences');fill(r.appearance);
    feedback.textContent='Saved. Applies on your next Wiki page load.';
    try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(Number.isInteger(tab?.id)&&new URL(tab.url).origin==='https://aqwwiki.wikidot.com'){await chrome.tabs.sendMessage(tab.id,{type:'aqwc-appearance-preview',appearance:r.appearance},{frameId:0});feedback.textContent='Saved. Applied to the current Wiki page if supported.'}}catch{}
   }catch(err){feedback.textContent=String(err?.message||err)}finally{enabled(true)}
  }
  save.addEventListener('click',e=>{if(e.isTrusted&&!save.disabled)persist({background:bg.value,banner:banner.value,panel:panel.value})});
  reset.addEventListener('click',e=>{if(e.isTrusted&&!reset.disabled)persist({background:'original',banner:'original',panel:'integrated'})});
  load();
 }
 send('inventory-summary');
})();
