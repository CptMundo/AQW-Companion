"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const siteCss=fs.readFileSync(path.join(__dirname,"../css/site.css"),"utf8");
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
const groups=["home","projects","planner","ultras","builds","story","badges","explore","inventory"];
assert.deepEqual(groupNames,groups,"primary navigation must retain the existing sections plus Badge Hunter");
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
  "['Forge tracker',()=>{initForgeTracker()}]",
  'id="forge-list"'
])assert.ok(html.includes(marker),"existing Build/Forge functionality was affected: "+marker);
assert.ok(siteCss.includes("#forge .forge-tracker-items"),"Forge CSS was lost during extraction");
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.filter(x=>!x[1].includes("src=")).length,1,"main inline application is preserved");
assert.ok(!scripts.some(x=>/combat-engine|damage-simulator/.test(x[1])),"retired Damage Simulator scripts stay removed");
assert.ok(scripts.filter(x=>x[1].includes("src=")).every(x=>/badge-catalog\.js|badge-hunter\.js|src="js\/onboarding\.js\?v=1"|src="js\/account-progress\.js\?v=2"|umami-analytics\.js|account-statistics\.js|src="js\/portable-progress\.js\?v=1"|recipe-integrity\.js|src="js\/quest-dependencies\.js\?v=1"|src="js\/merge-dependencies\.js\?v=4"|ultra-quote-actions\.js|wishlist-finds\.js|meta-class-builds\.js|ultra-guide-rows\.js|routine-library\.js|stack-alerts\.js|src="extension\/wishlist-link\.js\?v=126"|src="extension\/wiki-boosts\.js\?v=51"|src="js\/boost-finder\.js\?v=3"|src="extension\/companion-theme\.js\?v=55"|src="js\/site-theme\.js\?v=2"/.test(x[1])),"only reviewed local scripts may load");
for(const [index,script] of scripts.entries())if(script[2].trim())new vm.Script(script[2],{filename:"index:inline-"+index});
assert.ok(html.includes("activateTab('overview')"),"home default navigation preserved");
console.log("Navigation smoke passed: all primary sections, Forge and Account Statistics views; simulator removed.");

// The existing Badge Hunter alert belongs to the calendar, even before an inventory import.
const calendar=html.indexOf('id="home-calendar-card"'),alert=html.indexOf('id="badge-hunter-home"'),events=html.indexOf('id="homeseasoncontent"');
assert.ok(calendar>=0&&calendar<alert&&alert<events);
assert.equal([...html.matchAll(/id="badge-hunter-home"/g)].length,1);
assert.ok(html.includes('calendarSlot=loaded?document.querySelector(\'#dashboard .home-main-grid\'):$('+"'home-calendar-guest'"+')'));
assert.ok(html.includes("root.append(feedStatus)"));
for(const theme of ['stars','dark','light','cas'])assert.ok(siteCss.includes('html[data-aqwc-background="'+theme+'"] #overview .homeseason{--calendar-accent:'));
const badges=fs.readFileSync(path.join(__dirname,"../js/badge-hunter.js"),"utf8");new vm.Script(badges);assert.ok(badges.includes("calendar-badge-entry"));assert.ok(badges.includes("end.dateTime=b.window.end"));
console.log("Calendar seasonal alerts, guest access and theme accents checked.");

assert.ok(html.includes('data-inventory-booting="true"'));
assert.ok(html.includes('id="welcome" class="placeholder hidden"'));
assert.ok(siteCss.includes('#overview[data-inventory-booting] :is(#welcome,#dashboard,#home-calendar-guest){display:none!important}'));
assert.ok(html.indexOf('finishInventoryStartup();')<html.indexOf('try{await loadCommunity();await loadPublicCatalog()'));
const finishSource=html.match(/function finishInventoryStartup\(\)\{[\s\S]*?\n\}/)[0];
function startupState(current,error){
 const overview={boot:true,hasAttribute(){return this.boot},removeAttribute(){this.boot=false},setAttribute(){}};
 const welcome={classList:{toggle(k,v){this.hidden=v}}},dashboard={classList:{toggle(k,v){this.hidden=v}}},loader={hidden:false,replaceChildren(){this.error=true},classList:{add(){}},setAttribute(){}};
 const context={current,inventoryStorageError:error,$:id=>({overview,welcome,dashboard,'home-inventory-loading':loader}[id]),node:()=>({})};
 vm.runInNewContext(finishSource+'\nfinishInventoryStartup()',context);
 return [overview.boot,welcome.classList.hidden,dashboard.classList.hidden,loader.hidden,!!loader.error];
}
assert.deepEqual(startupState({items:[]},''),[false,true,false,true,false]);
assert.deepEqual(startupState(null,''),[false,false,true,true,false]);
assert.deepEqual(startupState(null,'storage error'),[false,true,true,false,true]);
console.log('Startup distinguishes saved inventory, first visit and recovery errors.');

// Portable progress is a reviewed local module, not a remote or experimental script.
new vm.Script(fs.readFileSync(path.join(__dirname,'../js/portable-progress.js'),'utf8'));
assert.equal(scripts.filter(x=>x[1].includes('src="js/portable-progress.js?v=1"')).length,1);
