# AQW Companion — Quick start

## Install (Opera / Chrome / Edge)

Store installation: use the official listing shared by the maintainer when available. Click Add to Chrome and pin AQW Companion. Until then, use the manual pre-release steps below. The visual guide is `quick-start.html`.

1. Download the ZIP from the project repository: https://github.com/CptMundo/AQW-Companion
2. Extract it into a permanent folder. Do not load the entire repository.
3. Open `opera://extensions` or `chrome://extensions`, enable Developer mode, and choose **Load unpacked**.
4. Select the extracted `extension` folder (the one containing manifest.json). Pin the extension to your toolbar if desired.
5. Open or refresh https://aqwwiki.wikidot.com/. The default Companion theme and Wiki navigation work without importing inventory.

## First inventory sync

Open the popup, select **Sync**, and follow the two steps: export from the logged-in Account Manager Inventory page, then open https://cptmundo.github.io/AQW-Companion/ and select **Import & Sync**. Enable inventory export on first use (optional Account Manager access), then click Export to AQW Companion on the Inventory page. If needed, use Export not working? for the alternative export. Keep the existing inventory if export fails. No password or session token is stored. Inventory and Bank are local snapshots, not live game data. A missing snapshot is not evidence that you do not own an item.

## Everyday use

- **Home:** open Companion or AQW Wiki; view saved Wishlist progress and manually checked daily/weekly tasks in compact lists.
- **Settings:** Companion (default), Dark (neutral grayscale), Light, Cas B Neophyte. Theme changes apply to the Wiki and popup.
- **Item pages:** view artwork, acquisition and farming materials; add supported unambiguous items to Wishlist.
- **Quest pages:** select a quest, see objectives and available images, pin it to Companion. Manual completion is not proof of in-game completion.
- **Directory search:** matching entries appear as pages load. An incomplete search is not a definitive no-match result. Retry failed pages or use the original Wiki list.
- **Locations and shops:** use available room galleries, copy map commands and previews. Unknown source information or missing artwork remains unknown.

## Update / troubleshoot

Replace files in the same unpacked extension folder, click Reload in the browser extensions manager, then refresh Wiki and Companion tabs. Avoid installing a duplicate copy. If a competing Wiki theme interferes, test with it disabled. In Settings > Troubleshooting & privacy use Test connection when sync fails. Clear synced inventory only if you intend to clear the extension's local copy.

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
| Narrow popup, keyboard, theme selection | All tabs reachable, no horizontal clipping, select Companion and apply to restore the default theme |
| Slow or offline Wiki | Existing entries usable, partial coverage honest, retry available |

No live-browser pass is implied by this checklist.

## v0.12.31 stability regression matrix
Automated: coalesced directory updates, preview request deduplication and retry cooldown, cache timestamp validation, existing foundation checks. Manual (not yet performed): fresh profile/no inventory; upgrade preserving storage; rapid search typing and clear; category pages with failed pagination; hover away and return after failed artwork; four themes on homepage, item, quest, location, shop and search; sync, Wishlist and quest pin in Chrome, Opera, Edge. No timing claims until measured in a real browser. Record browser/version, page URL, expected/actual behavior and screenshot for failures.


### Compact Home trackers (v0.12.33)
Wishlist shows the Companion’s saved tracked progress; Daily / Weekly Tracker shows manually checked pinned tasks, not live game completion. Open or refresh Companion and keep it visible until the snapshot updates (normally within the next polling cycle). The popup shows the last sync time and flags old reset periods; use Open to edit in the full tracker. All data stays in local browser storage, with no new permissions.

### v0.12.34 — Expandable mini trackers
Wishlist, Daily and Weekly each show up to four entries by default. Select Show N more to expand that group and Show less to collapse it. The groups expand independently, with a single popup content scrollbar; the fixed outer popup size is unchanged.


### v0.12.35 — Extension branding
The browser extension, toolbar title, popup and usage guide are named AQW Companion. The AQW Wiki Companion banner and branding on Wiki pages remain unchanged.

### v0.12.36 — Copy map commands from mini trackers

Click the compact `/join` button on a Daily or Weekly task to copy the same main map command as the Companion quest card (accept location first, otherwise primary map). No guessed maps; if the saved task has no valid command, no button appears. Refresh the Companion to publish updated task data.


### v0.12.37 — Check quests from the popup

Click the green check button beside a Daily or Weekly quest to mark it done or undo it. A pending check is stored locally until the updated Companion site can receive and acknowledge it. Only after the site saves and acknowledges it does the popup show the new state. Pending checks from an expired reset period are rejected; mutually exclusive weekly quests cannot both be checked. This changes only your local tracker, not the game. No new permissions. The updated website is required.


### v0.12.39 — Instant theme switching
Choose a theme and click Apply theme. The popup and already-connected Wiki tabs update automatically, without reloading. After installing or reloading the extension itself, refresh existing Wiki tabs once to connect the new scripts.

### v0.12.42 — release preparation
Visual quick start with real cropped pre-release captures; store icon padding and listing description updated. No new functionality or permissions. Store listing URL, actual install and Account Manager capture still pending.
