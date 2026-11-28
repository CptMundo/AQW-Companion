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
const api={key,describe,direct,selectedRoute,plan};
if(typeof module==='object'&&module.exports)module.exports=api;else root.AQWCMergeDependencies=api;
})(typeof globalThis==='object'?globalThis:this);
