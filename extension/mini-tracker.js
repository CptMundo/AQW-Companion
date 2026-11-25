/* Limited projection of the Companion's saved routine tracker. */
(() => {
 'use strict';
 const key='aqw-companion-planner-v09';
 function period(freq,now=new Date()){
  const shifted=new Date(now.getTime()-5*3600000-(freq==='weekly'?60000:0));
  const day=shifted.toISOString().slice(0,10);
  if(freq==='daily')return 'd:'+day;
  const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+2)%7);
  return 'w:'+d.toISOString().slice(0,10);
 }
 // Match the site's main quest-card action: accept location first, then the primary map.
 function cleanJoin(value){return typeof value==='string'&&value.length<=100&&/^\/join [a-z0-9_-]+$(?![\s\S])/i.test(value)?value:''}
 function readRoutines(storage,now=new Date()){
  try{
   const raw=storage.getItem(key);
   if(raw&&raw.length>4000000)return null;
   const v=JSON.parse(raw||'{}');
   if(!v||typeof v!=='object'||Array.isArray(v)||v.pinned!==undefined&&!Array.isArray(v.pinned)||v.checks!==undefined&&(!v.checks||typeof v.checks!=='object'||Array.isArray(v.checks)))return null;
   const pins=v.pinned||[],checks=v.checks||{},dailyPeriod=period('daily',now),weeklyPeriod=period('weekly',now),seen=new Set(),entries=[];
   if(pins.length>250)return null;
   for(const t of pins){
    if(!t||!['daily','weekly'].includes(t.freq)||typeof t.id!=='string'||!/^[a-zA-Z0-9_-]{1,150}$/.test(t.id)||typeof t.name!=='string'||!t.name.trim()||t.name.length>350||/[\u0000-\u001f\u007f]/.test(t.name)||['guide-ultra-kathool','legion-ex'].includes(t.id)||/one-time chain stage|retired event quest|legacy or retired quest/i.test(t.note||''))continue;
    const p=t.freq==='daily'?dailyPeriod:weeklyPeriod,k=p+'|'+t.id;
    if(seen.has(k))continue;seen.add(k);
    const done=checks[k]===true;
    // These two mutually exclusive weekly quests are the current site's reviewed group.
    const other=t.id==='gramiel-weekly'?'gramiel-echoes-weekly':t.id==='gramiel-echoes-weekly'?'gramiel-weekly':null;
    const alternative=!done&&t.freq==='weekly'&&other!==null&&checks[p+'|'+other]===true;
    const join=cleanJoin(t.acceptJoin)||cleanJoin(t.join);
    entries.push({id:t.id,name:t.name,freq:t.freq,state:done?'done':alternative?'alternative':'todo',...(join?{join}:{})});
   }
   return {dailyPeriod,weeklyPeriod,entries};
  }catch{return null}
 }
 globalThis.AQWCMiniTracker=Object.freeze({period,readRoutines,cleanJoin});
})();
