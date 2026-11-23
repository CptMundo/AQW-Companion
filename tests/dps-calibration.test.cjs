"use strict";
const assert=require("node:assert/strict");
require("../js/dps-calibration.js");
const C=globalThis.AQWCalibration;
const sample=(damage,build="A",predictedDamage=null,target="Boss X")=>({
 seconds:60,className:"Void Highlord",build,party:"solo",target,targets:1,damage,predictedDamage
});
assert.equal(C.summarize([]).status,"empty");
assert.equal(C.summarize([sample(100)]).status,"insufficient-trials");
const five=[100,110,90,100,100].map(d=>sample(d));
const result=C.summarize(five);
assert.equal(result.status,"observed-summary");
assert.equal(result.count,5);
assert.equal(result.medianDps,100/60);
assert.ok(result.cvPct>0);
const wrong=C.summarize([sample(100,"A"),sample(100,"B")]);
assert.equal(wrong.status,"incomparable-samples");
const paired=[100,101,99,100,102].map(d=>sample(d,"A",101));
assert.equal(C.summarize(paired).prediction.releaseGate,"candidate");
const failed=[100,100,100,100,100].map(d=>sample(d,"A",250));
assert.equal(C.summarize(failed).prediction.releaseGate,"fail");
const b=[110,120,130,120,125].map(d=>sample(d,"B"));
assert.equal(C.compare(five,b).status,"descriptive-only");
assert.equal(C.compare(five,b.map(x=>({...x,target:"Different Boss"}))).status,"incomparable-conditions");
assert.throws(()=>C.validateSample({...sample(100),seconds:59}),/exactly 60/);
assert.throws(()=>C.validateSample(sample(-1)),/nonnegative/);
assert.throws(()=>C.validateSample({...sample(100),targets:1.5}),/1–20/);
console.log("DPS calibration tests passed");
