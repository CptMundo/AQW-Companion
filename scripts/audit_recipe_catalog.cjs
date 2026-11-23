#!/usr/bin/env node
"use strict";
/* Exhaustive structural scan of the published static AQW community catalog.
 * IMPORTANT: this is not an exhaustive, independent AQWWiki/in-game fact check.
 * No external requests, no personal inventory/credentials, no silent database edits.
 */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const normalize=s=>String(s||"").trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s*\((?:Class|Armor|Helm|Cape|Weapon|Pet|Misc|Sword|Dagger|Axe|Mace|Bow|Gun|0 AC|AC|Legend|Non-Legend|Merge)\)$/i,"");
const safeName=s=>String(s||"").slice(0,180);
const looksLikeWiki=s=>typeof s==="string"&&/^https:\/\/aqwwiki\.wikidot\.com\/[a-z0-9][a-z0-9-]*$/i.test(s);
const record=(arr)=>Array.isArray(arr)&&arr.length===2&&typeof arr[0]==="string";
function audit(db){
  if(!db||!Array.isArray(db.items)||!Array.isArray(db.acquisition)||!Array.isArray(db.locations))
    throw Error("Catalog must contain items, acquisition and locations arrays");
  const items=new Map(),acq=new Map(),issueSets=new Map();
  const issue=(type,name,details)=>{let a=issueSets.get(type);if(!a){a=[];issueSets.set(type,a)}a.push({item:safeName(name),details:String(details||"").slice(0,180)})};
  const seen=(array,dest,label)=>{for(const item of array){
    if(!record(item)){issue("invalid-"+label,"(record)","entry not a [key,value] pair");continue}
    const key=normalize(item[0]);if(!key){issue("blank-"+label,item[0],"empty key");continue}
    if(dest.has(key))issue("duplicate-"+label,item[0],"normalized name duplicate");
    else dest.set(key,item[1]);
  }};
  seen(db.items,items,"item");
  seen(db.acquisition,acq,"acquisition");
  const metrics={
    generatedAt:db.generatedAt||null,
    publicItemRecords:db.items.length,publicUniqueItems:items.size,
    publicAcquisitionRecords:db.acquisition.length,publicUniqueAcquisitions:acq.size,
    publicLocationRecords:db.locations.length,
    withMethod:0,mergeShopMethod:0,mergeShopWithoutListedIngredients:0,
    anyIngredientList:0,ingredientRows:0,questRoutes:0,
    entriesWithMultipleQuestRoutes:0,ambiguousQuestRoutes:0,
    possibleIncompleteRecipe:0,sourceLinkedRecipes:0,sourceLinksAbsent:0,
    sourceReviewedAgainstLiveGame:0
  };
  const candidateNames=[];
  for(const [name,entry] of acq){
    if(!entry||typeof entry!=="object"||Array.isArray(entry)){issue("invalid-acquisition",name,"non-object");continue}
    const methods=Array.isArray(entry.methods)?entry.methods:[];
    if(methods.length)metrics.withMethod++;
    const mergeMethods=methods.filter(m=>m&&typeof m==="object"&&/merge|shop/i.test(m.type||""));
    if(mergeMethods.length)metrics.mergeShopMethod++;
    const ingredients=Array.isArray(entry.ingredients)?entry.ingredients:[];
    if(ingredients.length){metrics.anyIngredientList++;candidateNames.push(name)}
    if(mergeMethods.length&&!ingredients.length){
      metrics.mergeShopWithoutListedIngredients++;
      issue("merge-shop-no-listed-ingredients",name,"merge/shop method exists but no ingredients parsed; could be a gold/AC shop or data gap");
    }
    const routes=Array.isArray(entry.questRoutes)?entry.questRoutes:[];
    metrics.questRoutes+=routes.length;
    if(routes.length>1){
      metrics.entriesWithMultipleQuestRoutes++;
      const signatures=new Set(routes.map(r=>JSON.stringify(Array.isArray(r.ingredients)?r.ingredients:[])));
      if(signatures.size>1){
        metrics.ambiguousQuestRoutes++;
        issue("multiple-alternative-quest-recipes",name,routes.length+" quest routes with different ingredient sets; don't combine");
      }
    }
    let anySource=looksLikeWiki(entry.wiki);
    for(const method of methods)if(method?.url&&looksLikeWiki(method.url))anySource=true;
    for(const route of routes)if(route?.source&&looksLikeWiki(route.source))anySource=true;
    if(ingredients.length||routes.some(r=>Array.isArray(r.ingredients)&&r.ingredients.length)){
      if(anySource)metrics.sourceLinkedRecipes++;else{
        metrics.sourceLinksAbsent++;issue("recipe-without-wiki-link",name,"no valid AQWWiki source URL");
      }
    }
    const validateIngredients=(rows,routeName)=>{
      const unique=new Map();
      for(const row of rows){
        metrics.ingredientRows++;
        if(!Array.isArray(row)||typeof row[0]!=="string"||!row[0].trim()){
          issue("malformed-ingredient",name,routeName+" invalid ingredient record");continue
        }
        const ingredient=normalize(row[0]),count=row[1];
        if(typeof count!=="number"||!Number.isSafeInteger(count)||count<=0){
          issue("invalid-quantity",name,row[0]+" = "+String(count));
        }
        if(ingredient===name)issue("self-dependency",name,routeName+" = "+row[0]);
        if(unique.has(ingredient)){
          issue("duplicate-ingredient",name,routeName+" "+row[0]);
          if(unique.get(ingredient)!==count)issue("conflicting-ingredient-quantity",name,routeName+" "+row[0]);
        }else unique.set(ingredient,count);
        if(!items.has(ingredient))issue("ingredient-not-in-public-items",name,routeName+" "+row[0]);
      }
    };
    validateIngredients(ingredients,"top-level");
    for(const r of routes)if(Array.isArray(r.ingredients))validateIngredients(r.ingredients,"quest "+String(r.quest||""));
    if((mergeMethods.length||routes.length)&&!ingredients.length&&routes.every(r=>!(r.ingredients||[]).length)){
      metrics.possibleIncompleteRecipe++;issue("no-quantity-data-for-acquisition",name,"merge/shop/quest acquisition found but no ingredient quantities");
    }
  }
  const issues={};
  for(const [type,rows] of [...issueSets].sort(([a],[b])=>a.localeCompare(b))){
    const samples=rows.slice().sort((a,b)=>a.item.localeCompare(b.item)||a.details.localeCompare(b.details));
    issues[type]={count:rows.length,samples:samples.slice(0,30)};
  }
  const sha=crypto.createHash("sha256").update(JSON.stringify(db)).digest("hex");
  return {
    schemaVersion:1,scope:"ALL public items/acquisition/quest route records, structural validation ONLY",
    publicationDataSha256:sha,
    independentGameSourceReview:false,
    limitations:[
      "Source input is a dated community snapshot; source URLs are not automatically independently checked.",
      "A source URL and syntactically valid quantity do not prove completeness or correctness.",
      "Multiple quests may be alternative routes; do not combine them without source-specific proof.",
      "Merge/shop item entries may be purchased for gold/ACs without ingredients.",
      "Precursors and quest unlock prerequisites require additional recursive and human review.",
      "No private player account JSON is read, changed or uploaded."
    ],
    metrics,issues,
    prioritizedReview: [
      ...new Set([
        "sin of the abyss","necrotic sword of doom","sepulchure's doomknight armor",
        "blinding light of destiny","malgor's shadowflame blade","legion revenant",
        "void highlord","archmage","arcana invoker","chaos avenger"
      ])
    ].map(name=>({item:name,communityCatalogEntry:acq.has(name),
      hasListedIngredients:!!acq.get(name)?.ingredients?.length,
      questRouteCount:acq.get(name)?.questRoutes?.length||0,
      methodCount:acq.get(name)?.methods?.length||0,
      independentlyVerified:false}))
  };
}
function markdown(result){
 const m=result.metrics;
 const out=[
  "# AQW Companion — Entire public recipe catalog structural audit",
  "",
  "**This is a structural scan of ALL published public catalog records, NOT independent verification of all AQWWiki/game recipes.**",
  "",
  "- Catalog SHA256: \`"+result.publicationDataSha256+"\`",
  "- Public item records: "+m.publicItemRecords.toLocaleString(),
  "- Public acquisition records: "+m.publicAcquisitionRecords.toLocaleString(),
  "- Entries with top-level ingredient lists: "+m.anyIngredientList.toLocaleString(),
  "- Quest route records: "+m.questRoutes.toLocaleString(),
  "- Merge/shop methods: "+m.mergeShopMethod.toLocaleString(),
  "- Merge/shop methods without listed ingredients: "+m.mergeShopWithoutListedIngredients.toLocaleString(),
  "- Entries with alternative quest ingredient sets: "+m.ambiguousQuestRoutes.toLocaleString(),
  "- Recipes with a source link: "+m.sourceLinkedRecipes.toLocaleString(),
  "- Recipes **independently checked** against live AQWWiki/in-game: **0 by this structural scan**",
  "",
  "## Detected issues / manual review queue",
  "",
  "| Finding | Occurrences |",
  "|---|---:|"
 ];
 for(const [name,info] of Object.entries(result.issues))
  out.push("| "+name+" | "+info.count.toLocaleString()+" |");
 out.push("","## Interpretation","","These findings are **candidates** for a real source review, not proof of a broken recipe. The app must label unreviewed checklists honestly, preserve alternative routes, and avoid auto-filling unknown ingredients.",
 "","## High-priority farms");
 for(const p of result.prioritizedReview)
  out.push("- "+p.item+": catalog "+(p.communityCatalogEntry?"present":"absent")+"; top-level ingredients "+(p.hasListedIngredients?"yes":"no")+"; quest routes "+p.questRouteCount+"; **not independently verified by this scan**");
 out.push("","## Limits",...result.limitations.map(x=>"- "+x),"","Full issue samples are in \`catalog-audit.json\`.");
 return out.join("\n")+"\n";
}
if(require.main===module){
 const file=process.argv[2]||path.join(__dirname,"..","data","companion_database.json");
 const outputDir=process.argv[3]||path.join(__dirname,"..","review_output","recipe-audit");
 const result=audit(JSON.parse(fs.readFileSync(file,"utf8")));
 fs.mkdirSync(outputDir,{recursive:true});
 fs.writeFileSync(path.join(outputDir,"catalog-audit.json"),JSON.stringify(result,null,2)+"\n");
 fs.writeFileSync(path.join(outputDir,"catalog-audit.md"),markdown(result));
 console.log(JSON.stringify({metrics:result.metrics,issues:Object.fromEntries(Object.entries(result.issues).map(([k,v])=>[k,v.count]))},null,2));
}
module.exports={audit,markdown};
