"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const expected=["combat-engine.js","combat-timeline.js","combat-engine-ui.js"];
const positions=expected.map(name=>html.indexOf('src="js/'+name+'"'));
assert.ok(positions.every(p=>p!==-1),"all combat scripts must be loaded");
assert.ok(positions[0]<positions[1]&&positions[1]<positions[2],
  "combat engine, timeline, and UI must load in dependency order");
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
for(const [i,s] of scripts.entries()){
  if(s[1].includes("src=")||!s[2].trim())continue;
  new vm.Script(s[2],{filename:"index:inline-"+i});
}
for(const name of expected.concat(["damage-formulas.js","damage-kernel.js"])){
  const p=path.join(__dirname,"../js",name);
  if(fs.existsSync(p))new vm.Script(fs.readFileSync(p,"utf8"),{filename:name});
}
const ui=fs.readFileSync(path.join(__dirname,"../js/combat-engine-ui.js"),"utf8");
assert.ok(ui.includes('id="combat-forge"'),"Forge selector is present");
assert.ok(ui.includes("weaponForge:forge.value"),"Forge selection reaches the timeline");
assert.ok(ui.includes('id="combat-total-damage"'),"observed total input preserved");
console.log("Combat site static smoke checks passed",scripts.length,"script tags");
