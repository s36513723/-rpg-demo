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
- Normal movement: any cell in the same vertical lane costs one turn; selecting an occupied ally cell swaps the two. Horizontal normal movement and swapping are unavailable.
- Manual weapon-set swap costs 0 turns; no automatic swapping.

## SP
- SP is the common resource for weapon skills, techniques and spells; it is not magic power.
- Maximum SP is not directly derived from PHY/SKL/ARC/MND.
- No automatic round regeneration. SP persists between battles.
- Normal attack, Guard and time do not recover SP. Only rest, items and effects that explicitly specify recovery do.
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
- Initial EXP threshold is 100 and increases by 20 after each growth; all six registered members earn equal EXP. Each growth gives 1 Stat Pt plus 1 every fifth growth and 2 Mastery Pt (provisional quantities).
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

## 拠点・探索のHP/SPゲージ（2026-09-29 確定）
- 共通キャラカードのHP/SPは戦闘デモの味方カードに合わせ、高さ4px、HPを青緑 `#69c8bd → #a5ddd4`、SPを金色 `#cfa64e → #edcf78` のグラデーションとする。ラベル・数値はゲージに重ねて表示する。旧MPはSPに統合済み。

## 出撃準備の3タブ（2026-09-29 確定）
- 画面下部の編成・陣形・ダンジョンは、拠点ホームの宿屋・ギルド・市場と同じ3列の枠形状、約49pxの高さ、5pxの間隔、9px角丸、細い枠線、暗い半透明面、書式、控えめな影とする。小画面の高さは44pxのタップ領域を保つ。選択中は金色の細い下線で区別する。

## 探索から戦闘デモへの接続（2026-09-29 確定）
- 探索の戦闘地点から現在の `battle-v44.html` へ移動する。探索の出撃編成・陣形・HP/SP・敵編成・地形を引き継ぎ、勝敗または逃走後に結果と資源を探索へ返す。単独で開く戦闘デモは維持する。

## 探索戦闘の背景（2026-09-29 確定）
- 探索から `battle-v44.html` へ移る戦闘では、現在の階層テーマ（森林／洞窟／廃墟都市／山岳／沼地／砂漠遺跡／海上・船／地下神殿）に対応する登録済み正式背景画像を戦闘画面全体へ表示する。階層テーマが変われば次の戦闘背景も変わる。戦闘画面を単独で開いた場合は従来の白い幻想都市背景を維持する。

## 編成・陣形の一画面表示（2026-09-29 確定）
- 編成と陣形はスマホ縦画面で内部スクロールを発生させない。編成は登録6人を出撃／ギルド待機に関係なく3×2枠に置き、立ち絵タップでキャラ画面、隅の44px操作で出撃／待機を切り替える。陣形は3行を利用可能な高さに均等配置し、立ち絵タップと44pxの配置変更操作を分ける。下部3タブと共通キャラカードを維持する。

## 探索の帰還と敗北（2026-09-29 更新・確定）
- 探索マップから任意に帰還できる。帰還アイテムは不要。探索中に得た戦利品と獲得済みEXPを持ち帰る。
- 戦闘敗北でも探索中に得た戦利品とEXPを持ち帰る。現在の探索は終了し、次回はMAPから新しい探索を開始する。
- 戦利品は帰還後の鑑定まで使用・装備・加工・売却できない。
- AUTOは設定で「ガンガン使う」（初期）／「スキルを使うな」／「命を大事に」を選ぶ。セーブは独立した2枠で各枠自動保存。
