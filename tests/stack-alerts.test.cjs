"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const api=require("../js/stack-alerts.js");
const recipes=require("../js/recipe-integrity.js");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const css=fs.readFileSync(path.join(__dirname,"../css/stack-alerts.css"),"utf8");

const caps=new Map(api.knownCaps.map(x=>[x.name,x]));
assert.equal(caps.get("Void Aura").cap,7500);
assert.equal(caps.get("Dark Crystal Shard").cap,1000);
assert.equal(caps.get("Gem of Nulgath").cap,1000);
assert.equal(caps.get("Totem of Nulgath").cap,100);
assert.equal(caps.get("Legion Token").cap,50000);
assert.equal(caps.get("Nulgath's Approval").cap,5000);
assert.ok(api.knownCaps.length>=15,"Initial caps must be source-linked");
for(const cap of api.knownCaps)assert.ok(/^https:\/\/aqwwiki\.wikidot\.com\/[a-z0-9-]+$/.test(cap.url));
assert.equal(api.validCap("1000"),1000);
assert.equal(api.validCap(0),null);
assert.equal(api.validCap("unknown"),null);
assert.equal(api.validCap(10000001),null);
assert.equal(api.normalize("Elders' Blood"),api.normalize("Elder's Blood"));
assert.equal(api.normalize("Spirit Orb (Misc)"),api.normalize("Spirit Orb"));
const item=(ID,Name,Count,Bank=0,extra={})=>({ID,Name,Count,Bank,...extra});
const original=[
 item(1,"Dark Crystal Shard",999,0),
 item(1,"Dark Crystal Shard",999,0),// repeated export record must not double-count
 item(1,"Dark Crystal Shard",70,1), // Bank separate from Bag
 item(2,"Gem of Nulgath",1000,0),
 item(3,"Totem of Nulgath",95,0),
 item(4,"Unverified Item",100000,0),
 item(5,"Legion Token",45000,0),
 item(6,"Another Material",50,0,{MaxStack:50}),
 item(7,"My Own Resource",25,0)
];
const copy=JSON.stringify(original);
const result=api.analyze(original,{"my own resource":25});
assert.equal(JSON.stringify(original),copy,"Only analyze inventory, never modify it");
assert.equal(result.maxed,3,"Wiki cap, export cap, manual cap");
assert.equal(result.near,3,"DCS, Totem and Legion Token approach their separate caps");
assert.equal(result.unknown,1,"No guess for uncatalogued item caps");
const dcs=result.alerts.find(x=>x.name==="Dark Crystal Shard");
assert.equal(dcs.qty,999,"Duplicate inventory ID doesn't create fake full stack");
assert.equal(dcs.location,"Bag","Bank amount is separate");
assert.equal(dcs.cap,1000);
assert.equal(dcs.status,"near");
assert.ok(!result.alerts.some(x=>x.name==="Dark Crystal Shard"&&x.location==="Bank"));
assert.equal(result.alerts.find(x=>x.name==="Another Material").capSource,"Export metadata");
assert.equal(result.alerts.find(x=>x.name==="My Own Resource").capSource,"Player limit");
assert.equal(result.alerts.find(x=>x.name==="Gem of Nulgath").capSource,"AQWWiki");
assert.equal(result.alerts.find(x=>x.name==="Gem of Nulgath").sourceUrl,caps.get("Gem of Nulgath").url);
assert.equal(result.alerts.find(x=>x.name==="Totem of Nulgath").status,"near");
assert.equal(api.analyze([item(9,"Unverified Item",999999)]).alerts.length,0,"Don't infer full stacks from large quantities");
assert.equal(api.analyze([item(10,"Common Armor",1,0,{Type:"Armor",MaxStack:1})]).alerts.length,0,"Don't spam maxed alerts for equipped items");
assert.equal(api.analyze([item(10,"Common Armor",1,0,{Type:"Armor",MaxStack:1})]).unknown,0,"Untracked equipment isn't counted as an unknown resource");
assert.equal(api.analyze([item(11,"My Material",100,0,{Type:"Resource",MaxStack:100})]).maxed,1,"Real Resource stacks are checked");

assert.equal(api.analyze([item(9,"Silver Stack",1000)],{}).maxed,1);
assert.equal(api.analyze([item(9,"Silver Stack",1000)],{"silver stack":1500}).maxed,0,"Explicit player limit overrides Wiki");
assert.equal(api.analyze([item(9,"Test Item",99,0,{MaxStack:100})],{}).near,1);
assert.equal(api.analyze([item(9,"Test Item",99,0,{MaxStack:100})],{}, {near:.99}).near,1);

const reviewed=recipes.reviewedNames.map(name=>{
 const entry=recipes.getAcquisition(name);
 return {name:entry.name,ingredients:entry.ingredients,url:entry.wiki,join:entry.methods?.[0]?.join};
});
const wishlist=[{name:"Sin of the Abyss",steps:[{kind:"material",item:"Dark Crystal Shard",target:200}]}];
const uses=api.uses("Dark Crystal Shard",{reviewed,wishlist});
assert.ok(uses.length>1);
assert.equal(uses[0].kind,"Wishlist","Owned player's projects come first");
assert.ok(uses.some(x=>x.title==="Sin of the Abyss"&&x.kind==="Reviewed merge"&&x.quantity===200));
assert.ok(uses.some(x=>x.title==="Void Crystal A"&&x.kind==="Reviewed merge"));
const community=[
 {name:"Sample Community Armor",complete:"community-merge",
  ingredients:[["Dark Crystal Shard",8]],wiki:"https://aqwwiki.wikidot.com/sample-community-armor",
  methods:[{join:"/join yulgar"}]},
 {name:"Craft Reward",questRoutes:[{quest:"An Old Quest",source:"https://aqwwiki.wikidot.com/an-old-quest",
    ingredients:[["Dark Crystal Shard",5]]}]},
 {name:"Bad Item",complete:"community-merge",ingredients:[["Dark Crystal Shard",20]],
  wiki:"https://evil.example.com",methods:[{join:"/join ../../bad"}]}
];
const more=api.uses("Dark Crystal Shard",{community});
assert.deepEqual(more.map(x=>x.kind),["Quest","Community merge","Community merge"]);
assert.ok(more.every(x=>x.kind!=="Reviewed merge"));
assert.equal(more.find(x=>x.title==="Bad Item").url,null);
assert.equal(more.find(x=>x.title==="Bad Item").join,null);
assert.equal(api.safeWiki("https://evil.example.com"),null);
assert.equal(api.safeJoin("/join yulgar"),"/join yulgar");
assert.equal(api.safeJoin("/join ../../bad"),null);
assert.ok(html.includes('id="stack-alert-list"'));
assert.ok(html.includes('id="home-stack-card"'));
assert.ok(html.includes('id="stack-cap-save"'));
assert.ok(html.includes('id="stack-cap-clear"'));
assert.ok(html.includes('src="js/stack-alerts.js?v=138"'));
assert.ok(html.includes('href="css/stack-alerts.css?v=95"'));
assert.ok(html.includes("renderUnlocks();renderStackAlerts();showUnlockSuggestions()"),"Alerts refresh with inventory snapshots");
assert.ok(html.includes("initStackAlerts();"));
assert.ok(html.includes("MaxStack:window.AQWCStackAlerts?.validCap"));
assert.ok(html.includes("const reviewed=(api && window.AQWCRecipeIntegrity?.reviewedNames||[]).map"));
assert.ok(html.includes("const community=[...communityAcquisition.values()]"));
assert.ok(html.includes("location:'Bag'")===false,"No invented location in inline code");
assert.ok(css.includes(".stack-alert-status.maxed"));
for(const [i,m] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()){
 if(!m[1].includes("src=")&&m[2].trim())
  new vm.Script(m[2],{filename:"index-inline-"+i});
}
console.log("Stack Alerts: exact wiki caps, bank separation, no inferred limits, private overrides and source-linked uses validated.");

assert.ok(html.includes('<section id="alerts" class="view"><div class="card stack-alerts-card">'));
assert.ok(html.includes("$('homestacks')?.addEventListener('click',()=>selectTab('alerts'))"));
assert.ok(html.includes('id="homeinventorydelta" class="home-delta"></div><div class="home-stack-card hidden" id="home-stack-card">'));

assert.ok(html.includes("wishlist-completion-remove"));
assert.ok(html.includes("Congratulations, Hero!"));
assert.ok(html.indexOf("if(owned(project.name)){\n  card.classList")<html.indexOf("// Only show recipe coverage when there is an actual fix to apply."));
assert.ok(css.includes(".home-warning-icon"));
assert.ok(css.includes(".home-inventory-changes .home-wishlist-win small"));

assert.ok(html.includes("✓ Remove from Wishlist"));
assert.ok(html.includes("home-wishlist-win-badge"));
assert.ok(css.includes("#unlocks #unlocklist .unlockcard.wishlist-completed-card"));
assert.ok(css.includes("#unlocks #unlocklist .wishlist-completion-remove"));

{
 const api=require('../js/stack-alerts.js'),items=[
 {ID:'1',Name:"Necrotic Sword's Blade",Type:'Item',Bank:0,Count:1},
 {ID:'2',Name:'Necrotic Sword of Doom',Type:'Sword',Bank:1,Count:1},
 {ID:'3',Name:'Wheel of Bacon Token',Type:'Item',Bank:0,Count:10},
 {ID:'4',Name:'Gray Matter',Type:'Quest Item',Bank:0,Count:3},
 {ID:'5',Name:'Unknown Material',Type:'Resource',Bank:0,Count:1},
 {ID:'6',Name:'Void Aura',Type:'Item',Bank:0,Count:800},
 {ID:'7',Name:'Bank Only',Type:'Item',Bank:1,Count:1}];
 const result=api.cleanup(items),byName=new Map(result.rows.map(r=>[r.name,r]));
 assert.equal(byName.get("Necrotic Sword's Blade").status,'review');
 assert.equal(byName.get('Wheel of Bacon Token').status,'situational');
 assert.equal(byName.get('Gray Matter').status,'review');
 assert.equal(byName.get('Unknown Material').status,'unknown');
 assert.equal(byName.get('Void Aura').status,'protected');assert.equal(byName.has('Bank Only'),false);
 assert.equal(api.cleanup(items,{wishlist:[{name:'goal',steps:[{kind:'material',item:"Necrotic Sword's Blade"}]}]}).rows.find(r=>r.name==="Necrotic Sword's Blade").status,'protected');
 assert.equal(api.cleanup(items,{routines:[{name:'test',targets:['Wheel of Bacon Token ×1']}]}).rows.find(r=>r.name==='Wheel of Bacon Token').status,'protected');
 assert.equal(api.cleanup(items.filter(r=>r.ID!=='2')).rows.find(r=>r.name==="Necrotic Sword's Blade").status,'protected');
 assert.equal(api.cleanup(items,{reviewed:[{name:'Other goal',ingredients:[["Necrotic Sword's Blade",1]]}]}).rows.find(r=>r.name==="Necrotic Sword's Blade").status,'protected');
}

{
 const api=require('../js/stack-alerts.js'),rows=[{ID:'1',Name:'Aegis Armor',Type:'Item',Count:1,Bank:0},{ID:'2',Name:'Armor of Awe Pass',Type:'Item',Count:1,Bank:0},{ID:'3',Name:'[Class Item] Timepiece of Madness',Type:'Item',Count:99,Bank:0}];
 const by=new Map(api.cleanup(rows).rows.map(r=>[r.name,r]));assert.equal(by.get('Aegis Armor').status,'situational');assert.equal(by.get('Armor of Awe Pass').status,'protected');assert.equal(by.get('[Class Item] Timepiece of Madness').status,'protected');assert.equal(api.cleanup(rows,{wishlist:[{name:'goal',steps:[{kind:'material',item:'Aegis Armor'}]}]}).rows.find(r=>r.name==='Aegis Armor').status,'protected');
}
