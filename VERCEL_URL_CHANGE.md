# VercelのURLを変更する方法（無料）

## 🆓 方法1: プロジェクト名を変更（完全無料・即座に反映）

Vercelのプロジェクト名を変更すると、URLも自動で変わります。

### 手順

1. **Vercelダッシュボード**にログイン
2. プロジェクトを選択
3. **Settings** → **General** を開く
4. **Project Name** を変更
   - 例: `double-dice-poker` → `dice-poker-game`
5. **Save** をクリック

### 結果

- **変更前**: `https://double-dice-poker.vercel.app`
- **変更後**: `https://dice-poker-game.vercel.app`

**注意**: 
- プロジェクト名は英数字とハイフン（`-`）のみ使用可能
- 既存のURLは自動でリダイレクトされます（古いURLも動作します）

---

## 🌐 方法2: 無料ドメインを取得（完全無料）

カスタムドメインを使いたい場合、**無料でドメインを取得**できます。

### 無料ドメインサービス

#### 1. **Freenom**（完全無料・推奨）

**取得可能なドメイン**:
- `.tk` (Tokelau)
- `.ml` (Mali)
- `.ga` (Gabon)
- `.cf` (Central African Republic)
- `.gq` (Equatorial Guinea)

**手順**:
1. [freenom.com](https://www.freenom.com/)にアクセス
2. アカウント作成（無料）
3. 希望のドメイン名を検索
4. 「Get it now!」→ 期間を選択（最大12ヶ月）
5. 無料で取得完了！

**注意**: 
- 1年ごとに更新が必要（無料）
- 一部のドメインは人気が高く取得できない場合あり

#### 2. **Namecheap**（安価・年額$1程度）

**安いドメイン**:
- `.xyz` - 年額約$1
- `.site` - 年額約$3
- `.online` - 年額約$3

**手順**:
1. [namecheap.com](https://www.namecheap.com/)でアカウント作成
2. ドメインを検索
3. カートに追加して購入

---

## 🔧 無料ドメインをVercelに設定

### 1. Freenomでドメインを取得した場合

#### DNS設定（Freenom側）

1. Freenomにログイン
2. **Services** → **My Domains** を開く
3. ドメインを選択 → **Manage Domain** → **Management Tools** → **Nameservers**
4. **Use custom nameservers** を選択
5. Vercelが提供するNameserverを設定:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

#### Vercel側の設定

1. Vercelダッシュボード → プロジェクト → **Settings** → **Domains**
2. ドメイン名を入力（例: `yourgame.tk`）
3. **Add** をクリック
4. 数分〜数時間で反映されます

---

## 📝 推奨手順（無料でカスタムドメイン）

### 最速（5分で完了）

1. **Freenomでドメイン取得**（例: `dicepoker.tk`）
2. **Vercelでプロジェクト名を変更**（任意）
3. **Vercelにドメインを追加**
4. **FreenomでNameserverを設定**

### 結果

- ✅ 完全無料
- ✅ カスタムドメイン（`https://dicepoker.tk`）
- ✅ VercelのURLは使わなくてもOK

---

## ⚠️ 注意点

### 無料ドメインの制限

- **Freenom**: 
  - 1年ごとに更新が必要
  - 人気ドメインは取得できない場合あり
  - 一部のブラウザで警告が出る場合あり（稀）

- **有料ドメインのメリット**:
  - より信頼性が高い
  - ブラウザ警告なし
  - 長期的に安定

### プロジェクト名の変更

- 変更後も古いURLはリダイレクトされます
- チームメンバーに新しいURLを共有する必要があります

---

## 🎯 まとめ

| 方法 | 費用 | 時間 | 推奨度 |
|------|------|------|--------|
| プロジェクト名変更 | 無料 | 即座 | ⭐⭐⭐ |
| Freenom無料ドメイン | 無料 | 5-10分 | ⭐⭐⭐⭐ |
| 有料ドメイン | $1-12/年 | 5-10分 | ⭐⭐⭐⭐⭐ |

**結論**: 
- **今すぐ変更したい** → プロジェクト名を変更
- **カスタムドメインが欲しい** → Freenomで無料ドメイン取得

どちらも**完全無料**でできます！
