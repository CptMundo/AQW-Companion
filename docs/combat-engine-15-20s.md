# Combat DPS — standard 60-second comparison window

**Status: measured-DPS support implemented; automatic theoretical DPS is NOT implemented.**

## Design decision

The common benchmark for offensive / solo classes is **60 seconds** of combat, beginning at combat start. DPS = damage dealt within [0,60) / 60. This is a common *product comparison window*, **not an official Artix standard or a promise that every class completes an equal number of rotations**. Very long ramp-up classes and unusual 60+ second cooldown skills may still need separate sustained or ramp-up analysis in the future.

A 20-second window overweights burst/nuke classes relative to sustained damage. A 60-second window is a practical first comparable baseline.

## What now works in the Damage Simulator

- The **Measured DPS** card accepts a class name and **total damage dealt during a complete 60-second recording**; as soon as the user enters the total, the UI calculates DPS.
- Example: 600000 observed damage in 60s = 10000 measured DPS.
- The detailed optional event mode accepts `time,skill,damage` lines; all events must be between 0 and <60s. DoTs/procs must be included, not just skill button hits.
- This measurement mode works with **any class**, since it only computes damage / duration.
- VHL has a **separate, research-only action timeline** of cooldowns, buffs and autoattack estimates. It explicitly reports damage and theoretical DPS as unavailable until proper skill functions and stats are validated.

## Honest limitations

1. **No automatic predicted DPS from equipped class/gear/Forge** exists yet. The current available skill coefficients and combat stat inputs are not sufficient for certified base-damage functions.
2. A class name in measured mode does not select a researched model: it only labels the observation.
3. A total measured damage input is reliable as DPS only if it is a genuinely complete 60-second combat measurement, including all damaging events and the exact start time.
4. The VHL timeline uses static user-provided haste and action gap; it does not reliably model live dynamic haste, server casting rules, Forge procs, crit randomness, mana/health, opponent defense or DoTs.
5. Do not promote measured DPS as *predicted* or *verified game formula*.
6. No browser end-to-end or real AQW combat calibration has yet been completed.

## Code

- `js/combat-engine.js` — `AQWCombatEngine.simulate({observedTotalDamage: 600000, className:"Legion Revenant"})` -> 10000 DPS for 60 seconds.
- `js/combat-engine-ui.js` — measured DPS card above VHL research timeline.
- `tests/combat-engine.test.cjs` — duration, observed total, event list, invalid inputs, no invented damage.
- `index.html` already loads both scripts.

## Next phase — truly automatic DPS

1. Source and verify each class/skill's server damage function and effects, starting with VHL.
2. Model action cadence, dynamic haste, passive/buff stacks, crit & dodge, weapon range, damage boosts, caps, enemy defenses, DoTs and Forge procs.
3. Record full real 60-second fight traces under controlled conditions for comparison/calibration.
4. Provide predicted DPS and uncertainty only for models validated against those traces.

## References

- https://aqwwiki.wikidot.com/void-highlord-class
- https://www.aq.com/lore/guides/stats
- https://www.aq.com/gamedesignnotes/AQW-Balance-PatchNotes-9515
- https://www.aqwhub.com/other-guides/do-ts-explained/
