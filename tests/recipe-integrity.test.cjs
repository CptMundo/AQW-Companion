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
assert.ok(recipe&&recipe.coverage==="reviewed-final-merge");
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
assert.ok(html.includes("complete recipe not independently verified"),"Clearly label other recipes");
assert.ok(html.includes("href=\"css/recipe-coverage.css\""));
assert.ok(html.includes("src=\"js/recipe-integrity.js\""));
assert.ok(html.indexOf("src=\"js/recipe-integrity.js\"")<html.indexOf("src=\"js/account-statistics.js\""),"Registry loads before app");
assert.ok(css.includes(".recipe-coverage-line"));
for(const [i,m] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries())
 if(!m[1].includes("src=")&&m[2].trim())new vm.Script(m[2],{filename:"index-inline-"+i});
console.log("Wishlist recipe integrity passed: 8 verified components, saved checklists, safe sync and incomplete-recipe warnings");
