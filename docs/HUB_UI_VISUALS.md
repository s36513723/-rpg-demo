# Hub UI 11 — visual completion for hub and exploration

Battle logic remains untouched.

- Eight exploration themes now have dedicated local scene artwork: 森林 / 洞窟 / 廃墟都市 / 山岳 / 沼地 / 砂漠遺跡 / 海上・船 / 地下神殿.
- Regional event screens now use the matching exploration-theme artwork plus an event-specific icon instead of a generic regional card.
- Every map node has a small environmental thumbnail behind its semantic node icon.
- The traveling merchant has a dedicated portrait and field card.
- Enemy records use category-specific thumbnails: guard / archer / mage / beast / golem / nature / flying.
- Enemy-book rows show the same thumbnails.
- Existing NPC portraits, facility art, region art, menu icons and fixed-height modal behavior are preserved.

No battle script or battle UI file is modified.

## UI17 — NPC standing dialogue and non-scrolling facility rhythm

- Six town NPCs now have separate full-height standing artwork.
- NPC dialogue uses a dedicated fixed scene: large standing art above, dialogue overlay at the bottom, choices in a fixed action deck.
- Normal NPC dialogue no longer uses the generic small portrait dialogue card.
- The town-people list is a 2-column × 3-row portrait grid so all six NPCs fit without vertical scrolling on supported mobile sizes.
- Inn / Guild / Market top menus use the same compact two-column rhythm; no features were added, only their entrances were reorganized visually.
- Browser regression checks 320×568, 375×667, 390×844, 430×932 and 768×1024 for non-scrolling NPC dialogue/list layouts.
