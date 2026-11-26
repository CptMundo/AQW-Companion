(() => {
 'use strict';
 if(location.origin!=='https://aqwwiki.wikidot.com'||!/^\/[a-z0-9][a-z0-9-]*\/?$/.test(location.pathname))return;
 if(globalThis.AQWCListOwnership?.categoryFor(location.pathname))return;
 const title=document.getElementById('page-title'),content=document.getElementById('page-content');
 if(!title||!content||document.getElementById('aqwc-item-status'))return;
 const raw=String(content.textContent||'');
 const body=String(content.innerText||raw),fields=raw+'\n'+body;
 const standard=/\bSellback\s*:/i.test(fields)&&/\bDescription\s*:/i.test(fields);
 const itemFields=['Location','Price','Rarity','Description','Sellback','Base Damage','Type'].filter(k=>new RegExp('\\b'+k+'\\s*:', 'i').test(fields));
 if(!standard&&itemFields.length<2)return;
 // Preserve original item text before the redesign collapses the native Notes.
 globalThis.AQWCOriginalItemText=raw;
 if(/\busually refers to\s*:/i.test(body))return;
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
 if(!standard&&(!category||start<0))return;
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
 const ui=globalThis.AQWCWikiUI;ui?.decorate(shadow,card,'Smart item hub');
 if(ui)card.style.cssText='';
 const itemTitle=document.createElement('h2');itemTitle.className='aqwc-title';itemTitle.textContent=name;
 const line=document.createElement('div'),note=document.createElement('small');line.className='aqwc-state';note.className='aqwc-meta';note.style.cssText=(globalThis.AQWCTheme?.recolor('display:block;color:#b6cddd;font-weight:400;margin-top:6px')||'display:block;color:#b6cddd;font-weight:400;margin-top:6px');
 line.setAttribute?.('role','status');const heading=document.createElement('div');heading.className='aqwc-item-heading';heading.append(itemTitle,line);card.append(heading,note);shadow.append(card);
 const show=(text,detail,color)=>{line.textContent=text;line.style.color=globalThis.AQWCTheme?.value(color,'color')||color;note.textContent=detail;note.hidden=!detail};
 const badge=document.getElementById('aqwc-foundation-badge');const mountStatus=()=>{if(ui)ui.mount(host,content,title);else (badge||title).insertAdjacentElement('afterend',host)};
 if(!category){show('Item type unavailable','Original Wiki details remain accessible.','#ffdb93');ui?.styleItem?.(content,host);return}
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
 const related=[];const relatedSeen=new Set();
 // Only explicit native Wiki relationship statements, never fuzzy name guesses.
 for(const li of content.querySelectorAll?.('li,p')||[]){
  const lead=[...li.childNodes].filter(n=>n.nodeType===3||['STRONG','B','EM'].includes(n.tagName)).map(n=>n.textContent).join(' ').trim();
  const kind=/\b(?:used to (?:merge|unlock|access)|required (?:to|for)|unlocks?)\b/i.test(lead)?'unlock':/\b(?:also see|see also|related items)\b/i.test(lead)?'related':null;
  if(!kind)continue;
  for(const a of li.querySelectorAll('a[href]'))try{const u=new URL(a.href,location.href),slug=u.pathname.replace(/^\/|\/$/g,''),label=a.textContent.trim();if(u.origin!==location.origin||u.hash||! /^[a-z0-9][a-z0-9-]{0,199}$/.test(slug)||slug===item.slug||!label||label.length>350||relatedSeen.has(slug))continue;related.push({name:label,slug,kind});relatedSeen.add(slug)}catch{}
 }
 let farmHint=null,farmPlan=null,refreshFarmHint=()=>{},isOwned=false,ownershipKnown=false;
 let farming,aligned=false;try{const api=globalThis.AQWCWikiMaterials;farming=api?.render(card,content,location.origin,(hint,plan)=>{farmHint=hint;farmPlan=plan;refreshFarmHint()});if(farming)aligned=!!ui?.mountFarm?.(farming,content,shadow);if(stackable&&api){const slug=location.pathname.replace(/^\/|\/$/g,'');api.renderSources(card,api.mergeSources(api.parseSources(content,location.origin),api.reviewedSources(slug)),location.origin,slug,{partial:!!api.reviewedSources(slug)})}}catch{console.warn('AQW Companion: material progress unavailable on this page.')}
 if(!actionable){
  // Keep a consistent assistant surface but never guess variant ownership or enable an ambiguous Wishlist action.
  show('Variant / unsupported item','Wishlist and ownership are not verified for this item variant. Check the original Wiki details.','#ffdb93');
  if(ui?.styleItem)ui.styleItem(content,host);
  return;
 }
 if(ui?.styleItem)ui.styleItem(content,host);else if(!aligned)mountStatus();

 const stock=document.createElement('small');stock.className='aqwc-meta';stock.hidden=true;card.append(stock);
 const assistant=document.createElement('section');assistant.className='aqwc-section aqwc-insights';assistant.hidden=true;
 const labels={all:'All monsters',tagged:'All tagged',chaos:'Chaoskind',dragon:'Dragonkind',elemental:'Elementalkind',human:'Humankind',undead:'Undeadkind',drakath:'Drakathkind',orc:'Orckind',cp:'Class Points',gold:'Gold',rep:'Reputation',xp:'Experience'};
 const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n};
 const wikiLink=(label,slug)=>{const a=make('a',label);a.href=location.origin+'/'+slug;return a};
 const styles=make('style');styles.textContent='.aqwc-insights[hidden]{display:none!important}.aqwc-insight+.aqwc-insight{border-top:1px solid var(--aqwc-theme-line,#38566d);margin-top:10px;padding-top:10px}.aqwc-insight>strong{display:block;margin-bottom:6px}.aqwc-insight small{display:block;font-size:11px;font-weight:400;line-height:1.45;color:var(--aqwc-theme-muted,#b6cddd);margin-top:5px}.aqwc-insight-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:3px 8px;padding:6px 0;border-bottom:1px solid var(--aqwc-theme-line,#38566d)}.aqwc-insight-row>a{grid-column:1/-1;font-size:11px}.aqwc-insight-value{color:var(--aqwc-theme-cyan,#a9ddff);font-weight:700;text-align:right}.aqwc-insight a{color:var(--aqwc-theme-cyan,#a9ddff)}';shadow.append(styles);card.append(assistant);

 const hubStyle=make('style');hubStyle.textContent="/* Smart Hub: one surface, readable rows and restrained accents. */\n.aqwc-card .aqwc-insights{background:transparent!important;border:0!important;border-top:1px solid var(--aqwc-theme-line,#38566d)!important;border-radius:0;padding:14px 0 0;margin:14px 0 0;display:grid;gap:8px}\n.aqwc-insights[hidden],.aqwc-hub-panel[hidden]{display:none!important}\n.aqwc-hub-head{font-size:15px;font-weight:750;line-height:1.35;color:var(--aqwc-theme-txt,#e5f5ff);margin:0 0 3px}\n.aqwc-hub-panel{min-width:0;margin:0;padding:0;border:1px solid var(--aqwc-theme-line,#38566d);border-radius:10px;background:var(--aqwc-theme-panel2,#1b3041);overflow:hidden}\n.aqwc-hub-panel>summary{display:flex;align-items:center;justify-content:space-between;gap:9px;cursor:pointer;list-style:none;padding:11px 12px;font-size:13px;font-weight:700;line-height:1.45;color:var(--aqwc-theme-txt,#e5f5ff)}\n.aqwc-hub-panel>summary::-webkit-details-marker{display:none}\n.aqwc-hub-panel>summary::after{content:\"\";width:7px;height:7px;flex:none;border-right:1.7px solid currentColor;border-bottom:1.7px solid currentColor;transform:rotate(45deg);margin:0 3px 3px 0;opacity:.75}\n.aqwc-hub-panel[open]>summary::after{transform:rotate(225deg);margin-bottom:-3px}\n.aqwc-hub-panel>summary:hover{background:var(--aqwc-theme-hover,#263d50)}\n.aqwc-hub-panel>summary:focus-visible,.aqwc-hub-panel :is(select,textarea,button,a):focus-visible{outline:2px solid var(--aqwc-theme-focus,#87e4ff);outline-offset:-3px}\n.aqwc-hub-panel>div{padding:0 12px 12px;margin:0;min-width:0}\n.aqwc-hub-panel:not([open])>div{display:none}\n.aqwc-hub-row{display:flex;flex-wrap:wrap;align-items:center;gap:4px 7px;padding:9px 0;border-bottom:1px solid var(--aqwc-theme-line,#38566d);min-width:0}\n.aqwc-hub-row>.aqwc-hub-name{flex:1 1 140px;min-width:0;font-size:13px;font-weight:650;line-height:1.45;overflow-wrap:anywhere;margin:0}\n.aqwc-card .aqwc-hub-row>a.aqwc-hub-name{color:var(--aqwc-theme-cyan,#91dfff)!important;text-decoration:none}\n.aqwc-card .aqwc-hub-row>a.aqwc-hub-name:hover{text-decoration:underline}\n.aqwc-hub-row>small{flex:1 0 100%;margin:0}\n.aqwc-hub-panel small,.aqwc-hub-status{display:block;font-size:11.5px;font-weight:400;line-height:1.55;color:var(--aqwc-theme-muted,#b6cddd);overflow-wrap:anywhere}\n.aqwc-hub-panel>div>small{margin:8px 0 0}\n.aqwc-hub-tag{flex:none;display:inline-flex;align-items:center;border:1px solid var(--aqwc-theme-line,#38566d);border-radius:5px;padding:2px 6px;font-size:10.5px;font-weight:650;line-height:1.4;color:var(--aqwc-theme-txt,#e5f5ff);background:var(--aqwc-theme-panel,#142b3e);max-width:100%}\n.aqwc-hub-tag[data-tone=\"ready\"]{color:var(--aqwc-hub-positive,#75e0ac);border-color:currentColor}\n:host-context(html[data-aqwc-background=\"light\"]){--aqwc-hub-positive:#176a46;color-scheme:light}\n.aqwc-hub-panel select,.aqwc-hub-panel textarea{display:block;width:100%;box-sizing:border-box;background:var(--aqwc-theme-input,#162332);color:var(--aqwc-theme-txt,#e5f5ff);border:1px solid var(--aqwc-theme-line,#38566d);border-radius:7px;padding:9px;font:500 12px/1.45 system-ui;margin:3px 0 9px}\n.aqwc-hub-panel textarea{resize:vertical;min-height:76px}\n.aqwc-hub-panel button,.aqwc-hub-action{font:650 12px system-ui;color:var(--aqwc-theme-cyan,#a9ddff);background:var(--aqwc-theme-panel,#162332);border:1px solid var(--aqwc-theme-line,#38566d);border-radius:7px;padding:8px 10px;cursor:pointer}\n.aqwc-hub-panel button:disabled{opacity:.6;cursor:not-allowed}\n.aqwc-hub-boost-result{margin:0 0 4px}\n.aqwc-card .aqwc-hub-boost-result>strong{display:block;font-size:22px;line-height:1.25;letter-spacing:-.025em;color:var(--aqwc-theme-txt,#e5f5ff);padding:9px 10px;margin:0 0 3px;background:var(--aqwc-theme-panel,#142b3e);border-radius:7px;font-variant-numeric:tabular-nums}\n.aqwc-hub-boost-result>small{margin-top:8px}\n.aqwc-card .aqwc-hub-boost-result>a{display:inline-block;font-size:11.5px;font-weight:600;margin-top:5px;color:var(--aqwc-theme-cyan,#91dfff)!important}\n.aqwc-card>.aqwc-hub-panel{margin-top:10px;background:transparent}\n.aqwc-card:has(.aqwc-hub-head)>.aqwc-sync strong{color:var(--aqwc-theme-txt,#e5f5ff)}\n.aqwc-card:has(.aqwc-hub-head)>.aqwc-sync small,.aqwc-card:has(.aqwc-hub-head)>.aqwc-footer{color:var(--aqwc-theme-muted,#b6cddd)}\n";shadow.append(hubStyle);
 const panel=(title,open=false)=>{const d=make('details','','aqwc-hub-panel'),summary=make('summary',title),body=make('div');d.open=open;d.append(summary,body);assistant.append(d);return body};
 const row=(parent,title,detail,href)=>{const r=make('div','','aqwc-hub-row');if(href){const a=make('a',title,'aqwc-hub-name');a.href=href;r.append(a)}else r.append(make('strong',title,'aqwc-hub-name'));if(detail)r.append(make('small',detail));parent.append(r);return r};
 const tag=(r,label,ready=false)=>{const t=make('span',label,'aqwc-hub-tag');if(ready)t.setAttribute('data-tone','ready');r.insertBefore(t,r.children[1]||null);return t};
 const status=(state)=>state==='owned'?'Owned':state==='not-found'?'Not in snapshot':'Ownership unverified';
 const safeSource=s=>typeof s==='string'&&/^https:\/\/aqwwiki\.wikidot\.com\/[a-z0-9][a-z0-9-]*$/.test(s)?s:null;
 const localHref=slug=>location.origin+'/'+slug;
 let latest=null,requestId=0,refreshTimer=null,activePlanKey='';
 const prefs={loadout:'all'};
 const notesPanel=make('details','','aqwc-hub-panel');notesPanel.append(make('summary','My notes & priority'));
 const notesBody=make('div'),notesText=make('textarea'),notesPriority=make('select'),save=make('button','Save note'),notice=make('small','Private to this browser extension.');notesText.maxLength=1500;notesText.placeholder='Farming notes, reminders…';notesText.setAttribute('aria-label','Personal item notes');notesPriority.setAttribute('aria-label','Priority');for(const [v,t] of [['normal','Normal priority'],['high','High priority'],['low','Low priority']]){const o=make('option',t);o.value=v;notesPriority.append(o)}save.type='button';save.disabled=true;notesBody.append(notesText,notesPriority,save,notice);notesPanel.append(notesBody);card.append(notesPanel);
 chrome.runtime.sendMessage({type:'hub-note-read',slug:item.slug}).then(r=>{if(!r?.ok){notice.textContent='Notes unavailable.';return}notesText.value=r.note?.text||'';notesPriority.value=r.note?.priority||'normal';save.disabled=false}).catch(()=>{notice.textContent='Notes unavailable.'});
 save.addEventListener('click',async e=>{if(!e.isTrusted)return;save.disabled=true;try{const r=await chrome.runtime.sendMessage({type:'hub-note-save',slug:item.slug,text:notesText.value,priority:notesPriority.value});notice.textContent=r?.ok?'Saved locally.':r?.error||'Could not save.'}catch{notice.textContent='Could not save.'}finally{save.disabled=false}});
 function renderHub(){
  const previous=new Map([...assistant.querySelectorAll('details')].map(d=>[d.querySelector('summary').textContent,d.open]));
  assistant.replaceChildren();const h=latest?.hub,c=latest?.comparison;
  const headline=make('div',isOwned?'What your item unlocks':'Plan your next move','aqwc-hub-head');assistant.append(headline);
  if(farmPlan&&!isOwned&&ownershipKnown){
   const p=panel('Farming plan · '+farmPlan.label,true),known=farmPlan.ingredients.every(m=>Number.isFinite(m.missing)),ready=farmPlan.ingredients.filter(m=>m.missing===0).length;
   p.append(make('strong',farmPlan.unlock?'Unlock item found — check reward shop':ready+'/'+farmPlan.ingredients.length+' direct ingredients ready'));
   if(!farmPlan.unlock&&known&&ready===farmPlan.ingredients.length&&!farmPlan.incomplete)p.append(make('small','Stock ready. Shop, quest, level and other unlock requirements are not verified.'));
   if(farmPlan.incomplete||!known)p.append(make('small','Some requirements or stock are unknown.'));
   for(const m of farmPlan.ingredients.filter(x=>x.missing!==0).slice(0,5)){const r=row(p,m.name,m.missing===null?'Stock unverified':m.missing+' missing',localHref(m.slug));for(const src of (m.source?.quests||[]).slice(0,1))if(/^[a-z0-9][a-z0-9-]{0,199}$/.test(src.slug)){const a=wikiLink('Quest: '+src.name+' ↗',src.slug);r.append(a)}const map=m.source?.locations?.find(x=>x.join&&/^[a-z0-9-]+$/i.test(x.join));if(map)globalThis.AQWCWikiMaterials?.joinControl(r,map,location.origin)}
   if(farmPlan.ingredients.filter(m=>m.missing!==0).length>5)p.append(make('small','More ingredients in Farming Progress.'));
   const copy=make('button','Copy farming checklist');copy.type='button';p.append(copy);copy.addEventListener('click',async e=>{if(!e.isTrusted)return;const text=[name+' — '+farmPlan.label,...farmPlan.ingredients.map(m=>m.name+': '+(m.missing===null?'check stock':m.missing+' missing')+' / '+m.target+(m.source?.locations?.find(x=>x.join)?' · /join '+m.source.locations.find(x=>x.join).join:''))].join('\n');try{await navigator.clipboard.writeText(text);copy.textContent='Copied ✓'}catch{copy.textContent='Copy unavailable'}});
   p.append(make('small','Track the item with Add to Wishlist above. Open a quest link to pin it in Quest Tracker.'));
  }
  if(h?.recipes?.length){const p=panel('Used in recipes ('+h.recipes.length+')',true);for(const r of h.recipes){const label=r.owned==='owned'?'Owned':r.stockReady?'Ingredients ready':r.ready+'/'+r.total+' ingredients ready';const el=row(p,r.name,'Uses '+r.required+' × this item'+(r.tracked?' · In Wishlist':''),safeSource(r.source));tag(el,label,r.owned==='owned'||r.stockReady);if(r.owned!=='owned'&&!r.stockReady&&r.materials?.length)el.append(make('small',r.materials.map(m=>m.name+': '+(m.missing===null?'?':m.missing+' missing')).join(' · ')))}p.append(make('small','Based on '+h.recipeCount+' reviewed recipes. Links may open the merge shop. Ready stock does not confirm access.'))}
  if(h?.related?.length){const p=panel('Related items & unlocks ('+h.related.length+')',!h.recipes?.length);for(const r of h.related)row(p,r.name,r.kind==='unlock'?'Wiki unlock · check requirements':'Related item · '+status(r.state),localHref(r.slug));p.append(make('small','Wiki links only · not a complete evolution tree.'))}
  if(latest?.goals?.rows?.length){const p=panel('Needed for your Wishlist',true);for(const g of latest.goals.rows)row(p,g.name,g.progress+'% tracked · '+(g.missing===null?'Need '+g.target:g.missing?g.missing+' missing':'Stock ready'));p.append(make('small','Known tracked requirements. Stock is not reserved across projects.'))}
  if(h?.spending?.length&&!isOwned&&ownershipKnown){const p=panel('Before you spend these materials',true);for(const r of h.spending)row(p,r.goal,r.material+' · '+r.extra+' extra to farm after this recipe');p.append(make('small','Hypothetical consumption of all direct ingredients; quests may only check ownership. No inventory changes.'))}
  if(c?.synced&&Object.keys(c.boost||{}).length&&!isOwned&&ownershipKnown){const p=panel('Boost upgrade check');for(const [k,v] of Object.entries(c.boost)){if(['chaos','dragon','elemental','human','undead'].includes(k)&&c.boost.tagged===v&&c.best[k]?.value===c.best.tagged?.value)continue;const best=c.best[k];row(p,labels[k]||k,'This item +'+v+'% · '+(best?'owned +'+best.value+'% ('+best.name+')':'owned alternative unknown'),best?localHref(best.slug):null)}p.append(make('small','Same-slot indexed boosts only.'))}
  if(h?.loadouts&&Object.keys(h.loadouts).length&&(!stackable&&['swords','axes','bows','daggers','gauntlets','guns','handguns','maces','polearms','rifles','staffs','wands','weapons','armors','capes-back-items','capes','helmets-hoods','helmets','pets','battle-pets'].includes(category))){const p=panel('Best owned boost combination',!h.recipes?.length&&!h.related?.length),selector=make('select'),output=make('div','','aqwc-hub-boost-result');selector.setAttribute('aria-label','Choose boost or monster type');for(const k of Object.keys(h.loadouts)){const option=make('option',labels[k]||k);option.value=k;selector.append(option)}selector.value=Object.hasOwn(h.loadouts,prefs.loadout)?prefs.loadout:Object.keys(h.loadouts)[0];const draw=()=>{prefs.loadout=selector.value;output.replaceChildren();const r=h.loadouts[selector.value];output.append(make('strong','+'+r.percent+'% '+(labels[selector.value]||selector.value)));for(const gear of r.gear)row(output,gear.name,gear.category.replace(/-/g,' '),localHref(gear.slug));output.append(make('small','Indexed owned gear only. Retrieve bank items to equip them. Excludes class stats, enhancements and timed boosts.'));const ref=make('a','Official boost rules ↗');ref.href='https://www.aq.com/Lore/Guides/AQWBoosts';ref.target='_blank';ref.rel='noopener noreferrer';output.append(ref)};selector.addEventListener('change',draw);p.append(selector,output);draw()}
  if(!h?.goalsSynced)assistant.append(make('small','Open Companion to refresh Wishlist context.','aqwc-hub-status'));
  if(!assistant.querySelector('details'))assistant.append(make('small','No further verified opportunities in the current catalog.','aqwc-hub-status'));
  for(const d of assistant.querySelectorAll('details')){const t=d.querySelector('summary').textContent;if(previous.has(t))d.open=previous.get(t)}
  assistant.hidden=false;
 }
 async function loadInsights(){const id=++requestId;try{const r=await chrome.runtime.sendMessage({type:'wiki-item-assistant',query:item,related,ingredients:(farmPlan?.ingredients||[]).map(m=>({name:m.name,target:m.target}))});if(id!==requestId||!r?.ok)return;latest=r;renderHub()}catch{}}
 refreshFarmHint=()=>{renderHub();const key=JSON.stringify(farmPlan?.ingredients?.map(m=>[m.name,m.target])||[]);if(key!==activePlanKey){activePlanKey=key;clearTimeout(refreshTimer);refreshTimer=setTimeout(loadInsights,100)}};
 loadInsights();window.addEventListener('focus',loadInsights);
 const sync=document.createElement('div');sync.className='aqwc-sync';sync.style.cssText='padding:5px 0;border:0;background:transparent;';const dot=document.createElement('span');dot.className='aqwc-sync-dot';const syncCopy=document.createElement('div'),syncTitle=document.createElement('strong'),syncTime=document.createElement('small');syncTitle.textContent='Inventory snapshot';syncTime.textContent='Checking…';syncCopy.append(syncTitle,syncTime);sync.append(dot,syncCopy);card.append(sync);
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
   const owned=result.state==='owned';stock.textContent=owned?'Inventory: '+result.inventory+' · Bank: '+result.bank+' · Total: '+result.total:'';stock.hidden=!owned;
  }
  isOwned=result.state==='owned';ownershipKnown=['owned','not-found'].includes(result.state);refreshFarmHint();
  if(result.state==='owned'){
   show(stackable?'✓ Owned · '+result.total.toLocaleString()+' total':'✓ Owned',stackable?'Combined synced stock':'','#90edb5');
  }else if(result.state==='not-found')show(stackable?'0 total':'Not owned','','#ffc2a8');
  else if(result.state==='ambiguous')show('Possible match','Check the item variant in Companion.','#ffdb93');
  else if(result.state==='unsynced')show('Inventory not synced','Open AQW Companion and select Sync inventory to extension.','#b6dfff');
  else failed();
 });}catch{failed()}
})();
