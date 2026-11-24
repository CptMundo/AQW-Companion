"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const site=fs.readFileSync(path.join(root,"css/site.css"),"utf8");
const icons=fs.readFileSync(path.join(root,"css/item-icons.css"),"utf8");
const ordered=["css/site.css","css/item-icons.css","css/account-statistics.css"];
const offsets=ordered.map(name=>html.search(new RegExp('href="'+name.replace(/\./g,'\\.')+'(?:\\?v=\\d+)?"')));
assert.ok(offsets.every(n=>n>=0)&&offsets.every((n,i)=>i===0||offsets[i-1]<n),"Original CSS cascade ordering preserved");
assert.equal((html.match(/<style(?:\s|>)/gi)||[]).length,0,"All inline CSS extracted");
assert.equal((site.match(/\/\* style:/g)||[]).length,35);
assert.equal((icons.match(/\/\* style:/g)||[]).length,4);
for(const id of ["aqw-feedback-nav-v2","aqw-forge-tracker-v1","aqw-build-connector-pixel-fix"])
  assert.ok(site.includes("/* style: "+id+" */"),"Missing CSS "+id);
for(const id of ["aqw-wishlist-type-icons","aqw-cape-illustration","aqw-class-illustration","aqw-equipment-illustrations"])
  assert.ok(icons.includes("/* style: "+id+" */"),"Missing icon styles "+id);
assert.ok(!html.includes("data:image/png;base64,"));
for(const [file,w,h] of [["brand-favicon.png",64,64],["brand-logo.png",256,256]]){
 const data=fs.readFileSync(path.join(root,"assets",file));
 assert.ok(data.subarray(0,8).equals(Buffer.from("89504e470d0a1a0a","hex")),"Invalid PNG "+file);
 assert.equal(data.readUInt32BE(16),w);
 assert.equal(data.readUInt32BE(20),h);
 assert.ok(html.includes("assets/"+file));
}
assert.ok(html.includes('data-group="home"')&&!html.includes('data-tab="overview"'));
for(const id of ["inventory","account-stats","compare","history","forge","unlocks","ultras","builds","story"])
 assert.ok(html.includes('id="'+id+'" class="view"'),"Missing view "+id);
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.filter(m=>!m[1].includes("src=")).length,1);
assert.ok(!scripts.some(m=>/combat-engine|damage-simulator/.test(m[1])),"Experimental damage engine not loaded");
for(const [i,m] of scripts.entries())if(!m[1].includes("src=")&&m[2].trim())
 new vm.Script(m[2],{filename:"index-inline-"+i});
console.log("Architecture extraction smoke test passed");
