(() => {
 const SITE='https://cptmundo.github.io',channel='aqwc-account-import-v1';
 if(location.origin!==SITE||!['/AQW-Companion/','/AQW-Companion/index.html'].includes(location.pathname))return;
 const button=document.getElementById('aqwc-account-import');
 if(!button)return;
 button.dataset.extensionReady='1';if(button.dataset.appReady==='1')button.disabled=false;
 let gesture=0,pending=null;
 button.addEventListener('click',e=>{if(e.isTrusted)gesture=Date.now()},true);
 window.addEventListener('message',async e=>{
  if(e.source!==window||e.origin!==SITE)return;
  const m=e.data;if(m?.channel!==channel||typeof m.nonce!=='string'||!/^[a-f0-9]{32}$/.test(m.nonce))return;
  const reply=(type,data)=>window.postMessage({channel,type,nonce:m.nonce,...data},SITE);
  if(m.type==='request'&&gesture&&Date.now()-gesture<2000){
   gesture=0;pending=null;
   try{const r=await chrome.runtime.sendMessage({type:'account-stage-read'});if(!r?.ok||!r.snapshot){reply('snapshot',{error:r?.error||'No captured inventory. Capture it from the Account Manager first.'});return}
    pending={nonce:m.nonce,id:r.id};reply('snapshot',{snapshot:r.snapshot,id:r.id});
   }catch{reply('snapshot',{error:'Could not read pending inventory. Reload the extension.'})}
  }else if(m.type==='imported'&&pending?.nonce===m.nonce&&pending.id===m.id){
   pending=null;
   try{const r=await chrome.runtime.sendMessage({type:'account-stage-commit',id:m.id});reply('committed',{ok:!!r?.ok,error:r?.error})}catch{reply('committed',{ok:false,error:'Extension sync failed. Use Sync inventory to extension.'})}
  }
 });
})();
