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
async function handle(message,sender){
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
