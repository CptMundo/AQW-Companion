/* AQW Companion: Wishlist targets first observed in later FULL inventory imports.
 * Entirely local; never reads/writes browser storage or calls network.
 * "First seen" is NOT the date an item was actually obtained in AQWorlds.
 */
(function(root,factory){
 "use strict";
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.AQWWishlistFinds=api;
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 const normalize=s=>String(s||"").trim().toLocaleLowerCase("en-US").replace(/[’‘]/g,"'");
 const validTime=s=>{const n=Date.parse(s||"");return Number.isFinite(n)?n:null};
 function captures(snapshots){
  const rows=(Array.isArray(snapshots)?snapshots:[]).filter(s=>s&&Array.isArray(s.items)).map((s,index)=>{
   const names=new Map();
   for(const item of s.items){
    if(!item||typeof item.Name!=="string"||!item.Name.trim())continue;
    const key=normalize(item.Name);
    if(!names.has(key))names.set(key,{name:item.Name,type:String(item.Type||"Misc"),id:item.ID==null?"":String(item.ID)});
   }
   return {uid:String(s.uid||""),fileName:String(s.fileName||"Inventory export"),time:validTime(s.exportedAt)||validTime(s.importedAt),importedAt:validTime(s.importedAt),order:index,names};
  });
  rows.sort((a,b)=>(a.time??Number.MAX_SAFE_INTEGER)-(b.time??Number.MAX_SAFE_INTEGER)||a.order-b.order);
  return rows;
 }
 function find(snapshots,projects,{limit=12,onlyUid=null}={}){
  const wishes=new Map();
  for(const p of Array.isArray(projects)?projects:[]){
   if(!p||typeof p.name!=="string")continue;
   const name=normalize(p.name);if(!name)continue;
   if(!wishes.has(name))wishes.set(name,{
    name:p.name,type:String(p.type||"Misc"),createdAt:validTime(p.createdAt)
   });
  }
  const rows=captures(snapshots);
  if(rows.length<2||!wishes.size)return {count:0,recent:[],compared:Math.max(0,rows.length-1)};
  const seen=new Set(rows[0].names.keys()),events=[];
  for(let i=1;i<rows.length;i++){
   const prior=rows[i-1],now=rows[i];
   // A duplicate of the preceding export is not a new observation.
   if(prior.uid&&now.uid===prior.uid)continue;
   for(const [key,item] of now.names){
    const wish=wishes.get(key);
    if(!wish||seen.has(key))continue;
    // Current and future Wishlist projects have a creation time; don't claim
    // something as a historical Wishlist win if it was added afterwards.
    if(wish.createdAt!==null){
      if(now.importedAt!==null&&now.importedAt<wish.createdAt)continue;
      if(now.time!==null&&now.time<wish.createdAt)continue;
    }
    events.push({
     name:wish.name,type:wish.type||item.type,
     firstSeenAt:now.time,importedAt:now.importedAt,
     source:now.fileName,previousSource:prior.fileName,
     targetId:item.id,snapshotUid:now.uid
    });
   }
   for(const key of now.names.keys())seen.add(key);
  }
  events.sort((a,b)=>(b.firstSeenAt??0)-(a.firstSeenAt??0)||a.name.localeCompare(b.name));
  const selected=onlyUid===null?events:events.filter(e=>e.snapshotUid===String(onlyUid));
  return {count:selected.length,recent:selected.slice(0,Math.max(0,Math.min(50,Number(limit)||12))),compared:Math.max(0,rows.length-1)};
 }
 return Object.freeze({find,captures,normalize});
});
