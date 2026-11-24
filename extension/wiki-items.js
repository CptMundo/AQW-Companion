(() => {
 'use strict';
 if(location.origin!=='https://aqwwiki.wikidot.com'||!/^\/[a-z0-9][a-z0-9-]*\/?$/.test(location.pathname))return;
 const title=document.getElementById('page-title'),content=document.getElementById('page-content');
 if(!title||!content||document.getElementById('aqwc-item-status'))return;
 const body=String(content.innerText||content.textContent||'');
 if(/\busually refers to\s*:/i.test(body)||!/\bSellback\s*:/i.test(body)||!/\bDescription\s*:/i.test(body))return;
 const name=String(title.innerText||title.textContent||'').trim();if(!name||name.length>350)return;
 const crumb=document.getElementById('breadcrumbs')||document.querySelector?.('.breadcrumbs, #breadcrumb, .breadcrumb');
 const labelKey=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const aliases={'misc items':'misc-items','capes back items':'capes-back-items','helmets hoods':'helmets-hoods','battle pets':'battle-pets','floor items':'floor-items','wall items':'wall-items','use items':'use-items','hand guns':'handguns'};
 const supported=new Set(['swords','axes','bows','daggers','gauntlets','guns','handguns','maces','polearms','rifles','staffs','wands','weapons','classes','armors','capes-back-items','capes','helmets-hoods','helmets','pets','battle-pets','misc-items','use-items','grounds','necklaces','houses','floor-items','wall-items','housing','enhancements']);
 const categoryOf=(slug,label)=>[slug,aliases[labelKey(label)],labelKey(label).replace(/ /g,'-')].find(x=>supported.has(x));
 const links=Array.from(crumb?.querySelectorAll('a[href]')||[]).map(a=>{
  try{const u=new URL(a.href,location.href);return {slug:u.origin===location.origin?u.pathname.replace(/^\/|\/$/g,''):'',label:a.textContent||''}}catch{return {slug:'',label:''}}
 }).filter(x=>x.slug);
 const start=links.findIndex(x=>x.slug==='items'||labelKey(x.label)==='items');
 // Never fall back on an explicitly non-item breadcrumb such as Shops.
 if(links.length&&start<0)return;
 let category=start>=0?links.slice(start+1).map(x=>categoryOf(x.slug,x.label)).filter(Boolean).at(-1):null;
 // Some Wiki themes/variants lack the standard breadcrumb selector. Require both
 // item-detail fields above, then use an explicit Type field or specific item tag.
 if(!category){
  const types={item:'misc-items','use item':'use-items',class:'classes',armor:'armors',cape:'capes',helm:'helmets',pet:'pets',sword:'swords',axe:'axes',bow:'bows',dagger:'daggers',staff:'staffs',mace:'maces',gun:'guns',polearm:'polearms',wand:'wands',gauntlet:'gauntlets',rifle:'rifles',handgun:'handguns',weapon:'weapons',misc:'misc-items',ground:'grounds',necklace:'necklaces'};
  const match=body.match(/\bType\s*:\s*([a-z ]+?)(?=\s*(?:\n|;|Description\s*:|Rarity\s*:|Notes\s*:|$))/i);
  if(match)category=types[labelKey(match[1])];
  if(!category){
   const tags=Array.from(document.querySelectorAll?.('.page-tags a, #page-tags a')||[]).map(a=>labelKey(a.textContent));
   const candidates=[...new Set(tags.map(x=>types[x]).filter(Boolean))];
   if(candidates.length===1)category=candidates[0];
  }
  if(!category&&/\bBase Damage\s*:/i.test(body)&&/\(Sword\)$/i.test(name))category='swords';
 }
 const host=document.createElement('div');host.id='aqwc-item-status';
 host.style.cssText='display:block;margin:8px 0;max-width:100%';
 const shadow=host.attachShadow({mode:'closed'});
 const card=document.createElement('div');card.style.cssText='display:inline-block;max-width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid #38566d;border-radius:8px;background:#142b3e;color:#e5f5ff;font:600 13px/1.5 system-ui,sans-serif;';
 const line=document.createElement('div'),note=document.createElement('small');note.style.cssText='display:block;color:#b6cddd;font-weight:400;margin-top:3px';
 card.append(line,note);shadow.append(card);
 const show=(text,detail,color)=>{line.textContent=text;line.style.color=color;note.textContent=detail};
 const badge=document.getElementById('aqwc-foundation-badge');(badge||title).insertAdjacentElement('afterend',host);
 if(!category){show('Item type not recognized','AQW Companion could not identify this Wiki category.','#ffdb93');return}
 show('Checking synced inventory…','','#b6dfff');
 const failed=()=>show('Inventory lookup unavailable','Reload AQW Companion extension and refresh this Wiki page. Check the extension popup.','#ffc2a8');
 try{chrome.runtime.sendMessage({type:'wiki-item-lookup',query:{name,category}},result=>{
  if(chrome.runtime.lastError||!result?.ok){failed();return}
  if(result.state==='unsupported'){show('Item type not recognized','This item category is not yet supported.','#ffdb93');return}
  const date=result.syncedAt?new Date(result.syncedAt).toLocaleString():'';
  const source=result.exportedAt?new Date(result.exportedAt).toLocaleDateString():'';
  const freshness=[source&&'Export: '+source,date&&'Synced: '+date].filter(Boolean).join(' · ');
  if(result.state==='owned'){
   const counts=[];if(result.inventory)counts.push('Inventory ×'+result.inventory.toLocaleString());if(result.bank)counts.push('Bank ×'+result.bank.toLocaleString());
   show('✓ Owned · '+result.total.toLocaleString()+' · '+counts.join(' / '),[result.basis,freshness].filter(Boolean).join(' · '),'#90edb5');
  }else if(result.state==='not-found')show('Not found in synced inventory',freshness,'#ffc2a8');
  else if(result.state==='ambiguous')show('Possible match · check variant in Companion',freshness,'#ffdb93');
  else if(result.state==='unsynced')show('Inventory not synced','Open AQW Companion and select Sync inventory to extension.','#b6dfff');
  else failed();
 });}catch{failed()}
})();
