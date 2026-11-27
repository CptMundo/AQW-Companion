"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const addon=require("../js/meta-class-builds.js");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const css=fs.readFileSync(path.join(__dirname,"../css/meta-class-builds.css"),"utf8");
const mandatory=["Chrono ShadowHunter","Phantasm Chronomancer","Kathool Adept",
 "Hollowborn Vindicator","Necrotic Chronomancer","ArchFiend","Dark Lord","Great Thief","Guardian"];
assert.equal(addon.classes.length,12,"Nine distinct new classes + 3 identical-skill alternatives");
assert.deepEqual(Object.keys(addon.aliases).sort(),["Chrono ShadowSlayer","Nechronomancer","Phantom Chronomancer"].sort());
const weapons=new Set(["Valiance","Ravenous","Dauntless","Praxis","Arcana's Concerto","Elysium"]);
const helms=new Set(["Forge","Vim","Examen","Pneuma","Anima"]);
const capes=new Set(["Vainglory","Lament","Penitence","Avarice"]);
for(const name of mandatory){
 const meta=addon.get(name);
 assert.ok(meta,"Missing new class "+name);
 assert.ok(meta.builds.solo,"All new classes should have solo/boss reference "+name);
 assert.ok(/^https:\/\//.test(meta.guide)&&/^https:\/\//.test(meta.source),"Sources are required");
 assert.ok(meta.category&&addon.base[name]&&addon.alchemy[name]?.length===3);
 for(const [role,build] of Object.entries(meta.builds)){
  assert.ok(["solo","farm","group"].includes(role));
  assert.ok(weapons.has(build.weapon),name+" "+role+" unsupported weapon: "+build.weapon);
  assert.ok(helms.has(build.helm),name+" "+role+" unsupported helm: "+build.helm);
  assert.ok(capes.has(build.cape),name+" "+role+" unsupported cape: "+build.cape);
  assert.ok(build.note&&build.alternative,name+" "+role+" needs contextual caveats");
 }
}
for(const [alias,canonical] of Object.entries(addon.aliases)){
 assert.ok(addon.get(alias));
 assert.equal(addon.get(alias).canonical,canonical);
 assert.equal(addon.builds[alias],addon.builds[canonical],"Skill-equivalent names use same role sets");
}
for(const name of ["Phantasm Chronomancer","Great Thief","Guardian","Hollowborn Vindicator"])
 assert.equal(addon.builds[name].farm,undefined,"Do not fabricate AoE farming setups for "+name);
assert.ok(addon.builds["Chrono ShadowHunter"].farm.note.includes("NOT a true AoE farmer"));
assert.ok(html.includes('src="js/meta-class-builds.js"'),"Meta data module loaded");
assert.ok(html.includes('href="css/meta-class-builds.css"'),"Meta styling linked");
assert.ok(html.indexOf('src="js/meta-class-builds.js"')<html.indexOf('<script>'),"Meta data loads before main app");
assert.ok(html.includes("Object.assign(starterBuilds,window.AQWCMetaBuilds?.builds||{})"));
const initialStart=html.indexOf("const starterBuilds={");
const initialEnd=html.indexOf("\n};\nObject.assign(starterBuilds",initialStart);
assert.ok(initialStart>=0&&initialEnd>initialStart,"Original 15-class catalog remains available");
const originalClassKeys=[...html.slice(initialStart,initialEnd).matchAll(/^ "([^"]+)": \{/gm)].map(m=>m[1]);
assert.equal(originalClassKeys.length,15,"Do not delete or overwrite any preexisting build class");
assert.equal(new Set([...originalClassKeys,...addon.classes]).size,27,"Dropdown should expose 27 unique names");

assert.ok(html.includes("Object.assign(baseClassEnhancement,window.AQWCMetaBuilds?.base||{})"));
assert.ok(html.includes("Object.assign(classAlchemy,window.AQWCMetaBuilds?.alchemy||{})"));
assert.ok(html.includes('id="build-search"'),"Class search must be available");
assert.ok(html.includes("function supportedClassActivities(name)"),"Class-specific roles required");
assert.ok(html.includes("classNoFarming"),"Boss-only classes cannot show fake farming builds");
assert.ok(!html.includes('<option value="group">Group / Ultras</option>'),"Class planner only offers Solo and Farming");
assert.ok(html.includes("No recommended "),"Unsupported roles show truthful explanation");
assert.ok(html.includes("Same skills as "),"Alias explanations available");
assert.ok(html.includes("Build reference"),"Source links shown in UI");
assert.ok(html.includes("Community example — current patch / activity review pending"),"Do not present unverified legacy notes as fact");assert.ok(html.includes("May 2026 benchmark"),"Show the source and date of the corrected VHL example");
assert.ok(html.includes("if(build.alternative)"),"Show viable alternatives");
assert.ok(css.includes(".build-meta-sources"));
for(const [i,script] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()){
 if(!script[1].includes("src=")&&script[2].trim())
  new vm.Script(script[2],{filename:"index-inline-"+i});
}
console.log("Meta Class Builds verified: Chrono ShadowHunter, 9 classes, 3 aliases, honest roles and linked sources.");

// Source-backed general class defaults (not universal encounter BiS).
for(const name of ['Kathool Adept','Hollowborn Vindicator','Phantasm Chronomancer','Phantom Chronomancer','Dark Lord'])assert.equal(addon.base[name],'Wizard',name);
assert.equal(addon.builds['Kathool Adept'].farm.cape,'Lament');
assert.ok(html.includes("'Arcana Invoker':'Wizard'"));
assert.ok(html.includes(`"King's Echo":'Wizard'`));
assert.ok(html.includes('No verified class/activity combination is available yet.'));
assert.ok(html.includes('Source-documented team · community example, gameplay validation pending.'));

assert.equal(addon.builds['Dark Lord'].farm.weapon,'Elysium');
assert.equal(addon.builds['Dark Lord'].farm.cape,'Avarice');
assert.ok(html.includes("starterBuilds[cls]?.[role]?.base||baseClassEnhancement[cls]"),'Per-activity base overrides class default');
assert.ok(html.includes('Simplified Classes Guide, Farming column: Lucky / Valiance / Forge / Vainglory'));
assert.ok(html.includes('Simplified low-HP farming example'));

{
 const a=html.indexOf("const starterBuilds="),b=html.indexOf("// Encounter-specific recommendations",a);
 const p=html.indexOf("const alchemyEffects="),q=html.indexOf("const enhancementMiniDescriptions",p);
 const api=vm.runInNewContext(html.slice(a,b)+html.slice(p,q)+"\n({starterBuilds,documentedClassRows,suggestedConsumables})",{window:{AQWCMetaBuilds:addon}});
 assert.equal(Object.values(api.documentedClassRows).reduce((n,r)=>n+Object.keys(r).length,0),22);
 for(const [cls,modes] of Object.entries(api.documentedClassRows))for(const [role,row] of Object.entries(modes)){
  const build=api.starterBuilds[cls][role];
  assert.deepEqual(Array.from([build.base,build.weapon,build.helm,build.cape]),Array.from(row.slice(0,4)),cls+" "+role);
  assert.equal(build.evidence,row[4]);
 }
 assert.equal(api.starterBuilds.Shaman.solo.base,"Lucky");
 assert.equal(api.starterBuilds["Phantom Chronomancer"].solo.base,"Lucky");
 assert.equal(api.starterBuilds["Hollowborn Vindicator"].solo.cape,"Penitence");
 assert.equal(api.starterBuilds["Yami no Ronin"].solo.weapon,"Valiance");
 assert.equal(api.starterBuilds["ArchPaladin"].solo.evidence,undefined);
 assert.equal(api.suggestedConsumables("Void Highlord","farm")[1].name,"Battle Elixir");
 assert.equal(api.suggestedConsumables("Chrono ShadowSlayer","solo").length,3);
 assert.equal(api.suggestedConsumables("Arcana Invoker","farm").length,0);
 api.starterBuilds["Void Highlord"].farm.cape="Vainglory";
 assert.equal(api.suggestedConsumables("Void Highlord","farm").length,0,"Do not recommend potions for a different loadout");
 assert.ok(html.includes("if(build&&!build.evidence)"));
}
