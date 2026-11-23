# Wishlist clarity, verified metal recipes & first-seen accomplishments

_Last reviewed against AQWWiki 2026-11-23._

## Clear distinction: merges, quests, and starter checklists

The previous “Starter checklist” meant **the Companion's initial suggested list of checkpoints**, often only a partial quest route. It never guaranteed the complete crafting requirements. The repeated banner was confusing and is removed.

**Example: Celestial Copper of Destiny** was created in the *Forge Metal merge shop* using **Loyal Spirit Orb ×5, Bright Aura ×2, Celestial Copper ×1**. The old Wishlist incorrectly generated `Celestial Copper of Destiny ×1`, `Forge Key ×1`, and `Complete Celestial Copper of Destiny` from a later **Artix quest**. A quest that requires the crafted item cannot be the item's ingredient list.

Sources:
- https://aqwwiki.wikidot.com/celestial-copper-of-destiny
- https://aqwwiki.wikidot.com/forge-metal
- https://aqwwiki.wikidot.com/artix-s-quests
- https://aqwwiki.wikidot.com/dwarfhold-keep (map name /join dwarfhold)

The other **13** metals in that same Forge Metal shop are also registered from the wiki: seven Destiny metals requiring **Loyal Spirit Orb ×5 + Bright Aura ×2 + named metal ×1**, and seven Doom metals requiring **Corrupt Spirit Orb ×5 + Ominous Aura ×2 + named metal ×1**. The reviewed Sin of the Abyss final merge remains unchanged. The registry now covers **37 individually listed merge results**, not the whole published catalog: 1 Sin of the Abyss final merge + 14 Forge Metal + 22 entries from the Light Merge shop.

The merge recipe has priority over quest-only routes where explicitly reviewed. For other catalog entries, an explicit `community-merge` recipe is preferred over a `community-quest` route **when it has non-self ingredients and positive quantities**. Never sum multiple alternative acquisition routes automatically.


### Light Merge — source-reviewed additions

From https://aqwwiki.wikidot.com/light-merge, the review covers all 18 standard Destiny weapon chain merges shown under Weapons (1)/(2), plus four exchange rows: Bright Aura (50 Loyal Spirit Orbs), Brilliant Aura (25 Bright Auras), Loyal Spirit Orb (100 Spirit Orbs), and Spirit Orb (50 Undead Energy). All required quantities are fixed in `js/recipe-integrity.js` and tested in `tests/recipe-integrity.test.cjs`.

The public wiki writes `Spirit Orb (Misc)` to disambiguate the category; the Companion uses inventory-friendly `Spirit Orb` and supports the wiki alias when searching. Other acquisition routes may still exist; these are specifically the **Light Merge shop costs**.

## Existing user's Wishlist protection

- Old untouched **three-step metal goals** (self-reference + Forge Key + manual completion) automatically migrate to their three true ingredients, preserving the parent Wishlist ID.
- Modified goals are not silently replaced; a small **“Recipe ingredients need updating”** action appears only if a reviewed recipe is incomplete or still has the old misleading quest placeholders. “Update ingredients” requires confirmation, preserves unrelated custom steps, and removes only the exact known generated bogus steps.
- Old Sin of the Abyss untouched legacy checklist migration from PR #85 is still supported.
- Normal entries do not show “Starter checklist”, “not independently verified”, or “Final merge checked against AQWWiki” banners. No broad claim of verification is made; the site still provides **How to obtain** links.

## Cleaner Wishlist

- Top-right **×** (accessible title/aria label) replaces “Remove”; per-step remove is also an icon.
- Headers show item type only, not the redundant “Not detected in snapshot” line.
- Progress note is shortened. Recipes that are NOT audited are not falsely marked confirmed.

## Recent Wishlist Finds in Account Statistics

Local-only module `js/wishlist-finds.js` compares all stored full inventory exports by export date and looks for Wishlist *target names* newly present after an earlier baseline. Account Statistics shows up to 12 recently first-observed targets and the date of the newer **export**.

It does **not** mean the player obtained them at that exact time. Duplicated exports, moving between bank and bag, an already present target in the first export, and historically imported files do not create fresh wins. New Wishlist projects record `createdAt` and cannot retroactively claim an item as a previous success. Legacy Wishlist projects without timestamps can be compared but cannot prove that they were in the Wishlist at the time of a past import.

No new remote storage or network transmission; existing IndexedDB and localStorage keys remain. Wishlist history is derived from the user’s retained snapshots, not manually stored event claims. Removing a goal removes it from this filtered view; underlying full snapshot history remains.

## Scope limitation: all recipes

The published community database contains **43,217 items**, **24,843 acquisition records**, and around **11,644 ingredient lists** (Nov 15 snapshot). Exhaustively verifying every one against live AQWWiki pages in this PR is not feasible or honestly provable. The existing `scripts/audit_recipe_catalog.cjs` scans all compiled structures and reports suspicious entries without changing user data. **Structural checks are not factual wiki verification**. Continue source review of high-impact recipes in subsequent PRs, record exact URLs, dates and acquisition route, and never label community metadata universally verified.

## Verification

Run `for test in tests/*.test.cjs; do node "$test" || exit 1; done`. Verify in browser:
1. Old 3-step Celestial Copper project becomes 3 exact materials; customized project gets confirmation.
2. No bogus self-reference or Forge Key in the metal merge.
3. No generic source badges, missing-snapshot text, or large Remove button.
4. Main navigation, Watchlist/Wishlist tabs, FAQ, import and offline persistence continue.
5. Import a newer full export containing a tracked new item. Account Statistics shows it as “first observed”; re-importing a duplicate or old export should not.
6. No false “acquired at” dates; data stays in user's own browser.
