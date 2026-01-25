# デプロイメント・収益化ガイド

## 🚀 Web公開（無料）

### 推奨プラットフォーム

#### 1. **Vercel**（最も簡単・推奨）
- **メリット**: 無料、自動デプロイ、高速CDN、カスタムドメイン対応
- **手順**:
  1. GitHubにリポジトリをプッシュ
  2. [vercel.com](https://vercel.com)でアカウント作成
  3. 「New Project」→ GitHubリポジトリを選択
  4. 自動でデプロイ完了（`npm run build`が自動実行）

#### 2. **Netlify**
- **メリット**: 無料、フォーム機能、サーバーレス関数
- **手順**: Vercelと同様

#### 3. **GitHub Pages**
- **メリット**: 完全無料、GitHubと統合
- **注意**: 静的サイトのみ、カスタムドメインは有料

### デプロイ前の準備

```bash
# 1. ビルド確認
npm run build

# 2. プレビュー確認
npm run preview
```

---

## 📱 スマホアプリ化

### 方法1: **Capacitor**（推奨・Reactアプリをそのまま使える）

#### セットアップ
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init
```

#### ビルド
```bash
npm run build
npx cap sync
npx cap open ios    # iOS開発
npx cap open android # Android開発
```

**メリット**:
- 既存のReactコードをそのまま使用可能
- iOS/Android両対応
- ネイティブ機能（カメラ、通知など）も使える

### 方法2: **PWA（Progressive Web App）**
- アプリストア不要でインストール可能
- オフライン対応可能
- 実装が簡単

---

## 💰 広告収益化

### Web版: **Google AdSense**
1. [Google AdSense](https://www.google.com/adsense/)でアカウント作成
2. サイトを登録・審査通過
3. 広告コードを`index.html`に追加

### アプリ版: **Google AdMob**
1. [Google AdMob](https://admob.google.com/)でアカウント作成
2. Capacitorプラグインをインストール:
   ```bash
   npm install @capacitor-community/admob
   ```
3. バナー広告・インタースティシャル広告を実装

### 広告配置の推奨箇所
- **バナー広告**: ゲーム画面下部
- **インタースティシャル**: ラウンド終了時、ゲームオーバー時
- **リワード広告**: チップ追加、AP回復など（オプション）

---

## 📊 収益化のコツ

1. **ユーザー体験を優先**
   - 広告は控えめに（ゲーム体験を損なわない）
   - スキップ可能な広告を推奨

2. **複数の収益源**
   - 広告 + オプション課金（広告削除、追加チップなど）

3. **分析ツール**
   - Google Analytics導入
   - ユーザー行動を分析して改善

---

## 🔧 実装の優先順位

### Phase 1: Web公開（最速）
1. Vercelでデプロイ
2. カスタムドメイン設定（オプション）
3. Google AdSense審査申請

### Phase 2: モバイル最適化
1. レスポンシブデザイン確認
2. タッチ操作の最適化
3. PWA対応

### Phase 3: アプリ化
1. Capacitorセットアップ
2. アプリストア申請（Google Play / App Store）
3. AdMob統合

---

## 📝 必要な準備

- [ ] プライバシーポリシーページ（広告必須）
- [ ] 利用規約ページ
- [ ] アイコン・ロゴ（アプリ用）
- [ ] スクリーンショット（アプリストア用）
- [ ] 説明文（アプリストア用）

---

## 🎯 次のステップ

1. **今すぐ**: VercelでWeb公開
2. **1週間後**: AdSense審査申請
3. **2週間後**: モバイル最適化
4. **1ヶ月後**: アプリ化検討
