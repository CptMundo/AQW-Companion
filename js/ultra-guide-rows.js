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
  if(/noxious decay|invert(?:ed|s|ing)? (?:healing|heals)|lifesteal|life steal/i.test(s))return "Inverted healing · Survival";
  if(/(?:avoid|do not|never|stop)\b[^.]*\bdecay/i.test(s))return "Decay · Hold the debuff";
  if(/legion mages|apply decay|scroll of decay/i.test(s))return "Decay · Prevent regeneration";
  if(/magia burn|sanctity|stasis|assigned zone/i.test(s))return "Zone · Follow your assignment";
  if(/zone|platform|blue circle/i.test(s))return "Zone · Move to safety";
  if(/decay/i.test(s))return "Decay · Check timing";
  if(/taunt|enrage|contracts/i.test(s))return "Taunt timing · Assigned player";
  if(/tendril/i.test(s))return "Focus the Tendrils";
  if(/mana|buff/i.test(s))return "Maintain your buffs";
  if(/heal|recovery|surviv/i.test(s))return "Support and recovery";
  if(/pull|equip|before|prepare/i.test(s))return "Before the pull";
  if(/blade|dps|damage|finish/i.test(s))return "Damage and target priority";
  return "Your next action";
 }
 function rows({tips=[],quotes=[],warning="",fallback=""}={}){
  const result=[], spoken=new Map();
  const normalize=s=>String(s||"").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
  const contains=(a,b)=>{const x=normalize(a),y=normalize(b);return !!(x&&y&&(x===y||x.includes(y)))};
  const use=(title,text,quote="")=>{
   const clean=String(text||"").trim();if(!clean||result.some(r=>contains(r.text,clean)))return;
   result.push({title,text:clean,quote});
  };
  const mergeText=(a,b)=>contains(a,b)?a:contains(b,a)?b:[a,b].filter(Boolean).join(" ");
  for(const tip of (tips.length?tips:[fallback||"Confirm assigned team responsibilities before pulling."])){
   const text=String(tip||"").trim();if(!text)continue;
   const related=quotes.find(c=>c.quote&&text.toLowerCase().includes(String(c.quote).toLowerCase().replace(/[.!?]+$/,"").trim()));
   if(related){
    const key=normalize(related.quote);
    if(spoken.has(key)){const row=spoken.get(key);row.text=mergeText(row.text,text)}
    else{const row={title:"Quote · “"+related.quote+"”",text:mergeText(text,related.response||""),quote:related.quote};result.push(row);spoken.set(key,row)}
   }else use(caption(text),text);
  }
  for(const cue of quotes){
   const key=normalize(cue.quote);if(!key||spoken.has(key))continue;
   use("Quote · “"+cue.quote+"”",cue.response,cue.quote);spoken.set(key,true);
  }
  if(warning&&String(warning).trim())use("Watch out · Avoid a wipe",warning);
  return result.map((row,i)=>({...row,number:String(i+1).padStart(2,"0")}));
 }
 return Object.freeze({rows,caption});
});
