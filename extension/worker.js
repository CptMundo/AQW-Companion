'use strict';
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
 const key=nameKey(name),suffix=key.match(/^(.*) \((sword|axe|bow|dagger|gauntlet|gun|handgun|mace|polearm|rifle|staff|wand|armor|class|helm|cape|pet|item)\)$/);
 const rows=snapshot.items.filter(row=>row.Count>0);
 let found=rows.filter(row=>nameKey(row.Name)===key);
 if(suffix){
  const categories={axe:'axes',staff:'staffs',class:'classes',armor:'armors',helm:'helmets',item:'misc-items'};
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
  if(!(wiki&&['wishlist-queue-add','routine-queue-add'].includes(type)||main&&['wishlist-queue-read','wishlist-queue-ack'].includes(type)))return {ok:false,error:'Unsupported Wishlist request.'};
  await restrictStorage();
  const raw=(await chrome.storage.local.get(WISHLIST_QUEUE))[WISHLIST_QUEUE],entries=Array.isArray(raw)?raw:[];
  if(type==='wishlist-queue-read')return {ok:true,entries};
  if(type==='wishlist-queue-ack'){
   if(!Array.isArray(message.ids)||message.ids.length>200||message.ids.some(id=>typeof id!=='string'||id.length>64))return {ok:false,error:'Invalid acknowledgement.'};
   await chrome.storage.local.set({[WISHLIST_QUEUE]:entries.filter(e=>!message.ids.includes(e.id))});return {ok:true};
  }
  if(type==='routine-queue-add'){
   const quest=message.quest,source=new URL(sender.url).pathname.replace(/^\/|\/$/g,'');
   if(!quest||quest.source!==source||typeof quest.name!=='string'||!quest.name.trim()||quest.name.length>350||/[\u0000-\u001f\u007f]/.test(quest.name))return {ok:false,error:'Invalid quest.'};
   if(entries.some(e=>e.quest?.source===source&&nameKey(e.quest.name)===nameKey(quest.name)))return {ok:true,already:true};
   if(entries.length>=200)return {ok:false,error:'Pending queue is full. Open Companion to sync.'};
   await chrome.storage.local.set({[WISHLIST_QUEUE]:[...entries,{id:crypto.randomUUID(),quest:{source,name:quest.name.trim()}}]});return {ok:true};
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
async function handle(message,sender){
 if(['wishlist-queue-add','routine-queue-add','wishlist-queue-read','wishlist-queue-ack'].includes(message?.type))return queueWishlist(message,sender);
 const account=await accountStage(message,sender);if(account)return account;
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
