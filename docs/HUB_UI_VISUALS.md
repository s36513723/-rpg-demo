# Hub UI 9 — Icons, speakers and contextual navigation

Changes are limited to the hub/exploration presentation and its tests. Battle pages, battle scripts, common combat rules, progression and save schema are unchanged.

- The permanent bottom `拠点` button is removed. The bottom destinations are 編成 / 所持品 / 記録. The default view is the town or the current expedition map.
- Menus have a contextual `拠点へ` or `地図へ` exit. This closes the menu only; it never ends an expedition, teleports to town or heals the party. The existing back arrow returns one menu level.
- Local, inline SVG icons identify facilities, menu categories, weapons, armour, items, Mastery groups, regional destinations and map nodes. Text labels remain. Decorative icons are hidden from assistive technology.
- Existing six character portraits appear in conversation lists, speaker panels, party scenes and equipment/character headers. Dialogue choices, unlocks and saved records are retained.
- NPCs use six distinct role emblems, names and occupations; these are not newly generated face portraits. The tavern host, receptionist and smith can be addressed from their facility screens.
- Pair scenes show both participants, with the original prose retained as narration so anonymous quotations are not assigned to invented speakers.
- Dialogue archives, return-table conversation and the scholar's chapter-report dialogue use the same visual treatment.

`exploration/visuals.js` decorates the existing UI; `exploration/visuals.css` contains its styling. No remote icon library or image service is required.

Validation: `node tests/syntax.cjs`, `node --check tests/visual-regression.js`, `python tests/browser.py`. Native Chromium on HTTP runs in GitHub Actions. An explicitly selected `RPG_OFFLINE_TEST=1` mode uses the DOM/Storage adapter on restricted local workstations and is not described as an HTTP transition test. Dialogue/equipment layouts are checked at five viewport sizes. HTTP CI also checks that existing portrait assets load successfully.
