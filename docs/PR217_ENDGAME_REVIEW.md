# AQW Companion — PR #217 consolidated endgame review

27 November 2026 | Beta 0.13.3 | Review candidate, not gameplay-certified.

## Review instructions and gate
Review the exact text and teams below. Mark incorrect/conditional/unresolved/playtested, supply a corrected source or recording. No merge until owner approval. Source-documented does not mean verified on the live patch. No universal BiS claims; all Class Builds remain hidden. Full live access, all recent patches, and every linked page could not be certified; several Wikidot/AQW App/Solaris pages returned redirect/cache failures. Search extracts and workbook cells were accessible. Bootiest's latest recorded edit is October 2025, so its templates are historical cross-checks. Do not silently combine them with newer presets. The previously reviewed The List farming benchmarks depend on exact gear, mob HP, pots and setup; no KPM published. The patch-note endpoint returned an old full cached page despite newer search excerpts: current-patch review remains open. Specialist validation has not been performed.

## Source and reliability matrix
| Area | Evidence | Status |
|---|---|---|
| 12 Ultra records / 22 variants | Workbook rows, Shell1010 AQW-md files, available mechanics references | Conditional; review individual timing and viability |
| 29 other encounters | Named tabs and original class columns | Source alignment reviewed; gameplay and patch freshness pending |
| 16 class presets | 15 exact four-slot matches; LR Lament is one of two listed cape options | Source exact/conditional; hidden |
| 11 catalog entries | Wiki search extracts and official patch reference where available | Catalog only; some maps/access unresolved |
| Speaker chart | E3:G23, 20 events excluding repeat marker | Exact transcription; expert gameplay review pending |
| Software | New regression checks submitted with this revision | CI results must be checked separately |

Official balance source: https://www.aq.com/gamedesignnotes/AQW-Balance-PatchNotes-9515 (cache discrepancy). Important current changes include LR secondary-target damage and LoO defensive rebalance; do not assume old builds retain their performance. Current wiki class skill extracts confirm VDK skill 5 Decay 3s, LR skill 2 Decay 2s, LoO Quixotic eligible physical/magical damage suppression, AP Broken Seal and CSH Tracer HoT. No complete latest patch certification.

## Ultra Guides (12 encounters / 22 teams)

### ezrajal — Quick — /join ultraezrajal
- Access: 4-player encounter. Check level and the Time Inn quest chain before joining. (https://aqwwiki.wikidot.com/ultra-ezrajal-location)
- Goal: Stop dealing damage during reflection.
- Avoid: Do not keep attacking while Counter Attack is active.
- Source review: Normal clear uses reflection handling; no weapon-lock exploit. Workbook HP is advisory.
- Workbook evidence: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=916842202 (G4:G16, A32)
- Counter Attack: Untarget or stop damaging skills when the reflection is announced; resume only when it ends.
- Survival: Keep recovery available during the heavy burst and watch skill locks. The workbook recommends at least 3,175 HP.

#### Workbook team (workbook)
Team: Lord of Order / Legion Revenant / ArchPaladin / Chrono ShadowHunter
Status: Conditional · source-documented, gameplay unverified
Shared instructions only; no separate personal rotation documented.
- Source: [Simplified Bosses Guide — Timeinn Trio (G4:G16, A32)](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=916842202)
- Source: [Mechanics](https://aqw.app/monsters/ultraezrajal)
- Source: [Ordinary clear](https://sites.google.com/view/aqwg-net/ultra-bosses)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

#### Accessible DPS team (hub)
Team: Lord of Order / ArchPaladin / Chaos Avenger / Legion Revenant
Status: Conditional · source-documented, gameplay unverified
Shared instructions only; no separate personal rotation documented.
- Source: [AQW Hub — Timeinn Ultras](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Timeinn%20Ultras.md)
- Source: [Mechanics](https://aqwwiki.wikidot.com/ultra-ezrajal-monster)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### warden — Quick — /join ultrawarden
- Access: 4-player encounter; level 61+. Time Inn progression unlocks the challenge buttons. (https://aqwwiki.wikidot.com/ultra-warden-location)
- Goal: Recover quickly from the 1-HP attack; protect the Berserk phase.
- Avoid: A taunt redirects eligible attacks, not Berserk itself.
- Source review: SC is a documented healer alternative, not a guarantee of recovery. Time skill 5 for eligible damage, not the fixed HP reduction.
- Workbook evidence: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=916842202 (G64:G76, A92)
- Recovery: Celestial Shockwave is triggered at 5% HP intervals. Keep recovery available for the sudden HP drop; avoid pushing the next threshold if heals are not ready.
- Berserk: At 30% HP (450k), the boss attacks faster. The assigned durable player redirects eligible attacks; LoO times skill 5 for eligible damage, not the fixed HP drop itself. Recover promptly.

#### Workbook team (workbook)
Team: Lord of Order / Legion Revenant / StoneCrusher / Chrono ShadowHunter
Status: Conditional · source-documented, gameplay unverified
Preparation: Assigned taunter: Scroll of Enrage. Agree who handles sudden HP drops.
- Lord of Order: Time skill 5 and heals for the Berserk transition.
- Legion Revenant: Take the assigned taunts, especially near Berserk; coordinate recovery.
- StoneCrusher: Maintain support and recovery after HP drops.
- Chrono ShadowHunter: Control damage at the Berserk threshold until your team is ready.
- Source: [Simplified Bosses Guide — Timeinn Trio (G64:G76, A92)](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=916842202)
- Source: [AQW Hub — Timeinn Ultras](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Timeinn%20Ultras.md)
- Source: [Mechanics](https://aqwwiki.wikidot.com/ultra-warden-monster)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

#### Accessible DPS team (hub)
Team: Lord of Order / Legion Revenant / StoneCrusher / Chaos Avenger
Status: Conditional · source-documented, gameplay unverified
Preparation: Assigned taunter: Scroll of Enrage. Agree who handles sudden HP drops.
- Lord of Order: Coordinate recovery and skill 5 near Berserk.
- Legion Revenant: Use assigned taunts to redirect dangerous attacks.
- StoneCrusher: Maintain steady recovery.
- Chaos Avenger: Deal damage and hold the transition until recovery is ready.
- Source: [AQW Hub — Timeinn Ultras](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Timeinn%20Ultras.md)
- Source: [Mechanics](https://aqw.app/monsters/ultrawarden)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### engineer — Quick — /join ultraengineer
- Access: 4-player encounter; level 61+. Time Inn progression unlocks the challenge buttons. (https://aqwwiki.wikidot.com/ultra-engineer-location)
- Goal: Defense Drone → Attack Drone → Engineer.
- Avoid: Never damage the Defense Drone into reflection.
- Source review: SC variant has no AP combo. Drone order and counter response are shared; do not assume identical burst timing.
- Workbook evidence: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=916842202 (G125:G137, A153)
- Opening: Buff before starting; let a long-range player initiate before moving in.
- Drones: Kill Defense Drone first and Attack Drone second. Stop hitting Defense Drone during Counter Attack. Engineer is protected while drones remain.
- Finish: Once the drones are gone, focus Engineer. Prepare for heavy damage if the fight continues.

#### Workbook team (workbook)
Team: Lord of Order / Legion Revenant / StoneCrusher / Chrono ShadowHunter
Status: Conditional · source-documented, gameplay unverified
Shared instructions only; no separate personal rotation documented.
Condition: The workbook’s AP-specific combo does not apply to this StoneCrusher roster; use the general drone sequence instead.
- Source: [Simplified Bosses Guide — Timeinn Trio (G125:G137, A153)](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=916842202)
- Source: [Mechanics](https://aqw.app/monsters/ultraengineer)
- Source: [Target order](https://sites.google.com/view/aqwg-net/ultra-bosses)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

#### ArchPaladin team (hub)
Team: Lord of Order / ArchPaladin / Chaos Avenger / Legion Revenant
Status: Conditional · source-documented, gameplay unverified
- Lord of Order: Maintain buffs. Coordinate mitigation for the Attack Drone if the team uses that tactic.
- ArchPaladin: Support survivability and focus Defense Drone first; avoid reflection. The workbook describes a 2-4-5 burst for AP, only outside reflection.
- Chaos Avenger: Focus the Defense Drone, then Attack Drone, then Engineer.
- Legion Revenant: Support and focus the called drone.
- Source: [AQW Hub — Timeinn Ultras](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Timeinn%20Ultras.md)
- Source: [Mechanics](https://aqw.app/monsters/ultraengineer)
- Source: [AP-specific combo — Timeinn Trio A153 (G125:G137, A153)](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=916842202)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### tyndarius — Strategy — /join ultratyndarius
- Access: 4-player encounter; level 61+ and Avatar of Fire quest completed. Not the separate Ultra Tyndarius in /ultraflamelord. (https://aqwwiki.wikidot.com/ultra-avatar-tyndarius-location)
- Goal: Control both orbs and focus Tyndarius after them.
- Avoid: Avoid uncontrolled orb overlap and random taunts.
- Source review: Orb-specific roles are preserved; the three-taunter variant requires scrolls or a native taunt. Faster no-taunt clear is not assumed.
- Workbook evidence: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=169238376 (G4:G16, A32)
- Before pulling: Agree who handles the boss and each orb. Keep assigned targets controlled and kill the orbs rapidly.
- Repeat: When an orb respawns, its assigned player returns to it. Help the remaining orb before returning to Tyndarius.

#### Three taunters · Dragon of Time (hub-dot)
Team: Lord of Order / Legion Revenant / ArchPaladin / Dragon of Time
Status: Conditional · source-documented, gameplay unverified
Preparation: LR and AP: Scroll of Enrage. Right-orb player: Scroll of Enrage for this three-taunter strategy; coordinate native Focus if available.
- Lord of Order: Maintain buffs and attack Tyndarius; no separate taunt assignment in this variant.
- Legion Revenant: Taunt and defeat the left orb.
- ArchPaladin: Enter first and taunt Tyndarius; use skill 4 for mitigation.
- Dragon of Time: For this taunt variant, bring Scroll of Enrage and control the right orb. Kill it before its breath, then help the left orb.
- Source: [AQW Hub — Ultra Tyndarius](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Ultra%20Tyndarius.md)
- Source: [Three-target strategy](https://nandixer.github.io/tyndarius/)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

#### Three taunters · Chaos Avenger (hub-cav)
Team: Lord of Order / Legion Revenant / ArchPaladin / Chaos Avenger
Status: Conditional · source-documented, gameplay unverified
Preparation: LR and AP: Scroll of Enrage. Right-orb player: Scroll of Enrage for this three-taunter strategy; coordinate native Focus if available.
- Lord of Order: Maintain buffs and attack Tyndarius.
- Legion Revenant: Taunt and defeat the left orb.
- ArchPaladin: Initiate, mitigate with skill 4 and taunt Tyndarius.
- Chaos Avenger: Control the right orb with your native Focus and Scroll of Enrage as needed, then help left.
- Source: [AQW Hub — Ultra Tyndarius](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Ultra%20Tyndarius.md)
- Source: [Three-target strategy](https://nandixer.github.io/tyndarius/)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

#### Three taunters · Arcana Invoker (hub-ai)
Team: Lord of Order / Legion Revenant / ArchPaladin / Arcana Invoker
Status: Conditional · source-documented, gameplay unverified
Preparation: LR and AP: Scroll of Enrage. Right-orb player: Scroll of Enrage for this three-taunter strategy; coordinate native Focus if available.
- Lord of Order: Maintain buffs and attack Tyndarius.
- Legion Revenant: Taunt the left orb.
- ArchPaladin: Initiate, mitigate and taunt Tyndarius.
- Arcana Invoker: Pre-stack if possible, taunt and defeat the right orb, then help left.
- Source: [AQW Hub — Ultra Tyndarius](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Ultra%20Tyndarius.md)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### drago — Strategy — /join ultradrago
- Access: 4-player encounter; level 80+ and Mahapadma quest completed. (https://aqwwiki.wikidot.com/ultra-drago)
- Goal: Defeat Bowmaster, then Executioner, then Drago.
- Avoid: Do not allow the guards to remain alive for too long.
- Source review: Guard assignment is source-backed. LoO mitigation before Bowmaster death is a conditional tactic; not a universal requirement.
- Workbook evidence: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1649867842 (G4:G16, A32)
- Target order: Focus right-side Bowmaster first, then left-side Executioner. Coordinate before switching targets.
- Time limit: Guard debuffs accumulate; finish the guards promptly to avoid the lethal Judgement Day.

#### Two guard taunters (hub)
Team: Lord of Order / ArchPaladin / Chaos Avenger / Legion Revenant
Status: Conditional · source-documented, gameplay unverified
Preparation: AP and CAv are the assigned guard taunters. AP needs Scroll of Enrage for this assignment; CAv coordinates native Focus with a scroll.
- Lord of Order: Maintain buffs; if using the AQWG mitigation timing, stay on Executioner and time Quixotic just before Bowmaster dies.
- ArchPaladin: Taunt the left-side Executioner.
- Chaos Avenger: Taunt the right-side Bowmaster; coordinate Scroll of Enrage and your own taunt.
- Legion Revenant: Maintain support and damage on the called target.
- Source: [AQW Hub — Astravia Ultras](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Astravia%20Ultras.md)
- Source: [Timing](https://sites.google.com/view/aqwg-net/ultra-bosses)
- Source: [Jix composition](https://jix-aqw.github.io/guias/ultra-bosses/ultra-drago.html)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### darkon — Advanced — /join ultradarkon
- Access: 4-player encounter. Check the story and level requirements at the linked location before joining. (https://aqwwiki.wikidot.com/ultra-darkon)
- Goal: Control Elegy stuns, stagger healing and respect the damage checks.
- Avoid: Avoid consecutive Elegy exposure and Vainglory during healing reduction.
- Source review: Two distinct taunt pairs, incomplete phase-specific post-refill timing. Both are conditional community strategies, not complete standalone rotations.
- Workbook evidence: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1970892061 (G4:G16, A32)
- Phase 1 DPS check: Reach the transition near 15.56M HP within 72 seconds. Then respect the alternating Elegy and healing plan.
- Healing: Alternate major heals rather than using them together. Avoid Vainglory during the severe healing reduction.
- Taunts: Follow only the chosen team's assigned taunt pair during the Elegy phase. Alternate the dangerous hits; do not infer that loop timing continues unchanged after the HP refill.
- Transition: The team must agree the taunt and healing timing around the HP refill and final phase before entering.

#### Workbook · LoO / LR taunts (workbook)
Team: Lord of Order / Legion Revenant / Paladin Chronomancer / Chrono ShadowHunter
Status: Conditional · source-documented, gameplay unverified
Preparation: Assigned taunt pair: Scroll of Enrage. Agree phase-specific timing and stagger direct heals. Avoid Vainglory in the healing-reduction phase.
- Lord of Order: Alternate taunts with LR, coordinate heals with PCM; reserve skill 5 for the nuke around 4.6–4.5M HP as described by the source.
- Legion Revenant: Alternate Elegy taunts with LoO according to the agreed phase timing. Confirm the post-refill plan instead of automatically continuing the opening loop.
- Paladin Chronomancer: Alternate major heals with LoO; keep recovery for the final phase.
- Chrono ShadowHunter: Sustain DPS while respecting the team's healing and taunt plan.
Condition: Workbook rotation: first taunter on pull, next on the tentacle/mouth animation, repeat until the HP refill. The workbook and other community guides differ on post-refill loop timing; follow the agreed phase-specific plan, not the opening loop automatically. This is partial role guidance, not a complete fight schedule.
- Source: [Simplified Bosses Guide — Darkon (G4:G16, A32)](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1970892061)
- Source: [Monster mechanics](https://aqwwiki.wikidot.com/darkon-the-conductor)
- Source: [Phase thresholds](https://solarisaqw.lol/guides/ultra-weeklies/ultradarkon)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

#### AQW Hub · LR / SC taunts (hub)
Team: Lord of Order / Legion Revenant / StoneCrusher / LightCaster
Status: Conditional · source-documented, gameplay unverified
Preparation: Assigned taunt pair: Scroll of Enrage. Agree phase-specific timing and stagger direct heals. Avoid Vainglory in the healing-reduction phase.
- Lord of Order: Coordinate healing with LightCaster; keep buffs active and reserve mitigation for the agreed nuke.
- Legion Revenant: First taunter in the LR/SC pair; alternate with SC.
- StoneCrusher: Second taunter in the LR/SC pair; alternate with LR.
- LightCaster: Sustain DPS and alternate heals with LoO.
Condition: This roster uses different taunters from the workbook. Do not apply the LoO/LR loop to it. Confirm the full phase timing via the linked guide. This is partial role guidance, not a complete fight schedule.
- Source: [AQW Hub — Astravia Ultras](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Astravia%20Ultras.md)
- Source: [Phase guide](https://solarisaqw.lol/guides/ultra-weeklies/ultradarkon)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### speaker — Advanced — /join ultraspeaker
- Access: 4-player encounter; level 90+ and Your Hero quest completed. (https://aqwwiki.wikidot.com/ultra-speaker)
- Goal: Follow one full taunt and Zone chart as a team.
- Avoid: Never improvise a taunt or enter a Zone while marked, petrified or recently zoned.
- Source review: Exact chart transcription checked; DPS and gear/survival still need playtest. Chart does not guarantee behavior in a desynchronized fight.
- Workbook evidence: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=750413215 (E3:G23)
- Truth / Listen: Truth increases incoming magic damage; Listen petrifies. Intercept only the attacks assigned by the selected chart.
- Zone: One assigned player stays inside the red square to cleanse auto-attack stacks. Everyone else exits; a player with prohibited debuffs must not zone.
- Preparation: LR, LoO and AP bring Scrolls of Enrage and agree this exact three-taunter chart. DPS follows its Zone assignment. If the boss sequence deviates from the chart, coordinate a reset or an experienced team response rather than blindly advancing.

#### 3-man taunt · Void Highlord (three-vhl)
Team: Lord of Order / Legion Revenant / ArchPaladin / Void Highlord
Status: Conditional · source-documented, gameplay unverified
Preparation: Three taunters: Scroll of Enrage. Verify HP and mitigation; DPS damage consumables are a source option.
- Lord of Order: Follow the LoO rows of the chart. Maintain buffs, coordinate heals and use skill 5 only at assigned mitigation cues.
- Legion Revenant: Follow LR's chart rows; apply skill 2 as the red Zone appears to prevent boss healing.
- ArchPaladin: Follow AP's chart rows; coordinate Seal mitigation and heals.
- Void Highlord: DPS role: take the first Zone in this chart; deal damage and do not add taunts.
- Source: [Simplified Bosses Guide — Speaker Charts — E3:G23 (E3:G23)](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=750413215)
- Source: [AQW Hub — Ultra Speaker](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Ultra%20Speaker.md)
- Source: [Mechanics](https://nandixer.github.io/malgor/)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

#### 3-man taunt · Chrono ShadowHunter (three-csh)
Team: Lord of Order / Legion Revenant / ArchPaladin / Chrono ShadowHunter
Status: Conditional · source-documented, gameplay unverified
Preparation: Three taunters: Scroll of Enrage. Verify HP and mitigation; DPS damage consumables are a source option.
- Lord of Order: Follow LoO's chart rows. Maintain buffs and coordinate healing and assigned skill 5.
- Legion Revenant: Follow LR's chart rows; apply skill 2 when a Zone appears.
- ArchPaladin: Follow AP's chart rows and coordinate Seal mitigation and healing.
- Chrono ShadowHunter: DPS role: take Zone 1, sustain damage and do not add taunts.
- Source: [Simplified Bosses Guide — Speaker Charts — E3:G23 (E3:G23)](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=750413215)
- Source: [AQW Hub — Ultra Speaker](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Ultra%20Speaker.md)
- Source: [Mechanics](https://nandixer.github.io/malgor/)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### kathool — Strategy — /join kathooldepths
- Access: 7-player encounter. Check the location requirements before joining. (https://aqwwiki.wikidot.com/kathool-depths)
- Goal: All seven players equip Vigil and activate it on the Nightmare cue.
- Avoid: Never replace Vigil with a taunt.
- Source review: Vigil mandatory for the documented mechanic. Target split depends on damage type and group; agree in advance.
- Workbook evidence: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=200910874 (G4:G28, A32)
- Vigil: When “You cannot resist.” appears, activate Vigil within the three-second charge. Every player must do this. Missing it applies a severe stun and healing block; a taunt is not a substitute.
- Targets: Supports handle spawning tendrils while DPS and debuffing supports focus the eyes. Agree the split before pulling; do not assign a target solely from a rating.

#### Workbook team (workbook)
Team: Lord of Order / Legion Revenant / Verus DoomKnight / StoneCrusher / ArchFiend / Glaceran Warlord / Arcana Invoker
Status: Conditional · source-documented, gameplay unverified
Preparation: All seven players equip Vigil before entering combat.
- Lord of Order: Coordinate the support/tendril assignment with the group.
- Legion Revenant: Help with the support/tendril assignment agreed by the group.
- Verus DoomKnight: Debuff the eyes while assigned supports handle tendrils.
- StoneCrusher: Coordinate the support/tendril assignment with the group.
- ArchFiend: Confirm whether you are assigned to eyes or tendrils.
- Glaceran Warlord: Confirm whether you are assigned to eyes or tendrils.
- Arcana Invoker: Confirm your DPS target before pulling.
- Source: [Simplified Bosses Guide — Kathool (G4:G28, A32)](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=200910874)
- Source: [Mechanic cross-check](https://aqw.app/monsters/kathooldepths)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### drakath — Strategy — /join championdrakath
- Access: 4-player encounter; level 80+ and The Final Showdown! quest completed. (https://aqwwiki.wikidot.com/champion-drakath-location)
- Goal: Assign a taunter to each HP blast before crossing the threshold.
- Avoid: Do not taunt the transformation or final meteor.
- Source review: Health recommendations depend on buffs and gear; seven eligible blasts only. The alternate lineup needs its own LoO taunt assignment.
- Workbook evidence: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=779020835 (G4:G16, A32)
- Before pulling: The workbook recommends around 3,500 buffed HP for the taunter and 3,000 for other players as safety targets, not universal access requirements. Confirm the selected team's taunt assignment.
- HP blasts: Taunt before 18M, 16M, 14M, 12M, 8M, 6M and 4M HP. Hold burst until the taunter is ready.
- Exceptions: 10M is a transformation. At 2M, finish the meteor damage check within 20 seconds; taunting cannot stop it.

#### Workbook team (workbook)
Team: Lord of Order / Legion Revenant / Paladin Chronomancer / Chrono ShadowHunter
Status: Conditional · source-documented, gameplay unverified
Preparation: Bring enough Scrolls of Enrage for all seven assigned HP blasts; coordinate if splitting them across players.
- Lord of Order: Coordinate recovery with Paladin Chronomancer; taunt blasts only when assigned.
- Legion Revenant: If assigned, take the HP blasts, coordinating any alternating taunts with the healer.
- Paladin Chronomancer: Coordinate heals with Lord of Order; if assigned, take the agreed HP blasts.
- Chrono ShadowHunter: Control burst around the HP thresholds. Save damage for the final meteor.
Condition: The 10M transformation and final 2M meteor are exceptions to the workbook's every-2M wording.
- Source: [Simplified Bosses Guide — Drakath (G4:G16, A32)](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=779020835)
- Source: [HP threshold cross-check](https://aqw.app/monsters/championdrakath)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

#### Accessible DPS · LoO taunts (aqwg)
Team: Void Highlord / StoneCrusher / Lord of Order / ArchPaladin
Status: Conditional · source-documented, gameplay unverified
Preparation: Bring enough Scrolls of Enrage for all seven assigned HP blasts; coordinate if splitting them across players.
- Void Highlord: Deal controlled damage; stop burst before each HP threshold.
- StoneCrusher: Keep support and recovery active.
- Lord of Order: Taunt the seven eligible HP blasts just before their thresholds. Bring at least seven Scrolls of Enrage if handling every blast; verify HP and mitigation.
- ArchPaladin: Maintain mitigation and coordinate heals.
- Source: [Team and threshold exceptions](https://sites.google.com/view/aqwg-net/ultra-bosses)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### dage — Strategy — /join ultradage
- Access: 4-player encounter; level 80+ and Fail to the King quest completed. (https://aqwwiki.wikidot.com/ultra-dage)
- Goal: Use life steal, move to the illuminated zone and suppress regeneration.
- Avoid: Do not use ordinary heals or HoTs during Noxious Decay.
- Source review: LDK coverage is source-backed; VDK needs backup because its Decay lasts only three seconds. Verify each player's actual sustain setup.
- Workbook evidence: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1769924011 (G4:G16, A32)
- Survival: Before pulling, make sure every player has reliable life steal (native life steal, Health Vamp, or a compatible Dauntless setup). Check the Noxious Decay aura before using any ordinary heal.
- Safe zones: On the protection-spells cue, move to the illuminated platform within three seconds; the zone check recurs throughout the fight.
- Regeneration: On the Legion power cue, the assigned Decay player covers the 10-second regeneration cast; coordinate backup coverage where needed. Every player death restores 500,000 HP to Dage.

#### Sustain team · LDK Decay (hub-ldk)
Team: Chaos Avenger / Legion DoomKnight / Lord of Order / ArchPaladin
Status: Conditional · source-documented, gameplay unverified
Preparation: CAv: Scroll of Enrage and a life-steal setup. Other players need sustain that does not depend on ordinary heals during inversion.
- Chaos Avenger: Loop taunt with skill 3 and Scroll of Enrage; avoid ordinary HoT during inversion.
- Legion DoomKnight: Maintain Decay with skill 5 during the boss recovery; use your life steal.
- Lord of Order: Maintain buffs and mitigation; do not cast Ordinance (the ordinary heal) while Noxious Decay is active.
- ArchPaladin: Debuff and mitigate; avoid Hymn of Light (skill 3) during Noxious Decay.
- Source: [AQW Hub — Ultra Dage](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Ultra%20Dage.md)
- Source: [Mechanics and healing](https://sites.google.com/view/aqwg-net/ultra-bosses)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

#### Workbook · VDK Decay (workbook)
Team: Chaos Avenger / ArchFiend / Verus DoomKnight / Chrono ShadowHunter
Status: Conditional · source-documented, gameplay unverified
Preparation: CAv: Scroll of Enrage and a life-steal setup. Other players need sustain that does not depend on ordinary heals during inversion. VDK has a three-second Decay. Agree backup Scroll of Decay coverage before starting; do not rely on a single cast.
- Chaos Avenger: Coordinate loop taunt using skill 3 and Scroll of Enrage. Avoid your ordinary HoT during inversion.
- ArchFiend: Maintain damage and follow the zone calls.
- Verus DoomKnight: Use skill 5 to apply Decay at the Legion power cue; its short duration may require backup Scroll of Decay. Avoid empowered healing during inversion.
- Chrono ShadowHunter: Use damage and reload; avoid Tracer Rounds' HoT while Noxious Decay is active.
Condition: Confirm the Decay backup before pulling; the source does not specify a complete coverage schedule for this roster.
- Source: [Simplified Bosses Guide — Dage (G4:G16, A32)](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1769924011)
- Source: [AQW Hub — Ultra Dage](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Ultra%20Dage.md)
- Source: [VDK skill](https://aqwwiki.wikidot.com/verus-doomknight-class)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### nulgath — Strategy — /join ultranulgath
- Access: 4-player encounter; level 80+. Speak to Nulgath to enter the fight. (https://aqwwiki.wikidot.com/ultra-nulgath)
- Goal: Alternate Contracts taunters and manage the sword.
- Avoid: Abyssal Charge itself ignores taunt; avoid killing the sword unnecessarily.
- Source review: Opening timing differs by source. Frailty and Blade timing need an experienced team; do not merge timing methods.
- Workbook evidence: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1978869027 (G4:G16, A32)
- Contracts: The two assigned taunters alternate to keep Frailty from escalating across the party.
- Timing: The Abyssal Charge line is a synchronization reference for a later Contracts taunt, not an attack that can be redirected. Follow one agreed timing method.
- Sword: Damage dealers focus Nulgath; kill the Blade before its lethal charge if the boss will not die in time. Each Blade kill strengthens Nulgath.

#### Workbook · LR / LoO (workbook)
Team: Lord of Order / Legion Revenant / StoneCrusher / Guardian
Status: Conditional · source-documented, gameplay unverified
Preparation: Both assigned taunters: Scroll of Enrage. Confirm survivability and one timing method before the pull.
- Lord of Order: Alternate Contracts taunts with LR. Use a survivable setup and agree the timing before pulling.
- Legion Revenant: Alternate Contracts taunts with LoO; monitor Frailty and avoid overlap.
- StoneCrusher: Maintain support and follow the sword call.
- Guardian: Focus Nulgath, switch to sword if the lethal charge must be stopped.
Condition: Workbook method: first taunt 1–2 seconds after the party starts attacking, second on the Abyssal Charge quote, first again when the second Focus expires. The quote synchronizes the next Contracts; Abyssal Charge itself ignores Focus. Do not combine with the separate AQWG opening. Check Frailty and LoO survivability.
- Source: [Simplified Bosses Guide — Nulgath (G4:G16, A32)](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1978869027)
- Source: [AQW Hub — Ultra Nulgath](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Ultra%20Nulgath.md)
- Source: [Efficient timing and conditions](https://sites.google.com/view/aqwg-net/ultra-bosses)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

#### AQW Hub · double Dragon of Time (hub-dot)
Team: Dragon of Time / Dragon of Time / Legion Revenant / Lord of Order
Status: Conditional · source-documented, gameplay unverified
Preparation: Both assigned taunters: Scroll of Enrage. Confirm survivability and one timing method before the pull.
- Lord of Order: Alternate Contracts taunts with LR; agree a survivable setup and one timing method.
- Legion Revenant: Alternate Contracts taunts with LoO.
- Dragon of Time: Both DPS slots attack Nulgath. If he will not die before the Blade nuke, agree which DPS switches around 30 seconds; avoid unnecessary Blade kills.
Condition: AQWG efficient timing example: first taunt six seconds after the team starts attacking; second on the Abyssal Charge quote; first again roughly ten seconds later (about five seconds after their last Frailty faded). Monitor Frailty to preserve the sync. Confirm which of LR/LoO opens. This is distinct from the workbook's earlier opening.
- Source: [AQW Hub — Ultra Nulgath](https://github.com/Shell1010/AQW-md/blob/main/Ultra%20Guides/Ultra%20Nulgath.md)
- Source: [Timing](https://sites.google.com/view/aqwg-net/ultra-bosses)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### gramiel — Advanced — /join ultragramiel
- Access: 4-player encounter; level 80+. Access via /ultragramielhub. (https://aqwwiki.wikidot.com/ultra-gramiel)
- Goal: Balance the crystals, then rotate all four taunts.
- Avoid: Do not kill the crystals far apart or cross HP checkpoints without protection.
- Source review: Crystal pair and rotation documented; all four need protection at the checkpoints. Confirm exact order and survival before pulling.
- Workbook evidence: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1904491860 (G4:G16, A32)
- Crystal pairs: Shaman + Lord of Order take one crystal; Legion Revenant + StoneCrusher take the other in this roster. Alternate within each pair at the defense-shattering cue; destroy both crystals within five seconds.
- Break the guard: When Gramiel attempts to drain your power, attack him to break the guard, then return to the crystals. Do not apply Decay to Gramiel during the crystal phase; it increases his damage.
- After crystals: Wait for the explosion, then each player taunts in turn and takes two autos before the next player takes over. Repeat after the beam.
- HP checkpoints: At 70%, 40% and 10% HP, each player needs Vendetta or Death’s Door to gain protection against Celestial Vanquish. Five Vendetta stacks are lethal when Grace Unleashed resolves.

#### Workbook team (workbook)
Team: Lord of Order / Legion Revenant / StoneCrusher / Shaman
Status: Conditional · source-documented, gameplay unverified
Preparation: All four players: Scroll of Enrage and an agreed four-player order. Confirm health and protection before each checkpoint.
- Lord of Order: Pair with Shaman and alternate crystal taunts; follow your assigned Gramiel turn.
- Legion Revenant: Pair with StoneCrusher and alternate crystal taunts. Avoid applying skill 2 Decay to Gramiel during the crystal phase; follow your assigned Gramiel turn.
- StoneCrusher: Pair with Legion Revenant and alternate crystal taunts; maintain recovery and take your assigned Gramiel turn.
- Shaman: Pair with Lord of Order and alternate crystal taunts; balance crystal HP and take your assigned Gramiel turn.
Condition: Confirm the two crystal pairs and the later four-player order before pulling. The source does not prescribe a universal fixed order.
- Source: [Simplified Bosses Guide — Gramiel (G4:G16, A32)](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1904491860)
- Source: [Vendetta and protection thresholds](https://aqw.app/monsters/ultragramiel)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Speaker chart — exact workbook E3:G23, repeat from Zone 1
| # | Event | Role | Skill cue |
|---|---|---|---|
| 1 | Truth | LR | — |
| 2 | Listen | LoO | — |
| 3 | Zone 1 | DPS | — |
| 4 | Truth | AP | AP 4 |
| 5 | Listen | LoO | LoO 5 |
| 6 | Truth | — | — |
| 7 | Zone 2 | LR | — |
| 8 | Listen | — | — |
| 9 | Truth | — | AP 4 |
| 10 | Truth | LoO | — |
| 11 | Listen | — | — |
| 12 | Zone 3 | AP | — |
| 13 | Truth | — | AP 4 |
| 14 | Listen | LR | — |
| 15 | Truth | — | LoO 5 |
| 16 | Zone 4 | LoO | — |
| 17 | Listen | — | — |
| 18 | Truth | — | AP 4 |
| 19 | Truth | LR | — |
| 20 | Listen | LoO | — |

## Other Boss Guides (29)

### Fourth Lynaria — Quick
Access: Hidden source tab; encounter availability and exact current variant remain unverified.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=554509623 (G4:G22, A32)
Named source options: Lord of Order / Legion Revenant / StoneCrusher / Verus DoomKnight
- Expect brief periods of high dodge and occasional magic-class debuffs. Maintain recovery and damage; no elaborate rotation is prescribed.
Condition: Workbook tab is hidden; availability and current encounter variant should be checked.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Void Flibbi — Quick
Access: Check the linked map for level, quest and seasonal requirements; current in-game access is not independently verified.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1827579588 (A32 / A101 / A170 / A239)
Team: Lord of Order / Legion Revenant / Verus DoomKnight / Legendary Hero / ArchFiend / Chrono ShadowHunter / Chrono ShadowHunter
- Avoid Shaman skill 5 (Elemental Embrace); the workbook warns against it. Avoid the corresponding Elemental Grasp effect on variants. Maintain group recovery.
Condition: Source gives a team example and one class-specific restriction, not a full rotation.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Void Nightbane — Quick
Access: Check the linked map for level, quest and seasonal requirements; current in-game access is not independently verified.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1827579588 (A32 / A101 / A170 / A239)
Team: Lord of Order / Legion Revenant / Verus DoomKnight / Legendary Hero / ArchFiend / Chrono ShadowHunter / Chrono ShadowHunter
- Use frequent sustained hits instead of relying on very large nukes.
- Avoid Vainglory because incoming healing is heavily reduced.
- The workbook says Decay does not work. The monster reference distinguishes ordinary healing from other recovery effects; verify the exact Blood Frenzy interaction with your team rather than treating Decay as universally effective.
Condition: Source disagreement remains: do not rely on Decay to stop all healing. Sustained damage and avoiding Vainglory are the shared recommendations.
- Source: [Monster mechanics](https://aqwwiki.wikidot.com/nightbane)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Void Xyfrag — Strategy
Access: Check the linked map for level, quest and seasonal requirements; current in-game access is not independently verified.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1827579588 (A32 / A101 / A170 / A239)
Team: Lord of Order / Legion Revenant / Verus DoomKnight / Legendary Hero / ArchFiend / Chrono ShadowHunter / Chrono ShadowHunter
- Assign a durable taunter for Consume on the belch cue. Finish before the boss becomes invulnerable; favor rapid sustained damage.
- Legion Revenant: Take the assigned Consume taunt.
- Verus DoomKnight: Backup Consume taunter if agreed.
- Source: [Consume mechanics](https://aqw.app/monsters/voidxyfrag)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Void NerfKitten — Strategy
Access: Check the linked map for level, quest and seasonal requirements; current in-game access is not independently verified.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1827579588 (A32 / A101 / A170 / A239)
Team: Lord of Order / Legion Revenant / Verus DoomKnight / Legendary Hero / ArchFiend / Chrono ShadowHunter / Chrono ShadowHunter
- The Meow cue precedes a stat-stealing attack; agree alternating durable taunts to avoid stacking the penalty. Use rapid damage.
- Legion Revenant: Take assigned Meow taunts and coordinate with VDK.
- Verus DoomKnight: Alternate Meow taunts with LR if assigned.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Kasuko & Whirlpool — Quick
Access: Seasonal level 75+ seven-player room; access may vary.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1817901417 (G4:G28, A32)
Team: Lord of Order / Legion Revenant / Verus DoomKnight / StoneCrusher / ArchFiend / Chrono ShadowHunter / Chrono ShadowHunter
- Recover immediately after the large current-HP hits. If multi-target damage is fast, focus Kasuko; otherwise clear Whirlpool first. Maintain healing.
Condition: Workbook describes target priority as conditional, not mandatory.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Temple Shrine — Left — Strategy
Access: /join templeshrine is the Eclipse Ascent hub (20 players); the selected dungeon has a four-player party limit. Choose the Solstice Moon entrance.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=536042830 (A32 / A92 / A152)
Team: Lord of Order / Legion Revenant / StoneCrusher / Chrono ShadowHunter
- This specific strategy relies on LR having Praxis and the assigned taunters having Scroll of Enrage; do not apply the Praxis timing to a different enhancement.
- Coordinate Lunar Haze and the Moon Converges cast.
- Lord of Order: Taunt Lunar Haze when You Gaze into the Moon disappears.
- Legion Revenant: Use Praxis and taunt at The Moon Converges according to the source plan.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Temple Shrine — Right — Strategy
Access: /join templeshrine is the Eclipse Ascent hub (20 players); the selected dungeon has a four-player party limit. Choose the Midnight Sun entrance.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=536042830 (A32 / A92 / A152)
Team: Lord of Order / Legion Revenant / Verus DoomKnight / Chrono ShadowHunter
- This specific strategy relies on LR having Praxis and the assigned taunters having Scroll of Enrage; do not apply the Praxis timing to a different enhancement.
- Coordinate Dawn Knight and the Sun Converges cast.
- Legion Revenant: Taunt Dawn Knight when You feel the Warmth of the Sun disappears; use Praxis with taunt at The Sun Converges.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Temple Shrine — Middle — Advanced
Access: /join templeshrine is the Eclipse Ascent hub (20 players); the selected dungeon has a four-player party limit. The middle challenge requires Rite of Ascension in inventory; enter via the portal.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=536042830 (A32 / A92 / A152)
Team: Lord of Order / Legion Revenant / ArchPaladin / Chrono ShadowHunter
- This specific strategy relies on LR having Praxis and the assigned taunters having Scroll of Enrage; do not apply the Praxis timing to a different enhancement.
- Agree each knight assignment and the alternating solar/lunar taunt plan. Follow the same source roster and do not improvise.
- ArchPaladin: Taunt Dying Light at The Sunlight Gathers and use skill 4; alternate Moon Converges with LoO.
- Lord of Order: Taunt Lunar Haze after the gaze message disappears; alternate Moon Converges with AP.
- Legion Revenant: Taunt Dawn Knight after the warmth message disappears. Use Praxis for Sun Converges; alternate its taunts with DPS.
- Chrono ShadowHunter: Alternate Sun Converges taunts with LR; coordinate LR's Praxis timing.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Astral Empyrean — Strategy
Access: Level 95+, seven-player room; complete Hoshiyoru to reach the encounter.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1682548440 (G4:G28, A32)
Team: Lord of Order / Legion Revenant / Verus DoomKnight / StoneCrusher / ArchFiend / Glaceran Warlord / Phantom Chronomancer
- Stay outside the red zone and avoid deaths that empower the boss.
- Stardust Breath ignores taunt; keep the party healthy for it. Alternate assigned taunts after the breath lands to control the subsequent Astral Beam attacks.
- Avoid Vainglory during reduced incoming healing.
- Legion Revenant: Alternate assigned post-breath taunts with VDK.
- Verus DoomKnight: Alternate assigned post-breath taunts with LR.
Condition: Workbook taunt wording is clarified using the monster reference; no gear presets shown.
- Source: [Breath and beam mechanics](https://aqw.app/monsters/astralshrine)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Mechabinky & Raxborg 2.0 — Advanced
Access: Check the linked map for level, quest and seasonal requirements; current in-game access is not independently verified.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1217830111 (G4:G28, A32)
Team: Lord of Order / Legion Revenant / Verus DoomKnight / Legendary Hero / ArchPaladin / Glaceran Warlord / Phantom Chronomancer
- Assign two taunters; other players equip Vigil in the workbook strategy.
- 45M: assigned taunt and stop healing during inversion. 40M and 35M: alternate assigned taunts. 30M: recover from the HP drop. 25M and 20M: expect rising damage and dodge.
- 15M: coordinate Decay and mitigation. 10M: use Vigil on the cue. 5M: finish the damage check.
- ArchPaladin: Time skill 4 before the 15M damage event.
Condition: Confirm exact taunt assignments and Vigil exceptions with the team; no exploit or precise undocumented timer recommended.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Celestial Arena — Quick
Access: Solo quest sequence. Accept the relevant quest and use the appropriate arena entrance; check the linked location for access.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=485533888 (I5:K23)
Named source options: Master Ranger / StoneCrusher / Legion DoomKnight / Rogue / Dragonslayer / Sentinel / Legendary Hero / Chrono ShadowHunter / Phantom Chronomancer / Elemental Warrior / Dragonslayer General / ArchFiend
- Solo sequence. Pick a sustain class and use Awe enhancements; accept the appropriate quest before fighting.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Infernal Arena — early bosses — Quick
Access: Solo quest sequence. Accept the relevant quest and use the appropriate arena entrance; check the linked location for access.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=282052295 (K5:M163, N4:N144)
Named source options: Master Ranger / StoneCrusher / Legion DoomKnight / Rogue / Dragonslayer / Sentinel / Legendary Hero / Chrono ShadowHunter / Phantom Chronomancer / Elemental Warrior
- For level 20–70 opponents, survival is the key. Awe enhancements and a damage-boosting weapon are the source's suggested preparation.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Deadly Duo — Strategy
Access: Solo quest sequence. Accept the relevant quest and use the appropriate arena entrance; check the linked location for access.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=282052295 (K5:M163, N4:N144)
Named source options: Master Ranger / StoneCrusher / Legion DoomKnight / Dragonslayer / Dragonslayer General / ArchPaladin / Sentinel / Legendary Hero / Chrono ShadowHunter / Phantom Chronomancer / Elemental Warrior
- Enter the charge at full health, recover after the nuke, and use Scroll of Decay to prevent the boss's recovery. Sustain consumables can help.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Cervus Malus — Strategy
Access: Solo quest sequence. Accept the relevant quest and use the appropriate arena entrance; check the linked location for access.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=282052295 (K5:M163, N4:N144)
Named source options: Master Ranger / ArchPaladin / Legion DoomKnight / Dragonslayer General / Sentinel / Legendary Hero / Elemental Warrior
- Be healthy before the 60% hit. Healing is inverted immediately afterward; wait until that effect expires before recovering.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Key of Sholemoh — Quick
Access: Solo quest sequence. Accept the relevant quest and use the appropriate arena entrance; check the linked location for access.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=282052295 (K5:M163, N4:N144)
Named source options: Master Ranger / ArchPaladin / Legion DoomKnight / Dragonslayer General / StoneCrusher / Dragonslayer / Sentinel / Legendary Hero / Elemental Warrior / Chrono ShadowHunter / Phantom Chronomancer
- The boss deals fixed damage that cannot be reduced. Prioritize enough HP and reliable recovery to remain healthy before the charge.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Azalith's Scythe — Strategy
Access: Solo quest sequence. Accept the relevant quest and use the appropriate arena entrance; check the linked location for access.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=282052295 (K5:M163, N4:N144)
Named source options: Lord of Order / Void Highlord / Dragon of Time / Lich / ArchPaladin / Sentinel / Elemental Warrior / Dragon Knight / Shaman
- Keep HP high before nukes and recover after them. Use reliable-hit skills against the high dodge. Scroll of Chaos Fog is a member-only option.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Na'al — Strategy
Access: Solo quest sequence. Accept the relevant quest and use the appropriate arena entrance; check the linked location for access.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=282052295 (K5:M163, N4:N144)
Named source options: Lord of Order / Void Highlord / King's Echo / Legion DoomKnight / ArchPaladin / Sentinel / Chrono ShadowHunter / Phantom Chronomancer / Dragon Knight / Legion Revenant / Hollowborn Vindicator / Infinity Knight
- Use damage debuffs when Vidi appears, then heal after the hit. Barrier potions and Revitalize Elixir help with survival; Forge is optional.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Grimskull? — Strategy
Access: Level 80+; /join gaolcell is the entrance hub. Enter the solo Gaol dungeon via its portal; check Mort's quests. This is not a team encounter.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1924778701 (I5:K303, L4:L284)
Named source options: Lich / King's Echo / Dragon of Time / Chaos Avenger / Hollowborn Vindicator / Void Highlord / Sentinel / Chrono ShadowHunter / Phantom Chronomancer / Dragon Knight / Elemental Warrior / Legendary Hero / Verus DoomKnight / Infinity Knight
- Stop dealing damage when the punching-bag warning appears for seven seconds, unless the kill is guaranteed within that interval.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Grim Bomb — Quick
Access: Level 80+; /join gaolcell is the entrance hub. Enter the solo Gaol dungeon via its portal; check Mort's quests. This is not a team encounter.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1924778701 (I5:K303, L4:L284)
Named source options: Dragon of Time / Chaos Avenger / King's Echo / Hollowborn Vindicator / Void Highlord / Lich / Sentinel / Chrono ShadowHunter / Phantom Chronomancer / Dragon Knight / Elemental Warrior / Legendary Hero / Verus DoomKnight / Infinity Knight
- Clear the three bombs before the one-minute limit. The workbook lists class options rather than an individual rotation.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Empress Angler — Quick
Access: Level 80+; /join gaolcell is the entrance hub. Enter the solo Gaol dungeon via its portal; check Mort's quests. This is not a team encounter.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1924778701 (I5:K303, L4:L284)
Named source options: Dragon of Time / Chaos Avenger / King's Echo / Hollowborn Vindicator / Void Highlord / Lich / Sentinel / Chrono ShadowHunter / Phantom Chronomancer / Dragon Knight / Elemental Warrior / Legendary Hero / Verus DoomKnight / Infinity Knight
- Restore maximum HP at the Heal up cue. Constant recovery such as Health Vamp helps.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Treasure Chest — first — Quick
Access: Level 80+; /join gaolcell is the entrance hub. Enter the solo Gaol dungeon via its portal; check Mort's quests. This is not a team encounter.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1924778701 (I5:K303, L4:L284)
Named source options: Dragon of Time / Chaos Avenger / King's Echo / Hollowborn Vindicator / Void Highlord / Lich / Sentinel / Chrono ShadowHunter / Phantom Chronomancer / Dragon Knight / Elemental Warrior / Legendary Hero / Verus DoomKnight / Infinity Knight
- Defeat the first chest and continue; the source lists class options but no special rotation.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Reinforced Shelleton — Strategy
Access: Level 80+; /join gaolcell is the entrance hub. Enter the solo Gaol dungeon via its portal; check Mort's quests. This is not a team encounter.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1924778701 (I5:K303, L4:L284)
Named source options: Dragon of Time / ArchMage / Blaze Binder / Dragon Knight / Infinity Knight
- Survive until the turtle crashes and becomes vulnerable; attack in that window, not while it is protected. High resistance or strong healing helps; Revitalize Elixir is a source option.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Fell Statue — Strategy
Access: Level 80+; /join gaolcell is the entrance hub. Enter the solo Gaol dungeon via its portal; check Mort's quests. This is not a team encounter.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1924778701 (I5:K303, L4:L284)
Named source options: StoneCrusher / Dragon of Time / Hollowborn Vindicator / Verus DoomKnight / Void Highlord / ArchMage / Dragon Knight / Infinity Knight / Phantom Chronomancer / Chrono ShadowHunter
- Change targets after dealing roughly 5,000 damage to a statue. Pause or switch if the incoming damage becomes unsafe.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Emperor Angler — Strategy
Access: Level 80+; /join gaolcell is the entrance hub. Enter the solo Gaol dungeon via its portal; check Mort's quests. This is not a team encounter.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1924778701 (I5:K303, L4:L284)
Named source options: Dragon of Time / Chaos Avenger / King's Echo / Hollowborn Vindicator / Void Highlord / Sentinel / Chrono ShadowHunter / Phantom Chronomancer / Dragon Knight / Elemental Warrior / Legendary Hero / Verus DoomKnight / Infinity Knight
- Restore HP promptly at Heal up. Feeding Frenzy punishes staying below half HP; keep recovery available and account for the separate healing reduction.
- Source: [Monster mechanics](https://aqwwiki.wikidot.com/emperor-angler)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Treasure Chest — second — Quick
Access: Level 80+; /join gaolcell is the entrance hub. Enter the solo Gaol dungeon via its portal; check Mort's quests. This is not a team encounter.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1924778701 (I5:K303, L4:L284)
Named source options: Dragon of Time / Chaos Avenger / King's Echo / Hollowborn Vindicator / Void Highlord / Lich / Sentinel / Chrono ShadowHunter / Phantom Chronomancer / Dragon Knight / Elemental Warrior / Legendary Hero / Verus DoomKnight / Infinity Knight
- The second chest deals periodic large HP-based damage and stuns; maintain health and recovery rather than assuming the first chest's behavior.
Condition: Supplemental mechanics cross-check from the monster reference; no class-specific rotation is established.
- Source: [Dungeon reference](https://aqwwiki.wikidot.com/the-gaol-of-eternal-torment-and-misery)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Rick, Grim Soldier — Quick
Access: Level 80+; /join gaolcell is the entrance hub. Enter the solo Gaol dungeon via its portal; check Mort's quests. This is not a team encounter.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1924778701 (I5:K303, L4:L284)
Named source options: Dragon of Time / Chaos Avenger / King's Echo / Hollowborn Vindicator / Void Highlord / Lich / Sentinel / Chrono ShadowHunter / Phantom Chronomancer / Dragon Knight / Elemental Warrior / Legendary Hero / Verus DoomKnight / Infinity Knight
- Maintain damage and sustain through the boss's recovery and buff cycles. The workbook provides class recommendations and no special rotation.
- Source: [Monster mechanics](https://aqwwiki.wikidot.com/rick-grim-soldier)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Rampaging Cyborg — Strategy
Access: Level 80+; /join gaolcell is the entrance hub. Enter the solo Gaol dungeon via its portal; check Mort's quests. This is not a team encounter.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1924778701 (I5:K303, L4:L284)
Named source options: Dragon of Time / Hollowborn Vindicator / Verus DoomKnight / Void Highlord / ArchMage / Sentinel / Chrono ShadowHunter / Phantom Chronomancer / Dragon Knight / Infinity Knight
- Kill all summons before focusing the invulnerable Cyborg. Use enough damage and sustain for the rising pressure.
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

### Mechabinky & Raxborg — Strategy
Access: Level 80+; /join gaolcell is the entrance hub. Enter the solo Gaol dungeon via its portal; check Mort's quests. This is not a team encounter.
Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit#gid=1924778701 (I5:K303, L4:L284)
Named source options: Dragon of Time / Hollowborn Vindicator / Verus DoomKnight / Void Highlord / Lich / King's Echo / Sentinel / Chrono ShadowHunter / Phantom Chronomancer / Dragon Knight / Infinity Knight / Chaos Avenger / Elemental Warrior
- At 90% HP, wait for healing inversion to expire before using heals or HoTs. The source warns that subsequent effects can vary; do not assume this is the same fight as Grim Challenge 2.0.
- Source: [Monster mechanics](https://aqwwiki.wikidot.com/mechabinky-raxborg-2-0)
Reviewer verdict: [ ] correct [ ] conditional [ ] correction needed [ ] playtested; notes: __________

## Legacy / seasonal catalog entries (11; no strategy)
| Name | Join | Status |
|---|---|---|
| Ultra Alteon | /join ultraalteon | Location reference; live access not tested |
| Ultra Brutalcorn | /join ultrabrutalcorn | Map reference; rare content note needs live check |
| Ultra Carnax | /join ultracarnax | Access not independently verified |
| Ultra Chairman | /join ultrachairman | Rare map; access not tested |
| Ultra Dreadfight | /join ultradread | 4-player limit in 17 Oct 2025 patch; access unverified |
| Ultra Franken | /join ultrafranken | Seasonal Legend; 6 players |
| Ultra Frostfang | /join ultrafrostfang | Seasonal; map reference |
| Ultra Iara | /join ultraiara | 61+, The Test of Will; seasonal |
| Ultra Kala | /join ultrakala | 61+, Kala-mity Time; seasonal |
| Ultra Phedra | /join ultraphedra | Map/access unresolved; catalog only |
| Ultra Lionfang | /join ultralionfang | Legend; 6 players |

## Class Builds (hidden, 16)
| Class | Activity | Base | Weapon | Helm | Cape | Original source |
|---|---|---|---|---|---|---|
| Arcana Invoker | farm | Lucky | Valiance | Forge | Vainglory | [K57:K74 · Farming](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=131086391) |
| Legion Revenant | farm | Lucky | Valiance | Pneuma | Lament | [I2:I23 · Farming](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=1736750363) |
| Shaman | solo | Lucky | Ravenous | Examen | Vainglory | [M2:M23 · Best Solo](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=959414055) |
| Verus DoomKnight | solo | Lucky | Dauntless | Anima | Lament | [K2:K23 · Solo DPS](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=2003346436) |
| Void Highlord | farm | Lucky | Dauntless | Forge | Lament | [N57:N74 · Low HP Farm](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=635766736) |
| Chaos Avenger | solo | Lucky | Valiance | Forge | Penitence | [K57:K74 · Defensive Solo](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=767000667) |
| ArchMage | farm | Wizard | Elysium | Pneuma | Vainglory | [H57:H74 · High HP Mobs](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=127988848) |
| Blaze Binder | farm | Wizard | Elysium | Pneuma | Vainglory | [K57:K74 · Full Forge (farming class)](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=1663164517) |
| Yami no Ronin | solo | Lucky | Valiance | Vim | Vainglory | [K2:K23 · Solo DPS](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=780573242) |
| King's Echo | solo | Lucky | Ravenous | Examen | Vainglory | [K2:K23 · Solo / Group](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=1518536070) |
| Chrono ShadowHunter | solo | Lucky | Valiance | Examen | Vainglory | [N57:N74 · Solo Full Forge](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=1197397455) |
| Phantasm Chronomancer | solo | Lucky | Ravenous | Examen | Vainglory | [M2:M23 · Best Solo](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=1393874757) |
| Hollowborn Vindicator | solo | Lucky | Dauntless | Forge | Penitence | [K2:K23 · Solo DPS](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=1518180684) |
| Necrotic Chronomancer | farm | Lucky | Ravenous | Forge | Vainglory | [K2:K23 · High DPS Farming](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=217725654) |
| ArchFiend | farm | Lucky | Dauntless | Forge | Vainglory | [K57:K74 · Farming / Dage](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=51480788) |
| Dark Lord | solo | Wizard | Elysium | Pneuma | Lament | [Q57:Q74 · Full Pots Solo](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=804225218) |

Legion Revenant's source cape cell lists Lament or Vainglory with potions. We selected Lament. Dark Lord solo explicitly assumes full pots. Arcana Invoker and several other classes differ from Bootiest's 2025 templates; no hybrid configurations or claims of universal optimality.

## Release blockers
- Obtain expert gameplay review of high-risk encounters; resolve Darkon phase timing, Nulgath opening and VDK Dage backup. Verify current patch and in-game access for unresolved catalog maps. Verify any source links that returned cache or redirect errors.
- Finish CI on the latest authored revision, inspect generated-only commit, verify ZIP/checksum and version. Explicit owner approval required. No merge in this audit.
