/* Scoped shop and quest inventory annotations; never infer quest completion. */
(()=>{
'use strict';
const origin='https://aqwwiki.wikidot.com',clean=x=>String(x||'').replace(/\s+/g,' ').trim();
function itemLink(a){
 const name=clean(a?.textContent);if(!name||name.length>350||a.querySelector?.('img'))return null;
 try{const u=new URL(a.getAttribute('href'),origin);if(u.origin!==origin||!/^\/[a-z0-9][a-z0-9-]{0,199}\/?$/.test(u.pathname)||u.hash||u.search)return null;return {name,slug:u.pathname.replace(/^\/|\/$/g,'')}}catch{return null}
}
function pageKind(crumb){
 const links=[...(crumb?.querySelectorAll('a[href]')||[])].map(itemLink).filter(Boolean).map(x=>x.slug);
 if(links.includes('items'))return null;
 if(links.includes('quests'))return 'quest';
 if(links.includes('shops')||links.includes('merge-shops'))return 'shop';
 return null;
}
function quantity(s){const m=clean(s).match(/^[x×]\s*(\d{1,3}(?:,\d{3})+|\d+)$/i);const n=m?Number(m[1].replace(/,/g,'')):0;return Number.isSafeInteger(n)&&n>0&&n<=100000000?n:null}
function questQuantity(s){
 // Stacking metadata is not a cost. Only remove an explicit trailing note.
 return quantity(clean(s).replace(/\s*\(Stacks? (?:up )?to (?:\d{1,3}(?:,\d{3})+|\d+)\)$/i,''));
}
function linkedRow(li){
 const links=[...li.querySelectorAll('a[href]')].filter(a=>!a.closest('ul,ol')||a.closest('ul,ol')===li.parentElement);
 // Ignore decoration links, but never treat a monster/drop link or an unlinked
 // temporary quest counter as an inventory item.
 const candidates=links.map(a=>({a,item:itemLink(a)})).filter(x=>x.item);
 if(candidates.length!==1)return null;
 const {a,item}=candidates[0];
 const text=clean([...li.childNodes].filter(n=>n.nodeType===3||n.nodeType===1&&!['UL','OL'].includes(n.tagName)).map(n=>n.textContent).join(' '));
 if(!text.startsWith(item.name))return null;
 const target=questQuantity(text.slice(item.name.length));
 return target?{...item,target,anchor:a}:null;
}
function shopCosts(cell){
 // Split only explicit price lines. Reject mixed currency, bundle output,
 // alternative costs, unlinked text and ambiguous names rather than guessing.
 const lines=[[]];for(const n of cell.childNodes){
  if(n.nodeType===1&&n.tagName==='BR')lines.push([]);else lines.at(-1).push(n);
 }
 const result=[];
 for(const nodes of lines){
  const text=clean(nodes.map(n=>n.textContent).join(' ')).replace(/,\s*$/,'');
  if(!text)continue;
  const links=nodes.flatMap(n=>n.nodeType!==1?[]:n.tagName==='A'?[n]:[...n.querySelectorAll('a[href]')]).map(a=>({a,item:itemLink(a)})).filter(x=>x.item);
  if(links.length!==1)return null;
  const {a,item}=links[0];if(!text.startsWith(item.name))return null;
  const target=quantity(text.slice(item.name.length));if(!target)return null;
  result.push({...item,target,anchor:a});
 }
 return result.length&&new Set(result.map(x=>x.slug)).size===result.length?result:null;
}
function collect(content,kind){
 const groups=[];let skipped=0;
 if(kind==='quest'){
  for(const marker of content.querySelectorAll('p,div,strong,b')){
   if(!/^(Items Required|Items|Items Rewarded):$/i.test(clean(marker.textContent)))continue;
   if([...marker.children].some(c=>['P','DIV','STRONG','B'].includes(c.tagName)&&clean(c.textContent)===clean(marker.textContent)))continue;
   const block=['STRONG','B'].includes(marker.tagName)&&/^(P|DIV)$/.test(marker.parentElement?.tagName)&&clean(marker.parentElement.textContent)===clean(marker.textContent)?marker.parentElement:marker;
   const list=block.nextElementSibling;if(!list||!['UL','OL'].includes(list.tagName))continue;
   const rows=[...list.children].filter(x=>x.tagName==='LI'),items=rows.map(linkedRow);
   skipped+=items.filter(x=>!x).length;
   const role=/^Items Required:/i.test(clean(marker.textContent))?'requirement':'reward';
   if(items.some(Boolean))groups.push({role,items:items.filter(Boolean),complete:items.every(Boolean)});
  }
 }else if(kind==='shop'){
  for(const table of content.querySelectorAll('table')){
   const rows=[...table.rows];if(!rows.length)continue;
   const header=[...rows[0].cells].map(c=>clean(c.textContent).toLowerCase()),nameIndex=header.indexOf('name'),priceIndex=header.indexOf('price');
   if(nameIndex<0||priceIndex<0)continue;
   for(const row of rows.slice(1)){
    const cells=[...row.cells],offset=cells.length-header.length;
    if(offset<0||offset>1)continue;
    const nameCell=cells[nameIndex+offset],priceCell=cells[priceIndex+offset];
    if(!nameCell||!priceCell)continue;
    const candidates=[...nameCell.querySelectorAll('a[href]')].map(a=>({a,item:itemLink(a)})).filter(x=>x.item);
    if(candidates.length!==1){skipped++;continue}
    const {a,item}=candidates[0];groups.push({role:'shop-item',items:[{...item,target:1,anchor:a}],complete:true});
    const costs=shopCosts(priceCell);if(costs)groups.push({role:'cost',items:costs,complete:true});else skipped++;
   }
  }
 }
 return {groups,skipped};
}
function labels(group,matches){
 const remaining=new Map();
 return group.items.map(item=>{
  const m=matches.get(item.name);
  if(!m||!['owned','not-found'].includes(m.state))return {item,text:'? Unknown',color:'#ffdb93'};
  const total=m.state==='owned'?m.total:0;
  if(!Number.isSafeInteger(total)||total<0)return {item,text:'? Unknown',color:'#ffdb93'};
  if(group.role==='shop-item'||group.role==='reward')return {item,text:total?'✓ Owned ×'+total.toLocaleString():'Not in snapshot',color:total?'#90edb5':'#ffc2a8'};
  if(group.role==='requirement')return {item,text:'Stock '+total.toLocaleString()+'/'+item.target.toLocaleString(),color:total>=item.target?'#90edb5':total?'#ffdb93':'#ffc2a8'};
  if(total&&(!m.itemId||typeof m.itemId!=='string'))return {item,text:'? Unknown',color:'#ffdb93'};
  if(total&&!remaining.has(m.itemId))remaining.set(m.itemId,total);
  const allocated=total?Math.min(item.target,remaining.get(m.itemId)):0;
  if(total)remaining.set(m.itemId,remaining.get(m.itemId)-allocated);
  return {item,text:'Stock '+allocated.toLocaleString()+'/'+item.target.toLocaleString(),color:allocated>=item.target?'#90edb5':allocated?'#ffdb93':'#ffc2a8'};
 });
}
function questScope(content,tabs,name){
 const candidates=tabs.filter(a=>clean(a.textContent)===name);
 if(candidates.length!==1)return null;
 const a=candidates[0],raw=a.getAttribute('aria-controls')||a.getAttribute('href')||'';
 const id=raw.startsWith('#')?raw.slice(1):a.getAttribute('aria-controls')?raw:'';
 const explicit=/^[a-zA-Z0-9_:. -]{1,160}$/.test(id)?content.ownerDocument?.getElementById(id):null;
 if(explicit&&explicit!==content&&content.contains(explicit))return explicit;
 // YUI may rewrite anchors to javascript:; or omit their target IDs.
 // Resolve only within the anchor's own tabset and require a 1:1 mapping
 // between its direct nav entries and direct content panes.
 const nav=a.closest?.('.yui-nav'),group=nav?.closest?.('.yui-navset');
 if(!nav||!group||!content.contains(group))return null;
 const navs=[...group.children].filter(x=>x.classList.contains('yui-nav'));
 const containers=[...group.children].filter(x=>x.classList.contains('yui-content'));
 if(navs.length!==1||navs[0]!==nav||containers.length!==1)return null;
 const anchors=[...nav.children].filter(x=>x.tagName==='LI').map(x=>x.querySelector('a'));
 const panes=[...containers[0].children].filter(x=>x.tagName==='DIV'||x.getAttribute('role')==='tabpanel');
 const index=anchors.indexOf(a);
 return index>=0&&anchors.every(Boolean)&&anchors.length===panes.length&&content.contains(panes[index])?panes[index]:null;
}

function questLists(scope){
 const result=[];
 for(const marker of scope.querySelectorAll('p,div,strong,b')){
  const label=clean(marker.textContent);
  if(!/^(Items Required|Items|Items Rewarded|Rewards):$/i.test(label))continue;
  if([...marker.children].some(c=>['P','DIV','STRONG','B'].includes(c.tagName)&&clean(c.textContent)===label))continue;
  const block=['STRONG','B'].includes(marker.tagName)&&/^(P|DIV)$/.test(marker.parentElement?.tagName)&&clean(marker.parentElement.textContent)===label?marker.parentElement:marker;
  const list=block.nextElementSibling;if(!list||!['UL','OL'].includes(list.tagName)||result.some(x=>x.list===list))continue;
  const rows=[...list.children].filter(x=>x.tagName==='LI').map(li=>{
   const text=clean([...li.childNodes].filter(n=>n.nodeType===3||n.nodeType===1&&!['UL','OL'].includes(n.tagName)).map(n=>n.textContent).join(' '));
   const drops=[],instructions=[];
   for(const nested of [...li.children].filter(n=>['UL','OL'].includes(n.tagName))){
    for(const child of [...nested.children].filter(n=>n.tagName==='LI')){
     const desc=clean(child.textContent);
     if(/^Dropped by\b/i.test(desc)){
      for(const a of child.querySelectorAll('a[href]')){const x=itemLink(a);if(x&&!drops.some(d=>d.slug===x.slug))drops.push(x)}
      if(!child.querySelectorAll('a[href]').length&&desc)instructions.push(desc);
     }else if(desc)instructions.push(desc);
    }
   }
   return {text,drops,instructions,linked:linkedRow(li)};
  }).filter(x=>x.text);
  result.push({list,role:/^Items Required:/i.test(label)?'requirement':'reward',rows});
 }
 return result;
}
function questLocationLinks(scope){
 const links=[];
 for(const marker of scope.querySelectorAll('strong,b,p')){
  const text=clean(marker.textContent);if(!/^Quest Locations?\s*:/i.test(text))continue;
  const candidates=[];
  if(['STRONG','B'].includes(marker.tagName)){
   for(let n=marker.nextSibling,k=0;n&&k++<16;n=n.nextSibling){if(['BR','STRONG','B','P','DIV'].includes(n.nodeName))break;if(n.nodeName==='A')candidates.push(n);else if(n.nodeType===1)candidates.push(...n.querySelectorAll('a[href]'))}
  }else{
   // A Wikidot paragraph may also contain NPC and prerequisite lines.
   for(const n of marker.childNodes){if(n.nodeName==='BR')break;if(n.nodeName==='A')candidates.push(n);else if(n.nodeType===1&&!['STRONG','B'].includes(n.nodeName))candidates.push(...n.querySelectorAll('a[href]'))}
  }
  for(const a of candidates){const x=itemLink(a);if(x&&!links.some(y=>y.slug===x.slug))links.push(x)}
  if(links.length)break;
 }
 return links;
}
function questCards(panel,content,title){
 const source=location.pathname.replace(/^\/|\/$/g,'');
 const link=document.createElement('a');link.href='https://cptmundo.github.io/AQW-Companion/#aqwc-pinned-quests';link.target='_blank';link.rel='noopener noreferrer';link.textContent='View pinned quests ↗';link.className='aqwc-quest-link';panel.append(link);
 const tabs=[...new Set(content.querySelectorAll('.yui-nav li a,[role="tab"],.yui-navset .yui-nav a'))];
 const names=[...new Set(tabs.map(a=>clean(a.textContent)).filter(n=>n&&n.length<=350))];
 const locations=questLocationLinks(content),api=globalThis.AQWCWikiMaterials;

 const cards=document.createElement('div');cards.className='aqwc-quest-cards';const selected=document.createElement('div');selected.className='aqwc-selected-quest';panel.append(cards,selected);
 const choices=tabs.length?tabs.filter(a=>clean(a.textContent)&&clean(a.textContent).length<=350).map(a=>({name:clean(a.textContent),tab:a})): [{name:clean(title.textContent),tab:null}];
 let active=null,activeButton=null;
 for(const {name,tab} of choices.slice(0,100)){
  const tabButton=document.createElement('button');tabButton.type='button';tabButton.className='aqwc-quest-choice';tabButton.textContent=name;tabButton.setAttribute('aria-pressed','false');cards.append(tabButton);
  const detail=document.createElement('section');detail.className='aqwc-quest-card';detail.hidden=true;const summary=document.createElement('strong');summary.className='aqwc-selected-heading';summary.textContent=name;detail.append(summary);const body=document.createElement('div');body.className='aqwc-quest-body';detail.append(body);selected.append(detail);
  let built=false;
  tabButton.addEventListener('click',async e=>{
   if(!e.isTrusted)return;
   if(active===detail){detail.hidden=true;tabButton.setAttribute('aria-pressed','false');active=null;activeButton=null;return}
   if(active){active.hidden=true;activeButton.setAttribute('aria-pressed','false')}
   active=detail;activeButton=tabButton;detail.hidden=false;tabButton.setAttribute('aria-pressed','true');
   if(built)return;
   const scope=tab?questScope(content,[tab],name):content;
   if(!scope){body.textContent='Quest section not recognized. Select the original Wiki tab, then try again.';return}
   built=true;body.replaceChildren();
   const lists=questLists(scope);
   const requirement=[...scope.querySelectorAll('p')].map(n=>clean(n.textContent)).find(s=>/^Requirements?:/i.test(s)&&s.length<=600);
   if(requirement){const req=document.createElement('small');req.textContent=requirement;body.append(req)}
   const local=questLocationLinks(scope);const maps=local.length?local:locations.length===1?locations:[];
   if(maps.length){const section=document.createElement('div');section.className='aqwc-quest-block';const h=document.createElement('strong');h.textContent='Quest location';section.append(h);for(const x of maps){const row=document.createElement('div');row.className='aqwc-source-line';const a=document.createElement('a');a.href=origin+'/'+x.slug;a.textContent=x.name;row.append(a);api?.joinControl(row,x,origin);section.append(row)}body.append(section)}
   const linked=[...new Set(lists.flatMap(g=>g.rows.map(x=>x.linked?.name).filter(Boolean)))].slice(0,80),stock=new Map();
   if(linked.length)try{const result=await chrome.runtime.sendMessage({type:'wiki-material-lookup',names:linked});if(result?.ok&&result.syncedAt&&result.matches?.length===linked.length)linked.forEach((n,i)=>stock.set(n,result.matches[i]))}catch{}
   for(const g of lists){
    const section=document.createElement('div');section.className='aqwc-quest-block';const h=document.createElement('strong');h.textContent=g.role==='requirement'?'Objectives':'Rewards';section.append(h);
    for(const x of g.rows){
     const row=document.createElement('div');row.className='aqwc-quest-objective';const desc=document.createElement('span');desc.textContent=x.text;row.append(desc);
     const hit=stock.get(x.linked?.name);if(hit&&['owned','not-found'].includes(hit.state)){const badge=document.createElement('small');badge.textContent='Stock '+(hit.state==='owned'?hit.total:0);row.append(badge)}
     for(const instruction of x.instructions){const help=document.createElement('div');help.className='aqwc-quest-drops';help.textContent=instruction;row.append(help)}
     if(x.drops.length){const list=document.createElement('div');list.className='aqwc-quest-drops';list.append(document.createTextNode('Dropped by: '));for(const d of x.drops){const a=document.createElement('a');a.href=origin+'/'+d.slug;a.textContent=d.name;list.append(a)}row.append(list)}
     section.append(row)
    }
    body.append(section)
   }
   if(!lists.length){const n=document.createElement('small');n.textContent='No structured objectives found. Check the Wiki quest text.';body.append(n)}
   if(name){const add=document.createElement('button');add.type='button';add.className='aqwc-primary';add.textContent='📌 Pin quest to Companion';const feedback=document.createElement('small');feedback.setAttribute('role','status');let queued=false;const complete=document.createElement('button');complete.type='button';complete.className='aqwc-primary';complete.textContent='Mark quest complete';complete.hidden=true;body.append(add,complete,feedback);async function readPin(){if(detail.hidden||document.hidden)return;try{const r=await chrome.runtime.sendMessage({type:'goal-status-read',query:{kind:'quest',name}});if(!r?.ok)return;if(r.state==='saved'){add.textContent=r.completed?'✓ Completed (manual)':'✓ Pinned';add.disabled=true;complete.hidden=!!r.completed;feedback.textContent='Companion synced '+new Date(r.at).toLocaleTimeString()}else if(r.state==='absent'&&!queued){add.textContent='📌 Pin quest to Companion';add.disabled=false;complete.hidden=true}else if(r.state==='unknown'){feedback.textContent='Open Companion to sync pin status'}}catch{}}complete.addEventListener('click',async e=>{if(!e.isTrusted||complete.disabled)return;complete.disabled=true;try{const r=await chrome.runtime.sendMessage({type:'quest-pin-complete',quest:{source,name}});if(!r?.ok)throw Error(r?.error||'Could not queue completion');complete.textContent='✓ Completion queued';feedback.textContent='Manual completion queued · open Companion to sync.'}catch(err){feedback.textContent=String(err?.message||err);complete.disabled=false}});readPin();const timer=setInterval(readPin,10000);window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});add.addEventListener('click',async e=>{if(!e.isTrusted||add.disabled)return;add.disabled=true;try{const result=await chrome.runtime.sendMessage({type:'quest-pin-add',quest:{source,name}});if(!result?.ok)throw Error(result?.error||'Could not save');feedback.textContent='Pin queued · open Companion to sync.';add.textContent='✓ Pin queued';queued=true}catch(err){feedback.textContent=String(err?.message||err)}finally{add.disabled=false}})}
  });
 }
 const original=document.createElement('button');original.type='button';original.className='aqwc-original-toggle';original.textContent='Hide original Wiki content';original.setAttribute('aria-expanded','true');panel.append(original);original.addEventListener('click',e=>{if(!e.isTrusted)return;content.hidden=!content.hidden;original.textContent=content.hidden?'Show original Wiki content':'Hide original Wiki content';original.setAttribute('aria-expanded',String(!content.hidden))});
 if(choices.length>100){const n=document.createElement('small');n.textContent='Showing first 100 quests; see Wiki for the rest.';panel.append(n)}
}
function init(){
 if(location.origin!==origin||!/^\/[a-z0-9][a-z0-9-]*\/?$/.test(location.pathname))return;
 const content=document.getElementById('page-content'),title=document.getElementById('page-title'),crumb=document.getElementById('breadcrumbs')||document.querySelector('.breadcrumbs, #breadcrumb, .breadcrumb');
 const kind=pageKind(crumb);if(!content||!title||!kind||document.getElementById('aqwc-quest-shop'))return;
 const initial=kind==='shop'?collect(content,kind):null;if(initial&&!initial.groups.length&&!initial.skipped)return;
 let scopeRevision=0;
 const host=document.createElement('div');host.id='aqwc-quest-shop';host.style.cssText='margin:8px 0';const shadow=host.attachShadow({mode:'closed'});
 const panel=document.createElement('div');panel.style.cssText='display:inline-block;padding:8px 12px;border:1px solid #38566d;border-radius:8px;background:#142b3e;color:#e5f5ff;font:600 13px/1.5 system-ui';
 const label=document.createElement('strong');label.textContent=kind==='quest'?'Quest inventory check':'Shop inventory check';
 const note=document.createElement('small');note.style.cssText='display:block;color:#b6cddd;font-weight:400';note.textContent=kind==='quest'?'Select a quest to check its linked requirements and rewards. Stock is not proof of quest completion.':'Check linked shop costs against your synced stock. Purchase eligibility is not checked.';
 const b=document.createElement('button');b.type='button';b.textContent=kind==='quest'?'Check quest materials':'Show inventory status';b.style.cssText='margin-top:6px;padding:5px 9px;border:1px solid #67bcdf;border-radius:6px;background:#214e70;color:#e5f7ff;cursor:pointer';
 const status=document.createElement('small');status.setAttribute('role','status');status.style.cssText='display:block;color:#b6cddd;font-weight:400;margin-top:4px';
 const ui=globalThis.AQWCWikiUI;ui?.decorate(shadow,panel,kind==='quest'?'Quest tools':'Shop tools');if(ui)panel.style.cssText='';b.className='aqwc-primary';
 if(kind==='quest'){panel.classList.add('aqwc-quest-top');questCards(panel,content,title);shadow.append(panel);host.style.cssText='display:block;float:none;width:100%;max-width:100%;margin:8px 0 16px;';if(content.parentElement)content.parentElement.insertBefore(host,content);else (document.getElementById('aqwc-foundation-badge')||title).insertAdjacentElement('afterend',host);return}
 const summary=document.createElement('section');summary.className='aqwc-section';summary.hidden=true;
 panel.append(label,note);

 panel.append(b,status,summary);
 shadow.append(panel);if(ui)ui.mount(host,content,title);else (document.getElementById('aqwc-foundation-badge')||title).insertAdjacentElement('afterend',host);
 b.addEventListener('click',async e=>{
  if(!e.isTrusted||b.disabled)return;b.disabled=true;status.textContent='Checking…';summary.hidden=true;summary.replaceChildren();const revision=scopeRevision;
  try{
   const {groups,skipped}=initial;if(!groups.length)throw Error('No supported linked requirements detected.');
   const names=[...new Set(groups.flatMap(g=>g.items.map(x=>x.name)))],selected=names,matches=new Map();let syncedAt=null;
   for(let i=0;i<selected.length;i+=80){
    const chunk=selected.slice(i,i+80),r=await chrome.runtime.sendMessage({type:'wiki-material-lookup',names:chunk});
    if(revision!==scopeRevision)return;
    if(!r?.ok||!Array.isArray(r.matches)||r.matches.length!==chunk.length)throw Error('Inventory lookup unavailable');
    if(i&&r.syncedAt!==syncedAt)throw Error('Inventory changed during lookup; retry');
    syncedAt=r.syncedAt;chunk.forEach((name,j)=>matches.set(name,r.matches[j]));
    if(i+80<selected.length)await new Promise(resolve=>setTimeout(resolve,0));
   }
   if(revision!==scopeRevision)return;
   if(!syncedAt)throw Error('Inventory not synced; import in Companion first.');
   content.querySelectorAll('[data-aqwc-quest-shop-status]').forEach(x=>x.remove());
   for(const g of groups)for(const {item,text,color} of labels(g,matches)){
    if(!matches.has(item.name))continue;
    const badge=document.createElement('span');badge.setAttribute('data-aqwc-quest-shop-status','');const label=document.createElement('span');label.textContent=' ['+text+']';label.title='AQW Companion local snapshot; not proof of quest or shop eligibility';badge.attachShadow({mode:'closed'}).append(label);
    label.style.cssText='display:inline-block;margin-left:4px;padding:0 4px;border-radius:4px;background:#142b3e;color:'+color+';font:600 11px/1.5 system-ui';item.anchor.insertAdjacentElement('afterend',badge);
   }

   status.textContent='Snapshot: '+new Date(syncedAt).toLocaleString()+' · '+selected.length+' names checked'+(skipped?' · '+skipped+' unsupported rows/price cells skipped':'');b.textContent=kind==='quest'?'Refresh quest materials':'Refresh inventory status';
  }catch(err){status.textContent=String(err?.message||err)}
  finally{b.disabled=false}
 });
}
globalThis.AQWCQuestShop=Object.freeze({pageKind,quantity,questQuantity,linkedRow,shopCosts,collect,labels,questScope,questLists,questLocationLinks});
if(typeof document!=='undefined')init();
})();
