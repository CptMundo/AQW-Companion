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

## Research update — 2026-11-23 (correct VHL button mapping)

After an explicit source audit and CI regression failure, the timeline now distinguishes the following buttons and their **independent 4-second cooldowns**:

| AQW bar | Skill | Relevant weapon Forge activation |
| --- | --- | --- |
| 1 | Contract (auto) | Valiance |
| 2 | Shackle | Dauntless or Lacerate |
| 3 | Highlord's Gaze | Ravenous |
| 4 | Unshackle | None of Dauntless/Lacerate (2nd-skill traits) |
| 5 | Armageddon | Smite |

Shackle and Unshackle overwrite each other's postures, but the wiki notes that Contract's already-applied Soul Fend / Soul Breach stays for its normal duration. Therefore using the rotation 4 → 3 → 5 with Dauntless will have **zero Dauntless activations** unless button 2 is explicitly used. The mixed 2 → 4 → 3 → 5 preset tests this interaction but is **not a verified optimal rotation**.

The engine now records source-supported Soul Void haste and HoT/DoT power; Armageddon's offensive **and defensive** Kneel effects; rank passives; and HP/mana costs. DoT/HoT magnitude and effect ordering remain unknown.

The class values and source URLs are frozen as auditable research data in `data/combat/vhl-evidence.json`; CI checks that buttons, coefficients and cooldowns match the runtime, and that all unknown skill-function IDs remain null.

### Local external class skill data — not gameplay integration

`js/class-skill-import.js` can read **user-supplied** objects containing `actions.active[].nam`, `damage`, `dsrc`, `cd`, and `mp`, documented in a public community project (https://github.com/Shell1010/aqw-utils). It does not connect to accounts or capture traffic. It strips all other fields and leaves unit ambiguity / provenance unresolved. A recognized `dsrc` is **not automatically certified** or enabled in the live Damage Simulator. No class skill data has been imported from a user in this PR.

### Test coverage update

- Deterministic combinatorial suite: 648 combinations of rotation, weapon Forge, static haste, and action spacing; asserts event ordering, strict 60s range, mutually exclusive postures and Forge trigger correctness.
- Source evidence consistency test, DOM-simulated UI integration test, local import guard tests, existing kernel/calibration tests.
- GitHub Actions `combat-regression` run 45088920516 completed **successfully**, including the newest tests.

### Remaining mandatory conditions before public launch

This remains **NOT** a complete theoretical DPS simulator. Need independently checked VHL damage function mappings, health/mana and heal sustainability, hit/crit/DoT/proc magnitude, actual game action timing, full in-game live stats, and multiple official Battle Analyzer measurement trials under matched conditions. The same requirements then apply to each additional offensive class.
