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
assert.ok(html.includes("AQWCGuideRows?.rows({tips,quotes:callouts"),"New unified class-specific role rows");
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
assert.ok(html.includes('href="css/planner-routines.css?v=100"'));
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
assert.ok(html.includes('toggleTask(t,false)'));
assert.ok(html.includes("['Completed',true]"));
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
assert.ok(html.includes("for(const [label,description] of b.phases||[])"),"Render existing fight phases");
assert.ok(html.includes("General setup; adjust for this fight."));
assert.ok(html.includes("ultraReviewedSources[b.id]||[]"));
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

const compact=vm.runInNewContext(reviewedCode+"\n({ultraClassOptions,ultraSelectedRating,ultraWorkbookBuild,ultraCompactTips,ultraActionTips,ultraBeginnerActions,ultraBeginnerText,ultraGlossary,ultraTermPattern,simplifiedProfiles,simplifiedRatings,simplifiedExtraEncounters,sameUltraClass,fillUltraClassSelect,renderUltraSelectedRating,appendUltraGearCells})",{
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
assert.ok(html.includes("const baseBuild=workbook||encounter||generic"));
assert.ok(html.includes("renderUltraSelectedRating(rating,b.id,cls)"));
assert.ok(html.includes("const tips=ultraBeginnerActions(b.id,cls,ultraActionTips(b.id,cls,baseTips))"));
assert.ok(html.includes("if(b.id==='speaker')appendSpeakerRotations(inner)"));
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
assert.equal(active.length,160);
assert.equal(active.filter(t=>t.freq==="daily").length,143);
assert.equal(active.filter(t=>t.freq==="weekly").length,17);
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
assert.ok(html.includes("consumable:'Vigil'"));
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
assert.ok(html.includes("ultraExplainText(description,part.text)"));
assert.ok(html.includes("img.referrerPolicy='no-referrer'"));
assert.ok(ultraCSS.includes(".ultra-help-term:focus>.ultra-help-popup"));
assert.ok(!html.includes("Workbook loadout · agree your party strategy."));
console.log("Beginner tips: rating 3–5, exact sword timing, skill names, glossary and icon reference.");
