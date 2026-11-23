/* AQW Companion — source-reviewed recipe coverage and safe checklist synchronization.
   Public item knowledge only. Does not access browser storage, player data or network. */
(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.AQWCRecipeIntegrity=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const normalize=s=>String(s||"").trim().toLowerCase().replace(/[’‘]/g,"'");
  const verifiedFinalMerges=[{
    name:"Sin of the Abyss",type:"Weapon",
    source:"https://aqwwiki.wikidot.com/sin-of-the-abyss",reviewedOn:"2026-11-23",
    sourceKind:"AQWWiki final merge, checked against in-game screenshot",
    ingredients:[
      ["Blood Gem of the Archfiend",50],
      ["Dark Crystal Shard",200],
      ["Diamond of Nulgath",500],
      ["Gem of Nulgath",150],
      ["Nulgath Insignia",20],
      ["Sin of Revontheus",1],
      ["Tainted Gem",300],
      ["Totem of Nulgath",50]
    ],
    note:"AQWWiki labels the precursor Sin of Revontheus (Sword); in-game component names and exported inventory use Sin of Revontheus."
  }];
  const byName=new Map(verifiedFinalMerges.map(x=>[normalize(x.name),x]));
  function getVerified(name){return byName.get(normalize(name))||null}
  function toSteps(entry){
    return entry.ingredients.map(([item,target])=>({
      label:item+" ×"+target,kind:target===1?"owned":"material",item,target
    }));
  }
  function getRecipe(name){
    const entry=getVerified(name);
    return entry?{name:entry.name,type:entry.type,coverage:"reviewed-final-merge",source:entry.source,steps:toSteps(entry)}:null;
  }
  function getAcquisition(name){
    const entry=getVerified(name);
    return entry?{
      name:entry.name,type:entry.type,origin:"reviewed",wiki:entry.source,
      complete:"final-merge",ingredients:entry.ingredients.map(x=>[...x]),
      methods:[{type:"Merge/Shop",title:"Nulgath's Merge Shop (Ultra Nulgath)",url:entry.source,
        details:"Final merge checked against AQWWiki and in-game components. Earlier precursor costs are separate."}]
    }:null;
  }
  function stepMatches(step,item){
    return step&&["owned","material"].includes(step.kind)&&normalize(step.item)===normalize(item);
  }
  function inspect(project,reference){
    const steps=Array.isArray(project?.steps)?project.steps:[];
    const entry=getVerified(project?.name);
    if(entry){
      const missing=[],wrongQuantity=[],duplicates=[];
      for(const [item,target] of entry.ingredients){
        const found=steps.filter(s=>stepMatches(s,item));
        if(!found.length){missing.push({item,target});continue}
        if(found.length>1)duplicates.push({item,count:found.length});
        const kind=target===1?"owned":"material";
        if(found[0].kind!==kind||Number(found[0].target)!==target)
          wrongQuantity.push({item,expected:target,actual:found[0].target});
      }
      return {status:missing.length||wrongQuantity.length||duplicates.length?"needs-sync":"reviewed",
        reviewed:true,source:entry.source,expectedCount:entry.ingredients.length,
        missing,wrongQuantity,duplicates,communityExtra:[]};
    }
    const listed=Array.isArray(reference?.ingredients)?reference.ingredients:[];
    const communityExtra=listed.filter(row=>Array.isArray(row)&&typeof row[0]==="string"&&
      !steps.some(s=>stepMatches(s,row[0]))).map(x=>({item:x[0],target:Number(x[1])||1}));
    return {status:"not-reviewed",reviewed:false,source:typeof reference?.wiki==="string"?reference.wiki:null,
      expectedCount:null,missing:[],wrongQuantity:[],duplicates:[],communityExtra};
  }
  const oldPlaceholder="Verify full Nulgath Insignia and component requirements";
  function isLegacySin(project){
    if(normalize(project?.name)!=="sin of the abyss"||!Array.isArray(project.steps)||project.steps.length!==3)return false;
    const material=(item,target)=>project.steps.some(s=>s.kind==="material"&&normalize(s.item)===normalize(item)&&Number(s.target)===target);
    return material("Blood Gem of the Archfiend",50)&&material("Totem of Nulgath",50)&&
      project.steps.some(s=>s.kind==="manual"&&s.label===oldPlaceholder);
  }
  function sync(project,makeStep){
    const entry=getVerified(project?.name);
    if(!entry||!Array.isArray(project.steps)||typeof makeStep!=="function")
      return {changed:false,added:0,updated:0,removedPlaceholder:0};
    let added=0,updated=0,removedPlaceholder=0;
    for(const expected of toSteps(entry)){
      const existing=project.steps.find(s=>stepMatches(s,expected.item));
      if(existing){
        if(existing.kind!==expected.kind||Number(existing.target)!==expected.target||existing.label!==expected.label){
          Object.assign(existing,{label:expected.label,kind:expected.kind,target:expected.target});
          updated++;
        }
      }else{
        project.steps.push(makeStep(expected));
        added++;
      }
    }
    if(normalize(project.name)==="sin of the abyss"){
      const before=project.steps.length;
      project.steps=project.steps.filter(s=>!(s.kind==="manual"&&s.label===oldPlaceholder));
      removedPlaceholder=before-project.steps.length;
    }
    return {changed:!!(added||updated||removedPlaceholder),added,updated,removedPlaceholder};
  }
  function upgradeUntouchedLegacy(project,makeStep){
    return isLegacySin(project)?sync(project,makeStep).changed:false;
  }
  return Object.freeze({getVerified,getRecipe,getAcquisition,inspect,sync,isLegacySin,upgradeUntouchedLegacy,
    reviewedNames:Object.freeze(verifiedFinalMerges.map(x=>x.name))});
});
