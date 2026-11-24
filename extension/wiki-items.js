(() => {
 'use strict';
 if(location.origin!=='https://aqwwiki.wikidot.com'||!/^\/[a-z0-9][a-z0-9-]*\/?$/.test(location.pathname))return;
 if(globalThis.AQWCListOwnership?.categoryFor(location.pathname))return;
 const title=document.getElementById('page-title'),content=document.getElementById('page-content');
 if(!title||!content||document.getElementById('aqwc-item-status'))return;
 const raw=String(content.textContent||'');
 if(!/\bSellback\s*:/i.test(raw)||!/\bDescription\s*:/i.test(raw))return;
 const body=String(content.innerText||raw);
 if(/\busually refers to\s*:/i.test(body)||!/\bSellback\s*:/i.test(body)||!/\bDescription\s*:/i.test(body))return;
 const name=String(title.innerText||title.textContent||'').trim();if(!name||name.length>350)return;
 const crumb=document.getElementById('breadcrumbs')||document.querySelector?.('.breadcrumbs, #breadcrumb, .breadcrumb');
 const labelKey=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const aliases={'misc items':'misc-items','capes back items':'capes-back-items','helmets hoods':'helmets-hoods','battle pets':'battle-pets','floor items':'floor-items','wall items':'wall-items','use items':'use-items','hand guns':'handguns'};
 const supported=new Set(['swords','axes','bows','daggers','gauntlets','guns','handguns','maces','polearms','rifles','staffs','wands','weapons','classes','armors','capes-back-items','capes','helmets-hoods','helmets','pets','battle-pets','misc-items','use-items','grounds','necklaces','houses','floor-items','wall-items','housing','enhancements']);
 const categoryOf=(slug,label)=>[slug,aliases[labelKey(label)],labelKey(label).replace(/ /g,'-')].find(x=>supported.has(x));
 const links=Array.from(crumb?.querySelectorAll('a[href]')||[]).map(a=>{
  try{const u=new URL(a.href,location.href);return {slug:u.origin===location.origin?u.pathname.replace(/^\/|\/$/g,''):'',label:a.textContent||''}}catch{return {slug:'',label:''}}
 }).filter(x=>x.slug);
 const start=links.findIndex(x=>x.slug==='items'||labelKey(x.label)==='items');
 // Never fall back on an explicitly non-item breadcrumb such as Shops.
 if(links.length&&start<0)return;
 let category=start>=0?links.slice(start+1).map(x=>categoryOf(x.slug,x.label)).filter(Boolean).at(-1):null;
 // Some Wiki themes/variants lack the standard breadcrumb selector. Require both
 // item-detail fields above, then use an explicit Type field or specific item tag.
 if(!category){
  const types={item:'misc-items','use item':'use-items',class:'classes',armor:'armors',cape:'capes',helm:'helmets',pet:'pets',sword:'swords',axe:'axes',bow:'bows',dagger:'daggers',staff:'staffs',mace:'maces',gun:'guns',polearm:'polearms',wand:'wands',gauntlet:'gauntlets',rifle:'rifles',handgun:'handguns',weapon:'weapons',misc:'misc-items',ground:'grounds',necklace:'necklaces'};
  const match=body.match(/\bType\s*:\s*([a-z ]+?)(?=\s*(?:\n|;|Description\s*:|Rarity\s*:|Notes\s*:|$))/i);
  if(match)category=types[labelKey(match[1])];
  if(!category){
   const tags=Array.from(document.querySelectorAll?.('.page-tags a, #page-tags a')||[]).map(a=>labelKey(a.textContent));
   const candidates=[...new Set(tags.map(x=>types[x]).filter(Boolean))];
   if(candidates.length===1)category=candidates[0];
  }
  if(!category&&/\bBase Damage\s*:/i.test(body)&&/\(Sword\)$/i.test(name))category='swords';
 }
 const host=document.createElement('div');host.id='aqwc-item-status';
 host.style.cssText='display:block;margin:8px 0;max-width:100%';
 const shadow=host.attachShadow({mode:'closed'});
 const card=document.createElement('div');card.style.cssText='display:inline-block;max-width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid #38566d;border-radius:8px;background:#142b3e;color:#e5f5ff;font:600 13px/1.5 system-ui,sans-serif;';
 const ui=globalThis.AQWCWikiUI;ui?.decorate(shadow,card,'Item overview');
 if(ui)card.style.cssText='';
 const itemTitle=document.createElement('h2');itemTitle.className='aqwc-title';itemTitle.textContent=name;
 const line=document.createElement('div'),note=document.createElement('small');line.className='aqwc-state';note.className='aqwc-meta';note.style.cssText='display:block;color:#b6cddd;font-weight:400;margin-top:6px';
 line.setAttribute?.('role','status');const heading=document.createElement('div');heading.className='aqwc-item-heading';heading.append(itemTitle,line);card.append(heading,note);shadow.append(card);
 const show=(text,detail,color)=>{line.textContent=text;line.style.color=color;note.textContent=detail;note.hidden=!detail};
 const badge=document.getElementById('aqwc-foundation-badge');if(ui)ui.mount(host,content,title);else (badge||title).insertAdjacentElement('afterend',host);
 if(!category){show('Item type not recognized','AQW Companion could not identify this Wiki category.','#ffdb93');return}
 const stackable=['misc-items','use-items'].includes(category);
 const item={name,category,slug:location.pathname.replace(/^\/|\/$/g,'')},target=globalThis.AQWCWikiWishlist?.target(item);
 if(target){
  const actions=document.createElement('div');actions.className='aqwc-actions';
  const link=document.createElement('button');link.type='button';link.className='aqwc-primary';link.textContent='+ Add to Wishlist';link.style.cssText='display:inline-block;margin-top:8px;padding:5px 9px;border:1px solid #67bcdf;border-radius:6px;background:#214e70;color:#e5f7ff;font:600 12px system-ui;cursor:pointer';
  const wishlistNote=document.createElement('small');wishlistNote.style.cssText='display:block;color:#b6cddd;font-weight:400;margin-top:3px';
  if(target.variant){link.disabled=true;wishlistNote.textContent='Ambiguous item variant; direct addition is not supported.'}
  link.addEventListener('click',async e=>{
   if(!e.isTrusted||link.disabled)return;
   link.disabled=true;link.textContent='Saving…';
   try{
    const r=await chrome.runtime.sendMessage({type:'wishlist-queue-add',item});
    if(!r?.ok)throw Error(r?.error||'Could not save item.');
    link.textContent='✓ Saved to Wishlist queue';wishlistNote.textContent='Saved locally. Companion imports it automatically when open.';
   }catch(err){link.disabled=false;link.textContent='+ Add to Wishlist';wishlistNote.textContent=String(err?.message||err);queued=false}
  });
  const goal=document.createElement('small');goal.className='aqwc-goal-state';let queued=false;
  async function readGoal(){if(document.hidden)return;try{const r=await chrome.runtime.sendMessage({type:'goal-status-read',query:{kind:'item',name:target.name||name}});if(!r?.ok)return;if(r.state==='saved'){queued=false;goal.textContent='In Wishlist · '+r.progress+'% tracked · last synced '+new Date(r.at).toLocaleTimeString();link.textContent='✓ In Wishlist';link.disabled=true}else if(r.state==='absent'&&!queued&&!target.variant){goal.textContent='Wishlist status · last synced '+new Date(r.at).toLocaleTimeString();link.textContent='+ Add to Wishlist';link.disabled=false}else if(r.state==='unknown'){goal.textContent='Wishlist status unavailable · open Companion to sync'}}catch{}}
  link.addEventListener('click',e=>{if(e.isTrusted)queued=true});actions.append(link,wishlistNote,goal);readGoal();window.addEventListener('focus',readGoal);const goalTimer=setInterval(readGoal,10000);window.addEventListener('pagehide',()=>clearInterval(goalTimer),{once:true});
  const href=!target.variant?globalThis.AQWCWikiWishlist?.build(item):null;
  if(href){const view=document.createElement('a');view.href=href;view.target='_blank';view.rel='noopener noreferrer';view.textContent='View in Wishlist ↗';view.style.cssText='display:inline-block;margin-top:5px;color:#a9ddff;font:600 11px system-ui';actions.append(view)}
  card.append(actions);
 }
 let farming;try{const api=globalThis.AQWCWikiMaterials;farming=api?.render(card,content,location.origin);if(stackable&&api){const slug=location.pathname.replace(/^\/|\/$/g,'');api.renderSources(card,api.mergeSources(api.parseSources(content,location.origin),api.reviewedSources(slug)),location.origin,slug,{partial:!!api.reviewedSources(slug)})}}catch{console.warn('AQW Companion: material progress unavailable on this page.')}
 const marker=Array.from(content.querySelectorAll?.('strong,b')||[]).find(el=>/^Location\s*:\s*$/i.test(String(el.textContent||'').trim()));
 if(marker){const section=document.createElement('section');section.className='aqwc-section';const heading=document.createElement('strong');heading.textContent='Source / Location';section.append(heading);let n=marker.nextSibling,count=0;while(n&&count++<10&&n.nodeName!=='BR'&&n.nodeName!=='STRONG'&&n.nodeName!=='B'){if(n.nodeType===3){const value=String(n.textContent||'').trim();if(value){const span=document.createElement('span');span.textContent=' '+value+' ';section.append(span)}}else if(n.nodeName==='A'){try{const u=new URL(n.getAttribute('href'),location.href);if(u.origin===location.origin){const a=document.createElement('a');a.href=u.href;a.textContent=n.textContent;section.append(a)}}catch{}}n=n.nextSibling}if(section.children.length>1)card.append(section)}
 const sync=document.createElement('div');sync.className='aqwc-sync';const dot=document.createElement('span');dot.className='aqwc-sync-dot';const syncCopy=document.createElement('div'),syncTitle=document.createElement('strong'),syncTime=document.createElement('small');syncTitle.textContent='Inventory snapshot';syncTime.textContent='Checking…';syncCopy.append(syncTitle,syncTime);sync.append(dot,syncCopy);card.append(sync);
 const foot=document.createElement('div');foot.className='aqwc-footer';const open=document.createElement('a');open.href='https://cptmundo.github.io/AQW-Companion/';open.target='_blank';open.rel='noopener noreferrer';open.textContent='Open Companion ↗';const local=document.createElement('span');local.textContent='Local data · Read only';foot.append(open,local);card.append(foot);
 show('Checking synced inventory…','','#b6dfff');
 const failed=()=>{syncTime.textContent='Unavailable · check extension';show('Inventory lookup unavailable','Reload AQW Companion extension and refresh this Wiki page. Check the extension popup.','#ffc2a8')};
 try{chrome.runtime.sendMessage({type:'wiki-item-lookup',query:{name,category}},result=>{
  if(chrome.runtime.lastError||!result?.ok){failed();return}
  if(result.state==='unsupported'){show('Item type not recognized','This item category is not yet supported.','#ffdb93');return}
  const date=result.syncedAt?new Date(result.syncedAt).toLocaleString():'';
  const freshness=date?'Synced: '+date:'';
  sync.setAttribute?.('data-synced',String(!!result.syncedAt));syncTitle.textContent=result.syncedAt?'Inventory synced':'Inventory not synced';syncTime.textContent=freshness||'Import & Sync in Companion';
  if(result.state==='owned'){
   show(stackable?'✓ Owned · '+result.total.toLocaleString()+' total':'✓ Owned',stackable?'Combined synced stock':'','#90edb5');
  }else if(result.state==='not-found')show(stackable?'0 total':'Not owned','','#ffc2a8');
  else if(result.state==='ambiguous')show('Possible match','Check the item variant in Companion.','#ffdb93');
  else if(result.state==='unsynced')show('Inventory not synced','Open AQW Companion and select Sync inventory to extension.','#b6dfff');
  else failed();
 });}catch{failed()}
})();
