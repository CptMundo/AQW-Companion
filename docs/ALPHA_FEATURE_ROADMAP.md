# AQW Companion — Alpha Feature Roadmap

> Planning document only. No application features, user data, imports, layouts or deployment configuration are changed by this PR. The roadmap is intentionally iterative; specifications and priorities can be refined before each implementation PR.

## Product principles

- Make AQW progression actionable: **what can I unlock, what am I missing, where do I go, and how long will it take?**
- Reuse existing Inventory, Wishlist, Explore, Story, Daily/Weekly, Ultras, Planner and Home components rather than duplicating trackers.
- Preserve local progress and imported account data. Migrations must be backward compatible; always provide backup/export before changing storage.
- Clearly distinguish **confirmed account ownership**, **manually marked unlocks**, **inferred eligibility**, **unverified information** and **estimated farm times**.
- Show copyable full `/join location` commands where verified. Link sources (AQWWiki/official AQW) and never invent drop rates, quests or locations.
- Mobile-friendly, compact, readable cards; expandable details rather than giant default panels.
- No requirement to publish to Reddit or launch v1.0. Implement incrementally in Alpha.

## Phase A — Foundation: recipes, sources and account state

Before dependent features, define reusable data contracts for:
- Items and recipes: canonical item ID/name, quantity, repeatable nested dependencies, source links, quest requirements, drop sources, daily/weekly gates, seasonality, and verification date.
- Inventory snapshot: imported items, bank/bag counts, timestamp, import provenance; distinguish inventory absence from proof of never owning an item.
- Unlock state: manual confirmed / automatically verified / unknown; independent of currently held items.
- Shared materials: aggregate requirements across recipes **without double-counting** inventory, nested ingredients, consumed materials or simultaneous goals; handle recipe alternatives and cycles.
- Farm metadata: estimated items per run/hour, setup time, drop probability where verified, boost assumptions, cooldowns and confidence.
- Safe storage schema versions, export/restore, migration and regression tests.

**Acceptance:** one test recipe with nested dependencies and shared materials yields correct remaining quantities across imports; unknown sources and rates are explicitly marked unknown.

## Feature 1 — Forge Tracker + Mini-Wiki

**Placement:** dedicated Forge tab near Ultras, with optional Home progress summary.

- Weapon / Helm / Cape enhancements; concise descriptions, use cases and trade-offs.
- Unlock requirements, verified quests, locations, materials and copyable `/join` commands.
- Manual unlocked/locked/unknown state initially; only auto-detect when reliable data exists.
- Progress per category and total; filter unlocked, missing, available.
- Add required materials or unlock target to existing Wishlist; no separate Forge wishlist.
- Source links and last-verified metadata.

**Acceptance:** each supported enhancement has a concise guide, tracked state and source; marking an unlock survives refresh and import.

## Feature 2 — Wishlist Farm Materials + Time Estimates

**Placement:** existing Wishlist item cards, not a separate tab.

- Show up to 3 highest-priority missing materials directly on each card, with `Show all` expansion.
- Include nested craft ingredients and intermediate items, needed/have/missing counts, and copyable verified farm joins.
- Estimate farm time per material and total remaining time as a **range** with confidence and assumptions; do not present speculative exact numbers.
- Account for repeatable drops, overlapping materials, farm alternatives, quest time gates and prerequisites; distinguish active farm hours from calendar waiting time.
- Optional personal farm timer/log: samples collected over a session to improve estimates; no automated gameplay or botting.
- Recalculate from inventory import and manual progress without erasing manual notes.

**Acceptance:** a nested multi-stage recipe updates correctly after import, clearly marks unknown durations and never double-counts a material.

## Feature 3 — Collection Tracker

**Placement:** Explore / Collection view, linked from Inventory.

- Curated collections of classes, weapons, armor, rares, seasonal, Legion, Nulgath, Doom, Chrono and endgame sets.
- Owned (observed in import), manually confirmed, missing/unknown distinctions.
- Progress by collection, filters, links to item details, and `Add to Wishlist`.
- Avoid claiming comprehensive coverage until collection datasets are verified.

**Acceptance:** imported owned items are matched by stable identifiers where possible; manual confirmations survive imports.

## Feature 4 — Endgame Unlock Finder

**Placement:** Explore discovery and a small Home summary.

- Discover endgame items that are **ready now**, **almost ready** or **long-term goals** using current inventory, dependencies and unlock prerequisites.
- Explain eligibility: required materials, missing quests, badges, reputation, ultras/insignias and weekly limits.
- Rank by estimated remaining effort where available; do not confuse percentage of materials with actual time/effort.
- One-click `Add to Wishlist` and show overlapping materials with existing goals.
- Verified, curated endgame item catalogue to avoid invented recipes.

**Acceptance:** each recommendation has an explainable breakdown and never declares an item obtainable when an unknown prerequisite remains.

## Feature 5 — Build Planner by Class

**Placement:** existing Planner or class detail; integrated with Forge.

- Select owned or other class, then role: Solo, Farming, Ultra / Group.
- Recommended weapon, helm, cape and armor enhancements, potions/elixirs/tonics where relevant, with explanation and alternatives.
- Clearly label source, patch relevance and situational recommendations; avoid claiming a universal best build.
- Cross-reference Forge unlock state to show `Unlocked`, `Locked` or `Unknown`; link to unlock guide.
- Mobile-friendly compact build cards and copy/share text option.

**Acceptance:** selected class/role produces an attributed recommendation with alternatives, and locked enhancements link to Forge.

## Feature 6 — Seasonal Wishlist Alerts

**Placement:** existing Home calendar and Wishlist cards.

- Match Wishlist item sources to verified seasonal event windows and official dated announcements.
- In-app notices: available now, upcoming confirmed, ended or dates unknown.
- Source/date/time-zone shown; do not treat historical recurring dates as confirmed future announcements.
- Optional filters and dismiss/snooze, without intrusive notifications.
- Respect existing calendar event categories and feed; no claim of live synchronization.

**Acceptance:** alerts appear only when the underlying seasonal association and event window are supported; unknown dates remain unknown.

## Feature 7 — Achievement & Badge Tracker

**Placement:** Collection / Achievements.

- Curated badge catalogue with categories, requirements, verified sources and links.
- Manual marking for badges not present in account import.
- Where an official account source exposes badges, optional automatic detection with explicit provenance.
- State choices: verified owned, manually owned, missing, unknown; don't infer not-owned from absent inventory.
- Filters for seasonal, anniversary, ultra, collection and discontinued achievements.

**Acceptance:** manual badges persist after import; automated states are only asserted when source data actually supports them.

## Feature 8 — Account Stats & Progress History

**Placement:** dedicated Stats view, with optional Home snapshot highlights.

- Timeline of user-imported inventory snapshots (opt-in, local-first).
- New items/classes, material quantity deltas, bank vs bag changes, Wishlist completion trends, category totals and curated milestones.
- Compare snapshots by stable item IDs; handle moves between bank and inventory without counting as newly acquired.
- Show **stock changes**, not automatically `farmed amounts` (materials may have been spent, traded or consumed).
- Clear retention controls, delete/export history and storage usage safeguards.
- Optional future cloud sync is a separate project, not required here.

**Acceptance:** comparing two imports reports net changes accurately, avoids double counting bank transfers, and permits deleting history.

## Feature 9 — Smart Farm Planner

**Placement:** extend existing `I am playing` Planner; Home teaser optional.

- Recommend next farming activity from active Wishlist, nested requirements, availability, overlaps and estimated time.
- User selects time budget (e.g. 15/30/60/120 minutes), preferred mode (active/AFK where legitimate) and optional class.
- Output actionable task, verified `/join`, required quest/monster, target count and rationale.
- Consider daily/weekly gates, seasonal availability and current inventory.
- When data is incomplete, present candidate tasks with uncertainty rather than fabricated optimization.

**Acceptance:** for a known multi-goal inventory, planner explains why its recommended farm helps; gracefully falls back when rates are unknown.

## Delivery plan (separate implementation PRs)

1. **Data groundwork:** canonical recipe/source model, migrations and tests.
2. **Wishlist materials + nested dependencies** (small, expandable cards).
3. **Forge Tracker + mini-wiki** (manual unlocks first).
4. **Farm estimates + optional session tracking** (after verified farm metadata).
5. **Build Planner** integrated with Forge.
6. **Collection Tracker + badges** (shared collection model; badge detection only if available).
7. **Endgame Unlock Finder** (reuse recipe engine and curated catalogue).
8. **Seasonal Wishlist Alerts** (reuse verified calendar feed).
9. **Account Stats & Progress History** (opt-in snapshot storage).
10. **Smart Farm Planner** (reuse wishlist, time estimates, calendar and builds).

This is a **suggested sequence**, not a fixed commitment. Feature numbering is thematic; delivery order may change based on testing.

## Review checklist for every future PR

- [ ] No regression to inventory JSON import, Wishlist, Ultras, Story, Daily/Weekly or existing calendar.
- [ ] Local data retained and backup/restore verified.
- [ ] Desktop and mobile layout tested, no horizontal overflow or oversized cards.
- [ ] Full `/join` commands are copyable and source-verified.
- [ ] Missing/unknown data shown honestly; estimated values are labeled.
- [ ] New feature has empty/loading/error states.
- [ ] No deployment or production merge until approved.

## Explicitly out of scope for this roadmap PR

- Implementing any of the features above.
- User accounts, backend/cloud sync, APK/PWA, monetization or public launch.
- Changes to existing production code, saved user data or site styling.
