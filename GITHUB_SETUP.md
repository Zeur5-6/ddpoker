# GitHubへのプッシュ手順

## 1. GitHubでリポジトリを作成

1. [github.com](https://github.com)にログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例: `double-dice-poker`）
4. 「Public」または「Private」を選択
5. 「Create repository」をクリック

## 2. ローカルリポジトリをGitHubに接続

PowerShellで以下を実行：

```powershell
# リポジトリディレクトリに移動
cd "c:\Users\user\Downloads\sousaku\something\double-dice-poker"

# GitHubリポジトリのURLを追加（YOUR_USERNAMEとYOUR_REPO_NAMEを置き換え）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# メインブランチを設定
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

## 3. GitHub認証

初回プッシュ時は認証が必要です：

- **Personal Access Token**を使用（推奨）
  1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. 「Generate new token」をクリック
  3. `repo`権限を選択
  4. トークンをコピー
  5. パスワード入力時にトークンを貼り付け

または

- **GitHub CLI**を使用
  ```powershell
  winget install GitHub.cli
  gh auth login
  ```

## 4. Vercelでデプロイ

1. [vercel.com](https://vercel.com)にログイン（GitHubアカウントで）
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. 設定を確認（自動検出される）：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 「Deploy」をクリック
6. 数分でデプロイ完了！

## 5. カスタムドメイン（オプション）

Vercelのプロジェクト設定からカスタムドメインを追加できます。
