# Current RPG Specification Mirror

Canonical workbook: RPG制作_仕様正本_戦場地形完全設計_2026-10-01.xlsx. Confirmed/structural rules here override old implementation values.

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
- AUTO has three selectable policies: ガンガン使う (default), スキルを使うな and 命を大事に. The selected hub setting is passed into exploration battles.

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
- Canonical workbook `08_SkillDB` contains the single official 437-skill catalog. Runtime data is loaded through `skill-catalog-437.js`; `skill-catalog-315.js` remains only as a migration/compatibility source for the 185 retained weapon/armor definitions and old saves.

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
- EXP creates pending growth; inn rest settles pending Stat Pt / Mastery Pt. Exact EXP curve and reward quantities are balance-controlled.
- Permanent growth is Stat Pt + Mastery Pt. Stat Pt develops base abilities; Mastery Pt permanently expands a character's specialties and available options.
- Run-only growth uses **Tactical Pt (TP)**. TP is separate from permanent Stat Pt / Mastery Pt and from battle SP.
- TP is used only to temporarily acquire an unlearned skill for the current expedition. Normal Mastery / skill prerequisites still apply; permanently learned skills remain available without TP.
- TP gain schedule is an **initial implementation value**: expedition start 0; normal battle 0; strong-enemy victory +1; TP-reward special event +1; hidden-area discovery/clear +1; special treasure +1; Layer 1 boss +2; Layer 2 boss +2; Layer 3 boss 0 because the expedition ends immediately after. Rest, merchants and ordinary trap disarm give 0 by default. A full 3-layer clear is provisionally expected to yield about 6-9 TP. Temporary-skill TP cost is an initial implementation value: Rank 1-8 costs 1 TP and Rank 9-10 costs 2 TP. TP remaining and temporary acquisitions reset when the expedition ends.
- A respec item can reset stat allocations, Mastery ranks and learned skills, including the chosen Source, and return their spent points. Initial placement: first clear of each chapter boss and one one-time high-difficulty quest; it is not sold normally.
- One dungeon expedition is basically **3 layers, with a boss at the end of every layer**. The Layer 3 boss is the dungeon's final boss.
- Each dungeon has its own fixed theme, scenery, enemies, terrain, events, materials, treasure, bosses and story. Random generation stays inside that dungeon theme.
- Exploration is presented as **places**, not abstract function nodes. Ten shared place archetypes are used across dungeons, with theme-specific names/visuals: 廃屋 / 狭路・通路 / 広間・開けた場所 / 分岐路 / 崖道・段丘 / 水辺・水路 / 崩落・障害区域 / 遺構・人工物 / 隠し区画・脇道 / 深部・主室. The exact labels are provisional.
- A place may contain normal enemies, strong enemies, a merchant, treasure, a trap, rest, an NPC, an exploration target, a special event, nothing, or a combination of these.
- Routes should have different risk/reward character such as a dangerous shortcut, safer detour, or treasure-oriented route. Exploration skills can increase route information and available choices.
- Unchosen places are not carried over to the next expedition. The map is regenerated on the next run.
- Each layer randomly generates **10-12 places**, and one route traverses **5-7 places**.
- The full connection graph for the current layer is visible from the start, while each place's contents remain partially unknown. Exploration skills reveal more detail.
- Rest is represented as an in-world place such as a camp site, spring or safe room rather than an abstract rest node. **One rest place is guaranteed per layer, with an additional rest place appearing at low probability.** Current rest effect remains HP35% + SP35% + status recovery; no KO revival.
- Each layer boss fully restores the party after victory before the next progression step.
- Voluntary return is available **only from designated return locations** on the exploration map; no return item is consumed.
- No equipment durability/repair.
- Successful return after defeating the Layer 3 boss grants/settles expedition loot and EXP. Exact quantities are balance-controlled.
- On defeat: **forced return to base; current expedition progress is lost. Earned loot and EXP are retained and settled. Consumed items are not restored; HP/SP/status are not automatically healed.**

## Base
- Home: next objective / notifications / next sortie + Inn / Guild / Market.
- Inn: rest / ally conversation / guest conversation / sortie preparation.
- Sortie preparation: formation / members / destination.
- Guild: member management / quests & reports / exploration records / relic appraisal / storage.
- Three formation presets save formation/equipment/skills with validity checks.
- Two independent save slots each auto-save their own progress. Settings can switch slots, save manually, export/import JSON and restore the current slot's backup.
- Materials, tools and equipment acquired during an expedition remain sealed until return and guild appraisal. Existing tools taken into the expedition remain usable.
- Market: equipment / items / processing / selling. Processing: regional crafting / +3 enhancement / trait processing.
- Records: up to 40 expedition-history entries plus statistics / people / regions / enemy observations.
- Rumors come through NPC conversation, not a separate daily menu.

## Hub visual identity
- The six shared member cards have no character pictures or colored backgrounds. They use the same dark translucent panel, thin gold border and typography as the surrounding controls.
- HP and SP use persistent 4px gauges with overlaid labels and values, matching the battle demo colors and thickness.
- Character overview artwork should not be hidden by an opaque top header; navigation may overlay the artwork.
- Character overview uses the high-resolution standing-art derivative rather than enlarging the lightweight battle/status asset.
- Inn / Guild / Market use their registered approved facility backgrounds and transparent NPC standing art. Legacy facility/NPC placeholder SVGs are not used for these three facility screens.
- Character portraits elsewhere in the hub remain untinted and use transparent standing art.

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

## 437 Skill DB
- Canonical workbook `08_SkillDB` is the only official Skill DB and contains 437 skills.
- Runtime composition is 185 weapon/armor skills plus 252 Source / Spell / Exploration / Morale skills from the current canonical guide.
- The 25 Field Skills are part of those 437 records. `16_FieldSkill` and the runtime Field registry are derived views, not independent Skill DBs.
- `skill-catalog-437.js` is the primary runtime catalog. The former 315 catalog is retained only for deterministic ID-based migration and compatible mechanics of retained weapon/armor skills.
- Old skill names are migrated by stable ID where possible. Removed `強敵察知` is not auto-renamed; its learned point is refunded and the legacy name is archived.
- Balance coefficients and newly normalized effect details remain playtest-controlled even when their structural role is canonical.

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

## キャラ詳細の視覚調整（2026-09-29 確定）
- 共通キャラカードは拠点の操作パネルと同じ金色の細い縁と暗い半透明面・書体に揃え、HP/SPゲージは細線にする。
- キャラの立ち絵をすべて約1.5cm下げる。装備や能力の操作パネルは動かさない。
- キャラ能力系画面の外枠と一面の緑色背景を廃止し、場所の背景と立ち絵を見せる。個別の情報セルには読みやすい中立色の半透明面を使う。
- ステータス画面はEXP・HP・SP・状態・重量に加え、PHY/SKL/ARC/MND・物理攻撃力・魔法攻撃力・物理防御力・魔法防御力を表示する。
- パラディンの保管済み素材には白い背景片が残っていたため、デザインを引き継いだ追加透過版を拠点立ち絵として使う。

## キャラ画面の4パネル（2026-09-29 確定）
- キャラ画面の下側に装備枠と同じ半透明表現の4パネルを配置。左下にSTATUS（EXP・HP・SP）とABILITYを縦に、右下にSKILLとMASTERYを縦に並べる。
- 拠点カードは表示処理を一つに統合し、名前・HP・SPを表示する。旧画像カードの描画に戻さない。

## 拠点UIの透過と情報表示（2026-09-29 確定）
- 装備画面の外側のウィンドウ枠を表示しない。
- STATUS / ABILITY / SKILL / MASTERYの4パネルは装備枠と同じ51px正方形とし、アイコン＋短いラベルで表示する。STATUSを開くとEXP・HP・SPの詳細を見られる。
- 共通キャラカードは各HP・SPゲージと同じ行に現在値 / 最大値を右寄せで表示する。
- 拠点の全UIで透過パネルの背後をぼかさず、背景を鮮明に保つ。

## 装備パネルと共通カードの整列（2026-09-29 確定）
- 装備8枠と画面下側の4機能枠は同じ51px正方形、左右7pxの端位置、5pxの縦間隔、同じ線色・透明度・ラベル体裁に統一する。
- 装備画面の拠点背景に暗いグラデーションや全画面の暗幕を重ねない。装備候補など文字を読む領域は個別の背景を使う。
- 共通キャラカードは名前の下にHPとSPを各1行で置き、ラベルと現在値 / 最大値をゲージに重ねる。

## キャラ詳細と立ち絵の確認（2026-09-29 確定）
- キャラの能力値・スキル・修練などの詳細画面には共通のABILITY / SKILL / MASTERYタブ列を出さない。装備画面の4つのアイコンから各画面へ進み、詳細内で必要な項目切替は残す。
- 共通キャラカードは薄い透過背景と控えめな枠にし、HP/SPゲージを2pxの細線にする。数値は同じ行に表示する。
- 保管済み最終切り抜き素材のキャラ6人（戦闘用立ち絵の透過版）と施設NPC3人を拠点画面に使用する。旧WebPに残る白い抜け残りは再使用しない。

## 共通ナビとキャラカードの接続（2026-09-29 確定）
- BACKは現在の画面から直前の階層に戻る。同じ画面内でのキャラ・装備枠・項目・絞り込みの切替は階層を増やさない。拠点施設の入口から入った画面も施設内の直前の画面へ戻す。
- 共通キャラカードは6人を一つの細い帯として表示し、個別の角丸枠を廃止する。名前とHP/SPの数値・細線ゲージは維持し、選択中は控えめな金色の下線で示す。
- 下げた立ち絵の下端はカード直前で背景になじませ、水平な切断に見えないようにする。背景画像自体はぼかさない。

## キャラゲージと施設窓（2026-09-29 確定）
- 共通キャラカードのHP・SPラベルと数値は各ゲージの上に重ね、各人の情報を小さな帯の中に収める。
- 約1.5cm下げた立ち絵は足先を隠さず、共通カードの手前で全身が見える大きさに収める。
- ギルド・市場・宿屋のメッセージ欄は施設画面の最下部に置く。コマンドを開いた後の内容窓は左側のNPC名の下に置き、内容量に関係なく画面サイズに応じた一定の寸法とし、中身だけスクロールする。

## 戦闘UIの被弾演出と対象表示（2026-09-29 確定）
- 味方の六角カードではHP/SPゲージを横幅が最も広い中央部分に置く。被弾時は該当カードを点滅させ、ダメージ数値を出す。敵味方のHPゲージは増減をアニメーションする。
- 4コマンドのアイコンを明確に表示する。対象選択中の敵は本体を発光させず、名前の上の小さな紫色の逆三角カーソルで示す。

## 出撃準備とギルド待機（2026-09-29 確定）
- 出撃準備のタブは画面下側に左から「編成」「陣形」「ダンジョン」。出撃準備は開いている施設やホームのコマンド・NPCを背面に重ねず、同じ場所の背景画像を独立して描画する。編成と陣形の6人画像は保管済みの透過済み最終立ち絵を使う。3画面のタブとカードは拠点共通の寸法・細い金縁・文字に揃え、固有の緑色背景を廃止する。選択中のタブは細い金色の下線で示す。編成プリセットも同じ拠点背景と半透明の金縁UIを使う。
- 陣形は3×3のマス内にキャラ画像を全面表示し、画像をタップするとそのキャラの詳細へ進む。配置変更は別の操作で選択する。
- 出撃枠は最大6人。編成タブで登録メンバーを出撃とギルド待機の間で移動し、陣形・保存・戦闘へ選択を引き継ぐ。現在のデモには登録済み6人がいる。
- 施設のコマンド窓は内容量に左右されず、左のNPC名の下から最下部のメッセージ欄の手前までを占める。長い内容だけ内部スクロールする。

## 戦闘立ち絵・コマンド・敵カーソルの視認性（2026-09-29 確定）
- 戦闘の大型立ち絵は拠点と同じ最終透過素材（warrior/rogue/archer/alchemist/mystic は `hub-standing-*-clean.webp`、paladin は `hub-standing-paladin-transparent.webp`）を参照する。
- ATTACK / SKILL / ITEM / DEFEND はアイコンを上、文字を下に置き、重ならない。
- 敵の逆三角カーソルは明るい背景・敵本体の上でも見える寸法と輪郭にする。通常白、候補赤、一度選択した対象は黄色発光という既存の状態区分を維持する。

## 戦闘コマンドと敵カーソルの造形（2026-09-29 確定）
- コマンドプレート内のアイコンと文字は中央で一体に見える間隔へ整える。
- 敵の逆三角カーソルは細い多面体風の縁と控えめな光を持たせ、通常白・候補赤・一度選択した対象の金色を見分けられるようにする。対象選択と確定の挙動は維持する。

## 戦闘の行動選択状態（2026-09-29 確定）
- ATTACKが初期選択されている間は、その味方の通常攻撃が届く敵だけを赤い候補カーソルで示す。一度タップで金色の仮選択、二度目で行動を予約する。
- SKILL / ITEM を開いたときは該当するコマンドだけを紫色で強調する。別の味方へ進んだときはその味方の選択状態へ同期する。
- 敵向けの通常攻撃や攻撃スキルの対象選択中に味方カードをタップした場合、対象外の警告を出さず、その味方へ操作を切り替える。
- 行動を予約した味方カードは金色の輪郭と完了印で区別し、カードをタップすると予約を解除して行動を選び直せる。ラウンド処理中は変更しない。

## 戦闘メッセージと再生操作（2026-09-29 確定）
- 戦闘処理中の短いメッセージは画面最下部のコマンド欄と同じ位置に表示する。コマンドと重ねて読ませず、固定領域を切り替える。
- AUTO列は細い半透明枠でまとめ、AUTO・再生／一時停止・倍速を小さな間隔で縦に並べる。再生／一時停止は処理中だけ表示する。メッセージ右端の送りボタンは表示しない。

## 敵の戦闘不能演出（2026-09-29 確定）
- 敵のHPが0になったら、短い発光・消失演出の後に戦場の敵画像と対象マークを見えなくする。倒れた敵は対象候補と行動順から外す。

## 敵の色付き囲みの廃止（2026-09-29 確定）
- 敵の周囲に色付きの足元リングや対象選択時の敵本体の色付き輪郭・発光を出さない。通常・候補・仮選択の区別は既存の逆三角カーソルで示す。対象選択と確定の操作は維持する。

## 探索地図下の操作パネル（2026-09-30 確定）
- 地図下の「進行中の場所へ」「封印回路」のタブを削除し、「道具」「探索スキル」「スキルセット」「戦利品」の4パネルを配置する。進行中の場所へは地図上の地点を再度タップして戻る。
- 道具は探索中に使用できる所持道具、探索スキルは誰かがセットしていて使用可能な技能と担当者、スキルセットは6人のセット状態とTPによる一時習得、戦利品は今回の取得物とEXPを表示する。アクティブスキルは地点で使用し、パッシブスキルは戦闘で自動発動する。仕掛けの調査は調査地点で行う。
- 共通場所タイプの「入口・境界」は「廃屋」に変更。地図のアイコンは敵・調査・人の気配・休息・仕掛けなどを予測できる手掛かりとし、敵の細分類や報酬は探索前に断定しない。探索技能により情報を増やす。

## 拠点・探索のHP/SPゲージ（2026-09-29 確定）
- 共通キャラカードのHP/SPは戦闘デモの味方カードに合わせ、高さ4px、HPを青緑 `#69c8bd → #a5ddd4`、SPを金色 `#cfa64e → #edcf78` のグラデーションとする。ラベル・数値はゲージに重ねて表示する。旧MPはSPに統合済み。

## 出撃準備の3タブ（2026-09-29 確定）
- 画面下部の編成・陣形・ダンジョンは、拠点ホームの宿屋・ギルド・市場と同じ3列の枠形状、約49pxの高さ、5pxの間隔、9px角丸、細い枠線、暗い半透明面、書式、控えめな影とする。小画面の高さは44pxのタップ領域を保つ。選択中は金色の細い下線で区別する。

## 探索から戦闘デモへの接続（2026-09-29 確定）
- 探索の戦闘地点から現在の `battle-v44.html` へ移動する。探索の出撃編成・陣形・HP/SP・敵編成・地形を引き継ぎ、勝敗または逃走後に結果と資源を探索へ返す。単独で開く戦闘デモは維持する。
- 戦闘敗北では拠点へ強制帰還し、今回の探索進行を失い、使用済み道具は戻らない。獲得済みの戦利品・EXPは保持して帰還時に精算する。宿で休むまでHP/SPは自動回復しない。

## 探索戦闘の背景（2026-09-29 確定）
- 探索から `battle-v44.html` へ移る戦闘では、現在の階層テーマ（森林／洞窟／廃墟都市／山岳／沼地／砂漠遺跡／海上・船／地下神殿）に対応する登録済み正式背景画像を戦闘画面全体へ表示する。階層テーマが変われば次の戦闘背景も変わる。戦闘画面を単独で開いた場合は従来の白い幻想都市背景を維持する。

## 編成・陣形の一画面表示（2026-09-29 確定）
- 編成と陣形はスマホ縦画面で内部スクロールを発生させない。編成は登録6人を出撃／ギルド待機に関係なく3×2枠に置き、立ち絵タップでキャラ画面、隅の44px操作で出撃／待機を切り替える。陣形は3行を利用可能な高さに均等配置し、立ち絵タップと44pxの配置変更操作を分ける。下部3タブと共通キャラカードを維持する。

## 拠点UI監査の改善（2026-09-29 確定）
- 盾は副手だけに装備可能。店頭の「装備可能」は能力値と修練の双方を判定し、候補の説明と一致させる。
- 依頼掲示板は受注可能な未受注依頼を初期表示し、未開放の依頼は「全件」にまとめる。スキルは習得済み全件を初期表示し、セット中が空ならセット方法を案内する。
- ギルドのメンバー管理には重複した6人一覧を置かず、常時表示の共通キャラカードから開く。陣形の空き枠と行見出し、準備不足の理由を明確にする。ステータスは縦画面で横にはみ出さない。
- 会話結果は施設の手続き文ではなく会話に合う文を用いる。武器強化は必要素材と所持数を示す。保管庫は数量を選んで確認後に預ける。設定も共通の背景・透過面・金縁に揃える。

## 315技のうち84 Active技の効果初期案（2026-09-29・初期実装値／要レビュー）
- 前回監査で個別の効果処理が空または効果方針に足りなかった84技について、ID別に対象・発動条件・効果種別・係数・持続を設計する。詳細は `skill-effect-design-84.js` と `spec/skill-effect-design-84.md` を参照する。
- 正本Skill DBのAL:AR列と同期する。反応技6件は予約条件と発火条件を分離する。旧対象列と設計案が食い違う6件、旧条件の意味が曖昧な5件は正本に整合メモを残す。これは設計段階のデータで、戦闘エンジンには未接続。315技の一括ランタイム置換、旧296技の移行完了、84技の実戦効果確認を意味しない。検証結果は `spec/skill-effect-verification-2026-09-30.md`。
