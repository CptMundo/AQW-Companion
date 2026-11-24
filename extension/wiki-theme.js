(()=>{'use strict';
 const ORIGIN='https://aqwwiki.wikidot.com';
 if(location.origin!==ORIGIN||!document.getElementById('page-title')||!document.getElementById('page-content'))return;
 const APPEARANCE_KEY='aqwc-wiki-appearance-v1';
function normalizeAppearance(value){
 const v=value&&typeof value==='object'?value:{};
 return {
  background:['original','midnight','slate','obsidian','void'].includes(v.background)?v.background:'original',
  banner:['original','prometheus','arcane','void'].includes(v.banner)?v.banner:'original',
  panel:['integrated','blue'].includes(v.panel)?v.panel:'integrated'
 };
}

 const palettes={midnight:['#101924','#bcd5e9','#7dd7f5'],slate:['#262c34','#e4e9f1','#8fd8f2'],obsidian:['#141518','#e4e7ee','#8ad4f0'],void:['#1b1627','#e6dcf3','#c5abff']};
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
 let style,revision=0,originalInline=null;
 const bannerProps=['background-image','background-size','background-position','background-repeat'];
 function restoreInline(){if(!originalInline)return;const {target,values}=originalInline;for(const [k,v,priority] of values){if(v)target.style.setProperty(k,v,priority);else target.style.removeProperty(k)}originalInline=null;}
 function apply(value){
  const v=normalizeAppearance(value),root=document.documentElement;
  // Only the preference attributes and this owned style are touched. Original
  // means no page background/banner overrides, including other extensions.
  root.setAttribute('data-aqwc-panel-theme',v.panel);
  const rules=[];
  if(v.background!=='original'){
   const [bg,fg,link]=palettes[v.background];
   rules.push('body,#container,#container-wrap,#content-wrap,#main-content,#page-content,#side-bar{background-color:'+bg+' !important;color:'+fg+' !important;}');
   rules.push('#page-content a:not([id^="aqwc-"]),#side-bar a,#breadcrumbs a{color:'+link+' !important;}');
  }
  root.setAttribute('data-aqwc-banner',v.banner);restoreInline();
  if(v.banner!=='original'){
   const preset=banners[v.banner];
   const chosen=v.banner==='prometheus';
   const images=chosen?['url("'+chrome.runtime.getURL('image_2026-11-24_232002011.png')+'")','linear-gradient(90deg,#07131b,#102c35 50%,#07131b)']:[wordmark,preset.art,preset.gradient];
   const positions=chosen?['center top','center top']:['12px 12px','right top','center top'];
   // Preserve the uploaded PNG aspect ratio; fit within the native 140px header.
   const sizes=chosen?['auto 140px','100% 140px']:['min(290px, 38vw) 108px','auto 140px','100% 140px'];
   // The native banner image lives on the full-width container-wrap, not
   // the narrow, offset #header. Replace only its background; never overlay
   // or move the header links, search box or menu.
   const selector='html[data-aqwc-banner="'+v.banner+'"] div#container-wrap';
   const target=document.getElementById('container-wrap');if(target?.style?.getPropertyValue){originalInline={target,values:bannerProps.map(k=>[k,target.style.getPropertyValue(k),target.style.getPropertyPriority(k)])};[images.join(','),sizes.join(','),positions.join(','),'no-repeat'].forEach((v,i)=>target.style.setProperty(bannerProps[i],v,'important'))}
   rules.push(selector+'{background-image:'+images.join(',')+' !important;background-size:'+sizes.join(',')+' !important;background-position:'+positions.join(',')+' !important;background-repeat:no-repeat !important;}');
   rules.push('html[data-aqwc-banner="'+v.banner+'"] #top-bar{border-top:1px solid '+preset.accent+';}');
  }
  if(!rules.length){style?.remove();style=null;return}
  if(!style){style=document.createElement('style');style.id='aqwc-wiki-appearance';(document.head||root).append(style)}
  style.textContent=rules.join('\n');
 }
 chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(sender.id!==chrome.runtime.id||sender.url!==chrome.runtime.getURL('popup.html')||message?.type!=='aqwc-appearance-preview')return;
  revision++;apply(message.appearance);const target=document.getElementById('container-wrap');let applied=false;try{applied=normalizeAppearance(message.appearance).banner==='original'||!!target&&getComputedStyle(target).backgroundImage.includes(normalizeAppearance(message.appearance).banner==='prometheus'?chrome.runtime.getURL('image_2026-11-24_232002011.png'):'data:image/svg+xml')}catch{}if(typeof respond==='function')respond({ok:true,bannerTarget:!!target,applied});return false;
 });
 const start=revision;
 chrome.runtime.sendMessage({type:'wiki-appearance-read'},response=>{
  if(!chrome.runtime.lastError&&response?.ok&&start===revision)apply(response.appearance);
 });
})();