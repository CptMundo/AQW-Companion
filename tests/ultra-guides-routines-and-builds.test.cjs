"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const guide=require("../js/ultra-guide-rows.js");
const routines=require("../js/routine-library.js");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const ultraCSS=fs.readFileSync(path.join(__dirname,"../css/ultra-quote-actions.css"),"utf8");
const plannerCSS=fs.readFileSync(path.join(__dirname,"../css/planner-routines.css"),"utf8");
const basics=guide.rows({tips:["Equip Vigil and prepare the team.","On 'You cannot resist.' use Vigil.","Recover after the nightmare."],warning:"Taunt cannot prevent Endless Nightmare."});
assert.equal(basics.length,4);
assert.deepEqual(basics.map(x=>x.number),["01","02","03","04"]);
assert.ok(basics[1].title.includes("Vigil"));
assert.equal(basics[3].title,"Watch out · Avoid a wipe");
const quote=guide.rows({
 tips:["Before pull: prepare your assigned taunt."],
 quotes:[{quote:"You shall listen.",response:"If assigned LoO, taunt at the Listen cue."}],
 warning:"Do not improvise a taunt rotation."
});
assert.ok(quote.some(r=>r.quote==="You shall listen."&&r.text.includes("If assigned")));
assert.ok(!html.includes("const caution=node('div','⚠ '+warning"),"Warning cards no longer rendered");
assert.ok(!html.includes("vigil=node('div',undefined,'ultra-focus-timing')"),"No redundant Kathool quote callout card");
assert.ok(html.includes("const rows=ultraUnifiedTips(b.id,cls,baseTips)"),"New unified class-specific role rows");
assert.ok(html.includes("ultra-role-mini-title"));
assert.ok(html.includes("bardSupport={weapon:'Awe Blast',helm:'Forge',cape:'Absolution'"),"Bard has documented support equipment");
assert.ok(html.includes("https://www.aq.com/lore/classes/bard"));
assert.ok(ultraCSS.includes(".ultra-role-mini-title"));
assert.ok(html.includes('id="build-search"'));
assert.ok(html.includes("classNoFarming"));
assert.ok(html.includes("supportedClassActivities(name)"));
assert.ok(html.includes("option value=\"group\"")===false,"Class Builds role selector no longer lists Group");
assert.ok(html.includes('id="build-role"></select>'));
assert.ok(html.includes("role.append(new Option(value==='solo'?'Solo / Boss':'Farming',value))"));
assert.equal(routines.entries.length,19,"Daily Quest Board entries reviewed from AQWWiki");
assert.equal(new Set(routines.entries.map(x=>x.id)).size,19);
for(const task of routines.entries){
 assert.equal(task.freq,"daily");assert.equal(task.join,"/join yulgar");
 assert.equal(task.wiki,routines.boardSource);
}
assert.ok(html.includes('js/routine-library.js'));
assert.ok(html.includes("taskCatalog.push({...task})"));
assert.ok(html.includes("for(const boss of ultraGuides)"),"All curated daily/weekly Ultra guide entries are available to pin");
assert.ok(html.includes("planner-show-all"),"Extended catalog must remain usable");
assert.ok(html.includes("name:'Mine Crafting',group:'Metals',freq:'daily',join:'/join stalagbite'"));
assert.ok(html.includes("name:'Hard Core Metals',group:'Metals',freq:'daily',join:'/join stalagbite'"));
assert.ok(plannerCSS.includes("column-gap:14px"));
assert.ok(html.includes('href="css/planner-routines.css?v=116"'));
assert.ok(html.includes('src="js/ultra-guide-rows.js"'));
for(const [i,m] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries())
 if(!m[1].includes("src=")&&m[2].trim())new vm.Script(m[2],{filename:"index-inline-"+i});
console.log("Ultra guides, role-specific builds, routine library, class search and JS parsing checks passed.");

const periodCode=html.slice(html.indexOf("function aqwServerDay("),html.indexOf("function taskKey("));
const resetCode=html.slice(html.indexOf("function nextPlannerReset("),html.indexOf("function updatePlannerTimers("));
const clock=vm.runInNewContext(periodCode+resetCode+"\n({taskPeriod,nextPlannerReset})");
assert.equal(clock.taskPeriod("daily",new Date("2026-11-27T04:59:59Z")),"d:2026-11-26");
assert.equal(clock.taskPeriod("daily",new Date("2026-11-27T05:00:00Z")),"d:2026-11-27");
assert.equal(clock.taskPeriod("weekly",new Date("2026-11-27T05:00:59Z")),"w:2026-11-20");
assert.equal(clock.taskPeriod("weekly",new Date("2026-11-27T05:01:00Z")),"w:2026-11-27");
assert.equal(clock.nextPlannerReset("weekly",new Date("2026-11-27T05:00:59Z")).toISOString(),"2026-11-27T05:01:00.000Z");
assert.equal(clock.nextPlannerReset("weekly",new Date("2026-11-27T05:01:00Z")).toISOString(),"2026-12-04T05:01:00.000Z");
assert.equal(clock.nextPlannerReset("daily",new Date("2026-11-27T05:00:00Z")).toISOString(),"2026-11-28T05:00:00.000Z");

assert.ok(html.includes('id="plannerstatus"'));
assert.ok(html.includes('id="plannercategory"'));
assert.ok(html.includes('id="plannerpinfilter"'));
assert.ok(html.includes('Undo completion'));
assert.ok(html.includes('toggleTask(t,!done)'));
assert.ok(html.includes("status==='all'||taskDone(t)===(status==='completed')"),"Completed tasks remain filterable in the same quest grid");
assert.ok(html.includes("taskSearchText(x).includes(query)"));
assert.ok(html.includes("const plannerKey='aqw-companion-planner-v09'"));

assert.equal(routines.coverage.pages,1260);
assert.equal(routines.coverage.quests,10147);
assert.ok(routines.indexedEntries.length>=160);
assert.equal(routines.indexedEntries.length,routines.coverage.daily+routines.coverage.weekly);
assert.equal(new Set(routines.indexedEntries.map(x=>x.id)).size,routines.indexedEntries.length);
assert.ok(routines.sourcePages.length>=99);
for(const t of routines.indexedEntries){assert.ok(['daily','weekly'].includes(t.freq));assert.ok(t.wiki.startsWith('https://aqwwiki.wikidot.com/'));assert.ok(!t.join||/^\/join [a-z0-9-]+$/i.test(t.join));assert.ok(Array.isArray(t.rewards)&&Array.isArray(t.targets)&&Array.isArray(t.categories));}
for(const [name,freq] of [['Ultra Avatar Tyndarius','daily'],['Dage, Lord of the Undead Legion','weekly'],['Asterism\'s Toll','daily'],['2.0 No!','weekly'],['Champion of the Coliseum','weekly'],['Tenacity Challenge','daily'],['Fungi for a Fun Guy','daily']])assert.ok(routines.indexedEntries.some(t=>t.name===name&&t.freq===freq),name);
const dataCode=html.slice(html.indexOf("const taskCatalog=["),html.indexOf("// Curated acquisition instructions."));
const catalog=vm.runInNewContext(dataCode+"\n taskCatalog",{window:{AQWCRoutineLibrary:routines},ultraGuides:[]});
assert.ok(catalog.length>=160);
assert.equal(new Set(catalog.map(t=>t.id)).size,catalog.length);
assert.equal(catalog.find(t=>t.id==='tyndarius').freq,'daily');
assert.ok(catalog.find(t=>t.id==='ex107').rewards.some(r=>/Elder/i.test(r)));
assert.ok(catalog.find(t=>t.id==='ultra-dage').rewards.some(r=>/Insignia/i.test(r)));
assert.ok(html.includes('planner-source-details'));
console.log("Expanded quest library coverage:",catalog.length,"tasks;",routines.coverage.daily,"daily and",routines.coverage.weekly,"weekly source entries");

const reviewedCode=html.slice(html.indexOf("const ultraReviewedSources="),html.indexOf("function renderUltraDetail(b)"));
const reviewedApi=vm.runInNewContext(reviewedCode+"\n({ultraReviewedSources,ultraReviewedTactics,encounterUltraBuild})");
assert.equal(reviewedApi.encounterUltraBuild("dage","Lord of Order",{weapon:"Awe Blast",helm:"Forge",cape:"Absolution"}).weapon,"Health Vamp / Dauntless");
assert.equal(reviewedApi.encounterUltraBuild("gramiel","Legion Revenant",null).weapon,"Mana Vamp");
assert.equal(reviewedApi.encounterUltraBuild("gramiel","Shaman",null).consumable,"Scroll of Enrage");
assert.equal(reviewedApi.encounterUltraBuild("darkon","StoneCrusher",null).base,"Fighter");
assert.equal(reviewedApi.encounterUltraBuild("ezrajal","Void Highlord",null),null,"No invented encounter preset");
assert.ok(reviewedApi.ultraReviewedTactics.gramiel.some(row=>row[1].includes("70%, 40% and 10%")));
assert.ok(html.includes("const rows=ultraUnifiedTips(b.id,cls,baseTips)"),"Render curated fight phases in the role checklist");
assert.ok(!html.includes("Suggested general setup — not encounter-tested."));
assert.ok(html.includes("const ultraReviewedSources="),"Retain internal source provenance");
for(const rows of Object.values(reviewedApi.ultraReviewedSources))for(const [,url] of rows)assert.ok(url.startsWith("https://"));

const workbookApi=vm.runInNewContext(reviewedCode+"\n({simplifiedProfiles,simplifiedRatings,simplifiedRatingRoles,simplifiedRoleRatings,simplifiedSpeakerEvents,simplifiedSpeakerPatterns,simplifiedExtraEncounters})");
assert.equal(Object.keys(workbookApi.simplifiedProfiles).length,12,"Every current detailed encounter has a workbook strategy");
assert.equal(Object.keys(workbookApi.simplifiedRatings).length,23,"All group-boss rating blocks in visible guide sheets");
assert.equal(workbookApi.simplifiedExtraEncounters.length,29,"Additional group and solo guide cards");
assert.equal(workbookApi.simplifiedExtraEncounters.filter(x=>x.group==="Grim Gaol").length,11);
for(const e of workbookApi.simplifiedExtraEncounters){assert.ok(/^\/join [a-z0-9-]+$/.test(e.join));assert.ok(e.sheet&&e.tips.length&&e.wiki);}
assert.equal(workbookApi.simplifiedProfiles.kathool.team.length,7);
assert.equal(workbookApi.simplifiedProfiles.gramiel.team.find(x=>x.cls==="Shaman").cape,"Lament");
assert.equal(workbookApi.simplifiedProfiles.darkon.team.some(x=>x.cape==="Vainglory"),false);
assert.equal(workbookApi.simplifiedSpeakerPatterns.length,6);
for(const p of workbookApi.simplifiedSpeakerPatterns)assert.equal(p.roles.length,(p.events||workbookApi.simplifiedSpeakerEvents).length,p.name);
assert.equal(workbookApi.simplifiedSpeakerPatterns[0].roles[2],"DPS");
assert.equal(workbookApi.simplifiedSpeakerPatterns[0].roles[18],"LR");
assert.ok(workbookApi.simplifiedSpeakerPatterns[5].roles.includes("GW"));
assert.equal(workbookApi.simplifiedRoleRatings("speaker",0).length,7);
assert.equal(workbookApi.simplifiedRoleRatings("gramiel",3).find(x=>x.name==="Shaman").rating,5);
for(const key of Object.keys(workbookApi.simplifiedRatings))for(let i=0;i<5;i++){const rows=workbookApi.simplifiedRoleRatings(key,i);assert.equal(rows.length,workbookApi.simplifiedRatingRoles[i][1].length,key+" role "+i);assert.ok(rows.every(x=>x.rating>=0&&x.rating<=5))}
assert.ok(!html.includes("appendSimplifiedProfile(root,simplifiedProfiles[b.id]"),"No second workbook panel in main guide");
assert.ok(html.includes("renderSimplifiedExtras(root,term)"));
assert.ok(html.includes("Score belongs only in the selector"));

const compact=vm.runInNewContext(reviewedCode+"\n({ultraClassOptions,ultraSelectedRating,ultraWorkbookBuild,ultraCompactTips,ultraActionTips,ultraBeginnerActions,ultraBeginnerText,ultraGlossary,ultraTermPattern,ultraTermInfo,ultraSuggestedGear,ultraRecommendedTeam,ultraUnifiedTips,ultraSpeakerRole,ultraSpeakerPersonal,simplifiedSpeakerPatterns,simplifiedProfiles,simplifiedRatings,simplifiedExtraEncounters,sameUltraClass,fillUltraClassSelect,renderUltraSelectedRating,appendUltraGearCells})",{
 node(tag,text,cls){return {tag,text,cls,children:[],append(...x){this.children.push(...x)},replaceChildren(...x){this.children=x}}},
 Option:function(label,value){this.label=label;this.value=value},
 ultraOwned:cls=>['Lord of Order','Void Highlord'].includes(cls)
});
const profile=compact.simplifiedProfiles.drakath;
const groups=compact.ultraClassOptions("drakath",profile,["Void Highlord","Lord of Order","StoneCrusher"]);
const names=groups.flatMap(g=>g.names);
assert.ok(names.includes("Paladin Chronomancer"),"Workbook team class appears in Your loadout");
assert.ok(names.includes("Chrono ShadowHunter"),"Workbook DPS class appears in Your loadout");
assert.ok(names.includes("Void Highlord"),"Rated 3/5 must be included");
assert.equal(names.filter(x=>compact.sameUltraClass(x,"Void HighLord")).length,1,"Rated aliases must not duplicate");
assert.equal(compact.ultraSelectedRating("drakath","Void Highlord").rating,3);
assert.equal(compact.ultraSelectedRating("drakath","Lord of Order").role,"Healer");
assert.equal(compact.ultraSelectedRating("drakath","Bard"),null,"Missing rating is not zero");
assert.equal(compact.ultraSelectedRating("drago","Legion DoomKnight").rating,0,"Real zero stays zero");
assert.equal(compact.ultraSelectedRating("drakath","LightCaster").role,"Early DPS","Spacing alias resolves");
assert.equal(compact.ultraWorkbookBuild(profile,"Chrono ShadowHunter").weapon,"Arcana Concerto");
assert.equal(compact.ultraWorkbookBuild(profile,"Paladin Chronomancer").base,"Fighter");
assert.equal(compact.ultraWorkbookBuild(profile,"Void Highlord"),null,"No invented workbook loadout");
const tips=compact.ultraCompactTips("drakath","Lord of Order",["Keep assigned taunt ready."]);
assert.ok(tips.includes("Keep assigned taunt ready."));
assert.ok(tips.some(x=>x.includes("3,500")));
assert.ok(tips.some(x=>x.includes("both healers")));
assert.ok(!compact.ultraCompactTips("drakath","Void Highlord").some(x=>x.includes("both healers")));
assert.equal(compact.ultraCompactTips("ezrajal","Void Highlord",["Workbook survival target: at least 3,175 HP before pulling."]).length,1,"Identical tips are deduplicated");
assert.ok(compact.ultraCompactTips("nulgath","Legion Revenant").some(x=>x.includes("Only in the workbook")));
assert.ok(!compact.ultraCompactTips("nulgath","Guardian").some(x=>x.includes("alternate Nulgath taunts")));
for(const [key,p] of Object.entries(compact.simplifiedProfiles)){const groups=compact.ultraClassOptions(key,p);const classes=groups.flatMap(x=>x.names);assert.ok(classes.length,key);assert.ok(classes.every(n=>{const s=compact.ultraSelectedRating(key,n);return !s||[3,4,5].includes(s.rating)}),key);for(const group of groups){const scores=group.names.map(n=>compact.ultraSelectedRating(key,n)?.rating??-1);assert.ok(scores.every((s,i)=>i===0||scores[i-1]>=s),key+" sorted");}for(const cls of classes)assert.ok(compact.ultraActionTips(key,cls,[]).length>=2,key+" / "+cls+" has real mechanics");}
const select={children:[],append(x){this.children.push(x)}};
compact.fillUltraClassSelect(select,"drakath",profile,["Void Highlord"]);
assert.equal(select.value,"Lord of Order");
assert.ok(select.children.flatMap(g=>g.children).some(o=>o.value==="Chrono ShadowHunter"&&o.label.includes("/5")));
const rating={children:[],append(...x){this.children.push(...x)},replaceChildren(...x){this.children=x}};
compact.renderUltraSelectedRating(rating,"drakath","Lord of Order");
assert.ok(rating.children.some(x=>x.text.includes("Healer")));
compact.renderUltraSelectedRating(rating,"drakath","Bard");
assert.ok(rating.children.some(x=>x.text==="Not owned"));
assert.ok(!rating.children.some(x=>x.text.includes("Healer")),"Class change clears previous rating");
assert.ok(html.includes("fillUltraClassSelect(select,b.id,profile,"));
assert.ok(html.includes("const build=ultraSuggestedGear(b.id,cls,profile,generic,encounter)"));
assert.ok(html.includes("renderUltraSelectedRating(rating,b.id,cls)"));
assert.ok(html.includes("const rows=ultraUnifiedTips(b.id,cls,baseTips)"));
assert.ok(html.includes("if(b.id==='speaker')appendPersonalSpeakerRotation(sequence,cls)"));
assert.ok(!html.includes("Community workbook — suggested strategy"));
assert.ok(!html.includes("Class suitability by role (community ratings)"));
assert.ok(ultraCSS.includes(".ultra-selected-rating"));
console.log("Compact loadout selector: class options, per-boss ratings, source loadouts, targeted tips and rotation retention passed.");

assert.equal(groups[0].label,"✓ OWNED CLASSES");
assert.ok(groups[0].names.every(n=>n==="Lord of Order"||n==="Void Highlord"));
assert.ok(groups.slice(1).every(g=>g.owned===false));
assert.ok(select.children[0].children.every(o=>o.label.startsWith("✓ ")&&!o.label.includes("OWNED ·")));
compact.renderUltraSelectedRating(rating,"drakath","Lord of Order");
assert.ok(rating.children.every(x=>!/\/5/.test(x.text)),"Rating appears only in select");
assert.ok(compact.ultraActionTips("ezrajal","Verus DoomKnight",[]).some(x=>x.includes("Counter Attack")));
assert.ok(compact.ultraActionTips("kathool","Chrono ShadowHunter",[]).some(x=>x.includes("Vigil")));
assert.ok(compact.ultraActionTips("dage","Verus DoomKnight",[]).some(x=>x.includes("blue circle")));
assert.ok(compact.ultraActionTips("drakath","Verus DoomKnight",[]).some(x=>x.includes("18M")));
assert.ok(compact.ultraActionTips("gramiel","Chrono ShadowHunter",[]).some(x=>x.includes("70%")));
assert.ok(compact.ultraActionTips("speaker","Guardian",[]).some(x=>x.includes("Stasis")));
assert.ok(!html.includes("No complete class-specific rotation in the guide."));
assert.ok(ultraCSS.includes(".ultra-option-owned"));

const runtimeBosses=vm.runInNewContext(html.slice(html.indexOf("const ultraGuides=["),html.indexOf("const ultraRolePlaybooks="))+"\nultraGuides");
const full=vm.runInNewContext(dataCode+"\n({taskCatalog,routineIdAliases,routineIsRecurring,reconcileRoutineState})",{window:{AQWCRoutineLibrary:routines},ultraGuides:runtimeBosses});
const active=full.taskCatalog.filter(full.routineIsRecurring);
assert.equal(active.length,182);
assert.equal(active.filter(t=>t.freq==="daily").length,164);
assert.equal(active.filter(t=>t.freq==="weekly").length,18);
assert.equal(new Set(active.map(t=>t.id)).size,active.length);
for(const [id,name] of [["guide-ultra-darkon","Darkon, the Conductor"],["guide-ultra-drago","Drago, Tyrant of Astravia"],["guide-ultra-gramiel","Resuscitated Hope"]]){
 const task=active.find(t=>t.id===id);assert.equal(task.sourceName,name);assert.ok(task.rewards.some(r=>r.includes("Insignia")));assert.equal(active.filter(t=>t.name===name||t.sourceName===name).length,1);
}
assert.equal(active.filter(t=>t.join==="/join kathooldepths").length,2,"Two distinct actual daily quests for Kathool");
assert.ok(!active.some(t=>t.id==="guide-ultra-kathool"||t.id==="legion-ex"));
assert.ok(!active.some(t=>/one-time chain stage/i.test(t.note||"")));
assert.equal(active.filter(t=>/^Daily Exercise [1-6]:/.test(t.name)).length,6);
assert.equal(active.find(t=>t.id==="mining").acceptJoin,"/join yulgar");
assert.equal(active.find(t=>t.id==="mining").farmJoin,"/join stalagbite");
assert.equal(active.find(t=>t.id==="guide-ultra-ezrajal").acceptJoin,"/join timeinn");
const saved=full.reconcileRoutineState([{id:"wiki-la-s-quests-darkon-the-conductor",name:"Darkon",sourceProjects:["a"]},{id:"guide-ultra-darkon",name:"Ultra Darkon",sourceProjects:["b"]},{id:"legion-ex",name:"Legion Daily Exercises"}],{"w:2026-11-20|wiki-la-s-quests-darkon-the-conductor":true,"w:2026-11-20|guide-ultra-darkon":false,"d:2026-11-23|legion-ex":true});
assert.equal(saved.pins.length,2);assert.equal(saved.pins[0].id,"guide-ultra-darkon");assert.equal(saved.pins[0].sourceProjects.length,2);assert.equal(saved.checks["w:2026-11-20|guide-ultra-darkon"],true);assert.equal(saved.checks["d:2026-11-23|legion-ex"],true);assert.ok(saved.changed);
assert.equal(full.reconcileRoutineState(saved.pins,saved.checks).changed,false,"Migration idempotent");
const gramielPair=active.filter(t=>t.exclusiveGroup==="gramiel-hub-weekly");
assert.equal(gramielPair.length,2);
const progressCode=html.slice(html.indexOf("function taskKey(t)"),html.indexOf("function resetUltraChecks("));
const exclusivity=vm.runInNewContext(periodCode+progressCode+"\n({taskKey,taskDone,routineConflict,routineProgress})",{taskCatalog:active,taskChecks:{}});
const state={"w:2026-11-20|gramiel-weekly":true};
const mock=vm.runInNewContext("function taskPeriod(){return 'w:2026-11-20'}\n"+progressCode+"\n({routineConflict,routineProgress})",{taskCatalog:active,taskChecks:state});
assert.equal(mock.routineConflict(gramielPair.find(t=>t.id==="gramiel-echoes-weekly")).id,"gramiel-weekly");
assert.equal(mock.routineProgress(gramielPair).total,1);
assert.equal(mock.routineProgress(gramielPair).done,1);
assert.ok(html.includes("Saved tasks needing review"));
assert.ok(html.includes("Progression / retired / legacy references"));
assert.ok(html.includes("selectedUltraClasses.get(b.id)"));
assert.ok(html.includes("selectedUltraClasses.set(b.id,cls)"));
assert.ok(html.includes("const chosen=all.find"));
assert.ok(html.includes("out.consumable='Vigil'"));
assert.equal(workbookApi.simplifiedExtraEncounters.find(x=>x.name==="Fourth Lynaria").join,"/join murdermoon");
assert.equal(workbookApi.simplifiedRoleRatings("Fourth Lynaria",0).find(x=>x.name==="Verus DoomKnight").rating,5);
assert.equal(guide.caption("Avoid Decay during the crystal phase"),"Decay · Hold the debuff");
assert.equal(guide.caption("Noxious Decay reverses healing"),"Inverted healing · Survival");
const merged=guide.rows({tips:["On “You cannot resist.” use Vigil within 3 seconds.","On “You cannot resist.” use Vigil within 3 seconds."],quotes:[{quote:"You cannot resist.",response:"Equip Vigil before pulling."}]});
assert.equal(merged.length,1);assert.ok(merged[0].text.includes("3 seconds"));assert.ok(merged[0].text.includes("Equip Vigil"));
console.log("Planner and Ultra audit: actual runtime catalog, historical alias migration, exclusive weeklies, preserved class selection and Fourth Lynaria passed.");

const sword=compact.ultraBeginnerActions("nulgath","Chrono ShadowHunter",[]);
assert.ok(sword.some(x=>x.includes("half HP")));
assert.ok(sword.some(x=>x.includes("5-second charge")&&x.includes("shatter")));
assert.ok(sword.some(x=>x.includes("+50% outgoing damage")&&x.includes("stacking indefinitely")));
assert.ok(sword.some(x=>x.includes("Silver Bullet (5)")&&x.includes("Reload (2)")));
const dageCSH=compact.ultraBeginnerActions("dage","Chrono ShadowHunter",[]);
assert.equal(dageCSH.length,3);assert.ok(dageCSH.some(x=>x.includes("Tracer Rounds (3)")&&x.includes("HoT")));
assert.ok(compact.ultraBeginnerActions("dage","Verus DoomKnight",[]).some(x=>x.includes("Unleash Doom (5)")&&x.includes("If assigned Decay")));
assert.equal(compact.ultraBeginnerText("Workbook survival target: at least 3,175 HP before pulling.",""),"Survival target: at least 3,175 HP before pulling.");
assert.ok(compact.ultraBeginnerText("In the workbook variant, preserve LoO skill 5 for the nuke.","Lord of Order").includes("Blessing of Order (5)"));
assert.ok(compact.ultraGlossary["Noxious Decay"].icon.startsWith("https://aqw.app/assets/"));
assert.ok(compact.ultraGlossary["Noxious Decay"].text.includes("11 seconds"));
assert.ok(compact.ultraGlossary["Righteous Seal"].text.includes("skill 4"));
assert.ok(compact.ultraGlossary["Sacred Magic: Eden"].text.includes("skill 5"));
assert.ok("Noxious Decay reverses HoTs".split(compact.ultraTermPattern).includes("Noxious Decay"));
assert.ok(html.includes("ultraExplainText(description,part.quote?"));
assert.ok(html.includes("img.referrerPolicy='no-referrer'"));
assert.ok(ultraCSS.includes(".ultra-help-term:focus>.ultra-help-popup"));
assert.ok(!html.includes("Workbook loadout · agree your party strategy."));
console.log("Beginner tips: rating 3–5, exact sword timing, skill names, glossary and icon reference.");

for(const [key,p] of Object.entries(compact.simplifiedProfiles)){
 for(const cls of compact.ultraClassOptions(key,p).flatMap(x=>x.names)){
  const gear=compact.ultraSuggestedGear(key,cls,p);
  for(const slot of ["weapon","helm","cape","base"])assert.ok(gear[slot],key+" / "+cls+" / "+slot);
  if(key==="dage")assert.match(gear.weapon,/Health Vamp|Dauntless/);
  if(key==="kathool")assert.equal(gear.consumable,"Vigil");
 }
}
for(const p of compact.simplifiedExtraEncounters)for(const cls of compact.ultraClassOptions(p.name,p).flatMap(x=>x.names)){
 const gear=compact.ultraSuggestedGear(p.name,cls,p);for(const slot of ["weapon","helm","cape","base"])assert.ok(gear[slot],p.name+" / "+cls+" / "+slot);
}
assert.equal(compact.ultraSuggestedGear("tyndarius","Chaos Shaper",null).base,"Lucky");
assert.equal(compact.ultraSuggestedGear("engineer","Sentinel",null).estimated,true);
assert.equal(compact.ultraSuggestedGear("kathool","Chaos Shaper",null).consumable,"Vigil");
assert.ok(!compact.ultraTermInfo("Zone","dage").text.includes("Speaker"));
assert.ok(!compact.ultraTermInfo("Zone","speaker").text.includes("Dage"));
assert.ok(!compact.ultraTermInfo("HoT","engineer").text.includes("Dage"));
assert.ok(compact.ultraTermInfo("Zone","dage").text.includes("3 seconds"));
assert.ok(compact.ultraTermInfo("Zone","speaker").text.includes("assigned"));
const apDage=compact.ultraBeginnerActions("dage","ArchPaladin",[]);
assert.equal(apDage.length,4);
assert.ok(apDage.some(x=>x.includes("Hymn of Light (3)")));
assert.ok(apDage.some(x=>x.includes("Scroll of Decay")&&x.includes("backup")));
assert.ok(apDage.every(x=>!/\b(?:LDK|LR|Legion Revenant|Legion DoomKnight)\b/.test(x)));
assert.equal(apDage.filter(x=>x.includes("Cower behind")).length,1);
assert.equal(compact.ultraRecommendedTeam({team:["A","B","C","D"]},{team:[{cls:"E"}]}).join(","),"A,B,C,D");
assert.ok(html.includes("appendUltraRecommendedTeam(root,b,profile)"));
assert.ok(ultraCSS.includes(".ultra-react-step"));
assert.ok(ultraCSS.includes(".ultra-recommended-team"));
console.log("Ultra team, all selectable class gear slots, scoped glossary, and AP reaction guidance passed.");

for(const [key,p] of Object.entries(compact.simplifiedProfiles))for(const cls of compact.ultraClassOptions(key,p).flatMap(x=>x.names)){
 const tips=compact.ultraUnifiedTips(key,cls);
 assert.ok(tips.length>=2,key+" / "+cls);
 assert.equal(new Set(tips.map(t=>t.text)).size,tips.length,key+" duplicate tips");
 assert.equal(new Set(tips.filter(t=>t.quote).map(t=>t.quote)).size,tips.filter(t=>t.quote).length,key+" duplicate quotes");
}
const chaos=compact.ultraUnifiedTips("drakath","Chaos Shaper");
assert.ok(chaos.some(t=>t.title.includes("18M")&&t.title.includes("4M")));
assert.ok(chaos.some(t=>t.title.includes("Meteor")&&t.text.includes("20 seconds")));
assert.ok(chaos.every(t=>!t.text.includes("Hymn of Light")));
assert.ok(compact.ultraUnifiedTips("drakath","ArchPaladin").some(t=>t.text.includes("Hymn of Light (3)")));
assert.ok(compact.ultraUnifiedTips("darkon","Chrono ShadowHunter").some(t=>t.text.includes("72 seconds")));
assert.ok(compact.ultraUnifiedTips("gramiel","Legion Revenant").some(t=>t.text.includes("Atramentous Shade")));
assert.ok(compact.ultraUnifiedTips("gramiel","Shaman").every(t=>!t.text.includes("Atramentous Shade")));
assert.ok(compact.ultraUnifiedTips("dage","ArchPaladin").some(t=>t.quote.includes("Legion at my disposal")));
assert.ok(compact.ultraUnifiedTips("nulgath","Chrono ShadowHunter").some(t=>t.text.includes("stacking indefinitely")));
const personal=compact.ultraSpeakerPersonal(compact.simplifiedSpeakerPatterns[0],"ArchPaladin");
assert.ok(personal.some(t=>t.event==="Zone 3"));
assert.ok(personal.every(t=>t.event!=="Zone 1"));
assert.ok(compact.ultraSpeakerPersonal(compact.simplifiedSpeakerPatterns[0],"Legion Revenant").some(t=>t.event==="Zone 2"));
assert.ok(!html.includes("🧩 Team & advanced tactics"));
assert.ok(ultraCSS.includes(".ultra-recommended-classes{justify-content:center}"));
assert.ok(ultraCSS.includes("grid-template-columns:minmax(0,1fr) minmax(0,auto) minmax(0,1fr)"));
console.log("Unified role guides, contextual action ownership, single quotes, personal Speaker rotations and centered header passed.");

const detail108=html.slice(html.indexOf("function renderUltraDetail(b)"),html.indexOf("$('ultrasearch').addEventListener"));
assert.ok(!detail108.includes("ultra-focus-footer"));
assert.ok(!detail108.includes("Full community strategy"));
assert.ok(!detail108.includes("Team ownership ≠ boss access"));
assert.ok(ultraCSS.includes(">.goalhead.ultra-title-row{padding-right:0!important"));
assert.ok(ultraCSS.includes(".ultra-setup-card .ultra-focus-gear{grid-template-columns:repeat(4,minmax(0,1fr))"));
assert.ok(ultraCSS.includes(".ultra-focus-gear-cell:nth-child(5)"));
assert.ok(ultraCSS.includes("margin:18px 0 19px!important"));
assert.ok(ultraCSS.includes("@container (max-width:900px)"));
assert.ok(ultraCSS.includes("@container (max-width:480px)"));
console.log("Ultra layout: right gutter removed, four enhancement slots, responsive controls and no bottom footer.");

const plannerCardCode=html.slice(html.indexOf("const plannerBossArt="),html.indexOf("$('resetultradaily')",html.indexOf("const plannerBossArt=")));
let completed=false,unpins=0,pins=0,toggles=0,conflict=null;
const makeNode=(tag,text,cls)=>({tag,text,cls,children:[],append(...nodes){this.children.push(...nodes)},setAttribute(k,v){this[k]=v}});
const status={value:"all"};
const renderCard=vm.runInNewContext(plannerCardCode+"\ntaskCard",{node:makeNode,taskDone:()=>completed,routineConflict:()=>conflict,taskRoutes:{},taskCategories:()=>["Materials"],makeCopyJoin:join=>makeNode("button",join),unpinTask:()=>unpins++,pinTask:()=>pins++,toggleTask:(t,done)=>{completed=done;toggles++},$:()=>status});
const task109={id:"test",name:"Test Quest",freq:"daily",group:"Legion",rewards:["Material ×1","50000 Gold","50000 XP"],join:"/join farm",acceptJoin:"/join accept",note:"Requires an unlock",targets:["Defeat the monster"]};
const flatten109=n=>[n,...n.children.flatMap(flatten109)];
let tree109=flatten109(renderCard(task109,true));
assert.ok(tree109.some(n=>n.text==="Material ×1"));
assert.ok(tree109.some(n=>n.text==="50000 Gold"));assert.ok(tree109.some(n=>n.text==="50000 XP"));
assert.ok(tree109.some(n=>n.text==="/join accept"));
assert.ok(tree109.some(n=>n.text==="/join farm"));
assert.ok(tree109.some(n=>n.tag==="details"));
const complete109=tree109.find(n=>n.tag==="button"&&n.text==="✓");assert.equal(complete109.title,"Mark complete");assert.equal(complete109["aria-pressed"],"false");complete109.onclick();
assert.equal(completed,true);
tree109=flatten109(renderCard(task109,true));
assert.ok(tree109[0].cls.includes("done"));
status.value="completed";const undo109=tree109.find(n=>n.tag==="button"&&n.text==="×");assert.equal(undo109.title,"Undo completion");assert.equal(undo109["aria-pressed"],"true");assert.ok(undo109.cls.includes("is-complete"));undo109.onclick();
assert.equal(completed,false);assert.equal(status.value,"all");assert.equal(toggles,2);
const removePin114=tree109.find(n=>n.tag==="button"&&String(n.cls||"").includes("planner-pin-action is-pinned"));assert.ok(removePin114);assert.match(removePin114.title,/^Unpin /);removePin114.onclick();assert.equal(unpins,1);
conflict={name:"Other weekly"};tree109=flatten109(renderCard(task109,true));
assert.ok(tree109.find(n=>n.tag==="button"&&n.text==="✓").disabled);
conflict=null;const addPin114=flatten109(renderCard(task109,false)).find(n=>n.tag==="button"&&String(n.cls||"").includes("planner-pin-action is-unpinned"));assert.ok(addPin114);assert.match(addPin114.title,/^Pin /);addPin114.onclick();assert.equal(pins,1);
assert.ok(html.includes("const grid=node('div',undefined,'planner-quest-grid')"));
assert.ok(plannerCSS.includes("max(235px,calc((100% - 44px)/5))"));
assert.ok(plannerCSS.includes("#planner.view.active #planner-my-tasks{grid-template-columns:minmax(0,1fr)!important"));
console.log("Tracker 3.0 tiles: rewards, distinct joins, completion, undo, pin/unpin, conflicts and responsive grids passed.");

assert.ok(plannerCSS.includes(".planner-quest-actions .planner-complete-action.is-complete"));
assert.ok(html.includes("actions.append(action)"));

const portraitCode=html.slice(html.indexOf("const plannerBossArt="),html.indexOf("$('resetultradaily')",html.indexOf("const plannerBossArt=")));
const portrait=vm.runInNewContext(portraitCode+"\n({taskCard,plannerArt,plannerCategory,plannerRewardParts,plannerTitle})",{node:makeNode,taskDone:()=>completed,routineConflict:()=>null,taskRoutes:{},taskCategories:t=>t.categories||[t.group||"Other"],makeCopyJoin:join=>makeNode("button",join),unpinTask:()=>{},pinTask:()=>{},toggleTask:()=>{},$:()=>status});
const boss110={name:"Ultra Ezrajal",sourceName:"Ultra Ezrajal",group:"Ultra Boss",freq:"daily",join:"/join ultraezrajal",acceptJoin:"/join timeinn",rewards:["Ezrajal Insignia ×1","250000 Gold","500000 XP"]};
assert.equal(portrait.plannerTitle(boss110),"Ultra Ezrajal");
assert.equal(portrait.plannerCategory(boss110),"Ultras");
assert.equal(portrait.plannerRewardParts(boss110).main,"Ezrajal Insignia ×1");
assert.match(portrait.plannerArt(boss110).url,/XynsWFk\.png$/);
assert.equal(portrait.plannerArt({...boss110,name:"Unrelated quest",sourceName:"",group:"Materials"}),null);
const portraitTree=flatten109(portrait.taskCard(boss110,true));
assert.ok(portraitTree.some(n=>n.tag==="img"&&n.referrerPolicy==="no-referrer"));
assert.ok(portraitTree.some(n=>n.cls==="planner-reward-preview"&&n.text==="Ezrajal Insignia ×1"));
assert.ok(portraitTree.some(n=>n.cls==="planner-quest-actions"&&n.children.some(c=>c.text==="/join timeinn")));
assert.ok(portraitTree.some(n=>n.tag==="details"&&flatten109(n).some(c=>c.text==="/join ultraezrajal")));
assert.ok(html.includes('id="plannertotalcount"'));
assert.ok(html.includes('data-planner-frequency="daily"'));
assert.ok(html.includes('id="planner-my-categories"'));
assert.ok(html.includes("const total=routineProgress(pinnedActive)"));
assert.ok(plannerCSS.includes(".planner-quest-art img[hidden]"));
assert.ok(plannerCSS.includes("calc((100% - 55px)/6)"));
console.log("Tracker portrait cards: verified image map, main reward, full details, separate joins, category and summary wiring.");

assert.equal(active.filter(t=>t.kind==="activity").length,19);
assert.equal(active.filter(t=>t.group==="Friendships").length,17);
assert.ok(active.find(t=>t.id==="reviewed-dulcify").rewards.includes("Cinders of a Champion ×1"));
assert.equal(active.find(t=>t.id==="wheel-of-doom-weekly").freq,"weekly");
assert.ok(active.find(t=>t.id==="friendship-gravelyn").rewards[0].includes("Void Aura"));
assert.ok(plannerCSS.includes("align-items:stretch!important"));
assert.ok(plannerCSS.includes("aspect-ratio:16/9"));
assert.ok(plannerCSS.includes("object-fit:cover"));
assert.ok(html.includes("const visible=matches;"));
assert.ok(!html.includes("planner-browse-frequency"));
assert.ok(html.includes("☀️ Daily quests"));
assert.ok(html.includes("📅 Weekly quests"));
assert.ok(html.includes("textContent='+ Search more quests ('+activeCatalog.length+')'"));
assert.ok(html.includes("$('plannerbrowse').onclick=()=>openPlannerLibrary(plannerMyFrequency)"));
assert.ok(html.includes("progress.done+' / '+progress.total+' complete'"));
assert.match(portrait.plannerArt(active.find(t=>t.id==="reviewed-dulcify")).url,/cpDNEYC\.png$/);
assert.match(portrait.plannerArt(active.find(t=>/^Daily Exercise 3:/.test(t.name))).url,/9kK857M\.png$/);
console.log("Planner full-width art, expanded routines and direct library discovery passed.");

const plannerNav=html.slice(html.indexOf('<nav class="tabs subnav"'),html.indexOf('</nav>',html.indexOf('<nav class="tabs subnav"')));
assert.match(plannerNav,/data-tab="planner" data-parent="planner">📅 My Tracker/);
assert.match(plannerNav,/data-tab="planner-discover" data-parent="planner">📚 Quest Library/);
assert.match(plannerNav,/data-tab="planner-history" data-parent="planner" hidden/);
assert.ok(plannerCSS.includes('nav.tabs.subnav[aria-label="Section navigation"]:has(button[data-parent="planner"].group-visible:not([hidden])){display:flex!important}'));
assert.ok(plannerCSS.includes('button[data-parent="planner"].group-visible:not([hidden]){display:inline-flex!important'));
assert.ok(html.includes("$('planneropenhistory').onclick=()=>selectTab('planner-history')"));
assert.ok(html.includes("$('plannerbackfromhistory').onclick=()=>selectTab('planner')"));
const navMock=(dataset={},id='')=>({dataset,id,active:new Set(),classList:{toggle(k,v){if(v)this.owner.active.add(k);else this.owner.active.delete(k)}},addEventListener(k,fn){this[k]=fn}});
const navTabs=[navMock({tab:'planner',parent:'planner'}),navMock({tab:'planner-discover',parent:'planner'}),navMock({tab:'planner-history',parent:'planner'}),navMock({tab:'unlocks',parent:'projects'})];
const navGroups=[navMock({group:'planner'}),navMock({group:'projects'})];
const navViews=['overview','planner','planner-discover','planner-history','unlocks'].map(id=>navMock({},id));
for(const e of [...navTabs,...navGroups,...navViews])e.classList.owner=e;
const docNav={querySelector(q){return navTabs.find(t=>q==='[data-tab="'+t.dataset.tab+'"]')||null},querySelectorAll(q){return q==='[data-tab]'?navTabs:q==='[data-group]'?navGroups:q==='.view'?navViews:[]}};
const navCode=html.slice(html.indexOf("const groupDefaults="),html.indexOf("activateTab('overview');$('opencommunityadvanced')"));
const navApi=vm.runInNewContext(navCode+"\n({activateTab,lastTabByGroup})",{document:docNav,renderPlanner:()=>{}});
navGroups[0].click();assert.ok(navViews[1].active.has('active'));
navTabs[1].click();assert.ok(navViews[2].active.has('active'));assert.ok(navTabs[0].active.has('group-visible'));
navTabs[0].click();assert.ok(navViews[1].active.has('active'));assert.ok(!navViews[2].active.has('active'));
navTabs[1].click();navGroups[0].click();assert.ok(navViews[1].active.has('active'),"Main Tracker tab always returns to dashboard");
navApi.activateTab('planner-history');assert.ok(navViews[3].active.has('active'));assert.ok(navTabs[0].active.has('group-visible'));
navGroups[1].click();assert.ok(navViews[4].active.has('active'));assert.ok(!navTabs[0].active.has('group-visible'));
console.log("Planner navigation round trip, main tab fallback and history access passed.");

const artBefore=vm.runInNewContext(portraitCode.replace(':plannerRelatedArt(t);',':null;')+"\n({plannerArt})",{});
const newlyIllustrated=active.filter(t=>!artBefore.plannerArt(t)&&portrait.plannerArt(t));
assert.ok(newlyIllustrated.length>=20,"at least 20 new illustrated active routines");
for(const t of active){
 const before=artBefore.plannerArt(t),after=portrait.plannerArt(t);
 if(before)assert.equal(after.url,before.url,"preserve existing art: "+t.id);
 if(after){assert.match(after.url,/^https:\/\/i\.imgur\.com\/[A-Za-z0-9]+\.(?:png(?:\.png)?|jpg)$/);assert.match(after.source,/^https:\/\/aqwwiki\.wikidot\.com\/[a-z0-9-]+$/);}
}
for(const [id,file] of [['mining','nukE09D.png'],['hardcore','nukE09D.png'],['encroach','vG57ctr.png'],['wrongturn','x4cJMlq.png'],['seal-dark','PaWdbKE.jpg'],['reviewed-fins-up','aN3gnPQ.png'],['friendship-gravelyn','O72reGd.png']]){
 const task=active.find(t=>t.id===id);assert.ok(task,id);assert.ok(portrait.plannerArt(task).url.endsWith('/'+file),id);
 const artTree=flatten109(portrait.taskCard(task,false));
 assert.ok(artTree.some(n=>n.tag==='img'&&n.loading==='lazy'&&n.referrerPolicy==='no-referrer'));
 assert.ok(artTree.some(n=>n.tag==='a'&&n.href===portrait.plannerArt(task).source));
}
assert.equal(portrait.plannerArt({id:'custom-1',name:'Mine Crafting',group:'Custom',wiki:'https://aqwwiki.wikidot.com/reens-quests'}),null);
assert.equal(portrait.plannerArt({id:'unknown',name:'Unknown quest',group:'General',join:'/join yulgar',wiki:'https://aqwwiki.wikidot.com/daily-quest-board-s-quests'}),null);
assert.equal(portrait.plannerArt({id:'toString',group:'General'}),null);
console.log("Quest artwork expansion: "+newlyIllustrated.length+" additional active routines; "+active.filter(t=>portrait.plannerArt(t)).length+"/"+active.length+" with artwork references.");

const toolbar114=html.slice(html.indexOf('<div class="card planner-board">'),html.indexOf('<div id="planner-my-tasks"'));
assert.match(toolbar114,/<select id="planner-my-categories" aria-label="Quest category">/);
assert.match(toolbar114,/<select id="plannerstatus" aria-label="Completion status">/);
assert.ok(!toolbar114.includes('planner-category-controls'));
assert.ok(html.includes("categoryBar.value=plannerMyCategory;categoryBar.onchange=()=>{plannerMyCategory=categoryBar.value;renderPlanner()}"));
assert.ok(html.includes("css/planner-routines.css?v=116"));
for(const [id,file] of [['friendship-twilly','0KftqqS.png'],['friendship-warlic','sq7rbv5.png'],['friendship-sally','GI2CmjZ.png'],['friendship-twig','Ke7Ri6j.png']]){
 const task=active.find(t=>t.id===id);assert.ok(task,id);assert.ok(portrait.plannerArt(task).url.endsWith('/'+file),id);
}
console.log("Compact toolbar and additional artwork checks passed.");

assert.ok(plannerCSS.includes(".planner-pin-action.is-unpinned"));assert.ok(plannerCSS.includes(".planner-pin-action.is-pinned"));assert.ok(plannerCSS.includes("mask:var(--planner-pin-icon)"));assert.ok(html.includes("button.setAttribute('aria-label',button.title)"));console.log("Pin and unpin pictograms retain accessible labels and actions.");

assert.ok(plannerCSS.includes(".planner-quest-actions .planner-complete-action.is-complete,.planner-quest-actions .planner-pin-action.is-pinned{color:#ffb4b4"));
assert.ok(plannerCSS.includes(".planner-quest-actions .planner-complete-action{color:#b6f4d1"));
console.log("Green completion, red undo and red unpin actions checked.");
