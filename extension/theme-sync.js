/* Scoped theme-only bridge. No inventory or private account data is exposed. */
(()=>{
'use strict';
if(location.origin!=='https://cptmundo.github.io'||!['/AQW-Companion/','/AQW-Companion/index.html'].includes(location.pathname))return;
const select=document.getElementById('aqwc-site-theme');if(!select)return;
const allowed=new Set(['companion','dark','light','cas','stars']);
let revision=0,pending=0;
function apply(value){if(!allowed.has(value))return;select.value=value;document.documentElement.dataset.aqwcBackground=value;document.dispatchEvent(new CustomEvent('aqwc-theme-applied',{detail:value}))}
async function refresh(respond){const seq=++revision;try{const r=await chrome.runtime.sendMessage({type:'wiki-appearance-read'});if(r?.ok&&seq===revision&&!pending)apply(r.appearance.background);respond?.({ok:!!r?.ok})}catch{respond?.({ok:false})}}
select.addEventListener('change',async e=>{if(!e.isTrusted||!allowed.has(select.value))return;const seq=++revision;pending=seq;const value=select.value;try{const r=await chrome.runtime.sendMessage({type:'wiki-appearance-save',appearance:{background:value}});if(seq===pending&&r?.ok)apply(r.appearance.background)}catch{}finally{if(seq===pending){pending=0;refresh()}}});
chrome.runtime.onMessage.addListener((m,sender,respond)=>{if(sender.id!==chrome.runtime.id||sender.tab||m?.type!=='aqwc-theme-changed')return;if(pending){respond({ok:true});return false}refresh(respond);return true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!pending)refresh()});
refresh();
})();
