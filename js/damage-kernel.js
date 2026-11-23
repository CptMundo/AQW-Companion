/* AQW Companion: evidence-gated direct-hit components, NOT verified full game formula.
 * Official item boost rules: https://www.aq.com/lore/Guides/AQWBoosts
 * Official stat semantics: https://www.aq.com/lore/guides/stats
 * Damage function AP1/SP1/AP2/SP2 formulas: community research only.
 * Nothing in this module declares in-game DPS certified.
 */
(function(root){
"use strict";
const tags=Object.freeze(["all","dragonkin","undead","chaos","elemental","human","orc","drakath"]);
function number(value,label,min=0,max=1e9){
  if(typeof value!=="number"||!Number.isFinite(value)||value<min||value>max)
    throw new RangeError(label+" must be finite and between "+min+" and "+max);
  return value;
}
function tag(value){
  const v=String(value||"").trim().toLowerCase();
  if(v==="dragon")return "dragonkin";
  if(v==="none"||v==="other"||!v)return "none";
  if(!tags.includes(v))throw new RangeError("unknown monster tag: "+value);
  return v;
}
function bestBoosts(items=[]){
  if(!Array.isArray(items))throw new TypeError("gear boosts must be an array");
  const best=Object.create(null);
  for(const item of items){
    if(!item||typeof item!=="object")throw new TypeError("invalid boost entry");
    const category=tag(item.category);
    if(category==="none")throw new RangeError("boost requires valid category");
    const pct=number(item.percent,"boost percent",0,10000);
    best[category]=Math.max(best[category]||0,pct);
  }
  return best;
}
function gearMultiplier({items=[],monsterType="none",kind="direct"}={}){
  if(kind==="dot"||kind==="hot")return {multiplier:1,categories:[],note:"Item boosts do not apply to DoTs/HoTs."};
  if(kind!=="direct")throw new RangeError("unknown event kind");
  const monster=tag(monsterType),best=bestBoosts(items);
  const categories=["all",...(monster!=="none"&&monster!=="all"?[monster]:[])];
  const applied=categories.filter(c=>best[c]>0).map(c=>({category:c,percent:best[c]}));
  return {multiplier:applied.reduce((p,c)=>p*(1+c.percent/100),1),categories:applied};
}
function expectedDirectHit(opts){
  if(!opts||typeof opts!=="object")throw new TypeError("options required");
  if(opts.mappingVerified!==true)return {status:"unverified-function",expected:null,
    note:"Skill-to-base damage mapping not independently validated. Refusing to display a simulated hit."};
  const base=number(opts.baseComponent,"baseComponent");
  const hit=opts.neverMiss?1:number(opts.hitChancePct??100,"hitChancePct",0,100)/100;
  const crit=opts.alwaysCrit?1:number(opts.critChancePct??0,"critChancePct",0,100)/100;
  const critMulti=number(opts.critMultiplierPct??100,"critMultiplierPct",0,10000)/100;
  const out=1+number(opts.outgoingDamagePct??0,"outgoingDamagePct",0,10000)/100;
  const type=opts.damageType??"physical";
  if(type!=="physical"&&type!=="magical"&&type!=="hybrid")throw new RangeError("unsupported direct damage type");
  const typed=1+number(opts.typeBonusPct??0,"typeBonusPct",0,10000)/100;
  const incoming=1+number(opts.targetIncomingPct??0,"targetIncomingPct",0,10000)/100;
  const gear=gearMultiplier({items:opts.gearItems??[],monsterType:opts.monsterType??"none",kind:"direct"});
  const noCrit=base*out*typed*incoming*gear.multiplier;
  const expected=noCrit*hit*(1-crit+crit*critMulti);
  return {status:"unvalidated-model",expected,nonCritDamage:noCrit,critDamage:noCrit*critMulti,
    hitChance:hit,critChance:crit,gear,
    sourceConfidence:"partial: official boost semantics + uncalibrated hit sequencing",
    note:"Model component only. Not verified as live AQW damage or DPS; excludes proc, DoT, game rounding/caps and target defense."};
}
root.AQWDamageKernel=Object.freeze({version:"0.1.0-guarded",bestBoosts,gearMultiplier,expectedDirectHit});
})(typeof window!=="undefined"?window:globalThis);
