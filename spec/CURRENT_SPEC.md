# Current Confirmed RPG Specification

This is the repository-readable mirror of the canonical Excel specification. It is intentionally concise. Detailed tables live in the workbook; code/data should use stable IDs where available.

## Core battle
- 6 allies in a 3x3 formation; 3 cells remain empty.
- Enemy side is basically 3x3.
- Round-based command battle.
- Default target is the nearest enemy in the actor's forward lane; skills may override with provoke, bypass, snipe, penetration, cover, etc.
- Formation/row change costs 1 turn.
- Manual main/sub weapon-set swap costs 0 turns; no automatic swapping.
- Strategy axes: formation, turn order, target, area, range, matchup, binds, ailments.
- Repeating one strongest move should not be the universal optimum.

## Stats and resources
- Core: PHY / SKL / ARC / MND.
- HP is PHY-based.
- Physical defense is PHY-based.
- Magic defense is ARC + MND based.
- Normal attack is PHY-based.
- Weight limit is PHY-based; exceeding it is allowed with speed/evasion/weapon-performance penalties.
- HP + unified SP. MP must not be reintroduced.
- Exact SP formula remains balance-controlled unless explicitly confirmed.

## Damage and conditions
- Physical: 斬 / 突 / 壊.
- Magic: 火 / 水 / 土 / 風 / 光 / 闇 / 無.
- Enemy archetypes: 獣 / 軽装 / 重装 / 魔術師 / 弓 / 飛行 / ゴーレム.
- Binds: 頭封じ / 腕封じ / 脚封じ.
- Ailments: 盲目 / 猛毒 / 睡眠 / 気絶 / 動揺 / 誘惑 / 即死.

## Equipment
- 主武器 / 副手 / 予備主武器 / 予備副手 / 防具一式 / 装飾品 / 携行具.
- Armor categories/Mastery: 魔装 / 軽装 / 重装.
- Weapon and armor equipment is gated by the corresponding Mastery. The talisman weapon uses 符術. Starter main-hand equipment remains usable after save migration. Market direct equip and presets follow the same requirements. The current Rank 5 threshold is an **initial implementation value**, not yet confirmed.
- Dual wield requires two one-handed weapons and SKL 30. Two-hand grip applies to a one-handed main weapon with an empty offhand.
- Initial balance proposal: two-hand grip reduces effective main-weapon weight by 20%, boosts physical attack by 10% and normal-attack hit by 6. A normal hit lowers target physical defense by 10% for two rounds. Dual wield adds 35% of offhand weapon power to physical attacks and reserves 4 skill-set Cost if either weapon set qualifies. These values are adjustable.
- Unarmed, throwing and shields retain their existing handling.

## Mastery
Weapon Masteries:
無手 / 格闘 / 短剣 / 剣 / 槌 / 斧 / 槍 / 鞭 / 鎌 / 刀 / 弓 / 銃 / 杖 / 盾 / 投擲.

Sources (0-1):
灼陽 / 霊峰 / 海神 / 森羅 / 星辰.

Spell Masteries (0-2):
信仰 / 呪術 / 魔術 / 符術 / 機巧 / 異能.

Skill Masteries (0-2):
- 探索: 盗技 / 隠密 / 索敵 / 鑑識
- 士気: 歌唱 / 舞踏 / 奏楽 / 号令

Skills are learned from requirements such as stats, Mastery, Source and spell system, and have an equip cost. Exact Rank thresholds, Mastery Rank cap, Rank gained per Mastery Pt, skill-learning Pt costs, individual Set Costs and the Set Cost capacity formula are **initial implementation / review values unless explicitly promoted to Confirmed**.

## Growth and experience
- Characters gain EXP from meaningful play.
- There is no conventional character level that automatically raises combat stats.
- When accumulated EXP reaches the next growth threshold, the character receives growth points.
- Growth rewards include Stat Pt and Mastery Pt; the player decides where to allocate them.
- EXP sources include normal battles, strong enemies, bosses, quests, exploration discoveries and important events.
- The design must not make repetitive weak-enemy grinding the only or dominant growth route.
- Exact EXP thresholds and the amount of Stat Pt / Mastery Pt per growth threshold are balance values and remain adjustable until confirmed.

## Dungeon
- A run is basically 3 layers.
- Layer environments can change each attempt.
- Environment candidates: 森林 / 洞窟 / 廃墟都市 / 山岳 / 沼地 / 砂漠遺跡 / 海上・船 / 地下神殿.
- Nodes: 通常 / 強敵 / イベント / 野営 / 商人 / 探索 / 鍛冶 / ボス.
- Rewards include Stat Pt / Mastery Pt / materials / equipment / items.
- No weapon/armor durability-repair system.

## Base
- 宿・酒場: conversation and rest. Returning alone does not auto-heal; choosing rest fully restores HP/SP/status and settles pending growth points.
- ギルド: requests, information, appraisal, purchase of exploration finds.
- 市場: equipment, items, processing.
- ダンジョン: destination, party, sortie.
- Old storage concept is replaced by member-management functionality.

## Battle UI
Top to bottom:
1. ROUND / AUTO / speed / settings
2. turn order
3. main enemy + current acting ally presentation
4. commands
5. ally 3x3 card formation

The first visual impression should be a stylish character-focused RPG, not a grid board game.

## Character art
- The Paladin's confirmed master standing art is the user-approved 2026-09-28 full-body blonde female knight in white / blue / gold armor with sword and large shield.
- Turn-order, party/formation icon, and acting-character battle portrait for a character are derived from the same approved master art; UI frames remain separate reusable assets.
- Character-art handling must scale to a growing roster: add a master standing art once, then derive standardized UI crops instead of redesigning the character separately for each UI.

## Specification status
- Machine-readable classification: `spec/spec-status.json`.
- Implementation existence or a passing test does not imply approval.
- The 296 reverse-synced skill records default to **要レビュー**.
- Balance placeholders such as Mastery Rank cap 50, +5 Rank per Mastery Pt, the Set Cost capacity formula and combo bonus percentages remain **初期実装値** until explicitly confirmed.

## Enemy archetype implementation
- The confirmed enemy archetype set is 獣 / 軽装 / 重装 / 魔術師 / 弓 / 飛行 / ゴーレム.
- Runtime now distinguishes those seven archetypes in generated dungeon encounters. Their current stat lines, AI frequencies, ailment resistances and per-environment encounter mixes are **initial implementation values**, not confirmed balance.
- 誘惑 is now connected to battle targeting: when active, its next hostile action is redirected toward its own side before 挑発 / lock-on / ordinary skill targeting is considered.

## Skill catalog migration target
- A separate-chat design currently targets **315 skills** with a **Rank 1-10** Mastery structure, recorded in `spec/skill-catalog-target.json`.
- The current runtime remains 296 skills. The exact 315-name / Mastery / Rank table has not yet been recovered, so the runtime catalog must not be padded with invented skills or replaced from the count alone.
- Candidate Rank bands and Set Cost / SP / power ranges in that target file are review values until explicitly confirmed.
