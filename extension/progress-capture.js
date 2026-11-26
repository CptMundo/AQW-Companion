/* Read only the visible, explicitly opened official Progress Badges page. No cookies, requests, forms or raw page content are exported. */
function captureAccountProgress(summary=null){
 if(location.origin!=='https://account.aq.com')throw Error('Open AQW Account Manager → Badge Tracker first.');
 const normalize=s=>String(s||'').replace(/\s+/g,' ').trim();
 const lines=document.body.innerText.split(/\n/).map(normalize).filter(Boolean);
 const text=normalize(document.body.innerText);
 const headings={'Progress Summary':'summary','Sagas Completed':'sagas','Time Played':'playtime','Membership Progress':'membership','AdventureCoins Progress':'ac'};
 const hits=Object.keys(headings).filter(x=>lines.includes(x));
 if(hits.length!==1||!lines.includes('Progress Badges'))throw Error('Open one of the five Progress Badges pages first.');
 const section=headings[hits[0]],capturedAt=new Date().toISOString();
 if(section==='summary'){
  const get=(re)=>{const m=text.match(re);if(!m)throw Error('Summary field not found.');const n=Number(m[1].replace(/,/g,''));if(!Number.isSafeInteger(n)||n<0)throw Error('Invalid summary field.');return n};
  const created=text.match(/Character Created:\s*(\d{4}-\d{2}-\d{2})/i)?.[1];
  if(!created)throw Error('Character creation date not found.');
  const months=get(/Membership\s+Purchased:\s*([\d,]+)\s+Months/i);
  const purchased=get(/AdventureCoins\s+Purchased:\s*([\d,]+)/i);
  const bonus=get(/Bonus Coins:\s*([\d,]+)/i),total=get(/TOTAL:\s*([\d,]+)/i);
  if(purchased+bonus!==total)throw Error('AC totals do not match.');
  return {section,capturedAt,created,months,purchased,bonus,total};
 }
 const names={sagas:['Prologue','Shadowfall','Chiral Valley','Dwarfhold','Yokai','Darkovia','Mythsong','Arcangrove','Sandsea','Bloodtusk','The Span','Thunderforge','Swordhaven','Mirror Realm','Chaos Realm'],playtime:['1 Week','1 Month','3 Months','6 Months','12 Months','15 Months',...Array.from({length:14},(_,i)=>(i+2)+' Years')],membership:['1 Month','2 Months','3 Months','6 Months','9 Months','12 Months','15 Months',...Array.from({length:13},(_,i)=>(i+2)+' Years')],ac:['500 ACs','2,000 ACs','12,000 ACs','25,000 ACs','50,000 ACs','100,000 ACs','200,000 ACs','300,000 ACs','400,000 ACs','500,000 ACs','600,000 ACs','750,000 ACs','1 Million ACs','1.1 Million ACs','1.2 Million ACs','1.25 Million ACs']}[section];
 const rows=[];
 const allowedArt=src=>{try{const u=new URL(src,location.origin);return ['https://account.aq.com','https://game.aq.com','https://www.aq.com'].includes(u.origin)&&!u.search&&!u.hash&&/badge|progress|achievement/i.test(u.pathname)&&/^\/[a-z0-9/_-]+\.(?:png|jpe?g|gif|webp)$/i.test(u.pathname)?u.href:null}catch{return null}};
 const evidence=(img,card)=>{
  let state='unknown';
  try{
   const statuses=new Set();let otherFilter=false;
   for(let el=img;el;el=el.parentElement){
    const filter=getComputedStyle(el).filter||'none';
    const gray=filter.match(/grayscale\(\s*(1(?:\.0+)?|100%)\s*\)/i);if(gray)statuses.add('gray');else if(filter!=='none'&&filter!=='grayscale(0)')otherFilter=true;
    if(el===img||el===card){for(const token of String(el.getAttribute('class')||'').toLowerCase().split(/\s+/)){if(['locked','unearned','not-earned','not-unlocked','badge-locked','disabled-badge','grayscale','greyed-out','grayed-out'].includes(token))statuses.add('gray');if(['unlocked','earned','badge-unlocked','badge-earned','achievement-earned'].includes(token))statuses.add('colored')}for(const attr of ['data-earned','data-unlocked']){const val=el.getAttribute(attr);if(val==='true'||val==='1')statuses.add('colored');if(val==='false'||val==='0')statuses.add('gray')}}
   }
   if(statuses.size>1)return 'unknown';
   if(statuses.size===1)return [...statuses][0];
   if(otherFilter)return 'unknown';
   const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,32,32);const pixels=ctx.getImageData(0,0,32,32).data;
   let count=0,colored=0;for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]<200)continue;count++;if(Math.max(pixels[i],pixels[i+1],pixels[i+2])-Math.min(pixels[i],pixels[i+1],pixels[i+2])>40)colored++}
   if(count>300&&colored/count>0.2)state='colored';else if(count>300&&colored/count<0.02)state='gray';
  }catch{}
  return state;
 };
 // Match a badge image only to a unique exact allowlisted label inside its own card.
 for(const img of document.images){
  if(!img.getClientRects().length)continue;
  let card=img.parentElement,name='';
  for(let i=0;card&&i<7;i++,card=card.parentElement){
   if(card.querySelectorAll('img').length!==1)break;
   const labels=[...new Set(String(card.innerText||'').split(/\n/).map(normalize).filter(x=>names.includes(x)))];
   if(labels.length===1){name=labels[0];break}
   const full=normalize(card.innerText);if(names.includes(full)){name=full;break}
  }
  if(!name||rows.some(r=>r.name===name))continue;
  const art=allowedArt(img.currentSrc||img.src),state=img.complete&&img.naturalWidth?evidence(img,card):'unknown';
  rows.push({name,state,...(art?{art}:{})});
 }
 for(const name of names)if(!rows.some(r=>r.name===name)&&lines.includes(name))rows.push({name,state:'unknown'});
 // Exact milestones from the official summary captured in this same signed-in run.
 // Threshold eligibility is distinct from observing a claimed badge. Never infer saga status.
 if(summary?.section==='summary'&&Number.isSafeInteger(summary.months)&&summary.months>=0&&Number.isSafeInteger(summary.total)&&summary.total>=0&&/^\d{4}-\d{2}-\d{2}$/.test(summary.created||'')&&Math.abs(Date.parse(capturedAt)-Date.parse(summary.capturedAt))<300000){
  for(const r of rows){
   if(r.state!=='unknown'||section==='sagas')continue;
   let reached=null;
   if(section==='membership'){const m=r.name.match(/^(\d+) (Month|Year)s?$/);if(m)reached=summary.months>=Number(m[1])*(m[2]==='Year'?12:1)}
   else if(section==='ac'){const m=r.name.match(/^([\d,.]+)( Million)? ACs$/);if(m)reached=summary.total>=Number(m[1].replace(/,/g,''))*(m[2]?1000000:1)}
   else if(section==='playtime'){const m=r.name.match(/^(\d+) (Week|Month|Year)s?$/);if(m){const created=new Date(summary.created+'T00:00:00Z'),threshold=new Date(created);if(m[2]==='Week')threshold.setUTCDate(threshold.getUTCDate()+7*Number(m[1]));else {const month=threshold.getUTCMonth()+Number(m[1])*(m[2]==='Year'?12:1),day=threshold.getUTCDate();threshold.setUTCDate(1);threshold.setUTCMonth(month);const last=new Date(Date.UTC(threshold.getUTCFullYear(),threshold.getUTCMonth()+1,0)).getUTCDate();threshold.setUTCDate(Math.min(day,last))}if(Number.isFinite(+threshold))reached=Date.parse(capturedAt)>=+threshold}}
   if(reached!==null){r.state=reached?'colored':'gray';r.evidence='threshold'}
  }
 }
 if(!rows.length)throw Error('No recognizable badges. Open the fully loaded progress page.');
 return {section,capturedAt,rows};
}
if(typeof module!=='undefined')module.exports={captureAccountProgress};

// Discover actual same-origin navigation, never guess authenticated endpoints or submit forms.
function readProgressNavigation(){
 if(location.origin!=='https://account.aq.com')return {section:null,links:{}};
 const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
 const lines=document.body?.innerText?.split(/\n/).map(norm)||[];
 const headings={'progress summary':'summary','sagas completed':'sagas','time played':'playtime','membership progress':'membership','adventurecoins progress':'ac'};
 const aliases={'summary':'summary','saga progress':'sagas','playtime':'playtime','play time':'playtime','member loyalty':'membership','member loyality':'membership','membership loyalty':'membership','ac loyalty':'ac','ac loyality':'ac','badge tracker':'tracker','progress badges':'tracker','achievement tracker':'tracker','progress':'tracker'};
 const hits=Object.keys(headings).filter(k=>lines.includes(k));
 const section=lines.includes('progress badges')&&hits.length===1?headings[hits[0]]:null,links={},ambiguous=new Set();
 for(const a of document.querySelectorAll('a[href]')){
  if(!a.getClientRects().length)continue;
  const key=Object.prototype.hasOwnProperty.call(aliases,norm(a.innerText))?aliases[norm(a.innerText)]:null;
  if(!key)continue;
  try{
   const u=new URL(a.href,location.href);
   if(u.origin!==location.origin||u.username||u.password||!/progress|badge|achievement/i.test(u.pathname)||/logout|logoff|delete|purchase|payment|reset|password|settings/i.test(u.pathname))continue;
   if(links[key]&&links[key]!==u.href)ambiguous.add(key);else links[key]=u.href;
  }catch{}
 }
 for(const key of ambiguous)delete links[key];
 return {section,links};
}
if(typeof module!=='undefined')module.exports.readProgressNavigation=readProgressNavigation;
