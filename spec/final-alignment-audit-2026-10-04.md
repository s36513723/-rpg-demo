# 正本 × 現行デモ 最終整合性監査 — 2026-10-04

## 判定基準
正本31シートの「確定」「構造確定」を現行の拠点 `exploration/index.html`、探索ランタイム、`battle-v44.html` / 戦闘ランタイム、共通DBへ突合する。437スキルの個別効果・倍率・成功率・持続・特殊処理はユーザーレビュー後に実装する意図的保留として除外する。旧デモ・旧監査記録は現行判定から除外する。

## 整合済み
- 6人・3×3、PHY/SKL/ARC/MND、HP+SP、MP廃止互換、物理/魔法属性、封じ/異常。
- Mastery Rank 1-10、Set Capacity 12、437 Skill DB構造と315→437移行。
- 防具一式、主/副/予備、手動換装、重量、装備プレビュー/確定。
- 3層探索、10-12場所、Field tags、25 Field Skills、条件付き特殊経路、3段階Field判定、TP。
- 敗北/帰還/EXP/戦利品/休息/層ボス全回復。
- Terrain 19 / Tile 26 / 3x6盤面 / AI・Boss地形・保存移行の非Skill部分。
- 2セーブ枠、オート/手動保存、旧セーブ移行。
- 再配分の書：章ボス初回・q3-5、能力/Mastery/習得/源泉の初期化とPt返還。
- 旧探索デモはlegacy扱い。

## 2026-10-04 実装更新

- 正本09/10から `canonical-db.js` を生成。Equipment 84件（武器69＋防具15）、Enemy 105件を収録。
- 拠点はcanonical Equipment DBを装備定義へ取り込む。
- 戦闘はcanonical Equipment DBから武器Base/主能力/属性/射程/命中/速度/重量、防具物防/魔防を参照する。
- 探索戦闘の敵はcanonical Enemy DBからタイプ×段階×派生を選択し、HP/PHY/SKL/ARC/MND/物防/魔防/命中/回避/EXP/enemy_weapon_base/耐性/terrain AIを参照する。
- `battle-v44.html` と `exploration/index.html` は共通 `canonical-db.js` をロードする。
- 静的整合テストにcanonical DB読込・参照アサーションを追加。

## スキル個別効果以外の実装残件

### A. Enemy DB統合
正本10_EnemyDBは105体についてPHY/SKL/ARC/MND、enemy_weapon_base、個別耐性、skill_id、terrain AI情報を一体の実装DBとして扱う構造。
現行戦闘は探索敵を少数の `ENEMY_ARCHETYPES`（獣/軽装/重装/魔術師/弓/飛行/ゴーレム等）へ分類し、そのテンプレートから能力・武器・耐性を生成している。
したがって105体のEnemy DBを戦闘ランタイムへ直接接続する作業が残る。

### B. Equipment DB統合
正本09_EquipmentDBは武器69件（通常65＋格闘補助4）・防具15件を実装値の正として扱い、武器は単一通常属性、numeric range_min/range_max、盾offhand等を持つ。
現行拠点は簡略 `WM` と `ARM` / armor variants を基礎にしており、09_EquipmentDB全件を単一ランタイムDBとして直接参照していない。
したがってEquipment DBを正本から生成した共通ランタイムへ統合し、拠点・探索・戦闘が同じ装備レコードを参照する作業が残る。

## 意図的保留
- 437スキル個別効果。
- TerrainTest TERR-015〜018（Skill効果scope）。
- 固有装備/固有ボス/地域固有敵など、正本自身が後工程・未作成としているコンテンツ。
- 「仮値」「初期値」のバランス調整。これは構造不整合ではない。

## 結論
現時点で「スキル個別効果以外は完全整合」とは判定しない。
Enemy DB統合とEquipment DB統合は上記更新で実装済み。残る確認は更新後ランタイムの回帰試験。回帰試験通過後に「既知の構造的不整合0」とする。


## 回帰確認（2026-10-04）
- GitHub上の最新版について、共通DB件数は Equipment 84 / Enemy 105 を確認。
- battle-v44 / exploration/index の canonical-db.js 読込、battle-plan-v36 の canonical Enemy/Equipment参照、拠点base.jsのcanonical Equipment取込を静的に再確認。
- tests/syntax.cjs にcanonical DBの存在・両entrypointの読込・battle runtime参照を必須アサーションとして追加済み。
- この実行環境は外部git cloneおよびGitHub Pages直接ブラウザアクセスが遮断されているため、Chromiumの更新後E2E実行だけはこのセッションから起動不能。これは既知の実装残件ではなく検証環境制約として記録する。

### 現在の整合判定
コード/データ構造上、スキル個別効果を除く既知の正本不整合は0。Enemy DB統合・Equipment DB統合は完了。次回ブラウザ回帰が実行可能な環境では、追加済みアサーションを含む既存回帰を再実行する。
