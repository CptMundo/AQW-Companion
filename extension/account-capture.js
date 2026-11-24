/* Runs only after the user invokes capture on the logged-in Inventory tab. */
async function captureAccountInventory(){
 const origin='https://account.aq.com';
 if(location.origin!==origin||!/^\/AQW\/Inventory\/?$/i.test(location.pathname))throw Error('Open the AQW Account Manager Inventory tab first.');
 const resources=performance.getEntriesByType('resource').map(r=>{try{return new URL(r.name)}catch{return null}}).filter(u=>u&&u.origin===origin&&/(?:^|\/)InventoryData\/?$/i.test(u.pathname));
 const endpoints=[...new Set(resources.map(u=>u.pathname))];
 if(endpoints.length!==1)throw Error('Inventory data endpoint not identified. Refresh the Inventory tab, wait for the grid to load, then try again.');
 const items=[],seen=new Set();let total=null;
 for(let page=0;page<100;page++){
  const u=new URL(endpoints[0],origin);u.searchParams.set('skip',String(page*100));u.searchParams.set('take','100');u.searchParams.set('requireTotalCount','true');
  const response=await fetch(u.href,{method:'GET',credentials:'same-origin',redirect:'error',cache:'no-store',headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('Inventory request failed ('+response.status+'). Check your login.');
  const json=await response.json(),rows=Array.isArray(json)?json:(json.data??json.Data??json.items??json.Items);
  const reported=Number(json.totalCount??json.TotalCount??json.total??NaN);
  if(!Array.isArray(rows)||rows.length>100||!Number.isSafeInteger(reported)||reported<1||reported>10000)throw Error('Inventory response or reported total not supported. No inventory was changed.');
  if(total===null)total=reported;else if(total!==reported)throw Error('Inventory total changed during capture. Try again.');
  if(rows.length!==Math.min(100,total-items.length))throw Error('Incomplete inventory page. No inventory was changed.');
  for(const row of rows){
   if(!row||row.ID==null||typeof row.Name!=='string'||!row.Name.trim()||row.Name.length>350||typeof row.Type!=='string'||row.Type.length>100||row.Count==null||row.Bank==null||!Number.isSafeInteger(Number(row.Count))||Number(row.Count)<1||![0,1].includes(Number(row.Bank)))throw Error('Unsupported item record. No inventory was changed.');
   const ID=String(row.ID),Bank=Number(row.Bank),key=JSON.stringify([ID,Bank]);
   if(!ID||ID.length>128||seen.has(key))throw Error('Repeated or invalid item ID/location. Cannot confirm complete capture.');
   seen.add(key);
   const item={ID,Name:row.Name,Type:row.Type,Count:Number(row.Count),Bank};
   for(const field of ['Coins','Member','MaxStack','MaxStackSize','MaxQuantity'])if(row[field]!=null&&Number.isSafeInteger(Number(row[field]))&&Number(row[field])>=0)item[field]=Number(row[field]);
   if(typeof row.Added==='string'&&row.Added.length<=100)item.Added=row.Added;
   items.push(item);
  }
  if(items.length===total)return {exportedAt:new Date().toISOString(),reportedTotal:total,items};
  if(page<99)await new Promise(resolve=>setTimeout(resolve,150));
 }
 throw Error('Inventory page limit reached. No inventory was changed.');
}
