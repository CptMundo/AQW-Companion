(() => {
 'use strict';
 if(location.origin!=='https://aqwwiki.wikidot.com'||!/^\/[a-z0-9][a-z0-9-]*\/?$/.test(location.pathname))return;
 const title=document.getElementById('page-title'),content=document.getElementById('page-content'),crumb=document.getElementById('breadcrumbs');
 if(!title||!content||!crumb||/\busually refers to\s*:/i.test(content.textContent||''))return;
 const links=Array.from(crumb.querySelectorAll('a[href]')).map(a=>{try{const u=new URL(a.href,location.href);return u.origin===location.origin?u.pathname.replace(/^\/|\/$/g,''):''}catch{return ''}});
 const start=links.indexOf('items');if(start<0)return;
 const category=links.slice(start+1).at(-1);
 const name=title.textContent.trim();if(!name||name.length>350||!category)return;
 // Category indexes may also have an Items breadcrumb. Require item-detail evidence.
 if(!/\bSellback\s*:/i.test(content.textContent||''))return;
 if(document.getElementById('aqwc-item-status'))return;
 const host=document.createElement('div');host.id='aqwc-item-status';
 host.style.cssText='display:block;margin:8px 0;max-width:100%';
 const shadow=host.attachShadow({mode:'closed'});
 const card=document.createElement('div');card.style.cssText='display:inline-block;max-width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid #38566d;border-radius:8px;background:#142b3e;color:#e5f5ff;font:600 13px/1.5 system-ui,sans-serif;';
 const line=document.createElement('div'),note=document.createElement('small');note.style.cssText='display:block;color:#b6cddd;font-weight:400;margin-top:3px';
 card.append(line,note);shadow.append(card);
 const show=(text,detail,color)=>{line.textContent=text;line.style.color=color;note.textContent=detail};
 chrome.runtime.sendMessage({type:'wiki-item-lookup',query:{name,category}},result=>{
  if(chrome.runtime.lastError||!result?.ok)return;
  if(result.state==='unsupported')return;
  const date=result.syncedAt?new Date(result.syncedAt).toLocaleString():'';
  const source=result.exportedAt?new Date(result.exportedAt).toLocaleDateString():'';
  const freshness=[source&&'Export: '+source,date&&'Synced: '+date].filter(Boolean).join(' · ');
  if(result.state==='owned'){
   const counts=[];if(result.inventory)counts.push('Inventory ×'+result.inventory.toLocaleString());if(result.bank)counts.push('Bank ×'+result.bank.toLocaleString());
   show('✓ Owned · '+result.total.toLocaleString()+' · '+counts.join(' / '),[result.basis,freshness].filter(Boolean).join(' · '),'#90edb5');
  }else if(result.state==='not-found')show('Not found in synced inventory',freshness,'#ffc2a8');
  else if(result.state==='ambiguous')show('Possible match · check variant in Companion',freshness,'#ffdb93');
  else if(result.state==='unsynced')show('Inventory not synced','Open AQW Companion and select Sync inventory to extension.','#b6dfff');
  else return;
  const badge=document.getElementById('aqwc-foundation-badge');(badge||title).insertAdjacentElement('afterend',host);
 });
})();
