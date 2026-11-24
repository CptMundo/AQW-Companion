/* Shared, local-only deep link format. No inventory or account data. */
(() => {
 'use strict';
 const ROOT='https://cptmundo.github.io/AQW-Companion/';
 const PREFIX='#aqwc-wishlist?';
 const types=Object.freeze({swords:'Sword',axes:'Axe',bows:'Bow',daggers:'Dagger',gauntlets:'Gauntlet',guns:'Gun',handguns:'Handgun',maces:'Mace',polearms:'Polearm',rifles:'Rifle',staffs:'Staff',wands:'Wand',weapons:'Weapon',classes:'Class',armors:'Armor','capes-back-items':'Cape',capes:'Cape','helmets-hoods':'Helm',helmets:'Helm',pets:'Pet','battle-pets':'Pet','misc-items':'Item','use-items':'Item',grounds:'Ground',necklaces:'Necklace',houses:'House','floor-items':'House Floor Item','wall-items':'House Wall Item',housing:'House Item',enhancements:'Enhancement'});
 function validate(value){
  if(!value||typeof value.name!=='string'||typeof value.slug!=='string'||typeof value.category!=='string')return null;
  const name=value.name.trim(),slug=value.slug,category=value.category;
  if(!name||name.length>350||/[\u0000-\u001f\u007f]/.test(name)||! /^[a-z0-9][a-z0-9-]{0,199}$/.test(slug)||!Object.hasOwn(types,category))return null;
  return {name,slug,category};
 }
 function build(value){
  const data=validate(value);return data?ROOT+PREFIX+new URLSearchParams(data).toString():null;
 }
 function parse(hash){
  if(typeof hash!=='string'||!hash.startsWith(PREFIX)||hash.length>3000)return null;
  const params=new URLSearchParams(hash.slice(PREFIX.length));
  if([...params.keys()].length!==3||['name','slug','category'].some(k=>params.getAll(k).length!==1))return null;
  return validate({name:params.get('name'),slug:params.get('slug'),category:params.get('category')});
 }
 function target(data){
  const clean=validate(data);if(!clean)return null;
  const type=types[clean.category],suffix=clean.name.match(/^(.*)\s+\(([^)]+)\)$/);
  const equivalent=[type.toLowerCase(),...(type==='Helm'?['helmet','hood']:type==='Item'?['misc','miscellaneous']:[])];
  // Strip only a matching category suffix, never an acquisition variant.
  const strip=suffix&&equivalent.includes(suffix[2].toLowerCase());
  return {name:strip?suffix[1].trim():clean.name,type,variant:!!suffix&&!strip,wiki:'https://aqwwiki.wikidot.com/'+clean.slug};
 }
 globalThis.AQWCWikiWishlist=Object.freeze({build,parse,target});
})();
