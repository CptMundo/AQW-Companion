(() => {
 const status=document.getElementById('inventory-summary'),clear=document.getElementById('clear-inventory');
 function send(type){clear.disabled=true;chrome.runtime.sendMessage({type},result=>{
  clear.disabled=false;if(chrome.runtime.lastError||!result?.ok){status.textContent='Could not access local inventory.';return}
  status.textContent=result.count===null?'No inventory synced yet.':result.count.toLocaleString()+' inventory records · '+new Date(result.syncedAt).toLocaleString();
 })}
 clear.addEventListener('click',()=>{if(confirm('Clear the extension copy? Your Companion inventory will not change.'))send('clear-inventory')});
 send('inventory-summary');
})();
