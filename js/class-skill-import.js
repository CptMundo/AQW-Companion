/* AQW Companion — opt-in, LOCAL research parser for user-supplied class data.
 * This DOES NOT capture packets, connect to AQW, access accounts or execute scripts.
 * Research reference: https://github.com/Shell1010/aqw-utils
 * Fields: actions.active[].nam / .damage / .dsrc / .cd / .mp
 * No gameplay DPS value is computed here.
 */
(function(root){
"use strict";
const FN=new Set(["AP1","AP2","SP1","SP2","APSP1","APSP2"]);
function scalar(value,label){
  if(value==null)return null;
  if(!["string","number"].includes(typeof value))throw new TypeError(label+" is not a scalar");
  const out=String(value).trim();
  if(out.length>160)throw new RangeError(label+" exceeds 160 characters");
  return out||null;
}
function parse(input){
  if(!input||typeof input!=="object"||Array.isArray(input))throw new TypeError("raw class data must be an object");
  const active=input.actions?.active;
  if(!Array.isArray(active)||active.length!==5)
    throw new RangeError("expected actions.active array containing exactly five class skills");
  const skills=active.map((raw,index)=>{
    if(!raw||typeof raw!=="object"||Array.isArray(raw))throw new TypeError("invalid skill "+index);
    const name=scalar(raw.nam,"nam");
    const functionRaw=scalar(raw.dsrc,"dsrc");
    const damageRaw=scalar(raw.damage,"damage");
    const cooldownRaw=scalar(raw.cd,"cd");
    const manaRaw=scalar(raw.mp,"mp");
    if(!name)throw new TypeError("skill "+(index+1)+" has no name");
    const normalizedFunction=functionRaw?.toUpperCase()||null;
    return {button:index+1,name,damageRaw,functionRaw,cooldownRaw,manaRaw,
      recognizedFunction:FN.has(normalizedFunction)?normalizedFunction:null,
      provenance:"unverified-user-supplied",
      validation:"unverified: values/units require corroboration"};
  });
  return {status:"requires-independent-validation",schemaVersion:1,skills,
    warnings:["This is a local reader for supplied data; it does not independently verify source, current game patch, or units.",
      "Never treat damageRaw as a final hit or assume it is a percent; cooldownRaw units are unknown.",
      "A recognized dsrc string is evidence of a possible function ID, not a proven current implementation."]};
}
root.AQWClassSkillImport=Object.freeze({version:"0.1.0-local-only",parse});
})(typeof window!=="undefined"?window:globalThis);
