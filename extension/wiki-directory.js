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
 if(clean(el.textContent)!==name)return null;
 return name;
}
function runs(parent,origin){const out=[];let run=[];for(const node of parent.children){const name=rowName(node,origin);if(name)run.push({node,name});else{if(run.length>=2)out.push(run);run=[]}}if(run.length>=2)out.push(run);return out}
function init(){
 if(location.origin!=='https://aqwwiki.wikidot.com')return;const kind=indexKind(location.pathname),content=document.getElementById('page-content');if(!kind||!content||content.classList.contains('aqwc-directory'))return;
 if(kind==='categories'){
  const lists=[...content.children].filter(el=>el.tagName==='UL'&&el.children.length>=3);if(lists.length!==1)return;content.classList.add('aqwc-directory');lists[0].classList.add('aqwc-category-grid');return;
 }
 const parents=[content,...content.querySelectorAll('.list-pages-box,.list-pages-item,ul,ol,div')].filter(p=>!p.closest('table,.yui-navset,.collapsible-block,.pager,.pagination,#breadcrumbs,.breadcrumbs')&&p.children.length>=2);
 const groups=[],seen=new Set();for(const parent of parents)for(const run of runs(parent,location.origin)){if(run.some(x=>seen.has(x.node)))continue;for(const x of run)seen.add(x.node);groups.push({parent,run})}
 if(!groups.length)return;content.classList.add('aqwc-directory');
 for(const {parent,run} of groups){const grid=document.createElement(['UL','OL'].includes(parent.tagName)?'li':'div');grid.className='aqwc-directory-grid';if(grid.tagName==='LI'){grid.style.listStyle='none';const list=document.createElement(parent.tagName.toLowerCase());list.style.cssText='display:contents;list-style:none';grid.append(list);parent.insertBefore(grid,run[0].node);for(const row of run){row.node.classList.add('aqwc-directory-row');list.append(row.node)}grid.classList.add('aqwc-directory-list-grid')}else{parent.insertBefore(grid,run[0].node);for(const row of run){row.node.classList.add('aqwc-directory-row');grid.append(row.node)}}}
 const rows=groups.flatMap(g=>g.run);
 const toolbar=document.createElement('div');toolbar.className='aqwc-directory-toolbar';const input=document.createElement('input');input.type='search';input.placeholder='Filter this directory…';input.setAttribute('aria-label','Filter directory entries');const status=document.createElement('span');status.setAttribute('role','status');toolbar.append(input,status);
 const first=content.firstElementChild;if(first)content.insertBefore(toolbar,first);else content.append(toolbar);
 function filter(){const q=clean(input.value).toLowerCase();let count=0;for(const {node,name} of rows){node.hidden=!!q&&!name.toLowerCase().includes(q);if(!node.hidden)count++}for(const {run} of groups){const grid=run[0].node.closest('.aqwc-directory-grid');if(grid)grid.hidden=run.every(r=>r.node.hidden)}status.textContent=count.toLocaleString()+' / '+rows.length.toLocaleString()+' entries · original Wiki filters below'}
 input.addEventListener('input',filter);filter();
 for(const p of content.querySelectorAll('p')){const links=[...p.querySelectorAll('a[href^="#"]')];if(links.length>=10&&/^Go to\b/i.test(clean(p.textContent)))p.classList.add('aqwc-directory-jumps')}
}
globalThis.AQWCDirectory=Object.freeze({indexKind,rowName,runs});
if(typeof document!=='undefined')init();
})();
