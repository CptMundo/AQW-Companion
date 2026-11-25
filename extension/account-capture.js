/* Runs only after the user invokes capture on the logged-in Inventory tab. */
async function captureAccountInventory(onProgress){
 const report=(phase,read=0,total=null)=>{if(typeof onProgress==='function')onProgress({phase,read,total});};
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
 for(let offset=0;offset<total;offset+=100){
  const page=await readPage(offset,100,true);
  if(page.reported!==total)throw Error('Inventory total changed during capture. Try again.');
  if(page.rows.length!==Math.min(100,total-offset))throw Error('Incomplete inventory page at offset '+offset+'. No inventory was changed.');
  append(page.rows,offset);
  if(offset+100<total)await new Promise(resolve=>setTimeout(resolve,150));
 }
 return result();
}
