# AQW Companion — consolidated endgame expert review

> **Review candidate, not a release or certification.** This file freezes the combat information in the candidate site at the source commit below. It is intended for one coordinated review. No account information, inventory data or personal records are included.

**Candidate:** 0.13.1 · PR #215  
**Combat source snapshot:** [`8f1e7c0`](https://github.com/CptMundo/AQW-Companion/commit/8f1e7c05b98496674583af76bc83a3d611b55815)  
**Prepared:** 27 November 2026  
**Status:** documentary review; gameplay and expert acceptance not yet completed. No merge authorized.

## How to review once, together

Each numbered entry is a single review unit. Please return one consolidated set of corrections using its ID. Mark correct entries PASS; mark errors CORRECT, state the replacement text/gear/rotation, and link evidence or identify patch and test conditions. Mark unsupported recommendations WITHHOLD rather than guessing. Prioritize lethal mechanics, wrong taunts, healing inversion, role-dependent rotations and contradictory equipment. Only flag missing coverage if important to the existing guide scope.

| ID | Decision (PASS / CORRECT / WITHHOLD / ADD) | Exact replacement | Patch, evidence or test conditions |
| --- | --- | --- | --- |
| e.g. U02 | CORRECT | Correct taunt threshold, role or cue | Boss page / video / recorded run |

**One-round review:** each reviewer can specialize in a section; the coordinator combines feedback in one submission. There is no need to review earlier PR iterations. The guide examples are not a tier list, and the presence of a class in a selector is not a claim it is a good replacement in any team.

## Contents

- [1. Class builds and consumables](#1-class-builds-and-consumables)
- [2. All modern Ultra guides](#2-all-modern-ultra-guides)
- [3. All other boss guides](#3-all-other-boss-guides)
- [4. Catalog-only encounters](#4-catalog-only-encounters)
- [5. Ultra Speaker timing charts](#5-ultra-speaker-timing-charts)
- [6. Forge and Awe](#6-forge-and-awe)
- [7. Consumable effects](#7-consumable-effects)
- [8. Combat tooltips](#8-combat-tooltips)
- [9. Specific decisions requiring expert confirmation](#9-specific-decisions-requiring-expert-confirmation)

## Source references

- [All Classes Forge Enhancements (Bootiest; 2025 templates)](https://docs.google.com/spreadsheets/d/1wupDvLuPnRC0fF0aNPc7rzrri7X1YcYy7S2s5Z6o_F4/edit)
- [Simplified Classes Guide](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit)
- [Simplified Bosses Guide](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)
- [Official enhancement traits](https://www.aq.com/lore/guides/enhancementtraits)
- [Official balance patch notes](https://www.aq.com/gamedesignnotes/aqw-classbalance-patchnotes-8927)
- [Combat audit history](COMBAT_INFORMATION_AUDIT.md)

The entries below are extracted from the proposed Companion code, not invented replacements for source materials. Original sources are evidence for examples, not proof of current-patch optimality. The guide does not cover every class or monster in AQWorlds; this document covers the complete existing Companion combat catalog.

## 1. Class builds and consumables

All 24 canonical class entries are included below, plus three aliases. **Only rows marked DISPLAYED are offered as current community examples.** Other raw candidate tuples are included for expert disposition, not recommended. General DPS columns are not solo benchmarks. Class/armor base is separate from fixed Forge weapon, helm and cape patterns.

### C01 — Arcana Invoker

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=131086391)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | WITHHELD — disputed | Class default (not source-specific) | Valiance | Forge | Vainglory | No matching activity evidence | None confirmed |
| farm | DISPLAYED — source example | Lucky | Valiance | Forge | Vainglory | Farming | None confirmed |
| group | WITHHELD — disputed | Class default (not source-specific) | Valiance | Forge | Penitence | No matching activity evidence | None confirmed |

**farm — alternative:** 2025 template uses Wizard/Pneuma; do not mix. Check 2026 damage-type changes.

**Review-only source candidates:** Lucky · Ravenous · Examen · Vainglory (full DPS); Lucky · Mana Vamp · Forge · Penitence (Ultra Gramiel column). Confirm current damage types, mechanics and assigned role after patches.

### C02 — ArchFiend

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=51480788) · [secondary reference](https://solarisaqw.lol/guides/classes/archfiend)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | WITHHELD — no matching source configuration | Class default (not source-specific) | Dauntless | Forge | Vainglory | No matching activity evidence | None confirmed |
| farm | DISPLAYED — source example | Lucky | Dauntless | Forge | Vainglory | Farming / Dage | Fate Tonic / Battle Elixir / Felicitous Philtre |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Ravenous | Forge | Penitence | No matching activity evidence | None confirmed |

**farm — alternative:** Bootiest uses Anima instead; compare HP loss.

### C03 — ArchMage

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=127988848)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | WITHHELD — no matching source configuration | Class default (not source-specific) | Elysium | Pneuma | Vainglory | No matching activity evidence | None confirmed |
| farm | DISPLAYED — source example | Wizard | Elysium | Pneuma | Vainglory | High HP Mobs | Sage Tonic / Destruction Elixir / Felicitous Philtre |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Forge | Penitence | No matching activity evidence | None confirmed |

**farm — alternative:** Low HP Mobs: Wizard / Valiance / Pneuma / Vainglory. Match Astral/Corporeal rotation.

### C04 — ArchPaladin

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=2032789316)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | WITHHELD — no matching source configuration | Class default (not source-specific) | Valiance | Forge | Vainglory | No matching activity evidence | None confirmed |
| farm | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Forge | Vainglory | No matching activity evidence | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Awe Blast | Forge | Penitence | No matching activity evidence | None confirmed |

### C05 — Blaze Binder

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=1663164517)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Pneuma | Vainglory | No matching activity evidence | None confirmed |
| farm | DISPLAYED — source example | Wizard | Elysium | Pneuma | Vainglory | Full Forge | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Awe Blast | Forge | Penitence | No matching activity evidence | None confirmed |

**farm — alternative:** Early Forge: Wizard / Awe Blast / Pneuma / Wizard.

### C06 — Chaos Avenger

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=767000667)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | DISPLAYED — source example | Lucky | Valiance | Forge | Penitence | Defensive Solo | Might Tonic / Divine Elixir / Potent Honor Potion |
| farm | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Anima | Vainglory | No matching activity evidence | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Forge | Penitence | No matching activity evidence | None confirmed |

**solo — alternative:** Solo Forge: Lucky / Valiance / Anima / Avarice; lower defense.

### C07 — Chrono ShadowHunter
Skill-equivalent aliases: Chrono ShadowSlayer
Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=1197397455) · [secondary reference](https://www.aqwhub.com/other-guides/choosing-a-chronomancer/)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | DISPLAYED — source example | Lucky | Valiance | Examen | Vainglory | Solo Full Forge | Fate Tonic / Battle Elixir / Felicitous Philtre |
| farm | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Vim | Lament | No matching activity evidence | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Arcana's Concerto | Forge | Penitence | No matching activity evidence | None confirmed |

**solo — alternative:** No Valiance: Lucky / Awe Blast / Examen / Vainglory.

### C08 — Dark Lord

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=804225218) · [secondary reference](https://solarisaqw.lol/guides/classes/dark-lord)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | DISPLAYED — source example | Wizard | Elysium | Pneuma | Lament | Full Pots Solo | None confirmed |
| farm | DISPLAYED — source example | Wizard | Elysium | Pneuma | Avarice | Full Forge | None confirmed |

**solo — alternative:** Source assumes consumables; do not infer an unpotted benchmark.

**farm — alternative:** Bootiest uses Vainglory or Penitence; separate templates.

### C09 — Dragon of Time

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=39728149)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | DISPLAYED — source example | Wizard | Elysium | Pneuma | Vainglory | Full DPS (general; not a dedicated solo test) | None confirmed |
| farm | WITHHELD — no matching source configuration | Class default (not source-specific) | Elysium | Pneuma | Vainglory | No matching activity evidence | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Forge | Penitence | No matching activity evidence | None confirmed |

**solo — alternative:** Budget: Wizard / Valiance / Pneuma / Vainglory. Nightmare Carnax uses Hearty instead.

### C10 — Great Thief

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=2056232859) · [secondary reference](https://www.reddit.com/r/AQW/comments/1tmz6d8/some_info_on_every_major_meta_dps_forgive_me_for/)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | WITHHELD — disputed | Class default (not source-specific) | Ravenous | Vim | Vainglory | No matching activity evidence | None confirmed |
| group | WITHHELD — disputed | Class default (not source-specific) | Ravenous | Forge | Penitence | No matching activity evidence | None confirmed |

**Review-only source candidates** (Simplified Best Solo / Ultra DPS / Group DPS): Lucky · Dauntless · Examen · Vainglory (solo); Lucky · Praxis · Forge · Vainglory (Ultra); Lucky · Arcana Concerto · Forge · Vainglory (group). Confirm exact contexts and rotations before re-enabling.

### C11 — Guardian

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=929691226) · [secondary reference](https://vanaheim.app/guides/guardian-127033)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | DISPLAYED — source example | Lucky | Ravenous | Vim | Lament | Full DPS (general; not a dedicated solo test) | Fate Tonic / Battle Elixir / Felicitous Philtre |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Ravenous | Vim | Penitence | No matching activity evidence | None confirmed |

**solo — alternative:** Early DPS: Lucky / Spiral Carve / Vim / Lament.

### C12 — Hollowborn Vindicator

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=1518180684) · [secondary reference](https://www.reddit.com/r/AQW/comments/1ttv3uq/hollowborn_vindicator/)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | DISPLAYED — source example | Lucky | Dauntless | Forge | Penitence | Solo DPS | Fate Tonic / Battle Elixir / Felicitous Philtre |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Praxis | Forge | Vainglory | No matching activity evidence | None confirmed |

**solo — alternative:** Tank: Lucky / Ravenous / Forge / Penitence.

### C13 — Kathool Adept

Source: [current class reference](https://aqwwiki.wikidot.com/kathool-adept) · [secondary reference](https://www.reddit.com/r/AQW/comments/1xe1zgv/kathool_adept_is_the_best_farming_class_in_the/)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | WITHHELD — no matching source configuration | Class default (not source-specific) | Elysium | Pneuma | Vainglory | No matching activity evidence | None confirmed |
| farm | DISPLAYED — source example | Wizard | Valiance | Pneuma | Lament | October 2026 community farming example | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Forge | Penitence | No matching activity evidence | None confirmed |

**farm — alternative:** Other combinations require testing.

### C14 — King's Echo

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=1518536070)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | DISPLAYED — source example | Lucky | Ravenous | Examen | Vainglory | Solo / Group | Fate Tonic / Battle Elixir / Felicitous Philtre |
| farm | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Forge | Vainglory | No matching activity evidence | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Praxis | Forge | Penitence | No matching activity evidence | None confirmed |

**solo — alternative:** Mid: Lucky / Valiance / Examen / Lament.

### C15 — Legion Revenant

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=1736750363)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | WITHHELD — no matching source configuration | Class default (not source-specific) | Valiance | Pneuma | Vainglory | No matching activity evidence | None confirmed |
| farm | DISPLAYED — source example | Lucky | Valiance | Pneuma | Lament | Farming | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Arcana's Concerto | Forge | Penitence | No matching activity evidence | None confirmed |

**farm — alternative:** Vainglory with potions; Acheron / Pneuma / Penitence is a separate high-risk example.

### C16 — LightCaster

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=574016196)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | DISPLAYED — source example | Lucky | Praxis | Forge | Lament | Budget DPS (general; not a dedicated solo test) | Fate Tonic / Battle Elixir / Felicitous Philtre |
| farm | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Pneuma | Vainglory | No matching activity evidence | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Awe Blast | Forge | Absolution | No matching activity evidence | None confirmed |

**solo — alternative:** Ultra DPS: Lucky / Ravenous / Forge / Lament; use encounter guidance.

### C17 — Lord of Order

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=0)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | WITHHELD — no matching source configuration | Class default (not source-specific) | Valiance | Forge | Vainglory | No matching activity evidence | None confirmed |
| farm | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Forge | Vainglory | No matching activity evidence | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Awe Blast | Forge | Absolution | No matching activity evidence | None confirmed |

### C18 — Necrotic Chronomancer
Skill-equivalent aliases: Nechronomancer
Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=217725654) · [secondary reference](https://www.youtube.com/watch?v=VH7C3yiOh2g)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | WITHHELD — no matching source configuration | Class default (not source-specific) | Dauntless | Forge | Lament | No matching activity evidence | None confirmed |
| farm | DISPLAYED — source example | Lucky | Ravenous | Forge | Vainglory | High DPS Farming | Fate Tonic / Battle Elixir / Felicitous Philtre |

**farm — alternative:** HP Sustain Farming: Lucky / Dauntless / Vim / Vainglory.

### C19 — Phantasm Chronomancer
Skill-equivalent aliases: Phantom Chronomancer
Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=1393874757) · [secondary reference](https://www.reddit.com/r/AQW/comments/1nrkvts)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | DISPLAYED — source example | Lucky | Ravenous | Examen | Vainglory | Best Solo | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Ravenous | Examen | Penitence | No matching activity evidence | None confirmed |

**solo — alternative:** Best DPS: Lucky / Ravenous / Forge / Vainglory; separate example.

### C20 — Shaman

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=959414055)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | DISPLAYED — source example | Lucky | Ravenous | Examen | Vainglory | Best Solo | None confirmed |
| farm | WITHHELD — no matching source configuration | Class default (not source-specific) | Elysium | Pneuma | Vainglory | No matching activity evidence | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Forge | Penitence | No matching activity evidence | None confirmed |

**solo — alternative:** Budget: Lucky / Ravenous / Examen / Avarice. Avoid Elemental Embrace/Grasp on Flibbi.

### C21 — StoneCrusher

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=321365871)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | WITHHELD — no matching source configuration | Class default (not source-specific) | Valiance | Forge | Absolution | No matching activity evidence | None confirmed |
| farm | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Pneuma | Vainglory | No matching activity evidence | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Arcana's Concerto | Forge | Absolution | No matching activity evidence | None confirmed |

### C22 — Verus DoomKnight

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=2003346436)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | DISPLAYED — source example | Lucky | Dauntless | Anima | Lament | Solo DPS | Fate Tonic / Battle Elixir / Felicitous Philtre |
| farm | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Anima | Vainglory | No matching activity evidence | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Forge | Penitence | No matching activity evidence | None confirmed |

**solo — alternative:** Budget: Lucky / Valiance / Forge / Vainglory.

### C23 — Void Highlord

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=635766736)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | DISPLAYED — source example | Lucky | Dauntless | Anima | Lament | May 2026 benchmark | None confirmed |
| farm | DISPLAYED — source example | Lucky | Dauntless | Forge | Lament | Low HP Farm | Fate Tonic / Battle Elixir / Felicitous Philtre |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Forge | Penitence | No matching activity evidence | None confirmed |

**solo — alternative:** Vainglory is a separate alternative; compare sustain.

**farm — alternative:** High HP Farm: Lucky / Ravenous / Vim / Vainglory.

### C24 — Yami no Ronin

Source: [class worksheet](https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit#gid=780573242)

| Activity | Status | Armor/base | Weapon | Helm | Cape | Source context | Consumables |
| --- | --- | --- | --- | --- | --- | --- | --- |
| solo | DISPLAYED — source example | Lucky | Valiance | Vim | Vainglory | Solo DPS | Fate Tonic / Battle Elixir / Potent Honor Potion |
| farm | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Vim | Vainglory | No matching activity evidence | None confirmed |
| group | NOT DISPLAYED — activity unavailable | Class default (not source-specific) | Valiance | Forge | Penitence | No matching activity evidence | None confirmed |

**solo — alternative:** Dauntless / Anima is the separate Ultra DPS column.

## 2. All modern Ultra guides

For each encounter: the displayed strategy roster, separate documented gear roster, current fight-at-a-glance text, complete deduplicated role guidance, and the exact source gear or withheld state. If the rosters differ they are separate variants, not interchangeable. A class selector can have no reviewed loadout. The underlying rating system was used to identify options; the scores are not displayed or treated as rankings.

### U01 — God of the Depths (Kathool)

**Join:** `/join kathooldepths` · **Frequency:** Daily · **Difficulty:** Expert · 7 players

**Displayed strategy roster:** StoneCrusher · Lord of Order · Legion Revenant · Verus DoomKnight · ArchFiend · Arachnomancer · Legendary Hero

**Separate source gear roster:** Lord of Order · Legion Revenant · Verus DoomKnight · StoneCrusher · ArchFiend · Glaceran Warlord · Arcana Invoker

**Goal:** ALL 7 players use Vigil at “You cannot resist.” (3-second charge). Control the two Sacrosanct Tendrils and keep party mana stable.

**Avoid:** Never rely on taunts to block Endless Nightmare. Missing Vigil causes a 60-second stun/heal-block/DoT effect; tendrils become especially dangerous at low HP.

**Rewards:** Daily Exercise 5: 250 Legion Tokens + 1 Soul Sand; Frenzy Feast: 1 Adeptus Relic

Sources: [Kathool](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Loadouts in the source roster (all positions, including withheld):**

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Arcana Concerto | Pneuma | Lament | — | Source example |
| Verus DoomKnight | Lucky | Ravenous | Base Forge | Vainglory | — | Source example |
| StoneCrusher | Fighter | Lacerate | Anima | Absolution | — | Source example |
| ArchFiend | Lucky | Ravenous | Base Forge | Vainglory | — | Source example |
| Glaceran Warlord | Lucky | Dauntless | Anima | Vainglory | — | Source example |
| Arcana Invoker | Lucky | Ravenous | Examen | Vainglory | — | WITHHELD |

**Other selectable classes without a reviewed loadout:** Arachnomancer, Archivist of Time, ArchPaladin, Bard, Chaos Avenger, Chaos Shaper, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Frostval Barbarian, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legendary Hero, Legion Paladin, Lich, Martial Artist, Master of Moglins, Phantom Chronomancer, Quantum Chronomancer, Scion of Flames, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord, Yami no Ronin.

**Role guidance — grouped only when identical:**

**U01.1 — Arachnomancer, ArchFiend, ArchPaladin, Glaceran Warlord, Legion Revenant, Scion of Flames, Verus DoomKnight**

- **Prepare:** Equip Vigil before pulling; all seven players need it.
- **Debuffs:** Keep debuffs on the called target; help clear spawned Sacrosanct Tendrils.
- **Peer · every 10 seconds:** Peer applies either doubled mana costs or reduced hit chance to the party for five seconds. Neither effect is redirected by a taunt.
- **Tendril priority:** Focus the called Sacrosanct Tendril together. Below 30% HP it enrages; finish it quickly before returning to Kathool.
- **“You cannot resist.”:** Activate Vigil immediately. It replaces the 60-second Nightmare stun/healing block/DoT with a 10-second Migraine DoT. The attack recurs every 25 seconds and ignores Focus.

**U01.2 — Arcana Invoker, Archivist of Time, Bard, Chaos Avenger, Chaos Shaper, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion Paladin, Lich, Martial Artist, Phantom Chronomancer, Quantum Chronomancer, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord, Yami no Ronin**

- **Prepare:** Equip Vigil before pulling; all seven players need it.
- **Peer · every 10 seconds:** Peer applies either doubled mana costs or reduced hit chance to the party for five seconds. Neither effect is redirected by a taunt.
- **Tendril priority:** Focus the called Sacrosanct Tendril together. Below 30% HP it enrages; finish it quickly before returning to Kathool.
- **“You cannot resist.”:** Activate Vigil immediately. It replaces the 60-second Nightmare stun/healing block/DoT with a 10-second Migraine DoT. The attack recurs every 25 seconds and ignores Focus.

**U01.3 — Frostval Barbarian, Legendary Hero, Lord of Order, Master of Moglins, StoneCrusher**

- **Prepare:** Equip Vigil before pulling; all seven players need it.
- **Mana & healing:** Maintain mana support and recovery as Kathool’s Glare doubles mana costs. Heal through Migraine.
- **Peer · every 10 seconds:** Peer applies either doubled mana costs or reduced hit chance to the party for five seconds. Neither effect is redirected by a taunt.
- **Tendril priority:** Focus the called Sacrosanct Tendril together. Below 30% HP it enrages; finish it quickly before returning to Kathool.
- **“You cannot resist.”:** Activate Vigil immediately. It replaces the 60-second Nightmare stun/healing block/DoT with a 10-second Migraine DoT. The attack recurs every 25 seconds and ignores Focus.

### U02 — Champion Drakath

**Join:** `/join championdrakath` · **Frequency:** Weekly · **Difficulty:** Intermediate

**Displayed strategy roster:** Void Highlord · StoneCrusher · Lord of Order · ArchPaladin

**Separate source gear roster:** Lord of Order · Legion Revenant · Paladin Chronomancer · Chrono ShadowHunter

**Goal:** ONE player taunts the HP nukes. The other three keep DPS, buffs and healing steady.

**Avoid:** Do not push through a 2M HP threshold until the taunter is ready.

**Rewards:** Chaos Avenger progression

Sources: [Drakath](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit) · [AQW Wiki — phase mechanics](https://aqwwiki.wikidot.com/champion-drakath-monster) · [AQWG — Drakath strategy](https://sites.google.com/view/aqwg-net/ultra-bosses) · [Jix guide](https://jix-aqw.github.io/guias/ultra-bosses/ultra-champion-drakath.html)

**Loadouts in the source roster (all positions, including withheld):**

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Ravenous | Wizard | Lament | — | Source example |
| Paladin Chronomancer | Fighter | Mana Vamp | Hearty | Vainglory | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Examen | Lament | — | Source example |

**Other selectable classes without a reviewed loadout:** Arcana Invoker, ArchFiend, Archivist of Time, ArchPaladin, Chaos Avenger, Chaos Shaper, Chaos Slayer, Dragon of Time, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion Paladin, Lich, Martial Artist, Master of Moglins, Phantom Chronomancer, Quantum Chronomancer, Scion of Flames, Sentinel, Shaman, StoneCrusher, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Verus DoomKnight, Void Highlord, Yami no Ronin.

**Role guidance — grouped only when identical:**

**U02.1 — Arcana Invoker, Archivist of Time, Chaos Shaper, Chaos Slayer, Chrono ShadowHunter, Dragon of Time, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion Paladin, Lich, Martial Artist, Phantom Chronomancer, Quantum Chronomancer, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void Highlord, Yami no Ronin**

- **DPS assignment:** Identify the designated taunter before pulling. Your default assignment is damage, not taunting.
- **HP blasts · 18M / 16M / 14M / 12M / 8M / 6M / 4M:** Hold damage before a threshold until the designated taunter confirms readiness. Resume after the blast.
- **10M HP · Transformation:** This is a transformation, not a normal tauntable blast.
- **“I WILL NOT LOSE EVERYTHING! NOT AGAIN!”:** Use your final damage window and finish within 20 seconds. Scroll of Enrage cannot stop the meteor.

**U02.2 — ArchFiend, Glaceran Warlord, Scion of Flames, Verus DoomKnight**

- **Confirm assignment:** Ask which teammate handles the HP blasts; do not assume you are the taunter.
- **HP blasts · 18M / 16M / 14M / 12M / 8M / 6M / 4M:** Respect the agreed damage stop and recovery windows.
- **Support:** Maintain your buffs and defensive debuffs between HP blasts.
- **10M HP · Transformation:** This is a transformation, not a normal tauntable blast.
- **“I WILL NOT LOSE EVERYTHING! NOT AGAIN!”:** Use your final damage window and finish within 20 seconds. Scroll of Enrage cannot stop the meteor.

**U02.3 — ArchPaladin**

- **Confirm assignment:** Agree who handles the HP blasts. Equip Scroll of Enrage only if your team assigns you that job.
- **HP blasts · 18M / 16M / 14M / 12M / 8M / 6M / 4M:** Assigned taunter: intercept before the threshold. Otherwise wait for the designated taunter’s call.
- **Mitigation:** Maintain Commandment (2) and Righteous Seal (4); time Hymn of Light (3) after damage lands. Use Sacred Magic: Eden (5) only in the planned mitigation window.
- **10M HP · Transformation:** This is a transformation, not a normal tauntable blast.
- **“I WILL NOT LOSE EVERYTHING! NOT AGAIN!”:** Use your final damage window and finish within 20 seconds. Scroll of Enrage cannot stop the meteor.

**U02.4 — Chaos Avenger**

- **Confirm assignment:** Agree who handles the HP blasts. Equip Scroll of Enrage only if your team assigns you that job.
- **HP blasts · 18M / 16M / 14M / 12M / 8M / 6M / 4M:** Assigned taunter: intercept before the threshold. Otherwise wait for the designated taunter’s call.
- **10M HP · Transformation:** This is a transformation, not a normal tauntable blast.
- **“I WILL NOT LOSE EVERYTHING! NOT AGAIN!”:** Use your final damage window and finish within 20 seconds. Scroll of Enrage cannot stop the meteor.

**U02.5 — Legion Revenant**

- **Confirm assignment:** Agree who handles the HP blasts. Equip Scroll of Enrage only if your team assigns you that job.
- **HP blasts · 18M / 16M / 14M / 12M / 8M / 6M / 4M:** Assigned taunter: intercept before the threshold. Otherwise wait for the designated taunter’s call.
- **Support:** Maintain your buffs and defensive debuffs between HP blasts.
- **10M HP · Transformation:** This is a transformation, not a normal tauntable blast.
- **“I WILL NOT LOSE EVERYTHING! NOT AGAIN!”:** Use your final damage window and finish within 20 seconds. Scroll of Enrage cannot stop the meteor.

**U02.6 — Lord of Order**

- **Confirm assignment:** Agree who handles the HP blasts. Equip Scroll of Enrage only if your team assigns you that job.
- **HP blasts · 18M / 16M / 14M / 12M / 8M / 6M / 4M:** Assigned taunter: intercept before the threshold. Otherwise wait for the designated taunter’s call.
- **Support:** Maintain buffs between blasts; heal after damage lands. Use Blessing of Order (5) for planned mitigation.
- **10M HP · Transformation:** This is a transformation, not a normal tauntable blast.
- **“I WILL NOT LOSE EVERYTHING! NOT AGAIN!”:** Use your final damage window and finish within 20 seconds. Scroll of Enrage cannot stop the meteor.

**U02.7 — Master of Moglins, Paladin Chronomancer, StoneCrusher**

- **Confirm assignment:** Ask which teammate handles the HP blasts; do not assume you are the taunter.
- **HP blasts · 18M / 16M / 14M / 12M / 8M / 6M / 4M:** Respect the agreed damage stop and recovery windows.
- **Recovery:** Keep recovery available for HP blasts; stagger direct heals with the other healer.
- **10M HP · Transformation:** This is a transformation, not a normal tauntable blast.
- **“I WILL NOT LOSE EVERYTHING! NOT AGAIN!”:** Use your final damage window and finish within 20 seconds. Scroll of Enrage cannot stop the meteor.

### U03 — Ultra Nulgath

**Join:** `/join ultranulgath` · **Frequency:** Weekly · **Difficulty:** Advanced

**Displayed strategy roster:** Void Highlord · Lord of Order · ArchPaladin · Legion Revenant

**Separate source gear roster:** Lord of Order · Legion Revenant · StoneCrusher · Guardian

**Goal:** Alternate Contracts taunts; kill the Blade when the team calls.

**Avoid:** Do not ignore the Blade’s charged lethal attack.

**Rewards:** Nulgath Insignias, Sin of the Abyss

Sources: [Nulgath](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit) · [AQW App — Contracts and Abyssal Charge mechanics](https://aqw.app/monsters/ultranulgath)

**Loadouts in the source roster (all positions, including withheld):**

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Arcana Concerto | Pneuma | Lament | — | Source example |
| StoneCrusher | Fighter | Lacerate | Anima | Absolution | — | Source example |
| Guardian | Lucky | Ravenous | Vim | Lament | — | Source example |

**Other selectable classes without a reviewed loadout:** Arachnomancer, Arcana Invoker, ArchFiend, Archivist of Time, ArchPaladin, Chaos Avenger, Chaos Shaper, Chaos Slayer, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Glaceran Warlord, Great Thief, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legendary Hero, Legion DoomKnight, Legion Paladin, Lich, Martial Artist, Master of Moglins, Phantom Chronomancer, Quantum Chronomancer, Scion of Flames, Sentinel, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Verus DoomKnight, Void Highlord, Yami no Ronin.

**Role guidance — grouped only when identical:**

**U03.1 — Arachnomancer, ArchFiend, ArchPaladin, Glaceran Warlord, Legendary Hero, Legion Revenant, Lord of Order, Master of Moglins, Scion of Flames, Verus DoomKnight**

- **Assigned Contracts taunt:** If assigned to taunt, alternate Contracts of the Abyss with your partner (7-second cycle). Do not overlap taunts.
- **Prepare the Blade:** Focus Nulgath first. If your team cannot finish him before the sword charges, prepare the Overfiend Blade to roughly half HP without killing it.
- **“I will shatter you to the core!”:** “I will shatter you to the core!” — kill the Overfiend Blade before its 5-second charge finishes, unless Nulgath can safely be finished first. Taunt does not stop this attack.
- **Return to Nulgath:** Return to Nulgath immediately. Avoid unnecessary sword kills: Essence Gathered adds +50% outgoing damage and +50% physical damage per kill, stacking indefinitely.
- **“Behold the power of the Abyss!”:** Abyssal Charge cannot be taunted. Only the designated taunters alternate Contracts of the Abyss on the agreed 7-second cycle. Do not treat this quote as a universal scroll instruction.

**U03.2 — Arcana Invoker, Archivist of Time, Chaos Avenger, Chaos Shaper, Chaos Slayer, Dragon of Time, Elemental Warrior, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Martial Artist, Phantom Chronomancer, Quantum Chronomancer, Sentinel, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void Highlord, Yami no Ronin**

- **Prepare the Blade:** Focus Nulgath first. If your team cannot finish him before the sword charges, prepare the Overfiend Blade to roughly half HP without killing it.
- **“I will shatter you to the core!”:** “I will shatter you to the core!” — kill the Overfiend Blade before its 5-second charge finishes, unless Nulgath can safely be finished first. Taunt does not stop this attack.
- **Return to Nulgath:** Return to Nulgath immediately. Avoid unnecessary sword kills: Essence Gathered adds +50% outgoing damage and +50% physical damage per kill, stacking indefinitely.

**U03.3 — Chrono ShadowHunter**

- **Prepare the Blade:** Focus Nulgath first. If your team cannot finish him before the sword charges, prepare the Overfiend Blade to roughly half HP without killing it.
- **“I will shatter you to the core!”:** “I will shatter you to the core!” — kill the Overfiend Blade before its 5-second charge finishes, unless Nulgath can safely be finished first. Taunt does not stop this attack.
- **Return to Nulgath:** Return to Nulgath immediately. Avoid unnecessary sword kills: Essence Gathered adds +50% outgoing damage and +50% physical damage per kill, stacking indefinitely.
- **Your skills:** Use FMJ Rounds (4) for damage; save Silver Bullet (5) for the sword when needed. Reload (2) afterward.

### U04 — Ultra Dage

**Join:** `/join ultradage` · **Frequency:** Weekly · **Difficulty:** Intermediate

**Displayed strategy roster:** Chaos Avenger · Legion DoomKnight · Lord of Order · ArchPaladin

**Separate source gear roster:** Chaos Avenger · ArchFiend · Verus DoomKnight · Chrono ShadowHunter

**Goal:** When the zone quote appears, run onto the GLOWING blue circle/platform on the LEFT or RIGHT side of the room within ~3 seconds. It protects you from most of the zone damage.

**Avoid:** Noxious Decay is a debuff on YOU: ordinary healing/HoT hurts instead of healing. Life Steal still works. A death heals Dage by 500,000 HP.

**Rewards:** Dage Insignias and empowered items

Sources: [Dage](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit) · [AQW App — Dage mechanics](https://aqw.app/monsters/ultradage)

**Loadouts in the source roster (all positions, including withheld):**

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Chaos Avenger | Lucky | Dauntless | Anima | Vainglory | — | Source example |
| ArchFiend | Lucky | Dauntless | Base Forge | Vainglory | — | Source example |
| Verus DoomKnight | Lucky | Dauntless | Base Forge | Vainglory | — | Source example |
| Chrono ShadowHunter | Lucky | Health Vamp | Examen | Vainglory | — | Source example |

**Other selectable classes without a reviewed loadout:** Arachnomancer, Archivist of Time, ArchPaladin, Chaos Shaper, Chaos Slayer, Elemental Warrior, Glaceran Warlord, Great Thief, Hollowborn Vindicator, Infinity Knight, Legion DoomKnight, Legion Paladin, Legion Revenant, Lich, Martial Artist, Phantom Chronomancer, Quantum Chronomancer, Sentinel, Ultra OmniKnight, Unundead Goat, Void HighLord, Yami no Ronin.

**Role guidance — grouped only when identical:**

**U04.1 — Arachnomancer, ArchFiend, Archivist of Time, Chaos Shaper, Chaos Slayer, Elemental Warrior, Glaceran Warlord, Great Thief, Hollowborn Vindicator, Infinity Knight, Legion Paladin, Lich, Martial Artist, Phantom Chronomancer, Quantum Chronomancer, Sentinel, Ultra OmniKnight, Unundead Goat, Void HighLord, Yami no Ronin**

- **Survival & skills:** Equip Health Vamp or Dauntless for life steal. Avoid normal healing and HoTs during Noxious Decay.
- **“Cower behind your meager protection spells!”:** “Cower behind your meager protection spells!” — reach the glowing blue platform within 3 seconds.
- **“I possess the full power of the Legion at my disposal.”:** If your team has no Decay source, bring Scroll of Decay as backup. Use it on “I possess the full power of the Legion at my disposal.” only if assigned.

**U04.2 — ArchPaladin**

- **Survival & skills:** Equip Health Vamp or Dauntless. Do not use Hymn of Light (3) while Noxious Decay is active.
- **Your action:** Keep Commandment (2) and Righteous Seal (4) active; use Sacred Magic: Eden (5) for planned mitigation.
- **“Cower behind your meager protection spells!”:** “Cower behind your meager protection spells!” — move onto the glowing blue platform within 3 seconds.
- **“I possess the full power of the Legion at my disposal.”:** If no one else covers regeneration, bring Scroll of Decay as backup. Use it on “I possess the full power of the Legion at my disposal.” only if assigned.

**U04.3 — Chaos Avenger**

- **Survival & skills:** Equip Health Vamp or Dauntless for life steal. Avoid normal healing and HoTs during Noxious Decay.
- **“Cower behind your meager protection spells!”:** “Cower behind your meager protection spells!” — reach the glowing blue platform within 3 seconds.
- **“I possess the full power of the Legion at my disposal.”:** If your team has no Decay source, bring Scroll of Decay as backup. Use it on “I possess the full power of the Legion at my disposal.” only if assigned.
- **Assigned taunt:** If assigned loop taunt, open with Scroll of Enrage and use Flux (3) just before the taunt expires. In the Flux timing variant, watch the second opening auto, the first auto after Noxious Decay and the first auto after each safe zone.

**U04.4 — Chrono ShadowHunter**

- **Survival & skills:** Equip Health Vamp for life steal. Do not use Tracer Rounds (3) while Noxious Decay is active; it applies a HoT.
- **“Cower behind your meager protection spells!”:** “Cower behind your meager protection spells!” — move to the glowing blue platform within 3 seconds. Resume damage after the blast.
- **“I possess the full power of the Legion at my disposal.”:** Use FMJ Rounds (4) for DPS, Silver Bullet (5) for burst, then Reload (2). Avoid ordinary heals. If no one covers regeneration, bring Scroll of Decay as backup; use it on “I possess the full power of the Legion at my disposal.” only if assigned.

**U04.5 — Legion DoomKnight**

- **Survival & skills:** Equip Health Vamp or Dauntless for life steal. Avoid normal healing and HoTs during Noxious Decay.
- **“Cower behind your meager protection spells!”:** “Cower behind your meager protection spells!” — reach the glowing blue platform within 3 seconds.
- **“I possess the full power of the Legion at my disposal.”:** Use Imminent Doom (5) on “I possess the full power of the Legion at my disposal.” if assigned to prevent regeneration.

**U04.6 — Legion Revenant**

- **Survival & skills:** Equip Health Vamp or Dauntless for life steal. Avoid normal healing and HoTs during Noxious Decay.
- **“Cower behind your meager protection spells!”:** “Cower behind your meager protection spells!” — reach the glowing blue platform within 3 seconds.
- **Your action:** If assigned, use Atramentous Shade (2) to block healing during Legion Mages; Decay lasts only two seconds, so coordinate coverage of the regeneration window.

**U04.7 — Verus DoomKnight**

- **Survival & skills:** Equip Dauntless or Health Vamp. Use Soul Fracture (2) to weaken Dage. Watch Noxious Decay before using empowered Life Carve (3), which can apply a HoT.
- **“Cower behind your meager protection spells!”:** “Cower behind your meager protection spells!” — reach the glowing blue platform within 3 seconds.
- **“I possess the full power of the Legion at my disposal.”:** If assigned Decay: use Unleash Doom (5) on “I possess the full power of the Legion at my disposal.”; coordinate another Decay source if necessary.

### U05 — Ultra Speaker

**Join:** `/join ultraspeaker` · **Frequency:** Weekly · **Difficulty:** Expert

**Displayed strategy roster:** Dragon of Time · Legion Revenant · ArchPaladin · Lord of Order

**Separate source gear roster:** StoneCrusher · Legion Revenant · ArchPaladin · Guardian

**Goal:** Follow your team’s Zone and Truth/Listen rotations EXACTLY.

**Avoid:** Never enter Zone while carrying a forbidden debuff.

**Rewards:** Malgor Insignias, ShadowFlame Blade / Dauntless

Sources: [Speaker / Speaker Charts](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit) · [AQW App — three-taunter rotation](https://aqw.app/monsters/ultraspeaker) · [AQW Hub — alternate strategies](https://www.aqwhub.com/ultra-guides/ultra-speaker/)

**Loadouts in the source roster (all positions, including withheld):**

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| StoneCrusher | Fighter | Valiance | Anima | Absolution | — | Source example |
| Legion Revenant | Wizard | Arcana Concerto | Wizard | Lament | — | Source example |
| ArchPaladin | Lucky | Praxis | Base Forge | Lament | — | Source example |
| Guardian | Lucky | Ravenous | Vim | Lament | — | Source example |

**Other selectable classes without a reviewed loadout:** Arcana Invoker, ArchFiend, Archivist of Time, Chaos Avenger, Chaos Shaper, Chaos Slayer, Chrono ShadowHunter, Elemental Warrior, Glaceran Warlord, Great Thief, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Lord of Order, Martial Artist, Paladin Chronomancer, Quantum Chronomancer, Sentinel, Unundead Goat, Verus DoomKnight, Void Highlord, Yami no Ronin.

**Role guidance — grouped only when identical:**

**U05.1 — Arcana Invoker, ArchFiend, Archivist of Time, Chaos Avenger, Chaos Shaper, Chaos Slayer, Chrono ShadowHunter, Elemental Warrior, Glaceran Warlord, Great Thief, Guardian, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Martial Artist, Paladin Chronomancer, Quantum Chronomancer, Sentinel, Unundead Goat, Verus DoomKnight, Void Highlord, Yami no Ronin**

- **Before pulling:** Choose one rotation below with your team. Equip Scroll of Enrage if your rotation assigns you scroll taunts.
- **“All stand equal beneath the eyes of the Eternal.”:** Enter only your assigned Zone. Magia Burn (18s), Stasis (6s) or Sanctity (45s) makes entering lethal; never take one while those debuffs are active.

**U05.2 — ArchPaladin**

- **Before pulling:** Choose one rotation below with your team. Equip Scroll of Enrage if your rotation assigns you scroll taunts.
- **“All stand equal beneath the eyes of the Eternal.”:** Enter only your assigned Zone. Magia Burn (18s), Stasis (6s) or Sanctity (45s) makes entering lethal; never take one while those debuffs are active.
- **Mitigation:** Use Righteous Seal (4) and Sacred Magic: Eden (5) only at your chosen rotation’s mitigation timings.

**U05.3 — Legion Revenant**

- **Before pulling:** Choose one rotation below with your team. Equip Scroll of Enrage if your rotation assigns you scroll taunts.
- **“All stand equal beneath the eyes of the Eternal.”:** Enter only your assigned Zone. Magia Burn (18s), Stasis (6s) or Sanctity (45s) makes entering lethal; never take one while those debuffs are active.
- **Regeneration:** If your rotation uses the LR Decay timing, Atramentous Shade (2) applies Decay for only two seconds; time it around the healing, not just anywhere in the Zone.

**U05.4 — Lord of Order**

- **Before pulling:** Choose one rotation below with your team. Equip Scroll of Enrage if your rotation assigns you scroll taunts.
- **“All stand equal beneath the eyes of the Eternal.”:** Enter only your assigned Zone. Magia Burn (18s), Stasis (6s) or Sanctity (45s) makes entering lethal; never take one while those debuffs are active.
- **Mitigation:** Maintain buffs and use Blessing of Order (5) on the chosen rotation’s mitigation timings.

Review all six full rotation charts in [Section 5](#5-ultra-speaker-timing-charts).

### U06 — Ultra Ezrajal

**Join:** `/join ultraezrajal` · **Frequency:** Daily · **Difficulty:** Intermediate

**Displayed strategy roster:** Legion Revenant · Lord of Order · ArchPaladin · Void Highlord

**Separate source gear roster:** Lord of Order · Legion Revenant · ArchPaladin · Chrono ShadowHunter

**Goal:** STOP attacking during Counter Attack; restart after the reflection window.

**Avoid:** Do not hit a reflect window.

**Rewards:** Exalted Apotheosis materials

Sources: [Timeinn Trio](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit) · [AQW Wiki — Ezrajal mechanics](https://aqwwiki.wikidot.com/ultra-ezrajal-monster) · [AQW App — Ezrajal mechanics](https://aqw.app/monsters/ultraezrajal)

**Loadouts in the source roster (all positions, including withheld):**

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Arcana Concerto | Wizard | Lament | — | Source example |
| ArchPaladin | Lucky | Praxis | Base Forge | Lament | — | Source example |
| Chrono ShadowHunter | Lucky | Valiance | Base Forge | Vainglory | — | Source example |

**Other selectable classes without a reviewed loadout:** Alpha Omega, Arachnomancer, Arcana Invoker, ArchFiend, Archivist of Time, Chaos Avenger, Chaos Shaper, Chaos Slayer, Dragon of Time, Elemental Warrior, Frostval Barbarian, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legendary Hero, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Master of Moglins, Paladin Chronomancer, Phantom Chronomancer, Quantum Chronomancer, Scion of Flames, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Verus DoomKnight, Void Highlord, Yami no Ronin.

**Role guidance — grouped only when identical:**

**U06.1 — Alpha Omega, Arcana Invoker, Archivist of Time, Chaos Avenger, Chaos Shaper, Chaos Slayer, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Phantom Chronomancer, Quantum Chronomancer, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void Highlord, Yami no Ronin**

- **Prepare:** Aim for at least 3,175 HP before pulling.
- **Counter Cast → Counter Attack:** A 2-second charge precedes a 6-second reflection window (40-second cooldown). Stop damage and untarget at the charge; resume only after the buff expires.
- **Prism burst:** Prepare for the heavy prism burst and skill lockout; save damage skills for the safe window.

**U06.2 — Arachnomancer, ArchFiend, ArchPaladin, Glaceran Warlord, Legion Revenant, Scion of Flames, Verus DoomKnight**

- **Prepare:** Aim for at least 3,175 HP before pulling.
- **Counter Cast → Counter Attack:** A 2-second charge precedes a 6-second reflection window (40-second cooldown). Stop damage and untarget at the charge; resume only after the buff expires.
- **Prism burst:** Refresh mitigation before the prism burst and resume damaging debuffs only when reflection ends.

**U06.3 — Frostval Barbarian, Legendary Hero, Lord of Order, Master of Moglins, Paladin Chronomancer**

- **Prepare:** Aim for at least 3,175 HP before pulling.
- **Counter Cast → Counter Attack:** A 2-second charge precedes a 6-second reflection window (40-second cooldown). Stop damage and untarget at the charge; resume only after the buff expires.
- **Prism burst:** Keep a heal ready for the heavy multi-hit burst; recover when skills unlock.

### U07 — Ultra Warden

**Join:** `/join ultrawarden` · **Frequency:** Daily · **Difficulty:** Intermediate

**Displayed strategy roster:** Legion Revenant · Lord of Order · StoneCrusher · Void Highlord

**Separate source gear roster:** Lord of Order · Legion Revenant · StoneCrusher · Chrono ShadowHunter

**Goal:** Recover after Celestial Shockwaves; prepare for faster attacks below 30% HP.

**Avoid:** Do not push final HP without your taunter ready.

**Rewards:** Exalted Apotheosis materials

Sources: [Timeinn Trio](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit) · [AQW Wiki — Warden mechanics](https://aqwwiki.wikidot.com/ultra-warden-monster) · [AQW App — Warden mechanics](https://aqw.app/monsters/ultrawarden)

**Loadouts in the source roster (all positions, including withheld):**

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Ravenous | Pneuma | Lament | — | Source example |
| StoneCrusher | Fighter | Lacerate | Anima | Absolution | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Examen | Vainglory | — | Source example |

**Other selectable classes without a reviewed loadout:** Alpha Omega, Arachnomancer, Arcana Invoker, ArchFiend, Archivist of Time, ArchPaladin, Chaos Shaper, Chaos Slayer, Dragon of Time, Elemental Warrior, Frostval Barbarian, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legendary Hero, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Master of Moglins, Paladin Chronomancer, Phantom Chronomancer, Quantum Chronomancer, Scion of Flames, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Verus DoomKnight, Void Highlord, Yami no Ronin.

**Role guidance — grouped only when identical:**

**U07.1 — Alpha Omega, Arachnomancer, Arcana Invoker, ArchFiend, Archivist of Time, ArchPaladin, Chaos Shaper, Chaos Slayer, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion DoomKnight, Legion Paladin, Legion Revenant, Lich, Light Caster, Martial Artist, Phantom Chronomancer, Quantum Chronomancer, Scion of Flames, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Verus DoomKnight, Void Highlord, Yami no Ronin**

- **Celestial Shockwaves · every 5% HP lost:** Shockwaves reduce affected players to 1 HP; the assigned tank can redirect them. Expect separate stun attacks.
- **450k HP · Berserk:** Berserk increases hit, crit, dodge and attack frequency. Redirect tauntable attacks if assigned; Scroll of Enrage cannot prevent the phase change.

**U07.2 — Frostval Barbarian, Legendary Hero, Master of Moglins, Paladin Chronomancer**

- **Celestial Shockwaves · every 5% HP lost:** Keep recovery ready for affected players reduced to 1 HP.
- **450k HP · Berserk:** Berserk increases hit, crit, dodge and attack frequency. Redirect tauntable attacks if assigned; Scroll of Enrage cannot prevent the phase change.

**U07.3 — Lord of Order**

- **Celestial Shockwaves · every 5% HP lost:** Keep recovery ready for affected players reduced to 1 HP.
- **Mitigation:** Time Blessing of Order (5) around Berserk when assigned.
- **450k HP · Berserk:** Berserk increases hit, crit, dodge and attack frequency. Redirect tauntable attacks if assigned; Scroll of Enrage cannot prevent the phase change.

### U08 — Ultra Engineer

**Join:** `/join ultraengineer` · **Frequency:** Daily · **Difficulty:** Intermediate

**Displayed strategy roster:** Legion Revenant · Lord of Order · ArchPaladin · Void Highlord

**Separate source gear roster:** Lord of Order · Legion Revenant · StoneCrusher · Chrono ShadowHunter

**Goal:** Focus Defense Drone → Attack Drone → Engineer.

**Avoid:** Do not attack into the Defense Drone counter.

**Rewards:** Exalted Apotheosis materials

Sources: [Timeinn Trio](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit) · [AQW Wiki — Defense Drone](https://aqwwiki.wikidot.com/yoshino-s-def-drone) · [AQW App — Engineer mechanics](https://aqw.app/monsters/ultraengineer)

**Loadouts in the source roster (all positions, including withheld):**

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Ravenous | Pneuma | Lament | — | Source example |
| StoneCrusher | Fighter | Lacerate | Anima | Absolution | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Examen | Vainglory | — | Source example |

**Other selectable classes without a reviewed loadout:** Arcana Invoker, ArchFiend, Archivist of Time, ArchPaladin, Chaos Avenger, Chaos Shaper, Chaos Slayer, Dragon of Time, Elemental Warrior, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legendary Hero, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Master of Moglins, Phantom Chronomancer, Quantum Chronomancer, Scion of Flames, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Verus DoomKnight, Void Highlord, Yami no Ronin.

**Role guidance — grouped only when identical:**

**U08.1 — Arcana Invoker, Archivist of Time, Chaos Avenger, Chaos Shaper, Chaos Slayer, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Phantom Chronomancer, Quantum Chronomancer, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void Highlord, Yami no Ronin**

- **Opening:** Let a ranged player initiate before moving in.
- **Defense Drone:** In the displayed strategy, focus Defense Drone first. Every 20 seconds it charges for 2 seconds, then reflects damage for 6 seconds. Stop attacking it during reflection.
- **Attack Drone:** Switch to Attack Drone after Defense Drone dies.
- **Engineer:** Burst Engineer only after both drones die; finish before they respawn.

**U08.2 — ArchFiend, Glaceran Warlord, Legion Revenant, Scion of Flames, Verus DoomKnight**

- **Opening:** Let a ranged player initiate before moving in.
- **Defense Drone:** In the displayed strategy, focus Defense Drone first. Every 20 seconds it charges for 2 seconds, then reflects damage for 6 seconds. Stop attacking it during reflection.
- **Attack Drone:** Switch to Attack Drone after Defense Drone dies.
- **Engineer:** Maintain mitigation during the periodic heavy attack; finish before drones respawn.

**U08.3 — ArchPaladin**

- **Opening:** Let a ranged player initiate before moving in.
- **Defense Drone:** In the displayed strategy, focus Defense Drone first. Every 20 seconds it charges for 2 seconds, then reflects damage for 6 seconds. Stop attacking it during reflection.
- **Defense Drone burst:** When reflection is inactive, use Commandment (2), Righteous Seal (4), then Sacred Magic: Eden (5) if using the assigned burst setup.
- **Attack Drone:** Switch to Attack Drone after Defense Drone dies.
- **Engineer:** Maintain mitigation during the periodic heavy attack; finish before drones respawn.

**U08.4 — Legendary Hero, Master of Moglins**

- **Opening:** Let a ranged player initiate before moving in.
- **Defense Drone:** In the displayed strategy, focus Defense Drone first. Every 20 seconds it charges for 2 seconds, then reflects damage for 6 seconds. Stop attacking it during reflection.
- **Attack Drone:** Switch to Attack Drone after Defense Drone dies.
- **Engineer:** Keep recovery ready for the periodic heavy attack; finish before the drones respawn.

**U08.5 — Lord of Order**

- **Opening:** Let a ranged player initiate before moving in.
- **Defense Drone:** In the displayed strategy, focus Defense Drone first. Every 20 seconds it charges for 2 seconds, then reflects damage for 6 seconds. Stop attacking it during reflection.
- **Attack Drone:** Switch to Attack Drone; use Blessing of Order (5) in the assigned window.
- **Engineer:** Keep recovery ready for the periodic heavy attack; finish before the drones respawn.

### U09 — Ultra Avatar Tyndarius

**Join:** `/join ultratyndarius` · **Frequency:** Daily · **Difficulty:** Advanced

**Displayed strategy roster:** Chaos Avenger · Legion Revenant · Lord of Order · ArchPaladin

**Separate source gear roster:** Lord of Order · StoneCrusher · ArchPaladin · Chrono ShadowHunter

**Goal:** Left Orb → Right Orb → Tyndarius; repeat.

**Avoid:** Do not leave two Orbs alive together.

**Rewards:** Infernal Flame Pyromancer materials

Sources: [Tyndarius](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Loadouts in the source roster (all positions, including withheld):**

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| StoneCrusher | Fighter | Lacerate | Anima | Absolution | — | Source example |
| ArchPaladin | Lucky | Praxis | Base Forge | Lament | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Base Forge | Vainglory | — | Source example |

**Other selectable classes without a reviewed loadout:** Arachnomancer, Arcana Invoker, ArchFiend, Archivist of Time, Chaos Avenger, Chaos Shaper, Chaos Slayer, Dragon of Time, Elemental Warrior, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legendary Hero, Legion DoomKnight, Legion Paladin, Legion Revenant, Lich, Martial Artist, Master of Moglins, Paladin Chronomancer, Phantom Chronomancer, Quantum Chronomancer, Scion of Flames, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Verus DoomKnight, Void HighLord, Yami no Ronin.

**Role guidance — grouped only when identical:**

**U09.1 — Arachnomancer, ArchFiend, ArchPaladin, Glaceran Warlord, Legion Revenant, Scion of Flames, Verus DoomKnight**

- **Orb assignment:** If assigned to taunt an Orb, agree which one before pulling. Do not improvise an additional taunt rotation.
- **Target order:** One common strategy is Left Orb → Right Orb → Tyndarius; coordinate target changes if Orbs return.
- **Orb charge:** Fire Orbs charge for three seconds on a 20-second cycle. They take increased damage while charging, and the hit increases damage taken by players.
- **Boss buffs:** Tyndarius periodically gains damage, dodge/hit or crit buffs; keep defensive support and recovery ready.
- **Mitigation:** Keep defensive support active during Orb transitions.

**U09.2 — Arcana Invoker, Archivist of Time, Chaos Avenger, Chaos Shaper, Chaos Slayer, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Martial Artist, Phantom Chronomancer, Quantum Chronomancer, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord, Yami no Ronin**

- **Orb assignment:** If assigned to taunt an Orb, agree which one before pulling. Do not improvise an additional taunt rotation.
- **Target order:** One common strategy is Left Orb → Right Orb → Tyndarius; coordinate target changes if Orbs return.
- **Orb charge:** Fire Orbs charge for three seconds on a 20-second cycle. They take increased damage while charging, and the hit increases damage taken by players.
- **Boss buffs:** Tyndarius periodically gains damage, dodge/hit or crit buffs; keep defensive support and recovery ready.

**U09.3 — Legendary Hero, Lord of Order, Master of Moglins, Paladin Chronomancer**

- **Orb assignment:** If assigned to taunt an Orb, agree which one before pulling. Do not improvise an additional taunt rotation.
- **Target order:** One common strategy is Left Orb → Right Orb → Tyndarius; coordinate target changes if Orbs return.
- **Orb charge:** Fire Orbs charge for three seconds on a 20-second cycle. They take increased damage while charging, and the hit increases damage taken by players.
- **Boss buffs:** Tyndarius periodically gains damage, dodge/hit or crit buffs; keep defensive support and recovery ready.
- **Recovery:** Time recovery around Orb transitions and keep the assigned taunter alive.

### U10 — Ultra Drago

**Join:** `/join ultradrago` · **Frequency:** Weekly · **Difficulty:** Advanced

**Displayed strategy roster:** Chaos Avenger · Legion Revenant · Lord of Order · ArchPaladin

**Separate source gear roster:** StoneCrusher · Legion Revenant · ArchPaladin · Guardian

**Goal:** Bowmaster → Executioner → Drago; agree on guard taunts first.

**Avoid:** Do not split damage between guards.

**Rewards:** Drago Insignias / Darkon progression

Sources: [Drago](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit) · [AQW App — guard mechanics and Judgement Day](https://aqw.app/monsters/ultradrago)

**Loadouts in the source roster (all positions, including withheld):**

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| StoneCrusher | Fighter | Lacerate | Anima | Absolution | — | Source example |
| Legion Revenant | Wizard | Awe Blast | Pneuma | Lament | — | Source example |
| ArchPaladin | Lucky | Praxis | Base Forge | Lament | — | Source example |
| Guardian | Lucky | Ravenous | Vim | Lament | — | Source example |

**Other selectable classes without a reviewed loadout:** Arcana Invoker, ArchFiend, Archivist of Time, Chaos Avenger, Chaos Shaper, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Immortal DarkCaster, King's Echo, Lich, Lord of Order, Master of Moglins, Phantom Chronomancer, Scion of Flames, Sentinel, Timeless DarkCaster.

**Role guidance — grouped only when identical:**

**U10.1 — Arcana Invoker, ArchFiend, Archivist of Time, Chaos Avenger, Chaos Shaper, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Guardian, Immortal DarkCaster, King's Echo, Legion Revenant, Lich, Phantom Chronomancer, Scion of Flames, Sentinel, Timeless DarkCaster**

- **Bowmaster:** In this example strategy, focus Bowmaster first. If assigned a guard taunt, keep control of your assigned guard until the switch. The surviving guard fully heals and gains Ally Boost when its partner dies.
- **Finish:** Switch to Executioner, then Drago, who cannot be damaged while either guard lives. Judgement Day begins after 160 seconds of combat with Drago; its 20-second cast is not tauntable.

**U10.2 — ArchPaladin, Master of Moglins**

- **Bowmaster:** In this example strategy, focus Bowmaster first. If assigned a guard taunt, keep control of your assigned guard until the switch. The surviving guard fully heals and gains Ally Boost when its partner dies.
- **Executioner transition:** Keep recovery and mitigation ready for the guard death; avoid overlapping taunts.
- **Finish:** Switch to Executioner, then Drago, who cannot be damaged while either guard lives. Judgement Day begins after 160 seconds of combat with Drago; its 20-second cast is not tauntable.

**U10.3 — Lord of Order**

- **Bowmaster:** In this example strategy, focus Bowmaster first. If assigned a guard taunt, keep control of your assigned guard until the switch. The surviving guard fully heals and gains Ally Boost when its partner dies.
- **Executioner transition:** Before Bowmaster dies, apply Quixotic with Blessing of Order (5) on Executioner as planned.
- **Finish:** Switch to Executioner, then Drago, who cannot be damaged while either guard lives. Judgement Day begins after 160 seconds of combat with Drago; its 20-second cast is not tauntable.

### U11 — Ultra Darkon

**Join:** `/join ultradarkon` · **Frequency:** Weekly · **Difficulty:** Expert

**Displayed strategy roster:** Legion Revenant · Lord of Order · StoneCrusher · LightCaster

**Separate source gear roster:** Lord of Order · Legion Revenant · Paladin Chronomancer · Chrono ShadowHunter

**Goal:** Alternate assigned Elegy taunts; coordinate healer timing.

**Avoid:** Do not have the same player repeatedly taunt consecutive Elegies.

**Rewards:** Darkon Insignias / endgame farming

Sources: [Darkon](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit) · [Solaris — Darkon gear and phases](https://solarisaqw.lol/guides/ultra-weeklies/ultradarkon)

**Loadouts in the source roster (all positions, including withheld):**

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Absolution | — | Source example |
| Legion Revenant | Wizard | Ravenous | Pneuma | Lament | — | Source example |
| Paladin Chronomancer | Fighter | Lacerate | Vim | Fighter | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Examen | Base Forge | — | Source example |

| Other documented class | Armor/base | Weapon | Helm | Cape | Active |
| --- | --- | --- | --- | --- | --- |
| ArchPaladin | Lucky | Praxis | Forge | Lament | — |
| StoneCrusher | Fighter | Valiance | Anima | Absolution | — |

**Other selectable classes without a reviewed loadout:** Alpha Omega, Arcana Invoker, Archivist of Time, Chaos Shaper, Elemental Warrior, Frostval Barbarian, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, King's Echo, Legendary Hero, Legion DoomKnight, Legion Paladin, Lich, LightCaster, Martial Artist, Master of Moglins, Phantom Chronomancer, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord, Yami no Ronin.

**Role guidance — grouped only when identical:**

**U11.1 — Alpha Omega, Arcana Invoker, Archivist of Time, Chaos Shaper, Chrono ShadowHunter, Elemental Warrior, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, King's Echo, Legion DoomKnight, Legion Paladin, Legion Revenant, Lich, LightCaster, Martial Artist, Phantom Chronomancer, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord, Yami no Ronin**

- **Phase 1 · DPS check:** Reach the first transition near 15.56M HP before 72 seconds.
- **Elegy:** If assigned to taunt, alternate Elegy with your partner. Two consecutive Elegies can invert crits and healing; a third is lethal. Do not take an unassigned taunt.
- **Final phase:** After Darkon refills HP, expect stronger auto attacks and mana pressure. Maintain damage and your assigned defensive or healing duties.

**U11.2 — ArchPaladin, Frostval Barbarian, Legendary Hero, Master of Moglins, Paladin Chronomancer, StoneCrusher**

- **Phase 1 · DPS check:** Reach the first transition near 15.56M HP before 72 seconds.
- **Elegy:** If assigned to taunt, alternate Elegy with your partner. Two consecutive Elegies can invert crits and healing; a third is lethal. Do not take an unassigned taunt.
- **Phase 2 · Healing:** Stagger direct heals; do not heal simultaneously with the other healer.
- **Final phase:** After Darkon refills HP, expect stronger auto attacks and mana pressure. Maintain damage and your assigned defensive or healing duties.

**U11.3 — Lord of Order**

- **Phase 1 · DPS check:** Reach the first transition near 15.56M HP before 72 seconds.
- **Elegy:** If assigned to taunt, alternate Elegy with your partner. Two consecutive Elegies can invert crits and healing; a third is lethal. Do not take an unassigned taunt.
- **Phase 2 · Healing:** Stagger direct heals; do not heal simultaneously with the other healer.
- **4.5–4.6M HP:** Save Blessing of Order (5) for the nuke near 4.5–4.6M HP when using this timing.
- **Final phase:** After Darkon refills HP, expect stronger auto attacks and mana pressure. Maintain damage and your assigned defensive or healing duties.

### U12 — Ultra Gramiel

**Join:** `/join ultragramiel` · **Frequency:** Weekly · **Difficulty:** Expert

**Displayed strategy roster:** StoneCrusher · Legion Revenant · Lord of Order · Shaman

**Separate source gear roster:** Lord of Order · Legion Revenant · StoneCrusher · Shaman

**Goal:** Balance both Crystals; later use an agreed four-player taunt order.

**Avoid:** Do not kill one Crystal far ahead of the other.

**Rewards:** Hollowborn Vindicator / Gramiel Insignias

Sources: [Gramiel](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit) · [AQW App — Gramiel strategy](https://aqw.app/monsters/ultragramiel) · [AQWorlds Wiki — Gramiel mechanics](https://aqwwiki.wikidot.com/gramiel-the-graceful)

**Loadouts in the source roster (all positions, including withheld):**

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Arcana Concerto | Wizard | Lament | — | Source example |
| StoneCrusher | Fighter | Praxis | Anima | Absolution | — | Source example |
| Shaman | Lucky | Elysium | Base Forge | Lament | — | Source example |

**Other selectable classes without a reviewed loadout:** Arcana Invoker, ArchFiend, Archivist of Time, ArchPaladin, Chaos Shaper, Chrono ShadowHunter, Great Thief, Guardian, Immortal DarkCaster, Infinity Knight, Legendary Hero, Martial Artist, Master of Moglins, Paladin Chronomancer, Phantom Chronomancer, Scion of Flames, Timeless DarkCaster, Ultra OmniKnight.

**Role guidance — grouped only when identical:**

**U12.1 — Arcana Invoker, ArchFiend, Archivist of Time, ArchPaladin, Chaos Shaper, Chrono ShadowHunter, Great Thief, Guardian, Immortal DarkCaster, Infinity Knight, Legendary Hero, Lord of Order, Martial Artist, Master of Moglins, Paladin Chronomancer, Phantom Chronomancer, Scion of Flames, Shaman, StoneCrusher, Timeless DarkCaster, Ultra OmniKnight**

- **Crystal pairs:** Agree your crystal partner before pulling. Alternate your assigned taunts on the defense-shattering cue.
- **Guard break:** On the drain cue, switch to Gramiel to break his guard, then return to your crystal.
- **Crystal balance:** Keep both crystal HP close; kill them within five seconds of each other.
- **Vendetta:** After the crystals, follow your assigned turn in the four-player rotation. In the standard displayed-team variant, order is DPS → LoO → SC → LR; confirm the order before pulling. Five Vendetta stacks cause instant death when Grace Unleashed lands, not merely on gaining the fifth stack.
- **70% / 40% / 10% HP:** Before crossing each threshold, ensure every player has Vendetta or Death’s Door; that grants five-second invulnerability against Celestial Vanquish, which ignores Focus. The threshold consumes both effects.

**U12.2 — Legion Revenant**

- **Crystal pairs:** Agree your crystal partner before pulling. Alternate your assigned taunts on the defense-shattering cue.
- **Avoid Decay:** Do not use Atramentous Shade (2) during the crystal phase; Decay can strengthen Gramiel.
- **Guard break:** On the drain cue, switch to Gramiel to break his guard, then return to your crystal.
- **Crystal balance:** Keep both crystal HP close; kill them within five seconds of each other.
- **Vendetta:** After the crystals, follow your assigned turn in the four-player rotation. In the standard displayed-team variant, order is DPS → LoO → SC → LR; confirm the order before pulling. Five Vendetta stacks cause instant death when Grace Unleashed lands, not merely on gaining the fifth stack.
- **70% / 40% / 10% HP:** Before crossing each threshold, ensure every player has Vendetta or Death’s Door; that grants five-second invulnerability against Celestial Vanquish, which ignores Focus. The threshold consumes both effects.

## 3. All other boss guides

29 existing guide cards. All fight summaries and distinct selectable-class guidance are reproduced from the candidate, along with equipment and consumable examples when present. Generic solo arena overview entries are not a guarantee that each contained boss has a detailed guide.

### B01 — Fourth Lynaria

**Category:** Seasonal challenges · **Join:** `/join murdermoon` · [Wiki reference](https://aqwwiki.wikidot.com/murder-moon) · [Fourth Lynaria](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Seasonal encounter; no daily/weekly recurrence assumed.
- Keep LoO/LR/SC/VDK core support and debuffs in this team. Watch The Fourth Sense: extreme dodge lasts 3 seconds. Fourth Repel removes 80% of current HP and stacks haste reduction. Heal and maintain haste support.
- At 50% HP, Meditate increases boss damage, defense and DoT resistance. Tricked briefly reduces INT by 99%; magical classes can be at a disadvantage. no specific gear is confirmed for this boss.

**Community class candidates:** Lord of Order, Legion Revenant, StoneCrusher, Verus DoomKnight.

**Selectable classes without reviewed gear:** Arachnomancer, Arcana Invoker, ArchFiend, Archivist of Time, ArchPaladin, Chaos Avenger, Chaos Shaper, Chrono ShadowHunter, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, King's Echo, Legendary Hero, Legion DoomKnight, Legion Paladin, Legion Revenant, Lich, Light Caster, Lord of Order, Martial Artist, Master of Moglins, Paladin Chronomancer, Phantom Chronomancer, Scion of Flames, Sentinel, Shaman, StoneCrusher, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Verus DoomKnight, Void HighLord.

**B01.1 — Arachnomancer, ArchFiend, ArchPaladin, Glaceran Warlord, Legion Revenant, Scion of Flames, Verus DoomKnight**

- **Fourth Repel:** Maintain haste support and recovery after the 80% current-HP attack.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B01.2 — Arcana Invoker, Archivist of Time, Chaos Avenger, Chaos Shaper, Chrono ShadowHunter, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Phantom Chronomancer, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord**

- **The Fourth Sense:** Expect extreme dodge for three seconds; account for the INT reduction and stronger defenses later.
- **Your role:** Maintain damage during safe windows and follow the team’s target and mechanic calls.

**B01.3 — Legendary Hero, Lord of Order, Master of Moglins, Paladin Chronomancer, StoneCrusher**

- **Fourth Repel:** Maintain haste support and recovery after the 80% current-HP attack.
- **Your role:** Coordinate healing and buffs with the team; respect healing-inversion mechanics where applicable.

### B02 — Void Flibbi

**Category:** Void Bosses · **Join:** `/join voidflibbi` · [Wiki reference](https://aqwwiki.wikidot.com/void-flibbitiestgibbet) · [Void Bosses](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Flibbitiestgibbet applies extreme dodge and damage resistance if hit by Elemental Embrace or Elemental Grasp. Avoid Shaman’s skill 5 and verify whether other class variants use these effects. Its frequent HP-based attacks require sustained recovery.

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Ravenous | Pneuma | Lament | — | Source example |
| Verus DoomKnight | Lucky | Dauntless | Anima | Vainglory | — | Source example |
| Legendary Hero | Lucky | Lacerate | Anima | Lament | — | Source example |
| ArchFiend | Lucky | Ravenous | Base Forge | Vainglory | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Examen | Vainglory | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Examen | Vainglory | — | Source example |

**Selectable classes without reviewed gear:** Arachnomancer, Arcana Invoker, Archivist of Time, ArchPaladin, Chaos Shaper, Chaos Slayer, Dragon of Time, Elemental Warrior, Frostval Barbarian, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Master of Moglins, Paladin Chronomancer, Phantom Chronomancer, Scion of Flames, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord, Yami no Ronin.

**B02.1 — Arachnomancer, ArchFiend, ArchPaladin, Glaceran Warlord, Legion Revenant, Scion of Flames, Verus DoomKnight**

- **Encounter assignment:** No class-specific rotation is documented for this class. Follow the agreed team assignments and the fight overview.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B02.2 — Arcana Invoker, Archivist of Time, Chaos Shaper, Chaos Slayer, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Phantom Chronomancer, Sentinel, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord, Yami no Ronin**

- **Encounter assignment:** No class-specific rotation is documented for this class. Follow the agreed team assignments and the fight overview.
- **Your role:** Maintain damage during safe windows and follow the team’s target and mechanic calls.

**B02.3 — Frostval Barbarian, Legendary Hero, Lord of Order, Master of Moglins, Paladin Chronomancer**

- **Encounter assignment:** No class-specific rotation is documented for this class. Follow the agreed team assignments and the fight overview.
- **Your role:** Coordinate healing and buffs with the team; respect healing-inversion mechanics where applicable.

**B02.4 — Shaman**

- **Skill restriction:** Avoid Shaman’s skill 5 (Elemental Embrace) and the corresponding Elemental Grasp effect on class variants; the boss gains extreme dodge and resistance.
- **Your role:** Maintain damage during safe windows and follow the team’s target and mechanic calls.

### B03 — Void Nightbane

**Category:** Void Bosses · **Join:** `/join voidnightbane` · [Wiki reference](https://aqwwiki.wikidot.com/void-nightbane) · [Void Bosses](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Avoid Vainglory because healing is heavily reduced. Favor rapid sustained hits rather than large individual nukes. Bring a Decay source to block Blood Frenzy’s 100,000 HP recovery; other healing effects may still occur.

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Arcana Concerto | Pneuma | Lament | — | Source example |
| Verus DoomKnight | Lucky | Ravenous | Anima | Penitence | — | Source example |
| Legendary Hero | Lucky | Lacerate | Anima | Lament | — | Source example |
| ArchFiend | Lucky | Ravenous | Base Forge | Penitence | — | Source example |
| Chrono ShadowHunter | Lucky | Health Vamp | Examen | Penitence | — | Source example |
| Chrono ShadowHunter | Lucky | Health Vamp | Examen | Penitence | — | Source example |

**Selectable classes without reviewed gear:** Arachnomancer, Arcana Invoker, Archivist of Time, ArchPaladin, Chaos Shaper, Dragon of Time, Elemental Warrior, Frostval Barbarian, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion Paladin, Lich, Light Caster, Martial Artist, Master of Moglins, Phantom Chronomancer, Scion of Flames, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord.

**B03.1 — Arachnomancer, ArchFiend, ArchPaladin, Glaceran Warlord, Legion Revenant, Scion of Flames, Verus DoomKnight**

- **Survival and damage:** Avoid Vainglory; favor rapid sustained hits over large individual nukes. Bring a Decay source to block Blood Frenzy’s 100,000 HP recovery; other healing effects may still occur.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B03.2 — Arcana Invoker, Archivist of Time, Chaos Shaper, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion Paladin, Lich, Light Caster, Martial Artist, Phantom Chronomancer, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord**

- **Survival and damage:** Avoid Vainglory; favor rapid sustained hits over large individual nukes. Bring a Decay source to block Blood Frenzy’s 100,000 HP recovery; other healing effects may still occur.
- **Your role:** Maintain damage during safe windows and follow the team’s target and mechanic calls.

**B03.3 — Frostval Barbarian, Legendary Hero, Lord of Order, Master of Moglins**

- **Survival and damage:** Avoid Vainglory; favor rapid sustained hits over large individual nukes. Bring a Decay source to block Blood Frenzy’s 100,000 HP recovery; other healing effects may still occur.
- **Your role:** Coordinate healing and buffs with the team; respect healing-inversion mechanics where applicable.

### B04 — Void Xyfrag

**Category:** Void Bosses · **Join:** `/join voidxyfrag` · [Wiki reference](https://aqwwiki.wikidot.com/void-xyfrag) · [Void Bosses](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Assign a durable taunter to redirect Consume on the “BLEEEEEEEEEEEECCH” cue; LR, VDK or Legendary Hero are community options, depending on setup. Favor fast sustained damage. Finish promptly before the encounter becomes invulnerable.

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Arcana Concerto | Pneuma | Lament | — | Source example |
| Verus DoomKnight | Lucky | Dauntless | Anima | Vainglory | — | Source example |
| Legendary Hero | Lucky | Lacerate | Anima | Lament | — | Source example |
| ArchFiend | Lucky | Ravenous | Base Forge | Vainglory | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Examen | Vainglory | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Examen | Vainglory | — | Source example |

**Selectable classes without reviewed gear:** Arachnomancer, Arcana Invoker, Archivist of Time, ArchPaladin, Chaos Shaper, Dragon of Time, Elemental Warrior, Frostval Barbarian, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion Paladin, Lich, Light Caster, Martial Artist, Master of Moglins, Phantom Chronomancer, Scion of Flames, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord.

**B04.1 — Arachnomancer, ArchFiend, ArchPaladin, Glaceran Warlord, Scion of Flames**

- **Damage window:** Favor fast sustained damage; finish before invulnerability.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B04.2 — Arcana Invoker, Archivist of Time, Chaos Shaper, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion Paladin, Lich, Light Caster, Martial Artist, Phantom Chronomancer, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord**

- **Damage window:** Favor fast sustained damage; finish before invulnerability.
- **Your role:** Maintain damage during safe windows and follow the team’s target and mechanic calls.

**B04.3 — Frostval Barbarian, Legendary Hero, Lord of Order, Master of Moglins**

- **Damage window:** Favor fast sustained damage; finish before invulnerability.
- **Your role:** Coordinate healing and buffs with the team; respect healing-inversion mechanics where applicable.

**B04.4 — Legion Revenant, Verus DoomKnight**

- **Assigned taunt:** Taunt Consume on the “BLEEEEEEEEEEEECCH” cue if assigned.
- **Damage window:** Favor fast sustained damage; finish before invulnerability.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

### B05 — Void NerfKitten

**Category:** Void Bosses · **Join:** `/join voidnerfkitten` · [Wiki reference](https://aqwwiki.wikidot.com/void-nerfkitten) · [Void Bosses](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Meow is a two-second warning before a stat-stealing attack. Agree an alternating durable taunt rotation; the debuff lasts 25 seconds and affected players empower the boss. Damage is capped at 20k per hit.

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Ravenous | Pneuma | Lament | — | Source example |
| Verus DoomKnight | Lucky | Dauntless | Anima | Vainglory | — | Source example |
| Legendary Hero | Lucky | Lacerate | Anima | Lament | — | Source example |
| ArchFiend | Lucky | Ravenous | Base Forge | Vainglory | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Examen | Vainglory | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Examen | Vainglory | — | Source example |

**Selectable classes without reviewed gear:** Arachnomancer, Arcana Invoker, Archivist of Time, ArchPaladin, Chaos Avenger, Chaos Shaper, Chaos Slayer, Dragon of Time, Elemental Warrior, Frostval Barbarian, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Master of Moglins, Phantom Chronomancer, Scion of Flames, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord, Yami no Ronin.

**B05.1 — Arachnomancer, ArchFiend, ArchPaladin, Glaceran Warlord, Scion of Flames, Verus DoomKnight**

- **Taunt coordination:** If assigned as the second durable taunter, alternate with Legion Revenant on the Meow cue.
- **Damage window:** Favor rapid damage.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B05.2 — Arcana Invoker, Archivist of Time, Chaos Avenger, Chaos Shaper, Chaos Slayer, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Phantom Chronomancer, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord, Yami no Ronin**

- **Taunt coordination:** If assigned as the second durable taunter, alternate with Legion Revenant on the Meow cue.
- **Damage window:** Favor rapid damage.
- **Your role:** Maintain damage during safe windows and follow the team’s target and mechanic calls.

**B05.3 — Frostval Barbarian, Legendary Hero, Lord of Order, Master of Moglins**

- **Taunt coordination:** If assigned as the second durable taunter, alternate with Legion Revenant on the Meow cue.
- **Damage window:** Favor rapid damage.
- **Your role:** Coordinate healing and buffs with the team; respect healing-inversion mechanics where applicable.

**B05.4 — Legion Revenant**

- **Assigned taunt:** Coordinate alternating taunts with another durable support on Meow. Avoid repeated exposure to the 25-second stat-steal debuff.
- **Damage window:** Favor rapid damage.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

### B06 — Kasuko & Whirlpool

**Category:** Lavarock Shore · **Join:** `/join lavarockshore` · [Wiki reference](https://aqwwiki.wikidot.com/lavarock-shore) · [Lavarock Shore](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Seasonal encounter. Kasuko charges for 3 seconds at 90%, 70%, 50%, 30% and 10% HP, then deals 90% of current HP; Focus cannot redirect this attack. Recover immediately. At 60% HP Enrage increases attack frequency and damage. Whirlpool-first is one community strategy, not mandatory.

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Arcana Concerto | Pneuma | Lament | — | Source example |
| Verus DoomKnight | Lucky | Ravenous | Base Forge | Vainglory | — | Source example |
| StoneCrusher | Fighter | Lacerate | Anima | Absolution | — | Source example |
| ArchFiend | Lucky | Ravenous | Base Forge | Vainglory | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Examen | Vainglory | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Examen | Vainglory | — | Source example |

**Selectable classes without reviewed gear:** Arachnomancer, Arcana Invoker, Archivist of Time, ArchPaladin, Chaos Shaper, Dragon of Time, Elemental Warrior, Frostval Barbarian, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legendary Hero, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Master of Moglins, Paladin Chronomancer, Phantom Chronomancer, Scion of Flames, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord.

**B06.1 — Arachnomancer, ArchFiend, ArchPaladin, Glaceran Warlord, Legion Revenant, Scion of Flames, Verus DoomKnight**

- **Target priority:** Focus Whirlpool first unless the team has agreed that multi-target damage makes direct Kasuko focus safe.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B06.2 — Arcana Invoker, Archivist of Time, Chaos Shaper, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Phantom Chronomancer, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord**

- **Target priority:** Focus Whirlpool first unless the team has agreed that multi-target damage makes direct Kasuko focus safe.
- **Your role:** Maintain damage during safe windows and follow the team’s target and mechanic calls.

**B06.3 — Frostval Barbarian, Legendary Hero, Lord of Order, Master of Moglins, Paladin Chronomancer, StoneCrusher**

- **HP-based nukes:** Maintain near-full team HP and regular healing.
- **Your role:** Coordinate healing and buffs with the team; respect healing-inversion mechanics where applicable.

### B07 — Temple Shrine — Left

**Category:** Shrines · **Join:** `/join templeshrine` · [Wiki reference](https://aqwwiki.wikidot.com/eclipse-ascent) · [Temple Shrine](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Use the hub to enter the left shrine. LoO taunts Lunar Haze after the gaze message vanishes; LR uses Praxis and taunt at the Moon Converges cue.

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Praxis | Pneuma | Lament | — | Source example |
| StoneCrusher | Fighter | Lacerate | Anima | Absolution | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Examen | Vainglory | — | Source example |

**Selectable classes without reviewed gear:** Arcana Invoker, ArchFiend, Chaos Avenger, Chaos Shaper, Chaos Slayer, Elemental Warrior, Glaceran Warlord, Great Thief, Guardian, King's Echo, Legendary Hero, Legion DoomKnight, Legion Paladin, Martial Artist, Paladin Chronomancer, Phantom Chronomancer, Quantum Chronomancer, Scion of Flames, Sentinel, Unundead Goat, Verus DoomKnight, Void HighLord, Yami no Ronin.

**B07.1 — Arcana Invoker, Chaos Avenger, Chaos Shaper, Chaos Slayer, Chrono ShadowHunter, Elemental Warrior, Great Thief, Guardian, King's Echo, Legion DoomKnight, Legion Paladin, Martial Artist, Phantom Chronomancer, Quantum Chronomancer, Sentinel, Unundead Goat, Void HighLord, Yami no Ronin**

- **Encounter assignment:** No class-specific rotation is documented for this class. Follow the agreed team assignments and the fight overview.
- **Your role:** Maintain damage during safe windows and follow the team’s target and mechanic calls.

**B07.2 — ArchFiend, Glaceran Warlord, Scion of Flames, Verus DoomKnight**

- **Encounter assignment:** No class-specific rotation is documented for this class. Follow the agreed team assignments and the fight overview.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B07.3 — Legendary Hero, Paladin Chronomancer**

- **Encounter assignment:** No class-specific rotation is documented for this class. Follow the agreed team assignments and the fight overview.
- **Your role:** Coordinate healing and buffs with the team; respect healing-inversion mechanics where applicable.

**B07.4 — Legion Revenant**

- **Moon Converges:** Use Praxis and taunt on the Moon Converges cue.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B07.5 — Lord of Order**

- **Lunar Haze:** Taunt after the gaze message vanishes.
- **Your role:** Coordinate healing and buffs with the team; respect healing-inversion mechanics where applicable.

### B08 — Temple Shrine — Right

**Category:** Shrines · **Join:** `/join templeshrine` · [Wiki reference](https://aqwwiki.wikidot.com/eclipse-ascent) · [Temple Shrine](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Use the hub to enter the right shrine. LR taunts Dawn Knight after the warmth message vanishes and uses Praxis with taunt on Sun Converges. Check HP when choosing reduced-HP helms.

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Praxis | Pneuma | Lament | — | Source example |
| Verus DoomKnight | Lucky | Ravenous | Base Forge | Vainglory | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Examen | Vainglory | — | Source example |

**Selectable classes without reviewed gear:** Arachnomancer, Arcana Invoker, ArchFiend, Archivist of Time, Chaos Shaper, Dragon of Time, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legendary Hero, Legion Paladin, Lich, Light Caster, Martial Artist, Master of Moglins, Phantom Chronomancer, Quantum Chronomancer, Scion of Flames, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord.

**B08.1 — Arachnomancer, ArchFiend, Glaceran Warlord, Scion of Flames, Verus DoomKnight**

- **Survival:** Check HP when using reduced-HP helms.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B08.2 — Arcana Invoker, Archivist of Time, Chaos Shaper, Chrono ShadowHunter, Dragon of Time, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion Paladin, Lich, Light Caster, Martial Artist, Phantom Chronomancer, Quantum Chronomancer, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord**

- **Survival:** Check HP when using reduced-HP helms.
- **Your role:** Maintain damage during safe windows and follow the team’s target and mechanic calls.

**B08.3 — Legendary Hero, Lord of Order, Master of Moglins**

- **Survival:** Check HP when using reduced-HP helms.
- **Your role:** Coordinate healing and buffs with the team; respect healing-inversion mechanics where applicable.

**B08.4 — Legion Revenant**

- **Dawn Knight / Sun Converges:** Taunt after the warmth message vanishes; use Praxis with taunt on Sun Converges.
- **Survival:** Check HP when using reduced-HP helms.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

### B09 — Temple Shrine — Middle

**Category:** Shrines · **Join:** `/join templeshrine` · [Wiki reference](https://aqwwiki.wikidot.com/eclipse-ascent) · [Temple Shrine](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- AP handles Dying Light at Sunlight Gathers with skill 4; LoO handles Lunar Haze; LR handles Dawn Knight. Alternate the assigned LR/DPS taunts for Ascended Solstice and LoO/AP for Ascended Midnight. Their convergence debuffs last 15 seconds and overlapping solar/lunar effects cause severe defense loss. Follow the source rotation, not generic taunts.

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Praxis | Wizard | Lament | — | Source example |
| ArchPaladin | Lucky | Arcana Concerto | Base Forge | Vainglory | — | Source example |
| Chrono ShadowHunter | Lucky | Arcana Concerto | Base Forge | Vainglory | — | Source example |

**Selectable classes without reviewed gear:** Arachnomancer, Arcana Invoker, ArchFiend, Archivist of Time, Dragon of Time, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Infinity Knight, King's Echo, Legion Paladin, Lich, Martial Artist, Master of Moglins, Phantom Chronomancer, Quantum Chronomancer, Scion of Flames, Shaman, Verus DoomKnight.

**B09.1 — Arachnomancer, ArchFiend, Glaceran Warlord, Scion of Flames, Verus DoomKnight**

- **Encounter assignment:** No class-specific rotation is documented for this class. Follow the agreed team assignments and the fight overview.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B09.2 — Arcana Invoker, Archivist of Time, Chrono ShadowHunter, Dragon of Time, Great Thief, Guardian, Hollowborn Vindicator, Infinity Knight, King's Echo, Legion Paladin, Lich, Martial Artist, Phantom Chronomancer, Quantum Chronomancer, Shaman**

- **Ascended Solstice:** If assigned to the DPS position, alternate with Legion Revenant using Praxis.
- **Your role:** Maintain damage during safe windows and follow the team’s target and mechanic calls.

**B09.3 — ArchPaladin**

- **Dying Light:** Use skill 4 at Sunlight Gathers; alternate Ascended Midnight with Lord of Order.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B09.4 — Legion Revenant**

- **Dawn Knight:** Handle the assigned knight; alternate Ascended Solstice with the assigned DPS using Praxis.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B09.5 — Lord of Order**

- **Lunar Haze:** Handle Lunar Haze and alternate Ascended Midnight with ArchPaladin.
- **Your role:** Coordinate healing and buffs with the team; respect healing-inversion mechanics where applicable.

**B09.6 — Master of Moglins**

- **Encounter assignment:** No class-specific rotation is documented for this class. Follow the agreed team assignments and the fight overview.
- **Your role:** Coordinate healing and buffs with the team; respect healing-inversion mechanics where applicable.

### B10 — Astral Empyrean

**Category:** Shrines · **Join:** `/join astralshrine` · [Wiki reference](https://aqwwiki.wikidot.com/astral-shrine) · [Astral Shrine](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Avoid the red zone. The “Behold our starfire!” cue precedes Stardust Breath, which ignores Focus. Keep the party healthy before it; in phase 2 account for reduced incoming healing. Assigned taunters may alternate after the breath lands to redirect the following Astral Beam autos; the breath itself cannot be redirected. Avoid deaths because the boss gains stats. Warning: against Vainglory while also listing it for some classes; use a safer cape pending verification.

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Arcana Concerto | Pneuma | Lament | — | Source example |
| Verus DoomKnight | Lucky | Dauntless | Anima | Vainglory | — | WITHHELD |
| StoneCrusher | Fighter | Lacerate | Anima | Absolution | — | Source example |
| ArchFiend | Lucky | Ravenous | Base Forge | Penitence | — | Source example |
| Glaceran Warlord | Lucky | Dauntless | Anima | Vainglory | — | WITHHELD |
| Phantom Chronomancer | Lucky | Ravenous | Examen | Penitence | — | Source example |

**Selectable classes without reviewed gear:** Arachnomancer, Arcana Invoker, Archivist of Time, ArchPaladin, Chaos Shaper, Chaos Slayer, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Frostval Barbarian, Glaceran Warlord, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legendary Hero, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Master of Moglins, Paladin Chronomancer, Quantum Chronomancer, Scion of Flames, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Verus DoomKnight, Void HighLord, Yami no Ronin.

**B10.1 — Arachnomancer, ArchFiend, ArchPaladin, Glaceran Warlord, Scion of Flames**

- **Survival:** Stardust Breath deals 75% of max HP; recover before the next breath, especially after the phase-2 healing reduction. Avoid the red zone and deaths. Prefer a safer cape than Vainglory.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B10.2 — Arcana Invoker, Archivist of Time, Chaos Shaper, Chaos Slayer, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Phantom Chronomancer, Quantum Chronomancer, Sentinel, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord, Yami no Ronin**

- **Survival:** Stardust Breath deals 75% of max HP; recover before the next breath, especially after the phase-2 healing reduction. Avoid the red zone and deaths. Prefer a safer cape than Vainglory.
- **Your role:** Maintain damage during safe windows and follow the team’s target and mechanic calls.

**B10.3 — Frostval Barbarian, Legendary Hero, Lord of Order, Master of Moglins, Paladin Chronomancer**

- **Survival:** Stardust Breath deals 75% of max HP; recover before the next breath, especially after the phase-2 healing reduction. Avoid the red zone and deaths. Prefer a safer cape than Vainglory.
- **Your role:** Coordinate healing and buffs with the team; respect healing-inversion mechanics where applicable.

**B10.4 — Legion Revenant, Verus DoomKnight**

- **Astral Beam assignment:** In the documented timing example, alternate after the Starfire breath lands to intercept the following Astral Beam autos. The breath itself ignores Focus.
- **Survival:** Stardust Breath deals 75% of max HP; recover before the next breath, especially after the phase-2 healing reduction. Avoid the red zone and deaths. Prefer a safer cape than Vainglory.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

### B11 — Mechabinky & Raxborg 2.0

**Category:** Grim Challenge · **Join:** `/join grimchallenge` · [Wiki reference](https://aqwwiki.wikidot.com/grim-challenge) · [Grimchallenge](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Example strategy: assign two taunters; other players equip Vigil. At 45M stop healing during inversion; at 40M and 35M follow assigned taunts. At 30M recover after the HP drop, then expect increasing damage and dodge. At 15M coordinate Decay and mitigation. At 10M use Vigil on the cue. At 5M finish the self-destruct damage check; the wiki’s warning text and recorded charge duration differ, so do not rely on an exact timer.

| Class | Armor/base | Weapon | Helm | Cape | Active | Display status |
| --- | --- | --- | --- | --- | --- | --- |
| Lord of Order | Lucky | Awe Blast | Base Forge | Penitence | — | Source example |
| Legion Revenant | Wizard | Arcana Concerto | Wizard | Lament | — | Source example |
| Verus DoomKnight | Lucky | Dauntless | Anima | Vainglory | — | Source example |
| Legendary Hero | Lucky | Lacerate | Forge | Lament | — | Source example |
| ArchPaladin | Lucky | Praxis | Base Forge | Lament | — | Source example |
| Glaceran Warlord | Lucky | Dauntless | Anima | Penitence | — | Source example |
| Phantom Chronomancer | Lucky | Ravenous | Examen | Vainglory | — | Source example |

**Selectable classes without reviewed gear:** Arachnomancer, Arcana Invoker, ArchFiend, Archivist of Time, Chaos Shaper, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Master of Moglins, Paladin Chronomancer, Quantum Chronomancer, Scion of Flames, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord, Yami no Ronin.

**B11.1 — Arachnomancer, ArchFiend, Glaceran Warlord, Legion Revenant, Scion of Flames, Verus DoomKnight**

- **Before pulling:** Agree on two taunters; all other players equip Vigil.
- **45M / 40M / 35M:** Taunt only when assigned; stop healing during the 45M inversion.
- **15M / 10M / 5M:** Coordinate Decay and mitigation at 15M, use Vigil if assigned at 10M and finish the DPS check at 5M.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B11.2 — Arcana Invoker, Archivist of Time, Chaos Shaper, Chrono ShadowHunter, Dragon of Time, Elemental Warrior, Great Thief, Guardian, Hollowborn Vindicator, Immortal DarkCaster, Infinity Knight, King's Echo, Legion DoomKnight, Legion Paladin, Lich, Light Caster, Martial Artist, Phantom Chronomancer, Quantum Chronomancer, Shaman, Timeless DarkCaster, Ultra OmniKnight, Unundead Goat, Void HighLord, Yami no Ronin**

- **Before pulling:** Agree on two taunters; all other players equip Vigil.
- **45M / 40M / 35M:** Taunt only when assigned; stop healing during the 45M inversion.
- **15M / 10M / 5M:** Coordinate Decay and mitigation at 15M, use Vigil if assigned at 10M and finish the DPS check at 5M.
- **Your role:** Maintain damage during safe windows and follow the team’s target and mechanic calls.

**B11.3 — ArchPaladin**

- **Before pulling:** Agree on two taunters; all other players equip Vigil.
- **45M / 40M / 35M:** Taunt only when assigned; stop healing during the 45M inversion.
- **30M HP:** Heal after HP drops to 1.
- **15M / 10M / 5M:** Coordinate Decay and mitigation at 15M, use Vigil if assigned at 10M and finish the DPS check at 5M.
- **Your role:** Maintain your assigned buffs and debuffs; only take taunts agreed by the team.

**B11.4 — Legendary Hero, Lord of Order, Master of Moglins, Paladin Chronomancer**

- **Before pulling:** Agree on two taunters; all other players equip Vigil.
- **45M / 40M / 35M:** Taunt only when assigned; stop healing during the 45M inversion.
- **30M HP:** Heal after HP drops to 1.
- **15M / 10M / 5M:** Coordinate Decay and mitigation at 15M, use Vigil if assigned at 10M and finish the DPS check at 5M.
- **Your role:** Coordinate healing and buffs with the team; respect healing-inversion mechanics where applicable.

### B12 — Celestial Arena

**Category:** Solo arenas · **Join:** `/join celestialarena` · [Wiki reference](https://aqwwiki.wikidot.com/celestial-arena) · [Celestial Arena](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Solo quest sequence. Bring Awe enhancements and a class with reliable sustain, such as Master Ranger, StoneCrusher or Legion DoomKnight. Accept the corresponding quest before entering the arena.

**Community class candidates:** Master Ranger, StoneCrusher, Legion DoomKnight, Rogue, Dragonslayer, Dragonslayer General, ArchFiend.

**Premium class candidates:** Sentinel, Legendary Hero, Chrono ShadowSlayer, Phantom Chronomancer, Elemental Warrior, Other Chronomancers.

**Selectable classes without reviewed gear:** ArchFiend, Chrono ShadowSlayer, Dragonslayer, Dragonslayer General, Elemental Warrior, Legendary Hero, Legion DoomKnight, Master Ranger, Other Chronomancers, Phantom Chronomancer, Rogue, Sentinel, StoneCrusher.

**B12.1 — ArchFiend, Chrono ShadowSlayer, Dragonslayer, Dragonslayer General, Elemental Warrior, Legendary Hero, Legion DoomKnight, Master Ranger, Other Chronomancers, Phantom Chronomancer, Rogue, Sentinel, StoneCrusher**

- **Solo encounter:** Solo quest sequence. Bring Awe enhancements and a class with reliable sustain, such as Master Ranger, StoneCrusher or Legion DoomKnight. Accept the corresponding quest before entering the arena.

### B13 — Infernal Arena — early bosses

**Category:** Solo arenas · **Join:** `/join infernalarena` · [Wiki reference](https://aqwwiki.wikidot.com/infernal-arena) · [Infernal Arena](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- For the early level 20–70 bosses, prioritize sustain with Awe enhancements; a damage-boosting weapon and Forge helm when unlocked are optional improvements.

**Community class candidates:** Master Ranger, StoneCrusher, Legion DoomKnight, Rogue, Dragonslayer, Starting Classes.

**Premium class candidates:** Sentinel, Legendary Hero, Chrono ShadowSlayer, Phantom Chronomancer, Elemental Warrior, Other Chronomancers.

**Selectable classes without reviewed gear:** Chrono ShadowSlayer, Dragonslayer, Elemental Warrior, Legendary Hero, Legion DoomKnight, Master Ranger, Other Chronomancers, Phantom Chronomancer, Rogue, Sentinel, Starting Classes, StoneCrusher.

**B13.1 — Chrono ShadowSlayer, Dragonslayer, Elemental Warrior, Legendary Hero, Legion DoomKnight, Master Ranger, Other Chronomancers, Phantom Chronomancer, Rogue, Sentinel, Starting Classes, StoneCrusher**

- **Solo encounter:** For the early level 20–70 bosses, prioritize sustain with Awe enhancements; a damage-boosting weapon and Forge helm when unlocked are optional improvements.

### B14 — Deadly Duo

**Category:** Solo arenas · **Join:** `/join infernalarena` · [Wiki reference](https://aqwwiki.wikidot.com/infernal-arena) · [Infernal Arena](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Level 75 section. The 15-second attack cycle includes a 3-second charge and a hit for 70% maximum HP. Time Decay for the boss recovery after the hit (33% maximum HP), then restore your HP. Revitalize Elixir and healing potions are community options.

**Community class candidates:** Master Ranger, StoneCrusher, Legion DoomKnight, Dragonslayer, Dragonslayer General, ArchPaladin.

**Premium class candidates:** Sentinel, Legendary Hero, Chrono ShadowSlayer, Phantom Chronomancer, Elemental Warrior, Other Chronomancers.

**Unverified community consumable examples:** Revitalize Elixir · Healing Potion · Scroll of Decay.

**Selectable classes without reviewed gear:** ArchPaladin, Chrono ShadowSlayer, Dragonslayer, Dragonslayer General, Elemental Warrior, Legendary Hero, Legion DoomKnight, Master Ranger, Other Chronomancers, Phantom Chronomancer, Sentinel, StoneCrusher.

**B14.1 — ArchPaladin, Chrono ShadowSlayer, Dragonslayer, Dragonslayer General, Elemental Warrior, Legendary Hero, Legion DoomKnight, Master Ranger, Other Chronomancers, Phantom Chronomancer, Sentinel, StoneCrusher**

- **Solo encounter:** Level 75 section. The 15-second attack cycle includes a 3-second charge and a hit for 70% maximum HP. Time Decay for the boss recovery after the hit (33% maximum HP), then restore your HP. Revitalize Elixir and healing potions are community options.
- **Consumables:** Revitalize Elixir · Healing Potion · Scroll of Decay

### B15 — Cervus Malus

**Category:** Solo arenas · **Join:** `/join infernalarena` · [Wiki reference](https://aqwwiki.wikidot.com/infernal-arena) · [Infernal Arena](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Level 80 section. Every 10 seconds, the attack removes 60% of current HP and applies healing inversion for 4 seconds. Wait for inversion to expire before healing.

**Community class candidates:** Master Ranger, ArchPaladin, Legion DoomKnight, Dragonslayer General.

**Premium class candidates:** Sentinel, Legendary Hero, Elemental Warrior, Other Chronomancers.

**Unverified community consumable examples:** Healing Potion.

**Selectable classes without reviewed gear:** ArchPaladin, Dragonslayer General, Elemental Warrior, Legendary Hero, Legion DoomKnight, Master Ranger, Other Chronomancers, Sentinel.

**B15.1 — ArchPaladin, Dragonslayer General, Elemental Warrior, Legendary Hero, Legion DoomKnight, Master Ranger, Other Chronomancers, Sentinel**

- **Solo encounter:** Level 80 section. Every 10 seconds, the attack removes 60% of current HP and applies healing inversion for 4 seconds. Wait for inversion to expire before healing.
- **Consumables:** Healing Potion

### B16 — Key of Sholemoh

**Category:** Solo arenas · **Join:** `/join infernalarena` · [Wiki reference](https://aqwwiki.wikidot.com/infernal-arena) · [Infernal Arena](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Level 85 section. Auto attacks deal 1,000 true damage every 2.5 seconds. Hyper Beam charges for 4 seconds, deals 3,000 true damage and has an 18-second cooldown. Plan HP and recovery for these fixed hits.

**Community class candidates:** Master Ranger, ArchPaladin, Legion DoomKnight, Dragonslayer General, StoneCrusher, Dragonslayer.

**Premium class candidates:** Sentinel, Legendary Hero, Elemental Warrior, Chrono ShadowSlayer, Phantom Chronomancer, Other Chronomancers.

**Unverified community consumable examples:** Revitalize Elixir · Healing Potion.

**Selectable classes without reviewed gear:** ArchPaladin, Chrono ShadowSlayer, Dragonslayer, Dragonslayer General, Elemental Warrior, Legendary Hero, Legion DoomKnight, Master Ranger, Other Chronomancers, Phantom Chronomancer, Sentinel, StoneCrusher.

**B16.1 — ArchPaladin, Chrono ShadowSlayer, Dragonslayer, Dragonslayer General, Elemental Warrior, Legendary Hero, Legion DoomKnight, Master Ranger, Other Chronomancers, Phantom Chronomancer, Sentinel, StoneCrusher**

- **Solo encounter:** Level 85 section. Auto attacks deal 1,000 true damage every 2.5 seconds. Hyper Beam charges for 4 seconds, deals 3,000 true damage and has an 18-second cooldown. Plan HP and recovery for these fixed hits.
- **Consumables:** Revitalize Elixir · Healing Potion

### B17 — Azalith's Scythe

**Category:** Solo arenas · **Join:** `/join infernalarena` · [Wiki reference](https://aqwwiki.wikidot.com/infernal-arena) · [Infernal Arena](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Level 90 section. The nuke takes 70% of current HP on a 10-second cycle. The boss has 100% dodge; use reliable-hit skills. Scroll of Chaos Fog is a community member-only option.
- Recommended: level 100, a 30%+ all-monster damage weapon, and appropriate Forge enhancements.

**Community class candidates:** Lord of Order, Void Highlord, Dragon of Time, Lich, ArchPaladin, Shaman.

**Premium class candidates:** Sentinel, Elemental Warrior, Dragon Knight.

**Unverified community consumable examples:** Healing Potion · Scroll of Chaos Fog (member).

**Selectable classes without reviewed gear:** ArchPaladin, Dragon Knight, Dragon of Time, Elemental Warrior, Lich, Lord of Order, Sentinel, Shaman, Void Highlord.

**B17.1 — ArchPaladin, Dragon Knight, Dragon of Time, Elemental Warrior, Lich, Lord of Order, Sentinel, Shaman, Void Highlord**

- **Solo encounter:** Level 90 section. The nuke takes 70% of current HP on a 10-second cycle. The boss has 100% dodge; use reliable-hit skills. Scroll of Chaos Fog is a community member-only option.
- **Solo encounter:** Workbook suggests level 100, a 30%+ all-monster damage weapon, and appropriate Forge enhancements.
- **Consumables:** Healing Potion · Scroll of Chaos Fog (member)

### B18 — Na'al

**Category:** Solo arenas · **Join:** `/join infernalarena` · [Wiki reference](https://aqwwiki.wikidot.com/infernal-arena) · [Infernal Arena](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Level 95 section. Opening vulnerability lasts 12 seconds. Veni applies damage over time; Vidi follows after 3 seconds, then Vici 4 seconds later deals 70% maximum HP and opens a 4-second vulnerability. Prepare mitigation and sustain before the sequence; use the openings for damage.
- Recommended: level 100, a 30%+ all-monster damage weapon, and appropriate Forge enhancements.

**Community class candidates:** Lord of Order, Void Highlord, King's Echo, Legion DoomKnight, Legion Revenant, Hollowborn Vindicator, ArchPaladin.

**Premium class candidates:** Sentinel, Chrono ShadowSlayer, Phantom Chronomancer, Dragon Knight, Infinity Knight.

**Unverified community consumable examples:** Barrier Potion · Revitalize Elixir.

**Selectable classes without reviewed gear:** ArchPaladin, Chrono ShadowSlayer, Dragon Knight, Hollowborn Vindicator, Infinity Knight, King's Echo, Legion DoomKnight, Legion Revenant, Lord of Order, Phantom Chronomancer, Sentinel, Void Highlord.

**B18.1 — ArchPaladin, Chrono ShadowSlayer, Dragon Knight, Hollowborn Vindicator, Infinity Knight, King's Echo, Legion DoomKnight, Legion Revenant, Lord of Order, Phantom Chronomancer, Sentinel, Void Highlord**

- **Solo encounter:** Level 95 section. Opening vulnerability lasts 12 seconds. Veni applies damage over time; Vidi follows after 3 seconds, then Vici 4 seconds later deals 70% maximum HP and opens a 4-second vulnerability. Prepare mitigation and sustain before the sequence; use the openings for damage.
- **Solo encounter:** Workbook suggests level 100, a 30%+ all-monster damage weapon, and appropriate Forge enhancements.
- **Consumables:** Barrier Potion · Revitalize Elixir

### B19 — Grimskull?

**Category:** Grim Gaol · **Join:** `/join gaolcell` · [Wiki reference](https://aqwwiki.wikidot.com/the-gaol-of-eternal-torment-and-misery) · [Grim Gaol](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- 10k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- On the punching-bag cue, stop attacking for seven seconds unless you can finish safely within the window. Lich and King’s Echo are recommended.

**Community class candidates:** Dragon of Time, Chaos Avenger, King's Echo, Hollowborn Vindicator, Verus DoomKnight, Void Highlord, Lich.

**Premium class candidates:** Sentinel, Chrono ShadowSlayer, Phantom Chronomancer, Dragon Knight, Infinity Knight, Elemental Warrior, Legendary Hero.

**Unverified community consumable examples:** Barrier Potion.

**Selectable classes without reviewed gear:** Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Legendary Hero, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord.

**B19.1 — Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Legendary Hero, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord**

- **Solo encounter:** 10k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- **Solo encounter:** On the punching-bag cue, stop attacking for seven seconds unless you can finish safely within the window. Lich and King’s Echo are recommended.
- **Consumables:** Barrier Potion

### B20 — Grim Bomb

**Category:** Grim Gaol · **Join:** `/join gaolcell` · [Wiki reference](https://aqwwiki.wikidot.com/the-gaol-of-eternal-torment-and-misery) · [Grim Gaol](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- 50k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- Defeat all three bombs within one minute.

**Community class candidates:** Dragon of Time, Chaos Avenger, King's Echo, Hollowborn Vindicator, Verus DoomKnight, Void Highlord, Lich.

**Premium class candidates:** Sentinel, Chrono ShadowSlayer, Phantom Chronomancer, Dragon Knight, Infinity Knight, Elemental Warrior, Legendary Hero.

**Unverified community consumable examples:** Felicitous Philtre.

**Selectable classes without reviewed gear:** Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Legendary Hero, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord.

**B20.1 — Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Legendary Hero, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord**

- **Solo encounter:** 50k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- **Solo encounter:** Defeat all three bombs within one minute.
- **Consumables:** Felicitous Philtre

### B21 — Empress Angler

**Category:** Grim Gaol · **Join:** `/join gaolcell` · [Wiki reference](https://aqwwiki.wikidot.com/the-gaol-of-eternal-torment-and-misery) · [Grim Gaol](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- 50k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- Restore full HP at the Heal up cue. Health Vamp can help maintain health.

**Community class candidates:** Dragon of Time, Chaos Avenger, King's Echo, Hollowborn Vindicator, Verus DoomKnight, Void Highlord, Lich.

**Premium class candidates:** Sentinel, Chrono ShadowSlayer, Phantom Chronomancer, Dragon Knight, Infinity Knight, Elemental Warrior, Legendary Hero.

**Unverified community consumable examples:** Revitalize Elixir · Health Potion.

**Selectable classes without reviewed gear:** Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Legendary Hero, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord.

**B21.1 — Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Legendary Hero, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord**

- **Solo encounter:** 50k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- **Solo encounter:** Restore full HP at the Heal up cue. Health Vamp can help maintain health.
- **Consumables:** Revitalize Elixir · Health Potion

### B22 — Treasure Chest — first

**Category:** Grim Gaol · **Join:** `/join gaolcell` · [Wiki reference](https://aqwwiki.wikidot.com/the-gaol-of-eternal-torment-and-misery) · [Grim Gaol](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- 5k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- Clear the chest and proceed.

**Community class candidates:** Dragon of Time, Chaos Avenger, King's Echo, Hollowborn Vindicator, Verus DoomKnight, Void Highlord, Lich.

**Premium class candidates:** Sentinel, Chrono ShadowSlayer, Phantom Chronomancer, Dragon Knight, Infinity Knight, Elemental Warrior, Legendary Hero.

**Selectable classes without reviewed gear:** Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Legendary Hero, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord.

**B22.1 — Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Legendary Hero, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord**

- **Solo encounter:** 5k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- **Solo encounter:** Clear the chest and proceed.

### B23 — Reinforced Shelleton

**Category:** Grim Gaol · **Join:** `/join gaolcell` · [Wiki reference](https://aqwwiki.wikidot.com/the-gaol-of-eternal-torment-and-misery) · [Grim Gaol](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- Damage reduction mechanic; numerical cap not confirmed. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- Survive until the Shelleton crashes (15% chance following the August 2026 balance change). It is vulnerable for 6 seconds after the crash; player stuns do not trigger this window. Use sustain.

**Community class candidates:** Dragon of Time, ArchMage, Blaze Binder.

**Premium class candidates:** Dragon Knight, Infinity Knight.

**Unverified community consumable examples:** Revitalize Elixir · Health Potion / Potent Honor Potion.

**Selectable classes without reviewed gear:** ArchMage, Blaze Binder, Dragon Knight, Dragon of Time, Infinity Knight.

**B23.1 — ArchMage, Blaze Binder, Dragon Knight, Dragon of Time, Infinity Knight**

- **Solo encounter:** Damage reduction mechanic; numerical cap not confirmed. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- **Solo encounter:** Survive until the Shelleton crashes (15% chance following the August 2026 balance change). It is vulnerable for 6 seconds after the crash; player stuns do not trigger this window. Use sustain.
- **Consumables:** Revitalize Elixir · Health Potion / Potent Honor Potion

### B24 — Fell Statue

**Category:** Grim Gaol · **Join:** `/join gaolcell` · [Wiki reference](https://aqwwiki.wikidot.com/the-gaol-of-eternal-torment-and-misery) · [Grim Gaol](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- 1k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- Damage is capped at 1,000 per hit. Each 5,000 HP lost increases the statue’s critical damage by 200% for 5 seconds, stacking. Rotate targets or pause to let stacks expire.

**Community class candidates:** StoneCrusher, Dragon of Time, Hollowborn Vindicator, Verus DoomKnight, Void Highlord, ArchMage.

**Premium class candidates:** Dragon Knight, Infinity Knight, Phantom Chronomancer, Chrono ShadowSlayer.

**Unverified community consumable examples:** Revitalize Elixir · Health Potion.

**Selectable classes without reviewed gear:** ArchMage, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Hollowborn Vindicator, Infinity Knight, Phantom Chronomancer, StoneCrusher, Verus DoomKnight, Void Highlord.

**B24.1 — ArchMage, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Hollowborn Vindicator, Infinity Knight, Phantom Chronomancer, StoneCrusher, Verus DoomKnight, Void Highlord**

- **Solo encounter:** 1k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- **Solo encounter:** Damage is capped at 1,000 per hit. Each 5,000 HP lost increases the statue’s critical damage by 200% for 5 seconds, stacking. Rotate targets or pause to let stacks expire.
- **Consumables:** Revitalize Elixir · Health Potion

### B25 — Emperor Angler

**Category:** Grim Gaol · **Join:** `/join gaolcell` · [Wiki reference](https://aqwwiki.wikidot.com/the-gaol-of-eternal-torment-and-misery) · [Grim Gaol](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- 50k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- At 80%, 60%, 40% and 20% boss HP, Feeding Frenzy hits for 60% of your maximum HP, then lasts 10 seconds: any subsequent attack kills you if below half HP. Recover promptly. Fish Breath is a separate 40%-max-HP attack with 75% incoming-healing reduction for 12 seconds.

**Community class candidates:** Dragon of Time, Chaos Avenger, King's Echo, Hollowborn Vindicator, Verus DoomKnight, Void Highlord, Lich.

**Premium class candidates:** Sentinel, Chrono ShadowSlayer, Phantom Chronomancer, Dragon Knight, Infinity Knight, Elemental Warrior, Legendary Hero.

**Unverified community consumable examples:** Revitalize Elixir · Health Potion.

**Selectable classes without reviewed gear:** Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Legendary Hero, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord.

**B25.1 — Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Legendary Hero, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord**

- **Solo encounter:** 50k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- **Solo encounter:** At 80%, 60%, 40% and 20% boss HP, Feeding Frenzy hits for 60% of your maximum HP, then lasts 10 seconds: any subsequent attack kills you if below half HP. Recover promptly. Fish Breath is a separate 40%-max-HP attack with 75% incoming-healing reduction for 12 seconds.
- **Consumables:** Revitalize Elixir · Health Potion

### B26 — Treasure Chest — second

**Category:** Grim Gaol · **Join:** `/join gaolcell` · [Wiki reference](https://aqwwiki.wikidot.com/the-gaol-of-eternal-torment-and-misery) · [Grim Gaol](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- 5k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- Unlike the first chest, this one attacks for 75% of maximum HP every 10 seconds and stuns for 2 seconds. Enter with enough HP and recover between attacks.

**Community class candidates:** Dragon of Time, Chaos Avenger, King's Echo, Hollowborn Vindicator, Verus DoomKnight, Void Highlord, Lich.

**Premium class candidates:** Sentinel, Chrono ShadowSlayer, Phantom Chronomancer, Dragon Knight, Infinity Knight, Elemental Warrior, Legendary Hero.

**Selectable classes without reviewed gear:** Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Legendary Hero, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord.

**B26.1 — Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Legendary Hero, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord**

- **Solo encounter:** 5k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- **Solo encounter:** Unlike the first chest, this one attacks for 75% of maximum HP every 10 seconds and stuns for 2 seconds. Enter with enough HP and recover between attacks.

### B27 — Rick, Grim Soldier

**Category:** Grim Gaol · **Join:** `/join gaolcell` · [Wiki reference](https://aqwwiki.wikidot.com/the-gaol-of-eternal-torment-and-misery) · [Grim Gaol](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- 50k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- Rick can recover up to 90% maximum HP and gain major critical chance and resistance buffs. Prepare for recovery cycles rather than assuming a simple DPS check.

**Community class candidates:** Dragon of Time, Chaos Avenger, King's Echo, Hollowborn Vindicator, Verus DoomKnight, Void Highlord, Lich.

**Premium class candidates:** Sentinel, Chrono ShadowSlayer, Phantom Chronomancer, Dragon Knight, Infinity Knight, Elemental Warrior, Legendary Hero.

**Unverified community consumable examples:** Revitalize Elixir · Health Potion.

**Selectable classes without reviewed gear:** Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Legendary Hero, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord.

**B27.1 — Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Legendary Hero, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord**

- **Solo encounter:** 50k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- **Solo encounter:** Rick can recover up to 90% maximum HP and gain major critical chance and resistance buffs. Prepare for recovery cycles rather than assuming a simple DPS check.
- **Consumables:** Revitalize Elixir · Health Potion

### B28 — Rampaging Cyborg

**Category:** Grim Gaol · **Join:** `/join gaolcell` · [Wiki reference](https://aqwwiki.wikidot.com/the-gaol-of-eternal-torment-and-misery) · [Grim Gaol](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- 50k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- The Cyborg is invulnerable until all three Mechro Liches die. Killing a Lich triggers stacking critical damage on the Cyborg; use sustain while clearing summons.

**Community class candidates:** Dragon of Time, Hollowborn Vindicator, Verus DoomKnight, Void Highlord, ArchMage.

**Premium class candidates:** Sentinel, Chrono ShadowSlayer, Phantom Chronomancer, Dragon Knight, Infinity Knight.

**Unverified community consumable examples:** Revitalize Elixir · Damage potions.

**Selectable classes without reviewed gear:** ArchMage, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Hollowborn Vindicator, Infinity Knight, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord.

**B28.1 — ArchMage, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Hollowborn Vindicator, Infinity Knight, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord**

- **Solo encounter:** 50k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- **Solo encounter:** The Cyborg is invulnerable until all three Mechro Liches die. Killing a Lich triggers stacking critical damage on the Cyborg; use sustain while clearing summons.
- **Consumables:** Revitalize Elixir · Damage potions

### B29 — Mechabinky & Raxborg

**Category:** Grim Gaol · **Join:** `/join gaolcell` · [Wiki reference](https://aqwwiki.wikidot.com/the-gaol-of-eternal-torment-and-misery) · [Grim Gaol](https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit)

**Fight at a glance:**

- 50k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- At 90% HP, Contrarium deals 60% current HP and inverts healing by 200% for 4 seconds. Avoid healing until it expires. Devour was removed by the August 2026 balance patch.

**Community class candidates:** Dragon of Time, Hollowborn Vindicator, Verus DoomKnight, Void Highlord, Lich, Chaos Avenger, King's Echo.

**Premium class candidates:** Sentinel, Chrono ShadowSlayer, Phantom Chronomancer, Dragon Knight, Infinity Knight, Elemental Warrior.

**Unverified community consumable examples:** Damage potions.

**Selectable classes without reviewed gear:** Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord.

**B29.1 — Chaos Avenger, Chrono ShadowSlayer, Dragon Knight, Dragon of Time, Elemental Warrior, Hollowborn Vindicator, Infinity Knight, King's Echo, Lich, Phantom Chronomancer, Sentinel, Verus DoomKnight, Void Highlord**

- **Solo encounter:** 50k boss shield. Enter the solo dungeon through the Gaol Cell portal (/join gaolcell); leaving resets progress.
- **Solo encounter:** At 90% HP, Contrarium deals 60% current HP and inverts healing by 200% for 4 seconds. Avoid healing until it expires. Devour was removed by the August 2026 balance patch.
- **Consumables:** Damage potions

## 4. Catalog-only encounters

11 existing records, no approved strategy or gear. Please confirm identity, map access, seasonal/member conditions and whether a full guide is useful. Do not read the catalog entry as a fight recommendation.

| ID | Encounter | Map command | Access note | Source |
| --- | --- | --- | --- | --- |
| L01 | Ultra Alteon | /join ultraalteon | Location contains the rebalanced Ultra Chaos Alteon; 6-player room. | [Wiki](https://aqwwiki.wikidot.com/ultra-alteon-location) |
| L02 | Ultra Brutalcorn | /join ultrabrutalcorn | Dedicated location contains SMU BrutalCorn; distinct from the Underground Lab B monster. | [Wiki](https://aqwwiki.wikidot.com/ultra-brutalcorn-location) |
| L03 | Ultra Carnax | /join ultracarnax | Legend access required; check quest prerequisites. | [Wiki](https://aqwwiki.wikidot.com/ultra-carnax) |
| L04 | Ultra Chairman | /join ultrachairman | Rare member-only location; normal access not confirmed. | [Wiki](https://aqwwiki.wikidot.com/ultra-chairman) |
| L05 | Ultra Dreadfight | /join ultradread | Legacy location; access not independently confirmed. Do not confuse with /join dreadfight. | [Wiki](https://aqwwiki.wikidot.com/ultra-dreadfight) |
| L06 | Ultra Franken | /join ultrafranken | Seasonal Legend location; availability is not guaranteed. | [Wiki](https://aqwwiki.wikidot.com/ultra-franken) |
| L07 | Ultra Frostfang | /join ultrafrostfang | Seasonal Frostval location; availability varies. | [Wiki](https://aqwwiki.wikidot.com/ultra-frostfang) |
| L08 | Ultra Iara | /join ultraiara | Seasonal Talk Like a Pirate Day location; check availability. | [Wiki](https://aqwwiki.wikidot.com/ultra-iara-location) |
| L09 | Ultra Kala | /join ultrakala | Seasonal location; check event calendar. | [Wiki](https://aqwwiki.wikidot.com/ultra-kala) |
| L10 | Ultra Phedra | /join ultraphedra | Access not independently confirmed | [Wiki](https://aqwwiki.wikidot.com/ultra-phedra-monster) |
| L11 | Ultra Lionfang | /join ultralionfang | Legend access required; check quest prerequisites. | [Wiki](https://aqwwiki.wikidot.com/ultra-lionfang-location) |

## 5. Ultra Speaker timing charts

Six source-transcribed charts; 141 event/role/skill positions matched to the original sheet in the earlier audit. Blank role = no explicit assigned taunt, not a random player. Never combine charts. Experts: verify the actual mechanic timing, whether the chart matches the roster, and whether a DPS taunt skill is required.

### S01 — 3-man taunt

DPS can use damage potions; agree the LoO/LR/AP rotation in advance.

| Step | Event | Assigned role | Skill / mitigation |
| --- | --- | --- | --- |
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

### S02 — 4-man Mole

All four players participate in the taunts, including DPS.

| Step | Event | Assigned role | Skill / mitigation |
| --- | --- | --- | --- |
| 1 | Truth | LR | — |
| 2 | Listen | LoO | — |
| 3 | Zone 1 | DPS | — |
| 4 | Truth | AP | AP 4 |
| 5 | Listen | DPS | — |
| 6 | Truth | — | LoO 5 |
| 7 | Zone 2 | LR | — |
| 8 | Listen | — | — |
| 9 | Truth | — | AP 4 |
| 10 | Truth | LoO | — |
| 11 | Listen | — | — |
| 12 | Zone 3 | AP | — |
| 13 | Truth | — | AP 4 |
| 14 | Listen | DPS | — |
| 15 | Truth | — | LoO 5 |
| 16 | Zone 4 | LoO | — |
| 17 | Listen | LR | — |
| 18 | Truth | — | AP 4 |
| 19 | Truth | LoO | — |
| 20 | Listen | — | — |

### S03 — 2-man taunt

Higher risk. AP and DPS use damage potions; agree this variant before pulling.

| Step | Event | Assigned role | Skill / mitigation |
| --- | --- | --- | --- |
| 1 | Truth | LoO | — |
| 2 | Listen | — | — |
| 3 | Zone 1 | LR | — |
| 4 | Truth | — | — |
| 5 | Listen | LoO | AP 4 |
| 6 | Truth | LR | Praxis |
| 7 | Zone 2 | LoO | — |
| 8 | Listen | LR | — |
| 9 | Truth | — | AP 4 |
| 10 | Truth | LoO | — |
| 11 | Listen | — | — |
| 12 | Zone 3 | DPS | — |
| 13 | Truth | LR | — |
| 14 | Listen | LoO | AP 4 |
| 15 | Truth | LR | Praxis |
| 16 | Zone 4 | AP | — |
| 17 | Listen | LoO | — |
| 18 | Truth | — | AP 4 |
| 19 | Truth | LoO | Praxis |
| 20 | Listen | — | — |

### S04 — 3-man with DPS taunt skill

DPS must have its own taunt skill; AP uses Praxis in this example.

| Step | Event | Assigned role | Skill / mitigation |
| --- | --- | --- | --- |
| 1 | Truth | LR | — |
| 2 | Listen | LoO | — |
| 3 | Zone 1 | DPS | — |
| 4 | Truth | — | AP 4 |
| 5 | Listen | LoO | LoO 5 |
| 6 | Truth | — | — |
| 7 | Zone 2 | LR | — |
| 8 | Listen | — | — |
| 9 | Truth | — | AP 4 |
| 10 | Truth | LoO | — |
| 11 | Listen | — | — |
| 12 | Zone 3 | AP | — |
| 13 | Truth | DPS | AP 4 |
| 14 | Listen | LR | — |
| 15 | Truth | — | LoO 5 |
| 16 | Zone 4 | LoO | — |
| 17 | Listen | — | — |
| 18 | Truth | — | AP 4 |
| 19 | Truth | LR | — |
| 20 | Listen | LoO | — |

### S05 — 3-man Mole — detailed heal and Seal timing

Requires LR, LoO, AP and DPS. Use the detailed healing and mitigation schedule as one complete strategy, not combined with the shorter chart.

| Step | Event | Assigned role | Skill / mitigation |
| --- | --- | --- | --- |
| 1 | Start | — | Seal |
| 2 | Truth | LR | — |
| 3 | Listen | LoO | Broken Seal |
| 4 | Zone 1 | DPS | Seal |
| 5 | Truth | AP | AP heal |
| 6 | Auto | — | LoO heal · Broken Seal |
| 7 | Listen | LoO | — |
| 8 | Truth | — | Seal |
| 9 | Auto | — | AP heal |
| 10 | Auto | — | LoO heal · Broken Seal |
| 11 | Zone 2 | LR | — |
| 12 | Listen | — | — |
| 13 | Truth | — | — |
| 14 | Auto | — | AP heal · Seal |
| 15 | Auto | — | LoO heal · Quix |
| 16 | Truth | LoO | Broken Seal |
| 17 | Listen | — | — |
| 18 | Zone 3 | AP | Seal |
| 19 | Truth | — | — |
| 20 | Auto | — | AP heal · Broken Seal |
| 21 | Listen | LR | LoO heal |
| 22 | Truth | — | Seal |
| 23 | Auto | — | AP heal |
| 24 | Auto | — | LoO heal · Broken Seal |
| 25 | Zone 4 | LoO | LoO heal |
| 26 | Listen | LoO | — |
| 27 | Truth | — | — |
| 28 | Auto | — | AP heal · Seal |
| 29 | Auto | — | LoO heal · Quix |
| 30 | Truth | LR | Broken Seal |
| 31 | Listen | LoO | — |

### S06 — Glaceran Warlord variant

Advanced GW + LR + LoO + DPS strategy. This chart replaces AP with Glaceran Warlord; verify your exact team and healing timing before use.

| Step | Event | Assigned role | Skill / mitigation |
| --- | --- | --- | --- |
| 1 | Truth | LR | GW heal |
| 2 | Listen | LoO | — |
| 3 | Zone 1 | DPS | — |
| 4 | Truth | GW | GW heal |
| 5 | Auto | — | LoO heal |
| 6 | Listen | LoO | — |
| 7 | Truth | — | GW heal |
| 8 | Auto | — | — |
| 9 | Auto | — | LoO heal |
| 10 | Zone 2 | LR | GW heal |
| 11 | Listen | — | — |
| 12 | Truth | — | — |
| 13 | Auto | — | GW heal |
| 14 | Auto | — | LoO heal |
| 15 | Truth | LoO | Quix |
| 16 | Listen | — | — |
| 17 | Zone 3 | GW | — |
| 18 | Truth | — | — |
| 19 | Auto | — | LoO heal |
| 20 | Listen | LR | — |
| 21 | Truth | — | GW heal |
| 22 | Auto | — | LoO heal |
| 23 | Auto | — | GW heal |
| 24 | Zone 4 | LoO | LoO heal |
| 25 | Listen | LoO | — |
| 26 | Truth | — | — |
| 27 | Auto | — | GW heal |
| 28 | Auto | — | LoO heal |
| 29 | Truth | LR | Quix |
| 30 | Listen | LoO | — |

## 6. Forge and Awe

### Forge Tracker requirements (all entries)

| ID | Slot | Enhancement | Unlock requirements | Summary |
| --- | --- | --- | --- | --- |
| F01 | Weapon | Forge | Level 30 · Blacksmithing Rank 4 · Escherion quest | Base Forge weapon enhancement |
| F02 | Weapon | Lacerate | Level 40 · Blacksmithing Rank 5 · Hit Job quest | Additional physical damage and hit utility |
| F03 | Weapon | Smite | Level 60 · Blacksmithing Rank 6 · Star Light, Star Bright | Extra damage from your fifth skill |
| F04 | Weapon | Praxis | Level 60 · Blacksmithing Rank 6 · Defeat Jaaku! | Damage that builds on sustained targets |
| F05 | Weapon | Acheron | Level 80 · Blacksmithing Rank 8 · Avatar of Fire · Void Lodestone | High-risk damage with a self-DoT |
| F06 | Weapon | Valiance | Level 100 · Blacksmithing Rank 10 · The Final Challenge; Fire Champion’s Armor, Dragon of Time, Drakath the Eternal and Eternity Blade in inventory | General-purpose core-stat buff |
| F07 | Weapon | Elysium | Level 100 · Blacksmithing Rank 10 · Awe-scention; 15 Bones from the Void Realm, 3 Archfiend Essence Fragments, The Divine Will, Blademaster Sword Scroll | Mana support and magic damage |
| F08 | Weapon | Arcana's Concerto | Level 100 · Blacksmithing Rank 10 · Darkon, the Conductor; Prince Darkon’s Poleaxe and Darkon’s Debris 2 (Reconstructed); 5 Drago and 5 Darkon insignias | Teamwide target damage debuff |
| F09 | Weapon | Dauntless | Level 100 · Blacksmithing Rank 10 · Build Malgor’s Armor Set OR Malgor, The First Speaker; Infernal Flame Pyromancer, Malgor’s ShadowFlame Blade, Malgor the ShadowLord, ShadowLord’s Helm; 5 Malgor and 10 Tyndarius insignias | High physical burst with healing penalty |
| F10 | Weapon | Ravenous | Level 100 · The Fiend Shard's Finale | Damage against lower-HP targets |
| F11 | Cape | Forge | Level 30 · Blacksmithing Rank 4 · Defeat Kitsune quest | Base Forge cape enhancement |
| F12 | Cape | Absolution | Level 90 · Blacksmithing Rank 9 · Ascended Paladin and Ascended Paladin Sword | Boosts healing output |
| F13 | Cape | Vainglory | Level 90 · Blacksmithing Rank 9 · after Absolution; five Armor of Awe relics | More damage at the cost of healing |
| F14 | Cape | Avarice | Level 90 · Blacksmithing Rank 9 · after Vainglory; 50 Indulgence and 50 Penance | More haste at a defensive cost |
| F15 | Cape | Penitence | Level 90 · Blacksmithing Rank 9 · after Avarice; Night Mare Scythe, 100 Sapphire Orbs, Boreal Cavalier Bardiche, 13 Void Scales | Damage resistance and DoT trade-off |
| F16 | Cape | Lament | Level 90 · Blacksmithing Rank 9 · after Penitence; Doom Heart, Heart of the Sun, 10 Flame Hearts, 3 Bloodless Hearts | Critical chance with lower haste |
| F17 | Helm | Forge | Level 30 · Blacksmithing Rank 4 · four Chaos Lord weapons | Base Forge helm enhancement |
| F18 | Helm | Vim | Level 70 · Blacksmithing Rank 7 · Rogue Rank 10 in inventory · 250 Ethereal Essence · after Forge Helm | Dexterity and mana-cost efficiency |
| F19 | Helm | Examen | Level 70 · Blacksmithing Rank 7 · Healer Rank 10 in inventory · 250 Ethereal Essence · after Vim | Wisdom and mana-cost efficiency |
| F20 | Helm | Anima | Level 70 · Blacksmithing Rank 7 · Warrior Rank 10 in inventory · 650 Ethereal Essence · after Examen | Physical offense with lower HP |
| F21 | Helm | Pneuma | Level 70 · Blacksmithing Rank 7 · Mage Rank 10 in inventory · 650 Ethereal Essence · after Anima | Magic offense with lower HP |
| F22 | Helm | Hearty | Level 80+ · Rank 7 Grimskull Trolling · complete the Gaol · Cashfear Shop | High END at the cost of other core stats |

Sources: [Cysero quests](https://aqwwiki.wikidot.com/cysero-s-forge-s-quests) · [Forge helmets](https://aqwwiki.wikidot.com/forge-helmet-enhancements) · [Cashfear shop](https://aqwwiki.wikidot.com/cashfear-s-shop).

### Effects currently in the class planner

| Trait | Current description |
| --- | --- |
| Lucky | Raises Luck; exact stat effects depend on class and enhancement level. |
| Wizard | Adds Intellect and spell-oriented stats; the exact bonus depends on level. |
| Fighter | Adds Strength and Endurance; the exact bonus depends on level. |
| Healer | Adds health and healing-oriented stats; the exact bonus depends on level. |
| Forge | Base Forge pattern; no special trait. The stats depend on the equipment slot and enhancement level. |
| Awe Blast | 30% auto-attack proc: 100% hybrid damage; enemy -15% Crit Chance and -15% Defense for 10s. |
| Spiral Carve | 15% auto-attack proc: 200% hybrid damage; +25% Crit Chance for 10s. |
| Mana Vamp | 80% auto-attack proc: 50% true hybrid damage and +10 mana. |
| Health Vamp | 50% auto-attack proc: 80% hybrid true damage; heal based on 125% of the pre-stat base damage. |
| Powerword Die | 0.3% auto-attack proc: 999,999 true damage before encounter-specific limitations. |
| Lacerate | Skill 2 (2s cooldown): 80% physical damage, always hits and crits; enemy Dodge, Hit and Haste reduced by 10% for 15s. |
| Valiance | Auto-attack proc (15s cooldown): +30% STR/DEX/INT/WIS/END and +15% Luck for 20s; multiplicative with other core-stat increases. |
| Dauntless | Skill 2 (3s cooldown): 190–570% physical damage, stronger at low HP, always hits and crits; lifesteal, +15% Crit Chance, +25% Haste, -50% mana costs for 12s; self-Decay for 6s. |
| Ravenous | Skill 3: 75–338% hybrid damage depending on target HP; +10% outgoing damage and +25% crit chance for 10s. Consumed reduces target damage and crit chance by 10%, plus 1% per stack up to 30%. |
| Praxis | Skill 2 (4s cooldown): 70% hybrid damage, increasing by 10% per consecutive hit to the same target; -5% target Dodge for 8s. Spinning Dragon blocks the next hit when available. |
| Smite | Skill 5 proc (15s cooldown): deals 500% hybrid damage. |
| Arcana's Concerto | 50% auto-attack proc: 50% hybrid damage and +2% physical/magical damage taken per stack (11 stacks, 22s). |
| Elysium | Skill 3: magic damage to up to two targets, stronger at low mana; Elysian stacks healing up to 3, restores 4 mana per second and grants +10% outgoing damage for 8s. The hit cannot crit. Published sources disagree on the damage coefficient; numerical value pending confirmation. |
| Acheron | Skill 3: 80% magic damage to up to 2 targets, always hits and crits; Stygian stacks up to 30, causes max-HP-based self-DoT, grants damage and hit chance, and prevents Arcane Shield/Safeguard. |
| Anima | Offensive physical Forge helm: +10% Hit Chance; boosts Strength but reduces Endurance/HP (level-dependent). |
| Pneuma | Offensive magical Forge helm: +10% Hit Chance; boosts Intellect but reduces Endurance/HP (level-dependent). |
| Vim | Forge helm: -33% mana consumption; boosts Dexterity but reduces Endurance/HP (level-dependent). |
| Examen | Forge helm: -33% mana consumption; boosts Wisdom but reduces Endurance/HP (level-dependent). |
| Hearty | Defensive helm: boosts Endurance/HP at the cost of offensive/core stats (level-dependent). |
| Absolution | Cape: +50% Heal Boost; -20% physical damage dealt. |
| Vainglory | Cape: +15% damage dealt; -50% healing received. |
| Avarice | Cape: +10% Haste; -35% Damage Resistance. |
| Penitence | Cape: +25% Damage Resistance; -25% damage-over-time damage dealt. |
| Lament | Cape: +20% Crit Chance; -5% Haste. |

**Elysium:** the [official trait guide](https://www.aq.com/lore/guides/enhancementtraits) currently gives 250–1125%, while the [original release](https://www.aq.com/gamedesignnotes/aqw-30aug22-blacksmithwarupdate-8893) and [current Wiki](https://aqwwiki.wikidot.com/forge-weapon-enhancements) give 500–2250%. The March 24, 2023 [official patch note](https://www.aq.com/gamedesignnotes/aqw-classbalance-patchnotes-8927) describes a documentation typo, not a game change; the coefficient is deliberately not asserted in the public candidate. Confirm measured or current authoritative value.

## 7. Consumable effects

Verified item descriptions are distinct from synergy. Active slot must remain available for mandatory fight consumables. The class section lists only combinations tied to an exact gear tuple. Other combinations are withheld.

| ID | Item | Effect currently shown | Source |
| --- | --- | --- | --- |
| P01 | Fate Tonic | Luck +20% for 15 min. Helps critical-focused and hybrid builds. | [Wiki](https://aqwwiki.wikidot.com/fate-tonic) |
| P02 | Sage Tonic | Intelligence +20% for 15 min. Improves magic-based damage. | [Wiki](https://aqwwiki.wikidot.com/sage-tonic) |
| P03 | Might Tonic | Strength +20% for 15 min. Useful for strength-scaling physical damage. | [Wiki](https://aqwwiki.wikidot.com/might-tonic) |
| P04 | Body Tonic | Endurance +20% for 15 min. Defensive alternative when extra HP matters. | [Wiki](https://aqwwiki.wikidot.com/body-tonic) |
| P05 | Battle Elixir | Physical damage +20% for 15 min. | [Wiki](https://aqwwiki.wikidot.com/battle-elixir) |
| P06 | Destruction Elixir | Critical damage +30% for 15 min. | [Wiki](https://aqwwiki.wikidot.com/destruction-elixir) |
| P07 | Divine Elixir | Healing potential +35% for 15 min. | [Wiki](https://aqwwiki.wikidot.com/divine-elixir) |
| P08 | Potent Battle Elixir | Physical Damage +25% for 15 min. | [Wiki](https://aqwwiki.wikidot.com/potent-battle-elixir-non-ac) |
| P09 | Potent Malevolence Elixir | Magic damage +25% for 15 min. | [Wiki](https://aqwwiki.wikidot.com/potent-malevolence-elixir) |
| P10 | Potent Honor Potion | All damage +75%; mana costs +25% for 35 sec. Cooldown: 60 sec. | [Wiki](https://aqwwiki.wikidot.com/potent-honor-potion) |
| P11 | Felicitous Philtre | Luck +50% for 45 sec. Crit-oriented alternative to Honor. | [Wiki](https://aqwwiki.wikidot.com/felicitous-philtre) |

## 8. Combat tooltips

Descriptions visible in the combat guide, including context-dependent overrides. Review skill names, effect duration and target direction. The same term can behave differently by encounter.

| Term | Current description |
| --- | --- |
| Noxious Decay | Dage reverses direct heals and healing over time for 11 seconds. Life steal still works. Do not confuse this debuff on you with Decay on the boss. |
| Decay | Blocks ordinary healing on the affected target. |
| Health Vamp | Awe weapon enhancement. Auto attacks can restore HP through life steal. |
| Dauntless | Forge weapon enhancement. Skill 2 triggers damage and life steal; temporarily blocks ordinary healing. |
| Scroll of Enrage | Consumable that forces eligible attacks onto you. Use only on your assigned taunt turn. |
| Scroll of Decay | Consumable to block the target’s ordinary healing. Coordinate with the assigned Decay player. |
| Vigil | Required consumable for Kathool: activate it at the Nightmare quote, within the 3-second charge. |
| Scroll of Life Steal | Consumable used for sustain through life steal instead of ordinary healing. |
| Overfiend Blade | Nulgath’s sword. Its lethal charge lasts 5 seconds. It respawns after 15 seconds; every kill gives Nulgath a stacking damage buff. |
| Essence Gathered | Each sword death gives Nulgath +50% outgoing and +50% physical damage, stacking without a limit. |
| Contracts of the Abyss | Every 7 seconds Nulgath attempts a party-wide debuff. Alternate assigned taunters to avoid consecutive escalating Contracts. |
| Counter Attack | Damage reflection. Stop attacking until the effect ends. |
| Elegy | Darkon’s attack; consecutive taunts on the same player are dangerous. Alternate assigned taunters. |
| Vendetta | Gramiel’s stacking debuff. Follow the agreed taunt rotation; five stacks cause death when Grace Unleashed lands. |
| Magia Burn | Speaker debuff: do not enter a Zone while affected. |
| Stasis | Speaker petrification effect. Stay out of Zones while affected. |
| Sanctity | Speaker debuff: do not enter another Zone while affected. |
| Truth | Speaker attack that must follow the agreed taunt and mitigation rotation. |
| Listen | Speaker petrification attack. Only the assigned player intercepts it. |
| Zone | A marked area of the battlefield used for a special mechanic. |
| HoT | Healing over time; repeated healing ticks. |
| HoTs | Healing over time; repeated healing ticks. |
| DPS | Damage per second; the damage-dealing role. |
| Life steal | Restores health from damage dealt; not the same as ordinary healing. |
| lifesteal | Restores health from damage dealt; not the same as ordinary healing. |
| Flux | Chaos Avenger skill 3; applies Focus for taunting. Use at the assigned timing. |
| Atramentous Shade | Legion Revenant skill 2; applies a short Decay to enemies. |
| Imminent Doom | Legion DoomKnight skill 5; applies Decay for 10 seconds. |
| Unleash Doom | Verus DoomKnight skill 5; applies Decay for 3 seconds. |
| Soul Fracture | Verus DoomKnight skill 2; reduces enemy damage resistance. |
| Life Carve | Verus DoomKnight skill 3; drains life, but empowered version also applies healing over time. |
| Blessing of Order | Lord of Order skill 5; applies Quixotic mitigation briefly, then Stability prevents repeated application. |
| Quixotic | Brief damage suppression from Lord of Order’s Blessing of Order (5). Stability prevents immediately applying it again. |
| Righteous Seal | ArchPaladin skill 4; briefly reduces the enemy’s damage. |
| Sacred Magic: Eden | ArchPaladin skill 5; consumes Righteous Seal and applies Broken Seal. |
| Broken Seal | Damage-reduction debuff applied when Sacred Magic: Eden consumes Righteous Seal. |
| Commandment | ArchPaladin skill 2; stacks debuffs that weaken enemy damage and defenses. |
| Hymn of Light | ArchPaladin skill 3; party heal and defensive buff. Avoid during inverted healing. |
| FMJ Rounds | Chrono ShadowHunter skill 4; offensive stance and stacking enemy defense reduction. |
| Tracer Rounds | Chrono ShadowHunter skill 3; defensive stance that also applies a short heal over time. Avoid that HoT during Noxious Decay. |
| Reload | Chrono ShadowHunter skill 2; reloads ammunition and refills mana. |
| Silver Bullet | Chrono ShadowHunter skill 5; consumes rifts for burst damage, empties ammunition. Reload afterward. |
| Awe Blast | Awe weapon enhancement that applies a team-useful enemy defense debuff. |
| Mana Vamp | Awe weapon enhancement that restores mana on auto attacks. |
| Valiance | Forge weapon enhancement that increases core stats. |
| Ravenous | Forge weapon enhancement triggered by skill 3, with damage and debuff effects. |
| Praxis | Forge weapon enhancement that builds damage through repeated hits on the same target. |
| Arcana Concerto | Forge weapon enhancement that increases physical and magical damage taken by the target. Coordinate one carrier. |
| Arcana’s Concerto | Forge weapon enhancement that increases damage taken by the target. Coordinate one carrier. |
| Arcana's Concerto | Forge weapon enhancement that increases damage taken by the target. Coordinate one carrier. |
| Elysium | Forge weapon enhancement for magic damage and mana sustain. |
| Lacerate | Forge weapon enhancement triggered by skill 2; reduces enemy hit, dodge and haste. |
| Smite | Forge weapon enhancement triggered by skill 5 for extra damage. |
| Spiral Carve | Awe weapon enhancement that increases critical chance. |
| Forge | Base Forge helm has balanced stats without the special reduced-HP helm trade-off. |
| Base Forge | Base Forge helm: balanced stats without a special HP penalty. |
| Examen | Forge helm with Wisdom and lower mana costs, at the expense of Endurance. |
| Vim | Forge helm with Dexterity and lower mana costs, at the expense of Endurance. |
| Anima | Physical offensive Forge helm; reduces Endurance. |
| Pneuma | Magical offensive Forge helm; reduces Endurance. |
| Hearty | Defensive helm that prioritizes Endurance and maximum HP. |
| Penitence | Forge cape with extra damage resistance, at the cost of damage over time. |
| Vainglory | Forge cape increases damage but reduces incoming healing. |
| Absolution | Forge cape boosts healing at a physical damage cost. |
| Lament | Forge cape boosts critical chance at a haste cost. |
| Avarice | Forge cape increases haste but lowers damage resistance. |
| Lucky | Standard enhancement focused on Luck and critical performance. |
| Wizard | Standard enhancement focused on Intelligence and magic. |
| Fighter | Standard enhancement focused on Strength and Endurance. |
| Healer | Standard enhancement focused on health and healing. |

| Encounter | Term | Override |
| --- | --- | --- |
| dage | Zone | Enter the glowing blue floor platform within 3 seconds of the protection-spells quote. Follow the lit platform, not a fixed side. |
| dage | Decay | Apply this to Dage during his regeneration only if you are assigned. This is different from Noxious Decay on you. |
| dage | HoT | Healing over time. Noxious Decay turns its healing ticks into damage. |
| dage | HoTs | Healing over time. Noxious Decay turns its healing ticks into damage. |
| speaker | Zone | Enter only your assigned glowing Zone in your chosen rotation. Do not enter while affected by Magia Burn, Stasis or Sanctity. |
| gramiel | Decay | Do not apply Decay during the crystal phase; it can strengthen Gramiel. |

## 9. Specific decisions requiring expert confirmation

| ID | Decision requested |
| --- | --- |
| R01 | Great Thief: confirm solo, group, and Drakath DPS builds separately; never assign a scroll taunt by class name alone. |
| R02 | Arcana Invoker: confirm physical/magical scaling, armor base and current-patch farming, solo, Drakath and Gramiel setups. |
| R03 | Void Highlord: confirm dated solo setup vs current patch and both farming HP ranges. |
| R04 | Astral Empyrean: resolve source contradiction on Vainglory for VDK/GW. Both disputed gear presets are withheld. |
| R05 | Drakath: confirm seven taunt thresholds, 10M transformation, meteor and HP requirements; distinguish designated taunter from DPS. |
| R06 | Dage: validate inverted healing, class-specific HoTs, exact Decay coverage, lifesteal and taunt timings. |
| R07 | Nulgath: validate Contracts vs untauntable Abyssal Charge, blade charge/respawn/stack behavior. |
| R08 | Speaker: confirm each chart's roster, role/skill and timing, including the detailed Seal/Quix/GW variants. |
| R09 | Gramiel: confirm paired crystals, Decay restriction, Vendetta lethal event, threshold protection and rotation. |
| R10 | Verify the remaining solo and Shrine mechanics; especially Grimskull?, Grim Bomb and Empress Angler, where individual monster-page retrieval failed. |
| R11 | Verify catalog-only access, join commands and identity (including Ultra Phedra location vs monster); no strategy invented. |
| R12 | Elysium coefficient: resolve documented discrepancy. |
| R13 | Resolve differences between 2025 general enhancement templates and newer activity-specific community builds; do not combine gear fragments without testing. |
| R14 | Check that all listed class/role candidates are appropriate or remove them; selectors do not imply that any substitute fits the main strategy roster. |
| R15 | Validate consumable synergy and mandatory active slot for each confirmed build; exact item names matter. |
| R16 | For any withheld class activity with useful source examples, supply full armor/weapon/helm/cape, rotation, consumables and conditions; no fallback guesses. |

### Coverage check

This review includes every existing candidate class and encounter, not all possible game content. Raw inactive records are included only to resolve disposition; they are not public suggestions.

| Area | Count |
| --- | --- |
| Canonical classes | 24 |
| Aliases | 3 |
| Raw canonical activity records | 66 |
| Displayed canonical source examples | 22 |
| Modern Ultra guides | 12 |
| Other boss guide cards | 29 |
| Catalog-only encounters | 11 |
| Ultra class selections | 392 |
| Distinct Ultra role-guidance variants | 46 |
| Other boss class selections | 581 |
| Distinct other boss guidance variants | 62 |
| Source group equipment positions | 112 |
| Speaker chart steps | 141 |
| Forge Tracker entries | 22 |
| Consumable effect entries | 11 |

### Acceptance gate

- One consolidated expert decision sheet returned, corrections incorporated and remaining unverified claims withheld.
- Automated regressions and browser/package checks pass at the final authored revision. Generated artifact revision and checksum verified.
- Owner explicitly approves merge only after reviewing the corrections. Until then, keep PR #215 open and main unchanged.

No claim of in-game validation is made. A software test does not prove a combat strategy works.
