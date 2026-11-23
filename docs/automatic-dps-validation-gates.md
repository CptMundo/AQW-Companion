# Automatic DPS — release gates (2026-11-23)

## Current status: NOT SOLVED; DO NOT MERGE AS AUTOMATIC DPS

The current 60-second calculation accepts observed damage totals. It does not predict damage using a player's equipped class, stats, skills, Forge and support effects.

The curated AP/SP helper (`js/damage-formulas.js`) provides **community-derived pre-modifier components only**, and refuses to calculate VHL hits because the current known source does **not** establish skill-specific server function mappings.

## Evidence

- https://www.aq.com/lore/guides/stats (official attack/spell terminology and weapon range)
- https://www.aqwwiki.wikidot.com/void-highlord-class (current listed VHL skills/coefficient/cooldowns)
- https://www.aqwhub.com/other-guides/do-ts-explained/ (community explanation of AP1/SP1/AP2/SP2)
- https://docs.google.com/spreadsheets/d/1wU6JlyrK_jYn5mVAzrLI4pRA4UM8LgY715kKU2U1vbQ/edit?gid=101348511 (community mapping: must independently validate and review freshness)
- https://www.aq.com/gamedesignnotes/AQW-Balance-PatchNotes-9515 (backend functions may change with patches)

## Mandatory gates before automatic DPS release

1. Verify skill-to-server-damage-function mappings for VHL and at least one other offensive class; do not infer AP2 from the phrase "weapon damage".
2. Reproduce player base stats for selected class/equipment/Forge or require exact in-game live stats.
3. Implement direct hit formula sequencing (attack/spell base, skill coefficient, class multiplier, weapon variance, critical chance and critical multiplier, armor/weapon bonuses, enemy tags, defenses and caps).
4. Implement all relevant 60-second time evolution: cooldowns with dynamic haste, abilities that overwrite one another, mana/HP costs, DoT/HoT, damage procs, stack order and buffs from support classes.
5. Capture multiple 60-second complete combat traces (with class/build/target/buffs known). Check event-by-event and total differences; publish error metrics and thresholds before calling outputs validated.
6. Only then show predicted DPS in the live UI. Keep community or approximate paths explicitly labeled as estimates.

## Tested helpers

Community model with AP 785, SP 200: AP1=163.5; SP1=105; AP2 (factor 1)=327; SP2 (factor 1)=210. LoO Blessing's **pre-modifier base component** in the curated community model = 105 × 1.45 = 152.25. This is **not a complete critical hit**, nor a valid DPS value. VHL Armageddon returns `missing-mapping`, never a fictional number.

These numerical primitives were run through isolated JavaScript assertions and also have a committed Node regression script. No game-level calibration has been performed.
