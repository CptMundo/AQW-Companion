# AQW Companion Extension — experimental v0.2.0

Load only the `extension` directory using Developer mode > Load unpacked in Opera or Chrome. Manual local inventory sync from the main Companion page. No account access. The popup links to the Companion connection diagnostic and Wiki. The connection page must be deployed before the handshake can be tested. The Wiki badge confirms injection independently. All permissions are limited to the two declared HTTPS content-script match patterns; the exact main Companion pages and Wiki; the storage permission saves a local snapshot through a restricted service worker. Not published to browser stores.

Click Sync inventory to extension on Companion, then open the extension popup to see the count and clear the copy if desired. The site inventory is never modified. Wiki ownership matching is not enabled in this version.

After updates, reload the extension in the browser's extensions manager and refresh both pages.
