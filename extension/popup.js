(() => {
 const nav=[...document.querySelectorAll('.popup-nav [data-view]')],panels=[...document.querySelectorAll('[data-panel]')];
 function showView(view){if(!panels.some(p=>p.dataset.panel===view))return;for(const p of panels)p.hidden=p.dataset.panel!==view;for(const b of nav)b.setAttribute('aria-pressed',String(b.dataset.view===view));}
 for(const b of nav)b.addEventListener('click',e=>{if(e.isTrusted)showView(b.dataset.view)});
 for(const b of document.querySelectorAll('[data-go]'))b.addEventListener('click',e=>{if(e.isTrusted){showView(b.dataset.go);nav.find(n=>n.dataset.view===b.dataset.go)?.focus()}});
 showView('home');document.documentElement.setAttribute('data-aqwc-background','companion');
 const theme=globalThis.AQWCTheme,style=document.querySelector('style');if(theme&&style){style.textContent=theme.recolor(style.textContent)+theme.rootCss+"\nhtml:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) body{background:linear-gradient(145deg,var(--aqwc-theme-bgStart),var(--aqwc-theme-bgMid) 52%,var(--aqwc-theme-bgEnd));color:var(--aqwc-theme-txt)}\nhtml:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) header,html:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) section,html:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) details{background:var(--aqwc-theme-panel);border-color:var(--aqwc-theme-line)}\nhtml:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) .primary,html:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) #quick-search button,html:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) .popup-nav button[aria-pressed=\"true\"]{background:var(--aqwc-theme-selected);border-color:var(--aqwc-theme-selectedBorder);color:var(--aqwc-theme-txt)}\nhtml:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) :is(input,select){background:var(--aqwc-theme-input)!important;color:var(--aqwc-theme-txt)!important;border-color:var(--aqwc-theme-line)!important}\n"+"\nhtml[data-aqwc-background=\"cas\"] button,html[data-aqwc-background=\"cas\"] .action{background:#ff00ff!important;color:#440066!important;border-color:#cf00cf!important}html[data-aqwc-background=\"cas\"] button[aria-label*=\"close\" i]{background:#00ffff!important}\n"+theme.lightPopupCss;}
 const status=document.getElementById('inventory-summary'),clear=document.getElementById('clear-inventory');
 const firstSync=document.getElementById('first-sync'),searchPanel=document.getElementById('inventory-search-panel');
 function updateInventoryState(count){const empty=count===null;if(firstSync)firstSync.hidden=!empty;if(searchPanel)searchPanel.hidden=empty;}
 function send(type){clear.disabled=true;chrome.runtime.sendMessage({type},result=>{
  clear.disabled=false;if(chrome.runtime.lastError||!result?.ok){status.textContent='Could not access local inventory.';return}
  updateInventoryState(result.count);status.setAttribute('data-synced',String(result.count!==null));status.textContent=result.count===null?'No inventory synced · optional setup':'Inventory synced · '+result.count.toLocaleString()+' records · '+new Date(result.syncedAt).toLocaleString();
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
 const bg=document.getElementById('appearance-background'),save=document.getElementById('appearance-save'),reset=document.getElementById('appearance-reset'),feedback=document.getElementById('appearance-status');
 if(bg&&save&&reset&&feedback){
  const fill=v=>{bg.value=v.background;document.documentElement.setAttribute('data-aqwc-background',v.background)};
  const enabled=v=>{save.disabled=reset.disabled=!v};
  async function load(){try{const r=await chrome.runtime.sendMessage({type:'wiki-appearance-read'});if(!r?.ok)throw Error('Could not load preferences');fill(r.appearance);enabled(true);feedback.textContent='Choose a theme and apply. Companion is the default.'}catch(err){feedback.textContent=String(err?.message||err)}}
  async function persist(value){
   enabled(false);
   try{
    const r=await chrome.runtime.sendMessage({type:'wiki-appearance-save',appearance:value});if(!r?.ok)throw Error('Could not save preferences');fill(r.appearance);
    feedback.textContent='Saved. Applies on your next Wiki page load.';
    try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(Number.isInteger(tab?.id)&&new URL(tab.url).origin==='https://aqwwiki.wikidot.com'){const ack=await chrome.tabs.sendMessage(tab.id,{type:'aqwc-appearance-preview',appearance:r.appearance},{frameId:0});feedback.textContent=ack?.artworkLoaded===true?'Theme applied · check the Wiki.':ack?.artworkLoaded===false?'Saved · image could not load. Check extension files.':ack?.applied?'Theme applied · check the Wiki.':ack?.bannerTarget?'Saved · banner CSS not confirmed. Try disabling competing Wiki themes.':'Saved · refresh the Wiki page to apply.'}}catch{}
   }catch(err){feedback.textContent=String(err?.message||err)}finally{enabled(true)}
  }
  save.addEventListener('click',e=>{if(e.isTrusted&&!save.disabled)persist({background:bg.value,banner:'prometheus',panel:'integrated'})});
  reset.addEventListener('click',e=>{if(e.isTrusted&&!reset.disabled)persist({background:'companion',banner:'prometheus',panel:'integrated'})});
  load();
 }
 send('inventory-summary');
})();
