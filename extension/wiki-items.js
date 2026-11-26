(() => {
 'use strict';
 if(location.origin!=='https://aqwwiki.wikidot.com'||!/^\/[a-z0-9][a-z0-9-]*\/?$/.test(location.pathname))return;
 if(globalThis.AQWCListOwnership?.categoryFor(location.pathname))return;
 const title=document.getElementById('page-title'),content=document.getElementById('page-content');
 if(!title||!content||document.getElementById('aqwc-item-status'))return;
 const raw=String(content.textContent||'');
 if(!/\bSellback\s*:/i.test(raw)||!/\bDescription\s*:/i.test(raw))return;
 const body=String(content.innerText||raw);
 // Preserve original item text before the redesign collapses the native Notes.
 globalThis.AQWCOriginalItemText=raw;
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
 const card=document.createElement('div');card.style.cssText=(globalThis.AQWCTheme?.recolor('display:inline-block;max-width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid #38566d;border-radius:8px;background:#142b3e;color:#e5f5ff;font:600 13px/1.5 system-ui,sans-serif;')||'display:inline-block;max-width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid #38566d;border-radius:8px;background:#142b3e;color:#e5f5ff;font:600 13px/1.5 system-ui,sans-serif;');
 const ui=globalThis.AQWCWikiUI;ui?.decorate(shadow,card,'Personal item assistant');
 if(ui)card.style.cssText='';
 const itemTitle=document.createElement('h2');itemTitle.className='aqwc-title';itemTitle.textContent=name;
 const line=document.createElement('div'),note=document.createElement('small');line.className='aqwc-state';note.className='aqwc-meta';note.style.cssText=(globalThis.AQWCTheme?.recolor('display:block;color:#b6cddd;font-weight:400;margin-top:6px')||'display:block;color:#b6cddd;font-weight:400;margin-top:6px');
 line.setAttribute?.('role','status');const heading=document.createElement('div');heading.className='aqwc-item-heading';heading.append(itemTitle,line);card.append(heading,note);shadow.append(card);
 const show=(text,detail,color)=>{line.textContent=text;line.style.color=globalThis.AQWCTheme?.value(color,'color')||color;note.textContent=detail;note.hidden=!detail};
 const badge=document.getElementById('aqwc-foundation-badge');const mountStatus=()=>{if(ui)ui.mount(host,content,title);else (badge||title).insertAdjacentElement('afterend',host)};
 if(!category){ui?.styleItem?.(content);return}
 // Decorate actual large item illustrations only; preserve the Wiki image/link,
 // original dimensions and credit. No additional image requests.
 for(const img of content.querySelectorAll?.('img')||[]){
  const frame=()=>{if(img.naturalWidth>=200&&img.naturalHeight>=120&&!img.closest?.('.page-rate-widget-box,.wiki-content-table'))img.classList?.add('aqwc-showcase-image')};
  if(img.complete)frame();else img.addEventListener?.('load',frame,{once:true});
 }
 const stackable=['misc-items','use-items'].includes(category);
 const item={name,category,slug:location.pathname.replace(/^\/|\/$/g,'')},target=globalThis.AQWCWikiWishlist?.target(item);
 const actionable=!!target&&!target.variant;
 if(actionable){
  const actions=document.createElement('div');actions.className='aqwc-actions';
  const link=document.createElement('button');link.type='button';link.className='aqwc-primary';link.textContent='+ Add to Wishlist';link.style.cssText=(globalThis.AQWCTheme?.recolor('display:inline-block;margin-top:8px;padding:5px 9px;border:1px solid #67bcdf;border-radius:6px;background:#214e70;color:#e5f7ff;font:600 12px system-ui;cursor:pointer')||'display:inline-block;margin-top:8px;padding:5px 9px;border:1px solid #67bcdf;border-radius:6px;background:#214e70;color:#e5f7ff;font:600 12px system-ui;cursor:pointer');
  const wishlistNote=document.createElement('small');wishlistNote.style.cssText=(globalThis.AQWCTheme?.recolor('display:block;color:#b6cddd;font-weight:400;margin-top:3px')||'display:block;color:#b6cddd;font-weight:400;margin-top:3px');
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
  if(href){const view=document.createElement('a');view.href=href;view.target='_blank';view.rel='noopener noreferrer';view.textContent='View in Wishlist ↗';view.style.cssText=(globalThis.AQWCTheme?.recolor('display:inline-block;margin-top:5px;color:#a9ddff;font:600 11px system-ui')||'display:inline-block;margin-top:5px;color:#a9ddff;font:600 11px system-ui');actions.append(view)}
  card.append(actions);
 }
 let farmHint=null,refreshFarmHint=()=>{},isOwned=false;
 let farming,aligned=false;try{const api=globalThis.AQWCWikiMaterials;farming=api?.render(card,content,location.origin,hint=>{farmHint=hint;refreshFarmHint()});if(farming)aligned=!!ui?.mountFarm?.(farming,content,shadow);if(stackable&&api){const slug=location.pathname.replace(/^\/|\/$/g,'');api.renderSources(card,api.mergeSources(api.parseSources(content,location.origin),api.reviewedSources(slug)),location.origin,slug,{partial:!!api.reviewedSources(slug)})}}catch{console.warn('AQW Companion: material progress unavailable on this page.')}
 if(!actionable){
  // Keep the farming tool, but never reserve a branded status card without a usable Wishlist action.
  if(aligned){host.parentElement?.classList.add('aqwc-no-wishlist');host.remove()}
  else if(farming){card.replaceChildren(farming);host.id='aqwc-farm-only';content.prepend(host)}
  ui?.styleItem?.(content);return;
 }
 if(!aligned)mountStatus();ui?.styleItem?.(content);
 const stock=document.createElement('section');stock.className='aqwc-section aqwc-stock';stock.hidden=true;
 const stockHeading=document.createElement('strong');stockHeading.textContent='Your collection';
 const stockGrid=document.createElement('div');stockGrid.className='aqwc-stock-grid';
 const counts={};for(const label of ['Inventory','Bank','Total']){const cell=document.createElement('div'),caption=document.createElement('small'),value=document.createElement('strong');caption.textContent=label;value.textContent='—';counts[label]=value;cell.append(caption,value);stockGrid.append(cell)}stock.append(stockHeading,stockGrid);card.append(stock);
 const stockStyle=document.createElement('style');stockStyle.textContent='.aqwc-stock[hidden]{display:none!important}.aqwc-stock-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:8px}.aqwc-stock-grid>div{min-width:0;padding:6px;border:1px solid var(--aqwc-theme-line,#38566d);border-radius:7px;background:var(--aqwc-theme-panel,#162332)}.aqwc-stock-grid small{display:block;color:var(--aqwc-theme-muted,#b6cddd);font-size:10px}.aqwc-stock-grid strong{font-size:15px;color:var(--aqwc-theme-cyan,#a9ddff);overflow-wrap:anywhere}';shadow.append(stockStyle);

 const assistant=document.createElement('section');assistant.className='aqwc-section aqwc-insights';assistant.hidden=true;
 const labels={all:'All monsters',tagged:'All tagged',chaos:'Chaoskind',dragon:'Dragonkind',elemental:'Elementalkind',human:'Humankind',undead:'Undeadkind',drakath:'Drakathkind',orc:'Orckind',cp:'Class Points',gold:'Gold',rep:'Reputation',xp:'Experience'};
 const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n};
 const insight=(title)=>{const section=make('div','','aqwc-insight');section.append(make('strong',title));assistant.append(section);return section};
 const wikiLink=(label,slug)=>{const a=make('a',label);a.href=location.origin+'/'+slug;return a};
 const styles=make('style');styles.textContent='.aqwc-insights[hidden]{display:none!important}.aqwc-insight+.aqwc-insight{border-top:1px solid var(--aqwc-theme-line,#38566d);margin-top:10px;padding-top:10px}.aqwc-insight>strong{display:block;margin-bottom:6px}.aqwc-insight small{display:block;font-size:11px;font-weight:400;line-height:1.45;color:var(--aqwc-theme-muted,#b6cddd);margin-top:5px}.aqwc-insight-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:3px 8px;padding:6px 0;border-bottom:1px solid var(--aqwc-theme-line,#38566d)}.aqwc-insight-row>a{grid-column:1/-1;font-size:11px}.aqwc-insight-value{color:var(--aqwc-theme-cyan,#a9ddff);font-weight:700;text-align:right}.aqwc-insight a{color:var(--aqwc-theme-cyan,#a9ddff)}.aqwc-stock-grid{gap:4px!important}';shadow.append(styles);card.append(assistant);
 refreshFarmHint=()=>{
  assistant.querySelector?.('.aqwc-next-step')?.remove();
  if(farmHint&&!isOwned&&/^[a-z0-9][a-z0-9-]{0,199}$/.test(farmHint.slug)){
   const b=insight('Next missing ingredient');b.classList.add('aqwc-next-step');b.append(wikiLink(farmHint.name+' · '+farmHint.missing+' missing',farmHint.slug));
   const src=farmHint.source;for(const x of [...(src?.quests||[]),...(src?.drops||[])].slice(0,2)){if(/^[a-z0-9][a-z0-9-]{0,199}$/.test(x.slug))b.append(make('small','Listed source: '),wikiLink(x.name,x.slug))}
   const map=src?.locations?.find(x=>x.join&&/^[a-z0-9-]+$/i.test(x.join));
   if(map)globalThis.AQWCWikiMaterials?.joinControl(b,map,location.origin);
   b.append(make('small','Current recipe · direct ingredient, not an optimized farming order.'));
  }
  assistant.hidden=!assistant.children.length;
 };
 async function loadInsights(){try{
  const r=await chrome.runtime.sendMessage({type:'wiki-item-assistant',query:item});if(!r?.ok)return;
  assistant.replaceChildren();
  const c=r.comparison;
  if(c?.synced&&Object.keys(c.boost||{}).length){
   const b=insight('Is it worth farming?');let upgrades=0,unknown=0;
   for(const [k,v] of Object.entries(c.boost)){
    if(['chaos','dragon','elemental','human','undead'].includes(k)&&c.boost.tagged===v&&c.best[k]?.value===c.best.tagged?.value)continue;
    const row=make('div','','aqwc-insight-row'),best=c.best[k];if(!best)unknown++;else if(v>best.value)upgrades++;
    row.append(make('span',labels[k]||k),make('span','+'+v+'% / '+(best?'+'+best.value+'%':'—'),'aqwc-insight-value'));
    if(best)row.append(wikiLink('Best owned: '+best.name,best.slug));b.append(row);
   }
   b.append(make('small',upgrades?upgrades+' confirmed improvement(s) over matched items.':unknown?'Some owned alternatives could not be confirmed.':'No higher listed boost than your matched same-slot equipment.'));
   b.append(make('small','Item / best owned · same equipment slot · indexed boosts only; not a full loadout or stacking calculation.'));
  }
  if(r.goals?.rows?.length){const b=insight('Needed for your Wishlist');for(const g of r.goals.rows){const row=make('div','','aqwc-insight-row');row.append(make('span',g.name),make('span',g.missing===null?'Need '+g.target:g.missing?g.missing+' missing':'Stock ready','aqwc-insight-value'));b.append(row)}b.append(make('small','Known tracked requirements only. Stock is not reserved across projects.'))}
  refreshFarmHint();
 }catch{}}
 loadInsights();window.addEventListener('focus',loadInsights);
 const sync=document.createElement('div');sync.className='aqwc-sync';const dot=document.createElement('span');dot.className='aqwc-sync-dot';const syncCopy=document.createElement('div'),syncTitle=document.createElement('strong'),syncTime=document.createElement('small');syncTitle.textContent='Inventory snapshot';syncTime.textContent='Checking…';syncCopy.append(syncTitle,syncTime);sync.append(dot,syncCopy);card.append(sync);
 const foot=document.createElement('div');foot.className='aqwc-footer';const open=document.createElement('a');open.href='https://cptmundo.github.io/AQW-Companion/';open.target='_blank';open.rel='noopener noreferrer';open.textContent='Open Companion ↗';const local=document.createElement('span');local.textContent='Local snapshot · not live';foot.append(open,local);card.append(foot);
 show('Checking synced inventory…','','#b6dfff');
 const failed=()=>{syncTime.textContent='Unavailable · check extension';show('Inventory lookup unavailable','Reload AQW Companion extension and refresh this Wiki page. Check the extension popup.','#ffc2a8')};
 try{chrome.runtime.sendMessage({type:'wiki-item-lookup',query:{name,category}},result=>{
  if(chrome.runtime.lastError||!result?.ok){failed();return}
  if(result.state==='unsupported'){show('Item type not recognized','This item category is not yet supported.','#ffdb93');return}
  const date=result.syncedAt?new Date(result.syncedAt).toLocaleString():'';
  const freshness=date?'Synced: '+date:'';
  sync.setAttribute?.('data-synced',String(!!result.syncedAt));syncTitle.textContent=result.syncedAt?'Inventory synced':'Inventory not synced';syncTime.textContent=freshness||'Import & Sync in Companion';
  if(result.state==='owned'||result.state==='not-found'){
   const owned=result.state==='owned';for(const [label,key] of [['Inventory','inventory'],['Bank','bank'],['Total','total']])counts[label].textContent=owned&&Number.isFinite(result[key])?result[key].toLocaleString():owned?'—':'0';stock.hidden=!owned;
  }
  isOwned=result.state==='owned';refreshFarmHint();
  if(result.state==='owned'){
   show(stackable?'✓ Owned · '+result.total.toLocaleString()+' total':'✓ Owned',stackable?'Combined synced stock':'','#90edb5');
  }else if(result.state==='not-found')show(stackable?'0 total':'Not owned','','#ffc2a8');
  else if(result.state==='ambiguous')show('Possible match','Check the item variant in Companion.','#ffdb93');
  else if(result.state==='unsynced')show('Inventory not synced','Open AQW Companion and select Sync inventory to extension.','#b6dfff');
  else failed();
 });}catch{failed()}
})();
