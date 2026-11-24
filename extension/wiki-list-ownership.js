/* Local ownership labels for recognized item category indexes. */
(()=>{
'use strict';
const origin='https://aqwwiki.wikidot.com';
const categories=['helmets-hoods','capes-back-items','battle-pets','misc-items','use-items','floor-items','wall-items','enhancements','classes','armors','swords','axes','bows','daggers','gauntlets','guns','handguns','maces','polearms','rifles','staffs','wands','pets','grounds','necklaces','houses'];
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
function categoryFor(path){
 const slug=String(path||'').replace(/^\/|\/$/g,'');
 if(categories.includes(slug))return slug;
 if(!/^sort-by-[a-z0-9-]+$/.test(slug))return null;
 return categories.find(c=>slug.endsWith('-'+c))||null;
}
function candidate(a,category){
 const name=clean(a?.textContent);
 if(!name||name.length>350||/^(back to top|sort by|[a-z]|#|next|previous)$/i.test(name)||a.querySelector?.('img')||a.closest?.('#breadcrumbs,.breadcrumbs,#breadcrumb,.breadcrumb,.page-tags,.pager,.pagination'))return null;
 let u;try{u=new URL(a.getAttribute('href'),origin)}catch{return null}
 if(u.origin!==origin||u.search||u.hash||!/^\/[a-z0-9][a-z0-9-]{0,199}\/?$/.test(u.pathname))return null;
 const slug=u.pathname.replace(/^\/|\/$/g,'');
 if(categoryFor(u.pathname)||['items','weapons','housing','world','shops','quests','monsters','locations','npcs','factions','search','search-items-by-tag','start','key','glossary','system','list-of-all-tags'].includes(slug)||slug===category)return null;
 return {name,slug,anchor:a};
}
function sectionMarker(el){
 const tag=String(el.tagName||'').toUpperCase(),name=clean(el.textContent);
 const letter=/^(?:[A-Z]|#|0-9)$/i;
 if(/^H[1-6]$/.test(tag))return letter.test(name)?'start':'end';
 if(tag==='A'){
  // Named jump targets are not item links and may be empty.
  if(el.getAttribute('href')!==null)return null;
  const target=clean(el.getAttribute('name')||el.getAttribute('id'));
  return letter.test(target)?'start':null;
 }
 if(!/^(P|STRONG|B|SPAN|DIV)$/.test(tag))return null;
 if(el.closest?.('a[href],#breadcrumbs,.breadcrumbs,#breadcrumb,.breadcrumb,.page-tags,.pager,.pagination'))return null;
 // The live indexes use plain letter separators, not always H1-H6.
 // Do not interpret linked alphabetical navigation as a section marker.
 if(letter.test(name)&&!el.querySelector?.('a[href]'))return 'start';
 return null;
}
function collect(content,category,sorted){
 const rows=[];let inList=false,autoList=false;
 for(const el of content.querySelectorAll('h1,h2,h3,h4,h5,h6,p,strong,b,span,div,a[name],a[id],a[href]')){
  if(el.tagName==='A'&&el.getAttribute('href')!==null){
   if(/^back to top$/i.test(clean(el.textContent))){inList=false;autoList=false;continue}
   if(!inList&&!(sorted&&(autoList||el.closest?.('.list-pages-box,.list-pages-item'))))continue;
   const item=candidate(el,category);if(item)rows.push(item);
   continue;
  }
  if(sorted&&/^(?:auto[ -]updating list of|list of all)\b/i.test(clean(el.textContent))&&/^(P|STRONG|B|SPAN|H[1-6])$/.test(el.tagName)&&!el.querySelector?.('a[href]'))autoList=true;
  const marker=sectionMarker(el);
  if(marker==='start')inList=true;
  if(marker==='end'){inList=false;autoList=false}
 }
 return rows;
}
function groupRows(rows){
 const byName=new Map();
 for(const row of rows){
  if(!byName.has(row.name))byName.set(row.name,{name:row.name,slugs:new Set(),anchors:[]});
  const g=byName.get(row.name);g.slugs.add(row.slug);g.anchors.push(row.anchor);
 }
 return [...byName.values()];
}
function label(match,duplicate=false){
 if(duplicate||!match||!['owned','not-found'].includes(match.state))return {text:'? Unknown',color:'#ffdb93'};
 if(match.state==='not-found')return {text:'Not in snapshot',color:'#b6cddd'};
 const place=match.inventory&&match.bank?'Inventory + Bank':match.bank?'Bank':'Inventory';
 return {text:'✓ '+place+' ×'+Number(match.total).toLocaleString(),color:'#90edb5'};
}
async function checkAll(groups,category,send,onChunk,yieldFrame=()=>new Promise(resolve=>setTimeout(resolve,0))){
 let syncedAt=null,exportedAt=null,offset=0;
 while(offset<groups.length){
  const chunk=groups.slice(offset,offset+80);
  const r=await send({type:'wiki-list-lookup',category,names:chunk.map(g=>g.name)});
  if(!r?.ok||!Array.isArray(r.matches)||r.matches.length!==chunk.length)throw Error('Inventory lookup unavailable');
  if(!r.syncedAt)throw Error('Inventory not synced. Import & Sync in Companion first.');
  if(syncedAt&&(r.syncedAt!==syncedAt||r.exportedAt!==exportedAt))throw Error('Inventory changed during check. Refresh ownership.');
  syncedAt=r.syncedAt;exportedAt=r.exportedAt;offset+=chunk.length;
  onChunk(chunk,r.matches,{offset,syncedAt,exportedAt});
  if(offset<groups.length)await yieldFrame();
 }
}
function init(){
 const category=categoryFor(location.pathname);
 if(location.origin!==origin||!category||document.getElementById('aqwc-list-ownership')||document.getElementById('aqwc-item-status')||document.getElementById('aqwc-quest-shop'))return;
 const content=document.getElementById('page-content'),title=document.getElementById('page-title');if(!content||!title)return;
 const crumb=document.getElementById('breadcrumbs')||document.querySelector('.breadcrumbs,#breadcrumb,.breadcrumb');
 if(crumb){const links=[...crumb.querySelectorAll('a[href]')];if(links.length&&!links.some(a=>{try{return new URL(a.getAttribute('href'),origin).pathname.replace(/^\/|\/$/g,'')==='items'}catch{return false}}))return}
 const groups=groupRows(collect(content,category,location.pathname.startsWith('/sort-by-')));
 const host=document.createElement('div');host.id='aqwc-list-ownership';host.style.cssText='margin:8px 0';
 const shadow=host.attachShadow({mode:'closed'}),panel=document.createElement('div');
 panel.style.cssText='display:inline-block;padding:8px 12px;border:1px solid #38566d;border-radius:8px;background:#142b3e;color:#e5f5ff;font:600 13px/1.5 system-ui;max-width:100%;box-sizing:border-box';
 const titleLine=document.createElement('strong');titleLine.textContent='Ownership Everywhere';
 const note=document.createElement('small');note.style.cssText='display:block;color:#b6cddd;font-weight:400';note.textContent='Local snapshot · name and category matching · '+groups.length.toLocaleString()+' candidate names';
 const controls=document.createElement('div');controls.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:5px';
 const search=document.createElement('input');search.type='search';search.placeholder='Filter item names';search.setAttribute('aria-label','Filter item names for ownership check');search.style.cssText='max-width:100%;padding:5px;background:#101d2c;border:1px solid #466781;border-radius:4px;color:#e5f5ff';
 function btn(text){const b=document.createElement('button');b.type='button';b.textContent=text;b.style.cssText='padding:5px 9px;border:1px solid #67bcdf;border-radius:6px;background:#214e70;color:#e5f7ff;cursor:pointer';return b}
 const show=btn('Refresh ownership'),clear=btn('Clear labels');clear.hidden=true;
 const status=document.createElement('small');status.setAttribute('role','status');status.style.cssText='display:block;color:#b6cddd;font-weight:400;margin-top:4px';
 controls.append(search,show,clear);panel.append(titleLine,note,controls,status);shadow.append(panel);(document.getElementById('aqwc-foundation-badge')||title).insertAdjacentElement('afterend',host);
 if(!groups.length){search.disabled=show.disabled=true;status.textContent='No supported item links detected on this index. Refresh the page; if this persists, report the page URL.';return}
 let busy=false,owned=0,unknown=0,absent=0;
 const labels=new Set();
 function reset(){for(const el of labels)el.remove();labels.clear();owned=0;unknown=0;absent=0;clear.hidden=true}
 const results=document.createElement('div');results.style.cssText='max-height:240px;overflow:auto;margin-top:6px';results.hidden=true;panel.append(results);
 const matched=new Map(),queued=new Set();
 function makeAdd(data){
  const b=btn(queued.has(data.slug)?'✓':'+');b.disabled=queued.has(data.slug);b.title='Add to Wishlist without leaving Wiki';b.setAttribute('aria-label','Add '+data.name+' to Wishlist');b.style.cssText='display:inline-block;margin-left:4px;padding:0 5px;border:1px solid #466781;border-radius:4px;background:#19334a;color:#a9ddff;cursor:pointer;font:600 12px system-ui';
  b.addEventListener('click',async e=>{if(!e.isTrusted||b.disabled)return;b.disabled=true;try{const r=await chrome.runtime.sendMessage({type:'wishlist-queue-add',item:data});if(!r?.ok)throw Error(r?.error||'Could not save');queued.add(data.slug);b.textContent='✓';b.title='Saved locally; imported automatically when Companion is open.'}catch(err){b.disabled=false;b.title=String(err?.message||err);status.textContent=b.title}});
  return b;
 }
 function renderSearch(){
  const query=clean(search.value).toLowerCase();results.replaceChildren();results.hidden=!query;if(!query)return;
  const hits=groups.filter(g=>g.name.toLowerCase().includes(query));
  if(!hits.length){results.textContent='No items found on this page.';return}
  const note=document.createElement('small');note.textContent=hits.length+' matching items'+(hits.length>40?' · first 40':'');results.append(note);
  for(const g of hits.slice(0,40)){
   const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:6px;margin:4px 0';
   const a=document.createElement('a');a.href=origin+'/'+[...g.slugs][0];a.textContent=g.name;a.style.color='#a9ddff';row.append(a);
   const m=matched.get(g.name),s=document.createElement('small');s.textContent=m?label(m,g.slugs.size!==1).text:'Checking…';row.append(s);
   const data={name:g.name,slug:[...g.slugs][0],category},target=globalThis.AQWCWikiWishlist?.target(data);
   if(g.slugs.size===1&&target&&!target.variant)row.append(makeAdd(data));results.append(row);
  }
 }
 search.addEventListener('input',renderSearch);
 search.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();renderSearch()}});
 function annotate(group,m){
  matched.set(group.name,m);
  const l=label(m,group.slugs.size!==1);
  if(group.slugs.size!==1||!m||!['owned','not-found'].includes(m.state))unknown++;
  else if(m.state==='owned')owned++;else absent++;
  for(const a of group.anchors){
   if(!a.isConnected)continue;
   const el=document.createElement('span');el.setAttribute('data-aqwc-list-ownership','');el.style.cssText='display:inline;white-space:nowrap';
   const text=document.createElement('span');text.textContent=' '+l.text;text.title=m?.possible?.length?'Possible inventory variant: '+m.possible.join(', ')+' — exact variant not verified':'AQW Companion local snapshot; name/category match, not a live account check';
   text.style.cssText='display:inline-block;margin-left:4px;padding:0 4px;border-radius:4px;background:#142b3e;color:'+l.color+';font:600 11px/1.5 system-ui';
   const shadow=el.attachShadow({mode:'closed'});shadow.append(text);
   if(group.slugs.size===1){
    const data={name:group.name,slug:[...group.slugs][0],category},target=globalThis.AQWCWikiWishlist?.target(data);
    if(target&&!target.variant){
     const plus=makeAdd(data);shadow.append(plus)
    }
   }
   a.insertAdjacentElement('afterend',el);labels.add(el)
  }
 }
 async function scan(query=''){
  if(busy)return;
  reset();matched.clear();const selected=groups;
  if(!selected.length){status.textContent='No matching candidate names.';return}
  busy=true;show.disabled=clear.disabled=true;
  status.textContent='Checking 0 / '+selected.length.toLocaleString()+' local inventory names…';
  try{
   await checkAll(selected,category,msg=>chrome.runtime.sendMessage(msg),(chunk,matches,progress)=>{
    chunk.forEach((g,i)=>annotate(g,matches[i]));
    status.textContent=progress.offset.toLocaleString()+' / '+selected.length.toLocaleString()+' checked · '+owned+' owned · '+absent+' not in snapshot · '+unknown+' unknown · synced '+new Date(progress.syncedAt).toLocaleString();
   });
   clear.hidden=false;renderSearch();
  }catch(err){reset();status.textContent=String(err?.message||err)}
  finally{busy=false;show.disabled=clear.disabled=search.disabled=false}
 }
 show.addEventListener('click',e=>{if(e.isTrusted&&!busy)scan()});
 clear.addEventListener('click',e=>{if(!e.isTrusted||busy)return;reset();matched.clear();renderSearch();status.textContent='Labels cleared. Refresh ownership to check again.'});
 // Local read-only comparison on recognized category pages. No network requests,
 // no new permissions, and no simulated click or write to the inventory.
 scan();

}
globalThis.AQWCListOwnership=Object.freeze({categoryFor,candidate,sectionMarker,collect,groupRows,label,checkAll});
if(typeof document!=='undefined')init();
})();
