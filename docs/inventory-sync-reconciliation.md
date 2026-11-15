# AQW Companion — Inventory sources and safe reconciliation (design, not yet enabled)

## Sources

- **Account Manager full export**: authenticated, user-initiated, local JSON. Includes inventory and bank when the export contains both. Treat as authoritative for quantities and bank location **at its snapshot timestamp**. Only use if Artix explicitly permits this integration.
- **Public Character Page partial view**: public-facing subset. May omit bank, resources, quantities, item IDs, and items unavailable publicly. Do not interpret absence as item deletion. Automated access requires separate policy clearance and an approved delivery path.
- **Community item catalog**: reference names/IDs/recipes. **Never** treat catalog data as proof of player ownership.

## Reconciliation rules (to implement and test)

1. Keep each imported or synchronized dataset separate and immutable, tagged `source`, `character`, `observedAt`, `scope`, `complete`, `idReliability`.
2. Do not combine data from different characters. Ask player to select a character if ambiguous.
3. Match **trusted item IDs** first. Match names against the community catalog only when uniquely resolvable. Ambiguous names, alternate skins, ranked classes, and items without IDs go into a review list.
4. The **full snapshot is the authoritative source for total inventory+bank quantities**. Never sum character-page sightings on top of full counts.
5. Newer partial sightings may show presence outside bank, but **cannot change the total quantity** without reliable quantity data; label as “seen publicly at [date]”.
6. If an item is absent in the public Character Page, it remains **unknown** there. Never mark missing, spent, sold, banked, or deleted based on absence.
7. If verified full data and partial data disagree, show a **source conflict** rather than silently changing stocks. Preserve both source timestamps.
8. Show separate freshness labels: “Full import: date/time” and “Character Page: date/time”. The displayed material progress should show which source it used.
9. Inventory change statistics compare **two full snapshots** only; never treat a partial refresh as a full snapshot or as negative inventory changes.
10. Cache and refresh boundaries must respect Artix permission and rate limits. Proposed 16-minute user-initiated cooldown is a UX idea, **not an authorization**.
11. No third-party server, account credentials, auth headers, or token values stored in the public project. Personal JSON must never be committed to GitHub.
12. Backwards compatibility: never overwrite existing IndexedDB snapshots, planner progress, story statuses, or personal backups. Add source-specific storage schema only after testing migrations.

## Planned UI

- Full Inventory (JSON) — last full import time, authoritative inventory and bank snapshot.
- Character Page (partial) — last public observation, presence only where reliable.
- “Combined view” — provenance badges; preserve totals from full import; warn on stale/conflicting evidence.
- Manual “Review unmatched items” list; zero automatic merges when IDs are ambiguous.

## Validation scenarios

- A full import has 10 Void Auras in bank; partial character view doesn't list them ⇒ still 10 (from old full snapshot).
- Item moved from inventory to bank; character page no longer shows it ⇒ no deletion inferred.
- Same item appears in both sources ⇒ only one owned item ID in combined view, not two counts.
- Partial view lists a newly acquired item absent in full import ⇒ public presence flagged, quantity unknown; do not increment confirmed material stock.
- Ranked class labels e.g. “ArchPaladin (Rank 10)” ⇒ parse rank separately, normalize name, then require unique item match before using it.
- Multiple characters, name collisions, outdated exports, missing IDs ⇒ quarantine rather than silently merge.

**Status:** architecture plan only. No Character Page sync or browser connector has been enabled. Await Artix policy clarification.
