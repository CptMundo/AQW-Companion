/* Runs only after the user invokes capture on the logged-in Inventory tab. */
async function captureAccountInventory(onProgress,jobId){
 try{
 const report=(phase,read=0,total=null)=>{if(typeof onProgress==='function')onProgress({phase,read,total});if(jobId)try{if(typeof chrome!=='undefined'&&chrome.runtime?.sendMessage)Promise.resolve(chrome.runtime.sendMessage({type:'one-click-progress',id:jobId,progress:{phase,read,total}})).catch(()=>{})}catch{};};
 const origin='https://account.aq.com';
 if(location.origin!==origin||!/^\/AQW\/Inventory\/?$/i.test(location.pathname))throw Error('Open the AQW Account Manager Inventory tab first.');
 const resources=performance.getEntriesByType('resource').map(r=>{try{return new URL(r.name)}catch{return null}}).filter(u=>u&&u.origin===origin&&/(?:^|\/)InventoryData\/?$/i.test(u.pathname));
 const endpoints=[...new Set(resources.map(u=>u.pathname))];
 if(endpoints.length!==1)throw Error('Inventory data endpoint not identified. Refresh the Inventory tab, wait for the grid to load, then try again.');
 // The grid's default ordering is not guaranteed to be stable across requests.
 // Read the reported total, prefer one complete response, and only paginate with
 // explicit deterministic ordering if the endpoint caps the requested page size.
 const sort=JSON.stringify([{selector:'ID',desc:false},{selector:'Bank',desc:false}]);
 async function readPage(skip,take,ordered=false,allowLimit=false){
  const u=new URL(endpoints[0],origin);u.searchParams.set('skip',String(skip));u.searchParams.set('take',String(take));u.searchParams.set('requireTotalCount','true');
  if(ordered)u.searchParams.set('sort',sort);
  const response=await fetch(u.href,{method:'GET',credentials:'same-origin',redirect:'error',cache:'no-store',headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)});
  if(!response.ok){if(allowLimit&&[400,413,422].includes(response.status))return null;throw Error('Inventory request failed ('+response.status+'). Check your login.');}
  const json=await response.json(),rows=Array.isArray(json)?json:(json.data??json.Data??json.items??json.Items);
  const reported=Number(json.totalCount??json.TotalCount??json.total??NaN);
  if(!Array.isArray(rows)||rows.length>take||!Number.isSafeInteger(reported)||reported<1||reported>10000)throw Error('Inventory response or reported total not supported. No inventory was changed.');
  return {rows,reported};
 }
 report('connecting');
 const first=await readPage(0,100),total=first.reported;
 if(first.rows.length!==Math.min(100,total))throw Error('Incomplete inventory page. No inventory was changed.');
 const items=[],seen=new Set();
 function append(rows,offset){
  for(let index=0;index<rows.length;index++){
   const row=rows[index],position=offset+index+1;
   if(!row||!['string','number'].includes(typeof row.ID)||typeof row.Name!=='string'||!row.Name.trim()||row.Name.length>350||typeof row.Type!=='string'||row.Type.length>100||row.Count==null||row.Bank==null||!Number.isSafeInteger(Number(row.Count))||Number(row.Count)<1||![0,1].includes(Number(row.Bank)))throw Error('Unsupported item record at row '+position+'. No inventory was changed.');
   const ID=String(row.ID),Bank=Number(row.Bank),key=JSON.stringify([ID,Bank]);
   if(!ID.trim()||ID.length>128)throw Error('Invalid item ID at row '+position+'. No inventory was changed.');
   if(seen.has(key))throw Error('Repeated item ID/location at row '+position+' of '+total+'. Cannot confirm complete capture.');
   seen.add(key);
   const item={ID,Name:row.Name,Type:row.Type,Count:Number(row.Count),Bank};
   for(const field of ['Coins','Member','MaxStack','MaxStackSize','MaxQuantity'])if(row[field]!=null&&Number.isSafeInteger(Number(row[field]))&&Number(row[field])>=0)item[field]=Number(row[field]);
   if(typeof row.Added==='string'&&row.Added.length<=100)item.Added=row.Added;
   items.push(item);
  }
  report('reading',items.length,total);
 }
 function result(){if(items.length!==total)throw Error('Incomplete inventory capture. No inventory was changed.');return {exportedAt:new Date().toISOString(),reportedTotal:total,items};}
 if(total<=100){append(first.rows,0);return result();}
 report('bulk',0,total);
 const whole=await readPage(0,total,false,true);
 if(whole){
  if(whole.reported!==total)throw Error('Inventory total changed during capture. Try again.');
  if(whole.rows.length===total){append(whole.rows,0);return result();}
  // A shorter bulk response is not imported, even if it contains valid records.
 }
 report('reading',0,total);
 // Keep network concurrency bounded at two requests and retain ordered validation.
 // This reduces the number of sequential round trips when the server caps bulk reads.
 for(let base=0;base<total;base+=200){
  const offsets=[base,...(base+100<total?[base+100]:[])];
  const pages=await Promise.all(offsets.map(offset=>readPage(offset,100,true)));
  for(let i=0;i<pages.length;i++){
   const page=pages[i],offset=offsets[i];
   if(page.reported!==total)throw Error('Inventory total changed during capture. Try again.');
   if(page.rows.length!==Math.min(100,total-offset))throw Error('Incomplete inventory page at offset '+offset+'. No inventory was changed.');
   append(page.rows,offset);
  }
  if(base+200<total)await new Promise(resolve=>setTimeout(resolve,150));
 }
 return result();
 }catch(e){
  // Chromium may return no InjectionResult when an injected async function rejects.
  // Send a serializable error instead, without returning a partial snapshot.
  if(jobId)return {captureError:String(e?.message||'Inventory capture failed.').slice(0,240)};
  throw e;
 }
}

// Read the rendered public Character Page inventory; never call private inventory endpoints.
function capturePublicInventory(doc=document,href=location.href){
 const u=new URL(href),character=(u.searchParams.get('id')||'').trim();
 if(u.origin!=='https://account.aq.com'||!/^\/(?:AQW\/)?CharPage\/?$/i.test(u.pathname)||!character||character.length>80||/[\u0000-\u001f\u007f]/.test(character))throw Error('Open your official public Character Page.');
 const root=doc.getElementById('inventoryRendered'),count=doc.getElementById('countInventory')?.textContent.trim().match(/^\((\d+)\)$/);
 if(!root||!count||+count[1]<1||+count[1]>10000)throw Error('Wait for the public inventory to load.');
 const types=new Set(['Class','Armor','Helm','Cape','Sword','Axe','Gauntlet','Dagger','HandGun','Rifle','Gun','Whip','Bow','Mace','Polearm','Staff','Wand','Pet','Item','Quest Item','Resource','Necklace','Misc','Ground','House','Wall Item','Floor Item']);
 const items=[];
 for(const a of root.querySelectorAll('a.item')){
  const body=a.closest('.card-body'),type=body?.previousElementSibling?.textContent.trim(),span=a.querySelector('span.item');
  if(!types.has(type)||!span)throw Error('Unrecognized public inventory row.');
  const small=span.querySelector('small'),stack=['Resource','Item','Quest Item'].includes(type);
  let name=span.textContent.trim(),quantity=null,rank=null;
  if(small){const m=small.textContent.trim().match(/^x(\d+)$/);if(!stack||!m||!name.endsWith(small.textContent.trim()))throw Error('Unrecognized public quantity.');quantity=Number(m[1]);name=name.slice(0,-small.textContent.trim().length).trim();}
  else if(stack)quantity=1;
  if(type==='Class'){const m=name.match(/ \(Rank (\d+)\)$/);if(m){rank=Number(m[1]);name=name.slice(0,-m[0].length)}}
  if(!name||name.length>350||quantity!==null&&(!Number.isSafeInteger(quantity)||quantity<1)||rank!==null&&(rank<1||rank>10))throw Error('Invalid public inventory record.');
  items.push({name,type,quantity,rank});
 }
 if(items.length!==+count[1])throw Error('Public inventory is incomplete. Refresh the page and try again.');
 return {character,capturedAt:new Date().toISOString(),source:'character-page',reportedTotal:items.length,items};
}
