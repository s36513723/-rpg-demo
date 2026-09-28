# RPG Asset Registry

最終更新: 2026-09-28

画像生成チャットで確定した正式アートの台帳。
「作成済み」「GitHub画像本体保存済み」「現行UI接続済み」を分けて管理する。

## キャラクター通常立ち絵

| キャラクター | 正式 | GitHub資産 | 状況 |
|---|---|---|---|
| ウォリアー | ✓ | images/actor-war-body.svg | 保存済み |
| パラディン | ✓ | images/actor-run-body.svg | 保存済み |
| ローグ | ✓ | images/actor-rog-body.svg | 保存済み |
| アーチャー | ✓ | images/actor-ran-body.svg | 保存済み |
| アルケミスト | ✓ | images/actor-arc-body.svg | 保存済み |
| ミスティック | ✓ | images/actor-mys-body.svg | 保存済み |

## 戦闘用立ち絵

| キャラクター | 正式 | GitHub画像本体 | 状況 |
|---|---|---|---|
| ウォリアー | ✓ | images/battle-warrior.svg | 保存済み・Plan戦闘UI接続済み |
| パラディン | ✓ | images/battle-paladin.svg / images/paladin-battle.webp | 保存済み・戦闘UI接続済み |
| ローグ | ✓ | images/battle-rogue.svg | 保存済み・Plan戦闘UI接続済み |
| アーチャー | ✓ | images/battle-archer.svg | 保存済み・Plan戦闘UI接続済み |
| アルケミスト | ✓ | images/battle-alchemist.svg | 保存済み・Plan戦闘UI接続済み |
| ミスティック | ✓ | images/battle-mystic.svg | 保存済み・Plan戦闘UI接続済み |

## 行動用アイコン

| キャラクター | 正式 | GitHub画像本体 | 状況 |
|---|---|---|---|
| ウォリアー | ✓ | images/turn-warrior.svg | 保存済み・Plan戦闘UI接続済み |
| パラディン | ✓ | images/turn-paladin.svg / images/paladin-turn.webp | 保存済み・Plan戦闘UI接続済み |
| ローグ | ✓ | images/turn-rogue.svg | 保存済み・Plan戦闘UI接続済み |
| アーチャー | ✓ | images/turn-archer.svg | 保存済み・Plan戦闘UI接続済み |
| アルケミスト | ✓ | images/turn-alchemist.svg | 保存済み・Plan戦闘UI接続済み |
| ミスティック | ✓ | images/turn-mystic.svg | 保存済み・Plan戦闘UI接続済み |


## 戦闘用アイコン枠

| 種類 | 正式 | GitHub画像本体 | 状況 |
|---|---|---|---|
| 赤系フレーム | ✓ | 未整理 | 作成済み |
| 青系フレーム | ✓ | 未整理 | 作成済み |
| 金色 NEXT フレーム | ✓ | 未整理 | 作成済み |

用途の詳細（味方／敵／NEXT等）は実装時に既存UI仕様と照合し、勝手に変更しない。

## 戦闘背景

| 種類 | 正式 | GitHub画像本体 | 状況 |
|---|---|---|---|
| 白青系・水鏡の聖域／遺跡 | ✓ | 未整理 | 作成済み |

## 拠点NPC

画像の対応順はユーザー提示順で固定する。

| 施設 | 正式 | GitHub画像本体 | 状況 |
|---|---|---|---|
| ギルド NPC | ✓ | 未整理 | 作成済み |
| 宿屋 NPC | ✓ | 未整理 | 作成済み |
| 市場 NPC | ✓ | 未整理 | 作成済み |

## 拠点背景

| 施設 | 正式 | GitHub画像本体 | 状況 |
|---|---|---|---|
| ギルド背景 | ✓ | 未整理 | 作成済み |
| 宿屋背景 | ✓ | 未整理 | 作成済み |
| 市場背景 | ✓ | 未整理 | 作成済み |

## 現在の正式素材数

- 通常立ち絵: 6 / 6
- 戦闘用立ち絵: 6 / 6
- 行動用アイコン: 6 / 6
- 戦闘用アイコン枠: 3
- 戦闘背景: 1
- 拠点NPC: 3
- 拠点背景: 3

## 運用ルール

- 「正式」と記載された画像を旧仮SVG・旧顔画像より優先する。
- 画像が作成済みでもGitHub画像本体未整理なら、未作成扱いにしない。
- 旧 `gald.svg / lize.svg / ern.svg / sena.svg / mirea.svg / yuna.svg` 等を正式マスターと誤認しない。
- 旧 `facility_*.svg`・`npc_*_stand.svg` は正式NPC／背景へ置換するまでの仮素材。
- 戦闘・拠点・ステータス・行動順UIは最終的に本台帳の正式素材へ統一する。


## 登録状態の読み方

- 「正式登録」= ユーザーが正式素材として確定したこと。
- 「GitHub画像本体保存済み」= images/ 配下などに独立画像ファイルが存在すること。
- 「UI接続済み」= 現行またはPlan UIがその画像を実際に参照していること。
- 行動用アイコン6人分は独立画像ファイルとして保存済みで、Plan戦闘UIへ接続済み。
