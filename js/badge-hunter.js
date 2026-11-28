'use strict';
(function(root){
const KEY='aqwc-badge-hunter-v1',validStates=['tracked','owned'];
function serverDay(now=new Date()){return new Date(now.getTime()-5*3600000).toISOString().slice(0,10)}
function availability(b,day=serverDay()){
 if(!b.window){if(b.kind==='legacy')return 'Rare / historical';if(b.kind==='unknown')return 'Availability unconfirmed';if(b.kind==='seasonal'||b.kind==='event')return 'Return unconfirmed';return 'Requirements documented'}
 return day<b.window.start?'Announced':day<=b.window.end?'Within announced dates':'Window ended';
}
function clean(value,catalog){
 if(!value||typeof value!=='object'||Array.isArray(value))return {};
 const ids=new Set(catalog.map(b=>b.id));return Object.fromEntries(Object.entries(value).filter(([id,state])=>ids.has(id)&&validStates.includes(state)));
}
function update(value,id,state,catalog){
 const next=clean(value,catalog);if(!catalog.some(b=>b.id===id)||!['unmarked',...validStates].includes(state))return next;
 if(state==='unmarked')delete next[id];else next[id]=state;return next;
}
function opportunities(catalog,state,day=serverDay()){return catalog.filter(b=>['seasonal','event'].includes(b.kind)&&availability(b,day)==='Within announced dates'&&state[b.id]!=='owned')}
function filterBadges(catalog,state,query='',category='all',status='all',day=serverDay()){
 const q=query.trim().toLowerCase();return catalog.filter(b=>(category==='all'||b.category===category)&&(status==='all'||(status==='seasonal'?b.kind==='seasonal':status==='active'?availability(b,day)==='Within announced dates':(state[b.id]||'unmarked')===status))&&(!q||[b.name,b.requirement,b.category,b.join,b.guide,...(b.requirements||[]),...(b.tags||[]),...(b.requirementLinks||[]).map(x=>x.label)].filter(Boolean).join(' ').toLowerCase().includes(q)));
}
function matchCapture(snapshot,catalog){
 if(!snapshot||typeof snapshot.character!=='string'||!snapshot.character.trim()||snapshot.character.length>80||/[\u0000-\u001f\u007f]/.test(snapshot.character)||typeof snapshot.capturedAt!=='string'||!Number.isFinite(Date.parse(snapshot.capturedAt))||!Array.isArray(snapshot.badges)||!snapshot.badges.length||snapshot.badges.length>2000)throw Error('Invalid capture');
 const byFile=new Map(),norm=s=>String(s||'').normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
 for(const b of catalog){if(b.placeholder||!b.image)continue;const file=b.image.split(/[?#]/)[0].split('/').pop().toLowerCase();if(!byFile.has(file))byFile.set(file,[]);byFile.get(file).push(b)}
 const ids=new Set(),ambiguous=new Set(),unknown=new Set(),storyGroups=new Set();
 for(const row of snapshot.badges){
 if(typeof row?.file!=='string'||! /^[a-z0-9_.%()-]{1,220}\.(?:png|jpe?g|gif|webp)$/i.test(row.file)||typeof row.label!=='string'||row.label.length>200)throw Error('Invalid badge image reference');
 const file=row.file.toLowerCase(),matches=byFile.get(file)||[];
 if(matches.length===1)ids.add(matches[0].id);
 else if(matches.length>1){const named=matches.filter(b=>norm(b.name)===norm(row.label));if(named.length===1)ids.add(named[0].id);else {ambiguous.add(file);if(matches.length===2&&matches.every(b=>['cp-29','cp-30'].includes(b.id))&&file==='chaos-champion.jpg'&&(!row.label||norm(row.label)==='champion of chaos'))storyGroups.add('champion-of-chaos')}}
 else unknown.add(file);
 }
 return {character:snapshot.character.trim(),capturedAt:snapshot.capturedAt,ids:[...ids],storyGroups:[...storyGroups],ambiguous:ambiguous.size,unknown:unknown.size};
}

// Reviewed terminal story quests only. No name matching, paid badges or inferred access gates.
const CHAOS_CHAPTERS=Object.freeze(['escherion','vath','kitsune','wolfwing','kimberly','ledgermayne','tibicenas','khasaanda','iadoa','lionfang','xiang','alteon','finale'].map(id=>'chaos:'+id));
const STORY_BADGES=Object.freeze({
 "cp-471":{"chapter":"shadows:forestreach","source":"https://aqwwiki.wikidot.com/drakath-s-quests","prerequisite":true,"reason":"Chaos PuppetMaster is awarded for Undying Rage after Heart of the Power; Down Below questline requires Tame the Queen, the final quest of Transformation in the Queen's Past chapter."},
 "cp-490":{"chapter":"chaos:finale","source":"https://aqwwiki.wikidot.com/champion-drakath-location","category":"Epic Hero","prerequisite":true,"reason":"The Chaos Avenger Class quest is at Champion Drakath, a locked location requiring The Final Showdown!."},
 "cp-597":{"chapter":"shadows:ruinedcrown","source":"https://aqwwiki.wikidot.com/ultra-speaker","category":"Epic Hero","prerequisite":true,"reason":"Radiant Goddess of War Badge is earned from Vohu at Ultra Speaker, a locked location requiring Your Hero."},
 "cp-31":{"chapter":"chaos:finale","source":"https://aqwwiki.wikidot.com/confrontation-s-quests","category":"Epic Hero","prerequisite":true,"reason":"Both Drakath's Armor badge quest routes require The Final Showdown!."},
 "cp-61":{"chapter":"chaos:iadoa","source":"https://aqwwiki.wikidot.com/warlic-s-quests","prerequisite":true,"reason":"Defeat Ultra Iadoa requires the Chaos Lord Iadoa story quest."},
 "cp-635":{"chapter":"other:darkon","source":"https://aqwwiki.wikidot.com/arcana-particle-s-quests","category":"Epic Hero","prerequisite":true,"reason":"Arcana Invoker requires the completed Elegy of Madness saga."},
 "cp-591":{"chapter":"ruin:sea","source":"https://aqwwiki.wikidot.com/tara-s-quests","prerequisite":true,"reason":"The badge quest explicitly requires Dead Sea, the main Voice in the Sea boss story quest."},
 "cp-712":{"chapter":"ruin:thunder","source":"https://aqwwiki.wikidot.com/queen-victoria-alteon-s-quests","category":"Epic Hero","prerequisite":true,"reason":"Echo of the King requires Tell-Tale Heart, which requires The Storm Queen."},
 'cp-29':{chapter:'chaos:finale',source:'https://aqwwiki.wikidot.com/charpage:29',category:'Epic Hero'},
 'cp-30':{chapter:'chaos:finale',source:'https://aqwwiki.wikidot.com/charpage:30',category:'Epic Hero'},
 'cp-436':{chapters:CHAOS_CHAPTERS,source:'https://www.aq.com/gamedesignnotes/12thanniversaryclass-full-8061',category:'Epic Hero',prerequisite:true},
 'cp-60':{chapter:'chaos:tutorial',source:'https://aqwwiki.wikidot.com/charpage:60'},
 'cp-66':{chapter:'chaos:xiang',source:'https://aqwwiki.wikidot.com/story:xing-xang'},
 'cp-576':{chapter:'shadows:ruinedcrown',source:'https://www.aq.com/gamedesignnotes/aqw-24feb23-shadowflamefinalevi-9105',extra:[{chapter:'shadows:fireplanewar',source:'https://aqwwiki.wikidot.com/shadows-of-chaos:alliance-of-crowns',prerequisite:true,reason:'The finale begins with a mandatory Avatar of Fire completion gate.'}]},
 'cp-577':{chapter:'other:darkon',source:'https://aqwwiki.wikidot.com/story:darkon-s-elegy-of-madness'},
 'cp-72':{chapter:'other:ravenloss',source:'https://aqwwiki.wikidot.com/story:ravenloss'}
});
const STORY_HINTS=Object.freeze({
"cp-74":{"chapter":"chaos:tutorial","source":"https://aqwwiki.wikidot.com/breakstone","reason":"Legacy Breakstone rescue proves an introductory quest, not necessarily current tutorial completion."},
"cp-51":{"chapter":"other:doomwood","source":"https://aqwwiki.wikidot.com/story:doomwood","reason":"Stone Paladin's quest is an intermediate DoomWood milestone."},
"cp-59":{"chapter":"other:doomwood","source":"https://aqwwiki.wikidot.com/doomwood:part1","reason":"Charging Up! awards Story ARC before the final confrontation."},
"cp-468":{"chapter":"throne:vaden","category":"Epic Hero","source":"https://aqwwiki.wikidot.com/trissa-s-quests","reason":"Awe-scention requires Vaden's Helm via an earlier quest. Boss tokens do not establish Vaden's Defeat turn-in."},
 "cp-436": {
  "chapters": [
   "dragons:gluttony",
   "dragons:pride",
   "dragons:greed",
   "dragons:sloth",
   "dragons:lust",
   "dragons:envy",
   "dragons:wrath"
  ],
  "category": "Epic Hero",
  "source": "https://aqwwiki.wikidot.com/the-chest-s-quest",
  "reason": "Dragon of Time requires the Mysterious Egg and all seven keys. Boss access or key drops may bypass individual story quest turn-ins."
 },
 "cp-54": {
  "chapter": "other:etherstorm",
  "source": "https://aqwwiki.wikidot.com/story:etherstorm-wastes",
  "reason": "Open the DragonGate is a story milestone, before the later Desoloth finale."
 },
 "cp-73": {
  "chapter": "other:ravenloss",
  "source": "https://aqwwiki.wikidot.com/riadne-s-quests",
  "reason": "Save the SoulWeaver is required, but the later Ravenloss War is separate."
 },
 "cp-65": {
  "chapter": "chaos:xiang",
  "source": "https://aqwwiki.wikidot.com/battle-badges",
  "reason": "Defeating the second Chaos Beast does not by itself establish the Chaos Lord finale."
 },
 "cp-646": {
  "chapter": "ruin:thunder",
  "source": "https://aqwwiki.wikidot.com/felix-taylor-s-quests",
  "reason": "The separate world-boss badge quest does not list the main story quest as a prerequisite."
 },
 "cp-744": {
  "chapter": "ruin:flame",
  "source": "https://aqwwiki.wikidot.com/warlic-s-quests",
  "reason": "World-boss event participation is not proof of all Flame of the Beyond story quests."
 },
 "cp-27": {
  "chapter": "other:doomwood",
  "category": "Epic Hero",
  "source": "https://aqwwiki.wikidot.com/artix-s-quests",
  "reason": "The axe farm starts with a DoomWood Part 1 ending; later parts remain unverified."
 },
 "cp-423": {
  "chapter": "other:doomwood",
  "source": "https://aqwwiki.wikidot.com/blinding-light-of-destiny-s-quests",
  "reason": "Never Give Up proves a Stonewood questline milestone, not all Doomwood stories."
 },
 "cp-55": {
  "chapter": "chaos:ledgermayne",
  "source": "https://aqwwiki.wikidot.com/battle-badges",
  "reason": "Magic Thief is a separate story event; Arcangrove completion is not established.",
  "relatedOnly": true
 },
 "cp-84": {
  "chapter": "queen:celestial",
  "source": "https://aqwwiki.wikidot.com/aranx-s-quests",
  "reason": "The Celestial Tournament is separate from A Theft of Light; story completion is not established.",
  "relatedOnly": true
 },
 "cp-594": {
  "chapter": "queen:infernal",
  "source": "https://aqwwiki.wikidot.com/aranx-s-quests",
  "reason": "Infernal Arena is a separate questline; Infernal Invasion is not established.",
  "relatedOnly": true
 },
 "cp-9": {
  "chapter": "other:nythera",
  "category": "Legendary",
  "source": "https://aqwwiki.wikidot.com/nythera-s-quests",
  "reason": "Signing the conduct scroll is unrelated to Nythera's saga.",
  "relatedOnly": true
 }
});
function storyHints(capture,catalog){
 const out={};if(!capture||typeof capture.character!=='string'||!capture.character.trim()||!Array.isArray(capture.ids)||!Number.isFinite(Date.parse(capture.capturedAt)))return out;const byId=new Map(catalog.map(b=>[b.id,b]));for(const id of new Set(capture.ids)){if(typeof id!=='string'||!Object.hasOwn(STORY_HINTS,id))continue;const r=STORY_HINTS[id],b=byId.get(id);if(!b||b.paid||b.category!==(r.category||'Battle')||r.relatedOnly)continue;for(const chapter of r.chapters||[r.chapter])(out[chapter]??=[]).push({id,name:b.name,source:r.source,reason:r.reason});}return out;
}
function storyEvidence(capture,catalog){
 const out={};if(!capture||typeof capture.character!=='string'||!capture.character.trim()||!Array.isArray(capture.ids)||!Number.isFinite(Date.parse(capture.capturedAt)))return out;
 const byId=new Map(catalog.map(b=>[b.id,b]));
 for(const id of new Set(capture.ids)){if(typeof id!=='string'||!Object.hasOwn(STORY_BADGES,id))continue;const b=byId.get(id),rule=STORY_BADGES[id];if(!b||b.paid||b.category!==(rule.category||'Battle'))continue;for(const claim of [...(rule.chapters||[rule.chapter]).map(chapter=>({...rule,chapter})),...(rule.extra||[])]){(out[claim.chapter]??=[]).push({id,name:b.name,image:b.image,source:claim.source,character:capture.character,prerequisite:!!claim.prerequisite,reason:claim.reason||''});}}
 if(Array.isArray(capture.storyGroups)&&capture.storyGroups.includes('champion-of-chaos')&&!capture.ids.some(id=>id==='cp-29'||id==='cp-30')){const a=byId.get('cp-29'),b=byId.get('cp-30');if(a?.category==='Epic Hero'&&b?.category==='Epic Hero'&&!a.paid&&!b.paid)(out['chaos:finale']??=[]).push({id:'champion-of-chaos',name:'Champion of Chaos (variant unknown)',image:a.image,source:'https://www.aq.com/lore/guides/quests',character:capture.character,prerequisite:false});}
 return out;
}

// Positive-only inventory evidence. Never treat an absent item or a boss drop as a failed quest.
// Artix excludes Book of Lore achievement rewards and miscellaneous items from IoDA:
// https://www.aq.com/lore/guides/prizeredemption
const STORY_ITEM_RULES=Object.freeze([
 {
  "name": "Ascended Avatar's Blade",
  "type": "Sword",
  "chapter": "chaos:prologue",
  "source": "https://aqwwiki.wikidot.com/ascended-avatar-s-blade",
  "reason": "Exclusive Prologue Complete reward; Robina's quests and the castle cutscenes are required.",
  "verified": true
 },
 {
  "name": "Phoenix Hunter Quiver",
  "type": "Cape",
  "chapter": "chaos:escherion",
  "source": "https://aqwwiki.wikidot.com/phoenix-hunter-quiver",
  "reason": "Exclusive Chiral Valley Champion Book of Lore reward.",
  "verified": true
 },
 {
  "name": "Volcanic Fire Spear",
  "type": "Polearm",
  "chapter": "chaos:vath",
  "source": "https://aqwwiki.wikidot.com/volcanic-fire-spear",
  "reason": "Exclusive Dwarfhold Champion reward.",
  "verified": true
 },
 {
  "name": "Amethyst Mace",
  "type": "Mace",
  "chapter": "chaos:kitsune",
  "source": "https://aqwwiki.wikidot.com/yokai-champion",
  "reason": "Shop requires completed Yokai Island saga.",
  "verified": true
 },
 {
  "name": "Sapphire Mace",
  "type": "Mace",
  "chapter": "chaos:wolfwing",
  "source": "https://aqwwiki.wikidot.com/darkovia-champion",
  "reason": "Shop requires completed Darkovia saga.",
  "verified": true
 },
 {
  "name": "Rocker Locks",
  "type": "Helm",
  "chapter": "chaos:kimberly",
  "source": "https://aqwwiki.wikidot.com/rocker-locks",
  "reason": "Exclusive Mythsong Champion reward.",
  "verified": true
 },
 {
  "name": "Invoker Staff",
  "type": "Staff",
  "chapter": "chaos:ledgermayne",
  "source": "https://aqwwiki.wikidot.com/invoker-staff",
  "reason": "Exclusive Arcangrove Champion reward.",
  "verified": true
 },
 {
  "name": "Elite Phoenix Locks",
  "type": "Helm",
  "chapter": "chaos:khasaanda",
  "source": "https://aqwwiki.wikidot.com/elite-phoenix-locks",
  "reason": "Exclusive Bloodtusk Champion reward.",
  "verified": true
 },
 {
  "name": "Ruler Of The Deep",
  "type": "Armor",
  "chapter": "chaos:iadoa",
  "source": "https://aqwwiki.wikidot.com/ruler-of-the-deep",
  "reason": "TheSpan Champion shop requires completed Span saga.",
  "verified": true
 },
 {
  "name": "Dark Summoner",
  "type": "Armor",
  "chapter": "chaos:lionfang",
  "source": "https://aqwwiki.wikidot.com/dark-summoner",
  "reason": "Exclusive ThunderForge Champion reward.",
  "verified": true
 },
 {
  "name": "PaladinSlayer Daimyo",
  "type": "Pet",
  "chapter": "chaos:xiang",
  "source": "https://aqwwiki.wikidot.com/paladinslayer-daimyo",
  "reason": "Exclusive Mirror Realm Champion reward.",
  "verified": true
 },
 {
  "name": "Lore's Champion Seal",
  "type": "Item",
  "chapter": "chaos:finale",
  "source": "https://aqwwiki.wikidot.com/lore-s-champion-seal",
  "reason": "DoomSkull Champion shop requires Mount DoomSkull completion; not proof of earlier chapters.",
  "verified": true
 },
 {
  "name": "Peanut",
  "type": "Item",
  "chapter": "other:j6",
  "source": "https://aqwwiki.wikidot.com/peanut",
  "reason": "Awarded after choosing to save J6 at the ending, or from the J6 House shop unlocked by the completed quest chain. Miscellaneous items are excluded from IoDA.",
  "verified": true
 },
 {
  "name": "Arcana Invoker",
  "type": "Class",
  "chapter": "other:darkon",
  "source": "https://aqwwiki.wikidot.com/arcana-invoker",
  "reason": "Class shop follows The World and the class quest chain; item acquisition provenance not independently verified.",
  "verified": false
 },
 {
  "name": "Chaos Avenger",
  "type": "Class",
  "chapter": "chaos:finale",
  "source": "https://aqwwiki.wikidot.com/chaos-avenger",
  "reason": "Normal class acquisition requires access to Champion Drakath. Item alone does not certify the quest route.",
  "verified": false
 },
 {
  "name": "King's Echo",
  "type": "Class",
  "chapter": "ruin:thunder",
  "source": "https://aqwwiki.wikidot.com/alteon-s-gear",
  "reason": "Normal class shop requires Echo of the King; item acquisition provenance not independently verified.",
  "verified": false
 },
 {
  "name": "Radiant Goddess of War",
  "type": "Armor",
  "chapter": "shadows:ruinedcrown",
  "source": "https://aqwwiki.wikidot.com/radiant-goddess-of-war",
  "reason": "Normal farm uses Ultra Speaker; possession alone does not establish the acquisition route.",
  "verified": false
 },
 {
  "name": "Chaorrupted Sorcerer's Staff",
  "type": "Staff",
  "chapter": "shadows:forestreach",
  "source": "https://aqwwiki.wikidot.com/deep-tunnel-merge",
  "reason": "Normal merge shop requires Tame the Queen; alternate acquisition not fully excluded.",
  "verified": false
 },
 {
  "name": "J6's Sword",
  "type": "Sword",
  "chapter": "other:j6",
  "source": "https://aqwwiki.wikidot.com/bounty-hunter-shop",
  "reason": "Requires Mission 5, which precedes saga completion.",
  "verified": false
 },
 {
  "name": "J6's Hammer",
  "type": "Mace",
  "chapter": "other:j6",
  "source": "https://aqwwiki.wikidot.com/j6-s-hammer",
  "reason": "Requires Mission 1, not the finale.",
  "verified": false
 }
]);
const STORY_BOOK_RULES=Object.freeze([
 {
  "name": "Tutorial",
  "chapter": "chaos:tutorial",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 },
 {
  "name": "Swordhaven Savior",
  "chapter": "chaos:prologue",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 },
 {
  "name": "Chiral Valley Champion",
  "chapter": "chaos:escherion",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 },
 {
  "name": "Dwarfhold Champion",
  "chapter": "chaos:vath",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 },
 {
  "name": "Yokai Champion",
  "chapter": "chaos:kitsune",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 },
 {
  "name": "Darkovia Champion",
  "chapter": "chaos:wolfwing",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 },
 {
  "name": "Mythsong Champion",
  "chapter": "chaos:kimberly",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 },
 {
  "name": "Arcangrove Champion",
  "chapter": "chaos:ledgermayne",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 },
 {
  "name": "Sandsea Champion",
  "chapter": "chaos:tibicenas",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 },
 {
  "name": "Bloodtusk Champion",
  "chapter": "chaos:khasaanda",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 },
 {
  "name": "The Span Champion",
  "chapter": "chaos:iadoa",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 },
 {
  "name": "Thunderforge Champion",
  "chapter": "chaos:lionfang",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 },
 {
  "name": "Mirror Realm Champion",
  "chapter": "chaos:xiang",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 },
 {
  "name": "Swordhaven Champion",
  "chapter": "chaos:alteon",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 },
 {
  "name": "Chaos Realm",
  "chapter": "chaos:finale",
  "source": "https://aqwwiki.wikidot.com/book-of-lore-badges"
 }
]);
function storyItemKey(x){return typeof x==='string'?x.normalize('NFKC').replace(/[‘’]/g,"'").trim().toLowerCase():''}
function storyInventoryEvidence(rows,source='full',allowVerified=false){
 const verified={},hints={};if(!Array.isArray(rows)||!['full','public'].includes(source))return {verified,hints};
 const index=new Map();
 for(const item of rows){if(!item||typeof item!=='object')continue;const name=storyItemKey(source==='full'?item.Name:item.name),type=storyItemKey(source==='full'?item.Type:item.type);const quantity=source==='full'?item.Count:item.quantity;if(!name||!type||(source==='public'&&quantity===null?false:!Number.isSafeInteger(Number(quantity))||Number(quantity)<1))continue;
  const key=name+'|'+type;const locations=index.get(key)||new Set();locations.add(source==='public'?'Public inventory':Number(item.Bank)===1?'Bank':'Inventory');index.set(key,locations);
 }
 for(const r of STORY_ITEM_RULES){const types=r.type==='Item'?['item','misc','quest item','resource']:r.type==='Cape'?['cape','back']:r.type==='House'?['house']: [storyItemKey(r.type)];const locations=new Set();for(const type of types)for(const loc of index.get(storyItemKey(r.name)+'|'+type)||[])locations.add(loc);if(!locations.size)continue;
 const result={name:r.name,source:r.source,reason:r.reason,locations:[...locations],kind:'inventory',verified:r.verified,prerequisite:true};const target=r.verified&&allowVerified?verified:hints;(target[r.chapter]??=[]).push(result);}
 return {verified,hints};
}
function storyBookSelection(names){if(!Array.isArray(names))return [];const selected=new Set(names.map(storyItemKey));return [...new Set(STORY_BOOK_RULES.filter(r=>selected.has(storyItemKey(r.name))).map(r=>r.chapter))]}
// Compare positive observations for the same character only. Capture order is not unlock order.
function badgeSyncDelta(previous,next){
 const before=previous&&previous.character.toLowerCase()===next.character.toLowerCase()&&Number.isFinite(Date.parse(previous.capturedAt))?previous:null;
 const prior=before?.discovery;
 if(!before)return {newIds:null,latestIds:[],latestAt:null};
 const old=new Set(before.ids);
 const validLatest=Array.isArray(prior?.latestIds)?[...new Set(prior.latestIds.filter(id=>old.has(id)))]:[];
 const latestAt=validLatest.length&&Number.isFinite(Date.parse(prior?.latestAt))?prior.latestAt:null;
 if(Date.parse(next.capturedAt)<=Date.parse(before.capturedAt)){
  if(Date.parse(next.capturedAt)<Date.parse(before.capturedAt)||next.ids.some(id=>!old.has(id)))throw Error('Older or conflicting badge capture. Capture the Character Page again; previous progress preserved.');
  return {newIds:Array.isArray(prior?.newIds)?[...new Set(prior.newIds.filter(id=>old.has(id)))]:null,latestIds:latestAt?validLatest:[],latestAt};
 }
 const newIds=[...new Set(next.ids.filter(id=>!old.has(id)))];
 return {newIds,latestIds:newIds.length?newIds:latestAt?validLatest:[],latestAt:newIds.length?next.capturedAt:latestAt};
}
const api={KEY,serverDay,availability,clean,update,opportunities,filterBadges,matchCapture,badgeSyncDelta,storyEvidence,storyHints,storyRules:STORY_BADGES,storyHintRules:STORY_HINTS,storyInventoryEvidence,storyItemRules:STORY_ITEM_RULES,storyBookRules:STORY_BOOK_RULES,storyBookSelection};
if(typeof module==='object'&&module.exports){module.exports=api;return}
root.AQWCBadgeHunter=api;
const d=root.document, catalog=root.AQWCBadgeCatalog||[];
if(!d||!d.getElementById('badge-hunter-list'))return;
const $=id=>d.getElementById(id);
const CAPTURE_KEY='aqwc-badge-character-v1';
let state={},manual={},capture=null,storageOK=true,limit=48;
function read(){try{manual=clean(JSON.parse(root.localStorage.getItem(KEY)||'{}'),catalog);capture=JSON.parse(root.localStorage.getItem(CAPTURE_KEY)||'null');const ids=new Set(catalog.map(b=>b.id));if(!capture||typeof capture.character!=='string'||!Array.isArray(capture.ids)||!capture.ids.every(id=>ids.has(id)))capture=null;state={...manual};for(const id of capture?.ids||[])state[id]='owned';storageOK=true}catch{storageOK=false} }
function el(tag,txt,cls){const n=d.createElement(tag);if(txt!=null)n.textContent=txt;if(cls)n.className=cls;return n}
function link(url,label){const a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
function button(label,cb,cls='smallbutton'){const b=el('button',label,cls);b.type='button';b.addEventListener('click',cb);return b}
function save(id,value){try{const raw=JSON.parse(root.localStorage.getItem(KEY)||'{}');const next=update(raw,id,value,catalog);root.localStorage.setItem(KEY,JSON.stringify(next));manual=next;storageOK=true;render();const sel=$('badge-hunter-list').querySelector('[data-badge-id="'+id+'"] select');if(sel)sel.focus()}catch{$('badge-hunter-message').textContent='Could not save badge progress. Existing saved progress was not changed.'}}
function renderHomeBadges(){
 const box=$('home-badge-discoveries');if(!box)return;
 const delta=capture?.discovery,known=Array.isArray(delta?.newIds),count=known?delta.newIds.length:null;
 const head=el('div',null,'home-badge-discovery-head');
 head.append(el('strong','Latest badge'),button('Badge Hunter ↗',()=>d.querySelector('[data-group="badges"]')?.click()));
 const body=el('div',null,'home-badge-discovery-body');
 const metric=el('div',null,'home-badge-discovery-count');metric.append(el('strong',count===null?'—':(count?'+'+count:'0')),el('small','New since sync'));
 const latest=el('div',null,'home-badge-discovery-latest');
 const ids=new Set(Array.isArray(delta?.latestIds)?delta.latestIds:[]),badges=catalog.filter(b=>ids.has(b.id)&&capture?.ids.includes(b.id)).sort((a,b)=>a.name.localeCompare(b.name));
 if(badges.length&&Number.isFinite(Date.parse(delta.latestAt))){
  const b=badges[0],art=el('div',null,'home-badge-discovery-art'),fallback=el('span','🏅');art.append(fallback);
  if(b.image){const img=el('img');img.src=b.image;img.alt=b.name+' badge';img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';fallback.hidden=true;img.addEventListener('error',()=>{img.remove();fallback.hidden=false});art.prepend(img)}
  const desc=el('div',null,'home-badge-discovery-name');desc.append(el('small',badges.length===1?'Latest detected badge':'One of '+badges.length+' latest detected badges'),el('strong',b.name),el('small','First seen '+new Date(delta.latestAt).toLocaleDateString()));latest.append(art,desc);
 }else{latest.append(el('p',capture?'New badges appear after a later sync detects them.':'Sync your Character Page badges to start tracking.','muted tiny'))}
 body.append(latest,metric);box.replaceChildren(head,body);
}
function renderAlert(){
 renderHomeBadges();
 const alert=$('badge-hunter-home'),list=opportunities(catalog,state);if(!alert)return;
 alert.classList.toggle('hidden',!list.length);const content=$('badge-hunter-home-text');content.replaceChildren();for(const b of list){const row=el('span',undefined,'calendar-badge-entry');const name=el('strong',b.name);const end=el('time',b.window.end);end.dateTime=b.window.end;row.append(name,end);content.append(row)}
}
function render(){
 read();const list=$('badge-hunter-list'),day=serverDay();
 $('badge-hunter-count').textContent=catalog.filter(b=>state[b.id]==='owned').length+' / '+catalog.length;
 $('badge-hunter-tracked').textContent=String(catalog.filter(b=>state[b.id]==='tracked').length);
 $('badge-hunter-seasonal').textContent=String(opportunities(catalog,state,day).length);
 $('badge-hunter-progress').value=catalog.filter(b=>state[b.id]==='owned').length;$('badge-hunter-progress').max=Math.max(1,catalog.length);
 $('badge-hunter-message').textContent=storageOK?(capture?'Character Page: '+capture.character+' · '+capture.ids.length+' matched · Last import '+new Date(capture.capturedAt).toLocaleString()+' · '+capture.ambiguous+' ambiguous, '+capture.unknown+' unrecognized image references in latest scan. Not seen ≠ not owned.':'Manual tracking. Import a Character Page capture from the extension.'):'Local storage unavailable; changes may not be saved.';
 const availabilityFilter=$('badge-hunter-availability').value,tagFilter=$('badge-hunter-tag-filter').value;
 const result=filterBadges(catalog,state,$('badge-hunter-search').value,$('badge-hunter-category').value,$('badge-hunter-status').value,day).filter(b=>(availabilityFilter==='all'||b.kind===availabilityFilter||(availabilityFilter==='active'&&availability(b,day)==='Within announced dates'))&&(tagFilter==='all'||(b.tags||[]).includes(tagFilter)));
 $('badge-hunter-results').textContent='Showing '+Math.min(limit,result.length)+' of '+result.length+' matching badges · '+catalog.length+' total';
 $('badge-hunter-more').hidden=result.length<=limit;
 list.replaceChildren();
 for(const b of result.slice(0,limit)){
  const card=el('article',null,'badge-hunter-card');card.dataset.badgeId=b.id;card.classList.toggle('badge-owned',state[b.id]==='owned');
  const heading=el('div',null,'badge-hunter-heading'),art=el('div',null,'badge-hunter-art');
  const fallback=el('span','Artwork unavailable','muted tiny');fallback.hidden=!!b.image;art.append(fallback);
  if(b.image){const img=el('img');img.src=b.image;img.alt=b.name+' badge';img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.addEventListener('error',()=>{img.remove();fallback.hidden=false});art.prepend(img)}
  heading.append(art,el('h3',b.name),el('span',state[b.id]==='owned'?'✓':'','badge-hunter-symbol'));card.append(heading,el('div',b.category+(b.paid?' · Paid pack':'')+' · #'+b.id.slice(3),'muted tiny'));
  if(b.tags?.length)card.append(el('div',b.tags.filter(t=>!t.startsWith('cp-')).join(' · '),'muted tiny'));
  const avail=el('span',availability(b,day),'badge-hunter-tag');if(availability(b,day)==='Within announced dates')avail.classList.add('badge-season-active');card.append(avail,el('p',b.requirement||((b.requirements||[]).length?'See the requirements below.':'Open the source for the unlock conditions.')));
  if(b.window)card.append(el('p','Official dates: '+b.window.start+' to '+b.window.end+' (AQW server day); confirm in game.','muted tiny'));
  const detail=el('details');detail.append(el('summary','How to obtain'));
  if(b.guide)detail.append(el('p',b.guide));
  if(b.requirements?.length){const ul=el('ul');for(const step of b.requirements)ul.append(el('li',step));detail.append(el('p','Requirements from AQW Wiki:','muted tiny'),ul)}
  else if(!b.guide)detail.append(el('p','Detailed requirements not indexed. Check the individual Wiki badge page before farming.'));
  if(b.requirementLinks?.length){const route=el('div',null,'badge-hunter-links');for(const step of b.requirementLinks)route.append(link(step.url,step.label+' ↗'));detail.append(route)}
  if(b.join)detail.append(button(b.join+' ⧉',async e=>{const btn=e.currentTarget;try{await root.navigator.clipboard.writeText(b.join);btn.textContent='Copied ✓'}catch{btn.textContent=b.join+' (copy manually)'}}));
  const links=el('div',null,'badge-hunter-links');links.append(link(b.source,'Badge source ↗'));if(b.guideSource)links.append(link(b.guideSource,'Acquisition guide ↗'));if(b.categorySource)links.append(link(b.categorySource,'Category ↗'));if(b.announcement)links.append(link(b.announcement,'Official event ↗'));detail.append(links);card.append(detail);
  const control=el('select');control.setAttribute('aria-label','Progress for '+b.name);for(const [value,label] of [['unmarked','Not marked'],['tracked','Hunting'],['owned','Owned']]){const o=el('option',label);o.value=value;control.append(o)}
  control.value=manual[b.id]||'unmarked';control.setAttribute('aria-label','Manual progress for '+b.name);control.addEventListener('change',()=>save(b.id,control.value));if(capture?.ids.includes(b.id)){card.append(el('p','✓ Seen on Character Page · '+capture.character,'muted tiny'));control.value='owned';control.disabled=true}else if(capture)card.append(el('p','Not observed in imported captures (not proof of absence).','muted tiny'));card.append(control);list.append(card);
 }
 if(!result.length)list.append(el('p','No badges match these filters.','muted'));
 renderAlert();
}
for(const cat of [...new Set(catalog.map(b=>b.category))].sort()){const opt=el('option',cat);opt.value=cat;$('badge-hunter-category').append(opt)}
for(const tag of [...new Set(catalog.flatMap(b=>b.tags||[]))].filter(t=>!t.startsWith('cp-')).sort()){const opt=el('option',tag);opt.value=tag;$('badge-hunter-tag-filter').append(opt)}
 const reset=()=>{limit=48;render()};$('badge-hunter-search').addEventListener('input',reset);for(const id of ['badge-hunter-category','badge-hunter-status','badge-hunter-availability','badge-hunter-tag-filter'])$(id).addEventListener('change',reset);
 $('badge-hunter-more').addEventListener('click',()=>{limit+=48;render()});
$('badge-hunter-home-open').addEventListener('click',()=>{d.querySelector('[data-group="badges"]')?.click();$('badge-hunter-search').value='';$('badge-hunter-category').value='all';$('badge-hunter-tag-filter').value='all';$('badge-hunter-availability').value='all';$('badge-hunter-status').value='active';reset()});
$('badge-hunter-export').addEventListener('click',()=>{read();if(!storageOK)return;const url=URL.createObjectURL(new Blob([JSON.stringify({format:'AQW Companion badge progress v1',states:manual},null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download='AQW_Badge_Progress.json';d.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)});
$('badge-hunter-import').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('File too large');const payload=JSON.parse(await file.text());if(payload.format!=='AQW Companion badge progress v1'||!payload.states||typeof payload.states!=='object'||Array.isArray(payload.states))throw Error('Invalid badge backup');const incoming=clean(payload.states,catalog);read();if(!storageOK)throw Error('Storage unavailable');const next={...manual,...incoming};root.localStorage.setItem(KEY,JSON.stringify(next));render();$('badge-hunter-message').textContent='Badge backup merged; other saved badges preserved.'}catch{$('badge-hunter-message').textContent='Could not import badge backup. Existing progress unchanged.'}finally{e.target.value=''}});
root.addEventListener('storage',e=>{if(e.key===KEY)render()});root.addEventListener('focus',()=>{read();renderAlert()});root.setInterval(()=>{read();renderAlert()},60000);
function applyCapture(snapshot,ask=false){
 if(!snapshot)throw Error('No staged capture. Open your Character Page and capture it in the extension.');
 const next=matchCapture(snapshot,catalog);
 if(!next.ids.length)throw Error('No unambiguous badges matched; previous progress preserved.');
 read();if(!storageOK)throw Error('Local storage unavailable.');
 if(capture&&capture.character.toLowerCase()!==next.character.toLowerCase())throw Error('Different character. Clear Character Page matches before switching.');
 const count=next.ids.length;
 if(ask&&!confirm('Import '+count+' matched badges for '+next.character+'? '+next.ambiguous+' ambiguous and '+next.unknown+' unrecognized image references will not be marked owned. Your manual states are preserved.'))return {ok:false,saved:false,error:'Import cancelled'};
 next.discovery=badgeSyncDelta(capture,next);
 if(capture?.character.toLowerCase()===next.character.toLowerCase()){next.ids=[...new Set([...capture.ids,...next.ids])];next.storyGroups=[...new Set([...(Array.isArray(capture.storyGroups)?capture.storyGroups:[]),...next.storyGroups])].filter(x=>x==='champion-of-chaos');}
 root.localStorage.setItem(CAPTURE_KEY,JSON.stringify(next));
 try{render();root.dispatchEvent(new Event('aqwc-story-badges-changed'))}catch(err){return {ok:false,saved:true,error:'Badge data saved, but redraw failed: '+String(err?.message||err)}}
 return {ok:true,saved:true,count,ambiguous:next.ambiguous,unknown:next.unknown};
}
api.applyCapture=applyCapture;
d.documentElement.dataset.aqwcBadgeReady='1';
let pending=null;
$('badge-character-import').addEventListener('click',e=>{
 if(!e.isTrusted)return;
 const requestId=crypto.randomUUID();pending=requestId;$('badge-hunter-message').textContent='Looking for a staged extension capture…';
 root.postMessage({channel:'aqwc-badge-capture-v1',type:'request',requestId},location.origin);
 setTimeout(()=>{if(pending===requestId){pending=null;$('badge-hunter-message').textContent='No extension response. Install the test version and capture your Character Page first.'}},3000);
});
root.addEventListener('message',e=>{
 if(e.source!==root||e.origin!==location.origin||e.data?.channel!=='aqwc-badge-capture-v1'||e.data?.type!=='response'||!pending||e.data.requestId!==pending)return;
 pending=null;
 try{
  applyCapture(e.data.snapshot,true);
 }catch(err){$('badge-hunter-message').textContent=String(err?.message||err)}
});
$('badge-character-clear').addEventListener('click',e=>{if(e.isTrusted&&confirm('Clear imported Character Page matches? Manual badge progress will remain.')){try{root.localStorage.removeItem(CAPTURE_KEY);render();root.dispatchEvent(new Event('aqwc-story-badges-changed'))}catch{$('badge-hunter-message').textContent='Could not clear capture.'}}});
root.addEventListener('storage',e=>{if(e.key===CAPTURE_KEY)render()});
function openFromHash(){if(location.hash==='#aqwc-badge-hunter')d.querySelector('[data-group="badges"]')?.click()}
root.addEventListener('hashchange',openFromHash);
api.render=render;read();renderAlert();openFromHash();
})(typeof globalThis==='object'?globalThis:this);
