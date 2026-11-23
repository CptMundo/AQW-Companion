"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const js=fs.readFileSync(path.join(__dirname,"../js/analytics-consent.js"),"utf8");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const privacy=fs.readFileSync(path.join(__dirname,"../privacy.html"),"utf8");
const style=fs.readFileSync(path.join(__dirname,"../css/analytics-consent.css"),"utf8");
const ID="G-JF725WDHV1";
assert.ok(html.includes('src="js/analytics-consent.js"'));
assert.ok(html.includes('href="css/analytics-consent.css"'));
assert.ok(html.includes('href="privacy.html"'));
assert.ok(privacy.includes("Google Analytics")&&privacy.includes(ID));
assert.ok(!html.includes("www.googletagmanager.com"),"No unconditional Google script in HTML");
assert.ok(!html.includes("This app uses no servers"),"Privacy claim is updated");
assert.ok(style.includes("#aqw-analytics-banner[hidden]"));
function scenario(initial,storageBlocked=false) {
  const elements={},headChildren=[],storage={};
  if(initial)storage["aqw-companion-analytics-consent-v1"]=initial;
  let reloads=0;
  function element(id) {
    return elements[id]??(elements[id]={
      id,hidden:true,attrs:{},listeners:{},src:null,
      setAttribute(name,value){this.attrs[name]=value;},
      addEventListener(type,fn){this.listeners[type]=fn;},
      querySelector(){return {focus(){}};}
    });
  }
  const document={
    getElementById:element,
    createElement(tag){return element("new-"+tag+"-"+Object.keys(elements).length);},
    head:{appendChild(script){headChildren.push(script);}}
  };
  const window={
    localStorage:{
      getItem(key){if(storageBlocked)throw new Error("blocked");return storage[key]??null;},
      setItem(key,val){if(storageBlocked)throw new Error("blocked");storage[key]=val;}
    },
    location:{origin:"https://cptmundo.github.io",pathname:"/AQW-Companion/",search:"?sensitive=SECRET",
      reload(){reloads++}}
  };
  vm.runInNewContext(js,{document,window,encodeURIComponent,console},{filename:"analytics-consent.js",timeout:1500});
  return {
    elements,window,storage,headChildren,get reloads(){return reloads;},
    click(id){element(id).listeners.click();}
  };
}
const fresh=scenario();
assert.equal(fresh.headChildren.length,0,"No Google tag before opt-in");
assert.equal(fresh.elements["aqw-analytics-banner"].hidden,false,"Unchosen visitors see controls");
fresh.click("aqw-analytics-reject");
assert.equal(fresh.headChildren.length,0,"Reject must not load Google");
assert.equal(fresh.storage["aqw-companion-analytics-consent-v1"],"reject");
fresh.click("aqw-analytics-settings");
assert.equal(fresh.elements["aqw-analytics-banner"].hidden,false,"Settings reopen choice");
fresh.click("aqw-analytics-accept");
assert.equal(fresh.headChildren.length,1,"Accept loads exactly one tag");
assert.ok(fresh.headChildren[0].src.includes(ID));
const commands=Array.from(fresh.window.dataLayer||[],args=>Array.from(args));
assert.equal(commands[0][0],"consent");
assert.equal(commands[0][1],"default");
assert.equal(commands[0][2].analytics_storage,"denied");
assert.equal(commands[1][1],"update");
assert.equal(commands[1][2].analytics_storage,"granted");
const config=commands.find(args=>args[0]==="config");
assert.equal(config[1],ID);
assert.equal(config[2].page_location,"https://cptmundo.github.io/AQW-Companion/");
assert.ok(!JSON.stringify(config).includes("SECRET"),"No query parameters leak");
assert.equal(config[2].allow_google_signals,false);
assert.equal(config[2].allow_ad_personalization_signals,false);
fresh.click("aqw-analytics-accept");
assert.equal(fresh.headChildren.length,1,"Repeated acceptance does not duplicate tag");
fresh.click("aqw-analytics-reject");
assert.equal(fresh.reloads,1,"Revocation forces a no-tag reload");
assert.equal(fresh.storage["aqw-companion-analytics-consent-v1"],"reject");
const later=scenario("accept");
assert.equal(later.headChildren.length,1,"Stored opt-in reactivates tag");
assert.equal(later.elements["aqw-analytics-banner"].hidden,true);
const declined=scenario("reject");
assert.equal(declined.headChildren.length,0,"Stored opt-out remains blocked");
const noStorage=scenario(null,true);
assert.equal(noStorage.headChildren.length,0);
noStorage.click("aqw-analytics-accept");
assert.equal(noStorage.headChildren.length,1,"In-memory explicit choice works when storage blocked");
console.log("GA4 opt-in consent tests passed: default deny, decline, accept, revoke, privacy and URL safety.");
