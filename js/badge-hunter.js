'use strict';
(function(root){
const KEY='aqwc-badge-hunter-v1',validStates=['tracked','owned'];
function serverDay(now=new Date()){return new Date(now.getTime()-5*3600000).toISOString().slice(0,10)}
function availability(b,day=serverDay()){
 if(b.kind==='legacy')return 'Rare / historical';
 if(b.kind==='unknown')return 'Availability unconfirmed';
 if(b.kind!=='seasonal')return 'Requirements documented';
 if(!b.window)return 'Return unconfirmed';
 return day<b.window.start?'Announced':day<=b.window.end?'Within announced dates':'Window ended';
}
function clean(value,catalog){
 if(!value||typeof value!=='object'||Array.isArray(value))return {};
 const ids=new Set(catalog.map(b=>b.id));return Object.fromEntries(Object.entries(value).filter(([id,state])=>ids.has(id)&&validStates.includes(state)));
}
function update(value,id,state,catalog){
 const next=clean(value,catalog);if(!catalog.some(b=>b.id===id)||!['unmarked',...validStates].includes(state))return next;
 if(state==='unmarked')delete next[id];else next[id]=state;return next;
}
function opportunities(catalog,state,day=serverDay()){return catalog.filter(b=>b.kind==='seasonal'&&availability(b,day)==='Within announced dates'&&state[b.id]!=='owned')}
function filterBadges(catalog,state,query='',category='all',status='all',day=serverDay()){
 const q=query.trim().toLowerCase();return catalog.filter(b=>(category==='all'||b.category===category)&&(status==='all'||(status==='seasonal'?b.kind==='seasonal':status==='active'?availability(b,day)==='Within announced dates':(state[b.id]||'unmarked')===status))&&(!q||[b.name,b.requirement,b.category,b.join,b.guide,...(b.requirements||[]),...(b.tags||[]),...(b.requirementLinks||[]).map(x=>x.label)].filter(Boolean).join(' ').toLowerCase().includes(q)));
}
const api={KEY,serverDay,availability,clean,update,opportunities,filterBadges};
if(typeof module==='object'&&module.exports){module.exports=api;return}
root.AQWCBadgeHunter=api;
const d=root.document, catalog=root.AQWCBadgeCatalog||[];
if(!d||!d.getElementById('badge-hunter-list'))return;
const $=id=>d.getElementById(id);
let state={},storageOK=true,limit=48;
function read(){try{state=clean(JSON.parse(root.localStorage.getItem(KEY)||'{}'),catalog);storageOK=true}catch{storageOK=false} }
function el(tag,txt,cls){const n=d.createElement(tag);if(txt!=null)n.textContent=txt;if(cls)n.className=cls;return n}
function link(url,label){const a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
function button(label,cb,cls='smallbutton'){const b=el('button',label,cls);b.type='button';b.addEventListener('click',cb);return b}
function save(id,value){try{const raw=JSON.parse(root.localStorage.getItem(KEY)||'{}');const next=update(raw,id,value,catalog);root.localStorage.setItem(KEY,JSON.stringify(next));state=next;storageOK=true;render();const sel=$('badge-hunter-list').querySelector('[data-badge-id="'+id+'"] select');if(sel)sel.focus()}catch{$('badge-hunter-message').textContent='Could not save badge progress. Existing saved progress was not changed.'}}
function renderAlert(){
 const alert=$('badge-hunter-home'),list=opportunities(catalog,state);if(!alert)return;
 alert.classList.toggle('hidden',!list.length);$('badge-hunter-home-text').textContent=list.map(b=>b.name+' · '+b.window.end).join(' • ');
}
function render(){
 read();const list=$('badge-hunter-list'),day=serverDay();
 $('badge-hunter-count').textContent=catalog.filter(b=>state[b.id]==='owned').length+' / '+catalog.length;
 $('badge-hunter-tracked').textContent=String(catalog.filter(b=>state[b.id]==='tracked').length);
 $('badge-hunter-seasonal').textContent=String(opportunities(catalog,state,day).length);
 $('badge-hunter-progress').value=catalog.filter(b=>state[b.id]==='owned').length;$('badge-hunter-progress').max=Math.max(1,catalog.length);
 $('badge-hunter-message').textContent=storageOK?'Manual tracking only. Not a live game connection.':'Local storage unavailable; changes may not be saved.';
 const availabilityFilter=$('badge-hunter-availability').value,tagFilter=$('badge-hunter-tag-filter').value;
 const result=filterBadges(catalog,state,$('badge-hunter-search').value,$('badge-hunter-category').value,$('badge-hunter-status').value,day).filter(b=>(availabilityFilter==='all'||b.kind===availabilityFilter||(availabilityFilter==='active'&&availability(b,day)==='Within announced dates'))&&(tagFilter==='all'||(b.tags||[]).includes(tagFilter)));
 $('badge-hunter-results').textContent='Showing '+Math.min(limit,result.length)+' of '+result.length+' matching badges · '+catalog.length+' total';
 $('badge-hunter-more').hidden=result.length<=limit;
 list.replaceChildren();
 for(const b of result.slice(0,limit)){
  const card=el('article',null,'badge-hunter-card');card.dataset.badgeId=b.id;card.classList.toggle('badge-owned',state[b.id]==='owned');
  const heading=el('div',null,'badge-hunter-heading'),art=el('div',null,'badge-hunter-art');
  const fallback=el('span','Artwork unavailable','muted tiny');fallback.hidden=!!b.image;art.append(fallback);
  if(b.image){const img=el('img');img.src=b.image;img.alt=b.name+' badge';img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.addEventListener('error',()=>{img.remove();fallback.hidden=false});art.prepend(img)}
  heading.append(art,el('h3',b.name),el('span',state[b.id]==='owned'?'✓':'','badge-hunter-symbol'));card.append(heading,el('div',b.category+(b.paid?' · Paid pack':'')+' · #'+b.id.slice(3),'muted tiny'));
  if(b.tags?.length)card.append(el('div',b.tags.filter(t=>!t.startsWith('cp-')).join(' · '),'muted tiny'));
  const avail=el('span',availability(b,day),'badge-hunter-tag');if(availability(b,day)==='Within announced dates')avail.classList.add('badge-season-active');card.append(avail,el('p',b.requirement||((b.requirements||[]).length?'See the requirements below.':'Open the source for the unlock conditions.')));
  if(b.window)card.append(el('p','Official dates: '+b.window.start+' to '+b.window.end+' (AQW server day); confirm in game.','muted tiny'));
  const detail=el('details');detail.append(el('summary','How to obtain'));
  if(b.guide)detail.append(el('p',b.guide));
  if(b.requirements?.length){const ul=el('ul');for(const step of b.requirements)ul.append(el('li',step));detail.append(el('p','Requirements from AQW Wiki:','muted tiny'),ul)}
  else if(!b.guide)detail.append(el('p','Detailed requirements not indexed. Check the individual Wiki badge page before farming.'));
  if(b.requirementLinks?.length){const route=el('div',null,'badge-hunter-links');for(const step of b.requirementLinks)route.append(link(step.url,step.label+' ↗'));detail.append(route)}
  if(b.join)detail.append(button(b.join+' ⧉',async e=>{const btn=e.currentTarget;try{await root.navigator.clipboard.writeText(b.join);btn.textContent='Copied ✓'}catch{btn.textContent=b.join+' (copy manually)'}}));
  const links=el('div',null,'badge-hunter-links');links.append(link(b.source,'Badge source ↗'));if(b.guideSource)links.append(link(b.guideSource,'Acquisition guide ↗'));if(b.categorySource)links.append(link(b.categorySource,'Category ↗'));if(b.announcement)links.append(link(b.announcement,'Official event ↗'));detail.append(links);card.append(detail);
  const control=el('select');control.setAttribute('aria-label','Progress for '+b.name);for(const [value,label] of [['unmarked','Not marked'],['tracked','Hunting'],['owned','Owned']]){const o=el('option',label);o.value=value;control.append(o)}
  control.value=state[b.id]||'unmarked';control.addEventListener('change',()=>save(b.id,control.value));card.append(control);list.append(card);
 }
 if(!result.length)list.append(el('p','No badges match these filters.','muted'));
 renderAlert();
}
for(const cat of [...new Set(catalog.map(b=>b.category))].sort()){const opt=el('option',cat);opt.value=cat;$('badge-hunter-category').append(opt)}
for(const tag of [...new Set(catalog.flatMap(b=>b.tags||[]))].filter(t=>!t.startsWith('cp-')).sort()){const opt=el('option',tag);opt.value=tag;$('badge-hunter-tag-filter').append(opt)}
 const reset=()=>{limit=48;render()};$('badge-hunter-search').addEventListener('input',reset);for(const id of ['badge-hunter-category','badge-hunter-status','badge-hunter-availability','badge-hunter-tag-filter'])$(id).addEventListener('change',reset);
 $('badge-hunter-more').addEventListener('click',()=>{limit+=48;render()});
$('badge-hunter-home-open').addEventListener('click',()=>{d.querySelector('[data-group="badges"]')?.click();$('badge-hunter-search').value='';$('badge-hunter-category').value='all';$('badge-hunter-tag-filter').value='all';$('badge-hunter-availability').value='all';$('badge-hunter-status').value='active';reset()});
$('badge-hunter-export').addEventListener('click',()=>{read();if(!storageOK)return;const url=URL.createObjectURL(new Blob([JSON.stringify({format:'AQW Companion badge progress v1',states:state},null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download='AQW_Badge_Progress.json';d.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)});
$('badge-hunter-import').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('File too large');const payload=JSON.parse(await file.text());if(payload.format!=='AQW Companion badge progress v1'||!payload.states||typeof payload.states!=='object'||Array.isArray(payload.states))throw Error('Invalid badge backup');const incoming=clean(payload.states,catalog);read();if(!storageOK)throw Error('Storage unavailable');const next={...state,...incoming};root.localStorage.setItem(KEY,JSON.stringify(next));render();$('badge-hunter-message').textContent='Badge backup merged; other saved badges preserved.'}catch{$('badge-hunter-message').textContent='Could not import badge backup. Existing progress unchanged.'}finally{e.target.value=''}});
root.addEventListener('storage',e=>{if(e.key===KEY)render()});root.addEventListener('focus',()=>{read();renderAlert()});root.setInterval(()=>{read();renderAlert()},60000);
api.render=render;read();renderAlert();
})(typeof globalThis==='object'?globalThis:this);
