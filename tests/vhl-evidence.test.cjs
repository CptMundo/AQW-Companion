"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
require("../js/combat-timeline.js");
const evidence=JSON.parse(fs.readFileSync(path.join(__dirname,"../data/combat/vhl-evidence.json"),"utf8"));
const T=globalThis.AQWCombatTimeline;
assert.equal(evidence.className,T.model.name);
assert.equal(evidence.skills.length,5);
assert.equal(evidence.skills.find(x=>x.id==="contract").cooldownSeconds,T.model.auto.cooldown);
assert.equal(evidence.skills.find(x=>x.id==="contract").button,1);
for(const skill of evidence.skills.filter(x=>x.id!=="contract")){
  const actual=T.model.skills[skill.id];
  assert.ok(actual,"missing class skill "+skill.id);
  assert.equal(actual.button,skill.button,"button mismatch "+skill.id);
  assert.equal(actual.cooldown,skill.cooldownSeconds,"cooldown mismatch "+skill.id);
  assert.equal(actual.coefficient,skill.damageCoefficient,"coefficient mismatch "+skill.id);
  assert.equal(actual.functionId,null,"unsupported damage function mapped without evidence");
  assert.equal(skill.functionId,null,"damage function must be unknown until verified");
}
assert.equal(new Set(evidence.skills.map(x=>x.button)).size,5);
const expectedForge={Dauntless:2,Lacerate:2,Ravenous:3,Smite:5,Valiance:1};
for(const trait of evidence.forgeTriggers){
  assert.equal(trait.button,expectedForge[trait.name]);
  assert.equal(trait.damageFormulaVerified,false);
}
assert.equal(evidence.passives.rank4.critChancePct,T.model.passives.rank4CritChancePct);
assert.equal(evidence.passives.rank10.endurancePct,T.model.passives.rank10EndurancePct);
assert.ok(evidence.evidenceSources.wiki.startsWith("https://aqwwiki.wikidot.com/"));
assert.ok(evidence.evidenceSources.officialBalancePatch.includes("AQW-Balance-PatchNotes"));
assert.ok(evidence.unresolved.some(x=>x.includes("backend damage function")));
console.log("Source-audited VHL evidence consistency checks passed");
