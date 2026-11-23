/* AQW Companion: experimental / observational DPS calibration.
 * No simulated damage is produced here. All observed data must come from player
 * Battle Analyzer sessions; results are not certified without representative samples.
 */
(function(root){
"use strict";
const WINDOW=60;
function nonnegative(value,label){
 if(typeof value!=="number"||!Number.isFinite(value)||value<0)
   throw new RangeError(label+" must be a finite nonnegative number");
 return value;
}
function text(value,label){
 if(typeof value!=="string"||!value.trim()||value.length>120)
   throw new TypeError(label+" must be a nonempty string under 120 chars");
 return value.trim();
}
function validateSample(sample){
 if(!sample||typeof sample!=="object"||Array.isArray(sample))throw new TypeError("sample object required");
 if(sample.seconds!==WINDOW)throw new RangeError("sample must be exactly 60 seconds");
 const className=text(sample.className,"className"),build=text(sample.build,"build");
 const target=text(sample.target,"target");
 const party=text(sample.party??"solo","party");
 const damage=nonnegative(sample.damage,"damage");
 const predictedDamage=sample.predictedDamage==null?null:nonnegative(sample.predictedDamage,"predictedDamage");
 const targets=sample.targets??1;
 if(!Number.isInteger(targets)||targets<1||targets>20)throw new RangeError("targets must be 1–20");
 return {className,build,target,party,targets,seconds:WINDOW,damage,predictedDamage,dps:damage/WINDOW,
   notes:typeof sample.notes==="string"?sample.notes.slice(0,300):""};
}
function median(nums){const sorted=nums.slice().sort((a,b)=>a-b),m=Math.floor(sorted.length/2);return sorted.length%2?sorted[m]:(sorted[m-1]+sorted[m])/2;}
function summarize(samples){
 if(!Array.isArray(samples))throw new TypeError("samples must be an array");
 const valid=samples.map(validateSample);
 if(!valid.length)return {status:"empty",count:0,medianDps:null,meanDps:null,cvPct:null};
 const first=valid[0],key=v=>JSON.stringify([v.className,v.build,v.target,v.party,v.targets]);
 if(valid.some(v=>key(v)!==key(first)))return {status:"incomparable-samples",count:valid.length,medianDps:null,
   reason:"Class, build, target, party, and number of targets must match."};
 const dps=valid.map(v=>v.dps),mean=dps.reduce((a,b)=>a+b,0)/valid.length;
 const variance=dps.reduce((a,b)=>a+(b-mean)**2,0)/valid.length;
 const result={status:valid.length<5?"insufficient-trials":"observed-summary",
   count:valid.length,className:first.className,build:first.build,target:first.target,
   party:first.party,targets:first.targets,medianDps:median(dps),meanDps:mean,
   minDps:Math.min(...dps),maxDps:Math.max(...dps),
   cvPct:mean>0?100*Math.sqrt(variance)/mean:0,
   requiredTrials:Math.max(0,5-valid.length)};
 const paired=valid.filter(v=>v.predictedDamage!==null);
 if(paired.length===valid.length&&paired.length>=5){
   const errors=paired.map(v=>v.damage===0?(v.predictedDamage===0?0:Infinity):
     100*Math.abs(v.predictedDamage-v.damage)/v.damage);
   const worst=Math.max(...errors),mape=errors.reduce((a,b)=>a+b,0)/errors.length;
   result.prediction={mapePct:mape,medianApePct:median(errors),worstApePct:worst,
     releaseGate:median(errors)<=10&&worst<=20&&valid.length>=5?"candidate":"fail",
     warning:"Internal 10% median / 20% worst acceptance gate; this is not an official accuracy standard."};
 }
 return result;
}
function compare(a,b){
 const left=summarize(a),right=summarize(b);
 if(left.status!=="observed-summary"||right.status!=="observed-summary")
   return {status:"insufficient-or-incomparable",left,right};
 if(left.target!==right.target||left.party!==right.party||left.targets!==right.targets)
   return {status:"incomparable-conditions",left,right};
 return {status:"descriptive-only",left,right,
   medianDpsDifference:right.medianDps-left.medianDps,
   medianDpsDifferencePct:left.medianDps>0?100*(right.medianDps-left.medianDps)/left.medianDps:null,
   warning:"Descriptive comparison only. Trials are stochastic; do not infer statistical significance."};
}
root.AQWCalibration=Object.freeze({version:"0.1.0",validateSample,summarize,compare});
})(typeof window!=="undefined"?window:globalThis);
