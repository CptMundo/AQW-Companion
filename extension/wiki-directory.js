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
function tagLabels(value){
 const labels=[];const re=/\b(?:pseudo[\s-]*rare|special[\s-]*offer|non[\s-]*ac|0\s*ac|adventurecoin|seasonal|legend|rare|free[\s-]*player|ac)\b/gi;
 for(const m of String(value||'').matchAll(re)){const k=m[0].toLowerCase().replace(/[\s-]/g,'');const label=({pseudorare:'Pseudo-Rare',specialoffer:'Special Offer',nonac:'Non-AC','0ac':'0 AC',adventurecoin:'AC',seasonal:'Seasonal',legend:'Legend',rare:'Rare',freeplayer:'Free Player',ac:'AC'})[k];if(label&&!labels.includes(label))labels.push(label)}return labels;
}
function nameTags(name){const labels=[];for(const m of name.matchAll(/\((0\s*AC|AC|Non-AC|Legend|Seasonal|Rare|Pseudo-Rare|Special Offer|Free Player)\)/gi))for(const label of tagLabels(m[1]))if(!labels.includes(label))labels.push(label);return labels}
function coloredBadges(a){
 const labels=new Set(nameTags(clean(a.textContent)));
 for(const n of badgeNodes(a)){const src=n.getAttribute('src')||'',alt=n.getAttribute('alt')||'';for(const label of tagLabels(alt||n.textContent))labels.add(label);
  const key=src.split('/').pop().replace(/\.(png|gif|jpe?g|webp).*$/i,'').replace(/(?:small|large)$/i,'');for(const label of tagLabels(key.replace(/_/g,' ')))labels.add(label);
 }
 return [...labels].map(label=>{const b=document.createElement('span');b.className='aqwc-tag';b.dataset.kind=label.toLowerCase().replace(/[^a-z0-9]+/g,'-');b.textContent=label;return b});
}
function letter(name){const c=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').charAt(0).toUpperCase();return /^[A-Z]$/.test(c)?c:'#'}
function mapSectionName(value){const name=clean(value).replace(/:\s*$/,'').toLowerCase();return ({monsters:'Monsters',npcs:'NPCs',quests:'Quests',shops:'Shops','access points':'Access Points'})[name]||null}
function mapSections(content){
 const result=[];for(const list of content.children){
  if(!['UL','OL'].includes(list.tagName))continue;
  const heading=list.previousElementSibling;if(!heading||!['P','H2','H3','H4','H5','DIV'].includes(heading.tagName))continue;
  const name=mapSectionName(heading.textContent)||(/^Map Name:/i.test(clean(heading.textContent))&&/Access Points:\s*$/i.test(clean(heading.textContent))?'Access Points':null);if(!name||heading.querySelector('ul,ol,table,form'))continue;
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
function pageHasCategory(category){const crumb=document.querySelector('#breadcrumbs,.breadcrumbs,#breadcrumb,.breadcrumb');return !!crumb&&[...crumb.querySelectorAll('a[href]')].some(a=>{try{return new URL(a.getAttribute('href'),location.origin).pathname.replace(/\/$/,'')==='/'+category}catch{return false}})}
function moveRoomGallery(content){
 const galleries=[...content.children].filter(el=>el.matches('.yui-navset')&&el.querySelector('img')&&[...el.querySelectorAll('.yui-nav a')].some(a=>/^Screen\s*\d/i.test(clean(a.textContent))));
 if(!galleries.length)return;const current=galleries[0],first=content.querySelector('.aqwc-map-grid');if(!first)return;
 const block=document.createElement('section');block.className='aqwc-room-gallery';const title=document.createElement('h3');title.textContent='Room gallery';block.append(title,current);
 // Move only the first current gallery; historical galleries stay where the Wiki placed them.
 first.before(block);const notes=content.querySelector('.aqwc-map-card.aqwc-map-access');if(notes)notes.classList.add('aqwc-map-compact');
}
function factionName(value){const label=clean(value).replace(/:\s*$/,'');return /^(Faction Quests|Faction Shops|Faction Items|Notes)$/i.test(label)?label:null}
function styleFaction(content){
 if(!pageHasCategory('factions'))return false;
 const groups=[];for(const list of content.children){if(!['UL','OL'].includes(list.tagName))continue;const heading=list.previousElementSibling;if(!heading||!['P','DIV','H2','H3','H4'].includes(heading.tagName)||heading.querySelector('ul,ol,table,form'))continue;
 const markers=[...heading.querySelectorAll('strong,b')];const name=factionName(heading.textContent)||factionName(markers[markers.length-1]?.textContent);if(name)groups.push({heading,list,name})}
 if(!groups.length)return false;content.classList.add('aqwc-faction-profile');document.getElementById('main-content')?.classList.add('aqwc-directory-aligned');
 for(const {heading,list,name} of groups){const card=document.createElement('section');card.className='aqwc-faction-card';card.dataset.section=name.toLowerCase().replace(/\s+/g,'-');content.insertBefore(card,heading);card.append(heading,list)}
 return true;
}
function styleHome(content){
 if(!['/','/start','/main'].includes(location.pathname.replace(/\/$/,'')||'/'))return false;
 content.classList.add('aqwc-home-profile');document.getElementById('main-content')?.classList.add('aqwc-directory-aligned');
 // Override only local background colors, not background images or embedded art.
 for(const el of content.querySelectorAll('[style]')){const bg=el.style.backgroundColor;if(bg&&bg!=='transparent'&&bg!=='rgba(0, 0, 0, 0)')el.classList.add(el.tagName==='A'||el.tagName==='BUTTON'?'aqwc-home-link':'aqwc-home-surface');}
 return true;
}
function styleShop(content){
 if(!pageHasCategory('shops')&&!pageHasCategory('merge-shops'))return false;
 const tables=[...content.querySelectorAll('table')].filter(t=>!t.querySelector('table')&&[...t.querySelectorAll('tr')].slice(0,3).some(r=>/\b(?:name|item)\b/i.test(r.textContent)&&/\b(?:price|cost)\b/i.test(r.textContent)));
 if(!tables.length)return false;
 content.classList.add('aqwc-shop-profile');const inventory=document.getElementById('aqwc-quest-shop');if(inventory)content.prepend(inventory);
 const api=globalThis.AQWCWikiMaterials;
 for(const table of tables){const box=document.createElement('div');box.className='aqwc-shop-workspace';table.before(box);box.append(table);
 const preview=document.createElement('aside');preview.className='aqwc-shop-preview';const title=document.createElement('h3');title.textContent='Item preview';const name=document.createElement('a');const status=document.createElement('div');status.className='aqwc-shop-preview-status';status.textContent='Hover over an item or focus its link to preview it.';const art=document.createElement('div');art.className='aqwc-shop-preview-art';preview.append(title,name,status,art);box.append(preview);
 let revision=0,timer=null,active='';
 function select(a){const item=api?.sourceLink(a,location.origin);if(!item?.slug||!api?.itemPreview||item.slug===active)return;active=item.slug;clearTimeout(timer);const rev=++revision;name.href=a.href;name.textContent=clean(a.textContent);status.textContent='Loading artwork…';art.replaceChildren();
 timer=setTimeout(async()=>{const urls=await api.itemPreview(location.origin,item.slug);if(rev!==revision||!box.isConnected)return;let i=0;function next(){if(rev!==revision)return;if(i>=urls.length){status.textContent='Artwork unavailable · open item page';return}const img=document.createElement('img');img.alt=name.textContent;img.referrerPolicy='strict-origin-when-cross-origin';img.addEventListener('error',next,{once:true});img.addEventListener('load',()=>{if(rev===revision)status.textContent=''},{once:true});art.replaceChildren(img);img.src=urls[i++]};next()},220)}
 for(const row of table.querySelectorAll('tr')){const a=[...row.querySelectorAll('td a[href]')].find(a=>clean(a.textContent)&&api?.sourceLink(a,location.origin)?.slug);if(!a)continue;row.addEventListener('pointerenter',()=>select(a));a.addEventListener('focus',()=>select(a))}
 }
 return true;
}
function sectionNav(content,sections,defaultName){
 if(sections.length<2)return;
 const nav=document.createElement('nav');nav.className='aqwc-profile-nav';nav.setAttribute('aria-label','Page sections');
 const first=sections[0].nodes[0];content.insertBefore(nav,first);
 const buttons=[];
 function select(name){for(const section of sections){const active=section.name===name;for(const node of section.nodes)node.classList.toggle('aqwc-section-inactive',!active)}for(const [button,key] of buttons)button.setAttribute('aria-pressed',String(key===name))}
 for(const section of sections){const b=document.createElement('button');b.type='button';b.textContent=section.name+(section.count!=null?' · '+section.count:'');b.addEventListener('click',()=>select(section.name));buttons.push([b,section.name]);nav.append(b)}
 select(sections.some(s=>s.name===defaultName)?defaultName:sections[0].name);
}
function wrapNative(content,nodes,cls,title){
 if(!nodes.length)return null;const card=document.createElement('section');card.className=cls;content.insertBefore(card,nodes[0]);if(title){const h=document.createElement('h3');h.textContent=title;card.append(h)}card.append(...nodes);return card;
}
function mapNavigation(content){
 const cards=[...content.querySelectorAll('.aqwc-map-grid > .aqwc-map-card')];const gallery=content.querySelector(':scope > .aqwc-room-gallery');
 const sections=[];if(gallery)sections.push({name:'Rooms',nodes:[gallery]});
 for(const card of cards){const name=mapSectionName(card.firstElementChild?.textContent);if(!name)continue;const grid=card.parentElement;grid.before(card);card.classList.add('aqwc-map-tab-card');sections.push({name,nodes:[card],count:card.querySelector(':scope > ul,:scope > ol')?.children.length})}
 for(const grid of content.querySelectorAll('.aqwc-map-grid'))if(!grid.children.length)grid.remove();
 const access=content.querySelector(':scope > .aqwc-map-access');if(access)sections.push({name:'Access Points',nodes:[access]});
 const other=[...content.children].filter(el=>!sections.some(s=>s.nodes.includes(el))&&!el.matches('.aqwc-map-command,hr')&&((el.matches('p,h2,h3,h4,div')&&/^Notes\s*:/i.test(clean(el.textContent)))||(['UL','OL'].includes(el.tagName)&&/^Notes\s*:/i.test(clean(el.previousElementSibling?.textContent)))));
 const historical=[...content.children].filter(el=>el.matches('.yui-navset')&&el.querySelector('img'));
 for(const gallery of historical){const prev=gallery.previousElementSibling;if(prev&&/^Old\b/i.test(clean(prev.textContent)))other.push(prev);other.push(gallery)}
 const details=[...new Set(other)].filter(el=>el.parentElement===content).sort((a,b)=>a.compareDocumentPosition(b)&4?-1:1);
 if(details.length){const card=wrapNative(content,details,'aqwc-map-card aqwc-map-tab-card','Additional information');sections.push({name:'Notes & History',nodes:[card]})}
 sectionNav(content,sections,'Rooms');
}
function factionHeading(value){const s=clean(value);const m=s.match(/\b(Faction Quests|Faction Shops|Faction Items|Locations|Notes)\s*:/i);return m?({'faction quests':'Faction Quests','faction shops':'Faction Shops','faction items':'Faction Items','locations':'Locations','notes':'Notes'})[m[1].toLowerCase()]:null}
function styleFactionV2(content){
 if(!pageHasCategory('factions'))return false;
 const children=[...content.children],sections=[];let current=null;
 for(const node of children){if(node.matches('ul,ol')){if(current)current.nodes.push(node);continue}
  if(!node.matches('p,div,h2,h3,h4,h5')||node.querySelector('ul,ol,table,form,.yui-navset')){current=null;continue}
  const name=factionHeading(node.textContent);if(name){current={name,nodes:[node]};sections.push(current)}else if(current&&node.matches('p')&&clean(node.textContent).length<250){current.nodes.push(node)}else current=null;
 }
 const valid=sections.filter(s=>s.nodes.some(n=>n.matches('ul,ol')));if(!valid.length)return false;
 content.classList.add('aqwc-faction-profile');document.getElementById('main-content')?.classList.add('aqwc-directory-aligned');
 const panels=[];for(const s of valid){const shared=/^Leader\s*:/i.test(clean(s.nodes[0].textContent));const card=wrapNative(content,shared?s.nodes.slice(1):s.nodes,'aqwc-faction-card',shared?s.name:null);card.dataset.section=s.name.toLowerCase().replace(/\s+/g,'-');panels.push({name:s.name,nodes:[card]})}
 sectionNav(content,panels,'Faction Quests');return true;
}
function styleWars(content){
 if(location.pathname.replace(/\/$/,'')!=='/wars')return false;
 const children=[...content.children],entries=[];
 for(let i=0;i<children.length-1;i++){const heading=children[i],list=children[i+1];if(!heading.matches('p,h2,h3,h4,h5,div')||!list.matches('ul,ol')||heading.querySelector('ul,ol,table'))continue;
 const a=heading.querySelector('a[href]');if(!a||!clean(a.textContent)||!/\b(?:19|20)\d{2}\b/.test(list.textContent))continue;entries.push({heading,list,name:clean(a.textContent),date:clean(list.textContent)});i++}
 if(!entries.length)return false;content.classList.add('aqwc-war-profile');document.getElementById('main-content')?.classList.add('aqwc-directory-aligned');
 const grid=document.createElement('div');grid.className='aqwc-war-grid';const toolbar=document.createElement('div');toolbar.className='aqwc-profile-nav';const input=document.createElement('input');input.type='search';input.placeholder='Search wars or year…';input.setAttribute('aria-label','Search wars');const count=document.createElement('span');toolbar.append(input,count);
 content.insertBefore(toolbar,entries[0].heading);toolbar.after(grid);
 for(const e of entries){const card=document.createElement('article');card.className='aqwc-war-card';card.append(e.heading,e.list);grid.append(card);e.card=card}
 for(const n of children)if(n.parentElement===content&&n.matches('p,h2,h3,h4,h5')&&/^[A-Z#]$/.test(clean(n.textContent)))n.classList.add('aqwc-war-letter');
 function filter(){const q=clean(input.value).toLowerCase();let visible=0;for(const e of entries){e.card.hidden=!(e.name+' '+e.date).toLowerCase().includes(q);if(!e.card.hidden)visible++}count.textContent=visible+' / '+entries.length+' wars'}input.addEventListener('input',filter);filter();return true;
}
function styleSearch(content){
 const path=location.pathname.replace(/%3a/ig,':').replace(/\/$/,'');if(!/^\/(?:search(?:[-:][a-z0-9-]+)?|system:search)$/.test(path))return false;
 content.classList.add('aqwc-search-profile');document.getElementById('main-content')?.classList.add('aqwc-directory-aligned');return true;
}
function paletteHome(content){
 const warm=(value)=>{const m=String(value||'').match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);if(!m)return false;const [r,g,b]=m.slice(1).map(Number);return r>g+7&&r>b+8};
 const recolor=()=>{for(const el of content.querySelectorAll('div,section,td,th,a,button,span,p,blockquote')){
  if(el.classList.contains('aqwc-home-link')||el.classList.contains('aqwc-home-surface'))continue;
  const css=getComputedStyle(el),bg=css.backgroundColor;
  if(warm(bg))el.classList.add(el.matches('a,button')||el.querySelector(':scope > a:only-child')&&el.children.length===1?'aqwc-home-link':'aqwc-home-surface');
  if(warm(css.color)||/^rgb\((?:1[5-9]\d|2\d\d),\s*[0-9]{1,2},\s*(?:1[5-9]\d|2\d\d)\)/.test(css.color))el.classList.add('aqwc-home-text');
 }};
 recolor();requestAnimationFrame(recolor);window.addEventListener('load',recolor,{once:true});
}
function init(){
 if(location.origin!=='https://aqwwiki.wikidot.com')return;const kind=indexKind(location.pathname),content=document.getElementById('page-content');if(!content||document.getElementById('aqwc-directory-v2'))return;
 if(!kind){if(styleHome(content)){paletteHome(content);return}if(styleSearch(content)||styleWars(content)||styleFactionV2(content)||styleShop(content))return;if(styleMap(content)){moveRoomGallery(content);mapNavigation(content);return}styleMonster(content);return}
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
  for(const [l,group] of sectionGroups){const section=document.createElement('section');section.className='aqwc-index-section';const title=document.createElement('h3');title.textContent=l;const grid=document.createElement('div');grid.className='aqwc-index-grid';for(const r of group){const a=document.createElement('a');a.className='aqwc-index-entry';a.href=r.url;const name=document.createElement('span');name.textContent=r.name.replace(/\s*\((?:0\s*AC|AC|Non-AC|Legend|Seasonal|Rare|Pseudo-Rare|Special Offer|Free Player)\)/gi,'').trim()||r.name;const badges=document.createElement('span');badges.className='aqwc-index-badges';badges.append(...coloredBadges(r.anchor));a.append(name,badges);grid.append(a)}section.append(title,grid);body.append(section)}
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
globalThis.AQWCDirectory=Object.freeze({indexKind,rowName,runs,entry,directoryEntries,letter,mapSectionName,mapSections,tagLabels,nameTags,factionName,factionHeading});
if(typeof document!=='undefined'){try{init()}finally{globalThis.AQWCWikiBoot?.layoutReady()}}
})();
