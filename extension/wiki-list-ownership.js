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
 const tag=String(el.tagName||'').toUpperCase();
 if(el.childElementCount>4&&!/^H[1-6]$/.test(tag))return null;
 const name=clean(el.textContent);
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
  if(sorted&&/^(P|STRONG|B|SPAN|H[1-6])$/.test(el.tagName)&&!(el.childElementCount>4)&&/^(?:auto[ -]updating list of|list of all)\b/i.test(clean(el.textContent))&&!el.querySelector?.('a[href]'))autoList=true;
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
async function checkAll(groups,category,send,onChunk,yieldFrame=()=>new Promise(resolve=>setTimeout(resolve,20)),isCancelled=()=>false){
 let syncedAt=null,exportedAt=null,offset=0;
 while(offset<groups.length){
  if(isCancelled())return;
  const chunk=groups.slice(offset,offset+80);
  const r=await send({type:'wiki-list-lookup',category,names:chunk.map(g=>g.name)});
  if(isCancelled())return;
  if(!r?.ok||!Array.isArray(r.matches)||r.matches.length!==chunk.length)throw Error('Inventory lookup unavailable');
  if(!r.syncedAt)throw Error('Inventory not synced. Import & Sync in Companion first.');
  if(syncedAt&&(r.syncedAt!==syncedAt||r.exportedAt!==exportedAt))throw Error('Inventory changed during check. Refresh ownership.');
  syncedAt=r.syncedAt;exportedAt=r.exportedAt;offset+=chunk.length;
  onChunk(chunk,r.matches,{offset,syncedAt,exportedAt});
  if(offset<groups.length)await yieldFrame();
 }
}
// Category pages only offer an explicit name search for Wishlist links.
// No ownership checks, snapshot lookups, inline badges or full-list annotation.
function init(){
 const category=categoryFor(location.pathname);
 if(location.origin!==origin||!category||document.getElementById('aqwc-list-wishlist'))return;
 const content=document.getElementById('page-content'),title=document.getElementById('page-title');if(!content||!title)return;
 const host=document.createElement('div');host.id='aqwc-list-wishlist';host.style.cssText='margin:8px 0';
 const shadow=host.attachShadow({mode:'closed'}),panel=document.createElement('div');panel.style.cssText='display:inline-block;padding:8px 12px;border:1px solid #38566d;border-radius:8px;background:#142b3e;color:#e5f5ff;font:600 13px/1.5 system-ui;max-width:100%;box-sizing:border-box';
 const ui=globalThis.AQWCWikiUI;ui?.decorate(shadow,panel,'Wishlist');if(ui)panel.style.cssText='max-width:460px';
 const heading=document.createElement('strong');heading.textContent='Wishlist search';
 const note=document.createElement('small');note.style.cssText='display:block;font-weight:400;color:#b6cddd';note.textContent='Find an item on this page and add it directly. No ownership scan.';
 const controls=document.createElement('div');controls.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin-top:5px';
 const search=document.createElement('input');search.type='search';search.placeholder='Item name';search.setAttribute('aria-label','Find item for Wishlist');search.style.cssText='padding:5px;background:#101d2c;border:1px solid #466781;border-radius:4px;color:#e5f5ff';
 function btn(text){const b=document.createElement('button');b.type='button';b.textContent=text;b.style.cssText='padding:5px 9px;border:1px solid #67bcdf;border-radius:6px;background:#214e70;color:#e5f7ff;cursor:pointer';return b}
 const find=btn('Find item'),results=document.createElement('div');results.style.cssText='max-height:240px;overflow:auto;margin-top:6px';
 const status=document.createElement('small');status.setAttribute('role','status');status.style.cssText='display:block;color:#b6cddd;font-weight:400';
 controls.append(search,find);panel.append(heading,note,controls,status,results);shadow.append(panel);(document.getElementById('aqwc-foundation-badge')||title).insertAdjacentElement('afterend',host);
 let groups=null;const queued=new Set();
 function renderSearch(){
  results.replaceChildren();const query=clean(search.value).toLowerCase();if(query.length<2){status.textContent='Enter at least 2 characters.';return}
  if(groups===null)groups=groupRows(collect(content,category,location.pathname.startsWith('/sort-by-')));
  const hits=groups.filter(g=>g.name.toLowerCase().includes(query));status.textContent=hits.length?hits.length+' matching items'+(hits.length>40?' · first 40':''):groups.length?'No matching items.':'No supported item links detected on this index.';
  for(const g of hits.slice(0,40)){
   const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:6px;margin:4px 0';
   const data={name:g.name,slug:[...g.slugs][0],category},a=document.createElement('a');a.href=origin+'/'+data.slug;a.textContent=g.name;a.style.color='#a9ddff';row.append(a);
   const target=globalThis.AQWCWikiWishlist?.target(data);
   if(g.slugs.size===1&&target&&!target.variant){
    const b=btn(queued.has(data.slug)?'✓':'+');b.disabled=queued.has(data.slug);b.title='Add to Wishlist without leaving Wiki';b.setAttribute('aria-label','Add '+data.name+' to Wishlist');
    b.addEventListener('click',async e=>{if(!e.isTrusted||b.disabled)return;b.disabled=true;try{const r=await chrome.runtime.sendMessage({type:'wishlist-queue-add',item:data});if(!r?.ok)throw Error(r?.error||'Could not save');queued.add(data.slug);b.textContent='✓';status.textContent='Saved locally; Companion imports it when open.'}catch(err){b.disabled=false;status.textContent=String(err?.message||err)}});
    row.append(b);
   }
   results.append(row);
  }
 }
 // Never enumerate the page on entry or while typing. Only explicit search.
 find.addEventListener('click',e=>{if(e.isTrusted)renderSearch()});
 search.addEventListener('keydown',e=>{if(e.isTrusted&&e.key==='Enter'){e.preventDefault();renderSearch()}});
}
globalThis.AQWCListOwnership=Object.freeze({categoryFor,candidate,sectionMarker,collect,groupRows,label,checkAll});
// Category directories no longer mount a separate Wishlist search card. Item detail actions remain available.
})();
