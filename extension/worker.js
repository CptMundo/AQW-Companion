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

async function handle(message,sender){
 if(message?.type==='wiki-item-lookup'&&wikiSender(sender)){
  await restrictStorage();const stored=(await chrome.storage.local.get(KEY))[KEY];return {ok:true,...matchWikiItem(stored,message.query)};
 }
 if(message?.type==='sync-inventory'&&mainSender(sender)){
  const data=cleanSnapshot(message.snapshot);
  await restrictStorage();await chrome.storage.local.set({[KEY]:data});
  return {ok:true,count:data.items.length,syncedAt:data.syncedAt};
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
