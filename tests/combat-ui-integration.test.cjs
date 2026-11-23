"use strict";
const assert=require("node:assert/strict");
const vm=require("node:vm");
const fs=require("node:fs");
const path=require("node:path");
const source=(file)=>fs.readFileSync(path.join(__dirname,"../js",file),"utf8");
const widgets=new Map();
function node(id) {
  return {id,value:"",textContent:"",innerHTML:"",style:{},checked:false,children:[],listeners:{},
    addEventListener(event,handler){this.listeners[event]=handler;},
    appendChild(child){this.children.push(child);return child;},
    replaceChildren(){this.children=[];},
    querySelector(selector){return widgets.get(selector);}};
}
const host=node("damage");
const document={
  readyState:"complete",
  getElementById(id){if(id==="damage")return host; if(id==="aqw-combat-window")return host.children.find(x=>x.id===id)||null;return null;},
  createElement(tag){return node(tag);}
};
for(const id of ["combat-total-damage","combat-class-name","combat-total-result","combat-rotation",
  "combat-haste","combat-forge","combat-gap","combat-autos","combat-summary","combat-events",
  "combat-measure-button","combat-measured","combat-measured-result"]){
  widgets.set("#"+id,node(id));
}
widgets.get("#combat-class-name").value="Void Highlord";
widgets.get("#combat-rotation").value="unshackle,gaze,armageddon";
widgets.get("#combat-haste").value="0";
widgets.get("#combat-gap").value="0.5";
widgets.get("#combat-forge").value="None";
const context=vm.createContext({window:{},document,console});
for(const file of ["combat-engine.js","combat-timeline.js","combat-engine-ui.js"]){
 vm.runInContext(source(file),context,{filename:file,timeout:2000});
}
assert.equal(host.children.length,1,"UI initializes once");
const inner=host.children[0].innerHTML;
assert.ok(inner.includes('id="combat-forge"'),"Forge controls rendered");
assert.ok(inner.includes("2 → 4 → 3 → 5"),"mixed rotation rendered");
assert.ok(inner.includes("Offensive: 4 → 3 → 5"),"actual VHL button numbers");
const summary=widgets.get("#combat-summary");
assert.ok(summary.textContent.includes("theoretical DPS unavailable"),"no fake DPS");
const damage=widgets.get("#combat-total-damage");
damage.value="600000";
damage.listeners.input();
assert.ok(widgets.get("#combat-total-result").textContent.includes("10,000"),
  "measured total produces correct 60s DPS");
damage.value="-1";
damage.listeners.input();
assert.ok(widgets.get("#combat-total-result").textContent.includes("Invalid total damage"),
  "negative values rejected");
const forge=widgets.get("#combat-forge"),rotation=widgets.get("#combat-rotation");
forge.value="Dauntless";
forge.listeners.change();
assert.ok(summary.textContent.includes("requires button 2"),"correctly warns when Dauntless cannot proc");
rotation.value="shackle,unshackle,gaze,armageddon";
rotation.listeners.change();
assert.ok(!summary.textContent.includes("requires button 2"),"Shackle enables Dauntless proc");
assert.ok(widgets.get("#combat-events").children[0].children.some(x=>x.textContent.includes("Dauntless proc")),
  "Forge proc visible in event list");
const observed=widgets.get("#combat-measured");
observed.value="0.2,unshackle,1000\n1.0,armageddon,4200";
widgets.get("#combat-measure-button").listeners.click();
assert.ok(widgets.get("#combat-measured-result").textContent.includes("5,200"),
  "timestamp input calculates observed total");
assert.equal(host.children.length,1,"no duplicate panel");
console.log("DOM-simulated combat UI integration tests passed");
