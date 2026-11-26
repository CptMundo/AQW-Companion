"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const asset=fs.readFileSync(path.join(__dirname,"../assets/cape-icon.svg"),"utf8");
const iconsCss=fs.readFileSync(path.join(__dirname,"../css/item-icons.css"),"utf8");
const nav=html.match(/<nav class="primarynav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
assert.ok(nav,"Primary navigation exists");
const groups=[...nav.matchAll(/data-group="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(groups,["home","projects","planner","ultras","builds","story","badges","explore","inventory"],
  "Ultras must follow Daily / Weekly Tracker and precede Class Builds");
assert.ok(html.includes('data-tab="ultras" data-parent="ultras"'),"Ultras subtab preserved");
assert.ok(html.includes('id="ultras" class="view"'),"Ultras content preserved");
assert.ok(html.includes('id="builds" class="view"'),"Class Builds preserved");
assert.ok(html.includes('id="forge" class="view"'),"Forge Tracker preserved");
assert.ok(html.includes("itemTypeNode(canonicalWishlistType(project.name,project.type))"),"Wishlist cards use reviewed category with image icon helper");
assert.ok(html.includes("itemTypeNode(candidate.type)"),"Wishlist suggestions use image icon helper");
assert.ok(html.includes("itemTypeNode(item.type)"),"Explore cards use image icon helper");
for(const entry of [
 "Class:'assets/class-armor-icon.svg'",
 "Cape:'assets/cape-icon.svg'",
 "Armor:'assets/armor-shield-icon.svg'",
 "Helm:'assets/helm-icon.svg'",
 "Weapon:'assets/weapon-icon.svg'"
])assert.ok(html.includes(entry),"Category icon mapping missing: "+entry);
assert.ok(html.includes("img.onerror=function()"),"Cape falls back to superhero emoji if asset fails");
assert.ok(iconsCss.includes("/* style: aqw-cape-illustration */")&&iconsCss.includes(".itemtypeicon.cape-item-icon"),"Size and layout styling included");
assert.ok(asset.includes("<svg")&&asset.includes("viewBox=\"0 0 40 40\""));
const match=asset.match(/href="data:image\/png;base64,([A-Za-z0-9+/=]+)"/);
assert.ok(match,"Cape illustration should contain bundled PNG with no network dependencies");
const png=Buffer.from(match[1],"base64");
assert.equal(png.subarray(0,8).toString("hex"),"89504e470d0a1a0a","Valid PNG embedded in SVG");
assert.equal(png.readUInt32BE(16),40);
assert.equal(png.readUInt32BE(20),40);
assert.ok(png.length>1000 && png.length<15000,"Compact 40x40 illustration");
for(const [i,m] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()){
 if(!m[1].includes("src=")&&m[2].trim())new vm.Script(m[2],{filename:"inline-"+i});
}
console.log("Cape artwork + Ultras navigation structural regression passed");
