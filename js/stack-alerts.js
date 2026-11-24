/* AQW Companion Stack Alerts: local-only, source-aware inventory limit checks.
 * Known caps copied only where AQWWiki explicitly states "Stacks up to".
 * Names/categories are data, not code; this module performs no network requests.
 */
(function(root,factory){
 "use strict";
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.AQWCStackAlerts=api;
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 const wikiCaps=[
  ["Void Aura",7500,"void-aura"],
  ["Dark Crystal Shard",1000,"dark-crystal-shard"],
  ["Gem of Nulgath",1000,"gem-of-nulgath"],
  ["Diamond of Nulgath",1000,"diamond-of-nulgath"],
  ["Totem of Nulgath",100,"totem-of-nulgath"],
  ["Tainted Gem",1000,"tainted-gem"],
  ["Blood Gem of the Archfiend",100,"blood-gem-of-the-archfiend"],
  ["Nulgath Insignia",1000,"nulgath-insignia"],
  ["Legion Token",50000,"legion-token"],
  ["Nulgath's Approval",5000,"nulgath-s-approval"],
  ["Spirit Orb",65000,"spirit-orb-misc"],
  ["Elder's Blood",20,"elders-blood"],
  ["Silver Stack",1000,"silver-stack"],
  ["Fiend Token",30,"fiend-token"],
  ["Dark Token",10000,"dark-token"],
  ["Essence of Nulgath",100,"essence-of-nulgath"],
  ["Fresh Soul",1000,"fresh-soul"]
 ];
 const normalize=s=>String(s||"").trim().toLowerCase()
  .replace(/[’‘]/g,"'").replace(/^elders' blood$/,"elder's blood")
  .replace(/\s*\((?:sword|class|misc|weapon|armor|helm|cape|pet)\)$/i,"");
 const caps=new Map(wikiCaps.map(([name,cap,slug])=>[normalize(name),
  Object.freeze({name,cap,source:"AQWWiki",url:"https://aqwwiki.wikidot.com/"+slug})]));
 const validCap=value=>Number.isSafeInteger(Number(value))&&Number(value)>0&&Number(value)<=10000000?Number(value):null;
 const safeWiki=url=>typeof url==="string"&&/^https:\/\/aqwwiki\.wikidot\.com\/[a-z0-9][a-z0-9-]*$/i.test(url)?url:null;
 const safeJoin=join=>typeof join==="string"&&/^\/join [a-z0-9-]{2,50}$/i.test(join.trim())?join.trim():null;
 function analyze(items=[],overrides={},opts={}){
  const near=Number.isFinite(opts.near)?Math.min(.99,Math.max(.5,opts.near)):.9;
  const group=new Map();
  const byRow=new Map();
  for(const item of Array.isArray(items)?items:[]){
   if(!item||typeof item.Name!=="string"||!item.Name.trim())continue;
   const key=normalize(item.Name),bank=Number(item.Bank)===1?1:0;
   const qty=Number(item.Count);
   if(!key||!Number.isFinite(qty)||qty<0)continue;
   // Count a single exported item ID once per location. Duplicate records are
   // not proof of extra stack capacity, and Bank/Bag must never be combined.
   const identifier=String(item.ID??item.Name);
   const rowKey=key+"|"+bank+"|"+identifier;
   const previous=byRow.get(rowKey);
   const cap=validCap(item.MaxStack??item.MaxStackSize??item.MaxQuantity);
   if(!previous||qty>previous.qty)byRow.set(rowKey,{key,name:item.Name,bank,qty,cap});
  }
  for(const item of byRow.values()){
   const gkey=item.key+"|"+item.bank;
   if(!group.has(gkey))group.set(gkey,{key:item.key,name:item.name,bank:item.bank,qty:0,exportCaps:new Set()});
   const row=group.get(gkey);row.qty+=item.qty;
   if(item.cap)row.exportCaps.add(item.cap);
  }
  const alerts=[];let unknown=0,known=0;
  for(const row of group.values()){
   const manual=validCap(overrides?.[row.key]);
   const exportCap=row.exportCaps.size===1?[...row.exportCaps][0]:null;
   const wiki=caps.get(row.key);
   const cap=manual??exportCap??wiki?.cap??null;
   if(!cap){unknown++;continue}
   known++;
   const status=row.qty>=cap?"maxed":row.qty>=Math.ceil(cap*near)?"near":null;
   if(!status)continue;
   alerts.push({key:row.key,name:row.name,location:row.bank?"Bank":"Bag",
    qty:row.qty,cap,status,percent:Math.min(100,Math.round(row.qty*100/cap)),
    capSource:manual?"Player limit":exportCap?"Export metadata":"AQWWiki",
    sourceUrl:(!manual&&!exportCap)?wiki?.url||null:null});
  }
  alerts.sort((a,b)=>{
   const order=Number(b.status==="maxed")-Number(a.status==="maxed");
   return order||b.percent-a.percent||a.name.localeCompare(b.name)||a.location.localeCompare(b.location);
  });
  return {alerts,maxed:alerts.filter(x=>x.status==="maxed").length,
   near:alerts.filter(x=>x.status==="near").length,
   known,unknown,checked:group.size};
 }
 function uses(material,{reviewed=[],wishlist=[],community=[]}={}){
  const key=normalize(material);if(!key)return [];
  const entries=[],seen=new Set();
  const add=(entry)=>{
   if(!entry||!entry.title)return;
   const signature=entry.kind+"|"+normalize(entry.title)+"|"+String(entry.url||"");
   if(seen.has(signature))return;
   seen.add(signature);entries.push(entry);
  };
  for(const p of Array.isArray(wishlist)?wishlist:[]){
   if(!p||!Array.isArray(p.steps))continue;
   for(const step of p.steps){
    if(!["material","owned"].includes(step?.kind)||normalize(step.item)!==key)continue;
    add({kind:"Wishlist",title:p.name,quantity:validCap(step.target)||1,
     explanation:"Needed for a goal you are tracking",url:null,join:null});
    break;
   }
  }
  for(const p of Array.isArray(reviewed)?reviewed:[]){
   if(!p||!Array.isArray(p.ingredients))continue;
   for(const ingredient of p.ingredients){
    if(!Array.isArray(ingredient)||normalize(ingredient[0])!==key)continue;
    add({kind:"Reviewed merge",title:p.name,quantity:validCap(ingredient[1])||1,
      explanation:"Required to craft "+p.name,
      url:safeWiki(p.url||p.wiki),join:safeJoin(p.join)});
    break;
   }
  }
  for(const p of Array.isArray(community)?community:[]){
   if(!p||typeof p!=="object")continue;
   // Community datasets may contain reward quests, alternate routes or
   // incomplete merges. Never label them as source-reviewed.
   if(p.complete==="community-merge"&&Array.isArray(p.ingredients)){
    const found=p.ingredients.find(x=>Array.isArray(x)&&normalize(x[0])===key);
    if(found)add({kind:"Community merge",title:p.name,quantity:validCap(found[1])||1,
      explanation:"Community-listed merge; verify ingredients before spending",
      url:safeWiki(p.wiki||p.methods?.find(m=>m?.url)?.url),
      join:safeJoin(p.methods?.find(m=>m?.join)?.join)});
   }
   for(const route of Array.isArray(p.questRoutes)?p.questRoutes:[]){
    const found=(Array.isArray(route?.ingredients)?route.ingredients:[]).find(x=>Array.isArray(x)&&normalize(x[0])===key);
    if(found)add({kind:"Quest",title:route.quest||p.name,quantity:validCap(found[1])||1,
      explanation:"Required by this quest (check unlocks and repeatability)",
      url:safeWiki(route.source),join:safeJoin(route.join)});
   }
  }
  const priority={"Wishlist":0,"Reviewed merge":1,"Quest":2,"Community merge":3};
  return entries.sort((a,b)=>(priority[a.kind]??9)-(priority[b.kind]??9)||a.title.localeCompare(b.title));
 }
 return Object.freeze({analyze,uses,normalize,safeWiki,safeJoin,validCap,
  knownCaps:Object.freeze(wikiCaps.map(([name,cap,slug])=>Object.freeze({name,cap,url:"https://aqwwiki.wikidot.com/"+slug})))});
});
