# Combat Engine — fixed 20-second VHL window

**Status:** Research preview integrated in the Damage Simulator; not validated as theoretical game DPS.

## Why 20 seconds?

The VHL Armageddon skill has a base 15-second cooldown. A 20-second burst window can capture a second use with a reasonable opening rotation. This is a **product-design choice**, not a scientifically universal benchmark: long fights and sustained DPS should ultimately use longer windows.

Source: https://aqwwiki.wikidot.com/void-highlord-class (class skills, cooldowns and buffs). Also see https://www.aq.com/lore/guides/stats and https://www.aq.com/lore/guides/enhancementtraits.

## UI

The Damage Simulator now includes a separate `Combat Window — VHL` section:
- **Fixed duration: 20s**, no window-length toggle.
- Offensive and defensive rotation presets; adjustable effective haste and cast spacing (calibration parameters, not certified server timing).
- Optional autoattacks with unverified starting phase.
- Timeline and snapshots of previously active auras.
- Measured DPS input `time,skill,damage` one hit per line, returning sum of observed damage / 20 only when observations exist.

The measured DPS is only as accurate as the completeness of the entered event log. Enter DoT ticks and Forge proc hits as separate events where relevant.

## Engine API

```js
AQWCombatEngine.simulate({
  seconds:20,
  rotation:["unshackle","gaze","armageddon"],
  actionGapSeconds:0.5,
  hastePercent:0,
  includeAuto:false
});
// resultStatus: incomplete; dps: null

AQWCombatEngine.simulate({
  observedEvents:[
    {time:0.3,id:"unshackle",damage:1000},
    {time:1.2,id:"armageddon",damage:2500}
  ]
});
// resultStatus: observed-window; fullDamage:3500; dps:175
```

No gear or class multipliers are applied again to recorded hits.

## Main limitations

- No verified per-skill server base damage functions; theoretical combat DPS remains **unavailable**.
- Server GCD, cast lock, animation time, client/server latency, autoattack phase and skill replacement semantics uncalibrated.
- Haste applied as static user-supplied value, not as dynamic Soul Void/Forge proc timing; VHL mana and HP costs unmodeled.
- Timed buffs captured as events, but they do **not** modify damage.
- Crit distribution, weapon variance, Forge procs, DoT/HoT tick modelling and target defense unimplemented.
- Timeline rotation is algorithmic and not a claim of optimal VHL play.
- In the "measuredHits" fallback, hit magnitude is constant for each skill; those numbers are **not** a trustworthy combat simulation during changing buffs. Prefer `observedEvents`.

## Validation

Verified via isolated JavaScript execution on 2026-11-23:
- Engine and UI pass JavaScript syntax compilation.
- 20-second example produces 11 skill events, Armageddon at 1s and 16s.
- Unknown damage -> `dps:null`.
- Two observed events totalling 400 over 20s -> 20 DPS.
- 15s windows rejected; optional autoattack events present.
- `index.html` includes the engine and UI scripts.

The repository regression script is `node tests/combat-engine.test.cjs`; the test script is committed but no CI runner execution has been confirmed. Browser end-to-end and actual AQW combat measurements still pending.

## Next

Record a full VHL 20-second battle (timestamps, hits, DoTs, procs, buffs, equipped enhancements) and calibrate timings. Then implement verified base damage / crit / target functions, followed by comparisons to observed sample results.
