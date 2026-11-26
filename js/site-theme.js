/* Standalone theme choice, reconciled with installed extension when present. */
(()=>{
'use strict';
const theme=window.AQWCTheme,select=document.getElementById('aqwc-site-theme');if(!theme||!select)return;
const key='aqwc-site-theme-v1',allowed=['companion','dark','light','cas','stars'],root=document.documentElement;
const style=document.createElement('style');style.id='aqwc-site-theme-style';document.head.append(style);
const sourceCss=[...document.styleSheets].filter(s=>s.href&&new URL(s.href).origin===location.origin).map(s=>{try{return [...s.cssRules].map(r=>r.cssText).join('\n')}catch{return ''}}).join('\n');
let themed=theme.recolor(sourceCss),active='companion';
const palettes={companion:theme.tokens,dark:theme.darkTokens,light:theme.lightTokens,cas:theme.casTokens,stars:theme.starsTokens};
const overrides='html[data-aqwc-background] body{color:var(--txt)}html[data-aqwc-background="light"] body{background:var(--bg)!important;color-scheme:light}html[data-aqwc-background="light"] :is(.card,.notice,.tablebox,.goal,.unlockcard,.ultracard,.placeholder){background:var(--panel)!important;color:var(--txt)!important;border-color:var(--line)!important}html[data-aqwc-background="light"] :is(input,select,textarea,button,th){background:var(--panel2);color:var(--txt);border-color:var(--line)}html[data-aqwc-background="light"] :is(.muted,.tiny,small){color:var(--muted)}html[data-aqwc-background="light"] a{color:var(--cyan)}html[data-aqwc-background="cas"] button.primary{color:#440066;background:#ff00ff}#aqwc-site-theme{font-size:12px;min-height:32px;padding:5px 8px;min-width:110px} .aqwc-theme-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.aqwc-theme-tools button{font-size:12px;padding:6px 9px}';
function apply(v){if(!allowed.includes(v))v='companion';active=v;root.dataset.aqwcBackground=v;select.value=v;
 const vars='html[data-aqwc-background="'+v+'"]{'+Object.entries(palettes[v]).map(([k,x])=>'--'+k+':'+x).join(';')+'}';
 style.textContent=(v==='companion'?'':themed)+theme.rootCss+vars+overrides+theme.starsCss;
 try{localStorage.setItem(key,v)}catch{}
}
let saved='companion';try{saved=localStorage.getItem(key)||'companion'}catch{}apply(saved);
const localSheets=[...document.styleSheets].map(s=>s.href).filter(h=>h&&new URL(h).origin===location.origin&&new URL(h).pathname.startsWith('/AQW-Companion/css/'));
Promise.all(localSheets.map(async h=>{try{const r=await fetch(h,{credentials:'same-origin'});return r.ok?await r.text():''}catch{return ''}})).then(parts=>{if(parts.some(Boolean)){themed=theme.recolor(parts.join('\n'));apply(active)}});
select.addEventListener('change',()=>apply(select.value));
document.addEventListener('aqwc-theme-applied',e=>{if(allowed.includes(e.detail))apply(e.detail)});
window.addEventListener('storage',e=>{if(e.key===key&&allowed.includes(e.newValue))apply(e.newValue)});
function openBoosts(){document.querySelector('[data-tab="boost-finder"]')?.click()}
document.getElementById('aqwc-open-boosts')?.addEventListener('click',openBoosts);
if(location.hash==='#aqwc-open-boosts')openBoosts();
window.addEventListener('hashchange',()=>{if(location.hash==='#aqwc-open-boosts')openBoosts()});
})();
