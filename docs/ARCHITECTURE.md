# AQW Companion — Architecture & continuity

Updated 2026-11-23. Base commit: `e8d19a910b8f6e0cc3cf35958d80a8f938d03f8d` (after PR #83).

## Principles

1. Static client-side app on GitHub Pages; no Companion account backend.
2. Privacy-first local data: manually imported Account Management JSON is stored in the player's browser, with IndexedDB and a localStorage recovery path. Never commit player exports to the public repo.
3. Stable UX: **Home has no subtabs.** Top tabs: Home → Wishlist → Daily / Weekly Tracker → Ultras → Class Builds → Story → Explore → Inventory.
4. Inventory subtabs: Inventory & Bank → Account Statistics → Compare Exports → History. Class Builds subtabs: Class Builds → Forge Tracker.
5. Do not make up combat damage, acquisition dates, official achievements, account progress or inventory ownership. Community data is reference only.
6. Separate PRs, regression tests, explicit owner approval for merges, and **one portable handoff Markdown file for every PR**.

## Entry point and feature boundaries

| File | Responsibility |
|---|---|
| `index.html` | HTML sections/navigation plus the existing main inline JavaScript. Its function definitions, event registration order and storage keys remain untouched by this extraction. |
| `css/site.css` | Previous inline CSS blocks 0–34, same order, original patch IDs recorded in comments. |
| `css/item-icons.css` | Previous inline blocks 35–38 for item category icon layouts. |
| `css/account-statistics.css` | Dedicated responsive Account Statistics styles. |
| `js/account-statistics.js` | Browser-only pure snapshot analysis and Account Statistics renderer. |
| `js/umami-analytics.js` | Cookie-free page visits; respects prior declines and browser privacy signals. |
| `assets/brand-logo.png`, `assets/brand-favicon.png` | Exact existing images moved from Base64 into local assets. |
| `data/companion_database.json` | Community-derived static public catalog, not the user's inventory. |
| `data/aqw-calendar.json` | Curated event calendar. |
| `docs/inventory-sync-reconciliation.md` | Proposed source reconciliation, NOT enabled Character Page sync. |
| `tests/` | Node-based regression suite; static assertions alone cannot verify browser behavior. |

### Critical CSS cascade order

1. `css/site.css`
3. `css/item-icons.css`
4. `css/account-statistics.css`

This sequence reproduces the original inline style order **without changing CSS declarations**. Changing order can break the Home, navigation, Artix connectors, Tracker and Wishlist; do not consolidate overrides without verified screenshots.

### JavaScript loading order

`js/account-statistics.js` loads before the existing main inline application script. Umami pageview integration loads with `defer`. The archived combat engine scripts are not loaded; the Damage Simulator was removed because theoretical DPS was not verified.

## Runtime data flow

```
Player imports JSON manually
  → browser snapshot storage (IndexedDB + localStorage recovery)
  → Inventory, Compare Exports, History
  → Wishlist goals and Account Statistics
Public community catalog → Explore and item/quest references
Manual checkmarks → Forge, Ultras, Daily/Weekly, Story
Umami Analytics → sanitized page visit metadata, not imported JSON
```

The catalogue does not prove a user owns an item. `Bank=0` is not necessarily an inventory slot. A snapshot change means first/last *observation*, not confirmed acquisition/deletion dates. Partial Character Page data cannot replace authoritative full imports.

## Build and deploy

GitHub Pages publishes the repository root via `.github/workflows/static.yml` on pushes to `main`. The browser loads relative CSS/PNG/JS paths, so test through HTTP rather than `file://`.

Run `for test in tests/*.test.cjs; do node "$test" || exit 1; done` (Node 22+). After merging, verify the deployment and smoke-test main tabs, imports, snapshot reload, Wishlist, Forge, Stats, icons, Artix connector lines and mobile.

## Safe next engineering steps

- Add real browser runtime smoke tests and screenshot comparison before reorganizing CSS further.
- Split pure JavaScript utility functions out of the 200KB+ inline app **incrementally**; avoid moving initialization/state code until dependencies are mapped.
- Audit known community data gaps and sources; don't treat the experimental 20s damage engine as verified.
- Keep site navigation as tabs within one static page unless a later explicit architecture decision changes that.

## PR handoff file contract (required after *every* PR)

Provide the owner a downloadable file `AQW_Companion_PR-<N>_Handoff.md` containing:
- Repo URL, base SHA, new branch + head SHA, PR URL, and status (**NOT MERGED** unless confirmed).
- User's decision, files changed, scope and things explicitly out of scope.
- Tests executed/CI status and remaining browser or data-validation checks.
- Current navigation, storage/consent constraints, known architectural risks.
- Precisely what to check/implement next, starting with re-reading the *live* GitHub state.
- No private inventory/account data or secrets.

This file is a context handoff, not a replacement for current GitHub source and test results.

## 8. Recipe and Ultra modules integrated with the index refactor

- New extra CSS cascade entries (after `css/account-statistics.css`): `css/recipe-coverage.css` → `css/ultra-quote-actions.css`. These were present as external links before the extraction; preserve their order.
- New pre-application JS modules: `js/recipe-integrity.js`, `js/ultra-quote-actions.js`, loaded before `js/account-statistics.js` and the single legacy inline application script. Do not move the existing initialization code while extracting CSS.
- `js/recipe-integrity.js` records 37 item-specific reviewed merge recipes (Sin of the Abyss, 14 Forge Metal entries, 22 Light Merge entries), not the full community catalog; see `docs/WISHLIST_RECIPE_AND_FINDS.md`.
- `js/ultra-quote-actions.js` provides class/role-specific boss quote responses. Exact tactics depend on team assignments; see `docs/ULTRA_QUOTES_RECIPE_AUDIT.md`.
- `scripts/audit_recipe_catalog.cjs` scans the published 2026-11-15 community catalog. A missing ingredient name, empty merge entry or multiple quest routes is a structural flag, **not a confirmed gameplay error**. CI creates a report artifact.

## 9. Wishlist Finds / cleaner checklist UX (PR #87)

- `js/wishlist-finds.js` is a pure local module. It compares already stored full exports and Wishlist targets by name, with `createdAt` on new goals to prevent retroactive achievements; no schema migration, no network, no personal data in the public repository.
- `js/account-statistics.js` renders **Recent Wishlist Finds**, dates of first observation in a newer export, not actual acquisition dates. Browser-only derived metrics.
- The CSS/JS load sequence includes `js/wishlist-finds.js` between the Ultra modules and Account Statistics. Current CSS retains `css/recipe-coverage.css` for accessible icon-only delete controls.
- In Wishlist, recipe notices only appear for actionable discrepancies against a reviewed source; routine provenance warnings are deliberately kept out of the cards. Details remain accessible on demand in **How to obtain**.
- Distinguish merge ingredient requirements from separate quest prerequisites; reject self-dependent quest data as an item creation recipe.
