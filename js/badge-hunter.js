'use strict';
(function(root){
const KEY='aqwc-badge-hunter-v1',validStates=['tracked','owned'];
function serverDay(now=new Date()){return new Date(now.getTime()-5*3600000).toISOString().slice(0,10)}
function availability(b,day=serverDay()){
 if(b.kind==='legacy')return 'Historical';
 if(b.kind!=='seasonal')return 'Route documented';
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
 const q=query.trim().toLowerCase();return catalog.filter(b=>(category==='all'||b.category===category)&&(status==='all'||(status==='seasonal'?b.kind==='seasonal':status==='active'?availability(b,day)==='Within announced dates':(state[b.id]||'unmarked')===status))&&(!q||[b.name,b.requirement,b.category,b.join,b.guide].filter(Boolean).join(' ').toLowerCase().includes(q)));
}
const api={KEY,serverDay,availability,clean,update,opportunities,filterBadges};
if(typeof module==='object'&&module.exports){module.exports=api;return}
root.AQWCBadgeHunter=api;
const d=root.document, catalog=root.AQWCBadgeCatalog||[];
if(!d||!d.getElementById('badge-hunter-list'))return;
const $=id=>d.getElementById(id);
let state={},storageOK=true;
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
 const result=filterBadges(catalog,state,$('badge-hunter-search').value,$('badge-hunter-category').value,$('badge-hunter-status').value,day);
 $('badge-hunter-results').textContent=result.length+' / '+catalog.length+' badges in starter catalog';
 list.replaceChildren();
 for(const b of result){
  const card=el('article',null,'badge-hunter-card');card.dataset.badgeId=b.id;card.classList.toggle('badge-owned',state[b.id]==='owned');
  const heading=el('div',null,'badge-hunter-heading');heading.append(el('span',state[b.id]==='owned'?'✓':'🏆','badge-hunter-symbol'),el('h3',b.name));card.append(heading,el('div',b.category+(b.paid?' · Paid pack':''),'muted tiny'));
  const avail=el('span',availability(b,day),'badge-hunter-tag');if(availability(b,day)==='Within announced dates')avail.classList.add('badge-season-active');card.append(avail,el('p',b.requirement));
  if(b.window)card.append(el('p','Official dates: '+b.window.start+' to '+b.window.end+' (AQW server day); confirm in game.','muted tiny'));
  const detail=el('details');detail.append(el('summary','How to obtain'),el('p',b.guide||'See the source for the documented unlock condition. A full step-by-step route is not indexed yet.'));
  if(b.join)detail.append(button(b.join+' ⧉',async e=>{const btn=e.currentTarget;try{await root.navigator.clipboard.writeText(b.join);btn.textContent='Copied ✓'}catch{btn.textContent=b.join+' (copy manually)'}}));
  const links=el('div',null,'badge-hunter-links');links.append(link(b.source,'Badge source ↗'));if(b.guideSource)links.append(link(b.guideSource,'Acquisition guide ↗'));detail.append(links);card.append(detail);
  const control=el('select');control.setAttribute('aria-label','Progress for '+b.name);for(const [value,label] of [['unmarked','Not marked'],['tracked','Hunting'],['owned','Owned']]){const o=el('option',label);o.value=value;control.append(o)}
  control.value=state[b.id]||'unmarked';control.addEventListener('change',()=>save(b.id,control.value));card.append(control);list.append(card);
 }
 if(!result.length)list.append(el('p','No badges match these filters.','muted'));
 renderAlert();
}
for(const cat of [...new Set(catalog.map(b=>b.category))].sort()){const opt=el('option',cat);opt.value=cat;$('badge-hunter-category').append(opt)}
$('badge-hunter-search').addEventListener('input',render);$('badge-hunter-category').addEventListener('change',render);$('badge-hunter-status').addEventListener('change',render);
$('badge-hunter-home-open').addEventListener('click',()=>{d.querySelector('[data-group="badges"]')?.click();$('badge-hunter-status').value='active';render()});
$('badge-hunter-export').addEventListener('click',()=>{read();if(!storageOK)return;const url=URL.createObjectURL(new Blob([JSON.stringify({format:'AQW Companion badge progress v1',states:state},null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download='AQW_Badge_Progress.json';d.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)});
$('badge-hunter-import').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('File too large');const payload=JSON.parse(await file.text());if(payload.format!=='AQW Companion badge progress v1'||!payload.states||typeof payload.states!=='object'||Array.isArray(payload.states))throw Error('Invalid badge backup');const incoming=clean(payload.states,catalog);read();if(!storageOK)throw Error('Storage unavailable');const next={...state,...incoming};root.localStorage.setItem(KEY,JSON.stringify(next));render();$('badge-hunter-message').textContent='Badge backup merged; other saved badges preserved.'}catch{$('badge-hunter-message').textContent='Could not import badge backup. Existing progress unchanged.'}finally{e.target.value=''}});
root.addEventListener('storage',e=>{if(e.key===KEY)render()});root.addEventListener('focus',()=>{read();renderAlert()});root.setInterval(()=>{read();renderAlert()},60000);
api.render=render;render();
})(typeof globalThis==='object'?globalThis:this);
