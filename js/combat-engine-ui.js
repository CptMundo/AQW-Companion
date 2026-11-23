/* Combat engine UI: standardized 60-second research preview */
(function () {
"use strict";
function initCombatWindow() {
  const host=document.getElementById("damage"),engine=window.AQWCombatEngine,timeline=window.AQWCombatTimeline;
  if(!host||!engine||document.getElementById("aqw-combat-window"))return;
  const container=document.createElement("section");
  container.id="aqw-combat-window";
  container.style.cssText="margin-top:24px;padding:20px;border:1px solid #426e8c;border-radius:12px;background:#10283e;color:#e6f5ff";
  container.innerHTML=`
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px">
      <h3 style="margin:0">⚔️ Combat DPS — 60-second benchmark</h3>
      <span style="padding:6px 10px;border-radius:20px;background:#1d4563;color:#aee8ff;font-weight:700">60 seconds · Standard comparison</span>
    </div>
    <p style="color:#b1d4e8;line-height:1.5">Use the quick calculator for measured DPS from <strong>any offensive class</strong>. Below it, the VHL timeline remains a research preview and cannot predict theoretical DPS yet.</p>
    <div style="border:1px solid #4b7896;border-radius:10px;padding:14px;margin:15px 0;background:#0c2033">
      <h4 style="margin:0 0 8px">📊 Measured DPS — any offensive class</h4>
      <p style="color:#bad8e9">Enter the <strong>total damage recorded in a complete 60-second fight</strong>. This gives an immediate measured DPS without entering every hit. This does not predict damage from your build.</p>
      <label>Class name <input id="combat-class-name" type="text" placeholder="e.g. Void Highlord" value="Void Highlord" style="display:block;width:100%;margin:5px 0 10px"></label>
      <label>Total damage in 60 seconds <input id="combat-total-damage" type="number" min="0" step="1" placeholder="e.g. 600000" style="display:block;width:100%;margin:5px 0 10px"></label>
      <p id="combat-total-result" role="status" aria-live="polite" style="font-weight:800;color:#a3f6d5">Enter measured total damage to calculate DPS.</p>
    </div>
    <h4 style="margin:14px 0 7px">VHL action timeline (dynamic Soul Void haste; not a damage prediction)</h4>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin-top:12px">
      <label>Rotation <select id="combat-rotation" style="display:block;width:100%;margin-top:5px">
        <option value="unshackle,gaze,armageddon">Offensive: 3 → 2 → 5</option>
        <option value="shackle,gaze,armageddon">Defensive: 2 → 3 → 5</option>
        <option value="unshackle,armageddon,gaze">Offensive: 3 → 5 → 2</option>
      </select></label>
      <label>Weapon Forge (verified triggers)<select id="combat-forge" style="display:block;width:100%;margin-top:5px">
        <option value="None">None</option>
        <option value="Dauntless">Dauntless — skill 2</option>
        <option value="Valiance">Valiance — autoattack</option>
        <option value="Ravenous">Ravenous — skill 3</option>
        <option value="Lacerate">Lacerate — skill 2</option>
        <option value="Smite">Smite — skill 5</option>
      </select></label>
      <label>Base haste (%) <input id="combat-haste" type="number" min="0" max="50" step="1" value="0" style="display:block;width:100%;margin-top:5px"></label>
      <label>Cast spacing (seconds; calibration) <input id="combat-gap" type="number" min="0.1" max="5" step="0.1" value="0.5" style="display:block;width:100%;margin-top:5px"></label>
      <label style="align-self:center"><input id="combat-autos" type="checkbox"> Include autoattacks (unverified phase)</label>
    </div>
    <p style="font-size:12px;color:#bad8e9">Haste entered below is your <strong>base haste</strong>; Soul Void adds 30%, and Dauntless adds 25% while active (capped at 50%). The timeline shows Forge proc <strong>occurrences</strong>, not their unverified damage. Cast gap and auto phase remain assumptions.</p>
    <p id="combat-summary" role="status" style="margin-top:12px;color:#b9f6dc"></p>
    <div id="combat-events" style="max-height:300px;overflow:auto;border:1px solid #345b77;border-radius:8px;padding:10px"></div>
    <details style="margin-top:14px"><summary>Detailed measurement — paste every recorded hit (optional)</summary>
      <p style="color:#afd0e1">One event per line: <code>time,skill,damage</code> (e.g. <code>1.2,armageddon,24500</code>). Include every hit, DoT and Forge proc within 60 seconds. No predictions or automatic gear multipliers are applied.</p>
      <textarea id="combat-measured" rows="5" spellcheck="false" placeholder="0.2,unshackle,1000&#10;1.0,armageddon,4200" style="display:block;width:100%;background:#081a2b;color:#eafaff;border:1px solid #48708a;border-radius:8px;padding:9px"></textarea>
      <button type="button" id="combat-measure-button" style="margin-top:9px;padding:9px 13px;border:1px solid #71cafa;border-radius:8px;background:#174e70;color:#fff;cursor:pointer">Calculate observed 60s DPS</button>
      <p id="combat-measured-result" role="status"></p>
    </details>
    <small style="display:block;color:#a2c5d8;margin-top:12px">Current limitations: cooldown retiming on auras, server cast lock, HP/mana, Forge proc damage, crit variance and actual damage functions are not yet reproduced. <a href="https://aqwwiki.wikidot.com/void-highlord-class" target="_blank" rel="noopener noreferrer" style="color:#8cdefa">VHL source ↗</a> · <a href="https://www.aq.com/lore/guides/enhancementtraits" target="_blank" rel="noopener noreferrer" style="color:#8cdefa">Official Forge effects ↗</a></small>`;
  host.appendChild(container);
  const totalInput=container.querySelector("#combat-total-damage");
  const classInput=container.querySelector("#combat-class-name");
  const totalResult=container.querySelector("#combat-total-result");
  function calculateTotal(){
    const raw=totalInput.value.trim();
    if(!raw){totalResult.textContent="Enter measured total damage to calculate DPS.";return;}
    try {
      const result=engine.simulate({seconds:60,className:classInput.value.trim(),observedTotalDamage:Number(raw)});
      totalResult.textContent="Measured DPS: "+result.dps.toLocaleString(undefined,{maximumFractionDigits:2})+" · Total: "+result.fullDamage.toLocaleString()+" / 60s";
    }catch(error){totalResult.textContent="Invalid total damage: "+error.message;}
  }
  totalInput.addEventListener("input",calculateTotal);
  classInput.addEventListener("input",calculateTotal);
  const rotation=container.querySelector("#combat-rotation");
  const haste=container.querySelector("#combat-haste");
  const forge=container.querySelector("#combat-forge");
  const gap=container.querySelector("#combat-gap");
  const autos=container.querySelector("#combat-autos");
  const summary=container.querySelector("#combat-summary");
  const events=container.querySelector("#combat-events");
  function draw(){
    try{
      const report=engine.simulate({seconds:60,rotation:rotation.value.split(","),hastePercent:Number(haste.value),
        actionGapSeconds:Number(gap.value),includeAuto:autos.checked});
      const plan=timeline?timeline.plan({seconds:60,rotation:rotation.value.split(","),
        baseHastePercent:Number(haste.value),actionGapSeconds:Number(gap.value),
        includeAuto:autos.checked,weaponForge:forge.value,dynamicHaste:true}):null;
      summary.textContent=(plan?plan.events.length:report.events.length)+" planned events · dynamic haste enabled · VHL HP spending "+(plan?plan.nominalResourceCosts.spentMaxHpPct:"?")+"% of max HP before healing (survival not simulated) · theoretical DPS unavailable.";
      events.replaceChildren();
      const list=document.createElement("ol");list.style.cssText="padding-left:22px;margin:0;line-height:1.8";
      for(const event of (plan?plan.events:report.events)){
        const item=document.createElement("li");
        item.textContent=event.time.toFixed(2)+"s — "+(event.label||event.id)+
          " · haste "+(event.hastePercent??0).toFixed(0)+"%"+
          " · active: "+((event.auras||event.buffsBefore||[]).map(b=>b.id+(b.stacks>1?" ×"+b.stacks:"")).join(", ")||"none");
        list.appendChild(item);
      }
      events.appendChild(list);
    }catch(error){summary.textContent="Timeline input error: "+error.message;events.replaceChildren();}
  }
  [rotation,haste,forge,gap,autos].forEach(control=>control.addEventListener("change",draw));
  container.querySelector("#combat-measure-button").addEventListener("click",()=>{
    const output=container.querySelector("#combat-measured-result");
    try{
      const lines=container.querySelector("#combat-measured").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
      const observedEvents=lines.map((line,index)=>{
        const fields=line.split(",").map(x=>x.trim());
        if(fields.length!==3||!fields[0]||!fields[1]||!fields[2])throw Error("Line "+(index+1)+": expected time,skill,damage");
        return {time:Number(fields[0]),id:fields[1],damage:Number(fields[2])};
      });
      const report=engine.simulate({seconds:60,observedEvents});
      output.textContent=report.dps===null?"No hits supplied; observed DPS unavailable.":"Observed sample: "+report.fullDamage.toLocaleString()+" damage / 60 seconds = "+report.dps.toLocaleString(undefined,{maximumFractionDigits:2})+" DPS. Only accurate if the event list is complete.";
    }catch(error){output.textContent="Measurement error: "+error.message;}
  });
  draw();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initCombatWindow);
else initCombatWindow();
})();
