# My Fullcourse App

## 概要

Next.js App Router、TypeScript、Prisma (MySQL)、NextAuth.js を使用した、フルスタックのコース管理アプリケーションです。

## 必須環境

- Node.js (LTS 推奨)
- MySQL サーバー
- Git

## 1. 環境構築手順 (Initial Setup)

新しい端末で開発を始める際は、以下の手順を実行してください。

### 1-1. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下の変数を設定します。

**MySQL データベース接続情報**  
（ユーザー名、パスワード、DB名を適宜変更）
```env
DATABASE_URL="mysql://fullcourse_user:F7z+(6tN@localhost:3306/my_fullcourse_db"
```

**NextAuth.js 関連設定**  
認証トークンやセッション暗号化に使用される秘密鍵
```env
AUTH_SECRET="安全なランダム文字列"
```

アプリケーションが動作する URL
```env
NEXTAUTH_URL="http://localhost:3000"
```

### 1-2. 初期化スクリプトの配置と実行

プロジェクトルートに `setup.sh` を配置し、以下のコマンドで実行します。
```bash
# 1. スクリプトに実行権限を付与
chmod +x setup.sh

# 2. セットアップスクリプトを実行
./setup.sh
```

## 2. 開発サーバーの起動

Turbopack による不具合を避けるため、必ず `--webpack` フラグを付与して起動します。
```bash
# Webpack を強制して開発サーバーを起動
npm run dev -- --webpack
```

## 3. 認証機能の確認

サーバー起動後、以下の URL にアクセスして動作を確認します。

- **ログインページ**: http://localhost:3000/login
- **新規登録**: フォームからユーザー登録し、DB にデータが作成されることを確認
- **ログイン**: 登録ユーザーでログイン → トップページへリダイレクトされることを確認

## 4. 主な技術スタック

| 分類 | 使用技術 |
|------|----------|
| フレームワーク | Next.js (v16.x), React |
| 言語 | TypeScript |
| データベース | MySQL |
| ORM | Prisma |
| 認証 | NextAuth.js (Credentials Provider) |
| スタイル | Tailwind CSS |

## 5. データベース操作

Prisma に関連する主要コマンドです。

### マイグレーションの実行（スキーマ変更時）
```bash
npx dotenv -c -- prisma migrate dev --name <変更内容を示す名前>
```

### Prisma Studio の起動（GUI でデータ確認）
```bash
npx dotenv -c -- prisma studio
```
