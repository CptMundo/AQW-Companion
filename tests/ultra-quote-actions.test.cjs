"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ultra=require("../js/ultra-quote-actions.js");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const stylesheet=fs.readFileSync(path.join(__dirname,"../css/ultra-quote-actions.css"),"utf8");
const roles={
 speaker:["Dragon of Time","Legion Revenant","ArchPaladin","Lord of Order"],
 dage:["Chaos Avenger","Legion DoomKnight","Legion Revenant","Lord of Order","ArchPaladin"],
 nulgath:["Void Highlord","Lord of Order","ArchPaladin","Legion Revenant"],
 drakath:["Void Highlord","StoneCrusher","Lord of Order","ArchPaladin"]
};
for(const [boss,classes] of Object.entries(roles)){
 for(const cls of classes){
  const cues=ultra.forRole(boss,cls);
  assert.ok(cues.length>=2,boss+" / "+cls+" should have contextual quote reactions");
  for(const cue of cues){
   assert.ok(cue.quote&&cue.response&&/^https:\/\//.test(cue.source));
   assert.ok(!/everyone taunt/i.test(cue.response),"No universal taunt instruction");
  }
 }
}
for(const cls of ["StoneCrusher","Lord of Order","Legion Revenant","Verus DoomKnight","ArchFiend","Arachnomancer","Legendary Hero"])
 assert.deepEqual(ultra.forRole("kathool",cls),[],"Kathool already explains Vigil in its role tips and timing warning");
assert.deepEqual(ultra.forRole("speaker","StoneCrusher"),[],"Do not invent unlisted class assignments");
assert.ok(ultra.forRole("kathool","Bard").some(x=>/Vigil/.test(x.response)));
assert.ok(ultra.forRole("kathool","Great Thief").some(x=>/Vigil/.test(x.response)));
assert.ok(ultra.forRole("speaker","Void Highlord").some(x=>/ZONE #1/.test(x.response)));
assert.ok(ultra.forRole("drakath","Dragon of Time").some(x=>/BEFORE|before/.test(x.response)));
assert.ok(ultra.forRole("nulgath","Dragon of Time").some(x=>/Blade/.test(x.response)));
assert.ok(ultra.forRole("dage","Legion DoomKnight").some(x=>/skill 5/.test(x.response)));
assert.ok(ultra.forRole("dage","Legion Revenant").some(x=>/skill 2/.test(x.response)));
assert.ok(ultra.forRole("dage","Lord of Order").every(x=>!x.response.includes("YOU APPLY DECAY")));
assert.ok(ultra.forRole("speaker","ArchPaladin").some(x=>/Seal/.test(x.response)));
assert.ok(ultra.forRole("speaker","Lord of Order").some(x=>/Scroll of Enrage/.test(x.response)));
assert.ok(ultra.forRole("drakath","Lord of Order").some(x=>/BEFORE/.test(x.response)));
assert.ok(html.includes("const personal=variant.roles[cls]"),"Render only the approved selected class actions");
assert.ok(html.includes("ultra-role-quote"));
assert.ok(html.includes('src="js/ultra-quote-actions.js"'));
assert.match(html,/href="css\/ultra-quote-actions\.css(?:\?v=\d+)?"/);
assert.ok(html.includes("function ultraStrategyVariants"),"Keep complete roster variants separate");
assert.ok(html.includes("fillStrategyClasses(select,allNames,selectedUltraClasses.get(b.id)"),"Class-first picker includes documented roster members");
assert.ok(html.includes("if(!variants.length)"),"Do not render unsupported Speaker rotations");
assert.ok(!html.includes("No complete class-specific rotation in the guide."));
assert.ok(stylesheet.includes(".ultra-role-quote"));
console.log("Ultra quote actions: verified role-dependent prompts across all declared classes.");

const vm=require('node:vm');
const gear=html.slice(html.indexOf('function ultraSuggestedGear('),html.indexOf('function ultraRecommendedTeam('));
const api=vm.runInNewContext(gear+'\nultraSuggestedGear',{sameUltraClass:(a,b)=>a.toLowerCase()===b.toLowerCase(),ultraWorkbookBuild:(p,c)=>p?.team?.find(x=>x.cls===c),simplifiedGuideSource:'https://example.com'});
assert.equal(api('drakath','Great Thief',{team:[]},{weapon:'Ravenous'}),null);
assert.equal(api('drakath','Arcana Invoker',{team:[]},{weapon:'Valiance'}),null);
assert.equal(api('drakath','Unknown',{team:[]},{weapon:'Valiance'}),null);
assert.equal(api('drakath','Lord of Order',{team:[{cls:'Lord of Order',weapon:'Awe Blast'}]}).estimated,true);
assert.equal(api('drakath','Lord of Order',{team:[{cls:'Lord of Order',weapon:'Awe Blast'}]}).helm,undefined);
assert.ok(html.includes('Magic damage +25% for 15 min.'));
assert.ok(html.includes('mana costs +25% for 35 sec.'));
assert.ok(!html.includes('Spell Power +25% for 15 min.'));
assert.ok(!html.includes('Mana Cost +15% for 35 sec.'));
assert.ok(html.includes('Your default assignment is damage, not taunting.'));
assert.ok(html.includes('loadout under review'));assert.ok(html.includes('May 2026 benchmark'));
assert.ok(html.includes('Community example — not independently validated'));
console.log('Information integrity guards passed.');

