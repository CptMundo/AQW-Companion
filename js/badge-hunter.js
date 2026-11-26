'use strict';
(function(root){
const KEY='aqwc-badge-hunter-v1',validStates=['tracked','owned'];
function serverDay(now=new Date()){return new Date(now.getTime()-5*3600000).toISOString().slice(0,10)}
function availability(b,day=serverDay()){
 if(!b.window){if(b.kind==='legacy')return 'Rare / historical';if(b.kind==='unknown')return 'Availability unconfirmed';if(b.kind==='seasonal'||b.kind==='event')return 'Return unconfirmed';return 'Requirements documented'}
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
function opportunities(catalog,state,day=serverDay()){return catalog.filter(b=>['seasonal','event'].includes(b.kind)&&availability(b,day)==='Within announced dates'&&state[b.id]!=='owned')}
function filterBadges(catalog,state,query='',category='all',status='all',day=serverDay()){
 const q=query.trim().toLowerCase();return catalog.filter(b=>(category==='all'||b.category===category)&&(status==='all'||(status==='seasonal'?b.kind==='seasonal':status==='active'?availability(b,day)==='Within announced dates':(state[b.id]||'unmarked')===status))&&(!q||[b.name,b.requirement,b.category,b.join,b.guide,...(b.requirements||[]),...(b.tags||[]),...(b.requirementLinks||[]).map(x=>x.label)].filter(Boolean).join(' ').toLowerCase().includes(q)));
}
function matchCapture(snapshot,catalog){
 if(!snapshot||typeof snapshot.character!=='string'||!snapshot.character.trim()||snapshot.character.length>80||/[\u0000-\u001f\u007f]/.test(snapshot.character)||typeof snapshot.capturedAt!=='string'||!Number.isFinite(Date.parse(snapshot.capturedAt))||!Array.isArray(snapshot.badges)||!snapshot.badges.length||snapshot.badges.length>2000)throw Error('Invalid capture');
 const byFile=new Map(),norm=s=>String(s||'').normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
 for(const b of catalog){if(b.placeholder||!b.image)continue;const file=b.image.split(/[?#]/)[0].split('/').pop().toLowerCase();if(!byFile.has(file))byFile.set(file,[]);byFile.get(file).push(b)}
 const ids=new Set(),ambiguous=new Set(),unknown=new Set();
 for(const row of snapshot.badges){
 if(typeof row?.file!=='string'||! /^[a-z0-9_.%()-]{1,220}\.(?:png|jpe?g|gif|webp)$/i.test(row.file)||typeof row.label!=='string'||row.label.length>200)throw Error('Invalid badge image reference');
 const file=row.file.toLowerCase(),matches=byFile.get(file)||[];
 if(matches.length===1)ids.add(matches[0].id);
 else if(matches.length>1){const named=matches.filter(b=>norm(b.name)===norm(row.label));if(named.length===1)ids.add(named[0].id);else ambiguous.add(file)}
 else unknown.add(file);
 }
 return {character:snapshot.character.trim(),capturedAt:snapshot.capturedAt,ids:[...ids],ambiguous:ambiguous.size,unknown:unknown.size};
}

const api={KEY,serverDay,availability,clean,update,opportunities,filterBadges,matchCapture};
if(typeof module==='object'&&module.exports){module.exports=api;return}
root.AQWCBadgeHunter=api;
const d=root.document, catalog=root.AQWCBadgeCatalog||[];
if(!d||!d.getElementById('badge-hunter-list'))return;
const $=id=>d.getElementById(id);
const CAPTURE_KEY='aqwc-badge-character-v1';
let state={},manual={},capture=null,storageOK=true,limit=48;
function read(){try{manual=clean(JSON.parse(root.localStorage.getItem(KEY)||'{}'),catalog);capture=JSON.parse(root.localStorage.getItem(CAPTURE_KEY)||'null');const ids=new Set(catalog.map(b=>b.id));if(!capture||typeof capture.character!=='string'||!Array.isArray(capture.ids)||!capture.ids.every(id=>ids.has(id)))capture=null;state={...manual};for(const id of capture?.ids||[])state[id]='owned';storageOK=true}catch{storageOK=false} }
function el(tag,txt,cls){const n=d.createElement(tag);if(txt!=null)n.textContent=txt;if(cls)n.className=cls;return n}
function link(url,label){const a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
function button(label,cb,cls='smallbutton'){const b=el('button',label,cls);b.type='button';b.addEventListener('click',cb);return b}
function save(id,value){try{const raw=JSON.parse(root.localStorage.getItem(KEY)||'{}');const next=update(raw,id,value,catalog);root.localStorage.setItem(KEY,JSON.stringify(next));manual=next;storageOK=true;render();const sel=$('badge-hunter-list').querySelector('[data-badge-id="'+id+'"] select');if(sel)sel.focus()}catch{$('badge-hunter-message').textContent='Could not save badge progress. Existing saved progress was not changed.'}}
function renderAlert(){
 const alert=$('badge-hunter-home'),list=opportunities(catalog,state);if(!alert)return;
 alert.classList.toggle('hidden',!list.length);const content=$('badge-hunter-home-text');content.replaceChildren();for(const b of list){const row=el('span',undefined,'calendar-badge-entry');const name=el('strong',b.name);const end=el('time',b.window.end);end.dateTime=b.window.end;row.append(name,end);content.append(row)}
}
function render(){
 read();const list=$('badge-hunter-list'),day=serverDay();
 $('badge-hunter-count').textContent=catalog.filter(b=>state[b.id]==='owned').length+' / '+catalog.length;
 $('badge-hunter-tracked').textContent=String(catalog.filter(b=>state[b.id]==='tracked').length);
 $('badge-hunter-seasonal').textContent=String(opportunities(catalog,state,day).length);
 $('badge-hunter-progress').value=catalog.filter(b=>state[b.id]==='owned').length;$('badge-hunter-progress').max=Math.max(1,catalog.length);
 $('badge-hunter-message').textContent=storageOK?(capture?'Character Page: '+capture.character+' · '+capture.ids.length+' matched · Last import '+new Date(capture.capturedAt).toLocaleString()+' · '+capture.ambiguous+' ambiguous, '+capture.unknown+' unrecognized image references in latest scan. Not seen ≠ not owned.':'Manual tracking. Import a Character Page capture from the extension.'):'Local storage unavailable; changes may not be saved.';
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
  control.value=manual[b.id]||'unmarked';control.setAttribute('aria-label','Manual progress for '+b.name);control.addEventListener('change',()=>save(b.id,control.value));if(capture?.ids.includes(b.id)){card.append(el('p','✓ Seen on Character Page · '+capture.character,'muted tiny'));control.value='owned';control.disabled=true}else if(capture)card.append(el('p','Not observed in imported captures (not proof of absence).','muted tiny'));card.append(control);list.append(card);
 }
 if(!result.length)list.append(el('p','No badges match these filters.','muted'));
 renderAlert();
}
for(const cat of [...new Set(catalog.map(b=>b.category))].sort()){const opt=el('option',cat);opt.value=cat;$('badge-hunter-category').append(opt)}
for(const tag of [...new Set(catalog.flatMap(b=>b.tags||[]))].filter(t=>!t.startsWith('cp-')).sort()){const opt=el('option',tag);opt.value=tag;$('badge-hunter-tag-filter').append(opt)}
 const reset=()=>{limit=48;render()};$('badge-hunter-search').addEventListener('input',reset);for(const id of ['badge-hunter-category','badge-hunter-status','badge-hunter-availability','badge-hunter-tag-filter'])$(id).addEventListener('change',reset);
 $('badge-hunter-more').addEventListener('click',()=>{limit+=48;render()});
$('badge-hunter-home-open').addEventListener('click',()=>{d.querySelector('[data-group="badges"]')?.click();$('badge-hunter-search').value='';$('badge-hunter-category').value='all';$('badge-hunter-tag-filter').value='all';$('badge-hunter-availability').value='all';$('badge-hunter-status').value='active';reset()});
$('badge-hunter-export').addEventListener('click',()=>{read();if(!storageOK)return;const url=URL.createObjectURL(new Blob([JSON.stringify({format:'AQW Companion badge progress v1',states:manual},null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download='AQW_Badge_Progress.json';d.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)});
$('badge-hunter-import').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('File too large');const payload=JSON.parse(await file.text());if(payload.format!=='AQW Companion badge progress v1'||!payload.states||typeof payload.states!=='object'||Array.isArray(payload.states))throw Error('Invalid badge backup');const incoming=clean(payload.states,catalog);read();if(!storageOK)throw Error('Storage unavailable');const next={...manual,...incoming};root.localStorage.setItem(KEY,JSON.stringify(next));render();$('badge-hunter-message').textContent='Badge backup merged; other saved badges preserved.'}catch{$('badge-hunter-message').textContent='Could not import badge backup. Existing progress unchanged.'}finally{e.target.value=''}});
root.addEventListener('storage',e=>{if(e.key===KEY)render()});root.addEventListener('focus',()=>{read();renderAlert()});root.setInterval(()=>{read();renderAlert()},60000);
function applyCapture(snapshot,ask=false){
 if(!snapshot)throw Error('No staged capture. Open your Character Page and capture it in the extension.');
 const next=matchCapture(snapshot,catalog);
 if(!next.ids.length)throw Error('No unambiguous badges matched; previous progress preserved.');
 read();if(!storageOK)throw Error('Local storage unavailable.');
 if(capture&&capture.character.toLowerCase()!==next.character.toLowerCase())throw Error('Different character. Clear Character Page matches before switching.');
 const count=next.ids.length;
 if(ask&&!confirm('Import '+count+' matched badges for '+next.character+'? '+next.ambiguous+' ambiguous and '+next.unknown+' unrecognized image references will not be marked owned. Your manual states are preserved.'))return {ok:false,saved:false,error:'Import cancelled'};
 if(capture?.character.toLowerCase()===next.character.toLowerCase())next.ids=[...new Set([...capture.ids,...next.ids])];
 root.localStorage.setItem(CAPTURE_KEY,JSON.stringify(next));
 try{render()}catch(err){return {ok:false,saved:true,error:'Badge data saved, but redraw failed: '+String(err?.message||err)}}
 return {ok:true,saved:true,count,ambiguous:next.ambiguous,unknown:next.unknown};
}
api.applyCapture=applyCapture;
d.documentElement.dataset.aqwcBadgeReady='1';
let pending=null;
$('badge-character-import').addEventListener('click',e=>{
 if(!e.isTrusted)return;
 const requestId=crypto.randomUUID();pending=requestId;$('badge-hunter-message').textContent='Looking for a staged extension capture…';
 root.postMessage({channel:'aqwc-badge-capture-v1',type:'request',requestId},location.origin);
 setTimeout(()=>{if(pending===requestId){pending=null;$('badge-hunter-message').textContent='No extension response. Install the test version and capture your Character Page first.'}},3000);
});
root.addEventListener('message',e=>{
 if(e.source!==root||e.origin!==location.origin||e.data?.channel!=='aqwc-badge-capture-v1'||e.data?.type!=='response'||!pending||e.data.requestId!==pending)return;
 pending=null;
 try{
  applyCapture(e.data.snapshot,true);
 }catch(err){$('badge-hunter-message').textContent=String(err?.message||err)}
});
$('badge-character-clear').addEventListener('click',e=>{if(e.isTrusted&&confirm('Clear imported Character Page matches? Manual badge progress will remain.')){try{root.localStorage.removeItem(CAPTURE_KEY);render()}catch{$('badge-hunter-message').textContent='Could not clear capture.'}}});
root.addEventListener('storage',e=>{if(e.key===CAPTURE_KEY)render()});
function openFromHash(){if(location.hash==='#aqwc-badge-hunter')d.querySelector('[data-group="badges"]')?.click()}
root.addEventListener('hashchange',openFromHash);
api.render=render;read();renderAlert();openFromHash();
})(typeof globalThis==='object'?globalThis:this);
