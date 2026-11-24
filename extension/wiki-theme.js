(()=>{'use strict';
 const ORIGIN='https://aqwwiki.wikidot.com';
 if(location.origin!==ORIGIN||!document.getElementById('page-title')||!document.getElementById('page-content'))return;
 const APPEARANCE_KEY='aqwc-wiki-appearance-v1';
function normalizeAppearance(value){
 const v=value&&typeof value==='object'?value:{};
 return {
  background:['original','neutral','midnight','slate','obsidian','void'].includes(v.background)?v.background:'original',
  banner:['original','prometheus','arcane','void'].includes(v.banner)?v.banner:'original',
  panel:['integrated','blue'].includes(v.panel)?v.panel:'integrated'
 };
}

 const palettes={neutral:['#192630','#dce5ee','#89cfe5'],midnight:['#101924','#bcd5e9','#7dd7f5'],slate:['#262c34','#e4e9f1','#8fd8f2'],obsidian:['#141518','#e4e7ee','#8ad4f0'],void:['#1b1627','#e6dcf3','#c5abff']};
 // Original artwork composed locally, with a separate readable wordmark and
 // full-width decorative background. No assets or code from other extensions.
 const svgUrl=svg=>'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
 const wordmark=svgUrl('<svg xmlns="http://www.w3.org/2000/svg" width="290" height="108" viewBox="0 0 290 108"><text x="12" y="57" font-family="Georgia,serif" font-size="42" font-weight="bold" fill="#f2e7cb" stroke="#101923" stroke-width="1.4" paint-order="stroke">AQW Wiki</text><path d="M16 70H254" stroke="#6cc4dc" opacity=".7"/><text x="16" y="88" font-family="sans-serif" font-size="10" letter-spacing="3" fill="#d2eaf4">WIKI COMPANION</text></svg>');
 const art=(a,b)=>svgUrl('<svg xmlns="http://www.w3.org/2000/svg" width="840" height="140" viewBox="0 0 840 140"><g fill="none" stroke="'+a+'" opacity=".28"><path d="M0 140L130 0H220L90 140M240 140L370 0H460L330 140M490 140L620 0H710L580 140M730 140L840 20" stroke-width="2"/><path d="M120 140L250 0M380 140L510 0M640 140L770 0" stroke-width="12" opacity=".45"/><circle cx="530" cy="65" r="58"/><circle cx="530" cy="65" r="44" stroke-dasharray="4 8"/><path d="M530 8L585 65L530 122L475 65Z" stroke="'+b+'"/></g></svg>');
 const banners={
  prometheus:{art:art('#68d9ed','#a0f2ff'),gradient:'linear-gradient(110deg,#0a1723,#143c4a 65%,#091923)',accent:'#52b4cf'},
  arcane:{art:art('#73b6f9','#bde9ff'),gradient:'linear-gradient(110deg,#111c33,#22527b 65%,#112237)',accent:'#72b9ef'},
  void:{art:art('#a98aff','#e6c7ff'),gradient:'linear-gradient(110deg,#1c122a,#493161 65%,#1b152d)',accent:'#ba9af4'}
 };
 let style,revision=0,originalInline=null,artwork=null,backdrop=null;
 const bannerProps=['background-image','background-size','background-position','background-repeat'];
 function restoreInline(){if(!originalInline)return;const {target,values}=originalInline;for(const [k,v,priority] of values){if(v)target.style.setProperty(k,v,priority);else target.style.removeProperty(k)}originalInline=null;}
 function apply(value){
  const v=normalizeAppearance(value),root=document.documentElement;
  // Only the preference attributes and this owned style are touched. Original
  // means no page background/banner overrides, including other extensions.
  root.setAttribute('data-aqwc-panel-theme',v.panel);root.setAttribute('data-aqwc-background',v.background);
  const rules=[];
  if(v.background!=='original'){
   const [bg,fg,link]=palettes[v.background];
   rules.push('body,#container,#container-wrap,#content-wrap,#main-content,#page-content,#side-bar{background-color:'+bg+' !important;color:'+fg+' !important;}');
   rules.push('#page-content a:not([id^="aqwc-"]),#side-bar a,#breadcrumbs a{color:'+link+' !important;}');
   if(v.background==='neutral')rules.push('#page-content .yui-content,#page-content .yui-content > div,#page-content .wiki-content-table td{background-color:#202f3b!important;border-color:#405362!important;color:#dce5ee!important;}  #page-title{color:#a9e0f0!important;} #page-content strong,#page-content b{color:#e5edf4;} #page-content[hidden]{display:none!important;} #page-content .yui-nav a{background:#263847!important;color:#dce5ee!important;} #page-content .yui-nav .selected a{background:#325c70!important;}');
  }
  root.setAttribute('data-aqwc-banner',v.banner);restoreInline();if(artwork){artwork.remove();artwork=null;}if(backdrop){backdrop.remove();backdrop=null;}
  if(v.banner!=='original'){
   const preset=banners[v.banner];
   const chosen=v.banner==='prometheus';
   const images=chosen?['url("'+chrome.runtime.getURL('image_2026-11-24_232002011.png')+'")','linear-gradient(90deg,#07131b,#102c35 50%,#07131b)']:[wordmark,preset.art,preset.gradient];
   const positions=chosen?['center top','center top']:['12px 12px','right top','center top'];
   // Preserve the uploaded PNG aspect ratio; fit within the native 140px header.
   const sizes=chosen?['auto clamp(150px,10vw,210px)','100% clamp(150px,10vw,210px)']:['min(290px, 38vw) 108px','auto 140px','100% 140px'];
   // The native banner image lives on the full-width container-wrap, not
   // the narrow, offset #header. Replace only its background; never overlay
   // or move the header links, search box or menu.
   const selector='html[data-aqwc-banner="'+v.banner+'"] div#container-wrap';
   const target=document.getElementById('container-wrap');if(target?.style?.getPropertyValue){originalInline={target,values:bannerProps.map(k=>[k,target.style.getPropertyValue(k),target.style.getPropertyPriority(k)])};[images.join(','),sizes.join(','),positions.join(','),'no-repeat'].forEach((v,i)=>target.style.setProperty(bannerProps[i],v,'important'))}
   rules.push(selector+'{background-image:'+images.join(',')+' !important;background-size:'+sizes.join(',')+' !important;background-position:'+positions.join(',')+' !important;background-repeat:no-repeat !important;}');
   rules.push('html[data-aqwc-banner="'+v.banner+'"] #top-bar{border-top:1px solid '+preset.accent+';background:#13232f!important;height:26px!important;line-height:22px!important;padding:2px 0!important;} html[data-aqwc-banner="'+v.banner+'"] #top-bar > ul > li > a{font-size:12px!important;padding:6px 10px!important;line-height:14px!important;max-height:none!important;}');
   // A visible image element as a second path, independent of the Wiki's
   // background layers. Native header controls remain clickable.
   if(chosen&&target?.insertBefore&&document.createElement){
    artwork=document.createElement('img');artwork.id='aqwc-prometheus-artwork';artwork.alt='AQW Wiki Companion';artwork.src=chrome.runtime.getURL('image_2026-11-24_232002011.png');artwork.setAttribute('aria-hidden','true');target.insertBefore(artwork,target.firstChild);backdrop=document.createElement('div');backdrop.id='aqwc-banner-backdrop';backdrop.setAttribute('aria-hidden','true');target.insertBefore(backdrop,artwork);
    rules.push(selector+'{position:relative!important;--aqwc-banner-height:clamp(150px,10vw,210px);background-size: auto var(--aqwc-banner-height),100% var(--aqwc-banner-height)!important;} #aqwc-prometheus-artwork{position:absolute!important;top:0!important;left:0!important;width:100%!important;height:var(--aqwc-banner-height)!important;object-fit:cover!important;object-position:center 46%!important;background:#07131b!important;max-width:1380px!important;left:50%!important;transform:translateX(-50%)!important;mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);z-index:1!important;pointer-events:none!important;display:block!important;}');
    rules.push('#aqwc-banner-backdrop{position:absolute;inset:0 0 auto;height:var(--aqwc-banner-height);overflow:hidden;pointer-events:none;background:#07131b;z-index:0} #aqwc-banner-backdrop::before{content:"";position:absolute;inset:-12px;background:linear-gradient(90deg,#19263099,#07131b33,#19263099),url("'+chrome.runtime.getURL('image_2026-11-24_232002011.png')+'") center 46%/cover no-repeat;filter:blur(7px);opacity:.65;}');
    rules.push('html[data-aqwc-banner="prometheus"] #header{position:relative!important;z-index:2!important;background:transparent!important;height:var(--aqwc-banner-height)!important;} html[data-aqwc-banner="prometheus"]  #top-bar{top:var(--aqwc-banner-height)!important;} html[data-aqwc-banner="prometheus"] #header > h1,html[data-aqwc-banner="prometheus"] #header > h2{background:transparent!important;} html[data-aqwc-banner="prometheus"] #top-bar,html[data-aqwc-banner="prometheus"] #login-status,html[data-aqwc-banner="prometheus"] #search-top-box{z-index:3!important;}');
   }
  }
  if(!rules.length){style?.remove();style=null;return}
  if(!style){style=document.createElement('style');style.id='aqwc-wiki-appearance';(document.head||root).append(style)}
  style.textContent=rules.join('\n');
 }
 chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(sender.id!==chrome.runtime.id||sender.url!==chrome.runtime.getURL('popup.html')||message?.type!=='aqwc-appearance-preview')return;
  revision++;apply(message.appearance);const target=document.getElementById('container-wrap');let applied=false;try{applied=normalizeAppearance(message.appearance).banner==='original'||!!target&&getComputedStyle(target).backgroundImage.includes(normalizeAppearance(message.appearance).banner==='prometheus'?chrome.runtime.getURL('image_2026-11-24_232002011.png'):'data:image/svg+xml')}catch{}if(typeof respond!=='function')return false;
  if(artwork){const img=artwork;let done=false;const finish=()=>{if(done)return;done=true;respond({ok:true,bannerTarget:!!target,applied,artworkLoaded:!!img.naturalWidth})};if(img.complete){finish();return false}img.addEventListener('load',finish,{once:true});img.addEventListener('error',finish,{once:true});setTimeout(finish,3000);return true}
  respond({ok:true,bannerTarget:!!target,applied});return false;
 });
 const start=revision;
 chrome.runtime.sendMessage({type:'wiki-appearance-read'},response=>{
  if(!chrome.runtime.lastError&&response?.ok&&start===revision)apply(response.appearance);
 });
})();