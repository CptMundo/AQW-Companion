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
    const hero=element('div','aqws-hero');
    const intro=element('div');
    intro.append(element('h2','aqws-title','📊 Your AQW Journey'),
      element('p','aqws-note','Your collection, personal milestones and Wishlist progress — calculated privately from saved exports.'));
    hero.append(intro,element('span','pill','Local data · Companion milestones'));
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

    const badges=section('🏆 Companion Milestones','Personal collection challenges calculated by AQW Companion, not official AQWorlds achievements or character badges.');
    const badgeGrid=element('div','aqws-milestones');
    for(const m of stats.milestones){
      const badge=element('div','aqws-milestone'+(m.unlocked?' unlocked':''));
      badge.append(element('div','aqws-milestone-icon',m.unlocked?'🏆':'🔒'),
        element('strong','',m.name),
        element('p','aqws-note',m.detail),
        element('span','aqws-milestone-score',fmt(Math.min(m.value,m.goal))+' / '+fmt(m.goal)));
      const track=element('div','aqws-bar-track');
      const fill=element('div','aqws-bar-fill');fill.style.width=m.percent+'%';
      track.append(fill);badge.append(track);badgeGrid.append(badge);
    }
    badges.append(badgeGrid);
    if(stats.forge.total)badges.append(element('p','aqws-note','Forge unlocks: '+fmt(stats.forge.unlocked)+' / '+fmt(stats.forge.total)+' manually confirmed.'));
    root.append(badges);
  }
  return {analyze,timeline,uniqueItems,category,render};
});
