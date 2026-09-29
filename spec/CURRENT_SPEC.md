# Current RPG Specification Mirror

Canonical workbook: RPG制作_仕様正本_同期版.xlsx. Confirmed/structural rules here override old implementation values.

## Core
- Mobile portrait UI; 6 allies on a 3x3 ally grid, enemy side basically 3x3.
- No fixed classes. Core stats: PHY / SKL / ARC / MND.
- Battle resources: HP + unified SP. MP is obsolete except old-save compatibility.
- Physical: 斬 / 突 / 壊. Magic: 火 / 水 / 土 / 風 / 光 / 闇 / 無.
- Binds: 頭 / 腕 / 脚. Ailments: 盲目 / 猛毒 / 睡眠 / 気絶 / 動揺 / 誘惑 / 即死.

## Formation / range
- Positional distance: ally front -> enemy front = 1; maximum back -> back = 5.
- Range: near 1, mid 1-2, far 1-3, long 1-4, global 1-5.
- Normal attack: nearest enemy in the same forward lane that is in range. No automatic adjacent-lane snap.
- Normal movement: one orthogonal empty cell, costs one turn; no diagonal normal move.
- Manual weapon-set swap costs 0 turns; no automatic swapping.

## SP
- SP is the common resource for weapon skills, techniques and spells; it is not magic power.
- Maximum SP is not directly derived from PHY/SKL/ARC/MND.
- No automatic round regeneration. SP persists between battles.
- Normal attack / Guard SP recovery values are balance-controlled.
- Inn rest fully restores HP/SP/status; returning alone does not auto-heal.

## Mastery / skills
- Mastery Rank is 1-10. 1 Mastery Pt raises Rank by 1.
- Mastery Pt is also used to learn skills: standard 1 Pt; ultimate/keystone candidates 2 Pt.
- Rank unlocks candidates; it does not auto-learn every skill.
- Skill Set Capacity = 12 fixed. Active and Passive share it. Set Cost = 1-4.
- Weapon Masteries: 無手 / 格闘 / 短剣 / 剣 / 槌 / 斧 / 槍 / 鞭 / 鎌 / 刀 / 弓 / 銃 / 杖 / 盾 / 投擲.
- Armor: 魔装 / 軽装 / 重装.
- Sources: 灼陽 / 霊峰 / 海神 / 森羅 / 星辰 (0-1).
- Spell Masteries: 信仰 / 呪術 / 魔術 / 符術 / 機巧 / 異能 (0-2).
- Skill Masteries: 探索 / 士気 (0-2).
- Canonical workbook 08_SkillDB contains the active 315-skill runtime catalog. Runtime data is loaded through `skill-catalog-315.js`.

## Equipment semantics
- Slots: 主武器 / 副手 / 予備主 / 予備副 / 防具一式 / 装飾品 / 携行具.
- 無手 = no equipped hand weapon. Gauntlets/knuckles are 格闘 weapons.
- 投擲 Mastery uses throwable carry items; it is not a normal equipped weapon category.
- Shields are offhand.
- Each equipped weapon has exactly one normal physical attack type: 斬, 突 or 壊. Skills may override it.
- Runtime equipment data stores numeric range_min/range_max 1-5; near/mid/far/long/global are display labels.
- Dual-wield/two-hand numeric bonuses remain balance values.

## Combat model
- PHY: HP, physical defense, weight limit, PHY-scaling actions.
- SKL: speed, accuracy, evasion, critical, SKL-scaling actions and weapon-status accuracy.
- ARC: offensive spell power and ARC-scaling actions.
- MND: magic defense, healing/support and status/bind resistance.
- Normal attacks use weapon-configured Scaling; they are not universally PHY-based.
- Enemies use the same PHY/SKL/ARC/MND + skill Scaling model. Enemy claws/fangs/bodies/magical organs provide enemy weapon-base data.
- A single generic enemy Attack value is not authoritative.
- Enemy resistance data represents head/arm/leg binds and all seven ailments separately.

## Battle flow
- Turn order is fixed at round start using speed plus selected-action modifiers; ordinary speed changes apply next round.
- Reaction actions interrupt only on explicit triggers; Reaction -> Reaction chains are prohibited by default.
- Casting pays SP at start and normally resolves at the actor's next-round turn. Head bind, stun and sleep interrupt it.
- HP/SP persist after victory. Battle-only binds/ailments/buffs/debuffs and summons end after battle; KO persists.

## Growth / dungeon
- No conventional displayed level with automatic stat growth.
- EXP creates pending growth; inn rest settles pending Stat Pt / Mastery Pt.
- Exact EXP curve and reward quantities are balance-controlled.
- A run is basically 3 layers. Environments: 森林 / 洞窟 / 廃墟都市 / 山岳 / 沼地 / 砂漠遺跡 / 海上・船 / 地下神殿.
- Nodes include normal battle / strong enemy / event / camp / merchant / exploration / smith-workshop / boss.
- No equipment durability/repair.
- Camp once per layer: HP35% + SP35% + battle-status recovery; no KO revival.

## Base
- Home: next objective / notifications / next sortie + Inn / Guild / Market.
- Inn: rest / ally conversation / guest conversation / sortie preparation.
- Sortie preparation: formation / members / destination.
- Guild: member management / quests & reports / exploration records / relic appraisal / storage.
- Three formation presets save formation/equipment/skills with validity checks.
- Market: equipment / items / processing / selling. Processing: regional crafting / +3 enhancement / trait processing.
- Records: up to 40 expedition-history entries plus statistics / people / regions / enemy observations.
- Rumors come through NPC conversation, not a separate daily menu.

## Hub visual identity
- The six party-member cards must use clearly separated character identity colors; near-duplicate hues across members are avoided.
- Current hub identity palette: Warrior crimson / Paladin sapphire / Rogue violet / Archer emerald / Alchemist amber / Mystic cyan.
- Hub member cards use full-bleed, untinted character art over a member-specific background color. The character image itself must not be colorized.
- HP and SP are permanent slim hairline gauges at the bottom of each hub member card.
- Character overview artwork should not be hidden by an opaque top header; navigation may overlay the artwork.
- Character overview uses the high-resolution standing-art derivative rather than enlarging the lightweight battle/status asset.
- Inn / Guild / Market use their registered approved facility backgrounds and transparent NPC standing art. Legacy facility/NPC placeholder SVGs are not used for these three facility screens.
- Hub member portraits remain untinted; character identity color belongs to the card background, not the portrait pixels.
- HP/SP on hub cards use slim always-visible line gauges.

## Battle UI
1. ROUND / AUTO / speed / settings
2. turn order
3. main enemy + current acting ally presentation
4. commands
5. ally 3x3 cards
Commands sit immediately above ally cards. Character appeal has priority over tiny board-token presentation.

## Status discipline
- Implementation or passing tests do not imply approval.
- Rank 0-50, +5 Rank per Mastery Pt and ability-dependent Set Capacity are obsolete implementation rules.
- Structural rules and balance values must remain distinguishable.

## 315 Skill DB normalization
- Canonical workbook 08_SkillDB contains all 315 candidate rows with stable SK0001-SK0315 IDs.
- 315/315 rows now have normalized implementation schema fields, including explicit mechanics for the former 24 special-review rows.
- Runtime is now the canonical 315 catalog.
- Old 296 saves are not fuzzily renamed: skills that still exist by current key survive; unmatched old learned skills are archived in `legacySkills` and refunded as Mastery Pt.
- The two canonical `速射` rows use distinct runtime keys `速射（弓）` / `速射（銃）` while retaining display name `速射`.
- Machine-readable normalization status: spec/skill-normalization-status.json.

## 拠点・キャラクター UI（2026-09-29 確定）
- ホームの6人カードはキャラ画像と装飾的なカード背景を使わず、名前と状態を簡潔に表示する。
- キャラ画面の左右装備枠は透過した正方形とし、装備名の代わりに種類アイコンを表示する。装備名はアクセシビリティ名とタップ後の候補画面に残す。
- ABILITY / SKILL / MASTERY は立ち絵の下側に小さく配置する。
- キャラ画面の独立した6人切替ボタンを廃止し、常時表示する6枚のキャラカードで切り替える。

## 拠点の共通キャラカード（2026-09-29 確定）
- 拠点、施設、編成、キャラ画面で同じ6枚のキャラカードを常時表示し、タップで対象キャラを開く。別の仲間一覧・切替ボタンは置かない。
- 共通カードは画像なし、名前とHP・SPゲージを備えた低い表示とし、空いた高さを主画面へ渡す。
- キャラ画面の左右の正方形装備枠を小さく上寄せし、下の空間にPHY / SKL / ARC / MND / 物攻 / 魔攻 / 物防 / 魔防を文字と数値だけで表示する。

## 拠点カード・装備画面の調整（2026-09-29 確定）
- 共通カードの名前・HP・SPゲージは小さなカード内に正常に収める。
- 装備画面の高さは他の拠点画面と揃える。装備枠は左に主武器・予備主武器・携行具・重量、右に副手・予備副手・防具一式・装飾品を配置する。
- 顔の前にあったSWAPパネルを廃止する。換装操作は装備候補内で利用できる。
- 下部ステータスにはEXP・HP・SPと基本能力・攻撃・防御を文字と数値だけで表示する。

## キャラ画面の4パネル（2026-09-29 確定）
- キャラ画面の下側に装備枠と同じ半透明表現の4パネルを配置。左下にSTATUS（EXP・HP・SP）とABILITYを縦に、右下にSKILLとMASTERYを縦に並べる。
- 拠点カードは表示処理を一つに統合し、名前・HP・SPを表示する。旧画像カードの描画に戻さない。

## 拠点UIの透過と情報表示（2026-09-29 確定）
- 装備画面の外側のウィンドウ枠を表示しない。
- STATUS / ABILITY / SKILL / MASTERYの4パネルは装備枠と同じ51px正方形とし、アイコン＋短いラベルで表示する。STATUSを開くとEXP・HP・SPの詳細を見られる。
- 共通キャラカードは各HP・SPゲージの上に現在値 / 最大値を右寄せで表示する。
- 拠点の全UIで透過パネルの背後をぼかさず、背景を鮮明に保つ。

## 装備パネルと共通カードの整列（2026-09-29 確定）
- 装備8枠と画面下側の4機能枠は同じ51px正方形、左右7pxの端位置、5pxの縦間隔、同じ線色・透明度・ラベル体裁に統一する。
- 装備画面の拠点背景に暗いグラデーションや全画面の暗幕を重ねない。装備候補など文字を読む領域は個別の背景を使う。
- 共通キャラカードは名前の下にHPとSPを各1行で置き、ラベルと現在値 / 最大値をゲージに重ねる。
