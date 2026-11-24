/* Direct and user-expanded nested merge requirements. Same-origin public Wiki reads only. */
(() => {
 'use strict';
 const marker=/^Merge the following\s*:\s*$/i;
 const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
 function parseRow(li,origin){
  if(li.querySelector('ul,ol'))return null;
  const links=[...li.querySelectorAll('a[href]')];if(links.length!==1)return null;
  const a=links[0],name=clean(a.textContent),line=clean(li.textContent);
  if(!name||name.length>350||!line.startsWith(name))return null;
  let u;try{u=new URL(a.href,origin)}catch{return null}
  if(u.origin!==origin||!/^\/[a-z0-9][a-z0-9-]*\/?$/.test(u.pathname)||u.search||u.hash)return null;
  const qty=line.slice(name.length).trim().match(/^[x×]\s*(\d{1,3}(?:,\d{3})+|\d+)$/i);
  if(!qty)return null;
  const target=Number(qty[1].replace(/,/g,''));if(!Number.isSafeInteger(target)||target<1||target>100000000)return null;
  return {name,slug:u.pathname.replace(/^\/|\/$/g,''),target};
 }
 function parse(content,origin){
  const groups=[];let incomplete=false;
  for(const el of content.querySelectorAll?.('li,p,div')||[]){
   const direct=clean([...el.childNodes].filter(n=>n.nodeType===3||n.nodeType===1&&!['UL','OL'].includes(n.tagName)).map(n=>n.textContent).join(' '));
   if(!marker.test(direct))continue;
   const lists=[...el.children].filter(n=>['UL','OL'].includes(n.tagName));
   if(!lists.length&&['UL','OL'].includes(el.nextElementSibling?.tagName))lists.push(el.nextElementSibling);
   if(lists.length!==1){incomplete=true;continue}
   const rows=[...lists[0].children];if(!rows.length||rows.length>50||rows.some(n=>n.tagName!=='LI')){incomplete=true;continue}
   const items=rows.map(li=>parseRow(li,origin));
   if(items.some(x=>!x)||new Set(items.map(x=>x.slug)).size!==items.length){incomplete=true;continue}
   groups.push(items);
   if(groups.length>8)return {groups:[],incomplete:true};
  }
  if(groups.reduce((n,g)=>n+g.length,0)>80)return {groups:[],incomplete:true};
  return {groups,incomplete};
 }
 function plan(group,states,matches,rootSlug,option=0){
  // Allocate the same actual inventory ID only once per alternative. Breadth-first
  // reserves all direct requirements before descending into missing sub-recipes.
  const remaining=new Map(),root=[],queue=[];let count=0,limited=false;
  function enqueue(items,parent,multiplier,ancestors,depth,prefix){
   if(items.length+count>80){limited=true;return false}
   items.forEach((m,i)=>{
    const target=m.target*multiplier,path=prefix+'.'+i;
    const node={...m,target,path,depth,ancestors,children:[],allocated:null,missing:null,stock:null,reason:''};
    parent.push(node);queue.push(node);count++;
   });return true
  }
  enqueue(group,root,1,[rootSlug],0,String(option));
  for(let i=0;i<queue.length;i++){
   const n=queue[i],m=matches.get(n.name);
   if(!Number.isSafeInteger(n.target)||n.target<1||n.target>100000000){n.reason='Quantity limit reached';continue}
   if(n.ancestors.includes(n.slug)){n.reason='Circular dependency';continue}
   if(!m||!['owned','not-found'].includes(m.state)){n.reason=m?.state==='ambiguous'?'Ambiguous item variant':'Inventory unavailable';continue}
   if(m.state==='owned'){
    if(typeof m.itemId!=='string'||!m.itemId||!Number.isSafeInteger(m.total)||m.total<0){n.reason='Inventory identity unavailable';continue}
    if(!remaining.has(m.itemId))remaining.set(m.itemId,m.total);
    n.stock=m.total;n.allocated=Math.min(n.target,remaining.get(m.itemId));
    remaining.set(m.itemId,remaining.get(m.itemId)-n.allocated);
   }else{n.stock=0;n.allocated=0}
   n.missing=n.target-n.allocated;
   const selected=states.get(n.path);
   if(n.missing&&selected?.groups?.[selected.choice]){
    if(n.depth>=4){n.reason='Maximum recipe depth reached';continue}
    if(!enqueue(selected.groups[selected.choice],n.children,n.missing,[...n.ancestors,n.slug],n.depth+1,n.path))n.reason='Recipe size limit reached';
   }
  }
  return {root,limited};
 }

 function sourceLink(a,origin){
  try{const u=new URL(a.getAttribute('href'),origin),name=clean(a.textContent).replace(/^['‘“]+|['’”]+$/g,'');if(u.origin!==origin||u.search||!/^\/[a-z0-9][a-z0-9-]{0,199}\/?$/.test(u.pathname)||!name||name.length>180||u.hash&&!/^#[a-zA-Z0-9_-]{1,80}$/.test(u.hash))return null;return {name,slug:u.pathname.replace(/^\/|\/$/g,''),hash:u.hash}}catch{return null}
 }
 function parseSources(content,origin){
  const out={locations:[],drops:[],quests:[],shops:[]};
  function add(kind,a){const item=sourceLink(a,origin);if(item&&!out[kind].some(x=>x.slug===item.slug&&x.name===item.name&&x.hash===item.hash)&&out[kind].length<40)out[kind].push(item)}
  // Read only acquisition-labelled lines and their immediately attached list.
  // Stop at Sellback/Description/Notes. Never treat 'Used in' as a reward.
  for(const el of content.querySelectorAll('p,li,div,strong,b')){
   const direct=clean([...el.childNodes].filter(n=>n.nodeType===3||n.nodeType===1&&!['UL','OL','DIV','P'].includes(n.tagName)).map(n=>n.textContent).join(' '));
   if(!direct||direct.length>400||/^(Notes?|Description|Sellback|Used (?:in|to))\b/i.test(direct))continue;
   const kind=/^Locations?\s*:/i.test(direct)?'locations':/^(?:Price:\s*N\/A\s*\(?\s*)?Dropped by\b/i.test(direct)?'drops':/^(?:Price:\s*N\/A\s*\(?\s*)?Reward(?:ed)? from\b.*\bquests?\b/i.test(direct)?'quests':/^(?:Price:\s*N\/A\s*\(?\s*)?(?:Purchased from|Bought from|Available from)\b/i.test(direct)?'shops':null;
   if(!kind)continue;
   // Only explicit source links. A non-quest reward such as friendship is excluded.
   for(const a of el.querySelectorAll('a[href]'))add(kind,a);
   if(['UL','OL'].includes(el.nextElementSibling?.tagName)&&/:\s*$/.test(direct))for(const a of el.nextElementSibling.querySelectorAll('a[href]'))add(kind,a);
   if(['STRONG','B'].includes(el.tagName)&&/:\s*$/.test(direct)){
    for(let n=el.nextSibling,limit=0;n&&limit++<12;n=n.nextSibling){if(['BR','STRONG','B','P','DIV'].includes(n.nodeName))break;if(n.nodeName==='A')add(kind,n);else if(n.nodeType===1)for(const a of n.querySelectorAll('a[href]'))add(kind,a)}
   }
  }
  return out;
 }
 const knownSources={
  'moon-rock-fragments':{locations:[{name:'Luna Cove',slug:'luna-cove',join:'lunacove'}],drops:[{name:'Coral Merdraconian',slug:'coral-merdraconian'},{name:'Horde Lycan',slug:'horde-lycan'},{name:'Lunar Villager',slug:'lunar-villager'},{name:'Moonrock',slug:'moonrock'}],quests:[],shops:[]}
 };
 function reviewedSources(slug){return Object.hasOwn(knownSources,slug)?knownSources[slug]:null}
 function mergeSources(primary,reviewed){
  const result={};for(const kind of ['locations','drops','quests','shops']){const list=[...(reviewed?.[kind]||[])];for(const x of primary?.[kind]||[])if(!list.some(y=>y.slug===x.slug&&y.name===x.name&&(y.hash||'')===(x.hash||'')))list.push(x);result[kind]=list}
  return result;
 }
 function mapCommand(content){
  const text=String(content?.innerText||content?.textContent||'');
  const names=[...new Set([...text.matchAll(/\bMap Name\s*:\s*([a-z0-9-]{1,60})\b/gi)].map(m=>m[1].toLowerCase()))];
  const joins=[...new Set([...text.matchAll(/\/join\s+([a-z0-9-]{1,60})\b/gi)].map(m=>m[1].toLowerCase()))];
  return names.length===1&&joins.includes(names[0])?names[0]:null;
 }
 const verifiedMaps=Object.freeze({'luna-cove':'lunacove','shadowfall':'shadowfall','battleodium':'battleodium','yulgar-s-inn':'yulgar','titan-attack':'titanattack','mermaid-sushi':'mermaidsushi'});
 const mapCache=new Map(),mapPending=new Map();let mapRequests=0,mapQueue=Promise.resolve();
 async function verifyMap(origin,slug){
  if(mapCache.has(slug))return mapCache.get(slug);
  if(mapRequests>=10)throw Error('Map lookup limit reached; open the location page.');
  mapRequests++;
  const doc=await loadDocument(origin,slug),content=doc.querySelector('#page-content');
  const crumb=doc.querySelector('#breadcrumbs')||doc.querySelector('.breadcrumbs, #breadcrumb, .breadcrumb');
  if(!content||!doc.querySelector('#page-title')||![...(crumb?.querySelectorAll('a[href]')||[])].some(a=>sourceLink(a,origin)?.slug==='locations'))throw Error('Not a verified location page.');
  const join=mapCommand(content);if(!join)throw Error('Map command not verified.');
  mapCache.set(slug,join);return join;
 }
 function resolvedMap(origin,slug){
  if(Object.hasOwn(verifiedMaps,slug))return Promise.resolve(verifiedMaps[slug]);
  if(mapCache.has(slug))return Promise.resolve(mapCache.get(slug));
  if(mapPending.has(slug))return mapPending.get(slug);
  if(mapPending.size>=10)return Promise.resolve(null);
  const task=mapQueue.then(()=>verifyMap(origin,slug)).catch(()=>null);mapPending.set(slug,task);mapQueue=task.then(()=>{});return task;
 }
 function joinControl(line,x,origin){
  const known=x.join||(Object.hasOwn(verifiedMaps,x.slug)?verifiedMaps[x.slug]:null)||mapCache.get(x.slug);
  const copy=document.createElement('button');copy.type='button';copy.className='aqwc-copy-join';
  function ready(command){if(!command){copy.remove();return}copy.textContent='/join '+command;copy.title='Copy /join '+command;copy.disabled=false;copy.addEventListener('click',async e=>{if(!e.isTrusted)return;try{await navigator.clipboard.writeText('/join '+command);copy.textContent='Copied /join '+command}catch{copy.textContent='/join '+command+' (copy manually)'}})}
  if(known){line.append(copy);ready(known)}else{copy.disabled=true;copy.textContent='Verifying map…';line.append(copy);resolvedMap(origin,x.slug).then(ready)}
 }
 function recipeLabel(group,index,rootSlug){
  if(rootSlug==='necrotic-sword-of-doom'||rootSlug==='necrotic-sword-of-doom-sword'){
   if(group.length===1&&group[0].slug==='dual-necrotic-swords-of-doom')return 'Exchange weapon';
   if(group.length===5)return 'Craft weapon';
  }
  return group.length===1?group[0].name:'Recipe '+(index+1);
 }
 function renderSources(container,sources,origin,slug,{partial=false}={}){
  if(!sources||!Object.values(sources).some(a=>a.length))return false;
  const box=document.createElement('div');box.className='aqwc-source-guide';const title=document.createElement('strong');title.textContent='Acquisition';box.append(title);
  for(const [kind,label] of [['locations','Locations'],['drops','Drops from'],['quests','Quest rewards'],['shops','Available from']]){
   const rows=sources[kind]||[];if(!rows.length)continue;
   const group=document.createElement('div'),heading=document.createElement('small');group.className='aqwc-source-group';heading.className='aqwc-source-label';heading.textContent=label;group.append(heading);const entries=document.createElement('div');entries.className='aqwc-source-entries';group.append(entries);
   for(const x of rows.slice(0,40)){
    const line=document.createElement('div');line.className='aqwc-source-line';const a=document.createElement('a');a.href=origin+'/'+x.slug+(x.hash||'');a.textContent=x.name;line.append(a);
    if(kind==='locations'&&!/\b(shop|merge shop)\b/i.test(x.name)){
     joinControl(line,x,origin);
    }
    entries.append(line);
   }
   box.append(group);
  }
  if(partial){const note=document.createElement('small');note.textContent='Partial source list';box.append(note)}
  const link=document.createElement('a');link.href=origin+'/'+slug;link.textContent='Material Wiki ↗';link.className='aqwc-source-page';box.append(link);container.append(box);return true;
 }
 async function loadDocument(origin,slug){
  if(origin!=='https://aqwwiki.wikidot.com'||! /^[a-z0-9][a-z0-9-]{0,199}$/.test(slug))throw Error('Unsupported Wiki link');
  const url=origin+'/'+slug,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{
   const r=await fetch(url,{credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});
   if(!r.ok||r.url!==url||!String(r.headers.get('content-type')).includes('text/html'))throw Error('Wiki page unavailable');
   if(!r.body||Number(r.headers.get('content-length'))>1500000)throw Error('Wiki page too large');
   const reader=r.body.getReader(),decoder=new TextDecoder();let html='',size=0;
   try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1500000){await reader.cancel();throw Error('Wiki page too large')}html+=decoder.decode(value,{stream:true})}html+=decoder.decode()}finally{reader.releaseLock()}
   const template=document.createElement('template');template.innerHTML=html;
   return template.content;
  }finally{clearTimeout(timer)}
 }
 const monsterCache=new Map();let monsterRequests=0,monsterQueue=Promise.resolve();
 function monsterImage(doc,origin,slug){
  const crumb=doc.querySelector('#breadcrumbs')||doc.querySelector('.breadcrumbs, #breadcrumb, .breadcrumb'),content=doc.querySelector('#page-content');
  if(!content||![...(crumb?.querySelectorAll('a[href]')||[])].some(a=>sourceLink(a,origin)?.slug==='monsters'))return null;
  const urls=new Set();
  for(const img of content.querySelectorAll('img[src]')){
   if(img.closest('table,.page-rate-widget-box')||/(?:^|\/)(?:(?:ac|legend|rare|seasonal|special|pseudo|member|free)(?:small|large)|(?:star|stars|icon|badge|logo|button|blank)[-_0-9]*)\.(?:png|gif|jpe?g|webp)(?:\?|$)/i.test(img.getAttribute('src')||''))continue;
   try{const u=new URL(img.getAttribute('src'),origin+'/'+slug);if(u.username||u.password||!/\.(png|jpe?g|webp|gif)$/i.test(u.pathname)||!(u.hostname==='aqwwiki.wikidot.com'||u.hostname.endsWith('.wdfiles.com')||u.hostname==='i.imgur.com'))continue;if(u.protocol==='http:')u.protocol='https:';if(u.protocol!=='https:')continue;urls.add(u.href)}catch{}
  }
  return urls.size===1?[...urls][0]:null;
 }
 function monsterPreview(origin,slug){
  if(monsterCache.has(slug))return monsterCache.get(slug);
  if(monsterRequests>=32)return Promise.resolve(null);monsterRequests++;
  const p=monsterQueue.then(()=>loadDocument(origin,slug)).then(doc=>monsterImage(doc,origin,slug)).catch(()=>null);monsterQueue=p.then(()=>{});monsterCache.set(slug,p);return p;
 }
 async function loadRecipe(origin,slug){
   const doc=await loadDocument(origin,slug),content=doc.querySelector('#page-content'),url=origin+'/'+slug;
   const body=String(content?.textContent||'');
   const crumb=doc.querySelector('#breadcrumbs')||doc.querySelector('.breadcrumbs, #breadcrumb, .breadcrumb');
   const links=[...(crumb?.querySelectorAll('a[href]')||[])];
   if(!content||!doc.querySelector('#page-title')||!/\bSellback\s*:/i.test(body)||!/\bDescription\s*:/i.test(body)||/\busually refers to\s*:/i.test(body)||links.length&&!links.some(a=>{try{return new URL(a.getAttribute('href'),url).pathname.replace(/^\/|\/$/g,'')==='items'}catch{return false}}))return {groups:[],incomplete:true};
   return {...parse(content,origin),sources:parseSources(content,origin)};
 }

 // Reviewed acquisition hints for popular goals. These are informational
 // previews only; nested allocation uses parsed recipes on explicit expansion.
 const shadowfallSource={name:'Shadowfall',slug:'shadowfall',join:'shadowfall'};
 const mergeHint=parts=>({merge:parts,locations:[shadowfallSource]});
 // Sources: /revenant-s-spellscroll, /conquest-wreath, /exalted-crown, /legion-revenant-s-quests, /dage-challenge, /ultra-dage.
 const legionHint=names=>({merge:[['Dage the Evil Insignia',1],['Legion Token',50]],quests:names.map(name=>({name,slug:'legion-revenant-s-quests'})),locations:[{name:'Dage Challenge',slug:'dage-challenge',join:'dage'},{name:'Ultra Dage',slug:'ultra-dage',join:'ultradage'}]});
 const compactHints={
  'revenant-s-spellscroll':legionHint(['Legion Fealty 1']),
  'conquest-wreath':legionHint(['Legion Fealty 2']),
  'exalted-crown':legionHint(['Legion Fealty 3','Legion Fealty 4']),
  'necrotic-sword-s-blade':mergeHint([['Energized Blade',1],['Void Aura',200],['Barium of Doom',1]]),
  'necrotic-sword-s-hilt':mergeHint([['Energized Hilt',1],['Bones from the Void Realm',1],['Void Aura',200]]),
  'necrotic-sword-s-aura':mergeHint([['Energized Aura',1],["Time Lord's Necronomicon",1],['Void Aura',300]]),
  'energized-blade':mergeHint([['Barium of Doom',1],['Unenhanced Doom Blade',1],['Void Aura',100]]),
  'energized-hilt':mergeHint([['Bones from the Void Realm',1],['Unenhanced Hilt',1],['Void Aura',100]]),
  'energized-aura':mergeHint([["Time Lord's Necronomicon",1],['Unenhanced Aura',1],['Void Aura',150]]),
  'barium-of-doom':mergeHint([['Barium',1],['Void Aura',50]]),
  'bones-from-the-void-realm':mergeHint([['Bone Dust',50],['Void Aura',50]]),
  'time-lord-s-necronomicon':mergeHint([['Chaorrupted Hourglass',10],['(Necro) Scroll of Dark Arts',1],['Void Aura',100]]),
  'void-aura':{quests:['Commanding Shadow Essences','Gathering Unstable Essences','Glimpse Into The Dark (Daily)','Retrieve Void Auras','The Encroaching Shadows (Daily)'].map(name=>({name,slug:'braeus-quests'})),locations:[{name:'Battleodium',slug:'battleodium',join:'battleodium'},shadowfallSource,{name:"Yulgar's Inn",slug:'yulgar-s-inn',join:'yulgar'}]},
  'doom-heart':{drops:[{name:'ULTRA Sepulchure'}],locations:[{name:'Sepulchure Battle',slug:'sepulchure-battle',join:'sepulchurebattle'}]}
 };
 function compactData(slug,recipe){
  const hint=Object.hasOwn(compactHints,slug)?compactHints[slug]:null;
  const sources=recipe?.sources?mergeSources(recipe.sources,reviewedSources(slug)):hint||reviewedSources(slug);
  const merge=recipe?.groups?.length===1?recipe.groups[0].map(x=>[x.name,x.target]):recipe?.groups?.length>1?null:hint?.merge;
  return {sources,merge,alternatives:recipe?.groups?.length>1?recipe.groups.length:0};
 }
 function compactSummary(row,slug,recipe,origin,{all=false}={}){
  const data=compactData(slug,recipe),s=data.sources;
  if(!s&&!data.merge&&!data.alternatives)return false;
  const block=document.createElement('div');block.className='aqwc-compact-sources';
  function line(label,items,kind){
   if(!items?.length)return;
   const line=document.createElement('div');line.className='aqwc-compact-source';const tag=document.createElement('span');tag.className='aqwc-source-tag';tag.dataset.kind=kind;tag.textContent=label;const body=document.createElement('div');body.className='aqwc-source-values';line.append(tag,body);
   let expanded=all;
   function fill(){
    body.replaceChildren();const limit=expanded?items.length:3;
    items.slice(0,limit).forEach((x,j)=>{
     if(j)body.append(document.createTextNode(' · '));
     const cmd=kind==='location'&&x.slug&&!/\b(shop|merge shop)\b/i.test(x.name)?x.join||(Object.hasOwn(verifiedMaps,x.slug)?verifiedMaps[x.slug]:null)||mapCache.get(x.slug):null;
     if(cmd){joinControl(body,{...x,join:cmd},origin);return}
     const el=document.createElement(x.slug?'a':'span');el.textContent=x.name;if(x.slug)el.href=origin+'/'+x.slug+(x.hash||'');body.append(el);
     if(expanded&&kind==='location'&&x.slug&&!/\b(shop|merge shop)\b/i.test(x.name))joinControl(body,x,origin);
    });
    if(items.length>3&&!all){const more=document.createElement('button');more.type='button';more.className='aqwc-source-more';more.textContent=expanded?'Show less':'+'+(items.length-3)+' more';more.setAttribute('aria-expanded',String(expanded));more.addEventListener('click',e=>{if(e.isTrusted){expanded=!expanded;fill()}});body.append(more)}
   }
   fill();
   block.append(line);
  }
  if(data.merge)line('MERGE',data.merge.map(([name,qty])=>({name:name+' ×'+qty})),'merge');
  else if(data.alternatives)line('MERGE',[{name:data.alternatives+' alternative recipes'}],'merge');
  line('QUEST',s?.quests,'quest');line('DROP',s?.drops,'drop');
  line('SHOP',s?.shops,'shop');
  line('MAP',s?.locations?.filter(x=>!/\b(shop|merge shop)\b/i.test(x.name)),'location');
  if(all&&s?.locations?.some(x=>/\b(shop|merge shop)\b/i.test(x.name)))line('SHOP',s.locations.filter(x=>/\b(shop|merge shop)\b/i.test(x.name)),'shop');
  if(!block.children.length)return false;
  if(all){const link=document.createElement('a');link.href=origin+'/'+slug;link.textContent='Material Wiki ↗';link.className='aqwc-source-page';block.append(link);if(recipe?.incomplete||!recipe?.sources){const note=document.createElement('small');note.textContent='Source summary may be incomplete';block.append(note)}}
  row.append(block);return true;
 }
 function render(card,content,origin){
  const {groups,incomplete}=parse(content,origin);
  if(!groups.length&&!incomplete)return;
  const panel=document.createElement('details');panel.open=true;panel.className='aqwc-section aqwc-farming';panel.style.cssText='min-width:0;max-width:100%;';
  const heading=document.createElement('summary');heading.textContent='Farming Progress';panel.append(heading);card.append(panel);
  const note=text=>{const n=document.createElement('div');n.textContent=text;n.style.cssText='font-size:11px;color:#b6cddd;margin:5px 0;font-weight:400';return n};

  if(incomplete)panel.append(note('Some recipe rows could not be read; check the original Wiki requirements.'));
  if(!groups.length)return panel;
  const tree=document.createElement('div'),statusLine=note('Checking synced inventory…');statusLine.setAttribute('role','status');panel.append(tree,statusLine);
  const states=new Map(),cache=new Map(),names=new Set(groups.flat().map(x=>x.name));let matches=new Map(),busy=true,requests=0,activeOption=0;
  const rootSlug=location.pathname.replace(/^\/|\/$/g,'');
  async function lookup(){
   const list=[...names];if(list.length>80)throw Error('Recipe material limit reached');
   const r=await chrome.runtime.sendMessage({type:'wiki-material-lookup',names:list});
   if(!r?.ok||!Array.isArray(r.matches)||r.matches.length!==list.length)throw Error('Inventory unavailable; refresh after syncing');
   matches=new Map(list.map((name,i)=>[name,r.matches[i]]));
   statusLine.textContent=r.syncedAt?'':'No inventory synced yet.';
  }
  function button(text){
   const b=document.createElement('button');b.type='button';b.textContent=text;b.disabled=busy;
   b.style.cssText='font:600 11px system-ui;color:#a9ddff;background:#19334a;border:1px solid #466781;border-radius:4px;padding:2px 5px;cursor:pointer;white-space:nowrap';return b
  }
  async function expand(n){
   if(busy)return;
   let s=states.get(n.path);
   if(s){s.open=!s.open;draw();return}
   s={open:true,choice:-1,groups:[],incomplete:false,error:'',sources:reviewedSources(n.slug),partial:true};states.set(n.path,s);
   busy=true;statusLine.textContent='Reading Wiki recipe…';draw();
   try{
    let recipe=cache.get(n.slug);
    if(!recipe||recipe.previewFailed){if(requests>=20)throw Error('Wiki recipe request limit reached');requests++;recipe=await loadRecipe(origin,n.slug);cache.set(n.slug,recipe)}
    s.sources=mergeSources(recipe.sources,reviewedSources(n.slug));s.partial=!!reviewedSources(n.slug)||recipe.incomplete;
    const next=new Set([...names,...recipe.groups.flat().map(x=>x.name)]);
    if(next.size>80)throw Error('Recipe material limit reached');
    for(const name of next)names.add(name);
    await lookup();
    s.groups=recipe.groups;s.incomplete=recipe.incomplete;s.choice=recipe.groups.length===1&&!recipe.incomplete?0:-1;
   }catch(err){s.error=String(err?.message||err);statusLine.textContent='Some nested requirements could not be loaded.'}
   finally{busy=false;draw()}
  }
  async function loadPreviews(group){
   if(busy)return;busy=true;statusLine.textContent='Reading material sources…';draw();
   try{for(const n of group.filter(n=>!cache.has(n.slug)&&!compactHints[n.slug]&&!reviewedSources(n.slug)).slice(0,6)){if(requests>=20)break;requests++;try{cache.set(n.slug,await loadRecipe(origin,n.slug))}catch{cache.set(n.slug,{groups:[],incomplete:true,previewFailed:true})}}}finally{busy=false;statusLine.textContent='';draw()}
  }
  function draw(){
   tree.replaceChildren();
   if(groups.length>1){const bar=document.createElement('div');bar.className='aqwc-recipe-tabs';groups.forEach((g,j)=>{const tab=button(recipeLabel(g,j,rootSlug));tab.setAttribute('aria-pressed',String(j===activeOption));tab.addEventListener('click',e=>{if(e.isTrusted&&!busy){activeOption=j;draw()}});bar.append(tab)});tree.append(bar)}
   groups.forEach((group,i)=>{if(i!==activeOption)return;
    const p=plan(group,states,matches,rootSlug,i);
    if(!busy&&group.some(n=>!cache.has(n.slug)&&!Object.hasOwn(compactHints,n.slug)&&!reviewedSources(n.slug))&&requests<20){const load=button('Load material sources');load.className='aqwc-preview-load';load.addEventListener('click',e=>{if(e.isTrusted)loadPreviews(group)});tree.append(load)}
    if(!busy){const ready=p.root.filter(n=>n.missing===0).length;tree.append(note(ready+' / '+p.root.length+' materials ready'));const track=document.createElement('div'),fill=document.createElement('div');track.style.cssText='height:6px;background:#0a1926;border-radius:6px;overflow:hidden';fill.style.cssText='height:100%;background:#53c7e6;width:'+(p.root.length?ready/p.root.length*100:0)+'%';track.setAttribute('aria-label',ready+' of '+p.root.length+' direct ingredients ready');track.append(fill);tree.append(track)}
    const columns=document.createElement('div');columns.className='aqwc-column-labels';for(const label of ['Material','Acquisition / map','Progress']){const cell=document.createElement('span');cell.textContent=label;columns.append(cell)}tree.append(columns);
    function drawNode(n,container){
     const row=document.createElement('div');row.className='aqwc-material-row';
     const top=document.createElement('div');top.className='aqwc-material-top';
     const nameBox=document.createElement('div');nameBox.style.cssText='display:flex;align-items:center;gap:5px;min-width:0';
     const s=states.get(n.path);row.setAttribute('data-open',String(!!s?.open));
     if(n.missing>0&&n.depth<4&&!n.reason){const b=button(s?.open?'▾':'▸');b.setAttribute('aria-label',(s?.open?'Collapse ':'How to get ')+n.name);b.setAttribute('aria-expanded',String(!!s?.open));b.addEventListener('click',e=>{if(e.isTrusted)expand(n)});nameBox.append(b)}
     const a=document.createElement('a');a.href=origin+'/'+n.slug;a.textContent=n.name;a.style.cssText='color:#a9ddff;text-decoration:underline;overflow-wrap:anywhere';nameBox.append(a);
     const status=document.createElement('span');status.style.whiteSpace='nowrap';const done=n.missing===0,known=n.allocated!==null;
     status.textContent=(known?(done?'✓ ':n.allocated?'◐ ':'✕ ')+n.allocated.toLocaleString():'?')+' / '+n.target.toLocaleString();
     status.style.color=done?'#90edb5':!known||n.allocated?'#ffdb93':'#ffc2a8';
     if(known)status.title='Synced stock: '+n.stock.toLocaleString()+' · allocated to this requirement: '+n.allocated.toLocaleString();
     top.append(nameBox,status);row.append(top);if(known&&n.missing>0)status.title+=(status.title?' · ':'')+n.missing.toLocaleString()+' remaining';
     container.append(row);
     compactSummary(row,n.slug,cache.get(n.slug),origin);
     if(n.reason)row.append(note(n.reason));
     if(!s?.open||!n.missing)return;
     const nested=document.createElement('div');nested.className='aqwc-material-nested';row.append(nested);
     const recipe=cache.get(n.slug);const found=compactSummary(nested,n.slug,recipe||{sources:s.sources,groups:s.groups,incomplete:s.partial},origin,{all:true});
     if(s.error){nested.append(note('Wiki unavailable: '+s.error));const retry=button('Retry');retry.addEventListener('click',e=>{if(e.isTrusted&&!busy){states.delete(n.path);expand(n)}});nested.append(retry);return}
     if(busy&&!s.groups.length){nested.append(note('Loading…'));return}
     if(s.incomplete)nested.append(note('Some requirements could not be read. Verify the original Wiki page.'));
     if(!s.groups.length){if(!found)nested.append(note('No acquisition links recognized. Open the material page to check its sources.'));return}
     if(s.groups.length>1||s.incomplete){
      const select=document.createElement('select');select.setAttribute('aria-label','Recipe option for '+n.name);select.disabled=busy;select.style.cssText='max-width:100%;background:#19334a;color:#e5f5ff;border:1px solid #466781;border-radius:4px;font:12px system-ui';
      const first=document.createElement('option');first.value='-1';first.textContent='Choose merge option';select.append(first);
      s.groups.forEach((g,j)=>{const opt=document.createElement('option');opt.value=String(j);opt.textContent='Option '+(j+1)+' · '+g.map(x=>x.name+' ×'+x.target).join(', ');select.append(opt)});
      select.value=String(s.choice);select.addEventListener('change',e=>{if(!e.isTrusted||busy)return;const choice=Number(select.value);if(choice!==s.choice){for(const key of states.keys())if(key.startsWith(n.path+'.'))states.delete(key);s.choice=choice}draw()});nested.append(select);
     }
     if(s.choice>=0){const subLabel=note('Sub-recipe · Craft ×'+n.missing.toLocaleString()+' · '+n.children.filter(c=>c.missing===0).length+'/'+n.children.length+' ready');subLabel.className='aqwc-subrecipe-label';nested.append(subLabel);n.children.forEach(c=>drawNode(c,nested))}
    }
    p.root.forEach(n=>drawNode(n,tree));if(p.limited)tree.append(note('Recipe size limit reached; remaining requirements not evaluated.'));
   })
  }
  draw();lookup().catch(()=>{statusLine.textContent='Inventory unavailable. Sync in Companion and refresh this page.'}).finally(()=>{busy=false;draw()});return panel;
 }
 globalThis.AQWCWikiMaterials=Object.freeze({parse,parseRow,plan,render,parseSources,reviewedSources,mergeSources,renderSources,mapCommand,joinControl,recipeLabel,sourceLink,compactData,monsterPreview,monsterImage});
})();
