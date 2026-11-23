/* AQW Companion — research-grade skill formula primitives.
 * Sources:
 * https://www.aq.com/lore/guides/stats (official terminology)
 * https://www.aqwhub.com/other-guides/do-ts-explained/ (community model)
 * https://aqwwiki.wikidot.com/void-highlord-class (coefficients only)
 *
 * These primitives are community-derived, not guaranteed server implementation.
 * DO NOT guess a skill function from its coefficient or 'weapon damage' label.
 */
(function(root){
"use strict";
const BASE=85;
const mapping=Object.freeze({
  "Lord of Order":Object.freeze({
    "blessing":Object.freeze({name:"Blessing of Order",functionId:"SP1",coefficient:1.45,
      mappingSource:"https://docs.google.com/spreadsheets/d/1wU6JlyrK_jYn5mVAzrLI4pRA4UM8LgY715kKU2U1vbQ/edit?gid=101348511",
      sourceConfidence:"community-only",alwaysCritAtRank10:true})
  }),
  "Void Highlord":Object.freeze({
    "shackle":Object.freeze({name:"Shackle",coefficient:1.25,functionId:null}),
    "gaze":Object.freeze({name:"Highlord's Gaze",coefficient:1.30,functionId:null}),
    "unshackle":Object.freeze({name:"Unshackle",coefficient:0.85,functionId:null}),
    "armageddon":Object.freeze({name:"Armageddon",coefficient:4.2,functionId:null})
  })
});
function numeric(v,label){if(typeof v!=="number"||!Number.isFinite(v)||v<0)
throw new TypeError(label+" must be a finite nonnegative number");return v;}
function evaluateFunction(id,stats,weaponRangeFactor){
 const ap=numeric(stats.attackPower,"attackPower"),sp=numeric(stats.spellPower,"spellPower");
 const ap1=BASE+0.1*ap,sp1=BASE+0.1*sp;
 switch(id){
  case "AP1":return ap1;
  case "SP1":return sp1;
  case "AP2":return ap1*2*numeric(weaponRangeFactor,"weaponRangeFactor");
  case "SP2":return sp1*2*numeric(weaponRangeFactor,"weaponRangeFactor");
  default:throw new RangeError("Unsupported community function: "+id);
 }
}
function evaluateSkill({className,skillId,attackPower,spellPower,weaponRangeFactor=1}){
 const skill=mapping[className]?.[skillId];
 if(!skill)return {status:"unknown-skill",damage:null,reason:"Skill not in curated function map"};
 if(!skill.functionId)return {status:"missing-mapping",damage:null,skill:skill.name,
  reason:"AQWWiki coefficient does not specify AP1/AP2/SP1/SP2 server damage function"};
 if(skill.functionId!=="SP1"&&skill.functionId!=="AP1"&&skill.functionId!=="SP2"&&skill.functionId!=="AP2")
  return {status:"unsupported-function",damage:null,skill:skill.name};
 const component=evaluateFunction(skill.functionId,{attackPower,spellPower},weaponRangeFactor)*skill.coefficient;
 return {status:"community-base-component-only",damage:component,skill:skill.name,
   sourceConfidence:"community-only",
   missing:["crit and crit damage","boost categories","class passives","dynamic auras","enemy defenses","proc and DoT events","actual cast timing"],
   warning:"This is a pre-modifier community model component, not a hit or a DPS result."};
}
root.AQWCombatFunctions=Object.freeze({version:"0.1.0",mapping,evaluateFunction,evaluateSkill});
})(typeof window!=="undefined"?window:globalThis);
