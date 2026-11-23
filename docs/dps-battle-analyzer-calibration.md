# AQW Companion — 60-second DPS calibration protocol

## Goal
Validate prediction against actual in-game damage, without requiring packet inspection or automation.

## Official data source
AQWorlds **Battle Analyzer**, documented by Artix:
https://www.aq.com/lore/guides/AdvancedOptions

Its capabilities include combat duration, damage dealt/taken, healing, kills and rewards.
The game's own Battle Analyzer must be treated as the measurement reference; recorded values are not automatically accessible via the AQW Companion inventory JSON. Avoid implying the existing Tampermonkey inventory importer includes damage data.

## Repeatable measurement conditions
1. Record exact class, level, class rank, weapon and armor/cape/helm and weapon damage range, enhancements and Forge traits, potions, monster name/tag and any other players' support buffs.
2. Record all live character stats shown by the game: attack power, spell power, crit chance, crit multiplier, haste, outgoing damage and relevant physical/magical bonuses.
3. Use the same enemy and equipment in all comparative measurements, with no outside players hitting the target.
4. Start a Battle Analyzer measurement at the opening of combat and run **60 seconds** continuously. Ensure fight duration actually reaches 60s; if the boss dies prematurely, choose a sturdier dummy/target.
5. Record Battle Analyzer **total damage and actual elapsed time**, not just an assumed timer length. If elapsed differs from 60s, the sample is not a valid strict 60s benchmark (or compute a separately labeled duration-normalized DPS).
6. Repeat at least five full 60-second attempts per build to estimate variability from crits/procs/rotations, storing per-run DPS, median, minimum, maximum, and standard deviation.
7. Capture class rotations and observed effect uptime where possible. Use a consistent combat-start condition (fresh cooldowns and buffs) for each run.

## Automatic simulator acceptance gates
- **No** theoretical DPS display when a skill function mapping is unknown.
- No use of a fixed arbitrary damage baseline.
- Include every direct damaging skill, relevant DoT and proc; add missing sources as blockers.
- Handle target tags and non-stacking same-category item boosts correctly; no gear boosts to DoT by accident.
- Model resource costs, skill replacement, aura stack and expiry, dynamic haste and per-hit crit assumptions.
- The predicted **distribution** (not just one magic number) must be compared with at least five measured attempts.
- Define and publish explicit percentage error tolerance and failing cases *before* claiming verified accuracy.
- Document game patch/version as formulas and balance changes over time.

## Additional community evidence (NOT official confirmation)
https://github.com/Shell1010/aqw-utils
Readme states raw class skill/passive data includes functions and coefficients; this repository is work-in-progress and describes tools that sniff game traffic. The companion should not rely on such a mechanism for standard users.
https://www.aqwhub.com/other-guides/do-ts-explained/

## Status
No direct in-game Battle Analyzer samples have yet been obtained or validated in this branch.
Therefore **not ready for automatic-DPS merge**.
