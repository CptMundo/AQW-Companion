/* Run: node tests/combat-engine.test.cjs
   Tests timeline structure, never fabricated DPS. */
"use strict";
const assert=require("node:assert/strict");
require("../js/combat-engine.js");
const engine=globalThis.AQWCombatEngine;
const base={seconds:15,rotation:["unshackle","gaze","armageddon"],actionGapSeconds:0.5};
let result=engine.simulate(base);
assert.equal(result.seconds,15);
assert.equal(result.fullDamage,null);
assert.equal(result.dps,null);
assert.ok(result.missingHitCount>0);
assert.equal(result.events[0].id,"unshackle");
assert.ok(result.events.some(e=>e.id==="armageddon"));
for(const e of result.events) assert.ok(e.time<15);
const twenty=engine.simulate({...base,seconds:20});
assert.ok(twenty.events.length>=result.events.length);
const measured=engine.simulate({...base,measuredHits:{unshackle:100,gaze:200,armageddon:300}});
assert.equal(measured.missingHitCount,0);
assert.equal(measured.resultStatus,"measured-input-only");
assert.equal(measured.fullDamage,measured.events.reduce((a,e)=>a+e.damage,0));
assert.equal(measured.dps,measured.fullDamage/15);
assert.throws(()=>engine.simulate({...base,seconds:30}),/15 or 20/);
assert.throws(()=>engine.simulate({...base,rotation:["not-real"]}),/Unknown skill/);
assert.throws(()=>engine.simulate({...base,measuredHits:{unshackle:-1}}),/nonnegative/);
const autos=engine.simulate({...base,includeAuto:true,measuredHits:{auto:50,unshackle:100,gaze:200,armageddon:300}});
assert.ok(autos.events.some(e=>e.kind==="auto"));
assert.equal(autos.missingHitCount,0);
console.log("Combat engine tests passed", {fifteenEvents:result.events.length,twentyEvents:twenty.events.length});
