# Consolidation baseline — Beta 0.13.10

Baseline main: 506fcf07558155dae7bdd89438ee2ddb60813159 (PR #238). Scope: first staged PR toward 0.15.0. No release bump or extension runtime changes.

## Confirmed findings and changes

- The hosted catalog previously fetched and parsed its large JSON even when a nonempty player-imported catalog would take precedence. Check precedence before the request, retain the post-request guard against a concurrent local import. Hosted/empty catalog still checks for the hosted update. No change to cache policy, catalog content or item indexing.
- Backup restore previously validated each snapshot immediately before writing it. A malformed later snapshot could leave earlier snapshots already persisted. Validate the entire snapshot list first. This protects against malformed snapshot records, not mid-write quota/IO failures, and does not make the whole backup restore transactional. Keep original exports and backups. No schema changes.
- README, architecture and reconciliation design described manual-only/disabled sync despite the current user-initiated full, public and progress capture. Correct current scope while keeping Artix permission status and source completeness caveats.
- Current backup v0.9.3 covers full snapshots, goals, Wishlist/unlocks, planner pinned/checks and story statuses. It does not capture every local preference, Forge, Badge Hunter, loyalty/Saga capture or separate public inventory. It is not a full device migration. Import rejects files above 35,000,000 bytes, and full snapshots repeat; large exported files may exceed the import ceiling. Do not change the ceiling or silently discard history before designing a compatible format. Duplicate restores and storage failures need further review.
- The community build report (2026-11-15) records 43,217 items, 24,843 acquisition records and 5,581 location records. This is structural coverage, not source-verified accuracy.
- Legacy inline index JS and accumulated CSS overrides remain. Incremental extraction after measuring and checking dependencies; no bulk removal or reordering without browser verification.
- The Combat Information Audit documents dated source checks and unresolved community validation. The current catalog is not globally verified. Do not infer new route facts from these counts.

## Reproducible performance baseline

The existing Playwright guide harness emits a CONSOLIDATION_BASELINE JSON line at completion containing actual file sizes (bytes), navigation-relative cold Home readiness and saved Home visibility, and wall-clock demo backup-to-dashboard visibility. Run from repository root with Node 22, install playwright@1.51.1 and Chromium as in the Visual guide workflow, then node scripts/capture_guide.cjs. The guide script updates local screenshots; do not accidentally commit generated output. No private data, real Artix requests or telemetry are needed.

Conditions: headless Chromium, local HTTP, synthetic small inventory, external network requests blocked, Playwright routing disables HTTP cache, 1360×1100. These are single-run smoke observations, not real device timings, production network latency, benchmark medians, or proof of full catalog readiness. Home can become visible before the catalog completes. Record runner/date/revision and repeat on the same conditions for comparisons. Measure larger synthetic backups, storage quota, first use vs cached catalog, memory and mobile separately in the next reliability PR. Do not claim improvements in time until measured with a controlled before/after baseline.

## Acceptance and open risks

- Existing test suite plus malformed multi-snapshot backup preflight (zero writes), valid legacy backup and plain inventory import, local catalog skip and hosted/empty catalog fetch.
- Existing guide desktop/mobile smoke and visual tests, synthetic startup and reload timing output. No new account permissions, storage keys or migrations.
- Known historical issue: auto-generated asset commits may trigger action_required/failure despite an authored passing revision. This PR does not request asset persistence to its branch because it does not change the extension package; verify deployment separately after owner-approved merge.
- Future PR: establish real restore completeness and atomicity, plan stable export schema (legacy import preserved), isolate shared recipe/prerequisite logic, baseline large synthetic datasets, verify source review status before introducing recommendations.

## Follow-up after Consolidation B2

PR #239 baseline: cold Home ready 1053 ms, synthetic demo backup visible 227 ms, saved Home visible 270 ms; index 633648 bytes, CSS 162753 bytes, catalog 19805707 bytes. Single isolated Chromium run, not production. B1 uses an IndexedDB batch transaction for inventory history; B2 adds validated optional progressV1 and explicit confirmation for extended restores. Extra sections are applied with best-effort rollback on localStorage errors, not atomic with inventory and legacy settings. New exports remain compact JSON; the 35 MB import ceiling remains. Test real download/restore in a fresh profile before relying on it. The project never exports arbitrary localStorage keys, account credentials, consent or extension permissions. Source timestamps are retained; restore is not a fresh Artix verification.
