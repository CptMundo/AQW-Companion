/* Shared extension theme. Effective tokens from css/site.css, aqw-safe-redesign.
   Keep original CSS values as fallbacks; only the Companion preset defines these variables. */
(()=>{'use strict';
 const tokens=Object.freeze({
  "bg": "#0b1420",
  "panel": "#162332",
  "panel2": "#1c2c3d",
  "line": "#34485e",
  "txt": "#f0f5fb",
  "muted": "#a8bace",
  "cyan": "#69c8e8",
  "blue": "#5196d7",
  "gold": "#efc478",
  "green": "#63caa3",
  "red": "#f18c98",
  "input": "#101d2b",
  "nav": "#111e2b",
  "selected": "#235075",
  "selectedBorder": "#3c80ad",
  "hover": "#20374b",
  "table": "#1f3448",
  "focus": "#5aa6d5",
  "bgStart": "#0a1420",
  "bgMid": "#0d1926",
  "bgEnd": "#101e2b"
});
 const lightTokens=Object.freeze({"bg":"#eef3f8","panel":"#ffffff","panel2":"#e7eef6","line":"#b8c8d8","txt":"#172b40","muted":"#465f75","cyan":"#126387","blue":"#245e9c","gold":"#82530d","green":"#176b48","red":"#a32c45","input":"#f7fafc","nav":"#e4edf6","selected":"#c8e0f4","selectedBorder":"#5586ad","hover":"#dce9f5","table":"#dce7f0","focus":"#276b9e","bgStart":"#f4f7fb","bgMid":"#edf3f8","bgEnd":"#e7eff6"});
 const casTokens=Object.freeze({"bg":"#000000","panel":"#080008","panel2":"#140014","line":"#7e007e","txt":"#39ff14","muted":"#70e64e","cyan":"#39ff14","blue":"#ff00ff","gold":"#ffff00","green":"#39ff14","red":"#ff6978","input":"#080008","nav":"#000000","selected":"#ff00ff","selectedBorder":"#cf00cf","hover":"#220022","table":"#100010","focus":"#00ffff","bgStart":"#000000","bgMid":"#000000","bgEnd":"#000000","buttonText":"#440066"});
 const rootCss='html[data-aqwc-background="companion"]{'+Object.entries(tokens).map(([k,v])=>'--aqwc-theme-'+k+':'+v).join(';')+';color-scheme:dark}'+'html[data-aqwc-background="light"]{'+Object.entries(lightTokens).map(([k,v])=>'--aqwc-theme-'+k+':'+v).join(';')+';color-scheme:light}'+'html[data-aqwc-background="cas"]{'+Object.entries(casTokens).map(([k,v])=>'--aqwc-theme-'+k+':'+v).join(';')+';color-scheme:dark}';

 const semantic={'#90edb5':'green','#62dca1':'green','#52d3a2':'green','#ffdb93':'gold','#ffc2a8':'red','#fd8290':'red'};
 function role(hex,prop){
  const h=hex.toLowerCase();if(semantic[h]&&/color|background|border/.test(prop))return semantic[h];
  const [r,g,b]=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const max=Math.max(r,g,b),min=Math.min(r,g,b),light=(max+min)/2;
  // Keep rarity colours, purple quest accents, warm tags, green/red status shades
  // and neutral black/white artwork details distinct.
  if(r>g+12&&r>b+12||r>b+20&&g>b+10||g>r+20&&g>b+18||r>g+15&&b>g+15)return null;
  if(max-min<10&&(light<14||light>245))return null;
  if(prop==='color'||prop==='text-decoration-color'){
   if(light>218&&max-min<45)return 'txt';
   if(light>135&&max-min<47)return 'muted';
   if(b>=r+15||g>=r+18)return 'cyan';
   return light>175?'txt':'muted';
  }
  if(prop.startsWith('border')||prop.startsWith('outline')){
   if(light>100&&max-min>18)return 'focus';
   return 'line';
  }
  if(prop.startsWith('background')){
   if(light<27)return 'bg';
   if(light<43)return 'panel';
   if(light<65)return 'panel2';
   if(light<105)return 'hover';
   if(light<160)return 'selected';
   return 'blue';
  }
  return null;
 }
 function value(hex,prop){const k=role(hex,prop);return k?'var(--aqwc-theme-'+k+','+hex+')':hex}
 function recolor(css){
  return css.replace(/(?<![\w-])(background(?:-color|-image)?|color|border(?:-(?:top|right|bottom|left))?(?:-color)?|outline(?:-color)?|text-decoration-color)\s*:\s*([^;{}]+)/gi,
   (all,prop,body)=>prop+':'+body.replace(/url\([^)]*\)|#[0-9a-f]{6}(?![0-9a-f])/gi,x=>x.startsWith('#')?value(x,prop.toLowerCase()):x));
 }
 globalThis.AQWCTheme=Object.freeze({tokens,lightTokens,casTokens,rootCss,recolor,value});
})();
