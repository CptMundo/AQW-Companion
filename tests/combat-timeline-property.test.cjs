"use strict";
/* Deterministic combinatorial checks: 9 rotations × 6 weapon traits × 4 haste × 3 gaps = 648 */
const assert=require("node:assert/strict");
require("../js/combat-timeline.js");
const T=globalThis.AQWCombatTimeline;
const forges=["None","Dauntless","Valiance","Ravenous","Lacerate","Smite"];
const rotations=[
  ["unshackle","gaze","armageddon"],
  ["shackle","gaze","armageddon"],
  ["shackle","unshackle","gaze","armageddon"],
  ["armageddon"],["gaze"],["shackle"],["unshackle"],
  ["shackle","unshackle"],["unshackle","shackle"]
];
let scenarios=0;
for(const rotation of rotations)for(const weaponForge of forges)
for(const baseHastePercent of [0,15,45,50])for(const actionGapSeconds of [0.1,0.5,1.5]){
 const report=T.plan({rotation,weaponForge,baseHastePercent,actionGapSeconds});
 const events=report.events;
 assert.ok(events.length>0);
 assert.equal(report.dps,null);
 assert.ok(events.length<2000);
 for(let i=0;i<events.length;i++){
   const event=events[i];
   assert.ok(event.time>=0&&event.time<60, "outside benchmark");
   if(i)assert.ok(event.time>=events[i-1].time, "unsorted event time");
   assert.ok(event.hastePercent>=0&&event.hastePercent<=50, "haste out of range");
   assert.ok(event.auras.every(a=>a.until>event.time),"expired effect leaked");
   assert.ok(!(event.auras.some(a=>a.id==="shackled")&&event.auras.some(a=>a.id==="unshackled")),
     "both exclusive postures active");
 }
 if(["Dauntless","Lacerate"].includes(weaponForge)&&!rotation.includes("shackle"))
   assert.ok(!events.some(e=>e.type==="forge-proc"),"button 2 proc without Shackle");
 if(weaponForge==="Ravenous"&&!rotation.includes("gaze"))
   assert.ok(!events.some(e=>e.type==="forge-proc"),"button 3 proc without Gaze");
 if(weaponForge==="Smite"&&!rotation.includes("armageddon"))
   assert.ok(!events.some(e=>e.type==="forge-proc"),"button 5 proc without Armageddon");
 scenarios++;
}
console.log("VHL timeline combinatorial regressions passed:",scenarios);
