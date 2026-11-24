# AQW Companion Extension — experimental v0.4.0

Load only the `extension` directory using Developer mode > Load unpacked in Opera or Chrome. Manual local inventory sync from the main Companion page. No account access. The popup links to the Companion connection diagnostic and Wiki. The connection page must be deployed before the handshake can be tested. The Wiki badge confirms injection independently. All permissions are limited to the two declared HTTPS content-script match patterns; the exact main Companion pages and Wiki; the storage permission saves a local snapshot through a restricted service worker. Not published to browser stores.

Click Sync inventory to extension on Companion, then open the extension popup to see the count and clear the copy if desired. The site inventory is never modified. On Wiki pages with an Items breadcrumb and supported category, the extension checks the local snapshot by normalized name and item type. Multiple IDs and unresolved acquisition variants are marked ambiguous. An absent match is not proof of non-ownership. Only the queried item's summary is returned by the service worker; the UI is rendered in a closed shadow root (not a security boundary against the host page). No inventory is uploaded. Refresh Wiki pages after syncing or clearing.

After updates, reload the extension in the browser's extensions manager and refresh both pages.

The Wiki badge displays the installed version. If a recognized item cannot be checked, a visible diagnostic appears. Detection uses breadcrumb URL/label, explicit Type and specific tags as conservative fallbacks. Shop and disambiguation pages are excluded. Actual browser validation remains necessary.

Wishlist: click + Add to Wishlist on a recognized item page. The Companion opens a local review using a URL fragment containing only the public item name, category and Wiki slug. Confirm on the site to save using its existing recipe system. No automatic writes, new permissions or full inventory transfer. Ambiguous non-category suffixes require manual review. Repeated confirmations open an existing goal rather than adding duplicates.
