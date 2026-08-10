# もう逃げラジオ 公式サイト

映画・書籍レビューのポッドキャスト番組「もう逃げラジオ」（杉本・前川）の公式サイト。
静的サイト + ブラウザミニゲーム集。GitHub Pages での公開を想定（base: `/mounige-radio-site/`）。

## コマンド

Node は `C:\nodejs` にあり **PATH に入っていない**。実行時は先頭に追加すること:

```powershell
$env:Path = "C:\nodejs;$env:Path"
npm run dev      # 開発サーバー (http://localhost:5173/mounige-radio-site/)
npm run build    # tsc で型チェック → vite build → dist/
npm run preview  # dist/ のプレビュー
```

### 制約: Node 20.12.2 のため Vite 6 を使用

Vite 7/8 は Node 20.19+ / 22+ が必要でクラッシュする。Node を 22 LTS に上げるまで
**vite を ^6 から上げないこと**。

## 構成

マルチページ構成。エントリは vite.config.ts の `rollupOptions.input` に登録する。

| ページ | HTML | エントリ TS |
|---|---|---|
| ホーム | index.html | src/site/main.ts |
| ゲーム一覧 | games/index.html | src/games/list.ts |
| ランナーゲーム | games/runner/index.html | src/games/runner/main.ts |
| カードゲーム | games/cards/index.html | src/games/cards/main.ts |
| プライバシーポリシー | privacy/index.html | src/privacy/main.ts |

```
src/
  site/        ホームページ (main.ts + site.css)
  shared/      共通部品。nav.ts の createNav() が全ページのナビ
  styles/      base.css — リセットと CSS 変数（テーマの唯一の定義場所）
  games/
    registry.ts  ゲーム一覧の定義（GameEntry[]）。ゲーム追加時はここに登録
    list.ts      一覧ページ。registry を描画
    engine/      ゲーム共通エンジン（loop, canvas, input, sprite, types）
    runner/      ランナーゲーム本体（main, player, world, obstacle）
public/          そのまま dist ルートへコピーされる（favicon.svg など）
```

## 規約

- 各 HTML は `<div id="root">` を持ち、エントリ TS が DOM を組み立てる（フレームワーク不使用）
- 全ページで `createNav()` と `createFooter()`（src/shared/）を呼ぶ。
  **プライバシーポリシーへの導線はフッターだけ**なので省略しないこと
- 画像は **WebP に統一**（public/images 配下）。透過キャラが多く PNG では重すぎるため。
  素材を追加するときも WebP に変換してから置く（favicon.png のみ例外）
- `<img>` には `width`/`height` を付ける（CLS 対策）。ファーストビュー外は `loading="lazy"`
- tsconfig は `verbatimModuleSyntax` 有効 → 型は必ず `import type` で
- 相対 import は `.js` 拡張子で書く（例: `from './world.js'`）
- 色・フォントは src/styles/base.css の CSS 変数を使う
  （`--sugimoto: #ff6b6b` = 杉本カラー、`--maekawa: #6bc5ff` = 前川カラー）
- リンクやアセットのパスは `import.meta.env.BASE_URL` を前置する（GitHub Pages の base 対応）

## 新しいミニゲームの追加手順

1. `games/<id>/index.html` を作成（既存の runner のものを流用）
2. `src/games/<id>/main.ts` を作成し、engine/ の部品で実装
3. vite.config.ts の `rollupOptions.input` にエントリを追加
4. src/games/registry.ts の `GAMES` に登録（一覧ページに自動で並ぶ）

## デプロイ

`main` に push すると GitHub Actions が自動でビルド・公開する。
公開URL・独自ドメインへの移行手順は [DEPLOY.md](DEPLOY.md) を参照。

アクセス解析は Google タグマネージャー（`GTM-KWVH8WFT`）。vite.config.ts の `gtmPlugin()` が
**本番ビルド時だけ**スニペットを注入するので、`npm run dev` は計測されない。
GA4 の測定タグは GTM 管理画面側で作る方針。**サイトに GA4 のスニペットを足すと二重計測になる**。

base パスはリポジトリ変数 `BASE_PATH` で切り替える（未設定なら `/mounige-radio-site/`）。
独自ドメインに移す際は `/` を設定するだけでよく、コード変更は不要。

## 計画と作業ログ

- サイト全体の方針・ロードマップ: [PLAN.md](PLAN.md)
- デプロイ・ドメイン設定: [DEPLOY.md](DEPLOY.md)
- 作業履歴: [WORKLOG.md](WORKLOG.md)

**作業ログの運用ルール（重要）**: セッションが切れても文脈を引き継げるように、
作業の区切りごと（機能の完成・重要な判断・問題解決のたび）に WORKLOG.md へ
こまめに追記すること。セッション終了間際にまとめて書くのではなく、都度書く。
書く内容: やったこと / 判断と理由 / 次にやること。
セッション開始時はまず WORKLOG.md の最新エントリを読んで状況を把握する。
PLAN.md の現状表・チェックリストも進捗に合わせて更新する。
