"use strict";
const assert=require("node:assert/strict");
const {audit,markdown}=require("../scripts/audit_recipe_catalog.cjs");
const sample={
 items:[["a",{name:"A"}],["b",{name:"B"}],["c",{name:"C"}]],
 acquisition:[
  ["a",{name:"A",wiki:"https://aqwwiki.wikidot.com/a",ingredients:[["B",2]],methods:[{type:"Merge/Shop",url:"https://aqwwiki.wikidot.com/a"}]}],
  ["b",{name:"B",ingredients:[],methods:[{type:"Merge/Shop",title:"Gold Shop"}]}],
  ["c",{name:"C",ingredients:[["Unknown",0],["Unknown",2],["C",1]],questRoutes:[
   {quest:"route1",ingredients:[["B",1]]},{quest:"route2",ingredients:[["A",5]]}
  ]}]
 ],
 locations:[["x",[]]]
};
const result=audit(sample);
assert.equal(result.metrics.publicItemRecords,3);
assert.equal(result.metrics.publicAcquisitionRecords,3);
assert.equal(result.metrics.anyIngredientList,2);
assert.equal(result.metrics.mergeShopWithoutListedIngredients,1);
assert.equal(result.metrics.ambiguousQuestRoutes,1);
assert.equal(result.metrics.sourceReviewedAgainstLiveGame,0);
assert.equal(result.independentGameSourceReview,false);
assert.equal(result.issues["invalid-quantity"].count,1);
assert.equal(result.issues["duplicate-ingredient"].count,1);
assert.equal(result.issues["self-dependency"].count,1);
assert.ok(result.issues["ingredient-not-in-public-items"].count>=1);
assert.ok(markdown(result).includes("NOT independent verification"));
assert.deepEqual(result.metrics.publicUniqueItems,3);
console.log("Full catalog structural audit unit fixture passed.");
