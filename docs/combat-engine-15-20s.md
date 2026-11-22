# Combat engine — 15 / 20 second prototype

**Status:** timeline engine only; not validated real-game DPS. Not wired to the Damage Simulator UI yet.

## Verified source inputs

* VHL skill cooldowns (Contract 2.3 s; Shackle/Unshackle 4 s; Highlord's Gaze 5 s; Armageddon 15 s), coefficients and listed duration-based effects: [AQWWiki VHL](https://aqwwiki.wikidot.com/void-highlord-class).
* Character stat definitions including cooldown reduction/haste: [Artix stat guide](https://www.aq.com/lore/guides/stats).
* Proc behavior requires additional modelling: [Artix Forge enhancement traits](https://www.aq.com/lore/guides/enhancementtraits).

## Contract

Load `js/combat-engine.js` in browser, then call:

```js
const report = AQWCombatEngine.simulate({
  seconds: 15, // or 20
  rotation: ["unshackle","gaze","armageddon"],
  actionGapSeconds: 0.5, // user-calibrated illustrative input, NOT an official AQW GCD
  hastePercent: 0,       // caller-provided effective value, not dynamically computed
  includeAuto: false     // auto phase is uncertain; opt-in only
});
console.log(report.events, report.dps); // dps === null (unknown hit formula)
```

For **experimental empirical replay**, supply `measuredHits: {unshackle: 1000, gaze: 1200, armageddon: 4000}`, where these are user-recorded final observed hits from a *fixed scenario*. The engine simply sums the given full hits for every action; these recorded values already include all applicable gear/buffs and must NOT be multiplied again. It returns `resultStatus: "measured-input-only"` and a mathematically normalized DPS figure, **not a validated AQW theoretical DPS**. Constant hit values across changing aura phases are a known serious limitation. For meaningful 15/20 s DPS, capture timestamped per-hit observations instead of extrapolating one averaged hit per skill.

## Correctly handled

- Strict 15 or 20 second windows; event at exact window boundary excluded.
- Ordered rotation with independent cooldown clocks.
- Autoattack scheduling on an independent clock, opt-in.
- Event snapshots of active effects and expiry times.
- Explicit unresolved damage values (null), no fabricated DPS.
- Input validation, number of casts per skill, missing-hit flags.

## Not yet modelled (must not claim accurate DPS)

- Global cooldown/cast delay and skill animation timing; `actionGapSeconds` is a calibration input only.
- Haste gained/lost dynamically, including VHL Soul Void +30%, Forge Dauntless; current haste input is static.
- Accurate VHL soul-slot replacement cooldown semantics.
- Mana/HP costs and survivability, class effects that depend on health or mana.
- Server-specific attack/spell base functions, crit distribution, haste caps, enemy resistance/defense.
- DoT/HoT ticks and snapshots, proc timing/damage, skill effects that depend on random chance.
- Timing of buffs on the triggering hit vs later hits.
- Lag/ping and whether autoattacks are delayed by active skills.

## Next task

1. Record video or combat log of a real 15s and 20s VHL fight, noting each hit time, which skill crit, active buffs, target type and forge proc.
2. Implement a **per-event observed-hit mode** and compare the timeline with recorded timestamps; make timing inputs match before computing theoretical damage.
3. Source and validate VHL skill function mappings (including base physical damage) and test 15/20 second end-to-end totals.
4. Integrate into `index.html` after tests are run and UI scope approved.

Run tests: `node tests/combat-engine.test.cjs`.
