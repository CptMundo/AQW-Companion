(() => {
 const nav=[...document.querySelectorAll('.popup-nav [data-view]')],panels=[...document.querySelectorAll('[data-panel]')];
 function showView(view){if(!panels.some(p=>p.dataset.panel===view))return;const shell=document.querySelector('.panel-shell');if(shell)shell.scrollTop=0;for(const p of panels)p.hidden=p.dataset.panel!==view;for(const b of nav)b.setAttribute('aria-pressed',String(b.dataset.view===view));}
 for(const b of nav)b.addEventListener('click',e=>{if(e.isTrusted)showView(b.dataset.view)});
 for(const b of document.querySelectorAll('[data-go]'))b.addEventListener('click',e=>{if(e.isTrusted){showView(b.dataset.go);nav.find(n=>n.dataset.view===b.dataset.go)?.focus()}});
 showView('home');document.documentElement.setAttribute('data-aqwc-background','companion');
 const theme=globalThis.AQWCTheme,style=document.querySelector('style');if(theme&&style){style.textContent=theme.recolor(style.textContent)+theme.rootCss+"\nhtml:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) body{background:linear-gradient(145deg,var(--aqwc-theme-bgStart),var(--aqwc-theme-bgMid) 52%,var(--aqwc-theme-bgEnd));color:var(--aqwc-theme-txt)}\nhtml:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) header,html:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) section,html:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) details{background:var(--aqwc-theme-panel);border-color:var(--aqwc-theme-line)}\nhtml:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) .primary,html:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) #quick-search button,html:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) .popup-nav button[aria-pressed=\"true\"]{background:var(--aqwc-theme-selected);border-color:var(--aqwc-theme-selectedBorder);color:var(--aqwc-theme-txt)}\nhtml:is([data-aqwc-background=\"companion\"],[data-aqwc-background=\"dark\"],[data-aqwc-background=\"light\"],[data-aqwc-background=\"cas\"]) :is(input,select){background:var(--aqwc-theme-input)!important;color:var(--aqwc-theme-txt)!important;border-color:var(--aqwc-theme-line)!important}\n"+"\nhtml[data-aqwc-background=\"cas\"] button,html[data-aqwc-background=\"cas\"] .action{background:#ff00ff!important;color:#440066!important;border-color:#cf00cf!important}html[data-aqwc-background=\"cas\"] button[aria-label*=\"close\" i]{background:#00ffff!important}\n"+theme.lightPopupCss;}
 const status=document.getElementById('inventory-summary'),clear=document.getElementById('clear-inventory');
 const firstSync=document.getElementById('first-sync');
 function updateInventoryState(count){const empty=count===null;if(firstSync)firstSync.hidden=!empty;}
 function send(type){clear.disabled=true;chrome.runtime.sendMessage({type},result=>{
  clear.disabled=false;if(chrome.runtime.lastError||!result?.ok){status.textContent='Could not access local inventory.';return}
  updateInventoryState(result.count);status.setAttribute('data-synced',String(result.count!==null));status.textContent=result.count===null?'No inventory synced · optional setup':'Inventory synced · '+result.count.toLocaleString()+' records · '+new Date(result.syncedAt).toLocaleString();
 })}
 clear.addEventListener('click',()=>{if(confirm('Clear the extension copy? Your Companion inventory will not change.'))send('clear-inventory')});
 const bg=document.getElementById('appearance-background'),save=document.getElementById('appearance-save'),feedback=document.getElementById('appearance-status');
 if(bg&&save&&feedback){
  const fill=v=>{bg.value=v.background;document.documentElement.setAttribute('data-aqwc-background',v.background)};
  const enabled=v=>{save.disabled=!v};
  async function load(){try{const r=await chrome.runtime.sendMessage({type:'wiki-appearance-read'});if(!r?.ok)throw Error('Could not load preferences');fill(r.appearance);enabled(true);feedback.textContent='Choose a theme and apply. Companion is the default.'}catch(err){feedback.textContent=String(err?.message||err)}}
  async function persist(value){
   enabled(false);
   try{
    const r=await chrome.runtime.sendMessage({type:'wiki-appearance-save',appearance:value});if(!r?.ok)throw Error('Could not save preferences');fill(r.appearance);
    feedback.textContent=r.delivered?'Theme applied · '+r.delivered+' Wiki tab(s).':'Theme saved · refresh any Wiki tab left open from before this extension update.';
   }catch(err){feedback.textContent=String(err?.message||err)}finally{enabled(true)}
  }
  save.addEventListener('click',e=>{if(e.isTrusted&&!save.disabled)persist({background:bg.value,banner:'prometheus',panel:'integrated'})});
  load();
 }
 send('inventory-summary');
})();
