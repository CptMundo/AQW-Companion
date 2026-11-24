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
function collect(content,category,sorted){
 // Canonical indexes have alphabetical headings; filtered indexes are commonly
 // Wikidot ListPages modules. No arbitrary links from prose or navigation.
 const rows=[];let inList=false;
 for(const el of content.querySelectorAll('h1,h2,h3,h4,h5,h6,a[href]')){
  if(/^H[1-6]$/.test(el.tagName)){inList=/^(?:[A-Z]|#|0-9)$/i.test(clean(el.textContent));continue}
  if(!inList&&!(sorted&&el.closest?.('.list-pages-box,.list-pages-item')))continue;
  const item=candidate(el,category);if(item)rows.push(item);
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
function init(){
 const category=categoryFor(location.pathname);
 if(location.origin!==origin||!category||document.getElementById('aqwc-list-ownership')||document.getElementById('aqwc-item-status')||document.getElementById('aqwc-quest-shop'))return;
 const content=document.getElementById('page-content'),title=document.getElementById('page-title');if(!content||!title)return;
 const crumb=document.getElementById('breadcrumbs')||document.querySelector('.breadcrumbs,#breadcrumb,.breadcrumb');
 if(crumb){const links=[...crumb.querySelectorAll('a[href]')];if(links.length&&!links.some(a=>{try{return new URL(a.getAttribute('href'),origin).pathname.replace(/^\/|\/$/g,'')==='items'}catch{return false}}))return}
 const groups=groupRows(collect(content,category,location.pathname.startsWith('/sort-by-')));
 if(!groups.length)return;
 const host=document.createElement('div');host.id='aqwc-list-ownership';host.style.cssText='margin:8px 0';
 const shadow=host.attachShadow({mode:'closed'}),panel=document.createElement('div');
 panel.style.cssText='display:inline-block;padding:8px 12px;border:1px solid #38566d;border-radius:8px;background:#142b3e;color:#e5f5ff;font:600 13px/1.5 system-ui;max-width:100%;box-sizing:border-box';
 const titleLine=document.createElement('strong');titleLine.textContent='Ownership Everywhere';
 const note=document.createElement('small');note.style.cssText='display:block;color:#b6cddd;font-weight:400';note.textContent='Local snapshot · name and category matching · '+groups.length.toLocaleString()+' candidate names';
 const controls=document.createElement('div');controls.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:5px';
 const search=document.createElement('input');search.type='search';search.placeholder='Filter item names';search.setAttribute('aria-label','Filter item names for ownership check');search.style.cssText='max-width:100%;padding:5px;background:#101d2c;border:1px solid #466781;border-radius:4px;color:#e5f5ff';
 function btn(text){const b=document.createElement('button');b.type='button';b.textContent=text;b.style.cssText='padding:5px 9px;border:1px solid #67bcdf;border-radius:6px;background:#214e70;color:#e5f7ff;cursor:pointer';return b}
 const show=btn('Show ownership'),next=btn('Check next 400'),clear=btn('Clear labels');next.hidden=true;clear.hidden=true;
 const status=document.createElement('small');status.setAttribute('role','status');status.style.cssText='display:block;color:#b6cddd;font-weight:400;margin-top:4px';
 controls.append(search,show,next,clear);panel.append(titleLine,note,controls,status);shadow.append(panel);(document.getElementById('aqwc-foundation-badge')||title).insertAdjacentElement('afterend',host);
 let selected=[],offset=0,syncedAt=null,exportedAt=null,busy=false,owned=0,unknown=0,absent=0;
 const labels=new Set();
 function reset(){for(const el of labels)el.remove();labels.clear();selected=[];offset=0;syncedAt=null;exportedAt=null;owned=0;unknown=0;absent=0;next.hidden=true;clear.hidden=true}
 function annotate(group,m){
  const l=label(m,group.slugs.size!==1);
  if(group.slugs.size!==1||!m||!['owned','not-found'].includes(m.state))unknown++;
  else if(m.state==='owned')owned++;else absent++;
  for(const a of group.anchors){
   if(!a.isConnected)continue;
   const el=document.createElement('span');el.setAttribute('data-aqwc-list-ownership','');
   const text=document.createElement('span');text.textContent=' '+l.text;text.title='AQW Companion local snapshot; name/category match, not a live account check';
   text.style.cssText='display:inline-block;margin-left:4px;padding:0 4px;border-radius:4px;background:#142b3e;color:'+l.color+';font:600 11px/1.5 system-ui';
   el.attachShadow({mode:'closed'}).append(text);a.insertAdjacentElement('afterend',el);labels.add(el)
  }
 }
 async function batch(){
  if(busy||!selected.length)return;
  busy=true;show.disabled=next.disabled=clear.disabled=search.disabled=true;status.textContent='Checking local inventory…';
  try{
   const batch=selected.slice(offset,offset+400),results=new Map();
   for(let i=0;i<batch.length;i+=80){
    const chunk=batch.slice(i,i+80),r=await chrome.runtime.sendMessage({type:'wiki-list-lookup',category,names:chunk.map(g=>g.name)});
    if(!r?.ok||!Array.isArray(r.matches)||r.matches.length!==chunk.length)throw Error('Inventory lookup unavailable');
    if(!r.syncedAt)throw Error('Inventory not synced. Import & Sync in Companion first.');
    if(syncedAt&&(r.syncedAt!==syncedAt||r.exportedAt!==exportedAt))throw Error('Inventory changed. Refresh ownership.');
    syncedAt=r.syncedAt;exportedAt=r.exportedAt;chunk.forEach((g,j)=>results.set(g.name,r.matches[j]));
   }
   batch.forEach(g=>annotate(g,results.get(g.name)));offset+=batch.length;
   status.textContent=offset.toLocaleString()+' / '+selected.length.toLocaleString()+' checked · '+owned+' owned · '+absent+' not in snapshot · '+unknown+' unknown · synced '+new Date(syncedAt).toLocaleString();
   next.hidden=offset>=selected.length;clear.hidden=false;show.textContent='Refresh ownership';
  }catch(err){reset();status.textContent=String(err?.message||err);show.textContent='Show ownership'}
  finally{busy=false;show.disabled=next.disabled=clear.disabled=search.disabled=false}
 }
 show.addEventListener('click',e=>{if(!e.isTrusted||busy)return;reset();const q=clean(search.value).toLowerCase();selected=groups.filter(g=>g.name.toLowerCase().includes(q));if(!selected.length){status.textContent='No matching candidate names.';return}batch()});
 next.addEventListener('click',e=>{if(e.isTrusted&&!busy)batch()});
 clear.addEventListener('click',e=>{if(!e.isTrusted||busy)return;reset();status.textContent='Labels cleared.';show.textContent='Show ownership'});
}
globalThis.AQWCListOwnership=Object.freeze({categoryFor,candidate,collect,groupRows,label});
if(typeof document!=='undefined')init();
})();
