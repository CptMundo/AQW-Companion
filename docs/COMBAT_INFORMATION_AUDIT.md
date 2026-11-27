# Combat information integrity audit — 2026-11-27

Initial containment and source checks, not a completed validation of every boss or class. Player reports: Drakath AI/GT loadouts, generic taunt tips, VHL solo gear and Malevolence. No new optimal preset is asserted.

| Item | Effect | Individual source |
|---|---|---|
| Fate Tonic | Luck +20%, 15 min | https://aqwwiki.wikidot.com/fate-tonic |
| Sage Tonic | INT +20%, 15 min | https://aqwwiki.wikidot.com/sage-tonic |
| Might Tonic | STR +20%, 15 min | https://aqwwiki.wikidot.com/might-tonic |
| Body Tonic | END +20%, 15 min | https://aqwwiki.wikidot.com/body-tonic |
| Potent Battle Elixir | physical damage +25%, 15 min | https://aqwwiki.wikidot.com/potent-battle-elixir-non-ac |
| Potent Malevolence Elixir | magic damage +25%, 15 min (not Spell Power) | https://aqwwiki.wikidot.com/potent-malevolence-elixir |
| Potent Honor Potion | all damage +75%, mana costs +25%, 35s; cooldown 60s | https://aqwwiki.wikidot.com/potent-honor-potion |
| Felicitous Philtre | Luck +50%, 45s | https://aqwwiki.wikidot.com/felicitous-philtre |

Official enhancement traits: https://www.aq.com/lore/guides/enhancementtraits ; helmets: https://aqwwiki.wikidot.com/forge-helmet-enhancements ; balance patches: https://www.aq.com/gamedesignnotes/AQW-ClassBalance-PatchNotes-9515 . Ravenous reworked in 2025; 2026 updates affect AI, VHL, LoO, SC and Kathool Adept. Trait effects do not establish optimal loadouts.

Drakath mechanics and example teams: https://jix-aqw.github.io/guias/ultra-bosses/ultra-champion-drakath.html and https://aqwwiki.wikidot.com/champion-drakath-monster . DPS follows the designated taunter; alternate team strategies need their own evidence. No verified GT/AI Drakath loadout obtained. Class skill sources: https://aqwwiki.wikidot.com/great-thief ; https://aqwwiki.wikidot.com/arcana-invoker ; https://aqwwiki.wikidot.com/void-highlord-class . GT and AI solo/group withheld. VHL solo corrected to Dauntless/Lucky/Anima/Vainglory, with Lament alternative, as a dated community example (May 2026, not confirmed November BiS). Two sources agree on the Anima pairing: https://www.reddit.com/r/AQW/comments/1thhrix/tierlist_for_solo_and_farming/ and https://github.com/Shell1010/AQW-md/blob/main/Other%20Guides/Basic%20Class%20Guide.md . AI farming and other presets labeled unverified examples. Historic ratings remain internal discovery inputs, not displayed as scores.

Nulgath spot check: https://aqw.app/monsters/ultranulgath confirms Contracts of the Abyss is tauntable on a 7-second cooldown, whereas Abyssal Charge (Behold the power of the Abyss!) is not tauntable. Removed ambiguous scroll instructions from all guide paths and quote actions; no fixed offset rotation is claimed as tested.

Remaining audit: each encounter × class × role × team strategy, each class/Forge combination by activity, all consumable combinations (not just effects), mechanics/skill numbers/thresholds/taunts, and survivability; require dated sources and experienced player validation. No live gameplay tests performed. Do not call a guide independently validated merely because a community guide was cited.

## Second pass — community spreadsheet cross-check (2026-11-27)

Read 148 nonempty class-template rows in the four visible class tabs (bounded A1:H220; duplicate names and alternate forms are not distinct classes), overview, changelog and potion summary. Owner reports author granted permission without mandatory credit. Source: https://docs.google.com/spreadsheets/d/1wupDvLuPnRC0fF0aNPc7rzrri7X1YcYy7S2s5Z6o_F4/edit. Source changelog ends 2025-10-27; scope is general templates, not every encounter. Compared all 24 canonical Companion classes / 66 raw mode records, plus three aliases by inheritance. 23 canonical names matched; Kathool Adept postdates the guide. Differences are review flags, not automatically errors.

Corrected class base recommendations to Wizard for Arcana Invoker, King's Echo, Dark Lord, Phantasm/Phantom Chronomancer, Hollowborn Vindicator and Kathool Adept, consistent with class descriptions and/or official notes; not proof that Wizard is always optimal. Replaced Kathool Adept farming cape example with Lament (two dated community references: https://www.reddit.com/r/AQW/comments/1xe1zgv/kathool_adept_is_the_best_farming_class_in_the/ and https://www.reddit.com/r/AQW/comments/1xkrvdq/kathool_adept_enhancements/). Fixed confusion between Madness and Feeding, and Hollowborn Vindicator shield wording. Sources: https://www.artix.com/posts/aqw-kathoolclasspreview-17oct26 ; https://www.aq.com/gamedesignnotes/aqw-update-20june25-10026 ; https://www.aq.com/gamedesignnotes/aqw-29nov24-2024calendarclassskills-9776 ; https://aqwwiki.wikidot.com/arcana-invoker ; https://aqwwiki.wikidot.com/king-s-echo ; https://aqwwiki.wikidot.com/dark-lord .

Class/activity consumable combinations withheld (individual item effects retained in this audit). Unknown class base no longer defaults to Lucky. Add prominent review-pending wording to regular boss and Ultra guides, and link community templates on class build screen. No claim that all mechanics have been verified.

ArchPaladin solo helm changed from Vim to Forge as a safer community template (not a tested optimum). Outstanding cross-checks: ArchFiend solo/farm Forge vs Anima; Dark Lord weapon/cape differences; ArchMage Astral/Corporeal modes; Dragon of Time Wizard/Healer variants; StoneCrusher general Wizard vs encounter Fighter; VHL farming legacy record is hidden; exact GT/AI and all boss-specific rotations remain pending. The workbook has 12 detailed Ultra profiles, 29 additional boss guide profiles and 11 catalog-only entries according to repository tests; these counts are inventory, not gameplay validation. CI must be checked on latest head, with bot-generated commit separately assessed. No live combat testing.

## Third pass — mechanics and Forge corrections (2026-11-27)

- Warden: Berserk at 30% (450k HP) is a permanent phase, not a tauntable cast; Celestial Shockwaves occur every 5% HP lost and can reduce affected players to 1 HP. Distinguish attack redirection from phase changes. https://aqw.app/monsters/ultrawarden
- Ezrajal: 2-second counter charge, 6-second reflect, 40-second cooldown. https://aqw.app/monsters/ultraezrajal
- Engineer: Defense Drone counter on 20-second interval, 2-second charge and 6-second reflect. https://aqw.app/monsters/ultraengineer
- Drago: surviving guard heals and gains Ally Boost; boss is invulnerable while guards live; Judgement Day begins after 160 seconds with a 20-second charge and is not tauntable. https://aqw.app/monsters/ultradrago
- Astral Empyrean: Stardust Breath ignores Focus; alternate taunts after breath lands to redirect following Astral Beam attacks, not the breath. https://aqw.app/monsters/astralshrine and https://aqw.alfian.web.id/astral-empyrean
- Void Nightbane: remove false blanket Decay immunity; Blood Frenzy's 100,000 HP recovery is Decayable, unlike other heals. https://aqwwiki.wikidot.com/nightbane ; https://solarisaqw.lol/guides/ultra-dailies/originul
- Void Xyfrag: correct Consume quote and identify role-dependent taunt. https://aqw.app/monsters/voidxyfrag
- Forge: Smite/Praxis level 60 rank 6, Acheron level 80 rank 8; clarify Absolution relics and Ravenous Gluttonous Maw; add Hearty helm; distinguish standard armor base from fixed Forge patterns. https://aqwwiki.wikidot.com/cysero-s-forge-s-quests ; https://aqwwiki.wikidot.com/forge-helmet-enhancements ; https://aqwwiki.wikidot.com/cashfear-s-shop
- Elysium: official and wiki coefficients differ; omit disputed coefficient pending validation rather than silently pick one. https://www.aq.com/lore/guides/enhancementtraits ; https://aqwwiki.wikidot.com/forge-weapon-enhancements

These are source-backed corrections and conservative examples, not live-game test results. Other boss strategies, role-specific timings, item effects and rotations still need individual validation. No merge authorized. No extension code modified by these additional passes.


## Fourth pass — expanded source review (2026-11-27)

Primary community workbooks opened directly (not just Reddit summaries):
- Simplified Classes: https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit — 23 matching canonical class sheets, plus the prior Bootiest comparison. Kathool Adept separately checked against its recent official notes.
- Simplified Bosses: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit — Intro and all 20 combat-content tabs, excluding asset/template/empty tabs. Source describes fast organized groups; do not treat these as universal strategies.
- Speaker Charts: exact comparison of the event, role, and skill cells for 4 standard charts (20 steps each) and 2 detailed charts (31 and 30 steps); zero differences after normalizing blank cells and Heal capitalization. This confirms transcription, not in-game execution.

### Class coverage and decisions
All 24 canonical class names in scope, including the 3 aliases through inheritance. Distinguish official base stat guidance, community activity-specific examples, and evidence missing. Do not mix pieces of different templates and call the result verified.

| Class | Decision / remaining validation |
|---|---|
| Void Highlord | Keep dated solo example; expose low-HP and high-HP farming examples separately; July 17 infinite-range patch matters. |
| Legion Revenant | Retain example; independently confirm encounter support/Decay and heal timing. |
| ArchPaladin | Keep conservative Forge helm example; role and rotation need encounter testing. |
| StoneCrusher | Wizard general vs Fighter encounter templates differ; healing and group role must be tested. |
| Lord of Order | Support example only; party mitigation/healing timing depends on encounter. |
| Chaos Avenger | Solo example, not a universal tank/taunt build. |
| ArchMage | Low-HP Valiance and high-HP Elysium examples; Astral/Corporeal rotation distinction. |
| Arcana Invoker | Lucky/Valiance/Forge/Vainglory exact farming example, not a blanket change to official Wizard guidance; solo and disputed boss presets remain withheld. |
| Dragon of Time | Wizard/Healer base alternatives depend on HP and skill effects; no universal choice. |
| Shaman | Solo Ravenous/Examen vs Elysium/Pneuma farming. |
| Blaze Binder | Existing farming example; no claim of optimal boss performance. |
| Verus DoomKnight | Lament vs Vainglory varies between sources; no universal optimum. |
| Yami no Ronin | Dodge solo example; dodge does not bypass all boss mechanics. |
| King's Echo | Lucky/Ravenous/Examen/Vainglory source-specific solo example; official Wizard guidance retained as a distinct reference. |
| LightCaster | Existing hybrid example; group heal assignments remain encounter-specific. |
| Chrono ShadowHunter (ShadowSlayer) | Single-target, not general AoE; exact rotations need gameplay testing. |
| Phantasm (Phantom) Chronomancer | Ravenous/Examen agreement; Lament vs Vainglory differs. |
| Kathool Adept | Recent official balance updates and October farming example; absent from older workbooks. |
| Hollowborn Vindicator | Wizard and skill mechanic correction; complete loadout not independently tested. |
| Necrotic Chronomancer (Nechronomancer) | Bootiest Dauntless/Anima vs Simplified high-DPS Ravenous/Forge and sustain Dauntless/Vim; retain as examples. |
| ArchFiend | Forge vs Anima farming disagreement explicitly identified. |
| Dark Lord | Elysium/Pneuma/Avarice full Forge example; Bootiest alternatives separate. |
| Great Thief | Contested exact loadouts remain withheld; source link provided. |
| Guardian | Existing source-specific examples; no independently verified Ultra assignment. |

### Further mechanic corrections
- Forge: correct prior pass's erroneous Absolution relic attribution: Ascended Paladin and sword for Absolution; five Armor of Awe relics for Vainglory. More explicit Valiance, Elysium, Arcana, Dauntless, Avarice, Penitence, Lament, and helm quest requirements; Ravenous no unsupported Gluttonous Maw shortcut; Hearty links to helmet information. Health Vamp, Powerword Die, Lacerate and expanded traits. Elysium coefficient remains disputed. Sources: https://aqwwiki.wikidot.com/cysero-s-forge-s-quests and https://www.aq.com/lore/guides/enhancementtraits .
- Kathool: Peer, untauntable Nightmare and Vigil; Tyndarius: orb charge and boss buff phases; Gramiel: threshold protection and lethal five-stack event; Speaker: zone debuff timings and LR's short Decay window; Dage: coordinate LR Decay coverage. Monster references: https://aqw.app/monsters/kathooldepths ; https://aqw.app/monsters/ultratyndarius ; https://aqw.app/monsters/ultragramiel ; https://aqw.app/monsters/ultraspeaker ; https://aqw.app/monsters/ultradage .
- Solo Infernal Arena: Deadly Duo recovery/Decay, Cervus Malus inverted healing, Key of Sholemoh fixed damage, Azalith's Scythe dodge, Na'al Veni/Vidi/Vici sequence. Source: https://aqwwiki.wikidot.com/infernal-arena and linked individual monsters.
- Grim Gaol: solo portal entry and reset; Shelleton crash chance updated to 15%, no unsupported numerical cap; Fell Statue stacking damage; Emperor Angler thresholds; second chest 75% maximum HP attack; Rick recovery; Rampaging Cyborg invulnerability while summons remain; Mechabinky inversion and removed Devour (August 2026 patch supersedes older wiki details). Source: https://aqwwiki.wikidot.com/the-gaol-of-eternal-torment-and-misery and linked individual monsters. Grimskull?, Grim Bomb and Empress Angler tips are community transcriptions; individual monster-page retrieval incomplete.
- Kasuko's current-HP nuke and phases, Void NerfKitten stat-steal debuff; team examples no longer selected using unverified rating. Gear provenance distinguishes workbook vs other source.
- Legacy catalog: 11 entries screened for identity and availability, not full strategies. Rare Chairman and member/seasonal access flags where established. Some location-page opens failed; do not claim that all map commands/access conditions are verified.
- Still open: full independent mechanic validation for every Shrine/void/seasonal challenge and some solo rooms, current patch confirmation of each group composition, gear, rotation and potion combination, and live combat testing. All 52 cataloged encounter records were screened, not all attacks or viable team combinations independently confirmed. No release or merge authorized.



## Fifth pass — exact source rows and conservative display gates (2026-11-27)

**Authorization:** owner explicitly requires completion of the review and a subsequent affirmative green light before any merge. No merge, deployment or public release in this pass.

### Source fidelity

- Read the 23 matching canonical class worksheets again, including activity columns, class base, weapon, helm, cape and consumables. Kathool Adept has a separate October 2026 community reference. 24 canonical classes / 27 selectable names including aliases; 66 canonical legacy activity records screened.
- Replaced helper-generated group equipment with 112 exact roster/equipment positions from the 22 group encounter worksheets (12 Ultra + 10 other group encounters). Keep the source roster visible alongside its gear; the main strategy roster can be different, and their rotations must not be combined. Source: https://docs.google.com/spreadsheets/d/1yytxo6x0XlvbTIYLLD6TCEF_v1EKV59e_N-gas9Fi8Y/edit
- Source explicitly contains Vainglory for Verus DoomKnight and Glaceran Warlord at Astral Empyrean despite its own survival warning; suppress these recommendations pending resolution. Great Thief and Arcana Invoker disputed encounter presets remain withheld.
- Only 22 complete documented class/activity configurations are enabled by the new evidence gate (including the dated VHL solo and Kathool farm examples); other legacy configurations stay internal and are not presented as reviewed recommendations. General DPS source columns shown for Dragon of Time, Guardian and LightCaster explicitly do not imply a solo test. Great Thief remains withheld. Arcana Invoker farm is a source transcription, not verified after balance changes. Source: https://docs.google.com/spreadsheets/d/1WMSUlDwKUSnpg6x0ueP_6pDwxMzMM3Mc5ox3oHqK6OU/edit
- Corrected base/weapon/cape combinations: Shaman Lucky/Ravenous/Examen/Vainglory; Phantom Chronomancer Lucky/Ravenous/Examen/Vainglory; Hollowborn Vindicator Lucky/Dauntless/Forge/Penitence; Yami no Ronin Lucky/Valiance/Vim/Vainglory; Verus DoomKnight Lucky/Dauntless/Anima/Lament; CSH Lucky/Valiance/Examen/Vainglory; CAv defensive solo Lucky/Valiance/Forge/Penitence; LR farm Lucky/Valiance/Pneuma/Lament; Blaze Binder Wizard/Elysium/Pneuma/Vainglory; Necrotic Chronomancer Lucky/Ravenous/Forge/Vainglory; Dark Lord Wizard/Elysium/Pneuma/Lament (source assumes potions) and Avarice farming; dated VHL solo uses Lament. Class default stat descriptions are not automatic build prescriptions.
- 12 source-listed consumable combinations enabled only when all four equipment fields match. The ordinary Battle Elixir is +20% physical damage for 15 min, not Potent (+25%); Destruction is +30% critical damage for 15 min; Divine is +35% healing potential for 15 min. No implicit upgrade of potion variants. Required encounter scroll overrides the active item. Sources: https://aqwwiki.wikidot.com/battle-elixir ; https://aqwwiki.wikidot.com/destruction-elixir ; https://aqwwiki.wikidot.com/divine-elixir . Other combinations withheld where evidence or item effects are insufficient.

### Mechanic corrections
- Flibbitiestgibbet: Elemental Embrace / Elemental Grasp activate extreme dodge and resistance; the Shaman skill-5 warning includes the effect names. https://aqwwiki.wikidot.com/flibbitiestgibbet
- Emperor Angler: distinguish threshold Feeding Frenzy (60% max HP, subsequent attacks lethal below half HP for the next 10 seconds) from Fish Breath (40% max HP; healing reduced by 75% for 12 seconds). https://aqwwiki.wikidot.com/emperor-angler
- Gramiel: five stacks of Vendetta are lethal when Grace Unleashed lands, not instant death on obtaining the fifth stack.
- Temple Shrine middle: Ascended Solstice and Ascended Midnight naming, 15-second convergence effects, overlapping effects dangerous. Source strategy assignments are conditional. https://aqwwiki.wikidot.com/temple-shrine
- Mechabinky & Raxborg 2.0: self-destruct cue retained, exact timing withheld where the warning text and charge duration conflict. https://aqwwiki.wikidot.com/grim-challenge

### Validation and release gate
- Source transcriptions and UI evidence checks are documentary validation only; no live gameplay run or exhaustive current-patch performance benchmark was performed.
- Previous authored revision 1e53fc7 had 14 successful workflows. Auto-generated assets commit e053923 returned action_required, not a pass. Intermediate revision 1a41ea2 had four failed workflows from a legacy test assuming an exact source gear row must always render. The test now explicitly checks withholding contradictory Astral gear. Further failures revealed the Flibbi skill-5 wording regression; the role tip now retains both the skill number and effect names.
- New regression coverage checks full class gear tuples, inherited aliases, ordinary vs Potent consumables, mismatched-gear suppression. Recheck all workflows for final authored AND generated revisions before calling release ready.
- Remaining blockers: independent current-patch confirmation of disputed presets and precise boss timings; individually verify currently unconfirmed legacy access/monster pages and any remaining unsupported claims before re-enabling them; gameplay tests for party rotations and potion performance. All 52 catalog records screened, not all independently confirmed. A source example is not a guarantee. No merge authorization.
