/* Native Companion Boost Finder, backed by a bundled public Wiki snapshot. */
(()=>{
'use strict';
const core=globalThis.AQWCBoosts,types={'weapons':'Weapon','armors':'Armor','capes-back-items':'Cape','helmets-hoods':'Helm','pets':'Pet'};
const norm=s=>String(s||'').normalize('NFC').replace(/[’‘]/g,"'").trim().replace(/\s+/g,' ').toLowerCase();
const suffix=/\s+\((sword|axe|bow|dagger|gauntlet|gun|handgun|mace|polearm|rifle|staff|wand|weapon|armor|cape|helm|helmet|hood|pet)\)$/i;
const weapon=/^(?:weapon|sword|axe|bow|dagger|gauntlet|gun|handgun|mace|polearm|rifle|staff|wand|whip)$/i;
function typed(row,category){const t=norm(row.Type);return category==='weapons'?weapon.test(t):category==='armors'?t==='armor':category==='capes-back-items'?['cape','back item'].includes(t):category==='helmets-hoods'?['helm','helmet','hood'].includes(t):category==='pets'?['pet','battle pet'].includes(t):false}
function candidate(r){const m=r.name.match(suffix),base=m?r.name.slice(0,m.index):r.name;return {name:base,variant:!m&&/\s+\([^)]+\)$/.test(r.name),type:m&&r.category==='weapons'?m[1][0].toUpperCase()+m[1].slice(1).toLowerCase():types[r.category]}}
const family=name=>name.replace(/\s+\([^)]+\)$/,'');
function inventoryIndex(inventory){
 const index=new Map(Object.keys(types).map(k=>[k,{exact:new Map(),families:new Set()}]));
 for(const row of inventory){if(!(Number(row.Count)>0))continue;const name=norm(row.Name);for(const [cat,b] of index){if(!typed(row,cat))continue;if(!b.exact.has(name))b.exact.set(name,[]);b.exact.get(name).push(row);b.families.add(family(name))}}
 return index
}
function exactInventoryRows(r,index){
 const c=candidate(r),b=index.get(r.category);if(!b)return [];
 const exact=[...(b.exact.get(norm(r.name))||[]),...(b.exact.get(norm(c.name))||[])];
 // If a Wiki name explicitly declares a weapon subtype, do not match
 // a differently typed export row; generic Weapon exports remain unknown.
 const subtype=r.category==='weapons'&&r.name.match(suffix)?.[1];
 if(subtype&&norm(subtype)!=='weapon')return [...new Set(exact)].filter(x=>norm(x.Type)===norm(subtype));
 return [...new Set(exact)];
}
function ownership(r,inventory,loaded,duplicate=false,index=null){
 if(!loaded)return 'unknown';if(duplicate)return 'ambiguous';
 const c=candidate(r),name=norm(c.name),idx=index||inventoryIndex(inventory),b=idx.get(r.category);if(!b)return 'unknown';
 const exact=exactInventoryRows(r,idx);
 if(exact.length)return exact.every(x=>x.ID!=null&&String(x.ID).trim())&&new Set(exact.map(x=>String(x.ID))).size===1?'owned':'ambiguous';
 if(b.families.has(family(name))||c.variant)return 'ambiguous';
 return 'not-found'
}
function artworkUrl(src){try{const u=new URL(src);return u.protocol==='https:'&&!u.username&&!u.password&&(!u.port||u.port==='443')&&['aqwwiki.wikidot.com','aqwwiki.wdfiles.com','i.imgur.com','static.wikidot.com'].includes(u.hostname)&&!/\/image-tags\//i.test(u.pathname)&&/\.(?:png|jpe?g|webp)$/i.test(u.pathname)?u.href:null}catch{return null}}
// Individual equipment candidates, never a simulated or combined loadout.
function ownedGearBySlot(rows,inventory,loaded,boost){
 const duplicates=new Map(),index=inventoryIndex(inventory||[]);
 for(const r of rows){const k=r.category+'|'+norm(candidate(r).name);duplicates.set(k,(duplicates.get(k)||0)+1)}
 const slots=Object.keys(types).map(category=>({category,owned:[],ambiguous:0}));
 if(!loaded)return slots;
 for(const r of rows){
  const value=r.boost?.[boost];if(!Number.isFinite(value)||value<=0)continue;
  const slot=slots.find(s=>s.category===r.category);if(!slot)continue;
  const state=ownership(r,inventory,true,duplicates.get(r.category+'|'+norm(candidate(r).name))>1,index);
  if(state==='ambiguous'){slot.ambiguous++;continue}
  if(state!=='owned')continue;
  const matches=exactInventoryRows(r,index);
  const locations=[...new Set(matches.map(x=>Number(x.Bank)===1?'Bank':Number(x.Bank)===0&&x.Bank!=null&&x.Bank!==''?'Bag':'Location unknown'))].sort();
  slot.owned.push({name:r.name,slug:r.slug,value,flags:r.flags||[],locations,itemId:String(matches[0].ID)});
 }
 for(const slot of slots)slot.owned.sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name)||a.slug.localeCompare(b.slug));
 return slots;
}
// Sources reviewed 2026-11-28: official AQWorlds Boost Guide, Multiple Boosts
// and AQWWiki Boosted Items Sorted By Boost, notes 1 and 3.1–3.3.
// Only all-damage + ONE explicit target kind, or one progression category.
// No generic "all tagged" multiplier, class/stat/DoT math, consumables or events.
const raceKeys=new Set(['chaos','dragon','elemental','human','undead','drakath','orc']);
const progressionKeys=new Set(['cp','gold','rep','xp']);
function bestOwnedLoadout(rows,inventory,loaded,target){
 if(!loaded)return {state:'unknown',pieces:[]};
 if(target==='tagged')return {state:'choose-race',pieces:[]};
 if(target!=='all'&&!raceKeys.has(target)&&!progressionKeys.has(target))return {state:'unsupported',pieces:[]};
 const race=raceKeys.has(target),primary=race?'all':target;
 const a=ownedGearBySlot(rows,inventory,true,primary),b=race?ownedGearBySlot(rows,inventory,true,target):[];
 const map=new Map(),ids=new Map();
 for(const [slots,part] of [[a,'primary'],[b,'racial']])for(const slot of slots)for(const r of slot.owned){
  const k=slot.category+'|'+r.slug,old=map.get(k)||{...r,category:slot.category,primary:0,racial:0};old[part]=r.value;map.set(k,old);
  if(!ids.has(r.itemId))ids.set(r.itemId,new Set());ids.get(r.itemId).add(slot.category);
 }
 // A malformed snapshot using one identity across categories is not proof of
 // multiple equipable items. Exclude all such identities from loadout math.
 const candidates=[...map.values()].filter(r=>ids.get(r.itemId).size===1);
 if(!candidates.length)return {state:'no-match',pieces:[]};
 const identity=p=>p.category+'|'+p.slug;
 let best=null;
 function consider(pieces){
  const first=Math.max(0,...pieces.map(p=>p.primary)),second=Math.max(0,...pieces.map(p=>p.racial));
  const multiplier=(1+first/100)*(1+second/100);
  const sorted=[...pieces].sort((x,y)=>identity(x).localeCompare(identity(y))),signature=sorted.map(identity).join('|');
  if(!best||multiplier>best.multiplier+1e-10||(Math.abs(multiplier-best.multiplier)<=1e-10&&(pieces.length<best.pieces.length||(pieces.length===best.pieces.length&&signature<best.signature))))best={state:'ready',target,primary:first,racial:second,multiplier,pieces:sorted,signature};
 }
 for(const p of candidates)consider([p]);
 // At most two different slots can supply the two maxima. Compare the highest
 // of each component per slot; single dual-boost items are evaluated above.
 if(race){
  const top=(category,field)=>candidates.filter(p=>p.category===category&&p[field]>0).sort((x,y)=>y[field]-x[field]||identity(x).localeCompare(identity(y)))[0];
  const all=Object.keys(types).map(k=>top(k,'primary')).filter(Boolean),racial=Object.keys(types).map(k=>top(k,'racial')).filter(Boolean);
  for(const x of all)for(const y of racial)if(x.category!==y.category&&x.itemId!==y.itemId)consider([x,y]);
 }
 return best;
}
globalThis.AQWCBoostFinderHelpers=Object.freeze({candidate,ownership,typed,artworkUrl,ownedGearBySlot,bestOwnedLoadout});
if(typeof document==='undefined'||!core)return;
let state=null,add=null,data=null,loading=null,root=null,page=0,selected=new Set(),controls=null,artwork={};
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
const select=(options,label)=>{const n=el('select');n.setAttribute('aria-label',label);for(const [v,t] of options){const o=el('option',t);o.value=v;n.append(o)}n.addEventListener('change',resetPage);return n};
function resetPage(){page=0;draw()}
function button(label,fn,cls){const b=el('button',label,cls);b.type='button';b.addEventListener('click',fn);return b}
function init(){
 root=document.getElementById('boost-finder-content');if(!root)return false;
 const group=el('div',undefined,'bf-groups'),bar=el('div',undefined,'toolbar'),status=el('p','','muted tiny'),results=el('div',undefined,'bf-results'),pager=el('div',undefined,'pagination');status.setAttribute('role','status');
 const gear=el('section',undefined,'bf-owned-gear'),gearHeader=el('div',undefined,'bf-gear-header'),gearTitle=el('div');
 gearTitle.append(el('h3','Your boosted gear'),el('p','Highest listed individual boost in each equipment category; not a combined loadout.','muted tiny'));
 const gearBoost=select(Object.entries(core.labels),'Compare owned gear by boost');gearBoost.value='all';
 gearHeader.append(gearTitle,gearBoost);
 const loadout=el('section',undefined,'bf-loadout'),gearBody=el('div',undefined,'bf-gear-slots');gear.append(gearHeader,loadout,gearBody);
 const btns={},progress=['cp','gold','rep','xp'];
 for(const [name,keys] of [['Damage boosts',Object.keys(core.labels).filter(k=>!progress.includes(k))],['Progression boosts',progress]]){
  const section=el('div',undefined,'bf-group');section.append(el('strong',name));const buttons=el('div',undefined,'bf-types');
  for(const k of keys){const b=button('',()=>{if(selected.has(k))selected.delete(k);else selected.add(k);resetPage()},'bf-type');b.append(core.icon(k),el('span',core.labels[k]));b.setAttribute('aria-pressed','false');btns[k]=b;buttons.append(b)}section.append(buttons);group.append(section)
 }
 const q=el('input');q.type='search';q.placeholder='Search boosted items…';q.setAttribute('aria-label','Search boosted items');q.addEventListener('input',resetPage);
 const cat=select([['','All equipment'],...Object.entries(types)],'Equipment');
 const min=el('input');min.type='number';min.min='0';min.max='1000';min.value='0';min.setAttribute('aria-label','Minimum boost percent');min.addEventListener('input',resetPage);min.className='bf-min';
 const avail=select([['','All availability'],['unrestricted','No listed restriction'],...['Legend','Rare','Pseudo-Rare','Seasonal','Special Offer'].map(x=>[x,x])],'Availability');
 const own=select([['','All ownership'],['owned','Owned'],['not-found','Not in snapshot'],['ambiguous','Ambiguous']],'Ownership');
 const order=select([['highest','Highest boost'],['lowest','Lowest boost'],['name','Name A–Z']],'Sort');
 const clear=button('Reset',()=>{selected.clear();q.value=cat.value=avail.value=own.value='';min.value='0';order.value='highest';resetPage()});
 const ml=el('label','Min %','bf-min-label');ml.append(min);
 bar.append(q,cat,ml,avail,own,order,clear);
 root.replaceChildren(gear,group,bar,status,results,pager);
 controls={q,cat,min,avail,own,order,btns,status,results,pager,gearBoost,gearBody,loadout};return true
}
function validRows(rows){return rows.filter(r=>r&&typeof r.name==='string'&&r.name.length<=350&&core.slug('/'+r.slug)===r.slug&&Object.hasOwn(types,r.category)&&Array.isArray(r.flags)&&r.boost&&Object.entries(r.boost).every(([k,v])=>Object.hasOwn(core.labels,k)&&Number.isFinite(v)&&v>0&&v<=1000))}
async function load(){
 if(data||loading)return loading;
 controls.status.textContent='Loading local boost index…';
 loading=(async()=>{try{const r=await fetch('extension/boost-index.json',{credentials:'same-origin'});if(!r.ok)throw Error('Catalog unavailable');const d=await r.json();if(!Array.isArray(d.rows)||d.rows.length>10000)throw Error('Invalid catalog');data={rows:validRows(d.rows),updatedAt:String(d.updatedAt||'')};fetch('data/boost-artwork.json?v=2',{credentials:'same-origin',cache:'no-cache'}).then(r=>r.ok?r.json():null).then(x=>{if(x?.images&&typeof x.images==='object'){artwork=x.images;draw()}}).catch(()=>{});if(!data.rows.length)throw Error('Empty catalog');draw()}catch(err){data=null;controls.status.textContent='Could not load the boost catalog. Reopen Boost Finder to retry.'}finally{loading=null}})();return loading
}
function drawLoadout(st){
 const {loadout,gearBoost}=controls;loadout.replaceChildren();
 const title=el('strong','Smart equipment loadout');loadout.append(title);
 if(!st.loaded||!data){loadout.append(el('p',st.loaded?'Loading boost catalog…':'Import a full snapshot to calculate a gear-only combination.','muted tiny'));return}
 const target=gearBoost.value,result=bestOwnedLoadout(data.rows,st.items||[],true,target);
 if(result.state!=='ready'){
  loadout.append(el('p',result.state==='choose-race'?'All Tagged is a group of five kinds, not an extra damage multiplier. Select a specific monster kind to compare combinations.':'No unambiguous owned candidates for this target in the bundled catalog.','muted tiny'));
 }else{
  const value=n=>Number(n.toFixed(4)).toLocaleString('en-US',{maximumFractionDigits:4});
  const bonus=el('div',undefined,'bf-loadout-result');bonus.append(el('strong','+'+value((result.multiplier-1)*100)+'%','bf-loadout-value'),el('span',value(result.multiplier)+'× base · '+core.labels[target]+' · gear only','muted tiny'));
  loadout.append(bonus);
  if(raceKeys.has(target))loadout.append(el('p','(1 + '+value(result.primary/100)+') × (1 + '+value(result.racial/100)+') = '+value(result.multiplier)+'×','muted tiny'));
  const pieces=el('div',undefined,'bf-loadout-pieces');
  for(const p of result.pieces){
   const row=el('div',undefined,'bf-loadout-piece');row.dataset.slot=p.category;
   const name=el('a',p.name);name.href='https://aqwwiki.wikidot.com/'+p.slug;name.target='_blank';name.rel='noopener noreferrer';
   row.append(el('small',types[p.category],'muted tiny'),name,el('small',[...p.locations,...p.flags].join(' · '),'muted tiny'));
   const parts=[p.primary>0?'+'+p.primary+'% '+core.labels[raceKeys.has(target)?'all':target]:null,p.racial>0?'+'+p.racial+'% '+core.labels[target]:null].filter(Boolean);
   row.append(el('small',parts.join(' · '),'bf-gear-value'));pieces.append(row);
  }
  loadout.append(pieces);
 }
 const note=el('p','Best listed gear boost for this target among unambiguous owned catalog matches, using at most one item per slot. Other slots are free for this calculation. Verify equip restrictions, actual target kind and boosts in game; this is not a class build or DPS prediction. Timed/server boosts and damage-over-time effects are not calculated.','muted tiny');
 const sources=el('div',undefined,'bf-loadout-sources');for(const [label,url] of [['Official AQW boost guide ↗','https://www.aq.com/Lore/Guides/AQWBoosts'],['AQWWiki stacking rules ↗','https://aqwwiki.wikidot.com/boosted-items-sorted-by-boost']]){const a=el('a',label,'tiny');a.href=url;a.target='_blank';a.rel='noopener noreferrer';sources.append(a)}
 loadout.append(note,sources);
}
function drawOwnedGear(st){
 const {gearBoost,gearBody,q,cat,min,avail,own,order}=controls;
 gearBody.replaceChildren();gearBoost.disabled=!st.loaded;drawLoadout(st);
 if(!st.loaded){gearBody.append(el('p','Import a full Inventory & Bank snapshot to compare your owned gear.','muted tiny'));return}
 if(!data)return;
 for(const slot of ownedGearBySlot(data.rows,st.items||[],true,gearBoost.value)){
  const card=el('div',undefined,'bf-gear-slot');card.dataset.slot=slot.category;
  const top=el('div',undefined,'bf-gear-slot-head');top.append(el('strong',types[slot.category]),el('small',slot.owned.length+' matched','muted tiny'));card.append(top);
  if(!slot.owned.length)card.append(el('p','No unambiguous owned match for this boost in the catalog.','muted tiny'));
  for(const r of slot.owned.slice(0,3)){
   const row=el('div',undefined,'bf-gear-candidate'),name=el('a',r.name),value=el('strong','+'+r.value+'%','bf-gear-value');
   name.href='https://aqwwiki.wikidot.com/'+r.slug;name.target='_blank';name.rel='noopener noreferrer';
   const main=el('div',undefined,'bf-gear-candidate-head');main.append(name,value);row.append(main,el('small',[...r.locations,...r.flags].join(' · '),'muted tiny'));card.append(row);
  }
  if(slot.ambiguous)card.append(el('small',slot.ambiguous+' ambiguous catalog match(es) excluded.','muted tiny'));
  if(slot.owned.length){const view=button('View '+slot.owned.length+' owned match(es)',()=>{selected.clear();selected.add(gearBoost.value);q.value=avail.value='';cat.value=slot.category;own.value='owned';min.value='0';order.value='highest';resetPage();controls.status.scrollIntoView({block:'start'})},'smallbutton');card.append(view)}
  gearBody.append(card);
 }
 const note=el('p','Snapshot + bundled Wiki index only. Not equipped status, ownership entitlement, membership eligibility or current availability. Check that gear can be equipped in game. Percentages are individual, not added or multiplied.','muted tiny bf-gear-note');gearBody.append(note);
}
function draw(){
 if(!controls)return;
 const {q,cat,min,avail,own,order,btns,status,results,pager}=controls;for(const [k,b] of Object.entries(btns))b.setAttribute('aria-pressed',String(selected.has(k)));
 const st=state?.()||{items:[],loaded:false,tracked:[]};own.disabled=!st.loaded;if(!st.loaded)own.value='';
 drawOwnedGear(st);
 if(!data)return;
 const duplicates=new Map();for(const r of data.rows){const key=r.category+'|'+norm(candidate(r).name);duplicates.set(key,(duplicates.get(key)||0)+1)}
 const inv=inventoryIndex(st.items||[]),owned={};for(const r of data.rows)owned[r.slug]=ownership(r,st.items||[],st.loaded,(duplicates.get(r.category+'|'+norm(candidate(r).name))||0)>1,inv);
 const tracked=new Set((st.tracked||[]).map(norm));
 const filtered=core.filter(data.rows,{query:q.value,boosts:[...selected],min:Math.max(0,Number(min.value)||0),category:cat.value,availability:avail.value,ownership:own.value,owned,sort:order.value});
 const pages=Math.max(1,Math.ceil(filtered.length/48));page=Math.min(page,pages-1);
 status.textContent=filtered.length+' matching items · '+data.rows.length+' indexed · '+(data.updatedAt||'snapshot')+(st.loaded?' · Inventory & Bank checked':' · Import inventory to filter ownership')+(selected.size>1?' · All selected boosts required':'');
 results.replaceChildren();pager.replaceChildren();
 if(!filtered.length)results.append(el('p','No items match these filters.','muted'));
 for(const r of filtered.slice(page*48,page*48+48)){
  const row=el('div',undefined,'bf-row'),left=el('div',undefined,'bf-item'),a=el('a',r.name);a.href='https://aqwwiki.wikidot.com/'+r.slug;a.target='_blank';a.rel='noopener noreferrer';
  const c=candidate(r),o=owned[r.slug],meta=el('small',[types[r.category],...r.flags,o==='owned'?'Owned':o==='not-found'?'Not in snapshot':o==='ambiguous'?'Ambiguous match':'Ownership unknown'].join(' · '),'muted');
  const visual=el('a',undefined,'bf-artwork');visual.href=a.href;visual.target='_blank';visual.rel='noopener noreferrer';visual.setAttribute('aria-label','View '+r.name+' on Wiki');const fallback=el('span','No artwork available','bf-art-placeholder');visual.append(fallback);const src=artworkUrl(artwork[r.slug]);if(src){const img=el('img');img.alt=r.name;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.addEventListener('load',()=>{fallback.hidden=true});img.addEventListener('error',()=>{img.remove();fallback.hidden=false});visual.append(img);img.src=src}row.append(visual);left.append(a,meta);const chips=el('div',undefined,'bf-chips');core.showChips(chips,r.boost);row.append(left,chips);
  const duplicate=(duplicates.get(r.category+'|'+norm(c.name))||0)>1;
  if(!c.variant&&!duplicate&&typeof add==='function'){const isSaved=tracked.has(norm(c.name)),b=button(isSaved?'✓ Wishlist':'+ Wishlist',()=>{if(b.disabled)return;try{add(c.name,c.type);draw()}catch(err){status.textContent='Could not add item to Wishlist.'}},'smallbutton');b.disabled=isSaved;row.append(b)}results.append(row)
 }
 const prev=button('Previous',()=>{page--;draw()}),next=button('Next',()=>{page++;draw()});prev.disabled=page<=0;next.disabled=page>=pages-1;pager.append(prev,el('span','Page '+(page+1)+' / '+pages),next)
}
function render(getState,addGoal){state=getState;add=addGoal;if(!root&&!init())return;draw();load()}
globalThis.AQWCBoostFinder=Object.freeze({render});
})();
