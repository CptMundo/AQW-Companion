"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css/recipe-coverage.css"), "utf8");
const start = html.indexOf("function renderUnlocks()");
const end = html.indexOf("function renderDiscover()", start);
assert.ok(start >= 0 && end > start, "Wishlist render function must exist");
const wishlist = html.slice(start, end);

assert.ok(wishlist.includes("steps.append(row)"), "Every step must still be rendered");
assert.ok(wishlist.includes("project.steps"), "Existing step list and status tracking remain");
assert.ok(wishlist.includes("step.kind==='material'"), "Material tracking must remain");
assert.ok(wishlist.includes("step.kind==='owned'"), "Owned-item steps must remain");
assert.ok(!wishlist.includes("remove-step-quiet"), "No small X/remove control inside a checklist step");
assert.ok(!wishlist.includes("Remove this checklist step"), "No step removal tooltip");
assert.ok(!wishlist.includes("Remove step: "), "No step removal aria label");
assert.ok(!wishlist.includes("project.steps=project.steps.filter(s=>s.id!==step.id)"), "No direct deletion handler for a required step");
assert.ok(wishlist.includes("const rm=node('button','×','smallbutton wishlist-dismiss')"),
  "Top-level Wishlist goal removal must stay as an X");
assert.ok(wishlist.includes("unlocks=unlocks.filter(u=>u.id!==project.id)"),
  "Top-level Wishlist goal removal still functions");
assert.ok(!css.includes(".remove-step-quiet.wishlist-dismiss"), "Remove obsolete step-delete-only CSS");
assert.ok(css.includes("#unlocks .wishlist-dismiss"), "Top-level X keeps its styling");

for (const [i, script] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()) {
  if (!script[1].includes("src=") && script[2].trim()) {
    new vm.Script(script[2], { filename: "index-inline-" + i });
  }
}
console.log("Wishlist step controls verified: no per-step X, steps and top-level X preserved.");

// BLoD: separate final turn-in from optional farming gear, migrate without losing custom work.
{const a=html.indexOf('const blodFinalIngredients='),b=html.indexOf('const catalogExtras=',a);const api=vm.runInNewContext(html.slice(a,b)+'\n({blodRecipe,blodAcquisition,upgradeBlodProject,isBlodProject})');const final=Array.from(api.blodRecipe.steps.filter(s=>s.kind==='material'),s=>[s.item,s.target]);assert.deepEqual(final,[['Spirit Orb',500],['Loyal Spirit Orb',250],['Bright Aura',125],['Brilliant Aura',75],['Blinding Aura',1],['Ultimate Weapon Kit',1]]);assert.equal(api.blodAcquisition.methods.length,9);assert.ok(api.isBlodProject('Blinding Light of Destiny (Axe)'));assert.ok(!api.isBlodProject('Blinding Mace of Destiny'));let id=0;const fresh=s=>({...s,id:'new-'+(++id),status:'unknown'});const p={id:'old',name:'Blinding Light of Destiny',steps:[{kind:'manual',label:'Collect Spirit Orbs (check actual recipe requirements)',status:'unknown'},{kind:'manual',label:'Acquire and craft Destiny metal / weapon chain',status:'done',id:'keep'},{kind:'manual',label:'Complete final BLoD crafting steps',status:'unknown'},{kind:'manual',label:'My custom note',status:'done',id:'custom'}]};assert.equal(api.upgradeBlodProject(p,fresh),true);assert.equal(p.id,'old');assert.ok(p.steps.some(s=>s.id==='custom'&&s.status==='done'));assert.ok(p.steps.some(s=>s.id==='keep'&&s.status==='done'));assert.ok(!p.steps.some(s=>s.label==='Collect Spirit Orbs (check actual recipe requirements)'));assert.equal(api.upgradeBlodProject(p,fresh),false);assert.ok(html.includes('if(isBlodProject(name))return blodAcquisition'));console.log('BLoD final requirements and non-destructive legacy migration checked.');}
