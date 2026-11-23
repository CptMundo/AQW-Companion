"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const noFragments=[
  'data-group="damage"',
  'data-tab="damage"',
  'data-parent="damage"',
  '<section id="damage"',
  'Damage Simulator',
  'initDamageSimulator()',
  'src="js/combat-engine.js"',
  'src="js/combat-engine-ui.js"',
  'const damageClassCatalog',
  '#damage'
];
for(const token of noFragments)assert.ok(!html.includes(token),"retired Damage Simulator is still present: "+token);
const groupNames=[...html.matchAll(/<button\b[^>]*data-group="([^"]+)"/g)].map(m=>m[1]);
const groups=["home","projects","planner","builds","story","ultras","explore","inventory"];
assert.deepEqual(groupNames,groups,"primary navigation must retain the other eight sections");
const tabs=[...html.matchAll(/<button\b[^>]*data-tab="([^"]+)"[^>]*data-parent="([^"]+)"/g)]
  .map(m=>({name:m[1],parent:m[2]}));
const views=new Set([...html.matchAll(/<section\s+id="([^"]+)"\s+class="view\b/g)].map(m=>m[1]));
assert.ok(views.size>=12,"all previously present non-damage views remain");
assert.ok(views.has("forge"),"Forge Tracker now has its own secondary view");
for(const tab of tabs){
  assert.ok(groups.includes(tab.parent),"tab parent not in groups: "+tab.name);
  assert.ok(views.has(tab.name),"tab has no view: "+tab.name);
}
for(const id of ["builds","planner","overview","inventory","unlocks","story","ultras"])assert.ok(views.has(id));
for(const marker of [
  'function initClassBuildPlanner()',
  'function initForgeTracker()',
  'initClassBuildPlanner();initForgeTracker()',
  'id="forge-list"',
  '#forge .forge-tracker-items'
])assert.ok(html.includes(marker),"existing Build/Forge functionality was affected: "+marker);
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length,1,"retired external scripts removed");
for(const [index,script] of scripts.entries())new vm.Script(script[2],{filename:"index:inline-"+index});
assert.ok(html.includes("activateTab('overview')"),"home default navigation preserved");
console.log("Navigation smoke passed: 8 groups, 13 views including Forge Tracker; simulator removed.");
