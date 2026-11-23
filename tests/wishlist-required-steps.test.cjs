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
