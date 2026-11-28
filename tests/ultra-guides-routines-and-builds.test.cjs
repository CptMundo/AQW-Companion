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
assert.ok(html.includes("const personal=matches?variant.roles[cls]:null"),"Only source-gated personal rows render");
assert.ok(html.includes("ultra-role-mini-title"));
assert.ok(html.includes("const publicEncounterLoadouts=false;"),"Do not present unverified class loadouts in encounter guides");
assert.ok(html.includes("function ultraStrategyVariants"),"Keep unsupported substitutions out of active strategies");
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
assert.match(html,/href="css\/planner-routines\.css\?v=\d+"/,"Planner stylesheet uses a versioned URL");
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
assert.equal(reviewedApi.encounterUltraBuild("dage","Lord of Order",{weapon:"Awe Blast",helm:"Forge",cape:"Absolution"}),null,"Dage common sustain advice cannot manufacture a gear preset");
assert.equal(reviewedApi.encounterUltraBuild("gramiel","Legion Revenant",null).weapon,"Mana Vamp");
assert.equal(reviewedApi.encounterUltraBuild("gramiel","Shaman",null).consumable,"Scroll of Enrage");
assert.equal(reviewedApi.encounterUltraBuild("darkon","StoneCrusher",null).base,"Fighter");
assert.equal(reviewedApi.encounterUltraBuild("ezrajal","Void Highlord",null),null,"No invented encounter preset");
assert.ok(reviewedApi.ultraReviewedTactics.gramiel.some(row=>row[1].includes("70%, 40% and 10%")));
assert.ok(html.includes("for(const [label,tip] of evidence.shared)"),"Only approved shared rows render");
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
assert.ok(html.includes("renderBossGuides(root,$(\'bossguidesearch\').value.trim().toLowerCase(),$(\'bossguidecategory\').value)"));
assert.ok(html.includes("community role"));

const compact=vm.runInNewContext(reviewedCode+"\n({ultraClassOptions,ultraSelectedRating,ultraWorkbookBuild,ultraCompactTips,ultraActionTips,ultraBeginnerActions,ultraBeginnerText,ultraGlossary,ultraTermPattern,ultraTermInfo,ultraSuggestedGear,ultraRecommendedTeam,ultraUnifiedTips,ultraSpeakerRole,ultraSpeakerPersonal,simplifiedSpeakerPatterns,simplifiedProfiles,simplifiedRatings,simplifiedExtraEncounters,sameUltraClass,fillUltraClassSelect,renderUltraSelectedRating,appendUltraGearCells,ultraStrategyVariants,ultraTeamFamilies,ultraSlotChoices,workbookPersonalGuide,workbookSharedGuide,approvedUltraGuides,approvedOtherBossGuides,approvedClassActivities,auditedBossSheetLocations})",{
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
for(const [key,p] of Object.entries(compact.simplifiedProfiles)){const groups=compact.ultraClassOptions(key,p);const classes=groups.flatMap(x=>x.names);assert.ok(classes.length,key);assert.ok(classes.every(n=>{const s=compact.ultraSelectedRating(key,n);return !s||[3,4,5].includes(s.rating)}),key);for(const group of groups)assert.ok(group.names.every((n,i)=>i===0||group.names[i-1].localeCompare(n)<=0),key+" alphabetical");for(const cls of classes)assert.ok(compact.ultraActionTips(key,cls,[]).length>=2,key+" / "+cls+" has real mechanics");}
const select={children:[],append(x){this.children.push(x)}};
compact.fillUltraClassSelect(select,"drakath",profile,["Void Highlord"]);
assert.equal(select.value,"Lord of Order");
assert.ok(select.children.flatMap(g=>g.children).some(o=>o.value==="Chrono ShadowHunter"));assert.ok(select.children.flatMap(g=>g.children).every(o=>!o.label.includes("/5")),"Unvalidated numerical ratings not shown");
const rating={children:[],append(...x){this.children.push(...x)},replaceChildren(...x){this.children=x}};
compact.renderUltraSelectedRating(rating,"drakath","Lord of Order");
assert.ok(rating.children.some(x=>x.text.includes("Healer")));
compact.renderUltraSelectedRating(rating,"drakath","Bard");
assert.ok(rating.children.some(x=>x.text==="Not owned"));
assert.ok(!rating.children.some(x=>x.text.includes("Healer")),"Class change clears previous rating");
assert.ok(html.includes("fillStrategyClasses(select,allNames,selectedUltraClasses.get(b.id)"));
assert.ok(html.includes("function ultraSuggestedGear(key,cls,profile,generic=null,encounter=null)"));
assert.ok(html.includes("classInExampleTeam(exampleNames,cls)"));
assert.ok(html.includes("const personal=matches?variant.roles[cls]:null"));
assert.ok(html.includes("if(!variants.length)"),"Withhold unresolved strategies");
assert.ok(!html.includes("Community workbook — suggested strategy"));
assert.ok(!html.includes("Class suitability by role (community ratings)"));
assert.ok(ultraCSS.includes(".ultra-selected-rating"));
console.log("Compact loadout selector: class options, per-boss ratings, source loadouts, targeted tips and rotation retention passed.");

assert.equal(groups[0].label,"✓ OWNED CLASSES");
assert.ok(groups[0].names.every(n=>n==="Lord of Order"||n==="Void Highlord"));
assert.ok(groups.slice(1).every(g=>g.owned===false));
assert.ok(select.children[0].children.every(o=>o.label.startsWith("✓ ")&&!o.label.includes("OWNED ·")));
compact.renderUltraSelectedRating(rating,"drakath","Lord of Order");
assert.ok(rating.children.every(x=>!/\/5/.test(x.text)),"No unvalidated rating displayed");
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
assert.ok(compact.ultraUnifiedTips("kathool","Chaos Shaper").some(t=>t.text.includes("Vigil")),"Required Vigil guidance independent of gear evidence");
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
assert.ok(html.includes("ultraExplainText(desc,content,key)"));
assert.ok(html.includes("img.referrerPolicy='no-referrer'"));
assert.ok(ultraCSS.includes(".ultra-help-term:focus>.ultra-help-popup"));
assert.ok(!html.includes("Workbook loadout · agree your party strategy."));
console.log("Beginner tips: rating 3–5, exact sword timing, skill names, glossary and icon reference.");

for(const [key,p] of [...Object.entries(compact.simplifiedProfiles),...compact.simplifiedExtraEncounters.map(p=>[p.name,p])]){
 for(const cls of compact.ultraClassOptions(key,p).flatMap(x=>x.names)){
  const gear=compact.ultraSuggestedGear(key,cls,p),exact=compact.ultraWorkbookBuild(p,cls);
  const disputed=["greatthief","arcanainvoker"].includes(cls.toLowerCase().replace(/[^a-z0-9]/g,"")) || (key==='Astral Empyrean'&&exact?.cape==='Vainglory');
  if(!exact||disputed){assert.equal(gear,null,key+" / "+cls+" no evidence");continue;}
  assert.equal(gear.estimated,true,key+" / "+cls+" source example is not verified");
  for(const slot of ["weapon","helm","cape","base"])if(gear[slot])assert.equal(gear[slot],exact[slot],key+" / "+cls+" / "+slot+" must not be fabricated");
 }
}
assert.equal(compact.ultraSuggestedGear("tyndarius","Chaos Shaper",null),null);
assert.equal(compact.ultraSuggestedGear("engineer","Sentinel",null),null);
assert.equal(compact.ultraSuggestedGear("kathool","Chaos Shaper",null),null);
for(const cls of ["Great Thief","Arcana Invoker","Void Highlord"]){
 const tips=compact.ultraUnifiedTips("drakath",cls);
 assert.ok(tips.some(t=>t.title==="DPS assignment"));
 assert.ok(tips.every(t=>!/Equip seven|activate Scroll of Enrage BEFORE|Assigned taunter: intercept/.test(t.text)));
}
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
assert.ok(html.includes("const variants=ultraStrategyVariants(b,profile)"));
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

const plannerCardCode=html.slice(html.indexOf("const plannerBossArt="),html.indexOf("let plannerShowAll=",html.indexOf("const plannerBossArt=")));
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

const portraitCode=html.slice(html.indexOf("const plannerBossArt="),html.indexOf("let plannerShowAll=",html.indexOf("const plannerBossArt=")));
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
assert.match(plannerNav,/data-tab="planner" data-parent="planner">📅 Daily \/ Weekly/);
assert.match(plannerNav,/data-tab="planner-pinned" data-parent="planner">📌 Pinned Quests/);
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
assert.match(html,/href="css\/planner-routines\.css\?v=\d+"/,"Planner stylesheet uses a versioned URL");
for(const [id,file] of [['friendship-twilly','0KftqqS.png'],['friendship-warlic','sq7rbv5.png'],['friendship-sally','GI2CmjZ.png'],['friendship-twig','Ke7Ri6j.png']]){
 const task=active.find(t=>t.id===id);assert.ok(task,id);assert.ok(portrait.plannerArt(task).url.endsWith('/'+file),id);
}
console.log("Compact toolbar and additional artwork checks passed.");

assert.ok(plannerCSS.includes(".planner-pin-action.is-unpinned"));assert.ok(plannerCSS.includes(".planner-pin-action.is-pinned"));assert.ok(plannerCSS.includes("mask:var(--planner-pin-icon)"));assert.ok(html.includes("button.setAttribute('aria-label',button.title)"));console.log("Pin and unpin pictograms retain accessible labels and actions.");

assert.ok(plannerCSS.includes(".planner-quest-actions .planner-complete-action.is-complete,.planner-quest-actions .planner-pin-action.is-pinned{color:#ffb4b4"));
assert.ok(plannerCSS.includes(".planner-quest-actions .planner-complete-action{color:#b6f4d1"));
console.log("Green completion, red undo and red unpin actions checked.");

const bossTabs117=html.slice(html.indexOf('<nav class="tabs subnav"'),html.indexOf('</nav>',html.indexOf('<nav class="tabs subnav"')));
assert.match(bossTabs117,/data-tab="ultras" data-parent="ultras">⚡ Ultras/);
assert.match(bossTabs117,/data-tab="boss-guides" data-parent="ultras">⚔️ Boss Guides/);
assert.ok(ultraCSS.includes('button[data-parent="ultras"].group-visible{display:inline-flex!important'));
const bossCatalog117=vm.runInNewContext(html.slice(html.indexOf("const ultraBossCatalog=["),html.indexOf("function renderUltraCatalog()"))+"\n ultraBossCatalog");
const bossGuideApi117=vm.runInNewContext(reviewedCode+"\n({bossGuideEntries,filterBossGuides,bossGuideSelection,bossGuideOrder})");
const entries117=bossGuideApi117.bossGuideEntries(workbookApi.simplifiedExtraEncounters,bossCatalog117);
assert.equal(entries117.filter(e=>e.profile).length,29);
assert.equal(entries117.filter(e=>!e.profile).length,11);
assert.equal(new Set(entries117.map(e=>e.id)).size,40);
assert.ok(entries117.every(e=>bossGuideApi117.bossGuideOrder.includes(e.group)));
assert.equal(bossGuideApi117.filterBossGuides(entries117,"","Grim Gaol",()=>[]).length,11);
assert.equal(bossGuideApi117.filterBossGuides(entries117,"","Void Bosses",()=>[]).length,4);
assert.equal(bossGuideApi117.filterBossGuides(entries117,"ultra iara","all",()=>[])[0].profile,null);
assert.ok(bossGuideApi117.filterBossGuides(entries117,"lord of order","all",()=>[]).some(e=>e.name==="Fourth Lynaria"));
assert.equal(bossGuideApi117.bossGuideSelection([],entries117[0].id),"");
assert.equal(bossGuideApi117.bossGuideSelection(entries117,entries117[3].id),entries117[3].id);
assert.equal(bossGuideApi117.bossGuideSelection(entries117,"unknown"),entries117[0].id);
const bossTabs=[navMock({tab:'ultras',parent:'ultras'}),navMock({tab:'boss-guides',parent:'ultras'})];
const bossGroups=[navMock({group:'ultras'})];const bossViews=['ultras','boss-guides'].map(id=>navMock({},id));
for(const e of [...bossTabs,...bossGroups,...bossViews])e.classList.owner=e;
const bossDoc={querySelector(q){return bossTabs.find(t=>q==='[data-tab="'+t.dataset.tab+'"]')||null},querySelectorAll(q){return q==='[data-tab]'?bossTabs:q==='[data-group]'?bossGroups:q==='.view'?bossViews:[]}};
vm.runInNewContext(navCode,{document:bossDoc});
bossGroups[0].click();assert.ok(bossViews[0].active.has('active'));bossTabs[1].click();assert.ok(bossViews[1].active.has('active'));assert.ok(bossTabs[0].active.has('group-visible'));bossTabs[0].click();assert.ok(bossViews[0].active.has('active'));
console.log("Separate Ultras / Boss Guides views, 29 guides and 11 catalog encounters, category search and selection passed.");

const siteNav118=fs.readFileSync(path.join(__dirname,"../css/site.css"),"utf8");
assert.ok(!siteNav118.includes('.subnav button[data-parent="ultras"]'),"No obsolete rule hides Ultra subtabs");
assert.ok(!siteNav118.includes(':not([data-parent="ultras"])'),"Ultra group participates in subnav visibility");
assert.ok(siteNav118.includes('.tabs.subnav button.group-visible{display:inline-flex}'));
assert.ok(!html.includes('class="ultra-reset-tools"'));
assert.ok(!html.includes('resetultradaily'));
assert.ok(!html.includes('resetultraweekly'));
assert.ok(/href="css\/site\.css\?v=\d+"/.test(html),'Site stylesheet remains cache-versioned');
assert.ok(html.includes('id="ultracards"')&&html.includes('id="bossguidedetail"'));
console.log("Ultra/Boss subnav CSS no longer excludes Ultras; reset toolbar removed without touching saved quest state.");

assert.ok(html.includes("btn.setAttribute('aria-pressed',String(b.id===selectedUltra))"));
assert.ok(html.includes("button.setAttribute('aria-pressed',String(e.id===selectedBossGuide))"));
assert.ok(/href="css\/ultra-quote-actions\.css\?v=\d+"/.test(html),"Guide stylesheet stays cache-versioned");
assert.ok(html.includes("ultra-role-step guide-v2-step"),"Consolidated rows have a dedicated layout class");
assert.ok(ultraCSS.includes("#ultradetail .ultra-role-step.guide-v2-step")&&ultraCSS.includes("#bossguidedetail .ultra-role-step.guide-v2-step"),"Both guide surfaces use the full-width hotfix");
assert.ok(ultraCSS.includes("#ultras #ultracards .ultracard.active,"));
assert.ok(ultraCSS.includes("#boss-guides .boss-guide-list .boss-guide-item.active{background:linear-gradient"));
assert.ok(ultraCSS.includes("inset 4px 0 0 #79d9ff"));
console.log("Selected encounter contrast and accessible pressed states in both guide views checked.");

const boss120=vm.runInNewContext(reviewedCode+"\n({bossGuideSorted,bossGuideRoleTips})");
assert.equal(boss120.bossGuideSorted(entries117)[0].group,"Void Bosses");
assert.equal(boss120.bossGuideSorted(entries117).at(-1).group,"Legacy / special");
const profile120=name=>workbookApi.simplifiedExtraEncounters.find(p=>p.name===name);
assert.ok(boss120.bossGuideRoleTips(profile120("Void Flibbi"),"Shaman","Early DPS").some(t=>t.text.includes("skill 5")));
assert.ok(!boss120.bossGuideRoleTips(profile120("Void Flibbi"),"Lord of Order","Healer").some(t=>t.text.includes("skill 5")));
assert.ok(boss120.bossGuideRoleTips(profile120("Temple Shrine — Middle"),"ArchPaladin","Support").some(t=>t.text.includes("skill 4")));
assert.ok(boss120.bossGuideRoleTips(profile120("Temple Shrine — Middle"),"Lord of Order","Healer").some(t=>t.title==="Lunar Haze"));
for(const p of workbookApi.simplifiedExtraEncounters)assert.ok(boss120.bossGuideRoleTips(p,p.team?.[0]?.cls||p.classes?.[0]||"Void Highlord","Support").length);
assert.ok(ultraCSS.includes(".boss-guide-list>*{flex-shrink:0}"));
assert.ok(ultraCSS.includes("flex:0 0 auto;display:block;min-height:48px!important"));
assert.ok(!html.includes("boss-class-search"));assert.ok(!ultraCSS.includes("boss-class-search"));
assert.ok(html.includes("const guide=approvedOtherBossGuides[entry.name]"));
console.log("Boss sidebar order and source-scoped role tips passed.");

const bossDetail121=html.slice(html.indexOf("function renderBossGuideDetail(entry)"),html.indexOf("function renderBossGuides("));
assert.ok(bossDetail121.includes("fillStrategyClasses(select,"));
assert.ok(bossDetail121.includes("select.onchange=draw"));
assert.ok(!bossDetail121.includes("Suggested general enhancements — not verified for this encounter."));
assert.ok(html.includes("const publicEncounterLoadouts=false;"));
assert.ok(!detail108.includes("ultra-focus-gear"),"Public Ultra guide must not render gear");
assert.ok(!bossDetail121.includes("ultra-focus-gear"));
assert.ok(!bossDetail121.includes("profile.potions"));
assert.ok(detail108.includes("Your class"));assert.ok(bossDetail121.includes("Class-specific responsibilities"));
assert.ok(html.includes("if(tip.source!=='Community guide')body.append"));
assert.ok(bossDetail121.includes("Simplified Bosses Guide — "));
assert.ok(bossDetail121.includes("Wiki location"));
console.log("Boss Guide cleanup preserves class selection, source links and concise suggested-loadout distinction.");

const deadmoor126=active.filter(t=>t.join==='/join deadmoor'&&t.wiki==='https://aqwwiki.wikidot.com/cysero-s-quests');
assert.equal(deadmoor126.length,4);
for(const name of ['Nightmare Fire','Naturally Unlucky','Links To The Past','Spooky Lint']){
 const t=deadmoor126.find(x=>x.name===name);assert.ok(t);assert.equal(t.freq,'daily');assert.equal(t.npc,'Cysero');assert.equal(t.group,"Cysero's Gear");assert.ok(t.note.includes('The Confrontation'));assert.ok(t.categories.includes("Cysero's Gear"));
 assert.equal(t.categories.includes('Legend'),['Naturally Unlucky','Spooky Lint'].includes(name));
 assert.equal(t.note.includes('Mad Weaponsmith'),['Links To The Past','Spooky Lint'].includes(name));
}
const moglins126=active.filter(t=>t.name==='Moglin Companions');
assert.equal(moglins126.length,1);assert.equal(moglins126[0].id,'board-moglin-companions');assert.equal(moglins126[0].farmJoin,'/join nexus');assert.ok(moglins126[0].note.includes("Aria's Pet Shoppe"));assert.ok(moglins126[0].rewards.includes('Moglin MEAL ×1'));assert.ok(moglins126[0].categories.includes('Moglin Pets'));
console.log('Community feedback: all four Deadmoor dailies and single shared Moglin Companions daily verified.');

{
 const source=require('node:fs').readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 const fn=source.slice(source.indexOf('function inventoryQuantityChanges('),source.indexOf('function comparison(){'));
 const calc=new Function(fn+';return inventoryQuantityChanges')();
 const row=(ID,Name,Count,Bank=0)=>({ID,Name,Count,Bank});
 const previous=[row('1','Bone Dust',44),row('2','Void Aura',100),row('3','Moved only',10),row('4','Split stock',3),row('4','Split stock',7,1),row('5','Missing',50)];
 const latest=[row('1','Bone Dust',129),row('2','Void Aura',80),row('3','Moved only',10,1),row('4','Split stock',9),row('4','Split stock',1,1),row('6','New item',200)];
 const result=calc(previous,latest);
 assert.deepEqual(result,[{name:'Bone Dust',was:44,now:129,diff:85},{name:'Void Aura',was:100,now:80,diff:-20}]);
 assert.deepEqual(calc([],latest),[]);
 assert.deepEqual(calc(latest,latest),[]);
 assert.deepEqual(calc([row('4','Split stock',3),row('4','Split stock',7,1)],[row('4','Split stock',12,1)]),[{name:'Split stock',was:10,now:12,diff:2}]);
 assert.ok(source.includes('const changed=inventoryQuantityChanges(previous.items,latest.items)'));
 assert.ok(source.includes('let changes=inventoryQuantityChanges(old.items,newer.items)'));
 assert.ok(source.includes('Show all '+ "'+fmt(changed.length)"));
 assert.ok(source.includes("if(added.length||!changed.length)root.append(highlights)"));
 console.log('Home quantity changes: positive/negative deltas, split stacks, moves, new/missing items and shared comparison verified.');
}

{
 const homeTile=html.slice(html.indexOf('function homeQuestTile('),html.indexOf('function renderHomeInsights()'));
 assert.ok(homeTile.includes('smallbutton home-quest-action'),'Home gallery uses a dedicated completion control');
 assert.ok(homeTile.includes("action.setAttribute('aria-pressed',String(done))"));
 assert.ok(homeTile.includes("action.setAttribute('aria-label',(done?'Undo completion of ':'Mark complete: ')+task.name)"));
 assert.ok(homeTile.includes('toggleTask(task,!done)'),'Same completion handler for complete and undo');
 assert.ok(homeTile.includes('action.disabled=!!conflict'));
 assert.ok(homeTile.includes('plannerArt(task)'));
 assert.ok(homeTile.includes('info.append(joinBox);tile.append(info)'),'Name and join remain in the same compact content group');
 assert.ok(homeTile.includes('makeCopyJoin(route.join)'));
 assert.ok(homeTile.includes("joinBox.classList.toggle('has-multiple',joins.length>1)"));
 assert.ok(!homeTile.includes('home-quest-extra-joins'));
 assert.ok(html.includes('css/site.css?v=157'),'Invalidate previously cached stylesheet');
 assert.ok(html.includes("grid.dataset.frequency=freq"));
 console.log('Home quest gallery: shared artwork, copyable joins, accessible reversible completion and conflict guard verified.');
}

{
 assert.match(html, /data-group="planner">📅 Quest Tracker<\/button>/);
 const wishlist=html.match(/<section id="unlocks" class="view">([\s\S]*?)<\/section>/)[1];
 const pinsView=html.match(/<section id="planner-pinned" class="view">([\s\S]*?)<\/section>/)[1];
 assert.ok(!wishlist.includes('wiki-pinned-quests'));
 assert.ok(pinsView.includes('id="wiki-pinned-quest-list"'));
 assert.equal((html.match(/id="wiki-pinned-quest-list"/g)||[]).length,1);
 assert.ok(html.includes("const wikiQuestPinKey='aqwc-pinned-wiki-quests-v1'"));
 const code=html.slice(html.indexOf('const wikiQuestPinKey='),html.indexOf('// Apply explicit popup checks'));
 const saved=[{name:'Example quest',source:'example-quest',completed:true}];
 const store={getItem:k=>{assert.equal(k,'aqwc-pinned-wiki-quests-v1');return JSON.stringify(saved)}};
 const calls=[];
 const loc={hash:'#aqwc-pinned-quests'};
 const api=vm.runInNewContext(code+'\n({readWikiQuestPins,openWikiQuestPins})',{localStorage:store,location:loc,selectTab:t=>calls.push(t),$:id=>id==='wiki-pinned-quests'?{scrollIntoView:()=>calls.push('scroll')}:null});
 assert.equal(JSON.stringify(api.readWikiQuestPins()),JSON.stringify(saved));
 api.openWikiQuestPins();
 assert.deepEqual(calls,['planner-pinned','scroll']);
 loc.hash='#aqwc-open-tracker';api.openWikiQuestPins();
 assert.equal(calls.length,2);
 console.log('Pinned quest navigation, legacy deep link and existing storage preserved.');
}

{
 const badgeCatalog=require('../js/badge-catalog.js'),badgeHunter=require('../js/badge-hunter.js');
 assert.equal(badgeCatalog.length,792);
 assert.equal(new Set(badgeCatalog.map(b=>b.id)).size,badgeCatalog.length);
 const categories={};for(const b of badgeCatalog){categories[b.category]=(categories[b.category]||0)+1;assert.match(b.id,/^cp-\d+$/);assert.equal(b.source,'https://aqwwiki.wikidot.com/charpage:'+b.id.slice(3));assert.match(b.image,/^https:\/\/(?:game\.aq\.com|www\.aq\.com|aq\.com|i\.imgur\.com)\//);assert.ok(['quest','seasonal','legacy','unknown','event'].includes(b.kind));if(b.join)assert.match(b.join,/^\/join [a-z0-9-]+$/);}
 assert.deepEqual(categories,{'Epic Hero':33,Legendary:60,Battle:87,Support:189,Exclusive:216,'Artix Entertainment':37,HeroMart:170});
 assert.equal(badgeCatalog.filter(b=>b.name==='Champion of Chaos').length,2);
 const harvest=badgeCatalog.find(b=>b.id==='cp-332');
 assert.equal(badgeHunter.availability(harvest,'2026-10-31'),'Announced');
 assert.equal(badgeHunter.availability(harvest,'2026-11-30'),'Within announced dates');
 assert.equal(badgeHunter.availability(harvest,'2026-12-01'),'Window ended');
 assert.equal(badgeHunter.availability(harvest,'2027-11-01'),'Window ended');
 assert.equal(badgeHunter.availability(badgeCatalog.find(b=>b.id==='cp-57'),'2026-09-19'),'Return unconfirmed');
 const owned=badgeHunter.update({},'cp-332','owned',badgeCatalog);
 assert.equal(badgeHunter.opportunities(badgeCatalog,owned,'2026-11-26').length,1);
 assert.equal(badgeHunter.opportunities(badgeCatalog,{},'2026-11-26').length,2);
 assert.equal(badgeHunter.availability(badgeCatalog.find(b=>b.id==='cp-787'),'2026-12-12'),'Window ended');
 assert.deepEqual(badgeHunter.clean({'cp-424':'tracked',unknown:'owned','cp-426':'bad'},badgeCatalog),{'cp-424':'tracked'});
 assert.deepEqual(badgeHunter.update({'cp-424':'owned'},'cp-424','unmarked',badgeCatalog),{});
 assert.ok(badgeHunter.filterBadges(badgeCatalog,{},'Fealty','all','all').some(b=>b.id==='cp-424'));
 assert.ok(html.includes('data-group="badges">🏆 Badge Hunter'));
 assert.ok(html.includes('data-tab="badge-hunter" data-parent="badges"'));
 assert.ok(html.includes('id="badge-hunter-home"'));
 assert.ok(html.includes('id="badge-hunter-availability"')&&html.includes('id="badge-hunter-more"'));
 assert.ok(html.includes("if(tab==='badge-hunter')window.AQWCBadgeHunter?.render?.()"));
 const hunterSource=fs.readFileSync(path.join(__dirname,'../js/badge-hunter.js'),'utf8');
 assert.ok(hunterSource.includes("img.loading='lazy'")&&hunterSource.includes("img.src=b.image")&&hunterSource.includes("result.slice(0,limit)"));
 assert.equal(badgeHunter.availability({kind:'unknown'},'2026-11-26'),'Availability unconfirmed');
 console.log('All seven badge index categories, exact source IDs, artwork URLs, filters and seasonal boundaries verified.');
}

{
 const all=require('../js/badge-catalog.js');
 assert.equal(all.filter(b=>b.requirements.length>0).length,784);
 assert.equal(all.filter(b=>!b.requirements.length).length,8);
 assert.equal(all.filter(b=>b.placeholder===true).length,2);
 assert.ok(all.every(b=>Array.isArray(b.tags)&&Array.isArray(b.requirements)&&Array.isArray(b.requirementLinks)));
 assert.ok(all.find(b=>b.id==='cp-424').requirementLinks.some(l=>l.label.includes('Legion Fealty 4')));
 console.log('Individual badge source requirements: 784/792; eight explicitly incomplete.');
}

{
 const bh=require('../js/badge-hunter.js'),all=require('../js/badge-catalog.js');
 const snapshot={character:'Example',capturedAt:'2026-11-26T09:00:00Z',badges:[{file:'charbadge-legionrevenant.jpg',label:'Legion Revenant'},{file:'chaos-champion.jpg',label:'Champion of Chaos'},{file:'unknown.jpg',label:''}]};
 const r=bh.matchCapture(snapshot,all);
 assert.ok(r.ids.includes('cp-424'));assert.ok(!r.ids.includes('cp-29')&&!r.ids.includes('cp-30'));assert.equal(r.ambiguous,1);assert.equal(r.unknown,1);
 assert.throws(()=>bh.matchCapture({...snapshot,badges:[]},all),/Invalid capture/);
 assert.ok(html.includes('id="badge-character-import"'));
}

// Information-integrity regressions: source-backed mechanics and unlock wording.
{
 assert.ok(!html.includes('Decay is ineffective.'));
 assert.ok(html.includes('Blood Frenzy’s 100,000 HP recovery'));
 assert.ok(html.includes('Stardust Breath, which ignores Focus'));
 assert.ok(html.includes('taunt redirects attacks, not Berserk itself'));
 assert.ok(html.includes("['Weapon','Smite','Level 60 · Blacksmithing Rank 6"));
 assert.ok(html.includes("['Weapon','Praxis','Level 60 · Blacksmithing Rank 6"));
 assert.ok(html.includes("['Weapon','Acheron','Level 80 · Blacksmithing Rank 8"));
 assert.ok(html.includes("['Helm','Hearty',"));
 console.log('Combat information integrity wording regressions checked.');
}

// Combat audit: preserve source-specific warnings and no score-driven team swapping.
{
 assert.deepEqual(Array.from(compact.ultraRecommendedTeam({id:'drakath',team:['Void Highlord','Lord of Order'],alternate:['Great Thief','Arcana Invoker']},profile)),['Void Highlord','Lord of Order']);
 const gaol=workbookApi.simplifiedExtraEncounters;
 assert.ok(gaol.find(x=>x.name==='Treasure Chest — second').tips.join(' ').includes('75% of maximum HP'));
 assert.ok(gaol.find(x=>x.name==='Reinforced Shelleton').tips.join(' ').includes('15% chance'));
 assert.ok(gaol.find(x=>x.name==='Rampaging Cyborg').tips.join(' ').includes('invulnerable until all three'));
 assert.ok(gaol.find(x=>x.name==='Mechabinky & Raxborg').tips.join(' ').includes('Devour was removed'));
 assert.equal(workbookApi.simplifiedSpeakerPatterns.length,6);
 assert.deepEqual(Array.from(workbookApi.simplifiedSpeakerPatterns,x=>x.roles.length),[20,20,20,20,31,30]);
}

// Consolidated guides: all 12 Ultras, independently scoped variants, all workbook encounter profiles.
{const src=html.slice(html.indexOf('const ultraGuides=['),html.indexOf('const ultraRolePlaybooks'));const teams=vm.runInNewContext(src+'\n ultraGuides');let total=0;
 for(const b of teams){const p=compact.simplifiedProfiles[b.id],vs=compact.ultraStrategyVariants(b,p);assert.ok(vs.length,b.id);total+=vs.length;const evidence=compact.approvedUltraGuides[b.id];assert.ok(['Quick','Strategy','Advanced'].includes(evidence.depth));assert.ok(evidence.shared.length);
  assert.equal(new Set(vs.map(v=>v.id)).size,vs.length);
  for(const v of vs){assert.equal(v.names.length,b.id==='kathool'?7:4,b.id);assert.ok(v.refs.length);assert.ok(v.refs.every(r=>r.length===2&&r[1].startsWith('https://')));for(const cls of Object.keys(v.roles))assert.ok(v.names.includes(cls),b.id+' '+cls);if(v.chart!==undefined){assert.equal(b.id,'speaker');assert.equal(v.chart,0);assert.ok(v.names.includes('Lord of Order')&&v.names.includes('ArchPaladin')&&v.names.includes('Legion Revenant'));}}
 }assert.equal(teams.length,12);assert.equal(total,35);
 for(const p of compact.simplifiedExtraEncounters){const guide=compact.approvedOtherBossGuides[p.name];assert.ok(guide,p.name);assert.ok(guide.tips.length);for(const cls of Object.keys(guide.roles))assert.ok(p.team?.some(x=>x.cls===cls),p.name+' '+cls);}
 assert.equal(Object.keys(compact.approvedOtherBossGuides).length,compact.simplifiedExtraEncounters.length);
 assert.equal(Object.keys(compact.approvedClassActivities).length,16);
 assert.ok(compact.approvedUltraGuides.drakath.shared.some(x=>x[1].includes('10M is a transformation')));
 assert.ok(compact.approvedUltraGuides.nulgath.avoid.includes('ignores taunt'));
 assert.ok(compact.approvedUltraGuides.gramiel.shared.some(x=>x[1].includes('70%, 40% and 10%')));assert.ok(compact.approvedUltraGuides.gramiel.shared.some(x=>x[1].includes('Do not apply Decay')));assert.ok(compact.approvedUltraGuides.darkon.shared.some(x=>x[1].includes('72 seconds')));
 console.log('Consolidated coverage: 12 Ultras, 35 strategy variants, '+compact.simplifiedExtraEncounters.length+' source-backed other encounter guides.');}

// Pre-merge documentary audit: exact chart rows, required prep, source ranges and solo options.
{const chart=compact.simplifiedSpeakerPatterns[0];const expected=[['Truth','LR',''],['Listen','LoO',''],['Zone 1','DPS',''],['Truth','AP','AP 4'],['Listen','LoO','LoO 5'],['Truth','',''],['Zone 2','LR',''],['Listen','',''],['Truth','','AP 4'],['Truth','LoO',''],['Listen','',''],['Zone 3','AP',''],['Truth','','AP 4'],['Listen','LR',''],['Truth','','LoO 5'],['Zone 4','LoO',''],['Listen','',''],['Truth','','AP 4'],['Truth','LR',''],['Listen','LoO','']];
 const events=vm.runInNewContext(html.slice(html.indexOf('const simplifiedSpeakerEvents='),html.indexOf('const simplifiedSpeakerPatterns='))+'\n simplifiedSpeakerEvents');
 assert.deepEqual(Array.from(events,(event,i)=>[event,chart.roles[i],chart.skills[i]||'']),expected);
 for(const [id,g] of Object.entries(compact.approvedUltraGuides)){assert.ok(g.access&&g.accessRef.startsWith('https://')&&g.auditNote,id);for(const v of g.variants){assert.ok(v.status&&Array.isArray(v.prep));if(['tyndarius','dage','drakath','nulgath','speaker','gramiel','darkon','kathool'].includes(id))assert.ok(v.prep.length,id);}}
 const other=compact.approvedOtherBossGuides;for(const p of compact.simplifiedExtraEncounters){assert.ok(compact.auditedBossSheetLocations[p.sheet]);assert.ok(other[p.name].access&&other[p.name].status)}
 assert.ok(other['Emperor Angler'].classes.includes('Verus DoomKnight')&&!other['Emperor Angler'].classes.includes('Lich'));
 assert.ok(other['Na\'al'].classes.includes('Legion Revenant'));
 assert.ok(other['Celestial Arena'].classes.includes('ArchFiend'));
 assert.ok(other['Temple Shrine — Middle'].access.includes('Rite of Ascension'));
 assert.ok(other['Grim Bomb'].access.includes('Level 80+'));
 assert.ok(compact.approvedUltraGuides.gramiel.variants[0].roles['Legion Revenant'].includes('StoneCrusher'));
 assert.ok(html.includes("chronoshadowslayer:'chronoshadowhunter'"));
 console.log('Pre-merge exact Speaker chart, role preparation, access requirements, and source options checked.');}

// Exact-name community candidates never invent a destination or treat acceptance as farm.
{const start=html.indexOf('function plannerObjectiveMapHints('),end=html.indexOf('function taskCard(',start);const hints=vm.runInNewContext(html.slice(start,end)+'\nplannerObjectiveMapHints');const lookup=n=>n==='Shadow Creeper'?[{join:'/join bludrut2',name:'Bludrut Keep 2'},{join:'/join bludrut2',name:'Duplicate'},{join:'/join bad map'}]:n==='Baby Trigoras'?[{join:'/join trigoras'}]:[];assert.deepEqual(Array.from(hints('Shadow Canvas ×5 — Shadow Creeper',lookup),x=>x.join),['/join bludrut2']);assert.equal(hints('Shadow Canvas ×5',lookup).length,0);assert.equal(hints('Shadow Canvas ×5 — Shadow Creeper (wrong variant)',lookup).length,0);assert.deepEqual(Array.from(hints('Dragon Heart ×1 — Baby Trigoras, Baby Trigoras',lookup),x=>x.join),['/join trigoras']);assert.equal(hints('Unknown',null).length,0);console.log('Quest target maps: exact-name candidates, safe commands, missing and duplicate targets.');}

// Every displayed slot switch must lead to one exact source lineup and preserve every other slot.
{let count=0;for(const id of Object.keys(compact.approvedUltraGuides)){const vs=compact.ultraStrategyVariants({id}),fs=compact.ultraTeamFamilies(id,vs);assert.equal(fs.flatMap(f=>f.variants).length,vs.length);for(const f of fs)for(const v of f.variants){count++;assert.deepEqual(Array.from(v.slots).sort(),Array.from(v.names).sort());for(const cls of new Set(v.names))for(let i=0;i<v.slots.length;i++)for(const next of compact.ultraSlotChoices(f,v,i,cls)){assert.ok(vs.some(x=>x.id===next.id));assert.ok(next.names.includes(cls));assert.ok(next.slots.every((n,j)=>j===i||n===v.slots[j]));}}}assert.equal(count,35);const w=compact.ultraTeamFamilies('warden',compact.ultraStrategyVariants({id:'warden'})).find(x=>x.id==='recovery-dps');const cw=w.variants.find(x=>x.id==='workbook');assert.ok(!compact.ultraSlotChoices(w,cw,2,'Lord of Order').some(x=>x.slots[2]==='ArchPaladin'));const ca=w.variants.find(x=>x.id==='hub');assert.ok(compact.ultraSlotChoices(w,ca,2,'Lord of Order').some(x=>x.slots[2]==='ArchPaladin'));console.log('Team builder: all exact lineups, no unsupported cross-product, dependent healer/DPS options checked.');}

{const d=html.slice(html.indexOf('function renderUltraDetail(b)'),html.indexOf("$('ultrasearch').addEventListener"));assert.ok(d.includes('family.variants.filter(t=>t.slots.every((n,i)=>i===index||n===v.slots[i]))'));assert.ok(d.includes("strategyStatic.hidden=families.length!==1"));assert.ok(d.includes("guide-v2-incompatible-option"));assert.ok(!d.includes("option.disabled=!compatible"));assert.ok(d.includes("strategyWarning.hidden=classInExampleTeam"));assert.ok(!d.includes("select.value=next.slots[index]"));assert.ok(d.includes("Incompatible with your class"));assert.ok(ultraCSS.includes(".guide-v2-owned-group"));assert.ok(ultraCSS.includes(".guide-v2-not-owned-group"));assert.ok(d.includes("focusCard('TEAM GOAL'"));assert.ok(d.includes("'TEAM PREPARATION'"));assert.ok(!d.includes('summary.append(access)'));}

// Boss quote coverage is explicit: exact quotes, uncertain community wording, or non-quote mechanic cues.
{const a=html.indexOf('const approvedOtherBossGuides='),b=html.indexOf('\n};',a)+2;const g=JSON.parse(html.slice(a+'const approvedOtherBossGuides='.length,b));assert.equal(Object.keys(g).length,29);for(const [name,x] of Object.entries(g)){assert.ok(Array.isArray(x.cues),name);assert.equal(x.cueCoverage,x.cues.length?'reviewed-cues':'no-specific-cue-confirmed',name);for(const c of x.cues){assert.ok(['quote','event','source-cue'].includes(c.type),name);assert.ok(c.signal&&c.action&&c.who&&c.when&&c.fail&&/^https:\/\//.test(c.source),name)}}assert.equal(g['Void Xyfrag'].cues[0].signal,'BLEEEEEEEEEEEECCH');assert.equal(g['Void NerfKitten'].cues[0].signal,'Meow');assert.ok(g['Astral Empyrean'].cues[0].action.includes('DO NOT TAUNT'));assert.equal(g['Astral Empyrean'].cues[1].type,'event');assert.ok(g['Temple Shrine — Middle'].cues.some(c=>c.type==='source-cue'));assert.ok(html.includes('appendBossReactionCues(sharedSteps,guide,entry.name)'));console.log('All 29 reviewed Other Boss Guides have explicit cue coverage; quote and action metadata checked.');}

// Consolidation: validate before writing, restore unique snapshots atomically,
 // preserve active selection, and skip unused hosted catalog downloads.
{const src=html.slice(html.indexOf('function validate(json)'),html.indexOf('async function refresh()'));
 const makeImport=(initial=[],fail=false,available=true)=>{
  let seq=0;const writes=[],state={snapshots:[...initial],current:null,window:{},STORE:'snapshots',crypto:{randomUUID:()=>String(++seq)},saveActiveSnapshotId:()=>{},saveInventoryRecoveryCopy:()=>{},updateInventoryStorageStatus:()=>{},inventoryStorageMode:'',inventoryStorageError:'',saveInventorySnapshot:async x=>{writes.push(x);state.snapshots.push(x)}};
  state.db=available?{transaction(){const staged=[];const tx={objectStore:()=>({add:x=>{staged.push(x);if(staged.length===1)queueMicrotask(()=>{if(fail){tx.error=Error('simulated quota');tx.onabort()}else{writes.push(...staged);tx.oncomplete()}})}})};return tx}}:null;
  return {writes,state,run:new Function('state','with(state){'+src+';return importFile;}')(state)};
 };
 const item={ID:'demo',Name:'Demo',Type:'Misc',Count:1},date='2026-01-01T00:00:00Z';
 const raw=(uid,Count=1)=>({uid,fileName:'Demo.json',exportedAt:date,items:[{...item,Count}]});
 const file=payload=>({size:100,name:'Demo.json',text:async()=>JSON.stringify(payload)});
 const backup=(snapshots,activeSnapshotUid)=>file({format:'AQW Companion backup v0.9.3',snapshots,activeSnapshotUid});
 const run=async()=>{
  const invalid=makeImport();await assert.rejects(invalid.run(backup([raw('a'),{items:[{Name:'Broken'}]}])),/invalid fields/);assert.equal(invalid.writes.length,0);
  const valid=makeImport();await valid.run(backup([raw('a'),raw('b',2)],'a'));assert.equal(valid.writes.length,2);assert.equal(valid.state.current.items[0].Count,1);
  await valid.run(backup([raw('a'),raw('b',2)],'b'));assert.equal(valid.writes.length,2);assert.equal(valid.state.current.items[0].Count,2);
  const duplicate=makeImport();await duplicate.run(backup([raw('a'),raw('b')],'b'));assert.equal(duplicate.writes.length,1);
  const historical=makeImport();await historical.run(backup([raw('a'),{...raw('b'),exportedAt:'2026-01-02T00:00:00Z'}]));assert.equal(historical.writes.length,2);
  const failed=makeImport([],true);await assert.rejects(failed.run(backup([raw('a'),raw('b',2)])),/quota/);assert.equal(failed.writes.length,0);assert.equal(failed.state.current,null);
  const unavailable=makeImport([],false,false);await assert.rejects(unavailable.run(backup([raw('a'),raw('b',2)])),/IndexedDB is required/);assert.equal(unavailable.writes.length,0);
  const normal=makeImport();await normal.run(file({items:[item]}));assert.equal(normal.writes.length,1);
  const body=html.slice(html.indexOf('async function loadPublicCatalog()'),html.indexOf("$('communityfiles').onchange"));
  let fetches=0;const env={location:{protocol:'https:'},communityItems:new Map([['x',{}]]),communityMeta:{__sourceType:'compiled-local'},fetch:async()=>{fetches++;return {ok:false}}};const load=new Function('env','with(env){'+body+';return loadPublicCatalog;}')(env);await load();assert.equal(fetches,0);env.communityMeta.__sourceType='hosted';await load();assert.equal(fetches,1);env.communityItems.clear();env.communityMeta.__sourceType='compiled-local';await load();assert.equal(fetches,2);
  console.log('Consolidation: backup preflight, deduplication, selected snapshot, batch failure, and local catalog guard passed.');
 };run().catch(e=>{console.error(e);process.exitCode=1});}

// Portable progress is typed, limited to public/local feature data, and does not touch unrelated keys.
{const api=require('../js/portable-progress.js'),account=require('../js/account-progress.js'),badge=require('../js/badge-hunter.js'),stack=require('../js/stack-alerts.js');
 const catalog=[{id:'b1'},{id:'b2'}],stamp='2026-01-01T00:00:00Z';
 const deps={badgeCatalog:catalog,badgeClean:badge.clean,accountClean:account.clean,normalize:stack.normalize,validCap:stack.validCap,forgeIds:['weapon:forge'],publicClean:v=>{if(v.source!=='character-page')throw Error('bad public');return v}};
 const sample={forge:['weapon:forge'],badges:{b1:'owned'},badgeCapture:{character:'Demo',capturedAt:stamp,ids:['b1'],storyGroups:[],ambiguous:0,unknown:0,discovery:{newIds:null,latestIds:[],latestAt:null}},accountProgress:{sagas:{section:'sagas',capturedAt:stamp,rows:[{name:'Prologue',state:'colored'}]}},stackCaps:{'void aura':800},publicInventory:{character:'Demo',source:'character-page'},theme:'dark'};
 const store=new Map([['unrelated-consent','keep']]);const storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 const clean=api.clean(sample,deps);api.apply(storage,clean);assert.deepEqual(api.collect(storage,deps),clean);assert.equal(store.get('unrelated-consent'),'keep');
 assert.throws(()=>api.clean({...sample,credentials:'no'},deps),/Invalid backup progress/);
 assert.throws(()=>api.clean({...sample,forge:['unknown']},deps),/Invalid backup progress/);
 assert.throws(()=>api.clean({...sample,badges:{b3:'owned'}},deps),/Invalid backup progress/);
 assert.throws(()=>api.clean({...sample,badgeCapture:{...sample.badgeCapture,ids:['b2'],discovery:{newIds:['b1'],latestIds:[],latestAt:null}}},deps),/Invalid backup progress/);
 assert.throws(()=>api.clean({...sample,publicInventory:{...sample.publicInventory,character:'Other'}},deps),/different captured characters/);
 assert.throws(()=>api.clean({...sample,accountProgress:{sagas:{section:'sagas',capturedAt:stamp,rows:[{name:'Prologue',state:'invented'}]}}},deps),/Invalid/);
 api.apply(storage,api.clean({theme:'light'},deps));assert.equal(store.get(api.keys.theme),'light');assert.equal(store.get(api.keys.forge),'["weapon:forge"]');
 const before=new Map(store);const badStorage={...storage,setItem:(k,v)=>{if(k===api.keys.theme)throw Error('quota');storage.setItem(k,v)}};
 assert.throws(()=>api.apply(badStorage,api.clean({forge:[],theme:'dark'},deps)),/rolled back/);assert.deepEqual(store,before);
 console.log('Portable progress: validation, explicit keys, partial restore and rollback passed.');}

// Ordered dependency graph and VDK canonical alias, source quantities, non-destructive migration.
{const dep=require('../js/quest-dependencies.js');assert.ok(dep.matches('Verus DoomKnight (Class)'));assert.equal(dep.recipe('Verus DoomKnight (Class)').name,'Verus DoomKnight');assert.equal(dep.stages.length,8);assert.equal(dep.stages[5].rows[1].count,3);assert.deepEqual(dep.stages[7].rows.map(r=>r.count),[1000000,1000000,1000000,100000]);assert.equal(dep.stages[3].reputation,'Evil Rank 10');
 const p={name:'Verus DoomKnight (Class)',type:'Class',steps:[{id:'old',kind:'owned',item:'Verus DoomKnight (Class)',label:'Own Verus DoomKnight (Class)',status:'unknown'},{id:'custom',kind:'manual',label:'Custom',status:'done'}]};let i=0;const fresh=s=>({...s,id:'new'+(++i),status:'unknown'});assert.ok(dep.upgrade(p,fresh));assert.equal(p.name,'Verus DoomKnight');assert.ok(p.steps.some(s=>s.id==='custom'&&s.status==='done'));assert.ok(p.steps.some(s=>s.id==='old'));assert.equal(dep.upgrade(p,fresh),false);
 let evaluated=dep.evaluate(dep.stages,{},()=>0);assert.equal(evaluated[0].state,'unknown');assert.equal(evaluated[1].state,'blocked');assert.equal(evaluated[0].rows[0].missing,13);assert.equal(dep.evaluate(dep.stages,{},null)[0].rows[0].missing,null);
 evaluated=dep.evaluate(dep.stages,{body:'done'},()=>0);assert.equal(evaluated[0].rows.length,0);assert.equal(evaluated[1].state,'unknown');assert.equal(dep.evaluate(dep.stages,{},()=>1000000)[0].state,'unknown');assert.throws(()=>dep.validateGraph([{id:'a',requires:['b']}]),/Unknown dependency/);assert.throws(()=>dep.validateGraph([{id:'a',requires:['b']},{id:'b',requires:['a']}]),/Cyclic/);
 console.log('VDK dependency graph, alias, migration and turn-in evidence passed.');}

// Typed recipe requirements and allocation over shared acyclic branches.
{const api=require('../js/merge-dependencies.js'),integrity=require('../js/recipe-integrity.js');
 const vhl=api.describe('Void Highlord (Class)',integrity);assert.ok(vhl);assert.equal(vhl.rows.length,3);assert.ok(vhl.rows.every(r=>r.kind==='consume'));assert.equal(vhl.rows[1].count,1);
 const drakath=api.describe('Drakath the Eternal',integrity);assert.equal(drakath.rows.filter(r=>r.kind==='possess').length,2);assert.equal(drakath.rows.filter(r=>r.kind==='consume').length,5);assert.equal(api.direct(vhl,null)[0].missing,null);assert.equal(api.describe('unknown item',integrity),null);
 const route=api.selectedRoute(vhl,integrity);const stock=n=>api.key(n)==='void crystal a'?1:0;
 const p=api.plan(vhl,route,stock);assert.equal(p.outputs.find(r=>r.item==='Void Crystal A').batches,0);assert.equal(p.outputs.find(r=>r.item==='Void Crystal B').batches,1);assert.ok(!p.leaves.some(r=>r.item==='Unidentified 10'));assert.equal(p.leaves.find(r=>r.item==='Elder\'s Blood').missing,2);
 const row=(item,count,kind='consume')=>({item,count,kind}),r={name:'target',kind:'merge',rows:[row('A',1),row('B',1)]};
 const recipes={a:{name:'A',yield:1,rows:[row('C',2)]},b:{name:'B',yield:1,rows:[row('C',3)]},c:{name:'C',yield:2,rows:[row('Ore',5),row('Tool',1,'possess')]}};
 const shared=api.plan(r,recipes,n=>api.key(n)==='c'?1:0);assert.equal(shared.outputs.find(x=>x.item==='C').batches,2);assert.equal(shared.leaves.find(x=>x.item==='Ore').count,10);assert.equal(shared.possession[0].count,1);
 const overlap=api.plan({name:'target',rows:[row('Tool',1),row('Tool',1,'possess')]},{},()=>1);assert.equal(overlap.possession[0].overlap,true);
 assert.throws(()=>api.plan(r,{a:{name:'A',yield:1,rows:[row('A',1)]}},()=>0),/Cyclic/);assert.throws(()=>api.plan(r,{a:{name:'A',rows:[row('C',1)]}},()=>0),/Unknown recipe yield/);assert.equal(api.plan(r,recipes,null),null);
 console.log('Merge dependencies: consumption, gates, owned intermediate stock, shared branches, yield and cycle checks passed.');}

// Cross-goal direct requirements: one stock allocation, alias deduplication, unknown stock, possession and conflicts.
{const api=require('../js/merge-dependencies.js'),integrity=require('../js/recipe-integrity.js');
 const vhl=api.describe('Void Highlord',integrity),nsoa=api.describe('Necrotic Sword of the Abyss',integrity);
 let calls=0;const result=api.combine([vhl,nsoa,vhl],name=>{if(api.key(name)==='roentgenium of nulgath'){calls++;return 10}return api.key(name)==='void crystal a'?1:0});
 assert.equal(result.goals.length,2);assert.equal(calls,1);
 const roent=result.rows.find(r=>api.key(r.item)==='roentgenium of nulgath');assert.equal(roent.count,17);assert.equal(roent.missing,7);assert.equal(roent.goals.length,2);
 assert.equal(result.rows.find(r=>api.key(r.item)==='void crystal a').missing,1);assert.equal(api.combine([vhl],null).rows[0].missing,null);
 const row=(item,count,kind)=>({item,count,kind}),a={name:'A',kind:'merge',rows:[row('B',1,'consume'),row('Tool',1,'possess')]},b={name:'B',kind:'quest',rows:[row('Tool',2,'possess'),row('Tool',1,'consume')]};
 const shared=api.combine([a,b],()=>2);assert.equal(shared.possession[0].count,2);assert.equal(shared.possession[0].overlap,true);assert.equal(shared.rows.find(r=>r.item==='B').outputConflict,true);
 assert.equal(api.combine([],()=>0).rows.length,0);assert.throws(()=>api.combine([null],()=>0),/Unreviewed/);
 console.log('Shared Wishlist: combined demand, single stock deduction, separate gates, conflicts and unknown stock passed.');}

 
// What's Next: reviewed routes, selected stock, unknown gates and manual stage evidence.
{const api=require('../js/merge-dependencies.js'),quest=require('../js/quest-dependencies.js'),integrity=require('../js/recipe-integrity.js');
 const vhl={id:'v',name:'Void Highlord',steps:[]},vdk={id:'d',name:'Verus DoomKnight',steps:[]};
 const rec=(p,stock)=>api.recommend(p,{quest,integrity,stock});
 const read=api.stockIndex([{Name:'Void Crystal A',Count:1},{Name:'Void Crystal A',Count:2},{Name:'Roentgenium of Nulgath',Count:15},{Name:'Void Crystal B',Count:1}]);
 assert.equal(read('Void Crystal A'),3);assert.equal(rec(vhl,read).state,'Direct stock available');
 assert.equal(rec(vhl,null).state,'Stock unknown');assert.equal(rec(vhl,()=>0).item,'Roentgenium of Nulgath');
 assert.equal(rec(vdk,()=>0).join,'/join underrealm');assert.ok(rec(vdk,()=>0).detail.includes('Body, Soul'));
 assert.equal(rec(vdk,()=>1000000).state,'Turn-in stock available');
 assert.ok(rec(vdk,()=>1000000).note.includes('Confirm quest access'));
 const completed={...vdk,steps:quest.labels.map(label=>({kind:'manual',label,status:'done'}))};
 assert.equal(rec(completed,()=>0).state,'Verify claim');
 const firstDone={...vdk,steps:[{kind:'manual',label:quest.labels[0],status:'done'}]};assert.ok(rec(firstDone,()=>0).detail.includes('Of the Same Cloak'));
 assert.equal(rec({name:'Not a reviewed route'},()=>0).state,'Pending review');
 assert.equal(api.stockIndex([{Name:'Bad',Count:'bad'}])('Bad'),null);
 assert.equal(api.stockIndex([{Name:'Bad',Count:null}])('Bad'),null);
 assert.equal(api.rankRecommendations([{project:vdk,recommendation:rec(vdk,()=>0)},{project:vhl,recommendation:rec(vhl,read)}])[0].project.id,'v');
 assert.equal(rec({name:'Drakath the Eternal'},()=>0).state,'Possession gate missing');
 console.log("What's Next: reviewed routes, stock coverage, manual quest stages, gates, unknowns and ranking passed.");}


// Recurring opportunities require exact quantified catalog rewards and known missing stock.
{const api=require('../js/merge-dependencies.js'),integrity=require('../js/recipe-integrity.js');
 const project={name:'Sin of the Abyss',steps:[]},recommendation=api.recommend(project,{integrity,stock:()=>0});
 const rows=[{project,recommendation},{project:{name:'Other'},recommendation:{needs:[{item:'Nulgath Insignia',missing:2}]}}];
 const task=(id,reward,extra={})=>({id,name:id,freq:'weekly',wiki:'https://aqwwiki.wikidot.com/nulgath-s-quests',rewards:[reward],...extra});
 const options={isRecurring:t=>t.id!=='retired',isDone:t=>t.id==='done',isBlocked:t=>t.id==='conflict',isPinned:id=>id==='weekly',canonicalId:id=>id==='alias'?'weekly':id};
 const candidates=[task('weekly','Nulgath Insignia ×5'),task('alias','Nulgath Insignia ×5'),task('daily','Tainted Gem ×1',{freq:'daily'}),task('done','Nulgath Insignia ×5'),task('conflict','Nulgath Insignia ×5'),task('retired','Nulgath Insignia ×5'),task('wrong','Nulgath Insignia Fragment ×5'),task('random','Nulgath Insignia ×5 (random)'),task('bare','Nulgath Insignia'),task('activity','Nulgath Insignia ×5',{kind:'activity'}),task('unsourced','Nulgath Insignia ×5',{wiki:''})];
 const result=api.recurringOpportunities(rows,candidates,options);
 assert.deepEqual(result.map(r=>r.id),['daily','weekly']);assert.equal(result[1].matches[0].goals.length,2);assert.equal(result[1].pinned,true);
 assert.equal(api.recurringOpportunities([{project,recommendation:api.recommend(project,{integrity,stock:null})}],candidates,options).length,0);
 assert.equal(api.recurringOpportunities([],candidates,options).length,0);
 console.log("What's Next routines: exact rewards, known shortages, aliases, completed/conflicting quests and source guard passed.");}
