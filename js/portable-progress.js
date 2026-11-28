/* Portable progress fields only. No credentials, tokens, permissions, consent or extension storage. */
(function(root){
'use strict';
const keys=Object.freeze({forge:'aqwc-forge-unlocks-v1',badges:'aqwc-badge-hunter-v1',badgeCapture:'aqwc-badge-character-v1',accountProgress:'aqwc-account-progress-v1',stackCaps:'aqwc-stack-caps-v1',publicInventory:'aqwc-public-inventory-v1',theme:'aqwc-site-theme-v1'});
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const date=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const character=v=>typeof v==='string'&&v.trim()&&v.length<=80&&!/[\u0000-\u001f\u007f]/.test(v);
const fail=field=>{throw Error('Invalid backup progress: '+field+'. No progress fields were restored.')};
function clean(input,deps){
 if(!obj(input))fail('progressV1');
 const out={},badgeIds=new Set(deps.badgeCatalog.map(b=>b.id)),forgeIds=new Set(deps.forgeIds);
 const ids=(v,allowed,field)=>{if(!Array.isArray(v)||v.length>2000||v.some(id=>!allowed.has(id)))fail(field);return [...new Set(v)]};
 for(const [field,v] of Object.entries(input)){
  if(!Object.hasOwn(keys,field))fail(field);
  if(field==='forge')out[field]=ids(v,forgeIds,field);
  if(field==='badges'){
   if(!obj(v)||Object.keys(v).length>2000)fail(field);
   const result=deps.badgeClean(v,deps.badgeCatalog);if(Object.keys(result).length!==Object.keys(v).length)fail(field);out[field]=result;
  }
  if(field==='badgeCapture'){
   if(!obj(v)||!character(v.character)||!date(v.capturedAt)||!Number.isSafeInteger(v.ambiguous)||v.ambiguous<0||!Number.isSafeInteger(v.unknown)||v.unknown<0)fail(field);
   const matched=ids(v.ids,badgeIds,field);if(!matched.length)fail(field);
   const groups=ids(v.storyGroups||[],new Set(['champion-of-chaos']),field);
   const result={character:v.character.trim(),capturedAt:v.capturedAt,ids:matched,storyGroups:groups,ambiguous:v.ambiguous,unknown:v.unknown};
   if(v.discovery!==undefined){
    const d=v.discovery;if(!obj(d))fail(field);
    const allowed=new Set(matched),newIds=d.newIds===null?null:ids(d.newIds,allowed,field),latestIds=ids(d.latestIds,allowed,field);
    if(d.latestAt!==null&&!date(d.latestAt))fail(field);
    result.discovery={newIds,latestIds,latestAt:d.latestAt};
   }
   out[field]=result;
  }
  if(field==='accountProgress'){
   if(!obj(v)||Object.keys(v).length>5)fail(field);
   out[field]=Object.fromEntries(Object.entries(v).map(([k,value])=>{if(value?.section!==k)fail(field);return [k,deps.accountClean(value)]}));
  }
  if(field==='stackCaps'){
   if(!obj(v)||Object.keys(v).length>400)fail(field);
   const entries=Object.entries(v).map(([k,value])=>{const name=deps.normalize(k),cap=deps.validCap(value);if(!name||name.length>350||!cap||['__proto__','constructor','prototype'].includes(name))fail(field);return [name,cap]});
   out[field]=Object.fromEntries(entries);
  }
  if(field==='publicInventory')out[field]=deps.publicClean(v);
  if(field==='theme'){if(!['companion','dark','light','cas','stars'].includes(v))fail(field);out[field]=v}
 }
 if(out.badgeCapture&&out.publicInventory&&out.badgeCapture.character.toLowerCase()!==out.publicInventory.character.toLowerCase())fail('different captured characters');
 return out;
}
function collect(storage,deps){
 const raw={};
 for(const [field,key] of Object.entries(keys)){const value=storage.getItem(key);if(value!==null){raw[field]=field==='theme'?value:JSON.parse(value)}}
 return clean(raw,deps);
}
function apply(storage,prepared){
 const entries=Object.entries(prepared).map(([field,value])=>{if(!Object.hasOwn(keys,field))fail(field);return [keys[field],field==='theme'?value:JSON.stringify(value)]});
 const before=entries.map(([key])=>[key,storage.getItem(key)]),written=[];
 try{for(const [key,value] of entries){storage.setItem(key,value);written.push(key)}}
 catch(error){let rollbackFailed=false;for(const [key,old] of before.filter(([key])=>written.includes(key)).reverse())try{if(old===null)storage.removeItem(key);else storage.setItem(key,old)}catch{rollbackFailed=true}throw Error('Progress storage failed. '+(rollbackFailed?'Some fields may have changed; retain your backup.':'Changed progress fields were rolled back.'))}
}
const api={keys,clean,collect,apply};if(typeof module==='object'&&module.exports)module.exports=api;else root.AQWCPortableProgress=api;
})(typeof globalThis==='object'?globalThis:this);
