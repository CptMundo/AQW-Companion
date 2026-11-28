/* AQW Companion Account Statistics v1: local-only snapshot analysis and UI.
 * No tracking, third-party libraries, uploads, badges/levels inferred from AQW,
 * or claims about when a player actually acquired an item.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.AQWAccountStatistics=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const TYPES=['Class','Weapon','Armor','Helm','Cape','Misc'];
  const LABELS={Class:'Classes',Weapon:'Weapons',Armor:'Armors',Helm:'Helms',Cape:'Capes',Misc:'Misc'};
  const fmt=n=>Number(n||0).toLocaleString('en-US');
  const key=s=>String(s==null?'':s).trim().toLowerCase();
  function category(type){
    const t=key(type);
    if(t==='class'||t==='classes')return 'Class';
    if(t==='armor'||t==='armors')return 'Armor';
    if(['helm','helmet','helms','helmets'].includes(t))return 'Helm';
    if(t==='cape'||t==='capes')return 'Cape';
    if(/sword|dagger|axe|mace|staff|polearm|gun|bow|weapon/.test(t))return 'Weapon';
    return 'Misc';
  }
  function uniqueItems(snapshot){
    const map=new Map();
    for(const item of (Array.isArray(snapshot?.items)?snapshot.items:[])){
      if(!item||item.ID===undefined||item.ID===null||String(item.ID)==='')continue;
      const id=String(item.ID);
      if(!map.has(id))map.set(id,item);
    }
    return map;
  }
  function captureTime(snapshot){
    for(const raw of [snapshot?.exportedAt,snapshot?.importedAt]){
      const time=Date.parse(raw||'');
      if(Number.isFinite(time))return time;
    }
    return null;
  }
  function timeline(snapshots){
    const rows=(Array.isArray(snapshots)?snapshots:[]).filter(s=>Array.isArray(s?.items))
      .map((s,i)=>({source:s,order:i,time:captureTime(s),ids:uniqueItems(s)}));
    rows.sort((a,b)=>((a.time===null?Number.MAX_SAFE_INTEGER:a.time)-(b.time===null?Number.MAX_SAFE_INTEGER:b.time))||a.order-b.order);
    return rows.map((row,i)=>{
      const previous=i?rows[i-1]:null;
      const newlyPresent=previous?[...row.ids].filter(([id])=>!previous.ids.has(id)).map(([,item])=>item):[];
      const missing=previous?[...previous.ids.keys()].filter(id=>!row.ids.has(id)).length:0;
      return {
        uid:row.source.uid||'',
        name:String(row.source.fileName||'Unnamed export'),
        timestamp:row.time,
        total:row.ids.size,
        firstSeen:newlyPresent.length,
        noLongerPresent:missing,
        firstSeenItems:newlyPresent.map(x=>({name:String(x.Name||'Unknown item'),type:category(x.Type)})),
        hasComparison:!!previous
      };
    });
  }
  function analyze(input){
    input=input||{};
    const current=Array.isArray(input.current?.items)?input.current:null;
    const records=current?current.items:[];
    const ids=uniqueItems(current), unique=[...ids.values()];
    const perType=Object.fromEntries(TYPES.map(type=>[type,0]));
    for(const item of unique)perType[category(item.Type)]++;
    const bankRecords=records.filter(x=>x&&Number(x.Bank)===1).length;
    const elsewhereRecords=records.length-bankRecords;
    const history=timeline(input.snapshots);
    const previous=history.at(-2),latest=history.at(-1);
    const projects=(Array.isArray(input.projects)?input.projects:[]).filter(p=>p&&typeof p.name==='string');
    const ownedCount=projects.filter(p=>p.owned===true).length;
    const activeCount=projects.length-ownedCount;
    const steps=projects.reduce((acc,p)=>({
      total:acc.total+Math.max(0,Number(p.steps)||0),
      done:acc.done+Math.max(0,Number(p.stepsDone)||0)
    }),{total:0,done:0});
    const byCategory=Object.fromEntries(TYPES.map(type=>[type,0]));
    for(const p of projects)byCategory[category(p.type)]++;
    const tagCounts=new Map();
    let withTags=0, withoutTags=0;
    for(const item of unique){
      let tags=[];
      try{
        const meta=typeof input.metadataLookup==='function'?input.metadataLookup(String(item.Name||'')):null;
        tags=Array.isArray(meta?.flags)?[...new Set(meta.flags.map(x=>String(x).trim()).filter(Boolean))]:[];
      }catch(_){}
      if(!tags.length){withoutTags++;continue}
      withTags++;
      for(const tag of tags)tagCounts.set(tag,(tagCounts.get(tag)||0)+1);
    }
    const forgeTotal=Math.max(0,Number(input.forgeTotal)||0);
    const forgeUnlocked=Math.min(forgeTotal,Math.max(0,Number(input.forgeUnlocked)||0));
    const classes=perType.Class;
    const uniqueCount=ids.size;
    const milestoneList=[
      {id:'import',name:'First Snapshot',detail:'Save your first inventory snapshot',value:history.length,goal:1},
      {id:'class25',name:'Class Collector',detail:'25 unique Classes',value:classes,goal:25},
      {id:'class50',name:'Class Veteran',detail:'50 unique Classes',value:classes,goal:50},
      {id:'items1000',name:'Thousand Treasures',detail:'1,000 unique item IDs',value:uniqueCount,goal:1000},
      {id:'items2000',name:'Treasure Hoarder',detail:'2,000 unique item IDs',value:uniqueCount,goal:2000},
      {id:'wishlist5',name:'Wish Granted',detail:'5 Wishlist targets owned',value:ownedCount,goal:5}
    ];
    if(forgeTotal)milestoneList.push({id:'forge5',name:'Forge Apprentice',detail:'5 manually confirmed Forge unlocks',value:forgeUnlocked,goal:5});
    // Collection thresholds measure the selected export, not lifetime acquisitions.
    const addTier=(prefix,group,value,tiers,description,icon)=>{
      for(const [goal,name] of tiers)milestoneList.push({id:prefix+goal,name,group,value,goal,detail:description(goal),icon});
    };
    const countTag=tag=>[...tagCounts].filter(([name])=>key(name)===key(tag)).reduce((n,[,count])=>n+count,0);
    addTier('class','Classes',classes,[[10,'Class Initiate'],[75,'Class Master'],[100,'Class Legend'],[150,'Class Archivist']],n=>fmt(n)+' unique Classes','🛡️');
    addTier('items','Collection',uniqueCount,[[100,'First Treasures'],[500,'Growing Collection'],[3000,'Grand Collector'],[5000,'Living Archive'],[10000,'Legendary Collection']],n=>fmt(n)+' unique item IDs','💎');
    for(const [type,prefix,icon,names] of [
      ['Weapon','weapon','⚔️',['Arms Collector','Arsenal Keeper','Master of Arms','Legendary Arsenal']],
      ['Armor','armor','🛡️',['Wardrobe Explorer','Armor Collector','Armory Master','Legendary Wardrobe']],
      ['Helm','helm','👑',['Helm Hunter','Crown Collector','Helm Master','Hall of Crowns']],
      ['Cape','cape','🧥',['Cape Collector','Cloak Keeper','Cape Master','Legendary Cloaks']],
      ['Misc','misc','📦',['Resource Collector','Resource Keeper','Stockpile Master','Grand Stockpile']]
    ])addTier(prefix,'Equipment & items',perType[type],[[50,names[0]],[100,names[1]],[250,names[2]],[500,names[3]]],n=>fmt(n)+' unique '+LABELS[type]+' IDs',icon);
    for(const [tag,prefix,icon,names] of [
      ['Rare','rare','✨',['Rare Hunter','Rare Collector','Rare Curator']],
      ['Seasonal','seasonal','📅',['Seasonal Explorer','Seasonal Collector','Seasonal Veteran']],
      ['AC','ac','💠',['AC Collector','AC Vault','AC Archivist']],
      ['Legend','legend','🌟',['Legend Collector','Legend Vault','Legend Archivist']],
      ['Pseudo Rare','pseudo','🔮',['Hidden Treasures','Pseudo Rare Collector','Pseudo Rare Curator']]
    ])addTier(prefix,'Collection tags',countTag(tag),[[25,names[0]],[100,names[1]],[250,names[2]]],n=>fmt(n)+' unique items tagged '+tag+' in the community catalog',icon);
    addTier('snapshots','Companion journey',history.length,[[5,'Journey Journal'],[10,'Dedicated Adventurer'],[25,'Chronicle Keeper'],[50,'Living Chronicle']],n=>fmt(n)+' saved inventory snapshots','📖');
    if(forgeTotal){
      addTier('forge','Forge',forgeUnlocked,[[1,'First Forging'],[10,'Forge Adept'],[20,'Forge Master']].filter(([n])=>n<=forgeTotal),n=>fmt(n)+' manually confirmed Forge unlocks','🔨');
      milestoneList.push({id:'forge-all',name:'Master of the Forge',group:'Forge',value:forgeUnlocked,goal:forgeTotal,detail:'All currently tracked Forge unlocks confirmed',icon:'🔨'});
    }
    const groups={import:'Companion journey',class25:'Classes',class50:'Classes',items1000:'Collection',items2000:'Collection',wishlist5:'Wishlist',forge5:'Forge'};
    for(const m of milestoneList)if(!m.group)m.group=groups[m.id]||'Collection';
    return {
      available:!!current,
      selectedName:current?String(current.fileName||'Selected export'):'',
      selectedTime:current?captureTime(current):null,
      totalSnapshots:history.length,
      uniqueIds:uniqueCount,recordCount:records.length,
      bankRecords,elsewhereRecords,classes,
      categories:TYPES.map(type=>({type,label:LABELS[type],count:perType[type]})),
      wishlist:{total:projects.length,owned:ownedCount,active:activeCount,stepsDone:steps.done,stepsTotal:steps.total,byCategory},
      wishlistFinds:{
        count:Math.max(0,Number(input.wishlistFinds?.count)||0),
        recent:(Array.isArray(input.wishlistFinds?.recent)?input.wishlistFinds.recent:[]).slice(0,12)
      },
      forge:{unlocked:forgeUnlocked,total:forgeTotal},
      communityTags:{counts:[...tagCounts].sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count})),
        tagged:withTags,unknown:withoutTags},
      history,
      latestChange:latest?.hasComparison?{
        from:previous.name,to:latest.name,
        firstSeen:latest.firstSeen,noLongerPresent:latest.noLongerPresent,
        firstSeenItems:latest.firstSeenItems.slice(0,8)
      }:null,
      milestones:milestoneList.map(m=>({...m,unlocked:m.value>=m.goal,percent:Math.min(100,Math.round(m.value/m.goal*100))}))
    };
  }
  // Retrospective snapshot evidence only; tracker and catalog edits have no historical unlock timestamps.
  function homeMilestoneHighlights(stats,snapshots){
    const milestones=stats?.milestones||[];
    const next=milestones.filter(m=>!m.unlocked&&m.goal>0).sort((a,b)=>b.value/b.goal-a.value/a.goal||(a.goal-a.value)-(b.goal-b.value)||a.name.localeCompare(b.name))[0]||null;
    const ordered=(Array.isArray(snapshots)?snapshots:[]).filter(s=>Array.isArray(s?.items)&&captureTime(s)!==null).map((s,i)=>({s,i,time:captureTime(s)})).sort((a,b)=>a.time-b.time||a.i-b.i);
    const eligible=milestones.filter(m=>m.unlocked&&!['Forge','Wishlist','Collection tags'].includes(m.group));
    const counts=new Map();
    const countsAt=row=>{
      if(!counts.has(row)){const records=uniqueItems(row.s),byType={};for(const item of records.values()){const type=key(category(item.Type));byType[type]=(byType[type]||0)+1}counts.set(row,{total:records.size,byType})}
      return counts.get(row);
    };
    const seenAt=(row,index,m)=>{
      if(!row)return false;
      if(m.id==='import'||m.id.startsWith('snapshots'))return index+1>=m.goal;
      const type=m.id.match(/^(class|weapon|armor|helm|cape|misc)/)?.[1],c=countsAt(row);
      if(type)return (c.byType[type]||0)>=m.goal;
      if(m.id.startsWith('items'))return c.total>=m.goal;
      return false;
    };
    let latest=null;
    for(let i=ordered.length-1;i>=0;i--){
      const row=ordered[i],prior=ordered[i-1];
      if(prior&&prior.time===row.time)continue;
      const crossed=eligible.filter(m=>seenAt(row,i,m)&&(prior?!seenAt(prior,i-1,m):m.id==='import'));
      if(crossed.length){crossed.sort((a,b)=>b.goal-a.goal||a.name.localeCompare(b.name));latest={milestone:crossed[0],count:crossed.length,observedAt:row.time};break}
    }
    return {latest,next};
  }
  function element(tag,cls,text){
    const e=document.createElement(tag);
    if(cls)e.className=cls;
    if(text!==undefined&&text!==null)e.textContent=String(text);
    return e;
  }
  function section(title,description){
    const card=element('section','aqws-card');
    card.append(element('h3','aqws-section-title',title));
    if(description)card.append(element('p','aqws-note',description));
    return card;
  }
  function button(text,callback){
    const b=element('button','smallbutton',text);
    b.type='button';
    b.addEventListener('click',callback);
    return b;
  }
  function stat(label,value,detail){
    const card=element('div','aqws-stat');
    card.append(element('span','aqws-stat-label',label),element('strong','aqws-stat-value',fmt(value)),element('small','aqws-note',detail));
    return card;
  }
  function readableDate(time){
    if(!Number.isFinite(time))return 'Date not recorded';
    return new Date(time).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
  }
  function simpleBar(label,count,max){
    const row=element('div','aqws-bar-row');
    const header=element('div','aqws-bar-caption');
    header.append(element('span','',label),element('strong','',fmt(count)));
    const track=element('div','aqws-bar-track');
    const fill=element('div','aqws-bar-fill');
    fill.style.width=(max?Math.max(0,count)/max*100:0).toFixed(2)+'%';
    track.append(fill);row.append(header,track);return row;
  }
  const SVG_NS='http://www.w3.org/2000/svg';
  function svgTag(tag,attrs){
    const node=document.createElementNS(SVG_NS,tag);
    for(const [name,value] of Object.entries(attrs||{}))node.setAttribute(name,String(value));
    return node;
  }
  function chart(rows){
    const wrap=element('div','aqws-chart-wrap');
    const w=680,h=210,padL=43,padR=19,padT=22,padB=36;
    const values=rows.map(r=>r.total), hi=Math.max(...values),lo=Math.min(...values);
    const span=Math.max(1,hi-lo);
    const scaleMin=Math.max(0,Math.floor((lo-span*.3)/10)*10);
    const scaleMax=Math.max(hi+1,Math.ceil((hi+span*.3)/10)*10);
    const x=i=>padL+(rows.length<=1?0:(w-padL-padR)*i/(rows.length-1));
    const y=v=>padT+(h-padT-padB)*(scaleMax-v)/(scaleMax-scaleMin);
    const svg=svgTag('svg',{viewBox:'0 0 '+w+' '+h,role:'img','aria-label':'Unique item IDs recorded in each snapshot, from '+fmt(values[0])+' to '+fmt(values.at(-1))});
    const grid=[scaleMin,(scaleMin+scaleMax)/2,scaleMax];
    for(const val of grid){
      const yy=y(val);
      svg.append(svgTag('line',{x1:padL,y1:yy,x2:w-padR,y2:yy,stroke:'#385269','stroke-width':1,'stroke-dasharray':'3 5'}));
      const t=svgTag('text',{x:padL-7,y:yy+4,fill:'#acc4d6','font-size':11,'text-anchor':'end'});
      t.textContent=fmt(Math.round(val));svg.append(t);
    }
    const points=rows.map((r,i)=>[x(i),y(r.total)]);
    if(points.length>1)svg.append(svgTag('polyline',{points:points.map(p=>p.join(',')).join(' '),fill:'none',stroke:'#57d2f4','stroke-width':3,'stroke-linejoin':'round','stroke-linecap':'round'}));
    for(const [i,p] of points.entries()){
      const dot=svgTag('circle',{cx:p[0],cy:p[1],r:4,fill:'#67e2fb',stroke:'#071927','stroke-width':2});
      const tip=svgTag('title');tip.textContent=readableDate(rows[i].timestamp)+' · '+fmt(rows[i].total)+' unique item IDs';
      dot.append(tip);svg.append(dot);
    }
    if(rows.length){
      for(const i of [...new Set([0,Math.floor((rows.length-1)/2),rows.length-1])]){
        const t=svgTag('text',{x:x(i),y:h-8,fill:'#acc4d6','font-size':11,'text-anchor':i===0?'start':i===rows.length-1?'end':'middle'});
        t.textContent=rows[i].timestamp?new Date(rows[i].timestamp).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'Import '+(i+1);
        svg.append(t);
      }
    }
    wrap.append(svg);
    wrap.append(element('p','aqws-note','Chart scale adjusts to show differences; see exact counts below. Dates are export dates where available.'));
    return wrap;
  }
  function render(root,stats,handlers){
    if(!root)return;
    root.replaceChildren();
    handlers=handlers||{};
    if(handlers.milestonesOnly){renderMilestones(root,stats);return;}

    const hero=element('div','aqws-hero');
    const intro=element('div');
    intro.append(element('h2','aqws-title','📊 Your AQW Journey'),
      element('p','aqws-note','Your collection and Wishlist progress — calculated privately from saved exports.'));
    hero.append(intro,element('span','pill','Local data'));
    root.append(hero);
    if(!stats.available){
      const empty=section('📦 Start your collection history','Import your AQWorlds inventory JSON to see collection statistics. A second saved snapshot unlocks the growth chart and change history.');
      empty.append(button('Import JSON export',()=>handlers.onImport?.()));
      root.append(empty);return;
    }
    const source=element('div','aqws-source');
    source.append(element('span','', 'Based on selected snapshot: '),
      element('strong','',stats.selectedName),
      element('span','aqws-note',' · '+readableDate(stats.selectedTime)+' · '+fmt(stats.totalSnapshots)+' saved snapshot(s)'));
    root.append(source);
    const kpis=element('div','aqws-kpis');
    for(const x of [
      ['Unique Items',stats.uniqueIds,'Distinct item IDs in selected snapshot'],
      ['Classes',stats.classes,'Unique Classes owned'],
      ['In Bank',stats.bankRecords,'Inventory records, not bank slots'],
      ['Outside Bank',stats.elsewhereRecords,'Includes non-bank resources / housing']
    ])kpis.append(stat(...x));
    root.append(kpis);

    const mainGrid=element('div','aqws-columns');
    const cat=section('🗂️ Collection Breakdown','Unique item IDs by category in the selected snapshot.');
    const maxCat=Math.max(1,...stats.categories.map(x=>x.count));
    for(const r of stats.categories)cat.append(simpleBar(r.label,r.count,maxCat));
    mainGrid.append(cat);
    const rarity=section('✨ Rarity & Collection Tags','Tags are imported from the community catalog and may overlap; items without a tag are Unknown, never assumed Common.');
    rarity.append(element('p','aqws-tag-info',fmt(stats.communityTags.tagged)+' unique items with tags · '+fmt(stats.communityTags.unknown)+' Unknown / unclassified'));
    if(!stats.communityTags.tagged)rarity.append(element('p','aqws-note','No community rarity tags matched this snapshot. The collection totals still work without them.'));
    else {
      const maxTag=Math.max(1,...stats.communityTags.counts.map(x=>x.count));
      for(const t of stats.communityTags.counts.slice(0,7))rarity.append(simpleBar(t.name,t.count,maxTag));
    }
    mainGrid.append(rarity);root.append(mainGrid);

    const growth=section('📈 Collection Growth','A snapshot-to-snapshot comparison; new or missing IDs do not prove when an item was acquired, traded, used or deleted.');
    if(stats.history.length<2){
      growth.append(element('p','aqws-empty','Import a second snapshot to unlock your collection timeline. Current snapshot: '+fmt(stats.uniqueIds)+' unique item IDs.'));
    }else {
      growth.append(chart(stats.history));
      const tableWrap=element('div','aqws-history-scroll');
      const table=element('table','aqws-history');
      const head=element('thead');const header=element('tr');
      for(const name of ['Export','Unique IDs','First seen','No longer present'])header.append(element('th','',name));
      head.append(header);table.append(head);
      const body=element('tbody');
      for(const row of stats.history.slice(-8)){
        const tr=element('tr');
        tr.append(element('td','',readableDate(row.timestamp)+' · '+row.name));
        tr.append(element('td','',fmt(row.total)));
        tr.append(element('td','',row.hasComparison?fmt(row.firstSeen):'—'));
        tr.append(element('td','',row.hasComparison?fmt(row.noLongerPresent):'—'));
        body.append(tr);
      }
      table.append(body);tableWrap.append(table);growth.append(tableWrap);
    }
    growth.append(button('Open snapshot history ↗',()=>handlers.onHistory?.()));
    root.append(growth);

    const third=element('div','aqws-columns');
    const wishlist=section('🎯 Wishlist Progress','Owned means the item name appears in the currently selected inventory export. Checkpoint counts cover only listed steps, not an entire farm.');
    const goalStats=element('div','aqws-goal-kpis');
    goalStats.append(stat('Goals Tracked',stats.wishlist.total,'Saved Wishlist projects'),
      stat('Targets Owned',stats.wishlist.owned,'Detected in selected export'),
      stat('Still Missing',stats.wishlist.active,'Not detected in selected export'));
    wishlist.append(goalStats);
    if(stats.wishlist.stepsTotal)wishlist.append(simpleBar('Known steps completed ('+fmt(stats.wishlist.stepsDone)+' / '+fmt(stats.wishlist.stepsTotal)+')',stats.wishlist.stepsDone,stats.wishlist.stepsTotal));
    else wishlist.append(element('p','aqws-note','No known recipe checkpoints recorded yet.'));
    wishlist.append(button('Open Wishlist ↗',()=>handlers.onWishlist?.()));third.append(wishlist);

    const recent=section('🕰️ Recently Seen in Your Imports','Changes compare the latest two saved captures, which may differ from your selected snapshot.');
    if(!stats.latestChange)recent.append(element('p','aqws-note','Import another snapshot to see which item IDs first appear or disappear between captures.'));
    else{
      recent.append(element('p','aqws-tag-info','+'+fmt(stats.latestChange.firstSeen)+' IDs first seen · '+fmt(stats.latestChange.noLongerPresent)+' no longer present'));
      if(stats.latestChange.firstSeenItems.length){
        const ul=element('ul','aqws-recent');
        for(const x of stats.latestChange.firstSeenItems)ul.append(element('li','',x.name+' · '+x.type));
        recent.append(ul);
        if(stats.latestChange.firstSeen>8)recent.append(element('p','aqws-note','Showing 8 of '+fmt(stats.latestChange.firstSeen)+' newly visible IDs.'));
      }
    }
    third.append(recent);root.append(third);

    const wins=section('🎉 Recent Wishlist Finds',
      'Targets first seen between two saved inventory exports. This is when the Companion noticed them, not proof of the exact date obtained in AQWorlds.');
    if(!stats.wishlistFinds?.count){
      wins.append(element('p','aqws-note',
        'No new Wishlist matches between imports yet. Keep your goals and import a newer inventory export to spot them.'));
    }else{
      wins.append(element('p','aqws-tag-info',
        fmt(stats.wishlistFinds.count)+' Wishlist target(s) first seen across your imports'));
      const list=element('ul','aqws-wishlist-finds');
      for(const found of stats.wishlistFinds.recent){
        const row=element('li','aqws-wishlist-find');
        row.append(element('strong','',found.name),
          element('span','aqws-note',found.type+' · First observed '+readableDate(found.firstSeenAt)));
        list.append(row);
      }
      wins.append(list);
    }
    wins.append(button('Open Wishlist ↗',()=>handlers.onWishlist?.()));
    root.append(wins);

  }
  // Original Companion achievement artwork: category-specific vector emblems and tier numerals.
  function milestoneArtwork(m){
    const id=String(m?.id||'');
    const kind=id.match(/^(class|items|weapon|armor|helm|cape|misc|rare|seasonal|ac|legend|pseudo|snapshots|forge|wishlist|import)/)?.[1]||'import';
    const designs={
      class:['#60dbf4','M32 13L47 19V33Q47 43 32 49Q17 43 17 33V19Z M32 23V39M24 31H40'],
      items:['#6bd9b0','M16 26L24 17H40L48 26L32 47Z M16 26H48M24 17L32 47L40 17'],
      weapon:['#f2b86f','M17 46L43 20L49 15L48 26L23 51M20 35L29 44M33 29L39 35'],
      armor:['#78a9fa','M23 18L17 23L12 33L21 38L23 48H41L43 38L52 33L47 23L41 18L32 24Z'],
      helm:['#e8b875','M17 32Q17 16 32 16Q47 16 47 32V46L38 42L32 49L26 42L17 46Z M21 30H43M32 31V41'],
      cape:['#b4a0fa','M24 17H40L47 45Q32 51 17 45Z M24 17L32 26L40 17M32 26V44'],
      misc:['#7ad8b6','M16 24L32 16L48 24V43L32 51L16 43Z M16 24L32 32L48 24M32 32V51M24 20L40 28'],
      rare:['#ed9be0','M32 13L36 26L50 32L36 36L32 49L28 36L14 32L28 26Z'],
      seasonal:['#8ed6ff','M32 15V49M17 23L47 41M17 41L47 23M26 20L32 26L38 20M26 44L32 38L38 44'],
      ac:['#f5c968','M32 15L46 22L48 37L40 48H24L16 37L18 22Z M26 40L32 23L38 40M28 34H36'],
      legend:['#f7db91','M15 25L24 32L32 17L40 32L49 25L43 45H21Z M22 49H42'],
      pseudo:['#bfa0fb','M32 16L46 30L32 46L18 30Z M32 25L39 32L32 39L25 32Z'],
      snapshots:['#94c9f2','M13 19Q25 17 32 24Q39 17 51 19V44Q39 42 32 49Q25 42 13 44Z M32 24V49M19 28L26 30M38 30L45 28'],
      forge:['#efae75','M16 38H48L42 45H22Z M32 38V29M22 17L39 25L34 35L17 27Z M36 31L47 20'],
      wishlist:['#f3a4b0','M32 46L18 33Q11 21 22 19Q29 18 32 26Q35 18 42 19Q53 21 46 33Z'],
      import:['#78d8ed','M17 18H41L47 24V46H17Z M41 18V24H47M32 25V40M25 33L32 40L39 33']
    };
    const [accent,motif]=designs[kind],goal=Math.max(0,Math.floor(Number(m?.goal)||0));
    const tier=id==='forge-all'?'ALL':goal>=1000?(goal/1000)+'K':String(goal);
    const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 82"><path d="M36 2 65 14 70 45 58 66 36 80 14 66 2 45 7 14Z" fill="#101e30" stroke="'+accent+'" stroke-width="2.5"/><path d="M36 8 60 18 64 43 53 61 36 72 19 61 8 43 12 18Z" fill="#20364c" stroke="'+accent+'" stroke-opacity=".5"/><g transform="translate(4 0)" fill="none" stroke="'+accent+'" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="'+motif+'"/></g><path d="M14 53H58L54 69H18Z" fill="#101b29" stroke="'+accent+'"/><text x="36" y="65" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="'+(tier.length>3?'9':'12')+'" fill="'+accent+'">'+tier+'</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }
  function milestoneImage(m,cls='aqwm-art'){
    const img=element('img',cls);img.src=milestoneArtwork(m);img.alt='';img.width=72;img.height=82;img.decoding='async';return img;
  }
  function renderMilestones(root,stats,handlers={}){
    if(!root)return;
    root.replaceChildren();
    const milestones=stats.milestones||[];
    const completed=milestones.filter(m=>m.unlocked).length;
    const hero=element('section','aqwm-hero');
    const intro=element('div','aqwm-intro');
    intro.append(element('div','aqwm-eyebrow','YOUR AQW JOURNEY'),element('h2','aqwm-title','🏆 Companion Milestones'),element('p','aqws-note','Every collection has a story. Celebrate your progress and discover your next milestone.'));
    hero.append(intro);
    const score=element('div','aqwm-score');
    score.append(element('strong','',fmt(completed)+' / '+fmt(milestones.length)),element('span','','Milestones unlocked'));
    const meter=element('div','aqws-bar-track');const fill=element('div','aqws-bar-fill');fill.style.width=(milestones.length?Math.round(completed/milestones.length*100):0)+'%';meter.append(fill);score.append(meter);hero.append(score);root.append(hero);
    if(!stats.available){const empty=section('Begin your journey','Import your inventory to discover your collection milestones.');empty.append(button('Import JSON export',()=>handlers.onImport?.()));root.append(empty);return}
    for(const [title,list] of [['Unlocked milestones',milestones.filter(m=>m.unlocked)],['Next milestones',milestones.filter(m=>!m.unlocked)]]){
      const panel=element('section','aqwm-section');
      const heading=element('div','aqwm-section-head');heading.append(element('h3','',title),element('span','aqwm-count',fmt(list.length)));panel.append(heading);
      if(!list.length){panel.append(element('p','aqws-note',title==='Unlocked milestones'?'Your journey is just beginning.':'You have unlocked every currently available milestone!'));root.append(panel);continue}
      const grouped=new Map();
      for(const m of list){if(!grouped.has(m.group))grouped.set(m.group,[]);grouped.get(m.group).push(m);}
      for(const [group,members] of grouped){
      panel.append(element('h4','aqwm-group-title',group));
      const grid=element('div','aqwm-grid');
      for(const m of members){
        const card=element('article','aqwm-card'+(m.unlocked?' is-unlocked':''));
        const top=element('div','aqwm-card-top');
        top.append(milestoneImage(m),element('span','aqwm-status',m.unlocked?'✓ Unlocked':'In progress'));card.append(top);
        card.append(element('h4','',m.name),element('p','aqws-note',m.detail));
        const line=element('div','aqwm-progress');line.append(element('span','',fmt(Math.min(m.value,m.goal))+' / '+fmt(m.goal)),element('strong','',m.percent+'%'));card.append(line);
        const track=element('div','aqws-bar-track');const bar=element('div','aqws-bar-fill');bar.style.width=m.percent+'%';track.append(bar);card.append(track);grid.append(card);
      }
      panel.append(grid);}
      root.append(panel);
    }
    root.append(element('p','aqwm-footnote','Personal Companion milestones based on your selected inventory and tracker data. These are not official AQWorlds badges.'));
  }
  return {analyze,timeline,uniqueItems,category,render,renderMilestones,homeMilestoneHighlights,milestoneArtwork,milestoneImage};
});
