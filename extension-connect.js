(() => {
  'use strict';
  const status = document.getElementById('connection-status');
  const button = document.getElementById('check-connection');
  let nonce = '', timer;
  window.addEventListener('message', event => {
    if (event.source !== window || event.origin !== location.origin) return;
    const msg = event.data;
    if (!nonce || !msg || msg.channel !== 'aqwc-foundation' || msg.type !== 'pong' ||
        msg.nonce !== nonce || typeof msg.version !== 'string' ||
        !/^\d+\.\d+\.\d+$/.test(msg.version)) return;
    clearTimeout(timer); nonce = '';
    status.dataset.state = 'connected';
    status.textContent = 'Extension connected · v' + msg.version;
  });
  function check() {
    clearTimeout(timer);
    nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2,'0')).join('');
    status.dataset.state = 'checking'; status.textContent = 'Checking connection…';
    window.postMessage({channel:'aqwc-foundation',type:'ping',nonce},location.origin);
    timer = setTimeout(() => {
      nonce = ''; status.dataset.state = 'missing';
      status.textContent = 'Extension not detected. Install or enable it, refresh this page, then try again.';
    }, 1800);
  }
  button.addEventListener('click',check);
})();
