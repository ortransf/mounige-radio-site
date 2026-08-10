# デプロイと独自ドメイン設定

## 現在の構成

| 項目 | 内容 |
|---|---|
| ホスティング | GitHub Pages（GitHub Actions からデプロイ） |
| リポジトリ | https://github.com/ortransf/mounige-radio-site |
| 公開URL | **https://monigeradio.com/** |
| ドメイン | monigeradio.com（Cloudflare Registrar / DNS も Cloudflare） |
| 旧URL | https://ortransf.github.io/mounige-radio-site/ （新ドメインへリダイレクト） |
| デプロイ契機 | `main` への push（[.github/workflows/deploy.yml](.github/workflows/deploy.yml)） |

`main` に push すれば1〜2分で本番に反映される。手動実行は Actions タブの
「Deploy to GitHub Pages」→ Run workflow から。

## base パスの仕組み

GitHub Pages のサブパス公開（`github.io/mounige-radio-site/`）では全アセットに
プレフィックスが要るが、独自ドメインでは不要になる。この差はリポジトリ変数で吸収する。

- [vite.config.ts](vite.config.ts) が環境変数 `BASE_PATH` を読む（未指定なら `/mounige-radio-site/`）
- ワークフローが `vars.BASE_PATH` を渡す（未設定なら既定値）
- コード側は `import.meta.env.BASE_URL` を前置しているので、変数を変えるだけで全リンクが追従する

---

## monigeradio.com への移行手順（✅ 2026-08-10 完了済み・記録として保持）

> 以下は実施済み。同じ構成をもう一度組む場合や、設定が壊れたときの参照用。
> 現在の設定値: `BASE_PATH=/`、GitHub Pages の cname=monigeradio.com、HTTPS 強制 ON。

### Step 1. ドメインを取得する（要決済・手動）

1. https://dash.cloudflare.com/ にログイン（アカウントが無ければ作成し、メール認証を済ませる）
2. 左メニューの **Domain Registration > Register Domains**
3. `monigeradio` を検索し、`.com` を選んで購入（$10.44/年程度、10年まで一括可）
4. 連絡先情報は **ASCII（英数字）で入力**（日本語不可）。住所は英語表記で
5. Whois 代行は Cloudflare が無料で自動適用されるため設定不要

購入すると Cloudflare のネームサーバーが自動で設定され、DNS ゾーンも同時に作られる。

### Step 2. DNS レコードを追加する

Cloudflare ダッシュボード > `monigeradio.com` > **DNS > Records** で以下を追加。

| Type | Name | Content | Proxy status |
|---|---|---|---|
| A | `@` | `185.199.108.153` | **DNS only（グレー雲）** |
| A | `@` | `185.199.109.153` | **DNS only** |
| A | `@` | `185.199.110.153` | **DNS only** |
| A | `@` | `185.199.111.153` | **DNS only** |
| AAAA | `@` | `2606:50c0:8000::153` | **DNS only** |
| AAAA | `@` | `2606:50c0:8001::153` | **DNS only** |
| AAAA | `@` | `2606:50c0:8002::153` | **DNS only** |
| AAAA | `@` | `2606:50c0:8003::153` | **DNS only** |
| CNAME | `www` | `ortransf.github.io` | **DNS only** |

> ### ⚠️ プロキシは必ず OFF（グレー雲）にする
>
> Cloudflare は既定でプロキシ（オレンジ雲）が ON になるが、**ON のままだと
> GitHub Pages の HTTPS 証明書が発行できない**。DNS 応答が Cloudflare の IP を返すため、
> GitHub が所有権を検証できずに失敗する。
>
> 一度証明書を発行した後にプロキシを ON に戻すことも可能だが、**証明書更新のたび
> （約3か月ごと）にグレー雲へ戻す必要がある**ため、常時 DNS only 運用を推奨する。
> GitHub Pages 自体が CDN 配信なので、速度面の不利はほぼない。

反映確認:

```powershell
nslookup monigeradio.com 1.1.1.1
```

### Step 3. GitHub 側にカスタムドメインを登録する

```powershell
gh api repos/ortransf/mounige-radio-site/pages -X PUT -f cname=monigeradio.com
```

Settings > Pages からでも設定できる。設定後、GitHub が DNS を検証して
Let's Encrypt の証明書を自動発行する（数分〜30分程度）。

発行が完了したら **Enforce HTTPS** にチェックを入れる:

```powershell
gh api repos/ortransf/mounige-radio-site/pages -X PUT -F https_enforced=true
```

> GitHub Actions でデプロイしている場合、`CNAME` ファイルは不要（作っても無視される）。
> リポジトリ設定側の値だけが使われる。

### Step 4. base パスを `/` に切り替える

```powershell
gh variable set BASE_PATH --body "/" --repo ortransf/mounige-radio-site
gh workflow run deploy.yml --repo ortransf/mounige-radio-site
```

### Step 5. 確認

- https://monigeradio.com/ が HTTPS で開く
- `/games/` と `/games/runner/` が開き、画像とゲームが正しく表示される
- https://www.monigeradio.com/ が apex にリダイレクトされる
- 旧URL https://ortransf.github.io/mounige-radio-site/ が新ドメインへリダイレクトされる

### Step 6. 後始末

- 番組の概要欄・SNS プロフィール・Spotify などのリンクを新URLへ差し替え
- OGP を実装する際は絶対URLを `https://monigeradio.com/` 基準にする

---

## トラブルシューティング

**証明書が発行されない / DNS check が進まない**
→ プロキシがオレンジ雲になっていないか確認する（最頻出の原因）。グレー雲に直したうえで、
GitHub 側のカスタムドメインを一度削除して再登録すると検証がやり直される。

**サイトは開くが画像やCSSが 404**
→ `BASE_PATH` の設定漏れ。`gh variable list --repo ortransf/mounige-radio-site` で確認し、
`/` が入っていなければ Step 4 を実行する。

**www で証明書エラー**
→ GitHub Pages の証明書は apex と www の両方を含むが、www の CNAME レコードが
無いと発行されない。Step 2 の CNAME 行を確認する。

---

## ロールバック

独自ドメインをやめて元に戻す場合:

```powershell
gh api repos/ortransf/mounige-radio-site/pages -X PUT -f cname=""
gh variable delete BASE_PATH --repo ortransf/mounige-radio-site
gh workflow run deploy.yml --repo ortransf/mounige-radio-site
```
