/* AQW Companion / source-audited VHL action scheduler.
 * A timeline is NOT a certified damage or DPS prediction.
 * Data: https://aqwwiki.wikidot.com/void-highlord-class
 * Haste cap: https://www.aq.com/gamedesignnotes/aqw-aug6-classskillschanges-8459
 * Server action lock, cooldown-retiming and autoattack phase remain unverified.
 */
(function(root){
"use strict";
const EPS=1e-7, WINDOW=60, MAX_EVENTS=2000;
const effects={
  unshackle:[
    {id:"unshackled",duration:15,stat:"outgoingDamage",value:50},
    {id:"soulVoid",duration:12,stat:"haste",value:30}
  ],
  shackle:[
    {id:"shackled",duration:15,stat:"damageResistance",value:50},
    {id:"soulVoid",duration:12,stat:"haste",value:30}
  ],
  armageddon:[
    {id:"arbitersWrath",duration:12,stat:"critDamage",value:75},
    {id:"kneel",duration:12,stat:"outgoingDamage",value:50},
    {id:"undyingHighlord",duration:20,stat:"incomingDamage",value:5,target:true,maxStacks:10}
  ]
};
const model=Object.freeze({
  name:"Void Highlord",
  classModel:"Tank Melee",
  skills:Object.freeze({
    unshackle:{cooldown:4,slot:"soul",label:"Unshackle",hpCostPct:20,effects:effects.unshackle},
    shackle:{cooldown:4,slot:"soul",label:"Shackle",hpCostPct:20,effects:effects.shackle},
    gaze:{cooldown:5,slot:"gaze",label:"Highlord's Gaze",manaCost:20,effects:[]},
    armageddon:{cooldown:15,slot:"armageddon",label:"Armageddon",manaCost:50,effects:effects.armageddon}
  }),
  auto:Object.freeze({id:"contract",cooldown:2.3,label:"Contract"})
});
function validNumber(value,label,min,max){
  if(typeof value!=="number"||!Number.isFinite(value)||value<min||value>max)
    throw new RangeError(label+" must be a finite number between "+min+" and "+max);
  return value;
}
function activeAuras(auras,now){
  return [...auras.values()].filter(e=>e.until>now+EPS).map(e=>({...e})).sort((a,b)=>a.id.localeCompare(b.id));
}
function activeHaste(auras,now,base){
  const buffs=activeAuras(auras,now).filter(e=>e.stat==="haste");
  return Math.min(50,Math.max(0,base+buffs.reduce((sum,b)=>sum+b.value*b.stacks,0)));
}
function applyEffects(auras,skill,now){
  for(const e of skill.effects||[]) {
    const key=(e.target?"target:":"self:")+e.id;
    const before=auras.get(key);
    const stacks=e.maxStacks?Math.min(e.maxStacks,(before&&before.until>now+EPS?before.stacks:0)+1):1;
    auras.set(key,{id:e.id,stat:e.stat,value:e.value,stacks,until:now+e.duration,target:!!e.target});
  }
}
function plan(options={}){
  if(!options||typeof options!=="object"||Array.isArray(options))throw new TypeError("options object required");
  if(options.seconds!==undefined&&options.seconds!==WINDOW)throw new RangeError("fixed window is 60 seconds");
  const rotation=options.rotation??["unshackle","gaze","armageddon"];
  if(!Array.isArray(rotation)||rotation.length===0||rotation.length>16)
    throw new TypeError("rotation requires 1–16 skill names");
  for(const id of rotation)if(!Object.prototype.hasOwnProperty.call(model.skills,id))
    throw new RangeError("unknown VHL skill: "+String(id));
  const baseHaste=validNumber(options.baseHastePercent??0,"baseHastePercent",0,50);
  const gap=validNumber(options.actionGapSeconds??0.5,"actionGapSeconds",0.1,3);
  const includeAutos=options.includeAuto===true || options.weaponForge==="Valiance";
  const autoStart=validNumber(options.autoStartSeconds??0,"autoStartSeconds",0,WINDOW);
  const strategy=options.strategy??"cycle";
  if(!["cycle","priority"].includes(strategy))throw new RangeError("invalid rotation strategy");
  const dynamicHaste=options.dynamicHaste!==false;
  const weaponForge=options.weaponForge??"None";
  if(!["None","Dauntless","Valiance","Ravenous","Lacerate","Smite"].includes(weaponForge))
    throw new RangeError("unsupported weapon Forge");
  const forgeSpecs={
    Dauntless:{on:"second",cooldown:3,duration:12,effects:[
      {id:"dauntless",duration:12,stat:"haste",value:25},
      {id:"dauntlessCrit",duration:12,stat:"critChance",value:15},
      {id:"dauntlessMana",duration:12,stat:"manaCostReduction",value:50},
      {id:"decay",duration:6,stat:"cannotHeal",value:1}]},
    Valiance:{on:"auto",cooldown:15,duration:20,effects:[
      {id:"valiance",duration:20,stat:"coreStatsExceptLuck",value:30},
      {id:"valianceLuck",duration:20,stat:"luck",value:15}]},
    Ravenous:{on:"third",cooldown:0,duration:10,effects:[
      {id:"ravenous",duration:10,stat:"outgoingDamage",value:10},
      {id:"ravenousCrit",duration:10,stat:"critChance",value:25},
      {id:"consumed",duration:10,stat:"targetOutgoingDamageReduction",value:10,target:true}]},
    Lacerate:{on:"second",cooldown:2,effects:[{id:"laceration",duration:15,stat:"targetDodgeHitHasteReduction",value:10,target:true}]},
    Smite:{on:"fifth",cooldown:15,effects:[]}
  };
  const forge=forgeSpecs[weaponForge];
  const forgeReady={time:0};
  let now=0,nextAction=0,nextAuto=includeAutos?autoStart:Infinity,turn=0,cursor=0;
  const ready=new Map(),auras=new Map(),events=[],totals=Object.create(null);
  let spentMaxHpPct=0,spentManaNominal=0;
  function forgeTrigger(trigger,time){
    if(!forge||forge.on!==trigger||forgeReady.time>time+EPS)return;
    const snapshot=view(time);
    // Separate unknown proc hit; never add a fictitious number to DPS.
    events.push({time:+time.toFixed(5),type:"forge-proc",id:weaponForge.toLowerCase(),
      label:weaponForge+" proc",hastePercent:snapshot.haste,auras:snapshot.active,
      damage:null,damageStatus:"unverified server damage function"});
    totals["forge:"+weaponForge]=(totals["forge:"+weaponForge]||0)+1;
    forgeReady.time=time+forge.cooldown;
    applyEffects(auras,{effects:forge.effects},time);
  }
  function view(now) {
    const active=activeAuras(auras,now);
    return {active,haste:dynamicHaste?activeHaste(auras,now,baseHaste):baseHaste};
  }
  while(Math.min(nextAction,nextAuto)<WINDOW-EPS){
    if(++turn>MAX_EVENTS)throw new Error("event limit reached; inspect rotation");
    now=Math.min(nextAction,nextAuto);
    // Discard expired auras. Do not apply those beyond their expiry moment.
    for(const [key,e] of auras)if(e.until<=now+EPS)auras.delete(key);
    // At a simultaneous timestamp, process auto first, then skill.
    if(nextAuto<=nextAction+EPS&&nextAuto<WINDOW-EPS){
      const snapshot=view(nextAuto);
      const posture=snapshot.active.some(a=>a.id==="unshackled")?"unshackled":
        snapshot.active.some(a=>a.id==="shackled")?"shackled":"neutral";
      events.push({time:+nextAuto.toFixed(5),type:"auto",id:"contract",label:"Contract",
        hastePercent:snapshot.haste,auras:snapshot.active,posture,
        conditionalEffect:posture==="unshackled"?"Soul Breach DoT (5s; up to 5 stacks; tick formula unknown)":
          posture==="shackled"?"Soul Fend HoT (5s; up to 5 stacks; heal formula unknown)":null});
      totals.contract=(totals.contract||0)+1;
      forgeTrigger("auto",nextAuto);
      nextAuto+=model.auto.cooldown*(1-snapshot.haste/100);
    }
    if(nextAction<=now+EPS&&nextAction<WINDOW-EPS){
      let chosen=null;
      const order=strategy==="cycle"
        ?rotation.slice(cursor).concat(rotation.slice(0,cursor))
        :rotation;
      for(const id of order){
        const skill=model.skills[id];
        if((ready.get(skill.slot)||0)<=now+EPS){chosen=id;break;}
      }
      if(chosen){
        const skill=model.skills[chosen],before=view(now);
        const idx=rotation.indexOf(chosen);
        if(strategy==="cycle")cursor=(idx+1)%rotation.length;
        events.push({time:+now.toFixed(5),type:"skill",id:chosen,label:skill.label,
          hastePercent:before.haste,auras:before.active,hpCostPct:skill.hpCostPct||0,
          manaCost:skill.manaCost||0,insolentFoolsProcChancePct:20});
        spentMaxHpPct+=skill.hpCostPct||0;
        spentManaNominal+=skill.manaCost||0;
        totals[chosen]=(totals[chosen]||0)+1;
        ready.set(skill.slot,now+skill.cooldown*(1-before.haste/100));
        applyEffects(auras,skill,now);
        const button=chosen==="shackle"||chosen==="unshackle"?"second":
          chosen==="gaze"?"third":"fifth";
        forgeTrigger(button,now);
        nextAction=now+gap;
      }else{
        const times=rotation.map(id=>ready.get(model.skills[id].slot)??Infinity).filter(t=>t>now+EPS);
        nextAction=times.length?Math.min(...times):WINDOW;
      }
    }
  }
  return {status:"timeline-only",className:model.name,seconds:WINDOW,rotation:[...rotation],
    baseHastePercent:baseHaste,dynamicHaste,weaponForge,strategy,events,counts:{...totals},
    nominalResourceCosts:{spentMaxHpPct,spentMana:spentManaNominal,modeledSurvival:false},
    damage:null,dps:null,
    caveats:["Cooldown is snapshotted when a skill is cast; retroactive haste changes are not modelled.",
      "Autoattacks are treated as independently timed; game animation/cast locks may delay them.",
      "HP costs, mana use, heal effects, passive procs and actual damage are not simulated.",
      "Forge proc triggers and buffs use published descriptions; proc hit damage and health-dependent multipliers remain unavailable.",
      "Rotation choices and cast gap are model assumptions, not verified optimal play.",
      "Nominal HP costs can exceed 100% maximum health; heals/lifesteal and survival are not implemented.",
      "Contract may apply Soul Breach DoT or Soul Fend HoT; ticks/stack damage are not calculated."]};
}
root.AQWCombatTimeline=Object.freeze({version:"0.1.0-preview",WINDOW,model,plan});
})(typeof window!=="undefined"?window:globalThis);
