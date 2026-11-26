# Badge Hunter source coverage

Snapshot: 26 November 2026. Source: [AQW Wiki Character Page Badges](https://aqwwiki.wikidot.com/character-page-badges), seven category indexes, with individual character badge IDs and original artwork URLs. The source pages carry CC BY-SA 3.0 attribution; artwork belongs to its rights holders. The catalog includes 792 unique index records, not a guarantee of all in-game or newly released badges. Image URLs are from source markup; successful rendering of every asset is not certified. No third-party image proxy or new extension permissions.

The index-only snapshot is intentionally separate from individual detail coverage. The existing curated acquisition summaries are mapped only to a unique matching badge. For others the source link is available and requirements/availability are marked unconfirmed, rather than inferred from the name or category. Seasonal alerts require an explicit dated official announcement; Harvest Hunter uses the official November 2026 window.

To reproduce: install beautifulsoup4 and run `python scripts/inspect_badge_sources.py`. Optional `--details` retrieves individual public badge pages with two workers and throttling, stops network retrieval on HTTP 429, and records source errors. Do not publish raw generated data without reviewing requirements and artwork attribution. No scheduled job or automatic write.
