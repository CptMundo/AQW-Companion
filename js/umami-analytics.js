/* AQW Companion — page visits only, no game data or custom events. */
(function(){
 'use strict';
 // Respect prior explicit declines and browser privacy signals.
 try{
  if(window.localStorage.getItem('aqw-companion-analytics-consent-v1')==='reject')return;
 }catch(_){return;}
 if(navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'||window.doNotTrack==='1')return;
 if(window.location.hostname!=='cptmundo.github.io'||window.location.pathname!=='/AQW-Companion/')return;
 const script=document.createElement('script');
 script.defer=true;
 script.src='https://cloud.umami.is/script.js';
 script.setAttribute('data-website-id','6991fe97-a5a7-49ab-9619-384710fba182');
 script.setAttribute('data-domains','cptmundo.github.io');
 script.setAttribute('data-exclude-search','true');
 script.setAttribute('data-exclude-hash','true');
 script.setAttribute('data-auto-track','false');
 script.onload=()=>{
  if(typeof window.umami?.track!=='function')return;
  // Explicit sanitized pageview, never attach imported data or URL parameters.
  window.umami.track({website:'6991fe97-a5a7-49ab-9619-384710fba182',hostname:window.location.hostname,language:navigator.language,screen:window.screen?window.screen.width+'x'+window.screen.height:undefined,url:'/AQW-Companion/',title:'AQW Companion',referrer:document.referrer?document.referrer.split(/[?#]/)[0]:''});
 };
 document.head.appendChild(script);
})();
