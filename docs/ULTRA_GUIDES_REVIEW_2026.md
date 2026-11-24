# Ultra guide audit — first pass (2026-11-24)

Scope: PR 102, no Wishlist, planner, or extension changes. Existing 12 detailed guides: Kathool, Drakath, Nulgath, Dage, Speaker, Ezrajal, Warden, Engineer, Tyndarius, Drago, Darkon, Gramiel. Legacy catalog unchanged.

Reviewed public references:
- https://sites.google.com/view/aqwg-net/ultra-bosses — Exaltia, Drakath, Tyndarius, Nulgath, other strategies; check current encounter before adopting alternatives.
- https://aqw.app/monsters/ultradage — sustain and Noxious Decay.
- https://solarisaqw.lol/guides/ultra-weeklies/ultradarkon — example loadouts and phases.
- https://aqw.app/monsters/ultragramiel — example loadouts, crystal and Vendetta tactics; https://aqwwiki.wikidot.com/gramiel-the-graceful — threshold mechanics.
- https://aqw.app/monsters/ultraspeaker — three-taunter rotation; https://www.aqwhub.com/ultra-guides/ultra-speaker/ — alternate strategies, do not mix patterns.
- https://aqw.app/monsters/ultraezrajal, https://aqw.app/monsters/ultrawarden, https://aqw.app/monsters/ultraengineer — encounter references.

Implementation: expose all existing phases in advanced tactics, distinguish general group presets from encounter-specific suggestions, override Dage weapon sustain, add Darkon and Gramiel presets, base/consumables where supported, additional threshold and mechanic checks, and direct source links. Sources are community recommendations, not verified combat tests or universal optimal gear.

Workbook received: Simplified bosses guide(1).xlsx. Original community discussion: https://www.reddit.com/r/AQW/comments/1u76wrp/aqw_guides_advanced_settings/ . Reviewed 24 worksheet names and text cells, including Intro, Assets, hidden template/empty sheets, all visible boss sheets and Speaker Charts. Inspected large embedded images (boss illustrations, not used as assets). Adapted source guidance for all 12 current guides, 10 additional group encounters and 18 solo/dungeon cards, 22 group-boss rating blocks by role, and six independent Speaker rotations. Workbook's exploit-dependent solo method and Ezrajal skill-lock manipulation are not recommended. Preserve older tactics separately; contradictory setups (e.g. Astral Vainglory and Speaker SC versus LoO charts) explicitly flagged. Ratings are the author's opinions, not combat benchmarks. Source workbook and images not redistributed. No changes to planner task recurrence.

Map references: https://aqwwiki.wikidot.com/void-flibbitiestgibbet ; https://aqwwiki.wikidot.com/void-nightbane ; https://aqwwiki.wikidot.com/void-xyfrag ; https://aqwwiki.wikidot.com/void-nerfkitten ; https://aqwwiki.wikidot.com/lavarock-shore ; https://aqwwiki.wikidot.com/eclipse-ascent (Temple Shrine hub) ; https://aqwwiki.wikidot.com/astral-shrine ; https://aqwwiki.wikidot.com/grim-challenge ; https://aqwwiki.wikidot.com/celestial-arena ; https://aqwwiki.wikidot.com/infernal-arena ; https://aqwwiki.wikidot.com/gaol-cell and https://aqwwiki.wikidot.com/the-gaol-of-eternal-torment-and-misery (enter dungeon from Gaol Cell, not direct join).

Remaining: browser QA, independent gameplay verification of community strategies, and other general progression guides in screenshot not fully reviewed. No extension work. No merge without owner approval.

## PR 103 — compact presentation
The workbook source remains separate in provenance, not as a second visible panel. The main Your loadout selector groups workbook lineup, existing guide classes and remaining rated alternatives. Selection shows ownership and the original encounter/role score (0 is valid; no score stays unrated), and prefers the exact workbook enhancement row, then reviewed encounter preset, then labelled generic preset. Only selected-class actionable tips are added; incompatible taunt rotations are explicitly conditional, never merged into a universal sequence. Speaker rotation charts remain selectable within collapsed Team & advanced tactics. Other encounter cards use a compact selector too. Ratings are opinions from the source, not combat measurements. No new boss data, storage changes, Wishlist changes or browser extension work.

## PR #106 — compact recommended team, complete gear and contextual tips
- Displays one complete documented lineup above the two main cards, selecting an existing alternative or workbook lineup when the original has ratings below 3. Keeps individual strategy variants separate. These are recommendations, not a measured optimal team.
- Every selectable class has four enhancement fields; preserves encounter rows first, fills gaps using existing class builds and conservative suggested defaults. Suggested general builds are explicitly not encounter-tested. References: https://sites.google.com/view/aqwg-net/enhancing ; https://www.aq.com/lore/classes/chaosshaper ; https://www.aq.com/gamedesignnotes/aqw-update-20june25-10026 ; https://aqw.app/guides/awe-enhancements .
- Boss-context glossary (Dage Zone versus Speaker Zone, Decay, HoT), amber reaction cues, named AP/LoO abilities, backup Scroll of Decay only when assigned, no duplicated Dage quote rows, compact team display, minor spacing improvements. Repairs glossary regex escaping from previous version.
- No change to ratings, tracker, inventory or extension. Browser/actual combat testing remains necessary.
