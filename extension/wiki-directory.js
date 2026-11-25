/* Progressive directory styling: original links, badges, filters and anchors remain in the DOM. */
(()=>{
'use strict';
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const indexes=new Set('quests monsters locations shops factions npcs armors capes-back-items classes enhancements helmets-hoods houses floor-items wall-items misc-items use-items necklaces grounds pets battle-pets axes bows daggers gauntlets guns handguns maces polearms rifles staffs swords wands whips'.split(' '));
function indexKind(path){const s=directoryPath(path).replace(/^\//,'');if(['items','weapons','housing'].includes(s))return 'categories';return indexes.has(s)||(/^sort-by-[a-z0-9-]+$/.test(s)&&[...indexes].some(x=>s.endsWith('-'+x)))?'alphabetic':null}
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
 for(const [position,a] of links.entries()){
  if(!a.closest('.list-pages-box,.list-pages-item')&&(last<0||position<=last)&&!rowName(a.closest('p,li,div')||a,origin))continue;
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
function directoryTags(a){
 const labels=new Set(nameTags(clean(a.textContent)));
 for(const n of badgeNodes(a)){const src=n.getAttribute('src')||'',alt=n.getAttribute('alt')||'';for(const label of tagLabels(alt||n.textContent))labels.add(label);
  const key=src.split('/').pop().replace(/\.(png|gif|jpe?g|webp).*$/i,'').replace(/(?:small|large)$/i,'');for(const label of tagLabels(key.replace(/_/g,' ')))labels.add(label);
 }
 return [...labels];
}
function coloredBadges(a,stored){return (stored||directoryTags(a)).map(label=>{const b=document.createElement('span');b.className='aqwc-tag';b.dataset.kind=label.toLowerCase().replace(/[^a-z0-9]+/g,'-');b.textContent=label;return b});
}
function letter(name){const c=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').charAt(0).toUpperCase();return /^[A-Z]$/.test(c)?c:'#'}
function mapSectionName(value){const name=clean(value).replace(/:\s*$/,'').toLowerCase();return ({monsters:'Monsters',npcs:'NPCs',quests:'Quests',shops:'Shops',locations:'Locations','access points':'Access Points'})[name]||null}
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
 if(!galleries.length){const nodes=[...content.children].filter(el=>el.matches('.collapsible-block,.yui-navset')&&el.querySelector('img')||el.matches('img')||(['P','DIV','CENTER','A'].includes(el.tagName)&&el.querySelector('img')&&!clean(el.textContent)&&!el.querySelector('ul,ol,table,form')));const first=content.querySelector('.aqwc-map-grid,.aqwc-map-access');if(first&&nodes.length){const gallery=wrapNative(content,nodes,'aqwc-room-gallery','Room gallery');first.before(gallery)}return}const current=galleries[0],first=content.querySelector('.aqwc-map-grid,.aqwc-map-access');if(!first)return;
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
 content.classList.add('aqwc-shop-profile');
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
function isMapOverviewSection(name){return ['Rooms','NPCs','Quests','Shops','Locations'].includes(name)}
function mapOverview(content,sections){
 const visible=sections.filter(s=>isMapOverviewSection(s.name)),optional=sections.filter(s=>!isMapOverviewSection(s.name));
 const first=[...content.children].find(node=>sections.some(s=>s.nodes.includes(node)));if(!first)return;
 const layout=document.createElement('div');layout.className='aqwc-map-overview';content.insertBefore(layout,first);
 const rooms=visible.filter(s=>s.name==='Rooms'),directory=visible.filter(s=>s.name!=='Rooms');
 if(rooms.length){const art=document.createElement('div');art.className='aqwc-map-overview-rooms';for(const s of rooms)art.append(...s.nodes);layout.append(art)}
 if(directory.length){const stack=document.createElement('div');stack.className='aqwc-map-overview-directory';for(const name of ['NPCs','Quests','Shops','Locations'])for(const s of directory.filter(s=>s.name===name))stack.append(...s.nodes);layout.append(stack)}
 if(!rooms.length||!directory.length)layout.classList.add('aqwc-map-overview-single');
 if(!visible.length)layout.hidden=true;
 if(!optional.length)return;
 const extra=document.createElement('section');extra.className='aqwc-map-extras';const nav=document.createElement('nav');nav.className='aqwc-profile-nav aqwc-map-extra-nav';nav.setAttribute('aria-label','Additional map information');const title=document.createElement('strong');title.textContent='More map information';nav.append(title);extra.append(nav);layout.after(extra);
 for(const name of [...new Set(optional.map(s=>s.name))]){
  const group=optional.filter(s=>s.name===name),panel=document.createElement('div');panel.hidden=true;panel.className='aqwc-map-extra-panel';panel.id='aqwc-map-extra-'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  for(const s of group)panel.append(...s.nodes);
  const b=document.createElement('button');b.type='button';b.textContent=name+(group.length===1&&group[0].count!=null?' · '+group[0].count:'');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls',panel.id);
  b.addEventListener('click',()=>{panel.hidden=!panel.hidden;b.setAttribute('aria-expanded',String(!panel.hidden))});nav.append(b);extra.append(panel);
 }
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
 mapOverview(content,sections);
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
function searchUrl(query,exact=false){
 const value=clean(query);if(!value)return null;
 const url=new URL('https://www.google.com/search');url.searchParams.set('q','site:aqwwiki.wikidot.com '+(exact?'"'+value.replace(/"/g,'')+'"':value));return url.href;
}
function setupSearch(content){
 if(!/^\/search(?::main)?\/?$/.test(location.pathname.replace(/%3a/ig,':')))return;
 const frames=[...content.querySelectorAll('iframe')];if(!frames.length)return;
 const original=document.createElement('details');original.className='aqwc-search-original';const disclosure=document.createElement('summary');disclosure.textContent='Original Wiki search · exact name / Jump / embedded Google';original.append(disclosure);
 const nodes=[...content.childNodes];original.append(...nodes);
 const hero=document.createElement('section');hero.className='aqwc-search-hero';const heading=document.createElement('h1');heading.textContent='Search the AQW Wiki';const desc=document.createElement('p');desc.textContent='Find items, classes, quests, monsters and locations.';
 const form=document.createElement('form');form.className='aqwc-search-form';const field=document.createElement('input');field.type='search';field.placeholder='Search the Wiki…';field.required=true;field.setAttribute('aria-label','Wiki search query');const submit=document.createElement('button');submit.type='submit';submit.textContent='Search Wiki';form.append(field,submit);
 const actions=document.createElement('div');actions.className='aqwc-search-actions';const exact=document.createElement('button');exact.type='button';exact.textContent='Exact phrase';exact.addEventListener('click',()=>{if(!field.reportValidity())return;const url=searchUrl(field.value,true);if(url)window.open(url,'_blank','noopener,noreferrer')});
 const native=document.createElement('button');native.type='button';native.textContent='Exact name / Jump';native.addEventListener('click',()=>{original.open=true;original.scrollIntoView({block:'nearest'})});actions.append(exact,native);
 const tag=[...original.querySelectorAll('a[href]')].find(a=>/search items by tag/i.test(clean(a.textContent)));if(tag){const a=document.createElement('a');a.href=tag.href;a.textContent='Search Items by Tag';actions.append(a)}
 const hint=document.createElement('small');hint.textContent='Search Wiki and Exact phrase open Google results limited to the AQW Wiki. For the original exact-name and /join tools, choose Exact name / Jump.';
 form.addEventListener('submit',e=>{e.preventDefault();const url=searchUrl(field.value);if(url)window.open(url,'_blank','noopener,noreferrer')});
 hero.append(heading,desc,form,actions,hint);content.append(hero,original);
}
function decorateMapCards(content){
 const glyphs={Locations:'⌖',NPCs:'♟',Quests:'▤',Shops:'◇',Monsters:'⚔'};
 for(const card of content.querySelectorAll('.aqwc-map-tab-card')){
  const name=mapSectionName(card.firstElementChild?.textContent);if(!glyphs[name])continue;
  const list=card.querySelector(':scope > ul,:scope > ol');if(!list)continue;
  const rows=[...list.children].filter(n=>n.tagName==='LI');if(!rows.length)continue;
  list.classList.add('aqwc-map-entry-grid');card.classList.add('aqwc-map-directory-card');
  for(const row of rows){const a=[...row.querySelectorAll('a[href]')].find(a=>clean(a.textContent));if(!a)continue;const tags=coloredBadges(a);const mark=document.createElement('span');mark.className='aqwc-map-glyph';mark.setAttribute('aria-hidden','true');mark.textContent=glyphs[name];row.prepend(mark);
   const label=document.createElement('div');label.className='aqwc-map-entry-label';for(const node of [...row.childNodes])if(node!==mark)label.append(node);row.append(label);
   if(tags.length){const badges=document.createElement('div');badges.className='aqwc-map-tags';badges.append(...tags);label.append(badges);
    // Hide only recognized original tag images; retain all links and any other annotations.
    for(const img of label.querySelectorAll('img')){const key=(img.getAttribute('alt')||'')+' '+(img.getAttribute('src')||'');if(/(?:ac|legend|rare|seasonal|special|pseudo|free)(?:small|large)|(?:^|\s)(?:AC|Legend|Rare|Seasonal|Pseudo-Rare|Special Offer)(?:\s|$)/i.test(key))img.classList.add('aqwc-map-native-tag')}
   }
  }
  const bar=document.createElement('div');bar.className='aqwc-map-entry-toolbar';const count=document.createElement('span');count.textContent=rows.length+' '+name.toLowerCase();bar.append(count);
  if(rows.length>=5){const filter=document.createElement('input');filter.type='search';filter.placeholder='Find '+name.toLowerCase()+'…';filter.setAttribute('aria-label','Filter '+name);bar.prepend(filter);filter.addEventListener('input',()=>{const q=clean(filter.value).toLowerCase();let n=0;for(const row of rows){row.hidden=!clean(row.textContent).toLowerCase().includes(q);if(!row.hidden)n++}count.textContent=n+' / '+rows.length+' '+name.toLowerCase()})}
  list.before(bar);
 }
}
function layoutRoomVariants(content){
 const blocks=[...content.querySelectorAll('.aqwc-room-gallery .collapsible-block,.aqwc-map-tab-card .yui-navset .collapsible-block')];
 for(const block of blocks){const folded=block.querySelector(':scope > .collapsible-block-folded'),unfolded=block.querySelector(':scope > .collapsible-block-unfolded');if(!folded||!unfolded)continue;
  block.classList.add('aqwc-room-variant');const update=()=>{block.classList.toggle('aqwc-room-variant-open',!unfolded.hidden&&getComputedStyle(unfolded).display!=='none')};update();
  if(typeof MutationObserver==='function'){const observer=new MutationObserver(update);observer.observe(unfolded,{attributes:true,attributeFilter:['style','class','hidden']});observer.observe(folded,{attributes:true,attributeFilter:['style','class','hidden']})}
 }
}
function styleSearch(content){
 const path=location.pathname.replace(/%3a/ig,':').replace(/\/$/,'');if(!/^\/(?:search(?:[-:][a-z0-9-]+)?|system:search)$/.test(path))return false;
 content.classList.add('aqwc-search-profile');document.getElementById('main-content')?.classList.add('aqwc-directory-aligned');setupSearch(content);return true;
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
function directoryPath(path){return String(path||'').replace(/\/p\/[1-9]\d*\/?$/,'').replace(/\/$/,'')}
function searchKey(value){return clean(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’‘']/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function matchesDirectory(row,query){const q=searchKey(query);if(!q)return true;const name=searchKey(row.name),slug=searchKey(String(row.url||'').split('/').pop());return q.split(' ').every(word=>name.includes(word)||slug.includes(word))}
function exactCandidates(query,path){
 const slug=searchKey(query).replace(/ /g,'-');if(slug.length<3||slug.length>180||!/^\/[a-z0-9-]+$/.test(path)||!indexes.has(path.slice(1)))return [];
 const suffix=({swords:'sword',armors:'armor',classes:'class',guns:'gun',pets:'pet','helmets-hoods':'helm',monsters:'monster',locations:'location'})[path.slice(1)];
 return [...new Set([slug,...(suffix?[slug+'-'+suffix]:[])])];
}
async function readWikiHtml(r){
 const reader=r.body?.getReader();if(!reader)throw Error('Missing response');let size=0,html='';const decoder=new TextDecoder();
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4000000){await reader.cancel();throw Error('Page too large')}html+=decoder.decode(value,{stream:true})}return html+decoder.decode()}finally{reader.releaseLock()}
}
async function lookupExactDirectory(query,path,origin,signal,onMatch){
 if(origin!=='https://aqwwiki.wikidot.com'||signal?.aborted)return null;
 const candidates=exactCandidates(query,path);
 const results=await Promise.all(candidates.map(async slug=>{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4000),cancel=()=>controller.abort();signal?.addEventListener('abort',cancel,{once:true});
  try{if(signal?.aborted)return null;const url=origin+'/'+slug,r=await fetch(url,{credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});if(!r.ok||!String(r.headers.get('content-type')).includes('text/html'))return null;
   const t=document.createElement('template');t.innerHTML=await readWikiHtml(r);const title=clean(t.content.querySelector('#page-title')?.textContent),content=t.content.querySelector('#page-content');
   if(!title||!content||!matchesDirectory({name:title,url},query)||!([searchKey(title),searchKey(title.replace(/\s*\([^)]*\)$/,''))].includes(searchKey(query))))return null;
   const links=[...t.content.querySelectorAll('#breadcrumbs a[href],#breadcrumb a[href],.breadcrumbs a[href],.breadcrumb a[href]')];
   if(!links.some(a=>{try{const u=new URL(a.getAttribute('href'),origin);return u.origin===origin&&directoryPath(u.pathname)===path}catch{return false}}))return null;
   const match={name:title,url,tags:nameTags(title)};if(!signal?.aborted)onMatch?.(match);return match;
  }catch{return null}finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel)}
 }));
 return results.find(Boolean)||null;
}
function pageNumber(path){return Number(String(path).match(/\/p\/([1-9]\d*)\/?$/)?.[1]||1)}
function paginationLinks(content,origin,path){
 const root=directoryPath(path),out=new Set();
 for(const a of content.querySelectorAll('.pager a[href],.pagination a[href]')){
  try{const u=new URL(a.getAttribute('href'),origin);if(u.origin!==origin||u.search||directoryPath(u.pathname)!==root)continue;if(u.pathname!==root&&!/\/p\/[1-9]\d*\/?$/.test(u.pathname))continue;const n=pageNumber(u.pathname);if(n<=200)out.add(n)}catch{}
 }
 // A native pager advertises the final page; fill gaps without relying on visible pager buttons.
 const max=Math.max(0,...out);if(max)for(let n=1;n<=max;n++)out.add(n);
 return [...out].sort((a,b)=>a-b);
}
function directoryCacheKey(path,n){return 'aqwc-directory-v3:'+path+':'+n}
function readDirectoryCache(origin,path,n){
 try{const saved=JSON.parse(sessionStorage.getItem(directoryCacheKey(path,n))||'null');if(!saved||Date.now()-saved.at>20*60*1000||!Array.isArray(saved.entries)||!saved.entries.length||saved.entries.length>3000||!Array.isArray(saved.pages))return null;
 const entries=saved.entries.filter(r=>{try{const u=new URL(r.url);return u.origin===origin&&/^\/[a-z0-9][a-z0-9-]{0,199}\/?$/.test(u.pathname)&&!u.search&&!u.hash&&typeof r.name==='string'&&r.name.length<=300&&Array.isArray(r.tags)&&r.tags.every(x=>typeof x==='string'&&x.length<=30)}catch{return false}});if(entries.length!==saved.entries.length)return null;
 return {entries,pages:saved.pages.filter(p=>Number.isInteger(p)&&p>=1&&p<=200)};
 }catch{return null}
}
function writeDirectoryCache(path,n,result){
 try{sessionStorage.setItem(directoryCacheKey(path,n),JSON.stringify({at:Date.now(),entries:result.entries.map(r=>({name:r.name,url:r.url,tags:r.tags||directoryTags(r.anchor)})),pages:result.pages}))}catch{}
}
async function fetchDirectoryPage(origin,path,n){
 if(origin!=='https://aqwwiki.wikidot.com'||!/^\/[a-z0-9-]+$/.test(path)||!Number.isInteger(n)||n<1||n>200)throw Error('Invalid directory page');
 const cached=readDirectoryCache(origin,path,n);if(cached)return cached;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 try{const url=origin+path+(n===1?'':'/p/'+n),r=await fetch(url,{credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});if(!r.ok||!String(r.headers.get('content-type')).includes('text/html'))throw Error('Wiki page unavailable');
  const html=await readWikiHtml(r);
  const t=document.createElement('template');t.innerHTML=html;const content=t.content.querySelector('#page-content');if(!content)throw Error('Missing directory');
  const entries=directoryEntries(content,origin);if(!entries.length)throw Error('No entries parsed');const result={entries:entries.map(r=>({name:r.name,url:r.url,tags:directoryTags(r.anchor)})),pages:paginationLinks(content,origin,path)};writeDirectoryCache(path,n,result);return result;
 }finally{clearTimeout(timer)}
}
const weaponKinds=new Set('axes bows daggers gauntlets guns handguns maces polearms rifles staffs swords wands whips'.split(' '));
function flatLinkNodes(content,accept){
 const rows=[];
 function onlyLinks(node){if(node.nodeType===3)return !clean(node.textContent);if(node.nodeType!==1)return true;if(node.tagName==='BR')return true;if(node.tagName==='A')return accept(node);return ['P','DIV','STRONG','B','SPAN','LI','UL','OL','CENTER'].includes(node.tagName)&&[...node.childNodes].every(onlyLinks)}
 for(const el of content.children){if(!['P','DIV','UL','OL','CENTER','A'].includes(el.tagName)||el.matches('#breadcrumbs,.breadcrumbs,.breadcrumb,.pager,.pagination,.collapsible-block,.yui-navset')||!onlyLinks(el))continue;
  const links=el.tagName==='A'?[el]:[...el.querySelectorAll('a[href]')];if(links.length&&links.every(accept))rows.push({el,links})}
 return rows;
}
function weaponSlug(a){try{const u=new URL(a.getAttribute('href'),location.origin),slug=u.pathname.replace(/^\/|\/$/g,'');return u.origin===location.origin&&weaponKinds.has(slug)&&!u.hash&&!u.search?slug:null}catch{return null}}

// Reuse the homepage's own category artwork, not invented lookalike glyphs.
// Fetch only once on category pages; a tab-local cache also avoids repeat visits.
const homepageItemKinds=new Set('armors capes-back-items classes enhancements grounds helmets-hoods houses floor-items wall-items misc-items necklaces pets weapons'.split(' '));
const categoryAliases={'housing':'houses','use-items':'misc-items','battle-pets':'pets','back-items':'capes-back-items','helmets':'helmets-hoods'};
function categoryIconKey(href,origin){
 try{const u=new URL(href,origin);if(u.origin!==origin||u.search||u.hash)return null;const slug=u.pathname.replace(/^\/|\/$/g,'');const key=categoryAliases[slug]||slug;return homepageItemKinds.has(key)?key:null}catch{return null}
}
function categoryImageUrl(src,origin){
 if(typeof src!=='string'||!src.trim())return null;
 try{const u=new URL(src,origin);if(u.protocol==='http:')u.protocol='https:';if(u.protocol!=='https:'||u.username||u.password)return null;if(!['aqwwiki.wikidot.com','aqwwiki.wdfiles.com','i.imgur.com','imgur.com','static.wikidot.com'].includes(u.hostname))return null;return u.href}catch{return null}
}
function homepageIcons(content,origin){
 const result={};
 if(!content)return result;
 for(const a of content.querySelectorAll('a[href]')){
  const key=categoryIconKey(a.getAttribute('href'),origin);if(!key||result[key])continue;
  // Support a linked image, inline background, or a single adjacent icon.
  const candidates=[a,...a.querySelectorAll('img,[style*="background"]')];
  const p=a.parentElement;if(p&&p.querySelectorAll('a[href]').length===1)candidates.push(p,...p.querySelectorAll('img,[style*="background"]'));
  for(const el of candidates){
   const src=el.getAttribute('src')||el.getAttribute('data-src')||((el.getAttribute('style')||'').match(/url\(\s*["']?([^"')]+)["']?\s*\)/i)||[])[1];
   const url=src&&categoryImageUrl(src,origin);if(url){result[key]=url;break}
  }
 }
 return result;
}
const categoryIconCache='aqwc-home-category-icons-v1';
let categoryIconPromise;
function readHomeIcons(){
 if(categoryIconPromise)return categoryIconPromise;
 categoryIconPromise=(async()=>{
  const origin=location.origin;
  try{const stored=JSON.parse(sessionStorage.getItem(categoryIconCache)||'null');if(stored&&Date.now()-stored.time<86400000&&Object.keys(stored.icons||{}).length>=10){const safe={};for(const key of homepageItemKinds){const url=categoryImageUrl(stored.icons[key],origin);if(url&&stored.icons[key])safe[key]=url}if(Object.keys(safe).length>=10)return safe}}catch{}
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{const r=await fetch(origin+'/',{credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});if(!r.ok||new URL(r.url||origin).origin!==origin||!String(r.headers.get('content-type')).includes('text/html'))return {};
   const template=document.createElement('template');template.innerHTML=await readWikiHtml(r);
   const icons=homepageIcons(template.content.querySelector('#page-content'),origin);
   if(Object.keys(icons).length)try{sessionStorage.setItem(categoryIconCache,JSON.stringify({time:Date.now(),icons}))}catch{}
   return icons;
  }catch{return {}}finally{clearTimeout(timer)}
 })();return categoryIconPromise;
}
function applyHomeIcon(mark,key,icons){
 const url=icons[key];if(!url||mark.querySelector('img'))return;
 const img=document.createElement('img');img.className='aqwc-category-home-icon';img.alt='';img.decoding='async';img.referrerPolicy='no-referrer';
 img.addEventListener('load',()=>{mark.replaceChildren(img);mark.classList.add('aqwc-category-has-icon')},{once:true});img.src=url;
}
function upgradeCategoryIcons(content){
 const marks=[...content.querySelectorAll('[data-aqwc-category-icon]')];if(!marks.length)return;
 readHomeIcons().then(icons=>{for(const mark of marks)applyHomeIcon(mark,mark.dataset.aqwcCategoryIcon,icons)});
}
// Local transparent sprite from the Wiki homepage category artwork, used immediately.
const categorySpriteKeys=Object.freeze(['armors','capes-back-items','classes','enhancements','grounds','helmets-hoods','houses','floor-items','wall-items','misc-items','necklaces','pets','weapons']);
function categorySpriteIndex(key){return categorySpriteKeys.indexOf(key)}
function addCategoryIcon(a,key,small=false){
 if(!key||a.querySelector(':scope > .aqwc-category-glyph'))return;
 const index=categorySpriteIndex(key);if(index<0)return;
 const mark=document.createElement('span');mark.className='aqwc-category-glyph aqwc-category-has-icon'+(small?' aqwc-category-small-glyph':'');mark.dataset.aqwcCategoryIcon=key;mark.setAttribute('aria-hidden','true');
 const sprite=document.createElement('span');sprite.className='aqwc-category-sprite';sprite.style.backgroundImage='url("'+chrome.runtime.getURL('category-icons.png')+'")';sprite.style.backgroundPosition=(index*100/(categorySpriteKeys.length-1))+'% 50%';mark.append(sprite);a.prepend(mark);
 if(small)a.classList.add('aqwc-category-sub-link');
}
function categorySubIcons(list){
 // The selector "ul li > a" also matches the top-level list when scoped
 // to an existing UL. Walk only its actual child lists instead.
 for(const li of list.children){const nested=li.querySelector(':scope > ul');if(!nested)continue;
  for(const a of nested.querySelectorAll('li > a[href]')){if(a.classList.contains('aqwc-category-title'))continue;addCategoryIcon(a,categoryIconKey(a.getAttribute('href'),location.origin),true)}
 }
}

function styleWeapons(content){
 const rows=flatLinkNodes(content,a=>!!weaponSlug(a));if(!rows.length)return false;
 const grid=document.createElement('section');grid.className='aqwc-weapon-grid';const seen=new Set();
 const glyph={axes:'◈',bows:'➶',daggers:'✦',gauntlets:'✊',guns:'◎',handguns:'◎',maces:'✺',polearms:'⚑',rifles:'◎',staffs:'✧',swords:'⚔',wands:'✧',whips:'〰'};
 content.insertBefore(grid,rows[0].el);
 for(const {el,links} of rows){for(const a of links){const slug=weaponSlug(a);if(seen.has(slug))continue;seen.add(slug);const card=document.createElement('a');card.href=a.href;card.className='aqwc-weapon-card';const mark=document.createElement('span');mark.className='aqwc-category-glyph';mark.setAttribute('aria-hidden','true');mark.textContent=glyph[slug];const label=document.createElement('strong');label.textContent=clean(a.textContent);card.append(mark,label);grid.append(card)}el.hidden=true}
 content.classList.add('aqwc-directory','aqwc-category-index');document.getElementById('main-content')?.classList.add('aqwc-directory-aligned');return true;
}
function regionLink(a){try{const u=new URL(a.getAttribute('href'),location.origin);return u.origin===location.origin&&!u.hash&&!u.search&&/^\/[a-z0-9][a-z0-9-]*$/.test(u.pathname)&&!indexKind(u.pathname)&&!!clean(a.textContent)&&!a.querySelector('img')}catch{return false}}
function styleRegion(content){
 if(!pageHasCategory('locations'))return false;
 const rows=flatLinkNodes(content,regionLink);
 const art=[...content.children].filter(el=>!rows.some(r=>r.el===el)&&!el.matches('#breadcrumbs,.breadcrumbs,.breadcrumb')&&(el.matches('.collapsible-block,.yui-navset')||el.matches('img')||(['P','DIV','CENTER','A'].includes(el.tagName)&&el.querySelector('img')&&!clean(el.textContent)&&!el.querySelector('ul,ol,table,form'))));
 if(!rows.length&&!art.length)return false;
 // Region maps and small locations without the usual Monsters/NPCs headings.
 const sections=[];if(rows.length){const card=document.createElement('section');card.className='aqwc-map-card aqwc-map-tab-card';const h=document.createElement('h3');h.textContent='Locations:';const ul=document.createElement('ul');content.insertBefore(card,rows[0].el);card.append(h,ul);
 for(const {el,links} of rows){for(const a of links){const li=document.createElement('li');li.append(a);ul.append(li)}if(el.parentElement===content)el.remove()}sections.push({name:'Locations',nodes:[card],count:ul.children.length})}
 if(art.length){const gallery=wrapNative(content,art,'aqwc-room-gallery','Map gallery');sections.unshift({name:'Rooms',nodes:[gallery]})}
 content.classList.add('aqwc-map-profile');document.getElementById('main-content')?.classList.add('aqwc-directory-aligned');mapOverview(content,sections);decorateMapCards(content);layoutRoomVariants(content);return true;
}
function init(){
 if(location.origin!=='https://aqwwiki.wikidot.com')return;const kind=indexKind(location.pathname),content=document.getElementById('page-content');if(!content||document.getElementById('aqwc-directory-v2'))return;
 if(!kind){if(styleHome(content)){paletteHome(content);return}if(styleSearch(content)||styleWars(content)||styleFactionV2(content)||styleShop(content))return;if(styleMap(content)){moveRoomGallery(content);mapNavigation(content);decorateMapCards(content);layoutRoomVariants(content);return}if(styleRegion(content))return;styleMonster(content);return}
 if(kind==='categories'){
  if(directoryPath(location.pathname)==='/weapons'&&styleWeapons(content))return;
  const list=[...content.children].find(el=>el.tagName==='UL'&&el.children.length>=3);if(!list)return;content.classList.add('aqwc-directory','aqwc-category-index');list.classList.add('aqwc-category-grid');document.getElementById('main-content')?.classList.add('aqwc-directory-aligned');for(const li of list.children){const sub=li.querySelector('ul'),a=li.querySelector('a');if(!sub)li.classList.add('aqwc-category-leaf');if(sub&&sub.children.length>=6)li.classList.add('aqwc-category-wide');if(a){a.classList.add('aqwc-category-title');const key=categoryIconKey(a.getAttribute('href'),location.origin);addCategoryIcon(a,key)}}categorySubIcons(list);return;
 }
 const rows=directoryEntries(content,location.origin);if(!rows.length)return;
 const host=document.createElement('section');host.id='aqwc-directory-v2';host.style.display='none';host.setAttribute('aria-label','Wiki directory');
 const toolbar=document.createElement('div');toolbar.className='aqwc-index-toolbar';const search=document.createElement('input');search.type='search';search.placeholder='Search '+(document.getElementById('page-title')?.textContent.trim()||'directory')+'…';search.setAttribute('aria-label','Search directory');const status=document.createElement('span');status.setAttribute('role','status');
 const original=document.createElement('button');original.type='button';original.textContent='Show original Wiki list';original.setAttribute('aria-expanded','false');original.addEventListener('click',()=>{const open=content.classList.toggle('aqwc-index-original-open');original.textContent=open?'Hide original Wiki list':'Show original Wiki list';original.setAttribute('aria-expanded',String(open))});
 toolbar.append(search,status,original);
 const filters=document.createElement('div');filters.className='aqwc-index-filters';const nativeCrumb=content.querySelector('#breadcrumbs,.breadcrumbs,#breadcrumb,.breadcrumb');if(nativeCrumb){const trail=document.createElement('div');trail.className='aqwc-index-trail';for(const a of nativeCrumb.querySelectorAll('a[href]')){const link=document.createElement('a');link.href=a.href;link.textContent=clean(a.textContent);trail.append(link,document.createTextNode(' › '))}trail.append(document.createTextNode(document.getElementById('page-title')?.textContent.trim()||''));host.append(trail)}
 for(const a of content.querySelectorAll('a[href]')){const href=a.getAttribute('href')||'';if(!/^(?:\/|https:\/\/aqwwiki\.wikidot\.com\/)sort-by-[a-z0-9-]+\/?$/.test(href)||!clean(a.textContent))continue;const link=document.createElement('a');link.href=a.href;link.textContent=clean(a.textContent);filters.append(link)}
 const alphabet=document.createElement('div');alphabet.className='aqwc-index-alphabet';const body=document.createElement('div');const groups=new Map();for(const row of rows){const l=letter(row.name);if(!groups.has(l))groups.set(l,[]);groups.get(l).push(row)}
 let active='All',page=1;const perPage=96;
 const knownPages=new Set(paginationLinks(content,location.origin,location.pathname)),loadedPages=new Set([pageNumber(location.pathname)]),rowKeys=new Set(rows.map(r=>r.url+'\n'+r.name));let loading=false,failed=false,searchTimer=null,exactRevision=0,exactController=null,exactPending=false;
 const coverage=document.createElement('div');coverage.className='aqwc-index-coverage';const coverageText=document.createElement('span');coverageText.setAttribute('role','status');const load=document.createElement('button');load.type='button';load.textContent='Load all Wiki pages';coverage.append(coverageText,load);
 function mergePage(result,n){for(const p of result.pages)knownPages.add(p);for(const r of result.entries){const key=r.url+'\n'+r.name;if(rowKeys.has(key))continue;rowKeys.add(key);rows.push(r);const l=letter(r.name);if(!groups.has(l))groups.set(l,[]);groups.get(l).push(r)}if(n)loadedPages.add(n)}
 function hydrateCached(){for(const n of knownPages){if(loadedPages.has(n))continue;const cached=readDirectoryCache(location.origin,directoryPath(location.pathname),n);if(cached)mergePage(cached,n)}}
 function updateCoverage(){const remaining=[...knownPages].filter(n=>!loadedPages.has(n)).length;load.hidden=!remaining;load.disabled=loading;load.textContent=loading?'Loading…':failed?'Retry remaining Wiki pages':'Load all Wiki pages';coverageText.textContent=loading?'Loading Wiki pages · '+loadedPages.size+' / '+knownPages.size:remaining?(failed?'Partial search · some Wiki pages failed. ':'Current Wiki page only · ')+remaining+' more pages to load':knownPages.size?'All discovered Wiki pages loaded · '+loadedPages.size+' pages':'All entries on this Wiki page';}
 async function loadAll(){
  if(loading||![...knownPages].some(n=>!loadedPages.has(n)))return;
  hydrateCached();loading=true;failed=false;updateAlphabet();updateCoverage();render();const attempts=new Map();
  try{
   while(true){
    const batch=[...knownPages].filter(n=>!loadedPages.has(n)&&(attempts.get(n)||0)<2).sort((a,b)=>(attempts.get(a)||0)-(attempts.get(b)||0)||a-b).slice(0,4);
    if(!batch.length)break;
    await Promise.all(batch.map(async n=>{
     attempts.set(n,(attempts.get(n)||0)+1);
     try{const result=await fetchDirectoryPage(location.origin,directoryPath(location.pathname),n);
      mergePage(result,n);
     }catch{}
     failed=[...knownPages].some(p=>!loadedPages.has(p)&&(attempts.get(p)||0)>=2);
     updateCoverage();
     // Display a matching entry immediately, even while other pages are still downloading.
     updateAlphabet();render();
    }));
    await new Promise(resolve=>setTimeout(resolve,100));
   }
  }finally{loading=false;failed=[...knownPages].some(n=>!loadedPages.has(n));updateCoverage();render()}
 }
 writeDirectoryCache(directoryPath(location.pathname),pageNumber(location.pathname),{entries:rows,pages:[...knownPages]});hydrateCached();load.addEventListener('click',loadAll);updateCoverage();
 const nav=document.createElement('div');nav.className='aqwc-index-pager';const prev=document.createElement('button'),next=document.createElement('button'),pageLabel=document.createElement('span');prev.textContent='← Previous';next.textContent='Next →';prev.type=next.type='button';nav.append(prev,pageLabel,next);
 function updateAlphabet(){const keys=['All',...['#',...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(l=>groups.has(l))];alphabet.replaceChildren();
 for(const l of keys){const b=document.createElement('button');b.type='button';b.textContent=l;b.dataset.letter=l;b.addEventListener('click',()=>{active=l;page=1;render()});alphabet.append(b)}}updateAlphabet();
 function render(){
  const q=clean(search.value),filtered=rows.filter(r=>(active==='All'||letter(r.name)===active)&&matchesDirectory(r,q)).sort((a,b)=>a.name.localeCompare(b.name));
  const pages=Math.max(1,Math.ceil(filtered.length/perPage));page=Math.min(page,pages);status.textContent=filtered.length.toLocaleString()+' / '+rows.length.toLocaleString()+' entries';for(const b of alphabet.children)b.setAttribute('aria-pressed',String(b.dataset.letter===active));
  body.replaceChildren();const visible=filtered.slice((page-1)*perPage,page*perPage);const sectionGroups=new Map();for(const r of visible){const l=letter(r.name);if(!sectionGroups.has(l))sectionGroups.set(l,[]);sectionGroups.get(l).push(r)}
  for(const [l,group] of sectionGroups){const section=document.createElement('section');section.className='aqwc-index-section';const title=document.createElement('h3');title.textContent=l;const grid=document.createElement('div');grid.className='aqwc-index-grid';for(const r of group){const a=document.createElement('a');a.className='aqwc-index-entry';a.href=r.url;const name=document.createElement('span');name.textContent=r.name.replace(/\s*\((?:0\s*AC|AC|Non-AC|Legend|Seasonal|Rare|Pseudo-Rare|Special Offer|Free Player)\)/gi,'').trim()||r.name;const badges=document.createElement('span');badges.className='aqwc-index-badges';badges.append(...coloredBadges(r.anchor,r.tags));a.append(name,badges);grid.append(a)}section.append(title,grid);body.append(section)}
  if(!visible.length){const p=document.createElement('p');p.textContent=exactPending?'Checking exact item name…':loading?'Searching remaining Wiki pages…':[...knownPages].some(n=>!loadedPages.has(n))?'No matches in loaded pages. Load remaining Wiki pages to finish searching.':'No matching entries.';body.append(p)}
  prev.disabled=page===1;next.disabled=page===pages;pageLabel.textContent='Page '+page+' / '+pages;nav.hidden=pages===1;
 }
 search.addEventListener('input',()=>{active='All';page=1;render();clearTimeout(searchTimer);exactController?.abort();exactPending=false;render();const q=clean(search.value),rev=++exactRevision;if(q.length>=2){hydrateCached();updateAlphabet();updateCoverage();render();searchTimer=setTimeout(()=>{if(q.length>=4&&!rows.some(r=>searchKey(r.name)===searchKey(q))&&exactCandidates(q,directoryPath(location.pathname)).length){exactController=new AbortController();exactPending=true;render();lookupExactDirectory(q,directoryPath(location.pathname),location.origin,exactController.signal,r=>{if(rev!==exactRevision)return;mergePage({entries:[r],pages:[]});updateAlphabet();render()}).finally(()=>{if(rev===exactRevision){exactPending=false;render()}})}loadAll()},180)}});prev.addEventListener('click',()=>{page--;render();toolbar.scrollIntoView({block:'nearest'})});next.addEventListener('click',()=>{page++;render();toolbar.scrollIntoView({block:'nearest'})});
 host.append(toolbar,coverage,filters,alphabet,body,nav);content.before(host);content.classList.add('aqwc-index-source');render();document.getElementById('main-content')?.classList.add('aqwc-directory-aligned');document.getElementById('aqwc-list-wishlist')?.remove();
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
globalThis.AQWCDirectory=Object.freeze({indexKind,rowName,runs,entry,directoryEntries,letter,mapSectionName,mapSections,tagLabels,nameTags,factionName,factionHeading,searchUrl,isMapOverviewSection,directoryPath,searchKey,matchesDirectory,paginationLinks,pageNumber,exactCandidates,lookupExactDirectory,readWikiHtml,categoryIconKey,categoryImageUrl,homepageIcons,categorySpriteIndex,addCategoryIcon,categorySubIcons});
if(typeof document!=='undefined'){try{init()}finally{globalThis.AQWCWikiBoot?.layoutReady()}}
})();
