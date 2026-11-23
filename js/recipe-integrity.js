/* AQW Companion — reviewed crafting requirements, not a generic quest prerequisite parser.
 * Public source facts only. Never reads/modifies player storage or sends network requests.
 * Source: AQWWiki Forge Metal shop (2026-11-23); Sin of the Abyss screenshot/wiki.
 */
(function(root,factory){
 "use strict";
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.AQWCRecipeIntegrity=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const normalize=s=>String(s||"").trim().toLowerCase().replace(/[’‘]/g,"'");
 const SIN_SOURCE="https://aqwwiki.wikidot.com/sin-of-the-abyss";
 const FORGE_SOURCE="https://aqwwiki.wikidot.com/forge-metal";
 const SIN=[
  ["Blood Gem of the Archfiend",50],
  ["Dark Crystal Shard",200],
  ["Diamond of Nulgath",500],
  ["Gem of Nulgath",150],
  ["Nulgath Insignia",20],
  ["Sin of Revontheus",1],
  ["Tainted Gem",300],
  ["Totem of Nulgath",50]
 ];
 // All 14 Forge Metal shop rows are individually listed on the same AQWWiki page.
 // Destination metal is ONE ingredient. Forge Key is a different, later quest.
 const DESTINY=["Almighty Aluminum","Blessed Barium","Celestial Copper","Glorious Gold","Immortal Iron","Pious Platinum","Sanctified Silver"];
 const DOOM=["Accursed Arsenic","Baneful Beryllium","Calamitous Chromium","Malefic Mercury","Pernicious Palladium","Reprehensible Rhodium","Treacherous Thorium"];
 const LIGHT_SOURCE="https://aqwwiki.wikidot.com/light-merge";
 const LIGHT_MERGE=[["Blade of Destiny",[["Basic Weapon Kit",1],["Blessed Barium of Destiny",1],["Spirit Orb",15],["Loyal Spirit Orb",1],["Brilliant Aura",1]]],["Bright Blade of Destiny",[["Blade of Destiny",1],["Advanced Weapon Kit",1],["Brilliant Aura",1]]],["Blinding Blade of Destiny",[["Bright Blade of Destiny",1],["Ultimate Weapon Kit",1]]],["Broadsword of Destiny",[["Basic Weapon Kit",1],["Glorious Gold of Destiny",1],["Spirit Orb",20],["Loyal Spirit Orb",1],["Brilliant Aura",1]]],["Bright Broadsword of Destiny",[["Broadsword of Destiny",1],["Advanced Weapon Kit",1],["Bright Aura",1],["Undead Energy",25]]],["Blinding Broadsword of Destiny",[["Bright Broadsword of Destiny",1],["Ultimate Weapon Kit",1]]],["Daggers of Destiny",[["Basic Weapon Kit",1],["Almighty Aluminum of Destiny",1],["Spirit Orb",50]]],["Bright Daggers of Destiny",[["Undead Energy",50],["Daggers of Destiny",1],["Advanced Weapon Kit",1],["Spirit Orb",75]]],["Blinding Daggers of Destiny",[["Bright Daggers of Destiny",1],["Ultimate Weapon Kit",1]]],["Bow of Destiny",[["Basic Weapon Kit",1],["Sanctified Silver of Destiny",1],["Undead Energy",17],["Spirit Orb",13],["Loyal Spirit Orb",1],["Brilliant Aura",1]]],["Bright Bow of Destiny",[["Bow of Destiny",1],["Advanced Weapon Kit",1],["Loyal Spirit Orb",3]]],["Blinding Bow of Destiny",[["Bright Bow of Destiny",1],["Ultimate Weapon Kit",1]]],["Mace of Destiny",[["Basic Weapon Kit",1],["Celestial Copper of Destiny",1],["Undead Energy",7],["Spirit Orb",20],["Loyal Spirit Orb",1]]],["Bright Mace of Destiny",[["Mace of Destiny",1],["Advanced Weapon Kit",1],["Bright Aura",2]]],["Blinding Mace of Destiny",[["Bright Mace of Destiny",1],["Ultimate Weapon Kit",1]]],["Scythe of Destiny",[["Basic Weapon Kit",1],["Immortal Iron of Destiny",1],["Undead Energy",10],["Spirit Orb",10],["Loyal Spirit Orb",2]]],["Bright Scythe of Destiny",[["Scythe of Destiny",1],["Advanced Weapon Kit",1],["Brilliant Aura",2]]],["Blinding Scythe of Destiny",[["Bright Scythe of Destiny",1],["Ultimate Weapon Kit",1]]],["Bright Aura",[["Loyal Spirit Orb",50]]],["Brilliant Aura",[["Bright Aura",25]]],["Loyal Spirit Orb",[["Spirit Orb",100]]],["Spirit Orb",[["Undead Energy",50]]]];
 const reviewed=[
  {name:"Sin of the Abyss",type:"Weapon",source:SIN_SOURCE,sourceKind:"final-merge",reviewedOn:"2026-11-23",ingredients:SIN},
  ...DESTINY.map(metal=>({name:metal+" of Destiny",type:"Misc",source:FORGE_SOURCE,sourceKind:"forge-metal",reviewedOn:"2026-11-23",ingredients:[["Loyal Spirit Orb",5],["Bright Aura",2],[metal,1]]})),
  ...DOOM.map(metal=>({name:metal+" of Doom",type:"Misc",source:FORGE_SOURCE,sourceKind:"forge-metal",reviewedOn:"2026-11-23",ingredients:[["Corrupt Spirit Orb",5],["Ominous Aura",2],[metal,1]]})),
  ...LIGHT_MERGE.map(([name,ingredients])=>({name,type:/^(?:Bright Aura|Brilliant Aura|Loyal Spirit Orb|Spirit Orb)$/.test(name)?"Misc":"Weapon",source:LIGHT_SOURCE,sourceKind:"light-merge",reviewedOn:"2026-11-23",ingredients}))
 ];
 const indexed=new Map(reviewed.map(entry=>[normalize(entry.name),entry]));
 indexed.set("spirit orb (misc)",indexed.get("spirit orb"));
 function getVerified(name){return indexed.get(normalize(name))||null}
 function toSteps(entry){
  return entry.ingredients.map(([item,target])=>({label:item+" ×"+target,kind:target===1?"owned":"material",item,target}));
 }
 function getRecipe(name){
  const entry=getVerified(name);
  return entry?{name:entry.name,type:entry.type,coverage:"reviewed-ingredients",source:entry.source,steps:toSteps(entry)}:null;
 }
 function getAcquisition(name){
  const entry=getVerified(name);if(!entry)return null;
  return {
   name:entry.name,type:entry.type,origin:"reviewed",wiki:entry.source,
   complete:"final-merge",ingredients:entry.ingredients.map(row=>[...row]),
   methods:[{type:"Merge/Shop",title:entry.sourceKind==="forge-metal"?"Forge Metal — Geopetal, Dwarfhold Keep":entry.sourceKind==="light-merge"?"Light Merge — Artix, Necropolis":"Nulgath's Merge Shop (Ultra Nulgath)",
    url:entry.source,join:entry.sourceKind==="forge-metal"?"/join dwarfhold":entry.sourceKind==="light-merge"?"/join necropolis":"/join ultranulgath",
    details:"These are the ingredients for this merge, not prerequisites of a later quest."}]
  };
 }
 function stepMatches(step,item){
  return !!step&&["material","owned"].includes(step.kind)&&normalize(step.item)===normalize(item);
 }
 function inspect(project,reference){
  const steps=Array.isArray(project?.steps)?project.steps:[];
  const entry=getVerified(project?.name);
  if(entry){
   const missing=[],wrongQuantity=[],duplicates=[];
   for(const [item,target] of entry.ingredients){
    const found=steps.filter(s=>stepMatches(s,item));
    if(!found.length){missing.push({item,target});continue}
    if(found.length>1)duplicates.push({item,count:found.length});
    const kind=target===1?"owned":"material";
    if(found[0].kind!==kind||Number(found[0].target)!==target)
     wrongQuantity.push({item,expected:target,actual:found[0].target});
   }
   const staleForge=entry.sourceKind==="forge-metal"&&hasForgeQuestArtifacts(project);
   return {status:missing.length||wrongQuantity.length||duplicates.length||staleForge?"needs-sync":"reviewed",
    reviewed:true,source:entry.source,expectedCount:entry.ingredients.length,
    missing,wrongQuantity,duplicates,communityExtra:[],staleQuest:staleForge};
  }
  const listed=Array.isArray(reference?.ingredients)?reference.ingredients:[];
  const communityExtra=listed.filter(row=>Array.isArray(row)&&typeof row[0]==="string"&&
   !steps.some(s=>stepMatches(s,row[0]))).map(row=>({item:row[0],target:Number(row[1])||1}));
  return {status:"not-reviewed",reviewed:false,source:typeof reference?.wiki==="string"?reference.wiki:null,
   expectedCount:null,missing:[],wrongQuantity:[],duplicates:[],communityExtra};
 }
 const SIN_PLACEHOLDER="Verify full Nulgath Insignia and component requirements";
 function isLegacySin(project){
  if(normalize(project?.name)!=="sin of the abyss"||!Array.isArray(project.steps)||project.steps.length!==3)return false;
  const material=(name,target)=>project.steps.some(step=>step.kind==="material"&&normalize(step.item)===normalize(name)&&Number(step.target)===target);
  return material("Blood Gem of the Archfiend",50)&&material("Totem of Nulgath",50)&&
   project.steps.some(step=>step.kind==="manual"&&step.label===SIN_PLACEHOLDER);
 }
 function forgeArtifact(step,name){
  if(!step)return false;
  if(step.kind==="owned"&&normalize(step.item)===normalize(name))return true;
  if(step.kind==="owned"&&normalize(step.item)==="forge key")return true;
  return step.kind==="manual"&&step.label==="Complete "+name+" (confirm in game)";
 }
 function hasForgeQuestArtifacts(project){
  return Array.isArray(project?.steps)&&project.steps.some(step=>forgeArtifact(step,project.name));
 }
 function isLegacyForge(project){
  const entry=getVerified(project?.name);
  if(!entry||entry.sourceKind!=="forge-metal"||!Array.isArray(project.steps)||project.steps.length!==3)return false;
  if(!project.steps.every(step=>forgeArtifact(step,entry.name)))return false;
  if(!project.steps.some(step=>step.kind==="owned"&&normalize(step.item)===normalize(entry.name)))return false;
  if(!project.steps.some(step=>step.kind==="owned"&&normalize(step.item)==="forge key"))return false;
  return project.steps.some(step=>step.kind==="manual"&&step.label==="Complete "+entry.name+" (confirm in game)"&&["unknown",undefined,null].includes(step.status));
 }
 function sync(project,makeStep){
  const entry=getVerified(project?.name);
  if(!entry||!Array.isArray(project.steps)||typeof makeStep!=="function")
   return {changed:false,added:0,updated:0,removedPlaceholder:0};
  let added=0,updated=0,removedPlaceholder=0;
  for(const expected of toSteps(entry)){
   const existing=project.steps.find(step=>stepMatches(step,expected.item));
   if(existing){
    if(existing.kind!==expected.kind||Number(existing.target)!==expected.target||existing.label!==expected.label){
     Object.assign(existing,{label:expected.label,kind:expected.kind,target:expected.target});
     updated++;
    }
   }else{project.steps.push(makeStep(expected));added++}
  }
  const before=project.steps.length;
  project.steps=project.steps.filter(step=>{
   if(entry.sourceKind==="forge-metal")return !forgeArtifact(step,entry.name);
   return !(step.kind==="manual"&&step.label===SIN_PLACEHOLDER);
  });
  removedPlaceholder=before-project.steps.length;
  return {changed:!!(added||updated||removedPlaceholder),added,updated,removedPlaceholder};
 }
 function upgradeUntouchedLegacy(project,makeStep){
  return isLegacySin(project)||isLegacyForge(project)?sync(project,makeStep).changed:false;
 }
 return Object.freeze({getVerified,getRecipe,getAcquisition,inspect,sync,isLegacySin,isLegacyForge,upgradeUntouchedLegacy,
  reviewedNames:Object.freeze(reviewed.map(entry=>entry.name))});
});
