"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const css=fs.readFileSync(path.join(__dirname,"../css/analytics-consent.css"),"utf8");
const analytics=fs.readFileSync(path.join(__dirname,"../js/analytics-consent.js"),"utf8");

const noticeStart=html.indexOf('<div class="notice"><strong>🔒 Your game data stays in this browser.');
assert.ok(noticeStart>=0,"Local data notice remains visible");
const notice=html.slice(noticeStart,html.indexOf("</div>",noticeStart));
assert.ok(notice.includes("Inventory, Wishlist and progress are stored locally."));
assert.ok(!/Google Analytics|Backups|Use <b>Backup|Review your export/i.test(notice),"Top notice should be short and not discuss Analytics or backup");
assert.ok(notice.includes('id="aqw-analytics-settings"'),"Consent preferences remain accessible");
assert.ok(html.includes('id="aqw-analytics-banner"'));
assert.ok(html.includes('id="aqw-analytics-accept"')&&html.includes('id="aqw-analytics-reject"'));
assert.ok(html.includes('src="js/analytics-consent.js"'));
assert.ok(analytics.includes("G-JF725WDHV1"),"Measurement ID is unchanged");
assert.ok(css.includes("width:min(550px"),"Consent popup should be compact");
assert.ok(css.includes("right:12px;left:auto"),"Consent popup should be in the bottom-right corner");
assert.ok(css.includes("min-height:36px"),"Consent controls must remain accessible");
assert.ok(css.includes("#aqw-analytics-banner[hidden]"),"Hidden state still works");

const menu=html.match(/<select id="discoveryfilter">([\s\S]*?)<\/select>/);
assert.ok(menu,"Explore category selector exists");
for(const [value,label] of [["all","All types"],["Class","Classes"],["Weapon","Weapons"],
["Armor","Armors"],["Helm","Helms"],["Cape","Capes"],["Other","Misc"]]){
 assert.ok(menu[1].includes('<option value="'+value+'">'+label+'</option>'),"Missing explore option: "+label);
}
assert.ok(!menu[1].includes('>Other</option>'),"Visible menu label should use Misc");
assert.ok(html.includes("if(q||filter==='Helm'||filter==='Cape'||filter==='Other')"),
 "Helm/Cape/Misc can browse items without a typed search");
assert.ok(html.includes("itemTypeGroup(x.type)===filter"),
 "Explore filter must use normalized types");
assert.ok(html.includes(".slice(0,80);$('discoverytitle')"),
 "Filter before limiting results, so new types cannot be truncated away");
assert.ok(html.includes("itemTypeNode(project.type)"),"Wishlist cards use shared Explore icons");
assert.ok(html.includes("itemTypeNode(candidate.type)"),"Wishlist suggestions use shared Explore icons");
assert.ok(html.includes("itemTypeLabel(project.type)"),"Wishlist headings use matching type labels");
assert.ok(html.includes("<option>Helm</option><option>Cape</option>"),
 "Wishlist can preserve new equipment types");

const helperStart=html.indexOf("function itemTypeGroup(");
const helperEnd=html.indexOf("function renderDiscover()",helperStart);
assert.ok(helperStart>0&&helperEnd>helperStart);
const classSvg=fs.readFileSync(path.join(__dirname,"../assets/class-armor-icon.svg"),"utf8");
assert.ok(classSvg.includes('viewBox="0 0 96 96"'),"Class icon scales cleanly to high-DPI screens");
assert.ok(classSvg.includes('<radialGradient')&&classSvg.includes('<linearGradient'),"Class icon uses layered vector detail");
assert.ok((classSvg.match(/<path\b/g)||[]).length>=10,"Class armor has detailed vector elements");
assert.ok(!classSvg.includes('href="http'),"Class asset must not fetch remote images");
const context=vm.createContext({
 document:{createElement(tag){return {tagName:tag.toUpperCase(),src:"",alt:"",className:"",width:0,height:0}}},
 node(tag,body,className){return {tagName:tag.toUpperCase(),textContent:body,className}}
});
vm.runInContext(html.slice(helperStart,helperEnd),context,{timeout:2000});
for(const [raw,expected,icon] of [
 ["Class","Class","⚔️"],["Sword","Weapon","🗡️"],
 ["Weapon","Weapon","🗡️"],["Armor","Armor","🛡️"],
 ["Helm","Helm","🪖"],["Helmet","Helm","🪖"],["Cape","Cape","🦸"],
 ["Other","Other","📦"],["Misc","Other","📦"],["Pet","Other","🐾"],
 ["House Item","Other","🏠"]
]){
 assert.equal(context.itemTypeGroup(raw),expected,"Type category mismatch for "+raw);
 assert.equal(context.itemTypeIcon(raw),icon,"Type icon mismatch for "+raw);
}
const clazz=context.itemTypeNode("Class");
assert.equal(clazz.tagName,"IMG","Class displays high-definition armor icon");
assert.equal(clazz.src,"assets/class-armor-icon.svg");
assert.equal(clazz.alt,"Class");
assert.equal(clazz.width,24);
assert.equal(clazz.height,24);
assert.ok(clazz.className.includes("class-item-icon"));
assert.equal(context.itemTypeIcon("Class"),"⚔️","Keep safe emoji fallback");
const cape=context.itemTypeNode("Cape");
assert.equal(cape.tagName,"IMG","Cape displays a real illustration instead of a jacket emoji");
assert.equal(cape.src,"assets/cape-icon.svg");
assert.equal(cape.alt,"Cape");
assert.equal(cape.width,24);
assert.equal(cape.height,24);
assert.ok(cape.className.includes("cape-item-icon"));
const armor=context.itemTypeNode("Armor");
assert.equal(armor.tagName,"SPAN");
assert.equal(armor.textContent,"🛡️");
assert.equal(context.itemTypeLabel("Other"),"Misc");
assert.equal(context.itemTypeLabel("Misc"),"Misc");
assert.equal(context.itemTypeLabel("Cape"),"Cape");

const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
for(const [i,m] of scripts.entries())if(!m[1].includes("src=")&&m[2].trim())new vm.Script(m[2],{filename:"index-inline-"+i});
console.log("Item type icons including high-definition class armor plus privacy regression passed");
