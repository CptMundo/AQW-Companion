# AQW Companion — Ultra Guides, Class Builds, Daily/Weekly and Recipes

Reviewed 23 November 2026. The recipes below refer to exact AQWWiki merge shop rows. Other routes have NOT been individually verified.

## Ultra role guide and Bard

- Every class-specific tip is a numbered entry with mini-title and explanatory text. Boss quotes are highlighted within those same entries; old separate warning/Vigil boxes were removed.
- A source-informed Kathool Bard equipment suggestion is Awe Blast weapon, Forge helm, Absolution cape, Healer armor/base. Wizard/Lucky are alternatives; Penitence is defensive. This is an informed suggestion, not official best-in-slot.
- Official Bard enhancement reference: https://www.aq.com/lore/classes/bard
- Selected class still determines all actionable quotes, and team tactics remain available in expandable details.

## Class Builds and Daily/Weekly

- Class Builds search filters all 27 class entries without replacing the build data. Activities only show Solo / Boss or Farming, and only when the class has a recommended role (no false AoE farming for one-target/support chronos).
- Daily/Weekly gains 19 additional named Daily Quest Board entries and all Ultra bosses in the site's curated guide data; not every game quest is on the board, and seasonal/questline-specific tasks still require future sourcing.
- The task form uses spacing and responsive grid rules; search finds all tasks and Show all expands the first 18 choices.
- Sources: https://aqwwiki.wikidot.com/daily-quest-board-s-quests and https://aqwwiki.wikidot.com/sort-by-all-quests
- Mine Crafting and Hard Core Metals have the /join stalagbite farming destination as requested.

## Necrotic Sword of the Abyss — exact final merge

Confirmed: https://aqwwiki.wikidot.com/necrotic-sword-of-the-abyss and https://aqwwiki.wikidot.com/void-highlord-merge-shop

| Requirement | Amount |
|---|---:|
| Necrotic Sword of Doom (Sword) | 1 |
| Roentgenium of Nulgath | 2 |
| Void Crystal A | 1 |
| Void Crystal B | 1 |

Also reviewed from the same shop:
- Void Highlord (Class) = 15 Roentgenium + Void Crystal A + Void Crystal B
- The Mortal Coil = 4 Roentgenium
- Void Crystal A = Unidentified 10 x200, Gem of Nulgath x150, Dark Crystal Shard x200, Tainted Gem x200
- Void Crystal B = Diamond of Nulgath x200, Blood Gem of the Archfiend x30, Totem of Nulgath x15, Elders' Blood x2 (inventory uses Elder's Blood).

Five shop recipes extend the manually source-reviewed registry to 42 entries. These are final merge costs, not recursive total farming costs.

## Data integrity and migration

- The old untouched two-step Necrotic Sword placeholder is migrated to the four real components while retaining the parent project ID.
- Customized goals require pressing Update ingredients and retain their own notes; do not silently overwrite player progress.
- Inventory matching normalizes the suffixes (Sword), (Class), (Misc) and the Elder's Blood apostrophe variant; storage and original exports are unchanged.
- Other public catalog recipes are NOT universally source-verified. Previous structural scanning covered approximately 43k items and >11k ingredient lists but cannot prove that a quest is a merge or that ingredient quantities are complete.

## Tests and boundaries

- Run: for t in tests/*.test.cjs; do node "$t" || exit 1; done
- Browser QA: role tips, Bard support loadout, class search and role options, board tasks/joins, old and new sword Wishlist imports, mobile form spacing, Home and Stats.
- PR #88 (remove per-step X) is independent and still open. This branch does not include it.
- No merge without explicit owner approval. After every PR, provide a portable cumulative handoff with exact SHA, tests and changes.