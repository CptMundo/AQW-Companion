/* First-paint guard: request only appearance, never inventory. Fail open. */
(()=>{
'use strict';
if(location.origin!=='https://aqwwiki.wikidot.com'||globalThis.AQWCWikiBoot)return;
const root=document.documentElement;if(!root)return;
const style=document.createElement('style');style.id='aqwc-first-paint';
const colors={neutral:'#192630',midnight:'#101924',slate:'#262c34',obsidian:'#141518',void:'#1b1627'};
const paint=color=>{style.textContent='html{background-color:'+color+'!important}html > body{opacity:0!important}'};
paint(colors.neutral);root.append(style);
let released=false,settled=false,appearance=null,themeDone=false,layoutDone=false,subscribers=[];
const deadline=setTimeout(release,1500);
function release(){if(released)return;released=true;clearTimeout(deadline);style.remove()}
function check(){if(themeDone&&layoutDone)release()}
function resolve(response){
 if(settled)return;settled=true;
 appearance=response?.ok?response.appearance:null;
 if(!appearance||appearance.background==='original'&&appearance.banner==='original')release();
 else if(!released)paint(colors[appearance.background]||colors.neutral);
 const callbacks=subscribers;subscribers=[];for(const cb of callbacks){try{cb(appearance)}catch{release()}}
}
globalThis.AQWCWikiBoot=Object.freeze({
 read(cb){if(settled)cb(appearance);else subscribers.push(cb)},
 themeReady(){themeDone=true;check()},
 layoutReady(){layoutDone=true;check()}
});
try{chrome.runtime.sendMessage({type:'wiki-appearance-read'},r=>{if(chrome.runtime.lastError)resolve(null);else resolve(r)})}catch{resolve(null)}
})();
