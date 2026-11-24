(() => {
  'use strict';
  const SITE = 'https://cptmundo.github.io';
  const CONNECT = '/AQW-Companion/extension-connect.html';
  const version = chrome.runtime.getManifest().version;
  if (location.origin === SITE && location.pathname === CONNECT) {
    window.addEventListener('message', event => {
      if (event.source !== window || event.origin !== SITE) return;
      const msg = event.data;
      if (!msg || msg.channel !== 'aqwc-foundation' || msg.type !== 'ping' ||
          typeof msg.nonce !== 'string' || !/^[a-f0-9]{32}$/.test(msg.nonce)) return;
      window.postMessage({channel:'aqwc-foundation',type:'pong',nonce:msg.nonce,version}, SITE);
    });
    return;
  }
  if (location.origin !== 'https://aqwwiki.wikidot.com') return;
  if (!document.getElementById('page-title') || !document.getElementById('page-content')) return;

  const panelCss=':host{color-scheme:dark}*{box-sizing:border-box} .aqwc-card{display:block;width:100%;min-width:0;max-width:100%;padding:16px;border:1px solid #304d63;border-radius:14px;background:linear-gradient(150deg,#142b40,#101c2b 65%);color:#e5f3ff;font:500 13px/1.5 system-ui,sans-serif;box-shadow:0 8px 24px #07111b35;overflow-wrap:anywhere} .aqwc-brand{display:flex;align-items:center;gap:10px;margin:-16px -16px 15px;padding:14px 16px;border-bottom:1px solid #304d63;background:linear-gradient(105deg,#193f56,#132334);border-radius:13px 13px 0 0} .aqwc-mark{display:grid;place-items:center;width:32px;height:32px;flex:none;border-radius:9px;background:#12364b;border:1px solid #4388a7;color:#79defc;font-weight:900;letter-spacing:-.08em;font-size:15px} .aqwc-brand-copy{min-width:0;flex:1} .aqwc-brand-copy strong{display:block;font-size:14px;letter-spacing:.02em;color:#eaf6ff} .aqwc-brand-copy small{display:block;font-size:10px;color:#a7c4d8} .aqwc-title{font-size:20px;line-height:1.25;font-weight:800;margin:0 0 9px;color:#f3f8fc} .aqwc-state{display:inline-block;max-width:100%;border-radius:7px;background:#091a28;padding:6px 10px;font-size:13px;font-weight:700} .aqwc-meta{display:block;margin:8px 0;color:#a9c2d5;font-size:11px;font-weight:400} .aqwc-actions{display:grid;gap:7px;margin:13px 0 4px} .aqwc-section{background:#132638;border:1px solid #2d485e;border-radius:10px;padding:12px;margin-top:12px} .aqwc-section strong{display:block;font-size:13px;color:#e1f2ff} .aqwc-card button,.aqwc-card select,.aqwc-card input{font-family:system-ui,sans-serif!important;border-radius:7px!important} .aqwc-card button{cursor:pointer} .aqwc-card button:disabled{opacity:.55;cursor:default} .aqwc-card .aqwc-primary{padding:10px 14px!important;background:#167ca3!important;border:1px solid #50c2e6!important;color:#fff!important;font-weight:750!important;font-size:13px!important;width:100%;margin:0!important} .aqwc-card .aqwc-primary:hover:not(:disabled){background:#2098ba!important} .aqwc-card a{color:#91dfff!important;text-underline-offset:3px} .aqwc-card a:focus-visible,.aqwc-card button:focus-visible{outline:2px solid #87e4ff;outline-offset:3px}';
  function decorate(shadow,card,section){
    const style=document.createElement('style');style.textContent=panelCss;shadow.append(style);card.className='aqwc-card';
    const brand=document.createElement('div');brand.className='aqwc-brand';
    const mark=document.createElement('span');mark.className='aqwc-mark';mark.textContent='AQ';
    const copy=document.createElement('div');copy.className='aqwc-brand-copy';const title=document.createElement('strong');title.textContent='AQW Companion';const sub=document.createElement('small');sub.textContent=section+' · v'+version;copy.append(title,sub);brand.append(mark,copy);card.append(brand);
  }
  function mount(host,content,title){
    const parent=content?.parentElement;
    if(!parent||typeof parent.insertBefore!=='function'||typeof parent.getBoundingClientRect!=='function'){
      (document.getElementById('aqwc-foundation-badge')||title).insertAdjacentElement('afterend',host);return;
    }
    // Reserve space using a float + a separate formatting context, not an overlay.
    // No reparenting, cloning, or modification of the Wiki article's children.
    const style=document.createElement('style');
    style.textContent='#page-content.aqwc-side-article{display:flow-root!important;min-width:0!important;max-width:calc(100% - var(--aqwc-side-reserved))!important;box-sizing:border-box!important}';
    parent.insertBefore(style,content);parent.insertBefore(host,content);
    const clear=document.createElement('div');clear.setAttribute('aria-hidden','true');clear.style.cssText='clear:both;height:0;pointer-events:none';content.insertAdjacentElement('afterend',clear);
    let last='';
    function update(){
      const width=parent.getBoundingClientRect().width;
      const wide=width>=980;const panelWidth=Math.min(440,Math.max(330,Math.floor(width*.37)));
      const mode=wide?'wide:'+panelWidth:'inline';if(mode===last)return;last=mode;
      host.style.cssText=wide?'display:block;float:right;width:'+panelWidth+'px;max-width:100%;box-sizing:border-box;margin:0 0 20px 22px;':'display:block;float:none;width:100%;max-width:540px;box-sizing:border-box;margin:12px 0 18px;';
      content.classList.toggle('aqwc-side-article',wide);
      if(wide)content.style.setProperty('--aqwc-side-reserved',(panelWidth+22)+'px');else content.style.removeProperty('--aqwc-side-reserved');
    }
    update();
    if(typeof ResizeObserver==='function'){const observer=new ResizeObserver(update);observer.observe(parent);window.addEventListener('pagehide',e=>{if(!e.persisted)observer.disconnect()},{once:true});}
    else window.addEventListener('resize',update,{passive:true});
  }
  globalThis.AQWCWikiUI=Object.freeze({decorate,mount});
  if (document.getElementById('aqwc-foundation-badge')) return;
  const badge = document.createElement('a');
  badge.id = 'aqwc-foundation-badge';
  badge.href = SITE + CONNECT;
  badge.target = '_blank';
  badge.rel = 'noopener noreferrer';
  badge.textContent = '◆ AQW Companion · v' + version;
  badge.title = 'Open Companion connection test. Inventory lookup is available on supported Wiki item pages.';
  badge.style.cssText = 'display:block;width:fit-content;max-width:100%;box-sizing:border-box;padding:4px 9px;margin:7px 0 12px;border:1px solid #375a70;border-radius:20px;background:#152a3c;color:#bdeaff;font:600 11px/1.5 system-ui,sans-serif;text-decoration:none;';
  const title = document.getElementById('page-title');
  if (title && title.parentNode) title.insertAdjacentElement('afterend',badge);
  else (document.getElementById('main-content') || document.body).prepend(badge);
})();
