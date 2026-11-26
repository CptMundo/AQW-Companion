/* Boost Finder — experimental, linked Wiki index, no per-item crawling.
 * Source: https://aqwwiki.wikidot.com/boosted-items-sorted-by-boost (CC BY-SA 3.0).
 * Progression icons: owner-supplied game screenshot. Damage glyphs: fan-made.
 */
(()=>{
'use strict';
const origin='https://aqwwiki.wikidot.com',source='/boosted-items-sorted-by-boost',cacheKey='aqwc-boost-index-v1';
const labels={all:'All Monsters',tagged:'All Tagged',chaos:'Chaoskind',dragon:'Dragonkind',elemental:'Elementalkind',human:'Humankind',undead:'Undeadkind',drakath:'Drakathkind',orc:'Orckind',cp:'Class Points',gold:'Gold',rep:'Reputation',xp:'Experience'};
const tagged=['chaos','dragon','elemental','human','undead'],progress=['cp','gold','rep','xp'];
const categories={'Armors':'armors','Capes & Back Items':'capes-back-items','Helmets & Hoods':'helmets-hoods','Pets':'pets','Weapons':'weapons'};
const types=Object.fromEntries(Object.entries(categories).map(([a,b])=>[b,a]));
const clean=s=>String(s||'').replace(/\s+/g,' ').trim(),norm=s=>clean(s).toLowerCase();
function keys(s){const l=norm(s);return l==='all 4'?progress:l==='all tagged'?['tagged',...tagged]:Object.keys(labels).filter(k=>[norm(labels[k]),norm(labels[k]+' Boost')].includes(l))}
function slug(href){try{const u=new URL(href,origin);return u.origin===origin&&!u.hash&&!u.search&&/^\/[a-z0-9][a-z0-9-]{0,199}\/?$/.test(u.pathname)?u.pathname.replace(/^\/|\/$/g,''):null}catch{return null}}
function notes(text){
 const out={};const set=(k,v)=>{if(v>0&&v<=1000)out[k]=Math.max(out[k]||0,v)};
 for(const s of String(text||'').split(/[!?\n]+|\.(?!\d)/)){
  const d=s.match(/(\d+(?:\.\d+)?)\s*%\s*(?:more|extra|increased)?\s*damage\s+(?:to|against)\s+(.+)/i);
  if(d){const t=norm(d[2]),v=Number(d[1]);if(/\ball monsters\b/.test(t))set('all',v);else if(/\ball tagged\b/.test(t)){set('tagged',v);for(const k of tagged)set(k,v)}else for(const k of [...tagged,'drakath','orc'])if(new RegExp('\\b'+k+'(?:kind|s|kin)?\\b').test(t))set(k,v)}
  const p=s.match(/(?:gives?|grants?|gain|earn|receive|increases?)\s+(\d+(?:\.\d+)?)\s*%\s*(?:more|extra|increased|bonus)?\s*([a-z, &]+?)(?:\s+when equipped|\s+while equipped|$)/i);
  if(p){const t=norm(p[2]),v=Number(p[1]);if(/\b(?:class points|cp)\b/.test(t))set('cp',v);if(/\bgold\b/.test(t))set('gold',v);if(/\b(?:rep|reputation)\b/.test(t))set('rep',v);if(/\b(?:xp|exp|experience)\b/.test(t))set('xp',v)}
 }return out;
}
function parseRows(rows,ks,category){
 let pct=0;const out=[];
 for(const row of rows){const m=clean(row.text).match(/^(\d+(?:\.\d+)?)\s*%$/);if(m){pct=Number(m[1]);continue}
 if(!pct||pct>1000||row.links.length!==1)continue;
 const a=row.links[0],id=slug(a.href),name=clean(a.name).replace(/\s+\((?:Default|Fixed|Static|High|Medium|Other)(?:,[^)]*)?\)$/i,'');
 if(!id||!name||name.length>350||/^(?:back to top|next|previous|click here|here)$/i.test(name))continue;
 out.push({slug:id,name,category,boost:Object.fromEntries(ks.map(k=>[k,pct])),flags:row.flags||[]});
 }return out;
}
function lines(root){
 let row={text:'',links:[],flags:[]};const out=[];
 const flush=()=>{if(clean(row.text)||row.links.length)out.push(row);row={text:'',links:[],flags:[]}};
 function walk(n){if(n.nodeType===3){row.text+=n.nodeValue||'';return}if(n.nodeType!==1)return;
 const t=n.tagName;if(['SCRIPT','STYLE','FORM','BUTTON'].includes(t)||n.classList.contains('yui-nav'))return;
 if(t==='BR'){flush();return}
 if(t==='IMG'){const src=norm(n.getAttribute('src'));for(const [flag,file] of Object.entries({Legend:'legendsmall',Rare:'raresmall','Pseudo-Rare':'pseudosmall',Seasonal:'seasonalsmall','Special Offer':'specialsmall'}))if(src.includes('/'+file+'.'))row.flags.push(flag);return}
 if(t==='A'){const name=clean(n.textContent),href=n.getAttribute('href');if(name&&href){row.text+=name;row.links.push({name,href});return}}
 const block=/^(P|DIV|LI|TR|TD|TH|H[1-6]|UL|OL|TABLE|CENTER)$/.test(t);if(block)flush();for(const c of n.childNodes)walk(c);if(block)flush();
 }walk(root);flush();return out;
}
function merge(rows){const map=new Map();for(const r of rows){if(!map.has(r.slug))map.set(r.slug,{...r,boost:{},flags:[]});const a=map.get(r.slug);if(a.category!==r.category)continue;for(const [k,v] of Object.entries(r.boost))if(Object.hasOwn(labels,k)&&Number.isFinite(v)&&v>0&&v<=1000)a.boost[k]=Math.max(a.boost[k]||0,v);a.flags=[...new Set([...a.flags,...r.flags])]}return [...map.values()]}
function parseIndex(doc){
 const root=doc.getElementById('page-content');if(!root)return [];const rows=[],headings=[...root.querySelectorAll('h1,h2,h3')];
 for(const tab of root.querySelectorAll('.yui-navset')){
 const nav=tab.querySelector(':scope > .yui-nav'),body=tab.querySelector(':scope > .yui-content');if(!nav||!body)continue;
 const names=[...nav.children].map(x=>clean(x.textContent)),panes=[...body.children];if(names.length!==panes.length||!names.every(n=>keys(n).length))continue;
 const h=headings.filter(h=>(h.compareDocumentPosition(tab)&4)&&!tab.contains(h)).reverse().find(h=>Object.hasOwn(categories,clean(h.textContent)));if(!h)continue;
 panes.forEach((p,i)=>rows.push(...parseRows(lines(p),keys(names[i]),categories[clean(h.textContent)])));
 }
 for(const block of root.querySelectorAll('.collapsible-block')){
 const h=block.querySelector(':scope > .collapsible-block-folded, :scope > .collapsible-block-unfolded > .collapsible-block-unfolded-link'),s=norm(h?.textContent),k=s.includes('damage to drakathkind')?'drakath':s.includes('damage to orckind')?'orc':null;
 const p=block.querySelector(':scope > .collapsible-block-unfolded > .collapsible-block-content');if(k&&p)rows.push(...parseRows(lines(p),[k],'weapons'));
 }return merge(rows);
}
function filter(rows,{query='',boosts=[],min=0,category='',availability='',ownership='',owned={},sort='highest'}={}){
 const value=r=>boosts.length?Math.min(...boosts.map(k=>r.boost[k]||0)):Math.max(0,...Object.values(r.boost));
 return rows.filter(r=>norm(r.name).includes(norm(query))&&(!category||category===r.category)&&(!availability||(availability==='unrestricted'?!r.flags.length:r.flags.includes(availability)))&&(!ownership||owned[r.slug]===ownership)&&value(r)>0&&value(r)>=min).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):sort==='lowest'?value(a)-value(b)||a.name.localeCompare(b.name):value(b)-value(a)||a.name.localeCompare(b.name));
}
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n};
const ns='http://www.w3.org/2000/svg';
const sprite='data:image/webp;base64,UklGRmIFAABXRUJQVlA4IFYFAAAQGQCdASqQACQAPtlgqE4oJaOiKrccAQAbCWoAs3fxAFnoWZLeep9Zz4hVnE/ZAQHt9zmFnXftEGfijV8mnHcOKTm3szKnkdFPk0wCLlJPsRbmj9qf/JMrs+PrncGgKx87s4EttLg3aW4rVadiyDqVJa5Esy5y+0FDSYJD/vVcCRbF3wIUxBOrWT8aatkInxIzoJ087p0T7odKAJSPotOv89/toyEDsh7ggLALz8kBVJRNT1mSJtDKHeHEkt9xLCMevgBZeHAYb9fJ7dbaDm4LnAD+93TNzwT4nvUJ21VZCM6rGPHBZWinn9OlXENaze2n2v7g5Wc2U8qEk3RqV+GCpXYqCdBtK74FBLtKLfhIC1V2XuIQi6ENeA3vFqV1n63zz037xV4Gi0Swh1NH5oAcNJQe5FxQq+qqxEwl/7Ankv4qCNnXOWZbdy+G5RpVV2acqNlP8yRefY6ZBHZlLJFGwKXGsI61RHP9rO2JOzFc+G1LydZfXb7f6c56kKGL2aIZxvUt7aoVFg4VkRsm/CotSJzSzACRpM+YIdx+lJmt+EcGgFphOo3Z8a+4tOrEy4GSY6zdCdO2jRazJmxsZT+j7kr59XLPAU3dNQV5Q7B7h+oj+yAMWzfXuY4IYLaffCCcDxCHOt93tgtY6I3/yNpKPe02dR+QD3wK0K0FdoqyUJEK67sjMdboxiSrXW3R9Mo799oMbIst2UPxWXueLwfK6irZ5V4mAjq2ZH7qeG6SCOlsjW/sls7kbE558S8QBeomJFe0QSbq/3PbJrJ+mQ2SL/Zy/eLmeMxtIMpq25R+1tbV7Wo9vA7BK1eA0F9hmIebXCTts8s+Pm+9oO0YzLX0W+kb1qFD/PT1Y6iiBk5/nmsL16q3LM488PiWRMJGrrl182hpMOO/orrfltuJjsUBCGj3eXLwqeUCg8O54E+5pJ++UnN7KOTTyhofp5uwzMgy3BNVWT8KiKHb2NFBhzFfJY3NzEY0Dn1p/91ntdy+j03OK0ddxbWlqLzIPvG0yX+xuD1nwAVZu+ekzIAhsmQA8WvNxYMH+QaIX6xTJ/CfO03VZnJPIDuCGDSpuHp0BIUCBrFHFZoq6jgoEqNcqoyfB1TF8sr5YDuncXkyX7Ior8QzTyzv7SGigl5KO6s5dPowf25ufYA/JNfDJ9jop+cdCErfy/KG6WYN2VldOdFbbn4t2wd1iN32EfnDxbICZWLbX7OtJwmqx1fX7uR7wdvxZhSexw0X0/OLk3bILFzIIhUutx2gE2Ez5ScF/ARspvQmBoR5HKmsklMLwgv46qIrjAyeOwZrUO2+4g/6PWh2Bhooye6vDtvS+oalSAeWtufglIyBtCwuBPZCw1zYGJ0191aHI5ai21utc2+GA1+lRXzSls7S0Dhn16v98bpniNkEpXRR8MaqHyB3SD2bxQu3nGG+9vP+m30KA3EEsQbahn8cQ9F+0t7nmqd3GlrAbNIJXVcpl8gYefeb7F2goBWd03pzDerCg2Y1SgIaE7voY5c/5R09QymyMzleZLRHEuIt2BBxPt/tNdB1skGTkt++7oF8qJDWZhH/AIhltiob3jnA3dPBY+KmDB2Gokqx/Ez+1blRJY9SUDX2ktL/87NtyaKh9/bv9HDWnp54otAOxgcInDGuPFgm74STq6uMPoTJ60kIvSZfPdJMH0C+aQzTdZRc6jDeU/zg0z8wNC6qG8WHVwnArUHmEiGYZOV3LvtQ1xzcC/QM+tRhXAQijoEH3gEgTG/Q+solwHVB2js5DFr35HPnzYVQXmP+JMuCIH5KYFCfJZj5zMa1U3Y8UCbekBB5AAAA';
function icon(k){const p=progress.indexOf(k);if(p>=0){const x=el('span',null,'glyph');x.style.backgroundImage='url("'+sprite+'")';x.style.backgroundSize='400% 100%';x.style.backgroundPosition=(p/3*100)+'% 50%';x.setAttribute('aria-hidden','true');return x}
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 36 36');svg.setAttribute('class','glyph');svg.setAttribute('aria-hidden','true');
 function shape(tag,attrs){const n=document.createElementNS(ns,tag);for(const [a,b] of Object.entries(attrs))n.setAttribute(a,b);svg.append(n);return n}
 shape('rect',{x:1,y:1,width:34,height:34,rx:7,fill:'#301319',stroke:'#696169','stroke-width':2});shape('rect',{x:4,y:4,width:28,height:28,rx:4,fill:'#a52a30'});shape('path',{d:'M18 5L20 14 29 8 24 18 32 23 21 24 18 32 15 24 5 27 11 18 5 10 15 13Z',fill:'#e96248'});shape('path',{d:'M7 24L10 20 14 23 25 8 29 7 28 12 17 26 20 29 17 31 12 26 8 30 5 27Z',fill:'#fff0c1',stroke:'#24150d','stroke-width':1.8,'stroke-linejoin':'round'});shape('path',{d:'M24 30V23H20L27 16 34 23H30V30Z',fill:'#85c940',stroke:'#263d0d','stroke-width':1});
 if(k!=='all'){shape('circle',{cx:9,cy:9,r:8,fill:'#21171d',stroke:'#ecd294'});if(k==='undead'){shape('path',{d:'M3 8Q3 2 9 2T15 8L13 11 12 15H6L5 11Z',fill:'#f5edcf'});shape('circle',{cx:6,cy:8,r:1.5,fill:'#21171d'});shape('circle',{cx:12,cy:8,r:1.5,fill:'#21171d'});shape('path',{d:'M9 10L8 12H10Z',fill:'#21171d'})}else{const emblems={
 tagged:'M9 2L11 6 16 7 12 10 13 15 9 12 5 15 6 10 2 7 7 6Z',
 chaos:'M9 2L11 5 15 3 14 7 17 9 13 11 15 15 11 13 9 17 7 13 3 15 5 11 1 9 5 7 3 3 7 5Z',
 dragon:'M3 15L4 8 2 3 8 6 12 2 12 6 16 9 13 11 9 10 7 15Z',
 elemental:'M10 1L3 10H8L6 17 15 7H10L12 1Z',
 human:'M9 2A4 4 0 1 1 9 10A4 4 0 1 1 9 2ZM2 16Q3 10 9 10T16 16Z',
 drakath:'M2 4L6 8 9 2 12 8 16 4 14 14H4Z',
 orc:'M3 4L6 6 12 6 15 4 15 12 12 15H6L3 12Z'
 };shape('path',{d:emblems[k],fill:k==='chaos'?'#cb9afa':k==='orc'?'#a8d05e':'#fff0c1',stroke:'#17151b','stroke-width':'.6','stroke-linejoin':'round'});if(k==='dragon')shape('circle',{cx:12,cy:7,r:1,fill:'#321719'});if(k==='orc'){shape('path',{d:'M5 13L5 9 8 13M10 13L13 9 13 13Z',fill:'#fff0c1'});shape('path',{d:'M5 8L7 9M13 8L11 9',stroke:'#231d15','stroke-width':1.4})}if(k==='chaos')shape('circle',{cx:9,cy:9,r:2.5,fill:'#231629'});}}
 return svg;
}

function showChips(node,boost){
 for(const [k,v] of Object.entries(boost)){
 if(!Object.hasOwn(labels,k)||tagged.includes(k)&&v===boost.tagged)continue;
 const b=el('span',null,'chip');b.title='+'+v+'% '+labels[k];b.setAttribute('aria-label',b.title);b.append(icon(k),el('span','+'+v+'%'));node.append(b)
 }
}
function itemTag(img){
 const v=String(img.getAttribute('src')||'')+' '+String(img.getAttribute('alt')||'')+' '+String(img.getAttribute('title')||'');
 return /(?:^|[\/\s])(?:ac(?:small|large|tag)?|legend(?:small|large)?|rare(?:small|large)?|pseudo(?:small|large)?|seasonal(?:small|large)?|special(?:small|large)?)(?:\.[a-z]+|\s|$)/i.test(v)
}
globalThis.AQWCBoosts=Object.freeze({labels,keys,slug,notes,parseRows,parseIndex,merge,filter,icon,showChips,itemTag});
if(typeof document==='undefined'||location.origin!==origin)return;
const content=document.getElementById('page-content'),title=document.getElementById('page-title');
if(!content||!title)return;
const itemText=String(globalThis.AQWCOriginalItemText||content.textContent||content.innerText||''),isItem=/\bSellback\s*:/i.test(itemText)&&/\bDescription\s*:/i.test(itemText),path=location.pathname.replace(/^\/|\/$/g,'');
const style='.chips{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;vertical-align:middle}.chip{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;font:700 12px/1.4 system-ui,sans-serif;padding:3px 5px;border:1px solid #7297b3;border-radius:5px}.glyph{display:inline-block;width:26px;height:26px;flex:none;background-repeat:no-repeat;vertical-align:middle}.compact .chip{font-size:10px;padding:1px 3px}.compact .glyph{width:18px;height:18px}';
function mount(host,boost,compact=false){const shadow=host.attachShadow({mode:'closed'}),css=el('style',style),wrap=el('span',null,'chips'+(compact?' compact':''));shadow.append(css,wrap);showChips(wrap,boost);return wrap}
let itemWrap=null;
function mountItemChips(boost){
 if(!isItem||!Object.keys(boost).length)return;
 if(itemWrap){itemWrap.replaceChildren();showChips(itemWrap,boost);return}
 const info=content.querySelector('.aqwc-item-info')||content.querySelector('.aqwc-item-native-section');if(!info)return;
 let row=info.querySelector('.aqwc-item-tags');
 if(!row){row=el('div',null,'aqwc-item-tags');const heading=info.querySelector('.aqwc-item-section-label');if(heading)heading.after(row);else info.prepend(row)}
 const host=el('span');host.id='aqwc-item-boosts';host.style.cssText='display:inline-flex;vertical-align:middle;margin:0;max-width:100%';
 itemWrap=mount(host,boost);row.append(host);
}
if(isItem)mountItemChips(notes(itemText));
// All Wiki pages use the bundled public snapshot, not remote Wiki requests.
// Only relevant item lists are annotated; no inventory lookup or Finder UI.
const categoryList=globalThis.AQWCListOwnership?.categoryFor(location.pathname)||globalThis.AQWCListOwnership?.categoryFor('/'+path.split('/p/')[0]);
if((isItem||categoryList||/^(search|search-items-by-tag)(?:\/|$)/.test(path))&&typeof chrome!=='undefined'){
 fetch(chrome.runtime.getURL('boost-index.json')).then(r=>{if(!r.ok)throw Error('Boost catalog unavailable');return r.json()}).then(data=>{
 if(!Array.isArray(data.rows))return;
 const index=new Map(data.rows.map(r=>[r.slug,r]));
 const current=index.get(path);if(isItem&&current)mountItemChips({...current.boost,...notes(itemText)});
 if(!categoryList&&!/^(search|search-items-by-tag)(?:\/|$)/.test(path))return;
 for(const a of [...content.querySelectorAll('a[href]')].slice(0,1200)){
  const r=index.get(slug(a.getAttribute('href')));if(!r||!clean(a.textContent)||a.querySelector('img')||a.nextElementSibling?.classList.contains('aqwc-inline-boost'))continue;
  const span=el('span',null,'aqwc-inline-boost');span.style.cssText='display:inline-flex;margin:0 4px;vertical-align:middle';mount(span,r.boost,true);a.after(span);
 }
 }).catch(()=>{});
}
})();
