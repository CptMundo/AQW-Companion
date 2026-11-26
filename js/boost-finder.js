/* Native Companion Boost Finder, backed by a bundled public Wiki snapshot. */
(()=>{
'use strict';
const core=globalThis.AQWCBoosts,types={'weapons':'Weapon','armors':'Armor','capes-back-items':'Cape','helmets-hoods':'Helm','pets':'Pet'};
const norm=s=>String(s||'').normalize('NFC').replace(/[’‘]/g,"'").trim().replace(/\s+/g,' ').toLowerCase();
const suffix=/\s+\((sword|axe|bow|dagger|gauntlet|gun|handgun|mace|polearm|rifle|staff|wand|weapon|armor|cape|helm|helmet|hood|pet)\)$/i;
const weapon=/^(?:weapon|sword|axe|bow|dagger|gauntlet|gun|handgun|mace|polearm|rifle|staff|wand|whip)$/i;
function typed(row,category){const t=norm(row.Type);return category==='weapons'?weapon.test(t):category==='armors'?t==='armor':category==='capes-back-items'?['cape','back item'].includes(t):category==='helmets-hoods'?['helm','helmet','hood'].includes(t):category==='pets'?['pet','battle pet'].includes(t):false}
function candidate(r){const m=r.name.match(suffix),base=m?r.name.slice(0,m.index):r.name;return {name:base,variant:!m&&/\s+\([^)]+\)$/.test(r.name),type:m&&r.category==='weapons'?m[1][0].toUpperCase()+m[1].slice(1).toLowerCase():types[r.category]}}
function ownership(r,inventory,loaded,duplicate=false){
 if(!loaded)return 'unknown';if(duplicate)return 'ambiguous';
 const c=candidate(r),name=norm(c.name),typedRows=inventory.filter(x=>Number(x.Count)>0&&typed(x,r.category));
 const exact=typedRows.filter(x=>norm(x.Name)===norm(r.name)||norm(x.Name)===name);
 if(exact.length)return new Set(exact.map(x=>String(x.ID))).size===1?'owned':'ambiguous';
 const base=name.replace(/\s+\([^)]+\)$/,'');
 if(typedRows.some(x=>norm(x.Name).replace(/\s+\([^)]+\)$/,'')===base)||c.variant)return 'ambiguous';
 return 'not-found'
}
globalThis.AQWCBoostFinderHelpers=Object.freeze({candidate,ownership,typed});
if(typeof document==='undefined'||!core)return;
let state=null,add=null,data=null,loading=null,root=null,page=0,selected=new Set(),controls=null;
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
const select=(options,label)=>{const n=el('select');n.setAttribute('aria-label',label);for(const [v,t] of options){const o=el('option',t);o.value=v;n.append(o)}n.addEventListener('change',resetPage);return n};
function resetPage(){page=0;draw()}
function button(label,fn,cls){const b=el('button',label,cls);b.type='button';b.addEventListener('click',fn);return b}
function init(){
 root=document.getElementById('boost-finder-content');if(!root)return false;
 const group=el('div',undefined,'bf-groups'),bar=el('div',undefined,'toolbar'),status=el('p','','muted tiny'),results=el('div',undefined,'bf-results'),pager=el('div',undefined,'pagination');status.setAttribute('role','status');
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
 root.replaceChildren(group,bar,status,results,pager);
 controls={q,cat,min,avail,own,order,btns,status,results,pager};return true
}
function validRows(rows){return rows.filter(r=>r&&typeof r.name==='string'&&r.name.length<=350&&core.slug('/'+r.slug)===r.slug&&Object.hasOwn(types,r.category)&&Array.isArray(r.flags)&&r.boost&&Object.entries(r.boost).every(([k,v])=>Object.hasOwn(core.labels,k)&&Number.isFinite(v)&&v>0&&v<=1000))}
async function load(){
 if(data||loading)return loading;
 controls.status.textContent='Loading local boost index…';
 loading=(async()=>{try{const r=await fetch('extension/boost-index.json',{credentials:'same-origin'});if(!r.ok)throw Error('Catalog unavailable');const d=await r.json();if(!Array.isArray(d.rows)||d.rows.length>10000)throw Error('Invalid catalog');data={rows:validRows(d.rows),updatedAt:String(d.updatedAt||'')};if(!data.rows.length)throw Error('Empty catalog');draw()}catch(err){data=null;controls.status.textContent='Could not load the boost catalog. Reopen Boost Finder to retry.'}finally{loading=null}})();return loading
}
function draw(){
 if(!controls)return;
 const {q,cat,min,avail,own,order,btns,status,results,pager}=controls;for(const [k,b] of Object.entries(btns))b.setAttribute('aria-pressed',String(selected.has(k)));
 const st=state?.()||{items:[],loaded:false,tracked:[]};own.disabled=!st.loaded;if(!st.loaded)own.value='';
 if(!data)return;
 const duplicates=new Map();for(const r of data.rows){const key=r.category+'|'+norm(candidate(r).name);duplicates.set(key,(duplicates.get(key)||0)+1)}
 const owned={};for(const r of data.rows)owned[r.slug]=ownership(r,st.items||[],st.loaded,(duplicates.get(r.category+'|'+norm(candidate(r).name))||0)>1);
 const tracked=new Set((st.tracked||[]).map(norm));
 const filtered=core.filter(data.rows,{query:q.value,boosts:[...selected],min:Math.max(0,Number(min.value)||0),category:cat.value,availability:avail.value,ownership:own.value,owned,sort:order.value});
 const pages=Math.max(1,Math.ceil(filtered.length/48));page=Math.min(page,pages-1);
 status.textContent=filtered.length+' matching items · '+data.rows.length+' indexed · '+(data.updatedAt||'snapshot')+(st.loaded?' · Inventory & Bank checked':' · Import inventory to filter ownership')+(selected.size>1?' · All selected boosts required':'');
 results.replaceChildren();pager.replaceChildren();
 if(!filtered.length)results.append(el('p','No items match these filters.','muted'));
 for(const r of filtered.slice(page*48,page*48+48)){
  const row=el('div',undefined,'bf-row'),left=el('div',undefined,'bf-item'),a=el('a',r.name);a.href='https://aqwwiki.wikidot.com/'+r.slug;a.target='_blank';a.rel='noopener noreferrer';
  const c=candidate(r),o=owned[r.slug],meta=el('small',[types[r.category],...r.flags,o==='owned'?'Owned':o==='not-found'?'Not in snapshot':o==='ambiguous'?'Ambiguous match':'Ownership unknown'].join(' · '),'muted');
  left.append(a,meta);const chips=el('div',undefined,'bf-chips');core.showChips(chips,r.boost);row.append(left,chips);
  const duplicate=(duplicates.get(r.category+'|'+norm(c.name))||0)>1;
  if(!c.variant&&!duplicate&&typeof add==='function'){const isSaved=tracked.has(norm(c.name)),b=button(isSaved?'✓ Wishlist':'+ Wishlist',()=>{if(b.disabled)return;try{add(c.name,c.type);draw()}catch(err){status.textContent='Could not add item to Wishlist.'}},'smallbutton');b.disabled=isSaved;row.append(b)}results.append(row)
 }
 const prev=button('Previous',()=>{page--;draw()}),next=button('Next',()=>{page++;draw()});prev.disabled=page<=0;next.disabled=page>=pages-1;pager.append(prev,el('span','Page '+(page+1)+' / '+pages),next)
}
function render(getState,addGoal){state=getState;add=addGoal;if(!root&&!init())return;draw();load()}
globalThis.AQWCBoostFinder=Object.freeze({render});
})();
