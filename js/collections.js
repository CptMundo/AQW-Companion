/* Reviewed collections only. No network, mutation, or inferred badge ownership. */
(function(root){
'use strict';
const norm=s=>String(s||'').trim().normalize('NFC').replace(/[’‘]/g,"'").toLowerCase();
const weapon=/^(weapon|sword|axe|bow|dagger|gauntlet|gun|handgun|mace|polearm|rifle|staff|wand|whip)$/i;
const typed=(r,t)=>t==='Weapon'?weapon.test(String(r.Type||'')):norm(r.Type)===norm(t);
const sourceOk=url=>typeof url==='string'&&/^https:\/\/aqwwiki\.wikidot\.com\/[a-z0-9-]+$/i.test(url);
function mergeGroups(integrity,inventory=[],loaded=false){
 const groups=new Map(),names=new Set(),index=new Map();
 for(const r of inventory){if(!r||typeof r.Name!=='string'||!Number.isSafeInteger(Number(r.Count))||Number(r.Count)<=0)continue;const k=norm(r.Name);if(!index.has(k))index.set(k,[]);index.get(k).push(r)}
 for(const name of integrity.reviewedNames||[]){
  const recipe=integrity.getVerified(name),method=integrity.getAcquisition(name)?.methods?.[0];
  if(!recipe||!method||!sourceOk(recipe.source)||method.url!==recipe.source||!/^\/join [a-z0-9-]+$/i.test(method.join)||names.has(norm(recipe.name)))continue;
  names.add(norm(recipe.name));
  const candidates=(index.get(norm(recipe.name))||[]).filter(r=>typed(r,recipe.type));
  const identities=new Set(candidates.map(r=>String(r.ID)));
  const status=!loaded?'unknown':!candidates.length?'not-in-snapshot':identities.size===1&&candidates.every(r=>r.ID!=null&&String(r.ID).trim())?'owned':'ambiguous';
  if(!groups.has(recipe.source))groups.set(recipe.source,{source:recipe.source,title:method.title,join:method.join,rows:[]});
  groups.get(recipe.source).rows.push({name:recipe.name,type:recipe.type,status});
 }
 return [...groups.values()].map(g=>({...g,total:g.rows.length,owned:g.rows.filter(r=>r.status==='owned').length,ambiguous:g.rows.filter(r=>r.status==='ambiguous').length,rows:g.rows.sort((a,b)=>a.name.localeCompare(b.name))})).sort((a,b)=>a.title.localeCompare(b.title));
}
function badgeGroups(catalog,progress){
 const groups=new Map(),seen=new Set(),observed=new Set(progress?.observed||[]),manual=progress?.manual||{};
 for(const b of catalog||[]){
  if(!b||b.placeholder||!b.id||!b.category||seen.has(b.id))continue;seen.add(b.id);
  if(!groups.has(b.category))groups.set(b.category,{category:b.category,total:0,observed:0,manual:0,tracked:0,unconfirmed:0,source:sourceOk(b.categorySource)?b.categorySource:null});
  const g=groups.get(b.category);g.total++;
  if(progress?.available&&observed.has(b.id))g.observed++;
  else if(progress?.available&&manual[b.id]==='owned')g.manual++;
  else if(progress?.available&&manual[b.id]==='tracked')g.tracked++;
  else g.unconfirmed++;
 }
 return [...groups.values()].sort((a,b)=>a.category.localeCompare(b.category));
}
// Recorded dates are catalog metadata, not a verified live event feed.
function seasonalBadges(catalog,progress,day){
 const observed=new Set(progress?.observed||[]),manual=progress?.manual||{},seen=new Set(),rows=[];
 for(const b of catalog||[]){
  if(!b||b.placeholder||!b.id||seen.has(b.id)||!['seasonal','event'].includes(b.kind))continue;seen.add(b.id);
  const valid=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
  const w=b.window,dated=!!(w&&valid(w.start)&&valid(w.end)&&w.start<=w.end);
  const source=typeof b.announcement==='string'&&/^https:\/\/(?:www\.aq\.com|game[0-9]+\.aq\.com)\/gamedesignnotes\/[a-z0-9-]+$/i.test(b.announcement)?b.announcement:null;
  const state=!progress?.available?'Unknown':observed.has(b.id)?'Observed':manual[b.id]==='owned'?'Manually owned':manual[b.id]==='tracked'?'Hunting':'Unconfirmed';
  rows.push({id:b.id,name:b.name,category:b.category,source:sourceOk(b.categorySource)?b.categorySource:null,announcement:source,window:dated?{start:w.start,end:w.end}:null,period:dated?(day<w.start?'Before recorded window':day>w.end?'After recorded window':'Within recorded window — verify'): 'No recorded dates',state});
 }
 return rows.sort((a,b)=>Number(!!b.window)-Number(!!a.window)||a.name.localeCompare(b.name));
}
const api={mergeGroups,badgeGroups,seasonalBadges};
if(typeof module==='object'&&module.exports)module.exports=api;else root.AQWCCollections=api;
})(typeof globalThis==='object'?globalThis:this);
