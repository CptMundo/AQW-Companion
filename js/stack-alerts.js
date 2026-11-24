/* AQW Companion Stack Alerts: local-only, source-aware inventory limit checks.
 * Known caps copied only where AQWWiki explicitly states "Stacks up to".
 * Names/categories are data, not code; this module performs no network requests.
 */
(function(root,factory){
 "use strict";
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.AQWCStackAlerts=api;
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 const wikiCaps=[
  ["Void Aura",7500,"void-aura"],
  ["Dark Crystal Shard",1000,"dark-crystal-shard"],
  ["Gem of Nulgath",1000,"gem-of-nulgath"],
  ["Diamond of Nulgath",1000,"diamond-of-nulgath"],
  ["Totem of Nulgath",100,"totem-of-nulgath"],
  ["Tainted Gem",1000,"tainted-gem"],
  ["Blood Gem of the Archfiend",100,"blood-gem-of-the-archfiend"],
  ["Nulgath Insignia",1000,"nulgath-insignia"],
  ["Legion Token",50000,"legion-token"],
  ["Nulgath's Approval",5000,"nulgath-s-approval"],
  ["Spirit Orb",65000,"spirit-orb-misc"],
  ["Elder's Blood",20,"elders-blood"],
  ["Silver Stack",1000,"silver-stack"],
  ["Fiend Token",30,"fiend-token"],
  ["Dark Token",10000,"dark-token"],
  ["Essence of Nulgath",100,"essence-of-nulgath"],
  ["Fresh Soul",1000,"fresh-soul"]
 ];
 const normalize=s=>String(s||"").trim().toLowerCase()
  .replace(/[’‘]/g,"'").replace(/^elders' blood$/,"elder's blood")
  .replace(/\s*\((?:sword|class|misc|weapon|armor|helm|cape|pet)\)$/i,"");
 const caps=new Map(wikiCaps.map(([name,cap,slug])=>[normalize(name),
  Object.freeze({name,cap,source:"AQWWiki",url:"https://aqwwiki.wikidot.com/"+slug})]));
 const validCap=value=>Number.isSafeInteger(Number(value))&&Number(value)>0&&Number(value)<=10000000?Number(value):null;
 const safeWiki=url=>typeof url==="string"&&/^https:\/\/aqwwiki\.wikidot\.com\/[a-z0-9][a-z0-9-]*$/i.test(url)?url:null;
 const safeJoin=join=>typeof join==="string"&&/^\/join [a-z0-9-]{2,50}$/i.test(join.trim())?join.trim():null;
 function analyze(items=[],overrides={},opts={}){
  const near=Number.isFinite(opts.near)?Math.min(.99,Math.max(.5,opts.near)):.9;
  const group=new Map();
  const byRow=new Map();
  for(const item of Array.isArray(items)?items:[]){
   if(!item||typeof item.Name!=="string"||!item.Name.trim())continue;
   const key=normalize(item.Name),bank=Number(item.Bank)===1?1:0;
   const qty=Number(item.Count);
   if(!key||!Number.isFinite(qty)||qty<0)continue;
   // Count a single exported item ID once per location. Duplicate records are
   // not proof of extra stack capacity, and Bank/Bag must never be combined.
   const identifier=String(item.ID??item.Name);
   const rowKey=key+"|"+bank+"|"+identifier;
   const previous=byRow.get(rowKey);
   const cap=validCap(item.MaxStack??item.MaxStackSize??item.MaxQuantity);
   if(!previous||qty>previous.qty)byRow.set(rowKey,{key,name:item.Name,bank,qty,cap,material:!item.Type||/(?:misc|resource|quest|material|consumable|^item$)/i.test(String(item.Type))});
  }
  for(const item of byRow.values()){
   const gkey=item.key+"|"+item.bank;
   if(!group.has(gkey))group.set(gkey,{key:item.key,name:item.name,bank:item.bank,qty:0,exportCaps:new Set(),material:false});
   const row=group.get(gkey);row.qty+=item.qty;row.material=row.material||item.material;
   if(item.cap)row.exportCaps.add(item.cap);
  }
  const alerts=[];let unknown=0,known=0;
  for(const row of group.values()){
   const manual=validCap(overrides?.[row.key]);
   const exportCap=row.exportCaps.size===1?[...row.exportCaps][0]:null;
   const wiki=caps.get(row.key);
   // Ordinary equipment with an exported MaxStack:1 is not a material alert.
   if(!row.material&&!wiki&&!manual)continue;
   const cap=manual??exportCap??wiki?.cap??null;
   if(!cap){if(row.material)unknown++;continue}
   known++;
   const status=row.qty>=cap?"maxed":row.qty>=Math.ceil(cap*near)?"near":null;
   if(!status)continue;
   alerts.push({key:row.key,name:row.name,location:row.bank?"Bank":"Bag",
    qty:row.qty,cap,status,percent:Math.min(100,Math.round(row.qty*100/cap)),
    capSource:manual?"Player limit":exportCap?"Export metadata":"AQWWiki",
    sourceUrl:(!manual&&!exportCap)?wiki?.url||null:null});
  }
  alerts.sort((a,b)=>{
   const order=Number(b.status==="maxed")-Number(a.status==="maxed");
   return order||b.percent-a.percent||a.name.localeCompare(b.name)||a.location.localeCompare(b.location);
  });
  return {alerts,maxed:alerts.filter(x=>x.status==="maxed").length,
   near:alerts.filter(x=>x.status==="near").length,
   known,unknown,checked:group.size};
 }
 function uses(material,{reviewed=[],wishlist=[],community=[]}={}){
  const key=normalize(material);if(!key)return [];
  const entries=[],seen=new Set();
  const add=(entry)=>{
   if(!entry||!entry.title)return;
   const signature=entry.kind+"|"+normalize(entry.title)+"|"+String(entry.url||"");
   if(seen.has(signature))return;
   seen.add(signature);entries.push(entry);
  };
  for(const p of Array.isArray(wishlist)?wishlist:[]){
   if(!p||!Array.isArray(p.steps))continue;
   for(const step of p.steps){
    if(!["material","owned"].includes(step?.kind)||normalize(step.item)!==key)continue;
    add({kind:"Wishlist",title:p.name,quantity:validCap(step.target)||1,
     explanation:"Needed for a goal you are tracking",url:null,join:null});
    break;
   }
  }
  for(const p of Array.isArray(reviewed)?reviewed:[]){
   if(!p||!Array.isArray(p.ingredients))continue;
   for(const ingredient of p.ingredients){
    if(!Array.isArray(ingredient)||normalize(ingredient[0])!==key)continue;
    add({kind:"Reviewed merge",title:p.name,quantity:validCap(ingredient[1])||1,
      explanation:"Required to craft "+p.name,
      url:safeWiki(p.url||p.wiki),join:safeJoin(p.join)});
    break;
   }
  }
  for(const p of Array.isArray(community)?community:[]){
   if(!p||typeof p!=="object")continue;
   // Community datasets may contain reward quests, alternate routes or
   // incomplete merges. Never label them as source-reviewed.
   if(p.complete==="community-merge"&&Array.isArray(p.ingredients)){
    const found=p.ingredients.find(x=>Array.isArray(x)&&normalize(x[0])===key);
    if(found)add({kind:"Community merge",title:p.name,quantity:validCap(found[1])||1,
      explanation:"Community-listed merge; verify ingredients before spending",
      url:safeWiki(p.wiki||p.methods?.find(m=>m?.url)?.url),
      join:safeJoin(p.methods?.find(m=>m?.join)?.join)});
   }
   for(const route of Array.isArray(p.questRoutes)?p.questRoutes:[]){
    const found=(Array.isArray(route?.ingredients)?route.ingredients:[]).find(x=>Array.isArray(x)&&normalize(x[0])===key);
    if(found)add({kind:"Quest",title:route.quest||p.name,quantity:validCap(found[1])||1,
      explanation:"Required by this quest (check unlocks and repeatability)",
      url:safeWiki(route.source),join:safeJoin(route.join)});
   }
  }
  const priority={"Wishlist":0,"Reviewed merge":1,"Quest":2,"Community merge":3};
  return entries.sort((a,b)=>(priority[a.kind]??9)-(priority[b.kind]??9)||a.title.localeCompare(b.title));
 }

 // Narrow, source-reviewed use notes. These are review prompts, never claims
 // of exhaustive uses or automatic recommendations to discard.
 const cleanupNotes=[
  {"name":"Ancient Sigil","kind":"keep","note":"Used in Forgotten Tombs shop merges.","url":"https://aqwwiki.wikidot.com/ancient-sigil"},
  {"name":"Enchanted Dark Blood","kind":"keep","note":"Used to merge Iaste Armor and Legion Arcane Dark Caster.","url":"https://aqwwiki.wikidot.com/enchanted-dark-blood"},
  {"name":"Dark Energy","kind":"keep","note":"A similarly named Misc variant appears in Lae's quest requirements; retain until exact variant is confirmed.","url":"https://aqwwiki.wikidot.com/lae-s-quests"},
  {"name":"Hollow Soul","kind":"keep","note":"A similarly named Misc variant appears in Lae's quests; retain until exact variant is confirmed.","url":"https://aqwwiki.wikidot.com/lae-s-quests"},
  {"name":"Potent Battle Elixir","kind":"keep","note":"Listed combat use-item variants; keep for combat unless exact use and current need are reviewed.","url":"https://aqwwiki.wikidot.com/use-items"},
  {"name":"Potent Destruction Elixir","kind":"keep","note":"Listed combat use-item variants; keep for combat unless exact use and current need are reviewed.","url":"https://aqwwiki.wikidot.com/use-items"},
  {"name":"Potent Life Potion","kind":"keep","note":"Listed combat use-item variants; keep for combat unless exact use and current need are reviewed.","url":"https://aqwwiki.wikidot.com/use-items"},
  {"name":"Potent Malice Potion","kind":"keep","note":"Listed combat use-item variants; keep for combat unless exact use and current need are reviewed.","url":"https://aqwwiki.wikidot.com/use-items"},
  {"name":"Potent Soul Potion","kind":"keep","note":"Listed combat use-item variants; keep for combat unless exact use and current need are reviewed.","url":"https://aqwwiki.wikidot.com/use-items"},
  {"name":"Potent Vigor Potion","kind":"keep","note":"Listed combat use-item variants; keep for combat unless exact use and current need are reviewed.","url":"https://aqwwiki.wikidot.com/use-items"},
  {"name":"Health Potion","kind":"keep","note":"Listed combat use-item variants; keep for combat unless exact use and current need are reviewed.","url":"https://aqwwiki.wikidot.com/use-items"},
  {"name":"Scroll of Psychic Wave","kind":"keep","note":"Listed combat use-item variants; keep for combat unless exact use and current need are reviewed.","url":"https://aqwwiki.wikidot.com/use-items"},
  // Additional conservative use classifications from the 15 Nov 2026 WikiItems snapshot; not exhaustive live checks.
  {"name":"Gear of Doom","kind":"keep","note":"Collect three for a Wheel of Doom spin.","url":"https://aqwwiki.wikidot.com/gear-of-doom"},
  {"name":"Mystic Parchment","kind":"situational","note":"SpellCrafting reagent exchanged for ink. Consider banking when not crafting.","url":"https://aqwwiki.wikidot.com/mystic-parchment"},
  {"name":"Datadisk 3","kind":"keep","note":"Accesses Chapter 3 in Hyperium's VR room.","url":"https://aqwwiki.wikidot.com/datadisk-3"},
  {"name":"Datadisk 4","kind":"keep","note":"Contains the record of the Bonzai Planet trip; retain for the J6 storyline.","url":"https://aqwwiki.wikidot.com/datadisk-4"},
  {"name":"Datadisk 5","kind":"keep","note":"Accesses Chapter 5 in Hyperium's VR room.","url":"https://aqwwiki.wikidot.com/datadisk-5"},
  {"name":"Fishing Bait","kind":"situational","note":"Used in Fishing quests (including Faith's quests). Store only if not fishing or doing those quests.","url":"https://aqwwiki.wikidot.com/fishing-bait"},
  {"name":"Roc Tongue","kind":"situational","note":"Alchemy reagent. Consider banking if not using Alchemy.","url":"https://aqwwiki.wikidot.com/roc-tongue"},
  {"name":"Searbush","kind":"situational","note":"Alchemy reagent. Consider banking if not using Alchemy.","url":"https://aqwwiki.wikidot.com/searbush"},
  {"name":"Moglin Tears","kind":"situational","note":"Alchemy reagent. Consider banking if not using Alchemy.","url":"https://aqwwiki.wikidot.com/moglin-tears"},
  {"name":"Rhison Blood","kind":"situational","note":"Alchemy reagent. Consider banking if not using Alchemy.","url":"https://aqwwiki.wikidot.com/rhison-blood"},
  {"name":"Evil Token","kind":"keep","note":"Grants access associated with the Evil faction; keep for unlocks.","url":"https://aqwwiki.wikidot.com/evil-token"},
  {"name":"Nation Round 4 Medal","kind":"keep","note":"Unlocks farming quests at Shadowblast.","url":"https://aqwwiki.wikidot.com/nation-round-4-medal"},
  {"name":"Legion Round 4 Medal","kind":"keep","note":"Unlocks farming quests at Shadowblast.","url":"https://aqwwiki.wikidot.com/legion-round-4-medal"},
  {"name":"Legendary Awe Pass","kind":"keep","note":"Unlocks Armor of Awe quests from Valencia.","url":"https://aqwwiki.wikidot.com/legendary-awe-pass"},
  {"name":"BoneBreaker Fortress Map","kind":"keep","note":"Unlocks the adventure map and exclusive farming quest.","url":"https://aqwwiki.wikidot.com/bonebreaker-fortress-map"},
  {"name":"Legendary Hilt","kind":"keep","note":"Blade of Awe progression component.","url":"https://aqwwiki.wikidot.com/legendary-hilt"},
  {"name":"Grimskull's Face","kind":"keep","note":"Used to create the level 100 Grim weapon enhancement.","url":"https://aqwwiki.wikidot.com/grimskull-s-face"},
  {"name":"Arcane Quill","kind":"situational","note":"Exchange for magical inks used in SpellCrafting.","url":"https://aqwwiki.wikidot.com/arcane-quill"},
  {"name":"Scroll of Enrage","kind":"keep","note":"Taunt consumable, useful for boss mechanics.","url":"https://aqwwiki.wikidot.com/scroll-of-enrage"},
  {"name":"Viper's Blood","kind":"keep","note":"Combat consumable that grants haste and critical chance.","url":"https://aqwwiki.wikidot.com/viper-s-blood"},
  {"name":"Potent Honor Potion","kind":"keep","note":"Combat damage consumable.","url":"https://aqwwiki.wikidot.com/potent-honor-potion"},
  {"name":"Potent Heart Potion","kind":"keep","note":"Healing consumable.","url":"https://aqwwiki.wikidot.com/potent-heart-potion"},
  {"name":"Shriekward Potion","kind":"situational","note":"Quest-related combat potion in the Mirror Drakath storyline. Store only when no active quest or fight needs it.","url":"https://aqwwiki.wikidot.com/shriekward-potion"},
  {"name":"Infinity Codex","kind":"keep","note":"Used for the obelisk/gate progression; retain for unlocks.","url":"https://aqwwiki.wikidot.com/infinity-codex"},
  {"name":"Golden Item of Digital Awesomeness","kind":"keep","note":"Special redemption item; check redemption before spending or moving.","url":"https://aqwwiki.wikidot.com/golden-item-of-digital-awesomeness"},
  {"name":"Mythic Item of Digital Awesomeness","kind":"keep","note":"Special item; retain until redemption eligibility is verified.","url":"https://aqwwiki.wikidot.com/mythic-item-of-digital-awesomeness"},
  {"name":"Entropic Ink","kind":"situational","note":"SpellCrafting ink for scroll recipes. Consider banking if not crafting.","url":"https://aqwwiki.wikidot.com/entropic-ink"},
  {"name":"Zealous Ink","kind":"situational","note":"SpellCrafting ink for scroll recipes. Consider banking if not crafting.","url":"https://aqwwiki.wikidot.com/zealous-ink"},
  {"name":"Runic Ink","kind":"situational","note":"SpellCrafting ink for scroll recipes. Consider banking if not crafting.","url":"https://aqwwiki.wikidot.com/runic-ink"},
  {"name":"Radiant Ink","kind":"situational","note":"SpellCrafting ink for scroll recipes. Consider banking if not crafting.","url":"https://aqwwiki.wikidot.com/radiant-ink"},
  {"name":"Hallow Ink","kind":"situational","note":"SpellCrafting ink for scroll recipes. Consider banking if not crafting.","url":"https://aqwwiki.wikidot.com/hallow-ink"},
  {"name":"Fading Ink","kind":"situational","note":"SpellCrafting ink for scroll recipes. Consider banking if not crafting.","url":"https://aqwwiki.wikidot.com/fading-ink"},
  {"name":"Ember Ink","kind":"situational","note":"SpellCrafting ink for scroll recipes. Consider banking if not crafting.","url":"https://aqwwiki.wikidot.com/ember-ink"},
  {"name":"Elemental Ink","kind":"situational","note":"SpellCrafting ink for scroll recipes. Consider banking if not crafting.","url":"https://aqwwiki.wikidot.com/elemental-ink"},
  {"name":"Scroll of Death Pact","kind":"keep","note":"Combat consumable. Retain for relevant combat builds; not a discard candidate.","url":"https://aqwwiki.wikidot.com/scroll-of-death-pact"},
  {"name":"Scroll of Cantor's Lament","kind":"keep","note":"Combat consumable. Retain for relevant combat builds; not a discard candidate.","url":"https://aqwwiki.wikidot.com/scroll-of-cantor-s-lament"},
  {"name":"Scroll of Pulse Compression","kind":"keep","note":"Combat consumable. Retain for relevant combat builds; not a discard candidate.","url":"https://aqwwiki.wikidot.com/scroll-of-pulse-compression"},
  {"name":"Unstable Spiritual Elixir","kind":"keep","note":"Combat consumable. Retain for relevant combat builds; not a discard candidate.","url":"https://aqwwiki.wikidot.com/unstable-spiritual-elixir"},
  {"name":"Unstable Divine Elixir","kind":"keep","note":"Combat consumable. Retain for relevant combat builds; not a discard candidate.","url":"https://aqwwiki.wikidot.com/unstable-divine-elixir"},
  {"name":"Unstable Malevolence Elixir","kind":"keep","note":"Combat consumable. Retain for relevant combat builds; not a discard candidate.","url":"https://aqwwiki.wikidot.com/unstable-malevolence-elixir"},
  {"name":"Unstable Battle Elixir","kind":"keep","note":"Combat consumable. Retain for relevant combat builds; not a discard candidate.","url":"https://aqwwiki.wikidot.com/unstable-battle-elixir"},
  {"name":"Unstable Velocity Elixir","kind":"keep","note":"Combat consumable. Retain for relevant combat builds; not a discard candidate.","url":"https://aqwwiki.wikidot.com/unstable-velocity-elixir"},
  {"name":"Armor of Awe Pass","kind":"keep","note":"Unlocks Valencia's Armor of Awe quests; keep if you need access.","url":"https://aqwwiki.wikidot.com/armor-of-awe-pass"},
  {"name":"Aegis Armor","kind":"situational","note":"Used to merge Aegis Guardian in the Archive of Time shop. Store only if not pursuing it.","url":"https://aqwwiki.wikidot.com/archive-of-time-merge"},
  {"name":"Aegis Robe","kind":"situational","note":"Used to merge Aegis Guardian in the Archive of Time shop. Store only if not pursuing it.","url":"https://aqwwiki.wikidot.com/archive-of-time-merge"},
  {"name":"Arashtite Ore","kind":"situational","note":"Alchemy reagent and More Ore quest ingredient; keep if using Alchemy, otherwise consider banking.","url":"https://aqwwiki.wikidot.com/arashtite-ore"},
  {"name":"ArchMage Ink","kind":"situational","note":"SpellCrafting reagent for six scroll recipes. Consider banking only if not crafting scrolls.","url":"https://aqwwiki.wikidot.com/archmage-ink"},
  {"name":"Azkorath's Wing","kind":"situational","note":"Used in the Arcana Invoker Resource Shop to merge 14 - Temperance's Frugality. Keep if pursuing that item.","url":"https://aqwwiki.wikidot.com/azkorath-s-wing"},
  {"name":"Apocalyptic Nihil Coin","kind":"situational","note":"Currency for MonaghanGorge Shop merges. Consider banking if not pursuing that shop.","url":"https://aqwwiki.wikidot.com/apocalyptic-nihil-coin"},
  {"name":"Belrot the Fiend Essence","kind":"keep","note":"Ingredient of Retrieve Void Auras; keep for future Void Aura farming.","url":"https://aqwwiki.wikidot.com/belrot-the-fiend-essence"},
  {"name":"Astral Ephemerite Essence","kind":"keep","note":"Ingredient of Retrieve Void Auras; keep for future Void Aura farming.","url":"https://aqwwiki.wikidot.com/astral-ephemerite-essence"},
  {name:"Necrotic Sword's Blade",goal:"Necrotic Sword of Doom",kind:"goal",note:"Wiki lists the NSoD merge. Review surplus only if you already own the sword and no other tracked goal needs it.",url:"https://aqwwiki.wikidot.com/necrotic-sword-s-blade"},
  {name:"Necrotic Sword's Aura",goal:"Necrotic Sword of Doom",kind:"goal",note:"Wiki lists the NSoD merge. Review surplus only if you already own the sword and no other tracked goal needs it.",url:"https://aqwwiki.wikidot.com/necrotic-sword-s-aura"},
  {name:"Gray Matter",kind:"quest",note:"Listed for Body, Soul and, Domination (one-time quest). Confirm completion in game first.",url:"https://aqwwiki.wikidot.com/gray-matter",questUrl:"https://aqwwiki.wikidot.com/a-mysterious-stranger-s-quests"},
  {name:"Wheel of Bacon Token",kind:"situational",note:"Used for the Legend Wheel of Bacon quest. Consider banking if you are not using it.",url:"https://aqwwiki.wikidot.com/wheel-of-bacon-token"}
 ];

 const cleanupActivities=Object.freeze({
  spellcraft:['Mystic Parchment','Arcane Quill','ArchMage Ink','Entropic Ink','Zealous Ink','Runic Ink','Radiant Ink','Hallow Ink','Fading Ink','Ember Ink','Elemental Ink'],
  alchemy:['Arashtite Ore','Roc Tongue','Searbush','Moglin Tears','Rhison Blood'],
  fishing:['Fishing Bait'],
  seasonal:['Aegis Armor','Aegis Robe'],
  merge:["Azkorath's Wing","Apocalyptic Nihil Coin"],
  quest:['Shriekward Potion','Wheel of Bacon Token']
 });
 function cleanupGroup(name,status){
  if(status==='protected')return 'protected';
  if(status==='unknown')return 'unknown';
  if(status==='review')return 'surplus';
  return Object.keys(cleanupActivities).find(k=>cleanupActivities[k].some(n=>normalize(n)===normalize(name)))||'other';
 }
 function cleanup(items=[],{reviewed=[],wishlist=[],community=[],routines=[],knownCaps:protectCaps=true}={}){
  const known=new Set(),usesByName=new Map(),tracked=new Set(),owned=new Set(),notes=new Map(cleanupNotes.map(x=>[normalize(x.name),x]));
  const add=(set,value)=>{if(typeof value==="string"&&normalize(value))set.add(normalize(value))};
  const addIngredients=(ingredients,title)=>{for(const x of Array.isArray(ingredients)?ingredients:[])if(Array.isArray(x)&&typeof x[0]==="string"){const k=normalize(x[0]);add(known,x[0]);if(!usesByName.has(k))usesByName.set(k,new Set());usesByName.get(k).add(normalize(title)||"unknown route")}};
  for(const p of reviewed)addIngredients(p?.ingredients,p?.name);
  for(const p of community){addIngredients(p?.ingredients,p?.name);for(const r of Array.isArray(p?.questRoutes)?p.questRoutes:[])addIngredients(r?.ingredients,r?.quest||p?.name);for(const r of Array.isArray(p?.cleanupMergeRoutes)?p.cleanupMergeRoutes:[])addIngredients(r?.ingredients,p?.name)}
  for(const p of wishlist){add(tracked,p?.name);for(const step of p?.steps||[])if(["material","owned"].includes(step?.kind))add(tracked,step.item)}
  const routineText=routines.flatMap(r=>[r?.name,r?.note,...(r?.rewards||[]),...(r?.targets||[])]).map(x=>normalize(Array.isArray(x)?x.join(" "):x)).join("\n");
  for(const x of items)if(Number(x?.Count)>0&&x?.Name&&/^(?:sword|weapon)$/i.test(String(x.Type)))add(owned,x.Name);
  const rows=[],seen=new Set();
  for(const x of items){
   if(!x||Number(x.Bank)!==0||!Number.isFinite(Number(x.Count))||Number(x.Count)<=0||!x.Name||!/(?:^item$|^misc(?:ellaneous| item)?$|^resource$|^quest item$|^material$)/i.test(String(x.Type).trim()))continue;
   const key=normalize(x.Name),id=String(x.ID??x.Name);if(!key||seen.has(id))continue;seen.add(id);
   const n=notes.get(key),trackedUse=tracked.has(key)||routineText.includes(key);
   let status="unknown",reason="No confirmed use in the current catalog. Review on the Wiki; absence of data does not mean unnecessary.",url=null,questUrl=null;
   if(trackedUse){status="protected";reason="Referenced by a tracked goal or routine."}
   else if(n?.kind==="goal"&&owned.has(normalize(n.goal))&&[...(usesByName.get(key)||[])].every(use=>use===normalize(n.goal))){status="review";reason=n.note;url=n.url}
   else if(n?.kind==='keep'){status='protected';reason=n.note;url=n.url}
   else if(/^\[class item\]/i.test(x.Name)||/\bTimelock Key(?: \(Misc\))?$/i.test(x.Name)){status='protected';reason='Class-use or unlock item; do not treat it as cleanup material.'}
   else if(n?.kind==='situational'){status='situational';reason=n.note;url=n.url}
   else if(known.has(key)||protectCaps&&caps.has(key)||n?.kind==="goal"){status="protected";const uses=[...(usesByName.get(key)||[])];reason=uses.length?'Known uses: '+uses.slice(0,4).join(', ')+(uses.length>4?' + '+(uses.length-4)+' more':'')+'. Keep until reviewed.':'Stack-tracked material or unfinished target. Keep until reviewed.';url=n?.url||null}
   else if(n){status=n.kind==="situational"?"situational":"review";reason=n.note;url=n.url;questUrl=n.questUrl||null}
   const knownUses=[...(usesByName.get(key)||[])].filter(u=>u!=='unknown route');
   rows.push({id,name:x.Name,quantity:Number(x.Count),status,reason,url,questUrl,group:cleanupGroup(x.Name,status),knownUses,acTagged:Number(x.Coins)===1});

  }
  const order={review:0,situational:1,unknown:2,protected:3};
  rows.sort((a,b)=>order[a.status]-order[b.status]||a.name.localeCompare(b.name));
  return {rows,review:rows.filter(x=>x.status==="review").length,situational:rows.filter(x=>x.status==="situational").length,unknown:rows.filter(x=>x.status==="unknown").length,protected:rows.filter(x=>x.status==="protected").length};
 }
 return Object.freeze({analyze,uses,cleanup,normalize,safeWiki,safeJoin,validCap,
  knownCaps:Object.freeze(wikiCaps.map(([name,cap,slug])=>Object.freeze({name,cap,url:"https://aqwwiki.wikidot.com/"+slug})))});
});
