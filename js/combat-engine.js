/* AQW Companion — timeline engine (research preview).
   This is a timing and measured-hit engine, NOT a reverse engineered server damage formula.
   No DPS is emitted unless every damaging event has a supplied measured value.
   Sources: https://aqwwiki.wikidot.com/void-highlord-class
            https://www.aq.com/lore/guides/stats
            https://www.aq.com/lore/guides/enhancementtraits
*/
(function(root) {
  "use strict";
  const EPS=1e-8;
  const VHL={
    id:"Void Highlord",
    source:"https://aqwwiki.wikidot.com/void-highlord-class",
    auto:{id:"contract",label:"Contract",cooldown:2.3,type:"physical",damageFormulaVerified:false},
    skills:{
      shackle:{id:"shackle",label:"Shackle",cooldown:4,coefficient:1.25,alwaysCrit:true,neverMiss:true,group:"soul",healthCostPercent:20,
        effects:[{id:"shackled",kind:"self",duration:15,value:50,stat:"damageResistance"},{id:"soulVoid",kind:"self",duration:12,value:30,stat:"haste"}]},
      gaze:{id:"gaze",label:"Highlord's Gaze",cooldown:5,coefficient:1.3},
      unshackle:{id:"unshackle",label:"Unshackle",cooldown:4,coefficient:0.85,alwaysCrit:true,neverMiss:true,group:"soul",healthCostPercent:20,
        effects:[{id:"unshackled",kind:"self",duration:15,value:50,stat:"outgoingDamage"},{id:"soulVoid",kind:"self",duration:12,value:30,stat:"haste"}]},
      armageddon:{id:"armageddon",label:"Armageddon",cooldown:15,coefficient:4.2,
        effects:[{id:"arbitersWrath",kind:"self",duration:12,value:75,stat:"critDamage"},
                 {id:"kneel",kind:"self",duration:12,value:50,stat:"outgoingDamage"},
                 {id:"undyingHighlord",kind:"target",duration:20,value:5,stat:"incomingDamage",maxStacks:10}]}
    },
    notes:["Shackle and Unshackle share a replacement slot; cooldown behavior after swapping is not independently verified.","Auras occur after the triggering skill hit in this engine; exact server processing order requires observation.","Autoattack phase and cast/global-action lock require calibration in AQW.","20% maximum HP costs are documented, but HP/sustain are not simulated here."]
  };
  function finitePositive(value,label,allowZero=false) {
    if (typeof value!=="number" || !Number.isFinite(value) || (allowZero?value<0:value<=0))
      throw new TypeError(label+" must be a finite "+(allowZero?"nonnegative":"positive")+" number");
    return value;
  }
  function normalizeSkillIds(rotation,skills) {
    if(!Array.isArray(rotation)||!rotation.length) throw new TypeError("rotation must be a nonempty array");
    rotation.forEach(id=>{if(typeof id!=="string"||!skills[id])throw new Error("Unknown skill in rotation: "+id);});
    return rotation.slice();
  }
  function hasActive(effects,id,time) {return effects.some(e=>e.id===id&&e.expires>time+EPS);}
  function pushEffects(effects,skill,time) {
    for(const e of skill.effects||[]) {
      const previous=effects.find(x=>x.id===e.id&&x.kind===e.kind);
      if(previous) {previous.expires=time+e.duration;previous.stacks=Math.min(e.maxStacks||1,previous.stacks+1);}
      else effects.push({...e,expires:time+e.duration,stacks:1});
    }
  }
  function getDamage(input,id,time,kind) {
    const source=input.measuredHits||{};
    const key=kind==="auto"?"auto":id;
    const amount=source[key];
    if(amount==null) return null;
    // These are empirical OBSERVED full hits, not skill base formulas.
    // Do not multiply by gear/buffs again: they would be double counted.
    if(typeof amount!=="number"||!Number.isFinite(amount)||amount<0)
      throw new TypeError("measuredHits."+key+" must be a finite nonnegative observed hit");
    return amount;
  }
  function simulate(input) {
    if(!input||typeof input!=="object")throw new TypeError("input required");
    const seconds=input.seconds;
    if(seconds!==15&&seconds!==20)throw new RangeError("only 15 or 20 second windows are supported in this prototype");
    const model=input.model||VHL;
    const rotation=normalizeSkillIds(input.rotation||["unshackle","gaze","armageddon"],model.skills);
    const gap=finitePositive(input.actionGapSeconds??0.5,"actionGapSeconds");
    const haste=finitePositive(input.hastePercent??0,"hastePercent",true);
    if(haste>=100)throw new RangeError("hastePercent must be below 100");
    const cooldownFactor=1-haste/100;
    const events=[],active=[],ready={},groupReady={};
    const autoEnabled=input.includeAuto===true;
    const autoStart=input.autoStartSeconds??0;
    if(autoEnabled)finitePositive(autoStart,"autoStartSeconds",true);
    let nextAuto=autoEnabled?autoStart:Infinity;
    let now=0,cursor=0,attempts=0;
    while(now<seconds-EPS) {
      if(++attempts>100000)throw new Error("simulation iteration limit reached");
      active.splice(0,active.length,...active.filter(e=>e.expires>now+EPS));
      const skills=rotation.filter(id=>{
        const s=model.skills[id];
        return (ready[id]??0)<=now+EPS && (!s.group || (groupReady[s.group]??0)<=now+EPS);
      });
      let selected=null;
      if(skills.length) {
        for(let offset=0;offset<rotation.length;offset++){
          const candidate=rotation[(cursor+offset)%rotation.length];
          if(skills.includes(candidate)){selected=candidate;cursor=(cursor+offset+1)%rotation.length;break;}
        }
      }
      if(autoEnabled && nextAuto<=now+EPS) {
        const buffs=active.map(e=>({id:e.id,stacks:e.stacks,expires:e.expires}));
        events.push({time:+now.toFixed(5),kind:"auto",id:model.auto.id,buffsBefore:buffs,damage:getDamage(input,model.auto.id,now,"auto")});
        nextAuto=now+model.auto.cooldown*cooldownFactor;
        // Assumes autos independent of button action, a placeholder to validate in-game.
      }
      if(selected){
        const s=model.skills[selected], buffs=active.map(e=>({id:e.id,stacks:e.stacks,expires:e.expires}));
        events.push({time:+now.toFixed(5),kind:"skill",id:selected,label:s.label,coefficient:s.coefficient,
          buffsBefore:buffs,damage:getDamage(input,selected,now,"skill"),alwaysCrit:s.alwaysCrit===true});
        ready[selected]=now+s.cooldown*cooldownFactor;
        if(s.group)groupReady[s.group]=ready[selected];
        pushEffects(active,s,now);
        now+=gap;
      } else {
        const next=[...Object.values(ready),...Object.values(groupReady),nextAuto]
          .filter(t=>Number.isFinite(t)&&t>now+EPS);
        if(!next.length)break;
        // Prevent zero-length loop; advance to next relevant time.
        now=Math.min(seconds,...next);
      }
      if(autoEnabled && nextAuto<now-EPS && nextAuto<seconds-EPS)now=nextAuto;
    }
    const missing=events.filter(e=>e.damage===null);
    const measuredTotal=events.reduce((sum,e)=>sum+(e.damage??0),0);
    return {model:model.id,seconds,rotation,hastePercent:haste,actionGapSeconds:gap,
      events,counts:Object.fromEntries([...new Set(events.map(e=>e.id))].map(id=>[id,events.filter(e=>e.id===id).length])),
      resultStatus:missing.length?"incomplete":"measured-input-only",
      fullDamage:missing.length?null:measuredTotal,
      dps:missing.length?null:measuredTotal/seconds,
      knownHitSubtotal:measuredTotal,missingHitCount:missing.length,
      limitations:[...model.notes,"Measured hits are assumed constant despite changing buffs and target debuffs; this is NOT calibrated true fight DPS.","Proc/DoT/HoT, evasion, skill animation/cast locks, mana and target defenses are not yet modeled."]};
  }
  root.AQWCombatEngine=Object.freeze({version:"0.1.0-research",VHL,simulate});
})(typeof window!=="undefined"?window:globalThis);
