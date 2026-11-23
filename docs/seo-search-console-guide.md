# AQW Companion — Search visibility playbook

## What this PR changes
The home page now has a descriptive HTML title, meta description, Open Graph title/description/site name and Twitter summary metadata. It also clarifies "AdventureQuest Worlds" in the page header subtitle. These changes help search engines and people understand the site, and improve social-link previews where supported. **They do not guarantee Google indexing or ranking.**

## Required owner action: Google Search Console
1. Identify and open the **actual, live** site URL in your browser. Do not assume a GitHub Pages URL, path capitalization or custom domain.
2. Go to https://search.google.com/search-console/ and add a **URL-prefix property** matching that exact live URL. Google's domain property is an option if you control a custom domain.
3. Verify ownership using a method Google offers: HTML verification file (requires adding the Google-provided file to the deployed site), HTML meta tag (requires adding the exact Google-issued token), or DNS (custom domain). Never invent a token.
4. Use **URL inspection** on the homepage, open its indexing status and click **Request indexing** if the page is not indexed.
5. If the site uses multiple canonical URLs, create and submit a proper XML sitemap with the **actual canonical absolute URL(s)** via Search Console > Sitemaps. Do not generate placeholder or guessed URLs. One single-page app usually only needs its homepage URL, not individual JS tabs as fake URLs.
6. Review Search Console's **Pages** and **Performance** reports. Ask the site users to link to the live site from useful, relevant AQW posts and community profiles. Avoid repetitive spam or paying for links.

## Further SEO, only after confirming the public URL
- Add a verified canonical absolute homepage link and `og:url`.
- Publish a sitemap at the deployed base path and submit it to Search Console.
- Decide whether a short, memorable custom domain is worthwhile. Set one canonical host and redirect alternatives where possible.
- Consider a simple public Features/How to use section with useful searchable content (no private user data) and real screenshots.
- Cross-link from an accurate README, a community announcement, social profiles, and official-approved fan resource directories.

## Important warnings
- Search Console and sitemap submission are **discovery hints**, not ranking guarantees.
- The site's inventory JSON, private backups, account pages, cookies and raw personal data must never be made public for SEO.
- The site is unofficial, and should be clearly described as not affiliated with Artix Entertainment.

## Official sources
- https://developers.google.com/search/docs/monitor-debug/search-console-start/
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
