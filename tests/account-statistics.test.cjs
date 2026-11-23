"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const api=require("../js/account-statistics.js");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const css=fs.readFileSync(path.join(__dirname,"../css/account-statistics.css"),"utf8");
const js=fs.readFileSync(path.join(__dirname,"../js/account-statistics.js"),"utf8");

const mainNav=html.match(/<nav class="primarynav"[\s\S]*?<\/nav>/)?.[0]||"";
assert.ok(mainNav.includes('data-group="home"'),"Home main tab remains");
const homeTabs=[...html.matchAll(/data-tab="(overview|account-stats)" data-parent="home"/g)].map(x=>x[1]);
assert.deepEqual(homeTabs,["overview","account-stats"],"Home has Overview and Account Statistics secondary tabs");
const navCss=html.match(/<style id="aqw-feedback-nav-v2">([\s\S]*?)<\/style>/)?.[1];
assert.ok(navCss,"Custom navigation CSS must be present");
assert.ok(!navCss.includes('.subnav button[data-parent="home"]'),"Home secondary buttons must never be forcibly hidden");
assert.ok(!navCss.includes(':not([data-parent="home"])'),"Home must not be excluded from secondary nav visibility");
assert.ok(navCss.includes('button.group-visible:not([data-parent="story"])'),"Visible Home group must open subnav");
assert.ok(html.includes('.tabs.subnav button.group-visible{display:inline-flex}'),"Active group navigation buttons remain visible");

assert.ok(html.includes('<section id="account-stats" class="view">'));
assert.ok(html.includes('href="css/account-statistics.css"'));
assert.ok(html.includes('src="js/account-statistics.js"'));
assert.ok(html.includes("if(tab==='account-stats')renderAccountStatistics()"),"Statistics should refresh when selected");
assert.ok(html.includes("current,snapshots,projects"),"Runtime must use real browser state");
assert.ok(html.includes("metadataLookup:name=>communityItems.get(communityKey(name))"),"Rarity data is community metadata");
assert.ok(html.includes("forgeUnlocked:forgeUnlocked.size"),"Forge count is manual tracker state");
assert.ok(html.includes("renderAll()"),"Existing dashboard is preserved");
assert.ok(css.includes("@media(max-width:520px)"),"Dashboard must be responsive");
assert.ok(!/\bfetch\s*\(|\bXMLHttpRequest\b|\bsendBeacon\s*\(|\bgtag\s*\(/i.test(js),"Statistics module cannot transmit account data");
new vm.Script(js,{filename:"account-statistics.js"});
for(const [i,m] of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].entries())
  if(!m[0].includes("src=")&&m[1].trim())new vm.Script(m[1],{filename:"index-inline-"+i});

function item(ID,Name,Type,Bank=0,Count=1){return {ID:String(ID),Name,Type,Bank,Count};}
function snapshot(uid,exportedAt,items){return {uid,fileName:uid+".json",exportedAt,importedAt:exportedAt,items};}
const old=snapshot("old","2026-11-01T09:00:00Z",[
 item(10,"Highlord","Class",0),item(10,"Highlord","Class",1),
 item(11,"Golden Sword","Sword"),item(12,"Cape of Dawn","Cape",1)
]);
const recent=snapshot("new","2026-11-21T09:00:00Z",[
 item(10,"Highlord","Class",1),item(12,"Cape of Dawn","Cape",1),
 item(13,"Horned Helmet","Helmet"),item(14,"Silver Armor","Armor"),
 item(15,"Pet","Pet")
]);
const before=JSON.stringify({old,recent});
const snapshots=[recent,old]; // deliberately unordered
const projects=[
 {name:"Highlord",type:"Class",owned:true,steps:2,stepsDone:2},
 {name:"Horned Helmet",type:"Helm",owned:false,steps:5,stepsDone:1},
 {name:"Void Saga",type:"Saga",owned:false,steps:0,stepsDone:0}
];
const tags=new Map([
 ["Highlord",{flags:["Rare","AC","Rare"]}],
 ["Cape of Dawn",{flags:["Seasonal"]}],
 ["Horned Helmet",{flags:[]}]
]);
const data=api.analyze({
 current:recent,snapshots,projects,forgeUnlocked:3,forgeTotal:21,
 metadataLookup:name=>tags.get(name)
});
assert.equal(JSON.stringify({old,recent}),before,"Analysis must not mutate input inventories");
assert.equal(data.available,true);
assert.equal(data.uniqueIds,5);
assert.equal(data.recordCount,5);
assert.equal(data.bankRecords,2);
assert.equal(data.elsewhereRecords,3);
assert.equal(data.classes,1);
assert.deepEqual(data.categories.map(c=>[c.type,c.count]),[
 ["Class",1],["Weapon",0],["Armor",1],["Helm",1],["Cape",1],["Misc",1]
]);
assert.equal(data.totalSnapshots,2);
assert.equal(data.history[0].name,"old.json");
assert.equal(data.history[0].total,3,"Bank and outside-bank duplicates count as ONE unique item ID");
assert.equal(data.history[1].total,5);
assert.equal(data.history[1].firstSeen,3);
assert.equal(data.history[1].noLongerPresent,1);
assert.deepEqual(data.latestChange.firstSeenItems.map(x=>x.name),["Horned Helmet","Silver Armor","Pet"]);
assert.equal(data.latestChange.firstSeen,3);
assert.equal(data.latestChange.noLongerPresent,1);
assert.equal(data.wishlist.total,3);
assert.equal(data.wishlist.owned,1);
assert.equal(data.wishlist.active,2);
assert.equal(data.wishlist.stepsTotal,7);
assert.equal(data.wishlist.stepsDone,3);
assert.equal(data.communityTags.tagged,2);
assert.equal(data.communityTags.unknown,3,"Missing tag is UNKNOWN, not Common");
assert.deepEqual(data.communityTags.counts.map(x=>[x.name,x.count]),[["Rare",1],["AC",1],["Seasonal",1]]);
assert.equal(data.forge.unlocked,3);
assert.equal(data.forge.total,21);
assert.ok(data.milestones.some(m=>m.id==="import"&&m.unlocked));
assert.ok(data.milestones.some(m=>m.id==="class25"&&!m.unlocked));

const historySelected=api.analyze({current:old,snapshots:[recent,old],projects:[]});
assert.equal(historySelected.uniqueIds,3,"Current metrics must follow selected snapshot, not latest saved snapshot");
assert.equal(historySelected.history.at(-1).total,5,"Timeline still covers all snapshots");
assert.equal(historySelected.wishlist.total,0);
const one=api.analyze({current:old,snapshots:[old],projects:[]});
assert.equal(one.history.length,1);
assert.equal(one.latestChange,null);
const empty=api.analyze({current:null,snapshots:[],projects:[],forgeTotal:0});
assert.equal(empty.available,false);
assert.equal(empty.uniqueIds,0);
assert.equal(empty.latestChange,null);
assert.equal(empty.milestones.find(m=>m.id==="import").unlocked,false);
assert.equal(api.category("Bow"),"Weapon");
assert.equal(api.category("Helmet"),"Helm");
assert.equal(api.category("Cape"),"Cape");
assert.equal(api.category("Other"),"Misc");

// DOM smoke test: render with only local DOM primitives, no HTML injection.
function fake(tag){
 return {
  tagName:tag.toUpperCase(),className:"",textContent:"",style:{},children:[],attrs:{},listeners:{},
  append(...nodes){this.children.push(...nodes)},
  replaceChildren(...nodes){this.children=[...nodes]},
  addEventListener(type,fn){this.listeners[type]=fn},
  setAttribute(name,value){this.attrs[name]=value}
 };
}
global.document={createElement:fake,createElementNS:(ns,tag)=>fake(tag)};
const root=fake("section");
let opened=false;
api.render(root,empty,{onImport:()=>{opened=true}});
assert.ok(root.children.length>=2);
function flatten(e){return [e,...(e.children||[]).flatMap(flatten)]}
const emptyButtons=flatten(root).filter(e=>e.tagName==="BUTTON");
assert.equal(emptyButtons.length,1);
emptyButtons[0].listeners.click();
assert.equal(opened,true);
let historyClicked=false,wishlistClicked=false;
api.render(root,data,{onHistory:()=>{historyClicked=true},onWishlist:()=>{wishlistClicked=true}});
const all=flatten(root);
const byText=text=>all.find(x=>x.tagName==="BUTTON"&&x.textContent===text);
assert.ok(byText("Open snapshot history ↗"),"History button must be present");
assert.ok(byText("Open Wishlist ↗"),"Wishlist button must be present");
byText("Open snapshot history ↗").listeners.click();
byText("Open Wishlist ↗").listeners.click();
assert.ok(historyClicked&&wishlistClicked);
assert.ok(all.some(x=>x.tagName==="SVG"),"Growth chart is drawn without chart dependencies");
assert.ok(all.some(x=>x.tagName==="TABLE"),"Exact history table available");
assert.ok(all.some(x=>x.textContent==="Companion Milestones"||String(x.textContent).includes("Companion Milestones")),"Milestones clearly branded");
console.log("Account Statistics passed: local-only metrics, duplicate IDs, growth, unknown tags, Wishlist, Forge, milestones, history, accessible UI.");
