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
assert.ok(html.includes("General group preset — adapt to this fight."));
assert.ok(html.includes("ultraReviewedSources[b.id]||[]"));
for(const rows of Object.values(reviewedApi.ultraReviewedSources))for(const [,url] of rows)assert.ok(url.startsWith("https://"));

const workbookApi=vm.runInNewContext(reviewedCode+"\n({simplifiedProfiles,simplifiedRatings,simplifiedRatingRoles,simplifiedRoleRatings,simplifiedSpeakerEvents,simplifiedSpeakerPatterns,simplifiedExtraEncounters})");
assert.equal(Object.keys(workbookApi.simplifiedProfiles).length,12,"Every current detailed encounter has a workbook strategy");
assert.equal(Object.keys(workbookApi.simplifiedRatings).length,22,"All group-boss rating blocks in visible guide sheets");
assert.equal(workbookApi.simplifiedExtraEncounters.length,28,"Additional group and solo guide cards");
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

const compact=vm.runInNewContext(reviewedCode+"\n({ultraClassOptions,ultraSelectedRating,ultraWorkbookBuild,ultraCompactTips,ultraActionTips,simplifiedProfiles,simplifiedRatings,simplifiedExtraEncounters,sameUltraClass,fillUltraClassSelect,renderUltraSelectedRating,appendUltraGearCells})",{
 node(tag,text,cls){return {tag,text,cls,children:[],append(...x){this.children.push(...x)},replaceChildren(...x){this.children=x}}},
 Option:function(label,value){this.label=label;this.value=value},
 ultraOwned:cls=>['Lord of Order','Void Highlord'].includes(cls)
});
const profile=compact.simplifiedProfiles.drakath;
const groups=compact.ultraClassOptions("drakath",profile,["Void Highlord","Lord of Order","StoneCrusher"]);
const names=groups.flatMap(g=>g.names);
assert.ok(names.includes("Paladin Chronomancer"),"Workbook team class appears in Your loadout");
assert.ok(names.includes("Chrono ShadowHunter"),"Workbook DPS class appears in Your loadout");
assert.ok(!names.includes("Void Highlord"),"Rated 3/5 must be excluded, including existing guide classes");
assert.equal(names.filter(x=>compact.sameUltraClass(x,"Void HighLord")).length,0,"Excluded aliases must not reappear");
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
for(const [key,p] of Object.entries(compact.simplifiedProfiles)){const groups=compact.ultraClassOptions(key,p);const classes=groups.flatMap(x=>x.names);assert.ok(classes.length,key);assert.ok(classes.every(n=>{const s=compact.ultraSelectedRating(key,n);return !s||[2,4,5].includes(s.rating)}),key);for(const group of groups){const scores=group.names.map(n=>compact.ultraSelectedRating(key,n)?.rating??-1);assert.ok(scores.every((s,i)=>i===0||scores[i-1]>=s),key+" sorted");}for(const cls of classes)assert.ok(compact.ultraActionTips(key,cls,[]).length>=2,key+" / "+cls+" has real mechanics");}
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
assert.ok(html.includes("const build=workbook||encounter||generic"));
assert.ok(html.includes("renderUltraSelectedRating(rating,b.id,cls)"));
assert.ok(html.includes("const tips=ultraActionTips(b.id,cls,baseTips)"));
assert.ok(html.includes("if(b.id==='speaker')appendSpeakerRotations(inner)"));
assert.ok(!html.includes("Community workbook — suggested strategy"));
assert.ok(!html.includes("Class suitability by role (community ratings)"));
assert.ok(ultraCSS.includes(".ultra-selected-rating"));
console.log("Compact loadout selector: class options, per-boss ratings, source loadouts, targeted tips and rotation retention passed.");

assert.equal(groups[0].label,"✓ OWNED CLASSES");
assert.ok(groups[0].names.every(n=>n==="Lord of Order"||n==="Void Highlord"));
assert.ok(groups.slice(1).every(g=>g.owned===false));
assert.ok(select.children[0].children.every(o=>o.label.startsWith("✓ OWNED · ")));
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
