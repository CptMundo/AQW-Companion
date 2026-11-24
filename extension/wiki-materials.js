/* Direct merge requirements only. No recursive recipes or network requests. */
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
 function render(card,content,origin){
  const {groups,incomplete}=parse(content,origin);
  if(!groups.length&&!incomplete)return;
  const panel=document.createElement('section');panel.style.cssText='margin-top:12px;padding-top:10px;border-top:1px solid #38566d;min-width: min(300px, 100%);';
  const heading=document.createElement('strong');heading.textContent='Required Materials';panel.append(heading);card.append(panel);
  const addNote=text=>{const n=document.createElement('div');n.textContent=text;n.style.cssText='font-size:11px;color:#b6cddd;margin:5px 0;font-weight:400';panel.append(n)};
  addNote('Direct merge ingredients · synced Inventory + Bank. Does not check shop access or prerequisites.');
  if(incomplete)addNote('Some recipe rows could not be read; check the original Wiki requirements.');
  if(!groups.length)return;
  const names=[...new Set(groups.flat().map(x=>x.name))];
  const rows=[];
  groups.forEach((group,i)=>{
   if(groups.length>1){const label=document.createElement('div');label.textContent='Merge option '+(i+1)+' (separate recipe)';label.style.cssText='margin-top:10px;color:#a9ddff';panel.append(label)}
   for(const material of group){
    const row=document.createElement('div');row.style.cssText='margin-top:8px';
    const top=document.createElement('div');top.style.cssText='display:flex;align-items:baseline;justify-content:space-between;gap:12px';
    const link=document.createElement('a');link.href=origin+'/'+material.slug;link.textContent=material.name;link.style.cssText='color:#a9ddff;text-decoration:underline;overflow-wrap:anywhere';
    const status=document.createElement('span');status.textContent='… / '+material.target.toLocaleString();status.style.whiteSpace='nowrap';top.append(link,status);
    const track=document.createElement('div'),fill=document.createElement('div');track.style.cssText='height:5px;border-radius:4px;background:#091622;overflow:hidden;margin-top:4px';fill.style.cssText='height:100%;width:0%;background:#58bce8';track.append(fill);row.append(top,track);panel.append(row);rows.push({material,status,fill});
   }
  });
  const unavailable=()=>{for(const {status,material} of rows){status.textContent='? / '+material.target.toLocaleString();status.style.color='#ffdb93'}addNote('Inventory unavailable. Sync in Companion and refresh this page.')};
  try{chrome.runtime.sendMessage({type:'wiki-material-lookup',names},result=>{
   if(chrome.runtime.lastError||!result?.ok||!Array.isArray(result.matches)||result.matches.length!==names.length){unavailable();return}
   const matches=new Map(names.map((name,i)=>[name,result.matches[i]]));
   for(const {material,status,fill} of rows){
    const m=matches.get(material.name),target=material.target;
    if(!m||!['owned','not-found'].includes(m.state)){status.textContent='? / '+target.toLocaleString();status.style.color='#ffdb93';status.title=m?.state==='ambiguous'?'Ambiguous item variant; check Companion':'Inventory not synced';continue}
    const count=m.state==='owned'?m.total:0,done=count>=target;
    status.textContent=(done?'✓ ':count?'◐ ':'✕ ')+count.toLocaleString()+' / '+target.toLocaleString();
    status.style.color=done?'#90edb5':count?'#ffdb93':'#ffc2a8';fill.style.width=Math.min(100,count/target*100)+'%';fill.style.background=done?'#57ca91':count?'#e9b958':'#e58b7c';
    status.title='Inventory: '+(m.inventory||0)+' · Bank: '+(m.bank||0);
   }
   if(result.syncedAt)addNote('Inventory synced: '+new Date(result.syncedAt).toLocaleString());
   else addNote('No inventory synced yet.');
  })}catch{unavailable()}
 }
 globalThis.AQWCWikiMaterials=Object.freeze({parse,parseRow,render});
})();
