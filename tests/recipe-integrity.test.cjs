"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const api=require("../js/recipe-integrity.js");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const css=fs.readFileSync(path.join(__dirname,"../css/recipe-coverage.css"),"utf8");
const expected=[
 ["Blood Gem of the Archfiend",50],
 ["Dark Crystal Shard",200],
 ["Diamond of Nulgath",500],
 ["Gem of Nulgath",150],
 ["Nulgath Insignia",20],
 ["Sin of Revontheus",1],
 ["Tainted Gem",300],
 ["Totem of Nulgath",50]
];
const recipe=api.getRecipe("Sin of the Abyss");
assert.ok(recipe&&recipe.coverage==="reviewed-ingredients");
assert.equal(recipe.steps.length,8,"All screenshot + AQWWiki components are present");
assert.deepEqual(recipe.steps.map(x=>[x.item,x.target]),expected);
assert.equal(recipe.steps.find(x=>x.item==="Nulgath Insignia").kind,"material");
assert.equal(recipe.steps.find(x=>x.item==="Sin of Revontheus").kind,"owned");
assert.equal(api.getRecipe("Unknown Item"),null,"Never invent recipes for unknown items");
const evidence=api.getAcquisition("Sin of the Abyss");
assert.equal(evidence.complete,"final-merge");
assert.equal(evidence.wiki,"https://aqwwiki.wikidot.com/sin-of-the-abyss");
assert.deepEqual(evidence.ingredients,expected);
assert.equal(evidence.methods[0].url,evidence.wiki);
const stock=new Map([
 ["Blood Gem of the Archfiend",34],["Dark Crystal Shard",291],
 ["Diamond of Nulgath",953],["Gem of Nulgath",279],
 ["Nulgath Insignia",10],["Sin of Revontheus",1],
 ["Tainted Gem",500],["Totem of Nulgath",37]
]);
const shortfall=recipe.steps.filter(x=>x.kind==="material")
 .map(x=>({item:x.item,missing:Math.max(0,x.target-(stock.get(x.item)||0))}))
 .filter(x=>x.missing>0);
assert.deepEqual(shortfall,[
 {item:"Blood Gem of the Archfiend",missing:16},
 {item:"Nulgath Insignia",missing:10},
 {item:"Totem of Nulgath",missing:13}
]);
assert.equal(shortfall.reduce((sum,x)=>sum+x.missing,0),39);
const old={
 id:"project-original",name:"Sin of the Abyss",type:"Weapon",
 steps:[
  {id:"blood",label:"Collect 50 Blood Gems of the Archfiend",kind:"material",item:"Blood Gem of the Archfiend",target:50,status:"unknown"},
  {id:"totem",label:"Collect 50 Totems of Nulgath",kind:"material",item:"Totem of Nulgath",target:50,status:"unknown"},
  {id:"manual",label:"Verify full Nulgath Insignia and component requirements",kind:"manual",status:"unknown"}
 ]
};
let number=0;
const make=s=>({id:"new-"+ ++number,...s,status:"unknown"});
assert.equal(api.isLegacySin(old),true,"Old untouched checklist recognized");
assert.equal(api.upgradeUntouchedLegacy(old,make),true,"Migration must work");
assert.equal(old.id,"project-original","Project ID unchanged");
assert.equal(old.steps.length,8);
assert.ok(old.steps.some(x=>x.id==="blood"),"Original Blood Gem step ID preserved");
assert.ok(old.steps.some(x=>x.id==="totem"),"Original Totem step ID preserved");
assert.ok(!old.steps.some(x=>x.id==="manual"),"Obsolete incomplete-recipe placeholder removed");
assert.equal(api.inspect(old,evidence).status,"reviewed");
assert.equal(api.upgradeUntouchedLegacy(old,make),false,"Migration idempotent");
const modified={
 id:"custom",name:"Sin of the Abyss",type:"Weapon",steps:[
  {id:"keep",label:"Blood Gems",kind:"material",item:"Blood Gem of the Archfiend",target:40,status:"todo"},
  {id:"custom-note",label:"My personal farm note",kind:"manual",status:"done"},
  {id:"obsolete",label:"Verify full Nulgath Insignia and component requirements",kind:"manual",status:"unknown"}
 ]
};
assert.equal(api.isLegacySin(modified),false,"Do not silently upgrade customized checklists");
assert.equal(api.upgradeUntouchedLegacy(modified,make),false);
assert.equal(modified.steps.length,3);
assert.equal(api.inspect(modified,evidence).status,"needs-sync");
const sync=api.sync(modified,make);
assert.equal(sync.changed,true);
assert.equal(modified.id,"custom");
assert.ok(modified.steps.some(x=>x.id==="custom-note"&&x.status==="done"),"Custom manual progress remains");
assert.ok(modified.steps.some(x=>x.id==="keep"&&x.target===50&&x.status==="todo"),"Correct source quantity, preserve ID and status");
assert.ok(!modified.steps.some(x=>x.id==="obsolete"),"Remove only exact outdated placeholder");
assert.equal(modified.steps.length,9,"Eight official ingredients + custom note");
assert.equal(api.inspect(modified,evidence).status,"reviewed");
assert.equal(api.sync(modified,make).changed,false,"Manual sync is also idempotent");
const unknown={name:"Unknown Challenge",steps:[{kind:"material",item:"One Item",target:10}]};
const unreviewed=api.inspect(unknown,{origin:"community",wiki:"https://aqwwiki.wikidot.com/example",ingredients:[["One Item",10],["Another Item",20]]});
assert.equal(unreviewed.status,"not-reviewed","Community data never labelled verified");
assert.deepEqual(unreviewed.communityExtra,[{item:"Another Item",target:20}]);
assert.ok(!html.includes("Collect 50 Blood Gems of the Archfiend"),"Old hard-coded Sin recipe removed");
assert.ok(html.includes("window.AQWCRecipeIntegrity?.getRecipe(name)"),"Use reviewed recipes before starter catalog");
assert.ok(html.includes("AQWCRecipeIntegrity?.upgradeUntouchedLegacy(p,freshStep)"),"Migrate old saved projects");
assert.ok(html.includes("AQWCRecipeIntegrity.sync(project,freshStep)"),"Manual sync for edited projects");
assert.ok(!html.includes("Starter checklist — complete recipe not independently verified"),"No repetitive unverified banners in Wishlist");
assert.ok(!html.includes("Final merge checked against AQWWiki"),"No repetitive verification badges");
assert.ok(html.includes("Recipe ingredients need updating"),"Only actionable recipe fixes surface a notice");
assert.ok(html.includes("href=\"css/recipe-coverage.css\""));
assert.ok(html.includes("src=\"js/recipe-integrity.js\""));
assert.ok(html.includes("AQWCRecipeIntegrity?.reviewedNames"),"Reviewed recipe should remain searchable without community catalog");
assert.ok(!html.includes("Source-reviewed final merge requirements"),"Do not clutter recipe details with verification badges");
assert.ok(html.includes("section.append(node(\'h3\',\'Ingredients\'))"),"Recipe details use a short universal label");
assert.ok(html.includes("Self-dependent quests are later stages"),"Reject self-dependent quest route as recipe");
assert.ok(!html.includes("Verified merge ingredients")&&!html.includes("Verified final merge requirements"),"Unaudited recipes must not be labelled verified");
assert.ok(html.indexOf("src=\"js/recipe-integrity.js\"")<html.indexOf("src=\"js/account-statistics.js\""),"Registry loads before app");
assert.ok(css.includes(".recipe-coverage-line"));
for(const [i,m] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries())
 if(!m[1].includes("src=")&&m[2].trim())new vm.Script(m[2],{filename:"index-inline-"+i});

const forgeMetalNames=[
 "Almighty Aluminum of Destiny","Blessed Barium of Destiny","Celestial Copper of Destiny",
 "Glorious Gold of Destiny","Immortal Iron of Destiny","Pious Platinum of Destiny",
 "Sanctified Silver of Destiny","Accursed Arsenic of Doom","Baneful Beryllium of Doom",
 "Calamitous Chromium of Doom","Malefic Mercury of Doom","Pernicious Palladium of Doom",
 "Reprehensible Rhodium of Doom","Treacherous Thorium of Doom"
];
assert.equal(api.reviewedNames.length,37,"Sin + 14 Forge Metal + 22 Light Merge rows reviewed");
for(const name of forgeMetalNames){
 const entry=api.getRecipe(name);
 assert.equal(entry.steps.length,3,name+" needs the three Forge Metal ingredients");
 assert.ok(!entry.steps.some(s=>s.item===name),"The target itself is not a recipe ingredient");
 assert.ok(!entry.steps.some(s=>s.item==="Forge Key"),"Forge Key belongs to a later BLoD quest");
 assert.equal(api.getAcquisition(name).wiki,"https://aqwwiki.wikidot.com/forge-metal");
}
const copper=api.getRecipe("Celestial Copper of Destiny");
assert.deepEqual(copper.steps.map(s=>[s.item,s.target]),[
 ["Loyal Spirit Orb",5],["Bright Aura",2],["Celestial Copper",1]
]);
let forgeId=0;
const legacyForge={
 id:"old-forge-goal",name:"Celestial Copper of Destiny",type:"Misc",
 steps:[
  {id:"self",label:"Celestial Copper of Destiny ×1",kind:"owned",item:"Celestial Copper of Destiny",target:1,status:"unknown"},
  {id:"key",label:"Forge Key ×1",kind:"owned",item:"Forge Key",target:1,status:"unknown"},
  {id:"quest",label:"Complete Celestial Copper of Destiny (confirm in game)",kind:"manual",status:"unknown"}
 ]
};
assert.equal(api.isLegacyForge(legacyForge),true);
assert.equal(api.upgradeUntouchedLegacy(legacyForge,step=>({id:"copper-"+ ++forgeId,...step,status:"unknown"})),true);
assert.equal(legacyForge.id,"old-forge-goal","Saved wishlist goal ID persists");
assert.deepEqual(legacyForge.steps.map(s=>[s.item,s.target]),[
 ["Loyal Spirit Orb",5],["Bright Aura",2],["Celestial Copper",1]
]);
assert.equal(api.inspect(legacyForge).status,"reviewed");
assert.equal(api.upgradeUntouchedLegacy(legacyForge,()=>{throw Error("must be idempotent")}),false);
const customizedForge={name:"Celestial Copper of Destiny",steps:[
  {id:"self",label:"Celestial Copper of Destiny ×1",kind:"owned",item:"Celestial Copper of Destiny",target:1,status:"unknown"},
  {id:"key",label:"Forge Key ×1",kind:"owned",item:"Forge Key",target:1,status:"unknown"},
  {id:"quest",label:"Complete Celestial Copper of Destiny (confirm in game)",kind:"manual",status:"done"},
  {id:"my-note",kind:"manual",label:"My personal plan",status:"done"}
]};
assert.equal(api.upgradeUntouchedLegacy(customizedForge,()=>{throw Error("must not auto edit")}),false,"Custom project safe");
assert.equal(api.inspect(customizedForge).status,"needs-sync");
api.sync(customizedForge,step=>({id:"added-"+ ++forgeId,...step,status:"unknown"}));
assert.equal(customizedForge.steps.length,4,"Three ingredients plus the custom note");
assert.ok(customizedForge.steps.some(s=>s.id==="my-note"&&s.status==="done"),"Preserve customized step");


const lightRecipes={
 "Blade of Destiny":[["Basic Weapon Kit",1],["Blessed Barium of Destiny",1],["Spirit Orb",15],["Loyal Spirit Orb",1],["Brilliant Aura",1]],
 "Bright Blade of Destiny":[["Blade of Destiny",1],["Advanced Weapon Kit",1],["Brilliant Aura",1]],
 "Blinding Blade of Destiny":[["Bright Blade of Destiny",1],["Ultimate Weapon Kit",1]],
 "Broadsword of Destiny":[["Basic Weapon Kit",1],["Glorious Gold of Destiny",1],["Spirit Orb",20],["Loyal Spirit Orb",1],["Brilliant Aura",1]],
 "Bright Broadsword of Destiny":[["Broadsword of Destiny",1],["Advanced Weapon Kit",1],["Bright Aura",1],["Undead Energy",25]],
 "Blinding Broadsword of Destiny":[["Bright Broadsword of Destiny",1],["Ultimate Weapon Kit",1]],
 "Daggers of Destiny":[["Basic Weapon Kit",1],["Almighty Aluminum of Destiny",1],["Spirit Orb",50]],
 "Bright Daggers of Destiny":[["Undead Energy",50],["Daggers of Destiny",1],["Advanced Weapon Kit",1],["Spirit Orb",75]],
 "Blinding Daggers of Destiny":[["Bright Daggers of Destiny",1],["Ultimate Weapon Kit",1]],
 "Bow of Destiny":[["Basic Weapon Kit",1],["Sanctified Silver of Destiny",1],["Undead Energy",17],["Spirit Orb",13],["Loyal Spirit Orb",1],["Brilliant Aura",1]],
 "Bright Bow of Destiny":[["Bow of Destiny",1],["Advanced Weapon Kit",1],["Loyal Spirit Orb",3]],
 "Blinding Bow of Destiny":[["Bright Bow of Destiny",1],["Ultimate Weapon Kit",1]],
 "Mace of Destiny":[["Basic Weapon Kit",1],["Celestial Copper of Destiny",1],["Undead Energy",7],["Spirit Orb",20],["Loyal Spirit Orb",1]],
 "Bright Mace of Destiny":[["Mace of Destiny",1],["Advanced Weapon Kit",1],["Bright Aura",2]],
 "Blinding Mace of Destiny":[["Bright Mace of Destiny",1],["Ultimate Weapon Kit",1]],
 "Scythe of Destiny":[["Basic Weapon Kit",1],["Immortal Iron of Destiny",1],["Undead Energy",10],["Spirit Orb",10],["Loyal Spirit Orb",2]],
 "Bright Scythe of Destiny":[["Scythe of Destiny",1],["Advanced Weapon Kit",1],["Brilliant Aura",2]],
 "Blinding Scythe of Destiny":[["Bright Scythe of Destiny",1],["Ultimate Weapon Kit",1]],
 "Bright Aura":[["Loyal Spirit Orb",50]],
 "Brilliant Aura":[["Bright Aura",25]],
 "Loyal Spirit Orb":[["Spirit Orb",100]],
 "Spirit Orb":[["Undead Energy",50]]
};
for(const [name,ingredients] of Object.entries(lightRecipes)){
 assert.deepEqual(api.getRecipe(name).steps.map(x=>[x.item,x.target]),ingredients,"Light Merge wiki ingredients for "+name);
 assert.equal(api.getAcquisition(name).wiki,"https://aqwwiki.wikidot.com/light-merge");
 assert.ok(api.getAcquisition(name).methods[0].join==="/join necropolis");
}
assert.deepEqual(api.getRecipe("Spirit Orb (Misc)").steps.map(x=>[x.item,x.target]),[["Undead Energy",50]],"Wiki disambiguation alias resolves to inventory-friendly name");

console.log("Wishlist recipe integrity passed: 8 verified components, saved checklists, safe sync and incomplete-recipe warnings");
