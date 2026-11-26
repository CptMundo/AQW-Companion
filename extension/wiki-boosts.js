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
globalThis.AQWCBoosts=Object.freeze({labels,keys,slug,notes,parseRows,parseIndex,merge,filter});
if(typeof document==='undefined'||location.origin!==origin)return;
const content=document.getElementById('page-content'),title=document.getElementById('page-title');if(!content||!title||document.getElementById('aqwc-boost-finder'))return;
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n};
const host=el('div');host.id='aqwc-boost-finder';host.style.cssText='display:block;margin:8px 0';
const shadow=host.attachShadow({mode:'closed'}),css=el('style');
css.textContent='.panel{font:600 13px/1.45 system-ui,sans-serif;padding:10px;border:1px solid #456078;border-radius:10px;background:#142b3e;color:#e5f5ff;box-sizing:border-box}.toolbar,.chips,.row,.controls,.group{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.toolbar{justify-content:space-between}.controls,.group{margin:8px 0}button,select,input{font:inherit;border:1px solid #7297b3;border-radius:6px;background:#203d55;color:#f1f8ff;padding:6px;box-sizing:border-box}button{cursor:pointer}button:disabled{opacity:.5;cursor:default}button[aria-pressed=true]{outline:2px solid #4fbde8}.chip{display:inline-flex;gap:4px;align-items:center;white-space:nowrap;font-weight:700}.glyph{display:inline-block;width:28px;height:28px;flex:none;background-repeat:no-repeat;vertical-align:middle}.row{border-top:1px solid #8295a455;padding:7px 0}.name{flex:1;min-width:160px}a{color:inherit;text-decoration:underline}.meta{font-size:11px;opacity:.85}.status{font-weight:400;margin:6px 0}.list{max-height:520px;overflow:auto}[hidden]{display:none!important}.pager{margin-top:8px;display:flex;gap:8px;align-items:center}.group button{display:flex;gap:4px;align-items:center}';
if(globalThis.AQWCTheme?.recolor)css.textContent=globalThis.AQWCTheme.recolor(css.textContent);
shadow.append(css);const panel=el('section',null,'panel'),bar=el('div',null,'toolbar'),chips=el('div',null,'chips'),open=el('button','Boost Finder'),detail=el('div');open.type='button';open.setAttribute('aria-expanded','false');detail.hidden=true;bar.append(open,el('span','Find boosted equipment','meta'));panel.append(bar,chips,detail);shadow.append(panel);title.after(host);
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
let rows=[],loaded=false,loading=false,page=0,selected=new Set(),ownership={};
const groups=el('div'),controls=el('div',null,'controls'),status=el('div',null,'status'),list=el('div',null,'list'),pager=el('div',null,'pager');status.setAttribute('role','status');
const credit=el('a','Wiki boost index · CC BY-SA 3.0');credit.href=origin+source;credit.target='_blank';credit.rel='noopener noreferrer';
detail.append(groups,controls,status,list,pager,el('div','All Tagged excludes Drakathkind, Orckind and untagged monsters. Same-type item boosts do not add together.','meta'),credit);
function select(opts,label){const n=el('select');n.setAttribute('aria-label',label);for(const [v,t] of opts){const o=el('option',t);o.value=v;n.append(o)}n.addEventListener('change',()=>{page=0;render()});return n}
const query=el('input');query.type='search';query.placeholder='Item name';query.setAttribute('aria-label','Item name');query.addEventListener('input',()=>{page=0;render()});
const category=select([['','All equipment'],...Object.entries(types)],'Equipment'),minimum=el('input');minimum.type='number';minimum.min='0';minimum.max='1000';minimum.value='0';minimum.style.width='80px';minimum.setAttribute('aria-label','Minimum boost percent');minimum.addEventListener('input',()=>{page=0;render()});
const availability=select([['','All availability'],['unrestricted','No listed restriction'],...['Legend','Rare','Pseudo-Rare','Seasonal','Special Offer'].map(x=>[x,x])],'Availability');
const own=select([['','All ownership'],['owned','Owned'],['not-found','Not in snapshot'],['ambiguous','Ambiguous']],'Ownership');own.disabled=true;
const sort=select([['highest','Highest boost'],['lowest','Lowest boost'],['name','Name A–Z']],'Sort');
const check=el('button','Check ownership');check.type='button';check.disabled=true;
check.addEventListener('click',async e=>{if(!e.isTrusted||check.disabled)return;check.disabled=true;own.disabled=true;own.value='';ownership={};let stamp=null,exp=null,done=0;try{
 for(const cat of Object.keys(types)){const items=rows.filter(r=>r.category===cat);for(let i=0;i<items.length;i+=80){const chunk=items.slice(i,i+80),names=[...new Set(chunk.map(r=>r.name))];const r=await chrome.runtime.sendMessage({type:'wiki-boost-lookup',category:cat,names});if(!r?.ok||!r.syncedAt||r.matches?.length!==names.length)throw Error('Sync inventory first, or reload the extension.');if(stamp&&(stamp!==r.syncedAt||exp!==r.exportedAt))throw Error('Inventory changed during check. Try again.');stamp=r.syncedAt;exp=r.exportedAt;for(const item of chunk)ownership[item.slug]=rows.filter(x=>x.category===cat&&norm(x.name)===norm(item.name)).length>1?'ambiguous':r.matches[names.indexOf(item.name)].state;done+=chunk.length;status.textContent='Checking ownership '+done+'/'+rows.length;await new Promise(r=>setTimeout(r,20));}}
 own.disabled=false;check.textContent='Refresh ownership';page=0;render()
 }catch(err){ownership={};render();status.textContent=String(err.message||err)}finally{check.disabled=false}});
const reset=el('button','Reset');reset.type='button';reset.addEventListener('click',()=>{selected.clear();query.value='';category.value='';minimum.value='0';availability.value='';own.value='';sort.value='highest';page=0;render()});
controls.append(query,category,el('span','Min %'),minimum,availability,own,sort,check,reset);
const buttons={};for(const [name,ks] of [['Damage boosts',Object.keys(labels).filter(k=>!progress.includes(k))],['Progression boosts',progress]]){groups.append(el('div',name,'meta'));const group=el('div',null,'group');for(const k of ks){const b=el('button');b.type='button';b.append(icon(k),el('span',labels[k]));b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{if(selected.has(k))selected.delete(k);else selected.add(k);page=0;render()});buttons[k]=b;group.append(b)}groups.append(group)}
function showChips(node,boost,click){for(const [k,v] of Object.entries(boost)){if(!Object.hasOwn(labels,k)||tagged.includes(k)&&v===boost.tagged)continue;const b=el(click?'button':'span',null,'chip');b.title='+'+v+'% '+labels[k];b.setAttribute('aria-label',b.title);b.append(icon(k),el('span','+'+v+'%'));if(click){b.type='button';b.addEventListener('click',()=>{selected.clear();selected.add(k);page=0;show();render()})}node.append(b)}}
const itemText=String(globalThis.AQWCOriginalItemText||content.textContent||content.innerText||''),isItem=/\bSellback\s*:/i.test(itemText)&&/\bDescription\s*:/i.test(itemText),path=location.pathname.replace(/^\/|\/$/g,'');
function mountItemChips(){
 if(!isItem||!chips.children.length||document.getElementById('aqwc-item-boosts'))return;
 const info=content.querySelector('.aqwc-item-info')||content.querySelector('.aqwc-item-native-section');
 if(!info)return;
 const itemHost=el('div');itemHost.id='aqwc-item-boosts';itemHost.style.cssText='display:block;margin:8px 0';
 const itemShadow=itemHost.attachShadow({mode:'closed'});itemShadow.append(css.cloneNode(true));
 const label=el('div','Equipment boosts','meta');label.style.marginBottom='5px';itemShadow.append(label,chips);
 const first=info.querySelector('.aqwc-item-section-label');if(first)first.after(itemHost);else info.prepend(itemHost);
}
if(isItem){showChips(chips,notes(itemText),true);mountItemChips()}
function annotate(){const r=rows.find(r=>r.slug===path);if(r&&isItem){chips.replaceChildren();showChips(chips,{...notes(itemText),...r.boost},true);mountItemChips()}if(location.pathname===source)return;const map=new Map(rows.map(r=>[r.slug,r]));for(const a of [...content.querySelectorAll('a[href]')].slice(0,1200)){const r=map.get(slug(a.getAttribute('href')));if(!r||!clean(a.textContent)||a.querySelector('img')||a.nextElementSibling?.classList.contains('aqwc-inline-boost'))continue;const span=el('span',null,'aqwc-inline-boost');span.style.cssText='display:inline-flex;margin:0 4px;vertical-align:middle;font:600 11px system-ui';const s=span.attachShadow({mode:'closed'});s.append(el('style','.glyph{display:inline-block;width:18px;height:18px;background-repeat:no-repeat;vertical-align:middle}.chip{display:inline-flex;align-items:center;gap:2px;margin-right:4px}'));const wrap=el('span');showChips(wrap,r.boost,false);s.append(wrap);a.after(span)}}
function render(){for(const [k,b] of Object.entries(buttons))b.setAttribute('aria-pressed',String(selected.has(k)));if(!loaded)return;list.replaceChildren();pager.replaceChildren();const results=filter(rows,{query:query.value,boosts:[...selected],min:Math.max(0,Number(minimum.value)||0),category:category.value,availability:availability.value,ownership:own.value,owned:ownership,sort:sort.value});page=Math.min(page,Math.max(0,Math.ceil(results.length/40)-1));status.textContent=results.length+' matching linked items · '+rows.length+' indexed · '+(selected.size>1?'all selected boosts required':'Wiki coverage may be incomplete');for(const r of results.slice(page*40,page*40+40)){const row=el('div',null,'row'),name=el('div',null,'name'),a=el('a',r.name);a.href=origin+'/'+r.slug;name.append(a,el('div',[types[r.category],...r.flags,ownership[r.slug]||''].filter(Boolean).join(' · '),'meta'));const b=el('div',null,'chips');showChips(b,r.boost,false);row.append(name,b);const data={name:r.name,slug:r.slug,category:r.category},target=globalThis.AQWCWikiWishlist?.target(data);if(target&&!target.variant){const add=el('button','+');add.type='button';add.title='Add to Wishlist';add.setAttribute('aria-label','Add '+r.name+' to Wishlist');add.addEventListener('click',async e=>{if(!e.isTrusted||add.disabled)return;add.disabled=true;try{const x=await chrome.runtime.sendMessage({type:'wishlist-queue-add',item:data});if(!x?.ok)throw Error(x?.error||'Could not save');add.textContent='✓';add.title='Saved to Wishlist queue'}catch(err){add.disabled=false;status.textContent=String(err.message||err)}});row.append(add)}list.append(row)}for(const [t,d] of [['Previous',-1],['Next',1]]){const b=el('button',t);b.type='button';b.disabled=d<0?page===0:(page+1)*40>=results.length;b.addEventListener('click',()=>{page+=d;render();list.scrollTop=0});pager.append(b)}pager.append(el('span','Page '+(page+1)+' / '+Math.max(1,Math.ceil(results.length/40)),'meta'))}
function cached(){try{const c=JSON.parse(sessionStorage.getItem(cacheKey)||'null');if(!c||Date.now()-c.at>3600000||!Array.isArray(c.rows)||c.rows.length>10000)return [];return c.rows.filter(r=>r&&slug('/'+r.slug)===r.slug&&typeof r.name==='string'&&r.name.length<=350&&Object.hasOwn(types,r.category)&&r.boost&&Array.isArray(r.flags)).map(r=>({...r,flags:r.flags.filter(x=>typeof x==='string'&&x.length<30),boost:Object.fromEntries(Object.entries(r.boost).filter(([k,v])=>Object.hasOwn(labels,k)&&Number.isFinite(v)&&v>0&&v<=1000))}))}catch{return []}}
async function load(){if(loaded||loading)return;loading=true;status.textContent='Reading Wiki boost index…';try{rows=cached();if(!rows.length){let doc;if(location.pathname.replace(/\/$/,'')===source)doc=document;else{const r=await fetch(origin+source,{credentials:'omit',signal:AbortSignal.timeout(15000)});if(!r.ok||new URL(r.url).origin!==origin)throw Error('Wiki returned '+r.status);doc=new DOMParser().parseFromString(await r.text(),'text/html')}rows=parseIndex(doc);if(!rows.length)throw Error('No supported boost rows found. The Wiki layout may have changed.');try{sessionStorage.setItem(cacheKey,JSON.stringify({at:Date.now(),rows}))}catch{}}loaded=true;check.disabled=false;annotate();render()}catch(err){status.textContent=String(err.message||err)+' Use the original Wiki index or reopen to retry.'}finally{loading=false}}
function show(){detail.hidden=false;open.setAttribute('aria-expanded','true');load()}
open.addEventListener('click',()=>{if(detail.hidden)show();else{detail.hidden=true;open.setAttribute('aria-expanded','false')}});
rows=cached();if(rows.length){loaded=true;check.disabled=false;annotate();render()}
})();
