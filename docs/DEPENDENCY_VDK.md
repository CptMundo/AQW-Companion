# Dependencies & Requirements — VDK pilot (0.14 A1)
Baseline main: 7a0a473f45204eb6f17fae0c53afc4770c33f258. This is a website-only maintenance PR; retain Beta 0.13.10 until the larger release is approved.

## Source review, 2026-11-28
- https://www.aq.com/gamedesignnotes/AQW-2Oct23-VerusDoomKnightClassFull-9337 — eight-stage class acquisition context, level 40 start, level 80 final stages, Evil reputation, no insignias required.
- https://aqwwiki.wikidot.com/a-mysterious-stranger-s-quests — exact current eight quest names, gates and turn-in quantities; 3 Nerfkitten fangs, not 5; 1,000,000 / 1,000,000 / 1,000,000 / 100,000 final requirements. Quantities are not kill counts. Life Carve has Level 70 and Evil Rank 10; Doom Spikes has explicit Level 80.
- https://aqwwiki.wikidot.com/verus-doomknight-class and https://aqwwiki.wikidot.com/verus-doomknight-shop — class purchase requires Unleash Doom, 0 AC. Item illustration from Wiki, credited to Apus.
- https://www.aq.com/gamedesignnotes/AQW-ClassBalance-PatchNotes-9515 and https://aqwwiki.wikidot.com/void-merge — optional alternative per tooth/fang: 50 Void Energy and Gold Voucher 500k. Do not count both boss and merge alternatives as mandatory.
- https://www.reddit.com/r/AQW/comments/171xv86/locations_of_verus_doomknight_quest_requirements/ — supplemental community map mapping, particularly gear in stages 2 and 7; exact requirements use Wiki, not community guide. No gameplay validation; old maps and acquisition restrictions need player spot checks. The Mask of the Skulls is Legend-tagged; no unsupported claim that class is membership-only. No gold/XP totals asserted because final reward not shown in current quest source.

## Implementation
- Separate pure ordered graph API with missing-reference/cycle validation and explicit manual states; graph does not assert eligibility or completion from stock. Turn-in requirements stay separate from nonconsumable gates. No automatic progress inference from inventory, level or badge.
- Both Verus DoomKnight and Verus DoomKnight (Class) resolve to the same reviewed route before the generic catalog. Existing placeholder projects upgrade non-destructively; retain custom steps and old manual status/IDs, preserve old owned step, canonicalize name. Existing duplicate projects are not silently deleted.
- Render expandable requirements per stage; first incomplete stage expanded. Completed manual stages no longer display missing turn-in stock. Show stock from last full inventory only; without snapshot unknown. Copyable map joins, shop and quest sources. Current manual checklist is still the authoritative completion control; no new persisted schema. Do not place all turn-ins into a global materials total.
- Source-reviewed is not Community Verified. No generic graph migration of existing recipes or full Smart Farming Route in this PR. Next: reusable reviewed merge/possession gate schema and allocation tests, then expand additional quest chains with source review.

## Tests
Node tests cover alias, non-destructive idempotent migration, quantities, blocked/unknown states, completed stage stock, missing references and cycles. Chromium fixture tests existing alias upgrade and mobile panel. Full CI remains required. User should refresh, open existing VDK Wishlist, verify stages/joins and mark a completed quest manually; confirm the old stage no longer asks for turned-in materials and the next quest opens. Do not clear browser data. No extension runtime changes.
