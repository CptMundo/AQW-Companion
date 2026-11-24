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
function init(){
 if(location.origin!==origin||!/^\/[a-z0-9][a-z0-9-]*\/?$/.test(location.pathname))return;
 const content=document.getElementById('page-content'),title=document.getElementById('page-title'),crumb=document.getElementById('breadcrumbs')||document.querySelector('.breadcrumbs, #breadcrumb, .breadcrumb');
 const kind=pageKind(crumb);if(!content||!title||!kind||document.getElementById('aqwc-quest-shop'))return;
 const {groups,skipped}=collect(content,kind);if(!groups.length&&!skipped&&kind!=='quest')return;
 const host=document.createElement('div');host.id='aqwc-quest-shop';host.style.cssText='margin:8px 0';const shadow=host.attachShadow({mode:'closed'});
 const panel=document.createElement('div');panel.style.cssText='display:inline-block;padding:8px 12px;border:1px solid #38566d;border-radius:8px;background:#142b3e;color:#e5f5ff;font:600 13px/1.5 system-ui';
 const label=document.createElement('strong');label.textContent=kind==='quest'?'Quest inventory check':'Shop inventory check';
 const note=document.createElement('small');note.style.cssText='display:block;color:#b6cddd;font-weight:400';note.textContent='Synced Inventory + Bank only. No quest completion, temporary counters, access requirements, currency or purchase eligibility checked.';
 const b=document.createElement('button');b.type='button';b.textContent='Show inventory status';b.style.cssText='margin-top:6px;padding:5px 9px;border:1px solid #67bcdf;border-radius:6px;background:#214e70;color:#e5f7ff;cursor:pointer';
 const status=document.createElement('small');status.setAttribute('role','status');status.style.cssText='display:block;color:#b6cddd;font-weight:400;margin-top:4px';
 const ui=globalThis.AQWCWikiUI;ui?.decorate(shadow,panel,kind==='quest'?'Quest tools':'Shop tools');if(ui)panel.style.cssText='';b.className='aqwc-primary';
 panel.append(label,note,b,status);
 if(kind==='quest'){
  const link=document.createElement('a');link.href='https://cptmundo.github.io/AQW-Companion/#aqwc-routines?source='+encodeURIComponent(location.pathname.replace(/^\/|\/$/g,''));
  link.target='_blank';link.rel='noopener noreferrer';link.textContent='View daily / weekly quests in Companion ↗';link.style.cssText='display:block;margin-top:6px;color:#a9ddff;font:600 12px system-ui';panel.append(link);
  const select=document.createElement('select');select.setAttribute('aria-label','Select quest');select.style.cssText='display:block;max-width:100%;margin-top:6px;background:#19334a;color:#e5f5ff';
  const tabs=[...content.querySelectorAll('.yui-nav li a,[role="tab"],.yui-navset .yui-nav a')].filter(a=>a.getClientRects().length);
  const names=[...new Set(tabs.map(a=>clean(a.textContent)).filter(n=>n&&n.length<=350))];
  for(const name of names){const opt=document.createElement('option');opt.value=name;opt.textContent=name;select.append(opt)}
  const add=document.createElement('button');add.type='button';add.textContent='+ Add quest to Tracker';add.style.cssText=b.style.cssText;add.disabled=!names.length;
  const feedback=document.createElement('small');feedback.style.cssText='display:block;color:#b6cddd';
  function current(){const active=tabs.find(a=>a.getAttribute('aria-selected')==='true'||a.closest('li.selected,li.active'));if(active&&names.includes(clean(active.textContent)))select.value=clean(active.textContent)}
  current();content.addEventListener('click',e=>{if(e.target.closest('.yui-nav a,[role="tab"]'))setTimeout(current,0)});
  add.addEventListener('click',async e=>{if(!e.isTrusted||!select.value||add.disabled)return;add.disabled=true;try{const r=await chrome.runtime.sendMessage({type:'routine-queue-add',quest:{source:location.pathname.replace(/^\/|\/$/g,''),name:select.value}});if(!r?.ok)throw Error(r?.error||'Could not save');feedback.textContent='✓ Saved locally: '+select.value+'. Companion will pin it if the recurring quest matches its library.'}catch(err){feedback.textContent=String(err?.message||err)}finally{add.disabled=false}});
  if(names.length)panel.append(select,add,feedback);else{feedback.textContent='No quest tabs detected. Use the library link above.';panel.append(feedback)}
  if(!groups.length){b.disabled=true;status.textContent='No supported linked inventory requirements detected.'}
 }
 shadow.append(panel);if(ui)ui.mount(host,content,title);else (document.getElementById('aqwc-foundation-badge')||title).insertAdjacentElement('afterend',host);
 b.addEventListener('click',async e=>{
  if(!e.isTrusted||b.disabled)return;b.disabled=true;status.textContent='Checking…';
  try{
   const names=[...new Set(groups.flatMap(g=>g.items.map(x=>x.name)))],selected=names,matches=new Map();let syncedAt=null;
   for(let i=0;i<selected.length;i+=80){
    const chunk=selected.slice(i,i+80),r=await chrome.runtime.sendMessage({type:'wiki-material-lookup',names:chunk});
    if(!r?.ok||!Array.isArray(r.matches)||r.matches.length!==chunk.length)throw Error('Inventory lookup unavailable');
    if(i&&r.syncedAt!==syncedAt)throw Error('Inventory changed during lookup; retry');
    syncedAt=r.syncedAt;chunk.forEach((name,j)=>matches.set(name,r.matches[j]));
    if(i+80<selected.length)await new Promise(resolve=>setTimeout(resolve,0));
   }
   if(!syncedAt)throw Error('Inventory not synced; import in Companion first.');
   content.querySelectorAll('[data-aqwc-quest-shop-status]').forEach(x=>x.remove());
   for(const g of groups)for(const {item,text,color} of labels(g,matches)){
    if(!matches.has(item.name))continue;
    const badge=document.createElement('span');badge.setAttribute('data-aqwc-quest-shop-status','');const label=document.createElement('span');label.textContent=' ['+text+']';label.title='AQW Companion local snapshot; not proof of quest or shop eligibility';badge.attachShadow({mode:'closed'}).append(label);
    label.style.cssText='display:inline-block;margin-left:4px;padding:0 4px;border-radius:4px;background:#142b3e;color:'+color+';font:600 11px/1.5 system-ui';item.anchor.insertAdjacentElement('afterend',badge);
   }
   status.textContent='Snapshot: '+new Date(syncedAt).toLocaleString()+' · '+selected.length+' names checked'+(skipped?' · '+skipped+' unsupported rows/price cells skipped':'');b.textContent='Refresh inventory status';
  }catch(err){status.textContent=String(err?.message||err)}
  finally{b.disabled=false}
 });
}
globalThis.AQWCQuestShop=Object.freeze({pageKind,quantity,questQuantity,linkedRow,shopCosts,collect,labels});
if(typeof document!=='undefined')init();
})();
