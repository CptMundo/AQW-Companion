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
 function renderSources(container,sources,origin,slug,{partial=false}={}){
  if(!sources||!Object.values(sources).some(a=>a.length))return false;
  const box=document.createElement('div');box.className='aqwc-source-guide';const title=document.createElement('strong');title.textContent='How to get';box.append(title);
  for(const [kind,label] of [['locations','Locations'],['drops','Drops from'],['quests','Quest rewards'],['shops','Available from']]){
   const rows=sources[kind]||[];if(!rows.length)continue;
   const group=document.createElement('div'),heading=document.createElement('small');heading.className='aqwc-source-label';heading.textContent=label;group.append(heading);
   for(const x of rows.slice(0,40)){
    const line=document.createElement('div');line.className='aqwc-source-line';const a=document.createElement('a');a.href=origin+'/'+x.slug+(x.hash||'');a.textContent=x.name;line.append(a);
    if(kind==='locations'){
     const join=x.join||(x.slug==='luna-cove'?'lunacove':null);
     if(join&&/^[a-z0-9-]{1,60}$/.test(join)){
      const copy=document.createElement('button');copy.type='button';copy.textContent='/join '+join+' · Copy';copy.className='aqwc-copy-join';
      copy.addEventListener('click',async e=>{if(!e.isTrusted)return;try{await navigator.clipboard.writeText('/join '+join);copy.textContent='Copied /join '+join}catch{copy.textContent='/join '+join+' · copy manually'}});line.append(copy);
     }
    }
    group.append(line);
   }
   box.append(group);
  }
  if(partial){const note=document.createElement('small');note.textContent='Reviewed sources (partial list). Open the Wiki for all sources.';box.append(note)}
  const link=document.createElement('a');link.href=origin+'/'+slug;link.textContent='View original material page ↗';link.className='aqwc-source-page';box.append(link);container.append(box);return true;
 }
 async function loadRecipe(origin,slug){
  if(origin!=='https://aqwwiki.wikidot.com'||! /^[a-z0-9][a-z0-9-]{0,199}$/.test(slug))throw Error('Unsupported Wiki link');
  const url=origin+'/'+slug,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{
   const r=await fetch(url,{credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});
   if(!r.ok||r.url!==url||!String(r.headers.get('content-type')).includes('text/html'))throw Error('Wiki page unavailable');
   if(!r.body||Number(r.headers.get('content-length'))>1500000)throw Error('Wiki page too large');
   const reader=r.body.getReader(),decoder=new TextDecoder();let html='',size=0;
   try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1500000){await reader.cancel();throw Error('Wiki page too large')}html+=decoder.decode(value,{stream:true})}html+=decoder.decode()}finally{reader.releaseLock()}
   const template=document.createElement('template');template.innerHTML=html;
   const doc=template.content,content=doc.querySelector('#page-content');
   const body=String(content?.textContent||'');
   const crumb=doc.querySelector('#breadcrumbs')||doc.querySelector('.breadcrumbs, #breadcrumb, .breadcrumb');
   const links=[...(crumb?.querySelectorAll('a[href]')||[])];
   if(!content||!doc.querySelector('#page-title')||!/\bSellback\s*:/i.test(body)||!/\bDescription\s*:/i.test(body)||/\busually refers to\s*:/i.test(body)||links.length&&!links.some(a=>{try{return new URL(a.getAttribute('href'),url).pathname.replace(/^\/|\/$/g,'')==='items'}catch{return false}}))return {groups:[],incomplete:true};
   return {...parse(content,origin),sources:parseSources(content,origin)};
  }finally{clearTimeout(timer)}
 }
 function render(card,content,origin){
  const {groups,incomplete}=parse(content,origin);
  if(!groups.length&&!incomplete)return;
  const panel=document.createElement('section');panel.className='aqwc-section';panel.style.cssText='min-width:0;max-width:100%;';
  const heading=document.createElement('strong');heading.textContent='Farming Progress';panel.append(heading);card.append(panel);
  const note=text=>{const n=document.createElement('div');n.textContent=text;n.style.cssText='font-size:11px;color:#b6cddd;margin:5px 0;font-weight:400';return n};
  panel.append(note('Expand a material to see where to farm it or how to craft it.'));const help=document.createElement('details');const summary=document.createElement('summary');summary.textContent='How progress is calculated';summary.style.cssText='font-size:11px;color:#a9c4d8;cursor:pointer';help.append(summary,note('Stock is reserved once per option; alternative root recipes are independent. Unrecognized rows require manual verification.'));panel.append(help);
  if(incomplete)panel.append(note('Some recipe rows could not be read; check the original Wiki requirements.'));
  if(!groups.length)return;
  const tree=document.createElement('div'),statusLine=note('Checking synced inventory…');statusLine.setAttribute('role','status');panel.append(tree,statusLine);
  const states=new Map(),cache=new Map(),names=new Set(groups.flat().map(x=>x.name));let matches=new Map(),busy=true,requests=0;
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
    if(!recipe){if(requests>=20)throw Error('Wiki recipe request limit reached');requests++;recipe=await loadRecipe(origin,n.slug);cache.set(n.slug,recipe)}
    s.sources=mergeSources(recipe.sources,reviewedSources(n.slug));s.partial=!!reviewedSources(n.slug)||recipe.incomplete;
    const next=new Set([...names,...recipe.groups.flat().map(x=>x.name)]);
    if(next.size>80)throw Error('Recipe material limit reached');
    for(const name of next)names.add(name);
    await lookup();
    s.groups=recipe.groups;s.incomplete=recipe.incomplete;s.choice=recipe.groups.length===1&&!recipe.incomplete?0:-1;
   }catch(err){s.error=String(err?.message||err);statusLine.textContent='Some nested requirements could not be loaded.'}
   finally{busy=false;draw()}
  }
  function draw(){
   tree.replaceChildren();
   groups.forEach((group,i)=>{
    const p=plan(group,states,matches,rootSlug,i);
    if(groups.length>1){const label=note('Merge option '+(i+1)+' (separate recipe)');label.style.color='#a9ddff';tree.append(label)}
    if(!busy){const ready=p.root.filter(n=>n.missing===0).length;tree.append(note(ready+' / '+p.root.length+' direct ingredients ready · nested progress below'));const track=document.createElement('div'),fill=document.createElement('div');track.style.cssText='height:6px;background:#0a1926;border-radius:6px;overflow:hidden';fill.style.cssText='height:100%;background:#53c7e6;width:'+(p.root.length?ready/p.root.length*100:0)+'%';track.setAttribute('aria-label',ready+' of '+p.root.length+' direct ingredients ready');track.append(fill);tree.append(track)}
    function drawNode(n,container){
     const row=document.createElement('div');row.style.cssText='margin-top:8px;min-width:0;padding:12px;border:1px solid #2c485d;border-radius:9px;background:#101e2d';
     const top=document.createElement('div');top.style.cssText='display:flex;align-items:baseline;justify-content:space-between;gap:8px';
     const nameBox=document.createElement('div');nameBox.style.cssText='display:flex;align-items:center;gap:5px;min-width:0';
     const s=states.get(n.path);
     if(n.missing>0&&n.depth<4&&!n.reason){const b=button(s?.open?'▾':'▸');b.setAttribute('aria-label',(s?.open?'Collapse ':'How to get ')+n.name);b.setAttribute('aria-expanded',String(!!s?.open));b.addEventListener('click',e=>{if(e.isTrusted)expand(n)});nameBox.append(b)}
     const a=document.createElement('a');a.href=origin+'/'+n.slug;a.textContent=n.name;a.style.cssText='color:#a9ddff;text-decoration:underline;overflow-wrap:anywhere';nameBox.append(a);
     const status=document.createElement('span');status.style.whiteSpace='nowrap';const done=n.missing===0,known=n.allocated!==null;
     status.textContent=(known?(done?'✓ ':n.allocated?'◐ ':'✕ ')+n.allocated.toLocaleString():'?')+' / '+n.target.toLocaleString();
     status.style.color=done?'#90edb5':!known||n.allocated?'#ffdb93':'#ffc2a8';
     if(known)status.title='Synced stock: '+n.stock.toLocaleString()+' · allocated to this requirement: '+n.allocated.toLocaleString();
     top.append(nameBox,status);row.append(top);if(known&&n.missing>0)row.append(note(n.missing.toLocaleString()+' remaining'));
     const track=document.createElement('div'),fill=document.createElement('div');track.style.cssText='height:6px;border-radius:6px;background:#091622;overflow:hidden;margin-top:7px';fill.style.cssText='height:100%;width:'+(known?Math.min(100,n.allocated/n.target*100):0)+'%;background:'+(done?'#57ca91':n.allocated?'#e9b958':'#e58b7c');track.append(fill);row.append(track);container.append(row);
     if(n.reason)row.append(note(n.reason));
     if(!s?.open||!n.missing)return;
     const nested=document.createElement('div');nested.style.cssText='margin:5px 0 0 8px;padding-left:10px;border-left:1px solid #38566d';row.append(nested);
     const found=renderSources(nested,s.sources,origin,n.slug,{partial:s.partial});
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
     if(s.choice>=0){nested.append(note('Ingredients for '+n.missing.toLocaleString()+' missing · '+n.children.filter(c=>c.missing===0).length+' / '+n.children.length+' ready'));n.children.forEach(c=>drawNode(c,nested))}
    }
    p.root.forEach(n=>drawNode(n,tree));if(p.limited)tree.append(note('Recipe size limit reached; remaining requirements not evaluated.'));
   })
  }
  draw();lookup().catch(()=>{statusLine.textContent='Inventory unavailable. Sync in Companion and refresh this page.'}).finally(()=>{busy=false;draw()});
 }
 globalThis.AQWCWikiMaterials=Object.freeze({parse,parseRow,plan,render,parseSources,reviewedSources,mergeSources,renderSources});
})();
