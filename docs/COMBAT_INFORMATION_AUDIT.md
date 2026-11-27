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
