(() => {
 'use strict';
 const goals=document.getElementById('mini-goals'),routines=document.getElementById('mini-routines'),updated=document.getElementById('mini-updated');
 if(!goals||!routines||!updated)return;
 const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
 const note=(root,text)=>root.append(element('p','mini-note',text));
 const name=(row,text)=>{const n=element('span','mini-name',text);n.title=text;row.append(n)};
 function joinButton(command){
  if(typeof command!=='string'||command.length>100||!/^\/join [a-z0-9_-]+$(?![\s\S])/i.test(command))return null;
  const b=element('button','mini-join',command+' ⧉');b.type='button';b.title='Copy '+command;b.setAttribute('aria-label',b.title);
  let timer;
  b.addEventListener('click',async()=>{
   try{await navigator.clipboard.writeText(command);b.textContent='Copied ✓';b.setAttribute('aria-label','Copied '+command)}
   catch{b.textContent='Copy failed · retry';b.setAttribute('aria-label','Copy failed. Retry '+command)}
   if(timer)clearTimeout(timer);timer=setTimeout(()=>{b.textContent=command+' ⧉';b.setAttribute('aria-label',b.title)},1500);
  });return b;
 }
 const limit=4,expanded=new Set();
 function showRows(root,key,rows){
  const list=element('div','mini-rows');list.id='mini-rows-'+key;root.append(list);
  for(const row of rows)list.append(row);
  if(rows.length<=limit){expanded.delete(key);return}
  const toggle=element('button','mini-more');toggle.type='button';toggle.setAttribute('aria-controls',list.id);
  const update=()=>{const open=expanded.has(key);rows.forEach((row,i)=>{row.hidden=!open&&i>=limit});toggle.textContent=open?'Show less −':'Show '+(rows.length-limit)+' more +';toggle.setAttribute('aria-expanded',String(open))};
  toggle.addEventListener('click',()=>{if(expanded.has(key))expanded.delete(key);else expanded.add(key);update()});
  update();root.append(toggle);
 }
 let last='',busy=false;
 function render(snapshot,error=false,pending=[],notice=null){
  const daily=globalThis.AQWCMiniTracker.period('daily'),weekly=globalThis.AQWCMiniTracker.period('weekly');
  const signature=JSON.stringify([snapshot,error,daily,weekly,pending,notice]);if(signature===last)return;last=signature;
  goals.replaceChildren();routines.replaceChildren();
  if(!snapshot){note(goals,error?'Could not read saved goals.':'Open Companion to load your Wishlist.');note(routines,error?'Could not read saved tasks.':'Open Companion to load your Tracker.');updated.textContent='Your trackers are stored locally.';return}
  const list=Array.isArray(snapshot.goals)?snapshot.goals:[];
  if(!list.length)note(goals,snapshot.complete?'No items in your Wishlist.':'Wishlist data is incomplete. Open Companion to refresh.');
  const goalRows=[];
  for(const g of [...list].sort((a,b)=>Number(a.progress===100)-Number(b.progress===100))){
   const row=element('div','mini-row');name(row,g.name);
   const bar=element('span','mini-bar');bar.setAttribute('aria-hidden','true');const fill=element('span');fill.style.width=Math.max(0,Math.min(100,g.progress))+'%';bar.append(fill);
   row.append(bar,element('span','mini-value',g.progress+'%'));goalRows.push(row);
  }
  if(goalRows.length)showRows(goals,'wishlist',goalRows);
  if(!snapshot.complete&&list.length)note(goals,'Partial list · open Companion for all goals.');
  const data=snapshot.routines;
  if(!data)note(routines,'Open or refresh Companion to sync your daily and weekly tasks.');
  else if(!data.entries.length)note(routines,'No daily or weekly tasks pinned.');
  else {if(!data.canEdit)note(routines,'Refresh the updated Companion site to enable quest checks.');for(const [freq,title,current] of [['daily','Daily',daily],['weekly','Weekly',weekly]]){
   const entries=data.entries.filter(t=>t.freq===freq),fresh=data[freq+'Period']===current;
   const group=element('div','mini-group');group.append(element('span','',title),element('span','',fresh?entries.filter(x=>x.state==='done').length+' checked · '+entries.length+' pinned':'Refresh after reset'));routines.append(group);
   if(!entries.length){note(routines,'No '+freq+' tasks pinned.');continue}
   const taskRows=[];
   // Pending intent controls placement only; the confirmed check and counter still come from the site.
   const pendingFor=task=>fresh?pending.find(x=>x.taskId===task.id&&x.freq===freq&&x.period===current):undefined;
   const rank=task=>{if(!fresh)return 0;const queued=pendingFor(task);if(queued&&typeof queued.done==='boolean')return queued.done?2:0;return task.state==='done'?2:task.state==='todo'?0:1};
   for(const task of [...entries].sort((a,b)=>rank(a)-rank(b))){
    const row=element('div','mini-row');const state=fresh?task.state:'unknown',queued=!!pendingFor(task);
    const icon=element('button','mini-state',queued?'…':state==='done'?'✓':state==='alternative'?'↔':state==='todo'?'✓':'—');icon.type='button';icon.dataset.state=queued?'pending':state;icon.disabled=queued||!fresh||!task.id||!data.canEdit||state==='alternative';
    icon.title=queued?'Waiting for Companion to sync':state==='alternative'?'Undo the alternative quest first':!fresh?'Refresh Companion for the new tracking period':(!task.id||!data.canEdit)?'Refresh the updated Companion site to enable checks':state==='done'?'Mark as not done: '+task.name:'Mark as done: '+task.name;
    icon.setAttribute('aria-label',icon.title);icon.setAttribute('aria-pressed',String(state==='done'));
    icon.addEventListener('click',async()=>{if(icon.disabled)return;icon.disabled=true;try{const r=await chrome.runtime.sendMessage({type:'routine-check-set',taskId:task.id,freq,period:current,done:state!=='done'});if(!r?.ok)throw Error(r?.error||'Could not save check.');icon.textContent=r.pending?'…':icon.textContent;updated.textContent=r.pending?'Pending · open Companion to sync.':'Already saved.';await refresh()}catch(e){icon.disabled=false;updated.textContent=e.message||'Could not save check.'}});
    row.append(icon);name(row,task.name);const copy=joinButton(task.join);if(copy)row.append(copy);taskRows.push(row);
   }
   showRows(routines,freq,taskRows);
  }}
  updated.textContent='Last tracker sync: '+(Number.isFinite(snapshot.at)?new Date(snapshot.at).toLocaleString():'unknown')+(pending.length?' · '+pending.length+' pending — open or refresh Companion to sync.':'')+(notice?' · '+notice:'');
 }
 async function refresh(){if(busy||document.hidden)return;busy=true;try{const r=await chrome.runtime.sendMessage({type:'mini-tracker-read'});if(!r?.ok)throw Error('Tracker unavailable');render(r.snapshot,false,r.pending||[],r.notice||null)}catch{render(null,true)}finally{busy=false}}
 refresh();setInterval(refresh,3000);document.addEventListener('visibilitychange',refresh);
})();
