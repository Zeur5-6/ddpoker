# Vercelカスタムドメイン設定ガイド

## 🆓 無料でURLを変更する方法

### 方法1: プロジェクト名を変更（完全無料・即座）

Vercelのプロジェクト名を変更すると、URLも自動で変わります。

1. Vercelダッシュボード → プロジェクト → **Settings** → **General**
2. **Project Name** を変更
3. **Save** をクリック

**結果**: `https://新しい名前.vercel.app` に変更されます

詳細は `VERCEL_URL_CHANGE.md` を参照してください。

---

## 🌐 カスタムドメインの設定手順

### 1. ドメインを取得（まだの場合）

**無料ドメイン取得サービス**:
- [Freenom](https://www.freenom.com/) - 完全無料（.tk, .ml, .gaなど）⭐推奨
- [Namecheap](https://www.namecheap.com/) - 年額$1程度から
- [Google Domains](https://domains.google/) - 年額$12程度

**注意**: カスタムドメインを使わない場合、プロジェクト名を変更するだけでURLは変わります（無料）

### 2. Vercelでカスタムドメインを追加

1. Vercelダッシュボードでプロジェクトを開く
2. **Settings** → **Domains** をクリック
3. ドメイン名を入力（例: `yourdomain.com`）
4. **Add** をクリック

### 3. DNS設定（重要！）

Vercelが表示するDNSレコードを、ドメイン提供元のDNS設定に追加します。

#### パターンA: ルートドメイン（yourdomain.com）

**Vercelが表示するレコード**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**ドメイン提供元で設定**:
- Type: `A`
- Name: `@` または空白
- Value: `76.76.21.21`

#### パターンB: サブドメイン（www.yourdomain.com）

**Vercelが表示するレコード**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**ドメイン提供元で設定**:
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### 4. よくあるエラーと解決方法

#### エラー1: "Domain not found" / "DNS not configured"

**原因**: DNS設定がまだ反映されていない

**解決方法**:
1. DNS設定を確認（タイポがないか）
2. 最大48時間待つ（通常は数分〜数時間）
3. DNS伝播確認ツールで確認:
   - [whatsmydns.net](https://www.whatsmydns.net/)
   - [dnschecker.org](https://dnschecker.org/)

#### エラー2: "Invalid domain"

**原因**: ドメイン形式が正しくない

**解決方法**:
- `https://` や `http://` は不要
- `yourdomain.com` のように入力
- 末尾のスラッシュ `/` は不要

#### エラー3: "Domain already in use"

**原因**: 他のVercelプロジェクトで使用中

**解決方法**:
1. 他のプロジェクトから削除
2. または別のドメインを使用

#### エラー4: "SSL certificate error"

**原因**: SSL証明書の生成に時間がかかっている

**解決方法**:
- 数分〜数時間待つ（自動で生成される）
- 24時間経っても解決しない場合はVercelサポートに連絡

### 5. DNS設定の確認コマンド

PowerShellで確認:

```powershell
# Aレコード確認
nslookup yourdomain.com

# CNAMEレコード確認
nslookup www.yourdomain.com
```

### 6. 設定後の確認

1. **DNS伝播確認**: [whatsmydns.net](https://www.whatsmydns.net/)
2. **Vercelダッシュボード**: Settings → Domains で「Valid Configuration」と表示される
3. **ブラウザでアクセス**: `https://yourdomain.com` でサイトが表示される

### 7. 推奨設定

#### 両方設定（ルート + www）

1. `yourdomain.com` (Aレコード)
2. `www.yourdomain.com` (CNAME)

Vercelで両方を追加すると、自動でリダイレクトされます。

#### HTTPS強制

Vercelは自動でHTTPS証明書を発行します（Let's Encrypt）。

---

## 🔧 トラブルシューティング

### DNS設定が反映されない場合

1. **DNSキャッシュをクリア**:
   ```powershell
   ipconfig /flushdns
   ```

2. **別のDNSサーバーで確認**:
   - Google DNS: `8.8.8.8`
   - Cloudflare DNS: `1.1.1.1`

3. **ブラウザのキャッシュをクリア**:
   - Ctrl + Shift + Delete

### まだエラーが出る場合

1. **Vercelのログを確認**: Dashboard → Deployments → 最新デプロイのログ
2. **Vercelサポートに連絡**: [vercel.com/support](https://vercel.com/support)
3. **コミュニティフォーラム**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

## 📝 チェックリスト

- [ ] ドメインを取得
- [ ] Vercelでドメインを追加
- [ ] DNSレコードを設定（AまたはCNAME）
- [ ] DNS伝播を確認（最大48時間）
- [ ] Vercelダッシュボードで「Valid Configuration」を確認
- [ ] ブラウザで `https://yourdomain.com` にアクセスして確認

---

## 💡 ヒント

- **無料ドメイン**: Freenomで `.tk` ドメインを取得（完全無料）
- **安いドメイン**: Namecheapで `.xyz` ドメイン（年額$1程度）
- **DNS設定**: 通常は数分で反映されますが、最大48時間かかる場合があります
