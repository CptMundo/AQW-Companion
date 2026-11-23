# AQW Companion — 2026 class-build roster expansion

Reviewed: **23 November 2026**. This is a curated, community-informed equipment/loadout reference, **not** a measured performance tier list or a simulator.

## User request

A community Discord player noticed that **Chrono ShadowHunter** was missing from AQW Companion's Class Builds. Add that class and several of the most used/relevant 2026 endgame classes. Never replace already working builds with speculative calculations or invent an AoE/Ultra role where the class is not commonly recommended.

## Implementation

- Data lives in **`js/meta-class-builds.js`**, which is loaded before the main application. The main app merges its additions into the existing `starterBuilds`, `baseClassEnhancement` and `classAlchemy` objects; no existing profiles, import logic or local storage keys are changed.
- `css/meta-class-builds.css` adds compact labels and source links, while the original Artix character image, four gear callout positions and connectors remain unchanged.
- New entries: **Chrono ShadowHunter, Phantasm Chronomancer, Kathool Adept, Hollowborn Vindicator, Necrotic Chronomancer, ArchFiend, Dark Lord, Great Thief and Guardian**.
- Exact equivalent-skill aliases: **Chrono ShadowSlayer → Chrono ShadowHunter**, **Phantom Chronomancer → Phantasm Chronomancer**, **Nechronomancer → Necrotic Chronomancer**. They appear under their own names in the selector and use the same gear entries.
- The original 15 entries and their gear settings remain intact: the selector now has 27 names total (15 old + 9 new + 3 alternate item names).
- The previously inaccessible **Group / Ultras** option has been restored to the Activity selector. No new separate HTML pages or Home sub-tabs.
- For classes without a reasonable recommended role, the app deliberately shows **“No recommended … build”** with alternatives. There is no fake farming build for single-target Phantasm Chronomancer, Great Thief, Guardian or Hollowborn Vindicator. Chrono ShadowHunter's farming mode explicitly means **rapid single-target kill farming**, not AoE.
- Existing `alternative` and `note` fields, previously stored but not visible in Class Builds, are now rendered. New builds also include a class information link, a community build reference and cautions about Ultra mechanics, latency and dangerous DPS gear.
- Builds are advisory. The presence of a build **does not** claim a class is owned; inventory import/ownership logic is unchanged. “Meta” is not a global rating or an invented numeric tier.

## Sources and choice rationale

Public class mechanics:
- https://aqwwiki.wikidot.com/chrono-shadowhunter (same skills as Chrono ShadowSlayer)
- https://aqwwiki.wikidot.com/phantom-chronomancer-class (same skills as Phantasm Chronomancer)
- https://aqwwiki.wikidot.com/necrotic-chronomancer (same skills as Nechronomancer)
- https://aqwwiki.wikidot.com/kathool-adept
- https://aqwwiki.wikidot.com/hollowborn-vindicator
- https://www.aq.com/gamedesignnotes/aqw-kathoolclasspreview-17oct26-10496 (new October 2026 class)
- https://www.aq.com/gamedesignnotes/AQW-Balance-PatchNotes-9515 (2026 balance changes)

Community/class enhancement recommendations:
- https://www.aqwhub.com/other-guides/choosing-a-chronomancer/ — ShadowHunter / ShadowSlayer Ravenous, Lament
- https://www.reddit.com/r/AQW/comments/1nrkvts — Phantasm Examen + Ravenous
- https://solarisaqw.lol/guides/ultra-weeklies/ultradarkon — Ultra-safe CSH, PhCM and Guardian
- https://www.reddit.com/r/AQW/comments/1xdwz7f/what_are_your_thoughts_on_the_new_kathool_adept/ — Kathool Adept builds (October–November 2026)
- https://www.reddit.com/r/AQW/comments/1ttv3uq/hollowborn_vindicator/ — Hollowborn Vindicator and Praxis/Dauntless/Valiance variants
- https://www.youtube.com/watch?v=VH7C3yiOh2g — Necrotic Chronomancer Forge examples
- https://solarisaqw.lol/guides/classes/archfiend — ArchFiend 2026
- https://solarisaqw.lol/guides/classes/dark-lord — Dark Lord 2026
- https://www.reddit.com/r/AQW/comments/1tmz6d8/some_info_on_every_major_meta_dps_forgive_me_for/ — Great Thief
- https://vanaheim.app/guides/guardian-127033 — Guardian, October 2026
- https://sites.google.com/view/aqwg-net/enhancing — standard enhancements

The public AQWWiki may suggest a standard/stat-model enhancement such as Wizard for Hollowborn Vindicator while a specialized community build uses Lucky; the set here is the *explicit community loadout* with its reference, not an assertion that an official universal best build exists.

## Remaining caveats

Builds depend on enemy HP, damage boosts, server ping, 2026 balance changes, consumables and party composition. The Chrono ShadowHunter rapid-shot rotation is latency-sensitive. Do not encourage fragile helm/cape setups in hard Ultras without survivability. The old static template does not check whether a user has unlocked each Forge enhancement; the separate Forge Tracker is still manual. No DPS calculation has been introduced.

## Technical verification

Run:
```bash
node tests/meta-class-builds.test.cjs
for test in tests/*.test.cjs; do node "$test" || exit 1; done
```

Check in a real browser: all 27 class names, Chrono ShadowHunter + ShadowSlayer, all three available Activity choices, the intentional unsupported role message, source links, Artix connectors and desktop/mobile responsive layout. Node tests cannot establish visual parity.

## Merge policy / continuity

This PR is independent of **open PR #88**, which removes the little X buttons from Wishlist ingredient steps. Do not silently merge #88 or incorporate its code. **Never merge this PR without explicit owner approval.** Provide a portable Markdown continuation file after every PR (head/base SHA, changed files, test status, known issues, and next actions).
