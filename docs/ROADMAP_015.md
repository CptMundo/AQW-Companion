# AQW Companion — staged roadmap to Beta 0.15.0

Owner decision, 28 November 2026: implement in separate reviewable PRs, in the order below; no automatic merge. The public baseline is Beta 0.13.10, PR #238, commit 506fcf07558155dae7bdd89438ee2ddb60813159. The intended feature release is 0.15.0, not a promise that every feature is already validated.

## Product objective
Help the player answer “what should I do next, given my own account?” Do not replace AQW Wiki. Connect existing Wishlist, inventory/bank, Quest Tracker, Story, badges, Forge, boosts and encounter guides. Keep Home free of subtabs, avoid unnecessary navigation and duplicated systems, and keep the project free with no compulsory recurring cost.

## Ordered stages and PR boundaries

| Stage | Work | Exit criteria |
|---|---|---|
| 0.13.x A — consolidation baseline | Correct stale docs; measure startup/import/reload in existing browser harness; fix evidenced low-risk defects | Existing release remains coherent; regression tests, visual browser checks, no data migration |
| 0.13.x B — reliability | Audit backup/export/restore coverage, catalog loading, CSS duplication and guide evidence; fix failures in small PRs | Measured baseline, backup compatibility tests, known gaps documented; no broad rewrites |
| 0.14 A — dependencies | Shared, source-labelled prerequisite and recipe graph; distinguish consumed materials from possession gates, story/quest requirements and unknown evidence | No false completion or invented requirement; missing/ambiguous/cyclic dependency tests |
| 0.14 B — What's Next? | Evolve Nearly Finished Projects; rank actionable personal goals, explain next step and blockers; copy validated joins | No separate redundant Home card; evidence and manual/unknown states visible; deterministic, local-only |
| 0.14 C — Smart Farming Route | Group verified accept/farm/turn-in maps across selected objectives, aggregate required consumables, show simultaneous opportunities | No double allocation of stocks, no inferred fastest route, cap/cooldown/alternative constraints; route tests |
| 0.15 A — Collections & Gear | Extend Boost Finder to owned compatible gear by slot, group collections by merge shop, badges and relevant seasonal events | Stacking rules independently sourced; unverified interactions withheld; collection denominators and time windows explicit |
| 0.15 B — release assurance | Review information labels, report incorrect information, update sources/dates/docs, mobile/desktop, backups and extension package; synchronize 0.15.0 release labels | All authored checks pass, generated ZIP checksum where required, no known blocking regressions; owner approval; verify Pages publication |

Reputations remain excluded unless reliable observed import becomes possible. No invented manual reputation progress. No cloud sync, Android app, new backend, automatic gameplay actions, AI dependency, or mandatory costs in this scope. Future 0.16: deeper performance/reliability; 1.0: stable site/extension/onboarding; later optional connected companion.

## Information quality

Use three independent states: **Community Verified** only with documented actual player validation of the specific advice; **Source Reviewed** for dated individually reviewed sources without gameplay validation; **Pending Review** for unknown, stale or conflicting evidence. Never turn structural catalog coverage or a CI pass into a claim of game truth. Keep provenance at recipe/route/strategy granularity. For eligibility, distinguish imported official evidence, locally inferred thresholds, manually marked tasks and unknown status. No new data source, account permission or API without review. No credential or token storage. Do not treat absent public Character Page items as missing from full inventory.

## Development and release discipline

1. Read current main, previous PR, exact relevant code and continuity before editing. Use separate branches, small reversible changes and existing storage keys. Preserve snapshots, active selection, Wishlist, quest-period history, Forge/story state and privacy preferences.
2. Before implementation check what already exists and avoid duplication. Validate game facts before shipping, keep unresolved source questions explicit. Changes to enhancement rules need actual source evidence; no invented BiS.
3. Test empty/new profile, existing data, save/reload, error paths, legacy backup compatibility, desktop/mobile and navigation. Track performance measurements separately from estimates; no real user exports in repository or test artifacts.
4. Update cumulative downloadable Markdown continuity after every PR: exact base/head, changed files, tests, unresolved issues, generated assets and next task. Explicit owner approval required for each merge. Extension runtime changes require synchronized version and validated public ZIP; website-only maintenance does not require reinstall.
5. Check final authored CI, asset-only generated diff/checksum when relevant, and live Pages deployment after merge. Automated tests do not replace real user sync or community combat validation.

## Source
Owner-approved ordering from the 28 November product discussion and the attached AQW Companion product audit; current repository README, architecture, combat audit and build report. This plan is not a completed audit or benchmark. Review current source on every stage.

### Consolidation B1: history safety

PR stacked on Consolidation A while it awaits owner approval. Restore snapshot history in a single IndexedDB transaction, deduplicate only identical dated/name-matched normalized observations, preserve explicit selected snapshot in new compatible exports, and compact JSON. Multi-snapshot recovery-only mode is rejected rather than pretending all records persisted. This does not yet make localStorage sections transactional or add omitted capture data. Oversized exports still require a later compatible format; warn and preserve all data. Next B2: complete validated portable progress coverage and a lossless large-backup format, then source-quality/dependency stages.

### Consolidation B2: portable progress

Compatible optional progressV1 covers seven explicitly allowed local sections. Test real download/restore into an isolated profile, cancellation, reload and source validation. Excludes extension-only preferences, consent/permissions, trust decisions, and custom community catalog; no credential data. Legacy backups remain supported. Keep large-backup compression/splitting and full cross-storage atomicity as a separate follow-up; no silent removal or history trimming. Three dependent PRs is the cap: validate/merge in order before new feature work.

### 0.14 A1 — Dependency foundations (VDK pilot)

Ordered quest graph, validated prerequisite links, explicit manual quest state and separate turn-in stock. First supported route is Verus DoomKnight, including wiki class suffix aliases, eight steps and source-reviewed quantities. Existing player checks/custom steps retained. Completed quests do not require reacquiring turned-in stock. Unconfirmed prerequisites remain unknown; no automatic eligibility from item stock. No global recipe graph or Smart Farming Route yet. See docs/DEPENDENCY_VDK.md.

### 0.14 A2 — Typed merge dependencies

Classify existing source-reviewed merge ingredient rows as consumed at all quantities, and Eternal Drakath Set possession gates separately. Add read-only direct shortages and an optional Void Crystal A/B crafting route using shared-stock allocation, explicit yield and topological aggregation. Do not combine alternative routes or treat unknown stock as zero. Other recipes remain direct-only; cross-project allocation and What's Next are not implemented yet. Preserve saved checklist schema. Stack on A1 until all three PRs are ready.

### 0.14 A3 — Shared Wishlist Requirements

Opt-in, collapsed panel for combining selected reviewed direct recipes across incomplete goals. Sum consumables, max reusable possession gates, deduct current stock once, show per-goal contribution and flag output/consumption conflicts. Unsupported and owned goals excluded explicitly, VDK remains stage-based, no auto-expansion of intermediate items or custom checklist steps, no persisted selection or storage changes. Unknown stock stays unknown. Source-reviewed coverage is not gameplay validation. Next: What's Next using explicit coverage and manual/unknown prerequisite states; Smart Farming Route later. Merge A1/A2/A3 sequentially after tests.


### 0.14 B1 — What's Next? personal goals

Replace Nearly Finished Projects in Home, preserving its existing position and saved checklist progress as context. Source-reviewed direct requirements and the VDK questline provide independent, read-only suggestions using the selected full snapshot; stock-available, missing, unknown and pending-review categories are explicitly distinguished. Order by action category, then name, not estimated farming time. VDK uses the first unconfirmed quest, manual eligibility, and existing reviewed joins only. Unsupported routes stay pending review. Shared stock allocation, automatic intermediate expansion, task/calendar recommendations and Smart Farming Route are outside this first slice. No new storage, extension runtime or version changes. Browser and regression tests must pass before owner-approved merge.


### 0.14 B2 — Related recurring opportunities

Extend the existing What's Next card with up to three catalog-backed daily/weekly quests whose explicitly quantified item rewards match known shortages in reviewed direct recipes or the first unconfirmed VDK stage. Match exact normalized item names only; skip random/conditional/unquantified rewards, activities, retired/nonrecurring entries, locally completed quests and completed exclusive alternatives. Canonical quest IDs deduplicate; one quest can explain relevance to several goals without claiming shared allocation. Use current Tracker checks and existing pin/navigation functions; no automatic completion, reward stock credit or eligibility inference. Daily first, then unpinned before pinned within each frequency. Source and acceptance map from existing catalog only. No new game facts, route expansion, storage schema, extension runtime or version changes. B1 fixes must pass CI before sequential merges.


### 0.14 B3 — What's Next presentation and direct navigation

Existing card gains four explicit category totals, compact state labels, visible recurring opportunities above the goal list, and expandable remaining goals instead of hiding beyond five. Ranking remains category-first; among missing-material suggestions, fewer distinct missing types first is a checklist heuristic, not estimated effort, time or eligibility. The quest button opens the existing Quest Library, filters by the documented quest name and focuses the exact canonical card; the visible search remains editable. Pin refresh restores keyboard focus when possible. CSS scoped to Home with theme variables and responsive two/four-column metrics. No new game facts, storage keys, extension code or release version. B1/B2 corrected hidden Wishlist filter behavior and passed 14/14 checks each before B3 branch; all three remain unmerged pending owner authorization and exact final checks.


### 0.14 C1 — Smart Farming Route: reviewed destination grouping

Extend the existing Shared Wishlist Requirements selection with an opt-in nested Smart Farming Route; no duplicate selection or new tab. Group reviewed merge and quest turn-in destinations by exact documented map and label their roles; source links and copyable commands. Use combined direct shortages after stock deduction once; show each missing item with its combined amount and contributing goals, reviewed destination where available, otherwise a separate unmapped list. Unknown stock, overlapping gates and selected-output conflicts require verification, not an acquisition recommendation. Goals show conservative combined-stock status and still require in-game access verification. Only existing recipe-integrity acquisition methods whose source matches the reviewed route; no inferred drop map, recursive expansion, simulated purchases, fastest route, eligibility or progress credit. Preserve selection and nested disclosure during rerender; no schema, extension runtime or version changes. C2: verified recurring quest acceptance/farm/turn-in roles and shared objectives with period/alternatives/cap constraints; C3: staged route and UX validation without guessing. B1–B3 merged, final main 358f615f4e4ae82b60ca25a8437a7d1106ea3c5c, 42/42 authored checks.


### 0.14 C2 — Recurring quest routes

Reuse exact quantified catalog rewards, matching only known combined consumable shortages; defer overlap/selected-output conflicts, unknown quantities, conditional/choice rewards, activities and locally completed/blocked alternatives. Canonical IDs count a quest once, even across several maps. Merge catalog acceptance and explicitly documented farm/boss targets into C1's existing map groups; no fabricated turn-in map (acceptance is labeled "Accept / check turn-in"; a separate turn-in location requires an explicit field). Distinct source links, combined shortages and contributing goals; current-period local Tracker checks, alternatives, existing pin status and focused Quest Library navigation. Stack cap reference from player override, unambiguous export metadata or existing Wiki cap; no promise of bag space or reward credit. No automatic pin, turn-in, allocation or storage/extension changes. On Wishlist navigation or tracker period rollover, refresh existing selection. No new gameplay facts. C1 passed 14/14 checks before C2; await exact-head CI. C3 remains staged questline and UX review.


### 0.14 C3 — Current-stage questline integration and presentation

Extend the same shared selection to the existing source-reviewed Verus DoomKnight questline. Combine only the first manually unconfirmed stage's consumed requirements with reviewed direct recipes, deducting the selected snapshot's stock once. Prior completed stages are excluded; later stages not pre-farmed; optional Void Merge alternative remains a separately labeled source and command, never added to required totals. Stage-specific acquisition maps and the documented acceptance/turn-in map are grouped with existing map roles, with explicit manual level/reputation checks and no drop/eligibility guarantee. If every stage is manually checked, show class shop verification, not automatic ownership. Unsupported questlines remain excluded. Add four compact map/goal/quest/check metrics and stage summary; responsive theme-aware layout, no persisted state, extension changes or version bump. C1 and C2 each passed 14/14 exact-head checks before C3; verify C3 then await owner-approved sequential merge. Next phase 0.15 A Collections & Gear, then release assurance.
