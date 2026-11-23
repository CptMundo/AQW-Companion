/* AQW Companion — optional, opt-in Google Analytics (GA4).
 * The Google tag and ALL Google Analytics network requests are blocked until
 * a visitor explicitly opts in. Inventory / wishlist / export data is NEVER
 * passed to gtag, and no custom events are collected.
 *
 * Consent mode: BASIC (no tag before consent).
 * Docs: https://developers.google.com/tag-platform/security/guides/consent
 */
(function () {
  'use strict';
  var ID='G-JF725WDHV1';
  var KEY='aqw-companion-analytics-consent-v1';
  var banner=document.getElementById('aqw-analytics-banner');
  var settings=document.getElementById('aqw-analytics-settings');
  var accept=document.getElementById('aqw-analytics-accept');
  var reject=document.getElementById('aqw-analytics-reject');
  if(!banner || !settings || !accept || !reject) return;

  function savedChoice(){
    try {
      var value=window.localStorage.getItem(KEY);
      return value==='accept'||value==='reject'?value:null;
    } catch (_) { return null; } // Blocked storage means ask again next visit.
  }
  function storeChoice(value) {
    try { window.localStorage.setItem(KEY,value); } catch (_) {}
  }
  function setButtons(choice) {
    // Distinct, equally available Accept/Reject controls for either state.
    banner.hidden=choice!==null;
    settings.setAttribute('aria-label','Change optional analytics consent');
  }
  function loadAnalytics() {
    if(window.__aqwAnalyticsStarted) return;
    window.__aqwAnalyticsStarted=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};

    // Default denied before tag initialization; activate only after opt-in.
    window.gtag('consent','default',{
      analytics_storage:'denied', ad_storage:'denied',
      ad_user_data:'denied', ad_personalization:'denied'
    });
    window.gtag('consent','update',{
      analytics_storage:'granted', ad_storage:'denied',
      ad_user_data:'denied', ad_personalization:'denied'
    });
    window.gtag('js',new Date());
    // No query strings, fragments, inventory data, custom events or identifiers.
    window.gtag('config',ID,{
      page_location:window.location.origin+window.location.pathname,
      allow_google_signals:false,
      allow_ad_personalization_signals:false,
      send_page_view:true
    });
    var script=document.createElement('script');
    script.async=true;
    script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(ID);
    script.setAttribute('data-aqw-analytics','optional');
    document.head.appendChild(script);
  }
  function applyChoice(choice) {
    storeChoice(choice);
    setButtons(choice);
    if(choice==='accept') {
      loadAnalytics();
    } else if(window.__aqwAnalyticsStarted) {
      // Basic consent mode: remove loaded analytics scripts by reloading.
      // A denial AFTER opting in should not allow further GA pings.
      if(typeof window.gtag==='function')window.gtag('consent','update',{
        analytics_storage:'denied', ad_storage:'denied',
        ad_user_data:'denied', ad_personalization:'denied'
      });
      window.location.reload();
    }
  }
  settings.addEventListener('click',function(){
    banner.hidden=false;
    banner.querySelector('h2')?.focus();
  });
  accept.addEventListener('click',function(){applyChoice('accept');});
  reject.addEventListener('click',function(){applyChoice('reject');});
  var choice=savedChoice();
  setButtons(choice);
  if(choice==='accept')loadAnalytics();
})();
