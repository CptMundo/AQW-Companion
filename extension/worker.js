'use strict';
if(typeof importScripts==='function')importScripts('account-capture.js','badge-capture.js','unified-sync.js');
const KEY='aqwc-inventory-v1', MAX_ROWS=20000, MAX_BYTES=6000000;
const SITE='https://cptmundo.github.io';
function mainSender(sender){
 try{const u=new URL(sender.url);return sender.frameId===0&&u.origin===SITE&&['/AQW-Companion/','/AQW-Companion/index.html'].includes(u.pathname)}catch{return false}
}
function popupSender(sender){return sender.url===chrome.runtime.getURL('popup.html')&&!sender.tab}
function cleanSnapshot(value){
 if(!value||!Array.isArray(value.items)||value.items.length>MAX_ROWS||typeof value.exportedAt!=='string'||value.exportedAt.length>100)throw Error('Invalid or oversized snapshot.');
 const items=value.items.map(row=>{
  if(!row||typeof row.ID!=='string'||!row.ID||row.ID.length>128||typeof row.Name!=='string'||!row.Name.trim()||row.Name.length>350||typeof row.Type!=='string'||row.Type.length>100||!Number.isSafeInteger(row.Count)||row.Count<0||![0,1].includes(row.Bank))throw Error('Invalid inventory row.');
  return {ID:row.ID,Name:row.Name,Type:row.Type,Count:row.Count,Bank:row.Bank};
 });
 const data={schema:1,exportedAt:value.exportedAt,syncedAt:new Date().toISOString(),items};
 if(new TextEncoder().encode(JSON.stringify(data)).length>MAX_BYTES)throw Error('Snapshot exceeds local storage limit.');
 return data;
}
async function restrictStorage(){if(chrome.storage.local.setAccessLevel)await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});}

function wikiSender(sender){
 try{const u=new URL(sender.url);return sender.frameId===0&&u.origin==='https://aqwwiki.wikidot.com'&&/^\/[a-z0-9][a-z0-9-]*\/?$/.test(u.pathname)}catch{return false}
}
const nameKey=s=>String(s||'').normalize('NFC').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim().toLowerCase();
const wikiTypes={
 swords:['sword','weapon'],axes:['axe','weapon'],bows:['bow','weapon'],daggers:['dagger','weapon'],gauntlets:['gauntlet','weapon'],guns:['gun','weapon'],handguns:['handgun','gun','weapon'],maces:['mace','weapon'],polearms:['polearm','weapon'],rifles:['rifle','gun','weapon'],staffs:['staff','weapon'],wands:['wand','weapon'],weapons:['weapon','sword','axe','bow','dagger','gauntlet','gun','handgun','mace','polearm','rifle','staff','wand'],classes:['class'],armors:['armor'], 'capes-back-items':['cape','back item'],'capes':['cape','back item'],'helmets-hoods':['helm','helmet','hood'],'helmets':['helm','helmet','hood'],pets:['pet','battle pet'],'battle-pets':['pet','battle pet'],'misc-items':['item','misc','misc item','miscellaneous','resource','quest item','use item'],'use-items':['item','misc','misc item','miscellaneous','use item','consumable'],grounds:['ground'],necklaces:['necklace','amulet'],houses:['house'],'floor-items':['house floor item','floor item','house item'],'wall-items':['house wall item','wall item','house item'],housing:['house','house item','house floor item','house wall item','floor item','wall item'],enhancements:['enhancement']
};
function matchWikiItem(snapshot,query){
 if(!query||typeof query.name!=='string'||!query.name.trim()||query.name.length>350||typeof query.category!=='string'||query.category.length>60)return {state:'unsupported'};
 const allowed=Object.hasOwn(wikiTypes,query.category)?wikiTypes[query.category]:null;
 if(!allowed)return {state:'unsupported'};
 if(!snapshot||!Array.isArray(snapshot.items))return {state:'unsynced'};
 const syncedAt=snapshot.syncedAt,exportedAt=snapshot.exportedAt;
 const key=nameKey(query.name),typed=snapshot.items.filter(row=>row.Count>0&&allowed.includes(nameKey(row.Type)));
 let found=typed.filter(row=>nameKey(row.Name)===key),basis='exact name';
 if(!found.length){
  const suffix=key.match(/^(.*) \((sword|axe|bow|dagger|gauntlet|gun|handgun|mace|polearm|rifle|staff|wand|armor|class|helm|cape|pet|item)\)$/);
  if(suffix&&allowed.includes(suffix[2])){found=typed.filter(row=>nameKey(row.Name)===suffix[1]);basis='name without Wiki type suffix'}
 }
 // Acquisition variants are not interchangeable: the game export may omit the Wiki qualifier.
 if(!found.length&&/\s\([^)]+\)$/.test(key)){
  const plain=key.replace(/\s\([^)]+\)$/,'');
  if(typed.some(row=>nameKey(row.Name)===plain))return {state:'ambiguous',syncedAt,exportedAt};
 }
 if(!found.length){
  if(snapshot.items.some(row=>row.Count>0&&nameKey(row.Name)===key))return {state:'ambiguous',syncedAt,exportedAt};
  return {state:'not-found',syncedAt,exportedAt};
 }
 if(new Set(found.map(row=>row.ID)).size!==1)return {state:'ambiguous',syncedAt,exportedAt};
 const bank=found.filter(row=>row.Bank===1).reduce((n,row)=>n+row.Count,0);
 const inventory=found.filter(row=>row.Bank===0).reduce((n,row)=>n+row.Count,0);
 return {state:'owned',bank,inventory,total:bank+inventory,basis,syncedAt,exportedAt};
}


function matchWikiMaterial(snapshot,name){
 if(!snapshot||!Array.isArray(snapshot.items))return {state:'unsynced'};
 const key=nameKey(name),suffix=key.match(/^(.*) \((sword|axe|bow|dagger|gauntlet|gun|handgun|mace|polearm|rifle|staff|wand|armor|class|helm|cape|pet|item|misc)\)$/);
 const rows=snapshot.items.filter(row=>row.Count>0);
 let found=rows.filter(row=>nameKey(row.Name)===key);
 if(suffix){
  const categories={axe:'axes',staff:'staffs',class:'classes',armor:'armors',helm:'helmets',item:'misc-items',misc:'misc-items'};
  const category=categories[suffix[2]]||suffix[2]+'s';
  const allowed=Object.hasOwn(wikiTypes,category)?wikiTypes[category]:[suffix[2]];
  const exact=found.filter(row=>allowed.includes(nameKey(row.Type)));
  const candidates=rows.filter(row=>nameKey(row.Name)===suffix[1]&&allowed.includes(nameKey(row.Type)));
  if(!exact.length&&!candidates.length&&(found.length||rows.some(row=>nameKey(row.Name)===suffix[1])))return {state:'ambiguous'};
  found=[...new Set([...exact,...candidates])];
 }else if(!found.length&&/\s\([^)]+\)$/.test(key)){
  if(rows.some(row=>nameKey(row.Name)===key.replace(/\s\([^)]+\)$/,'')))return {state:'ambiguous'};
 }
 if(!found.length)return {state:'not-found'};
 if(new Set(found.map(row=>row.ID)).size!==1||new Set(found.map(row=>nameKey(row.Type))).size!==1)return {state:'ambiguous'};
 const bank=Math.max(0,...found.filter(r=>r.Bank===1).map(r=>r.Count)),inventory=Math.max(0,...found.filter(r=>r.Bank===0).map(r=>r.Count));
 return {state:'owned',bank,inventory,total:bank+inventory,itemId:String(found[0].ID)};
}


const ACCOUNT_STAGE='aqwc-account-stage-v1';
function cleanAccountSnapshot(value){
 const data=cleanSnapshot(value);
 if(!Number.isSafeInteger(value.reportedTotal)||value.reportedTotal<1||value.reportedTotal!==data.items.length||data.items.length>10000||!Number.isFinite(Date.parse(data.exportedAt)))throw Error('Incomplete account inventory.');
 const ids=new Set();
 data.items=data.items.map((row,i)=>{
  const key=JSON.stringify([row.ID,row.Bank]);if(ids.has(key)||row.Count<1)throw Error('Duplicate or empty account item.');ids.add(key);
  const source=value.items[i],out={...row};
  for(const field of ['Coins','Member','MaxStack','MaxStackSize','MaxQuantity'])if(Number.isSafeInteger(source[field])&&source[field]>=0)out[field]=source[field];
  if(typeof source.Added==='string'&&source.Added.length<=100)out.Added=source.Added;
  return out;
 });
 if(new TextEncoder().encode(JSON.stringify(data)).length>MAX_BYTES)throw Error('Account snapshot exceeds local storage limit.');
 return {exportedAt:data.exportedAt,reportedTotal:value.reportedTotal,items:data.items};
}
function accountInventorySender(sender){
 try{const u=new URL(sender.url);return sender.frameId===0&&u.origin==='https://account.aq.com'&&/^\/AQW\/Inventory\/?$/i.test(u.pathname)}catch{return false}
}
async function accountStage(message,sender){
 const popup=popupSender(sender),main=mainSender(sender),account=accountInventorySender(sender);
 if(!popup&&!main&&!account)return null;
 if(!['account-stage','account-stage-summary','account-stage-discard','account-stage-read','account-stage-commit'].includes(message?.type))return null;
 await restrictStorage();
 if((popup||account)&&message.type==='account-stage'){
  const snapshot=cleanAccountSnapshot(message.snapshot),id=crypto.randomUUID();
  await chrome.storage.local.set({[ACCOUNT_STAGE]:{id,snapshot}});
  return {ok:true,count:snapshot.items.length};
 }
 if(popup&&message.type==='account-stage-discard'){await chrome.storage.local.remove(ACCOUNT_STAGE);return {ok:true}}
 const stage=(await chrome.storage.local.get(ACCOUNT_STAGE))[ACCOUNT_STAGE];
 if(popup&&message.type==='account-stage-summary')return {ok:true,count:stage?.snapshot?.items?.length??null};
 if(main&&message.type==='account-stage-read')return stage?{ok:true,id:stage.id,snapshot:stage.snapshot}:{ok:false,error:'No captured inventory. Open the Account Manager and capture it first.'};
 if(main&&message.type==='account-stage-commit'){
  if(!stage||stage.id!==message.id)return {ok:false,error:'Pending snapshot changed. Sync the imported inventory manually.'};
  const data=cleanSnapshot(stage.snapshot);await chrome.storage.local.set({[KEY]:data});await chrome.storage.local.remove(ACCOUNT_STAGE);return {ok:true,count:data.items.length};
 }
 return {ok:false,error:'Unsupported account import request.'};
}


const WISHLIST_QUEUE='aqwc-wishlist-queue-v1';
let wishlistLock=Promise.resolve();
function queueWishlist(message,sender){
 const run=async()=>{
  const wiki=wikiSender(sender),main=mainSender(sender),type=message?.type;
  if(!(wiki&&['wishlist-queue-add','routine-queue-add','quest-pin-add','quest-pin-complete'].includes(type)||main&&['wishlist-queue-read','wishlist-queue-ack'].includes(type)))return {ok:false,error:'Unsupported Wishlist request.'};
  await restrictStorage();
  const raw=(await chrome.storage.local.get(WISHLIST_QUEUE))[WISHLIST_QUEUE],entries=Array.isArray(raw)?raw:[];
  if(type==='wishlist-queue-read')return {ok:true,entries};
  if(type==='wishlist-queue-ack'){
   if(!Array.isArray(message.ids)||message.ids.length>200||message.ids.some(id=>typeof id!=='string'||id.length>64))return {ok:false,error:'Invalid acknowledgement.'};
   await chrome.storage.local.set({[WISHLIST_QUEUE]:entries.filter(e=>!message.ids.includes(e.id))});return {ok:true};
  }
  if(type==='routine-queue-add'||type==='quest-pin-add'||type==='quest-pin-complete'){
   const quest=message.quest,source=new URL(sender.url).pathname.replace(/^\/|\/$/g,'');
   if(!quest||quest.source!==source||typeof quest.name!=='string'||!quest.name.trim()||quest.name.length>350||/[\u0000-\u001f\u007f]/.test(quest.name))return {ok:false,error:'Invalid quest.'};
   if(type==='quest-pin-complete'){const data=(await chrome.storage.local.get(GOAL_STATUS))[GOAL_STATUS];if(goalStatus(data,{kind:'quest',name:quest.name},source).state!=='saved')return {ok:false,error:'Pin and sync this quest first.'};}
   if(entries.some(e=>e.quest?.source===source&&nameKey(e.quest.name)===nameKey(quest.name)&&!!e.quest.pin===(type!=='routine-queue-add')&&!!e.quest.complete===(type==='quest-pin-complete')))return {ok:true,already:true};
   if(entries.length>=200)return {ok:false,error:'Pending queue is full. Open Companion to sync.'};
   await chrome.storage.local.set({[WISHLIST_QUEUE]:[...entries,{id:crypto.randomUUID(),quest:{source,name:quest.name.trim(),...(type!=='routine-queue-add'?{pin:true}:{}),...(type==='quest-pin-complete'?{complete:true}:{})}}]});return {ok:true};
  }
  const item=message.item;
  if(!item||typeof item.name!=='string'||!item.name.trim()||item.name.length>350||/[\u0000-\u001f\u007f]/.test(item.name)||typeof item.slug!=='string'||! /^[a-z0-9][a-z0-9-]{0,199}$/.test(item.slug)||typeof item.category!=='string'||!Object.hasOwn(wikiTypes,item.category)||(new URL(sender.url).pathname.replace(/^\/|\/$/g,'')!==item.slug&&wikiListCategory(sender)!==item.category))return {ok:false,error:'Invalid Wiki item.'};
  if(entries.some(e=>e.item?.slug===item.slug&&e.item?.category===item.category))return {ok:true,already:true};
  if(entries.length>=200)return {ok:false,error:'Pending Wishlist is full. Open Companion to sync.'};
  const entry={id:crypto.randomUUID(),item:{name:item.name.trim(),slug:item.slug,category:item.category}};
  await chrome.storage.local.set({[WISHLIST_QUEUE]:[...entries,entry]});return {ok:true};
 };
 const result=wishlistLock.then(run);wishlistLock=result.catch(()=>{});return result;
}


const listCategories=['helmets-hoods','capes-back-items','battle-pets','misc-items','use-items','floor-items','wall-items','enhancements','classes','armors','swords','axes','bows','daggers','gauntlets','guns','handguns','maces','polearms','rifles','staffs','wands','pets','grounds','necklaces','houses'];
function wikiListCategory(sender){
 if(!wikiSender(sender))return null;
 const slug=new URL(sender.url).pathname.replace(/^\/|\/$/g,'');
 if(listCategories.includes(slug))return slug;
 return /^sort-by-[a-z0-9-]+$/.test(slug)?listCategories.find(c=>slug.endsWith('-'+c))||null:null;
}
const listFamily=k=>k.replace(/(?:\s*\((?:0 ac|ac|non-legend|legend|merge|rare|seasonal|member|non-member|class|sword|armor|helm|cape|pet|misc|item|\d+)\))+$/i,'').trim();
function buildListMatcher(snapshot,category){
 if(!snapshot||!Array.isArray(snapshot.items))return ()=>({state:'unsynced'});
 const allowed=Object.hasOwn(wikiTypes,category)?wikiTypes[category]:null;if(!allowed)return ()=>({state:'unsupported'});
 const all=new Set(),families=new Map(),typed=new Map();
 for(const row of snapshot.items){
  if(!(row.Count>0))continue;const key=nameKey(row.Name),family=listFamily(key);all.add(key);
  if(!families.has(family))families.set(family,new Set());families.get(family).add(row.Name);
  if(!allowed.includes(nameKey(row.Type)))continue;
  if(!typed.has(key))typed.set(key,[]);typed.get(key).push(row);
 }
 return name=>{
  const key=nameKey(name),suffix=key.match(/^(.*) \((sword|axe|bow|dagger|gauntlet|gun|handgun|mace|polearm|rifle|staff|wand|armor|class|helm|cape|pet|item)\)$/);
  let found=typed.get(key)||[];
  if(suffix&&allowed.includes(suffix[2]))found=[...found,...(typed.get(suffix[1])||[])];
  if(found.length&&new Set(found.map(r=>r.ID)).size===1){
   const bank=Math.max(0,...found.filter(r=>r.Bank===1).map(r=>r.Count)),inventory=Math.max(0,...found.filter(r=>r.Bank===0).map(r=>r.Count));
   return {state:'owned',bank,inventory,total:bank+inventory};
  }
  if(found.length||all.has(key))return {state:'ambiguous'};
  const base=listFamily(key),possible=families.get(base);
  if(base!==key&&possible?.size)return {state:'ambiguous',possible:[...possible].slice(0,3)};
  if(/\s\([^)]+\)$/.test(key)&&base===key)return {state:'ambiguous'};
  // A plain index name can also have a qualified inventory variant.
  if(possible?.size)return {state:'ambiguous',possible:[...possible].slice(0,3)};
  return {state:'not-found'};
 };
}
function matchWikiListItem(snapshot,name,category){return buildListMatcher(snapshot,category)(name)}
function searchLocalInventory(snapshot,query,location){
 if(!snapshot||!Array.isArray(snapshot.items))return {rows:[],total:0,syncedAt:null};
 const q=nameKey(query),rows=new Map();
 if(q.length<2||q.length>120||!['all','bag','bank'].includes(location))return {rows:[],total:0,syncedAt:snapshot.syncedAt};
 for(const r of snapshot.items){
  if(!r.Count||!nameKey(r.Name).includes(q)||location==='bag'&&r.Bank!==0||location==='bank'&&r.Bank!==1)continue;
  const key=JSON.stringify([r.ID,r.Bank]);const old=rows.get(key);
  if(!old||old.count<r.Count)rows.set(key,{name:r.Name,type:r.Type,count:r.Count,bank:r.Bank});
 }
 const sorted=[...rows.values()].sort((a,b)=>Number(nameKey(b.name)===q)-Number(nameKey(a.name)===q)||a.name.localeCompare(b.name)||a.bank-b.bank);
 return {rows:sorted.slice(0,50),total:sorted.length,syncedAt:snapshot.syncedAt};
}
const APPEARANCE_KEY='aqwc-wiki-appearance-v1';
// Content scripts cannot receive storage changes under TRUSTED_CONTEXTS.
// Send a narrow notification to our own content scripts instead. URL metadata
// may be unavailable without tabs permission; unknown tabs receive only the
// non-sensitive notification and non-matching scripts ignore it.
async function notifyTabs(type,origin){
 if(!chrome.tabs?.query||!chrome.tabs?.sendMessage)return {delivered:0};
 try{
  const tabs=await chrome.tabs.query({});
  const origins=Array.isArray(origin)?origin:[origin];
  const targets=tabs.filter(t=>Number.isInteger(t.id)&&(!t.url||origins.some(prefix=>t.url.startsWith(prefix))));
  const results=await Promise.allSettled(targets.map(t=>chrome.tabs.sendMessage(t.id,{type},{frameId:0})));
  return {delivered:results.filter(r=>r.status==='fulfilled'&&r.value?.ok===true).length};
 }catch{return {delivered:0}}
}

function normalizeAppearance(value){
 const v=value&&typeof value==='object'?value:{};
 return {background:['companion','dark','light','cas','stars'].includes(v.background)?v.background:'companion',banner:'prometheus',panel:'integrated'};
}

const GOAL_STATUS='aqwc-goal-status-v1';
function cleanGoalStatus(v){
 if(!v||!Array.isArray(v.goals)||!Array.isArray(v.pins)||v.goals.length>500||v.pins.length>500)return null;
 const name=x=>typeof x==='string'&&x.trim()&&x.length<=350&&!/[\u0000-\u001f\u007f]/.test(x);
 if(v.goals.some(x=>!name(x?.name)||!Number.isFinite(x.progress)||x.progress<0||x.progress>100)||v.pins.some(x=>!name(x?.name)||typeof x.source!=='string'||! /^[a-z0-9][a-z0-9-]{0,199}$/.test(x.source)||typeof x.completed!=='boolean'))return null;
 const r=v.routines;const validPeriod=(x,p)=>typeof x==='string'&&new RegExp('^'+p+':\\d{4}-\\d{2}-\\d{2}$').test(x);
 const routines=r&&validPeriod(r.dailyPeriod,'d')&&validPeriod(r.weeklyPeriod,'w')&&Array.isArray(r.entries)&&r.entries.length<=250&&r.entries.every(x=>name(x?.name)&&['daily','weekly'].includes(x.freq)&&['done','todo','alternative'].includes(x.state))?{dailyPeriod:r.dailyPeriod,weeklyPeriod:r.weeklyPeriod,canEdit:r.canEdit===true,entries:r.entries.map(x=>({...(routineId(x.id)?{id:x.id}:{}),name:x.name,freq:x.freq,state:x.state,...(typeof x.join==='string'&&x.join.length<=100&&/^\/join [a-z0-9_-]+$(?![\s\S])/i.test(x.join)?{join:x.join}:{})}))}:null;
 return {routines,goals:v.goals.map(x=>({name:x.name,progress:x.progress,...(Array.isArray(x.materials)?{materials:x.materials.slice(0,80).filter(m=>name(m?.name)&&Number.isSafeInteger(m.target)&&m.target>0&&m.target<=1000000000).map(m=>({name:m.name,target:m.target}))}:{})})),pins:v.pins.map(x=>({name:x.name,source:x.source,completed:x.completed})),complete:v.complete===true,at:Date.now()};
}
function goalStatus(data,query,source){
 if(!data||!Array.isArray(data.goals)||!Array.isArray(data.pins))return {state:'unknown'};
 const matches=query.kind==='quest'?data.pins.filter(x=>x.source===source&&nameKey(x.name)===nameKey(query.name)):data.goals.filter(x=>nameKey(x.name)===nameKey(query.name));
 return {state:matches.length===1?'saved':matches.length>1?'unknown':data.complete?'absent':'unknown',...(matches.length===1?(query.kind==='quest'?{completed:matches[0].completed}:{progress:matches[0].progress}):{}),at:data.at};
}
// Recurring check queue: only the popup may request changes, only Companion may apply them.
const ROUTINE_QUEUE='aqwc-routine-check-queue-v1',ROUTINE_NOTICE='aqwc-routine-check-notice-v1';
const routineId=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,150}$/.test(x);
function currentRoutinePeriod(freq,now=new Date()){
 const day=new Date(now.getTime()-5*3600000-(freq==='weekly'?60000:0)).toISOString().slice(0,10);
 if(freq==='daily')return 'd:'+day;
 const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+2)%7);return 'w:'+d.toISOString().slice(0,10);
}
let trackerLock=Promise.resolve();
function trackerSerial(fn){const r=trackerLock.then(fn);trackerLock=r.catch(()=>{});return r}
async function routineQueue(){const v=(await chrome.storage.local.get(ROUTINE_QUEUE))[ROUTINE_QUEUE];return Array.isArray(v)?v:[]}
function routineRequest(message,sender){return trackerSerial(async()=>{
 const type=message.type,popup=popupSender(sender),main=mainSender(sender);
 if(!(popup&&type==='routine-check-set'||main&&['routine-check-read','routine-check-ack'].includes(type)))return {ok:false,error:'Invalid tracker request.'};
 await restrictStorage();const all=await routineQueue();
 if(type==='routine-check-read')return {ok:true,entries:all};
 if(type==='routine-check-set'){
  const {taskId,freq,period,done}=message;
  if(!routineId(taskId)||!['daily','weekly'].includes(freq)||period!==currentRoutinePeriod(freq)||typeof done!=='boolean')return {ok:false,error:'Refresh Companion after the reset.'};
  const data=(await chrome.storage.local.get(GOAL_STATUS))[GOAL_STATUS],r=data?.routines;
  const matches=r?.entries?.filter(t=>t.id===taskId&&t.freq===freq)||[];
  if(r?.canEdit!==true||r?.[freq+'Period']!==period||matches.length!==1||matches[0].state==='alternative')return {ok:false,error:'Refresh Companion or undo the alternative quest first.'};
  const entries=all.filter(e=>e.period===currentRoutinePeriod(e.freq));
  if(entries.some(e=>e.taskId===taskId&&e.freq===freq&&e.period===period))return {ok:true,pending:true};
  if((matches[0].state==='done')===done)return {ok:true,pending:false};
  if(entries.length>=250)return {ok:false,error:'Open Companion to sync pending checks.'};
  await chrome.storage.local.set({[ROUTINE_QUEUE]:[...entries,{id:crypto.randomUUID(),taskId,freq,period,done}],[ROUTINE_NOTICE]:null});void notifyTabs('aqwc-routine-queued','https://cptmundo.github.io/AQW-Companion/');return {ok:true,pending:true};
 }
 const results=message.results;
 if(!Array.isArray(results)||results.length>250||results.some(x=>typeof x?.id!=='string'||x.id.length>64||!['saved','reset','missing','conflict','invalid'].includes(x.status)))return {ok:false};
 const applied=results.filter(x=>all.some(e=>e.id===x.id));if(!applied.length)return {ok:true};
 const data=(await chrome.storage.local.get(GOAL_STATUS))[GOAL_STATUS];
 const checked=cleanGoalStatus({goals:[],pins:[],routines:message.routines,complete:false})?.routines;
 if(!checked||checked.canEdit!==true)return {ok:false,error:'Could not confirm updated tracker.'};
 const rejected=applied.find(x=>x.status!=='saved');
 const notices={reset:'A pending check expired at reset.',missing:'A quest is no longer pinned.',conflict:'Undo the alternative quest first.',invalid:'A pending check was invalid.'};
 await chrome.storage.local.set({[ROUTINE_QUEUE]:all.filter(e=>!applied.some(x=>x.id===e.id)),[ROUTINE_NOTICE]:rejected?notices[rejected.status]:null,...(data?{[GOAL_STATUS]:{...data,routines:checked}}:{})});
 return {ok:true};
})}

const assistantCategories=['armors','capes-back-items','helmets-hoods','pets','weapons'];
const assistantKeys=['all','tagged','chaos','dragon','elemental','human','undead','drakath','orc','cp','gold','rep','xp'];
function assistantBoosts(rows,slug,snapshot){
 const current=rows.find(r=>r.slug===slug);if(!current||!assistantCategories.includes(current.category))return null;
 const keys=assistantKeys.filter(k=>Number.isFinite(current.boost?.[k])&&current.boost[k]>0&&current.boost[k]<=1000);
 const best={};const matcher=buildListMatcher(snapshot,current.category);
 const counts=new Map();const base=r=>nameKey(r.name).replace(/ \((sword|axe|bow|dagger|gauntlet|gun|handgun|mace|polearm|rifle|staff|wand|armor|helm|cape|pet)\)$/,'');
 const candidates=rows.filter(r=>r.category===current.category&&typeof r.name==='string'&&/^[a-z0-9][a-z0-9-]{0,199}$/.test(r.slug));
 for(const r of candidates)counts.set(base(r),(counts.get(base(r))||0)+1);
 if(snapshot)for(const r of candidates){if(counts.get(base(r))>1||matcher(r.name).state!=='owned')continue;for(const k of keys){const v=r.boost?.[k];if(Number.isFinite(v)&&v>0&&v<=1000&&(!best[k]||v>best[k].value))best[k]={name:r.name,slug:r.slug,value:v}}}
 return {category:current.category,boost:Object.fromEntries(keys.map(k=>[k,current.boost[k]])),best,synced:!!snapshot?.syncedAt};
}
function assistantGoals(data,query,snapshot){
 if(!data||!Array.isArray(data.goals))return {synced:false,rows:[]};
 const key=nameKey(query.name);const target=nameKey(query.canonical||query.name);
 const material=query.category&&!(query.category==='misc-items'&&/ \(misc\)$/i.test(query.name))?matchWikiItem(snapshot,query):matchWikiMaterial(snapshot,query.name);const rows=[];
 for(const g of data.goals){if(g.progress===100||!Array.isArray(g.materials))continue;
 const matched=g.materials.filter(m=>nameKey(m.name)===key||nameKey(m.name)===target);
 if(matched.length!==1)continue;const qty=matched[0].target;
 const stock=material.state==='owned'?material.total:material.state==='not-found'?0:null;
 rows.push({name:g.name,progress:g.progress,target:qty,missing:Number.isFinite(stock)?Math.max(0,qty-stock):null});
 }
 return {synced:true,at:data.at,rows:rows.sort((a,b)=>b.progress-a.progress).slice(0,8)};
}

const HUB_NOTES='aqwc-hub-notes-v1';
const hubKey=s=>nameKey(s).replace(/ \((sword|axe|bow|dagger|gauntlet|gun|handgun|mace|polearm|rifle|staff|wand|armor|class|helm|cape|pet|misc|item)\)$/,'');
const hubSlug=s=>typeof s==='string'&&/^[a-z0-9][a-z0-9-]{0,199}$/.test(s);
const hubName=s=>typeof s==='string'&&s.trim()&&s.length<=350&&!/[\u0000-\u001f\u007f]/.test(s);
const hubQty=x=>Number.isSafeInteger(x)&&x>0&&x<=1000000000;
function hubStock(snapshot,name){const v=matchWikiMaterial(snapshot,name);return v.state==='owned'?v.total:v.state==='not-found'?0:null}
function hubRecipes(rows,query,snapshot,goals){
 const key=hubKey(query.name),currentStock=hubStock(snapshot,query.name);
 const result=[];
 for(const r of rows){
  if(!hubName(r.name)||!Array.isArray(r.ingredients)||!r.ingredients.length||r.ingredients.some(x=>!Array.isArray(x)||!hubName(x[0])||!hubQty(x[1])))continue;
  const totals=new Map();for(const [name,target] of r.ingredients){const k=hubKey(name),x=totals.get(k)||{name,target:0};x.target+=target;totals.set(k,x)}
  if(!totals.has(key))continue;
  const materials=[...totals.values()].map(m=>({...m,stock:hubStock(snapshot,m.name)})).map(m=>({...m,missing:m.stock===null?null:Math.max(0,m.target-m.stock)}));
  const known=materials.every(m=>m.stock!==null),ready=materials.filter(m=>m.missing===0).length;
  const owned=matchWikiMaterial(snapshot,r.name).state;
  const goal=goals?.goals?.find(g=>hubKey(g.name)===hubKey(r.name));
  result.push({name:r.name,source:r.source,type:r.type,owned,tracked:!!goal,ready,total:materials.length,materials:materials.filter(m=>m.missing!==0).slice(0,5),stockReady:known&&ready===materials.length,required:totals.get(key).target,currentStock});
 }
 return result.sort((a,b)=>(a.owned==='owned')-(b.owned==='owned')||Number(b.tracked)-Number(a.tracked)||Number(b.stockReady)-Number(a.stockReady)||b.ready/b.total-a.ready/a.total||a.name.localeCompare(b.name));
}
function hubLoadouts(rows,snapshot){
 if(!snapshot?.syncedAt)return null;
 const owned=[];
 for(const slot of assistantCategories){
  const pool=rows.filter(r=>r.category===slot&&hubName(r.name)&&hubSlug(r.slug)),counts=new Map(),matcher=buildListMatcher(snapshot,slot);
  for(const r of pool)counts.set(hubKey(r.name),(counts.get(hubKey(r.name))||0)+1);
  for(const r of pool)if(counts.get(hubKey(r.name))===1&&matcher(r.name).state==='owned')owned.push(r);
 }
 const value=(r,k)=>{const v=r?.boost?.[k];return Number.isFinite(v)&&v>0&&v<=1000?v:0};
 const racial=(r,k)=>Math.max(value(r,k),['chaos','dragon','elemental','human','undead'].includes(k)?value(r,'tagged'):0);
 const brief=r=>({name:r.name,slug:r.slug,category:r.category});
 const result={};
 for(const k of ['all','chaos','dragon','elemental','human','undead','drakath','orc','cp','gold','rep','xp']){
  let best=0,gear=[];
  const damage=!['cp','gold','rep','xp'].includes(k);
  if(damage&&k!=='all'){
   const topBySlot=(metric)=>assistantCategories.map(slot=>owned.filter(r=>r.category===slot).sort((a,b)=>metric(b)-metric(a))[0]).filter(Boolean);
   for(const a of [null,...topBySlot(r=>value(r,'all'))])for(const b of [null,...topBySlot(r=>racial(r,k))]){
    if(a&&b&&a.category===b.category&&a.slug!==b.slug)continue;
    const combo=[...new Set([a,b].filter(Boolean))],all=Math.max(0,...combo.map(r=>value(r,'all'))),race=Math.max(0,...combo.map(r=>racial(r,k)));
    const pct=((1+all/100)*(1+race/100)-1)*100;
    if(pct>best){best=pct;gear=combo.map(brief)}
   }
   // An item can itself carry both types; the per-slot maxima alone may miss it.
   for(const a of owned){const pct=((1+value(a,'all')/100)*(1+racial(a,k)/100)-1)*100;if(pct>best){best=pct;gear=[brief(a)]}}
  }else for(const a of owned)if(value(a,k)>best){best=value(a,k);gear=[brief(a)]}
  if(gear.length)result[k]={percent:Math.round(best*100)/100,gear};
 }
 return result;
}
function hubSpending(goals,ingredients,snapshot,current){
 if(!Array.isArray(ingredients)||ingredients.length>80)return [];
 const spend=new Map();for(const m of ingredients)if(hubName(m?.name)&&hubQty(m.target))spend.set(hubKey(m.name),(spend.get(hubKey(m.name))||0)+m.target);
 const result=[];
 for(const g of goals?.goals||[]){if(g.progress===100||hubKey(g.name)===hubKey(current)||!Array.isArray(g.materials))continue;
  for(const m of g.materials){const qty=spend.get(hubKey(m.name));if(!qty)continue;const stock=hubStock(snapshot,m.name);if(stock===null)continue;
   const after=Math.max(0,stock-qty),before=Math.max(0,m.target-stock),missing=Math.max(0,m.target-after);
   if(missing>before)result.push({goal:g.name,material:m.name,extra:missing-before,after,missing});
  }
 }
 return result.slice(0,12);
}
let hubRecipeCache;
async function loadHubRecipes(){if(!hubRecipeCache)hubRecipeCache=fetch(chrome.runtime.getURL('hub-recipes.json')).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>Array.isArray(d.rows)&&d.rows.length<=1000?d.rows:[]).catch(()=>{hubRecipeCache=null;return []});return hubRecipeCache}

let assistantCatalog;
async function loadAssistantCatalog(){if(!assistantCatalog)assistantCatalog=fetch(chrome.runtime.getURL('boost-index.json')).then(r=>{if(!r.ok)throw Error('Catalog unavailable');return r.json()}).then(d=>Array.isArray(d.rows)&&d.rows.length<=10000?d.rows:[]).catch(()=>{assistantCatalog=null;return []});return assistantCatalog}

async function handle(message,sender){
 if(message?.type?.startsWith('one-click-')&&globalThis.AQWCOneClick)return AQWCOneClick.handle(message,sender);
 // Badge captures are staged in trusted extension storage; content scripts cannot read it directly.
 if(message?.type==='badge-stage-read'){
  if(!mainSender(sender))return {ok:false,error:'Invalid badge capture request.'};
  await restrictStorage();
  const stage=(await chrome.storage.local.get('aqwc-badge-stage-v1'))['aqwc-badge-stage-v1'];
  if(!stage)return {ok:false,error:'No staged badge capture.'};
  return {ok:true,snapshot:stage};
 }

 if(['routine-check-set','routine-check-read','routine-check-ack'].includes(message?.type))return routineRequest(message,sender);
 if(message?.type==='goal-status-publish'){
  if(!mainSender(sender))return {ok:false};const data=cleanGoalStatus(message.status);if(!data)return {ok:false};return trackerSerial(async()=>{await restrictStorage();await chrome.storage.local.set({[GOAL_STATUS]:data});return {ok:true}});
 }
 if(message?.type==='mini-tracker-read'){
  if(!popupSender(sender))return {ok:false};return trackerSerial(async()=>{await restrictStorage();const data=(await chrome.storage.local.get(GOAL_STATUS))[GOAL_STATUS];
  return {ok:true,snapshot:data?{goals:data.goals,routines:data.routines??null,complete:data.complete,at:data.at}:null,pending:(await routineQueue()).map(({taskId,freq,period,done})=>({taskId,freq,period,done})),notice:(await chrome.storage.local.get(ROUTINE_NOTICE))[ROUTINE_NOTICE]??null}});
 }
 if(message?.type==='goal-status-read'){
  const q=message.query;if(!wikiSender(sender)||!q||!['item','quest'].includes(q.kind)||typeof q.name!=='string'||!q.name.trim()||q.name.length>350)return {ok:false};
  await restrictStorage();const source=new URL(sender.url).pathname.replace(/^\/|\/$/g,'');const data=(await chrome.storage.local.get(GOAL_STATUS))[GOAL_STATUS];return {ok:true,...goalStatus(data,q,source)};
 }

 if(message?.type==='wiki-appearance-read'||message?.type==='wiki-appearance-save'){
  let wiki=false;try{wiki=sender.frameId===0&&new URL(sender.url).origin==='https://aqwwiki.wikidot.com'}catch{}
  const popup=popupSender(sender);
  if(!popup&&!mainSender(sender)&&!(wiki&&message.type==='wiki-appearance-read'))return {ok:false,error:'Invalid appearance request.'};
  await restrictStorage();
  if(message.type==='wiki-appearance-save'){
   const appearance=normalizeAppearance(message.appearance);
   await chrome.storage.local.set({[APPEARANCE_KEY]:appearance});const notification=await notifyTabs('aqwc-theme-changed',['https://aqwwiki.wikidot.com/',SITE+'/AQW-Companion/']);return {ok:true,appearance,...notification};
  }
  const stored=await chrome.storage.local.get(APPEARANCE_KEY);return {ok:true,appearance:normalizeAppearance(stored[APPEARANCE_KEY]??{background:'companion',banner:'prometheus'})};
 }

 if(['wishlist-queue-add','routine-queue-add','quest-pin-add','quest-pin-complete','wishlist-queue-read','wishlist-queue-ack'].includes(message?.type))return queueWishlist(message,sender);
 const account=await accountStage(message,sender);if(account)return account;
 if(message?.type==='wiki-list-preference'){
  if(!wikiListCategory(sender))return {ok:false,error:'Invalid list settings request.'};
  await restrictStorage();
  if(Object.hasOwn(message,'automatic')){
   if(typeof message.automatic!=='boolean')return {ok:false,error:'Invalid preference.'};
   await chrome.storage.local.set({'aqwc-list-automatic':message.automatic});
  }
  return {ok:true,automatic:(await chrome.storage.local.get('aqwc-list-automatic'))['aqwc-list-automatic']!==false};
 }
 if(message?.type==='wiki-boost-lookup'&&wikiSender(sender)){
  const categories=['armors','capes-back-items','helmets-hoods','pets','weapons'];
  const category=message.category,names=message.names;
  if(!categories.includes(category)||!Array.isArray(names)||!names.length||names.length>80||names.some(n=>typeof n!=='string'||!n.trim()||n.length>350||/[\u0000-\u001f\u007f]/.test(n))||new Set(names).size!==names.length)return {ok:false,error:'Invalid boost list request.'};
  await restrictStorage();const snapshot=(await chrome.storage.local.get(KEY))[KEY];
  const match=buildListMatcher(snapshot,category);return {ok:true,matches:names.map(n=>{const m=match(n);return {state:m.state,bank:!!m.bank,inventory:!!m.inventory}}),syncedAt:snapshot?.syncedAt||null,exportedAt:snapshot?.exportedAt||null};
 }
 if(message?.type==='wiki-list-lookup'){
  const category=wikiListCategory(sender),names=message.names;
  if(!category||message.category!==category||!Array.isArray(names)||!names.length||names.length>80||names.some(n=>typeof n!=='string'||!n.trim()||n.length>350||/[\u0000-\u001f\u007f]/.test(n))||new Set(names).size!==names.length)return {ok:false,error:'Invalid item list request.'};
  await restrictStorage();const snapshot=(await chrome.storage.local.get(KEY))[KEY];
  const match=buildListMatcher(snapshot,category);return {ok:true,matches:names.map(match),syncedAt:snapshot?.syncedAt||null,exportedAt:snapshot?.exportedAt||null};
 }
 if(message?.type==='wiki-material-lookup'&&wikiSender(sender)){
  const names=message.names;
  if(!Array.isArray(names)||!names.length||names.length>80||names.some(n=>typeof n!=='string'||!n.trim()||n.length>350)||new Set(names).size!==names.length)return {ok:false,error:'Invalid material request.'};
  await restrictStorage();const snapshot=(await chrome.storage.local.get(KEY))[KEY];
  return {ok:true,matches:names.map(n=>matchWikiMaterial(snapshot,n)),syncedAt:snapshot?.syncedAt||null};
 }

 if(['hub-note-read','hub-note-save'].includes(message?.type)&&wikiSender(sender)){
  const slug=new URL(sender.url).pathname.replace(/^\/|\/$/g,'');
  if(!hubSlug(slug)||message.slug!==slug)return {ok:false};
  await restrictStorage();const raw=(await chrome.storage.local.get(HUB_NOTES))[HUB_NOTES],notes=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  if(message.type==='hub-note-read')return {ok:true,note:Object.hasOwn(notes,slug)?notes[slug]:{text:'',priority:'normal'}};
  if(typeof message.text!=='string'||message.text.length>1500||!['normal','high','low'].includes(message.priority))return {ok:false,error:'Invalid note.'};
  if(!Object.hasOwn(notes,slug)&&Object.keys(notes).length>=500)return {ok:false,error:'Note limit reached.'};
  const next={...notes};if(!message.text.trim()&&message.priority==='normal')delete next[slug];else Object.defineProperty(next,slug,{value:{text:message.text,priority:message.priority},enumerable:true,configurable:true,writable:true});
  await chrome.storage.local.set({[HUB_NOTES]:next});return {ok:true};
 }
 if(message?.type==='wiki-item-assistant'&&wikiSender(sender)){
  const q=message.query,slug=new URL(sender.url).pathname.replace(/^\/|\/$/g,'');
  if(!q||typeof q.name!=='string'||!q.name.trim()||q.name.length>350||typeof q.category!=='string'||!Object.hasOwn(wikiTypes,q.category)||q.slug!==slug||! /^[a-z0-9][a-z0-9-]{0,199}$/.test(slug))return {ok:false};
  await restrictStorage();const data=await chrome.storage.local.get([KEY,GOAL_STATUS]);
  const snapshot=data[KEY],canonical=['misc-items','use-items'].includes(q.category)?q.name.replace(/\s+\((?:misc|item)\)$/i,''):q.name;
  const [catalog,recipes]=await Promise.all([loadAssistantCatalog(),loadHubRecipes()]);const goals=data[GOAL_STATUS];
  const related=(Array.isArray(message.related)?message.related:[]).slice(0,24).filter(x=>hubName(x?.name)&&hubSlug(x.slug)&&['related','unlock'].includes(x.kind)).map(x=>({name:x.name,slug:x.slug,kind:x.kind,state:matchWikiMaterial(snapshot,x.name).state}));
  return {ok:true,comparison:assistantBoosts(catalog,slug,snapshot),goals:assistantGoals(goals,{name:q.name,category:q.category,canonical},snapshot),hub:{recipes:hubRecipes(recipes,q,snapshot,goals).slice(0,15),recipeCount:recipes.length,related,loadouts:hubLoadouts(catalog,snapshot),spending:hubSpending(goals,message.ingredients,snapshot,q.name),goalsSynced:!!goals?.at}};
 }
 if(message?.type==='wiki-item-lookup'&&wikiSender(sender)){
  await restrictStorage();const stored=(await chrome.storage.local.get(KEY))[KEY];return {ok:true,...matchWikiItem(stored,message.query)};
 }
 if(message?.type==='sync-inventory'&&mainSender(sender)){
  const data=cleanSnapshot(message.snapshot);
  await restrictStorage();await chrome.storage.local.set({[KEY]:data});
  return {ok:true,count:data.items.length,syncedAt:data.syncedAt};
 }
 if(message?.type==='inventory-search'){
  if(!popupSender(sender)||typeof message.query!=='string'||message.query.length>120||!['all','bag','bank'].includes(message.location))return {ok:false,error:'Invalid inventory search.'};
  await restrictStorage();const snapshot=(await chrome.storage.local.get(KEY))[KEY];
  return {ok:true,...searchLocalInventory(snapshot,message.query,message.location)};
 }
 if(popupSender(sender)&&message?.type==='inventory-summary'){
  await restrictStorage();const stored=(await chrome.storage.local.get(KEY))[KEY];
  return {ok:true,count:stored?.items?.length??null,syncedAt:stored?.syncedAt??null};
 }
 if(popupSender(sender)&&message?.type==='clear-inventory'){
  await restrictStorage();await chrome.storage.local.remove(KEY);return {ok:true,count:null,syncedAt:null};
 }
 return {ok:false,error:'Unsupported request.'};
}
chrome.runtime.onMessage.addListener((message,sender,respond)=>{handle(message,sender).then(respond,error=>respond({ok:false,error:String(error?.message||error)}));return true});

// Optional fallback for browsers that fail to restore dynamically registered scripts.
// No account data is read here: capture still requires a trusted button click.
chrome.tabs?.onUpdated?.addListener((tabId,change,tab)=>{
 if(change.status!=='complete')return;
 let u;try{u=new URL(tab.url)}catch{return}
 if(u.origin!=='https://account.aq.com'||!/^\/AQW\/Inventory\/?$/i.test(u.pathname))return;
 (async()=>{
  if(!await chrome.permissions.contains({origins:['https://account.aq.com/*']}))return;
  const check=await chrome.scripting.executeScript({target:{tabId},func:()=>!!document.getElementById('aqwc-account-export')});
  if(!check?.[0]?.result)await chrome.scripting.executeScript({target:{tabId},files:['account-capture.js','account-page.js']});
 })().catch(()=>{});
});
