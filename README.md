# AQW Companion — Beta 0.13.10

Created by **CptMundo**. Unofficial AdventureQuest Worlds fan project, not affiliated with Artix Entertainment.

[Live Companion](https://cptmundo.github.io/AQW-Companion/) · [Visual guide & manual extension download](https://cptmundo.github.io/AQW-Companion/extension/quick-start.html) · [Technical architecture](docs/ARCHITECTURE.md)

## Features

AQW Companion is a browser-based collection and planning tool with Home, Wishlist, Daily / Weekly Tracker, Ultras, Builds & Forge, Story, Explore and Inventory. Inventory contains Inventory & Bank, Account Statistics, Compare Exports and History. Home deliberately has **no** secondary tabs.

Players import their own Account Management JSON exports, then track inventory, Wishlist goals, farming materials, manually completed quests, Ultra strategies and Forge unlocks. Class Builds is available again with source-reviewed activity examples; recommendations remain under community review and are not definitive rankings. Account Statistics uses saved snapshots and does not fabricate game achievements or acquisition dates.

## Current files

- `index.html` — page shell, navigation and legacy inline application JavaScript (still intact).
- `css/site.css` — original main and UI-patch styles moved out of HTML in their original order.
- `css/item-icons.css` — item type icon styles, loaded after base CSS.
- `css/account-statistics.css` — dedicated feature styling.
- `assets/` — brand PNGs, item-type SVGs and Artix artwork.
- `js/account-statistics.js`, `js/umami-analytics.js` — independent, browser-side modules.
- `data/companion_database.json`, `data/aqw-calendar.json` — public item reference data and curated calendar.
- `build_database.js`, `build_database_v1_1.js`, `scripts/` — offline/catalog maintenance.
- `tests/`, `.github/workflows/` — regression checks and deployment.
- `docs/ARCHITECTURE.md` — architecture, data boundaries and safe refactoring rules.

`js/combat-engine.js`, `js/combat-engine-ui.js` and `data/damage-research-reviewed.json` are **research artifacts only**. The unvalidated Damage Simulator was removed from production and its scripts are not loaded.

## Privacy and data integrity

Imported inventory JSON, selected snapshots, Wishlist, Forge progress and user settings stay in the player's browser (IndexedDB with localStorage recovery). **Never upload personal inventory exports, backups, tokens, cookies, credentials or account data to this public repository.** Umami Cloud measures cookie-free page visits only, respects prior analytics declines and browser privacy signals, and does not send game inventory. Read [privacy.html](privacy.html).

The public catalog is community-derived and can be incomplete or outdated; `data/build_report.json` and `data/source_manifest.json` describe a 15 November 2026 build, not a guarantee that all recipes are verified. No automatic authenticated Artix sync is enabled; see `docs/inventory-sync-reconciliation.md`.

## Develop and verify

From the repository root, start a local static HTTP server (required for reliable fetches and asset URLs):

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Storage is browser-origin-specific; `file://`, localhost and GitHub Pages do not automatically share saved data.

Run all Node.js 22+ regression tests:

```bash
for test in tests/*.test.cjs; do node "$test" || exit 1; done
```

A CI pass is not a substitute for testing a real import/reload, Home, Wishlist, Artix connector lines, tabs and the mobile layout in a browser. Make changes in separate branches/PRs; **never merge without the owner's explicit approval**.

## Deployment

The repository root is deployed to GitHub Pages on pushes to `main` by `.github/workflows/static.yml`. The site is at https://cptmundo.github.io/AQW-Companion/. Verify the GitHub Actions deployment after every approved merge.

**Continuity rule:** after every PR, provide a downloadable Markdown handoff containing PR URL, branch, exact head/base, changes, tests, known risks, merge status and next task so another conversation can continue without guessing.

## Recipe verification and Ultra boss cue modules (PR #85–86)

- `js/recipe-integrity.js` and `css/recipe-coverage.css`: 37 individually reviewed merges (Sin of the Abyss, 14 Forge Metal recipes and 22 Light Merge entries), non-destructive legacy Checklist upgrades, and a compact update action only when known ingredients are stale.
- `js/ultra-quote-actions.js` and `css/ultra-quote-actions.css`: reaction instructions to boss quotes, conditional on selected class and assigned role in Ultras.
- `scripts/audit_recipe_catalog.cjs`: read-only structural scan across every public catalog item and acquisition entry. Its CI report is a **review queue**, not proof that thousands of game recipes are wrong or that they have been checked against live AQWWiki.
- `docs/RECIPE_COVERAGE.md` and `docs/ULTRA_QUOTES_RECIPE_AUDIT.md`: limitations, sources, migration details and review workflow.

These modules load after the extracted legacy CSS; recipe/ultra JS is linked before the main inline application. This extraction does not alter any player data.

## Wishlist findings & source review (PR #87)

- `js/wishlist-finds.js`: local-only comparison of saved full inventory exports with current Wishlist names; `Account Statistics` displays **Recent Wishlist Finds** first observed between imports, never an exact in-game acquisition timestamp.
- Cleaner cards: icon-only × remove buttons and no repetitive starter/check-against-Wiki/not-detected banners. Saved custom steps are protected.
- Source-backed subset: https://aqwwiki.wikidot.com/sin-of-the-abyss, https://aqwwiki.wikidot.com/forge-metal, https://aqwwiki.wikidot.com/light-merge. Details and limitations: `docs/WISHLIST_RECIPE_AND_FINDS.md`.
- Most community recipes are **not independently verified**; the structural audit doesn't establish current truth. Never label the whole item database source-reviewed.

## Release versioning

The website and browser extension share one release version. `extension/manifest.json` is the canonical source. For each new release, run `python3 scripts/sync_release_version.py --set VERSION` (replace VERSION with the new numeric version); this updates every current release label in the site header/footer, class builds, popup, guide and README in one operation. Running the script without arguments synchronizes from an already edited manifest. CI runs `--check` and refuses inconsistent releases. The public package build validates the same version and embeds the freshly generated guide screenshots and checksum. Release PRs that change the download use a `feat/guide-assets-` branch so the ZIP and screenshots are also committed before merge. Use `0.13.1`, `0.13.2` etc. for maintenance releases, `0.14.0` for the next significant feature release, and `1.0.0` for the first stable release. The browser manifest keeps the numeric version separate from the human-readable Beta label. Local storage schema versions and stylesheet/script cache revisions remain independent.

### Information integrity

Current patch-specific gear rankings, role rotations and class consumable choices require separate evidence. Do not substitute general builds for missing encounter data. See `docs/COMBAT_INFORMATION_AUDIT.md`.
