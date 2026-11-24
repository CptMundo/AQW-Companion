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
assert.ok(html.includes("AQWUltraQuoteActions?.forRole(b.id,playKey||cls)"),"Use the selected class or its existing playbook alias for quote reactions");
assert.ok(html.includes("ultra-role-quote"));
assert.ok(html.includes('src="js/ultra-quote-actions.js"'));
assert.ok(html.includes('href="css/ultra-quote-actions.css"'));
assert.ok(html.includes("b.alternate||[]"),"Alternate classes must be selectable");
assert.ok(html.includes("fillUltraClassSelect(select,b.id,profile,[...b.team,...(b.alternate||[])])"),"Include existing alternatives and workbook classes");
assert.ok(html.includes("No complete class-specific rotation in the guide."),"Unreviewed alternatives must not receive invented role assignments");
assert.ok(stylesheet.includes(".ultra-role-quote"));
console.log("Ultra quote actions: verified role-dependent prompts across all declared classes.");
