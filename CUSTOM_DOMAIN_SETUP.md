# カスタムドメイン設定ガイド - ddpoker.app

## 🎯 目標
現在のURL: `https://ddpoker-isactr7lv-zeurs-projects.vercel.app/`  
希望するURL: `https://ddpoker.app`

---

## 💰 方法1: `.app`ドメインを購入（推奨）

`.app`ドメインはGoogleが管理する有料ドメインです。

### 手順

#### 1. ドメインを購入

**推奨サービス**:
- **Google Domains** (現在はSquarespaceに移行中)
- **Namecheap**: 年額約$20-30
- **GoDaddy**: 年額約$20-30
- **Cloudflare Registrar**: 年額約$20（最も安い）

**Cloudflareでの購入手順**:
1. [Cloudflare](https://www.cloudflare.com/)でアカウント作成（無料）
2. **Domains** → **Register Domains** をクリック
3. `ddpoker.app` を検索
4. カートに追加して購入（年額約$20）

#### 2. Vercelにドメインを追加

1. **Vercelダッシュボード** → プロジェクトを選択
2. **Settings** → **Domains** を開く
3. `ddpoker.app` を入力
4. **Add** をクリック

#### 3. DNS設定（Cloudflareの場合）

Vercelが提供するDNSレコードを設定:

1. **Cloudflareダッシュボード** → ドメインを選択
2. **DNS** → **Records** を開く
3. Vercelが表示するDNSレコードを追加:
   - **Type**: `A`
   - **Name**: `@` (または `ddpoker.app`)
   - **Content**: Vercelが提供するIPアドレス
   - **Proxy status**: DNS only（オレンジの雲をオフ）

または、**Nameserver**を変更:
- Vercelが提供するNameserverに変更:
  ```
  ns1.vercel-dns.com
  ns2.vercel-dns.com
  ```

#### 4. 反映を待つ

- 通常: **数分〜数時間**
- 最大: **24-48時間**

---

## 🆓 方法2: 無料ドメインで短いURL（完全無料）

`.app`ドメインは有料ですが、無料ドメインで短いURLにできます。

### 無料ドメインサービス

#### **Freenom**（完全無料・推奨）

**取得可能なドメイン**:
- `ddpoker.tk`
- `ddpoker.ml`
- `ddpoker.ga`
- `ddpoker.cf`

**手順**:
1. [freenom.com](https://www.freenom.com/)でアカウント作成
2. `ddpoker.tk` を検索
3. 「Get it now!」→ 期間を選択（最大12ヶ月）
4. 無料で取得完了

**Vercel設定**:
1. Vercelダッシュボード → **Settings** → **Domains**
2. `ddpoker.tk` を入力して追加
3. FreenomでNameserverを設定:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

**結果**: `https://ddpoker.tk` ✅

---

## ⚡ 方法3: プロジェクト名を変更（即座・無料）

`.app`ドメインは購入しなくても、プロジェクト名を変更してURLを短くできます。

### 手順

1. **Vercelダッシュボード** → プロジェクトを選択
2. **Settings** → **General** を開く
3. **Project Name** を `ddpoker` に変更
4. **Save** をクリック

**結果**: `https://ddpoker.vercel.app` ✅

**注意**: 
- まだ `vercel.app` が含まれます
- 完全にカスタムドメインにするには、方法1または2が必要

---

## 📊 比較表

| 方法 | 費用 | URL例 | 時間 | 推奨度 |
|------|------|-------|------|--------|
| `.app`ドメイン購入 | $20-30/年 | `ddpoker.app` | 5-10分 | ⭐⭐⭐⭐⭐ |
| 無料ドメイン（Freenom） | 無料 | `ddpoker.tk` | 5-10分 | ⭐⭐⭐⭐ |
| プロジェクト名変更 | 無料 | `ddpoker.vercel.app` | 即座 | ⭐⭐⭐ |

---

## 🎯 推奨手順

### 今すぐ短くしたい場合
1. **プロジェクト名を `ddpoker` に変更** → `ddpoker.vercel.app`
2. 後でカスタムドメインを追加

### 完全にカスタムドメインにしたい場合
1. **Cloudflareで `ddpoker.app` を購入**（年額$20）
2. **Vercelにドメインを追加**
3. **DNS設定を完了**

### 無料でカスタムドメインにしたい場合
1. **Freenomで `ddpoker.tk` を取得**（無料）
2. **Vercelにドメインを追加**
3. **Nameserverを設定**

---

## ⚠️ 注意点

### `.app`ドメインについて
- **HTTPS必須**: `.app`ドメインは自動でHTTPSが有効になります
- **年額費用**: $20-30/年が必要
- **信頼性**: 最も信頼性が高く、ブラウザ警告なし

### 無料ドメインについて
- **更新が必要**: 1年ごとに更新（無料）
- **ブラウザ警告**: 一部のブラウザで警告が出る場合あり（稀）
- **人気ドメイン**: `ddpoker.tk` が取得できない場合、別のTLDを試す

---

## 🔧 トラブルシューティング

### DNS設定が反映されない
- **最大48時間待つ**: DNSの反映には時間がかかります
- **DNSチェッカーで確認**: [whatsmydns.net](https://www.whatsmydns.net/)で確認
- **Vercelの設定を確認**: Domainsページでエラーがないか確認

### SSL証明書エラー
- `.app`ドメインは自動でHTTPSが有効になります
- 無料ドメインもVercelが自動でSSL証明書を発行します
- 反映まで数時間かかる場合があります

---

## 📝 まとめ

**最短でシンプルなURLにする方法**:
1. プロジェクト名を `ddpoker` に変更 → `ddpoker.vercel.app`
2. 後で `ddpoker.app` を購入して追加

**完全にカスタムドメインにする方法**:
1. Cloudflareで `ddpoker.app` を購入（$20/年）
2. Vercelに追加してDNS設定

**無料でカスタムドメインにする方法**:
1. Freenomで `ddpoker.tk` を取得（無料）
2. Vercelに追加してNameserver設定
