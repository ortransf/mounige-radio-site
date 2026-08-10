# デプロイと独自ドメイン設定

## 現在の構成

| 項目 | 内容 |
|---|---|
| ホスティング | GitHub Pages（GitHub Actions からデプロイ） |
| リポジトリ | https://github.com/ortransf/mounige-radio-site |
| 公開URL | https://ortransf.github.io/mounige-radio-site/ |
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

## 独自ドメインへの移行手順（GCP でドメインを取得する場合）

ドメイン名を `example.com` として書く。実際の名前に読み替えること。

### 1. GCP でドメインを取得する

```powershell
# 空きと価格を確認
gcloud domains registrations search-domains example.com

# Cloud DNS ゾーンを同時に作って登録（対話式で連絡先情報を入力）
gcloud domains registrations register example.com --project=site-340803
```

登録時に「Cloud DNS ゾーンを作る」を選ぶとゾーンが自動生成される。
既存ゾーンを使う場合や手動で作る場合:

```powershell
gcloud dns managed-zones create mounige `
  --dns-name=example.com `
  --description="もう逃げラジオ" `
  --project=site-340803
```

### 2. DNS レコードを設定する

**Apex ドメイン（example.com）で公開する場合** — A と AAAA を各4本ずつ:

```powershell
gcloud dns record-sets create example.com. --zone=mounige --type=A --ttl=3600 `
  --rrdatas=185.199.108.153,185.199.109.153,185.199.110.153,185.199.111.153 `
  --project=site-340803

gcloud dns record-sets create example.com. --zone=mounige --type=AAAA --ttl=3600 `
  --rrdatas=2606:50c0:8000::153,2606:50c0:8001::153,2606:50c0:8002::153,2606:50c0:8003::153 `
  --project=site-340803

# www でもアクセスできるようにする（任意だが推奨）
gcloud dns record-sets create www.example.com. --zone=mounige --type=CNAME --ttl=3600 `
  --rrdatas=ortransf.github.io. --project=site-340803
```

**www サブドメイン（www.example.com）を本番にする場合** — CNAME 1本でよい:

```powershell
gcloud dns record-sets create www.example.com. --zone=mounige --type=CNAME --ttl=3600 `
  --rrdatas=ortransf.github.io. --project=site-340803
```

> IP は GitHub Pages 共通のもの。変更されることがあるので、うまくいかない時は
> GitHub 公式ドキュメント「Managing a custom domain for your GitHub Pages site」で最新値を確認する。

反映確認:

```powershell
nslookup example.com 8.8.8.8
```

### 3. GitHub 側でカスタムドメインを設定する

```powershell
gh api repos/ortransf/mounige-radio-site/pages -X PUT -f cname=example.com
```

Settings > Pages からでも設定できる。設定後、GitHub が DNS を検証し
Let's Encrypt の証明書を自動発行する（数分〜30分程度）。完了したら
**Enforce HTTPS** にチェックを入れる。

> GitHub Actions でデプロイしている場合、`CNAME` ファイルは不要（作っても無視される）。
> リポジトリ設定側の値だけが使われる。

### 4. base パスを `/` に切り替える

```powershell
gh variable set BASE_PATH --body "/" --repo ortransf/mounige-radio-site

# 再ビルド・再デプロイ（空コミット or 手動実行）
gh workflow run deploy.yml --repo ortransf/mounige-radio-site
```

### 5. 確認

- https://example.com/ が開く（HTTPS で鍵マークが出る）
- /games/ と /games/runner/ が開き、画像とゲームが正しく表示される
- 旧URL https://ortransf.github.io/mounige-radio-site/ は新ドメインへ自動リダイレクトされる

### 6. 後始末

- [src/site/main.ts](src/site/main.ts) の OGP や meta に絶対URLを使う場合は新ドメインへ更新
- 番組の概要欄・SNS プロフィールのリンクを新URLに差し替え

---

## ロールバック

独自ドメインをやめて元に戻す場合:

```powershell
gh api repos/ortransf/mounige-radio-site/pages -X PUT -f cname=""
gh variable delete BASE_PATH --repo ortransf/mounige-radio-site
gh workflow run deploy.yml --repo ortransf/mounige-radio-site
```
