"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const recipes=require("../js/recipe-integrity.js");

const sword=recipes.getVerified("Necrotic Sword of the Abyss");
assert.ok(sword,"Necrotic Sword of the Abyss must be in reviewed registry");
assert.equal(sword.type,"Weapon","Canonical classification must be Weapon");
assert.equal(recipes.getRecipe(sword.name).steps.length,4,"Keep complete four-step recipe");

function extract(start,end){
 const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,"Could not extract "+start);
 return html.slice(a,b);
}
const canonicalSource=extract("function canonicalWishlistType(name,type){","function newProject(p)");
const sandbox={window:{AQWCRecipeIntegrity:recipes}};
const canonical=vm.runInNewContext("("+canonicalSource.trim()+")",sandbox);
assert.equal(canonical(sword.name,"Misc"),"Weapon","Old Misc classification must be corrected");
assert.equal(canonical(sword.name,"Other"),"Weapon");
assert.equal(canonical("Sin of the Abyss","Other"),"Weapon");
assert.equal(canonical("Drakath the Eternal","Armor"),"Armor","Don't override unreviewed categories");
assert.equal(canonical("Custom goal",null),"Other");

const originalSteps=[
 {id:"step-doom",kind:"owned",item:"Necrotic Sword of Doom",target:1,status:"done",label:"Necrotic Sword of Doom ×1"},
 {id:"step-roent",kind:"material",item:"Roentgenium of Nulgath",target:2,status:"todo",label:"Roentgenium of Nulgath ×2"},
 {id:"step-a",kind:"owned",item:"Void Crystal A",target:1,status:"done",label:"Void Crystal A ×1"},
 {id:"step-b",kind:"owned",item:"Void Crystal B",target:1,status:"unknown",label:"Void Crystal B ×1"}
];
const oldGoal={id:"saved-abyss-goal",name:sword.name,type:"Misc",createdAt:"2026-11-01T00:00:00Z",steps:structuredClone(originalSteps)};
const untouched={id:"another-goal",name:"Custom Goal",type:"Other",steps:[{id:"manual",kind:"manual",label:"My own note",status:"done"}]};
const unlocks=[oldGoal,untouched];
let saved=0;
const migrationSource=extract("function upgradeLegacyRecipes(){","function stepStatus(s)");
const migrationContext={
 window:{AQWCRecipeIntegrity:recipes},
 unlocks,
 saveUnlocks:()=>{saved++},
 normalizedName:s=>String(s||"").toLowerCase().trim(),
 catalog:[],
 freshStep:step=>step,
 catalogToProject:()=>{throw Error("Unrelated project should not migrate")},
 acquisitionFor:()=>null
};
vm.runInNewContext(extract("const blodFinalIngredients=","const catalogExtras=")+migrationSource+"; upgradeLegacyRecipes();",migrationContext);
assert.equal(oldGoal.type,"Weapon","Persisted old goal corrected on load");
assert.equal(oldGoal.id,"saved-abyss-goal","Keep Wishlist project id");
assert.deepEqual(oldGoal.steps,originalSteps,"Keep every ingredient, step ID and progress");
assert.equal(saved,1,"Save corrected type once");
assert.equal(untouched.type,"Other","Do not change unrelated goals");
vm.runInNewContext("upgradeLegacyRecipes();",migrationContext);
assert.equal(saved,1,"Repeated renders do not rewrite storage");

assert.ok(html.includes("type:canonicalWishlistType(p.name,p.type)"),"New goals use source-reviewed type");
assert.ok(html.includes("if(reviewed)dictionary.set(normalizedName(name),{name,type:reviewed.type,recipe:true})"),
 "Reviewed recipes override stale community suggestions");
assert.ok(html.includes("heading.append(itemTypeNode(canonicalWishlistType(project.name,project.type))"),
 "Wishlist icons use canonical type even before storage migration");
assert.ok(html.includes("node('small',itemTypeLabel(canonicalWishlistType(project.name,project.type))"),
 "Wishlist labels use canonical type too");
assert.ok(!html.includes("remove-step-quiet"),"Do not reintroduce removed X buttons");
assert.ok(html.includes("const rm=node('button','×','smallbutton wishlist-dismiss')"),
 "Whole Wishlist X must remain");

for(const [i,m] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries())
 if(!m[1].includes("src=")&&m[2].trim())new vm.Script(m[2],{filename:"index-inline-"+i});
console.log("Wishlist source-reviewed type fix passed: Weapon icon, old goal migration, ID/steps intact, no unnecessary writes.");
