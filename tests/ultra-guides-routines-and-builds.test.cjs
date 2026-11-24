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
assert.ok(html.includes('href="css/planner-routines.css?v=99"'));
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
