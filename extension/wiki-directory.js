/* Progressive directory styling: original links, badges, filters and anchors remain in the DOM. */
(()=>{
'use strict';
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const indexes=new Set('quests monsters locations shops factions npcs armors capes-back-items classes enhancements helmets-hoods houses floor-items wall-items misc-items use-items necklaces grounds pets battle-pets axes bows daggers gauntlets guns handguns maces polearms rifles staffs swords wands whips'.split(' '));
function indexKind(path){const s=String(path||'').replace(/^\/|\/$/g,'');if(['items','weapons','housing'].includes(s))return 'categories';return indexes.has(s)||(/^sort-by-[a-z0-9-]+$/.test(s)&&[...indexes].some(x=>s.endsWith('-'+x)))?'alphabetic':null}
function rowName(el,origin){
 if(!['P','LI','DIV'].includes(el.tagName)||el.querySelector('ul,ol,table,form,input,button,h1,h2,h3,h4,h5,h6,div,p,li,a[name]:not([href]),a[id]:not([href])')||el.id)return null;
 const links=[...el.querySelectorAll('a[href]')].filter(a=>!a.querySelector('img')&&clean(a.textContent));
 if(links.length!==1)return null;const a=links[0],name=clean(a.textContent);
 if(!name||/^(?:back to top|sort by|[a-z]|#|next|previous)$/i.test(name))return null;
 try{const u=new URL(a.getAttribute('href'),origin);if(u.origin!==origin||u.hash||u.search||!/^\/[a-z0-9][a-z0-9-]{0,199}\/?$/.test(u.pathname)||indexKind(u.pathname))return null}catch{return null}
 // Do not reshape prose, notes or filter rows.
 const whole=clean(el.textContent);if(whole!==name&&(!whole.startsWith(name)||!/^(?:(?:AC|Legend|Rare|Seasonal|Pseudo-Rare|Special Offer|Free Player)\s*)+$/i.test(whole.slice(name.length).trim())))return null;
 return name;
}
function runs(parent,origin){const out=[];let run=[];for(const node of parent.children){const name=rowName(node,origin);if(name)run.push({node,name});else{if(run.length>=2)out.push(run);run=[]}}if(run.length>=2)out.push(run);return out}
function entry(a,origin){
 const name=clean(a.textContent);if(!name||name.length>300||/^(?:back to top|sort by|[a-z]|#|next|previous)$/i.test(name)||a.querySelector('img')||a.closest('#breadcrumbs,.breadcrumbs,.breadcrumb,.pager,.pagination,.page-tags,form,table'))return null;
 try{const u=new URL(a.getAttribute('href'),origin);if(u.origin!==origin||u.search||u.hash||!/^\/[a-z0-9][a-z0-9-]{0,199}\/?$/.test(u.pathname)||indexKind(u.pathname)||/\/(?:start|world|key|glossary|list-of-all-tags|search-items-by-tag)$/.test(u.pathname))return null;return {name,url:u.href,anchor:a}}catch{return null}
}
function directoryEntries(content,origin){
 const links=[...content.querySelectorAll('a[href]')];
 // Recognize the Wiki's alphabetical jump strip, even if it is a paragraph with BR-separated rows.
 const jump=links.filter(a=>{if(!/^[A-Z#0-9]$/i.test(clean(a.textContent)))return false;try{const href=a.getAttribute('href')||'',u=new URL(href,origin);return !!u.hash&&u.origin===origin&&(href.startsWith('#')||!!indexKind(u.pathname))}catch{return false}});
 const last=jump.length>=5?links.lastIndexOf(jump[jump.length-1]):-1;
 const seen=new Set(),out=[];
 for(const a of links.slice(last+1)){
  if(last<0&&!a.closest('.list-pages-box,.list-pages-item')&&!rowName(a.closest('p,li,div')||a,origin))continue;
  if(a.closest('#breadcrumbs,.breadcrumbs,.breadcrumb,.pager,.pagination'))continue;
  const item=entry(a,origin);if(!item||seen.has(item.url+'\n'+item.name))continue;seen.add(item.url+'\n'+item.name);out.push(item);
 }
 return out;
}
function badgeNodes(a){
 const out=[];let n=a.nextSibling;
 for(let i=0;n&&i<10;i++,n=n.nextSibling){
  if(n.nodeName==='BR'||n.nodeName==='A'||n.nodeName==='P'||n.nodeName==='DIV'||n.nodeName==='LI')break;
  const label=clean(n.textContent);if(n.nodeType===3&&!label)continue;
  if(n.nodeType===1&&(n.tagName==='IMG'||n.querySelector('img'))){
   for(const img of n.tagName==='IMG'?[n]:n.querySelectorAll('img')){
    const src=img.getAttribute('src')||'',alt=img.getAttribute('alt')||'';if(!/(?:ac|legend|rare|seasonal|special|pseudo|member|free)(?:small|large)|(?:^|\b)(?:AC|Legend|Rare|Seasonal|Pseudo-Rare|Special Offer)(?:\b|$)/i.test(src+' '+alt))continue;
    const copy=document.createElement('img');copy.src=img.src;copy.alt=alt;copy.className='aqwc-index-badge';out.push(copy);
   }
  }else if(/^(?:(?:AC|Legend|Rare|Seasonal|Pseudo-Rare|Special Offer|Free Player)\s*)+$/i.test(label)){
   const b=document.createElement('span');b.className='aqwc-index-textbadge';b.textContent=label;out.push(b);
  }else if(label)break;
 }
 return out;
}
function letter(name){const c=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').charAt(0).toUpperCase();return /^[A-Z]$/.test(c)?c:'#'}
function mapSectionName(value){const name=clean(value).replace(/:\s*$/,'').toLowerCase();return ({monsters:'Monsters',npcs:'NPCs',quests:'Quests',shops:'Shops','access points':'Access Points'})[name]||null}
function mapSections(content){
 const result=[];for(const list of content.children){
  if(!['UL','OL'].includes(list.tagName))continue;
  const heading=list.previousElementSibling;if(!heading||!['P','H2','H3','H4','H5','DIV'].includes(heading.tagName))continue;
  const name=mapSectionName(heading.textContent);if(!name||heading.querySelector('ul,ol,table,form'))continue;
  result.push({name,heading,list});
 }return result;
}
function styleMap(content){
 const crumb=document.querySelector('#breadcrumbs,.breadcrumbs,#breadcrumb,.breadcrumb');
 if(!crumb||![...crumb.querySelectorAll('a[href]')].some(a=>{try{return new URL(a.getAttribute('href'),location.origin).pathname.replace(/\/$/,'')==='/locations'}catch{return false}}))return false;
 const sections=mapSections(content);if(!sections.length)return false;
 const main=sections.filter(x=>x.name!=='Access Points');
 // Move only consecutive native heading/list pairs, never remove original links or gallery markup.
 if(main.length){const groups=[];let run=[];for(const x of main){if(run.length&&run[run.length-1].list.nextElementSibling!==x.heading){groups.push(run);run=[]}run.push(x)}if(run.length)groups.push(run);for(const group of groups){const grid=document.createElement('div');grid.className='aqwc-map-grid';content.insertBefore(grid,group[0].heading);for(const x of group){const card=document.createElement('section');card.className='aqwc-map-card';card.append(x.heading,x.list);grid.append(card)}}}
 for(const x of sections.filter(x=>x.name==='Access Points')){const card=document.createElement('section');card.className='aqwc-map-card aqwc-map-access';content.insertBefore(card,x.heading);card.append(x.heading,x.list)}
 const match=clean(content.textContent).match(/\bMap Name:\s*([a-z0-9-]+)\b/i);
 if(match){const command='/join '+match[1];const row=document.createElement('div');row.className='aqwc-map-command';const label=document.createElement('span');label.textContent='Map · '+match[1];const btn=document.createElement('button');btn.type='button';btn.textContent=command+' · Copy';btn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(command);btn.textContent='Copied '+command;setTimeout(()=>{btn.textContent=command+' · Copy'},1200)}catch{btn.textContent=command}});row.append(label,btn);content.prepend(row)}
 content.classList.add('aqwc-map-profile');document.getElementById('main-content')?.classList.add('aqwc-directory-aligned');return true;
}
function init(){
 if(location.origin!=='https://aqwwiki.wikidot.com')return;const kind=indexKind(location.pathname),content=document.getElementById('page-content');if(!content||document.getElementById('aqwc-directory-v2'))return;
 if(!kind){if(!styleMap(content))styleMonster(content);return}
 if(kind==='categories'){
  const list=[...content.children].find(el=>el.tagName==='UL'&&el.children.length>=3);if(!list)return;content.classList.add('aqwc-directory','aqwc-category-index');list.classList.add('aqwc-category-grid');document.getElementById('main-content')?.classList.add('aqwc-directory-aligned');for(const li of list.children){const sub=li.querySelector('ul'),a=li.querySelector('a');if(!sub)li.classList.add('aqwc-category-leaf');if(sub&&sub.children.length>=6)li.classList.add('aqwc-category-wide');if(a){a.classList.add('aqwc-category-title');const glyph=document.createElement('span');glyph.className='aqwc-category-glyph';glyph.setAttribute('aria-hidden','true');glyph.textContent=({'armors':'♜','classes':'✦','weapons':'⚔','helmets-hoods':'◈','pets':'✧','housing':'⌂','enhancements':'◇'})[(a.getAttribute('href')||'').replace(/^\//,'')]||'◆';a.prepend(glyph)}}return;
 }
 const rows=directoryEntries(content,location.origin);if(rows.length<2)return;
 const host=document.createElement('section');host.id='aqwc-directory-v2';host.style.display='none';host.setAttribute('aria-label','Wiki directory');
 const toolbar=document.createElement('div');toolbar.className='aqwc-index-toolbar';const search=document.createElement('input');search.type='search';search.placeholder='Search '+(document.getElementById('page-title')?.textContent.trim()||'directory')+'…';search.setAttribute('aria-label','Search directory');const status=document.createElement('span');status.setAttribute('role','status');
 const original=document.createElement('button');original.type='button';original.textContent='Show original Wiki list';original.setAttribute('aria-expanded','false');original.addEventListener('click',()=>{const open=content.classList.toggle('aqwc-index-original-open');original.textContent=open?'Hide original Wiki list':'Show original Wiki list';original.setAttribute('aria-expanded',String(open))});
 toolbar.append(search,status,original);
 const filters=document.createElement('div');filters.className='aqwc-index-filters';const nativeCrumb=content.querySelector('#breadcrumbs,.breadcrumbs,#breadcrumb,.breadcrumb');if(nativeCrumb){const trail=document.createElement('div');trail.className='aqwc-index-trail';for(const a of nativeCrumb.querySelectorAll('a[href]')){const link=document.createElement('a');link.href=a.href;link.textContent=clean(a.textContent);trail.append(link,document.createTextNode(' › '))}trail.append(document.createTextNode(document.getElementById('page-title')?.textContent.trim()||''));host.append(trail)}
 for(const a of content.querySelectorAll('a[href]')){const href=a.getAttribute('href')||'';if(!/^(?:\/|https:\/\/aqwwiki\.wikidot\.com\/)sort-by-[a-z0-9-]+\/?$/.test(href)||!clean(a.textContent))continue;const link=document.createElement('a');link.href=a.href;link.textContent=clean(a.textContent);filters.append(link)}
 const alphabet=document.createElement('div');alphabet.className='aqwc-index-alphabet';const body=document.createElement('div');const groups=new Map();for(const row of rows){const l=letter(row.name);if(!groups.has(l))groups.set(l,[]);groups.get(l).push(row)}
 let active='All',page=1;const perPage=96;
 const nav=document.createElement('div');nav.className='aqwc-index-pager';const prev=document.createElement('button'),next=document.createElement('button'),pageLabel=document.createElement('span');prev.textContent='← Previous';next.textContent='Next →';prev.type=next.type='button';nav.append(prev,pageLabel,next);
 const keys=['All',...['#',...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(l=>groups.has(l))];
 for(const l of keys){const b=document.createElement('button');b.type='button';b.textContent=l;b.dataset.letter=l;b.addEventListener('click',()=>{active=l;page=1;render()});alphabet.append(b)}
 function render(){
  const q=clean(search.value).toLowerCase(),filtered=rows.filter(r=>(active==='All'||letter(r.name)===active)&&r.name.toLowerCase().includes(q));
  const pages=Math.max(1,Math.ceil(filtered.length/perPage));page=Math.min(page,pages);status.textContent=filtered.length.toLocaleString()+' / '+rows.length.toLocaleString()+' entries';for(const b of alphabet.children)b.setAttribute('aria-pressed',String(b.dataset.letter===active));
  body.replaceChildren();const visible=filtered.slice((page-1)*perPage,page*perPage);const sectionGroups=new Map();for(const r of visible){const l=letter(r.name);if(!sectionGroups.has(l))sectionGroups.set(l,[]);sectionGroups.get(l).push(r)}
  for(const [l,group] of sectionGroups){const section=document.createElement('section');section.className='aqwc-index-section';const title=document.createElement('h3');title.textContent=l;const grid=document.createElement('div');grid.className='aqwc-index-grid';for(const r of group){const a=document.createElement('a');a.className='aqwc-index-entry';a.href=r.url;const name=document.createElement('span');name.textContent=r.name;const badges=document.createElement('span');badges.className='aqwc-index-badges';badges.append(...badgeNodes(r.anchor));a.append(name,badges);grid.append(a)}section.append(title,grid);body.append(section)}
  if(!visible.length){const p=document.createElement('p');p.textContent='No matching entries.';body.append(p)}
  prev.disabled=page===1;next.disabled=page===pages;pageLabel.textContent='Page '+page+' / '+pages;nav.hidden=pages===1;
 }
 search.addEventListener('input',()=>{page=1;render()});prev.addEventListener('click',()=>{page--;render();toolbar.scrollIntoView({block:'nearest'})});next.addEventListener('click',()=>{page++;render();toolbar.scrollIntoView({block:'nearest'})});
 host.append(toolbar,filters,alphabet,body,nav);content.before(host);content.classList.add('aqwc-index-source');render();document.getElementById('main-content')?.classList.add('aqwc-directory-aligned');document.getElementById('aqwc-list-wishlist')?.remove();
}
function styleMonster(content){
 const api=globalThis.AQWCWikiMaterials,slug=location.pathname.replace(/^\/|\/$/g,'');if(!api?.monsterImages||!slug)return;
 const images=api.monsterImages(document,location.origin,slug);if(!images.length)return;
 // Keep tabs, credits, and original data in place; only relocate a verified standalone illustration.
 const imgs=[...content.querySelectorAll('img[src]')];const img=imgs.find(i=>images.includes(i.src.replace(/^http:/,'https:')));if(!img)return;
 let node=img;while(node.parentElement&&node.parentElement!==content){const p=node.parentElement;if(!['A','P','SPAN','DIV','CENTER'].includes(p.tagName)||p.querySelectorAll('img').length!==1||clean(p.textContent)||p.querySelector('button,input,ul,ol,table'))break;node=p}
 content.classList.add('aqwc-monster-profile');if(node.parentElement!==content)return;
 const wrap=document.createElement('section');wrap.className='aqwc-monster-art';const heading=document.createElement('h3');heading.textContent='Monster artwork';const next=node.nextElementSibling;wrap.append(heading,node);if(next&&/^Thanks to\b/i.test(clean(next.textContent)))wrap.append(next);content.prepend(wrap);
}
globalThis.AQWCDirectory=Object.freeze({indexKind,rowName,runs,entry,directoryEntries,letter,mapSectionName,mapSections});
if(typeof document!=='undefined'){try{init()}finally{globalThis.AQWCWikiBoot?.layoutReady()}}
})();
