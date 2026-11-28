/* Read-only dependency planning. A merge's ingredients are consumed, even at quantity 1.
 * A possession gate is separate; it is not an ingredient. No inferred quest completion.
 */
(function(root){
'use strict';
const key=v=>String(v||'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s*\((?:class|sword|misc)\)$/i,'').replace(/^elders' blood$/,"elder's blood");
const pos=v=>Number.isSafeInteger(v)&&v>0;
function checkedRows(rows,kind){
 if(!Array.isArray(rows))throw Error('Missing requirement rows');
 return rows.map(([item,count])=>{if(typeof item!=='string'||!key(item)||!pos(count))throw Error('Invalid requirement');return {item,count,kind}});
}
function describe(name,integrity){
 const entry=integrity.getVerified(name);
 if(entry)return {name:entry.name,source:entry.source,reviewedOn:entry.reviewedOn,kind:'merge',rows:checkedRows(entry.ingredients,'consume')};
 const guide=integrity.getGuidance(name);
 if(guide?.kind==='quest'&&guide.name==='Drakath the Eternal')return {name:guide.name,source:guide.source,kind:'quest',rows:[...checkedRows(guide.requirements.map(item=>[item,1]),'possess'),...checkedRows(guide.ingredients,'consume')]};
 return null;
}
function direct(route,stock=null){
 const sums=new Map();
 for(const r of route.rows){
  if(!['consume','possess'].includes(r.kind)||!pos(r.count)||!key(r.item))throw Error('Invalid requirement');
  const k=r.kind+'|'+key(r.item),old=sums.get(k);
  const count=r.kind==='consume'?(old?.count||0)+r.count:Math.max(old?.count||0,r.count);
  if(!pos(count))throw Error('Requirement exceeds safe count');
  sums.set(k,{...r,count});
 }
 return [...sums.values()].map(r=>{const n=typeof stock==='function'?stock(r.item):null,have=Number.isSafeInteger(n)&&n>=0?n:null;return {...r,have,missing:have===null?null:Math.max(0,r.count-have)}});
}
// Explicit selected alternative, not a claim of fastest farm. Only the reviewed
// Void Crystal A/B single-output merges are enabled for expansion for now.
const VOID=new Set(['void crystal a','void crystal b']);
function selectedRoute(route,integrity){
 if(route.kind!=='merge'||!route.rows.some(r=>VOID.has(key(r.item))))return null;
 const recipes=Object.fromEntries([...VOID].map(k=>{const r=describe(k,integrity);return [k,r&&{...r,yield:1}]}));
 return recipes;
}
// Process a reviewed acyclic graph in parent-before-child topological order.
// Aggregate all parent demand BEFORE allocating stock or calculating batches.
function plan(route,recipes,stock){
 if(typeof stock!=='function')return null;
 const rootKey=key(route.name),nodes=new Map(),visiting=new Set(),order=[];
 function visit(name,recipe){
  const k=key(name);if(visiting.has(k))throw Error('Cyclic recipe dependency: '+k);
  if(nodes.has(k))return;
  if(!recipe||!Array.isArray(recipe.rows))throw Error('Missing recipe: '+k);
  visiting.add(k);
  for(const r of direct(recipe))if(r.kind==='consume'&&Object.hasOwn(recipes,key(r.item)))visit(r.item,recipes[key(r.item)]);
  visiting.delete(k);nodes.set(k,recipe);order.push(k);
 }
 visit(rootKey,route);
 const demand=new Map(),gates=new Map(),allocated=new Map(),outputs=[],leaves=[];
 const add=(r,count)=>{if(!pos(count))throw Error('Invalid expanded quantity');const k=key(r.item),old=demand.get(k);const total=(old?.count||0)+count;if(!pos(total))throw Error('Expanded quantity exceeds safe count');demand.set(k,{item:r.item,count:total})};
 function request(recipe,batches){
  for(const r of direct(recipe)){
   if(r.kind==='possess'){const k=key(r.item),old=gates.get(k);gates.set(k,{item:r.item,count:Math.max(old?.count||0,r.count)});continue}
   add(r,r.count*batches);
  }
 }
 const read=item=>{const n=stock(item);if(!Number.isSafeInteger(n)||n<0)throw Error('Unknown stock');return n};
 request(route,1);
 for(const k of order.reverse()){
  if(k===rootKey)continue;
  const d=demand.get(k);if(!d)continue;
  const recipe=nodes.get(k);if(!pos(recipe.yield))throw Error('Unknown recipe yield: '+k);
  const have=read(d.item),used=Math.min(have,d.count),missing=d.count-used,batches=Math.ceil(missing/recipe.yield);
  allocated.set(k,used);demand.delete(k);
  outputs.push({...d,have,missing,batches,source:recipe.source});
  if(batches)request(recipe,batches);
 }
 for(const [k,d] of demand){const have=read(d.item),used=Math.min(have,d.count);allocated.set(k,used);leaves.push({...d,have,missing:d.count-used})}
 // A gate is evaluated against unallocated stock; no claim about order or
 // ability to reuse a consumed object. Expose overlap as a conflict.
 const possession=[...gates.entries()].map(([k,g])=>{const have=read(g.item),reserved=allocated.get(k)||0;return {...g,have,missing:Math.max(0,g.count-have),overlap:reserved>0&&have-reserved<g.count}});
 return {outputs,leaves,possession};
}
// Direct-only, opt-in combined plan. Never subtract inventory separately per goal.
// An output needed by another goal must be reserved separately; flag this
// dependency rather than silently choosing a route or counting a planned output.
function combine(routes,stock=null){
 const goals=new Map(),consumed=new Map(),gates=new Map();
 for(const route of routes){
  if(!route||!key(route.name)||!['merge','quest'].includes(route.kind))throw Error('Unreviewed goal route');
  const k=key(route.name);if(goals.has(k))continue;goals.set(k,route);
  for(const r of direct(route)){
   const map=r.kind==='consume'?consumed:gates,ik=key(r.item),previous=map.get(ik);
   const count=r.kind==='consume'?(previous?.count||0)+r.count:Math.max(previous?.count||0,r.count);
   if(!pos(count))throw Error('Combined requirement exceeds safe count');
   map.set(ik,{item:previous?.item||r.item,count,kind:r.kind,goals:[...(previous?.goals||[]),{name:route.name,count:r.count}]});
  }
 }
 const cache=new Map();
 const read=item=>{const k=key(item);if(!cache.has(k)){const n=typeof stock==='function'?stock(item):null;cache.set(k,Number.isSafeInteger(n)&&n>=0?n:null)}return cache.get(k)};
 const rows=[...consumed.values()].map(r=>{const have=read(r.item);return {...r,have,missing:have===null?null:Math.max(0,r.count-have),outputConflict:goals.has(key(r.item))}});
 const possession=[...gates.values()].map(r=>{const have=read(r.item),used=consumed.get(key(r.item))?.count||0;return {...r,have,missing:have===null?null:Math.max(0,r.count-have),overlap:used>0&&(have===null||have-Math.min(have,used)<r.count),outputConflict:goals.has(key(r.item))}});
 return {goals:[...goals.values()].map(r=>({name:r.name,source:r.source,kind:r.kind})),rows,possession};
}

 // Read-only recommendation for one goal. Stock coverage is not game eligibility,
 // time-to-complete, or simultaneous allocation across goals.
 function stockIndex(items){
  const map=new Map();
  for(const item of items||[]){
   const k=key(item?.Name);if(!k)continue;
   const n=Number(item.Count),prior=map.has(k)?map.get(k):0;
   const total=prior===null||item.Count===null||item.Count===''||!Number.isSafeInteger(n)||n<0?null:prior+n;
   map.set(k,Number.isSafeInteger(total)&&total>=0?total:null);
  }
  return name=>map.has(key(name))?map.get(key(name)):0;
 }
 function recommend(project,{quest,integrity,stock=null}={}){
  const pending={rank:3,state:'Pending review',detail:'Review the acquisition requirements in Wishlist.',coverage:'No reviewed route available'};
  if(!project?.name)return pending;
  if(quest?.matches(project.name)){
   const stages=quest.evaluate(quest.stages,quest.status(project),stock);
   const stage=stages.find(s=>s.state!=='done');
   if(!stage)return {rank:0,state:'Verify claim',detail:'All eight quests are manually marked complete. Check the class shop in game.',coverage:'Source-reviewed questline · manual completion',join:'/join terminatemple',source:quest.shop};
   const coverage='Source-reviewed questline · '+stages.filter(s=>s.state==='done').length+'/'+stages.length+' quests marked complete';
   const gate=[stage.level?'Level '+stage.level:null,stage.reputation].filter(Boolean).join(' · ');
   const note=(gate?gate+' · ':'')+'Confirm quest access and eligibility in game.';
   const base={coverage,source:quest.wiki,note};
   if(stage.blocked.length)return {...base,rank:2,state:'Verify previous quest',detail:stage.name+' — previous quest not confirmed.'};
   if(stage.rows.some(r=>r.missing===null))return {...base,rank:2,state:'Stock unknown',detail:stage.name+' — import a full inventory to check requirements.'};
   const missing=stage.rows.filter(r=>r.missing>0);
   if(missing.length){const r=missing[0];return {...base,rank:1,state:'Materials missing',detail:stage.name+' — '+r.missing.toLocaleString('en-US')+' '+r.item+' remaining.',item:r.item,join:r.join,missingTypes:missing.length}}
   return {...base,rank:0,state:'Turn-in stock available',detail:stage.name+' — listed materials available; verify and turn in manually.',join:'/join terminatemple'};
  }
  if(!integrity)return pending;
  const route=describe(project.name,integrity);if(!route)return pending;
  const result=combine([route],stock),rows=[...result.rows,...result.possession];
  const base={source:route.source,coverage:'Source-reviewed direct requirements',note:'Verify access, availability and other requirements in game.'};
  if(!rows.length)return pending;
  if(rows.some(r=>r.missing===null))return {...base,rank:2,state:'Stock unknown',detail:'Import a full inventory to check direct requirements.'};
  if(rows.some(r=>r.overlap||r.outputConflict))return {...base,rank:2,state:'Verify requirement order',detail:'A possession gate or goal output overlaps with consumed stock.'};
  const gate=result.possession.find(r=>r.missing>0);
  if(gate)return {...base,rank:1,state:'Possession gate missing',detail:'Obtain '+gate.item+' ('+gate.missing.toLocaleString('en-US')+' remaining).',item:gate.item};
  const missing=result.rows.filter(r=>r.missing>0);
  if(missing.length){const r=missing[0];return {...base,rank:1,state:'Materials missing',detail:r.missing.toLocaleString('en-US')+' '+r.item+' remaining.',item:r.item,missingTypes:missing.length}}
  return {...base,rank:0,state:'Direct stock available',detail:route.kind==='quest'?'Check the documented quest and confirm its gates in game.':'Check the documented merge shop and confirm eligibility in game.'};
 }
 function rankRecommendations(rows){
  return [...rows].sort((a,b)=>a.recommendation.rank-b.recommendation.rank||String(a.project.name).localeCompare(String(b.project.name))||String(a.project.id||'').localeCompare(String(b.project.id||'')));
 }

const api={key,describe,direct,selectedRoute,plan,combine,stockIndex,recommend,rankRecommendations};
if(typeof module==='object'&&module.exports)module.exports=api;else root.AQWCMergeDependencies=api;
})(typeof globalThis==='object'?globalThis:this);
