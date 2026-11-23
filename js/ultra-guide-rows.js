/* Unified class-specific Ultra guide rows.
 * No extra warning/quote boxes: every instruction is one numbered row.
 * Quote reactions are attached only to the selected class.
 */
(function(root,factory){
 "use strict";const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.AQWCGuideRows=api;
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 function caption(text){
  const s=String(text||"").trim();
  if(/vigil|you cannot resist/i.test(s))return "Vigil · “You cannot resist.”";
  if(/counter.?attack|reflect|untarget/i.test(s))return "Counter Attack · Stop damage";
  if(/zone|platform|blue circle/i.test(s))return "Zone · Move to safety";
  if(/decay|legion mages/i.test(s))return "Legion Mages · Apply Decay";
  if(/taunt|enrage|contracts/i.test(s))return "Taunt timing · Assigned player";
  if(/tendril/i.test(s))return "Focus the Tendrils";
  if(/mana|buff/i.test(s))return "Maintain your buffs";
  if(/heal|recovery|surviv/i.test(s))return "Support and recovery";
  if(/pull|equip|before|prepare/i.test(s))return "Before the pull";
  if(/blade|dps|damage|finish/i.test(s))return "Damage and target priority";
  return "Your next action";
 }
 function rows({tips=[],quotes=[],warning="",fallback=""}={}){
  const result=[];
  const use=(title,text,quote="")=>result.push({title,text:String(text||"").trim(),quote});
  const spoken=new Set();
  for(const tip of (tips.length?tips:[fallback||"Confirm assigned team responsibilities before pulling."])){
   const text=String(tip||"").trim();if(!text)continue;
   const related=quotes.find(c=>c.quote&&text.toLowerCase().includes(String(c.quote).toLowerCase().replace(/[.!?]+$/,"").trim()));
   if(related){
    const key=String(related.quote).toLowerCase();spoken.add(key);
    use(caption(text),related.response||text,related.quote);
   } else use(caption(text),text);
  }
  for(const cue of quotes){
   const key=String(cue.quote||"").toLowerCase();if(!key||spoken.has(key))continue;
   spoken.add(key);use("Quote · “"+cue.quote+"”",cue.response,cue.quote);
  }
  if(warning&&String(warning).trim())use("Watch out · Avoid a wipe",warning);
  return result.map((row,i)=>({...row,number:String(i+1).padStart(2,"0")}));
 }
 return Object.freeze({rows,caption});
});
