/* Optional one-time introduction. Local preference only; never changes game progress. */
(function(root){
'use strict';
const KEY='aqwc-onboarding-v1';
const STEPS=Object.freeze([
 {group:'home',tab:'overview',icon:'📊',title:'Your adventure starts here',body:'Home shows your calendar, recent activity and what changed since your last import.'},
 {group:'projects',tab:'unlocks',icon:'🎯',title:'Track your next item',body:'Add a goal to Wishlist to see the materials you own and what you still need to farm.'},
 {group:'planner',tab:'planner',icon:'📅',title:'Never lose track of a quest',body:'Pin daily and weekly quests, copy /join commands, and check off quests yourself.'},
 {group:'inventory',tab:'inventory',icon:'📦',title:'Know what you own',body:'Search Inventory & Bank. Sync again after farming to refresh quantities; this is not live game data.'},
 {group:'story',tab:'story',icon:'📖',title:'Follow your story',body:'Review saga badges and manually confirm chapters when needed. Unknown does not mean locked.'},
 {group:'home',tab:'overview',icon:'🧩',title:'Keep exploring',body:'Use the Wiki extension to add items to Wishlist. The visual guide covers builds, bosses, badges, themes and more.'}
]);
function read(store){try{const v=store.getItem(KEY);return ['seen','existing'].includes(v)?v:null}catch{return null}}
function write(store,value){try{store.setItem(KEY,value)}catch{}return value}
function createState(store){
 let state=read(store),initialized=false,hasInventory=false;
 return {init(has){if(initialized)return;initialized=true;hasInventory=!!has;if(hasInventory&&!state)state=write(store,'existing')},
  saved(has){if(!initialized)return false;const first=!hasInventory&&!!has;hasInventory=!!has;if(first&&!state){state=write(store,'seen');return true}return false},
  manual(){state=write(store,'seen')},
  get hasInventory(){return hasInventory}
 };
}
function mount(doc,store,navigate){
 const state=createState(store),get=id=>doc.getElementById(id),card=get('aqwc-getting-started'),panel=get('aqwc-tour'),replay=get('aqwc-tour-replay');
 if(!card||!panel||!replay)return null;
 let index=0,previous=null,highlight=null,visible=false,manual=false;
 const clearHighlight=()=>{highlight?.classList.remove('aqwc-tour-target');highlight=null};
 const updateCard=()=>{card.hidden=state.hasInventory};
 function close(restore=true){if(!visible)return;visible=false;panel.hidden=true;clearHighlight();if(restore&&previous?.isConnected&&!previous.closest('[hidden]')&&previous.getClientRects().length)previous.focus({preventScroll:true});previous=null}
 function paint(move){
  const step=STEPS[index];if(move)navigate(step.tab);clearHighlight();
  highlight=doc.querySelector('.primarynav [data-group="'+step.group+'"]');highlight?.classList.add('aqwc-tour-target');
  get('aqwc-tour-icon').textContent=step.icon;get('aqwc-tour-title').textContent=step.title;get('aqwc-tour-body').textContent=step.body;
  get('aqwc-tour-count').textContent=(index+1)+' / '+STEPS.length;
  get('aqwc-tour-progress').max=STEPS.length;get('aqwc-tour-progress').value=index+1;
  get('aqwc-tour-back').disabled=index===0;
  get('aqwc-tour-next').textContent=index===STEPS.length-1?'Done':'Next →';
 }
 function open(byChoice){if(visible)return;manual=byChoice;previous=doc.activeElement;index=0;visible=true;panel.hidden=false;paint(byChoice);if(manual)get('aqwc-tour-title').focus({preventScroll:true})}
 replay.addEventListener('click',()=>{state.manual();replay.closest('details')?.removeAttribute('open');open(true)});
 get('aqwc-tour-close').addEventListener('click',()=>close());
 get('aqwc-tour-skip').addEventListener('click',()=>close());
 get('aqwc-tour-next').addEventListener('click',()=>{if(index===STEPS.length-1){close();return}index++;paint(true)});
 get('aqwc-tour-back').addEventListener('click',()=>{if(index>0){index--;paint(true)}});
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&visible&&!e.defaultPrevented){close();e.preventDefault()}});
 return {init(has){state.init(has);updateCard()},saved(has){const first=state.saved(has);updateCard();if(first)open(false)},close};
}
const api={KEY,STEPS,createState,mount};
if(typeof module!=='undefined')module.exports=api;else root.AQWCOnboarding=api;
})(typeof globalThis==='undefined'?this:globalThis);
