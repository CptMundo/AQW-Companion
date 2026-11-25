const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const manifest=JSON.parse(read('extension/manifest.json'));
assert.equal(manifest.manifest_version,3);
assert.deepEqual(manifest.content_scripts[0].matches,['https://cptmundo.github.io/AQW-Companion/extension-connect.html']);
assert.deepEqual(manifest.permissions,['storage','activeTab','scripting']);assert.equal(manifest.background.service_worker,'worker.js');assert.deepEqual(manifest.content_scripts[1].matches,['https://cptmundo.github.io/AQW-Companion/','https://cptmundo.github.io/AQW-Companion/index.html']);assert.equal(manifest.host_permissions,undefined);
const origin='https://cptmundo.github.io', pathname='/AQW-Companion/extension-connect.html';
const sent=[],listeners={};const win={addEventListener(k,f){listeners[k]=f},postMessage(msg,target){sent.push({msg,target})}};
const ctx={window:win,location:{origin,pathname},chrome:{runtime:{getManifest:()=>manifest}}};
vm.runInNewContext(read('extension/bridge.js'),ctx);
const ping={channel:'aqwc-foundation',type:'ping',nonce:'a'.repeat(32)};
listeners.message({source:win,origin:'https://example.org',data:ping});assert.equal(sent.length,0);
listeners.message({source:{},origin,data:ping});assert.equal(sent.length,0);
listeners.message({source:win,origin,data:{...ping,type:'inventory'}});assert.equal(sent.length,0);
listeners.message({source:win,origin,data:{...ping,nonce:'bad'}});assert.equal(sent.length,0);
listeners.message({source:win,origin,data:ping});assert.equal(sent.length,1);assert.equal(sent[0].msg.type,'pong');assert.equal(sent[0].msg.nonce,ping.nonce);assert.equal(sent[0].target,origin);
let inserted=[];const doc={getElementById:id=>id==='aqwc-foundation-badge'?inserted[0]:id==='page-title'||id==='page-content'?{}:null,createElement:()=>({style:{}}),body:{prepend:x=>inserted.push(x)}};
const wiki={document:doc,window:win,location:{origin:'https://aqwwiki.wikidot.com',pathname:'/necrotic-sword-of-doom'},chrome:ctx.chrome};
vm.runInNewContext(read('extension/bridge.js'),wiki);vm.runInNewContext(read('extension/bridge.js'),wiki);
assert.equal(inserted.length,1);assert.equal(inserted[0].href,origin+pathname);
vm.runInNewContext(read('extension/bridge.js'),{...wiki,document:{...doc,getElementById:()=>null,createElement:()=>{throw Error('Error page must remain untouched')}}});
const status={dataset:{},textContent:''},button={addEventListener(k,f){this[k]=f}};let nextTimer,posted;
const pageWindow={addEventListener(k,f){this[k]=f},postMessage(msg,target){posted={msg,target}}};
vm.runInNewContext(read('extension-connect.js'),{window:pageWindow,location:{origin},document:{getElementById:id=>id==='connection-status'?status:button},crypto:{getRandomValues:a=>a.fill(7)},setTimeout:f=>{nextTimer=f;return 1},clearTimeout:()=>{nextTimer=null}});
button.click();assert.equal(status.dataset.state,'checking');assert.equal(posted.target,origin);
pageWindow.message({source:pageWindow,origin,data:{...posted.msg,type:'pong',nonce:'bad',version:'0.1.0'}});assert.equal(status.dataset.state,'checking');
pageWindow.message({source:pageWindow,origin,data:{...posted.msg,type:'pong',version:'0.1.0'}});assert.equal(status.dataset.state,'connected');
button.click();nextTimer();assert.equal(status.dataset.state,'missing');
assert.ok(read('index.html').includes('href="extension-connect.html"'));
console.log('Extension foundation: scope, handshake, wiki badge, timeout and navigation passed.');

(async()=>{
 const stored={},chromeMock={runtime:{getURL:x=>'chrome-extension://test/'+x,onMessage:{addListener(){}}},storage:{local:{async setAccessLevel(){},async set(obj){Object.assign(stored,obj)},async get(k){return {[k]:stored[k]}},async remove(k){delete stored[k]}}}};
 const api=vm.runInNewContext(read('extension/worker.js')+'\n({handle,cleanSnapshot})',{chrome:chromeMock,URL,TextEncoder});
 const row={ID:'1',Name:'Void Aura',Type:'Item',Count:750,Bank:1,secret:'must not persist'};
 const snap={exportedAt:'2026-11-24',items:[row]};
 const main={url:origin+'/AQW-Companion/',frameId:0},popup={url:'chrome-extension://test/popup.html'};
 assert.equal((await api.handle({type:'sync-inventory',snapshot:snap},{url:'https://aqwwiki.wikidot.com/x',frameId:0})).ok,false);
 assert.equal((await api.handle({type:'sync-inventory',snapshot:snap},{...main,frameId:1})).ok,false);
 assert.equal((await api.handle({type:'sync-inventory',snapshot:snap},{url:origin+'/other/',frameId:0})).ok,false);
 assert.equal((await api.handle({type:'sync-inventory',snapshot:snap},main)).count,1);
 assert.equal(stored['aqwc-inventory-v1'].items[0].secret,undefined);
 assert.equal(stored['aqwc-inventory-v1'].items[0].Count,750);
 assert.throws(()=>api.cleanSnapshot({exportedAt:'x',items:[{...row,Count:-1}]}));
 assert.throws(()=>api.cleanSnapshot({exportedAt:'x',items:Array(20001).fill(row)}));
 assert.equal((await api.handle({type:'inventory-summary'},main)).ok,false);
 assert.equal((await api.handle({type:'inventory-summary'},popup)).count,1);
 assert.equal((await api.handle({type:'clear-inventory'},popup)).ok,true);
 assert.equal((await api.handle({type:'inventory-summary'},popup)).count,null);
 const mainHtml=read('index.html');assert.ok(mainHtml.includes('id="aqwc-sync-inventory"'));assert.ok(mainHtml.includes("items:items.map(x=>({ID:x.ID,Name:x.Name,Type:x.Type,Count:x.Count,Bank:x.Bank}))"));
 assert.ok(read('extension/sync.js').includes('if(!event.isTrusted||pending)return'));
 console.log('Inventory sync: scope, sanitized snapshot, storage, summary and clear passed.');
})().catch(error=>{console.error(error);process.exitCode=1});

(async()=>{
 const stored={},chromeMock={runtime:{getURL:x=>'chrome-extension://test/'+x,onMessage:{addListener(){}}},storage:{local:{async setAccessLevel(){},async get(k){return {[k]:stored[k]}}}}};
 const api=vm.runInNewContext(read('extension/worker.js')+'\n({handle,matchWikiItem})',{chrome:chromeMock,URL,TextEncoder});
 const row=(ID,Name,Type,Count,Bank)=>({ID,Name,Type,Count,Bank});
 const snap={items:[row('1','Void Aura','Item',750,1),row('1','Void Aura','Item',25,0),row('2','Necrotic Sword of Doom','Sword',1,0),row('3','StoneCrusher','Class',1,0),row('4','Same Name','Sword',1,0),row('5','Same Name','Sword',1,1)],syncedAt:'2026-11-24',exportedAt:'2026-11-24'};
 const match=(name,category)=>api.matchWikiItem(snap,{name,category});
 assert.equal(match('Void Aura','misc-items').total,775);assert.equal(match('Void Aura','misc-items').bank,750);assert.equal(match('Void Aura','misc-items').inventory,25);
 assert.equal(match('Necrotic Sword of Doom (Sword)','swords').state,'owned');
 assert.equal(match('StoneCrusher (Merge)','classes').state,'ambiguous');
 assert.equal(match('Same Name','swords').state,'ambiguous');
 assert.equal(match('Unknown','swords').state,'not-found');
 assert.equal(match('Void Aura','shops').state,'unsupported');
 assert.equal(match('Void Aura','swords').state,'ambiguous');
 assert.equal(api.matchWikiItem(undefined,{name:'Void Aura',category:'misc-items'}).state,'unsynced');
 const msg={type:'wiki-item-lookup',query:{name:'Void Aura',category:'misc-items'}};
 stored['aqwc-inventory-v1']=snap;
 assert.equal((await api.handle(msg,{url:'https://evil.example/void-aura',frameId:0})).ok,false);
 assert.equal((await api.handle(msg,{url:'https://aqwwiki.wikidot.com/void-aura',frameId:1})).ok,false);
 const result=await api.handle(msg,{url:'https://aqwwiki.wikidot.com/void-aura',frameId:0});
 assert.equal(result.total,775);assert.equal(result.items,undefined);
 const runWiki=(crumbs,body='Sellback: 0 AC; Description: item',response=result,name='Void Aura',tags=[])=>{
  let request,inserted,closed;
  function el(){return {style:{},children:[],addEventListener(){},append(...x){this.children.push(...x)},attachShadow({mode}){closed=mode;return el()}}}
  const title={textContent:name,insertAdjacentElement(_,host){inserted=host}},content={textContent:body},crumb=crumbs===null?null:{querySelectorAll(){return crumbs.map(x=>typeof x==='string'?{href:'https://aqwwiki.wikidot.com/'+x}:{href:'https://aqwwiki.wikidot.com/'+x.slug,textContent:x.label})}};
  const doc={getElementById:id=>({'page-title':title,'page-content':content,'breadcrumbs':crumb}[id]||null),createElement:el,querySelectorAll:()=>tags.map(textContent=>({textContent}))};
  const context={URL,URLSearchParams,location:{origin:'https://aqwwiki.wikidot.com',pathname:'/void-aura',href:'https://aqwwiki.wikidot.com/void-aura'},document:doc,window:{addEventListener(){}},setInterval:()=>1,clearInterval(){},chrome:{runtime:{sendMessage(m,cb){if(m.type==='goal-status-read')return Promise.resolve({ok:true,state:'unknown'});request=m;cb(response)}}}};
  vm.runInNewContext(read('extension/wishlist-link.js'),context);vm.runInNewContext(read('extension/wiki-items.js'),context);
  return {request,inserted,closed};
 };
 assert.ok(runWiki(['items','misc-items']).inserted);
 assert.equal(runWiki(['items','misc-items']).closed,'closed');
 assert.equal(runWiki(['world','shops']).request,undefined);
 assert.equal(runWiki(['items','weapons'],'List of swords').request,undefined);
 assert.equal(runWiki(['items','swords'],'Void Aura usually refers to:').request,undefined);
 assert.ok(runWiki(['items','misc-items'],'Sellback: 0 AC; Description: item',{ok:true,state:'unsupported'}).inserted);
 assert.ok(runWiki(['items','misc-items'],'Sellback: 0 AC; Description: item',{ok:false}).inserted);
 assert.equal(runWiki(null,'Sellback: 0 AC\nType: Item\nDescription: Material').request.query.category,'misc-items');
 assert.equal(runWiki(null,'Sellback: 0 AC\nBase Damage: 27-33\nDescription: Sword',result,'Necrotic Sword of Doom (Sword)').request.query.category,'swords');
 assert.equal(runWiki([{slug:'items',label:'Items'},{slug:'category-alias',label:'Misc. Items'}]).request.query.category,'misc-items');
 assert.equal(runWiki(null,'Sellback: 0 AC\nDescription: Gear',result,'Sword',['sword']).request.query.category,'swords');
 assert.equal(runWiki(['world','shops'],'Sellback: 0 AC\nType: Item\nDescription: Shop').request,undefined);
 assert.equal(runWiki(null,'Sellback: 0 AC\nDescription: Unknown').inserted,undefined);
 assert.equal(runWiki(null,'Sellback: 0 AC\nDescription: Unknown').request,undefined);
 assert.equal(runWiki(['items','houses'],'Sellback: 0 AC; Description: House',result,'Astral Beach Tent (AC)').inserted,undefined);
 assert.equal(manifest.version,'0.12.31');assert.equal(manifest.content_scripts.length,4);assert.equal(manifest.content_scripts[2].run_at,'document_end');assert.equal(manifest.content_scripts[3].run_at,'document_start');assert.deepEqual(manifest.content_scripts[3].js,['wiki-first-paint.js']);assert.deepEqual(manifest.content_scripts[3].matches,['https://aqwwiki.wikidot.com/*']);assert.deepEqual(manifest.content_scripts[2].matches,['https://aqwwiki.wikidot.com/*']);assert.deepEqual(manifest.content_scripts[2].js,['companion-theme.js','wiki-theme.js','bridge.js','wishlist-link.js','wiki-materials.js','wiki-list-ownership.js','wiki-items.js','wiki-quest-shop.js','wiki-directory.js']);
 console.log('Wiki item lookup: quantities, category scope, variant ambiguity, sender checks and DOM injection passed.');
})().catch(error=>{console.error(error);process.exitCode=1});

const wishlistContext={URLSearchParams};vm.runInNewContext(read('extension/wishlist-link.js'),wishlistContext);
const wl=wishlistContext.AQWCWikiWishlist;
const item={name:'Necrotic Sword of Doom (Sword)',slug:'necrotic-sword-of-doom-sword',category:'swords'};
const link=wl.build(item);assert.ok(link.startsWith('https://cptmundo.github.io/AQW-Companion/#aqwc-wishlist?'));
assert.equal(wl.parse(new URL(link).hash).name,item.name);
assert.equal(wl.target(item).name,'Necrotic Sword of Doom');assert.equal(wl.target(item).type,'Sword');
assert.equal(wl.target({...item,name:'StoneCrusher (Merge)',category:'classes'}).variant,true);
assert.equal(wl.target({...item,name:'Void Aura',category:'misc-items'}).type,'Item');
assert.equal(wl.build({...item,slug:'https://example.com'}),null);
assert.equal(wl.build({...item,category:'shops'}),null);
assert.equal(wl.parse('#aqwc-wishlist?name=x&name=y&slug=a&category=swords'),null);
assert.equal(wl.parse('#aqwc-wishlist?name=x&slug=a&category=swords&extra=1'),null);
assert.equal(wl.parse('#other'),null);
assert.ok(read('extension/wiki-items.js').includes("link.textContent='+ Add to Wishlist'"));
const site=read('index.html'),review=site.slice(site.indexOf('function showWikiWishlistReview(){'),site.indexOf('async function init(){'));
assert.ok(review.includes('add.onclick=()=>{'));assert.ok(review.includes('addProjectByName(name,target.type);clear()'));assert.ok(review.includes('if(target.variant)'));assert.ok(review.includes('loadUnlocks();'));
assert.ok(site.includes('extension/wishlist-link.js?v=126'));assert.ok(site.includes('showWikiWishlistReview();window.addEventListener'));
assert.ok(read('js/umami-analytics.js').includes("url:'/AQW-Companion/'"));
console.log('Wiki Wishlist: scoped links, category suffixes, variant guard and explicit confirmation checked.');

(async()=>{
 const origin='https://aqwwiki.wikidot.com',ctx={URL};
 vm.runInNewContext(read('extension/wiki-materials.js'),ctx);
 const api=ctx.AQWCWikiMaterials;
 const row=(name,slug,count)=>({tagName:'LI',textContent:name+' x'+count,querySelector:()=>null,querySelectorAll:()=>[{href:origin+'/'+slug,textContent:name}]});
 const group=rows=>({tagName:'UL',children:rows,textContent:rows.map(r=>r.textContent).join(' ')});
 const marker=rows=>{const ul=group(rows);return {tagName:'LI',childNodes:[{nodeType:3,textContent:'Merge the following:'},{nodeType:1,tagName:'UL',textContent:ul.textContent}],children:[ul]}};
 const blocks=[marker([row("Necrotic Sword's Blade",'necrotic-sword-s-blade',1),row('Void Aura','void-aura',800)]),marker([row('Dual Necrotic Swords of Doom','dual-necrotic-swords-of-doom',1)])];
 const parsed=api.parse({querySelectorAll:()=>blocks},origin);
 assert.equal(parsed.groups.length,2);assert.equal(parsed.groups[0][1].target,800);assert.equal(parsed.groups[1].length,1);
 assert.equal(api.parse({querySelectorAll:()=>[marker([row('Void Aura','void-aura','7,500')])]},origin).groups[0][0].target,7500);
 assert.equal(api.parse({querySelectorAll:()=>[marker([row('Bad','bad','1 or 2')])]},origin).incomplete,true);
 assert.equal(api.parse({querySelectorAll:()=>[marker([row('A','a',1),row('A','a',2)])]},origin).groups.length,0);
 assert.equal(api.parse({querySelectorAll:()=>[]},origin).groups.length,0);
 const req=(name,slug,target)=>({name,slug,target});
 const ms=new Map([['Parent',{state:'owned',itemId:'p',total:1}],['Aura',{state:'owned',itemId:'a',total:5}],['Aura (Item)',{state:'owned',itemId:'a',total:5}],['Other',{state:'not-found'}],['Unknown',{state:'ambiguous'}]]);
 const selections=new Map([['0.0',{choice:0,groups:[[req('Aura (Item)','aura-item',3),req('Other','other',1)]]}],['0.0.1',{choice:0,groups:[[req('Parent','parent',1)]]}]]);
 const planned=api.plan([req('Parent','parent',3),req('Aura','aura',4)],selections,ms,'root');
 assert.equal(planned.root[0].missing,2);assert.equal(planned.root[1].allocated,4);
 assert.equal(planned.root[0].children[0].target,6);assert.equal(planned.root[0].children[0].allocated,1);
 assert.equal(planned.root[0].children[1].children[0].reason,'Circular dependency');
 assert.equal(api.plan([req('Aura','aura',5)],new Map(),ms,'root',1).root[0].allocated,5);
 assert.equal(api.plan([req('Unknown','unknown',1)],new Map(),ms,'root').root[0].allocated,null);
 assert.equal(api.plan([req('Parent','parent',1)],selections,ms,'root').root[0].children.length,0);
 assert.equal(api.plan([req('Parent','parent',3)],new Map([['0.0',{choice:-1,groups:[[req('Aura','aura',3)],[req('Other','other',1)]]}]]),ms,'root').root[0].children.length,0);

 const stored={items:[{ID:'1',Name:'Void Aura',Type:'Item',Count:12,Bank:0},{ID:'1',Name:'Void Aura',Type:'Item',Count:8,Bank:1},{ID:'2',Name:'Necrotic Sword of Doom',Type:'Sword',Count:1,Bank:0},{ID:'3',Name:'Same',Type:'Item',Count:1,Bank:0},{ID:'4',Name:'Same',Type:'Sword',Count:1,Bank:1}],syncedAt:'2026-11-24'};
 const chromeMock={runtime:{onMessage:{addListener(){}},getURL:x=>'chrome-extension://test/'+x},storage:{local:{async get(k){return {[k]:stored}}}}};
 const worker=vm.runInNewContext(read('extension/worker.js')+'\n({matchWikiMaterial,handle})',{chrome:chromeMock,URL,TextEncoder});
 assert.equal(worker.matchWikiMaterial(stored,'Void Aura').total,20);
 assert.equal(worker.matchWikiMaterial(stored,'Void Aura').bank,8);
 assert.equal(worker.matchWikiMaterial(stored,'Necrotic Sword of Doom (Sword)').total,1);
 assert.equal(worker.matchWikiMaterial(stored,'Same').state,'ambiguous');
 assert.equal(worker.matchWikiMaterial(stored,'Same (Sword)').total,1);
 assert.equal(worker.matchWikiMaterial(stored,'Void Aura (Sword)').state,'ambiguous');
 assert.equal(worker.matchWikiMaterial({items:[{ID:'9',Name:'Example Axe',Type:'Weapon',Count:1,Bank:0}]},'Example Axe (Axe)').total,1);
 assert.equal(worker.matchWikiMaterial(stored,'Absent').state,'not-found');
 assert.equal(worker.matchWikiMaterial(null,'Void Aura').state,'unsynced');
 const msg={type:'wiki-material-lookup',names:['Void Aura','Absent']},sender={url:origin+'/necrotic-sword-of-doom-sword',frameId:0};
 const response=await worker.handle(msg,sender);assert.equal(response.matches[0].total,20);assert.equal(response.matches[0].itemId,'1');assert.equal(response.matches[1].state,'not-found');assert.equal(response.items,undefined);
 assert.equal((await worker.handle(msg,{...sender,frameId:1})).ok,false);
 assert.equal((await worker.handle(msg,{url:'https://example.org/item',frameId:0})).ok,false);
 assert.equal((await worker.handle({...msg,names:Array(81).fill('x')},sender)).ok,false);
 assert.ok(read('extension/wiki-items.js').includes('api?.render(card,content,location.origin)'));
 console.log('Direct material progress: separate merge lists, strict counts, bounded local lookup and ambiguity passed.');
})().catch(error=>{console.error(error);process.exitCode=1});

(async()=>{
 const accountOrigin='https://account.aq.com',rows=Array.from({length:101},(_,i)=>({ID:i+1,Name:'Item '+i,Type:'Item',Count:1,Bank:i%2,Added:'2026-11-24',secret:'not copied'}));
 let calls=[];
 const ctx={URL,AbortSignal,location:{origin:accountOrigin,pathname:'/AQW/Inventory'},performance:{getEntriesByType:()=>[{name:accountOrigin+'/AQW/InventoryData?filter=ignored'}]},setTimeout:f=>f(),fetch:async (url,opts)=>{const u=new URL(url);calls.push(u);assert.equal(opts.method,'GET');assert.equal(opts.credentials,'same-origin');assert.equal(u.searchParams.has('filter'),false);return {ok:true,json:async()=>({data:rows.slice(Number(u.searchParams.get('skip')),Number(u.searchParams.get('skip'))+100),totalCount:101})}}};
 const capture=vm.runInNewContext(read('extension/account-capture.js')+'\ncaptureAccountInventory',ctx);
 const snap=await capture();assert.equal(snap.items.length,101);assert.equal(calls.length,2);assert.equal(snap.items[0].secret,undefined);assert.equal(snap.items[0].Added,'2026-11-24');
 ctx.location.pathname='/AQW/Account';await assert.rejects(capture(),/Inventory tab/);ctx.location.pathname='/AQW/Inventory';
 ctx.fetch=async()=>({ok:true,json:async()=>({data:rows.slice(0,1),totalCount:101})});await assert.rejects(capture(),/Incomplete/);
 ctx.performance.getEntriesByType=()=>[{name:'https://example.com/InventoryData'}];await assert.rejects(capture(),/endpoint/);
 const stored={},chromeMock={runtime:{onMessage:{addListener(){}},getURL:x=>'chrome-extension://test/'+x},storage:{local:{async get(k){return {[k]:stored[k]}},async set(x){Object.assign(stored,x)},async remove(k){delete stored[k]}}}};
 const api=vm.runInNewContext(read('extension/worker.js')+'\n({handle,cleanAccountSnapshot})',{chrome:chromeMock,URL,TextEncoder,crypto:{randomUUID:()=>'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'}});
 const popup={url:'chrome-extension://test/popup.html'},main={url:'https://cptmundo.github.io/AQW-Companion/',frameId:0},wiki={url:'https://aqwwiki.wikidot.com/item',frameId:0};
 assert.throws(()=>api.cleanAccountSnapshot({...snap,reportedTotal:100}));
 assert.equal((await api.handle({type:'account-stage',snapshot:snap},wiki)).ok,false);
 assert.equal((await api.handle({type:'account-stage',snapshot:snap},{url:'https://account.aq.com/AQW/Account',frameId:0})).ok,false);
 assert.equal((await api.handle({type:'account-stage',snapshot:snap},{url:'https://account.aq.com/AQW/Inventory',frameId:1})).ok,false);
 assert.equal((await api.handle({type:'account-stage',snapshot:snap},{url:'https://account.aq.com/AQW/Inventory',frameId:0})).count,101);
 assert.equal((await api.handle({type:'account-stage-read'},{url:'https://account.aq.com/AQW/Inventory',frameId:0})).ok,false);
 assert.equal((await api.handle({type:'account-stage',snapshot:snap},popup)).count,101);
 assert.equal(stored['aqwc-inventory-v1'],undefined);
 assert.equal((await api.handle({type:'account-stage-read'},wiki)).ok,false);
 const pending=await api.handle({type:'account-stage-read'},main);assert.equal(pending.snapshot.items.length,101);
 assert.equal((await api.handle({type:'account-stage-commit',id:'wrong'},main)).ok,false);
 assert.equal((await api.handle({type:'account-stage-commit',id:pending.id},main)).ok,true);
 assert.equal(stored['aqwc-inventory-v1'].items.length,101);assert.equal(stored['aqwc-account-stage-v1'],undefined);
 const html=read('index.html');assert.ok(html.includes('const saved=await importFile(file);'));assert.ok(html.includes("type:'imported',nonce,id:stageId"));assert.ok(html.includes("if(!confirm('Import '"));assert.ok(read('extension/account-bridge.js').includes('if(e.isTrusted)gesture=Date.now()'));
 assert.equal(manifest.host_permissions,undefined);assert.deepEqual(manifest.content_scripts[1].js,['sync.js','account-bridge.js','wishlist-queue.js']);
 console.log('Account import: pagination, completeness, scope, allowlisted fields, staging and commit checked.');
})().catch(e=>{console.error(e);process.exitCode=1});

(async()=>{
 const stored={},chromeMock={runtime:{onMessage:{addListener(){}},getURL:x=>'chrome-extension://test/'+x},storage:{local:{async get(k){return {[k]:stored[k]}},async set(x){Object.assign(stored,x)}}}};
 const api=vm.runInNewContext(read('extension/worker.js')+'\n({handle})',{chrome:chromeMock,URL,TextEncoder,crypto:{randomUUID:()=>'test-id'}});
 const wiki={url:'https://aqwwiki.wikidot.com/void-aura',frameId:0},main={url:'https://cptmundo.github.io/AQW-Companion/',frameId:0};
 const item={name:'Void Aura',slug:'void-aura',category:'misc-items',secret:'ignored'},msg={type:'wishlist-queue-add',item};
 assert.equal((await api.handle(msg,main)).ok,false);
 assert.equal((await api.handle({...msg,item:{...item,slug:'other'}},wiki)).ok,false);
 const [first,second]=await Promise.all([api.handle(msg,wiki),api.handle(msg,wiki)]);assert.ok(first.ok&&second.ok);assert.equal(second.already,true);
 assert.equal((await api.handle({type:'wishlist-queue-read'},wiki)).ok,false);
 const queue=await api.handle({type:'wishlist-queue-read'},main);assert.equal(queue.entries.length,1);assert.equal(queue.entries[0].item.secret,undefined);
 assert.equal((await api.handle({type:'wishlist-queue-ack',ids:['test-id']},wiki)).ok,false);
 assert.equal((await api.handle({type:'wishlist-queue-ack',ids:['test-id']},main)).ok,true);assert.equal((await api.handle({type:'wishlist-queue-read'},main)).entries.length,0);
 const html=read('index.html'),section=html.slice(html.indexOf('function initWikiWishlistQueue'),html.indexOf('function initAccountInventoryImport'));
 assert.ok(section.includes('localStorage.setItem(key,JSON.stringify(latest))'));assert.ok(!section.includes('confirm('));assert.ok(!section.includes('selectTab('));
 const js=read('extension/wiki-items.js');assert.ok(js.includes("type:'wishlist-queue-add'"));assert.ok(!js.includes("link.target='_blank'"));
 console.log('One-click Wishlist queue: scoped sender, duplicate suppression, persistence acknowledgement and no navigation.');
})().catch(e=>{console.error(e);process.exitCode=1});

assert.deepEqual(manifest.optional_host_permissions,['https://account.aq.com/*']);
const header129=read('index.html').split('</header>')[0];
for(const id of ['aqwc-account-import','aqwc-sync-inventory','aqwc-sync-status','aqwc-account-status','file','backup','clear'])assert.equal((header129.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
assert.ok(header129.includes('Inventory tools'));assert.ok(header129.includes('Import JSON file'));
const accountPage129=read('extension/account-page.js');assert.ok(accountPage129.includes('if(!e.isTrusted||button.disabled)return'));assert.ok(accountPage129.includes("type:'account-stage',snapshot"));
assert.ok(read('extension/account-permission.js').includes("matches=['https://account.aq.com/AQW/Inventory*']"));
assert.ok(read('extension/account-permission.js').includes('chrome.permissions.request'));assert.ok(read('extension/account-permission.js').includes('chrome.permissions.remove'));
console.log('Inventory UX: header actions, optional permission, exact-page export scope and fallback checks passed.');

const header130=read('index.html').split('</header>')[0],css130=read('css/site.css');
assert.ok(header130.includes('role="group" aria-label="Inventory tools"'));
assert.ok(!header130.includes('<details class="inventory-tools"'));
assert.ok(css130.includes('contain:inline-size'));assert.ok(css130.includes('margin-left:auto'));
assert.ok(read('extension/account-page.js').includes("grid.parentElement.insertBefore(host,grid)"));
assert.ok(read('extension/account-permission.js').includes('Button not detected after injection.'));
assert.ok(read('extension/popup.html').includes('id="repair-account-button"'));
assert.ok(read('extension/worker.js').includes('chrome.tabs?.onUpdated?.addListener'));
console.log('Stable header strip and Account Manager injection diagnostics checked.');

(async()=>{
 const src=read('extension/account-page.js');
 function fixture(pathname,withGrid){
  let inserted=null,placement=null,reads=0,writes=0;
  const el=()=>({style:{},children:[],append(...nodes){this.children.push(...nodes)},attachShadow(){return this.shadow=el()},setAttribute(){},addEventListener(type,fn){this[type]=fn}});
  const grid={parentElement:{insertBefore(host,before){assert.equal(before,grid);inserted=host;placement='grid'}}};
  const doc={getElementById:()=>inserted,createElement:el,querySelector:()=>withGrid?grid:null,body:{append(host){inserted=host;placement='fallback'}}};
  const ctx={document:doc,location:{origin:'https://account.aq.com',pathname},captureAccountInventory:async()=>{reads++;return {items:[]}},chrome:{runtime:{sendMessage:async m=>{writes++;assert.equal(m.type,'account-stage');return {ok:true,count:2390}}}}};
  return {ctx,state:()=>({inserted,placement,reads,writes})};
 }
 const a=fixture('/AQW/Inventory',true);assert.equal(vm.runInNewContext(src,a.ctx),true);assert.equal(a.state().placement,'grid');assert.equal(a.state().reads,0);
 const host=a.state().inserted,button=host.shadow.children[0].children[0];
 assert.equal(vm.runInNewContext(src,a.ctx),true);assert.equal(a.state().inserted,host);
 await button.click({isTrusted:false});assert.equal(a.state().reads,0);
 await button.click({isTrusted:true});assert.equal(a.state().reads,1);assert.equal(a.state().writes,1);assert.equal(button.textContent,'✓ Export ready');
 const b=fixture('/AQW/Inventory',false);assert.equal(vm.runInNewContext(src,b.ctx),true);assert.equal(b.state().placement,'fallback');
 const c=fixture('/AQW/Account',true);assert.equal(vm.runInNewContext(src,c.ctx),false);assert.equal(c.state().inserted,null);
 console.log('Account page DOM: grid placement, fallback, idempotence, trusted-click capture and route guard passed.');
})().catch(error=>{console.error(error);process.exitCode=1});

const header131=read('index.html').split('</header>')[0],advanced131=header131.slice(header131.indexOf('<details class="inventory-advanced">'),header131.indexOf('</details>'));
assert.ok(header131.includes('Import &amp; Sync'));
for(const id of ['aqwc-sync-inventory','file','clear'])assert.ok(advanced131.includes('id="'+id+'"'));
assert.ok(advanced131.includes('extension-connect.html'));
assert.ok(!advanced131.includes('id="backup"'));
assert.ok(advanced131.includes('Sync Companion → extension'));
const flow131=read('index.html').split('function initAccountInventoryImport(){')[1].split('async function init(){')[0];
assert.ok(flow131.indexOf('const saved=await importFile(file);')<flow131.indexOf("type:'imported',nonce,id:stageId"));
assert.ok(flow131.includes("if(m.ok)"));assert.ok(flow131.includes("synced.dataset.state='success'"));assert.ok(flow131.includes("synced.dataset.state='error'"));
assert.ok(read('css/site.css').includes('.inventory-advanced:not([open]) .inventory-advanced-menu{display:none}'));
console.log('Import & Sync primary action, advanced tools and confirmed sync feedback checked.');

{
 const ctx={URL};vm.runInNewContext(read('extension/wiki-quest-shop.js'),ctx);
 const api=ctx.AQWCQuestShop;
 const a=(name,slug)=>({textContent:name,getAttribute:()=>'/'+slug,querySelector:()=>null,closest:()=>null,nodeType:1,tagName:'A'});
 const crumb=slugs=>({querySelectorAll:()=>slugs.map(x=>a(x,x))});
 assert.equal(api.pageKind(crumb(['world','quests'])),'quest');
 assert.equal(api.pageKind(crumb(['world','shops','merge-shops'])),'shop');
 assert.equal(api.pageKind(crumb(['items','shops'])),null);
 assert.equal(api.pageKind(crumb(['monsters'])),null);
 assert.equal(api.quantity('x7,500'),7500);assert.equal(api.quantity('x5 for 2'),null);assert.equal(api.quantity('x0'),null);
 const textNode=textContent=>({nodeType:3,textContent}),br={nodeType:1,tagName:'BR'};
 const aura=a('Void Aura','void-aura'),gem=a('Gem of Nulgath','gem-of-nulgath');
 const cell=childNodes=>({childNodes});
 const costs=api.shopCosts(cell([aura,textNode(' x800,'),br,gem,textNode(' x15')]));
 assert.equal(costs.length,2);assert.equal(costs[0].target,800);
 assert.equal(api.shopCosts(cell([aura,textNode(' x5 for 2')])),null);
 assert.equal(api.shopCosts(cell([textNode('100 Gold')])),null);
 assert.equal(api.shopCosts(cell([aura,textNode(' x1'),br,aura,textNode(' x2')])),null);
 const row={childNodes:[aura,textNode(' x800')],querySelectorAll:()=>[aura]};
 assert.equal(api.linkedRow(row).target,800);
 assert.equal(api.linkedRow({childNodes:[textNode('Slain Gorillaphant x50')],querySelectorAll:()=>[]}),null);
 const matches=new Map([['Void Aura',{state:'owned',total:5,itemId:'1'}],['Gem of Nulgath',{state:'owned',total:5,itemId:'1'}]]);
 const group={role:'cost',items:[{name:'Void Aura',target:4},{name:'Gem of Nulgath',target:4}]};
 const result=api.labels(group,matches);assert.equal(result[0].text,'Stock 4/4');assert.equal(result[1].text,'Stock 1/4');
 assert.equal(api.labels({role:'reward',items:[{name:'Void Aura',target:1}]},matches)[0].text,'✓ Owned ×5');
 assert.equal(api.labels({role:'requirement',items:[{name:'Unknown',target:1}]},matches)[0].text,'? Unknown');
 console.log('Quest/shop scoped parsing and independent stock allocation passed.');
}

{
 const ctx={URL};vm.runInNewContext(read('extension/wiki-list-ownership.js'),ctx);
 const api=ctx.AQWCListOwnership;
 assert.equal(api.categoryFor('/classes'),'classes');assert.equal(api.categoryFor('/sort-by-rare-classes'),'classes');
 assert.equal(api.categoryFor('/sort-by-rare-battle-pets'),'battle-pets');
 assert.equal(api.categoryFor('/nulgath-s-quests'),null);assert.equal(api.categoryFor('/archpaladin'),null);
 const a=(name,href,filtered=false)=>({tagName:'A',textContent:name,getAttribute:()=>href,querySelector:()=>null,closest:s=>filtered&&s.includes('list-pages')?{}:null});
 const classLink=a('ArchPaladin','/archpaladin'),nav=a('Rare','/sort-by-rare-classes'),outside=a('NPC','/nulgath');
 const content={querySelectorAll:()=>[outside,nav,{tagName:'H2',textContent:'A'},classLink,a('Back to Top','#top'),a('Wiki','https://example.org/wiki'),{tagName:'H2',textContent:'Notes'},outside]};
 const rows=api.collect(content,'classes',false);assert.equal(rows.length,1);assert.equal(rows[0].name,'ArchPaladin');
 assert.equal(api.collect({querySelectorAll:()=>[a('ArchPaladin','/archpaladin',true),outside]},'classes',true).length,1);
 assert.equal(api.candidate(a('Armors','/armors'),'classes'),null);
 // Wiki indexes can use bold/plain paragraphs and empty named jump targets,
 // rather than semantic headings. These are representative fixtures, not a
 // captured browser DOM.
 const marker=(tag,text,linked=false)=>({tagName:tag,textContent:text,querySelector:s=>linked&&s==='a[href]'?{}:null,closest:()=>null});
 const named=(name)=>({tagName:'A',textContent:'',getAttribute:key=>key==='name'?name:null});
 const numeric=a('00-X Dungeoneer','/00-x-dungeoneer'),arm=a('ArchMage (Class)','/archmage-class');
 const plain={querySelectorAll:()=>[marker('P','Go to #, A, B',true),a('A','#A'),outside,named('#'),marker('STRONG','#'),numeric,a('Back to Top','#top'),outside,marker('P','A'),marker('STRONG','A'),arm,a('Back to Top','#top'),outside]};
 assert.deepEqual(Array.from(api.collect(plain,'classes',false),x=>x.name),['00-X Dungeoneer','ArchMage (Class)']);
 assert.equal(api.sectionMarker(marker('SPAN','A',true)),null);
 assert.equal(api.sectionMarker(named('B')),'start');
 assert.equal(api.sectionMarker(a('A','#A')),null);
 assert.equal(api.collect({querySelectorAll:()=>[marker('P','Auto updating list of all Rare Classes'),classLink]},'classes',true).length,1);
 assert.equal(api.collect({querySelectorAll:()=>[marker('P','A',true),outside]},'classes',false).length,0);
 assert.ok(read('extension/wiki-list-ownership.js').includes('No supported item links detected on this index'));

 const duplicates=api.groupRows([rows[0],{...rows[0],slug:'archpaladin-alt'}]);assert.equal(duplicates.length,1);assert.equal(duplicates[0].slugs.size,2);
 assert.equal(api.label({state:'owned',inventory:1,bank:1,total:2}).text,'✓ Inventory + Bank ×2');
 assert.equal(api.label({state:'owned',inventory:0,bank:1,total:1}).text,'✓ Bank ×1');
 assert.equal(api.label({state:'not-found'}).text,'Not in snapshot');
 assert.equal(api.label({state:'owned',total:1},true).text,'? Unknown');
 const snap={items:[{ID:'1',Name:'ArchPaladin',Type:'Class',Count:1,Bank:0},{ID:'2',Name:'ArchPaladin',Type:'Armor',Count:1,Bank:1},{ID:'3',Name:'Example',Type:'Class',Count:1,Bank:0},{ID:'4',Name:'Example (Class)',Type:'Class',Count:1,Bank:1}],syncedAt:'2026-11-24',exportedAt:'2026-11-24'};
 const chromeMock={runtime:{onMessage:{addListener(){}},getURL:x=>'chrome-extension://test/'+x},storage:{local:{async get(k){return {[k]:snap}}}}};
 const worker=vm.runInNewContext(read('extension/worker.js')+'\n({handle,matchWikiListItem,wikiListCategory})',{chrome:chromeMock,URL,TextEncoder});
 assert.equal(worker.matchWikiListItem(snap,'ArchPaladin','classes').inventory,1);
 assert.equal(worker.matchWikiListItem(snap,'Example (Class)','classes').state,'ambiguous');
 assert.equal(worker.matchWikiListItem(snap,'ArchPaladin (Merge)','classes').state,'ambiguous');
 assert.equal(worker.matchWikiListItem(snap,'Unknown (AC)','classes').state,'not-found');
 assert.equal(worker.matchWikiListItem(snap,'Missing','classes').state,'not-found');
 (async()=>{
  const sender={url:'https://aqwwiki.wikidot.com/classes',frameId:0},msg={type:'wiki-list-lookup',category:'classes',names:['ArchPaladin','Missing']};
  const r=await worker.handle(msg,sender);assert.equal(r.ok,true);assert.equal(r.matches[0].total,1);assert.equal(r.matches[1].state,'not-found');assert.equal(r.items,undefined);
  assert.equal((await worker.handle(msg,{...sender,frameId:1})).ok,false);
  assert.equal((await worker.handle(msg,{...sender,url:'https://aqwwiki.wikidot.com/archpaladin'})).ok,false);
  assert.equal((await worker.handle({...msg,category:'armors'},sender)).ok,false);
  assert.equal((await worker.handle({...msg,names:Array.from({length:81},(_,i)=>'item '+i)},sender)).ok,false);
  console.log('Ownership Everywhere: typed lookup, scoped sender, bounded requests and safe candidates passed.');
 })().catch(e=>{console.error(e);process.exitCode=1});
}

{
 const ctx={URL};vm.runInNewContext(read('extension/wiki-list-ownership.js'),ctx);
 const api=ctx.AQWCListOwnership;
 (async()=>{
  const groups=Array.from({length:1301},(_,i)=>({name:'Item '+i})),sizes=[],offsets=[],seen=[];let yields=0;
  await api.checkAll(groups,'helmets-hoods',async m=>{
   assert.equal(m.category,'helmets-hoods');assert.equal(m.type,'wiki-list-lookup');
   sizes.push(m.names.length);return {ok:true,syncedAt:'2026-11-24',exportedAt:'2026-11-24',matches:m.names.map(name=>({name,state:'not-found'}))};
  },(chunk,matches,p)=>{offsets.push(p.offset);seen.push(...matches.map(m=>m.name))},async()=>{yields++});
  assert.equal(sizes.length,17);assert.ok(sizes.every(n=>n<=80));assert.equal(sizes.at(-1),21);
  assert.equal(offsets.at(-1),1301);assert.equal(seen.length,1301);assert.equal(new Set(seen).size,1301);assert.equal(yields,16);
  let calls=0,annotated=0;
  await assert.rejects(api.checkAll(groups,'helmets-hoods',async m=>({ok:true,syncedAt:String(++calls),exportedAt:'same',matches:m.names.map(()=>({state:'owned'}))}),chunk=>{annotated+=chunk.length},async()=>{}),/Inventory changed/);
  assert.equal(annotated,80);
  await assert.rejects(api.checkAll(groups,'helmets-hoods',async m=>({ok:true,matches:m.names.map(()=>({state:'unsynced'}))}),()=>{},async()=>{}),/Inventory not synced/);
  assert.ok(!read('extension/wiki-list-ownership.js').includes('Check next 400'));
  assert.ok(!read('extension/wiki-list-ownership.js').includes('scheduleScan()'));assert.ok(!read('extension/wiki-list-ownership.js').includes('IntersectionObserver'));assert.ok(read('extension/wiki-list-ownership.js').includes('let groups=null'));
  console.log('Automatic full ownership scan: 1301 names, bounded batches, yielding and snapshot consistency passed.');
 })().catch(e=>{console.error(e);process.exitCode=1});
}

{
 const ctx={URL};vm.runInNewContext(read('extension/wiki-quest-shop.js'),ctx);const api=ctx.AQWCQuestShop;
 assert.equal(api.questQuantity('x3 (Stacks up to 1,000)'),3);assert.equal(api.questQuantity('x3 or x4'),null);assert.equal(api.questQuantity('x3 (Stacks up to 10) extra'),null);
 const snapshot={items:[{ID:'1',Name:'Void Aura',Type:'Item',Count:10,Bank:0},{ID:'1',Name:'Void Aura',Type:'Item',Count:20,Bank:1},{ID:'2',Name:'Example (0 AC)',Type:'Class',Count:1,Bank:0}],syncedAt:'now'};
 const chromeMock={runtime:{onMessage:{addListener(){}},getURL:x=>'chrome-extension://test/'+x},storage:{local:{async get(k){return {[k]:snapshot}}}}};
 const worker=vm.runInNewContext(read('extension/worker.js')+'\n({handle,searchLocalInventory,matchWikiListItem})',{chrome:chromeMock,URL,TextEncoder});
 assert.equal(worker.searchLocalInventory(snapshot,'void','all').total,2);assert.equal(worker.searchLocalInventory(snapshot,'void','bank').rows[0].count,20);
 assert.equal(worker.searchLocalInventory(snapshot,'v','all').total,0);
 assert.equal(worker.matchWikiListItem(snapshot,'Example (AC)','classes').state,'ambiguous');
 assert.equal(worker.matchWikiListItem(snapshot,'Absent (Legend)','classes').state,'not-found');
 (async()=>{const msg={type:'inventory-search',query:'void',location:'all'};assert.equal((await worker.handle(msg,{url:'https://aqwwiki.wikidot.com/classes',frameId:0})).ok,false);assert.equal((await worker.handle(msg,{url:'chrome-extension://test/popup.html'})).total,2)})().catch(e=>{console.error(e);process.exitCode=1});
 assert.ok(read('index.html').includes('function showWikiRoutineReview()'));assert.ok(read('index.html').includes('pinTask(t);showWikiRoutineReview()'));
 assert.ok(read('extension/wiki-list-ownership.js').includes('Add to Wishlist without leaving Wiki'));
}

{
 
 // Existing worker integration tests cover typed lookups; static UI safeguards.
 assert.ok(read('extension/wiki-list-ownership.js').includes("find.addEventListener('click'"));
 assert.ok(read('extension/wiki-quest-shop.js').includes("type:'quest-pin-add'"));
 assert.ok(read('index.html').includes("if(entry.quest)"));
}

{
 const snap={items:[{ID:'1',Name:'Test',Type:'Class',Count:1,Bank:0},{ID:'1',Name:'Test',Type:'Class',Count:1,Bank:0},{ID:'1',Name:'Test',Type:'Class',Count:1,Bank:1}]};
 const api=vm.runInNewContext(read('extension/worker.js')+'\n({buildListMatcher})',{chrome:{runtime:{onMessage:{addListener(){}}}},URL,TextEncoder});
 assert.equal(api.buildListMatcher(snap,'classes')('Test').total,2);
}
(async()=>{
 const stored={};let id=0;const api=vm.runInNewContext(read('extension/worker.js')+'\n({handle})',{chrome:{runtime:{onMessage:{addListener(){}},getURL:x=>'chrome-extension://test/'+x},storage:{local:{async get(k){return {[k]:stored[k]}},async set(v){Object.assign(stored,v)}}}},URL,TextEncoder,crypto:{randomUUID:()=>String(++id)}});
 const main={url:'https://cptmundo.github.io/AQW-Companion/',frameId:0},wiki={url:'https://aqwwiki.wikidot.com/classes',frameId:0},quest={url:'https://aqwwiki.wikidot.com/daily-quest-board-s-quests',frameId:0};
 const item={name:'Bard',slug:'bard',category:'classes'};
 assert.equal((await api.handle({type:'wishlist-queue-add',item},wiki)).ok,true);
 assert.equal((await api.handle({type:'wishlist-queue-add',item:{...item,category:'armors'}},wiki)).ok,false);
 assert.equal((await api.handle({type:'routine-queue-add',quest:{source:'wrong',name:'Moglin Companions'}},quest)).ok,false);
 const msg={type:'routine-queue-add',quest:{source:'daily-quest-board-s-quests',name:'Moglin Companions'}};
 assert.equal((await api.handle(msg,quest)).ok,true);assert.equal((await api.handle(msg,quest)).already,true);
 assert.equal((await api.handle({type:'wishlist-queue-read'},main)).entries.length,2);
 const story={url:'https://aqwwiki.wikidot.com/general-gravelyn-s-quests',frameId:0},pin={type:'quest-pin-add',quest:{source:'general-gravelyn-s-quests',name:'A Fighting Chance'}};
 assert.equal((await api.handle(pin,story)).ok,true);assert.equal((await api.handle(pin,story)).already,true);
 assert.equal((await api.handle(pin,{...story,frameId:1})).ok,false);
 assert.equal((await api.handle(pin,quest)).ok,false);
 const entries=(await api.handle({type:'wishlist-queue-read'},main)).entries;assert.equal(entries.length,3);assert.equal(entries[2].quest.pin,true);assert.equal(entries[2].quest.name,'A Fighting Chance');
})().catch(e=>{console.error(e);process.exitCode=1});

(async()=>{
 const api=vm.runInNewContext(read('extension/wiki-list-ownership.js')+'\nAQWCListOwnership',{URL});
 let cancelled=false,sends=0,rendered=0;
 await api.checkAll(Array.from({length:200},(_,i)=>({name:'item '+i})),'misc-items',async m=>{sends++;return {ok:true,syncedAt:'now',matches:m.names.map(()=>({state:'not-found'}))}},chunk=>{rendered+=chunk.length},async()=>{cancelled=true},()=>cancelled);
 assert.equal(sends,1);assert.equal(rendered,80);
})().catch(e=>{console.error(e);process.exitCode=1});

(async()=>{
 const stored={};const api=vm.runInNewContext(read('extension/worker.js')+'\n({handle})',{chrome:{runtime:{onMessage:{addListener(){}},getURL:x=>'chrome-extension://test/'+x},storage:{local:{async get(k){return {[k]:stored[k]}},async set(v){Object.assign(stored,v)}}}},URL,TextEncoder});
 const wiki={url:'https://aqwwiki.wikidot.com/classes',frameId:0},msg={type:'wiki-list-preference'};
 assert.equal((await api.handle(msg,wiki)).automatic,true);
 assert.equal((await api.handle({...msg,automatic:false},wiki)).automatic,false);
 assert.equal((await api.handle(msg,wiki)).automatic,false);
 assert.equal((await api.handle({...msg,automatic:'false'},wiki)).ok,false);
 assert.equal((await api.handle(msg,{...wiki,frameId:1})).ok,false);
 assert.equal((await api.handle(msg,{...wiki,url:'https://aqwwiki.wikidot.com/void-aura'})).ok,false);
 assert.ok(read('extension/wiki-list-ownership.js').includes('Wishlist search'));
})().catch(e=>{console.error(e);process.exitCode=1});

{
 // The actual init path must not enumerate the page or message the worker.
 const el=()=>({style:{},append(){},replaceChildren(){},setAttribute(){},addEventListener(){},attachShadow(){return el()},insertAdjacentElement(){},hidden:false});
 const title=el(),content={querySelectorAll(){throw Error('List parsed without explicit action')},get textContent(){throw Error('Page text read without explicit action')}};
 const document={getElementById:id=>id==='page-title'?title:id==='page-content'?content:null,querySelector:()=>null,createElement:el,addEventListener(){}};
 const context={URL,location:{origin:'https://aqwwiki.wikidot.com',pathname:'/misc-items'},document,window:{addEventListener(){}},performance:{now:()=>0,getEntriesByType:()=>[]},chrome:{runtime:{sendMessage(){throw Error('Unexpected background lookup')}}}};
 vm.runInNewContext(read('extension/wiki-list-ownership.js'),context);
 vm.runInNewContext(read('extension/wiki-items.js'),context);
}

{
 const runtime=read('extension/wiki-list-ownership.js').split('function init(){')[1];
 assert.ok(!runtime.includes('wiki-list-lookup'));assert.ok(!runtime.includes('checkAll('));assert.ok(!runtime.includes('aqwc-list-ownership'));
 assert.ok(runtime.includes("type:'wishlist-queue-add'"));
 assert.ok(!read('extension/popup.html').includes('activate-wiki'));
 assert.ok(read('extension/wiki-items.js').includes("type:'wiki-item-lookup'"));
 console.log('Restored individual Wiki tools; category pages are Wishlist-only.');
}

{
 const bridge=read('extension/bridge.js');
 assert.ok(bridge.includes('globalThis.AQWCWikiUI='));
 assert.ok(bridge.includes('width>=1080'));assert.ok(bridge.includes('parent.insertBefore(host,content)'));
 assert.ok(!bridge.includes('append(content)'),'Do not move the Wiki article into a wrapper');
 assert.ok(read('extension/wiki-items.js').includes('ui.mount(host,content,title)'));
 assert.ok(read('extension/wiki-quest-shop.js').includes('void checkShop()'));assert.ok(!read('extension/wiki-quest-shop.js').includes('content.prepend(host)'));assert.ok(!read('extension/wiki-quest-shop.js').includes('ui.mount(host,content,title)'),'Shop inventory must not reserve a floating sidebar');
 assert.ok(read('extension/popup.html').includes('class="quick-links"'));
 assert.ok(read('extension/wiki-materials.js').includes('materials ready'));
}

{
 const bridge=read('extension/bridge.js'),popup=read('extension/popup.html');
 assert.ok(bridge.includes('AQW Wiki Companion'));assert.ok(bridge.includes('data:image/png;base64,'));
 assert.ok(bridge.includes('width-590'));assert.ok(popup.includes('Inventory export &amp; sync'));
 assert.ok(read('extension/wiki-items.js').includes('Inventory snapshot'));
 assert.ok(!read('extension/wiki-items.js').includes('aqwc-facts'));
 assert.ok(popup.includes('id="capture-account"'));assert.ok(popup.includes('id="enable-account-button"'));
 assert.ok(!manifest.content_scripts[2].js.includes('ownership-auto.js'));
}

{
 const js=read('extension/wiki-items.js');
 assert.ok(js.includes("stackable?'✓ Owned · '+result.total.toLocaleString()+' total':'✓ Owned'"));
 assert.ok(js.includes("stackable?'0 total':'Not owned'"));
 assert.ok(!js.includes('Inventory ×'));assert.ok(!js.includes('Bank ×'));
 const api=vm.runInNewContext(read('extension/wiki-quest-shop.js')+'\nAQWCQuestShop',{URL});
 const panel={},outside={},content={ownerDocument:{getElementById:id=>id==='quest1'?panel:outside},contains:x=>x===panel};
 const tab=(name,href)=>({textContent:name,getAttribute:k=>k==='href'?href:null});
 assert.equal(api.questScope(content,[tab('First','#quest1')],'First'),panel);
 assert.equal(api.questScope(content,[tab('First','#other')],'First'),null);
 assert.equal(api.questScope(content,[tab('First','#quest1'),tab('First','#quest1')],'First'),null);
 assert.ok(!read('extension/wiki-quest-shop.js').includes('Page-wide stock (not an individual quest)'));
 assert.ok(read('extension/wiki-quest-shop.js').includes('revision!==scopeRevision'));
}

(async()=>{
 const stored={},chromeMock={runtime:{getURL:x=>'chrome-extension://test/'+x,onMessage:{addListener(){}}},storage:{local:{async get(k){return {[k]:stored[k]}},async set(v){Object.assign(stored,v)}}}};
 const api=vm.runInNewContext(read('extension/worker.js')+'\n({handle,normalizeAppearance})',{chrome:chromeMock,URL,TextEncoder});
 const popup={url:'chrome-extension://test/popup.html'},wiki={url:'https://aqwwiki.wikidot.com/classes',frameId:0};
 assert.equal((await api.handle({type:'wiki-appearance-read'},wiki)).appearance.background,'companion');
 assert.equal((await api.handle({type:'wiki-appearance-save',appearance:{background:'void'}},wiki)).ok,false);
 assert.equal((await api.handle({type:'wiki-appearance-read'},{...wiki,frameId:1})).ok,false);
 assert.equal((await api.handle({type:'wiki-appearance-read'},{url:'https://evil.example/',frameId:0})).ok,false);
 const result=await api.handle({type:'wiki-appearance-save',appearance:{background:'midnight',banner:'prometheus',panel:'blue',private:'ignored'}},popup);
 assert.equal(result.appearance.background,'companion');assert.equal(result.appearance.private,undefined);for(const background of ['companion','dark','light','cas']){const saved=await api.handle({type:'wiki-appearance-save',appearance:{background}},popup);assert.equal(saved.appearance.background,background);assert.equal((await api.handle({type:'wiki-appearance-read'},wiki)).appearance.background,background)}
 assert.equal((await api.handle({type:'wiki-appearance-read'},wiki)).appearance.banner,'prometheus');
 assert.equal(api.normalizeAppearance({background:'url(evil)',banner:'<script>',panel:'unknown'}).background,'companion');
 const attrs={},styles=[];let listener,respond;
 const root={setAttribute(k,v){attrs[k]=v}},head={append(x){styles.push(x)}},document={documentElement:root,head,getElementById:()=>({}),createElement:()=>({remove(){styles.splice(styles.indexOf(this),1)}})};
 const runtime={id:'id',getURL:x=>'chrome-extension://test/'+x,onMessage:{addListener(f){listener=f}},sendMessage(m,cb){respond=cb}};
 vm.runInNewContext(read('extension/wiki-theme.js'),{document,location:{origin:'https://aqwwiki.wikidot.com'},chrome:{runtime}});
 respond({ok:true,appearance:{background:'original',banner:'original',panel:'integrated'}});assert.equal(styles.length,1);assert.equal(attrs['data-aqwc-panel-theme'],'integrated');
 listener({type:'aqwc-appearance-preview',appearance:{background:'void',banner:'prometheus',panel:'blue'}},{id:'bad',url:popup.url});assert.equal(styles.length,1);
 listener({type:'aqwc-appearance-preview',appearance:{background:'void',banner:'prometheus',panel:'blue'}},{id:'id',url:popup.url});assert.equal(styles.length,1);assert.ok(styles[0].textContent.includes('div#container-wrap'));assert.ok(styles[0].textContent.includes('radial-gradient(ellipse at 50% 100%'));assert.ok(styles[0].textContent.includes('100% clamp(150px,10vw,210px)'));assert.ok(!styles[0].textContent.includes('#header::before'));assert.ok(styles[0].textContent.includes('#0b1420'));assert.ok(styles[0].textContent.includes('#main-content .page-tags'));assert.ok(styles[0].textContent.includes('#footer,#license-area{background-color:#0b1420'));
 listener({type:'aqwc-appearance-preview',appearance:{}},{id:'id',url:popup.url});assert.equal(styles.length,1);
 console.log('Wiki appearance: defaults, scoped read/write, validated presets and restore original passed.');
})().catch(e=>{console.error(e);process.exitCode=1});

{
 const api=vm.runInNewContext(read('extension/wiki-materials.js')+'\nAQWCWikiMaterials',{URL});
 const link=(name,href)=>({textContent:name,getAttribute:()=>href});
 const line=(text,links)=>({childNodes:[{nodeType:3,textContent:text}],querySelectorAll:()=>links,tagName:'LI'});
 const content={querySelectorAll:()=>[
  line('Location: Luna Cove',[link('Luna Cove','/luna-cove')]),
  line('Dropped by: Horde Lycan',[link('Horde Lycan','/horde-lycan')]),
  line("Reward from the 'Retrieve Void Auras' quest",[link('Retrieve Void Auras','/sally-s-quests#1')]),
  line('Used in the following quests:',[link('Not a reward','/wrong')]),
  line('Dropped by evil',[link('External','https://evil.example/')]),
 ]};
 const s=api.parseSources(content,'https://aqwwiki.wikidot.com');
 assert.equal(s.locations[0].slug,'luna-cove');assert.equal(s.drops.length,1);assert.equal(s.quests[0].hash,'#1');assert.equal(s.quests.length,1);
 assert.equal(api.reviewedSources('moon-rock-fragments').locations[0].join,'lunacove');
 assert.equal(api.reviewedSources('unknown'),null);
 assert.ok(!api.mergeSources(s,api.reviewedSources('moon-rock-fragments')).drops.some(x=>x.name==='External'));
 assert.ok(read('extension/wiki-theme.js').includes('div#container-wrap'));
 assert.ok(read('extension/wiki-materials.js').includes('navigator.clipboard.writeText'));
}

{
 const api=vm.runInNewContext(read('extension/wiki-materials.js')+'\nAQWCWikiMaterials',{URL});
 assert.equal(api.mapCommand({textContent:'Map Name: lunacove Room Limit: 6 /join lunacove'}),'lunacove');
 assert.equal(api.mapCommand({textContent:'Map Name: fake /join different'}),null);
 assert.equal(api.mapCommand({textContent:'Map Name: a Map Name: b /join a'}),null);
}

{
 const materials=read('extension/wiki-materials.js'),bridge=read('extension/bridge.js'),theme=read('extension/wiki-theme.js');
 for(const phrase of ['How progress is calculated','(separate recipe)','nested progress below'])assert.ok(!materials.includes(phrase));
 assert.ok(materials.includes('if(i!==activeOption)return'));
 assert.ok(materials.includes('aria-pressed'));assert.ok(bridge.includes('.aqwc-material-row'));
 assert.ok(theme.includes('div#container-wrap'));assert.ok(!theme.includes('bannerLayer'));
 assert.ok(!theme.includes('header.prepend'));
}

{
 const bridge=read('extension/bridge.js'),items=read('extension/wiki-items.js');
 assert.ok(bridge.includes('Math.min(560,Math.max(380,Math.floor(width*.38)),Math.floor(width-590))'));
 assert.ok(bridge.includes('max-width:560px'));
 assert.ok(bridge.includes('function mountFarm(panel,content,sourceShadow)'));assert.ok(bridge.includes('node.insertAdjacentElement(where,workspace)'));assert.ok(read('extension/wiki-items.js').includes('mountFarm?.(farming,content,shadow)'));assert.ok(!read('extension/wiki-theme.js').includes('width:max-content!important'));assert.ok(read('extension/wiki-quest-shop.js').includes("g.role==='requirement'?main:aside"));assert.ok(bridge.includes('data-aqwc-layout'));assert.ok(bridge.includes('.aqwc-quest-choice[aria-pressed'));
 assert.ok(read('extension/wiki-theme.js').includes('aqwc-showcase-image'));assert.ok(read('extension/wiki-items.js').includes('img.naturalWidth>=200'));
 assert.ok(items.includes('heading.append(itemTitle,line)'));
 assert.ok(bridge.includes('.aqwc-item-heading .aqwc-state'));
 assert.ok(bridge.includes('.aqwc-meta[hidden]{display:none!important}'));
}

{
 const theme=read('extension/wiki-theme.js');
 assert.ok(theme.includes('data-aqwc-banner'));
 assert.ok(theme.includes('background-image:'+'')); 
 assert.ok(!theme.includes('background-image:none !important'));
 assert.ok(!theme.includes('header.style'));
 assert.ok(!theme.includes('header.prepend'));
}

// Block release until the owner-selected binary artwork is actually present.
{
 const art=fs.readFileSync(path.join(__dirname,'..','extension/image_2026-11-24_232002011.png'));
 assert.equal(art.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(art.toString('ascii',12,16),'IHDR');assert.ok(art.readUInt32BE(16)>0 && art.readUInt32BE(20)>0);
 assert.ok(art.length>10000 && art.length<15000000);
 assert.deepEqual(manifest.web_accessible_resources,[{resources:['image_2026-11-24_232002011.png','prometheus-helm.svg','category-icons.png'],matches:['https://aqwwiki.wikidot.com/*']}]);
}

{
 const api=vm.runInNewContext(read('extension/wiki-materials.js')+'\nAQWCWikiMaterials',{URL});
 assert.equal(api.recipeLabel([{slug:'dual-necrotic-swords-of-doom',name:'Dual Necrotic Swords of Doom'}],1,'necrotic-sword-of-doom'),'Exchange weapon');
 assert.equal(api.recipeLabel([{name:'Example',slug:'example'}],0,'other'),'Example');
 assert.ok(!read('extension/wiki-materials.js').includes('Find /join'));
 assert.ok(read('extension/wiki-quest-shop.js').includes('questCards(panel,content,title)'));
 assert.ok(read('extension/wiki-theme.js').includes('target.style.setProperty(bannerProps[i]'));
 assert.ok(read('extension/wiki-theme.js').includes('restoreInline()'));
}

{
 const api=vm.runInNewContext(read('extension/wiki-quest-shop.js')+'\nAQWCQuestShop',{URL});
 const a={textContent:'Rotten to the Corps',getAttribute:()=> 'javascript:;'},b={textContent:'A Fighting Chance',getAttribute:()=> 'javascript:;'};
 const classList=k=>({contains:v=>v===k}),p1={tagName:'DIV'},p2={tagName:'DIV'},nav={classList:classList('yui-nav'),children:[{tagName:'LI',querySelector:()=>a},{tagName:'LI',querySelector:()=>b}]},panes={classList:classList('yui-content'),children:[p1,p2]},group={children:[nav,panes]};
 a.closest=b.closest=()=>nav;nav.closest=()=>group;
 const content={contains:x=>[group,p1,p2].includes(x),ownerDocument:{getElementById:()=>null}};
 assert.equal(api.questScope(content,[a,b],'Rotten to the Corps'),p1);
 assert.equal(api.questScope(content,[a,b],'A Fighting Chance'),p2);
 panes.children.pop();assert.equal(api.questScope(content,[a,b],'A Fighting Chance'),null);
 assert.ok(!read('extension/wiki-quest-shop.js').includes('Open Daily / Weekly Tracker'));
 assert.ok(read('index.html').includes('aqwc-pinned-wiki-quests-v1'));assert.ok(read('index.html').includes('entry.quest.pin===true'));
 assert.ok(read('extension/wiki-theme.js').includes('aqwc-prometheus-artwork'));
}

{
 const api=vm.runInNewContext(read('extension/wiki-quest-shop.js')+'\nAQWCQuestShop',{URL});
 // Representative YUI pane based on the public General Gravelyn quest:
 // unlinked temporary objectives, linked monster and non-drop action.
 const link={textContent:'Corrosive Crawler',getAttribute:()=>'/corrosive-crawler',querySelector:()=>null,closest:()=>null};
 const sub=(text,links=[])=>({tagName:'LI',textContent:text,querySelectorAll:()=>links});
 const objective=(text,nested)=>({tagName:'LI',childNodes:[{nodeType:3,textContent:text}],children:[{tagName:'UL',children:nested}],querySelectorAll:()=>[]});
 const rows=[objective('Sharp Stinger x8',[sub('Dropped by Corrosive Crawler',[link])]),objective('AntiTitans Armed x8',[sub('Click blue arrows on screens 2, 3, 4 and 10')])];
 const list={tagName:'UL',children:rows};
 const marker={tagName:'P',textContent:'Items Required:',children:[],nextElementSibling:list};
 const rewards={tagName:'P',textContent:'Rewards:',children:[],nextElementSibling:{tagName:'UL',children:[objective('3,000 Gold',[])]}};
 const result=api.questLists({querySelectorAll:()=>[marker,rewards]});
 assert.equal(result.length,2);assert.equal(result[0].rows[0].text,'Sharp Stinger x8');assert.equal(result[0].rows[0].drops[0].name,'Corrosive Crawler');
 assert.equal(result[0].rows[1].instructions[0],'Click blue arrows on screens 2, 3, 4 and 10');
 assert.equal(result[1].rows[0].text,'3,000 Gold');assert.equal(result[0].rows[0].linked,null);
}

{
 const api=vm.runInNewContext(read('extension/wiki-materials.js')+'\nAQWCWikiMaterials',{URL});
 assert.equal(api.compactData('necrotic-sword-s-blade').merge[1][1],200);
 assert.equal(api.compactData('void-aura').sources.quests.length,5);
 assert.equal(api.compactData('doom-heart').sources.locations[0].join,'sepulchurebattle');
 assert.equal(api.compactData('unknown').sources,null);
 const actual={groups:[[{name:'Updated material',target:2}]],sources:{locations:[],quests:[],drops:[],shops:[]}};
 assert.equal(api.compactData('necrotic-sword-s-blade',actual).merge[0][0],'Updated material');
 assert.ok(read('extension/wiki-materials.js').includes('slice(0,6)'));
 assert.ok(!read('extension/wiki-items.js').includes('farming.open=false'));assert.ok(read('extension/wiki-materials.js').includes('panel.open=true'));
 assert.ok(read('extension/wiki-quest-shop.js').includes('content.parentElement.insertBefore(host,content)'));
 assert.ok(read('extension/wiki-theme.js').includes('top:var(--aqwc-banner-height)'));
 assert.ok(read('extension/wiki-theme.js').includes('#0b1420'));
}

{
 const bridge=read('extension/bridge.js'),quest=read('extension/wiki-quest-shop.js'),materials=read('extension/wiki-materials.js');
 assert.ok(bridge.includes('display:none;width:fit-content'));
 assert.ok(quest.includes('panel.append(cards,selected)'));
 assert.ok(quest.includes('content.hidden=!content.hidden'));
 assert.ok(materials.includes('Show less'));
 assert.ok(read('extension/wiki-theme.js').includes('aqwc-banner-backdrop'));
 assert.ok(read('extension/wishlist-queue.js').includes('status-request'));
 assert.ok(read('index.html').includes('entry.quest.complete===true'));
 const api=vm.runInNewContext(read('extension/worker.js')+'\n({cleanGoalStatus,goalStatus})',{chrome:{runtime:{onMessage:{addListener(){}}}},URL,TextEncoder});
 const state=api.cleanGoalStatus({goals:[{name:'Sword',progress:42,secret:'discard'}],pins:[{name:'Quest',source:'page',completed:false}],complete:true});
 assert.equal(state.goals[0].secret,undefined);assert.equal(api.goalStatus(state,{kind:'item',name:'Sword'},'').progress,42);
 assert.equal(api.goalStatus(state,{kind:'quest',name:'Quest'},'page').completed,false);assert.equal(api.goalStatus(state,{kind:'quest',name:'Quest'},'other').state,'absent');
 assert.equal(api.goalStatus({...state,complete:false},{kind:'item',name:'Missing'},'').state,'unknown');
 assert.equal(api.cleanGoalStatus({goals:[{name:'Sword',progress:999}],pins:[]}),null);
}

{
 const api=vm.runInNewContext(read('extension/wiki-materials.js')+'\nAQWCWikiMaterials',{URL});
 assert.equal(api.compactData('revenant-s-spellscroll').sources.quests[0].name,'Legion Fealty 1');
 assert.equal(api.compactData('exalted-crown').sources.quests.length,2);
 assert.equal(api.compactData('conquest-wreath').sources.locations[1].join,'ultradage');
}

// Visual refinements retain the original article and native menu.

{
 const bridge=read('extension/bridge.js');
 const fn=bridge.slice(bridge.indexOf('  function priceAnchor('),bridge.indexOf('  function mountFarm('));
 const priceAnchor=vm.runInNewContext(fn+'\npriceAnchor',{});
 const br={nodeName:'BR'},p={nodeName:'P'},marker={textContent:'Price:',nextSibling:{nodeName:'#text',nextSibling:br},closest:()=>p};
 const content={querySelectorAll:s=>s==='strong,b'?[marker]:[],contains:x=>x===p};
 assert.equal(priceAnchor(content).node,br);assert.equal(priceAnchor(content).where,'afterend');
 marker.textContent='Price';marker.nextSibling={nodeName:'#text',nextSibling:null};assert.equal(priceAnchor(content).node,p);
 marker.textContent='Rarity:';const ul={textContent:'Merge the following: Blade x1'};content.querySelectorAll=s=>s==='strong,b'?[marker]:[ul];assert.equal(priceAnchor(content).node,ul);assert.equal(priceAnchor(content).where,'beforebegin');
 content.querySelectorAll=()=>[];assert.equal(priceAnchor(content).node,content);
 assert.ok(read('extension/wiki-materials.js').includes("'mermaid-sushi':'mermaidsushi'"));
 assert.ok(read('extension/wiki-items.js').includes('joinControl(row,source,location.origin)'));
 assert.ok(read('extension/wiki-theme.js').includes('aqwc-faithful-wordmark'));
 const svg=read('extension/prometheus-helm.svg'),data=svg.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);assert.ok(data);const bytes=Buffer.from(data[1],'base64');assert.equal(bytes.length,3516);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.readUInt32LE(4)+8,bytes.length);
}

{const bridge=read('extension/bridge.js'),items=read('extension/wiki-items.js'),materials=read('extension/wiki-materials.js'),quests=read('extension/wiki-quest-shop.js');assert.ok(bridge.includes('workspace.append(host,statusHost)'));assert.ok(items.includes('if(!aligned)mountStatus()'));assert.ok(bridge.includes('function styleItem(content)'));assert.ok(materials.includes('Sub-recipe · Craft'));assert.ok(quests.includes('content.hidden=choices.some'));assert.ok(read('extension/wiki-theme.js').includes('aqwc-wordmark-accent'));}

{const api=vm.runInNewContext(read('extension/wiki-materials.js')+'\nAQWCWikiMaterials',{URL});const origin='https://aqwwiki.wikidot.com';const link={textContent:'Monsters',getAttribute:()=>'/monsters'};const img=(src)=>({getAttribute:()=>src,closest:()=>null});const doc=(images,monster=true)=>({querySelector:s=>s==='#page-content'?{querySelectorAll:s=>s==='strong,b'?[]:images}:{querySelectorAll:()=>monster?[link]:[]}});assert.equal(api.monsterImage(doc([img('https://i.imgur.com/H21Es6B.png'),img('/acsmall.png')]),origin,'supply-caravan'),'https://i.imgur.com/H21Es6B.png');assert.equal(api.monsterImage(doc([img('https://evil.example/a.png')]),origin,'x'),null);assert.equal(api.monsterImage(doc([img('https://i.imgur.com/a.png'),img('https://i.imgur.com/b.png')]),origin,'x'),null);assert.equal(api.monsterImage(doc([img('https://i.imgur.com/a.png')],false),origin,'x'),null);assert.ok(read('extension/bridge.js').includes('workspace.prepend(info)'));assert.ok(read('extension/wiki-theme.js').includes('aqwc-helm-frame'));}

{const bridge=read('extension/bridge.js'),theme=read('extension/wiki-theme.js'),quests=read('extension/wiki-quest-shop.js');assert.ok(bridge.includes('grid-template-columns:minmax(0,3fr) minmax(0,2fr)'));assert.ok(bridge.includes('minmax(92px,25%)'));assert.ok(bridge.includes('align-self:stretch;height:100%'));assert.ok(quests.includes("strip.className='aqwc-quest-targets';body.append(strip)"));assert.ok(bridge.includes('grid-area:targets'));assert.ok(theme.includes('aqwc-helm-frame::before'));assert.ok(!theme.includes("artwork=document.createElement('img')"));assert.ok(theme.includes('overflow:hidden!important'));}

{const bridge=read('extension/bridge.js');const fn=bridge.slice(bridge.indexOf('  function itemField('),bridge.indexOf('  function styleItem('));const itemField=vm.runInNewContext(fn+'\nitemField',{});const marker=(label,value)=>({textContent:label,nextSibling:{nodeName:'#text',textContent:value,nextSibling:{nodeName:'BR'}}});const fixture={querySelectorAll:()=>[marker('Rarity:',' Champion Rarity'),marker('Base Damage:',' 27-33')]};assert.equal(itemField(fixture,'Rarity'),'Champion Rarity');assert.equal(itemField(fixture,'Base Damage'),'27-33');assert.equal(itemField(fixture,'Sellback'),null);assert.equal(itemField({querySelectorAll:()=>[marker('Rarity:','Rare'),marker('Rarity:','Epic')]},'Rarity'),null);assert.ok(bridge.includes("disclosure.className='aqwc-native-details'"));assert.ok(bridge.includes('.aqwc-card.aqwc-inline-farm{height:100%'));assert.ok(read('extension/wiki-quest-shop.js').includes('+ Add screenshot'));}

{const theme=read('extension/wiki-theme.js'),materials=read('extension/wiki-materials.js'),bridge=read('extension/bridge.js');assert.ok(theme.includes("aria-controls','side-bar"));assert.ok(theme.includes('aqwc-wiki-sidebar-expanded-v1'));assert.ok(theme.includes('margin-left:18px!important'));assert.ok(theme.includes('border-radius:0 0 11px 11px'));assert.ok(bridge.includes('grid-column:1/-1;order:2'));assert.ok(materials.includes('monsterRequests>=64'));}

{const bridge=read('extension/bridge.js'),theme=read('extension/wiki-theme.js');assert.ok(bridge.includes('flex:1 1 145px'));assert.ok(bridge.includes('flex:0 0 100%'));assert.ok(theme.includes('if(sidebarActive){rules.push'));assert.ok(!theme.includes('#footer{display:none'));assert.ok(!theme.includes('#license-area{display:none'));}

{const api=vm.runInNewContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',{URL});assert.equal(api.indexKind('/items'),'categories');assert.equal(api.indexKind('/classes'),'alphabetic');assert.equal(api.indexKind('/quests'),'alphabetic');assert.equal(api.indexKind('/general-gravelyn-s-quests'),null);assert.equal(api.indexKind('/necrotic-sword-of-doom-sword'),null);assert.equal(api.indexKind('/sort-by-rare-classes'),'alphabetic');const origin='https://aqwwiki.wikidot.com',make=(name,href,extra='')=>({tagName:'P',textContent:name+extra,querySelector:()=>null,querySelectorAll:()=>[{textContent:name,querySelector:()=>null,getAttribute:()=>href}]});assert.equal(api.rowName(make('Acolyte','/acolyte'),origin),'Acolyte');assert.equal(api.rowName(make('Back to Top','#top'),origin),null);assert.equal(api.rowName(make('Acolyte','/acolyte',' is a class'),origin),null);assert.equal(api.runs({children:[make('Acolyte','/acolyte'),make('ArchFiend','/archfiend'),make('Back to Top','#top')]},origin).length,1);assert.ok(read('extension/wiki-quest-shop.js').includes('aqwc-monster-art-v1:'));}

{const api=vm.runInNewContext(read('extension/wiki-materials.js')+'\nAQWCWikiMaterials',{URL});const origin='https://aqwwiki.wikidot.com',link={textContent:'Monsters',getAttribute:()=>'/monsters'};const img=(src,after)=>({after,getAttribute:k=>k==='src'?src:null,closest:()=>null});const event=img('https://aqwwiki.wdfiles.com/local--files/humankind/event.png',false),art=img('https://i.imgur.com/H21Es6B.png',true);const heading={textContent:'Items Dropped:',compareDocumentPosition:i=>i.after?4:2};const doc={querySelector:s=>s==='#page-content'?{querySelectorAll:q=>q==='strong,b'?[heading]:[event,art]}:{querySelectorAll:()=>[link]}};assert.equal(api.monsterImage(doc,origin,'supply-caravan'),art.getAttribute('src'));const directory=vm.runInNewContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',{URL});assert.equal(directory.letter('Ælfred'), '#');assert.equal(directory.letter('Éclair'),'E');assert.ok(read('extension/wiki-directory.js').includes('perPage=96'));assert.ok(read('extension/wiki-quest-shop.js').includes('remaining.slice(1)'));}

{const api=vm.runInNewContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',{URL});const a=(name,href)=>({textContent:name,getAttribute:()=>href,querySelector:()=>null,closest:()=>null});const list=[a('All','/sort-by-all-quests'),...['A','B','C','D','E'].map(x=>a(x,'/quests#'+x)),a('General Gravelyn’s Quests','/general-gravelyn-s-quests'),a('Back to Top','#top'),a('Titanic Quests','/titanic-quests')];const rows=api.directoryEntries({querySelectorAll:()=>list},'https://aqwwiki.wikidot.com');assert.equal(rows.length,2);assert.equal(rows[0].name,'General Gravelyn’s Quests');assert.equal(rows[1].name,'Titanic Quests');}

{const source=read('extension/wiki-first-paint.js');function bootFixture(){
 let timer,reply,removed=0,style,requestCount=0;const ctx={location:{origin:'https://aqwwiki.wikidot.com'},document:{documentElement:{append(x){style=x}},createElement(){return{remove(){removed++}}}},setTimeout(fn,ms){assert.equal(ms,1500);timer=fn;return 1},clearTimeout(){},chrome:{runtime:{sendMessage(msg,cb){assert.equal(msg.type,'wiki-appearance-read');requestCount++;reply=cb}}}};
 vm.runInNewContext(source,ctx);return {api:ctx.AQWCWikiBoot,reply:r=>reply(r),expire:()=>timer(),removed:()=>removed,style:()=>style.textContent,requests:()=>requestCount};
}
 const a=bootFixture();assert.ok(a.style().includes('opacity:0'));assert.equal(a.requests(),1);let pref;a.reply({ok:true,appearance:{background:'cas',banner:'prometheus'}});a.api.read(v=>pref=v);assert.equal(pref.background,'cas');assert.ok(a.style().includes('#000000'));a.api.themeReady();assert.equal(a.removed(),0);a.api.layoutReady();assert.equal(a.removed(),1);a.expire();assert.equal(a.removed(),1);
 const b=bootFixture();b.expire();assert.equal(b.removed(),1);b.reply({ok:true,appearance:{background:'neutral',banner:'prometheus'}});b.api.themeReady();b.api.layoutReady();assert.equal(b.removed(),1);
 const c=bootFixture();c.reply({ok:false});assert.equal(c.removed(),1);
 const d=bootFixture();d.reply({ok:true,appearance:{background:'original',banner:'original'}});assert.equal(d.removed(),1);
 const e=bootFixture();let received;e.api.read(v=>received=v);e.api.layoutReady();e.reply({ok:true,appearance:{background:'midnight',banner:'prometheus'}});assert.equal(received.background,'midnight');assert.equal(e.removed(),0);e.api.themeReady();assert.equal(e.removed(),1);
 assert.ok(read('extension/wiki-theme.js').includes('if(boot)boot.read(finish)'));assert.ok(read('extension/wiki-directory.js').includes('AQWCWikiBoot?.layoutReady()'));
}

{const api=vm.runInNewContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',{URL});assert.equal(api.mapSectionName('NPCs:'),'NPCs');assert.equal(api.mapSectionName('Access Points:'),'Access Points');assert.equal(api.mapSectionName('Notes:'),null);const heading={tagName:'P',textContent:'Monsters:',querySelector:()=>null};const list={tagName:'UL',previousElementSibling:heading};assert.equal(api.mapSections({children:[heading,list]}).length,1);assert.equal(api.mapSections({children:[{tagName:'UL',previousElementSibling:{...heading,textContent:'Notes:'}}]}).length,0);assert.ok(read('extension/wiki-directory.js').includes("getElementById('aqwc-list-wishlist')?.remove()"));assert.ok(read('extension/wiki-theme.js').includes('aqwc-directory-aligned'));}

{const d=vm.runInNewContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',{URL});assert.equal(JSON.stringify(d.nameTags('Example (0 AC) (Legend)')),'["0 AC","Legend"]');assert.equal(JSON.stringify(d.nameTags('Example (Non-AC)')),'["Non-AC"]');assert.equal(JSON.stringify(d.tagLabels('Pseudo-Rare Seasonal Special Offer')),'["Pseudo-Rare","Seasonal","Special Offer"]');assert.equal(d.factionName('Faction Items:'),'Faction Items');assert.equal(d.factionName('Description:'),null);assert.ok(read('extension/bridge.js').includes('art.append(gallery)'));assert.ok(read('extension/wiki-directory.js').includes('moveRoomGallery(content)'));assert.ok(read('extension/wiki-materials.js').includes('itemArtRequests>=48'));}

{const d=vm.runInNewContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',{URL});assert.equal(d.factionHeading('Leader: Kyron Locations:'),'Locations');assert.equal(d.factionHeading('Faction Quests: Repeatable quests are Bold'),'Faction Quests');assert.equal(d.factionHeading('Faction Items:'),'Faction Items');assert.equal(d.factionHeading('Description:'),null);const src=read('extension/wiki-directory.js');assert.ok(src.includes('mapNavigation(content)'));assert.ok(src.includes('Search wars or year'));assert.ok(src.includes('getComputedStyle(el)'));assert.ok(!src.includes('content.prepend(inventory)'));assert.ok(read('extension/wiki-theme.js').includes("title=document.getElementById('page-title')||document.getElementById('page-content')"));}

{const d=vm.runInNewContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',{URL});assert.equal(d.searchUrl('  '),null);const u=new URL(d.searchUrl('Necrotic Sword of Doom'));assert.equal(u.origin,'https://www.google.com');assert.equal(u.searchParams.get('q'),'site:aqwwiki.wikidot.com Necrotic Sword of Doom');assert.equal(new URL(d.searchUrl('Void Aura',true)).searchParams.get('q'),'site:aqwwiki.wikidot.com "Void Aura"');assert.ok(read('extension/wiki-directory.js').includes('layoutRoomVariants(content)'));assert.ok(read('extension/wiki-theme.js').includes('.aqwc-room-variant-open'));assert.ok(read('extension/wiki-directory.js').includes('original.append(...nodes)'));}

{const d=vm.runInNewContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',{URL});for(const n of ['Rooms','NPCs','Quests','Shops'])assert.equal(d.isMapOverviewSection(n),true);for(const n of ['Monsters','Access Points','Notes & History'])assert.equal(d.isMapOverviewSection(n),false);const s=read('extension/wiki-directory.js');assert.ok(s.includes('mapOverview(content,sections)'));assert.ok(!s.includes("sectionNav(content,sections,'Rooms')"));assert.ok(s.includes('panel.hidden=true'));assert.ok(s.includes('aria-expanded'));assert.ok(read('extension/wiki-theme.js').includes('.aqwc-map-overview-single'));}

{const d=vm.runInNewContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',{URL});const origin='https://aqwwiki.wikidot.com';assert.equal(d.indexKind('/swords/p/14'),'alphabetic');assert.equal(d.indexKind('/sort-by-non-rare-ac-swords/p/6'),'alphabetic');assert.equal(d.matchesDirectory({name:'Necrotic Sword of Doom (Sword)',url:origin+'/necrotic-sword-of-doom-sword'},'Necrotic Sword of Doom'),true);assert.equal(d.matchesDirectory({name:'King’s Blade (AC)',url:origin+'/king-s-blade'},'Kings Blade'),true);assert.equal(d.matchesDirectory({name:'Café',url:origin+'/cafe'},'cafe'),true);const a=href=>({getAttribute:()=>href});assert.equal(JSON.stringify(d.paginationLinks({querySelectorAll:()=>[a('/swords/p/2'),a('/swords/p/14'),a('/guns/p/99'),a('https://evil.example/swords/p/100')]},origin,'/swords')),JSON.stringify(Array.from({length:14},(_,i)=>i+1)));assert.equal(d.isMapOverviewSection('Locations'),true);assert.ok(!read('extension/wiki-list-ownership.js').includes("if(typeof document!=='undefined')init()"));assert.ok(read('extension/wiki-directory.js').includes('styleRegion(content)'));assert.ok(read('extension/wiki-directory.js').includes('styleWeapons(content)'));}

{const materials=read('extension/wiki-materials.js'),bridge=read('extension/bridge.js');for(const name of ['aqwc-farm-overview','aqwc-progress-count','aqwc-progress-detail','aqwc-progress-meter']){assert.ok(materials.includes(name));assert.ok(bridge.includes(name))}assert.ok(materials.includes("n.missing.toLocaleString()+' missing'"));assert.ok(materials.includes('Acquisition details below'));assert.ok(bridge.includes('@container(max-width:620px)'));}

{const api=vm.runInNewContext(read('extension/wiki-materials.js')+'\nAQWCWikiMaterials',{URL});const origin='https://aqwwiki.wikidot.com',link=(name,href)=>({textContent:name,getAttribute:()=>href});const rows=[{text:'Location: Fire Avatar',links:[link('Fire Avatar','/fire-avatar')],listDepth:0},{text:"Price: N/A (Reward from the 'Avatar’s Rage' quest)",links:[link('Avatar’s Rage','/galanoth-s-quests#8')],listDepth:0},{text:'Sellback: 0 AC',links:[],listDepth:0},{text:'Notes:',links:[],listDepth:0},{text:'Used to merge War Blade of Strength',links:[link('War Blade of Strength','/war-blade-of-strength')],listDepth:1},{text:'Used to merge items in FireAvatar Merge shop',links:[link('FireAvatar Merge','/fireavatar-merge')],listDepth:1}];const result=api.parseAcquisitionLines(rows,origin);assert.equal(result.locations.length,1);assert.equal(result.quests.length,1);assert.equal(result.quests[0].slug,'galanoth-s-quests');assert.equal(result.shops.length,0);const groups=api.acquisitionGroups({sources:result});assert.equal(groups[0].title,'Quest rewards');assert.equal(groups[1].title,'Locations');assert.equal(api.acquisitionKind('Price: N/A (Dropped by Beast)'), 'drops');const d=read('extension/wiki-directory.js');assert.ok(d.includes('Promise.all(batch.map'));assert.ok(d.includes('readDirectoryCache'));assert.ok(d.includes('attempts.get(n)||0)<2'));assert.ok(read('extension/bridge.js').includes('aqwc-acquisition-grid'));}

{const api=vm.runInNewContext(read('extension/wiki-quest-shop.js')+'\nAQWCQuestShop',{URL});const tab=(href,controls)=>({getAttribute:k=>k==='href'?href:controls});const choices=[{name:'First',tab:tab('#one')},{name:'Second',tab:tab('#two','two')}];assert.equal(api.initialQuestIndex([]),-1);assert.equal(api.initialQuestIndex(choices),0);assert.equal(api.initialQuestIndex(choices,'#two'),1);assert.equal(api.initialQuestIndex(choices,'#unknown'),0);assert.equal(api.initialQuestIndex([{name:'Get some Help',tab:null}]),0);const src=read('extension/wiki-quest-shop.js');assert.ok(src.includes('void openers[initial]()'));assert.ok(src.includes("cards.style.display='none'"));assert.ok(src.includes("if(e.isTrusted)void openQuest()"));assert.ok(src.includes("type:'quest-pin-add',quest:{source,name}"));}

{const html=read('extension/popup.html'),js=read('extension/popup.js');for(const id of ['view-home','view-sync','view-settings','quick-search','appearance-background','capture-account','clear-inventory','discard-account'])assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);for(const tab of ['home','sync','settings']){assert.ok(html.includes('data-view="'+tab+'"'));assert.ok(html.includes('data-panel="'+tab+'"'))}assert.ok(js.includes("showView('home')"));assert.ok(html.includes('data-panel="sync" hidden'));assert.ok(html.includes('data-panel="settings" hidden'));}

{const popup=read('extension/popup.html');assert.ok(popup.includes('html{color-scheme:dark;width:420px;min-width:420px}'));assert.ok(popup.includes('body{width:420px;min-width:420px;'));assert.ok(!popup.includes('max-width:100vw'));}

{const theme=vm.runInNewContext(read('extension/companion-theme.js')+'\nAQWCTheme');const root=[...read('css/site.css').matchAll(/:root\s*\{([^}]+)\}/g)].at(-1)[1];for(const m of root.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi))assert.equal(theme.tokens[m[1]],m[2]);assert.ok(theme.rootCss.includes('html[data-aqwc-background="companion"]'));const css=theme.recolor('#page-content{background:#171e24;color:#e5f3ff;border:1px solid #40535c}');assert.ok(css.includes('var(--aqwc-theme-panel,#171e24)'));assert.ok(css.startsWith('#page-content{'));assert.equal(theme.recolor('a{color:#ff0000}'),'a{color:#ff0000}');assert.ok(read('extension/popup.html').includes('Cas B Neophyte'));assert.equal(theme.casTokens.selected,'#ff00ff');assert.equal(theme.lightTokens.bg,'#f5f6f8');assert.equal(theme.darkTokens.bg,'#101010');assert.equal(theme.darkTokens.panel,'#181818');assert.ok(theme.rootCss.includes('html[data-aqwc-background="dark"]'));assert.ok(read('extension/popup.html').includes('Companion (default)'));assert.ok(read('extension/popup.js').includes("background:'companion',banner:'prometheus',panel:'integrated'"));assert.ok(read('extension/wiki-first-paint.js').includes("companion:'#0b1420'"));assert.ok(read('extension/worker.js').includes("'companion','dark','light','cas'"));}

{const d=vm.runInNewContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',{URL});assert.equal(JSON.stringify(d.exactCandidates('Necrotic Sword of Doom','/swords')),'["necrotic-sword-of-doom","necrotic-sword-of-doom-sword"]');assert.equal(JSON.stringify(d.exactCandidates('Infernal Flame Pyromancer','/armors')),'["infernal-flame-pyromancer","infernal-flame-pyromancer-armor"]');assert.equal(d.exactCandidates('Example','/sort-by-rare-swords').length,0);}

{const html=read('extension/popup.html'),js=read('extension/popup.js'),directory=read('extension/wiki-directory.js');assert.ok(html.includes('id="first-sync" hidden'));assert.ok(html.includes('quick-start.html'));assert.ok(js.includes('searchPanel.hidden=empty'));assert.ok(directory.includes('exactController?.abort()'));assert.ok(directory.includes('readWikiHtml(r)'));assert.ok(directory.includes('hydrateCached();load.addEventListener'));assert.ok(read('extension/quick-start.md').includes('Browser QA before public release'));}

(async()=>{
 const origin='https://aqwwiki.wikidot.com',enc=new TextEncoder(),dec=new TextDecoder();
 let title='Necrotic Sword of Doom (Sword)',category='/swords',requests=0;
 const ctx={URL,AbortController,TextDecoder,setTimeout,clearTimeout,document:{createElement:()=>({content:{querySelector:s=>s==='#page-title'?{textContent:title}:s==='#page-content'?{}:null,querySelectorAll:()=>[{getAttribute:()=>category}]}})},fetch:async()=>{requests++;return {ok:true,headers:{get:()=> 'text/html'},body:{getReader:()=>{let read=false;return {read:async()=>read?{done:true}:(read=true,{done:false,value:enc.encode('<html>fixture</html>')}),releaseLock(){}}}}}}};
 const fixtureDocument=ctx.document;delete ctx.document;const api=vm.runInNewContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',ctx);ctx.document=fixtureDocument;
 let matches=[];const result=await api.lookupExactDirectory('Necrotic Sword of Doom','/swords',origin,new AbortController().signal,r=>matches.push(r));
 assert.equal(result.name,title);assert.ok(matches.length>=1);assert.equal(requests,2);
 category='/armors';matches=[];assert.equal(await api.lookupExactDirectory('Necrotic Sword of Doom','/swords',origin,new AbortController().signal,r=>matches.push(r)),null);assert.equal(matches.length,0);
 const controller=new AbortController();controller.abort();const before=requests;assert.equal(await api.lookupExactDirectory('Necrotic Sword of Doom','/swords',origin,controller.signal),null);assert.equal(requests,before);
 let cancelled=false,released=false;await assert.rejects(api.readWikiHtml({body:{getReader:()=>({read:async()=>({done:false,value:new Uint8Array(4000001)}),cancel:async()=>{cancelled=true},releaseLock(){released=true}})}}),/Page too large/);assert.ok(cancelled&&released);
 console.log('Exact directory search: category validation, cancellation, early results and bounded response passed.');
})().catch(e=>{console.error(e);process.exitCode=1});

{const theme=vm.runInNewContext(read('extension/companion-theme.js')+'\nAQWCTheme');assert.equal(theme.recolor('a{color:#fff;background:#000}'),'a{color:var(--aqwc-theme-whiteText,#fff);background:var(--aqwc-theme-blackSurface,#000)}');assert.equal(theme.lightTokens.whiteText,'#172b40');assert.equal(theme.lightTokens.blackSurface,'#ffffff');for(const selector of ['#top-bar','#aqwc-banner-backdrop','.aqwc-index-entry','.aqwc-item-artwork','.aqwc-home-surface','.aqwc-map-directory-card','.aqwc-faction-card','.aqwc-shop-preview'])assert.ok(theme.lightWikiCss.includes(selector));for(const selector of ['.aqwc-inline-farm','.aqwc-quest-card','.aqwc-acquisition-card'])assert.ok(theme.lightShadowCss.includes(selector));assert.ok(read('extension/wiki-theme.js').includes('theme.lightWikiCss'));assert.equal((read('extension/bridge.js').match(/lightShadowCss/g)||[]).length,2);assert.ok(read('extension/popup.js').includes('theme.lightPopupCss'));assert.ok(!read('extension/bridge.js').includes("card.className='aqwc-card'+"));}

{const d=vm.runInNewContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',{URL});const origin='https://aqwwiki.wikidot.com';assert.equal(d.categoryIconKey('/housing',origin),'houses');assert.equal(d.categoryIconKey('/capes-back-items',origin),'capes-back-items');assert.equal(d.categoryIconKey('/swords',origin),null);assert.equal(d.categoryIconKey('https://evil.example/armors',origin),null);assert.equal(d.categoryImageUrl('javascript:alert(1)',origin),null);assert.equal(d.categoryImageUrl('https://evil.example/a.png',origin),null);const img={getAttribute:k=>k==='src'?'https://aqwwiki.wdfiles.com/local--files/main/armor.png':null};const a={getAttribute:k=>k==='href'?'/armors':null,querySelectorAll:()=>[img],parentElement:null};assert.equal(d.homepageIcons({querySelectorAll:()=>[a]},origin).armors,'https://aqwwiki.wdfiles.com/local--files/main/armor.png');assert.ok(read('extension/wiki-theme.js').includes('.aqwc-category-home-icon'));assert.ok(read('extension/wiki-directory.js').includes('addCategoryIcon(a,key)'));}

{const t=vm.runInNewContext(read('extension/companion-theme.js')+'\nAQWCTheme');assert.equal(t.lightTokens.bg,'#f5f6f8');assert.equal(t.lightTokens.panel,'#ffffff');assert.equal(t.lightTokens.panel2,'#edf0f3');for(const css of [t.lightWikiCss,t.lightPopupCss]){assert.ok(css.includes('background:var(--aqwc-theme-bg)!important'));assert.ok(css.includes('color:var(--aqwc-theme-txt)!important'));assert.ok(css.includes('::placeholder'))}assert.ok(t.lightWikiCss.includes('#main-content'));assert.ok(t.lightPopupCss.includes('#inventory-summary[data-synced="true"]'));}

{const d=vm.runInNewContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',{URL});for(const [i,key] of ['armors','capes-back-items','classes','enhancements','grounds','helmets-hoods','houses','floor-items','wall-items','misc-items','necklaces','pets','weapons'].entries())assert.equal(d.categorySpriteIndex(key),i);assert.equal(d.categorySpriteIndex('unknown'),-1);assert.ok(JSON.parse(read('extension/manifest.json')).web_accessible_resources[0].resources.includes('category-icons.png'));assert.ok(read('extension/wiki-directory.js').includes("li.querySelector(':scope > ul')"));assert.ok(read('extension/wiki-directory.js').includes("a.querySelector(':scope > .aqwc-category-glyph')"));assert.ok(read('extension/wiki-theme.js').includes('background-size:1300% 100%'));}

{const sprite=fs.readFileSync(path.join(__dirname,'..','extension/category-icons.png'));assert.equal(sprite.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(sprite.readUInt32BE(16),338);assert.equal(sprite.readUInt32BE(20),26);const ctx=vm.createContext({URL,chrome:{runtime:{getURL:p=>'chrome-extension://fixture/'+p}}});const d=vm.runInContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',ctx);ctx.document={createElement:()=>({style:{},dataset:{},children:[],append(x){this.children.push(x)},setAttribute(){}})};const a={children:[],querySelector(){return this.children.find(x=>x.className.includes('aqwc-category-glyph'))},prepend(x){this.children.unshift(x)},classList:{add(){}}};d.addCategoryIcon(a,'armors');d.addCategoryIcon(a,'armors',true);assert.equal(a.children.length,1);assert.equal(a.children[0].children.length,1);assert.equal(a.children[0].children[0].style.backgroundPosition,'0% 50%');}

{const d=vm.runInNewContext(read('extension/wiki-directory.js')+'\nAQWCDirectory',{URL});const pending=[];let count=0;const schedule=d.coalescedUpdate(()=>count++,fn=>pending.push(fn));schedule();schedule();schedule();assert.equal(pending.length,1);pending.shift()();assert.equal(count,1);schedule();pending.shift()();assert.equal(count,2);}
(async()=>{const api=vm.runInNewContext(read('extension/wiki-materials.js')+'\nAQWCWikiMaterials',{URL});const cache=new Map();let time=1000,calls=0;const now=()=>time;const request=()=>{calls++;if(calls===1)throw Error('temporary');return ['art.png']};const first=api.previewCacheRequest(cache,'a',request,now);assert.equal(first,api.previewCacheRequest(cache,'a',request,now));assert.equal((await first).length,0);assert.equal((await api.previewCacheRequest(cache,'a',request,now)).length,0);assert.equal(calls,1);time+=15001;assert.equal((await api.previewCacheRequest(cache,'a',request,now))[0],'art.png');time+=60000;assert.equal((await api.previewCacheRequest(cache,'a',request,now))[0],'art.png');assert.equal(calls,2);console.log('Preview cache: in-flight deduplication, transient failure cooldown and successful reuse passed.');})().catch(e=>{console.error(e);process.exitCode=1});
