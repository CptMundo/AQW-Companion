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
  if (document.getElementById('aqwc-foundation-badge')) return;
  const badge = document.createElement('a');
  badge.id = 'aqwc-foundation-badge';
  badge.href = SITE + CONNECT;
  badge.target = '_blank';
  badge.rel = 'noopener noreferrer';
  badge.textContent = 'AQW Companion · v' + version + ' active';
  badge.title = 'Open Companion connection test. Inventory lookup is available on supported Wiki item pages.';
  badge.style.cssText = 'display:block;width:fit-content;max-width:100%;box-sizing:border-box;padding:7px 12px;margin:8px 0;border:1px solid #69bce6;border-radius:7px;background:#142b3e;color:#e5f5ff;font:600 13px/1.5 system-ui,sans-serif;text-decoration:none;';
  const title = document.getElementById('page-title');
  if (title && title.parentNode) title.insertAdjacentElement('afterend',badge);
  else (document.getElementById('main-content') || document.body).prepend(badge);
})();
