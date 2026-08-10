# 作業ログ

セッションが切れても文脈を引き継げるように、作業の区切りごとに上へ追記する。
書式: 日付見出し → やったこと / 判断と理由 / 次にやること

---

## 2026-08-10

### 🚀 GitHub Pages 公開完了（フェーズ1完了）

- git init（main）→ 初回コミット（62ファイル）
- `gh repo create mounige-radio-site --public --source . --push`
  → **https://github.com/ortransf/mounige-radio-site**
- .github/workflows/deploy.yml 新規作成（push で build → deploy、Node 22、
  actions/upload-pages-artifact@v3 + deploy-pages@v4）
- Pages を build_type=workflow で有効化。初回デプロイ成功（build 11s / deploy 8s）
- **公開URL: https://ortransf.github.io/mounige-radio-site/**
  全ページ・アセット 200 確認、本番スクリーンショットで表示確認済み
- 注意: actions/*@v4 系に Node20 非推奨の警告あり（動作は問題なし。
  いずれ @v5/@v6 に上げる）

### リザルト画面のサムネ表示

- ゲームオーバー画面の「回収した過去回」をテキスト列挙→サムネイルグリッドに変更。
  56px 白枠カード + #番号（ピクセルフォント）、同じ回の重複は ×N バッジ、
  多い時はスクロール（max-height 180px）
- デバッグ用 `?demo=gameover` を追加（リザルト画面の表示検証用。collected を
  ダミーデータで埋めて endGame() を呼ぶ）
- スクショ確認済み → コミット & push（本番反映）

### 残タスク

- ゲーム背景の AI 生成（Google AI Studio 課金有効化待ち → gen_bg.py 再実行）
- ブラウザでの実プレイ確認（体感調整）
- OGP メタタグ、Spotify embed などフェーズ2（PLAN.md 参照）

---

## 2026-08-08

### ★ セッション終了時点の状態と次にやること

ここまでの成果: サイト3ページ完成（明るいピンクテーマ・番組ロゴ・公式リンク全部有効）、
ランナーゲーム完成（キャラスプライト・敵=相方・過去回収集・ピクセル風）。ビルド green。

**次回の TODO（優先順）:**
1. **git init + GitHub Pages デプロイ**（PLAN フェーズ1。ユーザー承認済みの流れ）
2. ゲーム背景の AI 生成 — Google AI Studio の課金有効化待ち。
   有効化されたら scratchpad/gen_bg.py 再実行（キー: C:\Users\ortra\.gemini_api_key.txt）。
   ※scratchpad はセッション毎に変わるので、消えていたら WORKLOG 2026-08-08 の
   「背景生成の試行」の項を参考に再作成（モデル: gemini-2.5-flash-image 系、
   出力: public/images/games/runner/bg/bg1..4.png、ゲーム側は対応済み）
3. ブラウザでの実プレイ確認（敵の分身・過去回収集・当たり判定の体感調整）

**環境の要点**: Node 20.12.2 @ C:\nodejs（PATH外）/ Vite 6 固定 /
テキスト編集に Set-Content 禁止（文字化け事故防止）/ 開発サーバー: npm run dev → :5173

### ホーム並び替え + 背景生成の試行（課金待ちでブロック）

- ホームの順序変更: ロゴ → 紹介文 → **配信プラットフォーム/連絡先カード** →
  **ミニゲームで遊ぶボタン（最下部）**。ヒーローの「Spotify で聴く」ボタンは削除
- Gemini API キー受領（`C:\Users\ortra\.gemini_api_key.txt`・53bytes・リポジトリ外）。
  ListModels は成功、利用可能な画像生成モデルは gemini-2.5-flash-image /
  gemini-3.1-flash-(lite-)image / imagen-4.0 系
- **背景生成は 429 でブロック**: 全画像モデルで
  `free_tier_requests, limit: 0` → このプロジェクトでは**画像生成が無料枠対象外**。
  Google AI Studio 側で課金有効化されたら scratchpad の gen_bg.py を再実行するだけ
  （モデルフォールバック実装済み。出力先 public/images/games/runner/bg/bg1..4.png、
  ゲーム側の読み込みコードは対応済みで画像を置けば自動で使われる）

### 公式リンク反映（ユーザー提供）

- LINKS 定数（site/main.ts）に反映済み:
  - YouTube: https://www.youtube.com/@mounigeradio
  - Apple Podcasts: https://podcasts.apple.com/jp/podcast/.../id1679584302
  - X: https://x.com/monigeradio
  - お便りフォーム: https://forms.gle/399x93EJv9Kh6QSN6
  - メール: monigeradio@gmail.com / ハッシュタグ: #もう逃げラジオ
- 連絡先行（ハッシュタグの X 検索リンク + mailto）をプラットフォームカード下に追加
- 全リンク有効化を確認（「準備中」表示は消滅）。ビルド green

### 敵の相方化・ピクセル風味付け・公式ロゴ・SNSリンク枠

- **障害物 = 相方そのもの**: ネタバレ/脱線トークのアイコンを廃止し、相方キャラの分身
  （34x68、左向き反転）が突っ込んでくる方式に。地上型（前傾で走る）と空中型
  （ふわふわ上下 + 傾き）の2種。obstacle.ts の setRivalImage() でゲーム開始時に画像設定
- **ピクセル風（ふんわり）**: DotGothic16 を追加し、ボタン・ナビメニュー・HUD・ヒント・
  プラットフォームラベルに適用（見出し Mochiy Pop One / 本文 M PLUS Rounded は維持）。
  カード/ボタンの影をハードシャドウ（ぼかし無しのズレ影、--shadow-pixel）に変更、
  hover は左上に浮く動き。ゲーム canvas は imageSmoothingEnabled=false でドット感
- **配信プラットフォーム**: Simple Icons CDN から公式ブランドSVG取得
  （public/images/icons/: spotify/youtube/applepodcasts/x/googleforms）。
  Spotify/YouTube/Apple Podcasts の3カード表示に刷新
- **X・お便りフォーム**: ピル型ボタンを追加。**URL は LINKS 定数（site/main.ts 冒頭）に
  集約**。空文字なら自動で「準備中」表示（グレーアウト）。
  → YouTube / Apple Podcasts / X / Google フォームの URL が決まったらここに入れるだけ
- **事故と教訓**: PowerShell の Get-Content/Set-Content で HTML を編集したら
  BOM無しUTF-8 が cp932 解釈されて日本語タイトルが文字化け。3ファイルとも Write で復旧。
  **テキストファイルの編集は必ず Write/Edit ツールを使うこと（Set-Content 禁止）**
- ビルド green。ホーム全景 + プレイ中（前川操作・杉本が敵）をスクショ確認

### 明るいデザインへ刷新 + フォント変更 + キャラちりばめ

- **フォント**: Google Fonts 導入（3つの HTML）。見出し = Mochiy Pop One（h1-h3、
  base.css で一括適用・weight 400 のみ）、本文 = M PLUS Rounded 1c
- **配色を明→反転**: base.css の変数を全面変更。ページ背景 #fdeef8（ソフトピンク）、
  カード白、文字 #33254a、アクセント #ff2f92（ホットピンク）。
  シアンは明背景で読めないため文字用に --maekawa-text: #009fae を追加
  （--maekawa はゲーム内・ボーダー用に温存）
- **hero**: アートワーク風のピンク〜紫グラデ + 白ドット柄。ロゴ左右にキャラ立ち絵
  （ふわふわ浮遊アニメ、前川は位相ずらし）
- **キャラちりばめ**: public/images/chars/ に sugimoto/maekawa（runnerからコピー）+
  reading.png（読書イラスト透過版）。ホーム配信プラットフォームカードに読書イラスト、
  ゲーム一覧ヘッダー左右に傾けたキャラ
- **ゲーム画面はあえてダークのまま**（明るいサイトの中で「画面」として映えるよう
  枠+シャドウ付き）。オーバーレイ/HUD の文字色は明色をハードコード
  （CSS変数が明テーマ化したため）
- ゲーム一覧サムネもピンク背景で再生成
- ビルド green、3ページのスクリーンショット確認済み

### ロゴ適用 + ゲームの番組化（敵=相方 / 得点=過去回）

- **ロゴ**: `01_サムネイル\2x\アセット 1@2x.png`（黄円+クリーム文字の公式ロゴ）を加工 →
  public/images/logo.png（356x240）+ favicon.png（64px）。ナビとホーム hero に適用、
  favicon.svg は削除して PNG に差し替え（3つの HTML すべて）
- **敵=相方**: 選んだホストの相方が画面右端に立ち（左右反転で対面、上下ボブ）、
  障害物「ネタバレ」（足元）「脱線トーク」（口の高さ〜変動）が相方の手元からスポーン。
  投げられた感を出すため障害物は揺れ回転。ゲームオーバーは「◯◯の妨害で収録終了…」
- **得点=過去回**: ⭐を廃止し、実際のエピソードサムネ（#101〜#123 の18枚、96px に縮小）を
  収集アイテム化。白枠+番号表示、回収で+100点、ゲームオーバー画面に回収リスト表示。
  番号定数は src/games/runner/episodes.ts（素材更新時はここも更新）
- **背景リッチ化（進行中）**: Gemini API で事前生成→静的配置→プレイごとにランダム1枚方式。
  main.ts は bg/bg1..4.png を tryLoadImage で読み、無ければ現行グラデにフォールバック済み。
  **GEMINI_API_KEY 待ち**（ブラウザから直接生成はキー漏洩のためNG、生成は開発時のみ）
- デバッグ用に `?autostart=sugimoto|maekawa` でプレイ即開始を追加（スクショ検証用）
- ビルド green。ヘッドレスでホーム/選択/プレイ中を確認（プレイ中: 両キャラ+HUD 表示OK）

### 番組素材の組み込み（キャラ画像・サムネイル・テーマ色）

- 素材元: `D:\Googleドライブ\0_もう逃げラジオ`（番組制作ワークスペース。CLAUDE.md あり）
- **キャラ対応（ユーザー確認済み）: 紫の頭（オレンジパーカー）= 杉本 / 水色の頭（緑スーツ）= 前川**
- `07_アートワーク` の透過PNG（2048x2048, RGBA）を Python/PIL で加工 →
  public/images/games/runner/ に配置:
  - sugimoto.png（正面_A を切り抜き・高さ512px、頭色 #b600ff）
  - maekawa.png（正面_1A を同様、頭色 #00fff9）
  - thumbnail.png（読書_A をダーク背景 800x450 に合成）
  - 加工スクリプトは scratchpad の prep_assets.py（使い捨て）
- テーマ色を実キャラ色に変更: --sugimoto #ff6b6b→#b600ff / --maekawa #6bc5ff→#00fff9
- ランナー改修: プレイヤーを矩形→キャラ画像スプライトに（preloadImages / drawImage、
  ジャンプ中は前傾回転）。ホスト選択ボタンにキャラ立ち絵を表示
- ゲーム一覧: カード幅を max-width 420px に修正（巨大化バグ解消）、実サムネイル表示
- ビルド green + スクリーンショットで一覧・選択画面の表示を確認済み
- **ゲーム方針（ユーザー決定）: ランナー改修のみ。** D: の game/ にある ARG 謎解きゲーム
  （完成済み）の移植は今回見送り（将来の候補として PLAN 参照）
- 未確認: プレイ中のキャラ描画（canvas 内）はブラウザでの手動確認待ち

### 画面確認（デプロイ前チェック）

- 開発サーバー起動 + ヘッドレス Chrome で3ページのスクリーンショットを確認
- ホーム / ランナー（ホスト選択画面）: 表示 OK
- **発見した問題**: ゲーム一覧はゲームが1件のためカードが横幅いっぱいに広がり、
  16:9 サムネイルが巨大化して情報部分が下に押し出される
  → game-card に max-width を付けて修正予定
- この後: レイアウト修正 → git init → GitHub Pages デプロイ

### やったこと

- **初期状態の把握**: リポジトリに2世代のコードが混在していた。
  完成済み世代（engine/, nav.ts, registry.ts, site/main.ts, 各CSS）と、
  存在しないAPI（renderNav, games, startLoop, Vec2）を参照する骨組みスタブ
  （list.ts, runner/ 一式）。ビルドは8件のTSエラーで失敗する状態だった。
- **ビルド修復**:
  - src/games/list.ts を実在API（createNav / GAMES）で書き直し、#root 対象に修正
  - スタブ src/games/list/（35バイトのCSS）を削除、本物の list.css を使用
  - src/games/registry.ts: パスをベース相対化、サムネイルを optional + 絵文字代替に
  - src/games/engine/sprite.ts: `import type` に修正（verbatimModuleSyntax 対応）
  - games/runner/index.html を新規作成（vite.config.ts が要求していたが存在しなかった）
  - 全HTMLの favicon パスを dist 配置に合わせて修正（./public/favicon.svg → ./favicon.svg 等）
- **ランナーゲーム実装**（src/games/runner/ の main / player / world / obstacle を全面書き直し）:
  ホスト選択（杉本=赤・前川=青）、スペース/↑/タップでジャンプ、
  「ネタバレ」「脱線トーク」障害物、⭐収集、スコアHUD、ゲームオーバー→リトライ。
  既存 engine（createGameLoop, setupCanvas, createInputState, intersects）の上に実装。
- **依存関係の問題を2つ解決**:
  1. npm の optional dependency バグで rolldown のネイティブバインディング欠落
     → node_modules + package-lock.json 削除して再インストール
  2. Vite 8 が Node 20.12.2 では起動時クラッシュ（util.styleText の配列引数は Node 20.19+）
     → **Vite 6.4.3 にダウングレード**して解決。設定変更は不要だった
- **ビルド green を確認**: dist/ に3ページ + アセット一式が出力される
- **ドキュメント作成**: CLAUDE.md（開発ガイド）、PLAN.md（サイト計画書）、本ファイル

### 判断と理由

- Vite 6 へのダウングレードを選択（Node のシステム更新はユーザー環境への影響が大きいため）。
  Node 22 LTS に上げたら Vite 最新へ戻してよい
- サムネイル画像が存在しないため registry は絵文字フォールバック方式にした

### 次にやること（PLAN.md フェーズ1）

- [ ] git init + 初回コミット
- [ ] GitHub リポジトリ作成・push
- [ ] .github/workflows/deploy.yml（GitHub Pages デプロイ、CI は Node 22）
- [ ] 公開URLで動作確認

### 環境メモ

- Node 20.12.2 @ C:\nodejs（PATH 未登録。`$env:Path = "C:\nodejs;$env:Path"` が必要）
- git リポジトリ未初期化のまま
