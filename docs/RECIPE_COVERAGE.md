# Wishlist recipe coverage — reviewed sources and limits

Reviewed: **2026-11-23**. This is a targeted source-verified fix with systematic warnings, not an exhaustive audit of the 43k-item community catalog.

## Original defect

The original Sin of the Abyss starter tracked only 50 Blood Gems, 50 Totems and one unresolved manual step. getRecipe() returned the hard-coded partial template before considering other acquisition data. Player-created Wishlist projects then retained outdated steps in browser storage even if the template was corrected.

## Reviewed final merge

Source: https://aqwwiki.wikidot.com/sin-of-the-abyss, checked against the in-game components screenshot (23 Nov 2026).

| Requirement | Quantity |
|---|---:|
| Blood Gem of the Archfiend | 50 |
| Dark Crystal Shard | 200 |
| Diamond of Nulgath | 500 |
| Gem of Nulgath | 150 |
| Nulgath Insignia | 20 |
| Sin of Revontheus | 1 |
| Tainted Gem | 300 |
| Totem of Nulgath | 50 |

AQWWiki calls the precursor Sin of Revontheus (Sword), while the supplied in-game component name is Sin of Revontheus. The code uses that exact item name for inventory checking. The precursor's own crafting costs are separate and are **not** included in these eight final-merge components.

## Implementation

- A small audited public registry lives in js/recipe-integrity.js and has higher precedence than the old curated/community recipe fallback.
- Newly added Sin goals receive all 8 steps, and the item-detail panel shows the audited final merge.
- An untouched old 3-step Sin goal is automatically upgraded without changing its project ID; matching material step IDs and status are preserved.
- Customized projects are not silently overwritten. The user can confirm Sync reviewed recipe, which preserves custom steps and repairs missing/wrong known requirements.
- Every Wishlist project shows a compact coverage message. Other items are explicitly marked **not independently reviewed**. If a community entry lists additional ingredients, they are shown as possible discrepancies, not trusted as a complete mandatory route.
- A source link is shown when a valid AQWWiki URL is available. No credentials, player exports, or private data are touched.
- Node tests check exact quantities, the 39-unit screenshot shortfall, migration, custom step preservation, source precedence, visible warnings, and JS parsing.

## Remaining work and risks

Other complex recipes may be incomplete. The app now makes that uncertainty visible; it does not claim to have fully audited thousands of items. The game often has alternative routes, quest prerequisites, and precursor crafting. These must be source-audited separately rather than combined blindly.

Before merge, verify a new and old Sin project visually in a real browser, confirm 10/20 Nulgath Insignia on the example snapshot, confirm existing custom steps survive, and check localStorage/IndexedDB persistence after reload. Coordinate this PR with still-open #84 index/CSS extraction; do not merge either without owner approval.