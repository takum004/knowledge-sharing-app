# Bloggr - ナレッジ共有プラットフォーム

React TypeScriptで構築されたモダンなナレッジ共有プラットフォームです。

## 機能

- 記事の閲覧・検索
- 管理者による記事の作成・編集・削除
- ユーザー権限管理
- レスポンシブデザイン

## 認証システム

このアプリケーションは環境変数ベースの簡易認証システムを使用しています。

### 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下の設定を追加してください：

```env
# 管理者認証設定
REACT_APP_ADMIN_PASSWORD=admin123

# 開発用：管理者モードを強制（true/false）
# trueに設定すると、ログイン画面をスキップして常に管理者として認証されます
REACT_APP_FORCE_ADMIN_MODE=false
```

### ユーザー権限

- **管理者**: 記事の作成・編集・削除、ダッシュボードへのアクセス
- **ゲスト**: 記事の閲覧・検索・ブックマーク

### ログイン方法

1. **管理者ログイン**: 設定したパスワードを入力
2. **ゲストログイン**: パスワード不要で「ゲストとして閲覧」ボタンをクリック

### 開発用設定

開発時に毎回ログインするのが面倒な場合は、`.env` ファイルで以下を設定：

```env
REACT_APP_FORCE_ADMIN_MODE=true
```

これにより、アプリケーション起動時に自動的に管理者として認証されます。

## セットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数ファイルの作成
cp .env.example .env
# または手動で .env ファイルを作成し、上記の設定を追加

# 開発サーバーの起動
npm start
```

## 本番環境での注意事項

本番環境では以下の点にご注意ください：

1. **強力なパスワード**: `REACT_APP_ADMIN_PASSWORD` には推測困難なパスワードを設定
2. **強制管理者モード**: `REACT_APP_FORCE_ADMIN_MODE=false` に設定
3. **HTTPS**: 本番環境では必ずHTTPSを使用

## 技術スタック

- React 18
- TypeScript
- Tailwind CSS
- React Hooks (useState, useEffect)

## ディレクトリ構造

```
src/
├── components/     # 再利用可能なコンポーネント
├── pages/         # ページコンポーネント
├── hooks/         # カスタムフック
└── App.tsx        # メインアプリケーション
```

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
