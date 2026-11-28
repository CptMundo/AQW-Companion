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
 return {goals:[...goals.values()].map(r=>({name:r.name,source:r.source,kind:r.kind,...(r.stage?{stage:r.stage}:{})})),rows,possession};
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
   if(missing.length){const r=missing[0];return {...base,rank:1,state:'Materials missing',detail:stage.name+' — '+r.missing.toLocaleString('en-US')+' '+r.item+' remaining.',item:r.item,join:r.join,missingTypes:missing.length,needs:missing.map(({item,missing})=>({item,missing}))}}
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
  if(gate)return {...base,rank:1,state:'Possession gate missing',detail:'Obtain '+gate.item+' ('+gate.missing.toLocaleString('en-US')+' remaining).',item:gate.item,needs:result.rows.filter(r=>r.missing>0).map(({item,missing})=>({item,missing}))};
  const missing=result.rows.filter(r=>r.missing>0);
  if(missing.length){const r=missing[0];return {...base,rank:1,state:'Materials missing',detail:r.missing.toLocaleString('en-US')+' '+r.item+' remaining.',item:r.item,missingTypes:missing.length,needs:missing.map(({item,missing})=>({item,missing}))}}
  return {...base,rank:0,state:'Direct stock available',detail:route.kind==='quest'?'Check the documented quest and confirm its gates in game.':'Check the documented merge shop and confirm eligibility in game.'};
 }
 function rankRecommendations(rows){
  // Same action category: fewer distinct missing ingredient types first.
  // This is a simple checklist heuristic, never a time estimate.
  const count=r=>Number.isSafeInteger(r.recommendation.missingTypes)?r.recommendation.missingTypes:Infinity;
  return [...rows].sort((a,b)=>a.recommendation.rank-b.recommendation.rank||(a.recommendation.rank===1&&b.recommendation.rank===1?count(a)-count(b):0)||String(a.project.name).localeCompare(String(b.project.name))||String(a.project.id||'').localeCompare(String(b.project.id||'')));
 }
 function recommendationCounts(rows){
  const counts=[0,0,0,0];for(const {recommendation:r} of rows||[]){if(Number.isInteger(r?.rank)&&r.rank>=0&&r.rank<4)counts[r.rank]++}return counts;
 }


// Opportunities match only explicitly quantified catalog rewards to known
// shortages. No substring matching, guessed rewards, or assumed eligibility.
function recurringOpportunities(rows,tasks,{isRecurring=()=>false,isDone=()=>false,isBlocked=()=>false,isPinned=()=>false,canonicalId=id=>id}={}){
 const needs=new Map();
 for(const {project,recommendation} of rows||[]){
  for(const n of recommendation?.needs||[]){
   if(!Number.isSafeInteger(n.missing)||n.missing<=0||!key(n.item))continue;
   const k=key(n.item),goals=needs.get(k)||new Map();
   goals.set(key(project.name),{name:project.name,item:n.item,missing:n.missing});needs.set(k,goals);
  }
 }
 const found=new Map();
 for(const t of tasks||[]){
  if(!t?.id||!['daily','weekly'].includes(t.freq)||t.kind==='activity'||!isRecurring(t)||isDone(t)||isBlocked(t))continue;
  if(typeof t.wiki!=='string'||!/^https:\/\/aqwwiki\.wikidot\.com\/[a-z0-9-]+$/i.test(t.wiki))continue;
  const matches=new Map();
  for(const reward of t.rewards||[]){
   const match=String(reward).match(/^(.+?)\s+×([1-9][0-9,]*)$/);
   if(!match)continue;
   const k=key(match[1]),goals=needs.get(k);
   if(!goals||!Number.isSafeInteger(Number(match[2].replace(/,/g,''))))continue;
   matches.set(k,{reward,goals:[...goals.values()]});
  }
  if(!matches.size)continue;
  const id=canonicalId(t.id),k=t.freq+'|'+id;
  if(!found.has(k))found.set(k,{task:t,id,matches:[...matches.values()],pinned:!!isPinned(id)});
 }
 // Keep alternative tasks visible individually, but do not imply both can
 // be completed. The UI explicitly labels exclusive groups.
 return [...found.values()].sort((a,b)=>Number(b.task.freq==='daily')-Number(a.task.freq==='daily')||Number(a.pinned)-Number(b.pinned)||a.task.name.localeCompare(b.task.name)||a.id.localeCompare(b.id));
}

// Only the first unconfirmed reviewed stage contributes to the shared plan.
// Later stages and optional alternative recipes are never summed into it.
function stagedGoal(project,quest){
 if(!quest?.matches(project?.name))return null;
 const stages=quest.evaluate(quest.stages,quest.status(project),null);
 const index=stages.findIndex(s=>s.state!=='done'),name=quest.recipe(project.name).name;
 const acquisition=quest.acquisition(project.name),methods=acquisition?.methods||[];
 const claim=index<0,source=claim?quest.shop:quest.wiki;
 const method=methods.find(m=>m.url===source);
 if(!method||!/^\/join [a-z0-9-]+$/i.test(method.join||'')||!/^https:\/\/aqwwiki\.wikidot\.com\/[a-z0-9-]+$/i.test(source||''))return null;
 const s=claim?null:stages[index],blocked=!!s?.blocked.length;
 const stage={id:s?.id||'claim',name:s?.name||'Claim class',index:claim?stages.length:index+1,total:stages.length,checked:stages.filter(x=>x.state==='done').length,claim,blocked,level:s?.level||null,reputation:s?.reputation||null,note:s?.note||null,alternative:s?.alternative||null,join:method.join,source,rows:blocked||claim?[]:s.rows.map(r=>({item:r.item,count:r.count,join:r.join,kind:'consume'}))};
 return {name,kind:'quest',source,rows:stage.rows.map(({item,count,kind})=>({item,count,kind})),stage};
}

// A destination is a reviewed acquisition/turn-in location, NOT necessarily
// the map where ingredients drop. No extra recipe expansion or stock allocation.
function farmingDestinations(combined,integrity){
 const groups=new Map(),unmapped=[],deferred=[];
 const all=[...combined.rows,...combined.possession];
 const conflicts=new Set(all.filter(r=>r.overlap||r.outputConflict).map(r=>key(r.item)));
 const stageMaps=new Map();
 for(const goal of combined.goals)for(const r of goal.stage?.rows||[]){
  if(!/^\/join [a-z0-9-]+$/i.test(r.join||''))continue;
  const k=key(r.item),list=stageMaps.get(k)||[];
  if(!list.some(x=>x.join===r.join&&x.goal===goal.name))list.push({join:r.join,source:goal.stage.source,role:'Stage farm / acquisition',goal:goal.name,title:goal.stage.name});
  stageMaps.set(k,list);
 }
 function destination(name){
  const route=describe(name,integrity);if(!route)return null;
  const acquisition=route.kind==='merge'?integrity.getAcquisition(name):integrity.guidanceAcquisition(name);
  const methods=acquisition?.methods||[];
  if(methods.length!==1||!integrity.sourceUrl(route.source))return null;
  const method=methods[0];
  if(method.url!==route.source||!/^\/join [a-z0-9-]+$/i.test(method.join||''))return null;
  return {join:method.join.toLowerCase(),source:route.source,role:route.kind==='merge'?'Merge':'Quest turn-in',title:method.title};
 }
 function add(dest,entry){
  if(!groups.has(dest.join))groups.set(dest.join,{join:dest.join,entries:[]});
  groups.get(dest.join).entries.push({...entry,...dest});
 }
 for(const row of all){
  if(row.missing===null||conflicts.has(key(row.item))){
   deferred.push({item:row.item,kind:row.kind,reason:conflicts.has(key(row.item))?'Verify stock allocation / ordering':'Stock unknown'});continue;
  }
  if(!row.missing)continue;
  const dest=destination(row.item);
  const entry={item:row.item,kind:row.kind,count:row.missing,goals:row.goals.map(g=>g.name)};
  const stageDestinations=stageMaps.get(key(row.item))||[];
  if(row.kind==='consume'&&stageDestinations.length){
   for(const stageDest of stageDestinations)add(stageDest,{...entry,type:'material',stageFarm:true});
  }else if(dest)add(dest,{...entry,type:'material'});
  else unmapped.push(entry);
 }
 for(const goal of combined.goals){
  const stage=goal.stage;
  const dest=stage?{join:stage.join,source:stage.source,role:stage.claim?'Class shop':'Accept / turn in stage',title:stage.name}:destination(goal.name);
  const relevant=all.filter(r=>r.goals.some(g=>key(g.name)===key(goal.name)));
  const state=relevant.some(r=>r.missing===null||conflicts.has(key(r.item)))?'Verify allocation / stock':relevant.some(r=>r.missing>0)?'Ingredients or gates missing':'Check access and turn in';
  if(dest)add(dest,{item:goal.name,type:'goal',state:stage?.blocked?'Verify previous quest':stage?.claim?'All stages manually checked — verify claim in game':state,...(stage?{stageName:stage.name}:{})});
  else deferred.push({item:goal.name,kind:'goal',reason:'Destination not reviewed'});
 }
 return {groups:[...groups.values()].sort((a,b)=>a.join.localeCompare(b.join)),unmapped,deferred};
}

// Match recurring quest rewards against the combined, not per-project, shortage.
// The same quest is only one opportunity per period, regardless of map count.
function farmingRoutineRoutes(combined,tasks,options={}){
 const all=[...combined.rows,...combined.possession],conflicts=new Set(all.filter(r=>r.overlap||r.outputConflict).map(r=>key(r.item)));
 const needed=new Map(combined.rows.filter(r=>Number.isSafeInteger(r.missing)&&r.missing>0&&!conflicts.has(key(r.item))).map(r=>[key(r.item),r]));
 const rows=combined.goals.map(project=>({project,recommendation:{needs:[...needed.values()].filter(r=>r.goals.some(g=>key(g.name)===key(project.name))).map(r=>({item:r.item,missing:r.missing}))}}));
 const opportunities=recurringOpportunities(rows,tasks,options),groups=new Map(),unmapped=[],quests=[];
 const safeJoin=v=>typeof v==='string'&&/^\/join [a-z0-9-]+$/i.test(v)?v.toLowerCase():null;
 const safeSource=v=>typeof v==='string'&&/^https:\/\/aqwwiki\.wikidot\.com\/[a-z0-9-]+$/i.test(v)?v:null;
 for(const o of opportunities){
  const t=o.task,locations=new Map(),info=options.routeFor?.(t.id);
  const matchRows=o.matches.map(m=>{
   const row=needed.get(key(m.reward.replace(/\s+×[1-9][0-9,]*$/,'')));
   const cap=options.capFor?.(row.item);
   return {item:row.item,reward:m.reward,missing:row.missing,goals:row.goals.map(g=>g.name),cap:cap||null};
  });
  const entry={id:o.id,name:t.name,freq:t.freq,pinned:o.pinned,exclusiveGroup:t.exclusiveGroup||null,source:t.wiki,note:t.note||'',matches:matchRows};
  quests.push(entry);
  function add(join,role,detail,source){
   join=safeJoin(join);source=safeSource(source);if(!join||!source)return;
   if(!locations.has(join))locations.set(join,[]);
   const list=locations.get(join);if(!list.some(x=>x.role===role&&x.detail===detail&&x.source===source))list.push({role,detail,source});
  }
  // The catalog distinguishes acceptance from farm location. Never infer
  // a turn-in map from the farm map, or guess a pet owner's location.
  add(t.acceptJoin||(!t.farmJoin?t.join:null),'Accept / check turn-in',t.npc||'Quest acceptance location',t.wiki);
  add(t.farmJoin||(t.acceptJoin&&t.join!==t.acceptJoin?t.join:null),'Farm / boss','Catalog farm location',t.wiki);
  if(safeSource(info?.wiki)){
   for(const target of info.targets||[]){
    if(!Array.isArray(target)||!target[0]||!target[1]||/check (?:challenge|the current|current)|\?\?\?/i.test(target[1]))continue;
    add(target[2],'Farm / boss',target[0]+' · '+target[1],info.wiki);
   }
  }
  // Turn-in is only an independently documented field, not a guess.
  add(t.turnInJoin,'Turn in','Documented turn-in location',t.wiki);
  if(!locations.size)unmapped.push(entry);
  for(const [join,roles] of locations){
   if(!groups.has(join))groups.set(join,{join,entries:[]});
   groups.get(join).entries.push({...entry,roles});
  }
 }
 return {quests,groups:[...groups.values()].sort((a,b)=>a.join.localeCompare(b.join)),unmapped};
}
const api={key,describe,direct,selectedRoute,plan,combine,stockIndex,recommend,rankRecommendations,recommendationCounts,recurringOpportunities,farmingDestinations,farmingRoutineRoutes,stagedGoal};
if(typeof module==='object'&&module.exports)module.exports=api;else root.AQWCMergeDependencies=api;
})(typeof globalThis==='object'?globalThis:this);
