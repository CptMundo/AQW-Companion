# AQW Wiki Companion — Quick start

## Install (Opera / Chrome)

1. Download the ZIP from the project repository: https://github.com/CptMundo/AQW-Companion
2. Extract it into a permanent folder. Do not load the entire repository.
3. Open `opera://extensions` or `chrome://extensions`, enable Developer mode, and choose **Load unpacked**.
4. Select the extracted `extension` folder (the one containing manifest.json). Pin the extension to your toolbar if desired.
5. Open or refresh https://aqwwiki.wikidot.com/. The default Companion theme and Wiki navigation work without importing inventory.

## First inventory sync

Open the popup, select **Sync**, and follow the two steps: export from the logged-in Account Manager Inventory page, then open https://cptmundo.github.io/AQW-Companion/ and select **Import & Sync**. Enabling the on-page export button requests optional Account Manager access; you may use the popup capture instead. Keep the existing inventory if export fails. No password or session token is stored. Inventory and Bank are local snapshots, not live game data. A missing snapshot is not evidence that you do not own an item.

## Everyday use

- **Home:** open either site or search the local inventory and bank.
- **Settings:** Companion (default), Dark (neutral grayscale), Light, Cas B Neophyte. Theme changes apply to the Wiki and popup.
- **Item pages:** view artwork, acquisition and farming materials; add supported unambiguous items to Wishlist.
- **Quest pages:** select a quest, see objectives and available images, pin it to Companion. Manual completion is not proof of in-game completion.
- **Directory search:** matching entries appear as pages load. An incomplete search is not a definitive no-match result. Retry failed pages or use the original Wiki list.
- **Locations and shops:** use available room galleries, copy map commands and previews. Unknown source information or missing artwork remains unknown.

## Update / troubleshoot

Replace files in the same unpacked extension folder, click Reload in the browser extensions manager, then refresh Wiki and Companion tabs. Avoid installing a duplicate copy. If a competing Wiki theme interferes, test with it disabled. In Settings > Advanced tools use Test connection when sync fails. Clear synced inventory only if you intend to clear the extension's local copy.

## Browser QA before public release

Use a clean browser profile and a separate existing-profile upgrade. Record browser/version, extension version, URL, pass/fail, and screenshot. Automated checks do not replace this matrix.

| Page / flow | Expected |
| --- | --- |
| Fresh install, no snapshot | Companion theme, clear start-sync prompt; Wiki remains usable |
| Upgrade from 0.12.25 | Existing companion/light/cas choice and inventory preserved |
| Homepage + all four themes | Menu hover/focus, long dropdown scrolling, readable announcement quotes, no original-theme flash |
| Item: Necrotic Sword of Doom | Artwork, recipe alternatives, nested material counts, Wishlist state |
| Armor: Infernal Flame Pyromancer | Male/female artwork, source categories, search from Armors |
| House: Astral Beach Tent | Room tabs and ambiguous variants remain usable |
| General Gravelyn's Quests | Objectives, monster art or honest unavailable fallback, original content toggle |
| Data Station Erebus' Quest | Single quest opens; pin state, no false completion |
| Supply Caravan | Monster artwork if available; no fabricated screenshot |
| Yulgar's Inn / Arcangrove region | Room navigation, NPCs, quests, shops and map copy; original data retained |
| Embersea Faction / Wars | Sections and links remain usable |
| 13th Upholder / merge shop | Preview on hover/focus, cost and ownership not confused with eligibility |
| Swords / Armors / filtered directories | Cold/warm search, rapid typing, variant names, partial and exact matches, failed-page retry |
| Search / search by tag | Native functionality remains accessible |
| Account Manager export and Import & Sync | Complete export and explicit import; cancel/denied access/error leaves previous inventory intact |
| Narrow popup, keyboard, theme reset | All tabs reachable, no horizontal clipping, reset returns to Companion |
| Slow or offline Wiki | Existing entries usable, partial coverage honest, retry available |

No live-browser pass is implied by this checklist.

## v0.12.31 stability regression matrix
Automated: coalesced directory updates, preview request deduplication and retry cooldown, cache timestamp validation, existing foundation checks. Manual (not yet performed): fresh profile/no inventory; upgrade preserving storage; rapid search typing and clear; category pages with failed pagination; hover away and return after failed artwork; four themes on homepage, item, quest, location, shop and search; sync, Wishlist and quest pin in Chrome, Opera, Edge. No timing claims until measured in a real browser. Record browser/version, page URL, expected/actual behavior and screenshot for failures.
