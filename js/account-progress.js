/* Official Account Manager progress snapshots; local only, no raw HTML or account secrets. */
(function(root){
'use strict';
const KEY='aqwc-account-progress-v1';
const SAGA=Object.freeze({'Prologue':'chaos:prologue','Shadowfall':null,'Chiral Valley':'chaos:escherion','Dwarfhold':'chaos:vath','Yokai':'chaos:kitsune','Darkovia':'chaos:wolfwing','Mythsong':'chaos:kimberly','Arcangrove':'chaos:ledgermayne','Sandsea':'chaos:tibicenas','Bloodtusk':'chaos:khasaanda','The Span':'chaos:iadoa','Thunderforge':'chaos:lionfang','Swordhaven':'chaos:alteon','Mirror Realm':'chaos:xiang','Chaos Realm':'chaos:finale'});
const names={sagas:Object.keys(SAGA),playtime:['1 Week','1 Month','3 Months','6 Months','12 Months','15 Months',...Array.from({length:14},(_,i)=>(i+2)+' Years')],membership:['1 Month','2 Months','3 Months','6 Months','9 Months','12 Months','15 Months',...Array.from({length:13},(_,i)=>(i+2)+' Years')],ac:['500 ACs','2,000 ACs','12,000 ACs','25,000 ACs','50,000 ACs','100,000 ACs','200,000 ACs','300,000 ACs','400,000 ACs','500,000 ACs','600,000 ACs','750,000 ACs','1 Million ACs','1.1 Million ACs','1.2 Million ACs','1.25 Million ACs']};
function clean(v){
 if(!v||!Number.isFinite(Date.parse(v.capturedAt))||!['summary',...Object.keys(names)].includes(v.section))throw Error('Invalid Account Manager progress.');
 const out={section:v.section,capturedAt:v.capturedAt};
 if(v.section==='summary'){
  if(typeof v.created!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v.created)||!Number.isFinite(Date.parse(v.created))||new Date(v.created).toISOString().slice(0,10)!==v.created||Date.parse(v.created)>Date.now())throw Error('Invalid creation date.');
  for(const k of ['months','purchased','bonus','total'])if(!Number.isSafeInteger(v[k])||v[k]<0)throw Error('Invalid summary value.');
  if(v.purchased+v.bonus!==v.total)throw Error('AC totals do not match.');
  return {...out,created:v.created,months:v.months,purchased:v.purchased,bonus:v.bonus,total:v.total};
 }
 if(!Array.isArray(v.rows)||!v.rows.length||v.rows.length>names[v.section].length)throw Error('Invalid badge list.');
 const seen=new Set();out.rows=v.rows.map(r=>{if(!r||!names[v.section].includes(r.name)||!['colored','gray','unknown'].includes(r.state)||seen.has(r.name))throw Error('Invalid or duplicate progress badge.');seen.add(r.name);const out={name:r.name,state:r.state};if(r.evidence==='threshold'&&v.section!=='sagas')out.evidence='threshold';if(typeof r.art==='string'){try{const u=new URL(r.art);if(['https://account.aq.com','https://game.aq.com','https://www.aq.com'].includes(u.origin)&&!u.search&&!u.hash&&/badge|progress|achievement/i.test(u.pathname)&&/^\/[a-z0-9/_-]+\.(?:png|jpe?g|gif|webp)$/i.test(u.pathname))out.art=u.href}catch{}}return out});return out;
}
function load(){try{const raw=JSON.parse(localStorage.getItem(KEY)||'{}'),out={};for(const k of ['summary',...Object.keys(names)])if(raw[k]?.section===k)try{out[k]=clean(raw[k])}catch{}return out}catch{return {}}}
function save(v){const next=clean(v),all=load();all[next.section]=next;localStorage.setItem(KEY,JSON.stringify(all));return next}
function selectedChapters(snapshot,selected){const v=clean(snapshot);if(v.section!=='sagas'||!Array.isArray(selected))return [];const available=new Set(v.rows.map(r=>r.name));return [...new Set(selected.filter(n=>available.has(n)&&Object.prototype.hasOwnProperty.call(SAGA,n)).map(n=>SAGA[n]).filter(Boolean))]}
const api={KEY,SAGA,clean,load,save,selectedChapters};
if(typeof module!=='undefined')module.exports=api;else root.AQWCAccountProgress=api;
})(typeof globalThis==='undefined'?this:globalThis);
