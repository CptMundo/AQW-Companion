# Stack Alerts — implementation and source coverage

Reviewed: **2026-11-24**. Feature is in English for international AQW players.

## Purpose

After each imported inventory JSON, the Companion checks **each Bag or Bank stack separately** against a known maximum. If the stack is at the limit it shows **MAXED**, or **NEAR MAX** at 90%+. An Inventory & Bank panel and compact Home alert let players identify resources that may stop accumulating and learn how to spend or turn them in. All checks are **local** and based on the active saved snapshot.

**Never sum Bag + Bank to decide if one is maxed.** Duplicate records sharing the same item ID and location are deduplicated. If an item’s cap is unknown, do not infer it from current quantity and do not alert. Stacks with no known limit are counted separately in the summary.

## Caps and their evidence

These exact maxima are source-linked in `js/stack-alerts.js`. Each corresponding AQWWiki item page currently states the cap in its description/notes.

| Material | Max stack | Source |
|---|---:|---|
| Void Aura | 7,500 | https://aqwwiki.wikidot.com/void-aura |
| Dark Crystal Shard | 1,000 | https://aqwwiki.wikidot.com/dark-crystal-shard |
| Gem of Nulgath | 1,000 | https://aqwwiki.wikidot.com/gem-of-nulgath |
| Diamond of Nulgath | 1,000 | https://aqwwiki.wikidot.com/diamond-of-nulgath |
| Totem of Nulgath | 100 | https://aqwwiki.wikidot.com/totem-of-nulgath |
| Tainted Gem | 1,000 | https://aqwwiki.wikidot.com/tainted-gem |
| Blood Gem of the Archfiend | 100 | https://aqwwiki.wikidot.com/blood-gem-of-the-archfiend |
| Nulgath Insignia | 1,000 | https://aqwwiki.wikidot.com/nulgath-insignia |
| Legion Token | 50,000 | https://aqwwiki.wikidot.com/legion-token |
| Nulgath's Approval | 5,000 | https://aqwwiki.wikidot.com/nulgath-s-approval |
| Spirit Orb | 65,000 | https://aqwwiki.wikidot.com/spirit-orb-misc |
| Elder's Blood / Elders' Blood | 20 | https://aqwwiki.wikidot.com/elders-blood |
| Silver Stack | 1,000 | https://aqwwiki.wikidot.com/silver-stack |
| Fiend Token | 30 | https://aqwwiki.wikidot.com/fiend-token |
| Dark Token | 10,000 | https://aqwwiki.wikidot.com/dark-token |
| Essence of Nulgath | 100 | https://aqwwiki.wikidot.com/essence-of-nulgath |
| Fresh Soul | 1,000 | https://aqwwiki.wikidot.com/fresh-soul |

Important: these are **item-stack limits, not total recipe requirements**. The user may manually set a cap for an exact imported item name, stored under `aqwc-stack-caps-v1` in that browser only. If the exporter includes an integer `MaxStack`, `MaxStackSize`, or `MaxQuantity` (1 to 10 million), this can also supply a cap. A player-entered override takes precedence over export metadata, which takes precedence over the Wiki for that item. Each alert states its cap source. The feature does **not** promise completeness for the 43K item database.

## Where to use it / what for

Suggestions are ranked:
1. **Wishlist:** an existing tracked goal consumes the material (shows required quantity).
2. **Reviewed merge:** one of the source-reviewed `js/recipe-integrity.js` recipes uses it, linked to its AQWWiki page and any sourced `/join`.
3. **Quest:** community catalog lists it as a quest requirement, clearly distinguished from a verified merge, with a Wiki URL when available.
4. **Community merge:** marked as *community-listed, verify before spending* rather than presenting it as confirmed.

This is discovery guidance: **no automatic crafting, quest turn-in, deletion, or account changes**. If no credible usage was found, the UI states that; it does not invent locations or recipes. Links are limited to valid AQWWiki HTTPS pages and copied joins to valid `/join abc` commands.

## Architecture & privacy

- `js/stack-alerts.js`: pure cap detector and use-lookup with no network or storage.
- `index.html`: Home alert (only with results), Inventory & Bank panel, exact-material custom cap editor and automatic updates after import, catalog load and Wishlist changes. Imported `MaxStack` fields are preserved when available.
- `css/stack-alerts.css`: accessible summary cards and responsive usage list.
- `tests/stack-alerts.test.cjs`: Wiki-cap examples, full/near thresholds, Bank-vs-Bag, duplicate IDs, unknown caps, player overrides, reviewed-vs-community sources and inline JS parsing.
- `tests/remove-damage-simulator.test.cjs`: adds the new public JS module to approved scripts.
- All inventory processing remains in the browser. Existing IndexedDB and Wishlist storage are unchanged. User-selected limits have a **new optional** localStorage key; no upload or server-side analytics are involved.

## QA before merge

Run `node tests/stack-alerts.test.cjs`, `for test in tests/*.test.cjs; do node "$test" || exit 1; done`, and the normal GitHub Actions suite. In a real browser with a user-owned export: test full Bag vs half Bank of the same material, cap at 90% / 100%, manual cap Save/Clear and page reload, no-data state, known recipe links, source & copy join, Home alert click, mobile responsive, import/restore and no regression in Wishlist.

**Do not merge without explicit user approval.** Create a cumulative .md handoff for every PR.

Known limits: coverage is not complete for all resources. Live game changes could outdate AQWWiki caps; the player override exists for this reason. A snapshot reflects the exported state, not live continuous monitoring.
