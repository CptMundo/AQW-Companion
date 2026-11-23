/* AQW Companion — quote → action overlays for the selected class.
 * These are role-conditional. A quote is NOT a universal instruction to taunt.
 * Source-reviewed 2026-11-23; strategies may change or use alternate rotations.
 */
(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.AQWUltraQuoteActions=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const S={
    speaker:"https://aqw.app/monsters/ultraspeaker",
    dage:"https://aqw.app/monsters/ultradage",
    nulgath:"https://aqw.app/monsters/ultranulgath",
    kathool:"https://aqw.app/monsters/kathooldepths",
    drakath:"https://sites.google.com/view/aqwg-net/ultra-bosses"
  };
  const Q={
    zoneDage:"Cower behind your meager protection spells!",
    magesDage:"I possess the full power of the Legion at my disposal.",
    abyssNulgath:"Behold the power of the Abyss!",
    bladeNulgath:"I will shatter you to the core!",
    truthSpeaker:"I will make you see the truth.",
    listenSpeaker:"You shall listen.",
    zoneSpeaker:"All stand equal beneath the eyes of the Eternal.",
    nukeDrakath:"Drakath gains power, and unleashes a destructive attack!",
    meteorDrakath:"I WILL NOT LOSE EVERYTHING! NOT AGAIN!"
  };
  const make=(quote,response,source)=>({quote,response,source});
  const zoneDage=()=>make(Q.zoneDage,"ALL CLASSES: move onto whichever blue floor platform is glowing, within 3 seconds. Do not guess left or right.",S.dage);
  const magesAssigned=()=>make(Q.magesDage,"IF YOU ARE THE ASSIGNED DECAY USER: apply Decay at the start of the Legion Mages regeneration window, before Dage heals.",S.dage);
  const magesSupport=()=>make(Q.magesDage,"Make sure the assigned LDK/LR/Scroll of Decay player applies Decay; prepare mitigation for the following burst. Do not cast ordinary heals while your own Noxious Decay is active.",S.dage);
  const nulgathSecond=()=>make(Q.abyssNulgath,"ONLY IF ASSIGNED SECOND TAUNTER in the 6-second-offset tactic: use Scroll of Enrage on this callout. Do not overlap your teammate's taunt; other tactics may use different timing.",S.nulgath);
  const nulgathBlade=()=>make(Q.bladeNulgath,"Overfiend Blade's lethal 5-second charge has started. If your team's strategy calls for a Blade kill, switch and finish it before the cast; otherwise follow the pre-agreed call. Taunting cannot stop this attack.",S.nulgath);
  const speakerZone=(position)=>make(Q.zoneSpeaker,"ZONE #"+position+" in the standard DPS → LR → AP → LoO rotation: enter the glowing zone ONLY on your own turn. Stay out on others' turns; never enter with Magia Burn, Stasis or Sanctity.",S.speaker);
  const speakerTruth=(role)=>make(Q.truthSpeaker,role,S.speaker);
  const speakerListen=(role)=>make(Q.listenSpeaker,role,S.speaker);
  const meteor=()=>make(Q.meteorDrakath,"EVERYONE: this is the 2M HP final Meteor DPS check. Burst to finish promptly; Scroll of Enrage does not stop the meteor.",S.drakath);
  const roles={
    kathool:{
      "Great Thief":[make("You cannot resist.","EVERYONE, including Great Thief: use Vigil immediately before the 3-second Nightmare cast finishes. Damage evasion cannot replace Vigil.",S.kathool)],
      "Bard":[make("You cannot resist.","EVERYONE, including Bard: use Vigil immediately on this quote within 3 seconds, then continue mana/healing support.",S.kathool)]
    },
    dage:{
      "Chaos Avenger":[zoneDage(),magesSupport()],
      "Legion DoomKnight":[zoneDage(),make(Q.magesDage,"YOU APPLY DECAY: use Legion DoomKnight skill 5 as Dage starts the regeneration cast; maintain Decay while it heals. Coordinate a substitute if you cannot cover it.",S.dage)],
      "Legion Revenant":[zoneDage(),make(Q.magesDage,"ONLY IF ASSIGNED THE ALTERNATE DECAY ROLE: use Legion Revenant skill 2 for Decay while Dage channels his regeneration; otherwise maintain DPS/support.",S.dage)],
      "Lord of Order":[zoneDage(),magesSupport()],
      "ArchPaladin":[zoneDage(),magesSupport()]
    },
    nulgath:{
      "Dragon of Time":[nulgathBlade()],
      "Void Highlord":[nulgathSecond(),nulgathBlade()],
      "Lord of Order":[nulgathSecond(),nulgathBlade()],
      "ArchPaladin":[nulgathSecond(),nulgathBlade()],
      "Legion Revenant":[nulgathSecond(),nulgathBlade()]
    },
    speaker:{
      "Void Highlord":[speakerZone(1),speakerTruth("DPS in the standard variant: do not taunt Truth unless your team explicitly assigns a different taunt role."),speakerListen("DPS: leave Listen for your team's nominated LR/LoO taunter and stay clear of Stasis.")],
      "Dragon of Time":[speakerZone(1),speakerTruth("DPS: focus damage; do not taunt Truth unless your team has specifically assigned you an alternate taunt role."),speakerListen("DPS: let the assigned taunter handle Listen; avoid entering a Zone with Stasis.")],
      "Legion Revenant":[speakerZone(2),speakerTruth("In the standard 3-taunter tactic, taunt opening Truth if assigned; other Truth assignments vary by agreed variant. Keep LR skill 2 ready when Zone appears."),speakerListen("In the standard variant, taunt the Listen after your own Zone and the second Listen after LoO's Zone if assigned; otherwise let LoO cover it.")],
      "ArchPaladin":[speakerZone(3),speakerTruth("Taunt the alternating Truths assigned to AP, starting after the FIRST Zone; use Seal (skill 5) in the preceding Zone so it is ready."),speakerListen("AP does not automatically taunt every Listen. Allow the nominated LoO/LR player to intercept and time heals around the stun.")],
      "Lord of Order":[speakerZone(4),speakerTruth("In the standard variant, handle the later assigned Truth after LR's Zone; use Quixotic (skill 5) first when planned, then run out when Listen is called."),speakerListen("You handle most assigned Listen casts: use Scroll of Enrage at your allocated cue and click/move outside the Zone as instructed by your team's variant.")]
    },
    drakath:{
      "Dragon of Time":[make(Q.nukeDrakath,"DPS: stop before the next tauntable HP threshold until the designated taunter has already applied Enrage.",S.drakath),meteor()],
      "Lord of Order":[make(Q.nukeDrakath,"IF ASSIGNED TAUNTER: Enrage must already be active BEFORE DPS crosses the tauntable HP threshold; do not wait for the quote to start your scroll.",S.drakath),meteor()],
      "ArchPaladin":[make(Q.nukeDrakath,"IF AP IS THE ASSIGNED TAUNTER: pre-taunt before the HP threshold. Otherwise mitigate/heal and let the designated taunter handle the nuke.",S.drakath),meteor()],
      "Void Highlord":[make(Q.nukeDrakath,"DPS: hold burst BEFORE the next nuke HP threshold until your taunter confirms Enrage is ready. The quote is too late for a reactive scroll.",S.drakath),meteor()],
      "StoneCrusher":[make(Q.nukeDrakath,"Support: watch the next nuke threshold and stop pushing HP until the assigned taunter confirms their pre-taunt; maintain buffs.",S.drakath),meteor()]
    }
  };
  function forRole(boss,selectedClass){
    const raw=roles[String(boss||"")]?.[String(selectedClass||"")]||[];
    return raw.map(x=>({...x}));
  }
  return Object.freeze({forRole,sourceUrls:Object.freeze(S)});
});
