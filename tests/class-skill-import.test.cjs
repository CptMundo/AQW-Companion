"use strict";
const assert=require("node:assert/strict");
require("../js/class-skill-import.js");
const I=globalThis.AQWClassSkillImport;
const raw={actions:{active:Array.from({length:5},(_,i)=>({
  nam:["Contract","Shackle","Highlord's Gaze","Unshackle","Armageddon"][i],
  dsrc:i===2?"AP2":"Unknown",
  damage:i===1?"125":"???",
  cd:4,mp:0,
  accountPassword:"never expose this"
}))}};
const parsed=I.parse(raw);
assert.equal(parsed.status,"requires-independent-validation");
assert.equal(parsed.skills.length,5);
assert.equal(parsed.skills[2].button,3);
assert.equal(parsed.skills[2].recognizedFunction,"AP2");
assert.equal(parsed.skills[1].recognizedFunction,null);
assert.equal(parsed.skills[1].damageRaw,"125");
assert.equal(parsed.skills[1].cooldownRaw,"4");
assert.ok(!JSON.stringify(parsed).includes("accountPassword"));
assert.ok(!JSON.stringify(parsed).includes("never expose this"));
assert.equal(parsed.warnings.length,3);
assert.throws(()=>I.parse({actions:{active:[]}}),/exactly five/);
assert.throws(()=>I.parse({actions:{active:[1,2,3,4,5]}}),/invalid skill/);
assert.throws(()=>I.parse({actions:{active:Array.from({length:5},()=>({nam:"",dsrc:"AP1"}))}}),/no name/);
assert.throws(()=>I.parse({actions:{active:Array.from({length:5},()=>({nam:"X",dsrc:{x:"bad"}}))}}),/not a scalar/);
console.log("Untrusted local class-skill import tests passed");
