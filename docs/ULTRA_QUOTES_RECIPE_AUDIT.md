# Ultra quote reactions and entire-catalog structural recipe audit

Reviewed **2026-11-23**, against source guides:
- [Ultra Speaker — 3-person taunt and zone](https://aqw.app/monsters/ultraspeaker)
- [Ultra Dage — Zone/Legion Mages and Noxious Decay](https://aqw.app/monsters/ultradage)
- [Ultra Nulgath — Abyssal Charge and Overfiend Blade](https://aqw.app/monsters/ultranulgath)
- [Kathool — Vigil](https://aqw.app/monsters/kathooldepths)
- [AQWG Ultra Bosses — Champion Drakath thresholds and team tactics](https://sites.google.com/view/aqwg-net/ultra-bosses)

## Why role-specific quotes
Boss quotes are signals for a **role-specific** response, not universal orders to taunt. For example:
- Ultra Dage: everyone enters the **lit** safe platform during the Zone quote; during the Legion Mages quote, only the **assigned Decay** user actively applies Decay (LDK 5; LR 2 if substitute), while supports mitigate.
- Ultra Nulgath: **only the assigned second taunter** uses the Abyssal Charge cue for the 6-second-offset tactic. The Blade callout warns the team about a lethal cast; it is **not tauntable**.
- Ultra Speaker: the Zone quote tells the **designated** player to take their turn; LR, AP and LoO have distinct Truth/Listen assignments in the standard 3-taunt variant. Non-assigned players must not improvise extra taunts.
- Champion Drakath: the tauntable HP threshold attack requires a **pre-taunt**, not a reaction after the nuke quote appears. The 2M Meteor is a separate DPS check.
- Kathool: already has an explicit role tip for **every** class and a separate 3-second Vigil warning. Do not duplicate the warning.

Code: `js/ultra-quote-actions.js` is a pure public-data registry, used inside the existing `Role-specific Tips` panel. It renders only the selected class's relevant quotes, with source links; other role tips remain below. Alternate-team classes are now selectable.

## Entire published recipe catalog: what is possible to verify

The published `data/companion_database.json` (dated 2026-11-15) is a community snapshot, **not a complete, independently authenticated description of the game's current recipes**.

`scripts/audit_recipe_catalog.cjs` runs a non-destructive **structural audit across EVERY published item and acquisition record**:
- checks duplicate and blank normalized keys;
- validates ingredient records and exact positive integer quantities;
- flags duplicate ingredients, conflicting quantities and self-dependency;
- checks whether referenced ingredient names appear in public item metadata (a missing name is a REVIEW candidate, not proof of a broken item);
- flags merge/shop acquisition records lacking listed ingredient details;
- finds multiple quest routes with different ingredient sets (alternative routes that must not be blindly combined);
- checks presence of source links without treating URLs as verified proof;
- collects a priority review list for major endgame farms.

Workflow: `.github/workflows/full-recipe-audit.yml` runs Node unit tests and the full 20 MB catalog scan, writes `review_output/recipe-audit/catalog-audit.md` and `catalog-audit.json`, adds summary to the GitHub Actions run, and uploads an artifact named `recipe-structural-audit`.

**Critical limitation:** a structural scan never proves that every recipe is accurate. Individual recipes and their nested prerequisites require human comparison against AQWWiki or the current game. No source screenshots, source ownership or unconfirmed routes are silently changed; `js/recipe-integrity.js` introduced in PR #85 remains the registry of individually reviewed recipes.

## Merge safety
This PR is stacked on the **unmerged PR #85**; PR #84 (index/CSS extraction) is also separately open. Resolve conflicts and re-run all workflows before merging in a sequence. The user authorized merging **after all recipes have been verified**. Automated catalog checks alone do **not** satisfy that condition; no merge should be executed until the user accepts an appropriately limited scope or full factual verification is achieved.
