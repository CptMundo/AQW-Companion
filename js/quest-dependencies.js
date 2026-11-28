/* Source-reviewed quest dependencies: requirements, not inferred completion. */
(function(root){
'use strict';
const norm=s=>String(s||'').trim().toLowerCase().replace(/[’‘]/g,"'");
const matches=s=>/^verus doomknight(?: \(class\))?$/.test(norm(s));
const wiki='https://aqwwiki.wikidot.com/a-mysterious-stranger-s-quests';
const shop='https://aqwwiki.wikidot.com/verus-doomknight-shop';
const itemPage='https://aqwwiki.wikidot.com/verus-doomknight-class';
const row=(item,count,map,method='turn-in')=>({item,count,join:map?'/join '+map:null,kind:method});
const stages=[
 {id:'body',name:'Body, Soul and, Domination',level:40,requires:[],rows:[row("Fear's Bones",13,'underrealm'),row('Gray Matter',13,'brainmeat'),row('Titanic Spine',13,'titanattack'),row('Doom Knight Plating',13,'valleyofdoom')]},
 {id:'cloak',name:'Of the Same Cloak',level:50,requires:['body'],rows:[row('The Mask of the Skulls',1,'necrodungeon'),row("Doom Worshipper's Blade of Doom",1,'lumafortress'),row("Empress' ShadowCloak",1,'innershadows'),row('Cybernetic Doom Blade',1,'techfortress'),row('Asherion Armor',1,'stonewooddeep')],note:'The Mask of the Skulls is Legend-tagged; check acquisition/equip restrictions in game. Do not infer that the entire class requires membership.'},
 {id:'light',name:'Refracted Light',level:60,requires:['cloak'],rows:[row('Shadowflame Spike',150,'shadowoff'),row('Light Fiend Horn',150,'fiendshard'),row('Underworld Soul Glow',50,'legionarena'),row('Gold Hammer Chip',1,'noxustower'),row('Shimmering Tentacle',20,'chaoslab')]},
 {id:'life',name:'Life Carve',level:70,reputation:'Evil Rank 10',requires:['light'],rows:[row('Trace of Light',8,'wanders'),row('Trace of Dark',8,'lightguardwar'),row('Trace of Wind',8,'eternalchaos'),row('Trace of Earth',8,'quibblehunt'),row('Trace of Energy',8,'crashsite'),row('Trace of Ice',8,'northlands'),row('Trace of Water',8,'deepchaos'),row('Trace of Fire',8,'drakonnan'),row('Trace of Bacon',1,'battlefowl')]},
 {id:'soul',name:'Soul Fracture',requires:['life'],rows:[row('Soul of Alteon',40,'ultraalteon'),row('Soul of Dethrix',40,'ebondungeon'),row('Soul of Sepulchuroth',40,'shadowstrike'),row('Soul of Drakath',40,'ultradrakath'),row('Soul of Gravelyn',40,'ebilcorphq'),row('Soul of Doom',40,'shadowvoid')]},
 {id:'spikes',name:'Doom Spikes',level:80,requires:['soul'],rows:[row("Xyfrag's Slimy Tooth",5,'voidxyfrag'),row("Nerfkitten's Fang",3,'voidnerfkitten'),row("Doomkitten's Molar",20,'doomkitten'),row('Maw of the Sea',10,'seavoice'),row("Deadly Duo's Decayed Denture",10,'infernalarena')],note:'Alternative: Void Merge in /join thevoid sells each tooth or fang for 50 Void Energy + 1 Gold Voucher 500k. Optional, not additional mandatory materials.',alternative:{join:'/join thevoid',source:'https://aqwwiki.wikidot.com/void-merge'}},
 {id:'blade',name:'Necrotic Blade',requires:['spikes'],rows:[row('ShadowReaper Of Doom',1,'mirrorrealm'),row("Sepulchure's Original Helm",1,'shadowfall'),row('Arch DoomKnight Helm',1,'shadowvault'),row('Dragonlord of Evil',1,'terminatemple'),row('DoomTech DoomKnight',1,'doompirate')]},
 {id:'doom',name:'Unleash Doom',requires:['blade'],rows:[row('Inquisitor Bones',1000000,'citadelruins'),row('Refined Metal',1000000,'deltavcore'),row('Dragon Skin',1000000,'etherwardes'),row("PaladinSlayer's Skull",100000,'necrocavern')]}
];
const labels=['Body, Soul and, Domination — /join terminatemple','Of the Same Cloak — Level 50','Refracted Light — Level 60','Life Carve — Level 70 & Evil Rank 10','Soul Fracture — defeat target bosses','Doom Spikes — Level 80','Necrotic Blade — collect required Doom gear','Unleash Doom — final quest'];
const steps=()=>[{label:'Reach Level 40',kind:'manual'},...labels.map(label=>({label,kind:'manual'})),{label:'Claim Verus DoomKnight from the shop in /join terminatemple',kind:'manual'},{label:'Own Verus DoomKnight',kind:'owned',item:'Verus DoomKnight',target:1}];
function validateGraph(nodes){
 const map=new Map();for(const n of nodes){if(!n.id||map.has(n.id))throw Error('Duplicate or missing stage ID');map.set(n.id,n)}
 const visiting=new Set(),done=new Set();
 function visit(id){if(visiting.has(id))throw Error('Cyclic dependency: '+id);if(done.has(id))return;const n=map.get(id);if(!n)throw Error('Unknown dependency: '+id);visiting.add(id);for(const dep of n.requires||[])visit(dep);visiting.delete(id);done.add(id)}
 for(const id of map.keys())visit(id);return true;
}
validateGraph(stages);
function evaluate(nodes,states={},stock=null){
 validateGraph(nodes);return nodes.map(n=>{
  const completed=states[n.id]==='done',blocked=(n.requires||[]).filter(id=>states[id]!=='done');
  return {...n,state:completed?'done':blocked.length?'blocked':'unknown',blocked,rows:completed?[]:(n.rows||[]).map(r=>{const raw=typeof stock==='function'?stock(r.item):null;const have=Number.isFinite(raw)&&raw>=0?raw:null;return {...r,have,missing:have===null?null:Math.max(0,r.count-have)}})};
 });
}
function recipe(name){return matches(name)?{name:'Verus DoomKnight',type:'Class',coverage:'source-reviewed-questline',source:wiki,steps:steps()}:null}
function acquisition(name){return matches(name)?{name:'Verus DoomKnight',type:'Class',origin:'reviewed',wiki:itemPage,complete:'questline',ingredients:[],methods:[{type:'Questline / Shop',title:'Eight sequential quests — A Mysterious Stranger',npc:'A Mysterious Stranger',join:'/join terminatemple',url:wiki,details:'Level 40 to begin, Level 80 by Doom Spikes, Evil Rank 10 for Life Carve. Claim the class for 0 AC after Unleash Doom.'},{type:'Shop',title:'Verus DoomKnight (Shop)',join:'/join terminatemple',url:shop}]}:null}
function upgrade(project,fresh){
 if(!matches(project?.name)||!Array.isArray(project.steps))return false;
 let changed=false;
 if(project.name!=='Verus DoomKnight'){project.name='Verus DoomKnight';changed=true}
 if(project.type!=='Class'){project.type='Class';changed=true}
 // Keep custom steps and previously checked manual stages. Remove only untouched known fallback.
 const before=project.steps.length;
 project.steps=project.steps.filter(s=>!(s.kind==='manual'&&['unknown',undefined,null].includes(s.status)&&['Acquisition route not yet in the catalog','Verify unlock questline on AQWWiki'].includes(s.label)));
 if(before!==project.steps.length)changed=true;
 const result=[];for(const raw of steps()){
  const existing=project.steps.find(s=>raw.kind==='owned'?s.kind==='owned'&&matches(s.item):s.kind==='manual'&&s.label===raw.label);
  if(existing)result.push(existing);else{result.push(fresh(raw));changed=true}
 }
 if(changed)project.steps=[...result,...project.steps.filter(s=>!result.includes(s))];
 return changed;
}
function status(project){return Object.fromEntries(stages.map((stage,i)=>[stage.id,project?.steps?.find(s=>s.kind==='manual'&&s.label===labels[i])?.status||'unknown']))}
const api={matches,recipe,acquisition,upgrade,status,validateGraph,evaluate,stages,labels,wiki,shop,itemPage};
if(typeof module==='object'&&module.exports)module.exports=api;else root.AQWCDependencies=api;
})(typeof globalThis==='object'?globalThis:this);
